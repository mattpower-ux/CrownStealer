import test from 'node:test';
import assert from 'node:assert/strict';
import {castleTreasuryLoot} from '../public/game/castle-treasury-loot.js';
import {itemById} from '../public/game/items.js';
import {TOWNS} from '../public/game/content.js';

test('treasury rare rewards are level gated and ordinary chests have none',()=>{
 for(let slot=0;slot<5;slot++)assert.deepEqual(castleTreasuryLoot({level:4,location:'bellwether',region:0},{treasurySlot:slot}),[]);
 assert.deepEqual(castleTreasuryLoot({level:20,location:'bellwether',region:0},{}),[]);
});
test('every town has distinct stable eligible rare treasury items',()=>{
 for(const town of TOWNS){
  const s={level:5,region:town.region,location:town.id};
  const count=town.id==='bellwether'?5:3;
  const ids=Array.from({length:count},(_,treasurySlot)=>castleTreasuryLoot(s,{treasurySlot})).flat();
  assert.equal(new Set(ids).size,count);
  for(const id of ids){const item=itemById(id);assert.equal(item.rarity,'rare');assert.ok(!item.unique&&!item.notForSale&&!item.encounterOnly);assert.ok(item.tier>=1&&item.tier<=3);}
  assert.deepEqual(castleTreasuryLoot(s,{treasurySlot:1}),castleTreasuryLoot({...s,rng:999},{treasurySlot:1}));
 }
 assert.equal(itemById(castleTreasuryLoot({level:5,region:0,location:'bellwether'},{treasurySlot:1})[0]).tier,3);
});
