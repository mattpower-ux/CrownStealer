import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWNS} from '../public/game/content.js';
import {townPlaces, townPosition, townWalkable} from '../public/game/town.js';
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

test('Bellwether has twelve distinct throne guards and two royal figures in its audience chamber', () => {
  const layout = castles.castleLayout('bellwether');
  const figures = castles.castleFigures(guest());
  assert.deepEqual(figures.map(figure => figure.id), ['king', 'princess']);
  assert.deepEqual({x: figures[0].x, y: figures[0].y}, layout.throne);
  assert.equal(layout.guards.length, 12);
  assert.equal(new Set(layout.guards.map(guard => guard.id)).size, 12);
  const occupied = [...figures, ...layout.guards].map(({x, y}) => {
    assert.ok(['audience', 'door'].includes(layout.tiles[y]?.[x]));
    return `${x},${y}`;
  });
  assert.equal(new Set(occupied).size, 14);
  assert.deepEqual(castles.castleFigures(guest('mothbridge')).map(figure => figure.id), ['governor']);
  const tyrant = guest();
  tyrant.flags.kingUsurped = tyrant.flags.princessImprisoned = true;
  assert.deepEqual(castles.castleFigures(tyrant), []);
});

test('each regional palace has a distinct governor and six visible guards', () => {
  const names = new Set();
  const genders = new Set();
  for (const town of TOWNS.filter(town => town.id !== 'bellwether')) {
    const layout = castles.castleLayout(town.id);
    assert.equal(layout.guards.length, 6);
    assert.deepEqual(castles.castleFigures(guest(town.id)), [layout.governor]);
    assert.equal(layout.tiles[layout.governor.y][layout.governor.x], 'audience');
    assert.equal(new Set([...layout.guards, layout.governor].map(({x, y}) => `${x},${y}`)).size, 7);
    assert.ok(layout.guards.every(({x, y}) => layout.tiles[y][x] === 'audience'));
    names.add(layout.governor.name);
    genders.add(layout.governor.gender);
  }
  assert.equal(names.size, 11);
  assert.deepEqual(genders, new Set(['female', 'male']));
  for (const name of ['Countess Adrianna', 'Lord Krumble', 'Sir Pimple of Prock', 'Baron Huan the Rude', 'Lord Bladdar of Seldomkeep']) {
    assert.ok(names.has(name), name);
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
  assert.deepEqual([s.enemy.level, s.enemy.hp, s.enemy.maxHp, s.enemy.attack, s.enemy.armor], [35, 630, 630, 77, 32]);
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

test('paying the governor restores access to the palace maze through the court', () => {
  const town = TOWNS.find(t => t.id === 'mothbridge');
  let s = {...createGame(), x: town.x, y: town.y, gold: 5200};
  s.flags['palaceBan:' + town.id] = true;
  assert.equal(act(s, {type: 'enter'}).mode, 'world');
  s = act(s, {type: 'payGovernor'});
  assert.equal(s.gold, 200);
  s = act(s, {type: 'enter'});
  assert.equal(s.mode, 'town');
  const court = townPlaces(s).find(place => place.id === 'court');
  const queue = [{...townPosition(s), moves: []}];
  const visited = new Set();
  for (const {x, y, moves} of queue) {
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (x === court.x && y === court.y) {
      for (const move of moves) s = act(s, move);
      break;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (y + dy < 12 && townWalkable(x + dx, y + dy, s)) {
        queue.push({x: x + dx, y: y + dy, moves: [...moves, {type: 'move', dx, dy}]});
      }
    }
  }
  s = loadGame(saveGame(act(s, {type: 'enterCastle'})));
  assert.deepEqual(s.castle, {...castles.castleLayout(town.id).entrance, alarm: false});
});

test('the palace doors open after the local court fine is paid', () => {
  const {location, region, x, y, townPosition} = guest('mothbridge');
  let s = {...createGame(), mode: 'town', location, region, x, y, townPosition, gold: 400};
  s.wanted[region] = 2;
  s = act(s, {type: 'enterCastle'});
  assert.equal(s.castle, undefined);
  assert.match(s.log.at(-1), /pay your local fine/i);
  s = act(s, {type: 'pardon'});
  assert.equal(s.wanted[region], 0);
  assert.equal(s.gold, 350);
  s = act(s, {type: 'enterCastle'});
  assert.deepEqual(s.castle, {...castles.castleLayout(location).entrance, alarm: false});
});

function throneGuardFight() {
  const {location, region, x, y, townPosition} = guest();
  let s = {...createGame(), mode: 'town', location, region, x, y, townPosition, gold: 5000};
  Object.assign(s.flags, {guardVictories: 3, royalGuardWins: 20, 'garrison:0': true, 'townGarrison:bellwether': true});
  s = act(s, {type: 'enterCastle'});
  assert.equal(act(s, {type: 'attackCastleRoyal', target: 'king'}).mode, 'town');
  while (s.castle.y > 3) s = act(s, {type: 'move', dx: 0, dy: -1});
  assert.equal(castles.castleRoyalAt(s)?.id, 'king');
  assert.equal(castles.castleRoyalAt(s, 'princess'), null);
  s = act(s, {type: 'attackCastleRoyal', target: 'king'});
  assert.equal(s.mode, 'battle');
  assert.equal(s.enemy.guard, true);
  assert.equal(s.enemy.castleRoyalDefense, 'king');
  assert.equal(s.enemy.groupSize, 12);
  assert.equal(s.enemy.hp, s.enemy.memberHp * 12);
  assert.equal(castles.castleFineFor(s, s.location), 2000);
  return loadGame(saveGame(s));
}

test('attacking the King calls all twelve personal guards even after the garrison surrenders', () => {
  const fight = throneGuardFight();
  const invalid = structuredClone(fight);
  invalid.enemy.groupSize = 11;
  assert.throws(() => loadGame(saveGame(invalid)), /Invalid castle state/);
  fight.hp = 1;
  const rescued = act(fight, {type: 'guard'});
  assert.equal(rescued.mode, 'world');
  assert.equal(rescued.castle, undefined);
  assert.equal(rescued.flags.royalGuardWins, 20);
  assert.equal(castles.castleFineFor(rescued, 'bellwether'), 2000);
});

test('beating the personal guards leaves the royal campaign and robbery fine intact', () => {
  const s = throneGuardFight();
  s.enemy.hp = 1;
  s.level = 100;
  s.rng = 187441;
  const result = loadGame(saveGame(act(s, {type: 'attack'})));
  assert.equal(result.mode, 'world');
  assert.equal(result.castle, undefined);
  assert.equal(result.flags.royalGuardWins, 20);
  assert.equal(result.flags.guardVictories, 3);
  assert.equal(result.gold, s.gold);
  assert.equal(castles.castleFineFor(result, 'bellwether'), 2000);
});

function governorGuest() {
  const {location, region, x, y, townPosition} = guest('mothbridge');
  return {...createGame(), mode: 'town', location, region, x, y, townPosition, gold: 5000};
}

function approachGovernor(s) {
  const {throne} = castles.castleLayout(s.location);
  for (let y = s.castle.y; y > throne.y + 1; y--) s = act(s, {type: 'move', dx: 0, dy: -1});
  assert.equal(castles.castleRulerAt(s, 'governor').name, 'Countess Adrianna');
  return s;
}

test('attacking a governor triggers six personal guards with 70 percent of royal guard stats', () => {
  const royal = throneGuardFight().enemy;
  let s = governorGuest();
  s.flags.guardVictories = 3;
  s = act(s, {type: 'enterCastle'});
  assert.equal(castles.castleRulerAt(s), null);
  assert.equal(act(s, {type: 'attackCastleRoyal', target: 'governor'}).mode, 'town');
  s = approachGovernor(s);
  assert.equal(castles.castleRoyalAt(s), null);
  const location = s.location;
  s = loadGame(saveGame(act(s, {type: 'attackCastleRoyal', target: 'governor'})));
  assert.equal(s.mode, 'battle');
  assert.equal(s.enemy.castleRoyalDefense, 'governor');
  assert.equal(s.enemy.groupSize, 6);
  assert.equal(s.enemy.level, Math.round(royal.level * 7 / 10));
  for (const stat of ['memberHp', 'attack', 'armor']) assert.equal(s.enemy[stat], Math.round(royal[stat] * 7 / 10), stat);
  assert.equal(s.enemy.maxHp, s.enemy.memberHp * 6);
  assert.equal(castles.castleFineFor(s, location), 2000);
  assert.equal(s.flags['palaceWins:' + location], undefined);
});

test('the indoor garrison challenge starts a level-35 governor guard and describes it correctly', () => {
  const audience = approachGovernor(act(governorGuest(), {type: 'enterCastle'}));
  const s = act(audience, {type: 'challenge'});
  assert.equal(s.mode, 'battle');
  assert.equal(s.enemy.guardChallenge, true);
  assert.deepEqual([s.enemy.level, s.enemy.maxHp, s.enemy.attack, s.enemy.armor], [35, 630, 77, 32]);
  assert.match(s.log.at(-1), /Level 35 palace guard/);
  assert.doesNotMatch(s.log.at(-1), /level 50/i);
});

test('fleeing or losing to the governor’s personal guards preserves existing garrison wins', () => {
  const audience = approachGovernor(act(governorGuest(), {type: 'enterCastle'}));
  const town = audience.location;
  const progress = 'palaceWins:' + town;
  audience.flags[progress] = 2;
  const fight = loadGame(saveGame(act(audience, {type: 'attackCastleRoyal', target: 'governor'})));
  assert.equal(fight.enemy.castleRoyalDefense, 'governor');

  const fled = loadGame(saveGame(act({...fight, rng: 1024}, {type: 'flee'})));
  assert.equal(fled.mode, 'town');
  assert.equal(fled.enemy, null);
  assert.equal(fled.flags[progress], 2);
  assert.equal(castles.castleFineFor(fled, town), 2000);

  const defeated = loadGame(saveGame(act({...fight, hp: 1}, {type: 'guard'})));
  assert.equal(defeated.mode, 'world');
  assert.equal(defeated.enemy, null);
  assert.equal(defeated.flags[progress], 2);
  assert.equal(castles.castleFineFor(defeated, town), 2000);
});
