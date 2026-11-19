import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, loadGame, saveGame} from '../public/game/engine.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {fulfillRedGlobe} from '../public/game/red-globe.js';
import {
  evilEmpowered,
  evilStrengthBonus,
  prepareEvilRoute,
} from '../public/game/evil-route.js';

test('fulfilling the Red Globe bargain starts the saved evil route without mutating base Strength', () => {
  const before = createGame();
  before.flags.redGlobeSworn = true;
  before.attributes.strength = 14;
  const state = structuredClone(before);
  state.mode = 'battle';
  state.enemy = {guard: true};

  fulfillRedGlobe(before, state, {type: 'attackCastleGuard'}, [], () => {});

  assert.deepEqual(state.evilRoute, {version: 1, phase: 'empowered'});
  assert.equal(evilEmpowered(state), true);
  assert.equal(evilStrengthBonus(state), 10);
  assert.equal(state.attributes.strength, 14);
  assert.equal(effectiveAttributes(state).strength, 24);
});

test('legacy Red Globe saves migrate exactly once to the empowered route', () => {
  const legacy = createGame();
  legacy.flags.redGlobeSworn = true;
  legacy.flags.redGlobeCurse = true;

  const restored = loadGame(saveGame(legacy));
  const restoredAgain = loadGame(saveGame(restored));

  assert.deepEqual(restored.evilRoute, {version: 1, phase: 'empowered'});
  assert.deepEqual(restoredAgain.evilRoute, restored.evilRoute);
  assert.equal(effectiveAttributes(restoredAgain).strength, legacy.attributes.strength + 10);
});

test('preparation is idempotent and leaves ordinary characters alone', () => {
  const ordinary = createGame();
  prepareEvilRoute(ordinary);
  prepareEvilRoute(ordinary);
  assert.equal(ordinary.evilRoute, undefined);
});

test('load rejects malformed evil route phases', () => {
  for (const evilRoute of [null, [], {version: 2, phase: 'empowered'}, {version: 1, phase: 'tyrant'}]) {
    const state = createGame();
    state.evilRoute = evilRoute;
    assert.throws(() => loadGame(saveGame(state)), /evil route/i);
  }
});
