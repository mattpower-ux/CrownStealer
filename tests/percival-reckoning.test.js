import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import {
  PERCIVAL_RECKONING, exileEvilRuler, resolvePercivalDefeat,
  resolvePercivalRound, startPercivalFight,
} from '../public/game/percival-reckoning.js';

function ruler(){
 const s=createGame('Dread Tester');
 Object.assign(s,{level:37,xp:1234,gold:9999,hp:200,maxHp:200});
 s.attributes.strength=22;s.attributes.constitution=18;
 s.bag.push('rare-sword-1');s.equipped='rare-sword-1';s.equippedArmor='travel-armor';
 Object.assign(s.flags,{redGlobeCurse:true,redGlobeSworn:true,kingUsurped:true,married:true,evilMarriage:true,evilRulerTitle:'Dread Sovereign','champion:mothbridge':true});
 s.evilRoute={version:1,phase:'percivalChoice'};
 return s;
}

test('Percival is a level one-hundred fear-immune demigod with an anti-evil greatsword',()=>{
 const s=ruler();startPercivalFight(s,()=>{});
 assert.equal(s.evilRoute.phase,'percivalBattle');
 assert.equal(s.enemy.level,100);assert.equal(s.enemy.boss,true);assert.equal(s.enemy.fearImmune,true);
 assert.equal(s.enemy.regeneration,50);assert.equal(s.enemy.attack,PERCIVAL_RECKONING.baseAttack*2);
 assert.equal(s.enemy.noLoot,true);assert.equal(s.enemy.noXp,true);
});

test('Percival regenerates fifty after a nonlethal round but never beyond maximum',()=>{
 const s=ruler();startPercivalFight(s,()=>{});s.enemy.hp=s.enemy.maxHp-20;
 assert.equal(resolvePercivalRound(s,[],()=>{}),20);assert.equal(s.enemy.hp,s.enemy.maxHp);
 s.enemy.hp=0;assert.equal(resolvePercivalRound(s,[],()=>{}),0);assert.equal(s.enemy.hp,0);
});

test('running strips the evil ruler but preserves level xp base attributes quests and exploration',()=>{
  const s=ruler();s.quests=['soup-before-statues'];s.exploration={area:null,artifacts:[],home:{region:0,x:1,y:1}};
 const before={level:s.level,xp:s.xp,attributes:structuredClone(s.attributes),quests:[...s.quests],exploration:structuredClone(s.exploration)};
 exileEvilRuler(s,'run',()=>{});
 assert.deepEqual({level:s.level,xp:s.xp,attributes:s.attributes,quests:s.quests,exploration:s.exploration},before);
 assert.deepEqual(s.bag,[]);assert.equal(s.gold,0);assert.equal(s.equipped,null);assert.equal(s.flags.kingUsurped,undefined);
 assert.equal(s.flags.leprosy,undefined);assert.equal(s.evilRoute.phase,'exiled');assert.equal(s.mode,'world');
 assert.doesNotThrow(()=>loadGame(saveGame(s)));
});

test('defeat applies Percival leprosy while otherwise using the same playable exile',()=>{
 const s=ruler();resolvePercivalDefeat(s,()=>{});
 assert.equal(s.flags.leprosy,true);assert.equal(s.flags.leprosyKind,'percival');
 assert.equal(s.flags.leprosySince,s.worldTimeMs);assert.equal(s.hp,s.maxHp);assert.equal(s.evilRoute.phase,'exiled');
});

test('the engine exposes fight and run choices for the throne confrontation',()=>{
 const fighter=act(ruler(),{type:'percivalFight'});
 assert.equal(fighter.mode,'battle');assert.equal(fighter.enemy.percivalReckoning,true);
 const runner=act(ruler(),{type:'percivalRun'});
 assert.equal(runner.mode,'world');assert.equal(runner.evilRoute.phase,'exiled');
 assert.equal(runner.flags.leprosy,undefined);
});

test('each committed Percival combat round applies his regeneration',()=>{
 let s=act(ruler(),{type:'percivalFight'});s.enemy.hp=s.enemy.maxHp-100;
 s=act(s,{type:'guard'});
 assert.ok(s.enemy?.hp>=PERCIVAL_RECKONING.maxHp-50||s.mode!=='battle','Percival should heal before resolving the round');
});
