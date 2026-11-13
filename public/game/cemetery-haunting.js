import {isCemeteryDungeon} from './cemetery-render.js';
import {cemeteryLightAt} from './cemetery-light.js';

// Connected interior tiles identify one chamber without counting its narrow corridors.
export function beginCemeteryHaunting(s,map){
 if(s.mode!=='dungeon'||!isCemeteryDungeon(s.dungeon))return null;
 const d=s.dungeon,open=(x,y)=>map[y]?.[x]!==undefined&&map[y][x]!==1;
 const interior=(x,y)=>[-1,0,1].every(dy=>[-1,0,1].every(dx=>open(x+dx,y+dy)));
 if(!interior(d.x,d.y)||cemeteryLightAt(s,map,d.x+.5,d.y+.5)>.05)return null;
 const queue=[[d.x,d.y]],seen=new Set([`${d.x},${d.y}`]);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const key=`${x+dx},${y+dy}`;if(!seen.has(key)&&interior(x+dx,y+dy)){seen.add(key);queue.push([x+dx,y+dy]);}}}
 if(queue.length<3)return null;
 const anchor=[...seen].sort()[0],key=`${d.site||'vault'}:${d.minorId||d.index}:${d.floor||0}:${anchor}`;
 s.flags.cemeteryHauntings??=[];if(s.flags.cemeteryHauntings.includes(key))return null;
 s.flags.cemeteryHauntings.push(key);
 return {key,name:s.name||'Wanderer'};
}

export function drawCemeteryHaunting(canvas,elapsed,name,reduced=false){
 if(elapsed<0||elapsed>10000)return;
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 const fade=Math.min(1,elapsed/1800,Math.max(0,(10000-elapsed)/2000));
 c.save();c.globalAlpha=fade;
 for(let i=0;i<3;i++){
  const approach=reduced?1:Math.min(1,elapsed/2400),side=i-1;
  const x=w*(.5+side*(.23+(1-approach)*.22)),y=h*(.43+(i===1?-.08:.03))+(reduced?0:Math.sin(elapsed/850+i*2)*h*.012);
  const size=Math.min(w*.17,h*.28);c.save();c.translate(x,y);c.scale(size,size);
  c.shadowColor='#9ce7ef';c.shadowBlur=35;
  const veil=c.createLinearGradient(0,-.7,0,1.1);veil.addColorStop(0,'rgba(220,255,255,.8)');veil.addColorStop(.4,'rgba(135,214,227,.5)');veil.addColorStop(1,'rgba(111,188,211,0)');c.fillStyle=veil;
  c.beginPath();c.moveTo(-.2,-.62);c.bezierCurveTo(-.55,-.5,-.4,.1,-.72,.8);c.bezierCurveTo(-.26,.45,-.4,1.1,0,.92);c.bezierCurveTo(.35,1.2,.38,.5,.7,.85);c.bezierCurveTo(.38,.1,.47,-.5,.2,-.62);c.closePath();c.fill();
  c.fillStyle='rgba(12,43,58,.75)';c.beginPath();c.ellipse(0,-.37,.19,.25,0,0,Math.PI*2);c.fill();c.shadowBlur=12;c.fillStyle='#e1ffff';
  for(const ex of [-.075,.075]){c.beginPath();c.ellipse(ex,-.4,.028,.018,0,0,Math.PI*2);c.fill();}
  c.strokeStyle='rgba(219,255,255,.22)';c.lineWidth=.012;for(let fold=-2;fold<=2;fold++){c.beginPath();c.moveTo(fold*.07,-.05);c.quadraticCurveTo(fold*.1,.4,fold*.18,.85);c.stroke();}c.restore();
 }
 const beat=Math.floor((elapsed-2200)/1900);
 if(beat>=0&&beat<3){c.shadowBlur=14;c.shadowColor='#b8faff';c.fillStyle='#dcffff';c.textAlign='center';c.font=`italic ${Math.max(18,w*.022)}px Georgia`;c.fillText(`“${name}…”`,w*.5,h*.72);}
 c.restore();
}
