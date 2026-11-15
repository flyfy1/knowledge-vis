'use strict';
// Shared pieces of the site-template prototype: site registry, inline Markdown <-> HTML, content-file parser.
// Plain node, no dependencies. Read-only against the site tree.
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function loadCopy(file) {
  const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx);
  const E = ctx.window.ESSAY_COPY; return E[Object.keys(E)[0]];
}

/* ───────── the registry: pages (pages.config.js), anchors (scanned), concepts (atlas), links (scanned) ───────── */
let SITE = null;
function site() {
  if (SITE) return SITE;
  const w = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'pages.config.js'), 'utf8'), { window: w });
  const pages = w.KNOWLEDGE_PAGES.filter(p => p.status === 'live' && p.path);
  const bySlug = new Map(), byPath = new Map();
  for (const p of pages) { bySlug.set(p.slug, p); byPath.set(p.path.replace(/\/?$/, '/'), p); }
  const ax = { window: {} };
  try { vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'atlas', 'data.js'), 'utf8'), ax); } catch (e) { /* atlas optional */ }
  const atlas = ax.window.ATLAS_DATA || ax.window.ATLAS || {};
  const nodes = new Map(); for (const n of (atlas.nodes || [])) nodes.set(n.id, n);
  SITE = { pages, bySlug, byPath, cats: w.KNOWLEDGE_CATEGORIES, subs: w.KNOWLEDGE_SUBTOPICS, nodes, anchorCache: new Map() };
  return SITE;
}
const title = (p, lang) => typeof p.title === 'string' ? p.title : (p.title[lang] || p.title.zh);
function anchors(p) {
  const S = site(); if (S.anchorCache.has(p.slug)) return S.anchorCache.get(p.slug);
  let html = ''; try { html = fs.readFileSync(path.join(ROOT, p.path, 'index.html'), 'utf8'); } catch (e) {}
  const set = new Set([...html.matchAll(/\bid="([\w-]+)"/g)].map(m => m[1]));
  S.anchorCache.set(p.slug, set); return set;
}
// page dir relative to the site root, e.g. "computing/systems/x/"; href "../y/#ch1" from it -> [page, anchor]
function resolveHref(fromPath, href) {
  const m = href.match(/^([^#?]*)(?:#([\w-]+))?$/); if (!m || /^[a-z]+:/i.test(href) || !m[1]) return null;
  const abs = path.posix.normalize(path.posix.join(fromPath, m[1])).replace(/\/?$/, '/');
  const p = site().byPath.get(abs); return p ? [p, m[2] || null] : null;
}
const relHref = (fromPath, toPath) => { const r = path.posix.relative(fromPath, toPath); return (r ? r + '/' : './'); };

/* ───────── references: [[slug]], [[slug#ch7]], [[slug#ch7|text]], [[#ch3]], [[concept:id]] ───────── */
class RefError extends Error {}
function resolveRef(target, ctx) {
  const S = site(); let p, anchor;
  if (target.startsWith('concept:')) {
    const q = target.slice(8); let n = S.nodes.get(q);
    if (!n) { // by title or alias, one word one owner: more than one match is an error, not a guess
      const hits = [...S.nodes.values()].filter(x => [x.title && x.title.zh, x.title && x.title.en, ...((x.aliases || {}).zh || []), ...((x.aliases || {}).en || [])].includes(q));
      if (hits.length > 1) throw new RefError(`concept "${q}" is ambiguous: ${hits.map(x => x.id).join(', ')}`);
      n = hits[0];
    }
    if (!n) throw new RefError(`unknown concept "${target}"`);
    const l = (n.lessons || []).find(x => x.primary) || (n.lessons || [])[0];
    if (!l || !S.bySlug.get(l.slug)) throw new RefError(`concept "${target}" has no page`);
    p = S.bySlug.get(l.slug); anchor = l.anchor || (l.step != null ? 'step' + l.step : null);
    return { p, anchor, text: n.title && (n.title[ctx.lang] || n.title.zh) };
  }
  const [slug, a] = target.split('#');
  p = slug ? S.bySlug.get(slug) : ctx.page;
  if (!p) throw new RefError(`unknown page "${slug}"`);
  anchor = a || null;
  if (anchor && !(slug ? anchors(p) : ctx.ownAnchors).has(anchor)) throw new RefError(`page "${p.slug}" has no #${anchor}`);
  return { p, anchor, text: title(p, ctx.lang) };
}

/* ───────── inline Markdown -> HTML (the subset prose needs) ───────── */
function renderInline(md, ctx) {
  let s = md.replace(/\{=([\w.-]+)\}/g, (m, k) => {
    if (!ctx.bindings || !(k in ctx.bindings)) throw new RefError(`unbound number {=${k}}`);
    (ctx.used || (ctx.used = new Set())).add(k); return ctx.bindings[k];
  });
  s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, target, text) => {
    const r = resolveRef(target.trim(), ctx);
    (ctx.refs || (ctx.refs = [])).push({ to: r.p.slug, anchor: r.anchor, key: ctx.key });
    const href = (r.p === ctx.page ? '' : relHref(ctx.page.path, r.p.path)) + (r.anchor ? '#' + r.anchor : '');
    return `<a href="${href}">${text != null ? text : r.text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}
// HTML -> inline Markdown; only used by the converter, always verified by a round trip
function unrenderInline(html, ctx) {
  let s = html;
  if (!/\*|\[\[|\{=/.test(s)) s = s.replace(/<strong>([^<]+)<\/strong>/g, '**$1**').replace(/<em>([^<]+)<\/em>/g, '*$1*');
  s = s.replace(/<a href="([^"]+)">([^<]*)<\/a>/g, (m, href, text) => {
    const r = resolveHref(ctx.page.path, href); if (!r) return m;
    const [p, a] = r, t = p.slug + (a ? '#' + a : '');
    return text === title(p, ctx.lang) ? `[[${t}]]` : `[[${t}|${text}]]`;
  });
  try { if (renderInline(s, { ...ctx, refs: [] }) === html) return s; } catch (e) {}
  return html;
}

/* ───────── content file parser ───────── */
// Returns { front, blocks } ; block = { type, ... , line }
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
const cjk = c => /[　-鿿＀-￯]/.test(c || '');
function joinLines(ls) { return ls.reduce((acc, l) => !acc ? l : acc + (cjk(acc.slice(-1)) && cjk(l[0]) ? '' : ' ') + l, ''); }
function parseValue(v) { return /^"/.test(v) ? JSON.parse(v) : v; }

function parseContent(text, file) {
  const lines = text.split('\n'); let i = 0; const front = {}, blocks = [];
  const err = msg => { throw new Error(`${file}:${i + 1}: ${msg}`); };
  if (lines[0] === '---') { for (i = 1; lines[i] !== '---'; i++) { if (i >= lines.length) err('unclosed front matter'); const m = lines[i].match(/^([\w.-]+):\s?(.*)$/); if (m) front[m[1]] = parseValue(m[2]); } i++; }
  let pending = null;
  while (i < lines.length) {
    const L = lines[i];
    if (!L.trim() || /^<!--.*-->$/.test(L.trim())) { i++; continue; }
    const start = i;
    let m;
    if ((m = L.match(/^:::\s*(\w+)\s*([\w.-]*)\s*$/))) {
      const b = { type: m[1], name: m[2] || null, entries: [], body: [], line: start + 1 };
      for (i++; i < lines.length && lines[i].trim() !== ':::'; i++) {
        if (b.type === 'footer') { b.body.push(lines[i]); continue; }
        if (!lines[i].trim()) continue;
        const e = lines[i].match(/^([\w.-]+):\s(.*)$/) || lines[i].match(/^([\w.-]+):()$/); if (!e) err(`expected "key: value" in ::: ${b.type}`);
        b.entries.push([e[1], parseValue(e[2])]);
      }
      if (i >= lines.length) err('unclosed :::'); i++;
      blocks.push(b); continue;
    }
    if ((m = L.match(/^\{([#.][^{}]*)\}$/))) { pending = parseAttrs(m[1]); i++; continue; }
    if ((m = L.match(/^(#{1,3})\s+(.*)$/))) {
      const [t, a] = splitTrail(m[2]); blocks.push({ type: 'heading', level: m[1].length, text: t, attrs: a, line: start + 1 }); i++; continue;
    }
    if (/^(- |\d+\. )/.test(L)) {
      const items = [];
      for (; i < lines.length && /^(- |\d+\. )/.test(lines[i]); i++) { const [t, a] = splitTrail(lines[i].replace(/^(- |\d+\. )/, '')); items.push({ text: t, attrs: a }); }
      blocks.push({ type: 'list', ordered: /^\d/.test(L), items, attrs: pending || { classes: [] }, line: start + 1 }); pending = null; continue;
    }
    const para = []; for (; i < lines.length && lines[i].trim() && !/^(:::|#{1,3}\s|- |\d+\. |\{[#.])/.test(lines[i]); i++) para.push(lines[i]);
    const [t, a] = splitTrail(joinLines(para));
    if (pending) { Object.assign(a, pending, { classes: [...pending.classes, ...a.classes] }); pending = null; }
    blocks.push({ type: 'para', text: t, attrs: a, line: start + 1 });
  }
  return { front, blocks };
}

module.exports = { ROOT, loadCopy, site, title, anchors, resolveHref, relHref, resolveRef, renderInline, unrenderInline, parseContent, parseAttrs, RefError };
