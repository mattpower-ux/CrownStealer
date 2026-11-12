import {worldSize,scaleWorldPoint} from './world-size.js';
import {boatOnlyArea,boatPassageShore,landscapeTile} from './wilderness-landscape.js';
import {caveProfile} from './cave-profiles.js';
import {dragonFlying} from './dragon.js';
import {inlandWater,waterAccess} from './nautical.js';
import {travelSteps} from './junk-loot.js';
import {wildernessChance} from './world-clock.js';
import {BOTTOMLESS_PIT,PIT_FLOORS} from './bottomless-pit.js';
// Branch wilderness and orbital exploration use the existing save and combat systems.
export const PLANETS=['Aurelia, the Glass Desert','Mycelion, the Singing Mire','Nix, the Violet Ice'];
const names=['Briar Expanse','Crooked Fen','Whispering Barrens','Copper Wastes','Ashen Reach','Sulfur Marsh','Saltwild Coast','Drowned Heath','Pearl Badlands','Starfall Waste','Moonless Thicket','Silent Expanse'];
export const AREAS=names.map((name,i)=>({id:'wild-'+i,name,region:Math.floor(i/3),kind:'wild',seed:20+i})).concat(PLANETS.map((name,i)=>({id:'planet-'+i,name,region:i+1,kind:'planet',seed:40+i})));
export const areaFor=s=>AREAS.find(a=>a.id===s.exploration?.area);
const boatReady=s=>s.flags.rowboatReady||s.flags.sailboatReady;
export const branchGates=region=>['north','south','west'].map((direction,i)=>{
 const area='wild-'+(region*3+i),boatOnly=boatOnlyArea(area);
 const label=boatOnly?'Sailing passage':direction[0].toUpperCase()+direction.slice(1)+' gate';
 return scaleWorldPoint({id:`branch-${region}-${direction}`,kind:'branchGate',name:label+' · '+names[region*3+i],region,x:direction==='west'?1:16,y:direction==='north'?1:direction==='south'?22:region>0?17:12,area,direction,...(boatOnly?{boatOnly}:{})});
});
export const teleporterSite=region=>({id:'alien-teleporter',kind:'teleporter',name:'Alien Artifact',region,x:64,y:56});
function legacyVisitedLands(s){
 const visited=[0],home=s.exploration?.home,artifacts=s.exploration?.artifacts??[];
 for(const region of [0,1,2,3]){
  if(s.flags['returnAccess:'+(region-1)]||home?.region===region)visited.push(region);
  for(const gate of branchGates(region)){
   const cave=gate.area+'-cave-';
   const hasCaveProgress=s.flags['expedition:'+cave+'0']||s.flags['expedition:'+cave+'1']||s.openedChests?.some(id=>id.startsWith(cave));
   const returnedFromGate=home?.region===region&&home.x===gate.x&&home.y===gate.y;
   if(s.flags['gateAccess:'+gate.id]||artifacts.includes(gate.area)||hasCaveProgress||returnedFromGate)visited.push(region,gate.area);
  }
 }
 return visited;
}
export function visitedLands(s){
 const current=areaFor(s);
 const visited=Array.isArray(s.flags.visitedLands)?s.flags.visitedLands:legacyVisitedLands(s);
 return [...new Set([...visited, ...(current?.kind==='planet'||s.dungeon?.ship?[]:[s.region]), ...(current?.kind==='wild'?[current.id]:[])])];
}
export const areaSites=s=>{
 const a=areaFor(s);if(!a)return [];
 const sites=[{id:'return',kind:a.kind==='planet'?'landedShip':'returnGate',name:a.kind==='planet'?'Alien spacecraft':'Return to the occupied land',x:16,y:22},...Array.from({length:a.kind==='planet'?3:2},(_,i)=>({id:a.id+'-cave-'+i,kind:'expedition',name:(a.kind==='planet'?['Prism Vault','Spore Catacombs','Echo Laboratory'][i]:caveProfile(a.id+'-cave-'+i).name),x:[7,25,16][i],y:[7,7,15][i],index:a.region*2,expedition:a.id+'-cave-'+i})),...(a.kind==='wild'?[{...teleporterSite(a.region),x:16,y:14}]:[]),...(a.kind==='wild'&&Number(a.id.slice(5))<10?[{id:a.id,kind:'artifact',name:'Ancient alien monument',x:16,y:4}]:[])].map(p=>a.kind==='wild'?scaleWorldPoint(p):p);
 if(a.id===BOTTOMLESS_PIT.area)sites.push(BOTTOMLESS_PIT);
 return sites;
};
export const expeditionName=d=>{const a=AREAS.find(a=>d.expedition?.startsWith(a.id+'-cave-'));return caveProfile(d.expedition)?.name||(a?a.name+' · '+(Number(d.expedition.split('-').at(-1))+1):'Alien Starship');};
export function areaTile(s,x,y){
 const {width,height}=worldSize(s),area=areaFor(s),scale=area?.kind==='planet'?1:4;
 if(x<1||x>width-2||y<1||y>height-2)return 'water';
 if(x===16*scale||y===7*scale)return landscapeTile(s.region,area?.id,x,y,'road');
 if(areaSites(s).some(p=>Math.abs(p.x-x)<=1&&Math.abs(p.y-y)<=1))return 'grass';
 if(inlandWater(s.region,x,y,s.exploration?.area))return 'water';
 const seed=area?.seed||1,n=((x*73856093)^(y*19349663)^seed*83492791)>>>0;
 const base=n%9<5?'forest':n%19===0?'mountain':'grass';
 return landscapeTile(s.region,area?.id,x,y,base);
}
export function shipMap(){const m=Array.from({length:15},()=>Array(15).fill(1)),room=(x1,y1,x2,y2)=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)m[y][x]=0;};room(5,1,9,6);room(6,6,8,12);room(1,2,4,5);room(10,2,13,5);room(1,9,4,12);room(10,9,13,12);room(4,4,10,4);room(4,10,10,10);m[1][7]=3;return m;}
export function explorationAction(s,a,{note,encounter,clock,pointAt,random}){
 const area=areaFor(s),ship=s.dungeon?.ship;
 const travel=(id)=>{s.exploration??={artifacts:[]};s.exploration.area=id;s.mode='world';s.returnMode='world';s.dungeon=null;s.location=null;s.x=id.startsWith('planet-')?16:64;s.y=id.startsWith('planet-')?21:87;note(s,'Arrived in '+areaFor(s).name+'.');};
 const board=()=>{s.exploration??={artifacts:[]};s.exploration.area=null;s.mode='dungeon';s.returnMode='dungeon';s.dungeon={index:s.region*2,floor:0,x:7,y:12,dir:0,ship:true};s.location=null;note(s,'A column of light lifts you into an alien starship. Find the control station at (7, 5) to choose another planet. Returning home requires a planetary teleporter or P-Hopper.');};
 if(a.type==='boardShip'&&s.exploration?.artifacts?.length>=10&&s.mode==='world'&&!area){s.exploration.home??={region:s.region,x:s.x,y:s.y};board();return true;}
 if(ship&&s.mode==='dungeon'){
  if(a.type==='navigatePlanet'&&Math.abs(s.dungeon.x-7)+Math.abs(s.dungeon.y-5)<=7&&Number.isInteger(a.planet)&&a.planet>=0&&a.planet<3){s.region=a.planet+1;travel('planet-'+a.planet);return true;}
  if(a.type==='returnHome'){note(s,'The ship cannot return home. Find a planetary teleporter or P-Hopper.');return true;}
  if(a.type==='descend'||a.type==='leave'){note(s,'Use the control station at (7, 5).');return true;}
 }
 if(s.mode!=='world')return false;
 if(!area){
  const gate=branchGates(s.region).find(p=>p.x===s.x&&p.y===s.y);
  if(!gate||!(a.type==='enter'||a.type==='move'&&(a.dx<0&&gate.direction==='west'||a.dy<0&&gate.direction==='north'||a.dy>0&&gate.direction==='south')))return false;
  if(gate.boatOnly&&!boatReady(s)&&!dragonFlying(s)){note(s,'You need a boat to take this sailing passage.');return true;}
  s.exploration??={artifacts:[]};s.flags['gateAccess:'+gate.id]=true;delete s.flags.borderTauntPending;
  s.exploration.home={region:s.region,x:gate.x,y:gate.y};travel(gate.area);return true;
 }
 if(a.type==='move'){
  if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)return true;
  const steps=travelSteps(s),{width,height}=worldSize(s);
  if(!steps){note(s,'Your snowshoes drag away from snow.');return true;}
  for(let step=0;step<steps;step++){
   const x=s.x+a.dx,y=s.y+a.dy,t=areaTile(s,x,y);
   if(x<1||x>width-2||y<1||y>height-2||!dragonFlying(s)&&(t==='water'&&!waterAccess(s,x,y)||t==='mountain')){note(s,'Find a path around the barrier.');return true;}
   s.x=x;s.y=y;clock(s);
   if(area.kind==='planet'&&x===16&&y===22){board();return true;}
   if(pointAt(s))return true;
   if(random()<wildernessChance(s,.07))encounter(s);
   if(s.mode!=='world'||s.flags.wildernessEvent||s.flags.impaledMoves||s.flags.peacefulEncounter)return true;
  }
  return true;
 }
 if(a.type==='enter'){const p=areaSites(s).find(p=>p.x===s.x&&p.y===s.y);if(!p){note(s,'Explore the caves and strange landmarks.');return true;}
  if(p.kind==='landedShip'){board();return true;}
  if(p.kind==='returnGate'){
   const home=s.exploration.home;
   const mainland=home.region===3&&!boatReady(s)&&!dragonFlying(s)?boatPassageShore(area.id):null;
   s.exploration.area=null;s.region=home.region;
   const destination=mainland??home;s.x=destination.x;s.y=destination.y;
   note(s,mainland?'A passing boat takes you to the mainland shore.':'You return through the gate.');
   return true;
  }
  if(p.kind==='teleporter')return true;
  if(p.kind==='artifact'){s.exploration.artifacts??=[];if(s.exploration.artifacts.includes(p.id))note(s,'This place looks eerily familiar. It still smells like your dirty boots.');else if(s.exploration.artifacts.length>=10)note(s,'Your alien disk is already complete.');else{s.exploration.artifacts.push(p.id);s.flags.artifactReveal=true;note(s,'A blue-metal piece locks into your ancient alien disk: '+Math.min(10,s.exploration.artifacts.length)+'/10 pieces.');if(s.exploration.artifacts.length===10)board();}return true;}
  if(p.kind===BOTTOMLESS_PIT.kind){s.location=p.id;s.mode='dungeon';s.returnMode='dungeon';s.dungeon={index:p.index,site:p.id,floor:0,x:1,y:1,dir:1,ladderLayout:1};note(s,'You enter '+p.name+'. '+PIT_FLOORS+' increasingly dangerous levels lie below.');return true;}
  if(p.kind==='expedition'){s.location=p.id;s.mode='dungeon';s.returnMode='dungeon';s.dungeon={index:p.index,expedition:p.expedition,floor:0,x:1,y:1,dir:1,ladderLayout:1};note(s,'You enter '+p.name+'. Three levels lie below.'+(caveProfile(p.expedition)?' '+caveProfile(p.expedition).description:''));return true;}
 }
 return false;
}
