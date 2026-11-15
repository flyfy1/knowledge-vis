'use strict';
// Migration tool: live essay (index.html + copy.zh.js + copy.en.js) -> content.zh.md, content.en.md, page.css,
// figures/*.html, page.json. Usage: node template/convert.cjs <live-dir> <out-page-dir> <site-path>
// It refuses to write if any copy key would be lost or emitted twice.
const fs = require('fs'), path = require('path');
const L = require('./lib.cjs');
const [liveDir, outDir, sitePath] = process.argv.slice(2);
const html = fs.readFileSync(path.join(liveDir, 'index.html'), 'utf8');
const COPY = { zh: L.loadCopy(path.join(liveDir, 'copy.zh.js')), en: L.loadCopy(path.join(liveDir, 'copy.en.js')) };
const page = L.site().byPath.get(sitePath); if (!page) throw new Error('not a live page: ' + sitePath);
const lines = html.split('\n');

/* ── 1. structure from index.html ── */
const style = html.match(/<style>\n([\s\S]*?)<\/style>/)[1];
const scripts = [...html.matchAll(/<script src="([\w.]+)\?v=([\w]+)"/g)].map(m => m[1]), version = (html.match(/\?v=(\w+)"/) || [])[1];
const el = s => { const m = s.trim().match(/^<(\w+)((?:\s+[\w-]+="[^"]*")*)\s*>(?:<\/\1>)?$/); if (!m) return null; const a = {}; for (const x of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) a[x[1]] = x[2]; return { tag: m[1], a }; };
const sections = []; // {id, blocks:[{kind:'p'|'h2'|'list'|'fig', ...}]}
let cur = null, list = null, fig = null;
const hero = { paras: [] };
let inHero = false;
for (let i = 0; i < lines.length; i++) {
  const s = lines[i], t = s.trim();
  if (t.startsWith('<header class="hero"')) { inHero = true; continue; }
  if (inHero) { if (t === '</header>') { inHero = false; continue; } const e = el(t); if (e && e.a['data-i18n-html']) hero.paras.push({ key: e.a['data-i18n-html'], cls: e.a.class }); continue; }
  let m;
  if ((m = t.match(/^<section class="ch" id="([\w-]+)">$/))) { cur = { id: m[1], blocks: [] }; sections.push(cur); continue; }
  if (!cur) continue;
  if (t === '</section>') { cur = null; continue; }
  if (fig) { fig.lines.push(s); if (t.endsWith('</figure></div>')) fig = null; continue; }
  if (t.startsWith('<div class="wide"><figure')) { fig = { kind: 'fig', lines: [s] }; cur.blocks.push(fig); if (t.endsWith('</figure></div>')) fig = null; continue; }
  if (/^<(ul|ol)\b/.test(t)) { const e = el(t.replace(/<\/?(ul|ol)>$/, '') + '</' + t.match(/^<(\w+)/)[1] + '>') || el(t); list = { kind: 'list', ordered: t.startsWith('<ol'), cls: (t.match(/class="([^"]*)"/) || [])[1], items: [] }; cur.blocks.push(list); continue; }
  if (/^<\/(ul|ol)>$/.test(t)) { list = null; continue; }
  const e = el(t); if (!e) continue;
  if (list && e.tag === 'li') { list.items.push(e.a['data-i18n-html']); continue; }
  if (e.tag === 'h2') cur.blocks.push({ kind: 'h2', key: e.a['data-i18n'] });
  else if (e.a['data-i18n-html']) cur.blocks.push({ kind: 'p', tag: e.tag, key: e.a['data-i18n-html'], cls: e.a.class, style: e.a.style });
}

/* ── 2. key ownership, emit both languages with one code path ── */
function emit(lang) {
  const Z = COPY[lang], done = new Set(), out = [];
  const ctx = { page, lang, ownAnchors: new Set(sections.map(s => s.id)) };
  const V = k => { if (!(k in Z)) throw new Error(`${lang}: missing ${k}`); if (done.has(k)) throw new Error(`${lang}: ${k} twice`); done.add(k); ctx.key = k; return L.unrenderInline(Z[k], ctx); };
  const raw = k => { if (done.has(k)) throw new Error(`${lang}: ${k} twice`); done.add(k); return Z[k]; };
  const val = v => (v === '' || /^\s|\s$|^"/.test(v)) ? JSON.stringify(v) : v;
  const attrs = (key, auto, cls, extra) => { const a = []; if (key !== auto) a.push('#' + key); for (const c of (cls || '').split(/\s+/).filter(Boolean)) a.push('.' + c); if (extra) a.push(extra); return a.length ? ' {' + a.join(' ') + '}' : ''; };
  out.push('---', `lang: ${lang}`, `title: ${raw('doc.title')}`, `desc: ${raw('doc.desc')}`, '---', '');
  // global strings: everything not owned by hero / a chapter / toc / footer
  const owned = k => /^(hero|ch\d+)\./.test(k) || /^toc\.ch\d+$/.test(k) || k === 'footer' || k === 'doc.title' || k === 'doc.desc';
  out.push('::: strings'); for (const k of Object.keys(Z)) if (!owned(k)) out.push(`${k}: ${val(raw(k))}`); out.push(':::', '');
  // hero
  out.push(`# ${raw('hero.title')} {#hero}`, '', '::: strings', `kicker: ${val(raw('hero.kicker'))}`, ':::', '');
  for (const p of hero.paras) out.push(V(p.key) + attrs(p.key, 'hero.' + p.cls, p.cls), '');
  // chapters
  for (const s of sections) {
    let n = 0; const sid = s.id, rest = Object.keys(Z).filter(k => k.startsWith(sid + '.'));
    out.push(`## ${raw(sid + '.title')} {#${sid}}`, '', '::: strings', `toc: ${val(raw('toc.' + sid))}`, ':::', '');
    const figs = s.blocks.filter(b => b.kind === 'fig');
    for (const b of s.blocks) {
      if (b.kind === 'h2') continue;
      if (b.kind === 'p') {
        const auto = b.cls === 'law' ? sid + '.law' : b.cls === 'take' ? sid + '.limit' : !b.cls ? sid + '.p' + (++n) : null;
        const extra = [b.tag !== 'p' ? 'tag=' + b.tag : '', b.style ? `style="${b.style}"` : ''].filter(Boolean).join(' ');
        out.push(V(b.key) + attrs(b.key, auto, b.cls === 'law' || b.cls === 'take' ? b.cls : b.cls, extra), '');
      } else if (b.kind === 'list') {
        if (b.cls) out.push('{' + b.cls.split(' ').filter(Boolean).map(c => '.' + c).join(' ') + '}');
        b.items.forEach((k, j) => out.push((b.ordered ? (j + 1) + '. ' : '- ') + V(k) + ` {#${k.startsWith(sid + '.') ? k.slice(sid.length + 1) : k}}`));
        out.push('');
      } else if (b.kind === 'fig') {
        const keys = [...new Set([...b.lines.join('\n').matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]))].filter(k => k.startsWith(sid + '.'));
        const h3 = (b.lines.join('\n').match(/<h3 data-i18n="([^"]+)\.title"/) || [])[1] || sid + '.fig' + figs.indexOf(b);
        const name = h3.replace(/\./g, '-');
        if (lang === 'zh') { fs.mkdirSync(path.join(outDir, 'figures'), { recursive: true }); fs.writeFileSync(path.join(outDir, 'figures', name + '.html'), b.lines.join('\n').replace(/^  <div class="wide">/, '').replace(/<\/div>$/, '') + '\n'); }
        out.push(`::: lab ${name}`);
        // the figure's own keys, then (on the chapter's last figure) the chapter's script-only keys (say/cv/unit…)
        const mine = rest.filter(k => keys.includes(k) && !done.has(k));
        const tail = b === figs[figs.length - 1] ? rest.filter(k => !done.has(k) && !mine.includes(k) && !s.blocks.some(x => x.key === k || (x.items || []).includes(k))) : [];
        for (const k of [...mine, ...tail]) out.push(`${k.slice(sid.length + 1)}: ${val(V(k))}`);
        out.push(':::', '');
      }
    }
    const left = rest.filter(k => !done.has(k));
    if (left.length) { out.push('::: strings'); for (const k of left) out.push(`${k.slice(sid.length + 1)}: ${val(V(k))}`); out.push(':::', ''); }
  }
  out.push('::: footer'); for (const p of Z.footer.split(/(?=<p>)/)) { ctx.key = 'footer'; out.push(L.unrenderInline(p.replace(/^<p>|<\/p>$/g, ''), ctx), ''); } done.add('footer'); out.pop(); out.push(':::', '');
  const missing = Object.keys(Z).filter(k => !done.has(k)); if (missing.length) throw new Error(`${lang}: keys not emitted: ${missing.join(', ')}`);
  return out.join('\n');
}
fs.mkdirSync(outDir, { recursive: true });
for (const lang of ['zh', 'en']) fs.writeFileSync(path.join(outDir, `content.${lang}.md`), emit(lang));
fs.writeFileSync(path.join(outDir, 'page.css'), style);
const meta = { layout: 'essay', slug: page.slug, scripts, version, sections: sections.map(s => s.id) };
if (!fs.existsSync(path.join(outDir, 'page.json'))) fs.writeFileSync(path.join(outDir, 'page.json'), JSON.stringify(meta, null, 2) + '\n');
console.log(`converted ${page.slug}: ${sections.length} chapters, ${sections.reduce((a, s) => a + s.blocks.filter(b => b.kind === 'fig').length, 0)} figures, ${Object.keys(COPY.zh).length} keys per language`);
