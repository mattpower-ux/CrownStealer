# Haunted Shipyard Implementation Plan

**Spec:** The Crooked Fen contains a fixed Haunted Shipyard entrance leading down ten persistent underwater levels. Water Breathing may be owned already, purchased at the shipyard, or purchased from a traveling merchant. One potion lasts one full game day. Expiration underwater causes progressive drowning damage and permits drinking another potion or retreating to the surface. The drowned route ends with Davey Jones and the Underwater Galleon.

## Global constraints

- Preserve existing saves, wilderness coordinates, terrain collision, rowboats, and ordinary coastal shipyards.
- Keep the Haunted Shipyard deterministic and fixed in `wild-6` (Crooked Fen).
- Use existing dungeon navigation, ladders, treasure, combat, save validation, and rendering interfaces where practical.
- Implement each task with a failing test first.

## Task 1: Full-day Water Breathing and availability

- Change Water Breathing Potion duration to 24 game hours.
- Add a one-potion purchase to the Haunted Shipyard and traveling merchant catalog.
- Ensure purchases consume gold, add inventory, and persist.
- Tests: `tests/nautical.test.js`, `tests/coastal-shipyards.test.js`, merchant coverage.

## Task 2: Fixed Haunted Shipyard landmark and entrance

- Give Crooked Fen a dedicated haunted landmark identity and stable coordinates beside water.
- Add the flooded-dock entrance panel and descend action.
- Require active Water Breathing to descend; allow potion purchase/use before entry.
- Preserve ordinary shipyard rowboat behavior everywhere else.

## Task 3: Ten-level persistent underwater dungeon

- Add deterministic maps for floors 1–10 using existing dungeon movement and ladder contracts.
- Persist floor, position, opened chests, defeated guardians, and return-to-surface behavior.
- Escalate flooding and enemy difficulty by depth.
- Ensure all ladders, chests, and floor-10 boss positions are reachable.

## Task 4: Underwater presentation and drowning

- Render translucent slime-coated walls, dim submerged light, drifting particles, and marine life beyond the walls.
- Remove ordinary torch presentation from the underwater route.
- After Water Breathing expires underwater, apply progressive damage per movement/combat round and offer another potion or surface retreat.
- Lethal drowning uses normal recovery.

## Task 5: Davey Jones and the Underwater Galleon

- Place Davey Jones as the unique floor-10 boss.
- Reveal the Underwater Galleon after victory and make its completion persistent.
- Add appropriate treasure/reward and journal feedback.
- Run the full suite, perform fresh final review, deploy the completed web batch, then build the next requested APK/QR release.

## Review focus

- Old saves with the former two-hour potion.
- Expiry at a ladder, during battle, and at zero health.
- No Water Breathing access to the Leviathan Pump island.
- No Haunted Shipyard behavior leaking into ordinary shipyards or unrelated dungeons.
- Every floor and exit remains reachable with deterministic maps.
