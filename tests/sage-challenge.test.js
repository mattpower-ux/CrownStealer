import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame,dungeonMap} from '../public/game/engine.js';
import {townPlaces} from '../public/game/town.js';
import {SAGE_QUESTIONS,SAGE_BALL_ID,SAGE_PEN_ID,SAGE_SCROLL_ID,sageDestinations,sageRemains} from '../public/game/sage-challenge.js';
import {DAY_MS,worldTimeMs} from '../public/game/world-clock.js';
function visit(){let s=createGame();s.mode='town';s.location='mothbridge';const p=townPlaces(s).find(p=>p.id==='fortune');s.townPosition={x:p.x,y:p.y};return act(s,{type:'sageVisit'});}
function quiz(correct=3){let s=act(visit(),{type:'sageStartQuiz'});for(let n=0;n<3;n++){const q=SAGE_QUESTIONS.find(q=>q.id===s.flags.sageChallenge.questions[n]);s=act(s,{type:'sageAnswer',answer:n<correct?q.answer:(q.answer+1)%q.options.length});}return s;}
test('Sage recognizes only a visit in another town and chooses two easy one hard',()=>{let s=visit();assert.equal(s.flags.sageRecognized,false);s=act(s,{type:'sageVisit'});assert.equal(s.flags.sageRecognized,false);s.location='redhaven';s.townPosition=townPlaces(s).find(p=>p.id==='fortune');s=act(s,{type:'sageVisit'});assert.equal(s.flags.sageRecognized,true);s=act(s,{type:'sageStartQuiz'});assert.deepEqual(s.flags.sageChallenge.questions.map(id=>SAGE_QUESTIONS.find(q=>q.id===id).difficulty),['easy','easy','hard']);});
test('all failed scores eject with eight days globally and exact two-answer insult',()=>{for(const n of [0,1,2]){let s=quiz(n);assert.equal(s.flags.sageChallenge,undefined);assert.equal(s.flags.sageCooldownUntil,worldTimeMs(s)+8*DAY_MS);if(n===2)assert.match(s.flags.sageNotice,/Dumb as a brick, and twice as thick!/);s.location='redhaven';s.townPosition=townPlaces(s).find(p=>p.id==='fortune');s=act(s,{type:'sageStartQuiz'});assert.equal(s.flags.sageChallenge,undefined);s.worldTimeMs=s.flags.sageCooldownUntil;s.townPosition=townPlaces(s).find(p=>p.id==='fortune');s=act(s,{type:'sageStartQuiz'});assert.equal(s.flags.sageChallenge.stage,'quiz');}});
test('maze deadline, no saving progress, and no ordinary use-item escape',()=>{let s=quiz();assert.equal(s.flags.sageChallenge.stage,'ready');s=act(s,{type:'sageEnterMaze'});assert.equal(s.mode,'dungeon');assert.ok(s.flags.sageChallenge.deadline>Date.now());const loaded=loadGame(saveGame(s));assert.equal(loaded.mode,'town');assert.equal(loaded.flags.sageChallenge,undefined);assert.ok(loaded.flags.sageCooldownUntil>worldTimeMs(loaded));s.bag.push('scroll-return');s=act(s,{type:'useItem',id:'scroll-return'});assert.equal(s.mode,'dungeon');s.flags.sageChallenge.deadline=Date.now()-1;s=act(s,{type:'clockTick',ms:100});assert.equal(s.mode,'town');});
test('maze is traversable; exit grants ball once; teleport uses ten actual sage entrances',()=>{let s=act(quiz(),{type:'sageEnterMaze'});const m=dungeonMap(s.dungeon);assert.equal(m.length,21);const goal={x:m.length-2,y:m.length-2};const todo=[[1,1,[]]],seen=new Set(['1,1']);let path;for(let i=0;i<todo.length;i++){const [x,y,p]=todo[i];if(x===goal.x&&y===goal.y){path=p;break;}for(const [dir,[dx,dy]] of [[0,[0,-1]],[1,[1,0]],[2,[0,1]],[3,[-1,0]]])if(m[y+dy]?.[x+dx]!==undefined&&m[y+dy][x+dx]!==1&&!seen.has(`${x+dx},${y+dy}`)){seen.add(`${x+dx},${y+dy}`);todo.push([x+dx,y+dy,[...p,dir]]);}}assert.ok(path?.length>30);let encounters=0;for(const dir of path){s.dungeon.dir=dir;s=act(s,{type:'forward'});if(s.mode==='battle'){encounters++;assert.equal(s.enemy.groupSize,3);assert.ok(Math.abs(s.dungeon.x-goal.x)+Math.abs(s.dungeon.y-goal.y)<=5);s.enemy.hp=1;for(let round=0;round<10&&s.mode==='battle';round++)s=act(s,{type:'attack'});assert.equal(s.mode,'dungeon');}}assert.equal(encounters,1);assert.equal(s.flags.sageSolved,true);assert.equal(s.bag.filter(id=>id===SAGE_BALL_ID).length,1);assert.equal(sageDestinations(s).length,10);for(const t of sageDestinations(s)){s.townPosition=townPlaces(s).find(p=>p.id==='fortune');s=act(s,{type:'sageTeleport',town:t.id});assert.equal(s.location,t.id);const entrance=townPlaces(s).find(p=>p.id==='fortune');assert.deepEqual(s.townPosition,{x:entrance.x,y:entrance.y});}s=loadGame(saveGame(s));assert.ok(s.bag.includes(SAGE_BALL_ID));});

test('both journals can be discovered and Clarissa carries a one-time intelligence scroll',()=>{let s=act(quiz(),{type:'sageEnterMaze'});const remains=sageRemains(s.dungeon);assert.deepEqual(remains.map(r=>r.name),['Randal the Lost','Clarissa the Shrew']);for(const r of remains){assert.equal(dungeonMap(s.dungeon)[r.y][r.x],0);Object.assign(s.dungeon,{x:r.x,y:r.y});s=act(s,{type:'sageInspectRemains',id:r.id});assert.ok(s.log.at(-1).includes(r.journal));}const r=remains[1];s=act(s,{type:'sageInspectRemains',id:r.id});assert.equal(s.bag.filter(id=>id===SAGE_SCROLL_ID).length,1);s=act(s,{type:'sageAbort'});const intelligence=s.attributes.intelligence;s=act(s,{type:'useItem',id:SAGE_SCROLL_ID});assert.equal(s.attributes.intelligence,intelligence+1);assert.ok(!s.bag.includes(SAGE_SCROLL_ID));});

test('Clarissa’s equipped pen sketches only visited squares and survives a failed challenge',()=>{
 let s=act(quiz(),{type:'sageEnterMaze'});
 const body=sageRemains(s.dungeon).find(r=>r.id==='clarissa');
 Object.assign(s.dungeon,{x:body.x,y:body.y});
 s=act(s,{type:'sageInspectRemains',id:body.id});
 assert.ok(s.bag.includes(SAGE_PEN_ID));
 assert.equal(s.flags.sageChallenge.sketch,undefined);
 s=act(s,{type:'sageEquipPen'});
 assert.equal(s.equippedMagic,SAGE_PEN_ID);
 assert.deepEqual(s.flags.sageChallenge.sketch,[body.x+','+body.y]);
 const map=dungeonMap(s.dungeon);
 const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
 s.dungeon.dir=dirs.findIndex(([dx,dy])=>map[body.y+dy]?.[body.x+dx]===0);
 const [dx,dy]=dirs[s.dungeon.dir];
 s=act(s,{type:'forward'});
 assert.deepEqual(s.flags.sageChallenge.sketch,[body.x+','+body.y,(body.x+dx)+','+(body.y+dy)]);
 s.flags.sageChallenge.deadline=Date.now()-1;
 s=loadGame(saveGame(act(s,{type:'clockTick',elapsedMs:100})));
 assert.equal(s.mode,'town');
 assert.ok(s.bag.includes(SAGE_PEN_ID));
 assert.equal(s.equippedMagic,SAGE_PEN_ID);
});
