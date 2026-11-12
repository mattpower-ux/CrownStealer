import test from 'node:test';
import assert from 'node:assert/strict';
import {startGuardConsultation,finishGuardConsultation,validGuardConsultation} from '../public/game/castle-guard-audience.js';
const fixture=()=>({mode:'town',worldTimeMs:1000,castle:{x:1,y:2,alarm:false}});
const layout={tiles:[['wall','wall','wall'],['wall','throne','wall'],['wall','hall','wall']],throne:{x:1,y:1},guards:[{id:'g',x:1,y:2}],patrols:[]};
test('guard consultation persists an eight-second wait and returns permission once',()=>{
 const s=fixture(),notes=[],events=[];startGuardConsultation(s,layout.guards[0],layout,{note:(_,m)=>notes.push(m),events});
 assert.equal(s.castle.guardConsultation.until,385000);assert.equal(validGuardConsultation(s,layout),true);assert.equal(events[0].kind,'castleGuardConsult');
 const loaded=JSON.parse(JSON.stringify(s));loaded.worldTimeMs=384999;assert.equal(finishGuardConsultation(loaded,(_,m)=>notes.push(m)),false);
 loaded.worldTimeMs++;assert.equal(finishGuardConsultation(loaded,(_,m)=>notes.push(m)),true);assert.equal(loaded.castle.guardConsultation,undefined);assert.match(notes.at(-1),/may pass/);assert.equal(finishGuardConsultation(loaded,()=>assert.fail()),false);
});
test('invalid guard consultations are rejected',()=>{const s=fixture();startGuardConsultation(s,layout.guards[0],layout,{note:()=>{}});s.castle.guardConsultation.guardId='fake';assert.equal(validGuardConsultation(s,layout),false);});
