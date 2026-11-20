import {scaleWorldPoint} from './world-size.js';

export const PELAGIOS_TOWER_ID='city-of-pelagios';
export const PELAGIOS_FLOORS=12;
export const SCORNRAVEN_ID='scornraven';
export const PELAGIOS_BOSS_AT={x:13,y:3};
export const PELAGIOS_FLOOR_NAMES=[
 'The Shattered Gatehouse','The Receiving Courts','The Servants’ Galleries',
 'The Alabaster Ballroom','The Lords’ Exercise Hall','The Moon-Bath Apartments',
 'The Broken Library','The Astronomers’ Gallery','The Hall of Stained Stars',
 'The Sealed War Rooms','The Black-Rune Sanctum','Scornraven’s Observatory',
];
export const PELAGIOS_TOWER_SITE=scaleWorldPoint({id:PELAGIOS_TOWER_ID,kind:'pelagiosTower',region:2,x:18,y:7,name:'Tower of Pelagios',index:4,description:'A twelve-level hexagonal palace of ruined alabaster, now occupied by goblins, orcs, and Scornraven.'});
export const pelagiosTowerSite=s=>s?.region===2&&!s?.exploration?.area?{...PELAGIOS_TOWER_SITE}:null;
export const pelagiosFloorName=floor=>PELAGIOS_FLOOR_NAMES[floor]??'';
export function validPelagiosTower(s){
 if(s?.flags?.scornravenDefeated!==undefined&&typeof s.flags.scornravenDefeated!=='boolean')return false;
 const d=s?.dungeon;
 if(s?.enemy?.speciesId===SCORNRAVEN_ID&&(d?.site!==PELAGIOS_TOWER_ID||d.floor!==PELAGIOS_FLOORS-1))return false;
 if(d?.site!==PELAGIOS_TOWER_ID)return true;
 return s.region===PELAGIOS_TOWER_SITE.region&&!s.exploration?.area&&d.index===PELAGIOS_TOWER_SITE.index&&!d.ship&&!d.royal&&!d.expedition&&d.floor>=0&&d.floor<PELAGIOS_FLOORS&&s.x===PELAGIOS_TOWER_SITE.x&&s.y===PELAGIOS_TOWER_SITE.y;
}
export function pelagiosEnemy(s,{boss=false,roll=0}={}){
 const floor=s.dungeon?.floor??0;
 if(boss){const hp=680;return {speciesId:SCORNRAVEN_ID,name:'Scornraven, Dark-Elf Wizard',kind:'caster',art:{sheet:'monsters-depth',index:10},level:34,hp,maxHp:hp,attack:48,armor:13,gold:420,xp:520,boss:true,storyHostile:true,magical:true,warded:true,weakness:'Holy and enchanted weapons; anti-magic wards',firstContact:true};}
 const groups=floor<3
  ?[{speciesId:'pelagios-goblin-looter',name:'Goblin Palace Looter',kind:'swift',art:{sheet:'dungeon-monsters',index:0}},{speciesId:'pelagios-goblin-archer',name:'Goblin Gallery Archer',kind:'ranged',art:{sheet:'dungeon-monsters',index:1}},{speciesId:'pelagios-lesser-orc',name:'Lesser Orc Barricade Guard',kind:'brute',art:{sheet:'dungeon-monsters',index:5}}]
  :floor<6?[{speciesId:'pelagios-orc-soldier',name:'Orc Court Soldier',kind:'brute',art:{sheet:'dungeon-monsters',index:5}},{speciesId:'pelagios-goblin-captain',name:'Goblin Captain',kind:'swift',art:{sheet:'dungeon-monsters',index:0}},{speciesId:'pelagios-guardian',name:'Corrupted Elven Guardian',kind:'armored',art:{sheet:'monsters-depth',index:1}}]
  :floor<9?[{speciesId:'pelagios-animated-armor',name:'Animated Elven Armor',kind:'armored',art:{sheet:'monsters-depth',index:1}},{speciesId:'pelagios-dark-spirit',name:'Dark Archive Spirit',kind:'spectral',undead:true,art:{sheet:'monsters-depth',index:6}},{speciesId:'pelagios-retainer',name:'Dark-Elf Retainer',kind:'caster',art:{sheet:'monsters-depth',index:10}}]
  :[{speciesId:'pelagios-elite-orc',name:'Elite Orc Sanctum Guard',kind:'brute',art:{sheet:'dungeon-monsters',index:5}},{speciesId:'pelagios-gargoyle',name:'Alabaster Gargoyle',kind:'armored',art:{sheet:'monsters-depth',index:7}},{speciesId:'pelagios-demon',name:'Scornraven’s Summoned Demon',kind:'caster',demon:true,art:{sheet:'monsters-depth',index:8}},{speciesId:'pelagios-retainer-elite',name:'Dark-Elf Retainer',kind:'caster',art:{sheet:'monsters-depth',index:10}}];
 const species=groups[Math.min(groups.length-1,Math.floor(roll*groups.length))],level=17+floor;
 const hp=105+floor*20;
 return {...species,level,hp,maxHp:hp,attack:20+floor*2,armor:4+Math.floor(floor*.7),gold:28+floor*6,xp:65+floor*12,weakness:species.kind==='armored'?'Crushing weapons':species.kind==='spectral'?'Holy and enchanted weapons':'Steady pressure',firstContact:true};
}
export function finishPelagiosEnemy(s,enemy,note=()=>{}){
 if(enemy?.speciesId!==SCORNRAVEN_ID)return false;
 if(!s.flags.scornravenDefeated){s.flags.scornravenDefeated=true;if(!s.bag.includes('scornraven-signet')){s.bag.push('scornraven-signet');s.pendingLoot?.unshift('scornraven-signet');}note('Scornraven falls. His obsidian signet unlocks the sealed legacy of Pelagios.');}
 return true;
}
export function scornravenTurn(enemy){
 enemy.combatRound=(enemy.combatRound||0)+1;
 if(enemy.warded){enemy.warded=false;enemy.wardTurns=2;return {kind:'ward',message:'Scornraven raises a violet ward that turns ordinary steel.'};}
 if(enemy.hp<=enemy.maxHp*2/3&&!enemy.summonedSpirit){enemy.summonedSpirit=true;enemy.spiritHp=80;return {kind:'summon',message:'Scornraven tears a dark spirit from the stained glass.'};}
 if(enemy.combatRound%4===0){enemy.darknessTurns=3;return {kind:'darkness',message:'Scornraven extinguishes the chamber beneath supernatural darkness.'};}
 if(enemy.darknessTurns>0)enemy.darknessTurns--;
 return {kind:'shadow',message:'Scornraven hurls a shadow bolt.',power:enemy.attack,mental:true,element:'psychic',sound:'psychic-crackle'};
}

const vertices=[[7,3],[19,3],[23,13],[19,23],[7,23],[3,13]];
const stairAt=floor=>vertices[floor%vertices.length];
const span=y=>{const distance=Math.abs(13-y),inset=Math.ceil(distance*5/11);return [2+inset,24-inset];};
const carve=(map,x1,y1,x2,y2)=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(x>=0&&y>=0&&x<27&&y<27)map[y][x]=0;};
const corridor=(map,a,b)=>{let [x,y]=a;map[y][x]=0;while(x!==b[0]){x+=Math.sign(b[0]-x);map[y][x]=0;}while(y!==b[1]){y+=Math.sign(b[1]-y);map[y][x]=0;}};

export function pelagiosTowerMap(d){
 const floor=Math.max(0,Math.min(PELAGIOS_FLOORS-1,d?.floor??0));
 const map=Array.from({length:27},()=>Array(27).fill(1));
 for(let y=2;y<=24;y++){const [left,right]=span(y);for(let x=left;x<=right;x++)map[y][x]=0;}
 // Six readable perimeter towers and their radial approaches.
 for(const [x,y] of vertices){carve(map,x-1,y-1,x+1,y+1);corridor(map,[x,y],[13,13]);}
 // A central open court and a broad circulation ring survive on every floor.
 carve(map,10,10,16,16);
 for(let x=7;x<=19;x++){map[7][x]=0;map[19][x]=0;}
 for(let y=7;y<=19;y++){map[y][7]=0;map[y][19]=0;}
 // Deterministic collapsed partitions create different routes without severing the plan.
 const offset=floor%4;
 for(let i=0;i<4;i++){
  const x=9+i*3,y=5+((i+offset)%4)*4;
  if(map[y]?.[x]===0&&!(x===13&&y===13))map[y][x]=1;
 }
 const entrance=[13,23],up=stairAt(floor+1),down=stairAt(floor);
 if(floor===0)map[entrance[1]][entrance[0]]=3;else map[down[1]][down[0]]=3;
 if(floor<PELAGIOS_FLOORS-1)map[up[1]][up[0]]=2;
 return map;
}
