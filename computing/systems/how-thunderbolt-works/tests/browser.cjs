'use strict';
// Browser smoke test for the Thunderbolt essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18936 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-thunderbolt-works/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled, and the
// STANDARD §4a diagram checks (nine SVGs present with role=img and an aria-label, labels non-empty, inside the SVG,
// not overlapping one another, rendered at 11 px or more). Then the language toggle (English is a stub: the page
// falls back to Chinese), keyboard operation of a slider, each of the eight models responding to its controls with
// the numbers the models give, and reduced motion. When copy.en.js is translated (enStub removed), the width sweep
// also runs in English and checks that no Chinese is left, including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18936').replace(/\/$/, '');
const url = base + '/computing/systems/how-thunderbolt-works/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const mb = x => zf(x, 0) + ' MB/s';
const DG = ['dgPin', 'dgRouter', 'dgHdr', 'dgDock', 'dgChain', 'dgLanes', 'dgAlt', 'dgPd', 'dgIommu'];

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
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

// STANDARD §4a: per diagram, labels present, inside, not overlapping, ≥ 11 px rendered
const diagramProblems = (page, ids) => page.evaluate(ids => {
  const out = [];
  for (const id of ids) {
    const fig = document.getElementById(id), svg = fig && fig.querySelector('svg');
    if (!svg) { out.push(id + ': no svg'); continue; }
    if (svg.getAttribute('role') !== 'img' || !(svg.getAttribute('aria-label') || '').trim()) out.push(id + ': role/aria-label');
    if (!(fig.querySelector('figcaption').textContent || '').trim()) out.push(id + ': empty caption');
    const vb = svg.viewBox.baseVal, k = svg.getBoundingClientRect().width / vb.width, sr = svg.getBoundingClientRect();
    const ts = [...svg.querySelectorAll('text')];
    if (ts.length < 3) out.push(id + ': too few labels');
    const boxes = [];
    for (const t of ts) {
      const s = t.textContent.trim();
      if (!s) { out.push(id + ': empty label'); continue; }
      const px = parseFloat(t.getAttribute('font-size')) * k;
      if (px < 10.95) out.push(`${id}: "${s}" renders at ${px.toFixed(1)} px`);
      const r = t.getBoundingClientRect();
      if (r.left < sr.left - 1 || r.right > sr.right + 1 || r.top < sr.top - 1 || r.bottom > sr.bottom + 1) out.push(`${id}: "${s}" runs outside the svg`);
      boxes.push([s, r]);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [a, A] = boxes[i], [b, B] = boxes[j];
      const ix = Math.min(A.right, B.right) - Math.max(A.left, B.left), iy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (ix > 1.5 && iy > 1.5) out.push(`${id}: "${a}" overlaps "${b}"`);
    }
  }
  return out;
}, ids);

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
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td, table.pdo td')].filter(e => {
      if (e.closest('pre.hex') || e.closest('svg')) return false;
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
      if (e.closest('pre.hex') || e.closest('.tscroll')) return false;
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const rawSvg = await page.evaluate(() => [...document.querySelectorAll('figure.dg text')].filter(e => /^(dg\d|u)\.\w+/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!rawSvg.length, `${tag}: raw keys in diagrams: ${rawSvg.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const dg = await diagramProblems(page, DG);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    if (lang === 'en') {
      const leftovers = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = walker.nextNode());) {
          const el = n.parentElement; if (!rx.test(n.textContent)) continue;
          if (el.closest('#langToggle') && n.textContent.trim() === '中') continue;
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
    if (SHOT) await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
    await page.close();
  }

  // diagrams are laid out for the width they are drawn at: resizing redraws them and the checks still hold
  {
    const page = await open(browser, 1280);
    await page.setViewportSize({ width: 360, height: 800 }); await page.waitForTimeout(400);
    const dg = await diagramProblems(page, DG);
    ok(!dg.length, `resize 1280→360: diagrams: ${dg.slice(0, 6).join(' | ')}`);
    ok(await page.$eval('#dgPin .svgbox', e => +e.dataset.w) < 400, 'resize redraws the pinout in its portrait layout');
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    const P = M.prose();
    ok((await text(page, 'h1')) === '雷电接口是怎么工作的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    ok((await page.$$eval('#dgPin text', ts => ts.length)) > 24, 'diagrams redrawn after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch3', e => e.textContent)).includes(zf(P.s0drive[0], 0) + ' MB/s'), 'ch3 prose quotes the shared-link drive speed from the model');
    ok((await page.$eval('#ch6', e => e.textContent)).includes(zf(P.pclk4k[0], 2) + ' MHz'), 'ch6 prose quotes the CVT pixel clock from the model');
    ok((await page.$$eval('#dgPin text', ts => ts.map(t => t.textContent))).join(' ').includes('CC1'), 'pinout diagram shows CC1');

    // ch1 CC: flip moves the divider to CC2; corners stay in their windows
    await show(page, '#ccCv', 200);
    ok((await text(page, '#ccP')) === 'TX2 / RX2', 'ch1 default (flipped) uses TX2/RX2');
    await pick(page, 'ccO', 'n'); await page.waitForTimeout(60);
    ok((await text(page, '#ccP')) === 'TX1 / RX1' && (await text(page, '#ccV1')) === zf(M.CC.v('a30'), 2) + ' V', 'ch1 normal plug: CC1 carries the divider');
    for (const rp of ['usb', 'a15', 'a30']) for (const k of ['lo', 'hi']) {
      await pick(page, 'ccRp', rp); await pick(page, 'ccK', k); await page.waitForTimeout(30);
      ok(!/认不出/.test(await text(page, '#ccSay')), `ch1 ${rp} ${k}: Sink recognises the level`);
    }
    await page.$eval('#ccE', e => e.click()); await page.waitForTimeout(40);
    ok((await text(page, '#ccV2')) === '悬空', 'ch1 unmarked cable: the other CC pin is open');

    // ch2 header: keyboard on HopID, Appendix A example, and a flipped bit is corrected
    await show(page, '#pkCv', 200);
    await setRange(page, 'pkPdf', 1); await setRange(page, 'pkHop', 1); await setRange(page, 'pkLen', 8); await page.waitForTimeout(40);
    ok((await text(page, '#pkH')) === '10 01 08 DA', 'ch2 Appendix A third example 10 01 08 → DA, got ' + await text(page, '#pkH'));
    await page.focus('#pkHop'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(40);
    ok((await text(page, '#pkH')).startsWith('10 02 08'), 'ch2 HopID slider responds to the keyboard');
    await setRange(page, 'pkErr', 12); await page.waitForTimeout(40);
    ok((await text(page, '#pkSay')).includes('第 11 位'), 'ch2 flipped bit 11 is named in the sentence');
    ok((await page.$eval('#pkHex', e => e.textContent)).includes('第 11 位'), 'ch2 syndrome points at bit 11');
    await setRange(page, 'pkLen', 5); await page.waitForTimeout(40);
    ok((await text(page, '#pkE')) === zf(M.PKT.eff(5) * 100, 1) + '%', 'ch2 5-byte efficiency');

    // ch3 sharing
    await show(page, '#shCv', 200);
    ok((await text(page, '#shX')) === mb(P.s0drive[0]), 'ch3 default drive speed ' + await text(page, '#shX'));
    await pick(page, 'shR', 'read'); await page.waitForTimeout(40);
    ok((await text(page, '#shX')) === mb(P.sReadDrive[0]), 'ch3 reading does not compete with the display');
    await pick(page, 'shL', 'tb5bb'); await pick(page, 'shD', 'k6_60x2'); await page.waitForTimeout(40);
    ok((await text(page, '#shX')) === mb(P.s5bbr[0]), 'ch3 boost hurts reads');
    await pick(page, 'shR', 'write'); await page.waitForTimeout(40);
    ok((await text(page, '#shX')) === mb(P.s5bbw[0]), 'ch3 boost helps writes');

    // ch4 chain
    await show(page, '#chCv', 200);
    ok((await text(page, '#chE')) === mb(P.ch3each[0]), 'ch4 three drives share');
    await setRange(page, 'chN', 7); await page.waitForTimeout(40);
    ok((await text(page, '#chLv')) === '5 / 7', 'ch4 USB4 keeps five');
    await pick(page, 'chM', 'tbt3'); await page.waitForTimeout(40);
    ok((await text(page, '#chLv')) === '6 / 7', 'ch4 TBT3 mode keeps six');
    await page.waitForTimeout(120); const h0 = await canvasHash(page, 'chCv'); await page.$eval('#chDp', e => e.click());
    // wait for the next frames to repaint (polls up to 1 s; the canvas redraws on requestAnimationFrame)
    let h1 = h0; for (let i = 0; i < 20 && h1 === h0; i++) { await page.waitForTimeout(50); h1 = await canvasHash(page, 'chCv'); }
    ok(h0 !== h1, 'ch4 display checkbox redraws');

    // ch5 lanes
    await show(page, '#lnCv', 200);
    ok((await text(page, '#lnD')) === zf(P.g4down[0], 1) + ' Gb/s', 'ch5 Gen 4 down');
    await pick(page, 'lnM', 'g4asym'); await page.waitForTimeout(40);
    ok((await text(page, '#lnD')) === zf(P.g4asymDown[0], 1) + ' Gb/s' && (await text(page, '#lnU')) === zf(P.g4asymUp[0], 1) + ' Gb/s', 'ch5 asymmetric');
    await pick(page, 'lnM', 'tbt3'); await page.waitForTimeout(40);
    ok((await text(page, '#lnSay')).includes('20.625'), 'ch5 TBT3 sentence');

    // ch6 screens
    await show(page, '#scCv', 200);
    ok((await text(page, '#scF')) === '1 / 2', 'ch6 Max Link BW lights one of two 4K');
    await pick(page, 'scT', 'bwalloc'); await page.waitForTimeout(40);
    ok((await text(page, '#scF')) === '2 / 2', 'ch6 allocation mode lights both');
    await pick(page, 'scC', 'alt2'); await page.waitForTimeout(40);
    ok(await page.$eval('input[name=scT]', e => e.disabled), 'ch6 method disabled for Alt Mode');
    ok((await text(page, '#scF')) === '0 / 2' || (await text(page, '#scF')) === '1 / 2', 'ch6 Alt Mode 2 lanes, got ' + await text(page, '#scF'));
    await pick(page, 'scC', 'tb5'); await pick(page, 'scM', 'k6_60'); await pick(page, 'scB', '30'); await page.waitForTimeout(40);
    ok((await text(page, '#scF')) === `${P.sc6k30[0]} / 2`, 'ch6 TB5 two 6K at 30 bpp');
    await pick(page, 'scC', 'tb5bb'); await page.waitForTimeout(40);
    ok((await text(page, '#scF')) === `${P.sc6k30bb[0]} / 2`, 'ch6 TB5 boost two 6K at 30 bpp');

    // ch7 PD
    await show(page, '#pdT', 200);
    ok((await text(page, '#pdW')) === P.pd140c3[0] + ' W', 'ch7 140 W charger on a 3 A cable');
    await pick(page, 'pdK', 'c5'); await page.waitForTimeout(40);
    ok((await text(page, '#pdW')) === P.pd140c5[0] + ' W' && (await page.$$('#pdM li')).length === 12, 'ch7 EPR: 140 W, twelve messages');
    ok((await text(page, '#pdMs')) === zf(P.pdWire[0], 1) + ' 毫秒', 'ch7 wire time');
    await pick(page, 'pdC', '65'); await pick(page, 'pdK', 'c3'); await pick(page, 'pdS', 'l65'); await page.waitForTimeout(40);
    ok((await text(page, '#pdW')) === P.pd65w[0] + ' W', 'ch7 65 W charger on a 3 A cable gives 60 W');

    // ch8 IOMMU
    await show(page, '#ioCv', 200);
    ok((await text(page, '#ioX')) === M.IOMMU.run(1536, 64, 'iommu', 7).exposed / 1024 + ' KiB', 'ch8 default exposure (the seed-7 layout)');
    ok((await text(page, '#ioEx')).split(' / ')[0] === String(P.ioPages7[0]), 'ch8 default layout page count is the one the prose quotes');
    await pick(page, 'ioS', '4096'); await page.waitForTimeout(40);
    ok((await text(page, '#ioX')) === '0 KiB', 'ch8 page-sized buffers expose nothing');
    await pick(page, 'ioS', '1536'); await pick(page, 'ioM', 'off'); await page.waitForTimeout(40);
    ok((await text(page, '#ioMp')) === P.ioOff[0] + ' KiB', 'ch8 no IOMMU maps the pool');
    await pick(page, 'ioM', 'iommu'); const a = await text(page, '#ioEx'); await page.click('#ioR'); await page.waitForTimeout(60);
    ok((await text(page, '#ioEx')).split(' / ')[1] === a.split(' / ')[1], 'ch8 reseed keeps the expectation');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates (every canvas is still after a pause)
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    for (const id of ['ccCv', 'pkCv', 'shCv', 'chCv', 'lnCv', 'scCv', 'ioCv']) {
      await show(page, '#' + id, 250);
      const h = await canvasHash(page, id); await page.waitForTimeout(400);
      ok(h === await canvasHash(page, id), `reduced motion: ${id} is still`);
    }
    const dg = await diagramProblems(page, DG);
    ok(!dg.length, `reduced: diagrams: ${dg.slice(0, 6).join(' | ')}`);
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, nine diagrams per STANDARD §4a; resize redraw; toggle with stub fallback, keyboard, all eight models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
