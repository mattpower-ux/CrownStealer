import {DAY_MS,expireBuffs} from './world-clock.js';

export const ROADSIDE_CRYPT='roadside-crypt';
export const ROLAND_CAVE='north-sea-cave';
export const ROLAND_ISLE='north-sea-exile';
export const ROLAND_AMULET='sir-roland-amulet';
export const AVENGER_SWORD='sword-of-the-avenger';
export const ROLAND_REBUKE='Thou hast been naughty in our sight, and naughtiness is only cured with a firm hand and an empty stomach!';
export const ROLAND_ISLAND={id:ROLAND_ISLE,name:'North Sea Exile',region:3,kind:'exile'};
export const ROLAND_LANDMARKS=[
 {id:ROLAND_CAVE,name:'Icebound Cave',kind:'rolandCave',x:64,y:42},
 {id:'exile-shore',name:'Fishing shore',kind:'rolandShore',x:64,y:61},
 {id:'exile-passage',name:'Open sea',kind:'rolandPassage',x:64,y:88}
];
export const ROLAND_ITEMS={
 [ROLAND_AMULET]:{id:ROLAND_AMULET,name:'Amulet of Sir Roland',kind:'necklace',shape:'necklace',rarity:'rare',color:'#d0e5ed',value:0,unique:true,bottomOnly:true,notForSale:true,description:'Wear this amulet and call upon Sir Roland.'},
 [AVENGER_SWORD]:{id:AVENGER_SWORD,name:'Sword of the Avenger',kind:'weapon',family:'sword',shape:'sword',rarity:'legendary',tier:3,damage:[22,34],toHit:5,color:'#ffeac4',value:0,unique:true,bottomOnly:true,notForSale:true,description:'Sir Roland’s consecrated blade. Only a sworn Paladin may wield it. Deals double weapon damage to undead.'}
};
const floor=()=>Array.from({length:15},()=>Array(15).fill(1));
export function roadsideCryptMap(d){
 if(d?.rolandCell){
  const cell=floor();
  for(let y=7;y<=10;y++)for(let x=6;x<=8;x++)cell[y][x]=0;
  return cell;
 }
 const map=floor();
 for(let y=1;y<=10;y++)map[y][1]=0;
 for(let x=1;x<=11;x++)map[7][x]=0;
 for(let y=5;y<=11;y++)for(let x=6;x<=12;x++)map[y][x]=0;
 map[1][1]=3;return map;
}
export const rolandAltarNear=s=>s.mode==='dungeon'&&s.dungeon?.site===ROADSIDE_CRYPT&&!s.dungeon.rolandCell&&Math.abs(s.dungeon.x-9)+Math.abs(s.dungeon.y-7)<=1;
export const rolandCellActive=s=>s.mode==='dungeon'&&s.dungeon?.site===ROADSIDE_CRYPT&&s.dungeon.rolandCell;
export const rolandCaveActive=s=>s.mode==='dungeon'&&s.dungeon?.site===ROLAND_CAVE;
export const rolandIsleActive=s=>s.exploration?.area===ROLAND_ISLE;
export const rolandCanSummon=s=>['world','town','dungeon'].includes(s.mode)&&s.equippedNecklace===ROLAND_AMULET&&s.bag.includes(ROLAND_AMULET)&&!s.flags.rolandJudged;
export function rolandIslandTile(x,y){
 const coast=((x-64)/17)**2+((y-47)/14)**2;
 if(coast>1+.1*Math.sin(x*1.25+y*.47))return 'water';
 if(Math.abs(x-64)>5&&y<46&&(x*7+y*11)%5===0)return 'mountain';
 return 'grass';
}
const at=(s,mark)=>s.x===mark.x&&s.y===mark.y;
export const rolandFishingShore=s=>rolandIsleActive(s)&&s.mode==='world'&&at(s,ROLAND_LANDMARKS[1]);
const travelActions=new Set(['wizardTeleport','crystalTravel','dungeonElevator','travel']);
const travelItems=new Set(['scroll-return','scroll-teleport','pocket-teleporter','teleporter-crystal','dungeon-elevator','p-hopper','planet-scroll']);
export function rolandAction(s,a,note,percivalCastleSite){
 const d=s.dungeon,cell=rolandCellActive(s),isle=rolandIsleActive(s),exile=s.flags.rolandExile;
 if(a.type==='rolandCandles'){
  if(!rolandAltarNear(s)||s.flags.rolandJudged)return true;
  d.rolandCell=true;d.x=7;d.y=10;d.dir=0;delete d.secretRoom;
  s.hp=Math.max(1,s.hp-40);
  note(s,'The candles burn blue. The floor gives way, and you fall fifty feet into a sealed cell.');
  return true;
 }
 if(a.type==='rolandSearch'){
  if(!cell||s.flags.rolandSearched)return true;
  s.flags.rolandSearched=true;
  for(const id of [AVENGER_SWORD,ROLAND_AMULET,...(s.bag.includes('scroll-return')?[]:['scroll-return'])]){
   s.bag.push(id);s.pendingLoot.push(id);
  }
  note(s,'Thirty-one scratches mark the wall. The dead Paladin’s sword and amulet rest beside his bones.');
  return true;
 }
 if(a.type==='useItem'&&a.id===ROLAND_AMULET){
  if(rolandCanSummon(s)){s.flags.rolandAudience=true;note(s,`“${s.name}, you must choose between Right and Wrong now. Which path will you follow?”`);}
  return true;
 }
 if(a.type==='rolandDismiss'){delete s.flags.rolandAudience;return true;}
 if(a.type==='rolandChoice'){
  if(!s.flags.rolandAudience||!rolandCanSummon(s)||!['good','wrong'].includes(a.choice))return true;
  delete s.flags.rolandAudience;
  s.flags.rolandJudged=true;
  s.exploration??={artifacts:[]};
  s.mode=s.returnMode='world';s.dungeon=null;s.location=null;delete s.castle;s.enemy=null;
  if(a.choice==='good'){
   s.region=1;s.exploration.area=null;
   const castle=percivalCastleSite(s);s.x=castle.x;s.y=castle.y;
   note(s,'Sir Roland leaves you at Percival’s Lament. The vows of a Paladin await within.');
  }else{
   s.region=3;s.exploration.area=ROLAND_ISLE;s.x=64;s.y=52;
   s.flags.rolandExile={days:0,casts:0,boat:false,stride:false};
   s.flags.rolandRebuke=true;
   note(s,ROLAND_REBUKE);
  }
  return true;
 }
 if(a.type==='rolandAcknowledge'){delete s.flags.rolandRebuke;return true;}
 if(cell&&(a.type==='leave'||a.type==='descend'||a.type==='searchSecrets')){
  note(s,'The shaft is sheer and the cell has no door. A Scroll of Return can take you out.');
  return true;
 }
 const magicId=a.type==='useMagic'?s.equippedMagic:['useItem','alienUse'].includes(a.type)?a.id:null;
 if((cell||isle)&&(travelActions.has(a.type)||travelItems.has(magicId)&&!(magicId==='scroll-return'&&cell))){
  note(s,cell?'Only a Scroll of Return can escape the shaft.':'Sir Roland’s judgment binds you to the island. Find a way to sail out.');
  return true;
 }
 if(!isle||!exile)return false;
 if(rolandCaveActive(s)){
  if(a.type==='rolandPole'||a.type==='openChest'){
   if(d.x===9&&d.y===7&&!exile.pole){exile.pole=true;if(!s.bag.includes('fishing-pole')){s.bag.push('fishing-pole');s.pendingLoot.push('fishing-pole');}note(s,'Under the frozen lid, you find a fishing pole.');}
   return true;
  }
  if(a.type==='descend'||a.type==='engageGuardian')return true;
  return false;
 }
 if(s.mode!=='world')return false;
 if(a.type==='enter'){
  if(at(s,ROLAND_LANDMARKS[0])){
   s.dungeon={site:ROLAND_CAVE,index:6,floor:0,x:1,y:1,dir:2};
   s.mode=s.returnMode='dungeon';s.location=ROLAND_CAVE;note(s,'Ice crusts the passage. An old supply chest lies inside.');
  }else if(at(s,ROLAND_LANDMARKS[2])&&exile.boat){
   delete s.flags.rolandExile;delete s.flags.rolandRebuke;s.exploration.area=null;s.region=0;s.x=24;s.y=27;
   note(s,'After a long crossing, your little boat reaches the shore near Mothbridge.');
  }
  return true;
 }
 if(a.type==='rolandSurvive'){
  if(exile.days>=7||rolandIslandTile(s.x,s.y)==='water'||!['rat','roots'].includes(a.food))return true;
  exile.days++;s.worldTimeMs+=DAY_MS;expireBuffs(s);s.turns++;
  s.hp=Math.min(s.maxHp,s.hp+(a.food==='rat'?8:4));
  note(s,`You survive on ${a.food==='rat'?'frozen wharf rat':'grub roots'} and sleep in the cold. Day ${exile.days} of 7.`);
  return true;
 }
 if(a.type==='rolandFish'){
  if(!rolandFishingShore(s)||exile.days<7||!exile.pole||!s.bag.includes('fishing-pole')||exile.boat)return true;
  exile.casts++;s.worldTimeMs+=5*60000;s.turns++;
  if(exile.casts===5){exile.boat=true;note(s,'You reel in a little sailing rowboat snagged by its rigging. Sail south to open sea.');}
  else note(s,'You cast the line into the freezing water. Nothing yet.');
  return true;
 }
 if(a.type!=='move')return false;
 if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)return true;
 const x=s.x+a.dx,y=s.y+a.dy,tile=rolandIslandTile(x,y);
 if(x<1||x>126||y<1||y>94||tile==='mountain'||tile==='water'&&!exile.boat){
  note(s,'The frozen coast stops you. A boat is your only passage.');return true;
 }
 if(tile==='water'){
  exile.stride=!exile.stride;
  if(exile.stride){note(s,'The little boat creeps through the ice.');return true;}
 }
 s.x=x;s.y=y;s.turns++;return true;
}

export function validRolandState(s){
 const exile=s.flags.rolandExile,d=s.dungeon;
 if(d?.rolandCell!==undefined&&(d.site!==ROADSIDE_CRYPT||d.rolandCell!==true))return false;
 if(d?.site===ROLAND_CAVE&&(!rolandIsleActive(s)||d.index!==6||d.floor!==0||d.royal||d.ship||d.expedition))return false;
 return rolandIsleActive(s)
  ?s.region===3&&!!exile&&Number.isInteger(exile.days)&&exile.days>=0&&exile.days<=7&&Number.isInteger(exile.casts)&&exile.casts>=0&&exile.casts<=5&&exile.boat===(exile.casts===5)&&typeof exile.stride==='boolean'&&(exile.pole===undefined||exile.pole===true)
  :exile===undefined;
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
