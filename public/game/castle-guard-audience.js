import {worldTimeMs} from './world-clock.js';
const WAIT_MS=384000;
const walkable=(layout,p)=>Number.isInteger(p?.x)&&Number.isInteger(p?.y)&&layout.tiles[p.y]?.[p.x]&&layout.tiles[p.y][p.x]!=='wall';
export function startGuardConsultation(s,guard,layout,{note,events=[]}){
 if(!s.castle||s.castle.guardConsultation)return false;
 const origin={x:guard.x,y:guard.y},destination={...layout.throne};
 const queue=[{...origin,path:[origin]}],seen=new Set([origin.x+','+origin.y]);let path=[origin];
 for(const p of queue){if(p.x===destination.x&&p.y===destination.y){path=p.path;break;}for(const [dx,dy]of [[0,-1],[1,0],[0,1],[-1,0]]){const n={x:p.x+dx,y:p.y+dy},key=n.x+','+n.y;if(!walkable(layout,n)||seen.has(key))continue;seen.add(key);queue.push({...n,path:[...p.path,n]});}}
 s.castle.guardConsultation={guardId:guard.id,origin,destination:path.at(-1),until:worldTimeMs(s)+WAIT_MS};
 note(s,'WAIT HERE. I will consult the ruler. Do not move until I return.');
 events.push({kind:'castleGuardConsult',guardId:guard.id,path});return true;
}
export function finishGuardConsultation(s,note,events=[]){
 const waiting=s.castle?.guardConsultation;
 if(!waiting||worldTimeMs(s)<waiting.until)return false;
 delete s.castle.guardConsultation;
 note(s,'The guard returns. You may pass. Behave yourself.');
 events.push({kind:'castleGuardReturned',guardId:waiting.guardId});return true;
}
export function validGuardConsultation(s,layout){
 const w=s.castle?.guardConsultation;if(w===undefined)return true;
 return !!w&&typeof w==='object'&&!Array.isArray(w)&&s.mode==='town'&&!s.castle.alarm&&[...layout.guards,...layout.patrols].some(g=>g.id===w.guardId)&&walkable(layout,w.origin)&&w.origin.x===s.castle.x&&w.origin.y===s.castle.y&&walkable(layout,w.destination)&&w.destination.x===layout.throne.x&&w.destination.y===layout.throne.y&&Number.isSafeInteger(w.until)&&w.until>=0&&w.until<=1e15;
}
