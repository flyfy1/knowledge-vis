'use strict';
// Browser smoke test for the "What is a black hole, really?" essay.
// Usage (from the repo root, with a static server running):
//   ESSAY_BASE_URL=http://127.0.0.1:18913 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node earth/astronomy/what-is-a-black-hole/tests/browser.cjs
// Checks in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped in its box,
// every control at least 48×48 px, the toggle reads 中 | EN. Then: keyboard operation, the language toggle with or
// without copy.en.js, each model driven to its extremes with its live sentence read back, and reduced motion.
// If copy.en.js exists, the layout checks also run in English and fail on any CJK text left visible.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18913').replace(/\/$/, '');
const url = base + '/earth/astronomy/what-is-a-black-hole/';
const hasEn = fs.existsSync(path.join(__dirname, '..', 'copy.en.js'));
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const radio = (page, name, v) => page.evaluate(([n, v]) => { const r = document.querySelector(`input[name=${n}][value="${v}"]`); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }, [name, v]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const num = s => parseFloat(s.replace(/,/g, ''));

(async () => {
  const browser = await chromium.launch();
  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    // readout values stay on at most two lines (a secondary <small> line is allowed below the value)
    const tallTiles = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(b => {
      const tn = [...b.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()); if (!tn.length) return false;
      const r = document.createRange(); r.setStart(tn[0], 0); r.setEnd(tn[tn.length - 1], tn[tn.length - 1].length);
      return new Set([...r.getClientRects()].map(q => Math.round(q.top))).size > 2; }).map(b => b.id + ' "' + b.textContent.trim().slice(0, 24) + '"'));
    ok(!tallTiles.length, `${tag}: readout value wraps to 3+ lines: ${tallTiles.join(', ')}`);
    if (lang === 'en') {
      const leaks = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!rx.test(n.textContent) || !el.getClientRects().length) continue; if (el.closest('#langToggle') && n.textContent.trim() === '中') continue; out.push('text: ' + n.textContent.trim().slice(0, 30)); }
        for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria-label: ' + e.getAttribute('aria-label'));
        if (rx.test(document.title)) out.push('title: ' + document.title);
        for (const s of window.__canvasStrings) if (rx.test(s)) out.push('canvas: ' + s);
        return out.slice(0, 8);
      }, CJK.source);
      ok(!leaks.length, `${tag}: Chinese visible in English mode: ${leaks.join(' | ')}`);
    }
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    // keyboard: a slider moves with the arrow keys, a radio with the arrow keys, a button with Enter
    await show(page, '#esP'); await page.focus('#esP'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('#esP', e => e.value) === '2', 'keyboard: slider moves with arrow keys');
    await page.focus('input[name=esObj][value=sun]'); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('input[name=esObj][value=sgra]', e => e.checked), 'keyboard: radio group moves with arrow keys');
    await show(page, '#obSwap'); await page.focus('#obSwap'); await page.keyboard.press('Enter');
    ok(await page.$eval('#obSwap', e => e.getAttribute('aria-pressed')) === 'true', 'keyboard: toggle button with Enter');
    const focusStyle = await page.$eval('#obSwap', e => getComputedStyle(e).outlineStyle);
    ok(focusStyle !== 'none', 'keyboard: visible focus outline');
    await page.click('#obSwap');

    // language toggle: switches instantly; without copy.en.js it falls back to Chinese and says so via html lang
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    const enLoaded = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    ok(await page.evaluate(() => document.documentElement.lang) === (enLoaded ? 'en' : 'zh-CN'), 'EN toggle: html lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title filled after switching');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1: squeezing to 100% reaches c at r_s, for every object
    await show(page, '#esCv', 200);
    for (const o of ['earth', 'sun', 'sgra']) {
      await radio(page, 'esObj', o); await setRange(page, 'esP', 100);
      ok((await text(page, '#esFrac')) === '1.00' && (await text(page, '#esR')) === (await text(page, '#esRs')), `ch1 ${o}: at 100% the radius is r_s and v = c`);
      ok((await text(page, '#esSay')).includes('史瓦西半径'), `ch1 ${o}: sentence at r_s`);
      await setRange(page, 'esP', 0); ok(!(await text(page, '#esSay')).includes('史瓦西半径'), `ch1 ${o}: sentence at 0%`);
    }
    ok((await text(page, '#esRs')).startsWith('0.0848'), 'ch1 Sgr A* r_s 0.0848 AU');

    // ch2: presets and the water crossing
    await show(page, '#scCv', 200);
    await page.click('#ch2 [data-m=sun]'); ok((await text(page, '#scRs')).startsWith('2.95'), 'ch2 Sun preset 2.95 km');
    await setRange(page, 'scM', -6); ok((await text(page, '#scSay')).includes('倍'), 'ch2 lightest: denser than water');
    await setRange(page, 'scM', 10.5); ok((await text(page, '#scSay')).includes('比水'), 'ch2 heaviest: thinner than water');

    // ch3: the swap keeps the period; half the mass escapes; double the mass gives 140.6 days
    await show(page, '#obCv', 600);
    const t0 = await text(page, '#obT'); await page.click('#obSwap'); await page.waitForTimeout(300);
    ok((await text(page, '#obT')) === t0 && t0.startsWith('365.3'), 'ch3 swap keeps 365.3 days, got ' + t0);
    ok((await text(page, '#obSay')).includes('一点没变'), 'ch3 swap sentence');
    await setRange(page, 'obF', 0.5); ok((await text(page, '#obSay')).includes('抛物线'), 'ch3 half mass: parabola');
    await setRange(page, 'obF', 0.25); ok((await text(page, '#obSay')).includes('双曲线'), 'ch3 quarter mass: hyperbola');
    await setRange(page, 'obF', 2); ok((await text(page, '#obT')).startsWith('140.6'), 'ch3 double mass: 140.6 days');
    await page.waitForTimeout(1200); ok(num(await text(page, '#obR')) < 0.99, 'ch3 the planet falls inward after the mass doubles');
    await setRange(page, 'obF', 1);

    // ch4: default precesses; 0.8 plunges in GR but not in Newton; the simulation reaches the horizon
    await show(page, '#grCv', 200);
    ok((await text(page, '#grPrec')).startsWith('153.4'), 'ch4 default precession 153.4°');
    await setRange(page, 'grK', 0.8); await page.waitForTimeout(3500);
    ok((await text(page, '#grPeri')) === '落入视界' && (await text(page, '#grSay')).includes('落进视界'), 'ch4 k=0.8 plunges');
    await radio(page, 'grTh', 'newton'); ok((await text(page, '#grPrec')).startsWith('0.0'), 'ch4 Newton: no precession');
    for (const [r, k] of [[4, 0.5], [4, 1.3], [20, 0.5], [20, 1.3], [6, 1]]) for (const th of ['gr', 'newton']) {
      await radio(page, 'grTh', th); await setRange(page, 'grR', r); await setRange(page, 'grK', k);
      const s = await text(page, '#grSay'); ok(s.length > 10 && !s.includes('—') && !s.includes('{'), `ch4 ${th} r0=${r} k=${k}: sentence "${s}"`);
    }
    await radio(page, 'grTh', 'gr');

    // ch5: torn outside a 10 M☉ hole, intact at Sgr A*; near the dividing mass the sentence does not say "far"
    await show(page, '#tdCv', 200);
    await setRange(page, 'tdM', 1); await setRange(page, 'tdX', 0);
    ok((await text(page, '#tdR1')).includes('276'), 'ch5 10 M☉: 1 g at 276 r_s');
    await setRange(page, 'tdM', 6.63); ok((await text(page, '#tdSay')).includes('完好地穿过'), 'ch5 Sgr A*: crosses intact');
    await setRange(page, 'tdM', 4.66); await setRange(page, 'tdX', 0); ok(!(await text(page, '#tdSay')).includes('还远'), 'ch5 near the dividing mass: not "still far"');
    await setRange(page, 'tdM', 0); await setRange(page, 'tdX', 3); ok((await text(page, '#tdSay')).includes('还远'), 'ch5 1 M☉ at 1000 r_s: already over 1 g, horizon far');

    // ch6: clocks
    await show(page, '#ckCv', 200);
    ok((await text(page, '#ckRate')) === '0.577', 'ch6 default 0.577 at 1.5 r_s');
    await setRange(page, 'ckX', -2); ok((await text(page, '#ckRate')) === '0.0995', 'ch6 1.01 r_s → 0.0995');
    await radio(page, 'ckM', 'sgra'); ok((await text(page, '#ckAcc')).startsWith('3.6'), 'ch6 Sgr A* hover 3.6 × 10⁶ g');
    await setRange(page, 'ckX', 3); ok((await text(page, '#ckSay')).includes('只慢'), 'ch6 far sentence');

    // ch7: light, captured below b_c and escaping above it
    await show(page, '#ltCv', 200);
    await setRange(page, 'ltB', 2.59); ok((await text(page, '#ltFate')) === '被吞掉', 'ch7 b=2.59 captured');
    await setRange(page, 'ltB', 2.61); ok((await text(page, '#ltFate')) === '逃了出来', 'ch7 b=2.61 escapes');
    await setRange(page, 'ltB', 0); ok((await text(page, '#ltSay')).includes('视界本身'), 'ch7 b=0');
    await setRange(page, 'ltB', 12); ok((await text(page, '#ltSay')).includes('弱场'), 'ch7 b=12 weak field');
    await setRange(page, 'ltB', 3); ok((await text(page, '#ltDef')).startsWith('98.5'), 'ch7 default deflection 98.5°');

    // ch8: Kepler weighs Sgr A*; mass ∝ D³; the star moves
    await show(page, '#s2Cv', 200);
    ok((await text(page, '#s2M')).startsWith('4.26'), 'ch8 4.26 × 10⁶');
    const y0 = await text(page, '#s2Y'); await page.waitForTimeout(800); ok((await text(page, '#s2Y')) !== y0, 'ch8 star moves');
    await setRange(page, 's2D', 9000); ok((await text(page, '#s2Say')).includes('多了'), 'ch8 farther → more');
    await setRange(page, 's2D', 7500); ok((await text(page, '#s2Say')).includes('少了'), 'ch8 nearer → less');

    // ch9: chirp
    await show(page, '#gwCv', 200);
    ok((await text(page, '#gwF')).startsWith('68') && (await text(page, '#gwT')).startsWith('0.16'), 'ch9 GW150914: 68 Hz, 0.16 s');
    await setRange(page, 'gwA', 80); await setRange(page, 'gwB', 80); ok((await text(page, '#gwSay')).includes('管不到'), 'ch9 too heavy');
    await setRange(page, 'gwA', 5); await setRange(page, 'gwB', 5); ok((await text(page, '#gwF')).startsWith('440'), 'ch9 5+5: 440 Hz');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // English drive: every slider at min / awkward middles / max, every radio and button; every live sentence and
  // readout must be filled (no {placeholder}, no NaN/undefined), contain no CJK, and use English number format
  if (hasEn) for (const width of [1280, 320]) {
    const page = await open(browser, width, { lang: 'en' });
    const bad = [];
    const audit = async where => {
      const r = await page.evaluate(re => { const rx = new RegExp(re); return [...document.querySelectorAll('.say, .read b, .ctl output')].map(e => [e.id, e.textContent]).filter(([, s]) => /\{\w+\}|NaN|undefined|Infinity/.test(s) || rx.test(s) || /\d\s\d{3}\b/.test(s) || /万|亿/.test(s)); }, CJK.source);
      for (const [id, s] of r) bad.push(`${where} #${id}: "${s.slice(0, 60)}"`);
    };
    for (const sec of await page.$$eval('section.ch', ss => ss.map(s => s.id))) {
      await show(page, '#' + sec, 150);
      for (const id of await page.$$eval(`#${sec} input[type=range]`, es => es.map(e => e.id))) {
        const [mn, mx] = await page.$eval('#' + id, e => [+e.min, +e.max]);
        for (const f of [0, 0.013, 0.37, 0.5, 0.77, 0.996, 1]) { await setRange(page, id, mn + (mx - mn) * f); await audit(`${sec} ${id}=${f}`); }
        await setRange(page, id, await page.$eval('#' + id, e => e.defaultValue));
      }
      for (const [name, v] of await page.$$eval(`#${sec} input[type=radio]`, es => es.map(e => [e.name, e.value]))) { await radio(page, name, v); await audit(`${sec} ${name}=${v}`); }
      for (const b of await page.$$(`#${sec} button`)) { await b.click(); await page.waitForTimeout(60); await audit(`${sec} button`); }
    }
    ok(!bad.length, `en ${width} drive: ${bad.slice(0, 6).join(' | ')}`);
    const leaks = await page.evaluate(re => [...window.__canvasStrings].filter(s => new RegExp(re).test(s)), CJK.source);
    ok(!leaks.length, `en ${width} drive: Chinese on canvas: ${leaks.join(' | ')}`);
    ok(!page.__errors().length, `en ${width} drive: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // reduced motion: no smooth scroll; models show their end state without waiting
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#obCv', 300); const r1 = await text(page, '#obR'); await page.waitForTimeout(600); ok((await text(page, '#obR')) === r1, 'reduced motion: ch3 does not animate');
    await show(page, '#s2Cv', 300); const y = await text(page, '#s2Y'); await page.waitForTimeout(600); ok((await text(page, '#s2Y')) === y, 'reduced motion: ch8 star does not move');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser test (${hasEn ? 'zh and en' : 'zh'} at 1280/390/320: overflow, clipped text, 48px targets; keyboard; language toggle; all nine models driven to their extremes; reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
