export const DAY_STEPS=240;
export const WILD_SITES=[
 ...Array.from({length:4},(_,region)=>[...(region<3?[{id:`east-gate-${region}`,kind:"gate",region,x:30,y:12,target:region+1,name:"Eastern border gate"}]:[]),...(region>0?[{id:`west-gate-${region}`,kind:"gate",region,x:1,y:12,target:region-1,name:"Western border gate"}]:[])]).flat(),
 {id:'dragon-bones',kind:'dragon',region:0,x:28,y:19,name:'Ancient dragon bones'},
 {id:'wayside-fountain',kind:'fountain',region:0,x:14,y:9,name:'Wayside Fountain'},
 {id:'elf-village',kind:'forest',region:0,x:7,y:17,name:'Ruined tree fort',description:'Beyond the broken ladder lies an abandoned elven village. Goblin footprints cross the moss; immense webs hang between its empty homes.'}
];
export const gameDay=s=>Math.floor(s.turns/DAY_STEPS);
export function forestMap(floor=0){const m=Array.from({length:15},()=>Array(15).fill(1));for(let y=1;y<14;y++)for(let x=1;x<14;x++)if([1,4,7,10,13].includes(x)||[1,4,7,10,13].includes(y)||x>=6&&x<=8&&y>=6&&y<=8)m[y][x]=0;if(floor===3)for(let y=5;y<=9;y++)for(let x=5;x<=9;x++)m[y][x]=0;m[1][1]=3;return m;}
export const GROVE_ENEMIES=[
 ['grove-goblin','Grove Goblin',2,'swift',0],['goblin-looter','Goblin Relic Looter',3,'brute',0],['goblin-wardbreaker','Goblin Wardbreaker',4,'armored',0],
 ['giant-grove-spider','Giant Grove Spider',2,'swift',1],['silverweb-spider','Silverweb Spider',3,'swift',1],['elder-webmother','Elder Webmother',5,'brute',1]
].map(([id,name,level,kind,index])=>({id,name,level,kind,weakness:kind==='swift'?'quick strikes':kind==='armored'?'ember magic':'steady pressure',art:{sheet:'monsters-grove',index}}));

export function mountainTile(region,x,y){return [[5,3],[25,3],[25,21]].some(([cx,cy],i)=>{cx+=(region%2)*(i===1?-2:1);return Math.abs(x-cx)+Math.abs(y-cy)<=2;});}
