import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame,worldTile} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {AREAS,areaTile,areaSites,branchGates} from '../public/game/exploration.js';

test('all terrestrial regions extend four times across each axis with distant landmarks',()=>{
 for(let region=0;region<4;region++){
  const s=createGame();s.region=region;s.x=100;s.y=48;
  assert.equal(worldTile(region,100,48),'road');
  const moved=act(s,{type:'move',dx:1,dy:0},[],{noRandom:true});assert.equal(moved.x,101);
  assert.ok(TOWNS.filter(t=>t.region===region).some(t=>t.x>80));
  assert.ok(branchGates(region).some(g=>g.y>80));
 }
});
test('all twelve branch wilderness maps expand, while planet coordinates stay unchanged',()=>{
 for(const area of AREAS){const s=createGame();s.region=area.region;s.exploration={area:area.id,artifacts:[]};
  const sites=areaSites(s);if(area.kind==='wild'){
   assert.ok(sites.some(p=>p.x>=100));assert.ok(sites.some(p=>p.y>=88));assert.notEqual(areaTile(s,64,80),'water');
   s.x=64;s.y=80;const moved=act(s,{type:'move',dx:0,dy:1},[],{noRandom:true});assert.equal(moved.y,81);assert.equal(loadGame(saveGame(moved)).y,81);
  }else assert.ok(sites.every(p=>p.x<32&&p.y<24));
 }
});
test('legacy migration scales terrestrial location and return anchor once, preserving dungeon local position',()=>{
 const s=createGame();delete s.worldMapVersion;s.x=6;s.y=7;s.exploration={area:'wild-0',artifacts:[],home:{region:0,x:16,y:1}};
 s.mode='dungeon';s.dungeon={index:0,expedition:'wild-0-cave-0',floor:0,x:1,y:1,dir:1};
 const restored=loadGame(saveGame(s));assert.equal(restored.x,24);assert.equal(restored.y,28);assert.equal(restored.exploration.home.x,64);assert.equal(restored.dungeon.x,1);
 assert.equal(loadGame(saveGame(restored)).x,24);
});
