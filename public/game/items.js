import {DUNGEONS} from './content.js';
export const WEAPONS={
 'road-sword':{name:'Traveler’s Sword',toHit:0,damage:[4,8],shape:'sword',color:'#aebbc0',description:'An honest blade. The previous owner was less reliable.'},
 smiting:{name:'Longsword of Smiting',toHit:3,damage:[6,10],shape:'sword',color:'#eccb77',description:'A precise enchanted edge, favored by people with very specific grievances.'},
 'bailiff-axe':{name:'Bailiff’s Final Notice',toHit:1,damage:[10,15],shape:'axe',color:'#c6b197',description:'Collects outstanding debts. Sometimes also outstanding limbs.'},
 'ember-sabre':{name:'Emberglass Sabre',toHit:4,damage:[12,18],shape:'sword',color:'#ef926b',description:'The edge holds yesterday’s fire. Its warranty does not cover curtains.'},
 'mercy-hammer':{name:'Hammer of Conditional Mercy',toHit:2,damage:[16,23],shape:'hammer',color:'#d0aa68',description:'Mercy is available upon request. Processing takes six to eight weeks.'},
 'tide-spear':{name:'Tidemoon Spear',toHit:5,damage:[18,25],shape:'spear',color:'#7ddcda',description:'Balanced under a moon that has never seen your sea.'},
 'bone-cleaver':{name:'Leviathan Cleaver',toHit:3,damage:[22,30],shape:'axe',color:'#ddd7ac',description:'A ceremonial carving knife. The ceremony involved a very large animal.'},
 'star-lance':{name:'Lance of Borrowed Starlight',toHit:6,damage:[24,33],shape:'spear',color:'#c8a5f3',description:'The stars would like it back. You have elected not to answer.'},
 'crown-breaker':{name:'Crown Breaker',toHit:4,damage:[29,39],shape:'hammer',color:'#f1d180',description:'An unusually persuasive argument against inherited authority.'}
};
export function itemById(id){if(Object.hasOwn(WEAPONS,id))return {id,kind:'weapon',...WEAPONS[id]};const d=DUNGEONS.find(d=>d.id===id);return d?{id,kind:'relic',name:d.relic,shape:'relic',color:'#d7be7d',description:`Recovered from ${d.name}. A piece of the crown’s power, and another road opened.`}:null;}
export function weaponAccuracy(s){const w=WEAPONS[s.equipped]||WEAPONS['road-sword'];return Math.min(99,98-s.region*4+w.toHit*2);}
// Original inline vector illustrations stay sharp on tablets and need no network.
export function itemArt(item){const shape=item.shape,metal=item.color;
 const head=shape==='axe'?'<path d="M94 57 Q43 44 47 104 L94 91 M106 57 Q157 44 153 104 L106 91" fill="url(#steel)"/>':shape==='hammer'?'<rect x="52" y="55" width="96" height="45" rx="7" fill="url(#steel)"/><path d="M62 64 H138 M62 90 H138" stroke="#6a5c40"/>':shape==='spear'?'<path d="M100 17 L117 65 L100 85 L83 65 Z" fill="url(#steel)"/>':shape==='relic'?'<path d="M55 75 L78 94 L100 56 L122 94 L145 75 L134 132 H66 Z" fill="url(#steel)"/><circle cx="100" cy="113" r="9" fill="#203d41"/>':'<path d="M100 20 L114 49 L108 133 H92 L86 49 Z" fill="url(#steel)"/><path d="M100 30 V130" stroke="#ffffffaa"/><path d="M69 135 Q100 121 131 135 L128 143 H72 Z" fill="#aa884e"/>';
 return `<svg class="item-art" viewBox="0 0 200 220" role="img" aria-label="${shape} illustration"><defs><linearGradient id="steel"><stop stop-color="#697b85"/><stop offset=".45" stop-color="${metal}"/><stop offset=".55" stop-color="#f9efd4"/><stop offset="1" stop-color="${metal}"/></linearGradient></defs><circle cx="100" cy="106" r="83" fill="${metal}12" stroke="${metal}44"/><g transform="rotate(22 100 110)">${shape!=='relic'?'<rect x="94" y="77" width="12" height="120" rx="4" fill="#65412e"/><path d="M94 152 L106 158 M94 165 L106 171 M94 178 L106 184" stroke="#c29a62"/><circle cx="100" cy="199" r="9" fill="#b39458"/>':''}${head}</g></svg>`;
}
