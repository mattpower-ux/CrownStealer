import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../public/game/engine.js';
function burrow(){let s=engine.createGame();const site=engine.minorSiteList(s).find(p=>p.minorKind==='koboldCave'&&p.guarded);Object.assign(s,{x:site.x,y:site.y});s=engine.act(s,{type:'enter'});Object.assign(s.dungeon,{x:13,y:10,dir:2});return s;}
test('guarded burrow shows its living guardian three squares away and engages at that distance',()=>{const s=burrow();assert.equal(typeof engine.visibleDungeonGuardian,'function');const sight=engine.visibleDungeonGuardian(s);assert.equal(sight.distance,3);assert.match(sight.enemy.name,/Kobold/);const next=engine.act(s,{type:'engageGuardian'});assert.equal(next.mode,'battle');assert.equal(next.enemy.combatDistance,3);assert.ok([0,2].includes(next.enemy.surpriseShotsRemaining));assert.equal(s.mode,'dungeon');});
test('guard sight requires forward clear passage and disappears after victory',()=>{const s=burrow();assert.equal(typeof engine.visibleDungeonGuardian,'function');s.dungeon.dir=0;assert.equal(engine.visibleDungeonGuardian(s),null);s.dungeon.dir=2;s.flags['minorCleared:'+s.dungeon.minorId]=true;assert.equal(engine.visibleDungeonGuardian(s),null);assert.equal(engine.act(s,{type:'engageGuardian'}).mode,'dungeon');});

test('guardian remains visible beside the centerline but never beyond four squares',()=>{const s=burrow();Object.assign(s.dungeon,{x:12,y:10,dir:2});assert.ok(engine.visibleDungeonGuardian(s));Object.assign(s.dungeon,{x:13,y:8,dir:2});assert.equal(engine.visibleDungeonGuardian(s),null);});
import {enterRoadsideCrypt} from '../public/game/roadside-crypt.js';
import {dungeonChests} from '../public/game/treasure.js';
test('crypt and sewer guardians share visible targeting and cleared-state suppression',()=>{
 for(const kind of ['crypt','sewer']){
  const s=engine.createGame();if(kind==='crypt')enterRoadsideCrypt(s);else{s.mode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:1,royal:'sewer'};}
  const map=engine.dungeonMap(s.dungeon),chest=dungeonChests(s,map)[0];let sight;
  for(const [dir,[dx,dy]] of engine.DIRS.entries()){
   const x=chest.x-dx*2,y=chest.y-dy*2;if(map[y]?.[x]===undefined||map[y][x]===1)continue;
   Object.assign(s.dungeon,{x,y,dir});sight=engine.visibleDungeonGuardian(s);if(sight)break;
  }
  assert.ok(sight,kind);assert.equal(sight.distance,2);assert.equal(engine.act(s,{type:'engageGuardian'}).enemy.speciesId,sight.enemy.speciesId);
  s.flags[kind==='crypt'?'cryptCleared:'+s.dungeon.cryptId:'sewerSpiderDefeated']=true;assert.equal(engine.visibleDungeonGuardian(s),null);
 }
});
test('visible guardian targeting does not advance the random stream and saves preserve engaged distance',()=>{const s=burrow(),rng=s.rng;for(let i=0;i<10;i++)engine.visibleDungeonGuardian(s);assert.equal(s.rng,rng);const next=engine.act(s,{type:'engageGuardian'});assert.equal(engine.loadGame(engine.saveGame(next)).enemy.combatDistance,3);});

