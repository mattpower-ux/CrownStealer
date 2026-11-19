import {evilEmpowered} from './evil-route.js';

const text=enemy=>`${enemy?.species||''} ${enemy?.speciesId||''} ${enemy?.name||''}`.toLowerCase();
const named=(enemy,words)=>words.some(word=>text(enemy).includes(word));

export const evilFearEligible=enemy=>!!enemy&&!enemy.boss&&!enemy.construct&&!enemy.mindless
  &&!named(enemy,['construct','golem','automaton','sentinel']);

export function evilFearChance(state,enemy){
 if(!evilEmpowered(state)||!evilFearEligible(enemy))return 0;
 const difference=(enemy.level||1)-(state.level||1);
 return difference<=0?.30:Math.max(0,(20-difference)/100);
}

export function evilCreatureDisposition(state,enemy,context={}){
 if(!evilEmpowered(state)||context.provoked||context.storyHostile||enemy?.guard||enemy?.boss)return 'hostile';
 if(enemy?.animal||enemy?.alien||named(enemy,['alien','beast','wolf','bear','rat','eel','crab','squid','kraken','horse','unicorn']))return 'hostile';
 if(enemy?.undead||named(enemy,['goblin','orc','troll','undead','skeleton','zombie','vampire','liche','lich','wraith','ghost']))return 'neutral';
 return 'hostile';
}

export function evilFearStopsTurn(state,enemy,random){
 const chance=evilFearChance(state,enemy);
 return chance>0&&random()<chance;
}
