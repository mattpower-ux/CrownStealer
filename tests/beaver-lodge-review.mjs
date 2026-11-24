import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://lodge.test/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/')return route.fulfill({contentType:'text/html',body:'<style>html,body{margin:0;background:#080b08}canvas{width:1280px;height:800px}</style><canvas></canvas>'});
  try{await route.fulfill({body:await readFile('public'+path),contentType:path.endsWith('.js')?'text/javascript':'image/webp'});}catch{await route.fulfill({status:404,body:''});}
 });
 await page.goto('http://lodge.test/');
 const result=await page.evaluate(async()=>{
  const {createGame}=await import('/game/engine.js');
  const {render}=await import('/game/render.js');
  const state=createGame('Timbertooth review');state.mode='dungeon';
  state.dungeon={site:'minor-site',minorId:'minor-w1-4',index:0,floor:0,x:11,y:13,dir:1,ladderLayout:1};
  const canvas=document.querySelector('canvas');window.reviewState=state;render(canvas,state,750,null,true);
  return {theme:canvas.dataset.wallTheme,view:canvas.dataset.view};
 });
 assert.equal(result.theme,'Timbertooth Lodge · engineered beaver home');
 assert.equal(result.view,'dungeon-3d');
 await page.waitForFunction(async()=>{const lodge=await import('/game/beaver-lodge-render.js?v=20261123f');return lodge.beaverHouseholdArtworkReady();});
 await page.evaluate(async()=>{const {render}=await import('/game/render.js');render(document.querySelector('canvas'),window.reviewState,900,null,true);});
 await mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/beaver-lodge-review.png'});
 assert.deepEqual(errors,[]);
 console.log('Timbertooth Lodge renders as an engineered beaver home without page errors.');
}finally{await browser.close();}
