'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { chromium } = require('playwright');

const PORT = process.env.PORT || '19011';
const BASE = process.env.ESSAY_BASE_URL || `http://127.0.0.1:${PORT}`;
const URL = `${BASE.replace(/\/$/, '')}/economics/macro/how-an-economy-is-measured/`;
const SHOT_DIR = process.env.SHOT_DIR || '/tmp/agent-tasks/essays/review-how-an-economy-is-measured/shots';

async function setRange(page, sel, val) {
  await page.locator(sel).evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, val);
}

async function clickRadio(page, name, value) {
  const lbl = page.locator(`input[name="${name}"][value="${value}"]`).locator('..');
  await lbl.scrollIntoViewIfNeeded();
  await lbl.click();
}

async function switchLang(page, lang) {
  await page.locator(`#langToggle button[data-lang="${lang}"]`).click();
  await page.waitForTimeout(160);
  const pressed = await page.locator(`#langToggle button[data-lang="${lang}"]`).getAttribute('aria-pressed');
  assert.strictEqual(pressed, 'true', `Expected lang ${lang} aria-pressed=true`);
}

async function checkLayout(page, label, lang, shots) {
  const res = await page.evaluate((expectedLang) => {
    const sw = document.documentElement.scrollWidth;
    const iw = window.innerWidth;
    const ready = window.__essayReady === true;
    const docLang = document.documentElement.lang;
    const title = document.title;

    const missingText = [...document.querySelectorAll('[data-i18n], [data-i18n-html]')].filter(el => {
      if (el.closest('.hidden')) return false;
      return el.textContent.trim() === '';
    }).map(el => el.dataset.i18n || el.dataset.i18nHtml);

    // Unexpected CJK check in EN mode (allow ONLY the '中' toggle button)
    const cjkRe = /[\u4e00-\u9fff]/;
    const cjkLeaks = [];
    if (expectedLang === 'en') {
      if (cjkRe.test(title)) cjkLeaks.push(`document.title: ${title}`);
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (cjkRe.test(node.nodeValue)) {
          const el = node.parentElement;
          const isZhBtn = el && el.tagName === 'BUTTON' && el.dataset.lang === 'zh' && node.nodeValue.trim() === '中';
          if (!isZhBtn) {
            cjkLeaks.push(`${el ? el.tagName + '#' + el.id : 'node'}: "${node.nodeValue.trim().slice(0, 40)}"`);
          }
        }
      }
      document.querySelectorAll('[aria-label]').forEach(el => {
        const al = el.getAttribute('aria-label') || '';
        if (cjkRe.test(al)) cjkLeaks.push(`aria-label(${el.tagName}#${el.id}): ${al}`);
      });
    }

    // Touch target size check (>= 48px on interactive elements; track <44 as hard error, <48 reported)
    const smallTargets44 = [];
    const smallTargets48 = [];
    document.querySelectorAll('a.back, #langToggle button, .seg label, .ctl label.chk, .ctl input[type=range], .toc a').forEach(el => {
      if (el.closest('.hidden')) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const desc = `${el.tagName}.${el.className || el.id}: ${Math.round(r.width)}x${Math.round(r.height)}`;
      if (r.height < 44) smallTargets44.push(desc);
      if (r.height < 48 || (el.tagName !== 'INPUT' && r.width < 48)) smallTargets48.push(desc);
    });

    // Horizontal clipping check on blocks and text containers
    const clippedLabs = [];
    document.querySelectorAll('figure.lab, .eq, .read, .card, header.hero, footer').forEach(el => {
      if (el.closest('.hidden')) return;
      const r = el.getBoundingClientRect();
      if (r.right > iw + 2 && el.closest('.tbl') == null) {
        clippedLabs.push(`${el.tagName}.${el.className}: right=${Math.round(r.right)} > ${iw}`);
      }
    });

    // Ensure non-scrollable headings/buttons/labels are not horizontally overflowing internally
    const clippedText = [];
    document.querySelectorAll('.lab-t, .lab-how, .read .k, .read .v, .seg label, .ctl .lbl').forEach(el => {
      if (el.closest('.hidden')) return;
      if (el.scrollWidth > el.clientWidth + 3) {
        clippedText.push(`${el.className}: scrollW=${el.scrollWidth} > clientW=${el.clientWidth} ("${el.textContent.trim().slice(0, 30)}")`);
      }
    });

    const canvases = [...document.querySelectorAll('canvas.cv')].length;
    return {
      sw, iw, ready, docLang, title, canvases,
      missingText, cjkLeaks, smallTargets44, smallTargets48, clippedLabs, clippedText
    };
  }, lang);

  const expectedDocLang = lang === 'zh' ? 'zh-CN' : 'en';
  assert(res.ready, `${label}: window.__essayReady !== true`);
  assert.strictEqual(res.docLang, expectedDocLang, `${label}: html[lang]=${res.docLang}, expected ${expectedDocLang}`);
  assert.strictEqual(res.canvases, 10, `${label}: expected 10 canvases, got ${res.canvases}`);
  assert(res.sw <= res.iw + 1, `${label}: horizontal overflow scrollWidth=${res.sw} > innerWidth=${res.iw}`);
  assert.strictEqual(res.missingText.length, 0, `${label}: empty i18n nodes: ${res.missingText.join(', ')}`);
  assert.strictEqual(res.cjkLeaks.length, 0, `${label}: unexpected CJK in ${lang} mode: ${res.cjkLeaks.join('; ')}`);
  assert.strictEqual(res.clippedLabs.length, 0, `${label}: clipped blocks: ${res.clippedLabs.join('; ')}`);
  assert.strictEqual(res.clippedText.length, 0, `${label}: clipped text: ${res.clippedText.join('; ')}`);
  assert.strictEqual(res.smallTargets44.length, 0, `${label}: <44px touch targets: ${res.smallTargets44.join('; ')}`);
  assert.strictEqual(res.smallTargets48.length, 0, `${label}: <48px touch targets: ${res.smallTargets48.join('; ')}`);

  if (shots && shotsDirWritable()) {
    for (const id of ['hero', 'ch1', 'ch2', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch10']) {
      if (id === 'hero') await page.evaluate(() => window.scrollTo(0, 0));
      else await page.locator(`#${id} .lab`).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(220);
      await page.screenshot({ path: path.join(SHOT_DIR, `${label}-${id}.png`) });
    }
  }
}

async function checkAllCanvasesNonBlank(page, label) {
  for (let i = 1; i <= 10; i++) {
    await page.locator(`#g${i}Cv`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(140);
    const nonZero = await page.locator(`#g${i}Cv`).evaluate(cv => {
      const ctx = cv.getContext('2d');
      const d = ctx.getImageData(0, 0, Math.min(cv.width, 200), Math.min(cv.height, 200)).data;
      let sum = 0;
      for (let k = 3; k < d.length; k += 16) sum += d[k];
      return sum > 0;
    });
    assert(nonZero, `${label}: Canvas #g${i}Cv rendered blank`);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  const attachErrorHooks = (page, tag) => {
    page.on('pageerror', e => errors.push(`${tag} pageerror: ${e.message}`));
    page.on('response', r => {
      if (r.status() >= 400) {
        errors.push(`${tag} HTTP ${r.status()}: ${r.url()}`);
      }
    });
    page.on('console', m => {
      if (m.type() === 'error') {
        errors.push(`${tag} console.error: ${m.text()}`);
      }
    });
  };

  /* ── 1. Desktop 1280x860: ZH + interactive model driving + EN switch + redraw ── */
  const ctxDesk = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 });
  const page = await ctxDesk.newPage();
  attachErrorHooks(page, 'desktop');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('body');
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await switchLang(page, 'zh');

  await checkLayout(page, 'desktop-1280-zh', 'zh', true);

  // Drive Ch1
  await page.locator('#ch1').scrollIntoViewIfNeeded();
  await setRange(page, '#g1Home', 20);
  await page.waitForTimeout(120);
  assert.strictEqual((await page.locator('#g1Gdp').textContent()).trim(), '140');
  await setRange(page, '#g1Home', 0);

  // Drive Ch2
  await page.locator('#ch2').scrollIntoViewIfNeeded();
  await setRange(page, '#g2Sig', 0);
  await page.waitForTimeout(120);
  assert.strictEqual((await page.locator('#g2Bias').textContent()).trim(), '0.0');
  await setRange(page, '#g2Sig', 1.5);

  // Drive Ch3 (step=1 allows 45%)
  await page.locator('#ch3').scrollIntoViewIfNeeded();
  await setRange(page, '#g3Sh', 45);
  assert.strictEqual((await page.locator('#g3Sh').inputValue()), '45');
  await setRange(page, '#g3Sh', 35);
  await page.locator('#g3Hed').uncheck();
  await page.waitForTimeout(120);
  assert.strictEqual((await page.locator('#g3Head').textContent()).trim(), '3.96%');
  await page.locator('#g3Hed').check();

  // Drive Ch4 modes + capture ZH shots
  await page.locator('#ch4').scrollIntoViewIfNeeded();
  for (const mode of ['seasonal', 'revisions', 'rates']) {
    await clickRadio(page, 'g4Mode', mode);
    await page.waitForTimeout(180);
    if (shotsDirWritable() && mode !== 'rates') {
      await page.locator('#ch4 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-zh-ch4-${mode}.png`) });
    }
  }

  // Drive Ch5 modes + capture ZH Lorenz shot
  await page.locator('#ch5').scrollIntoViewIfNeeded();
  await clickRadio(page, 'g5Mode', 'lorenz');
  await page.waitForTimeout(180);
  if (shotsDirWritable()) {
    await page.locator('#ch5 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-zh-ch5-lorenz.png`) });
  }
  await clickRadio(page, 'g5Mode', 'ppp');

  // Drive Ch6 modes + capture ZH Beveridge/Okun shots
  await page.locator('#ch6').scrollIntoViewIfNeeded();
  for (const mode of ['beveridge', 'okun', 'defs']) {
    await clickRadio(page, 'g6Mode', mode);
    await page.waitForTimeout(180);
    if (shotsDirWritable() && mode !== 'defs') {
      await page.locator('#ch6 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-zh-ch6-${mode}.png`) });
    }
  }

  // Drive Ch7 modes + capture ZH Gap shot
  await page.locator('#ch7').scrollIntoViewIfNeeded();
  await clickRadio(page, 'g7Mode', 'gap');
  await page.waitForTimeout(180);
  if (shotsDirWritable()) {
    await page.locator('#ch7 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-zh-ch7-gap.png`) });
  }
  await clickRadio(page, 'g7Mode', 'sahm');

  // Drive Ch8 period + HC + manual alpha check
  await page.locator('#ch8').scrollIntoViewIfNeeded();
  await clickRadio(page, 'g8Per', '2005-2019');
  await page.locator('#g8HC').check();
  await page.waitForTimeout(150);
  assert.strictEqual((await page.locator('#g8Tfp').textContent()).trim(), '0.26%');
  await page.locator('#g8HC').uncheck();
  await clickRadio(page, 'g8Per', '1995-2005');

  // Drive Ch9 disaster + depr
  await page.locator('#ch9').scrollIntoViewIfNeeded();
  await setRange(page, '#g9Dis', 15);
  await page.locator('#g9Depr').check();
  await page.waitForTimeout(150);
  assert.strictEqual((await page.locator('#g9Adj').textContent()).trim(), '106.0');
  await page.locator('#g9Depr').uncheck();
  await setRange(page, '#g9Dis', 0);

  // Drive Ch10 survey non-response model + table check
  await page.locator('#ch10').scrollIntoViewIfNeeded();
  await setRange(page, '#g10Resp', 80);
  await setRange(page, '#g10Bias', 0);
  await page.waitForTimeout(150);
  assert.strictEqual((await page.locator('#g10D').textContent()).trim(), '0.35 pp');
  await setRange(page, '#g10Resp', 35);
  await setRange(page, '#g10Bias', 1.6);
  assert.strictEqual(await page.locator('#frTable tbody tr').count(), 5, 'Expected 5 rows in #frTable');

  await checkAllCanvasesNonBlank(page, 'desktop-1280-zh');

  // Verify canvas redraw when switching language while viewing #g7Cv in Gap mode
  await page.locator('#ch7').scrollIntoViewIfNeeded();
  await clickRadio(page, 'g7Mode', 'gap');
  await page.waitForTimeout(180);
  const g7Before = await page.locator('#g7Cv').evaluate(cv => cv.toDataURL());
  await switchLang(page, 'en');
  await page.waitForTimeout(200);
  const g7After = await page.locator('#g7Cv').evaluate(cv => cv.toDataURL());
  assert.notStrictEqual(g7Before, g7After, 'Canvas #g7Cv did not redraw localized labels on lang switch');

  await checkLayout(page, 'desktop-1280-en', 'en', true);
  if (shotsDirWritable()) {
    await page.locator('#ch7').scrollIntoViewIfNeeded();
    await clickRadio(page, 'g7Mode', 'gap');
    await page.waitForTimeout(180);
    await page.locator('#ch7 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-en-ch7-gap.png`) });
    await clickRadio(page, 'g7Mode', 'sahm');

    await page.locator('#ch4').scrollIntoViewIfNeeded();
    await clickRadio(page, 'g4Mode', 'seasonal');
    await page.waitForTimeout(180);
    await page.locator('#ch4 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-en-ch4-seasonal.png`) });
    await clickRadio(page, 'g4Mode', 'rates');

    await page.locator('#ch5').scrollIntoViewIfNeeded();
    await clickRadio(page, 'g5Mode', 'lorenz');
    await page.waitForTimeout(180);
    await page.locator('#ch5 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-en-ch5-lorenz.png`) });
    await clickRadio(page, 'g5Mode', 'ppp');

    await page.locator('#ch6').scrollIntoViewIfNeeded();
    await clickRadio(page, 'g6Mode', 'beveridge');
    await page.waitForTimeout(180);
    await page.locator('#ch6 .lab').screenshot({ path: path.join(SHOT_DIR, `desktop-1280-en-ch6-beveridge.png`) });
    await clickRadio(page, 'g6Mode', 'defs');
  }
  await checkAllCanvasesNonBlank(page, 'desktop-1280-en');

  // Keyboard / focus smoke check on #langToggle and #g1Home
  await page.locator('#langToggle button[data-lang="zh"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'zh-CN', 'Keyboard Enter on ZH button failed');
  await page.locator('#g1Home').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  assert.strictEqual(await page.locator('#g1Home').inputValue(), '5', 'Keyboard ArrowRight on #g1Home failed');
  await setRange(page, '#g1Home', 0);

  await ctxDesk.close();

  /* ── 2. Mobile 390x844 (ZH + EN) ── */
  const ctxMob390 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p390 = await ctxMob390.newPage();
  attachErrorHooks(p390, 'mobile390');
  await p390.goto(URL, { waitUntil: 'networkidle' });
  await switchLang(p390, 'zh');
  await checkLayout(p390, 'mobile-390-zh', 'zh', true);
  await checkAllCanvasesNonBlank(p390, 'mobile-390-zh');
  await switchLang(p390, 'en');
  await checkLayout(p390, 'mobile-390-en', 'en', true);
  await checkAllCanvasesNonBlank(p390, 'mobile-390-en');
  await ctxMob390.close();

  /* ── 3. Narrow 320x568 + Reduced Motion (ZH + EN) ── */
  const ctxMob320 = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const p320 = await ctxMob320.newPage();
  attachErrorHooks(p320, 'mobile320');
  await p320.goto(URL, { waitUntil: 'networkidle' });
  await switchLang(p320, 'zh');
  await checkLayout(p320, 'mobile-320-zh', 'zh', true);
  await checkAllCanvasesNonBlank(p320, 'mobile-320-zh');
  await switchLang(p320, 'en');
  await checkLayout(p320, 'mobile-320-en', 'en', true);
  await checkAllCanvasesNonBlank(p320, 'mobile-320-en');
  await ctxMob320.close();

  await browser.close();

  if (errors.length > 0) {
    console.error('Browser errors:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log(`browser.cjs: PASS (zh+en @ 1280/390/320 + reduced-motion + keyboard, ${URL})`);
}

function shotsDirWritable() {
  try { fs.mkdirSync(SHOT_DIR, { recursive: true }); return true; }
  catch { return false; }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
