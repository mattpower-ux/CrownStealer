import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {townPlaces} from '../public/game/town.js';
import {TOWNS} from '../public/game/content.js';
function court(s){const p=townPlaces(s).find(p=>p.id==='court');s.townPosition={x:p.x,y:p.y};return s;}
test('paying a local fine with the last coins still permits palace exploration and saving',()=>{
 let s=court({...createGame(),mode:'town',location:'mothbridge',gold:25});s.wanted[0]=1;
 assert.equal(act(s,{type:'enterCastle'}).castle,undefined);
 s=act(s,{type:'pardon'});assert.equal(s.gold,0);assert.equal(s.mode,'town');
 s=act(loadGame(saveGame(s)),{type:'enterCastle'});assert.ok(s.castle);s=act(s,{type:'move',dx:0,dy:-1});assert.equal(s.mode,'town');
});
test('exact robbery and governor fines restore access without the penniless rejection',()=>{
 for(const [action,key,gold]of [['payCastleFine','castleBan:',2000],['payGovernor','palaceBan:',5000]]){
  const town=TOWNS[0];let s={...createGame(),x:town.x,y:town.y,gold};s.flags[key+town.id]=true;
  s=act(s,{type:action});assert.equal(s.gold,0);s=act(loadGame(saveGame(s)),{type:'enter'});assert.equal(s.mode,'town');
  s=act(court(s),{type:'enterCastle'});assert.ok(s.castle);
 }
});
