import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,createRoyalGame,loadGame,saveGame,act} from '../public/game/engine.js';
import {CHARACTER_FACES,CHARACTER_CAMEOS,FACE_CHANGE_REFUSAL,faceMarkup,facePickerMarkup} from '../public/game/character-faces.js';
test('each face choice is retained through character creation, autosave and royal introduction',()=>{for(const id of ['him','her','shim']){assert.equal(createGame('Hero',id).gender,id);const s=createRoyalGame('Hero',id);assert.equal(s.gender,id);assert.equal(loadGame(saveGame(s)).gender,id);}});
test('older saves default to Him while invalid face choices cannot be imported',()=>{let s=createGame();delete s.gender;assert.equal(loadGame(saveGame(s)).gender,'him');s.gender='unknown';assert.throws(()=>loadGame(saveGame(s)),/gender|face/i);});
test('character creation keeps the gender and face choices without the old joke buttons',()=>{
 assert.deepEqual(CHARACTER_FACES.map(x=>x.label),['Him','Her','Other']);
 assert.doesNotMatch(facePickerMarkup(),/Change (?:Hair|Body)|data-customization-joke/i);
});
test('face changes persist without changing gender or gear, even during battle',()=>{
 const s=createGame('Hero','her','chestnut-curls');
 s.mode='battle';
 const next=act(s,{type:'changeFace',id:'silver-beard'});
 assert.equal(next.cameo,'silver-beard');
 assert.equal(next.gender,s.gender);
 assert.equal(next.equipped,s.equipped);
 assert.equal(next.turns,s.turns);
 assert.equal(loadGame(saveGame({...next,mode:'world'})).cameo,'silver-beard');
 assert.equal(act(next,{type:'changeFace',id:'invalid'}).cameo,'silver-beard');
});
test('appearance transformations refuse a face change until they expire',()=>{
 for(const key of ['pigFace','tiny','hairy','rooted','visage','wizard']){
  const s=createGame('Hero','him','chestnut-curls'),expiry=s.worldTimeMs+60000;
  if(key==='rooted')s.flags.druidRootedUntil=expiry;
  else if(key==='visage')s.flags.visage=0;
  else if(key==='wizard'){s.flags.wizardApprentice='accepted';s.flags.wizardTimers={shapeshiftUntil:Date.now()+60000};}
  else s.buffExpiry[key]=expiry;
  const action={type:'changeFace',id:'silver-beard'};
  const blocked=act(s,action);
  assert.equal(blocked.cameo,'chestnut-curls',key);
  assert.equal(blocked.log.at(-1),FACE_CHANGE_REFUSAL,key);
  delete s.flags.visage;
  delete s.flags.wizardTimers;
  s.worldTimeMs=expiry;
  assert.equal(act(s,action).cameo,'silver-beard',key);
 }
});
test('new adventurers start at the royal doorway, then resume the kneeling narration without skipping a line',()=>{let s=createRoyalGame('Newcomer','shim');assert.equal(s.flags.royalEntranceSeen,false);s=loadGame(saveGame(s));assert.equal(s.flags.royalEntranceSeen,false);s=act(s,{type:'royalEntranceEnd'});assert.equal(s.flags.royalEntranceSeen,true);assert.equal(s.flags.royalIntroLine,0);s=act(s,{type:'royalEntranceEnd'});assert.equal(s.flags.royalIntroLine,0);});

test('twelve independent cameos are selectable and persist across creation and reload',()=>{
 assert.equal(CHARACTER_CAMEOS.length,12);
 assert.equal(new Set(CHARACTER_CAMEOS.map(c=>c.id)).size,12);
 assert.equal((facePickerMarkup().match(/name="adventurer-cameo"/g)||[]).length,12);
 for(const cameo of CHARACTER_CAMEOS){
  const character=createRoyalGame('Hero','shim',cameo.id);
  const restored=loadGame(saveGame(character));
  assert.equal(restored.gender,'shim');
  assert.equal(restored.cameo,cameo.id);
  assert.match(faceMarkup(restored),/cameo-atlas/);
 }
 const bad=createGame();bad.cameo='unknown';
 assert.throws(()=>loadGame(saveGame(bad)),/cameo/i);
});
