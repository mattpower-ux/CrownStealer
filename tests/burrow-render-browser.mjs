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
 for(const view of ['burrow','entrance','normal']){
  const details=await page.evaluate(async view=>{
   const {render}=await import('/game/render.js');const {createGame,dungeonMap}=await import('/game/engine.js');
   const s=createGame('Isolated burrow preview');s.mode='dungeon';s.dungeon={site:'minor-site',minorId:'minor-r0-0',index:0,floor:0,x:1,y:1,dir:2,ladderLayout:1};
   if(view==='normal'){s.dungeon={index:0,floor:0,x:1,y:2,dir:0};}
   else if(view==='burrow'){
    const m=dungeonMap(s.dungeon),choices=[];
    for(let y=1;y<14;y++)for(let x=1;x<14;x++)if(m[y][x]!==1)for(const [dir,[dx,dy]] of [[0,[0,-1]],[1,[1,0]],[2,[0,1]],[3,[-1,0]]]){
     let steps=1;while(m[y+dy*steps]?.[x+dx*steps]!==undefined&&m[y+dy*steps][x+dx*steps]!==1)steps++;
     if(steps>=2&&steps<=4&&((x+dx*steps)*3+(y+dy*steps)*5)%4===0)choices.push({x,y,dir,steps});
    }
    choices.sort((a,b)=>Math.abs(a.steps-3)-Math.abs(b.steps-3));if(choices.length)Object.assign(s.dungeon,choices[0]);
   }
   const t=performance.now();render(document.querySelector('canvas'),s);const renderMs=performance.now()-t;const t2=performance.now();render(document.querySelector('canvas'),s);return {d:s.dungeon,theme:document.querySelector('canvas').dataset.wallTheme,renderMs,cachedMs:performance.now()-t2};
  },view);
  await page.screenshot({path:`artifacts/${view}-theme.png`});console.log(view,details);
 }
 console.log('Browser errors:',errors);if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
