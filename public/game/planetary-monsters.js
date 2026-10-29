// Shared planetary ecology: weaker species retire as the three-level expeditions deepen.
const roster=[
 ['tribble','Tribble',1,'swift',null,'nips with tiny alien teeth',0],
 ['blob','Blob',3,'brute','acid','splashes corrosive sludge',1],
 ['mutant-et','Mutant ET',5,'brute',null,'lurches forward with a zombie-like clawing attack',2],
 ['brainbot','Brainbot',8,'armored','electricity','unleashes an electrical brain surge',3],
 ['astronaut','Crazed Astronaut',11,'brute',null,'tries to hug you to death',4],
 ['hal','Hal 2000',20,'spectral','psychic','invades your mind with mental damage',5],
 ['agi-seven','AGI Seven',24,'spectral','electricity','declares organic humans vermin and fires a planetary purge pulse',6],
 ['rosie','Rosie the Riveter',28,'armored',null,'tries to iron you flat',7]
];
export const PLANET_SPECIES=roster.map(([key,name,level,kind,element,attackVerb,index])=>({id:'space-'+key,name,level,kind,element,attackVerb,planetary:true,planetBoss:index>=5,attackType:[3,5,6].includes(index)?'ranged':'melee',art:{sheet:'monsters-planets',index}}));
export const planetaryDungeon=d=>/^planet-[0-2]-cave-[0-2]$/.test(d?.expedition||'');
export function planetaryPool(d,all){const floor=Math.max(0,Math.min(2,d.floor)),ids=[['space-tribble','space-blob','space-mutant-et'],['space-blob','space-mutant-et','space-brainbot'],['space-mutant-et','space-brainbot','space-astronaut']][floor];return all.filter(m=>ids.includes(m.id));}
export function planetaryBoss(d,all){const [,planet,,cave]=d.expedition.split('-');const id=Number(cave)===2?['space-hal','space-agi-seven','space-rosie'][Number(planet)]:Number(cave)===0?'space-brainbot':'space-astronaut';const m=all.find(m=>m.id===id);return {...m,level:m.planetBoss?m.level:16+Number(cave)*2,name:m.planetBoss?m.name:Number(cave)===0?'Brainbot Overseer':'Crazed Astronaut Captain'};}
export function planetaryAttack(enemy){if(!enemy.speciesId?.startsWith('space-'))return null;const species=PLANET_SPECIES.find(m=>m.id===enemy.speciesId);if(!species)return null;let verb=species.attackVerb;
 if(enemy.speciesId==='space-rosie'){verb=['presses a sizzling iron against you','tries to scrub your skin off','spanks you for being naughty'][(enemy.attackIndex||0)%3];enemy.attackIndex=(enemy.attackIndex||0)+1;}
 return {verb,element:species.element,mental:species.element==='psychic'};
}
