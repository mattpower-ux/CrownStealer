import test from 'node:test';
import assert from 'node:assert/strict';
import {atlasMarker} from '../public/game/atlas-view.js';

test('world atlas markers vary by location type and remain translucent',()=>{
 const cases=[
  [{mark:'town',name:'Mothbridge'},'town','square'],
  [{name:'Galahad Shrine'},'shrine','star'],
  [{name:'Emberjaw Cavern'},'cave','triangle'],
  [{name:'Sandbar Goblin Dig'},'dig','pick'],
  [{name:'Hollow Rune Ruins'},'ruin','broken'],
  [{name:'Moon Ward Crypt'},'crypt','coffin'],
  [{name:'Tilted Headstone Cemetery'},'cemetery','cross'],
  [{name:'Bar the Gates Castle'},'castle','castle'],
  [{name:'The Putrid Palace'},'palace','crown'],
  [{name:'Alien Teleporter'},'teleporter','ring'],
  [{name:'Alien Monument'},'monument','hex'],
  [{name:'The Drowned Conservatory'},'conservatory','leaf'],
  [{name:'Twinklestar Wizard Tower'},'tower','spire'],
  [{kind:'dungeon',name:'The Bottomless Pit'},'dungeon','diamond'],
 ];
 const appearances=new Set();
 for(const [point,type,shape] of cases){
  const marker=atlasMarker(point);
  assert.equal(marker.type,type,point.name);
  assert.equal(marker.shape,shape,point.name);
  assert.ok(marker.alpha>=.65&&marker.alpha<=.85,`${point.name} should be slightly translucent`);
  appearances.add(`${marker.shape}:${marker.color}`);
 }
 assert.ok(appearances.size>=12,'the atlas should have visibly distinct location categories');
});
