import test from 'node:test';import assert from 'node:assert/strict';
import {AudioDirector} from '../public/game/audio.js';
test('recorded effects cache decoded audio and play on effects bus',async()=>{let requests=0;const source=()=>({connect(){},disconnect(){},start(){this.started=true;},stop(){}});const context={state:'running',currentTime:0,decodeAudioData:async()=>({duration:1}),createBufferSource:source,createGain:()=>({gain:{setValueAtTime(){}},connect(){},disconnect(){}})};const d=new AudioDirector({AudioContext:null,fetch:async()=>{requests++;return{ok:true,arrayBuffer:async()=>new ArrayBuffer(1)}}});d.tone=()=>{};d.context=context;d.effects={};await d.effect('hurt');await d.effect('hurt');assert.equal(requests,1);assert.equal(d.voices.size,2);});

