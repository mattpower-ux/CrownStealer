import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:960,height:600},serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://ladder.test/**',async route=>{const pathname=new URL(route.request().url()).pathname;try{await route.fulfill({body:await readFile('public'+pathname),contentType:pathname.endsWith('.js')?'text/javascript':'image/webp'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://ladder.test/game/ladder-render.js');
 await page.setContent('<style>body{margin:0}canvas{width:960px;height:600px}</style><canvas></canvas>');
 await mkdir('artifacts',{recursive:true});
 for(const direction of ['up','down']){
  const details=await page.evaluate(async direction=>{
   const {render}=await import('/game/render.js');const {createGame,dungeonMap}=await import('/game/engine.js');const {dungeonLadders}=await import('/game/dungeon-ladders.js');
   const s=createGame('Isolated ladder preview');s.mode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:0};
   const m=dungeonMap(s.dungeon),l=dungeonLadders(s.dungeon,m).find(l=>l.direction===direction);
   const nx=l.wallX-l.x,ny=l.wallY-l.y;
   s.dungeon.x=l.x;s.dungeon.y=l.y;
   if(m[l.y-ny]?.[l.x-nx]!==1){s.dungeon.x-=nx;s.dungeon.y-=ny;}
   s.dungeon.dir=[[0,-1],[1,0],[0,1],[-1,0]].findIndex(([x,y])=>x===nx&&y===ny);
   render(document.querySelector('canvas'),s);return {ladder:l,camera:s.dungeon};
  },direction);
  await page.waitForTimeout(200);
  await page.screenshot({path:`artifacts/ladder-${direction}-depth.png`});console.log(direction,details);
 }
 console.log('Browser errors:',errors);if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
