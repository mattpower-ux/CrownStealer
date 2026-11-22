import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dungeonMap} from '../public/game/engine.js';
import {encounterPool} from '../public/game/encounters.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {caveProfile} from '../public/game/cave-profiles.js';
import {minorGuardian} from '../public/game/minor-dungeons.js';
import {secretAlcove,secretStash} from '../public/game/secret-alcoves.js';
import {TREASURE_ITEMS} from '../public/game/treasure.js';
import {demonWeaponMultiplier,truthArrowStrike,truthBurnDamage} from '../public/game/whispering-barrens.js';

test('Whispering Barrens wilderness and delves contain only its infernal roster',()=>{
 const outdoor={...createGame(),region:0,exploration:{area:'wild-2'},mode:'world'};
 const dungeon={...outdoor,mode:'dungeon',dungeon:{index:0,expedition:'wild-2-cave-0',floor:0,x:1,y:1,dir:1}};
 for(const state of [outdoor,dungeon]){
  const names=encounterPool(state).map(enemy=>enemy.name);
  assert.ok(names.length>=10);
  assert.ok(names.some(name=>/Abyss Tender|Soul Crusher|Succubus/.test(name)));
  assert.ok(names.every(name=>!/kobold|dog|wolf|rat|boar/i.test(name)));
 }
});

test('Barrens caves and minor lairs are defiled infernal locations',()=>{
 assert.match(caveProfile('wild-2-cave-0').name,/Abyss|Defiled|Infernal/);
 const caves=Array.from({length:24},(_,slot)=>minorSiteDefinition(`minor-w2-${slot}`)).filter(site=>site.kind==='koboldCave');
 assert.ok(caves.length);
 for(const cave of caves){assert.equal(cave.occupant,'demon');assert.doesNotMatch(cave.name,/kobold/i);}
});

test('every guarded Barrens lair uses an infernal guardian instead of a kobold',()=>{
 const caves=Array.from({length:24},(_,slot)=>minorSiteDefinition(`minor-w2-${slot}`)).filter(site=>site.kind==='koboldCave'&&site.guarded);
 for(const site of caves){
  const state=createGame();
  state.mode='dungeon';state.region=site.region;state.exploration={area:site.area,artifacts:[],visitedAreas:[site.area]};
  state.dungeon={site:'minor-site',minorId:site.id,index:site.index,floor:site.floors-1,x:13,y:12,dir:2};
  const guardian=minorGuardian(state);
  assert.ok(guardian,site.id);
  assert.equal(guardian.demon,true,site.id);
  assert.doesNotMatch(`${guardian.speciesId} ${guardian.name}`,/kobold|goblin/i,site.id);
 }
});

test('only good heroes can reveal the Barrens shrine sanctuary and claim holy stores',()=>{
 const site=Array.from({length:24},(_,slot)=>minorSiteDefinition(`minor-w2-${slot}`)).find(site=>site.kind==='ruinedShrine');
 const make=alignment=>{const state=createGame();state.alignment=alignment;state.mode='dungeon';state.dungeon={site:'minor-site',minorId:site.id,index:site.index,floor:0,x:1,y:1,dir:1};return state;};
 const good=make(10),map=dungeonMap(good.dungeon),room=secretAlcove(good.dungeon,map,{state:good});
 assert.ok(room);
 assert.equal(secretAlcove(make(0).dungeon,map,{state:make(0)}),null);
 good.dungeon.secretRoom=room;
 const items=secretStash(good)[0].items;
 assert.ok(items.includes('demon-slayer-longsword'));
 assert.ok(items.includes('arrows-of-truth'));
 assert.ok(items.some(id=>TREASURE_ITEMS[id]?.healing>=150));
});

test('the last knight history is a unique readable Barrens discovery',()=>{
 const book=TREASURE_ITEMS['last-knight-journal'];
 assert.equal(book.kind,'book');
 assert.match(book.description,/Lancemol.*Galahad.*Tristan.*Bedever/is);
 assert.match(book.description,/demons|island|Barrens/i);
});

test('DemonSlayer doubles infernal damage and limited truth arrows ignite d20 burns',()=>{
 const enemy={name:'Lesser Devil',demon:true,hp:100};
 assert.equal(demonWeaponMultiplier(TREASURE_ITEMS['demon-slayer-longsword'],enemy),2);
 assert.equal(demonWeaponMultiplier(TREASURE_ITEMS['demon-slayer-longsword'],{name:'Bandit'}),1);
 const state={bag:['arrows-of-truth'],flags:{truthArrows:2},enemy};
 assert.equal(truthArrowStrike(state,{family:'bow'}),true);
 assert.equal(state.flags.truthArrows,1);
 assert.equal(state.enemy.truthBurn,true);
 assert.equal(truthBurnDamage(()=>0),1);
 assert.equal(truthBurnDamage(()=>.9999),20);
});
