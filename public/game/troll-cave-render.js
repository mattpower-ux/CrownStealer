import {minorSiteDefinition} from './minor-sites.js';

export const isTrollCave=d=>d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.occupant==='troll';

export function drawTrollCaveVault(c,w,h,phase=0){
 const roof=c.createRadialGradient(w*.5,h*.48,10,w*.5,h*.48,w*.75);
 roof.addColorStop(0,'#302d29');roof.addColorStop(.48,'#181a19');roof.addColorStop(1,'#080d0d');
 c.fillStyle=roof;c.fillRect(0,0,w,h*.58);
 c.strokeStyle='#080b0acc';c.lineWidth=Math.max(2,w*.004);
 for(let i=0;i<17;i++){const x=(i*197+phase*31)%w;c.beginPath();c.moveTo(x,-20);c.bezierCurveTo(x-w*.08,h*.13,x+w*.09,h*.26,x+(i%3-1)*w*.06,h*.51);c.stroke();}
 c.fillStyle='#59605922';
 for(let i=0;i<35;i++){const x=(i*113)%w,y=(i*67)%(h*.5);c.beginPath();c.ellipse(x,y,12+i%5*7,5+i%4*4,(i%7)*.3,0,Math.PI*2);c.fill();}
}

export function trollRockPixel(u,v,light,face=0){
 const ridge=Math.abs(Math.sin(u*19+face*1.7)+Math.sin(v*23-face*.9))*.5;
 const seam=(Math.sin(u*8+v*5+face)*.5+.5)<.07||Math.abs(Math.sin(v*9+face*.4))<.045;
 const base=seam?25:58+ridge*38+(Math.sin((u+v)*61+face)*7);
 const r=Math.max(0,Math.min(255,Math.floor((base+7)*light))),g=Math.max(0,Math.min(255,Math.floor((base+4)*light))),b=Math.max(0,Math.min(255,Math.floor(base*light)));
 return (255<<24)|(b<<16)|(g<<8)|r;
}

function visibleObject(d,o,dx,dy,fov,w,h){
 const rx=o.x-d.x-.5,ry=o.y-d.y-.5,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx;
 if(depth<.35||Math.abs(side/depth)>.78)return null;
 const focal=w/(2*Math.tan(fov/2));return {...o,depth,x:w*.5+side*focal/depth,y:h*.5+h*.38/depth,size:Math.min(h*.42,h*.52/depth)};
}

function bonePile(c,o){
 c.save();c.translate(o.x,o.y);c.scale(o.size,o.size);c.lineCap='round';c.strokeStyle='#d3c6a2';c.lineWidth=.045;
 for(let i=0;i<7;i++){const x=(i%4-.5)*.13-.19,y=-.02-(i%3)*.025;c.beginPath();c.moveTo(x-.12,y-.03);c.lineTo(x+.12,y+.03);c.stroke();c.beginPath();c.arc(x-.13,y-.035,.025,0,Math.PI*2);c.arc(x+.13,y+.035,.025,0,Math.PI*2);c.fillStyle='#c3b590';c.fill();}
 c.fillStyle='#c9bb98';c.beginPath();c.ellipse(.18,-.08,.10,.08,0,0,Math.PI*2);c.fill();c.fillStyle='#171817';c.beginPath();c.arc(.15,-.09,.018,0,Math.PI*2);c.arc(.21,-.09,.018,0,Math.PI*2);c.fill();c.restore();
}

function hammer(c,o){
 c.save();c.translate(o.x,o.y);c.rotate(-.23);c.scale(o.size,o.size);c.lineCap='round';c.strokeStyle='#5e4127';c.lineWidth=.095;c.beginPath();c.moveTo(-.18,.08);c.lineTo(.18,-.88);c.stroke();
 c.fillStyle='#3a3d3d';c.strokeStyle='#171919';c.lineWidth=.02;c.beginPath();c.roundRect(-.16,-1.02,.62,.25,.04);c.fill();c.stroke();c.fillStyle='#77756b';c.fillRect(-.10,-.98,.50,.04);c.restore();
}

function cauldronFire(c,o,time){
 c.save();c.translate(o.x,o.y);c.scale(o.size,o.size);
 const glow=c.createRadialGradient(0,-.12,0,0,-.12,.9);glow.addColorStop(0,'#ff9b3855');glow.addColorStop(1,'#ff7b1700');c.fillStyle=glow;c.fillRect(-1,-1.15,2,1.5);
 c.fillStyle='#6c6253';for(let i=0;i<10;i++){const a=i*Math.PI/5;c.beginPath();c.ellipse(Math.cos(a)*.35,Math.sin(a)*.105+.03,.12,.055,a,0,Math.PI*2);c.fill();}
 for(let i=0;i<7;i++){const x=(i-3)*.07,f=.26+((i*17+Math.floor(time/90))%5)*.035;c.fillStyle=i%2?'#ffbc42':'#e95c24';c.beginPath();c.moveTo(x-.07,.01);c.quadraticCurveTo(x-.04,-f*.55,x,-f);c.quadraticCurveTo(x+.08,-f*.45,x+.07,.01);c.fill();}
 c.strokeStyle='#292a28';c.lineWidth=.045;c.beginPath();c.moveTo(-.44,-.07);c.lineTo(-.30,-.53);c.moveTo(.44,-.07);c.lineTo(.30,-.53);c.stroke();
 c.fillStyle='#202423';c.strokeStyle='#080a09';c.lineWidth=.035;c.beginPath();c.ellipse(0,-.46,.42,.13,0,0,Math.PI*2);c.lineTo(.34,-.13);c.quadraticCurveTo(0,.03,-.34,-.13);c.closePath();c.fill();c.stroke();
 c.fillStyle='#698586';c.beginPath();c.ellipse(0,-.46,.34,.085,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#d7c89b';c.lineWidth=.035;c.beginPath();c.moveTo(-.20,-.50);c.lineTo(.02,-.40);c.moveTo(.10,-.52);c.lineTo(.25,-.43);c.stroke();
 c.fillStyle='#79523c';c.beginPath();c.ellipse(-.07,-.45,.075,.04,.3,0,Math.PI*2);c.ellipse(.18,-.48,.06,.035,-.2,0,Math.PI*2);c.fill();
 c.strokeStyle='#afb9af88';c.lineWidth=.022;for(let i=0;i<4;i++){const x=-.18+i*.12;c.beginPath();c.moveTo(x,-.57);c.bezierCurveTo(x-.07,-.72,x+.08,-.79,x,-.96);c.stroke();}
 c.restore();
}

export function drawTrollCaveDetails(c,w,h,d,dx,dy,fov,wallDepth,time){
 const objects=[{kind:'fire',x:7.5,y:8.5},{kind:'bones',x:6.1,y:8.1},{kind:'bones',x:8.7,y:8.9},{kind:'bones',x:7.1,y:9.7},{kind:'hammer',x:8.8,y:7.2}]
  .map(o=>visibleObject(d,o,dx,dy,fov,w,h)).filter(Boolean).sort((a,b)=>b.depth-a.depth);
 for(const o of objects){const left=Math.max(0,Math.floor(o.x-o.size)),right=Math.min(w,Math.ceil(o.x+o.size));c.save();c.beginPath();for(let x=left;x<right;x+=2)if(o.depth<=wallDepth[x]+.18)c.rect(x,0,2,h);c.clip();if(o.kind==='fire')cauldronFire(c,o,time);else if(o.kind==='hammer')hammer(c,o);else bonePile(c,o);c.restore();}
}
