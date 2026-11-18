import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');

test('game header exposes an EXIT button at the far right', () => {
  const controls = read('public/game/fullscreen.js');
  assert.match(controls, /exit\.id='exit-game'/);
  assert.match(controls, /exit\.textContent='EXIT'/);
  assert.match(controls, /querySelector\('\.game-header nav'\)\.append\(exit\)/);
});

test('exit control saves and uses the native Android bridge with a title-screen fallback', () => {
  const app = read('public/game/app.js');
  assert.match(app, /\$\('exit-game'\)\.onclick/);
  assert.match(app, /persist\(\)/);
  assert.match(app, /window\.Android\?\.exitGame/);
  assert.match(app, /\$\('home'\)\.click\(\)/);
});

test('Android bridge exposes a native app exit method', () => {
  const java = read('android/src/com/crownstealer/game/MainActivity.java');
  assert.match(java, /@JavascriptInterface public void exitGame\(\)/);
  assert.match(java, /runOnUiThread\(\(\) -> finish\(\)\)/);
});
