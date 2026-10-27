# Android alpha build verification

Verified on Windows, 2026-10-27, with JDK 21.0.12 and official Android build-tools 35.0.0 / platform API 35.

- APK: `releases/CrownStealer-0.1.0.apk`
- SHA-256: `4dd5a0c1c78efdf3884169c9ab59764319863f176d7f6492d72d204bcd8b6a34`
- App ID: `com.crownstealer.game`
- Version: `0.1.0`, code `1`
- Minimum Android: API 26 (Android 8.0); target API 35
- Native launcher: `com.crownstealer.game.MainActivity`
- Requested permissions: none, including no INTERNET permission
- Signing certificate SHA-256: `2900857fed67e9185d50f991b432d9c41ea25c88ce0d61ddd653c1315a873253`
- Signing certificate: `CN=CrownStealer Local Release, O=CrownStealer, C=US`; RSA 3072-bit
- Signature verification: APK Signature Scheme v2 and v3 valid
- ZIP alignment: `zipalign -c -p 4` passed
- Bundled content: all 13 `public/` files matched APK entry SHA-256 hashes; no stale assets
- Offline routing tests: 20 checks passed, including foreign origins, traversal, and JS module MIME types
- Game suite: 
pm test` passed all 33 tests, including complete honorable and outlaw campaign simulations
- Build commands tested successfully: `scripts/build-android.ps1` and `scripts/build-android.ps1 -BootstrapSdk`

No emulator or physical Android device was available for a runtime installation test. Save picker behavior, lifecycle audio, WebView rendering, and Android Back still require device smoke testing. The APK is a locally signed development alpha, ready for that test.

Rebuilds preserve the private signing key but can change the APK's SHA-256 because ZIP entry timestamps change. Use the generated adjacent `.apk.sha256` file for each rebuilt artifact.

Private signing material is under ignored `android/signing/`. Downloaded SDK archives and extracted SDK files are under ignored `tools/android-sdk/`; intermediate classes, DEX, staged web assets, and unsigned APKs are under ignored `android/build/`.

## Version 0.2.0 verification

Built 2026-10-27 after combat, loot and naming changes. VersionCode 2. Signature v2/v3 and ZIP alignment pass; 14 bundled assets match public source. Same signing certificate as 0.1.0. SHA256: e643a85dd326a9ff2ad1ea0b1e94e194ac0c44b2c4a45c325aa6cfbd731f9774. 20 Java routing/MIME checks pass. Physical device testing remains pending.

## Version 0.3.0 verification

VersionCode3; same signing certificate. v2/v3 signature and alignment verified;17 assets hash-matched. SHA256 d58e9c96c926294bbc4c4741590db5dc012591c2ed765a092a7346ad6aff3d65. Includes user encounter MP3, adventurer sprite, tactical map combat, and dungeon facing repair. Physical tablet testing remains pending.

## Version 0.4.1 verification (2026-10-27)
- Signed APK: releases/CrownStealer-0.4.1.apk, 1,558,397 bytes, versionCode 5.
- SHA-256: 790678a150add2ec317b9ccff2c066eba1c43224c59ce4555cfe9f712092bbf9.
- APK v2/v3 signatures verified with the original signing identity; all 21 bundled files match source hashes.
- 48 Node tests pass; Chrome tests pass for four biome maps, arrow movement, dungeon sidestepping, encounters and offline audio. Native routing/MIME: 20 checks pass.
- Artwork converted to WebP with transparent icons sized for map display; original masters retained locally outside distribution.
- Physical Android tablet testing remains pending.

## Version 0.5.0 verification (2026-10-27)
- APK: releases/CrownStealer-0.5.0.apk; 2,107,690 bytes; versionCode 6.
- SHA-256: c679784397229d2362fed5361097764c6c8df521aa61608cca621774c9d8a4c2.
- Original signing key retained; v2/v3 valid, all 27 bundled files hash-verified; native routing/MIME 20 checks pass.
- 58 Node tests pass, including casino rules, all-in rounds, ejection and exact save-facing preservation.
- Chrome: all town activities reachable by keyboard/touch; four casino games; mid-hand reload; dealer annoyed portrait held four seconds then crossfaded; mobile layout, combat and offline checks.
- Physical Android tablet runtime remains untested.

## Version 0.5.1 verification (2026-10-27)
Painted transparent dungeon enemy reveal before first combat action; persists across save/reload. 59 Node tests pass; Chrome verifies reveal, tactical transition, phone sizing and offline WebP. APK 2,726,268 bytes, versionCode7; v2/v3 signature valid; 28 bundled files hash-verified. SHA256 7e042ae11f1a0980ee96748b892c4aa2bcc07dfbad9f12d320ebea5c04a32859. Physical tablet still untested.

## 0.6.0 — 2026-10-27
APK: 5,888,987 bytes; SHA-256 06b3e200ea76673720ef2e1feb427af2e3bd0507f9ad961d4b575200644d8bcc. Version code 8. Signature v2/v3 verified with existing signing identity. All 36 bundled public files verified; 20 native routing/MIME checks passed. 63 Node tests passed including both full campaign routes. Chrome checks passed for dungeon impact colors, victory fade, eight wall profiles, wilderness introduction and double-tap turning. Physical Android tablet testing remains pending.

## 0.6.1 — 2026-10-27
Inventory shortcut and unlimited bag. APK: 5,888,988 bytes. SHA-256: 809a23c7c554823ffcbb7c59ce227dc3b6fc7b0661bcdddb87488af30d7372a8. Version code 9; signature v2/v3 and 36 bundled files verified. 65 Node tests, inventory browser checks and 20 native routing checks passed. Physical tablet testing remains pending.

## 0.6.2 — 2026-10-27
Encounter camera turns away from point-blank walls; nearest turn, longer corridor tie-break, no movement or extra resource cost. Random encounters verified in all eight dungeons, bosses and already-clear facing covered. APK 5,893,086 bytes; SHA-256 8d242a03935fd47b200548a06084eb498b1861a956807e68c79ab2f3171549ef. Version code 10; signatures v2/v3, all 36 bundled assets and 20 native routing checks passed. Physical tablet testing remains pending.
