import {SIDE_QUESTS} from './content.js';
import {itemArt,itemById} from './items.js';

const localJobs=s=>SIDE_QUESTS.filter(job=>job.town===s.location);
const number=value=>value.toLocaleString('en-US');

export function selectOddJob(s,id) {
 const jobs=localJobs(s);
 return jobs.find(job=>job.id===id)?.id??jobs[0]?.id??null;
}

export function nextOddJob(s,id) {
 const jobs=localJobs(s);
 if(!jobs.length)return null;
 const index=jobs.findIndex(job=>job.id===id);
 return jobs[(index+1)%jobs.length].id;
}

function requirement(s,job) {
 if(job.need==='gold')return {label:'Contribute to the commission',unit:'gold',amount:s.gold};
 if(job.need==='victory')return {label:'Win battles',unit:job.target===1?'victory':'victories',amount:s.flags.victories};
 return {label:'Bring back the keepsake',unit:job.keepsakeName,amount:s.bag.filter(id=>id===job.questItem).length};
}

export function oddJobsView(s,id,button,esc) {
 const jobs=localJobs(s),selected=jobs.find(job=>job.id===id)??jobs[0];
 if(!selected)return '<p>There are no odd jobs in this town.</p>';

 const complete=s.quests.includes(selected.id),need=requirement(s,selected);
 const ready=need.amount>=selected.target;
 const art=selected.questItem?itemById(selected.questItem,s):selected.need==='victory'?itemById('road-sword',s):
  {kind:'food',shape:'food',color:'#dfb879',name:'Food for the village'};
 const position=jobs.indexOf(selected)+1;
 return `<article class="oddjob-sheet" aria-labelledby="oddjob-title">
  <div class="oddjob-intro">
   <div class="oddjob-art" aria-hidden="true">${itemArt(art)}</div>
   <div>
    <h3 id="oddjob-title">${esc(selected.title)}</h3>
    <p class="oddjob-story">${esc(complete?selected.conclusion:selected.text)}</p>
   </div>
  </div>
  <dl class="oddjob-rewards">
   <div><dt>Recommended level</dt><dd>${number(selected.level)}</dd></div>
   <div><dt>Reward</dt><dd>${number(selected.reward)} gold + ${number(selected.xp||15)} XP</dd></div>
  </dl>
  ${complete?'<p class="oddjob-completed" role="status">✓ Completed</p>':`<div class="oddjob-requirement" data-ready="${ready}">
   <span>${esc(need.label)}</span><strong>${number(Math.min(need.amount,selected.target))} / ${number(selected.target)} ${esc(need.unit)}</strong>
  </div>`}
  <footer class="oddjob-actions">
   <div class="oddjob-navigation">${jobs.length>1?'<button type="button" data-next-odd-job>Next job <span aria-hidden="true">→</span></button>':''}
    <span>Job ${position} of ${jobs.length}</span>
   </div>
   ${complete?'':button('Turn in job',{type:'quest',id:selected.id},'primary',!ready)}
  </footer>
 </article>`;
}
