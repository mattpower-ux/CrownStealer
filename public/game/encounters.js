import {GROVE_ENEMIES} from './wild-sites.js';
import {ENEMIES,DUNGEON_LEVELS,monsterStats} from './bestiary.js';
import {DUNGEONS} from './content.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const wildernessTarget=s=>clamp(1+s.region*2+Math.floor((s.level-1)*.5),1,24);
export function encounterPool(s){return s.mode==='dungeon'&&s.dungeon.site==='elf-village'?GROVE_ENEMIES:s.mode==='dungeon'?ENEMIES.filter(m=>m.dungeon===s.dungeon.index||m.legacyDungeon===s.dungeon.index):ENEMIES.filter(m=>m.wild&&m.region===s.region);}
export function buildEncounter(s,roll,boss=false,guard=false){
 if(guard)return {speciesId:'royal-pursuer',name:"King Malachi the Ineffable's Royal Guard",level:20,hp:320,maxHp:320,attack:45,armor:18,gold:170,xp:200,kind:'armored',weakness:'ember magic',boss:false,guard:true,firstContact:true};
 if(boss){const d=DUNGEONS[s.dungeon.index],level=DUNGEON_LEVELS[s.dungeon.index]+6;const stats={hp:60+level*8,attack:7+Math.floor(level*1.5),armor:Math.floor(level*.3),gold:80+level*7,xp:50+level*5};return {...stats,maxHp:stats.hp,name:d.boss,level,boss:true,guard:false,kind:'brute',weakness:'steady pressure',firstContact:true};}
 const pool=encounterPool(s),inDungeon=s.mode==='dungeon',target=wildernessTarget(s),last=s.flags?.lastSpecies;
 const weights=pool.map(m=>(inDungeon?1:1/(1+Math.abs(m.level-target))**2)*(m.id===last?.25:1));
 let ticket=clamp(roll,0,.999999)*weights.reduce((a,b)=>a+b,0),m=pool.at(-1);for(let i=0;i<pool.length;i++){ticket-=weights[i];if(ticket<0){m=pool[i];break;}}
 // Depth has an absolute difficulty; revisiting does not secretly scale a dungeon to the hero.
 const level=inDungeon?m.level+s.dungeon.floor*2:clamp(Math.round(m.level*.35+target*.65),1,26),stats=monsterStats(m,level);
 return {...stats,speciesId:m.id,name:m.name,level,maxHp:stats.hp,kind:m.kind,weakness:m.weakness,boss:false,guard:false,firstContact:true};
}
