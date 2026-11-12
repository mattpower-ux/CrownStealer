import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWNS} from '../public/game/content.js';
import {townPlaces} from '../public/game/town.js';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import * as castles from '../public/game/castle-interiors.js';

function guest(townId = 'bellwether') {
  const town = TOWNS.find(t => t.id === townId);
  const s = {
    mode: 'town', location: townId, region: town.region, x: town.x, y: town.y,
    flags: {guardVictories: 0}, bag: [], pendingLoot: [], log: [], gold: 2200, turns: 0,
  };
  const {x, y} = townPlaces(s).find(place => place.id === 'court');
  s.townPosition = {x, y};
  return s;
}

function options(roll = .1) {
  return {
    random: () => roll,
    dexterity: () => 10,
    note: (state, message) => state.log.push(message),
    clock: state => state.turns++,
    startGuard: state => {
      state.returnMode = state.mode;
      state.mode = 'battle';
      state.enemy = {name: 'Palace Guard', guard: true};
    },
  };
}

function standOnChest(s, settings = options()) {
  castles.castleAction(s, {type: 'enterCastle'}, settings);
  const {x, y} = castles.castleLayout(s.location).chests[0];
  Object.assign(s.castle, {x, y});
}

test('castle rooms, chests and throne are connected to the town entrance by walkable corridors', () => {
  for (const town of TOWNS) {
    const {tiles, rooms, chests, entrance, throne} = castles.castleLayout(town.id);
    const open = [entrance];
    const visited = new Set([entrance.x + ',' + entrance.y]);
    for (const {x, y} of open) {
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy, id = nx + ',' + ny;
        if (!tiles[ny]?.[nx] || tiles[ny][nx] === 'wall' || visited.has(id)) continue;
        visited.add(id);
        open.push({x: nx, y: ny});
      }
    }
    assert.ok(rooms.length >= 5);
    for (const {x, y} of [...rooms, ...chests, throne]) assert.ok(visited.has(x + ',' + y), town.id);
  }
});

test('entering at the court allows one-square movement and leaving at the doors', () => {
  const s = guest();
  const settings = options();
  s.townPosition = {x: 6, y: 11};
  castles.castleAction(s, {type: 'enterCastle'}, settings);
  assert.equal(s.castle, undefined);
  const court = townPlaces(s).find(place => place.id === 'court');
  s.townPosition = {x: court.x, y: court.y};
  castles.castleAction(s, {type: 'enterCastle'}, settings);
  const {x, y} = s.castle;
  castles.castleAction(s, {type: 'move', dx: 1, dy: 0}, settings);
  assert.deepEqual([s.castle.x, s.castle.y, s.turns], [x, y, 0]);
  castles.castleAction(s, {type: 'move', dx: 0, dy: -1}, settings);
  assert.deepEqual([s.castle.x, s.castle.y, s.turns], [x, y - 1, 1]);
  castles.castleAction(s, {type: 'leaveCastle'}, settings);
  assert.ok(s.castle);
  castles.castleAction(s, {type: 'move', dx: 0, dy: 1}, settings);
  assert.equal(s.castle, undefined);
  assert.equal(s.mode, 'town');
  assert.deepEqual(s.townPosition, {x: court.x, y: court.y});
});

test('leaving a chest untouched and successfully robbing it are distinct choices', () => {
  const s = guest();
  standOnChest(s);
  const chest = castles.castleChestAt(s);
  const gold = s.gold;
  castles.castleAction(s, {type: 'leaveCastleChest'}, options());
  assert.equal(s.gold, gold);
  assert.deepEqual(castles.castleChestAt(s), chest);
  castles.castleAction(s, {type: 'robCastleChest'}, options());
  assert.ok(s.gold > gold);
  assert.equal(castles.castleChestAt(s), null);
  assert.equal(castles.castleChestAt(JSON.parse(JSON.stringify(s))), null);
});

test('a failed lockpick alerts the guards and sets a persistent 2,000-gold fine at that town', () => {
  const s = guest();
  const settings = options(.95);
  standOnChest(s, settings);
  castles.castleAction(s, {type: 'robCastleChest'}, settings);
  assert.equal(s.mode, 'battle');
  assert.equal(s.enemy.castleRobbery, true);
  assert.equal(s.flags['townFaction:bellwether'], -20);
  assert.equal(castles.castleFineFor(s, 'bellwether'), 2000);
  assert.equal(castles.castleFineFor(s, 'mothbridge'), 0);
  assert.ok(castles.validCastleState(JSON.parse(JSON.stringify(s))));
});

test('fearful guards enforce the gate fine without starting a fight', () => {
  const s = guest();
  const settings = options(.95);
  s.flags.guardVictories = 3;
  standOnChest(s, settings);
  castles.castleAction(s, {type: 'robCastleChest'}, settings);
  assert.equal(s.mode, 'town');
  assert.equal(s.enemy, undefined);
  assert.equal(castles.castleFineFor(s, s.location), 2000);
  const town = TOWNS.find(t => t.id === s.location);
  castles.exitCastle(s, true);
  castles.castleAction(s, {type: 'payCastleFine'}, settings);
  assert.equal(s.gold, 2200);
  s.x = town.x;
  s.y = town.y;
  s.gold = 1999;
  castles.castleAction(s, {type: 'payCastleFine'}, settings);
  assert.equal(castles.castleFineFor(s, town.id), 2000);
  s.gold = 2200;
  castles.castleAction(s, {type: 'payCastleFine'}, settings);
  assert.equal(s.gold, 200);
  assert.equal(castles.castleFineFor(s, town.id), 0);
  assert.equal(s.flags['townFaction:bellwether'], -20);
});

test('a failed castle theft triggers real guards, and its gate ban survives the third victory', () => {
  const town = TOWNS.find(t => t.id === 'mothbridge');
  let s = act({...createGame(), x: town.x, y: town.y, gold: 2400}, {type: 'enter'});
  const {x, y} = townPlaces(s).find(p => p.id === 'court');
  s.townPosition = {x, y};
  s = act(s, {type: 'enterCastle'});
  const chest = castles.castleLayout(s.location).chests[0];
  Object.assign(s.castle, {x: chest.x, y: chest.y});
  s.rng = 187441;
  s = act(s, {type: 'robCastleChest'});
  for (let i = 0; i < 3; i++) {
    assert.equal(s.enemy?.castleRobbery, true);
    s.enemy.hp = 1;
    s.rng = 187441;
    s.level = 100;
    s = loadGame(saveGame(act(s, {type: 'attack'})));
  }
  assert.equal(s.flags.guardVictories, 3);
  assert.equal(s.mode, 'town');
  assert.equal(s.flags['townGarrison:mothbridge'], undefined);
  Object.assign(s.castle, castles.castleLayout(s.location).entrance);
  s = act(s, {type: 'leaveCastle'});
  assert.equal(s.mode, 'world');
  assert.equal(s.castle, undefined);
  Object.assign(s, {x: town.x, y: town.y});
  assert.equal(act(s, {type: 'enter'}).mode, 'world');
  s = act(s, {type: 'payCastleFine'});
  assert.equal(castles.castleFineFor(s, town.id), 0);
  assert.equal(act(s, {type: 'enter'}).mode, 'town');
});
