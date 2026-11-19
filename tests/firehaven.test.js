import test from 'node:test';
import assert from 'node:assert/strict';
import {areaSites,areaTile} from '../public/game/exploration.js';
import {act,createGame} from '../public/game/engine.js';
import {
 FIREHAVEN_AREA,
 FIREHAVEN_SITE,
 FIREHAVEN_STOCK,
 firehavenAction,
 firehavenFireResistance,
 firehavenLightMultiplier,
 firehavenView,
 wyrmbaneMultiplier,
} from '../public/game/firehaven.js';

const hero=()=>({
 mode:'world',region:1,x:FIREHAVEN_SITE.x,y:FIREHAVEN_SITE.y,gold:2000,
 exploration:{area:FIREHAVEN_AREA,artifacts:[]},flags:{},bag:[],pendingLoot:[],
});

test('Firehaven is a reachable island fortress with a dry causeway through its lake',()=>{
 const state=hero();
 const site=areaSites(state).find(point=>point.id===FIREHAVEN_SITE.id);
 assert.deepEqual(site,FIREHAVEN_SITE);
 assert.equal(areaTile(state,site.x,site.y),'grass');
 assert.equal(areaTile(state,site.x-5,site.y-3),'water');
 assert.equal(areaTile(state,site.x-5,site.y),'bridge');
 assert.notEqual(areaTile(state,site.x-9,site.y),'water');
});

test('Firehaven sells its three specialist supplies only at the fortress',()=>{
 const state=hero(),notes=[];
 assert.deepEqual(FIREHAVEN_STOCK.map(item=>item.id),[
  'wyrmbane-spear','potion-cinder-ward','scroll-everlight',
 ]);
 assert.equal(firehavenAction(state,{type:'buyFirehaven',id:'wyrmbane-spear'},notes.push.bind(notes)),true);
 assert.ok(state.bag.includes('wyrmbane-spear'));
 assert.equal(state.gold,1100);
 const away={...hero(),x:FIREHAVEN_SITE.x-10};
 assert.equal(firehavenAction(away,{type:'buyFirehaven',id:'scroll-everlight'},()=>{}),false);
 assert.deepEqual(away.bag,[]);
});

test('Firehaven supplies resist fire, double wyrm damage, and illuminate heat lairs',()=>{
 const state=hero();
 state.bag.push('potion-cinder-ward','scroll-everlight');
 assert.equal(firehavenAction(state,{type:'useItem',id:'potion-cinder-ward'},()=>{}),true);
 assert.equal(firehavenFireResistance(state),.5);
 assert.equal(wyrmbaneMultiplier({id:'wyrmbane-spear'},{speciesId:'slagtooth-wyrm',name:'Slagtooth Wyrm'}),2);
 assert.equal(wyrmbaneMultiplier({id:'wyrmbane-spear'},{speciesId:'goblin',name:'Goblin'}),1);
 assert.equal(firehavenAction(state,{type:'useItem',id:'scroll-everlight'},()=>{}),true);
 assert.equal(firehavenLightMultiplier(state,{meltedStone:true}),1.55);
 assert.equal(firehavenLightMultiplier(state,null),1);
});

test('the game engine purchases and consumes Firehaven supplies',()=>{
 let state={...createGame('Wyrm hunter'),mode:'world',region:1,x:FIREHAVEN_SITE.x,y:FIREHAVEN_SITE.y,gold:1000,exploration:{area:FIREHAVEN_AREA,artifacts:[]}};
 state=act(state,{type:'buyFirehaven',id:'potion-cinder-ward'});
 assert.equal(state.gold,820);
 assert.ok(state.bag.includes('potion-cinder-ward'));
 state=act(state,{type:'useItem',id:'potion-cinder-ward'});
 assert.equal(state.flags.heatWardMoves,20);
 assert.ok(!state.bag.includes('potion-cinder-ward'));
});

test('Firehaven protection and light count down as the hero acts',()=>{
 let state=createGame('Wyrm hunter');
 state.bag.push('potion-cinder-ward','scroll-everlight');
 state=act(state,{type:'useItem',id:'potion-cinder-ward'});
 state=act(state,{type:'useItem',id:'scroll-everlight'});
 assert.equal(state.flags.heatWardMoves,20);
 assert.equal(state.flags.everlightMoves,60);
 Object.assign(state,{mode:'battle',returnMode:'world'});
 state.enemy={speciesId:'goblin',name:'Goblin',level:1,hp:1000,maxHp:1000,attack:1,armor:0,gold:0,xp:0,firstContact:false};
 state=act(state,{type:'attack'});
 assert.equal(state.flags.heatWardMoves,19);
 assert.equal(state.flags.everlightMoves,59);
});

test('the equipped Wyrmbane Spear causes greater real combat damage to wyrms',()=>{
 const battle=speciesId=>{
  const state=createGame('Wyrm hunter');
  Object.assign(state,{mode:'battle',returnMode:'world',rng:17,equipped:'wyrmbane-spear',weapon:0,hp:999,maxHp:999});
  state.bag.push('wyrmbane-spear');
  state.enemy={speciesId,name:speciesId==='slagtooth-wyrm'?'Slagtooth Wyrm':'Goblin',level:1,hp:1000,maxHp:1000,attack:1,armor:0,gold:0,xp:0,firstContact:false};
  return 1000-act(state,{type:'attack'}).enemy.hp;
 };
 assert.ok(battle('slagtooth-wyrm')>battle('goblin')*1.8);
});

test('Firehaven presents the lake fortress, ballistas, and specialist wares',()=>{
 const html=firehavenView(hero(),item=>`<i>${item.name}</i>`,label=>`<button>${label}</button>`);
 assert.match(html,/palisade/i);
 assert.match(html,/ballista/i);
 for(const item of FIREHAVEN_STOCK)assert.match(html,new RegExp(item.name));
});
