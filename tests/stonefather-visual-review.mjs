import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://review.test/**',async route=>{const path=new URL(route.request().url()).pathname;if(path==='/')return route.fulfill({contentType:'text/html',body:'<style>html,body{margin:0;background:#05090b}canvas{width:1440px;height:900px}</style><canvas></canvas>'});try{await route.fulfill({body:await readFile('public'+path),contentType:path.endsWith('.js')?'text/javascript':'image/webp'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://review.test/');await mkdir('artifacts',{recursive:true});
 await page.evaluate(async()=>{const {createGame}=await import('/game/engine.js');const {render}=await import('/game/render.js');const state=createGame('Stonefather review');Object.assign(state,{mode:'dungeon',region:2});state.dungeon={site:'minor-site',minorId:'minor-r2-8',index:4,floor:0,x:7,y:10,dir:0};render(document.querySelector('canvas'),state,1200,null,true);});
 await page.waitForTimeout(400);await page.screenshot({path:'artifacts/stonefather-visual-review.png'});assert.deepEqual(errors,[]);console.log('artifacts/stonefather-visual-review.png');
}finally{await browser.close();}
