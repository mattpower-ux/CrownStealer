import assert from 'node:assert/strict';
import test from 'node:test';
import {act,createGame,loadGame,saveGame} from '../public/game/engine.js';
import {briarAnimalMeeting,BATTLE_BEAR_HP} from '../public/game/briar-animals.js';
import {buildEncounter} from '../public/game/encounters.js';

test('Briar animals are usually peaceful and only respect recruits Andros',()=>{
 const state=createGame('Briar tester');
 state.exploration={area:'wild-0',artifacts:[]};
 const meetings=Array.from({length:100},(_,i)=>briarAnimalMeeting(state,(i+.5)/100,.2));
 assert.equal(meetings.filter(meeting=>meeting.peaceful).length,90);
 const bear=briarAnimalMeeting(state,.2,.01);
 state.flags.peacefulEncounter=bear;
 assert.equal(act(state,{type:'peacefulLeave'}).flags.andros,undefined);
 const ally=act(state,{type:'peacefulAccept'});
 assert.equal(ally.flags.andros,BATTLE_BEAR_HP);
 assert.equal(loadGame(saveGame(ally)).flags.andros,BATTLE_BEAR_HP);
 const duel=act(state,{type:'peacefulProvoke'});
 assert.equal(duel.enemy.level,40);
 assert.equal(duel.mode,'battle');
});

test('Briar caves use Lizard Thegns and Andros fights only in the Bottomless Pit',()=>{
 const state=createGame('Pit tester');
 state.mode='dungeon';
 state.dungeon={index:0,floor:0,expedition:'wild-0-cave-0',x:1,y:1,dir:1};
 assert.match(buildEncounter(state,.4).name,/Lizard Thegn/);
 state.mode='battle';
 state.returnMode='dungeon';
 state.dungeon={index:0,floor:0,site:'bottomless-pit',x:1,y:1,dir:1};
 state.enemy={speciesId:'depth-3-lesser-demon',name:'Pit Demon',hp:500,maxHp:500,level:25,attack:80,armor:2,gold:0,xp:0,kind:'brute',combatDistance:1,weakness:'steady pressure'};
 state.flags.andros=BATTLE_BEAR_HP;
 const events=[];
 const fought=act(state,{type:'attack'},events);
 assert.ok(events.some(event=>event.andros));
 assert.ok(fought.flags.andros<BATTLE_BEAR_HP);
 const fragile=structuredClone(state);fragile.flags.andros=1;
 assert.equal(act(fragile,{type:'guard'}).flags.andros,0);
 state.dungeon.site='firedrak';
 const elsewhere=[];
 act(state,{type:'attack'},elsewhere);
 assert.ok(!elsewhere.some(event=>event.andros));
});
