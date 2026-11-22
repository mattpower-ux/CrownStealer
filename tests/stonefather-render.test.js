import test from 'node:test';
import assert from 'node:assert/strict';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {shrineForDungeon} from '../public/game/shrine-deities.js';
import {STONEFATHER_FLOOR_SAMPLE_SIZE,isStonefatherShrine,isTumbledShrine,stonefatherGranitePixel,stonefatherFloorPixel,tumbledColumnDebris,tumbledRomanesqueInk} from '../public/game/shrine-render.js';

const shrines=Array.from({length:4},(_,region)=>Array.from({length:24},(_,slot)=>`minor-r${region}-${slot}`)).flat().filter(id=>minorSiteDefinition(id)?.kind==='ruinedShrine');
const stonefatherId=shrines.find(id=>shrineForDungeon({site:'minor-site',minorId:id})?.id==='stonefather');

test('only Stonefather altars select giant granite walls and pale rubble floors',()=>{
 assert.ok(stonefatherId);
 assert.equal(isStonefatherShrine({site:'minor-site',minorId:stonefatherId}),true);
 for(const id of shrines)assert.equal(isStonefatherShrine({site:'minor-site',minorId:id}),shrineForDungeon({site:'minor-site',minorId:id})?.id==='stonefather',id);
 assert.match(stonefatherGranitePixel(.18,.22,.8),/^#[0-9a-f]{8}$/i);
 assert.match(stonefatherFloorPixel(.31,.74),/^#[0-9a-f]{8}$/i);
});

test('the Pelagos Collapsed Shrine is explicitly a Stormfather granite altar',()=>{
 const dungeon={site:'minor-site',minorId:'minor-r2-8'};
 assert.equal(shrineForDungeon(dungeon)?.name,'The Stormfather, God of Giants');
 assert.equal(isStonefatherShrine(dungeon),true);
});

test('Stonefather masonry uses a few monumental courses rather than small bricks',()=>{
 const rowColors=Array.from({length:100},(_,i)=>stonefatherGranitePixel(.23,i/100,1));
 const transitions=rowColors.slice(1).filter((color,i)=>color!==rowColors[i]).length;
 assert.ok(transitions>=2,'separate granite courses remain visible');
 assert.ok(transitions<=18,'wall is not subdivided into small brickwork');
 const floor=new Set(Array.from({length:80},(_,i)=>stonefatherFloorPixel((i*37%80)/80,(i*53%80)/80)));
 assert.ok(floor.size>=3,'white gravel includes angular broken-stone variation');
});

test('Stonefather rubble floor uses fine-grained canvas sampling',()=>{
 assert.equal(STONEFATHER_FLOOR_SAMPLE_SIZE,2);
});

test('Tumbled Shrines use Romanesque wall relief and perimeter column debris',()=>{
 const dungeon={site:'minor-site',minorId:'minor-r0-19'};
 assert.equal(isTumbledShrine(dungeon),true);
 assert.equal(isTumbledShrine({site:'minor-site',minorId:'minor-r0-1'}),false);
 const column=tumbledRomanesqueInk(.02,.52,.8,1);
 const frieze=tumbledRomanesqueInk(.42,.31,.8,1);
 const field=tumbledRomanesqueInk(.42,.52,.8,1);
 assert.ok(column&&frieze);
 assert.notEqual(column,field);
 assert.notEqual(frieze,field);
 const debris=tumbledColumnDebris(dungeon);
 assert.ok(debris.length>=6);
 assert.deepEqual(new Set(debris.map(piece=>piece.kind)),new Set(['drum','shaft','capital']));
 assert.ok(debris.every(({x,y})=>x<=3||x>=11||y<=3||y>=11),'debris remains near perimeter walls');
 assert.ok(debris.every(({x,y})=>Math.abs(x-7)+Math.abs(y-8)>4),'altar sightline remains clear');
});
