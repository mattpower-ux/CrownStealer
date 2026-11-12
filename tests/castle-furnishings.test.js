import test from 'node:test';
import assert from 'node:assert/strict';
import {castleLayout} from '../public/game/castle-interiors.js';
import {castleFurnishings} from '../public/game/castle-furnishings.js';
import {TOWNS} from '../public/game/content.js';
test('furniture distinguishes chambers, meeting rooms and audience rooms in every palace',()=>{
 for(const town of TOWNS){
  const layout=castleLayout(town.id), props=castleFurnishings(layout);
  for(const kind of ['bed','chair','table','throne'])assert.ok(props.some(p=>p.kind===kind),town.id+' '+kind);
  for(const p of props){assert.notEqual(layout.tiles[p.y]?.[p.x],'wall');assert.ok(p.x>=0&&p.y>=0&&p.x<layout.width&&p.y<layout.height);if(p.kind!=='throne')assert.ok(![...layout.chests,...layout.guards,...(layout.patrols||[]),layout.entrance,layout.dungeonStair].filter(Boolean).some(q=>q.x===p.x&&q.y===p.y));}
  assert.equal(new Set(props.map(p=>p.x+','+p.y)).size,props.length);
 }
});
