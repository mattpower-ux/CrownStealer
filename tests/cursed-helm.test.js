import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {itemById} from '../public/game/items.js';
import {townPlaces} from '../public/game/town.js';

function cursed(){let s=createGame();s.level=5;s.bag.push('helm-thinkiness','rare-helmet-1');return act(s,{type:'equip',id:'helm-thinkiness'});}
test('Thinkiness lowers Intelligence by two and survives attempted removal, replacement and saves',()=>{
 let s=cursed();assert.equal(effectiveAttributes(s,itemById).intelligence,8);
 s=act(s,{type:'unequip',slot:'head'});assert.equal(s.equippedHead,'helm-thinkiness');
 s=act(s,{type:'equip',id:'rare-helmet-1'});assert.equal(s.equippedHead,'helm-thinkiness');
 s=loadGame(saveGame(s));assert.equal(effectiveAttributes(s,itemById).intelligence,8);
 assert.match(s.log.join(' '),/Sage of Wonk/);
});
test('only an actual visit to the Sage of Wonk removes the cursed helm for free',()=>{
 let s=cursed();assert.equal(act(s,{type:'sageRemoveHelm'}).equippedHead,'helm-thinkiness');
 s.mode='town';s.location='mothbridge';s.gold=123;s.townPosition={x:6,y:11};
 assert.equal(act(s,{type:'sageRemoveHelm'}).equippedHead,'helm-thinkiness');
 const sage=townPlaces(s).find(p=>p.id==='fortune');s.townPosition={x:sage.x,y:sage.y};
 s=act(s,{type:'sageRemoveHelm'});assert.equal(s.equippedHead,null);assert.equal(s.gold,123);assert.ok(s.bag.includes('helm-thinkiness'));
 assert.equal(effectiveAttributes(s,itemById).intelligence,10);
 s=act(s,{type:'equip',id:'helm-thinkiness'});assert.equal(act(s,{type:'unequip',slot:'head'}).equippedHead,'helm-thinkiness');
});
test('Sage offers an optional permanent Intelligence point for 5000 gold after removal',()=>{
 let s=cursed();s.mode='town';s.location='mothbridge';s.gold=6000;
 const sage=townPlaces(s).find(p=>p.id==='fortune');s.townPosition={x:sage.x,y:sage.y};
 s=act(s,{type:'sageBuyIntelligence'});assert.equal(s.gold,6000);assert.equal(s.attributes.intelligence,10);
 s=act(s,{type:'sageRemoveHelm'});assert.equal(s.flags.sageWonkOffer,true);assert.equal(s.gold,6000);
 s=loadGame(saveGame(s));s=act(s,{type:'sageBuyIntelligence'});assert.equal(s.gold,1000);assert.equal(s.attributes.intelligence,11);assert.ok(!s.flags.sageWonkOffer);
 s=act(s,{type:'sageBuyIntelligence'});assert.equal(s.attributes.intelligence,11);assert.equal(loadGame(saveGame(s)).attributes.intelligence,11);
});
test('Sage never charges an unaffordable or capped lesson and cannot sell remotely',()=>{
 let s=createGame();s.flags.sageWonkOffer=true;s.gold=5000;
 assert.equal(act(s,{type:'sageBuyIntelligence'}).gold,5000);
 s.mode='town';s.location='mothbridge';const sage=townPlaces(s).find(p=>p.id==='fortune');s.townPosition={x:sage.x,y:sage.y};s.gold=4999;
 s=act(s,{type:'sageBuyIntelligence'});assert.equal(s.gold,4999);assert.equal(s.attributes.intelligence,10);assert.equal(s.flags.sageWonkOffer,true);
 s.gold=5000;s.attributes.intelligence=50;s=act(s,{type:'sageBuyIntelligence'});assert.equal(s.gold,5000);assert.equal(s.attributes.intelligence,50);
 s.attributes.intelligence=49;s=act(s,{type:'sageBuyIntelligence'});assert.equal(s.gold,0);assert.equal(s.attributes.intelligence,50);
});
