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
