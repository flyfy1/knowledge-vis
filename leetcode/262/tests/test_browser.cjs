const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const out = process.env.OUTPUT_DIR || '/tmp/lesson262';
  fs.mkdirSync(out, {recursive:true});
  const source = fs.readFileSync(path.join(__dirname, '../solution.py'), 'utf8');
  const mirror = fs.readFileSync(path.join(__dirname, '../python-code.js'), 'utf8');
  assert.equal(JSON.parse(mirror.match(/window\.PYTHON_SOURCE\s*=\s*("(?:[^"\\]|\\.)*")\s*;?\s*$/)[1]), source);
  const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const context = await browser.newContext({viewport:{width:390,height:900}, locale:'en-US', permissions:['clipboard-read','clipboard-write']});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function identity(lang) {
    const title = lang === 'zh' ? '#262 · 行程与用户' : '#262 · Trips and Users';
    assert.equal(await page.locator('h1').textContent(), title);
    assert.equal(await page.title(), title);
    assert.equal(await page.locator('html').getAttribute('lang'), lang === 'zh' ? 'zh-CN' : 'en');
    assert.equal(await page.locator(`[data-lang="${lang}"]`).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.official-link').getAttribute('href'), 'https://leetcode.com/problems/trips-and-users/');
  }
  async function language(lang) {
    await page.click(`[data-lang="${lang}"]`);
    await identity(lang);
  }
  async function traceState() {
    return page.evaluate(() => ({
      preset:document.querySelector('#preset').value,
      current:document.querySelector('tr.current th')?.textContent || null,
      rates:[...document.querySelectorAll('#rows tr')].map(r => r.lastChild.textContent),
      totals:[...document.querySelectorAll('.daily-card')].map(r => r.textContent.match(/\d+(?:\.\d+)?/g)),
      selection:document.querySelector('input:checked')?.value || null,
      revealed:!document.querySelector('#feedback').hidden
    }));
  }
  try {
    await page.goto('http://127.0.0.1:18770/leetcode/262/?test=1', {waitUntil:'networkidle'});
    // Exact localized identities catch the former Chinese-is-English false positive.
    await language('zh');
    await language('en');
    const englishIntro = await page.locator('#step0').textContent();
    assert(englishIntro.includes('2013-10-01') && englishIntro.includes('1 ÷ 3 = 0.33') && englishIntro.includes('Day and Cancellation Rate'));
    await language('zh');
    const chineseIntro = await page.locator('#step0').textContent();
    assert(chineseIntro.includes('1 ÷ 3 = 0.33') && chineseIntro.includes('Day 和 Cancellation Rate'));
    for (let i=0; i<10; i++) await page.click('#next');
    assert.equal(await page.locator('.daily-card').count(), 3);
    assert.deepEqual(await page.locator('.daily-card b').allTextContents(), ['当前率: 0.33','当前率: 0.00','当前率: 0.50']);
    assert(await page.locator('#next').isDisabled());
    await page.click('#prev');
    assert((await page.locator('.daily-card').last().textContent()).includes('0.00'));
    await page.click('#next');
    await page.click('#reset');
    assert.equal(await page.locator('.daily-card').count(), 0);
    await page.click('input[value="0"]');
    await page.click('#reveal');
    assert((await page.locator('#feedback').textContent()).includes('正确'));
    await page.click('input[value="1"]');
    assert(await page.locator('#feedback').isHidden());
    await page.click('#reveal');
    assert((await page.locator('#feedback').textContent()).includes('再看资格条件'));
    await page.selectOption('#preset', '1');
    await page.click('#next');
    await page.click('#next');
    // Banned driver contributes nothing: one completed request gives 0 / 1.
    assert((await page.locator('.daily-card').textContent()).includes('0.00'));
    const before = await traceState();
    for (const width of [320,390,736,1440]) {
      await page.setViewportSize({width,height:900});
      for (const lang of ['en','zh','en']) {
        await language(lang);
        assert.deepEqual(await traceState(), before, 'locale switch reset teaching state');
        assert.equal(await page.locator('#step3 [data-i18n="quiz"]').count(), 1);
        assert((await page.locator('#feedback').textContent()).includes(lang === 'zh' ? '再看资格条件' : 'Check the eligibility rule again:'));
        assert.equal(await page.locator('.formula').textContent(), 'eligible row → denominator += 1cancelled row → numerator += 1rate = numerator / denominator');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow');
        await page.evaluate(() => scrollTo(0,0));
        assert(await page.locator('h1').evaluate(el => {
          const range=document.createRange();
          range.selectNodeContents(el);
          return [...range.getClientRects()].every(r => r.left>=0 && r.right<=innerWidth) && getComputedStyle(el).overflow==='visible';
        }), 'heading clipped');
        await page.screenshot({path:path.join(out, `${lang}-${width}-title.png`)});
      }
    }
    for (const lang of ['zh','en']) {
      await language(lang);
      assert.equal(await page.locator('#pythonCode').textContent(), source);
      await page.click('#copy');
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source);
      const downloadEvent = page.waitForEvent('download');
      await page.locator('a[download]').click();
      const download = await downloadEvent;
      assert.deepEqual(fs.readFileSync(await download.path()), Buffer.from(source));
      await page.evaluate(async () => {
        await navigator.clipboard.writeText('262-fallback-sentinel');
        Object.defineProperty(navigator.clipboard, 'writeText', {configurable:true, value:async () => {throw new Error('forced clipboard rejection');}});
      });
      await page.click('#copy');
      assert(await page.locator('#manualCopy').isVisible());
      assert.equal(await page.locator('#copyText').inputValue(), source);
      assert(await page.locator('#copyText').evaluate(el => document.activeElement===el && el.selectionStart===0 && el.selectionEnd===el.value.length));
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+c' : 'Control+c');
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source);
      await page.evaluate(() => delete navigator.clipboard.writeText);
    }
    await context.setOffline(true);
    assert.equal(await page.locator('#pythonCode').textContent(), source);
    assert.deepEqual(errors, []);
    console.log('browser checks passed: localized identity, retained state, trace, prediction, layout, exact source/copy/fallback/download; host=' + process.platform);
  } catch (error) {
    await page.screenshot({path:path.join(out, 'failure.png'), fullPage:true});
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error);process.exitCode=1;});
