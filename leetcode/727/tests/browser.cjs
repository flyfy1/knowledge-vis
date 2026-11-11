'use strict';
// Author browser self-check for #727. Needs a static server at the repo root.
// PREVIEW_ROOT (default http://127.0.0.1:18770), OUTPUT_DIR (default <tmpdir>/leetcode-727-browser).
const {chromium} = require('playwright'), fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.resolve(__dirname, '..');
const URL = (process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/727/';
// Screenshots (36 full PNGs) go outside the repo by default; copy browser.json into tests/evidence by hand.
const OUT = process.env.OUTPUT_DIR || path.join(require('os').tmpdir(), 'leetcode-727-browser');
fs.mkdirSync(OUT, {recursive: true});
const entry = JSON.parse(fs.readFileSync(path.join(ROOT, 'lesson-entry.json'), 'utf8'));
const source = fs.readFileSync(path.join(ROOT, 'solution.py'), 'utf8');
// Expected answers come from the independent oracle (see test_solution.py "named"), not from core.js.
const presetAnswers = ['ctat', 'axb', 'aa', 'abdbe', '', ''];
const custom = [['zzazbzzb', 'ab', 'azb'], ['q', 'q', 'q'], ['abc', 'd', '']];

(async () => {
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'], reducedMotion: 'reduce'});
  const page = await context.newPage();
  const errors = [], bad = [], external = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) bad.push([r.url(), r.status()]); });
  page.on('request', r => { if (!r.url().startsWith(new globalThis.URL(URL).origin) && !r.url().startsWith('data:')) external.push(r.url()); });
  await page.goto(URL);
  await page.locator('#progress').filter({hasText: '0/'}).waitFor();
  const report = {kind: 'author browser self-check (not independent review)', checkedAt: new Date().toISOString(), browser: await browser.version(), host: process.platform, presets: [], custom: [], prediction: [], layout: []};
  const snap = () => page.locator('#event,#progress,#best,#slotRows,#history,#traceStrip').allTextContents().then(JSON.stringify);
  const endText = ans => ans ? ans : null;

  for (const lang of ['zh', 'en']) {
    await page.locator(`[data-lang=${lang}]`).click();
    assert.strictEqual(await page.locator('html').getAttribute('lang'), lang === 'zh' ? 'zh-CN' : 'en');
    assert.strictEqual(await page.locator('h1').textContent(), '#727 · ' + entry.title[lang]);
    assert.strictEqual(await page.title(), '727 · ' + entry.title[lang]);
    // Every preset: forward to the end, rewind to the start, replay.
    for (let p = 0; p < presetAnswers.length; p++) {
      await page.selectOption('#preset', String(p));
      assert(await page.locator('#prev').isDisabled());
      const initial = await snap();
      await page.locator('#next').click();
      const first = await snap();
      await page.locator('#prev').click();
      assert.strictEqual(await snap(), initial, 'rewind restores frame 0');
      await page.locator('#next').click();
      assert.strictEqual(await snap(), first, 'replay reproduces frame 1');
      while (await page.locator('#next').isEnabled()) await page.locator('#next').click();
      const event = await page.locator('#event').textContent();
      const ans = presetAnswers[p];
      if (ans) assert(event.includes(`"${ans}"`), event); else assert(event.includes('""'), event);
      const terminal = await snap();
      while (await page.locator('#prev').isEnabled()) await page.locator('#prev').click();
      assert.strictEqual(await snap(), initial);
      await page.locator('#end').click(); assert.strictEqual(await snap(), terminal);
      await page.locator('#reset').click(); assert.strictEqual(await snap(), initial);
      report.presets.push({lang, preset: p, expected: ans, terminal: event});
    }
    // Main example frame 5 (after index 4): progress "c" moves 1 -> 4, "ca" keeps 1.
    await page.selectOption('#preset', '0');
    for (let i = 0; i < 5; i++) await page.locator('#next').click();
    const rows = await page.locator('#slotRows tr').allTextContents();
    assert(rows[0].includes('1 → 4') && rows[1].includes('"ca"1') && rows[2].includes('−1'), JSON.stringify(rows));
    assert.strictEqual(await page.locator('#slotRows tr.changed-row').count(), 1);
    // Frame 6: first candidate caxct; frame 8: ctat replaces it.
    await page.locator('#next').click();
    assert((await page.locator('#best').textContent()).includes('"caxct"'));
    await page.locator('#next').click(); await page.locator('#next').click();
    assert((await page.locator('#best').textContent()).includes('"ctat"'));
    assert.strictEqual(await page.locator('#history li').count(), 2);
    // Slider jumps to any step.
    await page.locator('#position').fill('2');
    assert((await page.locator('#progress').textContent()).includes('2/9'));
    // Custom input, valid and invalid.
    for (const [s1, s2, ans] of custom) {
      await page.fill('#inputS1', s1); await page.fill('#inputS2', s2); await page.locator('#customForm button').click();
      assert.strictEqual(await page.locator('#preset').inputValue(), 'custom');
      await page.locator('#end').click();
      const event = await page.locator('#event').textContent();
      assert(event.includes(ans ? `"${ans}"` : '""'), event);
      report.custom.push({lang, s1, s2, expected: ans, terminal: event});
    }
    for (const [s1, s2] of [['ABC', 'a'], ['', 'a'], ['a'.repeat(21), 'a'], ['abc', 'abcdefg']]) {
      const before = await snap();
      await page.fill('#inputS1', s1); await page.fill('#inputS2', s2); await page.locator('#customForm button').click();
      assert((await page.locator('#validation').textContent()).length > 4);
      assert.strictEqual(await snap(), before, 'invalid input leaves the trace unchanged');
    }
    // Prediction: hidden until reveal; every option; changing clears.
    for (const option of [0, 1, 3, 2]) {
      await page.locator(`[name=prediction][value="${option}"]`).check();
      const pending = await page.locator('#feedback').textContent();
      assert(!pending.includes('"bab"'), 'feedback hidden before reveal');
      await page.locator('#reveal').click();
      const text = await page.locator('#feedback').textContent();
      assert(text.includes('"bab"'));
      report.prediction.push({lang, option, text});
    }
    // Locale switch preserves trace, preset and prediction.
    await page.selectOption('#preset', '3'); for (let i = 0; i < 4; i++) await page.locator('#next').click();
    const progress = await page.locator('#progress').textContent();
    const other = lang === 'zh' ? 'en' : 'zh';
    await page.locator(`[data-lang=${other}]`).click();
    assert(await page.locator('[name=prediction][value="2"]').isChecked());
    assert.strictEqual(await page.locator('#preset').inputValue(), '3');
    await page.locator(`[data-lang=${lang}]`).click();
    assert.strictEqual(await page.locator('#progress').textContent(), progress);
    // Source display, download, copy and manual fallback.
    assert.strictEqual(await page.locator('#code').textContent(), source);
    const dl = page.waitForEvent('download'); await page.locator('#download').click();
    const file = path.join(OUT, `download-${lang}.py`); await (await dl).saveAs(file);
    assert.strictEqual(fs.readFileSync(file, 'utf8'), source);
    await page.locator('#copy').click();
    await page.locator('#copyStatus').filter({hasText: lang === 'zh' ? '已复制' : 'Copied'}).waitFor();
    assert.strictEqual(await page.evaluate(() => navigator.clipboard.readText()), source);
    const sentinel = `727-${lang}-${Date.now()}`;
    await page.evaluate(async s => { await navigator.clipboard.writeText(s); if (await navigator.clipboard.readText() !== s) throw Error('sentinel'); }, sentinel);
    await page.evaluate(() => { window.__clip = navigator.clipboard; Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async () => { throw Error('denied'); }}}); });
    await page.locator('#copy').click();
    assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'fallbackSource');
    assert.strictEqual(await page.locator('#fallbackSource').evaluate(e => e.value.slice(e.selectionStart, e.selectionEnd)), source);
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+C' : 'Control+C');
    assert.strictEqual(await page.evaluate(() => window.__clip.readText()), source);
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable: true, value: window.__clip}));
    await page.locator('#copy').click();
    await page.locator('#manualCopy').waitFor({state: 'hidden'});
    // Keyboard: Tab from Back reaches Read next; Enter advances.
    await page.selectOption('#preset', '0'); await page.locator('#next').click();
    await page.locator('#prev').focus(); await page.keyboard.press('Tab');
    assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'next');
    await page.keyboard.press('Enter');
    assert((await page.locator('#progress').textContent()).includes('2/9'));
    // Layout at three widths.
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({width, height: 900});
      const geo = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, inner: innerWidth}));
      assert(geo.scroll <= geo.inner, JSON.stringify({width, ...geo}));
      const budget = await page.locator('#preset').evaluate(e => { const s = getComputedStyle(e), ctx = document.createElement('canvas').getContext('2d'); ctx.font = s.font; return {width: e.clientWidth, needed: Math.max(...[...e.options].map(o => ctx.measureText(o.textContent).width)) + parseFloat(s.paddingLeft) + parseFloat(s.paddingRight) + 24}; });
      assert(budget.width >= budget.needed, JSON.stringify({lang, width, budget}));
      const small = await page.locator('button:visible, select:visible, summary:visible, .step-nav a, .related a, .back-link, .official-link, #download, .prediction-options label, input:visible:not([type=radio])').evaluateAll(es => es.map(e => ({t: (e.textContent || e.id).trim().slice(0, 30), h: e.getBoundingClientRect().height})).filter(x => x.h < 48));
      assert.deepStrictEqual(small, [], JSON.stringify({width, small}));
      for (const id of ['step0', 'step1', 'step2', 'step3', 'step4', 'step5']) {
        await page.locator('#' + id).scrollIntoViewIfNeeded();
        await page.screenshot({path: path.join(OUT, `${lang}-${width}-${id}.png`)});
      }
      report.layout.push({lang, width, ...geo});
    }
    await page.setViewportSize({width: 1280, height: 900});
  }
  // Reduced motion: no smooth scrolling.
  assert.strictEqual(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  // Blocked storage and offline source.
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', {get() { throw Error('blocked'); }}));
  const p2 = await blocked.newPage(); await p2.goto(URL); await p2.locator('#next').click(); await p2.locator('[data-lang=zh]').click();
  assert((await p2.locator('#progress').textContent()).includes('1/9'));
  await blocked.setOffline(true); assert.strictEqual(await p2.locator('#code').textContent(), source);
  await blocked.close();
  assert.deepStrictEqual(errors, []); assert.deepStrictEqual(bad, []); assert.deepStrictEqual(external, []);
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(JSON.stringify({presets: report.presets.length, custom: report.custom.length, prediction: report.prediction.length, layout: report.layout.length, errors: errors.length}));
})().catch(e => { console.error(e); process.exit(1); });
