import {DAY_MS} from '../public/game/world-clock.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {cityTick} from '../public/game/city-rule.js';
import {DAY_STEPS} from '../public/game/wild-sites.js';
const owner=()=>{let s=createGame('Mayor');s.mode='town';s.location='mothbridge';s.townPosition={x:6,y:4};s.flags['townGarrison:mothbridge']=true;return act(s,{type:'claimCity'});};
test('city keys require a local victory, persist and cannot reset income or deadlines',()=>{let s=createGame();s.mode='town';s.location='mothbridge';s=act(s,{type:'claimCity'});assert.equal(s.cities.mothbridge,undefined);s=owner();assert.equal(s.cities.mothbridge.claimed,0);s.turns=100;s=act(s,{type:'claimCity'});assert.equal(s.cities.mothbridge.claimed,0);assert.deepEqual(loadGame(saveGame(s)).cities,s.cities);});
test('seven-day tribute, exactly 300 gold payment and monthly income once',()=>{let s=owner();s.worldTimeMs=7*DAY_MS;s.gold=800;s=act(s,{});assert.equal(s.cities.mothbridge.tribute,'demand');s=act(s,{type:'cityPay'});assert.equal(s.gold,500);s.worldTimeMs=30*DAY_MS;s=act(s,{});assert.equal(s.gold,1000);s=act(loadGame(saveGame(s)),{});assert.equal(s.gold,1000);});
test('unresolved demand has one 50 percent burn roll, no income while destroyed, and can rebuild',()=>{for(const roll of [.49,.5]){let s=owner();s.worldTimeMs=10*DAY_MS;let rolls=0;cityTick(s,(s,t)=>s.log.push(t),()=>{rolls++;return roll;});assert.equal(s.cities.mothbridge.destroyed,roll<.5);cityTick(s,()=>{},()=>{rolls++;return 0;});assert.equal(rolls,1);if(roll<.5){s.worldTimeMs=31*DAY_MS;s=act(s,{});assert.equal(s.gold,65);s.x=6;s.y=7;s.gold=600;s=act(s,{type:'cityRebuild'});assert.equal(s.gold,100);assert.equal(s.cities.mothbridge.destroyed,false);}}});
test('two separate level50 heavy guards must be defeated; tribute state survives combat save',()=>{let s=owner();s.worldTimeMs=7*DAY_MS;s=act(s,{});for(let i=0;i<2;i++){s=act(s,{type:'cityFight'});assert.equal(s.enemy.level,50);assert.equal(s.enemy.armor,45);s=loadGame(saveGame(s));s.enemy.hp=1;s=act(s,{type:'attack'});assert.equal(s.mode,'town');assert.equal(s.cities.mothbridge.guards,i+1);}assert.equal(s.cities.mothbridge.tribute,'refused');});
test('free house admits a penniless owner and disputes repeat without income or item duplication',()=>{let s=owner();s.gold=0;s.hp=1;s=act(s,{type:'cityRest'});assert.equal(s.mode,'town');assert.equal(s.hp,s.maxHp);assert.equal(s.turns,1);assert.equal(s.cities.mothbridge.case,0);s=act(s,{type:'cityDispute',choice:0});assert.equal(s.cities.mothbridge.disputes,1);s=act(s,{type:'cityDispute',choice:0});assert.equal(s.cities.mothbridge.disputes,1);});

test('refusal locks out 300 gold; only the full royal payment guarantees safety and persists',()=>{
 let s=owner();s.worldTimeMs=7*DAY_MS;s.gold=999;s=act(s,{});s=act(s,{type:'cityRefuse'});const deadline=s.cities.mothbridge.deadline;
 s=act(s,{type:'cityPay'});assert.equal(s.gold,999);assert.equal(s.cities.mothbridge.tribute,'refused');
 s=act(s,{type:'cityRoyalPayment'});assert.equal(s.gold,999);assert.equal(s.cities.mothbridge.tribute,'refused');
 s.gold=1200;s=act(loadGame(saveGame(s)),{type:'cityRoyalPayment'});assert.equal(s.gold,200);assert.equal(s.cities.mothbridge.tribute,'pardoned');
 s=act(s,{type:'cityRoyalPayment'});assert.equal(s.gold,200);s=loadGame(saveGame(s));s.worldTimeMs=deadline*DAY_MS;cityTick(s,()=>{},()=>{throw Error('A pardoned town must not roll for fire');});assert.equal(s.cities.mothbridge.destroyed,false);
});
test('killing guards after refusal cannot prevent the burn roll or spawn a third guard',()=>{
 let s=owner();s.worldTimeMs=7*DAY_MS;s=act(s,{});s=act(s,{type:'cityRefuse'});
 for(let i=0;i<2;i++){s=act(s,{type:'cityFight'});s.enemy.hp=1;s=act(s,{type:'attack'});}
 assert.equal(s.cities.mothbridge.tribute,'refused');s=act(s,{type:'cityFight'});assert.equal(s.mode,'town');s.worldTimeMs=10*DAY_MS;cityTick(s,()=>{},()=>0);assert.equal(s.cities.mothbridge.destroyed,true);
});
test('royal pardon cannot be bought at or after the fire deadline',()=>{
 let s=owner();s.worldTimeMs=7*DAY_MS;s=act(s,{});s=act(s,{type:'cityRefuse'});s.gold=2000;s.worldTimeMs=10*DAY_MS;s=act(s,{type:'cityRoyalPayment'});assert.equal(s.gold,2000);assert.equal(s.cities.mothbridge.tribute,'resolved');
});


test('governor palace needs five successive guards and saves between opponents',()=>{
 let s=createGame();s.mode='town';s.location='mothbridge';s=act(s,{type:'challenge'});
 for(let i=1;i<=5;i++){
  assert.equal(s.mode,'battle');s.enemy.hp=1;s=act(s,{type:'attack'});
  assert.equal(s.flags['palaceWins:mothbridge'],i);
  assert.equal(!!s.flags['townGarrison:mothbridge'],i===5);
  s=loadGame(saveGame(s));
 }
 assert.equal(s.mode,'town');s=act(s,{type:'claimCity'});assert.ok(s.cities.mothbridge);
});
test('retreat or defeat resets a governor palace attempt',()=>{
 for(const action of ['flee','guard']){
  let s=createGame();s.mode='town';s.location='mothbridge';s=act(s,{type:'challenge'});
  s.enemy.hp=1;s=act(s,{type:'attack'});assert.equal(s.flags['palaceWins:mothbridge'],1);
  if(action==='guard'){s.hp=1;s.enemy.attack=1000;}
  s=act(s,{type:action});assert.equal(s.flags['palaceWins:mothbridge'],undefined);assert.ok(!s.flags['townGarrison:mothbridge']);
 }
});
test('royal castle still requires twenty victories',()=>{
 let s=createGame();s.mode='town';s.location='bellwether';
 for(let i=1;i<=20;i++){s=act(s,{type:'challenge'});s.enemy.hp=1;s.rng=1;s=act(s,{type:'attack'});assert.equal(!!s.flags['garrison:0'],i===20);}
});

test('palace defeat halves gold and imposes a persistent local 5000 gold entrance payment',()=>{
 let s=createGame();s.mode='town';s.location='mothbridge';s.gold=10001;s=act(s,{type:'challenge'});s.hp=1;s.enemy.attack=1000;s=act(s,{type:'guard'});
 assert.equal(s.gold,5000);assert.equal(s.mode,'world');assert.equal(s.location,null);assert.equal(s.x,5);assert.equal(s.y,7);
 s=loadGame(saveGame(s));assert.equal(s.flags['palaceBan:mothbridge'],true);
 s.x=6;s=act(s,{type:'enter'});assert.equal(s.mode,'world');
 s.gold=4999;s=act(s,{type:'payGovernor'});assert.equal(s.gold,4999);assert.equal(s.flags['palaceBan:mothbridge'],true);
 s.gold=5001;s=act(s,{type:'payGovernor'});assert.equal(s.gold,1);assert.equal(s.flags['palaceBan:mothbridge'],undefined);
 s=act(s,{type:'payGovernor'});assert.equal(s.gold,1);s=act(s,{type:'enter'});assert.equal(s.mode,'town');
});
