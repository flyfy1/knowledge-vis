'use strict';
// Browser test for demos/scarcity-moves/ (稀缺会搬家 / Scarcity Moves).
// Usage: SCARCITY_BASE_URL=http://127.0.0.1:18943 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node demos/scarcity-moves/tests/browser.cjs
//
// 1. Chinese and real English at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped in
//    its own box, every control at least 48×48 px, html lang, title and description from the copy, no raw keys or
//    unfilled {placeholders} visible, every canvas drew text, the toggle reads 中 | EN. In English no CJK is
//    visible anywhere (DOM text, aria-label/valuetext, title, description, canvas fillText) except the 中 label.
// 2. LANG_TOGGLE_ON is true: the toggle is visible in a fresh page, and a stored knowledge-lang=en opens in English.
// 3. With copy.en.js replaced by a pseudo-translation (every run of Chinese characters becomes "Xx "), so that
//    any string bypassing the copy shows up: EN switches instantly and is stored; no Chinese is left anywhere
//    visible; numbers switch to English grouping (1k … 1M, 15.8k×); ZH switches back; a reload remembers EN.
// 4. Every per-case sentence template is reached, in Chinese (as the original page wrote it) and in English.
// 5. Reduced motion: the hero animation does not run.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = (process.env.SCARCITY_BASE_URL || 'http://127.0.0.1:18915').replace(/\/$/, '');
const url = base + '/demos/scarcity-moves/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? String(vars[k]) : m);
// a template as a regex: placeholders match any number
const tmplRe = s => new RegExp('^' + s.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{\w+\\?\}/g, '[\\d.,]+') + '$');

// pseudo-English: same keys, placeholders and tags; every run of Chinese becomes "Xx " (with a space, so lines
// can still break the way English text does)
const zhSrc = fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8');
const pseudoEn = zhSrc.replace('window.ESSAY_COPY.zh = {', 'window.ESSAY_COPY.en = {')
  .replace(/^(\s*"[\w.]+":\s*)"(.*)"(,?)$/gm, (m, a, v, c) => a + '"' + v.replace(/[　-〿㐀-鿿＀-￯]+/g, 'Xx ') + '"' + c)
  .replace(/^\/\*[\s\S]*?\*\/\n/, '');

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  if (opts.stored !== null) await page.addInitScript(l => { try { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem('knowledge-lang', l); sessionStorage.setItem('__seeded', '1'); } } catch (e) {} }, opts.stored || 'zh');
  if (opts.reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  if (opts.pseudo) await page.route('**/copy.en.js', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: pseudoEn }));
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__cv = {};
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { (window.__cv[this.canvas.id] = window.__cv[this.canvas.id] || new Set()).add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true);
  page.__errors = () => errors;
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const html = (page, sel) => page.$eval(sel, e => e.innerHTML.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const setCheck = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); if (e.checked !== v) e.click(); }, [id, v]);
// canvases only draw on screen: bring every figure into view once
const visitAll = async page => { for (const f of await page.$$('figure.lab, header.hero')) { await f.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(250); } };
// text clipped inside its own box (tiles, buttons, outputs, labels)
const clipped = page => page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, .fc .tag')].filter(e => {
  if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
  const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis' && cs.whiteSpace !== 'nowrap') return false;
  return e.scrollWidth > e.clientWidth + 1 || (cs.overflow !== 'visible' && e.scrollHeight > e.clientHeight + 1); }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 24) + '"'));
// interactive targets under 48×48 (a checkbox counts by its label)
const smallTargets = page => page.evaluate(() => {
  const out = [];
  for (const e of document.querySelectorAll('button, input, .toc a, [role=slider]')) {
    if (e.id === 'dot') continue; // the scenario dot sits on a 220–340 px pad that is itself the pointer target
    const r = (e.matches('input[type=checkbox]') ? e.closest('label') : e).getBoundingClientRect(); if (!r.width && !r.height) continue;
    if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
  }
  return out; });
// readout tiles and slider rows whose children overlap each other
const overlaps = page => page.evaluate(() => {
  const out = [];
  for (const box of document.querySelectorAll('.read > div, .ctl label, .row, .maphead div, .meter')) {
    const kids = [...box.children].filter(k => k.getClientRects().length).map(k => [k, k.getBoundingClientRect()]);
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) { const a = kids[i][1], b = kids[j][1];
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push(box.className + ': ' + kids[i][0].textContent.trim().slice(0, 16) + ' / ' + kids[j][0].textContent.trim().slice(0, 16)); }
  }
  return out.slice(0, 5); });
const canvasStrings = page => page.evaluate(() => { const o = {}; for (const k in window.__cv) o[k] = [...window.__cv[k]]; return o; });
const visibleLeaks = (page, re) => page.evaluate(re => {
  const rx = new RegExp(re), out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!rx.test(n.textContent) || !el.getClientRects().length) continue; if (el.closest('#langToggle') && n.textContent.trim() === '中') continue; out.push('text: ' + n.textContent.trim().slice(0, 30)); }
  for (const e of document.querySelectorAll('[aria-label],[aria-valuetext]')) for (const a of ['aria-label', 'aria-valuetext']) { const v = e.getAttribute(a); if (v && rx.test(v) && !e.closest('[hidden]')) out.push(a + ': ' + v); }
  if (rx.test(document.title)) out.push('title: ' + document.title);
  const md = document.querySelector('meta[name=description]'); if (md && rx.test(md.content)) out.push('meta description');
  for (const k in window.__cv) for (const s of window.__cv[k]) if (rx.test(s)) out.push(`canvas ${k}: ${s}`);
  return out;
}, re.source);

(async () => {
  const browser = await chromium.launch();
  const load = (src, lang) => { global.window = {}; new Function(src)(); return window.ESSAY_COPY[lang]; };
  const zh = load(zhSrc, 'zh');
  const en = load(fs.readFileSync(path.join(__dirname, '..', 'copy.en.js'), 'utf8'), 'en');
  const COPY = { zh, en };

  // 1. Chinese and real English at three widths
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { stored: lang });
    const tag = `${lang} ${width}`, L = COPY[lang];
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(await page.title() === L['doc.title'], `${tag}: document title from copy`);
    ok(await page.$eval('meta[name=description]', e => e.content) === L['doc.desc'], `${tag}: description from copy`);
    ok(await page.$eval('#langToggle', e => !e.hidden && e.getClientRects().length > 0), `${tag}: toggle visible`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle reads 中 | EN`);
    ok(await page.$eval(`#langToggle [data-lang=${lang}]`, e => e.getAttribute('aria-pressed')) === 'true', `${tag}: current language pressed`);
    await visitAll(page);
    const body = await page.evaluate(() => document.body.innerText);
    ok(!/\{\w+\}/.test(body), `${tag}: unfilled placeholder visible`);
    ok(!/\b(ch\d+|hero|toc|part\d|tag|unit|num|doc)\.[\w.]+/.test(body), `${tag}: raw copy key visible`);
    ok(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].every(e => e.textContent.trim().length)), `${tag}: an element with a copy key is empty`);
    const cv = await canvasStrings(page);
    for (const id of ['ppfCv', 'mkCv', 'cmCv2', 'grCv', 'flCv', 'ysCv', 'bnCv', 'wgCv']) ok(cv[id] && cv[id].length, `${tag}: canvas ${id} drew no text`);
    if (lang === 'zh') ok(cv.bnCv && cv.bnCv.includes('1万') && cv.bnCv.includes('100万') && cv.bnCv.includes('1千'), `${tag}: ch11 axis in 千/万: ${cv.bnCv}`);
    else ok(cv.bnCv && cv.bnCv.includes('1k') && cv.bnCv.includes('100k') && cv.bnCv.includes('1M'), `${tag}: ch11 axis in k/M: ${cv.bnCv}`);
    ok(cv.ppfCv && cv.ppfCv.includes(L['ch1.cv.money']), `${tag}: ch1 canvas label from copy`);
    ok(cv.cmCv2 && cv.cmCv2.includes(L['ch6.cv.boats']), `${tag}: ch6 axis label from copy`);
    if (lang === 'en') {
      const leaks = await visibleLeaks(page, CJK);
      ok(!leaks.length, `${tag}: Chinese visible in English mode: ${leaks.slice(0, 6).join(' | ')}`);
    }
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const clip = await clipped(page); ok(!clip.length, `${tag}: clipped text: ${clip.join(', ')}`);
    const small = await smallTargets(page); ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const lap = await overlaps(page); ok(!lap.length, `${tag}: overlapping text: ${lap.join(' | ')}`);
    // keyboard: a slider moves with the arrow keys and shows a focus ring
    await page.focus('#grG'); const g0 = await page.$eval('#grG', e => e.value); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('#grG', e => e.value) !== g0, `${tag}: slider does not respond to the keyboard`);
    ok(await page.$eval('#grG', e => getComputedStyle(e).outlineStyle !== 'none'), `${tag}: no visible focus on a slider`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // 2. the toggle is switched on for good
  {
    const page = await open(browser, 1280, { stored: null });
    ok(await page.$eval('#langToggle', e => !e.hidden) && await page.locator('#langToggle [data-lang]').count() === 2, 'toggle on: buttons present in a fresh page');
    await page.close();
  }

  // 3. pseudo-English copy: anything that bypasses the copy would show up as Chinese
  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { pseudo: true });
    const tag = `pseudo ${width}`;
    const small = await page.$$eval('#langToggle button', bs => bs.filter(b => { const r = b.getBoundingClientRect(); return r.width < 47.5 || r.height < 47.5; }).length);
    ok(!small, `${tag}: toggle buttons under 48px`);
    ok(await page.$eval('#langToggle [data-lang=zh]', e => e.getAttribute('aria-pressed')) === 'true', `${tag}: 中 pressed at start`);
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', `${tag}: html lang en`);
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', `${tag}: EN pressed`);
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', `${tag}: EN stored`);
    await page.evaluate(() => { window.__cv = {}; });
    await visitAll(page);
    // drive the controls whose text is built in code so every branch is drawn in English
    await page.$eval('#bnCv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await setRange(page, 'bnM', 4.2); await page.waitForTimeout(150);
    ok(/^15\.8k/.test(await text(page, '#bnMo')),`${tag}: ch11 multiplier in k: ${await text(page, '#bnMo')}`);
    await setRange(page, 'bnM', 6); await page.waitForTimeout(150);
    ok(/^1M/.test(await text(page, '#bnMo')), `${tag}: ch11 multiplier 1M: ${await text(page, '#bnMo')}`);
    await page.$eval('#cmCv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await setCheck(page, 'cmQ', true); await setRange(page, 'cmB', 30); await page.waitForTimeout(300);
    await page.focus('#dot'); for (let k = 0; k < 25; k++) { await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowDown'); }
    const cv = await canvasStrings(page);
    ok(cv.bnCv && cv.bnCv.includes('1k') && cv.bnCv.includes('1M') && !cv.bnCv.includes('1万'), `${tag}: ch11 axis in English grouping: ${cv.bnCv}`);
    const leaks = await visibleLeaks(page, CJK);
    ok(!leaks.length, `${tag}: Chinese visible in English mode: ${leaks.slice(0, 6).join(' | ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px in English`);
    // switching back redraws the canvases in Chinese
    await page.evaluate(() => { window.__cv = {}; });
    await page.click('#langToggle [data-lang=zh]');
    await page.$eval('#cmCv2', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(250);
    ok(((await canvasStrings(page)).cmCv2 || []).includes(zh['ch6.cv.boats']), `${tag}: ch6 canvas redrawn in Chinese after switching back`);
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: back to zh`);
    ok(await page.title() === zh['doc.title'], `${tag}: zh document title back`);
    ok(await text(page, 'h1') === zh['hero.title'], `${tag}: zh title back`);
    ok(/万倍$/.test(await text(page, '#bnMo')), `${tag}: ch11 multiplier back in 万: ${await text(page, '#bnMo')}`);
    if (width === 1280) {
      await page.click('#langToggle [data-lang=en]');
      await page.reload(); await page.waitForFunction(() => window.__ready === true);
      ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'reload remembers EN');
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // 4. every per-case sentence, in both languages. The Chinese strings are the original page's, written out.
  for (const lang of ['zh', 'en']) {
    const page = await open(browser, 1280, { stored: lang });
    const L = COPY[lang], tag = `sentences ${lang}`;
    const say = sel => html(page, sel);
    const T = (k, v) => fill(L[k], v || {});
    const times = v => T('unit.times', { v });
    // ch1
    ok(await say('#ppfSay') === T('ch1.say.mid', { dm: 16 }), `${tag}: ch1 default sentence: ` + await say('#ppfSay'));
    if (lang === 'zh') ok(await say('#ppfSay') === '现在这一小时的学习，价格是 <em>16 元</em>。学得越多，这个价格越高，收获越小。你认为一分值多少钱，决定了你该停在哪里。', 'zh ch1 default sentence verbatim');
    ok(await text(page, '#ppfO') === T('ch1.unit.hours', { v: 6 }) && await text(page, '#ppfdK') === T('ch1.unit.points', { v: '4.9' }) && await text(page, '#ppfdM') === T('ch1.unit.yuan', { v: 16 }), `${tag}: ch1 readouts`);
    await setRange(page, 'ppfS', 16); ok(await say('#ppfSay') === L['ch1.say.all'] && await text(page, '#ppfdK') === '—', `${tag}: ch1 all study`);
    await setRange(page, 'ppfS', 0); ok(await say('#ppfSay') === L['ch1.say.none'], `${tag}: ch1 no study`);
    // ch3: every branch, who is faster at both × who should write more
    const ch3 = async (a1, a2, b1, b2) => { await setRange(page, 'tA1', a1); await setRange(page, 'tA2', a2); await setRange(page, 'tB1', b1); await setRange(page, 'tB2', b2); return say('#tSay'); };
    ok(await ch3(8, 6, 2, 4) === T('ch3.say.aFaster.A', { ocA: '0.75', ocB: '2.00', gain: '10.0' }), `${tag}: ch3 aFaster.A: ` + await say('#tSay'));
    if (lang === 'zh') ok(await say('#tSay') === '阿强两样都更快。但阿强每写 1 道题要放弃 <em>0.75</em> 页 PPT，小周要放弃 <em>2.00</em> 页。让阿强多写题，题一道没少，PPT 多出 <em>10.0</em> 页。没有人多干一分钟。', 'zh ch3 verbatim');
    ok((await text(page, '#planA h5')) === L['ch3.plan.alone'] && (await page.$$eval('#planB .row span', s => s.map(e => e.textContent))).join() === [L['ch3.nameA'], L['ch3.nameB'], L['ch3.tot.q'], L['ch3.tot.p']].join(), `${tag}: ch3 plan labels`);
    ok(await ch3(10, 9, 2, 1) === T('ch3.say.aFaster.B', { ocA: '0.90', ocB: '0.50', gain: '3.2' }), `${tag}: ch3 aFaster.B: ` + await say('#tSay'));
    ok(await ch3(1, 1, 2, 4) === T('ch3.say.bFaster.A', { ocA: '1.00', ocB: '2.00', gain: '4.0' }), `${tag}: ch3 bFaster.A: ` + await say('#tSay'));
    ok(await ch3(1, 2, 3, 3) === T('ch3.say.bFaster.B', { ocA: '2.00', ocB: '1.00', gain: '4.0' }), `${tag}: ch3 bFaster.B: ` + await say('#tSay'));
    ok(await ch3(3, 1, 2, 4) === T('ch3.say.mixed.A', { ocA: '0.33', ocB: '2.00', gain: '13.3' }), `${tag}: ch3 mixed.A: ` + await say('#tSay'));
    ok(await ch3(2, 4, 3, 1) === T('ch3.say.mixed.B', { ocA: '2.00', ocB: '0.33', gain: '13.3' }), `${tag}: ch3 mixed.B: ` + await say('#tSay'));
    ok(await ch3(2, 4, 2, 4) === L['ch3.say.same'], `${tag}: ch3 same`);
    // ch7
    ok(await text(page, '#grX') === times('15.6') && await text(page, '#grD') === T('ch7.unit.years', { v: 18 }) && await text(page, '#grGo') === '4.0%', `${tag}: ch7 readouts`);
    await setRange(page, 'grG', 0); ok(await text(page, '#grD') === L['ch7.unit.never'] && await text(page, '#grX') === times('1.00'), `${tag}: ch7 zero growth`);
    // ch11
    ok(await text(page, '#bnMo') === times('100') && await text(page, '#bnY') === times('2.46') && await text(page, '#bnL') === times('2.50') && await text(page, '#bnFo') === '60%', `${tag}: ch11 readouts: ` + await text(page, '#bnY'));
    await setRange(page, 'bnM', 4.2); ok(await text(page, '#bnMo') === (lang === 'zh' ? '1.6 万倍' : '15.8k×'), `${tag}: ch11 big multiplier: ` + await text(page, '#bnMo'));
    await setRange(page, 'bnM', 6); ok(await text(page, '#bnMo') === (lang === 'zh' ? '100 万倍' : '1M×'), `${tag}: ch11 million: ` + await text(page, '#bnMo'));
    await setRange(page, 'bnM', 0.5); ok(await text(page, '#bnMo') === times('3.2'), `${tag}: ch11 small multiplier: ` + await text(page, '#bnMo'));
    // ch12: all six sentences
    const wg = async (k, r, land) => { await setCheck(page, 'wgB', land); await setRange(page, 'wgR', r); await setRange(page, 'wgK', k); return say('#wgSay'); };
    ok(await wg(-1, -1, false) === L['ch12.say.p1'], `${tag}: ch12 phase 1`);
    ok(await wg(-1, -1, true) === L['ch12.say.p1land'], `${tag}: ch12 phase 1 with land`);
    ok(await wg(1, -2, false) === L['ch12.say.p2'], `${tag}: ch12 phase 2`);
    ok(await wg(4, -2, false) === T('ch12.say.p3', { w: '10.00', own: 99 }), `${tag}: ch12 phase 3: ` + await say('#wgSay'));
    if (lang === 'zh') ok(await say('#wgSay') === '<em>③替代。</em>算力多到做 B 类也划算了。工资停在 10.00，再多的算力也推不动它。产出的 99% 归了算力的所有者。', 'zh ch12 phase 3 verbatim');
    ok(await text(page, '#wgRo') === T('ch12.unit.rho', { v: '1.0' }), `${tag}: ch12 rho readout: ` + await text(page, '#wgRo'));
    ok(tmplRe(L['ch12.say.p3landBelow']).test(await wg(4, -1, true)) && +(await text(page, '#wgW')) < 1, `${tag}: ch12 phase 3, land, below today: ` + await say('#wgSay'));
    ok(tmplRe(L['ch12.say.p3landAbove']).test(await wg(2.2, -2, true)) && +(await text(page, '#wgW')) >= 1, `${tag}: ch12 phase 3, land, above today: ` + await say('#wgSay'));
    // ch13, ch14
    ok((await page.$$eval('#scMap .mrow span', s => s.map(e => e.textContent))).join('|') === Array.from({ length: 15 }, (_, i) => L[`ch13.item${i + 1}`]).join('|') && await text(page, '#scAo') === '55%', `${tag}: ch13 list`);
    const name = L['ch14.sc.fastConc.name'];
    ok(await text(page, '#scName') === name && await page.$eval('#dot', e => e.getAttribute('aria-valuetext')) === T('ch14.pad.valuetext', { name, x: 64, y: 40 }), `${tag}: ch14 default scenario`);
    await page.focus('#dot'); for (let k = 0; k < 6; k++) await page.keyboard.press('ArrowUp');
    ok(await text(page, '#scName') === L['ch14.sc.fastShared.name'] && await text(page, '#scText') === L['ch14.sc.fastShared.text'], `${tag}: ch14 arrow keys move to the shared quadrant`);
    for (let k = 0; k < 10; k++) await page.keyboard.press('ArrowLeft');
    ok(await text(page, '#scName') === L['ch14.sc.slowShared.name'], `${tag}: ch14 slow shared`);
    for (let k = 0; k < 12; k++) await page.keyboard.press('ArrowDown');
    ok(await text(page, '#scName') === L['ch14.sc.slowConc.name'], `${tag}: ch14 slow concentrated`);
    await page.click('#scMine'); ok(await text(page, '#scName') === name, `${tag}: ch14 back to my estimate`);
    // ch6, ch8, ch9 readouts come from the animated models
    await page.$eval('#cmCv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await setCheck(page, 'cmQ', true); await setRange(page, 'cmB', 20); await page.waitForTimeout(400);
    ok(await text(page, '#cmBo') === T('ch6.unit.boatsOut', { b: 20, e: 12 }), `${tag}: ch6 quota readout: ` + await text(page, '#cmBo'));
    if (lang === 'zh') ok(await text(page, '#cmBo') === '20 条（12 条出海）', 'zh ch6 verbatim');
    await setCheck(page, 'cmQ', false); await page.waitForTimeout(100);
    ok(await text(page, '#cmBo') === T('ch6.unit.boats', { b: 20 }), `${tag}: ch6 readout without quota: ` + await text(page, '#cmBo'));
    await page.$eval('#flCv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(400);
    ok(await say('#flSay') === T('ch8.say', { s: '0.20', y: 100 }) && await text(page, '#flSo') === T('ch8.unit.yuan', { v: 20 }), `${tag}: ch8 sentence: ` + await say('#flSay'));
    if (lang === 'zh') ok(await say('#flSay') === '稳定下来后，总收入 = 20 ÷ 0.20 = <em>100</em>。实际存下的总额始终回到 <em>20</em>，正好等于那笔投资。每个人都想多存，大家一起变穷，存款一分没多。', 'zh ch8 verbatim');
    await page.$eval('#ysCv', e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(400);
    ok(/^\d+%$/.test(await text(page, '#ysTop')) && await text(page, '#ysTo') === '0.00%', `${tag}: ch9 readouts`);
    ok(tmplRe(L['hero.stat']).test(await text(page, '#heroStat')), `${tag}: hero stat line: ` + await text(page, '#heroStat'));
    if (lang === 'zh') ok(/^背景里，每一次相遇都是一笔自愿的交换 · 已成交 \d[\d,]* 笔 · 新增价值 \d[\d,]*$/.test(await text(page, '#heroStat')), 'zh hero stat verbatim');
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // 5. reduced motion: the hero stays still (no trades happen)
  {
    const page = await open(browser, 1280, { stored: 'en', reduced: true });
    await page.waitForTimeout(1500);
    ok(await text(page, '#hsN') === '0', 'reduced motion: hero animation should not run');
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: smooth scrolling off');
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.log('FAIL\n' + fails.map(f => '  ' + f).join('\n')); process.exit(1); }
  console.log('ok: zh and en at 1280/390/320 (overflow, clipped and overlapping text, 48px targets, keyboard, no Chinese in English); pseudo-English switch, storage, canvas redraw and number formatting; all sentence branches in zh and en; reduced motion');
})().catch(e => { console.error(e); process.exit(1); });
