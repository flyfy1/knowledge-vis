'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:18770';
const out = process.env.OUTPUT_DIR || 'leetcode/239/tests/evidence/title-repair-20261025';
const source = fs.readFileSync('leetcode/239/solution.py', 'utf8');
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const mirror = {window: {}};
  vm.runInNewContext(fs.readFileSync('leetcode/239/python-code.js', 'utf8'), mirror);
  assert.equal(mirror.window.PYTHON_SOURCE, source);
  const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const results = [];
  try {
    for (const width of [320, 390, 736, 1440]) {
      const context = await browser.newContext({viewport: {width, height: 900}, permissions: ['clipboard-read', 'clipboard-write']});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => {if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
      await page.goto(`${base}/leetcode/239/`, {waitUntil: 'networkidle'});
      await page.waitForFunction(() => document.querySelector('#progress').textContent.length > 0);
      await page.click('#wnext');
      await page.selectOption('#preset', '1');
      await page.click('#next');
      await page.click('#next');
      await page.check('input[name="pred"][value="1"]');
      await page.click('#reveal');
      const snapshot = async () => page.evaluate(() => ({
        progress: document.querySelector('#progress').textContent.match(/\[.*\]/)?.[0] || '',
        deque: document.querySelector('#dequeReadout').textContent,
        preset: document.querySelector('#preset').value,
        choice: document.querySelector('[name=pred]:checked').value,
        revealed: !document.querySelector('#feedback').hidden,
        window: document.querySelector('#winReadout').textContent.split(': ')[1]
      }));
      const before = await snapshot();
      for (const lang of ['zh', 'en', 'zh']) {
        await page.click(`[data-lang="${lang}"]`);
        await page.waitForTimeout(250);
        const expected = lang === 'zh' ? '#239 · 滑动窗口最大值' : '#239 · Sliding Window Maximum';
        assert.equal(await page.locator('h1').textContent(), expected, `239-PUB-R1 ${lang}/${width}`);
        assert.equal(await page.locator('.official-link').getAttribute('href'), 'https://leetcode.com/problems/sliding-window-maximum/');
        assert.equal(await page.locator('html').getAttribute('lang'), lang === 'zh' ? 'zh-CN' : 'en');
        assert.deepEqual(await snapshot(), before, 'locale must preserve lesson state');
        assert.equal(await page.locator('#sourceCode').textContent(), source);
        assert.match(await page.locator('.formula').first().textContent(), /\[1, 3, -1\] → 3/);
        assert.equal(await page.locator('#dequeReadout').textContent(), '0:9  →  1:1');
        assert.match(await page.locator('#feedback').textContent(), lang === 'zh' ? /预测正确/ : /Correct\./);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow');
        assert.ok(await page.locator('h1').evaluate(el => {
          const r = el.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(el);
          const text = range.getBoundingClientRect();
          const style = getComputedStyle(el);
          return r.left >= 0 && r.right <= innerWidth && text.left >= 0 && text.right <= innerWidth &&
            style.overflow === 'visible' && style.textOverflow !== 'ellipsis';
        }), 'heading must fit');
        await page.screenshot({path: `${out}/${lang}-${width}.png`, fullPage: false});
        results.push({width, lang, h1: expected, officialLink: 'exact', state: before, source: 'exact'});
      }
      await page.click('#next');
      const forward = await snapshot();
      assert.equal(forward.deque, '2:2');
      assert.equal(forward.progress, '[9, 2]');
      await page.click('#prev');
      assert.deepEqual(await snapshot(), before);
      await page.click('#next');
      assert.deepEqual(await snapshot(), forward);
      await page.click('#end');
      assert.match(await page.locator('#progress').textContent(), /\[9, 2, 3\]/);
      await page.check('input[name="pred"][value="0"]');
      assert.equal(await page.locator('#feedback').isHidden(), true);
      // The prediction has its own fixed input; trace preset changes do not reset it.
      await page.selectOption('#preset', '3');
      assert.equal(await page.locator('input[name="pred"][value="0"]').isChecked(), true);
      const [download] = await Promise.all([page.waitForEvent('download'), page.locator('a[download]').click()]);
      assert.deepEqual(fs.readFileSync(await download.path()), Buffer.from(source));
      await page.click('#copy');
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source);
      // Distinct sentinel plus native host shortcut proves manual transfer, not just DOM selection.
      await page.evaluate(async () => {
        await navigator.clipboard.writeText('239-fallback-sentinel');
        Object.defineProperty(navigator.clipboard, 'writeText', {configurable: true, value: async () => {throw Error('forced clipboard denial');}});
      });
      await page.click('#copy');
      assert.deepEqual(await page.locator('#sourceText').evaluate(el => [document.activeElement === el, el.selectionStart, el.selectionEnd, el.value]), [true, 0, source.length, source]);
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+c' : 'Control+c');
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source);
      assert.deepEqual(errors, []);
      await context.close();
    }
    // File opening uses the exact offline mirror without a fetch dependency.
    const offline = await browser.newPage();
    await offline.goto(`file://${path.resolve('leetcode/239/index.html')}`);
    assert.equal(await offline.locator('#sourceCode').textContent(), source);
    await offline.close();
    fs.writeFileSync(`${out}/results.json`, JSON.stringify({base, hostPlatform: process.platform, browser: browser.version(), results, exactSourceTransfer: ['mirror', 'rendered', 'clipboard', 'native fallback', 'download', 'offline'], errors: []}, null, 2) + '\n');
    console.log('239-PUB-R1: rendered headings, links, state, and exact sources passed at all widths/locales');
  } finally {await browser.close();}
})().catch(e => {console.error(e); process.exitCode = 1;});
