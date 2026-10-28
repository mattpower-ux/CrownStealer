import test from 'node:test';import assert from 'node:assert/strict';
import {ladderPrompt} from '../public/game/dungeon-ladders.js';
import {dungeonMap} from '../public/game/engine.js';
test('ladder prompts follow actual up and down ladder tiles',()=>{for(const [x,y,direction] of [[1,1,'up'],[13,13,'down']]){const d={index:0,floor:0,x,y};assert.equal(ladderPrompt({mode:'dungeon',dungeon:d},dungeonMap(d)).direction,direction);}assert.equal(ladderPrompt({mode:'dungeon',dungeon:{index:0,floor:0,x:2,y:1}},dungeonMap({index:0,floor:0})),null);});
test('combat and final reliquaries do not offer phantom down ladders',()=>{const d={index:0,floor:9,x:13,y:13};assert.equal(ladderPrompt({mode:'dungeon',dungeon:d},dungeonMap(d)),null);assert.equal(ladderPrompt({mode:'battle',dungeon:{...d,x:1,y:1}},dungeonMap(d)),null);});
test('royal sewer up ladder uses the escape action',()=>{const d={index:0,floor:0,x:13,y:13,royal:'sewer'};assert.equal(ladderPrompt({mode:'dungeon',dungeon:d},dungeonMap(d)).upAction,'descend');});
