import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
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
 assert.equal(visible.find(object=>object.kind==='household')?.members,4);
 assert.ok(visible.some(object=>object.kind==='hearth'));
 assert.ok(visible.every(object=>object.depth>0));
});

test('the Beaver Household uses detailed realistic creature artwork',async()=>{
 const source=await readFile(new URL('../public/game/beaver-lodge-render.js',import.meta.url),'utf8');
 const artwork=await readFile(new URL('../public/assets/creatures/beaver-household-realistic.png',import.meta.url));
 assert.match(source,/beaver-household-realistic\.png/);
 assert.ok(artwork.length>500_000,'the household should use finished high-detail artwork, not a tiny placeholder');
 assert.equal(artwork[25],6,'the PNG must retain an alpha channel for clean in-world compositing');
});

test('the Beaver Household scene includes log seating and hanging winter stores',async()=>{
 const source=await readFile(new URL('../public/game/beaver-lodge-render.js',import.meta.url),'utf8');
 assert.match(source,/drawLogBench/);
 assert.match(source,/drawHangingProduce/);
 assert.match(source,/carrot/);
 assert.match(source,/cabbage/);
});

test('the hearth uses realistic transparent stone artwork',async()=>{
 const source=await readFile(new URL('../public/game/beaver-lodge-render.js',import.meta.url),'utf8');
 const artwork=await readFile(new URL('../public/assets/creatures/beaver-hearth-realistic.png',import.meta.url));
 assert.match(source,/beaver-hearth-realistic\.png/);
 assert.ok(artwork.length>500_000);
 assert.equal(artwork[25],6);
});

test('the dungeon corridor cache refreshes when lodge artwork finishes loading',async()=>{
 const source=await readFile(new URL('../public/game/render.js',import.meta.url),'utf8');
 assert.match(source,/beaverHouseholdArtworkReady\(\)/);
 assert.match(source,/artRevision,pebbleMaterialRevision,shrineMaterialRevision,lodgeArtworkReady/);
});
