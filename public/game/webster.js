import {DUNGEONS, REGIONS, TOWNS} from './content.js';
import {AREAS, branchGates} from './exploration.js';
import {BOTTOMLESS_PIT, PIT_FLOORS} from './bottomless-pit.js';
import {dungeonFloors} from './dungeon-depths.js';
import {TREASURE_ITEMS} from './treasure.js';

export const WEBSTER_GREETINGS = [
  "Ask! I’m here for you.",
  "What is it now?",
  "Hit me, baby. I know it all.",
  "I knew you’d come crawling back to me. They always do."
];

const facts = [
  [/haghilda|hearth seal|elf fortress|elven village/, 'Haghilda is on level four of the abandoned elven village. She keeps the Hearth Seal upstairs, presumably so nobody can smell it from the road.'],
  [/pepper|snot/, 'Try the Holy Pepper Grenade from the dead elf on level three. It halves Haghilda’s toxic snot damage. There, I’ve saved your trousers.'],
  [/rock troll|witness bell/, 'The Rock Troll guards the Witness Bell on level ten of the Widow’s Bell. If you reach level nine and hear chewing, that’s encouragement.'],
  [/galen|skeleton key|sewer/, 'The big spider guards the skeleton key in the Royal Sewers. The key opens Galen’s cell. Have a look at the loose stones once you’ve freed him.'],
  [/boat|leviathan/, 'The boat amulet is in a chest at the bottom of the Drowned Conservatory. You’ll need it to reach the Leviathan Pump. Bring a mint for the fish.'],
  [/monument|shard|alien disk|medallion/, 'Take one piece from each ancient monument. Ten pieces assemble the disk and get you aboard the spacecraft. Yes, it takes all ten.'],
  [/hal\s*2000/, 'Play Blackjack against Hal 2000. The other two games are traps. Imagine losing your life to a trivia night.'],
  [/drake|firedrak/, 'Drake the Defiler holds captured dragons on level ten of Firedrak Mountain in the Cinder Dominion. He really should have picked a less obvious address.'],
  [/bottomless pit|balrog/, `The Bottomless Pit is in the ${AREAS.find(a => a.id === BOTTOMLESS_PIT.area).name}. The Balrog waits at the bottom, ${PIT_FLOORS} levels down. The elevator only works after you win. Miserable service.`],
  [/putrid palace|wang the nauseating/, 'Wang is on level 15 of the Putrid Palace in the Cinder Dominion. Bring fireball magic. The slugs hate it, and he has far too many slugs.'],
  [/bawb|sailboat/, 'Bawb the Boatbuilder makes roadside visits and sells a shrinkable sailboat for 700 gold. Accept the coffee before discussing the price.'],
  [/elevator scroll|dungeon elevator/, 'Read a Dungeon Elevator Scroll inside a regular dungeon to choose another floor or the surface. Apparently stairs are beneath you.'],
  [/teleporter crystal|alien artifact/, 'A Teleporter Crystal powers one trip from the glass Alien Artifact to a land you have already visited. It won’t show you anywhere new. What a shame.'],
  [/vampire|level drain/, 'Cemetery vampires temporarily drain levels when you fail a Constitution save. The levels come back. Your dignity might take longer.'],
  [/princess|bunnyfoot|malachi|royal court|bellwether/, 'Bring 500 gold in hand to get back into Bellwether Court. The king’s guards then offer you a complimentary stay in his dungeon.'],
  [/relic|border|exit gate/, 'Both relics from a land earn you passage through its gates. Or challenge the three level-50 guards, if you’re feeling particularly allergic to good advice.']
];

const normalize = text => text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const namedFact = (name, answer) => ({term: normalize(name).replace(/^the /, ''), answer});
const localKnowledge = [
  ...DUNGEONS.map((place, index) => namedFact(place.name, `${place.name} is at (${place.x}, ${place.y}) in ${REGIONS[place.region].name}. It has ${dungeonFloors({index})} levels. Do try to look like you found it yourself.`)),
  ...TOWNS.flatMap(town => [
    namedFact(town.name, `${town.name} is at (${town.x}, ${town.y}) in ${REGIONS[town.region].name}. Ask for ${town.npc} if you're actually staying.`),
    namedFact(town.npc, `${town.npc} is in ${town.name}. ${town.role}. Please try to remember the name.`),
  ]),
  ...AREAS.map(area => {
    const gate = branchGates(area.region).find(g => g.area === area.id);
    const answer = gate ? `Find ${area.name} through the ${gate.direction} gate in ${REGIONS[area.region].name}. Check the map before leaving.`
      : `The spacecraft can land on ${area.name}. Find a planetary teleporter or P-Hopper when you want to go home.`;
    return namedFact(area.name.split(',')[0], answer);
  }),
  ...REGIONS.map(region => namedFact(region.name.split(',')[0], region.description)),
  ...Object.values(TREASURE_ITEMS).filter(item => item.description && !item.alien)
    .map(item => namedFact(item.name, `${item.name}? ${item.description} Do keep up.`)),
].filter(fact => fact.term).sort((a, b) => b.term.length - a.term.length);

const bluffs = [
  'Try the last place anyone sensible would look. Naturally, that rules out wherever you were about to go.',
  'A trader once told me to follow the road until it bends, then take the route with the fewest witnesses. Traders are very wise after closing time.',
  'There’s a clue on the back of a sign somewhere. If there isn’t, you probably read the front too loudly.',
  'Ask at an inn after dark. Someone will know something, and if you pay for two drinks they may even tell you what it is.',
  'I’d start with a locked door and work backward. If that fails, try a different locked door. Look at me, practically doing the quest for you.'
];

export function websterAnswer(question, random = Math.random) {
  const query = normalize(question);
  if (random() < .05) {
    const fact = facts.find(([pattern]) => pattern.test(query));
    if (fact) return fact[1];
    const padded = ` ${query} `;
    const subject = localKnowledge.find(({term}) => padded.includes(` ${term} `));
    if (subject) return subject.answer;
  }
  return bluffs[Math.floor(random() * bluffs.length)];
}
