'use strict';
// Browser smoke test for the why-we-forget essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18967 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node psychology/cognition/why-we-forget/tests/browser.cjs
// Checks in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its
// own box, every control at least 48×48 px, the toggle reads 中 | EN. Then:
// - a stand-in English copy (every Chinese run replaced by Latin filler, placeholders kept) is served as
//   copy.en.js, to prove that nothing Chinese comes from app.js / index.html in English mode (DOM text,
//   aria-labels, title, canvas fillText) and that the layout holds with different text;
// - the real toggle without copy.en.js (falls back to Chinese, remembers the choice, no raw keys);
// - canvases draw only once on screen; keyboard operation and visible focus;
// - each model responding to its controls with the numbers the prose quotes; reduced motion.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18967').replace(/\/$/, '');
const url = base + '/psychology/cognition/why-we-forget/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const CJK = /[　-〿㐀-鿿＀-￯]/;
// stand-in English copy: same keys and placeholders, no Chinese
const FAKE_EN = `(function(){var Z=window.ESSAY_COPY.zh,E={};for(var k in Z){E[k]=Z[k].replace(/[\\u3000-\\u303f\\u3400-\\u9fff\\uff00-\\uffef]+/g,' Lorem ipsum ').replace(/  +/g,' ');}
E['common.listsep']=', ';E['common.colon']=': ';window.ESSAY_COPY.en=E;})();`;

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  if (opts.fakeEn) await page.route('**/copy.en.js', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: FAKE_EN }));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  // the console line for the missing copy.en.js has no URL; real 4xx responses are caught by the response handler
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 250) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(ms); };
const inked = (page, sel) => page.$eval(sel, cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 16) if (d[i]) n++; return n; });

async function layout(page, tag, width) {
  for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200); }
  ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
  const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table *')].filter(e => {
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
  const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
  ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
  ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
}

(async () => {
  const browser = await chromium.launch();

  // Chinese at three widths
  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width);
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `zh ${width}: html lang`);
    await layout(page, `zh ${width}`, width);
    ok(await page.$$eval('#robRows tr', r => r.length) === 8, `zh ${width}: robustness table has 8 rows`);
    await page.close();
  }

  // stand-in English: no Chinese from code, layout holds
  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang: 'en', fakeEn: true });
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', `en* ${width}: html lang`);
    // move every control once so every live sentence and canvas label is produced in this language
    await page.evaluate(() => {
      for (const r of document.querySelectorAll('input[type=radio]')) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
      for (const s of document.querySelectorAll('input[type=range]')) for (const v of [s.min, s.max]) { s.value = v; s.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await layout(page, `en* ${width}`, width);
    const leaks = await page.evaluate(re => {
      const rx = new RegExp(re), out = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!rx.test(n.textContent) || !el.getClientRects().length) continue; if (el.closest('#langToggle') && n.textContent.trim() === '中') continue; out.push('text: ' + n.textContent.trim().slice(0, 30)); }
      for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria-label: ' + e.getAttribute('aria-label'));
      if (rx.test(document.title)) out.push('title: ' + document.title);
      const md = document.querySelector('meta[name=description]'); if (md && rx.test(md.content)) out.push('meta description');
      for (const s of window.__canvasStrings) if (rx.test(s)) out.push('canvas: ' + s);
      return out.slice(0, 8);
    }, CJK.source);
    ok(!leaks.length, `en* ${width}: Chinese visible in English mode: ${leaks.join(' | ')}`);
    ok((await text(page, '#robRows td')).length > 0 && !CJK.test(await page.$eval('#robRows td', e => e.dataset.h)), `en* ${width}: table headers follow the language`);
    await page.close();
  }

  // the real toggle (no copy.en.js), on-screen drawing, keyboard, and every model
  {
    const page = await open(browser, 1280);
    const title = await text(page, 'h1');
    ok(title.length > 0 && !/^\w+(\.\w+)+$/.test(title), 'hero title filled from copy');
    ok(await inked(page, '#jlCv') === 0, 'a canvas far below the fold has not drawn yet');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js the page stays Chinese and says so');
    ok(await text(page, 'h1') === title, 'title falls back to Chinese');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.$eval('#langToggle [data-lang=zh]', e => e.getAttribute('aria-pressed')) === 'true', 'ZH pressed again');

    // keyboard: slider and radio group by arrow keys, focus ring visible
    await show(page, '#fgCv');
    await page.focus('#fgK'); const v0 = await page.$eval('#fgK', e => +e.value); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('#fgK', e => +e.value) > v0, 'keyboard: arrow moves the ch1 slider');
    ok(await page.$eval('#fgK', e => getComputedStyle(e).outlineStyle !== 'none'), 'keyboard: slider shows a focus ring');
    await show(page, '#cpCv');
    await page.focus('input[name=cpRi]:checked'); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('input[name=cpRi]:checked', e => e.value) === '70', 'keyboard: arrow moves the ch4 radio group');
    ok(await page.$eval('input[name=cpRi]:checked', e => getComputedStyle(e.closest('label')).outlineStyle !== 'none'), 'keyboard: radio label shows a focus ring');
    await page.keyboard.press('Tab');
    ok(await page.evaluate(() => document.activeElement && document.activeElement !== document.body), 'Tab moves focus on');

    // ch1
    await show(page, '#fgCv');
    ok(await inked(page, '#fgCv') > 0, 'ch1 canvas drawn on screen');
    ok(await text(page, '#fgBest') === '0.0580', 'ch1 Ebbinghaus best exponential SSD 0.0580');
    await pick(page, 'fgFam', 'pow'); await page.waitForTimeout(100);
    ok(await text(page, '#fgSsd') === '0.0024' && (await text(page, '#fgSay')).includes('1.39'), 'ch1 power fit: SSD 0.0024, μ 1.39');
    await pick(page, 'fgData', 'dros'); await pick(page, 'fgFam', 'exp'); await page.waitForTimeout(100);
    ok((await text(page, '#fgSay')).includes('4.1%'), 'ch1 Dros exponential: "last point especially low" sentence, ' + await text(page, '#fgSay'));
    await setRange(page, 'fgK', 0); await page.waitForTimeout(100);
    ok((await text(page, '#fgSay')).includes('最佳拟合'), 'ch1 off-fit sentence');
    await page.click('#fgFit'); await page.waitForTimeout(100);
    ok(await text(page, '#fgSsd') === await text(page, '#fgBest'), 'ch1 best-fit button restores the best SSD');
    // ch2
    await show(page, '#mxCv');
    await setRange(page, 'mxH', 1); await setRange(page, 'mxV', 2);
    ok(await text(page, '#mx30') === '33%', 'ch2 CV 2: 33 % after 30 days');
    await setRange(page, 'mxV', 1); ok(await text(page, '#mx30') === '4.6%', 'ch2 CV 1: 4.6 %');
    await setRange(page, 'mxV', 0); ok(await text(page, '#mx30') === await text(page, '#mxS'), 'ch2 CV 0: mean equals the single exponential');
    // ch3
    await show(page, '#arCv');
    ok(await text(page, '#arP') === '0.31' && await text(page, '#arM') === '0.10' && await text(page, '#arBest') === '2 天', 'ch3 default: 0.31 / 0.10 / best 2 days');
    await setRange(page, 'arRi', 30); ok(await text(page, '#arBest') === '14 天', 'ch3 RI 30: best 14 days');
    await setRange(page, 'arRi', 1); ok(await text(page, '#arBest') === '10 分钟', 'ch3 RI 1: best 10 minutes');
    // ch4
    await show(page, '#cpCv');
    await pick(page, 'cpRi', 350);
    ok(await text(page, '#cpTested') === '21 天' && (await text(page, '#cpSpline')).startsWith('27 天'), 'ch4 RI 350: tested 21, spline 27');
    // ch5
    await show(page, '#fsCv');
    await setRange(page, 'fsR', 0.97); ok(await text(page, '#fsN') === '9 次', 'ch5 target 97 %: 9 reviews');
    await setRange(page, 'fsR', 0.9); ok((await text(page, '#fsSay')).includes('2、13、59、222'), 'ch5 target 90 %: days 2, 13, 59, 222');
    // ch6
    await show(page, '#wkCv', 600);
    ok((await text(page, '#wkY1')).includes('150') && (await text(page, '#wkY3')).includes('220'), 'ch6 default ~150 then ~220');
    await setRange(page, 'wkR', 0.97); await page.waitForTimeout(400);
    ok((await text(page, '#wkY1')).includes('310') && (await text(page, '#wkSay')).includes('99%'), 'ch6 target 97 %: ~310 a day, 99 % known');
    // ch7
    await show(page, '#rkCv');
    ok(await text(page, '#rkA') === '42%' && await text(page, '#rkB') === '56%', 'ch7 Exp 1, 1 week: 42 % vs 56 %');
    await pick(page, 'rkDelay', 0); ok(await text(page, '#rkA') === '81%', 'ch7 Exp 1, 5 min: 81 %');
    await pick(page, 'rkDelay', 1); await pick(page, 'rkExp', 2);
    ok(await page.$eval('#rkD2', e => e.hidden) && await page.$eval('input[name=rkDelay]:checked', e => e.value) === '2', 'ch7 Exp 2 has no 2-day test; selection moves to 1 week');
    ok(await text(page, '#rkC') === '61%' && await text(page, '#rkA') === '40%', 'ch7 Exp 2, 1 week: 61 % vs 40 %');
    // ch8
    await show(page, '#jlCv');
    ok(await inked(page, '#jlCv') > 0, 'ch8 canvas draws once on screen');
    await pick(page, 'jlStudy', 'kb'); ok((await text(page, '#jlSay')).includes('0.61'), 'ch8 Kornell & Bjork: 0.61');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#arCv'); ok(await inked(page, '#arCv') > 0, 'reduced motion: charts still draw (they are static)');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser test (zh and stand-in en at 1280/390/320: overflow, clipped text, 48px targets, no Chinese from code in English mode; toggle without copy.en.js, on-screen drawing, keyboard and focus, all eight figures, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
