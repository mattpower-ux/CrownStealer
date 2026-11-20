# Pelagos Ruined Estates Design

## Goal

Replace every generic cemetery minor site in Pelagos, the Tidemoon, with a ruined estate left by the fallen highborn elves. These estates must feel like inhabited buildings rather than graveyards: elegant white-alabaster residences whose halls, courts, ballrooms, exercise rooms, baths, stained glass, statuary, and underground wine cellars have survived in damaged form.

The estates are satellite ruins around the separate twelve-level Tower of Pelagios. They provide shorter architectural dungeons and reinforce the history of a wealthy elven kingdom now occupied by goblins, orcs, and other scavengers.

## Scope

- Convert Pelagos minor sites whose current kind is `cemetery` into `ruinedEstate` sites.
- Keep all existing minor-site IDs, coordinates, deterministic seeds, and world entry anchors so old saves remain usable.
- Give every converted estate between two and five traversable levels.
- Make the final underground level a wine cellar. All earlier levels are above ground.
- Replace cemetery presentation, residents, coffins, remains, torch prompts, hauntings, secret-room assumptions, labels, icons, trails, and loot behavior for these sites.
- Add a distinct alabaster-estate renderer and estate-specific floor plans.
- Preserve generic cemetery behavior in every other region.

This batch does not modify the Tower of Pelagios, Pelagos towns, main-story relic dungeons, or unrelated regions.

## Site Identity and Compatibility

Pelagos is terrestrial region `1`. For each region-1 minor site that would otherwise resolve to `cemetery`:

- `kind` becomes `ruinedEstate`.
- The existing `minor-r1-N` ID remains unchanged.
- The existing placement seed and coordinates remain unchanged.
- `floors` becomes a deterministic value from two through five, distributed so the eight estates collectively include all four depths.
- The site receives a deterministic estate name drawn from a fixed list of eight former elven houses.
- Existing saves standing inside one of these sites continue to load. Floor values that exceed a newly resolved estate depth are rejected as malformed rather than silently moved.
- Existing opened chest IDs remain valid. New estate chests continue using the stable `minor:<site-id>:<floor>` identity pattern where possible.

World markers and atlas labels identify these sites as ruined estates, not cemeteries. Approach trails remain ruined formal roads suitable for former noble residences.

## Vertical Structure

Each estate has two to five levels. The vertical sequence is:

1. Ground floor — entrance hall and great court.
2. Upper residence — ballroom, gallery, dining hall, or private apartments.
3. Optional upper residence — baths, exercise court, library, or guest wing.
4. Optional upper residence — observatory, music hall, or family shrine.
5. Wine cellar — always the last level and the only underground level.

For a two-level estate, the sequence is ground floor then wine cellar. For deeper estates, one to three upper floors appear between them.

The dungeon state exposes whether the current floor is `ground`, `upper`, or `cellar` so rendering and encounter selection do not infer architectural meaning from a hard-coded floor number.

## Floor Plans and Navigation

Estate maps remain compatible with the minor-dungeon movement and minimap systems, using deterministic 15×15 grids and the established entrance and destination anchors.

Above-ground floors use room-based plans rather than cemetery lanes:

- A recognizable entrance hall begins near the entry anchor.
- Two or more furnished chambers connect through broad doorways.
- At least one circulation loop prevents each floor from being a single corridor.
- Larger floors include a central court or ballroom-sized chamber.
- Stair positions alternate across levels to make the estate feel vertically coherent while preventing a straight sprint through identical corners.
- Every walkable tile remains connected, and all stairs, residents, and chests are reachable.

The wine cellar uses tighter vaulted aisles, bottle rooms, storage bays, and a central tasting chamber. It remains built architecture, not a cave or crypt.

## Visual Direction

### Above-ground floors

- White or warm ivory alabaster blocks with fine seams and chipped edges.
- Slender pointed arches and ribbed vaults proportioned more delicately than human shrine architecture.
- Tall stained-glass windows casting muted jewel-colored light.
- Broken elven statues, ornamental reliefs, carved screens, and damaged balustrades.
- Floors of pale stone, patterned marble, or cracked decorative tile.
- Room-specific silhouettes such as bath basins, exercise racks, banquet tables, benches, and gallery plinths.
- Openings may show daylight or moonlight depending on the existing scene time, but the estate remains an indoor dungeon.

### Wine cellars

- Low pale-stone vaults with darker damp staining.
- Bottle niches, broken racks, casks, amphorae, and collapsed shelving.
- Sparse warm sconces or scavenger lamps rather than cemetery torches.
- No stars, grave markers, coffins, skeletal fish, cemetery walls, cemetery darkness overlay, or haunting effects.

The renderer should be procedural and deterministic, matching the existing low-polygon/painterly first-person presentation while materially distinguishing estates from shrines, crypts, and the Tower of Pelagios.

## Residents

Estate residents are persistent minor-site occupants. Their exact composition depends on floor role:

- Ground and lower upper floors: goblin squatters, goblin looters, and orc raiders.
- Higher upper floors: orc veterans, ruin guardians, and occasional dark-elf agents.
- Wine cellar: goblin cellar thieves, orc hoard guards, giant cellar vermin, or restless elven spirits.

Every estate contains at least three persistent hostile residents across its levels. Defeated resident IDs use the existing minor-site persistence mechanism and remain unique per site, floor, and resident slot.

Estate enemies are not marked as cemetery undead unless the selected resident is specifically an elven spirit. Cemetery vampire rules and cemetery-specific level drain do not automatically apply.

## Treasure

Every estate floor contains two to five reachable chests or estate containers, following the game-wide dungeon chest rule. Containers use estate-appropriate appearances such as carved cabinets, alabaster coffers, travel trunks, and wine-cellar strongboxes.

Loot emphasizes:

- Elven weapons and armor already present in the item system.
- Jewelry, gems, and fine valuables.
- Potions and scrolls left in private chambers.
- Food, drink, or modest coin caches in cellars and servant areas.

The deepest wine cellar receives the estate's best ordinary reward. Loot must remain level-appropriate and must not duplicate unique rewards owned by the Tower of Pelagios or main-story dungeons.

Opening and saving estate containers uses the normal chest persistence system. Estate containers do not render or behave as cemetery coffins.

## Secrets and Interactions

- Search Hidden remains available on every estate floor.
- Existing generic secret-search rules may reveal architectural concealed rooms where compatible.
- Estate secret rooms use hidden studies, family vaults, priest holes, or sealed wine chambers rather than cemetery sarcophagi.
- Cemetery torch prompts, cemetery auto-lighting, cemetery travel status, and cemetery hauntings are disabled inside estates.
- Entering, leaving, climbing, descending, saving, loading, and developer preview use the normal minor-dungeon controls.

## Architecture

The implementation should isolate estate behavior behind focused helpers rather than spreading region checks through large rendering and engine files.

Recommended modules:

- `pelagos-estates.js` — identifies converted sites, supplies names, floor roles, deterministic estate maps, resident themes, and compatibility helpers.
- `pelagos-estate-render.js` — estate material pixels, room dressing, containers, and atmosphere.

Existing minor-site, dungeon-depth, traversal, resident, treasure, atlas, trail, render, and service-worker modules consume these helpers. Generic cemetery modules remain unchanged except where they must explicitly exclude estates.

## Save Validation

Validation must accept:

- Legacy saves using unchanged `minor-r1-N` IDs.
- Estate floor indices within the deterministic site depth.
- Estate resident-defeat IDs using the existing minor resident format.
- Estate opened chest identities using the established minor chest format.

Validation must reject:

- Estate floors outside the site's two-to-five-level range.
- Cemetery-only state that refers to an estate when that state cannot safely be ignored.
- Malformed estate resident IDs or duplicate persistence records.

Harmless legacy cemetery-light flags for converted IDs may remain inert so old saves are not discarded solely for cosmetic history.

## Offline Support

All new production modules and required art assets must be included in the offline service-worker cache. The cache version must be incremented so deployed clients receive the estate code.

## Testing

Automated tests must prove:

- Exactly eight Pelagos cemetery slots become ruined estates while cemetery counts and behavior elsewhere remain unchanged.
- Estate IDs, coordinates, and seeds remain stable.
- Estate depths span two through five floors, with the last floor always identified as the wine cellar.
- Every estate map is deterministic, connected, bounded, and supports reachable entrance, stairs, residents, and containers.
- Above-ground maps have room-sized spaces and circulation loops; cellar maps are distinct from above-ground plans.
- Estate traversal works through every floor and survives save/load.
- Estate residents use the intended Pelagos occupation themes and persist after defeat.
- Estate treasure is reachable, persistent, and never rendered as cemetery coffins.
- Cemetery-only darkness, torch, haunting, remains, and open-air presentation do not activate for estates.
- Atlas/world presentation labels the converted sites as estates.
- New modules are present in the offline asset list.
- The complete project test suite passes before deployment.

## Acceptance Criteria

The batch is complete when a player entering any former Pelagos cemetery instead explores a named multi-level elven estate with visibly alabaster architecture, differentiated rooms, an underground wine cellar, appropriate occupiers and treasure, normal Search Hidden support, and no cemetery-specific presentation or mechanics. Existing saves continue to load at the same world locations, all automated tests pass, and the exact tested commit is deployed through GitHub and Render.
