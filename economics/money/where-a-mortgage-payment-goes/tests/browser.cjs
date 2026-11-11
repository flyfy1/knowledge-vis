'use strict';
// Browser smoke test for "Where does a mortgage payment go?".
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18964 NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
//        node economics/money/where-a-mortgage-payment-goes/tests/browser.cjs
// SHOTS=<dir> also writes a screenshot of every figure at every width (scratch directory, not the repo).
// Checks in Chinese (and in English when copy.en.js exists): no console/page errors, no horizontal overflow at
// 1280/390/320, no text clipped in its box, every control at least 48×48 px, toggle reads 中 | EN; in English no
// CJK visible (DOM text, aria-labels, title, canvas fillText) apart from the 中 button. Then the language toggle
// with copy.en.js absent, each model driven through its controls, and reduced motion.
const { chromium } = require('playwright');
const fs = require('fs');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18964').replace(/\/$/, '');
const url = base + '/economics/money/where-a-mortgage-payment-goes/';
const SHOTS = process.env.SHOTS || '';
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
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 250) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(ms); };

(async () => {
  const browser = await chromium.launch();
  const hasEn = await (async () => { const p = await browser.newPage(); const r = await p.goto(url + 'copy.en.js').catch(() => null); const s = r ? r.status() : 404; await p.close(); return s < 400; })();
  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    let fi = 0;
    for (const fig of await page.$$('figure')) {
      await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400); fi++;
      if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await fig.screenshot({ path: `${SHOTS}/${lang}-${width}-fig${fi}.png` }); }
    }
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *, footer *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    // readout numbers must not break inside a number
    const broken = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(b => { const r = b.getClientRects(); return r.length > 1 && /\d\s*$/.test(b.textContent) && b.textContent.length < 8; }).map(b => b.id));
    ok(!broken.length, `${tag}: readouts broken across lines: ${broken.join(', ')}`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // contrast of the muted text styles against their backgrounds
  {
    const page = await open(browser, 1280);
    const worst = await page.evaluate(() => {
      const lum = c => { const m = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
      const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const bgOf = e => { for (let n = e; n; n = n.parentElement) { const b = getComputedStyle(n).backgroundColor; if (b && !/rgba\(.*,\s*0\)|transparent/.test(b)) return b; } return 'rgb(12,14,19)'; };
      let min = 99, who = '';
      for (const e of document.querySelectorAll('.how, .take, .read div span, .legend, footer, .note, .toc a span, .ctl, .back')) { const r = ratio(getComputedStyle(e).color, bgOf(e)); if (r < min) { min = r; who = e.className || e.tagName; } }
      return [min, who];
    });
    ok(worst[0] >= 4.5, `contrast ${worst[0].toFixed(2)} on ${worst[1]}`);
    await page.close();
  }

  // toggle without copy.en.js, then drive every model
  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')).length > 0, 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1
    await show(page, '#rtCv');
    ok((await text(page, '#rtEff')) === '4.07%', 'ch1 default effective 4.07%, got ' + await text(page, '#rtEff'));
    await setRange(page, 'rtR', 24); ok((await text(page, '#rtEff')) === '26.82%', 'ch1 24% monthly → 26.82%');
    await pick(page, 'rtM', 1); ok((await page.$eval('#rtSay', e => e.textContent)).includes('合同上的 24%'), 'ch1 once sentence');
    await pick(page, 'rtM', 12); await setRange(page, 'rtR', 4);

    // ch2: animation then states
    await show(page, '#pyCv', 300);
    ok((await text(page, '#pyLeft')).includes('53.7'), 'ch2 default 4000 leaves 53.7万, got ' + await text(page, '#pyLeft'));
    await setRange(page, 'pyG', 3000); ok((await page.$eval('#pySay', e => e.textContent)).includes('永远还不完'), 'ch2 below sentence');
    await page.click('#pyExact'); ok((await text(page, '#pyPay')).includes('4774.15'), 'ch2 exact payment');
    await setRange(page, 'pyG', 5000); ok((await page.$eval('#pySay', e => e.textContent)).includes('就还清了'), 'ch2 high sentence');

    // ch3
    await show(page, '#amCv');
    ok((await text(page, '#amX')).includes('153'), 'ch3 crossover 153');
    await setRange(page, 'amN', 10); ok(+(await page.$eval('#amK', e => e.max)) === 120, 'ch3 month slider follows the term');
    await setRange(page, 'amR', 1); ok((await page.$eval('#amSay', e => e.textContent)).includes('第一个月起'), 'ch3 start sentence');
    await setRange(page, 'amR', 4); await setRange(page, 'amN', 30);

    // ch4
    await show(page, '#cmCv2');
    ok((await text(page, '#cmPV')).split('·').every(s => s.includes('100 万元')), 'ch4 both PVs 100万: ' + await text(page, '#cmPV'));
    ok((await text(page, '#cmEI')).includes('60.2'), 'ch4 EP interest 60.2万');

    // ch5
    await show(page, '#ppCv2');
    ok((await text(page, '#ppSaved')).includes('14.9'), 'ch5 term saves 14.9万');
    await pick(page, 'ppMode', 'payment'); ok((await text(page, '#ppPay')).includes('4246'), 'ch5 new payment 4246');
    ok((await text(page, '#ppPV')).includes('10 万元'), 'ch5 PV drop = 10万 in both modes, got ' + await text(page, '#ppPV'));
    await setRange(page, 'ppX', 50); await setRange(page, 'ppY', 29); ok((await page.$eval('#ppSay', e => e.textContent)).includes('一次还清'), 'ch5 payoff sentence');

    // ch6
    await show(page, '#rcCv2');
    ok((await text(page, '#rcM1')).includes('5321'), 'ch6 new payment 5321');
    await pick(page, 'rcMode', 'keep'); await setRange(page, 'rcD', 3); ok((await page.$eval('#rcSay', e => e.textContent)).includes('永远还不完'), 'ch6 never sentence');
    await setRange(page, 'rcD', 0); ok((await page.$eval('#rcSay', e => e.textContent)).includes('没有变'), 'ch6 same sentence');

    // ch7
    await show(page, '#apCv2');
    ok((await text(page, '#apApr')) === '13.0%', 'ch7 APR 13.0%'); ok((await text(page, '#apEar')) === '13.8%', 'ch7 EAR 13.8%');
    await setRange(page, 'apU', 2); ok((await page.$eval('#apSay', e => e.textContent)).includes('一开始收的'), 'ch7 fee sentence');

    // ch8
    await show(page, '#rlCv2');
    ok((await text(page, '#rlLast')).includes('2636'), 'ch8 last payment 2636');
    await setRange(page, 'rlG', 4); ok((await page.$eval('#rlSay', e => e.textContent)).includes('一分不差'), 'ch8 equal sentence');
    await setRange(page, 'rlG', 8); ok((await page.$eval('#rlSay', e => e.textContent)).includes('拿去做别的那一边多出'), 'ch8 invest sentence');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // English: drive every model and read every readout and live sentence; English formats only
  if (hasEn) {
    const page = await open(browser, 1280, { lang: 'en' });
    ok((await text(page, '#rtEff')) === '4.07%', 'en ch1 effective');
    ok((await text(page, '#pyLeft')) === '¥537,300', 'en ch2 4000 leaves ¥537,300, got ' + await text(page, '#pyLeft'));
    ok((await text(page, '#pyEnd')) === '44 years 11 months', 'en ch2 payoff time');
    ok((await text(page, '#ppEnd')) === '25 years 8 months', 'en ch5 loan length');
    ok((await text(page, '#apX')) === '1.81×', 'en ch7 ratio');
    ok((await text(page, '#rcDo')) === '+1 percentage point', 'en ch6 singular point: ' + await text(page, '#rcDo'));
    ok((await text(page, '#ppYo')) === 'end of year 5', 'en ch5 year output');
    const bad = new Set(), seen = new Set();
    const scan = async tag => { for (const t of await page.$$eval('.read b, .say, output', es => es.map(e => e.textContent))) { seen.add(t);
      if (/[\u3400-\u9fff]|× 10,000/.test(t)) bad.add(tag + ' CJK/万: ' + t.slice(0, 60));
      if (/(^|[^\d.,])1 (years|months)\b/.test(t)) bad.add(tag + ' plural: ' + t.slice(0, 80));
      if (/¥\s*[−-]/.test(t)) bad.add(tag + ' sign after ¥: ' + t.slice(0, 60));
      if (/\d{5,}/.test(t.replace(/\d+\.\d+/g, ''))) bad.add(tag + ' ungrouped: ' + t.slice(0, 60)); } };
    const ranges = await page.$$eval('input[type=range]', es => es.map(e => [e.id, +e.min, +e.max, +e.step]));
    const radioNames = await page.$$eval('input[type=radio]', es => [...new Set(es.map(e => e.name))]);
    for (const name of radioNames) for (const v of await page.$$eval(`input[name=${name}]`, es => es.map(e => e.value))) {
      await pick(page, name, v);
      for (const [id, lo, hi, st] of ranges) { const orig = await page.$eval('#' + id, e => e.value);
        for (const f of [0, 0.03, 0.25, 0.5, 0.77, 0.97, 1]) { await setRange(page, id, Math.round((lo + f * (hi - lo)) / st) * st); await scan(`${name}=${v} ${id}`); }
        await setRange(page, id, orig); }
    }
    // the singular forms: ¥20,000 at the end of year 1 shortens the loan by 13 months, at year 2 by 12
    await pick(page, 'ppMode', 'term'); await setRange(page, 'ppX', 2); await setRange(page, 'ppY', 1); await scan('ch5 13m');
    ok((await page.$eval('#ppSay', e => e.textContent)).includes('1 year 1 month sooner'), 'en singular "1 year 1 month": ' + await page.$eval('#ppSay', e => e.textContent));
    await setRange(page, 'ppY', 2); ok((await page.$eval('#ppSay', e => e.textContent)).includes('1 year sooner'), 'en singular "1 year"');
    await setRange(page, 'ppX', 10); await setRange(page, 'ppY', 5);
    ok(!bad.size, 'en formats: ' + [...bad].slice(0, 8).join(' | '));
    // negative amounts print as −¥…
    await setRange(page, 'rlG', 8); ok(/^−¥[\d,]+$/.test(await text(page, '#rlDiff')), 'en negative money format: ' + await text(page, '#rlDiff'));
    ok(!page.__errors().length, 'en drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // storage blocked: the page still works and the toggle still switches
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(url); await page.waitForFunction(() => window.__essayReady === true);
    await page.click('#langToggle [data-lang=zh]');
    ok(!errs.length, 'storage blocked: errors ' + errs.join(' | '));
    await ctx.close();
  }

  // reduced motion: no smooth scroll; the ch2 path is drawn complete at once
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#pyCv', 200); await page.click('#pyExact'); await page.waitForTimeout(100);
    ok((await page.$eval('#pySay', e => e.textContent)).includes('正好是零'), 'reduced motion: ch2 exact');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${hasEn ? 'zh and en' : 'zh'} at 1280/390/320: overflow, clipped text, 48px targets, contrast, no CJK in English; toggle, storage blocked, all eight models driven in zh, every control swept in en for formats, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
