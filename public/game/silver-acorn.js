import {worldTimeMs,DAY_MS} from './world-clock.js';
import {shrineForDungeon,shrineAudienceAvailable} from './shrine-deities.js';
import {adjustAlignment} from './alignment.js';
export const SILVER_ACORN={id:'silver-acorn',name:'Silver Acorn',kind:'special',shape:'seed',rarity:'rare',unique:true,notForSale:true,bottomOnly:true,value:0,description:'Plant in the wilderness. After three game days, its tree grants full healing to all who ask.'};
export function silverTree(s){const t=s.flags?.silverTree;return t&&t.region===s.region&&t.area===(s.exploration?.area??null)?{...t,id:'silver-healing-tree',kind:'silverTree',name:worldTimeMs(s)-t.plantedAt>=3*DAY_MS?'Silver Healing Tree':'Silver Sapling'}:null;}
export const atSilverTree=s=>{const t=silverTree(s);return s.mode==='world'&&t&&t.x===s.x&&t.y===s.y;};
export function silverAcornAction(s,a,note){
 if(a.type==='ssethTribute'){
  if(!shrineAudienceAvailable(s)||shrineForDungeon(s.dungeon)?.id!=='sseth'||!['gold','torch','food'].includes(a.offering))return true;
  const key='ssethTribute:'+s.dungeon.minorId,offered=s.flags[key]??=[];
  if(offered.includes(a.offering)||s.flags.silverAcornGranted)return true;
  if(a.offering==='gold'){if(s.gold<10)return true;s.gold-=10;}
  if(a.offering==='torch'){const i=s.bag.indexOf('torch');if(i<0)return true;s.bag.splice(i,1);}
  if(a.offering==='food'){if(s.meals<1)return true;s.meals--;}
  offered.push(a.offering);s.turns++;note(s,'Sseth accepts your offering.');
  if(offered.length===3){s.flags.silverAcornGranted=true;s.bag.push(SILVER_ACORN.id);s.pendingLoot.push(SILVER_ACORN.id);adjustAlignment(s,12);note(s,'SSETH ACCEPTS YOUR TRIBUTE. You receive a SILVER ACORN. Plant it; in three days its tree will grant full healing.');}
  return true;
 }
 if(a.type==='plantAcorn'||a.type==='useItem'&&a.id===SILVER_ACORN.id){
  if(s.mode!=='world'||!s.bag.includes(SILVER_ACORN.id))return true;
  s.bag.splice(s.bag.indexOf(SILVER_ACORN.id),1);s.pendingLoot=s.pendingLoot.filter(id=>id!==SILVER_ACORN.id);
  s.flags.silverTree={region:s.region,area:s.exploration?.area??null,x:s.x,y:s.y,plantedAt:worldTimeMs(s)};s.turns++;note(s,'You plant the Silver Acorn. Its roots stir. Return in three days.');return true;
 }
 if(a.type==='askSilverTree'){
  if(!atSilverTree(s))return true;
  if(worldTimeMs(s)-s.flags.silverTree.plantedAt<3*DAY_MS){note(s,'The silver sapling is still growing. It needs three days.');return true;}
  s.hp=s.maxHp;note(s,'The Silver Tree grants full healing.');return true;
 }
 return false;
}
export function validSilverAcorn(s){
 for(const [k,v]of Object.entries(s.flags))if(k.startsWith('ssethTribute:')&&(!Array.isArray(v)||new Set(v).size!==v.length||v.some(x=>!['gold','food','torch'].includes(x))))return false;
 if(s.flags.silverAcornGranted!==undefined&&typeof s.flags.silverAcornGranted!=='boolean')return false;
 const t=s.flags.silverTree;return t===undefined||t&&Number.isInteger(t.region)&&t.region>=0&&t.region<4&&(t.area===null||/^(wild-\d+|planet-[0-2]|north-sea-exile)$/.test(t.area))&&Number.isInteger(t.x)&&t.x>=1&&t.x<128&&Number.isInteger(t.y)&&t.y>=1&&t.y<96&&Number.isSafeInteger(t.plantedAt)&&t.plantedAt>=0;
}
