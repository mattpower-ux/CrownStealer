import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

test('update page obtains a fresh registration and returns without modifying saves',async()=>{
 const html=await readFile(new URL('../public/update.html',import.meta.url),'utf8');
 const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
 let destination=null,registered=false;const status={textContent:''};
 await runInNewContext('(async()=>{'+source+'})()',{
  navigator:{serviceWorker:{getRegistration:async()=>({update:async()=>{throw Error('The object is in an invalid state');}}),register:async(path,options)=>{assert.equal(path,'/sw.js');assert.equal(options.updateViaCache,'none');registered=true;return {active:{state:'activated'}};}}},
  location:{replace:path=>{destination=path;}},document:{getElementById:()=>status},
 });
 assert.ok(registered);assert.equal(destination,'/');assert.equal(status.textContent,'');
 assert.ok(!source.includes('localStorage'));
});
