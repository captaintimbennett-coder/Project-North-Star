// Offline support for B737 Sim Prep.
// Bump VERSION whenever any app file changes so devices pick up the update.
const VERSION = "2026-11-08.2";
const CACHE = `sim-prep-${VERSION}`;
const FILES = [
  "./",
  "./index.html",
  "./procedure.js",
  "./perf.js",
  "./taxi.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

// Save a fresh copy of every file, skipping the browser's own cache.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(FILES.map((f) => fetch(new Request(f, { cache: "reload" })).then((res) => c.put(f, res)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      // Remove only this app's old copies; other apps on the same site keep theirs.
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("sim-prep-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Online: always the latest files (asking the server, not the browser cache), saved for later.
// Offline or slow (4 s): the saved copy.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === "navigate" ? "./index.html" : req;
  event.respondWith(
    Promise.race([
      fetch(req, { cache: "no-cache" }).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
        return res;
      }),
      new Promise((_, reject) => setTimeout(reject, 4000)),
    ]).catch(() => caches.match(key, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html")))
  );
});
