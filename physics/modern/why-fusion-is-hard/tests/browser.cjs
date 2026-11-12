'use strict';
// Browser smoke test for the fusion essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18986 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node physics/modern/why-fusion-is-hard/tests/browser.cjs
// Optional SHOTS_DIR=<dir> saves full-page screenshots per width.
// Checks in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped in its own box,
// every control at least 48×48 px, the toggle reads 中 | EN; keyboard operation of a slider and a radio group;
// every model responding to its controls; reduced motion. English copy does not exist yet (translation step follows),
// so the EN toggle is checked only for falling back to Chinese without errors or raw keys.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18986').replace(/\/$/, '');
const url = base + '/physics/modern/why-fusion-is-hard/';
const shots = process.env.SHOTS_DIR;
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
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
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, v) => page.click(`input[name=${name}][value="${v}"]`, { force: true });

(async () => {
  const browser = await chromium.launch();

  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width);
    const tag = `zh ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => {
      const out = [];
      const boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /\{\w+\}|^\w+(\.\w+)+$|NaN|undefined/.test(e.textContent.trim())).map(e => e.dataset.i18n || e.dataset.i18nHtml));
    ok(!raw.length, `${tag}: unresolved text in ${raw.slice(0, 5).join(', ')}`);
    if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, `zh-${width}-full.png`), fullPage: true }); }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle (no English copy yet: falls back to Chinese cleanly), keyboard, and every model
  {
    const page = await open(browser, 1280);
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // keyboard: arrow keys move a slider and a radio group
    await show(page, '#cbT', 200); await page.focus('#cbT'); await page.keyboard.press('ArrowRight');
    ok((await text(page, '#cbTo')).startsWith('11'), 'keyboard moves the temperature slider: ' + await text(page, '#cbTo'));
    await page.focus('input[name=bdRx][value=dt]'); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('input[name=bdRx][value=ddn]', e => e.checked), 'arrow key moves the reaction radio group');
    const focusRing = await page.evaluate(() => { const e = document.activeElement.closest('label'); return getComputedStyle(e).outlineStyle; });
    ok(focusRing !== 'none', 'focused radio shows a focus ring');

    await show(page, '#bdCv'); await pick(page, 'bdRx', 'pb11'); await page.waitForTimeout(150);
    ok((await text(page, '#bdQ')).startsWith('8.68'), 'ch1 p–B11 Q = 8.68: ' + await text(page, '#bdQ'));
    await show(page, '#cbCv'); await setRange(page, 'cbT', 100); await page.waitForTimeout(150);
    ok((await text(page, '#cbSay')).includes('74 倍'), 'ch2 at 100 keV: 74× the solar core');
    await show(page, '#gmCv'); await setRange(page, 'gmT', 100); await page.waitForTimeout(150);
    ok((await text(page, '#gmSay')).includes('67 keV'), 'ch3 past the D–T peak at 67 keV');
    await show(page, '#lwCv'); await setRange(page, 'lwN', 23); await page.waitForTimeout(150);
    ok((await text(page, '#lwQ')) === '已点火', 'ch4 top of the diagram is ignited');
    await show(page, '#orCv', 300);
    ok((await text(page, '#orKind')) === '漂到壁上', 'ch5 without twist the ion drifts to the wall');
    await page.click('#orTwist', { force: true }); await page.waitForTimeout(400);
    ok((await text(page, '#orKind')) === '通行粒子', 'ch5 with twist the ion is confined: ' + await text(page, '#orKind'));
    await pick(page, 'orSp', 'alpha'); await setRange(page, 'orPitch', 0.3); await setRange(page, 'orQ', 6); await page.waitForTimeout(400);
    ok((await text(page, '#orKind')) === '撞壁丢失', 'ch5 fat alpha banana at q = 6 is lost');
    await show(page, '#tkCv'); await pick(page, 'tkP', 'sparc'); await page.waitForTimeout(150);
    ok((await text(page, '#tkI')).startsWith('8.7'), 'ch6 SPARC preset current 8.7 MA');
    ok(await page.$eval('#tkB', e => e.value) === '12.2', 'ch6 preset moves the field slider');
    await show(page, '#icCv'); await setRange(page, 'icRho', 1.7); await page.waitForTimeout(150);
    ok((await text(page, '#icG')) === '—', 'ch7 too diffuse: no gain');
    await show(page, '#skCv'); await setRange(page, 'skQ', 0); await page.waitForTimeout(150);
    ok(parseFloat(await text(page, '#skQe')) < 1, 'ch8 Q_sci = 1 loses electricity');
    await show(page, '#trCv'); await setRange(page, 'trTbr', 1); await page.waitForTimeout(150);
    ok((await text(page, '#trTd')) === '不会翻倍', 'ch9 TBR = 1 never doubles');
    await show(page, '#whCv'); await setRange(page, 'whF', 0); await page.waitForTimeout(150);
    ok((await text(page, '#whQt')).startsWith('166'), 'ch9 ITER-size target with no radiation: 166 MW/m², got ' + await text(page, '#whQt'));
    await show(page, '#fxCv'); await page.click('#fxProj', { force: true }); await page.waitForTimeout(150);
    ok(!(await text(page, '#fxSay')).includes('空心点'), 'ch10 projections sentence follows the checkbox');
    await show(page, '#fdCv'); await pick(page, 'fdL', 'V'); await page.waitForTimeout(150);
    ok((await text(page, '#fdDemo')) === '1990', 'ch11 Logic V DEMO 1990');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll, the orbit replay shows its end state at once
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#orCv', 200);
    const a = await page.$eval('#orCv', c => c.toDataURL()); await page.waitForTimeout(600); const b = await page.$eval('#orCv', c => c.toDataURL());
    ok(a === b, 'reduced motion: the orbit is drawn complete, not animated');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (shots) await page.screenshot({ path: path.join(shots, 'zh-390-reduced-orbit.png') });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh at 1280/390/320: overflow, clipped text, 48px targets, unresolved text; toggle fallback, keyboard, all eleven chapters\' models, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
