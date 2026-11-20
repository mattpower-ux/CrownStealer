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
