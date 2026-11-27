import {TOWNS} from './content.js';
import {townPlace,townPlaces} from './town.js';
import {DAY_MS,worldTimeMs,advanceClock} from './world-clock.js';
import {MONSTER_BY_ID} from './bestiary.js';
export const SAGE_PEN_ID='sage-mapping-scroll';
export const SAGE_SCROLL_ID='sage-intelligence-scroll';
export const SAGE_MAZE_ID='sage-maze',SAGE_BALL_ID='sage-crystal-ball';
export const SAGE_QUESTIONS=[
 {id:'hands',difficulty:'easy',prompt:'What has hands but cannot clap?',options:['A clock','A crow','A boot'],answer:0},
 {id:'towel',difficulty:'easy',prompt:'What gets wetter the more it dries?',options:['A candle','A towel','A stone'],answer:1},
 {id:'teeth',difficulty:'easy',prompt:'What has teeth but cannot bite?',options:['A wolf','A snake','A comb'],answer:2},
 {id:'neck',difficulty:'easy',prompt:'What has a neck but no head?',options:['A bottle','A horse','A goose'],answer:0},
 {id:'coins',difficulty:'hard',prompt:'Two fathers and two sons each take one coin. Only three coins are taken. How?',options:['One coin is cut in half','They are a grandfather, father, and son','One man takes no coin'],answer:1},
 {id:'sisters',difficulty:'hard',prompt:'Each of five sisters has one brother. All share the same parents. How many children are there?',options:['Ten','Seven','Six'],answer:2},
 {id:'race',difficulty:'hard',prompt:'In a race, you pass the runner in second place. What place are you now in?',options:['First','Second','Third'],answer:1}
];
export const SAGE_SECRET="At last, one worthy of my secret. Beneath my floors are many doors, a maze of complication. Solve the maze without a save, and you'll have the key to every nation!";
export const SAGE_FAILURE='Dumb as a brick, and twice as thick! Now get thee hence, and come not again for a week and a day!';
export const sageDestinations=()=>TOWNS.filter(t=>townPlaces({location:t.id}).some(p=>p.id==='fortune')).slice(0,10);
const atSage=s=>s.mode==='town'&&!s.castle&&townPlace(s)?.id==='fortune';
function say(s,text,note){s.flags.sageNotice=text;note(s,text);}
function eject(s,note,text,penalty=true){const c=s.flags.sageChallenge;const town=TOWNS.find(t=>t.id===(c?.town||s.location))||TOWNS[0];s.mode=s.returnMode='town';s.location=town.id;s.region=town.region;s.x=town.x;s.y=town.y;s.dungeon=null;s.enemy=null;delete s.castle;s.townPosition={x:6,y:11};delete s.flags.sageChallenge;if(penalty)s.flags.sageCooldownUntil=worldTimeMs(s)+8*DAY_MS;if(text)say(s,text,note);}
function pickQuestions(){const easy=SAGE_QUESTIONS.filter(q=>q.difficulty==='easy'),hard=SAGE_QUESTIONS.filter(q=>q.difficulty==='hard');const a=easy.splice(Math.floor(Math.random()*easy.length),1)[0];return [a.id,easy[Math.floor(Math.random()*easy.length)].id,hard[Math.floor(Math.random()*hard.length)].id];}
// A seeded depth-first maze: every corridor is reachable, with many dead ends.
export function sageMap(d){const n=21,m=Array.from({length:n},()=>Array(n).fill(1));let seed=(d.sageSeed||1)>>>0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const stack=[[1,1]];m[1][1]=0;while(stack.length){const [x,y]=stack.at(-1),next=[[0,-2],[2,0],[0,2],[-2,0]].map(([dx,dy])=>[x+dx,y+dy,dx,dy]).filter(([nx,ny])=>nx>0&&ny>0&&nx<n-1&&ny<n-1&&m[ny][nx]===1);if(!next.length){stack.pop();continue;}const [nx,ny,dx,dy]=next[Math.floor(random()*next.length)];m[y+dy/2][x+dx/2]=m[ny][nx]=0;stack.push([nx,ny]);}m[n-2][n-2]=2;return m;}
const mazeFeatures=new Map();
function features(d){
 const seed=d.sageSeed||1;
 if(mazeFeatures.has(seed))return mazeFeatures.get(seed);
 const map=sageMap(d),end=map.length-2,start={x:end,y:end,distance:0};
 const queue=[start],seen=new Set([end+','+end]),fromExit=new Map();
 for(const point of queue){
  fromExit.set(point.x+','+point.y,point.distance);
  for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
   const x=point.x+dx,y=point.y+dy,key=x+','+y;
   if(map[y]?.[x]===undefined||map[y][x]===1||seen.has(key))continue;
   seen.add(key);queue.push({x,y,distance:point.distance+1,parent:point});
  }
 }
 const route=[];
 for(let point=queue.find(p=>p.x===1&&p.y===1);point;point=point.parent)route.push(point);
 const remains=[
  {...route[Math.floor(route.length*.25)],id:'randal',name:'Randal the Lost',journal:"Left, then two rights, then forward. No. Wait. Right, then Left, then Right again!...I'm doomed!"},
  {...route[Math.floor(route.length*.55)],id:'clarissa',name:'Clarissa the Shrew',journal:'Lefty Lucy, Righty Reginald, hop, hop, hop, no time for nonsense! Hurry, hurry, rats will scurry!'}
 ];
 if(mazeFeatures.size>=24)mazeFeatures.delete(mazeFeatures.keys().next().value);
 const result={remains,fromExit};mazeFeatures.set(seed,result);return result;
}
export const sageRemains=d=>features(d).remains;
export const sageRemainsAt=d=>d?.site===SAGE_MAZE_ID?sageRemains(d).find(r=>r.x===d.x&&r.y===d.y):null;

function sketchSquare(s){
 const challenge=s.flags.sageChallenge;
 if(s.equippedMagic!==SAGE_PEN_ID||!s.bag.includes(SAGE_PEN_ID))return;
 const {x,y}=s.dungeon,key=x+','+y,sketch=challenge.sketch??=[];
 if(!sketch.includes(key))sketch.push(key);
}

function startRatAmbush(s,c,note){
 const rat=MONSTER_BY_ID['tithe-rat'],memberHp=14;
 c.ratsTriggered=true;
 s.mode='battle';s.returnMode='dungeon';s.flags.guarded=false;s.flags.combo=0;
 s.enemy={...rat,speciesId:rat.id,name:'Vicious Rat',groupSize:3,memberHp,hp:memberHp*3,maxHp:memberHp*3,attack:4,xp:0,gold:0,combatDistance:1,surpriseShotsRemaining:0};
 say(s,'Three vicious rats swarm out of cracks in the walls!',note);
}
export function failSageMaze(s,note,message){eject(s,note,message);}

export function sageAction(s,a,note){
 s.flags??={};const c=s.flags.sageChallenge;
 if(c?.stage==='maze'){
  if(Date.now()>=c.deadline){eject(s,note,'Time is up! The Sage ejects you from the maze and bars her hut for eight days.');return true;}
  if(a.type==='sageAbort'){eject(s,note,'You abandon the maze. The Sage bars her hut for eight days.');return true;}
  if(a.type==='clockTick'){advanceClock(s,a.elapsedMs||0);return true;}
  if(s.mode==='battle')return !['attack','guard','advanceCombat','switchCombatWeapon','retreat'].includes(a.type);
  const d=s.dungeon;
  if(a.type==='sageInspectRemains'){
   const body=sageRemainsAt(d);
   if(body?.id!==a.id)return true;
   if(body.id==='clarissa'&&!s.bag.includes(SAGE_PEN_ID))s.bag.push(SAGE_PEN_ID);
   const foundScroll=body.id==='clarissa'&&!s.flags.sageScrollFound;
   if(foundScroll){
    s.flags.sageScrollFound=true;
    s.bag.push(SAGE_SCROLL_ID);
   }
   say(s,body.name+'’s journal: “'+body.journal+'”'+(foundScroll?' You take her Scroll of Intelligence.':''),note);
   return true;
  }
  if(a.type==='sageEquipPen'){
   if(sageRemainsAt(d)?.id==='clarissa'&&s.bag.includes(SAGE_PEN_ID)){
    s.equippedMagic=SAGE_PEN_ID;
    sketchSquare(s);
    note(s,'Clarissa’s pen begins to sketch your path.');
   }
   return true;
  }
  if(a.type==='turn'&&[-1,1].includes(a.delta))d.dir=(d.dir+a.delta+4)%4;
  if(['forward','back','strafe'].includes(a.type)){
   const dir=(d.dir+(a.type==='strafe'?(a.delta<0?-1:1):0)+4)%4,[dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][dir],sign=a.type==='back'?-1:1,x=d.x+dx*sign,y=d.y+dy*sign,m=sageMap(d);
   if(m[y]?.[x]!==undefined&&m[y][x]!==1){d.x=x;d.y=y;s.turns++;sketchSquare(s);if(!c.ratsTriggered&&features(d).fromExit.get(x+','+y)<=5){startRatAmbush(s,c,note);return true;}if(m[y][x]===2){s.flags.sageSolved=true;if(!s.bag.includes(SAGE_BALL_ID))s.bag.push(SAGE_BALL_ID);eject(s,note,'You find the Crystal Ball of Teleportation! The smiling Sage awaits you above.',false);}}else note(s,'Cold stone blocks your path.');
  }
  return true; // No maps, ladders or item-based escape.
 }
 if(c&&['quiz','ready'].includes(c.stage)&&!String(a.type).startsWith('sage')){if(a.type==='clockTick')return false;eject(s,note,'You leave before finishing. The Sage bars her hut for eight days.');return true;}
 if(!String(a.type).startsWith('sage')||['sageRemoveHelm','sageBuyIntelligence'].includes(a.type))return false;
 if(a.type==='sageAbort'){if(c)eject(s,note,'You leave before finishing. The Sage bars her hut for eight days.');return true;}
 if(!atSage(s))return true;
 delete s.flags.sageNotice;
 if((s.flags.sageCooldownUntil||0)>worldTimeMs(s)){eject(s,note,'The Sage refuses to admit you. Return after eight days have passed.',false);return true;}
 if(a.type==='sageVisit'){const visits=s.flags.sageVisitedTowns||[];s.flags.sageRecognized=visits.some(id=>id!==s.location);s.flags.sageVisitedTowns=[...new Set([...visits,s.location])];return true;}
 if(a.type==='sageStartQuiz'&&!s.flags.sageSolved&&!c){s.flags.sageChallenge={stage:'quiz',town:s.location,questions:pickQuestions(),questionIndex:0,correct:0};return true;}
 if(a.type==='sageAnswer'&&c?.stage==='quiz'){const q=SAGE_QUESTIONS.find(q=>q.id===c.questions[c.questionIndex]);if(!Number.isInteger(a.answer)||a.answer<0||a.answer>=q.options.length)return true;if(a.answer===q.answer)c.correct++;c.questionIndex++;if(c.questionIndex===3){if(c.correct===3){c.stage='ready';say(s,SAGE_SECRET,note);}else eject(s,note,c.correct===2?SAGE_FAILURE:'Not even three answers! Get thee hence, and come not again for a week and a day!');}return true;}
 if(a.type==='sageEnterMaze'&&c?.stage==='ready'){c.stage='maze';c.deadline=Date.now()+420000;s.mode=s.returnMode='dungeon';s.enemy=null;s.dungeon={site:SAGE_MAZE_ID,index:0,floor:0,x:1,y:1,dir:1,sageSeed:Math.floor(Math.random()*4294967295)+1};sketchSquare(s);say(s,'The trap door opens. Find the exit before seven minutes pass. You cannot save in the maze.',note);return true;}
 if(a.type==='sageTeleport'&&s.flags.sageSolved&&s.bag.includes(SAGE_BALL_ID)){const town=sageDestinations(s).find(t=>t.id===a.town);if(town){s.region=town.region;s.location=town.id;s.x=town.x;s.y=town.y;const p=townPlaces(s).find(p=>p.id==='fortune');s.townPosition={x:p.x,y:p.y};say(s,'The crystal ball carries you to the Sage in '+town.name+'.',note);}return true;}
 return true;
}
export function sageSave(s){if(s.flags?.sageChallenge?.stage!=='maze')return s;const copy=structuredClone(s);eject(copy,(s,text)=>s.log.push(text),'You left the maze without finishing. The Sage bars her hut for eight days.');return copy;}
export function validSageState(s){const f=s.flags||{},c=f.sageChallenge;if(f.sageCooldownUntil!==undefined&&(!Number.isFinite(f.sageCooldownUntil)||f.sageCooldownUntil<0))return false;if(f.sageSolved!==undefined&&typeof f.sageSolved!=='boolean')return false;if(f.sageVisitedTowns!==undefined&&(!Array.isArray(f.sageVisitedTowns)||f.sageVisitedTowns.some(id=>!TOWNS.some(t=>t.id===id))))return false;if(!c)return s.dungeon?.site!==SAGE_MAZE_ID;if(!['quiz','ready','maze'].includes(c.stage)||!TOWNS.some(t=>t.id===c.town)||!Array.isArray(c.questions)||c.questions.length!==3||c.questions.some((id,i)=>!SAGE_QUESTIONS.some(q=>q.id===id&&q.difficulty===(i<2?'easy':'hard')))||!Number.isInteger(c.questionIndex)||c.questionIndex<0||c.questionIndex>3||!Number.isInteger(c.correct)||c.correct<0||c.correct>c.questionIndex)return false;if(c.stage==='quiz')return c.questionIndex<3&&atSage(s);if(c.correct!==3||c.questionIndex!==3)return false;if(c.stage==='ready')return atSage(s);return (s.mode==='dungeon'||s.mode==='battle'&&s.returnMode==='dungeon')&&s.dungeon?.site===SAGE_MAZE_ID&&Number.isFinite(c.deadline);}
