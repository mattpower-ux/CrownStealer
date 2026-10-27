import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const require=createRequire('C:/Users/mattp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');const {chromium}=require('playwright');const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1000,height:800}});
await page.goto('http://127.0.0.1:4173');
const result=await page.evaluate(async()=>{
 const {render}=await import('/game/render.js'),{createGame}=await import('/game/engine.js'),{buildEncounter}=await import('/game/encounters.js');
 await new Promise(r=>setTimeout(r,1500));const canvas=document.createElement('canvas');canvas.style.cssText='width:800px;height:600px';document.body.append(canvas);
 const s=createGame();s.mode='dungeon';s.dungeon={index:0,floor:0,x:1,y:1,dir:2};s.enemy=buildEncounter(s,.2);s.mode='battle';s.returnMode='dungeon';s.enemy.firstContact=false;
 const sample=fx=>{render(canvas,s,175,fx);return [...canvas.getContext('2d').getImageData(0,0,800,600).data];};
 const normal=sample(null),enemy=sample({start:0,target:'enemy',amount:4,kind:'hit'}),hero=sample({start:0,target:'hero',amount:4,kind:'hit'});
 const red=(data,x0,y0,x1,y1)=>{let total=0;for(let y=y0;y<y1;y+=4)for(let x=x0;x<x1;x+=4){let i=(y*800+x)*4;total+=data[i]-data[i+1];}return total;};
 const hitRed=red(enemy,250,150,550,450)>red(normal,250,150,550,450),edgeRed=red(hero,0,100,100,500)>red(normal,0,100,100,500);
 render(canvas,s,900,{start:0,kind:'victory'});const faded=canvas.toDataURL();s.mode='dungeon';render(canvas,s,900);const clear=canvas.toDataURL();
 const walls=[];for(let index=0;index<8;index++){s.dungeon.index=index;render(canvas,s,0);walls.push(canvas.toDataURL());}
 return {hitRed,edgeRed,fadeMatchesHall:faded===clear,wallCount:new Set(walls).size};
});assert.deepEqual(result,{hitRed:true,edgeRed:true,fadeMatchesHall:true,wallCount:8});await browser.close();console.log('Red monster impact, red screen edges, full victory fade and eight distinct procedural walls pass.');
