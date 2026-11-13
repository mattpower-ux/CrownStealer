import {isCemeteryDungeon} from './cemetery-render.js';
import {dungeonLadders} from './dungeon-ladders.js';

const directions=[[0,-1],[1,0],[0,1],[-1,0]];
const floorKey=d=>`${d.minorId||'dungeon-'+d.index}:${d.floor||0}`;
export const hasMiningLight=s=>s.equippedHead==='miners-cap'&&s.bag?.includes('miners-cap');
export function cemeteryTorches(d,map){
 if(!isCemeteryDungeon(d))return [];
 const queue=[{x:1,y:1}],seen=new Set(['1:1']),fixtures=[],ladders=dungeonLadders(d,map);
 for(let i=0;i<queue.length;i++){
  const p=queue[i],wall=directions.find(([dx,dy])=>map[p.y+dy]?.[p.x+dx]===1&&!ladders.some(l=>l.wallX===p.x+dx&&l.wallY===p.y+dy));
  if(wall&&!fixtures.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<3.5))fixtures.push({...p,wallX:p.x+wall[0],wallY:p.y+wall[1],id:`${floorKey(d)}:${p.x+wall[0]}:${p.y+wall[1]}`});
  for(const [dx,dy] of directions){const x=p.x+dx,y=p.y+dy,key=x+':'+y;if(map[y]?.[x]!==undefined&&map[y][x]!==1&&!seen.has(key)){seen.add(key);queue.push({x,y});}}
 }
 return fixtures;
}
function clearRay(map,x,y,tx,ty){
 const steps=Math.ceil(Math.hypot(tx-x,ty-y)*12);
 for(let n=1;n<steps;n++){const px=x+(tx-x)*n/steps,py=y+(ty-y)*n/steps;if(map[Math.floor(py)]?.[Math.floor(px)]===1)return false;}
 return true;
}
export function nearestUnlitTorch(s,map){
 if(s.mode!=='dungeon'||!isCemeteryDungeon(s.dungeon)||hasMiningLight(s))return null;
 return cemeteryTorches(s.dungeon,map).filter(t=>!s.flags?.cemeteryTorches?.includes(t.id)&&Math.hypot(t.x-s.dungeon.x,t.y-s.dungeon.y)<=1.6&&clearRay(map,s.dungeon.x+.5,s.dungeon.y+.5,t.x+.5,t.y+.5)).sort((a,b)=>Math.hypot(a.x-s.dungeon.x,a.y-s.dungeon.y)-Math.hypot(b.x-s.dungeon.x,b.y-s.dungeon.y))[0]||null;
}
export function lightNearestCemeteryTorch(s,map){
 const torch=nearestUnlitTorch(s,map);if(!torch||!s.bag?.includes('torch'))return null;
 s.bag.splice(s.bag.indexOf('torch'),1);
 s.flags.cemeteryTorches??=[];s.flags.cemeteryTorches.push(torch.id);return torch;
}
export function cemeteryLightAt(s,map,x,y,fixtures=cemeteryTorches(s.dungeon,map)){
 if(!isCemeteryDungeon(s.dungeon)||s.mode==='battle')return 1;
 const sources=hasMiningLight(s)?[{x:s.dungeon.x,y:s.dungeon.y,cap:true}]:fixtures.filter(t=>s.flags?.cemeteryTorches?.includes(t.id));
 let light=0;
 for(const source of sources){const distance=Math.hypot(x-source.x-.5,y-source.y-.5),radius=source.cap?4.5:4;if(distance<radius&&clearRay(map,source.x+.5,source.y+.5,x,y))light=Math.max(light,Math.min(1,(1-distance/radius)*1.25));}
 return light;
}

let darknessCache;
export function cemeteryTorchInk(torch,lit,u,v,time){
 if(!torch)return null;
 if(Math.abs(u-.5)<.028&&v>.43&&v<.76)return '#49301c';
 if(Math.abs(u-.5)<.065&&v>.48&&v<.53)return '#151d1c';
 const flicker=1+Math.sin(time*.006+torch.wallX)*.12;
 if(lit&&((u-.5)/(.055*flicker))**2+((v-.36)/.115)**2<1)return Math.abs(u-.5)<.023?'#ffe49a':'#e88b32';
 return null;
}
export function drawCemeteryDarkness(c,w,h,s,map,time=0){
 if(!isCemeteryDungeon(s.dungeon)||s.mode==='battle')return;
 const key=JSON.stringify([s.dungeon,s.flags?.cemeteryTorches,hasMiningLight(s),w,h]);
 if(darknessCache?.key!==key){
  const mask=document.createElement('canvas');mask.width=Math.min(180,Math.ceil(w));mask.height=Math.max(1,Math.round(mask.width*h/w));
  const context=mask.getContext('2d'),pixels=context.createImageData(mask.width,mask.height),d=s.dungeon,angle=d.dir*Math.PI/2-Math.PI/2,fov=Math.PI/2.6,torches=cemeteryTorches(d,map);
  for(let col=0;col<mask.width;col++){
   const offset=Math.atan((col/mask.width-.5)*2*Math.tan(fov/2)),a=angle+offset,vx=Math.cos(a),vy=Math.sin(a);let wallDistance=.03;
   while(wallDistance<18&&map[Math.floor(d.y+.5+vy*wallDistance)]?.[Math.floor(d.x+.5+vx*wallDistance)]!==1)wallDistance+=.06;
   for(let row=0;row<mask.height;row++){
    const planeDistance=.425/Math.max(.015,Math.abs(row/mask.height-.5))/Math.cos(offset),distance=Math.max(0,Math.min(wallDistance-.07,planeDistance)),x=d.x+.5+vx*distance,y=d.y+.5+vy*distance;
    const light=cemeteryLightAt(s,map,x,y,torches),i=(row*mask.width+col)*4;
    pixels.data[i+3]=Math.round(255*(1-light*.92));
   }
  }
  context.putImageData(pixels,0,0);darknessCache={key,mask};
 }
 c.save();
 // A shifting penumbra follows the fire while the unlit passages remain opaque.
 const pulse=.055+.025*Math.sin(time*.0043)+.015*Math.sin(time*.011);
 if(!hasMiningLight(s)){const shadow=c.createLinearGradient(0,0,w,h);shadow.addColorStop(0,`rgba(0,0,0,${pulse})`);shadow.addColorStop(.5+Math.sin(time*.0017)*.15,'rgba(0,0,0,.015)');shadow.addColorStop(1,`rgba(0,0,0,${pulse+.12})`);c.fillStyle=shadow;c.fillRect(0,0,w,h);}
 c.imageSmoothingEnabled=true;c.drawImage(darknessCache.mask,0,0,w,h);c.restore();
}
