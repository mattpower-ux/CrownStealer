import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame,minorSiteList,pointAt,dungeonMap,worldTile,DIRS} from '../public/game/engine.js';
import {dungeonChests} from '../public/game/treasure.js';
import {dungeonFloors} from '../public/game/dungeon-depths.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {areaTile} from '../public/game/exploration.js';
import {enterRoadsideCrypt} from '../public/game/roadside-crypt.js';
import {PUTRID_PALACE} from '../public/game/royal-trials.js';

function enterSite(predicate,branch=false){let s=createGame();if(branch)s.exploration={area:'wild-0',artifacts:[],home:{region:0,x:64,y:4}};const site=minorSiteList(s).find(predicate);assert.ok(site);Object.assign(s,{x:site.x,y:site.y});assert.equal(pointAt(s).kind,'minorSite');s=act(s,{type:'enter'});return {s,site};}
test('unmarked sites enter, save and return to the same spot in main and branch wilderness',()=>{
 for(const branch of [false,true]){
  let {s,site}=enterSite(p=>p.minorKind==='koboldCave',branch);
  assert.equal(s.dungeon.minorId,site.id);assert.equal(dungeonFloors(s.dungeon),1);s=loadGame(saveGame(s));
  s=act(s,{type:'leave'});assert.equal(s.mode,'world');assert.deepEqual([s.x,s.y],[site.x,site.y]);
  assert.equal(s.exploration?.area??null,branch?'wild-0':null);
 }
});
test('mounted branch travel stops on minor site entrances instead of stepping over them',()=>{
 const s={...createGame(),exploration:{area:'wild-0',artifacts:[],home:{region:0,x:64,y:4}}};
 const walkable=(x,y)=>!['water','mountain'].includes(areaTile(s,x,y));
 const site=minorSiteList(s).find(p=>p.minorKind==='koboldCave'&&walkable(p.x-1,p.y)&&walkable(p.x+1,p.y));
 assert.ok(site);
 s.flags.mount='horse';
 Object.assign(s,{x:site.x-1,y:site.y});
 const entrance=act(s,{type:'move',dx:1,dy:0},[],{noRandom:true});
 assert.deepEqual([entrance.x,entrance.y],[site.x,site.y]);
 assert.equal(act(entrance,{type:'enter'}).dungeon.minorId,site.id);
});
test('unguarded shrine treasure persists and cannot be opened twice',()=>{
 let {s}=enterSite(p=>p.minorKind==='ruinedShrine'&&!p.guarded&&p.treasure&&!p.trapped);
 let chest=dungeonChests(s,dungeonMap(s.dungeon))[0];s.dungeon.x=chest.x;s.dungeon.y=chest.y;
 s=act(s,{type:'openChest'});const gold=s.gold;assert.ok(s.openedChests.includes(chest.id));
 s=act(loadGame(saveGame(s)),{type:'openChest'});assert.equal(s.gold,gold);assert.equal(s.relics.length,0);
});
test('guarded empty shrines have a real guardian but no invented treasure or relic',()=>{
 let {s,site}=enterSite(p=>p.minorKind==='ruinedShrine'&&p.guarded&&!p.treasure&&!p.trapped);
 assert.deepEqual(dungeonChests(s,dungeonMap(s.dungeon)),[]);s.dungeon.x=12;s.dungeon.y=13;s.dungeon.dir=1;
 s=act(s,{type:'forward'});assert.equal(s.mode,'battle');assert.equal(s.enemy.minorGuardian,site.id);
 s=loadGame(saveGame(s));s.enemy.combatDistance=1;s.enemy.hp=1;s.rng=187441;s=act(s,{type:'attack'});
 assert.equal(s.flags['minorCleared:'+site.id],true);assert.equal(s.relics.length,0);
});
test('cemetery floors use normal ladders and retain their site identity',()=>{
 let {s,site}=enterSite(p=>p.minorKind==='cemetery'&&p.floors===3);
 for(let floor=0;floor<2;floor++){const ladder=dungeonLadders(s.dungeon,dungeonMap(s.dungeon)).find(p=>p.direction==='down');Object.assign(s.dungeon,{x:ladder.x,y:ladder.y});s=act(s,{type:'descend'});assert.equal(s.dungeon.floor,floor+1);s=loadGame(saveGame(s));assert.equal(s.dungeon.minorId,site.id);}
});
test('trapped shrine bait is consumed once and does not invent rewards',()=>{
 let {s}=enterSite(p=>p.minorKind==='ruinedShrine'&&!p.guarded&&!p.treasure&&p.trapped);const gold=s.gold;
 const chest=dungeonChests(s,dungeonMap(s.dungeon))[0];Object.assign(s.dungeon,{x:chest.x,y:chest.y});
 s=act(s,{type:'openChest'});assert.ok(s.openedChests.includes(chest.id));assert.equal(s.gold,gold);
 const hp=s.hp;s=act(loadGame(saveGame(s)),{type:'openChest'});assert.equal(s.hp,hp);
 Object.assign(s.dungeon,{x:1,y:1});
 s=act(s,{type:'leave'});
 assert.equal(s.mode,'world');
 s=loadGame(saveGame(act(s,{type:'enter'})));
 Object.assign(s.dungeon,{x:chest.x,y:chest.y});
 s=act(s,{type:'rummageChest'});
 assert.equal(s.gold,gold);
 assert.equal(s.flags['missedCoins:'+chest.id],undefined);
});

test('mountain tunnel checkpoints preserve both directions in the main and branch wilderness',()=>{
 for(const branch of [false,true]){
  const {s,site}=enterSite(p=>p.minorKind==='tunnel',branch);
  const checkpoint=state=>loadGame(saveGame(state));
  let inside=checkpoint(s);
  assert.deepEqual(inside.dungeon.tunnelExit,site.other);
  assert.equal(dungeonFloors(inside.dungeon),1);
  assert.deepEqual(dungeonChests(inside,dungeonMap(inside.dungeon)),[]);
  for(const entrance of [{x:site.x,y:site.y},site.other]){
   assert.deepEqual([inside.x,inside.y],[entrance.x,entrance.y]);
   const exit=inside.dungeon.tunnelExit;
   Object.assign(inside.dungeon,{x:13,y:13});
   const surface=checkpoint(act(checkpoint(inside),{type:'descend'}));
   assert.deepEqual([surface.mode,surface.x,surface.y],['world',exit.x,exit.y]);
   assert.equal(surface.dungeon,null);
   assert.deepEqual(surface.exploration,s.exploration);
   assert.equal(pointAt(surface).id,site.id);
   inside=checkpoint(act(surface,{type:'enter'}));
   assert.deepEqual(inside.dungeon.tunnelExit,entrance);
  }
  assert.deepEqual([inside.x,inside.y],[site.x,site.y]);
 }
});

test('minor dungeon saves reject invalid site identities, entry anchors and tunnel destinations',()=>{
 const {s:cave}=enterSite(p=>p.minorKind==='koboldCave');
 const {s:tunnel}=enterSite(p=>p.minorKind==='tunnel',true);
 for(const [valid,mutate] of [
  [cave,s=>{s.dungeon.minorId='minor-r0-25';}],
  [cave,s=>{s.dungeon.minorId='minor-w0-0';}],
  [cave,s=>{s.dungeon.index=1;}],
  [cave,s=>{s.dungeon.floor=1;}],
  [cave,s=>{s.x++;}],
  [cave,s=>{s.dungeon.tunnelExit={x:1,y:1};}],
  [tunnel,s=>{delete s.dungeon.tunnelExit;}],
  [tunnel,s=>{s.dungeon.tunnelExit.x=s.x;s.dungeon.tunnelExit.y=s.y;}],
 ]){
  const invalid=structuredClone(valid);
  mutate(invalid);
  assert.throws(()=>loadGame(saveGame(invalid)),/invalid (?:dungeon position|forest site|minor site)/i);
 }
});

test('minor wilderness progress rejects unknown sites and impossible chest floors',()=>{
 for(const [mutate,message] of [
  [s=>{s.flags.minorDiscovered=['minor-w12-0'];},/wilderness discoveries/i],
  [s=>{s.flags.minorDiscovered=['minor-r0-0','minor-r0-0'];},/wilderness discoveries/i],
  [s=>{s.flags['minorCleared:minor-r0-25']=true;},/minor guardian progress/i],
  [s=>{s.flags['minorCleared:minor-r0-24']=true;},/minor guardian progress/i],
  [s=>{s.flags['minorCleared:minor-r0-0']=false;},/minor guardian progress/i],
  [s=>{s.openedChests.push('minor:minor-r0-5:0');},/chest progress/i],
  [s=>{s.openedChests.push('minor:minor-r0-4:0');},/chest progress/i],
  [s=>{s.openedChests.push('minor:minor-r0-24:0');},/chest progress/i],
 ]){
  const invalid=createGame();
  mutate(invalid);
  assert.throws(()=>loadGame(saveGame(invalid)),message);
 }
});

test('minor guardians must belong to a guarded final chamber in dungeon combat',()=>{
 const {s:cave}=enterSite(p=>p.minorKind==='koboldCave');
 const {s:tunnel}=enterSite(p=>p.minorKind==='tunnel');
 const stray={...cave,mode:'world'};
 assert.throws(()=>loadGame(saveGame(stray)),/minor dungeon mode/i);
 for(const [state,guardian] of [[tunnel,tunnel.dungeon.minorId],[cave,'minor-r0-2']]){
  const invalid={
   ...state,mode:'battle',returnMode:'dungeon',
   enemy:{name:'Invalid guardian',hp:10,maxHp:10,attack:1,gold:1,minorGuardian:guardian},
  };
  assert.throws(()=>loadGame(saveGame(invalid)),/minor guardian/i);
 }
});

test('pre-terrain saves stranded by new mountains or water relocate once to nearby dry ground',()=>{
 for(const [x,y,terrain] of [[43,70,'mountain'],[83,54,'water']]){
  assert.equal(worldTile(0,x,y),terrain);
  const legacy={...createGame(),x,y};
  delete legacy.wildernessTerrainVersion;
  const restored=loadGame(saveGame(legacy));
  assert.equal(restored.wildernessTerrainVersion,2);
  assert.notDeepEqual([restored.x,restored.y],[x,y]);
  assert.ok(!['water','mountain'].includes(worldTile(0,restored.x,restored.y)));
  const reloaded=loadGame(saveGame(restored));
  assert.deepEqual([reloaded.x,reloaded.y],[restored.x,restored.y]);
  assert.deepEqual(reloaded.log,restored.log);
 }
});

test('legacy terrain migration frees a branch traveler stranded on an isolated dry tile',()=>{
 const legacy={...createGame(),region:2,x:89,y:12,exploration:{area:'wild-7',artifacts:[],home:{region:2,x:64,y:88}}};
 delete legacy.wildernessTerrainVersion;
 assert.equal(areaTile(legacy,legacy.x,legacy.y),'forest');
 assert.ok(DIRS.every(([dx,dy])=>['water','mountain'].includes(areaTile(legacy,legacy.x+dx,legacy.y+dy))));
 const restored=loadGame(saveGame(legacy));
 assert.deepEqual(restored.exploration,legacy.exploration);
 assert.notDeepEqual([restored.x,restored.y],[legacy.x,legacy.y]);
 assert.ok(DIRS.some(([dx,dy])=>{
  const moved=act(restored,{type:'move',dx,dy},[],{noRandom:true});
  return moved.x!==restored.x||moved.y!==restored.y;
 }));
});

test('legacy Pelagos walkers relocate from changed coastal terrain onto the mainland',()=>{
 const region=2,legacy={...createGame(),region,x:84,y:2};
 delete legacy.wildernessTerrainVersion;
 const walkable=(x,y)=>!['water','mountain'].includes(worldTile(region,x,y));
 assert.equal(worldTile(region,legacy.x,legacy.y),'water');

 const mainland=[{x:64,y:48}],seen=new Set(['64,48']);
 for(const {x,y} of mainland)for(const [dx,dy] of DIRS){
  const nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(seen.has(key)||!walkable(nx,ny))continue;
  seen.add(key);
  mainland.push({x:nx,y:ny});
 }
 assert.ok(!seen.has(legacy.x+','+legacy.y));
 const restored=loadGame(saveGame(legacy));
 assert.ok(seen.has(restored.x+','+restored.y));

 const sailor=loadGame(saveGame({...legacy,flags:{...legacy.flags,sailboatReady:true}}));
 assert.deepEqual([sailor.x,sailor.y],[legacy.x,legacy.y]);
});

test('legacy roadside crypt saves relocate the surface exit while preserving local coordinates',()=>{
 const legacy={...createGame(),x:43,y:70};
 delete legacy.wildernessTerrainVersion;
 enterRoadsideCrypt(legacy);
 legacy.dungeon.y=2;
 const restored=loadGame(saveGame(legacy));
 assert.deepEqual(restored.dungeon,legacy.dungeon);
 assert.notDeepEqual([restored.x,restored.y],[legacy.x,legacy.y]);
 const surface=act(act(restored,{type:'back'}),{type:'leave'});
 assert.equal(surface.mode,'world');
 assert.ok(!['water','mountain'].includes(worldTile(surface.region,surface.x,surface.y)));
});

test('a saved Immobilize effect continues counting down in a minor guardian battle',()=>{
 const {s}=enterSite(p=>p.minorKind==='koboldCave');
 s.level=3;
 s.bag.push('scroll-immobilize');
 Object.assign(s.dungeon,{x:13,y:13});
 let battle=act(s,{type:'openChest'});
 assert.equal(battle.mode,'battle');
 battle=act(battle,{type:'useItem',id:'scroll-immobilize'});
 assert.equal(battle.enemy.frozen,2);
 const resumed=loadGame(saveGame(battle));
 assert.equal(resumed.enemy.frozen,2);
 assert.equal(act(resumed,{type:'guard'}).enemy.frozen,1);
});

test('the Putrid Palace remains an enterable campaign landmark among minor sites',()=>{
 const {region,x,y,id}=PUTRID_PALACE;
 const outdoor={...createGame(),region,x,y};
 assert.equal(pointAt(outdoor)?.id,id);
 assert.ok(minorSiteList(outdoor).every(site=>site.x!==x||site.y!==y));
 const palace=act(outdoor,{type:'enter'});
 assert.equal(palace.mode,'dungeon');
 assert.equal(palace.dungeon.site,id);
 assert.equal(loadGame(saveGame(palace)).dungeon.site,id);
});
