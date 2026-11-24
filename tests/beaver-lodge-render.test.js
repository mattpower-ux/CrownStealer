import test from 'node:test';
import assert from 'node:assert/strict';
import {isTimbertoothLodge,timberWallPixel} from '../public/game/beaver-lodge-render.js';

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
