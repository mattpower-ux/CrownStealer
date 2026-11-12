import { canMerchantSell, merchantStockFor } from './merchant-catalog.js';
import { healingAvailable } from './merchant-supplies.js';
import { TREASURE_ITEMS, hash, levelAppropriate, merchantStock, random } from './treasure.js';
import { POISON_ITEMS } from './weapon-poisons.js';

const rareOffers = [
  { rarity: 'epic', chance: 0.10, region: 1, level: 8 },
  { rarity: 'legendary', chance: 0.02, region: 2, level: 16 },
];

function rareOffer(s, merchant, offer) {
  if (s.region < offer.region || s.level < offer.level) return null;
  const seed = hash(`${s.treasureSeed ?? 187441}:${s.location}:${merchant.id}:${offer.rarity}:merchant`);
  const roll = random(seed);
  if (roll() >= offer.chance) return null;
  const tier = Math.min(3, s.region + 1);
  const pool = Object.values(TREASURE_ITEMS).filter(item =>
    item.rarity === offer.rarity && item.tier <= tier && (item.minLevel || 1) <= s.level &&
    !item.unique && !item.bottomOnly && !item.encounterOnly && !item.alien && !item.elven &&
    !item.gag && !item.lowLoot && healingAvailable(s.region, item) && levelAppropriate(item, s) &&
    canMerchantSell(merchant, item)
  );
  return pool[Math.floor(roll() * pool.length)]?.id || null;
}

export function stockForMerchant(s, merchant) {
  if (!merchant || !['blacksmith', 'alchemist', 'wizard', 'gizmo'].includes(merchant.merchant)) return [];
  const base = merchantStock(s.region, s.location, s.level).filter(id => ['common', 'rare'].includes(TREASURE_ITEMS[id]?.rarity));
  if (merchant.merchant === 'alchemist') {
    base.push(...Object.values(POISON_ITEMS).filter(item => item.minRegion <= s.region).map(item => item.id));
  }
  const ids = merchantStockFor(merchant, [...new Set(base)], id => TREASURE_ITEMS[id] || POISON_ITEMS[id]);
  for (const offer of rareOffers) {
    const id = rareOffer(s, merchant, offer);
    if (id) ids.push(id);
  }
  return ids;
}
