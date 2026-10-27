import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');
const fixtures=await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');return Array.from({length:4},(_,region)=>{const s=createGame('Map explorer');s.region=region;s.x=16;s.y=12;s.rng=0;return saveGame(s);});});
for(let region=0;region<4;region++){
 await page.addInitScript(value=>localStorage.setItem('crownstealer-save-v1',value),fixtures[region]);await page.reload();await page.locator('#continue-game').click();await page.waitForTimeout(700);await page.screenshot({path:`artifacts/biome-${region}.png`});
}
await page.addInitScript(value=>localStorage.setItem('crownstealer-save-v1',value),fixtures[0]);await page.reload();await page.locator('#continue-game').click();
for(const [key,x,y] of [['ArrowLeft',15,12],['ArrowRight',16,12],['ArrowUp',16,11],['ArrowDown',16,12]]){await page.keyboard.press(key);const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.deepEqual([s.x,s.y],[x,y]);}
await page.addInitScript(()=>{const s=JSON.parse(localStorage.getItem('crownstealer-save-v1'));s.mode='dungeon';s.dungeon={index:0,floor:0,x:1,y:2,dir:1};s.rng=0;localStorage.setItem('crownstealer-save-v1',JSON.stringify(s));});await page.reload();await page.locator('#continue-game').click();
for(const [key,y] of [['ArrowLeft',1],['ArrowRight',2]]){await page.keyboard.press(key);const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.deepEqual([s.dungeon.x,s.dungeon.y,s.dungeon.dir],[1,y,1]);}
await page.keyboard.press('q');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).dungeon.dir),0);
assert.deepEqual(errors,[]);await browser.close();console.log('Four biomes rendered; world arrows and dungeon sideways arrows verified in Chrome.');
