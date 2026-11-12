import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {POISON_ITEMS} from '../public/game/weapon-poisons.js';
const battle=s=>({...s,mode:'battle',returnMode:'world',rng:1,enemy:{name:'Practice ogre',hp:9999,maxHp:9999,attack:0,armor:0,gold:0,xp:0,weakness:'none'}});
test('five poison strengths coat an owned equipped weapon and add damage for one to five rounds',()=>{
 for(const item of Object.values(POISON_ITEMS)){
  const s=createGame();s.bag.push(item.id);const coated=act(s,{type:'useItem',id:item.id});
  assert.equal(coated.weaponCoating.rounds,item.rounds);assert.ok(!coated.bag.includes(item.id));
  const plainEvents=[],events=[];act(battle(s),{type:'attack'},plainEvents);
  let next=act(battle(coated),{type:'attack'},events);
  assert.equal(events.find(e=>e.kind==='hit'&&e.target==='enemy').amount-plainEvents.find(e=>e.kind==='hit'&&e.target==='enemy').amount,item.damageBonus);
  for(let i=1;i<item.rounds;i++)next=act(next,{type:'guard'});
  assert.equal(next.weaponCoating,undefined);
 }
});
test('coatings save, do not stack, require weapons, and end when equipment changes',()=>{
 let s=createGame();s.bag.push('weapon-poison-5','weapon-poison-1');
 s=act(s,{type:'useItem',id:'weapon-poison-5'});s=loadGame(saveGame(s));assert.equal(s.weaponCoating.rounds,5);
 s=act(s,{type:'useItem',id:'weapon-poison-1'});assert.equal(s.weaponCoating.id,'weapon-poison-1');
 s=act(s,{type:'unequip',slot:'weapon'});assert.equal(s.weaponCoating,undefined);
 s.bag.push('weapon-poison-1');s=act(s,{type:'useItem',id:'weapon-poison-1'});assert.ok(s.bag.includes('weapon-poison-1'));assert.equal(s.weaponCoating,undefined);
});
test('applying poison during battle preserves all promised rounds; forged coating saves fail',()=>{
 let s=battle(createGame());s.bag.push('weapon-poison-1');s=act(s,{type:'useItem',id:'weapon-poison-1'});assert.equal(s.weaponCoating.rounds,1);
 const forged=structuredClone(s);forged.weaponCoating.rounds=6;assert.throws(()=>loadGame(saveGame(forged)),/poison/i);
 s.enemy.hp=1;s.rng=1;s=act(s,{type:'attack'});assert.equal(s.mode,'world');assert.equal(s.weaponCoating,undefined);
});

test('defeating a palace guard clears poison before the next guard joins the fight',()=>{
 let s={...createGame(),mode:'town',location:'mothbridge',level:100};
 s.bag.push('weapon-poison-5');
 s=act(s,{type:'useItem',id:'weapon-poison-5'});
 s=act(s,{type:'challenge'});
 assert.match(s.enemy.name,/Guard 1 of 5/);
 assert.equal(s.weaponCoating.rounds,5);
 s.enemy.hp=1;s.rng=187441;
 const next=act(s,{type:'attack'});
 assert.equal(next.mode,'battle');
 assert.match(next.enemy.name,/Guard 2 of 5/);
 assert.equal(next.weaponCoating,undefined);
});
