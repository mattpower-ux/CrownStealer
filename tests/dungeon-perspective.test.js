import test from 'node:test';
import assert from 'node:assert/strict';
import {dungeonFloorBaseline} from '../public/game/dungeon-perspective.js';

test('dungeon NPC feet share the projected floor line used by scenery',()=>{
 const h=1000;
 assert.equal(dungeonFloorBaseline(h,1),910);
 assert.equal(dungeonFloorBaseline(h,2),705);
 assert.equal(dungeonFloorBaseline(h,.5),950,'nearby feet remain inside the viewport');
});
