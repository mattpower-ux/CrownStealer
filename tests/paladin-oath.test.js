import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {itemById,merchantSellPrice} from '../public/game/items.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {dungeonMonsterLoot} from '../public/game/treasure.js';
import {atTownPlace} from './town-fixture.js';
import {poisoningItem,revokeBrokenOath} from '../public/game/paladin-oath.js';

function audience(){const s=createGame();s.region=1;s.mode='dungeon';s.dungeon={site:'percivals-lament',index:2,floor:2,x:13,y:13,dir:0};s.flags.percivalLicheDefeated=true;return s;}
function paladin(){return act(audience(),{type:'percivalOath',choice:'accept'});}
function fight(s,undead=true){return {...s,mode:'battle',returnMode:'world',dungeon:null,level:5,rng:12345,enemy:{name:undead?'Skeleton':'Ogre',speciesId:undead?'skeleton':'ogre',undead,kind:undead?'undead':'brute',level:1,hp:1000,maxHp:1000,attack:1,armor:0,gold:1,xp:0}};}

test('Percival rewards a single accepted oath with permanent attributes without a free sword',()=>{
 const original=audience();original.bag.push('common-sword-1-v3');original.equipped='common-sword-1-v3';original.weaponCoating={id:'weapon-poison-1',weapon:original.equipped,rounds:1};
 let s=act(original,{type:'percivalOath',choice:'accept'});
 assert.equal(s.flags.percivalOath,'accepted');assert.equal(s.bag.includes('holy-sword'),false);
 assert.equal(effectiveAttributes(s,itemById).strength,12);assert.equal(effectiveAttributes(s,itemById).charisma,12);
 assert.equal(s.equipped,'common-sword-1-v3');assert.equal(s.weaponCoating,undefined);assert.ok(s.bag.includes('common-sword-1-v3'));
 s=act(s,{type:'percivalOath',choice:'accept'});assert.equal(s.bag.filter(id=>id==='holy-sword').length,0);assert.equal(effectiveAttributes(s,itemById).strength,12);
 s.mode='world';s.dungeon=null;s=loadGame(saveGame(s));assert.equal(s.flags.percivalOath,'accepted');assert.equal(effectiveAttributes(s,itemById).charisma,12);
 const remote=createGame();remote.flags.percivalLicheDefeated=true;assert.equal(act(remote,{type:'percivalOath',choice:'accept'}).flags.percivalOath,undefined);
});

test('rejecting Percival is final and leaves one one-gold Pearl of Wisdom with his exact farewell',()=>{
 let s=act(audience(),{type:'percivalOath',choice:'reject'});
 assert.equal(s.flags.percivalOath,'rejected');assert.equal(s.log.at(-1),"I'm sorry, I should have taken you for just barely above average when I met you. Farewell, Schmuck.");
 const pearl=itemById('pearl-of-wisdom',s);assert.equal(pearl?.description,"Don't Be That Guy.");assert.equal(pearl.value,1);assert.equal(merchantSellPrice(s,pearl),1);
 s=act(s,{type:'percivalOath',choice:'accept'});assert.equal(s.flags.percivalOath,'rejected');assert.equal(s.bag.includes('holy-sword'),false);assert.equal(s.bag.filter(id=>id==='pearl-of-wisdom').length,1);
 s.mode='world';s.dungeon=null;s=loadGame(saveGame(s));assert.equal(s.flags.percivalOath,'rejected');
 s=atTownPlace({...s,mode:'town',region:0,location:'bellwether'},'shop');const gold=s.gold;
 s=act(s,{type:'sellItem',id:'pearl-of-wisdom'});assert.equal(s.gold,gold+1);assert.equal(s.bag.includes('pearl-of-wisdom'),false);
});

test('the oath blessing adds exactly two even at the normal training cap',()=>{
 const s=audience();s.attributes.strength=50;s.attributes.charisma=50;
 const n=act(s,{type:'percivalOath',choice:'accept'});
 assert.equal(effectiveAttributes(n,itemById).strength,52);assert.equal(effectiveAttributes(n,itemById).charisma,52);
});

test('theft and poison actions occur before permanent loss of paladin powers',()=>{
 const s=paladin();s.mode='town';s.region=0;s.location='mothbridge';s.dungeon=null;s.bag.push('common-sword-1-v3','weapon-poison-1');
 const thief=act(s,{type:'steal'});assert.ok(thief.gold>s.gold);assert.equal(thief.flags.percivalOath,'fallen');assert.ok(thief.flags.paladinForsakenPending.reason);
 assert.equal(effectiveAttributes(thief,itemById).strength,10);assert.equal(effectiveAttributes(thief,itemById).charisma,10);
 const poisoned=act(s,{type:'useItem',id:'weapon-poison-1'});assert.equal(poisoned.weaponCoating.id,'weapon-poison-1');assert.equal(poisoned.bag.includes('weapon-poison-1'),false);assert.equal(poisoned.flags.percivalOath,'fallen');
 const allowed=act(s,{type:'equip',id:'common-sword-1-v3'});assert.equal(allowed.equipped,'common-sword-1-v3');assert.equal(allowed.flags.percivalOath,'accepted');
 assert.notEqual(itemById('common-sword-1-v3').evil,true);assert.notEqual(itemById('alien-forged-common-sword-1-v3').evil,true);
 const invalid=act(s,{type:'robDiscoveryChest',id:'anything'});assert.equal(invalid.flags.percivalOath,'accepted');
 const unarmed={...s,equipped:null};assert.equal(act(unarmed,{type:'useItem',id:'weapon-poison-1'}).flags.percivalOath,'accepted');
 const restored=loadGame(saveGame(thief));assert.equal(restored.flags.percivalOath,'fallen');assert.equal(effectiveAttributes(restored,itemById).strength,10);
 const powerless=fight(restored),unchanged=act(powerless,{type:'turnDead'});assert.equal(unchanged.enemy.hp,powerless.enemy.hp);
 assert.equal(act(restored,{type:'acknowledgePaladinForsaken'}).flags.paladinForsakenPending,undefined);
});

test('poison scrolls and wands revoke powers only when actually spent; cures and lifesteal are not evil',()=>{
 assert.equal(poisoningItem({kind:'scroll',spell:'cure-poison'}),false);
 assert.equal(poisoningItem({kind:'weapon',lifeSteal:3}),false);
 for(const kind of ['scroll','wand']){
  const before=paladin();before.bag.push('test-poison');before.flags.testCharges=3;
  const lookup=(id,s)=>id==='test-poison'?{id,kind,spell:'poison-cloud',charges:kind==='wand'?s.flags.testCharges:undefined}:itemById(id,s);
  const unchanged=structuredClone(before);
  assert.equal(revokeBrokenOath(before,unchanged,{type:'useItem',id:'test-poison'},[],()=>{},lookup),false);
  const after=structuredClone(before);if(kind==='scroll')after.bag.pop();else after.flags.testCharges--;
  assert.equal(revokeBrokenOath(before,after,{type:'useItem',id:'test-poison'},[],()=>{},lookup),true);
  assert.equal(after.flags.percivalOath,'fallen');
 }
});

test('attacking unicorns or fey and completing orc goblin troll bargains breaks the oath',()=>{
 for(const name of ['Unicorn','Forest Fey']){
  const s=fight(paladin(),false);s.enemy.name=name;const after=act(s,{type:'attack'});assert.ok(after.enemy.hp<s.enemy.hp);assert.equal(after.flags.percivalOath,'fallen');
 }
 for(const name of ['Orc trader','Goblin peddler','Troll merchant']){
  const s=paladin();Object.assign(s,{mode:'world',dungeon:null});s.flags.peacefulEncounter={name,offer:'sell',amount:5};
  const after=act(s,{type:'peacefulAccept'});assert.equal(after.gold,s.gold-5);assert.ok(after.bag.includes('starter-healing'));assert.equal(after.flags.percivalOath,'fallen');
  s.gold=0;assert.equal(act(s,{type:'peacefulAccept'}).flags.percivalOath,'accepted');
 }
 const s=paladin();Object.assign(s,{mode:'world',dungeon:null});s.flags.peacefulEncounter={name:'Human merchant',offer:'trade',amount:1};
 assert.equal(act(s,{type:'peacefulAccept'}).flags.percivalOath,'accepted');
});

test('paladin gambling is blocked without revoking the oath',()=>{
 const s=atTownPlace({...paladin(),mode:'town',location:'mothbridge',region:0,dungeon:null},'casino');
 const after=act(s,{type:'gamble',game:'blackjack',bet:10});assert.equal(after.gold,s.gold);assert.equal(after.casino,undefined);assert.equal(after.flags.percivalOath,'accepted');assert.match(after.log.at(-1),/Gambling is evil/);
});

test('TURN DEAD damages every surviving undead in a group and remains available after saving',()=>{
 let s=fight(paladin());Object.assign(s.enemy,{groupSize:3,memberHp:100,hp:300,maxHp:300});
 const events=[];s=act(s,{type:'turnDead'},events);assert.equal(s.enemy.hp,219);assert.equal(events.find(e=>e.turnDead)?.targets,3);
 s=loadGame(saveGame(s));s=act(s,{type:'turnDead'});assert.equal(s.enemy.hp,146);
 const living=fight(paladin(),false),after=act(living,{type:'turnDead'});assert.equal(after.hp,living.hp);assert.equal(after.enemy.hp,living.enemy.hp);
});

test('paladins ignore Balrog fear and the Holy Sword doubles damage only against undead',()=>{
 const s=fight(paladin());s.bag.push('holy-sword');s.equipped='holy-sword';
 const living=act(fight(s,false),{type:'attack'}),dead=act(fight(s,true),{type:'attack'});
 assert.equal(1000-dead.enemy.hp,2*(1000-living.enemy.hp));
 const fearful=fight(s,false);fearful.enemy.speciesId='balrog-of-despair';fearful.enemy.name='Balrog';fearful.rng=700;
 const ordinary=structuredClone(fearful);delete ordinary.flags.percivalOath;const scared=[];act(ordinary,{type:'attack'},scared);assert.ok(scared.some(e=>/gibbering/.test(e.message||'')));
 const events=[];act(fearful,{type:'attack'},events);assert.equal(events.some(e=>/gibbering/.test(e.message||'')),false);assert.ok(events.some(e=>e.target==='enemy'));
});


test('Holy Sword is obtainable as legendary dungeon loot and Holy Avenger retains triple damage',()=>{
 const state={...createGame(),region:1,level:12};
 const loot=new Set(Array.from({length:10000},(_,i)=>dungeonMonsterLoot(state,.99,i/10000)));
 assert.ok(loot.has('holy-sword'));
 const s=fight(paladin());s.bag.push('holy-avenger');s.equipped='holy-avenger';
 const living=act(fight(s,false),{type:'attack'}),dead=act(fight(s,true),{type:'attack'});
 assert.equal(1000-dead.enemy.hp,3*(1000-living.enemy.hp));
});

test('dynamic good-creature metadata and an existing blackjack double wager respect the oath',()=>{
 for(const metadata of [{speciesId:'unicorn',name:'Moonlight'},{race:'fey',name:'Leafwhisper'},{alignment:'good',name:'Guardian'}]){
  const s=fight(paladin(),false);Object.assign(s.enemy,metadata);assert.equal(act(s,{type:'attack'}).flags.percivalOath,'fallen');
 }
 const s=atTownPlace({...paladin(),mode:'town',location:'mothbridge',region:0,dungeon:null},'casino');
 s.casino={active:true,game:'blackjack',bet:10,stake:10,hand:[0,2],dealer:[1,3],deck:[5,6]};
 const after=act(s,{type:'casinoDouble'});assert.equal(after.gold,s.gold);assert.deepEqual(after.casino,s.casino);assert.equal(after.flags.percivalOath,'accepted');
});
