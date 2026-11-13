import test from 'node:test';
import assert from 'node:assert/strict';
import {isKoboldBurrow,burrowPixel,burrowDebrisPixel,drawDungeonFlicker} from '../public/game/burrow-render.js';
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

test('burrow rubble stays in wall corners and never changes collision geometry',()=>{
 const map=[[1,1,1],[1,0,0],[1,0,0]],before=JSON.stringify(map);
 assert.notEqual(burrowDebrisPixel(1.08,1.07,.8,map),null);
 assert.equal(burrowDebrisPixel(1.5,1.5,.8,map),null);
 assert.equal(burrowDebrisPixel(2.1,2.1,.8,map),null);
 assert.equal(JSON.stringify(map),before);
});
test('cached flame overlay changes with time and is deterministic for reduced motion',()=>{
 function frame(time){const shapes=[],ctx={save(){},restore(){},createRadialGradient(){return {addColorStop(){}};},fillRect(){},beginPath(){},ellipse(...args){shapes.push([...args,this.globalAlpha]);},fill(){}};drawDungeonFlicker(ctx,800,600,[{x:.5,y:.3,size:.02,phase:2}],time);return shapes;}
 assert.notDeepEqual(frame(0),frame(1200));assert.deepEqual(frame(0),frame(0));
});
