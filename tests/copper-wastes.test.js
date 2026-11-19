import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../public/game/engine.js';
import {encounterPool} from '../public/game/encounters.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {caveProfile} from '../public/game/cave-profiles.js';
import {COPPER_WASTES_HISTORY} from '../public/game/copper-wastes.js';

test('Copper Wastes surface and underground cities are occupied by goblins',()=>{
 const states=[
  {...createGame(),region:1,exploration:{area:'wild-3'},mode:'world'},
  {...createGame(),region:1,exploration:{area:'wild-3'},mode:'dungeon',dungeon:{index:2,expedition:'wild-3-cave-0',floor:0,x:1,y:1,dir:1}},
 ];
 for(const state of states){const names=encounterPool(state).map(enemy=>enemy.name);assert.ok(names.length>=9);assert.ok(names.some(name=>/Goblin Mine Boss/.test(name)));assert.ok(names.every(name=>/Goblin/.test(name)));}
});

test('Copper Wastes lairs preserve the stolen dwarven mine and city history',()=>{
 const profile=caveProfile('wild-3-cave-0');
 assert.match(profile.name,/Dwarven|Copper|Under-City/);
 assert.match(profile.description,/dwar/i);
 const caves=Array.from({length:24},(_,slot)=>minorSiteDefinition(`minor-w3-${slot}`)).filter(site=>site.kind==='koboldCave');
 assert.ok(caves.length);
 for(const cave of caves){assert.equal(cave.occupant,'copperGoblin');assert.match(cave.name,/Goblin/);assert.doesNotMatch(cave.name,/kobold/i);}
 assert.match(COPPER_WASTES_HISTORY,/stole|seized/i);
 assert.match(COPPER_WASTES_HISTORY,/dwar/i);
});
