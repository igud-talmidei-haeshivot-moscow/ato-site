# КОНТЕКСТ 1 • HTML И PWA (АТО • תשפ״ז)
_Автоматически собрано из ветки `main`: 2026-11-27 07:21 UTC_

---

## Файл: `index.html`

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Сообщество АТО • תשפ״ז — Архив изданий, новости и поддержка</title>
  <meta name="description" content="Игуд Талмидей а-Ешивот Москва (תשפ״ז) • Архив журналов «Кунтрес Тмимим», койвецов, новости ешивы, статьи, нигуним и поддержка проектов сообщества." />

  <!-- Open Graph / Превью для Telegram, WhatsApp и соцсетей -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Сообщество АТО • Москва (תשפ״ז)" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:url" content="https://igud-talmidei-haeshivot-moscow.github.io/ato-site/" />
  <meta property="og:title" content="Сообщество АТО • תשפ״ז — Архив изданий, новости и поддержка" />
  <meta property="og:description" content="Игуд Талмидей а-Ешивот Москва • Архив журналов, койвецов, новости ешивы, нигуним и редакционные статьи." />
  <meta property="og:image" content="https://igud-talmidei-haeshivot-moscow.github.io/ato-site/logo.png" />
  <meta property="og:image:alt" content="Логотип Игуд Талмидей а-Ешивот — Сообщество АТО" />

  <!-- Twitter / Карточка превью -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Сообщество АТО • תשפ״ז — Архив изданий, новости и поддержка" />
  <meta name="twitter:description" content="Игуд Талмидей а-Ешивот Москва • Архив журналов, койвецов, новости ешивы и редакционные статьи." />
  <meta name="twitter:image" content="https://igud-talmidei-haeshivot-moscow.github.io/ato-site/logo.png" />

  <link rel="icon" type="image/png" href="logo.png" />
  <link rel="apple-touch-icon" href="logo.png" />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#07162B" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="АТО Москва" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />

  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=114297805', 'ym');
    ym(114297805, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
  </script>
  <!-- /Yandex.Metrika counter -->
</head>
<body>
  <div id="atoPreloader" class="ato-preloader" role="status" aria-live="polite" aria-label="Загрузка архива АТО">
    <div class="ato-preloader-card">
      <div class="ato-preloader-logo">
        <img src="logo.png" alt="Сообщество АТО" />
      </div>
      <div class="ato-preloader-eyebrow">
        <span class="diamond"></span>
        <span>Tomchei Tmimin Lubavitch Moscow • תשפ״ז</span>
        <span class="diamond"></span>
      </div>
      <div class="ato-preloader-title">Загрузка архива...</div>
      <div class="ato-preloader-bar">
        <div class="ato-preloader-bar-fill"></div>
      </div>
    </div>
  </div>

  <noscript><div><img src="https://mc.yandex.ru/watch/114297805" style="position:absolute; left:-9999px;" alt="" /></div></noscript>

  <div class="zmanim-bar">
    <div class="container zmanim-inner">
      <div class="zmanim-city">
        <span class="live-dot"></span>
        <span>Зманим • Москва</span>
        <span id="zmanimHebrewDate" class="zmanim-hebrew-date"></span>
      </div>
      <div class="zmanim-times">
        <div class="zmanim-item">
          <span>Зажигание свечей:</span>
          <strong id="candleTime">загрузка...</strong>
        </div>
        <div class="zmanim-item">
          <span>Выход Шаббата:</span>
          <strong id="havdalahTime">загрузка...</strong>
        </div>
      </div>
    </div>
  </div>

  <header>
    <div class="container header-grid">
      <div class="brand-block">
        <div class="logo-frame">
          <img src="logo.png" alt="Игуд Талмидей а-Ешивот — Сообщество АТО">
        </div>
        <div>
          <div class="brand-eyebrow">
            <span class="diamond"></span>
            <span>Tomchei Tmimin Lubavitch Moscow • תשפ״ז</span>
            <span class="diamond"></span>
          </div>
          <h1>Сообщество АТО</h1>
          <p class="subtitle">Игуд Талмидей а-Ешивот Москва • Архив журналов, койвецов, новости ешивы и не только!</p>
        </div>
      </div>
      <div class="tg-links">
        <a href="https://t.me/Igud_Talmidei_Haeshivot_5787" target="_blank" rel="noopener" class="tg-btn primary">
          <span>Telegram-канал АТО</span>
          <span>↗</span>
        </a>
        <a href="https://t.me/ATO_Moscow" target="_blank" rel="noopener" class="tg-sub-link">
          Связаться с редакцией: @ATO_Moscow
        </a>
      </div>
    </div>
  </header>

  <main>
    <div class="container">
      <div id="featuredIssueSlot"></div>
      <div id="calendarContextSlot"></div>
      <div id="dailyQuoteSlot"></div>

      <div class="controls">
        <nav class="main-tabs" id="mainTabs" aria-label="Разделы сайта">
          <button type="button" class="filter-btn active" data-mode="ARTICLES">Статьи</button>
          <button type="button" class="filter-btn" data-mode="ISSUES">Выпуски (PDF)</button>
          <button type="button" class="filter-btn" data-mode="NIGUNIM">Нигуним</button>
          <button type="button" class="filter-btn" data-mode="NEWS">Новости</button>
          <button type="button" class="filter-btn" data-mode="DONATE">Пожертвования</button>
          <button type="button" class="filter-btn" data-mode="ABOUT">О сообществе</button>
        </nav>
        <input type="search" id="searchInput" class="search-input" placeholder="Поиск по названию, главе или автору...">
      </div>

      <div class="sub-filters" id="rubricSubBar"></div>
      <div id="contentArea">
        <div class="status-box">Загрузка архива...</div>
      </div>
    </div>
  </main>

  <!-- Встроенная читалка PDF -->
  <div class="pdf-modal" id="pdfModal" role="dialog" aria-modal="true" aria-labelledby="pdfModalTitle">
    <div class="pdf-dialog">
      <div class="pdf-toolbar">
        <div class="pdf-title" id="pdfModalTitle">Просмотр документа</div>
        <div class="pdf-actions">
          <button type="button" id="pdfCopyLinkBtn" class="pdf-action-btn">Скопировать ссылку</button>
         <a href="#" id="pdfDownloadLink" target="_blank" rel="noopener noreferrer" class="pdf-action-btn">Скачать / Открыть ↗</a>
          <button type="button" id="pdfCloseBtn" class="pdf-close-btn">Закрыть ✕</button>
        </div>
      </div>
      <iframe id="pdfFrame" class="pdf-frame" src="" title="Встроенный просмотр PDF"></iframe>
    </div>
  </div>

  <footer>
    <div class="container footer-layout">
      <div class="footer-socials">
        <a href="https://t.me/Igud_Talmidei_Haeshivot_5787" target="_blank" rel="noopener" class="footer-social-btn" title="Официальный Telegram-канал АТО" aria-label="Telegram-канал АТО">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          <span>Канал АТО</span>
        </a>
        <a href="https://t.me/ATO_Moscow" target="_blank" rel="noopener" class="footer-social-btn" title="Связаться с редакцией @ATO_Moscow" aria-label="Связаться с редакцией">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Редакция @ATO_Moscow</span>
        </a>
      </div>
      <nav class="footer-legal-links" aria-label="Правовая информация и регламент">
        <button type="button" class="footer-doc-btn" data-doc="privacy">Политика конфиденциальности</button>
        <button type="button" class="footer-doc-btn" data-doc="terms">Условия использования материалов</button>
        <button type="button" class="footer-doc-btn" data-doc="support">О поддержке проектов</button>
        <button type="button" class="footer-doc-btn" data-doc="about_org">О редакции и контакты</button>
      </nav>
      <div class="footer-caption">
        Некоммерческий образовательно-издательский проект сообщества учеников ешивы <strong>«Игуд Талмидей а-Ешивот Москва» (АТО) • תשפ״ז</strong>.
        Материалы сайта предназначены для изучения Торы и Хасидута. Контакты редакции: <a href="https://t.me/ATO_Moscow" target="_blank" rel="noopener">@ATO_Moscow</a>.
      </div>
    </div>
  </footer>

  <!-- Модальное окно правовых и редакционных документов -->
  <div class="legal-modal" id="legalModal" role="dialog" aria-modal="true" aria-labelledby="legalModalTitle">
    <div class="legal-dialog">
      <div class="legal-toolbar">
        <div class="legal-title-wrap">
          <span class="diamond"></span>
          <h2 class="legal-title" id="legalModalTitle">Документ</h2>
        </div>
        <button type="button" id="legalCloseBtn" class="pdf-close-btn" aria-label="Закрыть окно">Закрыть ✕</button>
      </div>
      <div class="legal-body" id="legalModalBody"></div>
    </div>
  </div>

  <div id="nigunPlayerBar" class="nigun-player-bar" aria-label="Плеер нигуна">
    <div class="nigun-player-inner">
      <div class="nigun-player-info">
        <span id="nigunPlayerCategory" class="nigun-badge">♪ Нигун</span>
        <div class="nigun-title-wrap">
          <span id="nigunPlayerTitle" class="nigun-player-title">Название нигуна</span>
          <a id="nigunArticleLink" href="#" class="nigun-article-link" style="display:none;">Читать статью →</a>
        </div>
      </div>
      <div class="nigun-controls-center">
        <div class="nigun-transport">
          <button type="button" id="nigunShuffleBtn" class="nigun-icon-btn" title="Перемешать" aria-label="Перемешать">⇄</button>
          <button type="button" id="nigunPrevBtn" class="nigun-icon-btn" title="Предыдущий нигун" aria-label="Предыдущий">⏮</button>
          <button type="button" id="nigunPlayPauseBtn" class="nigun-play-btn" title="Пуск / Пауза" aria-label="Пуск / Пауза">▶</button>
          <button type="button" id="nigunNextBtn" class="nigun-icon-btn" title="Следующий нигун" aria-label="Следующий">⏭</button>
          <button type="button" id="nigunRepeatBtn" class="nigun-icon-btn" title="Повтор: выкл" aria-label="Повтор">↻</button>
        </div>
        <div class="nigun-timeline">
          <span id="nigunCurrentTime" class="nigun-time">0:00</span>
          <input type="range" id="nigunProgress" class="nigun-progress" min="0" max="100" step="0.1" value="0" aria-label="Перемотка" />
          <span id="nigunDurationTime" class="nigun-time">0:00</span>
        </div>
      </div>
      <div class="nigun-player-right">
        <input type="range" id="nigunVolume" class="nigun-volume" min="0" max="1" step="0.05" value="1" title="Громкость" aria-label="Громкость" />
        <a id="nigunDownloadBtn" href="#" download class="nigun-icon-btn" title="Скачать MP3" aria-label="Скачать MP3">⬇</a>
        <button type="button" id="nigunPlayerClose" class="nigun-close-btn" aria-label="Закрыть плеер" title="Закрыть">✕</button>
      </div>
    </div>
  </div>

  <button type="button" id="scrollTopBtn" class="scroll-top-btn" aria-label="Наверх" title="Наверх">↑</button>
  <script src="app.js"></script>
</body>
</html>

```

## Файл: `manifest.json`

```json
{
  "name": "Сообщество АТО • Москва (תשפ״ז)",
  "short_name": "АТО Москва",
  "description": "Игуд Талмидей а-Ешивот Москва • Архив журналов «Кунтрес Тмимим», койвецов, нигуним и новости ешивы.",
  "lang": "ru",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#F3F7FC",
  "theme_color": "#07162B",
  "icons": [
    {
      "src": "logo.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}

```

## Файл: `sw.js`

```javascript
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

```
