import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../public/game/engine.js';
import {shrinePanelMarkup} from '../public/game/shrine-view.js';
import {drawShrineStatue} from '../public/game/shrine-render.js';
import {shrineForDungeon} from '../public/game/shrine-deities.js';
const button=(label,a,style,disabled)=>'<button data-choice="'+a.choice+'" '+(disabled?'disabled':'')+'>'+label+'</button>';
const esc=x=>String(x).replaceAll('<','&lt;');
test('charity offer makes donation and refusal explicit, disables unaffordable payment, and offers safe dismissal',()=>{
 const s=createGame();s.dungeon={site:'minor-site',minorId:'minor-r0-1',floor:0,x:7,y:9};s.mode='dungeon';s.gold=20;
 const html=shrinePanelMarkup(s,button,esc);assert.match(html,/data-choice="donate" disabled/);assert.match(html,/data-choice="refuse"/);assert.match(html,/Decide later/);assert.match(html,/150 damage/);assert.doesNotMatch(html,/royal-dialogue/);
 s.gold=500;assert.doesNotMatch(shrinePanelMarkup(s,button,esc),/data-choice="donate" disabled/);
});
test('all shrine forms draw a pedestal and distinct silhouettes',()=>{
 const outputs=[];for(const slot of [1,4,7,10,13]){const ops=[],gradient={addColorStop(){}};const c=new Proxy({createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(...args)=>ops.push([k,...args]),set:(o,k,v)=>(o[k]=v,true)});drawShrineStatue(c,400,400,200,shrineForDungeon({site:'minor-site',minorId:'minor-r0-'+slot}));assert.ok(ops.length>80);outputs.push(JSON.stringify(ops));}assert.equal(new Set(outputs).size,5);
});
