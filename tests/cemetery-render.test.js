import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,dungeonMap,saveGame,loadGame} from '../public/game/engine.js';
import {dungeonLadders,ladderPrompt} from '../public/game/dungeon-ladders.js';
import {cemeteryLightAt,nearestUnlitTorch} from '../public/game/cemetery-light.js';
import {dungeonChests} from '../public/game/treasure.js';
import {isCemeteryDungeon,isOpenAirCemetery,cemeteryRemains,cemeteryFacadeKind,cemeteryFacadeInk,cemeteryMarblePixel,cemeteryPropProfile,cemeteryStonePalette} from '../public/game/cemetery-render.js';
test('coffins replace cemetery loot only, including main vault and minor cemeteries',()=>{
 assert.equal(isCemeteryDungeon({index:0}),true);assert.equal(isCemeteryDungeon({site:'minor-site',minorId:'minor-r0-2',index:0}),true);
 for(const d of [{index:1},{site:'minor-site',minorId:'minor-r0-0',index:0},{site:'twinklestar-tower',index:6},{index:0,royal:'sewer'},{index:0,expedition:'wild-0-cave-0'}])assert.equal(isCemeteryDungeon(d),false);
});
test('coffins preserve chest gold, loot IDs, one-time opening and save state',()=>{
 const s=createGame();s.mode='dungeon';s.dungeon={index:0,floor:3,x:1,y:1,dir:0,ladderLayout:1};const chest=dungeonChests(s,dungeonMap(s.dungeon))[0];Object.assign(s.dungeon,{x:chest.x,y:chest.y});
 const after=act(s,{type:'openChest'});assert.equal(after.gold,s.gold+chest.gold);assert.ok(after.openedChests.includes(chest.id));assert.match(after.log.at(-1),/^Coffin opened:/);assert.equal(act(after,{type:'openChest'}).gold,after.gold);assert.ok(loadGame(saveGame(after)).openedChests.includes(chest.id));
});
test('broken cemetery remains are deterministic decorative objects and do not alter dungeon navigation',()=>{
 const d={index:0,floor:3,x:1,y:1,dir:0},map=dungeonMap(d),before=JSON.stringify(map),debris=cemeteryRemains(d,map);
 assert.ok(debris.some(p=>p.kind==='sarcophagus'));assert.ok(debris.every(p=>p.kind!=='headstone'));assert.deepEqual(cemeteryRemains(d,map),debris);assert.equal(JSON.stringify(map),before);
});

test('every cemetery surface opens onto a moonlit yard and stairs descend to enclosed crypts',()=>{
 const s=createGame();
 s.mode='dungeon';
 s.dungeon={site:'minor-site',minorId:'minor-r0-5',index:0,floor:0,x:1,y:1,dir:1,ladderLayout:1};
 const d=s.dungeon,map=dungeonMap(d);
 assert.equal(isOpenAirCemetery(d),true);
 assert.equal(isOpenAirCemetery({...d,floor:1}),false);
 assert.equal(isOpenAirCemetery({...d,minorId:'minor-r0-0'}),false);
 assert.equal(isOpenAirCemetery({index:0,floor:0}),true);
 assert.equal(isOpenAirCemetery({index:0,floor:1}),false);
 assert.ok(map[0].every(tile=>tile===1));
 assert.ok(map.every(row=>row[0]===1&&row.at(-1)===1));
 assert.equal(map[6][6],0);
 assert.equal(ladderPrompt(s,map).gate,true);
 assert.equal(ladderPrompt(s,map).upAction,'leave');
 assert.equal(nearestUnlitTorch(s,map),null);
 assert.ok(cemeteryLightAt(s,map,6.5,6.5)>.18);
 assert.ok(cemeteryRemains(d,map).some(p=>p.kind==='crypt'));
 const down=dungeonLadders(d,map).find(ladder=>ladder.direction==='down');
 Object.assign(d,{x:down.x,y:down.y});
 assert.equal(act(s,{type:'descend'}).dungeon.floor,1);
});

test('surface cemeteries form a dense varied necropolis instead of a sparse yard',()=>{
 const d={index:0,floor:0,x:1,y:1,dir:0},map=dungeonMap(d),structures=cemeteryRemains(d,map);
 assert.ok(structures.length>=18);
 for(const kind of ['mausoleum','vault','obelisk','sarcophagus'])assert.ok(structures.some(item=>item.kind===kind),kind);
 assert.ok(structures.every(item=>item.kind!=='headstone'),'short skull-faced stones are absent');
 const faces=new Set(Array.from({length:20},(_,i)=>cemeteryFacadeKind(i,i*3,true)));
 assert.ok(faces.size>=4);
 const door=cemeteryFacadeInk('vault-door',.57,.72),rgb=door.match(/[0-9a-f]{2}/gi).map(value=>parseInt(value,16));
 assert.ok(rgb.reduce((sum,value)=>sum+value,0)<90,'vault entrance stays nearly black');
 assert.match(cemeteryFacadeInk('memorial-niche',.5,.42),/^#/);
});

test('surface vault marble is deterministic, varied and visibly weathered',()=>{
 const sample=[];
 for(let y=0;y<20;y++)for(let x=0;x<24;x++)sample.push(cemeteryMarblePixel(7,(x+.5)/24,(y+.5)/20,1));
 assert.deepEqual(sample,Array.from({length:20},(_,y)=>Array.from({length:24},(_,x)=>cemeteryMarblePixel(7,(x+.5)/24,(y+.5)/20,1))).flat());
 assert.ok(new Set(sample).size>45,'marble has granular variation instead of broad flat blocks');
 const rgb=sample.map(color=>[color&255,(color>>>8)&255,(color>>>16)&255]);
 const brightness=rgb.map(([r,g,b])=>(r+g+b)/3);
 assert.ok(Math.max(...brightness)>175,'clean marble remains pale under moonlight');
 assert.ok(Math.min(...brightness)<95,'runoff, cracks and pits visibly weather the stone');
 assert.ok(rgb.some(([r,g,b])=>g>r+5&&g>b),'some lower stone carries restrained moss staining');
});

test('cemetery props are dimensional gothic stone and contain only human remains',()=>{
 const d={index:0,floor:0,x:1,y:1,dir:0},structures=cemeteryRemains(d,dungeonMap(d));
 for(const kind of ['skull','femur','ribcage'])assert.ok(structures.some(item=>item.kind===kind),kind);
 assert.ok(structures.every(item=>!item.kind.toLowerCase().includes('fish')));
 for(const kind of ['headstone','obelisk','mausoleum']){
  const profile=cemeteryPropProfile(kind,3);
  assert.equal(profile.gothic,true);
  assert.ok(profile.depth>.08,kind);
  assert.ok(profile.facets>=3,kind);
 }
 assert.deepEqual(cemeteryStonePalette(),{face:'#c7cec7',side:'#59645f',edge:'#e0e3d8',moss:'#526451'});
});
