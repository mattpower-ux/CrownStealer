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



 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const {TOWNS}=await import('/game/content.js');const s=createGame('Royal ladder review'),town=TOWNS.find(t=>t.id==='bellwether');Object.assign(s,{mode:'town',returnMode:'town',location:town.id,region:town.region,x:town.x,y:town.y,townPosition:{x:4,y:3}});localStorage.setItem('crownstealer-save-v1',saveGame(s));});

 async function saved(key='crownstealer-save-v1'){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);}
 async function walkDungeon(tx,ty,key='crownstealer-save-v1'){
  const path=await page.evaluate(async({tx,ty,key})=>{const {dungeonMap}=await import('/game/engine.js');const s=JSON.parse(localStorage.getItem(key)),d=s.dungeon,m=dungeonMap(d),q=[{x:d.x,y:d.y,path:[]}],seen=new Set();for(const p of q){const key=p.x+','+p.y;if(seen.has(key))continue;seen.add(key);if(p.x===tx&&p.y===ty)return p.path;for(const [dir,[dx,dy]]of [[0,[0,-1]],[1,[1,0]],[2,[0,1]],[3,[-1,0]]])if(m[p.y+dy]?.[p.x+dx]!==undefined&&m[p.y+dy][p.x+dx]!==1)q.push({x:p.x+dx,y:p.y+dy,path:[...p.path,dir]});}throw Error('No route');},{tx,ty,key});
  for(const dir of path){let s=await saved(key);while(s.dungeon.dir!==dir){await page.keyboard.press('e');s=await saved(key);}await page.keyboard.press('ArrowUp');}
 }
 await boot();await page.getByRole('button',{name:/Enter.*[Cc]astle/}).click();await page.keyboard.press('ArrowUp');await page.keyboard.press('ArrowRight');await page.getByRole('button',{name:'Descend to Royal Dungeon',exact:true}).click();assert.equal((await saved()).dungeon.site,'royal-dungeon');
 await walkDungeon(7,3);await page.keyboard.press('Enter');assert.match(await page.locator('#panel-body').innerText(),/Heckler/);await page.screenshot({path:'artifacts/royal-heckler-review.png'});await page.locator('#close-panel').click();await walkDungeon(7,8);assert.match(await page.locator('#actions').innerText(),/Torturer/);await page.keyboard.press('Enter');assert.match(await page.locator('#panel-body').innerText(),/Torturer/);await page.screenshot({path:'artifacts/royal-torturer-review.png'});await page.locator('#close-panel').click();await walkDungeon(7,6);while((await saved()).dungeon.dir!==3)await page.keyboard.press('e');await page.screenshot({path:'artifacts/royal-cells-review.png'});
 await page.goto('http://review.test/game/engine.js');const normalSave=await page.evaluate(()=>localStorage.getItem('crownstealer-save-v1'));
 await page.evaluate(async()=>{const {previewCharacter}=await import('/game/developer-preview.js');const {saveGame}=await import('/game/engine.js');localStorage.setItem('crownstealer-developer-save-v1',saveGame(previewCharacter()));});
 await page.goto('http://review.test/?developer=1');await page.keyboard.press(' ');await page.locator('#studio-splash').waitFor({state:'detached'});await page.locator('#panel[data-panel="developer"]').waitFor({state:'visible'});await page.locator('#preview-destination').selectOption('royal-dungeon');await page.getByRole('button',{name:'Jump to location',exact:true}).click();await page.getByRole('button',{name:'Descend to Royal Dungeon',exact:true}).click();assert.equal((await saved('crownstealer-developer-save-v1')).dungeon.site,'royal-dungeon');await page.screenshot({path:'artifacts/royal-preview-entry.png'});
 await page.getByRole('button',{name:'Developer preview',exact:true}).click();await page.locator('#preview-destination').selectOption('cell');await page.getByRole('button',{name:'Jump to location',exact:true}).click();await walkDungeon(3,3,'crownstealer-developer-save-v1');await page.getByRole('button',{name:'Search cell for hidden exit',exact:true}).click();assert.equal((await saved('crownstealer-developer-save-v1')).flags.royalTrapFound,true);await page.getByRole('button',{name:'Go Down',exact:true}).click();assert.equal((await saved('crownstealer-developer-save-v1')).dungeon.royal,'sewer');assert.equal(await page.evaluate(()=>localStorage.getItem('crownstealer-save-v1')),normalSave);
 assert.deepEqual(errors,[]);console.log('Royal ladder browser passed: palace doorway→walked ladder→3D Royal Dungeon, Heckler/Torturer interactions, cell view, explicit developer target, legacy search→sewer, normal save unchanged by preview.');
}finally{await browser.close();}
