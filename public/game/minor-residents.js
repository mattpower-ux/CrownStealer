import {minorSiteDefinition} from './minor-sites.js';
import {minorDungeonMap} from './minor-dungeons.js';
const steps=[[1,0],[-1,0],[0,1],[0,-1]];
export function minorResidents(s){
 const d=s.dungeon,site=d?.site==='minor-site'&&minorSiteDefinition(d.minorId);if(!site||!['cemetery','tunnel'].includes(site.kind))return [];
 const map=minorDungeonMap(d),queue=[{x:1,y:1}],seen=new Set(),points=[];
 for(const p of queue){const key=p.x+','+p.y;if(seen.has(key))continue;seen.add(key);points.push(p);for(const [dx,dy]of steps){const x=p.x+dx,y=p.y+dy;if(map[y]?.[x]!==undefined&&map[y][x]!==1&&!seen.has(x+','+y))queue.push({x,y});}}
 let spots;
 if(site.kind==='tunnel')spots=points.filter(p=>map[p.y][p.x]===0&&steps.filter(([dx,dy])=>map[p.y+dy]?.[p.x+dx]!==1).length===1);
 else spots=[.24,.53,.79].map(t=>points[Math.max(2,Math.floor((points.length-1)*t))]);
 return spots.map((p,i)=>({...p,id:d.minorId+':'+d.floor+':'+i,kind:site.kind==='tunnel'?'watcher':'undead',name:site.kind==='tunnel'?'Watcher of the Way':['Cemetery Skeleton','Grave Ghoul','Barrow Wight'][i],level:2+site.region*6+d.floor+i})).filter(p=>!s.flags.minorResidentsDefeated?.includes(p.id));
}
export function nearbyWatcher(s){return minorResidents(s).find(p=>p.kind==='watcher'&&Math.abs(p.x-s.dungeon.x)+Math.abs(p.y-s.dungeon.y)<=1);}
export function startMinorResident(s,kind,note){
 if(s.mode!=='dungeon')return false;
 const residents=minorResidents(s),target=kind==='theft'?residents.find(p=>p.kind==='watcher'):kind==='attack'?nearbyWatcher(s):residents.find(p=>p.kind==='undead'&&Math.abs(p.x-s.dungeon.x)+Math.abs(p.y-s.dungeon.y)<=1);
 if(!target)return false;
 const watcher=target.kind==='watcher',hp=35+target.level*12;
 s.enemy={speciesId:watcher?'watcher-of-the-way':'cemetery-resident',name:target.name,level:target.level,hp,maxHp:hp,attack:7+target.level*2,armor:2+Math.floor(target.level/2),gold:20+target.level*8,xp:24+target.level*8,kind:watcher?'spectral':'armored',weakness:watcher?'fire':'steady pressure',undead:!watcher,firstContact:true,combatDistance:1,minorResident:target.id,art:{sheet:watcher?'monsters-depth':'monsters-depth',index:watcher?4:[5,7,8][Number(target.id.split(':').at(-1))%3]}};
 s.returnMode='dungeon';s.mode='battle';s.flags.guarded=false;s.flags.combo=0;
 note(s,watcher?(kind==='theft'?'The Watcher of the Way sees you reach for its guarded chest. Its watching eyes blaze with fury!':'You strike at the watching eyes. The Watcher of the Way unfolds from the darkness!'):target.name+' rises from the graves and bars your way.');return true;
}
export function validMinorResidents(s){return s.flags.minorResidentsDefeated===undefined||Array.isArray(s.flags.minorResidentsDefeated)&&s.flags.minorResidentsDefeated.length<=2000&&new Set(s.flags.minorResidentsDefeated).size===s.flags.minorResidentsDefeated.length&&s.flags.minorResidentsDefeated.every(id=>{const m=/^(minor-(?:r[0-3]|w(?:[0-9]|1[01]))-\d+):([0-2]):([0-2])$/.exec(id),site=m&&minorSiteDefinition(m[1]);return site&&['cemetery','tunnel'].includes(site.kind)&&Number(m[2])<site.floors;});}
