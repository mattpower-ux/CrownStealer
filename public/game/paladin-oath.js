import {effectiveLevel} from './attributes.js';
import {undead} from './spell-items.js';

export const PERCIVAL_REJECTION="I'm sorry, I should have taken you for just barely above average when I met you. Farewell, Schmuck.";
export const PALADIN_FORSAKEN='FORSAKEN! BREAK YOU YOUR SACRED PALADIN VOWS! BEGONE WITH YOUR POWERS. GOOD LUCK, SCHMUCK!';
export const PALADIN_GAMBLING_THOUGHT='Gambling is evil. I should arrest all these people.';
export const PALADIN_ITEMS={
 'holy-sword':{id:'holy-sword',name:'Holy Sword',kind:'weapon',family:'sword',shape:'sword',rarity:'legendary',tier:2,damage:[18,26],toHit:4,value:1000,color:'#fff0ae',description:'A consecrated sword. In a paladin’s hands, it deals double weapon damage against undead.'},
 'pearl-of-wisdom':{id:'pearl-of-wisdom',name:'Pearl of Wisdom',kind:'gem',shape:'pearl',rarity:'common',unique:true,bottomOnly:true,encounterOnly:true,value:1,color:'#e8e4cf',description:"Don't Be That Guy."},
};
export const isPaladin=s=>s.flags?.percivalOath==='accepted';
export const percivalAudienceAvailable=s=>s?.mode==='dungeon'&&s.dungeon?.site==='percivals-lament'&&s.dungeon.floor===2&&s.dungeon.x===13&&s.dungeon.y===13&&s.flags.percivalLicheDefeated&&!s.flags.percivalOath;

export function handlePaladinOath(s,a,note,itemById){
 if(a.type==='acknowledgePaladinForsaken'){delete s.flags.paladinForsakenPending;return true;}
 if(a.type!=='percivalOath')return false;
 if(!percivalAudienceAvailable(s)||!['accept','reject'].includes(a.choice))return true;
 if(a.choice==='reject'){
  s.flags.percivalOath='rejected';s.bag.push('pearl-of-wisdom');note(s,PERCIVAL_REJECTION);return true;
 }
 if(s.flags.wizardApprentice==='accepted'){s.flags.wizardApprentice='retired';delete s.flags.wizardTimers;note(s,'You retire your wizard apprenticeship honorably and take the paladin’s oath.');}
 s.flags.percivalOath='accepted';
 if(s.weaponCoating){delete s.weaponCoating;note(s,'You clean the poison from your weapon before taking the oath.');}
 note(s,'You swear the paladin’s oath: no poison, theft, attacks on good creatures, or bargains with orcs, goblins, and trolls. Sir Percival grants +2 Strength, +2 Charisma, immunity to fear, and TURN DEAD.');
 return true;
}

export function paladinOathBlocks(s,a,note,itemById){
 if(!isPaladin(s)||!['gamble','casinoDouble'].includes(a.type))return false;
 note(s,PALADIN_GAMBLING_THOUGHT);return true;
}

export function poisoningItem(item){
 if(!item||/^(?:cure|cleanse|resist|protection)/.test(item.spell||item.effect||''))return false;
 return item.kind==='poison'||item.element==='poison'||item.poison===true||Number(item.poisonDamage)>0||
  /(?:^|-)(?:poison|venom)(?:-|$)/.test(item.spell||item.effect||'')||
  ['weapon','wand','scroll'].includes(item.kind)&&/^(?:wand|scroll|weapon)-(?:of-)?(?:poison|venom)(?:-|$)/.test(item.id||'');
}

// Inspect the completed action. Invalid commands, unaffordable deals and failed
// item activation never strip powers; a real theft attempt does, even if caught.
export function revokeBrokenOath(before,s,a,events,note,itemById){
 if(!isPaladin(before)||!isPaladin(s))return false;
 let reason;
 const attacked=events.some(e=>e.target==='enemy'&&['hit','miss','magic','explosion','stun'].includes(e.kind));
 const good=before.enemy?.good===true||before.enemy?.alignment==='good'||/\b(?:unicorn|fey|faerie|fairy)\b/i.test([before.enemy?.speciesId,before.enemy?.name,before.enemy?.race,before.enemy?.kind].filter(Boolean).join(' '));
 if(before.mode==='battle'&&['attack','useItem','useMagic','alienUse','pepper','turnDead'].includes(a.type)&&attacked&&good)reason='You attacked a good creature.';
 if(a.type==='steal'&&(s.gold!==before.gold||s.reputation!==before.reputation)||
    a.type==='robCastleChest'&&events.some(e=>e.kind==='castleLockpick')||
    a.type==='robDiscoveryChest'&&s.turns>before.turns)reason='You committed theft.';
 const id=a.type==='useMagic'?before.equippedMagic:a.id;
 const instance=before.bag.find(owned=>owned===id||owned.startsWith(id+'~'))||id;
 const item=itemById(instance,before);
 if(['useItem','useMagic'].includes(a.type)&&poisoningItem(item)){
  // Legacy loose wands become instances when act() prepares the inventory.
  // That migration alone is not casting or consuming a poisoning item.
  const afterInstance=s.bag.includes(instance)?instance:s.bag.find(owned=>owned.startsWith(instance+'~'));
  const spent=item.kind==='wand'?(item.charges??item.maxCharges??0)>(itemById(afterInstance,s)?.charges??0):
   before.bag.filter(owned=>owned===instance).length>s.bag.filter(owned=>owned===instance).length;
  if(spent||attacked||JSON.stringify(before.weaponCoating)!==JSON.stringify(s.weaponCoating))reason='You used poison.';
 }
 if(a.type==='equip'&&s.equipped!==before.equipped&&s.equipped===id&&poisoningItem(item))reason='You equipped a poisoning weapon.';
 if(a.type==='attack'&&attacked&&(before.weaponCoating||poisoningItem(itemById(before.equipped,before))))reason='You attacked with poison.';
 const trader=a.type==='peacefulAccept'?before.flags.peacefulEncounter:before.flags.travelMerchant;
 const traded=s.gold!==before.gold||s.meals!==before.meals||s.bag.length!==before.bag.length;
 if(traded&&((a.type==='peacefulAccept'&&['trade','sell'].includes(trader?.offer))||['buyItem','buy','buyCureAll'].includes(a.type))&&
   /\b(?:orc|orcs|goblin|goblins|troll|trolls)\b/i.test([trader?.speciesId,trader?.name,trader?.race,trader?.kind].filter(Boolean).join(' ')))reason='You bargained with an orc, goblin, or troll.';
 if(!reason)return false;
 s.flags.percivalOath='fallen';s.flags.paladinForsakenPending={reason};note(s,PALADIN_FORSAKEN);return true;
}

export function turnDead(s,events,note){
 if(!isPaladin(s)||s.mode!=='battle'||!s.enemy)return false;
 if(!undead(s.enemy)){note(s,'TURN DEAD affects undead only.');return false;}
 const e=s.enemy,perTarget=12+3*effectiveLevel(s);
 const memberHp=e.groupSize&&e.memberHp?e.memberHp:e.maxHp;
 const targets=e.groupSize?Math.min(e.groupSize,Math.ceil(e.hp/memberHp)):1;
 const amount=Math.min(e.hp,Math.min(perTarget,memberHp)*(targets-1)+Math.min(perTarget,e.hp-memberHp*(targets-1)));
 e.hp-=amount;
 const message='TURN DEAD burns '+targets+' undead '+(targets===1?'foe':'foes')+' for '+amount+' holy damage.';
 note(s,message);events.push({kind:'magic',target:'enemy',amount,targets,turnDead:true,sound:'magic',message});return true;
}

export const paladinWeaponMultiplier=(s,enemy)=>isPaladin(s)&&s.equipped==='holy-sword'&&undead(enemy)?2:1;

export function validPaladinState(s){
 const pending=s.flags?.paladinForsakenPending;
 return (s.flags?.percivalOath===undefined||['accepted','rejected','fallen','retired'].includes(s.flags.percivalOath))&&
  (pending===undefined||s.flags.percivalOath==='fallen'&&pending&&typeof pending==='object'&&typeof pending.reason==='string');
}
