import {effectiveAttributes} from './attributes.js';
import {advanceClock,HOUR_MS} from './world-clock.js';
export const SNARE_CAVE='minor-r0-0';
export const snareEscapeSuccess=(roll,score)=>roll<=score+3;
export function triggerKoboldSnare(before,s,a,note){
 if(s.flags.koboldSnareSpent||s.flags.koboldSnare||s.mode!=='dungeon'||s.dungeon?.minorId!==SNARE_CAVE)return;
 if(!['forward','back','strafe'].includes(a?.type)||s.dungeon.x!==7||s.dungeon.y!==7||before.dungeon?.x===7&&before.dungeon?.y===7)return;
 s.flags.koboldSnare='disarm';s.flags.koboldSnareSpent=true;note(s,'A snare tightens around your ankle. Disarm it before the rope lifts you!');
}
export function koboldSnareAction(s,a,note,random,events,itemById){
 if(!s.flags.koboldSnare)return false;
 if(a.type==='clockTick')return false;
 const fail=(hours)=>{advanceClock(s,hours*HOUR_MS/48);s.turns++;const damage=5+Math.floor(random()*6);s.hp=Math.max(0,s.hp-damage);events.push({kind:'hit',target:'hero',amount:damage,hpAfter:s.hp,sound:'hurt'});return damage;};
 if(a.type==='disarmKoboldSnare'&&s.flags.koboldSnare==='disarm'){
  const roll=1+Math.floor(random()*20),score=effectiveAttributes(s,itemById).dexterity;
  if(snareEscapeSuccess(roll,score)){delete s.flags.koboldSnare;note(s,'Disarmed! Dexterity '+score+' · d20 roll '+roll+'. You step clear of the rope.');}
  else{s.flags.koboldSnare='captive';const damage=fail(8);note(s,'Disarm failed. Dexterity '+score+' · d20 roll '+roll+'. Kobolds dangle you from the ceiling and torment you all night. '+damage+' damage. At dawn, they finally sleep.');}return true;
 }
 const stats={dagger:'dexterity',teeth:'constitution',bathroom:'charisma'};
 if(a.type==='escapeKoboldSnare'&&s.flags.koboldSnare==='captive'&&stats[a.method]){
  const stat=stats[a.method],score=effectiveAttributes(s,itemById)[stat],roll=1+Math.floor(random()*20);
  if(snareEscapeSuccess(roll,score)){delete s.flags.koboldSnare;note(s,'You escape! '+stat+' '+score+' · d20 roll '+roll+'. The kobolds sleep through your departure.');}
  else{const damage=fail(24);note(s,'Escape failed. '+stat+' '+score+' · d20 roll '+roll+'. Another day of insults and starvation: '+damage+' damage. The kobolds fall asleep again.');}return true;
 }
 return true;
}
export function validKoboldSnare(s){return (s.flags.koboldSnareSpent===undefined||typeof s.flags.koboldSnareSpent==='boolean')&&(s.flags.koboldSnare===undefined||['disarm','captive'].includes(s.flags.koboldSnare)&&s.flags.koboldSnareSpent&&s.dungeon?.minorId===SNARE_CAVE&&s.mode==='dungeon');}
