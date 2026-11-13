import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,dungeonMap,loadGame,pointAt,saveGame} from '../public/game/engine.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {freeGalen,castGalenRing,turnInWang,PUTRID_PALACE,royalTrialItems} from '../public/game/royal-trials.js';
test('Galen requires the skeleton key and gives exactly one three-charge ring',()=>{const s=createGame();assert.equal(freeGalen(s),false);s.bag.push('sewer-skeleton-key');assert.equal(freeGalen(s),true);assert.equal(s.flags.galenRingCharges,3);assert.equal(freeGalen(s),false);assert.equal(s.bag.filter(id=>id==='galen-fireball-ring').length,1);});
test('Galen fireballs deal 90 to 120 and spend each of three charges exactly once',()=>{const s=createGame();s.bag.push('sewer-skeleton-key');freeGalen(s);assert.equal(castGalenRing(s,()=>0),90);assert.equal(castGalenRing(s,()=>.999),120);assert.equal(castGalenRing(s,()=>.5),105);assert.equal(castGalenRing(s,()=>.5),0);assert.equal(s.flags.galenRingCharges,0);});
test('Wang trial requires both 5000 gold and the sceptre and cannot charge twice',()=>{const s=createGame();s.gold=5000;assert.equal(turnInWang(s),false);s.bag.push('wang-sceptre');s.gold=4999;assert.equal(turnInWang(s),false);s.gold=5000;assert.equal(turnInWang(s),true);assert.equal(s.gold,0);assert.equal(s.flags.wangTrialComplete,true);assert.equal(turnInWang(s),false);assert.equal(PUTRID_PALACE.region,1);assert.equal(royalTrialItems['wang-sceptre'].notForSale,true);});
test('Wang awaits on the fifteenth floor and fireballs burn his one-health slugs',()=>{
 let s={...createGame(),region:PUTRID_PALACE.region,x:PUTRID_PALACE.x,y:PUTRID_PALACE.y};
 assert.equal(pointAt(s)?.id,PUTRID_PALACE.id);
 s=act(s,{type:'enter'});
 for(let floor=1;floor<15;floor++){
  const {x,y}=dungeonLadders(s.dungeon,dungeonMap(s.dungeon)).find(l=>l.direction==='down');
  Object.assign(s.dungeon,{x,y});
  s=act(s,{type:'descend'});
  assert.equal(s.dungeon.floor,floor);
 }
 Object.assign(s.dungeon,{x:13,y:13});
 s=act(s,{type:'descend'});assert.equal(s.enemy.speciesId,'wang-nauseating');
 s.enemy.combatDistance=1;s.hp=s.maxHp=1000;
 const events=[];
 s=act(s,{type:'guard'},events);assert.equal(s.enemy.slugs,100);
 assert.equal(events.filter(e=>e.kind==='block'&&e.target==='hero').length,3);
 s.bag.push('sewer-skeleton-key');
 freeGalen(s);s.rng=9;
 s=act(s,{type:'useItem',id:'galen-fireball-ring'});
 assert.equal(s.flags.galenRingCharges,2);
 assert.match(s.log.slice(-6).join(' '),/fireball burns 100 of Wang’s slugs/i);
 s.enemy.hp=1;s.rng=187441;s.level=100;
 s=act(s,{type:'attack'});assert.equal(s.flags.wangDefeated,true);
 assert.ok(s.bag.includes('wang-sceptre'));
 assert.equal(loadGame(saveGame(s)).dungeon.site,PUTRID_PALACE.id);
});
