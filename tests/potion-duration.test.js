import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame,dungeonNavigation} from '../public/game/engine.js';
import {TREASURE_ITEMS} from '../public/game/treasure.js';

test('Grand Invisibility lasts thirty moves rather than elapsed time',()=>{
 let s=createGame();s.bag.push('common-invisibility-v4');
 s=act(s,{type:'useItem',id:'common-invisibility-v4'});
 assert.equal(s.spellEffects.invisibleMoves,30);
 s=act(loadGame(saveGame(s)),{type:'clockTick',elapsedMs:60000});
 assert.equal(s.spellEffects.invisibleMoves,30);
 s=act(s,{type:'turn',delta:1});assert.equal(s.spellEffects.invisibleMoves,30);
 Object.assign(s,{mode:'dungeon',returnMode:'dungeon',dungeon:{index:0,floor:0,x:1,y:1,dir:1}});
 while(!dungeonNavigation(s.dungeon).forward)s.dungeon.dir=(s.dungeon.dir+1)%4;
 const next=act(s,{type:'forward'},[],{noRandom:true});
 assert.equal(next.spellEffects.invisibleMoves,29);
 assert.match(TREASURE_ITEMS['common-invisibility-v4'].description,/30 moves/);
});
test('movement invisibility is consumed by combat and rejects oversized saved effects',()=>{
 let s=createGame();s.spellEffects={invisibleMoves:30};
 s.mode='battle';s.returnMode='world';s.enemy={name:'Target',speciesId:'target',level:1,hp:1000,maxHp:1000,attack:1,armor:0,gold:1};
 s=act(s,{type:'guard'});assert.equal(s.spellEffects.invisibleMoves,29);
 s.spellEffects.invisibleMoves=31;assert.throws(()=>loadGame(saveGame(s)),/spell effects/);
});
test('Concentrated Legendary Invisibility retains its explicit ten game minute duration',()=>{
 let s=createGame();s.bag.push('legendary-invisibility-v1');
 s=act(s,{type:'useItem',id:'legendary-invisibility-v1'});
 assert.equal(s.buffExpiry.invisibility-s.worldTimeMs,600000);
 assert.match(TREASURE_ITEMS['legendary-invisibility-v1'].description,/10 game minutes/);
 s=act(s,{type:'clockTick',elapsedMs:12500});assert.equal(s.buffs.invisibility,0);
});
test('strength potions expire after moves and combat actions, preserving the damage bonus until then',()=>{
 let s=createGame();s.bag.push('common-strength');s=act(s,{type:'useItem',id:'common-strength'});
 assert.equal(s.flags.strengthMoves,10);assert.ok(s.buffs.strengthPower>0);
 s=act(loadGame(saveGame(s)),{type:'clockTick',elapsedMs:60000});
 assert.equal(s.flags.strengthMoves,10);assert.ok(s.buffs.strength>0);
 s.mode='battle';s.returnMode='world';s.enemy={name:'Target',speciesId:'target',level:1,hp:1000,maxHp:1000,attack:0,armor:0,gold:1};
 for(let i=0;i<10;i++)s=act(s,{type:'guard'});
 assert.equal(s.flags.strengthMoves,0);assert.equal(s.buffs.strength,0);
 assert.match(TREASURE_ITEMS['common-strength-v4'].description,/30 moves/);
});
