import {TOWNS} from './content.js';
import {townPlace} from './town.js';

export const CASTLE_FINE = 2000;
const WIDTH = 19;
const HEIGHT = 15;
const entrance = {x: 9, y: 14};
const throne = {x: 9, y: 2};
const wings = [
  {id: 'treasury', name: 'Treasury'},
  {id: 'archive', name: 'Archives'},
  {id: 'guardroom', name: 'Guardroom'},
  {id: 'armory', name: 'Armory'},
];
const wingBounds = [[1, 1, 5, 4], [13, 1, 5, 4], [1, 8, 5, 5], [13, 8, 5, 5]];

function createLayout(town, index) {
  const tiles = Array.from({length: HEIGHT}, () => Array(WIDTH).fill('wall'));
  const rooms = [
    {id: 'audience', name: town.id === 'bellwether' ? 'Royal Audience Chamber' : 'Audience Chamber', x: 7, y: 1, width: 5, height: 5},
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
  return {width: WIDTH, height: HEIGHT, tiles, rooms, chests, entrance, throne};
}

const layouts = new Map(TOWNS.map((town, index) => [town.id, createLayout(town, index)]));
export const castleLayout = townId => layouts.get(townId);
export const castleFineFor = (s, townId) => s.flags['castleBan:' + townId] === true ? CASTLE_FINE : 0;

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
    s.castle = {...layout.entrance, alarm: false};
    note(s, 'You enter ' + (s.location === 'bellwether' ? 'Bellwether Castle' : 'the governor’s palace') + '.');
    return true;
  }
  if (!s.castle || !layout) return false;
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
  const successChance = .25 + Math.min(50, Math.max(0, dexterity(s))) / 100;
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
  for (const [key, value] of Object.entries(s.flags)) {
    if (key.startsWith('castleBan:') && (!layouts.has(key.slice(10)) || typeof value !== 'boolean')) return false;
    if (key.startsWith('townFaction:') && (!layouts.has(key.slice(12)) || !Number.isSafeInteger(value))) return false;
    if (key.startsWith('castleChest:') && (!layouts.get(key.split(':')[1])?.chests.some(chest => chest.id === key) || value !== true)) return false;
  }
  return true;
}
