import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

test('secret, shrine and item modules initialize independently in fresh module graphs',()=>{
 for(const name of ['treasure','secret-alcoves','minor-dungeons','shrine-deities','see-hidden','items']){
  const url=new URL('../public/game/'+name+'.js',import.meta.url).href;
  assert.doesNotThrow(()=>execFileSync(process.execPath,['--input-type=module','-e','await import('+JSON.stringify(url)+')'],{stdio:'pipe'}),name);
 }
});
