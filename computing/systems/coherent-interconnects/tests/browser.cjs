'use strict';
// Browser smoke test for the coherent-interconnects essay (B4: how chips share memory across a wire).
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18962 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/coherent-interconnects/tests/browser.cjs
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
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18962').replace(/\/$/, '');
const url = base + '/computing/systems/coherent-interconnects/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const pct = (x, d) => zf(x * 100, d == null ? 0 : d) + '%';
const tm = s => { const d = v => (v < 10 ? 1 : 0); if (s < 1e-3) { const v = s * 1e6; return zf(v, v < 10 ? 2 : d(v)) + ' 微秒'; } if (s < 1) { const v = s * 1e3; return zf(v, d(v)) + ' 毫秒'; } return zf(s, s < 10 ? 2 : 1) + ' 秒'; };
const gbps = (x, d) => zf(x, d == null ? (x < 10 ? 1 : 0) : d) + ' GB/s';

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
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.rt td, table.fam td')].filter(e => {
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
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .cores, .msglog, table.rt')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
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
    ok((await text(page, 'h1')) === '芯片之间怎么共用内存', 'hero title filled from copy, got ' + await text(page, 'h1'));
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch1', e => e.textContent)).includes(zf(P.c1copy[0], 1)), 'ch1 prose quotes the copy time from the model');
    ok((await page.$eval('#ch9', e => e.textContent)).includes(zf(P.arNv5[0], 0) + ' 毫秒'), 'ch9 prose quotes the NVLink 5 all-reduce');
    ok((await page.$$eval('#nvRows tr', r => r.length)) === 3, 'ch8 NVLink table has three rows');
    ok((await page.$eval('#nvRows', e => e.textContent)).includes(gbps(M.nvLinkPerDir(5), 0)), 'ch8 table: NVLink 5 per-link per-direction');
    { const r6 = await page.$eval('#nvRows tr:last-child', e => e.textContent);
      ok(r6.includes('初步') && r6.includes('约 ' + gbps(M.nvLinkPerDir(6), 0)) && r6.includes(zf(M.SRC.nvlink[6].gpuBidir, 0)), 'ch8 table: NVLink 6 row marked preliminary, per-link cell marked approximate, got ' + r6); }

    // ch1 copy or share
    await show(page, '#shCv', 200);
    const sh = (e, f, m) => M.copyShare(Math.pow(2, e), f, m);
    ok((await text(page, '#shCopy')) === tm(sh(20, 0.05, 64).tCopy) && (await text(page, '#shShare')) === tm(sh(20, 0.05, 64).tShare), 'ch1 default 1 MiB, 5 %, got ' + await text(page, '#shCopy') + ' / ' + await text(page, '#shShare'));
    ok((await text(page, '#shX')) === '—', 'ch1 at 5 % sharing always wins: no crossover');
    const h1 = await canvasHash(page, 'shCv');
    await pick(page, 'shF', '1'); await page.focus('#shS'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    ok((await text(page, '#shSo')) === '4 MiB' && (await text(page, '#shCopy')) === tm(sh(22, 1, 64).tCopy), 'ch1 slider by keyboard to 4 MiB at 100 %, got ' + await text(page, '#shSo') + ' ' + await text(page, '#shCopy'));
    ok((await text(page, '#shX')) === zf(P.x100[0], 0) + ' KiB', 'ch1 crossover at 100 %, got ' + await text(page, '#shX'));
    ok((await page.$eval('#shSay', e => e.textContent)).includes('整块复制要'), 'ch1 copy sentence at 4 MiB, 100 %');
    ok(h1 !== await canvasHash(page, 'shCv'), 'ch1 canvas redraws');

    // ch3 flits
    await show(page, '#flCv', 200);
    const fl = (k, m, w) => M.flitBW(k, m, w);
    ok((await text(page, '#flReal')) === gbps(fl('memRd', '68', 16).real, 1) && (await text(page, '#flReal')) === zf(P.fm16[0], 1) + ' GB/s', 'ch3 default CXL.mem read, 68 B, ×16, got ' + await text(page, '#flReal'));
    await pick(page, 'flK', 'cacheWr'); await pick(page, 'flM', '256'); await page.waitForTimeout(60);
    ok((await text(page, '#flReal')) === zf(P.fw256[0], 1) + ' GB/s', 'ch3 cache write, 256 B, got ' + await text(page, '#flReal'));
    await pick(page, 'flK', 'memRd'); await page.waitForTimeout(40);
    ok((await page.$eval('#flSay', e => e.textContent)).length > 10 && (await text(page, '#flReal')) === gbps(fl('memRd', '256', 16).real, 1), 'ch3 derived 256 B memory read');

    // ch4 protocol stepper
    await show(page, '#prLog', 150);
    ok(!(await page.$eval('[data-act=devRdX]', e => e.disabled)), 'ch4 Type 2 may read with CXL.cache');
    await click(page, '[data-act=devRdX]'); await page.waitForTimeout(30);
    const r1 = M.protoStep(2, M.freshLines(), 'devRdX');
    ok((await page.$$eval('#prLog li:not(.act)', l => l.length)) === r1.msgs.length && (await page.$$eval('#prSt b', b => b.map(x => x.textContent).join(''))) === r1.st.hX + r1.st.dX + r1.st.hY, 'ch4 device read: messages and states as the model, got ' + await page.$$eval('#prSt b', b => b.map(x => x.textContent).join('')));
    await click(page, '[data-act=cpuRdX]'); await page.waitForTimeout(30);
    const r2 = M.protoStep(2, r1.st, 'cpuRdX');
    ok((await page.$$eval('#prSt b', b => b.map(x => x.textContent).join(''))) === r2.st.hX + r2.st.dX + r2.st.hY, 'ch4 host read after device: snooped');
    await click(page, '#prReset'); await page.waitForTimeout(30);
    ok((await page.$$eval('#prLog li', l => l.length)) === 1, 'ch4 reset clears the log');
    await pick(page, 'prT', '3'); await page.waitForTimeout(30);
    ok(await page.$eval('[data-act=devRdX]', e => e.disabled) && !(await page.$eval('[data-act=cpuRdY]', e => e.disabled)), 'ch4 Type 3: no CXL.cache, host reads allowed');
    ok((await text(page, '#prSpeaks')).includes('CXL.mem') && !(await text(page, '#prSpeaks')).includes('CXL.cache'), 'ch4 Type 3 speaks io + mem');

    // ch5 tiering
    await show(page, '#tiCv', 200);
    const ti = M.tier(0.5, 0.9, 'd', 'hot');
    ok((await text(page, '#tiLat')) === zf(ti.lat, 0) + ' 纳秒' && (await text(page, '#tiLat')) === zf(P.t50lat[0], 0) + ' 纳秒', 'ch5 default half the pages on the card, got ' + await text(page, '#tiLat'));
    await pick(page, 'tiPl', 'random'); await page.waitForTimeout(60);
    ok((await text(page, '#tiLat')) === zf(P.t50rlat[0], 0) + ' 纳秒', 'ch5 random placement, got ' + await text(page, '#tiLat'));
    await setRange(page, 'tiP', 80); await pick(page, 'tiPl', 'hot'); await page.waitForTimeout(60);
    ok((await text(page, '#tiSlow')) === pct(P.t80slow[0], 0), 'ch5 80 % on the card, got ' + await text(page, '#tiSlow'));

    // ch6 pooling
    await show(page, '#poCv', 200);
    ok((await text(page, '#poSaved')) === pct(P.p16[0], 0), 'ch6 default 16 hosts, got ' + await text(page, '#poSaved'));
    await setRange(page, 'poR', 4); await page.waitForTimeout(60);
    ok((await text(page, '#poSaved')) === pct(P.p16c[0], 0), 'ch6 fully correlated, got ' + await text(page, '#poSaved'));
    await setRange(page, 'poR', 0); await page.waitForTimeout(60);
    ok((await text(page, '#poSaved')) === pct(P.p16i[0], 0), 'ch6 independent, got ' + await text(page, '#poSaved'));

    // ch7 back-invalidate
    await show(page, '#diCv', 200);
    const d0 = M.fabricDir(16, 0.05, 2);
    ok((await text(page, '#diBi')) === zf(d0.bi, d0.bi < 10 ? 1 : 0), 'ch7 default, got ' + await text(page, '#diBi'));
    await pick(page, 'diW', '0'); await page.waitForTimeout(60);
    ok((await text(page, '#diBi')) === zf(M.fabricDir(16, 0, 2).bi, 1), 'ch7 read-only sharing');
    await pick(page, 'diW', '0.05'); await pick(page, 'diH', '4'); await pick(page, 'diC', '1'); await page.waitForTimeout(60);
    ok((await text(page, '#diBi')) === zf(P.dW5h4[0], 0), 'ch7 four hosts, 5 % writes, got ' + await text(page, '#diBi'));

    // ch9 ring stepper
    await show(page, '#rgTab', 150);
    await click(page, '#rgStep'); await page.waitForTimeout(30);
    ok((await text(page, '#rgK')) === '1 / 6' && (await page.$$eval('#rgTab td.new', t => t.length)) === 4, 'ch9 ring first step: four chunks move');
    await click(page, '#rgAll'); await page.waitForTimeout(30);
    const R4 = M.ringSteps(4);
    ok((await page.$$eval('#rgTab tbody tr:first-child td', t => t.map(x => x.textContent).join(','))) === R4.total.join(','), 'ch9 ring done: every GPU holds the totals');
    ok(await page.$eval('#rgStep', e => e.disabled), 'ch9 step disabled when done');
    ok((await page.$eval('#rgSay', e => e.textContent)).includes('完成'), 'ch9 done sentence');
    await pick(page, 'rgN', '5'); await page.waitForTimeout(30);
    ok((await text(page, '#rgK')) === '0 / 8', 'ch9 five GPUs reset to step 0 of 8');

    // ch9 all-reduce time
    await show(page, '#arCv', 200);
    ok((await text(page, '#arNv')) === zf(P.arNv5[0], 0) + ' 毫秒' && (await text(page, '#arNet')) === zf(P.arIb[0], 0) + ' 毫秒', 'ch9 default 8B, 72 GPUs, got ' + await text(page, '#arNv'));
    const h9 = await canvasHash(page, 'arCv');
    await pick(page, 'arP', '1e9'); await pick(page, 'arN', '8'); await page.waitForTimeout(60);
    ok((await text(page, '#arNv')) === tm(M.allreduce(1e9, 8, 'nv5').t), 'ch9 1B, 8 GPUs');
    ok((await page.$eval('#arSay', e => e.textContent)).includes('固定开销'), 'ch9 1B, 8 GPUs: sentence quotes the step cost');
    ok(h9 !== await canvasHash(page, 'arCv'), 'ch9 canvas redraws');

    // ch10 hierarchical
    await show(page, '#hiCv', 200);
    ok((await text(page, '#hiTot')) === tm(P.h1[0]) && (await text(page, '#hiFlat')) === tm(P.hFlat[0]), 'ch10 default 9,216 GPUs, domains of 72, got ' + await text(page, '#hiTot') + ' ' + await text(page, '#hiFlat'));
    await pick(page, 'hiG', '8'); await page.waitForTimeout(60);
    ok((await text(page, '#hiTot')) === tm(P.h8[0]), 'ch10 domains of 8, got ' + await text(page, '#hiTot'));
    await pick(page, 'hiNic', '800'); await page.waitForTimeout(60);
    ok((await text(page, '#hiTot')) === tm(M.hier(70e9, 9216, 8, 800).t), 'ch10 800 Gb/s NICs');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#tiCv', 400);
    const a = await canvasHash(page, 'tiCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'tiCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#tiLat')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, ten diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, nine models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
