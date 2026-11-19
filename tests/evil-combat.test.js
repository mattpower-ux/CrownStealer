import test from 'node:test';
import assert from 'node:assert/strict';
import {evilFearChance, evilFearEligible} from '../public/game/evil-disposition.js';

const state=level=>({level,flags:{redGlobeCurse:true},evilRoute:{version:1,phase:'empowered'}});
test('evil fear starts at thirty percent and loses one point per higher enemy level',()=>{
 assert.equal(evilFearChance(state(10),{level:9}),.30);
 assert.equal(evilFearChance(state(10),{level:10}),.30);
 assert.equal(evilFearChance(state(10),{level:11}),.19);
 assert.equal(evilFearChance(state(10),{level:29}),.01);
 assert.equal(evilFearChance(state(10),{level:30}),0);
});
test('bosses, constructs, and mindless creatures are immune to the aura',()=>{
 for(const enemy of [{boss:true},{construct:true},{mindless:true}])assert.equal(evilFearEligible(enemy),false);
 assert.equal(evilFearEligible({level:1}),true);
});
