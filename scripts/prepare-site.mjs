import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
const apk=await readFile(new URL('releases/BarTheGates-0.9.13.apk',root));
const checksum=createHash('sha256').update(apk).digest('hex');
const expected=(await readFile(new URL('releases/BarTheGates-0.9.13.apk.sha256',root),'utf8')).split(/\s/)[0];
if(checksum!==expected)throw Error('APK checksum does not match release verification.');
await mkdir(new URL('downloads/',out),{recursive:true});
await cp(new URL('public/',root),out,{recursive:true});
await writeFile(new URL('downloads/BarTheGates.apk',out),apk);
await writeFile(new URL('downloads/BarTheGates.apk.sha256',out),`${checksum}  BarTheGates.apk\n`);
await cp(new URL('docs/download.html',root),new URL('download.html',out));
console.log(`Website prepared in dist. Android download: /downloads/BarTheGates.apk (${apk.length} bytes).`);

await writeFile(new URL('downloads/BornToRule.apk',out),apk);
await writeFile(new URL('downloads/BornToRule.apk.sha256',out),`${checksum}  BornToRule.apk\n`);

await writeFile(new URL('downloads/BarTheGates.apk',out),apk);
await writeFile(new URL('downloads/BarTheGates.apk.sha256',out),`${checksum}  BarTheGates.apk\n`);


