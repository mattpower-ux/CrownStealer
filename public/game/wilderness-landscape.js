import {WORLD_WIDTH, WORLD_HEIGHT} from './world-size.js';

const centerX = WORLD_WIDTH / 2;
const middleY = WORLD_HEIGHT / 2;
const westLandingY = 68;
const westCoveDepth = 14;
const southCoveDepth = 13;

function coastDepth(length, phase) {
  // Broad headlands broken by short, steep coves and tooth-like rocky points.
  return Array.from({length}, (_, point) => Math.max(2, Math.min(23, Math.round(
    10 + 5.8 * Math.sin(point * .115 + phase) + 4.2 * Math.sin(point * .43 + phase * 2)
    + 2.4 * Math.sin(point * 1.17 + phase * 3)))));
}

const landscapes = Array.from({length: 16}, (_, land) => {
  const lake = {
    x: land === 10 ? 54 : 83 + 2 * (land % 4),
    y: 54 + 2 * (land % 4),
    radiusX: 6 + land % 3,
    radiusY: 4 + land % 2,
  };
  const bend = (land % 5) * .27;
  const river = Array.from({length: lake.y + 1}, (_, y) =>
    Math.round(lake.x + 4 * (Math.sin((y - lake.y) * .14 + bend) - Math.sin(bend))));
  const ridge = {x: 43 + land % 4, y: 70 + 2 * (land % 3), radiusX: 4, radiusY: 10 + land % 3};
  const phase = land * .49;
  const shore = {
    north: coastDepth(WORLD_WIDTH, phase), south: coastDepth(WORLD_WIDTH, phase + 1.6),
    west: coastDepth(WORLD_HEIGHT, phase + .9), east: coastDepth(WORLD_HEIGHT, phase + 2.3),
  };
  return {lake, river, ridge, shore, footbridge: 14 + land % 5};
});

function landscapeFor(region, area) {
  if (area == null) return landscapes[region];
  const branch = /^wild-(\d|1[01])$/.exec(area);
  return branch ? landscapes[4 + Number(branch[1])] : null;
}

export function mountainTunnelEnds(region, area) {
  const ridge = landscapeFor(region, area)?.ridge;
  return ridge ? [
    {x: ridge.x - ridge.radiusX - 1, y: ridge.y},
    {x: ridge.x + ridge.radiusX + 1, y: ridge.y},
  ] : [];
}

export const boatOnlyArea = area => area === 'wild-10' || area === 'wild-11';
export function boatPassageShore(area) {
  if (area === 'wild-10') return {x: centerX, y: WORLD_HEIGHT - 2 - southCoveDepth};
  if (area === 'wild-11') return {x: westCoveDepth + 1, y: westLandingY};
  return null;
}

function coastalWater(region, area, x, y, shore) {
  if (x > 23 && x < WORLD_WIDTH - 24 && y > 23 && y < WORLD_HEIGHT - 24) return false;
  const mainland = area == null;
  const east = WORLD_WIDTH - 1 - x;
  const south = WORLD_HEIGHT - 1 - y;
  if (mainland && region === 3) {
    // Flood two old gate approaches into curved, sheltered coves.
    const westCove = westCoveDepth * Math.exp(-(((y - westLandingY) / 5.5) ** 2));
    const southCove = southCoveDepth * Math.exp(-(((x - centerX) / 6.5) ** 2));
    if (x <= westCove || south <= southCove) return true;
  }
  const borderApproach = mainland && Math.abs(y - middleY) <= 2;
  const westApproach = borderApproach || mainland && region > 0 && Math.abs(y - westLandingY) <= 2;
  const northApproach = Math.abs(x - centerX) <= 2;
  const southApproach = Math.abs(x - centerX) <= 2;
  return x <= shore.west[y] && !westApproach || east <= shore.east[y] && !borderApproach ||
    y <= shore.north[x] && !northApproach || south <= shore.south[x] && !southApproach;
}

export function landscapeTile(region, area, x, y, base) {
  // A tiny island inside Moonless Thicket's lake, with open water on every side.
  if (area === 'wild-10' && ((x-87)/2)**2 + ((y-58)/1.5)**2 <= 1) return 'grass';
  const landscape = landscapeFor(region, area);
  if (!landscape || base === 'water') return base;
  const {lake, river, ridge, shore, footbridge} = landscape;
  if (area === 'wild-6' && ((x-112)/5.6)**2 + ((y-64)/8)**2 <= 1) return 'grass';
  if (coastalWater(region, area, x, y, shore)) return 'water';
  if (y > 0 && y < lake.y && Math.abs(x - river[y]) <= 1) {
    return base === 'road' || y === footbridge ? 'bridge' : 'water';
  }
  // A western tributary winds toward the south coast with frequent foot crossings.
  const tributaryX=29+Math.round(Math.sin(y*.13+(region||0)) * 3);
  if(y>24&&y<82&&Math.abs(x-tributaryX)<=1)return base==='road'||[32,44,60,76].includes(y)?'bridge':'water';
  if (base === 'road') return base;
  if (Math.abs(x - lake.x) <= lake.radiusX * 1.4 && Math.abs(y - lake.y) <= lake.radiusY * 1.4) {
    const shore = ((x - lake.x) / lake.radiusX) ** 2 + ((y - lake.y) / lake.radiusY) ** 2;
    if (shore <= 1) return 'water';
    if (shore <= 1.65 && y >= lake.y - 1 && base !== 'mountain') return 'swamp';
  }
  if (y === ridge.y && Math.abs(x - ridge.x) === ridge.radiusX + 1) return 'grass';
  if (((x - ridge.x) / ridge.radiusX) ** 2 + ((y - ridge.y) / ridge.radiusY) ** 2 <= 1) return 'mountain';
  return base;
}
