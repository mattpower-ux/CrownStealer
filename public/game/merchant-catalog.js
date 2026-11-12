export const MERCHANT_CATEGORY_LABELS = {
  'weapons-armor': 'Weapons and Armor',
  'magic-expendables': 'Magic Expendables',
  'potions-poisons': 'Potions and Poisons',
  specialty: 'Specialty',
};

const primaryShops = {
  mothbridge: 'blacksmith',
  bellwether: 'wizard',
  'gallows-fair': 'alchemist',
  redhaven: 'blacksmith',
  'iron-choir': 'wizard',
  'ash-market': 'alchemist',
  'salt-choir': 'blacksmith',
  'lantern-raft': 'wizard',
  'pearl-defiance': 'alchemist',
  'last-dawn': 'blacksmith',
  'hinge-town': 'wizard',
  'noonless-quay': 'alchemist',
};
const primaryNames = {
  blacksmith: 'Blacksmith',
  wizard: 'Wizard’s Scrolls & Wands',
  alchemist: 'Alchemist',
};
const gizmoShop = { id: 'gizmo', merchant: 'gizmo', name: 'Gizmos & Gadgets Emporium' };
const specialtyShops = {
  mothbridge: { id: 'mount-shop', merchant: 'mount', name: 'Mount Shop' },
  'salt-choir': { id: 'healing-enclave', merchant: 'enclave', name: 'Healing Enclave' },
  'gallows-fair': gizmoShop,
  'ash-market': gizmoShop,
  'pearl-defiance': gizmoShop,
  'noonless-quay': gizmoShop,
};

export function merchantPlaces(townId) {
  if (!Object.hasOwn(primaryShops, townId)) return [];
  const merchant = primaryShops[townId];
  const places = [{ id: 'shop', merchant, name: primaryNames[merchant] }];
  if (specialtyShops[townId]) places.push({ ...specialtyShops[townId] });
  return places;
}

export function merchantFor(townId, placeId = 'shop') {
  return merchantPlaces(townId).find(place => place.id === placeId) || null;
}

const isGizmo = item => item.kind === 'gadget' || item.gadget;

export function merchantCategory(item) {
  if (!item) return null;
  if (isGizmo(item)) return 'specialty';
  if (item.kind === 'potion' || item.kind === 'poison') return 'potions-poisons';
  if (['scroll', 'wand'].includes(item.kind) || ['scroll', 'wand'].includes(item.shape) || item.family === 'wand') return 'magic-expendables';
  if (['weapon', 'armor', 'shield', 'head', 'hands', 'boots'].includes(item.kind)) return 'weapons-armor';
  return 'specialty';
}

export function isMerchantResaleItem(item) {
  return !!item && !item.notForSale && !['quest', 'relic', 'key'].includes(item.kind) && item.id !== 'holy-pepper-grenade';
}

export function canMerchantSell(merchant, item) {
  if (!isMerchantResaleItem(item)) return false;
  const type = typeof merchant === 'string' ? merchant : merchant?.merchant;
  if (isGizmo(item)) return type === 'gizmo';
  const category = merchantCategory(item);
  if (type === 'blacksmith') return category === 'weapons-armor';
  if (type === 'alchemist') return category === 'potions-poisons';
  if (type === 'wizard') return category === 'magic-expendables' || category === 'specialty';
  return false;
}

export function merchantStockFor(merchant, ids, itemById) {
  return ids.filter(id => canMerchantSell(merchant, itemById(id)));
}

export function canBuyMerchantSupply(place, itemId) {
  if (itemId === 'food') return place?.id === 'inn';
  if (itemId === 'potion') return place?.merchant === 'alchemist';
  if (itemId === 'weapon' || itemId === 'armor') return place?.merchant === 'blacksmith';
  if (itemId === 'transport') return place?.merchant === 'mount';
  return false;
}
