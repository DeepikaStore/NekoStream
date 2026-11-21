const CACHE_NAME='nekostream-static-v3';
const PRECACHE=['/','/index.html','/style.css','/config.js','/pwa/manifest.json','/pwa/icons/icon-192x192.png','/pwa/icons/icon-512x512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(PRECACHE).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // API and HTML/JS are always network-first to prevent stale API configuration.
 const networkFirst=request.mode==='navigate'||/\.(?:html|js)$/.test(url.pathname);
 if(networkFirst){event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(request,copy));}return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match('/404.html'))));return;}
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(request,copy));}return response;})));
});
