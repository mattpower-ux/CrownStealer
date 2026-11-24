export const FISHING_CAST_MS=850;
export function fishingCastFrame(elapsed){
 const t=Math.max(0,elapsed);
 if(t>=FISHING_CAST_MS)return {phase:'done',progress:1,splash:1};
 if(t<520)return {phase:'cast',progress:t/520,splash:0};
 return {phase:'splash',progress:1,splash:(t-520)/(FISHING_CAST_MS-520)};
}
export function drawFishingCast(c,{x,y,size,dx,dy,elapsed,reduced=false}){
 const frame=fishingCastFrame(reduced?FISHING_CAST_MS*.72:elapsed);if(frame.phase==='done')return;
 const startX=x+dx*size*.12,startY=y+dy*size*.12;
 const waterX=x+dx*size*.88,waterY=y+dy*size*.88;
 const castX=startX+(waterX-startX)*frame.progress;
 const castY=startY+(waterY-startY)*frame.progress-Math.sin(frame.progress*Math.PI)*size*.55;
 c.save();c.lineCap='round';c.strokeStyle='#e8dfbc';c.lineWidth=Math.max(1,size*.035);c.beginPath();c.moveTo(startX,startY);c.quadraticCurveTo((startX+castX)*.5-dy*size*.16,(startY+castY)*.5+dx*size*.16,castX,castY);c.stroke();
 if(frame.phase==='cast'){c.fillStyle='#e74b3c';c.beginPath();c.arc(castX,castY,Math.max(3,size*.09),0,Math.PI*2);c.fill();}
 else {const pulse=.45+frame.splash*.8;for(const ring of [.34,.64,1]){c.globalAlpha=1-frame.splash*.65;c.strokeStyle='#d5f5f4';c.lineWidth=Math.max(1,size*.035);c.beginPath();c.ellipse(waterX,waterY,size*.36*ring*pulse,size*.13*ring*pulse,0,0,Math.PI*2);c.stroke();}c.globalAlpha=1;c.fillStyle='#f2ffff';for(let i=0;i<5;i++){const angle=i*Math.PI*2/5+frame.splash*3,cx=waterX+Math.cos(angle)*size*.24*frame.splash,cy=waterY+Math.sin(angle)*size*.12*frame.splash-size*.12*(1-frame.splash);c.beginPath();c.arc(cx,cy,Math.max(1,size*.035),0,Math.PI*2);c.fill();}}
 c.restore();
}
