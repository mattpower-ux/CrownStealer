import {effectiveLevel} from './attributes.js';

export const HORN_OF_HELP={id:'horn-of-help',name:'Horn of Help',kind:'curio',shape:'horn',rarity:'epic',unique:true,bottomOnly:true,encounterOnly:true,notForSale:true,value:0,color:'#c1e5e0',description:'This fallen hero’s horn holds only three calls. Use during combat to summon the hero’s ghost for the whole fight. The ghost strikes alongside each weapon attack, even when your own attack misses. Each new battle requires another call.'};

export function grantHornOfHelp(s){
  if(s.flags.hornHelpCharges!==undefined||s.bag.includes(HORN_OF_HELP.id))return false;
  s.bag.push(HORN_OF_HELP.id);s.flags.hornHelpCharges=3;return true;
}

export function strikeHeroGhost(s,events,note){
  if(!s.enemy?.heroGhost||s.enemy.hp<=0)return;
  const amount=6+2*effectiveLevel(s);
  s.enemy.hp-=amount;
  const message='The hero’s ghost strikes for '+amount+' damage.';
  note(s,message);events.push({kind:'hit',target:'enemy',amount,sound:'magic',heroGhost:true,message});
}
