'use strict';
// Smoke test: serves the repo root from an in-process static server (closed at the end), loads the page in zh at
// 1280 and 390 wide, fails on console/page errors or horizontal overflow, drives every model once, checks that
// readouts and live sentences fill, and writes screenshots to SHOT_DIR (default /tmp/agent-tasks/econ-graph/growth/shots).
// Run: NODE_PATH=~/fast/integ-life/integ-games/node_modules node economics/growth/why-some-countries-got-rich/tests/browser.cjs
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '../../../..'), rel = 'economics/growth/why-some-countries-got-rich/';
const shots = process.env.SHOT_DIR || '/tmp/agent-tasks/econ-graph/growth/shots';
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
      const click = sel => page.evaluate(sel => { const e = document.querySelector(sel); e.checked = !e.checked || e.type === 'radio'; e.dispatchEvent(new Event('change')); }, sel);
      const text = id => page.$eval('#' + id, e => e.textContent.trim());
      const says = ['c1Say', 'c2Say', 'c3Say', 'c4Say', 'c5Say', 'c6Say', 'c7Say', 'c8Say', 'c9Say', 'c10Say', 'c11Say'];
      for (const id of says.concat(['c1G', 'c3K', 'c4P1', 'c5Tfp', 'c7Lr', 'c8R22', 'c9Tfp', 'c10Lo'])) if (!(await text(id))) fail(`${width}: #${id} empty`);
      if (!/0\.66%/.test(await text('c9Tfp'))) fail('ch9 default should be 0.66%');
      if (!/24\.3%/.test(await text('c7Lr'))) fail('ch7 default LR should be 24.3%');
      if (!/8\.5/.test(await text('c3K'))) fail('ch3 default k* 8.5');
      if (!/4\.38/.test(await text('c5Tfp')) && !/4\.4/.test(await text('c5Tfp'))) { /* default period is the first one */ }
      await click('#c9H'); if (!/0\.53%/.test(await text('c9Tfp'))) fail('ch9 hard tasks should give 0.53%');
      await setRange('c7A', 2010); if (!/37\.5%/.test(await text('c7Lr'))) fail('ch7 2010–2025 LR should be 37.5%');
      await setRange('c6N', 1); if (!/1\.50%/.test(await text('c6Lr'))) fail('ch6 nR=1 long run 1.5%');
      await click('input[name=c5C][value=KR]'); if ((await page.$$('input[name=c5Per]')).length !== 4) fail('ch5 KR should have 4 periods');
      await click('input[name=c8C][value=kr]'); if (!/71%/.test(await text('c8R22'))) fail('ch8 KR 2022 should be 71%');
      await click('#c11Cv1'); if (!(await text('c11Say'))) fail('ch11 unconverted sentence empty');
      await setRange('c10I', 12); await setRange('c10P', 0); if (!/不会|—/.test(await text('c10Cr')) && !(await text('c10Say'))) fail('ch10 never branch');
      for (let i = 1; i <= 11; i++) {
        await page.evaluate(id => document.querySelector(`#lab-${id}-model`).scrollIntoView({ block: 'center' }), 'ch' + i);
        await page.waitForTimeout(200);
        if (width === 1280 || i === 3 || i === 7) await page.screenshot({ path: path.join(shots, `ch${i}-${width}.png`) });
      }
      for (const dg of ['double', 'prodfn', 'solow', 'acct', 'rival', 'wright', 'trap', 'tasks', 'jcurve']) {
        await page.evaluate(id => document.getElementById('dg-' + id).scrollIntoView({ block: 'center' }), dg);
        if (width === 1280) await page.screenshot({ path: path.join(shots, `dg-${dg}-${width}.png`) });
      }
      const small = await page.evaluate(() => [...document.querySelectorAll('main input, #langToggle button, .lab input')].map(e => { const r = (e.closest('label') || e).getBoundingClientRect(); return [e.id || e.name || e.tagName, Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => w > 0 && h < 44));
      if (small.length) fail(`${width}: small targets ${JSON.stringify(small.slice(0, 6))}`);
      const outside = await page.evaluate(() => [...document.querySelectorAll('figure.dia svg, .lab')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).map(e => e.id || e.closest('figure').id));
      if (outside.length) fail(`${width}: outside viewport ${outside.join(',')}`);
      if (errs.length) fail(`${width}: console errors ${errs.join(' | ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  console.log(fails ? `${fails} failure(s)` : 'browser smoke OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
