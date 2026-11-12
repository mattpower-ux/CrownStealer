import test from 'node:test';
import assert from 'node:assert/strict';
import { atlasRegions, atlasView } from '../public/game/atlas-view.js';
import { createGame } from '../public/game/engine.js';
import { branchGates } from '../public/game/exploration.js';
import { joystickIntent, joystickStepDelay } from '../public/game/touch-joystick.js';

test('the Atlas groups all twelve land branches under the mainland gates and excludes planets', () => {
  const s = createGame();
  const regions = atlasRegions(s);
  assert.equal(regions.length, 4);
  assert.equal(regions.flatMap(region => region.branches).length, 12);
  assert.deepEqual(regions.map(region => region.levels), ['1–7', '8–15', '16–25', '26+']);
  assert.equal(new Set(regions.map(region => region.color)).size, 4);
  assert.deepEqual(regions.map(region => region.east.target), [1, 2, 3, 0]);
  for (const region of regions) {
    assert.deepEqual(region.branches.map(({ gate }) => gate), branchGates(region.id));
  }
  const html = atlasView(s);
  assert.doesNotMatch(html, /Aurelia|Mycelion|Violet Ice/);
  assert.match(html, /Whispering Barrens/);
  assert.match(html, /The Bottomless Pit/);
  assert.match(html, /The Putrid Palace \(72, 76\)/);
  assert.match(html, /East gate to The Cinder Dominion/);
});

test('the Putrid Palace appears in the Atlas without adding a relic requirement to the east gate', () => {
  const s = createGame();
  const dominion = atlasRegions(s)[1];
  assert.equal(dominion.dungeons.length, 2);
  assert.equal(dominion.sideDungeons?.find(site => site.id === 'putrid-palace')?.region, dominion.id);
  s.relics.push(...dominion.dungeons.map(dungeon => dungeon.id));
  assert.equal(atlasRegions(s)[1].east.open, true);
});

test('the Atlas distinguishes reachable gates and the active branch', () => {
  const s = createGame();
  s.exploration = { area: 'wild-2', artifacts: [] };
  s.flags['gateAccess:branch-0-west'] = true;
  assert.deepEqual(atlasRegions(s)[0].branches.map(({ open, current }) => [open, current]), [
    [false, false], [false, false], [true, true],
  ]);
  s.relics.push('tithe-vault', 'widows-bell');
  assert.equal(atlasRegions(s)[0].branches.every(branch => branch.open), true);
  assert.equal(atlasRegions(s)[0].east.open, true);
});

test('the joystick has a dead zone, uses legal cardinal steps, and respects dungeon strafing', () => {
  assert.equal(joystickIntent('world', 3, 4, 40, 1), null);
  assert.deepEqual(joystickIntent('world', 25, 7, 40).action, { type: 'mapStep', dx: 1, dy: 0 });
  assert.deepEqual(joystickIntent('town', -15, -27, 40).action, { type: 'mapStep', dx: 0, dy: -1 });
  assert.deepEqual(joystickIntent('dungeon', -40, 20, 40).action, { type: 'strafe', delta: -1 });
  assert.deepEqual(joystickIntent('dungeon', 0, 30, 40).action, { type: 'back' });
  assert.equal(joystickIntent('battle', 40, 0, 40), null);
});

test('distance and supported touch pressure change the interval without bypassing terrain pace', () => {
  const soft = joystickIntent('world', 15, 0, 40, 0.1);
  const firm = joystickIntent('world', 15, 0, 40, 0.9);
  const full = joystickIntent('world', 70, 0, 40, 0.5);
  assert.ok(joystickStepDelay(185, firm.strength) < joystickStepDelay(185, soft.strength));
  assert.ok(joystickStepDelay(185, full.strength) < joystickStepDelay(185, firm.strength));
  assert.equal(joystickStepDelay(540, full.strength), 540);
  assert.equal(joystickIntent('world', 15, 0, 40, 0.5).strength, joystickIntent('world', 15, 0, 40).strength);
});
