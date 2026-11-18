import test from 'node:test';import assert from 'node:assert/strict';
import {discoveredDungeonLadders,dungeonLadders,ladderPrompt} from '../public/game/dungeon-ladders.js';
import {act,createGame,dungeonMap,loadGame,saveGame} from '../public/game/engine.js';
test('ladder prompts follow actual up and down ladder tiles',()=>{const base={index:0,floor:0},map=dungeonMap(base);for(const ladder of dungeonLadders(base,map)){const d={...base,x:ladder.x,y:ladder.y};assert.equal(ladderPrompt({mode:'dungeon',dungeon:d},map).direction,ladder.direction);}assert.equal(ladderPrompt({mode:'dungeon',dungeon:{...base,x:2,y:1}},map),null);});
test('combat and final reliquaries do not offer phantom down ladders',()=>{const d={index:0,floor:9,x:13,y:13};assert.equal(ladderPrompt({mode:'dungeon',dungeon:d},dungeonMap(d)),null);assert.equal(ladderPrompt({mode:'battle',dungeon:{...d,x:1,y:1}},dungeonMap(d)),null);});
test('royal sewer up ladder uses the escape action',()=>{const d={index:0,floor:0,x:13,y:13,royal:'sewer'};assert.equal(ladderPrompt({mode:'dungeon',dungeon:d},dungeonMap(d)).upAction,'descend');});

test('new dungeon ladders occupy distinct mid-hallway tiles with floor and ceiling openings', () => {
  const d = {index: 2, floor: 3, ladderLayout: 1};
  const map = dungeonMap(d);
  const ladders = dungeonLadders(d, map);
  assert.deepEqual(ladders.map(ladder => ladder.opening), ['ceiling', 'floor']);
  assert.notDeepEqual([ladders[0].x, ladders[0].y], [ladders[1].x, ladders[1].y]);
  for (const ladder of ladders) {
    const {x, y, wallX, wallY, direction} = ladder;
    assert.equal(map[y][x], 0);
    assert.equal(map[wallY][wallX], 1);
    const northSouth = map[y - 1][x] !== 1 && map[y + 1][x] !== 1;
    const eastWest = map[y][x - 1] !== 1 && map[y][x + 1] !== 1;
    assert.ok(northSouth || eastWest);
    assert.equal(ladderPrompt({mode: 'dungeon', dungeon: {...d, x, y}}, map).direction, direction);
  }
  assert.deepEqual(dungeonLadders({...d}, map), ladders);
});

test('surface and legacy dungeon ladders keep their existing accessible exits', () => {
  const surface = {index: 2, floor: 0, ladderLayout: 1};
  const firstUp = dungeonLadders(surface, dungeonMap(surface)).find(ladder => ladder.direction === 'up');
  assert.deepEqual([firstUp.x, firstUp.y, firstUp.opening], [1, 1, 'ceiling']);
  const legacy = {index: 2, floor: 3};
  const legacyLadders = dungeonLadders(legacy, dungeonMap(legacy));
  assert.deepEqual(legacyLadders.map(({x, y, opening}) => [x, y, opening]), [[1, 1, 'ceiling'], [13, 13, 'floor']]);
});

test('opening a secret room never moves a hallway ladder', () => {
  const d = {index: 2, floor: 4, ladderLayout: 1};
  const before = dungeonLadders(d, dungeonMap(d));
  const secretRoom = {x: 2, y: 2};
  assert.equal(dungeonMap(d)[secretRoom.y][secretRoom.x], 1);
  const discovered = {...d, secretRoom};
  assert.deepEqual(dungeonLadders(discovered, dungeonMap(discovered)), before);
});

test('only visited ladders appear on the dungeon minimap and stay discovered after saving',()=>{
 const s=createGame();
 s.mode='dungeon';
 s.dungeon={index:0,floor:0,x:1,y:1,dir:1};
 if(dungeonMap(s.dungeon)[1][2]===1)s.dungeon.dir=2;
 const ladders=dungeonLadders(s.dungeon,dungeonMap(s.dungeon));
 assert.deepEqual(discoveredDungeonLadders(s,ladders).map(l=>l.direction),['up']);
 const next=act(s,{type:'forward'},[],{noEncounters:true});
 assert.notDeepEqual([next.dungeon.x,next.dungeon.y],[s.dungeon.x,s.dungeon.y]);
 const restored=loadGame(saveGame(next));
 assert.deepEqual(discoveredDungeonLadders(restored,ladders).map(l=>l.direction),['up']);
 restored.dungeon.floor++;
 assert.deepEqual(discoveredDungeonLadders(restored,ladders),[]);
});
