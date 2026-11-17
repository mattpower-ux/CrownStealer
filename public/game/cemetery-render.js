import {artLoaded} from './art-revision.js';
import {isOpenAirCemetery,minorSiteDefinition} from './minor-sites.js';
export {isOpenAirCemetery};
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
 const remains=isOpenAirCemetery(d)?[
  {x:4,y:3,kind:'crypt'},{x:10,y:4,kind:'crypt'},{x:3,y:10,kind:'crypt'},
  {x:6,y:4,kind:'headstone'},{x:7,y:4,kind:'headstone'},
  {x:5,y:8,kind:'sarcophagus'},{x:9,y:9,kind:'sarcophagus'},
 ]:[];
 for(let y=1;y<map.length-1;y++)for(let x=1;x<map[y].length-1;x++){
  if(map[y][x]!==0||x===1&&y===1||x===13&&y===13)continue;
  const seed=(x*31+y*47+(d.floor||0)*17+(d.index||0)*7)%19;
  if(seed>2)continue;
  const wall=[[0,-1],[1,0],[0,1],[-1,0]].find(([dx,dy])=>map[y+dy]?.[x+dx]===1);if(!wall)continue;
  remains.push({x:x+wall[0]*.30,y:y+wall[1]*.30,kind:seed===0?'sarcophagus':'headstone',seed});
 }
 return remains;
}
function drawCemeteryCrypt(c,size){
 c.save();c.scale(size,size);c.lineWidth=.022;
 poly(c,[[-.63,-.04],[.60,-.04],[.56,-.15],[-.57,-.15]],'#65717d','#303940');
 poly(c,[[-.56,-.15],[.32,-.15],[.32,-1.12],[-.56,-1.12]],'#89969e','#57646e');
 poly(c,[[.32,-.15],[.60,-.36],[.60,-1.26],[.32,-1.12]],'#515d68','#364352');
 poly(c,[[-.65,-1.12],[-.13,-1.54],[.40,-1.12]],'#a0adb4','#56636e');
 poly(c,[[-.13,-1.54],[.15,-1.73],[.70,-1.29],[.40,-1.12]],'#647280','#475663');
 c.beginPath();c.moveTo(-.39,-.17);c.lineTo(-.39,-.67);
 c.quadraticCurveTo(-.39,-.98,-.12,-1.03);c.quadraticCurveTo(.14,-.98,.14,-.67);
 c.lineTo(.14,-.17);c.closePath();c.fillStyle='#1d2a36';c.fill();c.strokeStyle='#a6afb0';c.stroke();
 for(const x of [-.32,-.22,-.12,-.02,.08])stroke(c,[[x,-.77],[x,-.18]],'#596675',.026);
 stroke(c,[[-.38,-.44],[.13,-.44]],'#707d88',.038);
 c.restore();
}

export function drawCemeteryNightSky(c,w,h,angle,fov){
 const height=h*.5, sky=c.createLinearGradient(0,0,0,height);
 sky.addColorStop(0,'#080f27');sky.addColorStop(1,'#344966');
 c.fillStyle=sky;c.fillRect(0,0,w,height);
 const focal=w/(2*Math.tan(fov/2));
 const skyX=bearing=>w*.5+focal*Math.tan(Math.atan2(Math.sin(bearing-angle),Math.cos(bearing-angle)));
 const inView=bearing=>Math.cos(bearing-angle)>Math.cos(fov*.63);
 for(let i=0;i<440;i++){
  const bearing=i*2.39996323;
  if(!inView(bearing))continue;
  const x=skyX(bearing),y=h*(.022+.43*((i*137.50776)%100)/100),size=Math.max(1,w*(i%9===0?.0024:.0012));
  c.fillStyle=['#96afd494','#e0e9ffc4','#f8e5c68f'][i%3];
  c.fillRect(x,y,size,size);
 }
 const moonBearing=.25;
 if(!inView(moonBearing))return;
 const x=skyX(moonBearing),y=h*.127,r=Math.min(w,h)*.041;
 const halo=c.createRadialGradient(x,y,r*.65,x,y,r*3.2);
 halo.addColorStop(0,'#b0c9f864');halo.addColorStop(1,'#8daee900');
 c.fillStyle=halo;c.fillRect(x-r*3.2,y-r*3.2,r*6.4,r*6.4);
 c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle='#edf1dd';c.fill();c.save();c.clip();
 for(const [u,v,s] of [[-.27,-.14,.28],[.35,.15,.18],[.12,-.48,.12],[-.21,.45,.14]]){
  c.beginPath();c.ellipse(x+u*r,y+v*r,s*r,s*r*.75,-.5,0,Math.PI*2);c.fillStyle='#909eb448';c.fill();
 }
 c.restore();
}

export function cemeteryGateInk(u,v){
 if(u<.10||u>.90||v>.97)return null;
 const span=(u-.5)/.40,arch=.09+.29*(1-Math.sqrt(Math.max(0,1-span*span)));
 if(v<arch)return null;
 if(v<arch+.025||Math.abs(u-.12)<.022||Math.abs(u-.88)<.022)return '#737e8d';
 const bar=(u-.12)*15%1;
 if(bar<.25||Math.abs(v-.50)<.028||Math.abs(v-.82)<.023)return bar<.07?'#8294a2':'#3f4d58';
 return '#151f31';
}

export function drawCemeteryRemains(c,w,h,d,map,dx,dy,fov,wallDepth){
 const focal=w/(2*Math.tan(fov/2)),objects=cemeteryRemains(d,map).map(p=>{const rx=p.x-d.x,ry=p.y-d.y,depth=rx*dx+ry*dy;return {...p,depth,x:w*.5+(-dy*rx+dx*ry)*focal/depth,y:h*.5+h*.425/depth,size:h*.30/depth};}).filter(p=>p.depth>.5&&p.depth<8&&p.x+p.size>0&&p.x-p.size<w).sort((a,b)=>b.depth-a.depth);
 for(const p of objects){c.save();c.beginPath();for(let x=Math.max(0,Math.floor(p.x-p.size));x<Math.min(w,p.x+p.size);x+=2)if(p.depth<=wallDepth[x]+.1)c.rect(x,0,2,h);c.clip();c.translate(p.x,p.y);c.globalAlpha=Math.max(.42,1-p.depth*.06);
 c.fillStyle='#050909aa';c.beginPath();c.ellipse(0,0,p.size*.65,p.size*.13,0,0,Math.PI*2);c.fill();
 if(p.kind==='crypt')drawCemeteryCrypt(c,p.size);
 else if(p.kind==='sarcophagus')drawCemeteryCoffin(c,p.size,true,{stone:true});else{c.scale(p.size,p.size);c.lineWidth=.018;
  poly(c,[[-.48,-.08],[-.35,-.34],[-.16,-.40],[.04,-.36],[.14,-.16],[.01,-.02]],'#666f63','#989b85');
  poly(c,[[.03,-.02],[.16,-.18],[.31,-.18],[.43,-.04],[.29,.04]],'#596355','#909580');
  stroke(c,[[-.29,-.27],[-.04,-.24]],'#353f35',.022);stroke(c,[[-.31,-.21],[-.08,-.19]],'#354034',.015);
  stroke(c,[[-.16,-.40],[-.20,-.29],[-.12,-.18],[-.18,-.05]],'#2b342d',.016);
  for(let i=0;i<3;i++)poly(c,[[.1+i*.1,.06],[.14+i*.1,-.01],[.20+i*.1,.06]],'#7a8270');
 }c.restore();}
}
