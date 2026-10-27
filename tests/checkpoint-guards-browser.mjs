import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');const {chromium}=require('playwright');const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{const A=window.Audio;window.clips=[];window.Audio=function(src){const a=new A(src);window.clips.push(a);return a;};});
await page.goto('http://127.0.0.1:4173');
await page.evaluate(async()=>{const {createRoyalGame,act,saveGame}=await import('/game/engine.js');let s=act(createRoyalGame('Checkpoint hero'),{type:'royalIntroSkip'});s.x=24;s.y=7;localStorage.setItem('crownstealer-save-v1',saveGame(s));});
await page.reload();await page.locator('#continue-game').click();
await page.locator('nav [data-save-checkpoint]').click();
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-checkpoint-v1')));
await page.locator('#scene').focus();await page.keyboard.press('e');
await page.locator('#replay-guards').waitFor({state:'visible'});
await page.waitForFunction(()=>window.clips.at(-1)?.src.endsWith('/guard-0.mp3')&&window.clips.at(-1).currentTime>0);
await page.evaluate(()=>window.clips.at(-1).dispatchEvent(new Event('ended')));
await page.waitForFunction(()=>window.clips.at(-1)?.src.endsWith('/guard-1.mp3')&&window.clips.at(-1).currentTime>0);
await page.screenshot({path:'artifacts/guard-taunt.png'});
await page.locator('#leave-guards').click();
assert.ok(await page.evaluate(()=>window.clips.every(a=>a.paused)));
await page.locator('#scene').focus();await page.keyboard.press('ArrowLeft');
await page.reload();await page.locator('#load-checkpoint-title').click();
const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')));
for(const k of ['x','y','gold','hp','turns','rng','mode'])assert.deepEqual(restored[k],saved[k]);
assert.equal(restored.flags.guardTauntPending,undefined);
const battle=await browser.newPage();await battle.goto('http://127.0.0.1:4173');
await battle.evaluate(async()=>{const {createGame,saveGame}=await import('/game/engine.js');const s=createGame('Battle checkpoint');s.mode='battle';s.returnMode='world';s.enemy={name:'Tithe Rat',hp:12,maxHp:25,attack:1,gold:3,level:1,firstContact:false};localStorage.setItem('crownstealer-save-v1',saveGame(s));});
await battle.reload();await battle.locator('#continue-game').click();await battle.locator('nav [data-save-checkpoint]').click();await battle.reload();await battle.locator('#load-checkpoint-title').click();
assert.equal(await battle.evaluate(()=>JSON.parse(localStorage.getItem('crownstealer-save-v1')).enemy.hp),12);
assert.deepEqual(errors,[]);console.log('Checkpoint persists separately from autosave and restores exact position and battle; guard audio plays sequentially and stops on dismissal.');
}finally{await browser.close();}
