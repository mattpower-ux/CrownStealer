import test from 'node:test';
import assert from 'node:assert/strict';
import {atlasMarker} from '../public/game/atlas-view.js';
import {previewMarker} from '../public/game/developer-preview.js';

test('shrines, trees, and caves have distinct map markers',()=>{
 assert.deepEqual(atlasMarker({kind:'shrine'}),{type:'shrine',alpha:.78,shape:'bolt-circle',color:'#ffffff'});
 assert.deepEqual(atlasMarker({kind:'tree',name:'Ancient Tree'}),{type:'tree',alpha:.78,shape:'tree',color:'#58bc63'});
 assert.deepEqual(atlasMarker({kind:'cave'}),{type:'cave',alpha:.78,shape:'pick',color:'#bc9472'});
 assert.equal(previewMarker({kind:'shrine'}),'ϟ');
 assert.equal(previewMarker({kind:'tree'}),'♣');
 assert.equal(previewMarker({kind:'cave'}),'⛏');
});
