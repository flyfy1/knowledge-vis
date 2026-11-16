'use strict';
// Browser smoke test for the CPU cache essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18941 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-cpu-caches-work/tests/browser.cjs
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
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18941').replace(/\/$/, '');
const url = base + '/computing/systems/how-cpu-caches-work/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const cyc = (x, d) => zf(x, d == null ? (x < 10 ? 1 : 0) : d) + ' 周期';
const pct = (x, d) => zf(x * 100, d == null ? 0 : d) + '%';
const kib = b => zf(b / 1024, b % 1024 ? 1 : 0) + ' KiB';

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
      if (e.closest('pre.code')) return false;
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
    ok((await text(page, 'h1')) === 'CPU 的三级缓存是怎么工作的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch1', e => e.textContent)).includes(zf(P.amat3[0], 1) + ' 个周期'), 'ch1 prose quotes the three-level AMAT from the model');
    ok((await page.$eval('#ch10', e => e.textContent)).includes(zf(P.s1m4[0], 0) + ' 个周期'), 'ch10 prose quotes the 1 MiB / 4 KiB-page point');
    ok((await page.$$eval('#latRows tr', r => r.length)) === 8, 'ch1 latency table has eight rows');

    // ch1 levels and AMAT
    await show(page, '#amCv', 200);
    ok((await text(page, '#amA')) === cyc(P.amat3[0], 1), 'ch1 default: three levels, got ' + await text(page, '#amA'));
    await click(page, '#amL3'); await page.waitForTimeout(60);
    ok((await text(page, '#amA')) === cyc(P.amat12[0], 1), 'ch1 without L3, got ' + await text(page, '#amA'));
    await click(page, '#amL3'); await page.focus('#amT'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    ok((await text(page, '#amTo')) === '32 MiB' && (await text(page, '#amA')) === cyc(P.amatBig[0], 1), 'ch1 slider by keyboard to 32 MiB, got ' + await text(page, '#amTo') + ' ' + await text(page, '#amA'));
    ok((await page.$eval('#amSay', e => e.textContent)).includes('比 L3 大'), 'ch1 spill sentence');

    // ch2 address split and the toy cache
    await show(page, '#spA', 150);
    const a0 = M.parseHex('0x7ffd3a5c9e48'), g1 = M.geometry(M.ZEN.l1d.size, M.ZEN.l1d.ways), s1 = M.split(a0, g1);
    ok((await text(page, '#spI')) === zf(s1.index, 0) && (await text(page, '#spO')) === zf(s1.offset, 0), 'ch2 L1 split of the default address');
    await pick(page, 'spC', 'l3'); await page.waitForTimeout(40);
    ok((await text(page, '#spS')) === zf(P.z3sets[0], 0), 'ch2 L3 sets, got ' + await text(page, '#spS'));
    await page.fill('#spA', 'zz'); await page.waitForTimeout(40);
    ok((await page.$eval('#spSay', e => e.textContent)).includes('十六进制'), 'ch2 bad input sentence');
    await page.fill('#spA', '0x7ffd3a5c9e48');
    await show(page, '#tySets', 150);
    await click(page, '#tyStep'); await page.waitForTimeout(30);
    ok((await text(page, '#tyM')) === '1', 'ch2 first step misses');
    await click(page, '#tyAll'); await page.waitForTimeout(30);
    ok((await text(page, '#tyM')) === zf(P.toyMissA[0], 0), 'ch2 b at 0x180: all miss, got ' + await text(page, '#tyM'));
    await pick(page, 'tyB', '1'); await click(page, '#tyAll'); await page.waitForTimeout(30);
    ok((await text(page, '#tyM')) === zf(P.toyMissB[0], 0), 'ch2 b at 0x1A0, got ' + await text(page, '#tyM'));
    await pick(page, 'tyB', '0'); await pick(page, 'tyW', '2'); await click(page, '#tyAll'); await page.waitForTimeout(30);
    ok((await text(page, '#tyM')) === zf(P.toyMiss2[0], 0), 'ch2 two ways, got ' + await text(page, '#tyM'));

    // ch3 3C
    await show(page, '#c3Cv', 200);
    ok((await text(page, '#c3Cf')) === zf(P.dm16conf[0], 0), 'ch3 default conflicts, got ' + await text(page, '#c3Cf'));
    const h3 = await canvasHash(page, 'c3Cv');
    await pick(page, 'c3W', '4'); await page.waitForTimeout(80);
    ok((await text(page, '#c3Cf')) === '0' && (await text(page, '#c3Co')) === zf(P.c3comp[0], 0), 'ch3 four ways: no conflicts');
    ok(h3 !== await canvasHash(page, 'c3Cv'), 'ch3 canvas redraws');
    await pick(page, 'c3W', 'fa'); await pick(page, 'c3S', '8192'); await page.waitForTimeout(60);
    ok((await text(page, '#c3Ca')) === zf(P.fa8cap[0], 0), 'ch3 8 KiB fully associative capacity misses');

    // ch4 replacement
    await show(page, '#rpCv', 200);
    ok((await text(page, '#rpLru')) === pct(P.lruLoop[0], 1) && (await text(page, '#rpOpt')) === pct(P.optLoop[0], 1), 'ch4 loop 1.25×');
    await pick(page, 'rpT', 'scan'); await page.waitForTimeout(80);
    ok((await text(page, '#rpLru')) === pct(P.lruScan[0], 1) && (await text(page, '#rpRr')) === pct(P.brripScan[0], 1), 'ch4 scan');
    ok(await page.$eval('#rpL', e => e.disabled), 'ch4 loop slider disabled off the loop trace');

    // ch5 writes
    await show(page, '#wrCv', 200);
    const wb = M.writes('wb-a', 4), wt = M.writes('wt-na', 0);
    ok((await text(page, '#wrW')) === kib(wb.writeBytes), 'ch5 default write-back, got ' + await text(page, '#wrW'));
    await pick(page, 'wrP', 'wt-na'); await pick(page, 'wrD', '0'); await page.waitForTimeout(80);
    ok((await text(page, '#wrS')) === pct(wt.waitShare, 1), 'ch5 write-through, no buffer, got ' + await text(page, '#wrS'));

    // ch6 hierarchy
    await show(page, '#hiCv', 200);
    ok((await text(page, '#hiH')) === pct(P.hExc[0], 0), 'ch6 default exclusive, got ' + await text(page, '#hiH'));
    await pick(page, 'hiK', 'incl'); await page.waitForTimeout(80);
    ok((await text(page, '#hiH')) === pct(P.hInc[0], 0) && (await text(page, '#hiB')) === zf(P.hBack[0], 0), 'ch6 inclusive, got ' + await text(page, '#hiH'));
    ok((await page.$$eval('table.fam', t => t.length)) === 2 && (await page.$eval('#ch6 table.fam', t => t.textContent)).includes('46'), 'ch6 chip table filled');

    // ch7 VIPT
    await show(page, '#vpBits', 150);
    ok((await text(page, '#vpLim')) === '48 KiB' && (await text(page, '#vpAl')) === '一个组', 'ch7 default Zen 5 fits, got ' + await text(page, '#vpLim'));
    await pick(page, 'vpW', '4'); await setRange(page, 'vpS', 3); await page.waitForTimeout(40);
    ok((await text(page, '#vpAl')) === '4 个组' && (await text(page, '#vpLim')) === zf(P.vNlimit[0], 0) + ' KiB', 'ch7 Neoverse V3 shape aliases, got ' + await text(page, '#vpAl'));
    await pick(page, 'vpP', '16384'); await pick(page, 'vpW', '8'); await setRange(page, 'vpS', 5); await page.waitForTimeout(40);
    ok((await text(page, '#vpAl')) === '一个组', 'ch7 Apple shape (128 KiB, 16 KiB page, 8 ways) fits');

    // ch8 prefetch
    await show(page, '#pfCv', 200);
    ok((await text(page, '#pfC')) === pct(P.pfStrideCov[0], 0), 'ch8 default stride coverage, got ' + await text(page, '#pfC'));
    await pick(page, 'pfT', 'matrix'); await setRange(page, 'pfD', 8); await page.waitForTimeout(80);
    ok((await text(page, '#pfC')) === pct(P.pfMat8Cov[0], 0), 'ch8 matrix, distance 8, got ' + await text(page, '#pfC'));
    await setRange(page, 'pfD', 4); await page.waitForTimeout(80);
    ok((await text(page, '#pfC')) === pct(P.pfMatCov[0], 0), 'ch8 matrix, distance 4, got ' + await text(page, '#pfC'));
    await setRange(page, 'pfD', 5); await page.waitForTimeout(80);
    ok((await text(page, '#pfC')) === pct(P.pfMat5Cov[0], 0), 'ch8 matrix, distance 5 (the cliff), got ' + await text(page, '#pfC'));
    await pick(page, 'pfT', 'list'); await page.waitForTimeout(60);
    ok((await text(page, '#pfA')) === '—', 'ch8 list: stride prefetcher silent');
    await pick(page, 'pfM', 'none'); await page.waitForTimeout(60);
    ok(await page.$eval('#pfD', e => e.disabled), 'ch8 distance slider disabled without the stride prefetcher');

    // ch9 MESI and false sharing
    await show(page, '#meCores', 150);
    await click(page, '#meR0'); await page.waitForTimeout(30);
    ok((await page.$$eval('#meCores b', b => b.slice(0, 2).map(x => x.textContent).join(''))) === 'EI', 'ch9 core 0 read: E I');
    await click(page, '#meR1'); await page.waitForTimeout(30);
    ok((await page.$$eval('#meCores b', b => b.slice(0, 2).map(x => x.textContent).join(''))) === 'SS', 'ch9 core 1 read: S S');
    await click(page, '#meW0'); await page.waitForTimeout(30);
    ok((await page.$$eval('#meCores b', b => b.slice(0, 2).map(x => x.textContent).join(''))) === 'MI' && (await page.$eval('#meSay', e => e.textContent)).includes('BusUpgr'), 'ch9 core 0 write: M I, upgrade');
    await click(page, '#meReset'); await page.waitForTimeout(30);
    ok((await page.$$eval('#meLog span', s => s.length)) === 1, 'ch9 reset clears the log');
    await show(page, '#fsCv', 150);
    ok((await text(page, '#fsTx')) === zf(P.fsTx[0], 0), 'ch9 false sharing, got ' + await text(page, '#fsTx'));
    await pick(page, 'fsL', 'pad'); await page.waitForTimeout(60);
    ok((await text(page, '#fsTx')) === zf(P.fpTx[0], 0), 'ch9 padded');

    // ch10 staircase
    await show(page, '#stCv', 200);
    ok((await text(page, '#stC')) === cyc(P.s1m4[0], 0), 'ch10 default 1 MiB, 4 KiB pages, got ' + await text(page, '#stC'));
    await pick(page, 'stP', '2097152'); await page.waitForTimeout(80);
    ok((await text(page, '#stC')) === cyc(P.s1mH[0], 1), 'ch10 2 MiB pages, got ' + await text(page, '#stC'));
    await setRange(page, 'stW', 27); await page.waitForTimeout(80);
    ok((await page.$eval('#stS', e => e.textContent)).includes('内存'), 'ch10 128 MiB served by memory');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#stCv', 400);
    const a = await canvasHash(page, 'stCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'stCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#stC')).length > 0, 'reduced motion: readouts filled');
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
