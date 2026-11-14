'use strict';
// Browser smoke test for the SAS essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18904 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-sas-works/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled. Then the
// language toggle (English is a stub: the page must fall back to Chinese and say so in <html lang>), keyboard
// operation of a slider, each of the seven models responding to its controls with the numbers the models give, and
// reduced motion (no smooth scroll; the ch6 lane animation is still and its button disabled). When copy.en.js is translated (enStub
// removed), the same width sweep also runs in English and checks that no Chinese is left, including canvas text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18904').replace(/\/$/, '');
const url = base + '/computing/systems/how-sas-works/';
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
    ok((await text(page, 'h1')) === '服务器硬盘为什么用 SAS', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    const P = M.prose();
    const dur = (s, d) => { const u = M.tunit(s); const dd = d == null ? (Math.abs(u.v) >= 100 ? 0 : Math.abs(u.v) >= 10 ? 1 : 2) : d; return zf(u.v, dd) + ' ' + { ns: '纳秒', us: '微秒', ms: '毫秒', s: '秒', min: '分钟', h: '小时', d: '天', y: '年' }[u.u]; };
    const pc = (x, d) => zf(x * 100, d || 0) + '%';
    ok((await page.$eval('#ch3', e => e.textContent)).includes(P.r4us[0].toFixed(2) + ' 微秒'), 'ch3 prose quotes the 4 KiB read time');
    ok((await page.$eval('#ch8', e => e.textContent)).includes('3,281'), 'ch8 prose quotes the missed triple');

    // ch2 CDB: keyboard on the offset slider; READ(10) at 512 B cannot reach 3.16 TB; READ(16) can; bytes shown
    await show(page, '#cdCv', 200);
    ok((await text(page, '#cdNeed')) === 'READ(16)', 'ch2 default needs READ(16), got ' + await text(page, '#cdNeed'));
    ok((await page.$eval('#cdSay', e => e.textContent)).length > 10, 'ch2 sentence');
    const x0 = await text(page, '#cdXo');
    await page.focus('#cdX'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(80);
    ok((await text(page, '#cdXo')) !== x0, 'ch2 slider responds to the keyboard');
    await pick(page, 'cdOp', 'r16'); await page.waitForTimeout(80);
    ok((await page.$eval('#cdHex', e => e.textContent)).includes('88'), 'ch2 READ(16) opcode 88 in the dump');
    await pick(page, 'cdBs', '4096'); await page.waitForTimeout(80);
    ok((await text(page, '#cdNeed')) === 'READ(10)', 'ch2 4 KiB blocks: READ(10) suffices, got ' + await text(page, '#cdNeed'));
    await pick(page, 'cdA', 'ordered'); await page.waitForTimeout(80);
    ok((await page.$eval('#cdHex', e => e.textContent)).length > 100, 'ch2 dump shows both envelopes');
    await pick(page, 'cdOp', 'r10'); await pick(page, 'cdBs', '512'); await pick(page, 'cdA', 'simple');

    // ch3 SSP read
    await show(page, '#spCv', 200);
    const r4 = M.SSP.read(4096, 'sas4');
    ok((await text(page, '#spEff')) === pc(r4.eff), 'ch3 4 KiB efficiency, got ' + await text(page, '#spEff'));
    ok((await text(page, '#spWire')) === zf(r4.f.total, 0) + ' 字节', 'ch3 wire bytes, got ' + await text(page, '#spWire'));
    await page.check('#spP', { force: true }); await page.waitForTimeout(80);
    ok((await text(page, '#spEff')) === pc(M.SSP.read(4096, 'sas4', null, true).eff), 'ch3 persistent connection, got ' + await text(page, '#spEff'));
    await page.uncheck('#spP', { force: true }); await pick(page, 'spN', '1048576'); await page.waitForTimeout(80);
    ok((await text(page, '#spEff')) === pc(M.SSP.read(1048576, 'sas4').eff), 'ch3 1 MiB, got ' + await text(page, '#spEff'));
    await pick(page, 'spN', '4096');

    // ch4 availability
    await show(page, '#avCv', 200);
    ok((await text(page, '#avTot')) === zf(P.sMin[0], 0) + ' 分钟/年', 'ch4 single path total, got ' + await text(page, '#avTot'));
    await pick(page, 'avP', '2'); await page.waitForTimeout(80);
    ok((await text(page, '#avTot')) === zf(P.dMin[0], 1) + ' 分钟/年' && (await text(page, '#avTop')) === '盘自己坏', 'ch4 dual path, got ' + await text(page, '#avTot') + ' ' + await text(page, '#avTop'));
    await setRange(page, 'avM', 43); await setRange(page, 'avF', 600); await page.waitForTimeout(80);
    ok((await page.$eval('#avSay', e => e.textContent)).includes('切换路径时的停顿'), 'ch4 long failover + weak controller: failover dominates');
    await setRange(page, 'avM', 50); await setRange(page, 'avF', 30);
    await pick(page, 'avD', 'sata'); await page.waitForTimeout(80);
    ok((await text(page, '#avTot')) === zf(P.sataMin[0], 0) + ' 分钟/年' && (await text(page, '#avUse')) === '1 条', 'ch4 SATA uses one path');
    await pick(page, 'avD', 'sas'); await pick(page, 'avP', '1');

    // ch5 fan-out
    await show(page, '#fnCv', 200);
    const f24 = M.FAN.run(24, 'hdd', 'seq', 4, 'sas3');
    ok((await text(page, '#fnDone')) === zf(f24.doneMB, 0) + ' MB/s' && (await text(page, '#fnWait')) === '∞', 'ch5 24 HDD seq saturates, got ' + await text(page, '#fnDone') + ' ' + await text(page, '#fnWait'));
    await pick(page, 'fnW', 'rand'); await page.waitForTimeout(80);
    ok((await page.$eval('#fnSay', e => e.textContent)).length > 10 && (await text(page, '#fnWait')) !== '∞', 'ch5 random load fits');
    await pick(page, 'fnW', 'seq'); await pick(page, 'fnL', '8'); await page.waitForTimeout(80);
    ok((await text(page, '#fnCap')) === zf(M.FAN.run(24, 'hdd', 'seq', 8, 'sas3').capMB, 0) + ' MB/s', 'ch5 eight lanes double the cap');
    await pick(page, 'fnL', '4');

    // ch6 wide port
    await show(page, '#wdCv', 300);
    const w1 = M.WIDE.measure(1, 'ssd', 131072, 4, 'sas4', false);
    ok((await text(page, '#wdMB')) === zf(w1.MBps, 0) + ' MB/s' && (await text(page, '#wdUtil')) === pc(w1.util), 'ch6 one SSD = one lane, got ' + await text(page, '#wdMB') + ' ' + await text(page, '#wdUtil'));
    await setRange(page, 'wdK', 6); await page.waitForTimeout(200);
    ok((await text(page, '#wdMB')) === zf(M.WIDE.measure(6, 'ssd', 131072, 4, 'sas4', false).MBps, 0) + ' MB/s', 'ch6 six SSDs fill four lanes');
    const h1 = await canvasHash(page, 'wdCv'); await page.waitForTimeout(600);
    ok(h1 !== await canvasHash(page, 'wdCv'), 'ch6 lanes animate when playing');
    await page.click('#wdPlay'); await page.waitForTimeout(200);
    const h3 = await canvasHash(page, 'wdCv'); await page.waitForTimeout(600);
    ok(h3 === await canvasHash(page, 'wdCv'), 'ch6 pause stops the lanes');
    await page.click('#wdPlay'); await setRange(page, 'wdK', 1);

    // ch8 T10 PI
    await show(page, '#piCv', 200);
    ok((await text(page, '#piOut')) === '写入被拒，主机重写', 'ch8 memory flip with PI is rejected, got ' + await text(page, '#piOut'));
    await page.uncheck('#piOn', { force: true }); await page.waitForTimeout(80);
    ok((await text(page, '#piOut')) === '静默损坏' && (await text(page, '#piGuard')) === '未启用', 'ch8 without PI: silent');
    await page.check('#piOn', { force: true }); await pick(page, 'piN', 'tri'); await page.waitForTimeout(80);
    ok((await text(page, '#piOut')) === '静默损坏' && (await text(page, '#piGuard')) === (await text(page, '#piSeen')), 'ch8 the missed triple slips past the guard');
    ok(await page.$eval('#piB', e => e.disabled), 'ch8 bit slider disabled for the fixed triple');
    await pick(page, 'piN', '1'); await pick(page, 'piF', 'misdir'); await page.waitForTimeout(80);
    ok((await text(page, '#piOut')) === '读回旧数据，无人报错', 'ch8 misdirected write reads stale');
    await pick(page, 'piF', 'link'); await page.waitForTimeout(80);
    ok((await text(page, '#piOut')) === '重发，读回正确', 'ch8 link flip retried');
    await page.click('#piGb'); await page.waitForFunction(() => document.getElementById('piGbOut').textContent.trim().length > 5, null, { timeout: 15000 });
    ok((await text(page, '#piGbOut')).includes('65,536'), 'ch8 garbage trial reports, got ' + await text(page, '#piGbOut'));
    await pick(page, 'piF', 'mem');

    // ch9 FEC
    await show(page, '#fcCv', 200);
    const e6 = M.FEC.run(1e-6, 1, 1);
    ok((await text(page, '#fcP')) === M.sciText(e6.pCw, 'zh'), 'ch9 default per-codeword failure, got ' + await text(page, '#fcP'));
    ok((await text(page, '#fcNo')) === dur(e6.noFecEveryS), 'ch9 without FEC, got ' + await text(page, '#fcNo') + ' want ' + dur(e6.noFecEveryS));
    await setRange(page, 'fcB', 7); await page.waitForTimeout(150);
    ok((await text(page, '#fcOk')) === '80%', 'ch9 7-bit bursts: 80% correctable, got ' + await text(page, '#fcOk'));
    await pick(page, 'fcI', '3'); await page.waitForTimeout(300);
    ok((await text(page, '#fcOk')) === '100%', 'ch9 3-way interleave: all single bursts correctable');
    ok((await page.$eval('#fcSay', e => e.textContent)).length > 10, 'ch9 sentence');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; the wide-port lanes do not animate and the play button is disabled
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#wdCv', 400);
    const a = await canvasHash(page, 'wdCv'); await page.waitForTimeout(700);
    ok(a === await canvasHash(page, 'wdCv'), 'reduced motion: ch6 lanes are still');
    ok(await page.$eval('#wdPlay', e => e.disabled && e.hidden && e.getBoundingClientRect().width === 0), 'reduced motion: play button disabled and hidden');
    ok((await text(page, '#wdMB')).length > 0, 'reduced motion: ch6 readouts filled');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences; toggle with stub fallback, keyboard, all seven models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
