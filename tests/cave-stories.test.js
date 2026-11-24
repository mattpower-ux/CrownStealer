import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {act,createGame,loadGame,minorSiteList,saveGame} from '../public/game/engine.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {caveStoryAt,caveStoryView} from '../public/game/cave-stories.js';
import {alignmentShiftMessage} from '../public/game/alignment.js';

const assignments={
  'minor-w1-1':'werebear-dogs',
  'minor-r0-6':'kobold-hoard',
  'minor-r1-5':'rabbit-dinner',
  'minor-r1-11':'flowerhaven-children',
  'minor-w1-4':'beaver-household',
};

function inStory(id){
 const site=minorSiteDefinition(id),s=createGame('Story Tester','they','look-green-warden');
 s.region=site.region;if(site.area)s.exploration={area:site.area,artifacts:[],visitedAreas:[site.area]};
 const entrance=minorSiteList(s).find(point=>point.id===id);s.x=entrance.x;s.y=entrance.y;
 Object.assign(s,{mode:'dungeon',returnMode:'dungeon',dungeon:{site:'minor-site',minorId:id,index:site.index,floor:0,x:13,y:12,dir:2,ladderLayout:1}});
 return s;
}

test('five fixed caves expose distinct story identities without changing their save ids',()=>{
 for(const [id,storyId] of Object.entries(assignments)){
  const site=minorSiteDefinition(id);
  assert.equal(site.id,id);
  assert.equal(site.story,storyId);
  assert.equal(caveStoryAt(inStory(id))?.id,storyId);
 }
 assert.equal(caveStoryAt(inStory('minor-r0-0')),null);
});

test('helping the werebear feeds its dogs once and survives save loading',()=>{
 let s=inStory('minor-w1-1');s.meals=3;
 s=act(s,{type:'caveStoryChoice',choice:'help'});
 assert.equal(s.meals,2);assert.equal(s.flags.caveStories['werebear-dogs'],'helped');
 assert.ok(s.bag.includes('small-emerald'));
 const restored=loadGame(saveGame(s));
 assert.equal(restored.flags.caveStories['werebear-dogs'],'helped');
 assert.equal(act(restored,{type:'caveStoryChoice',choice:'help'}).bag.filter(id=>id==='small-emerald').length,1);
});

test('the kobold bargain trades ten gold for food once while robbery starts combat',()=>{
 let buyer=inStory('minor-r0-6');buyer.gold=20;buyer.meals=1;
 buyer=act(buyer,{type:'caveStoryChoice',choice:'help'});
 assert.equal(buyer.gold,10);assert.equal(buyer.meals,7);assert.equal(buyer.flags.caveStories['kobold-hoard'],'bargained');
 assert.ok(buyer.bag.includes('common-lesser-healing'));
 let robber=act(inStory('minor-r0-6'),{type:'caveStoryChoice',choice:'attack'});
 assert.equal(robber.mode,'battle');assert.equal(robber.enemy.caveStory,'kobold-hoard');
});

test('saving the dinner rabbit, Flowerhaven children, and beaver home grants each reward once',()=>{
 const cases=[
  ['minor-r1-5','rabbit-dinner','small-pearl'],
  ['minor-r1-11','flowerhaven-children','scroll-return'],
  ['minor-w1-4','beaver-household','small-sapphire'],
 ];
 for(const [id,story,reward] of cases){
  let s=inStory(id);s.meals=3;
  const before=s.bag.filter(item=>item===reward).length;
  s=act(s,{type:'caveStoryChoice',choice:'help'});
  assert.equal(s.flags.caveStories[story],'helped');assert.equal(s.bag.filter(item=>item===reward).length,before+1);
  const again=act(loadGame(saveGame(s)),{type:'caveStoryChoice',choice:'help'});
  assert.equal(again.bag.filter(item=>item===reward).length,before+1);
 }
});

test('saving the Beaver Household from flooding shifts alignment one hundred points toward good once',()=>{
 let s=inStory('minor-w1-4');s.meals=3;s.alignment=-12;s.alignmentPoints=440;
 s=act(s,{type:'caveStoryChoice',choice:'help'});
 assert.equal(s.alignmentPoints,540);
 assert.equal(s.alignment,8);
 const restored=act(loadGame(saveGame(s)),{type:'caveStoryChoice',choice:'help'});
 assert.equal(restored.alignmentPoints,540);
});

test('alignment shifts have a clear good or evil notification',()=>{
 assert.equal(alignmentShiftMessage({alignment:-12},{alignment:3}),'Your alignment shifted toward the good!');
 assert.equal(alignmentShiftMessage({alignment:3},{alignment:-12}),'Your alignment shifted toward the evil!');
 assert.equal(alignmentShiftMessage({alignment:3},{alignment:3}),null);
});

test('defeating each hostile story enemy finalizes the outcome and grants one reward',()=>{
 for(const [id,story] of Object.entries(assignments)){
  let s=inStory(id);s=act(s,{type:'caveStoryChoice',choice:'attack'});const reward=caveStoryAt({...inStory(id),mode:'dungeon'},{includeResolved:true}).reward;
  const before=reward?s.bag.filter(item=>item===reward).length:0;s.enemy.hp=1;s.enemy.attack=0;s.enemy.armor=0;s.hp=s.maxHp=999;
  for(let attempts=0;s.mode==='battle'&&attempts<30;attempts++)s=act(s,{type:'attack'});
  assert.equal(s.mode,'dungeon');assert.equal(s.flags.caveStories[story],'defeated');
  if(reward)assert.equal(s.bag.filter(item=>item===reward).length,before+1);
  assert.equal(loadGame(saveGame(s)).flags.caveStories[story],'defeated');
 }
});

test('resolved cave stories no longer block the far chamber or reopen their choice',()=>{
 let s=inStory('minor-r1-5');
 assert.equal(caveStoryAt(s)?.id,'rabbit-dinner');
 s=act(s,{type:'caveStoryChoice',choice:'leave'});
 assert.equal(s.flags.caveStories['rabbit-dinner'],'left');
 assert.equal(caveStoryAt(s),null);
});

test('each unresolved story renders its narrative, illustration, and three choices',()=>{
 for(const id of Object.keys(assignments)){
  const s=inStory(id),story=caveStoryAt(s),html=caveStoryView(story,s,(label,action)=>`<button data-choice="${action.choice}">${label}</button>`);
  assert.match(html,/cave-stories\.webp/);assert.match(html,/data-choice="help"/);assert.match(html,/data-choice="attack"/);assert.match(html,/data-choice="leave"/);
  assert.ok(html.length>300);
 }
});

test('cave story art preserves each portrait panel without stretching it',()=>{
 const css=fs.readFileSync(new URL('../public/style.css',import.meta.url),'utf8');
 assert.match(css,/\.cave-story-art\s*\{[^}]*width:min\(100%,calc\(52vh\*3\/5\)\)[^}]*aspect-ratio:3\/5[^}]*background-size:500% 100%[^}]*\}/s);
});

test('save loading rejects a cave-story enemy attached to the wrong cave',()=>{
 const s=act(inStory('minor-w1-1'),{type:'caveStoryChoice',choice:'attack'});s.enemy.caveStory='rabbit-dinner';
 assert.throws(()=>loadGame(saveGame(s)),/Invalid cave story battle/);
});
