import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {itemById} from '../public/game/items.js';
import {grantHornOfHelp} from '../public/game/hero-help.js';
globalThis.Image ??= class {set src(value){this._src=value;}};
const {inventoryView}=await import('../public/game/inventory-view.js');

const fight=s=>({...s,mode:'battle',returnMode:'world',enemy:{name:'Practice Ogre',level:1,hp:999,maxHp:999,attack:1,armor:0,gold:0,xp:0,kind:'brute'},rng:12345});
function holder(){const s=createGame();s.bag.push('horn-of-help');s.flags.hornHelpCharges=3;return s;}

test('the unique horn grants three calls only once and inventory offers activation only in combat',()=>{
 let s=createGame();assert.equal(grantHornOfHelp(s),true);assert.equal(s.flags.hornHelpCharges,3);
 s.flags.hornHelpCharges=1;assert.equal(grantHornOfHelp(s),false);assert.equal(s.flags.hornHelpCharges,1);
 assert.equal(s.bag.filter(id=>id==='horn-of-help').length,1);
 const select={id:'horn-of-help',source:'bag'};
 assert.match(inventoryView(s,select),/1 \/ 3 calls/);
 assert.doesNotMatch(inventoryView(s,select),/>Sound Horn of Help</);
 s=fight(s);assert.match(inventoryView(s,select),/>Sound Horn of Help</);
 s.enemy.heroGhost=true;assert.doesNotMatch(inventoryView(s,select),/>Sound Horn of Help</);
});

test('Horn of Help has exactly three persistent battle summons without waste or stacking',()=>{
 let s=holder();assert.equal(itemById('horn-of-help',s)?.name,'Horn of Help');
 s=act(s,{type:'useItem',id:'horn-of-help'});assert.equal(s.flags.hornHelpCharges,3);
 for(let remaining=2;remaining>=0;remaining--){
  s=fight(s);s=act(s,{type:'useItem',id:'horn-of-help'});
  assert.equal(s.enemy.heroGhost,true);assert.equal(s.flags.hornHelpCharges,remaining);
  const hp=s.hp;s=act(s,{type:'useItem',id:'horn-of-help'});
  assert.equal(s.flags.hornHelpCharges,remaining);assert.equal(s.hp,hp);
  s=loadGame(saveGame(s));assert.equal(s.flags.hornHelpCharges,remaining);assert.equal(s.enemy.heroGhost,true);
 }
 s=fight(s);s=act(s,{type:'useItem',id:'horn-of-help'});
 assert.equal(s.flags.hornHelpCharges,0);assert.equal(s.enemy.heroGhost,undefined);
 assert.ok(s.bag.includes('horn-of-help'));
});

test('hero ghost adds a deterministic level-scaled strike and cannot carry into another fight',()=>{
 const base=fight(holder());base.level=5;
 const assisted=structuredClone(base);assisted.enemy.heroGhost=true;
 const events=[],plain=act(base,{type:'attack'}),ghost=act(assisted,{type:'attack'},events);
 assert.equal(plain.enemy.hp-ghost.enemy.hp,16);
 assert.equal(events.filter(e=>e.heroGhost&&e.target==='enemy')[0]?.amount,16);
 const next=fight(ghost),nextEvents=[];act(next,{type:'attack'},nextEvents);
 assert.equal(nextEvents.some(e=>e.heroGhost),false);
});

test('hero ghost can finish a fight after the player misses and invalid charge saves are rejected',()=>{
 const s=fight(holder());s.enemy.heroGhost=true;s.enemy.hp=1;s.enemy.kind='swift';s.region=3;
 // Seed whose first attack roll exceeds the hit chance.
 s.rng=1700;const events=[];const after=act(s,{type:'attack'},events);
 assert.ok(events.some(e=>e.kind==='miss'));
 assert.equal(after.mode,'world');assert.ok(events.some(e=>e.kind==='victory'));
 for(const charges of [-1,4,1.5]){const bad=holder();bad.flags.hornHelpCharges=charges;assert.throws(()=>loadGame(saveGame(bad)),/Horn/);}
});
