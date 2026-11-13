import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,saveGame,loadGame,pointAt,dungeonMap,worldTile} from '../public/game/engine.js';
import {percivalCastleSite,PERCIVAL_CASTLE_ID,percivalThreat} from '../public/game/percival-castle.js';
import {dungeonFloors} from '../public/game/dungeon-depths.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {dungeonChests} from '../public/game/treasure.js';

function entered(){let s=createGame();s.region=1;const site=percivalCastleSite(s);s.x=site.x;s.y=site.y;return act(s,{type:'enter'},[],{noRandom:true});}
function win(s){s.enemy.combatDistance=1;s.enemy.hp=1;s.rng=0;for(let n=0;n<10&&s.mode==='battle';n++)s=act(s,{type:'attack'},[],{noRandom:true});assert.equal(s.mode,'dungeon');return s;}
test('Percival castle is unique, reachable, enters independently of relics and saves',()=>{
 const s=createGame();assert.equal(percivalCastleSite(s),null);s.region=1;
 const site=percivalCastleSite(s);assert.equal(pointAt({...s,x:site.x,y:site.y}).id,PERCIVAL_CASTLE_ID);
 const queue=[{x:64,y:48}],seen=new Set();
 for(let i=0;i<queue.length;i++){const {x,y}=queue[i],key=x+','+y;if(x<1||y<1||x>126||y>94||seen.has(key)||['water','mountain'].includes(worldTile(1,x,y)))continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push({x:x+dx,y:y+dy});}
 assert.ok(seen.has(site.x+','+site.y));const enteredState=entered();assert.equal(enteredState.dungeon.site,PERCIVAL_CASTLE_ID);assert.equal(dungeonFloors(enteredState.dungeon),3);assert.deepEqual(loadGame(saveGame(enteredState)).dungeon,enteredState.dungeon);
 s.exploration={area:'wild-3',artifacts:[]};assert.equal(percivalCastleSite(s),null);
});
test('each floor guard must fall before progressing, and only Liche victory releases Percival',()=>{
 let s=entered();const relics=[...s.relics];
 for(let floor=0;floor<3;floor++){
  const d=s.dungeon;assert.equal(d.floor,floor);
  const down=dungeonLadders(d,dungeonMap(d)).find(p=>p.direction==='down')||{x:13,y:13};Object.assign(d,{x:down.x,y:down.y});
  assert.match(percivalThreat(s).name,/[Gg]host|[Gg]houl|[Zz]ombie/);
  s=act(s,{type:'descend'},[],{noRandom:true});assert.equal(s.mode,'battle');s=win(s);
  assert.equal(s.flags.percivalLicheDefeated,undefined);
  s=act(s,{type:'descend'},[],{noRandom:true});
 }
 assert.equal(s.enemy.speciesId,'percival-liche');assert.equal(s.enemy.boss,true);
 s=win(s);assert.equal(s.flags.percivalLicheDefeated,true);assert.equal(s.flags['boss:2'],undefined);assert.deepEqual(s.relics,relics);
 assert.equal(percivalThreat(s),null);assert.doesNotThrow(()=>loadGame(saveGame(s)));
 const cleared=act(loadGame(saveGame(s)),{type:'descend'});assert.equal(cleared.mode,'dungeon');assert.equal(cleared.gold,s.gold);
});
test('all castle floor chests and saved combat retain valid state',()=>{
 let s=entered();
 for(let floor=0;floor<3;floor++){
  s.dungeon.floor=floor;s.dungeon.x=1;s.dungeon.y=1;
  const map=dungeonMap(s.dungeon),queue=[[1,1]],seen=new Set();
  for(let n=0;n<queue.length;n++){const [x,y]=queue[n],key=x+','+y;if(seen.has(key)||map[y]?.[x]===undefined||map[y][x]===1)continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([x+dx,y+dy]);}
  for(const p of [...dungeonLadders(s.dungeon,map),{x:13,y:13}])assert.ok(seen.has(p.x+','+p.y));
  for(const chest of dungeonChests(s,dungeonMap(s.dungeon)))s.openedChests.push(chest.id);
 }
 assert.doesNotThrow(()=>loadGame(saveGame(s)));
 const end={x:13,y:13};Object.assign(s.dungeon,end);s=act(s,{type:'descend'},[],{noRandom:true});
 assert.doesNotThrow(()=>loadGame(saveGame(s)));
});
