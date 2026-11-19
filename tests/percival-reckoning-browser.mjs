import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.TEST_URL||'http://127.0.0.1:4173';

async function seed(page,kind){
 await page.goto(base);
 await page.evaluate(async kind=>{
  const {createGame,saveGame}=await import('/game/engine.js');
  const s=createGame('Dread Tester');
  s.level=40;s.xp=1234;s.gold=9000;
  if(kind==='choice'){s.flags.redGlobeSworn=true;s.evilRoute={version:1,phase:'percivalChoice'};}
  if(kind==='defeat'){
   s.evilRoute={version:1,phase:'exiled'};s.flags.percivalDefeatEpilogue=true;
   s.flags.leprosy=true;s.flags.leprosyKind='percival';s.flags.leprosySince=s.worldTimeMs;
  }
  if(kind==='victory'){
   s.flags.redGlobeSworn=true;
   s.evilRoute={version:1,phase:'darkVictory'};s.flags.percivalDarkVictory=true;
   s.mode='ending';s.returnMode='ending';s.ending='dark-victory';
  }
  localStorage.setItem('crownstealer-save-v1',saveGame(s));
 },kind);
 await page.reload();
 await page.waitForFunction(()=>typeof document.querySelector('#continue-game')?.onclick==='function');
 await page.locator('.studio-splash').click({timeout:1500}).catch(()=>{});
 await page.locator('.studio-splash').waitFor({state:'hidden',timeout:5000}).catch(()=>{});
 await page.locator('#continue-game').click();
 await page.waitForTimeout(300);
}

try{
 const errors=[];
 const fight=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
 fight.on('pageerror',error=>errors.push(error.message));
 await seed(fight,'choice');
 if(await fight.locator('#game').evaluate(el=>el.hidden))throw Error('Game did not start: '+JSON.stringify({errors,toast:await fight.locator('#toast').textContent(),saved:await fight.evaluate(()=>localStorage.getItem('crownstealer-save-v1')?.slice(0,80))}));
 await fight.locator('#panel[open]').waitFor();
 assert.equal((await fight.locator('#panel-title').textContent()).trim(),'The Lawgiver of Light');
 assert.match(await fight.locator('#panel-body').textContent(),/crashes through the vaulted ceiling/i);
 await fight.getByRole('button',{name:'Fight him?',exact:true}).click();
 await fight.locator('#panel').waitFor({state:'hidden'});
 const fighting=await fight.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));
 assert.equal(fighting.mode,'battle');assert.equal(fighting.enemy.percivalReckoning,true);
 assert.match(await fight.locator('body').textContent(),/Percival/i);

 const run=await browser.newPage({serviceWorkers:'block'});
 await seed(run,'choice');
 await run.getByRole('button',{name:'Run Away!',exact:true}).click();
 await run.locator('#panel').waitFor({state:'hidden'});
 assert.equal(await run.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).evilRoute.phase),'exiled');

 const defeat=await browser.newPage({serviceWorkers:'block'});
 await seed(defeat,'defeat');
 await defeat.locator('#panel[open]').waitFor();
 assert.equal((await defeat.locator('#panel-title').textContent()).trim(),'Rebuild the Dawn');
 assert.match(await defeat.locator('#panel-body').textContent(),/Constitution will gradually decline/);

 const victory=await browser.newPage({serviceWorkers:'block'});
 await seed(victory,'victory');
 await victory.locator('#panel[open]').waitFor();
 await victory.getByRole('heading',{name:'It is finished'}).waitFor();
 assert.equal(await victory.locator('.percival-final-screen').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(0, 0, 0)');
 for(const name of ['confrontation','defeat','victory']){
  const response=await victory.request.get(base+'/assets/percival-'+name+'.mp3');
  assert.equal(response.status(),200);assert.ok((await response.body()).byteLength>300000);
 }
 assert.deepEqual(errors,[]);
 console.log('Percival throne choice, fight, exile, defeat epilogue, recordings and dark finale pass in Chromium.');
}finally{
 await browser.close();
}
