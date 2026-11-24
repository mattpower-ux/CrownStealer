import test from 'node:test';
import assert from 'node:assert/strict';
import {applyAlignmentImpact, alignmentPoints, alignmentLocked, alignmentShiftMessage} from '../public/game/alignment.js';

const state = () => ({alignment: 0, alignmentPoints: 500, flags: {}, exploration: null});

test('alignment uses a persistent 0–1000 scale and locks only at absolute evil', () => {
  const s = state();
  assert.equal(applyAlignmentImpact(s, 100), 100);
  assert.equal(alignmentPoints(s), 600);
  assert.equal(s.alignment, 20);
  assert.equal(applyAlignmentImpact(s, -1000), -600);
  assert.equal(alignmentPoints(s), 0);
  assert.equal(alignmentLocked(s), true);
  assert.equal(applyAlignmentImpact(s, 1), 0);
});

test('alien planets are completely alignment-neutral', () => {
  const s = {...state(), exploration: {area: 'planet-1'}};
  assert.equal(applyAlignmentImpact(s, -200), 0);
  assert.equal(alignmentPoints(s), 500);
});

test('every point movement produces an alignment direction notice', () => {
  assert.equal(alignmentShiftMessage({alignmentPoints: 500}, {alignmentPoints: 499}), 'Your alignment shifted toward the evil!');
});

test('chosen paladin status is granted at maximum good and revoked by evil', () => {
  const s = {...state(), alignmentPoints: 999, alignment: 100};
  applyAlignmentImpact(s, 1);
  assert.equal(s.flags.chosenPaladin, true);
  applyAlignmentImpact(s, -1);
  assert.equal(s.flags.chosenPaladin, undefined);
});
