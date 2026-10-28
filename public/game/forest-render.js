import {drawDungeonChests} from './chest-render.js';
import {dungeonChests} from './treasure.js';
export const treeFort=new Image();treeFort.src='/assets/elf-tree-fort.webp';
export function drawForest(c,w,h,s,map,dx,dy){
 c.imageSmoothingEnabled=false;const d=s.dungeon,open=d.floor===3&&d.x>=5&&d.x<=9&&d.y>=5&&d.y<=9;
 const ceiling=c.createLinearGradient(0,0,0,h*.5);ceiling.addColorStop(0,open?'#86b7b0':'#171b11');ceiling.addColorStop(1,open?'#d0d7a2':'#423c26');c.fillStyle=ceiling;c.fillRect(0,0,w,h*.5);
 const floor=c.createLinearGradient(0,h*.5,0,h);floor.addColorStop(0,'#665c3c');floor.addColorStop(1,'#28291c');c.fillStyle=floor;c.fillRect(0,h*.5,w,h*.5);
 // Woven overhead roots remain enclosed until the central upper chamber.
 if(!open){c.save();c.globalAlpha=.45;c.imageSmoothingEnabled=false;c.drawImage(rootTexture(d.floor),0,0,w,h*.5);const shade=c.createLinearGradient(0,0,0,h*.5);shade.addColorStop(0,'#08130c66');shade.addColorStop(1,'#08130cee');c.fillStyle=shade;c.fillRect(0,0,w,h*.5);c.restore();}
 if(open){for(let i=0;i<45;i++){const x=i*w/44,y=18+Math.sin(i*2.3)*22;c.fillStyle=['#36532d','#57733a','#77954b'][i%3];c.beginPath();c.ellipse(x,y,w*.035,h*.045,Math.sin(i),0,7);c.fill();}}
 const texture=rootTexture(d.floor),angle=Math.atan2(dy,dx),fov=Math.PI/3;
 for(let col=0;col<w;col+=3){const a=angle+Math.atan((col/w-.5)*2*Math.tan(fov/2)),vx=Math.cos(a),vy=Math.sin(a);let distance=.02,x,y;while(distance<22){x=d.x+.5+vx*distance;y=d.y+.5+vy*distance;if(map[Math.floor(y)]?.[Math.floor(x)]!==0&&map[Math.floor(y)]?.[Math.floor(x)]!==3)break;distance+=.025;}const depth=distance*Math.cos(a-angle),height=h*.85/depth,top=(h-height)/2,fx=x-Math.floor(x),fy=y-Math.floor(y),vertical=fx<.04||fx>.96,u=vertical?fy:fx;
 c.drawImage(texture,Math.floor(u*(texture.width-1)),0,1,texture.height,col,top,4,height);c.fillStyle=`rgba(4,12,5,${Math.min(.87,distance/15+(vertical?.12:0))})`;c.fillRect(col,top,4,height);
 }
 if(s.mode!=='battle')drawForestLandmarks(c,w,h,s,map,dx,dy);
 drawDungeonChests(c,w,h,s,map,dx,dy);
 const z=Math.min(7,w/65),ox=w-15*z-18,oy=18;c.fillStyle='#07170ce8';c.fillRect(ox-6,oy-6,15*z+12,15*z+12);for(let y=0;y<15;y++)for(let x=0;x<15;x++){c.fillStyle=map[y][x]===1?'#526d3c':'#18291c';c.fillRect(ox+x*z,oy+y*z,z-1,z-1);}for(const box of dungeonChests(s,map)){c.fillStyle=box.opened?'#6b5e41':'#e1c378';c.fillRect(ox+box.x*z,oy+box.y*z,z-1,z-1);}c.fillStyle='#e6bd73';const goal=s.dungeon.floor===3?7:13;c.fillRect(ox+goal*z,oy+goal*z,z-1,z-1);if(s.dungeon.floor===2&&!s.flags.pepperFound){c.fillStyle='#c2b4ea';c.fillRect(ox+7*z,oy+7*z,z-1,z-1);}c.fillStyle='#8edaca';c.fillRect(ox+z,oy+z,z-1,z-1);c.fillStyle='#ffe0a0';c.beginPath();c.arc(ox+(s.dungeon.x+.5)*z,oy+(s.dungeon.y+.5)*z,z*.4,0,7);c.fill();c.strokeStyle='#ffe0a0';c.beginPath();c.moveTo(ox+(s.dungeon.x+.5)*z,oy+(s.dungeon.y+.5)*z);c.lineTo(ox+(s.dungeon.x+.5+dx)*z,oy+(s.dungeon.y+.5+dy)*z);c.stroke();
 c.fillStyle='#e6e2bc';c.textAlign='center';c.font='12px Georgia';c.fillText(['NORTH','EAST','SOUTH','WEST'][s.dungeon.dir],w/2,28);
}

function drawForestLandmarks(c,w,h,s,map,dx,dy){
 const marks=[{x:s.dungeon.floor===3?7:13,y:s.dungeon.floor===3?7:13,door:s.dungeon.floor!==3,label:s.dungeon.floor===3?'Haghilda’s sky chamber':'Root door · climb up'},{x:1,y:1,door:true,label:s.dungeon.floor?'Tree door · climb down':'Way out'}];
 if(s.dungeon.floor===2)marks.push({x:7,y:7,label:s.flags.pepperFound?'Fallen elf · searched':'Fallen elf · search the body'});
 for(const m of marks){const rx=m.x-s.dungeon.x,ry=m.y-s.dungeon.y,here=rx===0&&ry===0,depth=here?1:rx*dx+ry*dy,side=-rx*dy+ry*dx;if(depth<=0||Math.abs(side/depth)>.7)continue;let blocked=false;const distance=Math.hypot(rx,ry);for(let t=.15;t<distance;t+=.15)if(map[Math.floor(s.dungeon.y+.5+ry*t/distance)]?.[Math.floor(s.dungeon.x+.5+rx*t/distance)]===1){blocked=true;break;}if(blocked)continue;
 const scale=Math.min(h*.65,h*.6/depth),x=w*.5+side/depth*w*.72,base=here?h*(m.door?.87:.77):h*.5+h*.4/depth;c.save();c.translate(x,base);
 if(m.door){c.fillStyle='#1b2016';c.beginPath();c.roundRect(-scale*.22,-scale*.75,scale*.44,scale*.75,[scale*.2,scale*.2,0,0]);c.fill();c.strokeStyle='#b8a16c';c.lineWidth=scale*.025;c.stroke();c.strokeStyle='#6e5438';for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(k*scale*.07,-scale*.55);c.lineTo(k*scale*.07,0);c.stroke();}c.fillStyle='#e9cb79';c.beginPath();c.arc(scale*.12,-scale*.28,scale*.025,0,7);c.fill();c.font=Math.max(12,scale*.11)+'px Georgia';c.fillStyle='#efdeb0';c.textAlign='center';c.fillText(m.x===1?'↓':'↑',0,-scale*.92);}
 else if(s.dungeon.floor!==3)drawFallenElf(c,scale);
 if(depth<3){c.fillStyle='#f4dfaf';c.font='14px Georgia';c.textAlign='center';c.fillText(m.label,0,24);}c.restore();
 }
}

const rootTextures=new Map();
function rootTexture(level){
 if(rootTextures.has(level))return rootTextures.get(level);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');c.fillStyle='#253023';c.fillRect(0,0,64,64);
 // Low-resolution, six-color pixel roots: crooked tapered branches, never a weave.
 const paths=[[[2,-5],[8,12],[4,25],[16,38],[12,65]],[[38,-3],[29,15],[36,29],[27,45],[35,68]],[[67,9],[48,17],[44,32],[53,46],[49,65]],[[-4,50],[11,45],[21,28],[38,22],[49,3]]];
 for(const points of paths){for(const [width,color,offset] of [[8,'#171e16',1],[5,'#665439',0],[2,'#92734b',-1]]){c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x+offset,y):c.moveTo(x+offset,y));c.stroke();}c.strokeStyle='#665439';c.lineWidth=2;for(let i=1;i<points.length-1;i++){const [x,y]=points[i];c.beginPath();c.moveTo(x,y);c.lineTo(x+(i%2?10:-9),y+5);c.lineTo(x+(i%2?14:-12),y+13);c.stroke();}}
 c.fillStyle='#52633a';for(const [x,y]of [[7,18],[44,7],[26,47],[53,54],[18,6],[4,57]]){c.fillRect(x,y,5,2);c.fillRect(x+2,y-2,4,3);}
 // Quantize antialiased edges to the six-color palette.
 const pixels=c.getImageData(0,0,64,64),palette=[[37,48,35],[23,30,22],[102,84,57],[146,115,75],[82,99,58]];for(let i=0;i<pixels.data.length;i+=4){let best=palette[0],distance=Infinity;for(const rgb of palette){const d=rgb.reduce((sum,n,k)=>sum+(n-pixels.data[i+k])**2,0);if(d<distance){distance=d;best=rgb;}}pixels.data.set([...best,255],i);}c.putImageData(pixels,0,0);
 rootTextures.set(level,canvas);return canvas;
}

// A readable, prone skeleton on a torn elven cloak, anchored to the floor.
function drawFallenElf(c,scale){
 c.save();c.scale(scale/300,scale/300);
 c.fillStyle='#07100966';c.beginPath();c.ellipse(0,5,147,30,0,0,Math.PI*2);c.fill();
 c.fillStyle='#395744';c.strokeStyle='#21372c';c.lineWidth=3;c.beginPath();c.moveTo(-126,-24);c.lineTo(-53,-51);c.lineTo(39,-27);c.lineTo(104,17);c.lineTo(43,8);c.lineTo(57,27);c.lineTo(-25,16);c.lineTo(-109,25);c.closePath();c.fill();c.stroke();
 const bone=(points,width=6)=>{for(const [w,color]of [[width+3,'#544735'],[width,'#e4d5a5']]){c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}};
 // Spine, ribs, pelvis and splayed limbs keep the body horizontal.
 bone([[-72,-12],[-45,-10],[-12,-4],[20,2]],7);
 for(let i=0;i<5;i++){const x=-58+i*11;bone([[x+7,-10],[x,-28],[x+12,-31]],4);bone([[x+7,-8],[x,9],[x+11,13]],4);}
 bone([[12,-6],[27,-13],[39,0],[28,14],[14,9],[12,-6]],7);
 bone([[28,-7],[64,-21],[101,-9],[119,-14]],8);bone([[30,10],[66,21],[108,15],[125,23]],8);
 bone([[-61,-25],[-65,-43],[-34,-49]],6);bone([[-60,9],[-46,28],[-15,32]],6);
 for(let i=0;i<4;i++){bone([[-34,-49],[-21+i*3,-53+i*3]],2);bone([[-15,32],[-4+i*3,29+i*3]],2);}
 c.fillStyle='#e9dcaf';c.strokeStyle='#544735';c.lineWidth=3;c.beginPath();c.ellipse(-96,-13,22,19,-.2,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='#25291e';for(const x of [-105,-89]){c.beginPath();c.ellipse(x,-17,5,6,0,0,Math.PI*2);c.fill();}c.beginPath();c.moveTo(-98,-8);c.lineTo(-93,-8);c.lineTo(-95,-2);c.fill();bone([[-106,4],[-87,6]],5);
 c.strokeStyle='#685943';c.lineWidth=2;for(let x=-104;x<-88;x+=4){c.beginPath();c.moveTo(x,1);c.lineTo(x,8);c.stroke();}
 // Leaf-shaped circlet identifies the former elven inhabitant.
 c.strokeStyle='#b7a05e';c.lineWidth=3;c.beginPath();c.moveTo(-117,-23);c.lineTo(-104,-32);c.lineTo(-86,-31);c.stroke();c.fillStyle='#86aa77';c.beginPath();c.ellipse(-104,-33,7,3,-.5,0,Math.PI*2);c.fill();
 c.restore();
}
