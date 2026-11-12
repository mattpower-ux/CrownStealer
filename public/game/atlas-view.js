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


// Four main lands share one east–west sheet; side lands sit by their gateways.
function chartLands(state){
 return atlasRegions(state).flatMap(region=>{
  const x=30+region.id*360;
  const main={...region,x,y:220,width:360,height:270,sites:[...region.towns.map(t=>({...t,mark:'town'})),...region.dungeons,...region.sideDungeons]};
  const branches=region.branches.map(branch=>({...branch,palette:region.palette,
   ...(branch.gate.direction==='north'?{x:x+140,y:35,width:215,height:165}:
       branch.gate.direction==='south'?{x:x+65,y:510,width:260,height:165}:{x:x+5,y:55,width:120,height:145}),
   branch:true,sites:branch.sites}));
  return [main,...branches].filter(land=>land.discovered);
 });
}

export function atlasView(state){
 const names=chartLands(state).map(land=>escape(land.name+': '+land.sites.map(site=>site.name).join(', ')));
 return `<div class="atlas-chart-heading"><span>THE KNOWN WORLD</span><small>Drag or scroll to explore the map</small></div>
 <div class="atlas-panorama" tabindex="0" role="region" aria-label="Scrollable world map">
 <canvas data-atlas-world width="1500" height="700" role="img" aria-label="World map: ${names.join(', ')}. Your position is marked with a white star."></canvas></div>
 <p class="atlas-chart-legend"><span><i class="atlas-town"></i>Settlement</span><span><i class="atlas-dungeon"></i>Dungeon</span><span class="atlas-player-key">✦ You are here</span></p>`;
}

export function paintAtlasMaps(container,state){
 const canvas=container.querySelector('[data-atlas-world]');
 if(!canvas)return;
 const c=canvas.getContext('2d');if(!c)return;
 const lands=chartLands(state),currentArea=areaFor(state);
 c.fillStyle='#070f11';c.fillRect(0,0,1500,700);
 // Uncharted geography stays completely black: no names, outlines, or placeholders.
 const label=(text,x,y,size=16,color='#f3e5be',align='center')=>{
  c.font=`${size}px Georgia`;c.textAlign=align;c.textBaseline='middle';
  c.lineWidth=4;c.strokeStyle='#07100de8';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);
 };
 for(const land of lands){
  const colors={...land.palette,grass:land.palette.land,road:'#c0a77a',bridge:'#b89769',swamp:'#416c56'};
  const local={region:land.region,exploration:{area:land.id}};
  const step=2;
  for(let y=0;y<land.height;y+=step)for(let x=0;x<land.width;x+=step){
   const tx=Math.min(WORLD_WIDTH-1,Math.floor(x/land.width*WORLD_WIDTH)),ty=Math.min(WORLD_HEIGHT-1,Math.floor(y/land.height*WORLD_HEIGHT));
   const tile=land.branch?areaTile(local,tx,ty):worldTile(land.id,tx,ty);
   // One continuous dark sea joins the chart. Painting each land's water color
   // would expose rectangular source-map edges and turn the atlas into tiles.
   if(tile==='water')continue;
   c.fillStyle=colors[tile]||colors.grass;c.fillRect(land.x+x,land.y+y,step,step);
  }
  for(const point of land.sites){
   const x=land.x+point.x/WORLD_WIDTH*land.width,y=land.y+point.y/WORLD_HEIGHT*land.height;
   c.fillStyle=point.mark==='town'?MARKS.town:MARKS.dungeon;
   c.beginPath();c.arc(x,y,point.mark==='town'?3.5:3,0,Math.PI*2);c.fill();
   label(point.name,x,y+11,land.branch?9:10,'#f4e6c1');
  }
  label(land.name,land.x+land.width/2,land.y+18,land.branch?13:21);
  if(!land.branch)label('Levels '+land.levels,land.x+land.width/2,land.y+39,11,land.color);
 }
 // Only discovered passages are inked; undiscovered neighbors get no hints.
 for(const land of lands.filter(land=>land.branch)){
  const main=lands.find(candidate=>!candidate.branch&&candidate.id===land.region);if(!main)continue;
  const gx=main.x+land.gate.x/WORLD_WIDTH*main.width,gy=main.y+land.gate.y/WORLD_HEIGHT*main.height;
  const bx=land.x+land.width/2,by=land.gate.direction==='south'?land.y:land.y+land.height;
  c.strokeStyle=land.gate.boatOnly?'#8ed7f199':'#d8bc7a99';c.lineWidth=2;c.setLineDash([4,5]);
  c.beginPath();c.moveTo(gx,gy);c.lineTo(bx,by);c.stroke();c.setLineDash([]);
 }
 const here=lands.find(land=>currentArea?land.id===currentArea.id:!land.branch&&land.id===state.region);
 if(here){
  const x=here.x+state.x/WORLD_WIDTH*here.width,y=here.y+state.y/WORLD_HEIGHT*here.height;
  const glow=c.createRadialGradient(x,y,2,x,y,22);glow.addColorStop(0,'#fff1bd99');glow.addColorStop(1,'#fff1bd00');
  c.fillStyle=glow;c.fillRect(x-22,y-22,44,44);
  label('✦',x,y,26,'#fff');label('You are here',x,y-23,13,'#fff');
 }
 const pan=canvas.parentElement;
 if(pan){
  if(here&&typeof requestAnimationFrame==='function')requestAnimationFrame(()=>{
   const playerX=here.x+state.x/WORLD_WIDTH*here.width;
   pan.scrollLeft=Math.max(0,playerX*canvas.clientWidth/1500-pan.clientWidth/2);
  });
  let drag;
  pan.onpointerdown=event=>{if(event.pointerType==='mouse'){drag={x:event.clientX,left:pan.scrollLeft};pan.setPointerCapture(event.pointerId);}};
  pan.onpointermove=event=>{if(drag)pan.scrollLeft=drag.left+drag.x-event.clientX;};
  pan.onpointerup=pan.onpointercancel=()=>{drag=null;};
 }
}
