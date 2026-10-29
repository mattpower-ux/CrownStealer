import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame} from '../public/game/engine.js';
import {areaSites} from '../public/game/exploration.js';
import {itemById,itemArt} from '../public/game/items.js';
test('each monument adds one disk piece, duplicate visits do not, completion still boards ship',()=>{
 let s=createGame();
 for(let i=0;i<10;i++){
  s.region=Math.floor(i/3);s.mode='world';s.dungeon=null;s.exploration??={artifacts:[]};s.exploration.area='wild-'+i;s.exploration.home={region:s.region,x:16,y:1};s.x=16;s.y=4;
  s=act(s,{type:'enter'});assert.equal(s.flags.artifactReveal,true);assert.equal(itemById('alien-disk',s).pieces,i+1);
  s=loadGame(saveGame(s));assert.equal(itemById('alien-disk',s).pieces,i+1);
  s=act(s,{type:'acknowledgeArtifact'});assert.equal(s.flags.artifactReveal,undefined);
  if(i<9){s=act(s,{type:'enter'});assert.equal(s.exploration.artifacts.length,i+1);assert.equal(s.flags.artifactReveal,undefined);}
 }
 assert.equal(s.dungeon.ship,true);
});
test('there are exactly ten artifact monuments and eleven distinct inventory illustrations',()=>{
 let monuments=0;for(let i=0;i<12;i++)monuments+=areaSites({exploration:{area:'wild-'+i}}).filter(p=>p.kind==='artifact').length;assert.equal(monuments,10);
 const images=new Set();for(let i=0;i<=10;i++){const s={exploration:{artifacts:Array.from({length:i},(_,n)=>'wild-'+n)}};const item=itemById('alien-disk',s);assert.equal(item.pieces,i);assert.equal(item.notForSale,true);images.add(itemArt(item));}assert.equal(images.size,11);
});
