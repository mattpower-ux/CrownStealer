import test from 'node:test';
import assert from 'node:assert/strict';
import {dungeonMap} from '../public/game/engine.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {isWidowsBell,widowsBellArrowSlitInk,widowsBellHasBrokenBell} from '../public/game/widows-bell.js';

test('Widow’s Bell is the ascending regular dungeon',()=>{
 assert.equal(isWidowsBell({index:1,floor:0}),true);
 assert.equal(isWidowsBell({index:0,floor:0}),false);
 assert.equal(isWidowsBell({index:1,floor:0,site:'minor-site'}),false);
});

test('Widow’s Bell ladders retain engine directions but describe tower stairs',()=>{
 const ground={index:1,floor:0},groundLadders=dungeonLadders(ground,dungeonMap(ground));
 assert.equal(groundLadders.find(l=>l.direction==='down').towerDirection,'up');
 assert.equal(groundLadders.find(l=>l.direction==='up').towerDirection,'exit');
 const upper={index:1,floor:1},upperLadders=dungeonLadders(upper,dungeonMap(upper));
 assert.equal(upperLadders.find(l=>l.direction==='down').towerDirection,'up');
 assert.equal(upperLadders.find(l=>l.direction==='up').towerDirection,'down');
});

test('arrow slits admit pale daylight and the broken bell belongs only on level ten',()=>{
 assert.match(widowsBellArrowSlitInk(2,.5,.5),/^#/);
 assert.equal(widowsBellArrowSlitInk(2,.2,.5),null);
 assert.equal(widowsBellHasBrokenBell({index:1,floor:9}),true);
 assert.equal(widowsBellHasBrokenBell({index:1,floor:8}),false);
});
