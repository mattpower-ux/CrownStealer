import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,dungeonMap,pointAt,saveGame,loadGame} from '../public/game/engine.js';
import {wildernessDiscoverySites} from '../public/game/wilderness-discoveries.js';
import {druidOffering,DRUID_SHIELD,ROOTING_POTION,rootActive} from '../public/game/druid-grove.js';
import {dungeonChests} from '../public/game/treasure.js';
import {DAY_MS,worldTimeMs} from '../public/game/world-clock.js';
import {AudioDirector,recordedMusic} from '../public/game/audio.js';
import {musicScene} from '../public/game/location-music.js';

function atCircle(){
 const s=createGame('Grove tester');
 const site=wildernessDiscoverySites(s).find(p=>p.type==='standing-stones');
 Object.assign(s,{mode:'world',x:site.x,y:site.y,gold:100,worldTimeMs:0});
 assert.equal(pointAt(s)?.id,site.id);
 return {s,site};
}
function offer(s,site,choice,roll){
 druidOffering(s,site,choice,{random:()=>roll,note:(_s,message)=>s.log.push(message)});
 return s.flags.druidCircles[site.id];
}
test('standing stones resolve three distinct results and enforce a 24-hour cooldown',()=>{
 for(const [roll,result] of [[.1,'open'],[.5,'groan'],[.9,'warning']]){
  const {s,site}=atCircle(),hp=s.hp;
  assert.equal(offer(s,site,'blood',roll).result,result);
  assert.equal(s.hp,hp-5);
  assert.equal(offer(s,site,'gold').result,result);
  assert.equal(s.gold,100);
  s.worldTimeMs=DAY_MS;
  assert.equal(offer(s,site,'gold').result,'gold');
  assert.equal(s.gold,90);
  assert.equal(s.flags.druidCircles[site.id].opened,result==='open');
 }
});
test('all eight druid floors open, award loot and keep their state across saves',()=>{
 let {s,site}=atCircle();
 offer(s,site,'blood',.1);
 const preview={invulnerable:true,noRandom:true,noEncounters:true};
 s=act(s,{type:'enterDruidGrove',id:site.id});
 const heard=musicScene(s);
 assert.equal(recordedMusic(heard),'/assets/druidic-tomb.mp3');
 const director=new AudioDirector({AudioContext:null});
 director.setScene(heard);
 assert.equal(director.scene,heard);
 const names=new Set();
 for(let floor=0;floor<8;floor++){
  assert.equal(s.dungeon.floor,floor);
  s=loadGame(saveGame(s));
  const [chest]=dungeonChests(s,dungeonMap(s.dungeon));
  Object.assign(s.dungeon,{x:chest.x,y:chest.y});
  s=act(s,{type:'openChest'},[],preview);
  assert.ok(s.bag.includes(chest.item));
  assert.ok(s.openedChests.includes(chest.id));
  Object.assign(s.dungeon,{x:13,y:13,dir:0});
  if(floor===7)break;
  s=act(s,{type:'descend'},[],preview);
  assert.equal(s.mode,'battle');
  names.add(s.enemy.name);
  s.enemy.hp=1;
  for(let i=0;i<8&&s.mode==='battle';i++)s=act(s,{type:'attack'},[],preview);
  assert.equal(s.mode,'dungeon');
  s=act(s,{type:'descend'},[],preview);
 }
 assert.equal(names.size,3);
 const hostile=act(s,{type:'druidAnswer',answer:'defiant'},[],preview);
 assert.equal(hostile.enemy.name,'Herne the Hunter');
 assert.equal(hostile.enemy.druidSwarm,true);
 s=act(s,{type:'druidAnswer',answer:'honest'});
 assert.ok(s.bag.includes(DRUID_SHIELD));
 assert.equal(s.flags.druidCircles[site.id].resolved,'peace');
 assert.ok(s.bag.includes(ROOTING_POTION));
 s=act(s,{type:'useItem',id:ROOTING_POTION});
 assert.ok(rootActive(s));
 assert.equal(s.flags.druidRootedUntil-worldTimeMs(s),600000);
});
