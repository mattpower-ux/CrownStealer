import {leprosyCharismaLoss} from './leper-colony.js';
import { worldTimeMs } from './world-clock.js';

export const ATTRIBUTE_NAMES = Object.freeze(['wisdom', 'charisma', 'constitution', 'strength', 'dexterity', 'intelligence']);
export const ATTRIBUTE_BASE = 10;
export const ATTRIBUTE_CAP = 50;
export const attributeLabel = name => name.charAt(0).toUpperCase() + name.slice(1);

const LEVEL_HEALTH = 14;
const MAX_HEALTH = 100_000;
const MINUTE_MS = 60_000;
const MAX_WORLD_TIME = 1e15;
const EQUIPPED_SLOTS = [
  'equipped', 'equippedArmor', 'equippedRing', 'equippedRing2', 'equippedNecklace',
  'equippedHead', 'equippedHands', 'equippedBoots', 'equippedShield', 'equippedBelt',
];

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integerBetween = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const isAttribute = name => ATTRIBUTE_NAMES.includes(name);
const earnedPoints = state => 2 * ((state.level ?? 1) - 1);
const baseScore = (state, name) => state.attributes?.[name] ?? ATTRIBUTE_BASE;
const raisedPoints = state => ATTRIBUTE_NAMES.reduce((sum, name) => sum + baseScore(state, name) - ATTRIBUTE_BASE, 0);
const spentPoints = state => state.attributePointsSpent ?? Math.min(earnedPoints(state), raisedPoints(state));
const isActive = (effect, now) => effect?.expiresAt > now;
const validExpiry = expiresAt => integerBetween(expiresAt, 0, MAX_WORLD_TIME);

function expiryFor(state, durationMinutes) {
  if (!integerBetween(durationMinutes, 1, Math.floor(MAX_WORLD_TIME / MINUTE_MS))) return 0;
  return Math.min(MAX_WORLD_TIME, worldTimeMs(state) + durationMinutes * MINUTE_MS);
}

export function prepareAttributes(state) {
  state.attributePointsSpent ??= spentPoints(state);
  state.attributes ??= {};
  for (const name of ATTRIBUTE_NAMES) state.attributes[name] ??= ATTRIBUTE_BASE;
  state.attributeBuffs ??= {};
  return state;
}

export function validateAttributeState(state) {
  if (state.attributes !== undefined && (!isRecord(state.attributes) || Object.entries(state.attributes).some(
    ([name, score]) => !isAttribute(name) || !integerBetween(score, ATTRIBUTE_BASE, ATTRIBUTE_CAP),
  ))) throw Error('Invalid attribute scores.');
  if (state.attributePointsSpent !== undefined && !integerBetween(
    state.attributePointsSpent, 0, Math.min(earnedPoints(state), raisedPoints(state)),
  )) throw Error('Invalid attribute allocation.');
  if (state.attributeBuffs !== undefined && (!isRecord(state.attributeBuffs) || Object.entries(state.attributeBuffs).some(
    ([name, buff]) => !isAttribute(name) || !isRecord(buff) || !validExpiry(buff.expiresAt)
      || !integerBetween(buff.amount, 1, ATTRIBUTE_CAP - ATTRIBUTE_BASE),
  ))) throw Error('Invalid attribute effects.');
  const drain = state.levelDrain;
  if (drain !== undefined && (!isRecord(drain) || !validExpiry(drain.expiresAt)
    || !integerBetween(drain.levels, 1, (state.level ?? 1) - 1))) throw Error('Invalid level drain.');
  if (state.attributeHealthAdjustment !== undefined && !integerBetween(
    state.attributeHealthAdjustment, -LEVEL_HEALTH * ((state.level ?? 1) - 1), 2 * (ATTRIBUTE_CAP - ATTRIBUTE_BASE),
  )) throw Error('Invalid attribute health adjustment.');
}

export const attributePointsAvailable = state => Math.max(0, earnedPoints(state) - spentPoints(state));

export function allocateAttribute(state, name) {
  if (!isAttribute(name) || baseScore(state, name) >= ATTRIBUTE_CAP || attributePointsAvailable(state) < 1) return false;
  prepareAttributes(state);
  state.attributes[name]++;
  state.attributePointsSpent++;
  return true;
}

export function effectiveAttributes(state, itemById) {
  const now = worldTimeMs(state);
  const equipment = itemById
    ? EQUIPPED_SLOTS.filter(slot => state[slot]).map(slot => itemById(state[slot], state)?.attributeBonuses).filter(Boolean)
    : [];
  return Object.fromEntries(ATTRIBUTE_NAMES.map(name => {
    const worn = equipment.reduce((sum, bonuses) => sum + (bonuses[name] ?? 0), 0);
    const buff = state.attributeBuffs?.[name];
    const temporary = isActive(buff, now) ? buff.amount : 0;
    // The permanent oath blessing is separate from allocated scores and is never
    // consumed by respecs, timed effects, or the ordinary training cap.
    const oath = state.flags?.percivalOath === 'accepted' && ['strength','charisma'].includes(name) ? 2 : 0;
    const total=Math.min(ATTRIBUTE_CAP, baseScore(state, name) + worn + temporary) + oath + (state.flags?.wizardApprentice==='accepted'&&name==='intelligence'?2:0);
    return [name,name==='charisma'?Math.max(1,total-leprosyCharismaLoss(state)):total];
  }));
}

// Same-attribute rare effects replace one another. Legendary effects increase the base score.
export function applyAttributeItem(state, item) {
  const effect = item?.attributeEffect;
  if (!effect || !['potion', 'scroll'].includes(item.kind) || !isAttribute(effect.attribute)
    || !integerBetween(effect.amount, 1, ATTRIBUTE_CAP - ATTRIBUTE_BASE)) return 0;
  const name = effect.attribute;
  const amount = Math.min(effect.amount, ATTRIBUTE_CAP - baseScore(state, name));
  if (amount === 0) return 0;
  if (item.rarity === 'legendary') {
    prepareAttributes(state);
    state.attributes[name] += amount;
    return amount;
  }
  if (item.rarity !== 'rare') return 0;
  const expiresAt = expiryFor(state, effect.durationMinutes);
  if (expiresAt <= worldTimeMs(state)) return 0;
  prepareAttributes(state);
  state.attributeBuffs[name] = { amount, expiresAt };
  return amount;
}

const minutesLeft = (state, effect) => Math.max(0, Math.ceil(((effect?.expiresAt ?? 0) - worldTimeMs(state)) / MINUTE_MS));

export const attributeBuffMinutesLeft = (state, name) => minutesLeft(state, state.attributeBuffs?.[name]);
export const levelDrainMinutesLeft = state => minutesLeft(state, state.levelDrain);

export function expireAttributeEffects(state) {
  const now = worldTimeMs(state);
  for (const [name, buff] of Object.entries(state.attributeBuffs ?? {})) {
    if (!isActive(buff, now)) delete state.attributeBuffs[name];
  }
  if (state.levelDrain && !isActive(state.levelDrain, now)) delete state.levelDrain;
}

// A d100 saving throw succeeds only when the rolled number is below the score.
export function attributeSave(state, name, random, itemById) {
  if (!isAttribute(name)) return false;
  const score = effectiveAttributes(state, itemById)[name];
  return 1 + Math.floor(random() * 100) < score;
}

const drainedLevels = state => isActive(state.levelDrain, worldTimeMs(state)) ? state.levelDrain.levels : 0;

export function applyLevelDrain(state, levels = 1, durationMinutes = 30) {
  const now = worldTimeMs(state);
  const expiresAt = expiryFor(state, durationMinutes);
  if (!integerBetween(levels, 1, Number.MAX_SAFE_INTEGER) || expiresAt <= now) return 0;
  const active = drainedLevels(state);
  const total = Math.min((state.level ?? 1) - 1, active + levels);
  if (total <= 0) return 0;
  state.levelDrain = { levels: total, expiresAt: Math.max(expiresAt, active ? state.levelDrain.expiresAt : 0) };
  return total - active;
}

export const effectiveLevel = state => Math.max(1, (state.level ?? 1) - drainedLevels(state));

export function attributeBenefits(state, itemById) {
  const scores = effectiveAttributes(state, itemById);
  const aboveBase = name => scores[name] - ATTRIBUTE_BASE;
  return {
    meleeDamage: Math.floor(aboveBase('strength') / 2),
    magicDamage: Math.floor(aboveBase('intelligence') / 2),
    maxHp: 2 * aboveBase('constitution'),
    accuracy: aboveBase('dexterity'),
    evasion: aboveBase('dexterity') / 200,
    magicResistance: aboveBase('wisdom') / 100,
    elementalResistance: aboveBase('constitution') / 100,
    merchantDiscount: Math.floor(aboveBase('charisma') / 2) / 100,
  };
}

export function attributeBuyPrice(state, base, itemById) {
  const discountPercent = Math.round(attributeBenefits(state, itemById).merchantDiscount * 100);
  return Math.ceil(base * (100 - discountPercent) / 100);
}

export function attributeSellPrice(state, base, itemById) {
  const premiumPercent = Math.round(attributeBenefits(state, itemById).merchantDiscount * 100);
  return Math.floor(base * (100 + premiumPercent) / 100);
}

// The applied adjustment lets normal level-ups and rewards keep modifying maxHp directly.
// Increasing the maximum leaves current health in place, so swapping gear cannot heal the hero.
export function syncAttributeHealth(state, itemById) {
  const adjustment = attributeBenefits(state, itemById).maxHp - LEVEL_HEALTH * drainedLevels(state);
  const previousMax = state.maxHp;
  const base = previousMax - (state.attributeHealthAdjustment ?? 0);
  state.maxHp = Math.max(1, Math.min(MAX_HEALTH, base + adjustment));
  state.attributeHealthAdjustment = state.maxHp - base;
  state.hp = Math.min(state.hp, state.maxHp);
  return state.maxHp - previousMax;
}
