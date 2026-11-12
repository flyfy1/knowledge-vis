'use strict';
// Browser smoke test for the soy sauce essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18895 NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
//   node food/flavor/how-soy-sauce-gets-its-flavor/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// Checks in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box,
// every control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every live sentence filled. Then the language
// toggle (English copy is a later step: the page must fall back to Chinese and keep lang="zh-CN"), keyboard operation
// of a slider, each model responding to its controls, and reduced motion jumping the relay to its end state.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18895').replace(/\/$/, '');
const url = base + '/food/flavor/how-soy-sauce-gets-its-flavor/';
const SHOT = process.env.SHOT_DIR || '';
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
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.click(`input[name=${name}][value="${value}"]`, { force: true });

(async () => {
  const browser = await chromium.launch();

  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width);
    const tag = `zh ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
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
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10 || /\{\w+\}/.test(e.textContent)).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty or with unfilled placeholders: ${emptySay.join(', ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) await page.screenshot({ path: `${SHOT}/full-zh-${width}.png`, fullPage: true });
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')) === '酱油是怎么酿出来的', 'hero title filled from copy');
    // language toggle: no English copy yet, so the page falls back to Chinese and says so in lang
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1 timeline readouts come from the models
    await show(page, '#tlCv', 200);
    ok((await text(page, '#tlPh')) === '第 13 天' && (await text(page, '#tlY')) === '第 30 天', 'ch1 timeline days from the relay model');

    // ch2: keyboard on the depth slider; 4 cm tray stays below 40 °C; turning cuts the hours above 40
    await show(page, '#kjCv', 200);
    await page.focus('#kjD'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok((await text(page, '#kjDo')) === '11 厘米', 'ch2 slider responds to the keyboard, got ' + await text(page, '#kjDo'));
    await setRange(page, 'kjD', 4); await page.waitForTimeout(80);
    ok((await text(page, '#kjPeak')) === '39.5 °C', 'ch2 4 cm peak 39.5, got ' + await text(page, '#kjPeak'));
    ok((await text(page, '#kjMax')) === '4.2 厘米', 'ch2 max depth 4.2 cm');
    await setRange(page, 'kjD', 10); await page.waitForTimeout(80);
    ok((await text(page, '#kjOver')) === '39 小时', 'ch2 10 cm unturned 39 h over 40, got ' + await text(page, '#kjOver'));
    await pick(page, 'kjT', '4'); await page.waitForTimeout(80);
    ok((await text(page, '#kjOver')) === '3.9 小时', 'ch2 turning every 4 h, got ' + await text(page, '#kjOver'));
    await setRange(page, 'kjD', 30); await pick(page, 'kjT', '0'); await page.waitForTimeout(80);
    ok((await text(page, '#kjT90')) === '60 小时内没到', 'ch2 30 cm unturned stalls');

    // ch3
    await show(page, '#mxCv', 200);
    await setRange(page, 'mxS', 100); ok((await text(page, '#mxSu')) === '0.52', 'ch3 all-soy sugar 0.52');
    ok((await page.$eval('#mxSay', e => e.textContent)).includes('全用黄豆'), 'ch3 all-soy sentence');

    // ch4: the relay succeeds by default and fails with too much salt
    await show(page, '#rlCv'); await page.click('#rlReplay'); await page.waitForTimeout(11000);
    ok((await text(page, '#rlDay')) === '180', 'ch4 replay reaches day 180, got ' + await text(page, '#rlDay'));
    ok((await text(page, '#rlE')) === '3.2%', 'ch4 default ethanol 3.2%, got ' + await text(page, '#rlE'));
    ok((await page.$eval('#rlSay', e => e.textContent)).includes('接力成功'), 'ch4 default succeeds');
    await setRange(page, 'rlW', 21); await page.waitForTimeout(200);
    ok(parseFloat(await text(page, '#rlDay')) < 5, 'ch4 changing salt restarts the clock');
    ok((await text(page, '#rlD5')) === '180 天内没有', 'ch4 21% salt: pH never reaches 5');
    await page.waitForTimeout(11000);
    ok((await page.$eval('#rlSay', e => e.textContent)).includes('接力失败'), 'ch4 21% salt fails, got ' + await page.$eval('#rlSay', e => e.textContent));
    await setRange(page, 'rlW', 17); await setRange(page, 'rlT', 10); await page.waitForTimeout(100);
    ok((await text(page, '#rlDY')) === '180 天内没有', 'ch4 10 °C: yeast never takes over');

    // ch5
    await show(page, '#brCv', 200);
    ok((await text(page, '#brHeat')) === '19.6 天', 'ch5 default heat equivalent 19.6 d, got ' + await text(page, '#brHeat'));
    await setRange(page, 'brEa', 20); await page.waitForTimeout(80);
    ok((await text(page, '#brHeat')) === '1.8 小时', 'ch5 Ea 20 → 1.8 h, got ' + await text(page, '#brHeat'));

    // ch7
    await show(page, '#lbCv', 200);
    ok((await text(page, '#lbG')) === '二级', 'ch7 default 0.60 + 0.05 is grade 2, got ' + await text(page, '#lbG'));
    await setRange(page, 'lbM', 3); await page.waitForTimeout(80);
    ok((await text(page, '#lbG')) === '特级' && (await page.$eval('#lbSay', e => e.textContent)).includes('不应影响酱油质量等级'), 'ch7 MSG lifts the reading and the sentence says so');
    await setRange(page, 'lbM', 0); await setRange(page, 'lbN', 0.3); await page.waitForTimeout(80);
    ok((await page.$eval('#lbSay', e => e.textContent)).includes('28%'), 'ch7 ammonium over the cap');

    // ch8
    await show(page, '#ctCv', 200);
    await setRange(page, 'ctD', 10); ok((await text(page, '#ctSt')) === '还在乳酸菌那一棒', 'ch8 day 10 still lactic');
    await setRange(page, 'ctD', 180); ok((await text(page, '#ctSt')) === '酵母那一棒已过半', 'ch8 day 180 yeast');

    // ch9
    await show(page, '#naCv', 200);
    ok((await text(page, '#naNa')) === '855 毫克', 'ch9 15 g koikuchi 855 mg');
    await pick(page, 'naS', 'usu'); await page.waitForTimeout(80);
    ok((await text(page, '#naNa')) === '945 毫克', 'ch9 usukuchi 945 mg');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; the relay shows its end state at once
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#rlCv', 300); ok((await text(page, '#rlDay')) === '180', 'reduced motion: ch4 jumps to day 180');
    await setRange(page, 'rlW', 20); await page.waitForTimeout(100); ok((await text(page, '#rlDay')) === '180', 'reduced motion: ch4 stays at the end after a change');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh at 1280/390/320: overflow, clipped text, 48px targets, raw keys, readouts, live sentences; toggle fallback, keyboard, all eight figures driven, relay success and failure, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
