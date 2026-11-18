import test from 'node:test';
import assert from 'node:assert/strict';
import {isTrollCave,trollRockPixel} from '../public/game/troll-cave-render.js';

test('only regional troll caves receive the high-vault camp scene',()=>{
 assert.equal(isTrollCave({site:'minor-site',minorId:'minor-r3-3'}),true);
 assert.equal(isTrollCave({site:'minor-site',minorId:'minor-r0-0'}),false);
 assert.equal(isTrollCave({index:7,floor:0}),false);
});

test('rough troll rock varies across a wall without bitmap weight',()=>{
 const samples=new Set(Array.from({length:20},(_,i)=>trollRockPixel(i/20,(i*7%19)/19,.8,4)));
 assert.ok(samples.size>8);
});
