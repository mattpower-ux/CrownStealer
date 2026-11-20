import {CHARITY_SHRINE_ID} from './shrine-deities.js';
import {stonefatherMaterialSelected,stonefatherGranitePixel} from './shrine-render.js';
import {artLoaded} from './art-revision.js';
import {minorSiteDefinition} from './minor-sites.js';
import {minorResidents} from './minor-residents.js';
export const isMountainTunnel=d=>d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.kind==='tunnel';
const packed=(r,g,b,light)=>{const n=v=>Math.max(0,Math.min(255,Math.floor(v*light)));return (255<<24)|(n(b)<<16)|(n(g)<<8)|n(r);};
const cssPixel=hex=>{const n=parseInt(hex.slice(1,7),16);return (255<<24)|((n&255)<<16)|(n&65280)|(n>>>16);};
let rockPixels=null;
if(typeof Image!=='undefined'&&typeof document!=='undefined'){const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d');c.drawImage(image,0,0,512,512);rockPixels=c.getImageData(0,0,512,512).data;artLoaded();};image.src='/assets/mountain-rock.webp';}
const rockAtlas=new Float32Array(256*256);
function grain(x,y){let n=Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,scale){const ix=Math.floor(x/scale),iy=Math.floor(y/scale),fx=(x/scale-ix),fy=(y/scale-iy),u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (grain(ix,iy)*(1-u)+grain(ix+1,iy)*u)*(1-v)+(grain(ix,iy+1)*(1-u)+grain(ix+1,iy+1)*u)*v;}
for(let y=0;y<256;y++)for(let x=0;x<256;x++){const broad=noise(x,y,48),chip=noise(x,y,12),fine=noise(x,y,3);const ridge=Math.abs(noise(x+27,y+19,21)-.5);rockAtlas[y*256+x]=42+broad*55+chip*35+fine*17+grain(x,y)*10-(ridge<.022?24:0);}
export function tunnelRockPixel(u,v,light){if(rockPixels){const x=((Math.floor(u*190)%512)+512)%512,y=((Math.floor(v*511)%512)+512)%512,i=(y*512+x)*4;return packed(rockPixels[i],rockPixels[i+1],rockPixels[i+2],light*.8);}const x=((Math.floor(u*91)%256)+256)%256,y=((Math.floor(v*255)%256)+256)%256;const tone=rockAtlas[y*256+x];return packed(tone+19,tone*.69+5,tone*.47+2,light);}
export function obsidianPixel(u,v,light){const fracture=Math.abs(Math.sin(u*9+v*5+Math.sin(v*8)*.8)),shine=Math.max(0,Math.sin(u*5-v*3))**18;const tone=25+Math.sin(u*31+v*19)*4+shine*46;return packed(tone+4,tone+3,tone+13,light*(fracture<.024?.6:1));}
export const isMossyShrine=d=>d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.name==='Mossy Shrine';
export function mossyShrinePixel(u,v,light=1){const growth=noise(u*256,v*256,47)*.65+noise(u*256,v*256,13)*.35,grit=grain(Math.floor(u*370),Math.floor(v*370));if(growth>.42){const lush=28+growth*51+grit*18;return packed(lush*.54,lush,lush*.35,Math.max(.18,light));}const stone=47+noise(u*256,v*256,18)*43;return packed(stone*.87,stone,stone*.83,light);}
export const isCharityMarble=d=>d?.site==='minor-site'&&d.minorId===CHARITY_SHRINE_ID&&!d.charityPit;
export function charityMarblePixel(u,v,light=1){
 const warp=Math.sin(u*13+v*9)*.32+Math.sin(v*24-u*7)*.12;
 const vein=Math.abs(Math.sin(u*5.7+v*8.1+warp)),fine=Math.abs(Math.sin(u*17-v*11+warp*3));
 const dark=vein<.045,edge=vein<.095||fine<.025;
 const tone=dark?24:edge?155:245+Math.sin(u*97+v*61)*4;
 const shine=Math.max(.76,Math.min(1,light*.4+.66));return packed(tone,tone,tone+2,shine);
}
export const isCinderWardCrypt=d=>d?.expedition==='wild-4-cave-1';
export const cinderWardLavaChamber=face=>face%5===0;

export function cinderWardWallPixel(face,u,v,light){
 if(cinderWardLavaChamber(face)&&u>.13&&u<.87&&v>.18&&v<.86){
  const inset=Math.min(u-.13,.87-u,v-.18,.86-v);
  if(inset<.035)return packed(114,55,40,light);
  if(v<.58+Math.sin(u*43)*.012)return packed(32,15,15,light);
  const seams=Math.abs(Math.sin(u*39+v*16)*Math.cos(v*34-u*17));
  const molten=seams<.13||v<.64;
  return molten?packed(255,137+seams*120,46,1):packed(164+seams*82,42+seams*38,19,1);
 }
 const course=Math.floor(v*7),joint=(u*3.5+course*.5)%1,mortar=v*7%1<.055||joint<.045;
 const grain=rockAtlas[(Math.floor(v*255)*256+Math.floor(u*255))]||75;
 const soot=Math.max(0,Math.sin((u+face*.31)*8-v*5))**6;
 const brightness=mortar?.38:Math.max(.38,1-soot*.62);
 return packed(78+grain*.78,32+grain*.40,24+grain*.33,brightness*light);
}

export function drawCinderWardBrambles(c,w,h,d){
 c.save();
 for(let i=0;i<8;i++){
  const n=(i*3+d.x*2+d.y*3+d.dir+d.floor)%11;
  if(n<3)continue;
  const x=(i+.25)*w/8,y=(n%4)*h*.025,length=h*(.037+n*.013);
  c.lineWidth=Math.max(1.5,w*.0045);
  c.lineCap='round';c.strokeStyle='#170d10';
  c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+w*.035,y+length*.25,x-w*.025,y+length*.68,x+w*.01,y+length);c.stroke();
  c.lineWidth*=.57;
  for(let t=1;t<5;t++){
   const yy=y+length*t/5,xx=x+Math.sin(t*1.05)*w*.013;
   c.beginPath();c.moveTo(xx-w*.012,yy+length*.12);c.lineTo(xx,yy);c.lineTo(xx+w*.016,yy-length*.08);c.stroke();
  }
 }
 c.restore();
}

export function drawCinderWardLavaGlow(c,w,h,lights,time){
 c.save();c.globalCompositeOperation='screen';
 for(const {x,y,size,phase} of lights||[]){
  const cx=x*w,cy=y*h,r=size*h,pulse=.24+Math.sin(time*.003+phase)*.055;
  const glow=c.createRadialGradient(cx,cy,0,cx,cy,r);
  glow.addColorStop(0,'rgba(255,103,32,'+pulse+')');glow.addColorStop(1,'#ff4b0000');
  c.fillStyle=glow;c.fillRect(cx-r,cy-r,r*2,r*2);
 }
 c.restore();
}

export function drawMountainVault(c,w,h,phase=0){
 const height=Math.ceil(h*.5),img=c.createImageData(w,height),pixels=new Uint32Array(img.data.buffer);
 for(let y=0;y<height;y+=2)for(let x=0;x<w;x+=2){const lateral=(x-w*.5)/w,depth=h/Math.max(3,h*.5-y),curve=Math.sqrt(Math.max(.02,1-lateral*lateral*3));const color=tunnelRockPixel(lateral*depth+phase,depth*.22+curve,.45/(1+depth*.035));for(let yy=y;yy<Math.min(height,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;}
 c.putImageData(img,0,0);

}
export function drawShrineVault(c,w,h,{marble=false,moss=false}={}){
 const granite=stonefatherMaterialSelected();
 const height=Math.ceil(h*.5),img=c.createImageData(w,height),pixels=new Uint32Array(img.data.buffer);
 for(let y=0;y<height;y+=2)for(let x=0;x<w;x+=2){const depth=h/Math.max(4,h*.5-y),tone=rockAtlas[(Math.floor(depth*7)%256)*256+(Math.floor((x/w)*255)%256)]*.6,color=granite?cssPixel(stonefatherGranitePixel(x/w,Math.min(.999,y/height),.82/(1+depth*.006))):moss?mossyShrinePixel(x/w*2,depth*.12,.7/(1+depth*.01)):marble?charityMarblePixel(x/w*2,depth*.12,.95/(1+depth*.01)):packed(tone,tone*.97,tone*1.07,.55/(1+depth*.03));for(let yy=y;yy<Math.min(height,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;}c.putImageData(img,0,0);
 c.save();c.beginPath();c.rect(0,0,w,h*.5);c.clip();
 for(const [i,t]of [1.5,1.1,.79,.57,.40,.28,.19,.12,.075].entries()){const span=w*.57*t,y=h*.5-h*.025*t,apex=y-h*.65*t;c.beginPath();c.moveTo(w*.5-span,y);c.quadraticCurveTo(w*.5,apex,w*.5+span,y);c.strokeStyle=granite?(i%2?'#777b7ddd':'#555a5ddd'):marble?(i%2?'#ffffffdd':'#e5e7e9cc'):i%2?'#65616c88':'#45434f88';c.lineWidth=Math.max(2,t*17);c.stroke();c.strokeStyle=granite?'#24292c':marble?'#a9adb044':'#111017';c.lineWidth=Math.max(1,t*2);c.stroke();for(let j=-2;j<=2;j++){const u=j/3,x=w*.5+span*u,yy=y-h*.325*t*(1-u*u);c.beginPath();c.moveTo(x,yy-t*9);c.lineTo(x+t*4,yy+t*9);c.strokeStyle=granite?'#252a2c':marble?'#9b9fa444':'#17151e';c.stroke();}}
 c.restore();
}
export function drawTunnelDetails(c,w,h,s,map,dx,dy,fov,wallDepth){
 const d=s.dungeon,focal=w/(2*Math.tan(fov/2));
 const project=(x,y)=>{const rx=x-d.x,ry=y-d.y,depth=rx*dx+ry*dy;return {depth,x:w*.5+(-dy*rx+dx*ry)*focal/depth,y:h*.5+h*.425/depth,size:h*.18/depth};};
 const objects=[];for(let y=1;y<14;y++)for(let x=1;x<14;x++)if(map[y][x]===0&&(x*7+y*11)%3===0)objects.push({...project(x+.2,y+.15),rock:true,seed:x+y});
 for(const p of minorResidents(s))objects.push({...project(p.x,p.y),rock:false});
 for(const p of objects.filter(p=>p.depth>.45&&p.depth<9).sort((a,b)=>b.depth-a.depth)){c.save();c.beginPath();for(let x=Math.max(0,Math.floor(p.x-p.size));x<Math.min(w,p.x+p.size);x+=2)if(p.depth<wallDepth[x]+.1)c.rect(x,0,2,h);c.clip();
 if(p.rock){c.fillStyle='#584332';c.strokeStyle='#261d17';c.lineWidth=1;c.beginPath();c.moveTo(p.x-p.size*.7,p.y);c.lineTo(p.x-p.size*.4,p.y-p.size*.35);c.lineTo(p.x+p.size*.15,p.y-p.size*.46);c.lineTo(p.x+p.size*.6,p.y-p.size*.12);c.lineTo(p.x+p.size*.75,p.y);c.closePath();c.fill();c.stroke();}
 else{const eyeY=h*.48;for(const side of [-1,1]){const x=p.x+side*p.size*.27;c.shadowColor='#e0cf72';c.shadowBlur=p.size*.18;c.fillStyle='#d0bd64';c.beginPath();c.ellipse(x,eyeY,p.size*.14,p.size*.07,0,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillStyle='#100f0b';c.beginPath();c.ellipse(x,eyeY,p.size*.025,p.size*.065,0,0,Math.PI*2);c.fill();}}
 c.restore();}
}
