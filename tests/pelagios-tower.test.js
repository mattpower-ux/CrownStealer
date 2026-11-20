import test from 'node:test';
import assert from 'node:assert/strict';
import {PELAGIOS_TOWER_ID,PELAGIOS_FLOORS,SCORNRAVEN_ID,finishPelagiosEnemy,pelagiosEnemy,pelagiosTowerMap,pelagiosFloorName,pelagiosTowerSite,scornravenTurn} from '../public/game/pelagios-tower.js';
import {act,createGame,dungeonMap,loadGame,pointAt,saveGame} from '../public/game/engine.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {dungeonChests} from '../public/game/treasure.js';
import {pelagiosPalette,pelagiosWallPixel} from '../public/game/pelagios-render.js';

const walkable=(map,x,y)=>map[y]?.[x]!==undefined&&map[y][x]!==1;
const reachable=(map,start)=>{const seen=new Set([start.join(',')]),queue=[start];for(const [x,y] of queue)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(walkable(map,nx,ny)&&!seen.has(key)){seen.add(key);queue.push([nx,ny]);}}return seen;};

test('Pelagios has one twelve-level city tower landmark in region two',()=>{
 const site=pelagiosTowerSite({...createGame(),region:2});
 assert.equal(site.id,PELAGIOS_TOWER_ID);assert.equal(site.region,2);assert.equal(site.kind,'pelagiosTower');assert.equal(PELAGIOS_FLOORS,12);
 assert.equal(new Set(Array.from({length:PELAGIOS_FLOORS},(_,floor)=>pelagiosFloorName(floor))).size,12);
});

test('all twelve Pelagios maps form connected 27-square hexagonal palace floors',()=>{
 for(let floor=0;floor<PELAGIOS_FLOORS;floor++){
  const map=pelagiosTowerMap({site:PELAGIOS_TOWER_ID,floor});
  assert.equal(map.length,27);assert.ok(map.every(row=>row.length===27));
  assert.equal(map[2][13],0);assert.equal(map[13][2],0);assert.equal(map[13][24],0);assert.equal(map[24][13],0);
  assert.equal(map[2][2],1);assert.equal(map[24][24],1);
  for(const [x,y] of [[7,3],[19,3],[23,13],[19,23],[7,23],[3,13]])assert.ok(walkable(map,x,y),'tower vertex '+x+','+y+' floor '+floor);
  const stairs=[];for(let y=0;y<27;y++)for(let x=0;x<27;x++)if([2,3].includes(map[y][x]))stairs.push([x,y]);
  assert.equal(stairs.length,floor===PELAGIOS_FLOORS-1?1:2);
  const seen=reachable(map,stairs[0]);for(const [x,y] of stairs)assert.ok(seen.has(x+','+y));
  assert.ok(seen.has('13,13'),'central court reachable on floor '+floor);
 }
});

test('every Pelagios floor has two to five reachable treasure chests',()=>{
 const state={...createGame(),region:2,x:pelagiosTowerSite({...createGame(),region:2}).x,y:pelagiosTowerSite({...createGame(),region:2}).y};
 for(let floor=0;floor<PELAGIOS_FLOORS;floor++){
  state.dungeon={site:PELAGIOS_TOWER_ID,index:4,floor,x:13,y:23,dir:0};
  const map=pelagiosTowerMap(state.dungeon),seen=reachable(map,[state.dungeon.x,state.dungeon.y]),chests=dungeonChests(state,map);
  assert.ok(chests.length>=2&&chests.length<=5,'chest count floor '+floor+': '+chests.length);
  for(const chest of chests)assert.ok(seen.has(chest.x+','+chest.y),'reachable chest floor '+floor);
 }
});

test('the world landmark enters, saves, and traverses all twelve Pelagios floors',()=>{
 const site=pelagiosTowerSite({...createGame(),region:2});
 let state={...createGame(),region:2,x:site.x,y:site.y};
 assert.equal(pointAt(state)?.id,PELAGIOS_TOWER_ID);
 state=act(state,{type:'enter'});
 assert.equal(state.mode,'dungeon');assert.equal(state.dungeon.site,PELAGIOS_TOWER_ID);assert.equal(state.dungeon.floor,0);
 assert.equal(dungeonMap(state.dungeon).length,27);
 state=loadGame(saveGame(state));
 for(let floor=0;floor<PELAGIOS_FLOORS-1;floor++){
  const down=dungeonLadders(state.dungeon,dungeonMap(state.dungeon)).find(l=>l.direction==='down');
  assert.ok(down,'down stair on floor '+floor);
  Object.assign(state.dungeon,{x:down.x,y:down.y});
  state=act(state,{type:'descend'});
  assert.equal(state.dungeon.floor,floor+1);
  state=loadGame(saveGame(state));
 }
 const up=dungeonLadders(state.dungeon,dungeonMap(state.dungeon)).find(l=>l.direction==='up');
 Object.assign(state.dungeon,{x:up.x,y:up.y});
 state=act(state,{type:'leave'});
 assert.equal(state.dungeon.floor,PELAGIOS_FLOORS-2);
 while(state.dungeon){
  const stair=dungeonLadders(state.dungeon,dungeonMap(state.dungeon)).find(l=>l.direction==='up');
  Object.assign(state.dungeon,{x:stair.x,y:stair.y});
  state=act(state,{type:'leave'});
 }
 assert.equal(state.mode,'world');assert.equal(state.x,site.x);assert.equal(state.y,site.y);
});

test('Pelagios occupants progress from goblins and orcs to dark arcane defenders',()=>{
 const state=floor=>({dungeon:{site:PELAGIOS_TOWER_ID,floor}});
 assert.match(pelagiosEnemy(state(0),{roll:0}).name,/Goblin/);
 assert.match(pelagiosEnemy(state(4),{roll:.9}).name,/Guardian|Captain|Orc/);
 assert.match(pelagiosEnemy(state(7),{roll:.9}).name,/Spirit|Armor|Retainer/);
 assert.match(pelagiosEnemy(state(10),{roll:.9}).name,/Demon|Gargoyle|Retainer/);
 assert.equal(pelagiosEnemy(state(11),{boss:true}).speciesId,SCORNRAVEN_ID);
});

test('Scornraven waits on level twelve and awards his unique signet only once',()=>{
 const site=pelagiosTowerSite({...createGame(),region:2});
 let state={...createGame(),region:2,x:site.x,y:site.y};state=act(state,{type:'enter'});
 state.dungeon.floor=11;Object.assign(state.dungeon,{x:13,y:3});
 state=act(state,{type:'descend'});
 assert.equal(state.mode,'battle');assert.equal(state.enemy.speciesId,SCORNRAVEN_ID);
 const notes=[];assert.equal(finishPelagiosEnemy(state,state.enemy,text=>notes.push(text)),true);
 assert.equal(state.flags.scornravenDefeated,true);assert.equal(state.bag.filter(id=>id==='scornraven-signet').length,1);
 assert.equal(finishPelagiosEnemy(state,{speciesId:SCORNRAVEN_ID},text=>notes.push(text)),true);
 assert.equal(state.bag.filter(id=>id==='scornraven-signet').length,1);
 assert.doesNotThrow(()=>loadGame(saveGame({...state,mode:'dungeon',returnMode:'dungeon',enemy:null})));
});

test('Pelagios rendering progresses from occupied alabaster to arcane corruption',()=>{
 assert.equal(pelagiosPalette(0).occupation,'goblin');
 assert.equal(pelagiosPalette(4).occupation,'orc');
 assert.equal(pelagiosPalette(7).occupation,'arcane');
 assert.equal(pelagiosPalette(10).occupation,'scornraven');
 assert.notEqual(pelagiosWallPixel(0,2,.35,.4,.8),pelagiosWallPixel(10,2,.35,.4,.8));
});

test('Scornraven opens with a ward, summons once, darkens the room, and uses shadow bolts',()=>{
 const enemy=pelagiosEnemy({dungeon:{floor:11}},{boss:true});
 assert.equal(scornravenTurn(enemy).kind,'ward');
 enemy.hp=Math.floor(enemy.maxHp*.6);assert.equal(scornravenTurn(enemy).kind,'summon');
 assert.equal(scornravenTurn(enemy).kind,'shadow');
 assert.equal(scornravenTurn(enemy).kind,'darkness');
 assert.equal(enemy.summonedSpirit,true);
});
