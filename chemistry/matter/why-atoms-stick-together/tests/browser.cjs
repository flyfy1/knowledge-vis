'use strict';
// Browser test for the essay on why atoms stick together.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:19006 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node chemistry/matter/why-atoms-stick-together/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes a full-page screenshot and one per diagram and per model at each width (never into
// the repo). Run browser tests one at a time.
// Checks at 1280/390/320 in Chinese and in English (English is native since the 2026-11-18 review; a stub is a failure): no
// console or page errors, no horizontal overflow, no clipped text, every control at least 48×48 px, no raw copy keys in
// the DOM or on a canvas, every readout and live sentence filled; the twelve static diagrams (STANDARD §4a): the
// visible SVG variant for the width, role=img with an aria-label from the copy, every label non-empty, inside the
// drawing, not overlapping another label, rendered at 11 px or more; in English, no Chinese left in the DOM, in an
// aria-label, in the document title or on a canvas. Then: the language toggle reads 中 | EN and switching redraws the
// canvases; every branch of every live sentence, driven through the controls, matches its template, in both
// languages; readouts against the models; keyboard operation; reduced motion.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const ctxE = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ctxE);
const E = ctxE.window.ESSAY_COPY.en;
let C = Z; // the copy the sentence checks compare against; switched per language below
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:19006').replace(/\/$/, '');
const url = base + '/chemistry/matter/why-atoms-stick-together/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 12, LABS = 11;
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
const setCheck = (page, id, on) => page.evaluate(([id, on]) => { const e = document.getElementById(id); if (e.checked !== on) e.click(); }, [id, on]);
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const click = (page, sel) => page.$eval(sel, e => e.click());
const show = async (page, sel) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150); };
// a template from the copy as a regex over the rendered text: tags dropped, {vars} match anything
const tre = key => { const s = C[key].replace(/<[^>]+>/g, ''); return new RegExp('^' + s.split(/\{\w+\}/).map(p => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&')).join('[\\s\\S]*?') + '$'); };
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
  ok(!stub, 'English is native: copy.en.js is loaded and <html> carries no data-lang-en="stub"');
  const langs = ['zh', 'en'];
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of langs) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(140); }
    await show(page, '#lab6'); await page.waitForFunction(k => !document.getElementById('vSay').textContent.includes(k), (lang === 'zh' ? Z : E)['ch6.say.run'].split('{n}')[1].slice(0, 6), { timeout: 20000 }).catch(() => {});
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
    const layouts = await page.$$eval('figure.dia[data-dg]', fs => fs.map(f => [...f.querySelectorAll('svg')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.getAttribute('class')).join('')).join(''));
    ok(width >= 1280 ? layouts === 'w'.repeat(DIAGRAMS) : layouts === 'n'.repeat(DIAGRAMS), `${tag}: diagram layouts ${layouts}`);
    ok(await page.$$eval('figure.lab', s => s.length) === LABS, `${tag}: ${LABS} models`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    // a control's parts must stay inside it
    const spill = await page.evaluate(() => [...document.querySelectorAll('.ctl label, .ctl button')].filter(l => { const r = l.getBoundingClientRect(); if (!r.width) return false; return [...l.children].some(c => { const q = c.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.left < r.left - 1); }); }).slice(0, 5).map(l => (l.querySelector('input') || {}).id || l.textContent.trim().slice(0, 20)));
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
      if (e.closest('defs')) return false; // markers are not laid out
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!outside.length, `${tag}: elements outside the viewport: ${outside.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.[\w-]+)+$/.test(e.textContent.trim()) && !/^\d/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .read, output')].filter(e => /\{=?[a-zA-Z_][\w.]*\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b, .ctl output')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const sayLive = await page.$$eval('.say', s => s.every(e => e.getAttribute('aria-live') === 'polite'));
    ok(sayLive, `${tag}: every live sentence is aria-live`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
    const canvasCount = await page.evaluate(() => window.__ft.size);
    ok(canvasCount > 20, `${tag}: canvases drew their labels (${canvasCount} strings)`);
    const blank = await page.evaluate(() => [...document.querySelectorAll('canvas')].filter(cv => { const c = cv.getContext('2d'), d = c.getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 4 * 37) if (d[i]) return false; return true; }).map(cv => cv.id));
    ok(!blank.length, `${tag}: canvases never drawn: ${blank.join(', ')}`);
    ok((await text(page, '#langToggle')).replace(/\s+/g, '') === '中|EN' || (await page.$$eval('#langToggle button', b => b.map(x => x.textContent.trim()).join('|'))) === '中|EN', `${tag}: language toggle reads 中 | EN`);
    if (lang === 'en') {
      const attrs = await page.evaluate(re => { const rx = new RegExp(re), out = []; if (rx.test(document.title)) out.push('title ' + document.title.slice(0, 20));
        const md = document.querySelector('meta[name=description]'); if (md && rx.test(md.content)) out.push('meta description');
        for (const e of document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')) { if (e.closest('#langToggle')) continue; const pz = e.closest('.provenance-zh'); if (pz) continue;
          for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute(a); if (v && rx.test(v)) out.push(a + ' ' + v.slice(0, 20)); } }
        return out.slice(0, 6); }, CJK.source);
      ok(!attrs.length, `${tag}: Chinese left in English attributes: ${attrs.join(' | ')}`);
      const left = await page.evaluate(re => { const rx = new RegExp(re), out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { if (!rx.test(n.textContent)) continue; if (n.parentElement.closest('#langToggle')) continue;
          const pz = n.parentElement.closest('.page-provenance .provenance-zh'); if (pz && getComputedStyle(pz).display === 'none') continue;
          out.push(n.textContent.trim().slice(0, 24)); }
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas ' + t); return out.slice(0, 6); }, CJK.source);
      ok(!left.length, `${tag}: Chinese left in English: ${left.join(' | ')}`);
    }
    if (SHOT) {
      fs.mkdirSync(SHOT, { recursive: true });
      for (const fig of await page.$$('figure')) { const id = await fig.evaluate(e => e.id); await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(350); await fig.screenshot({ path: path.join(SHOT, `${lang}-${width}-${id}.png`) }); }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: path.join(SHOT, `${lang}-${width}-top.png`) });
    }
    ok(!page.__errors().length, `${tag}: console errors: ${page.__errors().slice(0, 3).join(' | ')}`);
    await page.close();
  }

  /* ── language toggle: switching redraws the canvases in the new language and back ── */
  {
    const page = await open(browser, 1280, { lang: 'zh' });
    for (const fig of await page.$$('figure.lab')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120); }
    await show(page, '#lab2');
    ok(CJK.test(await text(page, 'h1')), 'toggle: starts in Chinese');
    await page.evaluate(() => window.__ft.clear());
    await click(page, '#langToggle button[data-lang="en"]'); await page.waitForTimeout(500);
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'toggle: html lang becomes en');
    ok(await page.$eval('#langToggle button[data-lang="en"]', b => b.getAttribute('aria-pressed')) === 'true', 'toggle: en pressed');
    ok(!CJK.test(await text(page, 'h1')) && !CJK.test(await text(page, '#hSay')), 'toggle: title and live sentence are English');
    const drawn = await page.evaluate(() => [...window.__ft]);
    ok(drawn.includes(E['ch2.cv.y']) && !drawn.some(t => CJK.test(t)), `toggle: the visible canvas was redrawn in English (${drawn.slice(0, 4).join(', ')})`);
    ok(!CJK.test(await page.title()), 'toggle: document title is English');
    await page.evaluate(() => window.__ft.clear());
    await click(page, '#langToggle button[data-lang="zh"]'); await page.waitForTimeout(500);
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'toggle: back to zh-CN');
    ok((await page.evaluate(() => [...window.__ft])).includes(Z['ch2.cv.y']), 'toggle: the canvas was redrawn in Chinese');
    ok(!page.__errors().length, `toggle: console errors: ${page.__errors().slice(0, 3).join(' | ')}`);
    await page.close();
  }

  /* ── every model, every sentence branch (1280, Chinese then English) ── */
  for (const lang of ['zh', 'en']) {
    C = lang === 'zh' ? Z : E;
    const page = await open(browser, 1280, { lang }), ev = M.K.hartreeEv, f = (x, d) => M.fmt(x, d);
    // ch1
    await show(page, '#lab1');
    for (const [L, key] of [[0.1, 'big'], [0.2, 'bond'], [0.5, 'bond'], [0.6, 'small'], [1, 'small']]) {
      await setRange(page, 'bL', L); const r = M.boxMerge(L);
      ok((r.drop > 15 ? 'big' : r.drop >= 1 ? 'bond' : 'small') === key, `ch1: branch at L=${L}`);
      await says(page, 'bSay', 'ch1.say.' + key, `ch1 L=${L}`);
      ok((await text(page, '#bE1')).startsWith(f(r.narrow, 2)), `ch1: E1 readout at L=${L}`);
      ok((await text(page, '#bDrop')).startsWith(f(r.drop, 2)), `ch1: drop readout at L=${L}`);
    }
    // ch2
    await show(page, '#lab2');
    for (const opt of [false, true]) {
      await setCheck(page, 'hOpt', opt); const mn = M.h2plusMin(opt);
      for (const R of [0.6, 1, 2, 2.5, 3.5, 5.95, 6, 8]) {
        await setRange(page, 'hR', R); const d = opt ? M.h2plusOpt(R) : M.h2plus(R, 1);
        const key = d.bind >= 0 ? 'close' : R >= 6 ? 'far' : Math.abs(R - mn.R) <= 0.1 ? 'min' : 'mid';
        await says(page, 'hSay', 'ch2.say.' + key, `ch2 opt=${opt} R=${R}`);
        ok((await text(page, '#hE')).startsWith(f(d.bind * ev, 2)), `ch2: binding readout opt=${opt} R=${R}: ${await text(page, '#hE')}`);
        ok((await text(page, '#hZ')) === f(d.zeta, 3), `ch2: zeta readout opt=${opt} R=${R}`);
      }
    }
    const seen2 = new Set(); for (const opt of [false, true]) for (const R of [0.6, 1, 2, 2.5, 3.5, 5.95, 6, 8]) { const d = opt ? M.h2plusOpt(R) : M.h2plus(R, 1), mn = M.h2plusMin(opt); seen2.add(d.bind >= 0 ? 'close' : R >= 6 ? 'far' : Math.abs(R - mn.R) <= 0.1 ? 'min' : 'mid'); }
    ok(seen2.size === 4, `ch2: all four sentence branches were driven (${[...seen2]})`);
    // ch3
    await show(page, '#lab3');
    for (const [N, ring, key] of [[6, true, 'arom'], [4, true, 'anti'], [8, true, 'anti'], [10, true, 'arom'], [5, true, 'odd'], [3, false, 'odd'], [2, false, 'chainExp'], [4, false, 'chainExp'], [22, false, 'chainExp'], [10, false, 'chain'], [2, true, 'chainExp']]) {
      await setRange(page, 'kN', N); await setCheck(page, 'kRing', ring); const H = M.huckel(N, ring);
      await says(page, 'kSay', 'ch3.say.' + key, `ch3 N=${N} ring=${ring}`);
      ok((await text(page, '#kDel')).startsWith(f(H.deloc, 2)), `ch3: delocalisation readout N=${N} ring=${ring}`);
      ok((await text(page, '#kGap')).startsWith(f(H.gap, 2)), `ch3: gap readout N=${N} ring=${ring}`);
    }
    // ch4
    await show(page, '#lab4');
    for (const [D, B, key] of [[0, 2, 'cov'], [0.3, 2, 'cov'], [1, 2, 'polar'], [3, 2, 'mostly'], [10, 0.5, 'ion'], [10, 4, 'mostly'], [0, 0.5, 'cov']]) {
      await setRange(page, 'tD', D); await setRange(page, 'tB', B); const r = M.twoSite(D, B);
      ok((r.charge < 0.1 ? 'cov' : r.charge < 0.5 ? 'polar' : r.charge < 0.9 ? 'mostly' : 'ion') === key, `ch4: branch D=${D} B=${B}`);
      await says(page, 'tSay', 'ch4.say.' + key, `ch4 D=${D} B=${B}`);
      ok((await text(page, '#tW')).startsWith(f(r.wLow * 100, 0)), `ch4: share readout D=${D} B=${B}`);
    }
    await show(page, '#lab4m');
    for (const n of [1, 2, 3, 12]) {
      await setRange(page, 'mN', n); const s = M.madelungNaCl(n);
      await says(page, 'mSay', n === 1 ? 'ch4.mad.say.one' : 'ch4.mad.say.n', `ch4 mad n=${n}`);
      ok((await text(page, '#mEv')) === f(s.evjen, 4), `ch4 mad: Evjen readout n=${n}`);
      ok((await text(page, '#mSph')) === f(s.sphere, 3), `ch4 mad: sphere readout n=${n}`);
      ok((await text(page, '#mU')).startsWith(f(M.bornLande(s.evjen), 0)), `ch4 mad: lattice energy readout n=${n}`);
    }
    // ch5
    await show(page, '#lab5');
    for (const [N, D, key] of [[2, 0, 'metal'], [80, 0, 'metal'], [40, 0.1, 'semi'], [40, 1.4, 'semi'], [40, 1.6, 'ins'], [80, 4, 'ins'], [2, 4, 'ins']]) {
      await setRange(page, 'gN', N); await setRange(page, 'gD', D); const T = M.tbChain(N, D), gev = T.gap * M.TB_BETA_EV;
      ok((D === 0 ? 'metal' : gev <= 3 ? 'semi' : 'ins') === key, `ch5: branch N=${N} D=${D} (gap ${gev.toFixed(3)} eV)`);
      await says(page, 'gSay', 'ch5.say.' + key, `ch5 N=${N} D=${D}`);
      ok((await text(page, '#gGap')).startsWith(f(T.gap, 3)), `ch5: gap readout N=${N} D=${D}`);
    }
    // ch6
    await show(page, '#lab6');
    for (const n of [2, 3, 4, 5, 6]) {
      await pick(page, 'vN', n);
      await page.waitForFunction(() => /°/.test(document.getElementById('vAng').textContent), null, { timeout: 30000 }).catch(() => {});
      await says(page, 'vSay', 'ch6.say', `ch6 n=${n}`);
      const want = M.thomsonRelax(n, 5).angles.map(q => f(q.deg, 1) + '°').join(' / ');
      ok((await text(page, '#vAng')) === want, `ch6: angles for n=${n}: ${await text(page, '#vAng')} vs ${want}`);
      ok((await text(page, '#vName')) === C['ch6.shape.n' + n], `ch6: shape name n=${n}`);
    }
    await click(page, '#vShake'); await says(page, 'vSay', 'ch6.say.run', 'ch6 just after reshuffling');
    for (const [a, key] of [[90, 'p'], [90.5, 'h'], [104.5, 'h'], [109.5, 'h'], [180, 'h']]) { await setRange(page, 'vA', a); await says(page, 'vSay2', 'ch6.say2.' + key, `ch6 angle ${a}`); }
    await setRange(page, 'vA', 104.5); ok((await text(page, '#vHyb')).includes(f(M.hybridFromAngle(104.5).s * 100, 1)), 'ch6: s character at 104.5°');
    // ch7
    await show(page, '#lab7');
    await setRange(page, 'jT', 0.05); await click(page, '#jReset'); await page.waitForTimeout(1500);
    await says(page, 'jSay', 'ch7.say.solid', 'ch7 T=0.05');
    await setRange(page, 'jT', 1); await page.waitForTimeout(4000);
    await says(page, 'jSay', 'ch7.say.gas', 'ch7 T=1.00');
    ok(Math.abs(parseFloat(await text(page, '#jTm')) - 1) < 0.12, `ch7: measured temperature follows the thermostat: ${await text(page, '#jTm')}`);
    await setRange(page, 'jT', 0.45); await click(page, '#jReset'); await page.waitForTimeout(6000);
    const ph = await text(page, '#jSay'); ok(tre('ch7.say.liquid').test(ph) || tre('ch7.say.solid').test(ph) || tre('ch7.say.gas').test(ph), 'ch7: a phase sentence at T=0.45');
    await setCheck(page, 'jThermo', false); await page.waitForTimeout(400);
    const e1 = parseFloat((await text(page, '#jE')).replace('−', '-')); await page.waitForTimeout(2500); const e2 = parseFloat((await text(page, '#jE')).replace('−', '-'));
    ok(Math.abs(e1 - e2) <= 0.003, `ch7: total energy per atom holds with the thermostat off (${e1} → ${e2})`);
    await setCheck(page, 'jThermo', true);
    ok(await page.$eval('#jStep', e => e.hidden), 'ch7: the step button is hidden when motion is allowed');
    // ch8
    await show(page, '#lab8');
    for (const v of [0, 60, 100]) { await setRange(page, 'pN', v); await says(page, 'pSay', 'ch8.say', `ch8 slider ${v}`); }
    await setRange(page, 'pN', 0); ok((await text(page, '#pLen')) === '10', 'ch8: shortest chain is 10 links');
    await setRange(page, 'pN', 100); ok((await text(page, '#pLen')) === '3,000', `ch8: longest chain is 3,000 links (${await text(page, '#pLen')})`);
    const N8 = Math.round(Math.pow(10, 1 + 2.4771 * 0.6)); await setRange(page, 'pN', 60);
    ok((await text(page, '#pRms')) === f(M.chainRms(N8, 400, 11), 1), 'ch8: rms readout equals the model');
    const r1 = await text(page, '#pR'); await click(page, '#pNew'); ok((await text(page, '#pR')) !== r1, 'ch8: a new chain has a different end-to-end distance');
    // ch9
    await show(page, '#lab9');
    for (const k of ['s10', 's12', 's14']) {
      await pick(page, 'fSeq', k); const best = M.hpBest(M.HP_SEQS[k]);
      await says(page, 'fSay', 'ch9.say.done', `ch9 ${k} opens on a poor complete fold`);
      ok((await text(page, '#fCount')) === f(best.count, 0), `ch9: count readout ${k}`);
      await click(page, '#fBest'); await says(page, 'fSay', 'ch9.say.shown', `ch9 ${k} best`);
      ok((await text(page, '#fE')) === C['ch9.e.v'].replace('{v}', -best.energy), `ch9: best fold shows ${-best.energy} contacts (${k})`);
    }
    await pick(page, 'fSeq', 's12'); await click(page, '#fReset'); await says(page, 'fSay', 'ch9.say.start', 'ch9 reset');
    await click(page, '#fR'); await says(page, 'fSay', 'ch9.say.going', 'ch9 one move');
    await click(page, '#fL'); await says(page, 'fSay', 'ch9.say.blocked', 'ch9 move onto the chain');
    await click(page, '#fUndo'); await says(page, 'fSay', 'ch9.say.start', 'ch9 undo back to the start');
    for (const d of 'RRUULLDR') await click(page, '#f' + d);
    await says(page, 'fSay', 'ch9.say.stuck', 'ch9 dead end');
    await click(page, '#fReset'); for (const d of M.hpBest(M.HP_SEQS.s12).dirs) await click(page, '#f' + d);
    await says(page, 'fSay', 'ch9.say.doneBest', 'ch9 folded by hand to the ground state');
    await click(page, '#fR'); await says(page, 'fSay', 'ch9.say.doneBest', 'ch9 extra move after the end changes nothing');
    // ch10
    await show(page, '#lab10');
    await setRange(page, 'sX', 0); await says(page, 'sSay', 'ch10.say.one', 'ch10 x=1');
    for (const v of [1, 2, 8, 16]) { await setRange(page, 'sX', v); await says(page, 'sSay', 'ch10.say.x', `ch10 slider ${v}`); }
    await setRange(page, 'sX', 8); ok((await text(page, '#sDft')) === C['u.hour'].replace('{v}', f(1000 / 60, 0)), `ch10: DFT at ×10 is 1000 minutes: ${await text(page, '#sDft')}`);
    ok(!page.__errors().length, `models (${lang}): console errors: ${page.__errors().slice(0, 3).join(' | ')}`);
    await page.close();
  }
  C = Z;

  /* ── keyboard ── */
  {
    const page = await open(browser, 390);
    await show(page, '#lab1'); await page.focus('#bL'); const v0 = await page.$eval('#bL', e => e.value), s0 = await text(page, '#bE1');
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('#bL', e => e.value)) !== v0 && (await text(page, '#bE1')) !== s0, 'keyboard: arrow keys move the box-width slider and the readout follows');
    const ring = await page.evaluate(() => { const e = document.getElementById('bL'); const cs = getComputedStyle(e); return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2; });
    ok(ring, 'keyboard: the focused slider has a visible outline');
    await show(page, '#lab9'); await click(page, '#fReset'); await page.focus('#fR'); await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    ok((await text(page, '#fPlaced')).startsWith('3'), `keyboard: Enter and Space on a direction button place residues (${await text(page, '#fPlaced')})`);
    await show(page, '#lab6'); await page.focus('input[name=vN][value="4"]'); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('input[name=vN][value="5"]', e => e.checked), 'keyboard: arrow keys move through the electron-pair radio group');
    await page.close();
  }

  /* ── reduced motion ── */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scrolling');
    await show(page, '#lab6'); await says(page, 'vSay', 'ch6.say', 'reduced motion: electron pairs are already at rest');
    await pick(page, 'vN', 6); await says(page, 'vSay', 'ch6.say', 'reduced motion: a new count jumps to its final shape');
    await show(page, '#lab7');
    ok(!(await page.$eval('#jStep', e => e.hidden)), 'reduced motion: the step button is shown');
    const p0 = await page.evaluate(() => { const cv = document.getElementById('jCv'); return cv.toDataURL(); }); await page.waitForTimeout(700);
    const p1 = await page.evaluate(() => document.getElementById('jCv').toDataURL());
    ok(p0 === p1, 'reduced motion: the molecular dynamics does not run by itself');
    await click(page, '#jStep'); await page.waitForTimeout(300);
    ok((await page.evaluate(() => document.getElementById('jCv').toDataURL())) !== p1, 'reduced motion: the step button advances the simulation');
    await setRange(page, 'jT', 0.05); await click(page, '#jReset'); await says(page, 'jSay', 'ch7.say.solid', 'reduced motion: cold crystal');
    await setRange(page, 'jT', 1); await says(page, 'jSay', 'ch7.say.gas', 'reduced motion: hot gas after the jump');
    ok(!page.__errors().length, `reduced motion: console errors: ${page.__errors().slice(0, 3).join(' | ')}`);
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(`FAIL ${fails.length} of ${checks} checks`); fails.forEach(f => console.error(' - ' + f)); process.exit(1); }
  console.log(`OK ${checks} browser checks (zh + en at 1280/390/320, ${DIAGRAMS} diagrams, ${LABS} models, language toggle, every sentence branch in both languages, keyboard, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
