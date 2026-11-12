import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWNS } from '../public/game/content.js';
import { TREASURE_ITEMS, merchantStock } from '../public/game/treasure.js';
import {
  merchantCategory,
  merchantFor,
  merchantPlaces,
  merchantStockFor,
  canMerchantSell,
  canMerchantBuy,
  compareMerchantItems,
  canBuyMerchantSupply,
} from '../public/game/merchant-catalog.js';

test('specialists buy only their own categories while traveling merchants accept mixed goods', () => {
  const sword = {kind:'weapon',id:'sword'}, scroll = {kind:'scroll',id:'scroll'}, ring = {kind:'ring',id:'ring'};
  assert.equal(canMerchantBuy('blacksmith', sword), true);
  assert.equal(canMerchantBuy('blacksmith', scroll), false);
  assert.equal(canMerchantBuy('blacksmith', ring), false);
  assert.equal(canMerchantBuy('wizard', scroll), true);
  assert.equal(canMerchantBuy('wizard', ring), true);
  assert.equal(canMerchantBuy('wizard', sword), false);
  for (const item of [sword, scroll, ring, {kind:'potion'}, {kind:'gadget'}]) {
    assert.equal(canMerchantBuy('traveling', item), true);
    assert.equal(canMerchantSell('traveling', item), true);
  }
  assert.equal(canMerchantBuy('traveling', {kind:'quest'}), false);
});

test('merchant weapons sort by total damage and combat bonuses before rarity, with stable ties', () => {
  const items = [
    {id:'weak-legend',kind:'weapon',damage:[2,4],rarity:'legendary'},
    {id:'plain',kind:'weapon',damage:[10,14],rarity:'rare'},
    {id:'magic',kind:'weapon',damage:[7,9],elementDamage:3,stormDamage:4,rarity:'common'},
    {id:'accurate',kind:'weapon',damage:[10,14],toHit:3,rarity:'common'},
    {id:'tie-b',kind:'weapon',damage:[4,6],rarity:'rare'},
    {id:'tie-a',kind:'weapon',damage:[4,6],rarity:'rare'},
    {id:'tie-epic',kind:'weapon',damage:[4,6],rarity:'epic'},
    {id:'weapon',kind:'weapon'},
  ];
  assert.deepEqual(items.sort(compareMerchantItems).map(item=>item.id),
    ['magic','accurate','plain','tie-epic','tie-a','tie-b','weak-legend','weapon']);
});

test('every region offers the three merchant types across different towns', () => {
  for (let region = 0; region < 4; region++) {
    const towns = TOWNS.filter(town => town.region === region);
    assert.deepEqual(towns.map(town => merchantFor(town.id).merchant), [
      'blacksmith', 'wizard', 'alchemist',
    ]);
    for (const town of towns) {
      const places = merchantPlaces(town.id);
      assert.equal(places[0].id, 'shop');
      assert.equal(new Set(places.map(place => place.id)).size, places.length);
    }
  }
  assert.deepEqual(merchantPlaces('unmapped-town'), []);
  assert.equal(merchantFor('mothbridge', 'inn'), null);
});

test('specialty storefronts stay in their existing towns', () => {
  assert.equal(merchantFor('mothbridge', 'mount-shop').merchant, 'mount');
  assert.equal(merchantFor('salt-choir', 'healing-enclave').merchant, 'enclave');
  assert.deepEqual(TOWNS.filter(town => merchantFor(town.id, 'gizmo')).map(town => town.id), [
    'gallows-fair', 'ash-market', 'pearl-defiance', 'noonless-quay',
  ]);
  assert.equal(merchantFor('bellwether', 'mount-shop'), null);
});

test('the inn and appropriate specialists handle legacy supplies', () => {
  assert.ok(canBuyMerchantSupply({ id: 'inn' }, 'food'));
  assert.ok(canBuyMerchantSupply(merchantFor('gallows-fair'), 'potion'));
  assert.ok(canBuyMerchantSupply(merchantFor('mothbridge'), 'weapon'));
  assert.ok(canBuyMerchantSupply(merchantFor('mothbridge'), 'armor'));
  assert.ok(canBuyMerchantSupply(merchantFor('mothbridge', 'mount-shop'), 'transport'));
  assert.ok(!canBuyMerchantSupply(merchantFor('mothbridge'), 'potion'));
  assert.ok(!canBuyMerchantSupply(merchantFor('bellwether'), 'weapon'));
  assert.ok(!canBuyMerchantSupply(merchantFor('mothbridge', 'mount-shop'), 'food'));
});

test('stock categories cover legacy wands, enchanted equipment and disguising item art', () => {
  const cases = [
    [{ kind: 'weapon', family: 'wand' }, 'magic-expendables'],
    [{ kind: 'weapon', shape: 'wand' }, 'magic-expendables'],
    [{ kind: 'wand' }, 'magic-expendables'],
    [{ kind: 'scroll' }, 'magic-expendables'],
    [{ kind: 'consumable', shape: 'scroll' }, 'magic-expendables'],
    [{ kind: 'weapon', family: 'sword', element: 'frost' }, 'weapons-armor'],
    [{ kind: 'shield' }, 'weapons-armor'],
    [{ kind: 'hands', shape: 'gloves' }, 'weapons-armor'],
    [{ kind: 'potion' }, 'potions-poisons'],
    [{ kind: 'poison', shape: 'potion' }, 'potions-poisons'],
    [{ kind: 'necklace' }, 'specialty'],
    [{ kind: 'gadget', shape: 'scroll' }, 'specialty'],
  ];
  for (const [item, category] of cases) assert.equal(merchantCategory(item), category);
});

test('merchant inventory respects categories and keeps gizmos exclusive', () => {
  const items = {
    sword: { kind: 'weapon', family: 'sword' },
    mail: { kind: 'armor' },
    wand: { kind: 'weapon', family: 'wand' },
    scroll: { kind: 'scroll' },
    potion: { kind: 'potion' },
    poison: { kind: 'poison' },
    ring: { kind: 'ring' },
    clock: { kind: 'gadget', shape: 'ring' },
    quest: { kind: 'quest', shape: 'scroll' },
    relic: { kind: 'relic' },
    keepsake: { kind: 'necklace', notForSale: true },
  };
  const stock = merchant => merchantStockFor(merchant, [...Object.keys(items), 'unknown'], id => items[id]);
  assert.deepEqual(stock(merchantFor('mothbridge')), ['sword', 'mail']);
  assert.deepEqual(stock(merchantFor('bellwether')), ['wand', 'scroll', 'ring']);
  assert.deepEqual(stock('alchemist'), ['potion', 'poison']);
  assert.deepEqual(stock('gizmo'), ['clock']);
  assert.deepEqual(stock('mount'), []);
  assert.deepEqual(stock('enclave'), []);
  assert.equal(canMerchantSell(null, items.potion), false);
});

test('existing regional stock gives every storefront its intended item families', () => {
  for (const town of TOWNS) {
    const ids = merchantStock(town.region, town.id, 20);
    for (const place of merchantPlaces(town.id)) {
      if (['mount', 'enclave'].includes(place.merchant)) continue;
      const stock = merchantStockFor(place, ids, id => TREASURE_ITEMS[id]);
      assert.ok(stock.length > 0, `${town.id} ${place.merchant}`);
      if (place.merchant === 'wizard') {
        assert.ok(stock.some(id => TREASURE_ITEMS[id].kind === 'wand'), town.id);
        assert.ok(stock.some(id => TREASURE_ITEMS[id].kind === 'scroll'), town.id);
        assert.ok(stock.some(id => merchantCategory(TREASURE_ITEMS[id]) === 'specialty'), town.id);
      }
    }
  }
});
