// Stable ordinary rare gear: palace valuables never consume story or encounter-only rewards.
export function castleTreasuryLoot(s, chest) {
  const slot = chest?.treasurySlot;
  const royal = s.location === 'bellwether';
  if (!(s.level >= 5) || !Number.isInteger(slot) || slot < 0 || slot >= (royal ? 5 : 3)) return [];
  const region = Number.isInteger(s.region) ? Math.max(0, Math.min(3, s.region)) : 0;
  const tier = royal ? 3 : Math.min(3, region + 1);
  const arms = ['sword', 'axe', 'spear', 'mace'];
  const townSeed = [...String(s.location ?? '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const families = ['ring', arms[townSeed % arms.length], 'armor', 'wand', 'necklace'];
  return ['rare-' + families[slot] + '-' + tier];
}
