'use strict';
/* Lesson pages (specs/site-template.md §3c, Phase 3): a step-by-step lesson whose strings live in an i18n.js
 * `STR = { zh: {…}, en: {…} }` table, built from content.zh.md / content.en.md and a layout.
 *
 *   compileLesson(dir, lang, env)   content.<lang>.md -> { copy, order, src, skel, refs, stepOf }
 *   buildLesson(dir, opts)          -> { outputs: { 'index.html', 'i18n.js', 'refs.json' }, errors, warnings, … }
 *   convertLesson(dir, opts)        a live hand-written lesson -> its template sources, plus the equivalence proof
 *   splitI18n(text)                 i18n.js -> { shell (the file with the table replaced by MARK), tables }
 *
 * Keys are flat and absolute (s0e, nav0, docTitle): a lesson's app.js and tests name them, so they survive as they
 * are. Every step is `## <h2 text> {#stepN h2=<key>}`; prose paragraphs carry `{#key .class}`; anything else in a
 * step is a `::: html` partial. The page's own frame (head, header, footer, scripts) is the layout: the shared
 * templates/layouts/lesson.html, or the page's layout.html when it was converted from a hand-written page.
 * Both have the same slots. Used through scripts/lib/template.cjs (buildEssay dispatches on "layout": "lesson").
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { prefill } = require('./prefill.cjs');

const T = () => require('./template.cjs');
const LANGS = ['zh', 'en'];
const MARK = '/*@i18n-table@*/';
const SHELL = 'i18n.shell.js';
const LAYOUT_FILE = 'layout.html';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HAS_RUNTIME = /\{[a-zA-Z_][\w]*\}/;
const fillable = v => v != null && v !== '' && !HAS_RUNTIME.test(v);
const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));

/* ───────── i18n.js: the string table and the page's own runtime around it ───────── */
// Index just past the object literal that starts at s[open] === '{' (strings, template literals and comments skipped).
function literalEnd(s, open) {
  let depth = 0, q = null;
  for (let k = open; k < s.length; k++) {
    const c = s[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '/' && s[k + 1] === '/') { k = s.indexOf('\n', k); if (k < 0) return -1; continue; }
    if (c === '/' && s[k + 1] === '*') { k = s.indexOf('*/', k + 2) + 1; if (k <= 0) return -1; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return k + 1;
  }
  return -1;
}
const isTable = o => o && typeof o === 'object' && LANGS.every(l => o[l] && typeof o[l] === 'object' && Object.values(o[l]).every(v => typeof v === 'string'));
// The first `const|let|var NAME = { zh: {…}, en: {…} }` whose values are all strings.
function splitI18n(text) {
  for (const m of text.matchAll(/\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*\{/g)) {
    const open = m.index + m[0].length - 1, end = literalEnd(text, open);
    if (end < 0) continue;
    let o;
    try { o = vm.runInNewContext('(' + text.slice(open, end) + ')', {}); } catch (e) { continue; }
    if (!isTable(o)) continue;
    return { shell: text.slice(0, open) + MARK + text.slice(end), tables: { zh: o.zh, en: o.en }, literal: text.slice(open, end) };
  }
  return null;
}
const IDENT = /^[A-Za-z_$][\w$]*$/;
function serializeTables(tables, order) {
  const one = l => '  ' + l + ': {\n' + order[l].map(k => `    ${IDENT.test(k) ? k : JSON.stringify(k)}: ${JSON.stringify(tables[l][k])}`).join(',\n') + '\n  }';
  return '{\n' + LANGS.map(one).join(',\n') + '\n}';
}

/* ───────── pre-fill bookkeeping ─────────
 * Hand-written lessons carry the zh text inside some data-i18n elements and leave others empty. The converter
 * empties every element whose text is exactly its key's zh value (unfill) and records which ones were filled
 * (legacyLayout.filled, "key" or "key#2" for the second element with that key, "aria:key" for an aria-label),
 * so a build without pre-fill puts back exactly those (fillSome) and reproduces the page byte for byte. */
const OPEN = /<(\w+)\b[^<>]*?\bdata-i18n(-html)?="([^"]+)"[^<>]*>/g;
const occ = (k, n) => (n > 1 ? `${k}#${n}` : k);
function unfill(html, Z) {
  const filled = [], seen = new Map();
  let out = '', last = 0, m;
  const re = new RegExp(OPEN.source, 'g');
  while ((m = re.exec(html))) {
    const [open, tag, ishtml, k] = m, end = m.index + open.length;
    const n = (seen.get(k) || 0) + 1; seen.set(k, n);
    if (!fillable(Z[k])) continue;
    const val = ishtml ? Z[k] : esc(Z[k]);
    if (html.startsWith(val + '</' + tag + '>', end)) {
      out += html.slice(last, end); last = end + val.length; re.lastIndex = last;
      filled.push(occ(k, n));
    }
  }
  html = out + html.slice(last);
  const aseen = new Map();
  html = html.replace(/\bdata-i18n-aria="([^"]+)"( aria-label="([^"]*)")?/g, (all, k, a, x) => {
    const n = (aseen.get(k) || 0) + 1; aseen.set(k, n);
    if (a && Z[k] != null && x === esc(Z[k])) { filled.push('aria:' + occ(k, n)); return `data-i18n-aria="${k}"`; }
    return all;
  });
  return { html, filled };
}
function fillSome(html, Z, list) {
  const want = new Set(list);
  const seen = new Map();
  let out = '', last = 0, m;
  const re = new RegExp(OPEN.source, 'g');
  while ((m = re.exec(html))) {
    const [open, tag, ishtml, k] = m, end = m.index + open.length;
    const n = (seen.get(k) || 0) + 1; seen.set(k, n);
    if (!want.has(occ(k, n)) || !html.startsWith('</' + tag + '>', end)) continue;
    out += html.slice(last, end) + (ishtml ? Z[k] : esc(Z[k])); last = end;
  }
  html = out + html.slice(last);
  const aseen = new Map();
  return html.replace(/\bdata-i18n-aria="([^"]+)"/g, (all, k) => {
    const n = (aseen.get(k) || 0) + 1; aseen.set(k, n);
    return want.has('aria:' + occ(k, n)) ? `${all} aria-label="${esc(Z[k])}"` : all;
  });
}

/* ───────── content ───────── */
// -> { copy, order, src, skel: { globals, steps: [{ id, n, h2, h2html, h2cls, nav, pre, blocks }] }, refs, stepOf }
function compileLesson(dir, lang, env) {
  const t = T();
  const file = `content.${lang}.md`;
  const { site, page, errors } = env;
  const { blocks } = t.parseContent(fs.readFileSync(path.join(dir, file), 'utf8'), file);
  const copy = {}, order = [], src = {}, stepOf = {};
  const ctx = { site, page, lang, bindings: {}, refs: [], used: new Set(), ownAnchors: new Set(), key: null };
  for (const b of blocks) if (b.type === 'heading' && b.attrs.key) ctx.ownAnchors.add(b.attrs.key);
  const skel = { steps: [] };
  let step = null;
  const put = (k, v) => {
    if (k in copy) errors.push(`${lang}: duplicate key ${k}`);
    if (k.startsWith('site.')) errors.push(`${file}: key ${k} is reserved for the template chrome (site.*)`);
    ctx.key = k; src[k] = v;
    try { copy[k] = t.renderInline(v, ctx); } catch (e) { errors.push(`${file}: ${k}: ${e.message}`); copy[k] = v; }
    order.push(k);
    if (step) stepOf[k] = step.id;
  };
  for (const b of blocks) {
    if (b.type === 'heading') {
      if (b.level !== 2) { errors.push(`${file}:${b.line}: a lesson has only "## <title> {#stepN h2=<key>}" headings`); continue; }
      const id = b.attrs.key;
      if (!id) { errors.push(`${file}:${b.line}: step heading needs {#<anchor>}`); continue; }
      const n = (id.match(/(\d+)$/) || [])[1];
      step = { id, n: n != null ? +n : skel.steps.length, h2: b.attrs.h2 || null, h2html: b.attrs.i18n === 'html', h2cls: b.attrs.classes.join(' '), h2id: b.attrs.h2id || null, h2part: b.attrs.h2part === '1',
        nav: b.attrs.nav || null, pre: b.attrs.pre != null ? +b.attrs.pre : null, blocks: [] };
      skel.steps.push(step);
      if (step.h2) put(step.h2, b.text);
      else if (b.text.trim()) errors.push(`${file}:${b.line}: step heading text without h2=<key>`);
      continue;
    }
    if (b.type === 'strings') { for (const [k, v] of b.entries) put(k, v); continue; }
    if (b.type === 'html') {
      if (!b.name) { errors.push(`${file}:${b.line}: ::: html needs a name`); continue; }
      for (const [k, v] of b.entries) put(k, v);
      if (!step) { errors.push(`${file}:${b.line}: ::: html ${b.name} must be inside a step (page-wide markup is the layout)`); continue; }
      step.blocks.push({ kind: 'part', name: b.name });
      continue;
    }
    if (b.type === 'para') {
      if (!step) { errors.push(`${file}:${b.line}: paragraph before the first step heading`); continue; }
      if (!b.attrs.key) { errors.push(`${file}:${b.line}: a lesson paragraph needs {#key}`); continue; }
      put(b.attrs.key, b.text);
      step.blocks.push({ kind: 'p', key: b.attrs.key, tag: b.attrs.tag || 'p', cls: b.attrs.classes.join(' '), text: b.attrs.i18n === 'text' });
      continue;
    }
    errors.push(`${file}:${b.line}: ${b.type === 'list' ? 'a list' : b.type === 'break' ? '---' : '::: ' + b.type} is not part of a lesson (write it as ::: html)`);
  }
  return { copy, order, src, skel, refs: ctx.refs, stepOf };
}

/* ───────── the frame ───────── */
const DEFAULTS = {
  section: { open: '<section class="step" id="{id}" data-step="{n}">\n  <div class="step-inner">', close: '\n  </div>\n</section>' },
  indent: '\n    ',
  stepNav: { item: '\n  <a href="#{id}" class="nav-step" data-nav="{n}" data-i18n="{key}"></a>', end: '' },
};
const SLOT = /\{\{([\w.]+)\}\}/g;
function fillFrame(tpl, slots, errors, where) {
  const seen = new Set();
  const out = tpl.replace(SLOT, (m, k) => {
    if (!(k in slots)) { errors.push(`${where}: unknown slot {{${k}}}`); return ''; }
    seen.add(k); return slots[k];
  });
  // a slot that carries content must be in the frame; up, v, title, generated and htmlAttrs are optional
  for (const [k, v] of Object.entries(slots)) if (!seen.has(k) && v && !['up', 'v', 'title', 'generated', 'htmlAttrs'].includes(k)) errors.push(`${where}: has no {{${k}}} slot, but the page has ${k} to render`);
  return out;
}
const sub = (pat, st) => pat.replace(/\{id\}/g, st.id).replace(/\{n\}/g, String(st.n));
function provenanceFrom(site, page, dir, meta, errors) {
  const t = T(), file = path.join(site.root, 'page-provenance.json');
  const entry = fs.existsSync(file) ? (readJson(file).pages || {})[page.slug] : null;
  // legacyLayout.label: the hand-written shape of a converted page's label, with {{slots}} for the values (deleting it
  // renders the standard label). The values always come from page-provenance.json.
  const tpl = (meta.legacyLayout || {}).label;
  if (tpl == null) return entry ? t.provenanceLabel(site, page, meta) : '';
  if (!entry) { errors.push('page.json legacyLayout.label is set, but page-provenance.json has no entry for ' + page.slug); return ''; }
  const v = {
    developer: entry.developer, edition: entry.edition, sourceRevision: entry.sourceRevision, short: String(entry.sourceRevision).slice(0, 8),
    short7: String(entry.sourceRevision).slice(0, 7), 'scope.zh': (entry.scope || {}).zh, 'scope.en': (entry.scope || {}).en,
    'kind.zh': entry.kind === 'original' ? '原创版本' : '改进版本', 'kind.en': entry.kind === 'original' ? 'Original edition' : 'Revised edition',
  };
  return String(tpl).replace(SLOT, (m, k) => {
    if (v[k] == null) { errors.push(`page.json legacyLayout.label: {{${k}}} has no value in page-provenance.json`); return ''; }
    return v[k];
  });
}

function buildLesson(dir, opts = {}) {
  const t = T();
  const site = t.createSite(opts.root || t.REPO_ROOT);
  const CHROME = opts.chrome !== false, errors = [], warnings = [];
  dir = path.resolve(dir);
  const sitePath = path.relative(site.root, dir).split(path.sep).join('/') + '/';
  const meta = readJson(path.join(dir, 'page.json'));
  const page = site.bySlug.get(meta.slug);
  if (!page) return { errors: [`page.json slug "${meta.slug}" is not a live page in the registry (a lesson is converted from, or registered as, a live page)`], warnings, outputs: {} };
  if (page.path.replace(/\/?$/, '/') !== sitePath) return { errors: [`page.json slug "${meta.slug}" is registered at ${page.path}, not ${sitePath}`], warnings, outputs: {} };
  const PREFILL = opts.prefill != null ? opts.prefill : meta.prefill !== false;
  const up = '../'.repeat(sitePath.split('/').filter(Boolean).length);
  const legacy = meta.legacyLayout || {};

  const C = {};
  for (const l of LANGS) {
    try { C[l] = compileLesson(dir, l, { site, page, errors }); } catch (e) { errors.push(e.message); }
  }
  if (!C.zh || !C.en) return { errors, warnings, outputs: {} };

  /* parity: same skeleton, same key set, same runtime placeholders and link targets per key */
  const hrefs = s => [...String(s).matchAll(/href=(["'])([^"']*)\1/g)].map(m => m[2]).sort().join(' ');
  const tok = (s, re) => (String(s).match(re) || []).sort().join(' ');
  if (JSON.stringify(C.zh.skel) !== JSON.stringify(C.en.skel)) errors.push('parity: zh and en differ in structure (steps, blocks, keys)');
  for (const k of C.zh.order) {
    if (!(k in C.en.copy)) { errors.push('parity: en lacks ' + k); continue; }
    if (tok(C.zh.copy[k], t.RUNTIME) !== tok(C.en.copy[k], t.RUNTIME)) errors.push('parity: runtime placeholders differ in ' + k);
    if (hrefs(C.zh.copy[k]) !== hrefs(C.en.copy[k])) errors.push('parity: link targets differ in ' + k);
  }
  for (const k of C.en.order) if (!(k in C.zh.copy)) errors.push('parity: zh lacks ' + k);

  /* languages: an English string may hold Chinese only where page.json enCjk lists the key (the converter records
     the keys that already do, e.g. a bilingual button label 分离 · Divergent); anything else is untranslated. */
  {
    const allow = new Set(meta.enCjk || []);
    const bad = C.en.order.filter(k => !allow.has(k) && (t.CJK.test(C.en.copy[k]) || /\[en pending\]/i.test(C.en.copy[k])));
    if (bad.length) errors.push(`en: ${bad.length} string(s) hold Chinese text or [EN pending] (${bad.slice(0, 6).join(', ')}${bad.length > 6 ? ', …' : ''}); translate them, or list a deliberately bilingual key in page.json enCjk`);
    for (const k of allow) if (!(k in C.en.copy)) errors.push(`page.json enCjk names ${k}, which content.en.md does not define`);
  }

  /* partials */
  const partials = {}, stale = [];
  const usePartial = name => {
    if (name in partials) return partials[name];
    const f = path.join(dir, 'figures', name + '.html');
    if (!fs.existsSync(f)) { errors.push(`missing partial figures/${name}.html`); return (partials[name] = ''); }
    const s = fs.readFileSync(f, 'utf8').replace(/\n$/, '');
    for (const k of t.i18nKeysIn(s)) if (!(k in C.zh.copy)) errors.push(`figures/${name}.html names key ${k}, which no content block defines`);
    // text written inside a keyed element that is not its zh string: shown until the runtime replaces it (no-JS readers keep it)
    for (const m of s.matchAll(/<(\w+)\b[^<>]*?\bdata-i18n(-html)?="([^"]+)"[^<>]*>([^<]+)<\/\1>/g)) if (m[4].trim()) stale.push(`${name}:${m[3]}`);
    return (partials[name] = s);
  };

  /* chrome: breadcrumb, backlinks, related; site.* strings join the page's own tables */
  const BL = CHROME ? t.scanBacklinks(site, page) : [];
  let related = [];
  if (CHROME) {
    const regFile = path.join(dir, 'REGISTRY.json');
    const reg = fs.existsSync(regFile) ? readJson(regFile) : { concepts: [] };
    related = [...new Set((reg.concepts || []).flatMap(c => c.relatedPages || []))].filter(s => site.bySlug.has(s) && s !== page.slug && !BL.some(r => r.p.slug === s));
  }
  const cat = site.cats.find(c => c.id === page.category);
  const subt = (site.subs[page.category] || []).find(s => s.id === page.subtopic);
  const stepIds = new Set(C.zh.skel.steps.map(s => s.id));
  if (CHROME) for (const l of LANGS) {
    const tx = t.CHROME_TEXT[l], cp = C[l].copy, o = C[l].order;
    const add = (k, v) => { if (k in cp) errors.push(`${l}: chrome key ${k} is also defined in content`); cp[k] = v; o.push(k); };
    add('site.crumb.aria', tx.aria); add('site.crumb.home', tx.home);
    if (cat) add('site.crumb.cat', t.pick(cat.name, l));
    if (subt) add('site.crumb.sub', t.pick(subt.name, l));
    if (BL.length) {
      add('site.bl.title', tx.bl);
      BL.forEach((r, i) => {
        const href = t.relHref(page.path, r.p.path), groups = new Map();
        for (const x of r.links) { const g = groups.get(x.from || '') || []; if (x.to && !g.includes(x.to)) g.push(x.to); groups.set(x.from || '', g); }
        const here = to => `${tx.here}${l === 'zh' ? '' : ' '}${stepIds.has(to) && /\d+$/.test(to) ? tx.step(to.match(/\d+$/)[0]) : '#' + to}`;
        const parts = [...groups].map(([from, tos]) => (from ? `<a href="${href}#${from}">${t.srcLabel(tx, from)}</a>` : '') +
          (tos.length ? (from ? ' → ' : '→ ') + tos.map(to => `<a href="#${to}">${here(to)}</a>`).join(l === 'zh' ? '、' : ', ') : ''));
        add('site.bl.' + (i + 1), `<a href="${href}">${t.titleOf(r.p, l)}</a>` + (parts.some(Boolean) ? (l === 'zh' ? '：' : ': ') + parts.filter(Boolean).join(l === 'zh' ? '；' : '; ') : ''));
      });
    }
    if (related.length) { add('site.rel.title', tx.rel); related.forEach((s, i) => add('site.rel.' + (i + 1), `<a href="${t.relHref(page.path, site.bySlug.get(s).path)}">${t.titleOf(site.bySlug.get(s), l)}</a>`)); }
  }

  /* raw links: warn when they point at no live page or a missing anchor */
  for (const k of C.zh.order) for (const m of String(C.zh.copy[k]).matchAll(/href=(["'])(\.\.\/[^"']*)\1/g)) {
    const r = t.resolveHref(site, page.path, m[2]);
    if (!r) warnings.push(`link: ${k} links to ${m[2]}, which is not a live page`);
    else if (r[1] && !site.anchors(r[0]).has(r[1])) warnings.push(`link: ${k} links to ${m[2]}, but that page has no #${r[1]}`);
  }
  /* D10 lint, as for essays: a mention of another live page's title that is not a link */
  const titleRe = s => t.reEsc(s).replace(/['’]/g, "['’]");
  for (const l of LANGS) for (const k of C[l].order) {
    if (k.startsWith('site.')) continue;
    const text = String(C[l].copy[k]).replace(/<a\b[\s\S]*?<\/a>/g, '');
    for (const p of site.pages) {
      if (p === page) continue;
      const ti = t.titleOf(p, l);
      if (!ti) continue;
      const re = l === 'zh' ? new RegExp('《' + t.reEsc(ti) + '》|<cite>\\s*' + t.reEsc(ti) + '\\s*</cite>')
        : new RegExp('“' + titleRe(ti) + '[,.]?”|<cite>\\s*' + titleRe(ti) + '\\s*</cite>');
      const m = text.match(re);
      if (m) warnings.push(`lint: ${l} ${k} mentions ${m[0]} without a link; consider [[${p.slug}]]`);
    }
  }

  /* render */
  const Z = C.zh.copy;
  const sec = legacy.section || DEFAULTS.section, indent = legacy.indent != null ? legacy.indent : DEFAULTS.indent, leads = legacy.leads || {};
  const lead = id => (id in leads ? leads[id] : indent);
  function stepHtml(st, i) {
    const open = Array.isArray(sec.open) ? sec.open[i] : sub(sec.open, st), close = Array.isArray(sec.close) ? sec.close[i] : sub(sec.close, st);
    const pre = st.pre != null ? st.pre : (() => { let n = 0; while (n < st.blocks.length && st.blocks[n].kind === 'p' && st.blocks[n].cls.split(' ').includes('step-kicker')) n++; return n; })();
    // h2part=1: the <h2> is written in one of the step's partials (its hand-written text is not its zh string)
    const h2 = st.h2 && !st.h2part ? lead('h2:' + st.id) + `<h2${st.h2cls ? ` class="${st.h2cls}"` : ''}${st.h2id ? ` id="${st.h2id}"` : ''} data-i18n${st.h2html ? '-html' : ''}="${st.h2}"></h2>` : '';
    const parts = st.blocks.map(b => b.kind === 'p'
      ? lead(b.key) + `<${b.tag}${b.cls ? ` class="${b.cls}"` : ''} data-i18n${b.text ? '' : '-html'}="${b.key}"></${b.tag}>`
      : lead(b.name) + usePartial(b.name));
    return open + parts.slice(0, pre).join('') + h2 + parts.slice(pre).join('') + close;
  }
  const steps = C.zh.skel.steps;
  const gaps = legacy.mainGaps || ['\n', ...steps.slice(1).map(() => '\n\n'), '\n'];
  if (gaps.length !== steps.length + 1) errors.push(`page.json legacyLayout.mainGaps has ${gaps.length} entries for ${steps.length} steps (one before each step and one after the last)`);
  const stepsHtml = steps.map((st, i) => (gaps[i] || '') + stepHtml(st, i)).join('') + (gaps[steps.length] || '');
  const nav = legacy.stepNav === false ? '' : (() => {
    const N = legacy.stepNav || DEFAULTS.stepNav;
    return steps.map(st => sub(N.item, st).replace(/\{key\}/g, st.nav || 'nav' + st.n)).join('') + (N.end || '');
  })();
  if (legacy.stepNav !== false) for (const st of steps) if (!((st.nav || 'nav' + st.n) in Z)) errors.push(`step nav: ${st.id} has no string ${st.nav || 'nav' + st.n} (name it with {#${st.id} nav=<key>})`);

  const layoutFile = fs.existsSync(path.join(dir, LAYOUT_FILE)) ? path.join(dir, LAYOUT_FILE) : path.join(t.REPO_ROOT, 'templates', 'layouts', 'lesson.html');
  const frame = fs.readFileSync(layoutFile, 'utf8');
  const crumbsFor = () => {
    if (!CHROME) return '';
    const T1 = k => `data-i18n="${k}"></`;
    const navHtml = `<nav class="site-nav" data-no-autolink data-i18n-aria="site.crumb.aria"><ol>` +
      `<li><a href="${up}" data-crumb="home" ${T1('site.crumb.home')}a></li>` +
      (cat ? `<li><a href="${up}?category=${page.category}" data-crumb="cat" ${T1('site.crumb.cat')}a></li>` : '') +
      (subt ? `<li><a href="${up}?category=${page.category}&amp;subtopic=${page.subtopic}" data-crumb="sub" ${T1('site.crumb.sub')}a></li>` : '') + `</ol></nav>`;
    // the static breadcrumb sits where site-nav.js mounted it on the hand-written page: right before the <h1> (or the
    // eyebrow line above it), on a line of its own with the same indentation
    const at = frame.indexOf('{{crumbs}}'), ind = at < 0 ? '' : (frame.slice(0, at).match(/\n([ \t]*)$/) || [, null])[1];
    return navHtml + (ind != null ? '\n' + ind : '');
  };
  let xrefs = '';
  if (CHROME && (BL.length || related.length)) {
    const T1 = k => `data-i18n="${k}"></`, TH = k => `data-i18n-html="${k}"></`;
    xrefs = '\n<section class="site-xref" id="linked-from" data-no-autolink>\n  <div class="step-inner">\n';
    if (BL.length) xrefs += `    <h2 ${T1('site.bl.title')}h2>\n    <ul class="xref-list">\n` + BL.map((r, i) => `      <li ${TH('site.bl.' + (i + 1))}li>\n`).join('') + '    </ul>\n';
    if (related.length) xrefs += `    <h2 ${T1('site.rel.title')}h2>\n    <ul class="xref-list">\n` + related.map((r, i) => `      <li ${TH('site.rel.' + (i + 1))}li>\n`).join('') + '    </ul>\n';
    xrefs += '  </div>\n</section>';
  }
  const navIncl = t.siteNavIncludes(page.path);
  const variant = path.join(site.root, 'variants', 'claude-code', page.slug, 'index.html');
  let html = fillFrame(frame, {
    generated: CHROME ? `<!-- GENERATED by scripts/build-pages.cjs from content.zh.md, content.en.md, page.json, ${fs.existsSync(path.join(dir, LAYOUT_FILE)) ? 'layout.html, ' : ''}figures/ and ${SHELL}. Edit those and rebuild; do not edit this file. -->\n` : '',
    htmlAttrs: CHROME ? ' data-template="lesson"' : '',
    title: meta.titleKey ? esc(Z[meta.titleKey] != null ? Z[meta.titleKey] : '') : '',
    v: meta.version ? '?v=' + meta.version : '',
    up,
    siteNavCss: navIncl.link, siteNavJs: navIncl.script,
    crumbs: crumbsFor(),
    provenance: provenanceFrom(site, page, dir, meta, errors),
    badges: frame.includes('{{badges}}') && fs.existsSync(variant) ? `<p class="edition-compare"><a href="${up}variants/claude-code/${page.slug}/"><span class="ec-zh" lang="zh-CN">对照 Claude Code 版 →</span><span class="ec-en" lang="en">Compare with the Claude Code edition →</span></a></p>\n` : '',
    stepNav: nav,
    steps: stepsHtml,
    linkedFrom: xrefs,
  }, errors, path.relative(site.root, layoutFile));
  if (meta.titleKey && !(meta.titleKey in Z)) errors.push(`page.json titleKey ${meta.titleKey} is not defined in content.zh.md`);
  for (const k of t.i18nKeysIn(html)) if (!(k in Z)) errors.push(`the page names key ${k} (layout or chrome), which no content block defines`);
  if (stale.length) warnings.push(`stale: ${stale.length} keyed element(s) in figures/ hold hand-written text that is not their zh string (${stale.slice(0, 4).join(', ')}${stale.length > 4 ? ', …' : ''}); the runtime replaces it, readers without JS see it. Empty them (a rendered change for no-JS readers only) in a commit of their own`);
  // pre-fill: every empty element (§8); without it, exactly the elements the hand-written page had filled
  // aria-labels only where the page's runtime translates data-i18n-aria (most lesson runtimes do not)
  const runtimeText = ['i18n.shell.js', 'app.js'].map(f => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : '')).join('\n');
  const ariaRuntime = /data-i18n-aria|i18nAria/.test(runtimeText);
  html = PREFILL ? prefill(html, Z, { aria: ariaRuntime }) : fillSome(html, Z, legacy.filled || []);

  /* i18n.js: the page's runtime (i18n.shell.js) around the generated table */
  let i18n = '';
  const shellFile = path.join(dir, SHELL);
  if (!fs.existsSync(shellFile)) errors.push(`missing ${SHELL} (the page's i18n runtime with ${MARK} where the string table goes)`);
  else {
    const shell = fs.readFileSync(shellFile, 'utf8');
    if (shell.split(MARK).length !== 2) errors.push(`${SHELL} must hold ${MARK} exactly once`);
    else i18n = (CHROME ? `/* GENERATED by scripts/build-pages.cjs from content.zh.md, content.en.md and ${SHELL}. Edit those and rebuild; do not edit this file. */\n` : '') +
      shell.replace(MARK, () => serializeTables({ zh: C.zh.copy, en: C.en.copy }, { zh: C.zh.order, en: C.zh.order }));
  }
  const refs = C.zh.refs.map(r => ({ from: r.key, to: r.to, anchor: r.anchor }));
  const outputs = { 'index.html': html, 'i18n.js': i18n };
  if (CHROME) outputs['refs.json'] = JSON.stringify({
    _generated: 'by scripts/build-pages.cjs; do not edit',
    page: page.slug, refs,
    backlinks: BL.map(r => ({ from: r.p.slug, links: r.links.map(x => ({ from: x.from, to: x.to })) })),
    related, bindings: [],
  }, null, 1) + '\n';
  return {
    outputs, errors, warnings, copy: { zh: C.zh.copy, en: C.en.copy }, src: { zh: C.zh.src, en: C.en.src }, bindings: {},
    stats: { slug: page.slug, keys: C.zh.order.length, chapters: steps.length, refs: refs.length, backlinks: BL.length, related: related.length, bindings: 0 },
  };
}

/* ───────── the converter ───────── */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
function elementEnd(s, pos) {
  const m = /^<([a-zA-Z][\w-]*)/.exec(s.slice(pos, pos + 40));
  if (!m) throw new Error('expected an element at ' + JSON.stringify(s.slice(pos, pos + 60)));
  const tag = m[1].toLowerCase();
  const openEnd = s.indexOf('>', pos) + 1;
  if (VOID.has(tag) || s[openEnd - 2] === '/') return openEnd;
  const re = new RegExp(`<(/?)${tag}(?=[\\s>/])`, 'gi');
  re.lastIndex = openEnd;
  let depth = 1, x;
  while ((x = re.exec(s))) {
    if (x[1]) { if (--depth === 0) return s.indexOf('>', x.index) + 1; }
    else { const e = s.indexOf('>', x.index); if (s[e - 1] !== '/') depth++; }
  }
  throw new Error(`unclosed <${tag}>`);
}
// Nodes of an element's inner HTML: [{ lead, raw }] (raw: an element, a comment or a run of text) and the trailing whitespace.
function nodes(s) {
  const out = [];
  let pos = 0;
  for (;;) {
    const lead = /^\s*/.exec(s.slice(pos))[0];
    const at = pos + lead.length;
    if (at >= s.length) return { nodes: out, tail: lead };
    let end;
    if (s.startsWith('<!--', at)) { end = s.indexOf('-->', at) + 3; if (end < 3) throw new Error('unclosed comment'); }
    else if (s[at] === '<') end = elementEnd(s, at);
    else { end = s.indexOf('<', at); if (end < 0) end = s.length; while (/\s/.test(s[end - 1])) end--; }
    out.push({ lead, raw: s.slice(at, end) });
    pos = end;
  }
}

function convertLesson(dir, opts = {}) {
  const t = T();
  const root = path.resolve(opts.root || t.REPO_ROOT);
  const site = t.createSite(root);
  dir = path.resolve(dir);
  const sitePath = path.relative(root, dir).split(path.sep).join('/') + '/';
  const page = site.byPath.get(sitePath);
  const fail = msg => { throw new t.TemplateError(`convert ${page ? page.slug : sitePath}: ${msg}`); };
  if (!page) fail('not a live page in the registry');
  const pjFile = path.join(dir, 'page.json');
  const pjBefore = fs.existsSync(pjFile) ? fs.readFileSync(pjFile, 'utf8') : null;
  const pjOld = pjBefore != null ? JSON.parse(pjBefore) : null;
  if (pjOld && pjOld.layout) fail('already has page.json with a layout (already migrated)');

  const H = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const I = fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8');
  const split = splitI18n(I);
  if (!split) fail('i18n.js has no `const NAME = { zh: {…}, en: {…} }` table of strings');
  if (split.shell.includes('{{') ) fail(`${SHELL} would contain "{{"`);
  if (H.includes('{{')) fail('index.html contains "{{", which the layout uses for its slots');
  if (split.shell.split(MARK).length !== 2) fail('i18n.js contains the table marker');
  const Z = split.tables.zh, E = split.tables.en;
  {
    const a = Object.keys(Z).filter(k => !(k in E)), b = Object.keys(E).filter(k => !(k in Z));
    if (a.length || b.length) fail(`the zh and en tables have different keys (only zh: ${a.join(', ') || '-'}; only en: ${b.join(', ') || '-'}); a lesson's content needs the same keys in both languages`);
  }
  const keysZ = Object.keys(Z);

  /* ── 1. the frame: index.html, emptied of pre-filled text, with slots ── */
  const { html: bare, filled } = unfill(H, Z);
  let frame = bare;
  const once = (re, what) => { const m = frame.match(new RegExp(re.source, 'g')) || []; if (m.length !== 1) fail(`expected one ${what}, found ${m.length}`); };
  const includes = require(path.join(t.REPO_ROOT, 'scripts', 'build-site-nav.cjs'));
  const nav = includes.includeLines(page.path);
  once(new RegExp(t.reEsc(nav.link)), 'current site-nav.css include'); frame = frame.replace(nav.link, '{{siteNavCss}}');
  once(new RegExp(t.reEsc(nav.script)), 'current site-nav.js include'); frame = frame.replace(nav.script, '{{siteNavJs}}');
  once(/<html lang="zh-CN">/, '<html lang="zh-CN">'); frame = frame.replace('<html lang="zh-CN">', '{{generated}}<html lang="zh-CN"{{htmlAttrs}}>');
  // <title>: from the key whose zh value it is (docTitle, title), else it stays literal
  let titleKey = null;
  {
    const m = frame.match(/<title>([^<]*)<\/title>/);
    if (m) {
      const cands = keysZ.filter(k => esc(Z[k]) === m[1]);
      titleKey = ['docTitle', 'title', 'pageTitle'].find(k => cands.includes(k)) || cands[0] || null;
      if (titleKey) frame = frame.replace(m[0], '<title>{{title}}</title>');
    }
  }
  // the cache key of i18n.js (its bytes change with every build) is page.json version
  let version = null;
  {
    const m = frame.match(/(<script\b[^>]*\bsrc=")i18n\.js(?:\?v=([^"]*))?"/g) || [];
    if (m.length !== 1) fail(`expected one <script src="i18n.js…">, found ${m.length}`);
    frame = frame.replace(/(<script\b[^>]*\bsrc=")i18n\.js(?:\?v=([^"]*))?"/, (all, a, v) => { version = v != null ? v : null; return a + 'i18n.js{{v}}"'; });
  }
  // the provenance label: its shape stays (page.json legacyLayout.label), its values come from page-provenance.json
  let labelTpl = null;
  {
    const at = frame.indexOf('<details class="page-provenance"');
    if (at >= 0) {
      const end = frame.indexOf('</details>', at) + '</details>'.length;
      const label = frame.slice(at, end);
      const ppf = path.join(root, 'page-provenance.json');
      const entry = fs.existsSync(ppf) ? (readJson(ppf).pages || {})[page.slug] : null;
      if (!entry) fail('the page has a provenance label, but page-provenance.json has no entry for it');
      let tpl = label;
      const repl = (from, slot) => { if (from && tpl.includes(from)) tpl = tpl.split(from).join('{{' + slot + '}}'); };
      repl(entry.sourceRevision, 'sourceRevision'); repl(entry.edition, 'edition');
      repl(entry.scope && entry.scope.zh, 'scope.zh'); repl(entry.scope && entry.scope.en, 'scope.en');
      repl(entry.kind === 'original' ? '原创版本' : '改进版本', 'kind.zh'); repl(entry.kind === 'original' ? 'Original edition' : 'Revised edition', 'kind.en');
      repl(entry.developer, 'developer'); repl(String(entry.sourceRevision).slice(0, 8), 'short');
      for (const s of ['sourceRevision', 'edition', 'developer']) if (!tpl.includes('{{' + s + '}}')) fail(`the provenance label does not show page-provenance.json ${s} (${entry[s]}); repoint or fix the label first`);
      labelTpl = tpl;
      frame = frame.slice(0, at) + '{{provenance}}' + frame.slice(end);
    }
  }
  // the breadcrumb goes where site-nav.js mounted it: before the <h1>, or before the eyebrow/kicker line above it
  {
    const h1 = frame.indexOf('<h1');
    if (h1 < 0 || frame.indexOf('<h1', h1 + 1) >= 0) fail('expected one <h1>');
    let at = h1;
    const before = frame.slice(0, h1).replace(/\s*$/, '');
    const pm = before.match(/<p class="([^"]*)"[^<>]*>(?:[^<]*)<\/p>$/);
    if (pm && /(^|\s)(kicker|eyebrow)(\s|$)/.test(pm[1])) at = before.length - pm[0].length;
    frame = frame.slice(0, at) + '{{crumbs}}' + frame.slice(at);
  }
  // main: the steps; after it, the linked-from block
  const mainOpen = frame.match(/<main>/g) || [];
  if (mainOpen.length !== 1 || (frame.match(/<\/main>/g) || []).length !== 1) fail('expected one plain <main> … </main>');
  const mStart = frame.indexOf('<main>') + 6, mEnd = frame.indexOf('</main>');
  const mainInner = frame.slice(mStart, mEnd);
  frame = frame.slice(0, mStart) + '{{steps}}' + '</main>{{linkedFrom}}' + frame.slice(mEnd + 7);

  /* ── 2. steps ── */
  const legacy = {};
  const parsedMain = nodes(mainInner);
  const gaps = [], stepEls = [];
  {
    let pending = '';
    for (const nd of parsedMain.nodes) {
      if (/^<section\b[^>]*\bid="[\w-]+"/.test(nd.raw)) { gaps.push(pending + nd.lead); pending = ''; stepEls.push(nd.raw); }
      else if (/^<!--/.test(nd.raw)) pending += nd.lead + nd.raw;
      else fail(`main holds something other than step sections and comments: ${JSON.stringify(nd.raw.slice(0, 80))}`);
    }
    gaps.push(pending + parsedMain.tail);
  }
  if (!stepEls.length) fail('no <section id="…"> steps in <main>');
  const owner = new Map(); // key -> 'global' | step id
  const steps = [];
  const opens = [], closes = [];
  for (const raw of stepEls) {
    const id = raw.match(/^<section\b[^>]*\bid="([\w-]+)"/)[1];
    const n = (id.match(/(\d+)$/) || [])[1];
    const st = { id, n: n != null ? +n : steps.length, blocks: [], h2: null };
    const openTag = raw.slice(0, raw.indexOf('>') + 1);
    let inner = raw.slice(openTag.length, raw.length - '</section>'.length), open = openTag, close = '</section>';
    const wrap = inner.match(/^(\s*)<div class="step-inner">/);
    if (wrap) {
      const at = wrap[1].length, end = elementEnd(inner, at);
      if (/^\s*$/.test(inner.slice(end))) {
        open += inner.slice(0, at) + '<div class="step-inner">';
        close = '</div>' + inner.slice(end) + close;
        inner = inner.slice(at + '<div class="step-inner">'.length, end - '</div>'.length);
      }
    }
    const ns = nodes(inner);
    close = ns.tail + close;
    opens.push(open); closes.push(close);
    st.nodes = ns.nodes;
    steps.push(st);
  }
  // nav: generated from the steps when every item follows one pattern, else it stays in the layout as written
  let navGen = null;
  {
    const at = frame.indexOf('<nav class="step-nav"');
    if (at >= 0) {
      const end = elementEnd(frame, at), el = frame.slice(at, end), oe = el.indexOf('>') + 1;
      const items = nodes(el.slice(oe, el.length - '</nav>'.length));
      const pats = items.nodes.map((nd, i) => {
        const st = steps[i], k = (nd.raw.match(/\bdata-i18n="([^"]+)"/) || [])[1];
        if (!st || !k || !/^<a\b[^<>]*>(?:)<\/a>$/.test(nd.raw) || !nd.raw.includes(`href="#${st.id}"`)) return null;
        return { k, pat: (nd.lead + nd.raw).split(`#${st.id}"`).join('#{id}"').split(`"${st.n}"`).join('"{n}"').split(`"${k}"`).join('"{key}"') };
      });
      const elsewhere = new Set(t.i18nKeysIn(frame.slice(0, at) + frame.slice(end)));
      if (items.nodes.length === steps.length && pats.every(p => p && p.pat === pats[0].pat) && new Set(pats.map(p => p.k)).size === pats.length && pats.every(p => !elsewhere.has(p.k) && p.k !== titleKey)) {
        navGen = { item: pats[0].pat, end: items.tail };
        steps.forEach((st, i) => { st.nav = pats[i].k; });
        frame = frame.slice(0, at + oe) + '{{stepNav}}' + frame.slice(at + el.length - '</nav>'.length);
      } else legacy.stepNav = false;
    } else legacy.stepNav = false;
  }
  for (const k of t.i18nKeysIn(frame)) owner.set(k, 'global');
  if (titleKey) owner.set(titleKey, 'global');
  steps.forEach(st => { if (st.nav) owner.set(st.nav, st.id); });

  const ctxFor = lang => ({ site, page, lang, ownAnchors: new Set(steps.map(s => s.id)), key: null });
  const V = (lang, k) => { const c = ctxFor(lang); c.key = k; return t.unrenderInline((lang === 'zh' ? Z : E)[k], c); };
  const exprOk = (lang, k) => { try { V(lang, k); return true; } catch (e) { return false; } };
  // a paragraph line round-trips through the content parser exactly
  const paraLine = (text, attrs) => (t.needsParaEscape(text) ? '\\' : '') + text + ' {' + attrs.join(' ') + '}';
  const paraOk = (k, attrs) => LANGS.every(l => {
    if (!exprOk(l, k)) return false;
    const v = V(l, k);
    if (!v || /\n/.test(v) || /^\s|\s$/.test(v)) return false;
    try { const b = t.parseContent(paraLine(v, attrs), 'x').blocks; return b.length === 1 && b[0].type === 'para' && b[0].text === v && b[0].attrs.key === k; } catch (e) { return false; }
  });
  const headOk = (k, attrs) => LANGS.every(l => {
    if (!exprOk(l, k)) return false;
    const v = V(l, k);
    if (!v || /\n/.test(v) || /^\s|\s$/.test(v)) return false;
    try { const b = t.parseContent(`## ${v} {${attrs.join(' ')}}`, 'x').blocks; return b.length === 1 && b[0].type === 'heading' && b[0].level === 2 && b[0].text === v; } catch (e) { return false; }
  });
  const H2 = /^<h2((?: class="[^"]*")?)((?: id="[\w-]+")?) data-i18n(-html)?="([^"]+)"><\/h2>$/;
  const PROSE = /^<(p|div|h3|h4)((?: class="[^"]*")?) data-i18n(-html)?="([^"]+)"><\/\1>$/;
  const cls = a => (a.match(/class="([^"]*)"/) || [])[1] || '';
  for (const st of steps) {
    const items = [];
    st.nodes.forEach((nd, i) => {
      let m;
      if (!st.h2 && (m = nd.raw.match(H2)) && !owner.has(m[4])) {
        const k = m[4], attrs = [`#${st.id}`, `h2=${k}`];
        if (headOk(k, attrs)) { st.h2 = { key: k, html: !!m[3], cls: cls(m[1]), id: (m[2].match(/id="([\w-]+)"/) || [])[1] || null, at: items.length, lead: nd.lead }; owner.set(k, st.id); return; }
      }
      // an <h2> whose hand-written text is not its zh string (stale): the key is the heading, the markup stays in a partial
      if (!st.h2 && (m = nd.raw.match(/^<h2\b[^<>]*\bdata-i18n="([^"]+)"[^<>]*>[^<]+<\/h2>$/)) && !owner.has(m[1]) && headOk(m[1], [`#${st.id}`, `h2=${m[1]}`])) {
        st.h2 = { key: m[1], part: true, at: items.length, lead: nd.lead }; owner.set(m[1], st.id);
      }
      if ((m = nd.raw.match(PROSE)) && !owner.has(m[4])) {
        const k = m[4], c = cls(m[2]), attrs = ['#' + k, ...c.split(/\s+/).filter(Boolean).map(x => '.' + x)];
        if (m[1] !== 'p') attrs.push('tag=' + m[1]);
        if (!m[3]) attrs.push('i18n=text');
        if (paraOk(k, attrs)) { items.push({ kind: 'p', key: k, tag: m[1], cls: c, text: !m[3], attrs, lead: nd.lead }); owner.set(k, st.id); return; }
      }
      const last = items[items.length - 1];
      if (last && last.kind === 'part' && last.open) last.raw += nd.lead + nd.raw;
      else items.push({ kind: 'part', raw: nd.raw, lead: nd.lead, open: true });
    });
    let pn = 0;
    for (const it of items) if (it.kind === 'part') {
      it.name = `${st.id}-${++pn}`; delete it.open;
      it.keys = t.i18nKeysIn(it.raw).filter(k => k in Z && !owner.has(k));
      it.keys.forEach(k => owner.set(k, st.id));
      const missing = t.i18nKeysIn(it.raw).filter(k => !(k in Z));
      if (missing.length) fail(`${st.id}: markup names key(s) the string table does not define: ${missing.join(', ')}`);
    }
    st.items = items;
  }
  // keys no markup names (app.js uses them): with the nearest named key before them in the zh table
  const leftover = { global: [] };
  steps.forEach(s => { leftover[s.id] = []; });
  {
    let cur = 'global';
    for (const k of keysZ) { if (owner.has(k)) { cur = owner.get(k); continue; } leftover[cur].push(k); owner.set(k, cur); }
  }
  const missingFrame = t.i18nKeysIn(frame).filter(k => !(k in Z));
  if (missingFrame.length) fail(`the page names key(s) the string table does not define: ${missingFrame.join(', ')}`);

  /* ── 3. legacy whitespace ── */
  const leadCount = new Map();
  for (const st of steps) for (const x of [...st.items, ...(st.h2 && !st.h2.part ? [st.h2] : [])]) leadCount.set(x.lead, (leadCount.get(x.lead) || 0) + 1);
  const indent = [...leadCount].sort((a, b) => b[1] - a[1])[0][0];
  const leads = {};
  for (const st of steps) {
    if (st.h2 && !st.h2.part && st.h2.lead !== indent) leads['h2:' + st.id] = st.h2.lead;
    for (const it of st.items) if (it.lead !== indent) leads[it.kind === 'p' ? it.key : it.name] = it.lead;
  }
  const pat = (list, i) => list[i].split(`id="${steps[i].id}"`).join('id="{id}"').split(`"${steps[i].n}"`).join('"{n}"');
  const openPat = pat(opens, 0), closePat = pat(closes, 0);
  const section = {
    open: opens.every((o, i) => sub(openPat, steps[i]) === o) ? openPat : opens,
    close: closes.every((c, i) => sub(closePat, steps[i]) === c) ? closePat : closes,
  };
  const L = { _note: 'Whitespace and markup of the hand-written lesson this page was converted from, so the conversion could be checked byte for byte (specs/site-template.md §3c).' };
  if (JSON.stringify(section) !== JSON.stringify(DEFAULTS.section)) L.section = section;
  if (indent !== DEFAULTS.indent) L.indent = indent;
  if (Object.keys(leads).length) L.leads = leads;
  const defGaps = ['\n', ...steps.slice(1).map(() => '\n\n'), '\n'];
  if (JSON.stringify(gaps) !== JSON.stringify(defGaps)) L.mainGaps = gaps;
  if (legacy.stepNav === false) L.stepNav = false;
  else if (JSON.stringify(navGen) !== JSON.stringify(DEFAULTS.stepNav)) L.stepNav = navGen;
  if (filled.length) L.filled = filled;
  if (labelTpl) L.label = labelTpl;

  /* ── 4. content ── */
  const val = v => (v === '' || /^\s|\s$|^"|\n/.test(v) ? JSON.stringify(v) : v);
  const steps0 = steps;
  function emit(lang) {
    const out = ['---', `lang: ${lang}`, '---', ''];
    const entry = k => `${k}: ${val(V(lang, k))}`;
    const globals = keysZ.filter(k => owner.get(k) === 'global');
    if (globals.length) { out.push('::: strings'); globals.forEach(k => out.push(entry(k))); out.push(':::', ''); }
    for (const st of steps0) {
      const a = [`#${st.id}`];
      if (st.h2) a.push(`h2=${st.h2.key}`);
      if (st.h2 && st.h2.id) a.push(`h2id=${st.h2.id}`);
      if (st.h2 && st.h2.part) a.push('h2part=1');
      if (st.h2 && st.h2.html) a.push('i18n=html');
      if (st.h2 && st.h2.cls) st.h2.cls.split(/\s+/).filter(Boolean).forEach(c => a.push('.' + c));
      if (st.nav && st.nav !== 'nav' + st.n) a.push(`nav=${st.nav}`);
      const kick = (() => { let n = 0; while (n < st.items.length && st.items[n].kind === 'p' && st.items[n].cls.split(' ').includes('step-kicker')) n++; return n; })();
      const pre = st.h2 && !st.h2.part ? st.h2.at : kick;
      if (pre !== kick) a.push(`pre=${pre}`);
      out.push(`## ${st.h2 ? V(lang, st.h2.key) : ''} {${a.join(' ')}}`.replace('##  {', '## {'), '');
      if (st.nav) out.push('::: strings', entry(st.nav), ':::', '');
      for (const it of st.items) {
        if (it.kind === 'p') { out.push(paraLine(V(lang, it.key), it.attrs), ''); continue; }
        out.push(`::: html ${it.name}`); it.keys.forEach(k => out.push(entry(k))); out.push(':::', '');
      }
      if (leftover[st.id].length) { out.push('::: strings'); leftover[st.id].forEach(k => out.push(entry(k))); out.push(':::', ''); }
    }
    return out.join('\n');
  }
  // a step without a heading key: "## {#stepN}" must parse as a heading
  for (const st of steps) if (!st.h2) fail(`${st.id}: no <h2 data-i18n> the content can hold as its heading`);
  const md = { zh: emit('zh'), en: emit('en') };
  const enCjk = Object.keys(E).filter(k => t.CJK.test(E[k]));

  /* ── 5. page.json and files ── */
  const metaOut = {};
  if (pjOld) for (const [k, v] of Object.entries(pjOld)) metaOut[k] = v;
  Object.assign(metaOut, { slug: page.slug, kind: 'lesson', layout: 'lesson' });
  if (version) metaOut.version = version;
  if (titleKey) metaOut.titleKey = titleKey;
  if (enCjk.length) metaOut.enCjk = enCjk;
  metaOut.legacyLayout = L;
  const written = [];
  const write = (rel, s) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), s); written.push(rel); };
  for (const l of LANGS) write(`content.${l}.md`, md[l]);
  write(LAYOUT_FILE, frame);
  write(SHELL, split.shell);
  for (const st of steps) for (const it of st.items) if (it.kind === 'part') write(`figures/${it.name}.html`, it.raw + '\n');
  fs.writeFileSync(pjFile, JSON.stringify(metaOut, null, 2) + '\n');

  /* ── 6. the equivalence proof ── */
  const res = buildLesson(dir, { root, chrome: false, prefill: false });
  const problems = [...res.errors];
  if (!res.errors.length) {
    const a = res.outputs['index.html'];
    if (a !== H) {
      const i = [...a].findIndex((c, j) => c !== H[j]);
      problems.push(`index.html differs from the live page at char ${i}: built ${JSON.stringify(a.slice(Math.max(0, i - 50), i + 70))} vs live ${JSON.stringify(H.slice(Math.max(0, i - 50), i + 70))}`);
    }
    const b = splitI18n(res.outputs['i18n.js']);
    if (!b) problems.push('the built i18n.js has no string table');
    else {
      if (b.shell !== split.shell) problems.push('the built i18n.js differs from the old one outside the string table');
      for (const l of LANGS) {
        const x = b.tables[l], y = split.tables[l];
        for (const k of Object.keys(y)) if (!(k in x)) problems.push(`${l}: key ${k} lost`); else if (x[k] !== y[k]) problems.push(`${l}: ${k} differs: ${JSON.stringify(x[k]).slice(0, 120)} vs ${JSON.stringify(y[k]).slice(0, 120)}`);
        for (const k of Object.keys(x)) if (!(k in y)) problems.push(`${l}: key ${k} added`);
      }
    }
  }
  const nParts = steps.reduce((n, s) => n + s.items.filter(i => i.kind === 'part').length, 0);
  const nParas = steps.reduce((n, s) => n + s.items.filter(i => i.kind === 'p').length, 0);
  if (problems.length) {
    if (pjBefore != null) { fs.writeFileSync(pjFile + '.converted', JSON.stringify(metaOut, null, 2) + '\n'); fs.writeFileSync(pjFile, pjBefore); }
    return { ok: false, problems, written, slug: page.slug, sitePath };
  }
  const derived = [
    ...LANGS.map(l => `${sitePath}i18n.js -> ${sitePath}content.${l}.md`),
    `${sitePath}i18n.js -> ${sitePath}${SHELL}`,
    ...(pjBefore == null ? [`${sitePath}index.html -> ${sitePath}page.json`] : []),
    `${sitePath}index.html -> ${sitePath}${LAYOUT_FILE}`,
    ...written.filter(w => w.startsWith('figures/')).map(w => `${sitePath}index.html -> ${sitePath}${w}`),
  ];
  return {
    ok: true, slug: page.slug, sitePath, written, derived,
    summary: `${steps.length} steps, ${keysZ.length} keys per language, ${nParas} paragraphs, ${nParts} html partials, ${filled.length} pre-filled elements, ` +
      `${(md.zh.match(/\[\[/g) || []).length} [[refs]] in zh, nav ${legacy.stepNav === false ? 'kept in layout.html' : 'generated'}, label ${labelTpl ? 'from page-provenance.json' : 'none'}`,
  };
}

module.exports = { compileLesson, buildLesson, convertLesson, splitI18n, serializeTables, unfill, fillSome, MARK, SHELL, LAYOUT_FILE, DEFAULTS };
