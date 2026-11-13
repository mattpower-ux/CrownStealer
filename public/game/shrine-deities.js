import {minorSiteDefinition} from './minor-sites.js';
import {applyAttributeItem} from './attributes.js';

export const CHARITY_SHRINE_ID='minor-r0-1';
const gods=[
 {id:'copperclaw',name:'Copperclaw, God of Kobolds',form:'kobold',alignment:'good',runes:'Share the little you carry. A small kindness fills a great cavern.',loot:['common-lesser-healing','small-emerald']},
 {id:'sseth',name:'Sseth, the Lizard God',form:'lizard',alignment:'evil',runes:'Blood warms the cold stone. The scaled faithful guard their offerings.',loot:['weapon-poison-1','small-sapphire'],guardian:{id:'shrine-lizard',name:'Lizard Shrine Zealot',kind:'swift',weakness:'steady pressure',art:{sheet:'monsters-tide',index:3}}},
 {id:'stonefather',name:'The Stonefather, God of Giants',form:'giant',alignment:'good',runes:'Shelter the small beneath your shadow. Strength is a kindness freely given.',loot:['common-lesser-healing','small-pearl']},
 {id:'oozul',name:'Oozul, the Evil Blob God',form:'blob',alignment:'evil',runes:'ALL SHALL DISSOLVE. LEAVE YOUR OFFERINGS AND YOUR BONES.',loot:['weapon-poison-1','small-emerald'],guardian:{id:'bilge-slime',name:'Evil Blob Shrine Spawn',kind:'spectral',weakness:'fire',art:{sheet:'monsters-tide',index:8}}},
];
export function shrineForDungeon(d){
 if(d?.site!=='minor-site')return null;
 const site=minorSiteDefinition(d.minorId);if(site?.kind!=='ruinedShrine')return null;
 const slot=Number(site.id.split('-').at(-1));
 const profile=site.id===CHARITY_SHRINE_ID?{id:'lady-charity',name:'Lady Charity',form:'goddess',alignment:'good',charity:true,runes:'Give five hundred gold, and generosity shall be written upon your face.'}:gods[Math.floor(slot/3)%gods.length];
 return {...profile,charity:!!profile.charity,x:7,y:8,offerX:7,offerY:9};
}
export function charityAudienceAvailable(s){return s.mode==='dungeon'&&s.dungeon?.minorId===CHARITY_SHRINE_ID&&s.dungeon.floor===0&&!s.dungeon.charityPit&&!s.flags.charityChoice&&shrineAudienceAvailable(s);}
export const CHARITY_PIT_DESCRIPTION='Twenty feet below Lady Charity, other cheapskates huddle around a smoky lantern. A ladder leads back to the shrine.';
export function charityPitMap(){
 const map=Array.from({length:15},()=>Array(15).fill(1));
 for(let y=5;y<=12;y++)for(let x=4;x<=11;x++)map[y][x]=0;
 for(let y=1;y<=9;y++)map[y][1]=0;
 for(let x=1;x<=7;x++)map[9][x]=0;
 for(let x=7;x<=13;x++)map[12][x]=0;
 map[13][13]=0;map[1][1]=3;return map;
}
export function charityAction(s,a,{random,note,events}){
 if(!['donate','refuse'].includes(a.choice)||!charityAudienceAvailable(s))return;
 if(a.choice==='donate'){
  if(s.gold<500){note(s,'Lady Charity asks for 500 gold. You may leave and return when you have enough.');return;}
  if(!applyAttributeItem(s,{kind:'potion',rarity:'legendary',attributeEffect:{attribute:'charisma',amount:1}})){note(s,'Your Charisma is already at its limit. Lady Charity leaves the choice open.');return;}
  s.gold-=500;s.flags.charityChoice='donated';s.flags.charityStanding=true;s.reputation+=2;s.turns++;
  note(s,'Lady Charity accepts 500 gold and grants +1 permanent Charisma. Mothbridge and Bellwether welcome your generosity: their merchants offer you a 5% courtesy discount.');return;
 }
 s.flags.charityChoice='refused';const damage=1+Math.floor(random()*150);s.flags.charityPitDamage=damage;
 s.dungeon.charityPit=true;s.dungeon.x=7;s.dungeon.y=9;s.dungeon.dir=3;s.turns++;s.hp=Math.max(0,s.hp-damage);
 events.push({kind:'hit',target:'hero',amount:damage,hpAfter:s.hp,sound:'hurt'});
 note(s,'Lady Charity’s floor gives way! You fall twenty feet and take '+damage+' damage. '+CHARITY_PIT_DESCRIPTION);
 return s.hp===0?'defeated':undefined;
}
export function charityTownDiscount(s){return s.flags?.charityStanding&&['mothbridge','bellwether'].includes(s.location)?.95:1;}
export function validShrineState(s){
 for(const [key,value] of Object.entries(s.flags))if(key.startsWith('shrineStrength:')&&(!shrineForDungeon({site:'minor-site',minorId:key.slice(15)})||value!==true))return false;
 if(s.flags.charityChoice!==undefined&&!['donated','refused'].includes(s.flags.charityChoice))return false;
 if(s.flags.charityStanding!==undefined&&(typeof s.flags.charityStanding!=='boolean'||s.flags.charityStanding&&s.flags.charityChoice!=='donated'))return false;
 if(s.flags.charityPitDamage!==undefined&&(!Number.isInteger(s.flags.charityPitDamage)||s.flags.charityPitDamage<1||s.flags.charityPitDamage>150||s.flags.charityChoice!=='refused'))return false;
 if(s.dungeon?.charityPit!==undefined&&(s.dungeon.charityPit!==true||s.dungeon.site!=='minor-site'||s.dungeon.minorId!==CHARITY_SHRINE_ID||s.flags.charityChoice!=='refused'))return false;
 return true;
}
export function shrineAudienceAvailable(s){const god=shrineForDungeon(s.dungeon);return !!god&&s.mode==='dungeon'&&!s.dungeon.charityPit&&Math.abs(s.dungeon.x-god.x)+Math.abs(s.dungeon.y-god.y)<=2;}
export function shrineOffering(s,a,note){
 const god=shrineForDungeon(s.dungeon);if(!shrineAudienceAvailable(s))return false;
 const id=s.dungeon.minorId;
 if(s.flags['shrineStrength:'+id]){note(s,'This shrine has already bestowed its blessing.');return false;}
 const amount=a.amount??10;if(!Number.isSafeInteger(amount)||amount<10){note(s,'An offering of at least 10 gold is required.');return false;}
 if(s.gold<amount){note(s,'You do not have enough gold for this offering.');return false;}
 if(!applyAttributeItem(s,{kind:'potion',rarity:'legendary',attributeEffect:{attribute:'strength',amount:1}})){note(s,'Your Strength is already at its limit.');return false;}
 s.gold-=amount;s.flags['shrineStrength:'+id]=true;s.turns++;note(s,god.name+' accepts '+amount+' gold and grants +1 permanent Strength.');return true;
}
export function shrineLore(d){
 const god=shrineForDungeon(d);if(!god)return '';
 const region=minorSiteDefinition(d.minorId).region;
 const history=['Hearthmarch villagers raised these shrines before the crown taxed their harvests.','The forge clans of the Cinderlands sheltered refugees beneath these altars.','Tide-country sailors carved prayers here before voyages across the drowned roads.','The last northern keepers preserved these rites through the long royal occupation.'][region];
 return history+' '+(god.alignment==='good'?'The old rite asks worshippers to leave food for strangers and a coin for the weak.':'The old rite demands silence, a covered flame and tribute before the idol.')+' The pedestal names '+god.name+'.';
}
