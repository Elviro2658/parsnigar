#!/usr/bin/env node
/**
 * ParsNegar command line interface.
 *
 *   node bin/parsnigar.js --input file.txt --digits fa
 *   cat file.txt | node bin/parsnigar.js --preset nlp
 *
 * Options:
 *   -i, --input <file>     read from a file instead of stdin
 *   -o, --output <file>    write to a file instead of stdout
 *   -p, --preset <name>    light | full | nlp          (default: full)
 *       --digits <mode>    fa | en | none              (default: preset value)
 *       --no-<rule>        disable one rule (arabic, diacritics, tatweel,
 *                          punctuation, spacing, zwnjPrefixes, zwnjPlural,
 *                          zwnjComparative)
 *       --json             print a JSON report with per-rule change counts
 *       --stats            print text statistics to stderr
 *   -h, --help             show this help
 */

import { readFileSync, writeFileSync } from "node:fs";
import { normalize, computeStats, PRESETS, DEFAULT_OPTIONS, VERSION } from "../public/persian-text.js";

const RULE_IDS = [
  "arabic", "diacritics", "tatweel", "punctuation", "spacing",
  "zwnjPrefixes", "zwnjPlural", "zwnjComparative",
];

function parseArgs(argv) {
  const parsed = { options: { ...DEFAULT_OPTIONS }, json: false, stats: false, input: null, output: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("missing value for " + arg);
      i += 1;
      return value;
    };
    if (arg === "-h" || arg === "--help") { parsed.help = true; }
    else if (arg === "-v" || arg === "--version") { parsed.version = true; }
    else if (arg === "-i" || arg === "--input") { parsed.input = next(); }
    else if (arg === "-o" || arg === "--output") { parsed.output = next(); }
    else if (arg === "-p" || arg === "--preset") {
      const preset = PRESETS[next()];
      if (!preset) throw new Error("unknown preset");
      parsed.options = { ...parsed.options, ...preset.options };
    } else if (arg === "--digits") {
      const mode = next();
      if (!["fa", "en", "none"].includes(mode)) throw new Error("--digits expects fa, en or none");
      parsed.options.digits = mode;
    } else if (arg === "--json") { parsed.json = true; }
    else if (arg === "--stats") { parsed.stats = true; }
    else if (arg.startsWith("--no-")) {
      const rule = arg.slice(5);
      if (!RULE_IDS.includes(rule)) throw new Error("unknown rule: " + rule);
      parsed.options[rule] = false;
    } else if (arg.startsWith("--")) {
      const rule = arg.slice(2);
      if (!RULE_IDS.includes(rule)) throw new Error("unknown option: " + arg);
      parsed.options[rule] = true;
    } else if (parsed.input === null) {
      parsed.input = arg;
    } else {
      throw new Error("unexpected argument: " + arg);
    }
  }
  return parsed;
}

const HELP = `پارس‌نگار — Persian text normalizer (v${VERSION})

Usage:
  parsnigar [options] [file]

Options:
  -i, --input <file>     read from a file instead of stdin
  -o, --output <file>    write to a file instead of stdout
  -p, --preset <name>    light | full | nlp        (default: full)
      --digits <mode>    fa | en | none
      --no-<rule>        disable a rule: ${RULE_IDS.join(", ")}
      --json             print a JSON report
      --stats            print statistics to stderr
  -v, --version          print the version
  -h, --help             print this help

Examples:
  parsnigar note.txt
  cat note.txt | parsnigar --preset nlp --digits en > clean.txt
  parsnigar --json --stats report.txt`;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error("parsnigar: " + error.message);
    console.error("Try 'parsnigar --help'.");
    process.exit(2);
  }

  if (args.help) { console.log(HELP); return; }
  if (args.version) { console.log(VERSION); return; }

  const input = args.input ? readFileSync(args.input, "utf8") : readStdin();
  if (!input) {
    console.error("parsnigar: no input (pass a file, --input, or pipe text on stdin)");
    process.exit(2);
  }

  const result = normalize(input, args.options);

  if (args.json) {
    const payload = { version: VERSION, total: result.total, changes: result.changes, text: result.text };
    if (args.stats) payload.stats = computeStats(result.text);
    const serialized = JSON.stringify(payload, null, 2) + "\n";
    if (args.output) writeFileSync(args.output, serialized);
    else process.stdout.write(serialized);
    return;
  }

  if (args.stats) {
    const stats = computeStats(result.text);
    console.error(`words=${stats.words} characters=${stats.characters} zwnj=${stats.zwnj} changes=${result.total}`);
  }

  if (args.output) writeFileSync(args.output, result.text);
  else process.stdout.write(result.text);
}

main();
