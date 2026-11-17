import test from 'node:test';import assert from 'node:assert/strict';
import {mossyShrinePixel} from '../public/game/tunnel-render.js';
test('mossy shrine material has substantial green organic coverage',()=>{let green=0;for(let y=0;y<20;y++)for(let x=0;x<20;x++){const c=mossyShrinePixel(x/13,y/19,1),r=c&255,g=c>>>8&255,b=c>>>16&255;if(g>r&&g>b)green++;}assert.ok(green>150);});
