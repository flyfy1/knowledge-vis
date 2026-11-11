// Review browser test (Claude Code, 2026-11-11). PREVIEW_ROOT (site root) defaults to http://127.0.0.1:18770.
const {chromium} = require('playwright'), assert = require('assert');
const URL = (process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1192/';
(async () => {
  const browser = await chromium.launch({headless: true}), log = [];
  for (const lang of ['en', 'zh']) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 900}, reducedMotion: 'reduce'}), page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(URL); await page.click(`[data-lang=${lang}]`);
    // step 1: cut every cable; exactly 1–3 and 5–6 isolate servers
    const n = await page.locator('#cutButtons button').count(); assert.equal(n, 8);
    const critical = [];
    for (let i = 0; i < n; i++) { await page.locator('#cutButtons button').nth(i).click(); if (await page.locator('#cutGraph .node.lost').count()) critical.push(await page.locator('#cutButtons button').nth(i).innerText()); }
    assert.equal(await page.locator('#cutLedger tr').count(), 8);
    assert.deepStrictEqual(critical.map(s => s.replace(/\D+/g, '')), ['13', '56']);
    // step 2: both back edges highlight their loop
    for (let i = 0; i < 2; i++) { await page.locator('#coverButtons button').nth(i).click(); assert.equal(await page.locator('#coverGraph .edge.covered').count(), 2); }
    // step 3: full trace on every preset, forward/back identity, keyboard
    for (let p = 0; p < 3; p++) {
      await page.selectOption('#preset', String(p)); assert(await page.locator('#prev').isDisabled());
      const first = await page.locator('#tinTable').innerText();
      await page.locator('#next').focus(); await page.keyboard.press('Enter'); const one = await page.locator('#tinTable').innerText();
      await page.click('#prev'); assert.equal(await page.locator('#tinTable').innerText(), first); await page.click('#next'); assert.equal(await page.locator('#tinTable').innerText(), one);
      let steps = 1; while (await page.locator('#next').isEnabled()) { await page.click('#next'); steps++; }
      const prog = await page.locator('#progress').innerText(); log.push({lang, p, steps, prog});
      assert.equal(await page.locator('#history li').count(), steps);
    }
    assert((await page.locator('#progress').innerText()).includes('2–4') && (await page.locator('#progress').innerText()).includes('4–5'));
    // edit: add cable 2–5 to the square preset -> 4–5 no longer critical, trace restarted
    await page.locator('#editButtons button', {hasText: '2–5'}).click(); assert(await page.locator('#prev').isDisabled());
    await page.click('#end'); assert(!(await page.locator('#progress').innerText()).includes('4–5'));
    // language switch keeps position
    const before = await page.locator('#progress').innerText(); await page.click(`[data-lang=${lang === 'en' ? 'zh' : 'en'}]`); await page.click(`[data-lang=${lang}]`); assert.equal(await page.locator('#progress').innerText(), before);
    // step 4: predict, reveal, change clears
    assert(await page.locator('#reveal').isDisabled());
    await page.check('input[name=prediction][value="0"]'); await page.click('#reveal'); const wrong = await page.locator('#feedback').innerText();
    await page.check('input[name=prediction][value="1"]'); assert.notEqual(await page.locator('#feedback').innerText(), wrong); await page.click('#reveal');
    assert(/Correct|正确/.test(await page.locator('#feedback').innerText())); assert.equal(await page.locator('#predictGraph .node-sub').count(), 5);
    // step 5: copy without clipboard permission -> manual fallback with exact source
    await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', {value: {writeText: () => Promise.reject(new Error('denied'))}}); });
    await page.click('#copy'); assert(await page.locator('#manualCopy').isVisible());
    assert.equal(await page.locator('#fallbackSource').inputValue(), await page.evaluate(() => window.PYTHON_SOURCE));
    assert.deepStrictEqual(errors, []); await ctx.close();
  }
  await browser.close(); console.log('browser: both locales pass', JSON.stringify(log));
})().catch(e => { console.error(e); process.exit(1); });
