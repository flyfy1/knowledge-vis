'use strict';
// Browser smoke test. Starts its own static server (closed at the end) unless ESSAY_BASE_URL is given.
// Usage: NODE_PATH=~/fast/integ-life/integ-games/node_modules node investment/rates/what-the-yield-curve-says/tests/browser.cjs
//   SHOTS=<dir> also saves one desktop and one phone screenshot per chapter (zh).
// Checks at 1280, 390 and 320 (zh): no console or page errors, no horizontal overflow, every control ≥ 48 px,
// every readout and live sentence filled with no leftover {placeholder}, each control driven once, diagram labels
// non-empty, inside their SVG and ≥ 11 px.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const REL = 'investment/rates/what-the-yield-curve-says/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
      r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    });
    srv.listen(+(process.env.PORT || 18882), '127.0.0.1', () => res(srv));
  });
}

(async () => {
  const srv = process.env.ESSAY_BASE_URL ? null : await serve();
  const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:' + (process.env.PORT || 18882)).replace(/\/$/, '');
  const browser = await chromium.launch();
  let fails = 0, n = 0;
  const ok = (name, c, info) => { n++; if (!c) { fails++; console.error('FAIL ' + name + (info ? ': ' + info : '')); } };
  try {
    for (const [w, h] of [[1280, 900], [390, 844], [320, 700]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'zh-CN' });
      await ctx.addInitScript(() => { try { localStorage.setItem('knowledge-lang', 'zh'); } catch (e) { /* */ } });
      const page = await ctx.newPage(), errs = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      page.on('pageerror', e => errs.push(String(e)));
      await page.goto(base + '/' + REL, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      // scroll every lab into view so canvases draw, and drive every control once
      const labs = await page.$$eval('figure.lab', els => els.map(e => e.id));
      for (const id of labs) {
        await page.$eval('#' + id, e => e.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(120);
        await page.$$eval(`#${id} input[type=range]`, els => els.forEach(e => { if (e.disabled) return; const v = +e.min + (+e.max - +e.min) * 0.7; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }));
        await page.$$eval(`#${id} input[type=radio]`, els => { const last = els[els.length - 1]; if (last) { last.checked = true; last.dispatchEvent(new Event('input', { bubbles: true })); } });
        const btns = await page.$$(`#${id} button`); for (const b of btns) await b.click();
        await page.waitForTimeout(150);
        if (process.env.SHOTS && w !== 320) { fs.mkdirSync(process.env.SHOTS, { recursive: true }); await page.screenshot({ path: path.join(process.env.SHOTS, `${id}-${w}.png`) }); }
      }
      await page.waitForTimeout(800);
      const r = await page.evaluate(() => {
        const o = { overflow: document.documentElement.scrollWidth - innerWidth, small: [], empty: [], ph: [], dia: [] };
        document.querySelectorAll('input[type=range], button, .seg label, a.back, #langToggle button').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && (b.height < 47.5 || b.width < 47.5)) o.small.push((e.id || e.textContent || e.tagName).slice(0, 30) + ' ' + Math.round(b.width) + '×' + Math.round(b.height)); });
        document.querySelectorAll('.read b, .say, output').forEach(e => { const s = e.textContent.trim(); if (!s) o.empty.push(e.id); if (/\{\w+\}/.test(s)) o.ph.push(e.id + ': ' + s.slice(0, 60)); });
        document.querySelectorAll('figure.dia svg').forEach(svg => {
          const sb = svg.getBoundingClientRect();
          svg.querySelectorAll('text').forEach(t => { const b = t.getBoundingClientRect(), fs = parseFloat(getComputedStyle(t).fontSize) * sb.width / svg.viewBox.baseVal.width;
            if (!t.textContent.trim()) o.dia.push('empty ' + (t.dataset.i18n || ''));
            if (fs < 10.95) o.dia.push('small ' + (t.dataset.i18n || t.textContent) + ' ' + fs.toFixed(1));
            if (b.left < sb.left - 1 || b.right > sb.right + 1) o.dia.push('outside ' + (t.dataset.i18n || t.textContent)); });
        });
        return o;
      });
      ok(`${w}: no console/page errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
      ok(`${w}: no horizontal overflow`, r.overflow <= 0, String(r.overflow));
      ok(`${w}: targets ≥ 48 px`, r.small.length === 0, r.small.slice(0, 5).join(', '));
      ok(`${w}: readouts filled`, r.empty.length === 0, r.empty.slice(0, 5).join(', '));
      ok(`${w}: no leftover placeholders`, r.ph.length === 0, r.ph.slice(0, 3).join(' | '));
      ok(`${w}: diagram labels`, r.dia.length === 0, r.dia.slice(0, 6).join(', '));
      ok(`${w}: ${labs.length} labs`, labs.length === 12);
      await ctx.close();
    }
  } finally {
    await browser.close();
    if (srv) srv.close();
  }
  console.log(`${n - fails}/${n} browser checks passed`);
  process.exit(fails ? 1 : 0);
})();
