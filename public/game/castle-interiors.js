import {rareGearEffect} from './rare-gear.js';
import {DUNGEONS,TOWNS} from './content.js';
import {townPlace} from './town.js';
import {ROYAL_DUNGEON_STAIR} from './royal-dungeon.js';
import {castleTreasuryLoot} from './castle-treasury-loot.js';
import {castleLibraryBooks} from './castle-library.js';
import {castleTalkingHead, talkingHeadReply} from './castle-talking-heads.js';
import {ATTRIBUTE_CAP, attributeLabel, prepareAttributes} from './attributes.js';
import {gameDay, setTimedBuff} from './world-clock.js';
import {rulerPersonality} from './ruler-personalities.js';
import {startGuardConsultation, validGuardConsultation} from './castle-guard-audience.js';
import {DRAGONSTONE_ID, ROYAL_COURIER_TOWN, ROYAL_DISPATCH_ID, royalCampaignEndingAvailable, royalCampaignReportAvailable} from './royal-campaign.js';

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
  {id: 'linen', name: 'Royal Bathroom', x: 42, y: 15, width: 4, height: 3},
  {id: 'wine', name: 'Wine Store', x: 48, y: 15, width: 5, height: 3},
];
const kingDismissal = 'What are you doing here? Guards, get this nitwit out of my sight!';
const bookReadPrefix = 'castleBookRead:';
const bookBlessingPrefix = 'castleBookBlessing:';
const bathReply = 'You feel GREAT, but your testosterone level is through the roof, and likely to stay that way for a few days.';
const bathRooms = {bellwether: {room: 'linen', x: 44, y: 16}, redhaven: {room: 'bathroom', x: 22, y: 9}};
const chestOffsets = [[2, 1], [1, 2], [3, 2], [1, 1], [3, 1]];

function palaceChest(town, room, treasurySlot) {
  const [dx, dy] = chestOffsets[treasurySlot ?? 0];
  const suffix = treasurySlot > 0 ? treasurySlot + 1 : '';
  let gold = 70 + town.region * 30;
  if (treasurySlot !== undefined) gold = town.id === 'bellwether' ? 1000 + treasurySlot * 250 : 320 + town.region * 65 + treasurySlot * 95;
  return {
    id: `castleChest:${town.id}:${room.id}${suffix ? '-' + suffix : ''}`,
    kind: 'chest', name: room.name + ' Chest' + (suffix ? ' ' + suffix : ''),
    x: room.x + dx, y: room.y + dy, gold, lockLevel: 60 + Math.floor(gold / 75),
    ...(treasurySlot !== undefined ? {treasurySlot} : {}),
  };
}

function createLayout(town, index) {
  const royal = town.id === 'bellwether';
  const bathAnnex = town.id === 'redhaven';
  const width = royal ? ROYAL_WIDTH : bathAnnex ? 25 : WIDTH;
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
    ...(bathAnnex ? [{id: 'bathroom', name: 'Palace Bathroom', x: 21, y: 8, width: 3, height: 3}] : []),
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
  } else if (bathAnnex) {
    fill(18, 9, 3, 1, 'hall');
    doors.push([18, 9], [21, 9]);
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
  const bathtub = bathRooms[town.id] ? {id: 'castle-bath:' + town.id, kind: 'bath', name: 'Healing Bathtub', ...bathRooms[town.id]} : null;
  const layout = {width, height, tiles, rooms, chests, entrance, throne, dungeonStair, guards, patrols, king, princess, governor, bathtub};
  layout.books = castleLibraryBooks(town.id, layout);
  return {...layout, talkingHead: castleTalkingHead(layout, town)};
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
  const consultation = s.castle?.guardConsultation;
  return [...layout.guards, ...layout.patrols].map(guard => {
    const current = consultation?.guardId === guard.id ? consultation.destination : s.castle?.guardPositions?.[guard.id];
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

export function castleLockpickOdds(s, chest, dexterity) {
  const {lockLevel} = chest;
  const skill = Math.floor(Math.min(50, Math.max(0, dexterity))) + Math.round(100 * rareGearEffect(s, 'lockpickBonus'));
  return {lockLevel, skill, chance: Math.min(100, Math.max(0, 101 + skill - lockLevel))};
}

export function castleBathAt(s) {
  if (s.mode !== 'town' || !s.castle || s.castle.alarm) return null;
  const bath = castleLayout(s.location)?.bathtub;
  return bath && figureDistance(s, bath) <= 1 ? bath : null;
}

export function castleInteractionsAt(s) {
  if (s.mode !== 'town' || !s.castle || s.castle.alarm || s.castle.guardConsultation) return [];
  const layout = castleLayout(s.location);
  if (!layout) return [];
  const books = layout.books.map(book => ({...book, read: s.flags[bookReadPrefix + book.id] === true,
    blessed: s.flags[bookBlessingPrefix + book.id] === true}));
  return [...layout.chests.filter(chest => !s.flags[chest.id]), ...books, ...castleFigures(s), ...castleGuards(s), layout.talkingHead, layout.bathtub]
    .filter(Boolean)
    .filter(point => figureDistance(s, point) <= 1)
    .sort((a, b) => figureDistance(s, a) - figureDistance(s, b));
}

export function castleInteractionAt(s, id) {
  return castleInteractionsAt(s).find(point => id === undefined || point.id === id) ?? null;
}

function canDeliverRoyalMessage(s, point) {
  return point?.kind === 'governor' && s.flags.royalStoryVersion === 2 && s.flags.royalQuest === 'courier' &&
    s.location === ROYAL_COURIER_TOWN && s.bag.includes(ROYAL_DISPATCH_ID);
}

export function castleInteractionActions(s, id) {
  const point = castleInteractionAt(s, id);
  if (!point) return [];
  const choice = (label, type) => ({label, action: {type, id: point.id}});
  if (point.kind === 'chest') return [choice('ROB', 'robCastleChest'), choice('LEAVE IT', 'leaveCastleChest')];
  if (point.kind === 'book') return [choice('READ', 'readCastleBook'), choice('IGNORE', 'leaveCastleBook')];
  if (point.kind === 'talking-head') return [choice('Yes', 'greetCastleHead'), choice('No', 'leaveCastleHead')];
  if (point.kind === 'bath') return [choice('Bathe', 'batheCastle')];
  if (point.kind === 'guard') return s.flags.royalHero ? [] : figureDistance(s, point) === 0
    ? [choice('JUST VISITING', 'castleGuardVisit'), choice('IGNORE', 'castleGuardIgnore'), choice('ATTACK', 'attackCastleGuard')]
    : [choice('Talk', 'castleTalk'), choice('Attack', 'attackCastleGuard')];
  const leave = choice('Leave the Room', 'castleLeaveRoom');
  if (s.flags.royalHero) return [leave];
  const attack = {label: 'Attack', action: {type: 'attackCastleRoyal', target: point.id}};
  const report = choice('Report on Your Progress', 'castleReport');
  if (point.kind === 'princess') return [leave, report, attack];
  const price = rulerPersonality(s.location).bribeGold;
  const bribeLabel = !price ? 'Bribe' : s.flags['rulerBribed:' + s.location] ? 'Bribe · Already paid' : 'Bribe · ' + price.toLocaleString('en-US') + ' gold';
  const story = point.kind === 'king' ? [report] : canDeliverRoyalMessage(s, point) ? [choice('Deliver the Royal Message', 'royalDeliverMessage')] : [];
  return [leave, ...story, choice('Praise', 'castlePraise'),
    choice('Threaten', 'castleThreaten'), attack, choice(bribeLabel, 'castleBribe')];
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
  const relics = s.relics?.length || 0;
  const milestones = [
    ['galen', f.galenFreed, 'Galen Goodfriend is free of the sewers.'],
    ['dispatch-delivered', f.royalQuest === 'report-delivery', 'You delivered the King’s message to Dame Isobel.'],
    ['dragonstone-recovered', s.bag?.includes(DRAGONSTONE_ID), 'You recovered the Dragonstone from Firedrak Mountain.'],
    ['balrog-defeated', f.balrogDefeated, 'You defeated the Balrog of Despair.'],
    ['prisoners', f.royalDungeonFreed, 'You freed all three prisoners beneath the castle.'],
    ['relics-' + relics, relics > 0, `You have recovered ${relics} of the ${DUNGEONS.length} relics.`],
  ];
  return milestones.filter(([, reached]) => reached);
}

const reportKey = point => 'castleReported:' + point.id;
const isRoyal = point => point.kind === 'king' || point.kind === 'princess';
const say = (s, point, line, note) => note(s, point.name + ': ' + line);

function greet(s, point, progress, note) {
  if (s.flags.royalHero && (isRoyal(point) || ['governor', 'guard'].includes(point.kind))) {
    say(s, point, 'Bows silently in recognition of your deeds.', note);
    return;
  }
  if (isRoyal(point) && royalCampaignEndingAvailable(s)) {
    say(s, point, point.kind === 'king' ? 'You have completed my trials. Tell us what future you choose.' :
      'You kept your promise. Now the future is yours to choose.', note);
    return;
  }
  if (point.kind === 'king') {
    const ready = s.flags.royalStoryVersion === 2 && royalCampaignReportAvailable(s);
    say(s, point, ready || progress.length ? 'Well? What progress have you made?' : kingDismissal, note);
  }
  else if (point.kind === 'princess') say(s, point, progress.length ? 'You look like you have news. Tell me what happened.' : 'Hello again. How is your quest coming along?', note);
  else if (point.kind === 'guard') say(s, point, 'Keep your hands to yourself and there will be no trouble.', note);
  else if (point.kind === 'governor') say(s, point, canDeliverRoyalMessage(s, point)
    ? 'That seal is the King’s. You may deliver his message to me.' : rulerPersonality(s.location).greeting, note);
  else if (point.kind === 'chest') say(s, point, 'The chest is locked.', note);
}

function startCastleDuel(s, guard, {note, startGuard}) {
  startGuard(s, true);
  if (s.mode !== 'battle' || !s.enemy?.guard) return;
  Object.assign(s.enemy, {name: guard.name, castleDuel: guard.id, gold: 0, xp: 0});
  note(s, 'The ' + guard.name + ' steps forward to face you alone.');
}

function converse(s, action, layout, options) {
  const {note, reportRoyalProgress} = options;
  const point = castleInteractionAt(s, action.id);
  if (!point) return;
  if (action.type === 'attackCastleGuard') {
    if (point.kind !== 'guard') return;
    startCastleDuel(s, point, options);
    return;
  }
  const royal = isRoyal(point);
  if (action.type === 'castleLeaveRoom') {
    if (!royal && point.kind !== 'governor') return;
    Object.assign(s.castle, {x: layout.entrance.x, y: layout.entrance.y - 1});
    note(s, point.kind === 'king' ? 'The guards escort you to the front foyer.' : 'You leave the room and return to the entrance hall.');
    return;
  }
  if (action.type === 'castleReport' && (!royal || point.id !== action.id)) return;
  if (s.flags.royalHero) {
    greet(s, point, [], note);
    return;
  }
  if (action.type === 'castleReport' && point.kind === 'king' && s.flags.royalStoryVersion === 2 && reportRoyalProgress?.(s)) return;
  const history = s.flags[reportKey(point)] || [];
  const progress = royal ? royalProgress(s).filter(([id]) => !history.includes(id)) : [];
  if (action.type === 'castleTalk' || !progress.length) {
    greet(s, point, progress, note);
    return;
  }
  s.flags[reportKey(point)] = [...history, ...progress.map(([id]) => id)];
  say(s, point, progress.map(([, , detail]) => detail).join(' '), note);
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

function attackRuler(s, target, layout, {note, startGuard}, reaction) {
  if (!target || s.castle.alarm) return;
  startGuard(s, true);
  if (s.mode !== 'battle' || !s.enemy?.guard) return;
  const reply = reaction ?? (target.kind !== 'princess' ? rulerPersonality(s.location).attack : null);
  if (reply) say(s, target, reply, note);
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

function addressRuler(s, action, layout, options) {
  const point = castleInteractionAt(s, action.id);
  if (point?.id !== action.id || !['king', 'governor'].includes(point?.kind)) return;
  const {note, imprison} = options;
  const personality = rulerPersonality(s.location);
  if (action.type === 'castlePraise') {
    const key = 'rulerPraised:' + s.location;
    if (!s.flags[key]) {
      s.flags[key] = true;
      s.reputation += personality.praiseReputation ?? 1;
    }
    say(s, point, personality.praise, note);
    return;
  }
  if (action.type === 'castleBribe') {
    const price = personality.bribeGold;
    const key = 'rulerBribed:' + s.location;
    if (!price) {
      say(s, point, personality.bribe, note);
      if (personality.temper === 'strict') imprison?.(s);
    }
    else if (s.flags[key]) say(s, point, 'Your favor is already recorded. Keep the rest of your gold.', note);
    else if (s.gold < price) say(s, point, 'I require ' + price.toLocaleString('en-US') + ' gold. Keep it until you have the full amount.', note);
    else {
      s.gold -= price;
      if (s.gold === 0) s.flags.fineAdmissionTown = s.location;
      s.reputation += 2;
      s.flags[key] = true;
      say(s, point, personality.bribe, note);
    }
    return;
  }
  if (personality.temper === 'proud') {
    attackRuler(s, point, layout, options, personality.threaten);
    return;
  }
  if (personality.temper === 'cowardly') {
    const key = 'rulerYielded:' + s.location;
    if (s.flags[key]) {
      say(s, point, 'I have already pardoned you. Please leave it at that.', note);
      return;
    }
    s.flags[key] = true;
    s.wanted[s.region] = 0;
  }
  say(s, point, personality.threaten, note);
  if (personality.temper === 'strict') imprison?.(s);
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
  if (s.flags.royalHero && ['attackCastleRoyal', 'attackCastleGuard', 'castlePraise', 'castleThreaten', 'castleBribe',
    'castleGuardVisit', 'castleGuardIgnore'].includes(action.type)) return true;
  if (s.castle.guardConsultation && action.type !== 'move') return true;
  if (action.type === 'castleGuardVisit' || action.type === 'castleGuardIgnore') {
    const guard = castleInteractionAt(s, action.id);
    if (guard?.kind !== 'guard' || guard.id !== action.id || figureDistance(s, guard) !== 0) return true;
    if (action.type === 'castleGuardVisit') say(s, guard, 'Behave yourself. You may pass.', note);
    else startGuardConsultation(s, guard, layout, options);
    return true;
  }
  if (action.type === 'attackCastleRoyal') {
    if (action.target) attackRuler(s, castleRulerAt(s, action.target), layout, options);
    return true;
  }
  if (['castlePraise', 'castleThreaten', 'castleBribe'].includes(action.type)) {
    addressRuler(s, action, layout, options);
    return true;
  }
  if (action.type === 'royalDeliverMessage') {
    const recipient = castleInteractionAt(s, action.id);
    if (recipient?.id === action.id && canDeliverRoyalMessage(s, recipient)) options.deliverRoyalMessage?.(s);
    return true;
  }
  if (['castleTalk', 'castleReport', 'castleLeaveRoom', 'attackCastleGuard'].includes(action.type)) {
    converse(s, action, layout, options);
    return true;
  }
  if (action.type === 'greetCastleHead' || action.type === 'leaveCastleHead') {
    const head = layout.talkingHead;
    if (action.type === 'leaveCastleHead' || !head || action.id !== head.id || s.castle.alarm || figureDistance(s, head) !== 1) return true;
    const day = gameDay(s);
    const reply = talkingHeadReply(head, s.name, random(), s.flags.castleHeadGemDay !== day);
    if (reply.gift) {
      s.flags.castleHeadGemDay = day;
      s.bag.push(reply.gift);
      s.pendingLoot.push(reply.gift);
    }
    note(s, reply.text);
    options.events?.push({kind: 'castleHeadReply', id: head.id, ...reply});
    return true;
  }
  if (action.type === 'batheCastle') {
    const bath = castleBathAt(s);
    if (!bath || action.id !== undefined && action.id !== bath.id) return true;
    s.hp = s.maxHp;
    setTimedBuff(s, 'hairy', 3 * 24 * 60);
    note(s, bathReply);
    options.events?.push({kind: 'castleBathReply', id: bath.id, text: bathReply});
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
    if (s.castle.guardConsultation) {
      const {guardId} = s.castle.guardConsultation;
      delete s.castle.guardConsultation;
      const guard = castleGuards(s).find(guard => guard.id === guardId);
      if (guard) {
        note(s, 'You move before receiving permission. The guard returns and draws a weapon.');
        startCastleDuel(s, guard, options);
      }
      return true;
    }
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
  const {skill, lockLevel} = castleLockpickOdds(s, chest, dexterity(s));
  const score = 100 - Math.floor(random() * 100) + skill;
  const success = score >= lockLevel;
  options.events?.push({kind: 'castleLockpick', id: chest.id, score, lockLevel, success});
  note(s, `Lockpick score ${score} against lock level ${lockLevel}.`);
  if (success) {
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
  const giftDay = s.flags.castleHeadGemDay;
  if (giftDay !== undefined && (!Number.isSafeInteger(giftDay) || giftDay < 0 || giftDay > gameDay(s))) return false;
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
    if (s.castle.guardConsultation !== undefined && !validGuardConsultation(s, layout)) return false;
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
    const rulerFlag = /^ruler(Praised|Bribed|Yielded):(.*)$/.exec(key);
    if (rulerFlag) {
      const [, action, town] = rulerFlag, personality = rulerPersonality(town);
      if (value !== true || !personality || action === 'Bribed' && personality.temper !== 'greedy' ||
          action === 'Yielded' && personality.temper !== 'cowardly') return false;
    }
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
        value.some(id => typeof id !== 'string' || !/^(galen|sewer-escape|wang-defeated|wang-payment|wang-complete|guard-wins-(?:[1-9]|1[0-9]|20)|garrison|dispatch-delivered|dragonstone-recovered|balrog-defeated|balrog-complete|prisoners|relics-[1-8])$/.test(id)))) return false;
  }
  return true;
}
