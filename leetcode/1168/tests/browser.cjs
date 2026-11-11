// Review browser test (Claude Code, 2026-11-11). PREVIEW_ROOT (site root) defaults to http://127.0.0.1:18770.
const {chromium} = require('playwright'), assert = require('assert');
const URL = (process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1168/';
(async () => {
  const browser = await chromium.launch({headless: true}), log = [];
  for (const lang of ['en', 'zh']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'}), page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(URL); await page.click(`[data-lang=${lang}]`);
    // step 1: greedy-looking pipes only -> nobody has water; then the optimum
    const btn = i => page.locator('#planButtons button').nth(i);
    await btn(3).click(); await btn(4).click();
    assert.equal(await page.locator('#planGraph .house.wet').count(), 0);
    await btn(1).focus(); await page.keyboard.press('Enter');            // well at 2, by keyboard
    assert.equal(await page.locator('#planGraph .house.wet').count(), 3);
    assert(/4/.test(await page.locator('#bestText').innerText()));
    // step 2: redraw shows W and the well edge
    await page.click('#redraw'); assert.equal(await page.locator('#redrawGraph .source').count(), 1);
    assert.equal(await page.locator('#redrawGraph .edge.well.laid').count(), 1);
    // step 3: each preset to the end matches brute force; back/forward identity
    for (let p = 0; p < 3; p++) {
      await page.selectOption('#preset', String(p));
      const first = await page.locator('#edgeList').innerText(); await page.click('#next'); const one = await page.locator('#edgeList').innerText();
      await page.click('#prev'); assert.equal(await page.locator('#edgeList').innerText(), first); await page.click('#next'); assert.equal(await page.locator('#edgeList').innerText(), one);
      while (await page.locator('#next').isEnabled()) await page.click('#next');
      const check = await page.locator('#check').innerText(); assert(!/mismatch|不一致/.test(check) && check.length > 0, check); log.push({lang, p, check});
    }
    // edit a price: preset 0, well 2 -> 0 ; result stays brute-force-consistent and the trace restarts
    await page.selectOption('#preset', '0');
    const inp = page.locator('#editors input').nth(1); await inp.fill('9'); await inp.dispatchEvent('change');
    assert(await page.locator('#prev').isDisabled()); await page.click('#end');
    assert(/total 6|总价 6/.test(await page.locator('#progress').innerText()), await page.locator('#progress').innerText());
    // language switch preserves position
    const before = await page.locator('#progress').innerText(); await page.click(`[data-lang=${lang === 'en' ? 'zh' : 'en'}]`); await page.click(`[data-lang=${lang}]`); assert.equal(await page.locator('#progress').innerText(), before);
    // step 4
    assert(await page.locator('#reveal').isDisabled());
    await page.check('input[name=prediction][value="0"]'); await page.click('#reveal'); assert(/13/.test(await page.locator('#feedback').innerText()));
    await page.check('input[name=prediction][value="1"]'); assert(!/13/.test(await page.locator('#feedback').innerText()));
    await page.click('#reveal'); assert(/Correct|正确/.test(await page.locator('#feedback').innerText()));
    assert.equal(await page.locator('#predictGraph .edge.laid').count(), 4);
    // step 5: copy fallback
    await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', {value: {writeText: () => Promise.reject(new Error('denied'))}}); });
    await page.click('#copy'); assert(await page.locator('#manualCopy').isVisible());
    assert.equal(await page.locator('#fallbackSource').inputValue(), await page.evaluate(() => window.PYTHON_SOURCE));
    assert.deepStrictEqual(errors, []); await ctx.close();
  }
  await browser.close(); console.log('browser: both locales pass', JSON.stringify(log));
})().catch(e => { console.error(e); process.exit(1); });
