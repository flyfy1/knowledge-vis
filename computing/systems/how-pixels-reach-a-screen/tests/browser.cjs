'use strict';
// Browser smoke test for the essay on how pixels reach a screen.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18979 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-pixels-reach-a-screen/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (English is a
// stub: the page falls back to Chinese and says so in <html lang>), keyboard operation of a slider, each of the
// eleven models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18979').replace(/\/$/, '');
const url = base + '/computing/systems/how-pixels-reach-a-screen/';
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
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia svg', s => s.length) === 12, `${tag}: twelve diagrams (at least six required)`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
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
      if (e.closest('defs')) return false;   // marker shapes are not laid out; the <svg> and what it draws are checked
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.[\w-]+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
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
        const id = await fig.evaluate(e => e.dataset.dg ? 'dg-' + e.dataset.dg : 'lab-' + (e.closest('section') || {}).id);
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    const P = M.prose();
    ok((await text(page, 'h1')) === '像素是怎么到屏幕上的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('header, .hero', e => e.textContent)).includes(zf(P.pxPerS[0], 0)), 'hero quotes the pixel rate from the model');
    ok((await page.$eval('#ch2', e => e.textContent)).includes(zf(P.pclkCvt[0], 3) + ' MHz'), 'ch2 prose quotes the CVT pixel clock');

    // ch1 framebuffer
    await show(page, '#fbFrame', 100);
    ok((await text(page, '#fbFrame')) === zf(P.frameMiB[0], 1) + ' MiB' && (await text(page, '#fbTotal')) === zf(P.fb3MiB[0], 1) + ' MiB' && (await text(page, '#fbBw')) === zf(P.readGBps[0], 2) + ' GB/s', 'ch1 default 4K RGBA8 120 Hz ×3, got ' + await text(page, '#fbBw'));
    await pick(page, 'fbF', 'fp16'); await page.waitForTimeout(30);
    ok((await text(page, '#fbBw')) === zf(P.fp16GBps[0], 2) + ' GB/s', 'ch1 FP16 doubles the read');
    await pick(page, 'fbR', 'k8'); await pick(page, 'fbH', '240'); await page.waitForTimeout(30);
    ok((await page.$eval('#fbSay', e => e.textContent)).length > 10 && (await text(page, '#fbBw')) === zf(M.framebuffer('k8', 'fp16', 240, 3).readGBps, 2) + ' GB/s', 'ch1 8K FP16 240 Hz');

    // ch2 timing
    await show(page, '#tmCv', 200);
    const t97 = M.timing(M.TIM.presets.cta97);
    ok((await text(page, '#tmPclk')) === zf(P.pclk97[0], 0) + ' MHz' && (await text(page, '#tmBlank')) === zf(P.blank97[0] * 100, 1) + '%' && (await text(page, '#tmLine')) === zf(t97.lineUs, 2) + ' 微秒', 'ch2 default CTA 97');
    const h2 = await canvasHash(page, 'tmCv');
    await pick(page, 'tmP', 'cvt4k60'); await page.waitForTimeout(60);
    ok((await text(page, '#tmPclk')) === zf(P.pclkCvt[0], 3) + ' MHz' && (await text(page, '#tmTot')) === '3,920 × 2,222', 'ch2 CVT-RB2, got ' + await text(page, '#tmPclk'));
    ok(h2 !== await canvasHash(page, 'tmCv'), 'ch2 canvas redraws');
    await pick(page, 'tmP', 'cta97'); await page.waitForTimeout(30);
    await page.focus('#tmHfp'); for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60);
    ok((await text(page, '#tmHfpo')) === '184' && (await text(page, '#tmPclk')) === zf(M.timing(M.TIM.presets.cta97, { hfp: 184 }).pclkMHz, 3) + ' MHz' && (await page.$eval('#tmSay', e => e.textContent)).length > 10, 'ch2 front porch by keyboard to 184, got ' + await text(page, '#tmPclk'));

    // ch3 present modes
    await show(page, '#psCv', 200);
    const f348 = M.present({ hz: 60, ms: 1000 / 48, mode: 'fifo3' });
    ok((await text(page, '#psShown')) === zf(f348.shownFps, 0) + ' 帧/秒' && (await text(page, '#psPace')) === zf(P.f3p48[0], 1) + ' 毫秒', 'ch3 default fifo3 48 on 60, got ' + await text(page, '#psPace'));
    const h3 = await canvasHash(page, 'psCv');
    await pick(page, 'psM', 'immediate'); await page.waitForTimeout(60);
    ok((await text(page, '#psTears')) === zf(P.imTears[0], 0) + ' 次/秒' && (await text(page, '#psLat')) === zf(P.imLat[0], 1) + ' 毫秒', 'ch3 immediate tears');
    ok(h3 !== await canvasHash(page, 'psCv'), 'ch3 canvas redraws');
    await pick(page, 'psM', 'fifo2'); await page.waitForTimeout(40);
    ok((await text(page, '#psShown')) === zf(P.f2Shown[0], 0) + ' 帧/秒' && (await text(page, '#psLat')) === zf(P.f2Lat[0], 1) + ' 毫秒', 'ch3 fifo2 halves to 30');
    await pick(page, 'psM', 'mailbox'); await setRange(page, 'psF', 90); await page.waitForTimeout(40);
    ok((await text(page, '#psLat')) === zf(P.mbLat[0], 1) + ' 毫秒', 'ch3 mailbox at 90 fps');
    await pick(page, 'psM', 'fifo3'); await setRange(page, 'psF', 60); await page.waitForTimeout(40);
    ok((await text(page, '#psShown')) === '60 帧/秒', 'ch3 fifo3 60 fps on 60 Hz shows 60, got ' + await text(page, '#psShown'));

    // ch4 VRR
    await show(page, '#vrCv', 200);
    ok((await text(page, '#vrPace')) === zf(P.vrPace[0], 1) + ' 毫秒' && (await text(page, '#vrLat')) === zf(P.vrLat[0], 1) + ' 毫秒', 'ch4 default 48 fps in 35–60');
    await setRange(page, 'vrF', 25); await click(page, '#vrL'); await page.waitForTimeout(60);
    ok((await text(page, '#vrPace')) === zf(P.v25Pace[0], 1) + ' 毫秒', 'ch4 25 fps without LFC stutters, got ' + await text(page, '#vrPace'));
    await click(page, '#vrL'); await page.waitForTimeout(60);
    ok((await text(page, '#vrPace')) === zf(P.v25lPace[0], 1) + ' 毫秒' && (await text(page, '#vrRep')) !== '0 次/秒', 'ch4 25 fps with LFC: even, repeats');

    // ch5 colour
    await show(page, '#coOut', 100);
    ok((await text(page, '#coOut')) === [P.p3R, P.p3G, P.p3B].map(x => zf(x[0], 0)).join(', '), 'ch5 default red on P3, got ' + await text(page, '#coOut'));
    await pick(page, 'coT', 'pq'); await pick(page, 'coB', '10'); await page.waitForTimeout(30);
    ok((await text(page, '#coOut')).startsWith(zf(P.pqR[0], 0) + ', ' + zf(P.pqG[0], 0)), 'ch5 red in HDR PQ');
    await pick(page, 'coT', 'srgb'); await pick(page, 'coB', '8'); await pick(page, 'coC', 'grey'); await pick(page, 'coL', '17'); await page.waitForTimeout(30);
    ok((await text(page, '#coLv')) === zf(P.lut17lv[0], 0) && (await page.$eval('#coSay', e => e.textContent)).includes('17 格'), 'ch5 17-entry LUT bands');

    // ch6 links
    await show(page, '#lkCv', 200);
    ok((await text(page, '#lkNeed')) === zf(P.need4k120[0], 2) + ' Gb/s' && (await text(page, '#lkFirst')) === 'DP UHBR10 ×4', 'ch6 default 4K120 10-bit, got ' + await text(page, '#lkFirst'));
    const h6 = await canvasHash(page, 'lkCv');
    await pick(page, 'lkM', 'uhd240'); await page.waitForTimeout(40);
    ok((await text(page, '#lkNeed')) === zf(P.need4k240[0], 2) + ' Gb/s', 'ch6 4K240');
    ok(h6 !== await canvasHash(page, 'lkCv'), 'ch6 canvas redraws');
    await pick(page, 'lkD', '12'); await page.waitForTimeout(40);
    ok((await text(page, '#lkNeed')) === zf(P.need240d[0], 2) + ' Gb/s', 'ch6 4K240 with DSC 12 bpp');

    // ch7 chroma
    await show(page, '#sbCv', 200);
    ok((await text(page, '#sbMean')) === zf(P.subT[0], 1) && (await text(page, '#sbBad')) === zf(P.subTbad[0] * 100, 0) + '%', 'ch7 default text 4:2:0');
    await pick(page, 'sbP', 'photo'); await page.waitForTimeout(40);
    ok((await text(page, '#sbMean')) === zf(P.subP[0], 1), 'ch7 photo 4:2:0');
    await pick(page, 'sbM', '444'); await page.waitForTimeout(40);
    ok((await text(page, '#sbBits')) === '24 位/像素', 'ch7 4:4:4 24 bits');

    // ch8 rows
    await show(page, '#rwCv', 200);
    ok((await text(page, '#rwLine')) === zf(P.row60[0], 2) + ' 微秒' && (await text(page, '#rwMax')) === zf(P.hzMaxAsi[0], 0) + ' Hz', 'ch8 default a-Si 2160 at 60, got ' + await text(page, '#rwMax'));
    await page.focus('#rwH'); for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60);
    ok((await text(page, '#rwHo')) === '120 Hz' && (await text(page, '#rwErr')) === zf(P.asiErr120[0], 1) + ' 级', 'ch8 a-Si at 120 Hz by keyboard: too slow, got ' + await text(page, '#rwErr'));
    await pick(page, 'rwT', 'oxide'); await page.waitForTimeout(40);
    ok((await text(page, '#rwMax')) === zf(P.hzMaxOx[0], 0) + ' Hz', 'ch8 oxide');

    // ch9 blur
    await show(page, '#blCv', 200);
    ok((await text(page, '#blW')) === zf(M.blur(960, 60, 1, M.BLUR.taus.oled).width, 1) + ' 像素', 'ch9 default OLED 960 px/s at 60 Hz, got ' + await text(page, '#blW'));
    await pick(page, 'blD', '0.25'); await page.waitForTimeout(80);
    ok((await text(page, '#blW')) === zf(M.blur(960, 60, 0.25, M.BLUR.taus.oled).width, 1) + ' 像素', 'ch9 25% duty');
    await pick(page, 'blD', '1'); await pick(page, 'blT', 'slow'); await pick(page, 'blH', '120'); await page.waitForTimeout(80);
    ok((await text(page, '#blW')) === zf(P.blurLcd[0], 1) + ' 像素', 'ch9 slow LCD at 120 Hz');

    // ch10 PQ
    await show(page, '#pqCv', 200);
    ok((await text(page, '#pqC')) === zf(M.pqCode(10, 10), 0), 'ch10 default 10 nits');
    await setRange(page, 'pqN', 20); await pick(page, 'pqK', '10000'); await page.waitForTimeout(40);
    ok((await text(page, '#pqC')) === zf(P.pq1[0], 0) && (await text(page, '#pqS')) === zf(P.pqStep1[0] * 100, 2) + '%', 'ch10 1 nit on the PQ scale');
    await setRange(page, 'pqN', 55); await pick(page, 'pqK', '1000'); await page.waitForTimeout(40);
    ok((await text(page, '#pqGs')) === '—', 'ch10 above the gamma peak: clipped');

    // ch11 latency
    await show(page, '#ltCv', 200);
    ok((await text(page, '#ltTot')) === zf(P.lat0[0], 1) + ' 毫秒' && (await text(page, '#ltBig')) === '画 + 排队（模型 3）', 'ch11 default, got ' + await text(page, '#ltTot'));
    const h11 = await canvasHash(page, 'ltCv');
    await pick(page, 'ltM', 'vrr'); await click(page, '#ltC'); await pick(page, 'ltP', 'oled'); await pick(page, 'ltQ', '1000'); await page.waitForTimeout(60);
    ok((await text(page, '#ltTot')) === zf(P.lat1[0], 1) + ' 毫秒', 'ch11 VRR, no compositor, OLED, 1000 Hz mouse');
    ok(h11 !== await canvasHash(page, 'ltCv'), 'ch11 canvas redraws');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#psCv', 400);
    const a = await canvasHash(page, 'psCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'psCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#psLat')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, twelve diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, all eleven models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
