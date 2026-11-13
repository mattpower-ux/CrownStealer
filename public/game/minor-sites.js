import {worldSize} from './world-size.js';
import {mountainTunnelEnds} from './wilderness-landscape.js';

const columns = 6;
const rows = 4;
const siteCount = columns * rows;
const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const kinds = [
  {kind: 'koboldCave', names: ['Kobold Cave', 'Split Rock Cave', 'Kobold Burrow', 'Sooty Kobold Den', 'Bent Stair Cave', 'Pebble Run Cave', 'Twin Mouth Cave', 'Kobold Hideout']},
  {kind: 'ruinedShrine', names: ['Ruined Shrine', 'Broken Altar', 'Wayside Shrine', 'Mossy Shrine', 'Collapsed Shrine', 'Forgotten Shrine', 'Tumbled Shrine', 'Windworn Shrine']},
  {kind: 'cemetery', names: ['Old Cemetery', 'Overgrown Cemetery', 'Field Cemetery', 'Walled Cemetery', 'Tilted Headstone Cemetery', 'Quiet Cemetery', 'Hill Cemetery', 'Forgotten Cemetery']},
];

export function minorSiteDefinition(id) {
  const match = /^minor-(r[0-3]|w(?:[0-9]|1[01]))-(0|[1-9]|1[0-9]|2[0-4])$/.exec(id);
  if (!match) return null;
  const [, land, suffix] = match;
  const branch = land[0] === 'w';
  const landNumber = Number(land.slice(1));
  const ordinal = branch ? landNumber + 4 : landNumber;
  const region = branch ? Math.floor(landNumber / 3) : landNumber;
  const slot = Number(suffix);
  const index = region * 2;
  const area = branch ? 'wild-' + landNumber : null;
  if (slot === siteCount) {
    return {id, kind: 'tunnel', name: 'Mountain Tunnel', floors: 1, guarded: false, treasure: true, trapped: false, index, seed: 60000 + ordinal, region, area};
  }
  const variant = Math.floor(slot / kinds.length);
  const {kind, names} = kinds[(slot + ordinal) % kinds.length];
  const shrine = kind === 'ruinedShrine';
  return {
    id, kind, name: names[(variant + ordinal) % names.length],
    floors: kind === 'cemetery' ? 1 + (variant + ordinal) % 3 : 1,
    guarded: !shrine || Boolean(variant & 1),
    treasure: !shrine || Boolean(variant & 2),
    trapped: shrine && Boolean(variant & 4),
    index,
    seed: 50000 + ordinal * siteCount + slot,
    region,
    area,
  };
}

function groundNear(start, width, height, tileAt) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const ground = [];
  function visit(x, y) {
    if (x < 1 || y < 1 || x >= width - 1 || y >= height - 1) return;
    const cell = y * width + x;
    if (visited[cell]) return;
    visited[cell] = 1;
    const tile = tileAt(x, y);
    if (!tile || tile === 'water' || tile === 'mountain') return;
    const point = {x, y};
    queue.push(point);
    if (tile !== 'road') ground.push(point);
  }
  visit(start.x, start.y);
  for (const {x, y} of queue) {
    for (const [dx, dy] of directions) visit(x + dx, y + dy);
  }
  return ground;
}

function hash(value) {
  const mixed = Math.imul(value ^ value >>> 16, 0x7feb352d);
  const spread = Math.imul(mixed ^ mixed >>> 15, 0x846ca68b);
  return (spread ^ spread >>> 16) >>> 0;
}

export function minorSites(s, {tileAt, landmarks = []}) {
  const area = s.exploration?.area;
  const branch = /^wild-(\d|1[01])$/.exec(area);
  if (!branch && (area != null || !Number.isInteger(s.region) || s.region < 0 || s.region > 3)) return [];

  const land = branch ? 'w' + branch[1] : 'r' + s.region;
  const salt = minorSiteDefinition('minor-' + land + '-0').seed;
  const {width, height} = worldSize(s);
  const start = branch ? landmarks.find(site => site.kind === 'returnGate') ?? {x: width / 2, y: height - 8} : {x: width / 2, y: height / 2};
  const ground = groundNear(start, width, height, tileAt);
  const ends = mountainTunnelEnds(s.region, area);
  const entrances = ends.every(end => ground.some(point => point.x === end.x && point.y === end.y)) ? ends : [];
  const sectorWidth = (width - 2) / columns;
  const sectorHeight = (height - 2) / rows;
  const candidates = [];
  const picks = Array(siteCount).fill(null);
  for (const point of ground) {
    const {x, y} = point;
    if (landmarks.some(site => Math.max(Math.abs(x - site.x), Math.abs(y - site.y)) <= 3) ||
        entrances.some(site => Math.max(Math.abs(x - site.x), Math.abs(y - site.y)) <= 1)) continue;
    const sector = Math.floor((y - 1) / sectorHeight) * columns + Math.floor((x - 1) / sectorWidth);
    const kind=minorSiteDefinition('minor-'+land+'-'+sector)?.kind;
    const rocky= directions.some(([dx,dy])=>['mountain','hill','rocks'].includes(tileAt(x+dx,y+dy)));
    const rank = hash((x + y * width) ^ Math.imul(salt, 0x9e3779b1)) + (kind==='koboldCave'&&!rocky?4294967296:0);
    const candidate = {x, y, rank};
    candidates.push(candidate);
    if (!picks[sector] || rank < picks[sector].rank) picks[sector] = candidate;
  }

  // A sector can be entirely water. Reserve the other picks first, then find the nearest dry tile.
  const used = new Set(picks.filter(Boolean));
  for (let i = 0; i < picks.length; i++) {
    if (picks[i]) continue;
    const centerX = 1 + (i % columns + .5) * sectorWidth;
    const centerY = 1 + (Math.floor(i / columns) + .5) * sectorHeight;
    let nearest = null;
    let distance = Infinity;
    for (const point of candidates) {
      if (used.has(point)) continue;
      const cost = (point.x - centerX) ** 2 + (point.y - centerY) ** 2;
      if (cost < distance || cost === distance && point.rank < nearest.rank) {
        nearest = point;
        distance = cost;
      }
    }
    if (nearest) {
      picks[i] = nearest;
      used.add(nearest);
    }
  }
  const sites = picks.flatMap((point, i) => point ? [{...minorSiteDefinition('minor-' + land + '-' + i), x: point.x, y: point.y}] : []);
  const tunnel = minorSiteDefinition('minor-' + land + '-' + siteCount);
  return sites.concat(entrances.map((point, i) => ({...tunnel, ...point, other: entrances[1 - i]})));
}
