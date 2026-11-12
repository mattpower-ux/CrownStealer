import test from 'node:test';
import assert from 'node:assert/strict';
import {projectLadderFace,ladderVisibleSpans} from '../public/game/ladder-render.js';

const camera={x:0,y:0,dx:1,dy:0,w:800,h:600,fov:Math.PI/2};
test('ladder faces project at wall scale and clip safely across the camera plane',()=>{
 const face=projectLadderFace([[1,-.2,0],[1,.2,0],[1,.2,1],[1,-.2,1]],camera);
 assert.equal(face.length,4);
 assert.ok(Math.abs(face[0].x-320)<1e-9);
 assert.ok(Math.abs(face[0].y-555)<1e-9);
 const clipped=projectLadderFace([[-1,-.1,0],[1,.1,0],[1,.1,1],[-1,-.1,1]],camera);
 assert.ok(clipped.length>=3);
 assert.ok(clipped.every(p=>p.depth>=.08&&Number.isFinite(p.x)&&Number.isFinite(p.y)));
 assert.deepEqual(projectLadderFace([[-2,0,0],[-1,0,0],[-1,0,1]],camera),[]);
});
test('nearby walls hide ladder faces while open columns reveal them',()=>{
 const face=[{x:0,y:0,depth:2},{x:8,y:0,depth:2},{x:8,y:8,depth:2},{x:0,y:8,depth:2}];
 assert.deepEqual(ladderVisibleSpans(face,new Float32Array([1,1,1,1,3,3,3,3]),8),[[4,8]]);
 assert.deepEqual(ladderVisibleSpans(face,new Float32Array(8).fill(1),8),[]);
});
