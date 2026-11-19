import {worldTimeMs, DAY_MS} from './world-clock.js';

export const PERCIVAL_RECKONING=Object.freeze({
  speciesId:'percival-lawgiver',name:'Percival, Lord of Paladins',level:100,
  maxHp:6000,baseAttack:140,regeneration:50,armor:70,
});

const EQUIPMENT=['equipped','equippedArmor','equippedRing','equippedRing2','equippedNecklace','equippedHead','equippedHands','equippedBoots','equippedShield','equippedBelt','equippedMagic'];
const LOST_FLAGS=new Set(['redGlobeCurse','redGlobeSworn','kingUsurped','kingFled','married','evilMarriage','evilRulerTitle','castleRoyalGuardsDefeated','crownKing','royalHero']);

export function startPercivalFight(state,note){
 if(state.evilRoute?.phase!=='percivalChoice')return false;
 state.evilRoute={version:1,phase:'percivalBattle'};
 state.returnMode='town';state.mode='battle';state.flags.combo=0;state.flags.guarded=false;
 state.enemy={...PERCIVAL_RECKONING,hp:PERCIVAL_RECKONING.maxHp,attack:PERCIVAL_RECKONING.baseAttack*2,
  gold:0,xp:0,kind:'armored',weakness:'none',boss:true,guard:false,firstContact:false,
  fearImmune:true,mindless:false,regeneration:PERCIVAL_RECKONING.regeneration,noLoot:true,noXp:true,percivalReckoning:true};
 note?.(state,`“${state.name}, your time is up. You have defiled this place and its people. I, Percival, Lord of Paladins, call you forth!”`);
 return true;
}

export function resolvePercivalRound(state,events=[],note){
 const enemy=state.enemy;if(!enemy?.percivalReckoning||enemy.hp<=0)return 0;
 const healed=Math.min(enemy.regeneration||50,enemy.maxHp-enemy.hp);
 if(healed>0){enemy.hp+=healed;events.push({kind:'heal',target:'enemy',amount:healed,sound:'magic'});note?.(state,`Percival's holy light restores ${healed} health.`);}
 return healed;
}

export function exileEvilRuler(state,cause,note){
 state.bag=[];state.pendingLoot=[];state.gold=0;
 for(const slot of EQUIPMENT)state[slot]=null;
 for(const key of Object.keys(state.flags||{}))if(LOST_FLAGS.has(key)||key.startsWith('champion:')||key.startsWith('title:'))delete state.flags[key];
 state.evilRoute={version:1,phase:'exiled'};state.enemy=null;state.castle=undefined;state.dungeon=null;
 state.region=0;state.x=20;state.y=24;state.location=null;state.mode='world';state.returnMode='world';
 state.hp=state.maxHp;state.spellEffects={};state.weaponCoating=undefined;
 note?.(state,cause==='defeat'?'Percival casts you into the wilderness. Your possessions, titles, throne, marriage, and evil powers are gone. Leprosy begins to consume your Constitution; find the White Wizard.':'You run from Percival. Your possessions, titles, throne, marriage, and evil powers fade. The townspeople drive you into the wilderness with nothing.');
 return state;
}

export function resolvePercivalDefeat(state,note){
 exileEvilRuler(state,'defeat',note);
 state.flags.leprosy=true;state.flags.leprosyKind='percival';state.flags.leprosySince=worldTimeMs(state);
 return state;
}

export const percivalLeprosyConstitutionLoss=state=>state.flags?.leprosy&&state.flags?.leprosyKind==='percival'
 ?Math.max(0,Math.floor((worldTimeMs(state)-(state.flags.leprosySince??worldTimeMs(state)))/(7*DAY_MS))):0;

export const isPercivalReckoning=state=>state.enemy?.percivalReckoning===true;
