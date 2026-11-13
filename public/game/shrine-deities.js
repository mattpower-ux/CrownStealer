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
export function charityAudienceAvailable(s){return s.mode==='dungeon'&&s.dungeon?.minorId===CHARITY_SHRINE_ID&&s.dungeon.floor===0&&!s.dungeon.charityPit&&!s.flags.charityChoice&&Math.abs(s.dungeon.x-7)+Math.abs(s.dungeon.y-9)<=1;}
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
 if(s.flags.charityChoice!==undefined&&!['donated','refused'].includes(s.flags.charityChoice))return false;
 if(s.flags.charityStanding!==undefined&&(typeof s.flags.charityStanding!=='boolean'||s.flags.charityStanding&&s.flags.charityChoice!=='donated'))return false;
 if(s.flags.charityPitDamage!==undefined&&(!Number.isInteger(s.flags.charityPitDamage)||s.flags.charityPitDamage<1||s.flags.charityPitDamage>150||s.flags.charityChoice!=='refused'))return false;
 if(s.dungeon?.charityPit!==undefined&&(s.dungeon.charityPit!==true||s.dungeon.site!=='minor-site'||s.dungeon.minorId!==CHARITY_SHRINE_ID||s.flags.charityChoice!=='refused'))return false;
 return true;
}
