import test from 'node:test';import assert from 'node:assert/strict';
import {TREASURE_ITEMS,rarityFor,dungeonChests,lootLevel} from '../public/game/treasure.js';
import {createRoyalGame,createGame,act,saveGame,loadGame,dungeonMap} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {merchantFor} from '../public/game/merchant-catalog.js';
import {stockForMerchant} from '../public/game/merchant-inventory.js';
import {atTownPlace} from './town-fixture.js';
const dungeon=(index=0,floor=0)=>({...createGame('Chest seeker'),region:Math.floor(index/2),mode:'dungeon',dungeon:{index,floor,x:1,y:1,dir:2}});
test('exact 5/15/20/60 percent mutually exclusive chest rarity boundaries',()=>{const counts={};for(let n=0;n<10000;n++){const k=rarityFor(n/10000);counts[k]=(counts[k]||0)+1;}assert.deepEqual(counts,{legendary:500,epic:1500,rare:2000,common:6000});});
test('treasure includes weapon and jewelry variants alongside consumables',()=>{const items=Object.values(TREASURE_ITEMS).filter(i=>!i.encounterOnly&&!i.alien&&!i.lowLoot&&i.kind!=='gem'&&i.kind!=='quest'&&!i.healsToHalf);assert.ok(items.length>=720);for(const [kind,count] of Object.entries({weapon:248,potion:117,wand:84,scroll:24}))assert.ok(items.filter(i=>i.kind===kind).length>=count,kind);const families=new Set(items.filter(i=>i.kind==='weapon').map(i=>i.family));for(const family of ['mace','sword','spear','axe'])assert.ok(families.has(family),family);});
test('every dungeon floor has 2–5 unique reachable chests, with stable depth-scaled loot',()=>{for(let index=0;index<8;index++)for(let floor=0;floor<3;floor++){const s=dungeon(index,floor),map=dungeonMap(s.dungeon),boxes=dungeonChests(s,map);assert.ok(boxes.length>=2&&boxes.length<=5);assert.equal(new Set(boxes.map(c=>c.x+','+c.y)).size,boxes.length);for(const c of boxes){assert.notEqual(map[c.y][c.x],1);assert.notEqual(map[c.y][c.x],2);const item=TREASURE_ITEMS[c.item];assert.ok(c.gold>0);if(!item){assert.deepEqual(c.items,[]);continue;}assert.equal(item.rarity,c.rarity);if(item.kind!=='potion'&&item.kind!=='scroll'&&item.kind!=='gem'&&item.id!=='scroll-return'&&!item.nautical)assert.equal(item.tier,Math.min(3,1+Math.floor((lootLevel(s)-1)/8)));}assert.deepEqual(dungeonChests(loadGame(saveGame(s)),map),boxes);}for(const royal of ['cell','sewer']){const s=dungeon();s.dungeon.royal=royal;const boxes=dungeonChests(s,dungeonMap(s.dungeon));assert.ok(royal==='sewer'?boxes.length===1:boxes.length>=2&&boxes.length<=5);}});
test('opening chest grants item and gold once and persists without rerolling',()=>{let s=dungeon();const c=dungeonChests(s,dungeonMap(s.dungeon))[0];s.dungeon.x=c.x;s.dungeon.y=c.y;const gold=s.gold;s=act(s,{type:'openChest'});assert.equal(s.gold,gold+c.gold);for(const id of c.items)assert.ok(s.bag.includes(id));assert.deepEqual(s.pendingLoot,c.items);s=loadGame(saveGame(s));assert.equal(dungeonChests(s,dungeonMap(s.dungeon))[0].opened,true);assert.equal(act(s,{type:'openChest'}).gold,s.gold);});
test('all towns sell specialist stock, only wizards buy jewelry, and equipped items and relics cannot be sold',()=>{
  const ring='common-ring-1',relic='tithe-vault';
  for(const town of TOWNS){
    let s=atTownPlace({...createGame(),mode:'town',location:town.id,region:town.region,gold:1000},'shop');
    const id=stockForMerchant(s,merchantFor(town.id)).find(id=>id!==ring&&TREASURE_ITEMS[id]?.value>1);
    assert.ok(id,town.id);
    const price=TREASURE_ITEMS[id].value;
    s=act(s,{type:'buyItem',id});
    assert.equal(s.gold,1000-price);
    assert.ok(s.bag.some(ownedId=>ownedId.split('~')[0]===id));
    s.bag.push(ring,relic);
    s=act(s,{type:'equip',id:ring});
    assert.equal(act(s,{type:'sellItem',id:ring}).gold,s.gold);
    assert.equal(act(s,{type:'sellItem',id:relic}).gold,s.gold);
    s=act(s,{type:'unequip',slot:'ring'});
    s=act(s,{type:'sellItem',id:ring});
    const buysJewelry=merchantFor(town.id).merchant==='wizard';
    assert.equal(s.gold,1000-price+(buysJewelry?Math.floor(TREASURE_ITEMS[ring].value/2):0));
    assert.equal(s.bag.includes(ring),!buysJewelry);
    assert.equal(act(s,{type:'sellItem',id:ring}).gold,s.gold);
  }
});
test('potions heal, persist strength and invisibility, and consume a single copy',()=>{let s=createGame();s.hp=1;s.bag.push('common-lesser-healing','rare-strength','common-invisibility');s=act(s,{type:'useItem',id:'common-lesser-healing'});assert.equal(s.hp,26);assert.ok(!s.bag.includes('common-lesser-healing'));s=act(s,{type:'useItem',id:'rare-strength'});assert.equal(s.buffs.strengthPower,10);s=act(s,{type:'useItem',id:'common-invisibility'});s=loadGame(saveGame(s));assert.equal(s.spellEffects.invisibleMoves,10);assert.equal(s.flags.strengthMoves,10);assert.equal(s.buffs.strength,1);});
const fight=()=>({...createGame(),mode:'battle',enemy:{name:'Fire Imp',hp:999,maxHp:999,attack:30,gold:3,armor:0},returnMode:'world',rng:12345});
test('fire adds actual damage, frost prevents retaliation, and jewelry reduces elemental damage',()=>{let base=fight();base.bag.push('rare-sword-1');base.equipped='rare-sword-1';const fire=TREASURE_ITEMS[base.equipped];assert.equal(fire.element,'fire');const a=act(base,{type:'attack'});assert.ok(a.enemy.hp<base.enemy.hp);let frozen=false;for(let seed=0;seed<200&&!frozen;seed++){let s=fight();s.rng=seed;s.bag.push('legendary-spear-1');s.equipped='legendary-spear-1';const n=act(s,{type:'attack'});if(n.log.some(l=>l.includes('is frozen'))){assert.equal(n.hp,s.hp);frozen=true;}}assert.ok(frozen);let s=fight();const plain=act(s,{type:'guard'});s.bag.push('legendary-necklace-1');s.equippedNecklace='legendary-necklace-1';const protectedState=act(s,{type:'guard'});assert.ok(protectedState.hp>plain.hp);});
test('invisibility evades a combat attack and guarantees retreat',()=>{let s=fight();s.bag.push('common-invisibility');s=act(s,{type:'useItem',id:'common-invisibility'});assert.equal(s.hp,s.maxHp);assert.equal(s.spellEffects.invisibleMoves,10);s=act(s,{type:'flee'});assert.equal(s.mode,'world');});
test('malformed chest progress, buffs and jewelry are rejected on load',()=>{for(const mutation of [s=>s.openedChests=['garbage'],s=>s.buffs={invisibility:Infinity},s=>s.equippedRing='road-sword']){const s=createGame();mutation(s);assert.throws(()=>loadGame(saveGame(s)));}});


test('new royal adventurers receive two potions that bring health up to half',()=>{
 const hero=createRoyalGame('Potion tester');
 assert.equal(hero.bag.filter(id=>id==='starter-healing').length,2);
 const outside=act(hero,{type:'royalIntroSkip'});
 const ready=act(outside,{type:'useItem',id:'starter-healing'});
 assert.equal(ready.bag.filter(id=>id==='starter-healing').length,2);
 const wounded={...outside,hp:7};
 const healed=act(wounded,{type:'useItem',id:'starter-healing'});
 assert.equal(healed.hp,Math.ceil(hero.maxHp/2));
 assert.equal(healed.bag.filter(id=>id==='starter-healing').length,1);
});
