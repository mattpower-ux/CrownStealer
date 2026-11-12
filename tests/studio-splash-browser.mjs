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
 await page.locator('#studio-splash').waitFor({state:'visible'});
 assert.match(await page.locator('#studio-splash').innerText(),/Power[\s\S]*Productions[\s\S]*Presents/i);
 assert.equal(await page.locator('#title-screen').evaluate(e=>e.inert),true);
 await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/power-productions-splash.png'});
 await page.locator('#studio-splash').waitFor({state:'detached',timeout:5000});
 assert.equal(await page.locator('#title-screen').evaluate(e=>e.inert),false);
 await page.evaluate(()=>localStorage.setItem('splash-save-check','preserved'));
 await page.reload();await page.keyboard.press('Space');
 await page.locator('#studio-splash').waitFor({state:'detached',timeout:1500});
 assert.equal(await page.evaluate(()=>localStorage.getItem('splash-save-check')),'preserved');
 await page.reload();await page.locator('#studio-splash').click();
 await page.locator('#studio-splash').waitFor({state:'detached',timeout:1500});
 assert.deepEqual(errors,[]);console.log('Chromium: Power Productions splash, automatic dismissal, keyboard skip, tap skip, and preserved storage passed.');
}finally{await browser.close();}
