import {artLoaded} from './art-revision.js';
// Stone grit is sampled once per cached corridor; metal retains its structural ribs.
export function drawDungeonCeiling(c,w,h,wall,{metal=false,phase=0}={}){
 if(!metal){drawStoneCeiling(c,w,h,wall,phase);return;}
 c.save();c.beginPath();c.rect(0,0,w,h*.5);c.clip();
 const shade=c.createLinearGradient(0,0,0,h*.5);shade.addColorStop(0,wall.map+'66');shade.addColorStop(.65,wall.ceiling);shade.addColorStop(1,'#07100d');c.fillStyle=shade;c.fillRect(0,0,w,h*.5);
 const horizon=h*.5,cx=w*.5,depths=[1.65,1.12,.78,.54,.37,.25,.17,.11,.07];
 // Curved cross ribs and finer staggered joints suggest a shallow barrel vault.
 for(let i=0;i<depths.length;i++){const t=depths[i],span=w*.56*t,y=horizon-h*.025*t,apex=y-h*.68*t;c.beginPath();c.moveTo(cx-span,y);c.quadraticCurveTo(cx,apex,cx+span,y);c.strokeStyle=wall.map+(metal?'aa':'8c');c.lineWidth=Math.max(1,Math.min(6,t*5));c.stroke();if(i+1<depths.length){const next=depths[i+1],mid=(t+next)*.5;for(let j=-4;j<=4;j++){const u=(j+(i%2)*.5)/5;if(Math.abs(u)>=1)continue;const x1=cx+w*.56*t*u,x2=cx+w*.56*next*u;const y1=y-h*.34*t*(1-u*u),y2=horizon-h*.025*next-h*.34*next*(1-u*u);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=wall.map+'42';c.lineWidth=Math.max(.6,mid);c.stroke();}}}
 if(metal){c.fillStyle='#8dbfbd55';for(let i=0;i<18;i++){const y=(i*37+phase*17)%(h*.45),spread=w*(.08+.4*(1-y/(h*.5)));c.fillRect(cx-spread,y,2,2);c.fillRect(cx+spread,y,2,2);}}
 c.restore();
}

function grit(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function stoneNoise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy);return (grit(ix,iy)*(1-a)+grit(ix+1,iy)*a)*(1-b)+(grit(ix,iy+1)*(1-a)+grit(ix+1,iy+1)*a)*b;}
function drawStoneCeiling(c,w,h,wall,phase){
 const height=Math.ceil(h*.5),img=c.createImageData(w,height),pixels=new Uint32Array(img.data.buffer),tint=wall.tint||[0,0,0];
 for(let y=0;y<height;y+=2){const depth=Math.min(30,h*.425/Math.max(1,h*.5-y)),light=Math.max(.09,.55-depth*.035);
  for(let x=0;x<w;x+=2){const u=(x-w*.5)/w*depth*2+phase*.47,v=depth+phase*.73;
   const broad=stoneNoise(u*3,v*3),chips=stoneNoise(u*15,v*15),fine=grit(Math.floor(u*140),Math.floor(v*140)),crack=Math.abs(Math.sin(u*9+stoneNoise(u*2,v*2)*9+v*3));
   let tone=43+broad*55+chips*40+fine*19;if(fine<.035&&chips<.42)tone*=.64;
   const rgb=tint.map((n,i)=>Math.max(0,Math.min(255,Math.floor((tone+n*.5)*(i===2?.92:1)*light))));const color=(255<<24)|(rgb[2]<<16)|(rgb[1]<<8)|rgb[0];
   for(let yy=y;yy<Math.min(height,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;
  }
 }
 c.putImageData(img,0,0);
}

// Pre-sampled relief art shares the wall's perspective, lighting and occlusion.
const burialArt={};
if(typeof Image!=='undefined'&&typeof document!=='undefined')for(const name of ['niche','ossuary']){
 const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0,512,512);burialArt[name]=c.getImageData(0,0,512,512).data;artLoaded();};image.src='/assets/crypt-'+name+'.webp';
}
export function shrineWallInk(kind,u,v,light=1){
 if(kind%5!==0)return null;
 const ossuary=kind%10===0, data=burialArt[ossuary?'ossuary':'niche'];if(!data)return null;
 const left=ossuary?.12:.08,top=ossuary?.07:.31,width=ossuary?.76:.84,height=ossuary?.86:.4;
 const x=(u-left)/width,y=(v-top)/height;if(x<0||x>=1||y<0||y>=1)return null;
 const i=(Math.floor(y*511)*512+Math.floor(x*511))*4;if(data[i+3]<128)return null;
 return '#'+[0,1,2].map(k=>Math.max(0,Math.min(255,Math.floor(data[i+k]*light))).toString(16).padStart(2,'0')).join('');
}
