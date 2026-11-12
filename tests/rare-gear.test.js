import {dungeonLadders} from '../public/game/dungeon-ladders.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {RARE_GEAR_ITEMS,rareGearEffect,randomAttributeLoot} from '../public/game/rare-gear.js';
import {createGame,act,saveGame,loadGame,dungeonMap} from '../public/game/engine.js';
import {itemById} from '../public/game/items.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {wildernessChance} from '../public/game/world-clock.js';
import {wildernessEventAction} from '../public/game/wilderness-events.js';
import {castleAction,castleLayout} from '../public/game/castle-interiors.js';
import {travelSteps} from '../public/game/junk-loot.js';

test('all eleven rare gear families drop at eligible levels with capped scaled effects',()=>{
 const drops=new Set();for(let i=0;i<11;i++)drops.add(randomAttributeLoot(5,100,0,i/12));
 assert.equal(drops.size,11);for(const id of drops)assert.ok(RARE_GEAR_ITEMS[id]&&id.endsWith('-5'));
 for(const [id,attribute] of [['intelligence','intelligence'],['strength','strength'],['toughness','constitution'],['agility','dexterity']]){
  const s=createGame();s.bag.push('ring-'+id+'-5');s.equippedRing='ring-'+id+'-5';assert.equal(effectiveAttributes(s,itemById)[attribute],15);
 }
 assert.equal(randomAttributeLoot(4,100,0,.99),null);
});
test('belt saves in its own validated slot and reduces random encounters by ten to fifty percent',()=>{
 let s=createGame();assert.equal(s.equippedBelt,null);s.bag.push('belt-sneakiness-1');s=act(s,{type:'equip',id:'belt-sneakiness-1'});
 assert.equal(loadGame(saveGame(s)).equippedBelt,'belt-sneakiness-1');assert.ok(Math.abs(wildernessChance(s,.1)-.09)<1e-10);
 s.bag.push('belt-sneakiness-5');s=act(s,{type:'equip',id:'belt-sneakiness-5'});assert.equal(wildernessChance(s,.1),.05);
 s=act(s,{type:'unequip',slot:'belt'});assert.equal(wildernessChance(s,.1),.1);
 delete s.equippedBelt;assert.equal(loadGame(saveGame(s)).equippedBelt,null);
 s.equippedBelt='road-sword';assert.throws(()=>loadGame(saveGame(s)));
});
test('thief gloves improve castle locks and can disarm a false hoard',()=>{
 const s=createGame();s.mode='town';s.location='bellwether';s.castle={...castleLayout('bellwether').chests[0],alarm:false};s.equippedHands='gloves-thief-1';s.bag.push(s.equippedHands);
 const ctx={random:()=>.4,dexterity:()=>10,note:(s,m)=>s.log.push(m),clock:()=>{},startGuard:()=>{throw Error('Should unlock');}};
 castleAction(s,{type:'robCastleChest'},ctx);assert.ok(s.flags[s.castle.id]);
 s.mode='world';s.flags.wildernessEvent={kind:'hoard'};let rolls=[.9,.05];const hp=s.hp;
 wildernessEventAction(s,{type:'wildernessChoice',choice:'take'},{random:()=>rolls.shift(),note:(s,m)=>s.log.push(m),recover:()=>{}});
 assert.equal(s.hp,hp);assert.match(s.log.at(-1),/disarm/i);
 s.equippedHands='gloves-thief-5';assert.equal(rareGearEffect(s,'lockpickBonus'),.5);assert.equal(rareGearEffect(s,'disarmBonus'),.5);
});
test('speed boots add one to five movement steps and stop at town exits',()=>{
 let s=createGame();s.equippedBoots='boots-speed-1';assert.equal(travelSteps(s),2);
 s.equippedBoots='boots-speed-5';assert.equal(travelSteps(s),6);
 s.mode='town';s.location='gallows-fair';s.gold=100;s.townPosition={x:6,y:11};
 s=act(s,{type:'move',dx:0,dy:1});assert.equal(s.mode,'world');assert.deepEqual(s.townPosition,{x:6,y:12});
});
test('speed boots pause at street junctions and keep the square reachable',()=>{
 let s=createGame();s.mode='town';s.location='bellwether';s.townPosition={x:6,y:11};s.equippedBoots='boots-speed-1';
 s=act(s,{type:'move',dx:0,dy:-1});assert.deepEqual(s.townPosition,{x:6,y:10});
 s.equippedBoots='boots-speed-5';for(let step=0;step<3;step++)s=act(s,{type:'move',dx:0,dy:-1});assert.deepEqual(s.townPosition,{x:6,y:7});
});
test('attribute belts improve their own score without occupying a ring slot',()=>{
 for(const [name,attribute] of [['strength','strength'],['agility','dexterity'],['charisma','charisma']]){
  let s=createGame();s.bag.push('belt-'+name+'-5');s=act(s,{type:'equip',id:'belt-'+name+'-5'});
  assert.equal(effectiveAttributes(loadGame(saveGame(s)),itemById)[attribute],15);assert.equal(s.equippedRing,null);
 }
});

test('fast dungeon movement stops on a hallway ladder',()=>{
 let s=createGame();s.mode='dungeon';s.dungeon={index:0,floor:1,x:1,y:1,dir:0,ladderLayout:1};s.equippedBoots='boots-speed-5';
 const map=dungeonMap(s.dungeon),ladder=dungeonLadders(s.dungeon,map).find(p=>p.direction==='down'),directions=[[0,-1],[1,0],[0,1],[-1,0]];
 const dir=directions.findIndex(([dx,dy])=>map[ladder.y-dy]?.[ladder.x-dx]===0);assert.ok(dir>=0);
 const [dx,dy]=directions[dir];Object.assign(s.dungeon,{x:ladder.x-dx,y:ladder.y-dy,dir});
 s=act(s,{type:'forward'},[],{noRandom:true});assert.deepEqual([s.dungeon.x,s.dungeon.y],[ladder.x,ladder.y]);
});
test('speed boots stop at the fallen elf and Haghilda rather than skipping their interaction tiles',()=>{
 for(const floor of [2,3]){
  let s=createGame();s.mode='dungeon';s.dungeon={index:0,site:'elf-village',floor,x:7,y:6,dir:2};s.equippedBoots='boots-speed-3';
  assert.notEqual(dungeonMap(s.dungeon)[7][7],1);
  s=act(s,{type:'forward'},[],{noRandom:true});assert.deepEqual([s.dungeon.x,s.dungeon.y],[7,7]);
 }
});
test('fast boots preserve access to dungeon junctions and the down ladder',()=>{
 let s=createGame();s.treasureSeed=0;s.mode='dungeon';s.dungeon={index:1,floor:4,x:4,y:11,dir:0,ladderLayout:1};s.equippedBoots='boots-speed-2';
 const target=dungeonLadders(s.dungeon,dungeonMap(s.dungeon)).find(p=>p.direction==='down');
 const queue=[s],seen=new Set(),actions=[{type:'forward'},{type:'back'},{type:'strafe',delta:-1},{type:'strafe',delta:1},{type:'turn',delta:-1},{type:'turn',delta:1}];let found=false;
 for(let i=0;i<queue.length;i++){
  const current=queue[i],d=current.dungeon,key=[d.x,d.y,d.dir].join(',');if(seen.has(key))continue;seen.add(key);
  if(d.x===target.x&&d.y===target.y){found=true;break;}
  for(const action of actions){const next=act(current,action,[],{noRandom:true});if(next.mode==='dungeon')queue.push(next);}
 }
 assert.ok(found,'The down ladder must remain reachable with speed boots equipped');
});
test('fast indoor movement leaves the Iron Choir court and Mothbridge castle chests reachable',()=>{
 for(const castle of [false,true]){
  const s=createGame();s.mode='town';s.location=castle?'mothbridge':'iron-choir';s.region=castle?0:1;s.equippedBoots='boots-speed-4';s.townPosition={x:6,y:11};
  const targets=castle?castleLayout(s.location).chests.map(p=>[p.x,p.y].join(',')):['9,9'];
  if(castle)s.castle={...castleLayout(s.location).entrance,alarm:false};
  const queue=[s],seen=new Set();
  for(let i=0;i<queue.length;i++){
   const current=queue[i],p=current.castle||current.townPosition,key=[p.x,p.y].join(',');if(seen.has(key))continue;seen.add(key);
   for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const next=act(current,{type:'move',dx,dy},[],{noRandom:true});if(next.mode==='town'&&!!next.castle===castle)queue.push(next);}
  }
  for(const target of targets)assert.ok(seen.has(target),s.location+' '+target);
 }
});
