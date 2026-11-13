import {shrineForDungeon} from './shrine-deities.js';
function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,points,color,width=.012){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
export function drawShrineStatue(c,x,y,size,profile){
 const good=profile.alignment==='good',stone=good?'#a4a894':'#5b665e',edge=good?'#d5cfaa':'#8a947c',shade=good?'#777f70':'#333d38',rune=good?'#a8d0bf':'#adb76e';
 c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=.012;c.lineJoin='round';
 const glow=c.createRadialGradient(0,-.65,.05,0,-.65,.8);glow.addColorStop(0,good?'#93c7b72b':'#7b8a4921');glow.addColorStop(1,'#15251c00');c.fillStyle=glow;c.fillRect(-1,-1.5,2,1.6);
 oval(c,0,.02,.6,.12,'#070c0a99');
 // Tiered stone plinth with an incised band of distinct hieroglyphs.
 poly(c,[[-.48,-.10],[.48,-.10],[.57,.03],[-.57,.03]],shade,edge);
 poly(c,[[-.40,-.34],[.40,-.34],[.44,-.10],[-.44,-.10]],stone,edge);
 poly(c,[[-.40,-.34],[-.31,-.43],[.31,-.43],[.40,-.34]],edge,shade);
 for(let i=0;i<7;i++){const u=-.32+i*.105;line(c,[[u,-.28],[u+.025,-.31],[u+.05,-.28],[u+.025,-.25],[u+.025,-.17]],rune,.010);if(i%2)line(c,[[u,-.21],[u+.05,-.21]],rune,.009);else line(c,[[u,-.18],[u+.025,-.21],[u+.05,-.18]],rune,.009);}
 const form=profile.form;
 if(form==='blob'){
  c.beginPath();c.moveTo(-.33,-.44);c.bezierCurveTo(-.65,-.58,-.41,-.77,-.39,-.93);c.bezierCurveTo(-.37,-1.24,-.12,-1.28,.03,-1.13);c.bezierCurveTo(.33,-1.43,.48,-1.10,.39,-.94);c.bezierCurveTo(.62,-.69,.39,-.59,.38,-.43);c.closePath();c.fillStyle=stone;c.fill();c.strokeStyle=edge;c.stroke();
  for(const [xx,yy]of [[-.2,-.97],[.13,-1.03],[.27,-.77],[-.11,-.68]]){oval(c,xx,yy,.067,.035,'#26332b');oval(c,xx,yy,.018,.025,'#c4bd75');}
  for(const side of [-1,1])line(c,[[side*.19,-.76],[side*.34,-.55],[side*.48,-.45],[side*.40,-.43]],edge,.055);
 }else if(form==='goddess'){
  poly(c,[[-.14,-1.02],[.13,-1.02],[.29,-.45],[-.30,-.45]],stone,edge);poly(c,[[.05,-.99],[.13,-1.02],[.29,-.45],[.12,-.45]],shade);
  for(const u of [-.12,0,.13])line(c,[[u*.4,-.95],[u,-.52]],edge,.014);
  oval(c,0,-1.14,.105,.135,edge);poly(c,[[-.11,-1.17],[-.09,-1.30],[.03,-1.35],[.12,-1.23],[.11,-1.05],[.06,-1.15]],stone,shade);
  line(c,[[-.13,-.99],[-.26,-.79],[-.39,-.86]],stone,.10);line(c,[[.13,-.99],[.27,-.79],[.40,-.86]],stone,.10);
  oval(c,-.4,-.86,.06,.035,edge);oval(c,.41,-.86,.06,.035,edge);oval(c,0,-.84,.13,.045,'#bfad73');
  line(c,[[-.045,-1.14],[-.02,-1.14]],'#5c655b',.008);line(c,[[.02,-1.14],[.045,-1.14]],'#5c655b',.008);line(c,[[-.025,-1.09],[0,-1.08],[.025,-1.09]],'#777e6b',.007);
 }else{
  const giant=form==='giant',lizard=form==='lizard';
  poly(c,[[-.17,-.68],[-.03,-.67],[-.07,-.43],[-.24,-.43]],shade,edge);poly(c,[[.03,-.67],[.17,-.68],[.24,-.43],[.07,-.43]],stone,edge);
  poly(c,[[-.13,-1.01],[-(giant?.28:.21),-.90],[-.17,-.64],[.17,-.64],[giant?.28:.21,-.90],[.13,-1.01]],stone,edge);
  line(c,[[-.18,-.89],[-.32,-.70],[-.39,-.53]],shade,giant?.12:.08);line(c,[[.18,-.89],[.31,-.70],[.38,-.83]],stone,giant?.12:.08);
  oval(c,0,-1.10,giant?.15:.12,.13,stone);
  if(lizard){poly(c,[[.05,-1.18],[.29,-1.13],[.27,-1.04],[.03,-1.02]],stone,edge);line(c,[[.15,-1.07],[.27,-1.07]],shade,.015);poly(c,[[-.15,-.67],[-.42,-.52],[-.54,-.64],[-.37,-.44],[-.14,-.46]],shade,edge);for(let i=0;i<3;i++)poly(c,[[-.13,-1.12+i*.11],[-.23,-1.17+i*.11],[-.14,-1.02+i*.11]],edge);}
  else if(!giant){poly(c,[[-.08,-1.17],[-.24,-1.30],[-.18,-1.08]],edge,shade);poly(c,[[.08,-1.17],[.24,-1.30],[.18,-1.08]],edge,shade);poly(c,[[-.05,-1.10],[.16,-1.05],[.08,-1.00],[-.07,-1.02]],stone,edge);}
  else{line(c,[[.37,-.48],[.36,-1.15]],shade,.065);poly(c,[[.29,-1.17],[.27,-1.38],[.44,-1.39],[.45,-1.18]],stone,edge);line(c,[[-.13,-.88],[0,-.91],[.13,-.88]],edge,.022);}
  oval(c,lizard?.07:-.04,-1.12,.022,.013,good?'#b8d2bf':'#c9aa6a');
 }
 c.restore();
}
function projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,objects,paint){
 const focal=w/(2*Math.tan(fov/2));const visible=objects.map(o=>{const rx=o.x-d.x,ry=o.y-d.y,depth=rx*dx+ry*dy;return {...o,depth,screenX:w*.5+(-dy*rx+dx*ry)*focal/depth,screenY:h*.5+h*.425/depth};}).filter(o=>o.depth>.35&&o.depth<12).sort((a,b)=>b.depth-a.depth);
 for(const o of visible){const size=h*.68/o.depth;c.save();c.beginPath();for(let x=Math.max(0,Math.floor(o.screenX-size*.65));x<Math.min(w,o.screenX+size*.65);x+=2)if(o.depth<=wallDepth[x]+.12)c.rect(x,0,2,h);c.clip();paint(o,size);c.restore();}
}
export function drawShrineScene(c,w,h,s,map,dx,dy,fov,wallDepth){
 const d=s.dungeon,profile=shrineForDungeon(d);if(!profile)return;
 if(d.charityPit){
  projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,[{x:5.1,y:8.4,tone:'#79715d'},{x:5.3,y:9.8,tone:'#596f70'},{x:6.2,y:6.8,tone:'#766052'},{x:5.8,y:9.1,lantern:true}],(o,size)=>{
   c.save();c.translate(o.screenX,o.screenY);c.scale(size*.65,size*.65);c.lineWidth=.012;c.lineJoin='round';if(o.lantern){const glow=c.createRadialGradient(0,-.12,0,0,-.12,.65);glow.addColorStop(0,'#e6a95166');glow.addColorStop(1,'#b57d2800');c.fillStyle=glow;c.fillRect(-.7,-.8,1.4,1.4);poly(c,[[-.07,0],[-.06,-.22],[.06,-.22],[.07,0]],'#ad8950','#e3c27c');poly(c,[[-.04,-.04],[-.035,-.18],[.035,-.18],[.04,-.04]],'#edbd6c');line(c,[[-.05,-.22],[-.05,-.29],[.05,-.29],[.05,-.22]],'#8d8d71',.012);line(c,[[0,-.30],[-.06,-.42],[.05,-.55],[-.02,-.68]],'#b1ada433',.035);c.restore();return;}oval(c,0,0,.24,.06,'#03070788');poly(c,[[-.16,-.10],[-.11,-.36],[.03,-.43],[.18,-.19],[.25,-.04]],o.tone,'#343d32');oval(c,-.02,-.46,.07,.085,'#b5a080');line(c,[[-.09,-.29],[.05,-.15],[.20,-.12]],'#8f8770',.06);line(c,[[-.11,-.06],[-.21,0],[.03,.01]],'#4c4b40',.065);c.restore();
  });return;
 }
 projectObjects(c,w,h,d,map,dx,dy,fov,wallDepth,[{x:profile.x??7,y:profile.y??8}],(o,size)=>drawShrineStatue(c,o.screenX,o.screenY,size,profile));
}
export function drawShrinePortrait(canvas,profile){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawShrineStatue(c,canvas.width*.5,canvas.height*.96,canvas.height*.65,profile);}
