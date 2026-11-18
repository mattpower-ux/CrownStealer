import test from 'node:test';
import assert from 'node:assert/strict';
import {clampAtlasZoom,atlasView} from '../public/game/atlas-view.js';

test('world atlas exposes bounded zoom controls',()=>{
 assert.equal(clampAtlasZoom(.1),.75);
 assert.equal(clampAtlasZoom(9),3);
 assert.equal(clampAtlasZoom(1.5),1.5);
 const html=atlasView({region:0,x:1,y:1,relics:[],flags:{visitedLands:[0]},exploration:null});
 assert.match(html,/data-atlas-zoom="out"/);
 assert.match(html,/data-atlas-zoom="in"/);
 assert.match(html,/data-atlas-zoom="fit"/);
});
