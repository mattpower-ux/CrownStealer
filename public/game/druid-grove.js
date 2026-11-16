import {DAY_MS, worldTimeMs} from './world-clock.js';

export const DRUID_SITE='druid-grove';
export const DRUID_FLOORS=8;
export const DRUID_STAFF='druid-staff-of-taming';
export const DRUID_SHIELD='druid-oaken-shield';
export const ROOTING_POTION='druid-rooting-potion';
const circlePattern=/^discovery-(r[0-3]|w(?:[0-9]|1[01]))-standing-stones$/;
const names=['Herne the Hunter','Cairn, Keeper of Cinders','Neris of the Flood','Veyra of the Hollow Wind','Bramble King','Lady of the Reedbed','The Fox of Frost','Orrin Ashbranch','Mira the Lantern Druid','Flint of the Buried Oak','Tarn the Bog Shepherd','The Bone Orchard Keeper','Mistress of the High Boughs','Morwen Rootwhisper','The Last Green Seer','Alder, Warden of Rain'];
const treasures=['bronze-dagger','willow-crown','woad','druid-staff-of-taming','druid-rooting-potion'];
const item=(id,name,kind,shape,description,extra={})=>({id,name,kind,shape,description,rarity:'rare',color:'#a3af65',minLevel:1,value:35,unique:true,notForSale:true,...extra});
export const DRUID_ITEMS={
 'bronze-dagger':item('bronze-dagger','Druidic Bronze Dagger','weapon','dagger','A leaf-shaped blade cast from ancient bronze.',{family:'dagger',damage:[7,12],toHit:4}),
 'willow-crown':item('willow-crown','Crown of Willow','head','crown','Fresh willow shoots grow from a circlet of woven reeds.',{protection:2,attributeBoost:{wisdom:1}}),
 woad:item('woad','Clay Pot of Woad','potion','potion','Paint your skin with the blue markings of the grove.'),
 [DRUID_STAFF]:item(DRUID_STAFF,'Druid’s Staff of Taming','weapon','wand','Equip the staff and choose Tame animal to end a fight with a wild animal peacefully.',{family:'staff',damage:[6,10],toHit:4}),
 [ROOTING_POTION]:item(ROOTING_POTION,'Potion of Rooting','potion','potion','Become a rooted tree for ten game minutes.'),
 [DRUID_SHIELD]:item(DRUID_SHIELD,'Oaken Shield','shield','shield','Protects completely against fire and absorbs 5 damage from magic.',{protection:3,rarity:'legendary'})
};
function groveNumber(id){
 const part=circlePattern.exec(id)?.[1];
 return part?Number(part.slice(1))+(part[0]==='w'?4:0):null;
}
export function druidKeeper(id){return names[groveNumber(id)]||names[0];}
export function druidHistory(s,id){return s.flags.druidCircles?.[id];}
export function druidOffering(s,site,choice,{random,note}){
 if(s.mode!=='world'||choice!=='blood'&&choice!=='gold'||groveNumber(site?.id)==null||site.x!==s.x||site.y!==s.y)return;
 const id=site.id,circles=s.flags.druidCircles??={},prior=circles[id],now=worldTimeMs(s);
 if(prior&&now<prior.offeredAt+DAY_MS){note(s,'The circle answers only once every 24 game hours.');return;}
 if(choice==='gold'&&s.gold<10){note(s,'You need 10 gold for an offering.');return;}
 if(choice==='gold')s.gold-=10;
 else s.hp=Math.max(1,s.hp-5);
 const roll=choice==='blood'?random():1;
 const result=choice==='gold'?'gold':roll<1/3?'open':roll<2/3?'groan':'warning';
 circles[id]={...prior,offeredAt:now,opened:prior?.opened===true||result==='open',result};
 note(s,result==='open'?'The stone slab slides aside. A stairway descends into the roots.':result==='groan'?'A groan rises from far below. The slab stays shut.':result==='gold'?'The coins sink into the moss. A whisper answers: “The roots remember an honest traveler.”':druidKeeper(id)+' appears. “Be gone from here, you fool. You have annoyed the gods.”');
}
export function enterDruidGrove(s,site,index,note){
 if(s.mode!=='world'||!site||site.x!==s.x||site.y!==s.y||!druidHistory(s,site.id)?.opened)return false;
 s.mode=s.returnMode='dungeon';s.location=null;
 s.dungeon={site:DRUID_SITE,index,floor:0,x:1,y:1,dir:1,circleId:site.id};
 note(s,'You descend beneath the standing stones. Gnarled roots bear the symbols of the old gods.');return true;
}
export function druidMapIndex(d){return 120+groveNumber(d.circleId);}
export function druidChests(s,map){
 const d=s.dungeon,depth=d.floor,seed=groveNumber(d.circleId);
 const places=map.flatMap((row,y)=>row.flatMap((tile,x)=>tile===0?[{x,y}]:[]));
 const point=places[(depth*17+seed*13+11)%places.length];
 const id='druid:'+d.circleId+':'+depth;
 const treasure=treasures[(depth+seed)%treasures.length];
 const themed=seed&&depth===7?['willow-crown','woad','druid-rooting-potion'][seed%3]:treasure;
 return [{...point,id,item:themed,items:[themed],rarity:'rare',gold:7+depth*3,opened:!!s.openedChests?.includes(id)}];
}
export function druidKeeperAt(s){
 const d=s.dungeon;
 return s.mode==='dungeon'&&d?.site===DRUID_SITE&&d.floor===DRUID_FLOORS-1&&d.x===13&&d.y===13&&!druidHistory(s,d.circleId)?.resolved;
}
export function startDruidEnemy(s,boss,note){
 const d=s.dungeon;
 const name=boss?druidKeeper(d.circleId):['Earth Elemental','River Elemental','Air Elemental'][(d.floor+groveNumber(d.circleId))%3];
 const level=3+d.floor+s.region*3;
 const hp=boss?110+level*8:35+level*7;
 const profile=boss?keeperProfile(d.circleId):null;
 s.enemy={name,speciesId:boss?'druid-keeper':'druid-elemental',kind:profile?.kind||'armored',level,hp,maxHp:hp,attack:boss?18+3*level:6+level,armor:2,gold:level,xp:12+level*4,weakness:'steady pressure',boss,combatDistance:1,surpriseShotsRemaining:0,art:{sheet:'monsters-depth',index:boss?4:[2,5,7][d.floor%3]},...(profile?{element:profile.element,druidSwarm:profile.bypassesArmor}:{})};

 s.mode='battle';s.returnMode='dungeon';s.flags.guarded=false;s.flags.combo=0;
 note(s,boss?name+' '+profile.opening:name+' rises from the roots to bar your way.');
}
export function finishDruidEnemy(s,note){
 if(s.dungeon?.site!==DRUID_SITE||!['druid-keeper','druid-elemental'].includes(s.enemy?.speciesId))return false;
 const {circleId,floor}=s.dungeon,c=druidHistory(s,circleId);
 if(s.enemy.boss)c.resolved='defeated';
 else{c.cleared??=[];if(!c.cleared.includes(floor))c.cleared.push(floor);}

 s.gold+=s.enemy.gold;
 note(s,s.enemy.name+' falls. The roots grow still.');
 s.enemy=null;s.mode='dungeon';return true;
}
export function druidAnswer(s,answer,note){
 if(!druidKeeperAt(s))return;
 const {circleId}=s.dungeon;
 if(answer==='defiant'){startDruidEnemy(s,true,note);return;}
 if(answer!=='honest')return;
 druidHistory(s,circleId).resolved='peace';
 const n=groveNumber(circleId);
 const id=n?treasures[(n-1)%treasures.length]:DRUID_SHIELD;
 if(!s.bag.includes(id)){s.bag.push(id);s.pendingLoot.push(id);}
 note(s,druidKeeper(circleId)+' accepts your answer and gives you '+DRUID_ITEMS[id].name+'.');
}
export function rootActive(s){return (s.flags?.druidRootedUntil||0)>worldTimeMs(s);}
export function rootTraveler(s){s.flags.druidRootedUntil=worldTimeMs(s)+600000;}
export function validDruidDungeon(s){
 return s.dungeon?.site===DRUID_SITE&&groveNumber(s.dungeon.circleId)!=null&&druidHistory(s,s.dungeon.circleId)?.opened===true&&!s.dungeon.royal&&!s.dungeon.ship&&!s.dungeon.expedition;
}


const bossProfiles=[
 {kind:'caster',bypassesArmor:true,opening:'summons a swarm of stinging insects!'},
 {kind:'brute',element:'fire',opening:'coats his fists in blazing cinders!'},
 {kind:'spectral',element:'frost',opening:'raises a wave of freezing water!'},
 {kind:'caster',element:'magic',opening:'calls down a blade of wind!'},
 {kind:'armored',element:'poison',opening:'lashes out with thorny vines!'}
];
function keeperProfile(id){
 const n=groveNumber(id);
 return bossProfiles[n===0?0:1+(n-1)%4];
}

export function validDruidChestId(id){
 const match=/^druid:(.+):([0-7])$/.exec(id);
 return !!match&&groveNumber(match[1])!==null;
}
export function validDruidProgress(s){
 const {druidCircles,druidRootedUntil}=s.flags;
 if(druidRootedUntil!==undefined&&(!Number.isSafeInteger(druidRootedUntil)||druidRootedUntil<0||druidRootedUntil>worldTimeMs(s)+600000))return false;
 if(druidCircles===undefined)return true;
 if(!druidCircles||typeof druidCircles!=='object'||Array.isArray(druidCircles))return false;
 return Object.entries(druidCircles).every(([id,progress])=>groveNumber(id)!==null&&progress&&typeof progress.opened==='boolean'&&Number.isSafeInteger(progress.offeredAt)&&progress.offeredAt>=0&&progress.offeredAt<=worldTimeMs(s)&&['gold','open','groan','warning'].includes(progress.result)&&(progress.resolved===undefined||['peace','defeated'].includes(progress.resolved))&&(progress.cleared===undefined||Array.isArray(progress.cleared)&&progress.cleared.length<=7&&progress.cleared.every(floor=>Number.isInteger(floor)&&floor>=0&&floor<7)));
}
