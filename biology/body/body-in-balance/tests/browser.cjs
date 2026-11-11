'use strict';
// Browser smoke test for the body-in-balance essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18882 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node biology/body/body-in-balance/tests/browser.cjs
// Checks, in Chinese and in English: no console/page errors, no horizontal overflow at 1280/390/320, no text
// clipped inside its own box, every control at least 48×48 px, the toggle reads 中 | EN; in English no CJK
// characters anywhere visible (DOM text, aria-labels, the document title, canvas fillText) apart from the 中
// button. Then the language toggle, reduced motion jumping models to their end state, and each model
// responding to its controls.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18882').replace(/\/$/, '');
const url = base + '/biology/body/body-in-balance/';
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
  // record every string drawn on a canvas, so Chinese left in canvas labels is caught in English mode
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  // the console line for a failed resource has no URL; real 4xx responses are caught by the response handler above
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };

(async () => {
  const browser = await chromium.launch();

  // layout, targets and errors at three widths, in both languages
  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    // draw every model (canvases only draw on screen) before looking at canvas text and tiles
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(350); }
    // text clipped inside its own box (tiles, buttons, outputs)
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);
    if (lang === 'en') {
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
      ok(!leaks.length, `${tag}: Chinese visible in English mode: ${leaks.join(' | ')}`);
    }
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${width}: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => {
      const out = [];
      const boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${width}: targets under 48px: ${small.join(', ')}`);
    // every element with text stays inside the viewport horizontally
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${width}: elements outside the viewport: ${wide.join(', ')}`);
    ok(!page.__errors().length, `${width}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle without copy.en.js, and drive every model
  {
    const page = await open(browser, 1280);
    const title = await text(page, 'h1');
    ok(title.length > 0 && !title.includes('.'), 'hero title should be filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en)), 'copy.en.js is loaded');
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'EN toggle: lang follows the text actually shown');
    ok(!/[\u4e00-\u9fff]/.test(await text(page, 'h1')), 'EN toggle switches the title to English instantly');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok((await text(page, 'h1')).length > 0, 'title is filled after switching');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1: change the tap, then push the bucket
    await show(page, '#bkCv', 300);
    await setRange(page, 'bkI', 3); await page.waitForTimeout(200);
    ok((await text(page, '#bkIn')).startsWith('3.0'), 'ch1 inflow readout follows the slider');
    const l0 = parseFloat(await text(page, '#bkL')); await page.click('#bkAdd');
    ok(parseFloat(await text(page, '#bkL')) >= Math.min(30, l0 + 4.5), 'ch1 pour adds water');
    await page.waitForTimeout(1200); ok(parseFloat(await text(page, '#bkL')) > 0, 'ch1 level evolves');

    // ch2: miss + double, after the replay reaches the end
    await show(page, '#dsCv');
    await page.click('input[name=dsPlan][value=double]', { force: true });
    await page.waitForTimeout(13000);
    ok((await page.$eval('#dsSay', e => e.textContent)).includes('2.49'), 'ch2 double-up sentence shows 2.49: ' + await text(page, '#dsSay'));
    await page.click('#dsReplay'); await page.waitForTimeout(300);
    ok(parseFloat(await text(page, '#dsHalves')) < 1, 'ch2 replay restarts the clock');

    // ch3: drinking faster than the liver
    await show(page, '#alCv');
    await setRange(page, 'alG', 0.25); await page.waitForTimeout(200);
    ok((await page.$eval('#alSay', e => e.textContent)).includes('0.75'), 'ch3 fast sentence mentions the 0.75 cap');

    // ch4: weak insulin
    await show(page, '#glCv');
    await setRange(page, 'glGain', 10); await page.click('#glReplay'); await page.waitForTimeout(8500);
    ok((await text(page, '#gl120')).startsWith('7.6'), 'ch4 weak insulin: 2 h value 7.6, got ' + await text(page, '#gl120'));

    // ch5: fever rises; antipyretic makes the body shed heat
    await show(page, '#thCv'); await page.waitForTimeout(2500);
    ok(parseFloat(await text(page, '#thT')) > 37.3, 'ch5 temperature rises with fever');
    await page.waitForTimeout(6000);
    await page.click('#thDrug'); await page.waitForTimeout(1500);
    ok((await text(page, '#thDo')).includes('%') && (await text(page, '#thSet')) < '38.5', 'ch5 antipyretic lowers the set point');

    // ch6: three times a day stays inside the window
    await show(page, '#twCv2');
    await page.click('input[name=twN][value="3"]', { force: true }); await page.click('#twReplay'); await page.waitForTimeout(6800);
    ok((await text(page, '#twIn')) === '100%', 'ch6 3×/day all in window, got ' + await text(page, '#twIn'));

    // ch7: heart rate climbs toward its target
    await show(page, '#htCv'); const h0 = parseFloat(await text(page, '#htHr')); await page.waitForTimeout(3000);
    ok(parseFloat(await text(page, '#htHr')) > h0, 'ch7 heart rate climbs');
    await setRange(page, 'htL', 10); await setRange(page, 'htA', 60); await page.waitForTimeout(400);
    ok((await text(page, '#htMax')).startsWith('166'), 'ch7 HRmax at 60 = 166');

    // ch8: dose 24 clears
    await show(page, '#abCv');
    await setRange(page, 'abD', 8); await page.click('#abReplay'); await page.waitForTimeout(10500);
    ok((await text(page, '#abClr')).includes('3.3'), 'ch8 dose 24 clears on day 3.3, got ' + await text(page, '#abClr'));

    // ch9: above the threshold the outbreak dies out
    await show(page, '#hdCv');
    await setRange(page, 'hdV', 80); await page.waitForTimeout(4000);
    ok((await text(page, '#hdRe')) === '0.60', 'ch9 Re at 80% = 0.60');
    ok(parseInt(await text(page, '#hdInf')) < 40, 'ch9 outbreak fizzles above the threshold');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: models show their end state without waiting
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#dsCv', 300); ok(parseFloat(await text(page, '#dsHalves')) === 12, 'reduced motion: ch2 jumps to 96 h');
    await show(page, '#thCv', 300); ok(parseFloat(await text(page, '#thT')) > 38.5, 'reduced motion: ch5 jumps to the fever plateau');
    await show(page, '#hdCv', 300); ok((await page.$eval('#hdSay', e => e.textContent)).length > 10 && !(await page.$eval('#hdSay', e => e.textContent)).includes('……'), 'reduced motion: ch9 runs to the end');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, no Chinese in English mode; language toggle, all nine models, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
