import {caveProfile} from './cave-profiles.js';
import {minorSiteDefinition} from './minor-sites.js';

const HEAT_CREATURE=/\b(dragon|drake|wyrm|fire[ -]?lizard|fire[ -]?imp)\b/i;

export function heatLairProfile(d){
 if(!d)return null;
 const minor=d.site==='minor-site'?minorSiteDefinition(d.minorId):null;
 const cave=caveProfile(d.expedition);
 const name=minor?.name||cave?.name||'';
 const natural=minor?.kind==='koboldCave'||d.site==='firedrak'||cave&&['cave','mine'].includes(cave.icon);
 if(!natural||!(d.site==='firedrak'||['wyrm','fireImp'].includes(minor?.occupant)||HEAT_CREATURE.test(name)))return null;
 return {meltedStone:true,torches:false,lavaVeins:true,name};
}

export function heatLavaVein(face,u,v){
 if(Math.abs(face)%7!==0)return false;
 const seam=.46+Math.sin(v*13+face*1.7)*.075;
 return v>.12&&v<.92&&Math.abs(u-seam)<.018+(Math.sin(v*41+face)+1)*.006;
}

export function heatMeltedPixel(face,u,v,light){
 if(heatLavaVein(face,u,v)){
  const core=Math.abs(u-(.46+Math.sin(v*13+face*1.7)*.075))<.008;
  const r=core?255:205,g=core?154:55,b=core?54:20;
  return (255<<24)|(b<<16)|(g<<8)|r;
 }
 const bulb=Math.sin(u*18+Math.sin(v*7+face))*Math.sin(v*17+face*.31);
 const heat=Math.max(0,Math.sin((u+v)*8+face)*.5+.5);
 const r=Math.max(0,Math.floor((54+bulb*12+heat*7)*light));
 const g=Math.max(0,Math.floor((42+bulb*8)*light));
 const b=Math.max(0,Math.floor((36+bulb*6)*light));
 return (255<<24)|(b<<16)|(g<<8)|r;
}

export function drawHeatLairVault(c,w,h,phase=0){
 c.save();
 const roof=c.createRadialGradient(w*.5,h*.72,w*.04,w*.5,h*.72,w*.78);
 roof.addColorStop(0,'#51352d');roof.addColorStop(.54,'#2b211f');roof.addColorStop(1,'#100e0f');
 c.fillStyle=roof;c.fillRect(0,0,w,h*.55);
 c.globalAlpha=.34;c.fillStyle='#8d4a2c';
 for(let i=0;i<11;i++){
  const x=(i*197+phase*61)%w,y=h*(.12+(i%4)*.075),rx=w*(.045+(i%3)*.018),ry=h*(.025+(i%2)*.018);
  c.beginPath();c.ellipse(x,y,rx,ry,(i%5-2)*.13,0,Math.PI*2);c.fill();
 }
 c.restore();
}
