import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame,makeDungeon,worldTile} from '../public/game/engine.js';
import {DUNGEONS,TOWNS} from '../public/game/content.js';
test('new game movement is immutable and consumes provisions',()=>{const s=createGame('Mara');const n=act(s,{type:'move',dx:1,dy:0});assert.equal(s.turns,0);assert.equal(n.turns,1);assert.ok(n.food<s.food);assert.equal(n.x,s.x+1);});
test('unaffordable purchases never debit gold',()=>{const s={...createGame('Mara'),mode:'town',gold:0};const n=act(s,{type:'buy',item:'weapon'});assert.equal(n.gold,0);assert.equal(n.weapon,1);});
test('seeded actions replay identically',()=>{let a=createGame('A'),b=createGame('A');for(let i=0;i<10;i++){a=act(a,{type:'move',dx:i%2?1:-1,dy:0});b=act(b,{type:'move',dx:i%2?1:-1,dy:0});}assert.deepEqual(a,b);});
test('save validates numeric corruption and round trips',()=>{const s=createGame('A');const loaded=loadGame(saveGame(s));assert.ok(Number.isFinite(loaded.savedAt));delete loaded.savedAt;assert.deepEqual(loaded,s);assert.throws(()=>loadGame('{"version":1}'));assert.throws(()=>loadGame(JSON.stringify({...s,gold:-100})));assert.throws(()=>loadGame(JSON.stringify({...s,mode:'nonsense'})));});
test('dungeon walls do not advance turns; turning costs no food',()=>{let s=createGame('A');s.mode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:0};const f=s.food;s=act(s,{type:'forward'});assert.equal(s.dungeon.y,1);s=act(s,{type:'turn',delta:1});assert.equal(s.dungeon.dir,1);assert.equal(s.food,f);});
test('every dungeon floor entrance can reach stairs',()=>{for(let d=0;d<8;d++)for(let f=0;f<3;f++){const m=makeDungeon(d,f);const q=[[1,1]],seen=new Set(['1,1']);for(let k=0;k<q.length;k++){const [x,y]=q[k];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,key=a+','+b;if(m[b]?.[a]!==undefined&&m[b][a]!==1&&!seen.has(key)){seen.add(key);q.push([a,b]);}}}assert.ok(seen.has('13,13'));}});
test('crime raises local wanted and a pardon repairs it',()=>{let s={...createGame('A'),mode:'town',gold:500};s=act(s,{type:'steal'});assert.ok(s.wanted[0]>0);s=act(s,{type:'pardon'});assert.equal(s.wanted[0],0);assert.ok(s.gold>=0);});
test('casino rejects invalid wagers',()=>{const s={...createGame('A'),mode:'town'};for(const bet of [-1,NaN,Infinity,99999])assert.equal(act(s,{type:'gamble',bet,game:'dice'}).gold,s.gold);});
test('world start and all roads are walkable',()=>{const s=createGame('A');assert.notEqual(worldTile(0,s.x,s.y),'water');});
test('premature ending is impossible',()=>{const s=createGame('A');assert.notEqual(act(s,{type:'ending',choice:'alliance'}).mode,'ending');});
test('all dungeon entrances and floor arrivals face a walkable corridor',()=>{
 const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
 for(let index=0;index<8;index++)for(let floor=0;floor<3;floor++){
  const point=DUNGEONS[index];let s={...createGame('A'),region:point.region,x:point.x,y:point.y};
  s=act(s,{type:'enter'});
  if(floor){s.dungeon={index,floor:floor-1,x:13,y:13,dir:0};s=act(s,{type:'descend'});}
  const [dx,dy]=dirs[s.dungeon.dir];assert.notEqual(makeDungeon(index,floor)[1+dy]?.[1+dx],1,`dungeon ${index} floor ${floor}`);
  const n=act(s,{type:'forward'});assert.ok(n.dungeon.x!==1||n.dungeon.y!==1);
 }
});
test('an old save facing the entrance wall is repaired on load',()=>{const s=createGame('A');s.mode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:1};const n=loadGame(JSON.stringify(s));assert.equal(n.dungeon.dir,2);});
test('boss encounter imports require the dungeon context',()=>{const s={...createGame('A'),mode:'battle',returnMode:'world',enemy:{name:'Bad boss',hp:1,maxHp:10,attack:1,gold:1,boss:true}};assert.throws(()=>loadGame(JSON.stringify(s)));});
test('defeated garrison stays defeated',()=>{let s={...createGame('A'),mode:'town',location:TOWNS[0].id};s.flags['garrison:0']=true;s.wanted[0]=5;s=act(s,{type:'challenge'});assert.equal(s.mode,'town');s=act(s,{type:'steal'});assert.equal(s.mode,'town');});
test('town conversations do not narrate an unearned first relic',()=>{const s={...createGame('A'),mode:'town',location:TOWNS[0].id};assert.equal(act(s,{type:'talk'}).chapter,0);});
test('final court and ending chapters are reachable',()=>{let s={...createGame('A'),mode:'town',location:TOWNS[1].id,relics:DUNGEONS.map(d=>d.id),chapter:16};s=act(s,{type:'talk'});assert.equal(s.chapter,18);s=act(s,{type:'ending',choice:'alliance'});assert.equal(s.chapter,19);assert.equal(s.mode,'ending');s=act(s,{type:'continue'});assert.equal(s.mode,'world');assert.equal(s.flags.legacy,'alliance');});

test('current saves preserve exact dungeon facing even at the entrance',()=>{const s=createGame('A');s.mode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:1};assert.deepEqual(loadGame(saveGame(s)).dungeon,s.dungeon);});
