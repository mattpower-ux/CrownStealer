import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../public/game/engine.js';
import {areaTile,branchGates} from '../public/game/exploration.js';
import {DUNGEONS} from '../public/game/content.js';

test('coasts have deep inlets and frequent sharp changes',()=>{
 const depths=Array.from({length:70},(_,i)=>{let x=1;while(engine.worldTile(0,x,i+12)==='water')x++;return x;});
 assert.ok(Math.max(...depths)-Math.min(...depths)>=14);
 assert.ok(depths.filter((v,i)=>i&&Math.abs(v-depths[i-1])>=2).length>=20);
});
test('scarce shipyards are reachable on dry land next to water; purchases persist and cannot repeat',()=>{
 assert.equal(typeof engine.shipyardList,'function');
 for(let region=0;region<4;region++){
  const s={...engine.createGame(),region,gold:500};
  const yards=engine.shipyardList(s);assert.equal(yards.length,1);
  const yard=yards[0];assert.notEqual(engine.worldTile(region,yard.x,yard.y),'water');
  assert.ok(engine.DIRS.some(([dx,dy])=>engine.worldTile(region,yard.x+dx,yard.y+dy)==='water'));
  Object.assign(s,{x:yard.x,y:yard.y});assert.equal(engine.pointAt(s).kind,'shipyard');
  const bought=engine.act(s,{type:'buyRowboat'});assert.equal(bought.gold,250);assert.equal(bought.flags.rowboatReady,true);
  assert.equal(engine.act(bought,{type:'buyRowboat'}).gold,250);
  assert.equal(engine.loadGame(engine.saveGame(bought)).flags.rowboatReady,true);
  assert.equal(engine.act({...s,gold:249},{type:'buyRowboat'}).flags.rowboatReady,undefined);
  assert.equal(engine.act({...s,x:64,y:48},{type:'buyRowboat'}).gold,500);
 }
 let count=0;for(let i=0;i<12;i++){const s={...engine.createGame(),region:Math.floor(i/3),exploration:{area:'wild-'+i,artifacts:[]}};for(const yard of engine.shipyardList(s)){count++;assert.notEqual(areaTile(s,yard.x,yard.y),'water');}}
 assert.equal(count,4);
});

test('version-one coastal saves move safely and retain minor dungeon progress',()=>{
 const s={...engine.createGame(),region:2,x:84,y:2,wildernessTerrainVersion:1};
 const restored=engine.loadGame(engine.saveGame(s));
 assert.equal(restored.wildernessTerrainVersion,3);
 assert.ok(!['water','mountain'].includes(engine.worldTile(2,restored.x,restored.y)));
 const site=engine.minorSiteList(s).find(p=>p.minorKind==='koboldCave');
 const dungeon={site:'minor-site',minorId:site.id,index:site.index,floor:0,x:1,y:1,dir:2,ladderLayout:1};
 const inside=engine.loadGame(engine.saveGame({...s,mode:'dungeon',dungeon}));
 assert.deepEqual(inside.dungeon,dungeon);
 assert.deepEqual([inside.x,inside.y],[site.x,site.y]);
});

test('a purchased rowboat opens both offshore regions while walkers and relic-free travelers are refused',()=>{
 let s={...engine.createGame(),region:3,gold:250};const yard=engine.shipyardList(s)[0];
 Object.assign(s,{x:yard.x,y:yard.y});s=engine.act(s,{type:'buyRowboat'});
 for(const gate of branchGates(3).filter(p=>p.boatOnly)){
  const atGate={...s,x:gate.x,y:gate.y};
  assert.equal(engine.act(atGate,{type:'enter'}).exploration?.area,undefined);
  atGate.relics=DUNGEONS.filter(p=>p.region===3).map(p=>p.id);
  const walker=structuredClone(atGate);delete walker.flags.rowboatReady;
  assert.equal(engine.act(walker,{type:'enter'}).exploration?.area,undefined);
  const landed=engine.act(atGate,{type:'enter'});
  assert.equal(landed.exploration.area,gate.area);
  assert.equal(engine.loadGame(engine.saveGame(landed)).exploration.area,gate.area);
 }
});
