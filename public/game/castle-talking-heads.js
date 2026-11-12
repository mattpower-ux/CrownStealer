import {TOWNS} from './content.js';

const species = ['Moose', 'Fish', 'Yak', 'Wilderbeast'];
const key = (x, y) => `${x},${y}`;

export function castleTalkingHead(layout, town) {
  const townIndex = TOWNS.findIndex(entry => entry.id === town.id);
  const foyer = layout.rooms.find(room => room.id === 'vestibule');
  if (townIndex < 0 || !foyer) return null;
  const occupied = new Set([...layout.chests, ...layout.guards, ...layout.patrols, ...layout.books,
    layout.entrance, layout.dungeonStair, layout.king, layout.princess, layout.governor]
    .filter(Boolean).map(point => key(point.x, point.y)));
  const wall = Array.from({length: foyer.height}, (_, offset) => {
    const y = foyer.y + offset, east = foyer.x + foyer.width;
    return [{x: foyer.x - 1, y, floorX: foyer.x}, {x: east, y, floorX: east - 1}];
  }).flat().find(({x, y, floorX}) => layout.tiles[y]?.[x] === 'wall' && !occupied.has(key(x, y)) &&
    layout.tiles[y][floorX] === foyer.id && !occupied.has(key(floorX, y)));
  if (!wall) return null;
  const artIndex = townIndex % species.length;
  const animal = species[artIndex];
  return {id: 'castle-head:' + town.id, kind: 'talking-head', name: 'Stuffed ' + animal,
    species: animal, artIndex, x: wall.x, y: wall.y};
}

export function talkingHeadReply(head, name, roll, canGiveGem) {
  if (canGiveGem && roll >= 2 / 3) {
    return {text: 'I can’t talk now. Here’s a gem. Now leave me alone!', gift: 'medium-emerald'};
  }
  if (roll < (canGiveGem ? 1 / 3 : 1 / 2)) {
    return {text: 'Did you seriously just talk to a stuffed ' + head.species + '?', gift: null};
  }
  return {text: `Hello ${name}. You’re looking good!`, gift: null};
}
