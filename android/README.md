# CrownStealer offline Android shell

This native Java APK bundles every file in `public/`. Android WebView loads them from an intercepted HTTPS origin (`https://appassets.androidplatform.net/`); requests never go to a server. No INTERNET or storage permission is requested. The installed Android System WebView provides the browser engine. Android 8.0 (API 26) or later is required; the app targets API 35.

From the project root in PowerShell, using JDK 21:

```powershell
# First build on a fresh checkout: download pinned, checksum-verified official SDK packages.
.\scripts\build-android.ps1 -BootstrapSdk -JavaHome C:\path\to\jdk-21

# Subsequent builds can use the bundled tools/jdk installation automatically.
.\scripts\build-android.ps1
```

The bootstrap downloads only Google's API 35 platform and build-tools 35.0.0. It cross-checks the pinned archive URLs and SHA-1 checksums against Google's current `repository2-3.xml`, then checks each archive before extraction. Review the Android SDK license at <https://developer.android.com/studio/terms> before installing the SDK. No Gradle, Maven, AndroidX, remote runtime, or Node dependency is needed for the Android build.

Output: `releases/CrownStealer-0.3.0.apk` with an adjacent SHA-256 file. The script tests URL confinement and JavaScript module MIME types, compiles Java and Android resources, generates DEX, aligns, signs, verifies the signature, and hashes every bundled asset against the current `public/` source. Re-run whenever web content changes.

The first build generates a local release key and password under ignored `android/signing/`. Back up that directory privately: future APK updates need the same signing key. Never commit or share the keystore/password. The script passes passwords through an environment variable and clears it on exit.

On an Android device, copy the APK, open it, and allow installation from the file app if prompted. With Android platform-tools and a connected device, `adb install -r releases/CrownStealer-0.3.0.apk` installs or updates it. Installation does not need a network connection. A device/emulator runtime smoke test is still recommended after building.

The browser game can call `window.Android.exportSave(json)` to use Android's create-document dialog. File inputs use the open-document picker. Lifecycle hooks dispatch `androidpause` / `androidresume`, and WebView timers pause in the background. System Back first invokes `window.CrownStealerAndroidBack()`; returning `true` consumes the action. Otherwise it closes an open HTML dialog, or displays the native exit confirmation.

Official references: [loading local WebView content](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content), [file chooser callback](https://developer.android.com/reference/android/webkit/WebChromeClient#onShowFileChooser(android.webkit.WebView,%20android.webkit.ValueCallback%3Candroid.net.Uri[]%3E,%20android.webkit.WebChromeClient.FileChooserParams)), [APK signing](https://developer.android.com/tools/apksigner).
