import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://vault.test/**',async route=>{const path=new URL(route.request().url()).pathname;if(path==='/')return route.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:#07100d}canvas{display:block}</style><canvas width="1280" height="800"></canvas>'});try{await route.fulfill({body:await readFile('public'+path),contentType:'text/javascript'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://vault.test/');
 await page.evaluate(async()=>{
  const {drawCemeteryCrypt}=await import('/game/cemetery-render.js?v=20261123c');
  const c=document.querySelector('canvas').getContext('2d'),gradient=c.createLinearGradient(0,0,0,800);gradient.addColorStop(0,'#101922');gradient.addColorStop(1,'#09110e');c.fillStyle=gradient;c.fillRect(0,0,1280,800);
  c.fillStyle='#26302e';for(let y=70;y<690;y+=90)for(let x=-40+(y/90%2)*55;x<1320;x+=110){c.fillRect(x,y,106,84);c.strokeStyle='#111918';c.lineWidth=4;c.strokeRect(x,y,106,84);}
  for(const [i,variant] of ['crypt','vault','mausoleum'].entries()){
   c.save();c.translate(235+i*410,735);drawCemeteryCrypt(c,270,variant,4+i);c.restore();
  }
 });
 await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/cemetery-vault-review.png'});
 assert.deepEqual(errors,[]);console.log('artifacts/cemetery-vault-review.png');
}finally{await browser.close();}
