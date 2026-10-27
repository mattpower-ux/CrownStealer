import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,makeDungeon,DIRS} from '../public/game/engine.js';
test('dungeon sidesteps move one square relative to facing without turning, and respect walls',()=>{
 const maze=makeDungeon(0,0);
 for(let dir=0;dir<4;dir++)for(const delta of [-1,1])for(let y=1;y<14;y++)for(let x=1;x<14;x++){
  if(maze[y][x]===1)continue;
  const s=createGame();s.mode='dungeon';s.dungeon={index:0,floor:0,x,y,dir};s.rng=0;
  const [dx,dy]=DIRS[(dir+delta+4)%4],blocked=maze[y+dy][x+dx]===1;
  const result=act(s,{type:'strafe',delta});
  assert.equal(result.dungeon.x,x+(blocked?0:dx));assert.equal(result.dungeon.y,y+(blocked?0:dy));
  assert.equal(result.dungeon.dir,dir);assert.equal(result.turns,blocked?0:1);
 }
});
