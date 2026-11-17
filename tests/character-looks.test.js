import test from 'node:test';import assert from 'node:assert/strict';
import {CHARACTER_LOOKS,characterLook} from '../public/game/character-looks.js';
import {createRoyalGame,saveGame,loadGame,act} from '../public/game/engine.js';
import {facePickerMarkup} from '../public/game/character-faces.js';
test('creation offers ten full-body looks with five men and five women',()=>{assert.equal(CHARACTER_LOOKS.length,10);assert.equal(CHARACTER_LOOKS.filter(x=>x.sex==='male').length,5);assert.equal(CHARACTER_LOOKS.filter(x=>x.sex==='female').length,5);const markup=facePickerMarkup();assert.match(markup,/<summary[^>]*>Choose Your Look/);assert.equal((markup.match(/name="adventurer-cameo"/g)||[]).length,10);assert.match(markup,/look-body/);});
test('chosen full body survives saving and face changes keep that body',()=>{for(const look of CHARACTER_LOOKS){const s=createRoyalGame('Test','shim',look.id);assert.equal(s.look,look.id);assert.equal(loadGame(saveGame(s)).look,look.id);const next=act(s,{type:'changeFace',id:'silver-beard'});assert.equal(next.look,look.id);assert.equal(next.cameo,'silver-beard');}assert.equal(characterLook('nonsense'),undefined);});
