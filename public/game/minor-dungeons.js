import {MONSTER_BY_ID,monsterStats} from './bestiary.js';
import {minorSiteDefinition} from './minor-sites.js';
import {shrineForDungeon,charityPitMap} from './shrine-deities.js';

const guardians={
  koboldCave:{id:'grove-goblin',name:'Kobold Cave Watcher',kind:'swift',weakness:'quick strikes',art:{sheet:'monsters-grove',index:0}},
  ruinedShrine:{...MONSTER_BY_ID['bell-gargoyle'],name:'Shrine Gargoyle'},
  cemetery:{...MONSTER_BY_ID['depth-0-skeleton-warrior'],name:'Cemetery Skeleton'},
};
const gearKinds=new Set(['weapon','armor','ring','necklace','shield','head','hands','boots']);

// The waypoints double as room centers. A zero-sized room leaves a corridor bend.
const layouts={
  koboldCave:offset=>[[1,1],[4,3,1,1],[5,8+offset,1,1],[10,10],[13,13,1,1]],
  ruinedShrine:offset=>[[1,1],[7+offset,3,2,1],[7+offset,8,2,2],[11,10],[13,13,1,1]],
  cemetery:offset=>[[1,1],[3,4+offset,1,2],[10,7+offset,2,1],[11,11],[13,13,1,1]],
  tunnel:offset=>[[1,1],[4+offset,4],[10,9+offset],[13,13]],
};

function definitionFor(d) {
  if(d?.site!=='minor-site')return null;
  const site=minorSiteDefinition(d.minorId);
  return site&&Number.isInteger(d.floor)&&d.floor>=0&&d.floor<site.floors?site:null;
}

export function minorDungeonMap(d) {
  if(d.charityPit)return charityPitMap();
  const map=Array.from({length:15},()=>Array(15).fill(1));
  const site=definitionFor(d);
  if(!site)return map;

  const offset=(Math.floor(site.seed/3)+d.floor)%3;
  const transpose=(site.seed+d.floor)%2===1;
  const rooms=layouts[site.kind](offset);
  const carve=(left,top,right,bottom)=>{
    for(let y=top;y<=Math.min(13,bottom);y++)for(let x=left;x<=Math.min(13,right);x++){
      if(transpose)map[x][y]=0;
      else map[y][x]=0;
    }
  };
  for(const [i,[x,y,w=0,h=0]] of rooms.entries()){
    carve(x-w,y-h,x+w,y+h);
    if(i===0)continue;
    const [fromX,fromY]=rooms[i-1];
    carve(fromX,fromY,x,fromY);
    carve(x,fromY,x,y);
  }
  if(site.kind==='koboldCave'){
    // Expand around the old paths rather than replacing them: an adventurer saved
    // anywhere in the earlier burrow still loads onto connected, walkable ground.
    // Overlapping rounded chambers create wide, short necks instead of a maze.
    const chambers=[
      [3.3,3.1,3.25,2.8+offset*.15],
      [6.6+offset*.35,7.1,3.8,3.8],
      [10.8,10.9,3.2+offset*.1,3.3],
    ];
    for(let y=1;y<=13;y++)for(let x=1;x<=13;x++){
      if(chambers.some(([cx,cy,rx,ry])=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1))carve(x,y,x,y);
    }
  }
  // Open a broad ceremonial room without removing any old walkable tiles.
  if(site.kind==='ruinedShrine')for(let y=4;y<=11;y++)for(let x=3;x<=11;x++)map[y][x]=0;
  map[1][1]=3;
  map[13][13]=2;
  return map;
}

export function minorDungeonChests(s,items) {
  if(s.dungeon?.charityPit)return [];
  const d=s.dungeon,site=definitionFor(d);
  if(!site||d.floor!==site.floors-1||(!site.treasure&&!site.trapped))return [];

  const id=`minor:${site.id}:${d.floor}`;
  const found=[];
  let gold=0;
  if(site.treasure){
    let seed=((s.treasureSeed??187441)^Math.imul(site.seed+1,0x9e3779b1)^d.floor)>>>0;
    const roll=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const choose=pool=>pool[Math.floor(roll()*pool.length)];
    const tier=Math.min(3,site.region+1);
    const gear=Object.values(items).filter(item=>gearKinds.has(item.kind)&&item.tier===tier&&
      !item.unique&&!item.encounterOnly&&!item.bottomOnly&&!item.alien&&!item.elven&&!item.lowLoot&&!item.minLevel);
    const rarity=roll()<.3?'rare':'common';
    const primary=choose(gear.filter(item=>item.rarity===rarity).sort((a,b)=>a.id.localeCompare(b.id)));
    if(primary)found.push(primary.id);
    const gems=['small-emerald','small-pearl','small-sapphire','small-diamond'].filter(id=>items[id]);
    if(!primary||roll()<.35){
      const gem=choose(gems);
      if(gem)found.push(gem);
    }
    gold=20+site.region*12+d.floor*5+Math.floor(roll()*16);
  }
  const deity=shrineForDungeon(d);
  if(site.treasure&&deity?.loot){const gifts=deity.loot.filter(id=>items[id]);if(gifts.length)found.splice(0,found.length,...gifts);}
  return [{
    id,x:13,y:13,item:found[0]??null,items:found,rarity:items[found[0]]?.rarity??'common',
    gold,trap:site.trapped,opened:s.openedChests?.includes(id)??false,
  }];
}

export function minorGuardian(s) {
  const d=s.dungeon,site=definitionFor(d);
  if(!site?.guarded||d.floor!==site.floors-1)return null;
  const species=shrineForDungeon(d)?.guardian||guardians[site.kind];
  const level=[2,7,13,20][site.region]+d.floor;
  const stats=monsterStats(species,level);
  return {
    ...stats,speciesId:species.id,name:species.name,art:species.art,kind:species.kind,
    weakness:species.weakness,undead:!!species.undead,level,maxHp:stats.hp,
    firstContact:true,minorGuardian:site.id,
  };
}
