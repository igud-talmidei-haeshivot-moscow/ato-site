// ================= ЗАФИКСИРОВАННЫЕ ССЫЛКИ =================
const ARTICLES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=0&single=true&output=csv";
const ISSUES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=103090562&single=true&output=csv";
const PATRONS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=654627083&single=true&output=csv";
const NEWS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=948146673&single=true&output=csv";
const DONATION_URL = "https://t.me/ATO_Moscow";
// ===========================================================

let allArticles = [];
let allIssues = [];
let allPatrons = [];
let allNews = [];
let currentMode = "ARTICLES";
let currentRubric = "ALL";
let currentNewsCategory = "ALL";

function sanitizeUrl(url) {
  const clean = (url || "").trim();
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

  if (window.location.hash) {
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
      const issuesBtn = document.querySelector('[data-mode="ISSUES"]');
      if (issuesBtn) setActiveButton(issuesBtn);
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
      const allBtn = document.querySelector('[data-rubric="ALL"]');
      if (allBtn) setActiveButton(allBtn);
      renderContent();
      openPdfReader(item.title, item.link, `article-${idx + 1}`);
    }
  }
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
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  targetBtn.classList.add("active");
  const searchEl = document.getElementById("searchInput");
  searchEl.style.display = (currentMode === "DONATE" || currentMode === "ABOUT") ? "none" : "block";
}

function setupFilters(articles) {
  const container = document.getElementById("rubricFilters");
  const issuesBtn = container.querySelector('[data-mode="ISSUES"]');
  const newsBtn = container.querySelector('[data-mode="NEWS"]');
  const donateBtn = container.querySelector('[data-mode="DONATE"]');
  const aboutBtn = container.querySelector('[data-mode="ABOUT"]');
  const allArticlesBtn = container.querySelector('[data-rubric="ALL"]');

  issuesBtn.onclick = () => {
    currentMode = "ISSUES";
    setActiveButton(issuesBtn);
    renderContent();
  };

  newsBtn.onclick = () => {
    currentMode = "NEWS";
    currentNewsCategory = "ALL";
    setActiveButton(newsBtn);
    renderContent();
  };

  donateBtn.onclick = () => {
    currentMode = "DONATE";
    setActiveButton(donateBtn);
    renderContent();
  };

  aboutBtn.onclick = () => {
    currentMode = "ABOUT";
    setActiveButton(aboutBtn);
    renderContent();
  };

  allArticlesBtn.onclick = () => {
    currentMode = "ARTICLES";
    currentRubric = "ALL";
    setActiveButton(allArticlesBtn);
    renderContent();
  };

  const rubrics = [...new Set(articles.map(item => item.rubric).filter(Boolean))];
  rubrics.forEach(rubric => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.mode = "ARTICLES";
    btn.dataset.rubric = rubric;
    btn.textContent = rubric;
    btn.onclick = () => {
      currentMode = "ARTICLES";
      currentRubric = rubric;
      setActiveButton(btn);
      renderContent();
    };
    container.appendChild(btn);
  });
}

function buildCardElement(item, isIssue, animIndex) {
  const card = document.createElement("article");
  card.className = isIssue ? "card issue-card" : "card";
  card.style.animationDelay = `${Math.min(animIndex * 55, 450)}ms`;

  const topWrapper = document.createElement("div");

  const cardTop = document.createElement("div");
  cardTop.className = "card-top";
  const leftSpan = document.createElement("span");
  leftSpan.textContent = isIssue ? (item.type || "Выпуск") : (item.rubric || "Статья");
  const rightSpan = document.createElement("span");
  rightSpan.textContent = isIssue ? (item.period || "") : (item.author || "");
  cardTop.append(leftSpan, rightSpan);

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

  const safeLink = sanitizeUrl(item.link);
  if (safeLink) {
    const readBtn = document.createElement("button");
    readBtn.type = "button";
    readBtn.className = "read-btn";
    readBtn.textContent = isIssue ? "Читать выпуск на сайте →" : "Читать материал →";
    const slug = isIssue ? `issue-${item.id}` : `article-${item.id}`;
    readBtn.onclick = () => openPdfReader(item.title, safeLink, slug);
    cardFooter.appendChild(readBtn);
  } else {
    const stubEl = document.createElement("span");
    stubEl.className = "read-btn";
    stubEl.style.opacity = "0.5";
    stubEl.style.cursor = "default";
    stubEl.textContent = "Файл готовится";
    cardFooter.appendChild(stubEl);
  }

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
    <p>Каждый выпуск «Кунтрес Тмимим», издание койвецов и программы для учеников ешивы становятся возможными благодаря вашей поддержке.</p>
    <ul class="donate-list">
      <li>Печать новых тиражей журнала и тематических буклетов</li>
      <li>Проведение фарбренгенов, шаббатонов и выездов сообщества</li>
      <li>Поддержка редакционной и просветительской работы</li>
    </ul>
  `;

  const ctaBtn = document.createElement("a");
  ctaBtn.href = sanitizeUrl(DONATION_URL) || "https://t.me/ATO_Moscow";
  ctaBtn.target = "_blank";
  ctaBtn.rel = "noopener noreferrer";
  ctaBtn.className = "donate-cta";
  ctaBtn.textContent = "Сделать взнос (Цдака) →";
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
    const matchQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query);
    return matchRubric && matchQuery;
  });

  if (filtered.length === 0) {
    area.innerHTML = '<div class="status-box">По вашему запросу материалы не найдены</div>';
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid";
  filtered.forEach((item, idx) => grid.appendChild(buildCardElement(item, false, idx)));
  area.innerHTML = "";
  area.appendChild(grid);
}

async function init() {
  const area = document.getElementById("contentArea");

  try {
    const [resArticles, resIssues, resPatrons, resNews] = await Promise.all([
      fetch(ARTICLES_CSV_URL),
      fetch(ISSUES_CSV_URL),
      fetch(PATRONS_CSV_URL),
      fetch(NEWS_CSV_URL)
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
          link: r[4] || ""
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

    setupFilters(allArticles);
    renderContent();
    handleHashNavigation();
  } catch (err) {
    area.innerHTML = '<div class="status-box">Не удалось загрузить данные. Проверьте публикацию листов в интернет.</div>';
  }
}

async function loadMoscowZmanim() {
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
