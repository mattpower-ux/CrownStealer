import {rareGearEffect} from './rare-gear.js';
import {DUNGEONS,TOWNS} from './content.js';
import {townPlace} from './town.js';
import {ROYAL_DUNGEON_STAIR} from './royal-dungeon.js';
import {BALROG_WHIP} from './bottomless-pit.js';
import {castleTreasuryLoot} from './castle-treasury-loot.js';
import {castleLibraryBooks} from './castle-library.js';
import {ATTRIBUTE_CAP, attributeLabel, prepareAttributes} from './attributes.js';

export const CASTLE_FINE = 2000;
const WIDTH = 19;
const HEIGHT = 15;
const ROYAL_WIDTH = 54;
const ROYAL_HEIGHT = 19;
const entrance = {x: 9, y: 14};
const throne = {x: 9, y: 2};
const throneGuardPositions = [[7, 1], [8, 1], [10, 1], [11, 1], [7, 2], [11, 2], [7, 4], [8, 4], [10, 4], [11, 4], [8, 5], [10, 5]];
const palaceGuardPositions = [[8, 13], [10, 13], [9, 10], [9, 7], [8, 4], [10, 4]];
const royalPatrolPositions = [[7, 13], [11, 13], [9, 10], [23, 6]];
const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
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
  {id: 'archive', name: 'Library'},
  {id: 'guardroom', name: 'Guardroom'},
  {id: 'armory', name: 'Armory'},
];
const wingBounds = [[1, 1, 5, 4], [13, 1, 5, 4], [1, 8, 5, 5], [13, 8, 5, 5]];
const royalWingNames = {guardroom: 'Guards’ Barracks', armory: 'Royal Armory'};
const royalQuarters = [
  {id: 'royal-fun', name: 'Royal Fun Room', x: 20, y: 1, width: 6, height: 4},
  {id: 'chastity', name: 'Chastity Chamber', x: 20, y: 8, width: 6, height: 5},
  {id: 'council', name: 'Privy Council Room', x: 28, y: 4, width: 5, height: 5},
  {id: 'kitchen', name: 'Royal Kitchen', x: 36, y: 1, width: 4, height: 4},
  {id: 'pantry', name: 'Pantry', x: 42, y: 1, width: 4, height: 4},
  {id: 'banquet', name: 'Banquet Hall', x: 48, y: 1, width: 5, height: 4},
  {id: 'chapel', name: 'Castle Chapel', x: 36, y: 8, width: 4, height: 4},
  {id: 'library', name: 'Royal Library', x: 42, y: 8, width: 4, height: 4},
  {id: 'guest', name: 'Guest Chambers', x: 48, y: 8, width: 5, height: 4},
  {id: 'servants', name: 'Servants’ Quarters', x: 36, y: 15, width: 4, height: 3},
  {id: 'linen', name: 'Linen Room', x: 42, y: 15, width: 4, height: 3},
  {id: 'wine', name: 'Wine Store', x: 48, y: 15, width: 5, height: 3},
];
const kingDismissal = 'What are you doing here? Guards, get this nitwit out of my sight!';
const bookReadPrefix = 'castleBookRead:';
const bookBlessingPrefix = 'castleBookBlessing:';
const chestOffsets = [[2, 1], [1, 2], [3, 2], [1, 1], [3, 1]];

function palaceChest(town, room, treasurySlot) {
  const [dx, dy] = chestOffsets[treasurySlot ?? 0];
  const suffix = treasurySlot > 0 ? treasurySlot + 1 : '';
  let gold = 70 + town.region * 30;
  if (treasurySlot !== undefined) gold = town.id === 'bellwether' ? 1000 + treasurySlot * 250 : 320 + town.region * 65 + treasurySlot * 95;
  return {
    id: `castleChest:${town.id}:${room.id}${suffix ? '-' + suffix : ''}`,
    kind: 'chest', name: room.name + ' Chest' + (suffix ? ' ' + suffix : ''),
    x: room.x + dx, y: room.y + dy, gold,
    ...(treasurySlot !== undefined ? {treasurySlot} : {}),
  };
}

function createLayout(town, index) {
  const royal = town.id === 'bellwether';
  const width = royal ? ROYAL_WIDTH : WIDTH;
  const height = royal ? ROYAL_HEIGHT : HEIGHT;
  const tiles = Array.from({length: height}, () => Array(width).fill('wall'));
  const rooms = [
    {id: 'audience', name: royal ? 'Throne Room' : 'Audience Chamber', x: 7, y: 1, width: 5, height: 5},
    {id: 'vestibule', name: royal ? 'Front Foyer' : 'Entrance Hall', x: 7, y: 12, width: 5, height: 2},
    ...wingBounds.map(([x, y, width, height], i) => {
      const wing = wings[(i + index) % wings.length];
      return {...wing, name: (royal && royalWingNames[wing.id]) || wing.name, x, y, width, height};
    }),
    ...(royal ? royalQuarters : []),
  ];
  const fill = (x, y, width, height, type) => {
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) tiles[row][col] = type;
    }
  };
  fill(9, 5, 1, 9, 'hall');
  fill(5, 3, 9, 1, 'hall');
  fill(5, 10, 9, 1, 'hall');
  const doors = [[5, 3], [7, 3], [11, 3], [13, 3], [9, 5], [5, 10], [13, 10], [9, 12]];
  if (royal) {
    fill(9, 6, 20, 1, 'hall');
    fill(23, 4, 1, 5, 'hall');
    fill(34, 6, 17, 1, 'hall');
    fill(34, 13, 17, 1, 'hall');
    fill(34, 6, 1, 8, 'hall');
    doors.push([23, 4], [23, 8], [28, 6], [33, 6]);
    for (const x of [37, 43, 50]) doors.push([x, 5], [x, 7], [x, 14]);
  }
  for (const room of rooms) fill(room.x, room.y, room.width, room.height, room.id);
  for (const [x, y] of doors) tiles[y][x] = 'door';
  tiles[entrance.y][entrance.x] = 'exit';
  const dungeonStair = royal ? ROYAL_DUNGEON_STAIR : null;
  if (dungeonStair) tiles[dungeonStair.y][dungeonStair.x] = 'stair';
  const chests = rooms.filter(room => ['treasury', 'armory'].includes(room.id))
    .map(room => palaceChest(town, room, room.id === 'treasury' ? 0 : undefined));
  const treasury = rooms.find(room => room.id === 'treasury');
  for (let slot = 1; slot < (royal ? 5 : 3); slot++) chests.push(palaceChest(town, treasury, slot));
  const guards = (royal ? throneGuardPositions : palaceGuardPositions).map(([x, y], i) => ({
    id: (royal ? 'throne-guard-' : 'palace-guard-') + (i + 1), kind: 'guard',
    name: royal ? 'Royal Throne Guard' : 'Governor’s Guard', x, y,
  }));
  const patrols = royal ? royalPatrolPositions.map(([x, y], i) => ({
    id: 'royal-patrol-' + (i + 1), kind: 'guard', name: 'Royal Palace Guard', x, y,
  })) : [];
  const king = royal ? {id: 'king', kind: 'king', name: 'King Malachi the Ineffable', ...throne} : null;
  const princess = royal ? {id: 'princess', kind: 'princess', name: 'Princess Bunnyfoot', x: throne.x + 1, y: throne.y} : null;
  const governor = royal ? null : {id: 'governor', kind: 'governor', ...governors[town.id], ...throne};
  const layout = {width, height, tiles, rooms, chests, entrance, throne, dungeonStair, guards, patrols, king, princess, governor};
  return {...layout, books: castleLibraryBooks(town.id, layout)};
}

const layouts = new Map(TOWNS.map((town, index) => [town.id, createLayout(town, index)]));
const libraryBooks = new Map([...layouts.values()].flatMap(layout => layout.books.map(book => [book.id, book])));
export const castleLayout = townId => layouts.get(townId);
export const castleFineFor = (s, townId) => s.flags['castleBan:' + townId] === true ? CASTLE_FINE : 0;

export function castleFigures(s) {
  const layout = castleLayout(s.location);
  if (!layout) return [];
  if (layout.governor) return [layout.governor];
  return [!s.flags?.kingUsurped && layout.king, !s.flags?.princessImprisoned && layout.princess].filter(Boolean);
}

export function castleGuards(s) {
  const layout = castleLayout(s.location);
  if (!layout) return [];
  return [...layout.guards, ...layout.patrols].map(guard => {
    const current = s.castle?.guardPositions?.[guard.id];
    return current ? {...guard, x: current.x, y: current.y} : guard;
  });
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

export function castleChestAt(s, target) {
  if (s.mode !== 'town' || !s.castle) return null;
  return castleLayout(s.location)?.chests.find(chest => !s.flags[chest.id] &&
    (target === undefined ? figureDistance(s, chest) === 0 : chest.id === target && figureDistance(s, chest) <= 1)) ?? null;
}

export function castleInteractionsAt(s) {
  if (s.mode !== 'town' || !s.castle || s.castle.alarm) return [];
  const layout = castleLayout(s.location);
  if (!layout) return [];
  const books = layout.books.map(book => ({...book, read: s.flags[bookReadPrefix + book.id] === true,
    blessed: s.flags[bookBlessingPrefix + book.id] === true}));
  return [...layout.chests.filter(chest => !s.flags[chest.id]), ...books, ...castleFigures(s), ...castleGuards(s)]
    .filter(point => figureDistance(s, point) <= 1)
    .sort((a, b) => figureDistance(s, a) - figureDistance(s, b));
}

export function castleInteractionAt(s, id) {
  return castleInteractionsAt(s).find(point => id === undefined || point.id === id) ?? null;
}

export function castleInteractionActions(s, id) {
  const point = castleInteractionAt(s, id);
  if (!point) return [];
  const choice = (label, type) => ({label, action: {type, id: point.id}});
  if (point.kind === 'chest') return [choice('ROB', 'robCastleChest'), choice('LEAVE IT', 'leaveCastleChest')];
  if (point.kind === 'book') return [choice('Read', 'readCastleBook'), choice('Leave It', 'leaveCastleBook')];
  if (point.kind === 'guard') return [choice('Talk', 'castleTalk'), choice('Attack', 'attackCastleGuard')];
  const leave = choice('Leave the Room', 'castleLeaveRoom');
  const attack = {label: 'Attack', action: {type: 'attackCastleRoyal', target: point.id}};
  if (point.kind === 'governor') return [leave, attack];
  return [leave, choice('Report on Your Progress', 'castleReport'), attack];
}

function readLibraryBook(s, book, note) {
  s.flags[bookReadPrefix + book.id] = true;
  note(s, book.name + ': ' + book.text);
  if (book.rarity !== 'rare') return;
  const key = bookBlessingPrefix + book.id;
  if (s.flags[key]) {
    note(s, 'You have already learned this book’s lesson.');
    return;
  }
  if (!(s.level >= 5)) {
    note(s, 'Reach level 5 to understand the book’s lesson.');
    return;
  }
  prepareAttributes(s);
  const label = attributeLabel(book.attribute);
  const amount = Math.min(book.amount, ATTRIBUTE_CAP - s.attributes[book.attribute]);
  if (!(amount > 0)) {
    note(s, `Your ${label} is already at its maximum.`);
    return;
  }
  s.attributes[book.attribute] += amount;
  s.flags[key] = true;
  note(s, `Your ${label} permanently increases by ${amount}.`);
}

function royalProgress(s) {
  const f = s.flags;
  const gold = s.gold || 0;
  const hasSceptre = s.bag?.includes('wang-sceptre');
  const guardWins = Math.min(20, f.royalGuardWins || 0);
  const relics = s.relics?.length || 0;
  const milestones = [
    ['galen', f.galenFreed, 'Galen Goodfriend is free of the sewers.'],
    ['sewer-escape', f.royalQuest === 'escaped' && !f.wangTrialComplete, 'You made it out of the royal sewers.'],
    ['wang-defeated', f.wangDefeated && !f.wangTrialComplete, hasSceptre ? 'Wang has fallen, and you brought his sceptre.' : 'Wang has fallen. Bring his sceptre as proof.'],
    ['wang-payment', f.royalQuest === 'wang' && !f.wangTrialComplete && hasSceptre && gold >= 5000, 'You have the sceptre and 5,000 gold. Present both when you are ready.'],
    ['wang-complete', f.wangTrialComplete, 'The sceptre and gold have been received.'],
    ['guard-wins-' + guardWins, guardWins > 0 && !f['garrison:0'], `You have defeated ${guardWins} of the 20 royal guards.`],
    ['garrison', f['garrison:0'], 'The royal garrison has surrendered.'],
    ['balrog-defeated', f.balrogDefeated && !f.balrogTrialComplete, s.bag?.includes(BALROG_WHIP) ? 'You defeated the Balrog. Present its whip when you are ready.' : 'You defeated the Balrog. Bring its whip as proof.'],
    ['balrog-complete', f.balrogTrialComplete, 'The Balrog’s whip has been accepted.'],
    ['prisoners', f.royalDungeonFreed, 'You freed all three prisoners beneath the castle.'],
    ['relics-' + relics, relics > 0, `You have recovered ${relics} of the ${DUNGEONS.length} relics.`],
  ];
  return milestones.filter(([, reached]) => reached);
}

const reportKey = point => 'castleReported:' + point.id;
const isRoyal = point => point.kind === 'king' || point.kind === 'princess';
const say = (s, point, line, note) => note(s, point.name + ': ' + line);

function greet(s, point, progress, note) {
  if (point.kind === 'king') say(s, point, progress.length ? 'Well? What progress have you made?' : kingDismissal, note);
  else if (point.kind === 'princess') say(s, point, progress.length ? 'You look like you have news. Tell me what happened.' : 'Hello again. How is your quest coming along?', note);
  else if (point.kind === 'guard') say(s, point, 'Keep your hands to yourself and there will be no trouble.', note);
  else if (point.kind === 'governor') say(s, point, 'You may look around, but leave the palace property where it is.', note);
  else if (point.kind === 'chest') say(s, point, 'The chest is locked.', note);
}

function converse(s, action, layout, {note, startGuard, reportRoyalProgress}) {
  const point = castleInteractionAt(s, action.id);
  if (!point) return;
  if (action.type === 'attackCastleGuard') {
    if (point.kind !== 'guard') return;
    startGuard(s, true);
    if (s.mode !== 'battle' || !s.enemy?.guard) return;
    Object.assign(s.enemy, {name: point.name, castleDuel: point.id, gold: 0, xp: 0});
    note(s, 'The ' + point.name + ' steps forward to face you alone.');
    return;
  }
  const royal = isRoyal(point);
  if (action.type === 'castleLeaveRoom') {
    if (!royal && point.kind !== 'governor') return;
    Object.assign(s.castle, {x: layout.entrance.x, y: layout.entrance.y - 1});
    note(s, point.kind === 'king' ? 'The guards escort you to the front foyer.' : 'You leave the room and return to the entrance hall.');
    return;
  }
  if (action.type === 'castleReport' && !royal) return;
  const history = s.flags[reportKey(point)] || [];
  const progress = royal ? royalProgress(s).filter(([id]) => !history.includes(id)) : [];
  if (action.type === 'castleTalk' || !progress.length) {
    greet(s, point, progress, note);
    return;
  }
  s.flags[reportKey(point)] = [...history, ...progress.map(([id]) => id)];
  say(s, point, progress.map(([, , detail]) => detail).join(' '), note);
  if (point.kind === 'king' && progress.some(([id]) => id === 'sewer-escape')) reportRoyalProgress?.(s);
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

export function castleGuardApproach(s) {
  if (!s.castle) return null;
  const layout = castleLayout(s.location);
  const available = new Map(castleGuards(s).filter(guard => !s.castle.guardPositions?.[guard.id])
    .map(guard => [`${guard.x},${guard.y}`, guard.id]));
  if (!available.size) return null;
  const {x, y} = s.castle;
  const queue = [{x, y, parent: null}];
  const visited = new Set([`${x},${y}`]);
  let adjacent = null;
  for (const point of queue) {
    const guardId = available.get(`${point.x},${point.y}`);
    if (guardId && point.parent) {
      const path = [];
      for (let step = point; step.parent; step = step.parent) path.push({x: step.x, y: step.y});
      if (path.length > 1) return {guardId, path};
      adjacent ??= {guardId, path};
    }
    for (const [dx, dy] of directions) {
      const nx = point.x + dx, ny = point.y + dy, key = `${nx},${ny}`;
      if (!walkable(layout, nx, ny) || visited.has(key)) continue;
      visited.add(key);
      queue.push({x: nx, y: ny, parent: point});
    }
  }
  return adjacent;
}

export function castleGuardResponse(s, {startGuard, events = []}) {
  if (s.mode !== 'town' || !s.castle?.alarm || (s.flags.guardVictories || 0) >= 3 || s.flags['townGarrison:' + s.location]) return false;
  const approach = castleGuardApproach(s);
  startGuard(s);
  if (s.mode !== 'battle' || !s.enemy?.guard) return false;
  s.enemy.castleRobbery = true;
  if (approach) {
    s.castle.guardPositions ??= {};
    s.castle.guardPositions[approach.guardId] = {...approach.path.at(-1)};
    events.push({kind: 'castleGuardApproach', ...approach});
  }
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
  if (['castleTalk', 'castleReport', 'castleLeaveRoom', 'attackCastleGuard'].includes(action.type)) {
    converse(s, action, layout, options);
    return true;
  }
  if (action.type === 'readCastleBook' || action.type === 'leaveCastleBook') {
    const book = castleInteractionAt(s, action.id);
    if (book?.kind !== 'book') return true;
    if (action.type === 'readCastleBook') readLibraryBook(s, book, note);
    else note(s, 'You leave the book on its stand.');
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
  const chest = castleChestAt(s, action.id);
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
    const items = castleTreasuryLoot(s, chest);
    s.bag.push(...items);
    s.pendingLoot.push(...items);
    note(s, 'The lock clicks open. You pocket ' + chest.gold + ' gold.' + (items.length ? ' You also find rare equipment.' : ''));
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
    const {x, y, alarm, guardPositions} = s.castle ?? {};
    const layout = castleLayout(s.location);
    if (!(s.mode === 'town' || s.mode === 'battle' && s.returnMode === 'town') ||
        !TOWNS.some(t => t.id === s.location && t.region === s.region) ||
        !Number.isInteger(x) || !Number.isInteger(y) || !walkable(layout, x, y) ||
        typeof alarm !== 'boolean' || alarm && !castleFineFor(s, s.location)) return false;
    if (guardPositions !== undefined && (!alarm || !guardPositions || typeof guardPositions !== 'object' || Array.isArray(guardPositions) ||
        Object.entries(guardPositions).some(([id, position]) => ![...layout.guards, ...layout.patrols].some(guard => guard.id === id) ||
          !Number.isInteger(position?.x) || !Number.isInteger(position?.y) || !walkable(layout, position.x, position.y)))) return false;
  }
  if (s.enemy?.castleRoyalDefense !== undefined) {
    const e = s.enemy;
    const target = castleFigures(s).find(figure => figure.id === e.castleRoyalDefense);
    if (e.castleRobbery !== true || !target || figureDistance(s, target) > 1 ||
        e.groupSize !== castleLayout(s.location).guards.length || !Number.isInteger(e.memberHp) || e.memberHp < 1 ||
        e.maxHp !== e.groupSize * e.memberHp || e.hp > e.maxHp || e.gold !== 0 || e.xp !== 0) return false;
  }
  if (s.enemy?.castleDuel !== undefined) {
    const e = s.enemy;
    const guard = castleGuards(s).find(guard => guard.id === e.castleDuel);
    if (s.mode !== 'battle' || s.returnMode !== 'town' || !s.castle || !guard || figureDistance(s, guard) > 1 ||
        e.guard !== true || e.castleRobbery || e.castleRoyalDefense || e.groupSize !== undefined || e.gold !== 0 || e.xp !== 0) return false;
  }
  for (const [key, value] of Object.entries(s.flags)) {
    if (key.startsWith('castleBan:') && (!layouts.has(key.slice(10)) || typeof value !== 'boolean')) return false;
    if (key.startsWith('townFaction:') && (!layouts.has(key.slice(12)) || !Number.isSafeInteger(value))) return false;
    if (key.startsWith('castleChest:') && (!layouts.get(key.split(':')[1])?.chests.some(chest => chest.id === key) || value !== true)) return false;
    if (key.startsWith(bookReadPrefix) && (!libraryBooks.has(key.slice(bookReadPrefix.length)) || value !== true)) return false;
    if (key.startsWith(bookBlessingPrefix)) {
      const id = key.slice(bookBlessingPrefix.length);
      if (libraryBooks.get(id)?.rarity !== 'rare' || value !== true || s.flags[bookReadPrefix + id] !== true) return false;
    }
    if (key.startsWith('castleReported:') && (!['castleReported:king', 'castleReported:princess'].includes(key) ||
        !Array.isArray(value) || value.length > 40 || new Set(value).size !== value.length ||
        value.some(id => typeof id !== 'string' || !/^(galen|sewer-escape|wang-defeated|wang-payment|wang-complete|guard-wins-(?:[1-9]|1[0-9]|20)|garrison|balrog-defeated|balrog-complete|prisoners|relics-[1-8])$/.test(id)))) return false;
  }
  return true;
}
