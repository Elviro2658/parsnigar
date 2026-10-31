/*!
 * ParsNegar — Persian Text Toolkit (persian-text.js)
 * Version 1.1.0
 *
 * An open-source (MIT) library for normalizing Persian/Farsi text:
 * character unification, diacritic and tatweel removal, digit conversion,
 * punctuation and spacing cleanup, and ZWNJ (nim-fasele) handling.
 *
 * No dependencies. Runs in the browser and in any ES-module environment.
 *
 * Copyright (c) 2026 Hassan Malekan — MIT License (see /LICENSE)
 */

export const VERSION = "1.1.0";

/* --------------------------------------------------------------------------
 * Character maps
 * ------------------------------------------------------------------------ */

/** Arabic letter forms that are conventionally written differently in Persian. */
export const ARABIC_TO_PERSIAN = {
  "ي": "ی", // Arabic yeh
  "ى": "ی", // alef maksura
  "ﻯ": "ی",
  "ﻱ": "ی",
  "ﻲ": "ی",
  "ك": "ک", // Arabic kaf
  "ﻙ": "ک",
  "ﻚ": "ک",
  "ة": "ه", // teh marbuta
  "ۀ": "ه", // heh with yeh
  "أ": "ا", // alef with hamza above
  "إ": "ا", // alef with hamza below
  "ٱ": "ا", // alef wasla
  "ؤ": "و",
  "ئ": "ی",
  "ﻻ": "لا",
  "ﻷ": "لا",
  "ﻹ": "لا",
  "ﻵ": "لا",
  "٫": ".",
  "٬": ",",
};

/** Latin digit -> Persian (Extended Arabic-Indic) digit. */
export const LATIN_TO_PERSIAN_DIGITS = {
  "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴",
  "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹",
};

/** Persian digit -> Latin digit. */
export const PERSIAN_TO_LATIN_DIGITS = Object.fromEntries(
  Object.entries(LATIN_TO_PERSIAN_DIGITS).map(([latin, persian]) => [persian, latin]),
);

/** Arabic-Indic digits (U+0660..U+0669) -> Latin digit. */
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Latin punctuation -> Persian punctuation. */
const PUNCTUATION_MAP = {
  ",": "،",
  ";": "؛",
  "?": "؟",
};

const DIACRITICS = /[\u064B-\u0652\u0653\u0654\u0655\u0656\u0657\u0658\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640+/g;
const ZWNJ = "\u200C";
const ZWNJ_RE = /\u200C/g;

/**
 * Words that start with "می"/"نمی" but are not verbal prefixes.
 * Used to avoid introducing a wrong ZWNJ.
 */
export const MI_STOPWORDS = new Set([
  "میز", "میدان", "میان", "میراث", "میرا", "میل", "میله", "میلی", "میلیون", "میلیارد",
  "میلیمتر", "میلیگرم", "میوه", "میکا", "میکروب", "میکرو", "میکروفون", "میلاد", "میهن",
  "میره", "میری", "میشه", "میرزا", "میگو", "میگون", "میخانه", "میم", "مینا", "مینو",
  "میخ", "میخک", "میدهد", "میباشد", "میلیونم", "میانگین", "میدونی", "میذارم",
]);

/** Words ending in "ها" that are single lexical items, not plural forms. */
export const HA_STOPWORDS = new Set([
  "تنها", "ماه", "آنها", "اینها", "بها", "گیاها", "چاها", "همانها", "رها", "اکنونها",
]);

/** Words ending in "تر"/"ترین" that are single lexical items. */
export const TAR_STOPWORDS = new Set([
  "بهتر", "بیشتر", "کمتر", "دفتر", "بستر", "دکتر", "اختر", "معتبر", "دیگر", "برتر",
  "دختر", "باختر", "خاور", "یکدیگر", "همدیگر",
]);

/* --------------------------------------------------------------------------
 * Rule definitions
 * ------------------------------------------------------------------------ */

/**
 * Each rule receives the current text and returns { text, count, detail }.
 * `count` is the number of individual replacements performed.
 */
export const RULES = [
  {
    id: "arabic",
    label: "یکسان‌سازی نویسه‌های عربی",
    description: "ي و ك عربی، ة، أ، إ و دیگر شکل‌های عربی را به معادل فارسی تبدیل می‌کند.",
    apply(text) {
      let count = 0;
      const out = Array.from(text).map((ch) => {
        const mapped = ARABIC_TO_PERSIAN[ch];
        if (mapped && mapped !== ch) {
          count += 1;
          return mapped;
        }
        return ch;
      }).join("");
      return { text: out, count };
    },
  },
  {
    id: "diacritics",
    label: "حذف اعراب و علائم حرکتی",
    description: "فتحه، کسره، ضمه، تشدید و تنوین را حذف می‌کند.",
    apply(text) {
      const matches = text.match(DIACRITICS);
      return { text: text.replace(DIACRITICS, ""), count: matches ? matches.length : 0 };
    },
  },
  {
    id: "tatweel",
    label: "حذف کشیده",
    description: "کاراکتر کشیده (ـ) که برای کشیدن حروف استفاده می‌شود را حذف می‌کند.",
    apply(text) {
      let count = 0;
      const out = text.replace(TATWEEL, (m) => {
        count += m.length;
        return "";
      });
      return { text: out, count };
    },
  },
  {
    id: "digits",
    label: "یکسان‌سازی ارقام",
    description: "ارقام را به صورت دلخواه به شکل فارسی یا لاتین تبدیل می‌کند.",
    apply(text, options) {
      const mode = options.digits || "none";
      if (mode === "none") return { text, count: 0 };
      let count = 0;
      const out = text.replace(/[0-9\u06F0-\u06F9\u0660-\u0669]/g, (ch) => {
        count += 1;
        if (mode === "fa") {
          if (LATIN_TO_PERSIAN_DIGITS[ch]) return LATIN_TO_PERSIAN_DIGITS[ch];
          const idx = ARABIC_INDIC_DIGITS.indexOf(ch);
          if (idx > -1) return LATIN_TO_PERSIAN_DIGITS[String(idx)];
          return ch;
        }
        // mode === "en"
        if (PERSIAN_TO_LATIN_DIGITS[ch]) return PERSIAN_TO_LATIN_DIGITS[ch];
        const idx = ARABIC_INDIC_DIGITS.indexOf(ch);
        if (idx > -1) return String(idx);
        return ch;
      });
      return { text: out, count };
    },
  },
  {
    id: "punctuation",
    label: "یکسان‌سازی نشانه‌گذاری",
    description: "کاما، نقطه‌ویرگول و علامت سؤال لاتین را به معادل فارسی تبدیل می‌کند.",
    apply(text) {
      let count = 0;
      const out = text.replace(/[,;?]/g, (ch) => {
        count += 1;
        return PUNCTUATION_MAP[ch] || ch;
      });
      return { text: out, count };
    },
  },
  {
    id: "spacing",
    label: "اصلاح فاصله‌ها و نیم‌فاصله‌های اضافی",
    description: "فاصله‌های تکراری، فاصله پیش از نشانه‌گذاری و نیم‌فاصله‌های اشتباه را اصلاح می‌کند.",
    apply(text) {
      let count = 0;
      const step = (source, pattern, replacement) =>
        source.replace(pattern, (...args) => {
          count += 1;
          if (typeof replacement === "function") return replacement(...args);
          // Emulate "$1"-style substitution inside the callback form.
          const groups = args.slice(0, -2);
          return replacement.replace(/\$(\d)/g, (_, index) => groups[Number(index)] ?? "");
        });
      let out = text;
      out = step(out, /[ \t\u00A0\u200B]{2,}/g, " ");                          // repeated spaces
      out = step(out, /[\t\u00A0\u200B]/g, " ");                                // stray tabs / nbsp
      out = step(out, /[ \t]+\r?\n/g, "\n");                                   // trailing spaces
      out = step(out, /\r?\n[ \t]+/g, "\n");                                   // leading spaces
      out = step(out, / +([،؛؟!:.,])/g, "$1");                                // no space before punctuation
      out = step(out, /([،؛؟!])(?=[^\s؟!،؛])/g, "$1 ");                       // space after punctuation
      out = step(out, new RegExp(ZWNJ + "{2,}", "g"), ZWNJ);                    // repeated ZWNJ
      out = step(out, new RegExp("\\s" + ZWNJ + "|" + ZWNJ + "\\s", "g"), " "); // ZWNJ next to a space
      out = step(out, /\n{3,}/g, "\n\n");                                     // squeeze blank lines
      return { text: out, count };
    },
  },
  {
    id: "zwnjPrefixes",
    label: "نیم‌فاصله پیشوندهای «می» و «نمی»",
    description: "مثل «میرود» → «می‌رود». کلمات پرکاربردی که با «می» شروع می‌شوند (میز، میدان…) دست‌نخورده می‌مانند.",
    apply(text) {
      let count = 0;
      const out = text.replace(/(^|[\s\u200C("'«])(ن?می)([\u0621-\u06CC]{2,})/g, (match, pre, prefix, rest) => {
        const word = prefix + rest;
        if (MI_STOPWORDS.has(word)) return match;
        count += 1;
        return pre + prefix + ZWNJ + rest;
      });
      return { text: out, count };
    },
  },
  {
    id: "zwnjPlural",
    label: "نیم‌فاصله «ها» و «های» (آزمایشی)",
    description: "مثل «کتابها» → «کتاب‌ها». چون «ها» هم بخشی از خود واژه است، نتیجه همیشه قطعی نیست.",
    experimental: true,
    apply(text) {
      let count = 0;
      const out = text.replace(/(^|[\s\u200C("'«])([\u0621-\u06CC]{3,}?)(های|هایی|ها)(?![\u0621-\u06CC])/g,
        (match, pre, stem, suffix) => {
          const word = stem + suffix;
          if (HA_STOPWORDS.has(word)) return match;
          count += 1;
          return pre + stem + ZWNJ + suffix;
        });
      return { text: out, count };
    },
  },
  {
    id: "zwnjComparative",
    label: "نیم‌فاصله «تر» و «ترین» (آزمایشی)",
    description: "مثل «بزرگتر» → «بزرگ‌تر»، با فهرست واژه‌های استثنا (بهتر، دفتر، دکتر…).",
    experimental: true,
    apply(text) {
      let count = 0;
      const out = text.replace(/(^|[\s\u200C("'«])([\u0621-\u06CC]{3,}?)(ترین|تر)(?![\u0621-\u06CC])/g,
        (match, pre, stem, suffix) => {
          const word = stem + suffix;
          if (TAR_STOPWORDS.has(word)) return match;
          count += 1;
          return pre + stem + ZWNJ + suffix;
        });
      return { text: out, count };
    },
  },
];

/** Preset option sets offered by the demo UI. */
export const PRESETS = {
  light: {
    label: "پاک‌سازی سبک",
    options: {
      arabic: true, diacritics: true, tatweel: true, digits: "none",
      punctuation: false, spacing: true, zwnjPrefixes: false,
      zwnjPlural: false, zwnjComparative: false,
    },
  },
  full: {
    label: "نرمال‌سازی کامل",
    options: {
      arabic: true, diacritics: true, tatweel: true, digits: "fa",
      punctuation: true, spacing: true, zwnjPrefixes: true,
      zwnjPlural: true, zwnjComparative: true,
    },
  },
  nlp: {
    label: "آماده‌سازی برای پردازش زبان",
    options: {
      arabic: true, diacritics: true, tatweel: true, digits: "en",
      punctuation: true, spacing: false, zwnjPrefixes: true,
      zwnjPlural: false, zwnjComparative: false,
    },
  },
};

export const DEFAULT_OPTIONS = PRESETS.full.options;

/* --------------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------------ */

/**
 * Normalize Persian text.
 *
 * @param {string} text
 * @param {Partial<typeof DEFAULT_OPTIONS>} options
 * @returns {{ text: string, changes: Array<{id:string,label:string,count:number}>, total: number }}
 */
export function normalize(text, options = {}) {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  let current = typeof text === "string" ? text : "";
  const changes = [];

  for (const rule of RULES) {
    const enabled = resolved[rule.id] === true || (rule.id === "digits" && resolved.digits && resolved.digits !== "none");
    if (!enabled) continue;
    try {
      const result = rule.apply(current, resolved);
      current = result.text;
      changes.push({ id: rule.id, label: rule.label, count: result.count || 0 });
    } catch (error) {
      changes.push({ id: rule.id, label: rule.label, count: 0, error: String(error) });
    }
  }

  const total = changes.reduce((sum, item) => sum + (item.count || 0), 0);
  return { text: current, changes, total };
}

/**
 * Descriptive statistics for a Persian text.
 * @param {string} text
 */
export function computeStats(text) {
  const source = typeof text === "string" ? text : "";
  const words = source.split(/[\s\u200C،؛؟!:.()"'«»\[\]{}…\-—]+/).filter(Boolean);
  const sentences = source.split(/[.!؟!…]+/).filter((s) => s.trim().length > 0);
  const unique = new Set(words);
  const frequency = new Map();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }
  const topWords = [...frequency.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fa"))
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  return {
    characters: source.length,
    charactersNoSpaces: source.replace(/\s/g, "").length,
    words: words.length,
    uniqueWords: unique.size,
    lines: source.length ? source.split(/\r?\n/).length : 0,
    sentences: sentences.length,
    zwnj: (source.match(ZWNJ_RE) || []).length,
    persianLetters: (source.match(/[\u0621-\u06CC]/g) || []).length,
    topWords,
  };
}

/**
 * Word-level diff between two texts, used for the change highlight view.
 * @returns {Array<{type:"same"|"del"|"ins", text:string}>}
 */
export function diffWords(before, after) {
  const a = tokenize(before);
  const b = tokenize(after);

  if (a.length * b.length > 400000) {
    return [
      { type: "del", text: before },
      { type: "ins", text: after },
    ];
  }

  const table = lcsTable(a, b);
  const result = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(result, "same", a[i]);
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      push(result, "del", a[i]);
      i += 1;
    } else {
      push(result, "ins", b[j]);
      j += 1;
    }
  }
  while (i < a.length) { push(result, "del", a[i]); i += 1; }
  while (j < b.length) { push(result, "ins", b[j]); j += 1; }
  return result;
}

/** Helpers ------------------------------------------------------------------ */

export function toPersianDigits(text) {
  return String(text).replace(/[0-9]/g, (d) => LATIN_TO_PERSIAN_DIGITS[d] || d);
}

export function toEnglishDigits(text) {
  return String(text)
    .replace(/[\u06F0-\u06F9]/g, (d) => PERSIAN_TO_LATIN_DIGITS[d] || d)
    .replace(/[\u0660-\u0669]/g, (d) => String(ARABIC_INDIC_DIGITS.indexOf(d)));
}

export function countZwnj(text) {
  return (String(text).match(ZWNJ_RE) || []).length;
}

function tokenize(text) {
  return String(text).split(/(\s+)/).filter((token) => token.length > 0);
}

function push(list, type, text) {
  const last = list[list.length - 1];
  if (last && last.type === type) {
    last.text += text;
    return;
  }
  list.push({ type, text });
}

function lcsTable(a, b) {
  const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}