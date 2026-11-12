import {TOWNS} from './content.js';
import {townPlace, townPlaces} from './town.js';
import {ATTRIBUTE_CAP, effectiveLevel, prepareAttributes} from './attributes.js';
import {validateSpellState} from './spell-items.js';
import {MONSTER_BY_ID} from './bestiary.js';

export const ARENA_WINS_REQUIRED = 10;
export const ARENA_LEATHER_ARMOR = {
  id: 'arena-leather', name: 'Basic Leather Armor', kind: 'armor', shape: 'armor',
  color: '#b68661', notForSale: true, value: 0,
  description: 'Plain leather loaned by the arena while your own gear is held.',
};

const arenaRoster = [
  'debt-collector', 'thornback-boar', 'ash-road-brigand', 'tally-imp', 'ironroot-stalker',
  'bell-gargoyle', 'brass-minotaur', 'frostfang-wolf', 'pendulum-sentinel', 'royal-pursuer',
].map((id, index) => {
  const {name, art, kind, weakness} = MONSTER_BY_ID[id];
  return {name: index === ARENA_WINS_REQUIRED - 1 ? 'Arena Champion' : name, art, kind, weakness};
});

export function arenaOpponent(round) {
  return Number.isInteger(round) ? arenaRoster[round - 1] ?? null : null;
}

const sword = 'road-sword';
const loanBag = [sword, ARENA_LEATHER_ARMOR.id];
const equipmentKinds = {
  equipped: 'weapon', equippedArmor: 'armor', equippedRing: 'ring', equippedRing2: 'ring',
  equippedNecklace: 'necklace', equippedShield: 'shield', equippedHead: 'head', equippedHands: 'hands',
  equippedBoots: 'boots', equippedBelt: 'belt', equippedMagic: 'magic',
};
const slots = Object.keys(equipmentKinds);
const combatActions = new Set(['attack', 'guard', 'heal', 'eat', 'useItem', 'useMagic']);
const allowedActions = new Set(['clockTick', 'rename', 'allocateAttribute', 'equip', 'unequip', 'equipMagic',
  'unequipMagic', 'acknowledgeLoot', 'acknowledgeRescue', 'acknowledgeDragon', ...combatActions]);
const escapeItems = new Set(['scroll-return', 'dungeon-elevator', 'teleporter-crystal', 'pocket-teleporter']);
const record = value => value && typeof value === 'object' && !Array.isArray(value);

function positionAtArena(s, town) {
  s.mode = s.returnMode = 'town';
  s.location = town.id;
  s.x = town.x;
  s.y = town.y;
  const door = townPlaces(s).find(place => place.id === 'arena');
  s.townPosition = door ? {x: door.x, y: door.y} : {x: 6, y: 11};
}

export function imprisonInArena(s, note) {
  const town = TOWNS.find(town => town.id === s.location && town.region === s.region);
  if (s.mode !== 'town' || s.arena || !town) return false;
  const equipment = Object.fromEntries(slots.filter(key => Object.hasOwn(s, key)).map(key => [key, s[key]]));
  s.arena = {
    town: town.id, prisoner: true, wins: 0, qualifies: true,
    stash: {bag: s.bag, pendingLoot: s.pendingLoot, equipment, weapon: s.weapon, armor: s.armor,
      wandCharges: s.wandCharges || {}, wandSerial: s.wandSerial || 0},
  };
  s.bag = [...loanBag];
  s.pendingLoot = [];
  s.wandCharges = {};
  for (const key of slots) s[key] = null;
  s.equipped = sword;
  s.equippedArmor = ARENA_LEATHER_ARMOR.id;
  s.weapon = s.armor = 1;
  delete s.weaponCoating;
  delete s.castle;
  delete s.casino;
  positionAtArena(s, town);
  note(s, 'The guards confiscate your belongings. Win ten arena bouts to earn your freedom and recover your gear.');
  return true;
}

// A town may burn during a clock tick. Its destruction does not discard a prisoner's held gear.
export function preserveArenaAfterTownChange(s) {
  if (!s.arena || s.mode !== 'world') return;
  if (s.arena.prisoner) positionAtArena(s, TOWNS.find(town => town.id === s.arena.town));
  else delete s.arena;
}

function checkBasicGear(s, note, itemById) {
  const arena = s.arena;
  if (!arena.qualifies) return;
  const weapon = itemById(s.equipped, s);
  const mundane = weapon?.kind === 'weapon' && weapon.id !== 'holy-avenger' &&
    !['element', 'elementDamage', 'stormDamage', 'spellItem', 'freezeChance', 'lifeSteal', 'explosionChance', 'alien', 'attributeBonuses']
      .some(property => weapon[property]);
  if (mundane && s.equippedArmor === ARENA_LEATHER_ARMOR.id && !s.weaponCoating &&
      slots.every(key => key === 'equipped' || key === 'equippedArmor' || !s[key])) return;
  arena.qualifies = false;
  note(s, 'This bout uses a different loadout, so this sentence no longer qualifies for the basic-gear reward.');
}

function startFight(s, note, itemById) {
  const arena = s.arena;
  if (s.mode !== 'town' || arena.wins >= ARENA_WINS_REQUIRED) return;
  checkBasicGear(s, note, itemById);
  if (arena.prisoner) s.hp = s.maxHp;
  const round = arena.wins + 1;
  const opponent = arenaOpponent(round);
  const level = Math.min(1000, effectiveLevel(s) + Math.floor((round - 1) / 3));
  const hp = 16 + 5 * level + 4 * round;
  s.mode = 'battle';
  s.returnMode = 'town';
  s.flags.guarded = false;
  s.flags.combo = 0;
  delete s.flags.clockStopped;
  s.enemy = {
    speciesId: 'arena-gladiator', name: opponent.name,
    arenaFighter: true, arenaRound: round, level, hp, maxHp: hp,
    attack: 3 + Math.floor(level / 4) + Math.floor(round / 4), armor: Math.floor(level / 10) + Math.floor(round / 4),
    gold: 0, xp: 0, kind: opponent.kind, weakness: opponent.weakness, firstContact: true,
    art: {...opponent.art},
  };
  note(s, `Bout ${round} of ${ARENA_WINS_REQUIRED}. The ${s.enemy.name} enters the ring.`);
}

export function arenaAction(s, action, note, itemById) {
  if (action.type === 'enterArena') {
    if (s.mode !== 'town' || s.castle || s.arena || s.casino?.active || townPlace(s)?.id !== 'arena') return true;
    s.arena = {town: s.location, prisoner: false, wins: 0, qualifies: false};
    s.returnMode = 'town';
    note(s, 'You enter the arena. Challenge a gladiator or return to town.');
    return true;
  }
  const arena = s.arena;
  if (!arena) return ['startArenaFight', 'leaveArena'].includes(action.type);
  if (action.type === 'startArenaFight') {
    startFight(s, note, itemById);
    return true;
  }
  if (action.type === 'leaveArena' && !arena.prisoner && s.mode === 'town') {
    delete s.arena;
    note(s, 'You leave the arena and return to town.');
    return true;
  }
  if (action.type === 'flee' && !arena.prisoner && s.mode === 'battle') return false;
  const item = action.type === 'useMagic' ? s.equippedMagic : action.id;
  if (!allowedActions.has(action.type) || (action.type === 'useItem' || action.type === 'useMagic') &&
      (escapeItems.has(item) || arena.prisoner && item === 'feign-collar')) {
    note(s, arena.prisoner ? `The arena gates stay locked until you win ${ARENA_WINS_REQUIRED} bouts.` : 'Leave the arena before doing that.');
    return true;
  }
  if (s.mode === 'battle' && combatActions.has(action.type)) checkBasicGear(s, note, itemById);
  return false;
}

function settleBout(s) {
  s.mode = s.returnMode = 'town';
  s.enemy = null;
  s.flags.guarded = false;
  s.flags.combo = 0;
  s.spellEffects.stunnedTurns = 0;
}

function restoreGear(s, stash) {
  for (const key of slots) delete s[key];
  Object.assign(s, stash.equipment, {bag: stash.bag, pendingLoot: stash.pendingLoot, weapon: stash.weapon,
    armor: stash.armor, wandCharges: stash.wandCharges, wandSerial: stash.wandSerial});
}

function basicReward(s) {
  if (!s.arena.qualifies || s.flags.arenaBasicPerk) return null;
  prepareAttributes(s);
  const reward = {};
  for (const name of ['strength', 'dexterity']) {
    reward[name] = Math.min(2, ATTRIBUTE_CAP - s.attributes[name]);
    s.attributes[name] += reward[name];
  }
  s.flags.arenaBasicPerk = true;
  return reward;
}

export function arenaVictory(s, note, events) {
  if (!s.arena || !s.enemy?.arenaFighter) return false;
  const arena = s.arena;
  const wins = ++arena.wins;
  const released = arena.prisoner && wins === ARENA_WINS_REQUIRED;
  const reward = released ? basicReward(s) : null;
  settleBout(s);
  s.flags.victories++;
  if (released) {
    restoreGear(s, arena.stash);
    delete s.arena;
    note(s, 'Ten arena victories. The guards release you and return your belongings.');
    if (reward) note(s, `Your basic-gear run permanently grants +${reward.strength} Strength and +${reward.dexterity} Dexterity.`);
  } else note(s, `Arena victories: ${wins}/${ARENA_WINS_REQUIRED}.`);
  events.push({kind: 'arenaResult', outcome: 'win', wins, released, reward});
  return true;
}

export function arenaDefeat(s, note, events) {
  if (!s.arena || !s.enemy?.arenaFighter) return false;
  settleBout(s);
  s.hp = s.maxHp;
  note(s, `The arena attendants treat your wounds. Your ${s.arena.wins} victories still count.`);
  events.push({kind: 'arenaResult', outcome: 'loss', wins: s.arena.wins, released: false, reward: null});
  return true;
}

function validStash(s, stash, itemById) {
  if (!record(stash) || !Array.isArray(stash.bag) || !Array.isArray(stash.pendingLoot) || !record(stash.equipment) ||
      !Object.hasOwn(stash.equipment, 'equipped') || !Object.hasOwn(stash.equipment, 'equippedArmor') ||
      !record(stash.wandCharges) || !Number.isSafeInteger(stash.wandSerial) || stash.wandSerial < 0 ||
      [stash.weapon, stash.armor].some(rank => !Number.isInteger(rank) || rank < 1 || rank > 1000)) return false;
  const held = {...s, ...stash.equipment, bag: stash.bag, wandCharges: stash.wandCharges, wandSerial: stash.wandSerial};
  if (stash.bag.some(id => typeof id !== 'string' || id === ARENA_LEATHER_ARMOR.id || !itemById(id, held) || itemById(id, held).kind === 'relic') ||
      stash.pendingLoot.some(id => !itemById(id, held) || !stash.bag.includes(id) && !s.relics.includes(id))) return false;
  for (const [slot, id] of Object.entries(stash.equipment)) {
    if (!Object.hasOwn(equipmentKinds, slot)) return false;
    if (id === null) continue;
    if (!stash.bag.includes(id)) return false;
    const item = itemById(id, held);
    if (slot === 'equippedMagic') {
      if (!['scroll', 'wand'].includes(item.kind) && item.shape !== 'scroll') return false;
    } else if (item.kind !== equipmentKinds[slot]) return false;
  }
  if (stash.equipment.equippedRing && stash.equipment.equippedRing === stash.equipment.equippedRing2 &&
      stash.bag.filter(id => id === stash.equipment.equippedRing).length < 2) return false;
  try { validateSpellState(held); } catch { return false; }
  return true;
}

export function validArenaState(s, itemById) {
  if (s.flags.arenaBasicPerk !== undefined && typeof s.flags.arenaBasicPerk !== 'boolean') return false;
  const hasLoanArmor = Array.isArray(s.bag) && s.bag.includes(ARENA_LEATHER_ARMOR.id);
  if (s.arena === undefined) return s.enemy?.arenaFighter === undefined && s.enemy?.arenaRound === undefined && !hasLoanArmor;
  const arena = s.arena;
  if (!record(arena) || !TOWNS.some(town => town.id === arena.town && town.region === s.region) || s.location !== arena.town ||
      s.castle || s.dungeon || s.exploration?.area || s.casino?.active || s.returnMode !== 'town' ||
      typeof arena.prisoner !== 'boolean' || typeof arena.qualifies !== 'boolean' || !Number.isInteger(arena.wins) ||
      arena.wins < 0 || arena.wins > ARENA_WINS_REQUIRED || arena.prisoner && arena.wins === ARENA_WINS_REQUIRED) return false;
  if (arena.prisoner) {
    if (!validStash(s, arena.stash, itemById) || !Array.isArray(s.bag) || s.bag.length !== loanBag.length ||
        !loanBag.every(id => s.bag.includes(id)) || s.pendingLoot?.length !== 0 || s.weapon !== 1 || s.armor !== 1) return false;
  } else if (arena.stash !== undefined || arena.qualifies || hasLoanArmor) return false;
  if (s.mode === 'town') return !s.enemy;
  const e = s.enemy;
  return s.mode === 'battle' && e?.arenaFighter === true && arena.wins < ARENA_WINS_REQUIRED && e.arenaRound === arena.wins + 1 &&
    e.speciesId === 'arena-gladiator' && !e.boss && !e.guard && e.groupSize === undefined && e.gold === 0 && e.xp === 0 && e.hp <= e.maxHp;
}
