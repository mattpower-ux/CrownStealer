import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {statsView} from '../public/game/hero-stats.js';
const hurt=()=>{const s=createGame();s.hp=1;return s;};
test('wilderness recovers gradually by constitution and preserves partial progress through saves',()=>{
 let s=hurt();s=act(s,{type:'clockTick',elapsedMs:9999});assert.equal(s.hp,1);
 s=act(loadGame(saveGame(s)),{type:'clockTick',elapsedMs:1});assert.equal(s.hp,3);
 const strong=hurt();strong.attributes.constitution=50;const next=act(strong,{type:'clockTick',elapsedMs:10000});assert.equal(next.hp-strong.hp,10);
 assert.match(statsView(s),/Wilderness recovery<\/dt><dd>2 HP \/ 10\.0 seconds/);
 assert.match(statsView(strong),/Wilderness recovery<\/dt><dd>2 HP \/ 2\.0 seconds/);
});
test('wilderness recovery pauses indoors and in combat and ignores invalid elapsed time',()=>{
 for(const mode of ['town','dungeon','battle','ending']){const s=hurt();s.mode=mode;assert.equal(act(s,{type:'clockTick',elapsedMs:10000}).hp,1);}
 for(const elapsedMs of [-1,NaN,Infinity,3600001])assert.equal(act(hurt(),{type:'clockTick',elapsedMs}).hp,1);
});
test('wilderness recovery caps health and cannot bank healing at full health',()=>{
 let s=createGame();s=act(s,{type:'clockTick',elapsedMs:9000});s.hp-=1;
 s=act(s,{type:'clockTick',elapsedMs:1000});assert.equal(s.hp,s.maxHp-1);
 s=act(s,{type:'clockTick',elapsedMs:60000});assert.equal(s.hp,s.maxHp);assert.equal(s.wildernessHealProgress,0);
});
test('constitution gear increases recovery and malformed saved progress is rejected',()=>{
 const s=hurt();s.bag.push('ring-toughness-5');s.equippedRing='ring-toughness-5';
 assert.equal(act(s,{type:'clockTick',elapsedMs:20000}).hp,7);
 for(const value of [-1,1,Infinity,'0.5']){s.wildernessHealProgress=value;assert.throws(()=>loadGame(saveGame(s)),/recovery/i);}
});
