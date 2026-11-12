'use strict';
// Browser smoke test for the how-a-web-page-arrives essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18961 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node tech/networks/how-a-web-page-arrives/tests/browser.cjs
// Checks at 1280/390/320, in Chinese and (when copy.en.js exists) English: no console/page errors, no horizontal
// overflow, no text clipped in its box, every control at least 48×48 px, the toggle reads 中 | EN; in English no
// CJK visible except the 中 button. Then the language toggle (works with copy.en.js absent), keyboard operation,
// every model driven to its extremes with the live sentence read (no unfilled placeholder, NaN or undefined),
// and reduced motion jumping models to their end state.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18961').replace(/\/$/, '');
const url = base + '/tech/networks/how-a-web-page-arrives/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
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
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, v]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const BAD = /\{\w+\}|NaN|undefined|Infinity|null/;
async function sayOk(page, sel, tag) { const s = await text(page, sel); ok(s.length > 8 && !BAD.test(s), `${tag}: bad sentence "${s}"`); return s; }

(async () => {
  const browser = await chromium.launch();
  const hasEn = await (async () => { const p = await browser.newPage(); const r = await p.goto(url + 'copy.en.js').catch(() => null); const okk = !!r && r.status() < 400; await p.close(); return okk; })();
  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    if (lang === 'en') {
      const leaks = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!rx.test(n.textContent) || !el.getClientRects().length) continue; if (el.closest('#langToggle') && n.textContent.trim() === '中') continue; out.push('text: ' + n.textContent.trim().slice(0, 30)); }
        for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria-label: ' + e.getAttribute('aria-label'));
        if (rx.test(document.title)) out.push('title: ' + document.title);
        for (const s of window.__canvasStrings) if (rx.test(s)) out.push('canvas: ' + s);
        return out.slice(0, 8);
      }, CJK.source);
      ok(!leaks.length, `${tag}: Chinese visible in English mode: ${leaks.join(' | ')}`);
    }
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
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle, keyboard, and every model
  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')).length > 0, 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    if (!hasEn) ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js the page stays in Chinese and says so in html[lang]');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // keyboard: a slider moves with the arrow key and a button fires with Enter
    await show(page, '#pkCv', 200);
    await page.focus('#pkP'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok((await text(page, '#pkPo')).startsWith('2,000'), 'keyboard: ch2 slider moves with ArrowRight, got ' + await text(page, '#pkPo'));
    ok(await page.evaluate(() => { const e = document.activeElement; return getComputedStyle(e).outlineStyle !== 'none'; }), 'keyboard: focused slider shows an outline');
    await page.focus('#dnsReset'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
    ok((await text(page, '#dnsCache')).startsWith('0'), 'keyboard: Enter on a button clears the DNS cache');

    // ch1: cold, sibling, cached, expired, three days
    await show(page, '#dnsCv', 300);
    const q = async n => { await page.click(`#dnsNames button[data-name="${n}"]`); await page.waitForTimeout(80); return parseInt(await text(page, '#dnsRemote')); };
    ok(await q('www.example.com') === 3, 'ch1 cold lookup asks 3 servers');
    ok(await q('img.example.com') === 1, 'ch1 sibling name asks 1');
    ok(await q('img.example.com') === 0, 'ch1 cached name asks none');
    await sayOk(page, '#dnsSay', 'ch1 cached');
    await page.click('#dnsWait'); await sayOk(page, '#dnsSay', 'ch1 waited');
    ok(await q('img.example.com') === 1, 'ch1 expired address asks the zone again');
    await page.click('#dnsWait3'); ok(await q('www.example.org') === 3, 'ch1 after three days from the root');
    ok((await text(page, '#dnsMs')).startsWith('100'), 'ch1 cold = 100 ms');

    // ch2: extremes
    await show(page, '#pkCv', 200);
    for (const [P, K] of [[0, 1], [0, 12], [20, 1], [20, 12], [10, 5], [3, 5]]) { await setRange(page, 'pkP', P); await setRange(page, 'pkK', K); await sayOk(page, '#pkSay', `ch2 ${P}/${K}`); }
    ok((await text(page, '#pkT')).startsWith('1.12'), 'ch2 100 B on 5 hops = 1.12 s');

    // ch3: break the route, cut off, reset
    await show(page, '#rtCv', 200);
    await page.click('#rtLinks button[data-k="C-D"]'); ok((await text(page, '#rtMs')).startsWith('16'), 'ch3 break C–D → 16 ms'); await sayOk(page, '#rtSay', 'ch3 detour');
    await page.click('#rtLinks button[data-k="B-E"]'); await sayOk(page, '#rtSay', 'ch3 two breaks');
    await page.click('#rtReset'); await page.click('#rtLinks button[data-k="Y-A"]'); await page.click('#rtLinks button[data-k="Y-B"]');
    ok((await text(page, '#rtSay')).length > 5 && (await text(page, '#rtMs')) === '—', 'ch3 cut off');
    await page.click('#rtReset'); ok((await text(page, '#rtMs')).startsWith('14'), 'ch3 reset → 14 ms');
    // clicking the line on the canvas toggles it too
    const mid = await page.evaluate(() => { const cv = document.getElementById('rtCv'), r = cv.getBoundingClientRect(), px = 34, py = 30, w = r.width, h = r.height;
      const P = (x, y) => [r.left + px + x * (w - 2 * px), r.top + py + y * (h - 2 * py)]; const a = P(0.43, 0.5), b = P(0.61, 0.15); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; });
    await page.mouse.click(mid[0], mid[1]); await page.waitForTimeout(100);
    ok((await page.$eval('#rtLinks button[data-k="C-D"]', e => e.getAttribute('aria-pressed'))) === 'true', 'ch3 clicking the C–D line on the canvas breaks it');
    await page.click('#rtReset');

    // ch4: simulation runs and agrees roughly with the formula
    await show(page, '#quCv1'); await page.waitForTimeout(9000);
    const sim = parseFloat(await text(page, '#quSim')); ok(isFinite(sim) && sim < 8, 'ch4 simulated loss at 0.8/10 is small, got ' + sim);
    for (const [r, k] of [[0.1, 1], [0.1, 60], [1, 10], [1.5, 1], [1.5, 60], [0.9, 30]]) { await setRange(page, 'quR', r); await setRange(page, 'quK', k); await sayOk(page, '#quSay', `ch4 ${r}/${k}`); }

    // ch5: run to the end
    await show(page, '#aqCv'); await page.waitForTimeout(3600);
    ok((await text(page, '#aqT')).startsWith('8.4'), 'ch5 default run ends at 8.4 RTT, got ' + await text(page, '#aqT'));
    for (const [p, w] of [[0, 1], [50, 1], [50, 10], [0, 10]]) { await setRange(page, 'aqP', p); await setRange(page, 'aqW', w); await page.click('#aqReplay'); await page.waitForTimeout(p === 50 && w === 1 ? 300 : 300); }
    await page.click('#aqSeed'); await page.waitForTimeout(200); await sayOk(page, '#aqSay', 'ch5 new luck');

    // ch6: sawtooth reaches its end, two flows
    await show(page, '#cwCv'); await page.waitForTimeout(14000);
    ok((await text(page, '#cwU')) === '96%', 'ch6 default utilisation 96%, got ' + await text(page, '#cwU'));
    await sayOk(page, '#cwSay', 'ch6 saw');
    await page.check('#cwTwo'); await page.waitForTimeout(2200); await sayOk(page, '#cwSay', 'ch6 two');
    await page.uncheck('#cwTwo');

    // ch7: four steps, eavesdropper, man in the middle
    await show(page, '#dhCv');
    for (let i = 0; i < 3; i++) await page.click('#dhNext');
    ok((await text(page, '#dhSay')).includes('2'), 'ch7 step 4 shows the shared key');
    ok(await page.$eval('#dhNext', e => e.disabled), 'ch7 next disabled after step 4');
    await page.click('#dhEveBtn'); await page.waitForTimeout(2500);
    ok((await text(page, '#dhEve')).includes('6'), 'ch7 eavesdropper finds a = 6');
    await page.check('#dhMitm'); await sayOk(page, '#dhSay', 'ch7 mitm');
    await pick(page, 'dhP', '65537'); await setRange(page, 'dhA', 65535); await sayOk(page, '#dhSay', 'ch7 large p');
    await page.uncheck('#dhMitm'); await page.click('#dhRestart'); await sayOk(page, '#dhSay', 'ch7 restart');

    // ch8: defaults and extremes
    await show(page, '#bgCv1', 200);
    ok((await text(page, '#bgTotal')).startsWith('963'), 'ch8 default total 963 ms');
    await pick(page, 'bgCdn', 'hit'); ok((await text(page, '#bgTotal')).startsWith('184'), 'ch8 CDN hit 184 ms');
    for (const [km, acc, sz, pr, dn, cd] of [[0, 0, 0, 'quic', 'phone', 'off'], [13, 60, 7, 'tls12', 'cold', 'off'], [13, 60, 7, 'tls12', 'cold', 'miss'], [5, 0, 0, 'quic', 'phone', 'hit']]) {
      await setRange(page, 'bgKm', km); await setRange(page, 'bgAcc', acc); await setRange(page, 'bgSize', sz); await pick(page, 'bgProto', pr); await pick(page, 'bgDns', dn); await pick(page, 'bgCdn', cd);
      await sayOk(page, '#bgSay', `ch8 ${km}/${acc}/${sz}/${pr}/${dn}/${cd}`);
    }
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: models show their end state at once
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#aqCv', 300); ok((await text(page, '#aqT')).startsWith('8.4'), 'reduced motion: ch5 jumps to the end');
    await show(page, '#cwCv', 300); ok((await text(page, '#cwU')) === '96%', 'reduced motion: ch6 jumps to the end');
    await show(page, '#quCv1', 300); ok((await text(page, '#quSim')) !== '…', 'reduced motion: ch4 shows a finished simulation');
    await show(page, '#dhCv', 200); await page.click('#dhEveBtn'); ok((await text(page, '#dhEve')).includes('6'), 'reduced motion: ch7 eavesdropper finishes at once');
    const moving = await page.evaluate(async () => { const cv = document.getElementById('rtCv'); cv.scrollIntoView(); await new Promise(r => setTimeout(r, 300)); const a = cv.toDataURL(); await new Promise(r => setTimeout(r, 400)); return a !== cv.toDataURL(); });
    ok(!moving, 'reduced motion: ch3 packets do not move');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${hasEn ? 'zh and en' : 'zh'} at 1280/390/320: overflow, clipped text, 48px targets${hasEn ? ', no Chinese in English mode' : ''}; language toggle, keyboard, all eight models at their extremes, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
