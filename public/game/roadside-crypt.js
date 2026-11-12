export const ROADSIDE_CRYPT='roadside-crypt';
export function roadsideCryptMap(){
 const map=Array.from({length:15},()=>Array(15).fill(1));
 for(let y=1;y<=10;y++)map[y][1]=0;
 for(let x=1;x<=11;x++)map[7][x]=0;
 for(let y=5;y<=11;y++)for(let x=6;x<=12;x++)map[y][x]=0;
 map[1][1]=3;return map;
}
export function enterRoadsideCrypt(s){
 s.flags.cryptCount=(s.flags.cryptCount||0)+1;
 s.dungeon={site:ROADSIDE_CRYPT,index:s.region*2,floor:0,x:1,y:1,dir:2,cryptId:s.flags.cryptCount};
 s.mode=s.returnMode='dungeon';s.location=ROADSIDE_CRYPT;s.enemy=null;
}
export function cryptChest(s,items){
 const id=`crypt:${s.dungeon.cryptId}:0`,pool=Object.values(items).filter(i=>i.rarity==='rare'&&!i.unique&&!i.alien&&!i.elven&&i.kind!=='key'&&i.tier===1);
 const item=pool[(s.treasureSeed+s.dungeon.cryptId)%pool.length]?.id||'small-emerald';
 return {id,x:9,y:9,item,items:[item],rarity:items[item]?.rarity||'rare',gold:20+s.region*10,opened:!!s.openedChests?.includes(id)};
}
export function cryptGuardian(s){
 const level=Math.max(2,2+s.region*8+Math.floor(s.level*.4)),hp=24+level*12;
 return {speciesId:'crypt-skeleton',name:'Crypt Skeleton Guardian',level,hp,maxHp:hp,attack:4+level*2,armor:Math.floor(level/3),gold:level*2,xp:level*12,kind:'undead',weakness:'Fire and holy weapons',firstContact:true,cryptGuardian:s.dungeon.cryptId};
}
