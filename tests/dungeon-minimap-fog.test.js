import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,dungeonMap,loadGame,saveGame} from '../public/game/engine.js';
import {rememberDungeonExploration} from '../public/game/dungeon-exploration.js';

function delver(){
 const s=createGame('Map delver');
 s.mode=s.returnMode='dungeon';
 s.dungeon={index:0,floor:0,x:1,y:1,dir:1};
 return s;
}

test('dungeon movement remembers only a four-square circular reveal around the explorer',()=>{
 const before=delver();
 const s=act(before,{type:'forward'},[],{noEncounters:true});
 const memory=Object.values(s.flags.discoveredDungeonTiles||{}).flat();
 assert.ok(memory.includes('1,1'),'entrance is remembered');
 assert.ok(memory.includes('2,1'),'nearby passable tiles are revealed');
 assert.ok(!memory.includes('7,1'),'distant tiles remain under fog');
});

test('dungeon tile discovery expands with movement and survives save/load',()=>{
 let s=delver();
 s=act(s,{type:'forward'},[],{noEncounters:true});
 const first=structuredClone(s.flags.discoveredDungeonTiles);
 const map=dungeonMap(s.dungeon);
 let destination=null;
 for(let y=0;y<map.length&&!destination;y++)for(let x=0;x<map[y].length;x++)if(map[y][x]!==1&&Math.hypot(x-s.dungeon.x,y-s.dungeon.y)>8){destination={x,y};break;}
 assert.ok(destination,'the dungeon has a passable destination beyond the first reveal');
 Object.assign(s.dungeon,destination);
 rememberDungeonExploration(s,map);
 const later=Object.values(s.flags.discoveredDungeonTiles||{}).flat();
 const earlier=Object.values(first||{}).flat();
 assert.ok(earlier.every(tile=>later.includes(tile)),'earlier terrain remains discovered');
 assert.ok(later.includes(destination.x+','+destination.y),'the new area is remembered');
 assert.deepEqual(loadGame(saveGame(s)).flags.discoveredDungeonTiles,s.flags.discoveredDungeonTiles);
});
