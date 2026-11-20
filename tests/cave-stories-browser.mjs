process.env.PORT='4176';await import('../server.mjs');
import {createRequire} from 'node:module';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});let exitCode=0;
const cases=[['minor-w1-1','The Werebear and His Dogs'],['minor-r0-6','Grub’s Private Larder'],['minor-r1-5','A Rabbit for Dinner'],['minor-r1-11','The Children of Flowerhaven'],['minor-w1-4','The Beaver Household']];
try{
 await mkdir('artifacts',{recursive:true});const errors=[];
 for(const [id,title] of cases){
  const builderContext=await browser.newContext({serviceWorkers:'block'}),builder=await builderContext.newPage();await builder.goto('http://127.0.0.1:4176');
  const save=await builder.evaluate(async id=>{const {createGame,saveGame,minorSiteList}=await import('/game/engine.js');const {minorSiteDefinition}=await import('/game/minor-sites.js');let s=createGame('Story Browser','they','look-green-warden'),def=minorSiteDefinition(id);s.region=def.region;if(def.area)s.exploration={area:def.area,artifacts:[],visitedAreas:[def.area]};const site=minorSiteList(s).find(x=>x.id===id);s.x=site.x;s.y=site.y;s.mode=s.returnMode='dungeon';s.dungeon={site:'minor-site',minorId:id,index:def.index,floor:0,x:13,y:12,dir:2,ladderLayout:1};return saveGame(s);},id);await builderContext.close();
  const context=await browser.newContext({viewport:{width:1280,height:800},hasTouch:true,serviceWorkers:'block'});await context.addInitScript(save=>localStorage.setItem('crownstealer-save-v1',save),save);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4176');
  await page.locator('.studio-splash').click({timeout:1000}).catch(()=>{});await page.locator('#continue-game').click();await page.getByRole('button',{name:title,exact:true}).click();assert.equal(await page.locator('#panel-title').textContent(),title);
  const art=page.locator('.cave-story-art');assert.ok((await art.evaluate(el=>getComputedStyle(el).backgroundImage)).includes('cave-stories.webp'));assert.ok((await art.boundingBox()).height>200);await page.waitForTimeout(500);
  if(id==='minor-w1-1')await page.screenshot({path:'artifacts/cave-story-werebear.png'});if(id==='minor-w1-4')await page.screenshot({path:'artifacts/cave-story-beavers.png'});await context.close();
 }
 assert.deepEqual(errors,[]);console.log('Browser checks passed: all five cave stories open with illustrated choices at tablet size.');
}catch(e){console.error(e);exitCode=1;}finally{await browser.close();}process.exit(exitCode);
