import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {extname, resolve} from 'node:path';

const require = createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium} = require('playwright');
const origin = 'http://boss-voice-check.test';
const mime = {'.js': 'text/javascript', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.css': 'text/css', '.html': 'text/html'};
const bosses = [
  ['voice-bailiff', {index: 0, floor: 9}],
  ['voice-rock-troll', {index: 1, floor: 9}],
  ['voice-haghilda', {index: 0, floor: 3, site: 'elf-village'}],
  ['voice-drake', {index: 2, floor: 9, site: 'firedrak'}],
  ['voice-leviathan', {index: 5, floor: 19}],
];

const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
  for (const [voice, dungeon] of bosses) {
    const page = await browser.newPage({viewport: {width: 1280, height: 800}, serviceWorkers: 'block'});
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(origin + '/**', async route => {
      const {pathname} = new URL(route.request().url());
      const file = resolve('public', pathname === '/' ? 'index.html' : pathname.slice(1));
      await route.fulfill({path: file, contentType: mime[extname(file)]}).catch(() => route.fulfill({status: 404}));
    });
    await page.goto(origin);
    await page.evaluate(async dungeon => {
      const {createGame, saveGame} = await import('/game/engine.js');
      const {buildEncounter} = await import('/game/encounters.js');
      const s = createGame('Boss audio check');
      s.mode = 'dungeon';
      s.region = Math.floor(dungeon.index / 2);
      s.dungeon = {x: 13, y: 13, dir: 1, ...dungeon};
      s.enemy = buildEncounter(s, .5, true);
      s.returnMode = 'dungeon';
      s.mode = 'battle';
      localStorage.setItem('crownstealer-save-v1', saveGame(s));
    }, dungeon);
    await page.reload();
    const [audio] = await Promise.all([
      page.waitForResponse(response => response.url().endsWith('/assets/' + voice + '.mp3')),
      page.locator('#continue-game').click(),
    ]);
    assert.ok(audio.ok(), voice);
    await page.getByRole('button', {name: 'Face the boss', exact: true}).click();
    await page.locator('#panel').waitFor({state: 'hidden'});
    assert.ok(await page.locator('#combat-panel').isVisible(), voice);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('Five boss intros load their matching recording and let the player start combat in landscape.');
} finally {
  await browser.close();
}
