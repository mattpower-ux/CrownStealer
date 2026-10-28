import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const {version,apkVersion=version}=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const base='https://crownstealer.onrender.com';
async function remote(path){const response=await fetch(base+path,{cache:'no-store',signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(`${path}: HTTP ${response.status}`);return Buffer.from(await response.arrayBuffer());}
const normalize=b=>b.toString().replaceAll('\r\n','\n');
try{
 for(const path of ['/index.html','/sw.js','/game/casino.js','/game/casino-view.js','/assets/dealer-retry-male.mp3','/assets/dealer-retry-female.mp3','/game/gossip.js','/game/trails.js','/game/app.js','/game/engine.js','/game/render.js','/game/dungeon-icons.js','/style.css']){const [live,local]=await Promise.all([remote(path),readFile(new URL('public'+path,root))]);if(normalize(live)!==normalize(local))throw Error(`${path}: deployment pending or stale content`);}
 const apk=await remote('/downloads/BarTheGates.apk');
 const expected=(await readFile(new URL(`releases/CrownStealer-${apkVersion}.apk.sha256`,root),'utf8')).trim().split(/\s/)[0];
 if(createHash('sha256').update(apk).digest('hex')!==expected)throw Error('APK does not match the current signed release');
 const page=await remote('/download.html');if(!page.toString().includes(`Version ${apkVersion}`))throw Error('Download page version is stale');
 console.log(`Verified live release ${version}: website, offline cache, download page and existing APK ${apkVersion} (${apk.length} bytes).`);
}catch(error){console.error('Deployment NOT verified: '+error.message);process.exitCode=1;}
