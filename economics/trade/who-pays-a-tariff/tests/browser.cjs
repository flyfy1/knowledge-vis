'use strict';
// Browser smoke test for "Who pays a tariff". Starts its own static server on 127.0.0.1 (port ESSAY_PORT, default
// 18883) over the repo root and closes it at the end, so nothing is left running.
// Usage: NODE_PATH=~/fast/integ-life/integ-games/node_modules node economics/trade/who-pays-a-tariff/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes a desktop and a phone full-page screenshot (never into the repo).
// Checks (zh; English is a stub until translated): no console or page errors, no horizontal overflow at 1280/390/320,
// every control at least 48×48 px, diagrams present with labels inside the drawing and at least 11 px, every readout
// and live sentence filled, no raw keys or {placeholders}; then drives each model once and compares readouts with
// models.js; reduced motion jumps the animated models to their end state.
const { chromium } = require('playwright');
const http = require('http'), path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const PORT = +(process.env.ESSAY_PORT || 18883), SHOT = process.env.SHOT_DIR || '';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p); if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }); res.end(buf); });
});
const url = `http://127.0.0.1:${PORT}/economics/trade/who-pays-a-tariff/`;
const fails = []; let checks = 0;
const ok = (c, m) => { checks++; if (!c) fails.push(m); };
const f = (x, d) => M.fmt(x, d, 'zh');

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js|favicon|page-provenance/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(() => { try { localStorage.setItem('knowledge-lang', 'zh'); } catch (e) {} });
  await page.goto(url); await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (p, s) => p.$eval(s, e => e.textContent.trim());
const setRange = (p, id, v) => p.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);

(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const browser = await chromium.launch();
  try {
    for (const width of [1280, 390, 320]) {
      const page = await open(browser, width), tag = 'zh ' + width;
      for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(80); }
      ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === 10, `${tag}: 10 diagrams`);
      ok(await page.$$eval('figure.lab', s => s.length) === 9, `${tag}: 9 labs`);
      const dg = await page.evaluate(() => { const out = []; for (const fig of document.querySelectorAll('figure.dia[data-dg]')) { const svg = [...fig.querySelectorAll('svg')].find(s => getComputedStyle(s).display !== 'none'); if (!svg) { out.push(fig.dataset.dg + ' no svg'); continue; } const vb = svg.viewBox.baseVal, k = svg.getBoundingClientRect().width / vb.width; const boxes = []; for (const t of svg.querySelectorAll('text')) { const s = t.textContent.trim(); if (!s || /^dg\./.test(s)) { out.push(fig.dataset.dg + ' empty label'); continue; } const b = t.getBBox(); if (parseFloat(t.getAttribute('font-size')) * k < 10.9) out.push(`${fig.dataset.dg} "${s}" small`); if (b.x < -0.5 || b.x + b.width > vb.width + 0.5 || b.y < -0.5 || b.y + b.height > vb.height + 0.5) out.push(`${fig.dataset.dg} "${s}" outside`); boxes.push([s, b]); } for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i][1], b = boxes[j][1]; if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1) out.push(`${fig.dataset.dg} "${boxes[i][0]}" overlaps "${boxes[j][0]}"`); } } return out; });
      ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 6).join(' | ')}`);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
      const small = await page.evaluate(() => { const o = []; for (const e of document.querySelectorAll('button, input, .toc a, a.back')) { const r = (e.matches('input[type=checkbox]') ? e.closest('label') : e).getBoundingClientRect(); if (!r.width && !r.height) continue; if (r.width < 47.5 || r.height < 47.5) o.push(`${e.id || e.textContent.trim().slice(0, 10)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`); } return o; });
      ok(!small.length, `${tag}: targets under 48px: ${small.slice(0, 6).join(', ')}`);
      const outside = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { if (e.closest('defs') || e.closest('.tblwrap')) return false; const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + (e.getAttribute('class') || '') + (e.closest('figure') ? '@' + e.closest('figure').id : '')));
      ok(!outside.length, `${tag}: elements outside the viewport: ${outside.join(', ')}`);
      const raw = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, .read b, figure h3')].filter(e => /\{[a-zA-Z_]\w*\}|^[a-zA-Z]\w*(\.[\w-]+)+$/.test(e.textContent.trim())).map(e => e.id || e.tagName).slice(0, 5));
      ok(!raw.length, `${tag}: raw keys or placeholders: ${raw.join(', ')}`);
      const empty = await page.evaluate(() => [...document.querySelectorAll('.read b, .say')].filter(e => !e.textContent.trim()).map(e => e.id));
      ok(!empty.length, `${tag}: empty readouts: ${empty.join(', ')}`);
      ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
      if (SHOT && width !== 320) await page.screenshot({ path: `${SHOT}/full-zh-${width}.png`, fullPage: true });
      await page.close();
    }
    // drive each model once
    const page = await open(browser, 1280);
    ok((await text(page, '#e1Sp')).includes(f(M.elastic(0.4, 0.2).dspend * 100, 1)), 'elasticity: spending readout = model');
    await setRange(page, 'e1E', 1.5); ok((await text(page, '#e1Dq')).includes(f(M.elastic(1.5, 0.2).dq * 100, 1).replace('−', '')), 'elasticity: e 1.5 readout');
    ok((await text(page, '#i2Pb')).includes(f((M.incidence(1.5, 3, 0.25).Pb - 1) * 100, 1)), 'ch2: buyer price = model');
    await page.$eval('#i2Inf', e => e.click()); ok((await text(page, '#i2Pb')).includes('25.0'), 'ch2: small country passes the full tariff');
    ok((await text(page, '#l3Opt')).includes(f(M.optimalTariff(10).t, 1)), 'ch3: optimal tariff = model');
    await setRange(page, 'l3X', 21); ok((await text(page, '#l3Opt')).startsWith('0'), 'ch3: infinite elasticity → optimal 0');
    ok((await text(page, '#r4Pe')) === f(M.ricardo().pe, 3), 'ch4: clearing price = model');
    await setRange(page, 'r4C', 66.5); ok(/相对成本一样/.test(await text(page, '#r4Say')), 'ch4: equal relative costs sentence');
    ok((await text(page, '#b5Ca')).includes('3.6'), 'ch5: CA −3.6');
    await page.$eval('#b5Cv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.$eval('#b5Play', e => e.click()); await page.waitForTimeout(5600); ok(/三年后/.test(await text(page, '#b5Say')), 'ch5: shock plays to the end');
    ok((await text(page, '#d6Sc')).includes(f(M.divert().sC * 100, 1)), 'ch6: C share = model');
    ok((await text(page, '#t6tt')).includes(M.signed(M.retalMatrix(10, M.optimalTariff(10).t).tt.a, 0, 'zh')), 'ch6: matrix cell = model');
    await page.$eval('#k7Cv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.$eval('#k7Reset', e => e.click()); await page.$eval('#k7Play', e => e.click()); await page.waitForTimeout(9500);
    ok((await text(page, '#k7Sh')).includes(f(M.chokeAt(10).share * 100, 0)), 'ch7: plays to year 10');
    ok((await text(page, '#p8Rt')) === f(M.passthru().retail.b, 2), 'ch8: retail slope = model');
    { const before = await text(page, '#p8Say') + await text(page, '#p8Did'); await page.$eval('#p8Re', e => e.click()); await page.$eval('#p8N', e => { e.value = 2000; e.dispatchEvent(new Event('input', { bubbles: true })); }); ok((await text(page, '#p8Say') + await text(page, '#p8Did')) !== before, 'ch8: resample changes the draw'); }
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
    // reduced motion
    const rp = await open(browser, 1280, { reduce: true });
    await rp.$eval('#k7Reset', e => e.click()); await rp.$eval('#k7Play', e => e.click());
    ok((await text(rp, '#k7Sh')).includes(f(M.chokeAt(10).share * 100, 0)), 'reduced motion: chokepoint jumps to year 10');
    await rp.close();
  } finally { await browser.close(); server.close(); }
  console.log(`${checks - fails.length}/${checks} checks passed`);
  if (fails.length) { fails.forEach(m => console.error('FAIL ' + m)); process.exit(1); }
})();
