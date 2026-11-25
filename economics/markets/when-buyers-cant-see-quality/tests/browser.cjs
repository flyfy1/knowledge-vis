'use strict';
// Browser smoke test for "When buyers can't see quality".
// Usage: NODE_PATH=~/fast/integ-life/integ-games/node_modules node economics/markets/when-buyers-cant-see-quality/tests/browser.cjs
// Starts its own static server on 127.0.0.1 (ESSAY_PORT, default 18884) and closes it at the end, unless ESSAY_BASE_URL
// points at a running one. SHOT_DIR=/tmp/... writes a desktop and a phone screenshot (never into the repo).
// Checks at 1280 and 390 in Chinese, and 390 in English: no console or page errors, no horizontal overflow, every control
// at least 48 px, every readout and live sentence filled, no raw copy keys; each diagram's labels non-empty and at least
// 11 px at 320 px; no CJK visible in English; each model driven once (sliders, buttons, checkbox) without errors.
const { chromium } = require('playwright');
const http = require('http'), path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const REL = '/economics/markets/when-buyers-cant-see-quality/';
const SHOT = process.env.SHOT_DIR || '';
const fails = []; let checks = 0;
const ok = (c, m) => { checks++; if (!c) fails.push(m); };
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

function serve(port) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, path.normalize(p));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
}

async function open(browser, base, width, lang) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400 && !/favicon|pagefind|page-provenance/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, lang);
  await page.goto(base + REL);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = errors;
  return page;
}

async function scrollAll(page) { // canvases draw only on screen
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 600) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(40); }
}

async function drive(page, tag) {
  const set = (id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
  const click = id => page.evaluate(id => document.getElementById(id).click(), id);
  for (const [id, v] of [['c1P', 10], ['c1G', 0], ['c3Lo', 0], ['c4I', 1500], ['c4K', 3], ['c5D', 8], ['c5Lam', 0.05], ['c6E', 1], ['c6E', 4], ['c7S', 36], ['c8Gap', 0], ['c8F', 120], ['c9Late', 3], ['c9Cut', 640]]) await set(id, v);
  for (const id of ['c3Step', 'c3Step', 'c3Reset', 'c4Step', 'c4Run', 'c4Run', 'c4Reset']) await click(id);
  await click('c8Info');
  await scrollAll(page);
  const r = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('.read b, .say, .ctl output')) if (!e.textContent.trim()) out.push('empty #' + e.id);
    if (document.querySelector('#c8Grp').hidden) out.push('c8 groups hidden with scores on');
    if (!/\d/.test(document.querySelector('#c8G0').textContent)) out.push('c8 group rate');
    return out;
  });
  r.forEach(m => fails.push(`${tag}: ${m}`)); checks++;
  ok(/^(?!.*\b(ch\d+|dg|ui|u)\.[a-z]).*$/s.test(await page.evaluate(() => document.body.innerText)), `${tag}: raw copy key visible`);
}

async function layout(page, tag, width) {
  const r = await page.evaluate(() => {
    const out = [];
    if (document.documentElement.scrollWidth > window.innerWidth + 1) out.push('horizontal overflow ' + document.documentElement.scrollWidth);
    for (const e of document.querySelectorAll('button, input[type=range], label.chk, .toc a, a.back')) {
      const b = e.getBoundingClientRect(); if (b.width && (b.width < 47.5 || b.height < 47.5)) out.push(`small target ${e.id || e.className || e.tagName} ${b.width.toFixed(0)}×${b.height.toFixed(0)}`);
    }
    return out;
  });
  r.forEach(m => fails.push(`${tag}@${width}: ${m}`)); checks++;
}

async function diagrams(page, tag) {
  const r = await page.evaluate(() => {
    const out = [];
    for (const fig of document.querySelectorAll('figure.dia')) {
      const svg = fig.querySelector('svg'), k = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      const vb = svg.viewBox.baseVal;
      for (const t of svg.querySelectorAll('text')) {
        const s = t.textContent.trim(); if (!s || /^dg\./.test(s)) { out.push(fig.id + ': empty label'); continue; }
        const fs = parseFloat(t.getAttribute('font-size')) * k; if (fs < 11) out.push(`${fig.id}: "${s}" ${fs.toFixed(1)}px`);
        const b = t.getBBox(); if (b.x < -0.5 || b.x + b.width > vb.width + 0.5) out.push(`${fig.id}: "${s}" outside`);
      }
    }
    return out;
  });
  r.forEach(m => fails.push(`${tag}: ${m}`)); checks++;
}

(async () => {
  let srv = null, base = process.env.ESSAY_BASE_URL;
  if (!base) { const port = Number(process.env.ESSAY_PORT || 18884); srv = await serve(port); base = `http://127.0.0.1:${port}`; }
  base = base.replace(/\/$/, '');
  const browser = await chromium.launch();
  try {
    for (const [w, lang] of [[1280, 'zh'], [390, 'zh'], [390, 'en'], [320, 'zh']]) {
      const page = await open(browser, base, w, lang), tag = `${lang}@${w}`;
      await scrollAll(page);
      await layout(page, tag, w);
      if (w === 320) await diagrams(page, tag);
      if (lang === 'en') {
        const cjk = await page.evaluate(() => { const t = document.body.innerText.replace(/中/g, ''); const m = t.match(/[一-鿿]+/g); return m ? m.slice(0, 5).join(' ') : ''; });
        ok(!cjk, `${tag}: CJK visible in English: ${cjk}`);
        ok(await page.evaluate(() => document.documentElement.lang === 'en'), `${tag}: html lang`);
      }
      if (SHOT && (w === 1280 || (w === 390 && lang === 'zh'))) {
        for (const id of ['ch1', 'ch3', 'ch4', 'ch8']) { await page.evaluate(id => document.getElementById(id).scrollIntoView(), id); await page.waitForTimeout(150); await page.screenshot({ path: path.join(SHOT, `${tag}-${id}.png`) }); }
      }
      await drive(page, tag);
      await layout(page, tag + ' after driving', w);
      ok(page.__errors.length === 0, `${tag}: errors: ${page.__errors.slice(0, 3).join(' | ')}`);
      await page.close();
    }
  } finally {
    await browser.close();
    if (srv) srv.close();
  }
  console.log(`${checks - fails.length}/${checks} checks passed`);
  if (fails.length) { fails.slice(0, 40).forEach(f => console.error('FAIL ' + f)); process.exit(1); }
})();
