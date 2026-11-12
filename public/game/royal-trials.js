export const PUTRID_PALACE={id:'putrid-palace',kind:'putridPalace',name:'The Putrid Palace',region:1,index:2,x:72,y:76};
export const PUTRID_PALACE_FLOORS=15;
export const PUTRID_PALACE_SEED=10;
export const WANG_ID='wang-nauseating';
export const WANG_TRIAL_DIALOGUE=[
 {speaker:'King Malachi the Ineffable',text:"So, the little pipsqueak escaped. I don't know about you guys, but I think we should lop off his head this time!"},
 {speaker:'Princess Bunnyfoot',text:"No father. He's so entertaining. Give him another awful thing to do to test him!"},
 {speaker:'King Malachi the Ineffable',text:'Good idea, my clever girl! Ok pig farmer. Bring me 5000 gold this time and the sceptre of Wang the Nauseating, the lord of the Putrid Palace!'}
];
export const royalTrialItems={
 'galen-fireball-ring':{id:'galen-fireball-ring',name:"Galen's Ring of Fireball",kind:'ring',shape:'ring',rarity:'legendary',unique:true,notForSale:true,value:0,color:'#ffb162',description:'A gift from Galen Goodfriend of Gaunt. Three fireballs, each dealing 90–120 damage. No recharge.'},
 'wang-sceptre':{id:'wang-sceptre',name:'Sceptre of Wang the Nauseating',kind:'key',shape:'wand',rarity:'legendary',unique:true,notForSale:true,value:0,color:'#b1aa63',description:'Proof that Wang has fallen. Bring it and 5,000 gold to Bellwether.'}
};
export function freeGalen(s){
 if(s.flags.galenFreed||!s.bag.includes('sewer-skeleton-key'))return false;
 s.flags.galenFreed=true;s.flags.galenRingCharges=3;
 if(!s.bag.includes('galen-fireball-ring')){s.bag.push('galen-fireball-ring');s.pendingLoot.push('galen-fireball-ring');}return true;
}
export function castGalenRing(s,random){
 if(!s.bag.includes('galen-fireball-ring')||!(s.flags.galenRingCharges>0))return 0;
 s.flags.galenRingCharges--;return 90+Math.floor(random()*31);
}
export function turnInWang(s){
 if(s.flags.wangTrialComplete||s.gold<5000||!s.bag.includes('wang-sceptre'))return false;
 s.gold-=5000;s.flags.wangTrialComplete=true;return true;
}
export function wangEncounter(){return {speciesId:WANG_ID,name:'Wang the Nauseating',level:20,hp:650,maxHp:650,attack:42,armor:15,gold:750,xp:800,kind:'brute',boss:true,firstContact:true,slugs:0,weakness:'Fireball destroys the one-hit-point slug swarm.'};}
