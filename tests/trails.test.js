import test from 'node:test';import assert from 'node:assert/strict';
import {minorApproachTrails,regionTrails,trailBlocked} from '../public/game/trails.js';
test('curved trails reach every landmark, avoid impassable mountains and have stable bends',()=>{for(let region=0;region<4;region++){const paths=regionTrails(region);assert.ok(paths.length>=2);for(const path of paths){assert.deepEqual(path.points.at(-1),{x:path.site.x+.5,y:path.site.y+.5});assert.ok(path.points.every(p=>!trailBlocked(region,Math.floor(p.x),Math.floor(p.y))));assert.ok(path.points.some(p=>Math.abs(p.y-(path.site.y+.5))>.4));}assert.deepEqual(regionTrails(region),paths);}});

test('old shrines and cemeteries receive distinct minor approaches in every land',()=>{
 for(let region=0;region<4;region++){
  const sites=[{id:`shrine-${region}`,minorKind:'ruinedShrine',x:64,y:20},{id:`cemetery-${region}`,minorKind:'cemetery',x:104,y:48}];
  const paths=minorApproachTrails(region,sites);
  assert.equal(paths.length,2);
  assert.equal(paths[0].style,'footpath');
  assert.equal(paths[1].style,'ruined-road');
  for(const path of paths)assert.deepEqual(path.points.at(-1),{x:path.site.x+.5,y:path.site.y+.5});
 }
});
