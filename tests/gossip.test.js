import test from 'node:test';
import assert from 'node:assert/strict';
import {gossipDeck,gossipFor} from '../public/game/gossip.js';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {TOWNS,DUNGEONS} from '../public/game/content.js';
test('every town cycles through half useful hints and half comic gossip with subject portraits',()=>{
 for(const town of TOWNS){let s=createGame();s.location=town.id;s.region=town.region;s.mode='town';const seen=[];for(let i=0;i<8;i++){seen.push(gossipFor(s));s=act(s,{type:'talk'});}assert.equal(new Set(seen.map(x=>x.id)).size,8);assert.equal(seen.filter(x=>x.kind==='hint').length,4);assert.ok(seen.every(x=>x.portrait?.src&&x.subject&&x.text));assert.equal(gossipFor(s).id,seen[0].id);assert.equal(gossipFor(loadGame(saveGame(s))).id,seen[0].id);}
});
test('regional gossip identifies actual relics and depths, including relocated Hearth Seal',()=>{
 const hearth=gossipDeck(0).filter(x=>x.kind==='hint').map(x=>x.text).join(' ');assert.match(hearth,/Haghilda/);assert.match(hearth,/level 4/);assert.match(hearth,/level 10/);assert.match(hearth,/Rock Troll/);
 for(let region=1;region<4;region++){const text=gossipDeck(region).filter(x=>x.kind==='hint').map(x=>x.text).join(' ');for(const d of DUNGEONS.filter(x=>x.region===region)){assert.ok(text.includes(d.name));assert.ok(text.includes(d.relic));}}
});
