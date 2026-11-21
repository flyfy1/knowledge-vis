#!/usr/bin/env node
/* Floating chapter rail & mobile drawer browser test (specs/site-navigation.md).
 * Run serially against a local static server:
 *   python3 -m http.server 18980 --bind 127.0.0.1
 *   CHAPTER_RAIL_BASE_URL=http://127.0.0.1:18980/ NODE_PATH=~/fast/integ-life/integ-games/node_modules node tests/chapter-rail-browser.cjs
 * Optional SHOT_DIR=/tmp/... saves viewport screenshots outside the repo. */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const assert = require('assert/strict');

const BASE = (process.env.CHAPTER_RAIL_BASE_URL || 'http://127.0.0.1:18980/').replace(/\/?$/, '/');
const SHOT = process.env.SHOT_DIR || '';
const WIDTHS = [1280, 390, 320];
const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); checks++; };

const CHAPTERED_PAGES = [
  { path: 'computing/software/how-threejs-draws-a-scene/', kind: 'template-essay', jumpIdx: 3, readyFn: () => window.__essayReady === true },
  { path: 'biology/body/body-in-balance/', kind: 'handwritten-essay', jumpIdx: 3, readyFn: () => window.__essayReady === true },
  { path: 'signal/transforms/fourier/', kind: 'template-lesson-a', jumpIdx: 3 },
  { path: 'computing/algorithms/recursion-divide/', kind: 'template-lesson-b', jumpIdx: 2 },
  { path: 'biology/ecology/population-ecology/', kind: 'handwritten-lesson', jumpIdx: 2 },
];

const NON_CHAPTER_PAGES = [
  'atlas/',
  'leetcode/',
  'demos/fable-flight/',
];

async function ctxFor(browser, lang, width, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height: 860 },
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript((l) => {
    try { localStorage.setItem('knowledge-lang', l); } catch (e) {}
  }, lang);
  return ctx;
}

async function waitRailReady(page, spec) {
  if (spec && spec.readyFn) {
    await page.waitForFunction(spec.readyFn, null, { timeout: 10000 });
  }
  await page.waitForFunction(
    () => document.body && document.body.classList.contains('site-has-rail') &&
      document.querySelectorAll('.site-chapter-rail a').length >= 2 &&
      Array.from(document.querySelectorAll('.site-chapter-rail .site-chapter-text')).every((el) => el.textContent.trim().length > 0),
    null,
    { timeout: 10000 }
  );
  await page.waitForTimeout(120);
}

async function checkTapTargets(page, tag) {
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.site-chapter-rail button, .site-chapter-rail a, .site-chapter-fab')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.width < 47.5 || r.height < 47.5) {
        out.push((el.className || el.tagName) + ' ' + r.width.toFixed(1) + 'x' + r.height.toFixed(1));
      }
    }
    return out;
  });
  eq(small, [], tag + ': rail/FAB targets >= 48px');
}

async function checkNoCjkInRail(page, tag) {
  const leaks = await page.evaluate((src) => {
    const rx = new RegExp(src);
    const out = [];
    for (const root of document.querySelectorAll('.site-chapter-rail, .site-chapter-fab')) {
      if (rx.test(root.textContent)) out.push('text: ' + root.textContent.trim().slice(0, 60));
      for (const el of [root, ...root.querySelectorAll('[aria-label]')]) {
        const al = el.getAttribute('aria-label');
        if (al && rx.test(al)) out.push('aria-label: ' + al);
      }
    }
    return out;
  }, CJK.source);
  eq(leaks, [], tag + ': zero CJK inside rail/FAB in en mode');
}

async function readRailState(page) {
  return page.evaluate(() => {
    const rail = document.querySelector('.site-chapter-rail');
    const fab = document.querySelector('.site-chapter-fab');
    const links = Array.from(document.querySelectorAll('.site-chapter-rail a'));
    const activeIdx = links.findIndex((a) => a.classList.contains('is-active'));
    const currentIdx = links.findIndex((a) => a.getAttribute('aria-current') === 'location');
    return {
      hasRail: document.body.classList.contains('site-has-rail'),
      collapsed: document.body.classList.contains('site-rail-collapsed'),
      drawerOpen: !!(rail && rail.classList.contains('is-open')),
      railAriaHidden: rail ? rail.getAttribute('aria-hidden') : null,
      backdropHidden: document.querySelector('.site-chapter-backdrop') ? document.querySelector('.site-chapter-backdrop').hidden : null,
      bodyPaddingLeft: getComputedStyle(document.body).paddingLeft,
      title: document.querySelector('.site-chapter-title') ? document.querySelector('.site-chapter-title').textContent.trim() : '',
      count: document.querySelector('.site-chapter-count') ? document.querySelector('.site-chapter-count').textContent.trim() : '',
      progress: rail ? rail.style.getPropertyValue('--rail-progress').trim() : '',
      fabText: fab ? fab.textContent.trim() : '',
      fabDisplay: fab ? getComputedStyle(fab).display : '',
      railDisplay: rail ? getComputedStyle(rail).display : '',
      total: links.length,
      activeIdx,
      currentIdx,
      activeHref: activeIdx >= 0 ? links[activeIdx].getAttribute('href') : null,
      hrefs: links.map((a) => a.getAttribute('href')),
      texts: links.map((a) => a.textContent.trim()),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function testChapteredPages(browser) {
  if (SHOT) fs.mkdirSync(SHOT, { recursive: true });

  for (const spec of CHAPTERED_PAGES) {
    for (const lang of ['zh', 'en']) {
      for (const width of WIDTHS) {
        const tag = `${spec.kind} ${lang} ${width}`;
        const ctx = await ctxFor(browser, lang, width);
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));

        await page.goto(BASE + spec.path, { waitUntil: 'load' });
        await waitRailReady(page, spec);

        const init = await readRailState(page);
        ok(init.hasRail, tag + ': body.site-has-rail set');
        eq(init.activeIdx, 0, tag + ': initial active chapter is 0');
        eq(init.currentIdx, 0, tag + ': aria-current="location" on chapter 0');
        eq(init.title, lang === 'zh' ? '目录' : 'Chapters', tag + ': rail header title');
        ok(init.count.startsWith('01 / '), tag + ': counter starts at 01');
        ok(init.fabText.length > 0, tag + ': FAB label populated');
        ok(init.texts.every((t) => t.length > 0), tag + ': all rail items have text');
        ok(init.overflow <= 0, tag + `: zero horizontal overflow (${init.overflow})`);
        if (lang === 'en') await checkNoCjkInRail(page, tag);
        await checkTapTargets(page, tag);

        if (width >= 1180) {
          eq(init.bodyPaddingLeft, '240px', tag + ': desktop body padding-left is 240px');
          eq(init.fabDisplay, 'none', tag + ': desktop FAB hidden when rail expanded');
          eq(init.railDisplay, 'flex', tag + ': desktop rail visible');

          // Scroll spy to middle target and to bottom
          const targetId = init.hrefs[spec.jumpIdx].slice(1);
          await page.evaluate((id) => {
            const el = document.getElementById(id);
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: 'instant' });
          }, targetId);
          await page.waitForFunction(
            (idx) => document.querySelectorAll('.site-chapter-rail a')[idx]?.classList.contains('is-active'),
            spec.jumpIdx,
            { timeout: 3000 }
          );
          const mid = await readRailState(page);
          eq(mid.currentIdx, spec.jumpIdx, tag + ': scroll spy lights middle chapter');
          ok(parseFloat(mid.progress) > 0, tag + ': --rail-progress advances on scroll');

          // Scroll to bottom -> last chapter active & 100% progress
          await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
          await page.waitForFunction(
            (last) => document.querySelectorAll('.site-chapter-rail a')[last]?.classList.contains('is-active'),
            init.total - 1,
            { timeout: 3000 }
          );
          const bot = await readRailState(page);
          eq(bot.currentIdx, init.total - 1, tag + ': bottom scroll lights last chapter');
          ok(parseFloat(bot.progress) >= 99, tag + `: bottom progress reaches ~100% (got ${bot.progress})`);

          // Click jump back to chapter 1 (index 1)
          const clickHref = init.hrefs[1];
          await page.locator(`.site-chapter-rail a[href="${clickHref}"]`).click();
          await page.waitForFunction(
            (href) => document.querySelector('.site-chapter-rail a.is-active')?.getAttribute('href') === href,
            clickHref,
            { timeout: 5000 }
          );

          // Desktop collapse / expand cycle
          await page.locator('.site-chapter-toggle').click();
          const col = await readRailState(page);
          ok(col.collapsed, tag + ': collapse sets body.site-rail-collapsed');
          eq(col.bodyPaddingLeft, '0px', tag + ': collapsed body padding-left is 0');
          eq(col.railDisplay, 'none', tag + ': collapsed rail hidden');
          ok(col.fabDisplay === 'flex' || col.fabDisplay === 'inline-flex', tag + `: collapsed FAB visible (got ${col.fabDisplay})`);
          await checkTapTargets(page, tag + ' collapsed');
          ok(col.overflow <= 0, tag + ': collapsed zero horizontal overflow');

          await page.locator('.site-chapter-fab').click();
          const exp = await readRailState(page);
          ok(!exp.collapsed, tag + ': FAB expands rail on desktop');
          eq(exp.bodyPaddingLeft, '240px', tag + ': expanded restores 240px padding');
        } else {
          // Mobile drawer checks (< 1180px)
          eq(init.bodyPaddingLeft, '0px', tag + ': narrow viewport has zero body padding-left');
          eq(init.drawerOpen, false, tag + ': drawer starts closed');
          eq(init.railAriaHidden, 'true', tag + ': closed drawer aria-hidden="true"');
          eq(init.backdropHidden, true, tag + ': backdrop hidden when closed');
          ok(init.fabDisplay === 'flex' || init.fabDisplay === 'inline-flex', tag + `: FAB visible on narrow viewport (got ${init.fabDisplay})`);

          // Open via FAB
          await page.locator('.site-chapter-fab').click();
          await page.waitForFunction(() => {
            const r = document.querySelector('.site-chapter-rail');
            if (!r || !r.classList.contains('is-open')) return false;
            const b = r.getBoundingClientRect();
            return b.left >= 0 && b.right <= window.innerWidth + 1 && getComputedStyle(r).visibility === 'visible';
          }, null, { timeout: 3000 });
          const openSt = await readRailState(page);
          ok(openSt.drawerOpen, tag + ': FAB opens drawer');
          eq(openSt.backdropHidden, false, tag + ': backdrop visible when open');
          ok(openSt.overflow <= 0, tag + ': zero overflow with drawer open');
          await checkTapTargets(page, tag + ' drawer open');

          if (SHOT && spec.kind === 'template-essay') {
            await page.screenshot({ path: path.join(SHOT, `${spec.kind}-drawer-${lang}-${width}.png`) });
          }

          // Escape closes drawer and restores focus to FAB
          await page.keyboard.press('Escape');
          const escSt = await readRailState(page);
          eq(escSt.drawerOpen, false, tag + ': Escape closes drawer');
          eq(await page.evaluate(() => document.activeElement?.className), 'site-chapter-fab', tag + ': Escape restores focus to FAB');

          // Reopen and close via backdrop click
          await page.locator('.site-chapter-fab').click();
          await page.locator('.site-chapter-backdrop').click({ position: { x: width - 10, y: 20 } });
          const bdSt = await readRailState(page);
          eq(bdSt.drawerOpen, false, tag + ': backdrop click closes drawer');

          // Reopen, click a chapter link -> closes drawer and jumps
          await page.locator('.site-chapter-fab').click();
          const targetHref = init.hrefs[spec.jumpIdx];
          await page.locator(`.site-chapter-rail a[href="${targetHref}"]`).click();
          await page.waitForFunction(
            (href) => !document.querySelector('.site-chapter-rail')?.classList.contains('is-open') &&
              document.querySelector('.site-chapter-rail a.is-active')?.getAttribute('href') === href,
            targetHref,
            { timeout: 5000 }
          );
          const jumped = await readRailState(page);
          eq(jumped.drawerOpen, false, tag + ': clicking drawer link closes drawer');
          eq(jumped.activeHref, targetHref, tag + ': clicking drawer link updates active chapter');
          ok(jumped.fabText.length > 0, tag + ': FAB shows active chapter after jump');
        }

        if (SHOT && width === 1280) {
          await page.screenshot({ path: path.join(SHOT, `${spec.kind}-${lang}-${width}.png`) });
        }

        eq(errors, [], tag + ': no page errors');
        await ctx.close();
      }
    }
  }
}

async function testLanguageToggle(browser) {
  for (const spec of CHAPTERED_PAGES.slice(0, 3)) {
    for (const width of [1280, 390]) {
      const tag = `lang-toggle ${spec.kind} ${width}`;
      const ctx = await ctxFor(browser, 'zh', width);
      const page = await ctx.newPage();
      await page.goto(BASE + spec.path, { waitUntil: 'load' });
      await waitRailReady(page, spec);

      await page.locator('#langToggle button[data-lang="en"]').click();
      await page.waitForFunction(() => document.documentElement.lang === 'en' && document.querySelector('.site-chapter-title')?.textContent === 'Chapters');
      await checkNoCjkInRail(page, tag);
      const enSt = await readRailState(page);
      eq(enSt.title, 'Chapters', tag + ': switches rail title to English');

      await page.locator('#langToggle button[data-lang="zh"]').click();
      await page.waitForFunction(() => document.documentElement.lang.startsWith('zh') && document.querySelector('.site-chapter-title')?.textContent === '目录');
      const zhSt = await readRailState(page);
      eq(zhSt.title, '目录', tag + ': switches rail title back to Chinese');

      await ctx.close();
    }
  }
}

async function testReducedMotion(browser) {
  const ctx = await ctxFor(browser, 'zh', 390, { reduce: true });
  const page = await ctx.newPage();
  await page.goto(BASE + 'computing/software/how-threejs-draws-a-scene/', { waitUntil: 'load' });
  await waitRailReady(page, CHAPTERED_PAGES[0]);
  const dur = await page.evaluate(() => {
    const r = document.querySelector('.site-chapter-rail');
    const f = document.querySelector('.site-chapter-fab');
    return [getComputedStyle(r).transitionDuration, getComputedStyle(f).transitionDuration];
  });
  eq(dur, ['0s', '0s'], 'reduced motion disables rail and FAB transitions');
  await page.locator('.site-chapter-fab').click();
  ok((await readRailState(page)).drawerOpen, 'reduced motion drawer opens cleanly');
  await page.locator('.site-chapter-rail a[href="#ch3"]').click();
  await page.waitForFunction(
    () => document.querySelector('.site-chapter-rail a.is-active')?.getAttribute('href') === '#ch3',
    null,
    { timeout: 3000 }
  );
  eq((await readRailState(page)).activeHref, '#ch3', 'reduced motion chapter jump activates immediately');
  await ctx.close();
}

async function testNonChapterPages(browser) {
  for (const p of NON_CHAPTER_PAGES) {
    for (const width of [1280, 390]) {
      const ctx = await ctxFor(browser, 'en', width);
      const page = await ctx.newPage();
      await page.goto(BASE + p, { waitUntil: 'load' });
      await page.waitForTimeout(200);
      const counts = await page.evaluate(() => ({
        hasClass: document.body.classList.contains('site-has-rail'),
        rail: document.querySelectorAll('.site-chapter-rail').length,
        fab: document.querySelectorAll('.site-chapter-fab').length,
        backdrop: document.querySelectorAll('.site-chapter-backdrop').length,
      }));
      eq(counts, { hasClass: false, rail: 0, fab: 0, backdrop: 0 }, `non-chapter ${p} ${width}: zero rail/FAB injected`);
      await ctx.close();
    }
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    await testChapteredPages(browser);
    await testLanguageToggle(browser);
    await testReducedMotion(browser);
    await testNonChapterPages(browser);
  } finally {
    await browser.close();
  }
  console.log(`PASS: chapter rail browser checks (${checks})`);
})().catch((e) => { console.error(e); process.exit(1); });
