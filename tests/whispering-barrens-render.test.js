import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isWhisperingBarrensMap,
  barrensPalette,
  barrensScenery,
} from '../public/game/whispering-barrens-render.js';

test('only the Whispering Barrens wilderness receives the conquered infernal landscape',()=>{
  assert.equal(isWhisperingBarrensMap({area:{id:'wild-2'}}),true);
  assert.equal(isWhisperingBarrensMap({area:{id:'wild-1'}}),false);
  assert.equal(isWhisperingBarrensMap({area:null,region:2}),false);
});

test('the Barrens palette is charred, polluted and devoid of living forest colors',()=>{
  assert.match(barrensPalette.ground,/^#/);
  assert.match(barrensPalette.water,/^#/);
  assert.notEqual(barrensPalette.ground,'#91a45c');
  assert.notEqual(barrensPalette.water,'#448b99');
  assert.ok(barrensPalette.deadWood);
  assert.ok(barrensPalette.mountainTop);
});

test('Barrens scenery is deterministic and includes ruins among dead trees',()=>{
  const first=Array.from({length:240},(_,i)=>barrensScenery(i%24,Math.floor(i/24)));
  const second=Array.from({length:240},(_,i)=>barrensScenery(i%24,Math.floor(i/24)));
  assert.deepEqual(first,second);
  assert.ok(first.includes('ruin'));
  assert.ok(first.includes('dead-tree'));
  assert.ok(first.includes('ash'));
});
