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

export function drawBurrowPlanes(c,w,h,d,dx,dy,fov,map){
 const image=c.getImageData(0,0,w,h),pixels=new Uint32Array(image.data.buffer),focal=w/(2*Math.tan(fov/2));
 for(let y=0;y<h;y+=2){
  const depth=Math.min(24,h*.425/Math.max(1,Math.abs(y-h/2))),surface=y<h/2?'ceiling':'floor';
  const light=Math.max(.07,.84-depth*.075);
  for(let x=0;x<w;x+=2){
   const side=(x-w/2)*depth/focal,u=d.x+.5+dx*depth-dy*side,v=d.y+.5+dy*depth+dx*side;
   const color=(surface==='floor'&&burrowDebrisPixel(u,v,light,map))||burrowPixel(surface,u,v,light);
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

// World-anchored scraps occupy wall corners only; they never change walkable cells.
export function burrowDebrisPixel(u,v,light,map){
 const tx=Math.floor(u),ty=Math.floor(v);if(!map||map[ty]?.[tx]===1)return null;
 const fx=u-tx,fy=v-ty;
 for(const sx of [-1,1])for(const sy of [-1,1]){
  if(map[ty]?.[tx+sx]!==1||map[ty+sy]?.[tx]!==1)continue;
  const x=sx<0?fx:1-fx,y=sy<0?fy:1-fy;if(x>.43||y>.43)continue;
  const seed=hash(tx+sx*9,ty+sy*17),grit=hash(Math.floor(u*170),Math.floor(v*170));
  let tone=null;
  // Faded rag, its torn hem and a folded edge beneath the rubble.
  if(x>.05&&x<.36+Math.sin(y*90)*.013&&y>.08&&y<.29+Math.sin(x*70)*.022)tone=[57+grit*15,49+grit*12,35+grit*9];
  // Splintered boards with visible longitudinal grain.
  const q=x*.8+y*.6,t=y*.8-x*.6;
  if(q>.06&&q<.45&&Math.abs(t-.02)<.025+(q<.39?.009:Math.sin(q*160)*.018)){const g=65+grit*19+Math.sin(t*600)*8;tone=[g,g*.65,g*.32];}
  // Overlapping angular stones: dark skirt and brighter upper facets.
  for(let i=0;i<4;i++){const cx=.07+(i%2)*.12+seed*.03,cy=.06+Math.floor(i/2)*.11;const ax=(x-cx)/(.074+i*.004),ay=(y-cy)/.065;if(Math.abs(ax)*.7+Math.abs(ay)<1.05){const shade=ay<-.12?1.22:ax<0?1:.64;const g=(66+grit*17)*shade;tone=[g,g*.87,g*.68];}}
  if(tone)return pack(...tone.map(n=>Math.floor(n*light)));
 }
 return null;
}

// Only the small luminous overlays animate; the expensive ray-cast image stays cached.
export function drawDungeonFlicker(c,w,h,lights,time=0){
 c.save();c.globalCompositeOperation='screen';
 for(const light of lights||[]){const phase=light.phase,t=time*.001,pulse=.73+Math.sin(t*3.1+phase)*.12+Math.sin(t*7.7+phase*1.7)*.07;
  const x=light.x*w,y=light.y*h,r=light.size*h;
  const halo=c.createRadialGradient(x,y,0,x,y,r*5);halo.addColorStop(0,'rgba(255,172,61,'+(.065*pulse)+')');halo.addColorStop(1,'rgba(255,131,30,0)');c.fillStyle=halo;c.fillRect(x-r*5,y-r*5,r*10,r*10);
  c.globalAlpha=.24*pulse;c.fillStyle='#fff0ae';c.beginPath();c.ellipse(x+Math.sin(t*4+phase)*r*.07,y-r*.1,r*.23,r*(.6+pulse*.13),0,0,Math.PI*2);c.fill();c.globalAlpha=1;
 }
 c.restore();
}

export function drawSecretDoor(c,w,h,d,map,dx,dy,fov,wallDepth){
 const room=d.secretRoom;if(!room)return;
 const side=[[0,-1],[1,0],[0,1],[-1,0]].find(([x,y])=>map[room.y+y]?.[room.x+x]!==undefined&&map[room.y+y]?.[room.x+x]!==1);if(!side)return;
 const [nx,ny]=side,cx=room.x-d.x+nx*.49,cy=room.y-d.y+ny*.49,focal=w/(2*Math.tan(fov/2));
 const project=(u,z)=>{const x=cx-ny*u,y=cy+nx*u,depth=x*dx+y*dy;if(depth<=.08)return null;return {x:w*.5+(-dy*x+dx*y)*focal/depth,y:h*.5-z*h*.85/depth,depth};};
 const corners=[project(-.43,.48),project(.43,.48),project(.43,-.48),project(-.43,-.48)];if(corners.some(p=>!p))return;
 const min=Math.max(0,Math.floor(Math.min(...corners.map(p=>p.x)))),max=Math.min(w,Math.ceil(Math.max(...corners.map(p=>p.x))));if(max<=min)return;
 c.save();c.beginPath();for(let x=min;x<max;x+=2){const t=(x-corners[0].x)/(corners[1].x-corners[0].x),depth=corners[0].depth+(corners[1].depth-corners[0].depth)*t;if(depth<=wallDepth[Math.min(w-1,x)]+.1)c.rect(x,0,2,h);}c.clip();
 c.strokeStyle='#271c10';c.lineWidth=Math.max(2,h*.025/Math.max(.5,corners[0].depth));c.beginPath();c.moveTo(corners[3].x,corners[3].y);for(const p of corners.slice(0,3))c.lineTo(p.x,p.y);c.stroke();c.strokeStyle='#94794b';c.lineWidth=Math.max(1,c.lineWidth*.3);c.stroke();c.restore();
}

export function isRuinedShrine(d){return d?.site==='minor-site'&&minorSiteDefinition(d.minorId)?.kind==='ruinedShrine';}

export function drawBurrowDebris(c,w,h,d,map,dx,dy,fov,wallDepth){
 const piles=[],focal=w/(2*Math.tan(fov/2));
 for(let ty=1;ty<14;ty++)for(let tx=1;tx<14;tx++)if(map[ty][tx]!==1){for(const sx of [-1,1])for(const sy of [-1,1]){
  if(map[ty]?.[tx+sx]!==1||map[ty+sy]?.[tx]!==1)continue;
  const rx=tx-d.x+sx*.32,ry=ty-d.y+sy*.32,depth=rx*dx+ry*dy;if(depth<.45||depth>7)continue;
  const x=w*.5+(-dy*rx+dx*ry)*focal/depth,y=h*.5+h*.425/depth,size=h*.19/depth;
  if(x+size<0||x-size>w||y-size*.4>h)continue;piles.push({x,y,size,depth,seed:hash(tx,ty)});
 }}
 piles.sort((a,b)=>b.depth-a.depth);
 for(const p of piles){c.save();c.beginPath();for(let x=Math.max(0,Math.floor(p.x-p.size));x<Math.min(w,p.x+p.size);x+=2)if(p.depth<=wallDepth[x]+.15)c.rect(x,0,2,h);c.clip();c.translate(p.x,p.y);c.scale(p.size,p.size);c.globalAlpha=Math.max(.35,1-p.depth*.07);
  c.fillStyle='#090704aa';c.beginPath();c.ellipse(0,0,.78,.16,0,0,Math.PI*2);c.fill();
  const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
  poly([[-.66,-.04],[-.45,-.19],[.43,-.11],[.55,-.03],[.41,.03],[.31,.01],[.18,.07],[-.14,.01],[-.4,.06]],'#5e5441');poly([[-.45,-.19],[-.12,-.1],[.43,-.11],[.05,-.03]],'#77664c');
  poly([[-.63,-.06],[-.59,-.14],[.65,-.27],[.58,-.21],[.69,-.2],[-.55,.01]],'#69472b');c.strokeStyle='#a37a49';c.lineWidth=.015;c.beginPath();c.moveTo(-.53,-.08);c.lineTo(.53,-.23);c.stroke();
  for(let i=0;i<5;i++){const x=-.4+i*.19,y=-.04-(i%2)*.1,sz=.15+(i%3)*.03;poly([[x-sz,y],[x-sz*.6,y-sz*.9],[x+sz*.4,y-sz],[x+sz,y-sz*.35],[x+sz*.8,y+.03]],'#514a3c');poly([[x-sz,y],[x-sz*.6,y-sz*.9],[x+sz*.4,y-sz],[x+sz*.1,y-sz*.35]],'#817461');poly([[x+sz*.1,y-sz*.35],[x+sz*.4,y-sz],[x+sz,y-sz*.35],[x+sz*.8,y+.03]],'#625747');}
  c.restore();
 }
}
