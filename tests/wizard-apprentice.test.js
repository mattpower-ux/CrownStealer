import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {itemById} from '../public/game/items.js';
import {gagActive} from '../public/game/gag-potions.js';
import {wildernessChance} from '../public/game/world-clock.js';
import {prepareWands} from '../public/game/spell-items.js';
import {wizardInvisible,wizardProgress,wizardGearAllowed} from '../public/game/wizard-apprentice.js';
function audience(){const s=createGame();s.level=10;s.region=3;s.exploration={area:'wild-10',artifacts:[],home:{region:3,x:64,y:88}};s.mode='dungeon';s.dungeon={site:'twinklestar-tower',index:6,floor:8,x:13,y:13,dir:0};s.flags.twinklestarGuardianDefeated=true;return s;}
function wizard(){return act(audience(),{type:'wizardApprentice',choice:'accept'});}
function battle(s){return {...s,mode:'battle',returnMode:'world',dungeon:null,hp:1000,maxHp:1000,rng:12345,enemy:{name:'Ogre',speciesId:'ogre',level:2,hp:1000,maxHp:1000,attack:2,armor:0,gold:1,xp:0}};}
test('apprenticeship is gated, grants rewards once, replaces paladin and saves',()=>{
 assert.equal(act(createGame(),{type:'wizardApprentice',choice:'accept'}).flags.wizardApprentice,undefined);
 const s=audience();s.flags.percivalOath='accepted';const next=act(s,{type:'wizardApprentice',choice:'accept'});
 assert.equal(next.flags.percivalOath,'retired');assert.equal(next.flags.paladinForsakenPending,undefined);
 assert.equal(effectiveAttributes(next,itemById).intelligence,12);assert.equal(effectiveAttributes(next,itemById).strength,10);
 assert.ok(next.bag.includes('dungeon-elevator'));assert.equal(next.equipped,null);assert.equal(next.equippedArmor,'apprentice-robes');
 assert.deepEqual(act(next,{type:'wizardApprentice',choice:'accept'}).bag,next.bag);
 assert.equal(loadGame(saveGame(next)).flags.wizardApprentice,'accepted');
 const no=act(audience(),{type:'wizardApprentice',choice:'reject'});assert.equal(no.flags.wizardApprentice,'rejected');assert.ok(!no.bag.includes('dungeon-elevator'));
});
test('wizard may equip warrior gear in town but loses powers when wearing it outside',()=>{
 let s=wizard();Object.assign(s,{mode:'town',location:'mothbridge',region:0,dungeon:null,exploration:null});s.bag.push('dagger-of-insult','common-mace-1','common-armor-1');
 s=act(s,{type:'equip',id:'road-sword'});assert.equal(s.equipped,'road-sword');assert.equal(s.flags.wizardApprentice,'accepted');
 const fallen=act(s,{type:'leave'});assert.equal(fallen.flags.wizardApprentice,'fallen');assert.equal(effectiveAttributes(fallen,itemById).intelligence,10);assert.ok(fallen.flags.wizardForsakenPending);
 assert.equal(loadGame(saveGame(fallen)).flags.wizardApprentice,'fallen');
 assert.equal(act(fallen,{type:'acknowledgeWizardForsaken'}).flags.wizardForsakenPending,undefined);
 const dagger=act({...s,mode:'world',equipped:null},{type:'equip',id:'dagger-of-insult'});assert.equal(dagger.equipped,'dagger-of-insult');assert.equal(dagger.flags.wizardApprentice,'accepted');
 const armor=act({...s,mode:'world',equipped:null},{type:'equip',id:'common-armor-1'});assert.equal(armor.flags.wizardApprentice,'fallen');
 assert.equal(wizardGearAllowed({kind:'weapon',shape:'axe'}),false);
});
test('wizard wand has unlimited charges and offensive spells gain twenty percent',()=>{
 let s=battle(wizard());const wand=s.bag.find(id=>id.startsWith('wand-apprentice-missiles~'));
 for(let i=0;i<12;i++)s=act(s,{type:'useItem',id:wand});assert.equal(s.wandCharges[wand],1);assert.ok(s.enemy.hp<1000);
 const enhanced=battle(wizard()),ordinary=structuredClone(enhanced);delete ordinary.flags.wizardApprentice;ordinary.attributes.intelligence=12;
 for(const state of [enhanced,ordinary])state.bag.push('scroll-fireball');
 const normal=act(ordinary,{type:'useItem',id:'scroll-fireball'}),bonus=act(enhanced,{type:'useItem',id:'scroll-fireball'});
 assert.equal(1000-bonus.enemy.hp,Math.floor((1000-normal.enemy.hp)*1.2));
});
test('invisibility lasts ten wall-clock seconds and cooldown persists across save',()=>{
 const original=Date.now;let now=100000;Date.now=()=>now;
 try{let s=act(battle(wizard()),{type:'wizardInvisible'});assert.ok(wizardInvisible(s));const hp=s.hp;s=act(s,{type:'guard'});assert.equal(s.hp,hp);
 now+=10000;assert.equal(wizardInvisible(s),false);s=loadGame(saveGame(s));const blocked=act(s,{type:'wizardInvisible'});assert.equal(blocked.flags.wizardTimers.invisibleUntil,110000);
 now+=50000;s=act(s,{type:'wizardInvisible'});assert.ok(wizardInvisible(s));}finally{Date.now=original;}
});
test('learned abilities unlock by levels gained; recharge is targeted and cannot be spammed',()=>{
 let s=wizard();assert.deepEqual(wizardProgress(s),{gainedLevels:0,teleport:false,shapeshift:false,recharge:false});
 s.level+=3;assert.ok(wizardProgress(s).teleport);s=act(s,{type:'wizardTeleport'});assert.equal(s.mode,'town');assert.ok(s.flags.wizardTimers.teleportReadyAt>Date.now());
 s.level+=3;s=act(s,{type:'wizardShapeshift'});assert.ok(s.flags.wizardTimers.shapeshiftUntil>Date.now());
 s.level+=3;s.bag.push('wand-fireball-1');prepareWands(s);const id=s.bag.find(id=>id.startsWith('wand-fireball-1~'));s.wandCharges[id]=0;
 s=act(s,{type:'wizardRecharge',id});assert.equal(s.wandCharges[id],1);s=act(s,{type:'wizardRecharge',id});assert.equal(s.wandCharges[id],1);
 assert.equal(loadGame(saveGame(s)).wandCharges[id],1);
});

test('killing a wizard revokes powers but a wizard-themed animal does not',()=>{
 for(const [speciesId,falls] of [['black-wizard',true],['wizard-lizard',false],['lizard',false]]){
  const s=battle(wizard());s.enemy.speciesId=speciesId;s.enemy.name='Wizard Lizard';s.enemy.hp=1;
  const after=act(s,{type:'useItem',id:s.bag.find(id=>id.startsWith('wand-apprentice-missiles~'))});
  assert.equal(after.flags.wizardApprentice,falls?'fallen':'accepted');
  if(falls){const again=battle(after),id=again.bag.find(id=>id.startsWith('wand-apprentice-missiles~'));assert.equal(act(again,{type:'useItem',id}).enemy.hp,1000);}
 }
});

test('marriage revokes wizard powers only after a valid royal marriage choice',()=>{
 let s=wizard();Object.assign(s,{mode:'town',region:0,location:'bellwether',dungeon:null,exploration:null});
 assert.equal(act(s,{type:'royalChoice',choice:'marriage'}).flags.wizardApprentice,'accepted');
 Object.assign(s.flags,{royalQuest:'audience','garrison:0':true,balrogTrialComplete:true});
 const married=act(s,{type:'royalChoice',choice:'marriage'});assert.equal(married.flags.married,true);assert.equal(married.flags.wizardApprentice,'fallen');assert.match(married.flags.wizardForsakenPending.reason,/married/);
});

test('taking the paladin oath after apprenticeship retires wizard powers without punishment',()=>{
 const s=wizard();Object.assign(s,{region:1,exploration:null,mode:'dungeon',dungeon:{site:'percivals-lament',index:2,floor:2,x:13,y:13,dir:0}});s.flags.percivalLicheDefeated=true;
 const next=act(s,{type:'percivalOath',choice:'accept'});assert.equal(next.flags.wizardApprentice,'retired');assert.equal(next.flags.percivalOath,'accepted');assert.equal(next.flags.wizardForsakenPending,undefined);assert.equal(effectiveAttributes(next,itemById).intelligence,10);assert.equal(effectiveAttributes(next,itemById).strength,12);assert.doesNotThrow(()=>loadGame(saveGame(next)));
});

test('shapeshift uses real time, halves encounters, and does not erase potion shrinking',()=>{
 const original=Date.now;let now=100000;Date.now=()=>now;
 try{let s=wizard();s.level+=6;const chance=wildernessChance(s,1);s=act(s,{type:'wizardShapeshift'});assert.ok(gagActive(s,'tiny'));assert.equal(wildernessChance(s,1),chance/2);
 s.worldTimeMs+=3600000;assert.ok(gagActive(s,'tiny'));now+=30000;assert.equal(gagActive(s,'tiny'),false);
 s.buffExpiry.tiny=s.worldTimeMs+100000;s.flags.wizardApprentice='fallen';assert.ok(gagActive(s,'tiny'));}finally{Date.now=original;}
});
