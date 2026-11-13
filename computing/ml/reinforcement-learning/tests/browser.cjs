'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { chromium } = require('playwright');

const BASE = process.env.ESSAY_URL || 'http://127.0.0.1:19021/computing/ml/reinforcement-learning/';
const SHOT_DIR = '/tmp/agent-tasks/essays/reinforcement-learning';

function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
}
function relLum([r, g, b]) {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(fg, bg) {
  const l1 = relLum(fg), l2 = relLum(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  let passed = 0;
  function ok(cond, msg) {
    passed += 1;
    assert.ok(cond, msg);
  }

  try {
    // 1. Desktop 1280x800 (zh + en + full interaction checks)
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__essayReady === true);
    ok(errors.length === 0, `Console/page errors on zh load: ${errors.join('; ')}`);

    // Overflow & 48px target checks on desktop
    const desktopAudit = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth > window.innerWidth;
      const smallTargets = [];
      const els = document.querySelectorAll('button, .btn, .lang, .toc a, .bar a, label.chk, input[type="range"]');
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.height < 47.5 || (el.tagName === 'BUTTON' && r.width < 47.5)) {
          smallTargets.push({ id: el.id || el.textContent.slice(0, 24), w: r.width, h: r.height });
        }
      }
      return { overflow, smallTargets };
    });
    ok(!desktopAudit.overflow, 'No horizontal overflow at 1280px');
    ok(desktopAudit.smallTargets.length === 0, `Targets <48px at 1280px: ${JSON.stringify(desktopAudit.smallTargets)}`);

    // Contrast check on body text, mute text, and gold controls
    const colors = await page.evaluate(() => {
      const b = getComputedStyle(document.body);
      const p = getComputedStyle(document.querySelector('section p'));
      const k = getComputedStyle(document.querySelector('.tile .k'));
      const btnOn = getComputedStyle(document.querySelector('.btn.on'));
      return {
        bg: b.backgroundColor,
        pColor: p.color,
        kColor: k.color,
        kBg: getComputedStyle(document.querySelector('.tile')).backgroundColor,
        btnOnColor: btnOn.color,
        btnOnBg: btnOn.backgroundColor
      };
    });
    ok(contrast(parseRgb(colors.pColor), parseRgb(colors.bg)) >= 4.5, 'Body paragraph contrast >= 4.5:1');
    ok(contrast(parseRgb(colors.kColor), parseRgb(colors.kBg)) >= 4.5, 'Tile label contrast >= 4.5:1');
    ok(contrast(parseRgb(colors.btnOnColor), parseRgb(colors.btnOnBg)) >= 4.5, 'Active button contrast >= 4.5:1');

    // Interactive checks across chapters
    await page.locator('#c1Eps').fill('0');
    await page.locator('#c1Eps').dispatchEvent('input');
    ok((await page.locator('#c1Say').getAttribute('data-key')) === 'c1.sayNoEps', 'Ch1 slider=0 updates live sentence');

    await page.click('#c2PolNaive');
    ok((await page.locator('#c2Say').getAttribute('data-key')) === 'c2.sayNaive', 'Ch2 policy switch updates live sentence');

    await page.click('#c3ModePI');
    await page.click('#c3Step');
    ok((await page.locator('#c3Say').getAttribute('data-key')) === 'c3.sayPI', 'Ch3 PI mode step works');

    await page.click('#c5Base');
    ok((await page.locator('#c5Say').getAttribute('data-key')) === 'c5.sayNoBase', 'Ch5 baseline toggle updates live sentence');

    await page.click('#c6AdvNeg');
    ok((await page.locator('#c6Say').getAttribute('data-key')) === 'c6.sayNeg', 'Ch6 negative advantage button works');

    await page.locator('#c7Budget').fill('250');
    await page.locator('#c7Budget').dispatchEvent('input');
    ok((await page.locator('#c7Say').getAttribute('data-key')) === 'c7.sayMatch', 'Ch7 budget=250 finds Minimax optimal move');

    await page.locator('#c8Coin').fill('1.2');
    await page.locator('#c8Coin').dispatchEvent('input');
    ok((await page.locator('#c8Say').getAttribute('data-key')) === 'c8.sayHacking', 'Ch8 high coin enters reward hacking');
    await page.locator('#c8Kl').fill('0.6');
    await page.locator('#c8Kl').dispatchEvent('input');
    ok((await page.locator('#c8Say').getAttribute('data-key')) === 'c8.sayKlSaved', 'Ch8 KL constraint saves from hacking');

    await page.click('[data-dom="robotics"]');
    ok((await page.locator('#c9Say').getAttribute('data-key')) === 'c9.sayRob', 'Ch9 frontier selector updates domain');

    await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-zh-top.png') });
    await page.locator('#lab6').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-zh-lab6.png') });

    // Switch to English and check zero CJK in visible text (excluding #langZh button)
    await page.click('#langEn');
    const enCheck = await page.evaluate(() => {
      const clone = document.body.cloneNode(true);
      const zhBtn = clone.querySelector('#langZh');
      if (zhBtn) zhBtn.remove();
      return {
        lang: document.documentElement.lang,
        hasCjk: /[\u4e00-\u9fff]/.test(clone.innerText),
        title: document.title
      };
    });
    ok(enCheck.lang === 'en', 'Language switched to en');
    ok(!enCheck.hasCjk, 'Zero CJK remaining in rendered English DOM');
    await page.locator('#lab1').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(SHOT_DIR, 'desktop-en-lab1.png') });
    await ctx.close();

    // 2. Mobile 390x844 & 320x640 viewports
    for (const width of [390, 320]) {
      const mCtx = await browser.newContext({ viewport: { width, height: 700 }, locale: 'en-US' });
      const mPage = await mCtx.newPage();
      const mErrs = [];
      mPage.on('pageerror', (e) => mErrs.push(String(e)));
      await mPage.goto(BASE, { waitUntil: 'networkidle' });
      await mPage.waitForFunction(() => window.__essayReady === true);
      const overflow = await mPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      ok(!overflow, `No horizontal overflow at ${width}px`);
      ok(mErrs.length === 0, `Zero pageerrors at ${width}px`);
      await mPage.locator('#lab4').scrollIntoViewIfNeeded();
      await mPage.screenshot({ path: path.join(SHOT_DIR, `mobile-${width}-lab4.png`) });
      await mCtx.close();
    }

    // 3. Reduced motion check
    const rmCtx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const rmPage = await rmCtx.newPage();
    await rmPage.goto(BASE, { waitUntil: 'networkidle' });
    await rmPage.waitForFunction(() => window.__essayReady === true);
    const rmState = await rmPage.locator('#c3Say').getAttribute('data-key');
    ok(rmState === 'c3.sayVIConv', 'Reduced motion boots Ch3 directly in converged steady state');
    await rmCtx.close();

    console.log(`PASS: ${passed} Playwright browser checks succeeded across 1280/390/320, zh/en, and reduced-motion.`);
  } finally {
    await browser.close();
  }
})();
