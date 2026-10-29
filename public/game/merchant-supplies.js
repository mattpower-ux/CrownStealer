// A merchant's two bottles are shared by every quality/variant of the same healing type.
export function healingType(item){return item==='potion'?'tonic':item?.kind==='potion'&&item.healing>0?item.effect:null;}
export function healingAvailable(region,item){const type=healingType(item);return type==='ultra-healing'?region>=3:type==='medium-healing'?region>=2:true;}
const stockKey=(s,item)=>'merchantHealing:'+String(s.location||'region-'+s.region)+':'+healingType(item);
export function merchantPotionRemaining(s,item){if(!healingType(item))return Infinity;return Math.max(0,2-Math.max(0,Number(s.flags?.[stockKey(s,item)])||0));}
export function recordPotionPurchase(s,item){if(healingType(item)){const key=stockKey(s,item);s.flags[key]=Math.min(2,(Number(s.flags[key])||0)+1);}}
