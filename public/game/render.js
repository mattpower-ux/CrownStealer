import {caveProfile} from './cave-profiles.js';
import {drawDungeonCeiling} from './dungeon-ceilings.js';
import {mountFor} from './mounts.js';
import {dragonFlying} from './dragon.js';
import {townSign} from './town-signs.js';
import {castleFigures,castleGuards,castleLayout} from './castle-interiors.js';
import {castleFurnishings} from './castle-furnishings.js';
import {ROYAL_DUNGEON_ID,ROYAL_DUNGEON_CELLS,ROYAL_DUNGEON_NPCS,royalDungeonFigures} from './royal-dungeon.js';
import {BALROG_ID} from './bottomless-pit.js';
import {PUTRID_PALACE,WANG_ID} from './royal-trials.js';

let viewportGround=null;

const townGrounds=new Image();townGrounds.src='/assets/town-grounds.webp';
const townBackgrounds=new Map();function townBackground(id){if(!townBackgrounds.has(id)){const image=new Image();image.src='/assets/town-ground-'+id+'.webp';townBackgrounds.set(id,image);if(townBackgrounds.size>2)townBackgrounds.delete(townBackgrounds.keys().next().value);}return townBackgrounds.get(id);}

import {townPlaces} from './town.js';

import {regionalBuilding} from './regional-buildings.js';

import {wallMaterial,wallMaterialPixel,wallMaterialRevision,alienWallInk} from './wall-materials.js';

import {drawOceanBuilding} from './ocean-buildings.js';

import {drawSaltChoirIcon} from './salt-choir-art.js';

import {shipWallInk} from './spaceship-scenery.js';

import {SEWER_WALL,drawSewerChannel} from './sewer-scenery.js';

import {drawFishBones,drawRowboat} from './nautical.js';

import {drawCemeteryStones,drawDungeonIcon,drawLandmark} from './dungeon-icons.js';

import {regionTrails,drawTrailCurve} from './trails.js';

import {areaFor,areaSites,areaTile,branchGates,teleporterSite} from './exploration.js';
import {WORLD_WIDTH,worldSize} from './world-size.js';

import {drawTownScenery} from './town-scenery.js';

import {drawGearAvatar} from './gear-avatar.js';

const mountAtlas=new Image();mountAtlas.src='/assets/mounts.webp';const ridingDragon=new Image();ridingDragon.src='/assets/dragon-mount.webp';
let renderedHero=null;

import {WILD_SITES,GROVE_ENEMIES} from './wild-sites.js';

import {drawForest,treeFort} from './forest-render.js';

import {wallDetail,wallDetailKind} from './wall-details.js';

import {drawDungeonChests} from './chest-render.js';

import {dungeonChests} from './treasure.js';

import {dungeonLadders} from './dungeon-ladders.js';

import {silhouetteComponents} from './sprite-bounds.js';

import {MONSTER_BY_ID,ENEMIES} from './bestiary.js';

import {DUNGEON_WALLS} from './dungeon-walls.js';

import {TOWN_SIZE,TOWN_PLACES,townPosition} from './town.js';

import {REGIONS,TOWNS,DUNGEONS} from './content.js';

import {worldTile,makeDungeon,dungeonMap,DIRS,minorSiteList} from './engine.js';

const sprites=new Image();sprites.src='/assets/creatures.webp';

const adventurer=new Image();adventurer.src='/assets/adventurer.webp';


function drawMountedHero(c,hero,mount,size,flash){
 const image=mount.index===3?ridingDragon:mountAtlas;if(!image.complete||!image.naturalWidth)return false;
 const height=size*1.45,width=mount.index===3?height*image.width/image.height:height;
 c.save();if(flash)c.filter=`brightness(${1+flash*1.8})`;c.fillStyle='#06130c55';c.beginPath();c.ellipse(0,size*.56,size*.65,size*.13,0,0,7);c.fill();
 if(mount.index===3)c.drawImage(image,-width/2,-height*.52,width,height);else{const cell=image.width/4;c.drawImage(image,mount.index*cell,0,cell,image.height,-width/2,-height*.52,width,height);}
 const seats=[[.43,.49],[.40,.49],[.38,.40],[.48,.46]],seat=seats[mount.index],sx=(seat[0]-.5)*width,sy=(seat[1]-.52)*height,rider=size*.85;
 // Bent thigh, hanging shin and forward boot clearly straddle the saddle.
 c.lineCap='round';c.lineJoin='round';c.strokeStyle='#34251c';c.lineWidth=size*.15;c.beginPath();c.moveTo(sx-size*.04,sy);c.lineTo(sx+size*.19,sy+size*.16);c.lineTo(sx+size*.10,sy+size*.38);c.stroke();c.strokeStyle='#7a5835';c.lineWidth=size*.105;c.stroke();c.strokeStyle='#35271e';c.lineWidth=size*.13;c.beginPath();c.moveTo(sx+size*.10,sy+size*.33);c.lineTo(sx+size*.10,sy+size*.43);c.lineTo(sx+size*.25,sy+size*.43);c.stroke();
 // Crop the standing avatar at the hips; keep its selected face and equipped torso.
 c.save();c.beginPath();c.rect(sx-rider*.6,sy-rider*.72,rider*1.2,rider*.78);c.clip();drawGearAvatar(c,hero,sx,sy-rider*.12,rider);c.restore();
 c.strokeStyle='#493322';c.lineWidth=Math.max(1,size*.018);c.beginPath();c.moveTo(sx+size*.15,sy-size*.13);c.quadraticCurveTo(size*.48,sy+size*.08,size*.55,-size*.15);c.stroke();c.restore();return true;
}

function drawAdventurer(c,x,y,size,flash=0){c.save();const projection=c.getTransform(),aspect=Math.abs(projection.a/projection.d)||1;c.translate(x,y);c.scale(1/aspect,1);x=0;y=0;const activeMount=renderedHero&&mountFor(renderedHero),outdoors=renderedHero&&(renderedHero.mode==='world'||renderedHero.mode==='battle'&&renderedHero.returnMode==='world');if(activeMount&&outdoors&&drawMountedHero(c,renderedHero,activeMount,size,flash)){c.restore();return;}c.save();c.fillStyle='#05150a77';c.beginPath();c.ellipse(x,y+size*.36,size*.27,size*.10,0,0,Math.PI*2);c.fill();if(flash)c.filter=`brightness(${1+flash*1.8})`;if(renderedHero&&drawGearAvatar(c,renderedHero,x,y,size)){}else if(adventurer.complete&&adventurer.naturalWidth)c.drawImage(adventurer,x-size/2,y-size/2,size,size);else{path(c,[[x,y-size*.35],[x-size*.25,y+size*.35],[x+size*.25,y+size*.35]],'#477653','#d5b675');circle(c,x,y-size*.3,size*.12,'#ddc295');c.strokeStyle='#e2e7da';c.lineWidth=2;c.beginPath();c.moveTo(x+size*.2,y);c.lineTo(x+size*.4,y+size*.35);c.stroke();}c.restore();c.restore();}

const cover=new Image();cover.src='/assets/cover.webp';

const terrain=new Image();terrain.src='/assets/terrain.webp';

function tileArt(c,index,x,y,size){if(!terrain.complete||!terrain.naturalWidth)return false;const sw=terrain.width/4,sh=terrain.height/2;c.drawImage(terrain,(index%4)*sw,Math.floor(index/4)*sh,sw,sh,x,y,size+0.5,size+0.5);return true;}

const canopies=new Image();canopies.src='/assets/biome-trees.webp';

// Small cached pixel tiles keep terrain detail inexpensive on tablets.

const groundTiles=new Map();

function clearGround(){groundTiles.clear();viewportGround=null;}
terrain.addEventListener('load',clearGround);

const BIOMES=[

 {ground:'#91a45c',light:'#c4bd77',road:'#a58a60',edge:'#796743'},

 {ground:'#d3a877',light:'#edc28c',road:'#97775f',edge:'#80604e'},

 {ground:'#92b59b',light:'#bad0a1',road:'#8b9792',edge:'#566a65'},

 {ground:'#d0dce1',light:'#ffffff',road:'#a4b7c1',edge:'#8b9fac'}

];

function outdoorMap(s){
 const area=areaFor(s),region=s.region;
 return {
  ...worldSize(s),area,region,id:area?.id??region,
  tileAt:area?(x,y)=>areaTile(s,x,y):(x,y)=>worldTile(region,x,y)
 };
}

function groundTile(c,map,gx,gy,x,y,size){
 const key=`${map.id}:${gx}:${gy}`;
 let tile=groundTiles.get(key);
 if(tile)groundTiles.delete(key);
 else{
  tile=document.createElement('canvas');
  tile.width=tile.height=48;
  paintGroundTile(tile.getContext('2d'),map,gx,gy,0,0,48);
 }
 groundTiles.set(key,tile);
 if(groundTiles.size>2048)groundTiles.delete(groundTiles.keys().next().value);
 c.drawImage(tile,x,y,size+.5,size+.5);
}

const regionGround=new Image();regionGround.src='/assets/region-ground-rich.webp';regionGround.onload=clearGround;
const richTerrain=new Image();richTerrain.src='/assets/terrain-rich.webp';richTerrain.onload=clearGround;

function drawBridgeDeck(c,x,y,size,vertical){
 c.save();c.translate(x+size*.5,y+size*.5);if(vertical)c.rotate(Math.PI/2);c.scale(size,size);
 c.fillStyle='#1b24204f';c.fillRect(-.5,-.25,1,.62);
 c.fillStyle='#9d7950';c.fillRect(-.5,-.24,1,.48);
 for(let board=0;board<8;board++){
  const bx=-.5+board/8;
  c.fillStyle=board%2?'#bc9362':'#ad865a';c.fillRect(bx,-.22,.107,.44);
  c.fillStyle='#583e2d';c.fillRect(bx+.106,-.22,.02,.44);
 }
 for(const side of [-1,1]){
  const rail=side*.26;
  c.fillStyle='#694d37';c.fillRect(-.5,rail-.027,1,.07);
  c.fillStyle='#d0a879';c.fillRect(-.5,rail-.027,1,.026);
  for(const post of [-.42,.41]){c.fillStyle='#59412f';c.fillRect(post-.027,rail-.047,.055,.1);}
 }
 c.restore();
}

function paintGroundTile(c,map,gx,gy,x,y,size){

 const {region,tileAt,width,height,area}=map,t=tileAt(gx,gy),b=BIOMES[region];

 if(t==='water'||t==='bridge'){c.fillStyle=area?.kind==='planet'?['#28243d','#243c39','#2b3151'][Number(area.id.at(-1))]:area?'#448b99':REGIONS[region].palette.water;c.fillRect(x,y,size+.5,size+.5);const watery=c.createLinearGradient(0,0,size,size);watery.addColorStop(0,'#79c9d525');watery.addColorStop(1,'#081e3320');c.fillStyle=watery;c.fillRect(x,y,size+.5,size+.5);c.strokeStyle='#94dde43d';c.lineWidth=.7;for(let k=0;k<5;k++){const yy=size*(k+.4)/5;c.beginPath();c.moveTo(size*.06,yy);c.quadraticCurveTo(size*.3,yy-size*.045,size*.48,yy);c.quadraticCurveTo(size*.7,yy+size*.035,size*.94,yy-size*.01);c.stroke();}for(const [dx,dy] of DIRS){if(['water','bridge'].includes(tileAt(gx+dx,gy+dy)))continue;c.strokeStyle=region===3?'#d6e7e3aa':'#cfcca177';c.lineWidth=size*.08;c.lineCap='round';c.beginPath();if(dx){const xx=dx>0?size:0;c.moveTo(xx,size*.1);c.quadraticCurveTo(xx-dx*size*.06,size*.5,xx,size*.9);}else{const yy=dy>0?size:0;c.moveTo(size*.1,yy);c.quadraticCurveTo(size*.5,yy-dy*size*.06,size*.9,yy);}c.stroke();}
 if(t==='bridge'){
  const route=(tx,ty)=>['road','bridge'].includes(tileAt(tx,ty));
  const vertical=Number(route(gx,gy-1))+Number(route(gx,gy+1))>Number(route(gx-1,gy))+Number(route(gx+1,gy));
  drawBridgeDeck(c,x,y,size,vertical);
 }
 return;}

 c.fillStyle=b.ground;c.fillRect(x,y,size+.5,size+.5);if(regionGround.complete&&regionGround.naturalWidth){const sw=regionGround.width/2,sh=regionGround.height/2;c.drawImage(regionGround,(region%2)*sw+gx/width*sw,Math.floor(region/2)*sh+gy/height*sh,sw/width,sh/height,x,y,size+.5,size+.5);}
 if(t==='swamp'||t==='sand'){c.fillStyle=t==='swamp'?'#36584175':'#dfbb6b55';c.fillRect(x,y,size+.5,size+.5);}

 let seed=((gx*73856093)^(gy*19349663)^(region*83492791))>>>0;

 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};

 // Broken patches, tufts and occasional flowers, all fixed to map coordinates.

 for(let i=0;i<10;i++){c.fillStyle=i%2?b.light+'18':'#23332816';c.fillRect(Math.floor(random()*40),Math.floor(random()*42),4+Math.floor(random()*10),2+Math.floor(random()*5));}

 for(let i=0;i<26;i++){const xx=Math.floor(random()*46),yy=Math.floor(random()*46);c.fillStyle=i%3?b.light+'70':'#23332845';c.fillRect(xx,yy,2,1);if(i%4===0&&region!==1){c.fillRect(xx+1,yy-2,1,3);c.fillRect(xx-1,yy-1,1,2);}}

 if(random()<.24&&region!==3){c.fillStyle=region===1?'#d8ae77':'#ded39a';for(let i=0;i<3;i++)c.fillRect(Math.floor(random()*44)+2,Math.floor(random()*44)+2,1,1);}

 if((t==='forest'||t==='mountain')&&richTerrain.complete&&richTerrain.naturalWidth){return;}

 if(t==='swamp'){
  for(let pool=0;pool<3;pool++){
   const xx=x+size*(.16+random()*.68),yy=y+size*(.17+random()*.66);
   c.fillStyle=pool%2?'#285545a0':'#2d696288';
   c.beginPath();c.ellipse(xx,yy,size*(.08+random()*.16),size*.056,-.1,0,Math.PI*2);c.fill();
   c.strokeStyle='#8b9a63';c.lineWidth=.8;c.beginPath();
   for(let reed=-1;reed<=1;reed++){c.moveTo(xx,yy);c.lineTo(xx+reed*size*.045,yy-size*(.06+random()*.08));}
   c.stroke();
  }
 }

 if(t==='road'){

  c.save();c.beginPath();c.rect(x,y,size+.5,size+.5);c.clip();

  const links=DIRS.filter(([dx,dy])=>['road','bridge'].includes(tileAt(gx+dx,gy+dy)));

  for(const [width,color] of [[.65,b.edge],[.53,b.road]]){c.strokeStyle=color;c.lineWidth=size*width;c.lineCap='round';c.beginPath();for(const [dx,dy] of links){c.moveTo(x+size/2,y+size/2);c.lineTo(x+size*(.5+dx*.65),y+size*(.5+dy*.65));}c.stroke();}

  for(let i=0;i<16;i++){c.fillStyle=i%2?b.road+'88':b.light+'40';c.fillRect(Math.floor(random()*size),Math.floor(random()*size),2,1);}

  c.beginPath();for(const [dx,dy] of links){if(dx)c.rect(x+(dx<0?0:.5)*size,y+size*.26,size*.5,size*.48);else c.rect(x+size*.26,y+(dy<0?0:.5)*size,size*.48,size*.5);}c.clip();

  for(let row=0;row<9;row++)for(let col=0;col<9;col++){const xx=x+(col+(row%2)*.5)*size/9,yy=y+row*size/9;

   c.fillStyle=region===2?(random()>.5?'#c2c8b7':'#748680'):region===3?'#e5edf088':region===1?'#d5c2a0':'#d6b27ab0';

   if(region===2||region===0){c.fillStyle=random()>.5?'#c5b797':'#aa9d80';c.fillRect(Math.floor(xx),Math.floor(yy),4,3);c.fillStyle='#e0d0ac';c.fillRect(Math.floor(xx),Math.floor(yy),3,1);}else if(random()>.25){c.fillRect(Math.floor(xx),Math.floor(yy),2,1);c.fillStyle=b.edge+'aa';c.fillRect(Math.floor(xx)+1,Math.floor(yy)+1,2,1);}

  }c.restore();

 }

 if(t==='mountain'){c.fillStyle='#626f66';c.fillRect(x,y+size*.5,size,size*.5);for(const [dx,dy] of DIRS){if(tileAt(gx+dx,gy+dy)==='mountain')path(c,[[x+size*.5,y+size*.25],[x+size*(.5+dx),y+size*(.7+dy*.5)],[x+size*.5,y+size]],'#6b786f');}path(c,[[x,y+size],[x+size*.14,y+size*.55],[x+size*.28,y+size*.58],[x+size*.48,y+size*.05],[x+size*.63,y+size*.4],[x+size*.74,y+size*.35],[x+size,y+size]],'#747e7d','#535f5d');path(c,[[x+size*.48,y],[x+size*.55,y+size*.83],[x+size,y+size]],'#515f60');path(c,[[x+size*.48,y],[x+size*.24,y+size*.49],[x+size*.41,y+size*.39],[x+size*.52,y+size*.51],[x+size*.61,y+size*.38],[x+size*.74,y+size*.5]],'#eef3e6');for(let k=0;k<7;k++){const yy=y+size*(.5+k*.065);c.strokeStyle=k%2?'#adb5a0':'#455956';c.lineWidth=1;c.beginPath();c.moveTo(x+size*.48,yy-size*.12);c.lineTo(x+size*(.18+k*.018),yy);c.stroke();}}

 if(t==='forest'){

  const palettes=[['#354d2c','#4f7138','#719548','#a3bd60'],['#574930','#75663c','#91804b','#b1a16b'],['#244d44','#356555','#54856a','#85a17a'],['#3b5b57','#598079','#9bb5ac','#e0e9dc']];

  const colors=palettes[region];

  // Several overlapping, stepped crowns replace the identical round canopy stamp.

  const crowns=7+Math.floor(random()*4);

  for(let j=0;j<crowns;j++){

   const r=9+Math.floor(random()*5),cx=r+2+Math.floor(random()*(44-r*2)),cy=r+2+Math.floor(random()*(42-r*2));

   c.fillStyle='#18261e55';c.fillRect(cx-r+3,cy+r-2,r*2,5);

   c.fillStyle='#57452e';c.fillRect(cx,cy+3,2,r+3);

   for(let row=-r;row<=r;row+=2){const width=Math.floor(Math.sqrt(Math.max(0,r*r-row*row)))+Math.floor(random()*3);c.fillStyle=colors[0];c.fillRect(cx-width,cy+row,width*2,2);}

   for(let k=0;k<15;k++){const dx=Math.floor(random()*r*1.6-r*.8),dy=Math.floor(random()*r*1.6-r*.8);if(dx*dx+dy*dy>r*r*.8)continue;c.fillStyle=colors[dy<0?2+(k%3===0?1:0):1];c.fillRect(cx+dx,cy+dy,2+Math.floor(random()*3),2);}

  }

 }



}

const settlements=new Image();settlements.src='/assets/town-architecture.webp';

const vault=new Image();vault.src='/assets/vault.webp';

const fair=new Image();fair.src='/assets/fair.webp';

function settlementIcon(c,t,x,y,size){const i=TOWNS.indexOf(t);if(settlements.complete&&settlements.naturalWidth){const sw=settlements.width/4,sh=settlements.height/3;c.drawImage(settlements,i%4*sw,Math.floor(i/4)*sh,sw,sh,x-size/2,y-size*.7,size,size);}else village(c,x,y,size*.6,t===TOWNS[1]);}

function path(c,pts,fill,stroke){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}

function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}

function tree(c,x,y,s,shade=0){c.fillStyle='#0b191a66';c.beginPath();c.ellipse(x+s*.12,y+s*.33,s*.29,s*.1,0,0,7);c.fill();c.fillStyle='#4a3b2a';c.fillRect(x-s*.035,y,s*.07,s*.32);for(let i=0;i<3;i++)path(c,[[x,y-s*.48+i*s*.16],[x-s*(.21+i*.04),y+i*s*.17],[x+s*(.21+i*.04),y+i*s*.17]],shade?'#365f51':'#214c41','#173b34');path(c,[[x,y-s*.48],[x,y+s*.27],[x-s*.29,y+s*.34]],'#48745a55');}

function village(c,x,y,s,castle=false){c.fillStyle='#071e1b66';c.beginPath();c.ellipse(x,y+s*.2,s*.8,s*.24,0,0,7);c.fill();for(const [dx,dy,k] of [[-.38,.05,.6],[.3,.1,.7],[0,-.2,.9]]){const a=x+dx*s,b=y+dy*s,w=s*.42*k;c.fillStyle=castle?'#b1ab8f':'#c1b28c';c.fillRect(a-w/2,b-w/2,w,w*.8);path(c,[[a-w*.65,b-w*.5],[a,b-w],[a+w*.65,b-w*.5]],castle?'#6a7770':'#83533e');c.fillStyle='#eac776';c.fillRect(a-w*.12,b-w*.2,w*.18,w*.25);}if(castle){c.fillStyle='#bab69b';c.fillRect(x-s*.08,y-s*.9,s*.16,s*.8);path(c,[[x-s*.15,y-s*.9],[x,y-s*1.2],[x+s*.15,y-s*.9]],'#52685d');}}

function label(c,text,x,y,size=12,color='#f0e3bd'){c.save();const projection=c.getTransform(),aspect=Math.abs(projection.a/projection.d)||1;c.translate(x,y);c.scale(1/aspect,1);x=0;y=0;const mapLabel=renderedHero?.mode==='world'&&size>=9;c.font=`${mapLabel?'bold ':''}${mapLabel?Math.max(16,size):size}px Georgia`;c.textAlign='center';if(mapLabel){const anchor=c.getTransform();if(anchor.e<0||anchor.e>c.canvas.width||anchor.f<0||anchor.f>c.canvas.height){c.restore();return;}const half=c.measureText(text).width/2,margin=10;const transform=c.getTransform(),left=(margin-transform.e)/transform.a,right=(c.canvas.width-margin-transform.e)/transform.a;x=Math.max(left+half,Math.min(right-half,x));c.lineJoin='round';c.strokeStyle='#102319';c.lineWidth=3.5;c.strokeText(text,x,y);}c.fillStyle=mapLabel?'#fff4cc':color;c.fillText(text,x,y);c.restore();}

export function worldViewport(s){
 const {width,height}=worldSize(s);
 const [cols,rows]=width===WORLD_WIDTH?[32,24]:[20,15];
 return {cols,rows,left:clamp(s.x-Math.floor(cols/2),0,width-cols),top:clamp(s.y-Math.floor(rows/2),0,height-rows)};
}

function worldGround(map,view){
 const {cols,rows,left,top}=view,key=`${map.id}:${left}:${top}`;
 if(viewportGround?.key===key)return viewportGround.canvas;
 const canvas=viewportGround?.canvas??document.createElement('canvas'),unit=32;
 canvas.width=cols*unit;
 canvas.height=rows*unit;
 const c=canvas.getContext('2d'),right=left+cols,bottom=top+rows;
 c.translate(-left*unit,-top*unit);
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)groundTile(c,map,x,y,x*unit,y*unit,unit);
 if(!map.area)drawTrails(c,map.region,unit,view);
 if(richTerrain.complete&&richTerrain.naturalWidth){
  const cell=richTerrain.width/4;
  for(let y=Math.max(1,top-1);y<Math.min(map.height-1,bottom+2);y++){
   for(let x=Math.max(1,left-1);x<Math.min(map.width-1,right+1);x++){
    const tile=map.tileAt(x,y);
    if(tile!=='forest'&&tile!=='mountain')continue;
    const mountain=tile==='mountain';
    const width=unit*(mountain?1.65:1.35),height=unit*(mountain?1.85:1.45),jitter=((x*17+y*31)%7-3)*.7;
    c.shadowColor='#14271855';c.shadowBlur=mountain?4:3;c.shadowOffsetY=3;
    c.drawImage(richTerrain,map.region*cell,mountain?cell:0,cell,cell,(x+.5)*unit-width/2+jitter,(y+1)*unit-height,width,height);
   }
  }
 }
 viewportGround={key,canvas};
 return canvas;
}

function visibleWorldPoint({x,y},{cols,rows,left,top}){
 return x>=left-2&&x<left+cols+2&&y>=top-2&&y<top+rows+2;
}

function drawWorldViewport(c,w,h,s){
 const view=worldViewport(s),{cols,rows,left,top}=view,map=outdoorMap(s),size=h/rows;
 c.drawImage(worldGround(map,view),0,0,w,h);
 c.save();
 c.scale(w/(size*cols),1);
 c.translate(-left*size,-top*size);
 if(map.area)drawAreaSites(c,s,map.area,size,view);
 else drawLandSites(c,s,size,view);
 drawMinorSites(c,s,size,view);
 drawMetalTrees(c,s,size,view);
 const x=(s.x+.5)*size,y=(s.y+.5)*size,inWater=map.tileAt(s.x,s.y)==='water';
 if(inWater&&(s.flags.rowboatReady||s.flags.sailboatReady))drawRowboat(c,x,y,size);
 drawAdventurer(c,x,y,size*(inWater?1.25:1.9));
 c.restore();
 if(!map.area){
  label(c,'N',w-33,35,15,'#d1b57c');c.strokeStyle='#d1b57c';c.beginPath();c.moveTo(w-33,42);c.lineTo(w-33,66);c.stroke();path(c,[[w-33,39],[w-38,49],[w-28,49]],'#d1b57c');
 }
}
export function render(canvas,s,time=0,fx=null,reduced=false){renderedHero=s;const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);const w=Math.max(1,rect.width),h=Math.max(1,rect.height);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);

 if(s.dungeon&&(s.mode==='dungeon'||s.mode==='battle'&&s.returnMode==='dungeon'))canvas.dataset.wallTheme=caveProfile(s.dungeon.expedition)?.name||DUNGEON_WALLS[s.dungeon.index].name;else delete canvas.dataset.wallTheme;

 const contact=s.mode==='battle'&&s.returnMode==='dungeon',wildContact=s.mode==='battle'&&s.returnMode!=='dungeon'&&s.enemy?.firstContact;
 const castle=s.castle&&castleLayout(s.location),arena=s.arena&&(s.mode==='town'||s.enemy?.arenaFighter);

 canvas.dataset.view=arena?(s.mode==='battle'?'arena-battle':'arena-floor'):wildContact?(castle?'castle-contact':'wilderness-contact'):contact?(s.enemy?.firstContact?'dungeon-contact':'dungeon-battle'):s.mode==='battle'?'battle-map':s.mode==='dungeon'?'dungeon-3d':castle?'castle-map':s.mode==='town'?'town-map':'world-map';

 if(arena){drawArenaRing(c,w,h);if(s.mode==='battle')dungeonMonster(c,w,h,s,time,fx,reduced);}
 else if(wildContact){if(castle)drawCastle(c,w,h,s,castle,time,fx,reduced);else drawWorldViewport(c,w,h,s);wildernessMonster(c,w,h,s);}
 else if(contact){if(!drawIllustratedBossEntrance(c,w,h,s)){dungeon(c,w,h,s,reduced?0:time);dungeonMonster(c,w,h,s,time,fx,reduced);}}
 else if(s.mode==='battle')battle(c,w,h,s,time,fx,reduced);
 else if(s.mode==='dungeon')dungeon(c,w,h,s,reduced?0:time);
 else if(castle)drawCastle(c,w,h,s,castle,time,fx,reduced);
 else if(s.mode==='town')town(c,w,h,s,reduced?0:time);
 else drawWorldViewport(c,w,h,s);

 const v=c.createRadialGradient(w/2,h/2,h*.18,w/2,h/2,Math.max(w,h)*.65);v.addColorStop(0,'#00110b00');v.addColorStop(1,s.mode==='world'||s.mode==='battle'&&s.returnMode==='world'||castle||arena?'#030e0c20':'#030e0ccc');c.fillStyle=v;c.fillRect(0,0,w,h);

}

function drawMinorSites(c,s,size,view){
 const [stone,edge,moss]=[
  ['#77775b','#a39b75','#5b653b'],['#7d6856','#b19876','#766647'],
  ['#63807a','#9cae93','#59786c'],['#717b81','#b4bcc2','#667577'],
 ][s.region];
 for(const site of minorSiteList(s)){
  if(!visibleWorldPoint(site,view))continue;
  c.save();
  c.translate((site.x+.5)*size,(site.y+.5)*size);
  c.scale(size,size);
  c.lineWidth=.04;
  c.lineJoin='round';
  c.fillStyle='#171d1770';
  c.beginPath();c.ellipse(0,.29,.57,.18,0,0,Math.PI*2);c.fill();
  switch(site.minorKind??site.kind){
   case 'tunnel':
   case 'koboldCave':
    path(c,[[-.52,.29],[-.42,.03],[-.21,-.18],[.16,-.24],[.39,-.06],[.51,.27]],stone);
    path(c,[[-.4,.04],[-.21,-.18],[.16,-.24],[.39,-.06],[.22,-.1],[-.16,-.09]],edge);
    c.fillStyle='#141a17';
    c.beginPath();c.moveTo(-.31,.28);c.quadraticCurveTo(-.23,-.02,-.05,-.07);c.quadraticCurveTo(.19,-.1,.29,.28);c.closePath();c.fill();
    path(c,[[-.51,.29],[-.34,.14],[-.32,.28]],moss);
    break;
   case 'ruinedShrine':
    path(c,[[-.54,.27],[-.42,.11],[.39,.1],[.51,.25],[.34,.37],[-.48,.36]],stone);
    path(c,[[-.45,.23],[-.34,.11],[.31,.1],[.42,.21]],edge);
    path(c,[[-.4,.17],[-.38,-.3],[-.23,-.31],[-.21,.18]],stone,edge);
    path(c,[[-.41,-.28],[-.4,-.39],[-.18,-.39],[-.18,-.29]],edge);
    path(c,[[.13,.2],[.16,-.07],[.34,-.11],[.34,.2]],stone,edge);
    path(c,[[.11,.31],[.22,.23],[.48,.24],[.41,.32]],moss);
    break;
   case 'cemetery':
    path(c,[[-.5,.28],[-.27,.06],[.35,.06],[.5,.25],[.29,.4],[-.37,.4]],moss);
    for(const [x,y,tilt] of [[-.32,.18,-.15],[.04,.09,.1],[.33,.29,-.2]]){
     c.save();c.translate(x,y);c.rotate(tilt);
     c.fillStyle=stone;c.beginPath();c.moveTo(-.12,.02);c.lineTo(-.12,-.17);c.arc(0,-.17,.12,Math.PI,0);c.lineTo(.12,.02);c.closePath();c.fill();
     c.strokeStyle=edge;c.beginPath();c.moveTo(-.04,-.15);c.lineTo(.04,-.15);c.moveTo(0,-.2);c.lineTo(0,-.08);c.stroke();
     c.restore();
    }
    break;
  }
  c.restore();
 }
}

function drawLandSites(c,s,size,view){
 const visible=point=>point.region===s.region&&visibleWorldPoint(point,view);
 for(const t of TOWNS.filter(visible)){c.save();if(s.cities?.[t.id]?.destroyed)c.filter='grayscale(1) brightness(.4)';settlementIcon(c,t,(t.x+.5)*size,(t.y+.5)*size,size*2);c.restore();label(c,(s.cities?.[t.id]?.destroyed?'Ruins of ':'')+t.name,(t.x+.5)*size,(t.y+1.6)*size,Math.max(10,size*.42));}
 for(const d of DUNGEONS.filter(visible)){const x=(d.x+.5)*size,y=(d.y+.5)*size;drawDungeonIcon(c,{...d,index:DUNGEONS.indexOf(d)},x,y,size,s.relics.includes(d.id));label(c,d.name,x,y+size*1.1,Math.max(10,size*.4));}
 for(const site of [...WILD_SITES,...branchGates(s.region),teleporterSite(s.region)].filter(visible))drawWildSite(c,site,(site.x+.5)*size,(site.y+.5)*size,size);
}

const CASTLE_STONE=['#666359','#856b53','#586e66','#697281'];
const CASTLE_FLOORS={
 audience:['#733b49','#8f4a58'],vestibule:['#62596a','#786d81'],treasury:['#7e613c','#9a794c'],
 archive:['#416465','#4c7776'],guardroom:['#68483e','#7e5747'],armory:['#424c64','#525f7a'],
 'royal-fun':['#74464b','#87535b'],chastity:['#4c665a','#587568'],council:['#575061','#675c70'],
 kitchen:['#6e5844','#82694e'],pantry:['#6b633e','#80754c'],banquet:['#78493e','#90574c'],
 chapel:['#685564','#7e667a'],library:['#4c526e','#59617d'],guest:['#485e72','#556f84'],
 servants:['#5b6148','#6d7359'],linen:['#6a6663','#827b72'],wine:['#594458','#6b526c'],bathroom:['#4e6972','#5b7a82'],
 hall:['#847665','#938573'],door:['#6b5446','#806351'],exit:['#6b5446','#806351'],stair:['#4c6068','#586c76']
};
const castleRoyals=new Image();castleRoyals.src='/assets/royal-portraits.webp';
const governorPortraits=new Image();governorPortraits.src='/assets/regional-rulers.webp';
const guardPortraits=new Image();guardPortraits.src='/assets/palace-guards.webp';
const castleFurnitureArt=new Image();castleFurnitureArt.src='/assets/castle-furniture.webp';
const castleBookCovers=new Image();castleBookCovers.src='/assets/castle-library-covers.webp';
const castleHeadArt=new Image();castleHeadArt.src='/assets/talking-trophies.webp';
const castleChestArt=new Image();castleChestArt.src='/assets/palace-chests.webp';
const castleBathArt=new Image();castleBathArt.src='/assets/healing-bathtub.webp';
const governorPortraitTowns=TOWNS.filter(town=>town.id!=='bellwether').map(town=>town.id);

export function castleGovernorPortrait(location){
 const index=governorPortraitTowns.indexOf(location);
 return index<0?null:{column:index%4,row:Math.floor(index/4)};
}
export function castleGuardPortrait(location,region){
 const index=location==='bellwether'?0:Math.min(3,region+1);
 return {column:index%2,row:Math.floor(index/2)};
}

const CASTLE_VIEW_RADIUS=5;
const CASTLE_VIEW_SIZE=CASTLE_VIEW_RADIUS*2+1;
let castleFloorCache=null;

export function castleViewport(s){
 const {x,y}=s.castle;
 return {cols:CASTLE_VIEW_SIZE,rows:CASTLE_VIEW_SIZE,left:x-CASTLE_VIEW_RADIUS,top:y-CASTLE_VIEW_RADIUS};
}

export function castlePointVisible(s,point){
 return Math.hypot(point.x-s.castle.x,point.y-s.castle.y)<=CASTLE_VIEW_RADIUS;
}

function drawCastleTile(c,layout,region,gx,gy,x,y,size){
 const tile=layout.tiles[gy]?.[gx];
 if(!tile||tile==='wall'){
  c.fillStyle='#1b2222';c.fillRect(x,y,size+.5,size+.5);
  if(!tile)return;
  const edges=DIRS.filter(([dx,dy])=>layout.tiles[gy+dy]?.[gx+dx]&&layout.tiles[gy+dy][gx+dx]!=='wall');
  for(const [dx,dy] of edges){
   const a=x+(dx>0?.58:0)*size,b=y+(dy>0?.58:0)*size;
   c.fillStyle=CASTLE_STONE[region];c.fillRect(a,b,size*(dx?.42:1),size*(dy?.42:1));
   c.fillStyle='#d9c6a166';
   if(dx)c.fillRect(a+size*.08,b+size*.04,size*.045,size*.92);
   else c.fillRect(a+size*.04,b+size*.07,size*.92,size*.045);
   c.fillStyle='#0005';
   for(let i=1;i<4;i++)if(dx)c.fillRect(a,b+i*size*.25,size*.42,size*.025);else c.fillRect(a+i*size*.25,b,size*.025,size*.42);
  }
  return;
 }
 const colors=CASTLE_FLOORS[layout.bathtub?.room===tile?'bathroom':tile]??CASTLE_FLOORS.hall;
 c.fillStyle='#2b2628';c.fillRect(x,y,size+.5,size+.5);
 for(let row=0;row<2;row++)for(let col=0;col<2;col++){
  const xx=x+size*(col*.5+.018),yy=y+size*(row*.5+.018);
  c.fillStyle=colors[(gx+gy+row+col)%2];c.fillRect(xx,yy,size*.476,size*.476);
  c.fillStyle='#eedeb31c';c.fillRect(xx,yy,size*.476,Math.max(1,size*.023));
 }
 if(tile==='door'||tile==='exit'){
  c.strokeStyle=tile==='exit'?'#f3d58b':'#c8985f';c.lineWidth=Math.max(1,size*.05);
  c.strokeRect(x+size*.1,y+size*.1,size*.8,size*.8);
 }else if(tile==='stair'){
  c.fillStyle='#263b48';c.fillRect(x+size*.19,y+size*.16,size*.62,size*.64);
  c.strokeStyle='#a4cce1';c.lineWidth=size*.035;
  c.strokeRect(x+size*.19,y+size*.16,size*.62,size*.64);
  for(let i=1;i<5;i++){
   c.fillStyle='#8db6c8';c.fillRect(x+size*.25,y+size*(.18+i*.12),size*.50,size*.036);
  }
 }
}

function drawCastleDecor(c,room,furnished){
 const {id,x,y,width,height}=room;
 c.strokeStyle='#d7ac6e99';c.lineWidth=.045;c.strokeRect(x+.18,y+.18,width-.36,height-.36);
 if(id==='audience'){
  const center=x+width/2;
  c.fillStyle='#491d2c';c.fillRect(center-.6,y+.62,1.2,height-1);
  c.strokeStyle='#c68d59';c.strokeRect(center-.56,y+.68,1.12,height-1.12);
  if(!furnished){
   c.fillStyle='#d1ad70';c.fillRect(center-.7,y+.7,1.4,.88);c.fillStyle='#783343';c.fillRect(center-.48,y+.76,.96,.63);
   c.fillStyle='#f2d298';c.fillRect(center-.36,y+.63,.72,.22);
  }
  for(const dx of [-1,1]){circle(c,center+dx*1.65,y+.8,.19,'#41352d');circle(c,center+dx*1.65,y+.8,.08,'#f6cc7c');}
 }else if(!furnished&&['royal-fun','chastity','guest','servants'].includes(id)){
  const bx=x+.56,by=y+.54,linen=id==='royal-fun'?'#783d52':'#819a8d';
  c.fillStyle='#4a3131';c.fillRect(bx,by,1.8,2.2);
  c.fillStyle='#d3ac79';c.fillRect(bx+.09,by+.10,1.62,.30);
  c.fillStyle='#ded4b7';c.fillRect(bx+.19,by+.43,1.42,.44);
  c.fillStyle=linen;c.fillRect(bx+.19,by+.88,1.42,1.17);
  c.strokeStyle='#d4ad77';c.strokeRect(bx+.19,by+.88,1.42,1.17);
  c.fillStyle='#4a3131';c.fillRect(x+width-1.24,y+.55,.72,1.30);
  c.strokeStyle='#ac8f65';c.strokeRect(x+width-1.17,y+.62,.58,1.16);
 }else if(!furnished&&(id==='council'||id==='banquet')){
  const cx=x+width/2,cy=y+height/2;
  for(const dx of [-.91,.91])for(const dy of [-.72,0,.72]){
   c.fillStyle='#754e43';c.fillRect(cx+dx-.18,cy+dy-.18,.36,.36);
   c.strokeStyle='#c6a277';c.strokeRect(cx+dx-.18,cy+dy-.18,.36,.36);
  }
  c.fillStyle='#513932';c.beginPath();c.ellipse(cx,cy,.76,1.33,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#c8a273';c.stroke();
  c.fillStyle='#d1bc91';c.fillRect(cx-.21,cy-.35,.42,.70);
 }else if(['archive','library','pantry','linen','wine'].includes(id)){
  for(const dx of [.38,width-1.2]){
   c.fillStyle='#442d23';c.fillRect(x+dx,y+.48,.82,.37);
   for(let i=0;i<5;i++){c.fillStyle=['#b47857','#c8a45e','#698982'][i%3];c.fillRect(x+dx+.07+i*.14,y+.51,.1,.28);}
  }
 }else if(id==='guardroom'||id==='armory'){
  for(const dx of [.7,width-.7]){
   path(c,[[x+dx-.2,y+.51],[x+dx+.2,y+.51],[x+dx+.16,y+.85],[x+dx,y+.99],[x+dx-.16,y+.85]],'#647a81','#c1b897');
   c.fillStyle='#b2a488';c.fillRect(x+dx-.027,y+.55,.054,.3);
  }
 }else if(id==='treasury'){
  for(const dx of [.67,width-.67]){
   circle(c,x+dx,y+.66,.18,'#4e392a');circle(c,x+dx,y+.62,.13,'#b39452');circle(c,x+dx,y+.62,.07,'#e1bf71');
  }
 }
}

function drawCastleFigure(c,figure,size,location,region){
 const {kind,x,y}=figure,aspect=Math.abs(c.getTransform().a/c.getTransform().d)||1;
 const unit=size*Math.min(1,aspect);
 c.save();c.translate((x+.5)*size,(y+.5)*size);c.scale(unit/aspect,unit);
 c.lineWidth=.035;
 if(kind==='guard'){
  if(guardPortraits.complete&&guardPortraits.naturalWidth){
   const {column,row}=castleGuardPortrait(location,region),sw=guardPortraits.width/2,sh=guardPortraits.height/2;
   circle(c,0,0,.34,'#ead197');
   c.save();c.beginPath();c.arc(0,0,.307,0,Math.PI*2);c.clip();
   c.drawImage(guardPortraits,column*sw+sw*.12,row*sh+sh*.04,sw*.76,sh*.76,-.32,-.32,.64,.64);
   c.restore();
  }else{
   path(c,[[-.24,-.22],[.24,-.22],[.20,.07],[0,.27],[-.20,.07]],'#392a33','#e8bc77');
   c.strokeStyle='#efd093';c.beginPath();c.moveTo(0,-.15);c.lineTo(0,.12);c.moveTo(-.11,-.04);c.lineTo(.11,-.04);c.stroke();
  }
 }else{
  const border=kind==='princess'?'#e9c68e':kind==='king'?'#f3d177':'#b5d2db';
  circle(c,0,-.03,.36,border);circle(c,0,-.03,.32,'#3c3435');
  if(kind!=='governor'&&castleRoyals.complete&&castleRoyals.naturalWidth){
   const image=castleRoyals,split=Math.round(image.width*.54);
   const sourceX=kind==='king'?0:split,sourceW=kind==='king'?split:image.width-split;
   c.save();c.beginPath();c.arc(0,-.03,.32,0,Math.PI*2);c.clip();
   c.drawImage(image,sourceX,0,sourceW,image.height,-.43,-.40,.86,.80);c.restore();
  }else if(kind==='governor'&&governorPortraits.complete&&governorPortraits.naturalWidth&&castleGovernorPortrait(location)){
   const {column,row}=castleGovernorPortrait(location),image=governorPortraits,sw=image.width/4,sh=image.height/3;
   const crop=Math.min(sw,sh)*.84;
   c.save();c.beginPath();c.arc(0,-.03,.32,0,Math.PI*2);c.clip();
   c.drawImage(image,column*sw+(sw-crop)/2,row*sh+(sh-crop)*.28,crop,crop,-.33,-.36,.66,.66);c.restore();
  }else if(kind==='governor'){
   const female=figure.gender==='female',hair=female?'#776050':'#554842';
   c.save();c.beginPath();c.arc(0,-.03,.32,0,Math.PI*2);c.clip();
   c.fillStyle='#263f50';c.fillRect(-.34,-.36,.68,.68);
   if(female)circle(c,0,-.05,.205,hair);
   path(c,[[-.30,.29],[-.25,.14],[0,.04],[.25,.14],[.30,.29]],'#7ea5b9',null);
   circle(c,0,-.075,.145,'#c89469');
   c.fillStyle=hair;c.beginPath();c.ellipse(0,-.166,.145,.073,0,0,Math.PI*2);c.fill();
   if(!female)path(c,[[-.103,-.005],[0,.045],[.103,-.005],[.054,.074],[0,.102],[-.054,.074]],hair,null);
   else for(const dx of [-.14,.14])circle(c,dx,.01,.023,'#ecc674');
   for(const dx of [-.052,.052])circle(c,dx,-.083,.017,'#372923');
   circle(c,0,.19,.041,'#e6bf77');
   c.restore();
  }else{
   path(c,[[-.20,.10],[-.23,-.15],[-.08,-.06],[0,-.21],[.08,-.06],[.23,-.15],[.20,.10]],border,null);
  }
 }
 c.restore();
 if(kind!=='guard'){
  const name=kind==='king'?'King':kind==='princess'?'Princess':figure.name;
  label(c,name,(x+.5)*size,(y+.5)*size-unit*.48,Math.max(9,unit*.19),'#fff1bd');
 }
}

function castleFloor(layout,region){
 const {width,height,rooms}=layout;
 const furnished=castleFurnitureArt.complete&&castleFurnitureArt.naturalWidth>0;
 if(castleFloorCache?.layout!==layout||castleFloorCache.furnished!==furnished){
  const base=document.createElement('canvas'),unit=48;
  base.width=width*unit;base.height=height*unit;
  const bg=base.getContext('2d');
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)drawCastleTile(bg,layout,region,x,y,x*unit,y*unit,unit);
  bg.scale(unit,unit);
  for(const room of rooms)drawCastleDecor(bg,room,furnished);
  if(furnished){
   const sw=castleFurnitureArt.width/2,sh=castleFurnitureArt.height/2;
   for(const {artIndex,x,y} of castleFurnishings(layout)){
    bg.drawImage(castleFurnitureArt,artIndex%2*sw,Math.floor(artIndex/2)*sh,sw,sh,x-.04,y-.04,1.08,1.08);
   }
  }
  castleFloorCache={layout,base,furnished};
 }
 return castleFloorCache.base;
}

export function castleChestPortrait(chest,opened=false){
 // The lower sprites start above the midpoint of the 1254 × 1254 atlas.
 return {column:chest.treasurySlot===undefined?0:1,row:opened?1:0,y:opened?555:0,width:627,height:opened?699:555};
}

function drawCastleChest(c,chest,opened,size){
 const x=(chest.x+.5)*size,y=(chest.y+.5)*size;
 if(castleChestArt.complete&&castleChestArt.naturalWidth){
  const crop=castleChestPortrait(chest,opened),longSide=Math.max(crop.width,crop.height);
  const aspect=Math.abs(c.getTransform().a/c.getTransform().d)||1,unit=size*Math.min(1,aspect)*.94;
  const width=crop.width/longSide,height=crop.height/longSide;
  c.save();c.translate(x,y);c.scale(unit/aspect,unit);
  c.drawImage(castleChestArt,crop.column*crop.width,crop.y,crop.width,crop.height,-width/2,-height/2,width,height);c.restore();
  return;
 }
 c.fillStyle='#201b20aa';c.fillRect(x-size*.36,y-size*.1,size*.76,size*.41);
 c.fillStyle=opened?'#482f26':'#976138';c.fillRect(x-size*.38,y-size*.21,size*.76,size*.45);
 c.strokeStyle=opened?'#9a805b':'#e6bc70';c.lineWidth=size*.05;c.strokeRect(x-size*.38,y-size*.21,size*.76,size*.45);
 c.fillStyle=opened?'#302521':'#efcc86';c.fillRect(x-size*.065,y-size*.06,size*.13,size*.15);
}

function drawCastleBook(c,book,read,size){
 const x=(book.x+.5)*size,y=(book.y+.5)*size;
 const aspect=Math.abs(c.getTransform().a/c.getTransform().d)||1,unit=size*Math.min(1,aspect);
 c.save();c.translate(x,y);c.scale(unit/aspect,unit);
 const edge=book.rarity==='rare'?'#ffd17a':book.category==='recipe'?'#d8a37e':'#b9d1ad';
 if(castleBookCovers.complete&&castleBookCovers.naturalWidth&&Number.isInteger(book.coverIndex)){
  const sw=castleBookCovers.width/4,sh=castleBookCovers.height/4;
  c.globalAlpha=read?.72:1;
  c.drawImage(castleBookCovers,book.coverIndex%4*sw,Math.floor(book.coverIndex/4)*sh,sw,sh,-.29,-.29,.58,.58);
  c.strokeStyle=edge;c.lineWidth=.025;c.strokeRect(-.29,-.29,.58,.58);
  c.restore();return;
 }
 c.lineWidth=.024;c.strokeStyle='#42312b';
 path(c,[[-.29,-.18],[-.08,-.18],[0,-.11],[.08,-.18],[.29,-.18],[.29,.15],[.07,.15],[0,.22],[-.07,.15],[-.29,.15]],read?'#b6ac8e':book.rarity==='rare'?'#ffd17a':'#f1dda8','#4d4236');
 c.strokeStyle=read?'#655c49':'#967c5d';
 for(const side of [-1,1])for(const height of [-.09,.01,.10]){
  c.beginPath();c.moveTo(side*.08,height+.025);c.lineTo(side*.24,height);c.stroke();
 }
 c.restore();
}

function drawCastleHead(c,head,size,overview=false){
 const x=(head.x+.5+(head.mountDx||0)*.28)*size,y=(head.y+.5+(head.mountDy||0)*.28)*size,aspect=Math.abs(c.getTransform().a/c.getTransform().d)||1;
 const unit=size*Math.min(1,aspect)*(overview?.71:.66);
 c.save();c.translate(x,y);c.scale(unit/aspect,unit);
 if(castleHeadArt.complete&&castleHeadArt.naturalWidth){
  const sw=castleHeadArt.width/2,sh=castleHeadArt.height/2;
  c.drawImage(castleHeadArt,head.artIndex%2*sw,Math.floor(head.artIndex/2)*sh,sw,sh,-.5,-.52,1,1);
 }else{
  path(c,[[-.26,-.23],[.26,-.23],[.22,.12],[0,.31],[-.22,.12]],'#805236','#dca465');
  circle(c,0,0,.12,'#bd8450');
 }
 c.restore();
}

function drawCastleBath(c,bath,size,overview=false){
 const x=(bath.x+.5)*size,y=(bath.y+.5)*size,aspect=Math.abs(c.getTransform().a/c.getTransform().d)||1;
 const unit=size*Math.min(1,aspect)*(overview?.95:1.3);
 c.save();c.translate(x,y);c.scale(unit/aspect,unit);
 if(castleBathArt.complete&&castleBathArt.naturalWidth){
  const height=castleBathArt.height/castleBathArt.width;
  c.drawImage(castleBathArt,-.5,-height/2,1,height);
 }else{
  c.fillStyle='#c6995d';c.beginPath();c.ellipse(0,0,.43,.29,0,0,Math.PI*2);c.fill();
  c.fillStyle='#48839c';c.beginPath();c.ellipse(0,-.04,.34,.19,0,0,Math.PI*2);c.fill();
 }
 c.restore();
}

export function renderCastleOverview(canvas,s){
 const layout=castleLayout(s.location),size=36;
 canvas.width=layout.width*size;
 canvas.height=layout.height*size;
 const c=canvas.getContext('2d');
 c.drawImage(castleFloor(layout,s.region),0,0,canvas.width,canvas.height);
 const fontSize=Math.max(15,Math.min(23,Math.round(layout.width*.42)));
 c.font='bold '+fontSize+'px Georgia';c.textAlign='center';c.textBaseline='middle';
 c.lineWidth=3;c.strokeStyle='#221e24';c.fillStyle='#fff2cd';
 for(const room of layout.rooms){
  const x=(room.x+room.width/2)*size,y=(room.y+room.height-.42)*size;
  const maxWidth=(room.width-.35)*size,lines=[];
  for(const word of room.name.split(' ')){
   const last=lines.at(-1);
   if(last&&c.measureText(last+' '+word).width<=maxWidth)lines[lines.length-1]+=' '+word;
   else lines.push(word);
  }
  lines.forEach((line,i)=>{
   const baseline=y-(lines.length-1-i)*fontSize;
   c.strokeText(line,x,baseline,maxWidth);c.fillText(line,x,baseline,maxWidth);
  });
 }
 for(const chest of layout.chests)drawCastleChest(c,chest,s.flags[chest.id],size);
 for(const book of layout.books??[])drawCastleBook(c,book,s.flags['castleBookRead:'+book.id],size);
 if(layout.talkingHead)drawCastleHead(c,layout.talkingHead,size,true);
 if(layout.bathtub)drawCastleBath(c,layout.bathtub,size,true);
 const {x,y}=s.castle;
 circle(c,(x+.5)*size,(y+.5)*size,size*.22,'#162d24');
 circle(c,(x+.5)*size,(y+.5)*size,size*.15,'#a6e0ad');
}

function drawCastle(c,w,h,s,layout,time,fx,reduced){
 const {width,height,rooms,chests}=layout,{left,top,cols,rows}=castleViewport(s),size=h/rows;
 const {x,y,alarm}=s.castle,px=(x+.5)*size,py=(y+.5)*size;
 c.fillStyle='#111819';c.fillRect(0,0,w,h);
 c.save();
 c.scale(w/(cols*size),1);
 c.translate(-left*size,-top*size);
 c.beginPath();c.arc(px,py,(CASTLE_VIEW_RADIUS+.5)*size,0,Math.PI*2);c.clip();
 c.drawImage(castleFloor(layout,s.region),0,0,width*size,height*size);
 for(const room of rooms){
  const labelCol=room.x+room.width/2,labelRow=room.id==='audience'?room.y-.15:room.y+room.height-.36;
  if(!castlePointVisible(s,{x:labelCol-.5,y:labelRow-.5}))continue;
  label(c,room.name,labelCol*size,labelRow*size,Math.max(12,size*.30),'#fff0c7');
 }
 for(const chest of chests)if(castlePointVisible(s,chest))drawCastleChest(c,chest,s.flags[chest.id],size);
 for(const book of layout.books??[])if(castlePointVisible(s,book))drawCastleBook(c,book,s.flags['castleBookRead:'+book.id],size);
 if(layout.talkingHead&&castlePointVisible(s,layout.talkingHead))drawCastleHead(c,layout.talkingHead,size);
 if(layout.bathtub&&castlePointVisible(s,layout.bathtub))drawCastleBath(c,layout.bathtub,size);
 const guards=castleGuards(s);
 const moving=fx&&['castleGuardApproach','castleGuardConsult','castleGuardReturned'].includes(fx.kind)?guards.find(guard=>guard.id===fx.guardId):null;
 for(const figure of [...guards,...castleFigures(s)])if(figure.id!==moving?.id&&castlePointVisible(s,figure))drawCastleFigure(c,figure,size,s.location,s.region);
 if(moving){
  const path=fx.path,step=reduced?path.length-1:clamp((time-fx.start)/fx.duration,0,1)*(path.length-1);
  const i=Math.floor(step),from=path[i],to=path[i+1]||from,fraction=step-i;
  const figure={...moving,x:from.x+(to.x-from.x)*fraction,y:from.y+(to.y-from.y)*fraction};
  if(castlePointVisible(s,figure))drawCastleFigure(c,figure,size,s.location,s.region);
 }
 if(alarm){c.strokeStyle='#f3a073';c.lineWidth=2;c.strokeRect(x*size+2,y*size+2,size-4,size-4);}
 drawAdventurer(c,px,py,size*1.34*Math.min(1,w/h));
 c.restore();
}

const casinoBuilding=new Image();casinoBuilding.src='/assets/gambling-house.webp';
const arenaBuilding=new Image();arenaBuilding.src='/assets/gladiator-arena.webp';
const arenaRing=new Image();arenaRing.src='/assets/gladiator-ring.webp';

const storyBuilding=new Image();storyBuilding.src='/assets/story-house.webp';

const buildings=new Image();buildings.src='/assets/buildings.webp';

function buildingArt(c,index,x,y,w,h){if(buildings.complete&&buildings.naturalWidth){const sw=buildings.width/4,sh=buildings.height/2;c.drawImage(buildings,index%4*sw,Math.floor(index/4)*sh,sw,sh,x,y,w,h);}else village(c,x+w/2,y+h/2,Math.min(w,h)*.5,index===3);}

const specialtyFacades={mount:'inn',enclave:'fortune',gizmo:'quests'};

function town(c,w,h,s,time){

 const size=h/TOWN_SIZE,ox=0,oy=0,b=BIOMES[s.region];

 c.fillStyle='#182b24';c.fillRect(0,0,w,h);c.save();c.translate(ox,oy);c.scale(w/h,1);

 const backdrop=townBackground(s.location),hasBackdrop=backdrop.complete&&backdrop.naturalWidth>0;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(hasBackdrop)c.drawImage(backdrop,0,0,size*13,size*13);else drawTownScenery(c,size,s.region,Math.max(0,TOWNS.findIndex(t=>t.id===s.location)));

 if(!hasBackdrop&&canopies.complete&&canopies.naturalWidth){const sw=canopies.width/2,sh=canopies.height/2;for(const [x,y] of [[1.2,1.3],[3.2,1.3],[8.5,1.3],[10.8,1.3],[1.2,4],[11.5,4],[1.2,7.2],[11.5,7.2],[1.2,10.3],[11.5,10.3]])c.drawImage(canopies,s.region%2*sw,Math.floor(s.region/2)*sh,sw,sh,(x-.35)*size,(y-.5)*size,.9*size,.9*size);}

 const postedSigns=[];
 for(const place of townPlaces(s)){

  if(place.id==='gate'){c.fillStyle='#9a937c';c.fillRect(6*size,12*size,size,size);if(!(s.location==='salt-choir'&&drawSaltChoirIcon(c,'gate',5.65*size,11.45*size,size*1.7,size*1.45)))buildingArt(c,7,5.8*size,11.6*size,size*1.4,size*1.2);label(c,'TOWN GATE · EXIT',6.5*size,12.95*size,Math.max(9,size*.2),'#ffe1a0');continue;}

  if(place.id==='court'&&s.location==='bellwether'&&settlements.complete&&settlements.naturalWidth){const sw=settlements.width/4,sh=settlements.height/3;c.save();c.shadowColor='#edcf76';c.shadowBlur=12;c.drawImage(settlements,sw,0,sw,sh,(place.bx-.6)*size,(place.by-1)*size,(place.bw+1.2)*size,(place.bh+1)*size);c.restore();}

  else if(place.id==='arena'&&arenaBuilding.complete&&arenaBuilding.naturalWidth){
   const width=place.bw*size, height=width*w/h*arenaBuilding.height/arenaBuilding.width;
   c.drawImage(arenaBuilding,(place.x+.5)*size-width/2,(place.by+place.bh)*size-height,width,height);
  }

  else if(regionalBuilding(c,s.region,specialtyFacades[place.merchant]||place.id,(place.artWidth?place.x+.5-place.artWidth/2:place.bx)*size,place.by*size,(place.artWidth||place.bw)*size,place.bh*size)){}

  else if(s.region===2&&drawOceanBuilding(c,place.id,place.bx*size,place.by*size,place.bw*size,place.bh*size)){} 

  else if(place.id!=='talk'&&s.location==='salt-choir'&&drawSaltChoirIcon(c,place.id,place.bx*size,place.by*size,place.bw*size,place.bh*size)){}

  else if(place.id==='talk'&&settlements.complete&&settlements.naturalWidth){

   const i=Math.max(0,TOWNS.findIndex(t=>t.id===s.location)),sw=settlements.width/4,sh=settlements.height/3;

   c.drawImage(settlements,i%4*sw,Math.floor(i/4)*sh,sw,sh,place.bx*size,place.by*size,place.bw*size,place.bh*size);

  }

  else if(place.id==='casino'&&casinoBuilding.complete&&casinoBuilding.naturalWidth)c.drawImage(casinoBuilding,(place.artWidth?place.x+.5-place.artWidth/2:place.bx)*size,place.by*size,(place.artWidth||place.bw)*size,place.bh*size);

  else if(place.id==='quests'&&storyBuilding.complete&&storyBuilding.naturalWidth)c.drawImage(storyBuilding,place.bx*size,place.by*size,place.bw*size,place.bh*size);

  else if(place.id==='fortune'&&fair.complete&&fair.naturalWidth){c.drawImage(fair,place.bx*size,place.by*size,place.bw*size,place.bh*size);}

  else if(place.art>=0){const bw=(place.bw||1)*size,bh=(place.bh||1)*size;buildingArt(c,place.art,place.bx*size,place.by*size,bw,bh);}

  else{c.save();c.filter='sepia(.7)';drawAdventurer(c,(place.x+.5)*size,(place.y-.25)*size,size*1.1);c.restore();}

  const xx=(place.x+.5)*size,yy=(place.y+.5)*size;c.strokeStyle='#f0cf87';c.lineWidth=2;c.beginPath();c.ellipse(xx,yy,size*.28,size*.13,0,0,Math.PI*2);c.stroke();

  const signName=place.id==='court'?(s.location==='bellwether'?'Royal Palace':'Governor\u2019s Palace'):place.id==='inn'&&s.cities?.[s.location]?'Your house · Giacomo':place.name;

  postedSigns.push([signName,xx,place.y*size-size*.08,size,s.region]);

 }

 for(const args of postedSigns)townSign(c,...args);
 const pos=townPosition(s);drawAdventurer(c,(pos.x+.5)*size,(pos.y+.5)*size,size*1.25);c.restore();

}

let corridorCache=null;const corridorViews=new Map();const inkPixels=new Map();function inkPixel(hex){if(!inkPixels.has(hex)){const n=parseInt(hex.slice(1,7),16);inkPixels.set(hex,(255<<24)|((n&255)<<16)|(n&65280)|(n>>>16));}return inkPixels.get(hex);}

function drawRoyalDungeonFigures(c,w,h,s){
 const d=s.dungeon,map=dungeonMap(d),[dx,dy]=DIRS[d.dir],visible=[];
 for(const npc of royalDungeonFigures(s)){
  const rx=npc.x-d.x,ry=npc.y-d.y,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx;
  const distance=Math.hypot(rx,ry);
  if(distance&&!(depth>0&&Math.abs(side/depth)<.66))continue;
  let blocked=false;
  for(let step=.16;step<distance;step+=.16){
   const x=Math.floor(d.x+.5+rx*step/distance),y=Math.floor(d.y+.5+ry*step/distance);
   if(map[y]?.[x]!==0){blocked=true;break;}
  }
  if(!blocked)visible.push({npc,depth:Math.max(1,depth),side});
 }
 visible.sort((a,b)=>b.depth-a.depth);
 for(const {npc,depth,side} of visible){
  const height=Math.min(h*.58,h*.83/depth),width=Math.min(w*.36,height*.84);
  const x=w*.5+side/depth*w*.72,y=h*.5+h*.27/depth-height;
  if(paintIllustratedBoss(c,{speciesId:npc.id},x-width/2,y,width,height)){
   label(c,npc.name,x,y+height+15,Math.max(11,Math.min(17,height*.095)),'#f4e1ac');
  }
 }
}

function dungeon(c,w,h,s,time){

 const key=JSON.stringify([w,h,s.dungeon,s.flags,s.relics,s.openedChests,wallMaterialRevision]);

 if(!corridorCache||corridorCache.key!==key){let image=corridorViews.get(key);if(!image){image=document.createElement('canvas');const ratio=Math.min(1,960/w,600/h);image.width=Math.ceil(w*ratio);image.height=Math.ceil(h*ratio);dungeonUncached(image.getContext('2d'),image.width,image.height,s,time);if(corridorViews.size>=20)corridorViews.delete(corridorViews.keys().next().value);corridorViews.set(key,image);}corridorCache={key,image};}

 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(corridorCache.image,0,0,w,h);c.restore();
 if(s.mode==='dungeon'&&s.dungeon.site===ROYAL_DUNGEON_ID)drawRoyalDungeonFigures(c,w,h,s);

}

function drawLadderOpenings(c,w,h,d,ladders,dx,dy,fov){
 const focal=w/(2*Math.tan(fov/2));
 for(const ladder of ladders){
  const offsetX=ladder.wallX-ladder.x,offsetY=ladder.wallY-ladder.y;
  const cx=ladder.x-d.x+offsetX*.21,cy=ladder.y-d.y+offsetY*.21;
  const plane=ladder.opening==='ceiling'?-1:1;
  const aperture=(radius)=>{
   const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy])=>{
    const x=cx+sx*radius,y=cy+sy*radius;
    return {depth:x*dx+y*dy,side:y*dx-x*dy};
   });
   const near=.08;
   const visible=corners.flatMap((point,index)=>{
    const previous=corners[(index+3)%4];
    const points=[];
    if((point.depth>=near)!==(previous.depth>=near)){
     const fraction=(near-previous.depth)/(point.depth-previous.depth);
     points.push({depth:near,side:previous.side+(point.side-previous.side)*fraction});
    }
    if(point.depth>=near)points.push(point);
    return points;
   });
   return visible.map(({side,depth})=>[w/2+focal*side/depth,h/2+plane*h*.425/depth]);
  };
  const rim=aperture(.29),hole=aperture(.235);
  if(rim.length<3||hole.length<3)continue;
  path(c,rim,plane<0?'#706f65':'#746451','#241e18');
  path(c,hole,'#040607','#161918');
 }
}

function dungeonUncached(c,w,h,s,time){const d=s.dungeon;if(!d)return;if(d.ship){drawShip(c,w,h,s);return;}if(d.site==='elf-village'){const [dx,dy]=DIRS[d.dir];drawForest(c,w,h,s,dungeonMap(d),dx,dy);return;}const m=dungeonMap(d),ladders=dungeonLadders(d,m),cave=caveProfile(d.expedition),wall=d.royal==='sewer'?SEWER_WALL:DUNGEON_WALLS[cave?.wall??(d.site==='firedrak'?3:d.index)];const ceiling=c.createLinearGradient(0,0,0,h);ceiling.addColorStop(0,wall.ceiling);ceiling.addColorStop(.5,'#151b1b');ceiling.addColorStop(.51,d.expedition?.startsWith('planet-1')?'#c6b68e':wall.floor);ceiling.addColorStop(1,'#111816');c.fillStyle=ceiling;c.fillRect(0,0,w,h);for(let i=0;i<190;i++){const xx=(i*137.53)%w,yy=h*.52+(i*71.71)%(h*.48);c.fillStyle=d.expedition?.startsWith('planet-1')?(i%2?'#e3d1a333':'#705e3b33'):'#938f7330';c.fillRect(xx,yy,2+(i%3),1);}drawDungeonCeiling(c,w,h,wall,{phase:d.floor});if(d.royal==='sewer')drawSewerChannel(c,w,h,time);const [dx,dy]=DIRS[d.dir];const angle=Math.atan2(dy,dx),fov=Math.PI/2.6,step=2;

 drawLadderOpenings(c,w,h,d,ladders,dx,dy,fov);
 const wallImage=c.getImageData(0,0,w,h),wallPixels=new Uint32Array(wallImage.data.buffer);
 for(let col=0;col<w;col+=step){const a=angle+Math.atan((col/w-.5)*2*Math.tan(fov/2));const vx=Math.cos(a),vy=Math.sin(a);let dist=.02,x=d.x+.5,y=d.y+.5;while(dist<18){x=d.x+.5+vx*dist;y=d.y+.5+vy*dist;if(m[Math.floor(y)]?.[Math.floor(x)]===1||m[Math.floor(y)]?.[Math.floor(x)]===undefined)break;dist+=.025;}if(dist<18){let low=Math.max(0,dist-.025),high=dist;for(let n=0;n<7;n++){const mid=(low+high)/2,mx=d.x+.5+vx*mid,my=d.y+.5+vy*mid;if(m[Math.floor(my)]?.[Math.floor(mx)]===1||m[Math.floor(my)]?.[Math.floor(mx)]===undefined)high=mid;else low=mid;}dist=high;x=d.x+.5+vx*dist;y=d.y+.5+vy*dist;}const corrected=dist*Math.cos(a-angle),height=Math.min(h*2,h*.85/corrected),top=(h-height)/2;const fracX=x-Math.floor(x),fracY=y-Math.floor(y),vertical=fracX<.04||fracX>.96,tex=vertical?fracY:fracX;const light=clamp(1-dist/11,.09,.95)*(vertical?.77:1);const detail=wallDetailKind(Math.floor(x),Math.floor(y),d.index);const barred=d.site===ROYAL_DUNGEON_ID&&!d.cellsOpen&&ROYAL_DUNGEON_CELLS.some(cell=>cell.door.x===Math.floor(x)&&cell.door.y===Math.floor(y));const mounted=ladders.find(l=>l.wallX===Math.floor(x)&&l.wallY===Math.floor(y)&&l.x===Math.floor(x-vx*.07)&&l.y===Math.floor(y-vy*.07));for(let yy=Math.max(0,top);yy<Math.min(h,top+height);yy+=2){const v=(yy-top)/height;const row=Math.floor(v*wall.rows);const mortar=(v*wall.rows)%1<.06||((tex*wall.columns+(row%2)*.5)%1)<.045;const grain=Math.sin(tex*190+v*140)*4;const wear=wall.wear===1&&(row+Math.floor(tex*9))%7===0?-9:wall.wear===2&&(tex*wall.columns)%1<.12?8:0;const base=mortar?28:78+grain+wear;let color=(255<<24)|(Math.max(0,Math.floor((base+wall.tint[2])*light))<<16)|(Math.max(0,Math.floor((base+wall.tint[1])*light))<<8)|Math.max(0,Math.floor((base+wall.tint[0])*light));if(!mounted){const material=wallMaterialPixel(cave?.wall??(d.expedition?.startsWith('planet-1')?4:d.site==='firedrak'?3:d.index),tex,v,light);if(material!==null)color=material;const ink=d.expedition?.startsWith('planet-')?alienWallInk(detail,tex,v):wallDetail(detail,tex,v,time,d.royal==='sewer'?8:d.index);if(ink)color=inkPixel(ink);if(cave){const r=Math.max(0,Math.min(255,(color&255)+cave.tint[0])),g=Math.max(0,Math.min(255,((color>>>8)&255)+cave.tint[1])),b=Math.max(0,Math.min(255,((color>>>16)&255)+cave.tint[2]));color=(255<<24)|(b<<16)|(g<<8)|r;}}if(mounted){const rail=(tex>.28&&tex<.34)||(tex>.66&&tex<.72),rung=tex>.28&&tex<.72&&(v*9)%1<.14;const arrowV=mounted.direction==='up'?.22:.78;const arrow=Math.abs(Math.abs(tex-.5)-Math.abs(v-arrowV)*1.4)<.025&&(mounted.direction==='up'?v>arrowV&&v<arrowV+.1:v<arrowV&&v>arrowV-.1);if(arrow)color=inkPixel(mounted.direction==='up'?'#a6e4ef':'#ffe1a0');else if((rail||rung)&&(mounted.direction==='up'?v<.88:v>.12))color=inkPixel(rail?'#a87b48':'#d2a56b');}if(barred){const beam=tex<.08||tex>.92||v<.07||v>.93||Math.abs(v-.48)<.025||(tex*9)%1<.19;color=inkPixel(beam?'#717675':'#141d20');}const y0=Math.max(0,Math.floor(yy)),y1=Math.min(h,y0+2),x1=Math.min(w,col+step);for(let py=y0;py<y1;py++){let offset=py*w+col;for(let px=col;px<x1;px++)wallPixels[offset++]=color;}}}
 c.putImageData(wallImage,0,0);

 const glow=c.createRadialGradient(w*.18,h*.68,5,w*.18,h*.68,w*.65);glow.addColorStop(0,d.royal==='sewer'?'#6ac9ad28':'#e5a84021');glow.addColorStop(1,'#d9a34400');c.fillStyle=glow;c.fillRect(0,0,w,h);

 const here=ladders.find(l=>l.x===d.x&&l.y===d.y);if(here)label(c,here.direction==='up'?'↑ CEILING LADDER':'↓ FLOOR LADDER',w/2,52,14,here.direction==='up'?'#a6e4ef':'#ffe1a0');

 if(d.index===4&&!d.royal&&!d.expedition)drawFishBones(c,w,h,d,m,dx,dy);

 drawDungeonChests(c,w,h,s,m,dx,dy);

 // A clear floor map makes touch navigation usable without a separate overlay.

 const markEndpoint=d.ladderLayout!==1||!ladders.some(ladder=>ladder.direction==='down');
 const z=Math.min(7,w/65),mx=w-15*z-18,my=18;c.fillStyle='#06100de6';c.fillRect(mx-7,my-7,15*z+14,15*z+14);for(let y=0;y<15;y++)for(let x=0;x<15;x++){c.fillStyle=m[y][x]===1?(d.royal==='sewer'?SEWER_WALL.map:'#354239'):markEndpoint&&m[y][x]===2?'#c8a35f':'#101c19';c.fillRect(mx+x*z,my+y*z,z-1,z-1);}for(const ladder of ladders){c.fillStyle=ladder.direction==='up'?'#9dd1db':'#d8ab73';c.fillRect(mx+ladder.x*z+1,my+ladder.y*z+1,z-2,z-2);}for(const chest of dungeonChests(s,m)){c.fillStyle=chest.opened?'#66523a':'#f1b84e';c.fillRect(mx+chest.x*z+1,my+chest.y*z+1,z-2,z-2);}if(d.site===ROYAL_DUNGEON_ID){for(const npc of royalDungeonFigures(s))circle(c,mx+(npc.x+.5)*z,my+(npc.y+.5)*z,z*.35,'#dba17f');if(!d.cellsOpen)for(const cell of ROYAL_DUNGEON_CELLS){c.fillStyle='#dba979';c.fillRect(mx+cell.door.x*z+1,my+cell.door.y*z+1,z-2,z-2);for(const prisoner of cell.prisoners)circle(c,mx+(prisoner.x+.5)*z,my+(prisoner.y+.5)*z,z*.31,'#9ed0d2');}}circle(c,mx+(d.x+.5)*z,my+(d.y+.5)*z,z*.4,'#f4db9c');c.strokeStyle='#f4db9c';c.beginPath();c.moveTo(mx+(d.x+.5)*z,my+(d.y+.5)*z);c.lineTo(mx+(d.x+.5+dx)*z,my+(d.y+.5+dy)*z);c.stroke();

 label(c,['NORTH','EAST','SOUTH','WEST'][d.dir],w/2,28,12,'#bfad85');

}

const monsterAtlases=Object.fromEntries(['monsters-planets','monsters-depth','monsters-grove','dungeon-monsters','monsters-hearth','monsters-cinder','monsters-tide','monsters-star','monsters-wild'].map(key=>{const img=new Image();img.src='/assets/'+key+'.webp';return [key,img];}));

const monsterBounds=new Map();

const haghilda=new Image();haghilda.src='/assets/haghilda.webp';

const levityBoss=new Image();levityBoss.src='/assets/leviathan-levity.webp';
const illustratedBossArt=Object.fromEntries([
 [BALROG_ID,'/assets/balrog-of-despair.webp'],[WANG_ID,'/assets/wang-the-sluglord.webp'],
 ...ROYAL_DUNGEON_NPCS.map(npc=>[npc.id,'/assets/'+npc.id+'.webp']),
].map(([id,src])=>{const image=new Image();image.src=src;return [id,image];}));

function drawIllustratedBossEntrance(c,w,h,s){
 const art=illustratedBossArt[s.enemy?.speciesId];
 if(!s.enemy?.firstContact||!art?.naturalWidth)return false;
 const scale=Math.max(w/art.width,h/art.height);
 const width=art.width*scale,height=art.height*scale;
 c.drawImage(art,(w-width)/2,(h-height)/2,width,height);
 return true;
}

function paintIllustratedBoss(c,enemy,x,y,w,h){
 const art=illustratedBossArt[enemy.speciesId];
 if(!art?.naturalWidth)return false;
 if(enemy.firstContact){
  const scale=Math.min(w/art.width,h/art.height),width=art.width*scale,height=art.height*scale;
  c.drawImage(art,x+(w-width)/2,y+(h-height)/2,width,height);
  return true;
 }
 c.save();c.beginPath();c.ellipse(x+w/2,y+h/2,w*.48,h*.49,0,0,Math.PI*2);c.clip();
 c.drawImage(art,art.width*.22,0,art.width*.58,art.height*.89,x,y,w,h);
 c.restore();
 return true;
}

const arenaPortraits=new Map();

function arenaPortraitImage(enemy){
 const url=enemy.portrait;
 if(!(enemy.arenaFighter||enemy.championTown)||typeof url!=='string'||!/^\/assets\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.webp$/.test(url))return null;
 if(!arenaPortraits.has(url)){
  const image=new Image();
  image.src=url;
  arenaPortraits.set(url,image);
 }
 return arenaPortraits.get(url);
}

function paintArenaPortrait(c,enemy,x,y,w,h){
 const art=arenaPortraitImage(enemy);
 if(!art?.naturalWidth)return false;
 const scale=Math.min(w/art.naturalWidth,h/art.naturalHeight);
 const width=art.naturalWidth*scale,height=art.naturalHeight*scale;
 c.drawImage(art,x+(w-width)/2,y+h-height,width,height);
 return true;
}

export function paintArenaOpponentPreview(canvas,opponent){
 if(!canvas||!opponent)return;
 const enemy={...opponent,arenaFighter:true};
 const context=canvas.getContext('2d');
 if(!context)return;
 const paint=()=>{
  if(!canvas.isConnected)return;
  context.clearRect(0,0,canvas.width,canvas.height);
  paintMonster(context,enemy,4,4,canvas.width-8,canvas.height-8);
 };
 for(const art of [arenaPortraitImage(enemy),monsterAtlases[opponent.art?.sheet]]){
  if(art&&!art.complete)art.addEventListener('load',paint,{once:true});
 }
 paint();
}

const ghostDragon=new Image();ghostDragon.src='/assets/ghost-dragon.webp';

const firedrakSprites=new Image();firedrakSprites.src='/assets/firedrak-monsters.webp';monsterAtlases['firedrak-monsters']=firedrakSprites;
export function paintMonster(c,enemy,x,y,w,h,dungeonIndex=0){if(paintArenaPortrait(c,enemy,x,y,w,h))return true;if(paintIllustratedBoss(c,enemy,x,y,w,h))return true;if(enemy.speciesId==='leviathan-levity'&&levityBoss.complete&&levityBoss.naturalWidth){c.drawImage(levityBoss,x,y,w,h);return true;}if(enemy.speciesId==='haghilda'&&haghilda.complete&&haghilda.naturalWidth){c.drawImage(haghilda,x,y,w,h);return true;}if(enemy.speciesId==='ghost-dragon'&&ghostDragon.complete&&ghostDragon.naturalWidth){c.drawImage(ghostDragon,x,y,w,h);return true;}const species=GROVE_ENEMIES.find(m=>m.id===enemy.speciesId)||MONSTER_BY_ID[enemy.speciesId]||ENEMIES.find(m=>m.name===enemy.name);const art=enemy.speciesId?.startsWith('firedrak-')||enemy.speciesId==='drake-defiler'?{sheet:'firedrak-monsters',index:enemy.speciesId==='firedrak-imp'?0:enemy.speciesId==='firedrak-elemental'?1:2}:((enemy.arenaFighter||enemy.championTown)?enemy.art||{sheet:'dungeon-monsters',index:11}:species?.art)||{sheet:'dungeon-monsters',index:enemy.guard?11:enemy.boss?[2,2,4,4,7,6,8,10][dungeonIndex]:9};const img=monsterAtlases[art.sheet];if(!img?.complete||!img.naturalWidth)return false;const cols=art.sheet==='firedrak-monsters'?3:['monsters-wild','monsters-grove'].includes(art.sheet)?2:4,rows=art.sheet==='firedrak-monsters'?1:['monsters-wild','monsters-grove'].includes(art.sheet)?1:art.sheet==='monsters-planets'?2:3,sw=img.width/cols,sh=img.height/rows,key=art.sheet+':'+art.index;

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

 label(c,s.enemy.groupSize?s.enemy.groupSize+' × '+s.enemy.name:s.enemy.name,w/2,top+34,Math.min(25,width/17),'#ffe0a2');

 const artHeight=Math.max(80,Math.min(height-165,380)),artWidth=Math.min(width*.75,artHeight*.95);

 const count=s.enemy.groupSize||1;
 const columns=count>3?4:count,rows=Math.ceil(count/columns);
 const unitWidth=artWidth/(count>3?columns:Math.sqrt(count)),unitHeight=artHeight/(count>3?rows:Math.sqrt(count));
 for(let i=0;i<count;i++){
  const row=Math.floor(i/columns),rowCount=Math.min(columns,count-row*columns);
  const x=w/2-unitWidth/2+(i%columns-(rowCount-1)/2)*unitWidth*.86;
  const y=top+48+(artHeight-rows*unitHeight)/2+row*unitHeight;
  paintMonster(c,s.enemy,x,y,unitWidth,unitHeight);
 }

 label(c,`Level ${s.enemy.level??'?'} · Health ${s.enemy.hp}/${s.enemy.maxHp}`,w/2,top+height-78,Math.min(17,width/23));

 label(c,`Armor ${s.enemy.armor??0} · Attack ${s.enemy.attack}`,w/2,top+height-54,Math.min(16,width/23));

 label(c,`Weakness: ${s.enemy.weakness||'unknown'}`,w/2,top+height-30,Math.min(16,width/26));

}

const monsterLayer=document.createElement('canvas');

function drawArenaRing(c,w,h){
 c.fillStyle='#4b3a26';c.fillRect(0,0,w,h);
 if(!arenaRing.complete||!arenaRing.naturalWidth)return;
 const scale=Math.max(w/arenaRing.width,h/arenaRing.height);
 const width=arenaRing.width*scale,height=arenaRing.height*scale;
 c.drawImage(arenaRing,(w-width)/2,(h-height)*.52,width,height);
}

function dungeonMonster(c,w,h,s,time,fx,reduced){

 const age=fx?time-fx.start:9999,hit=age>=0&&age<350&&fx.amount>0,enemyHit=hit&&fx.target==='enemy',heroHit=hit&&fx.target==='hero'&&fx.kind!=='heal';

 const pulse=hit?(reduced?.25:Math.sin(Math.PI*age/350)):0,fade=fx?.kind==='victory'?Math.max(0,1-age/900):1;

 if(fade===0)return;

 const height=Math.min(h*.67,w*.72),width=height*.85,x=w/2-width/2,feet=h*.82;

 c.save();c.globalAlpha=fade;const shadow=c.createRadialGradient(w/2,feet-3,2,w/2,feet-3,width*.55);shadow.addColorStop(0,'#000000b0');shadow.addColorStop(1,'#00000000');c.fillStyle=shadow;c.beginPath();c.ellipse(w/2,feet-3,width*.6,height*.07,0,0,Math.PI*2);c.fill();

 if(monsterLayer.width!==Math.ceil(width))monsterLayer.width=Math.ceil(width);if(monsterLayer.height!==Math.ceil(height))monsterLayer.height=Math.ceil(height);const mc=monsterLayer.getContext('2d');mc.clearRect(0,0,monsterLayer.width,monsterLayer.height);

 const painted=paintMonster(mc,s.enemy,0,0,width,height,s.dungeon?.index??0);

 if(painted){if(enemyHit){mc.globalCompositeOperation='source-atop';mc.fillStyle=`rgba(255,20,15,${pulse*.8})`;mc.fillRect(0,0,width,height);mc.globalCompositeOperation='source-over';}const count=s.enemy.memberHp?Math.max(1,Math.ceil(s.enemy.hp/s.enemy.memberHp)):1;for(let i=0;i<count;i++)c.drawImage(monsterLayer,x+(i-(count-1)/2)*width*.42,feet-height);}else{c.fillStyle='#111a17';c.beginPath();c.ellipse(w/2,feet-height*.45,width*.25,height*.4,0,0,Math.PI*2);c.fill();circle(c,w/2-width*.06,feet-height*.72,3,'#d5b07c');circle(c,w/2+width*.06,feet-height*.72,3,'#d5b07c');}

 label(c,s.enemy.name+(s.enemy.level?' · Lv '+s.enemy.level:''),w/2,Math.max(85,feet-height-18),Math.max(17,Math.min(25,w*.035)), '#ffe0a2');

 c.fillStyle='#492c28';c.fillRect(w/2-100,feet+12,200,6);c.fillStyle='#cb7860';c.fillRect(w/2-100,feet+12,200*Math.max(0,s.enemy.hp)/s.enemy.maxHp,6);c.restore();

 if(heroHit){const red=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.15,w/2,h/2,Math.max(w,h)*.6);red.addColorStop(0,'#ff000000');red.addColorStop(1,`rgba(220,10,5,${pulse*.8})`);c.fillStyle=red;c.fillRect(0,0,w,h);}

 if(hit)label(c,`${fx.target==='enemy'?'-':'You: -'}${fx.amount}`,w/2,feet-height*.55,28,'#ffb4a0');

}

function battle(c,w,h,s,time,fx,reduced){

 const inDungeon=s.returnMode==='dungeon',maze=inDungeon?dungeonMap(s.dungeon):null;
 const castle=s.castle&&castleLayout(s.location);

 const position=inDungeon?s.dungeon:castle?s.castle:s;
 const {x:px,y:py}=position;

 const map=inDungeon?null:outdoorMap(s);
 const ladders=inDungeon?dungeonLadders(s.dungeon,maze):[];
 const tile=inDungeon?(x,y)=>maze[y]?.[x]===undefined||maze[y][x]===1?'wall':ladders.some(ladder=>ladder.x===x&&ladder.y===y)?'ladder':'floor':castle?(x,y)=>castle.tiles[y]?.[x]??'wall':map.tileAt;

 const passable=(x,y)=>!['wall','water','mountain'].includes(tile(x,y));

 const [ex,ey]=[[px+1,py],[px-1,py],[px,py+1],[px,py-1]].find(([x,y])=>passable(x,y))||[px+1,py];

 const size=Math.min(w/15,(h-145)/11),ox=(w-size*15)/2,oy=105+(h-145-size*11)/2,originX=px-7,originY=py-5;

 c.fillStyle='#0b1b17';c.fillRect(0,0,w,h);c.save();c.translate(-ox*w/(size*15),-oy*(h/(size*11)));c.scale(w/(size*15),h/(size*11));

 for(let row=0;row<11;row++)for(let col=0;col<15;col++){

  const gx=originX+col,gy=originY+row,t=tile(gx,gy),x=ox+col*size,y=oy+row*size;

  if(inDungeon){c.fillStyle=t==='wall'?DUNGEON_WALLS[s.dungeon.index].map:DUNGEON_WALLS[s.dungeon.index].floor;c.fillRect(x,y,size,size);c.strokeStyle=t==='wall'?'#82907c55':'#a2ac7b19';c.strokeRect(x+1,y+1,size-2,size-2);if(t==='ladder')label(c,'LADDER',x+size/2,y+size*.6,Math.max(7,size*.18),'#d7bf83');}

  else if(castle)drawCastleTile(c,castle,s.region,gx,gy,x,y,size);
  else{groundTile(c,map,gx,gy,x,y,size);const town=!map.area&&TOWNS.find(p=>p.region===s.region&&p.x===gx&&p.y===gy);if(town)settlementIcon(c,town,x+size/2,y+size/2,size*1.3);const ruin=!map.area&&DUNGEONS.find(p=>p.region===s.region&&p.x===gx&&p.y===gy);if(ruin){if(ruin.id==='tithe-vault'&&vault.complete&&vault.naturalWidth){c.drawImage(vault,x,y,size,size);drawCemeteryStones(c,x+size/2,y+size*.7,size*.65);}else tileArt(c,6,x,y,size);}}

  c.strokeStyle='#06150b18';c.strokeRect(x,y,size,size);

 }

 c.restore();
 const combatIcon=Math.min(144,Math.max(75,size*.95*3),h*.24,w*.16),heroX=w/2-combatIcon*1.15,heroY=oy+5.5*size,enemyX=w/2+combatIcon*1.15,enemyY=heroY;

 const age=fx?time-fx.start:9999,impact=age>=0&&age<350,pulse=impact?Math.sin(Math.PI*age/350):0;

 const enemyHit=impact&&fx.target==='enemy',heroHit=impact&&fx.target==='hero',icon=combatIcon;

 circle(c,heroX,heroY,icon*.58,'#c9af6455');drawAdventurer(c,heroX,heroY,icon*1.35,heroHit&&!reduced?pulse:0);

 const shake=enemyHit&&!reduced?Math.sin(age*.06)*3*(1-age/350):0;

 const opponents=s.enemy.memberHp?Math.max(1,Math.ceil(s.enemy.hp/s.enemy.memberHp)):1;
 const columns=opponents>3?4:1,rows=Math.ceil(opponents/columns);
 for(let i=0;i<opponents;i++){
 const row=Math.floor(i/columns),rowCount=Math.min(columns,opponents-row*columns);
 const dx=(i%columns-(rowCount-1)/2)*icon*.72,dy=(row-(rows-1)/2)*icon*(opponents>3?.68:.9);
 c.save();c.translate(enemyX+shake+dx,enemyY+dy);if(opponents>1){const scale=opponents>3?.52:.73;c.scale(scale,scale);}circle(c,0,0,icon*.62,'#4b1c18e8');c.strokeStyle=enemyHit?'#ffe2a1':'#df967a';c.lineWidth=2;c.beginPath();c.arc(0,0,icon*.62,0,Math.PI*2);c.stroke();

 if(enemyHit&&!reduced)c.filter=`brightness(${1+pulse*2})`;

 c.beginPath();c.arc(0,0,icon*.56,0,Math.PI*2);c.clip();

 if(paintMonster(c,s.enemy,-icon*.5,-icon*.55,icon,icon*1.1,s.dungeon?.index||0)){}else if(/rat/i.test(s.enemy.name)){c.save();c.scale(icon,icon);c.strokeStyle='#d5a88a';c.lineWidth=.055;c.beginPath();c.moveTo(-.19,.12);c.bezierCurveTo(-.65,.38,-.52,-.30,-.34,-.32);c.stroke();c.fillStyle='#b19b7c';c.beginPath();c.ellipse(-.03,.05,.29,.19,-.3,0,Math.PI*2);c.fill();path(c,[[.09,-.06],[.38,-.10],[.23,.14]],'#c5b49a');circle(c,.12,-.11,.085,'#d8b49a');circle(c,.25,-.025,.022,'#efcc70');c.restore();}else if(/eel/i.test(s.enemy.name)){c.strokeStyle='#85b7bc';c.lineWidth=icon*.15;c.beginPath();c.moveTo(-icon*.3,icon*.3);c.bezierCurveTo(icon*.5,icon*.2,-icon*.45,-icon*.2,icon*.25,-icon*.3);c.stroke();circle(c,icon*.26,-icon*.3,icon*.10,'#b6d5cb');circle(c,icon*.29,-icon*.33,icon*.025,'#1b2220');}else if(sprites.complete&&sprites.naturalWidth){const names={'Debt Collector':0,'Grave Lantern':7,'Ash Road Brigand':0,'Brass Inquisitor':5,'Ironroot Stalker':6,'Coral Bailiff':2,'Starving Automaton':4,'Gravity Wraith':7,'Crown Echo':5};const i=s.enemy.guard?2:/wolf|hound/i.test(s.enemy.name)?1:/skeleton|bone/i.test(s.enemy.name)?3:names[s.enemy.name]??(s.enemy.boss?Math.min(7,s.region*2+1):s.region*2);const sw=sprites.width/4,sh=sprites.height/2;c.drawImage(sprites,i%4*sw,Math.floor(i/4)*sh,sw,sh,-icon*.5,-icon*.6,icon,icon*1.25);}else label(c,'!',0,icon*.2,icon*.7,'#efc5a0');c.restore();}

 label(c,s.name,heroX,heroY-icon*.85,12,'#ffe2a1');label(c,opponents>1?opponents+' ENEMIES':'ENEMY',enemyX,enemyY+icon*(opponents>1?1.47:.95),10,'#f7b39a');

 c.fillStyle='#0c211ced';c.fillRect(Math.max(12,w/2-145),54,Math.min(290,w-24),46);label(c,s.enemy.name+(s.enemy.level?' · Lv '+s.enemy.level:''),w/2,72,Math.min(17,w/25));c.fillStyle='#593e30';c.fillRect(w/2-100,81,200,5);c.fillStyle='#cd8663';c.fillRect(w/2-100,81,200*s.enemy.hp/s.enemy.maxHp,5);label(c,`${s.enemy.hp} / ${s.enemy.maxHp}`,w/2,97,10);

 if(impact){const x=fx.target==='hero'?heroX:enemyX,y=fx.target==='hero'?heroY:enemyY;const message=fx.kind==='victory'?'VICTORY':fx.kind==='defeat'?'DEFEATED':fx.kind==='miss'?'MISS':(fx.kind==='heal'?'+':'-')+fx.amount;

  label(c,message,x,y-icon-(reduced?0:age*.035),22,fx.kind==='heal'?'#b1f0b1':fx.kind==='block'?'#a0e6ef':'#ffe5b3');

  if(fx.amount){c.strokeStyle=fx.kind==='magic'?'#f2b876':fx.kind==='block'?'#8fdbe6':'#ffe0aa';c.lineWidth=2;c.beginPath();if(fx.kind==='magic'||fx.kind==='block')c.arc(x,y,icon*.72,0,Math.PI*2);else{c.moveTo(x-icon*.5,y+icon*.4);c.lineTo(x+icon*.5,y-icon*.4);}c.stroke();}

 }

}

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}



function drawGateLabel(c,site,x,y,size){
 const direction=site.direction??(site.x>WORLD_WIDTH/2?'east':'west');
 const name=site.kind==='branchGate'?site.name:direction[0].toUpperCase()+direction.slice(1)+' gate · '+REGIONS[site.target].name;
 const offset=direction==='west'?1.4:direction==='east'?-1.4:0;
 label(c,name,x+size*offset,y+size*1.1,Math.max(9,size*.3));
}

function drawWildSite(c,site,x,y,size){
 if(site.boatOnly){
  c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=.04;
  path(c,[[-.60,.20],[.62,.20],[.40,.41],[-.35,.41]],'#66492f','#f1cc84');
  c.fillStyle='#765638';c.fillRect(-.02,-.79,.06,1.02);
  path(c,[[.04,-.73],[.54,.12],[.04,.12]],'#f8e8bc','#695747');
  path(c,[[-.07,-.47],[-.45,.12],[-.07,.12]],'#a8cdd5','#526d79');
  c.restore();
  drawGateLabel(c,site,x,y,size);
  return;
 }
 if(site.kind===PUTRID_PALACE.kind){
  drawDungeonIcon(c,{...site,index:7},x,y,size);
  label(c,site.name,x,y+size*1.1,Math.max(10,size*.4));
  return;
 }
 if(site.kind==='teleporter'){
  c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=.035;
  path(c,[[-.52,.48],[.4,.48],[.62,.26],[-.3,.26]],'#244858','#a7eef0');
  path(c,[[-.45,.3],[-.45,-1.1],[.38,-1.1],[.38,.3]],'#58e4e43d','#a9f9f1');
  path(c,[[.38,.3],[.6,.08],[.6,-1.32],[.38,-1.1]],'#347da75f','#84d6e4');
  path(c,[[-.45,-1.1],[-.22,-1.32],[.6,-1.32],[.38,-1.1]],'#235466','#b4fff5');
  c.fillStyle='#dcfffa';c.fillRect(-.35,-1.04,.075,1.22);c.fillRect(.16,-.49,.11,.05);
  path(c,[[-.05,-.78],[.07,-.56],[-.05,-.35],[-.17,-.56]],'#c5fff3','#65ebec');
  c.restore();label(c,site.name,x,y+size*.85,Math.max(10,size*.3));return;
 }
const illustrated=site.kind==='firedrak'?8:['gate','branchGate'].includes(site.kind)?9:site.kind==='fountain'?10:null;if(illustrated!==null&&drawLandmark(c,illustrated,x,y,size)){if(site.kind==='firedrak')label(c,site.name,x,y+size*.8,Math.max(10,size*.3));else if(['gate','branchGate'].includes(site.kind))drawGateLabel(c,site,x,y,size);return;}if(site.kind==='firedrak'&&richTerrain.complete&&richTerrain.naturalWidth){const cell=richTerrain.width/4;c.drawImage(richTerrain,cell,cell,cell,cell,x-size*1.1,y-size*1.6,size*2.2,size*2.2);c.save();c.shadowColor='#ff7a20';c.shadowBlur=10;c.fillStyle='#1c0e08';c.beginPath();c.ellipse(x,y+size*.1,size*.25,size*.42,0,Math.PI,Math.PI*2);c.fill();c.fillStyle='#ffac37';c.fillRect(x-size*.1,y+size*.1,size*.2,size*.12);c.restore();label(c,'Firedrak Mountain',x,y+size*.8,Math.max(10,size*.3),'#fff0c6');return;}if(site.kind==='firedrak'){path(c,[[x-size,y+size*.4],[x,y-size*1.4],[x+size,y+size*.4]],'#5c3830','#b86e3b');c.fillStyle='#ffb354';c.fillRect(x-size*.13,y-size*.3,size*.26,size*.6);label(c,'Firedrak Mountain',x,y+size*.8,Math.max(10,size*.3),'#fff0c6');return;}if(site.kind==='gate'||site.kind==='branchGate'){c.fillStyle='#777b69';c.fillRect(x-size*.65,y-size*.7,size*.28,size*1.2);c.fillRect(x+size*.37,y-size*.7,size*.28,size*1.2);c.fillRect(x-size*.65,y-size*.8,size*1.3,size*.25);c.strokeStyle='#d3bf86';c.lineWidth=Math.max(1,size*.045);for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(x+i*size*.1,y-size*.55);c.lineTo(x+i*size*.1,y+size*.45);c.stroke();}drawGateLabel(c,site,x,y,size);return;}if(site.kind==='forest'){if(treeFort.complete&&treeFort.naturalWidth)c.drawImage(treeFort,x-size*1.1,y-size*1.7,size*2.2,size*2.2);else tree(c,x,y,size*1.6);return;}if(site.kind==='fountain'){c.fillStyle='#9da792';c.beginPath();c.ellipse(x,y+size*.15,size*.65,size*.27,0,0,7);c.fill();c.fillStyle='#79bec2';c.beginPath();c.ellipse(x,y+size*.08,size*.52,size*.17,0,0,7);c.fill();c.fillStyle='#bac7ae';c.fillRect(x-size*.1,y-size*.6,size*.2,size*.7);c.beginPath();c.ellipse(x,y-size*.55,size*.36,size*.13,0,0,7);c.fill();c.strokeStyle='#c9f5ef';c.lineWidth=2;for(const d of [-1,1]){c.beginPath();c.moveTo(x,y-size*.55);c.quadraticCurveTo(x+d*size*.5,y-size*.9,x+d*size*.48,y);c.stroke();}return;}if(site.kind==='dragon'){c.save();c.translate(x,y);c.strokeStyle='#ded2ac';c.lineWidth=Math.max(1,size*.09);c.beginPath();c.moveTo(-size*.9,0);c.quadraticCurveTo(0,-size*.4,size*.8,0);c.stroke();for(let i=-3;i<4;i++){c.beginPath();c.ellipse(i*size*.18,-size*.1,size*.13,size*.38,0,0,7);c.stroke();}c.fillStyle='#ddd3ad';c.beginPath();c.ellipse(size*.95,0,size*.3,size*.2,0,0,7);c.fill();c.fillStyle='#29291f';c.fillRect(size*.95,-size*.08,size*.08,size*.08);c.fillStyle='#705033';c.fillRect(-size*.7,size*.5,size*.08,size*.6);c.fillStyle='#c1a16d';c.fillRect(-size*1.05,size*.4,size*.85,size*.35);label(c,'BEWARE',-size*.62,size*.65,Math.max(6,size*.2),'#341c13');c.restore();}}



function drawAreaSites(c,s,area,size,view){
 for(const p of areaSites(s).filter(point=>visibleWorldPoint(point,view))){const x=(p.x+.5)*size,y=(p.y+.5)*size;if(p.kind==='teleporter'){drawWildSite(c,p,x,y,size);continue;}if(p.kind==='artifact'){path(c,[[x,y-size],[x+size*.6,y],[x,y+size*.5],[x-size*.6,y]],'#9fe9e0','#fff4b8');circle(c,x,y-size*.2,size*.2,'#fbf7bf');}else if(p.kind==='landedShip'){c.fillStyle='#7db8bb';c.beginPath();c.ellipse(x,y,size*.9,size*.3,0,0,Math.PI*2);c.fill();c.fillStyle='#b5ecec';c.beginPath();c.ellipse(x,y-size*.2,size*.4,size*.35,0,Math.PI,0);c.fill();for(const dx of [-.5,0,.5])circle(c,x+size*dx,y,size*.08,'#fff3ac');}else if(p.kind==='returnGate'){c.fillStyle='#abb59a';c.fillRect(x-size*.6,y-size*.6,size*1.2,size*.2);c.fillRect(x-size*.6,y-size*.5,size*.2,size);c.fillRect(x+size*.4,y-size*.5,size*.2,size);}else if(p.kind==='bottomlessPit'){c.save();c.beginPath();c.ellipse(x,y,size*.86,size*.57,0,0,Math.PI*2);c.fillStyle='#675449';c.fill();c.beginPath();c.ellipse(x,y+size*.03,size*.64,size*.4,0,0,Math.PI*2);c.fillStyle='#110e11';c.fill();c.strokeStyle='#cc713d';c.lineWidth=size*.08;c.stroke();c.restore();}else{drawDungeonIcon(c,{...p,region:area.region},x,y,size,!!s.flags['expedition:'+p.expedition]);}label(c,p.name,x,y+size*1.1,Math.max(10,size*.35));}
}

function drawShip(c,w,h,s){

 const d=s.dungeon,m=dungeonMap(d),[dx,dy]=DIRS[d.dir],angle=Math.atan2(dy,dx),fov=Math.PI/2.6;

 const ceiling=c.createLinearGradient(0,0,0,h*.5);ceiling.addColorStop(0,'#07101f');ceiling.addColorStop(1,'#1c3345');c.fillStyle=ceiling;c.fillRect(0,0,w,h/2);c.fillStyle='#243c50';c.fillRect(0,h/2,w,h/2);c.strokeStyle='#55748655';c.lineWidth=2;for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(w*.5,h*.5);c.lineTo(w*.5+i*w*.17,h);c.stroke();}for(let i=1;i<12;i++){const y=h*.5+(i/12)**2*h*.5;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}



 drawDungeonCeiling(c,w,h,{ceiling:'#102835',map:'#508d94'},{metal:true});
 for(let col=0;col<w;col+=4){const a=angle+Math.atan((col/w-.5)*2*Math.tan(fov/2)),vx=Math.cos(a),vy=Math.sin(a);let dist=.03,x,y;while(dist<20){x=d.x+.5+vx*dist;y=d.y+.5+vy*dist;if(m[Math.floor(y)]?.[Math.floor(x)]!==0&&m[Math.floor(y)]?.[Math.floor(x)]!==3)break;dist+=.04;}const height=Math.min(h*2,h*.85/(dist*Math.cos(a-angle))),top=(h-height)/2,u=(x%1<.06||x%1>.94)?y%1:x%1;for(let yy=Math.max(0,top);yy<Math.min(h,top+height);yy+=4){const v=(yy-top)/height,seam=u<.06||u>.94||v<.03||v>.97,strip=v>.35&&v<.38,vent=v>.72&&v<.83&&u>.18&&u<.82&&Math.floor(u*27)%2===0,screen=(Math.floor(x)*7+Math.floor(y)*11)%5===0&&v>.43&&v<.58&&u>.30&&u<.70;c.fillStyle=strip?'#8af4ed':vent?'#0d2231':screen?(Math.floor(u*45+v*32)%5===0?'#e2c77f':'#2f7c94'):seam?'#203540':`rgb(${Math.floor((66+Math.sin(u*3.14)*13)/(1+dist*.12))},${Math.floor((125+Math.sin(u*3.14)*16)/(1+dist*.12))},${Math.floor((130+Math.sin(u*3.14)*18)/(1+dist*.12))})`;if(!seam&&!strip&&!vent&&!screen){const material=wallMaterial(6,u,v,1/(1+dist*.12));if(material)c.fillStyle=material;}const ink=shipWallInk(Math.floor(x),Math.floor(y),u,v);if(ink)c.fillStyle=ink;c.fillRect(col,yy,4,4);}}

 drawDungeonChests(c,w,h,s,m,dx,dy);

 const rx=7-d.x,ry=5-d.y,depth=rx*dx+ry*dy,side=-rx*dy+ry*dx,here=rx===0&&ry===0;if(here||depth>0&&Math.abs(side/depth)<.6){const size=Math.min(w*.4,h*.45/Math.max(1,depth)*5),x=w/2+side/Math.max(1,depth)*w*.6,y=h*.63;c.fillStyle='#1d3848';c.fillRect(x-size/2,y-size*.5,size,size*.6);c.fillStyle='#86e9d0';c.fillRect(x-size*.4,y-size*.42,size*.8,size*.28);for(let i=0;i<10;i++){c.fillStyle=i%2?'#f6c776':'#95b9f1';c.fillRect(x-size*.35+i*size*.12,y-size*.05,size*.07,size*.05);}label(c,'SHIP CONTROL STATION',x,y+size*.2,Math.max(10,size*.07));}

 const z=Math.min(7,w/65),mx=w-15*z-18,my=18;c.fillStyle='#07121fe6';c.fillRect(mx-6,my-6,15*z+12,15*z+12);for(let y=0;y<15;y++)for(let x=0;x<15;x++){c.fillStyle=m[y][x]===1?'#2a4256':'#668492';c.fillRect(mx+x*z,my+y*z,z-1,z-1);}c.fillStyle='#69f3d5';c.fillRect(mx+7*z,my+5*z,z-1,z-1);circle(c,mx+(d.x+.5)*z,my+(d.y+.5)*z,z*.4,'#ffe1a0');label(c,'DECK MAP',mx+7*z,my+16*z,10,'#93dcd8');

 label(c,'CONTROL STATION: 7, 5 · '+['NORTH','EAST','SOUTH','WEST'][d.dir],w/2,35,15);

}



function drawTrails(c,region,size,view){

 c.save();c.lineJoin='round';c.lineCap='round';

 for(const {site,points}of regionTrails(region)){if(site.id==='leviathan-pump'||!points.some(point=>visibleWorldPoint(point,view)))continue;

  for(const [width,color]of [[.38,'#756546'],[.28,'#cbb181']]){c.lineWidth=size*width;c.strokeStyle=color;drawTrailCurve(c,points,size);}

  c.strokeStyle='#e7d4a4';c.lineWidth=Math.max(1,size*.045);c.setLineDash([size*.07,size*.29]);drawTrailCurve(c,points,size);c.setLineDash([]);

 }c.restore();

}



function drawMetalTrees(c,s,size,view){const prefix='metalTree:'+String(s.exploration?.area||s.region)+':';for(const key of Object.keys(s.flags)){if(!key.startsWith(prefix)||!s.flags[key])continue;const [tx,ty]=key.slice(prefix.length).split(':').map(Number);if(!visibleWorldPoint({x:tx,y:ty},view))continue;const x=(tx+.5)*size,y=(ty+.5)*size;c.save();c.strokeStyle='#d1e8ed';c.lineWidth=size*.14;c.beginPath();c.moveTo(x,y+size*.4);c.lineTo(x,y-size*.7);c.moveTo(x,y);c.lineTo(x-size*.4,y-size*.35);c.moveTo(x,y-size*.2);c.lineTo(x+size*.4,y-size*.55);c.stroke();for(let i=0;i<7;i++){const a=i*Math.PI*2/7;path(c,[[x+Math.cos(a)*size*.48,y-size*.5+Math.sin(a)*size*.3],[x+Math.cos(a)*size*.7,y-size*.5+Math.sin(a)*size*.5],[x+Math.cos(a+.6)*size*.48,y-size*.5+Math.sin(a+.6)*size*.3]],i%2?'#d0a76a':'#a9dbe1','#487a80');}c.restore();}}



