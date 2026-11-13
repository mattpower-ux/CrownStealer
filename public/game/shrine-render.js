import {artLoaded} from './art-revision.js';
import {shrineForDungeon} from './shrine-deities.js';
function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,points,color,width=.012){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
const statueArt=Object.fromEntries(['kobold','giant','goddess','lizard','blob'].map(id=>{if(typeof Image==='undefined')return [id,null];const image=new Image();image.onload=artLoaded;image.src='/assets/shrine-'+id+'-statue.webp';return [id,image];}));
export function drawShrineStatue(c,x,y,size,profile){
 const art=statueArt[profile.form];if(!art?.complete||!art.naturalWidth)return;
 const scale=Math.min(size*1.25/art.naturalWidth,size*1.45/art.naturalHeight),w=art.naturalWidth*scale,h=art.naturalHeight*scale;
 c.drawImage(art,x-w/2,y-h,w,h);
}
function projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,objects,paint){
 const focal=w/(2*Math.tan(fov/2));const visible=objects.map(o=>{const rx=o.x-d.x,ry=o.y-d.y,depth=rx*dx+ry*dy;return {...o,depth,screenX:w*.5+(-dy*rx+dx*ry)*focal/depth,screenY:h*.5+h*.425/depth};}).filter(o=>o.depth>.35&&o.depth<12).sort((a,b)=>b.depth-a.depth);
 for(const o of visible){const size=h*.68/o.depth;c.save();c.beginPath();for(let x=Math.max(0,Math.floor(o.screenX-size*.65));x<Math.min(w,o.screenX+size*.65);x+=2)if(o.depth<=wallDepth[x]+.12)c.rect(x,0,2,h);c.clip();paint(o,size);c.restore();}
}
export function drawShrineScene(c,w,h,s,map,dx,dy,fov,wallDepth){
 const d=s.dungeon,profile=shrineForDungeon(d);if(!profile)return;
 if(d.charityPit){
  projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,[{x:5.1,y:8.4,tone:'#79715d'},{x:5.3,y:9.8,tone:'#596f70'},{x:6.2,y:6.8,tone:'#766052'},{x:5.8,y:9.1,lantern:true}],(o,size)=>{
   c.save();c.translate(o.screenX,o.screenY);c.scale(size*.65,size*.65);c.lineWidth=.012;c.lineJoin='round';if(o.lantern){const glow=c.createRadialGradient(0,-.12,0,0,-.12,.65);glow.addColorStop(0,'#e6a95166');glow.addColorStop(1,'#b57d2800');c.fillStyle=glow;c.fillRect(-.7,-.8,1.4,1.4);poly(c,[[-.07,0],[-.06,-.22],[.06,-.22],[.07,0]],'#ad8950','#e3c27c');poly(c,[[-.04,-.04],[-.035,-.18],[.035,-.18],[.04,-.04]],'#edbd6c');line(c,[[-.05,-.22],[-.05,-.29],[.05,-.29],[.05,-.22]],'#8d8d71',.012);line(c,[[0,-.30],[-.06,-.42],[.05,-.55],[-.02,-.68]],'#b1ada433',.035);c.restore();return;}oval(c,0,0,.24,.06,'#03070788');poly(c,[[-.16,-.10],[-.11,-.36],[.03,-.43],[.18,-.19],[.25,-.04]],o.tone,'#343d32');oval(c,-.02,-.46,.07,.085,'#b5a080');line(c,[[-.09,-.29],[.05,-.15],[.20,-.12]],'#8f8770',.06);line(c,[[-.11,-.06],[-.21,0],[.03,.01]],'#4c4b40',.065);c.restore();
  });return;
 }
 projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,[{x:profile.x??7,y:profile.y??8}],(o,size)=>{
 const x=o.screenX,y=o.screenY,top=Math.max(0,y-size*2.3);
 const beam=c.createLinearGradient(x,top,x,y);beam.addColorStop(0,'#fff1cb55');beam.addColorStop(.7,'#fff0c52a');beam.addColorStop(1,'#fff0c508');c.fillStyle=beam;
 c.beginPath();c.moveTo(x-size*.07,top);c.lineTo(x+size*.07,top);c.lineTo(x+size*.58,y);c.lineTo(x-size*.58,y);c.closePath();c.fill();
 oval(c,x,y,size*.55,size*.12,'#fff1cb20');drawShrineStatue(c,x,y,size,profile);
 });
}
export function drawShrinePortrait(canvas,profile){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawShrineStatue(c,canvas.width*.5,canvas.height*.96,canvas.height*.65,profile);}
