import test from 'node:test';
import assert from 'node:assert/strict';
import {heatLairProfile,heatLavaVein,heatMeltedPixel} from '../public/game/heat-lair-render.js';

test('wyrm and fire-imp natural lairs use melted stone, lava and no torches',()=>{
 const wyrm=heatLairProfile({site:'minor-site',minorId:'minor-w4-19'});
 assert.ok(wyrm?.meltedStone);
 assert.equal(wyrm.torches,false);
 assert.equal(wyrm.lavaVeins,true);
 assert.ok(heatLairProfile({site:'firedrak'}));
});

test('ordinary caves and shrines do not receive the volcanic lair treatment',()=>{
 assert.equal(heatLairProfile({site:'minor-site',minorId:'minor-r0-0'}),null);
 assert.equal(heatLairProfile({site:'minor-site',minorId:'minor-w4-20'}),null);
});

test('melted walls contain sparse luminous lava veins',()=>{
 let vein=null;
 for(let face=0;face<30&&!vein;face++)for(let y=1;y<99&&!vein;y++)for(let x=1;x<99&&!vein;x++)if(heatLavaVein(face,x/100,y/100))vein={face,u:x/100,v:y/100};
 assert.ok(vein);
 assert.notEqual(heatMeltedPixel(vein.face,vein.u,vein.v,1),heatMeltedPixel(1,.2,.2,1));
});
