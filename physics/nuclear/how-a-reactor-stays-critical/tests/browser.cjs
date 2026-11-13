'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = process.env.REACTOR_TEST_URL || 'http://127.0.0.1:19022/';
const OUT = '/tmp/agent-tasks/essays/how-a-reactor-stays-critical';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const widths = [1280, 390, 320];
  let checks = 0;

  for (const w of widths) {
    const context = await browser.newContext({ viewport: { width: w, height: 820 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(BASE + 'physics/nuclear/how-a-reactor-stays-critical/', { waitUntil: 'networkidle' });
    // Scroll through every lab so IntersectionObserver draws all 8 canvases
    for (let i = 1; i <= 8; i++) {
      await page.locator(`#lab${i}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert.equal(overflow, false, `No horizontal overflow at ${w}px`);
    checks++;

    const drawnCount = await page.evaluate(() => [...document.querySelectorAll('canvas')].filter(c => c.dataset.drawn === '1').length);
    assert.equal(drawnCount, 8, `All 8 canvases drawn at ${w}px`);
    checks++;

    await page.screenshot({ path: path.join(OUT, `hero-${w}.png`), fullPage: false });
    await page.locator('#lab4').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(OUT, `lab4-${w}.png`) });

    if (w === 1280) {
      // Test EN toggle + zero stray CJK
      await page.locator('#langToggle button[data-lang="en"]').click();
      await page.waitForTimeout(120);
      const enText = await page.evaluate(() => document.body.innerText.replace('中', ''));
      assert.equal(/[\u4e00-\u9fff]/.test(enText), false, 'Zero stray CJK after switching to EN');
      checks++;
      await page.screenshot({ path: path.join(OUT, 'en-lab4-1280.png') });
    }

    assert.deepEqual(errors, [], `Console/page errors at ${w}px: ${errors.join('; ')}`);
    checks++;
    await context.close();
  }

  await browser.close();
  console.log(`PASS: ${checks} browser smoke checks across 1280/390/320`);
})();
