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

 await page.goto('http://review.test/game/engine.js');
 await mkdir('artifacts',{recursive:true});
 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const s=createGame('Mara the Bold');s.bag.push('scroll-return','common-invisibility-v4');s.equippedMagic='scroll-return';localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();
 await page.locator('#wilderness-health').waitFor({state:'visible'});
 assert.equal(await page.locator('.wilderness-hero-name').textContent(),'Mara the Bold');
 assert.equal(await page.locator('.wilderness-hero-level').textContent(),'Level 1');
 assert.equal(await page.locator('.wilderness-hero-name').evaluate(el=>getComputedStyle(el).fontSize),await page.locator('#actions button').first().evaluate(el=>getComputedStyle(el).fontSize));
 assert.ok((await page.locator('#wilderness-health').boundingBox()).width>=244);
 await page.locator('.travel-tools [data-save-checkpoint]').click();
 await page.locator('#saved-notice').waitFor({state:'visible'});
 assert.equal(await page.locator('#saved-notice').textContent(),'Saved!');
 await page.locator('#saved-notice').waitFor({state:'hidden'});
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('Test storage unavailable');};});
 await page.locator('.travel-tools [data-save-checkpoint]').click();
 assert.equal(await page.locator('#saved-notice').isVisible(),false);
 assert.match(await page.locator('#toast').textContent(),/Could not save/);
 await page.getByRole('button',{name:'Drink potion',exact:true}).click();
 assert.equal(await page.locator('#panel-body').getByText(/Magic equipped/).count(),0);
 assert.ok(Number.parseFloat(await page.locator('#panel-body').evaluate(el=>getComputedStyle(el).fontSize))>=18);
 await page.locator('#close-panel').click();
 await page.setViewportSize({width:390,height:844});
 const hud=await page.locator('#wilderness-health').boundingBox();assert.ok(hud.x>=0&&hud.x+hud.width<=390);
 await page.screenshot({path:'artifacts/ui-readability-mobile.png'});
 await page.getByRole('button',{name:'Return',exact:true}).click();
 await page.getByRole('button',{name:'Leave town',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Return',exact:true}).count(),0);

 const shops=await page.evaluate(async()=>{const {renderMerchantView}=await import('/game/merchant-view.js');const {merchantFor}=await import('/game/merchant-catalog.js');const {createGame}=await import('/game/engine.js');const s=createGame();s.location='gallows-fair';s.mode='town';const host=document.createElement('div');document.body.append(host);const result=[];for(const id of ['shop','gizmo']){renderMerchantView(host,s,merchantFor(s.location,id),()=>{});result.push({name:host.querySelector('.trade-proprietor').textContent,src:host.querySelector('.trade-proprietor img').getAttribute('src')});}host.remove();return result;});
 assert.deepEqual(shops,[{name:'Loquacia Ragspittle',src:'/assets/loquacia-ragspittle.webp'},{name:'Allthumbs the Unlucky',src:'/assets/allthumbs-unlucky.webp'}]);
 assert.deepEqual(errors,[]);
 console.log('HUD, successful save notice, failed save suppression, potion readability and utility magic verified.');
}finally{await browser.close();}

