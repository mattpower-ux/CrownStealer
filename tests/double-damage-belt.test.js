import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame} from '../public/game/engine.js';
import {rollAttackDamage} from '../public/game/combat-belt.js';

const belt = 'belt-double-damage';
const enemy = {name: 'Training Ogre', level: 6, hp: 500, maxHp: 500, attack: 5, armor: 2, gold: 0, xp: 0, kind: 'brute'};

function battle(seed, worn) {
  let s = createGame('Belt check');
  s.bag.push(belt);
  if (worn) s = act(s, {type: 'equip', id: belt});
  Object.assign(s, {mode: 'battle', returnMode: 'world', level: 8, rng: seed, enemy: {...enemy}});
  return s;
}

function hit(s, action) {
  const events = [];
  const result = act(s, action, events, {invulnerable: true});
  const damage = events.find(event => event.target === 'enemy' && event.amount > 0);
  assert.equal(s.enemy.hp - result.enemy.hp, damage.amount);
  return {damage, result};
}

test('wearing the belt doubles a successful Strike on the proc roll, with matching damage and log', () => {
  const attack = {type: 'attack'};
  const baseline = hit(battle(2, false), attack);
  const proc = hit(battle(2, true), attack);
  assert.equal(proc.damage.amount, baseline.damage.amount * 2);
  assert.match(proc.damage.message, /Belt of Double Damage/i);
  assert.ok(proc.result.log.some(line => /Belt of Double Damage.*doubles/i.test(line)));
  assert.equal(hit(battle(0, true), attack).damage.amount, hit(battle(0, false), attack).damage.amount);
});

test('the belt applies once to damaging scrolls, wands, the fireball ring and grenades', () => {
  for (const id of ['scroll-magic-missile', 'scroll-fireball', 'scroll-summon-angel', 'wand-frost-ray-1', 'galen-fireball-ring', 'brass-grenade']) {
    const run = worn => {
      const s = battle(0, worn);
      s.bag.push(id);
      if (id === 'galen-fireball-ring') s.flags.galenRingCharges = 1;
      return hit(s, {type: 'useItem', id});
    };
    const plain = run(false);
    const boosted = run(true);
    assert.equal(boosted.damage.amount, plain.damage.amount * 2, id);
    assert.match(boosted.damage.message, /Belt of Double Damage/i, id);
  }
});

test('misses and utility spells spend no belt roll and preserve effects', () => {
  const miss = worn => {
    const s = battle(1900, worn);
    s.enemy.kind = 'swift';
    const events = [];
    const next = act(s, {type: 'attack'}, events, {invulnerable: true});
    assert.ok(events.some(event => event.kind === 'miss' && event.target === 'enemy'));
    return next.rng;
  };
  assert.equal(miss(true), miss(false));
  const heal = worn => {
    const s = battle(0, worn);
    s.mode = 'world';s.enemy = null;s.hp = 10;
    s.bag.push('scroll-healing');
    return act(s, {type: 'useItem', id: 'scroll-healing'});
  };
  assert.equal(heal(true).hp, heal(false).hp);
  assert.equal(heal(true).rng, 0);
});

test('only a worn belt rolls, with an exact 50 percent cutoff', () => {
  const note = () => {};
  assert.equal(rollAttackDamage({}, 6, () => assert.fail('Unexpected roll without the belt'), note).amount, 6);
  const s = {equippedBelt: belt};
  assert.equal(rollAttackDamage(s, 0, () => assert.fail('Unexpected roll without damage'), note).amount, 0);
  assert.equal(rollAttackDamage(s, 6, () => .499999, note).amount, 12);
  assert.equal(rollAttackDamage(s, 6, () => .5, note).amount, 6);
});

test('Frostburn can double its counterattack without doubling damage to the hero', () => {
  const counter = worn => {
    const s = battle(9, worn);
    s.equippedShield = 'shield-frostburn';
    s.bag.push(s.equippedShield);
    const events = [];
    const result = act(s, {type: 'guard'}, events);
    return {result, ice: events.find(event => event.kind === 'magic' && event.target === 'enemy')};
  };
  const plain = counter(false), boosted = counter(true);
  assert.equal(boosted.ice.amount, plain.ice.amount * 2);
  assert.equal(boosted.result.hp, plain.result.hp);
  assert.match(boosted.ice.message, /Belt of Double Damage/);
});

test('the alien weapon malfunction keeps its fixed damage to both combatants', () => {
  const s = battle(1972, true);
  s.equipped = 'alien-forged-common-sword-1';
  s.bag.push(s.equipped);
  const events = [];
  act(s, {type: 'attack'}, events, {invulnerable: true});
  assert.equal(events.find(event => event.kind === 'explosion').amount, 100);
  assert.equal(events.find(event => event.kind === 'hit' && event.target === 'hero').amount, 100);
});
