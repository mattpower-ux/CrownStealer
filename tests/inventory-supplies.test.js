import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../public/game/engine.js';

globalThis.Image=class Image{};
const {inventoryView}=await import('../public/game/inventory-view.js');

test('gold stays beneath the character, including zero, without taking a bag cell',()=>{
  const state=createGame();
  for(const [gold,label] of [[0,'0'],[12345,'12,345']]){
    state.gold=gold;
    const html=inventoryView(state);
    assert.match(html,new RegExp('class="inventory-gold"[^>]*><span>Gold</span><strong>'+label+'</strong>'));
    assert.doesNotMatch(html,/data-bag-item="gold"/);
  }
});

test('tonics and meals use illustrated items while retaining quantities and actions',()=>{
  const state=createGame();state.potions=3;state.meals=2;
  for(const [id,quantity,shape,action] of [['tonic',3,'potion','heal'],['food',2,'food','eat']]){
    const html=inventoryView(state,{id,source:'bag'});
    assert.match(html,new RegExp('data-bag-item="'+id+'"[^>]*><svg[^>]*aria-label="'+shape+' illustration"'));
    assert.match(html,new RegExp('<small>×'+quantity+'</small>'));
    assert.match(html,new RegExp('&quot;type&quot;:&quot;'+action+'&quot;'));
  }
});
