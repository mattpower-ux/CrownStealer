import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');

test('Android 0.9.53 release references agree on version and version code',async()=>{
 const [pkg,manifest,build,prepare,download]=await Promise.all([
  read('../package.json'),read('../android/AndroidManifest.xml'),read('../scripts/build-android.ps1'),read('../scripts/prepare-site.mjs'),read('../docs/download.html'),
 ]);
 const metadata=JSON.parse(pkg);
 assert.equal(metadata.version,'0.9.53');
 assert.equal(metadata.apkVersion,'0.9.53');
 assert.match(manifest,/android:versionCode="72"/);
 assert.match(manifest,/android:versionName="0\.9\.53"/);
 assert.match(build,/BarTheGates-0\.9\.53\.apk/g);
 assert.doesNotMatch(build,/BarTheGates-0\.9\.52\.apk/);
 assert.match(prepare,/BarTheGates-0\.9\.53\.apk/g);
 assert.doesNotMatch(prepare,/BarTheGates-0\.9\.52\.apk/);
 assert.match(download,/Version 0\.9\.53/);
});
