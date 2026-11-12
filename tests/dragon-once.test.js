import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {captureDragon,waitingDragonCheck} from '../public/game/dragon.js';
import {townPlaces} from '../public/game/town.js';
test('a level-one adventurer can purchase and equip a dragon',()=>{
 let s=createGame();s.mode='town';s.location='mothbridge';s.gold=25000;
 const shop=townPlaces(s).find(p=>p.id==='mount-shop');s.townPosition={x:shop.x,y:shop.y};
 s=act(s,{type:'buyMount',id:'dragon'});assert.ok(s.flags.mounts.includes('dragon'));assert.equal(s.gold,0);
 s=act(s,{type:'equipMount',id:'dragon'});assert.equal(s.flags.mount,'dragon');
});
test('dragon theft is recorded permanently and cannot recur after return or reload',()=>{
 const s=createGame();s.flags.mounts=['dragon'];s.flags.mount='dragon';
 assert.equal(captureDragon(s),true);assert.equal(s.flags.dragonTheftOccurred,true);
 s.flags.dragonCaptured=false;s.flags.mount='dragon';
 const restored=loadGame(saveGame(s));assert.equal(captureDragon(restored),false);
 restored.mode='dungeon';restored.flags.dragonWatch={hp:350,maxHp:350,moves:12};
 assert.equal(waitingDragonCheck(restored,0),false);
});
test('older dragon captures and completed rescues retain one-time theft protection',()=>{
 for(const flag of ['dragonCaptured','drakeDefeated']){const s=createGame();s.flags[flag]=true;assert.equal(loadGame(saveGame(s)).flags.dragonTheftOccurred,true);}
});
