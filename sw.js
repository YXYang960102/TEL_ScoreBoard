// Offline cache for the installed (home-screen) app.
//
// 2026-11-16 fix: v2 stayed old on phones. install used cache.addAll(),
// which may take the files from the browser's HTTP cache (GitHub Pages:
// max-age 600), so v2 stored the OLD index.html; and every request was
// cache-first, so it never looked again. Now:
//   - install fetches every file with cache: "reload" (straight from the
//     server, never the HTTP cache);
//   - pages (and the other files) are network-first while online, with a
//     short timeout, and the cache only when offline / the venue Wi-Fi has
//     no internet -- so an online open always shows the newest version.
// Bump VERSION with every change anyway (the old caches are dropped).
const VERSION = "tel-scoreboard-3";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => Promise.all(FILES.map((f) =>
      fetch(new Request(f, { cache: "reload" })).then((r) => {
        if (!r.ok) throw new Error(f + " " + r.status);
        return c.put(f, r);
      }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (err) => { clearTimeout(t); reject(err); });
  });
}

// Network first (fresh copy into the cache), cache when there is no network.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const fresh = await withTimeout(fetch(req, { cache: "no-store" }), NETWORK_TIMEOUT_MS);
      if (fresh && fresh.ok) {
        cache.put(req, fresh.clone());
        return fresh;
      }
      throw new Error("status " + (fresh && fresh.status));
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") {
        const page = await cache.match("./index.html");
        if (page) return page;
      }
      throw err;
    }
  })());
});
