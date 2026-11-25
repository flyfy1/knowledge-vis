'use strict';
// Browser smoke test for the essay on what a stock is worth. Starts its own static server on a free port (repo root)
// and closes it at the end, so no server is left running.
// Usage: NODE_PATH=~/fast/integ-life/integ-games/node_modules node investment/basics/what-a-stock-is-worth/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes a zh screenshot at 1280 and 390 plus one per model and diagram at 1280 (never into
// the repo). Checks at 1280/390/320 (Chinese; English is a stub while page.json says so): no console or page errors,
// no horizontal overflow, every control at least 48×48, no raw copy keys in the DOM, every readout and live sentence
// filled, diagrams present with non-empty labels inside the drawing and at least 11 px, no two labels overlapping;
// then every slider is driven to both ends without errors and the bubble runs to its end.
const { chromium } = require('playwright');
const http = require('http'), path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..'), ROOT = path.join(DIR, '../../..');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 8, LABS = 10;
const fails = []; let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const fp = path.join(ROOT, p);
      if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { r.writeHead(404); r.end(); return; }
      r.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(r);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  const srv = await serve(), url = `http://127.0.0.1:${srv.address().port}/investment/basics/what-a-stock-is-worth/`;
  const browser = await chromium.launch();
  try {
    for (const width of [1280, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push('page error: ' + e.message));
      page.on('response', r => { if (r.status() >= 400 && !/site-nav|page-provenance|favicon/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
      await page.addInitScript(() => { try { localStorage.setItem('knowledge-lang', 'zh'); } catch (e) {} });
      await page.goto(url); await page.waitForFunction(() => window.__essayReady === true);
      const r = await page.evaluate(() => {
        const out = { overflow: document.documentElement.scrollWidth - window.innerWidth, small: [], raw: [], empty: [], labs: document.querySelectorAll('figure.lab').length, dias: [] };
        for (const e of document.querySelectorAll('input[type=range], button, .seg label, label.chk, .toc a')) {
          const b = e.getBoundingClientRect(); if (b.width && (b.width < 47.5 || b.height < 47.5)) out.small.push((e.id || e.textContent.trim().slice(0, 12)) + ' ' + Math.round(b.width) + '×' + Math.round(b.height));
        }
        const txt = document.body.innerText; const m = txt.match(/\b(ch\d+|dg|u|nav|toc)\.[a-z][\w.]*/g); if (m) out.raw = m.slice(0, 5);
        for (const e of document.querySelectorAll('.read b, .say, output')) if (!e.textContent.trim()) out.empty.push(e.id || e.className);
        for (const fig of document.querySelectorAll('figure.dia')) {
          const svg = fig.querySelector('svg'), sb = svg.getBoundingClientRect(), labs = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent, b: t.getBoundingClientRect(), fs: parseFloat(getComputedStyle(t).fontSize) * sb.width / svg.viewBox.baseVal.width }));
          const d = { id: fig.id, aria: svg.getAttribute('aria-label') || '', bad: [] };
          for (const l of labs) {
            if (!l.t.trim()) d.bad.push('empty');
            if (l.b.left < sb.left - 1 || l.b.right > sb.right + 1) d.bad.push('outside: ' + l.t);
            if (l.fs < 10.95) d.bad.push('small ' + l.fs.toFixed(1) + ': ' + l.t);
          }
          for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++) { const a = labs[i].b, b = labs[j].b; const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ix > 1 && iy > 1) d.bad.push('overlap: ' + labs[i].t + ' / ' + labs[j].t); }
          out.dias.push(d);
        }
        return out;
      });
      ok(r.overflow <= 0, `${width}: horizontal overflow ${r.overflow}px`);
      ok(!r.small.length, `${width}: small targets ${r.small.join(', ')}`);
      ok(!r.raw.length, `${width}: raw keys ${r.raw.join(', ')}`);
      ok(!r.empty.length, `${width}: empty readouts ${r.empty.join(', ')}`);
      ok(r.labs === LABS, `${width}: ${r.labs} labs, expected ${LABS}`);
      ok(r.dias.length === DIAGRAMS, `${width}: ${r.dias.length} diagrams, expected ${DIAGRAMS}`);
      for (const d of r.dias) { ok(d.aria.length > 4, `${width} ${d.id}: aria-label`); ok(!d.bad.length, `${width} ${d.id}: ${d.bad.join('; ')}`); }
      // drive every slider to both ends, scrolling each lab into view so its canvas draws
      const ids = await page.evaluate(() => [...document.querySelectorAll('figure.lab input[type=range]')].map(e => e.id));
      for (const id of ids) {
        for (const end of ['min', 'max', 'value']) {
          await page.evaluate(([id, end]) => { const e = document.getElementById(id); e.scrollIntoView({ block: 'center' }); if (!e.__v) e.__v = e.value; e.value = end === 'value' ? e.__v : e[end]; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, end]);
          await page.waitForTimeout(30);
        }
      }
      for (const b of ['#c7bAgain', '#c10Again']) { await page.click(b); }
      await page.click('#s9C'); await page.click('#s9C');
      for (const v of ['power', 'food', 'drugs', 'software', 'auto']) await page.check(`input[name=c7Ind][value=${v}]`, { force: true });
      // the bubble runs to its end within 40 × 0.35 s
      await page.locator('#c10Cv').scrollIntoViewIfNeeded(); await page.waitForTimeout(15000);
      const say10 = await page.textContent('#c10Say');
      ok(!/第 \d+ 年，价格/.test(say10), `${width}: bubble still running after 15 s: ${say10}`);
      ok(!errors.length, `${width}: errors ${errors.join(' | ')}`);
      if (SHOT && width !== 320) {
        await page.reload(); await page.waitForFunction(() => window.__essayReady === true);
        await page.screenshot({ path: path.join(SHOT, `top-${width}.png`) });
        if (width === 1280) for (const sel of await page.evaluate(() => [...document.querySelectorAll('figure.lab, figure.dia')].map(e => '#' + e.id))) {
          await page.locator(sel).scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
          await page.locator(sel).screenshot({ path: path.join(SHOT, `${sel.slice(1)}.png`) });
        }
        if (width === 390) { await page.locator('#lab3').scrollIntoViewIfNeeded(); await page.waitForTimeout(150); await page.screenshot({ path: path.join(SHOT, 'phone-lab3.png') }); }
      }
      await page.close();
    }
  } finally { await browser.close(); srv.close(); }
  console.log(`${checks - fails.length}/${checks} browser checks passed`);
  if (fails.length) { console.error(fails.map(s => 'FAIL ' + s).join('\n')); process.exit(1); }
})();
