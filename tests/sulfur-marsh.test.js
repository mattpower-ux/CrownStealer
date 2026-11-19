import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../public/game/engine.js';
import {encounterPool} from '../public/game/encounters.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {caveProfile} from '../public/game/cave-profiles.js';

test('Sulfur Marsh surface and delves use reptilian inhabitants',()=>{
 const states=[
  {...createGame(),region:1,exploration:{area:'wild-5'},mode:'world'},
  {...createGame(),region:1,exploration:{area:'wild-5'},mode:'dungeon',dungeon:{index:2,expedition:'wild-5-cave-0',floor:0,x:1,y:1,dir:1}},
 ];
 for(const state of states){const names=encounterPool(state).map(enemy=>enemy.name);assert.ok(names.length>=8);assert.ok(names.some(name=>/Lizard Priest/.test(name)));assert.ok(names.some(name=>/Swamp Raptor/.test(name)));assert.ok(names.every(name=>!/kobold/i.test(name)));}
});

test('Sulfur Marsh cave sites and profiles are reptilian, not kobold themed',()=>{
 assert.match(caveProfile('wild-5-cave-0').name,/Scale|Raptor|Lizard|Serpent/);
 const caves=Array.from({length:24},(_,slot)=>minorSiteDefinition(`minor-w5-${slot}`)).filter(site=>site.kind==='koboldCave');
 assert.ok(caves.length);
 for(const cave of caves){assert.equal(cave.occupant,'reptile');assert.doesNotMatch(cave.name,/kobold/i);}
});
