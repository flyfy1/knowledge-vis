'use strict';
// Browser smoke test for the essay on how cores share memory.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18952 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-cores-share-memory/tests/browser.cjs
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
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18952').replace(/\/$/, '');
const url = base + '/computing/systems/how-cores-share-memory/';
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
    ok(await page.$$eval('figure.dia svg', s => s.length) === 12, `${tag}: twelve diagrams (at least six required)`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
      if (e.closest('pre')) return false;
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
    ok((await text(page, 'h1')) === '多个核心怎么共用一块内存', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch5', e => e.textContent)).includes(zf(P.rc64[0], 0)), 'ch5 prose quotes the race result from the model');
    ok((await page.$eval('#ch10', e => e.textContent)).includes('MCS ' + zf(P.mcs4[0], 1)), 'ch10 prose quotes the MCS figure');

    // ch1 stale copy
    await show(page, '#s1Cells', 150);
    for (let i = 0; i < 4; i++) await click(page, '#s1Step');
    ok((await text(page, '#s1Last')) === 'x = 0' && (await text(page, '#s1Dv')) === '被破坏', 'ch1 no protocol: core 1 reads the stale 0, got ' + await text(page, '#s1Last'));
    ok(await page.$eval('#s1Step', e => e.disabled), 'ch1 step button disabled at the end');
    await pick(page, 's1P', 'mesi'); for (let i = 0; i < 4; i++) await click(page, '#s1Step');
    ok((await text(page, '#s1Last')) === 'x = 1' && (await text(page, '#s1Sw')) === '成立', 'ch1 MESI: core 1 reads 1');

    // ch3 simulator
    await show(page, '#smGrid', 200);
    await click(page, '#smR0'); await page.waitForTimeout(30);
    ok((await page.$eval('#smGrid tbody tr td:nth-child(2)', e => e.textContent)) === 'E', 'ch3 MESI: core 0 read fills E');
    await click(page, '#smR1'); await click(page, '#smW0'); await page.waitForTimeout(30);
    ok((await page.$eval('#smSay', e => e.textContent)).includes('BusUpgr') && (await text(page, '#smInv')) === '1', 'ch3 upgrade invalidates one copy');
    await click(page, '#smPmigratory'); await page.waitForTimeout(60);
    ok((await text(page, '#smWb')) === zf(P.mgMesiWb[0], 0), 'ch3 migratory under MESI writebacks, got ' + await text(page, '#smWb'));
    const h3 = await canvasHash(page, 'smCv');
    await pick(page, 'smProto', 'moesi'); await page.waitForTimeout(80);
    ok((await text(page, '#smWb')) === zf(P.mgMoesiWb[0], 0) && (await text(page, '#smTx')) === zf(P.mgMoesiTx[0], 0), 'ch3 migratory under MOESI');
    ok(h3 !== await canvasHash(page, 'smCv'), 'ch3 canvas redraws on protocol change');
    await pick(page, 'smProto', 'msi'); await click(page, '#smPprivate'); await page.waitForTimeout(40);
    ok((await text(page, '#smTx')) === zf(P.prMsiTx[0], 0), 'ch3 private under MSI');
    ok((await text(page, '#smInvar')) === '成立', 'ch3 invariants hold');
    await click(page, '#smReset'); await page.waitForTimeout(30);
    ok((await page.$$eval('#smLog span', s => s.length)) === 1, 'ch3 reset clears the log');

    // ch4 directory
    await show(page, '#drCv2', 200);
    ok((await text(page, '#drOv')) === pct(M.dirOverhead(64, 'full'), 1) && (await text(page, '#drS')) === zf(P.d64s[0], 1), 'ch4 default 64 cores');
    await page.focus('#drN'); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(80);
    ok((await text(page, '#drNo')) === '4' && (await page.$eval('#drSay', e => e.textContent)).includes('窥探还更省'), 'ch4 slider by keyboard to 4 cores: snooping wins');

    // ch5 lost update
    await show(page, '#luCv', 200);
    ok((await text(page, '#luN')) === zf(P.lu3n[0], 0) && (await text(page, '#luOk')) === pct(P.lu3ok[0], 1), 'ch5 default k = 3');
    await setRange(page, 'luK', 5); await page.waitForTimeout(60);
    ok((await text(page, '#luMin')) === zf(P.lu5min[0], 0) && (await text(page, '#luN')) === zf(P.lu5n[0], 0), 'ch5 k = 5');
    await click(page, '#luA'); await page.waitForTimeout(60);
    ok((await text(page, '#luOk')) === '100.0%', 'ch5 atomic: always right');
    await show(page, '#rcF', 100);
    ok((await text(page, '#rcF')) === zf(P.rc64[0], 0), 'ch5 race default b = 64');
    await setRange(page, 'rcB', 0); await page.waitForTimeout(60);
    ok((await text(page, '#rcF')) === zf(P.rc1[0], 0), 'ch5 race b = 1: exactly half');

    // ch6 CAS
    await show(page, '#caCv', 200);
    ok((await text(page, '#caS')) === zf(M.casLoop(8).stepsPerInc, 2), 'ch6 default 8 threads, got ' + await text(page, '#caS'));
    await setRange(page, 'caN', 5); await page.waitForTimeout(60);
    ok((await text(page, '#caF')) === pct(P.cas32f[0], 0), 'ch6 32 threads fail share');

    // ch7 contended line
    await show(page, '#ppCv', 200);
    ok((await text(page, '#ppTime')) === zf(P.piMs[0], 0) + ' 毫秒', 'ch7 default: two threads, same cluster, got ' + await text(page, '#ppTime'));
    await pick(page, 'ppP', 'socket'); await page.waitForTimeout(60);
    ok((await text(page, '#ppTime')) === zf(P.psMs[0], 0) + ' 毫秒', 'ch7 across sockets');
    await pick(page, 'ppM', 'private'); await page.waitForTimeout(60);
    ok((await page.$eval('#ppSay', e => e.textContent)).includes('越多越快'), 'ch7 private counters');
    await setRange(page, 'ppN', 1); await page.waitForTimeout(40);
    ok((await text(page, '#ppTime')) === '—', 'ch7 one thread: no time shown');

    // ch8 litmus
    await show(page, '#ltTbl', 150);
    ok((await text(page, '#ltSc')) === '不会出现' && (await text(page, '#ltTso')) === '允许' && (await text(page, '#ltWk')) === '允许', 'ch8 SB: SC forbids, TSO and weak allow');
    await pick(page, 'ltS', 'fence'); await page.waitForTimeout(40);
    ok((await text(page, '#ltTso')) === '不会出现' && (await text(page, '#ltWk')) === '不会出现', 'ch8 SB + fence');
    await pick(page, 'ltS', 'lock'); await page.waitForTimeout(40);
    ok((await text(page, '#ltTso')) === '不会出现' && (await text(page, '#ltWk')) === '允许', 'ch8 SB with xchg');
    await pick(page, 'ltT', 'LB'); await page.waitForTimeout(40);
    ok((await page.$eval('input[name=ltS][value=lock]', e => e.disabled)) && (await text(page, '#ltWk')) === '允许' && (await text(page, '#ltTso')) === '不会出现', 'ch8 LB: lock option hidden, weak allows');
    // ch9
    await show(page, '#mpTbl', 150);
    ok((await text(page, '#mpTso')) === '不会出现' && (await text(page, '#mpWk')) === '允许', 'ch9 MP: TSO forbids, weak allows');
    await pick(page, 'mpS', 'acqrel'); await page.waitForTimeout(40);
    ok((await text(page, '#mpWk')) === '不会出现', 'ch9 MP + release/acquire');

    // ch10 locks
    await show(page, '#lkCv', 300);
    ok((await text(page, '#lkP')) === zf(M.lockSim('ttas', 8).perHandoff, 1), 'ch10 default TTAS at 8 cores, got ' + await text(page, '#lkP'));
    await pick(page, 'lkK', 'mcs'); await setRange(page, 'lkN', 5); await page.waitForTimeout(80);
    ok((await text(page, '#lkP')) === zf(P.mcs64[0], 1), 'ch10 MCS at 64 cores');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#lkCv', 400);
    const a = await canvasHash(page, 'lkCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'lkCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#lkP')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, twelve diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, every model driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
