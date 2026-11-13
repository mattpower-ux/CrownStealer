import {artLoaded} from './art-revision.js';
import {minorSiteDefinition} from './minor-sites.js';
import {minorResidents} from './minor-residents.js';
export const isMountainTunnel=d=>d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.kind==='tunnel';
const packed=(r,g,b,light)=>{const n=v=>Math.max(0,Math.min(255,Math.floor(v*light)));return (255<<24)|(n(b)<<16)|(n(g)<<8)|n(r);};
let rockPixels=null;
if(typeof Image!=='undefined'&&typeof document!=='undefined'){const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d');c.drawImage(image,0,0,512,512);rockPixels=c.getImageData(0,0,512,512).data;artLoaded();};image.src='/assets/mountain-rock.webp';}
const rockAtlas=new Float32Array(256*256);
function grain(x,y){let n=Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,scale){const ix=Math.floor(x/scale),iy=Math.floor(y/scale),fx=(x/scale-ix),fy=(y/scale-iy),u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (grain(ix,iy)*(1-u)+grain(ix+1,iy)*u)*(1-v)+(grain(ix,iy+1)*(1-u)+grain(ix+1,iy+1)*u)*v;}
for(let y=0;y<256;y++)for(let x=0;x<256;x++){const broad=noise(x,y,48),chip=noise(x,y,12),fine=noise(x,y,3);const ridge=Math.abs(noise(x+27,y+19,21)-.5);rockAtlas[y*256+x]=42+broad*55+chip*35+fine*17+grain(x,y)*10-(ridge<.022?24:0);}
export function tunnelRockPixel(u,v,light){if(rockPixels){const x=((Math.floor(u*190)%512)+512)%512,y=((Math.floor(v*511)%512)+512)%512,i=(y*512+x)*4;return packed(rockPixels[i],rockPixels[i+1],rockPixels[i+2],light*.8);}const x=((Math.floor(u*91)%256)+256)%256,y=((Math.floor(v*255)%256)+256)%256;const tone=rockAtlas[y*256+x];return packed(tone+19,tone*.69+5,tone*.47+2,light);}
export function obsidianPixel(u,v,light){const fracture=Math.abs(Math.sin(u*9+v*5+Math.sin(v*8)*.8)),shine=Math.max(0,Math.sin(u*5-v*3))**18;const tone=25+Math.sin(u*31+v*19)*4+shine*46;return packed(tone+4,tone+3,tone+13,light*(fracture<.024?.6:1));}
export function drawMountainVault(c,w,h,phase=0){
 const height=Math.ceil(h*.5),img=c.createImageData(w,height),pixels=new Uint32Array(img.data.buffer);
 for(let y=0;y<height;y+=2)for(let x=0;x<w;x+=2){const lateral=(x-w*.5)/w,depth=h/Math.max(3,h*.5-y),curve=Math.sqrt(Math.max(.02,1-lateral*lateral*3));const color=tunnelRockPixel(lateral*depth+phase,depth*.22+curve,.45/(1+depth*.035));for(let yy=y;yy<Math.min(height,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;}
 c.putImageData(img,0,0);

}
export function drawShrineVault(c,w,h){
 const height=Math.ceil(h*.5),img=c.createImageData(w,height),pixels=new Uint32Array(img.data.buffer);
 for(let y=0;y<height;y+=2)for(let x=0;x<w;x+=2){const depth=h/Math.max(4,h*.5-y),tone=rockAtlas[(Math.floor(depth*7)%256)*256+(Math.floor((x/w)*255)%256)]*.6,color=packed(tone,tone*.97,tone*1.07,.55/(1+depth*.03));for(let yy=y;yy<Math.min(height,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;}c.putImageData(img,0,0);
 c.save();c.beginPath();c.rect(0,0,w,h*.5);c.clip();
 for(const [i,t]of [1.5,1.1,.79,.57,.40,.28,.19,.12,.075].entries()){const span=w*.57*t,y=h*.5-h*.025*t,apex=y-h*.65*t;c.beginPath();c.moveTo(w*.5-span,y);c.quadraticCurveTo(w*.5,apex,w*.5+span,y);c.strokeStyle=i%2?'#65616c88':'#45434f88';c.lineWidth=Math.max(2,t*17);c.stroke();c.strokeStyle='#111017';c.lineWidth=Math.max(1,t*2);c.stroke();for(let j=-4;j<=4;j++){const u=j/5,x=w*.5+span*u,yy=y-h*.325*t*(1-u*u);c.beginPath();c.moveTo(x,yy-t*7);c.lineTo(x+t*3,yy+t*7);c.strokeStyle='#17151e';c.stroke();}}
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
