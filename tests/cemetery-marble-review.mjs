import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({serviceWorkers:'block',viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://review.test/**',async route=>{const path=new URL(route.request().url()).pathname;if(path==='/')return route.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:#06100d}canvas{width:1280px;height:800px}</style><canvas></canvas>'});try{await route.fulfill({body:await readFile('public'+path),contentType:path.endsWith('.js')?'text/javascript':'image/webp'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://review.test/');
 await page.evaluate(async()=>{
  const {createGame,dungeonMap}=await import('/game/engine.js');
  const {render}=await import('/game/render.js');
  const {dungeonChests}=await import('/game/treasure.js');
  const s=createGame('Marble review');s.mode='dungeon';s.returnMode='dungeon';s.level=14;
  s.dungeon={index:0,floor:0,x:1,y:1,dir:1,ladderLayout:1};const map=dungeonMap(s.dungeon),chests=dungeonChests(s,map),dirs=[[0,-1],[1,0],[0,1],[-1,0]];
  s.openedChests=chests.map(chest=>chest.id);let view=null;
  for(const chest of chests)for(let dir=0;dir<4;dir++){const [dx,dy]=dirs[dir],x=chest.x-dx*2,y=chest.y-dy*2;if(map[y]?.[x]===0&&map[y+dy]?.[x+dx]===0){view={x,y,dir};break;}if(view)break;}
  if(view)Object.assign(s.dungeon,view);render(document.querySelector('canvas'),s,1200,null,true);
 });
 await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/cemetery-marble-review.png'});
 assert.deepEqual(errors,[]);
 console.log('artifacts/cemetery-marble-review.png');
}finally{await browser.close();}
