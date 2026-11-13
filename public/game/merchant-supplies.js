export function healingType(item) {
  return item === 'potion' ? 'tonic' : item?.kind === 'potion' && item.healing > 0 ? item.effect : null;
}

export function healingAvailable(region, item) {
  const type = healingType(item);
  if (type === 'ultra-healing') return region >= 3;
  if (type === 'medium-healing') return region >= 2;
  return true;
}

function stockLimit(item) {
  if(item?.id==='torch')return Infinity;
  if (healingType(item)) return 3;
  if (!item?.id) return Infinity;
  if (['potion', 'poison', 'scroll'].includes(item.kind) || (item.kind === 'consumable' && item.shape === 'scroll')) return 3;
  return 1;
}

function stockKey(s, item, merchantId) {
  const town = s.location || `region-${s.region}`;
  const healing = healingType(item);
  // Keep the pre-existing counter shared across every quality of this healing type.
  if (healing) return `merchantHealing:${town}:${healing}`;
  return `merchantStock:${town}:${merchantId}:${item.id}`;
}

export function merchantItemRemaining(s, item, merchantId = 'shop') {
  const limit = stockLimit(item);
  if (limit === Infinity) return limit;
  const purchased = Math.max(0, Number(s.flags?.[stockKey(s, item, merchantId)]) || 0);
  return Math.max(0, limit - purchased);
}

export function recordMerchantPurchase(s, item, merchantId = 'shop', quantity = 1) {
  const limit = stockLimit(item);
  if (limit === Infinity || !Number.isInteger(quantity) || quantity < 1) return;
  const purchased = limit - merchantItemRemaining(s, item, merchantId);
  s.flags ??= {};
  s.flags[stockKey(s, item, merchantId)] = Math.min(limit, purchased + quantity);
}

export function merchantPotionRemaining(s, item) {
  return healingType(item) ? merchantItemRemaining(s, item) : Infinity;
}

export function recordPotionPurchase(s, item) {
  if (healingType(item)) recordMerchantPurchase(s, item);
}
