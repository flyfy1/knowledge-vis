'use strict';
// Homepage site search finds atlas concepts (specs/index-pagination.md, specs/atlas-search-index.md).
//   NODE_PATH=~/Documents/integ-life/integ-games/node_modules HOME_TEST_URL=http://127.0.0.1:18890/ node tests/home-concept-search.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.HOME_TEST_URL || 'http://127.0.0.1:18776/';
let checks = 0; const ok = (v, m) => { assert.ok(v, m); checks++; };
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const errors = [];
  try {
    for (const [locale, lang] of [['zh-CN', 'zh'], ['en-US', 'en']]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 900 }, locale });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(String(e)));
      const lazy = [];
      page.on('request', r => { if (/search\/(manifest|concept-search)\.js|search\/chunks\//.test(r.url())) lazy.push(r.url()); });
      await page.goto(base);
      ok(lazy.length === 0, `${lang}: first paint does not load the concept index`);
      await page.locator('#siteSearch').focus();
      await page.waitForFunction(() => window.KNOWLEDGE_CONCEPTS && window.ConceptSearch && window.KNOWLEDGE_CONCEPTS.concepts.length > 0);
      ok(lazy.some(u => u.includes('search/concept-search.js')) && lazy.some(u => u.includes('search/manifest.js')) && lazy.some(u => u.includes('search/chunks/')), `${lang}: focus loads matcher + manifest + chunks`);

      // A layperson's word that only an alias knows: "利息"/"interest" is in no page title.
      // The concept has the page's own name, so it is folded into the page card, which
      // inherits the alias score and comes first.
      await page.locator('#siteSearch').fill(lang === 'zh' ? '利息' : 'interest');
      const firstCard = page.locator('#grid > .card').first();
      ok(await firstCard.getAttribute('href') === 'investment/rates/compound-interest/', `${lang}: alias puts its page first`);
      ok(await page.locator('#grid > .card[data-concept="compound-interest"]').count() === 0, `${lang}: same-named concept folded into its page`);
      ok(/\d/.test(await page.locator('#siteSearchCount').innerText()), `${lang}: count shown`);

      // A concept card: badge, one-line description, the page it lives in.
      await page.locator('#siteSearch').fill(lang === 'zh' ? '特征向量' : 'eigenvector');
      const eigen = page.locator('#grid > .card').first();
      ok(await eigen.getAttribute('data-concept') === 'eigen', `${lang}: concept ranks first`);
      ok((await eigen.getAttribute('href')).endsWith('math/linear-algebra/eigenvectors/#step1'), `${lang}: deep link with anchor`);
      ok((await eigen.locator('.concept-in').innerText()).length > 3, `${lang}: card names its page`);
      ok((await eigen.locator('p').first().innerText()).length > 5, `${lang}: card shows a one-line description`);

      // A concept that is just its page's own topic is not shown twice.
      await page.locator('#siteSearch').fill(lang === 'zh' ? '光合作用' : 'photosynthesis');
      const hrefs = await page.locator('#grid > .card').evaluateAll(els => els.map(e => [e.dataset.concept || '', e.getAttribute('href')]));
      ok(hrefs.filter(([, h]) => h && h.startsWith('biology/cells/photosynthesis/')).length === 1, `${lang}: page and its same-named concept deduplicated`);
      // A concept that names a step inside a differently titled page stays next to the page.
      await page.locator('#siteSearch').fill(lang === 'zh' ? '傅里叶' : 'Fourier');
      const fourier = await page.locator('#grid > .card').evaluateAll(els => els.map(e => [e.dataset.concept || '', e.getAttribute('href')]));
      ok(fourier.some(([c]) => c === 'fourier') && fourier.some(([c, h]) => !c && h === 'signal/transforms/fourier/'), `${lang}: concept and page both listed`);
      ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lang}: no horizontal overflow at 390`);
      const small = await page.locator('#grid > .card').evaluateAll(els => els.filter(e => e.getBoundingClientRect().height < 48).length);
      ok(small === 0, `${lang}: result cards are at least 48px tall`);

      // One click lands on the anchor inside the page.
      await page.locator('#grid > .card[data-concept="fourier"]').click();
      await page.waitForLoadState('load');
      ok(page.url().endsWith('/signal/transforms/fourier/#step5') && await page.locator('#step5').count() === 1, `${lang}: click opens the step`);

      // A ?s= link loads the index without focus and keeps the query.
      const direct = await context.newPage();
      direct.on('pageerror', e => errors.push(String(e)));
      await direct.goto(base + '?s=' + encodeURIComponent(lang === 'zh' ? '特征向量' : 'eigen vector'));
      await direct.waitForSelector('#grid > .card[data-concept]');
      ok(await direct.locator('#grid > .card').first().getAttribute('data-concept') === 'eigen', `${lang}: ?s= ranks the concept first`);
      await context.close();
    }
    // Index unavailable: page search still works and says nothing about concepts.
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
    await context.route('**/search/manifest.js*', route => route.abort());
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(base + '?s=fourier');
    await page.waitForTimeout(300);
    ok(await page.locator('#grid > .card').count() > 0 && await page.locator('#grid > .card[data-concept]').count() === 0, 'failure falls back to page results');
    await context.close();
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ pass: true, checks, base }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
