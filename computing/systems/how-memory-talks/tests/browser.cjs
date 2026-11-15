'use strict';
// Browser smoke test for the DDR memory essay (how memory talks).
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18961 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-memory-talks/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (English is a
// stub: the page falls back to Chinese and says so in <html lang>), keyboard operation of a slider, each of the
// models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18961').replace(/\/$/, '');
const url = base + '/computing/systems/how-memory-talks/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const ns = (x, d) => zf(x, d) + ' 纳秒';
const gbs = (x, d) => zf(x, d) + ' GB/s';
const ps = (x, d) => zf(x, d) + ' 皮秒';
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
    ok(await page.$$eval('figure.dia svg', s => s.length) >= 6, `${tag}: at least six diagrams`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
      if (e.closest('svg') || e.closest('pre.code')) return false;
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
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .bits, .sets, .cores, .trail')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
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
    ok((await text(page, 'h1')) === '内存是怎么和 CPU 说话的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch4', e => e.textContent)).includes(zf(P.cl5x[0], 1)), 'ch4 prose quotes CL32 at 6400 in ns from the model');
    ok((await page.$$eval('#clRows tr', r => r.length)) === M.BIN_ORDER.length, 'ch4 table has one row per speed bin');

    // ch1 refresh
    await show(page, '#rfCv', 200);
    const r16 = M.refresh('ddr5', 16, false, 'ab');
    ok((await text(page, '#rfB')) === pct(r16.busy, 1), 'ch1 default DDR5 16 Gb busy, got ' + await text(page, '#rfB'));
    const h1 = await canvasHash(page, 'rfCv');
    await click(page, '#rfHot'); await page.waitForTimeout(80);
    ok((await text(page, '#rfB')) === pct(M.refresh('ddr5', 16, true, 'ab').busy, 1), 'ch1 hot doubles busy');
    ok(h1 !== await canvasHash(page, 'rfCv'), 'ch1 canvas redraws');
    await click(page, '#rfHot'); await pick(page, 'rfM', 'sb'); await page.waitForTimeout(60);
    ok((await text(page, '#rfE')) === ns(M.refresh('ddr5', 16, false, 'sb').extra, 1), 'ch1 same-bank refresh extra wait');
    await pick(page, 'rfC', 'd4_8'); await page.waitForTimeout(60);
    ok((await text(page, '#rfR')) === ns(350, 0) && await page.$eval('input[name=rfM][value=sb]', e => e.disabled), 'ch1 DDR4 8 Gb tRFC, refresh modes disabled');

    // ch2 address
    await show(page, '#adA', 150);
    ok((await text(page, '#adR')) === zf(P.mRow[0], 0), 'ch2 default row, got ' + await text(page, '#adR'));
    ok((await text(page, '#adB')) === `${P.mBg[0]} · ${P.mBa[0]}`, 'ch2 default bank group and bank, got ' + await text(page, '#adB'));
    await pick(page, 'adS', 'bgfirst'); await page.waitForTimeout(40);
    const mb = M.mapAddr(M.parseHex(M.ADDR.def), 'bgfirst', 2, 1);
    ok((await text(page, '#adR')) === zf(mb.row, 0) && (await page.$eval('#adSay', e => e.textContent)).includes('下一个 bank 组'), 'ch2 bank-group-first split');
    await page.fill('#adA', 'zz'); await page.waitForTimeout(40);
    ok((await page.$eval('#adSay', e => e.textContent)).includes('十六进制'), 'ch2 bad input sentence');
    await page.fill('#adA', '0xFFFFFFFFFF'); await page.waitForTimeout(40);
    ok((await page.$eval('#adSay', e => e.textContent)).includes('装不下'), 'ch2 address too large');
    await page.fill('#adA', M.ADDR.def);

    // ch3 simulator
    await show(page, '#c3Cv', 200);
    ok((await text(page, '#c3L')) === ns(P.sRlat[0], 1), 'ch3 default random open-page latency, got ' + await text(page, '#c3L'));
    const h3 = await canvasHash(page, 'c3Cv');
    await pick(page, 'c3P', 'close'); await page.waitForTimeout(80);
    ok((await text(page, '#c3L')) === ns(P.sRclat[0], 1), 'ch3 random close-page, got ' + await text(page, '#c3L'));
    ok(h3 !== await canvasHash(page, 'c3Cv'), 'ch3 canvas redraws');
    await pick(page, 'c3P', 'open'); await pick(page, 'c3T', 'stream'); await page.waitForTimeout(80);
    ok((await text(page, '#c3L')) === ns(P.sSlat[0], 1) && (await text(page, '#c3G')) === gbs(M.ch3('stream', 'open', 'ddr5-6400b').flood.gbps, 1), 'ch3 stream, got ' + await text(page, '#c3L'));
    await pick(page, 'c3T', 'pingpong'); await page.waitForTimeout(80);
    ok((await text(page, '#c3L')) === ns(P.sPlat[0], 1), 'ch3 ping-pong');
    await pick(page, 'c3B', 'ddr4-3200aa'); await pick(page, 'c3T', 'random'); await page.waitForTimeout(80);
    ok((await text(page, '#c3L')) === ns(M.ch3('random', 'open', 'ddr4-3200aa').chain.avgLat * M.timing('ddr4-3200aa').tck, 1), 'ch3 DDR4-3200 random (16 banks), got ' + await text(page, '#c3L'));

    // ch4 CL calculator
    await show(page, '#clCv', 200);
    ok((await text(page, '#clN')) === ns(P.cl5x[0], 2), 'ch4 default CL32 at 6400, got ' + await text(page, '#clN'));
    ok((await page.$eval('#clSay', e => e.textContent)).includes('一样'), 'ch4 same as DDR4-3200 CL16');
    await page.focus('#clC'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60);
    ok((await text(page, '#clCo')) === '34' && (await page.$eval('#clSay', e => e.textContent)).includes('长'), 'ch4 CL slider by keyboard: 34 is slower');
    await setRange(page, 'clM', 3200); await setRange(page, 'clC', 22); await page.waitForTimeout(60);
    ok((await text(page, '#clN')) === ns(P.cl43[0], 2), 'ch4 DDR4-3200 CL22');

    // ch5 bandwidth
    await show(page, '#bwCv', 200);
    const b8 = M.bandwidth(8, 0.5);
    ok((await text(page, '#bwG')) === gbs(b8.gbps, 1), 'ch5 default 8 banks, 50%, got ' + await text(page, '#bwG'));
    await pick(page, 'bwB', '1'); await setRange(page, 'bwH', 0); await page.waitForTimeout(100);
    ok((await text(page, '#bwG')) === gbs(P.bw1_0[0], 1), 'ch5 one bank, no hits, got ' + await text(page, '#bwG'));
    await pick(page, 'bwB', '32'); await setRange(page, 'bwH', 1); await page.waitForTimeout(100);
    ok((await text(page, '#bwF')) === pct(M.bandwidth(32, 1).frac, 0), 'ch5 32 banks, all hits, got ' + await text(page, '#bwF'));

    // ch6 bank groups
    await show(page, '#bgCv', 200);
    ok((await text(page, '#bgF')) === pct(P.g1_64[0], 0) && (await text(page, '#bgL')) === zf(P.ccdl64[0], 0) + ' 周期', 'ch6 default one group at 6400, got ' + await text(page, '#bgF'));
    await pick(page, 'bgG', '2'); await page.waitForTimeout(80);
    ok((await text(page, '#bgF')) === pct(P.g2_64[0], 0), 'ch6 two groups');
    ok(await page.$eval('#bgX', e => e.disabled), 'ch6 x16 disabled until new rows');
    await pick(page, 'bgG', '8'); await click(page, '#bgN'); await click(page, '#bgX'); await page.waitForTimeout(80);
    ok((await text(page, '#bgF')) === pct(P.gn2k[0], 0) && (await page.$eval('#bgSay', e => e.textContent)).includes('tFAW'), 'ch6 new rows, 2 KB pages: tFAW binds');

    // ch7 fly-by
    await show(page, '#fyCv', 200);
    ok((await text(page, '#fyA')) === ps(P.flySpan[0], 0), 'ch7 default span, got ' + await text(page, '#fyA'));
    await setRange(page, 'fyM', 400); await page.waitForTimeout(60);
    ok((await page.$eval('#fySay', e => e.textContent)).includes('统一的时刻'), 'ch7 400 MT/s needs no per-chip timing');

    // ch8 ECC
    await show(page, '#ecCv', 200);
    ok((await text(page, '#ecS')) === pct(P.e2sil[0], 0), 'ch8 default SEC, 2 errors, silent share, got ' + await text(page, '#ecS'));
    await pick(page, 'ecC', 'secded'); await page.waitForTimeout(60);
    ok((await text(page, '#ecD')) === pct(P.d2due[0], 0), 'ch8 SECDED detects every double error');
    const ex0 = await text(page, '#ecExT'); await click(page, '#ecEx'); await page.waitForTimeout(40);
    ok(ex0 !== await text(page, '#ecExT') && (await text(page, '#ecExT')).length > 6, 'ch8 example button draws a new pattern');
    await pick(page, 'ecK', '1'); await page.waitForTimeout(40);
    ok((await text(page, '#ecF')) === '100%', 'ch8 one error always fixed');

    // ch9 PAM3
    await show(page, '#sgCv', 200);
    ok((await text(page, '#sgB')) === 'PAM3', 'ch9 default 32 Gb/s: PAM3 best, got ' + await text(page, '#sgB'));
    await setRange(page, 'sgG', 16); await page.waitForTimeout(60);
    ok((await text(page, '#sgB')) === 'NRZ', 'ch9 16 Gb/s: NRZ best');
    await setRange(page, 'sgG', 48); await setRange(page, 'sgK', 2.4); await page.waitForTimeout(60);
    ok((await text(page, '#sgB')) === 'PAM4', 'ch9 48 Gb/s, steep loss: PAM4 best');

    // ch10 row hammer
    await show(page, '#rhCv', 200);
    ok((await text(page, '#rhW')) === zf(P.rhT10[0] * 1000, 0) && (await text(page, '#rhF')) === zf(P.rhT10f[0], 0), 'ch10 default 10 aggressors, TRR, got ' + await text(page, '#rhW'));
    const h10 = await canvasHash(page, 'rhCv');
    await pick(page, 'rhM', 'prac'); await pick(page, 'rhH', '4800'); await page.waitForTimeout(150);
    ok((await text(page, '#rhW')) === zf(P.rhP10[0], 0) && (await text(page, '#rhF')) === '0', 'ch10 PRAC at 4800');
    ok(h10 !== await canvasHash(page, 'rhCv'), 'ch10 canvas redraws');
    await setRange(page, 'rhN', 2); await pick(page, 'rhM', 'none'); await pick(page, 'rhH', '139000'); await page.waitForTimeout(150);
    ok((await text(page, '#rhW')) === zf(P.rhWorstN[0] * 1000, 0) && (await text(page, '#rhX')) === '—', 'ch10 no mitigation, two aggressors');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#rhCv', 400);
    const a = await canvasHash(page, 'rhCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'rhCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#rhW')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, eleven diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, ten models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
