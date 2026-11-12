import test from 'node:test';
import assert from 'node:assert/strict';
import {dungeonFloors} from '../public/game/dungeon-depths.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {act, createGame, dungeonMap, loadGame, pointAt, saveGame} from '../public/game/engine.js';
import {dungeonChests} from '../public/game/treasure.js';
import * as pit from '../public/game/bottomless-pit.js';

const dungeon = floor => ({site: 'bottomless-pit', index: 0, floor, x: 13, y: 13});

test('the Bottomless Pit is a 100-floor landmark in the Whispering Barrens', () => {
  assert.equal(pit.BOTTOMLESS_PIT.name, 'The Bottomless Pit');
  assert.equal(pit.BOTTOMLESS_PIT.area, 'wild-2');
  assert.equal(dungeonFloors(dungeon(0)), 100);
  assert.equal(dungeonFloors({index: 0}), 10);
});

test('ordinary encounters grow stronger on every floor regardless of which creature appears', () => {
  const rolls = [0, .35, .67, .99];
  for (let floor = 1; floor < 100; floor++) {
    const previous = rolls.map(roll => pit.pitEncounter(dungeon(floor - 1), roll));
    const current = rolls.map(roll => pit.pitEncounter(dungeon(floor), roll));
    for (const field of ['level', 'hp', 'attack']) {
      assert.ok(Math.min(...current.map(enemy => enemy[field])) > Math.max(...previous.map(enemy => enemy[field])), field);
    }
  }
  assert.notEqual(pit.pitEncounter(dungeon(20), 0).speciesId, pit.pitEncounter(dungeon(20), .99).speciesId);
});

test('the Balrog waits on the last floor and has three distinct attacks', () => {
  assert.equal(pit.pitEncounter(dungeon(98), .5, true), null);
  const balrog = pit.pitEncounter(dungeon(99), .5, true);
  assert.equal(balrog.name, 'Balrog of Despair');
  assert.equal(balrog.boss, true);
  assert.ok(balrog.hp > pit.pitEncounter(dungeon(99), .5).hp);
  assert.deepEqual(pit.BALROG_ATTACKS.map(attack => attack.name), ['Whip', 'Flame Breath', 'Flaming Sword']);
  assert.deepEqual(pit.BALROG_ATTACKS.map(attack => attack.element), [null, 'fire', 'fire']);
});

test('only defeating the Balrog unlocks the bottom elevator and awards one trial whip', () => {
  const state = {mode: 'dungeon', dungeon: dungeon(99), flags: {}, bag: [], pendingLoot: []};
  assert.equal(pit.pitBottomAction(state), 'fightBalrog');
  assert.equal(pit.pitBottomAction({...state, dungeon: dungeon(98)}), null);
  assert.equal(pit.pitBottomAction({...state, dungeon: {...dungeon(99), x: 12}}), null);
  assert.equal(pit.pitVictory({...state, enemy: {speciesId: 'rock-troll'}}), false);
  assert.equal(pit.pitVictory({...state, enemy: {speciesId: 'balrog-of-despair', hp: 1}}), false);
  state.enemy = {speciesId: 'balrog-of-despair', hp: 0};
  assert.equal(pit.pitVictory(state), true);
  assert.equal(pit.pitVictory(state), false);
  assert.equal(pit.pitBottomAction(state), 'pitElevator');
  assert.deepEqual(state.bag, ['balrog-whip']);
  assert.deepEqual(state.pendingLoot, ['balrog-whip']);
  assert.equal(pit.pitBottomAction(JSON.parse(JSON.stringify(state))), 'pitElevator');
});

test('the final royal trial uses the requested dialogue', () => {
  assert.deepEqual(pit.ROYAL_BALROG_TRIAL.map(line => [line.role, line.text]), [
    ['king', "Alright, tough stuff, bring me the whip of the Balrog of Despair, if you're so darned resourceful."],
    ['princess', "But father, he'll be lashed to bits, burned up and eaten like a barbecued twerp on a stick!"],
    ['king', "Sadly, that's true. But you wanted me to give him a sporting chance!"],
  ]);
});

function enterPit() {
  const s = createGame('Pit delver');
  const {x, y} = pit.BOTTOMLESS_PIT;
  Object.assign(s, {x, y, exploration: {area: 'wild-2', artifacts: [], home: {region: 0, x: 4, y: 48}}});
  assert.equal(pointAt(s)?.id, pit.BOTTOMLESS_PIT.id);
  return act(s, {type: 'enter'});
}

function moveToLadder(s, direction) {
  const {x, y} = dungeonLadders(s.dungeon, dungeonMap(s.dungeon)).find(ladder => ladder.direction === direction);
  Object.assign(s.dungeon, {x, y});
  return {x, y};
}

test('the main game enters the pit, follows 99 lower ladders, and returns to the same hallway when climbing', () => {
  let s = enterPit();
  assert.equal(s.dungeon.floor, 0);
  const lower = moveToLadder(s, 'down');
  assert.notDeepEqual(lower, {x: 13, y: 13});
  s = act(s, {type: 'descend'});
  const top = dungeonLadders(s.dungeon, dungeonMap(s.dungeon)).find(ladder => ladder.direction === 'up');
  assert.deepEqual([s.dungeon.floor, s.dungeon.x, s.dungeon.y], [1, top.x, top.y]);
  s = act(s, {type: 'leave'});
  assert.deepEqual([s.dungeon.floor, s.dungeon.x, s.dungeon.y], [0, lower.x, lower.y]);
  for (let floor = 1; floor < 100; floor++) {
    moveToLadder(s, 'down');
    s = act(s, {type: 'descend'});
    assert.equal(s.dungeon.floor, floor);
  }
  s = loadGame(saveGame(s));
  assert.equal(s.dungeon.floor, 99);
  assert.equal(dungeonLadders(s.dungeon, dungeonMap(s.dungeon)).some(ladder => ladder.direction === 'down'), false);
  const chest = dungeonChests(s, dungeonMap(s.dungeon))[0];
  Object.assign(s.dungeon, {x: chest.x, y: chest.y});
  s = loadGame(saveGame(act(s, {type: 'openChest'})));
  assert.ok(s.openedChests.includes(chest.id));
});

function challengeBalrog() {
  const s = enterPit();
  Object.assign(s.dungeon, {floor: 99, x: 13, y: 13});
  return act(s, {type: 'descend'});
}

test('the Balrog attacks three times while a failed Wisdom save skips the hero strike', () => {
  const s = challengeBalrog();
  assert.equal(s.enemy.speciesId, 'balrog-of-despair');
  s.hp = s.maxHp = 5000;
  s.rng = 187441;
  const events = [];
  const after = act(s, {type: 'attack'}, events);
  assert.equal(after.enemy.hp, s.enemy.hp);
  assert.equal(events.filter(event => event.kind === 'hit' && event.target === 'hero').length, 3);
  assert.match(after.log.slice(-4).join(' '), /gibbering/i);
});

test('a Balrog fear roll equal to Wisdom fails, while one below it succeeds', () => {
  const s = challengeBalrog();
  s.hp = s.maxHp = 5000;
  // This seed rolls 10 on a d100.
  s.rng = 2227;
  const matching = act(s, {type: 'attack'});
  assert.match(matching.log.slice(-4).join(' '), /gibbering/i);
  s.attributes.wisdom = 11;
  const higher = act(s, {type: 'attack'});
  assert.doesNotMatch(higher.log.slice(-4).join(' '), /gibbering/i);
});

test('slaying the Balrog awards the whip and activates a surface elevator that persists through saves', () => {
  let s = challengeBalrog();
  assert.equal(act({...s, mode: 'dungeon', enemy: null}, {type: 'pitElevator'}).mode, 'dungeon');
  s.enemy.hp = 1;
  s.enemy.attack = 0;
  s.enemy.armor = 0;
  s.level = 100;
  s.hp = s.maxHp = 5000;
  s.attributes.wisdom = 50;
  for (let n = 0; n < 50 && s.mode === 'battle'; n++) s = act(s, {type: 'attack'});
  assert.equal(s.mode, 'dungeon');
  assert.equal(s.flags.balrogDefeated, true);
  assert.deepEqual(s.bag.filter(id => id === pit.BALROG_WHIP), [pit.BALROG_WHIP]);
  assert.equal(s.flags['boss:0'], undefined);
  s = act(loadGame(saveGame(s)), {type: 'pitElevator'});
  assert.equal(s.mode, 'world');
  assert.equal(s.exploration.area, 'wild-2');
  assert.equal(pointAt(s).id, 'bottomless-pit');
});
