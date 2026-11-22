import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});

try{
 const page=await browser.newPage({serviceWorkers:'block',viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4173/');
 await page.evaluate(async()=>{
  const {act,createGame,minorSiteList,saveGame}=await import('/game/engine.js');
  let state=createGame('Estate reviewer');
  state.region=1;
  const site=minorSiteList(state).find(site=>site.id==='minor-r1-1');
  Object.assign(state,{x:site.x,y:site.y});
  state=act(state,{type:'enter'});
  Object.assign(state.dungeon,{x:6,y:6,dir:0});
  localStorage.setItem('crownstealer-save-v1',saveGame(state));
 });
 await page.reload();
 if(await page.locator('#continue-game').isVisible())await page.locator('#continue-game').click();
 await page.waitForFunction(()=>document.querySelector('#scene')?.dataset.view==='dungeon-3d');
 await page.screenshot({path:'artifacts/pelagos-abandoned-mansion.png'});
 const pixels=await page.locator('#scene').evaluate(canvas=>{
  const c=canvas.getContext('2d'),sample=c.getImageData(0,0,canvas.width,canvas.height).data;
  let pale=0,green=0,blue=0,orangeBrick=0;
  for(let i=0;i<sample.length;i+=64){const r=sample[i],g=sample[i+1],b=sample[i+2];if(r>120&&g>115&&b>100)pale++;if(g>r*1.12&&g>b*1.05)green++;if(b>r*1.15&&b>g*1.04)blue++;if(r>g*1.2&&g>b*1.3&&r>80)orangeBrick++;}
  return {pale,green,blue,orangeBrick};
 });
 assert.ok(pixels.pale>300,'pale stone architecture is visible');
 assert.ok(pixels.green>20,'vines are visible');
 assert.ok(pixels.blue>20,'stained glass is visible');
 assert.ok(pixels.orangeBrick<1200,'generic orange dungeon brick is absent');
 assert.deepEqual(errors,[]);
 console.log('Abandoned mansion architecture rendered:',pixels);
}finally{await browser.close();}
