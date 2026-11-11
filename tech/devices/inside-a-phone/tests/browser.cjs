'use strict';
// Browser smoke test for tech/devices/inside-a-phone.
// Run (from the repo root, with a static server on the repo root):
//   python3 -m http.server 18883 --bind 127.0.0.1
//   ESSAY_BASE_URL=http://127.0.0.1:18883 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node tech/devices/inside-a-phone/tests/browser.cjs
// Checks: no console/page errors (a 404 for the optional copy.en.js is allowed), no horizontal overflow at
// 1280/390/320, every interactive target ≥ 48×48 px, the language toggle works while copy.en.js is absent,
// reduced motion leaves every model in a finished state, and each model responds to its controls.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18883').replace(/\/$/, '');
const url = base + '/tech/devices/inside-a-phone/';
let fails = 0;
const check = (name, ok, extra) => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`); };

async function open(browser, width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference', locale: opts.locale || 'zh-CN' });
  if (opts.lang) await ctx.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang);
  // record every string drawn on a canvas, so English mode can be checked for leftover Chinese canvas labels
  await ctx.addInitScript(() => { window.__canvasText = []; const f = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (s, ...r) { window.__canvasText.push(String(s)); return f.call(this, s, ...r); }; });
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(`http ${r.status()}: ${r.url()}`); });
  await page.goto(url); await page.waitForFunction(() => window.__ready === true); await page.waitForTimeout(300);
  return { ctx, page, errors };
}
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const text = (page, id) => page.$eval('#' + id, e => e.textContent.trim());

(async () => {
  const browser = await chromium.launch();

  for (const width of [1280, 390, 320]) {
    const { ctx, page, errors } = await open(browser, width);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${width}: no horizontal overflow`, over <= 0, `scrollWidth − clientWidth = ${over}`);
    // targets: buttons, range inputs, nav/back links; checkboxes are measured by their label
    const small = await page.evaluate(() => {
      const out = [];
      const els = [...document.querySelectorAll('button, input[type=range], .toc a, a.back, label.chk')];
      for (const e of els) { const r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue; if (r.width < 48 - 0.5 || r.height < 48 - 0.5) out.push(`${e.tagName.toLowerCase()}#${e.id || e.className || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`); }
      return out;
    });
    check(`${width}: every interactive target ≥ 48 px`, small.length === 0, small.slice(0, 6).join('; '));
    const empty = await page.$$eval('[data-i18n],[data-i18n-html]', els => els.filter(e => !e.textContent.trim() || /^[a-z0-9]+(\.[a-zA-Z0-9]+)+$/.test(e.textContent.trim())).map(e => e.dataset.i18n || e.dataset.i18nHtml));
    check(`${width}: every text slot filled from copy.zh.js (no empty slot, no raw key)`, empty.length === 0, empty.join(', '));
    check(`${width}: no console or page errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // language toggle with copy.en.js absent: falls back to zh text, switches lang attribute and pressed state, stores the choice
  {
    const { ctx, page, errors } = await open(browser, 1280);
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    await page.click('#langToggle [data-lang=en]'); await page.waitForTimeout(200);
    const st = await page.evaluate(() => ({ lang: document.documentElement.lang, pressed: document.querySelector('#langToggle [data-lang=en]').getAttribute('aria-pressed'), stored: localStorage.getItem('knowledge-lang'), title: document.title, h1: document.querySelector('h1').textContent }));
    check('toggle → en: html lang and aria-pressed update', st.lang === 'en' && st.pressed === 'true', JSON.stringify({ lang: st.lang, pressed: st.pressed }));
    check('toggle → en: choice stored in knowledge-lang', st.stored === 'en');
    check(`toggle → en: ${hasEn ? 'English copy shown' : 'falls back to zh text without breaking'}`, st.h1.length > 0 && st.title.length > 0);
    await page.click('#langToggle [data-lang=zh]'); await page.waitForTimeout(200);
    check('toggle → zh again', await page.evaluate(() => document.documentElement.lang === 'zh-CN'));
    check('toggle: no errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // drive every model once
  {
    const { ctx, page, errors } = await open(browser, 1280);
    // 01 GPS: the default misses; solving brings the miss to ~0 and recovers the clock error
    await page.$eval('#gpsCv', e => e.scrollIntoView());
    check('GPS: default circles miss by about 136 m', Math.abs(parseFloat(await text(page, 'gpsMiss')) - 136) < 1, await text(page, 'gpsMiss'));
    await page.click('#gpsSolve'); await page.waitForTimeout(2500);
    check('GPS: after solving, the miss is ~0 and the clock error is 300 ns', parseFloat(await text(page, 'gpsMiss')) < 0.5 && /300/.test(await text(page, 'gpsClk')), `${await text(page, 'gpsMiss')} / ${await text(page, 'gpsClk')}`);
    await setRange(page, 'gpsNoise', 10); await setRange(page, 'gpsSpread', 15); await page.waitForTimeout(600);
    check('GPS: crowded satellites + 10 ns noise ≈ 28 m', Math.abs(parseFloat(await text(page, 'gpsErr')) - 28.4) < 0.5, await text(page, 'gpsErr'));
    // 02 accelerometer
    await page.$eval('#accCv', e => e.scrollIntoView());
    await setRange(page, 'accTilt', 90);
    check('accelerometer: at 90° the full 9.81 is on the x axis', (await text(page, 'accX')) === '9.81' && (await text(page, 'accY')) === '0.00');
    await page.click('#accDrop'); await page.waitForTimeout(150);
    check('accelerometer: free fall reads 0', (await text(page, 'accM')) === '0.00', await text(page, 'accM'));
    // 02b drift: runs on its own while visible
    await page.$eval('#driftCv', e => e.scrollIntoView()); await page.click('#driftReset'); await page.waitForTimeout(1500);
    check('drift: time advances while visible', parseFloat(await text(page, 'driftT')) > 1, await text(page, 'driftT'));
    // 03 touch
    await page.$eval('#touchCv', e => e.scrollIntoView());
    await setRange(page, 'touchN', 0); await setRange(page, 'touchX', 12.5);
    check('touch: on an electrode both methods are exact', parseFloat(await text(page, 'touchCe')) < 0.01 && parseFloat(await text(page, 'touchPk')) < 0.01);
    await setRange(page, 'touchX', 15);
    check('touch: between electrodes peak-only is off by 2.5 mm, centroid is not', parseFloat(await text(page, 'touchPk')) > 2.4 && parseFloat(await text(page, 'touchCe')) < 0.2);
    // 04 camera: frames accumulate
    await page.$eval('#camCv', e => e.scrollIntoView()); await page.click('#camReset'); await page.waitForTimeout(1200);
    const n = parseInt(await text(page, 'camN'));
    check('camera: frames accumulate while visible', n > 3, await text(page, 'camN'));
    // 05 screen: 500 nm needs negative red
    await page.$eval('#scrCv', e => e.scrollIntoView()); await setRange(page, 'scrLam', 500); await page.click('#scrSolve');
    check('screen: 500 nm needs negative red', (await text(page, 'scrNeed')).startsWith('-0.89'), await text(page, 'scrNeed'));
    // 06 compression
    await page.$eval('#cmpCv', e => e.scrollIntoView());
    const b0 = parseFloat(await text(page, 'cmpBits')); await setRange(page, 'cmpNoise', 4); const b4 = parseFloat(await text(page, 'cmpBits'));
    check('compression: noise σ = 4 raises bits/pixel from 0.47 to ~4.5', Math.abs(b0 - 0.47) < 0.01 && Math.abs(b4 - 4.54) < 0.05, `${b0} → ${b4}`);
    await page.click('#cmpGrass'); check('compression: grass ~7.2 bits', Math.abs(parseFloat(await text(page, 'cmpBits')) - 7.2) < 0.05);
    // 07 radio
    await page.$eval('#radCv', e => e.scrollIntoView());
    check('radio: default capacity 256 Mbit/s', (await text(page, 'radCap')) === '256', await text(page, 'radCap'));
    // 08 Hamming: flip one bit → corrected; flip two → wrong
    await page.$eval('#eccCv', e => e.scrollIntoView());
    const wire = await page.$$('#eccWire .bit');
    await wire[4].click(); check('Hamming: one flip is corrected', (await text(page, 'eccSyn')) === '5' && (await text(page, 'eccOut')) === '1011');
    await wire[0].click(); check('Hamming: two flips are mis-corrected', (await text(page, 'eccOut')) !== '1011');
    await page.click('#eccClear');
    await page.$eval('#eccCv2', e => e.scrollIntoView()); await page.waitForTimeout(800);
    check('Hamming: the channel simulation sends blocks while visible', !/^0：/.test(await text(page, 'eccSim')), await text(page, 'eccSim'));
    // 09 handover: replay with reduced speed check; full trip count verified under reduced motion below
    await page.$eval('#hoCv', e => e.scrollIntoView()); await page.click('#hoReplay'); await page.waitForTimeout(1500);
    check('handover: the car moves while visible', parseFloat((await text(page, 'hoPos')).replace(/,/g, '')) > 50, await text(page, 'hoPos'));
    // 10 battery
    await page.$eval('#batCv', e => e.scrollIntoView());
    check('battery: default shows 38%', (await text(page, 'batShown')) === '38%', await text(page, 'batShown'));
    await setRange(page, 'batI', 2);
    check('battery: 2 A at −10 °C switches the phone off', !/%/.test(await text(page, 'batShown')), await text(page, 'batShown'));
    await setRange(page, 'batT', 25);
    check('battery: warming to 25 °C brings it back (46%)', (await text(page, 'batShown')) === '46%', await text(page, 'batShown'));
    check('models: no errors while driving', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // English: copy.en.js is loaded; no Chinese left anywhere visible (apart from the 中 toggle label), on canvases,
  // in aria-labels or the title; and the layout checks hold with the longer English strings.
  for (const width of [1280, 390, 320]) {
    const { ctx, page, errors } = await open(browser, width, { lang: 'en', locale: 'en-US' });
    const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
    const st = await page.evaluate(() => ({ lang: document.documentElement.lang, hasEn: !!(window.ESSAY_COPY && window.ESSAY_COPY.en), zh: document.querySelector('#langToggle [data-lang=zh]').textContent.trim(), en: document.querySelector('#langToggle [data-lang=en]').textContent.trim() }));
    check(`en ${width}: copy.en.js loaded and html lang = en`, st.hasEn && st.lang === 'en', JSON.stringify(st));
    check(`en ${width}: language toggle reads "中 | EN"`, st.zh === '中' && st.en === 'EN', `${st.zh} | ${st.en}`);
    // scroll through the whole page so every canvas draws at least once
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 600) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(300);
    const leaks = await page.evaluate(re => {
      const CJK = new RegExp(re), out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = walker.nextNode());) {
        const t = n.nodeValue.trim(); if (!t || !CJK.test(t)) continue;
        const el = n.parentElement; if (el.closest('#langToggle [data-lang=zh]')) continue;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        out.push(t.slice(0, 30));
      }
      document.querySelectorAll('[aria-label],[title],[placeholder]').forEach(e => ['aria-label', 'title', 'placeholder'].forEach(a => { const v = e.getAttribute(a); if (v && CJK.test(v) && !e.closest('#langToggle [data-lang=zh]')) out.push(`@${a}: ${v.slice(0, 30)}`); }));
      if (CJK.test(document.title)) out.push('title: ' + document.title);
      window.__canvasText.forEach(t => { if (CJK.test(t)) out.push('canvas: ' + t); });
      return [...new Set(out)];
    }, CJK.source);
    check(`en ${width}: no Chinese visible (text, aria-labels, title, canvas labels)`, leaks.length === 0, leaks.slice(0, 8).join(' | '));
    const canvasCount = await page.evaluate(() => window.__canvasText.length);
    check(`en ${width}: canvases drew labels while scrolled through`, canvasCount > 50, String(canvasCount));
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`en ${width}: no horizontal overflow`, over <= 0, `scrollWidth − clientWidth = ${over}`);
    const small = await page.evaluate(() => {
      const out = [];
      for (const e of document.querySelectorAll('button, input[type=range], .toc a, a.back, label.chk')) { const r = e.getBoundingClientRect(); if (r.width === 0 && r.height === 0) continue; if (r.width < 47.5 || r.height < 47.5) out.push(`${e.tagName.toLowerCase()}#${e.id || e.className} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`); }
      return out;
    });
    check(`en ${width}: every interactive target ≥ 48 px`, small.length === 0, small.slice(0, 6).join('; '));
    // readout tiles: the number must not be clipped or spill out of its tile
    const clipped = await page.evaluate(() => [...document.querySelectorAll('.read > div')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim().slice(0, 24)));
    check(`en ${width}: no readout tile overflows horizontally`, clipped.length === 0, clipped.slice(0, 6).join(' | '));
    check(`en ${width}: no console or page errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // reduced motion: simulations jump to their finished state, no errors
  {
    const { ctx, page, errors } = await open(browser, 390, { reduce: true });
    check('reduced motion: drift is computed to 60 s at once', (await text(page, 'driftT')) === '60.0', await text(page, 'driftT'));
    check('reduced motion: camera stacks all frames at once', (await text(page, 'camN')) === '16 / 16', await text(page, 'camN'));
    check('reduced motion: the handover trip is complete (35 handovers on the default road)', (await text(page, 'hoN')) === '35', await text(page, 'hoN'));
    const smooth = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    check('reduced motion: no smooth scrolling', smooth !== 'smooth', smooth);
    await page.click('#gpsSolve'); await page.waitForTimeout(100);
    check('reduced motion: GPS solve jumps straight to the answer', parseFloat(await text(page, 'gpsMiss')) < 0.5, await text(page, 'gpsMiss'));
    check('reduced motion: no errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  await browser.close();
  console.log(fails ? `\n${fails} check(s) failed` : '\nall browser checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
