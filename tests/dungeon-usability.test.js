import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dungeonMap,act,visibleDungeonGuardian} from '../public/game/engine.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {dungeonChests} from '../public/game/treasure.js';
import {cemeteryLightAt,drawCemeteryDarkness} from '../public/game/cemetery-light.js';
test('every cemetery floor contains burial treasure, including quiet cemeteries',()=>{
 for(const land of [...Array.from({length:4},(_,i)=>'r'+i),...Array.from({length:12},(_,i)=>'w'+i)])for(let n=0;n<24;n++){
 const site=minorSiteDefinition(`minor-${land}-${n}`);if(site.kind!=='cemetery')continue;
 for(let floor=0;floor<site.floors;floor++){
 const s=createGame();s.mode='dungeon';s.dungeon={site:'minor-site',minorId:site.id,index:site.index,floor,x:1,y:1,dir:1};
 const map=dungeonMap(s.dungeon),chests=dungeonChests(s,map);assert.ok(chests.some(c=>c.gold>0&&c.items.length),site.id+':'+floor);
 for(const c of chests)assert.notEqual(map[c.y][c.x],1);
 }
 }
});
test('combat illuminates a cemetery without lighting its permanent torches',()=>{
 const s=createGame();s.dungeon={index:0,floor:0,x:1,y:1,dir:1};s.mode='dungeon';const map=dungeonMap(s.dungeon);
 assert.equal(cemeteryLightAt(s,map,1.5,1.5),0);s.mode='battle';assert.equal(cemeteryLightAt(s,map,1.5,1.5),1);drawCemeteryDarkness(null,100,100,s,map);s.mode='dungeon';assert.equal(cemeteryLightAt(s,map,1.5,1.5),0);
});
test('explicit engagement works even when automatic preview encounters are disabled',()=>{
 const s=createGame();s.mode='dungeon';s.dungeon={site:'minor-site',minorId:'minor-r0-2',index:0,floor:0,x:1,y:1,dir:1};
 const map=dungeonMap(s.dungeon);let target;
 outer:for(let y=1;y<14;y++)for(let x=1;x<14;x++)for(let dir=0;dir<4;dir++){if(map[y][x]===1)continue;Object.assign(s.dungeon,{x,y,dir});target=visibleDungeonGuardian(s);if(target)break outer;}
 assert.ok(target);assert.equal(act(s,{type:'engageGuardian'},[],{noEncounters:true,noRandom:true}).mode,'battle');
});
