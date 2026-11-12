import test from 'node:test';
import assert from 'node:assert/strict';
import {websterAnswer} from '../public/game/webster.js';

const truth = () => .049;

test('Webster keeps game-specific facts behind a five percent truth roll', () => {
  assert.match(websterAnswer('Where is Haghilda?', truth), /abandoned elven village/i);
  assert.doesNotMatch(websterAnswer('Where is Haghilda?', () => .05), /abandoned elven village/i);
});

test('Webster uses current campaign locations and item details in truthful answers', () => {
  assert.match(websterAnswer('Where is the Bottomless Pit?', truth), /Whispering Barrens.*100 levels/i);
  assert.match(websterAnswer('What does the Mirrored Shield do?', truth), /5%.*flee/i);
  assert.match(websterAnswer('Where is Copper Wastes?', truth), /Cinder Dominion/i);
  assert.match(websterAnswer('What about Admiral Minn?', truth), /Pearl Defiance/i);
});
