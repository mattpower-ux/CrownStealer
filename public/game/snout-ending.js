export const SNOUT_EPILOGUE_REVEAL_MS=4000;

export function snoutEpilogueStory(){
 return '<p>Over the years, you reluctantly accept this new reality. You learn the way of farming and become well known for your Pickled Potato Pie recipe.</p><p>The children love your funny stories about kings and princesses, but the adults just feel a little bad for you. You’re crazy, you know.</p>';
}

export function snoutEpilogueView(){
 return '<article class="snout-scene snout-ending"><img src="/assets/snout-farmer.webp" alt="You, now a pig farmer in a leather apron and straw hat, stand beside a pile of hay"><div class="snout-story">'+snoutEpilogueStory()+'<button type="button" class="snout-end-question" data-snout-end-reveal>THE END?</button></div></article>';
}
