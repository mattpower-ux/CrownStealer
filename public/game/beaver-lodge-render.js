export const TIMBERTOOTH_LODGE_ID='minor-w1-4';

export function isTimbertoothLodge(d){
 return d?.site==='minor-site'&&d.minorId===TIMBERTOOTH_LODGE_ID;
}

const clampByte=n=>Math.max(0,Math.min(255,Math.floor(n)));
const packed=(r,g,b)=>(255<<24)|(clampByte(b)<<16)|(clampByte(g)<<8)|clampByte(r);

export function timberWallPixel(u,v,light,face=0){
 const trunks=11,slot=Math.floor(u*trunks),within=(u*trunks)%1;
 const seam=within<.055||within>.945;
 const edge=Math.abs(within-.5)*2;
 const growth=Math.sin(v*76+slot*2.7+face*.8)*5+Math.sin(v*19-slot)*4;
 const knot=Math.hypot(within-.32-Math.sin(slot*9)*.08,v-.28-(slot%5)*.12)<.055?-24:0;
 const base=seam?27:82+(slot%4)*8-edge*15+growth+knot;
 return packed((base+34)*light,(base+15)*light,(base-5)*light);
}

function roundRect(c,x,y,w,h,r,fill,stroke){
 c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}
}

export function drawBeaverLodgeVault(c,w,h,phase=0){
 const earth=c.createRadialGradient(w*.5,h*.3,20,w*.5,h*.3,w*.8);
 earth.addColorStop(0,'#4b3825');earth.addColorStop(.55,'#251d15');earth.addColorStop(1,'#0d100d');
 c.fillStyle=earth;c.fillRect(0,0,w,h*.54);
 c.lineCap='round';
 for(let i=0;i<15;i++){
  const x=(i+.2)*w/14+(phase%3)*2;
  c.strokeStyle=i%3?'#715036':'#8b6240';c.lineWidth=Math.max(5,w*.009);
  c.beginPath();c.moveTo(x,h*.51);c.quadraticCurveTo(x+(i%2?18:-18),h*.24,x+(i%3-1)*13,-10);c.stroke();
  c.strokeStyle='#b0804b55';c.lineWidth=Math.max(1,w*.0018);c.stroke();
 }
 // Tied cross-braces make the wall read as deliberate construction.
 c.strokeStyle='#3c2719';c.lineWidth=Math.max(6,w*.008);c.beginPath();c.moveTo(0,h*.31);c.lineTo(w,h*.26);c.stroke();
 c.strokeStyle='#a47b4d';c.lineWidth=Math.max(2,w*.0025);
 for(let x=24;x<w;x+=w/9){c.beginPath();c.moveTo(x-8,h*.275);c.lineTo(x+8,h*.315);c.moveTo(x+8,h*.275);c.lineTo(x-8,h*.315);c.stroke();}
 // Roots are retained above the engineered timber shell.
 c.strokeStyle='#4b3827';c.lineWidth=Math.max(3,w*.004);
 for(let i=0;i<9;i++){const x=(i+.4)*w/9;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x-18,h*.06,x+24,h*.09,x+(i%2?28:-28),h*.15);c.stroke();}
}

const LODGE_OBJECTS=[
 {kind:'hearth',x:13.5,y:13.72,scale:1.2},
 {kind:'household',x:13.18,y:13.12,scale:1.05,members:4},
 {kind:'shelf',x:12.48,y:13.72,scale:.92},
 {kind:'branches',x:14.35,y:13.55,scale:.85},
 {kind:'platform',x:12.35,y:12.78,scale:1},
 {kind:'platform',x:14.42,y:12.9,scale:1},
 {kind:'sluice',x:13.72,y:12.28,scale:.95},
];

const BEAVER_HOUSEHOLD_IMAGE=typeof Image==='undefined'?null:Object.assign(new Image(),{src:'/assets/creatures/beaver-household-realistic.png'});
export const beaverHouseholdArtworkReady=()=>Boolean(BEAVER_HOUSEHOLD_IMAGE?.complete&&BEAVER_HOUSEHOLD_IMAGE.naturalWidth);

export function projectLodgeObject(camera,object,dx,dy,fov,w,h){
 const rx=object.x-camera.x,ry=object.y-camera.y,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx;
 if(depth<.28||Math.abs(side/depth)>.82)return null;
 const focal=w/(2*Math.tan(fov/2)),size=Math.min(h*.62,h*.72/depth)*(object.scale||1);
 return {...object,depth,x:w*.5+side*focal/depth,y:Math.min(h*.9,h*.5+h*.39/depth),size};
}

export function visibleLodgeObjects(camera,dx,dy,fov,w,h){
 return LODGE_OBJECTS.map(object=>projectLodgeObject(camera,object,dx,dy,fov,w,h)).filter(Boolean).sort((a,b)=>b.depth-a.depth);
}

function drawHearth(c,o,time){
 const s=o.size,flicker=Math.sin(time/130)*s*.025;
 c.fillStyle='#817665';c.beginPath();c.moveTo(-s*.42,0);c.lineTo(-s*.30,-s*.72);c.lineTo(s*.30,-s*.72);c.lineTo(s*.42,0);c.closePath();c.fill();
 c.strokeStyle='#423c35';c.lineWidth=Math.max(1,s*.012);
 for(let row=0;row<5;row++)for(let col=0;col<4;col++)c.strokeRect(s*(-.3+col*.15+(row%2)*.06),s*(-.68+row*.13),s*.17,s*.11);
 roundRect(c,-s*.25,-s*.28,s*.5,s*.31,s*.055,'#1a1510','#665643');
 c.fillStyle='#ffb33f';c.beginPath();c.moveTo(-s*.12,-s*.03);c.quadraticCurveTo(-s*.15,-s*.25+flicker,0,-s*.42);c.quadraticCurveTo(s*.17,-s*.23-flicker,s*.12,-s*.03);c.fill();
 c.fillStyle='#fff0a6';c.beginPath();c.moveTo(-s*.045,-s*.03);c.quadraticCurveTo(-s*.055,-s*.17,0,-s*.28);c.quadraticCurveTo(s*.06,-s*.15,s*.045,-s*.03);c.fill();
}

function drawBeaverHousehold(c,o){
 const s=o.size;
 if(beaverHouseholdArtworkReady())c.drawImage(BEAVER_HOUSEHOLD_IMAGE,-s*.9,-s*.77,s*1.8,s*1.2);
}

function drawShelf(c,o){
 const s=o.size;c.fillStyle='#563923';c.fillRect(-s*.42,-s*.55,s*.84,s*.55);
 for(let i=0;i<3;i++)c.fillRect(-s*.46,-s*(.45-i*.2),s*.92,s*.045);
 for(let i=0;i<12;i++){c.fillStyle=['#8c7040','#9a5d37','#6f7b3c'][i%3];c.beginPath();c.ellipse(s*(-.32+(i%4)*.21),-s*(.48-Math.floor(i/4)*.2),s*.075,s*.052,0,0,7);c.fill();}
}

function drawBranches(c,o){
 const s=o.size;c.strokeStyle='#85613c';c.lineWidth=Math.max(1,s*.018);
 for(let i=0;i<11;i++){c.beginPath();c.moveTo(-s*.35+i*s*.065,0);c.lineTo(s*.1+i*s*.045,-s*(.5-(i%3)*.05));c.stroke();}
}

function drawPlatform(c,o){
 const s=o.size;c.fillStyle='#765033';c.fillRect(-s*.48,-s*.12,s*.96,s*.12);
 c.strokeStyle='#9a7249';c.lineWidth=Math.max(2,s*.025);c.beginPath();c.moveTo(-s*.43,-s*.12);c.lineTo(-s*.43,-s*.55);c.moveTo(s*.43,-s*.12);c.lineTo(s*.43,-s*.55);c.moveTo(-s*.43,-s*.43);c.lineTo(s*.43,-s*.43);c.stroke();
}

function drawSluice(c,o){
 const s=o.size;c.fillStyle='#17201d';c.fillRect(-s*.30,-s*.42,s*.60,s*.42);c.fillStyle='#315957';c.fillRect(-s*.22,-s*.39,s*.44,s*.39);
 c.strokeStyle='#8b826b';c.lineWidth=Math.max(2,s*.035);c.strokeRect(-s*.30,-s*.42,s*.60,s*.42);
 c.strokeStyle='#9a754c';c.beginPath();c.moveTo(-s*.27,-s*.23);c.lineTo(s*.27,-s*.23);for(const x of [-.18,0,.18]){c.moveTo(s*x,-s*.39);c.lineTo(s*x,-s*.05);}c.stroke();
}

export function drawBeaverLodgeDetails(c,w,h,d,dx,dy,fov,wallDepth,time=0){
 const camera={x:d.x+.5,y:d.y+.5},objects=visibleLodgeObjects(camera,dx,dy,fov,w,h);
 for(const object of objects){
  const half=object.size*(object.kind==='household'?.95:.55),left=Math.max(0,Math.floor(object.x-half)),right=Math.min(w,Math.ceil(object.x+half));
  c.save();c.beginPath();for(let x=left;x<right;x+=2)if(object.depth<=wallDepth[x]+.16)c.rect(x,0,2,h);c.clip();c.translate(object.x,object.y);
  if(object.kind==='hearth')drawHearth(c,object,time);else if(object.kind==='household')drawBeaverHousehold(c,object);else if(object.kind==='shelf')drawShelf(c,object);else if(object.kind==='branches')drawBranches(c,object);else if(object.kind==='platform')drawPlatform(c,object);else if(object.kind==='sluice')drawSluice(c,object);
  c.restore();
 }
}
