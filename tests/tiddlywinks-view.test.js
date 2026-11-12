import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {casinoView} from '../public/game/casino-view.js';

function startRound() {
  const s=createGame();
  Object.assign(s,{mode:'town',location:'mothbridge',gold:100});
  return act(s,{type:'gamble',game:'tiddlywinks',bet:10});
}

const shoot=(s,power=s.casino.target-s.casino.wind)=>act(s,{type:'casinoShoot',power});
const render=(s,animateWink=false)=>casinoView(s,()=>'',String,false,{animateWink});

test('tiddlywinks displays the cup, live aim, drift and three ready winks',()=>{
  const html=render(startRound());
  assert.match(html,/class="winks-cup"/);
  assert.match(html,/id="wink-power"/);
  assert.match(html,/data-wink-aim/);
  assert.match(html,/data-wink-projection/);
  assert.match(html,/Drift|No drift/);
  assert.equal((html.match(/data-shot-status="ready"/g)||[]).length,3);
  assert.doesNotMatch(html,/data-wink-flight="true"/);
});

test('shot history and result persist, and a round still pays triple for two hits',()=>{
  let s=startRound();
  s=shoot(s);
  const first=s.casino.landing;
  assert.deepEqual(s.casino.landings,[first]);
  assert.match(render(s,true),/data-wink-flight="true"/);
  assert.match(render(s),/Shot 1: in the cup/);
  assert.doesNotMatch(render(s),/data-wink-flight="true"/);
  s=shoot(loadGame(saveGame(s)),0);
  const second=s.casino.landing;
  assert.deepEqual(s.casino.landings,[first,second]);
  assert.match(render(s),/Shot 2: missed/);
  s=shoot(loadGame(saveGame(s)));
  assert.equal(s.casino.hits,2);
  assert.equal(s.casino.active,false);
  assert.equal(s.casino.payout,30);
  assert.equal(s.gold,120);
  assert.match(render(s),/Returned 30 gold/);
  assert.doesNotMatch(render(s),/id="wink-power"/);
});

test('legacy mid-round saves retain known scores without inventing shot history',()=>{
  const legacy=shoot(startRound());
  delete legacy.casino.landings;
  const restored=loadGame(saveGame(legacy));
  assert.match(render(restored),/Shot 1: in the cup/);
  const after=shoot(restored,0);
  assert.equal(after.casino.hits,1);
  assert.match(render(after),/Shot 1: played/);
  assert.match(render(after),/Shot 2: missed/);
  assert.equal(loadGame(saveGame(after)).casino.shots,2);
});

test('invalid tiddlywinks landings cannot be loaded',()=>{
  const s=shoot(startRound());
  s.casino.landings=[s.casino.target+30];
  assert.throws(()=>loadGame(saveGame(s)),/invalid casino/i);
});
