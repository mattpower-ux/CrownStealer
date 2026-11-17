import {minorSiteList} from '../public/game/engine.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {minorGuardian} from '../public/game/minor-dungeons.js';
import {isSplitRock,KERRBEAR_TOOTH} from '../public/game/kerrbear.js';
function cave(){const s=createGame();const entrance=minorSiteList(s).find(p=>p.id==='minor-r0-3');s.x=entrance.x;s.y=entrance.y;s.mode='dungeon';s.flags.royalQuest='banished';s.dungeon={site:'minor-site',minorId:'minor-r0-3',index:0,floor:0,x:13,y:12,dir:2};return s;}
test('Split Rock has Kerrbear rather than the generic kobold guardian',()=>{const s=cave();assert.ok(isSplitRock(s.dungeon));assert.equal(minorGuardian(s),null);});
test('feeding Kerrbear consumes food and grants his tooth only once',()=>{let s=cave();const meals=s.meals;s=act(s,{type:'feedKerrbear'});assert.equal(s.meals,meals-1);assert.ok(s.bag.includes(KERRBEAR_TOOTH.id));s=act(loadGame(saveGame(s)),{type:'feedKerrbear'});assert.equal(s.meals,meals-1);assert.equal(s.bag.filter(x=>x===KERRBEAR_TOOTH.id).length,1);});
test('Kerrbear attacks only when provoked and has combat level fifteen',()=>{const s=act(cave(),{type:'attackKerrbear'});assert.equal(s.mode,'battle');assert.equal(s.enemy.name,'Kerrbear');assert.equal(s.enemy.level,15);});
test('amulet must be worn and three calls summon once for the battle',()=>{let s=cave();s.bag.push(KERRBEAR_TOOTH.id);s.mode='battle';s.enemy={name:'Foe',speciesId:'tithe-rat',hp:200,maxHp:200,attack:0,armor:0,level:1,firstContact:true};s.returnMode='dungeon';s=act(s,{type:'callKerrbear'});assert.ok(!s.enemy.kerrbearAlly);s.equippedNecklace=KERRBEAR_TOOTH.id;for(let i=0;i<3;i++)s=act(s,{type:'callKerrbear'});assert.ok(s.enemy.kerrbearAlly);assert.equal(s.flags.kerrbearSummoned,true);s.enemy.kerrbearAlly=false;for(let i=0;i<3;i++)s=act(s,{type:'callKerrbear'});assert.equal(s.enemy.kerrbearAlly,false);});

