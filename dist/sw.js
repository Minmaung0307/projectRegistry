const CACHE="folio-shell-b10873fc78667b13";const SHELL=["/","/index.html","/manifest.webmanifest","/favicon.svg","/icon-192.png","/icon-512.png","/apple-touch-icon.png","/assets/index-Chp3dJDt.css","/assets/index-BtTJ6vOz.js"];
 self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))));
 self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('folio-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
 self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
 self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/__/'))return;
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('/index.html'))));return;}
 if(SHELL.includes(url.pathname))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(url.pathname))||fetch(e.request)));
 });