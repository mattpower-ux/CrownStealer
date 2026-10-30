# Game art delivery standards

Ship optimized WebP illustrations. Size individual fullscreen scenes for landscape tablet display (normally 1280 by 720); preserve atlas dimensions and sprite cell geometry. Preserve alpha exactly for cutouts. Compare compression candidates and retain the original when savings are negligible or visible artifacts are unacceptable. Keep source masters outside public/ and APK assets. Never repeatedly recompress a shipped derivative; work from retained masters for future revisions.

The October 29 audit optimized 52 illustrations from 14,829,002 to 12,635,248 bytes, preserving atlas dimensions and alpha. Detailed measurements are in art-optimization.json. Originals are retained locally in artifacts/art-masters/. Newly generated palace source PNGs also remain in the Codex generated_images folder.
