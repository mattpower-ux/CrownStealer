import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dungeonMap,saveGame,loadGame} from '../public/game/engine.js';
import {beginCemeteryHaunting} from '../public/game/cemetery-haunting.js';
const room=()=>Array.from({length:9},(_,y)=>Array.from({length:9},(_,x)=>x>1&&x<7&&y>1&&y<7?0:1));
const hero=()=>Object.assign(createGame(),{name:'Matt',mode:'dungeon',dungeon:{index:0,floor:0,x:3,y:3,dir:0}});
test('dark spacious cemetery rooms produce a harmless, once-per-room haunting across saves',()=>{
 const s=hero();s.dungeon.x=7;s.dungeon.y=7;const map=dungeonMap(s.dungeon),hp=s.hp,bag=[...s.bag];const event=beginCemeteryHaunting(s,map);assert.ok(event);assert.equal(event.name,'Matt');assert.equal(s.hp,hp);assert.deepEqual(s.bag,bag);assert.equal(s.mode,'dungeon');assert.ok(!s.enemy);s.dungeon.x=8;assert.equal(beginCemeteryHaunting(loadGame(saveGame(s)),map),null);
});
test('hauntings do not appear in lit rooms, corridors, battles or other dungeons',()=>{
 for(const change of [{mode:'battle'},{equippedHead:'miners-cap',bag:['miners-cap']},{dungeon:{index:1,floor:0,x:3,y:3}}]){const s=Object.assign(hero(),change);assert.equal(beginCemeteryHaunting(s,room()),null);}
 const m=room();for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++)m[y][x]=x===3?0:1;assert.equal(beginCemeteryHaunting(hero(),m),null);
});
test('main cemetery vault has an open chamber eligible for the haunting',()=>{const s=hero();s.dungeon.x=7;s.dungeon.y=7;assert.ok(beginCemeteryHaunting(s,dungeonMap(s.dungeon)));});
