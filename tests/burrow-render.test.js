import test from 'node:test';
import assert from 'node:assert/strict';
import {isKoboldBurrow,burrowPixel} from '../public/game/burrow-render.js';
const rgb=p=>[p&255,(p>>>8)&255,(p>>>16)&255];
test('earth theme selects kobold minor caves without changing other dungeons',()=>{
 assert.equal(isKoboldBurrow({site:'minor-site',minorId:'minor-r0-0'}),true);
 for(const d of [{site:'minor-site',minorId:'minor-r0-1'},{index:0},{site:'minor-site',minorId:'minor-r0-24'},{site:'firedrak',minorId:'minor-r0-0'}])assert.equal(isKoboldBurrow(d),false);
});
test('burrow candles emit warm light and earth darkens with distance',()=>{
 const flame=rgb(burrowPixel('wall',.5,.365,.2,true));
 const bare=rgb(burrowPixel('wall',.5,.365,.2,false));
 assert.ok(flame[0]>220&&flame[1]>120&&flame[0]>flame[2]);
 assert.ok(bare[0]<flame[0]/2);
 const near=rgb(burrowPixel('ceiling',.23,.72,.9)),far=rgb(burrowPixel('ceiling',.23,.72,.2));
 assert.ok(near[0]>far[0]&&near[0]>near[2]);
 assert.notEqual(burrowPixel('ceiling',.23,.72,.9),burrowPixel('ceiling',.61,.33,.9));
});
