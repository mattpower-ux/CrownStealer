# CrownStealer

An original, offline fantasy RPG inspired by the exploration, dungeon crawling, gambling, and royal satire of early computer RPGs. This is a playable development build, not yet a playtested 15–25 hour release.

The current campaign contains four lands, twelve settlements, eight three-floor first-person dungeons, twenty narrative chapters, twenty-four local stories, and four endings. Turn-based encounters, provisions, equipment, crime, guard retaliation, casinos, autosaves, and save import/export are implemented. Seven original synthesized musical themes and eight effects run locally.

## Play locally

Run `npm start`, then open `http://localhost:4173`. No npm dependencies are required. Arrow keys or WASD move; E enters. In dungeons arrows step, Q/E turn, and Enter descends. Touch controls support tablets and phones. Sound starts after a gesture.

## Android

The standalone installer is `releases/CrownStealer-0.5.0.apk`, for Android 8 or newer. Transfer it to the tablet, open it, and allow installation from that file source when prompted. All game assets are bundled, and the app requests no internet permission. Save progress is local. Export a save from Settings before uninstalling or clearing app data.

See `android/README.md` for the reproducible build and private signing-key backup instructions. A newer APK signed with the same key can update the installed app. The APK signature and bundled file hashes are checked during build; physical Android-device behavior still needs testing.

## Verification

`npm test` runs simulation, campaign-content, and audio tests. `node tests/browser-smoke.mjs` uses the local Codex Playwright runtime and installed Chrome, with the server running. Browser checks cover touch-sized layouts, town actions, casino, crime, journal, dungeon display, and offline reload.

## Publishing

`render.yaml` defines a static Render service. `node scripts/prepare-site.mjs` verifies the APK checksum and assembles `dist/`, including `/download.html` and `/downloads/CrownStealer.apk`. Never publish `android/signing/`, SDK tools, or `research/originals/`.

## Research and original assets

Reverse Engineer Anything and Ghidra were used to inspect preserved Questron files. Findings and provenance are under `research/`; the original game binaries are excluded from distribution. CrownStealer uses its own JavaScript implementation, narrative, score, and generated illustrations.

Generated images: `cover.png` (painterly fantasy valley and village), `creatures.png` (eight fantasy encounter illustrations), and `terrain.png` (grass, woods, mountains, sea, village, castle, ruin, and road atlas). These were generated for this project using the image generation tool; no original Questron artwork or audio is bundled.

## Version 0.2.0

Combat now presents each impact in sequence with sounds, icon flashes, floating damage, guards, misses, and victory feedback. Reduced-motion settings suppress the flashing and shake. Found weapons have original vector artwork, hit bonuses, base damage ranges, comparison and equip controls. Relics also display discovery notices. Pending discoveries and equipment survive saves, and older saves receive default gear. Adventurers can be named at creation and renamed in Settings.

## Version 0.3.0

Random encounters use the user-supplied bass-note MP3. Combat switches to a close-up 2D map with small monster and adventurer icons; dungeon exploration remains first-person. A generated cloaked traveler replaces the old pawn. Dungeon entrances now face open corridors, and blocked directions are labeled. Visit `/update.html` to refresh an older offline preview while preserving the saved game.

## Version 0.5.0

Distinct woodland, desert, coastal and snowy maps, transparent treetops, connected dirt/gravel/cobblestone paths, unique settlement icons and a fairground pavilion. Arrow keys move one square; dungeon left/right sidestep without turning. Q/E and curved touch buttons turn.

Towns have walkable streets with illustrated activity buildings. Walk onto an entrance marker to visit the inn, market, casino, court, notice board or townspeople. The southern gate exits to the overworld. Existing saves migrate to the town entrance.

Version 0.5.0 adds twelve illustrated dealers with matching annoyed portraits (four-second hold then crossfade), Blackjack, five-card draw poker with a paytable, European roulette, and three-shot Tiddlywinks. Spending the last coin escorts you outside town; an active wager settles first. Saves include exact town/dungeon position, facing, turn count, timestamp and unfinished casino rounds. Every action and page exit/background event saves locally.

Live game: https://crownstealer.onrender.com/
Android download: https://crownstealer.onrender.com/download.html
