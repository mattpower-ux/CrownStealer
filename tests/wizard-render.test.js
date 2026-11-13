import test from 'node:test';
import assert from 'node:assert/strict';
import {wizardWallPixel,drawWizardChest,drawWizardCandleGlow} from '../public/game/wizard-render.js';
const rgb=p=>[p&255,p>>>8&255,p>>>16&255];
test('tower alabaster stays pale and blue magical flame and stained glass remain luminous',()=>{
 const stone=rgb(wizardWallPixel(2,.32,.64,1));assert.ok(stone.every(n=>n>190));
 const flame=rgb(wizardWallPixel(1,.5,.31,.1));assert.ok(flame[2]>240&&flame[1]>200);
 const glass=rgb(wizardWallPixel(0,.41,.61,.1));assert.ok(Math.max(...glass)>150);
 assert.notDeepEqual(rgb(wizardWallPixel(0,.41,.61,.1)),rgb(wizardWallPixel(2,.41,.61,.1)));
});
test('tower gem chest supports opened and closed states and candle glow animates safely',()=>{
 const fills=[];const grad={addColorStop(){}};const c=new Proxy({createLinearGradient:()=>grad,createRadialGradient:()=>grad,fill(){fills.push(this.fillStyle);}}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
 drawWizardChest(c,120,false);assert.ok(fills.includes('#65cdf6'));assert.ok(fills.includes('#ac74c8'));
 drawWizardChest(c,120,true);assert.ok(fills.includes('#020c19'));
 assert.doesNotThrow(()=>drawWizardCandleGlow(c,1280,720,[{x:.2,y:.4,size:.03,phase:1}],1500));
});
