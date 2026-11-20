import test from 'node:test';
import assert from 'node:assert/strict';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {shrineForDungeon} from '../public/game/shrine-deities.js';
import {isStonefatherShrine,stonefatherGranitePixel,stonefatherFloorPixel} from '../public/game/shrine-render.js';

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
