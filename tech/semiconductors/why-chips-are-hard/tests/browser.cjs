'use strict';
// Browser smoke test for the why-chips-are-hard essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18981 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node tech/semiconductors/why-chips-are-hard/tests/browser.cjs
// Checks in Chinese (and in English once copy.en.js exists): no console/page errors, no horizontal overflow at
// 1280/390/320, no text clipped inside its own box, every control at least 48×48 px, the toggle reads 中 | EN; in
// English no CJK characters visible anywhere (DOM text, aria-labels, title, canvas fillText). Then the toggle,
// each model driven by its controls (mouse and keyboard), the frontier filter, and reduced motion.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18981').replace(/\/$/, '');
const url = base + '/tech/semiconductors/why-chips-are-hard/';
const hasEn = fs.existsSync(path.join(__dirname, '..', 'copy.en.js'));
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
const pick = (page, name, value) => page.click(`input[name=${name}][value="${value}"]`, { force: true });
const show = async (page, sel, ms = 250) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(ms); };

(async () => {
  const browser = await chromium.launch();
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(300); }
    const blank = await page.evaluate(() => [...document.querySelectorAll('canvas')].filter(cv => { const c = cv.getContext('2d'), d = c.getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 4 * 97) if (d[i]) return false; return true; }).map(c => c.id));
    ok(!blank.length, `${tag}: canvases never drawn: ${blank.join(', ')}`);
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, .fr *')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);
    // no raw copy keys anywhere
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html],output,.say,.tile b')].map(e => e.textContent.trim()).filter(s => /^(ch\d+|fr|common|nav|toc|hero|doc)\.[\w.]+$/.test(s)));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.slice(0, 3).join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__canvasStrings].filter(s => /^ch\d+\.[\w.]+$/.test(s)));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
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
    ok(!small.length, `${tag}: targets under 48px: ${small.slice(0, 6).join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // toggle, then drive every model
  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')).includes('芯片'), 'hero title filled from copy');
    ok(await page.evaluate(() => document.title) === '芯片为什么越来越难做' || (await page.evaluate(() => document.title)).includes('芯片'), 'document title from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    if (hasEn) ok(!/[一-鿿]/.test(await text(page, 'h1')), 'EN toggle switches the title');
    else ok((await text(page, 'h1')).length > 0, 'without copy.en.js the page falls back to Chinese instead of raw keys');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1: default n-type 1e16; undoped; hot
    await show(page, '#c1Cv');
    ok((await text(page, '#c1n')) === '1.0×10¹⁶', 'ch1 n = 1e16, got ' + await text(page, '#c1n'));
    ok((await text(page, '#c1rho')).startsWith('0.564'), 'ch1 resistivity 0.564, got ' + await text(page, '#c1rho'));
    await setRange(page, 'c1N', 12);
    ok((await text(page, '#c1n')) === '9.8×10⁹', 'ch1 undoped n = ni, got ' + await text(page, '#c1n'));
    ok((await text(page, '#c1Say')).includes('没有掺杂'), 'ch1 intrinsic sentence');
    await setRange(page, 'c1N', 16); await setRange(page, 'c1T', 700);
    ok((await text(page, '#c1Say')).includes('超过了本征温度 649'), 'ch1 hot sentence names 649 K: ' + await text(page, '#c1Say'));
    await pick(page, 'c1Type', 'p'); await setRange(page, 'c1T', 300);
    ok((await text(page, '#c1p')) === '1.0×10¹⁶', 'ch1 p-type p = 1e16');
    ok((await text(page, '#c1ef')).startsWith('−'), 'ch1 p-type Fermi level below Ei');

    // ch2: defaults then reverse bias
    await show(page, '#c2Cv');
    ok((await text(page, '#c2vbi')) === '0.775 V', 'ch2 Vbi 0.775 V');
    await setRange(page, 'c2V', 0); ok((await text(page, '#c2w')) === '332 nm', 'ch2 W 332 nm, got ' + await text(page, '#c2w'));
    await setRange(page, 'c2V', -2); ok((await text(page, '#c2w')) === '628 nm', 'ch2 W 628 nm at −2 V');
    ok((await text(page, '#c2Say')).startsWith('反向'), 'ch2 reverse sentence');

    // ch3: defaults, then low Vdd; keyboard moves the Vt slider
    await show(page, '#c3Cv');
    ok((await text(page, '#c3r')) === '8.4×10⁵', 'ch3 ratio 8.4×10⁵, got ' + await text(page, '#c3r'));
    await setRange(page, 'c3Vdd', 0.45); ok((await text(page, '#c3ion')).startsWith('100'), 'ch3 Ion 100 µA/µm at 0.45 V, got ' + await text(page, '#c3ion'));
    await setRange(page, 'c3Vt', 0.1); ok((await text(page, '#c3Say')).includes('低于本页的及格线'), 'ch3 leaky sentence');
    await page.focus('#c3Vt'); const v0 = await text(page, '#c3Vto'); await page.keyboard.press('ArrowRight');
    ok((await text(page, '#c3Vto')) !== v0, 'ch3 keyboard moves the Vt slider');

    // ch4: generation 5 and modes
    await show(page, '#c4Cv');
    await setRange(page, 'c4G', 5); ok((await text(page, '#c4leak')) === '63%', 'ch4 gen 5 leak 63%, got ' + await text(page, '#c4leak'));
    await pick(page, 'c4Mode', 'fixed'); await setRange(page, 'c4G', 8); ok((await text(page, '#c4pd')) === '×256', 'ch4 fixed gen 8 ×256, got ' + await text(page, '#c4pd'));
    await pick(page, 'c4Mode', 'real'); ok((await text(page, '#c4pd')) === '×10.7', 'ch4 real gen 8 ×10.7');
    await page.click('#c4F', { force: true }); ok(!(await page.$eval('#c4F', e => e.checked)), 'ch4 frequency checkbox toggles');

    // ch5: ArFi limit, multi-patterning, EUV
    await show(page, '#c5Cv');
    ok((await text(page, '#c5lim')) === '38.0 nm', 'ch5 ArFi dipole limit 38.0 nm, got ' + await text(page, '#c5lim'));
    ok((await text(page, '#c5Say')).includes('能印出来'), 'ch5 default pitch prints: ' + await text(page, '#c5Say'));
    await setRange(page, 'c5P', Math.log10(24).toFixed(3)); ok((await text(page, '#c5Say')).includes('什么也印不出'), 'ch5 24 nm single exposure is dark');
    await pick(page, 'c5Split', '4'); ok((await text(page, '#c5Say')).includes('能印出来'), 'ch5 24 nm in four exposures prints');
    await pick(page, 'c5Split', '1'); await pick(page, 'c5Tool', 'euv'); ok((await text(page, '#c5Say')).includes('能印出来'), 'ch5 EUV prints 24 nm in one exposure');

    // ch6: defaults and dose
    await show(page, '#c6Cv');
    ok((await text(page, '#c6t')) === '2.0%', 'ch6 transmission 2.0%, got ' + await text(page, '#c6t'));
    ok((await text(page, '#c6sec')) === '2.86 s', 'ch6 seconds 2.86, got ' + await text(page, '#c6sec'));
    await setRange(page, 'c6D', 30); ok((await text(page, '#c6ph')).startsWith('3,446'), 'ch6 3,446 photons at 30 mJ, got ' + await text(page, '#c6ph'));
    await setRange(page, 'c6Px', 5); ok((await text(page, '#c6Say')).includes('曝光不足'), 'ch6 tiny pixel is noisy');
    await page.click('#c6Roll');

    // ch7: presets and sliders
    await show(page, '#c7Cv');
    ok((await text(page, '#c7d')).startsWith('192.9'), 'ch7 G48M24 192.9, got ' + await text(page, '#c7d'));
    await pick(page, 'c7Preset', 'intel10'); ok((await text(page, '#c7d')).startsWith('90.8'), 'ch7 Intel 10 90.8');
    await setRange(page, 'c7Ti', 2); ok((await text(page, '#c7Say')).startsWith('自定义'), 'ch7 slider clears the preset');
    ok(!(await page.$$eval('input[name=c7Preset]', rs => rs.some(r => r.checked))), 'ch7 no preset checked after a slider move');

    // ch8: shapes
    await show(page, '#c8Cv');
    ok((await text(page, '#c8s')) === '64 mV/十倍', 'ch8 FinFET 64, got ' + await text(page, '#c8s'));
    await pick(page, 'c8Shape', 'planar'); await setRange(page, 'c8L', 20);
    ok((await text(page, '#c8s')) === '135 mV/十倍', 'ch8 planar 20 nm 135, got ' + await text(page, '#c8s'));
    await setRange(page, 'c8L', 6); ok((await text(page, '#c8Say')).includes('关不断') || (await text(page, '#c8Say')).includes('退到'), 'ch8 short planar loses control');

    // ch9: wires
    await show(page, '#c9Cv');
    ok((await text(page, '#c9cu')) === '845 Ω/µm', 'ch9 Cu 845, got ' + await text(page, '#c9cu'));
    await setRange(page, 'c9P', 80); ok((await text(page, '#c9Say')).includes('铜还占优'), 'ch9 copper wins at 80 nm');
    await setRange(page, 'c9B', 0); await setRange(page, 'c9P', 24); ok((await text(page, '#c9Say')).includes('铜还占优'), 'ch9 without barrier copper wins at 24 nm');

    // ch10: yield and chiplets
    await show(page, '#c10Cv');
    ok((await text(page, '#c10cost')) === '342 美元', 'ch10 cost 342, got ' + await text(page, '#c10cost'));
    await setRange(page, 'c10A', 800); await setRange(page, 'c10D', 0.2); await pick(page, 'c10K', '4');
    ok((await text(page, '#c10cost')) === '397 美元', 'ch10 four chiplets 397, got ' + await text(page, '#c10cost'));
    const s0 = await text(page, '#c10y'); await pick(page, 'c10K', '1'); await page.click('#c10Roll');
    ok((await text(page, '#c10Say')).includes('858'), 'ch10 reticle note at 800 mm²');

    // ch11: frontier filter
    await show(page, '#frList');
    const all = await page.$$eval('#frList li:not([hidden])', l => l.length);
    await pick(page, 'c11F', 'claim');
    const claims = await page.$$eval('#frList li:not([hidden])', l => l.map(x => x.dataset.kind));
    ok(all >= 15 && claims.length > 0 && claims.length < all && claims.every(k => k === 'claim'), `ch11 filter shows only claims (${claims.length}/${all})`);
    ok(await page.$$eval('#frList li .src a', as => as.every(a => /^https:/.test(a.href))), 'ch11 every item links a source');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no animation exists, so the models must show their final state at once and the page must not smooth-scroll
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#c6Cv', 200); ok((await text(page, '#c6sec')) === '2.86 s', 'reduced motion: ch6 readouts immediate');
    await show(page, '#c10Cv', 200); ok((await text(page, '#c10Say')).includes('打坏了'), 'reduced motion: ch10 wafer map immediate');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${hasEn ? 'zh and en' : 'zh'} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, drawn canvases; toggle, ten models by mouse and keyboard, frontier filter, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
