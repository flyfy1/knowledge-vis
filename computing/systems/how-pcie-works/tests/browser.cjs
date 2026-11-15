'use strict';
// Browser test for the PCIe essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18931 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-pcie-works/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// At 1280/390/320: no console/page errors, no horizontal overflow, no clipped text, every control at least 48×48 px,
// toggle reads 中 | EN, no raw copy keys, no unfilled placeholders, every readout and live sentence filled. The twelve
// static diagrams (STANDARD §4a): each present as an inline SVG with role="img" and a non-empty aria-label from copy,
// every label non-empty, inside the SVG, not overlapping another label, and rendered at 11 px or more. Then the
// language toggle (English is a stub: the page falls back to Chinese), keyboard on a slider, each model driven to
// the numbers the models give, and reduced motion. When copy.en.js is translated (enStub removed), the sweep also
// runs in English and checks that no Chinese is left, including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18931').replace(/\/$/, '');
const url = base + '/computing/systems/how-pcie-works/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const gb = (x, d) => zf(x, d == null ? (x < 10 ? 2 : 1) : d) + ' GB/s';

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { window.__ft = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const tick = (page, id, on) => page.$eval('#' + id, (e, on) => { if (e.checked !== on) e.click(); }, on);
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

// STANDARD §4a: every diagram present, labelled, labels inside, not overlapping, at least 11 px
const diagramProblems = page => page.evaluate(() => {
  const out = [];
  const figs = [...document.querySelectorAll('figure.diag')];
  if (figs.length < 6) out.push('only ' + figs.length + ' diagrams');
  for (const f of figs) {
    const id = f.id, svg = f.querySelector('svg');
    if (!svg) { out.push(id + ': no svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(id + ': role');
    const al = svg.getAttribute('aria-label') || ''; if (al.trim().length < 8 || /^d\d+\./.test(al)) out.push(id + ': aria-label "' + al + '"');
    const cap = f.querySelector('figcaption'); if (!cap || cap.textContent.trim().length < 6) out.push(id + ': caption');
    const sb = svg.getBoundingClientRect();
    const texts = [...svg.querySelectorAll('text')], boxes = [];
    if (!texts.length) out.push(id + ': no labels');
    for (const t of texts) {
      const s = t.textContent;
      if (!s.trim()) { out.push(id + ': empty label'); continue; }
      if (/^d\d+\.[\w.]+$/.test(s.trim())) out.push(id + ': raw key ' + s);
      const r = t.getBoundingClientRect();
      if (r.left < sb.left - 1 || r.right > sb.right + 1 || r.top < sb.top - 1 || r.bottom > sb.bottom + 1) out.push(`${id}: label outside "${s.slice(0, 16)}"`);
      const px = parseFloat(t.getAttribute('font-size')) * sb.width / svg.viewBox.baseVal.width;
      if (px < 11 - 1e-6) out.push(`${id}: ${px.toFixed(1)} px "${s.slice(0, 12)}"`);
      // ink box: the glyph extent, trimmed a little vertically (bounding boxes include line gap)
      boxes.push({ s, l: r.left, r: r.right, t: r.top + r.height * 0.18, b: r.bottom - r.height * 0.18 });
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0.5) out.push(`${id}: "${a.s.slice(0, 12)}" overlaps "${b.s.slice(0, 12)}"`);
    }
  }
  return out.slice(0, 12);
});

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
    const dp = await diagramProblems(page);
    ok(!dp.length, `${tag}: diagrams: ${dp.join(' | ')}`);
    ok(await page.evaluate(w => [...document.querySelectorAll('svg.dg')].every(s => s.viewBox.baseVal.width === (s.getBoundingClientRect().width >= 700 ? 900 : 350)), width), `${tag}: diagram variant matches its width`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
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
      if (e.closest('pre.hex') || e.closest('table.fam') && e.tagName !== 'TABLE') return false;
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, pre')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(t => /^(ch\d+|d\d+|u)\.[\w.]+$/.test(t)));
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
    if (SHOT) await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')) === 'PCIe 为什么能一代一代翻倍', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await page.$$('svg.dg')).length === 12, 'diagrams re-rendered after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    const P = M.prose();
    ok((await page.$eval('#ch2', e => e.textContent)).includes(zf(P.g5x16[0], 1) + ' GB/s'), 'ch2 prose quotes Gen5 ×16 from the model');
    ok((await page.$eval('#ch10', e => e.textContent)).includes(zf(P.cross[0], 0) + ' DW'), 'ch10 prose quotes the crossover from the model');

    // ch2 negotiation (defaults Gen4 ×16 card in Gen4 ×8 slot)
    await show(page, '#lnCv', 200);
    ok((await text(page, '#lnLink')) === 'Gen4 ×8' && (await text(page, '#lnBw')) === gb(M.LANE.link(4, 8)), 'ch2 default Gen4 ×8, got ' + await text(page, '#lnLink') + ' ' + await text(page, '#lnBw'));
    ok((await text(page, '#lnEq')) === 'Gen3 ×16', 'ch2 same bandwidth one generation older');
    await pick(page, 'lnSg', '3'); await pick(page, 'lnSw', '16'); await page.waitForTimeout(60);
    ok((await text(page, '#lnLink')) === 'Gen3 ×16' && (await page.$eval('#lnSay', e => e.textContent)).includes('代数被插槽拖住'), 'ch2 Gen4 card in Gen3 slot');
    await pick(page, 'lnSg', '5'); await page.waitForTimeout(60);
    ok((await text(page, '#lnShare')) === '100%', 'ch2 slot better than the card');

    // ch3 TLP: default read 4 KiB, MRRS 512, completions of MPS 256
    await show(page, '#tlCv', 200);
    ok((await text(page, '#tlE')) === zf(M.TLP.read(4096, 512, 256, true).eff * 100, 1) + '%', 'ch3 default efficiency, got ' + await text(page, '#tlE'));
    ok((await page.$eval('#tlHex', e => e.textContent)).includes('20 00 00 80'), 'ch3 MRd64 header bytes');
    ok((await page.$eval('#tlHex', e => e.textContent)).includes('4A 00 00 40'), 'ch3 CplD header bytes');
    await pick(page, 'tlOp', 'wr'); await page.waitForTimeout(60);
    ok((await text(page, '#tlE')) === zf(M.TLP.write(4096, 256, true).eff * 100, 1) + '%' && (await page.$eval('#tlHex', e => e.textContent)).startsWith('第一个写包'), 'ch3 write');
    await page.focus('#tlS'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(80);
    ok((await text(page, '#tlSo')) === '2 KiB', 'ch3 slider responds to the keyboard, got ' + await text(page, '#tlSo'));
    await setRange(page, 'tlS', 6); await page.waitForTimeout(60);
    ok((await page.$eval('#tlSay', e => e.textContent)).includes('包太小'), 'ch3 64 B write is the small branch');

    // ch4 credits
    await show(page, '#fcCv', 200);
    const fc = M.FC.closed({ payload: 256, hdr: 127, data: 2047, rtt: 1000 });
    ok((await text(page, '#fcU')) === zf(fc.util * 100, 0) + '%' && (await text(page, '#fcW')) === '127', 'ch4 default 56%, got ' + await text(page, '#fcU'));
    await setRange(page, 'fcR', 500); await page.waitForTimeout(60);
    ok((await text(page, '#fcU')) === '100%', 'ch4 RTT 500 ns fills the link');
    await setRange(page, 'fcR', 1000); await tick(page, 'fcS', true); await setRange(page, 'fcB', 8192); await page.waitForTimeout(60);
    ok((await text(page, '#fcU')) === '100%', 'ch4 scaled flow control with a bigger buffer fills the link');

    // ch5 replay
    await show(page, '#arCv', 200);
    await setRange(page, 'arB', -6); await page.waitForTimeout(60);
    const a6 = M.ARQ.tlp({ payload: 256, ber: 1e-6, rtt: 1000 });
    ok((await text(page, '#arU')) === zf(a6.U * 100, 1) + '%', 'ch5 1e-6 go-back-N, got ' + await text(page, '#arU'));
    await pick(page, 'arM', 'sr'); await page.waitForTimeout(60);
    ok((await text(page, '#arU')) === zf(a6.Usr * 100, 1) + '%', 'ch5 selective repeat, got ' + await text(page, '#arU'));

    // ch6 enumeration: reset, step, all
    await show(page, '#enCv', 200);
    ok((await text(page, '#enBus')) === '8' && (await text(page, '#enUsed')) === '308 MiB', 'ch6 default 8 buses, 308 MiB, got ' + await text(page, '#enUsed'));
    await page.click('#enReset'); await page.waitForTimeout(60);
    ok((await text(page, '#enUsed')) === '…' && (await page.$$eval('#enTab tbody tr', r => r.length)) === 0, 'ch6 reset clears the table');
    for (let i = 0; i < 3; i++) await page.click('#enStep');
    await page.waitForTimeout(60);
    // three steps: root port 1 found, the GPU behind it found, root port 1 closed → two rows
    ok((await page.$$eval('#enTab tbody tr', r => r.length)) === 2 && (await page.$eval('#enSay', e => e.textContent)).includes('第 3/19 步'), 'ch6 three steps');
    await page.click('#enAll'); await tick(page, 'enCard', false); await page.waitForTimeout(60);
    ok((await text(page, '#enUsed')) === '307 MiB', 'ch6 without the card 307 MiB');
    await tick(page, 'enCard', true); await setRange(page, 'enBar', 24); await page.waitForTimeout(60);
    ok((await text(page, '#enProbe')) === (2 ** 32 - 2 ** 24).toString(16).toUpperCase() + 'h', 'ch6 BAR probe for 16 MiB');

    // ch7 MSI
    await show(page, '#msHex', 150);
    ok((await page.$eval('#msHex', e => e.textContent)).includes('40 00 00 01'), 'ch7 1-DW MWr header');
    await pick(page, 'msPre', 'real'); await page.waitForTimeout(60);
    ok((await page.$eval('#msSay', e => e.textContent)).includes('0x71') && await page.$eval('#msD', e => e.disabled), 'ch7 the lspci record decodes to vector 0x71');

    // ch8 loss
    await show(page, '#lsCv', 200);
    const l = M.LOSS.link(5, 'mid', 10, 0);
    ok((await text(page, '#lsT')) === zf(l.each, 1) + ' dB' && (await page.$eval('#lsSay', e => e.textContent)).startsWith('通不了'), 'ch8 default fails, got ' + await text(page, '#lsT'));
    await pick(page, 'lsK', '1'); await page.waitForTimeout(60);
    ok((await page.$eval('#lsSay', e => e.textContent)).includes('重定时器'), 'ch8 a retimer fixes it');
    await pick(page, 'lsG', '7'); await pick(page, 'lsK', '0'); await page.waitForTimeout(60);
    ok((await text(page, '#lsR')) === zf(M.LOSS.reach(7, 'mid'), 1) + ' 英寸', 'ch8 Gen7 mid-loss reach');

    // ch9 eyes
    await show(page, '#eyCv', 200);
    const e0 = await canvasHash(page, 'eyCv');
    await setRange(page, 'eyS', 35); await page.waitForTimeout(120);
    ok(e0 !== await canvasHash(page, 'eyCv'), 'ch9 eyes redraw with less noise');
    ok((await page.$eval('#eySay', e => e.textContent)).startsWith('两个都够'), 'ch9 35 dB: both pass');

    // ch10 FEC and FLIT
    await show(page, '#feCv', 200);
    ok((await text(page, '#feU')) === zf(M.FEC.goodput({ ber: 1e-6, fec: false, rtt: 1000 }).U * 100, 1) + '%', 'ch10 no FEC at 1e-6, got ' + await text(page, '#feU'));
    await tick(page, 'feF', true); await page.waitForTimeout(60);
    ok((await text(page, '#feU')) === zf(M.FEC.goodput({ ber: 1e-6, fec: true, rtt: 1000 }).U * 100, 3) + '%', 'ch10 with FEC, got ' + await text(page, '#feU'));
    await show(page, '#flCv', 200);
    await setRange(page, 'flD', 0); await page.waitForTimeout(60);
    ok((await page.$eval('#flSay', e => e.textContent)).includes('反而慢'), 'ch10 small TLP is slower in FLIT mode');
    await setRange(page, 'flD', 10); await page.waitForTimeout(60);
    ok((await page.$eval('#flSay', e => e.textContent)).includes('FLIT 快'), 'ch10 1024 DW is faster in FLIT mode');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts still there
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#fcCv', 300);
    const a = await canvasHash(page, 'fcCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'fcCv'), 'reduced motion: ch4 canvas is still');
    ok((await page.$$('svg.dg')).length === 12, 'reduced motion: diagrams present');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser test (${langs.join('+')} at 1280/390/320: twelve diagrams per STANDARD §4a, overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences; toggle with stub fallback, keyboard, all ten models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
