'use strict';
// Browser smoke test for what-travels-through-empty-space.
// Usage: PORT=19004 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node physics/electromagnetism/what-travels-through-empty-space/tests/browser.cjs
// Optional SHOTS_DIR=<dir> saves screenshots at 1280/390/320 and reduced motion.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const port = process.env.PORT || '19004';
const base = (process.env.ESSAY_BASE_URL || `http://127.0.0.1:${port}`).replace(/\/$/, '');
const url = base + '/physics/electromagnetism/what-travels-through-empty-space/';
const shots = process.env.SHOTS_DIR;
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference'
  });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}

const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => {
  const e = document.getElementById(id);
  e.value = v;
  e.dispatchEvent(new Event('input', { bubbles: true }));
  e.dispatchEvent(new Event('change', { bubbles: true }));
}, [id, String(v)]);
const show = async (page, sel, ms = 0) => {
  await page.$eval(sel, e => e.scrollIntoView({ block: 'center' }));
  if (ms) await page.waitForTimeout(ms);
};
const pick = (page, name, v) => page.click(`input[name=${name}][value="${v}"]`, { force: true });

(async () => {
  const browser = await chromium.launch();
  if (shots) fs.mkdirSync(shots, { recursive: true });

  // 1. Layout, 48px targets, clipped text, overflow across zh/en and 1280 / 390 / 320 px
  for (const lang of ['zh', 'en']) {
    for (const width of [1280, 390, 320]) {
      const page = await open(browser, width, { lang });
      const tag = `${lang} ${width}`;
      ok((await page.evaluate(() => document.documentElement.lang)) === (lang === 'en' ? 'en' : 'zh-CN'), `${tag}: html lang`);
      ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle reads 中 | EN`);

      for (const fig of await page.$$('figure')) {
        await fig.evaluate(e => e.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(220);
      }

      const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
        if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const cs = getComputedStyle(e);
        if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
        return e.scrollWidth > e.clientWidth + 1;
      }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
      ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);

      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(over <= 0, `${tag}: horizontal overflow ${over}px`);

      const small = await page.evaluate(() => {
        const out = [];
        const boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
        for (const e of document.querySelectorAll('button, input, .toc a, a.back')) {
          const r = boxOf(e);
          if (!r.width && !r.height) continue;
          if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
        }
        return out;
      });
      ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);

      const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
        const r = e.getBoundingClientRect();
        return r.width && (r.right > innerWidth + 1 || r.left < -1);
      }).slice(0, 5).map(e => e.tagName + '#' + e.id));
      ok(!wide.length, `${tag}: elements outside viewport: ${wide.join(', ')}`);

      if (lang === 'en') {
        const cjkLeaks = await page.evaluate(() => {
          const out = [];
          const re = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/;
          const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = w.nextNode())) {
            const v = node.nodeValue.trim();
            if (!v) continue;
            const p = node.parentElement;
            if (!p || ['SCRIPT', 'STYLE'].includes(p.tagName) || p.closest('#langToggle')) continue;
            if (re.test(v)) out.push(p.tagName + '#' + p.id + ': ' + v.slice(0, 40));
          }
          if (re.test(document.title)) out.push('title: ' + document.title);
          return out.slice(0, 5);
        });
        ok(!cjkLeaks.length, `${tag}: unexpected CJK in EN mode: ${cjkLeaks.join(', ')}`);
      }
      ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);

      if (shots) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(shots, `full-${lang}-${width}.png`), fullPage: true });
      }
      await page.close();
    }
  }

  // 2. Interactive checks, keyboard control, EN toggle, and driving every model
  {
    const page = await open(browser, 1280);
    const title = await text(page, 'h1');
    ok(title.length > 0 && !title.includes('.'), 'hero title filled from copy');

    // EN toggle switches cleanly to English without errors or raw keys
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'EN toggle switches html lang to en');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN preference stored');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown in EN mode');
    await page.click('#langToggle [data-lang=zh]');

    // ch1: causal vs instant
    await show(page, '#kinkCv', 300);
    await setRange(page, 'kinkBeta', 0.35);
    await page.waitForTimeout(150);
    ok((await text(page, '#kinkBetaO')).startsWith('0.35'), 'ch1 beta readout updates');
    await pick(page, 'kinkMode', 'instant');
    await page.waitForTimeout(150);
    ok((await text(page, '#kinkRatio')) === '0.00', 'ch1 instant mode gives zero kink ratio');
    await pick(page, 'kinkMode', 'causal');

    // ch2: capacitor displacement current & high-f wave feedback
    await show(page, '#capCv', 250);
    await setRange(page, 'capF', 1000);
    await page.waitForTimeout(150);
    ok((await text(page, '#capIc')) === (await text(page, '#capId')), 'ch2 conduction == displacement peak');
    ok(parseFloat(await text(page, '#capFar')) > 20, 'ch2 1000 MHz Faraday correction > 20%');

    // ch3: FDTD slab & Courant instability
    await show(page, '#fdtdCv', 300);
    await setRange(page, 'fdtdN', 2.0);
    await page.waitForTimeout(150);
    ok((await text(page, '#fdtdV')).startsWith('0.500'), 'ch3 n=2.0 wave speed 0.500 c');
    await setRange(page, 'fdtdS', 1.04);
    await page.waitForTimeout(900);
    ok((await text(page, '#fdtdSay')).includes('警告') || (await text(page, '#fdtdU')) === '∞', 'ch3 S=1.04 triggers instability warning');
    await setRange(page, 'fdtdS', 0.98);
    await setRange(page, 'fdtdN', 1.5);

    // ch4: keyboard slider on dipole L/lambda
    await show(page, '#dipCv', 200);
    await page.focus('#dipL');
    const l0 = await text(page, '#dipLO');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
    ok((await text(page, '#dipLO')) !== l0, 'ch4 keyboard ArrowRight changes dipole L/lambda');
    await page.click('[data-dip-preset="0.50"]');
    ok((await text(page, '#dipR')).startsWith('73.1'), 'ch4 half-wave dipole R_rad = 73.1 ohm');

    // ch5: solar sail + 3 polarisers
    await show(page, '#sailCv', 200);
    await setRange(page, 'sailRef', 0);
    await page.waitForTimeout(120);
    ok((await text(page, '#sailP')).startsWith('4.54'), 'ch5 black absorber pressure = 4.54 uPa');
    await page.click('#polMid');
    await page.waitForTimeout(120);
    ok((await text(page, '#polOut')) === '0.0%', 'ch5 crossed polarisers without middle = 0.0%');
    await page.click('#polMid');
    ok((await text(page, '#polOut')) === '12.5%', 'ch5 45-deg middle polariser = 12.5%');

    // ch6: spectrum preset
    await show(page, '#specCv', 200);
    await page.click('[data-spec-f="16.3464"]');
    await page.waitForTimeout(120);
    ok((await text(page, '#specE')).startsWith('91.8'), 'ch6 EUV preset 91.8 eV');

    // ch7: atmospheric window
    await show(page, '#atmoCv', 200);
    await page.click('[data-atmo-f="10.778"]');
    await page.waitForTimeout(120);
    ok(parseFloat(await text(page, '#atmoT')) < 10, 'ch7 60 GHz O2 wall < 10% transmission');

    // ch8: Friis link budget keyboard & presets
    await show(page, '#linkCv', 200);
    await pick(page, 'linkPre', 'gps');
    await page.waitForTimeout(120);
    ok((await text(page, '#linkPrx')).startsWith('-127.2'), 'ch8 GPS Prx = -127.2 dBm');
    await pick(page, 'linkPre', 'voyager');
    ok((await text(page, '#linkFspl')).startsWith('319.2'), 'ch8 Voyager FSPL = 319.2 dB');

    // ch9: phased array grating lobe + 1550 nm fibre
    await show(page, '#arrCv', 200);
    await setRange(page, 'arrD', 0.80);
    await setRange(page, 'arrTh', 45);
    await page.waitForTimeout(120);
    ok((await text(page, '#arrGr')).includes('栅瓣'), 'ch9 d=0.80 @ 45 deg triggers grating lobe warning');
    ok(parseFloat(await text(page, '#fibLoss')) < 0.21, 'ch9 1550 nm fibre loss < 0.21 dB/km');

    // ch10: frontier switcher
    await show(page, '#frCv', 200);
    await pick(page, 'frDom', 'space');
    await page.waitForTimeout(120);
    ok((await text(page, '#frRec')).includes('267'), 'ch10 space frontier shows 267 Mbps');
    await pick(page, 'frDom', 'short');
    await page.waitForTimeout(120);
    ok((await text(page, '#frRec')).includes('8 nm'), 'ch10 short-wave frontier shows 8 nm');

    if (shots) {
      await show(page, '#fdtdCv', 250);
      await page.screenshot({ path: path.join(shots, 'ch3-fdtd-1280.png') });
      await show(page, '#arrCv', 250);
      await page.screenshot({ path: path.join(shots, 'ch9-array-1280.png') });
    }

    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // 3. Reduced motion
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: scrollBehavior auto');
    await show(page, '#fdtdCv', 250);
    ok(!(await text(page, '#fdtdR')).startsWith('—'), 'reduced motion: ch3 jumps straight to post-split Fresnel reading');
    if (shots) await page.screenshot({ path: path.join(shots, 'reduced-ch3-390.png') });
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) {
    console.error(fails.map(f => 'FAIL ' + f).join('\n'));
    process.exit(1);
  }
  console.log('PASS: browser smoke test (1280/390/320 overflow, clipped text, 48px targets, EN fallback, keyboard, all 10 models, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
