# ParsNegar (پارس‌نگار) — Persian Text Toolkit

An open-source (MIT) toolkit for normalizing Persian/Farsi text: a
dependency-free JavaScript library, an offline-capable browser interface, and a
command line tool.

**Live demo / demo:** the deployed app of this project.

## Why this project exists

Persian is usually described as a *low-resource* language, but the sharper
problem is that it is **normalization-poor**. The same word is written several
different ways depending on keyboard, operating system and writer:

- Arabic letter forms instead of Persian ones — `دنيا` vs `دنیا`, `كتاب` vs `کتاب`
- Optional diacritics — `كِتاب`
- Kashida / tatweel stretching — `ســـلام`
- Missing or wrongly placed half-space (ZWNJ) — `ميروم` vs `می‌روم`
- Mixed digit sets — `1250` vs `۱۲۵۰`
- Latin punctuation in Persian text — `?` vs `؟`

Computers treat those variants as different strings. That breaks search,
deduplication, sorting, machine translation, speech recognition and language
models. A small, free, predictable normalizer is a **public good**: it is the
first step every other Persian language tool depends on.

## Features

| Rule | Example |
| --- | --- |
| Unify Arabic letter forms | `دنيا` → `دنیا`، `كتاب` → `کتاب` |
| Remove diacritics | `كِتاب` → `کتاب` |
| Remove tatweel (kashida) | `ســـلام` → `سلام` |
| Digit conversion | `1250` ⇄ `۱۲۵۰` |
| Punctuation normalization | ` ،` → `، ` and `?` → `؟` |
| Spacing / ZWNJ cleanup | collapse spaces, fix ZWNJ next to spaces |
| ZWNJ prefixes | `ميروم` → `می‌روم`, `نميدانم` → `نمی‌دانم` |
| ZWNJ suffixes (experimental) | `کتابها` → `کتاب‌ها`, `بزرگتر` → `بزرگ‌تر` |
| Statistics | characters, words, lines, sentences, ZWNJ, repeated words |
| Diff view | word-level highlight of exactly what changed |

Every rule can be switched on or off, and the interface reports how many
replacements each rule performed.

## Privacy

Everything runs in the browser. **No text is ever sent to a server**, nothing is
stored, and there is no analytics or tracking. The web app also works offline
after the first visit (service worker + web app manifest).

## Installation and usage

### Browser / ES modules

```js
import { normalize, computeStats } from "./persian-text.js";

const { text, changes, total } = normalize(input, {
  arabic: true,        // unify Arabic letter forms
  diacritics: true,    // remove harakat
  tatweel: true,       // remove kashida
  digits: "fa",        // "fa" | "en" | "none"
  punctuation: true,
  spacing: true,
  zwnjPrefixes: true,  // می / نمی
  zwnjPlural: false,      // experimental
  zwnjComparative: false, // experimental
});

console.log(computeStats(text), changes);
```

### Command line

```sh
node bin/parsnigar.js note.txt
cat note.txt | node bin/parsnigar.js --preset nlp --digits en > clean.txt
node bin/parsnigar.js --json --stats report.txt
node bin/parsnigar.js --help
```

Presets: `light`, `full`, `nlp`. Individual rules can be turned on or off with
`--no-<rule>` and `--<rule>`.

### Tests

```sh
node tests/normalize.test.mjs   # or: bun run test
```

14 cases covering character unification, diacritics, punctuation, digits, the
ZWNJ rules, change counting, statistics and the diff. No test dependencies.

## API

- `normalize(text, options)` → `{ text, changes, total }`
- `computeStats(text)` → counts, ZWNJ total, most repeated words
- `diffWords(before, after)` → word-level diff tokens
- `toPersianDigits(text)`, `toEnglishDigits(text)`, `countZwnj(text)`
- `RULES` — the rule table, usable on its own
- `PRESETS` — `light`, `full`, `nlp`

## Structure

- `public/persian-text.js` — the library (no dependencies, MIT)
- `public/index.html`, `public/styles.css`, `public/main.js` — the interface
- `public/sw.js`, `public/manifest.webmanifest` — offline support
- `bin/parsnigar.js` — command line interface
- `tests/normalize.test.mjs` — test suite
- `worker.js` — static asset worker with security headers
- `scripts/build.mjs` — build step (`bun run build`)

## Known limitations

- The `ها` / `های` and `تر` / `ترین` rules are **experimental**. Persian attaches
  these ambiguously (`تنها`, `ماه`, `دفتر`), so the rules use stopword lists and can
  still be wrong. They are off by default.
- The `می` / `نمی` prefix rule also uses a stopword list for words such as `میز`,
  `میدان`, `میلیون`.
- The rules work on attached text. A separated suffix (`کتاب ها`) is not joined.
- No morphological analysis yet: the library normalizes surface form, it does not
  stem or lemmatize.
- The digit rule converts every digit run, including numbers inside code-like
  strings — turn it off if that matters.

## Roadmap

1. **v1.0** — core normalization, digits, punctuation, ZWNJ, statistics, diff view.
2. **v1.1 (current)** — offline installable app, file loading, shareable text in the URL, command line tool, security headers, test suite.
3. **v1.2** — expanded test corpus, more Arabic/rare letter forms and common misspellings.
4. **v1.3** — two-text comparison, suspicious-word detection, suggestions.
5. **v2.0** — language packs for other Iranian languages (Kurdish, Balochi, Pashto, Azerbaijani) on the same rule engine.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Bug reports with a before/after text
pair are the most useful contribution.

## License

MIT — see [LICENSE](./LICENSE). Free to use, modify and reuse, including in
commercial products. Attribution is welcome but not required.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
