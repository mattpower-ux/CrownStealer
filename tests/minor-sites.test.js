import test from 'node:test';
import assert from 'node:assert/strict';
import {minorSiteDefinition, minorSites} from '../public/game/minor-sites.js';
import {act, createGame, DIRS, dungeonMap, loadGame, minorSiteList, pointAt, saveGame, worldTile} from '../public/game/engine.js';
import {TOWNS, DUNGEONS} from '../public/game/content.js';
import {AREAS, areaSites, areaTile, branchGates, teleporterSite} from '../public/game/exploration.js';
import {WILD_SITES} from '../public/game/wild-sites.js';
import {PUTRID_PALACE} from '../public/game/royal-trials.js';
import {worldSize} from '../public/game/world-size.js';

const walkable = tile => tile && tile !== 'water' && tile !== 'mountain';

function reachable(start, tileAt) {
  const queue = [start];
  const visited = new Set([start.x + ',' + start.y]);
  for (const {x, y} of queue) {
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, key = nx + ',' + ny;
      if (visited.has(key) || !walkable(tileAt(nx, ny))) continue;
      visited.add(key);
      queue.push({x: nx, y: ny});
    }
  }
  return visited;
}

test('all sixteen terrestrial maps have stable, reachable minor sites spread across the land', () => {
  const maps = [0, 1, 2, 3].map(region => ({region})).concat(AREAS.filter(area => area.kind === 'wild'));
  const allIds = new Set();
  for (const {region, id: area} of maps) {
    const state = {...createGame(), region, exploration: {area}};
    const {width, height} = worldSize(state);
    const landmarks = area ? areaSites(state) : [...TOWNS, ...DUNGEONS, ...WILD_SITES, PUTRID_PALACE, ...branchGates(region), teleporterSite(region)].filter(site => site.region === region);
    const terrain = Array.from({length: height}, (_, y) => Array.from({length: width}, (_, x) => area ? areaTile(state, x, y) : worldTile(region, x, y)));
    const tileAt = (x, y) => terrain[y]?.[x];
    const sites = minorSites(state, {tileAt, landmarks});
    assert.equal(sites.length, 26, area ?? region);
    const start = area ? landmarks.find(site => site.kind === 'returnGate') : {x: 64, y: 48};
    const access = reachable(start, tileAt);
    for (const point of landmarks) {
      if (point.id !== 'leviathan-pump' && !point.boatOnly) assert.ok(access.has(point.x + ',' + point.y), point.id);
    }
    const positions = new Set();
    const sectors = new Set();
    for (const {x, y, other, ...site} of sites) {
      assert.deepEqual(site, minorSiteDefinition(site.id));
      assert.equal(site.region, region);
      assert.equal(site.area, area ?? null);
      assert.ok(access.has(x + ',' + y), site.id);
      assert.notEqual(tileAt(x, y), 'road', site.id);
      assert.ok(landmarks.every(p => Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) > 3), site.id);
      if (!other) assert.ok(!allIds.has(site.id), site.id);
      else {
        assert.equal(site.kind, 'tunnel');
        const far = sites.find(p => p.id === site.id && p.x === other.x && p.y === other.y);
        assert.deepEqual(far?.other, {x, y}, site.id);
        assert.ok(tileAt(Math.round((x + far.x) / 2), Math.round((y + far.y) / 2)) === 'mountain', site.id);
      }
      allIds.add(site.id);
      positions.add(x + ',' + y);
      sectors.add(Math.floor((x - 1) * 6 / (width - 2)) + ',' + Math.floor((y - 1) * 4 / (height - 2)));
    }
    assert.equal(positions.size, 26);
    assert.ok(sectors.size >= 19, area ?? region);
    assert.deepEqual(sites, minorSites({...state, x: 110, y: 40, level: 50, treasureSeed: 6123}, {tileAt, landmarks: [...landmarks].reverse()}));
  }
  assert.equal(allIds.size, 400);
});

test('each land has eight caves, shrines, and cemeteries with all shrine variants', () => {
  for (const land of ['r0', 'r3', 'w0', 'w11']) {
    const definitions = Array.from({length: 24}, (_, i) => minorSiteDefinition('minor-' + land + '-' + i));
    const caves = definitions.filter(site => site.kind === 'koboldCave');
    const shrines = definitions.filter(site => site.kind === 'ruinedShrine');
    const cemeteries = definitions.filter(site => site.kind === 'cemetery');
    assert.equal(caves.length, 8);
    assert.ok(caves.every(site => site.floors === 1 && site.guarded));
    assert.equal(shrines.length, 8);
    assert.ok(shrines.every(site => site.floors === 1));
    assert.equal(new Set(shrines.map(site => [site.guarded, site.treasure, site.trapped].join(','))).size, 8);
    assert.equal(cemeteries.length, 8);
    assert.deepEqual(new Set(cemeteries.map(site => site.floors)), new Set([1, 2, 3]));
    assert.equal(new Set(definitions.map(site => site.seed)).size, 24);
  }
  for (const bad of ['minor-r4-0', 'minor-w12-0', 'minor-r0-25', 'minor-r0-00', 'minor-planet-0-0']) assert.equal(minorSiteDefinition(bad), null);
  assert.deepEqual(minorSites({region: 1, exploration: {area: 'planet-0'}}, {tileAt: () => assert.fail('planet terrain queried'), landmarks: []}), []);
});

test('rivers block movement except at bridges and wetlands remain walkable', () => {
  const at = (x, y) => worldTile(0, x, y);
  const left = Array.from({length: 128}, (_, x) => x).find(x => at(x, 48) === 'bridge');
  assert.ok(left, 'the river intersects the main road');
  let right = left;
  while (at(right, 48) === 'bridge') right++;
  let s = {...createGame(), gold:1000, x: left - 1, y: 48};
  const east = {type: 'move', dx: 1, dy: 0};
  for (let x = left; x <= right; x++) {
    s = act(s, east, [], {noRandom: true});
    assert.equal(s.x, x);
    if(s.flags.bridgeTroll)s=act(s,{type:'bridgeTroll',choice:'gold'});
  }
  const bank = Array.from({length: 127}, (_, x) => x).find(x => walkable(at(x, 47)) && at(x + 1, 47) === 'water');
  assert.ok(bank, 'the same river has an unbridged bank');
  Object.assign(s, {x: bank, y: 47});
  assert.equal(act(s, east, [], {noRandom: true}).x, bank);
  s.flags.sailboatReady = true;
  assert.equal(act(s, east, [], {noRandom: true}).x, bank + 1);
  assert.ok(Array.from({length: 128 * 96}, (_, i) => i).some(i => at(i % 128, Math.floor(i / 128)) === 'swamp'));
});

test('both mountain tunnel entrances work through normal dungeon movement and save/load', () => {
  const outdoor = {...createGame(), exploration: {area: 'wild-0', artifacts: [], home: {region: 0, x: 64, y: 4}}};
  const entrances = minorSiteList(outdoor).filter(site => site.minorKind === 'tunnel');
  assert.equal(entrances.length, 2);
  for (const entrance of entrances) {
    let s = act({...outdoor, x: entrance.x, y: entrance.y}, {type: 'enter'});
    assert.equal(s.dungeon.minorId, entrance.id);
    assert.deepEqual(s.dungeon.tunnelExit, entrance.other);
    const back = act(s, {type: 'leave'});
    assert.deepEqual([back.mode, back.x, back.y], ['world', entrance.x, entrance.y]);
    const map = dungeonMap(s.dungeon), route = [{x: 1, y: 1, steps: []}], seen = new Set(['1,1']);
    for (const {x, y, steps} of route) {
      if (x === 13 && y === 13) break;
      DIRS.forEach(([dx, dy], direction) => {
        const nx = x + dx, ny = y + dy, key = nx + ',' + ny;
        if (map[ny]?.[nx] === undefined || map[ny][nx] === 1 || seen.has(key)) return;
        seen.add(key);
        route.push({x: nx, y: ny, steps: [...steps, direction]});
      });
    }
    const destination = route.find(point => point.x === 13 && point.y === 13);
    assert.ok(destination);
    for (const [index, direction] of destination.steps.entries()) {
      const relative = (direction - s.dungeon.dir + 4) % 4;
      s = act(s, [{type: 'forward'}, {type: 'strafe', delta: 1}, {type: 'back'}, {type: 'strafe', delta: -1}][relative]);
      if (index === 6) s = loadGame(saveGame(s));
    }
    s = act(s, {type: 'descend'});
    assert.equal(s.mode, 'world');
    assert.deepEqual([s.x, s.y], [entrance.other.x, entrance.other.y]);
    assert.equal(s.exploration.area, 'wild-0');
  }
});

test('curved coasts vary their shoreline and leave optional Vesper passages accessible by boat', () => {
  const shore = Array.from({length: 45}, (_, i) => {
    const y = i + 16;
    return Array.from({length: 16}, (_, x) => x + 1).find(x => walkable(worldTile(0, x, y)));
  });
  assert.ok(new Set(shore).size >= 5);
  assert.ok(shore.some((x, i) => i > 0 && x > shore[i - 1]));
  assert.ok(shore.some((x, i) => i > 0 && x < shore[i - 1]));

  const passages = branchGates(3).filter(gate => gate.boatOnly);
  assert.deepEqual(passages.map(gate => gate.area), ['wild-10', 'wild-11']);
  for (const gate of passages) {
    assert.match(gate.name, /Sailing passage/);
    assert.equal(worldTile(3, gate.x, gate.y), 'water');
    const [dx, dy] = gate.direction === 'west' ? [-1, 0] : [0, 1];
    const move = {type: 'move', dx, dy};
    let x = gate.x - dx, y = gate.y - dy;
    while (worldTile(3, x, y) === 'water') { x -= dx; y -= dy; }
    let s = {...createGame(), region: 3, x, y};
    const onFoot = act(s, move);
    assert.deepEqual([onFoot.x, onFoot.y], [x, y]);
    const localRelics = DUNGEONS.filter(dungeon => dungeon.region === 3).map(dungeon => dungeon.id);
    const swimmer = {...s, relics: localRelics, x: gate.x, y: gate.y, buffExpiry: {waterBreathing: s.worldTimeMs + 60_000}};
    const refused = act(swimmer, {type: 'enter'});
    assert.equal(refused.exploration?.area, undefined);
    assert.equal(refused.enemy, null);
    assert.match(refused.log.at(-1), /need a boat/);
    const dragon = {...swimmer, relics: [], buffExpiry: {}, flags: {...s.flags, mount: 'dragon', mounts: ['dragon']}};
    let flight = act(dragon, {type: 'enter'});
    assert.equal(flight.exploration.area, gate.area);
    const landing = areaSites(flight).find(point => point.kind === 'returnGate');
    flight = act({...flight, x: landing.x, y: landing.y}, {type: 'enter'});
    assert.deepEqual([flight.x, flight.y, flight.exploration.area], [gate.x, gate.y, null]);
    s.bag.push('shrinkable-sailboat');
    s = act(s, {type: 'useItem', id: 'shrinkable-sailboat'});
    for (let step = 0; step < Math.abs(gate.x - x) + Math.abs(gate.y - y); step++) s = act(s, move, [], {noRandom: true});
    assert.equal(pointAt(s)?.id, gate.id);
    assert.equal(act(s, {type: 'enter'}).exploration?.area, undefined);
    s = act({...s, relics: localRelics}, {type: 'enter'});
    assert.equal(s.exploration.area, gate.area);
    s = act({...s, x: landing.x, y: landing.y}, {type: 'enter'});
    assert.deepEqual([s.x, s.y, s.exploration.area], [gate.x, gate.y, null]);

    const booth = teleporterSite(3), crystal = {...createGame(), region: 3, x: booth.x, y: booth.y};
    crystal.flags.visitedLands = [0, 3, gate.area];
    crystal.bag.push('teleporter-crystal');
    let returning = act(crystal, {type: 'crystalTravel', land: gate.area});
    assert.equal(returning.exploration.area, gate.area);
    assert.ok(!returning.bag.includes('teleporter-crystal'));
    returning = act({...returning, x: landing.x, y: landing.y}, {type: 'enter'});
    assert.deepEqual([returning.x, returning.y, returning.exploration.area], [x, y, null]);
    assert.match(returning.log.at(-1), /mainland shore/);
  }
});

test('fast branch travel stops on a minor site before its next step', () => {
  const s = {...createGame(), exploration: {area: 'wild-0', artifacts: [], home: {region: 0, x: 64, y: 4}}};
  s.equippedBoots = 'boots-speed-2';s.bag.push(s.equippedBoots);
  const site = minorSiteList(s).find(site => {
    return DIRS.some(([dx, dy]) => [1, -1, -2].every(n => walkable(areaTile(s, site.x + dx * n, site.y + dy * n))));
  });
  assert.ok(site);
  const [dx, dy] = DIRS.find(([dx, dy]) => [1, -1, -2].every(n => walkable(areaTile(s, site.x + dx * n, site.y + dy * n))));
  const next = act({...s, x: site.x + dx, y: site.y + dy}, {type: 'move', dx: -dx, dy: -dy}, [], {noRandom: true});
  assert.deepEqual([next.x, next.y], [site.x, site.y]);
  assert.equal(pointAt(next)?.id, site.id);
});
