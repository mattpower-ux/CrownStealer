# Evil Ruler and Percival Reckoning Design

## Purpose

Turn the existing Red Globe curse into a complete high-power, high-cost evil route. An evil adventurer becomes visibly demonic, gains substantial combat and encounter advantages, conquers Bellwether, and faces a final reckoning from Percival. The route must remain playable after a defeat or retreat, preserve old saves, and keep its rules separate from the ordinary royal endings.

## Player Experience

The route begins with the existing Red Globe bargain. Once the character fulfills the bargain by attacking a guard, the game marks the character as committed to evil. Red horns and a forked tail appear on the character. The evil character gains power quickly but loses access to much of the ordinary world's experience economy: evil creatures leave him alone while animals attack him immediately. Alien worlds remain the reliable place to continue leveling.

The route culminates only after the evil character has already subdued Bellwether's twenty-guard public garrison and then attacks King Malachi in the throne room and defeats the king's complete twelve-member personal guard force. King Malachi flees. The player coerces Princess Bunnyfoot into marriage and takes the throne. This is presented as a villainous seizure of power, not a heroic or consensual royal ending.

While the new ruler sits on the stolen throne, Percival crashes through the vaulted ceiling and calls him to account. The player may fight or run. Running or losing leaves the character alive and playable but stripped of the spoils and powers of the evil route. Winning ends the campaign with the player as an uncontested tyrant.

## Saved State and Route Phases

Add an `evilRoute` object to saved state rather than expanding the existing collection of loosely related royal flags. It has a validated version and one of these phases:

- `empowered`: the Red Globe transformation is active.
- `conquering`: the Bellwether public garrison has surrendered and the throne confrontation is available.
- `enthroned`: the twelve personal guards have fallen; Malachi has fled and the throne cinematic is in progress.
- `percivalChoice`: the cinematic has reached the Fight/Run decision.
- `percivalBattle`: the unique Percival fight is active.
- `exiled`: the character ran or lost and may continue in the wilderness.
- `darkVictory`: Percival is dead and the final tyrant ending is complete.

The object may also store cinematic progress needed to resume safely after reload. Transient animation timing belongs in the UI and is reconstructed from the saved phase. Save validation rejects impossible phases or malformed fields. Migration maps the existing active Red Globe curse to `empowered` without advancing any conquest progress. Old saves without this object behave as before.

The game autosaves at the start of the throne cinematic, at the Percival decision, when combat starts, and after either outcome. Reloading never repeats rewards, resurrects guards, duplicates the marriage state, or skips a decision.

## Evil Transformation and Attribute Rules

An active evil route provides the following derived effects:

- Effective Strength receives a +10 bonus. The underlying allocated Strength is unchanged.
- The avatar displays large red horns and a forked tail in inventory, character, travel, and ending views where the player model is visible.
- The character is treated as evil for alignment-dependent rules.
- Purification at the existing White Mountain of Purity removes the horns, tail, +10 Strength, fear aura, and disposition changes and closes the route before the Bellwether throne is seized.

Derived bonuses avoid destructive attribute edits, so purification and exile can remove them without guessing what the character's original statistics were.

## Fear Aura

At the start of each player combat round, before the player's chosen action resolves, an eligible enemy makes a fear check.

- Enemy level less than or equal to player level: 30% fear chance.
- Enemy above player level: `max(0, 20% - 1 percentage point × level difference)`.
- A successful check consumes the enemy's next action for that round and produces a fear event and visible combat message.
- The roll occurs at most once per round, including rounds in which the player changes weapons or uses an item.
- Percival, story bosses, constructs, and explicitly mindless creatures are immune.
- Fear causes no victory, XP, loot, guard progress, or forced retreat by itself.

All probability boundaries use the engine's seeded random source so tests and saved fights remain deterministic.

## Creature Disposition and Experience Trade-off

Add explicit disposition helpers rather than relying on name matching in the encounter UI.

- Goblins, orcs, trolls, undead, and other creatures explicitly tagged as evil do not initiate ordinary encounters with an empowered evil player.
- Neutral evil creatures may still appear in scenery or noncombat interactions.
- Directly attacking one overrides neutrality and starts combat normally.
- Required quest bosses and scripted confrontations may override neutrality so the story cannot deadlock.
- Animals become hostile on sight, including animals that would ordinarily be peaceful.
- Alien enemies remain hostile and continue granting normal XP.

The experience penalty is emergent: the home world supplies fewer hostile enemies because most evil creatures ignore the player. The game does not delete earned XP, reduce XP awards, or hard-code a prohibition on terrestrial level gains. Alien planets are the dependable path to further levels.

## Bellwether Conquest Trigger

The route uses the existing two defensive layers:

1. The public Bellwether garrison surrenders after its existing twenty victories.
2. Attacking King Malachi inside the palace summons the existing aggregate group of twelve personal throne guards.

Only an empowered evil player who defeats that complete twelve-guard group enters `enthroned`. Ordinary players retain the current escape outcome after defeating the personal guard encounter. Losing or fleeing before victory preserves ordinary palace recovery behavior and does not advance the route.

On evil-route victory:

- King Malachi is marked as fled and removed from the palace.
- Princess Bunnyfoot is marked as coerced into the new ruler's marriage and appears in the throne cinematic.
- Royal titles and an evil-ruler title are recorded in a removable title collection.
- Ordinary marriage, tyrant, and royal-audience endings cannot fire over this sequence.
- The player is moved into the dedicated throne cinematic instead of being ejected from the palace.

## Throne Cinematic

Create a purpose-built wide throne illustration matching the game's realistic fantasy art direction. It shows the horned and tailed player on King Malachi's throne, Princess Bunnyfoot frightened on the adjacent throne, and surviving palace attendants and guards cowering. The scene must not glamorize Bunnyfoot's coercion; her fear and lack of consent are visually clear.

The staged presentation is:

1. The stolen-throne illustration appears and triumphant music begins.
2. A heavy crash interrupts the music. Dust and debris fall from the vaulted ceiling.
3. A nine-foot, fully armored, glowing Percival lands and stands before the throne. The supplied “Blade of Light” confrontation track begins as he rises.
4. Percival says: “{playerName}, your time is up. You have defiled this place and defiled the hardworking people of these lands. Now you will answer to the Lawgiver of Light. I, Percival, Lord of Paladins, call you forth!”
5. The game presents exactly two choices: `Fight him!` and `Run Away!`.

The dialogue substitutes the saved player name safely. The sequence supports reduced-motion presentation and remains understandable with sound muted. The impact has a distinct crash effect; triumphant music stops at Percival's entrance. “Blade of Light” continues through the Fight/Run decision and, when the player fights, loops through the Percival battle without restarting at the transition. It fades out on retreat, defeat, or dark victory. The implementation source is `C:\Users\mattp\Downloads\Blade_of_Light_2026-11-19T020326.mp3` (20.036 seconds, 497,799 bytes); implementation will create an optimized web copy while leaving the supplied original untouched.

## Percival Visual and Music Identity

Percival's ordinary leitmotif is the supplied `C:\Users\mattp\Downloads\Remembrance_of_Dawn_2026-11-19T021351.mp3` (180.036 seconds, 4,337,799 bytes). It plays for Percival shrines, sanctuaries, Percival's Lament exploration, oath audiences, and other ordinary Percival appearances. Implementation creates an optimized web copy and leaves the supplied original untouched.

Special ending music has priority over the leitmotif: `Blade of Light` during the throne confrontation and combat, `Rebuild the Dawn` after Percival defeats the player, and `Sky of Ruin` after the evil player defeats Percival. Leaving Percival-related content restores the soundtrack appropriate to the destination.

Percival's Lament replaces its flat wall drawings with separate lightweight, realistic assets so the raycaster can vary them instead of repeating one complete scene:

- recessed tarnished-brass barrel helms based on the supplied reference, with a narrow visor, reinforced central ridge, rivets, cross-shaped breathing holes, and no mannequin or studio background;
- worn religious seals carved into the stone, using the Lawgiver-of-Light's sunburst, sword-and-halo, and devotional geometry;
- iron wall sconces with a pale green-white sacred flame and physically plausible light falloff.

The assets use transparent backgrounds, inherit wall perspective and fog from the renderer, and remain readable without looking pasted onto the masonry. They are optimized WebP files and retain separate placement controls.

## Percival Combat

Percival is a unique level-100 demigod encounter, not a random monster or ordinary palace guard.

- He wears enchanted heavy armor with unique high protection.
- He is immune to the evil fear aura and ordinary fear/charm effects.
- His Avenging Greatsword of Law deals double final sword damage to a character whose evil route is still empowered.
- He regenerates exactly 50 HP after every completed nonlethal combat round, capped at maximum HP.
- Regeneration does not occur after a lethal blow and never revives him.
- He awards no ordinary random treasure or XP payout; his defeat transitions directly to the dark ending.
- The encounter cannot be bypassed with ordinary retreat, teleport, charm, peaceful encounter, or guard-surrender mechanics. The decision to run exists only before combat begins.

Percival's exact HP, attack, armor, accuracy, and sword base damage will be balanced against a well-equipped high-level character in implementation tests and developer preview. The fixed level, 50-point regeneration, fear immunity, and evil-only double damage are invariant requirements.

## Run and Defeat Outcomes

Choosing `Run Away!` and losing to Percival both resolve to the same playable exile state, with different narrative text.

The game removes:

- all bag inventory and pending loot;
- every equipped item and consumable;
- all gold;
- all earned and political titles;
- the throne and coerced-marriage state;
- Red Globe evil powers, including +10 Strength, horns, tail, fear aura, and evil-creature neutrality.

The game preserves:

- player name and appearance identity;
- level and current XP;
- naturally allocated attributes and other permanent non-evil stat gains;
- completed exploration and quest history, except titles and royal control that logically depend on the defeated reign.

The character receives a minimal valid unarmed/unequipped loadout rather than an item, is moved to a safe Hearthmarch wilderness tile, and is restored to enough health to continue. Townspeople throw rotten food and shun the fallen ruler during the exile transition.

Percival's victory also inflicts a distinct `percival` strain of leprosy. Unlike the existing colony-acquired strain, it reduces effective Constitution by one for each completed game week, stopping at an effective minimum of 1. The disease is immediately visible and described in the stat panel. The existing rescued White Wizard cure remains the solution and uses its established price/apprentice rules. Curing it removes the accumulated derived Constitution penalty without changing the saved base Constitution.

## Endings

### Percival Wins

Percival frees the realm. The former ruler becomes a nightmarish historical figure whose story is told to naughty children to make them behave. As Percival's victory is confirmed, “Blade of Light” fades into the supplied “Rebuild the Dawn” epilogue track. This epilogue is shown before the player resumes in exile with leprosy and no possessions. “Rebuild the Dawn” continues through the wilderness exile transition and then yields to the normal regional soundtrack.

The implementation source is `C:\Users\mattp\Downloads\Rebuild_the_Dawn_2026-11-19T020602.mp3` (15.047 seconds, 378,053 bytes). Implementation creates an optimized web copy and leaves the supplied original untouched. Running away uses the ordinary disgrace/exile sound treatment rather than this victory epilogue: “Rebuild the Dawn” is reserved for Percival actually defeating the evil player.

### Player Wins

The sky darkens, the people cower, and the player looks upward and laughs: “My reign of terror has just begun!” The supplied “Sky of Ruin” track begins and continues through this ending. After the final narration, the screen becomes fully black and displays only `It is finished` in centered white letters while the music continues. When the track reaches its natural end, the game returns automatically to the title/save-slot screen. The completed save is retained and marked with the `darkVictory` ending; returning to the title does not erase or overwrite it.

The implementation source is `C:\Users\mattp\Downloads\Sky_of_Ruin_2026-11-19T020753.mp3` (15.047 seconds, 378,053 bytes). Implementation creates an optimized web copy and leaves the supplied original untouched. This presentation belongs only to the optional evil-player victory ending. Other game endings retain their existing music, controls, and continuation behavior. Percival cannot respawn, and the dark-victory outcome cannot be converted into an exile continuation.

## UI and Accessibility

- Evil bonuses, fear chance, and creature disposition appear in the character statistics explanation.
- Leprosy after defeat clearly shows current Constitution loss and directs the player toward the White Wizard.
- The throne choice buttons are keyboard and touch accessible and cannot be triggered accidentally by combat hotkeys.
- Dialogue, impact, fear, regeneration, and ending messages appear as text as well as sound.
- The transformation layers must scale with all selectable character looks without skewing the underlying portrait or sprite.
- The `It is finished` screen is a semantic ending status, remains readable when audio is muted, and returns to the title immediately through an explicit Continue control if the browser prevents reliable media-ended delivery. Automatic return remains the normal path.

## Testing

Use red-green TDD for each behavior. Required automated coverage includes:

- migration from an active legacy Red Globe curse;
- save validation for every route phase;
- derived +10 Strength without base-stat mutation;
- horn and tail visibility and removal;
- exact fear thresholds at equal, lower, and higher enemy levels, including zero-floor and immunities;
- one fear roll per round across attacks, items, magic, guarding, and weapon changes;
- evil-creature neutrality, animal hostility, direct-attack override, scripted-boss override, and alien hostility;
- no artificial XP reduction and normal alien leveling;
- conquest requiring both the surrendered public garrison and victory over all twelve personal guards;
- no takeover for ordinary characters;
- resumable cinematic phases and safe player-name substitution;
- Percival level, fear immunity, evil-only double damage, 50-point capped regeneration, no postmortem regeneration, and no ordinary rewards;
- run and defeat inventory/title/power stripping;
- preservation of level, XP, natural attributes, exploration, and valid save state after exile;
- Percival-strain weekly Constitution loss, minimum 1, persistence, White Wizard cure, and full restoration of the derived loss;
- dark-victory terminal ending and non-repeatability;
- browser tests for transformation visuals, throne illustration, dialogue, both choices, combat messages, sound sequencing, responsive layout, and reload recovery.
- audio tests confirming “Blade of Light” begins after the ceiling crash, does not restart when combat begins, loops during the confrontation, respects music volume/mute controls, and stops on every outcome;
- audio tests confirming “Rebuild the Dawn” crossfades only after Percival defeats the player, continues through the defeat epilogue and exile transition, respects music volume/mute controls, and does not play for voluntary retreat or dark victory.
- audio and browser tests confirming “Sky of Ruin” plays only for `darkVictory`, continues over the black `It is finished` screen, returns to the title when the track ends, respects music volume/mute controls, and preserves the completed save.
- audio tests confirming “Remembrance of Dawn” is selected for Percival shrines, sanctuaries, Percival's Lament, and oath scenes but yields to all three special ending tracks;
- browser screenshots confirming separate realistic barrel-helm, devotional-carving, and sacred-sconce assets appear in varied Percival's Lament alcoves at desktop and compact viewport sizes.

## Delivery

This feature is a browser-preview change until Matt explicitly requests another APK. After implementation passes the complete test and browser-review suites, increment the web release version, update service-worker asset caching, prepare the site, commit only the intended source/assets, push the current branch to `origin/main`, and verify the live Render deployment. Do not use OpenAI Sites.
