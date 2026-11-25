'use strict';
// Smoke test: serves the repo root from an in-process static server (closed at the end), loads the page in zh at
// 1280 and 390 wide, fails on console/page errors or horizontal overflow, drives every model once, checks that
// readouts and live sentences fill, and writes screenshots to SHOT_DIR (default /tmp/agent-tasks/econ-graph/why-banks-run/shots).
// Run: NODE_PATH=~/fast/integ-life/integ-games/node_modules node economics/money/why-banks-run/tests/browser.cjs
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '../../../..'), rel = 'economics/money/why-banks-run/';
const shots = process.env.SHOT_DIR || '/tmp/agent-tasks/econ-graph/why-banks-run/shots';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
let fails = 0; const fail = m => { fails++; console.error('FAIL ' + m); };
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  fs.mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const width of [1280, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: 'zh-CN', reducedMotion: 'reduce' });
      const page = await ctx.newPage(); const errs = [];
      page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
      page.on('pageerror', e => errs.push(String(e)));
      await page.addInitScript(() => { try { localStorage.setItem('knowledge-lang', 'zh'); } catch (e) {} });
      await page.goto(base + rel, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__essayReady === true);
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ov > 1) fail(`${width}: horizontal overflow ${ov}px`);
      const setRange = (id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); }, [id, v]);
      const text = id => page.$eval('#' + id, e => e.textContent.trim());
      for (const id of ['lvSay', 'ddSay', 'svSay', 'lcSay', 'lvSell', 'ddTipB', 'svMtm', 'lcRatio']) if (!(await text(id))) fail(`${width}: #${id} empty`);
      if (!/58/.test(await text('lvSay'))) fail('ch2 default sentence should say 58');
      if (!/倒/.test(await text('ddOut'))) fail('ch4 default should fail');
      await setRange('ddB', 20); if (!/没事/.test(await text('ddOut'))) fail('ch4 at 20% should survive');
      await setRange('ddB', 30);
      await setRange('svDy', 1); if (/资不抵债/.test(await text('svSay'))) fail('ch5 dy=1 should not be under water');
      await setRange('svDy', 2.5);
      await setRange('lcH', 10); if (!/不达标/.test(await text('lcSay'))) fail('ch7 hqla=10 should fail');
      await setRange('lcH', 40);
      for (const id of ['ch2', 'ch4', 'ch5', 'ch7']) {
        await page.evaluate(id => document.querySelector(`#lab-${id}-model`).scrollIntoView({ block: 'center' }), id);
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(shots, `${id}-${width}.png`) });
      }
      for (const dg of ['bs', 'cushion', 'dd', 'svb', 'def']) {
        await page.evaluate(id => document.getElementById('dg-' + id).scrollIntoView({ block: 'center' }), dg);
        await page.screenshot({ path: path.join(shots, `dg-${dg}-${width}.png`) });
      }
      // small targets
      const small = await page.evaluate(() => [...document.querySelectorAll('main input, main button, #langToggle button, .lab input, .lab button')].map(e => { const r = (e.closest('label') || e).getBoundingClientRect(); return [e.id || e.tagName, Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => w > 0 && (h < 44)));
      if (small.length) fail(`${width}: small targets ${JSON.stringify(small.slice(0, 6))}`);
      if (errs.length) fail(`${width}: console errors ${errs.join(' | ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  console.log(fails ? `${fails} failure(s)` : 'browser smoke OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
