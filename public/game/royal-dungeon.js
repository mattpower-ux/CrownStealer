import {BUCKET_BEANS} from './bucket-beans.js';
export const ROYAL_DUNGEON_ID = 'royal-dungeon';
export const ROYAL_DUNGEON_NAME = 'The Royal Dungeon';
export const ROYAL_DUNGEON_STAIR = {x: 10, y: 13};
const town = 'bellwether';
const entrance = {id: 'royal-dungeon-exit', kind: 'stair', name: 'Stair to Bellwether Castle', x: 1, y: 1};
const torturerIntro = "Oh goodee. A little fly has flown into our little nest, and now I've got to squash him. This might be a bit messy.";
const heckles = [
  'You’re about as strong as a drunken weasel!',
  'Take off that mask, fool. You can’t really be that ugly!',
  'I’ve seen a wet sack of turnips put up a better fight!',
  'Did you buy that sword, or did someone lose a bet?',
  'My granny swings harder, and she’s been dead for years!',
  'Is that your battle stance, or are your boots on the wrong feet?',
  'I’d call you a knight, but the horse would complain!',
  'Go on, have another swing. The wall’s getting lonely!',
];

export const BRAVERY_NECKLACE = {
  id: 'necklace-bravery', name: 'Necklace of Bravery', kind: 'necklace', shape: 'necklace',
  rarity: 'epic', unique: true, encounterOnly: true, notForSale: true, value: 650, color: '#e9b671',
  attributeBonuses: {charisma: 5},
  description: 'While worn, +5 Charisma. A gift from the prisoners of Bellwether Castle.',
};

// The Torturer is also the castle's executioner; these are his weapons, not a
// third staff member. Both use effects already supported by weapon combat.
export const ROYAL_DUNGEON_LOOT={[BUCKET_BEANS.id]:BUCKET_BEANS,
 'whip-of-command':{id:'whip-of-command',name:'Whip of Command',kind:'weapon',shape:'whip',rarity:'epic',tier:2,unique:true,encounterOnly:true,bottomOnly:true,color:'#c4a278',value:480,toHit:3,damage:[12,20],freezeChance:.20,description:'The executioner’s cruel command lash. A hit has a 20% chance to freeze its target for one turn.'},
 'mace-of-pain':{id:'mace-of-pain',name:'Mace of Pain',kind:'weapon',shape:'mace',rarity:'epic',tier:2,unique:true,encounterOnly:true,bottomOnly:true,color:'#bd8da4',value:540,toHit:1,damage:[18,28],elementDamage:4,description:'The executioner’s heavy mace. Each hit adds 4 magical damage, increased by your Intelligence bonus.'},
};

export const ROYAL_DUNGEON_NPCS = [
  {
    id: 'royal-torturer', name: 'Royal Torturer', kind: 'npc', x: 7, y: 8,
    art: {sheet: 'royal-torturer', index: 0}, level: 10, hp: 130, attack: 19, armor: 5,
    dialogue: ['I have a job to do. Unless you are here to confess, keep moving.'],
  },
  {
    id: 'royal-heckler', name: 'Royal Heckler', kind: 'npc', x: 7, y: 3,
    art: {sheet: 'royal-heckler', index: 0}, level: 7, hp: 90, attack: 14, armor: 3, attackType:'mental',
    dialogue: heckles,
  },
];

export const ROYAL_DUNGEON_CELLS = [
  {
    id: 'royal-west-cell', kind: 'cell', name: 'West cell', x: 6, y: 6, door: {x: 5, y: 6}, bars:{x:5,top:4,bottom:8,facing:3},
    prisoners: [
      {id: 'royal-prisoner-kobold', name: 'Kobold', x: 3, y: 5},
      {id: 'royal-prisoner-peasant', name: 'Drunken peasant', x: 3, y: 7},
    ],
  },
  {
    id: 'royal-east-cell', kind: 'cell', name: 'East cell', x: 8, y: 10, door: {x: 9, y: 10}, bars:{x:9,top:8,bottom:12,facing:1},
    prisoners: [{id: 'royal-prisoner-maiden', name: 'Young maiden', x: 11, y: 10}],
  },
];

const at = (position, point) => position?.x === point.x && position.y === point.y;
const near = (position, point) => Math.abs(position.x - point.x) + Math.abs(position.y - point.y) <= 1;
const defeatedKey = npc => 'royalDungeonDefeated:' + npc.id;
const isRoyalDungeon = s => s.dungeon?.site === ROYAL_DUNGEON_ID;

function voiceEvent(events, voice, message) {
  events.push({kind: 'dialogue', target: 'enemy', amount: 0, voice, message});
}

export function royalDungeonHeckle(s, note, events) {
  const index = s.flags.royalDungeonHeckle ?? 0;
  const line = heckles[index];
  s.flags.royalDungeonHeckle = (index + 1) % heckles.length;
  note(s, 'Royal Heckler: ' + line);
  voiceEvent(events, 'royal-heckler-' + index, line);
}

function makeMap(cellsOpen) {
  const map = Array.from({length: 15}, () => Array(15).fill(1));
  const floor = (left, top, right, bottom) => {
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) map[y][x] = 0;
  };
  floor(1, 1, 7, 1);
  floor(7, 1, 7, 13);
  floor(6, 4, 8, 12);
  floor(2, 4, 4, 8);
  floor(10, 8, 12, 12);
  if (cellsOpen) for (const {door} of ROYAL_DUNGEON_CELLS) map[door.y][door.x] = 0;
  map[entrance.y][entrance.x] = 3;
  return map;
}

const lockedMap = makeMap(false);
const openMap = makeMap(true);
export const royalDungeonMap = d => d.cellsOpen ? openMap : lockedMap;

export function royalDungeonStairAt(s) {
  return s.mode === 'town' && s.location === town && at(s.castle, ROYAL_DUNGEON_STAIR);
}

export function royalDungeonFigures(s) {
  return isRoyalDungeon(s) ? ROYAL_DUNGEON_NPCS.filter(npc => !s.flags[defeatedKey(npc)]) : [];
}

export function royalDungeonAt(s) {
  if (s.mode !== 'dungeon' || !isRoyalDungeon(s)) return null;
  if (at(s.dungeon, entrance)) return entrance;
  return royalDungeonCellAt(s) ??
    royalDungeonFigures(s).find(npc => near(s.dungeon, npc)) ?? null;
}

export function royalDungeonCellAt(s){
 if(!isRoyalDungeon(s))return null;
 const d=s.dungeon;
 return ROYAL_DUNGEON_CELLS.find(cell=>{
  if(at(d,cell))return true;
  const {bars}=cell, distance=bars.facing===3?d.x-bars.x:bars.x-d.x;
  return d.dir===bars.facing&&distance>=1&&distance<=2&&d.y>=bars.top&&d.y<=bars.bottom;
 })??null;
}

export function royalDungeonActions(s) {
  const point = royalDungeonAt(s);
  if (point?.kind === 'npc') return [
    {label: 'Talk to the ' + point.name, action: {type: 'royalDungeonTalk', id: point.id}},
    {label: 'Tell him his job is meaningless', action: {type: 'royalDungeonInsult', id: point.id}},
    {label: 'Attack the ' + point.name, action: {type: 'royalDungeonAttack', id: point.id}},
  ];
  if (point?.kind === 'cell' && !s.dungeon.cellsOpen) return [
    {label: 'Free the prisoners', action: {type: 'royalDungeonFree', id: point.id}},
  ];
  if (point?.kind === 'stair') return [{label: 'Climb to Bellwether Castle', action: {type: 'leave'}}];
  return [];
}

export function leaveRoyalDungeon(s, note) {
  s.mode = s.returnMode = 'town';
  s.dungeon = null;
  s.castle = {...ROYAL_DUNGEON_STAIR, alarm: false};
  note(s, 'You return to the stair in Bellwether Castle.');
}

function startFight(s, npc, note, events) {
  const {id, name, art, level, hp, attack, armor, attackType} = npc;
  s.mode = 'battle';
  s.returnMode = 'dungeon';
  s.flags.guarded = false;
  s.flags.combo = 0;
  delete s.flags.clockStopped;
  s.enemy = {
    speciesId: id, royalDungeonNpc: id, name, art, level, hp, maxHp: hp, attack, armor,
    gold: 0, xp: 0, kind: 'brute', weakness: 'steady pressure', firstContact: true,...(attackType?{attackType}:{}),
  };
  note(s, 'The ' + name + ' rushes to fight you.');
  if (id === 'royal-torturer') {
    note(s, name + ': ' + torturerIntro);
    voiceEvent(events, 'royal-torturer-intro', torturerIntro);
  }
}

function freePrisoners(s, id, note, events) {
  const cell = royalDungeonCellAt(s);
  if (!cell || cell.id!==id || s.dungeon.cellsOpen) return;
  const guard = royalDungeonFigures(s)[0];
  if (guard) {
    note(s, 'The keys rattle as you test the cell door.');
    startFight(s, guard, note, events);
    return;
  }
  s.flags.royalDungeonFreed = s.dungeon.cellsOpen = true;
  if (!s.bag.includes(BRAVERY_NECKLACE.id)) {
    s.bag.push(BRAVERY_NECKLACE.id);
    s.pendingLoot.push(BRAVERY_NECKLACE.id);
  }
  note(s, 'You unlock both cells. The kobold, the drunken peasant, and the young maiden are free. The young maiden gives you the Necklace of Bravery.');
}

export function royalDungeonAction(s, action, note, events = []) {
  if (action.type === 'enterRoyalDungeon') {
    if (!royalDungeonStairAt(s) || s.castle.alarm || s.casino?.active) return true;
    delete s.castle;
    s.mode = s.returnMode = 'dungeon';
    s.dungeon = {site: ROYAL_DUNGEON_ID, index: 0, floor: 0, x: entrance.x, y: entrance.y, dir: 1, cellsOpen: !!s.flags.royalDungeonFreed};
    note(s, 'You descend into the Royal Dungeon beneath Bellwether Castle.');
    return true;
  }
  if (s.mode !== 'dungeon' || !isRoyalDungeon(s)) return false;
  if (action.type === 'leave') {
    if (at(s.dungeon, entrance)) leaveRoyalDungeon(s, note);
    else note(s, 'Return to the stair to climb back to Bellwether Castle.');
    return true;
  }
  if (action.type === 'royalDungeonFree') {
    freePrisoners(s, action.id, note, events);
    return true;
  }
  if (!['royalDungeonTalk', 'royalDungeonInsult', 'royalDungeonAttack'].includes(action.type)) return false;
  const npc = royalDungeonFigures(s).find(npc => npc.id === action.id && near(s.dungeon, npc));
  if (!npc) return true;
  if (action.type === 'royalDungeonTalk') {
    if (npc.id === 'royal-heckler') royalDungeonHeckle(s, note, events);
    else note(s, npc.name + ': ' + npc.dialogue[0]);
    return true;
  }
  if (action.type === 'royalDungeonInsult') note(s, 'You tell the ' + npc.name + ' that his job is meaningless.');
  startFight(s, npc, note, events);
  return true;
}

export function royalDungeonVictory(s, enemy, note) {
  const npc = ROYAL_DUNGEON_NPCS.find(npc => npc.id === enemy.royalDungeonNpc);
  if (!isRoyalDungeon(s) || !npc) return false;
  const firstVictory=!s.flags[defeatedKey(npc)];
  s.flags[defeatedKey(npc)] = true;
  if(firstVictory){
    s.flags.victories++;
    const loot=npc.id==='royal-heckler'?['medium-emerald','medium-pearl','medium-sapphire','small-diamond','bucket-of-beans']:['weapon-poison-5','whip-of-command','mace-of-pain'];
    s.bag.push(...loot);s.pendingLoot.push(...loot);
    note(s,npc.id==='royal-heckler'?'The Heckler’s bag holds four valuable gems and a Bucket of Beans.':'The Torturer also served as executioner. You recover Black Lotus Venom, the Whip of Command and the Mace of Pain.');
  }
  s.mode = 'dungeon';
  s.enemy = null;
  note(s, 'The ' + npc.name + ' falls.');
  return true;
}

export function validRoyalDungeonState(s) {
  if (s.flags.royalDungeonFreed !== undefined &&
      (s.flags.royalDungeonFreed !== true || !ROYAL_DUNGEON_NPCS.every(npc => s.flags[defeatedKey(npc)] === true))) return false;
  const heckle = s.flags.royalDungeonHeckle;
  if (heckle !== undefined && (!Number.isInteger(heckle) || heckle < 0 || heckle >= heckles.length)) return false;
  for (const [key, value] of Object.entries(s.flags)) {
    if (key.startsWith('royalDungeonDefeated:') && (value !== true || !ROYAL_DUNGEON_NPCS.some(npc => defeatedKey(npc) === key))) return false;
  }
  if (!isRoyalDungeon(s)) return s.enemy?.royalDungeonNpc === undefined && s.dungeon?.cellsOpen === undefined;
  const d = s.dungeon;
  if (s.location !== town || s.region !== 0 || d.index !== 0 || d.floor !== 0 || d.royal || d.ship || d.expedition ||
      d.secretRoom || s.exploration?.area || d.cellsOpen !== !!s.flags.royalDungeonFreed || s.returnMode !== 'dungeon') return false;
  if (s.mode === 'dungeon') return !s.enemy;
  if (s.mode !== 'battle' || s.enemy?.groupSize !== undefined || s.enemy?.guard || s.enemy?.boss) return false;
  const enemy = s.enemy;
  const npc = royalDungeonFigures(s).find(npc => enemy?.royalDungeonNpc === npc.id);
  return !!npc && enemy.speciesId === npc.id && enemy.name === npc.name && enemy.level === npc.level &&
    enemy.maxHp === npc.hp && enemy.hp <= npc.hp && enemy.attack === npc.attack && enemy.armor === npc.armor &&
    (near(d, npc) || !!royalDungeonCellAt(s));
}
