import {worldTimeMs} from './world-clock.js';
export const GAG_KEYS=['pigFace','tiny','helium'];
export const gagActive=(s,key)=>(s?.buffExpiry?.[key]||0)>worldTimeMs(s||{});
export const GAG_ITEMS=Object.fromEntries([
 ['potion-unique-looks','Potion of Unique Looks','pigFace',168,'#e7a3ad','Your face becomes a pig’s for one full game week! A wandering merchant in Pelagos, the third region, MIGHT carry a Potion of Cure-All. Bring 5,000 gold.'],
 ['potion-largeness','Potion of Largeness','tiny',3,'#94c976','You shrink to the size of a mouse! Physical weapon damage is halved, random encounters are half as likely, and you can slip under regional gates unnoticed. Lasts three game hours. No cure.'],
 ['potion-helium','Potion of Helium','helium',12,'#e8ce79','Your voice becomes an unbearable squeak. Merchants, guards and other people refuse to do business for twelve game hours. No cure.'],
 ['potion-cure-all','Potion of Cure-All','cureAll',0,'#b6e9e3','Cures a pig face and poison. Cannot cure shrinking or helium.']
].map(([id,name,effect,hours,color,reveal])=>[id,{id,name,kind:'potion',shape:'potion',unique:true,gag:true,rarity:id==='potion-cure-all'?'rare':'common',effect,hours,color,value:id==='potion-cure-all'?5000:50,reveal,description:id==='potion-cure-all'?reveal:'A curious sealed potion. Its label makes no trustworthy promises. Drink to discover its effect.'}]));
export function gagDrop(chance,choice){return chance<.03?['potion-unique-looks','potion-largeness','potion-helium'][Math.min(2,Math.floor(choice*3))]:null;}
export function applyGag(s,item){s.flags['knownGag:'+item.id]=true;if(item.effect==='cureAll'){delete s.buffExpiry.pigFace;s.flags.poisoned=false;s.buffs.poison=0;}else{s.buffExpiry[item.effect]=worldTimeMs(s)+item.hours*3600000;s.flags.gagReveal=item.id;}return item.reveal;}
export const HELIUM_REFUSAL='Why do you sound like a squeaking armpit?';
export const pigFaceSvg='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 40L9 8 39 22M61 22L91 8 82 40" fill="#df9299" stroke="#773f48" stroke-width="3"/><ellipse cx="50" cy="52" rx="39" ry="37" fill="#eeb0ac" stroke="#773f48" stroke-width="3"/><path d="M22 39q10-10 20 0M58 39q10-10 20 0" fill="none" stroke="#773f48" stroke-width="4"/><circle cx="33" cy="44" r="4"/><circle cx="67" cy="44" r="4"/><ellipse cx="50" cy="64" rx="23" ry="17" fill="#d98994" stroke="#773f48" stroke-width="3"/><ellipse cx="41" cy="64" rx="4" ry="6" fill="#773f48"/><ellipse cx="59" cy="64" rx="4" ry="6" fill="#773f48"/></svg>';
