import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,saveGame,loadGame} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {townWalkable} from '../public/game/town.js';

function inTown(id='mothbridge'){
 const s=createGame(),town=TOWNS.find(t=>t.id===id);
 return Object.assign(s,{mode:'town',returnMode:'town',location:id,region:town.region,x:town.x,y:town.y,townPosition:{x:10,y:2}});
}
test('walking across Mothbridge northeast bridge exits safely and survives saving',()=>{
 let s=inTown();const world=[s.x,s.y],bag=[...s.bag],gold=s.gold;
 s=act(s,{type:'move',dx:1,dy:0});
 assert.equal(s.mode,'town');assert.deepEqual(s.townPosition,{x:11,y:2});
 s=act(loadGame(saveGame(s)),{type:'move',dx:1,dy:0});
 assert.equal(s.mode,'world');assert.equal(s.location,null);
 assert.deepEqual([s.x,s.y],world);assert.deepEqual(s.bag,bag);assert.equal(s.gold,gold);
 const restored=loadGame(saveGame(s));
 assert.equal(restored.mode,'world');assert.deepEqual(restored.townPosition,{x:12,y:2});
});
test('bridge opening is limited to Mothbridge and south gate remains open',()=>{
 for(const town of TOWNS){
  const s=inTown(town.id);
  assert.equal(townWalkable(12,2,s),town.id==='mothbridge');
  for(const y of [1,3,4,11,12])assert.equal(townWalkable(12,y,s),false);
  s.townPosition={x:6,y:11};
  assert.equal(act(s,{type:'move',dx:0,dy:1}).mode,'world');
 }
});
