export const HAUNTED_SHIPYARD_ID='haunted-shipyard';
export const HAUNTED_SHIPYARD_AREA='wild-6';
export const HAUNTED_SHIPYARD_FLOORS=10;

const directions=[[0,-1],[1,0],[0,1],[-1,0]];
const mapCache=new Map();

export function hauntedShipyardMap(floor){
 if(!Number.isInteger(floor)||floor<0||floor>=HAUNTED_SHIPYARD_FLOORS)throw Error('Invalid Haunted Shipyard floor.');
 if(mapCache.has(floor))return mapCache.get(floor);
 const map=Array.from({length:15},()=>Array(15).fill(1));
 let seed=(0x51a7c0de+floor*0x9e3779b1)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const stack=[[1,1]];map[1][1]=0;
 while(stack.length){
  const [x,y]=stack.at(-1),options=directions.filter(([dx,dy])=>{const nx=x+dx*2,ny=y+dy*2;return nx>0&&ny>0&&nx<14&&ny<14&&map[ny][nx]===1;});
  if(!options.length){stack.pop();continue;}
  const [dx,dy]=options[Math.floor(random()*options.length)];
  map[y+dy][x+dx]=0;map[y+dy*2][x+dx*2]=0;stack.push([x+dx*2,y+dy*2]);
 }
 // Deeper levels contain increasingly broad drowned holds without breaking the maze perimeter.
 const chamber=3+(floor%3)*4;
 for(let y=chamber;y<=chamber+2;y++)for(let x=5;x<=9;x++)map[y][x]=0;
 map[1][1]=3;map[13][13]=2;mapCache.set(floor,map);return map;
}

export const isHauntedShipyardDungeon=d=>d?.site===HAUNTED_SHIPYARD_ID;
