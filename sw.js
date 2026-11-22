const STATIC_CACHE = "ato-static-v1";
const DATA_CACHE = "ato-data-v1";
const AUDIO_CACHE = "ato-audio-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./logo.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const allowedCaches = new Set([STATIC_CACHE, DATA_CACHE, AUDIO_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (!allowedCaches.has(key) ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1. Локальные MP3-файлы нигунов (Cache-First с сохранением прослушанного)
  if (url.origin === self.location.origin && url.pathname.includes("/audio/")) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const networkRes = await fetch(req);
        if (networkRes && networkRes.status === 200) {
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      })
    );
    return;
  }

  // 2. Динамические данные: CSV Google Sheets и API Hebcal (Network-First + fallback на кэш)
  if (
    url.hostname.includes("docs.google.com") ||
    url.hostname.includes("hebcal.com")
  ) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.ok) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          const cached = await cache.match(req);
          if (cached) return cached;
          throw err;
        }
      })
    );
    return;
  }

  // 3. Каркас приложения (HTML, CSS, JS, logo, manifest) — Network-First для мгновенных обновлений + офлайн-кэш
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.ok) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          const cached = await cache.match(req);
          if (cached) return cached;
          if (req.mode === "navigate") {
            return cache.match("./index.html");
          }
          throw err;
        }
      })
    );
  }
});
