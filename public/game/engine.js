import {merchantFor,canBuyMerchantSupply,isMerchantResaleItem} from './merchant-catalog.js';
import {stockForMerchant} from './merchant-inventory.js';
import {POISON_ITEMS,poisonDamage,spendPoisonRound,validWeaponCoating} from './weapon-poisons.js';
import {minorSites,minorSiteDefinition} from './minor-sites.js';
import {minorDungeonMap,minorGuardian} from './minor-dungeons.js';
import {rareGearEffect,randomEncounterMultiplier,randomLegendaryGearLoot} from './rare-gear.js';
import {WILDERNESS_EVENTS,WILDERNESS_EVENT_CHANCE,startWildernessEvent,wildernessEventAction,validateWildernessEvents} from './wilderness-events.js';
import {ROADSIDE_CRYPT,roadsideCryptMap,enterRoadsideCrypt,cryptGuardian} from './roadside-crypt.js';
import {WORLD_WIDTH,WORLD_HEIGHT,WORLD_MAP_VERSION,worldSize,migrateWorldSize} from './world-size.js';
import {landscapeTile} from './wilderness-landscape.js';
import {halAction,prepareHal,validHalChallenge} from './hal-challenge.js';
import {dragonFlying,dragonSupport,captureDragon,dragonOrder,waitingDragonCheck} from './dragon.js';
import {MOUNTS,mountFor} from './mounts.js';
import {alienAction,alienDrop,bossRelic} from './alien-loot.js';
import {merchantItemRemaining,recordMerchantPurchase} from './merchant-supplies.js';
import {planetaryAttack} from './planetary-monsters.js';
import {inlandWater,waterAccess,pumpLake} from './nautical.js';
import {SPELL_ITEMS,prepareWands,validateSpellState,castSpellItem,spellItem,randomSpellDrop,undead} from './spell-items.js';
import {rollAttackDamage} from './combat-belt.js';
import {GAG_ITEMS,gagActive,gagDrop,applyGag,HELIUM_REFUSAL} from './gag-potions.js';
import {lowLevelLoot,travelSteps} from './junk-loot.js';
import {secretAlcove,secretMap} from './secret-alcoves.js';
import {HOUR_MS,DAY_MS,worldTimeMs,prepareClock,expireBuffs,advanceClock,setTimedBuff,wildernessChance,nightEnemy} from './world-clock.js';
import {CHARACTER_FACES} from './character-faces.js';
import {gossipFor} from './gossip.js';
import {migrateRangedGear,randomAttributeLoot} from './treasure.js';
import {CEMETERY_DUNGEONS} from './dungeon-populations.js';
import {allocateAttribute,applyAttributeItem,applyLevelDrain,attributeBenefits,attributeLabel,attributeSave,effectiveAttributes,effectiveLevel,expireAttributeEffects,prepareAttributes,syncAttributeHealth,validateAttributeState} from './attributes.js';
import {dungeonFloors} from './dungeon-depths.js';
import {dungeonLadders} from './dungeon-ladders.js';
import {BOTTOMLESS_PIT,PIT_MAP_SEED,BALROG_ID,BALROG_ATTACKS,BALROG_WHIP,ROYAL_BALROG_TRIAL,pitBottomAction,pitVictory} from './bottomless-pit.js';
import {PUTRID_PALACE,PUTRID_PALACE_SEED,WANG_ID,WANG_TRIAL_DIALOGUE,freeGalen,castGalenRing,turnInWang} from './royal-trials.js';
import {castleChestAt,castleLayout,castleAction,castleFineFor,castleGuardResponse,exitCastle,validCastleState} from './castle-interiors.js';
import {AREAS,areaFor,areaTile,areaSites,branchGates,teleporterSite,visitedLands,shipMap,expeditionName,explorationAction} from './exploration.js';
import {cityOf,cityTick,cityAction,validateCities} from './city-rule.js';
import {WILD_SITES,gameDay,forestMap,mountainTile} from './wild-sites.js';
import {TREASURE_ITEMS,dungeonChests,dungeonMonsterLoot,gearKey,equipmentKeys,equippedAccessories,gearPower,hash,random} from './treasure.js';
import {ROYAL_INTRO,ROYAL_ENDINGS,royalObjective,royalCell,hasRoyalAdmission} from './royal-story.js';
import {buildEncounter} from './encounters.js';
import {casinoAction,validCasino} from './casino.js';
import {townWalkable,townPosition,townPlace} from './town.js';
import {WEAPONS,UNARMED,armorProtection,itemById,merchantBuyPrice,merchantSellPrice,weaponAccuracy,weaponMagicDamage} from './items.js';
import {REGIONS,TOWNS,DUNGEONS,CHAPTERS,ENEMIES,ENDINGS,SIDE_QUESTS} from './content.js';
export const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rand(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function tradePlace(s,a){if(s.mode!=='town'||s.castle)return null;const p=townPlace(s);if(!p||a?.merchant&&a.merchant!==p.id)return null;return {...p,...merchantFor(s.location,p.id)};}
function note(s,text){s.log.push(text);s.log=s.log.slice(-60);}
function advance(s,chapter){if(chapter>s.chapter){s.chapter=chapter;note(s,CHAPTERS[chapter].text);}}
export function createGame(name='Wanderer',gender='him'){
 const town=TOWNS[0];return prepareAttributes({attributeHealthAdjustment:0,wildernessTerrainVersion:1,worldMapVersion:WORLD_MAP_VERSION,wandCharges:{},wandSerial:0,spellEffects:{},worldTimeMs:8*HOUR_MS,buffExpiry:{},gender:CHARACTER_FACES.some(f=>f.id===gender)?gender:'him',cities:{},treasureSeed:hash(String(name)),openedChests:[],buffs:{},equippedBelt:null,equippedRing2:null,equippedHands:null,equippedHead:null,equippedBoots:null,equippedShield:null,equippedRing:null,equippedNecklace:null,version:1,bag:['road-sword','travel-armor','scroll-return'],equipped:'road-sword',equippedArmor:'travel-armor',equipmentVersion:1,pendingLoot:[],name:String(name).trim().slice(0,24)||'Wanderer',region:0,x:town.x-1,y:town.y,mode:'world',location:null,hp:80,maxHp:80,gold:65,meals:3,level:1,xp:0,weapon:1,armor:1,potions:3,chapter:0,relics:[],quests:[],wanted:[0,0,0,0],reputation:0,flags:{victories:0,guardVictories:0,transport:false},log:['The crown has called for a hero. Unfortunately, it has found you.',CHAPTERS[0].text],rng:187441,turns:0,dungeon:null,enemy:null,returnMode:'world',ending:null});
}
export function createRoyalGame(name,gender){const s=createGame(name,gender),court=TOWNS[1];s.treasureSeed=crypto.getRandomValues(new Uint32Array(1))[0];s.mode='town';s.location=court.id;s.x=court.x;s.y=court.y;s.townPosition={x:6,y:11};s.gold=1;s.meals=1;s.potions=0;s.bag=['rusty-sword','travel-armor','scroll-return','starter-healing','starter-healing'];s.equipped='rusty-sword';s.equippedArmor=null;s.flags.royalQuest='opening';s.flags.royalEntranceSeen=false;s.flags.royalIntroLine=0;s.log=[ROYAL_INTRO[0].text];return s;}
export function dungeonMap(d){return secretMap(d, d.site==='minor-site'?minorDungeonMap(d):d.site===ROADSIDE_CRYPT?roadsideCryptMap():d.ship?shipMap():d.site==='elf-village'?forestMap(d.floor):d.royal==='cell'?royalCell():makeDungeon(d.expedition?100+hash(d.expedition)%10000:d.royal==='sewer'?8:d.site===BOTTOMLESS_PIT.id?PIT_MAP_SEED:d.site===PUTRID_PALACE.id?PUTRID_PALACE_SEED:d.index,d.floor));}
export function dungeonName(d){return d.site===ROADSIDE_CRYPT?'Forgotten Roadside Crypt':d.site===BOTTOMLESS_PIT.id?BOTTOMLESS_PIT.name:d.site===PUTRID_PALACE.id?PUTRID_PALACE.name:d.site==='firedrak'?'Firedrak Mountain':d.ship?'Alien Spacecraft · Command Deck':d.expedition?expeditionName(d)+' · Level '+(d.floor+1):d.site==='elf-village'?'The Abandoned Elven Village · Level '+(d.floor+1):d.royal==='cell'?'The Royal Dungeon':d.royal==='sewer'?'The Royal Sewers':DUNGEONS[d.index].name;}
function banishRoyal(s){const c=TOWNS[1];s.flags.royalQuest='banished';s.flags.royalIntroLine=ROYAL_INTRO.length-1;s.mode='world';s.location=null;s.x=c.x-1;s.y=c.y;s.dungeon=null;note(s,'You are kicked outside Bellwether with a rusty sword, a moldy meal and one gold piece. Return with 500 gold. Rock Troll toes are not required.');}
export function worldTile(region,x,y){
 if(x<1||x>WORLD_WIDTH-2||y<1||y>WORLD_HEIGHT-2)return 'water';
 if(pumpLake(region,x,y))return 'water';
 const points=[...TOWNS,...DUNGEONS].filter(p=>p.region===region);
 if(WILD_SITES.some(p=>p.region===region&&Math.abs(x-p.x)<=1&&Math.abs(y-p.y)<=1))return 'grass';
 if(points.some(p=>Math.abs(x-p.x)<=1&&Math.abs(y-p.y)<=1))return 'grass';
 if(x===64||y===48||TOWNS.filter(p=>p.region===region).some(p=>(y===p.y&&x>=Math.min(64,p.x)&&x<=Math.max(64,p.x))))return landscapeTile(region,null,x,y,'road');
 if(inlandWater(region,x,y))return 'water';
 const n=((x*73856093)^(y*19349663)^(region*83492791))>>>0;
 const base=mountainTile(region,x,y)&&!(region===2&&x>=76&&y>=56)?'mountain':n%7<3?'forest':'grass';
 return landscapeTile(region,null,x,y,base);
}
export function wildernessStepDelay(s,action){
 if(s.mode!=='world'||!['move','mapStep'].includes(action.type))return 210;
 let {dx,dy}=action;
 if(action.type==='mapStep')for(let i=0;i<(s.flags.mapFacing||0);i++)[dx,dy]=[-dy,dx];
 if(dragonFlying(s))return 135;
 const area=areaFor(s);
 const terrainAt=(x,y)=>area?areaTile(s,x,y):worldTile(s.region,x,y);
 const tile=terrainAt(s.x+dx,s.y+dy);
 if(tile==='water')return 450;
 if(tile==='road'||tile==='bridge')return 185;
 if(tile==='swamp')return 540;
 if(area&&/fen|marsh|mire|drowned heath/i.test(area.name))return 540;
 if(tile==='forest')return 430;
 return 150;
}
const dungeonCache=new Map();
export function makeDungeon(index,floor){
 const key=index+':'+floor;if(dungeonCache.has(key))return dungeonCache.get(key);
 const m=Array.from({length:15},()=>Array(15).fill(1));let seed=783+index*379+floor*829;
 const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const stack=[[1,1]];m[1][1]=0;
 while(stack.length){const [x,y]=stack.at(-1);const opts=DIRS.filter(([dx,dy])=>{const nx=x+dx*2,ny=y+dy*2;return nx>0&&ny>0&&nx<14&&ny<14&&m[ny][nx]===1;});if(!opts.length){stack.pop();continue;}const [dx,dy]=opts[Math.floor(r()*opts.length)];m[y+dy][x+dx]=0;m[y+dy*2][x+dx*2]=0;stack.push([x+dx*2,y+dy*2]);}
 m[1][1]=3;m[13][13]=2;dungeonCache.set(key,m);return m;
}
function arriveAtLadder(d,direction) {
 const ladder=dungeonLadders(d,dungeonMap(d)).find(l=>l.direction===direction);
 d.x=ladder?.x??(direction==='up'?1:13);
 d.y=ladder?.y??(direction==='up'?1:13);
 d.dir=openDungeonDirection(d);
}
function changeDungeonFloor(d,delta) {
 delete d.secretRoom;
 d.floor+=delta;
 arriveAtLadder(d,delta>0?'up':'down');
}
function openDungeonDirection(d){const m=dungeonMap(d);return Math.max(0,DIRS.findIndex(([dx,dy])=>m[d.y+dy]?.[d.x+dx]!==undefined&&m[d.y+dy][d.x+dx]!==1));}
export function dungeonNavigation(d){const m=dungeonMap(d);const clear=dir=>{const [dx,dy]=DIRS[(dir+4)%4];return m[d.y+dy]?.[d.x+dx]!==undefined&&m[d.y+dy][d.x+dx]!==1;};return {forward:clear(d.dir),back:clear(d.dir+2),left:clear(d.dir-1),right:clear(d.dir+1),facing:['north','east','south','west'][d.dir]};}
// Turn in place only when a wall would hide the encounter portrait.
function faceEncounterPassage(d){
 if(dungeonNavigation(d).forward)return false;
 const m=dungeonMap(d),open=[];
 for(const offset of [-1,1,2]){const dir=(d.dir+offset+4)%4,[dx,dy]=DIRS[dir];let distance=0;
  while(m[d.y+dy*(distance+1)]?.[d.x+dx*(distance+1)]!==undefined&&m[d.y+dy*(distance+1)][d.x+dx*(distance+1)]!==1)distance++;
  if(distance)open.push({dir,turn:Math.abs(offset),distance});
 }
 open.sort((a,b)=>a.turn-b.turn||b.distance-a.distance);if(!open.length)return false;d.dir=open[0].dir;return true;
}
const minorSiteCache=new Map();
export function minorSiteList(s){
 const area=areaFor(s);if(area?.kind==='planet'||s.dungeon?.ship)return [];
 const key=area?.id??s.region;
 if(!minorSiteCache.has(key)){
  const landmarks=area?areaSites(s):[...branchGates(s.region),teleporterSite(s.region),PUTRID_PALACE,...WILD_SITES,...TOWNS,...DUNGEONS].filter(p=>p.region===s.region);
  const sites=minorSites(s,{tileAt:(x,y)=>area?areaTile(s,x,y):worldTile(s.region,x,y),landmarks});
  minorSiteCache.set(key,sites.map(site=>({...site,minorKind:site.kind,kind:'minorSite'})));
 }
 return minorSiteCache.get(key);
}
export function pointAt(s){if(areaFor(s))return [...areaSites(s),...minorSiteList(s)].find(p=>p.x===s.x&&p.y===s.y);return [...branchGates(s.region),teleporterSite(s.region),PUTRID_PALACE,...WILD_SITES,...TOWNS.map(p=>({...p,kind:'town'})),...DUNGEONS.map((p,index)=>({...p,index,kind:'dungeon'})),...minorSiteList(s)].find(p=>p.region===s.region&&p.x===s.x&&p.y===s.y);}
function validMinorDungeon(s){
 const d=s.dungeon,site=minorSiteDefinition(d?.minorId);
 if(d?.site!=='minor-site'||!site||site.region!==s.region||(s.exploration?.area??null)!==site.area||d.index!==site.index||d.ship||d.royal||d.expedition)return false;
 const entrance=minorSiteList(s).find(p=>p.id===site.id&&p.x===s.x&&p.y===s.y);
 if(!entrance)return false;
 return site.kind==='tunnel'?d.tunnelExit?.x===entrance.other?.x&&d.tunnelExit?.y===entrance.other?.y:d.tunnelExit===undefined;
}
function validMinorChestId(id){const match=/^minor:(minor-(?:r[0-3]|w(?:[0-9]|1[01]))-\d+):([0-2])$/.exec(id);if(!match)return false;const site=minorSiteDefinition(match[1]);return !!site&&(site.treasure||site.trapped)&&Number(match[2])===site.floors-1;}
function minorGuardianAt(s){
 if(s.dungeon?.site!=='minor-site'||s.flags['minorCleared:'+s.dungeon.minorId]||Math.abs(s.dungeon.x-13)+Math.abs(s.dungeon.y-13)>1)return false;
 const enemy=minorGuardian(s);if(!enemy)return false;
 s.enemy=enemy;s.returnMode='dungeon';s.mode='battle';s.flags.guarded=false;s.flags.combo=0;faceEncounterPassage(s.dungeon);note(s,enemy.name+' guards the far chamber.');return true;
}

export function nextObjective(s){if(s.flags.dragonCaptured)return 'Rescue your dragon from Drake the Defiler on level 10 of Firedrak Mountain in the Cinder Dominion (108, 68).';if(s.dungeon?.ship)return 'Find the control station at (7, 5) to select one of three alien planets. To return home, find a planetary teleportation scroll or P-Hopper.';if(areaFor(s)?.kind==='planet')return 'Explore this planet’s three alien dungeons. '+['Hal 2000','AGI Seven','Rosie the Riveter'][Number(s.exploration.area.split('-')[1])]+' awaits in the deepest chamber of the Echo Laboratory.';if(areaFor(s))return 'Explore the caves and monuments. Alien disk pieces: '+(s.exploration.artifacts?.length||0)+'/10. Return through the southern gate.';const royal=royalObjective(s);if(royal)return royal;const d=DUNGEONS.find(d=>!s.relics.includes(d.id));return d?.id==='tithe-vault'?'Recover the Hearth Seal from Haghilda on level 4 of the abandoned elven village.':d?.id==='widows-bell'?'Recover the Witness Bell on level 10 of the Widow’s Bell. Beware the level-12 Rock Troll.':d?`Recover ${d.relic} from ${d.name}.`:'Return to the royal court and decide the fate of the crown.';}
function guardsFear(s){return (s.flags.guardVictories||0)>=3;}
function encounter(s,boss=false,guard=false,challenged=false){
 if(guard&&!challenged&&guardsFear(s)){note(s,'The guards recognize you and reluctantly back away, terrified. None dares start another fight.');return;}
 delete s.flags.clockStopped;
 if(s.previewRules?.noRandom&&!boss&&!guard)return;
 if(!boss&&!guard&&(s.spellEffects?.invisibleMoves>0||s.buffs?.invisibility>0)){note(s,'You pass unseen through the shadows.');return;}
 if(!boss&&!guard&&s.mode==='world'&&areaFor(s)?.kind!=='planet'&&!dragonFlying(s)&&(areaFor(s)?areaTile(s,s.x,s.y):worldTile(s.region,s.x,s.y))!=='water'&&rand(s)<WILDERNESS_EVENT_CHANCE/.08){startWildernessEvent(s,WILDERNESS_EVENTS[Math.floor(rand(s)*WILDERNESS_EVENTS.length)],wildernessContext(s));return;}
 if(s.mode==='dungeon'&&faceEncounterPassage(s.dungeon))note(s,'You turn toward the open passage as a creature blocks your way.');
 let enemy=buildEncounter(s,rand(s),boss,guard);if(guard)enemy.guardChallenge=challenged;
 if(guard&&s.castle&&s.location!=='bellwether'){for(const key of ['hp','maxHp','attack','armor'])enemy[key]=Math.max(1,Math.round(enemy[key]*7/10));enemy.level=35;enemy.name='Governor’s Palace Guard';}
 const field=!boss&&!guard&&s.mode==='world'&&areaFor(s)?.kind!=='planet';
 const chance=random(hash('meeting:'+s.rng+':'+s.turns+':'+s.region))();
 const atSea=field&&(areaFor(s)?areaTile(s,s.x,s.y):worldTile(s.region,s.x,s.y))==='water';
 if(atSea&&!dragonFlying(s)){
  const name=chance<.015?'Legendary Kraken':chance<.12?'Leviathan':chance<.40?'Giant Squid':chance<.67?'Crazed Crab':'Sea Monster';
  const bonus=name==='Legendary Kraken'?12:name==='Leviathan'?5:2;
  const speciesId={'Legendary Kraken':'juvenile-leviathan',Leviathan:'juvenile-leviathan','Giant Squid':'memory-eel','Crazed Crab':'boiler-crab','Sea Monster':'pressure-nautilus'}[name];
  enemy={...enemy,name,speciesId,level:enemy.level+bonus,hp:enemy.hp+bonus*12,maxHp:enemy.maxHp+bonus*12,attack:enemy.attack+bonus*2,armor:enemy.armor+bonus,gold:enemy.gold+bonus,xp:enemy.xp+bonus*5};
 }else if(field&&s.turns>10&&chance<.12){
  s.flags.peacefulEncounter={name:enemy.name,offer:chance<.04?'gold':chance<.08?'trade':'sell',amount:Math.max(2,enemy.level)};
  note(s,enemy.name+' approaches with an offer.');
  return;
 }
 if(field&&chance>=.12&&chance<.30)enemy.surprised=true;
 if(!boss&&!guard&&!atSea&&s.dungeon?.site!==BOTTOMLESS_PIT.id&&s.level>=4&&enemy.level<=s.level+2&&chance>=.80&&chance<.94){
  const count=chance>=.91&&s.level>=8?3:2;
  enemy={...enemy,groupSize:count,memberHp:enemy.maxHp,hp:enemy.maxHp*count,maxHp:enemy.maxHp*count,gold:enemy.gold*count,xp:enemy.xp*count};
 }
 s.returnMode=s.mode;s.flags.guarded=false;s.flags.combo=0;s.enemy=enemy;s.flags.lastSpecies=enemy.speciesId;s.mode='battle';note(s,`${s.enemy.groupSize?s.enemy.groupSize+' × '+s.enemy.name:s.enemy.name} (level ${s.enemy.level}) bars your way. Armor: ${s.enemy.armor}. Weakness: ${s.enemy.weakness}. ${guard?(s.enemy.level===35?'Level 35 palace guard: weaker than the royal guard, but still dangerous.':'Level 50 royal brute with enchanted weapons: retreat unless well prepared.'):boss?'There will be no quiet passage.':'Fight, defend, use magic, or retreat.'}`);
}
function startCastleGuard(s,forced=false) {
 encounter(s,false,true,forced);
}
function resetPalaceAttempt(s){if(s.enemy?.gateGuard){delete s.flags.gateAttemptWins;delete s.flags.gateAttemptId;}if(s.enemy?.guard&&!s.enemy.castleRoyalDefense&&!s.enemy.tributeTown&&!s.enemy.gossipGuard&&!s.enemy.gateGuard&&s.location!=='bellwether')delete s.flags['palaceWins:'+s.location];}
function recover(s){captureDragon(s);s.spellEffects.stunnedTurns=0;const rescue=message=>{s.flags.rescuePending=true;s.flags.rescueMessage=message;note(s,message);};if(s.enemy?.castleRobbery){
 resetPalaceAttempt(s);exitCastle(s,true);s.enemy=null;s.hp=s.maxHp;s.dungeon=null;
 rescue('The castle guards carry you outside. Pay the 2,000-gold fine at the town gate.');
 return;
 }const palace=s.enemy?.guard&&!s.enemy.castleRoyalDefense&&!s.enemy.tributeTown&&!s.enemy.gossipGuard&&!s.enemy.gateGuard&&s.location!=='bellwether'?TOWNS.find(t=>t.id===s.location):null;resetPalaceAttempt(s);if(palace){s.flags['palaceBan:'+palace.id]=true;s.gold=Math.floor(s.gold/2);s.hp=s.maxHp;s.enemy=null;s.dungeon=null;s.mode='world';s.returnMode='world';s.location=null;s.x=palace.x-1;s.y=palace.y;delete s.casino;rescue('The palace guards confiscate half your gold and throw you outside '+palace.name+'. You are barred until you pay 5,000 gold to the governor through the entrance guards.');return;}if(s.exploration)s.exploration.area=null;s.hp=s.maxHp;s.gold=Math.floor(s.gold*.8);s.enemy=null;s.dungeon=null;s.mode='world';const town=TOWNS.find(t=>t.region===s.region);s.x=town.x-1;s.y=town.y;rescue('A weary pilgrim drags you to safety. You lose a fifth of your gold, but your story continues.');}
function clock(s){s.turns++;}
function vampireBite(s){
 const d=s.dungeon,e=s.enemy;
 if(s.hp<=0||s.returnMode!=='dungeon'||!d||d.royal||d.site||d.expedition||d.ship||e.boss||e.guard||!CEMETERY_DUNGEONS.has(d.index)||e.speciesId!==`depth-${d.index}-crypt-vampire`||effectiveLevel(s)<=1)return;
 if(attributeSave(s,'constitution',()=>rand(s),itemById)){note(s,'Your Constitution save repels the vampire’s bite.');return;}
 if(applyLevelDrain(s)){
  syncAttributeHealth(s,itemById);
  note(s,`${e.name} drains one level. It returns after 30 game minutes without another drain.`);
 }
}
function enemyTurn(s,defending=false,events=[],multiplier=1,keepCoating=false){if(!s.enemy)return;if(!keepCoating&&spendPoisonRound(s))note(s,'Your weapon poison wears off.');if(s.enemy.surprised){delete s.enemy.surprised;note(s,s.enemy.name+' is caught off guard and misses its turn.');return;}if(dragonSupport(s,events)&&s.enemy.hp<=0){events.push({kind:'victory',target:'enemy',amount:0,sound:'victory'});victory(s);return;}if(s.flags.clockStopped>0){s.flags.clockStopped--;note(s,'The clock holds your enemy outside time.');return;}if(s.previewRules?.invulnerable){note(s,'Developer preview: incoming damage prevented.');return;}s.buffs??={};if(s.enemy.luteNumb>0){s.enemy.luteNumb--;note(s,s.enemy.name+' is still numb from the ballad.');return;}if(s.enemy.frozen>0){s.enemy.frozen--;note(s,s.enemy.name+' is frozen and cannot attack.');return;}if(s.buffs.invisibility>0||s.spellEffects?.invisibleMoves>0&&!s.enemy.boss){note(s,'The enemy strikes at empty air.');return;}if(s.equippedShield==='mirrored-shield'&&!s.enemy.boss&&!s.enemy.guard&&!s.enemy.sewerChestGuard&&rand(s)<.05){const message=s.enemy.name+' sees a monster in your shield and runs. It was looking at itself.';note(s,message);events.push({kind:'retreat',target:'enemy',amount:0,sound:'step',message});s.enemy=null;s.mode=s.returnMode;s.spellEffects.stunnedTurns=0;return;}if(s.equipped==='lute-of-lousy-lyrics'&&rand(s)<.05){s.enemy.luteNumb=1;const message='The Ballad of Dingo Dobble leaves '+s.enemy.name+' numb and defenseless for two rounds!';note(s,message);events.push({kind:'stun',target:'enemy',amount:0,sound:'block',message});return;}if(s.enemy.speciesId==='leviathan-levity'){const e=s.enemy;e.breathCooldown=Math.max(0,(e.breathCooldown||0)-1);if(!e.breathCooldown&&rand(s)<.3){s.spellEffects.stunnedTurns=2;e.breathCooldown=4;const message='The Leviathan belches: “Cod you believe that smell?” Horrendous breath stuns you for TWO ROUNDS!';note(s,message);events.push({kind:'stun',target:'hero',amount:0,sound:'magic',message});return;}const jokes=['“I used to be a sole musician. Now I play the bass!”','“Two tridents? I like to keep my options pronged!”','“You think my jokes stink? Wait until I breathe!”'];note(s,jokes[(e.jokeIndex||0)%jokes.length]);e.jokeIndex=(e.jokeIndex||0)+1;}
 if(s.enemy.speciesId===BALROG_ID){
  const balrog=s.enemy;
  for(const attack of BALROG_ATTACKS){
   if(s.enemy!==balrog)break;
   enemyStrike(s,defending,events,multiplier,attack);
  }
  return;
 }
 if(s.enemy.speciesId===WANG_ID){
  const wang=s.enemy;
  wang.slugs=Math.min(100_000,(wang.slugs||0)+100);
  note(s,'Wang summons 100 one-hit-point slugs!');
  enemyStrike(s,defending,events,multiplier,{verb:'swings his first sledgehammer'});
  if(s.enemy===wang)enemyStrike(s,defending,events,multiplier,{verb:'swings his second sledgehammer'});
  if(s.enemy===wang)enemyStrike(s,defending,events,multiplier,{verb:'sends his slugs crawling over you',power:Math.min(30,Math.ceil(wang.slugs/20))});
  return;
 }
 enemyStrike(s,defending,events,multiplier);
}
function enemyStrike(s,defending,events,multiplier,attack){
 const alienAttack=attack??planetaryAttack(s.enemy),mental=!!alienAttack?.mental,wards=equippedAccessories(s),benefits=attributeBenefits(s,itemById);
 const attackElement=attack?(attack.element??null):alienAttack?.element||s.enemy.element||(/frost|ice|snow|winter/i.test(s.enemy.name)?'frost':/fire|flame|ember|cinder/i.test(s.enemy.name)?'fire':s.enemy.speciesId==='haghilda'?'poison':null);
 const element=attackElement==='cold'?'frost':attackElement;
 const elemental=['fire','frost','poison'].includes(element)?benefits.elementalResistance:0;
 const magical=mental||['caster','spectral'].includes(s.enemy.kind)||s.enemy.attackType==='magic'||['magic','psychic'].includes(element)?benefits.magicResistance:0;
 const resistance=Math.min(.75,wards.filter(i=>i.resistance===element).reduce((n,i)=>n+i.resistPercent/100,0)+elemental+magical);
 const shield=wards.filter(i=>i.kind!=='armor').reduce((n,i)=>n+(i.protection||0),0),evasion=Math.min(.4,wards.reduce((n,i)=>n+(i.evasion||0),benefits.evasion))+(s.enemy.confused&&s.enemy.attackType!=='ranged'&&s.enemy.kind!=='caster'?.3:0);if(evasion&&rand(s)<evasion){events.push({kind:'miss',target:'hero',amount:0,sound:'miss'});note(s,s.enemy.confused?'The confused enemy swings wide and misses.':'You evade the blow.');return;}const attackers=s.enemy.memberHp?Math.max(1,Math.ceil(s.enemy.hp/s.enemy.memberHp)):1;const damage=Math.max(1,Math.floor((attack?.power??s.enemy.attack)*(attack?.multiplier??1)*(1+.55*(attackers-1))*(.7+rand(s)*.7)*(s.enemy.speciesId==='haghilda'&&s.enemy.peppered?.5:1)*(1-resistance)-(mental?0:armorProtection(s)*1.3+shield)))*multiplier;const ward=TREASURE_ITEMS[s.equippedShield],blocked=!mental&&ward?.block?ward.block[0]+Math.floor(rand(s)*(ward.block[1]-ward.block[0]+1)):0,taken=Math.max(0,(defending?Math.ceil(damage/3):damage)-blocked-(s.enemy.insulted?2:0));const wardBlock=s.spellEffects?.wardTurns>0?10:0;if(wardBlock)s.spellEffects.wardTurns--;const finalTaken=Math.max(0,taken-wardBlock);s.hp-=finalTaken;note(s,`${s.enemy.name}${alienAttack?' '+alienAttack.verb:s.enemy.speciesId==='haghilda'?' blasts suffocating toxic snot':' strikes'} for ${finalTaken}.${wardBlock?' Protective Ward absorbs '+Math.min(wardBlock,taken)+'.':''}${blocked?' Frostburn blocks '+Math.min(blocked,defending?Math.ceil(damage/3):damage)+'.':''}`);if(finalTaken>0)vampireBite(s);events.push({kind:defending?'block':'hit',target:'hero',hpAfter:Math.max(0,s.hp),amount:finalTaken,sound:defending?'block':'hurt',...(attack?{message:s.log.at(-1)}:{})});
 if(ward?.retaliation){
  const ice=ward.retaliation[0]+Math.floor(rand(s)*(ward.retaliation[1]-ward.retaliation[0]+1))+benefits.magicDamage;
  const damage=rollAttackDamage(s,ice,()=>rand(s),note);
  s.enemy.hp-=damage.amount;
  events.push({kind:'magic',target:'enemy',...damage,sound:'magic'});
  note(s,'Frostburn launches sharp ice projectiles for '+damage.amount+' damage.');
 }
 if(s.hp>0&&s.enemy.hp<=0){events.push({kind:'victory',target:'enemy',amount:0,sound:'victory'});victory(s);return;}if(s.hp>0){const regen=wards.reduce((n,i)=>n+(i.regeneration||0),0);if(regen){s.hp=Math.min(s.maxHp,s.hp+regen);note(s,'Your enchanted gear restores '+regen+' health.');}}if(s.hp<=0){events.push({kind:'defeat',target:'hero',amount:0,sound:'defeat'});recover(s);}}
function clearWangSlugs(s, damage) {
 if(s.enemy?.speciesId!==WANG_ID||!s.enemy.slugs||damage<=0)return;
 const killed=Math.min(s.enemy.slugs,damage);
 s.enemy.slugs-=killed;
 note(s,'The fireball burns '+killed+' of Wang’s slugs.');
}
function fearStopsAttack(s,events) {
 if(s.enemy?.speciesId!==BALROG_ID||attributeSave(s,'wisdom',()=>rand(s),itemById))return false;
 const message='You stand gibbering in terror and miss your attack.';
 s.flags.guarded=false;s.flags.combo=0;
 note(s,message);
 events.push({kind:'stun',target:'hero',amount:0,sound:'block',message});
 enemyTurn(s,false,events);
 return true;
}
function advanceRoyalAudience(s) {
 if(s.flags.royalQuest==='resolved')return;
 if(!s.flags.wangTrialComplete){
  if(s.flags.royalQuest!=='wang')for(const line of WANG_TRIAL_DIALOGUE)note(s,line.speaker+': '+line.text);
  s.flags.royalQuest='wang';
 }else if(!s.flags['garrison:0']){
  s.flags.royalQuest='escaped';
  note(s,'Malachi accepts the sceptre. Defeat his royal garrison before demanding to see Bunnyfoot.');
 }else if(!s.flags.balrogTrialComplete){
  if(s.flags.royalQuest!=='trial')for(const line of ROYAL_BALROG_TRIAL)note(s,line.speaker+': '+line.text);
  s.flags.royalQuest='trial';
 }else s.flags.royalQuest='audience';
}
function grantSlimeBoots(s){if(s.flags.slimeBootsAwarded)return;s.flags.slimeBootsAwarded=true;if(!s.bag.includes('boots-slime-skating')){s.bag.push('boots-slime-skating');s.pendingLoot.unshift('boots-slime-skating');note(s,'Haghilda leaves Epic Boots of Slime Skating. Equip them in your boots slot.');}}
function wildernessContext(s){return {note,random:()=>rand(s),recover,enterCrypt:enterRoadsideCrypt};}
function roadsideGuardian(s){
 if(s.dungeon?.site!==ROADSIDE_CRYPT||s.flags['cryptCleared:'+s.dungeon.cryptId])return false;
 const chest=dungeonChests(s,dungeonMap(s.dungeon))[0];if(Math.abs(chest.x-s.dungeon.x)+Math.abs(chest.y-s.dungeon.y)>1)return false;
 s.enemy=cryptGuardian(s);s.returnMode='dungeon';s.mode='battle';faceEncounterPassage(s.dungeon);note(s,'An undead guardian rises before the crypt chest.');return true;
}
function sewerGuardian(s){if(s.dungeon?.royal!=='sewer'||s.flags.sewerSpiderDefeated)return false;const chest=dungeonChests(s,dungeonMap(s.dungeon))[0];if(chest.opened||Math.abs(chest.x-s.dungeon.x)+Math.abs(chest.y-s.dungeon.y)>1)return false;faceEncounterPassage(s.dungeon);s.returnMode='dungeon';s.mode='battle';s.flags.guarded=false;s.flags.combo=0;s.enemy={name:'Great Sewer Spider',speciesId:'giant-grove-spider',art:{sheet:'monsters-grove',index:1},level:6,hp:110,maxHp:110,attack:15,armor:3,gold:6,xp:30,kind:'brute',firstContact:true,boss:true,sewerChestGuard:true,weakness:'A huge spider guards the skeleton key chest.'};note(s,'A huge spider drops from its web, guarding the only chest in the sewers.');return true;}
const STARTER_WEAPONS=['smiting',...['sword','mace','spear','axe'].flatMap(family=>['common-'+family+'-1','common-'+family+'-1-v1'])];
function victory(s){delete s.weaponCoating;s.spellEffects.stunnedTurns=0;const e=s.enemy;if(e.castleRoyalDefense){s.mode=s.returnMode;s.enemy=null;note(s,e.castleRoyalDefense==='governor'?'You drive back the governor’s guards and escape the mansion. The governor remains protected.':'You drive back the throne guard and escape the palace. The royal family remains protected.');exitCastle(s,true);return;}if(e.minorGuardian)s.flags['minorCleared:'+e.minorGuardian]=true;if(e.cryptGuardian)s.flags['cryptCleared:'+e.cryptGuardian]=true;if(e.guard){s.flags.guardVictories=(s.flags.guardVictories||0)+1;if(s.flags.guardVictories===3)note(s,'Three guards have fallen. Word spreads: the guards are terrified and will leave you alone for the rest of your adventure.');}if(s.dungeon&&!e.guard){const job=SIDE_QUESTS.find(q=>q.questItem&&(q.keepsakeKind!=='tooth'||/dragon|drake/i.test(e.speciesId||e.name))&&!s.quests.includes(q.id)&&!s.bag.includes(q.questItem)&&TOWNS.find(t=>t.id===q.town)?.region===s.region);if(job){s.bag.push(job.questItem);s.pendingLoot.push(job.questItem);}}if(s.dungeon&&!e.boss&&!e.guard&&rand(s)<.30){
 const item=dungeonMonsterLoot(s,rand(s),rand(s));
 if(item){s.bag.push(item);s.pendingLoot.push(item);note(s,'You found '+TREASURE_ITEMS[item].name+'.');}
}const planet=!!s.dungeon?.expedition?.startsWith('planet-');if(planet&&!e.boss){const id=alienDrop(rand(s),rand(s));if(id){s.bag.push(id);s.pendingLoot.push(id);note(s,'Alien salvage found.');}}if(!e.boss&&!e.guard){const spellLoot=randomSpellDrop(e.level||1,rand(s),rand(s));if(spellLoot){s.bag.push(spellLoot);s.pendingLoot.push(spellLoot);note(s,'You found '+SPELL_ITEMS[spellLoot].name+'.');}}if(!e.boss&&!e.guard){const prank=gagDrop(rand(s),rand(s));if(prank){s.bag.push(prank);s.pendingLoot.push(prank);note(s,'You found '+GAG_ITEMS[prank].name+'.');}}if(!e.boss&&!e.guard&&e.level<=5){const found=lowLevelLoot(e.level,rand(s),rand(s));if(found){s.bag.push(found);s.pendingLoot.push(found);note(s,'You found '+TREASURE_ITEMS[found].name+'.');}}if(e.speciesId==='ghost-dragon'){s.flags.ghostDragonDefeated=true;if(!s.flags.frostburnAwarded){s.flags.frostburnAwarded=true;s.bag.push('shield-frostburn');s.pendingLoot.push('shield-frostburn');note(s,'The dragon leaves an Epic Shield of Frostburn.');}}const attributeLoot=randomAttributeLoot(s.level,e.level||1,random(hash(s.rng+':'+s.flags.victories+':attribute-loot'))(),random(hash(s.rng+':'+s.flags.victories+':attribute-choice'))());if(attributeLoot){s.bag.push(attributeLoot);s.pendingLoot.push(attributeLoot);note(s,'You found '+TREASURE_ITEMS[attributeLoot].name+'.');}const legendaryGear=randomLegendaryGearLoot(s.level,e.level||1,random(hash(s.rng+':'+s.flags.victories+':legendary-gear'))());if(legendaryGear){s.bag.push(legendaryGear);s.pendingLoot.push(legendaryGear);note(s,'You found '+TREASURE_ITEMS[legendaryGear].name+'.');}s.gold+=e.gold;s.xp+=e.xp??(e.boss?60:20);s.flags.victories++;
 // Independent treasure rolls leave the existing loot table intact.
 for(const [id,chance] of [['dungeon-elevator',.05],['teleporter-crystal',.005]]){
  if(id==='dungeon-elevator'&&s.returnMode!=='dungeon')continue;
  if(random(hash(s.rng+':'+s.flags.victories+':'+id))()<chance){s.bag.push(id);s.pendingLoot.push(id);note(s,'You found '+TREASURE_ITEMS[id].name+'.');}
 }
 if(s.level>5&&!e.guard&&!s.flags.websterFound&&!s.bag.includes('webster')&&rand(s)<.01){s.flags.websterFound=true;s.bag.push('webster');s.pendingLoot.push('webster');note(s,'A crystal amulet grins up at you. You found Webster.');}if(!planet&&!e.sewerChestGuard&&(e.boss||s.flags.victories%3===1)){const pool=Object.keys(WEAPONS).slice(1+s.region*2,3+s.region*2);const starter=s.region===0&&s.flags.victories===1&&!e.boss&&!e.guard;const choices=starter?STARTER_WEAPONS.filter(id=>!s.bag.includes(id)):pool;const found=starter?choices[Math.floor(random(hash(s.treasureSeed+':first-weapon'))()*choices.length)]:choices.find(id=>!s.bag?.includes(id));if(found){s.bag??=['road-sword'];s.pendingLoot??=[];s.bag.push(found);s.pendingLoot.push(found);note(s,`You found ${WEAPONS[found].name}.`);}}if(e.speciesId==='drake-defiler'){s.flags.drakeDefeated=true;if(s.flags.dragonCaptured){s.flags.dragonCaptured=false;s.flags.mount='dragon';s.flags.dragonHp=350;s.flags.dragonWatch={hp:350,maxHp:350,moves:0};s.flags.dragonNotice='Drake falls! Your dragon breaks free and waits at the mountain entrance. GLEEEEEP!';note(s,s.flags.dragonNotice);}}if(e.sewerChestGuard){s.flags.sewerSpiderDefeated=true;note(s,'The spider falls. The skeleton key chest is safe to open.');}else if(e.speciesId==='haghilda'){s.flags.haghildaDefeated=true;grantSlimeBoots(s);grantHearthSeal(s);}else if(e.speciesId===BALROG_ID){
 if(pitVictory(s))note(s,'You take the Balrog’s whip. The elevator at the bottom of the Pit groans into life.');
 }else if(e.speciesId===WANG_ID){
 if(!s.flags.wangDefeated){s.flags.wangDefeated=true;s.bag.push('wang-sceptre');s.pendingLoot.unshift('wang-sceptre');note(s,'You recover Wang’s sceptre.');}
 }else if(e.boss&&s.dungeon?.expedition){s.flags['expedition:'+s.dungeon.expedition]=true;const id=bossRelic[e.speciesId]||'alien-'+s.dungeon.expedition.split('-')[1]+'-'+s.dungeon.expedition.split('-').at(-1);if(planet){const gems=Object.values(TREASURE_ITEMS).filter(i=>i.kind==='gem');if(gems.length){const gem=gems[Math.floor(rand(s)*gems.length)].id;s.bag.push(gem);s.pendingLoot.push(gem);}}if(s.dungeon.expedition.startsWith('planet-')&&TREASURE_ITEMS[id]){s.bag.push(id);s.pendingLoot.push(id);}}else if(e.boss&&e.speciesId!=='drake-defiler')s.flags['boss:'+s.dungeon.index]=true;if(e.guard){if(e.gateGuard){s.flags.gateAttemptWins=(s.flags.gateAttemptWins||0)+1;note(s,'Border guards defeated: '+s.flags.gateAttemptWins+'/3.');if(s.flags.gateAttemptWins===3){s.flags['gateAccess:'+e.gateGuard]=true;delete s.flags.gateAttemptWins;delete s.flags.gateAttemptId;note(s,'All three guards yield. You have permanent free access through this gate, with or without relics.');}}else if(e.gossipGuard){note(s,'The square falls silent. This bully will collect no more gossip fees.');}else if(e.tributeTown){const city=cityOf(s,e.tributeTown);if(city){city.guards++;if(city.guards>=2){note(s,'Both tax guards are defeated, but the King’s fire threat remains. Send 1,000 gold through Giacomo before the deadline to guarantee the town’s safety.');}else note(s,'One tax guard remains. Return to Town Hall to challenge him.');}}else if(s.location==='bellwether'){s.flags.royalGuardWins=(s.flags.royalGuardWins||0)+1;note(s,'Royal guards defeated: '+s.flags.royalGuardWins+'/20.');if(s.flags.royalGuardWins>=20){s.flags['townGarrison:bellwether']=true;s.flags['garrison:0']=true;note(s,'The royal garrison surrenders.');advanceRoyalAudience(s);}}else if(s.location){const key='palaceWins:'+s.location;s.flags[key]=(s.flags[key]||0)+1;note(s,'Palace guards defeated: '+s.flags[key]+'/5.');if(s.flags[key]>=5){s.flags['townGarrison:'+s.location]=true;note(s,'The governor’s palace is yours. Demand the city key from the mayor.');}}s.wanted[s.region]=Math.max(0,s.wanted[s.region]-1);s.reputation-=3;}note(s,`${e.name} is defeated. You find ${e.gold} gold.`);s.mode=s.returnMode;s.enemy=null;while(s.xp>=s.level*50){s.xp-=s.level*50;s.level++;s.maxHp+=14;s.hp=Math.min(s.maxHp,s.hp+30);note(s,`Level ${s.level}. Rumors of your competence are becoming difficult to deny.`);}if(e.gateGuard&&!s.flags['gateAccess:'+e.gateGuard])startGateGuard(s,e.gateGuard);if(e.castleRobbery)castleGuardResponse(s,{startGuard:startCastleGuard});else if(e.guard&&!e.tributeTown&&!e.gossipGuard&&!e.gateGuard&&s.location&&s.location!=='bellwether'&&!s.flags['townGarrison:'+s.location]&&(e.guardChallenge||!guardsFear(s))){encounter(s,false,true,!!e.guardChallenge);s.enemy.name='Palace Guard '+((s.flags['palaceWins:'+s.location]||0)+1)+' of 5';}}
export function act(input,action,events=[],previewRules={}){
 if(!previewRules.singleSpeedStep&&['town','dungeon'].includes(input.mode)&&['move','forward','back','strafe'].includes(action?.type)&&rareGearEffect(input,'movementBonus')>0){
  let state=input;
  const position=s=>s.mode==='dungeon'?s.dungeon:s.castle||townPosition(s);
  for(let step=0;step<=rareGearEffect(input,'movementBonus');step++){
   const before=position(state),x=before?.x,y=before?.y,castle=!!state.castle;
   state=act(state,action,events,{...previewRules,singleSpeedStep:true});
   const after=position(state);
   if(state.mode!==input.mode||castle!==!!state.castle||after?.x===x&&after?.y===y)break;
   if(state.mode==='town'&&(state.castle?castleChestAt(state)||state.castle.x===castleLayout(state.location).throne.x&&state.castle.y===castleLayout(state.location).throne.y:townPlace(state)))break;
   if(state.mode==='dungeon'){
    const d=state.dungeon,map=dungeonMap(d);
    if(d.x===13&&d.y===13||d.site==='elf-village'&&d.floor>=2&&d.x===7&&d.y===7||d.royal==='cell'&&d.x===3&&d.y===3||d.ship&&d.x===7&&d.y===5)break;
    if(map[d.y]?.[d.x]===2||dungeonLadders(d,map).some(p=>p.x===d.x&&p.y===d.y)||dungeonChests(state,map).some(p=>!p.opened&&p.x===d.x&&p.y===d.y))break;
   }
   // A speed burst must never skip a possible turn; open rooms use careful steps.
   const dx=after.x-x,dy=after.y-y;
   const open=(px,py)=>{
    if(state.mode==='dungeon'){const map=dungeonMap(state.dungeon);return map[py]?.[px]!==undefined&&map[py][px]!==1;}
    if(state.castle){const tile=castleLayout(state.location).tiles[py]?.[px];return !!tile&&tile!=='wall';}
    return townWalkable(px,py,state);
   };
   if(open(after.x-dy,after.y+dx)||open(after.x+dy,after.y-dx))break;
  }
  return state;
 }
 const s=actInner({...input,previewRules},action,events);
 delete s.previewRules;
 if(s.gold>0)delete s.flags.fineAdmissionTown;
 else if(s.gold<input.gold&&['pardon','payCastleFine','payGovernor'].includes(action?.type)){
  const paidTown=input.mode==='town'?input.location:TOWNS.find(t=>t.region===input.region&&t.x===input.x&&t.y===input.y)?.id;
  if(paidTown)s.flags.fineAdmissionTown=paidTown;
 }
 if(input.mode==='battle'&&s.mode!=='battle'||s.equipped!==input.equipped)delete s.weaponCoating;
 if(input.flags?.impaledMoves&&(input.mode!==s.mode||input.region!==s.region||input.x!==s.x||input.y!==s.y||input.exploration?.area!==s.exploration?.area))delete s.flags.impaledMoves;
 if(s.mode==='dungeon'&&input.mode==='world'&&s.dungeon&&!s.dungeon.ship&&s.dungeon.ladderLayout===1)s.dungeon.dir=openDungeonDirection(s.dungeon);
 if(s.mode==='dungeon'&&input.mode!=='dungeon'&&input.mode!=='battle')s.flags.chestVisitStart=s.openedChests?.length??0;
 if(input.mode!=='dungeon'&&s.mode==='dungeon'&&s.dungeon){const d=s.dungeon,cleared=d.expedition?s.flags['expedition:'+d.expedition]:d.site==='elf-village'?s.flags.haghildaDefeated:d.site==='firedrak'?s.flags.drakeDefeated:d.site===BOTTOMLESS_PIT.id?s.flags.balrogDefeated:d.site===PUTRID_PALACE.id?s.flags.wangDefeated:!d.royal&&!d.ship&&s.flags['boss:'+d.index];if(cleared)note(s,'This place looks eerily familiar, and empty.');}

 prepareHal(s);
 syncAttributeHealth(s,itemById);


 if(s.mode==='world'&&areaFor(s)?.kind!=='planet'){
  const before=visitedLands(input), after=visitedLands(s);
  if(!s.flags.visitedLands||after.some(id=>!before.includes(id)))s.flags.visitedLands=[...new Set([...before,...after])];
 }
 if(input.mode==='battle'&&s.enemy&&(events.length||action?.type==='flee'))s.enemy.firstContact=false;
 if(s.dungeon&&!s.dungeon.royal&&!s.dungeon.site&&!s.dungeon.expedition&&!s.dungeon.ship){const room=s.flags['secretRoom:'+s.dungeon.index+':'+s.dungeon.floor];if(room)s.dungeon.secretRoom={...room};}
 if(s.flags.mount==='dragon'&&!s.flags.dragonCaptured&&input.mode==='world'&&s.mode==='dungeon'&&!s.dungeon.ship&&!s.dungeon.expedition?.startsWith('planet-'))s.flags.dragonWatch={hp:s.flags.dragonHp||350,maxHp:350,moves:0};
 if(s.flags.dragonWatch&&s.mode==='dungeon'&&input.mode==='dungeon'&&s.turns>input.turns&&!s.flags.dragonWatch.enemy)waitingDragonCheck(s,rand(s));
 if(s.mode==='world'&&input.mode==='dungeon'&&s.flags.dragonWatch){s.flags.dragonHp=s.flags.dragonWatch.hp;delete s.flags.dragonWatch;}
 prepareWands(s);
 if(s.equippedMagic&&!s.bag.includes(s.equippedMagic))s.equippedMagic=null;
 if(s.spellEffects.invisibleMoves>0&&!(action?.type==='useItem'&&spellItem(action.id,s)?.spell==='invisibility')){
  const moving=['move','forward','back','strafe'].includes(action?.type),p=input.mode==='town'?input.castle||input.townPosition||{x:6,y:11}:input.mode==='dungeon'?input.dungeon:input,q=s.mode==='town'?s.castle||s.townPosition||{x:6,y:11}:s.mode==='dungeon'?s.dungeon:s;
  let moves=moving&&(p?.x!==q?.x||p?.y!==q?.y)?input.mode===s.mode&&input.region===s.region?Math.max(1,Math.abs(p.x-q.x)+Math.abs(p.y-q.y)):1:input.mode==='battle'&&(events.length||['attack','guard','flee'].includes(action?.type))?1:0;
  s.spellEffects.invisibleMoves=Math.max(0,s.spellEffects.invisibleMoves-moves);
 }
 if(s.mode==='world'&&!dragonFlying(s)&&!waterAccess(s)&&(areaFor(s)?areaTile(s,s.x,s.y):worldTile(s.region,s.x,s.y))==='water'){let shore=null,best=Infinity;for(let y=1;y<worldSize(s).height-1;y++)for(let x=1;x<worldSize(s).width-1;x++){const tile=areaFor(s)?areaTile(s,x,y):worldTile(s.region,x,y),distance=Math.abs(x-s.x)+Math.abs(y-s.y);if(tile!=='water'&&tile!=='mountain'&&distance<best){best=distance;shore={x,y};}}if(shore){Object.assign(s,shore);note(s,'Your water breathing fades. You swim back to the nearest safe shore.');}}
 cityTick(s,note,()=>rand(s));
 if(s.mode==='town'&&s.gold===0&&s.flags.fineAdmissionTown!==s.location&&!cityOf(s)&&!s.casino?.active&&!hasRoyalAdmission(s,s.location)){const t=TOWNS.find(t=>t.id===s.location)||TOWNS.find(t=>t.region===s.region);s.mode='world';s.location=null;s.x=t.x-1;s.y=t.y;note(s,'Being escorted out of the town. Return when you have some gold in your possession.');}
 if(s.mode==='world'&&!areaFor(s)?.id?.startsWith('planet-')){
  for(const site of minorSiteList(s))if(Math.max(Math.abs(site.x-s.x),Math.abs(site.y-s.y))<=2&&!s.flags.minorDiscovered?.includes(site.id)){
   s.flags.minorDiscovered??=[];s.flags.minorDiscovered.push(site.id);note(s,'Off the road, you notice '+site.name+'.');
  }
 }
 if(s.castle&&(!['town','battle'].includes(s.mode)||s.location!==input.location))delete s.castle;
 return s;
}
function actInner(input,action,events=[]){
 const s=structuredClone(input);migrateRangedGear(s);prepareWands(s);prepareAttributes(s);const a={...(action||{})};if(a.type==='equipMagic'){const item=itemById(a.id,s);if(item&&a.id!=='dungeon-elevator'&&(['scroll','wand'].includes(item.kind)||item.shape==='scroll')&&s.bag.includes(a.id)&&!(item.kind==='scroll'&&effectiveLevel(s)<item.minLevel)){s.equippedMagic=a.id;note(s,'Magic equipped: '+item.name+'.');}else note(s,'Choose a usable scroll or wand from your bag.');return s;}if(a.type==='unequipMagic'){s.equippedMagic=null;return s;}if(a.type==='useMagic'){if(!s.equippedMagic||!s.bag.includes(s.equippedMagic)){s.equippedMagic=null;note(s,'Equip a scroll or wand in your inventory first.');return s;}a.type='useItem';a.id=s.equippedMagic;}if(a.type==='acknowledgeDragon'){delete s.flags.dragonGreeting;delete s.flags.dragonNotice;return s;}if(a.type==='dragonOrder'){dragonOrder(s,a.order,()=>rand(s));return s;}if(s.flags.dragonWatch?.enemy&&s.mode==='dungeon'){note(s,'Your dragon needs orders outside. Resolve its battle before continuing.');return s;}if(a.type==='acknowledgeRescue'){delete s.flags.rescuePending;delete s.flags.rescueMessage;return s;}if(a.type==='useItem'&&SPELL_ITEMS[a.id]?.kind==='wand')a.id=s.bag.find(id=>id.startsWith(a.id+'~'))||a.id;prepareClock(s);expireBuffs(s);expireAttributeEffects(s);syncAttributeHealth(s,itemById);if(a.type==='clockTick'){
 const previousHour=Math.floor(worldTimeMs(s)/HOUR_MS);
 const previousTime=worldTimeMs(s);
 const levelBefore=effectiveLevel(s);
 if(s.mode==='world'&&s.hp>0&&Number.isFinite(a.elapsedMs)&&a.elapsedMs>=0&&a.elapsedMs<=3600000){
  if(s.hp>=s.maxHp)s.wildernessHealProgress=0;
  else{
   const progress=(s.wildernessHealProgress||0)+a.elapsedMs*effectiveAttributes(s,itemById).constitution/100000;
   const restored=Math.floor(progress+1e-9);
   s.hp=Math.min(s.maxHp,s.hp+restored);
   s.wildernessHealProgress=s.hp===s.maxHp?0:Math.max(0,progress-restored);
  }
 }
 advanceClock(s,a.elapsedMs);
 expireAttributeEffects(s);
 syncAttributeHealth(s,itemById);
 if(effectiveLevel(s)>levelBefore)note(s,'The vampire’s hold fades. Your drained levels return.');
 if(s.equipped==='holy-avenger'&&s.mode!=='ending'){
  const interval=5*60000;
  const due=(s.flags.holyAvengerHealAt??previousTime+interval);
  s.flags.holyAvengerHealAt=due;
  if(worldTimeMs(s)>=due){
   const pulses=1+Math.floor((worldTimeMs(s)-due)/interval);
   s.flags.holyAvengerHealAt=due+pulses*interval;
   const healed=Math.min(s.maxHp-s.hp,Math.ceil(s.maxHp/2)*pulses);
   if(healed>0){s.hp+=healed;note(s,'The Holy Avenger restores '+healed+' health.');}
  }
 }else delete s.flags.holyAvengerHealAt;
 if(s.flags.drakeDefeated&&s.flags.mounts?.includes('dragon')&&!s.flags.dragonCaptured&&s.mode!=='ending'&&!s.dungeon?.ship&&!s.exploration?.area?.startsWith('planet-')){
  const elapsedHours=Math.floor(worldTimeMs(s)/HOUR_MS)-previousHour;
  for(let hour=0;hour<elapsedHours;hour++){
   if(rand(s)>=.01)continue;
   s.flags.mounts=s.flags.mounts.filter(id=>id!=='dragon');
   if(s.flags.mount==='dragon')delete s.flags.mount;
   delete s.flags.dragonWatch;
   s.flags.dragonDeparted=true;
   s.flags.dragonNotice='Gleep found his true love. He licks your face one last time before they fly away together.';
   note(s,s.flags.dragonNotice);
   break;
  }
 }
 return s;
}if(s.mode==='battle'&&s.spellEffects.stunnedTurns>0&&['attack','guard','flee','useItem','alienUse','heal','eat'].includes(a.type)){s.spellEffects.stunnedTurns--;const message='You are stunned by the codfish’s breath and lose this round. '+s.spellEffects.stunnedTurns+' stunned rounds remain.';note(s,message);events.push({kind:'stun',target:'hero',amount:0,sound:'block',message});enemyTurn(s,false,events);return s;}
 if(halAction(s,a,{random:()=>rand(s),note,victory,recover}))return s;
 if(gagActive(s,'helium')&&(['talk','gossipBegin','gossipNext','gossipGuardPay','payGovernor','buy','buyItem','sellItem','rest','pardon','quest','gamble','buyCureAll'].includes(a.type)||a.type?.startsWith('city'))){note(s,HELIUM_REFUSAL);return s;}
 if(a.type==='acknowledgeGag'){delete s.flags.gagReveal;return s;}
 if(a.type==='leaveTravelMerchant'){delete s.flags.travelMerchant;return s;}
 if(a.type==='buyCureAll'){const merchant=s.flags.travelMerchant,price=merchantBuyPrice(s,5000);if(s.mode!=='world'||s.region!==2||!merchant||merchant.x!==s.x||merchant.y!==s.y||merchant.sold||s.gold<price)return s;s.gold-=price;s.bag.push('potion-cure-all');merchant.sold=true;note(s,'You purchase a Potion of Cure-All for '+price.toLocaleString('en-US')+' gold.');return s;}
 const alienResult=alienAction(s,a,note,resetPalaceAttempt);if(alienResult){if(alienResult==='spent'&&s.mode==='battle')enemyTurn(s,false,events);return s;}
 if(a.type==='useItem'&&TREASURE_ITEMS[a.id]?.attributeEffect){
  const item=TREASURE_ITEMS[a.id],index=s.bag.indexOf(a.id),name=attributeLabel(item.attributeEffect.attribute);
  if(index<0||s.mode==='ending'||s.flags.royalQuest==='opening')return s;
  if(effectiveLevel(s)<item.minLevel){note(s,'You must be level '+item.minLevel+' to read '+item.name+'. You keep the scroll.');return s;}
  const amount=applyAttributeItem(s,item);
  if(!amount){note(s,name+' is already at its maximum. You keep '+item.name+'.');return s;}
  s.bag.splice(index,1);s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));
  syncAttributeHealth(s,itemById);
  note(s,'Used '+item.name+'. '+name+' +'+amount+(item.rarity==='legendary'?' permanently.':' for '+item.attributeEffect.durationMinutes+' game minutes.'));
  if(s.mode==='battle')enemyTurn(s,false,events);
  return s;
 }
 if(a.type==='useItem'&&a.id==='galen-fireball-ring'){
  if(s.mode!=='battle'){note(s,'Use Galen’s ring in battle.');return s;}
  if(!s.bag.includes(a.id)||!s.flags.galenRingCharges){note(s,'Galen’s ring has no charges left.');return s;}
  if(fearStopsAttack(s,events))return s;
  const damage=rollAttackDamage(s,castGalenRing(s,()=>rand(s)),()=>rand(s),note);
  const {amount}=damage;
  s.enemy.hp-=amount;
  note(s,'Galen’s ring casts Fireball for '+amount+' damage.');
  clearWangSlugs(s,amount);
  events.push({kind:'magic',target:'enemy',...damage,sound:'fire-whoosh',spell:'fireball'});
  if(s.enemy.hp<=0){events.push({kind:'victory',target:'enemy',amount:0,sound:'victory'});victory(s);}
  else enemyTurn(s,false,events);
  return s;
 }
 if(a.type==='useItem'&&castSpellItem(s,a.id,{
  random:()=>rand(s),note,events,enemyTurn,victory,resetAttempt:resetPalaceAttempt,
  magicBonus:()=>attributeBenefits(s,itemById).magicDamage,
  beforeCast:utility=>utility||!fearStopsAttack(s,events),
  onDamage:(spell,amount)=>{if(spell==='fireball')clearWangSlugs(s,amount);},
 }))return s;
 if(a.type==='useItem'&&GAG_ITEMS[a.id]){const index=s.bag.indexOf(a.id);if(index<0||s.mode==='ending'||s.flags.royalQuest==='opening')return s;s.bag.splice(index,1);s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));note(s,applyGag(s,GAG_ITEMS[a.id]));if(s.mode==='battle')enemyTurn(s,false,events);return s;}
 if(wildernessEventAction(s,a,wildernessContext(s)))return s;
 if(castleAction(s,a,{note,clock,random:()=>rand(s),dexterity:()=>effectiveAttributes(s,itemById).dexterity,startGuard:startCastleGuard}))return s;
 if(cityAction(s,a,note,state=>encounter(state,false,true,true)))return s;
 const branch=s.mode==='world'&&!areaFor(s)&&branchGates(s.region).find(p=>p.x===s.x&&p.y===s.y);
 if(branch&&!branch.boatOnly&&!dragonFlying(s)&&!s.flags['gateAccess:'+branch.id]&&!gagActive(s,'tiny')&&(a.type==='enter'||a.type==='move'&&(a.dx<0&&branch.direction==='west'||a.dy<0&&branch.direction==='north'||a.dy>0&&branch.direction==='south'))&&!DUNGEONS.filter(d=>d.region===s.region).every(d=>s.relics.includes(d.id))){s.flags.borderTauntPending=true;s.flags.borderVoice=Math.floor(rand(s)*3);note(s,'Two relics, you wandering turnip! The guards lock the gate and laugh.');return s;}
 if(s.flags.peacefulEncounter&&s.mode==='world'){
  const offer=s.flags.peacefulEncounter;
  if(a.type==='peacefulAccept'){
   if(offer.offer==='gold')s.gold+=offer.amount;
   else if(offer.offer==='trade'&&s.meals>0){s.meals--;s.bag.push('starter-healing');}
   else if(offer.offer==='sell'&&s.gold>=offer.amount){s.gold-=offer.amount;s.bag.push('starter-healing');}
   else return s;
   note(s,'You and '+offer.name+' part ways peacefully.');
  }
  if(['peacefulAccept','peacefulLeave','move'].includes(a.type))delete s.flags.peacefulEncounter;
  if(a.type.startsWith('peaceful'))return s;
 }
 if(a.type==='mothbridgeAid'){
  const atGate=s.mode==='world'&&pointAt(s)?.id==='mothbridge';
  if((atGate||s.mode==='town'&&s.location==='mothbridge')&&s.hp<s.maxHp&&!s.flags.mothbridgeAid&&s.level<=3){
   s.flags.mothbridgeAid=true;s.hp=s.maxHp;note(s,'Mothbridge offers you a clean bandage and a hot bowl. Health restored.');
  }
  return s;
 }
 if(a.type==='dungeonElevator'){
  const d=s.dungeon,id='dungeon-elevator',index=s.bag.indexOf(id);
  if(s.mode!=='dungeon'||!d||d.royal||d.ship||index<0||!Number.isInteger(a.floor)||a.floor<0||a.floor>dungeonFloors(d)||a.floor===d.floor+1)return s;
  s.bag.splice(index,1);
  s.pendingLoot=s.pendingLoot.filter(item=>item!==id||s.bag.includes(id));
  if(a.floor===0){
   s.mode='world';s.dungeon=null;s.location=null;note(s,'The scroll whisks you back to the surface.');
  }else{
   delete d.secretRoom;d.floor=a.floor-1;arriveAtLadder(d,'up');
   note(s,'The scroll whisks you to level '+a.floor+'.');
  }
  return s;
 }
 if(a.type==='crystalTravel'){
  const id='teleporter-crystal',index=s.bag.indexOf(id),area=AREAS.find(area=>area.kind==='wild'&&area.id===a.land);
  if(s.mode!=='world'||pointAt(s)?.kind!=='teleporter'||index<0||!visitedLands(s).includes(a.land)||a.land===(areaFor(s)?.id??s.region)||(!area&&(!Number.isInteger(a.land)||a.land<0||a.land>=REGIONS.length)))return s;
  s.bag.splice(index,1);s.pendingLoot=s.pendingLoot.filter(item=>item!==id||s.bag.includes(id));
  s.region=area?.region??a.land;s.location=null;delete s.flags.travelMerchant;
  s.exploration??={artifacts:[]};s.exploration.area=area?.id??null;
  if(area){const gate=branchGates(area.region).find(gate=>gate.area===area.id);s.exploration.home={region:area.region,x:gate.x,y:gate.y};}
  const booth=teleporterSite(s.region);s.x=booth.x;s.y=booth.y;
  note(s,'The Alien Artifact delivers you to '+(area?.name??REGIONS[s.region].name)+'.');
  return s;
 }
 if(a.type==='enter'&&s.mode==='world'&&pointAt(s)?.kind==='minorSite'){
  const site=pointAt(s);s.dungeon={site:'minor-site',minorId:site.id,index:site.index,floor:0,x:1,y:1,dir:2,ladderLayout:1,...(site.other?{tunnelExit:{...site.other}}:{})};
  s.mode=s.returnMode='dungeon';s.location=site.id;s.dungeon.dir=openDungeonDirection(s.dungeon);note(s,'You explore '+site.name+'. '+site.floors+' level'+(site.floors===1?'':'s')+' lie within.');return s;
 }
 if(explorationAction(s,a,{note,encounter,clock,pointAt,random:()=>rand(s)}))return s;
 if(a.type==='attackBorderGuards'){const gate=pointAt(s);if(s.mode!=='world'||!s.flags.borderTauntPending||!gate||!['gate','branchGate'].includes(gate.kind)||s.flags['gateAccess:'+gate.id])return s;delete s.flags.borderTauntPending;s.flags.gateAttemptWins=0;s.flags.gateAttemptId=gate.id;startGateGuard(s,gate.id);return s;}
 if(a.type==='acknowledgeBorder'){delete s.flags.borderTauntPending;return s;}
 if(s.flags.royalQuest==='opening'){
  if(a.type==='royalEntranceEnd'){s.flags.royalEntranceSeen=true;return s;}
  if(a.type==='royalIntroNext'){s.flags.royalIntroLine++;if(s.flags.royalIntroLine>=ROYAL_INTRO.length)banishRoyal(s);}
  else if(a.type==='royalIntroSkip')banishRoyal(s);
  return s;
 }
 if(a.type==='allocateAttribute'){
  if(s.mode!=='ending'&&allocateAttribute(s,a.attribute))note(s,attributeLabel(a.attribute)+' increased to '+s.attributes[a.attribute]+'.');
  return s;
 }
 if(a.type==='rummageChest'&&s.mode==='dungeon'){const chest=dungeonChests(s,dungeonMap(s.dungeon)).find(c=>c.x===s.dungeon.x&&c.y===s.dungeon.y&&c.opened);if(!chest||s.dungeon.site==='minor-site'&&!minorSiteDefinition(s.dungeon.minorId)?.treasure||s.openedChests.indexOf(chest.id)>=(s.flags.chestVisitStart??s.openedChests.length)||s.flags['missedCoins:'+chest.id])return s;const coins=1+Math.floor(rand(s)*2);s.flags['missedCoins:'+chest.id]=true;s.gold+=coins;note(s,'Someone was here before you. They missed a few coins.');return s;}
 if(a.type==='openChest'&&s.mode==='dungeon'){const chest=dungeonChests(s,dungeonMap(s.dungeon)).find(c=>c.x===s.dungeon.x&&c.y===s.dungeon.y&&!c.opened);if(!chest){note(s,'Stand on an unopened chest to search it.');return s;}if(sewerGuardian(s)||roadsideGuardian(s)||minorGuardianAt(s))return s;s.openedChests??=[];s.openedChests.push(chest.id);if(chest.trap){
  const chance=Math.min(.95,effectiveAttributes(s,itemById).dexterity/100+rareGearEffect(s,'disarmBonus'));
  if(rand(s)<chance)note(s,'You find and disarm a hidden trap before opening the chest.');
  else{const damage=5+s.region*5+Math.floor(rand(s)*11);s.hp=Math.max(0,s.hp-damage);note(s,'A hidden trap springs! You take '+damage+' damage.');if(!s.hp){recover(s);return s;}}
 }const loot=chest.items||[chest.item].filter(Boolean);s.bag.push(...loot);s.pendingLoot.push(...loot);s.gold+=chest.gold;note(s,`Chest opened: ${[...loot.map(id=>itemById(id).name),chest.gold+' gold'].join(' and ')}.`);return s;}
 if(a.type==='eat'){if(s.meals<1||s.mode==='ending')return s;s.meals--;s.buffs??={};s.buffs.meal=6;setTimedBuff(s,'meal',30);note(s,'A hearty meal grants +4 damage for 30 game minutes. Eating again refreshes the effect.');if(s.mode==='battle')enemyTurn(s,false,events);return s;}
 if(a.type==='pepper'){if(s.mode!=='battle'||s.enemy.speciesId!=='haghilda'||s.enemy.peppered||!s.bag.includes('holy-pepper-grenade'))return s;s.bag.splice(s.bag.indexOf('holy-pepper-grenade'),1);s.pendingLoot=s.pendingLoot.filter(id=>id!=='holy-pepper-grenade');s.enemy.peppered=true;s.enemy.firstContact=false;note(s,'The Holy Pepper Grenade bursts! Haghilda sneezes violently. Her toxic snot damage is reduced by 50% for this battle.');events.push({kind:'magic',target:'enemy',amount:0,sound:'magic'});enemyTurn(s,false,events);return s;}
 if(a.type==='useItem'&&['scroll-vomit','scroll-find-secrets'].includes(a.id)){const i=s.bag.indexOf(a.id);if(i<0||s.mode==='ending'||s.flags.royalQuest==='opening')return s;if(a.id==='scroll-find-secrets'){if(s.mode!=='dungeon'){note(s,'Read this scroll while exploring a dungeon.');return s;}const room=secretAlcove(s.dungeon,dungeonMap(s.dungeon));if(!room||s.dungeon.secretRoom){note(s,'No undiscovered secret doors on this level. You keep the scroll.');return s;}s.dungeon.secretRoom={...room};s.flags['secretRoom:'+s.dungeon.index+':'+s.dungeon.floor]={...room};note(s,'A secret door swings open! A hidden potion alcove is revealed at ('+room.x+', '+room.y+').');}else{s.hp=Math.max(0,s.hp-20);s.flags.poisoned=false;s.buffs.poison=0;events.push({kind:'hit',target:'hero',amount:20,hpAfter:s.hp,sound:'vomit'});note(s,'You vomit spectacularly. You lose 20 health, but the poison is purged.');}s.bag.splice(i,1);s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));if(s.hp<=0)recover(s);else if(s.mode==='battle')enemyTurn(s,false,events);return s;}
 if(a.type==='useItem'&&a.id==='scroll-return'){if(s.exploration?.area?.startsWith('planet-')||s.dungeon?.ship){note(s,'This scroll cannot cross space. Find a planetary teleporter or P-Hopper.');return s;}const i=s.bag.indexOf(a.id);if(i<0||s.mode==='ending'||s.flags.royalQuest==='opening')return s;const town=TOWNS.filter(t=>t.region===s.region&&t.id!=='bellwether'&&!s.flags['palaceBan:'+t.id]&&!castleFineFor(s,t.id)&&!cityOf(s,t.id)?.destroyed).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];if(!town)return s;s.bag.splice(i,1);s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));if(['imprisoned','sewers'].includes(s.flags.royalQuest))s.flags.royalQuest='escaped';if(s.exploration)s.exploration.area=null;s.mode='town';s.returnMode='town';s.enemy=null;s.dungeon=null;s.location=town.id;s.x=town.x;s.y=town.y;delete s.castle;s.townPosition={x:6,y:11};delete s.casino;delete s.flags.guardTauntPending;delete s.flags.borderTauntPending;s.turns++;note(s,'The Scroll of Return carries you safely to '+town.name+'.');return s;}
 if(a.type==='useItem'&&['boat-amulet','shrinkable-sailboat'].includes(a.id)&&s.bag.includes(a.id)){const sailboat=a.id==='shrinkable-sailboat';if(s.mode!=='world'){note(s,'Use the boat outdoors beside the water.');return s;}s.flags[sailboat?'sailboatReady':'rowboatReady']=true;s.flags.boatReveal=sailboat?'sailboat':true;note(s,sailboat?'Bawb’s sailboat unfolds. You can now sail across lakes and open water.':'The amulet unfolds into a full-size rowboat. Lakes and coastal water can now be crossed.');return s;}
 if(a.type==='acknowledgeArtifact'){delete s.flags.artifactReveal;return s;}
 if(a.type==='acknowledgeBoat'){delete s.flags.boatReveal;return s;}
 if(a.type==='equipMount'||a.type==='dismount'){if(!['world','town'].includes(s.mode)){note(s,'Mounts can only be equipped or left in safety outside dungeons and combat.');return s;}if(a.type==='dismount'){delete s.flags.mount;note(s,'You dismount. Your mount remains owned and can be equipped from inventory.');return s;}if(!MOUNTS[a.id]||!s.flags.mounts?.includes(a.id))return s;if(a.id==='dragon'&&s.flags.dragonCaptured){note(s,'Rescue your dragon from Firedrak Mountain before equipping it.');return s;}s.flags.mount=a.id;note(s,'Equipped '+MOUNTS[a.id].name+'. You will ride it in the wilderness.');return s;}
 if(['buyMount','dismount','enclaveHeal','enclaveCure'].includes(a.type)){
 if(s.mode!=='town'||gagActive(s,'helium'))return s;
 const trading=tradePlace(s,a);if(!trading)return s;
 if(a.type==='dismount'){delete s.flags.mount;note(s,'Your mount waits in safe stabling. Select it at the Mount Shop when you return.');return s;}
 if(a.type==='buyMount'){const m=MOUNTS[a.id];if(s.location!=='mothbridge'||trading.merchant!=='mount'||!m)return s;if(a.id==='dragon'&&s.flags.dragonCaptured){note(s,'Your dragon is imprisoned in Firedrak Mountain. Rescue it before riding again.');return s;}s.flags.mounts??=[];if(!s.flags.mounts.includes(a.id)){const price=merchantBuyPrice(s,m.price);if(s.gold<price){note(s,'The stablemaster declines your generous offer of insufficient money.');return s;}s.gold-=price;s.flags.mounts.push(a.id);if(a.id==='dragon')s.flags.dragonGreeting=true;}if(a.id==='dragon')s.flags.dragonHp??=350;note(s,'You own '+m.name+'. Equip it from inventory before riding.');return s;}
 if(s.location!=='salt-choir'||trading.merchant!=='enclave')return s;const cost=merchantBuyPrice(s,a.type==='enclaveHeal'?80:60);if(s.gold<cost){note(s,'The Healing Enclave requires '+cost+' gold.');return s;}if(a.type==='enclaveHeal'&&s.hp===s.maxHp){note(s,'You are already at full health.');return s;}s.gold-=cost;if(a.type==='enclaveHeal')s.hp=s.maxHp;else{s.flags.poisoned=false;s.buffs.poison=0;}note(s,a.type==='enclaveHeal'?'The Enclave restores your health.':'The Enclave cleanses poison. Other potion curses remain unchanged.');return s;
 }
 if(a.type==='useItem'&&POISON_ITEMS[a.id]){
  const index=s.bag.indexOf(a.id),poison=POISON_ITEMS[a.id];
  if(index<0||s.mode==='ending'||s.flags.royalQuest==='opening')return s;
  if(!s.equipped||!WEAPONS[s.equipped]){note(s,'Equip a weapon before applying poison.');return s;}
  s.bag.splice(index,1);s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));
  s.weaponCoating={id:a.id,weapon:s.equipped,rounds:poison.rounds};
  note(s,poison.name+' coats your weapon: +'+poison.damageBonus+' damage for '+poison.rounds+' combat rounds.');
  if(s.mode==='battle')enemyTurn(s,false,events,1,true);
  return s;
 }
 if(a.type==='useItem'&&TREASURE_ITEMS[a.id]?.gadget&&s.bag.includes(a.id)){
 if(a.id==='pocket-teleporter'){if(s.exploration?.area||s.dungeon?.ship){note(s,'This teleporter cannot cross space.');return s;}s.bag.splice(s.bag.indexOf(a.id),1);s.bag.push('scroll-return');return act(s,{type:'useItem',id:'scroll-return'},events);}
 if(s.mode!=='battle'){note(s,'Use this gadget during a fight.');return s;}s.bag.splice(s.bag.indexOf(a.id),1);
 if(a.id==='clock-stop'){s.flags.clockStopped=3;note(s,'Time stops for your enemy for three turns.');}
 if(a.id==='feign-collar'){delete s.flags.clockStopped;resetPalaceAttempt(s);s.enemy=null;s.mode=s.returnMode;events.push({kind:'retreat',target:'hero',amount:0,sound:'door'});note(s,'Your performance is embarrassingly convincing. You escape.');}
 if(a.id==='brass-grenade'){
  const damage=rollAttackDamage(s,35+Math.floor(rand(s)*21),()=>rand(s),note);
  s.enemy.hp-=damage.amount;
  events.push({kind:'magic',target:'enemy',...damage,sound:'fire-whoosh',spell:'fireball'});
  if(s.enemy.hp<=0){events.push({kind:'victory',target:'enemy',amount:0,sound:'victory'});victory(s);}
  else enemyTurn(s,false,events);
 }return s;
 }
 if(a.type==='useItem'){const item=TREASURE_ITEMS[a.id],index=s.bag.indexOf(a.id);if(item?.kind!=='potion'||index<0||s.mode==='ending')return s;const halfHealth=Math.ceil(s.maxHp/2);if(item.healsToHalf&&s.hp>=halfHealth){note(s,'You are already at half health or higher.');return s;}if(item.healing&&s.hp===s.maxHp){note(s,'You are already at full health.');return s;}s.bag.splice(index,1);s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));s.buffs??={};if(item.healing||item.healsToHalf){const amount=item.healsToHalf?halfHealth-s.hp:Math.min(s.maxHp-s.hp,Math.floor(item.healing));s.hp+=amount;events.push({kind:'heal',target:'hero',amount,sound:'magic'});}else{s.buffs[item.effect]=item.duration;setTimedBuff(s,item.effect,item.duration*5);s.buffs.strengthPower=item.effect==='strength'?item.power:s.buffs.strengthPower||0;}note(s,'Used '+item.name+'. '+item.description);if(s.mode==='battle')enemyTurn(s,false,events);return s;}
 if(a.type==='acknowledgeGuards'){delete s.flags.pennilessTown;delete s.flags.guardTauntPending;return s;}
 if(a.type==='royalSearch'&&s.mode==='dungeon'&&s.dungeon?.royal==='cell'){s.flags.royalTrapFound=true;note(s,'Behind the royal chamber pot you find a trapdoor at (3, 3). The lid reads: EMERGENCY EXIT. NO REFUNDS.');return s;}
 if(a.type==='royalSewerReturn'&&s.mode==='town'&&hasRoyalAdmission(s,s.location)&&!s.flags.galenFreed){
  s.mode=s.returnMode='dungeon';s.location=null;
  s.dungeon={index:0,floor:0,x:13,y:13,dir:0,royal:'sewer'};
  s.dungeon.dir=openDungeonDirection(s.dungeon);
  note(s,'You slip through the loose stones beneath Bellwether and return to Galen’s cell.');
  return s;
 }
 if(a.type==='royalWang'&&s.mode==='town'&&s.location==='bellwether'&&s.flags.royalQuest==='wang'){
  if(turnInWang(s)){const index=s.bag.indexOf('wang-sceptre');s.bag.splice(index,1);s.pendingLoot=s.pendingLoot.filter(id=>id!=='wang-sceptre');advanceRoyalAudience(s);}
  else note(s,'Malachi demands Wang’s sceptre and the full 5,000 gold.');
  return s;
 }
 if(a.type==='royalWhip'&&s.mode==='town'&&s.location==='bellwether'&&s.flags.royalQuest==='trial'){
  const index=s.bag.indexOf(BALROG_WHIP);
  if(index<0||!s.flags.balrogDefeated){note(s,'Malachi is still waiting for the Balrog’s whip.');return s;}
  s.bag.splice(index,1);s.pendingLoot=s.pendingLoot.filter(id=>id!==BALROG_WHIP);
  s.flags.balrogTrialComplete=true;s.flags.royalQuest='audience';
  note(s,'Malachi gingerly accepts the whip. Bunnyfoot asks him to put it down and let you speak.');
  return s;
 }
 if(a.type==='royalChoice'&&s.mode==='town'&&s.location==='bellwether'&&['escaped','wang','trial','audience'].includes(s.flags.royalQuest)&&s.flags['garrison:0']&&Object.hasOwn(ROYAL_ENDINGS,a.choice)){
 if(!s.flags.balrogTrialComplete){advanceRoyalAudience(s);return s;}
 s.flags.royalQuest='resolved';s.flags.royalEnding=a.choice;s.flags.princessImprisoned=a.choice==='tyrant';s.flags.married=a.choice==='marriage';s.flags.kingUsurped=a.choice==='tyrant';if(a.choice==='tyrant')s.reputation-=10;s.ending=a.choice;s.mode='ending';note(s,ROYAL_ENDINGS[a.choice]);return s;}
 if(s.casino?.active&&s.mode==='town'&&!['casinoDouble','casinoHit','casinoStand','casinoHold','casinoDraw','casinoShoot','casinoRouletteReveal','gamble','rename'].includes(a.type)){note(s,'Finish your current casino game before leaving the table.');return s;}
 if(a.type==='rename'){const name=String(a.name??'').replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,24);if(name)s.name=name;return s;}
 if(a.type==='acknowledgeLoot'){s.pendingLoot?.shift();return s;}
 if(a.type==='sageBuyIntelligence'){
  if(s.mode!=='town'||s.location!=='mothbridge'||s.castle||townPlace(s)?.id!=='fortune'||!s.flags.sageWonkOffer)return s;
  if(s.attributes.intelligence>=50){note(s,'The Sage smiles: your Intelligence has already reached its limit.');return s;}
  if(s.gold<5000){note(s,'The Sage’s lesson costs 5,000 gold. Come back when you can afford it.');return s;}
  if(applyAttributeItem(s,{kind:'potion',rarity:'legendary',attributeEffect:{attribute:'intelligence',amount:1}})){s.gold-=5000;delete s.flags.sageWonkOffer;note(s,'The Sage of Wonk grants you one permanent point of Intelligence for 5,000 gold.');}
  return s;
 }
 if(a.type==='sageRemoveHelm'){if(s.mode==='town'&&s.location==='mothbridge'&&!s.castle&&townPlace(s)?.id==='fortune'&&s.equippedHead==='helm-thinkiness'){s.equippedHead=null;s.flags.sageWonkOffer=true;note(s,'The Sage of Wonk taps your helmet with a spoon. It pops free! The Helm of Thinkiness is back in your bag. No payment needed.');}return s;}
 if(a.type==='equip'){const item=itemById(a.id,s);if(item?.kind==='head'&&itemById(s.equippedHead,s)?.cursed&&s.equippedHead!==a.id){note(s,'The cursed Helm of Thinkiness refuses to budge. Visit the Sage of Wonk in Mothbridge.');return s;}if(s.mode==='battle'||!s.bag?.includes(a.id)||!gearKey(item?.kind))return s;const slot=item.kind==='ring'?(a.slot==='ring'||a.slot==='ring2'?a.slot:!s.equippedRing?'ring':!s.equippedRing2?'ring2':'ring'):item.kind,key=gearKey(slot);if(item.kind==='ring'){const other=slot==='ring'?'equippedRing2':'equippedRing';if(s[other]===a.id&&s.bag.filter(id=>id===a.id).length<2)s[other]=null;}s[key]=a.id;note(s,`Equipped ${item.name}.`);return s;}
 if(a.type==='unequip'){const key=gearKey(a.slot);if(key&&itemById(s[key],s)?.cursed){note(s,'The cursed Helm of Thinkiness refuses to budge. Visit the Sage of Wonk in Mothbridge.');return s;}if(key&&s.mode!=='battle'&&s[key]){note(s,`You put ${itemById(s[key],s).name} in your bag.`);s[key]=null;}return s;}
 if(s.mode==='ending'&&!['continue'].includes(a.type))return s;
 if(a.type==='continue'){s.mode='world';s.ending=null;s.dungeon=null;s.location=null;return s;}
 if(a.type==='heal'){if(s.potions>0&&s.hp<s.maxHp){s.potions--;events.push({kind:'heal',target:'hero',amount:Math.min(45,s.maxHp-s.hp),sound:'magic'});s.hp=Math.min(s.maxHp,s.hp+45);note(s,'The tonic tastes like regret. It restores 45 health.');if(s.mode==='battle')enemyTurn(s,false,events);}return s;}
 if(s.mode==='battle'){
  if(a.type==='evade'&&s.enemy.firstContact&&s.enemy.surprised){note(s,'You slip past before '+s.enemy.name+' notices you.');s.enemy=null;s.mode=s.returnMode;return s;}
  if(a.type==='attack'&&fearStopsAttack(s,events))return s;
  if(a.type==='attack'&&WEAPONS[s.equipped]?.explosionChance&&rand(s)<WEAPONS[s.equipped].explosionChance){const broken=s.equipped,index=s.bag.indexOf(broken);if(index>=0)s.bag.splice(index,1);s.equipped=null;s.pendingLoot=s.pendingLoot.filter(id=>id!==broken||s.bag.includes(id));s.hp-=100;s.enemy.hp-=100;const message='Your Alien weapon Exploded, doing 100 points of damage to you and your foe!';note(s,message);events.push({kind:'explosion',target:'enemy',amount:100,sound:'fire-whoosh',message},{kind:'hit',target:'hero',amount:100,hpAfter:Math.max(0,s.hp),sound:'hurt',message});if(s.hp<=0){events.push({kind:'defeat',target:'hero',amount:0,sound:'defeat'});recover(s);}else if(s.enemy.hp<=0){events.push({kind:'victory',target:'enemy',amount:0,sound:'victory'});victory(s);}else enemyTurn(s,false,events);return s;}
  if(a.type==='attack'){
   const advantage=s.enemy.surprised,weakness=s.enemy.weakness;
   const effective=weakness==='quick strikes'||weakness==='guard then counter'&&s.flags.guarded||weakness==='steady pressure'&&s.flags.combo>=1;
   const gear=WEAPONS[s.equipped]||UNARMED,benefits=attributeBenefits(s,itemById);
   const accuracy=weaponAccuracy(s,benefits.accuracy)+(advantage?20:0)-(s.enemy.kind==='swift'?8:0);
   if(rand(s)*100>=Math.max(5,accuracy)){
    s.flags.guarded=false;s.flags.combo=0;
    events.push({kind:'miss',target:'enemy',amount:0,sound:'miss'});
    note(s,'Your weapon misses.');
    enemyTurn(s,false,events);return s;
   }
   const roll=gear.damage[0]+Math.floor(rand(s)*(gear.damage[1]-gear.damage[0]+1));
   const base=roll+(s.equipped?s.weapon*4:0)+effectiveLevel(s)*2+benefits.meleeDamage+(s.buffs?.strength>0?s.buffs.strengthPower||0:0)+gearPower(s);
   const raw=Math.floor((base+(s.buffs?.meal>0?4:0))*(gagActive(s,'tiny')?.5:1)*(effective?1.4:1)*(advantage?1.25:1));
   const protection=s.enemy.luteNumb>0?0:Math.floor(s.enemy.armor||0);
   const multiplier=s.equipped==='holy-avenger'&&undead(s.enemy)?3:1;
   const baseDamage=multiplier*(Math.max(1,raw-protection)+weaponMagicDamage(gear,benefits.magicDamage))+poisonDamage(s);
   if(gear.freezeChance&&rand(s)<gear.freezeChance){s.enemy.frozen=1;note(s,'Frost freezes the enemy in place!');}
   s.flags.guarded=false;s.flags.combo=(s.flags.combo||0)+1;
   const attackDamage=rollAttackDamage(s,baseDamage,()=>rand(s),note);
   const {amount}=attackDamage;
   s.enemy.hp-=amount;
   if(gear.lifeSteal){s.hp=Math.min(s.maxHp,s.hp+gear.lifeSteal);note(s,'Your weapon drains '+gear.lifeSteal+' health from the enemy.');}
   events.push({kind:'hit',target:'enemy',...attackDamage,sound:'hit'});
   note(s,`Your weapon deals ${amount} damage.${effective?' You exploit its weakness.':''}${protection?' Its armor absorbs '+Math.min(protection,raw-1)+' damage.':''}`);
   if(s.enemy.hp<=0){
    events.push({kind:'victory',target:'enemy',amount:0,sound:'victory'});victory(s);
   }else{
    if(s.equipped==='dagger-of-insult'&&rand(s)<.2){
     const insults=["You smell like a clam digger's boot!","You're as weak as a baby goblin with a stick!","I thought slime was ugly, but you set a new low record!"];
     const message=insults[Math.floor(rand(s)*insults.length)]+' The enemy loses morale and deals 2 less damage.';
     s.enemy.insulted=true;note(s,message);
     events.push({kind:'taunt',target:'enemy',amount:0,sound:'click',message});
    }
    enemyTurn(s,false,events);
   }
  }
  else if(a.type==='guard'){s.flags.guarded=true;s.flags.combo=0;s.hp=Math.min(s.maxHp,s.hp+3);enemyTurn(s,true,events);}
  else if(a.type==='flee'){resetPalaceAttempt(s);if(rand(s)<.5){note(s,'Your enemy lunges as you retreat — a hit deals double damage!');enemyTurn(s,false,events,2);}if(s.mode==='battle'&&s.enemy){s.mode=s.returnMode;s.enemy=null;s.spellEffects.stunnedTurns=0;if(s.dungeon)arriveAtLadder(s.dungeon,'up');events.push({kind:'retreat',target:'hero',amount:0,sound:'step'});note(s,'You escape. Discretion is a very respectable kind of panic.');}}

  return s;
 }
 if(a.type==='move'&&s.mode==='world'){
  if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)return s;
  const steps=travelSteps(s);if(!steps){note(s,'Your snowshoes drag. One square takes two moves away from snow.');return s;}for(let step=0;step<steps;step++){const x=s.x+a.dx,y=s.y+a.dy;const gate=pointAt(s);if(gate?.kind==='gate'&&a.dy===0&&(gate.target>s.region?a.dx>0:a.dx<0)){crossBorder(s,gate);return s;}const tile=worldTile(s.region,x,y);if(x<1||x>WORLD_WIDTH-2||y<1||y>WORLD_HEIGHT-2||!dragonFlying(s)&&(tile==='water'&&!waterAccess(s,x,y)||tile==='mountain')){note(s,'That route is impassable. Follow the paths around it.');return s;}s.x=x;s.y=y;delete s.flags.travelMerchant;clock(s);const bones=WILD_SITES.find(p=>p.kind==='dragon');if(s.region===bones.region&&!s.flags.ghostDragonDefeated&&!(s.spellEffects?.invisibleMoves>0)&&Math.max(Math.abs(s.x-bones.x),Math.abs(s.y-bones.y))<=1){s.returnMode='world';s.enemy={speciesId:'ghost-dragon',name:'Ghost of the Ancient Dragon',level:12,hp:220,maxHp:220,attack:28,armor:9,gold:260,xp:180,kind:'spectral',weakness:'steady pressure',firstContact:true};s.enemy=nightEnemy(s,s.enemy);s.mode='battle';s.flags.guarded=false;s.flags.combo=0;note(s,'The BEWARE sign shudders. A level-12 ghost dragon rises from its bones!');return s;}if(s.turns>4&&!pointAt(s)&&rand(s)<wildernessChance(s,mountFor(s)?.reduction!==undefined?.08*(1-mountFor(s).reduction):s.flags.transport?.06:.08)*(1-(TREASURE_ITEMS[s.equippedBoots]?.encounterReduction||0)))encounter(s);if(s.mode==='world'&&s.region===2&&!areaFor(s)&&!pointAt(s)&&rand(s)<.02){s.flags.travelMerchant={x:s.x,y:s.y};note(s,'A traveling merchant appears with a suspiciously expensive cure.');return s;}if(s.mode!=='world'||s.flags.wildernessEvent||s.flags.impaledMoves||s.flags.peacefulEncounter||pointAt(s))return s;}return s;
 }
 if(a.type==='payGovernor'&&s.mode==='world'){const p=pointAt(s);if(p?.kind!=='town'||!s.flags['palaceBan:'+p.id])return s;if(s.gold<5000){note(s,'The entrance guards demand the full 5,000 gold.');return s;}s.gold-=5000;delete s.flags['palaceBan:'+p.id];s.wanted[p.region]=0;note(s,'The guards deliver 5,000 gold to the governor. You may enter '+p.name+' again.');return s;}
 if(a.type==='enter'&&s.mode==='world'){
  const p=pointAt(s);if(!p){note(s,'There is nothing to enter here. Follow the map to a settlement or ruin.');return s;}
  if(p.id===PUTRID_PALACE.id){s.mode='dungeon';s.returnMode='dungeon';s.location=p.id;s.dungeon={index:p.index,floor:0,x:1,y:1,dir:1,site:p.id,ladderLayout:1};note(s,'You enter the Putrid Palace. Wang the Nauseating lurks on level 15.');return s;}
  if(p.id==='firedrak-mountain'){s.mode='dungeon';s.location=p.id;s.dungeon={index:2,floor:0,x:1,y:1,dir:1,site:'firedrak',ladderLayout:1};s.dungeon.dir=openDungeonDirection(s.dungeon);note(s,'You enter Firedrak Mountain. Ten levels of imps and fire elementals lie below. Drake the Defiler holds captured dragons on the bottom level.');return s;}
  if(p.id==='leviathan-pump'&&!s.flags.rowboatReady&&!dragonFlying(s)){note(s,'The Leviathan Pump stands on an island in rough water. Find the Boat Amulet in the Drowned Conservatory’s bottom-floor chest.');return s;}
  if(p.kind==='teleporter')return s;
  if(p.kind==='gate'){crossBorder(s,p);return s;}
  if(p.kind==='dragon'){note(s,s.flags.ghostDragonDefeated?'The old bones finally lie quiet.':'The sign reads BEWARE. A chill hangs over the bones.');return s;}
  if(p.kind==='fountain'){const day=gameDay(s);if(s.flags.fountainDay===day)note(s,`The fountain rests. It renews in ${Math.ceil((DAY_MS-worldTimeMs(s)%DAY_MS)/HOUR_MS)} game hours.`);else if(s.hp===s.maxHp)note(s,'You are already healthy. The fountain keeps its blessing for later.');else{s.hp=s.maxHp;s.flags.fountainDay=day;note(s,'Cool silver water restores all your health. The fountain will renew tomorrow.');}return s;}
  if(p.kind==='forest'){s.mode='dungeon';s.location=p.id;s.dungeon={index:0,floor:0,x:1,y:1,dir:1,site:'elf-village'};note(s,p.description);return s;}
  if(p.kind==='town'&&castleFineFor(s,p.id)){note(s,'The guards bar entry to '+p.name+'. Pay the 2,000-gold robbery fine at the gate.');return s;}
  if(p.kind==='town'&&s.flags['palaceBan:'+p.id]){note(s,'The guards bar entry to '+p.name+'. Pay the governor 5,000 gold at this entrance to lift the ban.');return s;}
  if(p.kind==='town'&&cityOf(s,p.id)?.destroyed){note(s,'This town lies in ashes. Rebuild it for 500 gold.');return s;}
  if(p.kind==='town'&&s.gold===0&&s.flags.fineAdmissionTown!==p.id&&!cityOf(s,p.id)&&!hasRoyalAdmission(s,p.id)){s.flags.guardTauntPending=true;s.flags.pennilessTown=p.id;s.flags.pennilessVoice=Math.floor(rand(s)*3);note(s,'The guards refuse entry. Return with some gold in your possession.');return s;}
  if(p.id==='bellwether'&&!s.flags['garrison:0'])s.flags.guardTauntPending=true;
  if(p.id==='bellwether'&&s.flags.royalQuest&&s.flags.royalQuest!=='resolved'){
   if(s.gold<500&&s.flags.fineAdmissionTown!==p.id&&!s.flags['garrison:0']&&!hasRoyalAdmission(s,p.id)){note(s,'The royal guards refuse entry. You need 500 gold in hand. Rock Troll toes are optional.');return s;}
   if(s.flags.royalQuest==='banished'){s.flags.royalQuest='imprisoned';s.flags.royalTrapFound=false;s.mode='dungeon';s.location=null;s.dungeon={index:0,floor:0,x:1,y:1,dir:1,royal:'cell'};note(s,'Malachi the Ineffable refuses to let you see Bunnyfoot. “Five hundred gold? Excellent. Arrest this suspiciously prosperous knave!” You are locked in the royal dungeon. Search for a way out.');return s;}
  }
  s.location=p.id;if(p.kind==='town'){s.mode='town';s.townPosition={x:6,y:11};note(s,p.greeting);if(s.flags.legacy)note(s,`The ${s.flags.legacy} settlement has changed the town. People remember the hand that moved the crown.`);if(s.wanted[s.region]>=3&&!s.flags['townGarrison:'+s.location]){note(s,'Wanted notices bear a surprisingly flattering sketch of you. Guards are watching.');if(s.wanted[s.region]>=4)encounter(s,false,true);}}
  else{s.mode='dungeon';s.dungeon={index:p.index,floor:0,x:1,y:1,dir:1,ladderLayout:1};s.dungeon.dir=openDungeonDirection(s.dungeon);note(s,p.description);}return s;
 }
 if(a.type==='leave'){
  if(s.mode==='town'){s.mode='world';s.location=null;}
  else if(s.mode==='dungeon'){if(s.dungeon.royal){note(s,'The door behind you is locked. Find the trapdoor or the sewer exit.');return s;}const d=s.dungeon,up=dungeonLadders(d,dungeonMap(d)).find(l=>l.direction==='up');
  if(d.x===up?.x&&d.y===up.y){if(d.floor>0)changeDungeonFloor(d,-1);else{s.mode='world';s.returnMode='world';s.dungeon=null;s.location=null;}}
  else note(s,'Return to the upward ladder to leave this floor.');}return s;
 }
 if(s.mode==='dungeon'){
  const d=s.dungeon,m=dungeonMap(d),ladders=dungeonLadders(d,m);
  const lower=ladders.find(l=>l.direction==='down');
  const canDescend=lower?.x===d.x&&lower.y===d.y;
  const atEndpoint=d.x===13&&d.y===13;
  const bottom=d.floor===dungeonFloors(d)-1;
  if(a.type==='turn'&&[-1,1].includes(a.delta))d.dir=(d.dir+a.delta+4)%4;
  if(a.type==='forward'||a.type==='back'||a.type==='strafe'){if(s.equippedBoots==='snowshoes'&&!travelSteps(s)){note(s,'Your snowshoes drag on the dungeon floor.');return s;}const [dx,dy]=DIRS[(d.dir+(a.type==='strafe'?(a.delta<0?-1:1):0)+4)%4],n=a.type==='back'?-1:1;const x=d.x+dx*n,y=d.y+dy*n;if(m[y]?.[x]!==undefined&&m[y][x]!==1){d.x=x;d.y=y;clock(s);if(s.mode==='dungeon'&&(sewerGuardian(s)||roadsideGuardian(s)||minorGuardianAt(s)))return s;if(s.mode==='dungeon'&&d.site!==ROADSIDE_CRYPT&&d.site!=='minor-site'&&!d.ship&&d.royal!=='cell'&&!(x===1&&y===1)&&!(x===13&&y===13)&&!ladders.some(l=>l.x===x&&l.y===y)&&rand(s)<.055*(gagActive(s,'tiny')?.5:1)*randomEncounterMultiplier(s))encounter(s);}else note(s,d.ship?'The ship’s bulkhead blocks your path.':d.site==='elf-village'?'Dense roots and ruined timber block your path.':'Cold stone blocks your path.');}
  if(d.ship||d.site===ROADSIDE_CRYPT)return s;
  if(d.site===BOTTOMLESS_PIT.id){
   if(a.type==='descend'&&canDescend)changeDungeonFloor(d,1);
   const action=pitBottomAction(s);
   if(a.type==='descend'&&action==='fightBalrog')encounter(s,true);
   else if(['descend','pitElevator'].includes(a.type)&&action==='pitElevator'){
    s.mode='world';s.returnMode='world';s.dungeon=null;s.location=null;s.x=BOTTOMLESS_PIT.x;s.y=BOTTOMLESS_PIT.y;
    note(s,'The iron elevator carries you all the way back to the Whispering Barrens.');
   }
   return s;
  }
  if(d.site==='minor-site'){
   const site=minorSiteDefinition(d.minorId);
   if(a.type==='descend'&&canDescend)changeDungeonFloor(d,1);
   else if(a.type==='descend'&&site.kind==='tunnel'&&d.x===13&&d.y===13){const exit=d.tunnelExit;s.mode=s.returnMode='world';s.location=null;s.dungeon=null;s.x=exit.x;s.y=exit.y;note(s,'You emerge from the tunnel on the other side of the mountains.');}
   return s;
  }
  if(d.site===PUTRID_PALACE.id){
   if(a.type==='descend'&&canDescend)changeDungeonFloor(d,1);
   else if(a.type==='descend'&&bottom&&atEndpoint&&!s.flags.wangDefeated)encounter(s,true);
   return s;
  }
  if(d.expedition){if(a.type==='descend'){if(canDescend)changeDungeonFloor(d,1);else if(bottom&&atEndpoint){if(!s.flags['expedition:'+d.expedition])encounter(s,true);else note(s,'The guardian is defeated. Search the remaining chests or return to the entrance.');}}return s;}
  if(d.site==='firedrak'){if(a.type==='descend'){if(canDescend)changeDungeonFloor(d,1);else if(bottom&&atEndpoint){if(!s.flags.drakeDefeated||s.flags.dragonCaptured)encounter(s,true);else note(s,'The dragon cells stand open.');}}return s;}
  if(d.site==='elf-village'){
   if(a.type==='searchElf'&&d.floor===2&&d.x===7&&d.y===7){if(!s.flags.pepperFound){s.flags.pepperFound=true;s.bag.push('holy-pepper-grenade');s.pendingLoot.push('holy-pepper-grenade');note(s,'On the fallen elf you find The Holy Pepper Grenade and a note: Haghilda fears the sacred sneeze. It halves her suffocating snot attack.');}else note(s,'The fallen elf has already been searched.');}
   if(a.type==='descend'){if(!((d.x===13&&d.y===13)||(d.floor===3&&d.x===7&&d.y===7)))note(s,d.floor===3?'Find Haghilda in the central sky chamber at (7, 7).':'Find the root door at (13, 13).');else if(d.floor<3){delete d.secretRoom;d.floor++;d.x=1;d.y=1;d.dir=openDungeonDirection(d);note(s,'You climb through the tree door to elven village level '+(d.floor+1)+'. The creatures here are stronger.');}else if(!s.flags.haghildaDefeated){d.x=7;d.y=7;encounter(s,true);}else note(s,'Haghilda is defeated. The village is free of her toxic reign.');}
   return s;
  }
  if(d.royal){if(a.type==='descend'){
   if(d.royal==='cell'&&d.x===3&&d.y===3){if(!s.flags.royalTrapFound){note(s,'There is a loose stone here. Search the cell.');return s;}s.flags.royalQuest='sewers';s.dungeon={index:0,floor:0,x:1,y:1,dir:1,royal:'sewer'};s.dungeon.dir=openDungeonDirection(s.dungeon);note(s,'You lift the trapdoor and descend into the royal sewers. Find the golden exit.');}
   else if(d.royal==='sewer'&&atEndpoint){
    if(!s.flags.galenFreed){
     if(freeGalen(s))note(s,'You unlock Galen Goodfriend of Gaunt’s cell. He gives you a ring with three Fireball charges and points out some loose stones.');
     else note(s,'Galen Goodfriend of Gaunt calls from behind the bars. Find the skeleton key to free him.');
     return s;
    }
    if(!hasRoyalAdmission(s,'bellwether'))s.flags.royalQuest='escaped';
    s.mode='town';s.returnMode='town';s.dungeon=null;s.location='bellwether';s.townPosition={x:6,y:11};s.x=TOWNS[1].x;s.y=TOWNS[1].y;
    note(s,'You push through the loose stones and emerge inside Bellwether. Find the king at the castle.');
   }
   else note(s,d.royal==='cell'?'Reach the trapdoor at (3, 3).':'Find the sewer exit at (13, 13).');
  }return s;}
  if(a.type==='descend'&&canDescend){changeDungeonFloor(d,1);note(s,`Depth ${d.floor+1}. The air grows still.`);}
  else if(a.type==='descend'&&atEndpoint&&bottom){if(s.relics.includes(DUNGEONS[d.index].id))note(s,'The empty reliquary remembers you.');else if(!s.flags['boss:'+d.index])encounter(s,true);else if(d.index===0)note(s,'The Hearth Seal was stolen by Haghilda in the abandoned elven village.');else claimRelic(s);}
  if(a.type==='claim'&&d.x===13&&d.y===13&&d.floor===(dungeonFloors(d)-1)&&d.index!==0&&s.flags['boss:'+d.index])claimRelic(s);
  return s;
 }
 if(s.mode==='town'){
  if(a.type==='move'){const p=townPosition(s);if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)return s;if(s.equippedBoots==='snowshoes'&&!travelSteps(s)){note(s,'Your snowshoes drag on the cobblestones.');return s;}const x=p.x+a.dx,y=p.y+a.dy;if(townWalkable(x,y,s)){s.townPosition={x,y};s.turns++;if(x===6&&y===12){s.mode='world';s.location=null;}}else note(s,'A building or town wall blocks your path. Follow the streets to its entrance.');return s;}
  const town=TOWNS.find(t=>t.id===s.location)||TOWNS.find(t=>t.region===s.region);
  if(a.type==='gossipBegin'){if(!s.flags.gossipGuardTown)s.flags.gossipVisitCount=1;return s;}
  if(a.type==='gossipNext'){if(s.flags.gossipGuardTown)return s;s.flags.gossipVisitCount=(s.flags.gossipVisitCount||1)+1;if(s.flags.gossipVisitCount>=2)s.flags.gossipGuardTown=town.id;}
  if(['gossipGuardPay','gossipGuardLeave','gossipGuardAttack'].includes(a.type)){
   if(s.flags.gossipGuardTown!==town.id)return s;
   if(a.type==='gossipGuardPay'&&s.gold<5){note(s,'The guard holds out his hand. Five gold. Not four.');return s;}
   delete s.flags.gossipGuardTown;delete s.flags.gossipVisitCount;
   if(a.type==='gossipGuardPay'){s.gold-=5;note(s,'The guard pockets five gold and waves you away from the square.');}
   if(a.type==='gossipGuardLeave')note(s,'You leave the gossiping crowd. The guard finds somebody else to bother.');
   if(a.type==='gossipGuardAttack'){s.wanted[s.region]++;encounter(s,false,true,true);s.enemy.gossipGuard=true;s.enemy.name='The Square’s Royal Bully';}
   return s;
  }
  if(a.type==='talk'&&town.id==='bellwether'&&s.flags.princessImprisoned){note(s,'The chamberlain bows. Bunnyfoot remains imprisoned by your order.');return s;}
  if(a.type==='talk'&&town.id==='bellwether'&&['escaped','wang','trial','audience'].includes(s.flags.royalQuest)){advanceRoyalAudience(s);return s;}
  if(a.type==='talk'||a.type==='gossipNext'){s.flags['gossip:'+town.id]=(s.flags['gossip:'+town.id]||0)+1;const gossip=gossipFor(s);note(s,gossip.subject+': '+gossip.text);const n=s.relics.length;if(n===1)advance(s,2);if(n===2&&town.id==='bellwether'){advance(s,4);s.flags.courtBriefing=true;}if(n===4)advance(s,8);if(n===5)advance(s,11);if(n===7)advance(s,15);if(n===8&&town.id==='bellwether')advance(s,18);}
  if(a.type==='rest'){const price=s.wanted[s.region]>=3?20:8;if(s.gold>=price){s.gold-=price;s.hp=s.maxHp;s.flags.innStayCount=(s.flags.innStayCount||0)+1;s.flags.innStayTown=s.location;note(s,'A bed, a bowl of soup, and eight hours without prophecy. Health restored.');}else{ s.hp=Math.min(s.maxHp,s.hp+20);note(s,'You work in the kitchens for a meal and a bench. Some health restored.');}}
  if(a.type==='buyItem'||a.type==='sellItem'){
   const merchant=tradePlace(s,a),item=itemById(a.id,s),quantity=a.quantity??1;
   if(!merchant?.merchant||!isMerchantResaleItem(item)||!Number.isInteger(quantity)||quantity<1||quantity>99)return s;
   if(s.wanted[s.region]>=4&&!s.flags['townGarrison:'+s.location]){note(s,'Settle your bounty before trading.');return s;}
   if(a.type==='buyItem'){
    if(!stockForMerchant(s,merchant).includes(a.id)){note(s,'This merchant does not sell that item.');return s;}
    if(quantity>merchantItemRemaining(s,item,merchant.id)){note(s,'This merchant does not have that many left.');return s;}
    const price=merchantBuyPrice(s,item.value)*quantity;
    if(s.gold<price){note(s,'You cannot afford this purchase.');return s;}
    s.gold-=price;recordMerchantPurchase(s,item,merchant.id,quantity);
    for(let n=0;n<quantity;n++)s.bag.push(a.id);
    note(s,'Purchased '+quantity+' × '+item.name+' for '+price+' gold.');
   }else{
    if(s.bag.filter(id=>id===a.id).length<quantity)return s;
    if(equipmentKeys.some(k=>s[k]===a.id)){note(s,'Unequip this item before selling it.');return s;}
    const price=merchantSellPrice(s,item)*quantity;
    if(s.gold+price>10000000)return s;
    for(let n=0;n<quantity;n++)s.bag.splice(s.bag.indexOf(a.id),1);
    s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));s.gold+=price;
    note(s,'Sold '+quantity+' × '+item.name+' for '+price+' gold.');
   }
   return s;
  }
  if(a.type==='buy'){
   const place=tradePlace(s,a),quantity=a.quantity??1;
   if(!canBuyMerchantSupply(place,a.item)||!Number.isInteger(quantity)||quantity<1||quantity>99||['weapon','armor','transport'].includes(a.item)&&quantity!==1)return s;
   if(a.item==='potion'&&quantity>merchantItemRemaining(s,'potion',place.id)){note(s,'This merchant is sold out of Bitter tonic.');return s;}
   if(a.item==='food'&&s.meals+quantity*3>999)return s;
   const prices={food:10,potion:18,weapon:45*s.weapon,armor:40*s.armor,transport:150};const price=merchantBuyPrice(s,prices[a.item])*quantity;
   if(!price||s.gold<price){note(s,'Your purse declines on your behalf.');return s;}
   if(s.wanted[s.region]>=4&&!s.flags['townGarrison:'+s.location]){note(s,'The merchant closes the shutters. Settle your bounty first.');return s;}
   if(a.item==='transport'&&s.flags.transport)return s;
   s.gold-=price;if(a.item==='food')s.meals+=3*quantity;
   if(a.item==='potion'){s.potions+=quantity;recordMerchantPurchase(s,'potion',place.id,quantity);}
   if(a.item==='weapon')s.weapon++;if(a.item==='armor')s.armor++;if(a.item==='transport')s.flags.transport=true;
   note(s,`Purchased ${quantity} × ${a.item}.`);
  }
  if(a.type==='steal'){s.wanted[s.region]++;s.reputation-=2;const haul=12+Math.floor(rand(s)*30);s.gold+=haul;note(s,`You lift ${haul} gold. A witness develops an inconvenient memory. Local bounty: ${s.wanted[s.region]*25} gold.`);if(s.wanted[s.region]>=4&&!s.flags['townGarrison:'+s.location])encounter(s,false,true);}
  if(a.type==='pardon'){const cost=s.wanted[s.region]*25;if(s.gold>=cost){s.gold-=cost;s.wanted[s.region]=0;note(s,'Your fine is paid. The law discovers your excellent character.');}else note(s,`The clerk requires ${cost} gold. Kitchen work and wilderness treasure remain available.`);}
  if(a.type==='challenge'){if(s.flags['townGarrison:'+s.location])note(s,'The garrison has surrendered. Its empty barracks are a monument to poor career advice.');else{encounter(s,false,true,true);if(s.location!=='bellwether')s.enemy.name='Palace Guard '+((s.flags['palaceWins:'+s.location]||0)+1)+' of 5';}}
  if(a.type==='gamble'||a.type?.startsWith('casino'))casinoAction(s,a,()=>rand(s),text=>note(s,text));
  if(a.type==='quest'){const q=SIDE_QUESTS.find(q=>q.id===a.id&&q.town===town.id);if(!q||s.quests.includes(q.id))return s;const value=q.need==='gold'?s.gold:q.need==='victory'?s.flags.victories:q.need==='item'?s.bag.filter(id=>id===q.questItem).length:0;if(value<q.target){note(s,`${q.title}: ${q.text} [Need ${q.target} ${q.need}.]`);}else{if(q.need==='gold')s.gold-=q.target;if(q.need==='item'){s.bag.splice(s.bag.indexOf(q.questItem),1);s.pendingLoot=s.pendingLoot.filter(id=>id!==q.questItem);}s.gold+=q.reward;s.xp+=q.xp||15;while(s.xp>=s.level*50){s.xp-=s.level*50;s.level++;s.maxHp+=14;s.hp=Math.min(s.maxHp,s.hp+30);}s.quests.push(q.id);s.reputation+=2;note(s,q.conclusion);note(s,`Quest complete: ${q.title}. ${q.reward} gold; reputation +2.`);}}
  if(a.type==='travel'){const region=Number(a.region);if(!Number.isInteger(region)||region<0||region>3)return s;if(region>Math.floor(s.relics.length/2)){note(s,'The route is sealed. Recover both relics of the preceding land.');return s;}s.region=region;const p=TOWNS.find(t=>t.region===region);s.x=p.x-1;s.y=p.y;s.mode='world';s.location=null;note(s,'You cross into a different sky. The road remembers no titles.');if(region===1&&s.relics.length>=2)advance(s,5);if(region===2&&s.relics.length>=4)advance(s,9);if(region===3&&s.relics.length>=6)advance(s,13);if(region===0&&s.relics.length===8)advance(s,17);}
  if(a.type==='ending'){if(s.relics.length<8||town.id!=='bellwether'){note(s,'The final audience awaits at Bellwether Court with all eight relics.');return s;}if(!Object.hasOwn(ENDINGS,a.choice))return s;s.ending=a.choice;s.flags.legacy=a.choice;s.mode='ending';advance(s,19);if(a.choice==='alliance'){s.reputation+=10;s.wanted=[0,0,0,0];}if(a.choice==='rebel'){s.flags['garrison:0']=true;s.wanted[0]=0;}if(a.choice==='usurper'){s.flags['garrison:0']=true;s.reputation-=10;}note(s,ENDINGS[a.choice]);}
 }
 return s;
}
function claimRelic(s){const d=DUNGEONS[s.dungeon.index];if(s.relics.includes(d.id))return;s.relics.push(d.id);s.pendingLoot??=[];s.pendingLoot.push(d.id);s.gold+=100;s.hp=s.maxHp;note(s,`You recover ${d.relic}.`);advance(s,[0,1,3,6,7,10,12,14,16][s.relics.length]);s.mode='world';s.dungeon=null;s.location=null;}
export function availableActions(s){if(s.mode==='battle')return ['attack','guard','heal','flee'];if(s.mode==='town')return ['talk','rest','buy','gamble','steal','pardon','quest','travel','leave'];if(s.mode==='dungeon')return ['forward','back','strafe','turn','descend','leave','heal'];return ['move','enter','heal'];}
export function saveGame(s){return JSON.stringify({...s,savedAt:Date.now()});}
function migrateWildernessTerrain(s){
 if(s.wildernessTerrainVersion===1)return;
 if(s.wildernessTerrainVersion!==undefined)throw Error('Invalid wilderness terrain version.');
 if(((s.mode==='world'||s.mode==='battle'&&s.returnMode==='world')&&!s.dungeon||s.dungeon?.site===ROADSIDE_CRYPT)&&!areaFor(s)?.id.startsWith('planet-')&&!dragonFlying(s)){
  const area=areaFor(s),tileAt=(x,y)=>area?areaTile(s,x,y):worldTile(s.region,x,y);
  const accessible=(x,y)=>{const t=tileAt(x,y);return t!=='mountain'&&(t!=='water'||waterAccess(s,x,y));};
  const {width,height}=worldSize(s);
  const hasExit=(x,y)=>DIRS.some(([dx,dy])=>accessible(x+dx,y+dy));
  let reachable=null;
  if(!waterAccess(s)){
   const anchor=area?areaSites(s).find(p=>p.kind==='returnGate'):{x:64,y:48};
   if(anchor){
    reachable=new Set();const queue=[anchor];
    for(let i=0;i<queue.length;i++){
     const {x,y}=queue[i],key=x+','+y;
     if(x<1||y<1||x>=width-1||y>=height-1||reachable.has(key)||!accessible(x,y))continue;
     reachable.add(key);for(const [dx,dy]of DIRS)queue.push({x:x+dx,y:y+dy});
    }
   }
  }
  const safe=(x,y)=>accessible(x,y)&&hasExit(x,y)&&(!reachable||reachable.has(x+','+y));
  if(!safe(s.x,s.y)){
   let nearest=null,distance=Infinity;
   for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
    const d=Math.abs(s.x-x)+Math.abs(s.y-y);
    if(d<distance&&tileAt(x,y)!=='water'&&safe(x,y)){nearest={x,y};distance=d;}
   }
   if(nearest){Object.assign(s,nearest);note(s,'The changing wilderness leaves you safely on nearby dry ground.');}
  }
 }
 s.wildernessTerrainVersion=1;
}
export function loadGame(json){
 const s=JSON.parse(json);if(!s||s.version!==1||typeof s.name!=='string'||s.name.length>24)throw Error('This is not a valid Bar the Gates save.');
 if(s.flags?.fineAdmissionTown!==undefined&&!TOWNS.some(t=>t.id===s.flags.fineAdmissionTown))throw Error('Invalid fine admission.');
 if(s.flags?.dragonCaptured||s.flags?.drakeDefeated)s.flags.dragonTheftOccurred=true;
 if(s.flags?.dragonTheftOccurred!==undefined&&typeof s.flags.dragonTheftOccurred!=='boolean')throw Error('Invalid dragon theft history.');
 if(s.flags?.royalEntranceSeen!==undefined&&typeof s.flags.royalEntranceSeen!=='boolean')throw Error('Invalid royal entrance progress.');
 migrateRangedGear(s);prepareWands(s);validateSpellState(s);s.gender??='him';if(!CHARACTER_FACES.some(f=>f.id===s.gender))throw Error('Invalid character gender / face.');
 validateCities(s);
 if(s.wildernessHealProgress!==undefined&&(!Number.isFinite(s.wildernessHealProgress)||s.wildernessHealProgress<0||s.wildernessHealProgress>=1))throw Error('Invalid wilderness recovery progress.');
 if(s.worldTimeMs!==undefined&&(!Number.isSafeInteger(s.worldTimeMs)||s.worldTimeMs<0||s.worldTimeMs>1e15))throw Error('Invalid world clock.');if(s.buffExpiry!==undefined&&(!s.buffExpiry||Array.isArray(s.buffExpiry)||typeof s.buffExpiry!=='object'||Object.entries(s.buffExpiry).some(([key,value])=>!['strength','invisibility','meal','pigFace','tiny','helium','waterBreathing'].includes(key)||!Number.isSafeInteger(value)||value<0||value>1e15)))throw Error('Invalid timed effects.');
 s.meals??=Math.min(999,Math.max(0,Math.floor(s.food||0)));delete s.food;
 if(s.exploration){const e=s.exploration;if(e.area!==null&&!AREAS.some(a=>a.id===e.area&&a.region===s.region))throw Error('Invalid exploration area.');if(!Array.isArray(e.artifacts)||e.artifacts.length>12||new Set(e.artifacts).size!==e.artifacts.length||e.artifacts.some(id=>!AREAS.some(a=>a.kind==='wild'&&a.id===id)))throw Error('Invalid artifacts.');if(e.home&&(!Number.isInteger(e.home.region)||e.home.region<0||e.home.region>3||!Number.isInteger(e.home.x)||e.home.x<1||e.home.x>WORLD_WIDTH-2||!Number.isInteger(e.home.y)||e.home.y<1||e.home.y>WORLD_HEIGHT-2))throw Error('Invalid home route.');}
 if(s.dungeon?.secretRoom){const d=s.dungeon,expected=secretAlcove({...d,secretRoom:undefined},makeDungeon(d.index,d.floor));if(!expected||expected.x!==d.secretRoom.x||expected.y!==d.secretRoom.y)throw Error('Invalid secret room.');}
 if(s.dungeon?.expedition&&!AREAS.some(a=>Array.from({length:a.kind==='planet'?3:2},(_,i)=>a.id+'-cave-'+i).includes(s.dungeon.expedition)&&a.id===s.exploration?.area))throw Error('Invalid expedition.');
 const bounds={region:[0,3],x:[0,WORLD_WIDTH-1],y:[0,WORLD_HEIGHT-1],hp:[0,100000],maxHp:[1,100000],gold:[0,10000000],meals:[0,999],level:[1,1000],xp:[0,1000000],weapon:[1,1000],armor:[1,1000],potions:[0,100000],chapter:[0,19],rng:[0,4294967295],turns:[0,100000000]};
 for(const [k,[min,max]] of Object.entries(bounds))if(typeof s[k]!=='number'||!Number.isFinite(s[k])||s[k]<min||s[k]>max||!Number.isInteger(s[k]))throw Error('Invalid save field: '+k);
 if(!validWeaponCoating(s))throw Error('Invalid weapon poison.');
 validateAttributeState(s);prepareAttributes(s);
 if(s.hp>s.maxHp||!['world','town','dungeon','battle','ending'].includes(s.mode))throw Error('Invalid character state.');
 if(!Array.isArray(s.log)||s.log.length>60||s.log.some(x=>typeof x!=='string'||x.length>10000))throw Error('Invalid journal.');
 for(const [key,allowed] of [['relics',DUNGEONS.map(d=>d.id)],['quests',SIDE_QUESTS.map(q=>q.id)]])if(!Array.isArray(s[key])||s[key].length>allowed.length||new Set(s[key]).size!==s[key].length||s[key].some(x=>!allowed.includes(x)))throw Error('Invalid campaign progress.');
 if(!Array.isArray(s.wanted)||s.wanted.length!==4||s.wanted.some(n=>!Number.isInteger(n)||n<0||n>10000)||!Number.isFinite(s.reputation)||!s.flags||typeof s.flags!=='object'||!Number.isInteger(s.flags.victories)||s.flags.victories<0)throw Error('Invalid reputation data.');
 for(const [key,value]of Object.entries(s.flags))if((key.startsWith('merchantStock:')||key.startsWith('merchantHealing:'))&&(!Number.isInteger(value)||value<0||value>3))throw Error('Invalid merchant stock.');
 if(s.mode==='town'&&!TOWNS.some(t=>t.id===s.location&&t.region===s.region))throw Error('Unknown settlement.');
 validateWildernessEvents(s);
 if(!validCastleState(s))throw Error('Invalid castle state.');
 if(s.dungeon!==null){const d=s.dungeon;if(!d||!Number.isInteger(d.index)||!DUNGEONS[d.index]||DUNGEONS[d.index].region!==s.region||!Number.isInteger(d.floor)||d.floor<0||d.floor>(dungeonFloors(d)-1)||!Number.isInteger(d.x)||!Number.isInteger(d.y)||!Number.isInteger(d.dir)||d.dir<0||d.dir>3||dungeonMap(d)[d.y]?.[d.x]===undefined||dungeonMap(d)[d.y][d.x]===1)throw Error('Invalid dungeon position.');}
 if(s.mode==='dungeon'&&!s.dungeon)throw Error('Missing dungeon.');
 if(s.mode==='battle'){if(!s.enemy||!['world','town','dungeon'].includes(s.returnMode)||s.returnMode==='dungeon'&&!s.dungeon||s.enemy.boss&&(s.returnMode!=='dungeon'||!s.dungeon)||s.returnMode==='town'&&!TOWNS.some(t=>t.id===s.location&&t.region===s.region))throw Error('Invalid encounter.');for(const k of ['hp','maxHp','attack','gold'])if(!Number.isFinite(s.enemy[k])||s.enemy[k]<0||s.enemy[k]>100000)throw Error('Invalid enemy.');if(typeof s.enemy.name!=='string'||s.enemy.name.length>100)throw Error('Invalid enemy name.');}
 if(s.mode==='town'||s.returnMode==='town'){s.townPosition??={x:6,y:11};const p=s.townPosition;if(!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<1||p.x>11||p.y<1||p.y>12)throw Error('Invalid town position.');if(!townWalkable(p.x,p.y,s))s.townPosition={x:6,y:11};}
 if(!validHalChallenge(s))throw Error('Invalid Hal challenge save.');
 if(!validCasino(s.casino,s))throw Error('Invalid casino save.');
 if(s.enemy){for(const key of ['level','armor','xp'])if(s.enemy[key]!==undefined&&(!Number.isInteger(s.enemy[key])||s.enemy[key]<0||s.enemy[key]>100000))throw Error('Invalid enemy '+key);}
 s.bag??=['road-sword'];if(s.equipped===undefined)s.equipped='road-sword';s.pendingLoot??=[];
 if(s.equipmentVersion===undefined){if(Array.isArray(s.bag)&&!s.bag.includes('travel-armor'))s.bag.push('travel-armor');s.equippedArmor='travel-armor';s.equipmentVersion=1;}
 if(s.dungeon?.ladderLayout!==undefined&&s.dungeon.ladderLayout!==1)throw Error('Invalid ladder layout.');
 if(s.dungeon?.site&&!((s.dungeon.site==='minor-site'&&validMinorDungeon(s))||(s.dungeon.site===ROADSIDE_CRYPT&&s.dungeon.floor===0&&Number.isSafeInteger(s.dungeon.cryptId)&&s.dungeon.cryptId>0&&!s.exploration?.area?.startsWith('planet-')&&!s.dungeon.royal&&!s.dungeon.ship&&!s.dungeon.expedition)||(s.dungeon.site===BOTTOMLESS_PIT.id&&s.dungeon.index===BOTTOMLESS_PIT.index&&s.exploration?.area===BOTTOMLESS_PIT.area&&!s.dungeon.expedition&&!s.dungeon.royal&&!s.dungeon.ship)||(s.dungeon.site===PUTRID_PALACE.id&&s.dungeon.index===PUTRID_PALACE.index&&!s.exploration?.area&&!s.dungeon.expedition&&!s.dungeon.royal&&!s.dungeon.ship)||(s.dungeon.site==='elf-village'&&s.dungeon.floor>=0&&s.dungeon.floor<=3&&s.dungeon.index===0)||(s.dungeon.site==='firedrak'&&s.dungeon.floor>=0&&s.dungeon.floor<=9&&s.dungeon.index===2)) )throw Error('Invalid forest site.');
 if(s.dungeon?.minorId!==undefined&&s.dungeon.site!=='minor-site')throw Error('Invalid minor site.');
 if(s.flags.minorDiscovered!==undefined&&(!Array.isArray(s.flags.minorDiscovered)||s.flags.minorDiscovered.length>500||new Set(s.flags.minorDiscovered).size!==s.flags.minorDiscovered.length||s.flags.minorDiscovered.some(id=>!minorSiteDefinition(id))))throw Error('Invalid wilderness discoveries.');
 for(const [key,value] of Object.entries(s.flags))if(key.startsWith('minorCleared:')&&(!minorSiteDefinition(key.slice(13))?.guarded||value!==true))throw Error('Invalid minor guardian progress.');
 if(s.dungeon?.site==='minor-site'&&!(s.mode==='dungeon'||s.mode==='battle'&&s.returnMode==='dungeon'))throw Error('Invalid minor dungeon mode.');
 if(s.enemy?.minorGuardian&&(!validMinorDungeon(s)||!minorGuardian(s)||s.mode!=='battle'||s.returnMode!=='dungeon'||s.enemy.minorGuardian!==s.dungeon.minorId))throw Error('Invalid minor guardian.');
 if(s.flags.fountainDay!==undefined&&(!Number.isInteger(s.flags.fountainDay)||s.flags.fountainDay<0))throw Error('Invalid fountain day.');
 if(s.dungeon?.royal&&!['cell','sewer'].includes(s.dungeon.royal))throw Error('Invalid royal dungeon.');
 for(const [key,value] of Object.entries(s.flags)){if(key.startsWith('secretRoom:')){const match=/^secretRoom:([0-7]):([0-9]{1,2})$/.exec(key);const expected=match?secretAlcove({index:Number(match[1]),floor:Number(match[2])},makeDungeon(Number(match[1]),Number(match[2]))):null;if(!expected||!value||expected.x!==value.x||expected.y!==value.y)throw Error('Invalid discovered secret room.');}if(key.startsWith('gossip:')&&(!TOWNS.some(t=>t.id===key.slice(7))||!Number.isSafeInteger(value)||value<0))throw Error('Invalid gossip progress.');if(key.startsWith('palaceBan:')&&(!TOWNS.some(t=>t.id===key.slice(10)&&t.id!=='bellwether')||typeof value!=='boolean'))throw Error('Invalid palace ban.');}
 for(const [key,value] of Object.entries(s.flags))if(key.startsWith('palaceWins:')&&(!TOWNS.some(t=>t.id===key.slice(11)&&t.id!=='bellwether')||!Number.isInteger(value)||value<0||value>5))throw Error('Invalid palace guard progress.');
 if(s.flags.royalGuardWins!==undefined&&(!Number.isInteger(s.flags.royalGuardWins)||s.flags.royalGuardWins<0||s.flags.royalGuardWins>10000))throw Error('Invalid royal guard progress.');
 // Relic crossings wrote both flags. A lone eastern gate unlock records three guard wins.
 if(s.flags.guardVictories===undefined){
  let known=Math.max(s.flags.royalGuardWins||0,s.flags['garrison:0']||s.flags['townGarrison:bellwether']?20:0);
  for(const town of TOWNS.filter(t=>t.id!=='bellwether'))known+=Math.max(s.flags['palaceWins:'+town.id]||0,s.flags['townGarrison:'+town.id]?5:0);
  known+=Object.values(s.cities).reduce((n,c)=>n+c.guards,0);
  for(const region of [0,1,2,3])if(s.flags['gateAccess:east-gate-'+region]===true&&!s.flags['returnAccess:'+region])known+=3;
  if(Number.isInteger(s.flags.gateAttemptWins)&&s.flags.gateAttemptWins>0)known+=s.flags.gateAttemptWins;
  s.flags.guardVictories=known;
 }
 if(!Number.isSafeInteger(s.flags.guardVictories)||s.flags.guardVictories<0)throw Error('Invalid guard victory count.');
 if(s.flags.royalQuest&&!['opening','banished','imprisoned','sewers','escaped','wang','trial','audience','resolved'].includes(s.flags.royalQuest))throw Error('Invalid royal quest.');
 for(const key of ['galenFreed','wangDefeated','wangTrialComplete','balrogDefeated','balrogTrialComplete'])if(s.flags[key]!==undefined&&typeof s.flags[key]!=='boolean')throw Error('Invalid royal trial progress.');
 if(s.flags.galenRingCharges!==undefined&&(!Number.isInteger(s.flags.galenRingCharges)||s.flags.galenRingCharges<0||s.flags.galenRingCharges>3))throw Error('Invalid Galen ring charges.');
 if(s.enemy?.speciesId===WANG_ID&&(!Number.isInteger(s.enemy.slugs)||s.enemy.slugs<0||s.enemy.slugs>100_000))throw Error('Invalid slug swarm.');
 if(s.flags.royalQuest==='opening'&&(!Number.isInteger(s.flags.royalIntroLine)||s.flags.royalIntroLine<0||s.flags.royalIntroLine>=ROYAL_INTRO.length))throw Error('Invalid introduction.');
 if(s.equipmentVersion!==1||!(s.equippedArmor===null||itemById(s.equippedArmor,s)?.kind==='armor'&&s.bag?.includes(s.equippedArmor)))throw Error('Invalid armor equipment.');
 if(!Array.isArray(s.bag)||s.bag.some(id=>!itemById(id,s)||itemById(id,s).kind==='relic')||s.equipped!==null&&(!Object.hasOwn(WEAPONS,s.equipped)||!s.bag.includes(s.equipped))||!Array.isArray(s.pendingLoot)||s.pendingLoot.some(id=>!itemById(id)||!s.bag.includes(id)&&!s.relics.includes(id)))throw Error('Invalid equipment.');
 s.treasureSeed??=187441;s.openedChests??=[];s.buffs??={};s.equippedBelt??=null;s.equippedRing2??=null;s.equippedHands??=null;s.equippedHead??=null;s.equippedBoots??=null;s.equippedShield??=null;s.equippedRing??=null;s.equippedNecklace??=null;
 if(!Number.isInteger(s.treasureSeed)||s.treasureSeed<0||s.treasureSeed>4294967295||!Array.isArray(s.openedChests)||s.openedChests.length>10000||new Set(s.openedChests).size!==s.openedChests.length||s.openedChests.some(id=>typeof id!=='string'||!validMinorChestId(id)&&!/^(?:crypt:[1-9][0-9]*:0|ship:0:[01]|4:19:boat|sewer:0:key|(?:[0-7]:(?:[0-9]|[1-9][0-9])|(?:cell|sewer):0|elf-village:[0-3]|firedrak:[0-9]|bottomless-pit:(?:[0-9]|[1-9][0-9])|putrid-palace:(?:[0-9]|1[0-4])|(?:wild-(?:[0-9]|1[01])-cave-[01]|planet-[0-2]-cave-[0-2]):[0-2]):(?:[0-5]|secret|boss))$/.test(id)))throw Error('Invalid chest progress.');
 for(const kind of ['ring','ring2','necklace','shield','boots','head','hands','belt']){const id=s[gearKey(kind)];if(id!==null&&(itemById(id)?.kind!==(kind==='ring2'?'ring':kind)||!s.bag.includes(id)))throw Error('Invalid jewelry.');}
 if(s.equippedRing&&s.equippedRing===s.equippedRing2&&s.bag.filter(id=>id===s.equippedRing).length<2)throw Error('Two equipped rings require two owned copies.');
 if(!s.buffs||typeof s.buffs!=='object'||Array.isArray(s.buffs)||Object.entries(s.buffs).some(([k,v])=>!['strength','strengthPower','invisibility','meal','poison','waterBreathing'].includes(k)||!Number.isInteger(v)||v<0||v>100))throw Error('Invalid potion effects.');
 if(s.enemy?.frozen!==undefined&&(!Number.isInteger(s.enemy.frozen)||s.enemy.frozen<0||s.enemy.frozen>3))throw Error('Invalid freeze effect.');
 if(s.flags.haghildaDefeated){grantSlimeBoots(s);grantHearthSeal(s);}if(s.mode==='battle'&&s.returnMode==='dungeon')faceEncounterPassage(s.dungeon);
 if(s.mode==='ending'&&!Object.hasOwn(ENDINGS,s.ending)&&!Object.hasOwn(ROYAL_ENDINGS,s.ending))throw Error('Unknown ending.');if(!s.savedAt&&s.mode==='dungeon'&&s.dungeon.x===1&&s.dungeon.y===1&&!dungeonNavigation(s.dungeon).forward)s.dungeon.dir=openDungeonDirection(s.dungeon);migrateWorldSize(s);migrateWildernessTerrain(s);const size=worldSize(s);if(s.x>=size.width||s.y>=size.height)throw Error('Invalid world position.');prepareClock(s);expireBuffs(s);expireAttributeEffects(s);syncAttributeHealth(s,itemById);return s;
}

function crossBorder(s,gate){const forward=gate.target>s.region;if(forward&&!dragonFlying(s)&&!s.flags['gateAccess:'+gate.id]&&!gagActive(s,'tiny')&&!DUNGEONS.filter(d=>d.region===s.region).every(d=>s.relics.includes(d.id))){s.flags.borderTauntPending=true;s.flags.borderVoice=Math.floor(rand(s)*3);note(s,'Three royal guards bar the gate. Recover both relics from this land before crossing. They introduce your head to a barrel of cold water.');return;}if(DUNGEONS.filter(d=>d.region===s.region).every(d=>s.relics.includes(d.id))){s.flags['gateAccess:'+gate.id]=true;s.flags['returnAccess:'+s.region]=true;}s.region=gate.target;s.x=forward?5:119;s.y=48;s.mode='world';s.dungeon=null;s.location=null;s.turns++;delete s.flags.borderTauntPending;note(s,dragonFlying(s)?'Your dragon soars over the locked gate. The guards shake their fists below.':gagActive(s,'tiny')?'You slip beneath the locked gate, too small for the rude guards to notice.':'The gate opens. You cross into a new land.');if(s.region===1&&s.relics.length>=2)advance(s,5);if(s.region===2&&s.relics.length>=4)advance(s,9);if(s.region===3&&s.relics.length>=6)advance(s,13);}

function grantHearthSeal(s){if(s.relics.includes('tithe-vault'))return;s.relics.push('tithe-vault');s.pendingLoot??=[];s.pendingLoot.push('tithe-vault');note(s,'Haghilda drops the Hearth Seal, one of the two relics needed at the border. Seek the Witness Bell on level 10 of the Widow’s Bell.');advance(s,3);}

function startGateGuard(s,gateId){encounter(s,false,true,true);s.enemy.gateGuard=gateId;s.enemy.name='Border Guard '+((s.flags.gateAttemptWins||0)+1)+' of 3';}

