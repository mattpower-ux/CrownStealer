import {dungeonFloors} from './dungeon-depths.js';
// Wall-mounted geometry, shared by the renderer and navigation tests.
export function dungeonLadders(d,map){
 const points=d.royal==='cell'?[{x:3,y:3,direction:'down'}]:d.royal==='sewer'?[{x:13,y:13,direction:'up'}]:[{x:1,y:1,direction:'up'},...(d.floor<(dungeonFloors(d)-1)?[{x:13,y:13,direction:'down'}]:[])];
 return points.map(p=>{const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]].find(([dx,dy])=>map[p.y+dy]?.[p.x+dx]===1)||[0,-1];return {...p,wallX:p.x+dx,wallY:p.y+dy};});
}

export function ladderPrompt(s,map){
 const d=s?.dungeon;if(s?.mode!=='dungeon'||!d||d.ship||d.site)return null;
 const ladder=dungeonLadders(d,map).find(l=>l.x===d.x&&l.y===d.y);
 return ladder?{...ladder,upAction:d.royal==='sewer'?'descend':'leave'}:null;
}
