import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {INNKEEPERS,innkeeperFor} from '../public/game/inn.js';
function guest(gold=20){const s=createGame();s.mode='town';s.location=TOWNS[0].id;s.gold=gold;s.hp=10;return s;}
test('each town has a unique proprietor, portrait panel and recording',()=>{assert.equal(INNKEEPERS.length,TOWNS.length);assert.equal(new Set(TOWNS.map(t=>innkeeperFor(t.id).name)).size,TOWNS.length);assert.equal(new Set(TOWNS.map(t=>innkeeperFor(t.id).audio)).size,TOWNS.length);assert.equal(innkeeperFor(TOWNS[0].id).name,'Dave the Dogged');});
test('paid stays restore health and record a new wake-up once per stay',()=>{let s=act(guest(),{type:'rest'});assert.equal(s.gold,12);assert.equal(s.hp,s.maxHp);assert.equal(s.flags.innStayCount,1);assert.equal(s.flags.innStayTown,TOWNS[0].id);s=loadGame(saveGame(s));s=act(s,{type:'rest'});assert.equal(s.flags.innStayCount,2);});
test('kitchen work does not trigger the paid-stay wake-up scene',()=>{const s=act(guest(2),{type:'rest'});assert.equal(s.flags.innStayCount,undefined);assert.equal(s.gold,2);});
