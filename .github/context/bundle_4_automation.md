# КОНТЕКСТ 4 • БОТ, ПРОМПТЫ И GITHUB ACTIONS (АТО • תשפ״ז)
_Автоматически собрано из ветки `main`: 2026-11-26 14:45 UTC_

---

## Файл: `prompts/tg_draft_prompt.txt`

```text
Ты — редактор официального Telegram-канала сообщества учеников ешивы «Игуд Талмидей а-Ешивот Москва» (АТО • תשפ״ז).

Тебе передан PDF-файл реальной статьи из архива АТО. Напиши готовый черновик поста для Telegram-канала к наступающей дате или недельной главе.

ДАННЫЕ МАТЕРИАЛА:
- Повод (дата / глава / праздник): {occasion}
- Название статьи на сайте: {title}
- Рубрика: {rubric}
- Прямая ссылка на статью: {article_url}

ЖЁСТКИЕ ПРАВИЛА:
1. Опирайся ТОЛЬКО на текст, факты, истории и цитаты из прикреплённого PDF. Ничего не выдумывай от себя.
2. НЕ указывай имя автора статьи в тексте поста.
3. Пиши живым, ясным, уважительным языком для учеников ешивы и читателей канала — без канцелярита, воды и пафосных штампов.
4. Используй ТОЛЬКО базовое HTML-форматирование Telegram: <b>жирный</b>, <i>курсив</i>, <blockquote>цитата</blockquote>. Не используй Markdown (**звёздочки**, ## заголовки, [текст](ссылка)).
5. Объём поста — 700–1100 знаков, удобно читать с телефона.
6. В тексте НЕ должно быть хештегов #новости, #новость, #спойлер, #выпуск, #новый_выпуск или #афиша. В самом конце поставь только тег #дата.

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ПОСТА:
1. <b>Зацепка (1–2 строки)</b> — сильный заголовок или вопрос, связывающий повод ({occasion}) с главной темой статьи.
2. Основная часть (2 коротких абзаца) — 2–3 конкретные мысли, разбора или исторических эпизода из PDF.
3. <blockquote>Одна яркая цитата или ключевой вывод из самой статьи (1–2 строки).</blockquote>
4. Завершающая строка строго в таком виде:
Полную статью читайте на сайте АТО: {article_url}
5. Последняя строка:
#дата

Верни ТОЛЬКО готовый текст поста без пояснений, приветствий и комментариев от себя.

```

## Файл: `prompts/tg_article_prompt.txt`

```text
Ты — редактор официального Telegram-канала сообщества учеников ешивы «Игуд Талмидей а-Ешивот Москва» (АТО • תשפ״ז).

Тебе передан PDF-файл реальной статьи из архива АТО. Напиши готовый черновик поста для Telegram-канала, который раскроет главную идею статьи и заинтересует читателя открыть её на сайте.

ДАННЫЕ МАТЕРИАЛА:
- Название статьи на сайте: {title}
- Рубрика: {rubric}
- Прямая ссылка на статью: {article_url}

ЖЁСТКИЕ ПРАВИЛА:
1. Опирайся ТОЛЬКО на текст, факты, истории и цитаты из прикреплённого PDF. Ничего не выдумывай от себя.
2. НЕ указывай имя автора статьи в тексте поста.
3. НЕ привязывай текст к календарным датам, праздникам или недельным главам, если они не являются прямой темой самой статьи.
4. Пиши живым, ясным, уважительным языком для учеников ешивы и читателей канала — без канцелярита, воды и пафосных штампов.
5. Используй ТОЛЬКО базовое HTML-форматирование Telegram: <b>жирный</b>, <i>курсив</i>, <blockquote>цитата</blockquote>. Не используй Markdown (**звёздочки**, ## заголовки, [текст](ссылка)).
6. Объём поста — 700–1100 знаков, удобно читать с телефона.
7. В тексте НЕ должно быть хештегов #новости, #новость, #спойлер, #выпуск, #новый_выпуск, #афиша или #дата. В самом конце поставь только тег #статья.

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ПОСТА:
1. <b>Зацепка (1–2 строки)</b> — сильный заголовок, парадокс или жизненный вопрос, раскрывающий главную тему статьи.
2. Основная часть (2 коротких абзаца) — 2–3 конкретные мысли, разбора или исторических эпизода из PDF.
3. <blockquote>Одна яркая цитата или ключевой вывод из самой статьи (1–2 строки).</blockquote>
4. Завершающая строка строго в таком виде:
Полную статью читайте на сайте АТО: {article_url}
5. Последняя строка:
#статья

Верни ТОЛЬКО готовый текст поста без пояснений, приветствий и комментариев от себя.

```

## Файл: `scripts/generate_tg_drafts.py`

```python
import base64
import csv
import datetime as dt
import io
import json
import os
import re
import sys
import time
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

# ================= КОНФИГУРАЦИЯ =================
ARTICLES_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/e/"
    "2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT"
    "/pub?gid=0&single=true&output=csv"
)
SITE_BASE_URL = "https://igud-talmidei-haeshivot-moscow.github.io/ato-site/"
PROMPT_FILE = Path("prompts/tg_draft_prompt.txt")
SENT_LOG_FILE = Path(".github/tg_drafts_sent.json")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "").strip()
TG_BOT_TOKEN = os.environ.get("TG_BOT_TOKEN", "").strip()
TG_CHAT_ID = os.environ.get("TG_CHAT_ID", "").strip()

MANUAL_ARTICLE_QUERY = os.environ.get("ARTICLE_QUERY", "").strip()
FORCE_RESEND = os.environ.get("FORCE_RESEND", "false").lower() == "true"

DAYS_AHEAD = 2
MSK_TZ = ZoneInfo("Europe/Moscow")

HEBREW_MONTHS_RU = {
    "nisan": "Нисана",
    "iyyar": "Ияра",
    "sivan": "Сивана",
    "tamuz": "Тамуза",
    "av": "Ава",
    "elul": "Элула",
    "tishrei": "Тишрея",
    "cheshvan": "Хешвана",
    "kislev": "Кислева",
    "tevet": "Тевета",
    "shvat": "Швата",
    "adar": "Адара",
    "adar i": "Адара I",
    "adar ii": "Адара II",
}

PARASHA_RU_MAP = {
    "parashat bereshit": "Берешит", "parashat noach": "Ноах", "parashat lech-lecha": "Лех-Леха",
    "parashat vayera": "Ваера", "parashat chayei sara": "Хаей Сара", "parashat toldot": "Толдот",
    "parashat vayetze": "Ваеце", "parashat vayishlach": "Ваишлах", "parashat vayeshev": "Ваешев",
    "parashat miketz": "Микец", "parashat vayigash": "Ваигаш", "parashat vayechi": "Ваехи",
    "parashat shemot": "Шмот", "parashat vaera": "Ваэра", "parashat bo": "Бо",
    "parashat beshalach": "Бешалах", "parashat yitro": "Итро", "parashat mishpatim": "Мишпатим",
    "parashat terumah": "Трума", "parashat tetzaveh": "Тецаве", "parashat ki tisa": "Ки Тиса",
    "parashat vayakhel": "Ваякгель", "parashat pekudei": "Пкудей", "parashat vayikra": "Ваикра",
    "parashat tzav": "Цав", "parashat shmini": "Шмини", "parashat tazria": "Тазриа",
    "parashat metzora": "Мецора", "parashat achrei mot": "Ахарей Мот", "parashat kedoshim": "Кдошим",
    "parashat emor": "Эмор", "parashat behar": "Бегар", "parashat bechukotai": "Бехукотай",
    "parashat bamidbar": "Бемидбар", "parashat naso": "Насо", "parashat beha'alotcha": "Бегаалотха",
    "parashat sh'lach": "Шлах", "parashat korach": "Корах", "parashat chukat": "Хукат",
    "parashat balak": "Балак", "parashat pinchas": "Пинхас", "parashat matot": "Матот",
    "parashat masei": "Масей", "parashat devarim": "Дварим", "parashat vaetchanan": "Ваэтханан",
    "parashat eikev": "Экев", "parashat re'eh": "Рээ", "parashat shoftim": "Шофтим",
    "parashat ki teitzei": "Ки Теце", "parashat ki tavo": "Ки Таво", "parashat nitzavim": "Ницавим",
    "parashat vayeilech": "Ваелех", "parashat ha'azinu": "Гаазину", "parashat vezot haberakhah": "Везот Габраха",
}

HOLIDAY_ALIASES = [
    ("chanukah", "Ханука"),
    ("sukkot", "Суккот"),
    ("yom kippur", "Йом Кипур"),
    ("rosh hashana", "Рош а-Шана"),
    ("purim", "Пурим"),
    ("pesach", "Песах"),
    ("shavuot", "Шавуот"),
    ("tu bishvat", "Ту би-Шват"),
    ("lag baomer", "Лаг ба-Омер"),
]


# ================= РАБОТА С ТЕГАМИ (ИЗОЛИРОВАННЫЙ БЛОК) =================
def normalize_calendar_tag(raw: str) -> str:
    """Повторяет normalizeCalendarTag() из app.js для единой логики с сайтом."""
    text = (raw or "").lower()
    replacements = [
        (r"parshat\s+", "parashat "),
        (r"vayeira", "vayera"),
        (r"vayetzei", "vayetze"),
        (r"heshvan", "cheshvan"),
        (r"kislew", "kislev"),
        (r"teves", "tevet"),
        (r"sh'vat|shevat", "shvat"),
        (r"tishri", "tishrei"),
        (r"\s+", " "),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)
    return text.strip()


def parse_article_tags(raw_tags: str) -> list[str]:
    return [t for t in (normalize_calendar_tag(x) for x in (raw_tags or "").split(",")) if t]


# ================= ЗАГРУЗКА СТАТЕЙ И КАЛЕНДАРЯ =================
def fetch_articles() -> list[dict]:
    resp = requests.get(ARTICLES_CSV_URL, timeout=30)
    resp.raise_for_status()
    text = resp.content.decode("utf-8-sig")
    rows = list(csv.reader(io.StringIO(text)))

    articles = []
    article_id = 0
    for row in rows[1:]:
        if not row or not row[0].strip():
            continue
        article_id += 1
        padded = row + [""] * max(0, 7 - len(row))
        articles.append({
            "id": article_id,
            "title": padded[0].strip(),
            "rubric": padded[1].strip(),
            "author": padded[2].strip(),
            "desc": padded[3].strip(),
            "pdf_url": padded[4].strip(),
            "audio_url": padded[5].strip(),
            "tags": parse_article_tags(padded[6]),
        })
    return articles


def get_calendar_context() -> dict:
    """Возвращает еврейскую дату через +2 дня, праздники через +2 дня и главу недели (ср/чт)."""
    now_msk = dt.datetime.now(MSK_TZ).date()
    target_date = now_msk + dt.timedelta(days=DAYS_AHEAD)

    conv_resp = requests.get(
        "https://www.hebcal.com/converter",
        params={
            "cfg": "json",
            "gy": target_date.year,
            "gm": target_date.month,
            "gd": target_date.day,
            "g2h": 1,
        },
        timeout=20,
    )
    conv_resp.raise_for_status()
    conv = conv_resp.json()

    hy = str(conv.get("hy", now_msk.year))
    hd = conv.get("hd")
    hm = normalize_calendar_tag(conv.get("hm", ""))
    target_date_tag = normalize_calendar_tag(f"{hd} {hm}")
    target_date_ru = f"{hd} {HEBREW_MONTHS_RU.get(hm, conv.get('hm', ''))}".strip()

    holiday_tags: dict[str, str] = {}
    parasha_tag = ""
    parasha_ru = ""

    # Праздники ровно через +2 дня
    cal_target_resp = requests.get(
        "https://www.hebcal.com/hebcal",
        params={
            "v": 1,
            "cfg": "json",
            "maj": "on",
            "min": "on",
            "mod": "on",
            "nx": "on",
            "start": target_date.isoformat(),
            "end": target_date.isoformat(),
        },
        timeout=20,
    )
    if cal_target_resp.ok:
        for ev in cal_target_resp.json().get("items", []):
            if ev.get("category") == "holiday":
                norm = normalize_calendar_tag(ev.get("title", ""))
                holiday_tags[norm] = ev.get("title", "")
                for key, ru_label in HOLIDAY_ALIASES:
                    if key in norm:
                        holiday_tags[key] = ru_label

    # Недельную главу проверяем в среду (2) и четверг (3) утром по Москве
    if now_msk.weekday() in (2, 3):
        week_end = now_msk + dt.timedelta(days=5)
        parasha_resp = requests.get(
            "https://www.hebcal.com/hebcal",
            params={
                "v": 1,
                "cfg": "json",
                "s": "on",
                "start": now_msk.isoformat(),
                "end": week_end.isoformat(),
            },
            timeout=20,
        )
        if parasha_resp.ok:
            for ev in parasha_resp.json().get("items", []):
                if ev.get("category") == "parashat":
                    parasha_tag = normalize_calendar_tag(ev.get("title", ""))
                    parasha_ru = PARASHA_RU_MAP.get(
                        parasha_tag,
                        re.sub(r"^Parashat\s+", "", ev.get("title", ""), flags=re.I),
                    )
                    break

    return {
        "hebrew_year": hy,
        "target_date_tag": target_date_tag,
        "target_date_ru": target_date_ru,
        "holiday_tags": holiday_tags,
        "parasha_tag": parasha_tag,
        "parasha_ru": parasha_ru,
    }


# ================= PDF + GEMINI + TELEGRAM =================
def extract_drive_file_id(url: str) -> str:
    match = re.search(r"(?:drive\.google\.com/file/d/|[?&]id=)([a-zA-Z0-9_-]+)", url or "")
    return match.group(1) if match else ""


def download_pdf_bytes(pdf_url: str) -> bytes:
    file_id = extract_drive_file_id(pdf_url)
    download_url = (
        f"https://drive.google.com/uc?export=download&confirm=t&id={file_id}"
        if file_id
        else pdf_url
    )
    resp = requests.get(download_url, timeout=60, allow_redirects=True)
    resp.raise_for_status()
    data = resp.content

    if not data.startswith(b"%PDF"):
        raise RuntimeError(
            "Google Диск вернул не PDF (проверьте, что для файла открыт доступ «Все, у кого есть ссылка»)."
        )
    if len(data) > 18 * 1024 * 1024:
        raise RuntimeError("PDF превышает 18 МБ — сожмите файл перед отправкой в Gemini.")
    return data


def generate_draft_with_gemini(article: dict, occasion: str, pdf_bytes: bytes) -> str:
    article_url = f"{SITE_BASE_URL}#article-{article['id']}"
    prompt_template = PROMPT_FILE.read_text(encoding="utf-8")
    prompt = prompt_template.format(
        occasion=occasion,
        title=article["title"],
        rubric=article["rubric"] or "Статьи АТО",
        article_url=article_url,
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "application/pdf",
                            "data": base64.b64encode(pdf_bytes).decode("ascii"),
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.65,
            "maxOutputTokens": 1500,
        },
    }

    headers = {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json",
    }

   # Собираем список моделей из API: первыми идут самые свежие flash-модели
    candidate_models = [GEMINI_MODEL] if GEMINI_MODEL else []
    try:
        m_resp = requests.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            headers=headers,
            timeout=15,
        )
        if m_resp.ok:
            skip_words = ("embedding", "aqa", "imagen", "veo", "tts", "audio", "robotics", "computer-use")
            discovered = []
            for m in m_resp.json().get("models", []):
                if "generateContent" not in m.get("supportedGenerationMethods", []):
                    continue
                short_name = m.get("name", "").replace("models/", "")
                low = short_name.lower()
                if "gemini-" in low and not any(w in low for w in skip_words):
                    discovered.append(short_name)
            discovered.sort(key=lambda n: (1 if "flash" in n.lower() else 0, n), reverse=True)
            for name in discovered:
                if name not in candidate_models:
                    candidate_models.append(name)
    except Exception:
        pass

    if not candidate_models:
        candidate_models = ["gemini-flash-latest"]

    resp = None
    last_error = "Не удалось получить ответ от Gemini API"
    for model_name in candidate_models[:5]:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        for attempt in range(2):
            resp = None
            try:
                resp = requests.post(endpoint, headers=headers, json=payload, timeout=(15, 240))
            except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as exc:
                last_error = f"Gemini API ({model_name}) таймаут/сеть: {exc}"
                if attempt == 0:
                    print(f"Таймаут модели {model_name}, повтор через 6 сек...")
                    time.sleep(6)
                    continue
                print(f"Переключаюсь с {model_name} на следующую модель после таймаута...")
                break

            if resp.ok:
                print(f"Успешная генерация через модель: {model_name}")
                break
            last_error = f"Gemini API ({model_name}) HTTP {resp.status_code}: {resp.text[:300]}"
            if resp.status_code in (429, 503) and attempt == 0:
                print(f"Модель {model_name} занята (HTTP {resp.status_code}), повтор через 6 сек...")
                time.sleep(6)
                continue
            print(f"Переключаюсь с {model_name} на следующую модель (HTTP {resp.status_code})...")
            break
        if resp is not None and resp.ok:
            break

    if resp is None or not resp.ok:
        raise RuntimeError(last_error)

    body = resp.json()
    candidates = body.get("candidates") or []
    if not candidates:
        raise RuntimeError(f"Gemini не вернул текст: {json.dumps(body, ensure_ascii=False)[:400]}")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts).strip()
    if not text:
        raise RuntimeError("Gemini вернул пустой черновик.")

    # Убираем случайную обёртку ```html ... ```
    text = re.sub(r"^```(?:html)?\s*", "", text, flags=re.I)
    text = re.sub(r"\s*```$", "", text).strip()

    # Убираем случайные запрещённые хештеги и гарантируем прямую ссылку + #дата в конце
    text = re.sub(
        r"#(?:новости|новость|спойлер|новый_выпуск|выпуск|афиша)(?:_[a-zA-Zа-яА-ЯёЁ0-9]+)?",
        "",
        text,
        flags=re.I,
    )
    text = re.sub(r"(?:\s*#дата\b)+\s*$", "", text, flags=re.I).strip()

    cta_line = f"Полную статью читайте на сайте АТО: {article_url}"
    if article_url not in text:
        if re.search(r"Полную статью читайте на сайте АТО\s*:?\s*$", text, flags=re.I):
            text = re.sub(
                r"Полную статью читайте на сайте АТО\s*:?\s*$",
                cta_line,
                text,
                flags=re.I,
            )
        else:
            text = f"{text}\n\n{cta_line}"

    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return f"{text}\n\n#дата"


def send_draft_to_telegram(draft_text: str, article: dict) -> None:
    article_url = f"{SITE_BASE_URL}#article-{article['id']}"
    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "Открыть на сайте", "url": article_url},
                {"text": "Исходник PDF", "url": article["pdf_url"]},
            ]
        ]
    }

    api_url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TG_CHAT_ID,
        "text": draft_text,
        "parse_mode": "HTML",
        "reply_markup": reply_markup,
    }
    resp = requests.post(api_url, json=payload, timeout=30)

    # Если ИИ случайно сломал HTML-тег — отправляем чистым текстом, чтобы черновик не потерялся
    if resp.status_code == 400:
        plain_text = re.sub(r"<[^>]+>", "", draft_text)
        payload["text"] = plain_text
        payload.pop("parse_mode", None)
        resp = requests.post(api_url, json=payload, timeout=30)

    if not resp.ok:
        raise RuntimeError(f"Telegram API HTTP {resp.status_code}: {resp.text[:300]}")


# ================= ЖУРНАЛ ОТПРАВЛЕННЫХ ЧЕРНОВИКОВ =================
def load_sent_log() -> dict:
    if not SENT_LOG_FILE.exists():
        return {}
    try:
        return json.loads(SENT_LOG_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_sent_log(data: dict) -> None:
    SENT_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    SENT_LOG_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


# ================= ТОЧКА ВХОДА =================
def main() -> int:
    for var_name, val in [
        ("GEMINI_API_KEY", GEMINI_API_KEY),
        ("TG_BOT_TOKEN", TG_BOT_TOKEN),
        ("TG_CHAT_ID", TG_CHAT_ID),
    ]:
        if not val:
            print(f"Ошибка: не задан секрет {var_name}", file=sys.stderr)
            return 1

    articles = fetch_articles()
    cal = get_calendar_context()
    sent_log = load_sent_log()
    log_changed = False

    targets: list[tuple[dict, str, bool]] = []

    if MANUAL_ARTICLE_QUERY:
        q = MANUAL_ARTICLE_QUERY.lower()
        for art in articles:
            if not art["pdf_url"]:
                continue
            if (q.isdigit() and art["id"] == int(q)) or (q in art["title"].lower()):
                occasion = art["title"]
                targets.append((art, occasion, False))  # ручной тест не блокирует будущую автоотправку
                break
        if not targets:
            print(f"Статья по запросу «{MANUAL_ARTICLE_QUERY}» не найдена.")
            return 1
    else:
        print(
            f"Проверка календаря (+{DAYS_AHEAD} дн.): дата={cal['target_date_tag']} ({cal['target_date_ru']}), "
            f"праздники={list(cal['holiday_tags'].keys())}, глава={cal['parasha_tag'] or '—'}"
        )
        for art in articles:
            if not art["pdf_url"] or not art["tags"]:
                continue

            occasion = ""
            if cal["target_date_tag"] in art["tags"]:
                occasion = cal["target_date_ru"]
            else:
                for h_tag, h_label in cal["holiday_tags"].items():
                    if h_tag in art["tags"]:
                        occasion = h_label
                        break
            if not occasion and cal["parasha_tag"] and cal["parasha_tag"] in art["tags"]:
                occasion = f"Недельная глава {cal['parasha_ru']}"

            if not occasion:
                continue

            sent_key = f"{cal['hebrew_year']}:article-{art['id']}"
            if sent_key in sent_log and not FORCE_RESEND:
                print(f"Пропуск (уже отправлялось в {cal['hebrew_year']}): {art['title']}")
                continue

            targets.append((art, occasion, True))

    if not targets:
        print("На ближайшие даты подходящих статей нет — выходим молча.")
        return 0

    for art, occasion, should_record in targets:
        print(f"Генерация черновика: «{art['title']}» (повод: {occasion})...")
        pdf_bytes = download_pdf_bytes(art["pdf_url"])
        draft = generate_draft_with_gemini(art, occasion, pdf_bytes)
        send_draft_to_telegram(draft, art)
        print(f"Отправлено в канал черновиков: «{art['title']}» (#article-{art['id']})")

        if should_record:
            sent_key = f"{cal['hebrew_year']}:article-{art['id']}"
            sent_log[sent_key] = {
                "title": art["title"],
                "occasion": occasion,
                "sent_at": dt.datetime.now(MSK_TZ).isoformat(timespec="seconds"),
            }
            log_changed = True

    if log_changed:
        save_sent_log(sent_log)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

```

## Файл: `.github/workflows/tg-drafts.yml`

```yaml
name: Generate Telegram Drafts from Articles

on:
  schedule:
    # Каждый день в 09:00 по Москве (06:00 UTC)
    - cron: '0 6 * * *'
  workflow_dispatch:
    inputs:
      article_query:
        description: 'Тест / ручной запуск: название или номер статьи (пусто = авто по дате)'
        required: false
        default: ''
      force_resend:
        description: 'Игнорировать журнал уже отправленных (true/false)'
        required: false
        default: 'false'

permissions:
  contents: write

jobs:
  drafts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install --quiet requests

      - name: Generate and send Telegram drafts
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          TG_BOT_TOKEN: ${{ secrets.TG_BOT_TOKEN }}
          TG_CHAT_ID: ${{ secrets.TG_CHAT_ID }}
          ARTICLE_QUERY: ${{ github.event.inputs.article_query }}
          FORCE_RESEND: ${{ github.event.inputs.force_resend }}
        run: python3 scripts/generate_tg_drafts.py

      - name: Commit sent drafts log
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          if [ -n "$(git status --porcelain .github/tg_drafts_sent.json)" ]; then
            git add .github/tg_drafts_sent.json
            git commit -m "chore: update sent Telegram drafts log [skip ci]"
            git push
          else
            echo "No log changes to commit."
          fi

```

## Файл: `.github/workflows/sync-audio.yml`

```yaml
name: Sync Nigun Audio from Google Sheets

on:
  workflow_dispatch:
  push:
    branches: [ main ]
    paths:
      - '.github/workflows/sync-audio.yml'

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download new MP3 files from Google Drive
        run: |
          python3 - << 'EOF'
          import csv, io, os, re, urllib.request

          CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAAuPFgjW2LESsVaPw7HYqytvR-3uGhouUlH-0jDbw6sz_UMrWhK2vWi5tBBh4Re17DeG-6mzIcQmT/pub?gid=1555876785&single=true&output=csv"
          os.makedirs("audio", exist_ok=True)

          req = urllib.request.urlopen(CSV_URL)
          text = req.read().decode("utf-8")
          rows = list(csv.reader(io.StringIO(text)))

          print(f"Total rows fetched: {len(rows)}")
          for r in rows[1:]:
              if len(r) > 2 and r[2]:
                  url = r[2].strip()
                  m = re.search(r"(?:drive\.google\.com/file/d/|[?&]id=)([a-zA-Z0-9_-]+)", url)
                  if m:
                      file_id = m.group(1)
                      dest = f"audio/{file_id}.mp3"
                      if not os.path.exists(dest):
                          dl_url = f"https://drive.google.com/uc?export=download&confirm=t&id={file_id}"
                          print(f"Downloading {file_id}.mp3...")
                          urllib.request.urlretrieve(dl_url, dest)
          EOF

      - name: Commit and push downloaded audio
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add audio
          git diff --staged --quiet || git commit -m "Auto-sync nigun audio from Google Sheets"
          git push

```

## Файл: `.github/workflows/bundle-context.yml`

```yaml
name: Sync 4 Code Context Bundles to Google Docs

on:
  workflow_dispatch:
  push:
    branches: [ main ]
    paths-ignore:
      - 'audio/**'
      - '.github/context/**'
      - '.github/tg_drafts_sent.json'
      - 'CONTEXT_BUNDLE.md'

permissions:
  contents: write

jobs:
  bundle:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install requests
        run: pip install --quiet requests

      - name: Build 4 bundles and push to Google Docs
        env:
          GAS_BUNDLE_WEBHOOK_URL: ${{ secrets.GAS_BUNDLE_WEBHOOK_URL }}
        run: |
          python3 - << 'EOF'
          import datetime as dt
          import os
          from pathlib import Path
          import requests

          timestamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
          out_dir = Path(".github/context")
          out_dir.mkdir(parents=True, exist_ok=True)

          BUNDLES_SPEC = {
              "html": {
                  "filename": "bundle_1_html_pwa.md",
                  "title": "КОНТЕКСТ 1 • HTML И PWA (АТО • תשפ״ז)",
                  "files": [
                      ("index.html", "html"),
                      ("manifest.json", "json"),
                      ("sw.js", "javascript"),
                  ],
              },
              "css": {
                  "filename": "bundle_2_css.md",
                  "title": "КОНТЕКСТ 2 • СТИЛИ CSS (АТО • תשפ״ז)",
                  "files": [
                      ("style.css", "css"),
                  ],
              },
              "js": {
                  "filename": "bundle_3_js.md",
                  "title": "КОНТЕКСТ 3 • ЛОГИКА APP.JS (АТО • תשפ״ז)",
                  "files": [
                      ("app.js", "javascript"),
                  ],
              },
              "automation": {
                  "filename": "bundle_4_automation.md",
                  "title": "КОНТЕКСТ 4 • БОТ, ПРОМПТЫ И GITHUB ACTIONS (АТО • תשפ״ז)",
                  "files": [
                      ("prompts/tg_draft_prompt.txt", "text"),
                      ("prompts/tg_article_prompt.txt", "text"),
                      ("scripts/generate_tg_drafts.py", "python"),
                      (".github/workflows/tg-drafts.yml", "yaml"),
                      (".github/workflows/sync-audio.yml", "yaml"),
                      (".github/workflows/bundle-context.yml", "yaml"),
                  ],
              },
          }

          payload_bundles = {}

          for key, spec in BUNDLES_SPEC.items():
              parts = [
                  f"# {spec['title']}\n",
                  f"_Автоматически собрано из ветки `main`: {timestamp}_\n\n---\n",
              ]
              for rel_path, lang in spec["files"]:
                  p = Path(rel_path)
                  if not p.exists():
                      continue
                  content = p.read_text(encoding="utf-8")
                  parts.append(f"\n## Файл: `{rel_path}`\n\n```{lang}\n{content}\n```\n")

              bundle_text = "".join(parts)
              (out_dir / spec["filename"]).write_text(bundle_text, encoding="utf-8")
              payload_bundles[key] = bundle_text
              print(f"Собран {spec['filename']}: {len(bundle_text)} симв.")

          webhook_url = os.environ.get("GAS_BUNDLE_WEBHOOK_URL", "").strip()
          if not webhook_url:
              raise SystemExit("Ошибка: не задан секрет GAS_BUNDLE_WEBHOOK_URL")

          resp = requests.post(
              webhook_url,
              json={"bundles": payload_bundles},
              timeout=60,
          )
          resp.raise_for_status()
          body = resp.text.strip()
          print("Ответ Apps Script:", body)
          if not body.startswith("OK:"):
              raise SystemExit(f"Apps Script вернул ошибку: {body}")
          EOF

      - name: Commit updated context bundles
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          if [ -n "$(git status --porcelain .github/context)" ]; then
            git add .github/context
            git commit -m "chore: update 4 context bundles [skip ci]"
            git push
          else
            echo "No bundle changes to commit."
          fi

```
