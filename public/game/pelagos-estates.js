export const PELAGOS_ESTATE_NAMES=[
 'Ruined Estate of House Aelvaris',
 'Ruined Estate of House Caelith',
 'Ruined Estate of House Elarion',
 'Ruined Estate of House Ithilane',
 'Ruined Estate of House Loraeth',
 'Ruined Estate of House Myravel',
 'Ruined Estate of House Sylvaren',
 'Ruined Estate of House Vaelora',
];

const ESTATE_SLOTS=[1,4,7,10,13,16,19,22];
const ESTATE_INDEX=new Map(ESTATE_SLOTS.map((slot,index)=>['minor-r1-'+slot,index]));

export function estateDefinitionFor(site){
 const index=ESTATE_INDEX.get(site?.id);
 if(index===undefined||site?.region!==1||site?.area!==null)return null;
 return {name:PELAGOS_ESTATE_NAMES[index],floors:2+index%4};
}

export function isPelagosEstateSite(site){
 return Boolean(estateDefinitionFor(site))&&site.kind==='ruinedEstate';
}

export function isPelagosEstateDungeon(d){
 return d?.site==='minor-site'&&ESTATE_INDEX.has(d.minorId);
}

export function estateFloorRole(d){
 if(!isPelagosEstateDungeon(d)||!Number.isInteger(d.floor))return null;
 const index=ESTATE_INDEX.get(d.minorId),floors=2+index%4;
 if(d.floor<0||d.floor>=floors)return null;
 if(d.floor===0)return 'ground';
 return d.floor===floors-1?'cellar':'upper';
}

export function estateStairAnchors(d){
 return isPelagosEstateDungeon(d)?{entry:{x:1,y:1},destination:{x:13,y:13}}:null;
}

function carve(map,left,top,right,bottom){
 for(let y=Math.max(1,top);y<=Math.min(13,bottom);y++)for(let x=Math.max(1,left);x<=Math.min(13,right);x++)map[y][x]=0;
}

export function estateDungeonMap(d){
 const map=Array.from({length:15},()=>Array(15).fill(1)),role=estateFloorRole(d);
 if(!role)return map;
 const variant=(ESTATE_INDEX.get(d.minorId)+d.floor)%4;
 if(role==='cellar'){
  carve(map,1,1,4,4);carve(map,10,10,13,13);
  carve(map,2,3,12,5);carve(map,2,7,12,9);carve(map,2,11,12,13);
  carve(map,2,3,4,12);carve(map,7,3,9,12);carve(map,11,3,13,12);
  if(variant&1)carve(map,5,1,9,3);else carve(map,5,10,9,13);
 }else{
  carve(map,1,1,5,4);                 // entrance hall
  carve(map,4,4,10,10);               // great court or ballroom
  carve(map,9,2,13,7);                // gallery wing
  carve(map,2,9,8,13);                // baths or apartments
  carve(map,10,10,13,13);             // far stair chamber
  carve(map,3,3,12,5);carve(map,4,8,12,10); // two circulation routes
  if(variant===0)carve(map,1,6,5,9);
  if(variant===1)carve(map,7,1,10,4);
  if(variant===2)carve(map,9,7,13,10);
  if(variant===3)carve(map,5,10,10,13);
 }
 map[1][1]=3;map[13][13]=2;
 return map;
}

function openCells(map){
 const cells=[];
 for(let y=1;y<14;y++)for(let x=1;x<14;x++)if(map[y]?.[x]===0&&Math.abs(x-1)+Math.abs(y-1)>3&&Math.abs(x-13)+Math.abs(y-13)>2)cells.push({x,y});
 return cells;
}

const RESIDENTS={
 ground:[['Goblin Plunderer','goblin',false],['Orc Estate Reaver','orc',false],['Alabaster Guardian','construct',false]],
 upper:[['Orc Hallbreaker','orc',false],['Dark-Elf Retainer','dark-elf',false],['Stained-Glass Guardian','construct',false],['Goblin Relic Thief','goblin',false]],
 cellar:[['Goblin Cellarer','goblin',false],['Orc Cask Raider','orc',false],['Dark-Elf Vault Keeper','dark-elf',false],['Wine-Cellar Spirit','spirit',true]],
};

export function estateResidents(s,map){
 const d=s?.dungeon,role=estateFloorRole(d);if(!role)return [];
 const cells=openCells(map),pool=RESIDENTS[role],count=2+(ESTATE_INDEX.get(d.minorId)+d.floor)%3,defeated=s.flags?.minorResidentsDefeated||[];
 return Array.from({length:count},(_,slot)=>{const [name,kind,undead]=pool[(ESTATE_INDEX.get(d.minorId)+d.floor+slot)%pool.length],p=cells[Math.floor((slot+1)*cells.length/(count+1))];return {...p,id:`${d.minorId}:${d.floor}:${slot}`,name,kind,undead,level:8+d.floor*3+slot};}).filter(r=>!defeated.includes(r.id));
}

function rewardId(items,candidates){return candidates.find(id=>items[id])||null;}

export function estateContainers(s,map,items){
 const d=s?.dungeon,role=estateFloorRole(d);if(!role)return [];
 const cells=openCells(map),estate=ESTATE_INDEX.get(d.minorId),count=2+(estate+d.floor)%4,legacy=`minor:${d.minorId}:${d.floor}`;
 const pools={ground:['common-lesser-healing','small-emerald','common-ring-1'],upper:['rare-medium-healing','small-sapphire','rare-ring-2','rare-sword-2'],cellar:['epic-ultra-healing','large-sapphire','epic-necklace-3','epic-sword-3']},pool=pools[role];
 return Array.from({length:count},(_,slot)=>{
  const id=`${legacy}:${slot}`,item=rewardId(items,[pool[(estate+d.floor+slot)%pool.length],'small-diamond']),p=cells[Math.floor((slot+.6)*cells.length/count)],cellar=role==='cellar';
  return {...p,id,item,items:item?[item]:[],rarity:items[item]?.rarity||'common',gold:(cellar?110:role==='upper'?45:20)+estate*3+d.floor*7+slot*5,trap:false,architectural:true,opened:!!s.openedChests?.includes(id)||(slot===0&&!!s.openedChests?.includes(legacy))};
 });
}

export function estateSecretStash(s){
 const d=s?.dungeon;if(!d?.secretRoom||!isPelagosEstateDungeon(d))return [];
 const id=`minor:${d.minorId}:${d.floor}:secret-estate`,items=['rare-medium-healing','small-sapphire'];
 return [{...d.secretRoom,id,item:items[0],items,rarity:'rare',gold:75+d.floor*20,trap:false,architectural:true,opened:!!s.openedChests?.includes(id)}];
}
