import test from 'node:test';
import assert from 'node:assert/strict';
import {secretSearchMapMarkup} from '../public/game/secret-search-view.js';

const map=Array.from({length:15},(_,y)=>Array.from({length:15},(_,x)=>x===0||y===0||x===14||y===14?1:0));

test('Search Hidden shows a sixty-foot local map centered on the player',()=>{
 const html=secretSearchMapMarkup({dungeon:{x:7,y:7,dir:1}},map,{chance:.27});
 assert.match(html,/viewBox="0 0 13 13"/);
 assert.match(html,/sixty-foot area/);
 assert.match(html,/Search chance: <strong>27%/);
 assert.match(html,/secret-map-player/);
 assert.match(html,/Search this area/);
});

test('revealed hidden doors are highlighted and replace the search control',()=>{
 const html=secretSearchMapMarkup({dungeon:{x:7,y:7,dir:0,secretRoom:{x:9,y:7}}},map,{chance:.2});
 assert.match(html,/secret-map-door/);
 assert.match(html,/Hidden door revealed in gold/);
 assert.doesNotMatch(html,/Search this area/);
});
