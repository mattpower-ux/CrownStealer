import {effectiveLevel} from './attributes.js';
export const WIZARD_WAND={id:'wand-apprentice-missiles',name:'Apprentice’s Wand of Magic Missiles',kind:'wand',shape:'wand',spell:'magic-missile',spellItem:true,spellLevel:1,maxCharges:1,unlimited:true,unique:true,notForSale:true,encounterOnly:true,bottomOnly:true,tier:1,rarity:'legendary',value:0,color:'#d7efff',description:'Unlimited Magic Missiles. An apprenticeship gift; never consumes a charge.'};
export const WIZARD_ROBES={id:'apprentice-robes',name:'Apprentice’s Cloth Robes',kind:'armor',material:'cloth',shape:'armor',protection:2,rank:1,tier:1,rarity:'common',unique:true,encounterOnly:true,bottomOnly:true,value:10,color:'#eeeeed',description:'Simple cloth robes suitable for a wizard. Blocks 2 damage.'};
export const WIZARD_FORSAKEN='Your wizard apprenticeship is revoked! The White Wizard takes back your powers. Enjoy being ordinary, you spectacular fool.';
export const isWizard=s=>s?.flags?.wizardApprentice==='accepted';
export const wizardAudienceAvailable=s=>s?.mode==='dungeon'&&s.dungeon?.site==='twinklestar-tower'&&s.dungeon.floor===8&&s.dungeon.x===13&&s.dungeon.y===13&&s.flags?.twinklestarGuardianDefeated&&!s.flags.wizardApprentice;
export function wizardProgress(s){const gainedLevels=isWizard(s)?Math.max(0,effectiveLevel(s)-(s.flags.wizardAcceptedLevel||1)):0;return {gainedLevels,teleport:gainedLevels>=3,shapeshift:gainedLevels>=6,recharge:gainedLevels>=9};}
export const wizardInvisible=(s,now=Date.now())=>isWizard(s)&&(s.flags.wizardTimers?.invisibleUntil||0)>now;
export function wizardGearAllowed(item){
 if(!item)return true;
 if(item.kind==='armor')return item.material?item.material==='cloth':/\b(?:cloth|robes?)\b/i.test(item.name||'');
 if(item.kind!=='weapon')return true;
 const identity=[item.id,item.family,item.shape,item.name].filter(Boolean).join(' ');
 if(/dagger/i.test(identity))return true;
 return !/sword|sabre|saber|blade|axe|cleaver|spear|lance|halberd|scythe|glaive/i.test(identity);
}
export function wizardAction(s,a,note,itemById,{now=Date.now(),canTeleport=true}={}){
 if(a.type==='acknowledgeWizardForsaken'){delete s.flags.wizardForsakenPending;return true;}
 if(a.type==='wizardApprentice'){
  if(!wizardAudienceAvailable(s)||!['accept','reject'].includes(a.choice))return true;
  s.flags.twinklestarWizardRescued=true;s.flags.wizardApprentice=a.choice==='accept'?'accepted':'rejected';
  if(a.choice==='reject'){note(s,'The White Wizard thanks you for his rescue and departs.');return true;}
  s.flags.wizardAcceptedLevel=effectiveLevel(s);s.flags.wizardTimers={};
  if(s.flags.percivalOath==='accepted'){s.flags.percivalOath='retired';note(s,'You retire your paladin calling honorably and begin the study of wizardry.');}
  s.bag.push('dungeon-elevator',WIZARD_WAND.id,WIZARD_ROBES.id);
  if(!wizardGearAllowed(itemById(s.equipped,s)))s.equipped=null;
  s.equippedArmor=WIZARD_ROBES.id;
  note(s,'The White Wizard takes you as his apprentice: +2 Intelligence, +20% scroll and wand damage. He gives you a Dungeon Elevator scroll, cloth robes, and an unlimited Magic Missiles wand. You learn ten-second Invisibility. Teleport, Shapeshift, and Recharge Wand unlock after 3, 6, and 9 more levels.');return true;
 }
 if(!isWizard(s))return !!a.type?.startsWith('wizard');
 if(!['wizardInvisible','wizardTeleport','wizardShapeshift','wizardRecharge'].includes(a.type))return false;
 if(!['world','town','dungeon','battle'].includes(s.mode)||s.flags.royalQuest==='opening')return true;
 const key={wizardInvisible:'invisible',wizardTeleport:'teleport',wizardShapeshift:'shapeshift',wizardRecharge:'recharge'}[a.type],progress=wizardProgress(s);
 if(key!=='invisible'&&!progress[key]){note(s,'This wizard art has not yet been learned. Gain more levels after your apprenticeship.');return true;}
 s.flags.wizardTimers??={};const timers=s.flags.wizardTimers;
 if((timers[key+'ReadyAt']||0)>now){note(s,'That wizard art is recovering. Ready in '+Math.ceil((timers[key+'ReadyAt']-now)/1000)+' seconds.');return true;}
 if(key==='teleport'){
  if(!canTeleport||s.exploration?.area?.startsWith('planet-')||s.dungeon?.ship){note(s,'Your teleport cannot reach a safe town from here.');return true;}
  timers.teleportReadyAt=now+60000;return 'teleport';
 }
 if(key==='recharge'){
  const wand=itemById(a.id,s);
  if(!s.bag.includes(a.id)||wand?.kind!=='wand'||wand.unlimited||!Number.isInteger(wand.charges)||wand.charges>=wand.maxCharges){note(s,'Choose an owned wand with a missing charge.');return true;}
  s.wandCharges[a.id]++;note(s,'You restore one charge to '+wand.name+'.');
 }else if(key==='invisible'){timers.invisibleUntil=now+10000;note(s,'You become invisible for ten real seconds.');}
 else {timers.shapeshiftUntil=now+30000;note(s,'You take mouse form for thirty real seconds: half physical damage and half random encounters.');}
 timers[key+'ReadyAt']=now+60000;return true;
}
export function validWizardState(s){
 if(s.flags?.wizardApprentice===undefined)return true;
 if(!['accepted','rejected','fallen','retired'].includes(s.flags.wizardApprentice))return false;
 if(s.flags.wizardApprentice==='accepted'&&(!Number.isSafeInteger(s.flags.wizardAcceptedLevel)||s.flags.wizardAcceptedLevel<1))return false;
 const pending=s.flags.wizardForsakenPending;if(pending!==undefined&&!(s.flags.wizardApprentice==='fallen'&&pending&&typeof pending.reason==='string'))return false;
 const timers=s.flags.wizardTimers;
 return timers===undefined||timers&&typeof timers==='object'&&!Array.isArray(timers)&&Object.entries(timers).every(([key,n])=>['invisibleUntil','invisibleReadyAt','teleportReadyAt','shapeshiftUntil','shapeshiftReadyAt','rechargeReadyAt'].includes(key)&&Number.isSafeInteger(n)&&n>=0&&n<=1e15);
}

export function revokeWizard(before,s,a,events,note,itemById){
 if(!isWizard(before)||!isWizard(s))return false;
 let reason;
 const outdoors=s.mode==='world'||s.mode==='dungeon'||s.mode==='battle'&&s.returnMode!=='town';
 if(outdoors&&(!wizardGearAllowed(itemById(s.equipped,s))||!wizardGearAllowed(itemById(s.equippedArmor,s))))reason='You left town wearing gear forbidden to wizards.';
 const foe=before.enemy;
 const wizardFoe=foe?.wizard===true||foe?.class==='wizard'||foe?.profession==='wizard'||['wizard','black-wizard','dark-wizard','white-wizard','evil-wizard','wizard-apprentice'].includes(foe?.speciesId);
 if(before.mode==='battle'&&wizardFoe&&events.some(e=>e.kind==='victory'&&e.target==='enemy')&&(s.flags.victories||0)>(before.flags.victories||0))reason='You killed another wizard.';
 if(!before.flags.married&&s.flags.married)reason='You married the princess.';
 if(!reason)return false;
 s.flags.wizardApprentice='fallen';s.flags.wizardForsakenPending={reason};delete s.flags.wizardTimers;
 note(s,WIZARD_FORSAKEN);return true;
}
