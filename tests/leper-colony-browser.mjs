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

 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const s=createGame('Colony visitor');Object.assign(s,{x:28,y:28,hp:1,gold:10});let seed=0;while(((Math.imul(seed,1664525)+1013904223)>>>0)/4294967296>=.01)seed++;s.rng=seed;localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();await page.locator('#game').waitFor({state:'visible'});
 await page.locator('#actions button[data-action]').filter({hasText:/Enter/}).click();
 await page.locator('#panel[data-panel="leperColony"]').waitFor({state:'visible'});
 await page.getByRole('button',{name:/Donate 1 gold/}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).flags.leprosy===true);
 let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(s.hp,40);assert.equal(s.gold,9);assert.match(await page.locator('#panel-body').innerText(),/only the White Wizard/);assert.equal(await page.getByRole('button',{name:/Donate 1 gold/}).count(),0);
 await page.screenshot({path:'artifacts/leper-colony-treatment.png'});
 await page.locator('#close-panel').click();await page.locator('.travel-tools [data-panel="inventory"]').click();
 await page.locator('.avatar-bandages').waitFor({state:'visible'});assert.equal(await page.locator('.avatar-bandages').getAttribute('aria-label'),'Bandages cover your head and hands');
 await page.screenshot({path:'artifacts/leprosy-inventory-bandages.png'});
 await page.goto('http://review.test/game/engine.js');
 await page.evaluate(async()=>{const {createGame,act,saveGame}=await import('/game/engine.js');const {twinklestarTowerSite}=await import('/game/twinklestar-tower.js');let s=createGame('Cure visitor');s.region=3;s.exploration={area:'wild-10',artifacts:[],home:{region:3,x:64,y:88}};const tower=twinklestarTowerSite(s);Object.assign(s,{x:tower.x,y:tower.y,gold:6000});s.flags.rowboatReady=true;s=act(s,{type:'enter'});Object.assign(s.dungeon,{floor:8,x:13,y:13});Object.assign(s.flags,{twinklestarGuardianDefeated:true,wizardApprentice:'rejected',leprosy:true,leprosySince:0});localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();
 await page.getByRole('button',{name:'Cure leprosy · 5,000 gold',exact:true}).click();
 await page.waitForFunction(()=>!JSON.parse(localStorage.getItem('crownstealer-save-v1')).flags.leprosy);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).gold),1000);
 await page.locator('.travel-tools [data-panel="inventory"]').click();assert.equal(await page.locator('.avatar-bandages').count(),0);
 assert.deepEqual(errors,[]);console.log('Colony entry, donation, healing, infection and refreshed state passed.');
}finally{await browser.close();}
