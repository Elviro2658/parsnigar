import {
  VERSION,
  normalize,
  computeStats,
  diffWords,
  DEFAULT_OPTIONS,
  PRESETS,
} from "/persian-text.js";

/* --------------------------------------------------------------------------
 * Elements
 * ------------------------------------------------------------------------ */

const els = {
  input: document.querySelector("#input-text"),
  output: document.querySelector("#output-text"),
  inputMeta: document.querySelector("#input-meta"),
  outputMeta: document.querySelector("#output-meta"),
  status: document.querySelector("#status"),
  stats: document.querySelector("#stats"),
  changes: document.querySelector("#changes"),
  diffToggle: document.querySelector("#diff-toggle"),
  diffOutput: document.querySelector("#diff-output"),
  copyBtn: document.querySelector("#copy-btn"),
  downloadBtn: document.querySelector("#download-btn"),
  sampleBtn: document.querySelector("#sample-btn"),
  version: document.querySelector("#version"),
  optionInputs: [...document.querySelectorAll("[data-option]")],
  digitInputs: [...document.querySelectorAll('input[name="digits"]')],
  presets: [...document.querySelectorAll("[data-preset]")],
  copyTargets: [...document.querySelectorAll("[data-copy-target]")],
  fileBtn: document.querySelector("#file-btn"),
  fileInput: document.querySelector("#file-input"),
};

const SAMPLE = [
  "ســـلام دنيا ! من ۳ سال است كه روي يک پروژه‌ي متن‌باز كار ميكنم و ميدانم كه نتيجه ميدهد .",
  "كِتابهاي من زيادتر است ، اما بهترين راه اين است كه متنها را يکدست كنيم .",
  "تعداد واژه‌ها 1250 عدد است؟بله ، دقيقاً همينطور است…",
].join("\n");

/* --------------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------------ */

const state = {
  options: { ...DEFAULT_OPTIONS },
  result: { text: "", changes: [], total: 0 },
};

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

/** Persian-locale number formatting for UI counters. */
function fa(n) {
  try {
    return Number(n).toLocaleString("fa-IR");
  } catch {
    return String(n);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setStatus(message) {
  if (els.status) els.status.textContent = message;
}

/* --------------------------------------------------------------------------
 * Options
 * ------------------------------------------------------------------------ */

function readOptions() {
  const options = { ...state.options };
  for (const input of els.optionInputs) {
    options[input.dataset.option] = input.checked;
  }
  const selected = els.digitInputs.find((input) => input.checked);
  options.digits = selected ? selected.value : "none";
  return options;
}

function writeOptions(options) {
  for (const input of els.optionInputs) {
    if (input.dataset.option in options) input.checked = options[input.dataset.option] === true;
  }
  for (const input of els.digitInputs) {
    input.checked = input.value === (options.digits || "none");
  }
}

/* --------------------------------------------------------------------------
 * Rendering
 * ------------------------------------------------------------------------ */

function renderStats(text) {
  if (!els.stats) return;
  const s = computeStats(text);
  const rows = [
    ["نویسه", s.characters],
    ["نویسه بی‌فاصله", s.charactersNoSpaces],
    ["واژه", s.words],
    ["واژه یکتا", s.uniqueWords],
    ["خط", s.lines],
    ["جمله", s.sentences],
    ["نیم‌فاصله", s.zwnj],
    ["حرف فارسی", s.persianLetters],
  ];
  els.stats.innerHTML = rows
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${fa(value)}</dd></div>`)
    .join("");
}

function renderChanges(changes) {
  if (!els.changes) return;
  if (!changes.length) {
    els.changes.innerHTML = '<li class="zero">هنوز قانونی فعال نیست.</li>';
    return;
  }
  els.changes.innerHTML = changes
    .map((item) => {
      const cls = item.count ? "" : ' class="zero"';
      return `<li${cls}><span>${escapeHtml(item.label)}</span><b>${fa(item.count)}</b></li>`;
    })
    .join("");
}

function renderDiff(before, after) {
  if (!els.diffOutput) return;
  if (els.diffOutput.hidden) return;
  const pieces = diffWords(before, after);
  const removed = pieces
    .filter((piece) => piece.type !== "ins")
    .map((piece) => (piece.type === "del" ? `<span class="mark-del">${escapeHtml(piece.text)}</span>` : escapeHtml(piece.text)))
    .join("");
  const added = pieces
    .filter((piece) => piece.type !== "del")
    .map((piece) => (piece.type === "ins" ? `<span class="mark-ins">${escapeHtml(piece.text)}</span>` : escapeHtml(piece.text)))
    .join("");

  els.diffOutput.innerHTML = `
    <div class="diff-block"><h4>ورودی (نشانه‌گذاری‌شده)</h4><div>${removed || "<span class='mark-del'>—</span>"}</div></div>
    <div class="diff-block"><h4>خروجی نرمال‌شده (نشانه‌گذاری‌شده)</h4><div>${added || "<span class='mark-ins'>—</span>"}</div></div>
  `;
}

function renderOutput() {
  const input = els.input ? els.input.value : "";
  els.output.value = state.result.text;
  if (els.inputMeta) els.inputMeta.textContent = `${fa(input.length)} نویسه · ${fa(computeStats(input).words)} واژه`;
  if (els.outputMeta) els.outputMeta.textContent = `${fa(state.result.text.length)} نویسه · ${fa(state.result.total)} اصلاح`;
}

/* --------------------------------------------------------------------------
 * Main pipeline
 * ------------------------------------------------------------------------ */

function run(reason = "auto") {
  const input = els.input ? els.input.value : "";
  state.options = readOptions();

  if (!input.trim()) {
    state.result = { text: "", changes: [], total: 0 };
    renderOutput();
    renderStats("");
    renderChanges([]);
    renderDiff("", "");
    if (reason !== "auto") setStatus("چیزی برای پردازش نیست؛ متن را وارد کن.");
    return;
  }

  const started = performance.now();
  state.result = normalize(input, state.options);
  const elapsed = Math.max(1, Math.round(performance.now() - started));

  renderOutput();
  renderStats(input);
  renderChanges(state.result.changes);
  renderDiff(input, state.result.text);
  setStatus(`${fa(state.result.total)} اصلاح در ${fa(elapsed)} میلی‌ثانیه — همه‌چیز در مرورگر تو اجرا شد.`);
}

/* --------------------------------------------------------------------------
 * Events
 * ------------------------------------------------------------------------ */

let debounceTimer = 0;
function scheduleRun() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => run("auto"), 140);
}

els.input?.addEventListener("input", scheduleRun);
els.input?.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    run("manual");
  }
});

for (const input of [...els.optionInputs, ...els.digitInputs]) {
  input.addEventListener("change", () => run("manual"));
}

for (const button of els.presets) {
  button.addEventListener("click", () => {
    const preset = PRESETS[button.dataset.preset];
    if (!preset) return;
    writeOptions(preset.options);
    run("manual");
    setStatus(`پیش‌تنظیم «${preset.label}» اعمال شد.`);
  });
}

els.sampleBtn?.addEventListener("click", () => {
  els.input.value = SAMPLE;
  run("manual");
  setStatus("نمونه بارگذاری شد؛ تفاوت‌ها را ببین.");
});

els.fileBtn?.addEventListener("click", () => els.fileInput?.click());

els.fileInput?.addEventListener("change", async () => {
  const file = els.fileInput.files?.[0];
  if (!file) return;
  if (file.size > 2_000_000) {
    setStatus("فایل بزرگ‌تر از ۲ مگابایت است؛ فایل کوچک‌تری انتخاب کن.");
    return;
  }
  try {
    els.input.value = await file.text();
    run("manual");
    setStatus(`فایل «${file.name}» بارگذاری شد — همه‌چیز داخل مرورگر پردازش شد.`);
  } catch {
    setStatus("خواندن فایل ممکن نشد.");
  } finally {
    els.fileInput.value = "";
  }
});

els.diffToggle?.addEventListener("change", () => {
  els.diffOutput.hidden = !els.diffToggle.checked;
  renderDiff(els.input.value, state.result.text);
});

els.copyBtn?.addEventListener("click", async () => {
  const text = state.result.text;
  if (!text) {
    setStatus("خروجی خالی است.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("خروجی در حافظه کپی شد.");
  } catch {
    els.output.select();
    document.execCommand("copy");
    setStatus("خروجی کپی شد.");
  }
});

els.downloadBtn?.addEventListener("click", () => {
  if (!state.result.text) {
    setStatus("خروجی خالی است.");
    return;
  }
  const blob = new Blob([state.result.text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "parsnigar-normalized.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("فایل خروجی دانلود شد.");
});

for (const button of els.copyTargets) {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent);
      setStatus("نمونه کد کپی شد.");
    } catch {
      setStatus("کپی خودکار ممکن نشد؛ متن را دستی انتخاب کن.");
    }
  });
}

/* --------------------------------------------------------------------------
 * Boot
 * ------------------------------------------------------------------------ */

/** Text can be passed in through the URL, which makes examples shareable:
 *  /?text=...  or  /#text=...  (max 100k characters). */
function readTextFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("text");
    const fromHash = window.location.hash.startsWith("#text=")
      ? decodeURIComponent(window.location.hash.slice("#text=".length))
      : null;
    const value = fromQuery || fromHash;
    if (!value) return "";
    return value.length > 100000 ? "" : value;
  } catch {
    return "";
  }
}

if (els.version) els.version.textContent = VERSION;
writeOptions(state.options);

const shared = readTextFromUrl();
if (shared) {
  els.input.value = shared;
  setStatus("متن از نشانی صفحه بارگذاری شد.");
}
run("auto");

/* Installable / offline: the app keeps working without a connection. */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is optional; the app works anyway */
    });
  });
}