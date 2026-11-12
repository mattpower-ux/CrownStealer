import test from 'node:test';
import assert from 'node:assert/strict';
import {TREASURE_ITEMS,attributeLootBonus,randomAttributeLoot,merchantStock} from '../public/game/treasure.js';
import {act,createGame,loadGame,saveGame} from '../public/game/engine.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {itemById} from '../public/game/items.js';

test('rare attribute loot begins at level five and scales by defeated NPC level to plus five',()=>{
 assert.equal(randomAttributeLoot(4,50,0),null);
 assert.equal(randomAttributeLoot(50,4,0),null);
 for(const [level,bonus] of [[5,1],[9,1],[10,2],[15,3],[20,4],[25,5],[100,5]]){
  const id=randomAttributeLoot(5,level,0),item=TREASURE_ITEMS[id];
  assert.equal(item.rarity,'rare');assert.equal(item.attributeBonuses.wisdom,bonus);
 }
 assert.equal(randomAttributeLoot(50,50,.99),null);
 assert.ok(attributeLootBonus('epic',50)>5);
 assert.ok(attributeLootBonus('legendary',50)>5);
 for(let region=0;region<4;region++)assert.ok(!merchantStock(region,'',1).some(id=>id.startsWith('ring-wisdom-')));
});

test('Ring of Wisdom equips in either ring slot and preserves its rolled bonus across saves',()=>{
 let s=createGame();s.level=5;s.bag.push('ring-wisdom-1','ring-wisdom-5');
 s=act(s,{type:'equip',id:'ring-wisdom-1',slot:'ring'});
 s=act(s,{type:'equip',id:'ring-wisdom-5',slot:'ring2'});
 s=loadGame(saveGame(s));assert.equal(effectiveAttributes(s,itemById).wisdom,16);
});

test('ordinary NPC victories can award the scaled wisdom ring',()=>{
 let reward;
 for(let seed=1;seed<=200&&!reward;seed++){
  const s=createGame();s.level=5;s.rng=seed;s.mode='battle';s.returnMode='world';
  s.enemy={name:'Treasure bearer',speciesId:'bandit',level:20,hp:1,maxHp:1,attack:0,armor:0,gold:1,xp:0};
  const next=act(s,{type:'attack'});reward=next.pendingLoot.find(id=>id.startsWith('ring-wisdom-'));
 }
 assert.equal(reward,'ring-wisdom-4');
});
