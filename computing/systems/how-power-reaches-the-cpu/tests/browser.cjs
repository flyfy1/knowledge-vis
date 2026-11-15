'use strict';
// Browser smoke test for the essay on how power reaches the CPU.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18987 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-power-reaches-the-cpu/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48x48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (English is a
// stub: the page falls back to Chinese and says so in <html lang>), keyboard operation of a slider, each of the eight
// models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18987').replace(/\/$/, '');
const url = base + '/computing/systems/how-power-reaches-the-cpu/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const pct = (x, d) => zf(x * 100, d == null ? 0 : d) + '%';

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { window.__ft = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const click = (page, sel) => page.$eval(sel, e => e.click());
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

// every static diagram: role, aria, labels non-empty, inside the viewBox, no two labels overlapping, ≥ 11 px rendered
function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg) { out.push(name + ': no svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(name + ': role');
    const al = svg.getAttribute('aria-label') || '';
    if (al.length < 8 || /^dg\./.test(al)) out.push(name + ': aria-label "' + al + '"');
    const cap = fig.querySelector('figcaption'); if (!cap || cap.textContent.trim().length < 8) out.push(name + ': caption');
    const vb = svg.viewBox.baseVal, k = svg.getBoundingClientRect().width / vb.width;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      const s = t.textContent.trim();
      if (!s || /^dg\./.test(s) || /\{\w+\}/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
      const b = t.getBBox(), fs = parseFloat(t.getAttribute('font-size')) * k;
      if (fs < 11) out.push(`${name}: "${s.slice(0, 12)}" renders at ${fs.toFixed(1)}px`);
      if (b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5) out.push(`${name}: "${s.slice(0, 14)}" outside the drawing`);
      boxes.push([s, b]);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [s1, a] = boxes[i], [s2, b] = boxes[j], pad = 1;
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ix > pad && iy > pad) out.push(`${name}: "${s1.slice(0, 12)}" overlaps "${s2.slice(0, 12)}"`);
    }
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const stub = await (async () => { const p = await open(browser, 1280); const s = await p.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.enStub)); await p.close(); return s; })();
  const langs = stub ? ['zh'] : ['zh', 'en'];
  if (stub) console.log('NOTE: copy.en.js is a stub; English width sweep skipped');

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of langs) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia svg', s => s.length) === 10, `${tag}: ten diagrams (at least six required)`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.out td')].filter(e => {
      if (e.closest('svg') || e.closest('pre')) return false;
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
      if (e.closest('svg')) return false;
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.[\w-]+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .chainL, table.out, pre.hex')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
    if (lang === 'en') {
      const leftovers = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = walker.nextNode());) {
          const el = n.parentElement; if (!rx.test(n.textContent)) continue;
          if (el.closest('#langToggle') && n.textContent.trim() === '中') continue;
          const pz = el.closest('.page-provenance .provenance-zh'); if (pz && getComputedStyle(pz).display === 'none') continue;
          out.push('text "' + n.textContent.trim().slice(0, 24) + '"');
        }
        for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria ' + e.getAttribute('aria-label').slice(0, 24));
        if (rx.test(document.title)) out.push('title');
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas "' + t + '"');
        return out.slice(0, 8);
      }, CJK.source);
      ok(!leftovers.length, `${tag}: Chinese left in English mode: ${leftovers.join(' | ')}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) {
      await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
      for (const fig of await page.$$('figure')) {
        const id = await fig.evaluate(e => e.dataset.dg ? 'dg-' + e.dataset.dg : 'lab-' + (e.closest('section') || {}).id + '-' + [...e.closest('section').querySelectorAll('figure.lab')].indexOf(e));
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }


  {
    const page = await open(browser, 1280);
    const P = M.prose();
    const u = (x, d, s) => zf(x, d) + ' ' + s;
    const say = async id => page.$eval('#' + id, e => e.textContent);
    ok((await text(page, 'h1')) === '电是怎么送进 CPU 的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch1', e => e.textContent)).includes(u(P.c253I[0], 0, '安')), 'ch1 prose quotes the core current from the model');
    ok((await page.$eval('#ch9', e => e.textContent)).includes(u(P.th15pl2[0], 0, '秒')), 'ch9 prose quotes the boost time from the model');

    // ch1 the chain
    await show(page, '#chCv', 200);
    ok((await text(page, '#chWall')) === u(P.c253wall[0], 0, '瓦') && (await text(page, '#chIc')) === u(P.c253I[0], 0, '安') && (await text(page, '#chVc')) === u(P.c253V[0], 2, '伏'), 'ch1 default 253 W, gold, 850 W');
    const h1 = await canvasHash(page, 'chCv');
    await pick(page, 'chP', '65'); await page.waitForTimeout(60);
    { const r = M.chain(65, 'gold', 850); ok((await text(page, '#chIc')) === u(r.I, 0, '安') && (await text(page, '#chWall')) === u(r.wall, 0, '瓦'), 'ch1 65 W'); }
    ok(h1 !== await canvasHash(page, 'chCv'), 'ch1 canvas redraws');
    await setRange(page, 'chR', 5); await page.waitForTimeout(30);
    { const r = M.chain(65, 'gold', 1600); ok((await text(page, '#chShare')) === pct(r.cpuShare) && (await say('chSay')).length > 10, 'ch1 1600 W supply, light load'); }

    // ch2 power vs frequency
    await show(page, '#pwCv', 200);
    ok((await text(page, '#pwV')) === u(P.v56[0], 2, '伏') && (await text(page, '#pwP')) === u(P.p56[0], 0, '瓦'), 'ch2 default 5.6 GHz');
    const h2 = await canvasHash(page, 'pwCv');
    await setRange(page, 'pwF', 32); await page.waitForTimeout(60);
    ok((await text(page, '#pwP')) === u(P.p40[0], 0, '瓦') && h2 !== await canvasHash(page, 'pwCv'), 'ch2 4.0 GHz');
    await page.focus('#pwF'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(40);
    ok((await text(page, '#pwFo')) === '4.1 GHz', 'ch2 frequency by keyboard');
    await setRange(page, 'pwF', 10); await page.waitForTimeout(30);
    ok((await text(page, '#pwV')) === u(M.CHIP.vmin, 2, '伏'), 'ch2 below the knee: the voltage floor');

    // ch3 PSU efficiency
    await show(page, '#psCv', 200);
    ok((await text(page, '#psEff')) === pct(M.psuEff('gold', 0.1), 1), 'ch3 default gold at 10 %');
    const h3 = await canvasHash(page, 'psCv');
    await setRange(page, 'psX', 6); await page.waitForTimeout(60);
    ok((await text(page, '#psEff')) === pct(M.psuEff('gold', 0.5), 1) && h3 !== await canvasHash(page, 'psCv'), 'ch3 50 % load');
    await pick(page, 'psT', 'titanium'); await page.waitForTimeout(30);
    ok((await text(page, '#psEff')) === pct(M.psuEff('titanium', 0.5), 1), 'ch3 titanium');

    // ch4 multiphase
    await show(page, '#vrCv', 200);
    ok((await text(page, '#vrPh')) === u(P.v12ph[0], 1, '安') && (await text(page, '#vrSum')) === u(P.v12sum[0], 2, '安') && (await text(page, '#vrEff')) === pct(P.v12eff[0], 1), 'ch4 default 12 phases at 200 A');
    const h4 = await canvasHash(page, 'vrCv');
    await pick(page, 'vrN', '1'); await page.waitForTimeout(60);
    ok((await text(page, '#vrEff')) === pct(P.v1eff[0], 1) && h4 !== await canvasHash(page, 'vrCv'), 'ch4 one phase');
    await pick(page, 'vrN', '12'); await setRange(page, 'vrF', 5); await page.waitForTimeout(30);
    ok((await text(page, '#vrEff')) === pct(P.v12feff[0], 1), 'ch4 1 MHz switching');

    // ch5 droop and impedance
    await show(page, '#pdCv', 400);
    ok((await text(page, '#pdDroop')) === u(P.sDroop[0], 0, '毫伏') && (await text(page, '#pdOver')) === u(P.sOver[0], 0, '毫伏') && (await text(page, '#pdZ')) === u(P.zPk[0], 2, '毫欧'), 'ch5 default 100 A, 1 mΩ');
    const h5 = await canvasHash(page, 'pdCv');
    await click(page, '#pdP'); await page.waitForTimeout(200);
    ok((await text(page, '#pdDroop')) === u(P.sNoP[0], 0, '毫伏') && h5 !== await canvasHash(page, 'pdCv'), 'ch5 no package capacitors');
    await click(page, '#pdP'); await pick(page, 'pdL', '0'); await page.waitForTimeout(200);
    ok((await text(page, '#pdSt')) === u(P.sLL0s[0], 0, '毫伏'), 'ch5 no load line: small static drop');

    // ch7 race to idle
    await show(page, '#rcCv', 200);
    ok((await text(page, '#rcBest')) === u(P.rC6best[0], 1, 'GHz') && (await text(page, '#rcEf')) === u(P.rC6fast[0], 2, '焦'), 'ch7 default C6');
    const h7 = await canvasHash(page, 'rcCv');
    await pick(page, 'rcI', 'c1'); await page.waitForTimeout(60);
    ok((await text(page, '#rcEf')) === u(P.rC1fast[0], 2, '焦') && h7 !== await canvasHash(page, 'rcCv'), 'ch7 C1 idle');
    await pick(page, 'rcI', 'c6'); await setRange(page, 'rcP', 3); await page.waitForTimeout(30);
    ok((await text(page, '#rcBest')) === u(M.raceSweep(1, 'c6', 6).best.f, 1, 'GHz'), 'ch7 6 W platform moves the best point');

    // ch8 C-states
    await show(page, '#csCv', 200);
    ok((await text(page, '#csSave')) === pct(P.cMenuSave[0]) && (await text(page, '#csMiss')) === pct(P.cMenuMiss[0]), 'ch8 default menu at 300 µs');
    const h8 = await canvasHash(page, 'csCv');
    await pick(page, 'csP', 'oracle'); await page.waitForTimeout(60);
    ok((await text(page, '#csSave')) === pct(P.cOrSave[0]) && h8 !== await canvasHash(page, 'csCv'), 'ch8 oracle');
    await pick(page, 'csP', 'c1'); await page.waitForTimeout(30);
    { const lat = +(await page.$eval('input[name=csL]:checked', e => e.value)); ok((await text(page, '#csPw')) === u(M.cstate(M.CST.means[3], 'c1', lat).pAvg, 2, '瓦'), 'ch8 always C1'); }

    // ch9 heat
    await show(page, '#thCv', 300);
    ok((await text(page, '#thPl2')) === u(P.th15pl2[0], 0, '秒') && (await text(page, '#thFend')) === u(P.th15f[0], 1, 'GHz') && (await text(page, '#thHot')) === '—', 'ch9 default Intel limits, 0.15 K/W');
    const h9 = await canvasHash(page, 'thCv'); await page.waitForTimeout(500);
    ok(h9 !== await canvasHash(page, 'thCv'), 'ch9 trace animates');
    await pick(page, 'thS', 'unlim'); await setRange(page, 'thR', 4); await page.waitForTimeout(60);
    ok((await text(page, '#thHot')) === u(P.thUhot[0], 0, '秒') && (await text(page, '#thFend')) === u(P.thUf[0], 1, 'GHz') && (await text(page, '#thPl2')) === '—', 'ch9 unlimited, 0.20 K/W: hits Tj max');
    ok((await say('thSay')).length > 10, 'ch9 sentence');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#thCv', 400);
    const a = await canvasHash(page, 'thCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'thCv'), 'reduced motion: canvas is still (whole thermal run drawn at once)');
    ok((await text(page, '#thPl2')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, ten diagrams (role, aria, labels inside, no overlap, >= 11 px); toggle with stub fallback, keyboard, eight models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
