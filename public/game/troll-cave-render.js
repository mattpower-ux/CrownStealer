import {minorSiteDefinition} from './minor-sites.js';

export const isTrollCave=d=>d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.occupant==='troll';

export const TROLL_CAMP_ASSETS={
 fire:'/assets/troll-cauldron-fire.webp',
 hammer:'/assets/troll-warhammer.webp',
 bonesHorned:'/assets/troll-bones-horned.webp',
 bonesBoar:'/assets/troll-bones-boar.webp',
};
const campImages=new Map();
function campImage(kind){
 if(typeof Image==='undefined')return null;
 if(!campImages.has(kind)){const image=new Image();image.decoding='async';image.src=TROLL_CAMP_ASSETS[kind];campImages.set(kind,image);}
 const image=campImages.get(kind);return image.complete&&image.naturalWidth?image:null;
}

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

function drawCampAsset(c,o){
 const image=campImage(o.asset);if(!image)return;
 const height=o.size*(o.asset==='fire'?1.85:o.asset==='hammer'?1.15:.72);
 const width=height*image.naturalWidth/image.naturalHeight;
 c.save();c.translate(o.x,o.y);c.globalAlpha=Math.min(1,.72+1/o.depth*.16);
 c.drawImage(image,-width/2,-height,width,height);c.restore();
}

export function drawTrollCaveDetails(c,w,h,d,dx,dy,fov,wallDepth,time){
 const objects=[{asset:'fire',x:7.5,y:8.5},{asset:'bonesHorned',x:6.1,y:8.1},{asset:'bonesBoar',x:8.7,y:8.9},{asset:'bonesHorned',x:7.1,y:9.7},{asset:'hammer',x:8.8,y:7.2}]
  .map(o=>visibleObject(d,o,dx,dy,fov,w,h)).filter(Boolean).sort((a,b)=>b.depth-a.depth);
 for(const o of objects){const left=Math.max(0,Math.floor(o.x-o.size*2)),right=Math.min(w,Math.ceil(o.x+o.size*2));c.save();c.beginPath();for(let x=left;x<right;x+=2)if(o.depth<=wallDepth[x]+.18)c.rect(x,0,2,h);c.clip();drawCampAsset(c,o);c.restore();}
}
