import test from 'node:test';
import assert from 'node:assert/strict';
import {sortEntriesByPrice} from '../public/game/merchant-view.js';

test('merchant columns sort displayed prices from least to most expensive',()=>{
 const entries=[
  {item:{name:'Costly'},price:250},
  {item:{name:'Affordable'},price:10},
  {item:{name:'Middle'},price:99},
  {item:{name:'Owned'},price:null},
 ];
 assert.deepEqual(sortEntriesByPrice(entries).map(entry=>entry.item.name),['Affordable','Middle','Costly','Owned']);
 assert.deepEqual(entries.map(entry=>entry.item.name),['Costly','Affordable','Middle','Owned']);
});

test('equal-price merchant entries use their names for a stable readable order',()=>{
 const entries=[{item:{name:'Spear'},price:50},{item:{name:'Axe'},price:50}];
 assert.deepEqual(sortEntriesByPrice(entries).map(entry=>entry.item.name),['Axe','Spear']);
});
