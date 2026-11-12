import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame, loadGame, saveGame} from '../public/game/engine.js';
import {TOWNS} from '../public/game/content.js';
import {imprisonInArena} from '../public/game/gladiator-arena.js';
const reload = s => loadGame(saveGame(s));
const note = (s, text) => s.log.push(text);
function lastBout(s, town) {
  Object.assign(s, {mode:'town', returnMode:'town', location:town.id, region:town.region, x:town.x, y:town.y});
  imprisonInArena(s,note);
  s.arena.wins=9;
  const fight=act(s,{type:'startArenaFight'});
  fight.enemy.hp=1; fight.weapon=1000;
  return act(fight,{type:'attack'});
}
test('tenth arena win earns independent persistent town titles without replacing the hero name',()=>{
  let s=lastBout(createGame('Aster'),TOWNS[0]);
  assert.deepEqual(s.championTowns,[TOWNS[0].id]);
  s=reload(lastBout(s,TOWNS[1]));
  assert.deepEqual(s.championTowns,[TOWNS[0].id,TOWNS[1].id]);
  assert.equal(s.name,'Aster');
  s=lastBout(s,TOWNS[0]);
  assert.equal(s.championTowns.length,2);
});
test('legacy saves load and invalid champion records are rejected',()=>{
  const s=createGame();
  delete s.championTowns;
  assert.doesNotThrow(()=>reload(s));
  for(const value of [['unknown'],['mothbridge','mothbridge'],'mothbridge',null])
    assert.throws(()=>reload({...s,championTowns:value}),/champion/i);
});

function challenger(town='mothbridge') {
  const s=createGame();
  s.championTowns=['mothbridge','bellwether'];
  s.mode='battle'; s.returnMode='world';
  s.enemy={speciesId:'roaming-gladiator',name:'Roaming Gladiator',championTown:town,hp:100,maxHp:100,attack:1000,armor:0,gold:0,xp:0,level:5,kind:'brute',firstContact:true};
  return s;
}
test('defeat in a title duel removes only the challenged title and preserves belongings and mounts',()=>{
  const s=challenger(); s.hp=1;s.flags.mount='dragon';s.flags.mounts=['dragon'];
  const lost=reload(act(reload(s),{type:'guard'}));
  assert.deepEqual(lost.championTowns,['bellwether']);
  assert.equal(lost.mode,'world');assert.equal(lost.hp,lost.maxHp);
  assert.deepEqual(lost.bag,s.bag); assert.equal(lost.gold,s.gold);
  assert.equal(lost.flags.mount,'dragon');assert.equal(lost.flags.dragonCaptured,undefined);
});
test('winning a title duel retains all titles after saving and avoids ordinary monster rewards',()=>{
  const s=challenger();s.enemy.hp=1;s.weapon=1000;s.enemy.gold=100;
  const won=reload(act(s,{type:'attack'}));
  assert.deepEqual(won.championTowns,s.championTowns);
  assert.equal(won.mode,'world');assert.equal(won.gold,s.gold);
  assert.match(won.log.join(' '),/retain.*CHAMPION OF MOTHBRIDGE/);
});
test('ordinary monster losses never remove champion titles',()=>{
  const s=challenger();delete s.enemy.championTown;s.hp=1;
  assert.deepEqual(act(s,{type:'guard'}).championTowns,s.championTowns);
});
test('a saved challenger must challenge a held title in the wilderness',()=>{
  for(const change of [s=>s.enemy.championTown='redhaven',s=>s.enemy.championTown='unknown',s=>s.returnMode='town']) {
    const s=challenger();change(s);assert.throws(()=>reload(s),/champion/i);
  }
});
test('wilderness movement can trigger a title challenger independently of normal monster chance',()=>{
  let found;
  for(let seed=0;seed<4000&&!found;seed++) {
    const s=createGame();s.championTowns=['mothbridge'];s.turns=10;s.rng=seed;
    const next=act(s,{type:'move',dx:-1,dy:0});
    if(next.enemy?.championTown)found=next;
  }
  assert.ok(found,'A champion should eventually face a roaming challenger');
  assert.equal(reload(found).enemy.championTown,'mothbridge');
});


const {tryChampionChallenge} = await import('../public/game/gladiator-arena.js');
test('the independent challenge probability is 0.3 percent, not multiplied by held titles',()=>{
  for(const titles of [['mothbridge'],['mothbridge','bellwether']]) {
    const low=createGame();low.championTowns=titles;
    let draws=0;
    assert.equal(tryChampionChallenge(low,()=>{draws++;return draws===1?.002999:.999;},note),true);
    assert.equal(low.enemy.championTown,titles.at(-1));
    const boundary=createGame();boundary.championTowns=titles;
    assert.equal(tryChampionChallenge(boundary,()=>.003,note),false);
    assert.equal(boundary.mode,'world');
  }
  const untitled=createGame();
  assert.equal(tryChampionChallenge(untitled,()=>assert.fail('Untitled heroes must not consume a challenge roll'),note),false);
});
test('escaping a challenge retains titles, and indoor and invisible heroes do not trigger one',()=>{
  const s=challenger();s.rng=1024;
  assert.deepEqual(act(s,{type:'flee'}).championTowns,s.championTowns);
  s.bag.push('scroll-return');
  assert.deepEqual(act(s,{type:'useItem',id:'scroll-return'}).championTowns,s.championTowns);
  for(const mode of ['town','dungeon','battle']) {
    const hero=createGame();hero.mode=mode;hero.championTowns=['mothbridge'];
    assert.equal(tryChampionChallenge(hero,()=>0,note),false);
  }
  const invisible=createGame();invisible.championTowns=['mothbridge'];invisible.spellEffects.invisibleMoves=2;
  assert.equal(tryChampionChallenge(invisible,()=>0,note),false);
});

test('voluntary tenth wins award the title, while the ninth win does not',()=>{
  const town=TOWNS[0],s=createGame();
  Object.assign(s,{mode:'town',returnMode:'town',region:town.region,location:town.id,x:town.x,y:town.y,
    level:3,arena:{town:town.id,prisoner:false,wins:8,qualifies:false}});
  let fight=act(s,{type:'startArenaFight'});fight.enemy.hp=1;fight.weapon=1000;
  const ninth=act(fight,{type:'attack'});
  assert.equal(ninth.championTowns,undefined);
  fight=act(ninth,{type:'startArenaFight'});fight.enemy.hp=1;
  const tenth=reload(act(fight,{type:'attack'}));
  assert.deepEqual(tenth.championTowns,['mothbridge']);
  assert.equal(tenth.arena.wins,10);
});

test('royal heroes still fight roaming title challengers',()=>{
  let encountered;
  for(let seed=0;seed<4000&&!encountered;seed++) {
    const s=createGame();s.flags.royalHero=true;s.championTowns=['mothbridge'];s.turns=10;s.rng=seed;
    const next=act(s,{type:'move',dx:-1,dy:0});
    if(next.log.some(line=>line.includes('challenges your title')))encountered=next;
  }
  assert.ok(encountered);
  assert.equal(encountered.mode,'battle');
  assert.equal(encountered.enemy?.championTown,'mothbridge');
});
test('random encounter suppression and both invisibility mechanisms prevent title challenges without consuming a roll',()=>{
  for(const configure of [s=>s.previewRules={noRandom:true},s=>s.buffs={invisibility:2},s=>s.spellEffects.invisibleMoves=2]) {
    const s=createGame();s.championTowns=['mothbridge'];configure(s);
    assert.equal(tryChampionChallenge(s,()=>assert.fail('Suppressed challenge must not roll'),note),false);
    assert.equal(s.mode,'world');
  }
});
