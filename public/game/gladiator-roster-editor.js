const STORAGE_KEY = 'bar-the-gates-gladiator-roster-edits-v2';
const FIELDS = [['name', 'Name'], ['look', 'Appearance'], ['weapon', 'Weapon or attack specialty']];
const byId = id => document.getElementById(id);
const arenaFilter = byId('arena-filter');
const search = byId('roster-search');
const list = byId('roster');
const status = byId('save-status');
const jsonButton = byId('download-json');
const markdownButton = byId('download-markdown');

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function storedEdits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeEdits(edits) {
  try {
    if (edits.size) localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(edits)));
    else localStorage.removeItem(STORAGE_KEY);
    status.textContent = edits.size ? 'Saved in this browser' : 'No local edits';
  } catch {
    status.textContent = 'Browser storage is unavailable. Download a copy to keep your edits.';
  }
}

function editorField(fighter, field, labelText) {
  const label = element('label', labelText, field === 'name' ? 'name-field' : '');
  const control = element(field === 'name' ? 'input' : 'textarea');
  control.name = field;
  control.value = fighter[field];
  if (field === 'name') {
    control.type = 'text';
    control.spellcheck = false;
  } else {
    control.rows = 3;
  }
  label.append(control);
  return label;
}

function makeFighter(fighter, key) {
  const card = element('article', '', 'fighter');
  card.dataset.fighter = key;
  card.setAttribute('aria-label', 'Bout ' + fighter.bout);
  const identity = element('div', '', 'fighter-identity');
  identity.append(element('p', 'Bout ' + fighter.bout, 'bout'));
  if (fighter.portrait) {
    const portrait = element('img');
    portrait.src = fighter.portrait;
    portrait.alt = fighter.name;
    portrait.loading = 'lazy';
    portrait.width = 120;
    portrait.height = 160;
    identity.append(portrait);
  }
  card.append(identity);
  for (const [field, label] of FIELDS) card.append(editorField(fighter, field, label));
  return card;
}

function makeArena(arena) {
  const section = element('section', '', 'arena');
  section.dataset.arenaSection = arena.id;
  section.dataset.rosterStatus = arena.status;
  const header = element('header', '', 'arena-heading');
  const meta = element('p', '', 'arena-meta');
  meta.append(element('span', arena.region), element('span', arena.status === 'confirmed' ? 'Confirmed roster' : 'Draft roster', 'status-label'));
  const title = element('h2', arena.name);
  title.id = 'arena-' + arena.id;
  section.setAttribute('aria-labelledby', title.id);
  header.append(meta, title, element('p', arena.summary, 'arena-summary'));
  section.append(header);
  return section;
}

function markdownCell(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('\\', '\\\\').replaceAll('|', '\\|').replace(/\r?\n/g, ' <br> ');
}

function asMarkdown(roster) {
  const lines = ['# Bar the Gates gladiator roster', '', 'Edits exported from the roster editor.', ''];
  for (const arena of roster.arenas) {
    lines.push('## ' + arena.name, '', arena.region + ' · ' + (arena.status === 'confirmed' ? 'Confirmed roster' : 'Draft roster'),
      '', arena.summary, '', '| Bout | Name | Appearance | Weapon or attack specialty |', '| ---: | --- | --- | --- |');
    for (const {bout, name, look, weapon} of arena.fighters) {
      lines.push('| ' + [bout, name, look, weapon].map(markdownCell).join(' | ') + ' |');
    }
    lines.push('');
  }
  return lines.join('\n');
}

function download(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = element('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function start() {
  const response = await fetch('/game/gladiator-roster-editor-data.json');
  if (!response.ok) throw new Error('Could not load the roster');
  const roster = await response.json();
  const saved = storedEdits();
  const edits = new Map();
  const rows = new Map();
  const sections = new Map();
  for (const arena of roster.arenas) {
    const option = element('option', arena.name);
    option.value = arena.id;
    arenaFilter.append(option);
    const section = makeArena(arena);
    sections.set(arena.id, section);
    arena.fighters = arena.fighters.map(base => {
      const key = arena.id + ':' + base.bout;
      const changes = Object.fromEntries(FIELDS.flatMap(([field]) =>
        typeof saved[key]?.[field] === 'string' && saved[key][field] !== base[field]
          ? [[field, saved[key][field]]] : []));
      if (Object.keys(changes).length) edits.set(key, changes);
      const fighter = {...base, ...changes};
      const card = makeFighter(fighter, key);
      rows.set(key, {arena, base, fighter, card});
      section.append(card);
      return fighter;
    });
    list.append(section);
  }

  function filter() {
    const query = search.value.trim().toLowerCase();
    const visibleArenas = new Set();
    let count = 0;
    for (const {arena, fighter, card} of rows.values()) {
      const visible = (!arenaFilter.value || arena.id === arenaFilter.value) &&
        (!query || FIELDS.some(([field]) => fighter[field].toLowerCase().includes(query)));
      card.hidden = !visible;
      if (visible) {
        count++;
        visibleArenas.add(arena.id);
      }
    }
    for (const [id, section] of sections) section.hidden = !visibleArenas.has(id);
    byId('match-count').textContent = count + ' of ' + rows.size + ' fighters · ' + visibleArenas.size + ' ' +
      (visibleArenas.size === 1 ? 'arena' : 'arenas');
    byId('no-results').hidden = count > 0;
  }

  list.addEventListener('input', event => {
    const {target} = event;
    const key = target.closest('[data-fighter]')?.dataset.fighter;
    const row = rows.get(key);
    if (!row || !FIELDS.some(([field]) => field === target.name)) return;
    row.fighter[target.name] = target.value;
    const changes = Object.fromEntries(FIELDS.filter(([field]) => row.fighter[field] !== row.base[field])
      .map(([field]) => [field, row.fighter[field]]));
    if (Object.keys(changes).length) edits.set(key, changes);
    else edits.delete(key);
    writeEdits(edits);
  });
  arenaFilter.addEventListener('change', filter);
  search.addEventListener('input', filter);
  jsonButton.addEventListener('click', () => download('gladiator-roster.json', 'application/json', JSON.stringify(roster, null, 2) + '\n'));
  markdownButton.addEventListener('click', () => download('gladiator-roster.md', 'text/markdown', asMarkdown(roster)));
  for (const control of [arenaFilter, search, jsonButton, markdownButton]) control.disabled = false;
  status.textContent = edits.size ? 'Saved in this browser' : 'No local edits';
  filter();
}

start().catch(() => {
  byId('match-count').textContent = 'The rosters could not be loaded. Reload the page to try again.';
});
