import {drawMetalTube} from './spaceship-scenery.js';
import {dungeonChests} from './treasure.js';
export function drawDungeonChests(c,w,h,s,map,dx,dy){
 const style=s.dungeon.site==='elf-village'?['#49674c','#789669','#b6a277']:s.dungeon.royal==='sewer'?['#535646','#7e8064','#9b6846']:[['#805535','#b58b59','#d4b57c'],['#684644','#976d59','#a9b4bd'],['#4b6570','#7b96a0','#d0c9a3'],['#5e5474','#9586ad','#c2d6e9']][s.region];const visible=[];
 for(const chest of dungeonChests(s,map)){
  const rx=chest.x-s.dungeon.x,ry=chest.y-s.dungeon.y,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx,here=rx===0&&ry===0;
  if(!here&&(depth<=0||Math.abs(side/depth)>.65))continue;
  const distance=Math.hypot(rx,ry);let blocked=false;
  for(let t=.1;t<distance;t+=.12)if(map[Math.floor(s.dungeon.y+.5+ry*t/distance)]?.[Math.floor(s.dungeon.x+.5+rx*t/distance)]===1){blocked=true;break;}
  if(!blocked)visible.push({...chest,depth:here?.65:depth,here,side});
 }
 visible.sort((a,b)=>b.depth-a.depth);
 for(const box of visible){const size=Math.min(w*.32,h*.32/box.depth),x=box.here?w*.5:w*.5+box.side/box.depth*w*.72,y=box.here?h*.81:Math.min(h*.86,h*.5+h*.36/box.depth);c.save();c.translate(x,y);c.fillStyle='#0008';c.beginPath();c.ellipse(0,size*.08,size*.62,size*.16,0,0,Math.PI*2);c.fill();if(s.dungeon.ship||s.dungeon.expedition?.startsWith('planet-')){drawMetalTube(c,size,box.opened);c.restore();continue;}c.fillStyle=box.opened?'#35271c':style[0];c.strokeStyle='#24180f';c.lineWidth=Math.max(1,size*.025);c.fillRect(-size*.5,-size*.43,size,size*.43);c.strokeRect(-size*.5,-size*.43,size,size*.43);c.fillStyle=box.opened?'#36291d':style[1];c.beginPath();c.moveTo(-size*.5,-size*.43);c.lineTo(-size*.37,-size*(box.opened?.82:.62));c.lineTo(size*.37,-size*(box.opened?.82:.62));c.lineTo(size*.5,-size*.43);c.closePath();c.fill();c.stroke();c.fillStyle=style[2];for(const xx of (s.dungeon.index%2?[-.4,-.03,.34]:[-.32,.25]))c.fillRect(size*xx,-size*.59,size*.07,size*.59);c.fillStyle=box.opened?'#15110e':'#e4bd6b';c.fillRect(-size*.09,-size*.41,size*.18,size*.18);c.fillStyle='#24180f';c.fillRect(-size*.02,-size*.36,size*.04,size*.08);c.restore();}
}
