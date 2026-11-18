'use strict';
// Browser test for the how-electricity-reaches-you essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18966 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node tech/energy/how-electricity-reaches-you/tests/browser.cjs
// Checks at 1280/390/320 in Chinese (and in English once copy.en.js exists): no console/page errors, no horizontal
// overflow, no text clipped in its box, every control at least 48×48 px, the toggle reads 中 | EN. Then: the language
// toggle (works with copy.en.js absent), keyboard operation and a visible focus ring, each model driven to a state the
// prose describes, every live sentence at the extremes of every control (no unfilled placeholder, no NaN), and reduced
// motion jumping replays to their end.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18966').replace(/\/$/, '');
const url = base + '/tech/energy/how-electricity-reaches-you/';
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
const text = (page, sel) => page.$eval(sel, e => e.textContent.replace(/ /g, ' ').trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const setRadio = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const setCheck = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); if (e.checked !== v) { e.checked = v; e.dispatchEvent(new Event('change', { bubbles: true })); } }, [id, v]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const bad = s => /[{}]|NaN|undefined|Infinity/.test(s);

(async () => {
  const browser = await chromium.launch();
  const hasEn = await (async () => { const p = await browser.newPage(); const r = await p.goto(url + 'copy.en.js'); const s = r.status(); await p.close(); return s === 200; })();
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    if (lang === 'en') {
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
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^[\w-]+(\.[\w-]+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw copy keys shown: ${raw.join(', ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle (copy.en.js may be absent: the page must not break), keyboard, focus
  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')).length > 0, 'hero title filled from copy');
    ok(CJK.test(await page.evaluate(() => document.title)), 'zh: Chinese document title');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'EN toggle: lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0 && !(await page.evaluate(() => [...document.querySelectorAll('[data-i18n]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'EN toggle: no raw keys');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    await show(page, '#lnCv', 300);
    await page.focus('#lnV'); const v0 = await page.$eval('#lnV', e => +e.value);
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok(await page.$eval('#lnV', e => +e.value) === v0 + 1, 'keyboard: arrow key moves the voltage slider');
    ok((await text(page, '#lnSay')).includes('1.6'), 'keyboard: 500 kV sentence shows 1.6%: ' + await text(page, '#lnSay'));
    const ring = await page.$eval('#lnV', e => { const s = getComputedStyle(e); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 || s.boxShadow !== 'none'; });
    ok(ring, 'keyboard focus is visible on a slider');
    await page.focus('input[name=txSrc][value=ac]'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok(await page.$eval('input[name=txSrc][value=dc]', e => e.checked), 'keyboard: arrow key moves the AC/DC radio group');
    ok((await text(page, '#txV2')).startsWith('0'), 'keyboard: DC gives 0 V out: ' + await text(page, '#txV2'));
    await page.focus('#s1Go'); await page.keyboard.press('Enter');
    ok(!page.__errors().length, 'toggle/keyboard: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // drive every model at full motion (clocks move) and check the states the prose describes
  {
    const page = await open(browser, 1280);
    // ch1: default gap, clock runs then the sentence names 10.2 s and 48.33
    await show(page, '#s1Cv', 300); await page.click('#s1Go'); await page.waitForTimeout(1200);
    const mid = await text(page, '#s1Say'); await page.waitForTimeout(9500);
    ok((await text(page, '#s1Say')).includes('10.2') && (await text(page, '#s1Say')).includes('48.33'), 'ch1 default sentence names 10.2 s and 48.33 Hz: ' + await text(page, '#s1Say'));
    ok((await text(page, '#s1Rocof')).includes('0.21'), 'ch1 RoCoF tile 0.21: ' + await text(page, '#s1Rocof'));
    ok(typeof mid === 'string', 'ch1 mid-run sentence exists');
    // ch2: default governor run
    await show(page, '#s2Cv', 300); await page.click('#s2Go'); await page.waitForTimeout(11000);
    ok((await text(page, '#s2Nadir')).includes('49.75') && (await text(page, '#s2End')).includes('49.92'), `ch2 nadir 49.75 / end 49.92: ${await text(page, '#s2Nadir')} ${await text(page, '#s2End')}`);
    // ch3: the game clock moves when run
    await show(page, '#opCv', 300); const t0 = await text(page, '#opNow'); await page.click('#opRun'); await page.waitForTimeout(2500);
    ok(await text(page, '#opNow') !== t0, 'ch3 clock advances when running: ' + t0 + ' → ' + await text(page, '#opNow'));
    await page.click('#opReset'); await page.waitForTimeout(200);
    // ch10: ×1.1, lose B–X, ends in total blackout
    await show(page, '#boCv', 300); await setRange(page, 'boL', 1.1); await setRadio(page, 'boEv', '2'); await page.click('#boGo');
    await page.waitForTimeout(11000);
    ok((await text(page, '#boSay')).includes('495') && (await text(page, '#boSay')).includes('1,485'),'ch10 ×1.1 line B–X: whole load dark: ' + await text(page, '#boSay'));
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: replays jump to their end; then states and every sentence at the extremes
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#s1Cv', 300); await page.click('#s1Go'); await page.waitForTimeout(200);
    ok((await text(page, '#s1Say')).includes('48.33'), 'reduced: ch1 jumps to the end: ' + await text(page, '#s1Say'));
    await show(page, '#s2Cv', 300); await setCheck(page, 's2Agc', true); await page.click('#s2Go'); await page.waitForTimeout(200);
    ok((await text(page, '#s2End')).includes('49.99') || (await text(page, '#s2End')).includes('50.00'), 'reduced: ch2 AGC end near 50: ' + await text(page, '#s2End'));
    await setCheck(page, 's2Agc', false);
    // ch3: July, automatic, ramp 1.5 → 66 minutes out; net, ramp 6 → none
    await show(page, '#opCv', 300); await setRadio(page, 'opDay', 'july'); await setCheck(page, 'opAuto', true); await setRange(page, 'opR', 1.5);
    await page.click('#opReset'); await page.click('#opRun'); await page.waitForTimeout(300);
    ok((await text(page, '#opOut')).includes('66'), 'reduced: ch3 July at 1.5 GW/h is out of band 66 min: ' + await text(page, '#opOut'));
    await setRadio(page, 'opDay', 'net'); await setRange(page, 'opR', 6); await page.click('#opReset'); await page.click('#opRun'); await page.waitForTimeout(300);
    ok(/^0\b/.test(await text(page, '#opOut')), 'reduced: ch3 net load at 6 GW/h stays in band: ' + await text(page, '#opOut'));
    await setRange(page, 'opR', 4); await page.click('#opReset'); await page.click('#opRun'); await page.waitForTimeout(300);
    ok((await text(page, '#opOut')).includes('150'), 'reduced: ch3 net load at 4 GW/h out 150 min: ' + await text(page, '#opOut'));
    // ch7 at default: 19 h, peaker sets 36.5
    await show(page, '#moCv', 300);
    ok((await text(page, '#moPrice')).includes('36.5'), 'ch7 default price 36.5: ' + await text(page, '#moPrice'));
    // ch8 default
    await show(page, '#dkCv', 300);
    ok((await text(page, '#dkSay')).includes('16.1'), 'ch8 default ramp 16.1: ' + await text(page, '#dkSay'));
    // ch9 default
    await show(page, '#stCv', 300);
    ok((await text(page, '#stPeak')).includes('15.8'), 'ch9 default peak 15.8: ' + await text(page, '#stPeak'));
    // ch10: ×1.2, lose A: UFLS sheds 216; without UFLS all dark
    await show(page, '#boCv', 300); await setRange(page, 'boL', 1.2); await setRadio(page, 'boEv', 'genA'); await setCheck(page, 'boU', true);
    await page.click('#boGo'); await page.waitForTimeout(300);
    ok((await text(page, '#boShed')).includes('216'), 'reduced: ch10 ×1.2 gen A sheds 216: ' + await text(page, '#boShed'));
    await setCheck(page, 'boU', false); await page.click('#boGo'); await page.waitForTimeout(300);
    ok((await text(page, '#boDark')).includes('2,160') || (await text(page, '#boDark')).includes('2160'), 'reduced: ch10 ×1.2 without UFLS all dark: ' + await text(page, '#boDark'));
    await setCheck(page, 'boU', true);

    // every slider to both ends (and each radio and checkbox), every sentence clean
    const sayIds = await page.$$eval('[id$=Say]', es => es.map(e => e.id));
    const check = async what => { for (const id of sayIds) { const s = await text(page, '#' + id); ok(s.length > 5 && !bad(s), `extremes ${what}: #${id} reads "${s.slice(0, 80)}"`); } };
    const ranges = await page.$$eval('input[type=range]', es => es.map(e => ({ id: e.id, min: e.min, max: e.max, v: e.value })));
    for (const r of ranges) {
      await show(page, '#' + r.id);
      for (const v of [r.min, r.max]) { await setRange(page, r.id, v); await page.waitForTimeout(60); await check(`${r.id}=${v}`); }
      await setRange(page, r.id, r.v);
    }
    const radios = await page.$$eval('input[type=radio]', es => es.map(e => [e.name, e.value]));
    for (const [n, v] of radios) { await setRadio(page, n, v); await page.waitForTimeout(60); await check(`${n}=${v}`); }
    for (const id of await page.$$eval('input[type=checkbox]', es => es.map(e => e.id))) for (const v of [true, false]) { await setCheck(page, id, v); await page.waitForTimeout(60); await check(`${id}=${v}`); }
    // the run buttons too, at the hardest settings
    await setRange(page, 's2P', 3000); await setRange(page, 's2Res', 250); await page.click('#s2Go'); await page.waitForTimeout(200); await check('ch2 worst');
    await setRange(page, 'opR', 1); await setRadio(page, 'opDay', 'net'); await setCheck(page, 'opAuto', false); await page.click('#opReset'); await page.click('#opRun'); await page.waitForTimeout(200); await check('ch3 manual worst');
    await setRange(page, 'boL', 1.3); await page.click('#boGo'); await page.waitForTimeout(200); await check('ch10 heaviest');
    await setRange(page, 'boL', 0.8); await setRadio(page, 'boEv', '6'); await page.click('#boGo'); await page.waitForTimeout(200); await check('ch10 lightest');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser test (${hasEn ? 'zh and en' : 'zh'} at 1280/390/320: overflow, clipped text, 48px targets, raw keys; language toggle, keyboard and focus, models driven, every sentence at control extremes, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
