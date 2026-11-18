import {isMossyGlobeShrine} from './red-globe.js';
export function drawRedGlobe(c,w,h,d,m,dx,dy){
 if(!isMossyGlobeShrine(d)||!d.secretRoom)return;
 const rx=1-d.x,ry=8-d.y,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx;
 if(depth<0||depth>4||depth&&Math.abs(side/depth)>.6||!depth&&side)return;
 for(let i=1;i<depth*8;i++){const t=i/(depth*8);if(m[Math.floor(d.y+.5+ry*t)]?.[Math.floor(d.x+.5+rx*t)]===1)return;}
 const size=Math.min(w*.3,h*.32)/Math.max(1,depth*.6),x=w/2+side/Math.max(1,depth)*w*.65,y=h*.58;
 c.save();c.fillStyle='#44414b';c.fillRect(x-size*.55,y+size*.17,size*1.1,size*.65);c.fillStyle='#6c6470';c.fillRect(x-size*.7,y+size*.1,size*1.4,size*.13);
 const light=c.createRadialGradient(x-size*.12,y-size*.25,1,x,y-size*.1,size*.34);light.addColorStop(0,'#ffb4a9');light.addColorStop(.25,'#fb263b');light.addColorStop(1,'#540511');c.fillStyle=light;c.shadowColor='#ec1430';c.shadowBlur=size*.35;c.beginPath();c.arc(x,y-size*.17,size*.31,0,Math.PI*2);c.fill();c.restore();
}
