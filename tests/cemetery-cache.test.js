import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');

test('cemetery artwork travels through a versioned browser module graph',async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({serviceWorkers:'block'}),requests=[];
  page.on('request',request=>requests.push(request.url()));
  await page.route('http://cache.test/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   try{await route.fulfill({body:await readFile('public'+(path==='/'?'/index.html':path)),contentType:path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html'});}
   catch{await route.fulfill({status:404,body:''});}
  });
  await page.goto('http://cache.test/');
  await page.waitForTimeout(250);
  assert.ok(requests.some(url=>/\/game\/app\.js\?v=/.test(url)),'the entry module must be versioned');
  assert.ok(requests.some(url=>/\/game\/render\.js\?v=/.test(url)),'the renderer must be versioned');
  assert.ok(requests.some(url=>/\/game\/cemetery-render\.js\?v=/.test(url)),'the cemetery renderer must be versioned');
  assert.ok(requests.some(url=>/\/assets\/cemetery-skeleton\.png\?v=/.test(url)),'the skeleton artwork must be versioned');
 }finally{await browser.close();}
});
