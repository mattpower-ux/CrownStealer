import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://review.test/**',async route=>{let path=new URL(route.request().url()).pathname;if(path==='/')path='/index.html';try{const type=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.html')?'text/html':path.endsWith('.mp3')?'audio/mpeg':path.endsWith('.json')?'application/json':'image/webp';await route.fulfill({body:await readFile('public'+path),contentType:type});}catch{await route.fulfill({status:404,body:''});}});
 await page.addInitScript(()=>{window.audioAttempts=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.audioAttempts.push(this.src);return play.call(this);};});
 await page.goto('http://review.test/game/engine.js');
 await mkdir('artifacts',{recursive:true});
 async function loadFixture(kind){
  await page.goto('http://review.test/game/engine.js');
  await page.evaluate(async kind=>{
   const {createGame,saveGame,act}=await import('/game/engine.js');const {percivalCastleSite}=await import('/game/percival-castle.js');
   let s=createGame('Percival review');s.region=1;const site=percivalCastleSite(s);s.x=site.x;s.y=site.y;
   if(kind==='poison'){s.flags.percivalOath='accepted';s.bag.push('weapon-poison-1');}
   else if(kind==='casino'){const {townPlaces}=await import('/game/town.js');const {TOWNS}=await import('/game/content.js');const town=TOWNS.find(t=>t.id==='mothbridge');Object.assign(s,{region:0,mode:'town',location:town.id,x:town.x,y:town.y});const casino=townPlaces(s).find(p=>p.id==='casino');s.townPosition={x:casino.x,y:casino.y};s.flags.percivalOath='accepted';}
   else if(kind!=='landmark'){
    s=act(s,{type:'enter'},[],{noRandom:true});Object.assign(s.dungeon,{floor:2,x:13,y:13,dir:0});s.flags.percivalFloorCleared2=true;
    if(kind==='liche'){s=act(s,{type:'descend'},[],{noRandom:true});s.enemy.hp=1;s.rng=0;}
    else s.flags.percivalLicheDefeated=true;
   }
   localStorage.setItem('crownstealer-save-v1',saveGame(s));
  },kind);
  await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();console.log('fixture',kind,await page.locator('#toast').innerText(),errors);await page.locator('#game').waitFor({state:'visible'});
 }
 await loadFixture('landmark');await page.waitForTimeout(250);await page.screenshot({path:'artifacts/percival-castle-landmark.png'});
 await page.getByRole('button',{name:'Enter Percival’s Lament',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.wallTheme?.includes('haunted'));assert.match(await page.locator('#scene').getAttribute('data-wall-theme'),/haunted/);await page.screenshot({path:'artifacts/percival-crypt.png'});
 await loadFixture('liche');await page.getByRole('button',{name:'Face the boss',exact:true}).click();await page.getByRole('button',{name:'Strike',exact:true}).click();await page.waitForTimeout(1800);console.log('after Liche strike',await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('crownstealer-save-v1'));return {mode:s.mode,hp:s.enemy?.hp,flags:s.flags,log:s.log.slice(-3)};}),errors);await page.getByRole('button',{name:'ACCEPT THE OATH',exact:true}).waitFor();
 await page.screenshot({path:'artifacts/percival-oath-offer.png'});
 await page.getByRole('button',{name:'ACCEPT THE OATH',exact:true}).click();await page.getByRole('heading',{name:'You are a Paladin.',exact:true}).waitFor();
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(saved.flags.percivalOath,'accepted');assert.equal(saved.bag.includes('holy-sword'),false);
 await page.getByRole('button',{name:'Open pack',exact:true}).click();await page.getByText('Paladin · Oath of Sir Percival',{exact:true}).waitFor();
 await page.goto('http://review.test/game/engine.js');await page.evaluate(async()=>{const {act,saveGame}=await import('/game/engine.js');let s=JSON.parse(localStorage.getItem('crownstealer-save-v1'));s.flags.percivalFloorCleared2=false;s=act(s,{type:'descend'},[],{noRandom:true});s.enemy.hp=500;s.enemy.maxHp=500;localStorage.setItem('crownstealer-save-v1',saveGame(s));});
 await page.goto('http://review.test/');await page.locator('#studio-splash').click();await page.locator('#continue-game').click();await page.getByRole('button',{name:'TURN DEAD',exact:true}).waitFor();await page.getByRole('button',{name:'TURN DEAD',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).log.some(line=>line.includes('TURN DEAD burns')));console.log('Accept: Liche defeat opens ghost offer, no free Holy Sword granted, Paladin visible in pack, TURN DEAD works.');
 await loadFixture('casino');console.log('casino actions',await page.locator('#actions').innerText());await page.keyboard.press('e');await page.getByText('Gambling is evil. I should arrest all these people.',{exact:true}).waitFor();await page.locator('[data-bet="blackjack"]').click();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(saved.gold,65);assert.equal(saved.flags.percivalOath,'accepted');await page.screenshot({path:'artifacts/paladin-casino-thought.png'});
 await page.setViewportSize({width:800,height:600});await loadFixture('poison');await page.getByRole('button',{name:'Open inventory',exact:true}).click();await page.locator('[data-bag-item="weapon-poison-1"]').click();await page.getByRole('button',{name:'Apply to weapon',exact:true}).click();
 await page.locator('#panel[data-panel="paladinForsaken"]').waitFor({state:'visible'});assert.match(await page.locator('#panel-body').innerText(),/FORSAKEN! BREAK YOU YOUR SACRED PALADIN VOWS! BEGONE WITH YOUR POWERS\. GOOD LUCK, SCHMUCK!/);await page.screenshot({path:'artifacts/paladin-forsaken.png'});
 await page.getByRole('button',{name:'Continue',exact:true}).click();saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(saved.flags.percivalOath,'fallen');assert.equal(saved.flags.paladinForsakenPending,undefined);assert.equal(await page.locator('#panel').evaluate(el=>el.open),false);console.log('Oath: casino thought shown; successful poisoning triggers Lord Law and acknowledgment clears pending judgment.');
 await loadFixture('audience');await page.getByRole('button',{name:'REJECT THE OATH',exact:true}).click();const farewell="I'm sorry, I should have taken you for just barely above average when I met you. Farewell, Schmuck.";
 assert.equal(await page.locator('#panel blockquote').innerText(),farewell);assert.match(await page.locator('#panel-body').innerText(),/Don't Be That Guy\./);await page.screenshot({path:'artifacts/percival-rejection.png'});
 saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));assert.equal(saved.flags.percivalOath,'rejected');assert.ok(saved.bag.includes('pearl-of-wisdom'));
 await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Speak to Sir Percival',exact:true}).count(),0);console.log('Reject: exact farewell and Pearl shown, ghost audience permanently absent.');
 console.log('page errors',errors);assert.deepEqual(errors,[]);
}finally{await browser.close();}
