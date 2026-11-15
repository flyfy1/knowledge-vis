'use strict';
// Browser smoke test for the essay on how a GPU computes.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18971 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-a-gpu-computes/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (zh and en; a
// stub copy.en.js would fall back to Chinese and say so in <html lang>), keyboard operation of a slider, each of the
// models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18971').replace(/\/$/, '');
const url = base + '/computing/systems/how-a-gpu-computes/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const pct = (x, d) => zf(x * 100, d == null ? 0 : d) + '%';

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { window.__ft = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const click = (page, sel) => page.$eval(sel, e => e.click());
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

// every static diagram: role, aria, labels non-empty, inside the viewBox, no two labels overlapping, ≥ 11 px rendered
function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg) { out.push(name + ': no svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(name + ': role');
    const al = svg.getAttribute('aria-label') || '';
    if (al.length < 8 || /^dg\./.test(al)) out.push(name + ': aria-label "' + al + '"');
    const cap = fig.querySelector('figcaption'); if (!cap || cap.textContent.trim().length < 8) out.push(name + ': caption');
    const vb = svg.viewBox.baseVal, k = svg.getBoundingClientRect().width / vb.width;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      const s = t.textContent.trim();
      if (!s || /^dg\./.test(s) || /\{\w+\}/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
      const b = t.getBBox(), fs = parseFloat(t.getAttribute('font-size')) * k;
      if (fs < 11) out.push(`${name}: "${s.slice(0, 12)}" renders at ${fs.toFixed(1)}px`);
      if (b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5) out.push(`${name}: "${s.slice(0, 14)}" outside the drawing`);
      boxes.push([s, b]);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [s1, a] = boxes[i], [s2, b] = boxes[j], pad = 1;
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ix > pad && iy > pad) out.push(`${name}: "${s1.slice(0, 12)}" overlaps "${s2.slice(0, 12)}"`);
    }
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const stub = await (async () => { const p = await open(browser, 1280); const s = await p.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.enStub)); await p.close(); return s; })();
  const langs = stub ? ['zh'] : ['zh', 'en'];
  if (stub) console.log('NOTE: copy.en.js is a stub; English width sweep skipped');

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of langs) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia svg', s => s.length) === 11, `${tag}: eleven diagrams (at least six required)`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
      if (e.closest('svg') || e.closest('pre')) return false;
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => {
      const out = [];
      const boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
      if (e.closest('svg')) return false;
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.[\w-]+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .duo, .steps, .st4, .lit, .trail')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
    if (lang === 'en') {
      const leftovers = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = walker.nextNode());) {
          const el = n.parentElement; if (!rx.test(n.textContent)) continue;
          if (el.closest('#langToggle') && n.textContent.trim() === '中') continue;
          const pz = el.closest('.page-provenance .provenance-zh'); if (pz && getComputedStyle(pz).display === 'none') continue;
          out.push('text "' + n.textContent.trim().slice(0, 24) + '"');
        }
        for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria ' + e.getAttribute('aria-label').slice(0, 24));
        if (rx.test(document.title)) out.push('title');
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas "' + t + '"');
        return out.slice(0, 8);
      }, CJK.source);
      ok(!leftovers.length, `${tag}: Chinese left in English mode: ${leftovers.join(' | ')}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) {
      await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
      for (const fig of await page.$$('figure')) {
        const id = await fig.evaluate(e => e.dataset.dg ? 'dg-' + e.dataset.dg : 'lab-' + (e.closest('section') || {}).id + '-' + [...e.closest('section').querySelectorAll('figure.lab')].indexOf(e));
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    const P = M.prose();
    const tf = x => zf(x, x < 1 ? 2 : x < 100 ? 1 : 0) + ' TFLOPS';
    ok((await text(page, 'h1')) === 'GPU 是怎么算的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch3', e => e.textContent)).includes(pct(P.rr1640[0], 0)), 'ch3 prose quotes the round-robin result from the model');
    ok((await page.$eval('#ch7', e => e.textContent)).includes(zf(P.mmX[0], 0) + ' 倍'), 'ch7 prose quotes the tiling speed-up');

    // ch1 caches or threads
    await show(page, '#hCv', 150);
    { const r = M.hide(10, 0.95, 8);
      ok((await text(page, '#hAmat')) === zf(r.amat, 1) + ' 拍' && (await text(page, '#hCpu')) === pct(r.uCpu, 1) && (await text(page, '#hGpu')) === pct(r.uGpu, 1) && (await text(page, '#hNeed')) === '49', 'ch1 default readouts, got ' + await text(page, '#hGpu')); }
    const h1 = await canvasHash(page, 'hCv');
    await setRange(page, 'hN', 6); await page.waitForTimeout(80);
    ok((await text(page, '#hGpu')) === '100.0%' && (await page.$eval('#hSay', e => e.textContent)).length > 10, 'ch1 49 threads fill the unit');
    ok(h1 !== await canvasHash(page, 'hCv'), 'ch1 canvas redraws');
    await page.focus('#hH'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60);
    ok((await text(page, '#hHo')) === '99%', 'ch1 hit-rate slider by keyboard to 99 %, got ' + await text(page, '#hHo'));

    // ch2 image to grid
    await show(page, '#mCv', 150);
    ok((await text(page, '#mGrid')) === '120 × 68 = 8,160' && (await text(page, '#mTid')) === '(5, 3) → 53' && (await text(page, '#mWarp')) === '1 号 · 第 21 个', 'ch2 default 1920×1080, 16×16, pixel (21, 3)');
    await pick(page, 'mBlk', '32x8'); await page.waitForTimeout(60);
    ok((await text(page, '#mIdle')).startsWith('0') && (await text(page, '#mWarp')) === '3 号 · 第 21 个', 'ch2 32×8: no idle threads, pixel (21, 3) in warp 3, got ' + await text(page, '#mWarp'));
    await pick(page, 'mImg', 'sq'); await page.waitForTimeout(60);
    ok(+(await page.$eval('#mPx', e => e.max)) === 999, 'ch2 1000×1000: slider range follows the image');

    // ch3 scheduler
    await show(page, '#sCv', 150);
    { const r = M.warpSim(8, 20, 479, 'gto');
      ok((await text(page, '#sBusy')) === pct(r.busy, 1) && (await text(page, '#sClosed')) === pct(P.s820[0], 1) && (await text(page, '#sNeed')) === zf(P.n20g[0], 0), 'ch3 default 8 warps, k = 20, global, got ' + await text(page, '#sBusy')); }
    await setRange(page, 'sN', 16); await setRange(page, 'sK', 3); await page.waitForTimeout(60);
    ok((await text(page, '#sBusy')) === '100.0%', 'ch3 16 warps, k = 40: full');
    const h3 = await canvasHash(page, 'sCv');
    await pick(page, 'sPol', 'rr'); await page.waitForTimeout(100);
    ok((await text(page, '#sBusy')) === pct(M.warpSim(16, 40, 479, 'rr').busy, 1) && (await page.$eval('#sSay', e => e.textContent)).includes('轮流'), 'ch3 round robin falls short, got ' + await text(page, '#sBusy'));
    ok(h3 !== await canvasHash(page, 'sCv'), 'ch3 canvas redraws on policy change');
    await pick(page, 'sPol', 'gto'); await pick(page, 'sL', 'shared'); await page.waitForTimeout(60);
    ok((await text(page, '#sLat')) === '29 拍', 'ch3 shared-memory latency preset');
    // occupancy
    await show(page, '#oCv', 150);
    ok((await text(page, '#oW')) === '32' && (await text(page, '#oOcc')) === '50%' && (await text(page, '#oLim')) === '寄存器', 'ch3 occupancy default: 32 warps, registers');
    await click(page, '#oSend'); await page.waitForTimeout(400);
    ok((await text(page, '#sNo')) === '8', 'ch3 "send" sets the scheduler to 8 warps');
    await pick(page, 'oT', '1024'); await setRange(page, 'oR', 8); await page.waitForTimeout(60);
    ok((await text(page, '#oLim')) === '—' && await page.$eval('#oSend', e => e.disabled), 'ch3 1024 × 128 registers: does not launch, button disabled');
    await setRange(page, 'oR', 2); await page.waitForTimeout(60);
    ok((await text(page, '#oW')) === '64' && (await text(page, '#oOcc')) === '100%', 'ch3 1024 × 32 registers: 64 warps');

    // ch4 divergence
    await show(page, '#dCv', 150);
    ok((await text(page, '#dEff')) === pct(P.d05[0], 1) && (await text(page, '#dCyc')) === zf(P.dCyc05[0], 1) + ' 拍', 'ch4 default 5 %');
    ok((await page.$$eval('#dLanes span', s => s.length)) === 32, 'ch4 32 lanes drawn');
    const lanes = await page.$eval('#dLanes', e => e.innerHTML); await click(page, '#dRe'); await click(page, '#dRe'); await click(page, '#dRe'); await page.waitForTimeout(40);
    ok(lanes !== await page.$eval('#dLanes', e => e.innerHTML), 'ch4 redraw draws a new warp (three new seeds)');
    ok(/^\d+ \/ 32$/.test(await text(page, '#dNA')), 'ch4 this warp: n / 32');
    await pick(page, 'dM', 'warp'); await page.waitForTimeout(40);
    ok((await text(page, '#dEff')) === '100.0%', 'ch4 warp-uniform: 100 %');

    // ch5 coalescing
    await show(page, '#cCv', 150);
    ok((await text(page, '#cSec')) === '8' && (await text(page, '#cEff')) === '50.0%', 'ch5 default stride 2');
    await setRange(page, 'cX', 4); await page.waitForTimeout(40);
    ok((await text(page, '#cSec')) === '32' && (await text(page, '#cBw')) === zf(P.c8bw[0], 2) + ' TB/s', 'ch5 stride 8: 32 sectors');
    await pick(page, 'cP', 'seq'); await page.waitForTimeout(40);
    ok((await text(page, '#cSec')) === '4' && await page.$eval('#cX', e => e.disabled), 'ch5 sequential: 4 sectors, slider off');
    await pick(page, 'cP', 'rows'); await page.waitForTimeout(40);
    ok((await text(page, '#cSec')) === '4' && (await text(page, '#cLin')) === '2', 'ch5 two rows of 16');

    // ch6 banks
    await show(page, '#bCv', 150);
    ok((await text(page, '#bCyc')) === '2 拍', 'ch6 default stride 2: two-way');
    await setRange(page, 'bS', 9); await page.waitForTimeout(40);
    ok((await text(page, '#bCyc')) === '1 拍', 'ch6 stride 33: no conflict');
    await pick(page, 'bM', 'tile'); await page.waitForTimeout(40);
    ok((await text(page, '#bCyc')) === '32 拍' && await page.$eval('#bS', e => e.disabled), 'ch6 32×32 column: 32-way');
    await page.$eval('#bPad', e => e.click()); await page.waitForTimeout(40);
    ok((await text(page, '#bCyc')) === '1 拍', 'ch6 padded: conflict-free');

    // ch7 tiled multiply
    await show(page, '#tCv', 150);
    ok((await text(page, '#tAtt')) === tf(P.mm32[0]), 'ch7 default T = 32, r = 1, got ' + await text(page, '#tAtt'));
    await pick(page, 'tT', '128'); await pick(page, 'tR', '8'); await page.waitForTimeout(60);
    ok((await text(page, '#tAtt')) === tf(67) && (await text(page, '#tBlk')) === '256 个 · 32 KB', 'ch7 T = 128, r = 8: peak');
    await pick(page, 'tT', '1'); await page.waitForTimeout(40);
    ok((await text(page, '#tAtt')) === tf(P.mmNaive[0]) && await page.$eval('input[name=tR][value="8"]', e => e.disabled), 'ch7 untiled: r locked to 1');
    await pick(page, 'tT', '64'); await page.waitForTimeout(40);
    ok((await text(page, '#tAtt')) === '—' && (await page.$eval('#tSay', e => e.textContent)).includes('1024'), 'ch7 T = 64, r = 1: too many threads');

    // ch8 formats
    await show(page, '#gCv', 150);
    ok((await text(page, '#gAtt')) === zf(P.g256[0], 0) + ' TFLOPS' && (await text(page, '#gShare')) === pct(P.g256s[0], 0), 'ch8 default H100 FP8 N = 256');
    await setRange(page, 'gN', 5); await page.waitForTimeout(40);
    ok((await text(page, '#gShare')) === '100%', 'ch8 N = 4096: at peak');
    await pick(page, 'gG', 'b200'); await pick(page, 'gF', 'fp32'); await page.waitForTimeout(40);
    ok((await text(page, '#gAtt')) === '—' && (await page.$eval('#gSay', e => e.textContent)).length > 10, 'ch8 B200 FP32: not listed');
    await pick(page, 'gF', 'fp4'); await setRange(page, 'gN', 2); await page.waitForTimeout(40);
    ok((await text(page, '#gShare')) === pct(P.b512s[0], 0), 'ch8 B200 FP4 N = 512');

    // ch9 raster
    await show(page, '#rCv', 150);
    ok((await text(page, '#rCov')) === '7' && (await text(page, '#rEff')) === pct(M.raster(4).quadEff, 0), 'ch9 default s = 4');
    await setRange(page, 'rS', 9); await page.waitForTimeout(40);
    ok((await text(page, '#rCov')) === zf(P.r32c[0], 0) && (await text(page, '#rW')) === zf(P.r32w[0], 0), 'ch9 s = 32');
    await setRange(page, 'rS', 0); await page.waitForTimeout(40);
    ok((await text(page, '#rCov')) === '1' && (await text(page, '#rEff')) === '25%', 'ch9 s = 1: one pixel, a quarter of the quad');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll, nothing animates (the page has no animation), diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#sCv', 400);
    const a = await canvasHash(page, 'sCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'sCv'), 'reduced motion: canvas is still');
    await show(page, '#oCv', 200); await click(page, '#oSend'); await page.waitForTimeout(80);
    ok((await text(page, '#sNo')) === '8', 'reduced motion: "send" still works (instant scroll)');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, eleven diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, every model driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
