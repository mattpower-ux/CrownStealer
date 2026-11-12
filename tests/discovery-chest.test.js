import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {wildernessDiscoverySites,discoveryChestOdds} from '../public/game/wilderness-discoveries.js';
import {itemById} from '../public/game/items.js';
import {effectiveAttributes} from '../public/game/attributes.js';
function atRuins(){const s=createGame();s.region=1;const site=wildernessDiscoverySites(s).find(p=>p.type==='burned-village');assert.ok(site);s.x=site.x;s.y=site.y;return {s,id:site.id};}
function seedFor(success){for(let seed=0;seed<100000;seed++){const r=((Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;if(success?r<.01:r>.9)return seed;}throw Error('No seed');}
test('ruins lock uses Dexterity and existing thief gloves bonuses',()=>{
 const {s}=atRuins(),base=discoveryChestOdds(s).chance;
 s.bag.push('gloves-thief-3');s.equippedHands='gloves-thief-3';
 assert.equal(discoveryChestOdds(s).chance,base+30);
 s.attributes.dexterity+=5;assert.equal(discoveryChestOdds(s).chance,base+35);
});
test('buried hoard cannot be robbed before discovery and rewards exactly once after picking the lock',()=>{
 let {s,id}=atRuins();const untouched=act(s,{type:'robDiscoveryChest',id});assert.equal(untouched.gold,s.gold);
 s=act(s,{type:'searchDiscovery',id});const gold=s.gold,bag=s.bag.length;
 assert.equal(wildernessDiscoverySites(s).find(p=>p.id===id).chestRevealed,true);
 s.rng=seedFor(true);s=act(s,{type:'robDiscoveryChest',id});
 assert.ok(s.gold-gold>=100&&s.gold-gold<=300);const loot=s.bag.slice(bag);
 assert.equal(loot.filter(id=>itemById(id)?.kind==='gem').length,3);
 assert.ok(loot.includes('crown-of-charisma'));assert.equal(loot.length,4);
 const charisma=effectiveAttributes(s,itemById).charisma;
 s=act(s,{type:'equip',id:'crown-of-charisma'});
 assert.equal(effectiveAttributes(s,itemById).charisma,charisma+5);
 assert.equal(wildernessDiscoverySites(s).find(p=>p.id===id).chestOpened,true);
 const restored=loadGame(saveGame(s)),again=act(restored,{type:'robDiscoveryChest',id});
 assert.equal(again.gold,s.gold);assert.deepEqual(again.bag,s.bag);
});
test('failed lock attempts cost time, preserve unopened chest, and resolve fatal traps safely',()=>{
 let {s,id}=atRuins();s=act(s,{type:'searchDiscovery',id});s.rng=seedFor(false);s.hp=1;
 const gold=s.gold,turns=s.turns,time=s.worldTimeMs;
 s=act(s,{type:'robDiscoveryChest',id});
 assert.ok(s.turns>turns);assert.ok(s.worldTimeMs>=time+300000);
 assert.equal(wildernessDiscoverySites(s).find(p=>p.id===id).chestOpened,false);
 assert.ok(s.hp>0);assert.equal(s.flags.rescuePending,true);assert.ok(s.gold<=gold);
 assert.doesNotThrow(()=>loadGame(saveGame(s)));
 assert.ok(!s.bag.includes('crown-of-charisma'));
});
