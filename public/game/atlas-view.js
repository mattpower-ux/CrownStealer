import { DUNGEONS, REGIONS, TOWNS } from './content.js';
import { worldTile } from './engine.js';
import { AREAS, areaFor, areaSites, branchGates } from './exploration.js';
import { WILD_SITES } from './wild-sites.js';
import { PUTRID_PALACE } from './royal-trials.js';
import { MOUNTS, mountFor } from './mounts.js';
import { WORLD_HEIGHT, WORLD_WIDTH } from './world-size.js';

const LEVELS = ['1–7', '8–15', '16–25', '26+'];
const LEVEL_COLORS = ['#a9d890', '#ffdc81', '#ffb17d', '#ff9a95'];
const MARKS = { town: '#fff0c4', dungeon: '#ffa4a1', gate: '#ffd46e', passage: '#8ed7f1' };
const DUNGEON_NOTES = {
  'tithe-vault': 'Haghilda holds the Hearth Seal in the abandoned elven village.',
  'widows-bell': 'A level-12 Rock Troll guards the Witness Bell on floor 10.',
};
const escape = value => String(value).replace(/[&<>"']/g, character => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
));

export function atlasRegions(state) {
  const area = areaFor(state);
  const ridingDragon = mountFor(state) === MOUNTS.dragon;
  const boatReady = !!(state.flags.rowboatReady || state.flags.sailboatReady);
  return REGIONS.map(region => {
    const towns = TOWNS.filter(town => town.region === region.id);
    const dungeons = DUNGEONS.filter(dungeon => dungeon.region === region.id);
    const sideDungeons = PUTRID_PALACE.region === region.id ? [PUTRID_PALACE] : [];
    const relicsFound = dungeons.every(dungeon => state.relics.includes(dungeon.id));
    const canCross = relicsFound || ridingDragon;
    const east = WILD_SITES.find(site => site.id === `east-gate-${region.id}`);
    const west = WILD_SITES.find(site => site.id === `west-gate-${region.id}`);
    const branches = branchGates(region.id).map(gate => {
      const branch = AREAS.find(candidate => candidate.id === gate.area);
      return {
        ...branch, gate, open: canCross && (!gate.boatOnly || ridingDragon || boatReady), current: area?.id === branch.id,
        sites: areaSites({ region: region.id, exploration: { area: branch.id } })
          .filter(site => ['expedition', 'bottomless-pit'].includes(site.kind) || site.id === 'bottomless-pit'),
      };
    });
    return {
      ...region, towns, dungeons, sideDungeons, branches, east: { ...east, open: east.target < region.id || canCross }, west,
      levels: LEVELS[region.id], color: LEVEL_COLORS[region.id],
      current: state.region === region.id && area?.kind !== 'planet',
    };
  });
}

const coordinate = point => `(${point.x}, ${point.y})`;
const routeStatus = open => open ? 'Open' : 'Sealed';

function branchView(branch) {
  const direction = branch.gate.direction;
  const passage = branch.gate.boatOnly ? 'Sailing passage' : direction[0].toUpperCase() + direction.slice(1) + ' gate';
  const route = passage + ' · ' + routeStatus(branch.open) + (branch.gate.boatOnly && !branch.open ? ' · Boat and both relics required' : '');
  return `<li class="atlas-branch"><details${branch.current ? ' open' : ''}>
    <summary><span>${escape(branch.name)}</span><small>${route}${branch.current ? ' · You are here' : ''}</small></summary>
    <p>${branch.gate.boatOnly ? 'Passage' : 'Gate'} ${coordinate(branch.gate)}</p><ul>${branch.sites.map(site => `<li>${escape(site.name)} ${coordinate(site)}</li>`).join('')}</ul>
  </details></li>`;
}

export function atlasView(state) {
  return `<p class="atlas-legend"><span>Recommended character levels</span><span><i class="atlas-town"></i> Settlement</span><span><i class="atlas-dungeon"></i> Dungeon</span><span><i class="atlas-gate"></i> Gate</span><span><i class="atlas-passage"></i> Sailing passage</span></p>
    <ol class="atlas-regions">${atlasRegions(state).map(region => `<li class="atlas-region" style="--difficulty:${region.color}">
      <header><h3>${escape(region.name)}</h3><span>Levels ${region.levels}</span>${region.current ? '<small>Current land</small>' : ''}</header>
      <canvas width="64" height="48" data-atlas-map="${region.id}" role="img" aria-label="Terrain map of ${escape(region.name)}"></canvas>
      <p class="atlas-east">East gate to ${escape(REGIONS[region.east.target].name)} ${coordinate(region.east)} · ${routeStatus(region.east.open)}</p>
      <ul class="atlas-branches">${region.branches.map(branchView).join('')}</ul>
      <details class="atlas-landmarks"><summary>Settlements and dungeons</summary>
        <ul>${region.towns.map(town => `<li>${escape(town.name)} ${coordinate(town)}</li>`).join('')}${[...region.dungeons, ...region.sideDungeons].map(dungeon => `<li>${state.relics.includes(dungeon.id) ? '✓ ' : ''}${escape(dungeon.name)} ${coordinate(dungeon)}${DUNGEON_NOTES[dungeon.id] ? ` <small>${DUNGEON_NOTES[dungeon.id]}</small>` : ''}</li>`).join('')}</ul>
      </details>
    </li>`).join('')}</ol>`;
}

export function paintAtlasMaps(container, state) {
  const regions = atlasRegions(state);
  const mapArea = areaFor(state);
  for (const canvas of container.querySelectorAll('[data-atlas-map]')) {
    const region = regions[Number(canvas.dataset.atlasMap)];
    const context = canvas.getContext('2d');
    if (!region || !context) continue;
    const stepX = WORLD_WIDTH / canvas.width;
    const stepY = WORLD_HEIGHT / canvas.height;
    const colors = { ...region.palette, grass: region.palette.land, road: '#c4ad78', bridge: '#aa8a61', swamp: '#416c56' };
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      context.fillStyle = colors[worldTile(region.id, x * stepX, y * stepY)];
      context.fillRect(x, y, 1, 1);
    }
    function mark(point, color) {
      const x = Math.round(point.x / stepX);
      const y = Math.round(point.y / stepY);
      context.fillStyle = '#152018';
      context.fillRect(x - 2, y - 2, 4, 4);
      context.fillStyle = color;
      context.fillRect(x - 1, y - 1, 2, 2);
    }
    for (const town of region.towns) mark(town, MARKS.town);
    for (const dungeon of [...region.dungeons, ...region.sideDungeons]) mark(dungeon, MARKS.dungeon);
    for (const gate of [region.east, region.west, ...region.branches.map(branch => branch.gate)].filter(Boolean)) mark(gate, gate.boatOnly ? MARKS.passage : MARKS.gate);
    if (region.current && !mapArea && state.mode === 'world') mark(state, '#fff');
  }
}
