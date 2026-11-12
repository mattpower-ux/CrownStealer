const polygon=(c,points,fill,stroke)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}};
function stroke(c,points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function boulder(c,x,y,r){
 c.save();c.translate(x,y);c.scale(r,r);c.lineWidth=.035;
 polygon(c,[[-1,.18],[-.83,-.44],[-.27,-.79],[.57,-.62],[1,.09],[.65,.56],[-.47,.67]],'#676c5b','#30372a');
 polygon(c,[[-.83,-.44],[-.27,-.79],[.57,-.62],[.15,-.08],[-.31,.15]],'#959783');
 polygon(c,[[.15,-.08],[.57,-.62],[1,.09],[.65,.56],[.29,.37]],'#4b5145');
 stroke(c,[[-.54,-.36],[-.18,-.19],[-.30,.15],[-.11,.34]],'#424b3a',.025);
 for(let i=0;i<9;i++)ellipse(c,-.65+i*.14,.34+Math.sin(i*2.4)*.05,.09,.045,i%2?'#53613b':'#6f7848');
 c.restore();
}
function skeleton(c){
 c.save();c.translate(-.05,.02);c.rotate(-.30);
 // Torn cloak, rusted mail and a broken shield beneath the bones.
 polygon(c,[[-.22,-.34],[.24,-.29],[.41,.44],[.14,.62],[-.08,.47],[-.35,.57]],'#3b493b','#263529');
 ellipse(c,.32,.12,.16,.20,'#514c38');stroke(c,[[.25,-.04],[.37,.28]],'#8a7752',.024);
 stroke(c,[[0,-.29],[0,.18]],'#c4bda0',.039);
 for(let i=0;i<5;i++){
  const y=-.23+i*.066,r=.12-i*.01;
  stroke(c,[[-r,y+.04],[-r*.85,y],[0,y+.015],[r*.85,y],[r,y+.04]],'#b6ae8e',.026);
 }
 ellipse(c,0,-.43,.105,.12,'#d4ccb0');ellipse(c,-.039,-.45,.026,.032,'#343d2d');ellipse(c,.039,-.45,.026,.032,'#343d2d');
 polygon(c,[[-.014,-.403],[.014,-.403],[0,-.426]],'#53523f');
 stroke(c,[[-.065,-.35],[.063,-.35]],'#d1c7a4',.025);
 stroke(c,[[-.12,-.24],[-.24,-.08],[-.30,.13]],'#c9c0a0',.035);
 stroke(c,[[.12,-.24],[.25,-.09],[.21,.07]],'#c9c0a0',.035);
 stroke(c,[[-.09,.17],[.09,.17],[.05,.24],[-.05,.24],[-.09,.17]],'#b8ae8c',.035);
 for(const side of [-1,1]){stroke(c,[[side*.055,.23],[side*.12,.43],[side*.16,.67]],'#c7bd9b',.043);stroke(c,[[side*.16,.67],[side*.23,.69]],'#afa584',.035);}
 // Orc arrows retain their dark shafts, barbed tips and ragged green fletching.
 for(const [x,y,angle] of [[-.15,-.15,-.55],[.08,-.05,.40],[.05,.12,-.28]]){
  c.save();c.translate(x,y);c.rotate(angle);
  stroke(c,[[0,.07],[0,-.48]],'#29291e',.018);
  polygon(c,[[0,.11],[-.035,.045],[.035,.045]],'#777660');
  polygon(c,[[0,-.46],[-.05,-.41],[-.05,-.32],[0,-.36],[.05,-.32],[.05,-.41]],'#526b3c','#2e4128');c.restore();
 }
 c.restore();
}

export function drawDiscoveryArt(c,type,x,y,size,{searched=false,chestOpened=false}={}){
 c.save();c.translate(x,y);c.scale(size,size);c.lineJoin='round';c.lineCap='round';c.lineWidth=.025;
 ellipse(c,0,.43,.85,.27,'#07100bb0');
 if(type==='hero-remains'){
  boulder(c,-.49,.20,.40);boulder(c,.49,.20,.42);boulder(c,-.24,-.27,.35);boulder(c,.39,-.24,.33);
  if(searched)skeleton(c);else{boulder(c,.02,.22,.48);boulder(c,.04,-.12,.33);}
 }else if(type==='abandoned-camp'){
  polygon(c,[[-.63,.31],[-.29,-.45],[.35,-.26],[.69,.39]],'#75633e','#403a26');
  polygon(c,[[-.63,.31],[-.29,-.45],[.08,.36]],'#a28a52');
  polygon(c,[[-.43,.33],[-.27,-.26],[-.09,.34]],'#292f21');
  stroke(c,[[-.29,-.5],[-.29,-.26]],'#58432a',.035);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;boulder(c,.32+Math.cos(a)*.24,.46+Math.sin(a)*.10,.08);}
  stroke(c,[[.19,.44],[.45,.48]],'#2b271e',.043);stroke(c,[[.23,.50],[.42,.40]],'#51442b',.038);
 }else if(type==='burned-village'){
  ellipse(c,0,.36,.78,.28,'#262921');
  for(const [xx,yy,scale] of [[-.36,-.13,.8],[.37,-.27,.65]]){
   c.save();c.translate(xx,yy);c.scale(scale,scale);
   polygon(c,[[-.37,.42],[-.37,-.36],[-.22,-.55],[-.15,-.24],[.03,-.31],[.14,-.15],[.35,-.24],[.35,.42]],'#676355','#353b2f');
   polygon(c,[[-.37,.42],[-.37,-.36],[-.51,-.22],[-.49,.33]],'#373c32');
   polygon(c,[[-.13,.42],[-.13,.02],[.08,-.08],[.20,.03],[.20,.42]],'#1b251d');
   stroke(c,[[-.30,-.11],[-.19,-.11]],'#88806a',.025);stroke(c,[[.13,-.02],[.29,-.02]],'#88806a',.025);
   stroke(c,[[-.44,-.4],[.31,.22]],'#272820',.065);stroke(c,[[-.22,.36],[.27,-.33]],'#20271e',.055);c.restore();
  }
  for(let i=0;i<8;i++)boulder(c,-.60+i*.17,.36+Math.sin(i*2)*.12,.075);
  if(searched){
   polygon(c,[[-.29,.28],[.21,.25],[.35,.38],[-.19,.43]],'#987141','#392f21');
   polygon(c,[[-.29,.28],[-.19,.43],[-.19,.66],[-.29,.50]],'#4d3925');
   polygon(c,[[-.19,.43],[.35,.38],[.35,.60],[-.19,.66]],'#745331','#2f3025');
   if(chestOpened){polygon(c,[[-.29,.28],[-.23,.06],[.29,.01],[.21,.25]],'#806140','#36382c');polygon(c,[[-.24,.30],[.20,.28],[.28,.38],[-.16,.41]],'#161d16');}
   for(const u of [-.08,.23])polygon(c,[[u,.40],[u+.055,.40],[u+.055,.63],[u,.64]],'#464b41');
   polygon(c,[[.045,.44],[.12,.44],[.12,.54],[.045,.54]],'#b69b57','#48432b');
   ellipse(c,.083,.48,.013,.016,'#302f22');
  }
 }else if(type==='hollow-tree'){
  polygon(c,[[-.47,.53],[-.26,.14],[-.30,-.53],[.20,-.58],[.35,.22],[.55,.51],[.14,.42],[-.01,.54]],'#645038','#2b3526');
  polygon(c,[[-.30,-.53],[-.13,-.65],[.20,-.58],[.02,-.45]],'#9a8054');
  ellipse(c,-.01,.03,.17,.24,'#18251b');ellipse(c,-.02,.08,.12,.16,'#080f0b');
  for(const u of [-.21,.21])stroke(c,[[u,-.39],[u-.025,-.1],[u+.035,.30]],'#9c7950',.018);
  for(let i=0;i<7;i++)ellipse(c,-.32+i*.1,.43+Math.sin(i)*.04,.1,.055,'#526139');
 }else{
  for(const [xx,yy,r] of [[-.43,.16,.33],[.39,.18,.31],[0,-.19,.40]]){
   polygon(c,[[xx-r*.44,yy+r*.8],[xx-r*.37,yy-r],[xx+r*.29,yy-r*1.13],[xx+r*.5,yy+r*.8]],'#777d67','#374433');
   stroke(c,[[xx,yy-r*.7],[xx-r*.10,yy-r*.28],[xx+r*.12,yy],[xx,yy+r*.35]],'#b1af8a',.022);
  }
  ellipse(c,0,.43,.45,.10,'#546140');
 }
 c.restore();
}

export function drawHeroGhost(c,w,h,time=0,reduced=false,options={}){
 const size=Math.min(h*(options.scale??.32),w*.24),x=w*(options.x??.17),y=h*(options.y??.70),bob=reduced?0:Math.sin(time/650)*size*.018;
 c.save();c.translate(x,y+bob);c.scale(size,size);c.lineWidth=.015;c.lineJoin='round';
 const aura=c.createRadialGradient(0,-.25,.02,0,-.25,.8);aura.addColorStop(0,'#a1f3ef45');aura.addColorStop(1,'#78dfdc00');
 c.fillStyle=aura;c.fillRect(-.9,-1.1,1.8,1.8);c.globalAlpha=.69;c.shadowColor='#b2ffff';c.shadowBlur=14;
 polygon(c,[[-.19,-.65],[.17,-.65],[.35,.21],[.18,.13],[.10,.37],[-.02,.21],[-.19,.40],[-.32,.20]],'#88c9c6','#ccf5e8');
 polygon(c,[[-.18,-.56],[.18,-.56],[.13,-.10],[-.12,-.10]],'#a4d3cb','#e2fff2');
 ellipse(c,0,-.79,.13,.15,'#a7dbd5');stroke(c,[[-.12,-.81],[.12,-.81]],'#d6ffff',.026);
 stroke(c,[[-.07,-.78],[-.02,-.78]],'#35595b',.025);stroke(c,[[.025,-.78],[.075,-.78]],'#35595b',.025);
 stroke(c,[[.18,-.48],[.32,-.21],[.47,-.31]],'#bce7dd',.055);
 stroke(c,[[.47,-.31],[.55,-.91]],'#e1ffff',.035);stroke(c,[[.39,-.38],[.56,-.36]],'#addacf',.035);
 polygon(c,[[-.21,-.43],[-.42,-.36],[-.40,-.04],[-.25,.09],[-.12,-.07]],'#669e9f','#c4f8eb');
 c.restore();c.save();c.font='12px Georgia,serif';c.textAlign='center';c.fillStyle='#b7eee5';c.fillText(options.label??'HERO’S GHOST',x,y+size*.52);c.restore();
}
