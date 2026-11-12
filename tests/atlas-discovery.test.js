import test from 'node:test';
import assert from 'node:assert/strict';
import {atlasView,paintAtlasMaps} from '../public/game/atlas-view.js';
import {createGame,saveGame,loadGame} from '../public/game/engine.js';
import {REGIONS,TOWNS} from '../public/game/content.js';
import {AREAS,visitedLands} from '../public/game/exploration.js';

test('unexplored lands expose neither names, landmarks nor terrain canvases',()=>{
  const s=createGame(),html=atlasView(s);
  assert.doesNotMatch(html,/Unexplored land|atlas-regions|atlas-region|<details/);
  assert.equal((html.match(/<canvas /g)||[]).length,1);
  assert.match(html,/data-atlas-world/);
  for(const region of REGIONS.slice(1)) assert.ok(!html.includes(region.name));
  for(const area of AREAS) assert.ok(!html.includes(area.name));
  for(const town of TOWNS.filter(t=>t.region!==0))assert.ok(!html.includes(town.name));
  assert.equal((html.match(/data-atlas-map=/g)||[]).length,0);
  assert.doesNotMatch(html,/data-atlas-area=/);
});

test('visited and current branches reveal maps and retain discovery after saving',()=>{
  const s=createGame();s.flags.visitedLands=[0,1,'wild-0'];s.exploration={area:'wild-2',artifacts:[]};
  const restored=loadGame(saveGame(s)),html=atlasView(restored);
  assert.deepEqual(visitedLands(restored),visitedLands(s));
  for(const id of ['wild-0','wild-2'])assert.ok(html.includes(AREAS.find(a=>a.id===id).name));
  assert.ok(html.includes(REGIONS[1].name));
  assert.ok(!html.includes(AREAS.find(a=>a.id==='wild-1').name));
});

test('legacy return access and branch progress reveal only explored lands',()=>{
  const s=createGame();delete s.flags.visitedLands;
  s.flags['returnAccess:0']=true;s.flags['expedition:wild-3-cave-0']=true;
  const html=atlasView(s);
  assert.ok(html.includes(REGIONS[1].name));
  assert.ok(html.includes(AREAS.find(a=>a.id==='wild-3').name));
  assert.ok(!html.includes(AREAS.find(a=>a.id==='wild-4').name));
});

test('one panorama paints only discovered place names and marks the player',()=>{
 const labels=[],context=new Proxy({fillText:text=>labels.push(text),measureText:text=>({width:text.length*7}),createRadialGradient:()=>({addColorStop(){}})}, {get(target,key){return target[key]??(()=>{});},set(target,key,value){target[key]=value;return true;}});
 const canvas={width:1500,height:700,getContext:()=>context};
 paintAtlasMaps({querySelector:()=>canvas},createGame());
 assert.ok(labels.includes(REGIONS[0].name));assert.ok(labels.includes('You are here'));
 for(const region of REGIONS.slice(1))assert.ok(!labels.includes(region.name));
 for(const area of AREAS)assert.ok(!labels.includes(area.name));
});
