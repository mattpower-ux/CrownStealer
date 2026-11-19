# Evil Ruler and Percival Reckoning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete evil-alignment power route, Bellwether takeover, Percival reckoning, playable exile, optional dark ending, Percival music identity, and realistic Percival's Lament alcove art.

**Architecture:** Add a focused `evil-route.js` state machine and a focused `percival-reckoning.js` encounter module, then connect them to existing engine, castle, attributes, avatar, audio, and UI seams. Keep all evil bonuses derived from saved route state, preserve existing base attributes, and represent cinematic progress explicitly so reloads are safe.

**Tech Stack:** Browser-native ES modules, Canvas 2D, HTML/CSS, Web Audio/HTMLMediaElement, Node `node:test`, Playwright browser reviews, WebP/MP3 assets, service-worker offline cache, Render deployment.

**Spec:** `docs/superpowers/specs/2026-11-18-evil-ruler-percival-design.md`

## Global Constraints

- Do not use OpenAI Sites.
- Do not build or increment the Android APK unless Matt explicitly requests it.
- Use seeded engine randomness for gameplay probabilities.
- Preserve old saves and all base attributes.
- Evil fear is 30% at or below player level; above player level it is `max(0, .20 - .01 * levelDifference)`.
- Percival is level 100, fear immune, regenerates exactly 50 HP after each nonlethal round, and deals double greatsword damage to empowered evil players.
- The public Bellwether garrison and the twelve personal guards are separate gates; the takeover begins only after both fall.
- `Blade of Light`, `Rebuild the Dawn`, `Sky of Ruin`, and `Remembrance of Dawn` retain the approved priority and source files.
- “Sky of Ruin” ends on a black screen with centered white `It is finished`, then returns to the title while retaining the completed save.
- Preserve unrelated dirty-worktree changes and stage only intended files/hunks.

## Review Focus

- A legacy active Red Globe save must become empowered without receiving conquest progress or duplicate bonuses; Task 1 migration tests cover it.
- Reloading at every cinematic/combat phase must neither duplicate rewards nor skip choices; Tasks 4 and 6 round-trip each phase.
- A failed or muted media playback must not trap the player on the final screen; Task 6 tests timer and explicit-control fallbacks.
- Directly attacked neutral evil creatures and mandatory story bosses must still fight; Task 3 covers both override paths.
- Exile with an empty bag and null equipment must remain a valid, playable save with reachable cure guidance; Task 5 covers validation and continuation.

---

### Task 1: Evil Route State, Migration, and Derived Power

**Files:**
- Create: `public/game/evil-route.js`
- Modify: `public/game/red-globe.js`
- Modify: `public/game/attributes.js`
- Modify: `public/game/engine.js`
- Test: `tests/evil-route.test.js`

**Interfaces:**
- Produces: `EVIL_ROUTE_PHASES`, `evilEmpowered(state)`, `prepareEvilRoute(state)`, `validateEvilRoute(state)`, `evilStrengthBonus(state)`, `purifyEvilRoute(state, note)`.
- Consumes: existing Red Globe flags and save preparation/validation hooks.

- [ ] **Step 1: Write failing state and migration tests**
  Assert that fulfilling the Red Globe creates `{version:1, phase:'empowered'}`, legacy `redGlobeCurse` migrates once, effective Strength is base +10 without base mutation, and malformed phases fail load validation.
- [ ] **Step 2: Run the focused test and verify RED**
  Run: `node --test tests/evil-route.test.js`
  Expected: FAIL because `evil-route.js` and route-state behavior do not exist.
- [ ] **Step 3: Implement the state module and engine hooks**
  Keep migration idempotent; retain compatibility flags only where existing UI needs them; make White Mountain purification close the route and remove only derived evil effects.
- [ ] **Step 4: Run focused and adjacent tests**
  Run: `node --test tests/evil-route.test.js tests/attributes.test.js tests/shrine-camp-content.test.js tests/paladin-oath.test.js`
  Expected: PASS.
- [ ] **Step 5: Commit only Task 1 hunks**
  Commit message: `Add saved evil route state and derived power`.

### Task 2: Horns, Forked Tail, and Character Status

**Files:**
- Modify: `public/game/gear-avatar.js`
- Modify: `public/game/hero-stats.js`
- Modify: `public/game/app.js`
- Modify: `public/style.css`
- Test: `tests/avatar-identity.test.js`
- Test: `tests/hero-stats.test.js`
- Create: `tests/evil-avatar-browser.mjs`

**Interfaces:**
- Consumes: `evilEmpowered(state)` and `evilStrengthBonus(state)` from Task 1.
- Produces: responsive horn/tail avatar layers and explanatory stats copy.

- [ ] **Step 1: Write failing markup and stat tests**
  Require separate horn and forked-tail layers for empowered characters, their absence after purification/exile, and visible +10 Strength/fear/disposition text.
- [ ] **Step 2: Verify RED**
  Run: `node --test tests/avatar-identity.test.js tests/hero-stats.test.js`
  Expected: FAIL on missing tail and route details.
- [ ] **Step 3: Implement scalable layers and status copy**
  Keep layers anchored to the existing geared-avatar coordinate system and compatible with every selectable character look.
- [ ] **Step 4: Verify unit and browser views**
  Run: `node --test tests/avatar-identity.test.js tests/hero-stats.test.js`
  Run after preview starts: `node tests/evil-avatar-browser.mjs`
  Expected: PASS with desktop and compact screenshots and no page errors.
- [ ] **Step 5: Commit Task 2 hunks**
  Commit message: `Show evil horns tail and powers`.

### Task 3: Fear Aura and Creature Dispositions

**Files:**
- Create: `public/game/evil-disposition.js`
- Modify: `public/game/encounters.js`
- Modify: `public/game/engine.js`
- Modify: relevant creature definitions in `public/game/content.js`, `public/game/minor-sites.js`, and branch encounter modules only where tags are missing.
- Test: `tests/evil-combat.test.js`
- Test: `tests/evil-encounters.test.js`

**Interfaces:**
- Produces: `evilFearChance(state, enemy)`, `evilFearEligible(enemy)`, `evilCreatureDisposition(state, enemy, context)` returning `'hostile'|'neutral'`.
- Consumes: `evilEmpowered(state)` from Task 1 and seeded `rand(state)` through injected callbacks.

- [ ] **Step 1: Write failing probability and disposition tests**
  Pin `.30` at lower/equal level; `.19` at one level above; `.01` at nineteen above; `0` at twenty or more; boss/construct/mindless immunity; one roll per round; neutral goblin/orc/troll/undead; hostile animals/aliens; direct-attack and story overrides.
- [ ] **Step 2: Verify RED**
  Run: `node --test tests/evil-combat.test.js tests/evil-encounters.test.js`
  Expected: FAIL on missing exports and behavior.
- [ ] **Step 3: Implement explicit tags, filtering, and round-start fear**
  A fear success skips only the enemy action for that round and grants no victory, loot, XP, or guard progress.
- [ ] **Step 4: Verify focused and combat regression tests**
  Run: `node --test tests/evil-combat.test.js tests/evil-encounters.test.js tests/spell-items.test.js tests/paladin-oath.test.js tests/briar-animals.test.js`
  Expected: PASS.
- [ ] **Step 5: Commit Task 3 hunks**
  Commit message: `Add evil fear aura and creature dispositions`.

### Task 4: Bellwether Takeover State Machine

**Files:**
- Modify: `public/game/castle-interiors.js`
- Modify: `public/game/engine.js`
- Modify: `public/game/royal-story.js` or the existing royal ending module owning royal state.
- Test: `tests/evil-takeover.test.js`
- Extend: `tests/castle-interiors.test.js`

**Interfaces:**
- Produces: `beginEvilTakeover(state, events, note)`, route transitions `conquering -> enthroned -> percivalChoice`.
- Consumes: existing `garrison:0`, the aggregate twelve-member `castleRoyalDefense:'king'` encounter, and Task 1 route state.

- [ ] **Step 1: Write failing takeover tests**
  Assert no takeover without empowerment, no takeover before public garrison surrender, no takeover before all twelve personal guards fall, and exact king-fled/coerced-marriage/title/cinematic flags after eligible victory.
- [ ] **Step 2: Verify RED**
  Run: `node --test tests/evil-takeover.test.js tests/castle-interiors.test.js`
  Expected: FAIL because personal-guard victory still ejects the player.
- [ ] **Step 3: Implement the evil-only victory branch**
  Preserve ordinary personal-guard behavior for non-evil characters and prevent ordinary royal endings from overriding the route.
- [ ] **Step 4: Round-trip every takeover phase**
  Add save/load assertions for `conquering`, `enthroned`, and `percivalChoice`; rerun the focused tests.
  Expected: PASS without duplicate rewards or repeated guards.
- [ ] **Step 5: Commit Task 4 hunks**
  Commit message: `Trigger evil Bellwether throne takeover`.

### Task 5: Percival Encounter, Exile, and Leprosy

**Files:**
- Create: `public/game/percival-reckoning.js`
- Modify: `public/game/engine.js`
- Modify: `public/game/leper-colony.js`
- Modify: `public/game/attributes.js`
- Modify: `public/game/hero-stats.js`
- Test: `tests/percival-reckoning.test.js`
- Extend: `tests/leper-colony.test.js`

**Interfaces:**
- Produces: `PERCIVAL_RECKONING`, `startPercivalFight(state, note)`, `resolvePercivalRound(state, events, note)`, `resolvePercivalDefeat(state, note)`, `exileEvilRuler(state, cause, note)`, `percivalLeprosyConstitutionLoss(state)`.
- Consumes: Task 1 state, ordinary combat actions, world clock, White Wizard cure.

- [ ] **Step 1: Write failing Percival combat tests**
  Pin level 100, fear immunity, 50 capped regeneration after nonlethal rounds, no regeneration after lethal damage, evil-only double greatsword damage, no ordinary XP/loot, and no combat retreat/teleport/charm bypass.
- [ ] **Step 2: Write failing outcome and disease tests**
  Run/defeat remove bag, equipment, gold, titles, powers, throne, and marriage while retaining level, XP, base attributes, quests, and exploration; defeat alone applies weekly Constitution loss to a minimum of 1; White Wizard cure restores the derived loss.
- [ ] **Step 3: Verify RED**
  Run: `node --test tests/percival-reckoning.test.js tests/leper-colony.test.js`
  Expected: FAIL on missing module and variant disease behavior.
- [ ] **Step 4: Implement unique battle and playable exile**
  Use a safe Hearthmarch wilderness coordinate, null equipment, empty bag, positive HP, explicit cure guidance, and strict save validation.
- [ ] **Step 5: Verify focused and combat tests**
  Run: `node --test tests/percival-reckoning.test.js tests/leper-colony.test.js tests/attribute-integration.test.js tests/spell-items.test.js`
  Expected: PASS.
- [ ] **Step 6: Commit Task 5 hunks**
  Commit message: `Add Percival reckoning exile and cure`.

### Task 6: Throne Cinematic, Endings, and Dedicated Music

**Files:**
- Modify: `public/game/app.js`
- Modify: `public/game/audio.js`
- Modify: `public/game/music-scene.js` or the current module that exports `musicScene`.
- Modify: `public/style.css`
- Add optimized assets under `public/assets/`: `blade-of-light.mp3`, `rebuild-the-dawn.mp3`, `sky-of-ruin.mp3`.
- Add generated assets under `public/assets/`: `evil-throne-takeover.webp`, `percival-ceiling-arrival.webp`.
- Create: `tests/percival-ending-browser.mjs`
- Extend: `tests/audio.test.js`

**Interfaces:**
- Consumes: Task 4 cinematic phases and Task 5 outcomes.
- Produces: resumable throne/Percival panels, confrontation track continuity, defeat crossfade, dark ending screen, timed title return.

- [ ] **Step 1: Write failing music routing tests**
  Assert confrontation continuity, defeat-only `Rebuild the Dawn`, victory-only `Sky of Ruin`, mute/volume handling, and title return even if media playback is rejected.
- [ ] **Step 2: Write failing browser flow assertions**
  Cover crash/dialogue/Fight/Run, player-name escaping, reload at each phase, black/white `It is finished`, preserved completed save, automatic and explicit fallback return to title.
- [ ] **Step 3: Verify RED**
  Run: `node --test tests/audio.test.js`
  Run after preview starts: `node tests/percival-ending-browser.mjs`
  Expected: FAIL on missing scenes and UI.
- [ ] **Step 4: Optimize the three supplied ending tracks**
  Transcode from the approved Downloads sources to efficient MP3 assets without editing the originals; verify durations remain approximately 20.036, 15.047, and 15.047 seconds.
- [ ] **Step 5: Generate and optimize the two cinematic illustrations**
  Use built-in image generation for a realistic wide stolen-throne scene and a continuity-matched Percival ceiling-arrival scene; preserve the selected player as a configurable silhouette/overlay where required so all character looks remain valid; inspect and store optimized WebP project assets.
- [ ] **Step 6: Implement UI and audio state transitions**
  Use semantic live/status text, keyboard/touch-safe buttons, reduced-motion styling, and a duration-based fallback independent of the `ended` event.
- [ ] **Step 7: Verify unit and browser flows**
  Expected: all Task 6 tests PASS with no console/page errors.
- [ ] **Step 8: Commit Task 6 hunks and media assets**
  Commit message: `Stage Percival confrontation and evil endings`.

### Task 7: Percival Theme and Realistic Lament Alcoves

**Files:**
- Modify: `public/game/audio.js`
- Modify: music-scene routing module.
- Modify: `public/game/percival-render.js`
- Add optimized assets under `public/assets/`: `remembrance-of-dawn.mp3`, `percival-barrel-helm.webp`, `percival-lawgiver-seals.webp`, `percival-sacred-sconce.webp`.
- Extend: `tests/audio.test.js`
- Extend: `tests/percival-render-browser.mjs`

**Interfaces:**
- Produces: ordinary Percival music scene and independently placed transparent wall-decor assets.
- Consumes: existing Percival shrine/castle/oath detection and Task 6 music priority.

- [ ] **Step 1: Write failing music-priority and render-asset tests**
  Assert `Remembrance of Dawn` for shrine, sanctuary/Lament, and oath audience; assert special ending tracks override it; assert all three WebP assets load and appear at varied wall placements.
- [ ] **Step 2: Verify RED**
  Run: `node --test tests/audio.test.js`
  Run after preview starts: `node tests/percival-render-browser.mjs`
  Expected: FAIL on missing theme and realistic assets.
- [ ] **Step 3: Generate the three visual assets with built-in image generation**
  Use the supplied barrel-helm image as reference; create transparent, photorealistic, front-facing game assets with no text, watermark, mannequin, or studio background. Inspect alpha, proportions, and lighting; keep final project copies in `public/assets/`.
- [ ] **Step 4: Optimize the theme and visuals**
  Transcode `Remembrance_of_Dawn_2026-11-19T021351.mp3`; convert generated art to size-efficient transparent WebP while preserving alpha.
- [ ] **Step 5: Replace flat wall ink with perspective-aware asset rendering**
  Keep assets separate; vary selection, scale, and brightness; retain masonry, raycaster fog, and pale sacred light.
- [ ] **Step 6: Verify desktop and compact screenshots plus music routing**
  Expected: PASS with no flat helmet/candle shapes, no missing assets, no page errors, and correct priority.
- [ ] **Step 7: Commit Task 7 hunks and assets**
  Commit message: `Give Percival a realistic visual and music identity`.

### Task 8: Full Verification, Offline Cache, Release, and Render Deployment

**Files:**
- Modify: `public/sw.js`
- Modify: `package.json` web version only as required by current release tooling.
- Modify generated site bundle/files produced by `node scripts/prepare-site.mjs`.
- Test: all unit and applicable browser suites.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: cache-complete deployable web release and verified live Render build.

- [ ] **Step 1: Add every new asset/module to offline caching and verify no duplicate/missing URL**
- [ ] **Step 2: Run syntax and focused suites**
  Run: `node --check` on every changed JS module, then all new/extended focused tests.
  Expected: exit 0.
- [ ] **Step 3: Run the complete unit suite**
  Run: `npm test`
  Expected: 0 failures; record and investigate every failure rather than omitting it.
- [ ] **Step 4: Run the applicable Playwright review scripts**
  Include evil avatar, Percival ending, Percival render, audio, castle, and smoke/offline reviews.
  Expected: all PASS, no page errors, screenshots inspected.
- [ ] **Step 5: Run site preparation without an APK build**
  Run: `node scripts/prepare-site.mjs`
  Confirm the existing downloadable APK remains unchanged.
- [ ] **Step 6: Review the complete diff and commit only intended source/assets**
  Ensure `.12ui/`, logs, patch scratch files, and unrelated user files are not staged.
- [ ] **Step 7: Push and verify Render**
  Run: `git push origin HEAD:main`; wait for deployment; run `node scripts/verify-deployment.mjs` until the matching version is live or a real failure is diagnosed.
- [ ] **Step 8: Refresh the local preview without deleting saves**
  Use `/update.html`, then confirm the live game and title screen preserve existing player slots.

