import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../public/game/engine.js';
import {startWildernessEvent,wildernessEventAction,WILDERNESS_EVENT_CHANCE} from '../public/game/wilderness-events.js';
const context=(roll=0)=>({note:(s,t)=>s.log.push(t),random:()=>roll,recover:s=>{s.flags.rescuePending=true;s.hp=s.maxHp;},enterCrypt:s=>{s.mode='dungeon';s.dungeon={site:'roadside-crypt'};}});
test('rare hazards are less frequent than normal NPC encounters and nail damage stays in range',()=>{
 assert.ok(WILDERNESS_EVENT_CHANCE<.07);for(const roll of [0,.999]){const s=createGame(),hp=s.hp;startWildernessEvent(s,'nail',context(roll));assert.ok(hp-s.hp>=5&&hp-s.hp<=10);}
});
test('a survivable fall enters a crypt and a lethal one recovers instead',()=>{
 const s=createGame();startWildernessEvent(s,'hole',context());assert.equal(s.hp,60);assert.equal(s.dungeon.site,'roadside-crypt');
 const weak=createGame();weak.hp=1;startWildernessEvent(weak,'hole',context(.999));assert.equal(weak.flags.rescuePending,true);assert.equal(weak.dungeon,null);
});
test('branch holds position for ten moves and inflicts ten to one hundred total damage',()=>{
 const s=createGame();s.hp=s.maxHp=200;startWildernessEvent(s,'branch',context());const pos=[s.x,s.y];
 for(let i=0;i<10;i++)assert.equal(wildernessEventAction(s,{type:'move',dx:1,dy:0},context()),true);
 assert.deepEqual([s.x,s.y],pos);assert.equal(s.hp,190);assert.equal(s.flags.impaledMoves,undefined);assert.equal(wildernessEventAction(s,{type:'move',dx:1,dy:0},context()),false);
});
test('buried hoard can be left or taken once; genuine gold is 50 to 100',()=>{
 const s=createGame();startWildernessEvent(s,'hoard',context());const gold=s.gold;
 wildernessEventAction(s,{type:'wildernessChoice',choice:'take'},context());assert.equal(s.gold,gold+50);assert.ok(s.bag.includes('small-emerald'));
 wildernessEventAction(s,{type:'wildernessChoice',choice:'take'},context());assert.equal(s.gold,gold+50);
 startWildernessEvent(s,'hoard',context());wildernessEventAction(s,{type:'wildernessChoice',choice:'leave'},context());assert.equal(s.flags.wildernessEvent,undefined);
});
test('Bawb sells a shrinkable sailboat only for 700 gold, without duplicate purchases',()=>{
 const s=createGame();startWildernessEvent(s,'bawb',context());s.gold=699;
 wildernessEventAction(s,{type:'wildernessChoice',choice:'buy'},context());assert.equal(s.gold,699);assert.equal(s.flags.wildernessEvent.kind,'bawb');
 s.gold=700;wildernessEventAction(s,{type:'wildernessChoice',choice:'buy'},context());assert.equal(s.gold,0);assert.ok(s.bag.includes('shrinkable-sailboat'));assert.equal(s.flags.wildernessEvent,undefined);
});
