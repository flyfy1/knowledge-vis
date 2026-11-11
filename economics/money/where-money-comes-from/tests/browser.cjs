'use strict';
// Playwright smoke test for "Where money comes from".
// Usage (from the repo root, with a local server running):
//   python3 -m http.server 18884 --bind 127.0.0.1
//   ESSAY_BASE_URL=http://127.0.0.1:18884 NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
//     node economics/money/where-money-comes-from/tests/browser.cjs
// Checks: no page/console errors (the optional copy.en.js may 404), no horizontal overflow at 1280/390/320,
// every interactive target ≥ 48×48 px, the language toggle works with copy.en.js absent, each model responds
// to its controls, and no canvas label collides with another once each canvas is scrolled into view (the
// models only draw while visible, so the repo-wide sweep cannot see them otherwise).
const path = require('path');
const { chromium } = require('playwright');
const { record, collisions, clipped } = require(path.join(__dirname, '../../../../tests/canvas-text-overlap.cjs'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18884').replace(/\/$/, '') + '/economics/money/where-money-comes-from/';
const fails = []; let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };
const CANVASES = ['trCv', 'bkCv', 'bkCv2', 'runCv', 'runCv2', 'qtCv', 'wnCv', 'amCv', 'tmCv', 'fxCv'];

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference', locale: 'zh-CN' });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/copy.en.js')) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.addInitScript(record);
  if (opts.lang) await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) { /* ignore */ } }, opts.lang);
  await page.goto(base);
  await page.waitForFunction(() => window.__ready === true);
  return { page, errors };
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const slide = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = String(v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]);
async function canvasScan(page, label) {
  for (const id of CANVASES) {
    await page.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'center' }), id);
    await page.waitForTimeout(120);
  }
  for (const { id, w, h, boxes } of await page.evaluate(() => window.__canvasText())) {
    if (!w || !h) continue;
    for (const c of [...collisions(boxes), ...clipped(boxes, w, h)]) fails.push(`${label} #${id}: ${c}`);
    checks++;
  }
}

(async () => {
  const browser = await chromium.launch();

  for (const width of [1280, 390, 320]) {
    const { page, errors } = await open(browser, width, { reduce: true, lang: 'zh' });
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${width}: page starts in zh`);
    ok(/钱是从哪里来的/.test(await page.title()), `${width}: zh title`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(over <= 0, `${width}: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map(e => { const r = e.getBoundingClientRect(); return { d: (e.id || e.dataset.i18n || e.tagName) + ' ' + Math.round(r.width) + '×' + Math.round(r.height), w: r.width, h: r.height }; })
      .filter(x => x.w < 47.5 || x.h < 47.5).map(x => x.d));
    ok(!small.length, `${width}: targets under 48px: ${small.join(', ')}`);
    const missing = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => !e.textContent.trim()).map(e => e.dataset.i18n || e.dataset.i18nHtml));
    ok(!missing.length, `${width}: empty copy keys ${missing.join(', ')}`);
    const unlabelled = await page.evaluate(() => [...document.querySelectorAll('input[type=range]')].filter(e => !e.closest('label') || !e.closest('label').textContent.trim()).map(e => e.id));
    ok(!unlabelled.length, `${width}: sliders without a label: ${unlabelled}`);
    await canvasScan(page, `${width} zh reduced`);
    // contrast of body text tokens (computed once is enough)
    if (width === 1280) {
      const ratio = await page.evaluate(() => {
        const lum = c => { const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const out = [];
        for (const sel of ['.take', '.how', '.read div', '.legend', 'footer', '.toc a span']) {
          const e = document.querySelector(sel); let bg = e, col = getComputedStyle(e).color, b = 'rgba(0, 0, 0, 0)';
          while (bg && (b = getComputedStyle(bg).backgroundColor) === 'rgba(0, 0, 0, 0)') bg = bg.parentElement;
          const L1 = lum(col), L2 = lum(b); out.push([sel, (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)]);
        }
        return out;
      });
      for (const [sel, r] of ratio) ok(r >= 4.5, `contrast ${sel} ${r.toFixed(2)}`);
    }
    ok(!errors.length, `${width}: ${errors.join(' | ')}`);
    await page.close();
  }

  // English (copy.en.js present): same layout checks, plus no CJK left anywhere a reader can see or hear it
  // (text, aria-labels, title, canvas labels) apart from the 中 toggle label, and readout figures never
  // broken inside a number.
  for (const width of [1280, 390, 320]) {
    const { page, errors } = await open(browser, width, { reduce: true, lang: 'en' });
    ok(await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en)), `${width} en: copy.en.js loaded`);
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', `${width} en: <html lang=en>`);
    ok(!/[㐀-鿿＀-￯]/.test(await page.title()), `${width} en: title has CJK: ${await page.title()}`);
    ok(await page.$eval('#langToggle', e => e.innerText.replace(/\s+/g, ' ').trim()) === '中 EN', `${width} en: toggle reads 中 | EN`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(over <= 0, `${width} en: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .filter(e => { const r = e.getBoundingClientRect(); return r.width < 47.5 || r.height < 47.5; })
      .map(e => (e.id || e.dataset.i18n || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + '×' + Math.round(e.getBoundingClientRect().height)));
    ok(!small.length, `${width} en: targets under 48px: ${small.join(', ')}`);
    await canvasScan(page, `${width} en reduced`);
    const cjk = await page.evaluate(() => {
      const re = /[㐀-鿿＀-￯　-〿]/, out = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) {
        const el = n.parentElement; if (!re.test(n.textContent) || el.closest('#langToggle')) continue;
        const r = el.getBoundingClientRect(); if (r.width && r.height && getComputedStyle(el).visibility !== 'hidden') out.push(n.textContent.trim().slice(0, 40));
      }
      document.querySelectorAll('[aria-label],[title],meta[name=description]').forEach(e => ['aria-label', 'title', 'content'].forEach(a => { const v = e.getAttribute(a); if (v && re.test(v)) out.push(a + ': ' + v.slice(0, 40)); }));
      window.__canvasText().forEach(c => c.boxes.forEach(b => { if (re.test(b.text)) out.push('#' + c.id + ': ' + b.text); }));
      return out;
    });
    ok(!cjk.length, `${width} en: CJK visible in English mode: ${cjk.join(' | ')}`);
    const broken = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(b => b.textContent.trim()).filter(b => {
      if (b.scrollWidth > b.clientWidth + 1) return true; // a word sticks out of its tile
      const rg = document.createRange(); rg.selectNodeContents(b);
      const lines = [...rg.getClientRects()].map(r => Math.round(r.top)).filter((v, i, a) => a.indexOf(v) === i);
      if (lines.length < 2) return false;
      // wrapped: allowed only at a space, never inside a number such as 719,000
      return b.textContent.split(/\s+/).some(tok => /\d/.test(tok) && (() => { const r2 = document.createRange(), i = b.textContent.indexOf(tok); r2.setStart(b.firstChild, i); r2.setEnd(b.firstChild, i + tok.length); return new Set([...r2.getClientRects()].map(r => Math.round(r.top))).size > 1; })());
    }).map(b => b.id + ' "' + b.textContent + '"'));
    ok(!broken.length, `${width} en: readout figure broken across lines or clipped: ${broken.join(', ')}`);
    ok(!errors.length, `${width} en: ${errors.join(' | ')}`);
    await page.close();
  }
  // English model text: plain numbers, percentages, no Chinese units
  {
    const { page, errors } = await open(browser, 390, { reduce: true, lang: 'en' });
    ok(await text(page, '#amTot') === '719,000 yuan', 'en ch7 total interest: ' + await text(page, '#amTot'));
    await slide(page, 'amX', 1000);
    ok(await text(page, '#amSaved') === 'Paid off 8.4 years early, 225,000 yuan less interest', 'en ch7 saved: ' + await text(page, '#amSaved'));
    ok(await text(page, '#runSO') === '50%', 'en ch3 fire-sale recovery as a percentage: ' + await text(page, '#runSO'));
    ok(/36 are already queuing/.test(await text(page, '#runSay')) || /20 people/.test(await text(page, '#runSay')), 'en ch3 run sentence: ' + await text(page, '#runSay'));
    ok(!errors.length, 'en drive: ' + errors.join(' | '));
    await page.close();
  }

  // Drive every model once (normal motion, 390 wide).
  {
    const { page, errors } = await open(browser, 390, { lang: 'zh' });
    // ch1: more kinds of goods → more people barter can never serve
    await slide(page, 'trN', 12); await page.click('#trStep');
    ok(/12 种/.test(await text(page, '#trSay')) && /35/.test(await text(page, '#trSay')), 'ch1 say follows the goods slider');
    ok(parseInt(await text(page, '#trRound')) >= 10, 'ch1 step button runs 10 rounds');
    // ch2: a loan raises deposits; the textbook stops on reserves, today's central bank on capital
    await page.click('#bkReset'); await page.click('#bkLoan');
    ok(await text(page, '#bkD') === '100', 'ch2 loan creates a deposit');
    await page.click('#bkLoan'); ok(/准备金/.test(await text(page, '#bkSay')), 'ch2 textbook stops on reserves');
    await page.click('#bkModeC'); await page.click('#bkLoan'); await page.click('#bkLoan');
    await page.click('#bkLoan'); ok(/资本/.test(await text(page, '#bkSay')), 'ch2 today stops on capital');
    await page.click('#bkRepay'); ok(await text(page, '#bkD') === '110', 'ch2 repayment deletes money');
    // ch3: run versus insurance
    await page.evaluate(() => document.getElementById('runCv').scrollIntoView());
    await page.waitForTimeout(3500);
    ok(/35 人一分钱没拿到/.test(await text(page, '#runSay')), 'ch3 default ends in a run: ' + await text(page, '#runSay'));
    await page.click('#runIns'); await page.waitForTimeout(1200);
    ok(/一分钱也没赔/.test(await text(page, '#runSay')), 'ch3 insurance stops the run');
    // ch4: finish the default run, long-run inflation 5.9%
    await page.click('#qtFinish'); ok(await text(page, '#qtI') === '5.9%' && await text(page, '#qtL') === '5.9%', 'ch4 settles at 5.9%');
    await slide(page, 'qtV', -3); ok(await text(page, '#qtL') === '2.7%', 'ch4 velocity −3% → 2.7%');
    // ch5: anticipated inflation moves nothing; the ch4 button imports the machine's inflation
    await slide(page, 'wnE', 8); ok(/没有人占便宜/.test(await text(page, '#wnSay')), 'ch5 anticipated inflation');
    await page.click('#wnCh4'); ok(await page.$eval('#wnA', e => e.value) === '2.5', 'ch5 imports ch4 inflation (2.7% → 2.5)');
    // ch7: an extra 1000 a month saves 8.4 years
    await slide(page, 'amX', 1000); ok(/8\.4/.test(await text(page, '#amSaved')), 'ch7 extra payment: ' + await text(page, '#amSaved'));
    await page.click('#amCh5'); ok(await page.$eval('#amI', e => e.value) === '8', 'ch7 imports ch5 expected inflation');
    // ch8: all-variable mortgages deepen the trough
    await slide(page, 'tmV', 100); ok(/−0\.60/.test(await text(page, '#tmPeak')), 'ch8 all variable: ' + await text(page, '#tmPeak'));
    // ch9: a shock moves the rate; the ch4 button sets home inflation
    await page.click('#fxCh4'); ok(await page.$eval('#fxPi', e => e.value) === '2.5', 'ch9 imports ch4 inflation');
    await page.click('#fxReplay'); await page.evaluate(() => document.getElementById('fxCv').scrollIntoView()); await page.waitForTimeout(1500);
    const e0 = await text(page, '#fxE'); await page.click('#fxUp'); await page.waitForTimeout(300); ok(await text(page, '#fxE') !== e0, 'ch9 shock moves the exchange rate');
    await canvasScan(page, '390 zh after driving');
    ok(!errors.length, 'drive: ' + errors.join(' | '));
    await page.close();
  }

  // Language toggle with copy.en.js absent: switches state and storage, falls back to zh text, redraws.
  {
    const { page, errors } = await open(browser, 1280);
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'toggle sets <html lang=en>');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'lang stored');
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    if (!hasEn) ok((await text(page, '#ch1 h2')).length > 0, 'falls back to zh copy when copy.en.js is missing');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'toggle back to zh');
    ok(!errors.length, 'toggle: ' + errors.join(' | '));
    await page.close();
    // storage blocked: the page must still work, with the language kept in memory
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p2 = await ctx.newPage(); const err2 = []; p2.on('pageerror', e => err2.push(e.message));
    await p2.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    await p2.goto(base); await p2.waitForFunction(() => window.__ready === true);
    await p2.click('#langToggle [data-lang=en]');
    ok(await p2.evaluate(() => document.documentElement.lang) === 'en' && !err2.length, 'toggle works with storage blocked: ' + err2.join(' | '));
    await ctx.close();
  }

  // SWEEP=1: with each figure on screen, move every slider through 11 positions and every pair of sliders in
  // the same figure over a 6×6 grid, press every button, and check canvas labels after each state.
  if (process.env.SWEEP) for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const { page, errors } = await open(browser, width, { reduce: true, lang });
    const figs = await page.$$eval('figure.lab', fs => fs.map((f, i) => { f.dataset.fig = i; return i; }));
    for (const i of figs) {
      const sel = `figure[data-fig="${i}"]`;
      await page.$eval(sel, f => f.scrollIntoView({ block: 'start' })); await page.waitForTimeout(150);
      const scan = async state => { await page.waitForTimeout(40); for (const { id, w, h, boxes } of await page.evaluate(s => window.__canvasText().filter(c => document.getElementById(c.id) && document.getElementById(c.id).closest(s)), sel)) { checks++; for (const c of [...collisions(boxes), ...clipped(boxes, w, h)]) { const m = `${lang} ${width} #${id} ${state}: ${c}`; if (!fails.includes(m)) fails.push(m); } } };
      const ranges = await page.$$eval(`${sel} input[type=range]`, a => a.map(e => [e.id, +e.min, +e.max, e.value]));
      for (const [id, lo, hi, v0] of ranges) { for (let k = 0; k <= 10; k++) { const v = lo + (hi - lo) * k / 10; await slide(page, id, v); await scan(`${id}=${v}`); } await slide(page, id, v0); }
      for (let a = 0; a < ranges.length; a++) for (let b = a + 1; b < ranges.length; b++) {
        for (let u = 0; u <= 5; u++) for (let v = 0; v <= 5; v++) { const va = ranges[a][1] + (ranges[a][2] - ranges[a][1]) * u / 5, vb = ranges[b][1] + (ranges[b][2] - ranges[b][1]) * v / 5; await slide(page, ranges[a][0], va); await slide(page, ranges[b][0], vb); await scan(`${ranges[a][0]}=${va} ${ranges[b][0]}=${vb}`); }
        await slide(page, ranges[a][0], ranges[a][3]); await slide(page, ranges[b][0], ranges[b][3]);
      }
      for (const btn of await page.$$(`${sel} button`)) { for (let r = 0; r < 3; r++) { if (await btn.isDisabled()) break; await btn.click(); await scan('[' + (await btn.innerText()).slice(0, 12) + ']'); } }
    }
    ok(!errors.length, `sweep ${lang} ${width}: ` + errors.join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
  console.log(`PASS: ${checks} browser checks (1280/390/320, reduced motion, models driven, toggle, canvas labels)`);
})().catch(e => { console.error(e); process.exit(1); });
