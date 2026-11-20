import {isHauntedShipyardDungeon} from './haunted-shipyard.js';

const clamp=value=>Math.max(0,Math.min(255,Math.round(value)));
const packed=(r,g,b,a=255)=>(clamp(a)<<24)|(clamp(b)<<16)|(clamp(g)<<8)|clamp(r);

export function underwaterSceneProfile(dungeon){
 const underwater=isHauntedShipyardDungeon(dungeon);
 return {underwater,torches:!underwater,description:underwater?'Submerged slime-coated shipyard vaults with translucent green-black water.':''};
}

export function underwaterWallPixel(floor,u,v,light){
 const depth=Math.max(0,Math.min(9,floor||0)),slime=.5+.5*Math.sin(u*31+v*17+depth*1.7),seam=(u*7)%1<.055||(v*9)%1<.045;
 const murk=Math.max(.12,light)*(1-depth*.025),r=(seam?27:31+slime*12)*murk,g=(seam?55:77+slime*37)*murk,b=(seam?57:70+slime*22)*murk;
 return packed(r,g,b);
}

export function drawUnderwaterVault(c,w,h,floor=0){
 const water=c.createLinearGradient(0,0,0,h);water.addColorStop(0,'#06151f');water.addColorStop(.48,'#0a2830');water.addColorStop(1,'#071b18');c.fillStyle=water;c.fillRect(0,0,w,h);
 c.fillStyle='#6aa58b12';for(let i=0;i<34;i++){const y=h*(.1+((i*37+floor*11)%79)/100),x=(i*83+floor*47)%w;c.fillRect(x,y,Math.max(12,w*.08),1);}
}

export function drawUnderwaterAtmosphere(c,w,h,dungeon,time=0){
 const phase=(time||0)/1100+(dungeon?.floor||0)*.73;
 c.save();c.fillStyle='#0b61522a';c.fillRect(0,0,w,h);
 for(let i=0;i<42;i++){const x=(i*97.3+(dungeon?.floor||0)*41)%w,y=h-((i*53+phase*(8+i%5))%(h*1.12));c.strokeStyle=i%3?'#b7ead53d':'#d8fff070';c.lineWidth=1+(i%2);c.beginPath();c.arc(x,y,1.5+(i%4),0,Math.PI*2);c.stroke();}
 // Distant marine life is deliberately silhouetted beyond the translucent masonry.
 for(let i=0;i<3;i++){const x=((i*271+phase*12)%1.25)*w-w*.12,y=h*(.2+i*.16);c.fillStyle='#06151288';c.beginPath();c.ellipse(x,y,w*.035,h*.012,0,0,Math.PI*2);c.lineTo(x-w*.055,y-h*.018);c.lineTo(x-w*.055,y+h*.018);c.closePath();c.fill();}
 const veil=c.createLinearGradient(0,0,w,h);veil.addColorStop(0,'#143f4b20');veil.addColorStop(.55,'#0b4f4430');veil.addColorStop(1,'#020b1290');c.fillStyle=veil;c.fillRect(0,0,w,h);c.restore();
}
