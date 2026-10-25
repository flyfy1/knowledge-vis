'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:18770';
const out = process.env.OUTPUT_DIR || 'leetcode/239/tests/evidence/navigation-repair-20261025/green';
const targets = [
  {id: 84, href: '../84/#step1', key: 'rel0', labels: {
    en: '#84 · Monotonic stack: settle rectangle boundaries', zh: '#84 · 单调栈：确定矩形边界'
  }, concept: '[data-i18n="stackIntro"]', expected: {
    en: 'Stack indices increase and their heights never decrease (ties are allowed): a monotonic stack.',
    zh: '栈中下标递增，对应高度不下降（允许相等），这就是单调栈。'
  }, mechanism: '[data-i18n="widthRule"]', formula: 'i−left−1'},
  {id: 327, href: '../327/#step1', key: 'rel1', labels: {
    en: '#327 · Prefix sums: subtract to obtain a range sum', zh: '#327 · 前缀和：相减得到区间和'
  }, concept: '[data-i18n="s1e"]', expected: {
    en: 'subtract the first i elements, leaving i through j−1.',
    zh: '减去前 i 个，剩下 i 到 j−1。'
  }, mechanism: '[data-i18n="s1e"]', formula: 'P[j]−P[i]'}
];
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const results = [], errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 320, height: 900}});
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => {if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
    await page.goto(`${base}/leetcode/`);
    for (const target of targets) {
      assert.ok(await page.locator(`a[href="${target.id}/"]`).count(), `#${target.id} must be in served collection`);
    }
    for (const lang of ['zh', 'en', 'zh']) {
      await page.goto(`${base}/leetcode/239/`);
      await page.waitForFunction(() => document.querySelector('#progress').textContent.length);
      await page.click(`[data-lang="${lang}"]`);
      assert.equal(await page.locator('.related a').count(), 2);
      for (const target of targets) {
        const link = page.locator(`[data-i18n="${target.key}"]`);
        assert.equal(await link.textContent(), target.labels[lang], `239-NAV-R1 ${lang} label`);
        assert.equal(await link.getAttribute('href'), target.href, `239-NAV-R1 ${lang} href`);
        await link.focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        assert.equal(await link.evaluate(el => document.activeElement === el), true);
        await link.scrollIntoViewIfNeeded();
        // Shared smooth scrolling must settle before recording viewport evidence.
        await page.waitForTimeout(600);
        const geometry = await link.evaluate(el => {
          const rect = el.getBoundingClientRect(), range = document.createRange();
          range.selectNodeContents(el);
          const text = [...range.getClientRects()].map(r => ({left: r.left, right: r.right, top: r.top, bottom: r.bottom}));
          const css = getComputedStyle(el);
          return {left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, text,
            overflow: css.overflow, fontSize: css.fontSize, outline: css.outlineStyle,
            pageFits: document.documentElement.scrollWidth <= innerWidth};
        });
        assert.ok(geometry.pageFits && geometry.left >= 0 && geometry.right <= 320);
        assert.ok(geometry.top >= 0 && geometry.bottom <= 900, 'focused link must be on screen');
        assert.equal(geometry.overflow, 'visible');
        assert.notEqual(geometry.outline, 'none');
        assert.ok(geometry.text.every(r => r.left >= geometry.left - 1 && r.right <= geometry.right + 1 && r.top >= geometry.top - 1 && r.bottom <= geometry.bottom + 1), 'entire label wraps inside link');
        await page.screenshot({path: `${out}/${lang}-${target.id}-focused.png`});
        await Promise.all([page.waitForURL(`${base}/leetcode/${target.id}/#step1`), page.keyboard.press('Enter')]);
        assert.equal(new URL(page.url()).pathname, `/leetcode/${target.id}/`);
        assert.equal(new URL(page.url()).hash, '#step1');
        await page.waitForFunction(() => document.querySelector('#step1 h2').textContent.length);
        assert.equal(await page.locator('html').getAttribute('lang'), lang === 'zh' ? 'zh-CN' : 'en');
        const concept = page.locator(`#step1 ${target.concept}`);
        assert.equal(await concept.isVisible(), true);
        assert.ok((await concept.textContent()).includes(target.expected[lang]), 'destination must explain promised concept');
        assert.ok((await page.locator(`#step1 ${target.mechanism}`).textContent()).includes(target.formula));
        await concept.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await page.screenshot({path: `${out}/${lang}-${target.id}-destination.png`});
        results.push({lang, id: target.id, label: target.labels[lang], url: page.url(), concept: await concept.textContent(), formula: target.formula, geometry, activation: 'native Tab focus and Enter'});
        await page.goBack();
        await page.waitForFunction(() => document.querySelector('#progress').textContent.length);
      }
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(`${out}/results.json`, JSON.stringify({finding: '239-NAV-R1', base, browser: browser.version(), host: process.platform, width: 320, results, errors}, null, 2) + '\n');
    console.log('239-NAV-R1: bilingual labels, targets, collection, keyboard activation, visible destination concepts and narrow wrapping passed');
  } finally {await browser.close();}
})().catch(e => {console.error(e); process.exitCode = 1;});
