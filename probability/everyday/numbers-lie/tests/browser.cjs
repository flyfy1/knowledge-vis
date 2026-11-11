'use strict';
// Playwright smoke test for the numbers-lie essay.
// Base URL from NL_BASE_URL (default http://127.0.0.1:18881), served from the repo root.
// Run: NODE_PATH=~/Documents/integ-life/integ-games/node_modules NL_BASE_URL=http://127.0.0.1:18881 node probability/everyday/numbers-lie/tests/browser.cjs
const { chromium } = require('playwright');
const base = (process.env.NL_BASE_URL || 'http://127.0.0.1:18881').replace(/\/$/, '');
const url = base + '/probability/everyday/numbers-lie/';
const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: 'zh-CN', reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage(), errors = [];
  // record every string drawn on a canvas, so English mode can be checked for leftover Chinese labels
  await page.addInitScript(lang => {
    window.__drawn = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__drawn.add(String(s)); return f.call(this, s, ...a); };
    if (lang) try { localStorage.setItem('knowledge-lang', lang); } catch (e) { /* ignore */ }
  }, opts.lang || null);
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/copy\.en\.js|404|Failed to load resource/.test(m.text() + (m.location().url || ''))) errors.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true);
  return { ctx, page, errors };
}

const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const text = (page, id) => page.$eval('#' + id, e => e.textContent.trim());

async function main() {
  const browser = await chromium.launch();
  const CJK = /[\u3400-\u9fff\uff00-\uffef\u3000-\u303f]/;
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const { ctx, page, errors } = await open(browser, width, { lang: lang === 'en' ? 'en' : null });
    const W = `${lang} ${width}`;
    check(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${W}: ${lang === 'zh' ? 'zh first visit' : 'stored en is used'}`);
    check((await page.title()).length > 0 && !(await page.title()).includes('doc.title'), `${width}: title from copy`);
    // no raw keys left on the page
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => e.textContent.trim() === (e.dataset.i18n || e.dataset.i18nHtml)).map(e => e.dataset.i18n || e.dataset.i18nHtml));
    check(raw.length === 0, `${width}: untranslated keys ${raw.join(',')}`);
    // walk every chapter into view so every canvas draws
    for (const id of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']) { await page.$eval('#' + id, e => e.scrollIntoView()); await page.waitForTimeout(450); }
    if (lang === 'en') {
      // drive every control once so generated sentences and canvas labels in all states are rendered, then look for Chinese
      for (const id of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']) {
        await page.$eval('#' + id + ' canvas', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150);
        for (const r of await page.$$eval('#' + id + ' input[type=range]', a => a.map(e => [e.id, e.min, e.max, e.value]))) { for (const v of [r[1], r[2], r[3]]) { await setRange(page, r[0], v); await page.waitForTimeout(40); } }
        for (const el of await page.$$('#' + id + ' button, #' + id + ' input[type=checkbox]')) { if (!(await el.isDisabled())) { await el.evaluate(e => e.click()); await page.waitForTimeout(80); } }
        await page.waitForTimeout(150);
      }
      const leftovers = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = walker.nextNode());) { const el = n.parentElement; if (!el || el.closest('[data-lang=zh]') || el.closest('script,style')) continue; if (rx.test(n.textContent) && el.getClientRects().length) out.push('text: ' + n.textContent.trim().slice(0, 60)); }
        for (const el of document.querySelectorAll('[aria-label],[aria-valuetext],[title],[alt]')) for (const a of ['aria-label', 'aria-valuetext', 'title', 'alt']) { const v = el.getAttribute(a); if (v && rx.test(v) && !el.closest('[data-lang=zh]')) out.push(a + ': ' + v.slice(0, 60)); }
        if (rx.test(document.title)) out.push('title: ' + document.title);
        const md = document.querySelector('meta[name=description]'); if (md && rx.test(md.content)) out.push('meta description');
        for (const s of window.__drawn) if (rx.test(s)) out.push('canvas: ' + s);
        return out;
      }, CJK.source);
      check(leftovers.length === 0, `${W}: Chinese visible in English mode: ${leftovers.slice(0, 12).join(' | ')}`);
      check(await page.$eval('#langToggle', e => e.innerText.replace(/\s+/g, ' ').trim()) === '中 EN', `${W}: toggle reads 中 | EN`);
    }
    const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    check(ov.sw <= ov.cw, `${W}: horizontal overflow ${ov.sw} > ${ov.cw}`);
    // targets >= 48px (inline links in running text are exempt, as in WCAG 2.5.8)
    const small = await page.evaluate(() => {
      const out = [];
      const els = [...document.querySelectorAll('a, button, input, select, [tabindex]')];
      for (const el of els) {
        if (el.closest('p, .qs li') && el.tagName === 'A') continue;
        const target = el.type === 'checkbox' ? el.closest('label') : el;
        const r = target.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.width < 48 || r.height < 48) out.push(`${el.tagName}#${el.id || ''}.${el.className} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
      }
      return out;
    });
    check(small.length === 0, `${W}: small targets ${small.join('; ')}`);
    // canvases have non-zero size and drew something
    const blank = await page.evaluate(() => [...document.querySelectorAll('canvas')].filter(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return false; return true; }).map(c => c.id));
    check(blank.length === 0, `${W}: blank canvases ${blank.join(',')}`);
    if (width === 1280 && lang === 'zh') {
      // drive each model once
      await page.$eval('#c1', e => e.scrollIntoView());
      const b0 = await text(page, 'c1bd'); await setRange(page, 'c1luck', 0); check(/^0(\.0)? 分$/.test(await text(page, 'c1bd')), 'c1: luck 0 gives no change: ' + await text(page, 'c1bd'));
      await setRange(page, 'c1luck', 50); check(await text(page, 'c1bd') === b0, 'c1: back to default'); await page.click('#c1retest'); await page.click('#c1ctrl');
      check(!(await page.$eval('#c1sdBox', e => e.hidden)), 'c1: control readouts visible');
      await page.$eval('#c2', e => e.scrollIntoView()); await page.click('#c2next'); await page.waitForTimeout(200);
      check(/^\d+$/.test(await text(page, 'c2prev')), 'c2: previous-top rank shown after next year');
      await page.$eval('#c3', e => e.scrollIntoView()); await page.waitForTimeout(7500);
      check(await text(page, 'c3alive') === '726', 'c3: 726 survivors after ten years: ' + await text(page, 'c3alive'));
      check(await text(page, 'c3surv') === '5.8%' && await text(page, 'c3all') === '4.0%', 'c3: 5.8% vs 4.0%');
      await page.click('#c3more'); await page.waitForTimeout(3800); check(await text(page, 'c3after') === '4.5%', 'c3: next five years 4.5%: ' + await text(page, 'c3after'));
      await page.$eval('#c4', e => e.scrollIntoView()); await page.click('#c4many'); await page.waitForTimeout(6000);
      check(/共 201 轮/.test(await text(page, 'c4shareN')), 'c4: 200 more rounds: ' + await text(page, 'c4shareN'));
      check(await text(page, 'c4theory') === '64%', 'c4: theory 64%');
      await page.click('#c4round'); if (await page.$eval('#c4rep', e => !e.disabled)) { await page.click('#c4rep'); check((await text(page, 'c4say')).length > 0, 'c4: replication sentence'); }
      await page.$eval('#c5', e => e.scrollIntoView()); check(await text(page, 'c5At') === '78.0%' && await text(page, 'c5Bt') === '82.6%', 'c5: 1986 pooled');
      await page.click('#c5rand'); check(await page.$eval('#c5At', e => e.classList.contains('win')), 'c5: randomised -> A wins');
      await page.$eval('#c6', e => e.scrollIntoView()); check(await text(page, 'c6ppv') === '15.4%', 'c6: ppv 15.4%'); await page.click('#c6clinic'); check(await text(page, 'c6ppv') === '88.5%', 'c6: clinic 88.5%');
      await page.$eval('#c7', e => e.scrollIntoView()); check(await text(page, 'c7nn') === '10,000', 'c7: 10,000'); await page.click('#c7common'); check(await text(page, 'c7nn') === '10', 'c7: 10');
      await page.$eval('#c8', e => e.scrollIntoView()); const m0 = await text(page, 'c8mean'); await page.click('#c8rich'); check(await text(page, 'c8mean') !== m0, 'c8: rich arrival moves mean');
      await page.$eval('#c9', e => e.scrollIntoView()); await page.waitForTimeout(1500); const r1 = +(await text(page, 'c9round')); check(r1 > 3, 'c9: runs while visible: ' + r1);
      await page.click('#c9play'); const r2 = +(await text(page, 'c9round')); await page.waitForTimeout(600); check(+(await text(page, 'c9round')) === r2, 'c9: pause stops it');
      await page.click('#c9step'); check(+(await text(page, 'c9round')) === r2 + 20, 'c9: step 20');
      await page.$eval('#c1', e => e.scrollIntoView()); await page.waitForTimeout(500); const r3 = +(await text(page, 'c9round')); await page.$eval('#c9play', e => e.click()); await page.waitForTimeout(600);
      check(+(await text(page, 'c9round')) === r3, 'c9: does not step while off screen');
      // language toggle: switches every string (copy.en.js present) and is stored
      await page.click('#langToggle [data-lang=en]');
      check(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'toggle: en pressed');
      check(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'toggle: stored');
      check(!CJK.test(await text(page, 'c1say')) && !CJK.test(await page.title()), 'toggle: English copy applied: ' + await text(page, 'c1say'));
      check(await text(page, 'c4shareN') === '(rounds run: 202)', 'toggle: generated readouts switch language: ' + await text(page, 'c4shareN'));
      await page.click('#langToggle [data-lang=zh]');
      check(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'toggle: back to zh');
    }
    check(errors.length === 0, `${W}: errors ${errors.join(' | ')}`);
    await ctx.close();
  }
  // reduced motion: survivorship jumps to year ten, Goodhart does not auto-run
  {
    const { ctx, page, errors } = await open(browser, 390, { reduce: true });
    await page.$eval('#c3', e => e.scrollIntoView()); await page.waitForTimeout(300);
    check(await text(page, 'c3alive') === '726', 'reduce: survivorship at year 10 immediately');
    await page.$eval('#c9', e => e.scrollIntoView()); await page.waitForTimeout(800);
    check(+(await text(page, 'c9round')) === 1, 'reduce: Goodhart waits for a button');
    await page.click('#c9step'); check(+(await text(page, 'c9round')) === 21, 'reduce: step button works');
    check(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduce: no smooth scroll');
    check(errors.length === 0, 'reduce: errors ' + errors.join(' | '));
    await ctx.close();
  }
  await browser.close();
  if (fails.length) { console.error('FAIL:\n' + fails.join('\n')); process.exit(1); }
  console.log('PASS: numbers-lie browser smoke test (zh and en at 1280/390/320: overflow, targets, canvases, no Chinese in en incl. canvas/aria; every model driven; toggle; reduced motion)');
}
main().catch(e => { console.error(e); process.exit(1); });
