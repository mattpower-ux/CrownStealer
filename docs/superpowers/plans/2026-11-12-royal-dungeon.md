# Royal castle and dungeon extension

User-approved scope: complete connected Bellwether palace rooms while retaining local 25-foot exploration, Royal Armory, Privy Council Room, Royal Fun Room (king bedroom), Chastity Chamber (princess bedroom), barracks, foyer and throne room. A staircase enters a separate single-floor first-person Royal Dungeon, preserving the existing royal prison/sewer quest.

Two cells contain a kobold and drunken peasant together, and an adult maiden separately. Two illustrated passive keepers: Royal Torturer (scar/eyepatch/dirty studded leather) and Royal Heckler (bad teeth/cross earring/colorful beads). Only player attack, insulting their work, or attempted cell release provokes combat. Fights are individual, defeat flags persist, no random dungeon attackers. Heckler uses the supplied taunts. After both are defeated, rescue all three and receive one Necklace of Bravery (+5 equipped Charisma).

Implement engine state and validation independently from map/render/UI. Validate entry/exit, all three provocation routes, sequential fights, flee/death/reentry, saving in all states, duplicate rewards, necklace gear effect, connected rooms and old castle-save compatibility. Use isolated Chrome for real movement/dialogue/rescue and phone/landscape checks.

Prioritize user-reported missing palace entry after paying fine: show a clear immediate Enter palace action beside fine feedback, test normal and exact-gold payment. Preserve player saves. Generate portrait assets and cache them offline. Release through GitHub/Render with unchanged Android 0.9.4.

## Subsequent user requirements

Bellwether is approximately three times a provincial residence in both room count and usable floorspace (target 18 rooms versus 6, about 420 walkable tiles versus 140). Preserve all prior valid castle positions and chest identities. Add fully connected royal service/guest rooms and show the full overview while local play stays at 25 feet.

Nearby chests, guards, King and Princess offer explicit interaction. King's exact dismissal: "What are you doing here? Guards, get this nitwit out of my sight!" unless new progress exists on the latest royal quest. Three exclusive checkbox choices: Leave the Room, Report on Your Progress, Attack. Reporting cannot bypass quest item/payment requirements. Preserve report milestones over saves. Guard attacks and ruler-defense encounters remain separate from garrison progression.

User requested ElevenLabs Cockney audio: exact Torturer Oh goodee speech; Heckler has snorting laughter with every new insult. Nine generated MP3s are now bundled, one Torturer introduction and eight rotating Heckler attack lines. See royal-dungeon-voices.md. User explicitly confirmed all clips other than Oh goodee are the Heckler.
