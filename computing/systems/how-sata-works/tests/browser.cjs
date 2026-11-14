'use strict';
// Browser smoke test for the SATA essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18902 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-sata-works/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled. Then the
// language toggle (English is a stub: the page must fall back to Chinese and say so in <html lang>), keyboard
// operation of a slider, each of the seven models responding to its controls with the numbers the models give, and
// reduced motion (no smooth scroll; the ch5 platter does not animate). When copy.en.js is translated (enStub
// removed), the same width sweep also runs in English and checks that no Chinese is left, including canvas text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18902').replace(/\/$/, '');
const url = base + '/computing/systems/how-sata-works/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');

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
const pick = (page, name, value) => page.click(`input[name=${name}][value="${value}"]`, { force: true });
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
      if (e.closest('pre.hex')) return false;                // the hex dump scrolls inside its own box
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
    ok((await text(page, 'h1')) === 'SATA 为什么用了二十多年', 'hero title filled from copy');
    // language toggle; while English is a stub the page shows Chinese and says so in <html lang>
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    const P = M.prose();
    // prose placeholders filled with the model's numbers
    ok((await page.$eval('#ch5', e => e.textContent)).includes('，16 是 ' + zf(P.s16[0], 0) + '，'), 'ch5 prose quotes SATF QD16 from the model');
    ok((await page.$eval('#ch4', e => e.textContent)).includes(zf(P.dw4[0], 0) + ' 个双字'), 'ch4 prose quotes the 4 KiB wire total');

    // ch2 Ultra DMA: keyboard on the skew slider; mode 6 closes at 1×, fails above k6; 40-conductor forbids mode 3+
    await show(page, '#udCv', 200);
    ok((await text(page, '#udRate')) === '133.3 MB/s', 'ch2 UDMA6 133.3 MB/s, got ' + await text(page, '#udRate'));
    ok((await text(page, '#udMar')) === zf(P.u6mar[0], 2) + ' 纳秒', 'ch2 margin, got ' + await text(page, '#udMar'));
    await page.focus('#udK'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    ok((await text(page, '#udKo')).includes('1.01'), 'ch2 slider responds to the keyboard, got ' + await text(page, '#udKo'));
    await setRange(page, 'udK', 1.1); await page.waitForTimeout(80);
    ok(/^[-−]/.test(await text(page, '#udMar')), 'ch2 mode 6 fails at 1.1×, margin ' + await text(page, '#udMar'));
    await setRange(page, 'udK', 1); await pick(page, 'udC', '40'); await page.waitForTimeout(80);
    ok((await text(page, '#udUsed')) === '—', 'ch2 40-conductor mode 6 not allowed');
    await pick(page, 'udC', '80');

    // ch3 8b/10b
    await show(page, '#enCv', 200);
    await pick(page, 'enP', 'zero'); await page.waitForTimeout(80);
    ok((await text(page, '#enRawRun')).startsWith('64') && (await text(page, '#enRun')).startsWith('3'), 'ch3 zeros: raw run 64, coded 3, got ' + await text(page, '#enRawRun') + ' / ' + await text(page, '#enRun'));
    ok((await page.$eval('#enSyms', e => e.textContent)).includes('D0.0') && (await page.$eval('#enSyms', e => e.textContent)).includes('100111'), 'ch3 symbol list shows D0.0');
    ok((await text(page, '#enComma')) === '0', 'ch3 zeros: no comma');
    await pick(page, 'enP', 'align'); await page.waitForTimeout(80);
    ok(+(await text(page, '#enComma')) > 0, 'ch3 ALIGN shows commas');
    await page.check('#enScr', { force: true }).catch(() => {});
    await pick(page, 'enP', 'zero'); await page.waitForTimeout(80);
    ok((await page.$eval('#enSay', e => e.textContent)).length > 20, 'ch3 scrambled zeros sentence');
    ok(!/[。] [^\s]/.test(await page.$eval('#enSay', e => e.textContent)), 'ch3 zh sentences join without a stray space');
    await page.fill('#enIn', 'SATA'); await page.waitForTimeout(80);
    ok(await page.$eval('input[name=enP][value=text]', e => e.checked), 'ch3 typing selects the text preset');

    // ch4 FIS step-through and wire account
    await show(page, '#fsCv', 200);
    ok((await text(page, '#fsDw')) === zf(P.dw4[0], 0) && (await text(page, '#fsFr')) === '5', 'ch4 4 KiB: 5 frames, total dwords, got ' + await text(page, '#fsFr') + ' ' + await text(page, '#fsDw'));
    await pick(page, 'fsN', '256'); await page.waitForTimeout(80);
    ok((await text(page, '#fsFr')) === zf(P.fr256[0], 0) && (await text(page, '#fsEff')) === zf(P.eff256[0] * 100, 0) + '%', 'ch4 128 KiB frames/eff');
    await pick(page, 'fsN', '8');
    const s0 = await text(page, '#fsStep'); await page.click('#fsNext'); await page.waitForTimeout(80);
    ok((await text(page, '#fsStep')) !== s0, 'ch4 next step changes the step text');
    await setRange(page, 'fsT', 31); await page.waitForTimeout(80);
    ok((await page.$eval('#fsHex', e => e.textContent)).includes('80000000'), 'ch4 tag 31 sets SActive bit 31');
    ok((await page.$eval('#fsHex', e => e.textContent)).includes('000000F8'), 'ch4 tag 31 in COUNT bits 7:3');

    // ch5 NCQ
    await show(page, '#ncCv', 300);
    ok((await text(page, '#ncIops')) === zf(P.s8[0], 0), 'ch5 default SATF QD8, got ' + await text(page, '#ncIops'));
    await pick(page, 'ncQ', '16'); await page.waitForTimeout(150);
    ok((await text(page, '#ncIops')) === zf(P.s16[0], 0), 'ch5 SATF QD16');
    await pick(page, 'ncP', 'fifo'); await page.waitForTimeout(150);
    ok(Math.abs(+(await text(page, '#ncIops')) - P.q1[0]) <= 4, 'ch5 FIFO stays near QD1, got ' + await text(page, '#ncIops'));
    await pick(page, 'ncQ', '1'); await page.waitForTimeout(150);
    ok((await page.$eval('#ncSay', e => e.textContent)).length > 10, 'ch5 QD1 sentence');
    const h1 = await canvasHash(page, 'ncCv'); await page.waitForTimeout(600); const h2 = await canvasHash(page, 'ncCv');
    ok(h1 !== h2, 'ch5 platter animates when playing');
    await page.click('#ncPlay'); await page.waitForTimeout(200);
    const h3 = await canvasHash(page, 'ncCv'); await page.waitForTimeout(600);
    ok(h3 === await canvasHash(page, 'ncCv'), 'ch5 pause stops the platter');
    await pick(page, 'ncP', 'satf'); await pick(page, 'ncQ', '8');

    // ch6 link power
    await show(page, '#pwCv', 200);
    await setRange(page, 'pwM', -3); await pick(page, 'pwS', 'slumber'); await page.waitForTimeout(80);
    ok((await page.$eval('#pwSay', e => e.textContent)).includes('反而更费电'), 'ch6 Slumber at 1 ms costs energy');
    ok((await text(page, '#pwBest')) === 'Partial', 'ch6 best at 1 ms is Partial, got ' + await text(page, '#pwBest'));
    await setRange(page, 'pwM', 0); await pick(page, 'pwS', 'devslp'); await page.waitForTimeout(80);
    ok((await text(page, '#pwW')) === zf(P.dev1[0], 1) + ' 毫瓦', 'ch6 DevSleep at 1 s, got ' + await text(page, '#pwW'));
    ok((await page.$eval('#pwSay', e => e.textContent)).includes('最省'), 'ch6 DevSleep at 1 s is best');
    await pick(page, 'pwS', 'on'); await page.waitForTimeout(80);
    ok((await text(page, '#pwW')) === '150.0 毫瓦', 'ch6 always on 150 mW');
    await setRange(page, 'pwT', 50); await pick(page, 'pwS', 'partial'); await page.waitForTimeout(80);
    ok((await text(page, '#pwTo')).includes('50'), 'ch6 timeout readout');

    // ch7 port multiplier
    await show(page, '#pmCv', 200);
    await setRange(page, 'pmN', 2); await page.waitForTimeout(80);
    ok((await text(page, '#pmAgg')) === zf(P.two[0], 0) + ' MB/s', 'ch7 two disks FBS sequential, got ' + await text(page, '#pmAgg'));
    await setRange(page, 'pmN', 3); await page.waitForTimeout(80);
    ok((await text(page, '#pmAgg')) === zf(P.cap3[0], 0) + ' MB/s', 'ch7 three disks hit the cap');
    await pick(page, 'pmL', '2'); await page.waitForTimeout(80);
    ok((await text(page, '#pmCap')) === zf(M.LINK.wire(256, 2).mbps, 0) + ' MB/s', 'ch7 eSATA cap');
    await pick(page, 'pmL', '3'); await pick(page, 'pmW', 'rand'); await setRange(page, 'pmN', 4); await page.waitForTimeout(400);
    ok((await text(page, '#pmAgg')).startsWith(zf(P.fbs4[0], 0)), 'ch7 FBS 4 disks random, got ' + await text(page, '#pmAgg'));
    await pick(page, 'pmM', 'cbs'); await page.waitForTimeout(150);
    ok((await text(page, '#pmAgg')).startsWith(zf(P.cbs[0], 0)), 'ch7 CBS random, got ' + await text(page, '#pmAgg'));

    // ch8 HDD vs the link
    await show(page, '#hdCv', 200);
    ok((await text(page, '#hdOd')) === '285 MB/s' && (await text(page, '#hdNeed')) === '×' + zf(P.need[0], 1), 'ch8 defaults, got ' + await text(page, '#hdOd') + ' ' + await text(page, '#hdNeed'));
    await pick(page, 'hdH', '2'); await page.waitForTimeout(80);
    ok((await text(page, '#hdOd')) === zf(P.hbd2[0], 0) + ' MB/s' && (await page.$eval('#hdSay', e => e.textContent)).includes('超过了'), 'ch8 2x parallel read passes 560');
    await pick(page, 'hdH', '1'); await pick(page, 'hdR', '15000'); await page.waitForTimeout(80);
    ok((await text(page, '#hdOd')) === zf(P.od15[0], 0) + ' MB/s', 'ch8 15000 rpm');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; the platter does not animate
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#ncCv', 400);
    const a = await canvasHash(page, 'ncCv'); await page.waitForTimeout(700);
    ok(a === await canvasHash(page, 'ncCv'), 'reduced motion: ch5 platter is still');
    ok((await text(page, '#ncIops')).length > 0, 'reduced motion: ch5 readouts filled');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences; toggle with stub fallback, keyboard, all seven models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
