import assert from 'node:assert/strict';
import test from 'node:test';
import {act,createGame,loadGame,saveGame,worldTile} from '../public/game/engine.js';
import {areaTile} from '../public/game/exploration.js';
import {CLIMBING_GEAR,climbingGearDrop} from '../public/game/exploration-loot.js';
import {itemById} from '../public/game/items.js';

test('climbing gear grants mountain travel only while equipped in the weapon slot',()=>{
 for(const area of [null,'wild-1']){
  const s=createGame();
  if(area)s.exploration={area,artifacts:[]};
  const tile=area?(x,y)=>areaTile(s,x,y):(x,y)=>worldTile(s.region,x,y);
  let ledge;
  for(let y=12;y<80&&!ledge;y++)for(let x=12;x<100&&!ledge;x++){
   if(tile(x,y)==='grass'&&tile(x+1,y)==='mountain')ledge={x,y};
  }
  assert.ok(ledge);
  Object.assign(s,ledge);
  s.bag.push(CLIMBING_GEAR);
  const move={type:'move',dx:1,dy:0},options={noRandom:true};
  const blocked=act(s,move,[],options);
  assert.equal(blocked.x,s.x);
  assert.equal(blocked.log.at(-1),'Tough terrain. Try riding a goat, unless you have a rope and hooks?');
  const equipped=loadGame(saveGame(act(s,{type:'equip',id:CLIMBING_GEAR})));
  assert.equal(equipped.equipped,CLIMBING_GEAR);
  assert.equal(act(equipped,move,[],options).x,s.x+1);
  assert.equal(act(act(equipped,{type:'equip',id:'road-sword'}),move,[],options).x,s.x);
 }
});

test('climbing gear is a rare find for level five or higher characters and enemies',()=>{
 assert.equal(itemById(CLIMBING_GEAR).rarity,'rare');
 assert.equal(climbingGearDrop(5,5,.02),CLIMBING_GEAR);
 assert.equal(climbingGearDrop(4,5,.02),null);
 assert.equal(climbingGearDrop(5,4,.02),null);
 assert.equal(climbingGearDrop(5,5,.04),null);
});
