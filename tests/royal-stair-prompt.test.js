import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');

test('stepping on the castle stair asks before entering the Royal Dungeon',async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({serviceWorkers:'block'});
  await page.route('http://stair.test/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   try{
    const file='public'+(path==='/'?'/index.html':path);
    const contentType=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.webp')?'image/webp':'text/html';
    await route.fulfill({body:await readFile(file),contentType});
   }catch{await route.fulfill({status:404,body:''});}
  });
  await page.goto('http://stair.test/');
  await page.evaluate(async()=>{
   const {previewCharacter,previewJump}=await import('/game/developer-preview.js');
   const {saveGame}=await import('/game/engine.js');
   const state=previewJump(previewCharacter(),'royal-dungeon');
   state.castle.x=9;state.castle.y=13;
   localStorage.setItem('crownstealer-save-v1',saveGame(state));
  });
  await page.reload();
  await page.locator('#continue-game').click();
  await page.keyboard.press('ArrowRight');
  const prompt=page.locator('#entry-prompt');
  await prompt.waitFor({state:'visible'});
  const box=await prompt.boundingBox(),viewport=page.viewportSize();
  assert.ok(Math.abs(box.x+box.width/2-viewport.width/2)<2);
  assert.ok(Math.abs(box.y+box.height/2-viewport.height/2)<2);
  assert.equal(await page.locator('#entry-question').innerText(),'Stairs lead down to the Royal Dungeon. Sneak down?');
  assert.equal(await page.locator('#entry-yea').innerText(),'Yea');
  assert.equal(await page.locator('#entry-nay').innerText(),'Nay');
  await page.locator('#entry-nay').click();
  assert.equal(await prompt.isVisible(),false);
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('crownstealer-save-v1'))).mode,'town');
  await page.getByRole('button',{name:'Descend to Royal Dungeon'}).click();
  await prompt.waitFor({state:'visible'});
  await page.locator('#entry-yea').click();
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('crownstealer-save-v1'))).mode,'dungeon');
 }finally{await browser.close();}
});
