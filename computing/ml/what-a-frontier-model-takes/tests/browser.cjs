'use strict';
// Browser test for the what-a-frontier-model-takes essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:19008 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/ml/what-a-frontier-model-takes/tests/browser.cjs
// At 1280/390/320 in Chinese (and English once copy.en.js exists): no console/page errors, no horizontal overflow,
// no clipped text, every control at least 48×48 px, the toggle reads 中 | EN, in English no CJK anywhere
// (text, aria-labels, title, canvas). Then: the weights load lazily (not before the reader nears the first
// model), the toggle works without copy.en.js, every control of every model is driven to its extremes and each
// live sentence is read (no unfilled {placeholder}, NaN, undefined, raw key), the page's numbers at the default
// settings match the prose, and reduced motion jumps instead of animating.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:19008').replace(/\/$/, '');
const url = base + '/computing/ml/what-a-frontier-model-takes/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [], requests = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => requests.push(r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  page.__requests = requests;
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const radio = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name="${n}"][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); }, [name, v]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const bad = s => /\{\w+\}|NaN|undefined|null|Infinity|(^|\s)ch\d+\.\w+/.test(s);

(async () => {
  const browser = await chromium.launch();
  const hasEn = await (async () => { const p = await browser.newPage(); const r = await p.goto(url + 'copy.en.js'); const st = r.status(); await p.close(); return st < 400; })();

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    if (width === 1280 && lang === 'zh') ok(!page.__requests.some(u => /weights\.js/.test(u)), 'weights.js is not requested at the top of the page');
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    await page.waitForFunction(() => !!window.TINY_TF, null, { timeout: 15000 });
    await page.waitForTimeout(300);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.className || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    // range rows: label, slider and value must not overlap one another
    const overlaps = await page.evaluate(() => {
      const out = [];
      for (const l of document.querySelectorAll('label.rng')) {
        const parts = [...l.children].map(e => e.getBoundingClientRect());
        for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) { const a = parts[i], b = parts[j]; if (a.width && b.width && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push(l.querySelector('input').id); }
      }
      // neighbouring range labels in one row must not overlap
      const ls = [...document.querySelectorAll('label.rng')].map(l => [l.querySelector('input').id, l.getBoundingClientRect()]);
      for (let i = 0; i < ls.length; i++) for (let j = i + 1; j < ls.length; j++) { const a = ls[i][1], b = ls[j][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push(ls[i][0] + '/' + ls[j][0]); }
      for (const l of document.querySelectorAll('label.rng')) if (l.scrollWidth > l.clientWidth + 1) out.push(l.querySelector('input').id + ' overflows');
      return [...new Set(out)];
    });
    ok(!overlaps.length, `${tag}: overlapping control parts: ${overlaps.join(', ')}`);
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
      const boxOf = e => (e.matches('input[type=radio], input[type=checkbox]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, select, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *, body > section *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const unfilled = await page.evaluate(() => (document.body.innerText.match(/\{\w+\}|NaN|undefined/g) || []).slice(0, 3));
    ok(!unfilled.length, `${tag}: unfilled placeholders ${unfilled.join(' ')}`);
    const rawKeys = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^[a-z0-9]+(\.[\w]+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!rawKeys.length, `${tag}: raw copy keys on the page: ${rawKeys.join(' ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle (copy.en.js may be absent), then every model
  {
    const page = await open(browser, 1280);
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    if (!hasEn) ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js the page stays in Chinese');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    await page.evaluate(() => window.__essay.loadTiny()); await page.waitForFunction(() => !!window.TINY_TF, null, { timeout: 15000 }); await page.waitForTimeout(200);
    const sayOk = async (sel, what) => { const s = await text(page, sel); ok(s.length > 8 && !bad(s), `${what}: ${sel} reads "${s}"`); return s; };
    const read = sel => text(page, sel);

    // ch1: defaults, every position, odd input
    await show(page, '#tfCv', 200);
    ok((await read('#tfPred')).includes('「o」99.9%'), 'ch1 default predicts o 99.9%: ' + await read('#tfPred'));
    ok((await read('#tfSay')).includes('85%'), 'ch1 default sentence has 85%: ' + await read('#tfSay'));
    for (let i = 0; i < 24; i++) { await setRange(page, 'tfPos', i); await sayOk('#tfSay', 'ch1 pos ' + i); }
    for (const s of ['hello', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'ab', 'Z9!', '', 'abcabcabcabcabcabcabcabc']) {
      await page.fill('#tfIn', s); await setRange(page, 'tfPos', 23); await sayOk('#tfSay', `ch1 input "${s}"`); await setRange(page, 'tfPos', 0); await sayOk('#tfSay', `ch1 input "${s}" pos 0`);
    }
    await page.fill('#tfIn', 'tokenstokenstokenstokens'); await setRange(page, 'tfPos', 12);

    // ch2
    await show(page, '#dpCv');
    ok((await read('#dpSay')).includes('7.3×10⁻⁶') && (await read('#dpSay')).includes('5.4'), 'ch2 default sentence matches the prose: ' + await read('#dpSay'));
    for (const L of [2, 48, 100]) for (const g of [0.5, 0.8, 1, 1.2, 1.5]) { await setRange(page, 'dpL', L); await setRange(page, 'dpG', g); await sayOk('#dpSay', `ch2 L=${L} g=${g}`); }
    await setRange(page, 'dpL', 48); await setRange(page, 'dpG', 0.8);

    // ch3
    await show(page, '#ctCv');
    ok((await read('#ctF')).includes('160.5 GFLOP') && (await read('#ctShare')) === '13.4%', 'ch3 default readouts');
    for (const m of ['tiny', 'gpt3', 'llama8', 'llama70', 'llama405']) for (const T of [0, 1, 2, 3]) { await radio(page, 'ctM', m); await setRange(page, 'ctT', T); await sayOk('#ctSay', `ch3 ${m} T=${T}`); }
    await radio(page, 'ctM', 'llama70'); await setRange(page, 'ctT', 3); ok((await read('#ctShare')) === '71.2%', 'ch3 131k attention share 71.2%');
    await radio(page, 'ctM', 'gpt3'); ok((await read('#ctN')).replace(/,/g, '').includes('174604259328') || (await read('#ctN')).includes('1,746'), 'ch3 GPT-3 count: ' + await read('#ctN'));
    await radio(page, 'ctM', 'llama70'); await setRange(page, 'ctT', 1);

    // ch4: the training record, then play
    await show(page, '#trCv');
    for (const s of [0, 50, 200, 250, 300, 350, 400, 1000, 3000]) { await setRange(page, 'trS', s); await sayOk('#trSay', 'ch4 step ' + s); }
    await setRange(page, 'trS', 3000); ok((await read('#trLoss')) === '0.957' && (await read('#trPpl')) === '2.60', 'ch4 final loss 0.957, perplexity 2.60: ' + await read('#trLoss') + ' ' + await read('#trPpl'));
    await setRange(page, 'trS', 250); ok((await read('#trAcc')) === '45.0%' && (await read('#trInd')) === '0.39', 'ch4 step 250 readouts');
    await setRange(page, 'trS', 0); await page.click('#trPlay'); await page.waitForTimeout(1500);
    ok(+(await page.$eval('#trS', e => e.value)) > 0, 'ch4 play advances the step'); await page.click('#trPlay').catch(() => {});

    // ch5
    await show(page, '#slCv');
    ok((await read('#slSay')).includes('0.017'), 'ch5 default gap 0.017: ' + await read('#slSay'));
    for (const fit of ['epoch', 'hoffmann']) for (const C of [20, 23.5, 27]) for (const N of [8, 10, 11.25, 13]) { await radio(page, 'slFit', fit); await setRange(page, 'slC', C); await setRange(page, 'slN', N); await sayOk('#slSay', `ch5 ${fit} C=${C} N=${N}`); }
    await radio(page, 'slFit', 'epoch'); await setRange(page, 'slC', 23.5); await page.click('#slGpt3'); ok((await read('#slSay')).length > 8, 'ch5 optimum button'); await sayOk('#slSay', 'ch5 at optimum');
    await setRange(page, 'slN', 11.25);

    // ch6
    await show(page, '#blCv');
    ok((await read('#blD')) === '66 天', 'ch6 default 66 days: ' + await read('#blD'));
    for (const run of ['gpt3', 'llama405', 'dsv3', 'ch5']) for (const hw of ['a100', 'h100', 'gb200']) for (const [m, g] of [[0.2, 8], [0.41, 14], [0.6, 18]]) {
      await radio(page, 'blRun', run); await radio(page, 'blHw', hw); await setRange(page, 'blMfu', m); await setRange(page, 'blG', g); await sayOk('#blSay', `ch6 ${run} ${hw} mfu ${m} gpus 2^${g}`);
    }
    for (const id of ['blP', 'blW']) { const [mn, mx] = await page.$eval('#' + id, e => [e.min, e.max]); for (const v of [mn, mx]) { await setRange(page, id, v); await sayOk('#blSay', `ch6 ${id}=${v}`); } }
    await radio(page, 'blRun', 'llama405'); await radio(page, 'blHw', 'h100'); await setRange(page, 'blMfu', 0.41); await setRange(page, 'blG', 14); await setRange(page, 'blP', 2.5); await setRange(page, 'blW', 700);

    // ch7: LoRA and the benchmark
    await show(page, '#loSay');
    for (const m of ['gpt3', 'llama8', 'llama70', 'llama405']) for (const tg of ['qv', 'attn', 'all']) for (const r of [0, 2, 8]) { await radio(page, 'loM', m); await radio(page, 'loT', tg); await setRange(page, 'loR', r); await sayOk('#loSay', `ch7 ${m} ${tg} r=2^${r}`); }
    await radio(page, 'loM', 'gpt3'); await radio(page, 'loT', 'qv'); await setRange(page, 'loR', 2); ok((await read('#loSay')).includes('1,887 万个参数') && (await read('#loSay')).includes('1/9,251'), 'ch7 default LoRA count: ' + await read('#loSay'));
    await show(page, '#bnCv');
    ok((await read('#bnCi')).includes('±3.5') && (await read('#bnRev')) === '22%', 'ch7 default bench readouts: ' + await read('#bnCi') + ' ' + await read('#bnRev'));
    for (const [nI, gap, c, e] of [[0, 0, 0, 0], [6, 6, 0, 0], [2, 2, 20, 0], [2, 2, 0, 10], [0, 6, 20, 10], [6, 0, 0, 10]]) {
      await setRange(page, 'bnN', nI); await setRange(page, 'bnGap', gap); await setRange(page, 'bnC', c); await setRange(page, 'bnE', e); await sayOk('#bnSay', `ch7 bench n${nI} gap${gap} c${c} e${e}`);
    }
    await page.click('#bnGo'); await sayOk('#bnSay', 'ch7 redraw');
    await setRange(page, 'bnN', 2); await setRange(page, 'bnGap', 2); await setRange(page, 'bnC', 0); await setRange(page, 'bnE', 0);

    // ch8: cache demo and big-model cache
    await show(page, '#kvCv', 300);
    ok((await read('#kvSay')).includes('7,569,600') && (await read('#kvSay')).includes('648,192'), 'ch8 default operation counts: ' + await read('#kvSay'));
    for (let k = 3; k <= 12; k++) { await setRange(page, 'kvP', k); const s = await sayOk('#kvSay', 'ch8 prompt ' + k); ok(!s.includes('不该发生'), `ch8 cached and uncached differ at prompt ${k}`); }
    await setRange(page, 'kvP', 6);
    await show(page, '#kmCv');
    for (const m of ['llama8', 'llama70', 'llama405']) for (const T of [10, 17, 20]) for (const B of [0, 8]) for (const gqa of [true, false]) {
      await radio(page, 'kmM', m); await setRange(page, 'kmT', T); await setRange(page, 'kmB', B);
      await page.evaluate(v => { const e = document.getElementById('kmGqa'); if (e.checked !== v) e.click(); }, gqa); await sayOk('#kmSay', `ch8 ${m} T=2^${T} B=2^${B} gqa=${gqa}`);
    }
    await radio(page, 'kmM', 'llama70'); await setRange(page, 'kmT', 17); await setRange(page, 'kmB', 0); await page.evaluate(() => { const e = document.getElementById('kmGqa'); if (!e.checked) e.click(); });
    ok((await read('#kmAll')) === '42.9 GB', 'ch8 default cache 42.9 GB');

    // ch9: roofline and quantisation
    await show(page, '#svCv');
    ok((await read('#svSay')).includes('59.0') && (await read('#svSay')).includes('1.47'), 'ch9 default serving: ' + await read('#svSay'));
    for (const m of ['llama8', 'llama70', 'llama405']) for (const hw of ['h100', 'gb200']) for (const bits of ['16', '4']) for (const [b, t, g] of [[0, 9, 0], [9, 17, 4], [5, 13, 2], [9, 9, 0]]) {
      await radio(page, 'svM', m); await radio(page, 'svHw', hw); await radio(page, 'svBits', bits); await setRange(page, 'svB', b); await setRange(page, 'svT', t); await setRange(page, 'svG', g);
      await sayOk('#svSay', `ch9 ${m} ${hw} ${bits}b B=2^${b} T=2^${t} G=2^${g}`);
    }
    for (const p of [1, 8]) { await setRange(page, 'svP', p); await sayOk('#svSay', 'ch9 price ' + p); }
    await radio(page, 'svM', 'llama70'); await radio(page, 'svHw', 'h100'); await radio(page, 'svBits', '16'); await setRange(page, 'svB', 5); await setRange(page, 'svT', 13); await setRange(page, 'svG', 2); await setRange(page, 'svP', 2.5);
    await show(page, '#qzCv');
    for (const b of ['32', '8', '4', '3', '2']) { await radio(page, 'qzB', b); await page.waitForTimeout(100); await sayOk('#qzSay', 'ch9 quantise ' + b); }
    ok((await read('#qzAcc')) === '15.5%', 'ch9 2-bit accuracy 15.5%: ' + await read('#qzAcc'));
    await radio(page, 'qzB', '4'); ok((await read('#qzLoss')) === '0.991', 'ch9 4-bit loss 0.991');

    // ch10: MoE and speculative decoding
    await show(page, '#moCv');
    ok((await read('#moSay')).includes('45.6%'), 'ch10 default drop 45.6%: ' + await read('#moSay'));
    for (const E of ['8', '16', '64']) for (const [k, cf, sk] of [[1, 1, 0], [4, 2, 2], [2, 1.25, 1], [4, 1, 2]]) { await radio(page, 'moE', E); await setRange(page, 'moK', k); await setRange(page, 'moCf', cf); await setRange(page, 'moSk', sk); await sayOk('#moSay', `ch10 E${E} k${k} cf${cf} skew${sk}`); }
    await radio(page, 'moE', '16'); await setRange(page, 'moK', 2); await setRange(page, 'moCf', 1.25); await setRange(page, 'moSk', 1);
    await page.click('#moGo'); await page.waitForTimeout(2500); await page.click('#moGo').catch(() => {});
    ok(+(await read('#moSteps')).replace(/,/g, '') > 0, 'ch10 balancing runs'); await sayOk('#moSay', 'ch10 after balancing');
    await page.click('#moReset'); ok((await read('#moSteps')) === '0', 'ch10 reset');
    await show(page, '#spCv');
    ok((await read('#spSay')).includes('3.36') && (await read('#spSay')).includes('2.80') && (await read('#spSay')).includes('3.09'), 'ch10 default speculative: ' + await read('#spSay'));
    for (const [a, g, c] of [[0.3, 1, 0], [0.95, 12, 0], [0.3, 12, 0.5], [0.95, 1, 0.5], [0.8, 4, 0.05]]) { await setRange(page, 'spA', a); await setRange(page, 'spG', g); await setRange(page, 'spC', c); await sayOk('#spSay', `ch10 spec a${a} g${g} c${c}`); }

    // ch11: ablation, every subset
    await show(page, '#abCv', 200);
    const boxes = ['ab00', 'ab01', 'ab10', 'ab11'];
    for (let mask = 0; mask < 16; mask++) {
      await page.evaluate(([bs, mask]) => bs.forEach((id, i) => { const e = document.getElementById(id); if (e.checked !== !!(mask & (1 << i))) e.click(); }), [boxes, mask]);
      await page.waitForTimeout(30); await sayOk('#abSay', 'ch11 mask ' + mask);
    }
    await page.evaluate(bs => bs.forEach(id => { const e = document.getElementById(id); if (e.checked) e.click(); }), boxes);
    await page.click('#ab11'); ok((await read('#abAcc')) === '0.6%', 'ch11 without head 1.1: 0.6%: ' + await read('#abAcc')); await page.click('#ab11');
    await page.click('#ab01'); ok((await read('#abAcc')) === '16.6%', 'ch11 without head 0.1: 16.6%'); await page.click('#ab01');
    for (const h of ['0.0', '0.1', '1.0', '1.1']) { await radio(page, 'abShow', h); await sayOk('#abSay', 'ch11 show ' + h); }

    // ch12: every point in every set
    await show(page, '#frCv');
    for (const set of ['all', 'records', 'known']) {
      await radio(page, 'frSet', set); const mx = +(await page.$eval('#frPick', e => e.max));
      for (let i = 0; i <= mx; i++) { await setRange(page, 'frPick', i); await sayOk('#frSay', `ch12 ${set} ${i}`); const nm = await read('#frName'); ok(nm.length > 1 && !bad(nm), `ch12 name ${set} ${i}: ${nm}`); }
      const g = await read('#frSay');
      if (set === 'records') ok(g.includes('4.4'), 'ch12 records trend 4.4: ' + g);
      if (set === 'known') ok(g.includes('2.0'), 'ch12 verifiable trend 2.0: ' + g);
    }
    const facts = await page.$$eval('.facts li', ls => ls.map(l => l.textContent));
    ok(facts.length >= 8 && facts.every(f => !/\{\w+\}/.test(f)) && facts.some(f => f.includes('25 次')), 'ch12 facts filled in: ' + facts.length);
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: play jumps to the end, balancing jumps, no smooth scrolling
  {
    const page = await open(browser, 390, { reduce: true });
    await page.evaluate(() => window.__essay.loadTiny()); await page.waitForFunction(() => !!window.TINY_TF, null, { timeout: 15000 });
    await show(page, '#trCv', 200); await setRange(page, 'trS', 0); await page.click('#trPlay'); await page.waitForTimeout(200);
    ok(+(await page.$eval('#trS', e => e.value)) === 3000, 'reduced motion: play jumps to step 3000');
    await show(page, '#moCv', 200); await page.click('#moGo'); await page.waitForTimeout(200);
    ok(+(await text(page, '#moSteps')).replace(/,/g, '') >= 200, 'reduced motion: balancing jumps ahead');
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) !== 'smooth', 'reduced motion: no smooth scroll');
    ok(!page.__errors().length, 'reduce: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); console.error(`${fails.length} failure(s)`); process.exit(1); }
  console.log('browser: all checks passed (zh at 1280/390/320' + (hasEn ? ', en' : '') + '; every model driven; reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
