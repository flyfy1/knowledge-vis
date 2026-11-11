// Review browser test (Claude Code, 2026-11-11). PREVIEW_ROOT (site root) defaults to http://127.0.0.1:18770.
const {chromium} = require('playwright'), assert = require('assert');
const URL = (process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1159/';
(async () => {
  const browser = await chromium.launch({headless: true}), log = [];
  for (const lang of ['en', 'zh']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'}), page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(URL); await page.click(`[data-lang=${lang}]`);
    // step 1: user 3 unsorted second row is Kiwi, sorted is Nova; users 2, 4 give no
    assert(/Kiwi/.test(await page.locator('#handText').innerText()));
    await page.locator('#sortBtn').focus(); await page.keyboard.press('Enter');
    assert(/Nova/.test(await page.locator('#handText').innerText()) && /yes/.test(await page.locator('#handText').innerText()));
    for (const u of [1, 2, 4]) { await page.locator('#userButtons button').nth(u - 1).click(); if (await page.locator('#sortBtn').isEnabled()) await page.click('#sortBtn'); }
    assert.equal(await page.locator('#handLedger').innerText().then(s => (s.match(/\d: (yes|no)/g) || []).join(',')), '1: yes,2: no,3: yes,4: no');
    // step 3: all 8 variants on both presets; only the correct one matches
    for (let p = 0; p < 2; p++) {
      await page.selectOption('#preset', String(p));
      for (const order of ['date', 'id']) for (const join of ['left', 'inner']) for (const filter of ['on', 'where']) {
        await page.check(`input[name=order][value=${order}]`); await page.check(`input[name=join][value=${join}]`); await page.check(`input[name=filter][value=${filter}]`);
        assert(await page.locator('#prev').isDisabled());
        while (await page.locator('#next').isEnabled()) await page.click('#next');
        const ok = await page.locator('#verdict').evaluate(e => e.classList.contains('correct'));
        log.push({lang, p, order, join, filter, ok});
        if (order === 'date' && join === 'left' && filter === 'on') assert(ok);
        if (p === 0 && !(order === 'date' && join === 'left' && filter === 'on')) assert(!ok, JSON.stringify({order, join, filter}));
      }
    }
    // favourite brand edit follows into the result
    await page.selectOption('#preset', '0'); await page.check('input[name=order][value=date]'); await page.check('input[name=join][value=left]'); await page.check('input[name=filter][value=on]');
    await page.locator('#favs select').nth(2).selectOption('Kiwi'); await page.click('#end');
    assert.equal(await page.locator('#outputRows tr').nth(2).innerText().then(s => s.replace(/\s+/g, ' ')), '3 no');
    assert(await page.locator('#verdict').evaluate(e => e.classList.contains('correct')));
    // step 4
    await page.check('input[name=prediction][value="0"]'); await page.click('#reveal'); const w = await page.locator('#feedback').innerText();
    await page.check('input[name=prediction][value="2"]'); assert.notEqual(await page.locator('#feedback').innerText(), w); await page.click('#reveal');
    assert(/Correct|正确/.test(await page.locator('#feedback').innerText()));
    // step 5
    await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', {value: {writeText: () => Promise.reject(new Error('denied'))}}); });
    await page.click('#copy'); assert(await page.locator('#manualCopy').isVisible());
    assert.equal(await page.locator('#fallbackSource').inputValue(), await page.evaluate(() => window.SQL_SOURCE));
    assert.deepStrictEqual(errors, []); await ctx.close();
  }
  await browser.close(); console.log('browser: both locales pass;', log.filter(x => x.ok).length, 'matching variant runs of', log.length);
})().catch(e => { console.error(e); process.exit(1); });
