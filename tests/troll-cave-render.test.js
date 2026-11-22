import test from 'node:test';
import assert from 'node:assert/strict';
import {isTrollCave,trollRockPixel,TROLL_CAMP_ASSETS} from '../public/game/troll-cave-render.js';
import {stat} from 'node:fs/promises';

test('only regional troll caves receive the high-vault camp scene',()=>{
 assert.equal(isTrollCave({site:'minor-site',minorId:'minor-r3-3'}),true);
 assert.equal(isTrollCave({site:'minor-site',minorId:'minor-r0-0'}),false);
 assert.equal(isTrollCave({index:7,floor:0}),false);
});
test('rough troll rock varies across a wall without bitmap weight',()=>{
 const samples=new Set(Array.from({length:20},(_,i)=>trollRockPixel(i/20,(i*7%19)/19,.8,4)));
 assert.ok(samples.size>8);
});
test('troll camp uses four separate optimized realistic prop assets',async()=>{
 assert.deepEqual(Object.keys(TROLL_CAMP_ASSETS).sort(),['bonesBoar','bonesHorned','fire','hammer']);
 for(const path of Object.values(TROLL_CAMP_ASSETS)){
  assert.match(path,/^\/assets\/troll-.+\.webp$/);
  const file=await stat(new URL('../public'+path,import.meta.url));
  assert.ok(file.size>20_000&&file.size<180_000,`${path}: ${file.size}`);
 }
});
