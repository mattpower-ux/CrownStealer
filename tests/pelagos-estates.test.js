import test from 'node:test';
import assert from 'node:assert/strict';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {
 PELAGOS_ESTATE_NAMES,
 estateDefinitionFor,
 estateFloorRole,
 isPelagosEstateDungeon,
 isPelagosEstateSite,
} from '../public/game/pelagos-estates.js';

const estateIds=['minor-r1-1','minor-r1-4','minor-r1-7','minor-r1-10','minor-r1-13','minor-r1-16','minor-r1-19','minor-r1-22'];

test('Pelagos cemetery slots become named ruined estates without changing their stable identities',()=>{
 const expectedSeeds=estateIds.map(id=>50000+24+Number(id.split('-').at(-1)));
 const estates=estateIds.map(minorSiteDefinition);
 assert.deepEqual(estates.map(site=>site.id),estateIds);
 assert.deepEqual(estates.map(site=>site.seed),expectedSeeds);
 assert.ok(estates.every(site=>site.kind==='ruinedEstate'&&site.region===1&&site.area===null));
 assert.equal(new Set(estates.map(site=>site.name)).size,8);
 assert.deepEqual(new Set(estates.map(site=>site.name)),new Set(PELAGOS_ESTATE_NAMES));
 assert.deepEqual(new Set(estates.map(site=>site.floors)),new Set([2,3,4,5]));
 for(const site of estates){
  assert.equal(isPelagosEstateSite(site),true);
  assert.deepEqual(estateDefinitionFor(site),{name:site.name,floors:site.floors});
  assert.equal(isPelagosEstateDungeon({site:'minor-site',minorId:site.id,floor:0}),true);
 }
});

test('estate floor roles identify the ground, upper residence, and final wine cellar',()=>{
 for(const id of estateIds){
  const site=minorSiteDefinition(id);
  assert.equal(estateFloorRole({site:'minor-site',minorId:id,floor:0}),'ground');
  assert.equal(estateFloorRole({site:'minor-site',minorId:id,floor:site.floors-1}),'cellar');
  for(let floor=1;floor<site.floors-1;floor++)assert.equal(estateFloorRole({site:'minor-site',minorId:id,floor}),'upper');
 }
 assert.equal(estateFloorRole({site:'minor-site',minorId:'minor-r0-2',floor:0}),null);
});

test('cemeteries outside Pelagos retain their original identity and depths',()=>{
 for(const id of ['minor-r0-2','minor-r2-0','minor-r3-2','minor-w0-1','minor-w11-2']){
  const site=minorSiteDefinition(id);
  assert.equal(site.kind,'cemetery',id);
  assert.ok(site.floors>=1&&site.floors<=3,id);
  assert.equal(isPelagosEstateSite(site),false);
  assert.equal(isPelagosEstateDungeon({site:'minor-site',minorId:id,floor:0}),false);
 }
});
