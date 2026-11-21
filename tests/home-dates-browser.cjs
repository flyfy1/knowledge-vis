'use strict';
// Homepage card creation dates & Long Reads sort toggle (specs/index-pagination.md).
//   NODE_PATH=~/fast/integ-life/integ-games/node_modules HOME_TEST_URL=http://127.0.0.1:18871/ node tests/home-dates-browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const base = (process.env.HOME_TEST_URL || 'http://127.0.0.1:18871/').replace(/\/?$/, '/');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'pages.config.js'), 'utf8'), ctx);
const cfg = JSON.parse(JSON.stringify(ctx.window));
const bySlug = new Map(cfg.KNOWLEDGE_PAGES.map(p => [p.slug, p]));
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

let checks = 0;
const ok = (v, m) => { assert.ok(v, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    for (const [locale, lang] of [['zh-CN', 'zh'], ['en-US', 'en']]) {
      for (const width of [1280, 390, 320]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, locale });
        await context.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, lang);
        const page = await context.newPage();
        page.on('pageerror', e => errors.push(`${lang}/${width}: ${e.message}`));
        page.on('console', m => { if (m.type() === 'error') errors.push(`${lang}/${width}: ${m.text()}`); });

        await page.goto(base);
        await page.waitForSelector('#essaySort button');

        // 1. No horizontal overflow
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        eq(overflow, 0, `${lang}/${width}: no horizontal overflow`);

        // 2. Every Featured and Long Reads card has a valid <time class="date-badge" datetime="YYYY-MM-DD">
        const homeBadges = await page.evaluate(() => Array.from(document.querySelectorAll('#grid > a.card, .essay-grid > a.card')).map(card => {
          const t = card.querySelector('time.date-badge');
          return {
            href: card.getAttribute('href'),
            title: card.querySelector('h2') && card.querySelector('h2').textContent,
            text: t ? t.textContent.trim() : null,
            dt: t ? t.getAttribute('datetime') : null,
          };
        }));
        ok(homeBadges.length >= cfg.KNOWLEDGE_FEATURED.length + cfg.KNOWLEDGE_ESSAYS.length, `${lang}/${width}: home cards rendered (${homeBadges.length})`);
        ok(homeBadges.every(b => dateRe.test(b.text) && b.text === b.dt), `${lang}/${width}: every home card has matching YYYY-MM-DD date-badge`);

        // 3. Long Reads default order matches KNOWLEDGE_ESSAYS
        const essayTitlesDefault = await page.locator('.essay-grid > a.card h2').allInnerTexts();
        const wantDefaultTitles = cfg.KNOWLEDGE_ESSAYS.map(s => bySlug.get(s).title[lang]);
        eq(essayTitlesDefault, wantDefaultTitles, `${lang}/${width}: Long Reads default order matches KNOWLEDGE_ESSAYS`);

        // 4. Sort toggle buttons >= 48x48 px, initial aria-pressed, 3px focus outline
        const sortBox = await page.evaluate(() => Array.from(document.querySelectorAll('#essaySort button')).map(b => {
          const r = b.getBoundingClientRect();
          return { sort: b.dataset.sort, pressed: b.getAttribute('aria-pressed'), on: b.classList.contains('on'), w: r.width, h: r.height };
        }));
        eq(sortBox.map(b => [b.sort, b.pressed, b.on]), [['default', 'true', true], ['newest', 'false', false]], `${lang}/${width}: initial sort button states`);
        ok(sortBox.every(b => b.w >= 48 && b.h >= 48), `${lang}/${width}: sort buttons >= 48px (${JSON.stringify(sortBox)})`);

        // Focus outline check on 1280
        if (width === 1280) {
          await page.locator('#essaySort button[data-sort="newest"]').focus();
          const outline = await page.locator('#essaySort button[data-sort="newest"]').evaluate(el => getComputedStyle(el).outlineWidth);
          eq(outline, '3px', `${lang}/${width}: 3px focus outline on sort button`);
        }

        // 5. Click Newest first -> sorted non-increasing by date, ties preserve KNOWLEDGE_ESSAYS order, focus stays
        await page.locator('#essaySort button[data-sort="newest"]').click();
        eq(await page.evaluate(() => document.activeElement && document.activeElement.dataset.sort), 'newest', `${lang}/${width}: focus stays on newest button`);
        eq(await page.locator('#essaySort button[data-sort="newest"]').getAttribute('aria-pressed'), 'true', `${lang}/${width}: newest aria-pressed true`);
        const afterNewest = await page.evaluate(() => Array.from(document.querySelectorAll('.essay-grid > a.card')).map(c => ({
          title: c.querySelector('h2').textContent,
          dt: c.querySelector('time.date-badge').getAttribute('datetime'),
        })));
        const wantNewest = cfg.KNOWLEDGE_ESSAYS
          .map((s, i) => ({ title: bySlug.get(s).title[lang], created: bySlug.get(s).created, i }))
          .sort((a, b) => b.created.localeCompare(a.created) || a.i - b.i)
          .map(x => ({ title: x.title, dt: x.created }));
        eq(afterNewest, wantNewest, `${lang}/${width}: Newest first order exact`);
        ok(afterNewest.every((x, i) => i === 0 || afterNewest[i - 1].dt >= x.dt), `${lang}/${width}: dates non-increasing`);

        // Language switch keeps newest order
        if (width === 1280) {
          const otherLang = lang === 'zh' ? 'en' : 'zh';
          await page.locator(`#langToggle button[data-lang="${otherLang}"]`).click();
          const switchedTitles = await page.locator('.essay-grid > a.card h2').allInnerTexts();
          const wantSwitched = cfg.KNOWLEDGE_ESSAYS
            .map((s, i) => ({ title: bySlug.get(s).title[otherLang], created: bySlug.get(s).created, i }))
            .sort((a, b) => b.created.localeCompare(a.created) || a.i - b.i)
            .map(x => x.title);
          eq(switchedTitles, wantSwitched, `${lang}/${width}: language switch preserves newest sort`);
          await page.locator(`#langToggle button[data-lang="${lang}"]`).click();
        }

        // Click Default order -> restores KNOWLEDGE_ESSAYS order
        await page.locator('#essaySort button[data-sort="default"]').click();
        eq(await page.locator('.essay-grid > a.card h2').allInnerTexts(), wantDefaultTitles, `${lang}/${width}: clicking Default restores original order`);

        // 6. Category, subtopic & search cards also display date-badge
        if (width === 1280) {
          await page.locator('#catChips button[data-cat="computing"]').click();
          const catDates = await page.evaluate(() => Array.from(document.querySelectorAll('#grid > a.card')).map(c => c.querySelector('time.date-badge') && c.querySelector('time.date-badge').textContent));
          ok(catDates.length > 10 && catDates.every(d => dateRe.test(d)), `${lang}: category cards carry YYYY-MM-DD dates`);

          await page.locator('#catChips button[data-cat="all"]').click();
          await page.locator('#siteSearch').fill(lang === 'zh' ? '傅里叶' : 'Fourier');
          await page.waitForSelector('#grid > a.card[data-concept]');
          const searchPageDates = await page.evaluate(() => Array.from(document.querySelectorAll('#grid > a.card:not(.concept-card)')).map(c => c.querySelector('time.date-badge') && c.querySelector('time.date-badge').textContent));
          ok(searchPageDates.length >= 1 && searchPageDates.every(d => dateRe.test(d)), `${lang}: search page cards carry YYYY-MM-DD dates`);
        }

        await context.close();
      }
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ pass: true, checks, base }));
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
