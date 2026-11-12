import {RARE_GEAR_ITEMS} from './rare-gear.js';

export function rollAttackDamage(s, amount, random, note) {
  const chance = RARE_GEAR_ITEMS[s.equippedBelt]?.doubleDamageChance;
  if (amount <= 0 || !chance || random() >= chance) return {amount};
  const doubled = amount * 2;
  const message = `Your Belt of Double Damage doubles the attack to ${doubled} damage!`;
  note(s, message);
  return {amount: doubled, message};
}
