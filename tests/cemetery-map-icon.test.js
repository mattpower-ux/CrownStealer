import test from 'node:test';
import assert from 'node:assert/strict';
import {cemeteryMapIconFeatures,drawCemeteryMapIcon} from '../public/game/dungeon-icons.js';

test('cemetery map icon combines a gate, varied graves, monument, path and lantern',()=>{
 assert.deepEqual(new Set(cemeteryMapIconFeatures),new Set(['gate','graves','monument','path','lantern']));
 const calls=[];
 const gradient={addColorStop(){}};
 const c=new Proxy({canvas:{},createLinearGradient(){return gradient;},createRadialGradient(){return gradient;}},{
  get(target,key){if(key in target)return target[key];return (...args)=>calls.push([key,...args]);},
  set(target,key,value){target[key]=value;return true;},
 });
 drawCemeteryMapIcon(c,100,100,48,{stone:'#77775b',edge:'#a39b75',moss:'#5b653b'});
 assert.ok(calls.filter(([name])=>name==='arc').length>=2,'varied rounded graves');
 assert.ok(calls.some(([name])=>name==='quadraticCurveTo'),'winding path or arched gate');
 assert.ok(calls.filter(([name])=>name==='fillRect').length>=5,'gate, monument and lantern geometry');
});
