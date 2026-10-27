export const SLOT_IDS=[1,2,3];
export function slotKeys(id){if(!SLOT_IDS.includes(id))throw Error('Unknown adventurer slot.');return {save:id===1?'crownstealer-save-v1':`crownstealer-save-v1-slot-${id}`,checkpoint:id===1?'crownstealer-checkpoint-v1':`crownstealer-checkpoint-v1-slot-${id}`};}
export function selectedSlot(storage){try{const id=Number(storage.getItem('crownstealer-active-slot'));return SLOT_IDS.includes(id)?id:1;}catch{return 1;}}
export function slotSummary(storage,id){try{const text=storage.getItem(slotKeys(id).save);if(!text)return null;const s=JSON.parse(text);if(typeof s.name!=='string'||!Number.isInteger(s.level))return {name:'Unreadable save',level:'?'};return {name:s.name,level:s.level,gold:s.gold,savedAt:s.savedAt};}catch{return {name:'Unreadable save',level:'?'};}}
