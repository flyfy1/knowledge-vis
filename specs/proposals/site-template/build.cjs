'use strict';
// Build one page from content.<lang>.md + figures/*.html + page.css + page.json (+ bindings.cjs) into
// index.html, copy.zh.js, copy.en.js. Usage:
//   node template/build.cjs <page-dir> [--check] [--no-prefill] [--no-chrome] [--out <dir>]
// --check: build in memory, compare with the files on disk, exit 1 on any drift (like build-atlas-data --check).
const fs = require('fs'), path = require('path');
const L = require('./lib.cjs');
const args = process.argv.slice(2), flag = f => args.includes(f);
const dir = path.resolve(args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--out'));
const outDir = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : dir;
const PREFILL = !flag('--no-prefill'), CHROME = !flag('--no-chrome');
const sitePath = path.relative(L.ROOT, dir).split(path.sep).join('/') + '/';
const S = L.site(), page = S.bySlug.get(JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8')).slug) || S.byPath.get(sitePath);
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8'));
const LANGS = ['zh', 'en'], errors = [];
const up = '../'.repeat(sitePath.split('/').filter(Boolean).length);

/* ── numbers bound at build time: bindings.cjs maps names to strings computed from models.js ── */
let bindings = null;
if (fs.existsSync(path.join(dir, 'bindings.cjs'))) bindings = require(path.join(dir, 'bindings.cjs'))(require(path.join(dir, 'models.js')));

/* ── parse both languages into ordered key tables + a language-neutral layout skeleton ── */
function compile(lang) {
  const { front, blocks } = L.parseContent(fs.readFileSync(path.join(dir, `content.${lang}.md`), 'utf8'), `content.${lang}.md`);
  const copy = {}, order = [], ctx = { page, lang, bindings, refs: [], used: new Set(), ownAnchors: new Set() };
  for (const b of blocks) if (b.type === 'heading') ctx.ownAnchors.add(b.attrs.key);
  const sectionIds = new Set([...ctx.ownAnchors]);
  const put = (k, v, inline = true) => { if (k in copy) errors.push(`${lang}: duplicate key ${k}`); ctx.key = k; try { copy[k] = inline ? L.renderInline(v, ctx) : v; } catch (e) { errors.push(`${lang}: ${k}: ${e.message}`); copy[k] = v; } order.push(k); };
  const abs = (sec, k) => (sec && !sectionIds.has(k.split('.')[0])) ? sec + '.' + k : k;
  put('doc.title', front.title, false); put('doc.desc', front.desc, false);
  const skel = { hero: null, chapters: [] }; let sec = null, chap = null, n = 0;
  for (const b of blocks) {
    if (b.type === 'heading') {
      sec = b.attrs.key; n = 0; put(sec + '.title', b.text, false);
      if (b.level === 1) { skel.hero = chap = { id: sec, blocks: [] }; } else { chap = { id: sec, blocks: [] }; skel.chapters.push(chap); }
      continue;
    }
    if (b.type === 'strings') { for (const [k, v] of b.entries) put(sec ? (k === 'toc' ? 'toc.' + sec : k === 'kicker' && sec === 'hero' ? 'hero.kicker' : abs(sec, k)) : k, v); continue; }
    if (b.type === 'lab') { for (const [k, v] of b.entries) put(abs(sec, k), v); chap.blocks.push({ kind: 'fig', name: b.name }); continue; }
    if (b.type === 'footer') {
      const ps = []; let cur = []; for (const l of b.body.concat([''])) { if (l.trim()) cur.push(l); else if (cur.length) { ps.push(cur.join(' ')); cur = []; } }
      ctx.key = 'footer'; try { copy.footer = ps.map(p => '<p>' + L.renderInline(p, ctx) + '</p>').join(''); } catch (e) { errors.push(`${lang}: footer: ${e.message}`); } order.push('footer'); continue;
    }
    if (b.type === 'para') {
      const c = b.attrs.classes, auto = sec === 'hero' ? 'hero.' + c[0] : c.includes('law') ? sec + '.law' : c.includes('take') ? sec + '.limit' : !c.length ? sec + '.p' + (++n) : null;
      const key = b.attrs.key ? abs(sec, b.attrs.key) : auto; if (!key) errors.push(`${lang}:${b.line}: paragraph needs {#key}`);
      put(key, b.text); chap.blocks.push({ kind: 'p', key, tag: b.attrs.tag || 'p', cls: c.join(' '), style: b.attrs.style }); continue;
    }
    if (b.type === 'list') {
      const keys = b.items.map(it => abs(sec, it.attrs.key)); b.items.forEach((it, j) => put(keys[j], it.text));
      chap.blocks.push({ kind: 'list', ordered: b.ordered, cls: b.attrs.classes.join(' '), keys }); continue;
    }
    errors.push(`${lang}:${b.line}: unknown block ::: ${b.type}`);
  }
  return { copy, order, skel, refs: ctx.refs, used: ctx.used };
}
const C = Object.fromEntries(LANGS.map(l => [l, compile(l)]));

/* ── parity: the translation may change words only ── */
{
  const z = C.zh, e = C.en, tok = (s, re) => (s.match(re) || []).sort().join(' ');
  if (JSON.stringify(z.skel) !== JSON.stringify(e.skel)) errors.push('parity: zh and en differ in structure (blocks, keys, figures)');
  for (const k of z.order) {
    if (!(k in e.copy)) { errors.push('parity: en lacks ' + k); continue; }
    if (tok(z.copy[k], /\{\w+\}/g) !== tok(e.copy[k], /\{\w+\}/g)) errors.push('parity: runtime placeholders differ in ' + k);
    if (tok(z.copy[k], /href="[^"]*"/g) !== tok(e.copy[k], /href="[^"]*"/g)) errors.push('parity: link targets differ in ' + k);
  }
  for (const k of e.order) if (!(k in z.copy)) errors.push('parity: zh lacks ' + k);
  if (bindings) for (const b of Object.keys(bindings)) if (!z.used.has(b)) errors.push(`binding ${b} is never used`);
}

/* ── registry views for this page: backlinks (scanned links + Markdown refs), related (REGISTRY / atlas) ── */
function backlinks() {
  const out = new Map();
  for (const p of S.pages) {
    if (p === page) continue;
    const d = path.join(L.ROOT, p.path), files = [];
    for (const f of ['copy.zh.js', 'i18n.js', 'index.html']) if (fs.existsSync(path.join(d, f))) files.push(f);
    for (const f of files) {
      let entries;
      if (f === 'copy.zh.js') { try { entries = Object.entries(L.loadCopy(path.join(d, f))); } catch (e) { continue; } }
      else entries = [[null, fs.readFileSync(path.join(d, f), 'utf8')]];
      for (const [k, v] of entries) for (const m of String(v).matchAll(/href=\\?["']([^"'\\]+)\\?["']/g)) {
        const r = L.resolveHref(p.path, m[1]); if (!r || r[0] !== page) continue;
        const from = k && /^ch\d+\./.test(k) ? k.split('.')[0] : null;
        const row = out.get(p.slug) || { p, links: [] }; out.set(p.slug, row);
        const sig = (from || '') + '>' + (r[1] || ''); if (!row.links.some(x => x.sig === sig)) row.links.push({ sig, from, to: r[1] });
      }
    }
  }
  return [...out.values()].sort((a, b) => a.p.path.localeCompare(b.p.path));
}
const BL = CHROME ? backlinks() : [];
const reg = fs.existsSync(path.join(dir, 'REGISTRY.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'REGISTRY.json'), 'utf8')) : { concepts: [] };
const related = CHROME ? [...new Set(reg.concepts.flatMap(c => c.relatedPages || []))].filter(s => S.bySlug.has(s) && !BL.some(r => r.p.slug === s)) : [];

/* ── chrome strings (breadcrumb, backlinks) go into the same copy tables so the page's own i18n swaps them ── */
const T = {
  zh: { home: '知识索引', aria: '所在位置', bl: '被这些页面引用', rel: '相关页面', ch: n => `第 ${n} 章`, here: '本页' },
  en: { home: 'Index', aria: 'You are here', bl: 'Linked from', rel: 'Related pages', ch: n => `chapter ${n}`, here: 'this page' }
};
const cat = S.cats.find(c => c.id === page.category), sub = (S.subs[page.category] || []).find(s => s.id === page.subtopic);
const chapNo = id => (C.zh.skel.chapters.findIndex(c => c.id === id) + 1);
if (CHROME) for (const l of LANGS) {
  const t = T[l], cp = C[l].copy, o = C[l].order, add = (k, v) => { cp[k] = v; o.push(k); };
  add('site.crumb.aria', t.aria); add('site.crumb.home', t.home); add('site.crumb.cat', cat.name[l]); if (sub) add('site.crumb.sub', sub.name[l]);
  add('site.crumb.page', L.title(page, l));
  if (BL.length) {
    add('site.bl.title', t.bl);
    BL.forEach((r, i) => {
      const href = L.relHref(page.path, r.p.path);
      const groups = new Map(); for (const x of r.links) { const g = groups.get(x.from || '') || []; if (x.to && !g.includes(x.to)) g.push(x.to); groups.set(x.from || '', g); }
      const parts = [...groups].map(([from, tos]) => (from ? `<a href="${href}#${from}">${t.ch(from.slice(2))}</a>` : '') + (tos.length ? (from ? ' → ' : '→ ') + tos.map(to => `<a href="#${to}">${t.here}${l === 'zh' ? '' : ' '}${t.ch(chapNo(to))}</a>`).join(l === 'zh' ? '、' : ', ') : ''));
      add('site.bl.' + (i + 1), `<a href="${href}">${L.title(r.p, l)}</a>` + (parts.some(Boolean) ? (l === 'zh' ? '：' : ': ') + parts.filter(Boolean).join(l === 'zh' ? '；' : '; ') : ''));
    });
  }
  if (related.length) { add('site.rel.title', t.rel); related.forEach((s, i) => add('site.rel.' + (i + 1), `<a href="${L.relHref(page.path, S.bySlug.get(s).path)}">${L.title(S.bySlug.get(s), l)}</a>`)); }
}

/* ── render index.html (the shared essay layout) ── */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const Z = C.zh.copy;
const fill = (k, html) => PREFILL ? (html ? Z[k] : esc(Z[k])) : '';
const T1 = k => `data-i18n="${k}">${fill(k, false)}`, TH = k => `data-i18n-html="${k}">${fill(k, true)}`;
function provenance() {
  const all = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'page-provenance.json'), 'utf8')), p = (all.pages || all)[page.slug];
  if (!p) return '';
  const span = (zh, en) => `<span class="provenance-zh" lang="zh-CN">${zh}</span><span class="provenance-en" lang="en">${en}</span>`;
  const kind = p.kind === 'original' ? ['原创版本', 'Original edition'] : ['改进版本', 'Revised edition'];
  const note = meta.provenanceNote ? `<p>${span(meta.provenanceNote.zh, meta.provenanceNote.en)}</p>` : '';
  return `    <details class="page-provenance" data-developer="${p.developer}" data-edition="${p.edition}" data-source-revision="${p.sourceRevision}"><summary>${span(p.developer + ' 开发 · ' + kind[0], 'Developed with ' + p.developer + ' · ' + kind[1])}</summary>${note}<p>${span('范围：' + p.scope.zh + '。', 'Scope: ' + p.scope.en + '.')}</p><p>${p.edition} · <a href="https://github.com/flyfy1/knowledge-vis/commit/${p.sourceRevision}">${span('源码修订', 'Source revision')} · ${p.sourceRevision.slice(0, 8)}</a></p></details>\n`;
}
function block(b) {
  if (b.kind === 'p') return `    <${b.tag}${b.cls ? ` class="${b.cls}"` : ''}${b.style ? ` style="${b.style}"` : ''} ${TH(b.key)}</${b.tag}>\n`;
  if (b.kind === 'list') { const t = b.ordered ? 'ol' : 'ul'; return `    <${t}${b.cls ? ` class="${b.cls}"` : ''}>\n` + b.keys.map(k => `      <li ${TH(k)}</li>\n`).join('') + `    </${t}>\n`; }
  return '';
}
function chapter(c, i) {
  let h = `<section class="ch" id="${c.id}">\n`, open = false;
  const wrap = () => { if (!open) { h += '  <div class="wrap">\n'; open = true; } }, close = () => { if (open) { h += '  </div>\n'; open = false; } };
  wrap(); h += `    <div class="num">${String(i + 1).padStart(2, '0')}</div>\n    <h2 ${T1(c.id + '.title')}</h2>\n`;
  for (const b of c.blocks) {
    if (b.kind === 'fig') {
      close(); let f = fs.readFileSync(path.join(dir, 'figures', b.name + '.html'), 'utf8').replace(/\n$/, '');
      if (PREFILL) f = f.replace(/(data-i18n(-html)?="([^"]+)"([^>]*)>)(<\/)/g, (m, open_, html, k, rest, end) => open_ + (Z[k] != null ? (html ? Z[k] : esc(Z[k])) : '') + end);
      f = f.replace(/data-i18n-aria="([^"]+)"/g, (m, k) => PREFILL && Z[k] ? `${m} aria-label="${esc(Z[k])}"` : m);
      h += `  <div class="wide">${f}</div>\n`;
    } else { wrap(); h += block(b); }
  }
  close(); return h + '</section>\n';
}
const hero = C.zh.skel.hero, v = meta.version ? '?v=' + meta.version : '';
const chrome = CHROME ? { css: `<link rel="stylesheet" href="${up}template/site-chrome.css">\n`,
  crumbs: `    <nav class="crumbs" ${'data-i18n-aria="site.crumb.aria"'}><a href="${up}" ${T1('site.crumb.home')}</a><span class="sep" aria-hidden="true">›</span><a href="${up}?category=${page.category}" ${T1('site.crumb.cat')}</a>` + (sub ? `<span class="sep" aria-hidden="true">›</span><a href="${up}?category=${page.category}&amp;subtopic=${page.subtopic}" ${T1('site.crumb.sub')}</a>` : '') + `<span class="sep" aria-hidden="true">›</span><span aria-current="page" ${T1('site.crumb.page')}</span></nav>\n` } : { css: '', crumbs: '' };
function xrefs() {
  if (!CHROME || (!BL.length && !related.length)) return '';
  let h = '<section class="ch xref" id="linked-from">\n  <div class="wrap">\n';
  if (BL.length) h += `    <h2 ${T1('site.bl.title')}</h2>\n    <ul class="xref-list">\n` + BL.map((r, i) => `      <li ${TH('site.bl.' + (i + 1))}</li>\n`).join('') + '    </ul>\n';
  if (related.length) h += `    <h2 ${T1('site.rel.title')}</h2>\n    <ul class="xref-list">\n` + related.map((r, i) => `      <li ${TH('site.rel.' + (i + 1))}</li>\n`).join('') + '    </ul>\n';
  return h + '  </div>\n</section>\n';
}
const style = fs.readFileSync(path.join(dir, 'page.css'), 'utf8');
const indexHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="category" content="${page.category}"><meta name="stage" content="${page.stage}">
<title>${esc(Z['doc.title'])}</title>
<meta name="description" content="${esc(Z['doc.desc'])}">
<link rel="icon" href="data:,">
<style>
${style}</style>

<link rel="stylesheet" href="${up}page-provenance.css">
${chrome.css}</head>
<body>
<div class="topbar">
  <a class="back" href="${up}" ${T1('nav.back')}</a>
  <div id="langToggle" role="group" data-i18n-aria="nav.lang"><button type="button" data-lang="zh" aria-pressed="false">中</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>
</div>

<header class="hero">
  <div class="wrap">
${chrome.crumbs}    <div class="kicker" ${T1('hero.kicker')}</div>
    <h1 ${T1('hero.title')}</h1>
${hero.blocks.map(block).join('')}${provenance()}  </div>
</header>

<nav class="wrap toc" data-i18n-aria="toc.label">
  <h2 ${T1('toc.title')}</h2>
  <ol>
${C.zh.skel.chapters.map((c, i) => `    <li><a href="#${c.id}"><span>${String(i + 1).padStart(2, '0')}</span><b ${T1('toc.' + c.id)}</b></a></li>\n`).join('')}  </ol>
</nav>

<main>
${C.zh.skel.chapters.map(chapter).join('\n')}${xrefs() ? '\n' + xrefs() : ''}</main>

<footer><div class="wrap" ${TH('footer')}</div></footer>

${meta.scripts.map(s => `<script src="${s}${v}"${s === 'copy.en.js' ? ' onerror="void 0"' : ''}></script>`).join('\n')}
</body>
</html>
`;
const copyJs = l => `/* GENERATED by template/build.cjs from content.${l}.md — edit the Markdown, not this file. */\nwindow.ESSAY_COPY = window.ESSAY_COPY || {};\nwindow.ESSAY_COPY.${l} = {\n` + C[l].order.map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(C[l].copy[k])}`).join(',\n') + '\n};\n';

if (errors.length) { console.error(errors.map(e => 'ERROR ' + e).join('\n')); process.exit(1); }
const outputs = { 'index.html': indexHtml, 'copy.zh.js': copyJs('zh'), 'copy.en.js': copyJs('en') };
const refs = C.zh.refs.map(r => ({ from: r.key, to: r.to, anchor: r.anchor }));
outputs['refs.json'] = JSON.stringify({ page: page.slug, refs, backlinks: BL.map(r => ({ from: r.p.slug, links: r.links.map(x => ({ from: x.from, to: x.to })) })), related, bindings: bindings ? Object.keys(bindings) : [] }, null, 1) + '\n';
if (flag('--check')) {
  const drift = Object.keys(outputs).filter(f => !fs.existsSync(path.join(outDir, f)) || fs.readFileSync(path.join(outDir, f), 'utf8') !== outputs[f]);
  if (drift.length) { console.error('DRIFT: ' + drift.join(', ') + ' differ from a fresh build; run without --check'); process.exit(1); }
  console.log(`OK ${page.slug}: outputs match the sources`); process.exit(0);
}
fs.mkdirSync(outDir, { recursive: true });
for (const [f, s] of Object.entries(outputs)) fs.writeFileSync(path.join(outDir, f), s);
console.log(`built ${page.slug}: ${C.zh.order.length} keys/lang, ${C.zh.skel.chapters.length} chapters, ${refs.length} refs, ${BL.length} backlinking pages, ${related.length} related${bindings ? ', ' + Object.keys(bindings).length + ' bound numbers' : ''}`);
