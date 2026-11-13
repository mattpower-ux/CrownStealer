import {minorSiteDefinition} from './minor-sites.js';
import {effectiveAttributes} from './attributes.js';
import {TREASURE_ITEMS} from './treasure.js';
import {seeHiddenBonus} from './see-hidden.js';

export function secretAlcove(d,map){
 const kobold=d.site==='minor-site'&&['koboldCave','cemetery'].includes(minorSiteDefinition(d.minorId)?.kind);
 if(d.royal||d.ship||d.expedition||d.site&&!kobold||!kobold&&(d.floor+1)%5!==0)return null;
 if(d.secretRoom)return d.secretRoom;
 const cells=[];
 // Preserve the original even-grid choice for existing main-dungeon saves.
 for(let y=kobold?1:2;y<14-(kobold?0:1);y+=kobold?1:2)for(let x=kobold?1:2;x<14-(kobold?0:1);x+=kobold?1:2){
  if(map[y]?.[x]!==1)continue;
  const open=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>map[y+dy]?.[x+dx]!==undefined&&map[y+dy][x+dx]!==1).length;
  if(open===1)cells.push({x,y});
 }
 return cells.length?cells[((d.index||0)*11+d.floor*7)%cells.length]:null;
}
export function secretMap(d,map){if(!d.secretRoom)return map;const copy=map.map(row=>[...row]);copy[d.secretRoom.y][d.secretRoom.x]=0;return copy;}
export function secretRoomKey(d){
 if(d.royal||d.ship||d.expedition||d.site&&d.site!=='minor-site'||d.site==='minor-site'&&!['koboldCave','cemetery'].includes(minorSiteDefinition(d.minorId)?.kind))return null;
 return (d.site==='minor-site'?'minor:'+d.minorId:d.index)+':'+d.floor;
}
export function secretDungeonForKey(key){
 const normal=/^([0-7]):([0-9]{1,2})$/.exec(key);
 if(normal)return {index:Number(normal[1]),floor:Number(normal[2])};
 const minor=/^minor:(minor-(?:r[0-3]|w(?:[0-9]|1[01]))-\d+):([0-2])$/.exec(key);
 const site=minor&&minorSiteDefinition(minor[1]);
 return ['koboldCave','cemetery'].includes(site?.kind)&&Number(minor[2])<site.floors?{site:'minor-site',minorId:site.id,index:site.index,floor:Number(minor[2])}:null;
}
// Read equipped attribute bonuses only when calculating a check. Importing the
// full items module here makes its eager weapon registry run before treasure
// has initialized when treasure itself is the application's entry point.
export function seeHiddenChance(s){return Math.min(.95,.10+effectiveAttributes(s,id=>TREASURE_ITEMS[id]).intelligence*.01+seeHiddenBonus(s));}
export function hiddenSecretNearby(s,map){
 if(s.mode!=='dungeon'||!s.dungeon||s.dungeon.secretRoom)return null;
 const room=secretAlcove(s.dungeon,map);
 return room&&Math.abs(room.x-s.dungeon.x)+Math.abs(room.y-s.dungeon.y)===1?room:null;
}
export function revealSecretRoom(s,room){
 s.dungeon.secretRoom={...room};s.flags['secretRoom:'+secretRoomKey(s.dungeon)]={...room};
}
export function secretStash(s){
 const d=s.dungeon;
 if(!d?.secretRoom||d.site!=='minor-site')return [];
 const site=minorSiteDefinition(d.minorId);if(!['koboldCave','cemetery'].includes(site?.kind))return [];
 if(site.kind==='cemetery'){const id=secretRoomKey(d)+':secret',items=['rare-ring-'+Math.min(3,site.region+1),'small-diamond'];return [{...d.secretRoom,id,item:items[0],items,rarity:'rare',gold:120+site.region*50,trap:false,sarcophagus:true,opened:!!s.openedChests?.includes(id)}];}
 const id=secretRoomKey(d)+':secret',items=['common-lesser-healing',['small-emerald','small-pearl','small-sapphire'][site.seed%3]];
 return [{...d.secretRoom,id,item:items[0],items,rarity:'common',gold:25+site.region*10,trap:true,opened:!!s.openedChests?.includes(id)}];
}
