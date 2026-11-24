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

export function drawBeaverLodgeDetails(c,w,h,time=0){
 c.save();c.lineCap='round';c.lineJoin='round';
 // Raised side galleries, railings, and a stair imply a multi-level household.
 for(const side of [-1,1]){
  const x=side<0?w*.04:w*.76;
  c.fillStyle='#3a2618';c.fillRect(x,h*.53,w*.20,h*.035);
  c.fillStyle='#765033';c.fillRect(x,h*.52,w*.20,h*.018);
  c.strokeStyle='#9a7249';c.lineWidth=Math.max(3,w*.004);
  c.beginPath();c.moveTo(x,h*.52);c.lineTo(x,h*.43);c.moveTo(x+w*.20,h*.52);c.lineTo(x+w*.20,h*.43);c.moveTo(x,h*.46);c.lineTo(x+w*.20,h*.46);c.stroke();
 }
 c.strokeStyle='#8d6742';c.lineWidth=Math.max(4,w*.006);c.beginPath();c.moveTo(w*.25,h*.57);c.lineTo(w*.36,h*.45);c.stroke();
 c.strokeStyle='#c09864';c.lineWidth=Math.max(2,w*.0025);for(let i=0;i<6;i++){const t=i/5;c.beginPath();c.moveTo(w*(.25+.11*t)-10,h*(.57-.12*t));c.lineTo(w*(.25+.11*t)+10,h*(.57-.12*t));c.stroke();}
 // Stone hearth and fire serve as the domestic focal point.
 const flicker=Math.sin(time/130)*3;
 c.fillStyle='#817665';c.beginPath();c.moveTo(w*.42,h*.59);c.lineTo(w*.44,h*.43);c.lineTo(w*.56,h*.43);c.lineTo(w*.58,h*.59);c.closePath();c.fill();
 for(let row=0;row<5;row++)for(let col=0;col<4;col++){c.strokeStyle='#423c35';c.lineWidth=1;c.strokeRect(w*(.44+col*.03+(row%2)*.012),h*(.44+row*.03),w*.033,h*.025);}
 roundRect(c,w*.455,h*.545,w*.09,h*.075,w*.012,'#1a1510','#665643');
 c.fillStyle='#ffb33f';c.beginPath();c.moveTo(w*.48,h*.60);c.quadraticCurveTo(w*.475,h*.55+flicker,w*.50,h*.535);c.quadraticCurveTo(w*.525,h*.56-flicker,w*.52,h*.60);c.fill();
 c.fillStyle='#fff0a6';c.beginPath();c.moveTo(w*.495,h*.60);c.quadraticCurveTo(w*.492,h*.575,w*.505,h*.56);c.quadraticCurveTo(w*.515,h*.58,w*.512,h*.60);c.fill();
 // Food shelves and bundled branches distinguish the home from a mine or camp.
 c.fillStyle='#563923';c.fillRect(w*.08,h*.58,w*.16,h*.16);for(let i=0;i<3;i++)c.fillRect(w*.075,h*(.61+i*.052),w*.17,h*.012);
 for(let i=0;i<12;i++){c.fillStyle=['#8c7040','#9a5d37','#6f7b3c'][i%3];c.beginPath();c.ellipse(w*(.095+(i%4)*.035),h*(.60+Math.floor(i/4)*.052),w*.012,h*.009,0,0,7);c.fill();}
 c.strokeStyle='#85613c';c.lineWidth=Math.max(2,w*.002);for(let i=0;i<11;i++){c.beginPath();c.moveTo(w*.78+i*w*.012,h*.68);c.lineTo(w*.85+i*w*.009,h*.57+(i%3)*.01);c.stroke();}
 // A stone-lined sluice carries water safely through the lodge.
 c.fillStyle='#171d18';c.beginPath();c.moveTo(w*.60,h*.61);c.lineTo(w*.67,h*.61);c.lineTo(w*.78,h);c.lineTo(w*.53,h);c.closePath();c.fill();
 c.fillStyle='#315957';c.beginPath();c.moveTo(w*.615,h*.62);c.lineTo(w*.655,h*.62);c.lineTo(w*.73,h);c.lineTo(w*.57,h);c.closePath();c.fill();
 c.strokeStyle='#8b826b';c.lineWidth=Math.max(5,w*.006);c.beginPath();c.moveTo(w*.60,h*.61);c.lineTo(w*.53,h);c.moveTo(w*.67,h*.61);c.lineTo(w*.78,h);c.stroke();
 c.strokeStyle='#9a754c';c.lineWidth=Math.max(3,w*.004);c.beginPath();c.moveTo(w*.60,h*.70);c.lineTo(w*.70,h*.70);c.moveTo(w*.615,h*.685);c.lineTo(w*.615,h*.74);c.moveTo(w*.645,h*.685);c.lineTo(w*.645,h*.76);c.moveTo(w*.675,h*.685);c.lineTo(w*.675,h*.79);c.stroke();
 c.restore();
}
