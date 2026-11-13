import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {ROYAL_DUNGEON_NPCS,royalDungeonVictory,royalDungeonActions,royalDungeonAt,royalDungeonCellAt} from '../public/game/royal-dungeon.js';
import {itemById,weaponMagicDamage} from '../public/game/items.js';
function inside(){const s=createGame();s.mode=s.returnMode='dungeon';s.location='bellwether';s.dungeon={site:'royal-dungeon',index:0,floor:0,x:7,y:6,dir:3,cellsOpen:false};return s;}
test('each Royal Dungeon staff member drops distinct functional loot only once',()=>{
 let s=inside();const before=s.bag.length;
 for(const npc of ROYAL_DUNGEON_NPCS)assert.equal(royalDungeonVictory(s,{royalDungeonNpc:npc.id},()=>{}),true);
 const loot=s.bag.slice(before);assert.equal(loot.filter(id=>itemById(id)?.kind==='gem').length,4);
 for(const id of ['weapon-poison-5','whip-of-command','mace-of-pain'])assert.ok(loot.includes(id));
 assert.equal(s.pendingLoot.length,8);s=loadGame(saveGame(s));const count=s.bag.length;
 for(const npc of ROYAL_DUNGEON_NPCS)royalDungeonVictory(s,{royalDungeonNpc:npc.id},()=>{});
 assert.equal(s.bag.length,count);assert.equal(ROYAL_DUNGEON_NPCS.length,2);
 s=act(s,{type:'equip',id:'whip-of-command'});assert.equal(s.equipped,'whip-of-command');assert.ok(itemById(s.equipped).freezeChance>0);
 s=act(s,{type:'equip',id:'mace-of-pain'});assert.equal(s.equipped,'mace-of-pain');assert.ok(weaponMagicDamage(itemById(s.equipped),0)>0);
 s=act(s,{type:'useItem',id:'weapon-poison-5'});assert.equal(s.weaponCoating.rounds,5);assert.doesNotThrow(()=>loadGame(saveGame(s)));
});
test('facing nearby cell bars exposes prisoner rescue without the exact old square',()=>{
 let s=inside();s.dungeon.x=6;s.dungeon.y=5;s.dungeon.dir=3;
 assert.equal(royalDungeonCellAt(s)?.id,'royal-west-cell');assert.equal(royalDungeonAt(s)?.kind,'cell');assert.ok(royalDungeonActions(s).some(a=>a.action.type==='royalDungeonFree'));
 s=act(s,{type:'royalDungeonFree',id:'royal-west-cell'});assert.equal(s.mode,'battle');assert.doesNotThrow(()=>loadGame(saveGame(s)));
 for(const npc of ROYAL_DUNGEON_NPCS)royalDungeonVictory(s,{royalDungeonNpc:npc.id},()=>{});
 s=act(s,{type:'royalDungeonFree',id:'royal-west-cell'});assert.equal(s.flags.royalDungeonFreed,true);assert.equal(s.bag.filter(id=>id==='necklace-bravery').length,1);
 s=act(loadGame(saveGame(s)),{type:'royalDungeonFree',id:'royal-west-cell'});assert.equal(s.bag.filter(id=>id==='necklace-bravery').length,1);
 const away=inside();away.dungeon.x=7;away.dungeon.y=1;assert.equal(royalDungeonCellAt(away),null);
});

