import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {townPlaces} from '../public/game/town.js';
import {itemById} from '../public/game/items.js';
import {rulerPersonality} from '../public/game/ruler-personalities.js';
import {DAY_MS} from '../public/game/world-clock.js';
import {ARENA_LEATHER_ARMOR, ARENA_WINS_REQUIRED, arenaOpponent, imprisonInArena} from '../public/game/gladiator-arena.js';
import {MONSTER_BY_ID} from '../public/game/bestiary.js';

const save = s => loadGame(saveGame(s));
const start = {type: 'startArenaFight'};
const note = (s, text) => s.log.push(text);

function visitor(town = TOWNS[0]) {
  const s = {...createGame('Arena Tester'), mode: 'town', location: town.id, region: town.region, x: town.x, y: town.y};
  const door = townPlaces(s).find(place => place.id === 'arena');
  s.townPosition = {x: door.x, y: door.y};
  return s;
}

function captive() {
  const s = visitor();
  s.castle = {x: 9, y: 2, alarm: false};
  s.bag.push('helm-thinkiness', 'necklace-bravery', 'wand-fireball-1~1');
  s.equippedHead = 'helm-thinkiness';
  s.equippedNecklace = 'necklace-bravery';
  s.equippedMagic = 'wand-fireball-1~1';
  s.wandCharges = {'wand-fireball-1~1': 2};
  s.wandSerial = 1;
  s.pendingLoot = ['necklace-bravery', 'wand-fireball-1~1'];
  s.weapon = 7;
  s.armor = 9;
  return s;
}

function win(s, events = []) {
  let fight = act(s, start);
  assert.equal(fight.mode, 'battle');
  fight.enemy.hp = 1;
  fight.rng = 187441;
  fight = act(fight, {type: 'attack'}, events);
  assert.equal(fight.mode, 'town');
  return save(fight);
}

test('every town has a voluntary arena that can be entered from its door and left after a retreat', () => {
  for (const town of TOWNS) {
    const outside = visitor(town);
    assert.equal(act({...outside, townPosition: {x: 6, y: 12}}, {type: 'enterArena'}).arena, undefined);
    const active = save(act(outside, {type: 'enterArena'}));
    assert.deepEqual(active.arena, {town: town.id, prisoner: false, wins: 0, qualifies: false});
    const fight = save(act(active, start));
    assert.equal(fight.enemy.arenaRound, 1);
    const retreated = save(act({...fight, rng: 1024}, {type: 'flee'}));
    assert.equal(retreated.arena.wins, 0);
    assert.equal(retreated.mode, 'town');
    const left = save(act(retreated, {type: 'leaveArena'}));
    assert.equal(left.arena, undefined);
    assert.deepEqual(left.bag, outside.bag);
  }
});

test('confiscation stashes cursed gear, pending loot, and exact wand charges until the tenth win', () => {
  const s = captive();
  const original = structuredClone(s);
  assert.equal(imprisonInArena(s, note), true);
  assert.equal(s.castle, undefined);
  assert.deepEqual(s.bag, ['road-sword', ARENA_LEATHER_ARMOR.id]);
  assert.equal(itemById(s.equippedArmor, s).name, 'Basic Leather Armor');
  assert.equal(s.arena.prisoner, true);
  assert.deepEqual(s.arena.stash.bag, original.bag);
  assert.deepEqual(s.arena.stash.pendingLoot, original.pendingLoot);
  assert.deepEqual(s.arena.stash.wandCharges, original.wandCharges);
  assert.deepEqual(s.pendingLoot, []);
  let state = save(s);
  for (let i = 0; i < ARENA_WINS_REQUIRED - 1; i++) {
    state = win(state);
    assert.equal(state.arena.wins, i + 1);
    assert.equal(state.equippedHead, null);
  }
  const events = [];
  const released = win(state, events);
  assert.equal(released.arena, undefined);
  for (const key of ['bag', 'pendingLoot', 'equippedHead', 'equippedNecklace', 'equippedMagic', 'equippedArmor', 'equipped', 'weapon', 'armor', 'wandCharges', 'wandSerial']) {
    assert.deepEqual(released[key], original[key], key);
  }
  assert.deepEqual(events.find(event => event.kind === 'arenaResult'), {
    kind: 'arenaResult', outcome: 'win', wins: 10, released: true, reward: {strength: 2, dexterity: 2},
  });
  assert.equal(released.flags.arenaBasicPerk, true);
  assert.equal(released.attributes.strength, original.attributes.strength + 2);
  assert.equal(released.attributes.dexterity, original.attributes.dexterity + 2);
  assert.equal(released.attributePointsSpent, original.attributePointsSpent);
  assert.equal(act(released, start).arena, undefined);
});

test('prisoners cannot flee or teleport, and defeat returns them to the holding cell with wins intact', () => {
  const s = visitor();
  s.gold = 0;
  s.flags.mount = 'dragon';
  s.flags.mounts = ['dragon'];
  imprisonInArena(s, note);
  s.arena.wins = 4;
  let fight = save(act(s, start));
  const escapes = [{type: 'flee'}, {type: 'leaveArena'}, {type: 'leave'}, {type: 'travel', region: 1},
    {type: 'useItem', id: 'scroll-return'}, {type: 'dungeonElevator', floor: 0}, {type: 'crystalTravel', land: 1}, {type: 'continue'}];
  for (const action of escapes) {
    const held = act(fight, action);
    assert.equal(held.mode, 'battle', action.type);
    assert.equal(held.rng, fight.rng, action.type);
    assert.equal(held.arena.wins, 4, action.type);
  }
  fight.enemy.attack = 1000;
  fight.hp = 1;
  const events = [];
  const defeated = save(act(fight, {type: 'guard'}, events));
  assert.equal(defeated.mode, 'town');
  assert.equal(defeated.hp, defeated.maxHp);
  assert.equal(defeated.arena.wins, 4);
  assert.equal(defeated.flags.mount, 'dragon');
  assert.equal(defeated.flags.dragonCaptured, undefined);
  assert.deepEqual(events.find(event => event.kind === 'arenaResult'), {kind: 'arenaResult', outcome: 'loss', wins: 4, released: false, reward: null});
});

test('an ordinary tonic does not void basic-gear qualification, but fighting without leather does', () => {
  const s = visitor();
  imprisonInArena(s, note);
  const first = act(s, start);
  first.potions = 1;
  first.hp = 1;
  const healed = act(first, {type: 'heal'});
  assert.equal(healed.potions, 0);
  assert.equal(healed.arena.qualifies, true);

  const unarmored = act(s, {type: 'unequip', slot: 'armor'});
  let state = win(unarmored);
  assert.equal(state.arena.qualifies, false);
  state = act(state, {type: 'equip', id: ARENA_LEATHER_ARMOR.id});
  state.arena.wins = 9;
  state = win(state);
  assert.equal(state.arena, undefined);
  assert.equal(state.flags.arenaBasicPerk, undefined);
  assert.equal(state.attributes.strength, s.attributes.strength);
});

test('a level-three adventurer can win all ten real bouts with loan gear and the reward is lifetime once', () => {
  let s = visitor();
  s.level = 3;
  s.maxHp += 28;
  s.hp = s.maxHp;
  imprisonInArena(s, note);
  for (let i = 1; i <= ARENA_WINS_REQUIRED; i++) {
    s = act(s, start);
    let rounds = 0;
    while (s.mode === 'battle' && rounds++ < 40) s = act(s, {type: 'attack'});
    assert.ok(rounds < 40, `Bout ${i} finished`);
    assert.equal(s.arena?.wins ?? ARENA_WINS_REQUIRED, i);
  }
  assert.equal(s.flags.arenaBasicPerk, true);
  const attributes = {...s.attributes};
  imprisonInArena(s, note);
  s.arena.wins = 9;
  s = win(s);
  assert.deepEqual(s.attributes, attributes);
});

test('each arena bout shows its scheduled foe and a distinct existing combat sprite', () => {
  const hero = visitor();
  imprisonInArena(hero, note);
  const names = new Set(), art = new Set();
  const available = new Set(Object.values(MONSTER_BY_ID).filter(monster => monster.art).map(monster => `${monster.art.sheet}/${monster.art.index}`));
  for (let round = 1; round <= ARENA_WINS_REQUIRED; round++) {
    const opponent = arenaOpponent(round);
    const fight = save(act({...hero, arena: {...hero.arena, wins: round - 1}}, start));
    assert.equal(fight.enemy.name, opponent.name);
    assert.deepEqual(fight.enemy.art, opponent.art);
    assert.equal(fight.enemy.speciesId, 'arena-gladiator');
    assert.equal(fight.enemy.arenaRound, round);
    const sprite = `${opponent.art.sheet}/${opponent.art.index}`;
    assert.ok(available.has(sprite), sprite);
    names.add(opponent.name);
    art.add(sprite);
  }
  assert.equal(names.size, ARENA_WINS_REQUIRED);
  assert.equal(art.size, ARENA_WINS_REQUIRED);
  assert.equal(arenaOpponent(0), null);
  assert.equal(arenaOpponent(ARENA_WINS_REQUIRED + 1), null);
});

test('save loading rejects missing confiscated equipment and mismatched bouts', () => {
  const s = captive();
  imprisonInArena(s, note);
  const active = act(s, start);
  assert.equal(save(active).enemy.arenaRound, 1);
  const mutations = [
    s => s.arena.stash.bag = [], s => s.enemy.arenaRound++, s => s.arena.wins = 10,
    s => s.arena.stash.wandCharges['wand-fireball-1~1'] = 99,
    s => s.mode = 'world', s => s.arena.stash = null,
  ];
  for (const mutate of mutations) {
    const invalid = structuredClone(active);
    mutate(invalid);
    assert.throws(() => save(invalid), /Invalid arena/);
  }
});

test('threatening a strict governor starts a sentence that survives town fire at zero gold', () => {
  const town = TOWNS.find(town => town.id !== 'bellwether' && rulerPersonality(town.id).temper === 'strict');
  const s = visitor(town);
  s.castle = {x: 9, y: 2, alarm: false};
  s.gold = 0;
  s.rng = 0;
  s.worldTimeMs = 10 * DAY_MS;
  s.cities = {[town.id]: {claimed: 0, paidThrough: 0, tribute: 'refused', deadline: 10,
    guards: 0, destroyed: false, disputes: 0, case: null}};
  const held = save(act(s, {type: 'castleThreaten', id: 'governor'}));
  assert.equal(held.cities[town.id].destroyed, true);
  assert.equal(held.mode, 'town');
  assert.equal(held.location, town.id);
  assert.equal(held.castle, undefined);
  assert.equal(held.gold, 0);
  assert.equal(held.arena.prisoner, true);
  assert.deepEqual(held.arena.stash.bag, s.bag);
});
