import {evilEmpowered, purifyEvilRoute} from './evil-route.js';

export const PURITY_MOUNTAIN={id:'white-mountain-purity',kind:'purity',name:'White Mountain of Purity',region:3,x:64,y:8};
export const RED_GLOBE_SHRINE_ID='minor-r0-10';
export const isMossyGlobeShrine=d=>d?.site==='minor-site'&&d.minorId===RED_GLOBE_SHRINE_ID;
export const nearRedGlobe=s=>s.mode==='dungeon'&&isMossyGlobeShrine(s.dungeon)&&s.dungeon.secretRoom&&Math.abs(s.dungeon.x-1)+Math.abs(s.dungeon.y-8)<=1;
export const cursedByGlobe=s=>evilEmpowered(s);
export function redGlobeAction(s,a,note){
 if(a.type==='touchRedGlobe'){
  if(!nearRedGlobe(s)||s.flags.redGlobeSworn||cursedByGlobe(s)||s.flags.redGlobePurified)return true;
  s.flags.redGlobeSworn=true;
  note(s,'“Attack the next guard you meet, and I shall grant you the powers of a god!”');return true;
 }
 if(a.type==='purifyRedGlobe'){
  if(s.mode!=='world'||s.exploration?.area||s.region!==3||s.x!==64||s.y!==8||!cursedByGlobe(s))return true;
  purifyEvilRoute(s,note);return true;
 }
 return false;
}
export function fulfillRedGlobe(before,s,a,events,note){
 if(!before.flags?.redGlobeSworn||cursedByGlobe(before)||!s.enemy?.guard&&!before.enemy?.guard)return;
 const opening=before.mode!=='battle'&&s.mode==='battle'&&['attackCastleGuard','fightGuards','challengeGarrison','attackGuard','gossipGuardAttack','challengeGate','challenge'].includes(a?.type);
 const strike=before.mode==='battle'&&before.enemy?.guard&&['attack','useMagic','useItem'].includes(a?.type)&&events.some(e=>e.target==='enemy'&&['hit','miss','magic'].includes(e.kind));
 if(!opening&&!strike)return;
 s.flags.redGlobeCurse=true;s.evilRoute={version:1,phase:'empowered'};s.alignment=-100;
 note(s,'The globe keeps its promise. +10 Strength! Your soul turns EVIL. Huge red horns tear skyward. Seek the White Mountain of Purity in the far north.');
 events.push({kind:'redGlobeCurse',sound:'magic',message:s.log.at(-1)});
}
export function validRedGlobe(s){return ['redGlobeCurse','redGlobeSworn','redGlobePurified'].every(k=>s.flags[k]===undefined||typeof s.flags[k]==='boolean')&&(!cursedByGlobe(s)||s.flags.redGlobeSworn===true);}
