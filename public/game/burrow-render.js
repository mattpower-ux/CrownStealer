import {minorSiteDefinition} from './minor-sites.js';
export function isKoboldBurrow(d){return d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.kind==='koboldCave';}
const pack=(r,g,b)=>(255<<24)|(Math.max(0,Math.min(255,b))<<16)|(Math.max(0,Math.min(255,g))<<8)|Math.max(0,Math.min(255,r));
function hash(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy);return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b;}

export function burrowPixel(surface,u,v,light=1,candle=false){
 const wall=surface==='wall',ceiling=surface==='ceiling';
 const broad=noise(u*4,v*5),clods=noise(u*21,v*25),grit=hash(Math.floor(u*190),Math.floor(v*190));
 const earth=35+broad*38+clods*40+grit*17;
 const seam=Math.abs(Math.sin(v*23+noise(u*6,v*3)*7));
 let shade=light*(wall?.73+.27*Math.sin(Math.PI*Math.max(0,Math.min(1,v))):ceiling?.7:1);
 if(seam<.065&&clods<.43&&broad<.58)shade*=.78;
 let r=earth*shade,g=earth*.69*shade,b=earth*.40*shade;
 // Tangled exposed roots and coarse grit replace masonry joints overhead.
 if(ceiling&&broad>.53&&Math.abs(Math.sin(u*18+Math.sin(v*11)*1.4))<.035){r*=.46;g*=.43;b*=.4;}
 if(surface==='floor'){
  const x=Math.floor(u),y=Math.floor(v),seed=hash(x+19,y-37),a=u-x-.5,bv=v-y-.5;
  const q=seed<.5?a*.8+bv*.6:a*.8-bv*.6,t=seed<.5?bv*.8-a*.6:bv*.8+a*.6;
  const bone=(Math.abs(q)<.18&&Math.abs(t)<.018||((Math.abs(q)-.18)/.032)**2+(t/.032)**2<1);
  const skull=seed>.35&&seed<.85&&((a+.21)/.065)**2+((bv-.22)/.075)**2<1;
  const eye=skull&&(Math.abs(a+.235)<.015||Math.abs(a+.19)<.015)&&Math.abs(bv-.205)<.018;
  const ribs=seed<.27&&Math.abs(q+.19)<.12&&t>.12&&t<.27&&Math.abs(Math.sin((q+.19)*70))<.25;
  if(bone||skull||ribs){const tone=eye?28:177+grit*32;r=tone*light;g=tone*.89*light;b=tone*.66*light;}
 }
 if(wall&&candle){
  const x=u-Math.floor(u)-.5,y=v-.365;
  const halo=Math.max(0,1-Math.sqrt((x/.22)**2+(y/.26)**2));
  r+=halo*halo*75;g+=halo*halo*34;b+=halo*halo*5;
  // Tallow candle, pooled wax and black iron shelf, with a small self-lit flame.
  if(v>.39&&v<.49&&Math.abs(x)<.017){r=192+Math.max(0,-x)*1200;g=r*.84;b=r*.55;}
  if(v>.405&&v<.468&&x>.012&&x<.024){r=169;g=137;b=82;}
  if(v>.489&&v<.506&&Math.abs(x)<.048){r=38;g=32;b=23;}
  if(v>.505&&v<.557&&Math.abs(x)<.009){r=28;g=25;b=20;}
  if(v>.38&&v<.398&&Math.abs(x)<.003){r=30;g=20;b=12;}
  if(y>-.031&&y<.023&&Math.abs(x)<.014*(1-Math.abs(y+.004)/.034)){r=255;g=180+Math.max(0,1-Math.abs(x)/.014)*65;b=65+Math.max(0,1-Math.abs(x)/.014)*90;}
 }
 return pack(r|0,g|0,b|0);
}

export function drawBurrowPlanes(c,w,h,d,dx,dy,fov){
 const image=c.getImageData(0,0,w,h),pixels=new Uint32Array(image.data.buffer),focal=w/(2*Math.tan(fov/2));
 for(let y=0;y<h;y+=2){
  const depth=Math.min(24,h*.425/Math.max(1,Math.abs(y-h/2))),surface=y<h/2?'ceiling':'floor';
  const light=Math.max(.07,.84-depth*.075);
  for(let x=0;x<w;x+=2){
   const side=(x-w/2)*depth/focal,u=d.x+.5+dx*depth-dy*side,v=d.y+.5+dy*depth+dx*side;
   const color=burrowPixel(surface,u,v,light);
   for(let yy=y;yy<Math.min(h,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;
  }
 }
 c.putImageData(image,0,0);
}

export function drawBurrowDarkness(c,w,h){
 const shade=c.createRadialGradient(w*.5,h*.46,h*.13,w*.5,h*.46,Math.max(w,h)*.6);
 shade.addColorStop(0,'#08050300');shade.addColorStop(.62,'#08050318');shade.addColorStop(1,'#040302d9');
 c.fillStyle=shade;c.fillRect(0,0,w,h);
}
