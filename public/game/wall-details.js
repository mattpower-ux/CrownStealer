import {sewerWallInk} from './sewer-scenery.js';
import {seaweedInk} from './nautical.js';
export function wallDetailKind(x,y,dungeon){return Math.abs(Math.imul(x+1,17)+Math.imul(y+1,31)+dungeon*13)%23;}
export function wallDetail(kind,u,v,time,dungeonIndex){
 if(dungeonIndex===8)return sewerWallInk(kind,u,v,time);
 if(dungeonIndex===6&&kind>=4&&kind<=8)return clockworkWallDetail(kind,u,v,time);
 if(dungeonIndex===4)return seaweedInk(kind,u,v);
 if(kind<4&&v>.22&&v<.72){const cut=u-(v-.22)*.44;for(const x of [.26,.38,.5]){if(Math.abs(cut-x)<.012)return '#101614';if(Math.abs(cut-x-.018)<.007)return '#74786a';}}
 if(kind>=4&&kind<7&&u<.48&&v<.38){const x=u-.025,y=(v-.025)*1.35;if(x>=0&&y>=0){const radius=Math.hypot(x,y);if(radius<.43&&(Math.abs((radius*11)%1)<.07||Math.abs(y-x)<.008||Math.abs(y-x*.4)<.007||Math.abs(y-x*2.4)<.008||x<.007||y<.007))return '#9aab9a99';}}
 if(kind>=7&&kind<9){if(Math.abs(u-.5)<.028&&v>.43&&v<.76)return '#49301c';if(Math.abs(u-.5)<.065&&v>.48&&v<.53)return '#151d1c';const flicker=1+Math.sin(time*.006+kind)*.12;if(((u-.5)/(.055*flicker))**2+((v-.36)/.115)**2<1)return Math.abs(u-.5)<.023?'#ffe49a':'#e88b32';}
 return null;
}

// Pixel-sized wall ornaments stay on the ray-cast masonry and are naturally occluded by corners.
export function clockworkWallDetail(kind,u,v,time=0){
 const oval=(x,y,rx,ry)=>((u-x)/rx)**2+((v-y)/ry)**2<=1;
 const line=(x1,y1,x2,y2,width)=>{const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((u-x1)*dx+(v-y1)*dy)/(dx*dx+dy*dy)));return Math.hypot(u-x1-t*dx,v-y1-t*dy)<width;};
 if(kind===7||kind===8){
  // Brass loop, arched walnut clock case, luminous dial, and a glazed pendulum lantern.
  if(oval(.5,.18,.035,.045)&&!oval(.5,.18,.018,.026))return '#b69b60';
  const caseShape=oval(.5,.32,.13,.13)||u>.37&&u<.63&&v>.31&&v<.77;
  if(!caseShape)return null;
  if(oval(.5,.34,.103,.105)){
   if(!oval(.5,.34,.087,.089))return '#b99853';
   if(line(.5,.34,.5,.278,.009)||line(.5,.34,.553,.362,.009))return '#3e3022';
   if(Math.abs(u-.5)<.008&&Math.abs(v-.34)>.064||Math.abs(v-.34)<.008&&Math.abs(u-.5)>.064)return '#5c472a';
   return '#f2dc9a';
  }
  if(u>.408&&u<.592&&v>.48&&v<.699){
   const swing=Math.sin(time*.0012+kind)*.025;
   if(line(.5,.49,.5+swing,.64,.007)||oval(.5+swing,.65,.032,.035))return '#c8a45d';
   return '#26342e';
  }
  if(v>.72||Math.abs(u-.5)>.11)return '#a88449';
  return u<.42?'#755332':'#4c3526';
 }
 if(kind>=4&&kind<=6){
  const deer=kind===5,boar=kind===6;
  if(deer){for(const sign of [-1,1]){if(line(.5+sign*.08,.3,.5+sign*.15,.13,.013)||line(.5+sign*.12,.21,.5+sign*.22,.17,.011)||line(.5+sign*.15,.14,.5+sign*.12,.08,.01))return '#c4b48a';}}
  const earLeft=oval(.5-(boar?.13:.12),.3,boar?.07:.055,.06),earRight=oval(.5+(boar?.13:.12),.3,boar?.07:.055,.06);
  if(earLeft||earRight)return boar?'#7e6950':'#aa8558';
  if(oval(.5,.39,boar?.14:.10,boar?.15:.19)){
   if(oval(.5-.052,.355,.016,.018)||oval(.5+.052,.355,.016,.018))return '#191c16';
   if(oval(.5,.47,boar?.085:.048,.047)){
    if(boar&&(oval(.473,.472,.012,.013)||oval(.527,.472,.012,.013)))return '#352b24';
    return boar?'#b69b7c':'#3b3025';
   }
   return u<.49?(boar?'#9b8161':'#c3a274'):(boar?'#766249':'#a17e50');
  }
  if(boar&&(line(.405,.49,.42,.43,.014)||line(.595,.49,.58,.43,.014)))return '#e1d3aa';
  if(oval(.5,.43,.21,.27))return oval(.5,.43,.19,.248)?'#523e2c':'#aa8755';
 }
 return null;
}
