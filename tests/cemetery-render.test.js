import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,dungeonMap,saveGame,loadGame} from '../public/game/engine.js';
import {dungeonChests} from '../public/game/treasure.js';
import {isCemeteryDungeon,cemeteryRemains} from '../public/game/cemetery-render.js';
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
 assert.ok(debris.some(p=>p.kind==='sarcophagus'));assert.ok(debris.some(p=>p.kind==='headstone'));assert.deepEqual(cemeteryRemains(d,map),debris);assert.equal(JSON.stringify(map),before);
});
