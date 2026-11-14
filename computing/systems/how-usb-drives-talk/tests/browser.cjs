'use strict';
// Browser smoke test for the USB storage essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18906 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-usb-drives-talk/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled. Then the
// language toggle (English is a stub: the page must fall back to Chinese and say so in <html lang>), keyboard
// operation of a slider, each of the nine models responding to its controls with the numbers the models give, and
// reduced motion (no smooth scroll; the ch7 heat trace does not animate and its play button is disabled). When
// copy.en.js is translated (enStub removed), the same width sweep also runs in English and checks that no Chinese
// is left, including canvas text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18906').replace(/\/$/, '');
const url = base + '/computing/systems/how-usb-drives-talk/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const mb = (x, d) => zf(x, d == null ? (x < 100 ? 1 : 0) : d) + ' MB/s';

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
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
// click the input itself (it is visually hidden inside its label; a coordinate click can land on the sticky header)
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

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
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
      if (e.closest('pre.hex')) return false;                // the hex dump scrolls inside its own box
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
      if (e.closest('pre.hex')) return false;
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
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
    if (SHOT) await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')) === '移动硬盘为什么跑不满', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    const P = M.prose();
    ok((await page.$eval('#ch2', e => e.textContent)).includes(zf(P.u2max[0], 1) + ' MB/s'), 'ch2 prose quotes the USB 2.0 ceiling from the model');
    ok((await page.$eval('#ch7', e => e.textContent)).includes(zf(P.ts20p[0], 1) + ' 分钟'), 'ch7 prose quotes the first-throttle time from the model');

    // ch2 microframe: keyboard on the payload slider, 512 B gives the Table 5-10 maximum
    await show(page, '#mfCv', 200);
    ok((await text(page, '#mfN')) === '13' && (await text(page, '#mfB')) === mb(M.SPEC.usb2.maxBps / 1e6, 1), 'ch2 512 B: 13 transactions, 53.2 MB/s, got ' + await text(page, '#mfN') + ' ' + await text(page, '#mfB'));
    await page.focus('#mfP'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(80);
    const u256 = M.USB2.pack(256);
    ok((await text(page, '#mfN')) === zf(u256.n, 0), 'ch2 slider responds to the keyboard (256 B), got ' + await text(page, '#mfN'));
    await setRange(page, 'mfP', 0); await page.waitForTimeout(80);
    ok((await text(page, '#mfE')) === zf(M.USB2.pack(1).eff * 100, 1) + '%', 'ch2 1-byte payload efficiency');

    // ch3 labels: every name lands on its mode
    await show(page, '#lbCv', 200);
    for (const [id] of M.LABELS) {
      await pick(page, 'lbL', id); await page.waitForTimeout(40);
      const v = M.say.label(id).v;
      ok((await text(page, '#lbRaw')) === mb(v.raw, 0), `ch3 ${id} raw ${await text(page, '#lbRaw')} vs ${mb(v.raw, 0)}`);
    }
    await pick(page, 'lbL', 'usb31g1'); await page.waitForTimeout(40);
    ok((await text(page, '#lbSpec')) === mb(M.SPEC.usb3.g1Eff, 0), 'ch3 USB 3.1 Gen 1 = 450 MB/s effective');
    await pick(page, 'lbL', 'usb32g2x2');

    // ch4 CBW hex and the BOT curve
    await show(page, '#cwHex', 150);
    ok((await page.$eval('#cwHex', e => e.textContent)).includes('55 53 42 43'), 'ch4 CBW starts with USBC');
    await setRange(page, 'cwL', 40); await page.waitForTimeout(60);
    ok((await page.$eval('#cwSay', e => e.textContent)).includes('4,294,967,295'), 'ch4 LBA 2^40 overflows READ(10)');
    await pick(page, 'cwOp', 'read16'); await page.waitForTimeout(60);
    ok((await page.$eval('#cwHex', e => e.textContent)).includes('88'), 'ch4 READ(16) opcode in the hex');
    await show(page, '#boCv', 200);
    ok((await text(page, '#boX')) === mb(P.b4[0]), 'ch4 BOT 4 KiB at 10 Gb/s, got ' + await text(page, '#boX'));
    await setRange(page, 'boS', 20); await page.waitForTimeout(80);
    ok((await text(page, '#boX')) === mb(P.b1m[0]), 'ch4 BOT 1 MiB, got ' + await text(page, '#boX'));
    await pick(page, 'boK', 'hs'); await page.waitForTimeout(80);
    ok((await text(page, '#boX')) === mb(M.Q.bot(1048576, M.SPEC.usb2.maxBps / 1e6, M.SPEC.nvmeSeq).X), 'ch4 BOT on USB 2.0');

    // ch5 UASP
    await show(page, '#uaCv', 200);
    await setRange(page, 'uaS', 12); await pick(page, 'uaN', '32'); await page.waitForTimeout(80);
    ok((await text(page, '#uaU')) === mb(P.u4q32[0]), 'ch5 UAS 4 KiB QD32, got ' + await text(page, '#uaU'));
    await pick(page, 'uaN', '1'); await page.waitForTimeout(80);
    ok((await text(page, '#uaU')) === (await text(page, '#uaB')), 'ch5 one command in flight equals BOT');

    // ch6 the chain
    await show(page, '#chCv', 200);
    ok((await text(page, '#chR')) === mb(P.c10[0], 0) && (await text(page, '#chN')) === 'USB 链路', 'ch6 default: 10 Gb/s link-bound, got ' + await text(page, '#chR') + ' ' + await text(page, '#chN'));
    await pick(page, 'chX', 'g2x2'); await pick(page, 'chH', 'g2x2'); await page.waitForTimeout(80);
    ok((await text(page, '#chR')) === mb(P.c20x2[0], 0) && (await text(page, '#chN')) === '桥接下行', 'ch6 20 Gb/s with PCIe 3.0 x2 is bridge-bound, got ' + await text(page, '#chR'));
    await pick(page, 'chH', 'g2x1'); await page.waitForTimeout(80);
    ok((await text(page, '#chM')) === 'Gen 2×1', 'ch6 20 Gb/s box on 10 Gb/s port falls back');
    await pick(page, 'chD', 'sata'); await page.waitForTimeout(80);
    ok((await text(page, '#chR')) === '—', 'ch6 SATA drive in an NVMe-only bridge does not fit');
    await pick(page, 'chB', 'sata'); await page.waitForTimeout(80);
    ok((await text(page, '#chR')) === mb(P.cSata[0], 0), 'ch6 SATA drive on a SATA bridge, got ' + await text(page, '#chR'));

    // ch7 heat: defaults, metal case, play animates
    await show(page, '#htCv', 250);
    ok((await text(page, '#htV')) === mb(P.avg20p[0], 0) && (await text(page, '#htF')) === zf(P.ts20p[0], 1) + ' 分钟', 'ch7 20 Gb/s plastic, got ' + await text(page, '#htV') + ' ' + await text(page, '#htF'));
    await pick(page, 'htX', 'tb5'); await pick(page, 'htS', 'al'); await page.waitForTimeout(80);
    ok((await text(page, '#htF')) === '不会' && (await text(page, '#htV')) === mb(P.avg5a[0], 0), 'ch7 TB5 aluminium never throttles');
    await page.click('#htPlay'); await page.waitForTimeout(150);
    const ha = await canvasHash(page, 'htCv'); await page.waitForTimeout(600);
    ok(ha !== await canvasHash(page, 'htCv'), 'ch7 the trace animates when playing');
    await page.click('#htPlay'); await page.waitForTimeout(150);
    const hb = await canvasHash(page, 'htCv'); await page.waitForTimeout(500);
    ok(hb === await canvasHash(page, 'htCv'), 'ch7 pause stops the trace');

    // ch8 tunnel
    await show(page, '#tnCv', 200);
    ok((await text(page, '#tnX')) === mb(P.t4[0], 0), 'ch8 TB4 default, got ' + await text(page, '#tnX'));
    await pick(page, 'tnH', 'tb5'); await page.waitForTimeout(80);
    ok((await text(page, '#tnX')) === mb(P.t5[0], 0) && (await text(page, '#tnN')) === '桥接下行', 'ch8 TB5 is bridge-bound');
    await pick(page, 'tnH', 'usb4np'); await page.waitForTimeout(80);
    ok((await text(page, '#tnX')) === mb(P.tnp[0], 0), 'ch8 USB4 host without PCIe tunnel');

    // ch9 stick
    await show(page, '#skCv', 200);
    ok((await text(page, '#skX')) === mb(P.st1[0], 0), 'ch9 one die, got ' + await text(page, '#skX'));
    await pick(page, 'skD', '2'); await page.waitForTimeout(80);
    ok((await text(page, '#skX')) === mb(P.st2[0], 0), 'ch9 two dies hit the bus, got ' + await text(page, '#skX'));
    await pick(page, 'skB', 'uhs1'); await page.waitForTimeout(80);
    ok((await text(page, '#skU')) === mb(M.STICK.bus('uhs1'), 0), 'ch9 UHS-I bus');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; the heat trace is drawn whole and does not animate; play is disabled
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#htCv', 400);
    ok(await page.$eval('#htPlay', e => e.disabled), 'reduced motion: play button disabled');
    const a = await canvasHash(page, 'htCv'); await page.waitForTimeout(700);
    ok(a === await canvasHash(page, 'htCv'), 'reduced motion: ch7 canvas is still');
    ok((await text(page, '#htV')).length > 0, 'reduced motion: ch7 readouts filled');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences; toggle with stub fallback, keyboard, all nine models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
