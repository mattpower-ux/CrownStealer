import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,dungeonMap,saveGame,loadGame,minorSiteList} from '../public/game/engine.js';
import {cemeteryTorches,nearestUnlitTorch,cemeteryLightAt,hasMiningLight} from '../public/game/cemetery-light.js';
const setup=()=>{const s=createGame(),site=minorSiteList(s).find(p=>p.minorKind==='cemetery');Object.assign(s,{x:site.x,y:site.y});return act(s,{type:'enter'});};
test('cemeteries begin black and lighting reaches only the nearest torch, saved per fixture',()=>{
 let s=setup();const map=dungeonMap(s.dungeon),torches=cemeteryTorches(s.dungeon,map);
 assert.ok(torches.length>2);assert.equal(cemeteryLightAt(s,map,1.5,1.5),0);
 const torch=nearestUnlitTorch(s,map);assert.ok(torch);
 s=act(s,{type:'lightCemeteryTorch'});
 assert.deepEqual(s.flags.cemeteryTorches,[torch.id]);
 assert.ok(cemeteryLightAt(s,map,1.5,1.5)>.1);
 const far=torches.at(-1);assert.equal(cemeteryLightAt(s,map,far.x+.5,far.y+.5),0);
 s=loadGame(saveGame(s));assert.deepEqual(s.flags.cemeteryTorches,[torch.id]);
 const again=act(s,{type:'lightCemeteryTorch'});assert.equal(again.flags.cemeteryTorches.length,1);
 Object.assign(s.dungeon,{x:far.x,y:far.y});
 s=act(s,{type:'lightCemeteryTorch'});assert.deepEqual(s.flags.cemeteryTorches,[torch.id,far.id]);
 assert.ok(cemeteryLightAt(s,map,far.x+.5,far.y+.5)>.5);
});
test('malformed saved torch lists are rejected',()=>{
 for(const value of [true,['not-a-torch'],[null]]){const s=setup();s.flags.cemeteryTorches=value;assert.throws(()=>loadGame(saveGame(s)),/cemetery torches/);}
});
test('only an equipped mining cap supplies personal light; other dungeons ignore torch commands',()=>{
 let s=setup();s.bag.push('miners-cap');assert.equal(hasMiningLight(s),false);
 s.equippedHead='miners-cap';assert.equal(hasMiningLight(s),true);
 assert.ok(cemeteryLightAt(s,dungeonMap(s.dungeon),1.5,1.5)>.5);
 assert.equal(nearestUnlitTorch(s,dungeonMap(s.dungeon)),null);
 const world=act(createGame(),{type:'lightCemeteryTorch'});assert.equal(world.flags.cemeteryTorches,undefined);
});
