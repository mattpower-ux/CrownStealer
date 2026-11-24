const REVEAL_RADIUS = 4;

export function dungeonExplorationKey(d){
 return JSON.stringify([d.index,d.site,d.minorId,d.expedition,d.royal,d.floor,!!d.charityPit,!!d.ship]);
}

function tileKey(x,y){return x+','+y;}

export function revealTilesAround(d,map,radius=REVEAL_RADIUS){
 const tiles=new Set();
 if(!d||!map?.length)return tiles;
 for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){
  if(Math.hypot(x-d.x,y-d.y)<=radius)tiles.add(tileKey(x,y));
 }
 return tiles;
}

export function rememberDungeonExploration(s,map,radius=REVEAL_RADIUS){
 const d=s?.dungeon;
 if(!d)return;
 const known=s.flags.discoveredDungeonTiles??={};
 const key=dungeonExplorationKey(d);
 const tiles=new Set(known[key]||[]);
 for(const tile of revealTilesAround(d,map,radius))tiles.add(tile);
 known[key]=[...tiles];
}

export function revealedDungeonTiles(s,map,radius=REVEAL_RADIUS){
 const d=s?.dungeon;
 const tiles=new Set(s?.flags?.discoveredDungeonTiles?.[dungeonExplorationKey(d)]||[]);
 for(const tile of revealTilesAround(d,map,radius))tiles.add(tile);
 return tiles;
}
