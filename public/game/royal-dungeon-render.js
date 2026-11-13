import {ROYAL_DUNGEON_CELLS} from './royal-dungeon.js';
const bodies=Object.fromEntries(['royal-torturer','royal-heckler'].map(id=>{const image=new Image();image.src='/assets/'+id+'-body.webp';return [id,image];}));
export function paintRoyalBody(c,enemy,x,y,w,h){
 const art=bodies[enemy.speciesId];if(!art)return false;
 if(!art.complete||!art.naturalWidth)return false;
 const scale=Math.min(w/art.naturalWidth,h/art.naturalHeight),sw=art.naturalWidth*scale,sh=art.naturalHeight*scale;
 c.save();c.fillStyle='#00000055';c.beginPath();c.ellipse(x+w*.5,y+h-2,sw*.32,Math.max(2,h*.025),0,0,Math.PI*2);c.fill();c.drawImage(art,x+(w-sw)*.5,y+h-sh,sw,sh);c.restore();return true;
}
export function royalVisualMap(map){const copy=map.map(row=>[...row]);for(const cell of ROYAL_DUNGEON_CELLS)for(let y=cell.bars.top;y<=cell.bars.bottom;y++)copy[y][cell.bars.x]=0;return copy;}
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
function prisoner(c,type){
 const kobold=type.includes('kobold'),maiden=type.includes('maiden'),skin=kobold?'#a29664':'#c5a27b',shirt=kobold?'#665242':maiden?'#a7b2aa':'#776e55';
 oval(c,.5,.97,.24,.035,'#0008');
 poly(c,[[.34,.54],[.48,.55],[.46,.93],[.33,.93]],'#4b4739');poly(c,[[.51,.55],[.66,.55],[.71,.92],[.56,.94]],'#383a30');
 oval(c,.36,.94,.13,.045,'#40372a');oval(c,.65,.94,.13,.045,'#302c23');
 poly(c,[[.32,.29],[.65,.3],[.73,.61],[.28,.63]],shirt);if(maiden)poly(c,[[.33,.48],[.65,.48],[.78,.9],[.23,.9]],'#899b98');
 poly(c,[[.33,.3],[.21,.36],[.16,.61],[.23,.65],[.35,.46]],shirt);poly(c,[[.64,.3],[.74,.34],[.82,.56],[.74,.64],[.62,.46]],shirt);
 oval(c,.2,.64,.05,.07,skin);oval(c,.76,.63,.05,.07,skin);
 oval(c,.49,.2,kobold?.16:.115,kobold?.12:.14,skin);
 if(kobold){poly(c,[[.35,.14],[.18,.07],[.31,.27]],skin);poly(c,[[.62,.14],[.79,.09],[.67,.27]],skin);poly(c,[[.37,.22],[.6,.21],[.62,.29],[.4,.3]],'#b3a775');}
 else{poly(c,[[.37,.12],[.4,.04],[.57,.04],[.62,.14],[.58,.18],[.53,.1],[.4,.15]],maiden?'#8d603a':'#6b5948');if(maiden){poly(c,[[.37,.1],[.36,.36],[.4,.4],[.43,.13]],'#735035');poly(c,[[.57,.1],[.64,.36],[.59,.39],[.55,.15]],'#986e47');}}
 oval(c,.45,.19,.012,.015,'#171b16');oval(c,.55,.19,.012,.015,'#171b16');
 c.strokeStyle='#634e39';c.lineWidth=.012;c.beginPath();c.moveTo(.46,.28);c.lineTo(.54,.28);c.stroke();
 if(!kobold&&!maiden){oval(c,.47,.25,.07,.035,'#aa7964');c.save();c.translate(.18,.54);c.rotate(-.2);poly(c,[[0,0],[.07,0],[.07,.14],[0,.14]],'#58452b');c.strokeStyle='#9a8257';c.lineWidth=.012;c.strokeRect(0,0,.07,.14);c.restore();}
}
function cauldron(c,time){
 oval(c,.5,.92,.41,.06,'#0007');for(const x of [.21,.68])poly(c,[[x,.69],[x+.1,.69],[x+.13,.94],[x-.03,.94]],'#252927');
 const metal=c.createLinearGradient(.12,0,.88,0);metal.addColorStop(0,'#202b2a');metal.addColorStop(.35,'#61706a');metal.addColorStop(.68,'#303f3a');metal.addColorStop(1,'#111c1b');oval(c,.5,.6,.4,.28,metal);oval(c,.5,.39,.4,.12,'#798477');oval(c,.5,.39,.35,.085,'#1a2b25');oval(c,.5,.395,.32,.065,'#697c37');
 for(let i=0;i<6;i++)oval(c,.27+i*.085,.39+Math.sin(i*3)*.025,.018+(i%2)*.008,.012,'#b6b96b');c.strokeStyle='#a1a99177';c.lineWidth=.025;for(let i=0;i<3;i++){c.beginPath();c.moveTo(.35+i*.16,.3);c.bezierCurveTo(.25+i*.16,.2,.47+i*.12,.15,.36+i*.16,.04);c.stroke();}
 for(const x of [.08,.92]){c.strokeStyle='#89958a';c.lineWidth=.035;c.beginPath();c.ellipse(x,.55,.06,.09,0,0,Math.PI*2);c.stroke();}
}
function table(c){
 for(const x of [.13,.77])poly(c,[[x,.42],[x+.07,.42],[x+.05,.95],[x-.02,.95]],'#4b3625');poly(c,[[.03,.43],[.88,.43],[.95,.54],[.08,.54]],'#443224');poly(c,[[.03,.43],[.18,.24],[.99,.3],[.88,.43]],'#8d704b');
 c.strokeStyle='#b89561';c.lineWidth=.012;for(let i=0;i<4;i++){c.beginPath();c.moveTo(.1,.4-i*.04);c.lineTo(.91,.4-i*.025);c.stroke();}
 // Tongs, a hammer and a curved surgical knife catch the torchlight.
 c.strokeStyle='#ccd0ba';c.lineWidth=.02;c.beginPath();c.moveTo(.25,.29);c.lineTo(.49,.36);c.lineTo(.62,.31);c.moveTo(.28,.31);c.lineTo(.48,.38);c.lineTo(.61,.35);c.stroke();
 poly(c,[[.67,.32],[.73,.33],[.79,.27],[.72,.26]],'#bcc2af');c.strokeStyle='#382d23';c.lineWidth=.026;c.beginPath();c.moveTo(.7,.32);c.lineTo(.63,.4);c.stroke();poly(c,[[.35,.39],[.42,.4],[.58,.42],[.62,.39]],'#e2ddc3');
}
function manacles(c){
 c.strokeStyle='#1b201e';c.lineWidth=.04;for(const x of [.24,.76]){oval(c,x,.12,.065,.045,'#858b7d');for(let i=0;i<6;i++){c.beginPath();c.ellipse(x+Math.sin(i)*.018,.2+i*.075,.025,.044,i%2*.4,0,Math.PI*2);c.stroke();c.strokeStyle='#829084';c.lineWidth=.012;c.stroke();c.strokeStyle='#1b201e';c.lineWidth=.04;}c.strokeStyle='#a2a796';c.lineWidth=.025;c.beginPath();c.ellipse(x,.7,.085,.1,0,0,Math.PI*2);c.stroke();c.strokeStyle='#282e2a';c.lineWidth=.04;}}
export function drawRoyalDungeonScenery(c,w,h,s,map,wallDepth,time=0){
 const d=s.dungeon,dirs=[[0,-1],[1,0],[0,1],[-1,0]],[dx,dy]=dirs[d.dir],focal=w/(2*Math.tan(Math.PI/5.2));
 const project=(x,y,z=0)=>{const rx=x-d.x-.5,ry=y-d.y-.5,depth=rx*dx+ry*dy;return depth>.1?{x:w*.5+(-dy*rx+dx*ry)*focal/depth,y:h*.5-z*h*.85/depth,depth}:null;};
 const objects=[{x:6.3,y:11.7,height:.75,art:cauldron,foreground:true},{x:8.15,y:5.4,height:.7,art:table,foreground:true},{x:6.12,y:10.3,height:.72,art:manacles,foreground:true,z:.22}];
 if(!s.flags.royalDungeonFreed&&!d.cellsOpen)for(const cell of ROYAL_DUNGEON_CELLS)for(const person of cell.prisoners)objects.push({x:person.x+.5,y:person.y+.5,height:person.id.includes('kobold')?.65:.9,art:ctx=>prisoner(ctx,person.id)});
 const drawn=objects.map(o=>({...o,p:project(o.x,o.y,-.5)})).filter(o=>o.p).sort((a,b)=>b.p.depth-a.p.depth);
 const drawObject=o=>{const size=h*.85*o.height/o.p.depth,x=o.p.x-size*.5,y=o.p.y-size-(o.z||0)*h*.85/o.p.depth;if(x+size<0||x>w)return;c.save();c.beginPath();for(let xx=Math.max(0,Math.floor(x));xx<Math.min(w,x+size);xx+=2)if(o.p.depth<=wallDepth[xx]+.15)c.rect(xx,0,2,h);c.clip();c.translate(x,y);c.scale(size,size);o.art(c,time);c.restore();};for(const o of drawn.filter(o=>!o.foreground))drawObject(o);
 // Bars are drawn after their occupants, in perspective, with dark sides and a worn highlight.
 for(const cell of ROYAL_DUNGEON_CELLS){const b=cell.bars,bx=b.x+(b.facing===3?.94:.06);for(let y=b.top;y<b.bottom+1;y+=.16){if(d.cellsOpen&&y>=cell.door.y&&y<cell.door.y+1)continue;const top=project(bx,y,.48),bottom=project(bx,y,-.5);if(!top||!bottom)continue;const xx=Math.floor(top.x);if(xx<0||xx>=w||top.depth>wallDepth[xx]+.15)continue;const width=Math.max(2,h*.027/top.depth);c.strokeStyle='#161e1c';c.lineWidth=width;c.beginPath();c.moveTo(top.x,top.y);c.lineTo(bottom.x,bottom.y);c.stroke();c.strokeStyle='#899083';c.lineWidth=Math.max(1,width*.25);c.beginPath();c.moveTo(top.x-width*.18,top.y);c.lineTo(bottom.x-width*.18,bottom.y);c.stroke();}
  for(const z of [-.12,.46])for(let y=b.top;y<b.bottom+1;y+=.1){if(d.cellsOpen&&y>=cell.door.y&&y<cell.door.y+1)continue;const a=project(bx,y,z),v=project(bx,Math.min(b.bottom+1,y+.11),z);if(!a||!v)continue;const xx=Math.max(0,Math.min(w-1,Math.floor(a.x)));if(a.depth>wallDepth[xx]+.15)continue;c.strokeStyle='#424b43';c.lineWidth=Math.max(2,h*.025/a.depth);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(v.x,v.y);c.stroke();}
 }
 for(const o of drawn.filter(o=>o.foreground))drawObject(o);
}
