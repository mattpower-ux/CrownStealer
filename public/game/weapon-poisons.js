export const POISON_ITEMS=Object.fromEntries(['Bitterleaf Venom','Adder Venom','Nightshade Venom','Wyvern Venom','Black Lotus Venom'].map((name,index)=>{
 const rounds=index+1,id='weapon-poison-'+rounds,damageBonus=rounds*2;
 return [id,{id,name,kind:'poison',shape:'potion',color:'#93ba51',rarity:'common',value:[15,35,65,100,150][index],minRegion:Math.min(3,index),damageBonus,rounds,description:`Coats your equipped weapon for +${damageBonus} damage on a hit for ${rounds} combat round${rounds===1?'':'s'}. Expires after the fight or when you change weapons. Applying another poison replaces the coating.`}];
}));
export function poisonDamage(s){const c=s.weaponCoating;return c&&c.weapon===s.equipped&&c.rounds>0?POISON_ITEMS[c.id]?.damageBonus||0:0;}
export function spendPoisonRound(s){if(s.weaponCoating&&--s.weaponCoating.rounds<=0){delete s.weaponCoating;return true;}return false;}
export function validWeaponCoating(s){const c=s.weaponCoating;if(c===undefined)return true;const p=POISON_ITEMS[c?.id];return !!p&&c.weapon===s.equipped&&Array.isArray(s.bag)&&s.bag.includes(c.weapon)&&Number.isInteger(c.rounds)&&c.rounds>=1&&c.rounds<=p.rounds;}
