import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {battlefieldDistance} from '../public/game/dungeon-ranged.js';
import {TREASURE_ITEMS,merchantStock} from '../public/game/treasure.js';
function battle(){const s=createGame();s.mode='battle';s.returnMode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:1};s.hp=s.maxHp=500;s.bag.push('common-bow-1');s.equipped='common-bow-1';s.enemy={name:'Ogre',speciesId:'ogre',level:2,hp:1000,maxHp:1000,attack:10,armor:0,gold:1,xp:0,combatDistance:3,surpriseShotsRemaining:0,dexterity:10};return s;}
test('bows remain available in loot merchants and legacy saves',()=>{assert.ok(TREASURE_ITEMS['rare-bow-2-v3']);assert.ok(merchantStock(0).some(id=>TREASURE_ITEMS[id]?.family==='bow'));const s=battle();s.pendingLoot=['common-bow-1'];const loaded=loadGame(saveGame(s));assert.equal(loaded.equipped,'common-bow-1');assert.deepEqual(loaded.pendingLoot,s.pendingLoot);});
test('surprise gives exactly two genuine bow shots without closure, then melee enemy approaches one tile each round',()=>{let s=battle();s.enemy.surpriseShotsRemaining=2;for(let i=0;i<2;i++){s=act(s,{type:'attack'});assert.equal(s.enemy.combatDistance,3);assert.equal(s.enemy.surpriseShotsRemaining,1-i);assert.equal(s.hp,500);}s=act(s,{type:'attack'});assert.equal(s.enemy.combatDistance,2);assert.equal(s.hp,500);s=act(s,{type:'advanceCombat'});assert.equal(s.enemy.combatDistance,1);assert.equal(s.hp,500);});
test('invalid melee, empty wand and same-weapon switch do not cost rounds or surprise shots',()=>{const s=battle();s.enemy.surpriseShotsRemaining=2;s.equipped='road-sword';for(const a of [{type:'attack'},{type:'useItem',id:'wand-fireball-1'},{type:'switchCombatWeapon',id:'road-sword'}]){const after=act(s,a);assert.equal(after.enemy.combatDistance,3);assert.equal(after.enemy.hp,1000);assert.equal(after.enemy.surpriseShotsRemaining,2);assert.equal(after.rng,s.rng);}});
test('switching to melee costs a round and melee only strikes after adjacency',()=>{const s=battle(),after=act(s,{type:'switchCombatWeapon',id:'road-sword'});assert.equal(after.equipped,'road-sword');assert.equal(after.enemy.combatDistance,2);assert.equal(after.enemy.hp,1000);let next=act(after,{type:'advanceCombat'});assert.equal(next.enemy.combatDistance,1);next=act(next,{type:'attack'});assert.ok(next.enemy.hp<1000);});
test('initiative can let a distant caster strike first and kill before the player fires',()=>{const s=battle();s.hp=1;s.enemy.kind='caster';s.enemy.dexterity=50;s.enemy.attack=100;const events=[];const after=act(s,{type:'attack'},events);assert.equal(events.find(e=>e.kind==='initiative').target,'enemy');assert.ok(events.some(e=>e.kind==='defeat'));assert.equal(events.some(e=>e.target==='enemy'&&['hit','miss','magic'].includes(e.kind)),false);});
test('distance state rejects malformed saves and legacy adjacent encounters remain usable',()=>{let s=battle();s.enemy.combatDistance=9;assert.throws(()=>loadGame(saveGame(s)),/combat|distance/i);s=battle();delete s.enemy.combatDistance;delete s.enemy.surpriseShotsRemaining;assert.equal(battlefieldDistance(s),1);assert.doesNotThrow(()=>act(s,{type:'guard'}));});
import {prepareWands} from '../public/game/spell-items.js';
import {dungeonFloors} from '../public/game/dungeon-depths.js';
test('normal dungeon bosses and bespoke tower/castle encounters initialize and save range',()=>{
 for(const dungeon of [{index:0,floor:dungeonFloors({index:0})-1,x:13,y:13,dir:0},{site:'percivals-lament',index:2,floor:2,x:13,y:13,dir:0},{site:'twinklestar-tower',index:6,floor:8,x:13,y:13,dir:0}]){
  const s=createGame();s.mode='dungeon';s.dungeon=dungeon;if(dungeon.site==='percivals-lament')s.region=1;if(dungeon.site==='twinklestar-tower'){s.region=3;s.exploration={area:'wild-10',artifacts:[],home:{region:3,x:64,y:88}};}const next=act(s,{type:'descend'},[],{noRandom:true});assert.equal(next.mode,'battle');assert.ok(next.enemy.combatDistance>=2&&next.enemy.combatDistance<=4);const loaded=loadGame(saveGame(next));assert.equal(loaded.enemy.combatDistance,next.enemy.combatDistance);assert.equal(loaded.enemy.surpriseShotsRemaining,next.enemy.surpriseShotsRemaining);
 }
});
test('damaging wand shots use surprise while control wands and scrolls spend normal rounds',()=>{
 for(const [id,free,distance] of [['wand-fireball-1',true,3],['wand-immobilize-1',false,3],['scroll-magic-missile',false,2]]){
  let s=battle();s.level=20;s.enemy.surpriseShotsRemaining=2;s.bag.push(id);prepareWands(s);const owned=s.bag.find(x=>x===id||x.startsWith(id+'~'));const next=act(s,{type:'useItem',id:owned});assert.equal(next.enemy.surpriseShotsRemaining,free?1:2,id);assert.equal(next.enemy.combatDistance,distance,id);
 }
});
test('frozen enemies spend their effect round without advancing and ranged enemies fire across the gap',()=>{
 let s=battle();s.enemy.frozen=2;s=act(s,{type:'guard'});assert.equal(s.enemy.frozen,1);assert.equal(s.enemy.combatDistance,3);assert.equal(s.hp,500);
 s=battle();s.enemy.ranged=true;s.enemy.attack=50;const events=[];const next=act(s,{type:'guard'},events);assert.equal(next.enemy.combatDistance,2);assert.ok(events.some(e=>e.target==='hero'&&e.projectile==='arrow'));assert.ok(next.hp<500);
});
test('stun consumes switching round without changing weapons; incompatible gear revokes wizard powers',()=>{
 let s=battle();s.spellEffects={stunnedTurns:1};let next=act(s,{type:'switchCombatWeapon',id:'road-sword'});assert.equal(next.equipped,'common-bow-1');assert.equal(next.enemy.combatDistance,2);
 s=battle();s.flags.wizardApprentice='accepted';s.equipped=null;s.equippedArmor=null;next=act(s,{type:'switchCombatWeapon',id:'road-sword'});assert.equal(next.equipped,'road-sword');assert.equal(next.flags.wizardApprentice,'fallen');assert.ok(next.flags.wizardForsakenPending);
});
