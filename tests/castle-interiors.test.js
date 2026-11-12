import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWNS} from '../public/game/content.js';
import {townPlaces, townPosition, townWalkable} from '../public/game/town.js';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import {itemById} from '../public/game/items.js';
import {BALROG_WHIP} from '../public/game/bottomless-pit.js';
import {ATTRIBUTE_CAP, attributePointsAvailable} from '../public/game/attributes.js';
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
  assert.equal(layout.patrols.length, 4);
  assert.equal(castles.castleGuards(guest()).length, 16);
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
    assert.ok(layout.guards.every(({x, y}) => layout.tiles[y][x] !== 'wall'));
    assert.ok(layout.guards.some(({x, y}) => layout.tiles[y][x] === 'vestibule'));
    assert.ok(layout.guards.some(({x, y}) => layout.tiles[y][x] === 'hall'));
    assert.ok(layout.guards.some(({x, y}) => layout.tiles[y][x] === 'audience'));
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
  let events = [];
  const approached = new Set();
  s = act(s, {type: 'robCastleChest'}, events);
  assert.deepEqual([s.enemy.level, s.enemy.hp, s.enemy.maxHp, s.enemy.attack, s.enemy.armor], [35, 630, 630, 77, 32]);
  for (let i = 0; i < 3; i++) {
    assert.equal(s.enemy?.castleRobbery, true);
    const approach = events.find(event => event.kind === 'castleGuardApproach');
    assert.ok(approach);
    assert.ok(!approached.has(approach.guardId));
    approached.add(approach.guardId);
    s.enemy.hp = 1;
    s.rng = 187441;
    s.level = 100;
    events = [];
    s = loadGame(saveGame(act(s, {type: 'attack'}, events)));
  }
  assert.ok(!events.some(event => event.kind === 'castleGuardApproach'));
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

const dismissal = 'What are you doing here? Guards, get this nitwit out of my sight!';

function palaceAt(townId, x, y) {
  const visitor = guest(townId);
  return {...createGame(), mode: visitor.mode, location: visitor.location, region: visitor.region, x: visitor.x, y: visitor.y,
    townPosition: visitor.townPosition, castle: {x, y, alarm: false}, gold: 6500};
}

test('the King offers three deliberate choices and leaving escorts a dismissed visitor to the foyer', () => {
  let s = palaceAt('bellwether', 9, 2);
  assert.deepEqual(castles.castleInteractionsAt(s).filter(p => p.kind !== 'guard').map(p => p.id), ['king', 'princess']);
  assert.deepEqual(castles.castleInteractionActions(s, 'king').map(choice => choice.label), ['Leave the Room', 'Report on Your Progress', 'Attack']);
  s = act(s, {type: 'castleTalk', id: 'king'});
  assert.equal(s.log.at(-1), 'King Malachi the Ineffable: ' + dismissal);
  s = act(s, {type: 'castleReport', id: 'king'});
  assert.equal(s.log.at(-1), 'King Malachi the Ineffable: ' + dismissal);
  s = act(s, {type: 'castleLeaveRoom', id: 'king'});
  assert.equal(s.mode, 'town');
  assert.equal(s.enemy, null);
  assert.equal(castles.castleLayout('bellwether').tiles[s.castle.y][s.castle.x], 'vestibule');
  assert.match(s.log.at(-1), /guards escort you/i);
  assert.equal(castles.castleInteractionAt(s, 'king'), null);
});

test('royal progress is reportable once and reports never pay for or submit quest proofs', () => {
  let s = palaceAt('bellwether', 9, 2);
  s.flags.royalQuest = 'escaped';
  s = act(s, {type: 'castleReport', id: 'king'});
  assert.equal(s.flags.royalQuest, 'wang');
  s.flags.wangDefeated = true;
  s.bag.push('wang-sceptre');
  s.gold = 4999;
  s = act(s, {type: 'castleTalk', id: 'king'});
  assert.doesNotMatch(s.log.at(-1), /nitwit/);
  s = loadGame(saveGame(act(s, {type: 'castleReport', id: 'king'})));
  assert.match(s.log.at(-1), /Wang/);
  assert.equal(s.flags.royalQuest, 'wang');
  assert.equal(s.gold, 4999);
  assert.ok(s.bag.includes('wang-sceptre'));
  assert.equal(act(s, {type: 'castleReport', id: 'king'}).log.at(-1), 'King Malachi the Ineffable: ' + dismissal);

  s.gold = 6500;
  s = act(s, {type: 'castleReport', id: 'king'});
  assert.match(s.log.at(-1), /5,000 gold/);
  assert.equal(s.gold, 6500);
  assert.ok(s.bag.includes('wang-sceptre'));
  s = act(s, {type: 'royalWang'});
  assert.equal(s.flags.wangTrialComplete, true);
  assert.equal(s.gold, 1500);
  assert.ok(!s.bag.includes('wang-sceptre'));
});

test('the Princess acknowledges later royal milestones and leaves the Balrog whip for the actual turn-in', () => {
  let s = palaceAt('bellwether', 9, 2);
  Object.assign(s.flags, {royalQuest: 'trial', galenFreed: true, wangTrialComplete: true, 'garrison:0': true, balrogDefeated: true});
  s.bag.push(BALROG_WHIP);
  s = loadGame(saveGame(act(s, {type: 'castleReport', id: 'princess'})));
  assert.match(s.log.at(-1), /^Princess Bunnyfoot: .*Galen.*garrison.*Balrog/);
  assert.equal(s.flags.royalQuest, 'trial');
  assert.ok(s.bag.includes(BALROG_WHIP));
  assert.doesNotMatch(act(s, {type: 'castleReport', id: 'princess'}).log.at(-1), /Galen|Balrog/);
  s = act(s, {type: 'royalWhip'});
  assert.equal(s.flags.royalQuest, 'audience');
  assert.ok(!s.bag.includes(BALROG_WHIP));
});

test('nearby chests and guards are individually interactable and the guard fight leaves garrison progress alone', () => {
  const layout = castles.castleLayout('bellwether');
  const chest = layout.chests[0];
  let s = palaceAt('bellwether', chest.x, chest.y + 1);
  assert.equal(castles.castleInteractionAt(s, chest.id).kind, 'chest');
  const rob = castles.castleInteractionActions(s, chest.id).find(choice => choice.action.type === 'robCastleChest').action;
  s.rng = 0;
  assert.equal(act(s, {type: 'robCastleChest'}).gold, s.gold);
  const looted = act(s, rob);
  assert.equal(looted.gold, s.gold + chest.gold);
  assert.equal(castles.castleInteractionAt(looted, chest.id), null);

  s = palaceAt('bellwether', 9, 4);
  const guard = layout.guards.find(p => p.x === 8 && p.y === 4);
  const other = layout.guards.find(p => p.x === 10 && p.y === 4);
  assert.ok(castles.castleInteractionsAt(s).some(p => p.id === other.id));
  s.flags.guardVictories = 3;
  s.flags.royalGuardWins = 7;
  const spoken = act(s, {type: 'castleTalk', id: guard.id});
  assert.match(spoken.log.at(-1), /Royal Throne Guard/);
  s = loadGame(saveGame(act(spoken, {type: 'attackCastleGuard', id: guard.id})));
  assert.equal(s.mode, 'battle');
  assert.equal(s.enemy.castleDuel, guard.id);
  assert.equal(s.enemy.groupSize, undefined);
  s.enemy.hp = 1;
  s.level = 100;
  s.rng = 187441;
  const won = loadGame(saveGame(act(s, {type: 'attack'})));
  assert.equal(won.mode, 'town');
  assert.equal(won.gold, s.gold);
  assert.equal(won.flags.royalGuardWins, 7);
  assert.equal(won.flags.guardVictories, 3);
  assert.equal(won.enemy, null);
});

test('losing or fleeing an individual palace duel preserves earlier garrison progress', () => {
  const town = 'mothbridge';
  const s = palaceAt(town, 9, 4);
  const guard = castles.castleInteractionsAt(s).find(p => p.kind === 'guard');
  const progress = 'palaceWins:' + town;
  s.flags[progress] = 2;
  const duel = act(s, {type: 'attackCastleGuard', id: guard.id});
  const fled = loadGame(saveGame(act({...duel, rng: 1024}, {type: 'flee'})));
  assert.equal(fled.mode, 'town');
  assert.equal(fled.flags[progress], 2);
  const defeated = loadGame(saveGame(act({...duel, hp: 1}, {type: 'guard'})));
  assert.equal(defeated.mode, 'world');
  assert.equal(defeated.flags[progress], 2);
  assert.equal(defeated.gold, s.gold);
  assert.equal(defeated.flags['palaceBan:' + town], undefined);
});

test('the full Bellwether floor plan connects the new chambers and preserves original anchors', () => {
  const layout = castles.castleLayout('bellwether');
  assert.ok(layout.width > 19);
  assert.deepEqual(layout.entrance, {x: 9, y: 14});
  assert.deepEqual(layout.throne, {x: 9, y: 2});
  assert.deepEqual(layout.chests.filter(chest => ['castleChest:bellwether:armory', 'castleChest:bellwether:treasury'].includes(chest.id)).map(({x,y}) => [x,y]), [[3,9],[15,9]]);
  assert.equal(layout.guards.length, 12);
  assert.deepEqual(layout.dungeonStair, {x: 10, y: 13});
  assert.equal(layout.tiles[13][10], 'stair');
  assert.equal(castles.castleLayout('mothbridge').dungeonStair, null);

  const queue = [layout.entrance];
  const seen = new Set([layout.entrance.x + ',' + layout.entrance.y]);
  for (const {x,y} of queue) {
    for (const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const next = {x:x+dx,y:y+dy}, key = next.x + ',' + next.y;
      const tile = layout.tiles[next.y]?.[next.x];
      if (tile && tile !== 'wall' && !seen.has(key)) {
        seen.add(key);
        queue.push(next);
      }
    }
  }
  const names = ['Throne Room','Front Foyer','Royal Armory','Privy Council Room','Royal Fun Room','Chastity Chamber','Guards’ Barracks','Royal Kitchen','Pantry','Banquet Hall','Castle Chapel','Royal Library','Guest Chambers','Servants’ Quarters','Linen Room','Wine Store'];
  for (const name of names) {
    const room = layout.rooms.find(room => room.name === name);
    assert.ok(room, name);
    assert.ok(seen.has((room.x + Math.floor(room.width / 2)) + ',' + (room.y + Math.floor(room.height / 2))), name);
  }
  assert.ok(seen.has('10,13'), 'royal dungeon stair');
  assert.equal(seen.size, layout.tiles.flat().filter(tile => tile !== 'wall').length);
  for (const town of TOWNS.filter(town => town.id !== 'bellwether')) {
    const regional = castles.castleLayout(town.id);
    assert.equal(layout.rooms.length, 3 * regional.rooms.length, town.id);
    const ratio = seen.size / regional.tiles.flat().filter(tile => tile !== 'wall').length;
    assert.ok(ratio >= 2.8 && ratio <= 3.3, `${town.id} ${ratio}`);
  }
});

test('every palace treasury contains several distinct substantial chests', () => {
  for (const town of TOWNS) {
    const layout = castles.castleLayout(town.id);
    const chests = layout.chests.filter(chest => chest.treasurySlot !== undefined);
    const royal = town.id === 'bellwether';
    assert.equal(chests.length, royal ? 5 : 3, town.id);
    assert.deepEqual(chests.map(chest => chest.treasurySlot), royal ? [0, 1, 2, 3, 4] : [0, 1, 2]);
    assert.ok(chests.some(chest => chest.id === `castleChest:${town.id}:treasury`));
    assert.equal(new Set(chests.map(chest => chest.id)).size, chests.length);
    assert.equal(new Set(chests.map(({x,y}) => `${x},${y}`)).size, chests.length);
    assert.ok(chests.every(chest => chest.gold >= (royal ? 1000 : 300) && layout.tiles[chest.y][chest.x] === 'treasury'));
  }
});

test('treasury loot respects hero level, survives saves, and is granted only by a successful lockpick', () => {
  const [first, second, third] = castles.castleLayout('bellwether').chests.filter(chest => chest.treasurySlot !== undefined);
  let s = palaceAt('bellwether', first.x, first.y);
  s.level = 4;
  s.rng = 0;
  const originalBag = [...s.bag];
  const originalGold = s.gold;
  s = loadGame(saveGame(act(s, {type: 'robCastleChest', id: first.id})));
  assert.equal(s.gold, originalGold + first.gold);
  assert.deepEqual(s.bag, originalBag);
  assert.equal(s.flags[first.id], true);
  assert.equal(act(s, {type: 'robCastleChest', id: first.id}).gold, s.gold);

  s.level = 5;
  s.rng = 0;
  Object.assign(s.castle, {x: second.x, y: second.y});
  s = loadGame(saveGame(act(s, {type: 'robCastleChest', id: second.id})));
  assert.equal(s.gold, originalGold + first.gold + second.gold);
  const found = s.bag.slice(originalBag.length);
  assert.equal(found.length, 1);
  assert.equal(itemById(found[0], s).rarity, 'rare');
  assert.ok(s.pendingLoot.includes(found[0]));
  assert.deepEqual(act(s, {type: 'robCastleChest', id: second.id}).bag, s.bag);

  s.rng = 187441;
  s.flags.guardVictories = 3;
  Object.assign(s.castle, {x: third.x, y: third.y});
  const failed = loadGame(saveGame(act(s, {type: 'robCastleChest', id: third.id})));
  assert.equal(failed.flags[third.id], undefined);
  assert.deepEqual(failed.bag, s.bag);
  assert.deepEqual(failed.pendingLoot, s.pendingLoot);
  assert.equal(failed.gold, s.gold);
  assert.equal(castles.castleFineFor(failed, 'bellwether'), 2000);
});

test('a failed robbery starts combat only after assigning a visible guard’s walkable approach path', () => {
  const town = 'mothbridge';
  const layout = castles.castleLayout(town);
  const chest = layout.chests.find(chest => chest.treasurySlot === 0);
  const hero = palaceAt(town, chest.x, chest.y);
  hero.rng = 187441;
  const events = [];
  const battle = loadGame(saveGame(act(hero, {type: 'robCastleChest', id: chest.id}, events)));
  const approach = events.find(event => event.kind === 'castleGuardApproach');
  assert.equal(battle.mode, 'battle');
  assert.ok(approach?.path.length > 1);
  const origin = layout.guards.find(guard => guard.id === approach.guardId);
  assert.deepEqual(approach.path[0], {x: origin.x, y: origin.y});
  const landing = approach.path.at(-1);
  const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  assert.equal(distance(landing, hero.castle), 1);
  for (let i = 1; i < approach.path.length; i++) {
    const {x, y} = approach.path[i];
    assert.equal(distance(approach.path[i-1], {x, y}), 1);
    assert.notEqual(layout.tiles[y][x], 'wall');
  }
  assert.deepEqual(battle.castle.guardPositions[origin.id], landing);
  const moved = castles.castleGuards(battle).find(guard => guard.id === origin.id);
  assert.deepEqual({x: moved.x, y: moved.y}, landing);
  const invalid = structuredClone(battle);
  invalid.castle.guardPositions[origin.id] = {x: 0, y: 0};
  assert.throws(() => loadGame(saveGame(invalid)), /Invalid castle state/);

  const feared = {...hero, flags: {...hero.flags, guardVictories: 3}};
  const quiet = [];
  const passed = act(feared, {type: 'robCastleChest', id: chest.id}, quiet);
  assert.equal(passed.mode, 'town');
  assert.equal(passed.castle.guardPositions, undefined);
  assert.ok(!quiet.some(event => event.kind === 'castleGuardApproach'));
});

test('palace Libraries preserve archive tiles and place distinct readable books in each library', () => {
  const ids = new Set();
  for (const town of TOWNS) {
    const layout = castles.castleLayout(town.id);
    assert.equal(layout.rooms.find(room => room.id === 'archive').name, 'Library');
    for (const room of layout.rooms.filter(room => ['archive', 'library'].includes(room.id))) {
      const books = layout.books.filter(book => book.room === room.id);
      assert.ok(books.length > 0, `${town.id} ${room.id}`);
      assert.ok(books.some(book => book.rarity === 'rare'), `${town.id} ${room.id} rare tome`);
      for (const book of books) {
        assert.equal(book.kind, 'book');
        assert.equal(layout.tiles[book.y][book.x], room.id);
        assert.ok(book.name && book.text);
        assert.ok(!ids.has(book.id), book.id);
        ids.add(book.id);
      }
    }
  }
});

test('reading a library book requires reaching it, journals its text, and persists without changing inventory', () => {
  const town = 'mothbridge';
  const layout = castles.castleLayout(town);
  const book = layout.books.find(book => book.rarity !== 'rare');
  const key = 'castleBookRead:' + book.id;
  const distant = palaceAt(town, layout.entrance.x, layout.entrance.y);
  assert.equal(act(distant, {type: 'readCastleBook', id: book.id}).flags[key], undefined);

  const [x, y] = [[book.x-1, book.y], [book.x+1, book.y], [book.x, book.y-1], [book.x, book.y+1]]
    .find(([x, y]) => layout.tiles[y]?.[x] && layout.tiles[y][x] !== 'wall');
  const hero = palaceAt(town, x, y);
  assert.equal(castles.castleInteractionAt(hero, book.id).read, false);
  const [read, leave] = castles.castleInteractionActions(hero, book.id);
  assert.equal(read.label, 'Read');
  assert.equal(act(hero, leave.action).flags[key], undefined);
  const result = loadGame(saveGame(act(hero, read.action)));
  assert.equal(result.flags[key], true);
  assert.equal(castles.castleInteractionAt(result, book.id).read, true);
  assert.equal(result.log.at(-1), book.name + ': ' + book.text);
  assert.equal(result.gold, hero.gold);
  assert.deepEqual(result.bag, hero.bag);
  result.flags['castleBookRead:unknown'] = true;
  assert.throws(() => loadGame(saveGame(result)), /Invalid castle state/);
});

test('a rare library book grants a permanent capped attribute gain once without spending level points', () => {
  const town = 'mothbridge';
  const book = castles.castleLayout(town).books.find(book => book.rarity === 'rare');
  const read = {type: 'readCastleBook', id: book.id};
  const blessing = 'castleBookBlessing:' + book.id;
  let s = palaceAt(town, book.x, book.y);
  s.level = 4;
  s = act(s, {type: 'allocateAttribute', attribute: 'strength'});
  const base = s.attributes[book.attribute];
  s = loadGame(saveGame(act(s, read)));
  assert.equal(s.attributes[book.attribute], base);
  assert.equal(s.flags[blessing], undefined);
  assert.match(s.log.at(-1), /level 5/i);

  s.level = 5;
  const points = attributePointsAvailable(s);
  const spent = s.attributePointsSpent;
  const learned = loadGame(saveGame(act(s, read)));
  assert.equal(learned.attributes[book.attribute], base + book.amount);
  assert.equal(learned.flags[blessing], true);
  assert.equal(castles.castleInteractionAt(learned, book.id).blessed, true);
  assert.equal(learned.attributePointsSpent, spent);
  assert.equal(attributePointsAvailable(learned), points);
  assert.match(learned.log.at(-1), /permanently/i);
  assert.equal(act(learned, read).attributes[book.attribute], learned.attributes[book.attribute]);

  const capped = act({...s, attributes: {...s.attributes, [book.attribute]: ATTRIBUTE_CAP}}, read);
  assert.equal(capped.attributes[book.attribute], ATTRIBUTE_CAP);
  assert.equal(capped.flags[blessing], undefined);
  assert.match(capped.log.at(-1), /already at its maximum/i);

  delete learned.flags['castleBookRead:' + book.id];
  assert.throws(() => loadGame(saveGame(learned)), /Invalid castle state/);
});
