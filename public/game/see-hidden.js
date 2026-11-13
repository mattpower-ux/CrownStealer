import {worldTimeMs} from './world-clock.js';

export const SEE_HIDDEN_ITEMS={
 'ring-see-hidden':{name:'Ring of See Hidden',kind:'ring',shape:'ring',rarity:'rare',tier:1,value:160,seeHiddenBonus:.10,description:'While worn, adds 10 percentage points to your chance to notice secret doors and hidden stashes.'},
 'amulet-see-hidden':{name:'Amulet of See Hidden',kind:'necklace',shape:'necklace',rarity:'rare',tier:1,value:220,seeHiddenBonus:.15,description:'While worn, adds 15 percentage points to See Hidden. Worn in the necklace slot.'},
 'talisman-true-sight':{name:'Talisman of True Sight',kind:'necklace',shape:'necklace',rarity:'epic',tier:2,value:420,seeHiddenBonus:.20,description:'While worn, adds 20 percentage points to See Hidden. Worn in the necklace slot.'},
 'potion-see-hidden':{name:'Potion of See Hidden',kind:'potion',shape:'potion',rarity:'common',tier:1,value:60,effect:'seeHidden',duration:6,description:'Adds 25 percentage points to See Hidden for 30 game minutes. Drinking another refreshes the duration.'},
};
for(const [id,item]of Object.entries(SEE_HIDDEN_ITEMS))Object.assign(item,{id,color:'#9fcbd8'});
export function seeHiddenBonus(s){
 const worn=['equippedRing','equippedRing2','equippedNecklace'].reduce((sum,slot)=>sum+(SEE_HIDDEN_ITEMS[s[slot]]?.seeHiddenBonus||0),0);
 return worn+((s.buffExpiry?.seeHidden||0)>worldTimeMs(s)?.25:0);
}
