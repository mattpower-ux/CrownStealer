import test from 'node:test';import assert from 'node:assert/strict';
import {estateRenderProfile,estateWallPixel} from '../public/game/pelagos-estate-render.js';
import {isCemeteryDungeon,isOpenAirCemetery} from '../public/game/cemetery-render.js';
import {cemeteryTorches} from '../public/game/cemetery-light.js';
import {beginCemeteryHaunting} from '../public/game/cemetery-haunting.js';
import {estateDungeonMap} from '../public/game/pelagos-estates.js';

test('estate materials are pale alabaster above ground and damp stone in cellars',()=>{const ground={site:'minor-site',minorId:'minor-r1-10',floor:0},cellar={...ground,floor:4};const a=estateWallPixel(1,.3,.4,1,'ground'),b=estateWallPixel(1,.3,.4,1,'cellar');assert.ok((a&255)>(b&255));const hall=estateRenderProfile(ground).features,below=estateRenderProfile(cellar).features;for(const feature of ['rib-vaulted ceilings','broken stained glass','vine-covered pillars','marble debris'])assert.ok(hall.includes(feature));for(const feature of ['wine racks','casks','damp alabaster','fallen masonry'])assert.ok(below.includes(feature));});
test('ruined estates never inherit cemetery darkness, torches, open air, or hauntings',()=>{const d={site:'minor-site',minorId:'minor-r1-10',floor:0,x:6,y:6},map=estateDungeonMap(d),s={mode:'dungeon',dungeon:d,flags:{}};assert.equal(isCemeteryDungeon(d),false);assert.equal(isOpenAirCemetery(d),false);assert.deepEqual(cemeteryTorches(d,map),[]);assert.equal(beginCemeteryHaunting(s,map),null);});
