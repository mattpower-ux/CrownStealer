import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {TREASURE_ITEMS} from '../public/game/treasure.js';
import {TOWNS} from '../public/game/content.js';
import {merchantFor} from '../public/game/merchant-catalog.js';
import {stockForMerchant} from '../public/game/merchant-inventory.js';
import {merchantItemRemaining} from '../public/game/merchant-supplies.js';
import {atTownPlace} from './town-fixture.js';

const town=()=>atTownPlace({...createGame(),mode:'town',location:'gallows-fair',gold:10000},'shop');
const stock=s=>stockForMerchant(s,merchantFor(s.location));

test('alchemists share three healing potions per type across variants and preserve depletion per town',()=>{
  let s=town();
  s.level=8;
  const ids=stock(s).filter(id=>TREASURE_ITEMS[id].effect==='lesser-healing');
  assert.ok(ids.length>1);
  const before=s.bag.length;
  for(const id of [ids[0],ids.at(-1),ids[0]])s=act(s,{type:'buyItem',id});
  assert.equal(s.bag.length,before+3);
  s=loadGame(saveGame(s));
  const {gold,bag}=s;
  s=act(s,{type:'buyItem',id:ids[0]});
  assert.equal(s.gold,gold);
  assert.deepEqual(s.bag,bag);
  assert.equal(merchantItemRemaining(s,TREASURE_ITEMS[ids[0]],'shop'),0);
  assert.match(s.log.at(-1),/sold out|does not have that many left/i);
  s=atTownPlace({...s,region:1,location:'ash-market'},'shop');
  const other=stock(s).find(id=>TREASURE_ITEMS[id].effect==='lesser-healing');
  assert.ok(act(s,{type:'buyItem',id:other}).gold<gold);
});

test('medium healing starts in realm three and ultra healing in realm four, never earlier',()=>{
  for(const t of TOWNS.filter(t=>merchantFor(t.id).merchant==='alchemist')){
    const potions=stock({...town(),region:t.region,location:t.id}).map(id=>TREASURE_ITEMS[id]);
    assert.equal(potions.some(i=>i.effect==='medium-healing'),t.region>=2);
    assert.equal(potions.some(i=>i.effect==='ultra-healing'),t.region>=3);
  }
  const s=town();
  const id=Object.keys(TREASURE_ITEMS).find(id=>TREASURE_ITEMS[id].effect==='ultra-healing');
  assert.equal(act(s,{type:'buyItem',id}).gold,s.gold);
});

test('everyday bitter tonic also has a persistent three-bottle limit',()=>{
  let s=town();
  const before=s.potions;
  for(let i=0;i<3;i++)s=act(s,{type:'buy',item:'potion'});
  assert.equal(s.potions,before+3);
  s=loadGame(saveGame(s));
  const {gold,potions}=s;
  s=act(s,{type:'buy',item:'potion'});
  assert.equal(s.gold,gold);
  assert.equal(s.potions,potions);
  assert.match(s.log.at(-1),/sold out/i);
});
