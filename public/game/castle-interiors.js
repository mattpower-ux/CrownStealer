import {rareGearEffect} from './rare-gear.js';
import {TOWNS} from './content.js';
import {townPlace} from './town.js';

export const CASTLE_FINE = 2000;
const WIDTH = 19;
const HEIGHT = 15;
const entrance = {x: 9, y: 14};
const throne = {x: 9, y: 2};
const throneGuardPositions = [[7, 1], [8, 1], [10, 1], [11, 1], [7, 2], [11, 2], [7, 4], [8, 4], [10, 4], [11, 4], [8, 5], [10, 5]];
const palaceGuardPositions = [[7, 2], [11, 2], [8, 3], [10, 3], [8, 5], [10, 5]];
const governors = {
  mothbridge: {name: 'Countess Adrianna', gender: 'female'},
  'gallows-fair': {name: 'Lord Krumble', gender: 'male'},
  redhaven: {name: 'Sir Pimple of Prock', gender: 'male'},
  'iron-choir': {name: 'Baron Huan the Rude', gender: 'male'},
  'ash-market': {name: 'Lord Bladdar of Seldomkeep', gender: 'male'},
  'salt-choir': {name: 'Dame Isobel Crowfoot', gender: 'female'},
  'lantern-raft': {name: 'Lady Maud Wyrmholt', gender: 'female'},
  'pearl-defiance': {name: 'Earl Oswin Tallowgate', gender: 'male'},
  'last-dawn': {name: 'Baroness Elspeth Underbough', gender: 'female'},
  'hinge-town': {name: 'Sir Aldric Candlewick', gender: 'male'},
  'noonless-quay': {name: 'Lady Sybil Rookmere', gender: 'female'},
};
const wings = [
  {id: 'treasury', name: 'Treasury'},
  {id: 'archive', name: 'Archives'},
  {id: 'guardroom', name: 'Guardroom'},
  {id: 'armory', name: 'Armory'},
];
const wingBounds = [[1, 1, 5, 4], [13, 1, 5, 4], [1, 8, 5, 5], [13, 8, 5, 5]];

function createLayout(town, index) {
  const royal = town.id === 'bellwether';
  const tiles = Array.from({length: HEIGHT}, () => Array(WIDTH).fill('wall'));
  const rooms = [
    {id: 'audience', name: royal ? 'Royal Audience Chamber' : 'Audience Chamber', x: 7, y: 1, width: 5, height: 5},
    {id: 'vestibule', name: 'Entrance Hall', x: 7, y: 12, width: 5, height: 2},
    ...wingBounds.map(([x, y, width, height], i) => ({...wings[(i + index) % wings.length], x, y, width, height})),
  ];
  const fill = (x, y, width, height, type) => {
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) tiles[row][col] = type;
    }
  };
  fill(9, 5, 1, 9, 'hall');
  fill(5, 3, 9, 1, 'hall');
  fill(5, 10, 9, 1, 'hall');
  for (const room of rooms) fill(room.x, room.y, room.width, room.height, room.id);
  for (const [x, y] of [[5, 3], [7, 3], [11, 3], [13, 3], [9, 5], [5, 10], [13, 10], [9, 12]]) tiles[y][x] = 'door';
  tiles[entrance.y][entrance.x] = 'exit';
  const chests = rooms.filter(room => ['treasury', 'armory'].includes(room.id)).map(room => ({
    id: 'castleChest:' + town.id + ':' + room.id,
    name: room.name + ' Chest',
    x: room.x + 2,
    y: room.y + 1,
    gold: (room.id === 'treasury' ? 150 : 70) + town.region * 30,
  }));
  const guards = (royal ? throneGuardPositions : palaceGuardPositions).map(([x, y], i) => ({
    id: (royal ? 'throne-guard-' : 'palace-guard-') + (i + 1), kind: 'guard',
    name: royal ? 'Royal Throne Guard' : 'Governor’s Guard', x, y,
  }));
  const king = royal ? {id: 'king', kind: 'king', name: 'King Malachi the Ineffable', ...throne} : null;
  const princess = royal ? {id: 'princess', kind: 'princess', name: 'Princess Bunnyfoot', x: throne.x + 1, y: throne.y} : null;
  const governor = royal ? null : {id: 'governor', kind: 'governor', ...governors[town.id], ...throne};
  return {width: WIDTH, height: HEIGHT, tiles, rooms, chests, entrance, throne, guards, king, princess, governor};
}

const layouts = new Map(TOWNS.map((town, index) => [town.id, createLayout(town, index)]));
export const castleLayout = townId => layouts.get(townId);
export const castleFineFor = (s, townId) => s.flags['castleBan:' + townId] === true ? CASTLE_FINE : 0;

export function castleFigures(s) {
  const layout = castleLayout(s.location);
  if (!layout) return [];
  if (layout.governor) return [layout.governor];
  return [!s.flags?.kingUsurped && layout.king, !s.flags?.princessImprisoned && layout.princess].filter(Boolean);
}

function figureDistance(s, figure) {
  return Math.abs(figure.x - s.castle.x) + Math.abs(figure.y - s.castle.y);
}

export function castleRulerAt(s, target) {
  if (s.mode !== 'town' || !s.castle) return null;
  const figures = castleFigures(s).filter(figure => target === undefined || figure.id === target);
  return figures.find(figure => figureDistance(s, figure) === 0) ??
    figures.find(figure => figureDistance(s, figure) === 1) ?? null;
}

export function castleRoyalAt(s, target) {
  return s.location === 'bellwether' ? castleRulerAt(s, target) : null;
}

function walkable(layout, x, y) {
  const tile = layout?.tiles[y]?.[x];
  return Boolean(tile && tile !== 'wall');
}

export function castleChestAt(s) {
  if (s.mode !== 'town' || !s.castle) return null;
  return castleLayout(s.location)?.chests.find(chest => chest.x === s.castle.x && chest.y === s.castle.y && !s.flags[chest.id]) ?? null;
}

export function exitCastle(s, outside = false) {
  if (!s.castle) return;
  delete s.castle;
  if (!outside) return;
  const town = TOWNS.find(t => t.id === s.location);
  s.mode = 'world';
  s.returnMode = 'world';
  s.location = null;
  s.x = town.x - 1;
  s.y = town.y;
  delete s.casino;
}

export function castleGuardResponse(s, {startGuard}) {
  if (s.mode !== 'town' || !s.castle?.alarm || (s.flags.guardVictories || 0) >= 3 || s.flags['townGarrison:' + s.location]) return false;
  startGuard(s);
  if (s.mode !== 'battle' || !s.enemy?.guard) return false;
  s.enemy.castleRobbery = true;
  return true;
}

function attackRuler(s, action, layout, {note, startGuard}) {
  const target = castleRulerAt(s, action.target);
  if (!target) return;
  startGuard(s, true);
  if (s.mode !== 'battle' || !s.enemy?.guard) return;
  const groupSize = layout.guards.length;
  const memberHp = s.enemy.maxHp;
  const name = layout.guards[0].name;
  Object.assign(s.enemy, {
    name, castleRoyalDefense: target.id, castleRobbery: true,
    groupSize, memberHp, hp: memberHp * groupSize, maxHp: memberHp * groupSize, gold: 0, xp: 0,
  });
  s.castle.alarm = true;
  s.flags['townFaction:' + s.location] = -20;
  s.flags['castleBan:' + s.location] = true;
  note(s, `Before you reach ${target.name}, all ${groupSize} ${name}s rush to intercept you.`);
}

export function castleAction(s, action, options) {
  const {note, clock, random, dexterity} = options;
  if (action.type === 'payCastleFine') {
    if (s.mode !== 'world' || s.exploration?.area) return true;
    const town = TOWNS.find(t => t.region === s.region && t.x === s.x && t.y === s.y);
    if (!town || !castleFineFor(s, town.id)) return true;
    if (s.gold < CASTLE_FINE) {
      note(s, 'The entrance guards demand the full 2,000 gold.');
      return true;
    }
    s.gold -= CASTLE_FINE;
    delete s.flags['castleBan:' + town.id];
    note(s, 'The guards take 2,000 gold and lift the ban on entering ' + town.name + '.');
    return true;
  }
  if (s.mode !== 'town' || s.casino?.active) return false;
  const layout = castleLayout(s.location);
  if (action.type === 'enterCastle') {
    if (!layout || s.castle || townPlace(s)?.id !== 'court' || castleFineFor(s, s.location)) return true;
    if (s.wanted?.[s.region] > 0) {
      note(s, 'The palace doors remain shut until you pay your local fine.');
      return true;
    }
    s.castle = {...layout.entrance, alarm: false};
    note(s, 'You enter ' + (s.location === 'bellwether' ? 'Bellwether Castle' : 'the governor’s palace') + '.');
    return true;
  }
  if (!s.castle || !layout) return false;
  if (action.type === 'attackCastleRoyal') {
    attackRuler(s, action, layout, options);
    return true;
  }
  if (action.type === 'move') {
    const {dx, dy} = action;
    if (!Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx) + Math.abs(dy) !== 1) return true;
    const x = s.castle.x + dx, y = s.castle.y + dy;
    if (!walkable(layout, x, y)) {
      note(s, 'A castle wall blocks your path.');
      return true;
    }
    Object.assign(s.castle, {x, y});
    clock(s);
    if (layout.tiles[y][x] === 'exit') exitCastle(s, s.castle.alarm);
    else castleGuardResponse(s, options);
    return true;
  }
  if (action.type === 'leave' || action.type === 'leaveCastle') {
    if (layout.tiles[s.castle.y][s.castle.x] === 'exit') exitCastle(s, s.castle.alarm);
    else note(s, 'Return to the castle entrance to leave.');
    return true;
  }
  if (action.type !== 'robCastleChest' && action.type !== 'leaveCastleChest') return false;
  const chest = castleChestAt(s);
  if (!chest) return true;
  if (action.type === 'leaveCastleChest') {
    note(s, 'You leave the locked chest untouched.');
    return true;
  }
  if (s.castle.alarm) {
    note(s, 'The alarm is still ringing. Get out of the castle.');
    return true;
  }
  const successChance = Math.min(1,.25 + Math.min(50, Math.max(0, dexterity(s))) / 100 + rareGearEffect(s,'lockpickBonus'));
  if (random() < successChance) {
    s.flags[chest.id] = true;
    s.gold = Math.min(10_000_000, s.gold + chest.gold);
    note(s, 'The lock clicks open. You pocket ' + chest.gold + ' gold.');
  } else {
    s.castle.alarm = true;
    s.flags['townFaction:' + s.location] = -20;
    s.flags['castleBan:' + s.location] = true;
    note(s, 'The pick snaps and the alarm rings. The town bars you until you pay 2,000 gold at the gate.');
    if (!castleGuardResponse(s, options) && (s.flags.guardVictories || 0) >= 3) note(s, 'The guards recognize you and back away from the chest.');
  }
  return true;
}

export function validCastleState(s) {
  if (s.enemy?.castleRobbery && (s.mode !== 'battle' || !s.castle?.alarm || !s.enemy.guard)) return false;
  if (s.castle !== undefined) {
    const {x, y, alarm} = s.castle ?? {};
    if (!(s.mode === 'town' || s.mode === 'battle' && s.returnMode === 'town') ||
        !TOWNS.some(t => t.id === s.location && t.region === s.region) ||
        !Number.isInteger(x) || !Number.isInteger(y) || !walkable(castleLayout(s.location), x, y) ||
        typeof alarm !== 'boolean' || alarm && !castleFineFor(s, s.location)) return false;
  }
  if (s.enemy?.castleRoyalDefense !== undefined) {
    const e = s.enemy;
    const target = castleFigures(s).find(figure => figure.id === e.castleRoyalDefense);
    if (e.castleRobbery !== true || !target || figureDistance(s, target) > 1 ||
        e.groupSize !== castleLayout(s.location).guards.length || !Number.isInteger(e.memberHp) || e.memberHp < 1 ||
        e.maxHp !== e.groupSize * e.memberHp || e.hp > e.maxHp || e.gold !== 0 || e.xp !== 0) return false;
  }
  for (const [key, value] of Object.entries(s.flags)) {
    if (key.startsWith('castleBan:') && (!layouts.has(key.slice(10)) || typeof value !== 'boolean')) return false;
    if (key.startsWith('townFaction:') && (!layouts.has(key.slice(12)) || !Number.isSafeInteger(value))) return false;
    if (key.startsWith('castleChest:') && (!layouts.get(key.split(':')[1])?.chests.some(chest => chest.id === key) || value !== true)) return false;
  }
  return true;
}
