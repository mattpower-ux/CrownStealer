import test from 'node:test';
import assert from 'node:assert/strict';
import {BEANS_MESSAGE,handleBeansAction,beansBlocksEnemy,tickBeansRound,beansEnemyAffected,beansEnemyReaction} from '../public/game/bucket-beans.js';
import {createGame,loadGame,saveGame} from '../public/game/engine.js';
import {royalDungeonVictory} from '../public/game/royal-dungeon.js';
test('Heckler drops one edible bucket, consumed once with exact message and three saved rounds',()=>{
 let s=createGame();s.mode=s.returnMode='dungeon';s.location='bellwether';s.dungeon={site:'royal-dungeon',index:0,floor:0,x:7,y:3,dir:0,cellsOpen:false};royalDungeonVictory(s,{royalDungeonNpc:'royal-heckler'},()=>{});
 assert.equal(s.bag.filter(id=>id==='bucket-of-beans').length,1);
 const events=[];assert.equal(handleBeansAction(s,{type:'useItem',id:'bucket-of-beans'},()=>{},events),true);
 assert.equal(events[0].message,BEANS_MESSAGE);assert.equal(s.flags.beansRounds,3);assert.ok(!s.bag.includes('bucket-of-beans'));
 s=loadGame(saveGame(s));s.enemy={name:'Orc',hp:37};const gold=s.gold,xp=s.xp;
 for(let round=0;round<3;round++){assert.equal(beansBlocksEnemy(s),true);tickBeansRound(s,()=>{});}
 assert.equal(beansBlocksEnemy(s),false);assert.equal(s.enemy.hp,37);assert.equal(s.gold,gold);assert.equal(s.xp,xp);
 handleBeansAction(s,{type:'useItem',id:'bucket-of-beans'},()=>{},events);assert.equal(s.flags.beansRounds,0);
 royalDungeonVictory(s,{royalDungeonNpc:'royal-heckler'},()=>{});assert.ok(!s.bag.includes('bucket-of-beans'));
});
test('undead and constructs ignore beans; small animals are stunned and living minds flee',()=>{
 for(const enemy of [{name:'Ghost'},{name:'Liche'},{kind:'undead'},{speciesId:'stone-golem'},{name:'Skeleton'},{kind:'construct'},{name:'Animated Armor'},{kind:'spectral'}])assert.equal(beansEnemyAffected(enemy),false,JSON.stringify(enemy));
 assert.equal(beansEnemyReaction({name:'Rat'}),'stunned');assert.equal(beansEnemyReaction({name:'Royal Torturer'}),'fleeing');
 assert.equal(beansBlocksEnemy({flags:{beansRounds:3},enemy:{name:'Zombie'}}),false);
});
