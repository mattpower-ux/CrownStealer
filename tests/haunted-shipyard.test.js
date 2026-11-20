import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../public/game/engine.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {dungeonChests} from '../public/game/treasure.js';
import {HAUNTED_SHIPYARD_FLOORS,HAUNTED_SHIPYARD_ID,hauntedShipyardMap} from '../public/game/haunted-shipyard.js';

const reachable=(map,start,target)=>{
 const queue=[start],seen=new Set([start.x+','+start.y]);
 for(const point of queue){
  if(point.x===target.x&&point.y===target.y)return true;
  for(const [dx,dy]of engine.DIRS){const x=point.x+dx,y=point.y+dy,key=x+','+y;if(map[y]?.[x]===1||seen.has(key))continue;seen.add(key);queue.push({x,y});}
 }
 return false;
};

test('the Haunted Shipyard has ten distinct deterministic drowned maps with reachable ladders',()=>{
 assert.equal(HAUNTED_SHIPYARD_FLOORS,10);
 const signatures=new Set();
 for(let floor=0;floor<HAUNTED_SHIPYARD_FLOORS;floor++){
  const dungeon={site:HAUNTED_SHIPYARD_ID,index:4,floor,ladderLayout:1};
  const map=hauntedShipyardMap(floor),again=hauntedShipyardMap(floor);
  assert.deepEqual(map,again);assert.equal(map.length,15);assert.ok(map.every(row=>row.length===15));
  signatures.add(JSON.stringify(map));
  const ladders=dungeonLadders(dungeon,map),up=ladders.find(l=>l.direction==='up'),down=ladders.find(l=>l.direction==='down');
  assert.ok(up);assert.equal(map[up.y][up.x]===1,false);
  if(floor<HAUNTED_SHIPYARD_FLOORS-1){assert.ok(down);assert.equal(reachable(map,up,down),true);}
 }
 assert.equal(signatures.size,HAUNTED_SHIPYARD_FLOORS);
});

test('drowned floor, position, opened chests and defeated guardians survive saving',()=>{
 const state=engine.createGame();
 Object.assign(state,{mode:'dungeon',returnMode:'dungeon',region:2,exploration:{area:'wild-6',artifacts:[]},location:HAUNTED_SHIPYARD_ID});
 state.dungeon={site:HAUNTED_SHIPYARD_ID,index:4,floor:6,x:7,y:9,dir:2,ladderLayout:1};
 state.openedChests=[dungeonChests(state,engine.dungeonMap(state.dungeon))[0].id];state.flags['hauntedGuardian:5']=true;
 const restored=engine.loadGame(engine.saveGame(state));
 assert.deepEqual(restored.dungeon,state.dungeon);assert.deepEqual(restored.openedChests,state.openedChests);assert.equal(restored.flags['hauntedGuardian:5'],true);
});

test('the drowned route descends through all ten levels and returns upward to its saved ladder',()=>{
 let state=engine.createGame();
 Object.assign(state,{mode:'dungeon',returnMode:'dungeon',region:2,exploration:{area:'wild-6',artifacts:[]},location:HAUNTED_SHIPYARD_ID});
 state.dungeon={site:HAUNTED_SHIPYARD_ID,index:4,floor:0,x:1,y:1,dir:1,ladderLayout:1};
 for(let floor=0;floor<HAUNTED_SHIPYARD_FLOORS-1;floor++){
  const down=dungeonLadders(state.dungeon,engine.dungeonMap(state.dungeon)).find(l=>l.direction==='down');
  Object.assign(state.dungeon,{x:down.x,y:down.y});state=engine.act(state,{type:'descend'});
  assert.equal(state.dungeon.floor,floor+1);assert.equal(state.mode,'dungeon');
  const up=dungeonLadders(state.dungeon,engine.dungeonMap(state.dungeon)).find(l=>l.direction==='up');
  assert.deepEqual([state.dungeon.x,state.dungeon.y],[up.x,up.y]);
 }
 const restored=engine.loadGame(engine.saveGame(state));assert.equal(restored.dungeon.floor,9);
 const up=dungeonLadders(restored.dungeon,engine.dungeonMap(restored.dungeon)).find(l=>l.direction==='up');
 Object.assign(restored.dungeon,{x:up.x,y:up.y});const ascended=engine.act(restored,{type:'leave'});assert.equal(ascended.dungeon.floor,8);
});
