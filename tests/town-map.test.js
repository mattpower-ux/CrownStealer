import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
test('town movement uses local coordinates, walls block, gate exits to preserved world position',()=>{
 let s=createGame();s.x=TOWNS[0].x;s.y=TOWNS[0].y;s=act(s,{type:'enter'});
 assert.deepEqual(s.townPosition,{x:6,y:11});const world=[s.x,s.y];
 s=act(s,{type:'move',dx:0,dy:-1});assert.deepEqual(s.townPosition,{x:6,y:10});assert.deepEqual([s.x,s.y],world);
 s.townPosition={x:1,y:10};s=act(s,{type:'move',dx:-1,dy:0});assert.deepEqual(s.townPosition,{x:1,y:10});
 s.townPosition={x:3,y:5};s=act(s,{type:'move',dx:0,dy:-1});assert.deepEqual(s.townPosition,{x:3,y:5});
 assert.deepEqual(loadGame(saveGame(s)).townPosition,s.townPosition);
 s.townPosition={x:6,y:11};s=act(s,{type:'move',dx:0,dy:1});assert.equal(s.mode,'world');assert.deepEqual([s.x,s.y],world);
});
test('old town saves receive a safe entrance position and malformed positions are rejected',()=>{
 let s=createGame();s.mode='town';s.location=TOWNS[0].id;delete s.townPosition;assert.deepEqual(loadGame(saveGame(s)).townPosition,{x:6,y:11});
 s.townPosition={x:-3,y:9};assert.throws(()=>loadGame(saveGame(s)),/town position/i);
});
