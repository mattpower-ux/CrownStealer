import { TOWNS } from './content.js';
import { itemArt, itemById, merchantBuyPrice, merchantSellPrice } from './items.js';
import { MERCHANT_CATEGORY_LABELS, canBuyMerchantSupply, isMerchantResaleItem, merchantCategory } from './merchant-catalog.js';
import { stockForMerchant } from './merchant-inventory.js';
import { merchantItemRemaining } from './merchant-supplies.js';
import { MOUNTS } from './mounts.js';
import { MERCHANTS } from './town-personas.js';
import { equipmentKeys } from './treasure.js';

const gold = value => value.toLocaleString('en-US') + ' gold';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
));

const categoryArt = {
  'weapons-armor': { kind: 'weapon', shape: 'sword' },
  'magic-expendables': { kind: 'scroll' },
  'potions-poisons': { kind: 'potion' },
  specialty: { kind: 'tool', shape: 'pouch' },
};

function supplies(state, place) {
  const entries = [
    { id: 'potion', name: 'Bitter tonic', description: 'Restores 45 health.', kind: 'potion', base: 18 },
    { id: 'weapon', name: 'Weapon upgrade', description: 'Reinforce your original weapon.', kind: 'weapon', shape: 'sword', base: 45 * state.weapon },
    { id: 'armor', name: 'Armor upgrade', description: 'Reinforce your Traveler’s Armor.', kind: 'armor', shape: 'armor', base: 40 * state.armor },
    { ...itemById('mount-horse'), id: 'transport', name: 'Packhorse', description: 'Fewer wilderness encounters.', base: 150 },
  ];
  return entries.filter(item => canBuyMerchantSupply(place, item.id)).map(item => ({
    item,
    price: merchantBuyPrice(state, item.base),
    available: merchantItemRemaining(state, item.id, place.id),
    bulk: item.id === 'potion',
    action: { type: 'buy', item: item.id },
    blocked: item.id === 'transport' && state.flags.transport ? 'Already purchased' : '',
  }));
}

function buyEntries(state, place) {
  if (place.merchant === 'mount') {
    const mounts = Object.entries(MOUNTS).map(([id, mount]) => {
      const owned = state.flags.mounts?.includes(id);
      return {
        item: itemById('mount-' + id, state),
        price: owned ? null : merchantBuyPrice(state, mount.price),
        action: { type: owned ? 'equipMount' : 'buyMount', id },
        label: owned ? state.flags.mount === id ? 'Equipped' : 'Equip' : 'Buy',
        blocked: id === 'dragon' && state.flags.dragonCaptured ? 'Rescue in Firedrak Mountain' : state.flags.mount === id ? 'Already equipped' : '',
      };
    });
    return [...mounts, ...supplies(state, place)];
  }

  if (place.merchant === 'enclave') {
    return [
      { item: { id: 'enclave-heal', name: 'Restore all health', kind: 'potion', description: 'Restore your health to its maximum.' }, price: merchantBuyPrice(state, 80), action: { type: 'enclaveHeal' }, label: 'Heal', blocked: state.hp === state.maxHp ? 'Already at full health' : '' },
      { item: { id: 'enclave-cure', name: 'Cleanse poison', kind: 'potion', description: 'Remove poison. Other potion curses remain.' }, price: merchantBuyPrice(state, 60), action: { type: 'enclaveCure' }, label: 'Cleanse' },
    ];
  }

  const stock = stockForMerchant(state, place).map(id => {
    const item = itemById(id, state);
    return {
      item,
      price: merchantBuyPrice(state, item.value),
      available: merchantItemRemaining(state, item, place.id),
      bulk: true,
      action: { type: 'buyItem', id },
    };
  });
  return [...supplies(state, place), ...stock];
}

function sellEntries(state) {
  const counts = new Map();
  for (const id of state.bag) counts.set(id, (counts.get(id) || 0) + 1);
  return Array.from(counts, ([id, available]) => ({ item: itemById(id, state), available }))
    .filter(({ item }) => isMerchantResaleItem(item))
    .map(({ item, available }) => ({
      item,
      available,
      price: merchantSellPrice(state, item),
      action: { type: 'sellItem', id: item.id },
      bulk: true,
      blocked: equipmentKeys.some(key => state[key] === item.id) ? 'Unequip to sell' : '',
      label: 'Sell',
    }));
}

function rowMarkup(entry, side, index) {
  const { item, available } = entry;
  return '<li class="trade-row" data-trade-index="' + index + '">' +
    '<span class="trade-item-art" aria-hidden="true">' + itemArt(item) + '</span>' +
    '<div class="trade-item"><button type="button" class="trade-inspect" aria-label="Inspect ' + escape(item.name) + '">' + escape(item.name) + '</button>' +
    '<small>' + (Number.isFinite(available) ? (side === 'sell' ? 'In bag ' : 'Stock ') + available : '') + '</small></div>' +
    '<div class="trade-offer"><strong></strong><button type="button" class="trade-execute"></button></div></li>';
}

export function renderMerchantView(body, state, place, dispatch) {
  const previous = body.querySelector('.trade-market');
  const key = state.location + '/' + place.id;
  const sameShop = previous?.dataset.shop === key;
  const query = sameShop ? previous.querySelector('.trade-search input').value : '';
  let category = sameShop ? previous.dataset.category : 'all';
  const oldQuantity = sameShop ? previous.querySelector('.trade-quantity input')?.value : null;
  const scroll = sameShop ? [...previous.querySelectorAll('.trade-list')].map(list => list.scrollTop) : [];
  const previousButton = sameShop ? document.activeElement?.closest('.trade-execute') : null;
  const previousTrade = previousButton?.dataset.tradeKey;

  const buy = buyEntries(state, place);
  const sell = sellEntries(state);
  const all = [...buy, ...sell];
  const categories = new Set(all.map(entry => merchantCategory(entry.item)));
  const selectCategory = (id, label) => '<button type="button" data-trade-category="' + id + '">' +
    (categoryArt[id] ? '<span aria-hidden="true">' + itemArt(categoryArt[id]) + '</span>' : '') + label + '</button>';
  if (!categories.has(category)) category = 'all';

  const index = Math.max(0, TOWNS.findIndex(town => town.id === state.location));
  const proprietor = place.id === 'shop' ? MERCHANTS[index] : null;
  const columns = [
    { id: 'buy', name: 'Buy', entries: buy, offset: 0, empty: 'There are no matching items for sale.' },
    { id: 'sell', name: 'Sell', entries: sell, offset: buy.length, empty: sell.length ? 'There are no matching items to sell.' : 'You have no items this merchant buys.' },
  ];
  body.innerHTML = '<div class="trade-market" data-shop="' + escape(key) + '" data-category="' + category + '">' +
    '<div class="trade-summary">' +
    (proprietor ? '<span class="trade-proprietor"><span class="merchant-portrait" aria-hidden="true" style="background-position:' + index % 4 * 100 / 3 + '% ' + Math.floor(index / 4) * 50 + '%"></span>' + escape(proprietor.name) + '</span>' : '') +
    '<span class="trade-purse">Your gold <strong>' + state.gold.toLocaleString('en-US') + '</strong></span></div>' +
    '<div class="trade-tools"><label class="trade-search">Search items<input type="search" aria-label="Search trade items" placeholder="Name or category" value="' + escape(query) + '"></label>' +
    (all.some(entry => entry.bulk) ? '<label class="trade-quantity">Quantity<input type="number" min="1" max="99" value="' + escape(oldQuantity || 1) + '"></label>' : '') + '</div>' +
    '<div class="trade-categories" role="group" aria-label="Item categories">' +
    selectCategory('all', 'All items') + Object.entries(MERCHANT_CATEGORY_LABELS).filter(([id]) => categories.has(id)).map(([id, name]) => selectCategory(id, name)).join('') + '</div>' +
    '<div class="trade-columns">' + columns.map(column =>
      '<section class="trade-column" aria-labelledby="trade-heading-' + column.id + '">' +
      '<h3 id="trade-heading-' + column.id + '">' + column.name + '</h3>' +
      '<ul class="trade-list" data-trade-list="' + column.id + '">' + column.entries.map((entry, i) => rowMarkup(entry, column.id, column.offset + i)).join('') + '</ul>' +
      '<p class="trade-empty" hidden>' + column.empty + '</p></section>'
    ).join('') + '</div>' +
    (place.merchant === 'mount' && state.flags.mount ? '<button type="button" class="trade-dismount">Travel on foot</button>' : '') +
    '<dialog class="merchant-detail" aria-labelledby="trade-detail-title"></dialog></div>';

  const market = body.querySelector('.trade-market');
  const search = market.querySelector('.trade-search input');
  const quantity = market.querySelector('.trade-quantity input');
  const detail = market.querySelector('.merchant-detail');
  const lists = [...market.querySelectorAll('.trade-list')];
  const rows = [...market.querySelectorAll('.trade-row')];
  const categoryButtons = [...market.querySelectorAll('[data-trade-category]')];

  function requestedQuantity(entry) {
    if (!entry.bulk) return 1;
    const value = quantity?.valueAsNumber;
    return Number.isInteger(value) && value >= 1 && value <= 99 ? value : null;
  }

  function refresh() {
    const text = search.value.trim().toLocaleLowerCase();
    market.dataset.category = category;
    for (const control of categoryButtons) control.setAttribute('aria-pressed', control.dataset.tradeCategory === category);
    for (const row of rows) {
      const entry = all[Number(row.dataset.tradeIndex)];
      const { item, action, available, price, label = 'Buy' } = entry;
      const group = merchantCategory(item);
      row.hidden = (category !== 'all' && category !== group) ||
        ![item.name, MERCHANT_CATEGORY_LABELS[group]].some(value => value?.toLocaleLowerCase().includes(text));
      const count = requestedQuantity(entry);
      const total = price === null || count === null ? price : price * count;
      const selling = action.type === 'sellItem';
      const unavailable = entry.blocked || (count === null ? 'Enter a quantity from 1 to 99' :
        available === 0 ? 'Sold out' : count > available ? 'Only ' + available + ' available' :
        !selling && total > state.gold ? 'Not enough gold' : '');
      const control = row.querySelector('.trade-execute');
      row.querySelector('.trade-offer strong').textContent = total === null ? 'Owned' : gold(total);
      control.textContent = unavailable === 'Sold out' ? unavailable : label;
      control.disabled = !!unavailable;
      control.dataset.tradeKey = action.type + '/' + (action.id || action.item || item.id);
      control.setAttribute('aria-label', label + ' ' + item.name);
      control.title = unavailable || label + ' ' + (count > 1 ? count + ' × ' : '') + item.name;
      const status = row.querySelector('.trade-item small');
      if (unavailable && unavailable !== 'Sold out') status.textContent = unavailable;
      else status.textContent = Number.isFinite(available) ? (selling ? 'In bag ' : 'Stock ') + available : '';
    }
    for (const list of lists) {
      list.hidden = !Array.from(list.children).some(row => !row.hidden);
      list.nextElementSibling.hidden = !list.hidden;
    }
  }

  for (const row of rows) {
    const entry = all[Number(row.dataset.tradeIndex)];
    row.querySelector('.trade-execute').onclick = () => {
      const count = requestedQuantity(entry);
      if (count !== null) dispatch({ ...entry.action, merchant: place.id, quantity: count });
    };
    row.querySelector('.trade-inspect').onclick = () => {
      const { item } = entry;
      detail.innerHTML = '<form method="dialog"><button aria-label="Close item details" class="merchant-detail-close">×</button></form>' +
        itemArt(item) + '<h3 id="trade-detail-title">' + escape(item.name) + '</h3>' +
        (item.rarity ? '<p class="eyebrow">' + escape(item.rarity) + '</p>' : '') +
        '<p>' + escape(item.description) + '</p>' +
        (item.damage ? '<p>' + item.damage.join('–') + ' damage</p>' : '');
      detail.showModal();
    };
  }

  for (const control of categoryButtons) control.onclick = () => {
    category = control.dataset.tradeCategory;
    refresh();
  };
  search.oninput = refresh;
  if (quantity) quantity.oninput = refresh;
  const dismount = market.querySelector('.trade-dismount');
  if (dismount) dismount.onclick = () => dispatch({ type: 'dismount', merchant: place.id });
  refresh();
  lists.forEach((list, i) => { list.scrollTop = scroll[i] || 0; });
  if (previousTrade) {
    const trade = rows.map(row => row.querySelector('.trade-execute')).find(control => control.dataset.tradeKey === previousTrade);
    if (trade && !trade.disabled) trade.focus({ preventScroll: true });
    else search.focus({ preventScroll: true });
  }
}

