import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame,dungeonMap,minorSiteList} from '../public/game/engine.js';
import {revealSecretRoom,secretRoomKey} from '../public/game/secret-alcoves.js';
import {redGlobeAction,fulfillRedGlobe,nearRedGlobe,isMossyGlobeShrine,RED_GLOBE_SHRINE_ID} from '../public/game/red-globe.js';
import {effectiveAttributes} from '../public/game/attributes.js';
function shrine(){const s=createGame();s.flags.royalQuest='banished';const door=minorSiteList(s).find(p=>p.name==='Mossy Shrine');s.x=door.x;s.y=door.y;s.mode='dungeon';s.dungeon={site:'minor-site',minorId:door.id,index:0,floor:0,x:1,y:8,dir:1};revealSecretRoom(s,{x:2,y:8});return s;}
test('Mossy hidden chamber survives a save and contains a reachable globe',()=>{let s=shrine();assert.equal(dungeonMap(s.dungeon)[8][1],0);s=loadGame(saveGame(s));assert.ok(nearRedGlobe(s));s=act(s,{type:'touchRedGlobe'});assert.equal(s.flags.redGlobeSworn,true);});
test('the hidden red globe belongs only to the original Mossy Shrine',()=>{
 assert.equal(RED_GLOBE_SHRINE_ID,'minor-r0-10');
 assert.equal(isMossyGlobeShrine({site:'minor-site',minorId:RED_GLOBE_SHRINE_ID}),true);
 for(const id of ['minor-r1-6','minor-w4-11','minor-w8-22'])assert.equal(isMossyGlobeShrine({site:'minor-site',minorId:id}),false);
});
test('guard bargain grants exactly ten strength once and purification removes it',()=>{const before=shrine();before.flags.redGlobeSworn=true;let s=structuredClone(before);s.mode='battle';s.enemy={guard:true};fulfillRedGlobe(before,s,{type:'attackCastleGuard'},[],()=>{});assert.equal(effectiveAttributes(s).strength,effectiveAttributes(before).strength+10);assert.equal(s.alignment,-100);assert.equal(s.alignmentPoints,0);const next=structuredClone(s);fulfillRedGlobe(s,next,{type:'attack'},[{target:'enemy',kind:'hit'}],()=>{});assert.equal(effectiveAttributes(next).strength,effectiveAttributes(s).strength);s.mode='world';s.region=3;s.x=64;s.y=8;s.dungeon=null;s.enemy=null;redGlobeAction(s,{type:'purifyRedGlobe'},()=>{});assert.equal(s.flags.redGlobeCurse,undefined);assert.equal(s.alignmentPoints,500);assert.equal(s.flags.evilAlignmentLocked,undefined);assert.equal(effectiveAttributes(s).strength,effectiveAttributes(before).strength);});
test('cursed merchants refuse transactions',()=>{let s=createGame();s.flags.redGlobeSworn=true;s.flags.redGlobeCurse=true;const gold=s.gold;s=act(s,{type:'buy'});assert.equal(s.gold,gold);assert.match(s.log.at(-1),/shun/);});
