import {artLoaded} from './art-revision.js';
import {shrineForDungeon} from './shrine-deities.js';
import {minorSiteDefinition} from './minor-sites.js';
function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,points,color,width=.012){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
const statueArt=Object.fromEntries(['kobold','giant','goddess','lizard','blob'].map(id=>{if(typeof Image==='undefined')return [id,null];const image=new Image();image.onload=artLoaded;image.src='/assets/shrine-'+id+'-statue.webp';return [id,image];}));
let stonefatherMaterialActive=false;
let tumbledMaterialActive=false;
export const shrineMaterialRevision=3;
export const STONEFATHER_FLOOR_SAMPLE_SIZE=2;
export const isStonefatherShrine=d=>(stonefatherMaterialActive=shrineForDungeon(d)?.id==='stonefather');
export const stonefatherMaterialSelected=()=>stonefatherMaterialActive;
export const isTumbledShrine=d=>(tumbledMaterialActive=d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.name==='Tumbled Shrine');
export const tumbledMaterialSelected=()=>tumbledMaterialActive;
const css=(r,g,b,a=255)=>`#${[r,g,b,a].map(value=>Math.max(0,Math.min(255,Math.round(value))).toString(16).padStart(2,'0')).join('')}`;
export function stonefatherGranitePixel(u,v,light=1){
 const row=Math.min(3,Math.floor(v*4)),shift=row%2?.23:0,across=(u+shift)%1,col=Math.min(2,Math.floor(across*3));
 const horizontal=(v*4)%1,vertical=(across*3)%1,seam=horizontal<.035||vertical<.025;
 const crack=((row*17+col*11)%7===0)&&Math.abs(vertical-.68+horizontal*.13)<.025;
 const tone=seam?43:crack?36:104+row*4+col*6;
 const shade=Math.max(.24,Math.round(light*5)/5);
 return css(tone*shade,(tone+3)*shade,(tone+7)*shade);
}
export function stonefatherFloorPixel(u,v){
 const hash=Math.abs(Math.sin((Math.floor(u*83)+1)*127.1+(Math.floor(v*71)+3)*311.7));
 const slab=(Math.floor(u*13)+Math.floor(v*17)*3)%19===0;
 if(slab)return hash>.5?'#8f918cff':'#b8b6adff';
 if(hash>.78)return '#f0eee5ff';
 if(hash>.38)return '#d7d4c8ff';
 return '#c5c3baff';
}
export function tumbledRomanesqueInk(u,v,light=1,face=0){
 const shade=value=>css(value*light,(value+4)*light,(value+1)*light);
 const bay=(u*3)%1;
 const frieze=v>.27&&v<.35||v>.68&&v<.735;
 if(frieze){const bead=(Math.floor(u*28+face*3)&1)===0;return shade(bead?178:133);}
 const column=(bay<.09||bay>.91)&&v>.12&&v<.88;
 if(column){const edge=bay<.025||bay>.975;return shade(edge?112:164);}
 const capital=(bay<.15||bay>.85)&&(v>.1&&v<.17||v>.82&&v<.89);
 if(capital)return shade(187);
 const archCenter=Math.abs(bay-.5),archY=.25-Math.sqrt(Math.max(0,.20-archCenter*archCenter))*.23;
 if(v>.06&&v<.27&&Math.abs(v-archY)<.022)return shade(171);
 return null;
}
export function tumbledColumnDebris(d){
 const variant=minorSiteDefinition(d?.minorId)?.seed??0,shift=(variant%3-1)*.18;
 return [
  {x:2+shift,y:4,kind:'shaft',angle:-.34},{x:12,y:5+shift,kind:'drum',angle:.12},
  {x:2.2,y:10.5,kind:'capital',angle:.18},{x:11.8-shift,y:10.8,kind:'shaft',angle:.42},
  {x:4.2,y:2.2,kind:'drum',angle:-.18},{x:10.2,y:12,kind:'capital',angle:-.28},
 ];
}
function drawTumbledDebris(c,w,h,d,map,dx,dy,fov,wallDepth){
 projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,tumbledColumnDebris(d),(piece,size)=>{
  c.save();c.translate(piece.screenX,piece.screenY);c.rotate(piece.angle);c.lineWidth=Math.max(1,size*.025);c.strokeStyle='#706f68';
  if(piece.kind==='shaft'){
   const length=size*.82,radius=size*.16;c.fillStyle='#aaa99f';c.fillRect(-length*.5,-radius,length,radius*2);c.beginPath();c.ellipse(-length*.5,0,radius*.32,radius,0,0,Math.PI*2);c.fillStyle='#d7d4c8';c.fill();c.stroke();c.beginPath();c.ellipse(length*.5,0,radius*.32,radius,0,0,Math.PI*2);c.fillStyle='#8f918c';c.fill();c.stroke();
   c.strokeStyle='#87877f';for(const y of [-.07,0,.07]){c.beginPath();c.moveTo(-length*.42,y*size);c.lineTo(length*.42,y*size);c.stroke();}
  }else if(piece.kind==='drum'){
   const radius=size*.22;c.fillStyle='#b8b6ad';c.fillRect(-radius,-radius*.65,radius*2,radius*1.3);c.beginPath();c.ellipse(0,-radius*.65,radius,radius*.28,0,0,Math.PI*2);c.fillStyle='#d7d4c8';c.fill();c.stroke();c.beginPath();c.ellipse(0,radius*.65,radius,radius*.28,0,0,Math.PI);c.stroke();
  }else{
   c.fillStyle='#b8b6ad';c.beginPath();c.moveTo(-size*.28,size*.12);c.lineTo(-size*.2,-size*.15);c.lineTo(size*.2,-size*.15);c.lineTo(size*.3,size*.12);c.closePath();c.fill();c.stroke();c.fillStyle='#d7d4c8';c.fillRect(-size*.13,-size*.27,size*.26,size*.13);
  }
  c.restore();
 });
}
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
 if(isTumbledShrine(d))drawTumbledDebris(c,w,h,d,map,dx,dy,fov,wallDepth);
 projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,[{x:profile.x??7,y:profile.y??8}],(o,size)=>{
 const x=o.screenX,y=o.screenY,top=Math.max(0,y-size*2.3);
 const beam=c.createLinearGradient(x,top,x,y);beam.addColorStop(0,'#fff1cb55');beam.addColorStop(.7,'#fff0c52a');beam.addColorStop(1,'#fff0c508');c.fillStyle=beam;
 c.beginPath();c.moveTo(x-size*.07,top);c.lineTo(x+size*.07,top);c.lineTo(x+size*.58,y);c.lineTo(x-size*.58,y);c.closePath();c.fill();
 oval(c,x,y,size*.55,size*.12,'#fff1cb20');drawShrineStatue(c,x,y,size,profile);
 });
}
export function drawShrinePortrait(canvas,profile){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawShrineStatue(c,canvas.width*.5,canvas.height*.96,canvas.height*.65,profile);}
