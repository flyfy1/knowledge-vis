'use strict';
// Browser test for the essay on how a CPU does math.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18971 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-a-cpu-does-math/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes a full-page screenshot and one per diagram and per model at each width (never into
// the repo). Run browser tests one at a time.
// Checks at 1280/390/320 (Chinese; English too once content.en.md is translated and meta.en is no longer "stub"): no
// console or page errors, no horizontal overflow, no clipped text, every control at least 48×48 px, no raw copy keys in
// the DOM or on a canvas, every readout and live sentence filled; the thirteen static diagrams (STANDARD §4a): the
// visible SVG variant for the width, role=img with an aria-label from the copy, every label non-empty, inside the
// drawing, not overlapping another label, and rendered at 11 px or more. Then: the English stub falls back to Chinese
// and says so in <html lang>; every branch of every live sentence, driven through the controls, matches its template;
// readouts against the models; keyboard operation of a slider; reduced motion.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18971').replace(/\/$/, '');
const url = base + '/computing/systems/how-a-cpu-does-math/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 13;
const fails = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
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
const setText = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]);
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const click = (page, sel) => page.$eval(sel, e => e.click());
// a template from the copy as a regex over the rendered text: tags dropped, {vars} match anything
const tre = key => { const s = Z[key].replace(/<[^>]+>/g, ''); return new RegExp(s.split(/\{\w+\}/).map(p => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&')).join('[\\s\\S]*?')); };
async function says(page, sayId, key, tag) { const s = await text(page, '#' + sayId); ok(tre(key).test(s), `${tag}: #${sayId} should follow ${key}; got "${s.slice(0, 90)}"`); }

function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia[data-dg]')) {
    const name = fig.dataset.dg, svg = [...fig.querySelectorAll('svg')].find(s => getComputedStyle(s).display !== 'none');
    if (!svg) { out.push(name + ': no visible svg'); continue; }
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
  const stub = await (async () => { const p = await open(browser, 1280); const s = await p.evaluate(() => !window.ESSAY_COPY.en || window.ESSAY_COPY.en['meta.en'] === 'stub'); await p.close(); return s; })();
  const langs = stub ? ['zh'] : ['zh', 'en'];
  if (stub) console.log('NOTE: content.en.md is a structural stub (meta.en: stub); English width sweep skipped');
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of langs) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
    const layouts = await page.$$eval('figure.dia[data-dg]', fs => fs.map(f => [...f.querySelectorAll('svg')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.getAttribute('class')).join('')).join(''));
    ok(width >= 1280 ? layouts === 'w'.repeat(DIAGRAMS) : layouts === 'n'.repeat(DIAGRAMS), `${tag}: diagram layouts ${layouts}`);
    ok(await page.$$eval('figure.lab', s => s.length) === 14, `${tag}: fourteen models`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fmt td, table.fmt th')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    // a control's parts must stay inside it (a squeezed range label once pushed its value onto the next control)
    const spill = await page.evaluate(() => [...document.querySelectorAll('.ctl label')].filter(l => { const r = l.getBoundingClientRect(); if (!r.width) return false; return [...l.children].some(c => { const q = c.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.left < r.left - 1); }); }).slice(0, 5).map(l => (l.querySelector('input') || {}).id || l.textContent.trim().slice(0, 20)));
    ok(!spill.length, `${tag}: control parts spill out of their label: ${spill.join(', ')}`);
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
    ok(!small.length, `${tag}: targets under 48px: ${small.slice(0, 6).join(', ')}`);
    const outside = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
      if (e.closest('defs') || e.closest('.tblwrap table')) return false; // markers are not laid out; the table scrolls in its own box
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!outside.length, `${tag}: elements outside the viewport: ${outside.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.[\w-]+)+$/.test(e.textContent.trim()) && !/^\d/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{[a-zA-Z_]\w*\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg|mode)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
    const canvasCount = await page.evaluate(() => window.__ft.size);
    ok(canvasCount > 20, `${tag}: canvases drew their labels (${canvasCount} strings)`);
    if (lang === 'en') {
      const left = await page.evaluate(re => { const rx = new RegExp(re), out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { if (!rx.test(n.textContent)) continue; if (n.parentElement.closest('#langToggle')) continue; out.push(n.textContent.trim().slice(0, 24)); }
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas ' + t); return out.slice(0, 6); }, CJK.source);
      ok(!left.length, `${tag}: Chinese left in English: ${left.join(' | ')}`);
      const leftAttr = await page.evaluate(re => { const rx = new RegExp(re); const out = [...document.querySelectorAll('[aria-label],[title],img[alt]')].filter(e => !e.closest('#langToggle')).map(e => (e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '') + (e.getAttribute('alt') || '')).filter(s => rx.test(s)); if (rx.test(document.title)) out.push('title ' + document.title); const d = document.querySelector('meta[name=description]'); if (d && rx.test(d.content)) out.push('meta description'); return out.slice(0, 6); }, CJK.source);
      ok(!leftAttr.length, `${tag}: Chinese in English aria-labels, title or description: ${leftAttr.join(' | ')}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) {
      await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
      for (const fig of await page.$$('figure')) {
        const id = await fig.evaluate(e => e.id || e.dataset.dg);
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }

  /* the English stub: choosing EN keeps Chinese and says so in <html lang> */
  if (stub) {
    const page = await open(browser, 1280, { lang: 'en' });
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'en stub: falls back to Chinese (html lang zh-CN)');
    ok((await text(page, 'h1')) === 'CPU 是怎么算小数的，又怎么一次算一排', 'en stub: Chinese title shown');
    ok(await page.$eval('#langToggle button[data-lang=en]', b => b.getAttribute('aria-pressed')) === 'true', 'en stub: toggle still records the choice');
    await page.close();
  }

  /* every live-sentence branch, through the controls */
  {
    const page = await open(browser, 1280);
    const T = 'branches';
    // ch1
    await setText(page, 'eIn', '0.1'); await says(page, 'eSay', 'ch1.say.norm', T);
    ok((await text(page, '#eHex')) === '0x3DCCCCCD', 'ch1: 0.1 → 0x3DCCCCCD');
    ok((await page.$$eval('#eBits button', b => b.length)) === 32, 'ch1: 32 bit buttons for binary32');
    await setText(page, 'eIn', '0.5'); await says(page, 'eSay', 'ch1.say.exact', T);
    await setText(page, 'eIn', '1e-40'); await says(page, 'eSay', 'ch1.say.sub', T);
    await setText(page, 'eIn', '1e-50'); await says(page, 'eSay', 'ch1.say.zero', T);
    await setText(page, 'eIn', '1e39'); await says(page, 'eSay', 'ch1.say.inf', T);
    await setText(page, 'eIn', 'abc'); await says(page, 'eSay', 'ch1.say.bad', T);
    await setText(page, 'eIn', '1'); await click(page, '#eBits button[data-i="8"]'); await says(page, 'eSay', 'ch1.say.bits', T);
    ok((await text(page, '#eHex')) === '0x3F000000', 'ch1: flipping the lowest exponent bit of 1 gives 0.5 (0x3F000000)');
    await pick(page, 'eFmt', 'fp16'); await setText(page, 'eIn', '0');
    for (let i = 1; i <= 5; i++) await click(page, `#eBits button[data-i="${i}"]`);
    await says(page, 'eSay', 'ch1.say.infBits', T);
    await click(page, '#eBits button[data-i="15"]'); await says(page, 'eSay', 'ch1.say.nan', T);
    await pick(page, 'eFmt', 'fp64'); await setText(page, 'eIn', '0.1');
    ok((await text(page, '#eExact')) === M.encode('0.1', 'fp64').exact, 'ch1: FP64 exact value of 0.1');
    // ch2
    await pick(page, 'c2Fmt', 'fp32');
    await setRange(page, 'c2X', 10); await says(page, 'c2Say', 'ch2.say.ok', T);
    await setRange(page, 'c2X', 24); await says(page, 'c2Say', 'ch2.say.half', T); await says(page, 'c2Say', 'ch2.say.clock', T);
    await setRange(page, 'c2X', 30); await says(page, 'c2Say', 'ch2.say.lost', T);
    ok((await text(page, '#c2Ulp')) === '128', 'ch2: ulp at 2^30 in binary32 is 128');
    // ch3
    await pick(page, 'c3Fmt', 'bf16'); await pick(page, 'c3D', '1'); await setRange(page, 'c3N', 2);
    await says(page, 'c3Say', 'ch3.say.stall', T); await says(page, 'c3Say', 'ch3.say.ru', T);
    ok((await text(page, '#c3rne')) === '256' && (await text(page, '#c3ru')) === '14,848', 'ch3: BF16 sums 256 (RNE) and 14,848 (RU)');
    await pick(page, 'c3Fmt', 'fp32'); await pick(page, 'c3D', '0.1'); await says(page, 'c3Say', 'ch3.say.noStall', T);
    // ch4
    for (const [k, key] of [[120, 'norm'], [140, 'sub'], [151, 'zero']]) { await setRange(page, 'c4K', k); await says(page, 'c4Say', 'ch4.say.' + key, T); }
    await setRange(page, 'c4K', 140); await click(page, '#c4Ftz'); await says(page, 'c4Say', 'ch4.say.flushed', T); await click(page, '#c4Ftz');
    ok(await page.$$eval('#c4Strip span.on', s => s.length) === 10, 'ch4: 10 significant bits at k = 140');
    // ch5
    for (const [i, key] of [[0, 'ok'], [5, 'bad'], [6, 'neg']]) { await setRange(page, 'c5O', i); await says(page, 'c5vSay', 'ch5.var.say.' + key, T); }
    await pick(page, 'c5Fmt', 'bf16'); await setRange(page, 'c5N', 2); await says(page, 'c5sSay', 'ch5.sum.say.stall', T);
    await pick(page, 'c5Fmt', 'fp32'); await says(page, 'c5sSay', 'ch5.sum.say.ok', T);
    // ch6
    for (const [x, key] of [[1.1, 'pos'], [1.002, 'neg'], [1.5, 'zero']]) { await setRange(page, 'c6X', x); await says(page, 'c6Say', 'ch6.say.' + key, T); }
    // ch7
    await pick(page, 'c7Fmt', 'fp16'); await setRange(page, 'c7S', -7); await says(page, 'c7Say', 'ch7.say.under', T);
    await pick(page, 'c7Fmt', 'bf16'); await says(page, 'c7Say', 'ch7.say.ok', T);
    await pick(page, 'c7Fmt', 'e4m3'); await setRange(page, 'c7S', 3); await says(page, 'c7Say', 'ch7.say.over', T);
    // ch8
    await setRange(page, 'c8A', 4); await pick(page, 'c8S', 'int8t'); await says(page, 'c8Say', 'ch8.say.bad', T);
    await pick(page, 'c8S', 'mxfp8'); await says(page, 'c8Say', 'ch8.say.good', T);
    ok((await text(page, '#c8Sq')).startsWith(M.fmt(M.scaleResult('mxfp8', 100).sqnr, 1, 'zh')), 'ch8: MXFP8 SQNR readout = model');
    // ch9
    await pick(page, 'c9W', '512'); await pick(page, 'c9T', 'f32'); await setRange(page, 'c9Thr', 0.3); await setRange(page, 'c9N', 1000);
    await says(page, 'c9Say', 'ch9.say.mask', T); await says(page, 'c9Say', 'ch9.say.tail', T);
    ok((await text(page, '#c9M')) === '0x2651' && (await page.$$eval('#c9Lanes span.on', s => s.length)) === 6, 'ch9: mask 0x2651, six lanes on');
    await pick(page, 'c9W', '256'); await setRange(page, 'c9N', 999); await says(page, 'c9Say', 'ch9.say.tailOld', T);
    await pick(page, 'c9W', '512'); await setRange(page, 'c9N', 992); await says(page, 'c9Say', 'ch9.say.full', T);
    // ch10
    await pick(page, 'c10Fmt', 'bf16'); await setRange(page, 'c10N', 1); await pick(page, 'c10L', '8'); await says(page, 'c10Say', 'ch10.say.diff', T);
    ok((await text(page, '#c10V')) === '1,992', 'ch10: 8 lanes give 1,992');
    await pick(page, 'c10L', '1'); await says(page, 'c10Say', 'ch10.say.same', T);
    // ch11
    await pick(page, 'c11Core', 'zen5'); await pick(page, 'c11Ker', 'dot'); await setRange(page, 'c11K', 1); await says(page, 'c11Say', 'ch11.fma.say.latency', T);
    await setRange(page, 'c11K', 8); await says(page, 'c11Say', 'ch11.fma.say.loads', T);
    await pick(page, 'c11Ker', 'sq'); await says(page, 'c11Say', 'ch11.fma.say.units', T);
    ok((await text(page, '#c11R')) === '2.00', 'ch11: eight accumulators, two FMAs per cycle');
    await pick(page, 'c11Pr', 'skx'); await setRange(page, 'c11B', 20); await says(page, 'c11lSay', 'ch11.lic.say.slow', T);
    await setRange(page, 'c11B', 900); await says(page, 'c11lSay', 'ch11.lic.say.fast', T);
    await pick(page, 'c11Pr', 'none'); await says(page, 'c11lSay', 'ch11.lic.say.none', T);
    // ch12
    await setRange(page, 'c12VL', 2); await setRange(page, 'c12N', 100); await says(page, 'c12Say', 'ch12.say', T);
    ok((await text(page, '#c12T')) === '7' && (await page.$$eval('#c12Pred > div', d => d.length)) === 7, 'ch12: 7 trips drawn');
    await setRange(page, 'c12VL', 0); await setRange(page, 'c12N', 200);
    ok((await text(page, '#c12More')).length > 0, 'ch12: more-rows note when trips exceed 12');
    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* keyboard */
  {
    const page = await open(browser, 390);
    await page.$eval('#c4K', e => e.scrollIntoView({ block: 'center' }));
    await page.focus('#c4K'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('#c4K', e => e.value)) === '141' && (await text(page, '#c4Say')).includes('141'), 'keyboard: arrow key moves the k slider and updates the sentence');
    await page.focus('input[name=c7Fmt][value=fp16]'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('input[name=c7Fmt]:checked', e => e.value)) === 'bf16', 'keyboard: arrow key moves between format radios');
    await page.close();
  }

  /* reduced motion */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(80); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    const h1 = await page.evaluate(() => { const c = document.getElementById('c3Cv'); return c.toDataURL().length; });
    await page.waitForTimeout(400);
    ok(h1 === await page.evaluate(() => document.getElementById('c3Cv').toDataURL().length), 'reduced motion: canvases are still');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); console.error(`${checks - fails.length}/${checks} checks passed`); process.exit(1); }
  console.log(`${checks}/${checks} checks passed`);
})();
