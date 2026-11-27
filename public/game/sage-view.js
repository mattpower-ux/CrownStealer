import {SAGE_BALL_ID,SAGE_QUESTIONS,sageDestinations} from './sage-challenge.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sageView(s,insult,{marriage=false,teleport=false}={}){
 const q=s.flags.sageChallenge,lovely=(s.flags.sageSolved||q?.stage==='ready')&&!marriage;
 let speech=lovely?'The beautiful yellow-haired Sage smiles. “What do you want?”':insult,actions='';
 if(q?.stage==='quiz'){
  const question=SAGE_QUESTIONS.find(x=>x.id===q.questions[q.questionIndex]);
  speech=`Question ${q.questionIndex+1} of 3: ${question.prompt}`;
  actions=question.options.map((option,i)=>`<button data-sage-answer="${i}">${esc(option)}</button>`).join('');
 }else if(q?.stage==='ready'){
  speech="At last, one worthy of my secret. Beneath my floors are many doors, a maze of complication. Solve the maze without a save, and you'll have the key to every nation!";
  actions='<p>The trapdoor opens. You have seven real minutes to find the exit. No saving or restoring. Leaving the challenge means eight game days away.</p><button id="sage-enter-maze">Descend through the trapdoor</button>';
 }else if(s.flags.sageSolved){
  actions=(s.bag.includes(SAGE_BALL_ID)?'<button id="sage-teleport">Teleport Me</button>':'')+'<button id="another-fortune">I miss the old hag. Insult me</button><button id="sage-marriage">Ask her to marry you</button>';
  if(teleport&&s.bag.includes(SAGE_BALL_ID))actions=sageDestinations(s).map(t=>`<button data-sage-town="${esc(t.id)}">${esc(t.name)}</button>`).join('');
 }else actions='<button id="sage-start-quiz">ANSWER, ME THESE QUESTIONS THREE!</button><button id="replay-fortune">Replay her greeting</button><button id="another-fortune">Another prediction · free</button>';
 const recognition=s.flags.sageRecognized?'<p class="fine">Oddly, it\'s the same Sage that insulted you in other towns.</p>':'';
 return `<div class="fortune-visit"><img src="/assets/${lovely?'sage-transformed':'fortune-teller'}.webp" alt="${lovely?'The beautiful yellow-haired Sage smiles beside her crystal ball':'Old Mother Mould, a toothless one-eyed fortune teller leering over her crystal ball'}"><div><p class="eyebrow">${lovely?'A SECRET REVEALED':'YOUR FUTURE IS MOSTLY MUD'}</p><h3>${lovely?'The Sage':'Old Mother Mould'}</h3>${recognition}<p class="fortune-speech" role="status">${esc(speech)}</p><div class="panel-actions">${actions}<button id="sage-leave">Leave her hut</button></div></div></div>`;
}
