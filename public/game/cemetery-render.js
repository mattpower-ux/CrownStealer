import {artLoaded} from './art-revision.js';
import {minorSiteDefinition} from './minor-sites.js';
export const isCemeteryDungeon=d=>!!d&&(d.site==='minor-site'?minorSiteDefinition(d.minorId)?.kind==='cemetery':!d.site&&!d.royal&&!d.ship&&!d.expedition&&d.index===0);
function poly(c,points,color,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function stroke(c,points,color,width=.015){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
const remainsArt=typeof Image==='undefined'?null:new Image();if(remainsArt)remainsArt.onload=artLoaded;if(remainsArt)remainsArt.src='/assets/crypt-sarcophagus.webp';
export function drawCemeteryCoffin(c,size,opened,{stone=false}={}){
 if(opened&&remainsArt?.complete&&remainsArt.naturalWidth){const w=size*1.25,h=w*remainsArt.naturalHeight/remainsArt.naturalWidth;c.drawImage(remainsArt,-w*.5,-h,w,h);return;}
 c.save();c.scale(size,size*.62);c.lineJoin='round';c.lineWidth=.025;
 const outline=[[-.22,-.84],[.22,-.84],[.43,-.64],[.28,-.13],[-.28,-.13],[-.43,-.64]];
 poly(c,[[-.43,-.64],[-.28,-.13],[.28,-.13],[.43,-.64],[.43,-.47],[.28,.04],[-.28,.04],[-.43,-.47]],stone?'#45483e':'#30231e','#171813');
 const lid=c.createLinearGradient(-.4,-.8,.4,0);lid.addColorStop(0,stone?'#969789':'#6f5740');lid.addColorStop(.5,stone?'#72796a':'#4b382b');lid.addColorStop(1,stone?'#525a50':'#35271e');
 poly(c,outline,lid,stone?'#b4b5a0':'#a08657');
 if(opened){poly(c,[[-.18,-.77],[.18,-.77],[.35,-.61],[.23,-.20],[-.23,-.20],[-.35,-.61]],'#0c1110','#56574b');
  c.save();c.translate(.38,-.15);c.rotate(.27);poly(c,outline,stone?'#7d8476':'#594430','#a6a28a');stroke(c,[[-.14,-.68],[.12,-.57],[-.04,-.46],[.15,-.24]],'#3c4038',.022);c.restore();
  c.fillStyle='#938e74';c.beginPath();c.ellipse(0,-.64,.065,.055,0,0,Math.PI*2);c.fill();stroke(c,[[0,-.58],[0,-.31]],'#7f7d67',.022);for(let i=0;i<4;i++)stroke(c,[[-.08,-.53+i*.04],[0,-.55+i*.04],[.08,-.53+i*.04]],'#77775f',.013);
 }else{
  for(const x of [-.13,0,.13])stroke(c,[[x,-.78],[x,-.20]],stone?'#5b6558':'#281f18',.008);
  stroke(c,[[0,-.69],[0,-.32]],stone?'#c5c3a6':'#a39369',.034);stroke(c,[[-.12,-.57],[.12,-.57]],stone?'#c5c3a6':'#a39369',.034);
  for(const y of [-.67,-.29])for(const x of [-.27,.27]){c.fillStyle='#9e8a5e';c.fillRect(x-.025,y,.05,.025);}
 }
 stroke(c,[[-.27,-.10],[.27,-.10]],stone?'#858d7c':'#785c39',.013);c.restore();
}
export function cemeteryRemains(d,map){
 const remains=[];
 for(let y=1;y<map.length-1;y++)for(let x=1;x<map[y].length-1;x++){
  if(map[y][x]!==0||x===1&&y===1||x===13&&y===13)continue;
  const seed=(x*31+y*47+(d.floor||0)*17+(d.index||0)*7)%19;
  if(seed>2)continue;
  const wall=[[0,-1],[1,0],[0,1],[-1,0]].find(([dx,dy])=>map[y+dy]?.[x+dx]===1);if(!wall)continue;
  remains.push({x:x+wall[0]*.30,y:y+wall[1]*.30,kind:seed===0?'sarcophagus':'headstone',seed});
 }
 return remains;
}
export function drawCemeteryRemains(c,w,h,d,map,dx,dy,fov,wallDepth){
 const focal=w/(2*Math.tan(fov/2)),objects=cemeteryRemains(d,map).map(p=>{const rx=p.x-d.x,ry=p.y-d.y,depth=rx*dx+ry*dy;return {...p,depth,x:w*.5+(-dy*rx+dx*ry)*focal/depth,y:h*.5+h*.425/depth,size:h*.30/depth};}).filter(p=>p.depth>.5&&p.depth<8&&p.x+p.size>0&&p.x-p.size<w).sort((a,b)=>b.depth-a.depth);
 for(const p of objects){c.save();c.beginPath();for(let x=Math.max(0,Math.floor(p.x-p.size));x<Math.min(w,p.x+p.size);x+=2)if(p.depth<=wallDepth[x]+.1)c.rect(x,0,2,h);c.clip();c.translate(p.x,p.y);c.globalAlpha=Math.max(.42,1-p.depth*.06);
 c.fillStyle='#050909aa';c.beginPath();c.ellipse(0,0,p.size*.65,p.size*.13,0,0,Math.PI*2);c.fill();
 if(p.kind==='sarcophagus')drawCemeteryCoffin(c,p.size,true,{stone:true});else{c.scale(p.size,p.size);c.lineWidth=.018;
  poly(c,[[-.48,-.08],[-.35,-.34],[-.16,-.40],[.04,-.36],[.14,-.16],[.01,-.02]],'#666f63','#989b85');
  poly(c,[[.03,-.02],[.16,-.18],[.31,-.18],[.43,-.04],[.29,.04]],'#596355','#909580');
  stroke(c,[[-.29,-.27],[-.04,-.24]],'#353f35',.022);stroke(c,[[-.31,-.21],[-.08,-.19]],'#354034',.015);
  stroke(c,[[-.16,-.40],[-.20,-.29],[-.12,-.18],[-.18,-.05]],'#2b342d',.016);
  for(let i=0;i<3;i++)poly(c,[[.1+i*.1,.06],[.14+i*.1,-.01],[.20+i*.1,.06]],'#7a8270');
 }c.restore();}
}
