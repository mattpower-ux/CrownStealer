import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,worldTile} from '../public/game/engine.js';
import {readFile} from 'node:fs/promises';
import {FISHING_CAST_MS,fishingCastFrame} from '../public/game/fishing-animation.js';

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

test('fishing pole is utility gear and cannot replace a weapon during combat',()=>{
 const s=createGame();
 s.mode='battle';s.returnMode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:1};
 s.enemy={name:'Troll',speciesId:'troll',level:2,hp:100,maxHp:100,attack:10,armor:0,gold:1,xp:0,combatDistance:1};
 s.bag.push('fishing-pole');
 const next=act(s,{type:'switchCombatWeapon',id:'fishing-pole'});
 assert.equal(next.equipped,'road-sword');
 assert.equal(next.enemy.hp,100);
});

test('a real weapon can be changed during wilderness combat at the cost of a round',()=>{
 const s=createGame();
 s.mode='battle';s.returnMode='world';s.hp=s.maxHp=500;
 s.enemy={name:'Bandit',speciesId:'bandit',level:2,hp:100,maxHp:100,attack:10,armor:0,gold:1,xp:0};
 s.bag.push('common-bow-1');
 const next=act(s,{type:'switchCombatWeapon',id:'common-bow-1'});
 assert.equal(next.equipped,'common-bow-1');
 assert.ok(next.hp<500,'switching should give the enemy its round');
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

test('fishing cast travels outward before making an expanding splash',()=>{
 assert.equal(FISHING_CAST_MS,850);
 assert.deepEqual(fishingCastFrame(0),{phase:'cast',progress:0,splash:0});
 const line=fishingCastFrame(300);
 assert.equal(line.phase,'cast');assert.ok(line.progress>.5&&line.progress<1);assert.equal(line.splash,0);
 const splash=fishingCastFrame(700);
 assert.equal(splash.phase,'splash');assert.equal(splash.progress,1);assert.ok(splash.splash>.4&&splash.splash<1);
 assert.equal(fishingCastFrame(850).phase,'done');
});
