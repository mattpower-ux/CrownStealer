import {minorSiteDefinition} from './minor-sites.js';
export const KERRBEAR_TOOTH={id:'kerrbear-tooth',name:'Lucky Beartooth Amulet',kind:'necklace',shape:'necklace',rarity:'rare',unique:true,bottomOnly:true,notForSale:true,tier:1,value:200,color:'#ddd3aa',description:'Wear it and call “Kerrbear” three times during a battle. The level-15 bear fights beside you for that battle. Only one summon.'};
export const isSplitRock=d=>d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.name==='Split Rock Cave';
export const nearKerrbear=s=>s.mode==='dungeon'&&isSplitRock(s.dungeon)&&!s.flags.kerrbearDefeated&&Math.abs(s.dungeon.x-13)+Math.abs(s.dungeon.y-13)<=2;
export function kerrbearAction(s,a,note){
 if(a.type==='callKerrbear'){
  if(s.mode!=='battle'||s.equippedNecklace!==KERRBEAR_TOOTH.id||!s.bag.includes(KERRBEAR_TOOTH.id)||s.flags.kerrbearSummoned||s.enemy?.kerrbear){note(s,'Wear the Lucky Beartooth Amulet during a battle to call Kerrbear.');return true;}
  s.flags.kerrbearCalls=(s.flags.kerrbearCalls||0)+1;note(s,'“Kerrbear!” · '+s.flags.kerrbearCalls+' of 3 calls.');
  if(s.flags.kerrbearCalls===3){s.flags.kerrbearSummoned=true;delete s.flags.kerrbearCalls;s.enemy.kerrbearAlly=true;note(s,'Kerrbear answers your third call! The level-15 armored bear fights beside you. The amulet’s one summon is spent.');}return true;
 }
 if(!['feedKerrbear','attackKerrbear'].includes(a.type))return false;
 if(!nearKerrbear(s))return true;
 if(a.type==='feedKerrbear'){
  if(s.flags.kerrbearFed){note(s,'Kerrbear and his three cubs remember your kindness.');return true;}
  if(s.flags.kerrbearHostile){note(s,'Kerrbear no longer trusts you.');return true;}
  if(s.meals<1){note(s,'You have no food to share.');return true;}
  s.meals--;s.flags.kerrbearFed=true;s.bag.push(KERRBEAR_TOOTH.id);s.pendingLoot.push(KERRBEAR_TOOTH.id);note(s,'Kerrbear shares your food with his three cubs and gives you a Lucky Beartooth Amulet.');return true;
 }
 s.flags.kerrbearHostile=true;const hp=250;s.enemy={speciesId:'kerrbear',name:'Kerrbear',level:15,hp,maxHp:hp,attack:38,armor:10,gold:0,xp:150,kind:'brute',weakness:'guard then counter',firstContact:true,combatDistance:1,kerrbear:true,art:{sheet:'andros',index:0}};s.returnMode='dungeon';s.mode='battle';note(s,'Kerrbear roars and defends his cubs!');return true;
}
export function kerrbearStrike(s,events,note){if(!s.enemy?.kerrbearAlly||s.enemy.hp<=0)return;const amount=Math.max(8,30-Math.floor(s.enemy.armor||0));s.enemy.hp-=amount;const message='Kerrbear mauls your foe for '+amount+' damage.';note(s,message);events.push({kind:'hit',target:'enemy',amount,sound:'hit',message});}
