import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const mime=path=>path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':path.endsWith('.png')?'image/png':path.endsWith('.webp')?'image/webp':'application/octet-stream';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://review.test/**',async route=>{let path=new URL(route.request().url()).pathname;if(path==='/')path='/index.html';try{await route.fulfill({body:await readFile('public'+path),contentType:mime(path)});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://review.test/');
 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const state=createGame('Acorn Keeper');state.flags.silverAcornGranted=true;state.flags.silverAcornBestowalPending=true;state.bag.push('silver-acorn');state.pendingLoot.push('silver-acorn');localStorage.setItem('crownstealer-save-v1',saveGame(state));});
 await page.reload();await page.click('#continue-game');
 await page.waitForSelector('#panel[data-panel="silverAcornBestowal"][open]');
 assert.equal(await page.textContent('.silver-acorn-bestowal p'),'SSETH BESTOWS UPON YOU THIS SILVER ACORN');
 assert.ok(await page.locator('.silver-acorn-bestowal img').evaluate(image=>image.complete&&image.naturalWidth>0));
 await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/silver-acorn-bestowal.png'});
 await page.getByRole('button',{name:'Return to the shrine'}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));
 assert.equal(saved.flags.silverAcornBestowalPending,undefined);assert.ok(saved.bag.includes('silver-acorn'));assert.deepEqual(errors,[]);
 console.log('artifacts/silver-acorn-bestowal.png');
}finally{await browser.close();}
