import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {castleAction, castleInteractionActions, castleLayout} from '../public/game/castle-interiors.js';

function audience(townId) {
  const {id, region, x, y} = TOWNS.find(town => town.id === townId);
  const layout = castleLayout(id);
  const ruler = layout.king ?? layout.governor;
  const s = {...createGame(), mode: 'town', location: id, region, x, y, gold: 2000,
    castle: {x: ruler.x, y: ruler.y, alarm: false}};
  return {s, ruler};
}

const reload = s => loadGame(saveGame(s));
const offer = (s, ruler, type) => castleInteractionActions(s, ruler.id).find(choice => choice.action.type === type);

test('all twelve rulers offer praise, threat, attack, and bribe, while the Princess keeps her own choices', () => {
  for (const town of TOWNS) {
    const {s, ruler} = audience(town.id);
    for (const type of ['castlePraise', 'castleThreaten', 'attackCastleRoyal', 'castleBribe']) {
      assert.ok(offer(s, ruler, type), `${ruler.name} ${type}`);
    }
    assert.ok(offer(s, ruler, 'castleLeaveRoom'));
    assert.equal(!!offer(s, ruler, 'castleReport'), town.id === 'bellwether');
  }
  const {s} = audience('bellwether');
  assert.deepEqual(castleInteractionActions(s, 'princess').map(choice => choice.label),
    ['Leave the Room', 'Report on Your Progress', 'Attack']);
});

test('each ruler responds to praise in their own words, and repeated praise grants no additional favor', () => {
  const replies = new Set();
  const reactions = new Set();
  for (const town of TOWNS) {
    const {s, ruler} = audience(town.id);
    const praise = {type: 'castlePraise', id: ruler.id};
    const first = reload(act(s, praise));
    const second = act(first, praise);
    assert.ok(first.log.at(-1).startsWith(ruler.name + ': '));
    replies.add(first.log.at(-1).slice(ruler.name.length + 2));
    reactions.add(first.reputation - s.reputation);
    assert.equal(second.reputation, first.reputation);
    assert.equal(second.gold, s.gold);
    assert.equal(second.mode, 'town');
  }
  assert.equal(replies.size, TOWNS.length);
  assert.deepEqual([...reactions].sort(), [0, 1, 2]);
});

test('the greedy ruler quotes the price, charges it only on acceptance, and remembers the bribe', () => {
  const {s, ruler} = audience('gallows-fair');
  const quote = offer(s, ruler, 'castleBribe');
  const price = Number(quote.label.match(/([\d,]+) gold/)[1].replaceAll(',', ''));
  assert.ok(price > 0);
  const short = act({...s, gold: price - 1}, quote.action);
  assert.equal(short.gold, price - 1);
  assert.equal(short.reputation, s.reputation);
  const paid = reload(act(s, quote.action));
  assert.equal(paid.gold, s.gold - price);
  assert.ok(paid.reputation > s.reputation);
  const again = act(paid, quote.action);
  assert.equal(again.gold, paid.gold);
  assert.equal(again.reputation, paid.reputation);
  const exact = reload(act({...s, gold: price}, quote.action));
  assert.equal(exact.gold, 0);
  assert.equal(exact.mode, 'town');
  assert.equal(exact.castle.alarm, false);
  const king = audience('bellwether');
  const refused = act(king.s, {type: 'castleBribe', id: king.ruler.id});
  assert.equal(refused.gold, king.s.gold);
  assert.equal(refused.mode, 'town');
});

test('threatening a proud ruler calls their guard group, and threatening or bribing a strict ruler orders imprisonment', () => {
  const king = audience('bellwether');
  king.s.flags.guardVictories = 3;
  king.s.flags.royalStoryVersion = 1;
  king.s.flags.royalQuest = 'wang';
  const battle = reload(act(king.s, {type: 'castleThreaten', id: king.ruler.id}));
  assert.equal(battle.enemy.castleRoyalDefense, 'king');
  assert.equal(battle.enemy.groupSize, 12);
  assert.equal(battle.flags.royalQuest, 'wang');

  for (const town of ['redhaven', 'salt-choir', 'noonless-quay']) {
    for (const type of ['castleThreaten', 'castleBribe']) {
      const {s, ruler} = audience(town);
      let calls = 0;
      castleAction(s, {type, id: ruler.id}, {
        note: (state, line) => state.log.push(line),
        startGuard: () => assert.fail('strict rulers should imprison rather than fight'),
        imprison: state => {assert.equal(state, s); calls++;},
      });
      assert.equal(calls, 1, `${town} ${type}`);
      assert.equal(s.gold, 2000);
      assert.match(s.log.at(-1), /arena/i);
    }
  }
});

test('cowardly concession is recorded without advancing the garrison quest and invalid targets cannot react', () => {
  const {s, ruler} = audience('mothbridge');
  s.wanted[s.region] = 2;
  const threat = {type: 'castleThreaten', id: ruler.id};
  const first = reload(act(s, threat));
  assert.equal(first.mode, 'town');
  assert.equal(first.enemy, null);
  assert.equal(first.flags['rulerYielded:mothbridge'], true);
  assert.equal(first.wanted[s.region], 0);
  assert.equal(first.flags['townGarrison:mothbridge'], undefined);
  assert.equal(act(first, threat).reputation, first.reputation);

  const far = {...s, castle: {...castleLayout('mothbridge').entrance, alarm: false}};
  assert.deepEqual(act(far, threat).log, far.log);
  const king = audience('bellwether');
  assert.deepEqual(act(king.s, {type: 'castleThreaten', id: 'princess'}).log, king.s.log);
  assert.equal(act(king.s, {type: 'attackCastleRoyal'}).mode, 'town');
  assert.throws(() => reload({...first, flags: {...first.flags, 'rulerBribed:mothbridge': true}}), /Invalid castle state/);
});
