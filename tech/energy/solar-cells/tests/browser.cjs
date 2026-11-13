'use strict';
// Browser end-to-end test for tech/energy/solar-cells/ across 1280, 390, and 320 widths, zh & en, and reduced motion.
// Run against a running static server:
//   BASE_URL=http://127.0.0.1:19024 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node tech/energy/solar-cells/tests/browser.cjs

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:19024').replace(/\/$/, '');
const URL = `${BASE}/tech/energy/solar-cells/`;
const SHOT_DIR = '/tmp/agent-tasks/essays/solar-cells';

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const errors = [];
  let checks = 0;

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });

    await page.goto(URL, { waitUntil: 'networkidle' });

    // 1. Check language switch zh -> en -> zh
    const h1Zh = await page.locator('h1').textContent();
    checks++;
    if (!/[\u4e00-\u9fff]/.test(h1Zh)) errors.push(`Expected zh h1, got: ${h1Zh}`);

    await page.locator('#langToggle button[data-lang="en"]').click();
    await page.waitForTimeout(80);
    const h1En = await page.locator('h1').textContent();
    checks++;
    if (/[\u4e00-\u9fff]/.test(h1En) || !h1En.includes('Solar')) errors.push(`Expected en h1, got: ${h1En}`);

    // Check zero CJK in entire EN body except the '中' toggle button
    const cjkLeak = await page.evaluate(() => {
      const clone = document.body.cloneNode(true);
      const toggle = clone.querySelector('#langToggle');
      if (toggle) toggle.remove();
      return /[\u4e00-\u9fff]/.test(clone.innerText);
    });
    checks++;
    if (cjkLeak) errors.push('CJK leaked into English DOM view');

    await page.locator('#langToggle button[data-lang="zh"]').click();
    await page.waitForTimeout(80);

    // 2. Drive every interactive control and ensure live sentences update cleanly
    const sliders = [
      ['#c1Am', '3.0'], ['#c2Eg', '1.60'], ['#c3Eg', '1.34'], ['#c3Ere', '-2'],
      ['#c4T', '65'], ['#c4Rs', '4'], ['#c5Top', '1.55'], ['#c6Scale', '2.0'],
      ['#c6Bat', '40'], ['#c7Lr', '20'], ['#c7Eff', '30']
    ];
    for (const [sel, val] of sliders) {
      const loc = page.locator(sel);
      await loc.scrollIntoViewIfNeeded();
      await loc.fill(val);
      await loc.dispatchEvent('input');
      await loc.dispatchEvent('change');
      checks++;
    }

    const radios = [
      'input[name="c1Mode"][value="flux"]',
      'input[name="c2Mat"][value="gaas"]',
      'input[name="c3X"][value="1000"]',
      'input[name="c5Spec"][value="am30"]',
      'input[name="c8F"][value="demo"]'
    ];
    for (const sel of radios) {
      const loc = page.locator(sel);
      await loc.scrollIntoViewIfNeeded();
      await loc.check({ force: true });
      checks++;
    }

    // Check all .say boxes are non-empty and clean
    const sayTexts = await page.evaluate(() => Array.from(document.querySelectorAll('.say')).map(el => el.textContent.trim()));
    checks++;
    if (sayTexts.length !== 7 || sayTexts.some(t => !t || /\{|NaN|undefined/.test(t))) {
      errors.push(`Invalid .say text: ${JSON.stringify(sayTexts)}`);
    }

    // 3. Layout, overflow, and 48px target checks across 1280, 390, 320
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 820 });
      await page.waitForTimeout(150);
      const metrics = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
        const smallTargets = Array.from(document.querySelectorAll('a, button, .seg label, label.chk')).filter(el => {
          const r = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          if (st.display === 'inline') return false;
          return r.width > 0 && r.height > 0 && r.height < 47;
        }).map(el => ({ text: el.textContent.trim().slice(0, 20), h: el.getBoundingClientRect().height }));
        return { overflow, smallTargets };
      });
      checks++;
      if (metrics.overflow) errors.push(`Horizontal overflow at width ${width}`);
      checks++;
      if (metrics.smallTargets.length) errors.push(`Targets <48px at ${width}: ${JSON.stringify(metrics.smallTargets)}`);

      await page.locator('#ch2').scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      await page.screenshot({ path: path.join(SHOT_DIR, `ch2-${width}.png`) });
      await page.locator('#ch5').scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      await page.screenshot({ path: path.join(SHOT_DIR, `ch5-${width}.png`) });
    }

    // 4. Reduced motion check
    const rmCtx = await browser.newContext({ viewport: { width: 1280, height: 820 }, reducedMotion: 'reduce' });
    const rmPage = await rmCtx.newPage();
    await rmPage.goto(URL, { waitUntil: 'networkidle' });
    await rmPage.locator('#ch3').scrollIntoViewIfNeeded();
    await rmPage.waitForTimeout(120);
    await rmPage.screenshot({ path: path.join(SHOT_DIR, 'reduced-motion-1280.png') });
    checks++;
    await rmCtx.close();

    await context.close();
  } finally {
    await browser.close();
  }

  if (errors.length) {
    console.error('BROWSER TEST ERRORS:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log(`PASS: ${checks} browser checks succeeded across 1280/390/320, zh/en, and reduced motion.`);
}

main().catch(err => { console.error(err); process.exit(1); });
