import {effectiveAttributes} from './attributes.js';
import {SPELLS} from './spell-items.js';
import {beansBlocksEnemy,tickBeansRound} from './bucket-beans.js';
import {spendPoisonRound} from './weapon-poisons.js';
export const isDungeonCombat=s=>s?.mode==='battle'&&s.returnMode==='dungeon'&&!!s.dungeon&&!!s.enemy;
export const battlefieldDistance=s=>isDungeonCombat(s)?s.enemy.combatDistance??1:1;
export const isBow=item=>item?.kind==='weapon'&&['bow','crossbow'].includes(item.family||item.shape);
export const enemyCanShoot=e=>!!e&&(e.ranged===true||['ranged','magic','mental'].includes(e.attackType)||e.kind==='caster'||e.royalDungeonNpc==='royal-heckler');
export const dexterityModifier=dex=>Math.floor((dex-10)/2);
export function initializeDungeonCombat(s,random){
 if(!isDungeonCombat(s)||s.enemy.combatDistance!==undefined)return;
 s.enemy.combatDistance=2+Math.floor(random()*3);
 s.enemy.surpriseShotsRemaining=s.enemy.surprised||random()<.2?2:0;
 delete s.enemy.surprised;
}
export function validDungeonCombatState(s){
 const e=s.enemy;if(!e)return true;
 if(e.combatDistance!==undefined&&(!isDungeonCombat(s)||!Number.isInteger(e.combatDistance)||e.combatDistance<1||e.combatDistance>4))return false;
 if(e.surpriseShotsRemaining!==undefined&&(!isDungeonCombat(s)||!Number.isInteger(e.surpriseShotsRemaining)||e.surpriseShotsRemaining<0||e.surpriseShotsRemaining>2))return false;
 return e.dexterity===undefined||Number.isFinite(e.dexterity)&&e.dexterity>=1&&e.dexterity<=100;
}
// Synchronous, scoped capture: trial actions mutate only their structured clone.
// It lets invalid/empty/level-locked items remain free without maintaining a second
// item rules engine. Actual enemy actions run once, in the rolled initiative order.
let captured=null;
export function deferDungeonEnemyTurn(s,defending,events,multiplier,keepCoating){
 if(!captured||s.mode!=='battle')return false;
 captured.response={defending,multiplier,keepCoating};return true;
}
function capture(execute,input,action,events){const previous=captured,ctx={response:null};captured=ctx;try{return {state:execute(input,action,events),response:ctx.response};}finally{captured=previous;}}
const offensiveEvent=e=>e.target==='enemy'&&['hit','miss','magic','explosion','stun','taunt'].includes(e.kind);
function offensiveShot(s,a,events,itemById){
 if(!events.some(offensiveEvent))return false;
 if(a.type==='attack')return isBow(itemById(s.equipped,s));
 if(!['useItem','useMagic'].includes(a.type))return false;
 const item=itemById(a.type==='useMagic'?s.equippedMagic:a.id,s);
 return item?.kind==='wand'&&(!!SPELLS[item.spell]?.damage||['vaporize','incinerate'].includes(item.spell));
}
export function resolveDungeonCombatAction(input,action,events,{execute,enemyTurn,random,note,itemById}){
 const dungeon=isDungeonCombat(input),beans=!!input.flags?.beansRounds,beanAction=action?.type==='eatBeans'||action?.type==='useItem'&&action.id==='bucket-of-beans';
 if(input.mode!=='battle'||!dungeon&&!beans&&!beanAction)return execute(input,action,events);
 const a=action||{},trialEvents=[],trial=capture(execute,input,a,trialEvents);
 const consumes=!!trial.response||trialEvents.some(e=>offensiveEvent(e)||['retreat','beans'].includes(e.kind));
 if(!consumes){events.push(...trialEvents);return trial.state;}
 const activation=beanAction&&trial.state.bag.filter(id=>id==='bucket-of-beans').length<input.bag.filter(id=>id==='bucket-of-beans').length;
 const gasBlocked=beansBlocksEnemy(input)&&trialEvents.some(offensiveEvent);
 const intended=gasBlocked?{type:'beansWait'}:a;
 const start=structuredClone(input);if(dungeon){start.enemy.combatDistance??=1;start.enemy.surpriseShotsRemaining??=0;delete start.enemy.surprised;}
 const freeShot=dungeon&&!gasBlocked&&start.enemy.surpriseShotsRemaining>0&&offensiveShot(input,a,trialEvents,itemById);
 let playerFirst=true;
 if(dungeon&&!freeShot){const playerRoll=1+Math.floor(random(start)*20),enemyRoll=1+Math.floor(random(start)*20),playerTotal=playerRoll+dexterityModifier(effectiveAttributes(start,itemById).dexterity),enemyTotal=enemyRoll+dexterityModifier(start.enemy.dexterity??10);playerFirst=playerTotal>=enemyTotal;events.push({kind:'initiative',target:playerFirst?'hero':'enemy',amount:0,playerRoll,enemyRoll,playerTotal,enemyTotal,message:'Initiative: you '+playerTotal+' ('+playerRoll+' on d20), '+start.enemy.name+' '+enemyTotal+'. '+(playerFirst?'You act first.':'Your foe acts first.')});}
 const respond=(state,response={})=>{
  if(state.mode!=='battle'||!state.enemy)return;
  if(beansBlocksEnemy(state)){note(state,'The living foe recoils from the gas and cannot attack.');events.push({kind:'gas',target:'enemy',amount:0,message:'The gas keeps the enemy away.'});return;}
  if(state.enemy.frozen>0||state.enemy.luteNumb>0||state.flags.clockStopped>0){enemyTurn(state,!!response.defending,events,response.multiplier??1,true);return;}
  const oldDistance=battlefieldDistance(state),shoots=enemyCanShoot(state.enemy);
  if(dungeon&&oldDistance>1){state.enemy.combatDistance=oldDistance-1;events.push({kind:'approach',target:'enemy',amount:0,distance:oldDistance-1,sound:'step',message:state.enemy.name+' closes to '+(oldDistance-1)+' tile'+(oldDistance===2?'':'s')+'.'});if(!shoots)return;}
  const first=events.length;enemyTurn(state,!!response.defending,events,response.multiplier??1,true);
  if(dungeon&&shoots&&oldDistance>1)for(const e of events.slice(first))if(e.target==='hero'&&['hit','block','miss'].includes(e.kind))e.projectile=e.mental?'psychic':state.enemy?.kind==='caster'?'magic':'arrow';
 };
 const finishRound=(state,keepCoating=false)=>{if(!keepCoating&&spendPoisonRound(state))note(state,'Your weapon poison wears off.');if(beans&&!activation)tickBeansRound(state,note);return state;};
 if(!playerFirst){respond(start,trial.response||{});if(start.mode!=='battle'||!start.enemy||start.hp<=0){return finishRound(start,trial.response?.keepCoating);}}
 if(gasBlocked)note(start,'The living foe has fled beyond your attack. Wait for the fumes to clear; no item is spent.');
 let playerEvents=[],result=capture(execute,start,intended,playerEvents);
 // Initiative changes the random stream: a trial fear/stun failure can become a
 // real attack. Recheck the actual result before committing any damage or charge.
 if(beansBlocksEnemy(start)&&(playerEvents.some(offensiveEvent)||result.state.enemy?.hp<start.enemy.hp)){
  playerEvents=[];result=capture(execute,start,{type:'beansWait'},playerEvents);
  note(result.state,'The living foe has fled beyond your attack. No item is spent.');
 }
 const state=result.state;events.push(...playerEvents);
 if(freeShot){if(isDungeonCombat(state)){state.enemy.surpriseShotsRemaining=Math.max(0,state.enemy.surpriseShotsRemaining-1);note(state,'Surprise shot! '+state.enemy.surpriseShotsRemaining+' free ranged shot'+(state.enemy.surpriseShotsRemaining===1?'':'s')+' remain.');}}
 else if(playerFirst&&state.mode==='battle'&&state.enemy&&!playerEvents.some(e=>e.kind==='victory'))respond(state,result.response||trial.response||{});
 return finishRound(state,result.response?.keepCoating||trial.response?.keepCoating);
}
