import test from 'node:test';
import assert from 'node:assert/strict';
import {MULTIVERSE_TRANSITION_MS,multiverseTransitionProgress} from '../public/game/multiverse-transition.js';

test('multiverse transition lasts exactly four seconds',()=>{
 assert.equal(MULTIVERSE_TRANSITION_MS,4000);
 assert.equal(multiverseTransitionProgress(0),0);
 assert.ok(multiverseTransitionProgress(3999)<1);
 assert.equal(multiverseTransitionProgress(4000),1);
 assert.equal(multiverseTransitionProgress(9000),1);
});
