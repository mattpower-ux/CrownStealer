import {cryptChest} from './roadside-crypt.js';
import {caveProfile,caveLootMatches} from './cave-profiles.js';
import {dungeonFloors} from './dungeon-depths.js';
import {SIDE_QUESTS} from './content.js';
import {GADGETS} from './gadgets.js';
import {ALIEN_ITEMS} from './alien-loot.js';
import {healingAvailable} from './merchant-supplies.js';
import {NAUTICAL_ITEMS,nauticalLoot} from './nautical.js';
import {sewerChest,SKELETON_KEY} from './sewer-treasure.js';
import {SPELL_ITEMS} from './spell-items.js';
import {GAG_ITEMS,gagDrop} from './gag-potions.js';
import {JUNK_ITEMS} from './junk-loot.js';
import {secretAlcove} from './secret-alcoves.js';
import {ATTRIBUTE_NAMES,attributeLabel} from './attributes.js';
import {BALROG_WHIP} from './bottomless-pit.js';
import {royalTrialItems} from './royal-trials.js';
export const RARITIES=['common','rare','epic','legendary'];
export const rarityFor=roll=>roll<.60?'common':roll<.80?'rare':roll<.95?'epic':'legendary';
// One bonus step per five defeated NPC levels; rare enchantments stop at +5.
export const attributeLootBonus=(rarity,npcLevel)=>Math.min(rarity==='rare'?5:Infinity,Math.max(1,Math.floor(npcLevel/5)));
export function randomAttributeLoot(playerLevel,npcLevel,roll){
 if(playerLevel<5||npcLevel<5||roll>=.05)return null;
 return 'ring-wisdom-'+attributeLootBonus('rare',npcLevel);
}
const colors=['#b6baa5','#77bbec','#c69aef','#efcb70'];
export const TREASURE_ITEMS={
 ...royalTrialItems,
 [BALROG_WHIP]:{id:BALROG_WHIP,kind:'key',shape:'key',name:'Whip of the Balrog of Despair',rarity:'legendary',unique:true,notForSale:true,value:0,color:'#f28a50',description:'Proof of the Balrog’s defeat. Bring it to King Malachi at Bellwether Court.'},
};
const families=['bow','mace','wand','sword','spear','axe','crossbow'];
for(let tier=1;tier<=3;tier++)for(let rank=0;rank<4;rank++){
 const rarity=RARITIES[rank],prefix=['Sturdy','Runed','Royal','Mythic'][rank];
 for(const [i,family]of families.entries()){
  const id=`${rarity}-${family}-${tier}`,element=rank===0?null:(i+tier+rank)%2?'fire':'frost',bonus=rank*(tier+1);
  TREASURE_ITEMS[id]={id,kind:'weapon',family,tier,rarity,name:`${prefix} ${family[0].toUpperCase()+family.slice(1)}${element?' of '+(element==='fire'?'Flame':'Frost'):''} ${['','I','II','III'][tier]}`,shape:family,color:colors[rank],toHit:rank+tier-1,damage:[3+tier*3+rank*3,7+tier*4+rank*4],element,elementDamage:bonus,freezeChance:element==='frost'?.12+rank*.08:0,value:20+tier*25+rank*90,description:element==='fire'?`Adds ${bonus} fire damage on every hit.`:element==='frost'?`Adds ${bonus} frost damage; ${12+rank*8}% chance to freeze the enemy for its next attack.`:'A dependable weapon with no elemental enchantment.'};
 }
 for(const kind of ['ring','necklace']){const id=`${rarity}-${kind}-${tier}`,ward=(tier+rank)%2?'fire':'frost';TREASURE_ITEMS[id]={id,kind,tier,rarity,name:`${prefix} ${kind==='ring'?'Ring':'Necklace'} of ${ward==='fire'?'Ember':'Winter'} Warding ${['','I','II','III'][tier]}`,shape:kind,color:colors[rank],value:25+tier*30+rank*90,resistance:ward,resistPercent:10+rank*10,power:kind==='ring'?tier+rank:0,protection:kind==='necklace'?tier+rank:0,description:`Reduces ${ward} damage by ${10+rank*10}%. ${kind==='ring'?`Adds ${tier+rank} weapon damage.`:`Blocks ${tier+rank} incoming damage.`}`};}
 const id=`${rarity}-armor-${tier}`;TREASURE_ITEMS[id]={id,kind:'armor',tier,rarity,name:`${prefix} Mail ${['','I','II','III'][tier]}`,shape:'armor',color:colors[rank],rank:tier+rank,protection:2+tier*2+rank*2,value:30+tier*30+rank*95,description:`Blocks ${2+tier*2+rank*2} incoming damage while equipped.`};
}
for(let rank=0;rank<4;rank++)for(const effect of ['strength','invisibility','lesser-healing','medium-healing','ultra-healing']){const rarity=RARITIES[rank],id=`${rarity}-${effect}`,healing={'lesser-healing':25,'medium-healing':65,'ultra-healing':160}[effect];TREASURE_ITEMS[id]={id,kind:'potion',tier:1,rarity,name:`${rank?rarity[0].toUpperCase()+rarity.slice(1)+' ':''}${effect.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')} Potion`,shape:'potion',color:colors[rank],effect,healing:healing?healing*(1+rank*.5):0,duration:effect==='strength'?6+rank*2:3+rank,power:6+rank*4,value:healing?Math.round(healing/2)+rank*35:30+rank*35,description:healing?`Restores up to ${Math.floor(healing*(1+rank*.5))} health.`:effect==='strength'?`Adds ${6+rank*4} weapon damage for ${(6+rank*2)*5} game minutes.`:`Evades attacks for ${(3+rank)*5} game minutes; evades attacks and prevents random wilderness/dungeon encounters while active.`};}
// Five distinct builds per base item: standard plus four functional specializations.
for(const base of Object.values(TREASURE_ITEMS))for(let style=1;style<=4;style++){
 const rank=RARITIES.indexOf(base.rarity),item={...base,id:base.id+'-v'+style,value:Math.round(base.value*(1+style*.12)),variant:style};let title,extra;
 if(base.kind==='weapon'){item.damage=[...base.damage];if(style===1){title='Keen';item.toHit+=3;item.damage=item.damage.map(n=>Math.max(1,n-2));extra='Keen balance: +3 accuracy bonus, but 2 less base damage.';}if(style===2){title='Crushing';item.toHit-=2;item.damage=item.damage.map(n=>n+4);extra='Heavy balance: +4 base damage, but 2 less accuracy.';}if(style===3){title='Sanguine';item.lifeSteal=2+rank;extra=`Restores ${item.lifeSteal} health on a successful weapon hit.`;}if(style===4){title='Stormbound';item.stormDamage=2+rank*2;extra=`Adds ${item.stormDamage} lightning damage on each hit.`;}}
 else if(base.kind==='potion'){title=['','Concentrated','Lingering','Fortified','Grand'][style];if(item.healing){item.healing=Math.floor(item.healing*(1+style*.2));extra=`This brew restores up to ${item.healing} health.`;}else{item.duration+=style===3?-1:style+1;item.power+=style*2;extra=item.effect==='strength'?`This brew grants +${item.power} weapon damage for ${item.duration*5} game minutes.`:`This brew grants invisibility for ${item.duration*5} game minutes.`;}item.description='';}
 else{title=['','Precise','Resolute','Restorative','Elusive'][style];if(style===1){item.accuracy=2+rank;extra=`Grants +${item.accuracy} accuracy bonus while equipped.`;}if(style===2){item.protection=(item.protection||0)+2+rank;extra=`Additional physical protection: ${2+rank}.`;}if(style===3){item.regeneration=1+rank;extra=`Restores ${item.regeneration} health after surviving an enemy strike.`;}if(style===4){item.evasion=.06+rank*.02;extra=`Adds ${Math.round(item.evasion*100)}% chance to evade an enemy strike.`;}}
 item.name=title+' '+base.name;item.description=(item.description+' '+extra).trim();TREASURE_ITEMS[item.id]=item;
}
// Elven heirlooms use the existing gear effects and rarity bands.
for(const rarity of RARITIES)for(const family of ['bow','sword','ring','necklace']){const base=TREASURE_ITEMS[`${rarity}-${family}-1`],id=`elven-${rarity}-${family}`;TREASURE_ITEMS[id]={...base,id,elven:true,name:`Elven ${base.name}`,description:'Recovered from the abandoned woodland homes. '+base.description};}
TREASURE_ITEMS['shield-frostburn']={id:'shield-frostburn',kind:'shield',shape:'shield',rarity:'epic',tier:3,unique:true,name:'Shield of Frostburn',color:'#9edcf4',value:900,block:[5,10],retaliation:[2,4],description:'Blocks 5–10 damage from every incoming hit. Sharp ice projectiles strike the attacker for 2–4 damage whenever a hit lands, even if the shield absorbs it completely.'};
TREASURE_ITEMS['holy-pepper-grenade']={id:'holy-pepper-grenade',kind:'consumable',shape:'grenade',unique:true,rarity:'epic',name:'The Holy Pepper Grenade',color:'#e6d19a',value:0,description:'Haghilda has one weakness. Throw it during her battle to cut toxic snot damage by 50% for the rest of that encounter. One use.'};
TREASURE_ITEMS['boots-slime-skating']={id:'boots-slime-skating',kind:'boots',shape:'boots',unique:true,rarity:'epic',name:'Boots of Slime Skating',color:'#a4d976',value:800,speed:2,encounterReduction:.2,description:'Skate two wilderness squares per move, stopping safely at landmarks or obstacles. Reduces random wilderness encounter chance by 20% per square while equipped. Haghilda left them unpleasantly moist.'};
for(let tier=1;tier<=3;tier++)for(let rank=0;rank<4;rank++)for(const shape of ['gloves','gauntlets','helmet','crown']){const kind=['gloves','gauntlets'].includes(shape)?'hands':'head',rarity=RARITIES[rank],id=`${rarity}-${shape}-${tier}`,power=shape==='gloves'||shape==='crown'?tier+rank:0,protection=shape==='gauntlets'||shape==='helmet'?tier+rank+1:0;TREASURE_ITEMS[id]={id,kind,shape,tier,rarity,name:`${['Sturdy','Runed','Royal','Mythic'][rank]} ${shape[0].toUpperCase()+shape.slice(1)} ${['','I','II','III'][tier]}`,color:colors[rank],value:25+tier*30+rank*90,power,protection,description:power?`Adds ${power} weapon damage while equipped.`:`Blocks ${protection} incoming damage while equipped.`};}
TREASURE_ITEMS['scroll-return']={id:'scroll-return',kind:'consumable',shape:'scroll',unique:true,rarity:'common',name:'Scroll of Return',color:'#ddc28b',value:60,description:'One use: escape immediately to the nearest safe town in this land, even during combat. Does not heal you.'};
Object.assign(TREASURE_ITEMS,GAG_ITEMS,SPELL_ITEMS,NAUTICAL_ITEMS,{[SKELETON_KEY.id]:SKELETON_KEY});
export const gearKey=kind=>({ring2:'equippedRing2',hands:'equippedHands',head:'equippedHead',boots:'equippedBoots',shield:'equippedShield',weapon:'equipped',armor:'equippedArmor',ring:'equippedRing',necklace:'equippedNecklace'})[kind];
export function hash(text){let n=2166136261;for(const ch of text)n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;}
export function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function sellPrice(item){return item.kind==='gem'?item.value:Math.max(1,Math.floor((item.value||20)/2));}
for(const [gem,base,color]of [['emerald',20,'#7ce69b'],['pearl',35,'#eee4db'],['sapphire',60,'#79aaff'],['diamond',100,'#d9fbff']])for(const [size,multiplier]of [['small',1],['medium',3],['large',6]]){const id=size+'-'+gem;TREASURE_ITEMS[id]={id,kind:'gem',shape:'gem',unique:true,name:size[0].toUpperCase()+size.slice(1)+' '+gem[0].toUpperCase()+gem.slice(1),rarity:'rare',color,value:base*multiplier,description:'A '+size+' '+gem+'. Merchants pay '+base*multiplier+' gold.'};}
// Planetary forged equivalents retain their source bonuses and use stable save IDs.
for(const base of Object.values(TREASURE_ITEMS)){if(base.alien||base.unique||!['weapon','armor','shield','ring','necklace','boots','head','hands','potion'].includes(base.kind))continue;const id='alien-forged-'+base.id;const item={...base,id,alien:true,sourceItem:base.id,material:'unknown metal',name:base.kind==='weapon'?'Alien Energy '+({sword:'Sword',axe:'Axe',mace:'Mace',hammer:'Hammer',spear:'Spear'}[base.shape]||base.shape||'Weapon'):'Alien '+base.name,color:'#8de2e8',description:'Made of an unknown alien metal. '+base.description};if(base.kind==='weapon'){item.damage=base.damage.map(n=>Math.ceil(n*1.2));item.explosionChance=.01;item.description+=' Deals 20% more weapon damage. Each use has a 1% chance to break and explode for 100 damage to you and your foe.';}TREASURE_ITEMS[id]=item;}
for(const item of Object.values(TREASURE_ITEMS)){if(!item.alien)continue;if(!item.name.startsWith('Alien '))item.name='Alien '+item.name;item.material='unknown metal';if(item.kind==='weapon'&&!item.explosionChance){item.damage=item.damage.map(n=>Math.ceil(n*1.2));item.explosionChance=.01;item.description+=' Made of an unknown metal. 20% stronger weapon damage; 1% explosion risk per use, dealing 100 damage to both combatants.';}}
TREASURE_ITEMS['starter-healing']={
 id:'starter-healing', kind:'potion', shape:'potion', unique:true,
 name:'Half-Health Potion', color:'#db7c70', value:0, healsToHalf:true,
 description:'Brings you up to half your maximum health. Only usable below half health.'
};
TREASURE_ITEMS['holy-avenger']={
 id:'holy-avenger',kind:'weapon',family:'sword',shape:'sword',tier:3,rarity:'legendary',
 name:'Holy Avenger Longsword',damage:[24,36],toHit:4,color:'#fff0a8',value:1500,
 description:'Triple damage against undead. While equipped, restores up to half your maximum health every five game minutes. Glows when facing undead or a boss.'
};
export function lootLevel(s){const region=Math.max(0,Math.min(3,s.region||0)),base=[1,8,16,26][region],character=Math.min(Math.max(1,s.level||1),base+8),depth=s.dungeon?(s.dungeon.floor||0)+1:1;return Math.max(base,character,depth);}
export function levelAppropriate(item,s){const level=lootLevel(s);if(item.kind==='potion'){if(item.healing>40+level*5)return false;if(item.effect==='strength'&&item.power>6+level*2)return false;}if(item.kind==='scroll'&&(item.minLevel||1)>level+2)return false;return true;}
function chestBonus(s,id,allowReturn){
 const roll=random(hash(`${s.treasureSeed??187441}:${id}:bonus`));
 const chance=roll();
 if(allowReturn&&chance<.2)return 'scroll-return';
 if(chance>=.5)return null;
 const gem=['emerald','pearl','sapphire','diamond'][Math.floor(roll()*4)];
 const depth=(s.dungeon.floor||0)+1;
 const size=depth>=15&&roll()<.2?'large':depth>=5&&roll()<.3?'medium':'small';
 return size+'-'+gem;
}

function buildChests(s,map){
 const d=s.dungeon;
 if(!d)return [];
 const key=`${d.expedition||d.site||d.royal||d.index}:${d.floor}`;
 const seed=s.treasureSeed??187441,rng=random(hash(`${seed}:${key}`));
 const count=2+Math.floor(rng()*4),cells=[],seen=new Set(),queue=[[1,1]];
 while(queue.length){
  const [x,y]=queue.shift(),k=x+','+y;
  if(seen.has(k)||map[y]?.[x]===undefined||map[y][x]===1)continue;
  seen.add(k);
  if(!(x===1&&y===1)&&map[y][x]!==2&&!(x===13&&y===13))cells.push({x,y});
  for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]])queue.push([x+dx,y+dy]);
 }
 for(let i=cells.length-1;i>0;i--){
  const j=Math.floor(rng()*(i+1));
  [cells[i],cells[j]]=[cells[j],cells[i]];
 }
 const level=lootLevel(s),tier=Math.min(3,1+Math.floor((level-1)/8)),planet=d.expedition?.startsWith('planet-');
 const nautical=d.index===4&&!d.site&&!d.royal&&!d.expedition?Object.values(NAUTICAL_ITEMS).filter(item=>!item.bottomOnly&&item.rarity!=='common'):[];
 return cells.slice(0,count).map((p,i)=>{
  const id=key+':'+i,roll=random(hash(`${seed}:${id}:contents`)),items=[];
  const gear=roll()<.5,rarity=rarityFor(roll());
  if(gear){
   const pool=Object.values(TREASURE_ITEMS).filter(item=>!item.alien&&!item.unique&&levelAppropriate(item,s)&&item.rarity===rarity&&(
    d.site==='elf-village'?item.elven:!item.elven&&(item.kind==='potion'||item.kind==='scroll'||item.tier===tier)
   ));
   const themed=pool.filter(item=>caveLootMatches(item,caveProfile(d.expedition)));
   const choices=themed.length?themed:pool,item=choices[Math.floor(roll()*choices.length)];
   if(item)items.push(nautical.length?nautical[Math.floor(roll()*nautical.length)].id:item.id);
  }
  if(planet){
   for(let n=0;n<items.length;n++)if(TREASURE_ITEMS['alien-forged-'+items[n]])items[n]='alien-forged-'+items[n];
  }else if(items.length){
   const bonus=chestBonus(s,id,!nautical.length);
   if(bonus)items.push(bonus);
  }
  const coins=random(hash(`${seed}:${id}:coins`));
  return {...p,id,item:items[0]||null,items,rarity:items.length?TREASURE_ITEMS[items[0]].rarity:'common',gold:d.floor+1+Math.floor(coins()*(2*(d.floor+1)+3)),opened:!!s.openedChests?.includes(id)};
 });
}

export function dungeonMonsterLoot(s, rarityRoll, itemRoll){
 const rarity=rarityFor(rarityRoll);
 const pool=Object.values(TREASURE_ITEMS).filter(item=>item.rarity===rarity&&!item.unique&&!item.alien&&!item.elven&&item.tier<=1+Math.floor((lootLevel(s)-1)/8)&&levelAppropriate(item,s));
 return pool[Math.floor(itemRoll*pool.length)]?.id;
}
export function merchantStock(region,town='',level=1){const tier=Math.min(3,region+1),base=Object.values(TREASURE_ITEMS).filter(i=>!i.gadget&&!i.alien&&levelAppropriate(i,{region,level})&&healingAvailable(region,i)&&!i.bottomOnly&&!i.gag&&!i.lowLoot&&!i.elven&&(i.kind==='potion'||i.kind==='scroll'&&i.minLevel<=3+region*3||i.tier===tier)&&(i.rarity==='common'||i.rarity==='rare')&&(i.variant||0)===hash(town+':'+i.id.replace(/-v[1-4]$/,''))%5).map(i=>i.id);if(['gallows-fair','ash-market','pearl-defiance','noonless-quay'].includes(town))base.push(...Object.keys(GADGETS));if(['bellwether','iron-choir','lantern-raft','hinge-town'].includes(town))base.push(...Object.values(SPELL_ITEMS).filter(i=>!i.alien&&(i.minLevel||i.spellLevel||1)<=3+region*4).map(i=>i.id));if(region>=3&&!base.some(id=>TREASURE_ITEMS[id]?.effect==='ultra-healing')&&levelAppropriate(TREASURE_ITEMS['common-ultra-healing'],{region,level}))base.push('common-ultra-healing');return [...new Set(base)];}
const chestLayouts=new Map();
export function dungeonChests(s,map){if(!s.dungeon)return [];if(s.dungeon.site==='roadside-crypt')return [cryptChest(s,TREASURE_ITEMS)];if(s.dungeon.ship)return [{x:3,y:10,id:'ship:0:0',item:'alien-0-1',items:['alien-0-1'],rarity:'epic',gold:1},{x:11,y:10,id:'ship:0:1',item:'alien-2-2',items:['alien-2-2'],rarity:'epic',gold:1}].map(c=>({...c,opened:!!s.openedChests?.includes(c.id)}));const d=s.dungeon;if(d.royal==='sewer')return [sewerChest(s,map)];const room=secretAlcove(d,map),closed=room?map.map((row,y)=>row.map((tile,x)=>x===room.x&&y===room.y?1:tile)):map,key=`${s.treasureSeed??187441}:${d.expedition||d.site||d.royal||d.index}:${d.floor}:${lootLevel(s)}`;if(!chestLayouts.has(key)){if(chestLayouts.size>=128)chestLayouts.delete(chestLayouts.keys().next().value);chestLayouts.set(key,buildChests({...s,openedChests:[]},closed));}const chests=chestLayouts.get(key).map(c=>({...c,opened:!!s.openedChests?.includes(c.id)}));if(d.index===4&&d.floor===19&&!d.royal&&!d.site&&!d.expedition&&chests.length){chests[0]={...chests[0],id:'4:19:boat',item:'boat-amulet',items:['boat-amulet'],rarity:'epic',opened:!!s.openedChests?.includes('4:19:boat')};}if((d.site==='firedrak'&&d.floor===9&&s.flags.drakeDefeated)||(d.expedition&&d.floor===2&&s.flags['expedition:'+d.expedition])||(d.site==='elf-village'&&d.floor===3&&s.flags.haghildaDefeated)||(!d.expedition&&!d.site&&!d.royal&&d.floor===dungeonFloors(d)-1&&s.flags['boss:'+d.index])){const id=`${d.expedition||d.site||d.index}:${d.floor}:boss`,pool=Object.values(TREASURE_ITEMS).filter(i=>!i.unique&&!i.alien&&!i.elven&&['rare','epic','legendary'].includes(i.rarity)&&levelAppropriate(i,s)&&i.tier===Math.min(3,1+Math.floor((lootLevel(s)-1)/8))),themed=pool.filter(i=>caveLootMatches(i,caveProfile(d.expedition))),choices=themed.length?themed:pool,item=choices[hash(id)%choices.length];if(item){const reward=d.expedition?.startsWith('planet-')&&TREASURE_ITEMS['alien-forged-'+item.id]?'alien-forged-'+item.id:item.id;chests.push({id,x:13,y:13,item:reward,items:[reward],rarity:item.rarity,gold:d.floor+1,opened:!!s.openedChests?.includes(id)});}}if(d.secretRoom){const id=d.index+':'+d.floor+':secret';chests.push({...d.secretRoom,id,item:'common-lesser-healing',items:['common-lesser-healing'],rarity:'common',gold:d.floor+1,opened:!!s.openedChests?.includes(id)});}return chests;}

export const equipmentKeys=['equipped','equippedArmor','equippedRing','equippedRing2','equippedNecklace','equippedShield','equippedBoots','equippedHands','equippedHead'];
export const equippedAccessories=s=>equipmentKeys.slice(1).map(k=>TREASURE_ITEMS[s[k]]).filter(Boolean);
export const gearPower=s=>equippedAccessories(s).reduce((n,i)=>n+(i.power||0),0);

// Planet-specific discoveries: one weapon, one meal and one suit per planet.
for(let planet=0;planet<3;planet++)for(let slot=0;slot<3;slot++){
 const id=`alien-${planet}-${slot}`,name=[['Prism Sabre','Sunfruit Ration','Glassweave Suit'],['Spore Mace','Singing Truffle','Mycelial Mantle'],['Void Pike','Frostberry Nectar','Aurora Raiment']][planet][slot];
 TREASURE_ITEMS[id]={id,name,unique:true,alien:true,kind:slot===0?'weapon':slot===1?'potion':'armor',shape:slot===0?['sword','mace','spear'][planet]:slot===1?'food':'armor',rarity:'epic',tier:3,color:['#ffd77e','#a7e49e','#b0b6ff'][planet],value:600+planet*200,damage:[28+planet*10,42+planet*12],toHit:8+planet,element:['fire','frost','frost'][planet],elementDamage:8+planet*4,protection:15+planet*5,rank:8+planet,effect:'strength',duration:12,power:18+planet*6,description:slot===0?'Alien weapon with an elemental energy edge.':slot===1?'Alien food: adds '+(18+planet*6)+' damage for 60 game minutes.':'Alien clothing that absorbs '+(15+planet*5)+' damage.'};
}

Object.assign(TREASURE_ITEMS,JUNK_ITEMS);
TREASURE_ITEMS['dungeon-elevator']={id:'dungeon-elevator',encounterOnly:true,name:'Dungeon Elevator Scroll',kind:'consumable',shape:'scroll',rarity:'rare',unique:true,color:'#8ecfe8',value:80,description:'One use. Jump to any floor of the current dungeon, or return to its entrance on the surface.'};
TREASURE_ITEMS['teleporter-crystal']={id:'teleporter-crystal',encounterOnly:true,name:'Teleporter Crystal',kind:'consumable',shape:'teleporter-crystal',rarity:'rare',unique:true,lowLoot:true,color:'#8af4ed',value:180,description:'One use. Insert it into an Alien Artifact to travel to a land you have already visited.'};
TREASURE_ITEMS.webster={id:'webster',kind:'necklace',shape:'webster',lowLoot:true,unique:true,rarity:'legendary',tier:1,name:'Webster',color:'#afb7f5',value:500,description:'A crystal amulet inhabited by a demon of supposedly ultimate knowledge.'};

// Upgrade legacy wand weapons to charged spell items; saved copies are migrated individually.
for(const item of Object.values(TREASURE_ITEMS))if(item.kind==='weapon'&&item.family==='wand'){
 item.kind='wand';item.spellItem=true;item.spell=item.stormDamage?'lightning-strike':item.element==='frost'?'frost-ray':item.element==='fire'?'fireball':'lightning-strike';item.spellLevel=[3,8,15][item.tier-1];item.maxCharges=5;item.description='Any character level. Spell level '+item.spellLevel+'. '+item.maxCharges+' charges when new; only electric wands accept alien batteries. '+({fireball:'Deals 20–30 fire damage.','frost-ray':'Deals 10–18 frost damage and prevents the next enemy attack.','lightning-strike':'Deals 5–10 damage per wand spell level.'}[item.spell]);SPELL_ITEMS[item.id]=item;
}

// Retire ranged gear until ranged combat exists. Preserve older saves with melee replacements.
const retiredRanged=new Map();
for(const [id,item]of Object.entries(TREASURE_ITEMS))if(['bow','crossbow'].includes(item.family)){const replacement=id.startsWith('elven-')?id.replace('-bow','-sword'):id.replace('-crossbow-','-axe-').replace('-bow-','-spear-');if(!TREASURE_ITEMS[replacement])throw Error('Missing melee replacement for '+id);retiredRanged.set(id,replacement);delete TREASURE_ITEMS[id];}
export function migrateRangedGear(s){for(const key of ['bag','pendingLoot'])if(Array.isArray(s[key]))s[key]=s[key].map(id=>retiredRanged.get(id)||id);if(retiredRanged.has(s.equipped))s.equipped=retiredRanged.get(s.equipped);return s;}

Object.assign(TREASURE_ITEMS,ALIEN_ITEMS,SPELL_ITEMS);

Object.assign(TREASURE_ITEMS,GADGETS);

for (const name of ATTRIBUTE_NAMES) {
 const label = attributeLabel(name);
 for (const rarity of ['rare','legendary']) for (const kind of ['scroll','potion']) {
  const permanent = rarity === 'legendary';
  const amount = (permanent ? 2 : 3) + (kind === 'potion' ? 1 : 0);
  const minLevel = kind === 'scroll' ? (permanent ? 8 : 2) : 1;
  const id = `${rarity}-${name}-${kind}`;
  TREASURE_ITEMS[id] = {
   id, kind, rarity, minLevel, tier: permanent ? 2 : 1, shape: kind,
   name: kind === 'scroll' ? `Scroll of ${permanent ? 'Lasting ' : ''}${label}` : `${permanent ? 'Elixir' : 'Potion'} of ${label}`,
   color: colors[permanent ? 3 : 1], value: permanent ? 500 : 90,
   attributeEffect: { attribute: name, amount, ...(permanent ? {} : { durationMinutes: 30 }) },
   description: `Raises ${label} by up to ${amount} ${permanent ? 'permanently' : 'for 30 game minutes'}.${minLevel > 1 ? ` Requires level ${minLevel}.` : ''}`,
  };
 }
}

for (const item of Object.values(TREASURE_ITEMS)) {
 const name = { ring:'dexterity', necklace:'wisdom', armor:'constitution', hands:'strength', head:item.shape === 'crown' ? 'charisma' : 'intelligence' }[item.kind];
 if (!name || item.unique || !['epic','legendary'].includes(item.rarity)) continue;
 const amount = (item.rarity === 'legendary' ? 4 : 2) + item.tier - 1;
 item.attributeBonuses = { [name]:amount };
 item.description += ` While worn, +${amount} ${attributeLabel(name)}.`;
}

for(const q of SIDE_QUESTS)if(q.questItem)TREASURE_ITEMS[q.questItem]={id:q.questItem,kind:'quest',unique:true,name:q.keepsakeName,shape:'scroll',rarity:'rare',value:0,description:'A commission keepsake for '+q.title+'. Return it to the Odd Jobs office.'};

// Fixed IDs retain each rolled enchantment through inventory, trading and save/load.
for(let bonus=1;bonus<=5;bonus++){
 const id='ring-wisdom-'+bonus;
 TREASURE_ITEMS[id]={id,name:'Ring of Wisdom +'+bonus,kind:'ring',shape:'ring',rarity:'rare',minLevel:5,tier:1,unique:true,encounterOnly:true,bottomOnly:true,color:'#77bbec',value:100+bonus*60,attributeBonuses:{wisdom:bonus},description:'While worn, +'+bonus+' Wisdom. Found after defeating level '+(bonus*5)+(bonus===5?' or higher':'–'+(bonus*5+4))+' foes. Rare enchantments never exceed +5.'};
}
