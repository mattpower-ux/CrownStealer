export const SNOUT_ENDING = 'snout';
export const MULTIVERSE_TUBE = {x:11,y:4};

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
  return '<article class="snout-scene snout-ending"><img src="/assets/snout-farmer.webp" alt="The adventurer, now a pig farmer in a leather apron and straw hat, stands beside a pile of hay"><div class="snout-story"><p>Over the years '+esc(s.name)+' reluctantly accepts this new reality. They learn the way of farming and become well known for their Pickled Potato Pie recipe.</p><p>The children love their funny stories about kings and princesses, but the adults just feel a little bad for them. They’re crazy, you know.</p><h3>THE END</h3></div><div class="panel-actions">'+(checkpointAvailable?'<button class="primary" data-load-checkpoint>Load previous checkpoint</button>':'')+'<button data-ending-title>Back to title</button></div></article>';
 }
 return '<article class="snout-scene"><img src="/assets/snout-cradle.webp" alt="Grandma and Grandpa Pig lean over the cradle"><p>You awaken in a cradle in the land of Snout, by the Svinehunt Sea in the far north.</p>'+pack+
  (stage === 'reply'
   ? '<p>A series of unfamiliar snorts, squeals and grunts come out of your face.</p><p>“He’s so clever,” says Grandma. “I bet he’ll outlive his parents,” says Grandpa. “May they rest in peace.” “Oink to that,” says Grandma.</p><div class="panel-actions">'+button('Continue',{type:'snoutEpilogue'},'primary')+'</div>'
   : '<div class="panel-actions">'+button('Tell your grandparents who you really are',{type:'snoutChoose',choice:'tell'},'primary')+button('Continue pretending you are a natural-born piglet',{type:'snoutChoose',choice:'pretend'})+'</div>')+'</article>';
}
