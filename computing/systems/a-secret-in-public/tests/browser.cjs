'use strict';
// Browser smoke test for the a-secret-in-public essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:19015 NODE_PATH=~/fast/integ-life/integ-games/node_modules node computing/systems/a-secret-in-public/tests/browser.cjs
// Optional: ESSAY_SHOT_DIR=<dir> saves a screenshot of every diagram and model card at each width.
// Checks at 1280/390/320, in Chinese and in English: no console/page errors, no horizontal overflow, no text clipped inside its own box,
// every control at least 48×48 px, the toggle reads 中 | EN; in English also no CJK character visible anywhere
// (DOM text, aria-labels, title, canvas fillText) except the 中 toggle. Then the language toggle (with copy.en.js
// the page switches to English and back; without it, it falls back to Chinese, no raw keys), each model responding to its controls with the numbers the
// prose and tests/models.cjs pin, and reduced motion (the brute-force race does one block of work, then estimates).
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18984').replace(/\/$/, '');
const url = base + '/computing/systems/a-secret-in-public/';
const fails = [];
const SHOT = process.env.ESSAY_SHOT_DIR || '';
const DIAGRAMS = ['channel', 'clock', 'dh', 'mitm', 'rsa', 'ladder', 'chain', 'tls', 'shor', 'lwe', 'hybrid'];

// every static diagram (STANDARD §4a): role, aria, caption, labels non-empty, inside the viewBox, no two labels
// overlapping, ≥ 11 px rendered, and the svg itself inside the viewport
function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg) { out.push(name + ': no svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(name + ': role');
    const al = svg.getAttribute('aria-label') || '';
    if (al.length < 8 || /^dg\./.test(al)) out.push(name + ': aria-label "' + al + '"');
    const cap = fig.querySelector('figcaption'); if (!cap || cap.textContent.trim().length < 8 || /^dg\./.test(cap.textContent.trim())) out.push(name + ': caption');
    const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), k = r.width / vb.width;
    if (r.left < -0.5 || r.right > innerWidth + 0.5) out.push(name + ': svg outside the viewport');
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      const s = t.textContent.trim();
      if (!s || /^(dg|ch\d+)\./.test(s) || /\{\w+\}/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
      const b = t.getBBox(), fs = parseFloat(t.getAttribute('font-size')) * k;
      if (fs < 11) out.push(`${name}: "${s.slice(0, 12)}" renders at ${fs.toFixed(1)}px`);
      if (b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5) out.push(`${name}: "${s.slice(0, 14)}" outside the drawing`);
      boxes.push([s, b]);
    }
    if (boxes.length < 4) out.push(name + ': only ' + boxes.length + ' labels');
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [s1, a] = boxes[i], [s2, b] = boxes[j], pad = 1;
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ix > pad && iy > pad) out.push(`${name}: "${s1.slice(0, 12)}" overlaps "${s2.slice(0, 12)}"`);
    }
  }
  return out;
}
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  // record every string drawn on a canvas, so the English run can check canvas labels too
  await page.addInitScript(() => { window.__canvasText = new Set(); const p = CanvasRenderingContext2D.prototype; for (const fn of ['fillText', 'strokeText']) { const o = p[fn]; p[fn] = function (s) { window.__canvasText.add(String(s)); return o.apply(this, arguments); }; } });
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

  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(JSON.stringify(await page.$$eval('figure.dia', f => f.map(e => e.dataset.dg))) === JSON.stringify(DIAGRAMS), `${tag}: the eleven diagrams, in order`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w{11}$/.test(layouts) : /^n{11}$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    // each diagram sits before the first model that follows it in its chapter
    ok(await page.evaluate(() => [...document.querySelectorAll('figure.dia')].every(d => d.closest('section.ch'))), `${tag}: diagrams sit inside chapters`);
    if (SHOT) for (const fig of await page.$$('figure.dia, figure.lab')) {
      const id = await fig.evaluate(e => e.dataset.dg || (e.querySelector('[id]') || {}).id || 'lab');
      await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(350);
      await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
    }
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { if (e.closest('.tablewrap') || e.closest('defs')) return false; const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    // no raw copy keys and no unfilled {placeholders} anywhere visible
    const raw = await page.evaluate(() => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { const s = n.textContent.trim(); if (/^(ch\d+|fx|merit|u|nav|toc|hero|doc)(\.\w+)+$/.test(s) || /\{\w+\}/.test(s)) out.push(s.slice(0, 30)); } return out.slice(0, 5); });
    ok(!raw.length, `${tag}: raw keys or placeholders visible: ${raw.join(' | ')}`);
    if (lang === 'en') {
      // no CJK visible in English mode apart from the 中 toggle: DOM text, attributes read aloud, the title, canvases
      const cjk = await page.evaluate(() => {
        const han = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/, out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { const p = n.parentElement; if (!p || p.closest('script,style') || p.closest('#langToggle')) continue; if (han.test(n.textContent)) out.push('text "' + n.textContent.trim().slice(0, 24) + '"'); }
        for (const e of document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')) { if (e.closest('#langToggle')) continue; for (const a of ['aria-label', 'title', 'alt', 'placeholder']) if (han.test(e.getAttribute(a) || '')) out.push(a + ' "' + e.getAttribute(a).slice(0, 24) + '"'); }
        if (han.test(document.title)) out.push('document.title');
        const md = document.querySelector('meta[name=description]'); if (md && han.test(md.content)) out.push('meta description');
        for (const s of window.__canvasText) if (han.test(s)) out.push('canvas "' + s.slice(0, 24) + '"');
        return out.slice(0, 8);
      });
      ok(!cjk.length, `${tag}: CJK visible in English: ${cjk.join(' | ')}`);
      ok(await page.evaluate(() => window.__canvasText.size) > 20, `${tag}: canvases drew their labels`);
      ok((await text(page, '#fxStd li .when')) === 'August 2024', `${tag}: frontier dates read "August 2024", got ` + await text(page, '#fxStd li .when'));
      ok(await page.evaluate(() => getComputedStyle(document.querySelector('cite')).fontStyle) === 'italic', `${tag}: titles of works are italic`);
      // drafts that are not registered yet are named in plain text, not linked
      ok(!(await page.$$eval('a[href]', a => a.some(e => /how-a-web-page-arrives|what-quantum-computers-do/.test(e.getAttribute('href'))))), `${tag}: unregistered drafts are not linked`);
    } else {
      ok(await page.evaluate(() => getComputedStyle(document.querySelector('cite')).fontStyle) === 'normal', `${tag}: Chinese titles stay upright`);
      ok(!(await page.$$eval('a[href]', a => a.some(e => /how-a-web-page-arrives|what-quantum-computers-do/.test(e.getAttribute('href'))))), `${tag}: unregistered drafts are not linked`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle (with or without copy.en.js); then drive every model
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
    } else {
      ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'EN: html lang is en');
      ok((await text(page, 'h1')) === 'Agreeing on a Secret in Plain Sight', 'EN: the title switches, got ' + await text(page, 'h1'));
      ok(/^[\x20-\x7e–·]+$/.test(await page.title()), 'EN: document title switches, got ' + await page.title());
      // the models speak English after the switch (live sentences are rebuilt, canvases redrawn)
      await show(page, '#knCv', 250);
      ok((await text(page, '#knSay')).includes('10 people'), 'EN: ch1 live sentence in English: ' + await text(page, '#knSay'));
      await show(page, '#efCv', 250);
      ok(await text(page, '#efOps') === '7 / 22 operations', 'EN: ch5 operations readout, got ' + await text(page, '#efOps'));
      await page.evaluate(() => window.__canvasText.clear()); await page.evaluate(() => window.dispatchEvent(new Event('resize'))); await page.waitForTimeout(300);
      ok(await page.evaluate(() => { const han = /[\u3400-\u9fff]/; return window.__canvasText.size > 0 && ![...window.__canvasText].some(s => han.test(s)); }), 'EN: canvas redrawn in English after the switch');
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.$eval('#langToggle [data-lang=zh]', e => e.getAttribute('aria-pressed')) === 'true', 'ZH pressed again');
    { const dg = await page.evaluate(diagramCheck); ok(!dg.length, 'diagrams after a language switch: ' + dg.slice(0, 4).join(' | ')); }
    // resizing across the 600 px figure width swaps the diagram layout
    await page.setViewportSize({ width: 500, height: 900 }); await page.waitForTimeout(150);
    ok(/^n{11}$/.test(await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''))), 'diagrams switch to the narrow layout on resize');
    await page.setViewportSize({ width: 1280, height: 900 }); await page.waitForTimeout(150);
    ok(/^w{11}$/.test(await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''))), 'diagrams switch back to the wide layout');

    // ch1
    await show(page, '#knCv', 200);
    ok(await text(page, '#knBig') === '4,999,950,000', 'ch1 10^5 people');
    await setRange(page, 'knN', 40); ok(await text(page, '#knPairs') === '780', 'ch1 40 people → 780 keys');
    await pick(page, 'input[name=knMode][value=pub]'); ok((await text(page, '#knSay')).includes('40 对'), 'ch1 public-key sentence');

    // ch2 arithmetic modulo n
    await show(page, '#mdRow');
    ok(await text(page, '#mdInv') === '5' && await text(page, '#mdOrd') === '6' && await text(page, '#mdPhi') === '6' && (await text(page, '#mdSay')).includes('生成元'), 'ch2 mod 7, a = 3: inverse 5, order 6, generator');
    ok(await page.$$eval('#mdRow div', d => d.map(e => e.querySelector('b').textContent).join(' ')) === '0 3 6 2 5 1 4', 'ch2 mod 7 row of 3·x');
    ok(await page.$$eval('#mdPow div', d => d.map(e => e.querySelector('b').textContent).join(' ')) === '3 2 6 4 5 1', 'ch2 mod 7 powers of 3');
    await setRange(page, 'mdA', 2); ok(await text(page, '#mdOrd') === '3' && (await text(page, '#mdSay')).includes('费马小定理'), 'ch2 mod 7, a = 2: order 3');
    await setRange(page, 'mdN', 12); await setRange(page, 'mdA', 4);
    ok(await text(page, '#mdInv') === '没有' && await text(page, '#mdOrd') === '—' && (await text(page, '#mdSay')).includes('4 × 3 = 12 ≡ 0'), 'ch2 mod 12, a = 4: no inverse, zero divisor: ' + await text(page, '#mdSay'));
    ok(+(await page.$eval('#mdA', e => e.max)) === 11, 'ch2 mod: a slider follows n − 1');
    await setRange(page, 'mdA', 5); ok(await text(page, '#mdInv') === '5' && (await text(page, '#mdSay')).includes('欧拉定理'), 'ch2 mod 12, a = 5: its own inverse');
    await setRange(page, 'mdA', 1); ok((await text(page, '#mdSay')).includes('只有 4 个'), 'ch2 mod 12, a = 1');
    await setRange(page, 'mdN', 3); ok(+(await page.$eval('#mdA', e => e.value)) <= 2 && (await text(page, '#mdSay')).length > 10, 'ch2 mod: a clamped when n shrinks');
    await setRange(page, 'mdN', 17); await setRange(page, 'mdA', 16); ok(await text(page, '#mdOrd') === '2' && await text(page, '#mdInv') === '16', 'ch2 mod 17, a = 16 = −1: order 2');
    await setRange(page, 'mdN', 7); await setRange(page, 'mdA', 3);

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
    ok(await text(page, '#efOps') === '7 次 / 22 次', 'ch5 23G: 7 group operations against 22, got ' + await text(page, '#efOps'));
    ok(+(await page.$eval('#efK', e => e.max)) === 50, 'ch5 k slider max = order of G');
    await setRange(page, 'efK', 1); ok((await text(page, '#efSay')).includes('什么都不用算') && await text(page, '#efOps') === '0 次 / 0 次', 'ch5 k = 1 sentence');
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
    ok((await page.$$eval('#recTable tbody tr', r => r.length)) === 6, 'ch7 records table');

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
    { for (const fig of await page.$$('figure.dia')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); } const dg = await page.evaluate(diagramCheck); ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | ')); }
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('browser checks passed');
})().catch(e => { console.error(e); process.exit(1); });
