'use strict';
// Browser smoke test for the battery essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18985 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node chemistry/reactions/why-batteries-hold-so-little/tests/browser.cjs
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its own box, every
// control at least 48×48 px, the toggle reads 中 | EN. In English (when copy.en.js exists) no CJK anywhere visible;
// without it, EN falls back to Chinese with no raw keys. Then each model responds to its controls, keyboard
// operation works, and reduced motion jumps the animated models to their end state.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18985').replace(/\/$/, '');
const url = base + '/chemistry/reactions/why-batteries-hold-so-little/';
const shots = process.env.ESSAY_SHOTS || ''; // optional folder for screenshots (outside the repo)
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
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const num = s => parseFloat(String(s).replace(/[^\d.\-]/g, ''));

(async () => {
  const browser = await chromium.launch();
  const hasEn = await (async () => { const p = await browser.newPage(); const r = await p.goto(url + 'copy.en.js'); const okEn = r.status() < 400; await p.close(); return okEn; })();
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    const figs = await page.$$('figure');
    for (let i = 0; i < figs.length; i++) {
      await figs[i].evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400);
      if (shots && lang === 'zh') await figs[i].screenshot({ path: `${shots}/browser-${width}-fig${i + 1}.png` });
    }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    if (lang === 'en') {
      const leaks = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!rx.test(n.textContent) || !el.getClientRects().length) continue; if (el.closest('#langToggle') && n.textContent.trim() === '中') continue; out.push('text: ' + n.textContent.trim().slice(0, 30)); }
        for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria-label: ' + e.getAttribute('aria-label'));
        if (rx.test(document.title)) out.push('title');
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
      for (const e of document.querySelectorAll('button, input, select, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), `${tag}: raw keys shown`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle, keyboard, and every model responding to its controls
  {
    const page = await open(browser, 1280);
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok((await text(page, 'h1')).length > 0, 'title filled after switching');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching to EN');
    if (!hasEn) ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js, EN falls back to Chinese and says so in html lang');
    await page.click('#langToggle [data-lang=zh]');

    // ch1: Zn | Cu by keyboard on the selects
    await show(page, '#lzCv', 300);
    await page.focus('#lzA'); await page.selectOption('#lzA', 'zn'); await page.selectOption('#lzC', 'cu');
    ok((await text(page, '#lzE')).startsWith('1.10'), 'ch1 Zn/Cu = 1.10 V, got ' + await text(page, '#lzE'));
    await page.selectOption('#lzA', 'cu'); await page.selectOption('#lzC', 'zn');
    ok((await text(page, '#lzSay')).includes('反过来'), 'ch1 reversed pair sentence');
    // ch2: LFP drops the cell value; keyboard on the radios
    await show(page, '#wfCv', 300);
    ok(num(await text(page, '#wfCell')) === 270, 'ch2 default 270 Wh/kg, got ' + await text(page, '#wfCell'));
    await page.focus('input[name=wfC][value=nmc]'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok(num(await text(page, '#wfCell')) === 209, 'ch2 arrow key moves to LFP (209), got ' + await text(page, '#wfCell'));
    await page.focus('#wfQ'); await page.keyboard.press('End'); await page.waitForTimeout(100);
    ok((await text(page, '#wfQo')).startsWith('8.0'), 'ch2 End key on the slider reaches 8 mAh/cm²');
    // ch3: plateau appears above w = 2
    await show(page, '#lgCv', 200); await setRange(page, 'lgW', 3);
    ok((await text(page, '#lgPlat')).includes('0.071'), 'ch3 w=3 binodal 0.071, got ' + await text(page, '#lgPlat'));
    await show(page, '#ocCv', 200); ok((await text(page, '#ocLe')) === '±10.6%', 'ch3 LFP error at 50%/5 mV');
    // ch4: NMC at 4C stops partly filled
    await show(page, '#dfCv', 300);
    await page.click('label:has(input[name=dfM][value=nmc])'); await setRange(page, 'dfC', 4); await page.waitForTimeout(7000);
    ok(num(await text(page, '#dfFill')) === 68, 'ch4 NMC 4C fills 68%, got ' + await text(page, '#dfFill'));
    // ch5: 1C default numbers after the replay
    await show(page, '#ccCv'); await page.waitForTimeout(5800);
    ok(num(await text(page, '#cc80')) === 53 && num(await text(page, '#ccSw')) === 66, 'ch5 1C: 66% switch, 53 min to 80%');
    await setRange(page, 'ccT', -10); await setRange(page, 'ccC', 2); await page.waitForTimeout(6500);
    ok((await text(page, '#ccSay')).includes('析锂'), 'ch5 −10 °C 2C sentence warns about plating: ' + await text(page, '#ccSay'));
    // ch6: 128 °C runs away, 127 does not
    await show(page, '#smCv'); await setRange(page, 'trA', 128); await page.waitForTimeout(5800);
    ok((await text(page, '#trTime')).includes('61.9'), 'ch6 128 °C runaway at 61.9 min, got ' + await text(page, '#trTime'));
    ok((await text(page, '#trCrit')).startsWith('127.0'), 'ch6 critical 127.0 °C');
    // ch7, ch8, ch9
    await show(page, '#agCv', 200); ok((await text(page, '#agQ10')) === '61%', 'ch7 default 61% at 10 years');
    await setRange(page, 'agN', 0); ok((await text(page, '#agSay')).includes('不循环'), 'ch7 storage-only sentence');
    await show(page, '#lcCv', 200); ok((await text(page, '#lcLR')) === '29.1%', 'ch8 1998 fit 29.1%');
    await setRange(page, 'lcF', 1991); ok((await text(page, '#lcLR')) === '19.5%', 'ch8 full series 19.5%');
    await show(page, '#ftCv', 200); await page.selectOption('#ftPick', 'shenxing3');
    ok((await text(page, '#ftSay')).includes('6 分 27 秒'), 'ch9 claim sentence formats 6 min 27 s');
    ok(await page.$$eval('#ftClaim li', l => l.length) === 6 && await page.$$eval('#ftEst li', l => l.length) === 8, 'ch9 lists split by status');
    await setRange(page, 'liV', 3.7); ok((await text(page, '#liKg')) === '0.070 kg', 'ch9 Li floor 0.070 kg at 3.7 V');
    // focus is visible on a slider
    await page.focus('#liV'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
    ok(await page.evaluate(() => document.activeElement.id) === 'liV' && await page.$eval('#liV', e => getComputedStyle(e).outlineStyle !== 'none'), 'visible focus outline on sliders');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: animated models show their end state at once
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#dfCv', 300); ok(!(await text(page, '#dfSay')).includes('……'), 'reduced motion: ch4 at its end state');
    await show(page, '#ccCv', 300); ok(!(await text(page, '#ccSay')).includes('……'), 'reduced motion: ch5 at its end state');
    await show(page, '#smCv', 300); ok(!(await text(page, '#trSay')).includes('……'), 'reduced motion: ch6 at its end state');
    await page.click('#dfGo'); await page.waitForTimeout(100); ok(!(await text(page, '#dfSay')).includes('……'), 'reduced motion: replay jumps to the end');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${hasEn ? 'zh and en' : 'zh; EN falls back without copy.en.js'} at 1280/390/320: overflow, clipped text, 48px targets; keyboard; all ten models; reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
