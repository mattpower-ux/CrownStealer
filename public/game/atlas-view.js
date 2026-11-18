import { DUNGEONS, REGIONS, TOWNS } from './content.js';
import { worldTile } from './engine.js';
import { AREAS, areaFor, areaSites, areaTile, branchGates, visitedLands } from './exploration.js';
import { WILD_SITES } from './wild-sites.js';
import { PUTRID_PALACE } from './royal-trials.js';
import {percivalCastleSite} from './percival-castle.js';
import { MOUNTS, mountFor } from './mounts.js';
import { WORLD_HEIGHT, WORLD_WIDTH } from './world-size.js';

const LEVELS = ['1–7', '8–15', '16–25', '26+'];
const LEVEL_COLORS = ['#a9d890', '#ffdc81', '#ffb17d', '#ff9a95'];
const MARKS = { town: '#fff0c4', dungeon: '#ffa4a1', gate: '#ffd46e', passage: '#8ed7f1' };
const escape = value => String(value).replace(/[&<>"']/g, character => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
));

export function atlasRegions(state) {
  const area = areaFor(state);
  const discovered = new Set(visitedLands(state));
  const ridingDragon = mountFor(state) === MOUNTS.dragon;
  const boatReady = !!(state.flags.rowboatReady || state.flags.sailboatReady);
  return REGIONS.map(region => {
    const towns = TOWNS.filter(town => town.region === region.id);
    const dungeons = DUNGEONS.filter(dungeon => dungeon.region === region.id);
    const sideDungeons = PUTRID_PALACE.region === region.id ? [PUTRID_PALACE] : [];
    if(region.id===1&&discovered.has(1))sideDungeons.push(percivalCastleSite({...state,region:1,exploration:null}));
    const relicsFound = dungeons.every(dungeon => state.relics.includes(dungeon.id));
    const canCross = relicsFound || ridingDragon;
    const east = WILD_SITES.find(site => site.id === `east-gate-${region.id}`);
    const west = WILD_SITES.find(site => site.id === `west-gate-${region.id}`);
    const branches = branchGates(region.id).map(gate => {
      const branch = AREAS.find(candidate => candidate.id === gate.area);
      return {
        ...branch, gate, discovered: discovered.has(branch.id), open: canCross && (!gate.boatOnly || ridingDragon || boatReady), current: area?.id === branch.id,
        sites: areaSites({ region: region.id, exploration: { area: branch.id } })
          .filter(site => ['expedition', 'bottomless-pit'].includes(site.kind) || site.id === 'bottomless-pit'),
      };
    });
    return {
      ...region, discovered: discovered.has(region.id), towns, dungeons, sideDungeons, branches, east: { ...east, open: east.target < region.id || canCross }, west,
      levels: LEVELS[region.id], color: LEVEL_COLORS[region.id],
      current: state.region === region.id && area?.kind !== 'planet',
    };
  });
}


export const ATLAS_WIDTH=1500;
export const ATLAS_HEIGHT=820;
export const PREVIEW_ATLAS_HEIGHT=1080;
export function clampAtlasZoom(value){return Math.max(.75,Math.min(3,Number(value)||1));}

// Position the maps around their playable border connections. The wider
// channels across eastern waters and around the Barrens stay open sea.
const placements={
  0:[237,235,346,245],1:[565,224,360,239],
  2:[1032,365,304,244],3:[1065,68,277,224],
  'wild-0':[290,70,260,200],'wild-1':[296,444,238,188],'wild-2':[82,674,160,116],
  'wild-3':[631,56,244,198],'wild-4':[652,432,225,176],'wild-5':[480,133,157,130],
  'wild-6':[1225,271,198,129],'wild-7':[976,567,181,137],'wild-8':[888,449,144,144],
  'wild-9':[1199,3,239,132],'wild-10':[1373,198,108,134],'wild-11':[885,21,127,104],
};

function placement(id){
 const [x,y,width,height]=placements[id];
 return {x,y,width,height};
}

export function chartLands(state){
 const lands=atlasRegions(state).flatMap(region=>{
  const main={...region,...placement(region.id),sites:[...region.towns.map(t=>({...t,mark:'town'})),...region.dungeons,...region.sideDungeons]};
  const branches=region.branches.map(branch=>({...branch,...placement(branch.id),palette:region.palette,branch:true}));
  return [main,...branches].filter(land=>land.discovered);
 });
 if(state.flags.previewFullMap)lands.push(...AREAS.filter(a=>a.kind==='planet').map((a,i)=>({...a,branch:true,x:40+i*490,y:862,width:450,height:184,palette:REGIONS[a.region].palette,sites:areaSites({region:a.region,exploration:{area:a.id}})})));
 return lands;
}

export function atlasPoint(land,point){
 const planet=land.kind==='planet';
 return {x:land.x+point.x/(planet?32:WORLD_WIDTH)*land.width,y:land.y+point.y/(planet?24:WORLD_HEIGHT)*land.height};
}

function connections(lands){
 const chart=new Map(lands.map(land=>[land.id,land]));
 const routes=[];
 for(const land of lands){
  if(!land.branch){
   const neighbor=chart.get(land.id+1);
   if(neighbor)routes.push({from:atlasPoint(land,land.east),to:atlasPoint(neighbor,neighbor.west),land:land.id===0,palette:land.palette});
  }else if(land.gate&&chart.has(land.region)){
   const main=chart.get(land.region);
   const exit=areaSites({region:land.region,exploration:{area:land.id}}).find(site=>site.kind==='returnGate');
   const mainland=['wild-0','wild-1','wild-3','wild-4','wild-5'].includes(land.id);
   const from=atlasPoint(main,land.gate);
   const landing=mainland&&land.gate.direction==='south'?{x:WORLD_WIDTH*.5,y:4}
    :mainland&&land.gate.direction==='west'?{x:WORLD_WIDTH*.78,y:WORLD_HEIGHT*.76}:exit;
   routes.push({from,to:atlasPoint(land,landing),land:mainland,palette:main.palette,
    ...(land.id==='wild-2'?{via:{x:45,y:493}}:{})});
  }
 }
 return routes;
}

function drawRoute(c,route){
 const {from,to,land,via}=route;
 c.beginPath();
 c.moveTo(from.x,from.y);
 if(via)c.quadraticCurveTo(via.x,via.y,to.x,to.y);
 else c.lineTo(to.x,to.y);
 if(land){
  c.lineCap='round';
  c.strokeStyle=route.palette.land;c.lineWidth=26;c.stroke();
  c.strokeStyle=route.palette.forest||route.palette.land;c.lineWidth=13;c.stroke();
 }
 c.strokeStyle=land?'#c5ab7a':'#a5d0d09a';
 c.lineWidth=land?3:1.6;
 c.setLineDash(land?[]:[4,7]);c.stroke();c.setLineDash([]);
}

export function atlasView(state){
 const names=chartLands(state).map(land=>escape(land.name+': '+land.sites.map(site=>site.name).join(', ')));
 return `<div class="atlas-chart-heading"><span>${state.flags.previewFullMap?'THE WHOLE WORLD · CLICK TO EXPLORE':'THE KNOWN WORLD'}</span><small>Drag or scroll to explore the map</small><div class="atlas-zoom-controls" role="group" aria-label="Map zoom"><button type="button" data-atlas-zoom="out" aria-label="Zoom out">−</button><output data-atlas-zoom-level>100%</output><button type="button" data-atlas-zoom="in" aria-label="Zoom in">+</button><button type="button" data-atlas-zoom="fit">Fit</button></div></div>
 <div class="atlas-panorama" tabindex="0" role="region" aria-label="Scrollable world map">
 <canvas data-atlas-world width="${ATLAS_WIDTH}" height="${state.flags.previewFullMap?PREVIEW_ATLAS_HEIGHT:ATLAS_HEIGHT}" role="img" aria-label="World map: ${names.join(', ')}. Your position is marked with a white star."></canvas></div>
 <p class="atlas-chart-legend"><span><i class="atlas-town"></i>Settlement</span><span><i class="atlas-dungeon"></i>Dungeon</span><span class="atlas-player-key">✦ You are here</span></p>`;
}

export function paintAtlasMaps(container,state){
 const canvas=container.querySelector('[data-atlas-world]');
 if(!canvas)return;
 const c=canvas.getContext('2d');if(!c)return;
 const lands=chartLands(state),currentArea=areaFor(state);
 const sea=c.createLinearGradient(0,0,ATLAS_WIDTH,ATLAS_HEIGHT);
 sea.addColorStop(0,'#1b536e');sea.addColorStop(.55,'#143d59');sea.addColorStop(1,'#0b2940');
 c.fillStyle=sea;c.fillRect(0,0,ATLAS_WIDTH,canvas.height);
 if(!state.flags.previewFullMap){
  const known=new Set(lands.map(land=>land.id));
  for(const id of Object.keys(placements)){
   const key=id.startsWith('wild-')?id:Number(id);
   if(known.has(key))continue;
   const box=placement(key),x=box.x+box.width/2,y=box.y+box.height/2,r=Math.max(box.width,box.height)*.6;
   const fog=c.createRadialGradient(x,y,r*.18,x,y,r);
   fog.addColorStop(0,'#090f18ce');fog.addColorStop(1,'#090f1800');
   c.fillStyle=fog;c.fillRect(x-r,y-r,r*2,r*2);
  }
 }
 const routes=connections(lands);
 for(const route of routes.filter(route=>route.land))drawRoute(c,route);
 const label=(text,x,y,size=16,color='#f3e5be',align='center')=>{
  c.font=`${size}px Georgia`;c.textAlign=align;c.textBaseline='middle';
  c.lineWidth=4;c.strokeStyle='#07100de8';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);
 };
 for(const land of lands){
  const colors={...land.palette,grass:land.palette.land,road:'#c0a77a',bridge:'#b89769',swamp:'#416c56'};
  const local={region:land.region,exploration:{area:land.id}};
  const step=2;
  for(let y=0;y<land.height;y+=step)for(let x=0;x<land.width;x+=step){
   const tx=Math.min((land.kind==='planet'?32:WORLD_WIDTH)-1,Math.floor(x/land.width*(land.kind==='planet'?32:WORLD_WIDTH))),ty=Math.min((land.kind==='planet'?24:WORLD_HEIGHT)-1,Math.floor(y/land.height*(land.kind==='planet'?24:WORLD_HEIGHT)));
   const tile=land.branch?areaTile(local,tx,ty):worldTile(land.id,tx,ty);
   // One continuous blue sea joins the chart. Painting each land's water color
   // would expose rectangular source-map edges and turn the atlas into tiles.
   if(tile==='water')continue;
   c.fillStyle=colors[tile]||colors.grass;c.fillRect(land.x+x,land.y+y,step,step);
  }
 }
 for(const route of routes.filter(route=>!route.land))drawRoute(c,route);
 if(state.flags.previewFullMap)label('OFF-WORLD DESTINATIONS',ATLAS_WIDTH/2,846,13,'#bfd3e0');
 for(const land of lands){
  for(const point of land.sites){
   const {x,y}=atlasPoint(land,point);
   c.fillStyle=point.mark==='town'?MARKS.town:point.kind==='bottomlessPit'?'#f19e73':MARKS.dungeon;
   c.beginPath();
   if(point.mark==='town')c.rect(x-3.5,y-3.5,7,7);
   else {c.moveTo(x,y-4);c.lineTo(x+4,y);c.lineTo(x,y+4);c.lineTo(x-4,y);c.closePath();}
   c.fill();
   label(point.name,x,y+11,land.branch?9:10,'#f4e6c1');
  }
  label(land.name,land.x+land.width/2,land.y+18,land.branch?13:20);
  if(!land.branch)label('Levels '+land.levels,land.x+land.width/2,land.y+39,11,land.color);
 }
 const here=lands.find(land=>currentArea?land.id===currentArea.id:!land.branch&&land.id===state.region);
 if(here){
  const {x,y}=atlasPoint(here,state);
  const glow=c.createRadialGradient(x,y,2,x,y,22);glow.addColorStop(0,'#fff1bd99');glow.addColorStop(1,'#fff1bd00');
  c.fillStyle=glow;c.fillRect(x-22,y-22,44,44);
  label('✦',x,y,26,'#fff');label('You are here',x,y-23,13,'#fff');
 }
 const pan=canvas.closest?.('.atlas-panorama')||canvas.parentElement;
 if(pan){
  const sheet=canvas.closest?.('.preview-map-sheet'),baseWidth=Math.max(pan.clientWidth||0,state.flags.previewFullMap?ATLAS_WIDTH:1100),level=container.querySelector('[data-atlas-zoom-level]');let zoom=1;
  const applyZoom=(next,preserve=true)=>{const oldWidth=canvas.getBoundingClientRect?.().width||baseWidth,centerX=pan.scrollLeft+pan.clientWidth/2,centerY=pan.scrollTop+pan.clientHeight/2;zoom=clampAtlasZoom(next);const width=baseWidth*zoom;canvas.style.width=width+'px';if(sheet)sheet.style.width=width+'px';if(level)level.value=level.textContent=Math.round(zoom*100)+'%';if(preserve&&oldWidth){const ratio=width/oldWidth;pan.scrollLeft=centerX*ratio-pan.clientWidth/2;pan.scrollTop=centerY*ratio-pan.clientHeight/2;}};
  container.querySelectorAll('[data-atlas-zoom]').forEach(control=>control.onclick=()=>{const action=control.dataset.atlasZoom;applyZoom(action==='fit'?Math.max(.75,pan.clientWidth/baseWidth):zoom+(action==='in'?.25:-.25));});
  pan.onwheel=event=>{if(!event.ctrlKey&&!event.metaKey)return;event.preventDefault();applyZoom(zoom+(event.deltaY<0?.25:-.25));};
  applyZoom(1,false);
  if(here&&typeof requestAnimationFrame==='function')requestAnimationFrame(()=>{
   const {x,y}=atlasPoint(here,state),scale=canvas.clientWidth/ATLAS_WIDTH;
   pan.scrollLeft=Math.max(0,x*scale-pan.clientWidth/2);
   pan.scrollTop=Math.max(0,y*scale-pan.clientHeight/2);
  });
  let drag;
  pan.onpointerdown=event=>{if(event.target.closest?.('button'))return;if(event.pointerType==='mouse'){drag={x:event.clientX,left:pan.scrollLeft};pan.setPointerCapture(event.pointerId);}};
  pan.onpointermove=event=>{if(drag)pan.scrollLeft=drag.left+drag.x-event.clientX;};
  pan.onpointerup=pan.onpointercancel=()=>{drag=null;};
 }
}
