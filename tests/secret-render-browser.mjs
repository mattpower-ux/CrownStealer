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

 await page.evaluate(async()=>{const {createGame,saveGame,dungeonMap,minorSiteList}=await import('/game/engine.js');const {secretAlcove}=await import('/game/secret-alcoves.js');const s=createGame('Secret review');s.mode='dungeon';s.dungeon={site:'minor-site',minorId:'minor-r0-0',index:0,floor:0,x:1,y:1,dir:2,ladderLayout:1};const entry=minorSiteList(s).find(p=>p.id===s.dungeon.minorId);s.x=entry.x;s.y=entry.y;const m=dungeonMap(s.dungeon),room=secretAlcove(s.dungeon,m),dirs=[[0,-1],[1,0],[0,1],[-1,0]];const near=dirs.find(([dx,dy])=>m[room.y+dy]?.[room.x+dx]!==1);s.dungeon.x=room.x+near[0];s.dungeon.y=room.y+near[1];s.dungeon.dir=dirs.findIndex(([x,y])=>x===-near[0]&&y===-near[1]);localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await boot();await page.getByRole('button',{name:'Search Hidden',exact:true}).click();assert.match(await page.locator('#panel-body').innerText(),/1 turn and 5 game minutes/);assert.match(await page.locator('#panel-body').innerText(),/See Hidden chance/);await page.screenshot({path:'artifacts/secret-search.png'});
 let revealed=false;for(let i=0;i<60&&!revealed;i++){await page.getByRole('button',{name:'Search nearby walls',exact:true}).click();revealed=await page.evaluate(()=>!!JSON.parse(localStorage.getItem('crownstealer-save-v1')).dungeon.secretRoom);}
 assert.ok(revealed);assert.match(await page.locator('#panel-body').innerText(),/secret opening is revealed/);await page.getByRole('button',{name:'Return to exploring',exact:true}).click();await page.screenshot({path:'artifacts/secret-opening.png'});
 await page.keyboard.press('ArrowUp');await page.waitForTimeout(100);assert.match(await page.locator('#scene-caption').innerText(),/trap may hurt/);await page.screenshot({path:'artifacts/secret-stash.png'});assert.deepEqual(errors,[]);console.log('Secret UI passed: search odds and costs, retry, revealed opening, trapped stash warning; no browser errors.');
}finally{await browser.close();}
