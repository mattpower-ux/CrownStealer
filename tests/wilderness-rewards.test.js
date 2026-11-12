import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame, dungeonMap, loadGame, pointAt, saveGame} from '../public/game/engine.js';
import {DUNGEONS} from '../public/game/content.js';
import {areaSites, branchGates, teleporterSite, visitedLands} from '../public/game/exploration.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {captureDragon} from '../public/game/dragon.js';
import {dungeonChests} from '../public/game/treasure.js';
import {HOUR_MS, TIME_SCALE} from '../public/game/world-clock.js';

test('an Elevator Scroll reaches another floor and the surface without losing the entrance', () => {
  const entrance = DUNGEONS[1];
  let s = createGame('Elevator check');
  Object.assign(s, {x: entrance.x, y: entrance.y});
  s.bag.push('dungeon-elevator', 'dungeon-elevator');
  s = act(s, {type: 'enter'});
  assert.equal(s.mode, 'dungeon');
  assert.equal(act(s, {type: 'dungeonElevator', floor: 99}).bag.length, s.bag.length);
  s = act(s, {type: 'dungeonElevator', floor: 4});
  assert.equal(s.dungeon.floor, 3);
  const ladder = dungeonLadders(s.dungeon, dungeonMap(s.dungeon)).find(l => l.direction === 'up');
  assert.deepEqual([s.dungeon.x, s.dungeon.y], [ladder.x, ladder.y]);
  s = act(loadGame(saveGame(s)), {type: 'dungeonElevator', floor: 0});
  assert.equal(s.mode, 'world');
  assert.equal(pointAt(s)?.id, entrance.id);
  assert.ok(!s.bag.includes('dungeon-elevator'));
});

test('a crystal reaches only visited lands and preserves the branch return gate', () => {
  let s = createGame('Crystal check');
  const booth = teleporterSite(0), gate = branchGates(0)[0];
  Object.assign(s, {x: booth.x, y: booth.y});
  s.bag.push('teleporter-crystal', 'teleporter-crystal');
  const blocked = act(s, {type: 'crystalTravel', land: gate.area});
  assert.equal(blocked.bag.length, s.bag.length);
  assert.ok(!visitedLands(blocked).includes(gate.area));
  Object.assign(s, {x: gate.x, y: gate.y});
  s.relics = DUNGEONS.filter(d => d.region === 0).map(d => d.id);
  s = act(s, {type: 'enter'});
  assert.equal(s.exploration.area, gate.area);
  assert.ok(visitedLands(s).includes(gate.area));
  Object.assign(s, {x: booth.x, y: booth.y});
  s = act(s, {type: 'crystalTravel', land: 0});
  assert.equal(s.exploration.area, null);
  s = act(loadGame(saveGame(s)), {type: 'crystalTravel', land: gate.area});
  assert.equal(s.exploration.area, gate.area);
  assert.ok(!s.bag.includes('teleporter-crystal'));
  const branchReturn = areaSites(s).find(p => p.kind === 'returnGate');
  Object.assign(s, {x: branchReturn.x, y: branchReturn.y});
  s = act(s, {type: 'enter'});
  assert.deepEqual([s.exploration.area, s.x, s.y], [null, gate.x, gate.y]);
});

test('legacy branch progress identifies visited wilderness even without a disk monument', () => {
  const legacy = createGame('Legacy travel check');
  delete legacy.flags.visitedLands;
  legacy.flags['expedition:wild-10-cave-1'] = true;
  legacy.flags['gateAccess:branch-3-west'] = true;
  legacy.openedChests = ['wild-8-cave-0:0:0'];
  const oldGate = branchGates(2).find(gate => gate.area === 'wild-6');
  legacy.exploration = {area: 'planet-0', artifacts: ['wild-0'], home: {region: 2, x: oldGate.x, y: oldGate.y}};
  Object.assign(legacy, {region: 1, x: 16, y: 21});
  const known = visitedLands(loadGame(saveGame(legacy)));
  for (const land of [0, 2, 3, 'wild-0', 'wild-6', 'wild-8', 'wild-10', 'wild-11']) assert.ok(known.includes(land), String(land));
  assert.ok(!known.includes(1));
  assert.ok(!known.includes('planet-0'));
});

test('rescued Gleep is protected from theft and can leave only after a game hour rolls over', () => {
  let s = createGame('Gleep farewell check');
  Object.assign(s.flags, {drakeDefeated: true, mounts: ['dragon'], mount: 'dragon'});
  assert.equal(captureDragon(s), false);
  s.rng = 1972;
  const hour = HOUR_MS / TIME_SCALE;
  s = act(s, {type: 'clockTick', elapsedMs: hour - 1});
  assert.equal(s.flags.mount, 'dragon');
  s = act(loadGame(saveGame(s)), {type: 'clockTick', elapsedMs: 1});
  assert.equal(s.flags.dragonDeparted, true);
  assert.equal(s.flags.mount, undefined);
  assert.ok(!s.flags.mounts.includes('dragon'));
  assert.match(s.flags.dragonNotice, /true love.*licks your face/);
});

test('ordinary chests keep gold, varied contents and occasional Return Scrolls', () => {
  const s = createGame('Chest distribution check');
  s.dungeon = {index: 1, floor: 2, x: 1, y: 1, dir: 1};
  const map = dungeonMap(s.dungeon);
  const chests = Array.from({length: 400}, (_, seed) => dungeonChests({...s, treasureSeed: seed}, map)).flat();
  assert.ok(chests.every(chest => chest.gold >= 3 && chest.gold <= 11));
  const rate = matches => chests.filter(matches).length / chests.length;
  const filled = rate(chest => chest.items.length > 0);
  const doubles = rate(chest => chest.items.length === 2);
  const returns = rate(chest => chest.items.includes('scroll-return'));
  assert.ok(filled >= .45 && filled <= .55, 'about half contain items, got ' + filled);
  assert.ok(doubles >= .20 && doubles <= .30, 'about one quarter contain two items, got ' + doubles);
  assert.ok(returns >= .07 && returns <= .13, 'about one tenth contain Return Scrolls, got ' + returns);
});
