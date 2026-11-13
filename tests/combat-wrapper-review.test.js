import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame} from '../public/game/engine.js';

function battle(){const s=createGame();s.mode='battle';s.returnMode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:1};s.hp=s.maxHp=5000;s.enemy={name:'Balrog',speciesId:'balrog-of-despair',level:1,hp:1000,maxHp:1000,attack:1,armor:0,gold:5,xp:5,combatDistance:1,surpriseShotsRemaining:0};return s;}
test('gas protection does not depend on a discarded fear roll before initiative',()=>{
 const s=battle();s.flags.beansRounds=3;s.rng=12;const events=[];
 const next=act(s,{type:'attack'},events);
 assert.equal(next.enemy.hp,1000);assert.equal(next.flags.beansRounds,2);
 assert.equal(next.gold,s.gold);assert.equal(next.xp,s.xp);
 assert.ok(!events.some(e=>e.target==='enemy'&&e.kind==='hit'));
});
test('a normal ranged combat round spends a poison round even when a melee foe only approaches',()=>{
 const s=battle();s.enemy.speciesId='ogre';s.enemy.name='Ogre';s.enemy.combatDistance=3;
 s.bag.push('common-bow-1');s.equipped='common-bow-1';
 s.weaponCoating={id:'weapon-poison-5',weapon:s.equipped,rounds:5};
 const next=act(s,{type:'attack'});
 assert.equal(next.enemy.combatDistance,2);assert.equal(next.weaponCoating.rounds,4);
});
test('poison counts surprise and caster rounds exactly once, preserving the application round',()=>{
 for(const [surprise,ranged] of [[2,false],[0,true]]){
  const s=battle();s.enemy.speciesId='ogre';s.enemy.combatDistance=3;s.enemy.surpriseShotsRemaining=surprise;s.enemy.ranged=ranged;s.bag.push('common-bow-1');s.equipped='common-bow-1';s.weaponCoating={id:'weapon-poison-5',weapon:s.equipped,rounds:5};
  const next=act(s,{type:'attack'});assert.equal(next.weaponCoating.rounds,4);
 }
 const s=battle();s.enemy.speciesId='ogre';s.enemy.combatDistance=3;s.bag.push('weapon-poison-5');const next=act(s,{type:'useItem',id:'weapon-poison-5'});assert.equal(next.weaponCoating.rounds,5);
});
