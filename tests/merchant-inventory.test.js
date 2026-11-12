import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, loadGame, saveGame } from '../public/game/engine.js';
import { merchantFor } from '../public/game/merchant-catalog.js';
import { stockForMerchant } from '../public/game/merchant-inventory.js';
import { merchantItemRemaining, recordMerchantPurchase } from '../public/game/merchant-supplies.js';
import { TREASURE_ITEMS } from '../public/game/treasure.js';
import { POISON_ITEMS } from '../public/game/weapon-poisons.js';

test('stock caps persist by merchant and item while legacy healing counts carry forward', () => {
  const hero = { ...createGame(), location: 'gallows-fair' };
  const potion = TREASURE_ITEMS['common-lesser-healing'];
  hero.flags['merchantHealing:gallows-fair:lesser-healing'] = 2;
  assert.equal(merchantItemRemaining(hero, potion, 'shop'), 1);
  recordMerchantPurchase(hero, potion, 'shop', 1);
  const otherPotion = TREASURE_ITEMS['rare-lesser-healing-v1'];
  assert.equal(merchantItemRemaining(hero, otherPotion, 'shop'), 0);

  const wand = TREASURE_ITEMS['wand-fireball-1'];
  const scroll = TREASURE_ITEMS['scroll-fireball'];
  const poison = POISON_ITEMS['weapon-poison-1'];
  for (const [item, cap] of [[wand, 1], [scroll, 3], [poison, 3]]) {
    assert.ok(item);
    assert.equal(merchantItemRemaining(hero, item, 'shop'), cap);
    recordMerchantPurchase(hero, item, 'shop', cap);
    const saved = loadGame(saveGame(hero));
    assert.equal(merchantItemRemaining(saved, item, 'shop'), 0);
    assert.equal(merchantItemRemaining(saved, item, 'gizmo'), cap);
    assert.equal(merchantItemRemaining({ ...saved, location: 'ash-market' }, item, 'shop'), cap);
  }
  assert.equal(merchantItemRemaining(hero, 'potion', 'shop'), 3);
  assert.equal(merchantItemRemaining(hero, 'armor', 'shop'), Infinity);
});

test('alchemists have only the poison grades unlocked in their regions', () => {
  for (const [region, location] of ['gallows-fair', 'ash-market', 'pearl-defiance', 'noonless-quay'].entries()) {
    const hero = { ...createGame(), region, location };
    const ids = stockForMerchant(hero, merchantFor(location));
    assert.deepEqual(ids.filter(id => Object.hasOwn(POISON_ITEMS, id)), Object.keys(POISON_ITEMS).slice(0, region === 3 ? 5 : region + 1));
    assert.ok(!stockForMerchant(hero, merchantFor(location, 'gizmo')).some(id => Object.hasOwn(POISON_ITEMS, id)));
  }
});

test('epic and legendary wizard offers are infrequent, deterministic and level appropriate', () => {
  const hero = { ...createGame(), region: 3, location: 'hinge-town', level: 24 };
  const wizard = merchantFor(hero.location);
  const counts = { epic: 0, legendary: 0 };
  for (let seed = 0; seed < 1000; seed++) {
    const state = { ...hero, treasureSeed: seed };
    const ids = stockForMerchant(state, wizard);
    for (const rarity of Object.keys(counts)) {
      const offers = ids.filter(id => TREASURE_ITEMS[id].rarity === rarity);
      assert.ok(offers.length <= 1);
      for (const id of offers) {
        const item = TREASURE_ITEMS[id];
        assert.ok(!item.notForSale && !item.bottomOnly && !item.encounterOnly && !item.alien, id);
      }
      counts[rarity] += offers.length;
    }
    if (seed === 150) assert.deepEqual(stockForMerchant(loadGame(saveGame(state)), wizard), ids);
  }
  assert.ok(counts.epic >= 60 && counts.epic <= 140, JSON.stringify(counts));
  assert.ok(counts.legendary >= 5 && counts.legendary <= 40, JSON.stringify(counts));
  const starting = { ...createGame(), location: 'bellwether' };
  const early = stockForMerchant(starting, merchantFor(starting.location));
  assert.ok(early.some(id => TREASURE_ITEMS[id].kind === 'wand'));
  assert.ok(early.every(id => ['common', 'rare'].includes(TREASURE_ITEMS[id].rarity)));
});
