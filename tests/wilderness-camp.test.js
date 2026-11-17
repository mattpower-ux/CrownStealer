import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,saveGame,loadGame} from '../public/game/engine.js';
import {campAmbushChance,idleEncounterChance} from '../public/game/wilderness-camp.js';
test('camp heals only if sleep is uninterrupted and advances one night',()=>{const s=createGame();s.mode='world';s.hp=10;s.rng=50000;const next=act(s,{type:'setCamp'},[],{noEncounters:true});assert.equal(next.hp,next.maxHp);assert.ok(next.worldTimeMs>s.worldTimeMs);});
test('guarded sleep is consumed once and protects exactly the next camp',()=>{let s=createGame();s.mode='world';s.level=5;s.bag.push('scroll-guarded-sleep');s=act(s,{type:'equipMagic',id:'scroll-guarded-sleep'});s=act(s,{type:'useMagic'});assert.ok(!s.bag.includes('scroll-guarded-sleep'));assert.equal(s.flags.guardedSleep,true);assert.equal(campAmbushChance(s),.025);s=act(loadGame(saveGame(s)),{type:'setCamp'},[],{noEncounters:true});assert.equal(s.flags.guardedSleep,undefined);assert.equal(campAmbushChance(s),.25);});
test('idle encounter chance is exactly half of travel chance',()=>{for(const chance of [.08,.12,.02])assert.equal(idleEncounterChance(chance),chance/2);});
test('camping is unavailable in towns and combat',()=>{for(const mode of ['town','battle']){const s=createGame();s.mode=mode;s.hp=10;const n=act(s,{type:'setCamp'});assert.equal(n.hp,10);}});

test('an actual camp ambush starts visible combat and grants no health',()=>{let ambushed;for(let seed=1;seed<100&&!ambushed;seed++){const s=createGame();s.mode='world';s.hp=10;s.rng=seed;const n=act(s,{type:'setCamp'});if(n.mode==='battle')ambushed=n;}assert.ok(ambushed?.enemy);assert.equal(ambushed.hp,10);assert.match(ambushed.log.at(-1),/regain no health/);});
