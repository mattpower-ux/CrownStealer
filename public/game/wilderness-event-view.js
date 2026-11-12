export function wildernessEventView(s,button){
 const bawb=s.flags.wildernessEvent?.kind==='bawb';
 const title=bawb?'Bawb the Boatbuilder':'A buried hoard';
 const description=bawb?'“Coffee? I have a splendid little sailboat for one. Seven hundred gold. It even shrinks to fit in your pack!”':'Something glitters beneath the dirt. Real coins—or someone’s bait?';
 return `<div class="gossip-guard-scene">${bawb?'<img src="/assets/bawb-boatbuilder.webp" alt="Bawb offers coffee beside the plans for his shrinkable sailboat">':''}<div><p class="eyebrow">ON THE WILDERNESS ROAD</p><h3>${title}</h3><blockquote>${description}</blockquote><p>Your purse: ${s.gold} gold.</p><div class="panel-actions">${button(bawb?'Buy sailboat · 700 gold':'Take it',{type:'wildernessChoice',choice:bawb?'buy':'take'})}${button('Leave it',{type:'wildernessChoice',choice:'leave'})}</div></div></div>`;
}
