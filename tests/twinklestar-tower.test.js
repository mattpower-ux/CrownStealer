import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame,pointAt,dungeonMap} from '../public/game/engine.js';
import {areaTile} from '../public/game/exploration.js';
import {dungeonFloors} from '../public/game/dungeon-depths.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {dungeonChests} from '../public/game/treasure.js';
import {twinklestarTowerSite,TWINKLESTAR_TOWER_ID} from '../public/game/twinklestar-tower.js';

function island(){const s=createGame();s.region=3;s.exploration={area:'wild-10',artifacts:[],home:{region:3,x:64,y:88}};const p=twinklestarTowerSite(s);Object.assign(s,{x:p.x,y:p.y});return s;}
test('Twinklestar is on an isolated island and requires a boat even when flying',()=>{
 let s=island();const p=twinklestarTowerSite(s);assert.equal(pointAt(s).id,TWINKLESTAR_TOWER_ID);assert.equal(areaTile(s,p.x,p.y),'grass');
 const queue=[[p.x,p.y]],seen=new Set();for(let i=0;i<queue.length;i++){const [x,y]=queue[i],key=x+','+y;if(seen.has(key)||['water','mountain'].includes(areaTile(s,x,y)))continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([x+dx,y+dy]);}assert.ok(seen.size<20);assert.ok(!seen.has('64,87'));
 const sailing=[[64,87]],sailed=new Set();for(let i=0;i<sailing.length;i++){const [x,y]=sailing[i],key=x+','+y;if(x<1||y<1||x>126||y>94||sailed.has(key)||areaTile(s,x,y)==='mountain')continue;sailed.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])sailing.push([x+dx,y+dy]);}assert.ok(sailed.has(p.x+','+p.y));
 assert.equal(act(s,{type:'enter'}).mode,'world');s.flags.mount='dragon';s.flags.mounts=['dragon'];assert.equal(act(s,{type:'enter'}).mode,'world');
 s.flags.rowboatReady=true;s=act(s,{type:'enter'});assert.equal(s.dungeon.site,TWINKLESTAR_TOWER_ID);assert.equal(dungeonFloors(s.dungeon),9);assert.doesNotThrow(()=>loadGame(saveGame(s)));
});
test('all nine tower floors connect their stairs and preserve chest progress',()=>{
 let s=island();s.flags.sailboatReady=true;s=act(s,{type:'enter'});
 for(let floor=0;floor<9;floor++){
  s.dungeon.floor=floor;s.dungeon.x=1;s.dungeon.y=1;const map=dungeonMap(s.dungeon),queue=[[1,1]],seen=new Set();
  for(let n=0;n<queue.length;n++){const [x,y]=queue[n],key=x+','+y;if(seen.has(key)||map[y]?.[x]===undefined||map[y][x]===1)continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([x+dx,y+dy]);}
  for(const p of [...dungeonLadders(s.dungeon,map),{x:13,y:13}])assert.ok(seen.has(p.x+','+p.y));
  for(const chest of dungeonChests(s,map))s.openedChests.push(chest.id);
  assert.doesNotThrow(()=>loadGame(saveGame(s)));
 }
});
test('only ninth-floor guardian defeat unlocks the White Wizard rescue',()=>{
 let s=island();s.flags.rowboatReady=true;s=act(s,{type:'enter'});s.dungeon.floor=8;s.dungeon.x=13;s.dungeon.y=13;
 s=act(s,{type:'descend'});assert.equal(s.enemy.speciesId,'twinklestar-jailer');assert.equal(s.flags.twinklestarGuardianDefeated,undefined);
 assert.doesNotThrow(()=>loadGame(saveGame(s)));s.enemy.hp=1;s.rng=0;
 for(let i=0;i<10&&s.mode==='battle';i++)s=act(s,{type:'attack'});
 assert.equal(s.mode,'dungeon');assert.equal(s.flags.twinklestarGuardianDefeated,true);assert.equal(s.flags['boss:6'],undefined);assert.deepEqual(s.relics,[]);
 const again=act(loadGame(saveGame(s)),{type:'descend'});assert.equal(again.mode,'dungeon');assert.equal(again.gold,s.gold);
});
