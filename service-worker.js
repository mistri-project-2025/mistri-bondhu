self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("mb-cache-v1").then(cache => cache.add("/offline.html"))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/offline.html"))
  );
});