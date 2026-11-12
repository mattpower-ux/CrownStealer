import test from 'node:test';import assert from 'node:assert/strict';import {TOWNS} from '../public/game/content.js';import {townPlaces,townWalkable} from '../public/game/town.js';import {existsSync} from 'node:fs';
test('all twelve towns have distinct building geometry and full-resolution background assets',()=>{const layouts=new Set();for(const t of TOWNS){const s={location:t.id,region:t.region};const buildings=townPlaces(s).filter(p=>p.bw);layouts.add(buildings.map(p=>p.id+':'+p.bx+','+p.by).join('|'));assert.ok(existsSync(new URL('../public/assets/town-ground-'+t.id+'.webp',import.meta.url)));const seen=new Set(['6,11']),queue=[[6,11]];for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,key=a+','+b;if(!seen.has(key)&&townWalkable(a,b,s)){seen.add(key);queue.push([a,b]);}}}for(const p of buildings)assert.ok(seen.has(p.x+','+p.y),t.id+' '+p.id);for(const p of buildings)for(const q of buildings)if(p!==q)assert.ok(p.bx+p.bw<=q.bx||q.bx+q.bw<=p.bx||p.by+p.bh<=q.by||q.by+q.bh<=p.by,t.id+' footprints overlap');}assert.equal(layouts.size,12);});
test('each town has one reachable arena door on its own building footprint',()=>{
 for(const town of TOWNS){
  const s={location:town.id,region:town.region};
  const places=townPlaces(s),arenas=places.filter(place=>place.id==='arena');
  assert.equal(arenas.length,1,town.id);
  const [arena]=arenas;
  assert.equal(arena.name,town.id==='bellwether'?'Coliseum':'Gladiator Pit');
  assert.ok(arena.bw>=2&&arena.bh>=2,town.id);
  assert.ok(townWalkable(arena.x,arena.y,s),town.id);
  assert.equal(places.filter(place=>place.x===arena.x&&place.y===arena.y).length,1,town.id);
 }
});
