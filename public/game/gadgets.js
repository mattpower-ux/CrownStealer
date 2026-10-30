export const GADGETS={
 'clock-stop':{name:'Stop-Doing-That Clock',description:'Single use. Stops the enemy for three attack turns during combat.',value:450,shape:'ring',kind:'gadget'},
 'feign-collar':{name:'Feign Death Collar',description:'Single use. Pretend to be dead and escape a fight. Guard challenges reset.',value:220,shape:'necklace',kind:'gadget'},
 'pocket-teleporter':{name:'Pocket Teleporter',description:'Single use. Returns you to safety in a nearby home-world town. Cannot cross space.',value:180,shape:'scroll',kind:'gadget'},
 'brass-grenade':{name:'Brass Grenade of Impolite Departure',description:'Single use. Deals 35–55 damage to your current opponent.',value:140,shape:'potion',kind:'gadget'}
};for(const [id,item]of Object.entries(GADGETS))Object.assign(item,{id,gadget:true,unique:true,tier:1,rarity:'rare',color:'#b4c6ad'});
