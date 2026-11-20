import {estateFloorRole,isPelagosEstateDungeon} from './pelagos-estates.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pixel=(r,g,b)=>(255<<24)|(clamp(b,0,255)<<16)|(clamp(g,0,255)<<8)|clamp(r,0,255);

export function estateWallPixel(face,u,v,light,role='ground'){
 const cellar=role==='cellar',base=cellar?[116,112,101]:[220,216,202],joint=(v*7)%1<.045||((u*6+(Math.floor(v*7)%2)*.5)%1)<.035,vein=Math.sin(u*61+v*43+face*1.7)>.94;
 const shade=joint?-34:vein?-16:Math.sin(u*83+v*37+face)*4,wet=cellar&&v>.62?12:0;
 return pixel(...base.map((n,i)=>Math.floor((n+shade-(i===0?wet:0))*light)));
}

export function drawEstateVault(c,w,h,d){
 const role=estateFloorRole(d);c.save();c.strokeStyle=role==='cellar'?'#827b6b99':'#f1ead999';c.lineWidth=Math.max(2,w*.004);
 for(let i=0;i<5;i++){const inset=i*w*.085;c.beginPath();c.moveTo(inset,h*.51);c.quadraticCurveTo(w/2,h*(.08+i*.025),w-inset,h*.51);c.stroke();}
 if(role!=='cellar')for(let i=0;i<4;i++){c.fillStyle=['#6aa9c843','#d5ae5840','#a86d9140'][i%3];c.beginPath();c.moveTo(w*(.16+i*.2),h*.49);c.lineTo(w*(.21+i*.19),h*.2);c.lineTo(w*(.29+i*.18),h*.49);c.fill();}
 c.restore();
}

export function drawEstateAtmosphere(c,w,h,d,time=0){
 const role=estateFloorRole(d);c.save();
 if(role==='cellar'){c.fillStyle='#342a1b25';c.fillRect(0,h*.5,w,h*.5);for(let i=0;i<6;i++){const x=(i+.4)*w/6;c.fillStyle='#5b3829aa';c.fillRect(x,h*.65,w*.06,h*.16);c.strokeStyle='#9a7655';c.strokeRect(x,h*.65,w*.06,h*.16);}}
 else{const glow=c.createLinearGradient(0,h*.2,w,h*.8);glow.addColorStop(0,'#a9d8ef1f');glow.addColorStop(.5,'#fff5d60b');glow.addColorStop(1,'#c985a518');c.fillStyle=glow;c.fillRect(0,0,w,h);c.fillStyle='#e9e3d055';for(let i=0;i<3;i++)c.fillRect(w*(.2+i*.3),h*.67,w*.025,h*.18);}
 c.restore();
}

export function drawEstateContainer(c,size,opened,role='ground'){
 c.save();c.fillStyle='#161b1a88';c.beginPath();c.ellipse(0,size*.25,size*.5,size*.12,0,0,Math.PI*2);c.fill();c.fillStyle=role==='cellar'?'#68432d':'#d6cfb8';c.strokeStyle=role==='cellar'?'#a47a50':'#8e8879';c.lineWidth=Math.max(1,size*.035);c.fillRect(-size*.42,-size*.12,size*.84,size*.35);c.strokeRect(-size*.42,-size*.12,size*.84,size*.35);if(opened){c.save();c.translate(0,-size*.13);c.rotate(-.38);c.fillRect(-size*.42,-size*.13,size*.84,size*.15);c.strokeRect(-size*.42,-size*.13,size*.84,size*.15);c.restore();}else{c.fillRect(-size*.42,-size*.25,size*.84,size*.15);c.strokeRect(-size*.42,-size*.25,size*.84,size*.15);}c.fillStyle='#c5a657';c.fillRect(-size*.035,-size*.03,size*.07,size*.12);c.restore();
}

export function estateRenderProfile(d){return isPelagosEstateDungeon(d)?{role:estateFloorRole(d),features:estateFloorRole(d)==='cellar'?['wine racks','casks','damp alabaster']:['stained glass','statuary','baths','ballroom']} : null;}
