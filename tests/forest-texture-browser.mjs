import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});

try{
 const page=await browser.newPage({serviceWorkers:'block'});
 await page.route('http://forest.test/**',async route=>{
  const pathname=new URL(route.request().url()).pathname;
  if(pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><canvas></canvas>'});
  try{return route.fulfill({contentType:'text/javascript',body:await readFile(`public${pathname}`)});}catch{return route.fulfill({status:404,body:''});}
 });
 await page.goto('http://forest.test/');
 const texture=await page.evaluate(async()=>{
  const {rootTexture}=await import('/game/forest-render.js');
  const canvas=rootTexture(0),pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,colors=new Set();
  for(let i=0;i<pixels.length;i+=64)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);
  return {width:canvas.width,height:canvas.height,colors:colors.size};
 });
 assert.deepEqual([texture.width,texture.height],[256,256]);
 assert.ok(texture.colors>20,`expected antialiased shaded material, found ${texture.colors} sampled colors`);
 console.log(`Forest root material: ${texture.width}x${texture.height}, ${texture.colors} sampled colors.`);
}finally{await browser.close();}
