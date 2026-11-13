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
test('all shrine forms use distinct detailed statue assets, sized inside their visible bounds',async()=>{
 const old=globalThis.Image;globalThis.Image=class {complete=true;naturalWidth=768;naturalHeight=1024;};
 try{const {drawShrineStatue}=await import('../public/game/shrine-render.js?art-test');const sources=[];
 for(const form of ['kobold','giant','goddess','lizard','blob']){let draw;drawShrineStatue({drawImage:(...args)=>draw=args},400,400,200,{form});assert.ok(draw);sources.push(draw[0].src);assert.ok(draw[3]<=250);assert.ok(draw[4]<=290);assert.equal(draw[2]+draw[4],400);}
 assert.equal(new Set(sources).size,5);
 }finally{globalThis.Image=old;}
});
