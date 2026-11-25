import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('title page refreshes the service worker cache after an update', async () => {
  const worker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(worker, /const CACHE='embers-v246';/);
});

test('wide title art shifts the illustration left of center', async () => {
  const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.title-screen\{[^}]*background-position:58% center/);
});
