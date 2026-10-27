import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, act, loadGame, saveGame, worldTile, makeDungeon, DIRS} from '../public/game/engine.js';
import {TOWNS, DUNGEONS, SIDE_QUESTS, ENDINGS} from '../public/game/content.js';

function pathTo(start, target, passable) {
  const queue = [start], previous = new Map([[start.join(','), null]]);
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    if (x === target[0] && y === target[1]) {
      const result = [];
      for (let key = target.join(','); previous.get(key) !== null; key = previous.get(key)) result.unshift(key.split(',').map(Number));
      return result;
    }
    for (const [dx, dy] of DIRS) {
      const next = [x + dx, y + dy], key = next.join(',');
      if (passable(...next) && !previous.has(key)) { previous.set(key, [x, y].join(',')); queue.push(next); }
    }
  }
  assert.fail(`No walking route from ${start} to ${target}`);
}

// All changes to character state go through public actions. BFS only chooses
// directions; it does not skip encounters, terrain, food costs, or purchases.
function campaign(outlaw) {
  let state = createGame(outlaw ? 'Outlaw route' : 'Honorable route');
  let actions = 0, battles = 0;
  const checkpoints = [];
  function step(action) {
    assert.ok(++actions < 20000, 'Campaign must finish without unlimited grinding');
    state = act(state, action);
    assert.ok(state.gold >= 0 && state.food >= 0 && state.hp > 0, 'Resources remain valid');
    assert.ok(!state.log.at(-1)?.startsWith('A weary pilgrim'), `Route defeated after ${action.type}: ${JSON.stringify(checkpoints)}`);
    return state;
  }
  function fight() {
    if (state.mode !== 'battle') return;
    battles++;
    // A save may occur during an encounter, including a boss encounter.
    state = loadGame(saveGame(state));
    let rounds = 0;
    while (state.mode === 'battle') {
      assert.ok(++rounds < 100, `Combat stalled against ${state.enemy.name}`);
      if (state.hp < Math.min(45, state.maxHp / 2) && state.potions) step({type:'heal'});
      else if (state.enemy.weakness === 'guard then counter' && !state.flags.guarded) step({type:'guard'});
      else step({type:'attack'});
    }
  }
  function walkTo(point) {
    assert.equal(state.mode, 'world');
    assert.equal(state.region, point.region);
    const route = pathTo([state.x, state.y], [point.x, point.y], (x,y) => !['water','mountain'].includes(worldTile(state.region,x,y)));
    for (const [x,y] of route) { step({type:'move',dx:x-state.x,dy:y-state.y}); fight(); }
    assert.deepEqual([state.x,state.y],[point.x,point.y]);
  }
  function visit(town, challenge = false) {
    walkTo(town); step({type:'enter'}); fight();
    assert.equal(state.mode,'town');
    step({type:'talk'});
    for (const q of SIDE_QUESTS.filter(q=>q.town === town.id)) step({type:'quest',id:q.id});
    if (state.hp < state.maxHp) step({type:'rest'});
    if (challenge) {
      for (let i=0;i<4;i++) { step({type:'steal'}); fight(); }
      assert.equal(state.flags['garrison:'+state.region],true);
      const victories = state.flags.victories;
      step({type:'challenge'});
      assert.equal(state.flags.victories,victories);
      assert.equal(state.mode,'town','Conquered garrison does not respawn');
      if (state.hp < state.maxHp) step({type:'rest'});
    }
    while (state.food < 70 && state.gold >= 10) step({type:'buy',item:'food'});
    while (state.potions < 3 && state.gold >= 48) step({type:'buy',item:'potion'});
    // Keep a small food/rest reserve; favor armor when both ranks are equal.
    for (;;) {
      const item = state.armor <= state.weapon ? 'armor' : 'weapon';
      const price = item === 'armor' ? state.armor*40 : state.weapon*45;
      if (state.gold < price + 20) break;
      step({type:'buy',item});
    }
    state = loadGame(saveGame(state));
  }
  function leave() { step({type:'leave'}); }
  for (let region=0;region<4;region++) {
    const towns = TOWNS.filter(t=>t.region===region);
    for (const [i,town] of towns.entries()) { visit(town,outlaw&&i===0); leave(); }
    for (const dungeon of DUNGEONS.filter(d=>d.region===region)) {
      walkTo(dungeon); step({type:'enter'});
      for (let floor=0;floor<3;floor++) {
        const map = makeDungeon(state.dungeon.index,floor);
        const route = pathTo([1,1],[13,13],(x,y)=>map[y]?.[x]!==undefined&&map[y][x]!==1);
        for (const [x,y] of route) {
          assert.equal(state.mode,'dungeon');
          const dx=x-state.dungeon.x,dy=y-state.dungeon.y;
          const direction=DIRS.findIndex(d=>d[0]===dx&&d[1]===dy);
          while (state.dungeon.dir!==direction) step({type:'turn',delta:1});
          step({type:'forward'}); fight();
          assert.deepEqual([state.dungeon.x,state.dungeon.y],[x,y]);
        }
        step({type:'descend'}); fight();
      }
      assert.equal(state.mode,'dungeon');
      step({type:'descend'});
      assert.ok(state.relics.includes(dungeon.id));
      assert.equal(state.mode,'world');
      assert.deepEqual([state.x,state.y],[dungeon.x,dungeon.y],'Relic return preserves the dungeon entrance');
      checkpoints.push({relic:dungeon.id,level:state.level,gold:state.gold,weapon:state.weapon,armor:state.armor,turns:state.turns});
      visit(towns[0]); leave();
    }
    // The royal introduction is visited after the first two relics.
    visit(region===0 ? TOWNS.find(t=>t.id==='bellwether') : towns[0]);
    step({type:'travel',region:region===3 ? 0 : region+1});
    assert.equal(state.region,region===3 ? 0 : region+1);
  }
  visit(TOWNS.find(t=>t.id==='bellwether'));
  assert.equal(state.chapter,18);
  assert.equal(state.relics.length,8);
  assert.ok(state.flags.victories >= 8);
  assert.ok(state.quests.length > 0);
  const finalCourt = loadGame(saveGame(state));
  for (const choice of Object.keys(ENDINGS)) {
    state = finalCourt;
    step({type:'ending',choice});
    assert.equal(state.mode,'ending');
    assert.equal(state.chapter,19);
    state = loadGame(saveGame(state));
    assert.equal(state.ending,choice);
    step({type:'continue'});
    assert.equal(state.mode,'world');
    assert.equal(state.flags.legacy,choice);
  }
  return {actions,battles,turns:state.turns,level:state.level,quests:state.quests.length,checkpoints};
}

for (const outlaw of [false,true]) test(`complete ${outlaw?'outlaw':'honorable'} campaign through movement, economy, combat and saves`, t=>{
  const result=campaign(outlaw);
  t.diagnostic(JSON.stringify(result));
});
