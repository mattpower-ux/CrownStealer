# Bar the Gates 0.9.51

Release 0.9.51 packages the current web game as a signed offline Android update and reconciles the historical outstanding-request inventory.

## Included

- All gameplay and presentation work through the Beaver Household developer preview.
- Correct 3:5 cave-story artwork proportions.
- Offline cache generation `embers-v212`.
- Android version code 70 using the existing package identity and signing key.
- Updated web download and SHA-256 verification files.

## Verification

- Full Node test suite.
- Native Android routing and MIME tests.
- APK v2/v3 signature and ZIP-alignment verification.
- Byte-for-byte hash verification of every bundled `public/` asset.
- Live Render website and downloadable APK checksum verification.

Physical tablet installation and play remain recommended as a device-specific smoke test.
