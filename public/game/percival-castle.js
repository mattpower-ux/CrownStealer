import {worldTile,minorSiteList,shipyardList} from './engine.js';
import {wildernessDiscoverySites} from './wilderness-discoveries.js';
import {TOWNS,DUNGEONS} from './content.js';
import {WILD_SITES} from './wild-sites.js';
import {branchGates,teleporterSite} from './exploration.js';
import {PUTRID_PALACE} from './royal-trials.js';

export const PERCIVAL_CASTLE_ID='percivals-lament';
export const PERCIVAL_FLOORS=3;
let location;
export function percivalCastleSite(s){
 if(s.region!==1||s.exploration?.area)return null;
 if(!location){
  const marks=[...TOWNS,...DUNGEONS,...WILD_SITES,PUTRID_PALACE,...branchGates(1),teleporterSite(1),...minorSiteList(s),...shipyardList(s),...wildernessDiscoverySites(s)].filter(p=>p.region===1);
  const queue=[{x:64,y:48}],seen=new Set(),ground=[];
  for(let i=0;i<queue.length;i++){
   const {x,y}=queue[i],key=x+','+y;
   if(x<1||y<1||x>126||y>94||seen.has(key))continue;seen.add(key);
   if(['water','mountain'].includes(worldTile(1,x,y)))continue;
   if(marks.every(p=>Math.abs(p.x-x)+Math.abs(p.y-y)>4))ground.push({x,y});
   for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push({x:x+dx,y:y+dy});
  }
  ground.sort((a,b)=>(Math.abs(a.x-102)+Math.abs(a.y-30))-(Math.abs(b.x-102)+Math.abs(b.y-30))||a.y-b.y||a.x-b.x);
  location={...ground[0],id:PERCIVAL_CASTLE_ID,kind:'percivalCastle',name:'Percival’s Lament',region:1,index:2};
 }
 return {...location};
}

export function percivalCastleMap(d){
 const map=Array.from({length:15},()=>Array(15).fill(1));
 const carve=(x1,y1,x2,y2)=>{for(let y=Math.max(1,y1);y<=Math.min(13,y2);y++)for(let x=Math.max(1,x1);x<=Math.min(13,x2);x++)map[y][x]=0;};
 const middle=7+d.floor;
 carve(1,1,3,1);carve(3,1,3,3);carve(2,2,4,4);
 carve(3,3,10,3);carve(9,2,11,4);carve(10,3,10,9);
 carve(middle,9,10,9);carve(middle-1,8,middle+1,10);
 carve(middle,9,middle,12);carve(middle,12,13,12);carve(12,11,13,13);
 map[1][1]=3;map[13][13]=2;return map;
}

const inhabitants=[
 {speciesId:'percival-ghost',name:'Castle Ghost',kind:'spectral',art:{sheet:'monsters-depth',index:6}},
 {speciesId:'percival-ghoul',name:'Grieving Ghoul',kind:'brute',art:{sheet:'monsters-depth',index:7}},
 {speciesId:'percival-zombie',name:'Round Table Zombie',kind:'brute',art:{sheet:'monsters-depth',index:5}},
];
export function percivalEnemy(s,{boss=false,guardian=false,roll=0}={}){
 const floor=s.dungeon?.floor??0,level=boss?15:9+floor;
 const species=boss?{speciesId:'percival-liche',name:'The Liche of Percival’s Lament',kind:'spectral',art:{sheet:'monsters-depth',index:10}}:inhabitants[guardian?floor:Math.min(2,Math.floor(roll*3))];
 const hp=boss?260:65+floor*25;
 return {...species,level,hp,maxHp:hp,attack:boss?24:12+floor*4,armor:boss?5:2+floor,gold:boss?120:18+floor*8,xp:boss?180:45+floor*15,undead:true,weakness:'Holy weapons and fire',firstContact:true,...(boss?{boss:true}:{}),...(guardian?{percivalGuardian:floor}:{})};
}
export function percivalThreat(s){
 if(s.dungeon?.site!==PERCIVAL_CASTLE_ID)return null;
 if(!s.flags['percivalFloorCleared'+s.dungeon.floor])return percivalEnemy(s,{guardian:true});
 if(s.dungeon.floor===PERCIVAL_FLOORS-1&&!s.flags.percivalLicheDefeated)return percivalEnemy(s,{boss:true});
 return null;
}
export function validPercivalCastle(s){
 for(const key of ['percivalLicheDefeated','percivalFloorCleared0','percivalFloorCleared1','percivalFloorCleared2'])if(s.flags[key]!==undefined&&typeof s.flags[key]!=='boolean')return false;
 if(s.dungeon?.site===PERCIVAL_CASTLE_ID&&(s.region!==1||s.dungeon.index!==2||s.exploration?.area||s.dungeon.ship||s.dungeon.royal||s.dungeon.expedition))return false;
 if(s.enemy?.percivalGuardian!==undefined&&(!Number.isInteger(s.enemy.percivalGuardian)||s.enemy.percivalGuardian!==s.dungeon?.floor||s.dungeon?.site!==PERCIVAL_CASTLE_ID))return false;
 return true;
}
