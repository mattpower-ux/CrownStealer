# Tower of Pelagios Design

## Purpose

Add the ruined central city of Pelagios as a twelve-level above-ground dungeon. Its plan must visibly and mechanically resemble a six-sided fortified palace: a hexagonal outer ring, six perimeter towers, a central open court, radial wings, and vertical routes that pass through different corner towers. The tower should feel like the architectural climax of Pelagos rather than another rectangular procedural dungeon.

The ruin was built by highborn elves in white alabaster, stained glass, and fine ornament. Goblins and orcs now occupy its lower and middle levels. Scornraven, a dark-elf wizard, controls its upper floors.

## Recommended Technical Approach

Keep the game’s existing cardinal, square-grid movement and represent the hexagon on a larger square array with stepped diagonal walls. This preserves movement, line of sight, combat, saving, minimaps, ladders, chests, hidden rooms, and input controls. A new hex-tile movement system is out of scope and would create unnecessary incompatibility.

The map generator will return a hand-authored deterministic layout for each of the twelve floors. Shared geometry helpers will construct the outer hexagon, six corner towers, courtyard, ring corridor, and radial wings; floor-specific masks and room definitions will vary the navigable routes.

## World Placement and Entry

- Add one unique world landmark, `city-of-pelagios`, in region 2.
- The landmark is an above-ground elven ruin, not a cemetery or generic minor site.
- Entering it starts floor 1 at the principal gate.
- Leaving floor 1 returns the player to the same world-map location.
- The landmark uses a distinct city/tower world-map icon and label.
- Existing saves gain the landmark automatically without migration state.

## Floor Plan

Each map uses a 27-by-27 grid so the hexagonal silhouette and six towers remain legible on the minimap. The shared plan contains:

- A stepped hexagonal outer wall.
- Six projecting corner towers at the vertices.
- A central hexagonal courtyard open to the sky.
- A ring corridor surrounding the courtyard.
- Six radial passages connecting the ring to the perimeter.
- Rooms between adjacent radial passages.
- At least two viable loops per floor so exploration is not a single corridor.
- One ascent route and one descent route on floors 2–11.

The ascent moves between different corner towers across successive levels. This makes the player traverse each floor instead of climbing one uninterrupted staircase. Collapsed walls, barricades, locked gates, and occupied halls change the route while retaining the same recognizable structural skeleton.

## Level Progression

### Levels 1–3: Occupied Lower Palace

- Gatehouse, receiving courts, kitchens, stores, servants’ passages, and stable remnants.
- Goblin camps, scavenged barricades, cooking fires, crude bridges, and defaced elven decoration.
- Encounters emphasize goblins, goblin archers, goblin looters, wolves, and lesser orcs.

### Levels 4–6: Noble and Ceremonial Floors

- Alabaster courts, ballrooms, exercise rooms, bathing halls, banquet chambers, and ruined apartments.
- Stained glass, statues, fountains, mosaic floors, balconies, and collapsed galleries.
- Encounters emphasize orc soldiers, goblin captains, looters, and corrupted elven guardians.

### Levels 7–9: Scholarly and Arcane Floors

- Libraries, observatories, magical workshops, map rooms, archives, and stained-glass galleries.
- Dark-elf wards, animated armor, summoned spirits, and magical traps appear.
- Scornraven’s occupation becomes visually dominant.

### Levels 10–11: Inner Defenses

- Sealed sanctums, war rooms, ritual chambers, elite barracks, and broken shrines.
- Encounters emphasize elite orcs, dark spirits, gargoyles, summoned demons, and dark-elf retainers.
- Routes become more damaged and vertically exposed, with views into the central court.

### Level 12: Observatory and Throne

- An open-roof observatory surrounds the highest courtyard.
- Scornraven’s throne chamber occupies the far side of the ring.
- The floor includes a final approach, an antechamber, and a dedicated boss arena.
- Defeating Scornraven permanently clears the tower’s final guardian and records the victory.

## Scornraven

Scornraven is a dark-elf wizard boss unique to the twelfth floor. His combat identity is battlefield control rather than raw melee strength.

- Opens with a magical ward.
- Uses shadow bolts as his normal attack.
- Can summon one expendable dark spirit when below two-thirds health.
- Can darken the chamber, reducing ordinary visibility for several rounds.
- Resists mundane weapons but remains vulnerable to holy and anti-magic effects already supported by the item system.
- Cannot be farmed after defeat.

Exact numerical balance will follow the existing regional and boss scaling conventions and receive focused combat tests.

## Visual Direction

The Tower uses pale alabaster without appearing pristine:

- Warm white and gray stone with cracks, soot, water stains, and missing blocks.
- Pointed elven arches, fine columns, carved screens, and slender ribs.
- Colored stained-glass light on surviving ceremonial floors.
- Broken statuary, toppled furnishings, torn banners, and vegetation entering through breaches.
- Goblin and orc occupation adds rough timber, hide awnings, cages, cookfires, graffiti, and barricades.
- Upper levels add violet-black magical growth, dark runes, suspended candles, and shadowed glass.
- The central court and open upper levels show sky appropriate to the world clock.

Rendering remains procedural and uses the existing canvas pipeline. A dedicated Pelagios renderer will provide wall materials, courtyard sky, stained-glass light, occupation props, and Scornraven’s upper-floor corruption without changing collision geometry.

## Exploration and Persistence

- The existing line-of-sight and persistent explored-map system applies to all twelve floors.
- Each floor stores exploration independently.
- Chests, hidden rooms, opened doors, boss state, and discovered routes survive saving and loading.
- The full map is never revealed on entry.
- Floor names identify the current architectural function rather than displaying only a number.

## Treasure and Secrets

- Each floor contains 2–5 reachable chests under the existing chest system.
- Noble floors favor jewelry, coins, fine weapons, and elven armor.
- Arcane floors favor scrolls, wands, spell-related equipment, and lore books.
- At least four floors contain hidden rooms detectable through the existing search system.
- Unique lore explains the fall of Pelagios and Scornraven’s seizure of the tower.
- The final reward is unique and one-time; its exact item design will be specified during implementation planning to fit existing balance.

## Module Boundaries

- `pelagios-tower.js`: site definition, floor names, deterministic layouts, room metadata, boss identity, and persistence keys.
- `pelagios-render.js`: alabaster materials, stained glass, courtyard sky, occupation props, and upper-floor corruption.
- `exploration.js` / world content: landmark placement and map exposure.
- `engine.js`: entry, ascent/descent, encounter routing, boss victory, and save validation integration.
- `render.js`: delegates tower-specific surfaces and props to the Pelagios renderer.
- `treasure.js` and lore modules: tower-specific loot weighting and readable history.

The new modules own Pelagios-specific behavior. Existing large engine and renderer files receive only routing hooks.

## Testing

Focused automated tests will verify:

- The landmark is reachable in region 2 and enters floor 1.
- All twelve maps have a recognizable hexagonal boundary, six corner towers, a central court, and connected stairs.
- Every walkable area and required chest is reachable.
- Ascent and descent preserve the correct floor and position.
- Exploration fog remains floor-specific and persists through save/load.
- Floor populations follow the intended progression.
- Scornraven appears only on floor 12, uses his unique actions, and cannot be rewarded twice.
- Save validation accepts legitimate tower state and rejects malformed floors or progress.
- The tower renderer produces its intended materials without browser errors.
- The complete project test suite remains green.

## Non-Goals

- No new hex-tile movement or six-direction input system.
- No replacement of the global dungeon engine.
- No automatic full-map reveal.
- No unrelated changes to Pelagos towns, main-story relic dungeons, or other regions.
- Ruined Estates are a separate queued feature and are not implemented as part of this tower specification.
