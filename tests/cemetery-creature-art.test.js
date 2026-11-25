import test from 'node:test';
import assert from 'node:assert/strict';
import {cemeteryMonsterArt,cemeterySkeletonProfile} from '../public/game/dungeon-populations.js';

test('cemetery skeletons and grave ghouls select distinct grounded encounter art',()=>{
 assert.equal(cemeteryMonsterArt({speciesId:'depth-0-skeleton-warrior'}),'skeleton');
 assert.equal(cemeteryMonsterArt({speciesId:'depth-6-grave-ghoul'}),'ghoul');
 assert.notEqual(cemeteryMonsterArt({speciesId:'depth-1-skeleton-warrior'}),cemeteryMonsterArt({speciesId:'depth-1-grave-ghoul'}));
});

test('spectral cemetery species retain their own spectral artwork',()=>{
 assert.equal(cemeteryMonsterArt({speciesId:'depth-0-crypt-ghost'}),null);
 assert.equal(cemeteryMonsterArt({speciesId:'depth-0-elder-lich'}),null);
});

test('cemetery skeleton combat art uses a human warrior silhouette instead of a round-head placeholder',()=>{
 const profile=cemeterySkeletonProfile(200,300);
 assert.ok(profile.skull.width<profile.shoulders.width*.7);
 assert.ok(profile.height>profile.skull.height*3);
 assert.ok(profile.legs.length===2);
 assert.ok(profile.ribs>=5);
});
