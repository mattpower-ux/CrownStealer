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

 for(const view of ['west-cell','east-cell','tools','table','manacles','torturer','heckler','freed-cell','combat']){
  const detail=await page.evaluate(async view=>{const {render}=await import('/game/render.js');const {createGame,dungeonMap}=await import('/game/engine.js');const {ROYAL_DUNGEON_NPCS}=await import('/game/royal-dungeon.js');const s=createGame('Royal scenery review');s.mode=s.returnMode='dungeon';s.location='bellwether';s.dungeon={site:'royal-dungeon',index:0,floor:0,x:7,y:6,dir:3,cellsOpen:false};
   const views={'east-cell':[7,10,1],tools:[7,9,2],table:[7,3,2],manacles:[7,10,3],torturer:[7,6,2],heckler:[7,1,2]};if(views[view]){const [x,y,dir]=views[view];Object.assign(s.dungeon,{x,y,dir});}if(view==='freed-cell'){s.dungeon.cellsOpen=true;s.flags.royalDungeonFreed=true;}
   if(view==='combat'){s.mode='battle';const npc=ROYAL_DUNGEON_NPCS[0];s.enemy={...npc,speciesId:npc.id,royalDungeonNpc:npc.id,maxHp:npc.hp,firstContact:false};s.dungeon.x=7;s.dungeon.y=7;s.dungeon.dir=2;}
   await Promise.all(['royal-torturer-body','royal-heckler-body'].map(id=>new Promise(resolve=>{const i=new Image();i.onload=i.onerror=resolve;i.src='/assets/'+id+'.webp';})));const canvas=document.querySelector('canvas'),map=dungeonMap(s.dungeon),before=JSON.stringify(map);render(canvas,s,1500);if(JSON.stringify(map)!==before)throw Error('Visual renderer mutated collision map');return {view,theme:canvas.dataset.wallTheme};
  },view);await page.screenshot({path:'artifacts/royal-'+view+'.png'});console.log(detail);
 }
 console.log('Browser errors:',errors);if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
