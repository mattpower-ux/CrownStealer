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

 await page.goto('http://review.test/game/engine.js');await mkdir('artifacts',{recursive:true});
 const seed=async cap=>{await page.goto('http://review.test/game/engine.js');return page.evaluate(async cap=>{const {createGame,act,minorSiteList,saveGame}=await import('/game/engine.js');let s=createGame('Torch Tester');const site=minorSiteList(s).find(p=>p.minorKind==='cemetery');Object.assign(s,{x:site.x,y:site.y});s=act(s,{type:'enter'});s.dungeon.dir=0;if(cap){s.bag.push('miners-cap');s.equippedHead='miners-cap';}localStorage.setItem('crownstealer-save-v1',saveGame(s));},cap);};
 const open=async()=>{await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();};
 const brightness=async()=>page.locator('#scene').evaluate(canvas=>{const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let sum=0;for(let i=0;i<data.length;i+=4)sum+=data[i]+data[i+1]+data[i+2];return sum/(data.length/4*3);});
 await seed(false);await open();await page.getByText("It's dark. Want to light a torch?",{exact:true}).waitFor();
 await page.waitForTimeout(200);await page.screenshot({path:'artifacts/cemetery-dark-prompt.png'});assert.ok(await brightness()<1,'unlit cemetery is pitch black');
 await page.screenshot({path:'artifacts/cemetery-dark-prompt.png'});
 await page.getByRole('button',{name:'Yes',exact:true}).click();await page.locator('#panel').waitFor({state:'hidden'});
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).flags.cemeteryTorches?.length===1);
 await page.waitForTimeout(150);assert.ok(await brightness()>2,'lighting one torch reveals nearby stone');
 await page.screenshot({path:'artifacts/cemetery-one-torch.png'});
 await open();await page.waitForTimeout(150);assert.equal(await page.locator('dialog[data-panel="cemeteryTorch"]').isVisible(),false);assert.ok(await brightness()>2);
 await seed(true);await open();await page.waitForTimeout(150);assert.equal(await page.locator('dialog[data-panel="cemeteryTorch"]').isVisible(),false);assert.ok(await brightness()>2);
 await page.screenshot({path:'artifacts/cemetery-mining-cap.png'});
 await page.goto('http://review.test/game/engine.js');
 await page.evaluate(async()=>{const {createGame,act,saveGame}=await import('/game/engine.js');const {townPlaces}=await import('/game/town.js');let s=createGame('Retreat Tester');s.mode='town';s.location='mothbridge';s.level=3;s.gold=50;const arena=townPlaces(s).find(p=>p.id==='arena');s.townPosition={x:arena.x,y:arena.y};s=act(s,{type:'enterArena'});s=act(s,{type:'startArenaFight'});s.rng=1024;localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await open();await page.screenshot({path:'artifacts/arena-test-start.png'});await page.getByRole('button',{name:'Retreat',exact:true}).click();
 await page.locator('dialog[data-panel="arenaRetreat"]').waitFor();assert.match(await page.locator('#panel-body').textContent(),/5 gold/);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).gold),45);
 await page.screenshot({path:'artifacts/coliseum-retreat.png'});
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).flags.arenaRetreatNotice),undefined);
 assert.deepEqual(errors,[]);console.log('Cemetery darkness, torch persistence, cap bypass and arena retreat modal verified.');
}finally{await browser.close();}
