import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,saveGame,loadGame,worldTile,pointAt,minorSiteList,shipyardList} from '../public/game/engine.js';
import {AREAS,areaSites,areaTile} from '../public/game/exploration.js';
import {wildernessDiscoverySites,wildernessDiscoveries} from '../public/game/wilderness-discoveries.js';

test('discoveries occupy deterministic reachable terrain without overlapping other sites',()=>{
 let heroes=0,ruins=0;
 const lands=[0,1,2,3,...AREAS.filter(a=>a.kind==='wild').map(a=>a.id)];
 for(const land of lands){
  const s=createGame();if(typeof land==='string'){s.exploration={area:land,artifacts:[]};s.region=AREAS.find(a=>a.id===land).region;}else s.region=land;
  const sites=wildernessDiscoverySites(s);assert.ok(sites.length>=3,String(land));
  assert.deepEqual(sites,wildernessDiscoverySites(loadGame(saveGame(s))));
  heroes+=sites.filter(p=>p.type==='hero-remains').length;
  ruins+=sites.filter(p=>p.type==='burned-village').length;
  const tile=(x,y)=>typeof land==='string'?areaTile(s,x,y):worldTile(s.region,x,y);
  const start=typeof land==='string'?areaSites(s).find(p=>p.kind==='returnGate'):{x:64,y:48};
  const queue=[start],seen=new Set();
  for(let i=0;i<queue.length;i++){const {x,y}=queue[i],key=x+','+y;if(x<1||y<1||x>126||y>94||seen.has(key)||['water','mountain'].includes(tile(x,y)))continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push({x:x+dx,y:y+dy});}
  for(const site of sites){assert.ok(seen.has(site.x+','+site.y),site.id);assert.ok(![...minorSiteList(s),...shipyardList(s),...areaSites(s)].some(p=>p.x===site.x&&p.y===site.y));assert.equal(pointAt({...s,x:site.x,y:site.y})?.id,site.id);}
 }
 assert.equal(heroes,1);
 assert.equal(ruins,1);
});
test('hidden remains reveal nearby, persist when leaving, and grant their loot once',()=>{
 let s=createGame();const hero=wildernessDiscoverySites(s).find(p=>p.type==='hero-remains');
 s.x=1;s.y=1;assert.ok(!wildernessDiscoveries(s).some(p=>p.id===hero.id));
 const untouched=act(s,{type:'searchDiscovery',id:hero.id});assert.equal(untouched.gold,s.gold);
 s.x=hero.x;s.y=hero.y;s=act(s,{type:'rename',name:s.name});
 assert.ok(wildernessDiscoveries({...s,x:1,y:1}).some(p=>p.id===hero.id));
 const before=s.gold;s=act(s,{type:'searchDiscovery',id:hero.id});
 assert.equal(s.gold,before+75);assert.ok(s.bag.includes('horn-of-help'));assert.equal(s.flags.hornHelpCharges,3);
 assert.equal(wildernessDiscoveries(s).find(p=>p.id===hero.id).searched,true);
 s=loadGame(saveGame(s));s.flags.hornHelpCharges=1;
 const repeated=act(s,{type:'searchDiscovery',id:hero.id});
 assert.equal(repeated.gold,s.gold);assert.equal(repeated.flags.hornHelpCharges,1);assert.equal(repeated.bag.filter(id=>id==='horn-of-help').length,1);
});
test('visible camps grant provisions once while distant and combat searches do nothing',()=>{
 let s=createGame();const camp=wildernessDiscoverySites(s).find(p=>p.type==='abandoned-camp');
 assert.ok(wildernessDiscoveries(s).some(p=>p.id===camp.id));
 s.x=1;s.y=1;assert.equal(act(s,{type:'searchDiscovery',id:camp.id}).gold,s.gold);
 const before=s.meals;s.x=camp.x;s.y=camp.y;
 assert.equal(act({...s,mode:'battle'},{type:'searchDiscovery',id:camp.id}).meals,before);
 s=act(s,{type:'searchDiscovery',id:camp.id});assert.equal(s.meals,before+1);
 assert.equal(act(s,{type:'searchDiscovery',id:camp.id}).meals,s.meals);
});
test('discovery records reject malformed saves and planets have no terrestrial discoveries',()=>{
 const s=createGame();s.flags.discoverySearched=['discovery-r0-hero-remains','discovery-r0-hero-remains'];
 assert.throws(()=>loadGame(saveGame(s)),/discovery state/);
 delete s.flags.discoverySearched;s.exploration={area:'planet-0',artifacts:[]};
 assert.deepEqual(wildernessDiscoverySites(s),[]);
});
