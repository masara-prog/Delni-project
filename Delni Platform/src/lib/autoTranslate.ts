/**
 * English mode for the whole platform, like the mobile app: while English is on, every Arabic text the page shows
 * (labels, dashboards, alerts, server messages, stored status values) is replaced by its English translation from
 * enDictionary.json. The React code keeps its Arabic strings and logic untouched; switching back to Arabic restores
 * every text that was replaced. Data typed by people (trip titles, descriptions, names) stays as it was written.
 */
import dictionary from "./enDictionary.json";
import { LARAVEL_API_URL } from "./api";

type Dict = { exact: Record<string, string>; patterns: [string, string][] };
const DICT = dictionary as unknown as Dict;

const ARABIC = /[؀-ۿ]/;
const EDGE = /^[\s‏‎:：*•·,،.\-–—|()«»"'!؟?✓✕☑️⭐🔒]+|[\s‏‎:：*•·,،.\-–—|()«»"'!؟?✓✕☑️⭐🔒]+$/gu;
const ATTRS = ["placeholder", "title", "aria-label", "alt"];
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const exact = new Map<string, string>();
for (const [ar, en] of Object.entries(DICT.exact)) exact.set(norm(ar), en);

// "{}" in a template stands for a value (a name, a number, a date) that is carried into the English text as it is
const patterns = DICT.patterns
  .map(([ar, en]) => {
    const parts = norm(ar).split("{}").map(esc);
    return { re: new RegExp("^" + parts.join("(.+?)") + "$", "u"), en };
  })
  .sort((a, b) => b.re.source.length - a.re.source.length);

// Pieces of longer sentences (server messages are often joined from several pieces), longest first.
// A piece is replaced only as whole words: never inside a longer Arabic word.
// Arabic letters only (the Arabic comma and question mark are punctuation, so they end a word)
const AL = "\\u0621-\\u064A\\u0671-\\u06D3";
const pieces = [...exact.keys()].filter((k) => k.length >= 4).sort((a, b) => b.length - a.length);
const piecesRe = pieces.length
  ? new RegExp(`(?<![${AL}])(?:${pieces.map(esc).join("|")})(?![${AL}])`, "gu")
  : null;
const ARABIC_WORD = new RegExp(`[${AL}]{2,}`, "u");

const arabicDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

// Clock times written the Arabic way: "08:53 م" -> "08:53 PM"
const times = (s: string) =>
  s.replace(new RegExp(`(\\d{1,2}:\\d{2})\\s*([صم])(?![${AL}])`, "gu"), (_m, t, x) => `${t} ${x === "ص" ? "AM" : "PM"}`);

// Lists joined with the Arabic comma ("الأحد، السبت"): every item translated on its own
function list(key: string): string | undefined {
  if (!key.includes("،")) return undefined;
  const items = key.split("،").map((x) => x.trim());
  const done = items.map((x) => (x ? exact.get(x) ?? exact.get(x.replace(EDGE, "")) : ""));
  return done.every((x) => x !== undefined) ? done.join(", ") : undefined;
}

function fill(en: string, values: string[]): string {
  let i = 0;
  return en.replace(/\{\}/g, () => translate(values[i++] ?? ""));
}

const cache = new Map<string, string>();

const INITIALS_RE = /^[ء-ي](\s[ء-ي]){0,2}$/u;
const INITIAL: Record<string, string> = {
  "ا": "A", "أ": "A", "إ": "E", "آ": "A", "ء": "A", "ب": "B", "ت": "T", "ث": "T", "ج": "J", "ح": "H", "خ": "K", "د": "D",
  "ذ": "D", "ر": "R", "ز": "Z", "س": "S", "ش": "S", "ص": "S", "ض": "D", "ط": "T", "ظ": "Z", "ع": "A", "غ": "G", "ف": "F",
  "ق": "G", "ك": "K", "ل": "L", "م": "M", "ن": "N", "ه": "H", "و": "W", "ي": "Y", "ى": "A", "ة": "H", "ئ": "E", "ؤ": "O",
};

// ---- Content the dictionary does not cover (trip titles, names, server sentences) ----
// Sent to the server (POST /translate, Gemini, cached there); the answers are kept in this browser so a text is asked once.
const STORE = "delni_tr_en_v1";
const remote = new Map<string, string>();
try {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORE) : null;
  if (saved) for (const [k, v] of Object.entries(JSON.parse(saved) as Record<string, string>)) remote.set(k, v);
} catch {
  // storage blocked or damaged: start empty
}
const pending = new Set<string>();
const failedAt = new Map<string, number>();
let flushTimer: number | null = null;
let active = false;

function request(key: string) {
  if (typeof window === "undefined" || !active) return;
  if (key.length > 1500 || !ARABIC_WORD.test(key) || pending.has(key)) return;
  const failed = failedAt.get(key);
  if (failed && Date.now() - failed < 60_000) return;
  pending.add(key);
  if (flushTimer === null) flushTimer = window.setTimeout(flush, 250);
}

async function flush() {
  flushTimer = null;
  const batch = [...pending].slice(0, 60);
  batch.forEach((k) => pending.delete(k));
  if (pending.size) flushTimer = window.setTimeout(flush, 250);
  if (!batch.length) return;
  try {
    const res = await fetch(`${LARAVEL_API_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ texts: batch }),
    });
    const data = res.ok ? ((await res.json()) as { translations?: Record<string, string> }) : null;
    const got = data?.translations ?? {};
    let added = 0;
    for (const k of batch) {
      if (typeof got[k] === "string" && got[k]) {
        remote.set(k, got[k]);
        added++;
      } else failedAt.set(k, Date.now());
    }
    if (!added) return;
    try {
      const entries = [...remote.entries()].slice(-4000);
      localStorage.setItem(STORE, JSON.stringify(Object.fromEntries(entries)));
    } catch {
      // storage full or blocked: the translations still apply to this visit
    }
    cache.clear();
    reapply();
  } catch {
    batch.forEach((k) => failedAt.set(k, Date.now()));
  }
}

/** The English text for an Arabic text (or the text itself when it holds no Arabic). */
export function translate(text: string): string {
  if (!text || !ARABIC.test(text)) return text;
  const hit = cache.get(text);
  if (hit !== undefined) return hit;
  // Avatar initials cut from an Arabic name ("ع ا"): the Latin initials
  if (INITIALS_RE.test(text.trim())) return text.trim().split(/\s+/).map((c) => INITIAL[c] ?? c).join("");
  const lead = text.match(/^\s*/)?.[0] ?? "";
  const trail = text.match(/\s*$/)?.[0] ?? "";
  const key = norm(text);
  let out: string | undefined = exact.get(key);
  if (out === undefined) {
    for (const p of patterns) {
      const m = key.match(p.re);
      if (m) {
        out = fill(p.en, m.slice(1));
        break;
      }
    }
  }
  if (out === undefined) {
    // Same text with decoration around it (emoji, colon, star, brackets)
    const core = key.replace(EDGE, "");
    const t = core && core !== key ? exact.get(core) : undefined;
    if (t !== undefined) out = key.replace(core, t);
  }
  if (out === undefined && text.includes("\n")) {
    out = text.split("\n").map(translate).join("\n");
  }
  if (out === undefined) out = list(key);
  if (out === undefined && piecesRe) {
    const partial = times(key.replace(piecesRe, (m) => exact.get(m) ?? m));
    // A short text that stays half Arabic is a name or other typed data ("شركة الرحال"): it is kept whole
    const short = key.split(" ").length <= 4;
    if (!(short && ARABIC_WORD.test(partial))) out = partial;
  }
  // Still Arabic after the dictionary (a trip title, a name, a server sentence): the server's full translation
  if (out === undefined || ARABIC_WORD.test(out)) {
    const full = remote.get(key);
    if (full !== undefined) out = full;
    else request(key);
  }
  if (out !== undefined && !new RegExp(`[${AL}]`, "u").test(out)) out = out.replace(/،/g, ",");
  const result = arabicDigits(times(lead + (out ?? key) + trail));
  if (cache.size > 5000) cache.clear();
  cache.set(text, result);
  return result;
}

// ---- DOM ----
const originals = new Map<Node, string>();
const attrOriginals = new Map<Element, Record<string, string>>();
// What this module last wrote into a node, so a half-translated text is not taken for new Arabic content
const applied = new WeakMap<Node, string>();
const attrApplied = new WeakMap<Element, Record<string, string>>();
let observer: MutationObserver | null = null;
let applying = false;
let nativeAlert: typeof window.alert | null = null;
let nativeConfirm: typeof window.confirm | null = null;
let titleTimer: number | null = null;

function translateTextNode(node: Text) {
  const value = node.nodeValue ?? "";
  if (!ARABIC.test(value) || applied.get(node) === value) return;
  const parent = node.parentElement;
  if (!parent || SKIP.has(parent.tagName) || parent.closest("[data-no-translate]")) return;
  const en = translate(value);
  if (en !== value) {
    originals.set(node, value);
    node.nodeValue = en;
    applied.set(node, en);
  }
}

// New translations arrived from the server: texts already shown (whole Arabic or half translated) are done again
function reapply() {
  if (!active) return;
  run(() => {
    originals.forEach((ar, node) => {
      if (node.isConnected && applied.get(node) === node.nodeValue) {
        const en = translate(ar);
        node.nodeValue = en;
        applied.set(node, en);
      }
    });
    walk(document.body);
    if (ARABIC.test(document.title)) document.title = translate(document.title);
  });
}

function translateAttributes(el: Element) {
  if (el.closest("[data-no-translate]")) return;
  for (const name of ATTRS) {
    const value = el.getAttribute(name);
    if (value && ARABIC.test(value)) {
      const saved = attrOriginals.get(el) ?? {};
      const mine = attrApplied.get(el) ?? {};
      // Our own (half-)translated value: translate the original Arabic again, never the mixed text
      const source = saved[name] !== undefined && mine[name] === value ? saved[name] : value;
      const en = translate(source);
      if (en !== value) {
        saved[name] = source;
        attrOriginals.set(el, saved);
        mine[name] = en;
        attrApplied.set(el, mine);
        el.setAttribute(name, en);
      }
    }
  }
  // Buttons and options built as <input type=submit value="…">
  if (el instanceof HTMLInputElement && (el.type === "submit" || el.type === "button") && ARABIC.test(el.value)) {
    el.value = translate(el.value);
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) return translateTextNode(root as Text);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (SKIP.has(el.tagName)) return;
  translateAttributes(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) translateTextNode(n as Text);
    else translateAttributes(n as Element);
    n = tw.nextNode();
  }
}

function run(fn: () => void) {
  applying = true;
  try {
    fn();
  } finally {
    applying = false;
  }
}

export function startEnglish() {
  if (typeof document === "undefined" || observer) return;
  active = true;
  run(() => walk(document.body));
  document.title = translate(document.title);
  observer = new MutationObserver((mutations) => {
    if (applying) return;
    run(() => {
      for (const m of mutations) {
        if (m.type === "characterData") translateTextNode(m.target as Text);
        else if (m.type === "attributes") translateAttributes(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
    });
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  // The page title is set by the router after each navigation
  titleTimer = window.setInterval(() => {
    if (ARABIC.test(document.title)) document.title = translate(document.title);
  }, 500);
  nativeAlert = window.alert;
  nativeConfirm = window.confirm;
  window.alert = (msg?: unknown) => nativeAlert!.call(window, translate(String(msg ?? "")));
  window.confirm = (msg?: string) => nativeConfirm!.call(window, translate(String(msg ?? "")));
}

export function stopEnglish() {
  if (!observer) return;
  active = false;
  observer.disconnect();
  observer = null;
  if (titleTimer !== null) window.clearInterval(titleTimer);
  titleTimer = null;
  if (nativeAlert) window.alert = nativeAlert;
  if (nativeConfirm) window.confirm = nativeConfirm;
  // Put back the Arabic texts that are still on the page
  run(() => {
    originals.forEach((ar, node) => {
      if (node.isConnected) node.nodeValue = ar;
    });
    attrOriginals.forEach((saved, el) => {
      if (el.isConnected) for (const [k, v] of Object.entries(saved)) el.setAttribute(k, v);
    });
  });
  originals.clear();
  attrOriginals.clear();
}
