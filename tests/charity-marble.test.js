import test from 'node:test';import assert from 'node:assert/strict';
import {isCharityMarble,charityMarblePixel,drawShrineVault} from '../public/game/tunnel-render.js';
const rgb=p=>[p&255,p>>>8&255,p>>>16&255];
test('white marble belongs only to Lady Charity main shrine, not her pit or other shrines',()=>{assert.ok(isCharityMarble({site:'minor-site',minorId:'minor-r0-1'}));assert.equal(isCharityMarble({site:'minor-site',minorId:'minor-r0-1',charityPit:true}),false);assert.equal(isCharityMarble({site:'minor-site',minorId:'minor-r0-4'}),false);});
test('Charity marble stays luminous with thin dark veins',()=>{const tones=[];for(let y=0;y<40;y++)for(let x=0;x<40;x++)tones.push(rgb(charityMarblePixel(x/40,y/40,.6))[0]);assert.ok(tones.filter(n=>n>170).length>tones.length*.75);assert.ok(tones.some(n=>n<50));});
