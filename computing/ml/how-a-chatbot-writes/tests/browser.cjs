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
const SHOT = process.env.SHOT_DIR || '';   // set to a scratch directory to save a screenshot of every diagram

// every static diagram (STANDARD §4a): role, aria, caption, labels non-empty, inside the viewBox, no two labels
// overlapping, ≥ 11 px rendered (after how-sata-works/tests/browser.cjs)
function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg) { out.push(name + ': no svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(name + ': role');
    const al = svg.getAttribute('aria-label') || '';
    if (al.length < 8 || /^dg\./.test(al)) out.push(name + ': aria-label "' + al + '"');
    const cap = fig.querySelector('figcaption'); if (!cap || cap.textContent.trim().length < 8 || /\{\w+\}/.test(cap.textContent)) out.push(name + ': caption');
    const vb = svg.viewBox.baseVal, k = svg.getBoundingClientRect().width / vb.width;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      const s = t.textContent.trim();
      if (!s || /^(dg|ch\d+)\./.test(s) || /\{\w+\}|NaN|undefined/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
      const b = t.getBBox(), fs = parseFloat(t.getAttribute('font-size')) * k;
      if (fs < 11) out.push(`${name}: "${s.slice(0, 12)}" renders at ${fs.toFixed(1)}px`);
      if (b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5) out.push(`${name}: "${s.slice(0, 14)}" outside the drawing`);
      boxes.push([s, b]);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [s1, a] = boxes[i], [s2, b] = boxes[j], pad = 1;
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ix > pad && iy > pad) out.push(`${name}: "${s1.slice(0, 12)}" overlaps "${s2.slice(0, 12)}"`);
    }
  }
  return out;
}

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
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia svg', s => s.length) >= 6, `${tag}: at least six diagrams`);
    if (SHOT) for (const fig of await page.$$('figure.dia')) {
      const id = await fig.evaluate(e => e.dataset.dg);
      await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120);
      await fig.screenshot({ path: `${SHOT}/${lang}-${width}-dg-${id}.png` });
    }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.scale *')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.className || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    // the ch5 token buttons: each word on one line (English words used to break as "bough t", "becau se" at 320)
    const broken = await page.$$eval('#atSlots span.w', ws => ws.filter(w => w.getBoundingClientRect().height > 1.5 * parseFloat(getComputedStyle(w).lineHeight)).map(w => w.textContent));
    ok(!broken.length, `${tag}: ch5 token buttons break a word: ${broken.join(', ')}`);
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

  // language toggle (copy.en.js may be absent), then every model, in each language (English added at review,
  // 2026-11-18: the English page trains on its own corpus, so its live sentences differ)
  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) {
    const page = await open(browser, 1280, { lang });
    const zh = lang === 'zh', L = s => lang + ' ' + s;
    if (zh) {
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    if (hasEn) ok(!/[一-鿿]/.test(await text(page, 'h1')), 'EN title is English');
    else ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js the page stays in Chinese');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    }
    const sayOk = async (sel, what) => { const s = await text(page, sel); ok(s.length > 8 && !bad(s) && !(lang === 'en' && /[一-鿿]/.test(s)) && !/\(s\)/.test(s), `${L(what)}: ${sel} reads "${s}"`); return s; };

    // ch1: every merge count from 0 to the end, and a sentence with a character the corpus never saw
    await show(page, '#tkCv', 300);
    const maxM = +(await page.$eval('#tkM', e => e.max));
    for (const m of [0, 1, 30, 63, 64, maxM]) { await setRange(page, 'tkM', m); await sayOk('#tkSay', 'ch1 m=' + m); }
    if (zh) {
    await setRange(page, 'tkM', 0); ok((await text(page, '#tkSay')).includes('还没有合并'), 'ch1 m=0 sentence');
    await setRange(page, 'tkM', maxM); ok((await text(page, '#tkSay')).includes('后面各章用的是第 63 次'), 'ch1 late sentence names the stop');
    await page.fill('#tkIn', '熊猫吃竹子，竹子很甜'); { const s = await sayOk('#tkSay', 'ch1 unknown'); ok(s.includes('「熊」「竹」这 2 个字'), 'ch1 unknown characters listed once each: ' + s); }
    ok((await page.$$('#tkToks .unk')).length > 0, 'ch1 unknown characters are marked');
    await page.fill('#tkIn', '熊'); ok((await text(page, '#tkSay')).includes('「熊」在这份语料里'), 'ch1 one unknown character');
    await page.fill('#tkIn', '妈妈'); await setRange(page, 'tkM', 64); ok(/低于我定的门槛/.test(await text(page, '#tkSay')), 'ch1 merge 64 is below the threshold, not memorisation');
    } else {
    await setRange(page, 'tkM', 0); ok((await text(page, '#tkSay')).startsWith('No merges yet'), 'en ch1 m=0 sentence');
    await setRange(page, 'tkM', maxM); ok((await text(page, '#tkSay')).includes('as it stood at merge 273'), 'en ch1 late sentence names the stop');
    await page.fill('#tkIn', 'café 42 café'); { const s = await sayOk('#tkSay', 'ch1 unknown'); ok(s.includes('The 3 characters you typed, “é”, “4”, “2”, never appear'), 'en ch1 unknown characters listed once each: ' + s); }
    ok((await page.$$('#tkToks .unk')).length > 0, 'en ch1 unknown characters are marked');
    await page.fill('#tkIn', 'café'); ok((await text(page, '#tkSay')).startsWith('The “é” you typed'), 'en ch1 one unknown character: ' + await text(page, '#tkSay'));
    }
    await page.fill('#tkIn', ''); await sayOk('#tkSay', 'ch1 empty input'); ok(await text(page, '#tkMine') === '0', 'ch1 empty input has 0 tokens');

    // ch2: every context; generating a sentence
    await show(page, '#bgBars');
    for (const r of await page.$$('input[name=bgCtx]')) { await r.check({ force: true }); await sayOk('#bgSay', 'ch2 context'); }
    await (await page.$('input[name=bgCtx][value="0"]')).check({ force: true });
    if (zh) ok((await text(page, '#bgSay')).includes('3 个并列') && (await text(page, '#bgTop')).includes('等 3 个'), 'ch2 小猫: three-way tie at the top is said');
    else { ok((await text(page, '#bgSay')).includes('The most common is “sleeps”, 5 times, or 24%') && (await text(page, '#bgTop')) === 'sleeps', 'en ch2 cat: sleeps alone at the top');
      ok((await page.$$eval('#bgBars .pv', e => e.map(x => x.textContent))).includes('1 time') && !(await page.$$eval('#bgBars .pv', e => e.some(x => x.textContent === '1 times'))), 'en ch2: "1 time", not "1 times"'); }
    await page.click('#bgGen'); ok((await page.$$('#bgOut .t')).length > 0, 'ch2 writes a sentence');

    // ch3: each context length
    await show(page, '#ngCv', 300);
    for (const id of ['ngO', 'lpO']) ok(await page.$eval('#' + id, e => +e.min === 0 && +e.max === 3), `${id} runs over context lengths 0..3 (the n-gram table holds 4 orders)`);
    for (const v of [0, 1, 2, 3]) { await setRange(page, 'ngO', v); const s = await sayOk('#ngSay', 'ch3 context ' + v); ok((await page.$$('#ngOut li')).length === 3, 'ch3 three sentences at ' + v); if (v === 0) ok(s.includes(zh ? '总频率' : 'overall frequency'), L('ch3 zero sentence')); if (v === 3) ok(s.includes(zh ? '背书' : 'verbatim corpus sentences make up 96 of the 200'), L('ch3 sentence at 3 tokens: ') + s);
      if (v === 1 && !zh) ok(await text(page, '#ngOo') === '1 token' && await text(page, '#ngCopy') === '1 sentence', 'en ch3 singular units at 1: ' + await text(page, '#ngOo') + ' / ' + await text(page, '#ngCopy')); }

    // ch4: dimension extremes, every word
    await show(page, '#vcCv', 300);
    for (const k of [1, 2, 8, 24]) { await setRange(page, 'vcK', k); await sayOk('#vcSay', 'ch4 k=' + k); }
    const nWords = await page.$$eval('#vcWord option', o => o.length);
    for (let i = 0; i < nWords; i++) { await page.selectOption('#vcWord', String(i)); await sayOk('#vcSay', 'ch4 word ' + i); }
    await setRange(page, 'vcK', 8); await page.selectOption('#vcWord', '0');
    ok((await text(page, '#vcNb')) === (zh ? '小狗' : 'bird'), L('ch4 default nearest word'));
    // click on the canvas picks a word
    const box = await page.$eval('#vcCv', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await page.mouse.click(box.x + box.w * 0.5, box.y + box.h * 0.5);

    // ch5: every slot at slope 0, 1 and 2
    await show(page, '#atSlots');
    for (const s of [0, 1, 2]) { await setRange(page, 'atSlope', s); for (let i = 0; i < 9; i++) { await page.click(`#atSlots button[data-i="${i}"]`); await sayOk('#atSay', `ch5 slot ${i} slope ${s}`); } }
    await setRange(page, 'atSlope', 1); await page.click('#atSlots button[data-i="6"]');
    if (zh) ok((await text(page, '#atSay')).includes('平分给了「苹果」和「它」'), 'ch5 slope 1: 它 splits its weight between 苹果 and itself: ' + await text(page, '#atSay'));
    else ok((await text(page, '#atSay')).includes('splits its attention evenly between “apples” and “they”'), 'en ch5 slope 1: they splits its weight: ' + await text(page, '#atSay'));
    await setRange(page, 'atSlope', 0); await page.click('#atSlots button[data-i="6"]');
    ok((await text(page, '#atTop')) === (zh ? '苹果' : 'apples') && (await text(page, '#atW')) === '93%', L('ch5 default: it → apples 93%'));

    // ch6: temperature, k and p extremes, alone and together, for every context
    await show(page, '#smBars');
    for (const r of await page.$$('input[name=smCtx]')) {
      await r.check({ force: true });
      for (const [T, k, p] of [[0, 0, 1], [0.05, 0, 1], [0.5, 0, 1], [1, 0, 1], [2, 0, 1], [1, 1, 1], [1, 3, 1], [1, 10, 1], [1, 0, 0.05], [1, 0, 0.5], [2, 1, 0.05], [0, 10, 0.05]]) {
        await setRange(page, 'smT', T); await setRange(page, 'smK', k); await setRange(page, 'smP', p);
        await sayOk('#smSay', `ch6 T=${T} k=${k} p=${p}`);
      }
    }
    await (await page.$('input[name=smCtx][value="0"]')).check({ force: true });
    await setRange(page, 'smK', 0); await setRange(page, 'smP', 1);
    await setRange(page, 'smT', 0.5); if (zh) ok((await text(page, '#smSay')).includes('并列第一'), 'ch6 喜欢吃: tied first place is said at T 0.5');
    else ok((await text(page, '#smSay')).includes('“sleeps” rises from 24% to 47%'), 'en ch6 cat at T 0.5: ' + await text(page, '#smSay'));
    await setRange(page, 'smT', 0); ok((await text(page, '#smDist')) === (zh ? '1 句' : '1 sentence'), L('ch6 greedy writes one sentence: ') + await text(page, '#smDist'));
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
    ok((await text(page, '#trSay')).includes(zh ? '太大' : 'too large'), L('ch7 learning rate 50 diverges: ') + await text(page, '#trSay'));
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
    // a sentence that ends: the count is of the tokens the model wrote, not of the prompt
    await page.click('#lpReset'); await setRange(page, 'lpO', 0); await setRange(page, 'lpT', 0); await page.click('#lpFinish');
    { const s = await text(page, '#lpSay'), n = (await page.$$('#lpOut .t:not(.prompt)')).length;
      ok(zh ? s.includes(`一共写了 ${n} 个 token`) && s.includes('还是同一句') : s.includes(n === 1 ? 'wrote just this one token' : `wrote ${n} tokens in all`) && s.includes('gives the same sentence'), L(`ch8 greedy end sentence counts ${n} written tokens: ${s}`)); }
    await page.click('#lpReset'); await setRange(page, 'lpO', 3); await setRange(page, 'lpT', 1); await page.click('#lpFinish');
    { const s = await text(page, '#lpSay'), n = (await page.$$('#lpOut .t:not(.prompt)')).length;
      ok(zh ? s.includes(`一共写了 ${n} 个 token`) && s.includes('多半会不一样') : s.includes(`wrote ${n} tokens in all`) && s.includes('probably come out differently'), L(`ch8 end sentence counts ${n} written tokens: ${s}`)); }
    ok(!page.__errors().length, L('drive: errors: ') + page.__errors().join(' | '));
    await page.close();
  }

  // language-awareness without a translation: serve a stub copy.en.js (every key, ASCII text, same placeholders)
  // and check that English mode trains on the English corpus and that no Chinese comes from the code, the corpus
  // or the diagrams. Layout is not judged here: the stub's text lengths are not the translation's.
  if (!hasEn) {
    const vm = require('vm'), fs = require('fs'), path = require('path'), cx = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), cx);
    const Z = cx.window.ESSAY_COPY.zh, E = {};
    for (const [k, v] of Object.entries(Z)) E[k] = 'en ' + k.replace(/\./g, ' ') + ' ' + (v.match(/\{\w+\}/g) || []).join(' ');
    const stub = 'window.ESSAY_COPY = window.ESSAY_COPY || {}; window.ESSAY_COPY.en = ' + JSON.stringify(E) + ';';
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/copy.en.js', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: stub }));
    await page.addInitScript(() => { try { localStorage.setItem('knowledge-lang', 'en'); } catch (e) {} });
    await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
      CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
    await page.goto(url); await page.waitForFunction(() => window.__essayReady === true);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150); }
    await page.fill('#tkIn', 'a zebra'); await page.click('#bgGen'); await page.click('#ngGen'); await page.click('#smGen'); await page.click('#lpFinish');
    await setRange(page, 'atSlope', 1); await page.click('#atSlots button[data-i="6"]');
    const leaks = await page.evaluate(() => {
      const rx = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/, out = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) { if (!rx.test(n.textContent)) continue; if (n.parentElement.closest('#langToggle') && n.textContent.trim() === '中') continue; out.push('text: ' + n.textContent.trim().slice(0, 30)); }
      for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria: ' + e.getAttribute('aria-label').slice(0, 30));
      for (const s of window.__canvasStrings) if (rx.test(s)) out.push('canvas: ' + s);
      if (rx.test(document.title)) out.push('title');
      return out.slice(0, 8);
    });
    ok(!leaks.length, 'en stub: Chinese from code, corpus or diagrams: ' + leaks.join(' | '));
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'en stub: html lang en');
    ok((await page.$$eval('#vcWord option', o => o.map(x => x.textContent))).includes('cat'), 'en stub: the English corpus is in use');
    await page.click('#langToggle [data-lang=zh]');
    ok((await page.$eval('#tkIn', e => e.value)) === '妈妈喜欢吃西瓜，因为它很甜。', 'switching back to zh restores the zh sample sentence');
    ok((await page.$$eval('#vcWord option', o => o.map(x => x.textContent))).includes('小猫'), 'switching back to zh restores the zh corpus');
    ok(!errors.length, 'en stub: errors: ' + errors.join(' | '));
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
  console.log(`PASS: browser smoke test (${hasEn ? 'zh and en' : 'zh; copy.en.js absent'} at 1280/390/320: overflow, clipped text, 48px targets, no CJK in English; toggle, every control of all eight models at its extremes in ${hasEn ? 'both languages' : 'zh'}, training, reduced motion; ≥ 6 diagrams checked${hasEn ? '' : '; English stub: no Chinese from code'})`);
})().catch(e => { console.error(e); process.exit(1); });
