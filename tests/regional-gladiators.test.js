import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {arenaOpponent, arenaStrikeTurn, arenaDefenseBonus, arenaLevelRange} from '../public/game/gladiator-arena.js';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {townPlaces} from '../public/game/town.js';

const arenas = JSON.parse(readFileSync(new URL('../public/game/gladiator-roster-editor-data.json', import.meta.url))).arenas.filter(a => a.id !== 'bellwether');

test('all 110 regional gladiators preserve approved identity and have distinct playable weapon routines', () => {
  assert.equal(arenas.length, 11);
  const ids = new Set(), patterns = new Set();
  for (const arena of arenas) {
    assert.equal(arena.fighters.length, 10);
    assert.equal(arena.fighters.filter(f => /\bwoman\b/i.test(f.look)).length, 2, arena.id);
    for (const source of arena.fighters) {
      const f = arenaOpponent(source.bout, arena.id);
      assert.equal(f.name, source.name);
      assert.equal(f.weapon, source.weapon);
      assert.equal(f.description, source.look);
      assert.equal(f.portrait, `/assets/gladiator-${arena.id}-${String(source.bout).padStart(2, '0')}.webp`);
      assert.ok(!ids.has(f.id)); ids.add(f.id);
      assert.ok(f.steps.length >= 2);
      const enemy = {arenaFighter: true, arenaRound: source.bout, arenaRosterId: f.id, arenaTurn: 0};
      for (const step of f.steps) {
        assert.deepEqual(arenaStrikeTurn(enemy), step);
        assert.equal(arenaDefenseBonus(enemy), step.armor ?? 0);
        for (const blow of step.blows) assert.ok(blow.verb && blow.multiplier > 0);
      }
      assert.deepEqual(arenaStrikeTurn(enemy), f.steps[0]);
      patterns.add(JSON.stringify(f.steps));
    }
  }
  assert.equal(ids.size, 110);
  assert.equal(patterns.size, 110);
});

function bout(townId, round) {
  const town = TOWNS.find(t => t.id === townId);
  let s = {...createGame('Regional Tester'), mode: 'town', location: town.id, region: town.region, x: town.x, y: town.y};
  const door = townPlaces(s).find(p => p.id === 'arena');
  s.townPosition = {x: door.x, y: door.y};
  s.level = arenaLevelRange(townId).min;
  s = act(s, {type: 'enterArena'});
  s.arena.wins = round - 1;
  return act(s, {type: 'startArenaFight'});
}

test('regional identity and combat cursor survive saves in every arena', () => {
  for (const arena of arenas) for (const f of arena.fighters) {
    let s = bout(arena.id, f.bout);
    assert.equal(s.enemy.name, f.name);
    arenaStrikeTurn(s.enemy);
    const loaded = loadGame(saveGame(s));
    assert.equal(loaded?.enemy?.arenaRosterId, s.enemy.arenaRosterId);
    assert.equal(loaded.enemy.arenaTurn, 1);
  }
});

test('Joxo adds actual heat damage after his physical pin strikes; Clarissa fights dirty', () => {
  const joxo = arenaOpponent(5, 'gallows-fair');
  assert.ok(joxo.steps.some(s => s.blows.some(b => b.element === 'fire' && b.power > 0)));
  let s = bout('gallows-fair', 5);
  const events = [];
  s = act(s, {type: 'guard'}, events);
  const hits = events.filter(e => e.target === 'hero' && e.amount > 0);
  assert.ok(hits.some(e => /heat|flame|scorch/i.test(e.message)), JSON.stringify(events));
  assert.ok(hits.some(e => !/heat|flame|scorch/i.test(e.message)), JSON.stringify(events));
  const clarissa = arenaOpponent(10, 'gallows-fair');
  assert.match(JSON.stringify(clarissa.steps), /below.the.belt/);
  assert.match(JSON.stringify(clarissa.steps), /kick/);
});
