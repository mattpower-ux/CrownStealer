import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import {areaTile, branchGates} from '../public/game/exploration.js';

const east = {type: 'move', dx: 1, dy: 0};

function traveler(area, rng) {
  const s = createGame('Wilderness encounter check');
  Object.assign(s, {x: 70, y: 48, level: 8, turns: 11, rng});
  if (area) {
    const region = Number(area.slice(5)) < 3 ? 0 : 2;
    const gate = branchGates(region).find(g => g.area === area);
    Object.assign(s, {region, exploration: {area, home: {region, x: gate.x, y: gate.y}, artifacts: []}});
  }
  return s;
}

test('main lands and branches support payoff, trade and sale encounters', () => {
  for (const area of [null, 'wild-0']) {
    for (const [rng, offer] of [[1980, 'gold'], [1978, 'sell'], [2063, 'trade']]) {
      const s = act(traveler(area, rng), east);
      const meeting = s.flags.peacefulEncounter;
      assert.equal(meeting?.offer, offer);
      assert.equal(s.enemy, null);
      const accepted = act(loadGame(saveGame(s)), {type: 'peacefulAccept'});
      assert.equal(accepted.flags.peacefulEncounter, undefined);
      assert.equal(accepted.gold, s.gold + (offer === 'gold' ? meeting.amount : offer === 'sell' ? -meeting.amount : 0));
      assert.equal(accepted.meals, s.meals - Number(offer === 'trade'));
      assert.equal(accepted.bag.includes('starter-healing'), offer !== 'gold');
    }
  }
});

test('surprise permits free evasion or an uncontested opening attack', () => {
  const s = act(traveler('wild-0', 1976), east);
  assert.equal(s.enemy?.surprised, true);
  const evasive = act(s, {type: 'evade'});
  assert.equal(evasive.mode, 'world');
  assert.equal(evasive.enemy, null);
  assert.equal(evasive.hp, s.hp);
  assert.equal(evasive.gold, s.gold);
  const opening = act(s, {type: 'attack'});
  assert.equal(opening.hp, s.hp);
  assert.equal(opening.enemy?.surprised, undefined);
});

test('same-species packs retain two or three members and health after saving', () => {
  for (const [rng, count] of [[1979, 2], [2000, 3]]) {
    const s = act(traveler('wild-0', rng), east);
    assert.equal(s.enemy?.groupSize, count);
    assert.equal(s.enemy.hp, count * s.enemy.memberHp);
    const restored = loadGame(saveGame(s)).enemy;
    assert.equal(restored.speciesId, s.enemy.speciesId);
    assert.equal(restored.groupSize, count);
    assert.equal(restored.memberHp, s.enemy.memberHp);
    assert.equal(restored.hp, s.enemy.hp);
  }
});

test('water encounters include all requested sea creatures, including the Kraken', () => {
  const cases = [[1972, 'Giant Squid'], [1973, 'Leviathan'], [1974, 'Sea Monster'], [1977, 'Crazed Crab'], [2134, 'Legendary Kraken']];
  for (const [rng, name] of cases) {
    const s = traveler('wild-7', rng);
    Object.assign(s, {x: 31, y: 56});
    s.flags.rowboatReady = true;
    assert.equal(areaTile(s, 32, 56), 'water');
    const encounter = act(s, east);
    assert.equal(encounter.x, 32);
    assert.equal(encounter.enemy?.name, name);
  }
});

test('Saltwild Coast has open water that a boat can cross to reach an offshore island', () => {
  const s = traveler('wild-6', 3);
  Object.assign(s, {x: 81, y: 60});
  assert.notEqual(areaTile(s, 81, 60), 'water');
  assert.equal(areaTile(s, 82, 60), 'water');
  assert.equal(areaTile(s, 126, 60), 'water');
  assert.equal(act(s, east).x, s.x);
  s.flags.rowboatReady = true;
  let sailing = s;
  for (let x = 82; x <= 112; x++) {
    sailing = act(sailing, east, [], {noRandom: true});
    assert.equal(sailing.x, x);
  }
  assert.notEqual(areaTile(sailing, 112, 60), 'water');
});
