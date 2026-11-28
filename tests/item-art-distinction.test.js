import test from 'node:test';
import assert from 'node:assert/strict';
import {itemArt} from '../public/game/items.js';

test('scrolls, potions, and meals have recognizable item-specific artwork',()=>{
 const scrolls=[
  {id:'scroll-return',name:'Scroll of Return',shape:'scroll'},
  {id:'sage-intelligence-scroll',name:'Clarissa’s Scroll of Intelligence',shape:'scroll'},
  {id:'fireball-scroll',name:'Scroll of Fireball',shape:'scroll'},
 ];
 const potions=[
  {id:'potion-healing',name:'Healing Potion',shape:'potion'},
  {id:'potion-mana',name:'Mana Potion',shape:'potion'},
  {id:'potion-venom',name:'Venom Potion',shape:'potion'},
 ];
 for(const group of [scrolls,potions]){
  const art=group.map(itemArt);
  assert.equal(new Set(art).size,group.length);
  for(const image of art)assert.match(image,/<svg class="item-art"/);
 }
 assert.notEqual(itemArt({id:'meal-bread',name:'Bread meal',shape:'food'}),itemArt({id:'meal-meat',name:'Meat meal',shape:'food'}));
});
