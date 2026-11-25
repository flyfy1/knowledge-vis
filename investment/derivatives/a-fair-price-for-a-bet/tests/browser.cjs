'use strict';
// Browser test for the essay on pricing a bet on the future (forwards, options, Black–Scholes and where it fails).
// Usage: ESSAY_BASE_URL=http://127.0.0.1:19007 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node investment/derivatives/a-fair-price-for-a-bet/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes a full-page screenshot and one per diagram and per model at each width (never into
// the repo). Run browser tests one at a time.
// Checks at 1280/390/320 (Chinese; English too unless page.json declares "languages": {"en": "stub"}, which the build
// marks as data-lang-en="stub" on <html>): no
// console or page errors, no horizontal overflow, no clipped text, every control at least 48×48 px, no raw copy keys in
// the DOM or on a canvas, every readout and live sentence filled; the nine static diagrams (STANDARD §4a): the
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
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:19007').replace(/\/$/, '');
const url = base + '/investment/derivatives/a-fair-price-for-a-bet/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 9, LABS = 13;
const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
const f = (x, d) => M.fmt(x, d, 'zh');
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
    ok(await page.$$eval('figure.lab', s => s.length) === LABS, `${tag}: thirteen models`);
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
    ok((await text(page, 'h1')) === R.title.zh, 'en stub: Chinese title shown');
    ok(await page.$eval('#langToggle button[data-lang=en]', b => b.getAttribute('aria-pressed')) === 'true', 'en stub: toggle still records the choice');
    await page.close();
  }

  /* every live-sentence branch, through the controls; readouts against the models */
  {
    const page = await open(browser, 1280);
    const T = 'branches', B = M.EX.base;
    const check = async (id) => { await page.$eval('#' + id, e => { if (!e.checked) e.click(); }); };
    const uncheck = async (id) => { await page.$eval('#' + id, e => { if (e.checked) e.click(); }); };
    // ch1
    await says(page, 'c1Say', 'ch1.say.carry', T);
    ok((await text(page, '#c1Fair')).startsWith(f(M.forward(100, 0.04, 0, 1), 2)), 'ch1: fair forward = model');
    ok((await text(page, '#c1Pro')).startsWith(f(110 - M.forward(100, 0.04, 0, 1), 2)), 'ch1: riskless profit = quote − fair');
    await setRange(page, 'c1F', 95); await says(page, 'c1Say', 'ch1.say.reverse', T);
    await setRange(page, 'c1R', 0); await setRange(page, 'c1F', 100); await says(page, 'c1Say', 'ch1.say.none', T);
    await setRange(page, 'c1R', 2); await setRange(page, 'c1Q', 5); ok((await text(page, '#c1Fair')).startsWith(f(M.forward(100, 0.02, 0.05, 1), 2)), 'ch1: income above the rate puts the forward below spot');
    // ch2
    for (const k of ['call', 'put', 'protect', 'fiduciary', 'covered', 'straddle', 'synth']) { await pick(page, 'c2St', k); await says(page, 'c2Say', 'ch2.say.' + k, T); }
    const C = M.bs(B).price, P = M.bs(Object.assign({}, B, { type: 'put' })).price;
    ok((await text(page, '#c2C')).startsWith(f(C, 2)) && (await text(page, '#c2P')).startsWith(f(P, 2)), 'ch2: C and P = model');
    ok((await text(page, '#c2CP')) === (await text(page, '#c2Rhs')), 'ch2: C − P equals the present value of S − K at K = 100');
    await setRange(page, 'c2K', 83); ok((await text(page, '#c2CP')) === (await text(page, '#c2Rhs')), 'ch2: … and at K = 83');
    await pick(page, 'c2St', 'protect'); const c1 = await text(page, '#c2Cost'); await pick(page, 'c2St', 'fiduciary'); ok(c1 === await text(page, '#c2Cost'), 'ch2: stock + put costs the same as call + deposit');
    // ch3
    await says(page, 'c3Say', 'ch3.say.hi', T);
    const o = M.oneStep(M.EX.one);
    ok((await text(page, '#c3Pr')).startsWith(f(o.price, 2)) && (await text(page, '#c3Na')).startsWith(f(o.naive(0.8), 2)), 'ch3: replication cost and naive value = model');
    await setRange(page, 'c3P', 30); await says(page, 'c3Say', 'ch3.say.lo', T);
    ok((await text(page, '#c3Pr')).startsWith(f(o.price, 2)), 'ch3: the price did not move with the probability');
    await setRange(page, 'c3K', 119); await setRange(page, 'c3P', 60); await says(page, 'c3Say', 'ch3.say.eq', T);
    await setRange(page, 'c3K', 125); await says(page, 'c3Say', 'ch3.say.zero', T);
    // ch4
    await says(page, 'c4Say', 'ch4.say.eu', T);
    ok((await text(page, '#c4Tree')).startsWith(f(M.crr(Object.assign({}, B, { N: 3 })).price, 3)), 'ch4: 3-step tree = model');
    await setRange(page, 'c4N', 150); ok((await text(page, '#c4Tree')).startsWith(f(M.crr(Object.assign({}, B, { N: 150 })).price, 3)), 'ch4: 150-step tree = model');
    await check('c4Am'); await says(page, 'c4Say', 'ch4.say.amCall', T);
    await pick(page, 'c4Ty', 'put'); await says(page, 'c4Say', 'ch4.say.amPut', T);
    ok((await text(page, '#c4Tree')).startsWith(f(M.crr(Object.assign({}, B, { N: 150, type: 'put', american: true })).price, 3)), 'ch4: American put = model');
    // ch5
    await says(page, 'c5Say', 'ch5.say.up', T);
    await setRange(page, 'c5Sig', 60); await says(page, 'c5Say', 'ch5.say.drag', T);
    await setRange(page, 'c5Mu', -10); await says(page, 'c5Say', 'ch5.say.down', T);
    const before = await text(page, '#c5Say'); await click(page, '#c5New'); ok(before === await text(page, '#c5Say'), 'ch5: a new set of paths does not change the stated distribution');
    // ch6
    await says(page, 'c6Say', 'ch6.say.ok', T);
    ok((await text(page, '#c6Pde')).startsWith(f(M.pde(Object.assign({}, B, { M: 60, Nt: 200 })).at(100), 3)), 'ch6: Crank–Nicolson readout = model');
    ok((await text(page, '#c6Need')).startsWith('145'), 'ch6: explicit scheme needs 145 steps on 60 nodes');
    await setRange(page, 'c6Tau', 0); await says(page, 'c6Say', 'ch6.say.zero', T); await setRange(page, 'c6Tau', 1);
    await pick(page, 'c6Sc', 'explicit'); await says(page, 'c6Say', 'ch6.say.exok', T);
    await setRange(page, 'c6Nt', 100); await says(page, 'c6Say', 'ch6.say.bad', T);
    await pick(page, 'c6M', '240'); await setRange(page, 'c6Nt', 400); await says(page, 'c6Say', 'ch6.say.bad', T);
    ok((await text(page, '#c6Need')).startsWith(f(M.pde(Object.assign({}, B, { M: 240, Nt: 400, scheme: 'explicit', stopAt: 0 })).stableNt, 0)), 'ch6: steps needed on 240 nodes = model');
    await pick(page, 'c6Sc', 'cn'); await says(page, 'c6Say', 'ch6.say.ok', T);
    // ch7
    for (const k of ['delta', 'gamma', 'vega', 'theta']) { await pick(page, 'c7G', k); await says(page, 'c7Say', 'ch7.say.' + k, T); }
    const g = M.bs(B); ok((await text(page, '#c7De')).includes(f(g.delta, 3)) && (await text(page, '#c7Pr')).startsWith(f(g.price, 2)), 'ch7: delta and price = model');
    await says(page, 'c7hSay', 'ch7.h.say.fair', T);
    const H = M.EX.hedge, h0 = M.hedgeSim(Object.assign({}, B, { sigmaImp: 0.2, sigmaReal: 0.2, n: H.NS[1], paths: H.paths, seed: H.seed }));
    ok((await text(page, '#c7hSd')).startsWith(f(h0.sd, 2)), 'ch7 hedge: spread readout = model');
    await setRange(page, 'c7hR', 10); await says(page, 'c7hSay', 'ch7.h.say.calm', T);
    await setRange(page, 'c7hR', 30); await says(page, 'c7hSay', 'ch7.h.say.wild', T);
    await setRange(page, 'c7hN', 4); await says(page, 'c7hSay', 'ch7.h.say.wild', T); await click(page, '#c7hNew'); await says(page, 'c7hSay', 'ch7.h.say.wild', T);
    // ch8
    const sm = M.smile('dec'), ia = sm.pts.indexOf(sm.atm);
    await says(page, 'c8Say', 'ch8.say.below', T);
    ok((await text(page, '#c8Iv')).startsWith(f(sm.pts[5].iv * 100, 1)), 'ch8: implied volatility readout = model');
    await setRange(page, 'c8K', ia); await says(page, 'c8Say', 'ch8.say.atm', T);
    await setRange(page, 'c8K', 18); await says(page, 'c8Say', 'ch8.say.above', T);
    await pick(page, 'c8E', 'mar'); await setRange(page, 'c8K', 2); await says(page, 'c8Say', 'ch8.say.below', T);
    ok((await text(page, '#c8Iv')).startsWith(f(M.smile('mar').pts[2].iv * 100, 1)), 'ch8: March expiry readout = model');
    await says(page, 'c8tSay', 'ch8.t.say.none', T);
    ok((await text(page, '#c8tObs')).startsWith(String(M.tails(5).obs)), 'ch8 tails: observed days = data');
    await setRange(page, 'c8tK', 2); await says(page, 'c8tSay', 'ch8.t.say.some', T);
    await setRange(page, 'c8tK', 10); await says(page, 'c8tSay', 'ch8.t.say.none', T);
    // ch9
    await says(page, 'c9Say', 'ch9.say.left', T);
    await setRange(page, 'c9Rho', 0.7); await says(page, 'c9Say', 'ch9.say.right', T);
    await setRange(page, 'c9Rho', 0); await says(page, 'c9Say', 'ch9.say.sym', T);
    await setRange(page, 'c9Xi', 0.15); await says(page, 'c9Say', 'ch9.say.small', T);
    await setRange(page, 'c9Xi', 0.05); await says(page, 'c9Say', 'ch9.say.flat', T);
    await setRange(page, 'c9Xi', 0.5); await setRange(page, 'c9Rho', -0.7); await click(page, '#c9New'); await says(page, 'c9Say', 'ch9.say.left', T);
    await says(page, 'c9mSay', 'ch9.m.say.closed', T);
    await check('c9mRes'); await says(page, 'c9mSay', 'ch9.m.say.calls', T); await uncheck('c9mRes');
    await setRange(page, 'c9mIm', 50); await says(page, 'c9mSay', 'ch9.m.say.quiet', T);
    await setRange(page, 'c9mIm', 2); ok((await text(page, '#c9mLev')).startsWith('50'), 'ch9 margin: 2% margin is 50× leverage');
    await click(page, '#c9mNew'); ok((await text(page, '#c9mSay')).length > 20, 'ch9 margin: a new path fills the sentence');
    // ch10
    await says(page, 'c10Say', 'ch10.say.best', T);
    ok((await text(page, '#c10Sd')).startsWith(f(M.minVar({ sigS: 15, sigF: 15, rho: 0.9, h: 1 }).sd, 1)), 'ch10: hedged sd = model');
    await setRange(page, 'c10H', 0.5); await says(page, 'c10Say', 'ch10.say.under', T);
    await setRange(page, 'c10H', 1.5); await says(page, 'c10Say', 'ch10.say.over', T);
    await setRange(page, 'c10H', 2); await says(page, 'c10Say', 'ch10.say.spec', T);
    await setRange(page, 'c10Rho', 1); await setRange(page, 'c10H', 1); ok(/^0[.,]0/.test(await text(page, '#c10Sd')), 'ch10: perfect correlation, full hedge: no risk left');
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('.say, .read b')].filter(e => /\{[a-zA-Z_]\w*\}|NaN|undefined|Infinity/.test(e.textContent)).map(e => e.id + ' ' + e.textContent.slice(0, 30)));
    ok(!unfilled.length, 'branches: bad values: ' + unfilled.join(' | '));
    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* keyboard */
  {
    const page = await open(browser, 390);
    await page.$eval('#c3P', e => e.scrollIntoView({ block: 'center' }));
    await page.focus('#c3P'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('#c3P', e => e.value)) === '81' && (await text(page, '#c3Say')).includes('81%'), 'keyboard: arrow key moves the probability slider and updates the sentence');
    await page.focus('input[name=c7G][value=delta]'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('input[name=c7G]:checked', e => e.value)) === 'gamma', 'keyboard: arrow key moves between the Greek radios');
    await page.focus('#c5New'); await page.keyboard.press('Enter'); ok(!page.__errors().length, 'keyboard: button by Enter');
    await page.close();
  }

  /* reduced motion */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(80); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    await page.$eval('#c5Cv', e => e.scrollIntoView({ block: 'center' })); await click(page, '#c5New'); await page.waitForTimeout(150);
    const h1 = await page.evaluate(() => document.getElementById('c5Cv').toDataURL().length);
    await page.waitForTimeout(500);
    ok(h1 === await page.evaluate(() => document.getElementById('c5Cv').toDataURL().length), 'reduced motion: the path canvas is drawn at once and stays still');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); console.error(`${checks - fails.length}/${checks} checks passed`); process.exit(1); }
  console.log(`${checks}/${checks} checks passed`);
})();
