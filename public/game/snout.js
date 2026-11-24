export const SNOUT_ENDING = 'snout';
export const MULTIVERSE_TUBE = {x:11,y:10};
import {snoutEpilogueView} from './snout-ending.js';

export function atMultiverseTube(s) {
 const d = s?.dungeon;
 return s?.mode === 'dungeon' && d?.ship === true &&
  Math.abs(d.x - MULTIVERSE_TUBE.x) + Math.abs(d.y - MULTIVERSE_TUBE.y) <= 1;
}

export function snoutState(s) {
 return s?.mode === 'ending' && s.ending === SNOUT_ENDING;
}

export function snoutView(s, button, esc, checkpointAvailable) {
 const stage = s.flags.snoutStage;
 const pack = '<details class="snout-pack"><summary>Pack</summary><img src="/assets/snout-piglet.webp" alt="Your piglet portrait"><p>0 gold · No weapons · Empty bag</p></details>';
 if (stage === 'epilogue') {
  return snoutEpilogueView();
 }
 return '<article class="snout-scene"><img src="/assets/snout-cradle.webp" alt="Grandma and Grandpa Pig lean over the cradle"><p>You awaken in a cradle in the land of Snout, by the Svinehunt Sea in the far north.</p>'+pack+
  (stage === 'reply'
   ? '<p>A series of unfamiliar snorts, squeals and grunts come out of your face.</p><p>“He’s so clever,” says Grandma. “I bet he’ll outlive his parents,” says Grandpa. “May they rest in peace.” “Oink to that,” says Grandma.</p><div class="panel-actions">'+button('Continue',{type:'snoutEpilogue'},'primary')+'</div>'
   : '<div class="panel-actions">'+button('Tell your grandparents who you really are',{type:'snoutChoose',choice:'tell'},'primary')+button('Continue pretending you are a natural-born piglet',{type:'snoutChoose',choice:'pretend'})+'</div>')+'</article>';
}
