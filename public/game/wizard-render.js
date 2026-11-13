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
// Pale carved stone, luminous glass and enchanted blue candles share the raycaster's wall coordinates.
const packed=(r,g,b)=>(255<<24)|(Math.max(0,Math.min(255,b|0))<<16)|(Math.max(0,Math.min(255,g|0))<<8)|Math.max(0,Math.min(255,r|0));
export function wizardWallPixel(kind,u,v,light=1){
 const shade=.54+Math.min(1,light)*.46,vein=Math.sin(u*34+Math.sin(v*19)*2)+Math.sin(v*61+u*9)*.5;
 let rgb=[222+vein*4,224+vein*4,214+vein*3];
 const row=Math.floor(v*5),joint=(v*5)%1<.014||((u*2+(row%2)*.5)%1)<.012;
 if(joint)rgb=[174,187,190];
 // Carved plinth, cornice and fluted pilasters frame every wall bay.
 if(v>.88||v<.09)rgb=[191,207,209];
 if(Math.abs(v-.88)<.008||Math.abs(v-.075)<.008||Math.abs(v-.94)<.006)rgb=[195,168,99];
 if(u<.07||u>.93){const flute=Math.cos(u*270)*11;rgb=[209+flute,219+flute,218+flute];}
 const x=u-.5,y=v-.45;
 if(kind%3===0){
  const arch=v>.18&&v<.77&&Math.abs(x)<.25&&(v>.35||x*x/ .0625+(v-.35)**2/.0324<1);
  if(arch){
   const border=Math.abs(x)>.222||v>.745||(v<.36&&x*x/.0625+(v-.35)**2/.0324>.77);
   const rose=Math.hypot(x,(v-.39)*.8),lead=Math.abs(x)<.009||Math.abs(v-.55)<.009||Math.abs(v-.68)<.008||Math.abs(rose-.13)<.009||Math.abs(Math.abs(x)-Math.abs(v-.39)*.75)<.009;
   rgb=border?[166,143,84]:lead?[67,89,111]:[[45,112,196],[92,70,178],[45,164,190],[229,177,75],[121,191,221]][(Math.floor((u+.1)*17)+Math.floor(v*11))%5];
   if(!border&&!lead)return packed(...rgb.map(n=>n*.96+22));
  }
 }else if(kind%3===1){
  // Three sapphire flames, ivory candles, and curled gilded arms.
  const stem=Math.abs(x)<.014&&v>.40&&v<.73;
  const cross=Math.abs(v-(.55+.10*Math.abs(x)))<.012&&Math.abs(x)<.18;
  const foot=((x/.11)**2+((v-.72)/.028)**2)<1;
  if(stem||cross||foot)rgb=[177,143,64];
  for(const offset of [-.16,0,.16]){
   const top=offset===0?.35:.41,xx=x-offset;
   if(Math.abs(xx)<.018&&v>top&&v<.56)rgb=[233,231,196];
   const flame=(xx/.027)**2+((v-(top-.04))/.055)**2;
   if(flame<1)return packed(...(flame<.28?[220,253,255]:[50,175,255]));
   if(Math.abs(xx)<.035&&Math.abs(v-.56)<.014)rgb=[208,174,87];
  }
 }else{
  const r=Math.hypot(x,y*1.1);
  if(Math.abs(r-.19)<.009||Math.abs(r-.215)<.004)rgb=[178,151,87];
  if(r<.16&&(Math.abs(x)<.008||Math.abs(y)<.008||Math.abs(Math.abs(x)-Math.abs(y))<.006))rgb=[88,133,166];
 }
 return packed(...rgb.map(n=>n*shade));
}
export function drawWizardPlanes(c,w,h,d,dx,dy,fov,map){
 const image=c.getImageData(0,0,w,h),pixels=new Uint32Array(image.data.buffer),tan=Math.tan(fov/2);
 for(let y=Math.floor(h*.5)+1;y<h;y+=2){const depth=h*.425/(y-h*.5),light=.43+.57*Math.min(1,3/depth);
  for(let x=0;x<w;x+=2){const side=(x/w-.5)*2*tan*depth,wx=d.x+.5+dx*depth-dy*side,wy=d.y+.5+dy*depth+dx*side,gx=Math.floor(wx),gy=Math.floor(wy),u=wx-gx,v=wy-gy;
   const ns=map[gy-1]?.[gx]!==undefined&&map[gy-1][gx]!==1||map[gy+1]?.[gx]!==undefined&&map[gy+1][gx]!==1,ew=map[gy]?.[gx-1]!==undefined&&map[gy][gx-1]!==1||map[gy]?.[gx+1]!==undefined&&map[gy][gx+1]!==1;
   const across=Math.min(ns?Math.abs(u-.5):1,ew?Math.abs(v-.5):1),carpet=across<.29;
   const grain=Math.sin(wx*73+wy*41)*3;let rgb;
   if(carpet){const trim=across>.245||across>.218&&across<.228,embroidery=Math.abs(Math.abs(u-.5)+Math.abs(v-.5)-.15)<.015;rgb=trim||embroidery?[190+grain,157+grain,79]:[23+grain,48+grain,100+grain];}
   else{const seam=u<.018||v<.018,vein=Math.sin(wx*17+Math.sin(wy*15))*5;rgb=seam?[120,144,155]:(gx+gy)%2?[192+vein,205+vein,203+vein]:[221+vein,225+vein,215+vein];}
   const color=packed(...rgb.map(n=>n*light));for(let yy=y;yy<Math.min(h,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;
  }
 }
 c.putImageData(image,0,0);
 const grad=c.createLinearGradient(0,0,0,h*.5);grad.addColorStop(0,'#c7d8db');grad.addColorStop(.8,'#677e99');grad.addColorStop(1,'#384d6a');c.fillStyle=grad;c.fillRect(0,0,w,h*.5);
 for(const scale of [1.7,1.1,.73,.49,.33,.22,.15,.10]){c.beginPath();c.moveTo(w*.5-w*.56*scale,h*.5);c.quadraticCurveTo(w*.5,h*.5-h*.84*scale,w*.5+w*.56*scale,h*.5);c.strokeStyle='#eee9c9';c.lineWidth=Math.max(1,scale*4);c.stroke();c.strokeStyle='#a49360';c.lineWidth=Math.max(.5,scale);c.stroke();}
}
export function drawWizardChest(c,size,opened){
 c.save();c.scale(size,size);c.lineWidth=.018;c.lineJoin='round';
 const body=c.createLinearGradient(0,-.6,0,0);body.addColorStop(0,'#294b73');body.addColorStop(.5,'#102746');body.addColorStop(1,'#07182e');
 polygon(c,[[-.50,-.43],[.50,-.43],[.47,0],[-.47,0]],body,'#d2ad5f');
 polygon(c,[[-.50,-.43],[-.42,opened?-.90:-.65],[.40,opened?-.90:-.65],[.50,-.43]],opened?'#10233b':'#41688b','#e0bd70');
 if(opened)polygon(c,[[-.45,-.43],[.45,-.43],[.36,-.29],[-.36,-.29]],'#020c19','#957741');
 for(const xx of [-.39,.34]){c.fillStyle='#c6a052';c.fillRect(xx,-.64,.06,.63);c.fillStyle='#ffe5a0';c.fillRect(xx,-.63,.013,.62);}
 line(c,[[-.47,-.06],[.47,-.06]],'#d9b872',.025);line(c,[[-.49,-.43],[.49,-.43]],'#ebcc82',.027);
 for(const xx of [-.25,0,.25]){polygon(c,[[xx,-.35],[xx+.045,-.27],[xx,-.19],[xx-.045,-.27]],xx===0?'#65cdf6':'#ac74c8','#e7ca7f');line(c,[[xx-.02,-.28],[xx,-.32],[xx+.018,-.28]],'#d3faff',.012);}
 for(const xx of [-.45,.45]){oval(c,xx,-.025,.045,.035,'#d5b05e');for(const yy of [-.40,-.12])oval(c,xx,yy,.014,.014,'#f5df98');}
 for(let i=0;i<7;i++){const x=-.29+i*.095;line(c,[[x,-.10],[x+.025,-.14],[x+.05,-.10]],'#bba269',.008);}
 c.restore();
}
export function drawWizardCandleGlow(c,w,h,lights,time=0){
 c.save();c.globalCompositeOperation='screen';for(const l of lights||[]){const x=l.x*w,y=l.y*h,r=l.size*h,p=.8+Math.sin(time*.003+l.phase)*.13;const glow=c.createRadialGradient(x,y,0,x,y,r*7);glow.addColorStop(0,'rgba(70,170,255,'+(.18*p)+')');glow.addColorStop(1,'rgba(40,110,255,0)');c.fillStyle=glow;c.fillRect(x-r*7,y-r*7,r*14,r*14);}c.restore();
}
