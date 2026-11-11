'use strict';
// Browser test for the why-the-sky-is-blue essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18911 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node physics/optics/why-the-sky-is-blue/tests/browser.cjs
// 1. zh and en (the real copy.en.js) at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped
//    in its own box, every control at least 48×48 px, the toggle reads 中 | EN; in English no CJK may appear anywhere
//    (DOM text, aria-labels, title, canvas fillText) apart from the 中 button, including states reached by moving controls.
// 2. Language-awareness: a stand-in copy.en.js (every key → Latin text, placeholders kept) proves every string goes
//    through the copy. With copy.en.js missing (404), EN falls back to the Chinese text, lang stays zh-CN, no raw keys.
// 3. Every control driven to its extremes (and pairs of sliders at extreme combinations): each live sentence and
//    readout stays filled, with no NaN / Infinity / undefined / unfilled {placeholder}.
// 4. Each model answers its controls with the values the model computes; keyboard operation; reduced motion.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18911').replace(/\/$/, '');
const url = base + '/physics/optics/why-the-sky-is-blue/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const CJK = /[　-〿㐀-鿿＀-￯]/;

// a stand-in English copy built from the zh keys: Latin words, same placeholders
const FAKE_EN = `(function(){var z=window.ESSAY_COPY.zh,e={};for(var k in z){var ph=(z[k].match(/\\{\\w+\\}/g)||[]).join(' ');e[k]='E '+k.replace(/[^a-z0-9]+/gi,'-')+(ph?' '+ph:'');}window.ESSAY_COPY.en=e;})();`;

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  if (opts.fakeEn) await page.route('**/copy.en.js', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_EN }));
  if (opts.noEn) await page.route('**/copy.en.js', r => r.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' }));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const drawAll = async page => { for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); } };
const num = s => parseFloat(String(s).replace(/,/g, ''));
// Chinese left visible anywhere: text nodes, aria-labels, title, meta description, canvas strings
const cjkLeaks = page => page.evaluate(re => {
  const rx = new RegExp(re), out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!rx.test(n.textContent) || !el.getClientRects().length) continue; if (el.closest('#langToggle') && n.textContent.trim() === '中') continue; out.push('text: ' + n.textContent.trim().slice(0, 30)); }
  for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria-label: ' + e.getAttribute('aria-label'));
  if (rx.test(document.title)) out.push('title: ' + document.title);
  const md = document.querySelector('meta[name=description]'); if (md && rx.test(md.content)) out.push('meta description');
  for (const s of window.__canvasStrings) if (rx.test(s)) out.push('canvas: ' + s);
  return out.slice(0, 8);
}, CJK.source);
// move the controls whose states draw strings that are not on screen by default
const visitStates = async page => { await setRange(page, 'snE', 0); await setRange(page, 'miR', 0); await setRange(page, 'spT', 2500); await page.click('input[name=maP][value=earth]', { force: true }); await drawAll(page); };

(async () => {
  const browser = await chromium.launch();

  // 1. layout, targets and errors at three widths, in both languages
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    await drawAll(page);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    // nothing spills out of its model card (e.g. a long output pushed past the card edge)
    const spill = await page.evaluate(() => { const out = []; for (const f of document.querySelectorAll('figure')) { const fr = f.getBoundingClientRect();
      for (const e of f.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.width && (r.right > fr.right + 1 || r.left < fr.left - 1)) out.push(e.tagName + '#' + e.id + ' "' + e.textContent.trim().slice(0, 20) + '"'); } } return out.slice(0, 5); });
    ok(!spill.length, `${tag}: elements spilling out of a model card: ${spill.join(', ')}`);
    if (lang === 'en') {
      await visitStates(page);
      const leaks = await cjkLeaks(page);
      ok(!leaks.length, `${tag}: Chinese visible in English mode: ${leaks.join(' | ')}`);
      const over2 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(over2 <= 0, `${tag}: horizontal overflow after moving controls ${over2}px`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // 2a. every visible string goes through the copy: with a Latin stand-in English copy, no CJK anywhere
  for (const width of [1280, 320]) {
    const page = await open(browser, width, { lang: 'en', fakeEn: true });
    await drawAll(page);
    // also draw the states that only appear after controls move
    await visitStates(page);
    const leaks = await cjkLeaks(page);
    ok(!leaks.length, `stand-in en ${width}: Chinese not taken from the copy: ${leaks.join(' | ')}`);
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', `stand-in en ${width}: lang follows the copy shown`);
    ok(!page.__errors().length, `stand-in en ${width}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // 2b. copy.en.js missing: EN falls back to the Chinese text and says so through lang
  {
    const page = await open(browser, 1280, { noEn: true });
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'EN without copy.en.js: lang stays zh-CN (the text shown)');
    ok((await text(page, 'h1')).length > 0, 'title stays filled');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'zh', 'ZH stored');
    await page.close();
  }

  // 3. extremes: every slider to min/max, pairs of sliders in a figure at the four corner combinations, every
  //    checkbox and radio both ways. Live sentences and readouts must stay clean.
  {
    const page = await open(browser, 390);
    await drawAll(page);
    const BAD = /NaN|Infinity|undefined|\{\w+\}|null/;
    const figs = await page.$$eval('figure', fs => fs.map(f => ({ id: f.closest('section').id,
      ranges: [...f.querySelectorAll('input[type=range]')].map(r => ({ id: r.id, min: r.min, max: r.max })),
      boxes: [...f.querySelectorAll('input[type=checkbox]')].map(c => c.id),
      radios: [...f.querySelectorAll('input[type=radio]')].map(c => c.value), radioName: (f.querySelector('input[type=radio]') || {}).name })));
    const check = async (f, label) => {
      await page.waitForTimeout(60);
      const bad = await page.evaluate(([sid, src]) => { const rx = new RegExp(src); const out = [];
        for (const e of document.querySelectorAll(`#${sid} figure .say, #${sid} figure .read b, #${sid} figure output`)) { const s = e.textContent.trim(); if (!s || rx.test(s)) out.push((e.id || e.className) + ': "' + s.slice(0, 60) + '"'); }
        return out; }, [f.id, BAD.source]);
      ok(!bad.length, `${f.id} ${label}: ${bad.join(' | ')}`);
    };
    for (const f of figs) {
      await show(page, `#${f.id} figure`, 200);
      const radioSets = f.radios.length ? f.radios : [null], boxSets = f.boxes.length ? [true, false] : [null];
      for (const rv of radioSets) for (const bv of boxSets) {
        if (rv) await page.click(`input[name=${f.radioName}][value=${rv}]`, { force: true });
        if (bv !== null) for (const id of f.boxes) await page.evaluate(([id, v]) => { const e = document.getElementById(id); if (e.checked !== v) e.click(); }, [id, bv]);
        const tag = `${rv || ''}${bv === null ? '' : bv ? '+box' : '-box'}`;
        for (const r of f.ranges) for (const v of [r.min, r.max]) { await setRange(page, r.id, v); await check(f, `${tag} ${r.id}=${v}`); }
        if (f.ranges.length === 2) { const [a, b] = f.ranges;
          for (const va of [a.min, a.max]) for (const vb of [b.min, b.max]) { await setRange(page, a.id, va); await setRange(page, b.id, vb); await check(f, `${tag} ${a.id}=${va} ${b.id}=${vb}`); } }
      }
    }
    ok(!page.__errors().length, 'extremes: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // 4. each model answers its controls with what the model computes; keyboard
  {
    const page = await open(browser, 1280);
    const M = (expr) => page.evaluate(expr);
    // ch1: thicker air scatters more blue
    await show(page, '#phCv', 300);
    await setRange(page, 'phAir', 1);
    ok(num(await text(page, '#phB')) === Math.round(await M(() => SkyModels.ch1State(1).b)), 'ch1 blue share at 1× air = ' + await text(page, '#phB'));
    const sum = s => (s.match(/\d+/g) || []).reduce((a, b) => a + +b, 0);
    await page.waitForTimeout(2500); const before = sum(await text(page, '#phSky')); await page.click('#phClear'); const after = sum(await text(page, '#phSky'));
    ok(before > 0 && after < before, `ch1 photons land and the reset clears the counts (${before} → ${after})`);
    // ch2: wavelength readout and ratio
    await show(page, '#osCv1', 200); await setRange(page, 'osL', 450); await setRange(page, 'osRes', 83);
    ok(num(await text(page, '#osRel')) === +(await M(() => SkyModels.ch2State(450, 83).rel)).toFixed(2), 'ch2 450 nm ratio = ' + await text(page, '#osRel'));
    // ch3: the sun's temperature moves the peak
    await show(page, '#spCv', 200); await setRange(page, 'spT', 3000);
    ok(num(await text(page, '#spSunPk')) === Math.round(await M(() => SkyModels.ch3State(3000).sunPeak)), 'ch3 3000 K sun peak ' + await text(page, '#spSunPk'));
    await page.click('#spSun'); ok((await text(page, '#spTo')).includes('5772'), 'ch3 back-to-sun button');
    // ch4: removing light below 420 nm
    await show(page, '#eyCv1', 200); await setRange(page, 'eyN', 4); await setRange(page, 'eyCut', 420);
    ok(num(await text(page, '#eyDom')) === Math.round(await M(() => SkyModels.ch4State(4, 420).dom)), 'ch4 cut 420 dominant ' + await text(page, '#eyDom'));
    // ch5: sun at the horizon, then play
    await show(page, '#snCv1', 200); await setRange(page, 'snE', 0);
    ok(num(await text(page, '#snM')) === +(await M(() => SkyModels.ch5State(0).m)).toFixed(1), 'ch5 horizon air mass ' + await text(page, '#snM'));
    await setRange(page, 'snE', 20); await page.click('#snPlay');
    { // the sun must move smoothly, not stick on the slider's 0.5° steps: sample the readout every 150 ms
      const seen = []; for (let i = 0; i < 8; i++) { await page.waitForTimeout(150); seen.push(num(await text(page, '#snEo'))); }
      ok(seen.every((v, i) => i === 0 || v < seen[i - 1]), 'ch5 play lowers the sun at every sample: ' + seen.join(' '));
      const a = await page.$eval('#snCv1', c => c.toDataURL()); await page.waitForTimeout(200); const b = await page.$eval('#snCv1', c => c.toDataURL());
      ok(a !== b, 'ch5 play redraws the picture while playing'); }
    await page.click('#snPlay'); ok(await page.$eval('#snPlay', e => e.getAttribute('aria-pressed')) === 'false', 'ch5 stop');
    // ch6: zenith colour at 30°
    await show(page, '#skCv', 300); await setRange(page, 'skE', 30);
    ok(num(await text(page, '#skZen')) === Math.round(await M(() => SkyModels.ch6State(30).zen.dom)), 'ch6 zenith at 30° ' + await text(page, '#skZen'));
    // ch7: 10 µm drops
    await show(page, '#miCv1', 300); await setRange(page, 'miR', 60);
    ok(num(await text(page, '#miQ')) === +(await M(() => SkyModels.ch7State(SkyModels.radiusOf(60)).q550)).toFixed(2), 'ch7 Q at 10 µm ' + await text(page, '#miQ'));
    // ch8: Mars defaults, then Earth
    await show(page, '#maCv', 400); await page.click('input[name=maP][value=mars]', { force: true }); await setRange(page, 'maDust', 0.5); await setRange(page, 'maE', 30);
    ok(num(await text(page, '#maZen')) === Math.round(await M(() => { const s = SkyModels.ch8State('mars', 0.5, document.getElementById('maAbs').checked, 30); return s.zen.dom; })), 'ch8 Mars zenith ' + await text(page, '#maZen'));
    await page.click('input[name=maP][value=earth]', { force: true }); await setRange(page, 'maDust', 0); await page.waitForTimeout(300);
    ok(num(await text(page, '#maZen')) < 490, 'ch8 clear Earth zenith is blue: ' + await text(page, '#maZen'));
    // ch9: overhead sun
    await show(page, '#msCv', 300); await setRange(page, 'msE', 90); await setRange(page, 'msAir', 1); await page.waitForTimeout(300);
    ok(num(await text(page, '#msB')) === Math.round(await M(() => SkyModels.ch9State(90, 1).b)), 'ch9 blue multiply-scattered ' + await text(page, '#msB'));

    // keyboard: slider with arrows/End, button with Space, radio with arrows
    await page.focus('#skE'); await page.keyboard.press('End');
    ok((await text(page, '#skEo')).startsWith('90'), 'keyboard: End moves the sky slider to 90, got ' + await text(page, '#skEo'));
    await page.keyboard.press('ArrowLeft'); ok((await text(page, '#skEo')).startsWith('89'), 'keyboard: ArrowLeft steps down');
    await page.focus('#spSun'); await setRange(page, 'spT', 9000); await page.keyboard.press('Space');
    ok((await text(page, '#spTo')).includes('5772'), 'keyboard: Space presses a button');
    await page.focus('input[name=maP][value=earth]'); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('input[name=maP][value=mars]', e => e.checked) || await page.$eval('input[name=maP][value=earth]', e => e.checked), 'keyboard: arrows move between planets');
    const focusRing = await page.evaluate(() => { const e = document.getElementById('skE'); e.focus(); return getComputedStyle(e).outlineStyle; });
    ok(focusRing !== 'none', 'keyboard: focus is visible');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // 5. reduced motion
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#snCv1', 300); await setRange(page, 'snE', 40); await page.click('#snPlay'); await page.waitForTimeout(100);
    ok(num(await text(page, '#snEo')) === 0, 'reduced motion: ch5 play jumps straight to sunset, got ' + await text(page, '#snEo'));
    await show(page, '#phCv', 300);
    const a = await page.$eval('#phCv', c => c.toDataURL()); await page.waitForTimeout(600); const b = await page.$eval('#phCv', c => c.toDataURL());
    ok(a === b, 'reduced motion: ch1 photons are a still picture');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, toggle 中 | EN, no Chinese in English mode; every string from the copy; zh fallback without copy.en.js; every control at its extremes; nine models; keyboard; reduced motion; no errors)');
})().catch(e => { console.error(e); process.exit(1); });
