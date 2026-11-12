export function drawPercivalCastle(c,x,y,size){
 c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=.025;c.lineJoin='round';
 const polygon=(p,fill,stroke)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}};
 c.fillStyle='#07141588';c.beginPath();c.ellipse(0,.40,.83,.25,0,0,Math.PI*2);c.fill();
 polygon([[-.6,.38],[-.58,-.24],[-.34,-.35],[.32,-.35],[.59,-.23],[.62,.38]],'#687675','#283f3d');
 polygon([[-.25,.34],[-.25,-.60],[.20,-.60],[.24,.34]],'#7e8e88','#2d4341');
 polygon([[-.32,-.60],[-.02,-1.02],[.27,-.60]],'#334b4d','#93aaa0');
 for(const xx of [-.57,.53]){
  polygon([[xx-.15,.38],[xx-.15,-.51],[xx-.08,-.51],[xx-.08,-.41],[xx+.01,-.41],[xx+.01,-.54],[xx+.10,-.54],[xx+.16,.38]],'#798986','#2c4441');
  c.fillStyle='#243b39';c.fillRect(xx-.025,-.29,.055,.18);
 }
 polygon([[-.12,.4],[-.12,.04],[0,-.08],[.12,.04],[.12,.4]],'#102725','#a0afa0');
 c.strokeStyle='#526c66';c.beginPath();c.moveTo(-.23,-.34);c.lineTo(.19,-.34);c.moveTo(-.23,-.14);c.lineTo(.19,-.14);c.stroke();
 polygon([[-.51,-.57],[-.51,-.83],[-.32,-.76],[-.44,-.69]],'#758b7a','#b0b59a');
 const fog=c.createLinearGradient(0,.16,0,.64);fog.addColorStop(0,'#a3c4b000');fog.addColorStop(.6,'#b3d6c366');fog.addColorStop(1,'#a3c4b000');c.fillStyle=fog;c.fillRect(-.9,.12,1.8,.56);c.restore();
}

export function percivalWallInk(kind,u,v){
 const oval=(x,y,rx,ry)=>((u-x)/rx)**2+((v-y)/ry)**2<1;
 if(kind%5===0){
  if(oval(.5,.39,.13,.17)){
   if(oval(.455,.37,.032,.041)||oval(.545,.37,.032,.041))return '#142020';
   if(v>.48&&(u*42)%1<.28)return '#334541';
   return u<.48?'#a4b2a0':'#718a7c';
  }
  if(Math.abs(u-.5)<.16&&v>.57&&v<.59)return '#476359';
 }
 if(kind%5===1&&u>.33&&u<.67&&v>.15&&v<.76){
  if(v>.65&&Math.sin(u*83)>.2)return null;
  if(Math.abs(u-.5)<.016&&v>.27&&v<.59||Math.abs(v-.39)<.016&&u>.41&&u<.59)return '#a4b5a8';
  return u<.49?'#3e5556':'#2a4143';
 }
 if(kind%5===2){
  if(Math.abs(u-.5)<.018&&v>.41&&v<.54)return '#708f85';
  if(oval(.5,.38,.032,.057))return Math.abs(u-.5)<.014?'#d5f4c9':'#6ba88f';
  if(v>.54&&v<.56&&Math.abs(u-.5)<.065)return '#293d38';
 }
 return null;
}

export function drawPercivalMist(c,w,h){
 c.save();const fog=c.createLinearGradient(0,h*.45,0,h);fog.addColorStop(0,'#adcfc200');fog.addColorStop(.55,'#91b9ad22');fog.addColorStop(1,'#7baba411');c.fillStyle=fog;c.fillRect(0,h*.45,w,h*.55);
 for(let i=0;i<19;i++){const x=(i*173.7)%w,y=h*.61+(i*43.3)%(h*.24);c.fillStyle='#bfdfc133';c.fillRect(x,y,1.5,1.5);}c.restore();
}

export function drawForsakenHelm(c,w,h){
 c.save();c.translate(w/2,h*.50);const size=Math.min(w*.24,h*.44);c.scale(size,size);c.lineWidth=.025;c.lineJoin='round';
 const p=(points,fill,stroke)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}};
 const aura=c.createRadialGradient(0,0,.1,0,0,1.5);aura.addColorStop(0,'#ad603444');aura.addColorStop(1,'#ad603400');c.fillStyle=aura;c.fillRect(-1.6,-1.6,3.2,3.2);
 p([[-.65,.86],[-.54,-.52],[-.25,-.86],[.22,-.90],[.55,-.56],[.67,.85],[0,1.02]],'#66716d','#c3c5b2');
 p([[-.54,-.52],[-.25,-.86],[.02,-.88],[.02,.94],[-.65,.86]],'#a0aaa1');
 p([[.02,-.88],[.22,-.90],[.55,-.56],[.67,.85],[.02,.94]],'#4b5757');
 p([[-.63,-.10],[-.55,-.36],[-.05,-.13],[.05,-.13],[.55,-.36],[.63,-.10],[.08,.07],[-.08,.07]],'#202c2b','#c5c8b7');
 // A sealed black visor slit conceals the eyes entirely.
 p([[-.52,-.16],[-.06,.015],[.06,.015],[.52,-.16],[.51,-.07],[.06,.11],[-.06,.11],[-.51,-.07]],'#050b0b');
 p([[-.065,.06],[.065,.06],[.13,.62],[0,.76],[-.13,.62]],'#abb2a5','#344342');
 for(const side of [-1,1])for(let i=0;i<3;i++){const x=side*(.25+i*.10);c.strokeStyle='#192726';c.lineWidth=.04;c.beginPath();c.moveTo(x,.30);c.lineTo(x+side*.015,.62);c.stroke();}
 for(const side of [-1,1]){c.fillStyle='#d0ccb3';c.beginPath();c.arc(side*.49,.77,.035,0,Math.PI*2);c.fill();}
 c.restore();
}
