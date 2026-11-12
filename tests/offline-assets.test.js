import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

test('offline cache contains every runtime module and its declared assets exist',async()=>{
 const root=new URL('../public/',import.meta.url),source=await readFile(new URL('sw.js',root),'utf8');
 const files=runInNewContext(source+';FILES',{self:{addEventListener(){}}});
 for(const file of files)await access(new URL('.'+(file==='/'?'/index.html':file),root));
 for(const file of await readdir(new URL('game/',root)))if(file.endsWith('.js'))assert.ok(files.includes('/game/'+file),'Missing offline module: '+file);
 assert.ok(files.includes('/game/studio-splash.js'));
});
