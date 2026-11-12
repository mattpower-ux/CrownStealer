export const TWINKLESTAR_TOWER_ID='twinklestar-tower';
export const TWINKLESTAR_FLOORS=9;
export const TWINKLESTAR_ISLAND={area:'wild-10',region:3,x:87,y:58};
export function twinklestarTowerSite(s){
 return s.region===3&&s.exploration?.area===TWINKLESTAR_ISLAND.area?{...TWINKLESTAR_ISLAND,id:TWINKLESTAR_TOWER_ID,kind:'twinklestarTower',name:'Twinklestar Tower',index:6,boatOnly:true}:null;
}
export function twinklestarTowerMap(d){
 const map=Array.from({length:15},()=>Array(15).fill(1));
 const room=(x1,y1,x2,y2)=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)map[y][x]=0;};
 const shift=d.floor%3;
 room(1,1,4,1);room(3,1,3,4);room(2,3,5,5);
 room(4,4,10,4);room(9,2,12,5);room(11,4,11,8);
 room(6+shift,8,11,8);room(5+shift,7,8+shift,10);
 room(7+shift,9,7+shift,12);room(7+shift,12,13,12);room(11,11,13,13);
 map[1][1]=3;map[13][13]=2;return map;
}
export function twinklestarEnemy(s,{boss=false,roll=0}={}){
 const floor=s.dungeon?.floor??0,level=boss?28:18+floor;
 const kinds=[{speciesId:'twinklestar-wisp',name:'Tower Wisp',kind:'spectral',art:{sheet:'monsters-depth',index:2}},{speciesId:'twinklestar-sentinel',name:'Enchanted Sentinel',kind:'armored',art:{sheet:'monsters-depth',index:1}},{speciesId:'twinklestar-shade',name:'Twinklestar Shade',kind:'spectral',undead:true,art:{sheet:'monsters-depth',index:6}}];
 const species=boss?{speciesId:'twinklestar-jailer',name:'The White Wizard’s Jailer',kind:'spectral',art:{sheet:'monsters-depth',index:0}}:kinds[Math.min(2,Math.floor(roll*3))];
 const hp=boss?520:110+floor*18;
 return {...species,level,hp,maxHp:hp,attack:boss?44:21+floor*2,armor:boss?10:5+Math.floor(floor/2),gold:boss?250:30+floor*4,xp:boss?350:70+floor*10,weakness:boss?'Enchanted weapons and steady pressure':'Magic and enchanted weapons',firstContact:true,...(boss?{boss:true}:{})};
}
export function twinklestarGuardian(s){
 return s.dungeon?.site===TWINKLESTAR_TOWER_ID&&s.dungeon.floor===8&&!s.flags.twinklestarGuardianDefeated?twinklestarEnemy(s,{boss:true}):null;
}
export function validTwinklestarTower(s){
 if(s.flags.twinklestarGuardianDefeated!==undefined&&typeof s.flags.twinklestarGuardianDefeated!=='boolean')return false;
 if(s.dungeon?.site===TWINKLESTAR_TOWER_ID&&(s.region!==3||s.dungeon.index!==6||s.exploration?.area!=='wild-10'||s.dungeon.ship||s.dungeon.royal||s.dungeon.expedition))return false;
 if(s.enemy?.speciesId==='twinklestar-jailer'&&(s.dungeon?.site!==TWINKLESTAR_TOWER_ID||s.dungeon.floor!==8))return false;
 return true;
}
