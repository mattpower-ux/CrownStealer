import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('standard action buttons inside a dialog are dispatched by the panel click handler', async()=>{
 const source=await readFile(new URL('../public/game/app.js',import.meta.url),'utf8');
 const start=source.indexOf("$('panel').addEventListener('click',e=>{");
 const end=source.indexOf("document.addEventListener('visibilitychange'",start);
 assert.ok(start>=0&&end>start,'panel click handler is present');
 const panelHandler=source.slice(start,end);
 assert.match(panelHandler,/closest\('button\[data-action\]'\)/);
 assert.match(panelHandler,/dispatch\(JSON\.parse\(actionButton\.dataset\.action\)\)/);
});
