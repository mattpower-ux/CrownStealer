// Original campaign for CrownStealer. All locations use the 32 x 24 world grid.
// Quest targets are cumulative counts (victory/relic) or a gold contribution.
export const REGIONS = [
  {
    id: 0, name: 'The Hearthmarch', subtitle: 'A kingdom living on borrowed fire',
    palette: { water: '#173749', land: '#746d43', forest: '#344f3e', mountain: '#746b68', accent: '#edb45e' },
    description: 'Orchards, hungry villages and the white towers of Bellwether surround the dying royal furnace. King Osric IV insists the smoke is a seasonal phenomenon. It has been winter for three years.'
  },
  {
    id: 1, name: 'The Cinder Dominion', subtitle: 'The other half of the same wounded world',
    palette: { water: '#36354e', land: '#8a5140', forest: '#503d43', mountain: '#65545b', accent: '#f09259' },
    description: 'Beyond the old rebellion line, red plains and iron forests shelter a republic that inherited its enemy\'s prisons. Its people remember royal crimes accurately and their own rather more selectively.'
  },
  {
    id: 2, name: 'Pelagos, the Tidemoon', subtitle: 'An ocean world beneath a broken silver sky',
    palette: { water: '#214c69', land: '#819c97', forest: '#476c76', mountain: '#697b97', accent: '#b8eadc' },
    description: 'Floating salt cities circle an ocean which remembers every sound. The islanders trade in borrowed memories, cultivate coral engines and have excellent reasons to distrust visitors bearing crowns.'
  },
  {
    id: 3, name: 'The Hollow Star of Vesper', subtitle: 'A dead sun with people still inside',
    palette: { water: '#272f55', land: '#625d7b', forest: '#434361', mountain: '#9690aa', accent: '#e6b3e4' },
    description: 'Settlements cling to the inside of a star that burned itself empty. Gravity bells keep their feet on the ground. The engineers who once sold warmth to kings now ration the last hours of their artificial dawn.'
  }
];

export const TOWNS = [
  {
    id: 'mothbridge', name: 'Mothbridge', region: 0, x: 6, y: 7,
    npc: 'Nell Soot', role: 'Publican and unofficial mayor',
    greeting: 'Nell pushes a bowl across the counter. "First meal is charity. Second is credit. Third makes you family, which is how I get people to fix the roof." Behind her, an eviction notice serves as a very poor draught excluder.',
    rumor: 'The crown keeps counting sacks of grain that never arrive. Nell saw a wagon turn toward the Tithe Vault after its driver swore he was taking flour to the capital.',
    quest: 'Help the village bury its winter debts, then investigate the sealed Tithe Vault. Nell asks for receipts as well as heroics: she has seen what kings do with an undocumented miracle.'
  },
  {
    id: 'bellwether', name: 'Bellwether Court', region: 0, x: 24, y: 7,
    npc: 'Princess Mara', role: 'Heir, engineer and reluctant royal accountant',
    greeting: 'Princess Mara has oil on her cuffs and three ceremonial swords holding down a diagram. "Father requires a champion. I require somebody capable of reading a warning sign. These requirements have rarely overlapped."',
    rumor: 'King Osric has commissioned a portrait of himself defeating the cold. Court magician Ilex asked the painter to leave space for a probable explosion. Captain Brann has quietly moved the palace children to the southern gate.',
    quest: 'Recover the two Hearthmarch relics and bring their testimony to court. Mara needs access to the furnace records before Osric can proclaim another highly flammable national holiday.'
  },
  {
    id: 'gallows-fair', name: 'Gallows Fair', region: 0, x: 16, y: 18,
    npc: 'Madam Vell', role: 'Proprietor of the Last Laugh casino',
    greeting: 'Madam Vell bows beneath a chandelier made from decommissioned manacles. "Dice, cards, wheel. Three respectable ways to be disappointed. The crown has a fourth, but we do not discuss tax at the tables."',
    rumor: 'A losing royal courier pawned a copper moon chart. Vell kept it because its stars move when nobody watches. She also kept his boots, which are less interesting but more immediately useful.',
    quest: 'Follow the courier\'s trail to the Widow\'s Bell. Vell offers ordinary paid work as well as wagers; she says any business which needs its customers dead has misunderstood repeat custom.'
  },
  {
    id: 'redhaven', name: 'Redhaven', region: 1, x: 6, y: 6,
    npc: 'Captain Brann Vale', role: 'Royal guard captain and former rebel',
    greeting: 'Brann wears his royal badge backwards. "Diplomatic mission," he says. "The badge is technically diplomatic too. It is presently negotiating with my shirt." He has already arranged beds for the refugees outside the gate.',
    rumor: 'The Dominion\'s censors have removed every reference to the hunger years except their own victory speeches. Brann remembers carrying royal orders through these streets, and refuses to call that ancient history.',
    quest: 'Find the witness records beneath the Brass Tribunal. Brann can escort testimony across the border, but asks that no village pay for his attempt to settle his conscience.'
  },
  {
    id: 'iron-choir', name: 'Iron Choir', region: 1, x: 24, y: 8,
    npc: 'Dema Ninefingers', role: 'Union furnace keeper',
    greeting: 'Dema inspects your hands before your weapons. "Useful fingers. Try to keep them. Management calls lost limbs voluntary contributions, and I hate doing the paperwork twice." The workers behind her sing to time the furnace valves.',
    rumor: 'The Ember Aqueduct carries warmth uphill without a pump. When a shift goes missing, the flow increases. Dema has stopped believing the superintendent\'s explanations about unusually motivated coal.',
    quest: 'Break the overseer\'s hold on the aqueduct and recover its source. Dema needs proof of the machinery\'s purpose before frightened workers will dare shut it down.'
  },
  {
    id: 'ash-market', name: 'Ash Market', region: 1, x: 16, y: 19,
    npc: 'Sable Quill', role: 'Printer, smuggler and casino dealer',
    greeting: 'Sable deals cards over a freshly printed edition of the banned news. "The house edge is public information. Which puts us ahead of parliament." Under the table a small press stamps travel permits for people who cannot afford official freedom.',
    rumor: 'Ilex bought passage here years before the borders reopened. He paid in a coin minted on no known continent, then asked the bookseller which histories were easiest to burn.',
    quest: 'Protect Sable\'s witness network and assemble the four earthly relics. Her smugglers know an outlaw route to the same transit gate the palace claims as royal property.'
  },
  {
    id: 'salt-choir', name: 'Salt Choir', region: 2, x: 7, y: 6,
    npc: 'Archivist Thessa', role: 'Keeper of spoken memories',
    greeting: 'Thessa raises a shell to your ear. A child inside it asks whether the visitors have brought back the sun. "That memory is eighty years old," she says. "Please consider your answer before adding a newer disappointment."',
    rumor: 'Pelagos once sent warmth to your world under a treaty signed by a king who promised it was temporary. The living sea still repeats his signature whenever the tide is low.',
    quest: 'Enter the Drowned Conservatory and recover the Tideglass Lens. Thessa wants you to hear the original treaty, including the clauses your royal archive carefully mislaid.'
  },
  {
    id: 'lantern-raft', name: 'Lantern Raft', region: 2, x: 25, y: 9,
    npc: 'Ferryman Oru', role: 'Pilot of the wandering town',
    greeting: 'Oru ties the whole settlement to a buoy. "We migrated six inches last night. A triumph for the housing committee." Lanterns hang below the deck, guiding creatures large enough to mistake the town for a biscuit.',
    rumor: 'The Leviathan Pump wakes whenever a stranger dreams of home. Its keeper can distinguish homesickness from honest navigation, which is more than most customs officers manage.',
    quest: 'Reach the Leviathan Pump and reclaim the Bone Compass. Oru asks you to leave the moon a route to safety instead of merely taking the route you need.'
  },
  {
    id: 'pearl-defiance', name: 'Pearl Defiance', region: 2, x: 15, y: 19,
    npc: 'Admiral Minn', role: 'Retired admiral of a fleet of one',
    greeting: 'Admiral Minn salutes with a teacup. "Our defensive navy is a bathtub with principles. Our offensive navy is the same bathtub after lunch." Her harbour shelters families whose islands vanished beneath the treaty machines.',
    rumor: 'A metal star fell into the western water and asked for a repair estimate. Its passenger called herself the final customer of the sun. Minn has learned to charge interplanetary emergencies in advance.',
    quest: 'Help fund the refugee flotilla and gather six relics. Minn will carry witnesses through the gate so the homeworld cannot dismiss Pelagos as a rumour with expensive demands.'
  },
  {
    id: 'last-dawn', name: 'Last Dawn', region: 3, x: 6, y: 7,
    npc: 'Magister Ilex', role: 'Royal magician and exiled solar engineer',
    greeting: 'Ilex has removed the stars from his robe. "Professional embarrassment," he says, folding it inside out. "Most magicians merely pull a rabbit from a hat. I sold the hat\'s structural integrity to a monarchy." He finally looks his age.',
    rumor: 'Vesper was hollowed to build the royal furnace. Its people expected payment in restored dawns. Ilex returned with medals, apologies and none of the promised machinery.',
    quest: 'Find the Quiet Anvil in the Clockwork Sepulchre. Ilex can explain how to unmake the crown, but he cannot ask Vesper\'s people to trust his explanations again.'
  },
  {
    id: 'hinge-town', name: 'Hinge Town', region: 3, x: 25, y: 7,
    npc: 'Vera-of-the-Hinges', role: 'Elected mechanic of gravity',
    greeting: 'Vera tightens a bolt in the horizon. "If the sky falls, step left. That is the official procedure. We wanted something longer, but the ink floats." Each doorway has a bell, and each bell has a child assigned to listen.',
    rumor: 'The Parliament of Ash is still voting on whether the star has died. Its immortal speaker considers the lack of sunrise an opposition tactic. Somewhere below its chamber, the last relic keeps recording the names of the missing.',
    quest: 'Bring seven relics and testimony from both worlds to the Parliament of Ash. Vera wants the Empty Crown disconnected without dropping her town into the sky.'
  },
  {
    id: 'noonless-quay', name: 'Noonless Quay', region: 3, x: 16, y: 19,
    npc: 'Auditor Pell', role: 'Customs officer for lost things',
    greeting: 'Pell examines your shadow. "One person, one shadow, several unresolved obligations. Welcome. We charge nothing for emotional baggage, which has bankrupted the quay." His ledger includes ships, seasons and a column headed Unreturned Children.',
    rumor: 'Princess Mara sent a message through the broken gate: the king has declared you either the saviour or the enemy, depending on which portrait finishes first. Brann is keeping the city gates open for civilians.',
    quest: 'Prepare the return passage and decide who gets to hold the eight relics. Pell requests a written answer, because last time somebody said trust me the local sun acquired a mortgage.'
  }
];

export const DUNGEONS = [
  { id: 'tithe-vault', name: 'The Tithe Vault', region: 0, x: 12, y: 11, relic: 'Hearth Seal', boss: 'The Bailiff of Bones', description: 'Under a granary with no grain, shelves hold the names of debtors whose labour feeds the royal furnace. The Bailiff of Bones stamps fresh demands with a hand borrowed from its first victim. Find the Hearth Seal beneath the account books and learn who has been paying for the palace fires.' },
  { id: 'widows-bell', name: 'The Widow\'s Bell', region: 0, x: 23, y: 17, relic: 'Witness Bell', boss: 'The Mourning Sexton', description: 'This buried bell tower rang throughout the failed rebellion, although every rope had been cut. Its passages repeat the last sentences of those buried without a trial. The Mourning Sexton insists silence is a public service; the Witness Bell keeps the names the crown struck from its history.' },
  { id: 'brass-tribunal', name: 'The Brass Tribunal', region: 1, x: 11, y: 12, relic: 'Mercy Key', boss: 'Justice Without Eyes', description: 'A courthouse sunk beneath Redhaven still conducts trials after the judges\' deaths. Every verdict was approved before the prisoners arrived. Somewhere below the cells, Justice Without Eyes guards the Mercy Key, a device which can open any sentence except the ones people impose on themselves.' },
  { id: 'ember-aqueduct', name: 'The Ember Aqueduct', region: 1, x: 24, y: 18, relic: 'Cinder Heart', boss: 'The Furnace Regent', description: 'Hot channels wind through the roots of an iron forest. The Furnace Regent calls its captives essential components and its screams an acceptable operating noise. The Cinder Heart controls a conduit stretching far beyond the sky; stopping the machine will expose what the rebellion\'s successors chose to preserve.' },
  { id: 'drowned-conservatory', name: 'The Drowned Conservatory', region: 2, x: 11, y: 12, relic: 'Tideglass Lens', boss: 'The Curator of Drownings', description: 'Air bells fill abandoned classrooms on the ocean floor. Students\' voices survive in coral cylinders, rehearsing a treaty that promised rescue and delivered extraction. The Curator of Drownings tends a garden of confiscated memories. Its Tideglass Lens can show the original terms, even to someone determined to misunderstand them.' },
  { id: 'leviathan-pump', name: 'The Leviathan Pump', region: 2, x: 24, y: 18, relic: 'Bone Compass', boss: 'The Pilot Beneath', description: 'A stranded creature large enough to shelter cities has been fitted with valves and a navigation throne. The Pilot Beneath steers its sleeping body through possible futures. The Bone Compass marks a route through the dead star, but the machinery was designed to carry refugees too, before kings discovered more profitable cargo.' },
  { id: 'clockwork-sepulchre', name: 'The Clockwork Sepulchre', region: 3, x: 11, y: 12, relic: 'Quiet Anvil', boss: 'The Last Foreman', description: 'Engineers who built a conduit through a sun lie inside the machines they could not afford to stop. Their clocks continue charging for overtime. The Last Foreman guards the Quiet Anvil, which can separate power from ownership. Old maintenance notes record Ilex\'s signature on the original fatal calculations.' },
  { id: 'parliament-of-ash', name: 'The Parliament of Ash', region: 3, x: 24, y: 18, relic: 'Empty Crown', boss: 'The Unanimous King', description: 'Seats rise around an audience chamber open to the star\'s cold heart. Every delegate wears the face of the same dead monarch. The Unanimous King has abolished dissent by consuming the dissenters. The Empty Crown at its centre binds the eight devices together, waiting for someone to mistake possession for permission.' }
];

export const CHAPTERS = [
  {
    title: 'A Bowl Against the Winter',
    text: 'You arrive in Mothbridge with a weapon worth less than the bread you have been avoiding buying. Nell Soot feeds you anyway. Outside, the royal tax wagon rolls past a queue of people too hungry to heckle it properly. Its driver carries a warrant for grain the village never grew. Nell says the king has always collected money, but only lately begun collecting tomorrow. The hearth behind her burns blue when the wagon passes. A girl offers you a moth preserved in wax: it was the last thing to fly out of the sealed granary. You can sell your strength, trust your luck at Gallows Fair, or make yourself useful to people who remember their debts. Whatever path you take, provision yourself before you follow the wagon. An empty stomach is an exceptionally bad political adviser.',
    objective: 'Speak to Nell in Mothbridge, secure provisions and follow the tithe road to the vault east of town.'
  },
  {
    title: 'Receipts for the Missing',
    text: 'The Tithe Vault contains no harvest. Its lower chambers contain names, each marked with an amount of warmth and a date of expiry. The Bailiff of Bones tells you that the system is merciful: nobody receives a second bill after death. Beneath its desk lies the Hearth Seal, warm enough to blister the leather around it. When you lift it, the blue furnace light turns briefly human. Nell recognises several names in the ledger, including her husband\'s. She believed he deserted her during the hunger years and has spent a decade practising the speech she would give if he returned. Now she folds the speech into kindling. The seal carries the palace mark, but an older emblem shows through the gold: an open hand holding eight small fires. Someone turned a public work into a royal possession.',
    objective: 'Recover the Hearth Seal from the Tithe Vault and take its ledger to the people who remember the missing.'
  },
  {
    title: 'The House Always Knows',
    text: 'Gallows Fair is holding its annual Festival of Improved Prospects. The posters have been reused for nineteen years. Madam Vell gives you a table with a view of every exit and explains that a royal courier lost a moon chart here. He never wagered the chart; he merely left it under his chair when the guards carried him out. There is a difference, she says, because a proprietor must maintain standards. The copper map points toward the Widow\'s Bell, a place the crown says was demolished before anybody now living was born. Vell was born there. She remembers a bell sounding while soldiers held its rope still. Her games may cost you gold, but their rules can be inspected. She would like the kingdom to adopt this radical innovation.',
    objective: 'Visit Gallows Fair, hear Vell\'s account and seek the buried Widow\'s Bell in the southeastern Hearthmarch.'
  },
  {
    title: 'A Bell With No Rope',
    text: 'At the bottom of the Widow\'s Bell, the Mourning Sexton has arranged the dead by the offences listed in their warrants. It has run out of shelves for suspected intent. The Witness Bell answers when the Hearth Seal approaches: a thousand statements rise together, then quiet enough for one woman to finish saying her son\'s name. The rebellion was neither the simple massacre of the royal histories nor the clean victory of rebel songs. Both armies fed prisoners into a machine they were too frightened to switch off. Vell listens to a recording of her mother and closes the casino for an hour. Her staff are so alarmed they check her pulse. When she reopens, the house takes no wagers on the dead. You now possess evidence powerful people have already killed to keep separate.',
    objective: 'Claim the Witness Bell, reunite the two Hearthmarch relics and carry their testimony to Bellwether Court.'
  },
  {
    title: 'His Majesty Requests Applause',
    text: 'King Osric IV receives you beneath a painting of himself receiving somebody else. He congratulates you on proving the efficiency of royal administration. Princess Mara corrects him: you have proved a considerable number of murders. Captain Brann closes the doors before the courtiers can applaud the wrong sentence. Osric remembers his father\'s furnace as the thing which ended the winter, and cannot understand why gratitude has an expiry date. Mara has examined its pipes. They do not end beneath the palace. Ilex, the court magician, recommends that nobody touch anything until he has had an opportunity to leave the room. Brann produces a road pass for Redhaven, then puts a second unsealed copy inside your boot. He says the first is for officials; the second is for the day officials become the problem.',
    objective: 'Bring the first two relics to court, hear Mara\'s findings and open the road into the Cinder Dominion.'
  },
  {
    title: 'The Border Has Two Stories',
    text: 'Redhaven has a monument to liberation and a prison with the same architect. Brann once fought here under a rebel banner, then accepted royal service when the peace promised an amnesty. The amnesty covered officers. He is only now learning how many private soldiers it left behind. A Dominion clerk offers to correct the record for a fee large enough to make history financially sustainable. Sable Quill has printed the uncorrected version in Ash Market and needs witnesses who can survive the trip to read it aloud. Royal patrols call you an agent of rebellion; Dominion patrols call you an agent of the crown. Both are willing to search your bags. Brann says the advantage of being accused by everyone is that, for once, nobody can honestly claim you failed to consult both sides.',
    objective: 'Explore Redhaven and Ash Market, learn the border routes and find the entrance to the Brass Tribunal.'
  },
  {
    title: 'Judgement Before Breakfast',
    text: 'The Brass Tribunal still lists tomorrow\'s convictions on its noticeboard. Justice Without Eyes explains that this spares defendants the distress of uncertainty. In the deepest cell, the Mercy Key hangs inside a lock which has forgotten it was built to open. The Witness Bell speaks the names of those held there, and for a moment the whole court must listen. Among them is Brann\'s younger brother, sentenced by a judge wearing a rebel sash and using a royal warrant. Brann does not ask you to forgive either government. He asks you to make the records public. The key releases a memory of the original builders: eight communities voting together to share an engine. None of their plans includes a throne. The crown was added later, as a convenient way to make one signature count for eight.',
    objective: 'Recover the Mercy Key from the Brass Tribunal and return the prisoner records to Redhaven.'
  },
  {
    title: 'The Factory of Suitable Sacrifices',
    text: 'At Iron Choir, Dema Ninefingers reads the aqueduct\'s operating figures and counts the missing workers on her remaining hand. The Furnace Regent calls them volunteers. It has never encountered a refusal it could not revise into consent. The Cinder Heart pulses at the centre of its machinery, sending stolen heat along a line which crosses the stars. Releasing it does not restore the dead. It does stop the next shift becoming fuel. Dema demands a promise that the palace will not simply install a more charming overseer. Sable publishes the demand, along with your name, so that later forgetfulness will require an unusually public effort. When the four earthly relics meet, their reflections form an ocean beneath a silver moon. Ilex recognises the view and drops the pretence that this is merely a local engineering dispute.',
    objective: 'Defeat the Furnace Regent, recover the Cinder Heart and assemble the four homeworld relics.'
  },
  {
    title: 'A Princess Takes Inventory',
    text: 'Mara has moved her desk into the royal furnace room, where there are fewer courtiers and better tools. She lays the four relics in a circle. They display a contract signed by Osric\'s grandfather, Dominion founders and a younger Ilex. The homeworld received winter relief; two distant worlds received debts labelled temporary. Osric demands to know why the document does not call him magnificent. Mara replies that it is a technical drawing. When the furnace opens a gate to Pelagos, the king orders you to secure new fuel. Mara asks you to discover what fuel means on the other side. If the palace has become hostile to you, Sable\'s smugglers can reach the gate from below. A government may withdraw its invitation, she says, but it has no exclusive patent on going through a hole.',
    objective: 'Use the four relics to unlock passage to Pelagos, through the palace or the smugglers\' route.'
  },
  {
    title: 'The Sea Remembers Your Name',
    text: 'Pelagos smells of rain on warm stone, although nobody remembers the last warm stone. The people of Salt Choir recognise the royal emblem on your equipment and stop speaking. Archivist Thessa plays the greeting your world sent eighty years ago: a cheerful promise of shared prosperity, followed by shipping instructions for equipment which could never be returned. The Tidemoon has been subsidising your winter with its tides. Islands fall whenever the conduit draws too hard. Thessa is courteous enough to offer you water, then blunt enough to explain which drowned settlement once stood above the cup. She will guide you to the Drowned Conservatory because witnesses deserve an audience. She does not confuse that decision with forgiveness. Your first task here is to listen long enough that home ceases to be an excuse.',
    objective: 'Meet Thessa in Salt Choir and seek the treaty memories inside the Drowned Conservatory.'
  },
  {
    title: 'The Fine Print Beneath the Water',
    text: 'The Curator of Drownings has preserved every beautiful thing the extraction destroyed, provided it was small enough to fit in a jar. The Tideglass Lens is too large for its shelves. Through it you watch the treaty signing: Pelagos agreed to lend surplus tide power for one season, with renewal requiring all eight communities. A royal official removed the renewal mechanism before the first shipment. Ilex noticed. He certified the machine anyway because he believed a prosperous kingdom would eventually repay its debt. Thessa watches his signature without comment, which is worse than a curse. A final recording reveals that the conduit begins in Vesper, a living star being slowly emptied. Replacing one victim with another will keep your palace warm. The records are quite clear about that, and equally clear that it has been tried before.',
    objective: 'Recover the Tideglass Lens and reveal the original treaty, including its missing right of refusal.'
  },
  {
    title: 'A Navy With a Teakettle',
    text: 'At Pearl Defiance, Admiral Minn has converted her retirement house into fleet headquarters. The fleet currently consists of a lifeboat, a salvage barge and a navy bathtub she insists is a coastal vessel. Her jokes keep frightened children laughing while Oru charts the next island expected to sink. A machine fallen from Vesper carries a route through the hollow star, but the Bone Compass needed to read it lies inside the Leviathan Pump. Oru knows the creature beneath the pump is still alive. The machinery was meant to transport whole settlements away from danger; its navigation throne now serves the extraction line. Minn wants that purpose restored. She offers you command of nothing and responsibility for quite a lot, which is the most honest promotion you have received since entering royal service.',
    objective: 'Visit Lantern Raft and Pearl Defiance, prepare the refugee flotilla and enter the Leviathan Pump.'
  },
  {
    title: 'The Creature That Carried Cities',
    text: 'The Pilot Beneath sits on a throne sunk into living bone. It calls every course home, regardless of who survives the journey. When you free the Bone Compass, the leviathan dreams of the islands it once carried and changes direction for the first time in eighty years. Six relics now show a safe passage into Vesper. They also show the route the refugee fleet will need if the tide machines fail. Oru copies both. Back in Salt Choir, Thessa records your explanation in a fresh shell and makes you listen to it before she files it. Promises sound different when heard from outside your own head. A message from Mara arrives through the gate: Osric has announced a victory banquet. She has sent you an estimate of how many planetary emergencies the banquet could feed.',
    objective: 'Claim the Bone Compass, unite six relics and open the route to Vesper while preserving the refugee passage.'
  },
  {
    title: 'A Sun Turned Inside Out',
    text: 'Vesper has no horizon that behaves politely. Towns hang above you, and bells pull your boots against the inside of a dead star. Vera-of-the-Hinges welcomes you with a wrench and the location of the nearest shelter. Ilex is waiting at Last Dawn. He used to live here before his calculations found a market at court. He believed the star held centuries of surplus fire. The error was not arithmetic: he counted the people living inside it as an acceptable cost. His own family is among the names on Pell\'s ledger. You may accept his help without granting the absolution he would prefer. The Quiet Anvil can break the machine\'s ownership bond. It lies with the engineers who tried to warn him, in a factory whose memorial still bills their descendants for missed shifts.',
    objective: 'Reach Last Dawn, hear Ilex\'s confession and locate the Clockwork Sepulchre beneath the gravity bells.'
  },
  {
    title: 'Overtime for the Dead',
    text: 'The Clockwork Sepulchre has kept its workers at their stations long after their hands became dust. The Last Foreman knows the machine is killing the star. Stopping production would admit that it had been wrong to begin, and it has spent eighty years becoming less capable of that admission. The Quiet Anvil rests on a bench beside a rejected safety report. Ilex\'s signature appears beneath the rejection. The anvil does what the treaty promised: it separates the machinery from the authority of whoever claims to own it. Seven relics can therefore stop the extraction. They cannot decide how warmth should be shared afterward. Vera listens to the distinction and calls a town meeting. If the future requires sacrifice, she says, the people making it would like to be in the room.',
    objective: 'Defeat the Last Foreman, recover the Quiet Anvil and bring seven relics back to Vesper\'s settlements.'
  },
  {
    title: 'The Parliament of One Man',
    text: 'The Parliament of Ash surrounds you with portraits which are also the delegates. Long ago, Vesper\'s ruler joined his mind to the furnace so his people would never lack guidance. He later amended people to mean himself. The Unanimous King speaks through every chair and calls this perfect agreement. The Empty Crown links his stolen voices to the eight devices. The Witness Bell makes them audible separately. For a moment, parliament sounds like an argument again: grief, fury, bad jokes and one persistent request for a window. You break the ruler\'s hold and recover the final relic. It offers you the same arrangement, translated into more flattering language. Your new power can end a winter or make an obedient kingdom. The device regards the difference as somebody else\'s department.',
    objective: 'Enter the Parliament of Ash, defeat the Unanimous King and gather the eighth relic, the Empty Crown.'
  },
  {
    title: 'Eight Fires and No Owner',
    text: 'With all eight relics assembled, the Empty Crown reveals its oldest instruction: the engine belongs to the communities which maintain it. Each relic is a vote, a tool and a record. No prophecy selected you. You happened to become the person carrying the meeting. Thessa asks for the right to disconnect. Vera asks for repairs before ceremonies. Dema asks that nobody use the word volunteer without checking the answer. Ilex offers a plan which will end the forced extraction and leave smaller, local furnaces. It will require work, shortages and agreements that can be refused. Osric\'s plan requires only you to put on the crown and trust him. Pell enters both proposals into his ledger, leaving a generous column for consequences. The way home is open. The people you met intend to follow.',
    objective: 'Carry all eight relics to the return gate and prepare to decide the furnace\'s ownership at Bellwether.'
  },
  {
    title: 'Home Has Been Taking Notes',
    text: 'Bellwether has changed while you were away. The gates hold queues of refugees, angry farmers and nobles pretending to be both. Brann has ordered the guards to protect the queues instead of the treasury. If you helped the towns, their witnesses arrive carrying food and copies of Sable\'s newspaper. If you terrorised them, shutters close before you pass and the witnesses speak from behind Brann\'s shield. Neither situation erases what happened. Mara meets you beside the furnace with a delegation from both distant worlds. She will negotiate a settlement, and she will oppose a throne built on their silence. Osric has ordered a triumphal arch wide enough for his portrait. It blocks the relief wagons. Vell pays two carpenters to dismantle it and sends the king a bill headed Emergency Reduction of Magnificence.',
    objective: 'Return to Bellwether, meet Mara and the arriving witnesses, and bring the relics to the royal furnace.'
  },
  {
    title: 'The Weight of a Warm Room',
    text: 'The furnace chamber is warmer than any room you have entered on either distant world. That small fact quiets the argument. Osric offers rank, land and a place in the royal family if the old supply can be secured. Mara places a draft charter beside his offer. Any alliance with her, including a marriage, requires her agreement and gives Pelagos and Vesper their own signatures. The rebels offer an assembly with no hereditary seat. Exile would let you carry the crown beyond every government\'s reach and leave the local furnaces in public hands. You can also compel the court to kneel. The machinery will obey that choice. Brann rests his helmet on the table; he has followed enough beautifully phrased orders. Everyone waits to learn what you think power is for when the room is already comfortable.',
    objective: 'Choose alliance, rebellion, exile or usurpation after hearing the court\'s offers and the worlds\' demands.'
  },
  {
    title: 'The Morning After the Miracle',
    text: 'There is no final spell that repairs a roof, compensates a widow or teaches a royal accountant to count a foreign life. The relics have stopped drawing warmth without consent. What follows depends on the settlement you made and the habits you practised getting here. Nell opens her kitchen. Dema restarts a furnace built to heat its own town. Thessa adds this testimony to the sea, taking care to include the parts you would rather omit. Vera rings a gravity bell and hears it answered from the next settlement. Mara writes the first order of the new government, or the first letter of resistance to yours. Vell opens the Last Laugh with a new rule posted above the tables: no wagers on whether tomorrow will come. The odds, she says, are finally too interesting to put a price on.',
    objective: 'Resolve the crown\'s future, read the consequences of your chosen ending and return to a changed world.'
  }
];

export const SIDE_QUESTS = [
  {
    id: 'soup-before-statues', town: 'mothbridge', title: 'Soup Before Statues', need: 'gold', target: 20, reward: 30,
    text: 'Nell has been ordered to contribute to a statue of the king feeding the poor. The actual poor would prefer a cauldron. Put twenty gold toward her winter kitchen and she will pass on the village collection intended for ceremonial bunting.',
    conclusion: 'The kitchen opens beneath the unfinished statue plinth. Somebody paints SPOON FIRST on the stone. Nell pays you from the bunting fund, having decided that six pennants were an excessive expression of national wellbeing.'
  },
  {
    id: 'the-husband-in-the-ledger', town: 'mothbridge', title: 'A Name With No Grave', need: 'relic', target: 1, reward: 45,
    text: 'Nell wants to know whether the Tithe Vault\'s debtor records include Tomas Soot. She has no heirloom to offer you and no revenge to commission. She wants an answer she can tell her daughter without inventing a kindly ending.',
    conclusion: 'The Hearth Seal confirms the entry. Nell sits down before reading it twice. She buys a marker with his name and pays you for bringing the truth home. Later the village begins marking the other names too.'
  },
  {
    id: 'boots-for-the-gate', town: 'bellwether', title: 'Boots for the Gate', need: 'gold', target: 35, reward: 50,
    text: 'Brann\'s recruits have parade plumes and split boots. The treasury considers this an acceptable distribution of military splendour. Mara asks you to cover an emergency cobbler\'s bill while she extracts the cost from the royal portrait allowance.',
    conclusion: 'New soles arrive before the next patrol. Mara repays you with a small fee and an unusually satisfying receipt: His Majesty, heroic additional left hand, cancelled. Brann promises the recruits will remember who noticed the mud.'
  },
  {
    id: 'an-unflattering-history', town: 'bellwether', title: 'An Unflattering History', need: 'relic', target: 2, reward: 65,
    text: 'Mara cannot audit the furnace while the court archive insists every victim was a foreign invention. Bring enough relic evidence to make the archive\'s preferred explanation collapse under its own elaborate footnotes.',
    conclusion: 'The Witness Bell speaks inside the archive. The chief historian asks whether truth requires a new edition number. Mara says yes, hands him a pen and makes a space for the people who were removed from the first one.'
  },
  {
    id: 'a-clean-table', town: 'gallows-fair', title: 'A Clean Table', need: 'victory', target: 3, reward: 55,
    text: 'Vell\'s suppliers are afraid to travel after attacks on the fair road. Demonstrate that you can survive three victories and she will hire you as a recognised escort. Honest work, she says, is a useful supplement to gambling and a much better foundation for it.',
    conclusion: 'Vell adds your name to the escort board. Her dealers remove the funeral betting sheet somebody posted beneath it. "Professional confidence," she says, paying you. "We can hardly advertise safe roads and take the other side of the wager."'
  },
  {
    id: 'the-dealers-daughter', town: 'gallows-fair', title: 'The Dealer\'s Daughter', need: 'gold', target: 45, reward: 60,
    text: 'A young dealer has pawned her father\'s tools to pay for medicine. Vell will buy them back, but the pawnbroker refuses casino coin after a personal disagreement with probability. Supply forty-five gold from outside the house tills.',
    conclusion: 'The tools return in an oiled cloth. Vell repays your contribution and adds an escort fee. The dealer teaches her father the wheel game that evening; he loses two buttons and accuses the universe of favouritism.'
  },
  {
    id: 'amnesty-in-small-print', town: 'redhaven', title: 'Amnesty in Small Print', need: 'relic', target: 3, reward: 85,
    text: 'Brann needs the Tribunal\'s prisoner register to challenge an amnesty which pardoned commanders and quietly abandoned everyone who followed them. Three relics should hold enough testimony to open the sealed records.',
    conclusion: 'The Mercy Key releases the register. Brann reads his brother\'s name, then takes the entire list to the public square. His speech is short: he helped enforce a lie, and the families are owed more than his sorrow.'
  },
  {
    id: 'tents-without-flags', town: 'redhaven', title: 'Tents Without Flags', need: 'gold', target: 60, reward: 80,
    text: 'Refugees at the border are divided into royal and rebel queues, neither of which reaches the available shelter. Contribute to a common tent fund while Brann persuades two proud officials to tolerate a dangerously unpatriotic roof.',
    conclusion: 'The tents go up without insignia. Both officials claim the achievement in their reports. Brann pays you from the garrison relief purse and lets them argue: for once their argument is keeping somebody warm.'
  },
  {
    id: 'the-ninefinger-pension', town: 'iron-choir', title: 'The Ninefinger Pension', need: 'gold', target: 70, reward: 95,
    text: 'Dema\'s disability fund is short after the superintendent reclassified severed fingers as worker negligence. Pay for this week\'s support while the union appeals. Dema has assembled a vigorous legal argument and is polishing its handle.',
    conclusion: 'The injured workers receive their stipends. Management discovers that the appeal is supported by every furnace crew. Dema repays you from the released pension fund and retires her legal handle to ordinary carpentry.'
  },
  {
    id: 'names-on-the-valves', town: 'iron-choir', title: 'Names on the Valves', need: 'relic', target: 4, reward: 110,
    text: 'Dema asks for evidence from the aqueduct before she shuts the workers\' only source of heat. Bring four relics so she can distinguish a safe repair from an order to freeze nobly for somebody else\'s principles.',
    conclusion: 'The Cinder Heart reveals which valves serve the conduit and which warm the homes. Dema isolates the first and keeps the second. The workers erect a small plaque listing the dead, with no room reserved for a superintendent.'
  },
  {
    id: 'ink-under-the-door', town: 'ash-market', title: 'Ink Under the Door', need: 'gold', target: 80, reward: 105,
    text: 'Sable\'s witnesses need permits, paper and a press roller the censors cannot identify by its defects. Finance a quiet replacement. The news, she says, should be difficult to suppress and easy to read even after somebody steps on it.',
    conclusion: 'A fresh edition appears under doors throughout the market. Sable pays you from subscriptions collected before the raids. Its front page names the victims; the advertisement below offers a very reasonable price on obsolete official denials.'
  },
  {
    id: 'a-courier-who-returns', town: 'ash-market', title: 'A Courier Who Returns', need: 'victory', target: 8, reward: 120,
    text: 'The smuggling network needs a courier whose references include coming back alive. Survive eight victories and Sable will entrust you with the route marks used by families fleeing both sides of the border.',
    conclusion: 'Sable hands over the marks, printed on an aggressively dull tax circular. "Nobody reads these voluntarily." The courier purse includes your fee and a note from a family already across: all five of us arrived.'
  },
  {
    id: 'the-memory-of-a-shore', town: 'salt-choir', title: 'The Memory of a Shore', need: 'relic', target: 5, reward: 135,
    text: 'Thessa has a shell recording which stops before a child names the island where she lived. The Tideglass Lens may recover the missing words. Bring five relics so the archive can restore a place the maps now label open water.',
    conclusion: 'The Lens restores the island\'s name and the sound of its market. Thessa files it where descendants can hear it. She pays the archive\'s research fee, then takes the shell home to her grandfather, who has been waiting for that voice.'
  },
  {
    id: 'a-school-above-water', town: 'salt-choir', title: 'A School Above Water', need: 'gold', target: 95, reward: 125,
    text: 'The youngest archivists learn in a room that floods at high tide. Thessa wants floats, rope and a roof which does not require an argument with the sea. Contribute to a classroom that can follow the water instead of surrendering to it.',
    conclusion: 'The classroom rises with the tide. Its first lesson concerns the difference between a loan and a gift, a subject the children grasp surprisingly quickly. Thessa repays you from the mainland reconstruction subscription.'
  },
  {
    id: 'the-raft-repair', town: 'lantern-raft', title: 'The Committee\'s Six Inches', need: 'gold', target: 110, reward: 145,
    text: 'Oru\'s town has drifted because the housing committee spent its mooring budget on a very accurate map of the mooring. Supply new rope and anchors before the next tide turns the district into an unfortunate migration story.',
    conclusion: 'The anchors hold. The committee names six inches of newly stable deck in your honour. Oru pays your invoice from the emergency reserve and puts the commemorative plaque somewhere it can also patch a leak.'
  },
  {
    id: 'a-route-for-everyone', town: 'lantern-raft', title: 'A Route for Everyone', need: 'relic', target: 6, reward: 155,
    text: 'Oru refuses to let the Bone Compass become another exclusive royal passage. Bring six relics so the ferrymen can copy the safe route for ordinary vessels before a distant ruler declares navigation a hereditary privilege.',
    conclusion: 'Oru copies the route onto weatherproof charts and pays you from the pilot guild. Each chart begins with a warning: water is dangerous, officials are negotiable. The next boat carries an entire household and its deeply suspicious goat.'
  },
  {
    id: 'the-admirals-armada', town: 'pearl-defiance', title: 'The Admiral\'s Armada', need: 'gold', target: 125, reward: 165,
    text: 'Minn has found a barge large enough to evacuate the southern reef. Its owner will sell it for one hundred and twenty-five gold and a promise nobody calls it military surplus. Minn can make the first condition easier than the second.',
    conclusion: 'The barge joins the flotilla under the name Thoroughly Civilian. Minn repays your advance from the harbour fund. A hundred refugees board while she gives a speech about naval glory which ends with precise directions to the blankets.'
  },
  {
    id: 'principles-and-plating', town: 'pearl-defiance', title: 'Principles and Plating', need: 'victory', target: 14, reward: 180,
    text: 'The flotilla needs somebody whose experience extends beyond inspirational speeches about bathtubs. Demonstrate fourteen victories and Minn will pay you to train watch crews in holding a line, retreating and recognising when both are sensible.',
    conclusion: 'Minn\'s crews practise sounding the alarm and getting children below deck. Nobody receives a medal for staying exposed. She pays your fee and quietly changes her old naval manual: courage now includes permission to survive.'
  },
  {
    id: 'the-cost-of-an-apology', town: 'last-dawn', title: 'The Cost of an Apology', need: 'gold', target: 140, reward: 185,
    text: 'Ilex wants to establish a fund for the families harmed by his calculations. His royal pension is frozen, appropriately enough, by the royal treasury. Advance the first payments while he sells the medals awarded for the same disaster.',
    conclusion: 'The first families receive help without an invitation to a reconciliation ceremony. Ilex repays you from the medals. A schoolteacher melts their ribbons\' clasps into door hinges: useful metal, she says, has a better chance of being forgiven.'
  },
  {
    id: 'the-report-they-burned', town: 'last-dawn', title: 'The Report They Burned', need: 'relic', target: 7, reward: 205,
    text: 'Ilex remembers rejecting a safety report from a young engineer. He cannot remember her name. Recover the seventh relic and the Sepulchre\'s records so Last Dawn can honour the person whose warning might have saved it.',
    conclusion: 'Her name was Sen Varo. Her calculations were correct. Ilex reads her report aloud at the town meeting and signs an admission beneath it. The research fee comes from his remaining savings, without a request that anybody applaud.'
  },
  {
    id: 'the-bell-that-holds-us', town: 'hinge-town', title: 'The Bell That Holds Us', need: 'gold', target: 155, reward: 205,
    text: 'Vera needs a replacement clapper for the gravity bell over the nursery. The old one will last days, perhaps, which is a poor foundation for an estimate concerning children and the underside of the sky.',
    conclusion: 'The nursery bell rings clear. Vera returns your advance with the mechanic\'s guild fee and lets you try the old clapper. It breaks on the second stroke. Nobody makes a joke until everyone has checked the new fittings again.'
  },
  {
    id: 'an-empty-chair', town: 'hinge-town', title: 'An Empty Chair', need: 'relic', target: 8, reward: 230,
    text: 'Vera wants the Parliament\'s recovered voices returned to their communities. Bring all eight relics so the names cannot be swallowed by the next ruler who discovers how pleasant it is to be unanimously supported.',
    conclusion: 'The Empty Crown releases a roll of voices. Hinge Town reserves a chair for the missing, then argues about real repairs. Vera pays the recovery fee. An honest argument, she says, is the most hopeful noise the chamber has made in years.'
  },
  {
    id: 'customs-for-a-new-morning', town: 'noonless-quay', title: 'Customs for a New Morning', need: 'gold', target: 170, reward: 225,
    text: 'Pell has waived the transit fees for refugees but cannot persuade a damaged gate to waive its need for replacement coils. Fund the repairs so the return passage can carry people as well as a politically valuable collection of objects.',
    conclusion: 'The gate opens wide enough for the relief wagons. Pell repays your advance from the now accessible transit reserve. His customs ledger records the first arrivals as people, a small administrative change requiring an embarrassing number of crossed-out pages.'
  },
  {
    id: 'a-letter-not-a-summons', town: 'noonless-quay', title: 'A Letter, Not a Summons', need: 'relic', target: 8, reward: 250,
    text: 'Mara\'s last message asks what terms the other worlds will accept. Pell wants the full eight-relic account before he forwards a reply. He has delivered enough royal invitations whose small print turned the guests into property.',
    conclusion: 'You send the testimony home with terms people can refuse. Pell pays for a completed diplomatic passage. Mara\'s answer is brief: bring the witnesses, leave room at the table. Beneath it Osric has added a request for a more impressive table.'
  }
];

export const LORE = [
  {
    title: 'Nell\'s Unsent Letter',
    body: 'Tomas, I used to imagine the noble reasons you might have left. Then I imagined ordinary reasons, which hurt worse. Today a stranger brought me an account number and the exact warmth your body was worth to the crown. I have folded this letter because I cannot bear another person finding it useful. Your daughter fixes roofs now. She swears exactly like you. I shall tell her that part first.'
  },
  {
    title: 'Founding Terms of the Eight Fires',
    body: 'Each community shall hold one instrument of the engine, and no instrument shall command the others. Surplus may be lent for one season by witnessed agreement. A refusal carries no penalty. The builders instruct all successors to place this clause on the outside of the machine, in letters large enough to read from the loading platform. A later hand has written: remove before dedication.'
  },
  {
    title: 'The Captain\'s Amnesty',
    body: 'Officers signing below may return to royal employment without prejudice to rank. Names of enlisted prisoners will be considered in a subsequent instrument. Brann Vale has underlined subsequent instrument until the paper tears. On the reverse he has listed twenty-seven dates on which he asked for it. Beside the final date: I accepted an answer because I wanted the asking to be over.'
  },
  {
    title: 'A Casino\'s House Rules',
    body: 'The Last Laugh permits wagers on dice, cards and the wheel. It does not permit wagers on funerals, food rations or the survival of another guest. Inspect the equipment before play. A loss remains a loss if accompanied by a title. Credit is extended at the proprietor\'s discretion; the proprietor is presently feeling very undiscretionary. Anyone claiming divine assistance must purchase the god a seat.'
  },
  {
    title: 'Minutes of the First Dominion Assembly',
    body: 'Motion: abolish the crown\'s extraction machinery. Amendment: retain machinery pending provision of alternative winter heat. Amendment carried unanimously. Motion: inspect the prison conduits. Amendment: defer inspection until after winter. Amendment carried unanimously. The minutes continue in this form for forty-two winters. The clerk\'s last note is much smaller: there are children in the cells now.'
  },
  {
    title: 'A Coral Cylinder, School Recording',
    body: 'Teacher asks where the promised payment will come from. Child answers the king. Teacher asks where the king will obtain it. Child answers the sea, because that is where everything comes from. The class laughs. Someone near the recorder asks whether borrowing your own money counts as trade. On the cylinder\'s broken rim, Thessa has dated the recording to the last morning the island remained above water.'
  },
  {
    title: 'Oru\'s Navigation Primer',
    body: 'First learn which stars are stars and which are towns on the far wall of Vesper. Confusing them is socially awkward and potentially fatal. Second, carry a route home for your passengers, even if you consider yourself very brave. Third, never allow the owner of a gate to explain why freedom of passage requires his personal permission. He will still be explaining when the tide arrives.'
  },
  {
    title: 'Sen Varo\'s Rejected Report',
    body: 'The projected thermal surplus assumes Vesper is uninhabited. Attached census: two hundred and eleven thousand residents. Corrected projection: extraction exceeds regeneration within seventeen years. Immediate recommendation: suspend export, consult affected settlements, redesign local furnaces. Magister Ilex\'s note: the present emergency does not permit consultation. Sen\'s reply survives on a separate sheet: whose present emergency?'
  },
  {
    title: 'Notes on the Empty Crown',
    body: 'The crown was a meeting instrument before it became a sovereign one. Its voices can speak independently, but the later binding makes dissent physically painful. The first ruler called this harmony. Each successor praised the harmony and increased its power. The cure is straightforward: return the voices and distribute the instruments. Why did none of us do it? The question is written in Ilex\'s hand; the rest of the page is blank.'
  },
  {
    title: 'Mara\'s Draft Charter',
    body: 'Heat shall be counted at its source, together with the lives and work required to produce it. Every contributing community may withdraw. The royal household shall observe the same ration as the street outside its gates. No marriage shall constitute a transfer of sovereignty or a substitute for the consent of either person. Father has objected to the ration clause and underlined either person twice. I have left both.'
  }
];

export const ENEMIES = [
  { name: 'Tithe Rat', hp: 16, attack: 4, gold: 8, weakness: 'quick strikes' },
  { name: 'Debt Collector', hp: 22, attack: 5, gold: 13, weakness: 'guard then counter' },
  { name: 'Grave Lantern', hp: 27, attack: 7, gold: 17, weakness: 'steady pressure' },
  { name: 'Ash Road Brigand', hp: 32, attack: 8, gold: 22, weakness: 'guard then counter' },
  { name: 'Brass Inquisitor', hp: 39, attack: 9, gold: 27, weakness: 'quick strikes' },
  { name: 'Ironroot Stalker', hp: 46, attack: 11, gold: 32, weakness: 'steady pressure' },
  { name: 'Memory Eel', hp: 51, attack: 12, gold: 38, weakness: 'guard then counter' },
  { name: 'Coral Bailiff', hp: 60, attack: 14, gold: 44, weakness: 'quick strikes' },
  { name: 'Starving Automaton', hp: 69, attack: 15, gold: 50, weakness: 'steady pressure' },
  { name: 'Gravity Wraith', hp: 78, attack: 17, gold: 58, weakness: 'guard then counter' },
  { name: 'Crown Echo', hp: 88, attack: 19, gold: 67, weakness: 'quick strikes' },
  { name: 'Royal Pursuer', hp: 36, attack: 9, gold: 24, weakness: 'guard then counter' }
];

export const ENDINGS = {
  alliance: 'Mara places the charter beside the dismantled crown. Osric signs after negotiating a lifetime ceremonial title, two portraits and an exemption for his favourite chair. Pelagos and Vesper keep their own relics and the right to disconnect. The kingdom learns to heat smaller rooms. You and Mara govern under a public agreement; any marriage is a separate promise made freely, with neither a throne nor a person delivered as payment. Brann turns the prison gate into a relief depot. Ilex spends his remaining years building the local furnaces he should have designed first. Some councils quarrel for weeks. Some winters remain hard. Nell calls the first spring a modest improvement and serves second helpings. Vell lays odds on the next budget debate, with a strict limit on wagers from the treasury. The royal fire burns low, honestly, and nobody on another world disappears to keep it bright.',
  rebel: 'The bells of Bellwether announce the first assembly without a hereditary seat. Osric is offered a pension and declines until somebody explains that a pension differs from an execution in several useful respects. Mara stands for election under her own name, promising to repair public furnaces and never again use a procession to obstruct a grain wagon. She wins a seat, loses an argument and discovers she rather likes knowing which is which. You surrender the eight instruments to their communities. Brann swears to protect the assembly\'s right to dismiss him. Dema arrives with a list of demands; Thessa brings the original treaty; Vera brings tools in case the speeches become too ambitious. The new government is untidy, loud and sometimes foolish. Its mistakes can be challenged without asking the crown\'s permission. At the Last Laugh, Vell frames a royal tax notice beneath a sign reading HISTORICAL COMEDY. Nell refuses a ministerial job because people still need feeding.',
  exile: 'You break the binding with the Quiet Anvil and carry the emptied crown beyond the repaired gate. Its shell can no longer command another voice, but leaving it behind would tempt somebody to try. Mara accepts the settlement without calling it a pardon. She remains to build a council which includes the people her family treated as fuel. Osric announces that your departure was his idea until she asks him to put that claim in writing. Brann keeps the road open. Pell marks your passage voluntary, then gives you a blank page for the places his ledger cannot yet name. Home grows distant, but its kitchens no longer draw their warmth from a captive sea. In unfamiliar harbours you hear travellers speaking of the winter that ended badly for several kings. Sometimes a letter from Mara finds you. She writes about repairs, arguments and the first tree to blossom outside Nell\'s door. She never calls you back as a debt.',
  usurper: 'The Empty Crown accepts your command. Osric kneels on the triumphal carpet while a herald reads the new articles of submission, including the humiliating clause requiring him to introduce himself as Formerly Magnificent. The court laughs too loudly. You compel its titles, signatures and wealth into your keeping; Mara signs a surrender of office, never a promise of affection. She refuses a forced marriage and walks from the ceremony with the engineers who can keep the city alive. Your guards let her go because even they can hear the crown beginning to speak with one voice. Brann resigns. Vell pays her staff and shutters the Last Laugh before the first compulsory celebration. Beyond the gates, copies of Mara\'s charter appear on warm walls. You possess eight fires and a kingdom that has learned exactly what possession costs. The machinery will obey. The people begin the slower work of finding where it can be broken.'
};
