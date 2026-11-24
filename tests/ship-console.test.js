import test from 'node:test';
import assert from 'node:assert/strict';
import {atShipConsole} from '../public/game/ship-console.js';

test('planet selection is available only while standing on the ship control station',()=>{
 const atStation={mode:'dungeon',dungeon:{ship:true,x:7,y:5}};
 assert.equal(atShipConsole(atStation),true);
 assert.equal(atShipConsole({...atStation,dungeon:{...atStation.dungeon,y:6}}),false);
 assert.equal(atShipConsole({...atStation,dungeon:{ship:false}}),false);
});
