'use strict';
// Browser smoke test for the how-a-chatbot-writes essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18962 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/ml/how-a-chatbot-writes/tests/browser.cjs
// Checks at 1280/390/320 in Chinese (and in English when copy.en.js exists): no console/page errors, no horizontal
// overflow, no text clipped in its own box, every control at least 48×48 px, the toggle reads 中 | EN; in English no
// CJK visible anywhere (text, aria-labels, title, canvas). Then the language toggle without copy.en.js, every
// control of every model driven to its extremes with each live sentence read (no unfilled {placeholder}, NaN or
// undefined), the training loop, and reduced motion.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18962').replace(/\/$/, '');
const url = base + '/computing/ml/how-a-chatbot-writes/';
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
const bad = s => /\{\w+\}|NaN|undefined|null/.test(s);

(async () => {
  const browser = await chromium.launch();
  const hasEn = await (async () => { const p = await browser.newPage(); const r = await p.goto(url + 'copy.en.js'); const st = r.status(); await p.close(); return st < 400; })();

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.scale *')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.className || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
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
      const boxOf = e => (e.matches('input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, select, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { if (e.closest('.tablewrap') || e.closest('[style*="overflow-x"]')) return false; const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const unfilled = await page.evaluate(() => (document.body.innerText.match(/\{\w+\}/g) || []).slice(0, 3));
    ok(!unfilled.length, `${tag}: unfilled placeholders ${unfilled.join(' ')}`);
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
    if (hasEn) ok(!/[一-鿿]/.test(await text(page, 'h1')), 'EN title is English');
    else ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js the page stays in Chinese');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    const sayOk = async (sel, what) => { const s = await text(page, sel); ok(s.length > 8 && !bad(s), `${what}: ${sel} reads "${s}"`); return s; };

    // ch1: every merge count from 0 to the end, and a sentence with a character the corpus never saw
    await show(page, '#tkCv', 300);
    const maxM = +(await page.$eval('#tkM', e => e.max));
    for (const m of [0, 1, 30, 63, 64, maxM]) { await setRange(page, 'tkM', m); await sayOk('#tkSay', 'ch1 m=' + m); }
    await setRange(page, 'tkM', 0); ok((await text(page, '#tkSay')).includes('还没有合并'), 'ch1 m=0 sentence');
    await setRange(page, 'tkM', maxM); ok((await text(page, '#tkSay')).includes('后面各章用的是第 63 次'), 'ch1 late sentence names the stop');
    await page.fill('#tkIn', '熊猫吃竹子'); await sayOk('#tkSay', 'ch1 unknown'); ok((await page.$$('#tkToks .unk')).length > 0, 'ch1 unknown characters are marked');
    await page.fill('#tkIn', ''); await sayOk('#tkSay', 'ch1 empty input'); ok(await text(page, '#tkMine') === '0', 'ch1 empty input has 0 tokens');

    // ch2: every context; generating a sentence
    await show(page, '#bgBars');
    for (const r of await page.$$('input[name=bgCtx]')) { await r.check({ force: true }); await sayOk('#bgSay', 'ch2 context'); }
    await page.click('#bgGen'); ok((await page.$$('#bgOut .t')).length > 0, 'ch2 writes a sentence');

    // ch3: each context length
    await show(page, '#ngCv', 300);
    for (const id of ['ngO', 'lpO']) ok(await page.$eval('#' + id, e => +e.min === 0 && +e.max === 3), `${id} runs over context lengths 0..3 (the n-gram table holds 4 orders)`);
    for (const v of [0, 1, 2, 3]) { await setRange(page, 'ngO', v); const s = await sayOk('#ngSay', 'ch3 context ' + v); ok((await page.$$('#ngOut li')).length === 3, 'ch3 three sentences at ' + v); if (v === 0) ok(s.includes('总频率'), 'ch3 zero sentence'); if (v === 3) ok(s.includes('背书'), 'ch3 far sentence at 3 tokens'); }

    // ch4: dimension extremes, every word
    await show(page, '#vcCv', 300);
    for (const k of [1, 2, 8, 24]) { await setRange(page, 'vcK', k); await sayOk('#vcSay', 'ch4 k=' + k); }
    const nWords = await page.$$eval('#vcWord option', o => o.length);
    for (let i = 0; i < nWords; i++) { await page.selectOption('#vcWord', String(i)); await sayOk('#vcSay', 'ch4 word ' + i); }
    await setRange(page, 'vcK', 8); await page.selectOption('#vcWord', '0');
    ok((await text(page, '#vcNb')) === '小狗', 'ch4 default nearest to 小猫 is 小狗');
    // click on the canvas picks a word
    const box = await page.$eval('#vcCv', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await page.mouse.click(box.x + box.w * 0.5, box.y + box.h * 0.5);

    // ch5: every slot at slope 0, 1 and 2
    await show(page, '#atSlots');
    for (const s of [0, 1, 2]) { await setRange(page, 'atSlope', s); for (let i = 0; i < 9; i++) { await page.click(`#atSlots button[data-i="${i}"]`); await sayOk('#atSay', `ch5 slot ${i} slope ${s}`); } }
    await setRange(page, 'atSlope', 0); await page.click('#atSlots button[data-i="6"]');
    ok((await text(page, '#atTop')) === '苹果' && (await text(page, '#atW')) === '93%', 'ch5 default: 它 → 苹果 93%');

    // ch6: temperature, k and p extremes, alone and together, for every context
    await show(page, '#smBars');
    for (const r of await page.$$('input[name=smCtx]')) {
      await r.check({ force: true });
      for (const [T, k, p] of [[0, 0, 1], [0.05, 0, 1], [0.5, 0, 1], [1, 0, 1], [2, 0, 1], [1, 1, 1], [1, 3, 1], [1, 10, 1], [1, 0, 0.05], [1, 0, 0.5], [2, 1, 0.05], [0, 10, 0.05]]) {
        await setRange(page, 'smT', T); await setRange(page, 'smK', k); await setRange(page, 'smP', p);
        await sayOk('#smSay', `ch6 T=${T} k=${k} p=${p}`);
      }
    }
    await setRange(page, 'smT', 0); ok((await text(page, '#smDist')).startsWith('1 '), 'ch6 greedy writes one sentence');
    await setRange(page, 'smT', 1); await setRange(page, 'smK', 0); await setRange(page, 'smP', 1);
    await page.click('#smGen'); ok((await page.$$('#smOut li')).length === 5, 'ch6 writes five sentences');

    // ch7: training lowers the loss; learning rate 50 diverges; d = 2
    await show(page, '#trCv', 300);
    await sayOk('#trSay', 'ch7 start');
    const l0 = parseFloat(await text(page, '#trLoss'));
    await page.click('#trGo'); await page.waitForTimeout(3000);
    const l1 = parseFloat(await text(page, '#trLoss'));
    ok(l1 < l0 - 0.5, `ch7 loss falls while training (${l0} → ${l1})`); await sayOk('#trSay', 'ch7 going');
    await page.click('#trGo');
    await setRange(page, 'trLr', 6); await page.click('#trReset'); await page.click('#trGo'); await page.waitForTimeout(3000);
    ok((await text(page, '#trSay')).includes('太大'), 'ch7 learning rate 50 diverges: ' + await text(page, '#trSay'));
    await setRange(page, 'trLr', 3); await page.click('input[name=trD][value="2"]', { force: true }); await page.click('#trGo'); await page.waitForTimeout(1500);
    await sayOk('#trSay', 'ch7 d=2'); await page.click('#trGo');
    await setRange(page, 'trLr', 0); await sayOk('#trSay', 'ch7 lr 0.5');

    // ch8: step by step, finish, extremes of order and temperature
    await show(page, '#lpOut');
    await sayOk('#lpSay', 'ch8 start');
    for (const o of [0, 1, 2, 3]) for (const T of [0, 1, 2]) {
      await page.click('#lpReset'); await setRange(page, 'lpO', o); await setRange(page, 'lpT', T);
      await page.click('#lpStep'); await sayOk('#lpSay', `ch8 step o=${o} T=${T}`);
      await page.click('#lpFinish'); await sayOk('#lpSay', `ch8 finish o=${o} T=${T}`);
    }
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: the training button steps 200 at a time; no smooth scroll
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#trCv', 300);
    ok((await text(page, '#trGo')) === '训练 200 步', 'reduced motion: the button trains a fixed number of steps');
    await page.click('#trGo'); ok((await text(page, '#trStep')) === '200', 'reduced motion: 200 steps at once');
    await page.waitForTimeout(800); ok((await text(page, '#trStep')) === '200', 'reduced motion: nothing runs by itself');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${hasEn ? 'zh and en' : 'zh; copy.en.js absent'} at 1280/390/320: overflow, clipped text, 48px targets; toggle, every control of all eight models at its extremes, training, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
