import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,worldTile} from '../public/game/engine.js';
import {readFile} from 'node:fs/promises';

function shoreState(){
 const s=createGame();
 for(let y=2;y<94;y++)for(let x=2;x<126;x++)if(worldTile(0,x,y)!=='water'&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>worldTile(0,x+dx,y+dy)==='water')){Object.assign(s,{x,y});s.bag.push('fishing-pole');return s;}
 throw Error('No shoreline found');
}

test('fishing pole must be equipped before casting beside water',()=>{
 let s=shoreState();
 assert.match(act(s,{type:'fish'}).log.at(-1),/equip/i);
 s=act(s,{type:'equip',id:'fishing-pole'});
 assert.equal(s.equipped,'fishing-pole');
 const cast=act(s,{type:'fish'});
 assert.equal(cast.turns,s.turns+1);
 assert.match(cast.log.at(-1),/cast|fish|line|treasure/i);
});

test('fishing can catch both edible fish and random treasure',()=>{
 let fish=null,treasure=null;
 for(let rng=1;rng<5000&&(!fish||!treasure);rng++){
  const s=shoreState();s.rng=rng;s.equipped='fishing-pole';
  const result=act(s,{type:'fish'});
  if(result.bag.includes('fresh-fish'))fish=result;
  if(result.bag.length>s.bag.length&&!result.bag.includes('fresh-fish'))treasure=result;
 }
 assert.ok(fish,'expected a fish catch');
 assert.ok(treasure,'expected a treasure catch');
});

test('eating a caught fish doubles wilderness recovery for three game hours',()=>{
 let s=createGame();s.hp=1;s.bag.push('fresh-fish');
 s=act(s,{type:'useItem',id:'fresh-fish'});
 assert.ok(s.flags.fishRecoveryUntil>s.worldTimeMs);
 s=act(s,{type:'clockTick',elapsedMs:10000});
 assert.equal(s.hp,5);
});

test('wilderness controls expose a cast button for an equipped pole at shore',async()=>{
 const source=await readFile(new URL('../public/game/app.js',import.meta.url),'utf8');
 assert.match(source,/Cast fishing line/);
 assert.match(source,/type:'fish'/);
});
