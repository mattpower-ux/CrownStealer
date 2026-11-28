import test from 'node:test';
import assert from 'node:assert/strict';
import {evilCreatureDisposition,evilRecognitionLine} from '../public/game/evil-disposition.js';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {SIDE_QUESTS} from '../public/game/content.js';
import {oddJobsView} from '../public/game/odd-jobs-view.js';
import {startBridgeTroll,bridgeTrollAction} from '../public/game/bridge-trolls.js';

const evil={flags:{redGlobeCurse:true},evilRoute:{version:1,phase:'empowered'}};
test('evil creatures stand down while animals and aliens remain hostile',()=>{
 for(const enemy of [{species:'goblin'},{species:'orc'},{species:'troll'},{undead:true}])assert.equal(evilCreatureDisposition(evil,enemy,{}),'neutral');
 for(const enemy of [{animal:true},{alien:true}])assert.equal(evilCreatureDisposition(evil,enemy,{}),'hostile');
});
test('direct attacks provoke enemies while scripted evil encounters remain peaceful',()=>{
 const goblin={species:'goblin'};
 assert.equal(evilCreatureDisposition(evil,goblin,{provoked:true}),'hostile');
 assert.equal(evilCreatureDisposition(evil,goblin,{storyHostile:true}),'neutral');
 assert.equal(evilCreatureDisposition({},goblin,{}),'hostile');
});
test('maximum evil alignment alone makes trolls, goblins, orcs and undead nonaggressive',()=>{
 const s=createGame();s.alignmentPoints=0;s.alignment=-100;s.flags.evilAlignmentLocked=true;
 for(const enemy of [{speciesId:'bridge-troll'},{speciesId:'cave-goblin'},{speciesId:'orc-raider'},{undead:true,name:'Skeleton'},{speciesId:'rock-troll',boss:true},{speciesId:'lesser-demon'},{speciesId:'sooty-imp'},{speciesId:'pit-devil'}])assert.equal(evilCreatureDisposition(s,enemy,{storyHostile:true}),'neutral');
 for(const enemy of [{animal:true,name:'Wolf'},{name:'Human Guard',guard:true},{name:'Dwarf Miner'},{name:'Elf Ranger'},{alien:true,name:'Alien'}])assert.equal(evilCreatureDisposition(s,enemy),'hostile');
});
test('a bridge troll lets a maximally evil traveler pass without a toll or ambush',()=>{
 const s=createGame();s.alignmentPoints=0;s.alignment=-100;s.flags.evilAlignmentLocked=true;
 const gold=s.gold,notes=[];startBridgeTroll(s,'r0:80:14',(_s,line)=>notes.push(line));
 assert.equal(s.flags.bridgeTroll,undefined);assert.equal(s.gold,gold);
 assert.ok(s.flags.bridgeTrollPaid.includes('r0:80:14'));
 assert.match(notes.at(-1),/waves you across/);
 const pending=createGame();pending.alignmentPoints=0;pending.alignment=-100;pending.flags.evilAlignmentLocked=true;
 pending.flags.bridgeTroll={key:'r0:80:21',x:pending.x,y:pending.y,backX:pending.x-1,backY:pending.y,toll:500};
 bridgeTrollAction(pending,{type:'bridgeTroll',choice:'sleep'},(_s,line)=>notes.push(line));
 assert.equal(pending.mode,'world');assert.equal(pending.enemy,null);
});
test('a saved bridge troll encounter yields on reload for a maximally evil player',()=>{
 let s=createGame();s.alignmentPoints=0;s.alignment=-100;s.flags.evilAlignmentLocked=true;
 s.mode='battle';s.returnMode='world';s.enemy={speciesId:'bridge-troll',name:'Bridge Troll',level:4,hp:90,maxHp:90,attack:12,armor:3,gold:500,xp:55,kind:'brute',weakness:'quick strikes',firstContact:true,bridgeTrollKey:'r0:80:14'};
 s=loadGame(saveGame(s));
 assert.equal(s.mode,'world');assert.equal(s.enemy,null);
 assert.ok(s.flags.bridgeTrollPaid.includes('r0:80:14'));
 assert.match(s.log.at(-1),/stands aside/);
});
test('a troll defends itself if the evil player explicitly starts a fight',()=>{
 const s=createGame();s.alignmentPoints=0;s.alignment=-100;s.flags.evilAlignmentLocked=true;
 s.flags.bridgeTroll={key:'r0:80:21',x:s.x,y:s.y,backX:s.x-1,backY:s.y,toll:500};
 bridgeTrollAction(s,{type:'bridgeTroll',choice:'fight'},()=>{});
 assert.equal(s.enemy.provoked,true);
 assert.equal(loadGame(saveGame(s)).mode,'battle');
});
test('an imp apologizes to its evil master instead of attacking',()=>{
 const imp={speciesId:'sooty-imp',name:'Sooty Imp'};
 assert.equal(evilRecognitionLine(imp),'"Oh, so sorry master. I didn\'t recognize you."');
});
test('unconquered towns refuse max-evil trade, lodging and odd jobs; conquered towns serve their ruler',()=>{
 const base=createGame();base.mode='town';base.location='mothbridge';base.gold=1000;base.alignmentPoints=0;base.alignment=-100;base.flags.evilAlignmentLocked=true;
 const job=SIDE_QUESTS.find(q=>q.town==='mothbridge'&&q.need==='gold');
 for(const action of [{type:'buy',item:'food'},{type:'buyItem',id:'torch'},{type:'sellItem',id:'road-sword'},{type:'rest'},{type:'quest',id:job.id}]){
  const s=structuredClone(base);s.townPosition={x:action.type==='rest'?3:9,y:5};
  const after=act(s,action);
  assert.equal(after.gold,s.gold,action.type);assert.equal(after.hp,s.hp,action.type);
  assert.match(after.log.at(-1),/refuses|shuts the door|No one will offer/,action.type);
 }
 assert.match(oddJobsView(base,null,()=>'',String),/No one will offer odd jobs/);
 const owned=structuredClone(base);owned.cities.mothbridge={claimed:0,paidThrough:0,tribute:'waiting',deadline:10,guards:0,destroyed:false,disputes:0,case:null};owned.townPosition={x:3,y:5};
 const rested=act(owned,{type:'rest'});assert.equal(rested.gold,992);assert.equal(rested.hp,rested.maxHp);
});
