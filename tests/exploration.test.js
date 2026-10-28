import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {DUNGEONS} from '../public/game/content.js';
import {branchGates,areaSites} from '../public/game/exploration.js';
test('branch gates, ten unique artifacts, ship controls and three planetary return routes survive saves',()=>{
 let s=createGame();s.relics=DUNGEONS.map(d=>d.id);
 for(let i=0;i<10;i++){
  s.region=Math.floor(i/3);const gate=branchGates(s.region)[i%3];s.x=gate.x;s.y=gate.y;s=act(s,{type:'enter'});assert.equal(s.exploration.area,'wild-'+i);assert.equal(areaSites(s).filter(p=>p.kind==='expedition').length,2);
  s.x=16;s.y=4;s=act(s,{type:'enter'});s=loadGame(saveGame(s));assert.equal(s.exploration.artifacts.length,i+1);
  if(i<9){s=act(s,{type:'enter'});assert.equal(s.exploration.artifacts.length,i+1);s.x=16;s.y=22;s=act(s,{type:'enter'});assert.equal(s.exploration.area,null);}
 }
 assert.equal(s.dungeon.ship,true);
 for(let planet=0;planet<3;planet++){s.dungeon.x=7;s.dungeon.y=5;s=act(s,{type:'navigatePlanet',planet});assert.equal(s.exploration.area,'planet-'+planet);assert.equal(areaSites(s).filter(p=>p.kind==='expedition').length,3);s=loadGame(saveGame(s));s.x=7;s.y=7;s=act(s,{type:'enter'});s=loadGame(saveGame(s));assert.equal(s.dungeon.expedition,'planet-'+planet+'-cave-0');s=act(s,{type:'leave'});s.x=16;s.y=22;s=act(s,{type:'enter'});assert.equal(s.dungeon.ship,true);}
 s.dungeon.x=7;s.dungeon.y=5;s=act(s,{type:'returnHome'});assert.equal(s.mode,'world');assert.equal(s.exploration.area,null);
});
