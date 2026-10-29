import {inlandWater,waterAccess} from './nautical.js';
import {travelSteps} from './junk-loot.js';
import {wildernessChance} from './world-clock.js';
// Branch wilderness and orbital exploration use the existing save and combat systems.
export const PLANETS=['Aurelia, the Glass Desert','Mycelion, the Singing Mire','Nix, the Violet Ice'];
const names=['Briar Expanse','Crooked Fen','Whispering Barrens','Copper Wastes','Ashen Reach','Sulfur Marsh','Saltwild Coast','Drowned Heath','Pearl Badlands','Starfall Waste','Moonless Thicket','Silent Expanse'];
export const AREAS=names.map((name,i)=>({id:'wild-'+i,name,region:Math.floor(i/3),kind:'wild',seed:20+i})).concat(PLANETS.map((name,i)=>({id:'planet-'+i,name,region:i+1,kind:'planet',seed:40+i})));
export const areaFor=s=>AREAS.find(a=>a.id===s.exploration?.area);
export const branchGates=region=>['north','south','west'].map((direction,i)=>({id:`branch-${region}-${direction}`,kind:'branchGate',name:direction[0].toUpperCase()+direction.slice(1)+' gate · '+names[region*3+i],region,x:direction==='west'?1:16,y:direction==='north'?1:direction==='south'?22:12,area:'wild-'+(region*3+i),direction}));
export const areaSites=s=>{const a=areaFor(s);if(!a)return [];return [{id:'return',kind:'returnGate',name:a.kind==='planet'?'Return to starship':'Return to the occupied land',x:16,y:22},...Array.from({length:a.kind==='planet'?3:2},(_,i)=>({id:a.id+'-cave-'+i,kind:'expedition',name:(a.kind==='planet'?['Prism Vault','Spore Catacombs','Echo Laboratory'][i]:['Forgotten Cave','Buried Sanctum'][i]),x:[7,25,16][i],y:[7,7,15][i],index:a.region*2,expedition:a.id+'-cave-'+i})),...(a.kind==='wild'?[{id:a.id,kind:'artifact',name:'Strange alien artifact',x:16,y:4}]:[])];};
export const expeditionName=d=>{const a=AREAS.find(a=>d.expedition?.startsWith(a.id+'-cave-'));return a?a.name+' · '+(Number(d.expedition.split('-').at(-1))+1):'Alien Starship';};
export function areaTile(s,x,y){if(x<1||x>30||y<1||y>22)return 'water';if(x===16||y===7||areaSites(s).some(p=>Math.abs(p.x-x)<=1&&Math.abs(p.y-y)<=1))return 'grass';if(inlandWater(s.region,x,y,s.exploration?.area))return 'water';const seed=areaFor(s)?.seed||1,n=((x*73856093)^(y*19349663)^seed*83492791)>>>0;return n%9<5?'forest':n%19===0?'mountain':'grass';}
export function shipMap(){const m=Array.from({length:15},()=>Array(15).fill(1));for(let y=1;y<14;y++)for(let x=1;x<14;x++)if(x>=5&&x<=9||y>=5&&y<=9)m[y][x]=0;m[1][7]=3;return m;}
export function explorationAction(s,a,{note,encounter,clock,random}){
 const area=areaFor(s),ship=s.dungeon?.ship;
 const travel=(id)=>{s.exploration??={artifacts:[]};s.exploration.area=id;s.mode='world';s.returnMode='world';s.dungeon=null;s.location=null;s.x=16;s.y=21;note(s,'Arrived in '+areaFor(s).name+'.');};
 const board=()=>{s.exploration??={artifacts:[]};s.exploration.area=null;s.mode='dungeon';s.returnMode='dungeon';s.dungeon={index:s.region*2,floor:0,x:7,y:12,dir:0,ship:true};s.location=null;note(s,'A column of light lifts you into an alien starship. Find the control station at (7, 5) to choose a planet or return home.');};
 if(a.type==='boardShip'&&s.exploration?.artifacts?.length>=10&&s.mode==='world'){s.exploration.home??={region:s.region,x:s.x,y:s.y};board();return true;}
 if(ship&&s.mode==='dungeon'){
  if(a.type==='navigatePlanet'&&s.dungeon.x===7&&s.dungeon.y===5&&Number.isInteger(a.planet)&&a.planet>=0&&a.planet<3){s.region=a.planet+1;travel('planet-'+a.planet);return true;}
  if(a.type==='returnHome'&&s.dungeon.x===7&&s.dungeon.y===5){const home=s.exploration.home||{region:0,x:16,y:12};s.region=home.region;s.x=home.x;s.y=home.y;s.exploration.area=null;s.mode='world';s.dungeon=null;note(s,'The ship beams you safely home.');return true;}
  if(a.type==='descend'||a.type==='leave'){note(s,'Use the control station at (7, 5).');return true;}
 }
 if(s.mode!=='world')return false;
 if(!area){const gate=branchGates(s.region).find(p=>p.x===s.x&&p.y===s.y);if(gate&&(a.type==='enter'||a.type==='move'&&(s.x+a.dx===0||s.y+a.dy===0||s.y+a.dy===23))){s.exploration??={artifacts:[]};s.exploration.home={region:s.region,x:gate.x,y:gate.y};travel(gate.area);return true;}return false;}
 if(a.type==='move'){if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)return true;const steps=travelSteps(s);if(!steps){note(s,'Your snowshoes drag away from snow.');return true;}for(let step=0;step<steps;step++){const x=s.x+a.dx,y=s.y+a.dy,t=areaTile(s,x,y);if(x<1||x>30||y<1||y>22||t==='water'&&!waterAccess(s)||t==='mountain'){note(s,'Find a path around the barrier.');return true;}s.x=x;s.y=y;clock(s);if(!areaSites(s).some(p=>p.x===x&&p.y===y)&&random()<wildernessChance(s,.07))encounter(s);if(s.mode!=='world'||areaSites(s).some(p=>p.x===x&&p.y===y))return true;}return true;}
 if(a.type==='enter'){const p=areaSites(s).find(p=>p.x===s.x&&p.y===s.y);if(!p){note(s,'Explore the caves and strange landmarks.');return true;}
  if(p.kind==='returnGate'){if(area.kind==='planet')board();else{const h=s.exploration.home;s.exploration.area=null;s.region=h.region;s.x=h.x;s.y=h.y;note(s,'You return through the gate.');}return true;}
  if(p.kind==='artifact'){s.exploration.artifacts??=[];if(s.exploration.artifacts.includes(p.id))note(s,'Only a strange circular imprint remains.');else{s.exploration.artifacts.push(p.id);note(s,'Alien artifact collected: '+s.exploration.artifacts.length+'/10.');if(s.exploration.artifacts.length===10)board();}return true;}
  if(p.kind==='expedition'){s.location=p.id;s.mode='dungeon';s.returnMode='dungeon';s.dungeon={index:p.index,expedition:p.expedition,floor:0,x:1,y:1,dir:1};note(s,'You enter '+p.name+'. Three levels lie below.');return true;}
 }
 return false;
}
