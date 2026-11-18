#!/usr/bin/env node
'use strict';
/* The default-edition switch in the browser (specs/claude-code-editions.md「默认版本」). Run serially against a local
 * server started at the repo root:
 *   python3 -m http.server 18871 --bind 127.0.0.1
 *   EDITION_BASE_URL=http://127.0.0.1:18871/ NODE_PATH=~/fast/integ-life/integ-games/node_modules node tests/default-edition-browser.cjs
 * With the switch as committed ("claude-code"): a home lesson card opens the Claude Code edition, which links back to the
 * canonical edition; a pinned lesson opens its canonical page; a subtopic directory URL and a 《title》 auto-link follow
 * the switch; an anchored concept result still opens the canonical page. Then the same with the switch overridden to
 * "original" before any script runs (the file is not edited): everything opens canonical pages. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE = (process.env.EDITION_BASE_URL || 'http://127.0.0.1:18871/').replace(/\/?$/, '/');
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };

const LESSON = { slug: 'fractions', path: 'math/arithmetic/fractions/' };        // featured on the home page, has a variant
const PINNED = { slug: 'power-converters', path: 'physics/circuits/power-converters/', view: '?category=physics&subtopic=circuits' };
const DIR = { url: 'math/arithmetic/', cat: 'math', sub: 'arithmetic' };
const HOST = 'computing/systems/why-compute-waits-for-memory/';                  // a hand-written page that loads site-nav.js

async function run(browser, override) {
  const tag = override ? '[original]' : '[default]';
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  if (override) await ctx.addInitScript(() => {
    // pages.config.js assigns the switch; a non-writable property makes that assignment a no-op, as if the file said "original"
    Object.defineProperty(window, 'KNOWLEDGE_DEFAULT_EDITION', { value: 'original', writable: false, configurable: false });
  });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  const variant = (slug) => 'variants/claude-code/' + slug + '/';

  // Home: the featured lesson card.
  await page.goto(BASE);
  eq(await page.evaluate(() => window.KNOWLEDGE_DEFAULT_EDITION), override ? 'original' : 'claude-code', tag + ' switch value seen by the page');
  const card = page.locator(`#grid a.card[href="${override ? LESSON.path : variant(LESSON.slug)}"]`);
  eq(await card.count(), 1, tag + ' the featured lesson card links its ' + (override ? 'canonical page' : 'Claude Code edition'));
  // Every card on the home page agrees with the resolver; under "original" every card is a canonical path.
  const homeCards = await page.evaluate(() => Array.from(document.querySelectorAll('#grid a.card:not(.entrance)')).map((a) => a.getAttribute('href')));
  const canon = await page.evaluate(() => window.KNOWLEDGE_PAGES.filter((p) => p.status === 'live').map((p) => p.path));
  if (override) ok(homeCards.every((h) => canon.includes(h)), tag + ' every home card is a canonical path');
  else ok(homeCards.some((h) => h.startsWith('variants/claude-code/')), tag + ' some home cards open Claude Code editions');
  ok(await page.locator('#grid a.card.entrance[href="variants/claude-code/"]').count() === 1, tag + ' the Editions entrance stays');
  await card.click();
  await page.waitForLoadState('load');
  ok(new URL(page.url()).pathname.endsWith('/' + (override ? LESSON.path : variant(LESSON.slug))), tag + ' the card opens ' + page.url());
  if (!override) {
    // From the variant back to the canonical edition: its own header link (written by every Claude Code edition).
    const back = page.locator(`a[href="../../../${LESSON.path}"]`).first();
    ok(await back.isVisible(), tag + ' the variant shows a link to the canonical edition');
    await back.click();
    await page.waitForLoadState('load');
    ok(new URL(page.url()).pathname.endsWith('/' + LESSON.path), tag + ' it opens the canonical page');
    ok(await page.locator('.edition-compare a[href$="variants/claude-code/fractions/"]').count() === 1, tag + ' the canonical page keeps its compare link');
  }

  // A pinned lesson opens its canonical page under either switch.
  await page.goto(BASE + PINNED.view);
  const pinned = page.locator(`#grid a.card[href="${PINNED.path}"]`);
  eq(await pinned.count(), 1, tag + ' the pinned lesson card links its canonical page');
  eq(await page.locator(`#grid a.card[href="${variant(PINNED.slug)}"]`).count(), 0, tag + ' and not its variant');
  await pinned.click();
  await page.waitForLoadState('load');
  ok(new URL(page.url()).pathname.endsWith('/' + PINNED.path), tag + ' pinned card opens ' + page.url());

  // A subtopic directory URL (a redirect stub to the home view): its cards follow the switch.
  await page.goto(BASE + DIR.url);
  await page.waitForURL((u) => u.search.includes('subtopic=' + DIR.sub));
  await page.waitForSelector('#grid a.card');
  const dir = await page.evaluate((d) => ({
    cards: Array.from(document.querySelectorAll('#grid a.card')).map((a) => a.getAttribute('href')).sort(),
    want: window.KNOWLEDGE_PAGES.filter((p) => p.category === d.cat && p.subtopic === d.sub && p.status === 'live')
      .map((p) => window.knowledgeEditionPath(p, window.KNOWLEDGE_DEFAULT_EDITION)).sort(),
  }), DIR);
  eq(dir.cards, dir.want, tag + ' subtopic directory cards');
  ok(override ? dir.cards.every((h) => !h.startsWith('variants/')) : dir.cards.some((h) => h.startsWith('variants/claude-code/')), tag + ' directory cards ' + (override ? 'all canonical' : 'open Claude Code editions'));

  // A 《title》 auto-link on a hand-written page.
  await page.goto(BASE + HOST);
  await page.waitForFunction(() => window.SITE_NAV_DATA && window.SiteNav && document.querySelector('.site-nav'));
  const title = await page.evaluate((s) => window.SITE_NAV_DATA.pages.find((p) => (p[0] || p[1].split('/').filter(Boolean).pop()) === s)[2], LESSON.slug);
  await page.evaluate((t) => { const p = document.createElement('p'); p.id = 'edFx'; p.textContent = '另见《' + t + '》。'; document.querySelector('main').appendChild(p); }, title);
  await page.waitForSelector('#edFx a.site-autolink');
  eq(await page.locator('#edFx a.site-autolink').getAttribute('href'), '../../../' + (override ? LESSON.path : variant(LESSON.slug)), tag + ' 《title》 auto-link');
  const pinnedTitle = await page.evaluate((s) => window.SITE_NAV_DATA.pages.find((p) => (p[0] || p[1].split('/').filter(Boolean).pop()) === s)[2], PINNED.slug);
  await page.evaluate((t) => { const p = document.createElement('p'); p.id = 'edFx2'; p.textContent = '另见《' + t + '》。'; document.querySelector('main').appendChild(p); }, pinnedTitle);
  await page.waitForSelector('#edFx2 a.site-autolink');
  eq(await page.locator('#edFx2 a.site-autolink').getAttribute('href'), '../../../' + PINNED.path, tag + ' 《title》 auto-link to a pinned lesson');

  // An anchored concept result keeps the canonical edition (its anchors are that edition's steps).
  await page.goto(BASE + '?s=' + encodeURIComponent('特征向量'));
  await page.waitForSelector('#grid > .card[data-concept="eigen"]');
  ok(await page.evaluate(() => { const p = window.KNOWLEDGE_PAGES.find((x) => x.slug === 'eigenvectors'); return !!(p.editions && p.editions['claude-code']); }), tag + ' eigenvectors has a Claude Code edition');
  eq(await page.locator('#grid > .card[data-concept="eigen"]').getAttribute('href'), 'math/linear-algebra/eigenvectors/#step1', tag + ' anchored concept href');
  await page.locator('#grid > .card[data-concept="eigen"]').click();
  await page.waitForLoadState('load');
  ok(page.url().endsWith('/math/linear-algebra/eigenvectors/#step1'), tag + ' the anchored concept opens the canonical page: ' + page.url());

  eq(errors, [], tag + ' no page errors');
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    await run(browser, false);
    await run(browser, true);
  } finally { await browser.close(); }
  console.log(JSON.stringify({ pass: true, checks, base: BASE }));
})().catch((e) => { console.error(e); process.exit(1); });
