import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});

try{
 const page=await browser.newPage({serviceWorkers:'block',viewport:{width:1100,height:850}});
 page.setDefaultTimeout(5000);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://review.test/**',async route=>{
  const path=new URL(route.request().url()).pathname==='/'?'/index.html':new URL(route.request().url()).pathname;
  try{
   const body=await readFile('public'+path);
   const contentType=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':path.endsWith('.webp')?'image/webp':'application/octet-stream';
   await route.fulfill({body,contentType});
  }catch{await route.fulfill({status:404,body:''});}
 });
 await page.goto('http://review.test/');
 await page.evaluate(async()=>{
  const {createGame,saveGame,dungeonMap}=await import('/game/engine.js');
  const {dungeonChests}=await import('/game/treasure.js');
  let state,chest,approach;
  for(let seed=0;seed<200&&!approach;seed++){
   state=createGame('Chest click tester');state.treasureSeed=seed;state.mode='dungeon';state.dungeon={index:0,floor:0,x:1,y:1,dir:2};
   const map=dungeonMap(state.dungeon);chest=dungeonChests(state,map).find(candidate=>!candidate.locked);
   if(!chest)continue;
   approach=[[0,-1,2],[1,0,3],[0,1,0],[-1,0,1]].map(([dx,dy,dir])=>({x:chest.x+dx,y:chest.y+dy,dir})).find(point=>map[point.y]?.[point.x]===0);
  }
  if(!approach)throw Error('No adjacent unlocked chest fixture');
  Object.assign(state.dungeon,approach);localStorage.setItem('crownstealer-save-v1',saveGame(state));
 });
 await page.reload();await page.locator('#continue-game').click();
 await page.waitForTimeout(500);
 await page.waitForFunction(()=>document.querySelector('#scene').chestTargets?.length>0);
 assert.equal(await page.getByRole('button',{name:'Open chest',exact:true}).count(),0);
 const target=await page.evaluate(()=>document.querySelector('#scene').chestTargets[0]);
 await page.locator('#scene').click({position:{x:target.x,y:target.y}});
 await page.locator('#keep-loot').waitFor();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));
 assert.ok(saved.openedChests.length>0);
 assert.deepEqual(errors,[]);
 console.log('Adjacent rendered chest opens by click with no Open chest button.');
}finally{await browser.close();}
