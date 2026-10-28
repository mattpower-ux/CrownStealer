# Project instructions

## Current delivery preference — October 28, 2026

Matt explicitly requested no further APK builds until he asks. Continue browser preview changes and testing while the game is being refined. Keep the existing downloadable APK unchanged; do not increment Android versionCode or run the Android build for web-only updates. This supersedes the APK requirement below until Matt requests another APK.

## Deployment required for every release build

Matt explicitly requires all game builds to deploy. A successful local build is not completion.

- Never use OpenAI Sites unless Matt explicitly says "use OpenAI Sites."
- For every game change, run appropriate checks, increment the release version and Android versionCode, update the service-worker cache, and build the signed offline APK with the existing signing key/package identity.
- Run `node scripts/prepare-site.mjs` and commit the changed source, bundled assets, APK and checksum. Do not stage unrelated personal or research files.
- Push the release to `origin main` (`git push origin HEAD:main` from the current development branch). This triggers the existing Render deployment.
- Verify the live website and downloadable APK with `node scripts/verify-deployment.mjs`. If deployment is still pending, wait and check again; if it fails, investigate and report the blocker. Never say deployed based only on a successful push.
- Refresh the local preview through `/update.html`, preserving all actual player saves.
- No repeat deployment confirmation is needed: Matt has authorized GitHub plus Render releases. Report the released version and download URL when useful.
- Documentation-only changes do not require a new game APK.

Live website: https://crownstealer.onrender.com/
APK: https://crownstealer.onrender.com/downloads/BarTheGates.apk
Repository: https://github.com/mattpower-ux/CrownStealer
