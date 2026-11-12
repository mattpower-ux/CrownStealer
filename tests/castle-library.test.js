import test from 'node:test';
import assert from 'node:assert/strict';
import {castleLibraryBooks} from '../public/game/castle-library.js';
import {castleLayout} from '../public/game/castle-interiors.js';
import {TOWNS} from '../public/game/content.js';

test('each palace library has three distinct readable books and a factual treasure hint',()=>{
 const ids=new Set(),texts=new Set(),names=new Set();
 for(const town of TOWNS){const layout=castleLayout(town.id),books=castleLibraryBooks(town.id,layout);
  assert.equal(books.length,layout.rooms.filter(r=>['archive','library'].includes(r.id)).length*3);
  assert.ok(books.some(b=>b.category==='hint'));
  for(const room of layout.rooms.filter(r=>['archive','library'].includes(r.id)))assert.equal(books.filter(b=>b.room===room.id&&b.rarity==='rare').length,1);
  for(const b of books){assert.ok(!ids.has(b.id));ids.add(b.id);assert.ok(!names.has(b.name));names.add(b.name);assert.ok(!texts.has(b.text));texts.add(b.text);assert.notEqual(layout.tiles[b.y][b.x],'wall');assert.ok(b.name&&b.text);}
 }
 const all=TOWNS.flatMap(t=>castleLibraryBooks(t.id,castleLayout(t.id)));
 for(const title of ['Goat Pudding','Purple Snail Soup','Carcass Carcassone Stir Fry'])assert.ok(all.some(b=>b.name.includes(title)));
});
