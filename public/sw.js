const CACHE='embers-v11';
const FILES=['/','/index.html','/style.css','/game/app.js','/game/content.js','/game/engine.js','/game/render.js','/game/audio.js','/game/items.js','/manifest.webmanifest','/assets/icon.svg','/assets/cover.webp','/assets/creatures.webp','/assets/terrain.webp','/assets/encounter.mp3','/assets/adventurer.webp','/assets/biome-trees.webp','/assets/towns.webp','/assets/fair.webp','/assets/vault.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('embers-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});
