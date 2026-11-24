import test from 'node:test';
import assert from 'node:assert/strict';
import {atShipConsole} from '../public/game/ship-console.js';
import {shipConsoleLayout} from '../public/game/ship-layout.js';

test('planet selection is available only while standing on the ship control station',()=>{
 const atStation={mode:'dungeon',dungeon:{ship:true,x:7,y:5}};
 assert.equal(atShipConsole(atStation),true);
 assert.equal(atShipConsole({...atStation,dungeon:{...atStation.dungeon,y:6}}),false);
 assert.equal(atShipConsole({...atStation,dungeon:{ship:false}}),false);
});

test('ship console controls remain contained within a stable console housing',()=>{
 const layout=shipConsoleLayout({x:7,y:5,dir:0},1440,900);
 assert.equal(layout.visible,true);
 assert.equal(layout.frame.x+layout.frame.width/2,720);
 assert.ok(layout.buttons.length>=6);
 for(const control of layout.buttons){
  assert.ok(control.x>=layout.frame.x);
  assert.ok(control.x+control.width<=layout.frame.x+layout.frame.width);
  assert.ok(control.y>=layout.frame.y);
  assert.ok(control.y+control.height<=layout.frame.y+layout.frame.height);
 }
 assert.equal(shipConsoleLayout({x:7,y:6,dir:0},1440,900).visible,true);
 assert.equal(shipConsoleLayout({x:7,y:6,dir:2},1440,900).visible,false);
});
