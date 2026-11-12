import {MONSTER_BY_ID, monsterStats} from './bestiary.js';
import {scaleWorldPoint} from './world-size.js';

export const BOTTOMLESS_PIT = Object.freeze(scaleWorldPoint({
  id: 'bottomless-pit',
  kind: 'bottomlessPit',
  name: 'The Bottomless Pit',
  area: 'wild-2',
  region: 0,
  index: 0,
  x: 16,
  y: 10,
}));
export const PIT_FLOORS = 100;
export const PIT_MAP_SEED = 9;
export const BALROG_ID = 'balrog-of-despair';
export const BALROG_WHIP = 'balrog-whip';
export const BALROG_ATTACKS = [
  {name: 'Whip', verb: 'lashes with its whip', element: null, multiplier: .75},
  {name: 'Flame Breath', verb: 'breathes a torrent of flame', element: 'fire', multiplier: 1},
  {name: 'Flaming Sword', verb: 'swings its flaming sword', element: 'fire', multiplier: 1.15},
];
export const ROYAL_BALROG_TRIAL = [
  {speaker: 'King Malachi the Ineffable', role: 'king', text: "Alright, tough stuff, bring me the whip of the Balrog of Despair, if you're so darned resourceful."},
  {speaker: 'Princess Bunnyfoot', role: 'princess', text: "But father, he'll be lashed to bits, burned up and eaten like a barbecued twerp on a stick!"},
  {speaker: 'King Malachi the Ineffable', role: 'king', text: "Sadly, that's true. But you wanted me to give him a sporting chance!"},
];

const inhabitants = [
  ['depth-3-lesser-demon', 'Pit Demon', null],
  ['depth-3-fire-elemental', 'Pit Fire Elemental', 'fire'],
  ['bell-gargoyle', 'Pit Gargoyle', null],
  ['cinder-salamander', 'Pit Salamander', 'fire'],
];

export function pitEncounter(d, roll, boss = false) {
  if (d?.site !== BOTTOMLESS_PIT.id || !Number.isInteger(d.floor) || d.floor < 0 || d.floor >= PIT_FLOORS) return null;
  const kind = 'brute';
  const level = 8 + d.floor;
  if (boss) {
    if (d.floor !== PIT_FLOORS - 1) return null;
    const stats = monsterStats({kind}, level + 8);
    const hp = Math.round(stats.hp * 1.8);
    return {
      ...stats, speciesId: BALROG_ID, name: 'Balrog of Despair', art: {sheet: BALROG_ID, index: 0},
      level: level + 8, hp, maxHp: hp, armor: stats.armor + 16, gold: 1800, xp: 2500, kind,
      weakness: 'guard then counter', boss: true, firstContact: true,
    };
  }
  const [speciesId, name, element] = inhabitants[Math.min(inhabitants.length - 1, Math.max(0, Math.floor(roll * inhabitants.length)))];
  const stats = monsterStats({kind}, level);
  return {
    ...stats, speciesId, name, art: MONSTER_BY_ID[speciesId].art, level, maxHp: stats.hp, kind, element,
    weakness: 'guard then counter', boss: false, firstContact: true,
  };
}

export function pitBottomAction(s) {
  const d = s.dungeon;
  if (s.mode !== 'dungeon' || d?.site !== BOTTOMLESS_PIT.id || d.floor !== PIT_FLOORS - 1 || d.x !== 13 || d.y !== 13) return null;
  return s.flags.balrogDefeated ? 'pitElevator' : 'fightBalrog';
}

export function pitVictory(s) {
  if (s.enemy?.speciesId !== BALROG_ID || !(s.enemy.hp <= 0) || s.flags.balrogDefeated) return false;
  s.flags.balrogDefeated = true;
  if (!s.bag.includes(BALROG_WHIP)) {
    s.bag.push(BALROG_WHIP);
    s.pendingLoot.unshift(BALROG_WHIP);
  }
  return true;
}
