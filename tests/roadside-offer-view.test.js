import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('roadside offer panels render the creature making the proposal', async()=>{
 const source=await readFile(new URL('../public/game/app.js',import.meta.url),'utf8');
 const styles=await readFile(new URL('../public/style.css',import.meta.url),'utf8');
 assert.match(source,/roadside-offer-creature/);
 assert.match(source,/paintMonster\([^;]+meeting/);
 assert.match(styles,/\.roadside-offer-creature\s*\{[^}]*position:relative[^}]*pointer-events:none/s);
});
