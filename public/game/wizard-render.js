function polygon(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}

export function drawTwinklestarTower(c,x,y,size){
 c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=.022;c.lineJoin='round';
 oval(c,0,.40,.68,.22,'#153e4d');oval(c,0,.32,.56,.18,'#7a8260');
 polygon(c,[[-.28,.33],[-.24,-.90],[.22,-.90],[.29,.33]],'#b2b7aa','#4c6368');
 polygon(c,[[.06,.33],[.06,-.90],[.22,-.90],[.29,.33]],'#7a9196');
 polygon(c,[[-.32,-.86],[0,-1.35],[.31,-.86]],'#557781','#d0d7b8');
 for(let i=0;i<9;i++){const yy=-.80+i*.125;c.fillStyle=i%2?'#e1ce83':'#254c60';c.fillRect(-.065,yy,.09,.065);line(c,[[-.24,yy+.09],[.23,yy+.09]],'#789297',.012);}
 polygon(c,[[-.09,.34],[-.09,.18],[0,.10],[.10,.18],[.10,.34]],'#233e47');
 line(c,[[0,-1.35],[0,-1.53]],'#d5d4a6',.018);
 polygon(c,[[0,-1.60],[.025,-1.53],[.10,-1.51],[.025,-1.49],[0,-1.42],[-.025,-1.49],[-.10,-1.51],[-.025,-1.53]],'#f3e4ad');
 c.restore();
}

export function drawWhiteWizard(c,w,h,{label=true}={}){
 const size=Math.min(h*.78,w*.32),x=w*.5,y=h*.48;
 c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=.012;c.lineJoin='round';
 const glow=c.createRadialGradient(0,0,.01,0,0,.75);glow.addColorStop(0,'#b6d5ce35');glow.addColorStop(1,'#b6d5ce00');c.fillStyle=glow;c.fillRect(-.9,-.8,1.8,1.8);
 polygon(c,[[-.13,-.18],[.15,-.18],[.27,.55],[.06,.50],[-.09,.56],[-.28,.53]],'#e5e6cf','#647e7c');
 polygon(c,[[.03,-.13],[.15,-.18],[.27,.55],[.13,.51]],'#a4bbb4');
 line(c,[[-.08,-.06],[-.12,.43]],'#becdc0',.012);line(c,[[.02,.03],[.035,.47]],'#b3c8be',.012);
 oval(c,.005,-.28,.095,.12,'#d7bd96');
 polygon(c,[[-.095,-.25],[-.06,-.16],[-.025,.08],[.025,.13],[.08,-.11],[.10,-.25],[.03,-.18]],'#f3edda','#a8b9ad');
 line(c,[[-.035,-.30],[-.012,-.30]],'#46534b',.012);line(c,[[.035,-.30],[.055,-.30]],'#46534b',.012);
 polygon(c,[[-.16,-.35],[-.05,-.66],[.03,-.72],[.13,-.34]],'#e9e6cf','#899e96');
 oval(c,-.005,-.35,.18,.037,'#c6d3c5');
 polygon(c,[[-.11,-.14],[-.24,-.01],[-.34,.12],[-.24,.18],[-.07,.02]],'#d8dfca','#7b9790');
 polygon(c,[[.12,-.12],[.24,.02],[.36,-.02],[.37,.06],[.22,.12],[.10,.03]],'#c2d0c3','#77918a');
 line(c,[[.36,-.48],[.34,.55]],'#84643f',.023);oval(c,.36,-.53,.055,.066,'#afd8dc');
 line(c,[[.31,-.55],[.36,-.62],[.41,-.55]],'#e8dfac',.015);
 c.restore();
 if(label){c.save();c.textAlign='center';c.font='12px Georgia,serif';c.fillStyle='#dee9d4';c.fillText('THE WHITE WIZARD',x,h-9);c.restore();}
}

export function twinklestarWallInk(kind,u,v){
 if(kind%4===0&&u>.24&&u<.76&&v>.20&&v<.72){
  if(Math.abs(v-.22)<.02||Math.abs(v-.48)<.015||Math.abs(v-.70)<.02)return '#554934';
  const book=Math.floor(u*31),shade=['#667f87','#77718b','#73825e','#9f8b60'][book%4];
  if((u*31)%1<.13)return '#2c3841';
  return Math.abs(v-.30)<.006||Math.abs(v-.57)<.006?'#c0ad7b':shade;
 }
 if(kind%4===1){
  const x=u-.5,y=(v-.42)*1.1,r=Math.hypot(x,y);
  if(Math.abs(r-.20)<.009)return '#7e9caa';
  if(r<.16&&(Math.abs(x)<.009||Math.abs(y)<.009||Math.abs(x-y)<.008||Math.abs(x+y)<.008))return '#c1c7a1';
 }
 return null;
}
