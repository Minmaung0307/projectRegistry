import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
export function pwa(){return {name:'folio-pwa',apply:'build',writeBundle(options,bundle){
 const dir=options.dir||'dist';
 const paths=['/','/index.html','/manifest.webmanifest','/favicon.svg','/icon-192.png','/icon-512.png','/apple-touch-icon.png',...Object.keys(bundle).filter(p=>p.startsWith('assets/')).map(p=>'/'+p)];
 const hash=createHash('sha256');for(const p of paths.filter(p=>p!=='/'))hash.update(readFileSync(dir+p));
 const cache='folio-shell-'+hash.digest('hex').slice(0,16);
 writeFileSync(`${dir}/sw.js`,`const CACHE=${JSON.stringify(cache)};const SHELL=${JSON.stringify(paths)};
 self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))));
 self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('folio-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
 self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
 self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/__/'))return;
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('/index.html'))));return;}
 if(SHELL.includes(url.pathname))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(url.pathname))||fetch(e.request)));
 });`);
 }};}
