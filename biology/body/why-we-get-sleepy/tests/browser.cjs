'use strict';
// Browser smoke test for the why-we-get-sleepy essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18963 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node biology/body/why-we-get-sleepy/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots there (never into the repo).
// Checks in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its own
// box, every control at least 48×48 px, the toggle reads 中 | EN. Then: the EN toggle without an English copy file,
// keyboard operation and visible focus, every control driven to its extremes with every live sentence read for
// unfilled placeholders, each model responding to its controls, and reduced motion jumping replays to their end.
const { chromium } = require('playwright');
const path = require('path');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18963').replace(/\/$/, '');
const url = base + '/biology/body/why-we-get-sleepy/';
const shots = process.env.SHOT_DIR || '';
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
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const SAYS = ['#sSay', '#tpSay', '#sdSay', '#frSay', '#prSay', '#chSay', '#jlSay', '#wkSay', '#cfSay'];
const READS = '.read b';
async function readAll(page, tag) {
  const bad = await page.evaluate(([says, reads]) => {
    const out = [];
    for (const s of says) { const t = document.querySelector(s).textContent; if (!t.trim() || /\{\w+\}|undefined|NaN|null|Infinity/.test(t)) out.push(s + ': ' + t.slice(0, 80)); }
    for (const e of document.querySelectorAll(reads)) { const t = e.textContent; if (e.offsetParent && (!t.trim() || /\{\w+\}|undefined|NaN|null|Infinity/.test(t))) out.push((e.id || 'read') + ': ' + t); }
    return out;
  }, [SAYS, READS]);
  ok(!bad.length, `${tag}: bad live text: ${bad.join(' | ')}`);
}

(async () => {
  const browser = await chromium.launch();

  // layout, targets and errors at three widths
  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width);
    const tag = `zh ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang`);
    ok(await page.evaluate(() => document.title).then(t => /人为什么到点就困/.test(t)), `${tag}: Chinese document title`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400); }
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);
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
    await readAll(page, tag);
    if (shots) await page.screenshot({ path: path.join(shots, `zh-${width}.png`), fullPage: true });
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // EN toggle with no English copy yet, keyboard, and every control at its extremes
  {
    const page = await open(browser, 1280);
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'EN toggle: lang follows the text actually shown');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // keyboard: tab reaches a slider, focus ring is visible, arrow keys move it
    await page.focus('#sZ'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
    ok(await page.evaluate(() => document.activeElement.id) === 'sZ', 'keyboard: Tab reaches the ch1 slider');
    const ring = await page.$eval('#sZ', e => { const cs = getComputedStyle(e); return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0; });
    ok(ring, 'keyboard: slider shows a focus outline');
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok(await page.$eval('#sZ', e => e.value) === '6.5', 'keyboard: arrow key moves ch1 slider');
    await page.focus('#sdNap'); await page.keyboard.press('Space'); await page.waitForTimeout(100);
    ok(await page.$eval('#sdNap', e => e.checked), 'keyboard: space toggles the nap checkbox');
    await page.keyboard.press('Space');
    await page.focus('input[name=wkK][value=office]'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300);
    ok(await page.$eval('input[name=wkK][value=night]', e => e.checked), 'keyboard: arrow moves the ch8 radio group');
    ok(await page.$eval('#wkWL', e => !e.hidden) && await page.$eval('#wkEL', e => e.hidden), 'ch8 night shows workplace light, hides evening light');

    // every range input at min, middle and max; every radio; the checkbox; read every live sentence each time
    const ranges = await page.$$eval('input[type=range]', es => es.map(e => [e.id, +e.min, +e.max, +e.step]));
    for (const [id, mn, mx, st] of ranges) {
      const mid = mn + Math.round((mx - mn) / 2 / st) * st;
      for (const v of [mn, mid, mx]) { await setRange(page, id, v); await readAll(page, `${id}=${v}`); }
    }
    for (const name of ['frRoom', 'prP', 'jlL', 'wkK', 'cfD']) {
      const vals = await page.$$eval(`input[name=${name}]`, es => es.map(e => e.value));
      for (const v of vals) {
        await page.click(`input[name=${name}][value="${v}"]`, { force: true });
        if (name === 'wkK') for (const id of (v === 'office' ? ['wkE'] : ['wkW', 'wkC'])) { const [mn, mx] = await page.$eval('#' + id, e => [+e.min, +e.max]); for (const x of [mn, mx]) { await setRange(page, id, x); await readAll(page, `${name}=${v} ${id}=${x}`); } }
        await readAll(page, `${name}=${v}`);
      }
    }
    for (const c of [true, false]) { await page.$eval('#sdNap', (e, c) => { e.checked = c; e.dispatchEvent(new Event('change', { bubbles: true })); }, c); for (const x of [0, 1, 24]) { await setRange(page, 'sdX', x); await readAll(page, `nap=${c} sdX=${x}`); } }

    // models respond with the numbers the prose states
    await setRange(page, 'sZ', 6); ok((await text(page, '#sWake')) === '0.17', 'ch1 6 h → waking S 0.17, got ' + await text(page, '#sWake'));
    await setRange(page, 'tpA', 0.1); await setRange(page, 'tpC', 3.5);
    ok((await text(page, '#tpOn')) === '22:36' && (await text(page, '#tpWake')) === '6:59', 'ch2 default 22:36–6:59');
    await setRange(page, 'tpA', 0); ok((await text(page, '#tpCyc')).startsWith('18.6'), 'ch2 a = 0 → 18.6 h cycle');
    await setRange(page, 'sdX', 24); ok((await text(page, '#sdDur')).startsWith('9.3'), 'ch3 all-nighter → 9.3 h');
    await setRange(page, 'frT', 24.2); await page.click('input[name=frRoom][value=dark]', { force: true });
    ok((await text(page, '#frDay')).includes('0.20'), 'ch4 dark drift 0.20 h/day, got ' + await text(page, '#frDay'));
    await page.click('input[name=prP][value=long]', { force: true }); await setRange(page, 'prO', 3);
    ok((await text(page, '#prShift')).includes('2.3'), 'ch5 +3 h → advance 2.3 h, got ' + await text(page, '#prShift'));
    await setRange(page, 'chT', 24.2); await setRange(page, 'chD', 2); await setRange(page, 'chE', 2);
    ok((await text(page, '#chOn')) === '22:27', 'ch6 default onset 22:27');
    await setRange(page, 'jlN', 8); await setRange(page, 'jlT', 24.2); await page.click('input[name=jlL][value="1000"]', { force: true });
    ok((await text(page, '#jlE')).startsWith('4.6') && (await text(page, '#jlW')).startsWith('7.2'), 'ch7 8 zones: E 4.6, W 7.2');
    await page.click('input[name=wkK][value=office]', { force: true }); await setRange(page, 'wkE', 3);
    ok((await text(page, '#wkA')).startsWith('0.7'), 'ch8 office social jet lag 0.7 h, got ' + await text(page, '#wkA'));
    await page.click('input[name=cfD][value="200"]', { force: true }); await setRange(page, 'cfT', 15); await setRange(page, 'cfH', 5);
    ok((await text(page, '#cfBed')).startsWith('72'), 'ch9 72 mg at bedtime, got ' + await text(page, '#cfBed'));
    // with motion allowed, a replay restarts from the beginning and runs forward
    await show(page, '#jlCv', 300); await page.click('#jlReplay'); await page.waitForTimeout(150);
    const t1 = await page.evaluate(() => window.__essayClocks[3].t); await page.waitForTimeout(800);
    const t2 = await page.evaluate(() => window.__essayClocks[3].t);
    ok(t1 < 2 && t2 > t1, `motion: ch7 replay runs forward (${t1} → ${t2})`);
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: replays show their end state at once
  {
    const page = await open(browser, 390, { reduce: true });
    const n = await page.evaluate(() => window.__essayClocks.length);
    ok(n === 4, 'four replay clocks (ch1, ch3, ch4, ch7), got ' + n);
    ok(await page.evaluate(() => window.__essayClocks.every(k => k.done())), 'reduced motion: every replay starts at its end');
    for (const b of ['#sReplay', '#sdReplay', '#frReplay', '#jlReplay']) await page.click(b);
    await setRange(page, 'sdX', 5);
    ok(await page.evaluate(() => window.__essayClocks.every(k => k.done())), 'reduced motion: replays and model changes jump to the end');
    await show(page, '#jlCv', 400);
    if (shots) await page.screenshot({ path: path.join(shots, 'reduced-390-ch7.png') });
    // the replay buttons restart, but under reduced motion the clock jumps straight to the end
    ok(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), 'reduced motion is on');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser test (zh at 1280/390/320: overflow, clipped text, 48px targets, live text; EN toggle, keyboard, every control at its extremes, model readouts, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
