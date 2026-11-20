import test from 'node:test';
import assert from 'node:assert/strict';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {
 PELAGOS_ESTATE_NAMES,
 estateDefinitionFor,
 estateDungeonMap,
 estateFloorRole,
 estateStairAnchors,
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

function connected(map){
 const queue=[[1,1]],seen=new Set(['1,1']);
 for(const [x,y] of queue)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(map[ny]?.[nx]===undefined||map[ny][nx]===1||seen.has(key))continue;
  seen.add(key);queue.push([nx,ny]);
 }
 return seen;
}

test('every estate floor is a deterministic connected room plan with a circulation loop',()=>{
 for(const id of estateIds){
  const site=minorSiteDefinition(id);
  for(let floor=0;floor<site.floors;floor++){
   const d={site:'minor-site',minorId:id,floor},map=estateDungeonMap(d),again=estateDungeonMap(d);
   assert.deepEqual(map,again,id+':'+floor);
   assert.equal(map.length,15);assert.ok(map.every(row=>row.length===15));
   assert.ok(map[0].every(tile=>tile===1)&&map[14].every(tile=>tile===1));
   assert.ok(map.every(row=>row[0]===1&&row[14]===1));
   const anchors=estateStairAnchors(d);
   assert.notEqual(map[anchors.entry.y][anchors.entry.x],1);
   assert.notEqual(map[anchors.destination.y][anchors.destination.x],1);
   const seen=connected(map),open=map.flat().filter(tile=>tile!==1).length;
   assert.equal(seen.size,open,id+':'+floor+' connected');
   assert.ok(seen.has(anchors.destination.x+','+anchors.destination.y));
   let rooms=0,edges=0;
   for(let y=1;y<13;y++)for(let x=1;x<13;x++){
    if([map[y][x],map[y+1][x],map[y][x+1],map[y+1][x+1]].every(tile=>tile!==1))rooms++;
    if(map[y][x]!==1){if(map[y][x+1]!==1)edges++;if(map[y+1][x]!==1)edges++;}
   }
   assert.ok(rooms>=8,id+':'+floor+' room-sized spaces');
   assert.ok(edges>=open,id+':'+floor+' circulation loop');
  }
  if(site.floors>1)assert.notDeepEqual(estateDungeonMap({site:'minor-site',minorId:id,floor:site.floors-2}),estateDungeonMap({site:'minor-site',minorId:id,floor:site.floors-1}));
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
