import {awardChampionTitle, championTitle} from './champion-titles.js';
import {TOWNS} from './content.js';
import {townPlace, townPlaces} from './town.js';
import {ATTRIBUTE_CAP, prepareAttributes} from './attributes.js';
import {validateSpellState} from './spell-items.js';
import {MONSTER_BY_ID} from './bestiary.js';
import {REGIONAL_GLADIATORS, REGIONAL_GLADIATOR_BY_ID} from './regional-gladiators.js';

export const ARENA_WINS_REQUIRED = 10;
export const ARENA_ENTRY_WARNING = 'Nice try. Admire your courage but these guys will slice and dice you. Still want in?';
export const ARENA_LEVEL_REFUSAL = 'Get lost. You’re just looking for easy money against these low level scum!';
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

const strike = (verb, multiplier = 1) => ({verb, multiplier});
const attacks = (...blows) => ({blows});
const stance = (message, armor = 0) => ({message, armor, blows: []});

const bellwetherRoster = [
  {id: 'snake', name: 'The Snake', weapon: 'Two daggers', kind: 'swift', weakness: 'guard then counter',
    description: 'A lean thief in patched dark leathers, with a dagger in each hand.',
    steps: [attacks(strike('flicks the first dagger', .65), strike('cuts back with the second dagger', .65))]},
  {id: 'thug-the-smug', name: 'Thug the Smug', weapon: 'Brass knuckles', kind: 'brute', weakness: 'steady pressure',
    description: 'A big, smug brute who grins through broken teeth and wears heavy brass knuckles.',
    steps: [attacks(strike('probes with a brass-knuckle jab', .85)),
      attacks(strike('hammers a left hook', .7), strike('follows with a right uppercut', .75)), attacks(strike('loads up a crushing right hook', 1.25))]},
  {id: 'thrace-the-mace', name: 'Thrace the Mace', weapon: 'A two-handed mace', kind: 'brute', weakness: 'guard then counter',
    description: 'A Thracian fighter in a bronze breastplate, holding a two-handed mace at his shoulder.',
    steps: [stance('Thrace winds up his mace. Guard against the next swing.'), attacks(strike('brings down the two-handed mace', 2))]},
  {id: 'caratacas-the-celt', name: 'Caratacas the Celt', weapon: 'A short sword and a peanut-shaped shield', kind: 'armored', weakness: 'quick strikes',
    description: 'A Celtic swordsman whose painted shield narrows in the middle like a peanut.',
    steps: [attacks(strike('stabs around the shield with his short sword', .85)), attacks(strike('bashes with his peanut-shaped shield', 1.2)),
      stance('Caratacas plants the peanut-shaped shield and braces against your next strike.', 3)]},
  {id: 'dimitri-death', name: 'Dimitri Death', weapon: 'Two chains used as whips', kind: 'brute', weakness: 'steady pressure',
    description: 'A gaunt prisoner who keeps both ends of his former shackles in motion.',
    steps: [attacks(strike('lashes with the left chain', .62), strike('whips the right chain around your flank', .62)),
      attacks(strike('snaps both chains together', 1.4))]},
  {id: 'bratticus-babyface', name: 'Bratticus Babyface', weapon: 'A trident', kind: 'swift', weakness: 'guard then counter',
    description: 'An adult gladiator with a round, baby-faced scowl and a diaper-style cloth wrap, brandishing a long trident.',
    steps: [attacks(strike('lunges with all three trident points', 1.2)),
      attacks(strike('hooks your feet with the trident shaft', .58), strike('jabs low as you recover', .65))]},
  {id: 'trajan-the-tragic', name: 'Trajan the Tragic', weapon: 'A net and short spear', kind: 'swift', weakness: 'guard then counter',
    description: 'A Roman net fighter with a mournful face, a weighted casting net and a short spear.',
    steps: [stance('Trajan casts his weighted net and lines up a spear thrust. Guard on his next approach.'),
      attacks(strike('thrusts the short spear through the falling net', 1.75)), attacks(strike('rakes with the spear as he retrieves the net', .8))]},
  {id: 'noman-the-nomad', name: 'Noman the Nomad', weapon: 'Two spiked clubs', kind: 'armored', weakness: 'steady pressure',
    description: 'An enormous nomad in chain mail and a nasal helmet, gripping a spiked club in each fist.',
    steps: [attacks(strike('swings his left spiked club', .8), strike('swings his right spiked club', .8)),
      stance('Noman has to reset his grip on the two heavy clubs.'),
      attacks(strike('slams one club low', .85), strike('brings the second club overhand', 1))]},
  {id: 'screwby-just-screwby', name: 'Screwby Just Screwby', weapon: 'Two rapiers', kind: 'swift', weakness: 'guard then counter',
    description: 'A deadly, precise fencer with two slim rapiers and the habit of watching his opponent’s feet.',
    steps: [{...attacks(strike('feints and thrusts with his lead rapier', .85)), armor: 2},
      attacks(strike('flicks a rapier toward your wrist', .5), strike('lunges with his off-hand rapier', .55), strike('makes a third quick thrust', .6)),
      attacks(strike('slashes with the leading blade', .7), strike('counters with the second rapier', .7))]},
  {id: 'ender-the-undefeated', name: 'Ender the Undefeated', weapon: 'A giant axe', kind: 'brute', weakness: 'guard then counter',
    description: 'A bald, pale-white giant with old scars and red-lined eyes, carrying an enormous axe.',
    steps: [attacks(strike('sweeps his giant axe across the ring', 1.2)),
      stance('Ender lifts his axe over his head. Guard against the blow that follows.'),
      attacks(strike('brings the giant axe down with both hands', 2.35))]},
].map((fighter, index) => ({...fighter, art: arenaRoster[index].art, portrait: `/assets/gladiator-${fighter.id}.webp`}));

// Keep battle-sheet fallbacks available while each dedicated portrait loads.
const regionalRosters = Object.fromEntries(Object.entries(REGIONAL_GLADIATORS).map(([town, fighters]) =>
  [town, fighters.map((fighter, index) => ({...fighter, art: arenaRoster[index].art}))]));

const townArenaLevels = {
  mothbridge: {min: 2, max: 7}, bellwether: {min: 4, max: 12}, 'gallows-fair': {min: 3, max: 9},
  redhaven: {min: 8, max: 15}, 'iron-choir': {min: 10, max: 17}, 'ash-market': {min: 9, max: 16},
  'salt-choir': {min: 16, max: 25}, 'lantern-raft': {min: 17, max: 26}, 'pearl-defiance': {min: 19, max: 27},
  'last-dawn': {min: 26, max: 34}, 'hinge-town': {min: 28, max: 37}, 'noonless-quay': {min: 29, max: 40},
};

export const arenaLevelRange = townId => townArenaLevels[townId] ?? null;

function opponentStats(townId, round) {
  const {min} = arenaLevelRange(townId);
  const scale = 1.1 ** (round - 1);
  const hp = Math.round((20 + 3 * min) * scale);
  return {level: Math.round(min * scale), hp, maxHp: hp, attack: Math.round((3 + Math.floor(min / 5)) * scale),
    armor: Math.round((1 + Math.floor(min / 10)) * scale)};
}

export function arenaOpponent(round, townId) {
  const roster = townId === 'bellwether' ? bellwetherRoster : regionalRosters[townId] ?? arenaRoster;
  return Number.isInteger(round) ? roster[round - 1] ?? null : null;
}

function arenaFighterPattern(enemy) {
  if (!enemy.arenaFighter || !enemy.arenaRosterId) return null;
  const fighter = REGIONAL_GLADIATOR_BY_ID[enemy.arenaRosterId] ?? bellwetherRoster[enemy.arenaRound - 1];
  return fighter?.id === enemy.arenaRosterId ? fighter.steps : null;
}

export function arenaStrikeTurn(enemy) {
  const pattern = arenaFighterPattern(enemy);
  if (!pattern) return null;
  const index = enemy.arenaTurn % pattern.length;
  enemy.arenaTurn = index + 1;
  return pattern[index];
}

export function arenaDefenseBonus(enemy) {
  return arenaFighterPattern(enemy)?.[enemy.arenaTurn - 1]?.armor ?? 0;
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
const loanRank = townId => Math.max(1, Math.ceil((arenaLevelRange(townId).min - 1) * 2 / 3));

function equipLoanWeapon(s) {
  const rank = loanRank(s.arena.town);
  if (rank > 1) s.arena.loanWeaponRank = rank;
  s.weapon = rank;
}

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
  equipLoanWeapon(s);
  s.armor = 1;
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
  checkBasicGear(s, note, itemById);
  if (arena.prisoner) {
    equipLoanWeapon(s);
    s.hp = s.maxHp;
  }
  const round = arena.wins + 1;
  const opponent = arenaOpponent(round, arena.town);
  s.mode = 'battle';
  s.returnMode = 'town';
  s.flags.guarded = false;
  s.flags.combo = 0;
  delete s.flags.clockStopped;
  s.enemy = {
    speciesId: 'arena-gladiator', name: opponent.name,
    arenaFighter: true, arenaRound: round, ...opponentStats(arena.town, round),
    gold: 0, xp: 0, kind: opponent.kind, weakness: opponent.weakness, firstContact: true,
    art: {...opponent.art}, ...(opponent.id ? {arenaRosterId: opponent.id, arenaTurn: 0, portrait: opponent.portrait} : {}),
  };
  note(s, `Bout ${round} of ${ARENA_WINS_REQUIRED}. ${s.enemy.name} enters the ring.`);
}

function voluntaryEntryAllowed(s, note) {
  const arena = s.arena;
  const {min, max} = arenaLevelRange(arena.town);
  if (s.level > max) {
    note(s, ARENA_LEVEL_REFUSAL);
    return false;
  }
  if (s.level < min && !arena.acceptedUnderlevel) {
    arena.entryWarning = true;
    note(s, ARENA_ENTRY_WARNING);
    return false;
  }
  delete arena.entryWarning;
  return true;
}

export function arenaAction(s, action, note, itemById) {
  if (action.type === 'enterArena') {
    if (s.mode !== 'town' || s.castle || s.arena || s.casino?.active || townPlace(s)?.id !== 'arena') return true;
    if (s.level > arenaLevelRange(s.location).max) {
      note(s, ARENA_LEVEL_REFUSAL);
      return true;
    }
    s.arena = {town: s.location, prisoner: false, wins: 0, qualifies: false};
    s.returnMode = 'town';
    if (voluntaryEntryAllowed(s, note)) note(s, 'You enter the arena. Challenge a gladiator or return to town.');
    return true;
  }
  const arena = s.arena;
  if (!arena) return ['startArenaFight', 'leaveArena', 'confirmArenaEntry'].includes(action.type);
  if (action.type === 'confirmArenaEntry') {
    if (s.mode !== 'town' || arena.prisoner || !arena.entryWarning || typeof action.accept !== 'boolean') return true;
    delete arena.entryWarning;
    if (!action.accept || s.level > arenaLevelRange(arena.town).max) {
      delete s.arena;
      note(s, action.accept ? ARENA_LEVEL_REFUSAL : 'You decline the invitation and return to town.');
    } else {
      arena.acceptedUnderlevel = true;
      note(s, 'The gatekeeper steps aside. You can choose your first bout.');
    }
    return true;
  }
  if (action.type === 'startArenaFight') {
    if (s.mode === 'town' && arena.wins < ARENA_WINS_REQUIRED &&
        (arena.prisoner || voluntaryEntryAllowed(s, note))) startFight(s, note, itemById);
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
  if (wins === ARENA_WINS_REQUIRED) awardChampionTitle(s, arena.town, note);
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
  if (arena.entryWarning !== undefined && (arena.entryWarning !== true || arena.prisoner || arena.acceptedUnderlevel || s.mode !== 'town') ||
      arena.acceptedUnderlevel !== undefined && (arena.acceptedUnderlevel !== true || arena.prisoner)) return false;
  if (arena.loanWeaponRank !== undefined && (!arena.prisoner || arena.loanWeaponRank <= 1 || arena.loanWeaponRank !== loanRank(arena.town))) return false;
  if (arena.prisoner) {
    if (!validStash(s, arena.stash, itemById) || !Array.isArray(s.bag) || s.bag.length !== loanBag.length ||
        !loanBag.every(id => s.bag.includes(id)) || s.pendingLoot?.length !== 0 || s.weapon !== (arena.loanWeaponRank ?? 1) || s.armor !== 1) return false;
  } else if (arena.stash !== undefined || arena.qualifies || hasLoanArmor) return false;
  if (s.mode === 'town') return !s.enemy;
  const e = s.enemy;
  if (e?.arenaRosterId !== undefined || e?.arenaTurn !== undefined || e?.portrait !== undefined) {
    const fighter = arenaOpponent(e.arenaRound, arena.town);
    if (!fighter?.id || fighter.id !== e.arenaRosterId || fighter.portrait !== e.portrait || fighter.name !== e.name ||
        !Number.isInteger(e.arenaTurn) || e.arenaTurn < 0 || e.arenaTurn > fighter.steps.length) return false;
  }
  return s.mode === 'battle' && e?.arenaFighter === true && arena.wins < ARENA_WINS_REQUIRED && e.arenaRound === arena.wins + 1 &&
    e.speciesId === 'arena-gladiator' && !e.boss && !e.guard && e.groupSize === undefined && e.gold === 0 && e.xp === 0 && e.hp <= e.maxHp;
}

// One independent title challenge roll per wilderness encounter check, regardless of title count.
export function tryChampionChallenge(s, random, note) {
  if (s.mode !== 'world' || !s.championTowns?.length || s.previewRules?.noRandom ||
      s.spellEffects?.invisibleMoves > 0 || s.buffs?.invisibility > 0 ||
      s.flags.wildernessEvent || s.flags.peacefulEncounter || s.exploration?.area?.startsWith('planet-')) return false;
  if (random() >= .003) return false;
  const town = s.championTowns[Math.floor(random() * s.championTowns.length)];
  const opponent = arenaOpponent(10, town);
  s.enemy = {speciesId:'roaming-gladiator', name:`Roaming Gladiator — ${opponent.name}`,
    championTown:town, ...opponentStats(town,10), gold:0, xp:0,
    kind:opponent.kind, weakness:opponent.weakness, art:{...opponent.art},
    ...(opponent.portrait ? {portrait:opponent.portrait} : {}), firstContact:true};
  s.mode='battle'; s.returnMode='world';
  s.flags.guarded=false; s.flags.combo=0;
  delete s.flags.clockStopped;
  note(s, `A roaming gladiator challenges your title: ${championTitle(town)}. Win to retain it; defeat costs this title alone.`);
  return true;
}
