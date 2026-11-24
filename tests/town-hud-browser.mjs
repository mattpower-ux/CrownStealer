import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
 await page.route('http://review.test/**',async route=>{
  let path=new URL(route.request().url()).pathname;if(path==='/')path='/index.html';
  try{const type=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':path.endsWith('.mp3')?'audio/mpeg':path.endsWith('.json')?'application/json':'image/webp';await route.fulfill({body:await readFile('public'+path),contentType:type});}
  catch{await route.fulfill({status:404,body:''});}
 });
 await page.goto('http://review.test/game/engine.js');
 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const {TOWNS}=await import('/game/content.js');const s=createGame('Town HUD check');Object.assign(s,{mode:'town',location:TOWNS[0].id,townPosition:{x:3,y:8}});localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();
 await page.locator('#wilderness-health').waitFor({state:'visible'});
 await expectLabels(page);
 console.log('Town HUD remains visible with Health, Alignment, and XP.');
}finally{await browser.close();}

async function expectLabels(page){
 const labels=await page.locator('#wilderness-health').textContent();
 assert.match(labels,/Health/);assert.match(labels,/Alignment/);assert.match(labels,/XP/);
}
