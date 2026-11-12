# Outstanding gameplay implementation plan

**Goal:** Complete the archived gameplay requests, prioritizing all terrestrial wilderness maps at sixteen times their former area, with one sixteenth visible during travel.

**Spec:** `docs/outstanding-prompts.md`, the Desktop handoff and Prompt Archive, plus Matt's live clarification on November 11. Continue implementation autonomously; preserve saved adventurers and the existing APK.

**Architecture:** Keep the browser game's modular JavaScript architecture. Shared world dimensions and versioned migration own terrestrial coordinate changes; local town, dungeon and planetary coordinates remain independent. New rules live in small modules with engine actions and existing overlay controls as their public entry points.

**Tech stack:** Vanilla JavaScript, canvas, Node test runner, Chromium browser tests, GitHub and Render web deployment.

## Work and verification

- [x] Audit archive requests and establish the remaining checklist.
- [x] Guard reputation: third victory, save/load, legacy inference, voluntary challenge compatibility.
- [x] Expand four main lands and twelve branches to 128 by 96; scale stable landmarks and saved terrestrial coordinates once.
- [x] Update travel bounds, boats, return anchors, gates, music and test fixtures; run both full campaign routes.
- [x] Render a 32 by 24 traveling window, cull distant terrain and landmarks; verify pointer movement in landscape Chromium.
- [x] Integrate six attributes, allocation, temporary/permanent items, equipment, combat, trade and vampire drain.
- [x] Integrate Bottomless Pit, Balrog attacks/fear/whip/elevator, mid-hallway ladders, and matching openings.
- [x] Integrate explorable 2D castles, chest choices, faction/alarm and 2,000-gold robbery bans.
- [x] Complete Galen's rescue/ring/inside-city escape and Wang's earlier royal trial before the Balrog final trial.
- [x] Integrate rare wilderness hazards, crypt falls, hoards and Bawb's shrinkable sailboat.
- [x] Finish geographic Atlas and touch movement requirements; verify previous encounter, loot, audio and story flows.
- [x] Full suite and real-browser save/load, movement, combat, inventory, castle, trial and offline checks.
- [x] Increment web release/cache, include new offline assets, prepare web bundle without rebuilding Android.
- [ ] Commit only game/release files, push authorized GitHub/Render web release, verify live assets and preserved APK.

## Review focus

Old saves inside dungeons must not have their local position scaled. Planetary and ship return paths must land on valid terrestrial positions. A guard's voluntary challenge must still finish after the fear threshold. Temporary level loss must never delete earned XP/attribute points. New chest and quest identifiers must validate after every save/load. Regenerated maps must retain reachable routes and never publish a developer-only preview.

- [x] Add Power Productions Presents opening splash; verify timed, tap and keyboard dismissal in Chromium without changing saves.
