import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {buildEncounter,encounterPool} from '../public/game/encounters.js';
import {MONSTER_BY_ID,monsterStats} from '../public/game/bestiary.js';
function planet(p=0,floor=0,cave=2){const s=createGame();s.region=p+1;s.mode='dungeon';s.returnMode='dungeon';s.exploration={area:'planet-'+p,artifacts:[],home:{region:0,x:5,y:7}};s.dungeon={index:s.region*2,expedition:`planet-${p}-cave-${cave}`,floor,x:13,y:13,dir:0};return s;}
test('all nine planet dungeons use alien beings, stronger species arrive with depth, tribbles match rats',()=>{
 for(let p=0;p<3;p++)for(let cave=0;cave<3;cave++)for(let floor=0;floor<3;floor++){const s=planet(p,floor,cave),pool=encounterPool(s);assert.ok(pool.length>=3);assert.ok(pool.every(m=>m.id.startsWith('space-')));if(floor===0)assert.ok(pool.some(m=>m.id==='space-tribble'));if(floor===2){assert.ok(pool.some(m=>m.id==='space-astronaut'));assert.ok(!pool.some(m=>m.id==='space-tribble'));}for(let i=0;i<20;i++)assert.ok(buildEncounter(s,i/20).speciesId.startsWith('space-'));}
 const s=planet(),e=buildEncounter(s,0),rat=monsterStats(MONSTER_BY_ID['tithe-rat'],1);assert.equal(e.speciesId,'space-tribble');for(const key of ['hp','attack','armor'])assert.equal(e[key],rat[key]);
});
test('each final planetary dungeon has its named boss, persists combat and awards its normal alien treasure',()=>{
 for(const [p,name] of ['Hal 2000','AGI Seven','Rosie the Riveter'].entries()){let s=planet(p,2);s=act(s,{type:'descend'});assert.equal(s.enemy.name,name);assert.equal(s.enemy.boss,true);s=loadGame(saveGame(s));s.hp=s.maxHp=10000;if(p===0){s.flags.halChallenge={phase:'blackjack',game:'blackjack',round:1,hand:[21,5],computer:[8,4],deck:[10],message:'FIRST ONE TO BUST WILL TERMINATE.'};s=act(s,{type:'halStand'});s=act(s,{type:'halFinish'});}else{s.enemy.hp=1;for(let i=0;i<10&&s.mode==='battle';i++)s=act(s,{type:'attack'});}assert.equal(s.flags[`expedition:planet-${p}-cave-2`],true);assert.ok(s.bag.some(id=>id.startsWith(['disintegration-ray','crown-obedience','visage-transformer'][p])));assert.equal(s.mode,'dungeon');}
});
test('brainbots shock and Hal requires his game instead of ordinary combat',()=>{
 for(const [id,word] of [['space-brainbot',/electric/i],['space-hal',/Hal controls this room/i]]){let s=planet();s.mode='battle';s.hp=s.maxHp=10000;s.enemy={...MONSTER_BY_ID[id],speciesId:id,hp:9999,maxHp:9999,boss:true,guard:false,firstContact:true};s.equippedArmor='travel-armor';s.armor=1000;const before=s.hp;s=act(s,{type:'guard'});assert.ok(s.log.some(l=>word.test(l)));if(id==='space-hal')assert.equal(before,s.hp);}
});

test('Rosie cycles through iron, scrub and spanking attacks across save/reload',()=>{
 let s=planet(2,2);s=act(s,{type:'descend'});s.hp=s.maxHp=10000;
 for(let i=0;i<3;i++){s=loadGame(saveGame(s));s=act(s,{type:'guard'});}
 for(const pattern of [/sizzling iron/,/scrub your skin/,/spanks you/])assert.ok(s.log.some(l=>pattern.test(l)));
});
