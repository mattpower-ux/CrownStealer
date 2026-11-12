import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame} from '../public/game/engine.js';
import {isGearUpgrade} from '../public/game/hero-stats.js';

globalThis.Image=class Image{};
const {inventoryView}=await import('../public/game/inventory-view.js');

test('weapon upgrades account for damage, accuracy and enchantments',()=>{
  const state=createGame();
  state.equipped='common-sword-1';
  assert.equal(isGearUpgrade(state,'common-sword-1-v2'),true);
  assert.equal(isGearUpgrade(state,'common-sword-1-v1'),false);
  assert.equal(isGearUpgrade(state,'rare-sword-1'),true);
  assert.equal(isGearUpgrade(state,'common-sword-1'),false);
  assert.equal(isGearUpgrade(state,'rusty-sword'),false);
  assert.equal(isGearUpgrade({...state,equipped:null},'rusty-sword'),true);
});

test('armor upgrades compare actual protection and skip other gear',()=>{
  const state=createGame();
  state.equippedArmor='common-armor-1';
  assert.equal(isGearUpgrade(state,'rare-armor-1'),true);
  assert.equal(isGearUpgrade(state,'common-armor-1-v1'),false);
  assert.equal(isGearUpgrade(state,'travel-armor'),false);
  assert.equal(isGearUpgrade({...state,equippedArmor:null},'travel-armor'),true);
  assert.equal(isGearUpgrade({...state,equippedArmor:'travel-armor',armor:10},'rare-armor-1'),false);
  assert.equal(isGearUpgrade(state,'helm-thinkiness'),false);
  assert.equal(isGearUpgrade(state,'ring-strength-5'),false);
});

test('pack highlighting and its accessible label update after equipment changes',()=>{
  const state=createGame();
  state.bag.push('common-sword-1-v2','rare-armor-1','rusty-sword','helm-thinkiness');
  const button=(html,id)=>html.match(new RegExp('<button[^>]+data-bag-item="'+id+'"[^>]*>'))?.[0];
  const before=inventoryView(state);
  assert.match(before, /data-bag-item="common-sword-1-v2"[^>]*>[\s\S]*?class="upgrade-star" aria-hidden="true"/);
  for(const id of ['common-sword-1-v2','rare-armor-1']){
    assert.match(button(before,id),/class="bag-cell gear-upgrade"/);
    assert.match(button(before,id),/aria-label="[^"]*Better than equipped/);
    assert.match(button(before,id),/title="[^"]*Better than equipped/);
  }
  for(const id of ['rusty-sword','helm-thinkiness'])assert.doesNotMatch(button(before,id),/gear-upgrade|Better than equipped/);
  const sword=act(state,{type:'equip',id:'common-sword-1-v2'});
  const upgraded=act(sword,{type:'equip',id:'rare-armor-1'});
  const after=inventoryView(upgraded);
  assert.equal(button(after,'common-sword-1-v2'),undefined);
  assert.equal(button(after,'rare-armor-1'),undefined);
  assert.doesNotMatch(after, /class="upgrade-star"/);
  assert.doesNotMatch(button(after,'road-sword'),/gear-upgrade|Better than equipped/);
  assert.doesNotMatch(button(after,'travel-armor'),/gear-upgrade|Better than equipped/);
});
