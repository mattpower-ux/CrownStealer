import {dungeonLadders} from './dungeon-ladders.js';
import {silhouetteComponents} from './sprite-bounds.js';
import {MONSTER_BY_ID,ENEMIES} from './bestiary.js';
import {DUNGEON_WALLS} from './dungeon-walls.js';
import {TOWN_SIZE,TOWN_PLACES,townPosition} from './town.js';
import {REGIONS,TOWNS,DUNGEONS} from './content.js';
import {worldTile,makeDungeon,dungeonMap,DIRS} from './engine.js';
const sprites=new Image();sprites.src='/assets/creatures.webp';
const adventurer=new Image();adventurer.src='/assets/adventurer.webp';
function drawAdventurer(c,x,y,size,flash=0){c.save();c.fillStyle='#05150a77';c.beginPath();c.ellipse(x,y+size*.36,size*.27,size*.10,0,0,Math.PI*2);c.fill();if(flash)c.filter=`brightness(${1+flash*1.8})`;if(adventurer.complete&&adventurer.naturalWidth)c.drawImage(adventurer,x-size/2,y-size/2,size,size);else{path(c,[[x,y-size*.35],[x-size*.25,y+size*.35],[x+size*.25,y+size*.35]],'#477653','#d5b675');circle(c,x,y-size*.3,size*.12,'#ddc295');c.strokeStyle='#e2e7da';c.lineWidth=2;c.beginPath();c.moveTo(x+size*.2,y);c.lineTo(x+size*.4,y+size*.35);c.stroke();}c.restore();}
const cover=new Image();cover.src='/assets/cover.webp';
const terrain=new Image();terrain.src='/assets/terrain.webp';
function tileArt(c,index,x,y,size){if(!terrain.complete||!terrain.naturalWidth)return false;const sw=terrain.width/4,sh=terrain.height/2;c.drawImage(terrain,(index%4)*sw,Math.floor(index/4)*sh,sw,sh,x,y,size+0.5,size+0.5);return true;}
const canopies=new Image();canopies.src='/assets/biome-trees.webp';
const BIOMES=[
 {ground:'#6e7846',light:'#c4bd77',road:'#a58a60',edge:'#796743'},
 {ground:'#bd895b',light:'#edc28c',road:'#97775f',edge:'#80604e'},
 {ground:'#71917a',light:'#bad0a1',road:'#8b9792',edge:'#566a65'},
 {ground:'#d0dce1',light:'#ffffff',road:'#a4b7c1',edge:'#8b9fac'}
];
function roadAt(region,x,y){return x>0&&x<31&&y>0&&y<23&&(x===16||y===12||[...TOWNS,...DUNGEONS].some(p=>p.region===region&&y===p.y&&x>=Math.min(16,p.x)&&x<=Math.max(16,p.x)));}
function groundTile(c,region,gx,gy,x,y,size){
 const t=worldTile(region,gx,gy),b=BIOMES[region];
 if(t==='water'){tileArt(c,3,x,y,size);c.fillStyle=REGIONS[region].palette.water+'55';c.fillRect(x,y,size+.5,size+.5);return;}
 c.fillStyle=b.ground;c.fillRect(x,y,size+.5,size+.5);
 let seed=((gx*73856093)^(gy*19349663)^(region*83492791))>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<18;i++){c.fillStyle=i%2?b.light+'40':'#23332820';const xx=x+random()*size,yy=y+random()*size;c.fillRect(xx,yy,Math.max(.6,size*.045),Math.max(.5,size*.018));}
 if(roadAt(region,gx,gy)){
  c.save();c.beginPath();c.rect(x,y,size+.5,size+.5);c.clip();
  const links=DIRS.filter(([dx,dy])=>roadAt(region,gx+dx,gy+dy));
  for(const [width,color] of [[.65,b.edge],[.53,b.road]]){c.strokeStyle=color;c.lineWidth=size*width;c.lineCap='round';c.beginPath();for(const [dx,dy] of links){c.moveTo(x+size/2,y+size/2);c.lineTo(x+size*(.5+dx*.65),y+size*(.5+dy*.65));}c.stroke();}
  c.beginPath();for(const [dx,dy] of links){if(dx)c.rect(x+(dx<0?0:.5)*size,y+size*.26,size*.5,size*.48);else c.rect(x+size*.26,y+(dy<0?0:.5)*size,size*.48,size*.5);}c.clip();
  for(let row=0;row<9;row++)for(let col=0;col<9;col++){const xx=x+(col+(row%2)*.5)*size/9,yy=y+row*size/9;
   c.fillStyle=region===2?(random()>.5?'#c2c8b7':'#748680'):region===3?'#e5edf088':region===1?'#d5c2a0':'#d6b27a50';
   if(region===2)c.fillRect(xx,yy,size*.085,size*.075);else if(random()>.55)c.fillRect(xx,yy,size*.035,size*.025);
  }c.restore();
 }
 if(t==='mountain'){tileArt(c,2,x,y,size);c.fillStyle=region===3?'#eaf5ff88':region===1?'#be6c3844':'#00000000';c.fillRect(x,y,size,size);}
 if(t==='forest'){
  if(canopies.complete&&canopies.naturalWidth){const sw=canopies.width/2,sh=canopies.height/2;const scale=.88+random()*.1,dx=random()*(1-scale),dy=random()*(1-scale);c.drawImage(canopies,region%2*sw,Math.floor(region/2)*sh,sw,sh,x+dx*size,y+dy*size,size*scale,size*scale);}
  else tree(c,x+size*.5,y+size*.5,size);
 }
}
const settlements=new Image();settlements.src='/assets/towns.webp';
const vault=new Image();vault.src='/assets/vault.webp';
const fair=new Image();fair.src='/assets/fair.webp';
function settlementIcon(c,t,x,y,size){if(t.name==='Gallows Fair'&&fair.complete&&fair.naturalWidth){c.drawImage(fair,x-size/2,y-size*.7,size,size);return;}const i=TOWNS.indexOf(t);if(settlements.complete&&settlements.naturalWidth){const sw=settlements.width/4,sh=settlements.height/3;c.drawImage(settlements,i%4*sw,Math.floor(i/4)*sh,sw,sh,x-size/2,y-size*.7,size,size);}else village(c,x,y,size*.6,t===TOWNS[1]);}
function path(c,pts,fill,stroke){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
function tree(c,x,y,s,shade=0){c.fillStyle='#0b191a66';c.beginPath();c.ellipse(x+s*.12,y+s*.33,s*.29,s*.1,0,0,7);c.fill();c.fillStyle='#4a3b2a';c.fillRect(x-s*.035,y,s*.07,s*.32);for(let i=0;i<3;i++)path(c,[[x,y-s*.48+i*s*.16],[x-s*(.21+i*.04),y+i*s*.17],[x+s*(.21+i*.04),y+i*s*.17]],shade?'#365f51':'#214c41','#173b34');path(c,[[x,y-s*.48],[x,y+s*.27],[x-s*.29,y+s*.34]],'#48745a55');}
function village(c,x,y,s,castle=false){c.fillStyle='#071e1b66';c.beginPath();c.ellipse(x,y+s*.2,s*.8,s*.24,0,0,7);c.fill();for(const [dx,dy,k] of [[-.38,.05,.6],[.3,.1,.7],[0,-.2,.9]]){const a=x+dx*s,b=y+dy*s,w=s*.42*k;c.fillStyle=castle?'#b1ab8f':'#c1b28c';c.fillRect(a-w/2,b-w/2,w,w*.8);path(c,[[a-w*.65,b-w*.5],[a,b-w],[a+w*.65,b-w*.5]],castle?'#6a7770':'#83533e');c.fillStyle='#eac776';c.fillRect(a-w*.12,b-w*.2,w*.18,w*.25);}if(castle){c.fillStyle='#bab69b';c.fillRect(x-s*.08,y-s*.9,s*.16,s*.8);path(c,[[x-s*.15,y-s*.9],[x,y-s*1.2],[x+s*.15,y-s*.9]],'#52685d');}}
function label(c,text,x,y,size=12,color='#f0e3bd'){c.font=`${size}px Georgia`;c.textAlign='center';c.shadowColor='#071411';c.shadowBlur=4;c.fillStyle=color;c.fillText(text,x,y);c.shadowBlur=0;}
export function render(canvas,s,time=0,fx=null,reduced=false){const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);const w=Math.max(1,rect.width),h=Math.max(1,rect.height);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
 if(s.dungeon&&(s.mode==='dungeon'||s.mode==='battle'&&s.returnMode==='dungeon'))canvas.dataset.wallTheme=DUNGEON_WALLS[s.dungeon.index].name;else delete canvas.dataset.wallTheme;
 const contact=s.mode==='battle'&&s.returnMode==='dungeon',wildContact=s.mode==='battle'&&s.returnMode!=='dungeon'&&s.enemy?.firstContact;
 canvas.dataset.view=wildContact?'wilderness-contact':contact?(s.enemy?.firstContact?'dungeon-contact':'dungeon-battle'):s.mode==='battle'?'battle-map':s.mode==='dungeon'?'dungeon-3d':s.mode==='town'?'town-map':'world-map';
 if(wildContact){world(c,w,h,s,0);wildernessMonster(c,w,h,s);}else if(contact){dungeon(c,w,h,s,reduced?0:time);dungeonMonster(c,w,h,s,time,fx,reduced);}else if(s.mode==='battle')battle(c,w,h,s,time,fx,reduced);else if(s.mode==='dungeon')dungeon(c,w,h,s,reduced?0:time);else if(s.mode==='town')town(c,w,h,s,reduced?0:time);else world(c,w,h,s,reduced?0:time);
 const v=c.createRadialGradient(w/2,h/2,h*.18,w/2,h/2,Math.max(w,h)*.65);v.addColorStop(0,'#00110b00');v.addColorStop(1,'#030e0ccc');c.fillStyle=v;c.fillRect(0,0,w,h);
}
function world(c,w,h,s,time){const p=REGIONS[s.region].palette;const size=Math.min(w/32,h/24),ox=(w-size*32)/2,oy=(h-size*24)/2;c.fillStyle=p.water;c.fillRect(0,0,w,h);c.save();c.translate(ox,oy);
 for(let y=0;y<24;y++)for(let x=0;x<32;x++)groundTile(c,s.region,x,y,x*size,y*size,size);
 for(const t of TOWNS.filter(t=>t.region===s.region)){settlementIcon(c,t,(t.x+.5)*size,(t.y+.5)*size,size*2);label(c,t.name,(t.x+.5)*size,(t.y+1.6)*size,Math.max(10,size*.42));}
 for(const d of DUNGEONS.filter(d=>d.region===s.region)){const x=(d.x+.5)*size,y=(d.y+.5)*size;if(d.id==='tithe-vault'&&vault.complete&&vault.naturalWidth){c.drawImage(vault,x-size*.8,y-size,size*1.6,size*1.6);label(c,d.name,x,y+size*1.1,Math.max(10,size*.4));continue;}path(c,[[x-size*.5,y+size*.3],[x-size*.4,y-size*.4],[x+size*.25,y-size*.7],[x+size*.6,y+size*.3]],'#718276','#a7a988');c.fillStyle='#101b18';c.beginPath();c.arc(x,y,size*.24,Math.PI,0);c.fillRect(x-size*.24,y,size*.48,size*.3);c.fill();circle(c,x,y+size*.1,size*.07,s.relics.includes(d.id)?'#bcd492':'#edb767');label(c,d.name,x,y+size*1.1,Math.max(10,size*.4));}
 const px=(s.x+.5)*size,py=(s.y+.5)*size;drawAdventurer(c,px,py,size*1.9);c.restore();
 label(c,'N',w-33,35,15,'#d1b57c');c.strokeStyle='#d1b57c';c.beginPath();c.moveTo(w-33,42);c.lineTo(w-33,66);c.stroke();path(c,[[w-33,39],[w-38,49],[w-28,49]],'#d1b57c');
}
const buildings=new Image();buildings.src='/assets/buildings.webp';
function buildingArt(c,index,x,y,w,h){if(buildings.complete&&buildings.naturalWidth){const sw=buildings.width/4,sh=buildings.height/2;c.drawImage(buildings,index%4*sw,Math.floor(index/4)*sh,sw,sh,x,y,w,h);}else village(c,x+w/2,y+h/2,Math.min(w,h)*.5,index===3);}
function town(c,w,h,s,time){
 const size=Math.min(w/TOWN_SIZE,h/TOWN_SIZE),ox=(w-size*TOWN_SIZE)/2,oy=(h-size*TOWN_SIZE)/2,b=BIOMES[s.region];
 c.fillStyle='#182b24';c.fillRect(0,0,w,h);c.save();c.translate(ox,oy);
 for(let y=0;y<TOWN_SIZE;y++)for(let x=0;x<TOWN_SIZE;x++){
  const boundary=x===0||y===0||x===12||y===12,road=[3,6,9].includes(x)||[5,9,11].includes(y);
  c.fillStyle=boundary?'#626654':road?'#9a937c':b.ground;c.fillRect(x*size,y*size,size+.5,size+.5);
  if(road&&!boundary){for(let row=0;row<5;row++)for(let col=0;col<5;col++){c.fillStyle=(row+col+x+y)%3?'#b4ac9255':'#666d5c44';c.fillRect((x+col/5+(row%2)*.04)*size,(y+row/5)*size,size*.17,size*.16);}}
  if(boundary){c.strokeStyle='#27382c';c.lineWidth=1;c.strokeRect(x*size,y*size,size,size);c.fillStyle='#9d9e80';c.fillRect(x*size+size*.1,y*size+size*.1,size*.3,size*.25);}
 }
 // Gardens, a fountain and modest homes between the main service streets.
 for(const [x,y] of [[1,5],[11,5],[1,9],[11,9]]){circle(c,(x+.5)*size,(y+.5)*size,size*.32,'#526943');circle(c,(x+.4)*size,(y+.4)*size,size*.2,'#7b8c55');}
 circle(c,6.5*size,9.5*size,size*.36,'#c0b999');circle(c,6.5*size,9.5*size,size*.27,'#497e83');circle(c,6.5*size,9.5*size,size*.08,'#c8d8ba');
 for(const place of TOWN_PLACES){
  if(place.id==='gate'){c.fillStyle='#9a937c';c.fillRect(6*size,12*size,size,size);buildingArt(c,7,5.8*size,11.6*size,size*1.4,size*1.2);continue;}
  if(place.art>=0){const bw=(place.bw||1)*size,bh=(place.bh||1)*size;buildingArt(c,place.art,place.bx*size,place.by*size,bw,bh);}
  else{c.save();c.filter='sepia(.7)';drawAdventurer(c,(place.x+.5)*size,(place.y-.25)*size,size*1.1);c.restore();}
  const xx=(place.x+.5)*size,yy=(place.y+.5)*size;c.strokeStyle='#f0cf87';c.lineWidth=2;c.beginPath();c.ellipse(xx,yy,size*.28,size*.13,0,0,Math.PI*2);c.stroke();
  label(c,place.name,xx,place.y*size-size*.08,Math.max(9,Math.min(14,size*.27)),'#fff0c6');
 }
 const pos=townPosition(s);drawAdventurer(c,(pos.x+.5)*size,(pos.y+.5)*size,size*1.25);c.restore();
}
function dungeon(c,w,h,s,time){const d=s.dungeon;if(!d)return;const m=dungeonMap(d),ladders=dungeonLadders(d,m),wall=DUNGEON_WALLS[d.index];const ceiling=c.createLinearGradient(0,0,0,h);ceiling.addColorStop(0,wall.ceiling);ceiling.addColorStop(.5,'#151b1b');ceiling.addColorStop(.51,wall.floor);ceiling.addColorStop(1,'#111816');c.fillStyle=ceiling;c.fillRect(0,0,w,h);const [dx,dy]=DIRS[d.dir];const angle=Math.atan2(dy,dx),fov=Math.PI/2.6,step=3;
 for(let col=0;col<w;col+=step){const a=angle+Math.atan((col/w-.5)*2*Math.tan(fov/2));const vx=Math.cos(a),vy=Math.sin(a);let dist=.02,x=d.x+.5,y=d.y+.5;while(dist<18){x=d.x+.5+vx*dist;y=d.y+.5+vy*dist;if(m[Math.floor(y)]?.[Math.floor(x)]===1||m[Math.floor(y)]?.[Math.floor(x)]===undefined)break;dist+=.025;}const corrected=dist*Math.cos(a-angle),height=Math.min(h*2,h*.85/corrected),top=(h-height)/2;const fracX=x-Math.floor(x),fracY=y-Math.floor(y),vertical=fracX<.04||fracX>.96,tex=vertical?fracY:fracX;const light=clamp(1-dist/11,.09,.95)*(vertical?.77:1);const mounted=ladders.find(l=>l.wallX===Math.floor(x)&&l.wallY===Math.floor(y)&&l.x===Math.floor(x-vx*.07)&&l.y===Math.floor(y-vy*.07));for(let yy=Math.max(0,top);yy<Math.min(h,top+height);yy+=3){const v=(yy-top)/height;const row=Math.floor(v*wall.rows);const mortar=(v*wall.rows)%1<.06||((tex*wall.columns+(row%2)*.5)%1)<.045;const grain=Math.sin(tex*190+v*140)*4;const wear=wall.wear===1&&(row+Math.floor(tex*9))%7===0?-9:wall.wear===2&&(tex*wall.columns)%1<.12?8:0;const base=mortar?28:78+grain+wear;c.fillStyle=`rgb(${Math.max(0,Math.floor((base+wall.tint[0])*light))},${Math.max(0,Math.floor((base+wall.tint[1])*light))},${Math.max(0,Math.floor((base+wall.tint[2])*light))})`;if(mounted){const rail=(tex>.28&&tex<.34)||(tex>.66&&tex<.72),rung=tex>.28&&tex<.72&&(v*9)%1<.14;const hatch=tex>.25&&tex<.75&&(mounted.direction==='up'?v<.13:v>.87);const arrowV=mounted.direction==='up'?.22:.78;const arrow=Math.abs(Math.abs(tex-.5)-Math.abs(v-arrowV)*1.4)<.025&&(mounted.direction==='up'?v>arrowV&&v<arrowV+.1:v<arrowV&&v>arrowV-.1);if(hatch)c.fillStyle='#080d0b';else if(arrow)c.fillStyle=mounted.direction==='up'?'#a6e4ef':'#ffe1a0';else if((rail||rung)&&v>.12&&v<.88)c.fillStyle=rail?'#a87b48':'#d2a56b';}c.fillRect(col,yy,step+1,3.5);}}
 const glow=c.createRadialGradient(w*.18,h*.68,5,w*.18,h*.68,w*.65);glow.addColorStop(0,'#e5a84021');glow.addColorStop(1,'#d9a34400');c.fillStyle=glow;c.fillRect(0,0,w,h);
 // Ladders are part of the ray-hit wall texture, so intervening walls occlude them.
 const here=ladders.find(l=>l.x===d.x&&l.y===d.y);if(here)label(c,(here.direction==='up'?'↑ ASCENT':'↓ DESCENT')+' · wall ladder',w/2,52,14,here.direction==='up'?'#a6e4ef':'#ffe1a0');
 // A clear floor map makes touch navigation usable without a separate overlay.
 const z=Math.min(7,w/65),mx=w-15*z-18,my=18;c.fillStyle='#06100de6';c.fillRect(mx-7,my-7,15*z+14,15*z+14);for(let y=0;y<15;y++)for(let x=0;x<15;x++){c.fillStyle=m[y][x]===1?'#354239':m[y][x]===2?'#c8a35f':'#101c19';c.fillRect(mx+x*z,my+y*z,z-1,z-1);}circle(c,mx+(d.x+.5)*z,my+(d.y+.5)*z,z*.4,'#f4db9c');c.strokeStyle='#f4db9c';c.beginPath();c.moveTo(mx+(d.x+.5)*z,my+(d.y+.5)*z);c.lineTo(mx+(d.x+.5+dx)*z,my+(d.y+.5+dy)*z);c.stroke();
 label(c,['NORTH','EAST','SOUTH','WEST'][d.dir],w/2,28,12,'#bfad85');
}
const monsterAtlases=Object.fromEntries(['dungeon-monsters','monsters-hearth','monsters-cinder','monsters-tide','monsters-star','monsters-wild'].map(key=>{const img=new Image();img.src='/assets/'+key+'.webp';return [key,img];}));
const monsterBounds=new Map();
function paintMonster(c,enemy,x,y,w,h,dungeonIndex=0){const species=MONSTER_BY_ID[enemy.speciesId]||ENEMIES.find(m=>m.name===enemy.name);const art=species?.art||{sheet:'dungeon-monsters',index:enemy.guard?11:enemy.boss?[2,2,4,4,7,6,8,10][dungeonIndex]:9};const img=monsterAtlases[art.sheet];if(!img?.complete||!img.naturalWidth)return false;const cols=art.sheet==='monsters-wild'?2:4,rows=art.sheet==='monsters-wild'?1:3,sw=img.width/cols,sh=img.height/rows,key=art.sheet+':'+art.index;
 if(!monsterBounds.has(art.sheet)){
  const sample=document.createElement('canvas');sample.width=img.width;sample.height=img.height;const sc=sample.getContext('2d',{willReadFrequently:true});sc.drawImage(img,0,0);
  for(const bounds of silhouetteComponents(sc.getImageData(0,0,img.width,img.height).data,img.width,img.height)){
   const col=Math.min(cols-1,Math.floor((bounds.x+bounds.width/2)/sw)),row=Math.min(rows-1,Math.floor((bounds.y+bounds.height/2)/sh)),id=art.sheet+':'+(row*cols+col),previous=monsterBounds.get(id);
   if(!previous||bounds.count>previous.count)monsterBounds.set(id,bounds);
  }monsterBounds.set(art.sheet,true);
 }
 const crop=monsterBounds.get(key)||{x:art.index%cols*sw,y:Math.floor(art.index/cols)*sh,width:sw,height:sh};
 const scale=Math.min(w/crop.width,h/crop.height),dw=crop.width*scale,dh=crop.height*scale;
 c.drawImage(img,crop.x,crop.y,crop.width,crop.height,x+(w-dw)/2,y+h-dh,dw,dh);return true;}
function wildernessMonster(c,w,h,s){
 c.fillStyle='#02100bcc';c.fillRect(0,0,w,h);const width=Math.min(w-28,560),left=(w-width)/2,top=70,height=Math.max(240,h-150);
 c.fillStyle='#142b21';c.fillRect(left,top,width,height);c.strokeStyle='#ac9560';c.strokeRect(left,top,width,height);
 label(c,s.enemy.name,w/2,top+34,Math.min(25,width/17),'#ffe0a2');
 const artHeight=Math.max(80,Math.min(height-165,380)),artWidth=Math.min(width*.75,artHeight*.95);
 paintMonster(c,s.enemy,w/2-artWidth/2,top+48,artWidth,artHeight);
 label(c,`Level ${s.enemy.level??'?'} · Health ${s.enemy.hp}/${s.enemy.maxHp}`,w/2,top+height-78,Math.min(17,width/23));
 label(c,`Armor ${s.enemy.armor??0} · Attack ${s.enemy.attack}`,w/2,top+height-54,Math.min(16,width/23));
 label(c,`Weakness: ${s.enemy.weakness||'unknown'}`,w/2,top+height-30,Math.min(16,width/26));
}
const monsterLayer=document.createElement('canvas');
function dungeonMonster(c,w,h,s,time,fx,reduced){
 const age=fx?time-fx.start:9999,hit=age>=0&&age<350&&fx.amount>0,enemyHit=hit&&fx.target==='enemy',heroHit=hit&&fx.target==='hero'&&fx.kind!=='heal';
 const pulse=hit?(reduced?.25:Math.sin(Math.PI*age/350)):0,fade=fx?.kind==='victory'?Math.max(0,1-age/900):1;
 if(fade===0)return;
 const height=Math.min(h*.67,w*.72),width=height*.85,x=w/2-width/2,feet=h*.82;
 c.save();c.globalAlpha=fade;const shadow=c.createRadialGradient(w/2,feet-3,2,w/2,feet-3,width*.55);shadow.addColorStop(0,'#000000b0');shadow.addColorStop(1,'#00000000');c.fillStyle=shadow;c.beginPath();c.ellipse(w/2,feet-3,width*.6,height*.07,0,0,Math.PI*2);c.fill();
 if(monsterLayer.width!==Math.ceil(width))monsterLayer.width=Math.ceil(width);if(monsterLayer.height!==Math.ceil(height))monsterLayer.height=Math.ceil(height);const mc=monsterLayer.getContext('2d');mc.clearRect(0,0,monsterLayer.width,monsterLayer.height);
 const painted=paintMonster(mc,s.enemy,0,0,width,height,s.dungeon.index);
 if(painted){if(enemyHit){mc.globalCompositeOperation='source-atop';mc.fillStyle=`rgba(255,20,15,${pulse*.8})`;mc.fillRect(0,0,width,height);mc.globalCompositeOperation='source-over';}c.drawImage(monsterLayer,x,feet-height);}else{c.fillStyle='#111a17';c.beginPath();c.ellipse(w/2,feet-height*.45,width*.25,height*.4,0,0,Math.PI*2);c.fill();circle(c,w/2-width*.06,feet-height*.72,3,'#d5b07c');circle(c,w/2+width*.06,feet-height*.72,3,'#d5b07c');}
 label(c,s.enemy.name+(s.enemy.level?' · Lv '+s.enemy.level:''),w/2,Math.max(85,feet-height-18),Math.max(17,Math.min(25,w*.035)), '#ffe0a2');
 c.fillStyle='#492c28';c.fillRect(w/2-100,feet+12,200,6);c.fillStyle='#cb7860';c.fillRect(w/2-100,feet+12,200*Math.max(0,s.enemy.hp)/s.enemy.maxHp,6);c.restore();
 if(heroHit){const red=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.15,w/2,h/2,Math.max(w,h)*.6);red.addColorStop(0,'#ff000000');red.addColorStop(1,`rgba(220,10,5,${pulse*.8})`);c.fillStyle=red;c.fillRect(0,0,w,h);}
 if(hit)label(c,`${fx.target==='enemy'?'-':'You: -'}${fx.amount}`,w/2,feet-height*.55,28,'#ffb4a0');
}
function battle(c,w,h,s,time,fx,reduced){
 const inDungeon=s.returnMode==='dungeon',maze=inDungeon?dungeonMap(s.dungeon):null;
 const px=inDungeon?s.dungeon.x:s.x,py=inDungeon?s.dungeon.y:s.y;
 const tile=(x,y)=>inDungeon?(maze[y]?.[x]===undefined||maze[y][x]===1?'wall':maze[y][x]===2?'stairs':'floor'):worldTile(s.region,x,y);
 const passable=(x,y)=>!['wall','water','mountain'].includes(tile(x,y));
 const [ex,ey]=[[px+1,py],[px-1,py],[px,py+1],[px,py-1]].find(([x,y])=>passable(x,y))||[px+1,py];
 const size=Math.min(w/15,(h-145)/11),ox=(w-size*15)/2,oy=105+(h-145-size*11)/2,originX=px-7,originY=py-5;
 c.fillStyle='#0b1b17';c.fillRect(0,0,w,h);
 for(let row=0;row<11;row++)for(let col=0;col<15;col++){
  const gx=originX+col,gy=originY+row,t=tile(gx,gy),x=ox+col*size,y=oy+row*size;
  if(inDungeon){c.fillStyle=t==='wall'?DUNGEON_WALLS[s.dungeon.index].map:DUNGEON_WALLS[s.dungeon.index].floor;c.fillRect(x,y,size,size);c.strokeStyle=t==='wall'?'#82907c55':'#a2ac7b19';c.strokeRect(x+1,y+1,size-2,size-2);if(t==='stairs')label(c,'STAIRS',x+size/2,y+size*.6,Math.max(7,size*.18),'#d7bf83');}
  else{groundTile(c,s.region,gx,gy,x,y,size);const town=TOWNS.find(p=>p.region===s.region&&p.x===gx&&p.y===gy);if(town)settlementIcon(c,town,x+size/2,y+size/2,size*1.3);const ruin=DUNGEONS.find(p=>p.region===s.region&&p.x===gx&&p.y===gy);if(ruin){if(ruin.id==='tithe-vault'&&vault.complete&&vault.naturalWidth)c.drawImage(vault,x,y,size,size);else tileArt(c,6,x,y,size);}}
  c.strokeStyle='#06150b18';c.strokeRect(x,y,size,size);
 }
 const heroX=ox+7.5*size,heroY=oy+5.5*size,enemyX=ox+(ex-originX+.5)*size,enemyY=oy+(ey-originY+.5)*size;
 const age=fx?time-fx.start:9999,impact=age>=0&&age<350,pulse=impact?Math.sin(Math.PI*age/350):0;
 const enemyHit=impact&&fx.target==='enemy',heroHit=impact&&fx.target==='hero',icon=Math.min(48,Math.max(25,size*.95));
 circle(c,heroX,heroY,icon*.58,'#c9af6455');drawAdventurer(c,heroX,heroY,icon*1.35,heroHit&&!reduced?pulse:0);
 const shake=enemyHit&&!reduced?Math.sin(age*.06)*3*(1-age/350):0;
 c.save();c.translate(enemyX+shake,enemyY);circle(c,0,0,icon*.62,'#4b1c18e8');c.strokeStyle=enemyHit?'#ffe2a1':'#df967a';c.lineWidth=2;c.beginPath();c.arc(0,0,icon*.62,0,Math.PI*2);c.stroke();
 if(enemyHit&&!reduced)c.filter=`brightness(${1+pulse*2})`;
 c.beginPath();c.arc(0,0,icon*.56,0,Math.PI*2);c.clip();
 if(paintMonster(c,s.enemy,-icon*.5,-icon*.55,icon,icon*1.1,s.dungeon?.index||0)){}else if(/rat/i.test(s.enemy.name)){c.save();c.scale(icon,icon);c.strokeStyle='#d5a88a';c.lineWidth=.055;c.beginPath();c.moveTo(-.19,.12);c.bezierCurveTo(-.65,.38,-.52,-.30,-.34,-.32);c.stroke();c.fillStyle='#b19b7c';c.beginPath();c.ellipse(-.03,.05,.29,.19,-.3,0,Math.PI*2);c.fill();path(c,[[.09,-.06],[.38,-.10],[.23,.14]],'#c5b49a');circle(c,.12,-.11,.085,'#d8b49a');circle(c,.25,-.025,.022,'#efcc70');c.restore();}else if(/eel/i.test(s.enemy.name)){c.strokeStyle='#85b7bc';c.lineWidth=icon*.15;c.beginPath();c.moveTo(-icon*.3,icon*.3);c.bezierCurveTo(icon*.5,icon*.2,-icon*.45,-icon*.2,icon*.25,-icon*.3);c.stroke();circle(c,icon*.26,-icon*.3,icon*.10,'#b6d5cb');circle(c,icon*.29,-icon*.33,icon*.025,'#1b2220');}else if(sprites.complete&&sprites.naturalWidth){const names={'Debt Collector':0,'Grave Lantern':7,'Ash Road Brigand':0,'Brass Inquisitor':5,'Ironroot Stalker':6,'Coral Bailiff':2,'Starving Automaton':4,'Gravity Wraith':7,'Crown Echo':5};const i=s.enemy.guard?2:/wolf|hound/i.test(s.enemy.name)?1:/skeleton|bone/i.test(s.enemy.name)?3:names[s.enemy.name]??(s.enemy.boss?Math.min(7,s.region*2+1):s.region*2);const sw=sprites.width/4,sh=sprites.height/2;c.drawImage(sprites,i%4*sw,Math.floor(i/4)*sh,sw,sh,-icon*.5,-icon*.6,icon,icon*1.25);}else label(c,'!',0,icon*.2,icon*.7,'#efc5a0');c.restore();
 label(c,s.name,heroX,heroY-icon*.85,12,'#ffe2a1');label(c,'ENEMY',enemyX,enemyY+icon*.95,10,'#f7b39a');
 c.fillStyle='#0c211ced';c.fillRect(Math.max(12,w/2-145),54,Math.min(290,w-24),46);label(c,s.enemy.name+(s.enemy.level?' · Lv '+s.enemy.level:''),w/2,72,Math.min(17,w/25));c.fillStyle='#593e30';c.fillRect(w/2-100,81,200,5);c.fillStyle='#cd8663';c.fillRect(w/2-100,81,200*s.enemy.hp/s.enemy.maxHp,5);label(c,`${s.enemy.hp} / ${s.enemy.maxHp}`,w/2,97,10);
 if(impact){const x=fx.target==='hero'?heroX:enemyX,y=fx.target==='hero'?heroY:enemyY;const message=fx.kind==='victory'?'VICTORY':fx.kind==='defeat'?'DEFEATED':fx.kind==='miss'?'MISS':(fx.kind==='heal'?'+':'-')+fx.amount;
  label(c,message,x,y-icon-(reduced?0:age*.035),22,fx.kind==='heal'?'#b1f0b1':fx.kind==='block'?'#a0e6ef':'#ffe5b3');
  if(fx.amount){c.strokeStyle=fx.kind==='magic'?'#f2b876':fx.kind==='block'?'#8fdbe6':'#ffe0aa';c.lineWidth=2;c.beginPath();if(fx.kind==='magic'||fx.kind==='block')c.arc(x,y,icon*.72,0,Math.PI*2);else{c.moveTo(x-icon*.5,y+icon*.4);c.lineTo(x+icon*.5,y-icon*.4);}c.stroke();}
 }
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
