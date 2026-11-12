import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {DUNGEONS,TOWNS} from '../public/game/content.js';

function townGame(){const s=createGame();s.mode='town';s.location='mothbridge';s.gold=1000;return s;}
function win(s){s.enemy.hp=1;s.enemy.attack=0;s.level=100;s.rng=187441;return act(s,{type:'attack'});}
function enterWanted(s,town=TOWNS[0]){s.mode='world';s.enemy=null;s.location=null;s.region=town.region;s.x=town.x;s.y=town.y;s.wanted[s.region]=4;return act(s,{type:'enter'});}

test('third guard victory ends unsolicited pursuit permanently across saves and towns',()=>{
 let s=enterWanted(createGame());
 for(let i=1;i<=3;i++){assert.equal(s.mode,'battle');s=win(s);assert.equal(s.flags.guardVictories,i);s=loadGame(saveGame(s));}
 assert.equal(s.mode,'town');assert.equal(s.enemy,null);
 assert.equal(s.flags['townGarrison:mothbridge'],undefined);
 for(const town of TOWNS.filter(t=>t.id!=='bellwether')){s=enterWanted(s,town);assert.equal(s.mode,'town');assert.equal(s.enemy,null);}
 s=act(s,{type:'steal'});assert.equal(s.mode,'town');assert.equal(s.enemy,null);
});

test('two victories still allow pursuit; explicit palace challenge continues through all five',()=>{
 let s=townGame();s.flags.guardVictories=2;assert.equal(enterWanted(structuredClone(s)).mode,'battle');
 s=act(s,{type:'challenge'});
 for(let i=0;i<5;i++){assert.equal(s.mode,'battle');s=loadGame(saveGame(s));s=win(s);}
 assert.equal(s.mode,'town');assert.equal(s.flags['townGarrison:mothbridge'],true);
 assert.equal(s.flags.guardVictories,7);
});

test('royal and gossip challenges remain available after intimidation',()=>{
 let s=townGame();s.flags.guardVictories=3;s.location='bellwether';
 s=win(act(s,{type:'challenge'}));assert.equal(s.flags.royalGuardWins,1);assert.equal(s.flags['garrison:0'],undefined);
 s.location='mothbridge';s.flags.gossipGuardTown='mothbridge';s=win(act(s,{type:'gossipGuardAttack'}));assert.equal(s.flags.guardVictories,5);
});

test('legacy saves recover known guard victories without mistaking relic gate access for kills',()=>{
 for(const flags of [{'palaceWins:mothbridge':3},{royalGuardWins:3},{'townGarrison:mothbridge':true},{'garrison:0':true},{'palaceWins:mothbridge':1,royalGuardWins:2},{'gateAccess:east-gate-1':true}]){
  const s=createGame();Object.assign(s.flags,flags);delete s.flags.guardVictories;
  assert.equal(enterWanted(loadGame(saveGame(s))).mode,'town');
 }
 const s=createGame();delete s.flags.guardVictories;s.flags['gateAccess:east-gate-0']=true;
 s.flags['returnAccess:0']=true;
 s.relics=DUNGEONS.filter(d=>d.region===0).map(d=>d.id);
 assert.equal(enterWanted(loadGame(saveGame(s))).mode,'battle');
});

test('invalid saved guard victory counts are rejected',()=>{
 for(const value of [-1,1.5,'3',null]){const s=createGame();s.flags.guardVictories=value;assert.throws(()=>loadGame(saveGame(s)),/guard victory/i);}
});
