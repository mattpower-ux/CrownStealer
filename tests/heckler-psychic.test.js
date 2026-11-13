import test from 'node:test';
import assert from 'node:assert/strict';
import {ROYAL_DUNGEON_ID} from '../public/game/royal-dungeon.js';
import {createGame,act} from '../public/game/engine.js';
function encounter(){const s=createGame();s.mode='battle';s.returnMode='world';s.hp=s.maxHp=500;s.enemy={speciesId:'royal-heckler',royalDungeonNpc:'royal-heckler',name:'Royal Heckler',level:7,hp:1000,maxHp:1000,attack:14,armor:3,kind:'npc',gold:0};return s;}
function strike(s){const events=[];const after=act(s,{type:'guard'},events);return {after,events,hit:events.find(e=>e.mental)};}
test('Heckler mental taunt carries ordered voice, crackle and actual HP damage in one combat event',()=>{
 let s=encounter();for(let i=0;i<9;i++){s.hp=500;const {after,events,hit}=strike(s);assert.ok(hit?.amount>0);assert.equal(hit.voice,'royal-heckler-'+i%8);assert.equal(hit.sound,'psychic-crackle');assert.equal(hit.target,'hero');assert.equal(events.filter(e=>e.voice).length,1);assert.equal(after.hp,500-hit.amount);s=after;}
});
test('mental damage bypasses armor, shield blocks and dexterity evasion but Wisdom reduces it',()=>{
 const plain=encounter(),armored=structuredClone(plain),wise=structuredClone(plain);plain.equippedArmor=null;armored.equippedArmor='legendary-armor-3';armored.bag.push('legendary-armor-3','shield-frostburn');armored.equippedShield='shield-frostburn';armored.attributes.dexterity=50;wise.attributes.wisdom=50;
 for(let seed=1;seed<30;seed++){for(const s of [plain,armored,wise])s.rng=seed*7919;const base=strike(plain).hit,protectedHit=strike(armored).hit,wiseHit=strike(wise).hit;assert.ok(base&&protectedHit&&wiseHit);assert.equal(protectedHit.amount,base.amount);assert.ok(wiseHit.amount<=base.amount);}
 assert.ok(strike(wise).hit.amount<strike(plain).hit.amount);
});

test('ordinary conversation rotates the Heckler voice without damage or electrical attack sound',()=>{
 const s=createGame();s.mode='dungeon';s.dungeon={site:ROYAL_DUNGEON_ID,index:0,floor:0,x:7,y:2,dir:2};const events=[];const next=act(s,{type:'royalDungeonTalk',id:'royal-heckler'},events);
 assert.equal(next.hp,s.hp);assert.equal(events.find(e=>e.voice)?.voice,'royal-heckler-0');assert.equal(events.some(e=>e.mental||e.sound==='psychic-crackle'),false);
});
