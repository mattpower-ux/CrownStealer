import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,saveGame,loadGame} from '../public/game/engine.js';
import {casinoView} from '../public/game/casino-view.js';
import {TOWNS} from '../public/game/content.js';
const town=()=>Object.assign(createGame(),{mode:'town',location:TOWNS[0].id,gold:4805,rng:123});
test('casino permits wagers above 100 and preserves them in saves',()=>{let s=act(town(),{type:'gamble',game:'poker',bet:4000});assert.equal(s.gold,805);assert.equal(s.casino.bet,4000);assert.equal(loadGame(saveGame(s)).casino.bet,4000);});
test('casino rejects wagers beyond purse and fractional wagers',()=>{for(const bet of [4806,1.5,0])assert.equal(act(town(),{type:'gamble',game:'poker',bet}).gold,4805);});
test('casino explains wager timing and explicit paid action',()=>{const html=casinoView(town(),()=>'',x=>x);assert.match(html,/Set your wager/);assert.match(html,/Bet 5 Gold &amp; Deal Blackjack/);assert.doesNotMatch(html,/Maximum wager: 100/);assert.match(html,/max="4805"/);});
