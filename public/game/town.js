import {TOWNS} from './content.js';
// Shared town geometry keeps entrances, collision, touch movement and art aligned.
export const TOWN_SIZE=13;
export const TOWN_PLACES=[
 {id:'inn',name:'The Lantern Inn',x:3,y:5,art:0,bx:2,by:3,bw:2,bh:2},
 {id:'shop',name:'Market',x:9,y:5,art:1,bx:8,by:3,bw:2,bh:2},
 {id:'casino',name:'The Gilded Goose Gambling House',x:3,y:8,art:2,bx:2,by:6,bw:2,bh:2},
 {id:'court',name:'Court & Watch',x:9,y:8,art:3,bx:8,by:6,bw:2,bh:2},
 {id:'quests',name:'Odd Jobs',x:3,y:11,art:0,bx:2,by:9,bw:2,bh:2},
 {id:'talk',name:'Gossip in the Square',x:6,y:4,art:3,bx:5,by:2,bw:2,bh:2},
 {id:'fortune',name:'Fortune Teller',x:10,y:11,art:5,bx:9,by:9,bw:2,bh:2},
 {id:'gate',name:'Leave town',x:6,y:12,art:7}
];
export function townPosition(s){return s.townPosition||{x:6,y:11};}
export function townPlace(s){const p=townPosition(s);return townPlaces(s).find(b=>b.x===p.x&&b.y===p.y);}
export function townWalkable(x,y,s=null){if(x===6&&y===12)return true;if(x<1||x>11||y<1||y>11)return false;return !townPlaces(s).some(b=>b.bw&&x>=b.bx&&x<b.bx+b.bw&&y>=b.by&&y<b.by+b.bh);}

export function townPlaces(s){const index=Math.max(0,TOWNS.findIndex(t=>t.id===s?.location));const result=TOWN_PLACES.map(p=>({...p}));if(index%3===1){for(const p of result){if(p.id==='gate')continue;p.x=12-p.x;if(p.bw)p.bx=13-p.bx-p.bw;}}if(index%3===2){const slots=result.filter(p=>['inn','casino','quests'].includes(p.id));const positions=slots.map(p=>({x:p.x,y:p.y,bx:p.bx,by:p.by}));slots.forEach((p,i)=>Object.assign(p,positions[(i+1)%3]));}const shop=result.find(p=>p.id==='shop');if(s?.location==='mothbridge')shop.name='Mount Shop';else if(s?.location==='salt-choir')shop.name='Healing Enclave';else if(index%3===1)shop.name='Wizard’s Scrolls & Wands';if(index%3===2)shop.name='Gizmos & Gadgets Emporium';return result;}
