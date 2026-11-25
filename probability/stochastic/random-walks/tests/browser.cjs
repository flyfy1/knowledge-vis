'use strict';
/* NODE_PATH=~/fast/integ-life/integ-games/node_modules node probability/stochastic/random-walks/tests/browser.cjs [shotDir]
   Starts its own static server on 127.0.0.1 (random free port), loads the page at 1280 and 390 px in zh and en,
   checks: no console errors or page errors, every readout filled, no CJK visible in English, no horizontal overflow,
   every control at least 48 px. Optional screenshots into shotDir. Closes the server and browser itself. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../../../..');
const PAGE = '/probability/stochastic/random-walks/';
const SHOTS = process.argv[2] || null;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const fails = [];
  try {
    for (const [w, h] of [[1280, 900], [390, 844]]) {
      for (const lang of ['zh', 'en']) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
        await ctx.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, lang);
        const pg = await ctx.newPage();
        const errs = [];
        pg.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
        pg.on('pageerror', e => errs.push(String(e)));
        await pg.goto(base + PAGE, { waitUntil: 'load' });
        // scroll through so every canvas draws
        const H = await pg.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y < H; y += 600) { await pg.evaluate(v => window.scrollTo(0, v), y); await pg.waitForTimeout(40); }
        await pg.waitForTimeout(300);
        const r = await pg.evaluate(() => {
          const out = {};
          out.empty = [...document.querySelectorAll('.read b, .say')].filter(e => !e.textContent.trim()).map(e => e.id);
          out.overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
          out.small = [...document.querySelectorAll('button, input[type=range], .seg label')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.height < 47.5 || b.width < 47.5); }).map(e => e.id || e.textContent.trim().slice(0, 20));
          out.cjk = document.documentElement.lang === 'en' ? [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && /[一-鿿]/.test(e.textContent) && !e.closest('#langToggle') && !e.closest('.page-provenance')).map(e => e.textContent.slice(0, 40)).slice(0, 5) : [];
          out.canvases = [...document.querySelectorAll('canvas')].map(c => c.width > 1).every(Boolean);
          return out;
        });
        const tag = `${w}/${lang}`;
        if (errs.length) fails.push(`${tag} console: ${errs.join(' | ')}`);
        if (r.empty.length) fails.push(`${tag} empty readouts: ${r.empty.join(',')}`);
        if (r.overflow) fails.push(`${tag} horizontal overflow`);
        if (r.small.length) fails.push(`${tag} small targets: ${r.small.join(',')}`);
        if (r.cjk.length) fails.push(`${tag} CJK in English: ${r.cjk.join(' | ')}`);
        if (!r.canvases) fails.push(`${tag} a canvas never drew`);
        // drive a few controls
        await pg.evaluate(() => { const s = document.querySelector('#c6P'); s.value = '0.5'; s.dispatchEvent(new Event('input')); });
        const say6 = await pg.textContent('#c6Say');
        if (!/50/.test(say6)) fails.push(`${tag} ch6 fair sentence: ${say6}`);
        if (SHOTS && lang === 'zh') {
          fs.mkdirSync(SHOTS, { recursive: true });
          await pg.evaluate(() => window.scrollTo(0, 0));
          for (const id of ['lab1', 'lab3', 'lab4', 'lab5', 'lab5v', 'lab6', 'lab7', 'dg-lattice', 'dg-log']) {
            const el = await pg.$('#' + id); if (el) { await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(250); await el.screenshot({ path: path.join(SHOTS, `${w}-${id}.png`) }); }
          }
        }
        await ctx.close();
      }
    }
  } finally { await browser.close(); server.close(); }
  if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
  console.log('random-walks tests/browser.cjs: 1280 and 390, zh and en: no errors, readouts filled, no overflow, targets >= 48 px');
})();
