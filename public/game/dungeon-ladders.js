import {dungeonFloors} from './dungeon-depths.js';

const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const entrance = {x: 1, y: 1};
const endpoint = {x: 13, y: 13};

function hallwayTiles(tileAt) {
  // Search from the original entrance to the deepest tile. Every chosen ladder
  // stays on this route, so ladders cannot lead into a detached branch.
  const route = [{...entrance, parent: null}];
  const visited = new Set(['1,1']);
  for (const point of route) {
    const {x, y} = point;
    if (x === endpoint.x && y === endpoint.y) {
      const hallways = [];
      for (let step = point.parent; step?.parent; step = step.parent) {
        const {x: sx, y: sy} = step;
        const northSouth = tileAt(sx, sy - 1) !== 1 && tileAt(sx, sy + 1) !== 1;
        const eastWest = tileAt(sx - 1, sy) !== 1 && tileAt(sx + 1, sy) !== 1;
        if (tileAt(sx, sy) === 0 && northSouth !== eastWest) hallways.push({x: sx, y: sy});
      }
      return hallways.reverse();
    }
    for (const [dx, dy] of directions) {
      const nx = x + dx, ny = y + dy, key = nx + ',' + ny;
      if (tileAt(nx, ny) === 1 || visited.has(key)) continue;
      visited.add(key);
      route.push({x: nx, y: ny, parent: point});
    }
  }
  return [];
}

export function dungeonLadders(d, map) {
  if (d.ship) return [];
  // Secret alcoves open after a floor is generated. Keep its ladders fixed.
  const tileAt = (x, y) => d.secretRoom?.x === x && d.secretRoom.y === y ? 1 : (map[y]?.[x] ?? 1);
  const hasDown = d.floor < dungeonFloors(d) - 1;
  const hallways = d.ladderLayout === 1 && !d.royal && d.site !== 'elf-village' ? hallwayTiles(tileAt) : [];
  const up = d.floor > 0 ? hallways[Math.round((hallways.length - 1) * .25)] ?? entrance : entrance;
  const lower = hallways[Math.round((hallways.length - 1) * .75)];
  const down = lower && lower !== up ? lower : endpoint;
  const points = d.royal === 'cell' ? [{x: 3, y: 3, direction: 'down'}]
    : d.royal === 'sewer' ? [{...endpoint, direction: 'up'}]
    : [{...up, direction: 'up'}, ...(hasDown ? [{...down, direction: 'down'}] : [])];
  return points.map(point => {
    const [dx, dy] = directions.find(([x, y]) => tileAt(point.x + x, point.y + y) === 1) ?? directions[0];
    return {
      ...point,
      wallX: point.x + dx,
      wallY: point.y + dy,
      opening: point.direction === 'up' ? 'ceiling' : 'floor',
    };
  });
}

export function ladderPrompt(s, map) {
  const d = s?.dungeon;
  if (s?.mode !== 'dungeon' || !d || d.ship || d.site === 'elf-village') return null;
  const ladder = dungeonLadders(d, map).find(l => l.x === d.x && l.y === d.y);
  return ladder ? {...ladder, upAction: d.royal === 'sewer' ? 'descend' : 'leave'} : null;
}
