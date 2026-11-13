import test from 'node:test';
import {townPlaces} from '../public/game/town.js';
import assert from 'node:assert/strict';
import {act, createGame, dungeonMap, dungeonName, loadGame, saveGame} from '../public/game/engine.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {itemArt, itemById} from '../public/game/items.js';
import {dungeonChests, merchantStock} from '../public/game/treasure.js';
import {dungeonFloors} from '../public/game/dungeon-depths.js';
import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import {TOWNS} from '../public/game/content.js';
import {castleLayout} from '../public/game/castle-interiors.js';
import {ROYAL_DUNGEON_STAIR, ROYAL_DUNGEON_CELLS, ROYAL_DUNGEON_NPCS, royalDungeonAt, royalDungeonActions} from '../public/game/royal-dungeon.js';

const roundTrip = s => loadGame(saveGame(s));

function atStair(town = TOWNS.find(town => town.id === 'bellwether')) {
  const s = createGame();
  return {...s, mode: 'town', location: town.id, region: town.region, x: town.x, y: town.y,
    castle: {...ROYAL_DUNGEON_STAIR, alarm: false}};
}

function walkTo(s, tx, ty) {
  const map = dungeonMap(s.dungeon);
  const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const queue = [{x: s.dungeon.x, y: s.dungeon.y, path: []}];
  const visited = new Set();
  for (const {x, y, path} of queue) {
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (x === tx && y === ty) {
      for (const dir of path) {
        while (s.dungeon.dir !== dir) s = act(s, {type: 'turn', delta: 1});
        s = act(s, {type: 'forward'});
        assert.equal(s.mode, 'dungeon');
      }
      return s;
    }
    for (const [dir, [dx, dy]] of dirs.entries()) {
      const tile = map[y + dy]?.[x + dx];
      if (tile !== undefined && tile !== 1) queue.push({x: x + dx, y: y + dy, path: [...path, dir]});
    }
  }
  assert.fail(`No dungeon path to ${tx},${ty}`);
}

function win(s) {
  s.enemy.hp = 1;
  s.level = 100;
  s.rng = 187441;
  const result = roundTrip(act(s, {type: 'attack'}));
  assert.equal(result.mode, 'dungeon');
  assert.equal(result.enemy, null);
  return result;
}

test('only the Bellwether stair leads to one dungeon floor and the ladder returns to the castle', () => {
  const enter = {type: 'enterRoyalDungeon'};
  for (const town of TOWNS.filter(town => town.id !== 'bellwether')) {
    assert.equal(castleLayout(town.id).dungeonStair, null, town.id);
    const forged = act(atStair(town), enter);
    assert.equal(forged.mode, 'town', town.id);
    assert.equal(forged.dungeon, null, town.id);
  }
  const castle = atStair();
  assert.equal(act({...castle, castle: undefined}, enter).mode, 'town');
  assert.equal(act({...castle, castle: {...castle.castle, x: castle.castle.x - 1}}, enter).mode, 'town');
  let s = roundTrip(act(castle, enter));
  assert.equal(s.dungeon.site, 'royal-dungeon');
  assert.match(dungeonName(s.dungeon), /Royal Dungeon/);
  assert.equal(dungeonFloors(s.dungeon), 1);
  const map = dungeonMap(s.dungeon);
  assert.deepEqual(dungeonLadders(s.dungeon, map).map(({x, y, direction}) => ({x, y, direction})), [{x: 1, y: 1, direction: 'up'}]);
  assert.deepEqual(dungeonChests(s, map), []);
  assert.equal(s.castle, undefined);
  for (const npc of ROYAL_DUNGEON_NPCS) s = walkTo(s, npc.x, npc.y);
  assert.equal(act(s, {type: 'leave'}).mode, 'dungeon');
  s = walkTo(s, 1, 1);
  s = roundTrip(act(s, {type: 'leave'}));
  assert.equal(s.mode, 'town');
  assert.deepEqual(s.castle, castle.castle);
  assert.equal(s.dungeon, null);
});

test('staff remain passive when approached and spoken to, and either insult or attack starts one fight', () => {
  let s = act(atStair(), {type: 'enterRoyalDungeon'});
  assert.equal(act(s, {type: 'royalDungeonAttack', id: 'royal-torturer'}).mode, 'dungeon');
  const heckler = ROYAL_DUNGEON_NPCS.find(npc => npc.id === 'royal-heckler');
  s = walkTo(s, heckler.x, heckler.y - 1);
  assert.equal(royalDungeonAt(s).id, heckler.id);
  assert.ok(royalDungeonActions(s).some(({action}) => action.type === 'royalDungeonInsult'));
  const greeting = [];
  s = act(s, {type: 'royalDungeonTalk', id: heckler.id}, greeting);
  assert.match(s.log.at(-1), /You’re about as strong as a drunken weasel!/);
  assert.equal(greeting.find(event => event.voice)?.voice, 'royal-heckler-0');
  s = roundTrip(act(s, {type: 'royalDungeonTalk', id: heckler.id}));
  assert.match(s.log.at(-1), /Take off that mask, fool\. You can’t really be that ugly!/);
  assert.equal(s.mode, 'dungeon');
  const insulted = roundTrip(act(s, {type: 'royalDungeonInsult', id: heckler.id}));
  assert.equal(insulted.mode, 'battle');
  assert.equal(insulted.enemy.royalDungeonNpc, heckler.id);
  assert.equal(insulted.enemy.groupSize, undefined);
  const attacked = act(s, {type: 'royalDungeonAttack', id: heckler.id});
  assert.equal(attacked.enemy.royalDungeonNpc, heckler.id);
  const events = [];
  const guarded = roundTrip(act(insulted, {type: 'guard'}, events));
  assert.match(guarded.log.at(-1), /heckles you/);
  assert.ok(events.some(event => event.voice === 'royal-heckler-2' && event.message === 'I’ve seen a wet sack of turnips put up a better fight!'));
  const invalid = structuredClone(guarded);
  Object.assign(invalid.dungeon, {x: 1, y: 1});
  assert.throws(() => roundTrip(invalid), /Invalid royal dungeon/);
});

test('trying either cell provokes one guard at a time and releasing all three prisoners grants one necklace', () => {
  let s = act(atStair(), {type: 'enterRoyalDungeon'});
  assert.equal(ROYAL_DUNGEON_CELLS.length, 2);
  assert.equal(ROYAL_DUNGEON_CELLS.flatMap(cell => cell.prisoners).length, 3);
  const [west, east] = ROYAL_DUNGEON_CELLS;
  for (const cell of ROYAL_DUNGEON_CELLS) assert.equal(dungeonMap(s.dungeon)[cell.door.y][cell.door.x], 1);
  s = walkTo(s, west.x, west.y);
  const greeting = [];
  s = act(s, {type: 'royalDungeonFree', id: west.id}, greeting);
  assert.equal(s.enemy.royalDungeonNpc, 'royal-torturer');
  assert.equal(greeting.find(event => event.voice === 'royal-torturer-intro')?.message, "Oh goodee. A little fly has flown into our little nest, and now I've got to squash him. This might be a bit messy.");
  s = win(s);
  assert.equal(s.dungeon.cellsOpen, false);
  s = walkTo(s, east.x, east.y);
  s = act(s, {type: 'royalDungeonFree', id: east.id});
  assert.equal(s.enemy.royalDungeonNpc, 'royal-heckler');
  s = win(s);
  s = roundTrip(act(s, {type: 'royalDungeonFree', id: east.id}));
  assert.equal(s.dungeon.cellsOpen, true);
  for (const cell of ROYAL_DUNGEON_CELLS) assert.equal(dungeonMap(s.dungeon)[cell.door.y][cell.door.x], 0);
  const reward = 'necklace-bravery';
  assert.equal(s.bag.filter(id => id === reward).length, 1);
  assert.ok(s.pendingLoot.includes(reward));
  assert.match(itemArt(itemById(reward, s)), /Necklace of Bravery illustration/);
  assert.ok(TOWNS.every(town => !merchantStock(town.region, town.id, 100).includes(reward)));
  const charisma = effectiveAttributes(s, itemById).charisma;
  s = act(s, {type: 'equip', id: reward});
  assert.equal(effectiveAttributes(s, itemById).charisma, charisma + 5);
  s = walkTo(s, 1, 1);
  s = act(act(s, {type: 'leave'}), {type: 'enterRoyalDungeon'});
  assert.equal(s.dungeon.cellsOpen, true);
  s = walkTo(s, west.x, west.y);
  s = roundTrip(act(s, {type: 'royalDungeonFree', id: west.id}));
  assert.equal(s.bag.filter(id => id === reward).length, 1);
});

test('save loading rejects opened cells before the prisoners were released', () => {
  const s = act(atStair(), {type: 'enterRoyalDungeon'});
  s.dungeon.cellsOpen = true;
  assert.throws(() => roundTrip(s), /Invalid royal dungeon/);
});

test('the Heckler uses a different voiced insult each attack and resumes its order from a save', () => {
  const dungeon = act(atStair(), {type: 'enterRoyalDungeon'});
  const heckler = ROYAL_DUNGEON_NPCS.find(npc => npc.id === 'royal-heckler');
  const nearby = walkTo(dungeon, heckler.x, heckler.y - 1);
  let s = act(nearby, {type: 'royalDungeonAttack', id: heckler.id});
  s.hp = s.maxHp = 1000;
  const lines = new Set();
  for (let i = 0; i < 9; i++) {
    const events = [];
    s = roundTrip(act(s, {type: 'guard'}, events));
    const voice = events.find(event => event.voice);
    assert.equal(voice?.voice, 'royal-heckler-' + (i % 8));
    lines.add(voice.message);
  }
  assert.equal(lines.size, 8);
});

test('fleeing preserves the dungeon and special escapes lead to valid destinations', () => {
  const dungeon = act(atStair(), {type: 'enterRoyalDungeon'});
  const heckler = ROYAL_DUNGEON_NPCS.find(npc => npc.id === 'royal-heckler');
  const nearby = walkTo(dungeon, heckler.x, heckler.y - 1);
  nearby.bag.push('dungeon-elevator', 'scroll-return');
  const fight = act(nearby, {type: 'royalDungeonAttack', id: heckler.id});
  const fled = roundTrip(act({...fight, rng: 1024}, {type: 'flee'}));
  assert.equal(fled.mode, 'dungeon');
  assert.deepEqual([fled.dungeon.x, fled.dungeon.y], [1, 1]);
  assert.equal(fled.enemy, null);

  const defeated = roundTrip(act({...fight, hp: 1}, {type: 'guard'}));
  assert.equal(defeated.mode, 'world');
  assert.equal(defeated.dungeon, null);
  assert.equal(defeated.castle, undefined);
  assert.equal(defeated.flags['royalDungeonDefeated:' + heckler.id], undefined);

  const elevator = roundTrip(act(nearby, {type: 'dungeonElevator', floor: 0}));
  assert.equal(elevator.mode, 'town');
  assert.deepEqual(elevator.castle, {...ROYAL_DUNGEON_STAIR, alarm: false});
  assert.equal(elevator.bag.includes('dungeon-elevator'), false);

  const returned = roundTrip(act(fight, {type: 'useItem', id: 'scroll-return'}));
  assert.equal(returned.mode, 'town');
  assert.notEqual(returned.location, 'bellwether');
  assert.equal(returned.castle, undefined);
  assert.equal(returned.dungeon, null);
  assert.equal(returned.bag.filter(id => id === 'scroll-return').length, fight.bag.filter(id => id === 'scroll-return').length - 1);
});

test('Bellwether palace doorway and walked stair enter the staffed royal dungeon',()=>{
 const town=TOWNS.find(t=>t.id==='bellwether');let s=createGame();Object.assign(s,{mode:'town',returnMode:'town',location:town.id,region:town.region,x:town.x,y:town.y,townPosition:{x:4,y:3}});s.townPosition=townPlaces(s).find(p=>p.id==='court');
 s=act(s,{type:'enterCastle'});assert.deepEqual({x:s.castle.x,y:s.castle.y},castleLayout(town.id).entrance);
 s=act(s,{type:'move',dx:0,dy:-1});s=act(s,{type:'move',dx:1,dy:0});assert.equal(s.castle.x,ROYAL_DUNGEON_STAIR.x);assert.equal(s.castle.y,ROYAL_DUNGEON_STAIR.y);
 s=roundTrip(act(s,{type:'enterRoyalDungeon'}));assert.equal(s.dungeon.site,'royal-dungeon');assert.equal(ROYAL_DUNGEON_CELLS.length,2);assert.equal(ROYAL_DUNGEON_CELLS.flatMap(c=>c.prisoners).length,3);
 for(const npc of ROYAL_DUNGEON_NPCS){s=walkTo(s,npc.x,npc.y);assert.equal(royalDungeonAt(s).id,npc.id);assert.ok(royalDungeonActions(s).some(a=>a.action.type==='royalDungeonTalk'));}
});
