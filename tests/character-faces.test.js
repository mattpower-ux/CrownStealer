import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,createRoyalGame,loadGame,saveGame,act} from '../public/game/engine.js';
import {CHARACTER_FACES,CHARACTER_CAMEOS,CUSTOMIZATION_JOKES,faceMarkup,facePickerMarkup} from '../public/game/character-faces.js';
test('each face choice is retained through character creation, autosave and royal introduction',()=>{for(const id of ['him','her','shim']){assert.equal(createGame('Hero',id).gender,id);const s=createRoyalGame('Hero',id);assert.equal(s.gender,id);assert.equal(loadGame(saveGame(s)).gender,id);}});
test('older saves default to Him while invalid face choices cannot be imported',()=>{let s=createGame();delete s.gender;assert.equal(loadGame(saveGame(s)).gender,'him');s.gender='unknown';assert.throws(()=>loadGame(saveGame(s)),/gender|face/i);});
test('face choices and customization jokes preserve the requested labels and wording',()=>{assert.deepEqual(CHARACTER_FACES.map(x=>x.label),['Him','Her','Other']);assert.deepEqual(CUSTOMIZATION_JOKES.map(x=>x.reply),["Good instinct, but you're stuck with that mug",'Cut it off if it bothers you.','Try lifting weights']);});
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
