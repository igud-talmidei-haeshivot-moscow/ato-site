// ================= ЗАФИКСИРОВАННЫЕ ССЫЛКИ =================
const ARTICLES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=0&single=true&output=csv";
const ISSUES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=103090562&single=true&output=csv";
const NIGUNIM_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=1555876785&single=true&output=csv";
const PATRONS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=654627083&single=true&output=csv";
const NEWS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=948146673&single=true&output=csv";
const QUOTES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=1487106234&single=true&output=csv";
const DONATION_URL = "https://t.me/ATO_Moscow";
// ===========================================================

let allArticles = [];
let allIssues = [];
let allNigunim = [];
let allPatrons = [];
let allNews = [];
let allQuotes = [];
let currentQuoteIndex = 0;
let currentMode = "ARTICLES";
let currentRubric = "ALL";
let currentAuthor = "ALL";
let currentNigunCategory = "ALL";
let currentNewsCategory = "ALL";

function sanitizeUrl(url) {
  const clean = (url || "").trim();
  if (/^audio\/[a-zA-Z0-9._-]+$/i.test(clean)) return clean;
  return /^https?:\/\//i.test(clean) ? clean : "";
}

function getEmbedPdfUrl(url) {
  const safe = sanitizeUrl(url);
  if (!safe) return "";
  const driveMatch = safe.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  return safe;
}

function openPdfReader(title, rawUrl, hashSlug) {
  const safeUrl = sanitizeUrl(rawUrl);
  if (!safeUrl) return;

  if (hashSlug) {
    history.replaceState(null, "", `#${hashSlug}`);
  }

  if (typeof ym === "function") {
    ym(114297805, "reachGoal", "open_pdf", { doc_title: title || "Документ" });
  }

  const modal = document.getElementById("pdfModal");
  const titleEl = document.getElementById("pdfModalTitle");
  const frameEl = document.getElementById("pdfFrame");
  const downloadEl = document.getElementById("pdfDownloadLink");
  const copyBtn = document.getElementById("pdfCopyLinkBtn");

  titleEl.textContent = title || "Просмотр документа";
  downloadEl.href = safeUrl;
  frameEl.src = getEmbedPdfUrl(safeUrl);
  if (copyBtn) copyBtn.textContent = "Скопировать ссылку";

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closePdfReader() {
  const modal = document.getElementById("pdfModal");
  const frameEl = document.getElementById("pdfFrame");
  modal.classList.remove("open");
  frameEl.src = "";
  document.body.style.overflow = "";

  if (window.location.hash && /^#(issue|article)-/i.test(window.location.hash)) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function handleHashNavigation() {
  const hash = window.location.hash.replace(/^#/, "").trim();
  if (!hash) return;

  const issueMatch = hash.match(/^issue-(\d+)$/i);
  if (issueMatch) {
    const idx = parseInt(issueMatch[1], 10) - 1;
    const item = allIssues[idx];
    if (item && sanitizeUrl(item.link)) {
      currentMode = "ISSUES";
      const issuesBtn = document.querySelector('#mainTabs [data-mode="ISSUES"]');
      setActiveButton(issuesBtn);
      renderRubricSubBar(allArticles);
      renderContent();
      openPdfReader(item.title, item.link, `issue-${idx + 1}`);
    }
    return;
  }

  const articleMatch = hash.match(/^article-(\d+)$/i);
  if (articleMatch) {
    const idx = parseInt(articleMatch[1], 10) - 1;
    const item = allArticles[idx];
    if (item && sanitizeUrl(item.link)) {
      currentMode = "ARTICLES";
      currentRubric = "ALL";
      const articlesBtn = document.querySelector('#mainTabs [data-mode="ARTICLES"]');
      setActiveButton(articlesBtn);
      renderRubricSubBar(allArticles);
      renderContent();
      openPdfReader(item.title, item.link, `article-${idx + 1}`);
    }
    return;
  }

  const nigunMatch = hash.match(/^nigun-(\d+)$/i);
  if (nigunMatch) {
    const idx = parseInt(nigunMatch[1], 10) - 1;
    const item = allNigunim[idx];
    if (item && sanitizeUrl(item.audio)) {
      currentMode = "NIGUNIM";
      currentNigunCategory = "ALL";
      const nigunBtn = document.querySelector('#mainTabs [data-mode="NIGUNIM"]');
      setActiveButton(nigunBtn);
      renderRubricSubBar(allArticles);
      renderContent();
      playNigunFromList(item, allNigunim);
    }
    return;
  }

  const quoteMatch = hash.match(/^quote-(\d+)$/i);
  if (quoteMatch) {
    const idx = parseInt(quoteMatch[1], 10) - 1;
    if (allQuotes[idx]) {
      currentQuoteIndex = idx;
      renderDailyQuote(false);
      const slot = document.getElementById("dailyQuoteSlot");
      if (slot) {
        slot.scrollIntoView({ behavior: "smooth", block: "center" });
        slot.classList.add("quote-highlight");
        setTimeout(() => slot.classList.remove("quote-highlight"), 2200);
      }
    }
    return;
  }

  const authorMatch = hash.match(/^author-(.+)$/i);
  if (authorMatch) {
    const requestedSlug = decodeURIComponent(authorMatch[1]).toLowerCase();
    const matched = allArticles.find(a => a.author && toAuthorSlug(a.author).toLowerCase() === requestedSlug);
    if (matched) {
      filterByAuthor(matched.author, false);
    }
  }
}

function toAuthorSlug(authorName) {
  return (authorName || "")
    .trim()
    .replace(/\s+/g, "-");
}

function filterByAuthor(authorName, shouldScroll = true) {
  currentMode = "ARTICLES";
  currentRubric = "ALL";
  currentAuthor = authorName || "ALL";

  const articlesBtn = document.querySelector('#mainTabs [data-mode="ARTICLES"]');
  setActiveButton(articlesBtn);
  renderRubricSubBar(allArticles);
  renderContent();

  if (currentAuthor !== "ALL") {
    history.replaceState(null, "", `#author-${encodeURIComponent(toAuthorSlug(currentAuthor))}`);
    if (shouldScroll) {
      document.getElementById("mainTabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else if (window.location.hash && /^#author-/i.test(window.location.hash)) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function pluralizeArticles(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} публикация`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} публикации`;
  return `${count} публикаций`;
}

document.getElementById("pdfCloseBtn").addEventListener("click", closePdfReader);
document.getElementById("pdfModal").addEventListener("click", (e) => {
  if (e.target.id === "pdfModal") closePdfReader();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePdfReader();
});
window.addEventListener("hashchange", handleHashNavigation);

const copyLinkBtn = document.getElementById("pdfCopyLinkBtn");
if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyLinkBtn.textContent = "Ссылка скопирована ✓";
      setTimeout(() => {
        copyLinkBtn.textContent = "Скопировать ссылку";
      }, 2200);
    } catch (err) {
      prompt("Скопируйте прямую ссылку на документ:", window.location.href);
    }
  });
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let val = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      val += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(val.trim());
      val = "";
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
      if (ch === '\r') i++;
      row.push(val.trim());
      rows.push(row);
      row = [];
      val = "";
    } else {
      val += ch;
    }
  }
  if (val.length > 0 || row.length > 0) {
    row.push(val.trim());
    rows.push(row);
  }
  return rows;
}

const normalizeLabel = (str) => {
  const clean = (str || "").replace(/\s+/g, " ").trim();
  return clean ? clean[0].toUpperCase() + clean.slice(1).toLowerCase() : "";
};

function setActiveButton(targetBtn) {
  document.querySelectorAll("#mainTabs .filter-btn").forEach(b => b.classList.remove("active"));
  if (targetBtn) targetBtn.classList.add("active");
  const searchEl = document.getElementById("searchInput");
  searchEl.style.display = (currentMode === "DONATE" || currentMode === "ABOUT") ? "none" : "block";
  if (currentMode === "NIGUNIM") {
    searchEl.placeholder = "Поиск нигуна по названию или тому...";
  } else {
    searchEl.placeholder = "Поиск по названию, главе или автору...";
  }
}

function renderRubricSubBar(articles) {
  const subBar = document.getElementById("rubricSubBar");
  if (!subBar) return;

  if (currentMode !== "ARTICLES") {
    subBar.innerHTML = "";
    return;
  }

  const rubrics = ["ALL", ...new Set(articles.map(item => item.rubric).filter(Boolean))];
  subBar.innerHTML = "";

  rubrics.forEach(rubric => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = currentRubric === rubric ? "sub-btn active" : "sub-btn";
    btn.textContent = rubric === "ALL" ? "Все рубрики" : rubric;
    btn.onclick = () => {
      currentRubric = rubric;
      renderRubricSubBar(articles);
      renderContent();
    };
    subBar.appendChild(btn);
  });
}

function setupFilters(articles) {
  const tabs = document.querySelectorAll("#mainTabs .filter-btn");
  tabs.forEach(btn => {
    btn.onclick = () => {
      currentMode = btn.dataset.mode;
      if (currentMode === "ARTICLES") {
        currentRubric = "ALL";
        currentAuthor = "ALL";
        if (window.location.hash && /^#author-/i.test(window.location.hash)) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
      if (currentMode === "NIGUNIM") currentNigunCategory = "ALL";
      if (currentMode === "NEWS") currentNewsCategory = "ALL";
      setActiveButton(btn);
      renderRubricSubBar(articles);
      renderContent();
    };
  });

  renderRubricSubBar(articles);
}
async function copyShareUrlToClipboard(hashSlug, btnEl, defaultLabel) {
const baseUrl = `${window.location.origin}${window.location.pathname}`;
const fullUrl = hashSlug ? `${baseUrl}#${hashSlug}` : baseUrl;
try {
await navigator.clipboard.writeText(fullUrl);
if (btnEl) {
btnEl.classList.add("copied");
btnEl.textContent = "✓ Скопировано";
setTimeout(() => {
btnEl.classList.remove("copied");
btnEl.textContent = defaultLabel;
}, 2200);
}
} catch (err) {
prompt("Скопируйте прямую ссылку:", fullUrl);
}
}

function renderFeaturedIssue() {
const slot = document.getElementById("featuredIssueSlot");
if (!slot) return;
const latest = allIssues.find(item => sanitizeUrl(item.link));
if (!latest) {
slot.innerHTML = "";
return;
}

const slug = `issue-${latest.id}`;
const metaBadge = [latest.type || "Выпуск", latest.period].filter(Boolean).join(" • ");
const rawDesc = (latest.desc || "").replace(/\s+/g, " ").trim();
const shortDesc = rawDesc.length > 195 ? `${rawDesc.slice(0, 192).trim()}…` : rawDesc;

slot.innerHTML = `
<section class="featured-issue-banner" aria-label="Свежий выпуск номера">
<div class="featured-issue-content">
<div class="featured-issue-eyebrow">
<span class="featured-pill">★ Свежий номер</span>
<span class="featured-meta">${metaBadge}</span>
</div>
<h2 class="featured-issue-title">${latest.title}</h2>
${shortDesc ? `<p class="featured-issue-desc">${shortDesc}</p>` : ""}
</div>
<div class="featured-issue-actions" id="featuredIssueActions"></div>
</section>
`;

const actionsEl = document.getElementById("featuredIssueActions");

const readBtn = document.createElement("button");
readBtn.type = "button";
readBtn.className = "featured-btn primary";
readBtn.textContent = "Читать выпуск →";
readBtn.onclick = () => openPdfReader(latest.title, latest.link, slug);
actionsEl.appendChild(readBtn);

const shareBtn = document.createElement("button");
shareBtn.type = "button";
shareBtn.className = "featured-btn secondary";
shareBtn.textContent = "Поделиться";
shareBtn.onclick = () => copyShareUrlToClipboard(slug, shareBtn, "Поделиться");
actionsEl.appendChild(shareBtn);

const allBtn = document.createElement("button");
allBtn.type = "button";
allBtn.className = "featured-btn ghost";
allBtn.textContent = `Все выпуски (${allIssues.length})`;
allBtn.onclick = () => {
const issuesTab = document.querySelector('#mainTabs [data-mode="ISSUES"]');
if (issuesTab) issuesTab.click();
document.getElementById("mainTabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
};
actionsEl.appendChild(allBtn);
}
function buildQuotesPool(manualQuotes, articles) {
  if (manualQuotes.length > 0) return manualQuotes;

  return articles
    .filter(a => a.rubric.toLowerCase() === "суть томима" && a.desc)
    .map((a, idx) => ({
      id: idx + 1,
      text: a.desc,
      source: a.author ? `«${a.title}» • ${a.author}` : `«${a.title}»`,
      title: a.title,
      link: a.link,
      articleId: a.id
    }));
}

function renderDailyQuote(excludeCurrent = false, forcedIndex = null) {
  const slot = document.getElementById("dailyQuoteSlot");
  if (!slot || allQuotes.length === 0) return;

  if (forcedIndex !== null && forcedIndex >= 0 && forcedIndex < allQuotes.length) {
    currentQuoteIndex = forcedIndex;
  } else if (allQuotes.length === 1) {
    currentQuoteIndex = 0;
  } else {
    let nextIndex = Math.floor(Math.random() * allQuotes.length);
    if (excludeCurrent && nextIndex === currentQuoteIndex) {
      nextIndex = (nextIndex + 1) % allQuotes.length;
    }
    currentQuoteIndex = nextIndex;
  }

  const item = allQuotes[currentQuoteIndex];
  const quoteSlug = `quote-${item.id || currentQuoteIndex + 1}`;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const quoteShareUrl = `${baseUrl}#${quoteSlug}`;

  if (forcedIndex !== null || /^#quote-\d+$/i.test(window.location.hash)) {
    history.replaceState(null, "", `#${quoteSlug}`);
  }

  slot.innerHTML = `
    <section class="daily-quote-box" aria-label="Быть Томимом каждый день">
      <div class="daily-quote-top">
        <div class="daily-quote-label">
          <span class="diamond"></span>
          <span>Быть Томимом каждый день</span>
        </div>
      </div>
      <blockquote class="daily-quote-text">«${item.text.replace(/^[«"]|[»"]$/g, "")}»</blockquote>
      <div class="daily-quote-bottom">
        <div class="daily-quote-source">— ${item.source}</div>
        <div class="daily-quote-actions" id="dailyQuoteActions"></div>
      </div>
    </section>
  `;

  const actionsEl = document.getElementById("dailyQuoteActions");

  if (sanitizeUrl(item.link)) {
    const readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.className = "quote-btn primary";
    readBtn.textContent = "Читать статью →";
    const slug = item.articleId ? `article-${item.articleId}` : "";
    readBtn.onclick = () => openPdfReader(item.title || item.source, item.link, slug);
    actionsEl.appendChild(readBtn);
  }

  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "quote-btn";
  shareBtn.textContent = "Поделиться цитатой";
  shareBtn.onclick = async () => {
    const shareText = `«${item.text.replace(/^[«"]|[»"]$/g, "")}»\n\n— ${item.source} (Сообщество АТО • Москва)\nОткрыть цитату на сайте: ${quoteShareUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      shareBtn.textContent = "Ссылка и цитата скопированы ✓";
      setTimeout(() => { shareBtn.textContent = "Поделиться цитатой"; }, 2200);
    } catch (e) {
      prompt("Скопируйте цитату для отправки:", shareText);
    }
  };
  actionsEl.appendChild(shareBtn);

  if (allQuotes.length > 1) {
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "quote-btn";
    nextBtn.textContent = "Другая мысль ↻";
    nextBtn.onclick = () => renderDailyQuote(true);
    actionsEl.appendChild(nextBtn);
  }
}

// ================= КАСТОМНЫЙ АУДИОПЛЕЕР НИГУНОВ =================
const nigunAudio = new Audio();
nigunAudio.preload = "metadata";

let currentPlaylist = [];
let currentTrackIndex = -1;
let currentTrackKey = "";
let isShuffleMode = false;
let repeatMode = "OFF"; // "OFF" | "ALL" | "ONE"

function formatAudioTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function resolveAudioSrc(rawUrl) {
  const safe = sanitizeUrl(rawUrl);
  if (!safe) return "";
  const driveMatch = safe.match(/(?:drive\.google\.com\/file\/d\/|[?&]id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `audio/${driveMatch[1]}.mp3`;
  }
  return safe;
}

function updateActiveTrackHighlight() {
  document.querySelectorAll(".nigun-row").forEach(row => {
    const isCurrent = row.dataset.trackKey === currentTrackKey;
    row.classList.toggle("playing", isCurrent && !nigunAudio.paused);
    row.classList.toggle("active-track", isCurrent);
    const btn = row.querySelector(".nigun-row-play");
    if (btn) {
      btn.textContent = (isCurrent && !nigunAudio.paused) ? "❚❚" : "▶";
    }
  });
}

const NIGUN_ARTICLE_ALIASES = {
  "mitteler rebbe's kaplye": "дем миттелер ребес капела"
};

function resolveNigunArticle(track) {
  if (!track) return null;
  const rawLink = sanitizeUrl(track.articleLink);
  const normTitle = (track.title || "").toLowerCase().trim();
  const aliasTitle = NIGUN_ARTICLE_ALIASES[normTitle] || normTitle;

  const matchedArticle = allArticles.find(a => {
    const aLink = sanitizeUrl(a.link);
    if (rawLink && aLink && rawLink === aLink) return true;
    const aTitle = (a.title || "").toLowerCase().trim();
    return aTitle && (aTitle === normTitle || aTitle === aliasTitle);
  });

  const finalUrl = rawLink || (matchedArticle ? sanitizeUrl(matchedArticle.link) : "");
  if (!finalUrl) return null;

  return {
    url: finalUrl,
    title: matchedArticle ? matchedArticle.title : (track.title || "Статья о нигуне"),
    slug: matchedArticle ? `article-${matchedArticle.id}` : ""
  };
}

function playTrackObject(track) {
  if (!track) return;
  const src = resolveAudioSrc(track.audio);
  if (!src) return;

  const bar = document.getElementById("nigunPlayerBar");
  const titleEl = document.getElementById("nigunPlayerTitle");
  const catEl = document.getElementById("nigunPlayerCategory");
  const articleEl = document.getElementById("nigunArticleLink");
  const playBtn = document.getElementById("nigunPlayPauseBtn");
  const progressEl = document.getElementById("nigunProgress");
  const curTimeEl = document.getElementById("nigunCurrentTime");
  const durTimeEl = document.getElementById("nigunDurationTime");
  const downloadBtn = document.getElementById("nigunDownloadBtn");

  currentTrackKey = track.key || src;
  titleEl.textContent = track.title || "Нигун";
  catEl.textContent = track.category ? `♪ ${track.category}` : "♪ Нигун";
  progressEl.value = 0;
  curTimeEl.textContent = "0:00";
  durTimeEl.textContent = "...";
  playBtn.textContent = "❚❚";

  if (downloadBtn) {
    downloadBtn.href = src;
    downloadBtn.setAttribute("download", `${(track.title || "nigun").replace(/[\\/:*?"<>|]/g, "_")}.mp3`);
  }

const resolvedArticle = resolveNigunArticle(track);
  if (articleEl) {
    if (resolvedArticle) {
      articleEl.style.display = "inline-block";
      articleEl.href = resolvedArticle.url;
      articleEl.title = `Открыть статью: ${resolvedArticle.title}`;
      articleEl.onclick = (e) => {
        e.preventDefault();
        openPdfReader(resolvedArticle.title, resolvedArticle.url, resolvedArticle.slug);
      };
    } else {
      articleEl.style.display = "none";
      articleEl.onclick = null;
    }
  }

  if (track.id) {
    history.replaceState(null, "", `#nigun-${track.id}`);
  }

  nigunAudio.src = src;
  nigunAudio.play()
    .then(() => {
      playBtn.textContent = "❚❚";
      updateActiveTrackHighlight();
    })
    .catch(() => {
      playBtn.textContent = "▶";
      durTimeEl.textContent = "Ошибка файла";
      updateActiveTrackHighlight();
    });

  bar.classList.add("open");
  document.body.classList.add("player-open");
  updateActiveTrackHighlight();
}

function playNigunFromList(track, list) {
  currentPlaylist = Array.isArray(list) && list.length > 0 ? list : [track];
  currentTrackIndex = currentPlaylist.findIndex(t => (t.key || t.audio) === (track.key || track.audio));
  if (currentTrackIndex < 0) currentTrackIndex = 0;
  playTrackObject(currentPlaylist[currentTrackIndex]);
}

function openNigunPlayer(title, rawAudioUrl) {
  const singleTrack = {
    key: `article-${rawAudioUrl}`,
    title: title || "Нигун месяца",
    category: "Нигун к статье",
    audio: rawAudioUrl,
    articleLink: ""
  };
  playNigunFromList(singleTrack, [singleTrack]);
}

function playNextTrack(autoTriggered = false) {
  if (currentPlaylist.length === 0) return;

  if (autoTriggered && repeatMode === "ONE") {
    nigunAudio.currentTime = 0;
    nigunAudio.play();
    return;
  }

  if (isShuffleMode && currentPlaylist.length > 1) {
    let nextIdx = Math.floor(Math.random() * currentPlaylist.length);
    if (nextIdx === currentTrackIndex) {
      nextIdx = (nextIdx + 1) % currentPlaylist.length;
    }
    currentTrackIndex = nextIdx;
    playTrackObject(currentPlaylist[currentTrackIndex]);
    return;
  }

  if (currentTrackIndex + 1 < currentPlaylist.length) {
    currentTrackIndex++;
    playTrackObject(currentPlaylist[currentTrackIndex]);
  } else if (repeatMode === "ALL") {
    currentTrackIndex = 0;
    playTrackObject(currentPlaylist[currentTrackIndex]);
  } else {
    const playBtn = document.getElementById("nigunPlayPauseBtn");
    if (playBtn) playBtn.textContent = "▶";
    updateActiveTrackHighlight();
  }
}

function playPrevTrack() {
  if (currentPlaylist.length === 0) return;
  if (nigunAudio.currentTime > 4) {
    nigunAudio.currentTime = 0;
    return;
  }
  if (currentTrackIndex > 0) {
    currentTrackIndex--;
  } else {
    currentTrackIndex = currentPlaylist.length - 1;
  }
  playTrackObject(currentPlaylist[currentTrackIndex]);
}

function closeNigunPlayer() {
  nigunAudio.pause();
  nigunAudio.src = "";
  currentTrackKey = "";
  const bar = document.getElementById("nigunPlayerBar");
  if (bar) bar.classList.remove("open");
  document.body.classList.remove("player-open");
  updateActiveTrackHighlight();
  if (window.location.hash && /^#nigun-/i.test(window.location.hash)) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

const playPauseBtn = document.getElementById("nigunPlayPauseBtn");
const prevTrackBtn = document.getElementById("nigunPrevBtn");
const nextTrackBtn = document.getElementById("nigunNextBtn");
const shuffleTrackBtn = document.getElementById("nigunShuffleBtn");
const repeatTrackBtn = document.getElementById("nigunRepeatBtn");
const progressSlider = document.getElementById("nigunProgress");
const volumeSlider = document.getElementById("nigunVolume");
const curTimeLabel = document.getElementById("nigunCurrentTime");
const durTimeLabel = document.getElementById("nigunDurationTime");

if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (!nigunAudio.src) return;
    if (nigunAudio.paused) {
      nigunAudio.play();
      playPauseBtn.textContent = "❚❚";
    } else {
      nigunAudio.pause();
      playPauseBtn.textContent = "▶";
    }
    updateActiveTrackHighlight();
  });
}

if (prevTrackBtn) prevTrackBtn.addEventListener("click", playPrevTrack);
if (nextTrackBtn) nextTrackBtn.addEventListener("click", () => playNextTrack(false));

if (shuffleTrackBtn) {
  shuffleTrackBtn.addEventListener("click", () => {
    isShuffleMode = !isShuffleMode;
    shuffleTrackBtn.classList.toggle("active", isShuffleMode);
    shuffleTrackBtn.title = isShuffleMode ? "Перемешивание: вкл" : "Перемешать";
  });
}

if (repeatTrackBtn) {
  repeatTrackBtn.addEventListener("click", () => {
    if (repeatMode === "OFF") {
      repeatMode = "ALL";
      repeatTrackBtn.classList.add("active");
      repeatTrackBtn.textContent = "↻";
      repeatTrackBtn.title = "Повтор: весь список";
    } else if (repeatMode === "ALL") {
      repeatMode = "ONE";
      repeatTrackBtn.classList.add("active");
      repeatTrackBtn.textContent = "↻1";
      repeatTrackBtn.title = "Повтор: один нигун";
    } else {
      repeatMode = "OFF";
      repeatTrackBtn.classList.remove("active");
      repeatTrackBtn.textContent = "↻";
      repeatTrackBtn.title = "Повтор: выкл";
    }
  });
}

nigunAudio.addEventListener("timeupdate", () => {
  if (!isFinite(nigunAudio.duration)) return;
  progressSlider.value = (nigunAudio.currentTime / nigunAudio.duration) * 100;
  curTimeLabel.textContent = formatAudioTime(nigunAudio.currentTime);
  durTimeLabel.textContent = formatAudioTime(nigunAudio.duration);
});

nigunAudio.addEventListener("loadedmetadata", () => {
  curTimeLabel.textContent = "0:00";
  durTimeLabel.textContent = formatAudioTime(nigunAudio.duration);
});

nigunAudio.addEventListener("ended", () => {
  playNextTrack(true);
});

if (progressSlider) {
  progressSlider.addEventListener("input", () => {
    if (isFinite(nigunAudio.duration)) {
      nigunAudio.currentTime = (progressSlider.value / 100) * nigunAudio.duration;
    }
  });
}

if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    nigunAudio.volume = parseFloat(volumeSlider.value);
  });
}

function syncPlayerLayoutOffset() {
  const bar = document.getElementById("nigunPlayerBar");
  const scrollBtn = document.getElementById("scrollTopBtn");
  const footerEl = document.querySelector("footer");
  if (!bar || !document.body.classList.contains("player-open")) {
    if (scrollBtn) scrollBtn.style.bottom = "";
    if (footerEl) footerEl.style.paddingBottom = "";
    return;
  }
  const barHeight = bar.offsetHeight || 0;
  if (barHeight > 0) {
    if (scrollBtn) scrollBtn.style.bottom = `${barHeight + 14}px`;
    if (footerEl) footerEl.style.paddingBottom = `${barHeight + 24}px`;
  }
}

window.addEventListener("resize", syncPlayerLayoutOffset, { passive: true });
const playerBarEl = document.getElementById("nigunPlayerBar");
if (playerBarEl && typeof ResizeObserver !== "undefined") {
  new ResizeObserver(syncPlayerLayoutOffset).observe(playerBarEl);
}

const nigunCloseBtn = document.getElementById("nigunPlayerClose");
if (nigunCloseBtn) {
  nigunCloseBtn.addEventListener("click", () => {
    closeNigunPlayer();
    syncPlayerLayoutOffset();
  });
}
// ================================================================
// Горячие клавиши плеера: Space (пуск/пауза), ← / → (перемотка ±5 сек)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  const activeEl = document.activeElement;
  const tagName = activeEl ? activeEl.tagName : "";
  if (
    activeEl?.id === "searchInput" ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    activeEl?.isContentEditable
  ) {
    return;
  }

  const pdfModal = document.getElementById("pdfModal");
  if (pdfModal && pdfModal.classList.contains("open")) return;

  if (!nigunAudio.src) return;

  if (e.code === "Space") {
    e.preventDefault();
    if (nigunAudio.paused) {
      nigunAudio.play();
      if (playPauseBtn) playPauseBtn.textContent = "❚❚";
    } else {
      nigunAudio.pause();
      if (playPauseBtn) playPauseBtn.textContent = "▶";
    }
    updateActiveTrackHighlight();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    if (isFinite(nigunAudio.duration)) {
      nigunAudio.currentTime = Math.max(0, nigunAudio.currentTime - 5);
    }
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    if (isFinite(nigunAudio.duration)) {
      nigunAudio.currentTime = Math.min(nigunAudio.duration, nigunAudio.currentTime + 5);
    }
  }
});
// ================================================================
// ================================================================

function renderNigunimSection(area, query) {
  area.innerHTML = "";

  const uniqueCats = [...new Set(allNigunim.map(n => n.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ru", { numeric: true }));

  const subBar = document.createElement("div");
  subBar.className = "sub-filters";

  ["ALL", ...uniqueCats].forEach(cat => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = currentNigunCategory === cat ? "sub-btn active" : "sub-btn";
    btn.textContent = cat === "ALL" ? `Все тома (${allNigunim.length})` : cat;
    btn.onclick = () => {
      currentNigunCategory = cat;
      renderContent();
    };
    subBar.appendChild(btn);
  });

  area.appendChild(subBar);

  const filtered = allNigunim.filter(item => {
    const matchCat = currentNigunCategory === "ALL" || item.category === currentNigunCategory;
    const matchQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "status-box";
    emptyBox.textContent = "Нигуны по вашему запросу не найдены";
    area.appendChild(emptyBox);
    return;
  }

  const toolbar = document.createElement("div");
  toolbar.className = "nigun-list-toolbar";

  const countInfo = document.createElement("div");
  countInfo.className = "nigun-count-info";
  countInfo.textContent = `Найдено нигунов: ${filtered.length}`;

  const playAllBtn = document.createElement("button");
  playAllBtn.type = "button";
  playAllBtn.className = "quote-btn primary";
  playAllBtn.textContent = "▶ Слушать всё подряд";
  playAllBtn.onclick = () => playNigunFromList(filtered[0], filtered);

  toolbar.append(countInfo, playAllBtn);
  area.appendChild(toolbar);

  const listWrap = document.createElement("div");
  listWrap.className = "nigun-list";

  filtered.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "nigun-row";
    row.dataset.trackKey = item.key;
    if (item.key === currentTrackKey) {
      row.classList.add("active-track");
      if (!nigunAudio.paused) row.classList.add("playing");
    }

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "nigun-row-play";
    playBtn.setAttribute("aria-label", `Слушать ${item.title}`);
    playBtn.textContent = (item.key === currentTrackKey && !nigunAudio.paused) ? "❚❚" : "▶";
    playBtn.onclick = () => {
      if (item.key === currentTrackKey && nigunAudio.src) {
        if (nigunAudio.paused) {
          nigunAudio.play();
        } else {
          nigunAudio.pause();
        }
        const barBtn = document.getElementById("nigunPlayPauseBtn");
        if (barBtn) barBtn.textContent = nigunAudio.paused ? "▶" : "❚❚";
        updateActiveTrackHighlight();
      } else {
        playNigunFromList(item, filtered);
      }
    };

    const numEl = document.createElement("span");
    numEl.className = "nigun-row-num";
    numEl.textContent = String(index + 1).padStart(2, "0");

    const infoWrap = document.createElement("div");
    infoWrap.className = "nigun-row-info";
    infoWrap.onclick = () => playNigunFromList(item, filtered);

    const titleEl = document.createElement("div");
    titleEl.className = "nigun-row-title";
    titleEl.textContent = item.title;
    infoWrap.appendChild(titleEl);

    const actionsWrap = document.createElement("div");
    actionsWrap.className = "nigun-row-actions";

    if (item.category) {
      const tagEl = document.createElement("span");
      tagEl.className = "nigun-row-tag";
      tagEl.textContent = item.category;
      actionsWrap.appendChild(tagEl);
    }

const resolvedArticle = resolveNigunArticle(item);
    if (resolvedArticle) {
      const artBtn = document.createElement("button");
      artBtn.type = "button";
      artBtn.className = "nigun-row-article";
      artBtn.title = `Читать статью: ${resolvedArticle.title}`;
      artBtn.textContent = "Статья →";
      artBtn.onclick = (e) => {
        e.stopPropagation();
        openPdfReader(resolvedArticle.title, resolvedArticle.url, resolvedArticle.slug);
      };
      actionsWrap.appendChild(artBtn);
    }
   const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "nigun-row-share";
    shareBtn.title = "Скопировать прямую ссылку на нигун";
    shareBtn.setAttribute("aria-label", `Поделиться нигуном ${item.title}`);
    shareBtn.textContent = "Поделиться";
    shareBtn.onclick = (e) => {
      e.stopPropagation();
      copyShareUrlToClipboard(item.key, shareBtn, "Поделиться");
    };
    actionsWrap.appendChild(shareBtn);

    const resolvedSrc = resolveAudioSrc(item.audio);
    if (resolvedSrc) {
      const dlLink = document.createElement("a");
      dlLink.href = resolvedSrc;
      dlLink.setAttribute("download", `${item.title.replace(/[\\/:*?"<>|]/g, "_")}.mp3`);
      dlLink.className = "nigun-row-dl";
      dlLink.title = "Скачать MP3";
      dlLink.textContent = "⬇";
      dlLink.onclick = (e) => e.stopPropagation();
      actionsWrap.appendChild(dlLink);
    }

    row.append(playBtn, numEl, infoWrap, actionsWrap);
    listWrap.appendChild(row);
  });

  area.appendChild(listWrap);
}

function buildCardElement(item, isIssue, animIndex) {
const card = document.createElement("article");
card.className = isIssue ? "card issue-card" : "card";
card.style.animationDelay = `${Math.min(animIndex * 55, 450)}ms`;

const topWrapper = document.createElement("div");
const cardTop = document.createElement("div");
cardTop.className = "card-top";

const leftSpan = document.createElement("span");
leftSpan.className = "card-top-badge";
leftSpan.textContent = isIssue ? (item.type || "Выпуск") : (item.rubric || "Статья");

let rightEl;
if (!isIssue && item.author) {
  rightEl = document.createElement("button");
  rightEl.type = "button";
  rightEl.className = "card-top-meta author-top-btn";
  rightEl.title = `Показать все статьи автора: ${item.author}`;
  rightEl.textContent = item.author;
  rightEl.onclick = (e) => {
    e.stopPropagation();
    filterByAuthor(item.author, true);
  };
} else {
  rightEl = document.createElement("span");
  rightEl.className = "card-top-meta";
  rightEl.textContent = isIssue ? (item.period || "") : "";
}

cardTop.append(leftSpan, rightEl);
const cardBody = document.createElement("div");
cardBody.className = "card-body";

const titleEl = document.createElement("h2");
titleEl.className = "card-title";
titleEl.textContent = item.title;
cardBody.appendChild(titleEl);

if (item.desc) {
const descEl = document.createElement("p");
descEl.className = "card-desc";
descEl.textContent = item.desc;
cardBody.appendChild(descEl);
}

topWrapper.append(cardTop, cardBody);

const cardFooter = document.createElement("div");
cardFooter.className = "card-footer";

const actionsRow = document.createElement("div");
actionsRow.className = "card-footer-actions";

const safeLink = sanitizeUrl(item.link);
const slug = isIssue ? `issue-${item.id}` : `article-${item.id}`;

if (safeLink) {
const primaryRow = document.createElement("div");
primaryRow.className = "card-primary-row";

const readBtn = document.createElement("button");
readBtn.type = "button";
readBtn.className = "read-btn";
readBtn.textContent = isIssue ? "Читать выпуск →" : "Читать материал →";
readBtn.onclick = () => openPdfReader(item.title, safeLink, slug);

const shareBtn = document.createElement("button");
shareBtn.type = "button";
shareBtn.className = "card-share-btn";
shareBtn.title = "Скопировать прямую ссылку";
shareBtn.setAttribute("aria-label", "Скопировать прямую ссылку");
shareBtn.textContent = "Поделиться";
shareBtn.onclick = () => copyShareUrlToClipboard(slug, shareBtn, "Поделиться");

primaryRow.append(readBtn, shareBtn);
actionsRow.appendChild(primaryRow);
} else {
const stubEl = document.createElement("span");
stubEl.className = "read-btn";
stubEl.style.opacity = "0.5";
stubEl.style.cursor = "default";
stubEl.textContent = "Файл готовится";
actionsRow.appendChild(stubEl);
}

const safeAudio = !isIssue ? sanitizeUrl(item.audio) : "";
if (safeAudio) {
const listenBtn = document.createElement("button");
listenBtn.type = "button";
listenBtn.className = "listen-btn";
listenBtn.textContent = "♪ Слушать нигун к статье";
listenBtn.onclick = () => openNigunPlayer(item.title, safeAudio);
actionsRow.appendChild(listenBtn);
}

cardFooter.appendChild(actionsRow);
card.append(topWrapper, cardFooter);
return card;
}
function renderNewsSection(area, query) {
  area.innerHTML = "";

  const subBar = document.createElement("div");
  subBar.className = "sub-filters";
  const categories = [
    { id: "ALL", label: "Все публикации" },
    { id: "Афиша", label: "Афиша событий" },
    { id: "Спойлер", label: "Спойлеры выпусков" },
    { id: "Новость ешивы", label: "Новости ешивы" }
  ];

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = currentNewsCategory === cat.id ? "sub-btn active" : "sub-btn";
    btn.textContent = cat.label;
    btn.onclick = () => {
      currentNewsCategory = cat.id;
      renderContent();
    };
    subBar.appendChild(btn);
  });

  area.appendChild(subBar);

  const filteredNews = allNews.filter(item => {
    const matchCat = currentNewsCategory === "ALL" || item.type.toLowerCase() === currentNewsCategory.toLowerCase();
    const matchQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      item.body.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  if (filteredNews.length === 0) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "status-box";
    emptyBox.textContent = "В этом разделе пока нет публикаций";
    area.appendChild(emptyBox);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid";

  filteredNews.forEach((item, index) => {
    const card = document.createElement("article");
    let typeClass = "card";
    if (item.type.toLowerCase().includes("афиша")) typeClass += " news-afisha";
    else if (item.type.toLowerCase().includes("спойлер")) typeClass += " news-spoiler";
    card.className = typeClass;
    card.style.animationDelay = `${Math.min(index * 55, 450)}ms`;

    const topWrapper = document.createElement("div");

    const cardTop = document.createElement("div");
    cardTop.className = "card-top";
    const leftSpan = document.createElement("span");
    leftSpan.textContent = item.type || "Новость";
    const rightSpan = document.createElement("span");
    rightSpan.textContent = item.date || "";
    cardTop.append(leftSpan, rightSpan);
    topWrapper.appendChild(cardTop);

    const safePhotoUrl = sanitizeUrl(item.photo);
    if (safePhotoUrl) {
      const photoWrap = document.createElement("div");
      photoWrap.className = "card-photo-wrap";
      const imgEl = document.createElement("img");
      imgEl.src = safePhotoUrl;
      imgEl.alt = item.title || "Иллюстрация публикации";
      imgEl.className = "card-photo";
      imgEl.loading = "lazy";
      imgEl.onerror = () => { photoWrap.style.display = "none"; };
      photoWrap.appendChild(imgEl);
      topWrapper.appendChild(photoWrap);
    }

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    const titleEl = document.createElement("h2");
    titleEl.className = "card-title";
    titleEl.textContent = item.title;
    cardBody.appendChild(titleEl);

    if (item.body) {
      const descEl = document.createElement("p");
      descEl.className = "card-desc";
      descEl.textContent = item.body;
      cardBody.appendChild(descEl);
    }

    topWrapper.appendChild(cardBody);

    const cardFooter = document.createElement("div");
    cardFooter.className = "card-footer";
    const safePostUrl = sanitizeUrl(item.link) || "https://t.me/Igud_Talmidei_Haeshivot_5787";

    const tgLink = document.createElement("a");
    tgLink.href = safePostUrl;
    tgLink.target = "_blank";
    tgLink.rel = "noopener noreferrer";
    tgLink.className = "read-btn";
    tgLink.textContent = "Открыть пост в Telegram ↗";
    cardFooter.appendChild(tgLink);

    card.append(topWrapper, cardFooter);
    grid.appendChild(card);
  });

  area.appendChild(grid);
}

function renderDonateSection(area) {
  const layout = document.createElement("div");
  layout.className = "donate-layout";

  const donateBox = document.createElement("section");
  donateBox.className = "donate-box";
  donateBox.innerHTML = `
    <h2>Поддержать проекты сообщества АТО</h2>
    <p>Каждый выпуск «Кунтрес Тмимим», издание койвецов и проекты для учеников ешивы становятся возможными благодаря вашей поддержке.</p>
    <ul class="donate-list">
      <li>Печать новых тиражей журнала и койвецов</li>
      <li>Поддержка команды АТО</li>
    </ul>
  `;

  const ctaBtn = document.createElement("a");
  ctaBtn.href = sanitizeUrl(DONATION_URL) || "https://t.me/ATO_Moscow";
  ctaBtn.target = "_blank";
  ctaBtn.rel = "noopener noreferrer";
  ctaBtn.className = "donate-cta";
  ctaBtn.textContent = "Поддержать АТО →";
  donateBox.appendChild(ctaBtn);

  const patronsBox = document.createElement("section");
  patronsBox.className = "patrons-box";

  const patronsHeader = document.createElement("div");
  patronsHeader.className = "patrons-header";
  patronsHeader.innerHTML = `<h2>Топ-10 меценатов АТО</h2><span>Благодарность редакции</span>`;
  patronsBox.appendChild(patronsHeader);

  const topTen = allPatrons.slice(0, 10);
  if (topTen.length === 0) {
    const emptyNote = document.createElement("div");
    emptyNote.style.padding = "2rem 1.25rem";
    emptyNote.style.textAlign = "center";
    emptyNote.style.color = "#4A607A";
    emptyNote.textContent = "Список меценатов обновляется.";
    patronsBox.appendChild(emptyNote);
  } else {
    topTen.forEach((patron, index) => {
      const row = document.createElement("div");
      row.className = index < 3 ? "patron-row top-3" : "patron-row";

      const rankEl = document.createElement("div");
      rankEl.className = "patron-rank";
      rankEl.textContent = String(index + 1).padStart(2, "0");

      const infoEl = document.createElement("div");
      const nameEl = document.createElement("div");
      nameEl.className = "patron-name";
      nameEl.textContent = patron.name;
      infoEl.appendChild(nameEl);

      if (patron.dedication) {
        const dedEl = document.createElement("div");
        dedEl.className = "patron-dedication";
        dedEl.textContent = patron.dedication;
        infoEl.appendChild(dedEl);
      }

      const tierEl = document.createElement("div");
      tierEl.className = "patron-tier";
      tierEl.textContent = patron.tier || "Меценат АТО";

      row.append(rankEl, infoEl, tierEl);
      patronsBox.appendChild(row);
    });
  }

  layout.append(donateBox, patronsBox);
  area.innerHTML = "";
  area.appendChild(layout);
}

function renderAboutSection(area) {
  area.innerHTML = `
    <div class="about-layout">
      <section class="about-hero">
        <h2>Игуд Талмидей а-Ешивот Москва (АТО) • תשפ״ז</h2>
        <p>Сообщество АТО — это пространство для Тмимим, учёбы и общих инициатив учеников ешив. Мы объединяем ребят вокруг изучения Торы и Хасидута, издательских проектов и атмосферы, в которой каждый Томим может проявить себя, поделиться мыслями и стать частью общего дела.</p>
      </section>

      <div class="about-grid">
        <article class="about-card">
          <div class="about-card-tag"><span class="diamond"></span><span>Направление 01</span></div>
          <h3>Издательство и журналы</h3>
          <p>Выпуск ежемесячного журнала «Кунтрес Тмимим» и тематических койвецов к хасидским датам — от глубоких разборов маамаров и сихот Ребе до исторических хроник, интервью и нигунов месяца.</p>
        </article>

        <article class="about-card">
          <div class="about-card-tag"><span class="diamond"></span><span>Направление 02</span></div>
          <h3>Взаимопомощь и мивцоим</h3>
          <p>Координация общих выездов на мивцоим, поддержка инициатив учеников и сохранение архива жизни ешивы.</p>
        </article>
      </div>

      <div class="about-contact-bar">
        <p class="about-contact-text">
          По всем вопросам участия в жизни сообщества и инициативам АТО обращайтесь в аккаунт <a href="https://t.me/ATO_Moscow" target="_blank" rel="noopener noreferrer">@ATO_Moscow</a>, а за актуальными объявлениями следите в официальном канале <a href="https://t.me/Igud_Talmidei_Haeshivot_5787" target="_blank" rel="noopener noreferrer">@Igud_Talmidei_Haeshivot_5787</a>.
        </p>
        <a href="https://t.me/ATO_Moscow" target="_blank" rel="noopener noreferrer" class="about-contact-btn">
          <span>Связаться с АТО (@ATO_Moscow)</span>
          <span>→</span>
        </a>
      </div>
    </div>
  `;
}

function renderContent() {
  const area = document.getElementById("contentArea");

  if (currentMode === "DONATE") {
    renderDonateSection(area);
    return;
  }

  if (currentMode === "ABOUT") {
    renderAboutSection(area);
    return;
  }

  const query = document.getElementById("searchInput").value.toLowerCase().trim();

  if (currentMode === "NIGUNIM") {
    renderNigunimSection(area, query);
    return;
  }

  if (currentMode === "NEWS") {
    renderNewsSection(area, query);
    return;
  }

  if (currentMode === "ISSUES") {
    const filteredIssues = allIssues.filter(item => {
      return !query ||
        item.title.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.period.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query);
    });

    if (filteredIssues.length === 0) {
      area.innerHTML = '<div class="status-box">Готовые выпуски по вашему запросу не найдены</div>';
      return;
    }

    const grid = document.createElement("div");
    grid.className = "grid";
    filteredIssues.forEach((item, idx) => grid.appendChild(buildCardElement(item, true, idx)));
    area.innerHTML = "";
    area.appendChild(grid);
    return;
  }

const filtered = allArticles.filter(item => {
    const matchRubric = currentRubric === "ALL" || item.rubric === currentRubric;
    const matchAuthor = currentAuthor === "ALL" || item.author === currentAuthor;
    const matchQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query);
    return matchRubric && matchAuthor && matchQuery;
  });

  area.innerHTML = "";

  if (currentAuthor !== "ALL") {
    const totalByAuthor = allArticles.filter(a => a.author === currentAuthor).length;
    const rubricsByAuthor = [...new Set(allArticles.filter(a => a.author === currentAuthor).map(a => a.rubric).filter(Boolean))];
    const authorSlug = `author-${encodeURIComponent(toAuthorSlug(currentAuthor))}`;

    const profileBar = document.createElement("section");
    profileBar.className = "author-profile-bar";
    profileBar.setAttribute("aria-label", `Профиль автора: ${currentAuthor}`);
    profileBar.innerHTML = `
      <div class="author-profile-info">
        <div class="author-profile-eyebrow">
          <span class="diamond"></span>
          <span>Автор сообщества АТО</span>
        </div>
        <div class="author-profile-name">${currentAuthor}</div>
        <div class="author-profile-stats">
          В архиве: <strong>${pluralizeArticles(totalByAuthor)}</strong>${rubricsByAuthor.length ? ` • Рубрики: ${rubricsByAuthor.join(", ")}` : ""}
        </div>
      </div>
      <div class="author-profile-actions" id="authorProfileActions"></div>
    `;

    area.appendChild(profileBar);

    const actionsEl = profileBar.querySelector("#authorProfileActions");
    const shareAuthorBtn = document.createElement("button");
    shareAuthorBtn.type = "button";
    shareAuthorBtn.className = "quote-btn";
    shareAuthorBtn.textContent = "Поделиться автором";
    shareAuthorBtn.onclick = () => copyShareUrlToClipboard(authorSlug, shareAuthorBtn, "Поделиться автором");

    const resetAuthorBtn = document.createElement("button");
    resetAuthorBtn.type = "button";
    resetAuthorBtn.className = "quote-btn primary";
    resetAuthorBtn.textContent = "Все авторы ×";
    resetAuthorBtn.onclick = () => filterByAuthor("ALL", false);

    actionsEl.append(shareAuthorBtn, resetAuthorBtn);
  }

  if (filtered.length === 0) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "status-box";
    emptyBox.textContent = "По вашему запросу материалы не найдены";
    area.appendChild(emptyBox);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid";
  filtered.forEach((item, idx) => grid.appendChild(buildCardElement(item, false, idx)));
  area.appendChild(grid);
}
async function init() {
  const area = document.getElementById("contentArea");

  try {
    const [resArticles, resIssues, resPatrons, resNews, resNigunim] = await Promise.all([
      fetch(ARTICLES_CSV_URL),
      fetch(ISSUES_CSV_URL),
      fetch(PATRONS_CSV_URL),
      fetch(NEWS_CSV_URL),
      fetch(NIGUNIM_CSV_URL)
    ]);

    if (resArticles.ok) {
      const rows = parseCSV(await resArticles.text());
      allArticles = rows.slice(1)
        .filter(r => r[0])
        .map((r, i) => ({
          id: i + 1,
          title: r[0] || "",
          rubric: normalizeLabel(r[1]),
          author: r[2] || "",
          desc: r[3] || "",
          link: r[4] || "",
          audio: r[5] || ""
        }));
    }

    if (resIssues.ok) {
      const rows = parseCSV(await resIssues.text());
      allIssues = rows.slice(1)
        .filter(r => r[0])
        .map((r, i) => ({
          id: i + 1,
          title: r[0] || "",
          type: normalizeLabel(r[1]),
          period: r[2] || "",
          desc: r[3] || "",
          link: r[4] || ""
        }));
    }

    if (resPatrons.ok) {
      const rows = parseCSV(await resPatrons.text());
      allPatrons = rows.slice(1)
        .filter(r => r[0])
        .map(r => ({
          name: r[0] || "",
          tier: r[1] || "",
          dedication: r[2] || ""
        }));
    }

    if (resNews.ok) {
      const rows = parseCSV(await resNews.text());
      allNews = rows.slice(1)
        .filter(r => r[0] || r[1])
        .map(r => ({
          type: normalizeLabel(r[0]),
          title: r[1] || "",
          date: r[2] || "",
          body: r[3] || "",
          link: r[4] || "",
          photo: r[5] || ""
        }));
    }

    if (resNigunim.ok) {
      const rows = parseCSV(await resNigunim.text());
      allNigunim = rows.slice(1)
        .filter(r => r[0] && r[2])
        .map((r, i) => ({
          id: i + 1,
          key: `nigun-${i + 1}`,
          title: r[0] || "",
          category: normalizeLabel(r[1]),
          audio: r[2] || "",
          articleLink: r[3] || ""
        }));
    }

    let manualQuotes = [];
    if (QUOTES_CSV_URL) {
      const resQuotes = await fetch(QUOTES_CSV_URL);
      if (resQuotes.ok) {
        const rows = parseCSV(await resQuotes.text());
        manualQuotes = rows.slice(1)
          .filter(r => r[0])
          .map((r, i) => ({
            id: i + 1,
            text: r[0] || "",
            source: r[1] || "Сообщество АТО",
            title: r[1] || "Статья АТО",
            link: r[2] || ""
          }));
      }
    }
allQuotes = buildQuotesPool(manualQuotes, allArticles);

renderDailyQuote();
    setupFilters(allArticles);
    renderContent();
    handleHashNavigation();
  } catch (err) {
    console.error("Ошибка init():", err);
    area.innerHTML = '<div class="status-box">Не удалось загрузить данные. Проверьте публикацию листов в интернет.</div>';
  } finally {
    hideAtoPreloader();
  }
}

function hideAtoPreloader() {
  const preloader = document.getElementById("atoPreloader");
  if (!preloader || preloader.classList.contains("hidden")) return;
  preloader.classList.add("hidden");
  setTimeout(() => preloader.remove(), 500);
}

// Предохранитель: убираем прелоадер не позднее 2.5 сек даже при медленной сети
setTimeout(hideAtoPreloader, 2500);
let currentJewishContext = null;

const PARASHA_RU_MAP = {
  "bereshit": ["берешит"],
  "noach": ["ноах"],
  "lech-lecha": ["лех леха", "лех-леха"],
  "vayeira": ["ваера"],
  "chayei sara": ["хаей сара"],
  "toldot": ["толдот"],
  "vayetzei": ["ваетце", "вайеце"],
  "vayishlach": ["ваишлах", "вайишлах"],
  "vayeshev": ["ваешев", "вайешев"],
  "miketz": ["микец"],
  "vayigash": ["ваигаш", "вайигаш"],
  "vayechi": ["ваехи", "вайехи"],
  "shemot": ["шмот"],
  "vaera": ["ваэра"],
  "bo": ["бо"],
  "beshalach": ["бешалах"],
  "yitro": ["итро"],
  "mishpatim": ["мишпатим"],
  "terumah": ["трума"],
  "tetzaveh": ["тецаве"],
  "ki tisa": ["ки тиса"],
  "vayakhel": ["ваякель"],
  "pekudei": ["пкудей"],
  "vayikra": ["ваикра"],
  "tzav": ["цав"],
  "shmini": ["шмини"],
  "tazria": ["тазриа"],
  "metzora": ["мецора"],
  "achrei mot": ["ахарей мот"],
  "kedoshim": ["кдошим"],
  "emor": ["эмор"],
  "behar": ["бегар", "бехар"],
  "bechukotai": ["бехукотай"],
  "bamidbar": ["бамидбар"],
  "naso": ["насо"],
  "beha'alotcha": ["бегаалотха"],
  "sh'lach": ["шлах"],
  "korach": ["корах"],
  "chukat": ["хукат"],
  "balak": ["балак"],
  "pinchas": ["пинхас"],
  "matot": ["матот"],
  "masei": ["масей"],
  "devarim": ["дварим"],
  "vaetchanan": ["ваэтханан"],
  "eikev": ["экев"],
  "re'eh": ["реэ"],
  "shoftim": ["шофтим"],
  "ki teitzei": ["ки теце"],
  "ki tavo": ["ки таво"],
  "nitzavim": ["ницавим"],
  "vayeilech": ["вайелех"],
  "ha'azinu": ["гаазину"],
  "vezot haberakhah": ["везот габраха"]
};

const HEBREW_MONTH_RU_MAP = {
  "tishrei": { genitive: "тишрея", nominative: "тишрей" },
  "cheshvan": { genitive: "хешвана", nominative: "хешван" },
  "kislev": { genitive: "кислева", nominative: "кислев" },
  "tevet": { genitive: "тевета", nominative: "тевет" },
  "sh'vat": { genitive: "швата", nominative: "шват" },
  "adar": { genitive: "адара", nominative: "адар" },
  "adar i": { genitive: "адара", nominative: "адар" },
  "adar ii": { genitive: "адара", nominative: "адар" },
  "nisan": { genitive: "нисана", nominative: "нисан" },
  "iyyar": { genitive: "ияра", nominative: "ияр" },
  "sivan": { genitive: "сивана", nominative: "сиван" },
  "tamuz": { genitive: "тамуза", nominative: "тамуз" },
  "av": { genitive: "ава", nominative: "ав" },
  "elul": { genitive: "элула", nominative: "элул" }
};

function renderCalendarContextWidget() {
  const slot = document.getElementById("calendarContextSlot");
  if (!slot || !currentJewishContext) return;
  if (allArticles.length === 0 && allIssues.length === 0) return;

  const { parashaRuList, parashaLabel, monthInfo, jewishDay, holidayKeywords } = currentJewishContext;
  const matches = [];
  const seenKeys = new Set();

  const addMatch = (item, isIssue, reason) => {
    const key = `${isIssue ? "issue" : "art"}-${item.id}`;
    if (seenKeys.has(key) || !sanitizeUrl(item.link)) return;
    seenKeys.add(key);
    matches.push({ item, isIssue, reason });
  };

  if (parashaRuList.length > 0) {
    allIssues.forEach(issue => {
      const hay = `${issue.title} ${issue.period} ${issue.desc}`.toLowerCase();
      if (parashaRuList.some(p => hay.includes(p))) {
        addMatch(issue, true, `Глава ${parashaLabel}`);
      }
    });
    allArticles.forEach(art => {
      const hay = `${art.title} ${art.desc}`.toLowerCase();
      if (parashaRuList.some(p => hay.includes(p))) {
        addMatch(art, false, `Глава ${parashaLabel}`);
      }
    });
  }

  if (monthInfo && jewishDay) {
    allArticles.forEach(art => {
      const titleLower = art.title.toLowerCase();
      const dateMatch = titleLower.match(new RegExp(`^(\\d{1,2})\\s+${monthInfo.genitive}\\b`));
      if (dateMatch) {
        const targetDay = parseInt(dateMatch[1], 10);
        if (Math.abs(targetDay - jewishDay) <= 6) {
          addMatch(art, false, `${targetDay} ${monthInfo.genitive}`);
        }
      }
    });
  }

  if (holidayKeywords.length > 0) {
    [...allIssues.map(i => ({ data: i, isIssue: true })), ...allArticles.map(a => ({ data: a, isIssue: false }))]
      .forEach(entry => {
        const hay = `${entry.data.title} ${entry.data.period || ""}`.toLowerCase();
        if (holidayKeywords.some(kw => hay.includes(kw))) {
          addMatch(entry.data, entry.isIssue, "К празднику / дате");
        }
      });
  }

  if (monthInfo) {
    allIssues.forEach(issue => {
      const hay = `${issue.title} ${issue.period}`.toLowerCase();
      if (hay.includes(monthInfo.nominative) || hay.includes(monthInfo.genitive)) {
        addMatch(issue, true, `Месяц ${monthInfo.nominative[0].toUpperCase() + monthInfo.nominative.slice(1)}`);
      }
    });
  }

  if (matches.length === 0) {
    slot.innerHTML = "";
    return;
  }

  const topMatches = matches.slice(0, 3);
  const contextLabelParts = [];
  if (parashaLabel) contextLabelParts.push(`Глава ${parashaLabel}`);
  if (monthInfo && jewishDay) contextLabelParts.push(`${jewishDay} ${monthInfo.genitive}`);

  slot.innerHTML = `
    <section class="calendar-context-box" aria-label="Актуально на этой неделе">
      <div class="calendar-context-header">
        <div class="calendar-context-eyebrow">
          <span class="diamond"></span>
          <span>Актуально к дате и неделе</span>
        </div>
        ${contextLabelParts.length ? `<span class="calendar-context-badge">${contextLabelParts.join(" • ")}</span>` : ""}
      </div>
      <div class="calendar-context-items" id="calendarContextItems"></div>
    </section>
  `;

  const listEl = document.getElementById("calendarContextItems");
  topMatches.forEach(({ item, isIssue, reason }) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "calendar-context-chip";
    const slug = `${isIssue ? "issue" : "article"}-${item.id}`;
    chip.innerHTML = `
      <div>
        <div class="calendar-chip-meta">${reason} • ${isIssue ? (item.type || "Выпуск") : (item.rubric || "Статья")}</div>
        <div class="calendar-chip-title">${item.title}</div>
      </div>
      <span class="calendar-chip-arrow">→</span>
    `;
    chip.onclick = () => openPdfReader(item.title, item.link, slug);
    listEl.appendChild(chip);
  });
}
async function loadMoscowZmanim() {
  let currentJewishContext = null;

const PARASHA_RU_MAP = {
  "bereshit": ["берешит"],
  "noach": ["ноах"],
  "lech-lecha": ["лех леха", "лех-леха"],
  "vayeira": ["ваера"],
  "chayei sara": ["хаей сара"],
  "toldot": ["толдот"],
  "vayetzei": ["ваетце", "вайеце"],
  "vayishlach": ["ваишлах", "вайишлах"],
  "vayeshev": ["ваешев", "вайешев"],
  "miketz": ["микец"],
  "vayigash": ["ваигаш", "вайигаш"],
  "vayechi": ["ваехи", "вайехи"],
  "shemot": ["шмот"],
  "vaera": ["ваэра"],
  "bo": ["бо"],
  "beshalach": ["бешалах"],
  "yitro": ["итро"],
  "mishpatim": ["мишпатим"],
  "terumah": ["трума"],
  "tetzaveh": ["тецаве"],
  "ki tisa": ["ки тиса"],
  "vayakhel": ["ваякель"],
  "pekudei": ["пкудей"],
  "vayikra": ["ваикра"],
  "tzav": ["цав"],
  "shmini": ["шмини"],
  "tazria": ["тазриа"],
  "metzora": ["мецора"],
  "achrei mot": ["ахарей мот"],
  "kedoshim": ["кдошим"],
  "emor": ["эмор"],
  "behar": ["бегар", "бехар"],
  "bechukotai": ["бехукотай"],
  "bamidbar": ["бамидбар"],
  "naso": ["насо"],
  "beha'alotcha": ["бегаалотха"],
  "sh'lach": ["шлах"],
  "korach": ["корах"],
  "chukat": ["хукат"],
  "balak": ["балак"],
  "pinchas": ["пинхас"],
  "matot": ["матот"],
  "masei": ["масей"],
  "devarim": ["дварим"],
  "vaetchanan": ["ваэтханан"],
  "eikev": ["экев"],
  "re'eh": ["реэ"],
  "shoftim": ["шофтим"],
  "ki teitzei": ["ки теце"],
  "ki tavo": ["ки таво"],
  "nitzavim": ["ницавим"],
  "vayeilech": ["вайелех"],
  "ha'azinu": ["гаазину"],
  "vezot haberakhah": ["везот габраха"]
};

const HEBREW_MONTH_RU_MAP = {
  "tishrei": { genitive: "тишрея", nominative: "тишрей" },
  "cheshvan": { genitive: "хешвана", nominative: "хешван" },
  "kislev": { genitive: "кислева", nominative: "кислев" },
  "tevet": { genitive: "тевета", nominative: "тевет" },
  "sh'vat": { genitive: "швата", nominative: "шват" },
  "adar": { genitive: "адара", nominative: "адар" },
  "adar i": { genitive: "адара", nominative: "адар" },
  "adar ii": { genitive: "адара", nominative: "адар" },
  "nisan": { genitive: "нисана", nominative: "нисан" },
  "iyyar": { genitive: "ияра", nominative: "ияр" },
  "sivan": { genitive: "сивана", nominative: "сиван" },
  "tamuz": { genitive: "тамуза", nominative: "тамуз" },
  "av": { genitive: "ава", nominative: "ав" },
  "elul": { genitive: "элула", nominative: "элул" }
};

function renderCalendarContextWidget() {
  const slot = document.getElementById("calendarContextSlot");
  if (!slot || !currentJewishContext) return;
  if (allArticles.length === 0 && allIssues.length === 0) return;

  const { parashaRuList, parashaLabel, monthInfo, jewishDay, holidayKeywords } = currentJewishContext;
  const matches = [];
  const seenKeys = new Set();

  const addMatch = (item, isIssue, reason) => {
    const key = `${isIssue ? "issue" : "art"}-${item.id}`;
    if (seenKeys.has(key) || !sanitizeUrl(item.link)) return;
    seenKeys.add(key);
    matches.push({ item, isIssue, reason });
  };

  // 1. Совпадение по недельной главе Торы
  if (parashaRuList.length > 0) {
    allIssues.forEach(issue => {
      const hay = `${issue.title} ${issue.period} ${issue.desc}`.toLowerCase();
      if (parashaRuList.some(p => hay.includes(p))) {
        addMatch(issue, true, `Глава ${parashaLabel}`);
      }
    });
    allArticles.forEach(art => {
      const hay = `${art.title} ${art.desc}`.toLowerCase();
      if (parashaRuList.some(p => hay.includes(p))) {
        addMatch(art, false, `Глава ${parashaLabel}`);
      }
    });
  }

  // 2. Совпадение по ближайшим датам текущего еврейского месяца (например, "10 кислева", "19 кислева")
  if (monthInfo && jewishDay) {
    allArticles.forEach(art => {
      const titleLower = art.title.toLowerCase();
      const dateMatch = titleLower.match(new RegExp(`^(\\d{1,2})\\s+${monthInfo.genitive}\\b`));
      if (dateMatch) {
        const targetDay = parseInt(dateMatch[1], 10);
        if (Math.abs(targetDay - jewishDay) <= 6) {
          addMatch(art, false, `${targetDay} ${monthInfo.genitive}`);
        }
      }
    });
  }

  // 3. Совпадение по праздникам / хасидским датам из Hebcal
  if (holidayKeywords.length > 0) {
    [...allIssues.map(i => ({ data: i, isIssue: true })), ...allArticles.map(a => ({ data: a, isIssue: false }))]
      .forEach(entry => {
        const hay = `${entry.data.title} ${entry.data.period || ""}`.toLowerCase();
        if (holidayKeywords.some(kw => hay.includes(kw))) {
          addMatch(entry.data, entry.isIssue, "К празднику / дате");
        }
      });
  }

  // 4. Выпуск месяца (например, "Кунтрес Тмимим • Хешван")
  if (monthInfo) {
    allIssues.forEach(issue => {
      const hay = `${issue.title} ${issue.period}`.toLowerCase();
      if (hay.includes(monthInfo.nominative) || hay.includes(monthInfo.genitive)) {
        addMatch(issue, true, `Месяц ${monthInfo.nominative[0].toUpperCase() + monthInfo.nominative.slice(1)}`);
      }
    });
  }

  if (matches.length === 0) {
    slot.innerHTML = "";
    return;
  }

  const topMatches = matches.slice(0, 3);
  const contextLabelParts = [];
  if (parashaLabel) contextLabelParts.push(`Глава ${parashaLabel}`);
  if (monthInfo && jewishDay) contextLabelParts.push(`${jewishDay} ${monthInfo.genitive}`);

  slot.innerHTML = `
    <section class="calendar-context-box" aria-label="Актуально на этой неделе">
      <div class="calendar-context-header">
        <div class="calendar-context-eyebrow">
          <span class="diamond"></span>
          <span>Актуально к дате и неделе</span>
        </div>
        ${contextLabelParts.length ? `<span class="calendar-context-badge">${contextLabelParts.join(" • ")}</span>` : ""}
      </div>
      <div class="calendar-context-items" id="calendarContextItems"></div>
    </section>
  `;

  const listEl = document.getElementById("calendarContextItems");
  topMatches.forEach(({ item, isIssue, reason }) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "calendar-context-chip";
    const slug = `${isIssue ? "issue" : "article"}-${item.id}`;
    chip.innerHTML = `
      <div>
        <div class="calendar-chip-meta">${reason} • ${isIssue ? (item.type || "Выпуск") : (item.rubric || "Статья")}</div>
        <div class="calendar-chip-title">${item.title}</div>
      </div>
      <span class="calendar-chip-arrow">→</span>
    `;
    chip.onclick = () => openPdfReader(item.title, item.link, slug);
    listEl.appendChild(chip);
  });
}
  const candleEl = document.getElementById("candleTime");
  const havdalahEl = document.getElementById("havdalahTime");
  const havdalahLabelEl = havdalahEl.previousElementSibling;

  try {
    const res = await fetch("https://www.hebcal.com/shabbat?cfg=json&geonameid=524901&b=18&M=on");
    if (!res.ok) throw new Error("Ошибка загрузки зманим");
    const data = await res.json();

    const getTimeMsk = (isoStr) => new Date(isoStr).toLocaleTimeString("ru-RU", {
      timeZone: "Europe/Moscow",
      hour: "2-digit",
      minute: "2-digit"
    });

    const getWeekdayEn = (isoStr) => new Date(isoStr).toLocaleDateString("en-US", {
      timeZone: "Europe/Moscow",
      weekday: "short"
    });

    const getWeekdayRu = (isoStr) => new Date(isoStr).toLocaleDateString("ru-RU", {
      timeZone: "Europe/Moscow",
      weekday: "short"
    });

    const havdalah = data.items.find(item => item.category === "havdalah");
    // Извлекаем недельную главу и праздники для контекстной подборки
    const parashaItem = data.items.find(item => item.category === "parashat");
    let parashaRuList = [];
    let parashaLabel = "";
    if (parashaItem && parashaItem.title) {
      const cleanEn = parashaItem.title.replace(/^Parashat\s+/i, "").toLowerCase().trim();
      parashaRuList = PARASHA_RU_MAP[cleanEn] || [];
      if (parashaRuList.length > 0) {
        parashaLabel = parashaRuList[0][0].toUpperCase() + parashaRuList[0].slice(1);
      }
    }

    const holidayKeywords = [];
    data.items.filter(item => item.category === "holiday").forEach(h => {
      const t = (h.title || "").toLowerCase();
      if (t.includes("chanukah")) holidayKeywords.push("ханук");
      if (t.includes("purim")) holidayKeywords.push("пурим");
      if (t.includes("pesach")) holidayKeywords.push("песах");
      if (t.includes("shavuot")) holidayKeywords.push("шавуот");
      if (t.includes("rosh hashana")) holidayKeywords.push("рош а-шана");
      if (t.includes("yom kippur")) holidayKeywords.push("йом кипур");
      if (t.includes("sukkot")) holidayKeywords.push("суккот");
    });

    const mskNowParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Moscow",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date()).split("-");

    let monthInfo = null;
    let jewishDay = null;
    try {
      const convRes = await fetch(`https://www.hebcal.com/converter?cfg=json&gy=${mskNowParts[0]}&gm=${mskNowParts[1]}&gd=${mskNowParts[2]}&g2h=1`);
      if (convRes.ok) {
        const convData = await convRes.json();
        jewishDay = convData.hd || null;
        const hmKey = (convData.hm || "").toLowerCase().trim();
        monthInfo = HEBREW_MONTH_RU_MAP[hmKey] || null;
      }
    } catch (_) {}

    currentJewishContext = {
      parashaRuList,
      parashaLabel,
      monthInfo,
      jewishDay,
      holidayKeywords
    };
    renderCalendarContextWidget();
    const candlesList = data.items.filter(item =>
      item.category === "candles" &&
      (!havdalah || new Date(item.date) < new Date(havdalah.date))
    );

    const isRegularShabbat =
      candlesList.length === 1 &&
      getWeekdayEn(candlesList[0].date) === "Fri" &&
      havdalah &&
      getWeekdayEn(havdalah.date) === "Sat";

    if (isRegularShabbat) {
      candleEl.textContent = getTimeMsk(candlesList[0].date);
      havdalahLabelEl.textContent = "Выход Шаббата:";
      havdalahEl.textContent = getTimeMsk(havdalah.date);
    } else {
      if (candlesList.length > 0) {
        candleEl.textContent = candlesList
          .map(c => `${getWeekdayRu(c.date)} ${getTimeMsk(c.date)}`)
          .join(", ");
      }
      if (havdalah) {
        const isSat = getWeekdayEn(havdalah.date) === "Sat";
        havdalahLabelEl.textContent = isSat ? "Выход праздника / Шаббата:" : "Выход праздника:";
        havdalahEl.textContent = `${getWeekdayRu(havdalah.date)} ${getTimeMsk(havdalah.date)}`;
      }
    }
  } catch (err) {
    candleEl.textContent = "—";
    havdalahEl.textContent = "—";
  }
}

document.getElementById("searchInput").addEventListener("input", renderContent);
init();
loadMoscowZmanim();

const scrollTopBtn = document.getElementById("scrollTopBtn");
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 350) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }, { passive: true });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Пасхалка: 18 кликов по логотипу в шапке
(function initLogoEasterEgg() {
  const logoFrame = document.querySelector(".logo-frame");
  if (!logoFrame) return;

  let clickCount = 0;
  let resetTimer = null;

  const overlay = document.createElement("div");
  overlay.className = "easter-overlay";
  overlay.innerHTML = `
    <div class="easter-card">
      <div class="easter-text">יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד</div>
      <button type="button" class="easter-close">אמן</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeOverlay = () => overlay.classList.remove("active");
  overlay.querySelector(".easter-close").addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  logoFrame.addEventListener("click", () => {
    clickCount++;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      clickCount = 0;
    }, 3500);

    if (clickCount === 18) {
      clickCount = 0;
      overlay.classList.add("active");
    }
  });
})();
// Регистрация Service Worker для работы как PWA и офлайн-кэша
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("Service Worker не зарегистрирован:", err);
    });
  });
}
