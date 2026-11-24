import test from 'node:test';
import assert from 'node:assert/strict';
import * as lodge from '../public/game/beaver-lodge-render.js';

const {isTimbertoothLodge,timberWallPixel}=lodge;

test('only Timbertooth Lodge receives the intelligent beaver-home renderer',()=>{
 assert.equal(isTimbertoothLodge({site:'minor-site',minorId:'minor-w1-4'}),true);
 assert.equal(isTimbertoothLodge({site:'minor-site',minorId:'minor-r0-0'}),false);
 assert.equal(isTimbertoothLodge({index:0,floor:0}),false);
});

test('lodge walls read as varied vertical timbers rather than cave stone',()=>{
 const across=Array.from({length:48},(_,i)=>timberWallPixel(i/48,.47,.9,3));
 const colors=new Set(across);
 assert.ok(colors.size>=14,'timber grain and alternating trunks should create varied vertical wall color');
 assert.notEqual(across[3],across[4],'adjacent samples should expose grain or a timber seam');
});

test('lodge furnishings shrink with distance and disappear behind the player',()=>{
 const hearth={kind:'hearth',x:13.5,y:13.5};
 const near=lodge.projectLodgeObject?.({x:11.5,y:13.5},hearth,1,0,Math.PI/2.6,1200,800);
 const far=lodge.projectLodgeObject?.({x:7.5,y:13.5},hearth,1,0,Math.PI/2.6,1200,800);
 const behind=lodge.projectLodgeObject?.({x:11.5,y:13.5},hearth,-1,0,Math.PI/2.6,1200,800);
 assert.ok(near&&far,'the hearth should project while the chamber is ahead');
 assert.ok(near.size>far.size,'walking toward the hearth should enlarge it naturally');
 assert.equal(behind,null,'turning away should remove it from view');
});

test('the far chamber visibly contains a peaceful beaver household',()=>{
 const visible=lodge.visibleLodgeObjects?.({x:11.5,y:13.5},1,0,Math.PI/2.6,1200,800)||[];
 assert.equal(visible.filter(object=>object.kind==='beaver').length,4);
 assert.ok(visible.some(object=>object.kind==='hearth'));
 assert.ok(visible.every(object=>object.depth>0));
});
