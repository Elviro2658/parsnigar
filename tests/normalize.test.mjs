/**
 * ParsNegar — normalization test suite
 * Run with:  node tests/normalize.test.mjs
 * No dependencies; exits with a non-zero code when a case fails.
 */

import {
  normalize,
  computeStats,
  diffWords,
  toPersianDigits,
  toEnglishDigits,
  DEFAULT_OPTIONS,
} from "../public/persian-text.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log("\u2714 " + name);
  } catch (error) {
    failed += 1;
    console.error("\u2718 " + name + "\n   " + error.message);
  }
}

function eq(actual, expected, label = "") {
  if (actual !== expected) {
    throw new Error((label ? label + ": " : "") + JSON.stringify(actual) + " !== " + JSON.stringify(expected));
  }
}

/** Options that start from the documented defaults and override a few keys. */
const opts = (overrides = {}) => ({ ...DEFAULT_OPTIONS, ...overrides });

test("unifies Arabic yeh/kaf and related letter forms", () => {
  eq(normalize("سلام دنيا، كتاب من", opts({ punctuation: false })).text, "سلام دنیا، کتاب من");
});

test("removes diacritics and tatweel", () => {
  eq(normalize("كِتاب ســـلام", opts()).text, "کتاب سلام");
});

test("normalizes punctuation and the spaces around it", () => {
  eq(normalize("بله? خير,", opts()).text, "بله؟ خیر،");
  eq(normalize("سلام !", opts()).text, "سلام!");
});

test("converts digits to Persian and back", () => {
  eq(normalize("1250 عدد", opts({ digits: "fa" })).text, "۱۲۵۰ عدد");
  eq(normalize("۱۲۵۰ عدد", opts({ digits: "en" })).text, "1250 عدد");
  eq(toPersianDigits("2026"), "۲۰۲۶");
  eq(toEnglishDigits("۲۰۲۶"), "2026");
});

test("inserts ZWNJ after the mi/ne-mi prefixes", () => {
  eq(normalize("من ميروم", opts()).text, "من می‌روم");
  eq(normalize("من نميدانم", opts()).text, "من نمی‌دانم");
});

test("keeps words that only look like the mi prefix (stopword list)", () => {
  eq(normalize("ميدان آزادی ميدانم", opts()).text, "میدان آزادی می‌دانم");
});

test("inserts ZWNJ before the ha/ha-ye plural suffix (experimental)", () => {
  eq(normalize("کتابهاي من", opts({ zwnjPlural: true })).text, "کتاب‌های من");
});

test("keeps plural stopwords intact (experimental)", () => {
  eq(normalize("تنها و ماه", opts({ zwnjPlural: true })).text, "تنها و ماه");
});

test("inserts ZWNJ before tar/tarin (experimental)", () => {
  eq(normalize("زيادتر و بهتريـن", opts({ zwnjComparative: true })).text, "زیاد‌تر و بهترین");
});

test("collapses repeated whitespace", () => {
  eq(normalize("سلام    دنیا", opts({ punctuation: false })).text, "سلام دنیا");
});

test("never drops an existing ZWNJ", () => {
  eq(normalize("مي‌روم", opts({ zwnjPrefixes: false, arabic: true })).text, "می‌روم");
});

test("reports per-rule change counts", () => {
  const result = normalize("دنيا ! 1250", opts({ digits: "fa" }));
  const ids = result.changes.map((c) => c.id);
  if (!ids.includes("arabic")) throw new Error("arabic rule did not run");
  if (!ids.includes("digits")) throw new Error("digits rule did not run");
  if (result.total <= 0) throw new Error("total change count should be positive");
});

test("computes text statistics", () => {
  const stats = computeStats("سلام دنیا، سلام دنيا");
  if (stats.words !== 5) throw new Error("expected 5 words, got " + stats.words);
  if (stats.zwnj !== 0) throw new Error("expected no ZWNJ");
});

test("produces a word-level diff", () => {
  const pieces = diffWords("میروم", "می‌روم");
  eq(pieces.length, 2);
  eq(pieces[0].type, "del");
  eq(pieces[1].type, "ins");
});

console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
