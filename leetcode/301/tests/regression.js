const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  for (const lang of ['en', 'zh']) {
    const page = await browser.newPage({viewport: {width: 390, height: 900}});
    await page.goto('http://127.0.0.1:18770/leetcode/301/');
    await page.waitForLoadState('networkidle');
    await page.locator(`[data-lang="${lang}"]`).click();
    await page.locator('#preset').selectOption('3');
    await page.locator('input[name=prediction][value="0"]').check();
    await page.locator('#reveal').click();
    const wrong = await page.locator('#feedback').innerText();
    if (!wrong.includes(lang === 'en' ? 'Recount unmatched' : '再数')) throw new Error(`${lang}: wrong prediction was not rejected`);
    await page.locator('input[name=prediction][value="1"]').check();
    await page.locator('#reveal').click();
    const right = await page.locator('#feedback').innerText();
    if (!right.includes(lang === 'en' ? 'Correct.' : '正确')) throw new Error(`${lang}: option B was not accepted`);
    if (!right.includes('0') || !right.includes('((a)())')) throw new Error(`${lang}: zero-deletion explanation missing`);
    const mapping = await page.locator('[data-i18n="map2"]').innerText();
    if (mapping.includes('dfs(') || !mapping.includes('remove(')) throw new Error(`${lang}: stale source mapping`);
    await page.close();
  }
  const source = fs.readFileSync(path.join(__dirname, '..', 'solution.py'), 'utf8');
  const displayed = await (async () => {
    const p = await browser.newPage(); await p.goto('http://127.0.0.1:18770/leetcode/301/'); await p.waitForLoadState('networkidle');
    const text = await p.locator('#pythonCode').textContent(); await p.close(); return text;
  })();
  if (source !== displayed) throw new Error('displayed source differs from solution.py');
  await browser.close();
  console.log('regression ok: quiz, locales, mapping, and source parity');
})();
