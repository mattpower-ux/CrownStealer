import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://review.test/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/')return route.fulfill({contentType:'text/html',body:'<meta charset="utf-8"><link rel="stylesheet" href="/style.css"><dialog id="panel" data-panel="atlas"><header class="dialog-heading"><h2>World Map</h2><button>×</button></header><div id="panel-body"></div></dialog>'});
  try{await route.fulfill({body:await readFile('public'+path),contentType:path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'image/webp'});}catch{await route.fulfill({status:404,body:''});}
 });
 await page.goto('http://review.test/');await mkdir('artifacts',{recursive:true});
 for(const [name,visited,width,height] of [
  ['initial',[],1280,800],['explored',[0,1,'wild-0','wild-1','wild-2','wild-3'],1280,800],
  ['tablet',[0,1,'wild-0','wild-1','wild-2','wild-3'],1024,600],
  ['whole',[0,1,2,3,...Array.from({length:12},(_,i)=>'wild-'+i)],1600,900],
 ]){
  await page.setViewportSize({width,height});
  await page.evaluate(async visited=>{
   const {createGame}=await import('/game/engine.js');const {atlasView,paintAtlasMaps}=await import('/game/atlas-view.js');
   const state=createGame();state.flags.visitedLands=visited;const body=document.querySelector('#panel-body');
   body.innerHTML=atlasView(state);paintAtlasMaps(body,state);if(!document.querySelector('#panel').open)document.querySelector('#panel').showModal();
  },visited);
  assert.equal(await page.locator('canvas').count(),1);
  assert.equal(await page.locator('.atlas-regions,.atlas-region,details').count(),0);
  assert.doesNotMatch(await page.locator('#panel-body').innerText(),/Unexplored|Cinder/);
  assert.equal(await page.locator('#panel').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
  await page.screenshot({path:`artifacts/atlas-panorama-${name}.png`});
 }
 assert.deepEqual(errors,[]);console.log('One panoramic canvas; no cards or unknown labels; desktop/tablet contain overflow; no page errors.');
}finally{await browser.close();}
