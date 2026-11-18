'use strict';
// Browser test for the noise-into-pictures essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18982 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/ml/noise-into-pictures/tests/browser.cjs
// Checks at 1280/390/320 (Chinese; English too once copy.en.js exists): no console/page errors (the copy.en.js 404 is
// expected while there is no English file), no horizontal overflow, no text clipped inside its own box, every control
// at least 48×48 px, the toggle reads 中 | EN. Then: the EN button with or without copy.en.js (no raw keys, falls back
// to Chinese when the file is missing), reduced motion, canvases drawing only on screen, and every model driven once.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18982').replace(/\/$/, '');
const url = base + '/computing/ml/noise-into-pictures/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); else process.stdout.write('.'); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url()) && !/favicon/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { const f = CanvasRenderingContext2D.prototype.fillText; window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) { window.__canvasStrings.add(String(s)); return f.call(this, s, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 300) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(ms); };
const waitText = (page, sel, re, ms) => page.waitForFunction(([s, r]) => new RegExp(r).test(document.querySelector(s).textContent), [sel, re.source], { timeout: ms }).then(() => true, () => false);

(async () => {
  const browser = await chromium.launch();
  const probe = await browser.newPage(); const enExists = (await probe.goto(url + 'copy.en.js')).status() === 200; await probe.close();
  console.log('copy.en.js present:', enExists);
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of enExists ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang }), tag = `${lang} ${width}`;
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table *')].filter(e => {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *, header *, footer *')].filter(e => { if (e.closest('.tblwrap')) return false; const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const small = await page.evaluate(() => {
      const out = [], boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, select, .toc a, a.back')) { const r = boxOf(e); if (!r.width && !r.height) continue; if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`); }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const live = await page.$$eval('[id$=Say]', es => es.filter(e => e.getAttribute('aria-live') !== 'polite').map(e => e.id));
    ok(!live.length, `${tag}: interpretive sentences without aria-live: ${live.join(', ')}`);
    if (lang === 'en') {
      const leaks = await page.evaluate(re => { const rx = new RegExp(re), out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!rx.test(n.textContent) || !el.getClientRects().length) continue; if (el.closest('#langToggle')) continue; out.push(n.textContent.trim().slice(0, 30)); }
        for (const s of window.__canvasStrings) if (rx.test(s)) out.push('canvas: ' + s); if (rx.test(document.title)) out.push('title'); return out.slice(0, 6); }, CJK.source);
      ok(!leaks.length, `${tag}: Chinese visible in English: ${leaks.join(' | ')}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // the EN button, focus ring, on-screen gating
  {
    const page = await open(browser, 1280);
    await page.click('#langToggle [data-lang=en]'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN choice stored');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^[a-z0-9]+(\.[a-z0-9]+)+$/i.test(e.textContent.trim())))), 'no raw keys after EN');
    if (!enExists) {
      ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js the page falls back to Chinese and says so in lang');
      ok(/[一-鿿]/.test(await text(page, 'h1')), 'without copy.en.js the title stays Chinese');
    } else ok(!/[一-鿿]/.test(await text(page, 'h1')), 'EN switches the title');
    await page.click('#langToggle [data-lang=zh]'); await page.waitForTimeout(100);
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'back to Chinese');
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(() => { const e = document.activeElement, cs = getComputedStyle(e); return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 || cs.boxShadow !== 'none'; });
    ok(ring, 'keyboard focus is visible');
    // a canvas far below the fold has not been drawn yet
    ok(await page.$eval('#mmCv', c => c.width <= 300), 'off-screen canvas is not drawn before it scrolls into view');
    ok(!page.__errors().length, 'toggle page errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // drive every model once (reduced motion: animated models jump to their end state)
  {
    const page = await open(browser, 1280, { reduce: true });
    await show(page, '#heroCv');
    // ch1
    await show(page, '#rjCv'); ok(parseFloat(await text(page, '#rjMeas')) > 2, 'ch1 reduced motion: 1,500 proposals already made');
    ok((await text(page, '#rjExact')) === '3.4%', 'ch1 exact acceptance 3.4%');
    await setRange(page, 'rjD', 5); ok((await text(page, '#rjHigh')).includes('10⁻³⁹⁵'), 'ch1 784 dims → 10⁻³⁹⁵, got ' + await text(page, '#rjHigh'));
    // ch2
    await show(page, '#fwCv'); await setRange(page, 'fwT', 250); ok((await text(page, '#fwSig')) === '0.724', 'ch2 √ᾱ at 250');
    await page.click('#fwPlay'); await page.waitForTimeout(300);
    ok((await text(page, '#fwTo')) === '1,000', 'ch2 step-by-step replay jumps to t = 1000 under reduced motion');
    // ch3
    await show(page, '#lgCv'); ok((await text(page, '#lgShare')) === '23%', 'ch3 annealed share 23%, got ' + await text(page, '#lgShare'));
    await pick(page, 'lgMode', 'plain'); await page.waitForTimeout(200); ok((await text(page, '#lgShare')) === '48%', 'ch3 plain share 48%, got ' + await text(page, '#lgShare'));
    // ch4a
    await show(page, '#twCv'); await setRange(page, 'twT', 300);
    ok((await text(page, '#twMean')) === (await text(page, '#twTw')), 'ch4 posterior mean = Tweedie');
    await page.focus('#twCv'); const m0 = await text(page, '#twMean'); await page.keyboard.press('ArrowRight'); ok((await text(page, '#twMean')) !== m0, 'ch4 arrow keys move the point');
    // ch4b
    await show(page, '#trCv'); await page.click('#trGo'); await page.waitForTimeout(2500);
    ok(parseInt((await text(page, '#trStep')).replace(/,/g, '')) > 0 && parseFloat(await text(page, '#trLoss')) > 0, 'ch4 training runs: ' + await text(page, '#trStep'));
    await page.click('#trGo');
    // ch5
    await show(page, '#smCv'); await setRange(page, 'smS', 3);
    ok(await waitText(page, '#smDist', /^0\.092$/, 60000), 'ch5 net DDIM at 10 steps = 0.092, got ' + await text(page, '#smDist'));
    ok(await waitText(page, '#smOther', /^0\.137$/, 60000), 'ch5 DDPM at 10 steps = 0.137, got ' + await text(page, '#smOther'));
    // ch6 figure of merit
    await show(page, '#pathCv'); await pick(page, 'pathKind', 'reflow'); await page.waitForTimeout(400);
    ok(parseFloat(await text(page, '#pathOne')) < 0.1, 'ch6 reflow: one step lands where 100 do, gap ' + await text(page, '#pathOne'));
    await show(page, '#fomCv');
    ok(await page.waitForFunction(() => ['#fomDdpm', '#fomDdim', '#fomFm', '#fomRe'].every(s => !document.querySelector(s).textContent.includes('…')), null, { timeout: 240000 }).then(() => true, () => false), 'ch6 steps needed computed');
    ok(/100/.test(await text(page, '#fomDdpm')) && /50/.test(await text(page, '#fomDdim')) && /20/.test(await text(page, '#fomFm')) && /^1\D/.test(await text(page, '#fomRe')),
      'ch6 steps needed 100/50/20/1, got ' + [await text(page, '#fomDdpm'), await text(page, '#fomDdim'), await text(page, '#fomFm'), await text(page, '#fomRe')].join(' / '));
    // ch7
    await show(page, '#gdCv'); await setRange(page, 'gdW', 3);
    ok(await waitText(page, '#gdFid', /99\.6%/, 60000), 'ch7 w = 3 fidelity 99.6%, got ' + await text(page, '#gdFid'));
    ok((await text(page, '#gdTrue')) === '88.6%', 'ch7 true fidelity 88.6%');
    // ch8
    await show(page, '#mmCv');
    ok(await waitText(page, '#mmCopy', /95\.3%/, 60000), 'ch8 exact optimum, 16 points: 95.3% copies, got ' + await text(page, '#mmCopy'));
    await pick(page, 'mmModel', 'net'); ok(await waitText(page, '#mmCopy', /^5\.5%$/, 60000), 'ch8 net, 16 points: 5.5%, got ' + await text(page, '#mmCopy'));
    // ch9
    await show(page, '#ldSay'); ok((await text(page, '#ldTok')) === '1,024', 'ch9 1,024 tokens');
    await pick(page, 'ldF', 1); ok((await text(page, '#ldTok')) === '65,536', 'ch9 pixel tokens 65,536');
    // ch10
    ok((await page.$$('#frArch li')).length >= 9 && (await page.$$('#frOpen li')).length >= 4 && (await page.$$('#frRecs tbody tr')).length >= 4, 'ch10 frontier lists and records rendered');
    ok(!page.__errors().length, 'model page errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // with motion: the hero and ch1 animate (and the animation keeps going)
  {
    const page = await open(browser, 390);
    await show(page, '#rjCv', 200); const a = await text(page, '#rjMeas'); await page.waitForTimeout(1200); const b = await text(page, '#rjMeas');
    ok(a !== b, 'ch1 animates with motion allowed');
    await page.close();
  }

  await browser.close();
  console.log('');
  if (fails.length) { console.log(fails.length + ' FAILED'); fails.forEach(f => console.log('FAIL', f)); process.exit(1); }
  console.log('browser test: all checks passed');
})().catch(e => { console.error(e); process.exit(1); });
