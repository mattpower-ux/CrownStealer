import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image = class { addEventListener() {} };
globalThis.document = {createElement: () => ({})};
const {castleViewport, render, worldViewport} = await import('../public/game/render.js');
const {createGame} = await import('../public/game/engine.js');

test('the camera shows one sixteenth of an expanded wilderness and stays inside its edges', () => {
  for (const area of [undefined, 'wild-0', 'wild-11']) {
    const state = {x: 64, y: 48, exploration: {area}};
    assert.deepEqual(worldViewport(state), {cols: 32, rows: 24, left: 48, top: 36});
    assert.deepEqual(worldViewport({...state, x: 1, y: 1}), {cols: 32, rows: 24, left: 0, top: 0});
    assert.deepEqual(worldViewport({...state, x: 126, y: 94}), {cols: 32, rows: 24, left: 96, top: 72});
  }
});

test('planetary maps retain their existing camera size and bounds', () => {
  const state = {x: 30, y: 22, exploration: {area: 'planet-0'}};
  assert.deepEqual(worldViewport(state), {cols: 20, rows: 15, left: 12, top: 9});
});

test('the castle camera follows the hero and hides distant rooms', () => {
  globalThis.devicePixelRatio = 1;
  const state = createGame();
  Object.assign(state, {mode: 'town', location: 'bellwether', castle: {x: 9, y: 14, alarm: false}});
  const labels = [];
  const canvas = {dataset: {}, getBoundingClientRect: () => ({width: 1000, height: 600})};
  const noOp = () => {};
  const context = new Proxy({
    canvas,
    fillText: text => labels.push(text),
    measureText: text => ({width: text.length * 10}),
    getTransform: () => ({a: 1, d: 1, e: 0, f: 0}),
    createLinearGradient: () => ({addColorStop: noOp}),
    createRadialGradient: () => ({addColorStop: noOp}),
  }, {get: (target, key) => target[key] ?? noOp});
  globalThis.document.createElement = () => ({getContext: () => context});
  canvas.getContext = () => context;
  render(canvas, state);
  assert.equal(canvas.dataset.view, 'castle-map');
  assert.deepEqual(castleViewport(state), {cols: 11, rows: 11, left: 4, top: 9});
  assert.ok(labels.includes('Entrance Hall'));
  assert.ok(!labels.includes('Royal Audience Chamber'));
  labels.length = 0;
  Object.assign(state.castle, {x: 9, y: 4});
  render(canvas, state);
  assert.deepEqual(castleViewport(state), {cols: 11, rows: 11, left: 4, top: -1});
  assert.ok(labels.includes('Royal Audience Chamber'));
  assert.ok(!labels.includes('Entrance Hall'));
});
