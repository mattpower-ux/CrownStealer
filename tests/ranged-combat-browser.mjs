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



 await page.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const s=createGame('Ranged review');s.mode='battle';s.returnMode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:1};s.hp=s.maxHp=500;s.bag.push('common-bow-1','bucket-of-beans');s.equipped='common-bow-1';s.enemy={name:'Grove Goblin',speciesId:'grove-goblin',level:2,hp:1000,maxHp:1000,attack:10,armor:0,gold:1,xp:0,combatDistance:4,surpriseShotsRemaining:2,dexterity:10};localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));async function ready(){await page.waitForFunction(()=>!document.querySelector('#actions').hasAttribute('aria-busy'));}
 await boot();await page.setViewportSize({width:800,height:600});assert.match(await page.locator('#combat-heading').innerText(),/4 squares away/);assert.match(await page.locator('#combat-status').innerText(),/2 free bow or wand/);await page.screenshot({path:'artifacts/ranged-distance-4.png'});assert.ok(await page.locator('#actions button,#combat-switch-weapon').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;})));
 await page.getByRole('button',{name:'Shoot bow',exact:true}).click();await ready();let s=await saved();assert.equal(s.enemy.surpriseShotsRemaining,1);assert.equal(s.enemy.combatDistance,4);assert.equal(s.hp,500);
 await page.getByRole('button',{name:'Shoot bow',exact:true}).click();await ready();s=await saved();assert.equal(s.enemy.surpriseShotsRemaining,0);assert.equal(s.enemy.combatDistance,4);
 await page.locator('#combat-switch-weapon').selectOption('road-sword');await page.getByRole('button',{name:'Switch weapon · 1 round',exact:true}).click();await ready();s=await saved();assert.equal(s.equipped,'road-sword');assert.equal(s.enemy.combatDistance,3);assert.match(await page.locator('#combat-heading').innerText(),/3 squares away/);
 await page.getByRole('button',{name:'Advance 1 square · 1 round',exact:true}).click();await ready();assert.equal((await saved()).enemy.combatDistance,2);await page.getByRole('button',{name:'Advance 1 square · 1 round',exact:true}).click();await ready();assert.equal((await saved()).enemy.combatDistance,1);await page.screenshot({path:'artifacts/ranged-distance-1.png'});
 const before=await saved();await page.getByRole('button',{name:'Eat Bucket of Beans',exact:true}).click();await page.locator('#panel[data-panel="beans"]').waitFor({state:'visible'});const exact=await page.evaluate(async()=>{const {BEANS_MESSAGE}=await import('/game/bucket-beans.js');return BEANS_MESSAGE;});assert.ok((await page.locator('#panel-body').innerText()).includes(exact));assert.equal((await saved()).flags.beansRounds,3);await page.screenshot({path:'artifacts/beans-message.png'});await page.getByRole('button',{name:'Catch your breath',exact:true}).click();await page.waitForTimeout(900);await page.screenshot({path:'artifacts/beans-fleeing.png'});const active=await saved();assert.equal(active.enemy.hp,before.enemy.hp);assert.equal(active.xp,before.xp);
 for(let i=0;i<3;i++){await page.getByRole('button',{name:'Guard',exact:true}).click();await ready();}assert.equal((await saved()).flags.beansRounds,0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('Ranged browser passed: distance4→1, two free bow shots, switch costs enemy approach, advance, exact beans popup,3round effect/noXP,800×600 no horizontal overflow.');
}finally{await browser.close();}
