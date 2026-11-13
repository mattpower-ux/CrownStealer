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
 await page.evaluate(async()=>{const {createGame,act,minorSiteList,saveGame}=await import('/game/engine.js');let s=createGame('Guard sight review');const site=minorSiteList(s).find(p=>p.minorKind==='koboldCave'&&p.guarded);Object.assign(s,{x:site.x,y:site.y});s=act(s,{type:'enter'});Object.assign(s.dungeon,{x:13,y:10,dir:2});localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();await page.locator('#game').waitFor({state:'visible'});
 await page.getByRole('button',{name:/Engage Kobold/}).waitFor();
 await page.screenshot({path:'artifacts/guardian-visible-burrow.png'});
 await page.getByRole('button',{name:/Engage Kobold/}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).mode==='battle');
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(s.enemy.combatDistance,3);assert.ok([0,2].includes(s.enemy.surpriseShotsRemaining));assert.deepEqual(errors,[]);
 console.log('Visible burrow guardian and encounter at 3 squares passed.');
}finally{await browser.close();}
