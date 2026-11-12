# Wilderness discoveries and item art

Add24 persistent unlabelled sites to each of16 terrestrial lands (384 total): eight small one-floor kobold caves, eight one-floor ruined shrines covering guarded/empty/treasure/trap combinations, and eight cemeteries one to three floors deep. Keep known landmarks and Atlas unchanged. Site placement must be walkable and reachable, deterministic across saves, separated from major landmarks. Approach discovers the name once, exact-tile entry uses normal dungeon controls. Site guardians, loot, traps and floor progress persist; no relic or royal progression awarded for minor sites. Empty sites are valid discoveries. Trap gloves must work on new traps.

Use minor-sites.js for placement/definitions, minor-dungeons.js for connected rooms, loot and guardians; engine owns actions/validation/discovery, existing renderer/UI shows subtle scenery with no global labels. Add all modules to offline cache and deployment checks. Verify all16lands, all sitekind/depth/combinations, leave/reenter/save/load, traps/guards/duplicate loot, fast movement and both campaigns.

Fix discovery item art with category fallbacks and distinctive SVG icons for named legendary treasures, preserving the native item-art system. Real browser preview required. Preserve actual player saves and APK0.9.4; release onlyweb.


Additional approved changes: lakes, rivers, swamps, footbridges and one paired mountain tunnel per land. Coastlines have irregular bays and headlands; Moonless Thicket and Silent Expanse have offshore boat-only approaches. Keep required campaign routes and saved home coordinates, migrate older stranded wilderness positions to nearby dry ground. Fast movement stops at new entrances.

Inventory upgrades use expected weapon damage (including accuracy) and actual armor protection, with a solid green border and accessible label. Wilderness HUD shows current/max HP at top left. Active wilderness time heals Constitution / 100 HP per second, accumulated as fractional progress across saves, capped at max health; no indoor, combat, offline or full-health banking. Equipment contributes effective Constitution.

Move Mothbridge gambling house and its matching door off the outer wall onto a reachable street. Verify actual walks and all town entrances. Tiddlywinks uses an illustrated cup, colored winks, flight/hit/miss feedback and clearer aim controls while preserving wagers, odds and saves.


Merchant follow-up: side-by-side Buy and Sell panes with direct one-click row buttons, item art, categories, search and quantity. Three main specialist shops across each region: blacksmith, wizard and alchemist; six additional mount/enclave/gizmo storefronts with reachable doors. All merchants buy eligible loot; only their appropriate categories appear for purchase. Potions, scrolls and poisons stock3, other items stock1; healing type limits retain old per-town counters. Rare epic/legendary offers use deterministic 10%/2% checks with level/region eligibility. Poison gives +2..10 weapon damage for1..5combat rounds, cleared after combat/equipment changes, with saved validated duration. Dragon purchase remains available at level1; theft gains permanent historical flag and legacy migration. Odd Jobs shows one large card, prominent level/reward and bottom-left Next Job cycling, while preserving completion behavior.
