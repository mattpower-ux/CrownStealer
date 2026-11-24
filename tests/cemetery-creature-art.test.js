import test from 'node:test';
import assert from 'node:assert/strict';
import {cemeteryMonsterArt} from '../public/game/dungeon-populations.js';

test('cemetery skeletons and grave ghouls select distinct grounded encounter art',()=>{
 assert.equal(cemeteryMonsterArt({speciesId:'depth-0-skeleton-warrior'}),'skeleton');
 assert.equal(cemeteryMonsterArt({speciesId:'depth-6-grave-ghoul'}),'ghoul');
 assert.notEqual(cemeteryMonsterArt({speciesId:'depth-1-skeleton-warrior'}),cemeteryMonsterArt({speciesId:'depth-1-grave-ghoul'}));
});

test('spectral cemetery species retain their own spectral artwork',()=>{
 assert.equal(cemeteryMonsterArt({speciesId:'depth-0-crypt-ghost'}),null);
 assert.equal(cemeteryMonsterArt({speciesId:'depth-0-elder-lich'}),null);
});
