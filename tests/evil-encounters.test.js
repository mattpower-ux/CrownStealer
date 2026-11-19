import test from 'node:test';
import assert from 'node:assert/strict';
import {evilCreatureDisposition} from '../public/game/evil-disposition.js';

const evil={flags:{redGlobeCurse:true},evilRoute:{version:1,phase:'empowered'}};
test('evil creatures stand down while animals and aliens remain hostile',()=>{
 for(const enemy of [{species:'goblin'},{species:'orc'},{species:'troll'},{undead:true}])assert.equal(evilCreatureDisposition(evil,enemy,{}),'neutral');
 for(const enemy of [{animal:true},{alien:true}])assert.equal(evilCreatureDisposition(evil,enemy,{}),'hostile');
});
test('direct attacks and story encounters override evil neutrality',()=>{
 const goblin={species:'goblin'};
 assert.equal(evilCreatureDisposition(evil,goblin,{provoked:true}),'hostile');
 assert.equal(evilCreatureDisposition(evil,goblin,{storyHostile:true}),'hostile');
 assert.equal(evilCreatureDisposition({},goblin,{}),'hostile');
});
