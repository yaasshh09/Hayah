// Offline support: pages are network-first (fresh when online, cached copy offline);
// assets and fonts are served from cache and refreshed in the background.
// Served at /sw.js (Express route locally, copied to the site root on Netlify build).
const CACHE = "hayati-v2";
const PAGES = ["/", "/signin", "/dashboard", "/calendar", "/finance", "/AI", "/settings"];
const ASSETS = [
  "/assets/preferences.css",
  "/assets/preferences.js",
  "/assets/hayati-data.js",
  "/assets/finance-plus.js",
  "/assets/hayati-logo.png",
  "/assets/hayati-logo-dark.png",
  "/assets/hayati-mark.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // One failed file must not block the others from caching.
      .then((cache) => Promise.allSettled([...PAGES, ...ASSETS].map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return; // AI stays online-only

  if (req.mode === "navigate") {
    // Cache by path so ?role=child and #tabs share one copy.
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(url.pathname, res.clone()));
          return res;
        })
        .catch(() =>
          caches
            .match(url.pathname)
            .then((hit) => hit || caches.match("/dashboard"))
            .then((hit) => hit || new Response("You are offline.", { status: 503, headers: { "Content-Type": "text/plain" } })),
        ),
    );
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!(sameOrigin && url.pathname.startsWith("/assets/")) && !isFont) return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const fresh = fetch(req)
          .then((res) => {
            if (res.ok || res.type === "opaque") cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      }),
    ),
  );
});
