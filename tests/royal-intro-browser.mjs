import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const NativeAudio=window.Audio;window.testVoices=[];window.Audio=function(src){const a=new NativeAudio(src);window.testVoices.push(a);return a;};});
 await page.goto('http://127.0.0.1:4173');
 await page.locator('#new-game').click();
 await page.locator('.royal-court-scene').waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('.royal-court-scene').naturalWidth>0);
 assert.equal(await page.locator('.royal-cast').isVisible(),false);
 await page.screenshot({path:'artifacts/royal-court-opening.png'});
 for(let line=0;line<6;line++){
  await page.waitForFunction(n=>window.testVoices.at(-1)?.src.endsWith(`/intro-${n}.mp3`)&&window.testVoices.at(-1).currentTime>0,line);
  assert.equal(await page.evaluate(()=>window.testVoices.filter(a=>!a.paused).length),1);
  if(line===2){await page.screenshot({path:'artifacts/royal-intro.png'});await page.reload();await page.locator('#continue-game').click();await page.waitForFunction(()=>window.testVoices.at(-1)?.src.endsWith('/intro-2.mp3')&&window.testVoices.at(-1).currentTime>0);}
  await page.locator('#panel').getByRole('button',{name:line===5?'Face the world':'Continue',exact:true}).click();
 }
 assert.equal(await page.locator('#panel').isVisible(),false);
 assert.equal(await page.locator('#gold').textContent(),'1');
 assert.equal(await page.evaluate(()=>window.testVoices.every(a=>a.paused)),true);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();await page.locator('#continue-game').click();
 await page.context().setOffline(true);
 const cached=await page.evaluate(async()=>Promise.all([0,1,2,3,4,5].map(async n=>{const r=await fetch(`/assets/intro-${n}.mp3`);return r.ok&&(await r.arrayBuffer()).byteLength>1000;})));
 assert.ok(cached.every(Boolean));assert.deepEqual(errors,[]);
 assert.ok(await page.evaluate(async()=>{const r=await fetch('/assets/royal-court.webp');return r.ok&&(await r.arrayBuffer()).byteLength>1000;}));
 console.log('Six voice clips play in order; advancing stops previous audio; saved intro resumes; all clips are cached offline.');
} finally {await browser.close();}
