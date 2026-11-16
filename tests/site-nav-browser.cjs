#!/usr/bin/env node
/* Site navigation, browser part (specs/site-navigation.md). Run serially against a local server:
 *   python3 -m http.server 18980 --bind 127.0.0.1
 *   SITE_NAV_BASE_URL=http://127.0.0.1:18980/ NODE_PATH=~/fast/integ-life/integ-games/node_modules node tests/site-nav-browser.cjs
 * Home: subtopic view, breadcrumb, group-head links, directory URL. Pages: breadcrumb and auto-links
 * on an essay (before and after a language switch), a lesson-shell page, a plain lesson and a canvas
 * page; the skip rules on injected markup; no link inside a link; no horizontal overflow. */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert/strict');

const BASE = (process.env.SITE_NAV_BASE_URL || 'http://127.0.0.1:18980/').replace(/\/?$/, '/');
const WIDTHS = [1280, 390, 320];
let checks = 0;
const ok = (c, m) => { assert.ok(c, m); checks++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };

async function ctxFor(browser, lang, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  await ctx.addInitScript((l) => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, lang);
  return ctx;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const nested = (page) => page.evaluate(() => document.querySelectorAll('a a').length);
// Smallest crumb box: every crumb must be a 48 x 48 target.
const minBox = (page, sel) => page.evaluate((s) => Array.from(document.querySelectorAll(s)).filter((a) => a.offsetParent)
  .reduce((m, a) => { const r = a.getBoundingClientRect(); return Math.min(m, r.width, r.height); }, 1e9), sel);

async function home(browser) {
  for (const lang of ['zh', 'en']) for (const width of WIDTHS) {
    const ctx = await ctxFor(browser, lang, width);
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    const tag = `home ${lang} ${width}`;

    // Subtopic view: only that subtopic, three crumbs, no group heads.
    await page.goto(BASE + '?category=computing&subtopic=systems');
    const sub = await page.evaluate(() => ({
      crumbs: Array.from(document.querySelectorAll('#crumbs li:not([hidden]) a')).map((a) => [a.textContent, new URL(a.href).search, a.getAttribute('aria-current')]),
      cards: Array.from(document.querySelectorAll('#grid a.card')).map((a) => a.getAttribute('href')),
      heads: document.querySelectorAll('#grid .group-head').length,
      pressed: document.querySelector('#catChips .chip.on').dataset.cat,
    }));
    const names = lang === 'zh' ? ['全部', '计算与智能', '系统与安全'] : ['All', 'Computing & AI', 'Systems & Security'];
    eq(sub.crumbs.map((c) => c[0]), names, tag + ' subtopic crumbs');
    eq(sub.crumbs.map((c) => c[1]), ['', '?category=computing', '?category=computing&subtopic=systems'], tag + ' crumb hrefs');
    eq(sub.crumbs.map((c) => c[2]), [null, null, 'page'], tag + ' aria-current on the subtopic');
    ok(sub.cards.length >= 20 && sub.cards.every((h) => h.startsWith('computing/systems/')), tag + ' only systems pages: ' + sub.cards.length);
    eq(sub.heads, 0, tag + ' no group heads in a subtopic view');
    eq(sub.pressed, 'computing', tag + ' category chip stays pressed');
    ok(await minBox(page, '#crumbs a') >= 48, tag + ' crumbs are 48 px targets');
    eq(await overflow(page), 0, tag + ' subtopic view overflow');
    if (width === 1280 || width === 320) await page.screenshot({ path: `/tmp/agent-tasks/site-nav/shots/home-subtopic-${lang}-${width}.png` });

    // Category view: two crumbs, group heads link to their subtopic view.
    await page.locator('#crumbs a[data-crumb="cat"]').click();
    ok(new URL(page.url()).search === '?category=computing', tag + ' cat crumb switches in place');
    const cat = await page.evaluate(() => ({
      crumbs: Array.from(document.querySelectorAll('#crumbs li:not([hidden]) a')).map((a) => a.textContent),
      heads: Array.from(document.querySelectorAll('#grid .group-head h2 a')).map((a) => new URL(a.href).search),
      focus: document.activeElement && document.activeElement.dataset.crumb,
    }));
    eq(cat.crumbs, names.slice(0, 2), tag + ' category view has two crumbs');
    ok(cat.heads.includes('?category=computing&subtopic=systems') && cat.heads.length >= 4, tag + ' group heads link to subtopics: ' + cat.heads.join(' '));
    eq(cat.focus, 'cat', tag + ' focus stays on the crumb');
    ok(await minBox(page, '#grid .group-head h2 a') >= 48, tag + ' group-head links are 48 px tall');
    eq(await overflow(page), 0, tag + ' category view overflow');

    await page.locator('#grid .group-head h2 a').filter({ hasText: names[2] }).click();
    eq(new URL(page.url()).search, '?category=computing&subtopic=systems', tag + ' group head opens the subtopic view');
    eq(await page.evaluate(() => document.activeElement.dataset.crumb), 'sub', tag + ' focus moves to the subtopic crumb');
    await page.goBack();
    eq(new URL(page.url()).search, '?category=computing', tag + ' Back returns to the category view');
    eq(await page.locator('#crumbs li:not([hidden]) a').count(), 2, tag + ' Back restores two crumbs');

    // Root crumb goes home; ?category= alone keeps working; unknown subtopic degrades.
    await page.goto(BASE + '?category=computing&subtopic=systems');
    await page.locator('#crumbs a[data-crumb="all"]').click();
    ok(await page.locator('#crumbs').isHidden(), tag + ' no breadcrumb on the home view');
    eq(new URL(page.url()).search, '', tag + ' root crumb returns home');
    await page.goto(BASE + '?category=physics&subtopic=nonsense');
    eq(await page.locator('#crumbs li:not([hidden]) a').count(), 2, tag + ' unknown subtopic falls back to the category view');
    await page.goto(BASE + '?category=computing&subtopic=systems');
    await page.locator('#catChips .chip[data-cat="computing"]').click();
    eq(new URL(page.url()).search, '?category=computing', tag + ' pressing the category chip leaves the subtopic');
    // A single-group category (no heads) still has a subtopic view.
    await page.goto(BASE + '?category=engineering&subtopic=control');
    eq(await page.locator('#crumbs li:not([hidden]) a').count(), 3, tag + ' engineering/control has three crumbs');
    eq(errors, [], tag + ' no page errors');
    await ctx.close();
  }
  // Directory URL redirects to the subtopic view.
  const ctx = await ctxFor(browser, 'zh', 1280);
  const page = await ctx.newPage();
  await page.goto(BASE + 'computing/systems/');
  await page.waitForURL(/\?category=computing&subtopic=systems$/);
  ok(await page.locator('#crumbs a[data-crumb="sub"]').isVisible(), 'directory URL lands on the subtopic view');
  await ctx.close();
}

async function crumbsOf(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.site-nav a')).map((a) => [a.textContent, a.getAttribute('href')]));
}
async function waitNav(page) {
  await page.waitForFunction(() => window.SiteNav && document.querySelector('.site-nav'), null, { timeout: 10000 });
  await page.waitForTimeout(150);
}

async function pages(browser) {
  const SAMPLE = [
    { path: 'computing/systems/how-sas-works/', kind: 'essay', crumbs: { zh: ['首页', '计算与智能', '系统与安全'], en: ['Home', 'Computing & AI', 'Systems & Security'] } },
    { path: 'signal/systems/convolution/', kind: 'lesson-shell', crumbs: { zh: ['首页', '信号与系统', '系统'], en: ['Home', 'Signals & Systems', 'Systems'] } },
    { path: 'biology/cells/cell-structure/', kind: 'plain lesson', crumbs: { zh: ['首页', '生物', '细胞与分子'], en: ['Home', 'Biology', 'Cells & Molecules'] } },
    { path: 'signal/transforms/fourier/', kind: 'canvas', crumbs: { zh: ['首页', '信号与系统', '变换'], en: ['Home', 'Signals & Systems', 'Transforms'] } },
    { path: 'atlas/', kind: 'no subtopic', crumbs: { zh: ['首页', '数学基础'], en: ['Home', 'Mathematical Foundations'] } },
  ];
  for (const s of SAMPLE) for (const lang of ['zh', 'en']) for (const width of WIDTHS) {
    const ctx = await ctxFor(browser, lang, width);
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    const tag = `${s.kind} ${s.path} ${lang} ${width}`;
    await page.goto(BASE + s.path);
    await waitNav(page);
    const crumbs = await crumbsOf(page);
    eq(crumbs.map((c) => c[0]), s.crumbs[lang], tag + ' crumb text');
    const up = '../'.repeat(s.path.split('/').filter(Boolean).length);
    const [cat, sub] = s.path.split('/');
    const hrefs = [up, up + '?category=' + (s.path === 'atlas/' ? 'math' : cat)];
    if (s.crumbs[lang].length === 3) hrefs.push(up + '?category=' + cat + '&subtopic=' + sub);
    eq(crumbs.map((c) => c[1]), hrefs, tag + ' crumb hrefs');
    // Above the title, inside the page's header area.
    ok(await page.evaluate(() => { const n = document.querySelector('.site-nav'), h = document.querySelector('h1');
      return !!(n.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING); }), tag + ' breadcrumb precedes the h1');
    ok(await minBox(page, '.site-nav a') >= 48, tag + ' crumbs are 48 px targets');
    eq(await overflow(page), 0, tag + ' no horizontal overflow');
    eq(await nested(page), 0, tag + ' no link inside a link');
    eq(errors, [], tag + ' no page errors');
    await ctx.close();
  }

  // Template essay: the runtime linker stays off (<html data-template>, specs/site-template.md D10); its title
  // mentions are static links. how-sas-works hosted the auto-link checks below until its conversion (0c3676fa,
  // b5cdc9bd restored its three runtime links as [[refs]] to what-a-drive-is-made-of#ch7; review 2026-11-16).
  for (const lang of ['zh', 'en']) {
    const tctx = await ctxFor(browser, lang, 1280);
    const tp = await tctx.newPage();
    await tp.goto(BASE + 'computing/systems/how-sas-works/');
    await waitNav(tp);
    eq(await tp.evaluate(() => [SiteNav.skipped, SiteNav.report().length]), ['data-template', 0], `template essay ${lang}: runtime linker off`);
    eq(await tp.evaluate(() => document.querySelectorAll('main [data-i18n-html="ch1.p2"] a[href="../what-a-drive-is-made-of/#ch7"], main [data-i18n-html="ch7.p1"] a[href="../what-a-drive-is-made-of/#ch7"]').length), 2, `template essay ${lang}: the restored static links`);
    eq(await tp.evaluate(() => document.querySelectorAll('a.site-autolink').length), 0, `template essay ${lang}: no runtime links`);
    await tctx.close();
  }

  // Template lesson whose runtime does not translate data-i18n-aria: its static breadcrumb has no aria-label in the
  // HTML; site-nav.js names it and follows the language switch (Phase 3a review 2026-11-16).
  for (const lang of ['zh', 'en']) {
    const lctx = await ctxFor(browser, lang, 1280);
    const lp = await lctx.newPage();
    await lp.goto(BASE + 'signal/systems/convolution/');
    await lp.waitForFunction(() => window.SiteNav && document.querySelector('nav.site-nav').hasAttribute('aria-label'));
    eq(await lp.evaluate(() => document.querySelector('nav.site-nav').getAttribute('aria-label')), lang === 'zh' ? '页面位置' : 'Breadcrumb', `template lesson ${lang}: breadcrumb named`);
    await lp.locator('#langToggle button[data-lang="' + (lang === 'zh' ? 'en' : 'zh') + '"]').click();
    await lp.waitForTimeout(150);
    eq(await lp.evaluate(() => document.querySelector('nav.site-nav').getAttribute('aria-label')), lang === 'zh' ? 'Breadcrumb' : '页面位置', `template lesson ${lang}: breadcrumb name follows the switch`);
    await lctx.close();
  }

  // Template lessons without lesson-shell.js (Phase 3 batch B): site-nav.js lights the first step pill on a fresh
  // load at the top, as the hand-written pages did through the breadcrumb race; a working scroll spy replaces it
  // (cell-structure), and on a page whose spy never lights anything the default is withdrawn once step 0 has
  // scrolled away (binary-search). A #fragment load is left to the spy.
  for (const [path, after] of [['biology/cells/cell-structure/', '3'], ['computing/algorithms/binary-search/', '']]) {
    const dctx = await browser.newContext({ viewport: { width: 1280, height: 950 }, reducedMotion: 'reduce' });
    await dctx.addInitScript(() => { try { localStorage.setItem('knowledge-lang', 'zh'); } catch (e) {} });
    const dp = await dctx.newPage();
    const lit = () => dp.evaluate(() => [...document.querySelectorAll('.step-nav a')].map((a, i) => (a.classList.contains('active') ? i : null)).filter(x => x != null).join(','));
    await dp.goto(BASE + path, { waitUntil: 'load' });
    await dp.waitForTimeout(800);
    eq(await lit(), '0', `batch B lesson ${path}: first step pill lit at load`);
    await dp.evaluate(() => { const s = document.getElementById('step3'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 60); });
    await dp.waitForTimeout(700);
    eq(await lit(), after, `batch B lesson ${path}: after scrolling to step 3`);
    await dp.goto('about:blank');
    await dp.goto(BASE + path + '#step3', { waitUntil: 'load' });
    await dp.waitForTimeout(800);
    ok(!(await lit()).split(',').includes('0'), `batch B lesson ${path}: a #step3 deep link does not light step 0`);
    await dctx.close();
  }

  // Hand-written essay: auto-links before and after switching language in place. No hand-written essay mentions
  // another live title in its own copy any more, so the test adds one keyed paragraph to both copy tables; the
  // page's own applyLang re-renders it on the switch, as it would a real paragraph.
  const ctx = await ctxFor(browser, 'zh', 1280);
  const page = await ctx.newPage();
  await page.goto(BASE + 'computing/systems/why-compute-waits-for-memory/');
  await waitNav(page);
  eq(await page.evaluate(() => SiteNav.report().length), 0, 'hand-written host essay has no auto-links of its own');
  await page.evaluate(() => {
    window.ESSAY_COPY.zh['fx.auto'] = '姊妹篇《硬盘里到底是什么》第 7 章；再说一次《硬盘里到底是什么》。';
    window.ESSAY_COPY.en['fx.auto'] = 'The sister essay “What a Drive Is Made Of”, Chapter 7.';
    const p = document.createElement('p');
    p.id = 'fxAuto'; p.setAttribute('data-i18n-html', 'fx.auto'); p.innerHTML = window.ESSAY_COPY.zh['fx.auto'];
    document.querySelector('main').appendChild(p);
  });
  await page.waitForTimeout(300);
  const zhLinks = await page.evaluate(() => SiteNav.report().map((r) => [r.title, r.href]));
  eq(zhLinks, [['硬盘里到底是什么', '../../../computing/systems/what-a-drive-is-made-of/'], ['硬盘里到底是什么', '../../../computing/systems/what-a-drive-is-made-of/']], 'essay zh auto-links');
  await page.locator('#langToggle button[data-lang="en"]').click();
  await page.waitForFunction(() => document.querySelector('.site-nav a').textContent === 'Home');
  await page.waitForTimeout(200);
  eq((await crumbsOf(page)).map((c) => c[0]), ['Home', 'Computing & AI', 'Systems & Security'], 'essay crumbs follow the language switch');
  eq(await page.evaluate(() => SiteNav.report().map((r) => r.title)), ['What a Drive Is Made Of'], 'essay en auto-links after the switch');
  eq(await page.evaluate(() => document.querySelector('.site-nav').getAttribute('aria-label')), 'Breadcrumb', 'aria-label follows the language');
  await page.locator('#langToggle button[data-lang="zh"]').click();
  await page.waitForFunction(() => document.querySelector('.site-nav a').textContent === '首页');
  await page.waitForTimeout(200);
  eq(await page.evaluate(() => SiteNav.report().length), 2, 'switching back restores the zh auto-links');
  eq(await nested(page), 0, 'no nested links after two switches');

  // Skip rules on injected markup; the debounced observer picks it up without looping.
  await page.evaluate(() => {
    const box = document.createElement('section');
    box.id = 'fixture';
    box.innerHTML = [
      '<p id="plain">见《硬盘里到底是什么》第 7 章，以及 “Why NVMe Is So Fast”, chapter 2.</p>',
      '<p><a id="inA" href="#">《硬盘里到底是什么》</a></p>',
      '<h2 id="inH">《硬盘里到底是什么》</h2>',
      '<button id="inBtn">《硬盘里到底是什么》</button>',
      '<p data-no-autolink id="optOut">《硬盘里到底是什么》</p>',
      '<div data-no-autolink><p id="optOutDeep">《硬盘里到底是什么》</p></div>',
      '<p id="self">《为什么计算一直在等内存》</p>',
      '<p id="short">《一堆开关》</p>',
      '<p id="cite"><cite>What a Drive Is Made Of</cite></p>',
      '<svg><text id="inSvg">《硬盘里到底是什么》</text></svg>',
      '<details class="page-provenance"><summary>x</summary><p id="inProv">《硬盘里到底是什么》</p></details>',
      '<label id="inLabel">《硬盘里到底是什么》<input></label>',
    ].join('');
    document.querySelector('main').appendChild(box);
  });
  await page.waitForTimeout(300);
  const fx = await page.evaluate(() => {
    const n = (id) => document.querySelectorAll('#' + id + ' a.site-autolink').length;
    return { plain: n('plain'), inA: document.querySelectorAll('#inA a').length, inH: n('inH'), inBtn: n('inBtn'), optOut: n('optOut'),
      optOutDeep: n('optOutDeep'), self: n('self'), short: n('short'), cite: n('cite'), inSvg: document.querySelectorAll('#inSvg a').length,
      inProv: n('inProv'), inLabel: n('inLabel'), plainText: document.getElementById('plain').innerHTML };
  });
  eq(fx.plain, 2, 'plain paragraph gets both links: ' + fx.plainText);
  ok(fx.plainText.includes('《<a class="site-autolink" href="../../../computing/systems/what-a-drive-is-made-of/"'), 'brackets stay outside the link');
  ok(fx.plainText.includes('“<a class="site-autolink" href="../../../computing/systems/why-nvme-is-fast/" data-site-autolink="why-nvme-is-fast">Why NVMe Is So Fast</a>”'), 'en quotes stay outside the link');
  eq([fx.inA, fx.inH, fx.inBtn, fx.optOut, fx.optOutDeep, fx.self, fx.short, fx.inSvg, fx.inProv, fx.inLabel], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'skip rules');
  eq(fx.cite, 1, 'an exact <cite> title links');
  // No self-sustaining mutation loop: once settled, nothing changes in the body.
  const churn = await page.evaluate(() => new Promise((res) => {
    let k = 0; const mo = new MutationObserver((r) => { k += r.length; });
    mo.observe(document.getElementById('fixture'), { childList: true, subtree: true, characterData: true });
    setTimeout(() => { mo.disconnect(); res(k); }, 600);
  }));
  eq(churn, 0, 'the observer does not loop on its own writes');
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    await home(browser);
    await pages(browser);
  } finally { await browser.close(); }
  console.log(`PASS: site navigation browser checks (${checks})`);
})().catch((e) => { console.error(e); process.exit(1); });
