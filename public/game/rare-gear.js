const families=[
 ['ring-wisdom','Ring of Wisdom','ring','wisdom'],
 ['ring-intelligence','Ring of Intelligence','ring','intelligence'],
 ['ring-strength','Ring of Strength','ring','strength'],
 ['ring-toughness','Ring of Toughness','ring','constitution'],
 ['ring-agility','Ring of Agility','ring','dexterity'],
 ['belt-sneakiness','Belt of Sneakiness','belt'],
 ['gloves-thief','Gloves of the Thief','hands'],
 ['boots-speed','Boots of Speed','boots'],
 ['belt-strength','Belt of Strength','belt','strength'],
 ['belt-agility','Belt of Agility','belt','dexterity'],
 ['belt-charisma','Belt of Charisma','belt','charisma'],
];
export const attributeLootBonus=(rarity,npcLevel)=>Math.min(rarity==='rare'?5:Infinity,Math.max(1,Math.floor(npcLevel/5)));
export const RARE_GEAR_ITEMS={};
for(const [base,name,kind,attribute] of families)for(let bonus=1;bonus<=5;bonus++){
 const id=base+'-'+bonus,percent=bonus*10;
 const effect=attribute?{attributeBonuses:{[attribute]:bonus}}:kind==='belt'?{encounterReduction:percent/100}:kind==='hands'?{lockpickBonus:percent/100,disarmBonus:percent/100}:{movementBonus:bonus};
 const description=attribute?'While worn, +'+bonus+' '+attribute[0].toUpperCase()+attribute.slice(1)+'.':kind==='belt'?'Random encounters are '+percent+'% less likely while worn.':kind==='hands'?'Adds '+percent+' percentage points to lockpicking and trap-disarming success while worn.':'Adds '+bonus+' movement step'+(bonus===1?'':'s')+' per move. Stops at obstacles and interactive places.';
 RARE_GEAR_ITEMS[id]={id,name:name+' +'+bonus,kind,shape:kind==='hands'?'gloves':kind,rarity:'rare',minLevel:5,tier:1,unique:true,encounterOnly:true,bottomOnly:true,color:'#77bbec',value:100+bonus*60,...effect,description:description+' Found after defeating level '+(bonus*5)+(bonus===5?' or higher':'–'+(bonus*5+4))+' foes. Rare enchantments never exceed +5.'};
}
export function randomAttributeLoot(playerLevel,npcLevel,roll,choice=0){
 if(playerLevel<5||npcLevel<5||roll>=.05)return null;
 const pick=Math.max(0,Math.min(families.length,Math.floor(choice*(families.length+1))));
 return pick===families.length?'helm-thinkiness':families[pick][0]+'-'+attributeLootBonus('rare',npcLevel);
}
export const rareGearEffect=(s,effect)=>['equippedBelt','equippedHands','equippedBoots'].reduce((sum,slot)=>sum+(RARE_GEAR_ITEMS[s[slot]]?.[effect]||0),0);
export const randomEncounterMultiplier=s=>1-rareGearEffect(s,'encounterReduction');
RARE_GEAR_ITEMS['belt-double-damage']={id:'belt-double-damage',name:'Belt of Double Damage',kind:'belt',shape:'belt',rarity:'legendary',minLevel:5,tier:2,unique:true,encounterOnly:true,bottomOnly:true,color:'#efcb70',value:2500,doubleDamageChance:.5,description:'Each damaging attack has a 50% chance to deal double damage while worn.'};
RARE_GEAR_ITEMS['helm-thinkiness']={id:'helm-thinkiness',name:'Helm of Thinkiness',kind:'head',shape:'thinkiness-helm',rarity:'rare',minLevel:5,tier:1,unique:true,encounterOnly:true,bottomOnly:true,cursed:true,color:'#99a7b5',value:120,attributeBonuses:{intelligence:-2},description:'Cursed: −2 Intelligence while worn. Once equipped, it cannot be removed or replaced. Visit the Sage of Wonk in Mothbridge for free removal. Equipping it again restores the curse.'};
export const randomLegendaryGearLoot=(playerLevel,npcLevel,roll)=>playerLevel>=5&&npcLevel>=5&&roll<.005?'belt-double-damage':null;
