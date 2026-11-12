'use strict';
// Browser smoke test for "why one rate moves everything".
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18987 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node economics/money/why-one-rate-moves-everything/tests/browser.cjs
// Optional: SHOT_DIR=/tmp/... writes a screenshot of every figure at each width (keep screenshots out of the repo).
// Checks in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped in its own box,
// every control at least 48×48 px, the toggle reads 中 | EN. Then: the EN toggle works whether or not copy.en.js
// exists (missing keys fall back to Chinese, no raw keys shown), every model responds to its controls, and the page
// renders the same under reduced motion.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18987').replace(/\/$/, '');
const url = base + '/economics/money/why-one-rate-moves-everything/';
const SHOT = process.env.SHOT_DIR;
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
const num = async (page, sel) => parseFloat((await text(page, sel)).replace('−', '-').replace(/,/g, ''));
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 150) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(ms); };
const raw = /^(ch\d+|hero|nav|toc|doc)\.[\w.]+$/;

(async () => {
  const browser = await chromium.launch();
  if (SHOT) fs.mkdirSync(SHOT, { recursive: true });

  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width);
    const tag = `zh ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    let k = 0;
    for (const fig of await page.$$('figure')) {
      await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250);
      if (SHOT) await fig.screenshot({ path: path.join(SHOT, `zh-${width}-fig${String(++k).padStart(2, '0')}.png`) });
    }
    if (SHOT) { await page.$eval('#ch12', e => e.scrollIntoView()); await page.screenshot({ path: path.join(SHOT, `zh-${width}-ch12.png`), fullPage: false }); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, .tbl *')].filter(e => {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const tblOver = await page.evaluate(() => [...document.querySelectorAll('.tbl')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.id));
    ok(!tblOver.length, `${tag}: tables need sideways scrolling: ${tblOver.join(', ')}`);
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('.tbl, .eq'); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const rawKeys = await page.evaluate(src => { const rx = new RegExp(src); return [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && rx.test(e.textContent.trim())).map(e => e.textContent.trim()).concat([...window.__canvasStrings].filter(s => rx.test(s))).concat([...document.body.innerHTML.matchAll(/\{[a-zA-Z0-9]+\}/g)].map(m => m[0])).slice(0, 5); }, raw.source);
    ok(!rawKeys.length, `${tag}: raw keys or unfilled placeholders: ${rawKeys.join(', ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle (copy.en.js may be absent: every key falls back to Chinese) and every model
  {
    const page = await open(browser, 1280);
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after EN');
    ok(!(await page.evaluate(src => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => new RegExp(src).test(e.textContent.trim())), raw.source)), 'no raw keys after EN');
    ok((await page.$eval('#frTable', e => e.textContent)).length > 50, 'frontier table rendered after EN');
    ok(!page.__errors().length, 'toggle: errors: ' + page.__errors().join(' | '));
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1
    await show(page, '#pvCv');
    ok((await text(page, '#pvAvg')).startsWith('13.3'), 'ch1 flat stream average wait 13.3 at 3%: ' + await text(page, '#pvAvg'));
    await pick(page, 'pvKind', 'grow'); ok((await text(page, '#pvAvg')).startsWith('17.6'), 'ch1 growing stream 17.6');
    await setRange(page, 'pvR', 0); ok((await text(page, '#pvSay')).includes('25.8'), 'ch1 zero-rate sentence');
    // ch2
    await show(page, '#bdCv');
    ok((await text(page, '#bdP30')) === '−20.06%', 'ch2 30y exact −20.06%: ' + await text(page, '#bdP30'));
    await page.click('#bd2022'); ok((await page.$eval('#bd2022', e => e.getAttribute('aria-pressed'))) === 'true' && (await text(page, '#bdSay')).includes('2022'), 'ch2 2022 preset');
    await setRange(page, 'bdDy', -1); ok((await page.$eval('#bd2022', e => e.getAttribute('aria-pressed'))) === 'false' && (await text(page, '#bdP30')).startsWith('+26.5'), 'ch2 slider leaves the preset; −1 → +26.50%');
    // ch3
    await show(page, '#cvCv');
    ok((await text(page, '#cvFwd')) === '3.24%', 'ch3 2023 fwd 9→10 = 3.24%');
    await pick(page, 'cvDate', '2021-12-31'); ok((await text(page, '#cvFwd')) === '1.78%', 'ch3 2021 fwd = 1.78%');
    await setRange(page, 'cvN', 1); ok((await text(page, '#cvSay')).includes('0.39'), 'ch3 n=1 sentence');
    // ch4
    await show(page, '#ehCv');
    await setRange(page, 'ehI0', 5.5); await setRange(page, 'ehIL', 2.5);
    ok((await text(page, '#ehSp')).startsWith('−1.41'), 'ch4 inverted spread −1.41: ' + await text(page, '#ehSp'));
    await show(page, '#hsCv');
    ok((await text(page, '#hsCalled')) === '7 / 8', 'ch4 7 of 8 called'); await setRange(page, 'hsLead', 24);
    ok((await text(page, '#hsFalse')).startsWith('2'), 'ch4 24-month lead: 2 false alarms');
    // ch5
    await show(page, '#plCv');
    await page.click('#plFloor'); ok((await text(page, '#plSay')).includes('3.00'), 'ch5 floor at 3.00');
    await page.click('#plCorr'); ok((await num(page, '#plRate')) > 3.5, 'ch5 corridor rate mid-corridor');
    // ch6
    await show(page, '#tyCv');
    ok((await text(page, '#tyMae')).startsWith('1.19'), 'ch6 1990–2007 MAE 1.19: ' + await text(page, '#tyMae'));
    await setRange(page, 'tyR', 1); ok((await text(page, '#tyNow')).startsWith('5.42'), 'ch6 r* 1.0 → 5.42');
    // ch7
    await show(page, '#nkCv');
    ok((await text(page, '#nkPi')) === '+0.73 个点', 'ch7 demand π +0.73: ' + await text(page, '#nkPi'));
    await pick(page, 'nkShock', 'supply'); ok((await text(page, '#nkX')).startsWith('−1.27'), 'ch7 supply x −1.27');
    await setRange(page, 'nkPhi', 0.8); ok((await text(page, '#nkX')) === '—' && (await text(page, '#nkSay')).length > 20, 'ch7 indeterminate');
    await pick(page, 'nkShock', 'demand'); await setRange(page, 'nkPhi', 1.5); await page.check('#nkTrack', { force: true });
    ok((await text(page, '#nkX')) === '0.00%', 'ch7 tracking the natural rate: x = 0: ' + await text(page, '#nkX'));
    // ch8
    await show(page, '#eqCv');
    ok((await text(page, '#eqDg')).startsWith('25.5'), 'ch8 growth duration 25.5');
    await show(page, '#hgCv'); await setRange(page, 'hgA', 2.75); await setRange(page, 'hgB', 2.75);
    ok((await text(page, '#hgSay')).length > 5, 'ch8 house same-rate sentence');
    // ch9
    await show(page, '#fxCv');
    const a0 = await text(page, '#fxAnn'); await page.click('#fxNew'); ok((await text(page, '#fxAnn')) !== a0, 'ch9 new history changes the path');
    await pick(page, 'fxWorld', 'uip'); ok((await text(page, '#fxSay')).includes('UIP'), 'ch9 UIP world sentence');
    // ch10
    await show(page, '#lbCv');
    await setRange(page, 'lbL', 2); ok((await text(page, '#lbY')) === '2.77%', 'ch10 two-year promise → 2.77%');
    await setRange(page, 'lbQ', 12); ok((await text(page, '#lbY')) === '2.24%', 'ch10 + QE 12% → 2.24%');
    // ch11
    await show(page, '#dbCv');
    ok((await text(page, '#db30')) === '190.0%', 'ch11 default 190%: ' + await text(page, '#db30'));
    await setRange(page, 'dbR', 6); ok((await text(page, '#db30')).startsWith('279'), 'ch11 r = 6 → 279');
    // keyboard: a slider moves with the arrow key
    await page.focus('#dbM'); await page.keyboard.press('ArrowRight'); ok((await text(page, '#dbMo')).startsWith('7'), 'keyboard moves a slider');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: same static models, no smooth scrolling, everything drawn
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#nkCv'); ok((await text(page, '#nkSay')).length > 20, 'reduced motion: ch7 sentence present');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser test (zh at 1280/390/320: overflow, clipped text, 48px targets, raw keys; EN toggle with fallback; all models driven; keyboard; reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
