import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const root=resolve('public'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
 await page.route('http://game.test/**',async route=>{try{const path=new URL(route.request().url()).pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));assert.ok(file.startsWith(root));await route.fulfill({body:await readFile(file),contentType:mime[extname(file)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}});
 await page.goto('http://game.test/');
 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const s=createGame('Boat buyer');s.gold=700;s.flags.wildernessEvent={kind:'bawb'};localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await page.reload();await page.locator('#continue-game').click();
 await page.getByRole('heading',{name:'Bawb the Boatbuilder'}).waitFor();
 assert.equal(await page.locator('img[src="/assets/bawb-boatbuilder.webp"]').evaluate(img=>img.complete&&img.naturalWidth>0),true);
 await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/bawb-offer.png'});
 await page.getByRole('button',{name:'Buy sailboat · 700 gold',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).bag.includes('shrinkable-sailboat'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).gold),0);
 await page.locator('#close-panel').click();await page.locator('[data-panel="inventory"]:visible').first().click();
 await page.locator('[data-inspect="shrinkable-sailboat"]').first().click();
 await page.getByRole('button',{name:'Unfold sailboat',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).flags.sailboatReady);
 assert.deepEqual(errors,[]);console.log('Chromium: saved Bawb offer, purchase, inventory unfold, and persistent boat passed.');
}finally{await browser.close();}
