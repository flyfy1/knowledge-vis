'use strict';
// Browser test for the essay on what travels through empty space.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:19004 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node physics/electromagnetism/what-travels-through-empty-space/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes a full-page screenshot and one per diagram and per model at each width (never into
// the repo). Run browser tests one at a time.
// Checks at 1280/390/320 (Chinese; English too unless page.json declares "languages": {"en": "stub"}, which the build
// marks as data-lang-en="stub" on <html>): no
// console or page errors, no horizontal overflow, no clipped text, every control at least 48×48 px, no raw copy keys in
// the DOM or on a canvas, every readout and live sentence filled; the twelve static diagrams (STANDARD §4a): the
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
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:19004').replace(/\/$/, '');
const url = base + '/physics/electromagnetism/what-travels-through-empty-space/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 12;
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
  const stub = await (async () => { const p = await open(browser, 1280); const s = await p.evaluate(() => !window.ESSAY_COPY.en || document.documentElement.dataset.langEn === 'stub'); await p.close(); return s; })();
  const langs = stub ? ['zh'] : ['zh', 'en'];
  if (stub) console.log('NOTE: content.en.md is a structural stub (page.json languages.en: stub); English width sweep skipped');
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
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
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
        for (let n; (n = w.nextNode());) { if (!rx.test(n.textContent)) continue; if (n.parentElement.closest('#langToggle')) continue;
          const pz = n.parentElement.closest('.page-provenance .provenance-zh'); if (pz && getComputedStyle(pz).display === 'none') continue; // the label's zh half, hidden in English (page-provenance.css)
          out.push(n.textContent.trim().slice(0, 24)); }
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
    ok((await text(page, 'h1')) === Z['hero.title'], 'en stub: Chinese title shown');
    ok(await page.$eval('#langToggle button[data-lang=en]', b => b.getAttribute('aria-pressed')) === 'true', 'en stub: toggle still records the choice');
    await page.close();
  }

  /* every live-sentence branch, through the controls */
  {
    const page = await open(browser, 1280);
    const T = 'branches';
    for (const fig of await page.$$('figure.lab')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(60); }
    // ch2
    await says(page, 'c2Say', 'ch2.say.in', T);
    ok((await text(page, '#c2I')) === (await text(page, '#c2Id')), 'ch2: displacement current readout equals the wire current');
    ok((await text(page, '#c2Bg')) === M.sig(M.capacitor(M.LAB.cap).Bgap(M.capacitor(M.LAB.cap).tau, 0.5 * M.LAB.cap.a) * 1e9, 3) + ' nT', 'ch2: gap field readout = model');
    await setRange(page, 'c2R', 1.5); await says(page, 'c2Say', 'ch2.say.out', T);
    ok((await text(page, '#c2Bg')) === (await text(page, '#c2Bw')), 'ch2: outside the plates both surfaces give the same field');
    await click(page, '#c2Mx'); await says(page, 'c2Say', 'ch2.say.off', T); ok((await text(page, '#c2Bg')) === '0 nT', 'ch2: without the term the gap field is 0'); await click(page, '#c2Mx');
    // ch3 (the grid only runs while its canvas is on screen)
    await page.$eval('#c3Cv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200);
    await says(page, 'c3Say', 'ch3.say.magic', T);
    ok((await text(page, '#c3V')) === '299,792,458 m/s' && (await text(page, '#c3C')) === '299,792,458 m/s', 'ch3: measured speed and 1/sqrt(mu0 eps0) both read 299,792,458 m/s at S = 1');
    await setRange(page, 'c3S', 0.5); await says(page, 'c3Say', 'ch3.say.ok', T);
    ok((await text(page, '#c3V')) === M.fmt(M.measureSpeed(0.5).v, 0) + ' m/s', 'ch3: speed at S = 0.5 = model');
    await page.waitForTimeout(700); ok(/^(100\.0000|99\.9999)%$/.test(await text(page, '#c3U')), 'ch3: energy stays at 100.0000% while running: ' + await text(page, '#c3U'));
    const s1 = +(await text(page, '#c3N')).replace(/,/g, ''); await page.waitForTimeout(300); ok(+(await text(page, '#c3N')).replace(/,/g, '') > s1, 'ch3: the model is running');
    await click(page, '#c3Pause'); const s2 = await text(page, '#c3N'); await page.waitForTimeout(300); ok((await text(page, '#c3N')) === s2, 'ch3: pause stops it');
    ok((await text(page, '#c3Pause')) === Z['ch3.btn.play'], 'ch3: the pause button now offers to continue');
    await click(page, '#c3Step'); ok(+(await text(page, '#c3N')).replace(/,/g, '') === +s2.replace(/,/g, '') + 40, 'ch3: one press walks 40 steps');
    // just past the Courant limit: first "growing", then blown
    const g0 = await page.evaluate(() => { const e = document.getElementById('c3S'); e.value = '1.05'; e.dispatchEvent(new Event('input', { bubbles: true })); return document.getElementById('c3Say').textContent; });
    ok(tre('ch3.say.growing').test(g0), `${T}: #c3Say should follow ch3.say.growing right after restart; got "${g0.slice(0, 60)}"`);
    await page.waitForTimeout(1500); await says(page, 'c3Say', 'ch3.say.blown', T);
    ok((await text(page, '#c3Say')).includes(String(M.stabilityRun(1.05, 2000, { N: M.LAB.fdtd.N, width: M.LAB.fdtd.width }).blownAt)), 'ch3: the blow-up step in the sentence = model');
    await setRange(page, 'c3S', 1);
    // ch4
    await page.$eval('#c4Cv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200);
    { const a = await text(page, '#c3N'); await page.waitForTimeout(300); ok((await text(page, '#c3N')) === a, 'ch3: the grid stops stepping once it is off screen'); }
    await says(page, 'c4Say', 'ch4.say.denser', T);
    ok((await text(page, '#c4RF')) === '4.00%' && (await text(page, '#c4R')) === M.fmt(M.fresnelRun(1, 1.5, { N: M.LAB.iface.N, width: M.LAB.iface.width }).R * 100, 2) + '%', 'ch4: reflectance readouts (formula 4.00%, simulation = model)');
    await setRange(page, 'c4N1', 1.5); await says(page, 'c4Say', 'ch4.say.same', T); ok((await text(page, '#c4R')) === '0.00%', 'ch4: no step, nothing reflected');
    await setRange(page, 'c4N2', 1); await says(page, 'c4Say', 'ch4.say.rarer', T);
    // ch5
    await says(page, 'c5Say', 'ch5.say.half', T); ok((await text(page, '#c5R')) === '73.1 Ω' && (await text(page, '#c5D')) === '1.64 (2.15 dBi)', 'ch5: half-wave readouts');
    for (const [L, key] of [[0.1, 'short'], [0.75, 'mid'], [1, 'full'], [1.25, 'long']]) { await setRange(page, 'c5L', L); await says(page, 'c5Say', 'ch5.say.' + key, T); }
    ok((await text(page, '#c5Lobes')) === '3', 'ch5: three lobes at 1.25 λ');
    // ch6
    await says(page, 'c6Say', 'ch6.say.earth', T); ok((await text(page, '#c6I')) === '1,361 W/m²', 'ch6: 1,361 W/m² at 1 au: ' + await text(page, '#c6I'));
    await setRange(page, 'c6D', -0.3); await says(page, 'c6Say', 'ch6.say.near', T);
    await setRange(page, 'c6D', 1.5); await says(page, 'c6Say', 'ch6.say.far', T);
    await says(page, 'c6pSay', 'ch6.pol.say.one', T); ok((await text(page, '#c6Out')) === '12.5%', 'ch6: three polarisers pass 12.5%');
    await setRange(page, 'c6Th', 0); await says(page, 'c6pSay', 'ch6.pol.say.oneBlock', T);
    await pick(page, 'c6K', '0'); await says(page, 'c6pSay', 'ch6.pol.say.zero', T); ok(await page.$eval('#c6Th', e => e.disabled), 'ch6: the angle slider is off unless one sheet is inserted');
    await pick(page, 'c6K', '3'); await says(page, 'c6pSay', 'ch6.pol.say.many', T); ok((await text(page, '#c6Out')) === M.fmt(M.crossedStack(3).out * 100, 1) + '%', 'ch6: three sheets between = model');
    // ch7
    await says(page, 'c7Say', 'ch7.say.micro', T);
    for (const [ex, key] of [['am', 'radio'], ['oven', 'micro'], ['body', 'ir'], ['green', 'vis'], ['uvc', 'uv'], ['xray', 'xray'], ['gamma', 'gamma']]) { await click(page, `#lab7 [data-ex=${ex}]`); await says(page, 'c7Say', 'ch7.say.' + key, T + ' ' + ex); }
    await setRange(page, 'c7F', 16); await says(page, 'c7Say', 'ch7.say.uvIon', T);
    await click(page, '#lab7 [data-ex=oven]'); ok((await text(page, '#c7Lam')) === '12.2 cm', 'ch7: 2.45 GHz is 12.2 cm: ' + await text(page, '#c7Lam'));
    await says(page, 'c7wSay', 'ch7.w.say.oven', T);
    for (const [x, key] of [[-0.5, 'low'], [1.28, 'peak'], [1.9, 'high']]) { await setRange(page, 'c7W', x); await says(page, 'c7wSay', 'ch7.w.say.' + key, T); }
    // ch8
    await says(page, 'c8Say', 'ch8.say.o2G', T);
    await setRange(page, 'c8F', 1); await says(page, 'c8Say', 'ch8.say.clearG', T);
    ok((await text(page, '#c8A')) === M.sig(M.seaLevel(10).total, 3) + ' dB/km', 'ch8: 10 GHz readout = model: ' + await text(page, '#c8A'));
    await setRange(page, 'c8F', 2.265); await says(page, 'c8Say', 'ch8.say.h2oG', T);
    await pick(page, 'c8Path', 'zenith'); await says(page, 'c8Say', 'ch8.say.h2oZ', T);
    await setRange(page, 'c8F', 1.78); await says(page, 'c8Say', 'ch8.say.o2Z', T);
    await setRange(page, 'c8F', 1); await says(page, 'c8Say', 'ch8.say.clearZ', T);
    await setRange(page, 'c8H', 0); ok((await text(page, '#c8Wv')) === '0%', 'ch8: dry air, no water-vapour share');
    // ch9
    await says(page, 'c9Say', 'ch9.say.am', T); ok((await text(page, '#c9Bw')) === '16 kHz' && (await text(page, '#c9Side')) === '11.1%', 'ch9: AM m = 0.5, 8 kHz: 16 kHz wide, 11.1% in the sidebands');
    await setRange(page, 'c9Idx', 1.2); await says(page, 'c9Say', 'ch9.say.amOver', T);
    await pick(page, 'c9Type', 'fm'); await says(page, 'c9Say', 'ch9.say.fm', T); ok((await text(page, '#c9Rule')) === '96 kHz', 'ch9: Carson 2(5 + 1)·8 = 96 kHz');
    ok((await text(page, '#c9IdxL')) === Z['ch9.ctl.idxFm'], 'ch9: the index slider is relabelled for FM');
    await setRange(page, 'c9Idx', 0.3); await says(page, 'c9Say', 'ch9.say.fmNarrow', T);
    await setRange(page, 'c9Idx', 2.4); await says(page, 'c9Say', 'ch9.say.fmNull', T);
    for (const k of ['wifi', 'cell', 'gps', 'voyager']) { await pick(page, 'c9L', k); await says(page, 'c9lSay', 'ch9.link.say.' + k, T); ok((await text(page, '#c9Fs')) === M.fmt(M.link(k).fsplDb, 1) + ' dB', `ch9: ${k} path loss = model`); }
    await setRange(page, 'c9Dx', 1); ok((await text(page, '#c9Fs')) === M.fmt(M.link('voyager', 2).fsplDb, 1) + ' dB', 'ch9: twice the distance, 6 dB more');
    // ch10
    await says(page, 'c10Say', 'ch10.say.ok', T); ok((await text(page, '#c10Half')) === '17.1 km', 'ch10: half-power length 17.1 km at 1550 nm');
    await setRange(page, 'c10K', 9); await says(page, 'c10Say', 'ch10.say.amp', T);
    await setRange(page, 'c10K', 13); await says(page, 'c10Say', 'ch10.say.dead', T);
    await setRange(page, 'c10L', 850); ok((await text(page, '#c10A')) === M.fmt(M.fibreLoss(0.85).total, 2) + ' dB/km', 'ch10: 850 nm loss = model');
    // ch11
    await says(page, 'c11Say', 'ch11.say.rayleigh', T); ok((await text(page, '#c11Dip')) === '73.5%', 'ch11: 73.5% dip at the Rayleigh criterion');
    for (const [s, key] of [[0.5, 'merged'], [0.9, 'barely'], [1.5, 'clear']]) { await setRange(page, 'c11S', s); await says(page, 'c11Say', 'ch11.say.' + key, T); }
    for (const k of Object.keys(M.APERTURES)) { await pick(page, 'c11A', k); const s = await text(page, '#c11Note'); ok(tre('ch11.note.' + k).test(s) && !/\{\w+\}/.test(s), `${T}: #c11Note should follow ch11.note.${k}; got "${s.slice(0, 60)}"`); }
    await says(page, 'c11aSay', 'ch11.arr.say.ok', T); ok((await text(page, '#c11W')) === M.fmt(M.array(16, 0.5, 30).hpbw, 1) + '°' && (await text(page, '#c11P')) === '−90°', 'ch11: array readouts = model');
    await setRange(page, 'c11D', 1); await says(page, 'c11aSay', 'ch11.arr.say.grating', T); ok((await text(page, '#c11Gl')) === '−30°', 'ch11: grating lobe at −30° for d = λ, steered to 30°');
    await setRange(page, 'c11D', 0.5); await setRange(page, 'c11N', 2); await says(page, 'c11aSay', 'ch11.arr.say.few', T);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('.say, .read b, #c11Note')].filter(e => /\{[a-zA-Z_]\w*\}|NaN|undefined|Infinity/.test(e.textContent)).map(e => e.id + ':' + e.textContent.slice(0, 30)));
    ok(!unfilled.length, 'branches: bad values left: ' + unfilled.join(' | '));
    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* keyboard */
  {
    const page = await open(browser, 390);
    await page.$eval('#c5L', e => e.scrollIntoView({ block: 'center' }));
    await page.focus('#c5L'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('#c5L', e => e.value)) === '0.55' && (await text(page, '#c5Say')).includes('0.55'), 'keyboard: arrow key moves the antenna-length slider and updates the sentence');
    await page.focus('input[name=c9L][value=wifi]'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('input[name=c9L]:checked', e => e.value)) === 'cell' && tre('ch9.link.say.cell').test(await text(page, '#c9lSay')), 'keyboard: arrow key moves between link radios');
    await page.focus('#c3Pause'); await page.keyboard.press('Enter');
    ok((await page.$eval('#c3Pause', e => e.getAttribute('aria-pressed'))) === 'true', 'keyboard: Enter pauses the grid model');
    await page.close();
  }

  /* reduced motion */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(80); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    for (const id of ['c3Cv', 'c4Cv']) {
      await page.$eval('#' + id, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150);
      const h1 = await page.evaluate(i => document.getElementById(i).toDataURL(), id); await page.waitForTimeout(400);
      ok(h1 === await page.evaluate(i => document.getElementById(i).toDataURL(), id), `reduced motion: ${id} is still`);
    }
    ok(await page.$eval('#c3Pause', e => e.hidden) && await page.$eval('#c4Pause', e => e.hidden), 'reduced motion: no pause button (nothing runs by itself)');
    const n0 = +(await text(page, '#c3N')).replace(/,/g, ''); ok(n0 > 50, 'reduced motion: the grid opens on a mid-flight frame, not an empty one');
    await click(page, '#c3Step'); ok(+(await text(page, '#c3N')).replace(/,/g, '') === n0 + 40, 'reduced motion: the step button still walks the model');
    ok((await text(page, '#c4R')) !== '' && tre('ch4.say.denser').test(await text(page, '#c4Say')), 'reduced motion: the interface model shows its settled result');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); console.error(`${checks - fails.length}/${checks} checks passed`); process.exit(1); }
  console.log(`${checks}/${checks} checks passed`);
})();
