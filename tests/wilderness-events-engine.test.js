import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame,dungeonMap} from '../public/game/engine.js';
import {enterRoadsideCrypt} from '../public/game/roadside-crypt.js';
import {dungeonChests} from '../public/game/treasure.js';
import {waterAccess} from '../public/game/nautical.js';

test('Bawb sailboat crosses ordinary water without unlocking the Pump lake',()=>{let s=createGame();s.region=2;s.bag.push('shrinkable-sailboat');s=act(s,{type:'useItem',id:'shrinkable-sailboat'});assert.equal(waterAccess(s,112,20),true);assert.equal(waterAccess(s,92,64),false);s.bag.push('boat-amulet');s=act(s,{type:'useItem',id:'boat-amulet'});assert.equal(waterAccess(s,92,64),true);});
test('successful magical escape frees impalement while ordinary actions leave it pending',()=>{let s=createGame();s.flags.impaledMoves=10;s=act(s,{type:'useItem',id:'missing-item'});assert.equal(s.flags.impaledMoves,10);s=act(s,{type:'useItem',id:'scroll-return'});assert.equal(s.mode,'town');assert.equal(s.flags.impaledMoves,undefined);});
test('saved Bawb offer buys a usable boat through normal actions',()=>{let s=createGame();s.gold=700;s.flags.wildernessEvent={kind:'bawb'};s=act(loadGame(saveGame(s)),{type:'wildernessChoice',choice:'buy'});assert.equal(s.gold,0);s=act(s,{type:'useItem',id:'shrinkable-sailboat'});assert.equal(s.flags.sailboatReady,true);assert.ok(loadGame(saveGame(s)).bag.includes('shrinkable-sailboat'));});
test('crypt chest refuses loot until its undead guardian is defeated and saves through combat',()=>{let s=createGame();enterRoadsideCrypt(s);s=loadGame(saveGame(s));const chest=dungeonChests(s,dungeonMap(s.dungeon))[0];s.dungeon.x=chest.x;s.dungeon.y=chest.y;s=act(s,{type:'openChest'});assert.equal(s.mode,'battle');assert.ok(s.enemy.cryptGuardian);assert.ok(!s.openedChests.includes(chest.id));s=loadGame(saveGame(s));s.enemy.combatDistance=1;s.enemy.hp=1;s.enemy.attack=0;s.rng=187441;s=act(s,{type:'attack'});s=act(s,{type:'openChest'});assert.ok(s.openedChests.includes(chest.id));assert.ok(loadGame(saveGame(s)).bag.includes(chest.item));});
test('impaled saved adventurer cannot move until ten struggles have completed',()=>{let s=createGame();s.flags.impaledMoves=10;s.hp=s.maxHp=1000;const x=s.x;for(let i=0;i<10;i++){s=act(loadGame(saveGame(s)),{type:'move',dx:1,dy:0});assert.equal(s.x,x);}assert.equal(s.flags.impaledMoves,undefined);});
test('normal movement reaches every rare event in main and branch wilderness',()=>{
 for(const area of [null,'wild-0'])for(const [kind,seed] of Object.entries({nail:2070,hoard:2103,hole:2136,bawb:2147,branch:area?4727:2158})){
  const s=createGame();s.rng=seed;s.turns=10;s.x=64;s.y=60;if(area)s.exploration={area,artifacts:[],home:{region:0,x:64,y:4}};
  const next=act(s,{type:'move',dx:0,dy:1});
  if(kind==='hole')assert.equal(next.dungeon.site,'roadside-crypt');
  else if(kind==='branch')assert.equal(next.flags.impaledMoves,10);
  else if(kind==='nail')assert.ok(next.hp<s.hp&&next.hp>=s.hp-10);
  else assert.equal(next.flags.wildernessEvent.kind,kind);
  assert.doesNotThrow(()=>loadGame(saveGame(next)));
 }
});
