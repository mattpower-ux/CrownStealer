import assert from 'node:assert/strict';
import test from 'node:test';
import {SNOUT_EPILOGUE_REVEAL_MS,snoutEpilogueStory,snoutEpilogueView} from '../public/game/snout-ending.js';

test('Snout epilogue begins with THE END question and postpones both exits',()=>{
 assert.equal(SNOUT_EPILOGUE_REVEAL_MS,4000);
 assert.match(snoutEpilogueStory(),/you reluctantly accept this new reality/i);
 const view=snoutEpilogueView();
 assert.match(view,/THE END\?/);
 assert.doesNotMatch(view,/Wait, what does this scroll do\?/);
 assert.doesNotMatch(view,/Back to title/);
});
