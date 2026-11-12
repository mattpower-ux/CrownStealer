import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTRIBUTE_NAMES, allocateAttribute, applyAttributeItem, applyLevelDrain,
  attributeBenefits, attributeBuffMinutesLeft, attributeBuyPrice,
  attributePointsAvailable, attributeSave, attributeSellPrice, effectiveAttributes,
  effectiveLevel, expireAttributeEffects, levelDrainMinutesLeft, prepareAttributes,
  syncAttributeHealth, validateAttributeState,
} from '../public/game/attributes.js';

const minute = 60_000;
const state = (level = 1) => ({ level, worldTimeMs: 8 * 60 * minute, maxHp: 80 + (level - 1) * 14, hp: 70 });
const consumable = (attribute, amount, rarity = 'rare', durationMinutes = 30) => ({
  kind: rarity === 'rare' ? 'scroll' : 'potion',
  rarity,
  attributeEffect: { attribute, amount, durationMinutes },
});

test('heroes start with six scores of 10 and earn two flexible points per level', () => {
  const hero = prepareAttributes(state());
  assert.deepEqual(ATTRIBUTE_NAMES, ['wisdom', 'charisma', 'constitution', 'strength', 'dexterity', 'intelligence']);
  assert.deepEqual(Object.values(hero.attributes), Array(6).fill(10));
  assert.equal(attributePointsAvailable(hero), 0);
  assert.equal(allocateAttribute(hero, 'strength'), false);

  hero.level = 3;
  assert.equal(attributePointsAvailable(hero), 4);
  assert.equal(allocateAttribute(hero, 'strength'), true);
  assert.equal(allocateAttribute(hero, 'strength'), true);
  assert.equal(allocateAttribute(hero, 'constitution'), true);
  assert.equal(allocateAttribute(hero, 'unknown'), false);
  assert.equal(hero.attributes.strength, 12);
  assert.equal(hero.attributes.constitution, 11);
  assert.equal(attributePointsAvailable(hero), 1);
});

test('existing heroes retain earned points and partially migrated scores across save reloads', () => {
  const hero = { ...state(4), attributes: { wisdom: 12, intelligence: 11 } };
  validateAttributeState(hero);
  prepareAttributes(hero);
  assert.deepEqual(hero.attributes, { wisdom: 12, charisma: 10, constitution: 10, strength: 10, dexterity: 10, intelligence: 11 });
  assert.equal(attributePointsAvailable(hero), 3);
  assert.equal(applyAttributeItem(hero, consumable('charisma', 2, 'legendary')), 2);

  const restored = JSON.parse(JSON.stringify(hero));
  validateAttributeState(restored);
  prepareAttributes(restored);
  assert.equal(attributePointsAvailable(restored), 3);
  assert.equal(restored.attributes.charisma, 12);
  assert.equal(attributePointsAvailable(prepareAttributes(state(4))), 6);
});

test('attribute saves reject invalid scores, allocations and timed state', () => {
  const hero = state(4);
  const badFields = [
    { attributes: null }, { attributes: [] }, { attributes: { wisdom: 51 } },
    { attributes: { dexterity: 9 } }, { attributes: { strength: 10.5 } },
    { attributes: { luck: 14 } }, { attributePointsSpent: 7 },
    { attributePointsSpent: 2, attributes: { wisdom: 11 } },
    { attributeBuffs: [] }, { attributeBuffs: { strength: { amount: 2, expiresAt: '1000' } } },
    { attributeBuffs: { strength: { amount: 0, expiresAt: 1000 } } },
    { attributeBuffs: { luck: { amount: 2, expiresAt: 1000 } } },
    { levelDrain: { levels: 4, expiresAt: 1000 } }, { levelDrain: { levels: 1, expiresAt: -1 } },
    { attributeHealthAdjustment: 81 }, { attributeHealthAdjustment: -43 },
  ];
  for (const fields of badFields) {
    assert.throws(() => validateAttributeState({ ...hero, ...fields }), /Invalid attribute|Invalid level drain/);
  }
});

test('gear and rare consumables raise effective scores up to 50 and expire in game time', () => {
  const ring = { attributeBonuses: { dexterity: 3, strength: 5 } };
  const armor = { attributeBonuses: { constitution: 4, strength: 2 } };
  const items = id => ({ ring, armor })[id];
  const hero = prepareAttributes({ ...state(22), equippedRing: 'ring', equippedRing2: 'ring', equippedArmor: 'armor', bag: ['ring', 'ring', 'armor', 'spare'] });
  for (let count = 0; count < 39; count++) assert.equal(allocateAttribute(hero, 'strength'), true);
  assert.equal(effectiveAttributes(hero, items).strength, 50);
  assert.equal(effectiveAttributes(hero, items).dexterity, 16);
  assert.equal(effectiveAttributes(hero, items).constitution, 14);

  assert.equal(applyAttributeItem(hero, consumable('wisdom', 4)), 4);
  hero.worldTimeMs += 20 * minute;
  assert.equal(applyAttributeItem(hero, consumable('wisdom', 4)), 4);
  assert.equal(attributeBuffMinutesLeft(hero, 'wisdom'), 30);
  assert.equal(effectiveAttributes(hero, items).wisdom, 14);
  hero.worldTimeMs += 30 * minute;
  assert.equal(effectiveAttributes(hero, items).wisdom, 10);
  expireAttributeEffects(hero);
  assert.deepEqual(hero.attributeBuffs, {});

  assert.equal(applyAttributeItem(hero, consumable('strength', 4, 'legendary')), 1);
  assert.equal(allocateAttribute(hero, 'strength'), false);
  assert.equal(applyAttributeItem(hero, consumable('strength', 4, 'legendary')), 0);
  assert.equal(applyAttributeItem(hero, consumable('strength', 4)), 0);
  assert.equal(attributePointsAvailable(hero), 3);
  hero.worldTimeMs += 100 * minute;
  assert.equal(hero.attributes.strength, 50);
  assert.equal(applyAttributeItem(hero, consumable('intelligence', 4, 'common')), 0);
  assert.equal(applyAttributeItem(hero, consumable('intelligence', 4, 'rare', 0)), 0);
});

test('a Constitution save succeeds on a roll strictly below the effective score', () => {
  const hero = state();
  assert.equal(attributeSave(hero, 'constitution', () => 0), true);
  assert.equal(attributeSave(hero, 'constitution', () => 0.08), true);
  assert.equal(attributeSave(hero, 'constitution', () => 0.09), false);
  assert.equal(attributeSave(hero, 'constitution', () => 0.999), false);

  const armor = () => ({ attributeBonuses: { constitution: 4 } });
  hero.equippedArmor = 'armor';
  assert.equal(attributeSave(hero, 'constitution', () => 0.09, armor), true);
  assert.equal(attributeSave(hero, 'constitution', () => 0.13, armor), false);
});

test('vampire drain suppresses effective level and health until the clock expires', () => {
  const hero = { ...state(4), xp: 20, hp: 122 };
  assert.equal(applyLevelDrain(hero, 1, 15), 1);
  assert.equal(effectiveLevel(hero), 3);
  syncAttributeHealth(hero);
  assert.equal(hero.maxHp, 108);
  assert.equal(hero.hp, 108);
  assert.equal(applyLevelDrain(hero, 4, 10), 2);
  assert.equal(effectiveLevel(hero), 1);
  assert.equal(levelDrainMinutesLeft(hero), 15);
  assert.equal(hero.level, 4);
  assert.equal(hero.xp, 20);
  assert.equal(attributePointsAvailable(hero), 6);
  syncAttributeHealth(hero);
  assert.equal(hero.maxHp, 80);

  hero.worldTimeMs += 15 * minute;
  assert.equal(effectiveLevel(hero), 4);
  expireAttributeEffects(hero);
  syncAttributeHealth(hero);
  assert.equal(hero.maxHp, 122);
  assert.equal(hero.hp, 80);
  assert.equal(hero.levelDrain, undefined);
  assert.equal(applyLevelDrain(state(), 1, 15), 0);
});

test('health recalculation preserves earned growth through gear swaps and capped level drains', () => {
  const hero = state(2);
  const items = () => ({ attributeBonuses: { constitution: 5 } });
  hero.equippedNecklace = 'necklace';
  syncAttributeHealth(hero, items);
  assert.equal(hero.maxHp, 104);
  assert.equal(hero.hp, 70);
  hero.level++;
  hero.maxHp += 14;
  syncAttributeHealth(hero, items);
  assert.equal(hero.maxHp, 118);
  delete hero.equippedNecklace;
  syncAttributeHealth(hero, items);
  assert.equal(hero.maxHp, 108);
  assert.equal(hero.hp, 70);

  const lowHealth = { ...state(3), maxHp: 5, hp: 5 };
  applyLevelDrain(lowHealth, 2, 1);
  syncAttributeHealth(lowHealth);
  assert.equal(lowHealth.maxHp, 1);
  lowHealth.worldTimeMs += minute;
  syncAttributeHealth(lowHealth);
  assert.equal(lowHealth.maxHp, 5);
  assert.equal(lowHealth.hp, 1);
});

test('combat and merchant benefits preserve the score-10 baseline and follow their attributes', () => {
  const hero = state(30);
  assert.deepEqual(attributeBenefits(hero), {
    meleeDamage: 0, magicDamage: 0, maxHp: 0, accuracy: 0, evasion: 0,
    magicResistance: 0, elementalResistance: 0, merchantDiscount: 0,
  });
  assert.equal(attributeBuyPrice(hero, 123), 123);
  assert.equal(attributeSellPrice(hero, 99), 99);

  hero.attributes = { strength: 18, intelligence: 20, constitution: 20, wisdom: 25, dexterity: 18, charisma: 30 };
  assert.deepEqual(attributeBenefits(hero), {
    meleeDamage: 4, magicDamage: 5, maxHp: 20, accuracy: 8, evasion: 0.04,
    magicResistance: 0.15, elementalResistance: 0.10, merchantDiscount: 0.10,
  });
  assert.equal(attributeBuyPrice(hero, 123), 111);
  assert.equal(attributeSellPrice(hero, 99), 108);
  assert.equal(attributeBuyPrice(hero, 0), 0);
  assert.equal(attributeSellPrice(hero, 0), 0);
});
