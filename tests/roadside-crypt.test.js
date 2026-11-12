import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../public/game/engine.js';
import {TREASURE_ITEMS} from '../public/game/treasure.js';
import {enterRoadsideCrypt,roadsideCryptMap,cryptChest,cryptGuardian} from '../public/game/roadside-crypt.js';
test('fall crypt has a reachable rare chest, undead guardian, and distinct persistent identity per fall',()=>{
 const s=createGame();enterRoadsideCrypt(s);const chest=cryptChest(s,TREASURE_ITEMS),map=roadsideCryptMap(),seen=new Set(['1,1']),queue=[[1,1]];
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,key=`${xx},${yy}`;if(map[yy]?.[xx]!==undefined&&map[yy][xx]!==1&&!seen.has(key)){seen.add(key);queue.push([xx,yy]);}}}
 assert.ok(seen.has(`${chest.x},${chest.y}`));assert.equal(TREASURE_ITEMS[chest.item].rarity,'rare');assert.equal(cryptGuardian(s).kind,'undead');
 s.openedChests.push(chest.id);assert.equal(cryptChest(s,TREASURE_ITEMS).opened,true);enterRoadsideCrypt(s);assert.notEqual(cryptChest(s,TREASURE_ITEMS).id,chest.id);assert.equal(cryptChest(s,TREASURE_ITEMS).opened,false);
});
