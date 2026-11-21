# Bar the Gates request status

This file replaces the November 11 implementation inventory. The archived requests are no longer an active to-do list: their gameplay, save-validation, offline and deployment work has been implemented and covered by the current automated suite.

## Current status

- No known archived gameplay or web-deployment requests remain unfinished.
- The five fixed cave stories are implemented: the werebear and dogs, Grub's larder, the rabbit dinner, the Flowerhaven children and the Beaver Household.
- Cave-story artwork uses each portrait sprite at its native 3:5 proportions.
- Web release 0.9.51 and Android release 0.9.51 share the current game content and offline cache generation `embers-v212`.
- Existing browser saves remain separate from the Android package. Installing the APK as an update preserves Android app data when the existing package identity is retained.

## Completed archived work

| Area | Completed behavior |
| --- | --- |
| Wilderness and Atlas | Sixteen terrestrial 128 × 96 maps, 32 × 24 traveling camera, terrain pacing, connected color-coded Atlas and legacy-coordinate migration. |
| Encounters and travel | Peaceful offers, surprise actions, same-species groups, water encounters, boats, Bawb's sailboat, Teleporter Crystals and visited-land return travel. |
| Attributes and combat | Six attributes, level points, temporary and permanent bonuses, attribute-driven damage/resistance/trade and cemetery vampire level drain. |
| Dungeons and trials | Bottomless Pit, Balrog attacks and fear, elevator and whip trial, mid-hallway ladders, Galen's rescue, Wang's trial and royal sewers. |
| Castles and towns | Walkable 2D residences, rulers and guards, treasury robbery, persistent fines, libraries, baths, trophies and arena titles. |
| Wilderness events | Nails, falls into guarded crypts, impaling branches, buried hoards and persistent discovery sites. |
| Touch controls | Landscape overlay controls, strafing and turning, touch-hold pacing and drag joystick behavior. |
| Loot and magic | Tiered treasure, specialist shops, poisons, charged wands, scrolls, legendary items, Webster and save validation. |
| Story and presentation | Royal opening, voiced encounters, planetary route, cave stories, rescue sequences and corrected illustrated layouts. |
| Reputation and endings | Guard-intimidation threshold, explicit challenge compatibility, royal campaign routes, evil-ruler route and Percival reckoning. |

## Release verification

The release gate is:

1. Run the full Node test suite.
2. Build the signed offline APK with the retained package identity and signing key.
3. Verify APK signature, ZIP alignment and bundled-asset hashes.
4. Prepare the static site and publish through GitHub `main` to Render.
5. Verify the live website, offline cache, download page and APK checksum.

Physical Android tablet smoke testing remains recommended because the build environment cannot reproduce every device-specific WebView behavior.

## Historical references

The original 607-message request archive and dated implementation plans remain historical evidence. They should not be interpreted as current outstanding work when their checklist text predates later releases.
