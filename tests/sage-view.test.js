import test from 'node:test';
import assert from 'node:assert/strict';
const view=await import('../public/game/sage-view.js').catch(()=>({}));
test('sage view preserves insult options and offers questions before victory',()=>{assert.equal(typeof view.sageView,'function');const html=view.sageView({flags:{},bag:[]},'You smell of turnips.');assert.match(html,/ANSWER, ME THESE QUESTIONS THREE!/);assert.match(html,/You smell of turnips/);assert.doesNotMatch(html,/same Sage/);});
test('solved sage offers marriage and old hag, with teleport only while ball possessed',()=>{assert.equal(typeof view.sageView,'function');const state={flags:{sageSolved:true},bag:[]};let html=view.sageView(state,'Insult');assert.match(html,/What do you want/);assert.match(html,/Ask her to marry you/);assert.match(html,/I miss the old hag/);assert.doesNotMatch(html,/Teleport Me/);state.bag.push('sage-crystal-ball');assert.match(view.sageView(state,'Insult'),/Teleport Me/);});
test('recognition appears only after engine marks a different town visit',()=>{assert.equal(typeof view.sageView,'function');assert.match(view.sageView({flags:{sageRecognized:true},bag:[]},'Insult'),/same Sage/);});
