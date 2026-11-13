import {leprosyCharismaLoss} from './leper-colony.js';
import {poisonDamage} from './weapon-poisons.js';
import {
  ATTRIBUTE_BASE, ATTRIBUTE_CAP, ATTRIBUTE_NAMES, attributeBenefits, attributeBuffMinutesLeft,
  attributeLabel, attributePointsAvailable, effectiveAttributes, effectiveLevel, levelDrainMinutesLeft,
} from './attributes.js';
import { gagActive } from './gag-potions.js';
import { travelSpeed } from './junk-loot.js';
import { randomEncounterMultiplier } from './rare-gear.js';
import { buffTimeLeft } from './world-clock.js';
import { WEAPONS, UNARMED, armorProtection, itemById, weaponAccuracy, weaponMagicDamage } from './items.js';
import { TREASURE_ITEMS, equippedAccessories, gearPower } from './treasure.js';

export function heroStats(s) {
  const weapon = WEAPONS[s.equipped] || UNARMED;
  const gear = equippedAccessories(s);
  const benefits = attributeBenefits(s, itemById);
  const bonus = (s.equipped ? s.weapon * 4 : 0) + effectiveLevel(s) * 2 + benefits.meleeDamage
    + (s.buffs?.strength > 0 ? s.buffs.strengthPower || 0 : 0) + gearPower(s) + (s.buffs?.meal > 0 ? 4 : 0);
  const magicDamage = weaponMagicDamage(weapon, benefits.magicDamage);
  const resistance = element => Math.min(75, gear.filter(i => i.resistance === element)
    .reduce((n, i) => n + i.resistPercent, Math.round(benefits.elementalResistance * 100)));
  return {
    damage: weapon.damage.map(n => Math.floor((n + bonus) * (gagActive(s, 'tiny') ? .5 : 1)) + magicDamage + poisonDamage(s)),
    accuracy: Math.max(5, weaponAccuracy(s, benefits.accuracy)),
    protection: armorProtection(s) * 1.3 + gear.filter(i => i.kind !== 'armor').reduce((n, i) => n + (i.protection || 0), 0),
    fire: resistance('fire'),
    frost: resistance('frost'),
    poison: resistance('poison'),
    magic: Math.round(benefits.magicResistance * 100),
    evasion: Math.min(40, Math.round(gear.reduce((n, i) => n + (i.evasion || 0), benefits.evasion) * 100)),
    regeneration: gear.reduce((n, i) => n + (i.regeneration || 0), 0),
    lifeSteal: weapon.lifeSteal || 0,
    freeze: Math.round((weapon.freezeChance || 0) * 100),
    element: weapon.element,
    elementDamage: weapon.elementDamage || 0,
    lightning: weapon.stormDamage || 0,
    spellBonus: benefits.magicDamage,
  };
}

function expectedWeaponDamage(s) {
  const {damage:[low,high],accuracy}=heroStats(s);
  return (low+high)*accuracy/200;
}

export function isGearUpgrade(s,id) {
  const candidate=itemById(id,s);
  if(candidate?.kind==='armor'){
    return id!==s.equippedArmor&&armorProtection({...s,equippedArmor:id})>armorProtection(s);
  }
  if(candidate?.kind!=='weapon'||id===s.equipped)return false;
  return expectedWeaponDamage({...s,equipped:id})>expectedWeaponDamage(s);
}

function attributeRows(s) {
  const effective = effectiveAttributes(s, itemById);
  const points = attributePointsAvailable(s);
  const rows = ATTRIBUTE_NAMES.map(name => {
    const label = attributeLabel(name);
    const base = s.attributes?.[name] ?? ATTRIBUTE_BASE;
    const shown = effective[name] === base ? base : `${effective[name]} <small>(${base} base)</small>`;
    const remaining = attributeBuffMinutesLeft(s, name);
    const timer = remaining ? ` <small>${remaining} game min</small>` : '';
    const action = points > 0 && base < ATTRIBUTE_CAP && s.mode !== 'ending' && s.flags?.royalQuest !== 'opening'
      ? ` <button type="button" class="text-button" data-attribute="${name}" aria-label="Increase ${label}" data-action='{"type":"allocateAttribute","attribute":"${name}"}'>+1</button>`
      : '';
    return `<div><dt>${label}</dt><dd>${shown}${timer}${action}</dd></div>`;
  });
  return `<h4>Attributes</h4><p>${points} attribute ${points === 1 ? 'point' : 'points'} available</p><dl>${rows.join('')}</dl>`;
}

export function statsView(s) {
  const t = heroStats(s);
  const level = effectiveLevel(s);
  const speed = travelSpeed({ ...s, mode: 'world' });
  const bootsMultiplier = 1 - (TREASURE_ITEMS[s.equippedBoots]?.encounterReduction || 0);
  const gearReduction = Math.round((1 - bootsMultiplier * randomEncounterMultiplier(s)) * 100);
  const gagLabels = { pigFace: 'Pig face', tiny: 'Mouse-sized', helium: 'Helium voice' };
  const rows = [
    ...Object.entries(gagLabels).filter(([key]) => gagActive(s, key))
      .map(([key, label]) => [label, key==='tiny'&&!buffTimeLeft(s,key)?`${Math.max(0,Math.ceil(((s.flags.wizardTimers?.shapeshiftUntil||0)-Date.now())/1000))} real sec remaining`:`${buffTimeLeft(s, key)} game min remaining`]),
    ['Health', `${s.hp} / ${s.maxHp}`],
    ['Level', level === s.level ? level : `${level} / ${s.level} · ${levelDrainMinutesLeft(s)} game min`],
    ['Wilderness movement', speed === .5 ? '1 square / 2 moves' : `${speed} square(s) / move`],
    ['Encounter reduction', `${gearReduction}% from gear`],
    ['Weapon damage', t.damage.join('–')],
    ['Hit chance', `${t.accuracy}%`],
    ['Physical protection', t.protection.toFixed(1)],
    ['Shield block', TREASURE_ITEMS[s.equippedShield]?.block?.join('–') || '0'],
    ['Ice retaliation', TREASURE_ITEMS[s.equippedShield]?.retaliation?.join('–') || '0'],
    ['Fire resistance', `${t.fire}%`],
    ['Frost resistance', `${t.frost}%`],
    ['Poison resistance', `${t.poison}%`],
    ['Magic resistance', `${t.magic}%`],
    ['Spell damage bonus', `${t.spellBonus > 0 ? '+' : ''}${t.spellBonus}`],
    ['Dodge chance', `${t.evasion}%`],
    ['Wilderness recovery', `1 HP / ${(100 / effectiveAttributes(s, itemById).constitution).toFixed(1)} seconds`],
    ['Regeneration', `${t.regeneration} / enemy attack`],
    ['Life drain', `${t.lifeSteal} / hit`],
    ['Freeze chance', `${t.freeze}%`],
  ];
  const effects = [
    s.flags?.leprosy && `Leprosy: charisma −${leprosyCharismaLoss(s)}; another point lost each game week. The White Wizard can cure it.`,
    s.buffs?.meal > 0 && `Meal: +4 damage · ${buffTimeLeft(s, 'meal')} game min.`,
    s.buffs?.strength > 0 && `Strength potion: +${s.buffs.strengthPower} damage · ${s.flags?.strengthMoves>0?s.flags.strengthMoves+' moves / combat actions':buffTimeLeft(s, 'strength')+' game min.'}`,
    s.spellEffects?.invisibleMoves > 0 && `Invisible: ${s.spellEffects.invisibleMoves} moves / combat actions.`,
    s.buffs?.invisibility > 0 && `Invisible: ${buffTimeLeft(s, 'invisibility')} game min.`,
    t.elementDamage && `${t.element} damage: +${t.elementDamage} per hit.`,
    s.weaponCoating && `Weapon poison: +${poisonDamage(s)} damage · ${s.weaponCoating.rounds} combat rounds.`,
    t.lightning && `Lightning damage: +${t.lightning} per hit.`,
  ].filter(Boolean).join(' ');
  return `<section class="hero-stats" aria-label="Current equipped stats"><h3>Current stats</h3>${attributeRows(s)}<dl>${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><p class="fine">${effects}</p></section>`;
}
