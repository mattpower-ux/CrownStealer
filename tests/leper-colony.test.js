import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,pointAt,saveGame,loadGame} from '../public/game/engine.js';
import {WILD_SITES} from '../public/game/wild-sites.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {DAY_MS} from '../public/game/world-clock.js';
function colony(){const s=createGame();Object.assign(s,{x:28,y:28,hp:1,gold:20});return s;}
test('one Leper Colony near Mothbridge is enterable without becoming a dungeon',()=>{const sites=WILD_SITES.filter(p=>p.id==='leper-colony');assert.equal(sites.length,1);const s=colony();assert.equal(pointAt(s)?.id,'leper-colony');const next=act(s,{type:'enter'});assert.equal(next.mode,'world');assert.match(next.log.at(-1),/priest/i);});
test('one gold restores health to half maximum repeatedly, with no charge above the cap',()=>{let s=colony();s=act(s,{type:'colonyHealing'});assert.equal(s.hp,Math.floor(s.maxHp/2));assert.equal(s.gold,19);s.hp=1;s=act(s,{type:'colonyHealing'});assert.equal(s.gold,18);assert.equal(s.hp,Math.floor(s.maxHp/2));s.hp=s.maxHp-1;const rng=s.rng;s=act(s,{type:'colonyHealing'});assert.equal(s.gold,18);assert.equal(s.hp,s.maxHp-1);assert.equal(s.rng,rng);});
test('colony healing cannot be purchased elsewhere or without gold',()=>{let s=colony();s.gold=0;assert.equal(act(s,{type:'colonyHealing'}).hp,1);s.gold=10;s.x++;assert.equal(act(s,{type:'colonyHealing'}).gold,10);});
test('leprosy persists through saves and only the rescued White Wizard can cure it',()=>{let s=colony();s.flags.leprosy=true;s=loadGame(saveGame(s));assert.equal(s.flags.leprosy,true);assert.equal(act(s,{type:'cureLeprosy'}).flags.leprosy,true);s.mode='dungeon';s.dungeon={site:'twinklestar-tower',index:6,floor:8,x:13,y:13,dir:0};assert.equal(act(s,{type:'cureLeprosy'}).flags.leprosy,true);s.flags.twinklestarGuardianDefeated=true;s.flags.wizardApprentice='rejected';s.gold=5000;s=act(s,{type:'cureLeprosy'});assert.equal(s.flags.leprosy,undefined);assert.match(s.log.at(-1),/cures your leprosy/i);});
import {colonyAction} from '../public/game/leper-colony.js';
test('each successful treatment rolls exactly the one-percent infection threshold',()=>{
 for(const roll of [0,.009999,.01,.5,.9999]){const s=colony(),events=[];let calls=0;colonyAction(s,{type:'colonyHealing'},{random:()=>{calls++;return roll;},note:(s,text)=>s.log.push(text),events});assert.equal(calls,1);assert.equal(!!s.flags.leprosy,roll<.01);assert.equal(events[0].amount,39);if(roll<.01)assert.match(s.log.at(-1),/only the White Wizard/);}
});
test('normal healing cannot cure leprosy and malformed disease saves are rejected',()=>{const s=colony();s.flags.leprosy=true;s.bag.push('starter-healing');assert.equal(act(s,{type:'useItem',id:'starter-healing'}).flags.leprosy,true);s.flags.leprosy='yes';assert.throws(()=>loadGame(saveGame(s)),/leprosy/);});
test('the colony does not repeat in another region or branch wilderness',()=>{const s=colony();s.region=1;assert.notEqual(pointAt(s)?.id,'leper-colony');assert.equal(act(s,{type:'colonyHealing'}).hp,1);s.region=0;s.exploration={area:'wild-0',artifacts:[],home:{region:0,x:64,y:4}};assert.notEqual(pointAt(s)?.id,'leper-colony');assert.equal(act(s,{type:'colonyHealing'}).hp,1);});
test('leprosy loses one charisma per completed game week and cure restores the original score',()=>{
 let s=colony();s.attributes.charisma=15;s.flags.leprosy=true;s.flags.leprosySince=s.worldTimeMs;
 s.worldTimeMs+=7*DAY_MS-1;assert.equal(effectiveAttributes(s).charisma,15);
 s.worldTimeMs++;assert.equal(effectiveAttributes(s).charisma,14);
 s.worldTimeMs+=14*DAY_MS;s=loadGame(saveGame(s));assert.equal(effectiveAttributes(s).charisma,12);
 s.mode='dungeon';s.dungeon={site:'twinklestar-tower',index:6,floor:8,x:13,y:13,dir:0};s.flags.twinklestarGuardianDefeated=true;s.gold=5000;
 s=act(s,{type:'cureLeprosy'});assert.equal(s.gold,0);assert.equal(effectiveAttributes(s).charisma,15);assert.equal(s.flags.leprosySince,undefined);
});
test('White Wizard charges five thousand gold unless the patient is an active apprentice',()=>{
 const s=colony();s.flags.leprosy=true;s.flags.twinklestarGuardianDefeated=true;s.mode='dungeon';s.dungeon={site:'twinklestar-tower',index:6,floor:8,x:13,y:13,dir:0};s.gold=4999;
 const refused=act(s,{type:'cureLeprosy'});assert.equal(refused.flags.leprosy,true);assert.equal(refused.gold,4999);
 s.flags.wizardApprentice='accepted';s.gold=0;const free=act(s,{type:'cureLeprosy'});assert.equal(free.flags.leprosy,undefined);assert.equal(free.gold,0);
 s.flags.wizardApprentice='forsaken';assert.equal(act(s,{type:'cureLeprosy'}).flags.leprosy,true);
});
test('additional treatment does not reset the disease clock',()=>{
 const s=colony();s.flags.leprosy=true;s.flags.leprosySince=s.worldTimeMs;s.worldTimeMs+=8*DAY_MS;
 colonyAction(s,{type:'colonyHealing'},{random:()=>0,note:(s,text)=>s.log.push(text)});
 assert.equal(effectiveAttributes(s).charisma,9);
});
test('legacy infection starts a saved clock and game time advances the weekly loss',()=>{
 let s=colony();s.flags.leprosy=true;s=loadGame(saveGame(s));assert.equal(s.flags.leprosySince,s.worldTimeMs);
 s.worldTimeMs+=7*DAY_MS-48000;s=act(s,{type:'clockTick',elapsedMs:1000});assert.equal(effectiveAttributes(s).charisma,9);
 for(const value of [-1,Infinity,s.worldTimeMs+1]){s.flags.leprosySince=value;assert.throws(()=>loadGame(saveGame(s)),/leprosy onset/);}
});
