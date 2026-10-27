Add-Type -AssemblyName System.Speech
$rootNarration = $PSScriptRoot | Split-Path -Parent
& node -e "import('./public/game/royal-story.js').then(m=>require('fs').writeFileSync('art-source/royal-lines.json',JSON.stringify(m.ROYAL_INTRO)))"
$dialogueLines = Get-Content -LiteralPath (Join-Path $rootNarration 'art-source/royal-lines.json') -Raw | ConvertFrom-Json
$synthNarration = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
 for ($lineIndex=0; $lineIndex -lt $dialogueLines.Count; $lineIndex++) {
  $providedClip = Join-Path $rootNarration "art-source/user-intro-$lineIndex.mp3"
  if (Test-Path -LiteralPath $providedClip) {
   & ffmpeg -hide_banner -loglevel error -y -i $providedClip -af 'loudnorm=I=-18:TP=-2:LRA=7' -ar 24000 -ac 1 -codec:a libmp3lame -b:a 64k (Join-Path $rootNarration "public/assets/intro-$lineIndex.mp3")
   if ($LASTEXITCODE -ne 0) { throw 'Provided narration encoding failed.' }
   continue
  }
  $line = $dialogueLines[$lineIndex]
  $voiceName = if ($line.role -eq 'king') {'Microsoft David Desktop'} elseif ($line.role -eq 'princess') {'Microsoft Zira Desktop'} else {'Microsoft Mark'}
  $synthNarration.SelectVoice($voiceName)
  $rate = if ($line.role -eq 'king') {'-8%'} elseif ($line.role -eq 'princess') {'+5%'} else {'-3%'}
  $pitch = if ($line.role -eq 'king') {'-10%'} elseif ($line.role -eq 'princess') {'+4%'} else {'0%'}
  $spokenText = [System.Security.SecurityElement]::Escape($line.text)
  $ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><prosody rate="'+$rate+'" pitch="'+$pitch+'">'+$spokenText+'</prosody></speak>'
  $wavFile = Join-Path $rootNarration "art-source/intro-$lineIndex.wav"
  $synthNarration.SetOutputToWaveFile($wavFile)
  $synthNarration.SpeakSsml($ssml)
  $synthNarration.SetOutputToNull()
  & ffmpeg -hide_banner -loglevel error -y -i $wavFile -af 'loudnorm=I=-18:TP=-2:LRA=7' -ar 24000 -ac 1 -codec:a libmp3lame -b:a 56k (Join-Path $rootNarration "public/assets/intro-$lineIndex.mp3")
  if ($LASTEXITCODE -ne 0) { throw 'Narration encoding failed.' }
  Write-Output "Recorded intro line $lineIndex with $voiceName"
 }
} finally { $synthNarration.Dispose() }
