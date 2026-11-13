import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});
 await page.route('http://review.test/**',async route=>{let path=new URL(route.request().url()).pathname;if(path==='/')path='/index.html';try{const type=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':path.endsWith('.mp3')?'audio/mpeg':path.endsWith('.json')?'application/json':'image/webp';await route.fulfill({body:await readFile('public'+path),contentType:type});}catch{await route.fulfill({status:404,body:''});}});
 await page.addInitScript(()=>{window.audioAttempts=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.audioAttempts.push(this.src);return play.call(this);};});
 await page.goto('http://review.test/game/engine.js');
 await mkdir('artifacts',{recursive:true});
 async function boot(){await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();await page.locator('#game').waitFor({state:'visible'});}


 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const s=createGame('Quick equip review');s.bag.push('common-sword-1-v2','common-ring-1','rare-ring-1');localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await boot();await page.setViewportSize({width:800,height:600});await page.getByRole('button',{name:'Open inventory',exact:true}).click();
 await page.locator('[data-quick-equip="common-sword-1-v2"]').click();let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(saved.equipped,'common-sword-1-v2');assert.equal(await page.locator('#panel').getAttribute('data-panel'),'inventory');assert.equal(await page.locator('#item-detail').isVisible(),false,'Quick equip must leave item details hidden');
 await page.locator('.bag-info[data-inspect="road-sword"]').click();assert.equal(await page.locator('#item-detail').isVisible(),true);await page.getByRole('button',{name:'Close item details',exact:true}).click();assert.equal(await page.locator('#item-detail').isVisible(),false);assert.equal(await page.locator('#panel').getAttribute('data-panel'),'inventory');
 await page.locator('[data-quick-equip="common-ring-1"]').click();await page.locator('[data-quick-equip="rare-ring-1"]').click();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(saved.equippedRing,'common-ring-1');assert.equal(saved.equippedRing2,'rare-ring-1');assert.equal(await page.locator('#item-detail').isVisible(),false);
 const layout=await page.evaluate(()=>({pageOverflow:document.documentElement.scrollWidth>innerWidth,panelOverflow:document.querySelector('#panel').scrollWidth>document.querySelector('#panel').clientWidth+1,info:[...document.querySelectorAll('.bag-info')].map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}))}));assert.equal(layout.pageOverflow,false);assert.equal(layout.panelOverflow,false);assert.ok(layout.info.every(b=>b.w>=30&&b.h>=30));await page.screenshot({path:'artifacts/inventory-quick-equip-800.png'});console.log('Quick equip browser passed: sword slot updates, detail stays hidden, separate info opens and closes, rings fill both empty slots, pack remains open, 800×600 has no horizontal overflow, info targets at least30px.',layout);assert.deepEqual(errors,[]);
}finally{await browser.close();}
