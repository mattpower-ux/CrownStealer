import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,loadGame,saveGame} from '../public/game/engine.js';
import {SIDE_QUESTS} from '../public/game/content.js';
import {selectOddJob,nextOddJob,oddJobsView} from '../public/game/odd-jobs-view.js';

const mothbridge=SIDE_QUESTS.filter(job=>job.town==='mothbridge');
const bellwether=SIDE_QUESTS.filter(job=>job.town==='bellwether');
const adventurer=()=>({...createGame(),mode:'town',location:'mothbridge',gold:100});
const button=(label,action,css,disabled)=>`<button data-job="${action.id}"${disabled?' disabled':''}>${label}</button>`;
const render=(s,id)=>oddJobsView(s,id,button,String);

test('Odd Jobs shows one commission with readable level, reward and progress',()=>{
  const html=render(adventurer(),mothbridge[0].id);
  assert.match(html,/Soup Before Statues/);
  assert.doesNotMatch(html,/Overdue by Several Centuries/);
  assert.match(html,/Recommended level/);
  assert.match(html,/30 gold \+ 15 XP/);
  assert.match(html,/20 \/ 20 gold/);
  assert.match(html,/data-next-odd-job/);
  assert.match(html,/data-job="soup-before-statues">Turn in job/);
});

test('cycling wraps in the current town and resets when entering a different town',()=>{
  const s=adventurer();
  let selected=selectOddJob(s,null);
  assert.equal(selected,mothbridge[0].id);
  for(const job of [...mothbridge.slice(1),mothbridge[0]]){
    selected=nextOddJob(s,selected);
    assert.equal(selected,job.id);
  }
  assert.equal(selectOddJob({...s,location:'bellwether'},selected),bellwether[0].id);
  assert.equal(nextOddJob({...s,location:'bellwether'},selected),bellwether[0].id);
});

test('the selected commission remains visible after completion without offering a second reward',()=>{
  const [job]=mothbridge;
  const completed=loadGame(saveGame(act(adventurer(),{type:'quest',id:job.id})));
  assert.equal(selectOddJob(completed,job.id),job.id);
  const html=render(completed,job.id);
  assert.match(html,/Soup Before Statues/);
  assert.match(html,/Completed/);
  assert.match(html,/The kitchen opens/);
  assert.doesNotMatch(html,/Turn in job/);
  assert.equal(act(completed,{type:'quest',id:job.id}).gold,completed.gold);
});

test('an incomplete keepsake job shows its requirement and disables turn-in',()=>{
  const job=mothbridge.find(job=>job.questItem);
  const html=render(adventurer(),job.id);
  assert.match(html,/Ancient Book/);
  assert.match(html,/0 \/ 1 Ancient Book/);
  assert.match(html,/disabled>Turn in job/);
});
