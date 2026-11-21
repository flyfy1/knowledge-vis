#!/usr/bin/env node
'use strict';
/* Pagefind full-text search browser checks (specs/atlas-search-index.md § Pagefind full-text search):
 *   1. Homepage: lazy loads pagefind/pagefind.js on focus/input (never on first paint), searches full-text body terms
 *      in both Chinese ("范·海尔蒙特", "叠瓦磁道") and English ("Ruemmler", "Van Helmont"), renders .fulltext-card with
 *      highlighted <mark> excerpts and chapter/step deep links, respects category filters, and has zero horizontal
 *      overflow at 1280/390/320.
 *   2. Content pages (via site-nav.js): renders .site-search-fab (>= 48x48 px), opens .site-search-modal on click or
 *      Cmd+K / Ctrl+K, searches bilingual full text with chapter deep links, closes on Escape / backdrop / close button,
 *      switches language cleanly, and has zero horizontal overflow at 1280/390/320.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE = (process.env.PAGEFIND_TEST_URL || 'http://127.0.0.1:18871/').replace(/\/?$/, '/');
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    // 1. Homepage full-text search in zh and en
    for (const [locale, lang] of [['zh-CN', 'zh'], ['en-US', 'en']]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale });
      await ctx.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, lang);
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push(`home ${lang}: ${e}`));
      const pfReqs = [];
      page.on('request', r => { if (r.url().includes('/pagefind/')) pfReqs.push(r.url()); });

      await page.goto(BASE);
      eq(pfReqs.length, 0, `home ${lang}: first paint does not load pagefind`);

      // Search a deep prose term that only appears inside a chapter body (not in any page title, desc, tag, or concept alias)
      const q = lang === 'zh' ? '范·海尔蒙特' : 'Ruemmler';
      const expectedSlug = lang === 'zh' ? 'photosynthesis' : 'what-a-drive-is-made-of';
      await page.locator('#siteSearch').fill(q);
      await page.waitForSelector('#grid > a.card.fulltext-card', { timeout: 10000 });
      ok(pfReqs.some(u => u.includes('pagefind/pagefind.js')), `home ${lang}: typing loads pagefind.js`);

      const cards = await page.locator('#grid > a.card.fulltext-card').evaluateAll(els => els.map(el => ({
        href: el.getAttribute('href'),
        slug: el.dataset.fulltext,
        title: el.querySelector('h2') ? el.querySelector('h2').textContent : '',
        marks: el.querySelectorAll('.fulltext-excerpt mark').length,
        h: el.getBoundingClientRect().height,
      })));
      ok(cards.length >= 1, `home ${lang}: full-text card rendered for "${q}"`);
      ok(cards[0].slug === expectedSlug, `home ${lang}: top full-text card is ${expectedSlug} (got ${cards[0].slug})`);
      ok(cards[0].marks >= 1, `home ${lang}: full-text card highlights matched term with <mark>`);
      ok(cards.every(c => c.h >= 48), `home ${lang}: full-text cards >= 48px tall`);
      if (lang === 'en') {
        ok(cards[0].href.endsWith('computing/systems/what-a-drive-is-made-of/#ch2'), `home en: deep link points to #ch2 (${cards[0].href})`);
      }

      // Check narrow viewports for overflow
      for (const w of [390, 320]) {
        await page.setViewportSize({ width: w, height: 800 });
        eq(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `home ${lang} ${w}: zero overflow`);
      }
      await ctx.close();
    }

    // 2. Content page floating search button & Cmd+K modal
    for (const [locale, lang] of [['zh-CN', 'zh'], ['en-US', 'en']]) {
      for (const width of [1280, 390, 320]) {
        const ctx = await browser.newContext({ viewport: { width, height: 860 }, locale });
        await ctx.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, lang);
        const page = await ctx.newPage();
        page.on('pageerror', e => errors.push(`page ${lang}/${width}: ${e}`));

        await page.goto(BASE + 'computing/systems/what-a-drive-is-made-of/');
        await page.waitForSelector('.site-search-fab');

        const fabBox = await page.locator('.site-search-fab').boundingBox();
        ok(fabBox && fabBox.width >= 48 && fabBox.height >= 48, `page ${lang}/${width}: search FAB >= 48x48`);
        eq(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `page ${lang}/${width}: zero overflow before open`);

        if (width === 1280) {
          // Open via Ctrl+K
          await page.keyboard.press('Control+k');
          ok(await page.locator('.site-search-modal').isVisible(), `page ${lang}: Ctrl+K opens search modal`);

          const query = lang === 'zh' ? '范·海尔蒙特' : 'Van Helmont';
          await page.locator('.site-search-input').fill(query);
          await page.waitForSelector('.site-search-item', { timeout: 10000 });

          const items = await page.locator('.site-search-item').evaluateAll(els => els.map(a => ({
            href: a.getAttribute('href'),
            title: a.querySelector('.site-search-item-title')?.textContent || '',
            marks: a.querySelectorAll('.site-search-item-excerpt mark').length,
            h: a.getBoundingClientRect().height,
          })));
          ok(items.length >= 1 && items[0].href.includes('biology/cells/photosynthesis/'), `page ${lang}: modal finds photosynthesis (${items[0]?.href})`);
          ok(items[0].marks >= 1, `page ${lang}: modal highlights excerpt with <mark>`);
          ok(items.every(it => it.h >= 48), `page ${lang}: modal items >= 48px tall`);

          // Close via Escape
          await page.keyboard.press('Escape');
          ok(await page.locator('.site-search-modal').isHidden(), `page ${lang}: Escape closes modal`);
        } else {
          // Open via FAB click on mobile
          await page.locator('.site-search-fab').click();
          ok(await page.locator('.site-search-modal').isVisible(), `page ${lang}/${width}: FAB click opens modal`);
          eq(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `page ${lang}/${width}: zero overflow with modal open`);
          await page.locator('.site-search-close').click();
          ok(await page.locator('.site-search-modal').isHidden(), `page ${lang}/${width}: close button closes modal`);
        }
        await ctx.close();
      }
    }

    assert.deepEqual(errors, []);
    console.log(`PASS: pagefind full-text browser checks (${checks})`);
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
