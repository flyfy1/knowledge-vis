'use strict';
// Browser test for the how-vaccines-work essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18912 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node biology/body/how-vaccines-work/tests/browser.cjs
// Checks at 1280/390/320 in Chinese (and in English once copy.en.js exists): no console/page errors, no horizontal
// overflow, no text clipped in its box, every control at least 48×48 px, the toggle reads 中 | EN. Then: the language
// toggle (works with copy.en.js absent), keyboard operation of a slider and a radio group, each model driven once,
// every live sentence at the controls' extremes (right state, no unfilled placeholder, no NaN), reduced motion.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18912').replace(/\/$/, '');
const url = base + '/biology/body/how-vaccines-work/';
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
  // the console line for a missing copy.en.js has no URL; real 4xx responses are caught above
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
// no-break spaces (kept inside numbers such as 9.7 × 10⁷ so tiles never wrap mid-value) compare as plain spaces
const text = (page, sel) => page.$eval(sel, e => e.textContent.replace(/\u00a0/g, ' ').trim());
const key = (page, sel) => page.$eval(sel, e => e.dataset.key || '');
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const setRadio = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };

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
      for (const e of document.querySelectorAll('button, input, .toc a, a.back, main a')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (e.matches('main p a, main li a')) continue; // inline links in running text are exempt (WCAG 2.5.8 inline exception)
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    // every slider and button has an accessible name; every live sentence is polite
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('input[type=range], button')].filter(e => !(e.closest('label') && e.closest('label').textContent.trim()) && !e.textContent.trim() && !e.getAttribute('aria-label')).map(e => e.id));
    ok(!unnamed.length, `${tag}: controls without a name: ${unnamed.join(', ')}`);
    ok(await page.$$eval('.say', es => es.every(e => e.getAttribute('aria-live') === 'polite')), `${tag}: live sentences must be aria-live=polite`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle, keyboard, and each model driven once
  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')).length > 0, 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'lang attribute follows the text actually shown');
    if (hasEn) ok(!/[一-鿿]/.test(await text(page, 'h1')), 'EN toggle switches the title instantly');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => !e.textContent.trim() || /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no empty or raw-key text after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // keyboard: a slider moves with arrow keys, a radio group with arrow keys
    await show(page, '#raceCv', 200);
    await page.focus('#raceR'); await page.keyboard.press('ArrowLeft');
    ok(await page.$eval('#raceR', e => e.value) === '3', 'keyboard moves the ch1 slider');
    ok((await text(page, '#raceRo')).includes('6.7'), 'ch1 output follows the keyboard: ' + await text(page, '#raceRo'));
    await page.focus('input[name=dosePlan][value="2"]'); await page.keyboard.press('ArrowLeft');
    ok(await page.$eval('input[name=dosePlan][value="1"]', e => e.checked), 'keyboard moves the ch2 radio group');
    await setRadio(page, 'dosePlan', 2);
    ok(await page.evaluate(() => { const e = document.querySelector('#raceGo'); e.focus(); return getComputedStyle(e).outlineStyle !== 'none'; }), 'focus is visible on buttons');

    // ch1: runs to the end and reports
    await setRange(page, 'raceR', 4); await show(page, '#raceCv'); await page.waitForTimeout(8000);
    ok(await key(page, '#raceSay') === 'ch1.say.severe' && (await text(page, '#raceSay')).includes('9.7 × 10⁷'), 'ch1 default run ends severe at 9.7 × 10⁷: ' + await text(page, '#raceSay'));
    // ch2: two doses
    await show(page, '#doseCv'); await page.click('#doseGo'); await page.waitForTimeout(6000);
    ok(await key(page, '#doseSay') === 'ch2.say.two' && (await text(page, '#doseSay')).includes('6.9'), 'ch2 booster ratio 6.9: ' + await text(page, '#doseSay'));
    // ch3: default month 12
    await show(page, '#reCv'); await page.waitForTimeout(7800);
    ok(await key(page, '#reSay') === 'ch3.say.mild' && (await text(page, '#reSay')).includes('1/267'), 'ch3 default mild, 1/267: ' + await text(page, '#reSay'));
    // ch4: real trial
    await show(page, '#trCv'); ok(await text(page, '#trVe') === '95.0%', 'ch4 real trial 95.0%');
    await setRange(page, 'trN', 0); await setRange(page, 'trCP', 10); await setRange(page, 'trCV', 1);
    ok(await text(page, '#trCi') === '22.2% – 98.7%', 'ch4 small trial interval: ' + await text(page, '#trCi'));
    await page.click('#trReal'); ok((await text(page, '#trNo')).includes('18,198'), 'ch4 preset restores the trial');
    // ch5, ch6, ch7
    await show(page, '#brCv'); ok(await text(page, '#brShare') === '66%', 'ch5 default share 66%');
    await show(page, '#hdCv'); await page.waitForTimeout(9500);
    ok(await text(page, '#hdRiskU') === '57%' && await key(page, '#hdSay') === 'ch6.say.above', 'ch6 default 57%');
    await show(page, '#wnCv'); await page.waitForTimeout(6500);
    ok(await key(page, '#wnSay') === 'ch7.say.lapse' && (await text(page, '#wnSay')).includes('8.6'), 'ch7 default lapse at 8.6: ' + await text(page, '#wnSay'));
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // live sentences at the extremes (reduced motion: replays jump to the end)
  {
    const page = await open(browser, 1280, { reduce: true });
    const cases = [];
    const expect = async (label, sel, want, mustContain) => {
      const k = await key(page, sel), s = await text(page, sel);
      ok(k === want, `${label}: state ${k}, expected ${want}: ${s}`);
      ok(!/\{\w+\}|NaN|undefined|Infinity/.test(s), `${label}: unfilled or broken sentence: ${s}`);
      if (mustContain) ok(s.includes(mustContain), `${label}: sentence should contain "${mustContain}": ${s}`);
      cases.push(label);
    };
    await setRange(page, 'raceR', 0); await expect('ch1 slowest', '#raceSay', 'ch1.say.sick');
    await setRange(page, 'raceR', 8); await expect('ch1 fastest', '#raceSay', 'ch1.say.severe');
    await setRadio(page, 'dosePlan', 1); await expect('ch2 one dose', '#doseSay', 'ch2.say.one', '5.4');
    await setRadio(page, 'dosePlan', 2); await setRange(page, 'doseGap', 4); await expect('ch2 gap min', '#doseSay', 'ch2.say.two');
    await setRange(page, 'doseGap', 26); await expect('ch2 gap max', '#doseSay', 'ch2.say.lost');
    for (const [m, r, want] of [[1, 0, 'ch3.say.door'], [1, 8, 'ch3.say.door'], [24, 0, 'ch3.say.silent'], [24, 4, 'ch3.say.mild'], [24, 8, 'ch3.say.severe'], [3, 4, 'ch3.say.silent']]) {
      await setRange(page, 'reM', m); await setRange(page, 'reR', r); await expect(`ch3 month ${m} speed ${r}`, '#reSay', want);
    }
    for (const [n, cp, cv, want] of [[0, 0, 0, 'ch4.say.noplacebo'], [0, 0, 300, 'ch4.say.noplacebo'], [0, 300, 300, 'ch4.say.unsure'], [0, 5, 20, 'ch4.say.worse'], [7, 300, 0, 'ch4.say.zero'], [7, 1, 0, 'ch4.say.zerounsure'], [7, 300, 300, 'ch4.say.unsure'], [0, 300, 0, 'ch4.say.zero']]) {
      await setRange(page, 'trN', n); await setRange(page, 'trCP', cp); await setRange(page, 'trCV', cv); await expect(`ch4 n${n} ${cp}/${cv}`, '#trSay', want);
    }
    ok(!(await text(page, '#trCi')).includes('-'), 'ch4 negative numbers use a real minus sign');
    for (const [c, e, want, has] of [[0, 90, 'ch5.say.none'], [100, 90, 'ch5.say.all'], [100, 0, 'ch5.say.all'], [50, 0, 'ch5.say.useless'], [95, 99, 'ch5.say.few'], [99, 99, 'ch5.say.few', '49.7%'], [91, 90, 'ch5.say.most', '50.3%'], [1, 1, 'ch5.say.few']]) {
      await setRange(page, 'brC', c); await setRange(page, 'brE', e); await expect(`ch5 c${c} e${e}`, '#brSay', want, has);
    }
    for (const [r, e, c, want] of [[1, 50, 0, 'ch6.say.nospread'], [1, 100, 100, 'ch6.say.nospread'], [20, 50, 100, 'ch6.say.unreach'], [20, 100, 100, 'ch6.say.below'], [20, 50, 0, 'ch6.say.unreach'], [4, 90, 0, 'ch6.say.above'], [4, 90, 84, 'ch6.say.below'], [2, 50, 100, 'ch6.say.below'], [2, 50, 99, 'ch6.say.above']]) {
      await setRange(page, 'hdR', r); await setRange(page, 'hdE', e); await setRange(page, 'hdC', c); await expect(`ch6 R0 ${r} E ${e} c ${c}`, '#hdSay', want);
    }
    for (const [h, c, b, want] of [[6, 50, 0, 'ch7.say.never'], [60, 100, 0, 'ch7.say.lapse'], [60, 100, 24, 'ch7.say.kept'], [6, 100, 6, 'ch7.say.gaps'], [60, 50, 6, 'ch7.say.never'], [6, 71, 24, 'ch7.say.gaps']]) {
      await setRange(page, 'wnH', h); await setRange(page, 'wnC', c); await setRadio(page, 'wnB', b); await expect(`ch7 H ${h} c ${c} B ${b}`, '#wnSay', want);
    }
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    ok(!page.__errors().length, 'extremes: errors: ' + page.__errors().join(' | '));
    await page.close();
    console.log(`  live-sentence states checked: ${cases.length}`);
  }

  // English live sentences and readouts (reduced motion): the same states, plus grammar the copy alone cannot guarantee
  if (hasEn) {
    const page = await open(browser, 1280, { reduce: true, lang: 'en' });
    const CJKg = /[　-〿㐀-鿿＀-￯]/;
    let n = 0;
    const look = async (label, sel, want) => {
      const k = await key(page, sel), s = await text(page, sel); n++;
      if (want) ok(k === want, `en ${label}: state ${k}, expected ${want}: ${s}`);
      ok(!/\{\w+\}|NaN|undefined|Infinity/.test(s) && !CJKg.test(s), `en ${label}: broken or untranslated sentence: ${s}`);
      ok(!/(^|[^\d.,])1 (people|months|days|cases)\b/.test(s), `en ${label}: plural after 1: ${s}`);
    };
    const tiles = async label => { const all = await page.$$eval('.read b, .ctl output', es => es.map(e => e.textContent.replace(/ /g, ' ')));
      ok(!all.some(s => /(^|[^\d.,])1 (people|months)\b/.test(s) || CJKg.test(s)), `en ${label}: readouts: ${all.filter(s => /(^|[^\d.,])1 (people|months)\b/.test(s) || CJKg.test(s)).join(' | ')}`); };
    await look('ch4 default', '#trSay', 'ch4.say.ok'); ok((await text(page, '#trSay')).includes('89.9% to 97.6%'), 'en ch4 default interval');
    await setRange(page, 'reM', 1); await look('ch3 month 1', '#reSay', 'ch3.say.door'); ok(await text(page, '#reMo') === '1 month', 'en ch3 output says "1 month": ' + await text(page, '#reMo'));
    await setRange(page, 'reM', 24); await setRange(page, 'reR', 4); await look('ch3 month 24', '#reSay', 'ch3.say.mild');
    await setRange(page, 'trN', 7); await setRange(page, 'trCP', 300); await setRange(page, 'trCV', 0); await look('ch4 zero', '#trSay', 'ch4.say.zero');
    await setRange(page, 'trN', 0); await setRange(page, 'trCP', 1); await setRange(page, 'trCV', 0); await look('ch4 zero unsure', '#trSay', 'ch4.say.zerounsure');
    await setRange(page, 'brC', 1); await setRange(page, 'brE', 99); await look('ch5 one vaccinated case', '#brSay', 'ch5.say.few'); await tiles('ch5 c1 e99');
    ok(await text(page, '#brNV') === '1 person', 'en ch5 tile says "1 person": ' + await text(page, '#brNV'));
    await setRange(page, 'brC', 0); await look('ch5 none', '#brSay', 'ch5.say.none');
    await setRange(page, 'brC', 100); await look('ch5 all', '#brSay', 'ch5.say.all');
    await setRange(page, 'hdR', 20); await setRange(page, 'hdE', 50); await setRange(page, 'hdC', 60); await look('ch6 unreachable', '#hdSay', 'ch6.say.unreach');
    await setRange(page, 'hdR', 4); await setRange(page, 'hdE', 90); await setRange(page, 'hdC', 90); await look('ch6 below', '#hdSay', 'ch6.say.below');
    await setRange(page, 'wnH', 6); await setRange(page, 'wnC', 100); await setRadio(page, 'wnB', 6); await look('ch7 gaps', '#wnSay', 'ch7.say.gaps');
    await setRange(page, 'wnC', 50); await look('ch7 never', '#wnSay', 'ch7.say.never'); await tiles('ch7');
    ok(!page.__errors().length, 'en sentences: errors: ' + page.__errors().join(' | '));
    await page.close();
    console.log(`  English live-sentence states checked: ${n}`);
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser test (${hasEn ? 'zh and en' : 'zh'} at 1280/390/320: overflow, clipped text, 48px targets, names, aria-live; language toggle${hasEn ? '' : ' without copy.en.js'}, keyboard, all seven models, live sentences at the extremes, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
