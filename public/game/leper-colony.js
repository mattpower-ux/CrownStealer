import {DAY_MS,worldTimeMs} from './world-clock.js';
export const LEPER_COLONY={id:'leper-colony',kind:'leperColony',region:0,x:28,y:28,name:'Leper Colony'};
export const atLeperColony=s=>s?.mode==='world'&&!s.exploration?.area&&s.region===LEPER_COLONY.region&&s.x===LEPER_COLONY.x&&s.y===LEPER_COLONY.y;
export const whiteWizardCanCure=s=>!!s?.flags?.leprosy&&s.mode==='dungeon'&&s.dungeon?.site==='twinklestar-tower'&&s.dungeon.floor===8&&s.dungeon.x===13&&s.dungeon.y===13&&!!s.flags.twinklestarGuardianDefeated;
export const COLONY_GREETING='The priest welcomes you with a kind, concerned smile. “Rest here, traveler. A donation of one gold lets me tend your wounds, up to half your full health. You may return whenever you need us.”';
export const LEPROSY_RUMOR='You have contracted leprosy. The priest looks concerned: “I cannot cure this illness. They say only the White Wizard of Twinklestar Tower can.”';
export function colonyAction(s,a,{random,note,events=[]}){
 if(a.type==='cureLeprosy'){
  if(whiteWizardCanCure(s)){
   const price=leprosyCurePrice(s);
   if(s.gold<price){note(s,'The White Wizard asks 5,000 gold to cure leprosy. Bring enough gold, or become his apprentice.');return true;}
   s.gold-=price;delete s.flags.leprosy;delete s.flags.leprosySince;
   note(s,'The White Wizard lays a gentle hand upon you and permanently cures your leprosy. Your lost charisma returns.'+(price?' The cure costs 5,000 gold.':' As his apprentice, you pay nothing.'));
  }
  return true;
 }
 if(a.type!=='colonyHealing')return false;
 if(!atLeperColony(s))return true;
 const cap=Math.floor(s.maxHp/2);
 if(s.hp>=cap){note(s,'“You are already as well as my modest care can make you,” the priest says kindly. “Keep your gold. Come back whenever you need us.”');return true;}
 if(s.gold<1){note(s,'The priest looks concerned. “Our supplies are scarce. Please return with one gold for your treatment.”');return true;}
 const healed=cap-s.hp;s.gold--;s.hp=cap;events.push({kind:'heal',target:'hero',amount:healed,message:'The priest restores '+healed+' health.'});
 note(s,'For one gold, the priest tends your wounds and restores '+healed+' health. You may return whenever you need care.');
 if(random()<.01&&!s.flags.leprosy){s.flags.leprosy=true;s.flags.leprosySince=worldTimeMs(s);note(s,LEPROSY_RUMOR);}
 return true;
}
export const leprosyCurePrice=s=>s.flags?.wizardApprentice==='accepted'?0:5000;
export function prepareLeprosy(s){if(s.flags?.leprosy&&s.flags.leprosySince===undefined)s.flags.leprosySince=worldTimeMs(s);}
export const leprosyCharismaLoss=s=>s.flags?.leprosy?Math.max(0,Math.floor((worldTimeMs(s)-(s.flags.leprosySince??worldTimeMs(s)))/(7*DAY_MS))):0;
