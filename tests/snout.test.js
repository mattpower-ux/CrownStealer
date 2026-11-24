import assert from 'node:assert/strict';
import test from 'node:test';
import {act,createRoyalGame,loadGame,saveGame} from '../public/game/engine.js';
import {MULTIVERSE_TUBE,atMultiverseTube} from '../public/game/snout.js';

test('the ship teleporter begins a separate life and both choices lead to a terminal ending',()=>{
 const hero=createRoyalGame('Amara','other');
 hero.mode='dungeon';
 hero.dungeon={ship:true,...MULTIVERSE_TUBE};
 const restart={type:'snoutReconfigure'};
 assert.equal(act({...hero,dungeon:{...hero.dungeon,x:7,y:5}},restart).mode,'dungeon');
 const baby=act(hero,restart);
 assert.equal(baby.mode,'ending');
 assert.equal(baby.ending,'snout');
 assert.equal(baby.name,'Amara');
 assert.equal(baby.gold,0);
 assert.equal(baby.equipped,null);
 assert.deepEqual(baby.bag,[]);
 assert.ok(hero.bag.length);
 assert.equal(loadGame(saveGame(baby)).flags.snoutStage,'cradle');
 for(const choice of ['tell','pretend']){
  const result=act(baby,{type:'snoutChoose',choice});
  assert.equal(result.flags.snoutStage,choice==='tell'?'reply':'epilogue');
  const epilogue=act(result,{type:'snoutEpilogue'});
  assert.equal(epilogue.flags.snoutStage,'epilogue');
  assert.equal(act(epilogue,{type:'continue'}),epilogue);
  assert.equal(loadGame(saveGame(epilogue)).flags.snoutStage,'epilogue');
 }
});

test('the multiverse teleporter occupies the lower-right ship room',()=>{
 assert.deepEqual(MULTIVERSE_TUBE,{x:11,y:10});
 const atTube={mode:'dungeon',dungeon:{ship:true,...MULTIVERSE_TUBE}};
 assert.equal(atMultiverseTube(atTube),true);
 assert.equal(atMultiverseTube({...atTube,dungeon:{...atTube.dungeon,y:9}}),true);
 assert.equal(atMultiverseTube({...atTube,dungeon:{...atTube.dungeon,y:4}}),false);
});
