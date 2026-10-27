import {drawDungeonChests} from './chest-render.js';
import {dungeonChests} from './treasure.js';
export const treeFort=new Image();treeFort.src='/assets/elf-tree-fort.webp';
export function drawForest(c,w,h,s,map,dx,dy){
 const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#172e2b');sky.addColorStop(.48,'#8b9c76');sky.addColorStop(.5,'#64734b');sky.addColorStop(1,'#18261b');c.fillStyle=sky;c.fillRect(0,0,w,h);
 c.fillStyle='#ccd9a52a';for(let i=0;i<5;i++){c.beginPath();c.moveTo(w*(i*.27-.1),0);c.lineTo(w*(i*.27+.18),h);c.lineTo(w*(i*.27+.28),h);c.closePath();c.fill();}
 const objects=[];for(let y=0;y<15;y++)for(let x=0;x<15;x++){if(map[y][x]!==1)continue;const rx=x-s.dungeon.x,ry=y-s.dungeon.y,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx;if(depth<.3||Math.abs(side/depth)>1.4)continue;objects.push({x,y,depth,side});}
 objects.sort((a,b)=>b.depth-a.depth);
 for(const t of objects){const scale=h*.95/t.depth,x=w*.5+t.side/t.depth*w*.72,base=h*.5+h*.42/t.depth,seed=t.x*17+t.y*31;c.save();c.globalAlpha=Math.max(.25,1-t.depth/25);
  if(seed%4===0&&treeFort.complete&&treeFort.naturalWidth){c.drawImage(treeFort,x-scale*.55,base-scale*1.65,scale*1.1,scale*1.65);}
  else{c.fillStyle='#3a3020';c.beginPath();c.moveTo(x-scale*.15,base);c.lineTo(x-scale*.07,base-scale*1.9);c.lineTo(x+scale*.05,base-scale*1.9);c.lineTo(x+scale*.17,base);c.closePath();c.fill();c.strokeStyle='#716345';c.lineWidth=Math.max(1,scale*.018);for(let j=-2;j<=2;j++){c.beginPath();c.moveTo(x+j*scale*.023,base);c.lineTo(x+j*scale*.012,base-scale*1.9);c.stroke();}for(let j=0;j<5;j++){c.fillStyle=['#263f28','#354e2c','#49603a'][j%3];c.beginPath();c.ellipse(x+Math.sin(seed+j)*scale*.28,base-scale*(1.4+j*.12),scale*.43,scale*.3,0,0,7);c.fill();}c.fillStyle='#46613b';c.beginPath();c.ellipse(x,base-scale*.03,scale*.24,scale*.08,0,0,7);c.fill();}c.restore();
 }
 drawDungeonChests(c,w,h,s,map,dx,dy);
 const z=Math.min(7,w/65),ox=w-15*z-18,oy=18;c.fillStyle='#07170ce8';c.fillRect(ox-6,oy-6,15*z+12,15*z+12);for(let y=0;y<15;y++)for(let x=0;x<15;x++){c.fillStyle=map[y][x]===1?'#526d3c':'#18291c';c.fillRect(ox+x*z,oy+y*z,z-1,z-1);}for(const box of dungeonChests(s,map)){c.fillStyle=box.opened?'#6b5e41':'#e1c378';c.fillRect(ox+box.x*z,oy+box.y*z,z-1,z-1);}c.fillStyle='#8edaca';c.fillRect(ox+z,oy+z,z-1,z-1);c.fillStyle='#ffe0a0';c.beginPath();c.arc(ox+(s.dungeon.x+.5)*z,oy+(s.dungeon.y+.5)*z,z*.4,0,7);c.fill();c.strokeStyle='#ffe0a0';c.beginPath();c.moveTo(ox+(s.dungeon.x+.5)*z,oy+(s.dungeon.y+.5)*z);c.lineTo(ox+(s.dungeon.x+.5+dx)*z,oy+(s.dungeon.y+.5+dy)*z);c.stroke();
 c.fillStyle='#e6e2bc';c.textAlign='center';c.font='12px Georgia';c.fillText(['NORTH','EAST','SOUTH','WEST'][s.dungeon.dir],w/2,28);
}
