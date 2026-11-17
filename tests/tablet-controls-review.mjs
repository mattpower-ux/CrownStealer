process.env.PORT='4174';
await import('../server.mjs');
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {for (const [width,height] of [[1280,800],[1024,600],[800,1280]]) {const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block'});page.on('pageerror',e=>console.log('PAGE ERROR',e.message));await page.goto('http://127.0.0.1:4174');await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const s=createGame();delete s.flags.royalQuest;s.mode='world';s.location=null;localStorage.setItem('crownstealer-save-v1',saveGame(s));});await page.reload();await page.locator('.studio-splash').click({timeout:5000}).catch(()=>{});await page.locator('#continue-game').click();await page.waitForTimeout(500);const result=await page.locator('#travel-controls').evaluate(e=>({background:getComputedStyle(e).backgroundColor,joysticks:document.querySelectorAll('.touch-joystick').length,buttons:e.querySelectorAll('#movement button').length}));assert.equal(result.background,'rgba(0, 0, 0, 0)');assert.equal(result.joysticks,0);assert.ok(result.buttons>=4);console.log(width+'x'+height,JSON.stringify(result));await page.close();}}finally{await browser.close();}


process.exit(0);




