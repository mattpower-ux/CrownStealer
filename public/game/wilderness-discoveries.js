import {worldTile,minorSiteList,shipyardList} from './engine.js';
import {areaFor,areaSites,areaTile,branchGates,teleporterSite} from './exploration.js';
import {TOWNS,DUNGEONS} from './content.js';
import {WILD_SITES} from './wild-sites.js';
import {PUTRID_PALACE} from './royal-trials.js';
import {WORLD_WIDTH,WORLD_HEIGHT} from './world-size.js';
import {grantHornOfHelp} from './hero-help.js';
import {castleLockpickOdds} from './castle-interiors.js';
import {effectiveAttributes} from './attributes.js';
import {rareGearEffect} from './rare-gear.js';
import {itemById} from './items.js';
import {advanceClock} from './world-clock.js';

const cache=new Map();
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
const definitions=[
 {type:'abandoned-camp',name:'Abandoned camp',hidden:false,description:'Cold ashes, a torn bedroll and a weathered pack mark an old campsite.'},
 {type:'hollow-tree',name:'Hollow tree',hidden:true,description:'A narrow opening beneath the roots is just large enough to hide a small cache.'},
 {type:'standing-stones',name:'Standing stones',hidden:false,description:'Weathered stones stand in a ring. Faint words remain beneath the moss.'},
];
const hero={type:'hero-remains',name:'Boulder pile',hidden:true,description:'Loose boulders conceal a dark hollow. Something pale lies beneath them.'};
const ruins={type:'burned-village',name:'Burned village ruins',hidden:false,description:'A dragon burned this village centuries ago. Blackened foundations and a broken chimney stand among the weeds.'};
const ruinId='discovery-r1-burned-village';
export function discoveryChestOdds(s){return castleLockpickOdds(s,{lockLevel:110},effectiveAttributes(s,itemById).dexterity);}

// Cache only stable geometry. Discovery and search state always come from the save.
export function wildernessDiscoverySites(s){
 const area=areaFor(s);
 if(area?.kind==='planet'||s.dungeon?.ship||!Number.isInteger(s.region)||s.region<0||s.region>3)return [];
 const land=area?'w'+area.id.slice(5):'r'+s.region;
 if(!cache.has(land)){
  const tile=(x,y)=>area?areaTile(s,x,y):worldTile(s.region,x,y);
  const landmarks=[...(area?areaSites(s):[...TOWNS,...DUNGEONS,...WILD_SITES,PUTRID_PALACE,...branchGates(s.region),teleporterSite(s.region)].filter(p=>p.region===s.region)),...minorSiteList(s),...shipyardList(s)];
  const start=area?areaSites(s).find(p=>p.kind==='returnGate'):{x:64,y:48};
  const queue=[start],seen=new Set(),ground=[];
  for(let i=0;i<queue.length;i++){
   const {x,y}=queue[i],key=x+','+y;
   if(x<1||y<1||x>=WORLD_WIDTH-1||y>=WORLD_HEIGHT-1||seen.has(key))continue;
   seen.add(key);
   const terrain=tile(x,y);if(['water','mountain'].includes(terrain))continue;
   if(!['road','bridge'].includes(terrain)&&landmarks.every(p=>Math.abs(p.x-x)+Math.abs(p.y-y)>3))ground.push({x,y});
   for(const [dx,dy]of directions)queue.push({x:x+dx,y:y+dy});
  }
  const types=land==='r0'?[hero,...definitions]:land==='r1'?[...definitions,ruins]:definitions;
  const targets=land==='r0'?[[TOWNS[0].x+12,TOWNS[0].y+4],[34,35],[92,66],[52,76]]:[[34,35],[92,66],[52,76],[84,30]];
  const placed=[];
  for(const [i,definition]of types.entries()){
   const [tx,ty]=targets[i];
   const candidates=ground.filter(p=>placed.every(q=>Math.abs(p.x-q.x)+Math.abs(p.y-q.y)>8));
   candidates.sort((a,b)=>(Math.abs(a.x-tx)+Math.abs(a.y-ty))-(Math.abs(b.x-tx)+Math.abs(b.y-ty))||a.y-b.y||a.x-b.x);
   if(candidates[0])placed.push({...definition,...candidates[0],id:'discovery-'+land+'-'+definition.type,kind:'wildernessDiscovery',region:s.region,area:area?.id??null});
  }
  cache.set(land,placed);
 }
 return cache.get(land).map(site=>{
  const searched=!!s.flags.discoverySearched?.includes(site.id);
  const gold=site.type==='hero-remains'?75:site.type==='abandoned-camp'?12+s.region*8:site.type==='hollow-tree'?18+s.region*9:0;
  const meals=site.type==='abandoned-camp'?1:0;
  if(site.type==='burned-village'){
   const chestOpened=!!s.flags.discoveryChests?.includes(site.id);
   return {...site,discovered:!!s.flags.discoverySeen?.includes(site.id),searched,gold:0,meals:0,chestRevealed:searched,chestOpened,
    ...(searched?{chestOdds:discoveryChestOdds(s),chestRisk:'Difficult lock. Each attempt takes five game minutes. A failed attempt may spring a trap for 28–48 damage; Dexterity and lockpicking gloves improve your odds.'}:{}),
    result:chestOpened?'The buried chest is empty. You recovered its gold, three gems and the Crown of Charisma.':'Beneath a collapsed hearth you uncover a buried iron chest. Its difficult lock is still intact, and a concealed mechanism warns of a dangerous trap.'};
  }
  const result=site.type==='hero-remains'?"Beneath the boulders lies a hero’s skeleton pierced with orc arrows. You recover 75 gold and the Horn of Help. Its fallen owner can answer three calls.":site.type==='abandoned-camp'?`Inside the pack you find ${gold} gold and one hearty meal.`:site.type==='hollow-tree'?`A leather purse hidden beneath the roots holds ${gold} gold.`:'The inscription reads: “The road remembers courage. Search beyond the worn path, and honor those who walked before you.”';
  return {...site,name:searched&&site.type==='hero-remains'?'Hero’s remains':site.name,discovered:!!s.flags.discoverySeen?.includes(site.id),searched,gold,meals,result};
 });
}

export function wildernessDiscoveries(s){
 return wildernessDiscoverySites(s).filter(site=>!site.hidden||site.discovered||Math.abs(site.x-s.x)+Math.abs(site.y-s.y)<=2);
}

export function revealNearbyDiscoveries(s,note){
 if(s.mode!=='world')return;
 for(const site of wildernessDiscoverySites(s)){
  if(site.discovered||Math.abs(site.x-s.x)+Math.abs(site.y-s.y)>2)continue;
  s.flags.discoverySeen??=[];s.flags.discoverySeen.push(site.id);
  if(site.hidden)note(s,'Beyond the path, you notice '+site.name.toLowerCase()+'.');
 }
}

export function searchWildernessDiscovery(s,id,note){
 if(s.mode!=='world')return;
 const site=wildernessDiscoveries(s).find(p=>p.id===id&&p.x===s.x&&p.y===s.y);
 if(!site)return;
 if(site.searched){note(s,'You have already searched this place.');return;}
 s.flags.discoverySeen??=[];if(!s.flags.discoverySeen.includes(id))s.flags.discoverySeen.push(id);
 s.flags.discoverySearched??=[];s.flags.discoverySearched.push(id);
 s.gold+=site.gold;s.meals=Math.min(999,s.meals+site.meals);
 if(site.type==='hero-remains')grantHornOfHelp(s);
 s.turns++;note(s,site.result);
}

export function validDiscoveryState(s){
 const valid=id=>typeof id==='string'&&(/^discovery-(?:r[0-3]|w(?:[0-9]|1[01]))-(?:abandoned-camp|hollow-tree|standing-stones)$/.test(id)||id==='discovery-r0-hero-remains'||id===ruinId);
 return ['discoverySeen','discoverySearched','discoveryChests'].every(key=>s.flags[key]===undefined||Array.isArray(s.flags[key])&&s.flags[key].length<=50&&s.flags[key].every(key==='discoveryChests'?id=>id===ruinId:valid)&&new Set(s.flags[key]).size===s.flags[key].length);
}

export function robDiscoveryChest(s,id,{random,note,events}){
 if(s.mode!=='world'||id!==ruinId)return;
 const site=wildernessDiscoveries(s).find(p=>p.id===id&&p.x===s.x&&p.y===s.y);
 if(!site?.chestRevealed||site.chestOpened)return;
 s.turns++;advanceClock(s,6250); // Five game minutes at the existing clock scale.
 if(random()*100>=discoveryChestOdds(s).chance){
  note(s,'The difficult lock resists your picks. Five game minutes pass.');
  const disarm=Math.min(.95,effectiveAttributes(s,itemById).dexterity/100+rareGearEffect(s,'disarmBonus'));
  if(random()<disarm){note(s,'You catch the trap mechanism before it springs. The chest remains locked.');return;}
  const damage=28+Math.floor(random()*21);s.hp=Math.max(0,s.hp-damage);
  events.push({kind:'hit',target:'hero',amount:damage,hpAfter:s.hp,sound:'hurt'});
  note(s,'A rusted spring trap snaps from the chest! You take '+damage+' damage.');
  return s.hp===0?'defeated':undefined;
 }
 const gold=100+Math.floor(random()*201),gems=['small-emerald','small-pearl','medium-sapphire','medium-emerald','small-diamond'];
 const loot=Array.from({length:3},()=>gems[Math.floor(random()*gems.length)]);
 loot.push('crown-of-charisma');
 s.flags.discoveryChests??=[];s.flags.discoveryChests.push(id);
 s.gold+=gold;s.bag.push(...loot);
 note(s,'The lock yields. You recover '+gold+' gold, three gems and the Crown of Charisma.');
}
