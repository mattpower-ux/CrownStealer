import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {townPlaces} from '../public/game/town.js';
import {stockForMerchant} from '../public/game/merchant-inventory.js';
import {merchantFor} from '../public/game/merchant-catalog.js';
import {merchantItemRemaining} from '../public/game/merchant-supplies.js';
import {itemById} from '../public/game/items.js';
function shop(town='mothbridge',id='shop'){
 const s=createGame();Object.assign(s,{mode:'town',location:town,gold:100000});
 const p=townPlaces(s).find(p=>p.id===id);s.townPosition={x:p.x,y:p.y};return s;
}

test('a present traveling merchant trades mixed goods with persistent stock and rejects remote trades',()=>{
 let s=createGame();Object.assign(s,{region:2,level:18,gold:100000,x:24,y:24});
 s.flags.travelMerchant={x:s.x,y:s.y};
 const place={id:'travel-merchant',merchant:'traveling'};
 const stock=stockForMerchant(s,place);
 for(const kind of ['weapon','potion','scroll','ring'])assert.ok(stock.some(id=>itemById(id,s).kind===kind),kind);
 const weapon=stock.find(id=>itemById(id,s).kind==='weapon');
 s=act(s,{type:'buyItem',id:weapon,merchant:place.id});assert.ok(s.bag.includes(weapon));
 s=loadGame(saveGame(s));const before=s.gold;
 s=act(s,{type:'buyItem',id:weapon,merchant:place.id});assert.equal(s.gold,before);
 for(const id of [weapon,'scroll-return','common-ring-1','weapon-poison-1']){
   if(!s.bag.includes(id))s.bag.push(id);
   const gold=s.gold;s=act(s,{type:'sellItem',id,merchant:place.id});
   assert.ok(s.gold>gold,id);assert.equal(s.bag.includes(id),false,id);
 }
 const cure=act(s,{type:'buyCureAll'});assert.ok(cure.bag.includes('potion-cure-all'));assert.equal(cure.flags.travelMerchant.sold,true);
 for(const edit of [v=>v.x++,v=>delete v.flags.travelMerchant,v=>v.mode='battle']){
   const away=structuredClone(s);edit(away);away.bag.push('common-ring-1');
   assert.equal(act(away,{type:'sellItem',id:'common-ring-1',merchant:place.id}).gold,away.gold);
 }
});

test('blacksmith rejects unrelated bag goods while their specialist buys them',()=>{
 const smith=shop();smith.bag.push('weapon-poison-1');
 const rejected=act(smith,{type:'sellItem',id:'weapon-poison-1'});
 assert.equal(rejected.gold,smith.gold);assert.deepEqual(rejected.bag,smith.bag);
 const alchemist=shop('gallows-fair');alchemist.bag.push('weapon-poison-1');
 const sold=act(alchemist,{type:'sellItem',id:'weapon-poison-1'});
 assert.ok(sold.gold>alchemist.gold);assert.equal(sold.bag.includes('weapon-poison-1'),false);
});
test('trading requires the actual storefront and rejects another merchant category',()=>{
 const s=shop(),id=stockForMerchant(s,merchantFor(s.location)).find(id=>itemById(id,s).kind==='weapon');
 const wrong=act(s,{type:'buyItem',id:'weapon-poison-1'});assert.equal(wrong.gold,s.gold);
 const away=structuredClone(s);away.townPosition={x:6,y:11};assert.equal(act(away,{type:'buyItem',id,merchant:'shop'}).gold,s.gold);
 const forged=act(s,{type:'buyItem',id,merchant:'mount-shop'});assert.equal(forged.gold,s.gold);
 assert.ok(act(s,{type:'buyItem',id}).bag.includes(id));
});
test('three consumables can be bought atomically and sold stock does not refill merchants',()=>{
 let s=shop('gallows-fair');const id='weapon-poison-1',item=itemById(id,s);
 const failed=act(s,{type:'buyItem',id,quantity:4});assert.equal(failed.gold,s.gold);assert.equal(merchantItemRemaining(failed,item),3);
 s=act(s,{type:'buyItem',id,quantity:3});assert.equal(s.bag.filter(v=>v===id).length,3);assert.equal(merchantItemRemaining(s,item),0);
 s=loadGame(saveGame(s));s=act(s,{type:'sellItem',id,quantity:2});assert.equal(s.bag.filter(v=>v===id).length,1);
 const gold=s.gold;s=act(s,{type:'buyItem',id});assert.equal(s.gold,gold);assert.equal(merchantItemRemaining(s,item),0);
});
test('specialty items are single-stock, equipped items and quest items cannot be sold',()=>{
 let s=shop('bellwether');const id=stockForMerchant(s,merchantFor(s.location)).find(id=>itemById(id,s).kind==='ring');assert.ok(id);
 s=act(s,{type:'buyItem',id});const gold=s.gold;s=act(s,{type:'buyItem',id});assert.equal(s.gold,gold);
 s=act(s,{type:'equip',id});assert.equal(act(s,{type:'sellItem',id}).gold,gold);
 for(const quantity of [0,-1,1.5,100])assert.equal(act(s,{type:'sellItem',id,quantity}).gold,gold);
});
test('basic supplies belong to the proper shop and bulk tonics stop at three',()=>{
 const smith=shop();assert.equal(act(smith,{type:'buy',item:'potion'}).potions,smith.potions);
 let s=shop('gallows-fair'),before=s.potions;s=act(s,{type:'buy',item:'potion',quantity:3});assert.equal(s.potions,before+3);
 assert.equal(act(s,{type:'buy',item:'potion'}).gold,s.gold);
 const inn=shop('mothbridge','inn');assert.equal(act(inn,{type:'buy',item:'food',quantity:2}).meals,inn.meals+6);
});
