import {drawDungeonChests} from './chest-render.js';
import {dungeonChests} from './treasure.js';
export const treeFort=new Image();treeFort.src='/assets/elf-tree-fort.webp';
export function drawForest(c,w,h,s,map,dx,dy){
 const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#172e2b');sky.addColorStop(.48,'#8b9c76');sky.addColorStop(.5,'#64734b');sky.addColorStop(1,'#18261b');c.fillStyle=sky;c.fillRect(0,0,w,h);
 c.fillStyle='#ccd9a52a';for(let i=0;i<5;i++){c.beginPath();c.moveTo(w*(i*.27-.1),0);c.lineTo(w*(i*.27+.18),h);c.lineTo(w*(i*.27+.28),h);c.closePath();c.fill();}
 if(s.dungeon.floor>0){c.fillStyle=['','#635638','#594b36','#4c4135'][s.dungeon.floor];c.fillRect(0,h*.5,w,h*.5);c.strokeStyle='#201f1766';c.lineWidth=2;for(let i=1;i<14;i++){const y=h*.5+h*.5*(i/14)**2;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}for(let i=-5;i<=5;i++){c.beginPath();c.moveTo(w*.5,h*.5);c.lineTo(w*.5+i*w*.2,h);c.stroke();}}
 const objects=[];for(let y=0;y<15;y++)for(let x=0;x<15;x++){if(map[y][x]!==1)continue;const rx=x-s.dungeon.x,ry=y-s.dungeon.y,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx;if(depth<.3||Math.abs(side/depth)>1.4)continue;objects.push({x,y,depth,side});}
 objects.sort((a,b)=>b.depth-a.depth);
 for(const t of objects){const scale=h*.95/t.depth,x=w*.5+t.side/t.depth*w*.72,base=h*.5+h*.42/t.depth,seed=t.x*17+t.y*31;c.save();c.globalAlpha=Math.max(.25,1-t.depth/25);
  if(seed%4===0&&treeFort.complete&&treeFort.naturalWidth){c.drawImage(treeFort,x-scale*.55,base-scale*1.65,scale*1.1,scale*1.65);}
  else{c.fillStyle='#3a3020';c.beginPath();c.moveTo(x-scale*.15,base);c.lineTo(x-scale*.07,base-scale*1.9);c.lineTo(x+scale*.05,base-scale*1.9);c.lineTo(x+scale*.17,base);c.closePath();c.fill();c.strokeStyle='#716345';c.lineWidth=Math.max(1,scale*.018);for(let j=-2;j<=2;j++){c.beginPath();c.moveTo(x+j*scale*.023,base);c.lineTo(x+j*scale*.012,base-scale*1.9);c.stroke();}for(let j=0;j<5;j++){c.fillStyle=['#263f28','#354e2c','#49603a'][j%3];c.beginPath();c.ellipse(x+Math.sin(seed+j)*scale*.28,base-scale*(1.4+j*.12),scale*.43,scale*.3,0,0,7);c.fill();}c.fillStyle='#46613b';c.beginPath();c.ellipse(x,base-scale*.03,scale*.24,scale*.08,0,0,7);c.fill();}c.restore();
 }
 if(s.mode!=='battle')drawForestLandmarks(c,w,h,s,map,dx,dy);
 drawDungeonChests(c,w,h,s,map,dx,dy);
 const z=Math.min(7,w/65),ox=w-15*z-18,oy=18;c.fillStyle='#07170ce8';c.fillRect(ox-6,oy-6,15*z+12,15*z+12);for(let y=0;y<15;y++)for(let x=0;x<15;x++){c.fillStyle=map[y][x]===1?'#526d3c':'#18291c';c.fillRect(ox+x*z,oy+y*z,z-1,z-1);}for(const box of dungeonChests(s,map)){c.fillStyle=box.opened?'#6b5e41':'#e1c378';c.fillRect(ox+box.x*z,oy+box.y*z,z-1,z-1);}c.fillStyle='#e6bd73';c.fillRect(ox+13*z,oy+13*z,z-1,z-1);if(s.dungeon.floor===2&&!s.flags.pepperFound){c.fillStyle='#c2b4ea';c.fillRect(ox+7*z,oy+7*z,z-1,z-1);}c.fillStyle='#8edaca';c.fillRect(ox+z,oy+z,z-1,z-1);c.fillStyle='#ffe0a0';c.beginPath();c.arc(ox+(s.dungeon.x+.5)*z,oy+(s.dungeon.y+.5)*z,z*.4,0,7);c.fill();c.strokeStyle='#ffe0a0';c.beginPath();c.moveTo(ox+(s.dungeon.x+.5)*z,oy+(s.dungeon.y+.5)*z);c.lineTo(ox+(s.dungeon.x+.5+dx)*z,oy+(s.dungeon.y+.5+dy)*z);c.stroke();
 c.fillStyle='#e6e2bc';c.textAlign='center';c.font='12px Georgia';c.fillText(['NORTH','EAST','SOUTH','WEST'][s.dungeon.dir],w/2,28);
}

function drawForestLandmarks(c,w,h,s,map,dx,dy){
 const marks=[{x:13,y:13,door:true,label:s.dungeon.floor===3?'Haghilda’s lair':'Tree door · climb up'},{x:1,y:1,door:true,label:s.dungeon.floor?'Tree door · climb down':'Way out'}];
 if(s.dungeon.floor===2)marks.push({x:7,y:7,label:s.flags.pepperFound?'Fallen elf · searched':'Fallen elf · search the body'});
 for(const m of marks){const rx=m.x-s.dungeon.x,ry=m.y-s.dungeon.y,here=rx===0&&ry===0,depth=here?1:rx*dx+ry*dy,side=-rx*dy+ry*dx;if(depth<=0||Math.abs(side/depth)>.7)continue;let blocked=false;const distance=Math.hypot(rx,ry);for(let t=.15;t<distance;t+=.15)if(map[Math.floor(s.dungeon.y+.5+ry*t/distance)]?.[Math.floor(s.dungeon.x+.5+rx*t/distance)]===1){blocked=true;break;}if(blocked)continue;
 const scale=Math.min(h*.65,h*.6/depth),x=w*.5+side/depth*w*.72,base=here?h*.87:h*.5+h*.4/depth;c.save();c.translate(x,base);
 if(m.door){c.fillStyle='#51432d';c.beginPath();c.moveTo(-scale*.4,0);c.lineTo(-scale*.25,-scale*1.3);c.lineTo(scale*.28,-scale*1.3);c.lineTo(scale*.42,0);c.closePath();c.fill();c.strokeStyle='#85704c';c.lineWidth=scale*.018;for(let k=-3;k<=3;k++){c.beginPath();c.moveTo(k*scale*.1,0);c.lineTo(k*scale*.06,-scale*1.3);c.stroke();}c.fillStyle='#1b2016';c.beginPath();c.roundRect(-scale*.22,-scale*.75,scale*.44,scale*.75,[scale*.2,scale*.2,0,0]);c.fill();c.strokeStyle='#b8a16c';c.lineWidth=scale*.025;c.stroke();c.strokeStyle='#6e5438';for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(k*scale*.07,-scale*.55);c.lineTo(k*scale*.07,0);c.stroke();}c.fillStyle='#e9cb79';c.beginPath();c.arc(scale*.12,-scale*.28,scale*.025,0,7);c.fill();c.font=Math.max(12,scale*.11)+'px Georgia';c.fillStyle='#efdeb0';c.textAlign='center';c.fillText(m.x===1?'↓':'↑',0,-scale*.92);}
 else{c.fillStyle='#11201677';c.beginPath();c.ellipse(0,0,scale*.5,scale*.12,0,0,7);c.fill();c.fillStyle='#557354';c.beginPath();c.moveTo(-scale*.4,-scale*.04);c.lineTo(scale*.23,-scale*.15);c.lineTo(scale*.4,scale*.06);c.lineTo(-scale*.25,scale*.1);c.closePath();c.fill();c.fillStyle='#c3ab87';c.beginPath();c.ellipse(-scale*.36,-scale*.07,scale*.09,scale*.07,0,0,7);c.fill();c.fillStyle='#8c9478';c.fillRect(-scale*.5,-scale*.1,scale*.15,scale*.05);}
 if(depth<3){c.fillStyle='#f4dfaf';c.font='14px Georgia';c.textAlign='center';c.fillText(m.label,0,24);}c.restore();
 }
}
