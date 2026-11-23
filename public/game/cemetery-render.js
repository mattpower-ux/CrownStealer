import {isOpenAirCemetery,minorSiteDefinition} from './minor-sites.js';
export {isOpenAirCemetery};
export const isCemeteryDungeon=d=>!!d&&(d.site==='minor-site'?minorSiteDefinition(d.minorId)?.kind==='cemetery':!d.site&&!d.royal&&!d.ship&&!d.expedition&&d.index===0);
const CEMETERY_FACADES=['vault-door','memorial-niche','sealed-crypt','buttressed-vault','family-chapel'];
const coffinSkeleton=typeof Image==='undefined'?null:new Image();
if(coffinSkeleton)coffinSkeleton.src='/assets/cemetery-skeleton.png?v=20261123b';
export const cemeteryFacadeKind=(x,y,vertical=false)=>CEMETERY_FACADES[Math.abs(x*17+y*29+(vertical?7:0))%CEMETERY_FACADES.length];
export const cemeteryStonePalette=()=>({face:'#c7cec7',side:'#59645f',edge:'#e0e3d8',moss:'#526451'});
const fract=n=>n-Math.floor(n);
const stoneNoise=(x,y,seed=0)=>fract(Math.sin(Math.floor(x)*127.1+Math.floor(y)*311.7+seed*74.7)*43758.5453);
const packedStone=(r,g,b,light=1)=>{const channel=n=>Math.max(0,Math.min(255,Math.floor(n*light)));return (255<<24)|(channel(b)<<16)|(channel(g)<<8)|channel(r);};
export function cemeteryMarblePixel(face,u,v,light=1){
 const broad=.52+Math.sin(u*29+face)*.16+Math.sin(v*41-u*11+face*.7)*.12+Math.sin((u+v)*79-face)*.07;
 const grit=stoneNoise(u*173,v*181,face+3),flow=v+Math.sin(u*4.8+face*.73)*.085+Math.sin(u*13-v*3+face)*.026;
 const vein=Math.abs(Math.sin(flow*17+Math.sin(u*7+v*4+face)*.65));
 const runoff=stoneNoise(u*41,face,9)>.73&&Math.sin(v*38+stoneNoise(u*41,face,2)*8)>.12;
 const pit=grit>.965,darkVein=vein<.045,softVein=vein<.18;
 const moss=v>.72&&stoneNoise(u*37,v*29,face+17)>.76;
 if(moss){const growth=58+grit*25;return packedStone(growth*.70,growth,growth*.58,light);}
 if(pit)return packedStone(58,61,59,light);
 if(darkVein)return packedStone(66+broad*19,76+broad*21,70+broad*18,light);
 if(softVein)return packedStone(126+broad*22,139+broad*23,131+broad*21,light);
 if(runoff)return packedStone(91+broad*26,96+broad*25,94+broad*22,light);
 const mineral=stoneNoise(u*113,v*109,face+11)>.94;
 const tone=174+broad*28+grit*9;
 return mineral?packedStone(tone+10,tone-12,tone-24,light):packedStone(tone,tone+2,tone+1,light);
}
const packedCss=color=>'#'+[color&255,(color>>>8)&255,(color>>>16)&255].map(channel=>channel.toString(16).padStart(2,'0')).join('');
export function cemeteryPropProfile(kind,seed=0){
 const dimensional=new Set(['headstone','obelisk','mausoleum','vault','crypt']);
 return {gothic:dimensional.has(kind),depth:dimensional.has(kind)?.12+(Math.abs(seed)%3)*.025:0,facets:dimensional.has(kind)?3+Math.abs(seed)%3:1};
}
export function cemeteryFacadeInk(kind,u,v){
 const joint=v<.035||v>.965||u<.025||u>.975||Math.abs((u*5+(Math.floor(v*7)%2)*.5)%1)<.025||Math.abs((v*7)%1)<.025;
 if(joint)return '#171c20';
 if(kind==='vault-door'){
  const arch=Math.abs(u-.5)<.28&&v>.22&&v<.94&&(v>.43||((u-.5)/.28)**2+((v-.43)/.22)**2<1);
  if(arch)return u%0.105<.025||Math.abs(v-.66)<.025?'#4a5358':'#090d10';
 }
 if(kind==='memorial-niche'){
  const niche=Math.abs(u-.5)<.24&&v>.25&&v<.78;
  if(niche)return Math.abs(u-.5)<.045&&v>.40?'#786b52':'#11171a';
  if(v>.80&&v<.88)return '#40484a';
 }
 if(kind==='sealed-crypt'){
  if(u>.14&&u<.86&&v>.28&&v<.82)return (u*8)%1<.08||(v*5)%1<.07?'#20262a':'#353c40';
  if(v>.20&&v<.28)return '#4b5356';
 }
 if(kind==='buttressed-vault'){
  if(u<.14||u>.86)return v>.12?'#242a2d':'#454d50';
  if(Math.abs(u-.5)<.22&&v>.36)return '#090d0f';
 }
 if(kind==='family-chapel'){
  if(v<.18+Math.abs(u-.5)*.48)return '#1a2024';
  if(Math.abs(u-.5)<.19&&v>.42)return '#070b0d';
  if(v>.30&&v<.38)return '#4f4b40';
 }
 const face=CEMETERY_FACADES.indexOf(kind),soot=stoneNoise(u*91,v*87,face+31)>.988,lichen=v>.68&&stoneNoise(u*43,v*39,face+23)>.94;
 return soot?'#171b1e':lichen?'#27372d':packedCss(cemeteryMarblePixel(face,u,v,.84));
}
function poly(c,points,color,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function stroke(c,points,color,width=.015){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function drawMarbleVeins(c,shape,seed=0){
 const xs=shape.map(([x])=>x),ys=shape.map(([,y])=>y),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),height=bottom-top;
 c.save();c.beginPath();shape.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();c.lineCap='round';
 c.fillStyle='#c7cec7';c.globalAlpha=.58;c.fillRect(left,top,right-left,height);c.globalAlpha=1;
 for(let i=0;i<8;i++){
  const y=top+height*(.10+i*.115)+Math.sin(seed*1.7+i)*height*.035,bend=Math.sin(seed*.83+i*1.9)*height*.12;
  c.beginPath();c.moveTo(left-.05,y);c.quadraticCurveTo((left+right)/2,y+bend,right+.05,y-Math.sin(seed+i)*height*.06);
  c.strokeStyle=['#526d61','#708c7e','#9cafa3'][i%3];c.lineWidth=i%3===0?.030:.020;c.globalAlpha=i%3===0?.88:.70;c.stroke();
 }
 c.globalAlpha=.30;c.fillStyle='#526451';for(let i=0;i<7;i++){const x=left+(right-left)*stoneNoise(i,seed,41),y=bottom-height*.16*stoneNoise(seed,i,43);c.beginPath();c.ellipse(x,y,.018+.025*stoneNoise(i,seed,47),.010+.018*stoneNoise(seed,i,53),0,0,Math.PI*2);c.fill();}
 c.restore();
}
function drawCoffinSkeleton(c){
 if(coffinSkeleton?.complete&&coffinSkeleton.naturalWidth){
  c.save();
  c.beginPath();c.moveTo(-.18,-.77);c.lineTo(.18,-.77);c.lineTo(.35,-.61);c.lineTo(.23,-.20);c.lineTo(-.23,-.20);c.lineTo(-.35,-.61);c.closePath();c.clip();
  c.fillStyle='#040706aa';c.beginPath();c.ellipse(0,-.46,.18,.26,0,0,Math.PI*2);c.fill();
  c.transform(1,-.035,.055,1,0,0);c.filter='contrast(1.08) saturate(.72) brightness(.92) drop-shadow(0 .012px .010px #000a)';
  c.drawImage(coffinSkeleton,-.23,-.79,.46,.64);c.restore();
  return;
 }
 const bone='#d6d0b4',shadow='#77725f',hollow='#20231e';
 c.save();c.lineCap='round';c.lineJoin='round';
 c.fillStyle=bone;c.beginPath();c.ellipse(0,-.645,.074,.066,0,0,Math.PI*2);c.fill();
 c.fillStyle=hollow;for(const x of [-.027,.027]){c.beginPath();c.ellipse(x,-.657,.017,.021,0,0,Math.PI*2);c.fill();}
 poly(c,[[-.017,-.628],[0,-.643],[.017,-.628],[.010,-.618],[-.010,-.618]],hollow);
 poly(c,[[-.052,-.612],[.052,-.612],[.044,-.575],[-.040,-.575]],'#928e77',shadow);
 for(const x of [-.031,-.010,.010,.031])stroke(c,[[x,-.609],[x,-.579]],shadow,.006);
 stroke(c,[[0,-.575],[0,-.335]],shadow,.018);
 for(let i=0;i<5;i++){
  const y=-.548+i*.042,reach=.095-i*.006;
  c.beginPath();c.moveTo(0,y);c.quadraticCurveTo(-reach,y-.026,-reach-.018,y+.026);c.strokeStyle=bone;c.lineWidth=.011;c.stroke();
  c.beginPath();c.moveTo(0,y);c.quadraticCurveTo(reach,y-.026,reach+.018,y+.026);c.stroke();
 }
 poly(c,[[-.075,-.337],[0,-.305],[.075,-.337],[.052,-.278],[0,-.292],[-.052,-.278]],'#918d76',shadow);
 const limbs=[
  [[-.086,-.530],[-.140,-.442],[-.048,-.365]],[[.086,-.530],[.140,-.442],[.048,-.365]],
  [[-.046,-.288],[-.082,-.228],[-.073,-.170]],[[.046,-.288],[.082,-.228],[.073,-.170]],
 ];
 for(const points of limbs){stroke(c,points,bone,.022);for(const [x,y] of points.slice(1)){c.beginPath();c.arc(x,y,.017,0,Math.PI*2);c.fillStyle=bone;c.fill();}}
 stroke(c,[[-.073,-.170],[-.018,-.158]],bone,.018);stroke(c,[[.073,-.170],[.018,-.158]],bone,.018);
 c.restore();
}
export function drawCemeteryCoffin(c,size,opened,{stone=true}={}){
 c.save();c.scale(size,size*.62);c.lineJoin='round';c.lineWidth=.025;
 const outline=[[-.22,-.84],[.22,-.84],[.43,-.64],[.28,-.13],[-.28,-.13],[-.43,-.64]];
 poly(c,[[-.43,-.64],[-.28,-.13],[.28,-.13],[.43,-.64],[.43,-.47],[.28,.04],[-.28,.04],[-.43,-.47]],stone?'#45483e':'#30231e','#171813');
 const lid=c.createLinearGradient(-.4,-.8,.4,0);lid.addColorStop(0,stone?'#e0e3d8':'#6f5740');lid.addColorStop(.5,stone?'#c7cec7':'#4b382b');lid.addColorStop(1,stone?'#939f97':'#35271e');
 poly(c,outline,lid,stone?'#b4b5a0':'#a08657');
 if(stone)drawMarbleVeins(c,outline,3);
 if(opened){poly(c,[[-.18,-.77],[.18,-.77],[.35,-.61],[.23,-.20],[-.23,-.20],[-.35,-.61]],'#0c1110','#56574b');
  c.save();c.translate(.38,-.15);c.rotate(.27);poly(c,outline,stone?'#c7cec7':'#594430','#e0e3d8');if(stone)drawMarbleVeins(c,outline,7);stroke(c,[[-.14,-.68],[.12,-.57],[-.04,-.46],[.15,-.24]],'#46554e',.022);c.restore();
  drawCoffinSkeleton(c);
 }else{
  for(const x of [-.13,0,.13])stroke(c,[[x,-.78],[x,-.20]],stone?'#5b6558':'#281f18',.008);
  stroke(c,[[0,-.69],[0,-.32]],stone?'#c5c3a6':'#a39369',.034);stroke(c,[[-.12,-.57],[.12,-.57]],stone?'#c5c3a6':'#a39369',.034);
  for(const y of [-.67,-.29])for(const x of [-.27,.27]){c.fillStyle='#9e8a5e';c.fillRect(x-.025,y,.05,.025);}
 }
 stroke(c,[[-.27,-.10],[.27,-.10]],stone?'#858d7c':'#785c39',.013);c.restore();
}
export function cemeteryRemains(d,map){
 const remains=isOpenAirCemetery(d)?[
  {x:4,y:3,kind:'mausoleum'},{x:10,y:4,kind:'vault'},{x:3,y:10,kind:'crypt'},
  {x:8,y:3,kind:'vault'},{x:11,y:8,kind:'mausoleum'},{x:2,y:7,kind:'obelisk'},
  {x:7,y:10,kind:'obelisk'},{x:11,y:11,kind:'vault'},{x:4,y:11,kind:'mausoleum'},
  {x:6,y:4,kind:'headstone'},{x:7,y:4,kind:'headstone'},
  {x:5,y:8,kind:'sarcophagus'},{x:9,y:9,kind:'sarcophagus'},{x:6,y:11,kind:'headstone'},{x:9,y:5,kind:'headstone'},
  {x:5.35,y:5.2,kind:'skull',seed:1},{x:8.25,y:7.1,kind:'femur',seed:2},{x:10.4,y:10.1,kind:'ribcage',seed:3},
 ]:[];
 for(let y=1;y<map.length-1;y++)for(let x=1;x<map[y].length-1;x++){
  if(map[y][x]!==0||x===1&&y===1||x===13&&y===13)continue;
  const seed=(x*31+y*47+(d.floor||0)*17+(d.index||0)*7)%19;
  if(seed>(isOpenAirCemetery(d)?7:2))continue;
  const wall=[[0,-1],[1,0],[0,1],[-1,0]].find(([dx,dy])=>map[y+dy]?.[x+dx]===1);if(!wall)continue;
  const kind=seed===0?'sarcophagus':isOpenAirCemetery(d)&&seed===3?'obelisk':isOpenAirCemetery(d)&&seed===4?'vault':isOpenAirCemetery(d)&&seed===5?'skull':isOpenAirCemetery(d)&&seed===6?'femur':isOpenAirCemetery(d)&&seed===7?'ribcage':'headstone';
  remains.push({x:x+wall[0]*.30,y:y+wall[1]*.30,kind,seed});
 }
 return remains;
}
export function drawCemeteryCrypt(c,size,variant='crypt',seed=0){
 c.save();c.scale(size,size);c.lineWidth=.022;
 poly(c,[[-.68,-.04],[.62,-.04],[.57,-.17],[-.60,-.17]],'#252c30','#111619');
 poly(c,[[-.60,-.17],[.32,-.17],[.32,-1.18],[-.60,-1.18]],variant==='mausoleum'?'#c7cec7':variant==='vault'?'#b8c2bb':'#d0d5ce','#59645f');
 drawMarbleVeins(c,[[-.60,-.17],[.32,-.17],[.32,-1.18],[-.60,-1.18]],seed);
 poly(c,[[.32,-.17],[.62,-.39],[.62,-1.31],[.32,-1.18]],'#171d20','#0b0f11');
 poly(c,[[-.70,-1.18],[-.15,-1.66],[.43,-1.18]],'#3d4447','#181e21');
 poly(c,[[-.15,-1.66],[.13,-1.82],[.73,-1.33],[.43,-1.18]],'#1d2428','#0e1316');
 c.beginPath();c.moveTo(-.39,-.17);c.lineTo(-.39,-.67);
 c.quadraticCurveTo(-.39,-.98,-.12,-1.03);c.quadraticCurveTo(.14,-.98,.14,-.67);
 c.lineTo(.14,-.17);c.closePath();c.fillStyle='#05090b';c.fill();c.strokeStyle='#535d62';c.stroke();
 for(const x of [-.32,-.22,-.12,-.02,.08])stroke(c,[[x,-.77],[x,-.18]],'#333c41',.026);
 stroke(c,[[-.38,-.44],[.13,-.44]],'#444e53',.038);
 for(const x of [-.53,.26]){poly(c,[[x,-1.13],[x+.07,-1.34],[x+.14,-1.13]],'#596166','#161c1f');stroke(c,[[x+.07,-1.34],[x+.07,-1.49]],'#434c50',.024);}
 c.restore();
}
export function drawCemeteryObelisk(c,size,seed=0){
 c.save();c.scale(size,size);c.lineWidth=.018;
 poly(c,[[-.22,-.08],[.22,-.08],[.16,-.24],[-.16,-.24]],'#252c2f','#101518');
 poly(c,[[-.12,-.24],[.12,-.24],[.09,-1.02],[-.09,-1.02]],'#c7cec7','#59645f');
 drawMarbleVeins(c,[[-.12,-.24],[.12,-.24],[.09,-1.02],[-.09,-1.02]],seed);
 poly(c,[[.12,-.24],[.19,-.31],[.15,-1.06],[.09,-1.02]],'#171d20','#0b0f11');
 poly(c,[[-.09,-1.02],[0,-1.34],[.09,-1.02]],'#444c50','#1b2225');
 stroke(c,[[0,-.91],[0,-.55]],'#7c7157',.026);stroke(c,[[-.09,-.76],[.09,-.76]],'#7c7157',.026);c.restore();
}
export function drawGothicHeadstone(c,size,seed=0){
 c.save();c.scale(size,size);const offset=.12,face=[[-.34,-.04],[-.34,-.65],[-.27,-.92],[0,-1.18],[.27,-.92],[.34,-.65],[.34,-.04]];
 poly(c,face.map(([x,y])=>[x+offset,y-.08]),'#151a1d','#080c0e');
 const stone=c.createLinearGradient(-.34,-1.1,.34,0);stone.addColorStop(0,'#e0e3d8');stone.addColorStop(.48,'#c7cec7');stone.addColorStop(1,'#929e96');poly(c,face,stone,'#e0e3d8');
 drawMarbleVeins(c,face,seed);
 poly(c,[[-.34,-.65],[0,-1.18],[.04,-.62]],'#3a4145');poly(c,[[.04,-.62],[0,-1.18],[.34,-.65]],'#272d31');
 c.fillStyle='#111619';c.beginPath();c.ellipse(-.08,-.78,.055,.065,0,0,Math.PI*2);c.ellipse(.08,-.78,.055,.065,0,0,Math.PI*2);c.fill();
 poly(c,[[-.04,-.69],[0,-.74],[.04,-.69],[0,-.66]],'#14191c');for(const x of [-.075,-.025,.025,.075])stroke(c,[[x,-.64],[x,-.57]],'#151a1d',.014);
 stroke(c,[[-.21,-.43],[.19,-.43]],'#71715f',.019);stroke(c,[[-.17,-.35],[.15,-.35]],'#55584f',.014);
 stroke(c,[[-.23,-.90],[-.14,-.83],[-.20,-.70]],'#171d20',.018);if(seed%2)stroke(c,[[.21,-.56],[.12,-.48],[.18,-.35]],'#151b1e',.016);c.restore();
}
function drawHumanRemains(c,size,kind,seed=0){
 c.save();c.scale(size,size);c.lineCap='round';c.strokeStyle='#b1a88c';c.fillStyle='#a99f82';
 if(kind==='skull'){
  c.beginPath();c.ellipse(0,-.18,.18,.15,-.1,0,Math.PI*2);c.fill();poly(c,[[-.12,-.12],[.12,-.12],[.09,.01],[-.08,.02]],'#91886f');
  c.fillStyle='#262722';for(const x of [-.07,.07]){c.beginPath();c.ellipse(x,-.20,.045,.052,0,0,Math.PI*2);c.fill();}poly(c,[[-.025,-.12],[0,-.16],[.025,-.12]],'#292a24');
  for(const x of [-.055,-.018,.018,.055])stroke(c,[[x,-.08],[x,-.01]],'#5f5b4e',.012);
 }else if(kind==='femur'){
  c.rotate((seed%5-2)*.18);c.lineWidth=.09;stroke(c,[[-.27,-.12],[.27,-.02]],'#b1a88c',.09);for(const [x,y] of [[-.29,-.13],[.30,-.01]]){c.beginPath();c.arc(x,y,.075,0,Math.PI*2);c.fill();}
 }else{
  c.lineWidth=.035;stroke(c,[[0,-.34],[0,.02]],'#978f77',.042);for(let i=0;i<5;i++){const y=-.29+i*.065;c.beginPath();c.moveTo(0,y);c.quadraticCurveTo(-.25,y-.08,-.29,y+.05);c.moveTo(0,y);c.quadraticCurveTo(.25,y-.08,.29,y+.05);c.stroke();}
  poly(c,[[-.20,.02],[0,.10],[.20,.02],[.12,.14],[-.12,.14]],'#928a72');
 }c.restore();
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
 if(isOpenAirCemetery(d)){const fog=c.createLinearGradient(0,h*.55,0,h);fog.addColorStop(0,'#9fb2bd00');fog.addColorStop(.62,'#82949d16');fog.addColorStop(1,'#53636b2a');c.fillStyle=fog;c.fillRect(0,h*.55,w,h*.45);}
 for(const p of objects){c.save();c.beginPath();for(let x=Math.max(0,Math.floor(p.x-p.size));x<Math.min(w,p.x+p.size);x+=2)if(p.depth<=wallDepth[x]+.1)c.rect(x,0,2,h);c.clip();c.translate(p.x,p.y);c.globalAlpha=Math.max(.42,1-p.depth*.06);
 c.fillStyle='#050909aa';c.beginPath();c.ellipse(0,0,p.size*.65,p.size*.13,0,0,Math.PI*2);c.fill();
 if(['crypt','mausoleum','vault'].includes(p.kind))drawCemeteryCrypt(c,p.size,p.kind,p.seed);
 else if(p.kind==='obelisk')drawCemeteryObelisk(c,p.size,p.seed);
 else if(p.kind==='sarcophagus')drawCemeteryCoffin(c,p.size,true,{stone:true});
 else if(['skull','femur','ribcage'].includes(p.kind))drawHumanRemains(c,p.size*.72,p.kind,p.seed);
 else drawGothicHeadstone(c,p.size,p.seed);
 c.restore();}
}
