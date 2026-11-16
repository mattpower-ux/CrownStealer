import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,loadGame,saveGame} from '../public/game/engine.js';
import {enterRoadsideCrypt} from '../public/game/roadside-crypt.js';
import {percivalCastleSite} from '../public/game/percival-castle.js';
import {DAY_MS} from '../public/game/world-clock.js';

function shaft(){
 const s=createGame('Morgan');
 enterRoadsideCrypt(s);
 Object.assign(s.dungeon,{x:9,y:7});
 return act(s,{type:'rolandCandles'});
}
function equipAmulet(s){
 s=act(s,{type:'rolandSearch'});
 s=act(s,{type:'equip',id:'sir-roland-amulet'});
 return act(s,{type:'useItem',id:'sir-roland-amulet'});
}

test('Roland’s shaft, relics, Paladin requirement and Good destination survive saves',()=>{
 let s=loadGame(saveGame(shaft()));
 assert.equal(s.dungeon.rolandCell,true);
 assert.ok(s.hp>0&&s.hp<s.maxHp);
 assert.equal(act(s,{type:'leave'}).mode,'dungeon');
 s=equipAmulet(s);
 assert.equal(s.flags.rolandAudience,true);
 assert.ok(s.bag.includes('sword-of-the-avenger'));
 assert.notEqual(act(s,{type:'equip',id:'sword-of-the-avenger'}).equipped,'sword-of-the-avenger');
 const rescued=act(loadGame(saveGame(s)),{type:'rolandChoice',choice:'good'});
 const castle=percivalCastleSite(rescued);
 assert.equal(rescued.mode,'world');
 assert.ok(Math.abs(rescued.x-castle.x)+Math.abs(rescued.y-castle.y)<=1);
 rescued.flags.percivalOath='accepted';
 assert.equal(act(rescued,{type:'equip',id:'sword-of-the-avenger'}).equipped,'sword-of-the-avenger');
 let scroll=act(shaft(),{type:'rolandSearch'});
 scroll=act(scroll,{type:'equipMagic',id:'scroll-return'});
 assert.equal(act(scroll,{type:'useMagic'}).mode,'town');
});

test('refusing Roland requires seven meals and a fishing pole to earn passage out of exile',()=>{
 let s=act(equipAmulet(shaft()),{type:'rolandChoice',choice:'wrong'});
 s=loadGame(saveGame(s));
 assert.equal(s.exploration.area,'north-sea-exile');
 assert.equal(act(s,{type:'useItem',id:'scroll-return'}).exploration.area,'north-sea-exile');
 s.bag.push('p-hopper');
 s=act(s,{type:'alienUse',id:'p-hopper'});
 assert.equal(s.exploration.area,'north-sea-exile');
 Object.assign(s,{x:64,y:42});
 s=act(s,{type:'enter'});
 Object.assign(s.dungeon,{x:9,y:7});
 s=act(s,{type:'rolandPole'});
 assert.ok(s.bag.includes('fishing-pole'));
 Object.assign(s.dungeon,{x:1,y:1});
 s=act(s,{type:'leave'});
 assert.equal(s.mode,'world');
 Object.assign(s,{x:64,y:61});
 assert.equal(act(s,{type:'rolandFish'}).flags.rolandExile.casts,0);
 const time=s.worldTimeMs;
 for(let day=0;day<7;day++)s=act(s,{type:'rolandSurvive',food:day%2?'roots':'rat'});
 assert.equal(s.worldTimeMs-time,7*DAY_MS);
 for(let cast=0;cast<5;cast++)s=act(s,{type:'rolandFish'});
 assert.equal(s.flags.rolandExile.boat,true);
 s.y=63;
 s=act(s,{type:'move',dx:0,dy:1});
 assert.equal(s.y,63);
 s=act(s,{type:'move',dx:0,dy:1});
 assert.equal(s.y,64);
 while(s.y<88)s=act(s,{type:'move',dx:0,dy:1});
 s=loadGame(saveGame(s));
 s=act(s,{type:'enter'});
 assert.equal(s.exploration.area,null);
 assert.equal(s.mode,'world');
 assert.equal(s.flags.rolandExile,undefined);
});
