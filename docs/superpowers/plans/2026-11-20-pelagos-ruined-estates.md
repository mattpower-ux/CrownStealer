# Pelagos Ruined Estates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Pelagos's eight generic cemetery minor sites with save-compatible, two-to-five-level alabaster elven estates whose final floor is an underground wine cellar.

**Architecture:** A focused `pelagos-estates.js` module owns identity, names, floor roles, maps, resident profiles, and estate container placement. A separate `pelagos-estate-render.js` module owns materials and scenic drawing; existing minor-site, engine, rendering, atlas, trail, secret, and offline-cache systems consume those helpers while cemetery code remains unchanged for other regions.

**Tech Stack:** Browser ES modules, Canvas 2D, deterministic grid generation, Node 22 built-in test runner, service worker cache.

**Spec:** `docs/superpowers/specs/2026-11-20-pelagos-ruined-estates-design.md`

## Global Constraints

- Preserve every converted `minor-r1-N` ID, coordinate, deterministic seed, and world entry anchor.
- Convert only region-1 cemetery slots; cemetery behavior in every other region remains unchanged.
- Every estate has two through five floors; its last floor is always the only underground wine cellar.
- Estate maps remain deterministic 15×15 grids compatible with established minor-dungeon entrance and destination anchors.
- Estate containers retain stable minor chest identities and must not render or behave as cemetery coffins.
- Harmless legacy cemetery-light flags for converted IDs remain loadable but inert.
- All new production modules enter the offline service-worker cache, whose version is incremented.
- No changes to the Tower of Pelagios, Pelagos towns, main-story relic dungeons, or unrelated regions.

## Review Focus

- A legacy save standing on the former third floor of a Pelagos cemetery must load only when that floor exists in the estate's deterministic depth; malformed higher floors must be rejected cleanly.
- Legacy cemetery torch flags naming converted site IDs must not activate darkness or torch prompts and must not invalidate the save.
- An estate floor with an unusual generated route must still keep every stair, resident, and container reachable from the entrance.
- Defeating an estate resident, saving, and reloading must not resurrect it or misclassify it as cemetery undead.
- Cached offline clients must fetch both new modules after the cache version changes and must not retain the pre-conversion site definitions.

---

### Task 1: Estate Identity, Names, Depths, and Save-Compatible Classification

**Files:**
- Create: `public/game/pelagos-estates.js`
- Modify: `public/game/minor-sites.js`
- Modify: `public/game/trails.js`
- Test: `tests/pelagos-estates.test.js`
- Test: `tests/minor-sites.test.js`

**Interfaces:**
- Consumes: existing `minorSiteDefinition(id)` records and region-1 cemetery slot IDs.
- Produces: `PELAGOS_ESTATE_NAMES`, `isPelagosEstateSite(site)`, `isPelagosEstateDungeon(d)`, `estateFloorRole(d)`, and `estateDefinitionFor(site)` returning `{name, floors}`.

- [ ] **Step 1: Write failing identity tests**

Add tests asserting that the eight former `minor-r1-N` cemetery IDs retain their IDs and seeds, resolve to `kind === 'ruinedEstate'`, have unique fixed names, span depths `{2,3,4,5}`, and expose `ground`, `upper`, and final-floor `cellar` roles. Assert representative region-0, region-2, region-3, and wilderness cemetery definitions remain `cemetery`.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test tests/pelagos-estates.test.js tests/minor-sites.test.js`
Expected: FAIL because `pelagos-estates.js` and `ruinedEstate` definitions do not exist.

- [ ] **Step 3: Implement estate classification**

Create deterministic helpers with exact exported signatures:

```js
export function isPelagosEstateSite(site) {}
export function isPelagosEstateDungeon(d) {}
export function estateDefinitionFor(site) {}
export function estateFloorRole(d) {}
```

Convert region-1 cemetery definitions after their legacy ID, seed, and placement properties are calculated. Include `ruinedEstate` in formal ruined-road trail selection without changing cemetery trails elsewhere.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `node --test tests/pelagos-estates.test.js tests/minor-sites.test.js tests/trails.test.js`
Expected: PASS with no changed counts outside Pelagos.

- [ ] **Step 5: Commit**

```bash
git add public/game/pelagos-estates.js public/game/minor-sites.js public/game/trails.js tests/pelagos-estates.test.js tests/minor-sites.test.js
git commit -m "Add Pelagos ruined estate identities"
```

### Task 2: Deterministic Estate Floors and Vertical Traversal

**Files:**
- Modify: `public/game/pelagos-estates.js`
- Modify: `public/game/minor-dungeons.js`
- Modify: `public/game/dungeon-ladders.js`
- Modify: `public/game/engine.js`
- Test: `tests/pelagos-estates.test.js`
- Test: `tests/minor-sites-engine.test.js`

**Interfaces:**
- Consumes: Task 1's `isPelagosEstateDungeon(d)` and `estateFloorRole(d)`.
- Produces: `estateDungeonMap(d): number[][]` and `estateStairAnchors(d): {entry:{x,y}, destination:{x,y}}`; `minorDungeonMap(d)` delegates for estate dungeons.

- [ ] **Step 1: Write failing map and traversal tests**

For all eight estates and every floor, assert deterministic 15×15 bounds, connected walkable tiles, stable entrance/destination anchors, at least two room-sized open areas on above-ground floors, at least one loop, and a cellar map different from its preceding upper floor. Traverse representative two- and five-floor estates through every stair, round-trip the state through `saveGame`/`loadGame`, and leave at the original world anchor.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test tests/pelagos-estates.test.js tests/minor-sites-engine.test.js`
Expected: FAIL because estates still receive generic minor maps and traversal.

- [ ] **Step 3: Implement estate map generation**

Add `estateDungeonMap(d)` using deterministic room rectangles, broad doorways, a circulation loop, and floor-role-specific layouts. Use the established `[1,1]` entry and `[13,13]` destination convention unless `estateStairAnchors(d)` returns the floor's alternating compatible anchor. Keep every walkable tile connected and preserve minor-site traversal actions.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `node --test tests/pelagos-estates.test.js tests/minor-dungeons.test.js tests/minor-sites-engine.test.js tests/dungeon-ladders.test.js`
Expected: PASS; all pre-existing minor layouts and traversal remain green.

- [ ] **Step 5: Commit**

```bash
git add public/game/pelagos-estates.js public/game/minor-dungeons.js public/game/dungeon-ladders.js public/game/engine.js tests/pelagos-estates.test.js tests/minor-sites-engine.test.js
git commit -m "Build multilevel Pelagos estate maps"
```

### Task 3: Estate Residents, Containers, Loot, Secrets, and Persistence

**Files:**
- Modify: `public/game/pelagos-estates.js`
- Modify: `public/game/minor-residents.js`
- Modify: `public/game/minor-dungeons.js`
- Modify: `public/game/treasure.js`
- Modify: `public/game/secret-alcoves.js`
- Modify: `public/game/engine.js`
- Test: `tests/pelagos-estates.test.js`
- Test: `tests/minor-residents.test.js`
- Test: `tests/treasure.test.js`

**Interfaces:**
- Consumes: Task 2's deterministic estate maps and Task 1's floor roles.
- Produces: `estateResidents(s, map)`, `estateContainers(s, map, items)`, and `estateSecretStash(s)` returning a non-sarcophagus architectural stash or `[]`.

- [ ] **Step 1: Write failing population and treasure tests**

Assert every floor supplies reachable estate residents from the specified goblin/orc/guardian/dark-elf/cellar pool; non-spirit residents are not undead; defeat IDs persist through save/load and validate for floors `0..site.floors-1`. Assert every floor has two to five reachable stable containers, the cellar provides the best ordinary value, no Tower unique item is used, and opening/reloading never duplicates rewards. Assert estate secrets are architectural and never sarcophagi.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test tests/pelagos-estates.test.js tests/minor-residents.test.js tests/treasure.test.js`
Expected: FAIL because estate residents and containers are not implemented.

- [ ] **Step 3: Implement residents and containers**

Export exact helpers:

```js
export function estateResidents(s, map) {}
export function estateContainers(s, map, items) {}
export function estateSecretStash(s) {}
```

Delegate from minor resident and treasure paths when `isPelagosEstateDungeon` is true. Extend resident validation to the full two-to-five-floor range. Use stable `minor:<minorId>:<floor>:<slot>` container IDs where multiple containers require a suffix, while accepting already-open legacy `minor:<minorId>:<floor>` IDs. Keep Search Hidden available and return non-sarcophagus secret metadata.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `node --test tests/pelagos-estates.test.js tests/minor-residents.test.js tests/treasure.test.js tests/secret-discovery.test.js tests/minor-sites-engine.test.js`
Expected: PASS with persistent resident defeats and container rewards.

- [ ] **Step 5: Commit**

```bash
git add public/game/pelagos-estates.js public/game/minor-residents.js public/game/minor-dungeons.js public/game/treasure.js public/game/secret-alcoves.js public/game/engine.js tests/pelagos-estates.test.js tests/minor-residents.test.js tests/treasure.test.js
git commit -m "Populate and reward Pelagos estates"
```

### Task 4: Alabaster Estate Rendering and Cemetery Exclusions

**Files:**
- Create: `public/game/pelagos-estate-render.js`
- Modify: `public/game/render.js`
- Modify: `public/game/app.js`
- Modify: `public/game/cemetery-render.js`
- Modify: `public/game/cemetery-light.js`
- Modify: `public/game/cemetery-haunting.js`
- Modify: `public/game/dungeon-icons.js`
- Modify: `public/game/atlas-view.js`
- Test: `tests/pelagos-estate-render.test.js`
- Test: `tests/cemetery-render.test.js`
- Test: `tests/atlas-markers.test.js`

**Interfaces:**
- Consumes: `isPelagosEstateDungeon(d)` and `estateFloorRole(d)`.
- Produces: `estateWallPixel(face,u,v,light,role)`, `drawEstateVault(c,w,h,d)`, `drawEstateAtmosphere(c,w,h,d,time)`, and `drawEstateContainer(c,size,opened,role)`.

- [ ] **Step 1: Write failing render-contract tests**

Assert estate material helpers produce light alabaster above ground and darker damp cellar colors; scenic roles include stained glass, statuary, baths/ballroom details, and cellar racks/casks. Assert estates return false from cemetery/open-air checks, never generate cemetery torches, never start cemetery hauntings, use estate marker classification, and select `drawEstateContainer` rather than `drawCemeteryCoffin`.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test tests/pelagos-estate-render.test.js tests/cemetery-render.test.js tests/atlas-markers.test.js`
Expected: FAIL because estate rendering helpers and exclusions do not exist.

- [ ] **Step 3: Implement procedural estate presentation**

Create the four exported render helpers, wire them into first-person wall, ceiling, floor, atmosphere, fixture, and container selection, and add a distinct world/atlas estate icon. Ensure `isCemeteryDungeon`, `isOpenAirCemetery`, light, haunting, remains, travel-status, and torch-prompt paths explicitly remain false for estates.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `node --test tests/pelagos-estate-render.test.js tests/cemetery-render.test.js tests/atlas-markers.test.js tests/torch-supplies.test.js tests/cemetery-haunting.test.js`
Expected: PASS; cemetery presentation tests remain unchanged outside Pelagos.

- [ ] **Step 5: Commit**

```bash
git add public/game/pelagos-estate-render.js public/game/render.js public/game/app.js public/game/cemetery-render.js public/game/cemetery-light.js public/game/cemetery-haunting.js public/game/dungeon-icons.js public/game/atlas-view.js tests/pelagos-estate-render.test.js tests/cemetery-render.test.js tests/atlas-markers.test.js
git commit -m "Render ruined alabaster estates"
```

### Task 5: Save Validation, Offline Delivery, and Whole-Batch Verification

**Files:**
- Modify: `public/game/engine.js`
- Modify: `public/game/minor-residents.js`
- Modify: `public/sw.js`
- Test: `tests/pelagos-estates.test.js`
- Test: `tests/offline-assets.test.js`

**Interfaces:**
- Consumes: all estate helpers and persistence formats from Tasks 1–4.
- Produces: final load validation and offline delivery for the complete estate feature.

- [ ] **Step 1: Write failing compatibility and offline tests**

Add fixtures for valid legacy region-1 minor-site saves, inert legacy cemetery-light flags, all valid estate floors, invalid out-of-range floors, valid/invalid resident IDs, and stable opened legacy chest IDs. Assert `/game/pelagos-estates.js` and `/game/pelagos-estate-render.js` appear in `public/sw.js` and the cache is newer than `embers-v203`.

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test tests/pelagos-estates.test.js tests/offline-assets.test.js`
Expected: FAIL on new compatibility fixtures and missing cached modules.

- [ ] **Step 3: Implement validation and cache delivery**

Update validation without deleting harmless legacy cosmetic flags. Add both modules to the service-worker file list and increment the cache to `embers-v204` or the next unused higher version if another queued batch has already advanced it.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `node --test tests/pelagos-estates.test.js tests/offline-assets.test.js tests/minor-sites-engine.test.js tests/minor-residents.test.js`
Expected: PASS.

- [ ] **Step 5: Run syntax and complete-suite verification**

Run: `node --check public/game/pelagos-estates.js && node --check public/game/pelagos-estate-render.js && node --check public/game/minor-sites.js && node --check public/game/minor-dungeons.js && node --check public/game/minor-residents.js && node --check public/game/render.js && node --check public/game/engine.js`
Expected: exit 0 with no syntax errors.

Run: `npm test`
Expected: all tests pass with zero failures.

Run: `git diff --check`
Expected: exit 0 with no whitespace errors.

- [ ] **Step 6: Commit**

```bash
git add public/game/engine.js public/game/minor-residents.js public/sw.js tests/pelagos-estates.test.js tests/offline-assets.test.js
git commit -m "Validate and cache Pelagos estates"
```

### Task 6: Final Review and Deployment

**Files:**
- Modify only if the final review finds Critical or Important defects, each with a reproducing RED test first.

**Interfaces:**
- Consumes: the complete tested feature branch.
- Produces: a reviewed, exact tested commit deployed through GitHub and Render.

- [ ] **Step 1: Produce a whole-branch review package**

Use the execution skill's review-package command with the plan, merge base, and current HEAD. Review the Global Constraints, Review Focus, spec acceptance criteria, ledger rulings, and complete diff.

- [ ] **Step 2: Resolve review findings**

Re-grade findings by user impact. Fix Critical and Important findings in one TDD pass; ledger Minor findings for the handoff. Run `npm test` after fixes.

- [ ] **Step 3: Verify the exact deployment candidate**

Run: `npm test`
Expected: all tests pass with zero failures.

Run: `git status --short`
Expected: only known unrelated untracked user/tool artifacts remain.

- [ ] **Step 4: Commit any review fixes, then push and deploy**

Push the tested branch and exact commit to the authorized GitHub main deployment path. Confirm Render reports the deployment `live` for that exact commit. Do not use OpenAI Sites.

