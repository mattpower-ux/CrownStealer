import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame,dungeonMap,minorSiteList} from '../public/game/engine.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {secretAlcove,secretRoomKey,seeHiddenChance} from '../public/game/secret-alcoves.js';
import {dungeonChests} from '../public/game/treasure.js';
function cave(){const s=createGame(),site=minorSiteList(s).find(p=>p.minorKind==='koboldCave');s.mode=s.returnMode='dungeon';s.location=site.id;s.x=site.x;s.y=site.y;s.dungeon={site:'minor-site',minorId:site.id,index:site.index,floor:0,x:1,y:1,dir:1,ladderLayout:1};return s;}
function adjacent(s){const room=secretAlcove(s.dungeon,dungeonMap(s.dungeon));assert.ok(room);const map=dungeonMap(s.dungeon);const d=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>map[room.y+dy]?.[room.x+dx]!==1);s.dungeon.x=room.x+d[0];s.dungeon.y=room.y+d[1];return room;}
function seedFor(success){for(let n=0;n<100000;n++){const r=((Math.imul(n,1664525)+1013904223)>>>0)/4294967296;if(success?r<.01:r>.98)return n;}throw Error('seed');}
test('every kobold cave has a hidden reachable wall stash without moving existing ground',()=>{
 const s=createGame();let caves=0;
 for(let slot=0;slot<24;slot++){const id='minor-r0-'+slot,site=minorSiteDefinition(id);if(site.kind!=='koboldCave')continue;caves++;const d={site:'minor-site',minorId:id,index:0,floor:0},map=dungeonMap(d),room=secretAlcove(d,map);assert.ok(room);assert.equal(map[room.y][room.x],1);const opened=dungeonMap({...d,secretRoom:room});assert.equal(opened[room.y][room.x],0);for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(map[y][x]!==1)assert.equal(opened[y][x],map[y][x]);}
 assert.ok(caves>0);
});
test('Intelligence improves See Hidden and failed deliberate searches cost time',()=>{
 let s=cave();adjacent(s);const low=seeHiddenChance(s);s.attributes.intelligence=30;assert.ok(seeHiddenChance(s)>low);s.attributes.intelligence=10;
 s.rng=seedFor(false);const turns=s.turns,time=s.worldTimeMs;s=act(s,{type:'searchSecrets'});assert.equal(s.dungeon.secretRoom,undefined);assert.equal(s.turns,turns+1);assert.equal(s.worldTimeMs,time+300000);
 const before=s.rng;s=act(s,{type:'rename',name:'Searcher'});assert.equal(s.rng,before);
});
test('revealed kobold stash saves, is trapped and cannot duplicate loot',()=>{
 let s=cave();const room=adjacent(s);s.rng=seedFor(true);s=act(s,{type:'searchSecrets'});assert.deepEqual(s.dungeon.secretRoom,room);assert.deepEqual(s.flags['secretRoom:'+secretRoomKey(s.dungeon)],room);
 s=loadGame(saveGame(s));const chest=dungeonChests(s,dungeonMap(s.dungeon)).find(c=>c.id.endsWith(':secret'));assert.ok(chest?.trap);assert.ok(chest.items.length>=2);
 Object.assign(s.dungeon,room);s.rng=seedFor(true);const gold=s.gold;s=act(s,{type:'openChest'});assert.ok(s.gold>gold);const bag=[...s.bag];s=act(loadGame(saveGame(s)),{type:'openChest'});assert.deepEqual(s.bag,bag);
});
test('See Hidden gear must be worn and the potion persists then expires',()=>{
 let s=createGame();const base=seeHiddenChance(s);
 s.bag.push('ring-see-hidden','amulet-see-hidden','talisman-true-sight','potion-see-hidden');
 assert.equal(seeHiddenChance(s),base);
 s=act(s,{type:'equip',id:'ring-see-hidden'});assert.ok(Math.abs(seeHiddenChance(s)-base-.10)<1e-8);
 s=act(s,{type:'equip',id:'amulet-see-hidden'});assert.ok(Math.abs(seeHiddenChance(s)-base-.25)<1e-8);
 s=act(s,{type:'equip',id:'talisman-true-sight'});assert.ok(Math.abs(seeHiddenChance(s)-base-.30)<1e-8);
 s=act(s,{type:'useItem',id:'potion-see-hidden'});assert.ok(Math.abs(seeHiddenChance(s)-base-.55)<1e-8);
 s=loadGame(saveGame(s));assert.ok(!s.bag.includes('potion-see-hidden'));
 s.worldTimeMs=s.buffExpiry.seeHidden;assert.ok(Math.abs(seeHiddenChance(s)-base-.30)<1e-8);
});
test('passive checks happen once per floor and survive reload without free rerolls',()=>{
 let s=cave();const room=adjacent(s),map=dungeonMap(s.dungeon),target={x:s.dungeon.x,y:s.dungeon.y};
 const [dx,dy]=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>map[target.y-dy]?.[target.x-dx]!==undefined&&map[target.y-dy][target.x-dx]!==1&&!(target.x-dx===room.x&&target.y-dy===room.y));
 s.dungeon.x=target.x-dx;s.dungeon.y=target.y-dy;s.dungeon.dir=[[0,-1],[1,0],[0,1],[-1,0]].findIndex(([x,y])=>x===dx&&y===dy);s.rng=seedFor(false);
 s=act(s,{type:'forward'});assert.equal(s.dungeon.secretRoom,undefined);assert.ok(s.flags.secretChecks.includes(secretRoomKey(s.dungeon)));const rng=s.rng;
 s=act(loadGame(saveGame(s)),{type:'back'});s=act(s,{type:'forward'});assert.equal(s.rng,rng);assert.equal(s.dungeon.secretRoom,undefined);
});
