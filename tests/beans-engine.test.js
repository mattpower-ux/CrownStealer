import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame,dungeonMap} from '../public/game/engine.js';
function fight(undead=false,dungeon=true){const s=createGame();s.hp=s.maxHp=500;s.mode='battle';s.returnMode=dungeon?'dungeon':'world';s.dungeon=dungeon?{index:0,floor:0,x:1,y:1,dir:1}:null;s.bag.push('bucket-of-beans','common-bow-1','wand-fireball-1');s.equipped='common-bow-1';s.enemy={name:undead?'Skeleton':'Ogre',speciesId:undead?'skeleton':'ogre',kind:undead?'undead':'brute',undead,level:1,hp:1000,maxHp:1000,attack:12,armor:0,gold:10,xp:10,...(dungeon?{combatDistance:3,surpriseShotsRemaining:0}:{})};return s;}
test('beans activation starts3full rounds and living foes cannot attack or be farmed',()=>{
 for(const dungeon of [true,false]){let s=fight(false,dungeon);s=act(s,{type:'eatBeans'});assert.equal(s.flags.beansRounds,3);assert.equal(s.hp,500);assert.ok(!s.bag.includes('bucket-of-beans'));
 for(let round=2;round>=0;round--){const old=s;s=act(s,{type:'attack'});assert.equal(s.flags.beansRounds,round);assert.equal(s.enemy.hp,1000);assert.equal(s.hp,500);assert.equal(s.xp,old.xp);assert.equal(s.gold,old.gold);}s=act(s,{type:'attack'});assert.ok(s.enemy.hp<1000);}
});
test('gas blocks offensive wand without spending charge, but undead are unaffected',()=>{
 let s=act(fight(),{type:'eatBeans'});const wand=s.bag.find(id=>id.startsWith('wand-fireball-1~')),charges=s.wandCharges[wand];s=act(s,{type:'useItem',id:wand});assert.equal(s.wandCharges[wand],charges);assert.equal(s.enemy.hp,1000);assert.equal(s.flags.beansRounds,2);
 let dead=act(fight(true),{type:'eatBeans'});assert.equal(dead.flags.beansRounds,3);dead=act(dead,{type:'attack'});assert.ok(dead.enemy.hp<1000);assert.equal(dead.flags.beansRounds,2);
});
test('invalid commands do not exhaust gas and successful dungeon movement exhausts one round',()=>{
 let s=act(fight(),{type:'eatBeans'});s=act(s,{type:'useItem',id:'missing'});assert.equal(s.flags.beansRounds,3);s.mode='dungeon';s.enemy=null;const map=dungeonMap(s.dungeon);s.dungeon.dir=map[1][2]!==1?1:2;
 const next=act(s,{type:'forward'},[],{noRandom:true});assert.equal(next.flags.beansRounds,2);assert.equal(loadGame(saveGame(next)).flags.beansRounds,2);
});
test('owned beans and gas duration survive saves; summoned ghost cannot bypass protection',()=>{
 let s=fight();assert.ok(loadGame(saveGame(s)).bag.includes('bucket-of-beans'));s=act(s,{type:'eatBeans'});s.enemy.heroGhost=true;const before=s.enemy.hp;s=act(s,{type:'attack'});assert.equal(s.enemy.hp,before);assert.equal(s.flags.beansRounds,2);
});
