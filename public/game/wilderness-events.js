import {rareGearEffect} from './rare-gear.js';
export const WILDERNESS_EVENT_CHANCE=.003;
export const WILDERNESS_EVENTS=['nail','hole','branch','hoard','bawb'];
const roll=(random,min,max)=>min+Math.floor(random()*(max-min+1));
function hurt(s,damage,{note,recover},message){s.hp=Math.max(0,s.hp-damage);note(s,message+' '+damage+' damage.');if(!s.hp){delete s.flags.impaledMoves;delete s.flags.wildernessEvent;recover(s);return false;}return true;}
export function startWildernessEvent(s,kind,ctx){
 const {note,random,enterCrypt}=ctx;
 if(kind==='nail')hurt(s,roll(random,5,10),ctx,'You step on a rusty nail. Piercing pain!');
 if(kind==='hole'&&hurt(s,roll(random,20,50),ctx,'The ground gives way beneath you.')){note(s,'You tumble into a crypt. Something dead guards a glittering chest.');enterCrypt(s);}
 if(kind==='branch'){s.flags.impaledMoves=10;note(s,'A tree branch impales you! Ten movements are needed to pull yourself free.');}
 if(kind==='hoard'){s.flags.wildernessEvent={kind};note(s,'You find a buried hoard of coins. Take it, or leave it?');}
 if(kind==='bawb'){s.flags.wildernessEvent={kind};note(s,'Bawb the Boatbuilder offers you coffee and unrolls plans for a deluxe sailboat for one. Only 700 gold—and it shrinks to fit in your inventory!');}
}
export function wildernessEventAction(s,a,ctx){
 if(s.mode!=='world')return false;
 const {note,random}=ctx;
 if(s.flags.impaledMoves&&['move','mapStep'].includes(a.type)){
  s.flags.impaledMoves--;s.turns++;hurt(s,roll(random,1,10),ctx,'You struggle against the branch.');
  if(!s.flags.impaledMoves){delete s.flags.impaledMoves;if(s.hp>0)note(s,'At last, you pull yourself free.');}return true;
 }
 const event=s.flags.wildernessEvent;
 if(!event)return false;
 if(a.type!=='wildernessChoice')return ['move','mapStep','enter'].includes(a.type);
 if(a.choice==='leave'){delete s.flags.wildernessEvent;note(s,'You continue along your way.');return true;}
 if(event.kind==='bawb'&&a.choice==='buy'){
  if(s.bag.includes('shrinkable-sailboat')){delete s.flags.wildernessEvent;note(s,'Bawb admires the sailboat you already own.');return true;}
  if(s.gold<700){note(s,'Bawb needs the full 700 gold. The coffee, however, is free.');return true;}
  s.gold-=700;s.bag.push('shrinkable-sailboat');s.pendingLoot.push('shrinkable-sailboat');delete s.flags.wildernessEvent;note(s,'Bawb hands over your shrinkable sailboat. Use it from your inventory beside the water.');return true;
 }
 if(event.kind==='hoard'&&a.choice==='take'){
  delete s.flags.wildernessEvent;
  if(random()<.5){const gold=roll(random,50,100);s.gold+=gold;note(s,'The hoard is real! You find '+gold+' gold.');if(random()<.5){s.bag.push('small-emerald');s.pendingLoot.push('small-emerald');note(s,'A small emerald gleams beneath the coins.');}}
  else if(rareGearEffect(s,'disarmBonus')>0&&random()<rareGearEffect(s,'disarmBonus'))note(s,'You spot the bait and disarm the hidden trap.');
  else hurt(s,roll(random,5,10),ctx,'The glittering coins are bait. A hidden trap snaps shut!');return true;
 }
 return true;
}
export function validateWildernessEvents(s){
 if(s.flags.impaledMoves!==undefined&&(!Number.isInteger(s.flags.impaledMoves)||s.flags.impaledMoves<1||s.flags.impaledMoves>10))throw Error('Invalid branch injury.');
 if(s.flags.wildernessEvent!==undefined&&!['hoard','bawb'].includes(s.flags.wildernessEvent?.kind))throw Error('Invalid wilderness event.');
}
