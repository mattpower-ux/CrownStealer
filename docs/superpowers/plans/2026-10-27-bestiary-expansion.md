# CrownStealer bestiary and dungeon identity — implementation plan

Requested scope: retain existing enemies, add 50 species, supply at least six location-specific species per dungeon, scale dungeon encounters with depth and wilderness with player progression, level-20 heavily armored royal guards of King Buttblast, and inexpensive distinct wall treatments.

Reference: https://rpg-mo.fandom.com/wiki/Monsters (retrieved indexed page October 27, 2026). Adopt its habitat/level/separate-stat organization, with original names/art and CrownStealer-specific balance rather than importing its much larger level numbers.

1. Add a data-driven roster: 48 dungeon species (six for each of eight sites), two wilderness species, and all 12 existing definitions. Preserve old save encounters.
2. Select from habitat pools; dungeon species levels rise two per floor; wilderness target rises slowly with hero level and region. Retain weaker encounters and avoid consecutive duplicate species where possible.
3. Apply species HP, attack, armor, rewards and combat trait. Guards are fixed level20, plate armor, high HP/attack; expose level and armor before the first action. Magic partially bypasses armor.
4. Generate matching transparent painted atlases, compress to WebP, use the same species sprite in hallway reveals and tactical combat. Cache assets offline.
5. Give eight dungeons procedural wall palettes/patterns, shared by first-person and tactical views without new textures.
6. Verify roster counts, all pool entries reachable, depth and wilderness progression, guard danger/armor, legacy saves, complete campaign routes, desktop/tablet rendering and offline assets. Rebuild APK, publish GitHub/Render, verify hosted checksum, refresh preview preserving save.

## Additional requested behavior
Dungeon combat remains first person throughout, with red sprite hit flashes, red edge damage flashes and a 900 ms victory fade. Wilderness encounters show a large portrait and statistics until the first action. Dungeon Left/Right single presses sidestep after a 240 ms double-tap window; double presses turn 90 degrees without stepping. Eight procedural wall palettes and masonry patterns add no texture assets.
