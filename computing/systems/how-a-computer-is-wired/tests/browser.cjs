'use strict';
// Browser smoke test for the essay on how a computer is wired.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18932 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-a-computer-is-wired/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page and per-diagram screenshots at each width (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled, and the
// STANDARD §4a diagram checks (each of the eight SVG diagrams present with role=img and an aria-label from copy,
// labels non-empty, no label outside its SVG or overlapping another label, rendered label size at least 11 px).
// Then the language toggle (English is a stub: the page falls back to Chinese and says so in <html lang>), keyboard
// operation of a slider, each of the eight models responding to its controls with the numbers models.js gives, and
// reduced motion (no smooth scroll; canvases still drawn). When copy.en.js is translated (enStub removed), the same
// width sweep also runs in English and checks that no Chinese is left, including canvas and diagram text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18932').replace(/\/$/, '');
const url = base + '/computing/systems/how-a-computer-is-wired/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const gb = (x, d) => zf(x, d == null ? (x < 10 ? 2 : 1) : d) + ' GB/s';
const mb = (x, d) => zf(x, d == null ? (x < 100 ? 1 : 0) : d) + ' MB/s';
const nsz = (x, d) => zf(x, d == null ? (x < 10 ? 1 : 0) : d) + ' 纳秒';
const DIAGRAMS = ['dg1', 'dg2', 'dg3', 'dg4', 'dg5', 'dg6', 'dg7', 'dg8'];

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js(\?|$)/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { window.__ft = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const tick = (page, id, on) => page.$eval('#' + id, (e, on) => { if (e.checked !== on) e.click(); }, on);
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

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
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
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
      if (e.closest('defs')) return false;   // marker shapes are not laid out; the <svg> and what it draws are checked
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^[a-z]\w*(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    ok(await page.$$eval('.say', es => es.every(e => e.getAttribute('aria-live') === 'polite')), `${tag}: live sentences are aria-live`);

    // STANDARD §4a: the diagrams
    const dg = await page.evaluate(ids => {
      const out = { missing: [], aria: [], empty: [], outside: [], overlap: [], small: [], raw: [], caption: [] };
      for (const id of ids) {
        const fig = document.getElementById(id), svg = fig && fig.querySelector('svg[role=img]');
        if (!svg) { out.missing.push(id); continue; }
        if (!(svg.getAttribute('aria-label') || '').trim() || /^[a-z]\w*(\.\w+)+$/.test(svg.getAttribute('aria-label'))) out.aria.push(id);
        const cap = fig.querySelector('figcaption'); if (!cap || cap.textContent.trim().length < 8) out.caption.push(id);
        if (!svg.getAttribute('viewBox')) out.missing.push(id + ' viewBox');
        const sr = svg.getBoundingClientRect(), ts = [...svg.querySelectorAll('text')], rects = ts.map(t => t.getBoundingClientRect());
        if (ts.length < 3) out.empty.push(id + ' has ' + ts.length + ' labels');
        ts.forEach((t, i) => {
          const s = t.textContent.trim();
          if (!s) out.empty.push(id + ' empty label');
          if (/\{\w+\}|^[a-z]\w*\.\w+/.test(s)) out.raw.push(id + ' ' + s);
          const fs = parseFloat(getComputedStyle(t).fontSize) * t.getScreenCTM().a;
          if (fs < 11) out.small.push(`${id} "${s.slice(0, 14)}" ${fs.toFixed(1)}px`);
          const r = rects[i];
          if (r.left < sr.left - 1 || r.right > sr.right + 1 || r.top < sr.top - 1 || r.bottom > sr.bottom + 1) out.outside.push(`${id} "${s.slice(0, 14)}"`);
          for (let j = i + 1; j < ts.length; j++) { const q = rects[j]; if (r.left < q.right - 0.5 && q.left < r.right - 0.5 && r.top < q.bottom - 0.5 && q.top < r.bottom - 0.5) out.overlap.push(`${id} "${s.slice(0, 12)}" × "${ts[j].textContent.slice(0, 12)}"`); }
        });
      }
      return out;
    }, DIAGRAMS);
    for (const [k, v] of Object.entries(dg)) ok(!v.length, `${tag}: diagrams ${k}: ${v.slice(0, 5).join(', ')}`);
    ok(await page.$$eval('figure svg[role=img]', s => s.length) >= 6, `${tag}: at least six diagrams`);

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
      for (const id of DIAGRAMS) { const e = await page.$('#' + id); if (e) await e.screenshot({ path: `${SHOT}/${id}-${lang}-${width}.png` }); }
    }
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    const P = M.prose();
    ok((await text(page, 'h1')) === '电脑里的零件是怎么连起来的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    ok(await page.$$eval('figure svg[role=img] text', ts => ts.every(t => t.textContent.trim())), 'diagram labels redrawn after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch1', e => e.textContent)).includes(zf(P.t35used[0], 2) + ' 微秒'), 'ch1 prose quotes the Table 3-5 total from the model');
    ok((await page.$eval('#ch5', e => e.textContent)).includes(zf(P.bdSsd[0], 2) + ' GB/s'), 'ch5 prose quotes the per-SSD share from the model');
    ok((await page.$eval('#dg3', e => e.textContent)).includes(zf(M.SPEC.i875.hi * 1000, 0) + ' MB/s'), 'dg3 draws the Hub Interface rate from the model');

    // ch1 shared bus: defaults, keyboard on N, one device
    await show(page, '#busCv', 200);
    let v = M.PCI.share(6, 30, 16);
    ok((await text(page, '#busE')) === mb(v.eff, 0) && (await text(page, '#busEach')) === mb(v.each, 1), 'ch1 default share, got ' + await text(page, '#busEach'));
    await page.focus('#busN'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    v = M.PCI.share(7, 30, 16);
    ok((await text(page, '#busNo')) === '7' && (await text(page, '#busEach')) === mb(v.each, 1), 'ch1 slider responds to the keyboard (7 devices), got ' + await text(page, '#busEach'));
    await setRange(page, 'busN', 1); await page.waitForTimeout(80);
    ok((await text(page, '#busW')) === '0.0 微秒', 'ch1 one device never waits');
    await setRange(page, 'busB', 6); await setRange(page, 'busN', 6); await page.waitForTimeout(80);
    ok((await text(page, '#busEach')) === mb(P.s1bEach[0], 1), 'ch1 64-phase transactions, got ' + await text(page, '#busEach'));

    // ch2 loaded line
    await show(page, '#lnCv', 200);
    const C14 = M.LINE.defaultLoad();
    ok((await text(page, '#lnM')) === zf(M.LINE.maxLoads(100 / 3, 33, C14), 0), 'ch2 default max loads at 33 MHz, got ' + await text(page, '#lnM'));
    ok((await text(page, '#lnM')) === zf(P.n33[0], 0) && (await text(page, '#lnT')) === nsz(P.tp33[0], 1), 'ch2 default readouts agree with the prose (n33, tp33)');
    await pick(page, 'lnC', '66'); await setRange(page, 'lnF', 66); await page.waitForTimeout(80);
    ok((await text(page, '#lnM')) === zf(M.LINE.maxLoads(200 / 3, 66, C14), 0), 'ch2 66 MHz parts, got ' + await text(page, '#lnM'));
    await setRange(page, 'lnL', 20); await page.waitForTimeout(80);
    ok((await text(page, '#lnV')) === zf(M.LINE.trips(20).after1 * 100, 0) + '%', 'ch2 20 pF first reflection, got ' + await text(page, '#lnV'));
    await setRange(page, 'lnF', 100); await pick(page, 'lnC', '33'); await page.waitForTimeout(80);
    ok((await text(page, '#lnT')) === '0.0 纳秒' && (await text(page, '#lnM')) === '0', 'ch2 100 MHz with 33 MHz parts leaves no time for the wire, got ' + await text(page, '#lnT'));
    ok(M.say.line(8, 100, 33, 20).key === 'ch2.say.nobudget', 'ch2 100 MHz with 33 MHz parts has no budget');

    // ch3 northbridge
    await show(page, '#nbCv', 200);
    ok((await text(page, '#nbCpu')) === gb(P.nbCpu[0], 1) && (await text(page, '#nbSb')) === mb(P.nbSb[0], 0), 'ch3 default, got ' + await text(page, '#nbCpu'));
    await setRange(page, 'nbG', 0); await page.waitForTimeout(80);
    const nb = M.NB.run({ cpu: 6.4, gpu: 0, sb: 0.3, gbe: M.NB.gbe });
    ok((await text(page, '#nbCpu')) === gb(nb.rate.cpu, 1), 'ch3 no graphics traffic, got ' + await text(page, '#nbCpu'));
    await tick(page, 'nbE', false); await setRange(page, 'nbS', 0); await page.waitForTimeout(80);
    ok((await text(page, '#nbCpu')) === gb(P.nbCpuAlone[0], 1), 'ch3 CPU alone gets all of memory');

    // ch4 NUMA presets and the in-flight slider
    await show(page, '#nmCv', 200);
    ok((await text(page, '#nmLat')) === nsz(P.ilLat[0], 1), 'ch4 default interleave, got ' + await text(page, '#nmLat'));
    await page.click('#nmLocal'); await page.waitForTimeout(80);
    ok((await text(page, '#nmLat')) === nsz(M.SPEC.zep.local, 1) && (await text(page, '#nmBw')) === gb(P.bwLocal[0], 1), 'ch4 all local, got ' + await text(page, '#nmLat'));
    await page.click('#nmFar'); await page.waitForTimeout(80);
    ok((await text(page, '#nmLat')) === nsz(M.SPEC.zep.remote, 1), 'ch4 all remote, got ' + await text(page, '#nmLat'));
    await setRange(page, 'nmM', 20); await page.waitForTimeout(80);
    ok((await text(page, '#nmBw')) === gb(M.NUMA.bw({ pkg: 0, remote: 1 }, 20), 1), 'ch4 twenty in flight, got ' + await text(page, '#nmBw'));
    await page.click('#nmIl'); await page.waitForTimeout(80);
    ok((await text(page, '#nmLat')) === nsz(P.ilLat[0], 1), 'ch4 interleave preset');

    // ch5 the board
    await show(page, '#bdCv', 200);
    let bd = M.BOARD.run({ plat: 'intel', ssd1: 'read', ssd2: 'read', usb: true });
    ok((await text(page, '#bdUp')) === gb(bd.load.up) && (await text(page, '#bdW')) === zf(bd.slowest * 100, 0) + '%', 'ch5 default, got ' + await text(page, '#bdUp') + ' ' + await text(page, '#bdW'));
    await pick(page, 'bdP', 'amd'); await page.waitForTimeout(80);
    bd = M.BOARD.run({ plat: 'amd', ssd1: 'read', ssd2: 'read', usb: true });
    ok((await text(page, '#bdUp')) === gb(bd.load.up), 'ch5 AMD uplink, got ' + await text(page, '#bdUp'));
    await pick(page, 'bdB', 'write'); await tick(page, 'bdU', false); await page.waitForTimeout(80);
    ok((await text(page, '#bdW')) === '100%' && (await text(page, '#bdDn')) === gb(M.SPEC.nvme), 'ch5 copy across directions runs full speed');
    await tick(page, 'bdC', true); await pick(page, 'bdA', 'idle'); await pick(page, 'bdB', 'idle'); await page.waitForTimeout(80);
    ok((await text(page, '#bdUp')) === gb(0), 'ch5 CPU-attached SSD does not touch the uplink');

    // ch6 ring vs mesh
    await show(page, '#ncCv', 200);
    ok((await text(page, '#ncR')) === zf(P.r16[0], 2), 'ch6 default 16 stations, got ' + await text(page, '#ncR'));
    await pick(page, 'ncN', '64'); await page.waitForTimeout(80);
    ok((await text(page, '#ncR')) === zf(M.NOC.ring(64).avg, 2) && (await text(page, '#ncT')) === '×' + zf(4, 2), 'ch6 64 stations, got ' + await text(page, '#ncT'));
    await pick(page, 'ncN', '4'); await page.waitForTimeout(80);
    ok((await page.$eval('#ncSay', e => e.textContent)).length > 10 && M.say.noc(4).key === 'ch6.say.tie', 'ch6 four stations tie');

    // ch7 die-to-die
    await show(page, '#ddCv', 200);
    ok((await text(page, '#ddW')) === zf(P.w25[0], 1) + ' 瓦', 'ch7 1 TB/s advanced package, got ' + await text(page, '#ddW'));
    await pick(page, 'ddK', 'lp5'); await page.waitForTimeout(80);
    ok((await text(page, '#ddW')) === zf(P.wLp5[0], 0) + ' 瓦' && (await text(page, '#ddE')) === '—', 'ch7 LPDDR5-style link, got ' + await text(page, '#ddW'));
    await setRange(page, 'ddB', 1); await page.waitForTimeout(80);
    ok((await text(page, '#ddW')) === zf(M.D2D.watts(10, 'lp5') * 1000, 0) + ' 毫瓦', 'ch7 10 GB/s in milliwatts, got ' + await text(page, '#ddW'));

    // ch8 I²C
    await show(page, '#icCv', 200);
    ok((await text(page, '#icT')) === nsz(P.i2cTr[0], 0) && (await text(page, '#icX')) === nsz(300, 0), 'ch8 default 4.7 kΩ 200 pF fast mode, got ' + await text(page, '#icT'));
    await pick(page, 'icM', 'sm'); await page.waitForTimeout(80);
    ok((await text(page, '#icX')) === nsz(1000, 0), 'ch8 standard mode limit');
    await pick(page, 'icM', 'fm'); await setRange(page, 'icR', 6); await page.waitForTimeout(80);
    ok((await text(page, '#icT')) === nsz(M.I2C.tr(1.5, 200), 0), 'ch8 1.5 kΩ rise, got ' + await text(page, '#icT'));
    await setRange(page, 'icC', 450); await page.waitForTimeout(80);
    ok((await text(page, '#icW')) === '—', 'ch8 450 pF exceeds the fast-mode bus limit: no window');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; every model still drawn
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    for (const id of ['busCv', 'lnCv', 'nbCv', 'nmCv', 'bdCv', 'ncCv', 'ddCv', 'icCv']) {
      await show(page, '#' + id, 250);
      const blank = await page.$eval('#' + id, c => { const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < x.length; i += 4) if (x[i]) return false; return true; });
      ok(!blank, 'reduced motion: ' + id + ' drawn');
      const a = await canvasHash(page, id); await page.waitForTimeout(300);
      ok(a === await canvasHash(page, id), 'reduced motion: ' + id + ' is still');
    }
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, the eight diagrams per STANDARD §4a; toggle with stub fallback, keyboard, all eight models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
