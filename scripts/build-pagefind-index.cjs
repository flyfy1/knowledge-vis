#!/usr/bin/env node
'use strict';
/* Build or verify the Pagefind full-text search index (pagefind/) for all live pages.
 * Contract: specs/atlas-search-index.md § Pagefind full-text search.
 *
 *   node scripts/build-pagefind-index.cjs          build pagefind/ from registered live pages
 *   node scripts/build-pagefind-index.cjs --check  verify pagefind/ exists, covers all live pages, and is fresh
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { prefill, unprefill } = require('./lib/prefill.cjs');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'pagefind');
const manifestFile = path.join(outDir, 'build-manifest.json');
const checkOnly = process.argv.includes('--check');

function loadWindowJS(file) {
  const sb = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sb);
  return sb.window;
}

function flatten(obj, prefix = '', out = {}) {
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (typeof v === 'string') out[key] = v;
    else if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
  }
  return out;
}

function extractBalancedObject(code, startIdx) {
  let depth = 0, inStr = null, esc = false;
  for (let i = startIdx; i < code.length; i++) {
    const ch = code[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (ch === '\\') esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i++;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return code.slice(startIdx, i + 1);
    }
  }
  return null;
}

function loadStrTable(dir, lang) {
  const copyFile = path.join(dir, `copy.${lang}.js`);
  if (fs.existsSync(copyFile)) {
    const ctx = { window: {} };
    vm.runInNewContext(fs.readFileSync(copyFile, 'utf8'), ctx);
    const W = ctx.window;
    if (W.ESSAY_COPY && W.ESSAY_COPY[lang]) return flatten(W.ESSAY_COPY[lang]);
    const k = Object.keys(W).find(x => x.toUpperCase().includes(lang.toUpperCase()) || typeof W[x] === 'object');
    if (k && W[k]) return flatten(W[k][lang] || W[k]);
  }
  for (const file of ['i18n.js', 'app.js']) {
    const fp = path.join(dir, file);
    if (!fs.existsSync(fp)) continue;
    const code = fs.readFileSync(fp, 'utf8');
    for (const m of code.matchAll(/(?:const|let|var)\s+[A-Za-z0-9_$]+\s*=\s*\{/g)) {
      const braceStart = m.index + m[0].length - 1;
      const lit = extractBalancedObject(code, braceStart);
      if (lit && lit.includes('zh') && lit.includes('en')) {
        try {
          const obj = vm.runInNewContext('(' + lit + ')');
          if (obj && obj[lang] && typeof obj[lang] === 'object') return flatten(obj[lang]);
        } catch (e) {}
      }
    }
  }
  const htmlFile = path.join(dir, 'index.html');
  if (fs.existsSync(htmlFile)) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const out = {};
    let idx = 0;
    for (const m of html.matchAll(new RegExp(`data-${lang}="([^"]+)"`, 'g'))) {
      out['attr_' + (++idx)] = m[1];
    }
    if (idx > 0) return out;
  }
  return null;
}

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const config = loadWindowJS(path.join(root, 'pages.config.js'));
const pages = (config.KNOWLEDGE_PAGES || []).filter(p => p && p.status === 'live' && p.path && p.category !== 'leetcode');

function prepareHtmlForLang(p, lang) {
  const dir = path.join(root, p.path);
  const htmlPath = path.join(dir, 'index.html');
  if (!fs.existsSync(htmlPath)) return null;
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const zhTable = loadStrTable(dir, 'zh') || {};
  const table = lang === 'zh' ? zhTable : (loadStrTable(dir, 'en') || {});
  const bare = unprefill(rawHtml, zhTable)
    // Keep only section/chapter/step IDs so Pagefind sub_results only link to real chapter/step anchors
    .replace(/\bid="(?!(?:ch\d+|step\d+|part\d+)\b)[^"]+"/g, '');
  let filled = prefill(bare, table, { aria: false });
  // Move section id="chN|stepN|partN" onto its first heading so Pagefind records the heading text as the anchor title
  filled = filled.replace(
    /(<section\b[^>]*?)\s+id="((?:ch|step|part)\d+)"([^>]*>[\s\S]*?<h[23]\b)([^>]*>)/gi,
    '$1$3 id="$2"$4'
  );
  // Also fill data-zh / data-en attributes if used (e.g. membrane-transport)
  filled = filled.replace(new RegExp(`(<([a-z0-9]+)\\b[^>]*?\\bdata-${lang}="([^"]+)"[^>]*>)[\\s\\S]*?(<\\/\\2>)`, 'gi'), '$1$3$4');
  // Append any prose keys from the translation table (and Claude Code parallel edition if present) not already in DOM
  const extraProse = [];
  for (const [k, v] of Object.entries(table)) {
    if (/^(?:site\.|nav|back|foot|doc\.|meta\.)/.test(k)) continue;
    if (typeof v === 'string' && v.length > 4 && !filled.includes(v.slice(0, 12))) extraProse.push(v);
  }
  const ccRel = p.editions && p.editions['claude-code'];
  if (ccRel) {
    const ccDir = path.join(root, ccRel);
    const ccTable = fs.existsSync(ccDir) ? (loadStrTable(ccDir, lang) || {}) : {};
    for (const [k, v] of Object.entries(ccTable)) {
      if (/^(?:site\.|nav|back|foot|doc\.|meta\.)/.test(k)) continue;
      if (typeof v === 'string' && v.length > 8) extraProse.push(v);
    }
  }
  const title = (p.title && p.title[lang]) || (p.title && p.title.zh) || p.slug;
  const desc = (p.desc && p.desc[lang]) || (p.desc && p.desc.zh) || '';
  const tags = (p.tags || []).map(t => (t && t[lang]) || '').filter(Boolean).join(' ');
  const htmlLang = lang === 'zh' ? 'zh-CN' : 'en';
  const metaHtml = `<span data-pagefind-meta="slug:${esc(p.slug)}" data-pagefind-meta="category:${esc(p.category)}" data-pagefind-meta="subtopic:${esc(p.subtopic || '')}" data-pagefind-meta="stage:${esc(p.stage || 'university')}" data-pagefind-filter="category:${esc(p.category)}" data-pagefind-filter="stage:${esc(p.stage || 'university')}"></span>`;
  const tailHtml = `<div class="pf-supplement">${metaHtml}<p>${esc(desc)} ${esc(tags)}</p>${extraProse.length ? `<p>${extraProse.join(' ')}</p>` : ''}</div>`;
  return filled
    .replace(/<html\b[^>]*>/i, `<html lang="${htmlLang}">`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<\/body>/i, `${tailHtml}</body>`);
}

function computeSourceSignature() {
  const h = crypto.createHash('sha256');
  for (const p of pages) {
    for (const lang of ['zh', 'en']) {
      const doc = prepareHtmlForLang(p, lang);
      h.update(`${lang}:${p.slug}:${p.path}\0`);
      if (doc) h.update(doc);
      h.update('\0');
    }
  }
  return {
    pageCount: pages.length,
    signature: h.digest('hex').slice(0, 24),
  };
}

if (checkOnly) {
  if (!fs.existsSync(manifestFile) || !fs.existsSync(path.join(outDir, 'pagefind-entry.json')) || !fs.existsSync(path.join(outDir, 'pagefind.js'))) {
    console.error('ERROR: pagefind/ bundle or build-manifest.json is missing. Run: node scripts/build-pagefind-index.cjs');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const entry = JSON.parse(fs.readFileSync(path.join(outDir, 'pagefind-entry.json'), 'utf8'));
  const current = computeSourceSignature();
  if (manifest.pageCount !== current.pageCount || manifest.signature !== current.signature) {
    console.error(`ERROR: pagefind/ index is out of date (recorded ${manifest.pageCount} pages / ${manifest.signature}, current ${current.pageCount} pages / ${current.signature}). Run: node scripts/build-pagefind-index.cjs`);
    process.exit(1);
  }
  const zhCount = entry.languages && entry.languages['zh-cn'] && entry.languages['zh-cn'].page_count;
  const enCount = entry.languages && entry.languages.en && entry.languages.en.page_count;
  if (zhCount !== current.pageCount || enCount !== current.pageCount) {
    console.error(`ERROR: pagefind-entry.json language counts (zh-cn=${zhCount}, en=${enCount}) do not match ${current.pageCount} live pages.`);
    process.exit(1);
  }
  console.log(`PASS: pagefind/ index is current (${current.pageCount} pages × 2 languages, signature ${current.signature})`);
  process.exit(0);
}

// Build mode: stage synthetic bilingual HTML files in a scratch directory and run Pagefind CLI.
const baseTmp = fs.existsSync('/tmp/agent-tasks') ? '/tmp/agent-tasks' : os.tmpdir();
const scratch = fs.mkdtempSync(path.join(baseTmp, 'pagefind-build-'));
const siteTmp = path.join(scratch, 'site');
const outTmp = path.join(scratch, 'out');

try {
  const h = crypto.createHash('sha256');
  for (const p of pages) {
    for (const lang of ['zh', 'en']) {
      const doc = prepareHtmlForLang(p, lang);
      h.update(`${lang}:${p.slug}:${p.path}\0`);
      if (!doc) { h.update('\0'); continue; }
      h.update(doc);
      h.update('\0');
      // Place zh at <path>/index.html and en at en/<path>/index.html so Pagefind indexes both languages distinctly
      const relOut = lang === 'zh' ? path.join(p.path, 'index.html') : path.join('en', p.path, 'index.html');
      const fullOut = path.join(siteTmp, relOut);
      fs.mkdirSync(path.dirname(fullOut), { recursive: true });
      fs.writeFileSync(fullOut, doc);
    }
  }
  const signature = h.digest('hex').slice(0, 24);
  const excludeSelectors = [
    '.topbar', '.site-nav', '.page-provenance', '.edition-compare', '.compare',
    '.toc', '.step-nav', '.site-xref', 'footer', '.site-foot', 'script', 'style',
    'svg', 'canvas', '.ctl', '.controls', '.btn-row', '.read', '.metrics',
    'button', 'output', 'select', 'input'
  ];
  const pfArgs = ['--yes', 'pagefind', '--site', siteTmp, '--output-path', outTmp, '--quiet'];
  for (const sel of excludeSelectors) pfArgs.push('--exclude-selectors', sel);
  const res = spawnSync('npx', pfArgs, { cwd: root, stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('ERROR: Pagefind CLI failed.');
    process.exit(res.status || 1);
  }
  // Remove unused UI bundles and playground to keep repo size lean
  for (const unused of ['pagefind-component-ui.js', 'pagefind-component-ui.css', 'pagefind-modular-ui.js', 'pagefind-modular-ui.css']) {
    const f = path.join(outTmp, unused);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  fs.writeFileSync(path.join(outTmp, 'build-manifest.json'), JSON.stringify({
    _generated: 'scripts/build-pagefind-index.cjs',
    pageCount: pages.length,
    signature,
  }, null, 2) + '\n');

  // Sync outTmp to outDir without calling external rm
  function syncDir(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    const srcEntries = new Set(fs.readdirSync(src));
    for (const existing of fs.readdirSync(dst)) {
      if (!srcEntries.has(existing)) {
        fs.rmSync(path.join(dst, existing), { recursive: true, force: true });
      }
    }
    for (const name of srcEntries) {
      const s = path.join(src, name), d = path.join(dst, name);
      if (fs.statSync(s).isDirectory()) syncDir(s, d);
      else fs.copyFileSync(s, d);
    }
  }
  syncDir(outTmp, outDir);
  console.log(`Built pagefind/ (${pages.length} live pages × 2 languages, signature ${signature})`);
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
