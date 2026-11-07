// Offline support for B737 Sim Prep.
// Bump VERSION whenever any app file changes so devices pick up the update.
const VERSION = "2026-11-07.4";
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

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      // Remove only this app's old copies; other apps on the same site keep theirs.
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("sim-prep-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pages: try the network briefly so updates arrive, otherwise use the saved copy.
// Everything else: saved copy first.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    event.respondWith(
      Promise.race([
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        }),
        new Promise((_, reject) => setTimeout(reject, 3000)),
      ]).catch(() => caches.match("./index.html"))
    );
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
