'use strict';
/* Site template core (specs/site-template.md): the registry, [[refs]], inline Markdown, the content parser
 * and the essay page builder. Plain node, no dependencies. Used by scripts/build-pages.cjs,
 * scripts/convert-essay.cjs, scripts/build-site-nav.cjs and tests/site-template*.cjs.
 *
 * Every function takes an explicit site root so tests can run against a fixture site
 * (tests/fixtures/site-template/) instead of the real one.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');
const { spawnSync } = require('child_process');
const { prefill, unprefill } = require('./prefill.cjs');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LANGS = ['zh', 'en'];
const LAYOUT_DIR = path.join(REPO_ROOT, 'templates', 'layouts');

/* ───────── copy files ───────── */
function loadCopy(file) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx);
  const E = ctx.window.ESSAY_COPY;
  if (!E) throw new Error(file + ': no window.ESSAY_COPY');
  return E[Object.keys(E)[0]];
}

/* ───────── the registry ─────────
 * Pages, categories and subtopics come from scripts/lib/registry.cjs: every page.json with a "status" once
 * pages.config.js has its GENERATED KNOWLEDGE_PAGES fence (Phase 2), the KNOWLEDGE_PAGES rows before that (and in the
 * test fixture). Live pages only. Anchors are scanned from each page's index.html (or its content files when it is a
 * template page), concepts come from atlas/data.js (node titles and aliases, merged with atlas/graph/aliases.json and
 * the essay fragments by build-atlas-data).
 */
const REG = require('./registry.cjs');
function loadPagesConfig(root = REPO_ROOT) {
  return REG.loadRegistry(root).config;
}
// A template page is a page.json with a "layout"; a metadata-only page.json just registers a hand-written page.
function isTemplateDir(dir) {
  const f = path.join(dir, 'page.json');
  if (!fs.existsSync(f)) return false;
  try { return !!JSON.parse(fs.readFileSync(f, 'utf8')).layout; } catch (e) { return false; }
}
const SITES = new Map();
function createSite(root = REPO_ROOT) {
  root = path.resolve(root);
  if (SITES.has(root)) return SITES.get(root);
  const registry = REG.loadRegistry(root);
  const w = registry.config;
  const pages = (w.KNOWLEDGE_PAGES || []).filter(p => p.status === 'live' && p.path);
  const bySlug = new Map(), byPath = new Map();
  for (const p of pages) {
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
    byPath.set(p.path.replace(/\/?$/, '/'), p);
  }
  const ax = { window: {} };
  const atlasFile = path.join(root, 'atlas', 'data.js');
  if (fs.existsSync(atlasFile)) vm.runInNewContext(fs.readFileSync(atlasFile, 'utf8'), ax);
  const atlas = ax.window.ATLAS || {};
  const nodes = new Map();
  for (const n of (atlas.nodes || [])) nodes.set(n.id, n);
  const anchorCache = new Map();
  const site = {
    root, config: w, registry, pages, bySlug, byPath, nodes, atlas,
    cats: w.KNOWLEDGE_CATEGORIES || [], subs: w.KNOWLEDGE_SUBTOPICS || {},
    dirOf: p => path.join(root, p.path),
    isMigrated: p => isTemplateDir(path.join(root, p.path)),
    anchors(p) {
      if (anchorCache.has(p.slug)) return anchorCache.get(p.slug);
      const d = path.join(root, p.path), set = new Set();
      for (const f of ['index.html', 'content.zh.md']) {
        let s = '';
        try { s = fs.readFileSync(path.join(d, f), 'utf8'); } catch (e) { continue; }
        for (const m of s.matchAll(/\bid="([\w-]+)"/g)) set.add(m[1]);
        for (const m of s.matchAll(/^#{1,3}\s.*\{#([\w-]+)[^}]*\}\s*$/gm)) set.add(m[1]);
      }
      anchorCache.set(p.slug, set);
      return set;
    },
  };
  SITES.set(root, site);
  return site;
}
const pick = (v, l) => (v == null ? '' : typeof v === 'string' ? v : (v[l] != null ? v[l] : (v.zh || v.en || '')));
const titleOf = (p, lang) => pick(p.title, lang);
// href "../y/#ch1" written on page dir "computing/systems/x/" -> [page, anchor] (null if not a live page)
function resolveHref(site, fromPath, href) {
  const m = href.match(/^([^#?]*)(?:#([\w-]+))?$/);
  if (!m || /^[a-z]+:/i.test(href) || !m[1]) return null;
  const abs = path.posix.normalize(path.posix.join(fromPath, m[1])).replace(/\/?$/, '/');
  const p = site.byPath.get(abs);
  return p ? [p, m[2] || null] : null;
}
const relHref = (fromPath, toPath) => { const r = path.posix.relative(fromPath, toPath); return r ? r + '/' : './'; };

/* Concept terms as search matches them (specs/atlas-search-index.md): atlas/data.js node ids, titles and aliases, where
   the aliases are already merged from the node, atlas/graph/aliases.json and the essay fragments (build-atlas-data), and
   each term is normalised with search/concept-search.js squash (NFKC, lower case, no spaces, hyphens, middle dots or
   apostrophes). squashed term -> [node id]. */
const SEARCH = require(path.join(REPO_ROOT, 'search', 'concept-search.js'));
function conceptTerms(S) {
  if (S._terms) return S._terms;
  const m = new Map();
  for (const x of S.nodes.values()) {
    const terms = [x.id, x.title && x.title.zh, x.title && x.title.en, ...((x.aliases || {}).zh || []), ...((x.aliases || {}).en || [])];
    for (const t of new Set(terms.filter(Boolean).map(SEARCH.squash))) {
      if (!t) continue;
      if (!m.has(t)) m.set(t, []);
      m.get(t).push(x.id);
    }
  }
  return (S._terms = m);
}

/* ───────── references: [[slug]], [[slug#ch7]], [[slug#ch7|text]], [[#ch3|text]], [[concept:id-or-alias]] ───────── */
class TemplateError extends Error {}
function resolveRef(target, ctx) {
  const S = ctx.site;
  if (target.startsWith('concept:')) {
    const q = target.slice(8);
    let n = S.nodes.get(q);
    if (!n) { // by title or alias: one word, one owner. Two owners is an error, never a guess.
      const hits = conceptTerms(S).get(SEARCH.squash(q)) || [];
      if (hits.length > 1) throw new TemplateError(`concept "${q}" is ambiguous: ${hits.join(', ')} (one word, one owner: write [[concept:<id>]], or move the alias in atlas/graph so one concept owns it)`);
      n = S.nodes.get(hits[0]);
    }
    if (!n) throw new TemplateError(`unknown concept "${q}"`);
    const l = (n.lessons || []).find(x => x.primary) || (n.lessons || [])[0];
    if (!l || !S.bySlug.get(l.slug)) throw new TemplateError(`concept "${q}" has no page`);
    const p = S.bySlug.get(l.slug);
    return { p, anchor: l.anchor || (l.step != null ? 'step' + l.step : null), text: n.title && (n.title[ctx.lang] || n.title.zh) };
  }
  const [slug, a] = target.split('#');
  const p = slug ? S.bySlug.get(slug) : ctx.page;
  if (!p) throw new TemplateError(`unknown page "${slug}"`);
  const anchor = a || null;
  if (anchor && !(slug && p !== ctx.page ? S.anchors(p) : ctx.ownAnchors).has(anchor)) throw new TemplateError(`page "${p.slug}" has no #${anchor}`);
  return { p, anchor, text: titleOf(p, ctx.lang) };
}

/* ───────── inline Markdown -> HTML ─────────
 * {=name} bound number, [[ref]], **bold**, *em*; everything else (inline HTML, {v} runtime placeholders) passes
 * through. Backslash escapes: \\ \* \[ \{ give the literal character.
 */
const ESC = { '\\': '', '*': '', '[': '', '{': '' };
const UNESC = Object.fromEntries(Object.entries(ESC).map(([k, v]) => [v, k]));
function renderInline(md, ctx) {
  let s = md.replace(/\\([\\*[{])/g, (m, c) => ESC[c]);
  s = s.replace(/\{=([\w.-]+)\}/g, (m, k) => {
    if (!ctx.bindings || !(k in ctx.bindings)) throw new TemplateError(`unbound number {=${k}}`);
    if (ctx.used) ctx.used.add(k);
    return String(ctx.bindings[k]);
  });
  s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, target, text) => {
    const r = resolveRef(target.trim(), ctx);
    if (ctx.refs) ctx.refs.push({ key: ctx.key, to: r.p.slug, anchor: r.anchor });
    const href = (r.p === ctx.page ? '' : relHref(ctx.page.path, r.p.path)) + (r.anchor ? '#' + r.anchor : '');
    return `<a href="${href}">${text != null ? text : r.text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, '$1<em>$2</em>');
  return s.replace(/[-]/g, c => UNESC[c]);
}
// The literal form of a string: renderInline(escapeInline(s)) === s for any s without inline syntax side effects.
const escapeInline = s => s.replace(/\\(?=[\\*[{])/g, '\\\\').replace(/\*/g, '\\*').replace(/\[\[/g, '\\[[').replace(/\{=/g, '\\{=');
// HTML -> inline Markdown, used by the converter. Always verified: if the nicer form does not render back
// to the exact input, the escaped literal form is used instead.
function unrenderInline(html, ctx) {
  const lit = escapeInline(html);
  let s = lit.replace(/<strong>([^<*\\]+)<\/strong>/g, '**$1**').replace(/<em>([^<*\\\s][^<*\\]*)<\/em>/g, '*$1*');
  s = s.replace(/<a href="([^"]+)">([^<\]|\\]*)<\/a>/g, (m, href, text) => {
    const r = resolveHref(ctx.site, ctx.page.path, href);
    if (!r || r[0] === ctx.page) return m;
    const [p, a] = r, t = p.slug + (a ? '#' + a : '');
    return text === titleOf(p, ctx.lang) ? `[[${t}]]` : `[[${t}|${text}]]`;
  });
  const ok = x => { try { return renderInline(x, { ...ctx, refs: null, used: null }) === html; } catch (e) { return false; } };
  if (s !== lit && ok(s)) return s;
  if (ok(lit)) return lit;
  throw new TemplateError(`cannot express value of ${ctx.key} in Markdown`);
}

/* ───────── content file parser ─────────
 * Returns { front, blocks }. Block types: heading (level 1–3), para, list, break (a --- line: new prose column),
 * and ::: directives (strings, lab, diagram, html, footer) with { name, opts, entries | body }.
 */
function parseAttrs(s) {
  const a = { classes: [] };
  for (const m of s.matchAll(/([#.])([\w.-]+)|([\w-]+)="([^"]*)"|([\w-]+)=([\w.-]+)/g)) {
    if (m[1] === '#') a.key = m[2]; else if (m[1] === '.') a.classes.push(m[2]);
    else if (m[3]) a[m[3]] = m[4]; else a[m[5]] = m[6];
  }
  return a;
}
const TRAIL = /\s\{([#.][^{}]*)\}\s*$/;
function splitTrail(line) { const m = line.match(TRAIL); return m ? [line.slice(0, m.index), parseAttrs(m[1])] : [line, { classes: [] }]; }
const isCjk = c => /[　-鿿＀-￯]/.test(c || '');
const joinLines = ls => ls.reduce((acc, l) => !acc ? l : acc + (isCjk(acc.slice(-1)) && isCjk(l[0]) ? '' : ' ') + l, '');
const parseValue = v => (/^"/.test(v) ? JSON.parse(v) : v);
const BLOCK_START = /^(:::|#{1,3}\s|- |\d+\. |\{[#.]|---\s*$)/;
const PARA_ESCAPED = /^\\(:::|#{1,3}\s|- |\d+\. |\{[#.]|<!--|---\s*$)/;

function parseContent(text, file) {
  const lines = text.split('\n');
  let i = 0;
  const front = {}, blocks = [];
  const err = msg => { throw new TemplateError(`${file}:${i + 1}: ${msg}`); };
  if (lines[0] === '---') {
    for (i = 1; lines[i] !== '---'; i++) {
      if (i >= lines.length) err('unclosed front matter');
      const m = lines[i].match(/^([\w.-]+):\s?(.*)$/);
      if (m) front[m[1]] = parseValue(m[2]);
    }
    i++;
  }
  let pending = null;
  while (i < lines.length) {
    const L = lines[i];
    if (!L.trim() || /^<!--.*-->$/.test(L.trim())) { i++; continue; }
    const start = i;
    let m;
    if ((m = L.match(/^:::\s*(\w+)(?:\s+([\w.-]+))?((?:\s+[\w-]+=[\w.-]+)*)\s*$/))) {
      const opts = {};
      for (const o of (m[3] || '').trim().split(/\s+/).filter(Boolean)) { const [k, v] = o.split('='); opts[k] = v; }
      const b = { type: m[1], name: m[2] || null, opts, entries: [], body: [], line: start + 1 };
      for (i++; i < lines.length && lines[i].trim() !== ':::'; i++) {
        if (b.type === 'footer') { b.body.push(lines[i]); continue; }
        if (!lines[i].trim()) continue;
        const e = lines[i].match(/^([\w.-]+):\s(.*)$/) || lines[i].match(/^([\w.-]+):()$/);
        if (!e) err(`expected "key: value" in ::: ${b.type}`);
        b.entries.push([e[1], parseValue(e[2])]);
      }
      if (i >= lines.length) err('unclosed :::');
      i++;
      blocks.push(b);
      continue;
    }
    if (L.trim() === ':::') err('stray :::');
    // --- inside a chapter closes the prose column and opens a new one (two consecutive <div class="wrap">)
    if (/^---\s*$/.test(L)) { blocks.push({ type: 'break', line: start + 1 }); i++; continue; }
    if ((m = L.match(/^\{([#.][^{}]*)\}$/))) { pending = parseAttrs(m[1]); i++; continue; }
    if ((m = L.match(/^(#{1,3})\s+(.*)$/))) {
      const [t, a] = splitTrail(m[2]);
      blocks.push({ type: 'heading', level: m[1].length, text: t, attrs: a, line: start + 1 });
      i++;
      continue;
    }
    if (/^(- |\d+\. )/.test(L)) {
      const items = [];
      for (; i < lines.length && /^(- |\d+\. )/.test(lines[i]); i++) {
        const [t, a] = splitTrail(lines[i].replace(/^(- |\d+\. )/, ''));
        items.push({ text: t.replace(/^\\/, ''), attrs: a });
      }
      blocks.push({ type: 'list', ordered: /^\d/.test(L), items, attrs: pending || { classes: [] }, line: start + 1 });
      pending = null;
      continue;
    }
    const para = [];
    for (; i < lines.length && lines[i].trim() && !(para.length && BLOCK_START.test(lines[i])); i++) para.push(lines[i]);
    // A paragraph whose text would read as block syntax is written with a leading backslash.
    if (PARA_ESCAPED.test(para[0])) para[0] = para[0].slice(1);
    const [t, a] = splitTrail(joinLines(para));
    if (pending) { Object.assign(a, pending, { classes: [...pending.classes, ...a.classes] }); pending = null; }
    blocks.push({ type: 'para', text: t, attrs: a, line: start + 1 });
  }
  return { front, blocks };
}
// Does a paragraph text need the leading backslash to survive parseContent?
const needsParaEscape = t => /^(:::|#{1,3}\s|- |\d+\. |\{[#.]|<!--|---\s*$)/.test(t);

/* ───────── keys ─────────
 * Paragraphs without a class get positional keys <sec>.p1, p2… (the counter runs through the whole chapter);
 * .law -> <sec>.law, .take -> <sec>.limit, hero paragraphs -> hero.<first class>. Anything else carries {#key}.
 */
function autoKey(sec, classes, counter) {
  if (sec === 'hero') return classes.length ? 'hero.' + classes[0] : null;
  if (classes.includes('law')) return sec + '.law';
  if (classes.includes('take')) return sec + '.limit';
  if (!classes.length) return sec + '.p' + (++counter.n);
  return null;
}
const i18nKeysIn = html => [...new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]))];

/* ───────── layout ───────── */
function fillLayout(name, slots) {
  const tpl = fs.readFileSync(path.join(LAYOUT_DIR, name + '.html'), 'utf8');
  const seen = new Set();
  const out = tpl.replace(/\{\{([\w.]+)\}\}/g, (m, k) => {
    if (!(k in slots)) throw new TemplateError(`layout ${name}: no value for {{${k}}}`);
    seen.add(k);
    return slots[k];
  });
  for (const k of Object.keys(slots)) if (!seen.has(k)) throw new TemplateError(`layout ${name}: slot {{${k}}} is not in the layout`);
  return out;
}

/* ───────── the essay builder ─────────
 * buildEssay(dir, { root, chrome, prefill }) -> { outputs: {file: text}, errors: [], warnings: [], stats }
 * chrome=false + prefill=false reproduces the pre-template page exactly (the converter's equivalence proof).
 */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const CHROME_TEXT = {
  zh: { aria: '页面位置', home: '首页', bl: '被这些页面引用', rel: '相关页面', ch: n => `第 ${n} 章`, src: n => `该文第 ${n} 章`, here: '本页' },
  en: { aria: 'Breadcrumb', home: 'Home', bl: 'Linked from', rel: 'Related pages', ch: n => `chapter ${n}`, src: n => `its chapter ${n}`, here: 'this page' },
};
const RUNTIME = /\{[a-zA-Z_][\w]*\}/g, HAS_RUNTIME = /\{[a-zA-Z_][\w]*\}/;

function readJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }

function compileLang(dir, lang, env) {
  const file = `content.${lang}.md`;
  const { site, page, bindings, errors } = env;
  const { front, blocks } = parseContent(fs.readFileSync(path.join(dir, file), 'utf8'), file);
  const copy = {}, order = [], src = {};
  const ctx = { site, page, lang, bindings, refs: [], used: new Set(), ownAnchors: new Set(), key: null };
  for (const b of blocks) if (b.type === 'heading' && b.level <= 2 && b.attrs.key) ctx.ownAnchors.add(b.attrs.key);
  const sectionIds = new Set(ctx.ownAnchors);
  const put = (k, v, inline = true) => {
    if (k in copy) errors.push(`${lang}: duplicate key ${k}`);
    // site.* is the chrome's namespace (§8): page tests skip it in link and number scans, so content may not use it
    if (k.startsWith('site.')) errors.push(`${file}: key ${k} is reserved for the template chrome (site.*)`);
    ctx.key = k; src[k] = v;
    try { copy[k] = inline ? renderInline(v, ctx) : v; } catch (e) { errors.push(`${file}: ${k}: ${e.message}`); copy[k] = v; }
    order.push(k);
  };
  const abs = (sec, k) => (sec && !sectionIds.has(k.split('.')[0])) ? sec + '.' + k : k;
  if (front.title == null || front.desc == null) errors.push(`${file}: front matter needs title and desc`);
  put('doc.title', String(front.title), false);
  put('doc.desc', String(front.desc), false);
  const skel = { hero: null, chapters: [], footer: null };
  let sec = null, chap = null, region = null;
  const counter = { n: 0 };
  const wrapBlocks = () => {
    if (!chap) { errors.push(`${file}: content before the first heading`); chap = { id: '?', regions: [] }; }
    if (chap.blocks) return chap.blocks; // hero
    if (!region || region.kind !== 'wrap') { region = { kind: 'wrap', blocks: [] }; chap.regions.push(region); }
    return region.blocks;
  };
  for (const b of blocks) {
    if (b.type === 'heading' && b.level <= 2) {
      sec = b.attrs.key;
      if (!sec) { errors.push(`${file}:${b.line}: heading needs {#anchor}`); continue; }
      counter.n = 0; region = null;
      put(sec + '.title', b.text, false);
      if (b.level === 1) { if (sec !== 'hero') errors.push(`${file}:${b.line}: the title heading must be {#hero}`); skel.hero = chap = { id: sec, blocks: [] }; }
      else { chap = { id: sec, regions: [] }; skel.chapters.push(chap); }
      continue;
    }
    if (b.type === 'heading') { // ### sub-heading inside a chapter
      const key = b.attrs.key ? abs(sec, b.attrs.key) : null;
      if (!key) { errors.push(`${file}:${b.line}: ### heading needs {#key}`); continue; }
      put(key, b.text, false);
      wrapBlocks().push({ kind: 'h3', key, cls: b.attrs.classes.join(' ') });
      continue;
    }
    if (b.type === 'strings') {
      for (const [k, v] of b.entries) put(sec ? (k === 'toc' && sec !== 'hero' ? 'toc.' + sec : k === 'kicker' && sec === 'hero' ? 'hero.kicker' : abs(sec, k)) : k, v);
      continue;
    }
    if (b.type === 'lab' || b.type === 'diagram' || b.type === 'html') {
      if (!b.name) { errors.push(`${file}:${b.line}: ::: ${b.type} needs a name`); continue; }
      const prefix = b.opts.keys || null;
      for (const [k, v] of b.entries) put(prefix ? prefix + '.' + k : abs(sec, k), v);
      if (b.opts.place != null && !(b.type === 'diagram' && b.opts.place === 'wide')) { errors.push(`${file}:${b.line}: place=${b.opts.place}: only ::: diagram takes place=wide`); continue; }
      if (b.type === 'lab' || b.opts.place === 'wide') {
        // a lab, or a diagram with place=wide, is a region of its own: <div class="wide"> between prose columns
        if (!chap || chap.blocks) { errors.push(`${file}:${b.line}: ::: ${b.type}${b.opts.place ? ' place=wide' : ''} must be inside a chapter`); continue; }
        chap.regions.push({ kind: b.type === 'lab' ? 'lab' : 'wide', name: b.name }); region = null;
      } else wrapBlocks().push({ kind: 'part', type: b.type, name: b.name });
      continue;
    }
    if (b.type === 'break') {
      if (!chap || chap.blocks || !region || region.kind !== 'wrap') { errors.push(`${file}:${b.line}: --- must follow prose inside a chapter (it starts a new prose column)`); continue; }
      region = null;
      continue;
    }
    if (b.type === 'footer') {
      const ps = []; let cur = [];
      for (const l of b.body.concat([''])) { if (l.trim()) cur.push(l); else if (cur.length) { ps.push(joinLines(cur)); cur = []; } }
      // Paragraphs that all end in {#key} are keyed: footer.<key> each, rendered as <p data-i18n-html="footer.<key>">
      // inside the footer column (how-sas-works). Otherwise the whole footer is one key, footer.
      const trails = ps.map(splitTrail);
      if (trails.some(([, a]) => a.key)) {
        if (!trails.every(([, a]) => a.key)) { errors.push(`${file}:${b.line}: ::: footer: either every paragraph carries {#key} or none does`); continue; }
        if (b.opts.wrap === 'none') { errors.push(`${file}:${b.line}: ::: footer wrap=none cannot have keyed paragraphs`); continue; }
        skel.footer = trails.map(([t, a]) => { put('footer.' + a.key, t); return 'footer.' + a.key; });
        continue;
      }
      ctx.key = 'footer'; src.footer = b.body.join('\n');
      // ::: footer wrap=none: one paragraph without <p> (older pages)
      try { copy.footer = b.opts.wrap === 'none' ? renderInline(ps.join(' '), ctx) : ps.map(p => '<p>' + renderInline(p, ctx) + '</p>').join(''); } catch (e) { errors.push(`${file}: footer: ${e.message}`); copy.footer = ''; }
      order.push('footer');
      continue;
    }
    if (b.type === 'para') {
      const c = b.attrs.classes;
      const auto = sec ? autoKey(sec, c, counter) : null;
      const key = b.attrs.key ? abs(sec, b.attrs.key) : auto;
      if (!key) { errors.push(`${file}:${b.line}: paragraph needs {#key}`); continue; }
      put(key, b.text);
      wrapBlocks().push({ kind: 'p', key, tag: b.attrs.tag || 'p', cls: c.join(' '), style: b.attrs.style || null });
      continue;
    }
    if (b.type === 'list') {
      const keys = b.items.map(it => it.attrs.key ? abs(sec, it.attrs.key) : null);
      if (keys.includes(null)) { errors.push(`${file}:${b.line}: every list item needs {#key}`); continue; }
      b.items.forEach((it, j) => put(keys[j], it.text));
      wrapBlocks().push({ kind: 'list', ordered: b.ordered, cls: b.attrs.classes.join(' '), keys });
      continue;
    }
    errors.push(`${file}:${b.line}: unknown block ::: ${b.type}`);
  }
  if (!skel.hero) errors.push(`${file}: no "# title {#hero}" heading`);
  return { copy, order, src, skel, refs: ctx.refs, used: ctx.used };
}

function loadBindings(dir, errors) {
  if (!fs.existsSync(path.join(dir, 'bindings.cjs'))) return null;
  try {
    const bf = require.resolve(path.join(dir, 'bindings.cjs')), mf = require.resolve(path.join(dir, 'models.js'));
    delete require.cache[bf]; delete require.cache[mf];
    return require(bf)(require(mf));
  } catch (e) { errors.push('bindings.cjs: ' + e.message); return {}; }
}

// Every link between live pages, scanned once per site: [{ src, dst, from, to }] (src, dst: registry rows; from: the source
// chapter "chN" or null; to: the target anchor or null). Self-links are left out. Used for backlinks (below) and by
// scripts/build-registry.cjs for the registry's ref edges, so both see the same links.
function scanLinks(site) {
  if (site._links) return site._links;
  const all = [];
  for (const p of site.pages) {
    const d = path.join(site.root, p.path);
    // A migrated page's links are in its sources: content.zh.md (compiled here, not read from the generated
    // copy.zh.js, so one --all pass is final even when an earlier page in the pass gained a link) and its
    // figures/*.html partials. Its index.html repeats them (pre-fill), and its site.* keys are generated backlinks /
    // related links; neither may feed back.
    const migrated = site.isMigrated(p);
    const figs = migrated && fs.existsSync(path.join(d, 'figures')) ? fs.readdirSync(path.join(d, 'figures')).filter(f => f.endsWith('.html')).sort().map(f => 'figures/' + f) : [];
    for (const f of migrated ? ['content.zh.md', ...figs] : ['copy.zh.js', 'i18n.js', 'index.html']) {
      const file = path.join(d, f);
      if (!fs.existsSync(file)) continue;
      let entries;
      if (f === 'content.zh.md') {
        // Keys come in document order, so a key outside the chN.* namespace (a diagram's dg.x.cap) is credited to the
        // chapter it sits in: the last chN seen before it.
        try {
          const c = compileLang(d, 'zh', { site, page: p, bindings: loadBindings(d, []), errors: [] });
          let ch = null;
          entries = c.order.map(k => { const m = /^(ch\d+)\./.exec(k); if (m) ch = m[1]; return [m ? k : (ch && !/^(hero|nav|toc|doc|footer)\b/.test(k) ? ch + '.' + k : k), c.copy[k]]; });
        } catch (e) { continue; }
      } else if (f === 'copy.zh.js') { try { entries = Object.entries(loadCopy(file)); } catch (e) { continue; } }
      else entries = [[null, fs.readFileSync(file, 'utf8')]];
      for (const [k, v] of entries) for (const m of String(v).matchAll(/href=\\?["']([^"'\\]+)\\?["']/g)) {
        const r = resolveHref(site, p.path, m[1]);
        if (!r || r[0] === p) continue;
        all.push({ src: p, dst: r[0], from: k && /^ch\d+\./.test(k) ? k.split('.')[0] : null, to: r[1] });
      }
    }
  }
  return (site._links = all);
}

function scanBacklinks(site, page) {
  const out = new Map();
  for (const L of scanLinks(site)) {
    if (L.dst !== page) continue;
    const row = out.get(L.src.slug) || { p: L.src, links: [] };
    out.set(L.src.slug, row);
    const sig = (L.from || '') + '>' + (L.to || '');
    if (!row.links.some(x => x.sig === sig)) row.links.push({ sig, from: L.from, to: L.to });
  }
  return [...out.values()].sort((a, b) => a.p.path.localeCompare(b.p.path));
}

function provenanceLabel(site, page, meta) {
  const file = path.join(site.root, 'page-provenance.json');
  if (!fs.existsSync(file)) return '';
  const all = readJson(file), p = (all.pages || {})[page.slug];
  if (!p) return '';
  const span = (zh, en) => `<span class="provenance-zh" lang="zh-CN">${zh}</span><span class="provenance-en" lang="en">${en}</span>`;
  const kind = p.kind === 'original' ? ['原创版本', 'Original edition'] : ['改进版本', 'Revised edition'];
  const note = meta.provenanceNote ? `<p>${span(meta.provenanceNote.zh, meta.provenanceNote.en)}</p>` : '';
  return `    <details class="page-provenance" data-developer="${p.developer}" data-edition="${p.edition}" data-source-revision="${p.sourceRevision}"><summary>${span(p.developer + ' 开发 · ' + kind[0], 'Developed with ' + p.developer + ' · ' + kind[1])}</summary>${note}<p>${span('范围：' + p.scope.zh + '。', 'Scope: ' + p.scope.en + '.')}</p><p>${p.edition} · <a href="https://github.com/flyfy1/knowledge-vis/commit/${p.sourceRevision}">${span('源码修订', 'Source revision')} · ${p.sourceRevision.slice(0, 8)}</a></p></details>\n`;
}

function siteNavIncludes(pagePath) {
  // Single source for the include lines and their cache key: scripts/build-site-nav.cjs.
  return require(path.join(REPO_ROOT, 'scripts', 'build-site-nav.cjs')).includeLines(pagePath);
}

/* ───────── checks on the sources (specs/site-template.md §7) ───────── */
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CJK = /[\u2e80-\u9fff\u3000-\u303f\uff00-\uffef]/;
const GEN_HEADER = /^<!-- GENERATED by (\S+)[^\n]*-->\n/;
const globRe = g => new RegExp('^' + g.split('*').map(reEsc).join('[^/]*') + '$');

/* Diagram label room (§7 「Label room」). For every <text x=… font-size=…> in an inline <svg viewBox>, estimate the
   rendered width of its string in each language and compare it with the room the viewBox leaves for its
   text-anchor, and with the other labels on the same baseline. The estimate uses rough per-character widths in em
   (CJK 1, capitals .64, lower case .52, i/l/j .25, m/w .8, digits .56, space .28, other .38, monospace .6), so it
   catches a label that is clearly too long before any browser run; text over a line still needs a screenshot. */
const plainText = h => String(h).replace(/<[^>]*>/g, '').replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/gi, 'x');
function emWidth(str, mono) {
  let w = 0;
  for (const c of str) {
    if (CJK.test(c)) w += 1;
    else if (mono) w += 0.6;
    else if (/[A-Z]/.test(c)) w += 0.64;
    else if (/[ilj]/.test(c)) w += 0.25;
    else if (/[mw]/.test(c)) w += 0.8;
    else if (/[a-z]/.test(c)) w += 0.52;
    else if (/[0-9]/.test(c)) w += 0.56;
    else if (c === ' ') w += 0.28;
    else w += 0.38;
  }
  return w;
}
// -> [{ key|null, raw, x, y, fs, anchor, mono, vb: [minX, width], svgIndex }] for every measurable label in a partial
function svgLabels(html) {
  const out = [];
  let n = 0;
  for (const svg of html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)) {
    n++;
    const vb = (svg[1].match(/\bviewBox="([-\d.\s]+)"/) || [])[1];
    if (!vb || /\btransform=/.test(svg[2])) continue; // no viewBox, or coordinates moved by a transform: not measured
    const [minX, , w] = vb.trim().split(/\s+/).map(Number);
    for (const t of svg[2].matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)) {
      const a = t[1], x = (a.match(/\bx="([-\d.]+)"/) || [])[1], y = (a.match(/\by="([-\d.]+)"/) || [])[1], fs = (a.match(/\bfont-size="([\d.]+)"/) || [])[1];
      if (x == null || y == null || fs == null) continue; // the estimate needs x, y and font-size on the element
      out.push({ key: (a.match(/\bdata-i18n(?:-html)?="([^"]+)"/) || [])[1] || null, raw: t[2], x: +x, y: +y, fs: +fs,
        anchor: (a.match(/\btext-anchor="(\w+)"/) || [])[1] || 'start', mono: /\bclass="[^"]*\bmono\b/.test(a), vb: [minX, w], svg: n });
    }
  }
  return out;
}
function labelRoom(L) {
  const [minX, w] = L.vb, maxX = minX + w;
  return L.anchor === 'middle' ? 2 * Math.min(L.x - minX, maxX - L.x) : L.anchor === 'end' ? L.x - minX : maxX - L.x;
}
// problems for one partial in one language: label too wide for the viewBox, or two labels on a baseline overlapping
function labelProblems(name, html, copy, lang) {
  const out = [];
  const ext = svgLabels(html).map(L => {
    const v = L.key ? copy[L.key] : L.raw;
    if (v == null || HAS_RUNTIME.test(v)) return null;
    const text = plainText(v), w = emWidth(text, L.mono) * L.fs;
    const x0 = L.anchor === 'middle' ? L.x - w / 2 : L.anchor === 'end' ? L.x - w : L.x;
    return { ...L, text, w, x0, x1: x0 + w };
  }).filter(Boolean);
  const label = L => (L.key || JSON.stringify(L.raw));
  for (const L of ext) {
    const room = labelRoom(L);
    if (L.key && L.w > room) out.push(`figures/${name}.html: ${lang} label ${L.key} "${L.text}" is about ${Math.round(L.w)} wide; the viewBox leaves ${Math.round(Math.max(0, room))} at x=${L.x} (${L.anchor}, ${L.fs}px). Shorten it (node scripts/build-pages.cjs --print-budgets <dir>)`);
  }
  for (let i = 0; i < ext.length; i++) for (let j = i + 1; j < ext.length; j++) {
    const A = ext[i], B = ext[j];
    if (A.svg !== B.svg || (!A.key && !B.key) || Math.abs(A.y - B.y) >= 0.9 * Math.max(A.fs, B.fs)) continue;
    const o = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
    if (o > 0) out.push(`figures/${name}.html: ${lang} labels ${label(A)} "${A.text}" and ${label(B)} "${B.text}" share a baseline (y≈${A.y}) and overlap by about ${Math.round(o)}. Shorten one`);
  }
  return out;
}

function buildEssay(dir, opts = {}) {
  const site = createSite(opts.root || REPO_ROOT);
  const CHROME = opts.chrome !== false, errors = [], warnings = [];
  dir = path.resolve(dir);
  const sitePath = path.relative(site.root, dir).split(path.sep).join('/') + '/';
  const meta = readJson(path.join(dir, 'page.json'));
  let page = site.bySlug.get(meta.slug);
  if (!page && site.byPath.has(sitePath)) return { errors: [`page.json slug "${meta.slug}" differs from the slug registered for ${sitePath}: "${site.byPath.get(sitePath).slug}"`], warnings, outputs: {} };
  if (!page) {
    // An unregistered draft (written natively in Markdown) builds from its REGISTRY.json, so it can be tested and
    // reviewed before registration. It is never in --all, nothing links to it yet, and it has no label.
    // Its place comes from page.json when it already names one (category, path; Phase 2), else from REGISTRY.json.
    const regFile = path.join(dir, 'REGISTRY.json'), reg = meta.path && meta.category ? meta : fs.existsSync(regFile) ? readJson(regFile) : null;
    const from = reg === meta ? 'page.json' : 'REGISTRY.json';
    if (!reg || reg.slug !== meta.slug || !reg.path) return { errors: [`page.json slug "${meta.slug}" is not a live page in the registry, and neither page.json (category, path) nor a REGISTRY.json with that slug and a path says where the draft lives`], warnings, outputs: {} };
    page = { slug: reg.slug, path: reg.path, category: reg.category, subtopic: reg.subtopic, stage: reg.stage, title: reg.title, status: 'draft' };
    warnings.push(`draft: "${meta.slug}" is not registered (its page.json has no "status": "live"); built from ${from} (no backlinks, related pages or provenance label until registration)`);
  }
  if (page.path.replace(/\/?$/, '/') !== sitePath) return { errors: [`page.json slug "${meta.slug}" is registered at ${page.path}, not ${sitePath}`], warnings, outputs: {} };
  const PREFILL = opts.prefill != null ? opts.prefill : meta.prefill !== false;
  const up = '../'.repeat(sitePath.split('/').filter(Boolean).length);
  const legacy = meta.legacyLayout || {};
  const join = new Set(legacy.join || []), compact = new Set(legacy.compactLists || []), gaps = legacy.gaps || {};

  const bindings = loadBindings(dir, errors);
  const env = { site, page, bindings, errors };
  const C = {};
  for (const l of LANGS) {
    try { C[l] = compileLang(dir, l, env); } catch (e) { errors.push(e.message); }
  }
  if (!C.zh || !C.en) return { errors, warnings, outputs: {} };

  /* parity: a translation may change words only */
  const hrefs = s => [...String(s).matchAll(/href=(["'])([^"']*)\1/g)].map(m => m[2]).sort().join(' ');
  {
    const z = C.zh, e = C.en, tok = (s, re) => (String(s).match(re) || []).sort().join(' ');
    if (JSON.stringify(z.skel) !== JSON.stringify(e.skel)) errors.push('parity: zh and en differ in structure (blocks, keys, figures)');
    for (const k of z.order) {
      if (!(k in e.copy)) { errors.push('parity: en lacks ' + k); continue; }
      if (tok(z.copy[k], RUNTIME) !== tok(e.copy[k], RUNTIME)) errors.push('parity: runtime placeholders differ in ' + k);
      if (tok(z.src[k], /\{=[\w.-]+\}/g) !== tok(e.src[k], /\{=[\w.-]+\}/g)) errors.push('parity: bound numbers differ in ' + k);
      if (hrefs(z.copy[k]) !== hrefs(e.copy[k])) errors.push('parity: link targets differ in ' + k);
    }
    for (const k of e.order) if (!(k in z.copy)) errors.push('parity: zh lacks ' + k);
    if (bindings) for (const b of Object.keys(bindings)) if (!z.used.has(b)) errors.push(`binding ${b} is never used`);
  }

  /* languages: page.json "languages": {"en": "stub"} while the English is a structural stub, else "native" (default).
     A native English page may hold no Chinese text and no [EN pending] marker; a stub page is marked on <html> so
     app.js can fall back to Chinese (data-lang-en="stub"). */
  const languages = Object.assign({ zh: 'native', en: 'native' }, meta.languages || {});
  for (const [l, v] of Object.entries(languages)) {
    if (!LANGS.includes(l) || !['native', 'stub'].includes(v) || (l === 'zh' && v !== 'native')) errors.push(`page.json languages.${l}: "${v}" is not allowed (zh is "native"; en is "native" or "stub")`);
  }
  const enStub = languages.en === 'stub';
  // A stub may be built and reviewed as a draft, but a registered page cannot ship one: readers choosing EN would get
  // Chinese (follow-up review 2026-11-16, 5「Stub pages can ship」). The CJK test reads the raw string, so Chinese in an
  // attribute (<abbr title="目录">) counts too, and the pending marker is matched in any case.
  if (enStub && page.status !== 'draft') errors.push('en is a stub (page.json languages.en = "stub") on a registered page: translate content.en.md and remove the field before registering (a stub is allowed only while the page is a draft)');
  else if (enStub) warnings.push('en is a stub (page.json languages.en = "stub"): the page shows Chinese when English is chosen');
  else {
    const bad = C.en.order.filter(k => CJK.test(C.en.copy[k]) || /\[en pending\]/i.test(C.en.copy[k]));
    if (bad.length) errors.push(`en: ${bad.length} string(s) still hold Chinese text or [EN pending] (${bad.slice(0, 6).join(', ')}${bad.length > 6 ? ', …' : ''}); translate them, or set page.json "languages": {"en": "stub"} while the translation is pending`);
  }

  /* REGISTRY.json and pages.config.js repeat the title and description; they must equal the content (title = the
     # … {#hero} heading, desc = front matter desc), so a translation cannot disagree with the registry. */
  {
    const regFile = path.join(dir, 'REGISTRY.json'), reg = fs.existsSync(regFile) ? readJson(regFile) : null;
    for (const l of LANGS) {
      const C2 = C[l].copy, q = s => JSON.stringify(String(s));
      if (reg && reg.title && reg.title[l] != null && reg.title[l] !== C2['hero.title']) errors.push(`REGISTRY.json title.${l} ${q(reg.title[l])} differs from the title heading of content.${l}.md ${q(C2['hero.title'])}`);
      if (reg && reg.desc && reg.desc[l] != null && reg.desc[l] !== C2['doc.desc']) errors.push(`REGISTRY.json desc.${l} differs from the front-matter desc of content.${l}.md: ${q(reg.desc[l]).slice(0, 80)}… vs ${q(C2['doc.desc']).slice(0, 80)}…`);
      if (page.status !== 'draft' && page.title && typeof page.title === 'object' && page.title[l] != null && page.title[l] !== C2['hero.title']) errors.push(`pages.config.js title.${l} ${q(page.title[l])} differs from the title heading of content.${l}.md ${q(C2['hero.title'])}`);
    }
  }

  /* dynamic keys: page.json "dynamicKeys": {"ch4.say": ["norm", "sub"]} lists the keys app.js builds at run time
     (t('ch4.say.' + cls)). Each must be defined. Once a page declares any, every such prefix in its scripts must be
     declared, so a new branch cannot ship without its string. */
  if (meta.dynamicKeys) {
    for (const [pre, vals] of Object.entries(meta.dynamicKeys)) {
      if (!Array.isArray(vals) || !vals.length) { errors.push(`page.json dynamicKeys.${pre}: list the values the script appends`); continue; }
      for (const v of vals) for (const l of LANGS) if (!((pre + '.' + v) in C[l].copy)) errors.push(`page.json dynamicKeys: ${pre}.${v} is not defined in content.${l}.md`);
    }
    for (const sc of meta.scripts || []) {
      if (/^copy\./.test(sc) || !fs.existsSync(path.join(dir, sc))) continue;
      const js = fs.readFileSync(path.join(dir, sc), 'utf8');
      for (const m of js.matchAll(/\bt\(\s*(?:(['"])([\w.]+)\.\1\s*\+|`([\w.]+)\.\$\{)/g)) {
        const pre = m[2] || m[3];
        if (!(pre in meta.dynamicKeys)) errors.push(`${sc} builds keys from '${pre}.' + …; list the values in page.json dynamicKeys["${pre}"]`);
      }
    }
  }

  /* generated partials: page.json "generators": [{"run": "tools/diagrams.cjs", "writes": ["figures/dg-*.html"]}].
     Each file a generator writes starts with <!-- GENERATED by <run> … -->; the build strips that line when it inlines
     the partial. With opts.generators (build-pages --check) each generator is rerun in a scratch copy of the page
     directory and its output compared with the committed partials. */
  const gens = meta.generators || [];
  {
    const figDir = path.join(dir, 'figures');
    const figs = fs.existsSync(figDir) ? fs.readdirSync(figDir).filter(f => f.endsWith('.html')).sort().map(f => 'figures/' + f) : [];
    // run: a script inside the page directory (no absolute path, no .. segment), so the --check rerun below executes
    // the scratch copy's own file and nothing outside it; writes: globs under figures/ (review 2026-11-16).
    const insidePage = p => typeof p === 'string' && p !== '' && !path.isAbsolute(p) && !p.split(/[\\/]/).includes('..');
    const badGen = new Set();
    for (const g of gens) {
      if (!insidePage(g.run) || !/\.c?js$/.test(g.run)) { errors.push(`page.json generators: run ${JSON.stringify(g.run)} must be a .cjs/.js path inside the page directory (relative, no ..)`); badGen.add(g); continue; }
      if (!fs.existsSync(path.join(dir, g.run))) errors.push(`page.json generators: ${g.run} does not exist`);
      for (const w of g.writes || []) {
        if (!insidePage(w) || !/^figures\//.test(w)) { errors.push(`page.json generators: ${g.run} writes ${JSON.stringify(w)}; writes are globs under figures/`); badGen.add(g); continue; }
        if (!figs.some(f => globRe(w).test(f))) errors.push(`page.json generators: ${g.run} writes ${w}, which matches no file`);
      }
    }
    for (const f of figs) {
      const head = (fs.readFileSync(path.join(dir, f), 'utf8').match(GEN_HEADER) || [])[1];
      const g = gens.find(x => (x.writes || []).some(w => globRe(w).test(f)));
      if (g && head !== g.run) errors.push(`${f} is written by ${g.run} (page.json generators) but does not start with <!-- GENERATED by ${g.run} … -->`);
      if (!g && head) errors.push(`${f} says it is generated by ${head}, but page.json generators does not declare it`);
    }
    if (opts.generators && gens.length && !badGen.size) {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'build-pages-gen-'));
      try {
        fs.cpSync(dir, tmp, { recursive: true });
        for (const g of gens) {
          const r = spawnSync(process.execPath, [path.join(tmp, g.run)], { cwd: tmp, encoding: 'utf8' });
          if (r.status !== 0) { errors.push(`generator ${g.run} failed in a scratch copy: ${(r.stderr || '').trim().split('\n').slice(-3).join(' / ')}`); continue; }
        }
        for (const f of new Set([...figs, ...(fs.existsSync(path.join(tmp, 'figures')) ? fs.readdirSync(path.join(tmp, 'figures')).map(x => 'figures/' + x) : [])])) {
          const g = gens.find(x => (x.writes || []).some(w => globRe(w).test(f)));
          if (!g) continue;
          const a = fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : null, b = fs.existsSync(path.join(tmp, f)) ? fs.readFileSync(path.join(tmp, f), 'utf8') : null;
          if (a !== b) errors.push(`DRIFT ${f} differs from what ${g.run} writes; edit the generator, run node ${path.posix.join(path.relative(site.root, dir).split(path.sep).join('/'), g.run)}, then rebuild`);
        }
      } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
    }
  }

  /* partials: figures/<name>.html, language-neutral; every key they name must exist */
  const partials = {};
  const usePartial = name => {
    if (name in partials) return partials[name];
    const f = path.join(dir, 'figures', name + '.html');
    if (!fs.existsSync(f)) { errors.push(`missing partial figures/${name}.html`); return (partials[name] = ''); }
    const s = fs.readFileSync(f, 'utf8').replace(GEN_HEADER, '').replace(/\n$/, '');
    for (const k of i18nKeysIn(s)) if (!(k in C.zh.copy)) errors.push(`figures/${name}.html names key ${k}, which no content block defines`);
    for (const l of LANGS) errors.push(...labelProblems(name, s, C[l].copy, l));
    return (partials[name] = s);
  };

  /* chrome: breadcrumb, backlinks, related; its strings go into the page's own copy tables */
  const BL = CHROME ? scanBacklinks(site, page) : [];
  let related = [];
  if (CHROME) {
    const regFile = path.join(dir, 'REGISTRY.json');
    const reg = fs.existsSync(regFile) ? readJson(regFile) : { concepts: [] };
    related = [...new Set((reg.concepts || []).flatMap(c => c.relatedPages || []))].filter(s => site.bySlug.has(s) && s !== page.slug && !BL.some(r => r.p.slug === s));
  }
  const cat = site.cats.find(c => c.id === page.category);
  const sub = (site.subs[page.category] || []).find(s => s.id === page.subtopic);
  const chapNo = id => C.zh.skel.chapters.findIndex(c => c.id === id) + 1;
  if (CHROME) for (const l of LANGS) {
    const t = CHROME_TEXT[l], cp = C[l].copy, o = C[l].order;
    const add = (k, v) => { if (k in cp) errors.push(`${l}: chrome key ${k} is also defined in content`); cp[k] = v; o.push(k); };
    add('site.crumb.aria', t.aria); add('site.crumb.home', t.home);
    if (cat) add('site.crumb.cat', pick(cat.name, l));
    if (sub) add('site.crumb.sub', pick(sub.name, l));
    if (BL.length) {
      add('site.bl.title', t.bl);
      BL.forEach((r, i) => {
        const href = relHref(page.path, r.p.path), groups = new Map();
        for (const x of r.links) { const g = groups.get(x.from || '') || []; if (x.to && !g.includes(x.to)) g.push(x.to); groups.set(x.from || '', g); }
        const parts = [...groups].map(([from, tos]) => (from ? `<a href="${href}#${from}">${t.src(from.slice(2))}</a>` : '') +
          (tos.length ? (from ? ' → ' : '→ ') + tos.map(to => `<a href="#${to}">${t.here}${l === 'zh' ? '' : ' '}${chapNo(to) ? t.ch(chapNo(to)) : '#' + to}</a>`).join(l === 'zh' ? '、' : ', ') : ''));
        add('site.bl.' + (i + 1), `<a href="${href}">${titleOf(r.p, l)}</a>` + (parts.some(Boolean) ? (l === 'zh' ? '：' : ': ') + parts.filter(Boolean).join(l === 'zh' ? '；' : '; ') : ''));
      });
    }
    if (related.length) { add('site.rel.title', t.rel); related.forEach((s, i) => add('site.rel.' + (i + 1), `<a href="${relHref(page.path, site.bySlug.get(s).path)}">${titleOf(site.bySlug.get(s), l)}</a>`)); }
  }

  /* links written as raw HTML (not [[refs]]): warn when they point at no live page or a missing anchor */
  for (const k of C.zh.order) for (const m of String(C.zh.copy[k]).matchAll(/href=(["'])(\.\.\/[^"']*)\1/g)) {
    const r = resolveHref(site, page.path, m[2]);
    if (!r) warnings.push(`link: ${k} links to ${m[2]}, which is not a live page`);
    else if (r[1] && !site.anchors(r[0]).has(r[1])) warnings.push(`link: ${k} links to ${m[2]}, but that page has no #${r[1]}`);
  }

  /* D10 lint: a mention of another live page's title that is not a link -> suggest [[slug]]. It matches what the
     runtime linker (site-nav.js buildMatcher / citeMatch) linked on hand-written pages: zh 《title》, en “Title” with
     an optional , or . inside the closing quote and ' / ’ interchangeable, and <cite>Title</cite> in either language. */
  const titleRe = s => reEsc(s).replace(/['’]/g, "['’]");
  for (const l of LANGS) for (const k of C[l].order) {
    if (k.startsWith('site.')) continue;
    const text = String(C[l].copy[k]).replace(/<a\b[\s\S]*?<\/a>/g, '');
    for (const p of site.pages) {
      if (p === page) continue;
      const t = titleOf(p, l);
      if (!t) continue;
      const re = l === 'zh' ? new RegExp('《' + reEsc(t) + '》|<cite>\\s*' + reEsc(t) + '\\s*</cite>')
        : new RegExp('“' + titleRe(t) + '[,.]?”|<cite>\\s*' + titleRe(t) + '\\s*</cite>');
      const m = text.match(re);
      if (m) warnings.push(`lint: ${l} ${k} mentions ${m[0]} without a link; consider [[${p.slug}]]`);
    }
  }

  /* render */
  const Z = C.zh.copy;
  // ind === null: a compact section (legacyLayout.compactSections), every block written on one line
  const lead = (id, base, ind) => (ind === null || join.has(id) ? '' : base);
  const T1 = k => `data-i18n="${k}"></`, TH = k => `data-i18n-html="${k}"></`;
  function blockHtml(b, ind) {
    if (b.kind === 'p') return lead(b.key, '\n' + ind, ind) + `<${b.tag}${b.cls ? ` class="${b.cls}"` : ''}${b.style ? ` style="${b.style}"` : ''} ${TH(b.key)}${b.tag}>`;
    if (b.kind === 'h3') return lead(b.key, '\n' + ind, ind) + `<h3${b.cls ? ` class="${b.cls}"` : ''} ${T1(b.key)}h3>`;
    if (b.kind === 'list') {
      const t = b.ordered ? 'ol' : 'ul', c = ind === null || compact.has(b.keys[0]);
      return lead('list:' + b.keys[0], '\n' + ind, ind) + `<${t}${b.cls ? ` class="${b.cls}"` : ''}>` +
        b.keys.map(k => (c ? '' : '\n' + ind + '  ') + `<li ${TH(k)}li>`).join('') + (c ? '' : '\n' + ind) + `</${t}>`;
    }
    if (b.kind === 'part') return lead('fig:' + b.name, '\n' + ind, ind) + usePartial(b.name);
    return '';
  }
  const COMPACT = !!legacy.compactSections;
  function chapter(c, i) {
    const nl = COMPACT ? '' : '\n', i1 = COMPACT ? '' : '  ', i2 = COMPACT ? '' : '\n    ';
    let h = `<section class="ch" id="${c.id}">${nl}`, first = true;
    const head = `${i2}<div class="num">${String(i + 1).padStart(2, '0')}</div>${i2}<h2 ${T1(c.id + '.title')}h2>`;
    const regions = c.regions.length && c.regions[0].kind === 'wrap' ? c.regions : [{ kind: 'wrap', blocks: [] }, ...c.regions];
    for (const r of regions) {
      // a lab, or a diagram with place=wide: its own <div class="wide">
      if (r.kind === 'wrap') { h += `${i1}<div class="wrap">` + (first ? head : '') + r.blocks.map(b => blockHtml(b, COMPACT ? null : '    ')).join('') + `${nl}${i1}</div>${nl}`; first = false; }
      else h += `${i1}<div class="wide">${usePartial(r.name)}</div>${nl}`;
    }
    return h + '</section>\n';
  }
  const crumbs = !CHROME ? '' : `    <nav class="site-nav" data-no-autolink data-i18n-aria="site.crumb.aria"><ol>` +
    `<li><a href="${up}" data-crumb="home" ${T1('site.crumb.home')}a></li>` +
    (cat ? `<li><a href="${up}?category=${page.category}" data-crumb="cat" ${T1('site.crumb.cat')}a></li>` : '') +
    (sub ? `<li><a href="${up}?category=${page.category}&amp;subtopic=${page.subtopic}" data-crumb="sub" ${T1('site.crumb.sub')}a></li>` : '') +
    `</ol></nav>\n`;
  let xrefs = '';
  if (CHROME && (BL.length || related.length)) {
    xrefs = '<section class="site-xref" id="linked-from" data-no-autolink>\n  <div class="wrap">\n';
    if (BL.length) xrefs += `    <h2 ${T1('site.bl.title')}h2>\n    <ul class="xref-list">\n` + BL.map((r, i) => `      <li ${TH('site.bl.' + (i + 1))}li>\n`).join('') + '    </ul>\n';
    if (related.length) xrefs += `    <h2 ${T1('site.rel.title')}h2>\n    <ul class="xref-list">\n` + related.map((r, i) => `      <li ${TH('site.rel.' + (i + 1))}li>\n`).join('') + '    </ul>\n';
    xrefs += '  </div>\n</section>\n';
  }
  const style = fs.existsSync(path.join(dir, 'page.css')) ? fs.readFileSync(path.join(dir, 'page.css'), 'utf8') : '';
  const v = meta.version ? '?v=' + meta.version : '';
  const nav = siteNavIncludes(page.path);
  const hero = C.zh.skel.hero || { blocks: [] };
  let html;
  try {
    html = fillLayout(meta.layout || 'essay', {
      generated: CHROME ? `<!-- GENERATED by scripts/build-pages.cjs from content.zh.md, content.en.md, page.json and figures/. Edit those and rebuild; do not edit this file. -->\n` : '',
      htmlAttrs: (CHROME ? ` data-template="${meta.layout || 'essay'}"` : '') + (enStub ? ' data-lang-en="stub"' : ''),
      category: esc(page.category), stage: esc(page.stage || ''),
      title: esc(Z['doc.title']), desc: esc(Z['doc.desc']),
      style, up,
      'gap.afterStyle': gaps.afterStyle || '',
      'gap.afterProvenanceCss': gaps.afterProvenanceCss || '',
      'gap.afterFooter': gaps.afterFooter != null ? gaps.afterFooter : '\n',
      'gap.afterMain': gaps.afterMain != null ? gaps.afterMain : '\n',
      siteNavCss: nav.link, siteNavJs: nav.script,
      crumbs,
      heroBlocks: hero.blocks.map(b => blockHtml(b, '    ')).join('') + '\n',
      provenance: provenanceLabel(site, page, meta),
      toc: C.zh.skel.chapters.map((c, i) => `${legacy.compactToc ? '' : '\n    '}<li><a href="#${c.id}"><span>${String(i + 1).padStart(2, '0')}</span><b ${T1('toc.' + c.id)}b></a></li>`).join('') + (legacy.compactToc ? '' : '\n  '),
      footerAttr: C.zh.skel.footer ? '' : ' data-i18n-html="footer"',
      footerBody: (C.zh.skel.footer || []).map(k => `<p ${TH(k)}p>`).join(''),
      chapters: C.zh.skel.chapters.map(chapter).join(gaps.betweenSections || '') + (xrefs ? (gaps.betweenSections || '') + xrefs : ''),
      scripts: (meta.scripts || []).map(s => `<script src="${s}${v}"${s === 'copy.en.js' ? ' onerror="void 0"' : ''}></script>\n`).join(''),
    });
  } catch (e) { errors.push(e.message); html = ''; }
  // The layout and chrome name keys too (nav.back, nav.lang, toc.label, toc.title, hero.kicker, footer…): each must be defined.
  for (const k of i18nKeysIn(html)) if (!(k in Z)) errors.push(`the page names key ${k} (layout or chrome), which no content block defines`);
  // zh text inside every empty data-i18n* element and aria-label from data-i18n-aria, for readers without JS.
  // Values with runtime placeholders ({v}) are left for app.js. Page tests undo it with prefill.cjs unprefill().
  if (PREFILL) html = prefill(html, Z);
  const header = l => `/* GENERATED by scripts/build-pages.cjs from content.${l}.md. Edit the Markdown and rebuild; do not edit this file. */\n`;
  const copyJs = l => header(l) + `window.ESSAY_COPY = window.ESSAY_COPY || {};\nwindow.ESSAY_COPY.${l} = {\n` +
    C[l].order.map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(C[l].copy[k])}`).join(',\n') + '\n};\n';
  const refs = C.zh.refs.map(r => ({ from: r.key, to: r.to, anchor: r.anchor }));
  const outputs = { 'index.html': html, 'copy.zh.js': copyJs('zh'), 'copy.en.js': copyJs('en') };
  if (CHROME) outputs['refs.json'] = JSON.stringify({
    _generated: 'by scripts/build-pages.cjs; do not edit',
    page: page.slug, refs,
    backlinks: BL.map(r => ({ from: r.p.slug, links: r.links.map(x => ({ from: x.from, to: x.to })) })),
    related, bindings: bindings ? Object.keys(bindings) : [],
  }, null, 1) + '\n';
  return {
    outputs, errors, warnings, copy: { zh: C.zh.copy, en: C.en.copy }, src: { zh: C.zh.src, en: C.en.src }, bindings: bindings || {},
    stats: { slug: page.slug, keys: C.zh.order.length, chapters: C.zh.skel.chapters.length, refs: refs.length, backlinks: BL.length, related: related.length, bindings: bindings ? Object.keys(bindings).length : 0 },
  };
}

// Migrated pages = live pages in the registry whose directory has a page.json.
function migratedPages(root = REPO_ROOT) {
  const site = createSite(root);
  return site.pages.filter(p => site.isMigrated(p));
}

module.exports = {
  REPO_ROOT, LANGS, loadCopy, loadPagesConfig, createSite, pick, titleOf, resolveHref, relHref, resolveRef,
  renderInline, unrenderInline, escapeInline, parseContent, parseAttrs, needsParaEscape, autoKey, i18nKeysIn,
  fillLayout, buildEssay, migratedPages, TemplateError, esc, prefill, unprefill, scanLinks, scanBacklinks, isTemplateDir,
  compileLang, loadBindings,
  svgLabels, labelRoom, emWidth, plainText,
};
