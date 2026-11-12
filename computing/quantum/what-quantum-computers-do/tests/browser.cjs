'use strict';
// Browser smoke test for the what-quantum-computers-do essay.
// Usage: QC_BASE_URL=http://127.0.0.1:18983 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/quantum/what-quantum-computers-do/tests/browser.cjs
// Checks, in Chinese and in English: no console/page errors, no horizontal overflow at 1280/390/320, no text
// clipped inside its own box, every control at least 48×48 px, the toggle reads 中 | EN; in English no CJK
// characters anywhere visible (DOM text, aria-labels, the document title, canvas fillText) apart from the 中
// button. Then the language toggle (works with or without copy.en.js), every model responding to its
// controls with the numbers the prose quotes, and reduced motion.
const { chromium } = require('playwright');
const base = (process.env.QC_BASE_URL || 'http://127.0.0.1:18983').replace(/\/$/, '');
const url = base + '/computing/quantum/what-quantum-computers-do/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 350) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };

(async () => {
  const browser = await chromium.launch();

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en') || lang === 'en', `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, .card *')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);
    const english = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    if (lang === 'en' && english) {
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

  // language toggle, then drive every model
  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')).length > 0 && CJK.test(await text(page, 'h1')), 'hero title filled in Chinese');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching (falls back to Chinese without copy.en.js)');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1: θ=60° measured along Z gives 75%; φ does not matter for Z
    await show(page, '#q1Cv');
    ok((await text(page, '#q1P')).includes('75.0'), 'ch1 P = 75.0%, got ' + await text(page, '#q1P'));
    await setRange(page, 'q1Ph', 250); ok((await text(page, '#q1P')).includes('75.0'), 'ch1 φ leaves Z statistics alone');
    await setRange(page, 'q1Th', 90); await setRange(page, 'q1Ph', 0); await pick(page, 'q1B', 'x');
    ok((await text(page, '#q1P')).includes('100.0'), 'ch1 X on |+> is certain, got ' + await text(page, '#q1P'));
    await page.click('#q1Hund'); ok(/100/.test(await text(page, '#q1N')), 'ch1 hundred shots counted');
    await setRange(page, 'q1Th', 0); await setRange(page, 'q1Th', 180);

    // ch2: φ=180 → all at D1; full peek → 50/50
    await show(page, '#mzCv');
    ok((await text(page, '#mzP0')) === '75.0%', 'ch2 default 75%, got ' + await text(page, '#mzP0'));
    await setRange(page, 'mzPh', 180); ok((await text(page, '#mzP1')) === '100.0%', 'ch2 φ=180 → D1');
    await setRange(page, 'mzPk', 30); ok((await text(page, '#mzVis')) === '70%', 'ch2 30% peek → visibility 70%');
    await setRange(page, 'mzPk', 100); ok((await text(page, '#mzP0')) === '50.0%', 'ch2 full peek → 50%');
    await setRange(page, 'mzPh', 0); await setRange(page, 'mzPk', 0);

    // ch3: best angles 85.4%; classical button reads 75%
    await show(page, '#chCv');
    ok((await text(page, '#chExact')) === '85.4%', 'ch3 exact 85.4%, got ' + await text(page, '#chExact'));
    ok(Math.abs(parseFloat(await text(page, '#chRate')) - 85.4) < 4, 'ch3 played rate near 85%: ' + await text(page, '#chRate'));
    await page.click('#chMany'); await page.click('#chReset'); ok((await text(page, '#chRounds')) === '0', 'ch3 reset');
    await setRange(page, 'chA0', 90); await setRange(page, 'chA0', -90); await page.click('#chBest');
    ok((await text(page, '#chExact')) === '85.4%', 'ch3 best button restores 85.4%');
    await pick(page, 'chWho', 'c'); await page.click('#chMany'); ok((await text(page, '#chRounds')) !== '0', 'ch3 classical play');
    await pick(page, 'chWho', 'q');

    // ch4: 30 qubits 17.2 GB; 60 qubits shows exabytes
    await show(page, '#mmCv');
    ok((await text(page, '#mmMem')).includes('17.2'), 'ch4 30 qubits 17.2 GB, got ' + await text(page, '#mmMem'));
    await setRange(page, 'mmN', 60); await page.waitForTimeout(150); ok(/EB/.test(await text(page, '#mmMem')), 'ch4 60 qubits in EB: ' + await text(page, '#mmMem'));
    await setRange(page, 'mmN', 1);
    await show(page, '#mmCv2'); await setRange(page, 'mmS', 10); await page.click('#mmShot'); ok(/^[01]{10}$/.test(await text(page, '#mmOut')), 'ch4 one shot gives 10 bits');
    await page.click('#mmNew'); await setRange(page, 'mmS', 1);

    // ch5: every function, verdict right
    await show(page, '#djCv');
    for (const [f, c] of [['c0', 1], ['c1', 1], ['b0', 0], ['b12', 0], ['par', 0], ['maj', 0]]) {
      await pick(page, 'djF', f); await setRange(page, 'djK', 3);
      ok((await text(page, '#djP0')) === (c ? '100%' : '0%'), `ch5 ${f}: P(000) ${await text(page, '#djP0')}`);
    }
    for (let k = 0; k < 4; k++) { await setRange(page, 'djK', k); ok((await page.$eval('#djSay', e => e.textContent)).length > 10, 'ch5 stage ' + k + ' sentence'); }
    const qb = await page.$$('.qgrid button'); for (const b of qb.slice(0, 5)) await b.click();
    ok((await text(page, '#djAsked')).includes('5'), 'ch5 five classical queries counted');
    await page.click('#djClear');

    // ch6: opens at kOpt with 99.7%; n=10 needs 25 rounds; run past the peak
    await show(page, '#grCv');
    ok((await text(page, '#grK')) === '6' && (await text(page, '#grP')).startsWith('99.7'), 'ch6 opens at k=6, 99.7%: ' + await text(page, '#grK') + ' ' + await text(page, '#grP'));
    await setRange(page, 'grN', 10); ok((await text(page, '#grOpt')).includes('25'), 'ch6 n=10 optimum 25: ' + await text(page, '#grOpt'));
    await page.click('#grRun'); await page.waitForTimeout(4000); ok(parseInt(await text(page, '#grK')) >= 5, 'ch6 auto-run steps');
    await page.click('#grReset'); ok((await text(page, '#grK')) === '0', 'ch6 reset');
    await setRange(page, 'grN', 2); await setRange(page, 'grM', 3); for (let i = 0; i < 4; i++) await page.click('#grStep');
    ok((await page.$eval('#grSay', e => e.textContent)).length > 10, 'ch6 n=2 sentence');
    await setRange(page, 'grN', 6);

    // ch7: N=15 a=7 period 4, 50%; N=21 a=2 t=5 23%; every seed gives a sentence
    await show(page, '#shCv1');
    ok((await text(page, '#shR')) === '4' && (await text(page, '#shS')) === '50.0%', 'ch7 N=15, a=7: r=4, 50%');
    ok((await text(page, '#shCF')).length > 1 && (await text(page, '#shY')) !== '—', 'ch7 opening run shows a measurement');
    await pick(page, 'shN', 21); await page.waitForTimeout(100);
    const as = await page.evaluate(() => ({ max: +document.getElementById('shA').max, tmin: +document.getElementById('shT').min, tmax: +document.getElementById('shT').max }));
    ok(as.tmax === 5, 'ch7 N=21 allows t up to 5 (10 qubits): ' + as.tmax);
    let found = false; for (let i = 0; i <= as.max; i++) { await setRange(page, 'shA', i); if ((await text(page, '#shAo')) === '2') { found = true; break; } }
    await setRange(page, 'shT', 5); ok(found && (await text(page, '#shS')) === '23.0%' && (await text(page, '#shR')) === '6', 'ch7 N=21, a=2, t=5: r=6, 23%: ' + await text(page, '#shS'));
    for (let i = 0; i < 12; i++) await page.click('#shRun'); ok((await page.$eval('#shSay', e => e.textContent)).length > 10, 'ch7 run sentence');
    await pick(page, 'shN', 15);

    // ch8: default N* 6×10^13, 17 h; extremes give sentences
    await show(page, '#coCv');
    ok((await text(page, '#coT')).includes('17'), 'ch8 17 hours: ' + await text(page, '#coT'));
    for (const [c, q] of [[6, 6], [12, 0], [12, 6], [6, 0]]) { await setRange(page, 'coRc', c); await setRange(page, 'coRq', q); ok((await page.$eval('#coSay', e => e.textContent)).length > 10, `ch8 Rc=${c} Rq=${q} sentence`); }
    await setRange(page, 'coRc', 9); await setRange(page, 'coRq', 2);

    // ch9: default n=6, p=0.5% → best ≈ 47% at round 5; p=0 → ideal
    await show(page, '#nzCv', 800);
    ok((await text(page, '#nzBest')).includes('47') && (await text(page, '#nzErr')) === '1.11', 'ch9 best ≈ 47%, errors 1.11: ' + await text(page, '#nzBest') + ' / ' + await text(page, '#nzErr'));
    await setRange(page, 'nzP', 0); await page.waitForTimeout(500); ok((await text(page, '#nzBest')).includes('99.7'), 'ch9 p=0 → 99.7%');
    await setRange(page, 'nzP', 3); await setRange(page, 'nzN', 8); await page.waitForTimeout(1500); ok((await page.$eval('#nzSay', e => e.textContent)).length > 10, 'ch9 worst-case sentence');
    await pick(page, 'nzKind', 'dephase'); await page.waitForTimeout(800);
    await setRange(page, 'nzN', 6); await setRange(page, 'nzP', 0.5); await pick(page, 'nzKind', 'depol');

    // ch10: one flip fixed, two flips fail; repetition at 10% → 2.8%; surface d=23
    await show(page, '#rcCv');
    ok((await text(page, '#rcSyn')) === '1 / 1', 'ch10 middle flip syndrome 1/1: ' + await text(page, '#rcSyn'));
    await page.click('#rcE0'); ok((await text(page, '#rcSyn')) === '0 / 1', 'ch10 two flips syndrome');
    await page.click('#rcE2'); await page.click('#rcClear'); ok((await text(page, '#rcSyn')) === '0 / 0', 'ch10 clear');
    await pick(page, 'rcKind', 'Z'); await page.click('#rcE1'); ok((await text(page, '#rcSyn')) === '0 / 0', 'ch10 Z unseen'); await page.click('#rcClear'); await pick(page, 'rcKind', 'X');
    await show(page, '#rbCv'); ok((await text(page, '#rbPL')).startsWith('2.8'), 'ch10 p=10% → 2.8%: ' + await text(page, '#rbPL'));
    for (const v of [0, 50, 60]) { await setRange(page, 'rbP', v); ok((await page.$eval('#rbSay', e => e.textContent)).length > 10, 'ch10 rep sentence at ' + v); }
    await setRange(page, 'rbP', 10);
    await show(page, '#scCv'); ok((await text(page, '#scD')) === '23' && (await text(page, '#scQ')).replace(/\D/g, '') === '1057', 'ch10 surface d=23, 1057: ' + await text(page, '#scD') + ' ' + await text(page, '#scQ'));
    await setRange(page, 'scP', -4); ok((await text(page, '#scD')) === '11', 'ch10 p=0.01% → d=11');
    await setRange(page, 'scP', -1.9); ok((await page.$eval('#scSay', e => e.textContent)).length > 10, 'ch10 above-threshold sentence');
    await setRange(page, 'scP', -3);

    // ch11: Willow extrapolation and frontier cards
    await show(page, '#fxCv');
    ok((await text(page, '#fxD')) === '27' && (await text(page, '#fxQ')).replace(/\D/g, '') === '1457', 'ch11 1e-6 → d=27, 1457');
    await setRange(page, 'fxT', -12); ok((await text(page, '#fxD')) === '63', 'ch11 1e-12 → d=63');
    await setRange(page, 'fxLam', 4); ok((await text(page, '#fxD')) === '39', 'ch11 Λ=4 → d=39');
    await setRange(page, 'fxLam', 1.2); ok((await page.$eval('#fxSay', e => e.textContent)).length > 10, 'ch11 Λ=1.2 sentence');
    const cards = await page.$$eval('.card', cs => cs.map(c => c.textContent));
    ok(cards.length >= 15 && cards.every(c => !/\{\w+\}/.test(c) && /20\d\d/.test(c)), 'ch11 every frontier card filled and dated (' + cards.length + ')');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: Grover's run jumps straight to the optimum
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#grCv'); await page.click('#grReset'); await page.click('#grRun'); await page.waitForTimeout(100);
    ok((await text(page, '#grK')) === '6', 'reduced motion: Grover run jumps to k=6, got ' + await text(page, '#grK'));
    await show(page, '#nzCv', 800); ok((await text(page, '#nzBest')).includes('47'), 'reduced motion: noise model drawn');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, no Chinese in English mode; language toggle, all models driven to the numbers the prose quotes, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
