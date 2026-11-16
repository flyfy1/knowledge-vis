#!/usr/bin/env node
'use strict';
/* Migration tool (specs/site-template.md): a live essay (index.html + copy.zh.js + copy.en.js) becomes
 * template sources next to it: content.zh.md, content.en.md, page.json, page.css and figures/*.html.
 *
 *   node scripts/convert-essay.cjs <page-dir> [--root <site-root>]
 *
 * index.html and copy.*.js are not touched. After writing the sources the converter rebuilds the page in
 * memory with chrome and pre-fill off and compares: index.html must be byte-identical and both copy tables
 * key-for-key equal. It exits 1 (and says where) when they are not; the sources stay for inspection.
 * Run it on a page only when no one else is editing it, and commit the result with Derived-From trailers
 * (printed at the end; AUTHORSHIP.md §4).
 */
const fs = require('fs');
const path = require('path');
const T = require('./lib/template.cjs');

const args = process.argv.slice(2);
const opt = n => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const root = path.resolve(opt('--root') || T.REPO_ROOT);
const dirArg = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--root');
if (!dirArg) { console.error('usage: node scripts/convert-essay.cjs <page-dir> [--root <site-root>]'); process.exit(2); }
const dir = path.resolve(dirArg);
const sitePath = path.relative(root, dir).split(path.sep).join('/') + '/';
const site = T.createSite(root);
const page = site.byPath.get(sitePath);
if (!page) { console.error('not a live page in pages.config.js: ' + sitePath); process.exit(1); }
if (fs.existsSync(path.join(dir, 'page.json'))) { console.error(sitePath + ' already has page.json (already migrated)'); process.exit(1); }

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const COPY = { zh: T.loadCopy(path.join(dir, 'copy.zh.js')), en: T.loadCopy(path.join(dir, 'copy.en.js')) };
const fail = msg => { console.error(`convert ${page.slug}: ${msg}`); process.exit(1); };
{
  const a = Object.keys(COPY.zh).sort().join('\n'), b = Object.keys(COPY.en).sort().join('\n');
  if (a !== b) fail('copy.zh.js and copy.en.js have different key sets');
}
const up = '../'.repeat(sitePath.split('/').filter(Boolean).length);

/* ── 1. structure from index.html ── */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
// s[pos] is '<' of an opening tag; returns the index just past its matching close tag.
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

if ((html.match(/<style\b/g) || []).length > 1) fail('more than one <style> block (page.css holds one); merge them in index.html in a commit of their own, then convert');
const style = (html.match(/<style>\n([\s\S]*?)<\/style>/) || fail('no <style> block'))[1];
const scripts = [...html.matchAll(/<script src="([\w.-]+)(?:\?v=([\w-]+))?"/g)].map(m => m[1]);
const version = (html.match(/<script src="[\w.-]+\?v=([\w-]+)"/) || [])[1] || null;
const legacy = { join: [], compactLists: [], gaps: {} };
if (html.includes(`</style>\n\n<link rel="stylesheet" href="${up}page-provenance.css">`)) legacy.gaps.afterStyle = '\n';
if (/<\/footer>\n<script/.test(html)) legacy.gaps.afterFooter = '';
if (/<\/section>\n\n<section/.test(html)) legacy.gaps.betweenSections = '\n';
if (/<\/main>\n<footer>/.test(html)) legacy.gaps.afterMain = '';

const parts = new Map(); // name -> { type, html, sec, keys }
const uniq = base => { let n = base, i = 2; while (parts.has(n)) n = base + '-' + i++; return n; };
const PROSE = /^<(p|div)((?: class="[^"]*")?)((?: style="[^"]*")?) data-i18n-html="([^"]+)"><\/\1>$/;
const H3 = /^<h3((?: class="[^"]*")?) data-i18n="([^"]+)"><\/h3>$/;
const LIST = /^<(ul|ol)((?: class="[^"]*")?)>([\s\S]*)<\/\1>$/;
const cls = a => (a.match(/class="([^"]*)"/) || [])[1] || '';

function classify(el, sec, ind) {
  let m;
  if ((m = el.match(PROSE))) return { kind: 'p', tag: m[1], cls: cls(m[2]), style: (m[3].match(/style="([^"]*)"/) || [])[1] || null, key: m[4] };
  if ((m = el.match(H3))) return { kind: 'h3', cls: cls(m[1]), key: m[2] };
  if ((m = el.match(LIST))) {
    const items = [...m[3].matchAll(/(\s*)<li data-i18n-html="([^"]+)"><\/li>/g)];
    const rest = m[3].replace(/(\s*)<li data-i18n-html="([^"]+)"><\/li>/g, '');
    const leads = new Set(items.map(x => x[1]));
    const compact = leads.size === 1 && leads.has('') && rest === '';
    const normal = leads.size === 1 && leads.has('\n' + ind + '  ') && rest === '\n' + ind;
    if (items.length && (compact || normal)) return { kind: 'list', ordered: m[1] === 'ol', cls: cls(m[2]), keys: items.map(x => x[2]), compact };
  }
  const isDia = /^<figure class="dia"/.test(el);
  const id = isDia ? ((el.match(/^<figure[^>]*\bdata-dg="([\w-]+)"/) || el.match(/^<figure[^>]*\bid="([\w-]+)"/) || [])[1]) : null;
  const name = uniq(isDia ? (id && /^dg/.test(id) ? id : 'dg-' + (id || sec + '-' + (parts.size + 1))) : sec + '-html');
  parts.set(name, { type: isDia ? 'diagram' : 'html', html: el, sec });
  return { kind: 'part', type: isDia ? 'diagram' : 'html', name };
}
// Blocks from pos until one of the stop strings; each block is preceded by "" (joined) or "\n"+ind.
function parseBlocks(s, pos, ind, stops, sec) {
  const blocks = [];
  for (;;) {
    if (stops.some(t => s.startsWith(t, pos))) return { blocks, pos };
    const lead = /^\s*/.exec(s.slice(pos))[0];
    if (lead !== '' && lead !== '\n' + ind) throw new Error(`${sec}: unexpected whitespace ${JSON.stringify(lead)} before ${JSON.stringify(s.slice(pos + lead.length, pos + lead.length + 50))}`);
    const at = pos + lead.length, end = elementEnd(s, at);
    const b = classify(s.slice(at, end), sec, ind);
    b.joined = lead === '';
    blocks.push(b);
    pos = end;
  }
}
const expect = (s, pos, lit, what) => { if (!s.startsWith(lit, pos)) throw new Error(`${what}: expected ${JSON.stringify(lit)} at ${JSON.stringify(s.slice(pos, pos + 60))}`); return pos + lit.length; };

let hero, sections = [], provenanceNote = null;
try {
  // hero
  let p = html.indexOf('<header class="hero">');
  if (p < 0) throw new Error('no <header class="hero">');
  p = expect(html, p, '<header class="hero">\n  <div class="wrap">\n    <div class="kicker" data-i18n="hero.kicker"></div>\n    <h1 data-i18n="hero.title"></h1>', 'hero');
  const hb = parseBlocks(html, p, '    ', ['\n    <details class="page-provenance"', '\n  </div>\n</header>'], 'hero');
  hero = { blocks: hb.blocks };
  p = hb.pos;
  if (html.startsWith('\n    <details class="page-provenance"', p)) {
    const end = html.indexOf('</details>\n', p);
    const label = html.slice(p, end);
    const m = label.match(/<\/summary><p><span class="provenance-zh" lang="zh-CN">([\s\S]*?)<\/span><span class="provenance-en" lang="en">([\s\S]*?)<\/span><\/p><p><span class="provenance-zh" lang="zh-CN">范围：/);
    if (m) provenanceNote = { zh: m[1], en: m[2] };
  }
  // chapters
  const mainStart = expect(html, html.indexOf('<main>\n'), '<main>\n', 'main');
  const mainEnd = html.indexOf('</main>', mainStart);
  const main = html.slice(0, mainEnd);
  let q = mainStart;
  while (q < mainEnd) {
    if (html.startsWith('\n', q) && legacy.gaps.betweenSections) q++;
    const m = /^<section class="ch" id="([\w-]+)">\n/.exec(main.slice(q));
    if (!m) throw new Error('expected <section class="ch"> at ' + JSON.stringify(main.slice(q, q + 60)));
    const sec = m[1], secEnd = elementEnd(main, q);
    const S = main.slice(0, secEnd - '</section>'.length);
    let r = q + m[0].length, first = true;
    const regions = [];
    while (r < S.length) {
      if (S.startsWith('  <div class="wrap">', r)) {
        r += '  <div class="wrap">'.length;
        if (first) r = expect(S, r, `\n    <div class="num">${String(sections.length + 1).padStart(2, '0')}</div>\n    <h2 data-i18n="${sec}.title"></h2>`, sec);
        const res = parseBlocks(S, r, '    ', ['\n  </div>\n'], sec);
        regions.push({ kind: 'wrap', blocks: res.blocks });
        r = res.pos + '\n  </div>\n'.length;
      } else if (S.startsWith('  <div class="wide">', r)) {
        if (first) throw new Error(sec + ': chapter starts with a lab before its heading');
        const at = r + 2, end = elementEnd(S, at);
        const inner = S.slice(at + '<div class="wide">'.length, end - '</div>'.length);
        const h3 = (inner.match(/<h3 data-i18n="([\w-]+)\.model\.title"/) || [])[1];
        const name = uniq(h3 ? h3 + '-model' : sec + '-lab');
        parts.set(name, { type: 'lab', html: inner, sec });
        regions.push({ kind: 'lab', name });
        r = expect(S, end, '\n', sec);
      } else throw new Error(`${sec}: unexpected content ${JSON.stringify(S.slice(r, r + 60))}`);
      first = false;
    }
    sections.push({ id: sec, regions });
    q = secEnd + 1;
  }
} catch (e) { fail(e.message); }

/* ── 2. key ownership (language-neutral) ── */
const ALL = Object.keys(COPY.zh), owner = new Map(); // key -> owner tag
const secIds = new Set(sections.map(s => s.id).concat(['hero']));
const claim = (k, who) => { if (k in COPY.zh && !owner.has(k)) { owner.set(k, who); return true; } return false; };
['doc.title', 'doc.desc', 'hero.title', 'hero.kicker', 'footer'].forEach(k => claim(k, 'fixed'));
const commonPrefix = keys => {
  const segs = keys.map(k => k.split('.').slice(0, -1));
  let n = 0;
  while (segs.every(s => s.length > n && s[n] === segs[0][n])) n++;
  return segs.length ? segs[0].slice(0, n).join('.') : '';
};
function claimBlock(b, sec) {
  if (b.kind === 'p' || b.kind === 'h3') claim(b.key, sec);
  if (b.kind === 'list') b.keys.forEach(k => claim(k, sec));
  if (b.kind === 'part') claimPart(b.name, sec);
}
function claimPart(name, sec) {
  const P = parts.get(name), refd = T.i18nKeysIn(P.html).filter(k => k in COPY.zh);
  P.keys = [];
  if (P.type === 'diagram') {
    const pre = commonPrefix(refd);
    P.prefix = pre && !secIds.has(pre.split('.')[0]) ? pre : null;
    const mine = P.prefix ? refd.concat(ALL.filter(k => k.startsWith(P.prefix + '.'))) : refd.filter(k => k.startsWith(sec + '.'));
    for (const k of mine) if (claim(k, 'part:' + name)) P.keys.push(k);
  } else {
    for (const k of refd) if (k.startsWith(sec + '.') && claim(k, 'part:' + name)) P.keys.push(k);
  }
}
hero.blocks.forEach(b => claimBlock(b, 'hero'));
for (const s of sections) {
  claim(s.id + '.title', s.id); claim('toc.' + s.id, s.id);
  for (const r of s.regions) { if (r.kind === 'wrap') r.blocks.forEach(b => claimBlock(b, s.id)); else claimPart(r.name, s.id); }
}
// What is left in a chapter's namespace (keys only app.js uses: say.*, units…) goes with its last lab,
// or into a trailing ::: strings block.
const heroSec = { id: 'hero', regions: [] };
for (const s of [heroSec, ...sections]) {
  const left = ALL.filter(k => k.startsWith(s.id + '.') && !owner.has(k));
  const labs = s.regions.filter(r => r.kind === 'lab');
  s.leftover = [];
  for (const k of left) {
    if (labs.length) { const P = parts.get(labs[labs.length - 1].name); claim(k, 'part:' + labs[labs.length - 1].name); P.keys.push(k); }
    else { claim(k, s.id); s.leftover.push(k); }
  }
}
const globalKeys = ALL.filter(k => !owner.has(k));

/* ── 3. emit both languages with one code path ── */
const val = v => (v === '' || /^\s|\s$|^"|\n/.test(v) ? JSON.stringify(v) : v);
function emit(lang) {
  const Z = COPY[lang], out = [];
  const ctx = { site, page, lang, ownAnchors: new Set(sections.map(s => s.id)) };
  const V = k => { ctx.key = k; return T.unrenderInline(Z[k], ctx); };
  const rel = (k, sec) => (sec && k.startsWith(sec + '.') && !secIds.has(k.slice(sec.length + 1).split('.')[0]) ? k.slice(sec.length + 1) : k);
  const relOk = (k, sec) => rel(k, sec) !== k || !sec || secIds.has(k.split('.')[0]);
  const entry = (k, sec, prefix) => {
    const name = prefix ? k.slice(prefix.length + 1) : rel(k, sec);
    if (!prefix && !relOk(k, sec)) throw new Error(`key ${k} cannot be written inside ${sec}`);
    return `${name}: ${val(V(k))}`;
  };
  out.push('---', `lang: ${lang}`, `title: ${val(Z['doc.title'])}`, `desc: ${val(Z['doc.desc'])}`, '---', '');
  if (globalKeys.length) { out.push('::: strings'); for (const k of globalKeys) out.push(entry(k, null)); out.push(':::', ''); }
  function blockMd(b, sec, counter) {
    if (b.kind === 'p') {
      const classes = b.cls.split(/\s+/).filter(Boolean), auto = T.autoKey(sec, classes, counter);
      let text = V(b.key);
      if (/\n/.test(text)) throw new Error(`${b.key}: a paragraph cannot hold a line break`);
      if (T.needsParaEscape(text)) text = '\\' + text;
      const a = [];
      if (b.key !== auto || (!classes.length && (b.tag !== 'p' || b.style))) {
        if (!relOk(b.key, sec)) throw new Error(`key ${b.key} cannot be written inside ${sec}`);
        a.push('#' + rel(b.key, sec));
      }
      classes.forEach(c => a.push('.' + c));
      if (b.tag !== 'p') a.push('tag=' + b.tag);
      if (b.style) a.push(`style="${b.style}"`);
      out.push(text + (a.length ? ' {' + a.join(' ') + '}' : ''), '');
    } else if (b.kind === 'h3') {
      out.push(`### ${Z[b.key]} {#${rel(b.key, sec)}${b.cls ? ' ' + b.cls.split(/\s+/).map(c => '.' + c).join(' ') : ''}}`, '');
    } else if (b.kind === 'list') {
      if (b.cls) out.push('{' + b.cls.split(/\s+/).filter(Boolean).map(c => '.' + c).join(' ') + '}');
      b.keys.forEach((k, j) => out.push((b.ordered ? (j + 1) + '. ' : '- ') + V(k) + ` {#${rel(k, sec)}}`));
      out.push('');
    } else if (b.kind === 'part') partMd(b.name, sec);
  }
  function partMd(name, sec) {
    const P = parts.get(name);
    out.push(`::: ${P.type} ${name}${P.prefix ? ' keys=' + P.prefix : ''}`);
    for (const k of P.keys) out.push(entry(k, sec, P.prefix && k.startsWith(P.prefix + '.') ? P.prefix : null));
    out.push(':::', '');
  }
  // hero
  out.push(`# ${Z['hero.title']} {#hero}`, '', '::: strings', `kicker: ${val(V('hero.kicker'))}`);
  for (const k of heroSec.leftover) out.push(entry(k, 'hero'));
  out.push(':::', '');
  const hc = { n: 0 };
  hero.blocks.forEach(b => blockMd(b, 'hero', hc));
  for (const s of sections) {
    out.push(`## ${Z[s.id + '.title']} {#${s.id}}`, '', '::: strings', `toc: ${val(V('toc.' + s.id))}`, ':::', '');
    const counter = { n: 0 };
    let prevWrap = false;
    for (const r of s.regions) {
      if (r.kind === 'wrap') {
        if (prevWrap) throw new Error(`${s.id}: two prose regions without a lab between them`);
        r.blocks.forEach(b => blockMd(b, s.id, counter)); prevWrap = true;
      } else { partMd(r.name, s.id); prevWrap = false; }
    }
    if (s.leftover.length) { out.push('::: strings'); for (const k of s.leftover) out.push(entry(k, s.id)); out.push(':::', ''); }
  }
  const wrapped = /^(<p>[\s\S]*?<\/p>)+$/.test(Z.footer);
  const fps = wrapped ? Z.footer.split(/(?=<p>)/).map(p => p.replace(/^<p>|<\/p>$/g, '')) : [Z.footer];
  if (fps.some(p => /\n/.test(p) || /^\s|\s$/.test(p))) throw new Error('footer has line breaks or edge spaces');
  out.push(wrapped ? '::: footer' : '::: footer wrap=none');
  fps.forEach((p, i) => { ctx.key = 'footer'; if (i) out.push(''); out.push(T.unrenderInline(p, ctx)); });
  out.push(':::', '');
  return out.join('\n');
}
// whitespace that only the old hand-written HTML had (deleting it from page.json only changes whitespace)
const walk = blocks => blocks.forEach(b => {
  if (b.joined) legacy.join.push(b.kind === 'part' ? 'fig:' + b.name : b.kind === 'list' ? 'list:' + b.keys[0] : b.key);
  if (b.kind === 'list' && b.compact) legacy.compactLists.push(b.keys[0]);
});
walk(hero.blocks);
sections.forEach(s => s.regions.forEach(r => r.kind === 'wrap' && walk(r.blocks)));

let md;
try { md = { zh: emit('zh'), en: emit('en') }; } catch (e) { fail(e.message); }
const prov = fs.existsSync(path.join(root, 'page-provenance.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'page-provenance.json'), 'utf8')).pages[page.slug] : null;
const meta = { slug: page.slug, kind: 'essay', layout: 'essay', scripts, version };
if (prov && provenanceNote) meta.provenanceNote = provenanceNote;
const L = {};
if (legacy.join.length) L.join = legacy.join;
if (legacy.compactLists.length) L.compactLists = legacy.compactLists;
if (Object.keys(legacy.gaps).length) L.gaps = legacy.gaps;
if (Object.keys(L).length) meta.legacyLayout = { _note: 'Whitespace of the hand-written HTML this page was converted from, so the conversion could be checked byte for byte. Safe to delete: only whitespace between block elements changes.', ...L };

fs.mkdirSync(path.join(dir, 'figures'), { recursive: true });
for (const l of T.LANGS) fs.writeFileSync(path.join(dir, `content.${l}.md`), md[l]);
fs.writeFileSync(path.join(dir, 'page.css'), style);
for (const [name, P] of parts) fs.writeFileSync(path.join(dir, 'figures', name + '.html'), P.html + '\n');
fs.writeFileSync(path.join(dir, 'page.json'), JSON.stringify(meta, null, 2) + '\n');

/* ── 4. the equivalence proof ── */
const res = T.buildEssay(dir, { root, chrome: false, prefill: false });
const problems = [...res.errors];
if (!res.errors.length) {
  if (res.outputs['index.html'] !== html) {
    const a = res.outputs['index.html'], i = [...a].findIndex((c, j) => c !== html[j]);
    problems.push(`index.html differs from the live page at byte ${i}: built ${JSON.stringify(a.slice(Math.max(0, i - 40), i + 60))} vs live ${JSON.stringify(html.slice(Math.max(0, i - 40), i + 60))}`);
  }
  for (const l of T.LANGS) {
    const a = res.copy[l], b = COPY[l];
    const ka = Object.keys(a), kb = Object.keys(b);
    for (const k of kb) if (!(k in a)) problems.push(`${l}: key ${k} lost`); else if (a[k] !== b[k]) problems.push(`${l}: ${k} differs: ${JSON.stringify(a[k]).slice(0, 120)} vs ${JSON.stringify(b[k]).slice(0, 120)}`);
    for (const k of ka) if (!(k in b)) problems.push(`${l}: key ${k} added`);
  }
}
const nParts = [...parts.values()].reduce((o, P) => (o[P.type] = (o[P.type] || 0) + 1, o), {});
if (problems.length) { console.error(problems.slice(0, 30).map(p => 'MISMATCH ' + p).join('\n')); fail(`round trip failed (${problems.length} problems); sources left in ${sitePath} for inspection`); }
const refs = (md.zh.match(/\[\[/g) || []).length;
console.log(`converted ${page.slug}: ${sections.length} chapters, ${Object.keys(COPY.zh).length} keys per language, ` +
  `${nParts.lab || 0} labs, ${nParts.diagram || 0} diagrams, ${nParts.html || 0} html partials, ${refs} [[refs]] in zh; ` +
  `round trip (no chrome, no pre-fill): index.html byte-identical, copy tables equal in zh and en`);
console.log('commit trailers:');
for (const l of T.LANGS) console.log(`Derived-From: ${sitePath}copy.${l}.js -> ${sitePath}content.${l}.md`);
console.log(`Derived-From: ${sitePath}index.html -> ${sitePath}page.css`);
for (const name of parts.keys()) console.log(`Derived-From: ${sitePath}index.html -> ${sitePath}figures/${name}.html`);
