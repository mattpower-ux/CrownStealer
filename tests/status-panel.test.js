import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('top-left exploration stats panel is ten percent larger than the compact baseline',async()=>{
 const css=await readFile(new URL('../public/style.css',import.meta.url),'utf8');
 assert.match(css,/\.wilderness-health\s*\{[^}]*width:\s*clamp\(180px,22vw,209px\)/s);
 assert.match(css,/\.wilderness-health-label\s*\{[^}]*font-size:\s*10px/s);
});
