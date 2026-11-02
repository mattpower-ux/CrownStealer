import test from 'node:test';import assert from 'node:assert/strict';import {townWalkable} from '../public/game/town.js';
test('Noonless Quay entrance has a clear forward route into the square',()=>{for(let y=11;y>=7;y--)assert.ok(townWalkable(6,y,{location:'noonless-quay'}),'Central entrance blocked at 6,'+y);});
