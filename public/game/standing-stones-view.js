import {worldTile} from './engine.js';
import {TOWNS,DUNGEONS} from './content.js';
const dreamMaps=new WeakMap();
export function drawHearthmarchDream(canvas,time=0){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;const colors={grass:'#65794c',forest:'#274c37',mountain:'#a3906d',water:'#152f43',road:'#c8ae7c',bridge:'#d2b78b',swamp:'#44674d'};
 let map=dreamMaps.get(canvas);if(!map){
 c.fillStyle='#152f43';c.fillRect(0,0,w,h);const ox=20,oy=18,mw=w-40,mh=h-36;
 for(let y=0;y<96;y++)for(let x=0;x<128;x++){c.fillStyle=colors[worldTile(0,x,y)]||colors.grass;c.fillRect(ox+x/128*mw,oy+y/96*mh,Math.ceil(mw/128),Math.ceil(mh/96));}
 c.font='12px Georgia';c.textAlign='center';for(const p of [...TOWNS,...DUNGEONS].filter(p=>p.region===0)){const x=ox+p.x/128*mw,y=oy+p.y/96*mh;c.fillStyle='#fff2c5';c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();c.lineWidth=3;c.strokeStyle='#142b24';c.strokeText(p.name,x,y-8);c.fillText(p.name,x,y-8);}
 map=c.getImageData(0,0,w,h);dreamMaps.set(canvas,map);}
 c.putImageData(map,0,0);
 // The dream bird circles only this land; the player's real coordinates never change.
 const t=time/4000,bx=w*.5+Math.sin(t)*w*.30,by=h*.48+Math.sin(t*.7)*h*.25;
 c.save();c.translate(bx,by);c.rotate(Math.sin(t)*.1);c.fillStyle='#13232388';c.beginPath();c.ellipse(5,35,47,14,0,0,Math.PI*2);c.fill();c.fillStyle='#bbb9a3';c.beginPath();c.ellipse(0,0,32,23,-.2,0,Math.PI*2);c.fill();c.fillStyle='#929c94';c.beginPath();c.ellipse(-4,-4,23,11,Math.sin(time/180)*.6,0,Math.PI*2);c.fill();c.fillStyle='#d3cfb0';c.beginPath();c.ellipse(26,-22,13,20,-.3,0,Math.PI*2);c.fill();c.fillStyle='#c7a553';c.beginPath();c.moveTo(33,-29);c.quadraticCurveTo(64,-33,57,-13);c.lineTo(35,-12);c.closePath();c.fill();c.fillStyle='#101b1c';c.beginPath();c.arc(30,-29,2.5,0,Math.PI*2);c.fill();c.fillStyle='#294a5c';c.fillRect(-9,-28,12,18);c.fillStyle='#e2bd8f';c.beginPath();c.arc(-3,-34,6,0,Math.PI*2);c.fill();c.restore();
 c.fillStyle='#f8eccb';c.textAlign='left';c.font='bold 18px Georgia';c.fillText('HEARTHMARCH',24,h-23);
}
