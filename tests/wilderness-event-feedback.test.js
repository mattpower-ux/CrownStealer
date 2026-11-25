import test from 'node:test';
import assert from 'node:assert/strict';
import {wildernessEventFeedback} from '../public/game/wilderness-event-view.js';

test('completed wilderness choices report every new treasure or trap result',()=>{
  assert.equal(wildernessEventFeedback(['You find a buried hoard of coins. Take it, or leave it?'],['You find a buried hoard of coins. Take it, or leave it?','The hoard is real! You find 75 gold.','A small emerald gleams beneath the coins.']),'The hoard is real! You find 75 gold. A small emerald gleams beneath the coins.');
  assert.equal(wildernessEventFeedback(['old'],['old','The glittering coins are bait. A hidden trap snaps shut! 7 damage.']),'The glittering coins are bait. A hidden trap snaps shut! 7 damage.');
});
