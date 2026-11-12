import test from 'node:test';
import assert from 'node:assert/strict';
import { act, createGame, loadGame, saveGame } from '../public/game/engine.js';
import { attributePointsAvailable, effectiveAttributes, effectiveLevel } from '../public/game/attributes.js';
import { heroStats, statsView } from '../public/game/hero-stats.js';
import { itemById } from '../public/game/items.js';
import { dungeonMonsterLoot, merchantStock, sellPrice } from '../public/game/treasure.js';
import { TOWNS } from '../public/game/content.js';
import { merchantFor, merchantStockFor } from '../public/game/merchant-catalog.js';
import { atTownPlace } from './town-fixture.js';

function battle(overrides = {}) {
  const hero = createGame();
  return { ...hero, mode: 'battle', returnMode: 'world', enemy: {
    name: 'Test foe', speciesId: 'test-foe', hp: 150, maxHp: 150, level: 2,
    kind: 'brute', attack: 50, gold: 0, xp: 0, armor: 0, ...overrides,
  } };
}

test('new and legacy saves expose allocatable scores through inventory and persist spending', () => {
  const fresh = createGame();
  assert.equal(fresh.attributes.constitution, 10);
  assert.equal(attributePointsAvailable(fresh), 0);
  const old = { ...fresh, level: 4, maxHp: 122 };
  delete old.attributes;
  delete old.attributePointsSpent;
  delete old.attributeBuffs;
  let restored = loadGame(JSON.stringify(old));
  assert.equal(attributePointsAvailable(restored), 6);
  assert.match(statsView(restored), /6 attribute points available/);
  assert.match(statsView(restored), /Increase Constitution/);
  restored = act(restored, { type: 'allocateAttribute', attribute: 'constitution' });
  assert.equal(restored.attributes.constitution, 11);
  assert.equal(restored.maxHp, 124);
  assert.equal(restored.hp, 80);
  restored = loadGame(saveGame(restored));
  assert.equal(attributePointsAvailable(restored), 5);
  assert.equal(restored.maxHp, 124);
  assert.throws(() => loadGame(saveGame({ ...restored, attributes: { luck: 100 } })), /Invalid attribute/);
});

test('equipped armor and attribute consumables affect health and survive clock/save transitions', () => {
  const potion = 'rare-constitution-potion';
  const scroll = 'legendary-constitution-scroll';
  const armor = 'epic-armor-1';
  let hero = createGame();
  hero.level = 8;
  hero.maxHp += 7 * 14;
  const baseHp = hero.maxHp;
  hero.bag.push(potion, scroll, armor);
  assert.equal(itemById(armor, hero).attributeBonuses.constitution, 2);
  assert.equal(itemById(scroll, hero).name, 'Scroll of Lasting Constitution');
  hero = act(hero, { type: 'equip', id: armor });
  assert.equal(hero.maxHp, baseHp + 4);
  hero = act(hero, { type: 'useItem', id: potion });
  assert.equal(hero.bag.includes(potion), false);
  assert.equal(effectiveAttributes(hero, itemById).constitution, 16);
  assert.equal(hero.maxHp, baseHp + 12);
  hero = loadGame(saveGame(hero));
  hero = act(hero, { type: 'useItem', id: scroll });
  assert.equal(hero.bag.includes(scroll), false);
  assert.equal(hero.attributes.constitution, 12);
  assert.equal(hero.maxHp, baseHp + 16);
  hero = act(hero, { type: 'clockTick', elapsedMs: 30 * 60_000 / 48 });
  assert.equal(effectiveAttributes(hero, itemById).constitution, 14);
  assert.equal(hero.maxHp, baseHp + 8);
  hero = act(hero, { type: 'unequip', slot: 'armor' });
  assert.equal(hero.maxHp, baseHp + 4);
  assert.equal(attributePointsAvailable(hero), 14);
});

test('a cemetery vampire drains a level after a failed Constitution save and the game clock restores it', () => {
  const base = battle({ name: 'Ledger Crypt Vampire', speciesId: 'depth-0-crypt-vampire', kind: 'swift' });
  base.returnMode = 'dungeon';
  base.dungeon = { index: 0, floor: 6, x: 1, y: 1, dir: 0 };
  base.level = 4;
  base.hp = base.maxHp = 122;
  base.rng = 0;
  const drained = act(base, { type: 'guard' });
  assert.equal(effectiveLevel(drained), 3);
  assert.equal(drained.level, 4);
  assert.equal(drained.maxHp, 108);
  assert.match(drained.log.at(-1), /drains one level/);
  const saved = loadGame(saveGame(drained));
  assert.equal(effectiveLevel(saved), 3);
  const recovered = act(saved, { type: 'clockTick', elapsedMs: 30 * 60_000 / 48 });
  assert.equal(effectiveLevel(recovered), 4);
  assert.equal(recovered.maxHp, 122);

  const elsewhere = act({ ...base, dungeon: { ...base.dungeon, index: 2 } }, { type: 'guard' });
  assert.equal(effectiveLevel(elsewhere), 4);
  const resistant = act({ ...base, attributes: { ...base.attributes, constitution: 50 } }, { type: 'guard' });
  assert.equal(effectiveLevel(resistant), 4);
  assert.match(resistant.log.at(-1), /Constitution save/);
});

test('attributes change the same weapon and spell damage that combat reports', () => {
  const base = battle();
  base.bag.push('scroll-magic-missile');
  const strong = { ...base, attributes: { ...base.attributes, strength: 18, intelligence: 20 } };
  assert.equal(heroStats(strong).damage[0] - heroStats(base).damage[0], 4);
  const plainEvents = [];
  const enhancedEvents = [];
  act(base, { type: 'attack' }, plainEvents);
  act(strong, { type: 'attack' }, enhancedEvents);
  assert.equal(enhancedEvents[0].amount - plainEvents[0].amount, 4);
  act(base, { type: 'useItem', id: 'scroll-magic-missile' }, plainEvents);
  act(strong, { type: 'useItem', id: 'scroll-magic-missile' }, enhancedEvents);
  assert.equal(enhancedEvents.find(event => event.spell === 'magic-missile').amount
    - plainEvents.find(event => event.spell === 'magic-missile').amount, 5);
});

test('Wisdom resists magic and Constitution resists fire, frost, and poison damage', () => {
  const hit = hero => {
    const events = [];
    act(hero, { type: 'guard' }, events);
    return events.find(event => event.target === 'hero').amount;
  };
  const magic = battle({ kind: 'caster' });
  const wise = { ...magic, attributes: { ...magic.attributes, wisdom: 30 } };
  assert.ok(hit(wise) < hit(magic));
  for (const element of ['fire', 'frost', 'poison']) {
    const base = battle({ element });
    const hardy = { ...base, attributes: { ...base.attributes, constitution: 30 } };
    assert.ok(hit(hardy) < hit(base), element);
  }
});

test('Charisma changes both merchant purchase and sale transactions', () => {
  const town = TOWNS.find(town => town.id === 'mothbridge');
  const hero = atTownPlace({ ...createGame(), mode: 'town', location: town.id, x: town.x, y: town.y, gold: 1000 }, 'shop');
  hero.attributes.charisma = 50;
  const stock = merchantStockFor(merchantFor(town.id), merchantStock(hero.region, hero.location, hero.level), id => itemById(id, hero));
  const itemId = stock.find(id => itemById(id, hero).value >= 50);
  const item = itemById(itemId, hero);
  const bought = act(hero, { type: 'buyItem', id: itemId });
  assert.equal(hero.gold - bought.gold, Math.ceil(item.value * 80 / 100));
  const sold = act(bought, { type: 'sellItem', id: itemId });
  assert.equal(sold.gold - bought.gold, Math.floor(sellPrice(item) * 120 / 100));
  assert.equal(hero.gold - act(atTownPlace(hero, 'inn'), { type: 'buy', item: 'food' }).gold, 8);
});

test('rare and legendary attribute consumables can drop through the dungeon loot table', () => {
  const hero = { ...createGame(), region: 2, level: 20, dungeon: { index: 4, floor: 12 } };
  for (const rarityRoll of [0.7, 0.99]) {
    const effects = new Set(Array.from({ length: 1500 }, (_, index) => {
      const id = dungeonMonsterLoot(hero, rarityRoll, index / 1500);
      const item = itemById(id, hero);
      return item?.attributeEffect ? item.kind : null;
    }).filter(Boolean));
    assert.deepEqual(effects, new Set(['scroll', 'potion']));
  }
});
