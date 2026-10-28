[CmdletBinding()]
param(
    [string]$JavaHome = '',
    [switch]$BootstrapSdk
)

$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sdkRoot = Join-Path $projectRoot 'tools/android-sdk'
$androidRoot = Join-Path $projectRoot 'android'
$buildRoot = Join-Path $androidRoot 'build'
$signingRoot = Join-Path $androidRoot 'signing'
$releaseRoot = Join-Path $projectRoot 'releases'
$apkPath = Join-Path $releaseRoot 'CrownStealer-0.8.29.apk'
$platformJar = Join-Path $sdkRoot 'platforms/android-35/android.jar'
$buildTools = Join-Path $sdkRoot 'build-tools/android-15'

function Invoke-CheckedTool([string]$Executable, [string[]]$ToolArguments) {
    & $Executable @ToolArguments
    if ($LASTEXITCODE -ne 0) { throw "Tool failed ($LASTEXITCODE): $Executable" }
}

if (-not $JavaHome) {
    $bundledJava = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'tools/jdk') -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'bin/javac.exe') } | Select-Object -First 1
    if ($bundledJava) { $JavaHome = $bundledJava.FullName }
    elseif ($env:JAVA_HOME) { $JavaHome = $env:JAVA_HOME }
    else { throw 'Install JDK 21 and pass -JavaHome C:\path\to\jdk-21.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $JavaHome 'bin/javac.exe'))) { throw "JDK not found: $JavaHome" }

if ($BootstrapSdk) {
    New-Item -ItemType Directory -Force -Path $sdkRoot | Out-Null
    $metadataPath = Join-Path $sdkRoot 'repository2-3.xml'
    Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/repository2-3.xml' -OutFile $metadataPath
    [xml]$metadata = Get-Content -LiteralPath $metadataPath -Raw
    foreach ($packageSpec in @(
        @{ Id = 'platforms;android-35'; Folder = 'platforms'; File = 'platform-35_r02.zip'; Sha1 = '0bb560a90a7a2cbd0dd8348224d518b638fe7949' },
        @{ Id = 'build-tools;35.0.0'; Folder = 'build-tools'; File = 'build-tools_r35_windows.zip'; Sha1 = 'af059bb67cf7786f45ee0db85e2d24985df1b4b6' }
    )) {
        $package = $metadata.SelectNodes('//*[local-name()="remotePackage"]') | Where-Object { $_.path -eq $packageSpec.Id }
        $archive = $package.archives.archive | Where-Object { -not $_.'host-os' -or $_.'host-os' -eq 'windows' }
        if ($archive.complete.url -ne $packageSpec.File -or $archive.complete.checksum.InnerText -ne $packageSpec.Sha1) {
            throw "Official SDK metadata no longer matches pinned package $($packageSpec.Id). Review before changing pins."
        }
        $archivePath = Join-Path $sdkRoot $packageSpec.File
        if (-not (Test-Path -LiteralPath $archivePath)) {
            Invoke-WebRequest -Uri ('https://dl.google.com/android/repository/' + $packageSpec.File) -OutFile $archivePath
        }
        if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA1).Hash.ToLowerInvariant() -ne $packageSpec.Sha1) {
            throw "SDK checksum mismatch: $($packageSpec.File)"
        }
        Expand-Archive -LiteralPath $archivePath -DestinationPath (Join-Path $sdkRoot $packageSpec.Folder) -Force
    }
    Write-Host 'Verified official Android SDK platform 35 and build tools 35.0.0.'
}
if (-not (Test-Path -LiteralPath $platformJar) -or -not (Test-Path -LiteralPath (Join-Path $buildTools 'aapt2.exe'))) {
    throw 'Android SDK is missing. Run this script once with -BootstrapSdk.'
}

$originalJavaHome = $env:JAVA_HOME
$originalPath = $env:PATH
try {
    $env:JAVA_HOME = $JavaHome
    $env:PATH = (Join-Path $JavaHome 'bin') + [System.IO.Path]::PathSeparator + $originalPath
    if (Test-Path -LiteralPath $buildRoot) {
        $resolvedBuild = (Resolve-Path -LiteralPath $buildRoot).Path
        if ($resolvedBuild -ne (Join-Path $androidRoot 'build')) { throw 'Refusing to clean unexpected build directory.' }
        Remove-Item -LiteralPath $resolvedBuild -Recurse -Force
    }
    foreach ($directory in @('assets', 'classes', 'dex', 'test-classes')) {
        New-Item -ItemType Directory -Force -Path (Join-Path $buildRoot $directory) | Out-Null
    }
    New-Item -ItemType Directory -Force -Path $signingRoot, $releaseRoot | Out-Null
    # Re-copy public on every invocation; no stale bundled game content can survive.
    $publicRoot = Join-Path $projectRoot 'public'
    Copy-Item -Path (Join-Path $publicRoot '*') -Destination (Join-Path $buildRoot 'assets') -Recurse -Force

    $java = Join-Path $JavaHome 'bin/java.exe'
    $javac = Join-Path $JavaHome 'bin/javac.exe'
    $router = Join-Path $androidRoot 'src/com/crownstealer/game/OfflineContent.java'
    Invoke-CheckedTool $javac @('--release', '8', '-d', (Join-Path $buildRoot 'test-classes'), $router, (Join-Path $androidRoot 'tests/OfflineContentTest.java'))
    Invoke-CheckedTool $java @('-cp', (Join-Path $buildRoot 'test-classes'), 'com.crownstealer.game.OfflineContentTest')

    $sources = @(Get-ChildItem -LiteralPath (Join-Path $androidRoot 'src') -Filter '*.java' -Recurse | ForEach-Object { $_.FullName })
    Invoke-CheckedTool $javac (@('--release', '8', '-encoding', 'UTF-8', '-classpath', $platformJar, '-d', (Join-Path $buildRoot 'classes')) + $sources)
    $classes = @(Get-ChildItem -LiteralPath (Join-Path $buildRoot 'classes') -Filter '*.class' -Recurse | ForEach-Object { $_.FullName })
    Invoke-CheckedTool (Join-Path $buildTools 'd8.bat') (@('--release', '--min-api', '26', '--lib', $platformJar, '--output', (Join-Path $buildRoot 'dex')) + $classes)

    $resources = Join-Path $buildRoot 'resources.zip'
    $unsigned = Join-Path $buildRoot 'unsigned.apk'
    $aligned = Join-Path $buildRoot 'aligned.apk'
    Invoke-CheckedTool (Join-Path $buildTools 'aapt2.exe') @('compile', '--dir', (Join-Path $androidRoot 'res'), '-o', $resources)
    Invoke-CheckedTool (Join-Path $buildTools 'aapt2.exe') @('link', '-o', $unsigned, '--manifest', (Join-Path $androidRoot 'AndroidManifest.xml'), '-I', $platformJar, $resources)
    Invoke-CheckedTool (Join-Path $JavaHome 'bin/jar.exe') @('uf', $unsigned, '-C', (Join-Path $buildRoot 'dex'), 'classes.dex')
    # aapt2 on Windows writes backslashes in nested -A asset names. Add explicit
    # portable ZIP entry names so Android AssetManager can resolve /game/*.js.
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $stagedAssets = Join-Path $buildRoot 'assets'
    $assetArchive = [System.IO.Compression.ZipFile]::Open($unsigned, [System.IO.Compression.ZipArchiveMode]::Update)
    try {
        foreach ($stagedAsset in Get-ChildItem -LiteralPath $stagedAssets -File -Recurse) {
            $entryName = 'assets/' + $stagedAsset.FullName.Substring($stagedAssets.Length + 1).Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($assetArchive, $stagedAsset.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $assetArchive.Dispose() }
    Invoke-CheckedTool (Join-Path $buildTools 'zipalign.exe') @('-f', '-p', '4', $unsigned, $aligned)

    $keystore = Join-Path $signingRoot 'crownstealer-release.p12'
    $passwordFile = Join-Path $signingRoot 'keystore-password.txt'
    if (-not (Test-Path -LiteralPath $passwordFile)) {
        if (Test-Path -LiteralPath $keystore) { throw 'Keystore exists but its password file is missing. Restore the original password; do not replace the key.' }
        $secretBytes = New-Object byte[] 32
        $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        try { $random.GetBytes($secretBytes) } finally { $random.Dispose() }
        [System.IO.File]::WriteAllText($passwordFile, [Convert]::ToBase64String($secretBytes), [System.Text.Encoding]::ASCII)
    }
    $env:CROWNSTEALER_KS_PASS = [System.IO.File]::ReadAllText($passwordFile).Trim()
    if (-not (Test-Path -LiteralPath $keystore)) {
        Invoke-CheckedTool (Join-Path $JavaHome 'bin/keytool.exe') @('-genkeypair', '-keystore', $keystore, '-storetype', 'PKCS12', '-alias', 'crownstealer', '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000', '-dname', 'CN=CrownStealer Local Release, O=CrownStealer, C=US', '-storepass:env', 'CROWNSTEALER_KS_PASS', '-keypass:env', 'CROWNSTEALER_KS_PASS')
    }
    Invoke-CheckedTool (Join-Path $buildTools 'apksigner.bat') @('sign', '--ks', $keystore, '--ks-key-alias', 'crownstealer', '--ks-pass', 'env:CROWNSTEALER_KS_PASS', '--key-pass', 'env:CROWNSTEALER_KS_PASS', '--v1-signing-enabled', 'true', '--v2-signing-enabled', 'true', '--v3-signing-enabled', 'true', '--out', $apkPath, $aligned)
    Invoke-CheckedTool (Join-Path $buildTools 'apksigner.bat') @('verify', '--verbose', '--print-certs', $apkPath)
    Invoke-CheckedTool (Join-Path $buildTools 'zipalign.exe') @('-c', '-p', '4', $apkPath)

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archiveCheck = [System.IO.Compression.ZipFile]::OpenRead($apkPath)
    try {
        $assetCount = 0
        foreach ($sourceAsset in Get-ChildItem -LiteralPath $publicRoot -File -Recurse) {
            $relative = $sourceAsset.FullName.Substring($publicRoot.Length + 1).Replace('\', '/')
            $entry = $archiveCheck.GetEntry('assets/' + $relative)
            if (-not $entry) { throw "APK is missing bundled asset: $relative" }
            $stream = $entry.Open()
            $hasher = [System.Security.Cryptography.SHA256]::Create()
            try { $packedHash = [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-', '') }
            finally { $stream.Dispose(); $hasher.Dispose() }
            if ($packedHash -ne (Get-FileHash -LiteralPath $sourceAsset.FullName -Algorithm SHA256).Hash) {
                throw "Public content changed during build or asset differs: $relative. Run build again."
            }
            $assetCount++
        }
        $packedAssetCount = @($archiveCheck.Entries | Where-Object { $_.FullName.StartsWith('assets/') -and -not $_.FullName.EndsWith('/') }).Count
        if ($packedAssetCount -ne $assetCount) { throw 'APK contains stale or unexpected bundled assets. Run build again.' }
    } finally { $archiveCheck.Dispose() }
    $sha256 = (Get-FileHash -LiteralPath $apkPath -Algorithm SHA256).Hash.ToLowerInvariant()
    [System.IO.File]::WriteAllText((Join-Path $releaseRoot 'CrownStealer-0.8.29.apk.sha256'), "$sha256  CrownStealer-0.8.29.apk`n", [System.Text.Encoding]::ASCII)
    Write-Host "Built $apkPath"
    Write-Host "Verified $assetCount bundled assets. SHA-256: $sha256"
} finally {
    Remove-Item Env:CROWNSTEALER_KS_PASS -ErrorAction SilentlyContinue
    $env:JAVA_HOME = $originalJavaHome
    $env:PATH = $originalPath
}
