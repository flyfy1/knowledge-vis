'use strict';
// Browser smoke test for the a-secret-in-public essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18984 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/systems/a-secret-in-public/tests/browser.cjs
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its own box,
// every control at least 48×48 px, the toggle reads 中 | EN. Then the language toggle with no copy.en.js
// (the page falls back to Chinese, no raw keys), each model responding to its controls with the numbers the
// prose and tests/models.cjs pin, and reduced motion (the brute-force race does one block of work, then estimates).
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18984').replace(/\/$/, '');
const url = base + '/computing/systems/a-secret-in-public/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const pick = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); e.checked = !e.checked || e.type === 'radio'; e.dispatchEvent(new Event('change', { bubbles: true })); }, sel);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };

(async () => {
  const browser = await chromium.launch();

  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width);
    const tag = `zh ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table *')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      if (e.closest('.tablewrap') && e.tagName !== 'TD' && e.tagName !== 'TH') return false;
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
    // elements outside the viewport, except content inside a horizontally scrolling table wrapper
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { if (e.closest('.tablewrap')) return false; const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    // no raw copy keys and no unfilled {placeholders} anywhere visible
    const raw = await page.evaluate(() => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { const s = n.textContent.trim(); if (/^(ch\d+|fx|merit|u|nav|toc|hero|doc)(\.\w+)+$/.test(s) || /\{\w+\}/.test(s)) out.push(s.slice(0, 30)); } return out.slice(0, 5); });
    ok(!raw.length, `${tag}: raw keys or placeholders visible: ${raw.join(' | ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle without copy.en.js; then drive every model
  {
    const page = await open(browser, 1280);
    const title = await text(page, 'h1');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    if (!hasEn) {
      ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'EN without copy.en.js: lang follows the text actually shown (zh)');
      ok((await text(page, 'h1')) === title, 'EN without copy.en.js falls back to the Chinese text');
    }
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.$eval('#langToggle [data-lang=zh]', e => e.getAttribute('aria-pressed')) === 'true', 'ZH pressed again');

    // ch1
    await show(page, '#knCv', 200);
    ok(await text(page, '#knBig') === '4,999,950,000', 'ch1 10^5 people');
    await setRange(page, 'knN', 40); ok(await text(page, '#knPairs') === '780', 'ch1 40 people → 780 keys');
    await pick(page, 'input[name=knMode][value=pub]'); ok((await text(page, '#knSay')).includes('40 对'), 'ch1 public-key sentence');

    // ch2a
    ok(await text(page, '#smVal') === '1,027' && await text(page, '#smSq') === '8' && await text(page, '#smMul') === '4', 'ch2 default trace 4^327 mod 2039');
    await setRange(page, 'smX', 1018); ok(await text(page, '#smVal') === '510', 'ch2 4^(q−1) = 4^(−1) = 510');
    await setRange(page, 'smX', 1); ok((await text(page, '#smSay')).includes('结果就是 4'), 'ch2 x = 1 sentence');

    // ch2b race: BSGS finds x at once; brute force finishes on 20 bits within a few seconds
    await show(page, '#rcCv', 300);
    ok(await text(page, '#rcBsgs') === '1,305', 'ch2 race 20-bit BSGS steps, got ' + await text(page, '#rcBsgs'));
    await page.waitForFunction(() => document.querySelector('#rcEta').textContent.includes('已经找到'), null, { timeout: 15000 }).catch(() => {});
    ok(await text(page, '#rcBrute') === '420,965', 'ch2 race brute finds x = 420,965, got ' + await text(page, '#rcBrute'));
    await setRange(page, 'rcBits', 40); await page.waitForTimeout(600);
    ok(await text(page, '#rcBsgs') === '1,471,313', 'ch2 race 40-bit BSGS steps, got ' + await text(page, '#rcBsgs'));
    ok(/已试/.test(await text(page, '#rcBrute')) && /约/.test(await text(page, '#rcEta')), 'ch2 race 40-bit brute still running with an ETA: ' + await text(page, '#rcEta'));
    await setRange(page, 'rcBits', 8); await page.waitForTimeout(400);

    // ch3
    await show(page, '#dhBoard');
    ok(await text(page, '#dhKA') === '294' && await text(page, '#dhKB') === '294', 'ch3 both sides 294');
    await page.click('#dhEve'); ok(await text(page, '#dhEveK') === '294' && await text(page, '#dhEveSteps') === '42', 'ch3 Eve 42 steps');
    await pick(page, '#dhMal'); ok(await text(page, '#dhKA') === '60' && await text(page, '#dhKB') === '212', 'ch3 MITM keys 60 / 212');
    ok(await page.$$eval('#dhBoard .col', e => e.length) === 4, 'ch3 Mallory column shown');
    await pick(page, '#dhMal');

    // ch4
    await show(page, '#rsPub');
    ok(await text(page, '#rsPub') === 'n = 56,153, e = 257' && await text(page, '#rsC') === '16,748' && await text(page, '#rsDec') === '100', 'ch4 default key and cipher');
    await page.click('#rsTamper'); ok(await text(page, '#rsDec') === '200', 'ch4 tamper doubles');
    await page.click('#rsFactor'); ok((await text(page, '#rsAtk')).includes('116'), 'ch4 factor in 116 divisions');
    await page.click('#rsTamper'); await page.click('#rsFactor');
    await setRange(page, 'rsQ', 27); ok((await text(page, '#rsSay')).includes('相邻的质数'), 'ch4 p = q is bumped');
    await setRange(page, 'rsP', 0); await setRange(page, 'rsQ', 1); ok(+(await page.$eval('#rsM', e => e.max)) === 101 * 103 - 1, 'ch4 message slider follows n − 1');
    ok(await page.evaluate(() => document.getElementById('rsM').value <= 101 * 103 - 1), 'ch4 message clamped');
    ok(await text(page, '#cbOut') === '“MEET AT NOON”', 'ch4 cube root reads the message');
    await pick(page, '#cbPad'); ok(!(await text(page, '#cbOut')).includes('“'), 'ch4 padding defeats the root');
    await pick(page, '#cbPad'); await pick(page, 'input[name=cbMsg][value="2"]'); ok(await text(page, '#cbOut') === '“YES”', 'ch4 cube root YES');

    // ch5
    await show(page, '#erCv', 200);
    await setRange(page, 'erQ', -1.2); ok((await text(page, '#erSay')).includes('切线'), 'ch5 tangent when P = Q');
    await pick(page, '#erQneg'); ok((await text(page, '#erRv')).includes('无穷远点'), 'ch5 vertical line gives O');
    await show(page, '#efCv', 200);
    ok(await text(page, '#efKG') === '(49, 34)' && await text(page, '#efN') === '100' && await text(page, '#efHasse') === '79–117', 'ch5 p=97, 23G');
    ok(+(await page.$eval('#efK', e => e.max)) === 50, 'ch5 k slider max = order of G');
    await setRange(page, 'efK', 50); ok((await text(page, '#efSay')).includes('无穷远点'), 'ch5 k = order returns to O');
    await setRange(page, 'efP', 48); await page.waitForTimeout(100); ok(await text(page, '#efPo') === 'p = 251', 'ch5 largest p');
    ok((await page.$$eval('#nistTable tbody tr', r => r.length)) === 5, 'ch5 NIST table');

    // ch6
    await show(page, '#ctCerts');
    ok((await text(page, '#ctVerdict')).includes('通过'), 'ch6 honest chain verifies');
    for (const tp of ['name', 'key', 'resign', 'selfroot']) { await pick(page, `input[name=ctT][value=${tp}]`); ok((await text(page, '#ctVerdict')).includes('链断了'), 'ch6 ' + tp + ' breaks the chain'); }
    await pick(page, 'input[name=ctT][value=none]');

    // ch7
    await show(page, '#scCv', 200);
    ok((await page.$eval('#scRsa', e => e.innerHTML)) === '2<sup>63.9</sup>', 'ch7 512-bit RSA 2^63.9');
    await setRange(page, 'scB', 12); ok((await page.$eval('#scRsa', e => e.innerHTML)) === '2<sup>116.9</sup>', 'ch7 2048 → 2^116.9');
    await setRange(page, 'scB', 8); ok((await text(page, '#scSay')).includes('128 位安全'), 'ch7 256-bit symecc sentence');
    await pick(page, '#scQ'); ok((await text(page, '#scSay')).includes('Shor'), 'ch7 quantum sentence for curves');
    await setRange(page, 'scB', 0); ok((await text(page, '#scSay')).includes('Grover'), 'ch7 quantum sentence for 64-bit symmetric');
    await pick(page, '#scQ');
    ok((await page.$$eval('#recTable tbody tr', r => r.length)) === 5, 'ch7 records table');

    // ch8
    await show(page, '#shCv', 200);
    ok(await text(page, '#shF') === '11 × 13' && await text(page, '#shR') === '60' && await text(page, '#shShare') === '76%', 'ch8 N = 143 a = 2');
    await setRange(page, 'shN', 0); await setRange(page, 'shA', 4); ok((await text(page, '#shSay')).includes('r = 2'), 'ch8 N=15 a=4');
    await setRange(page, 'shA', 5); ok((await text(page, '#shSay')).includes('公因子'), 'ch8 lucky gcd');
    await setRange(page, 'shN', 1); await setRange(page, 'shA', 4); ok((await text(page, '#shSay')).includes('奇数'), 'ch8 N=21 a=4 odd period');
    await setRange(page, 'shA', 5); ok((await text(page, '#shSay')).includes('N − 1'), 'ch8 N=21 a=5 hits N − 1');
    ok(await text(page, '#moExp') === '3 年', 'ch8 Mosca default exposure 3 years');
    await setRange(page, 'moZ', 30); ok((await text(page, '#moSay')).includes('小 12 年'), 'ch8 Mosca safe');

    // ch9
    await show(page, '#ltCv', 200);
    ok(await text(page, '#ltGood') === '3.61' && await text(page, '#ltBad') === '9.98', 'ch9 lattice seed 1: good 3.61, bad 9.98');
    await page.click('#ltNew'); await page.waitForTimeout(100); ok((await text(page, '#ltSay')).length > 20, 'ch9 new target');
    await show(page, '#lwCv', 300);
    ok(await text(page, '#lwFail') === '8 / 2,000' && await text(page, '#lwPred') === '0.48%', 'ch9 LWE default: 8 failures, 0.48% predicted');
    await page.click('#lwEve'); ok((await text(page, '#lwLin')).includes('个是错的'), 'ch9 Eve fails with noise');
    await pick(page, '#lwZero'); await page.click('#lwEve'); ok((await text(page, '#lwLin')).includes('全对'), 'ch9 Eve solves without noise');
    await pick(page, '#lwZero');
    await setRange(page, 'lwE', 1); ok((await text(page, '#lwSay')).includes('没有一次出错'), 'ch9 small noise: clean');
    await setRange(page, 'lwE', 24); await setRange(page, 'lwN', 32); ok((await text(page, '#lwSay')).includes('连 Bob 自己都解不开'), 'ch9 big noise: many');
    ok((await page.$$eval('#kemTable tbody tr', r => r.length)) === 3, 'ch9 ML-KEM table');

    // ch10
    ok((await page.$$eval('#fxStd li, #fxDeploy li, #fxAttack li, #fxClaim li', r => r.length)) === 19, 'ch10 nineteen frontier items');
    ok((await text(page, '#fxStd li .when')) === '2024 年 8 月', 'ch10 dated in Chinese');
    ok((await page.$$eval('#meritTable tbody tr', r => r.length)) === 10, 'ch10 merit table');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: the race does one block of brute force and then shows an estimate, no animation
  {
    const page = await open(browser, 390, { reduce: true });
    await show(page, '#rcCv', 300);
    await setRange(page, 'rcBits', 40); await page.waitForTimeout(300);
    const a = await text(page, '#rcBrute'); await page.waitForTimeout(1200); const b = await text(page, '#rcBrute');
    ok(a === b && /已试/.test(a), 'reduced motion: brute force does not keep running (' + a + ' → ' + b + ')');
    ok(/约/.test(await text(page, '#rcEta')), 'reduced motion: an estimate is shown');
    ok((await text(page, '#rcSay')).includes('减弱动态'), 'reduced motion sentence');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('browser checks passed');
})().catch(e => { console.error(e); process.exit(1); });
