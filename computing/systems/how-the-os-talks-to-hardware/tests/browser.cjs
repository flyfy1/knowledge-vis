'use strict';
// Browser smoke test for the essay on how the OS talks to hardware.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18978 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-the-os-talks-to-hardware/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48x48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (English is a
// stub: the page falls back to Chinese and says so in <html lang>), keyboard operation of a slider, each of the nine
// models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18978').replace(/\/$/, '');
const url = base + '/computing/systems/how-the-os-talks-to-hardware/';
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
    const dur = x => x >= 1000 ? zf(x / 1000, x >= 10000 ? 1 : 2) + ' 毫秒' : x >= 1 ? zf(x, x < 10 ? 2 : x < 100 ? 1 : 0) + ' 微秒' : zf(x * 1000, 0) + ' 纳秒';
    const say = async id => page.$eval('#' + id, e => e.textContent);
    ok((await text(page, 'h1')) === '操作系统是怎么和硬件说话的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch3', e => e.textContent)).includes(zf(P.cPcid[0], 0) + ' 个周期'), 'ch3 prose quotes the crossing cycles from the model');
    ok((await page.$eval('#ch6', e => e.textContent)).includes('每秒约 ' + zf(P.pLive[0], 0) + ' 千个包'), 'ch6 prose quotes the livelock rate from the model');

    // ch1 privilege
    await show(page, '#pvTbl', 100);
    ok((await text(page, '#pvRes')) === '#GP' && (await text(page, '#pvSig')) === 'SIGSEGV', 'ch1 default: IN at ring 3 is #GP');
    await click(page, '#pvGrant'); await page.waitForTimeout(30);
    ok((await text(page, '#pvRes')) === '执行' && (await say('pvSay')).length > 10, 'ch1 ioperm granted: IN runs');
    await pick(page, 'pvO', 'hlt'); await page.waitForTimeout(30);
    ok((await text(page, '#pvRes')) === '#GP', 'ch1 HLT still traps when ports are granted');
    await pick(page, 'pvA', 'arm'); await page.waitForTimeout(30);
    ok(await page.$eval('input[name=pvO][value=in]', e => e.closest('label').hidden) && await page.$eval('input[name=pvL][value=el0]', e => e.checked), 'ch1 Arm: no port I/O, level EL0');
    await pick(page, 'pvO', 'msr'); await page.waitForTimeout(30);
    ok((await text(page, '#pvRes')) === '未定义指令' && (await text(page, '#pvSig')) === 'SIGILL', 'ch1 Arm MSR at EL0: undefined, SIGILL');
    ok((await page.$$eval('#pvTbl tbody tr', r => r.length)) === M.PRIV.ops.arm.length, 'ch1 Arm table rows');

    // ch2 ABI
    await show(page, '#abRegs', 100);
    ok((await text(page, '#abNr')) === '0' && (await text(page, '#abInsn')) === 'syscall' && (await text(page, '#abRet')) === 'rax', 'ch2 default x86 read');
    await pick(page, 'abA', 'arm'); await page.waitForTimeout(30);
    ok((await text(page, '#abNr')) === '63' && (await text(page, '#abInsn')) === 'svc #0' && (await text(page, '#abRegs')).startsWith('x8'), 'ch2 arm64 read is 63 in x8');
    await pick(page, 'abC', 'io_uring_enter'); await page.waitForTimeout(30);
    ok((await text(page, '#abNr')) === '426' && (await text(page, '#abN')) === '6', 'ch2 io_uring_enter: 426, six arguments');
    ok((await page.$$eval('#abSteps li', l => l.length)) === 6, 'ch2 six steps');

    // ch3 cost
    await show(page, '#scCv', 200);
    ok((await text(page, '#scC')) === zf(P.cPcid[0], 0) + ' 个周期' && (await text(page, '#scShare')) === pct(P.c1Share[0]) && (await text(page, '#scNs')) === zf(P.c1Ns[0], 0) + ' 纳秒', 'ch3 default: PCID, 200 cycles, batch 1');
    const h3 = await canvasHash(page, 'scCv');
    await setRange(page, 'scB', 5); await page.waitForTimeout(60);
    ok((await text(page, '#scShare')) === pct(P.c32Share[0]), 'ch3 batch 32');
    ok(h3 !== await canvasHash(page, 'scCv'), 'ch3 canvas redraws');
    await pick(page, 'scP', 'nopcid'); await setRange(page, 'scB', 0); await page.waitForTimeout(30);
    ok((await text(page, '#scNs')) === zf(P.cNNs[0], 0) + ' 纳秒', 'ch3 no PCID');
    await page.focus('#scW'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(40);
    ok((await text(page, '#scWo')) === '500 个周期', 'ch3 work by keyboard to 500 cycles');

    // ch4 registers
    await show(page, '#mmCv', 200);
    ok((await text(page, '#mmPoll')) === dur(P.mPoll[0]) && (await text(page, '#mmIrq')) === zf(P.mIrq[0], 0) + ' 纳秒', 'ch4 default: poll and interrupt per command');
    const h4 = await canvasHash(page, 'mmCv');
    await setRange(page, 'mmB', 6); await page.waitForTimeout(60);
    { const r = M.mmio(5, 64); ok((await text(page, '#mmRing')) === dur(r.perCmd.ring / 1000) && h4 !== await canvasHash(page, 'mmCv'), 'ch4 64 per doorbell'); }

    // ch6 interrupts / polling / NAPI
    await show(page, '#plCv', 300);
    { const r = M.pollSim('irq', 2e5, 0); ok((await text(page, '#plCpu')) === pct(r.cpu) && (await text(page, '#plMean')) === dur(r.mean), 'ch6 default: interrupt per packet at 200k'); }
    ok((await text(page, '#plLive')) === zf(P.pLive[0], 0) + ' 千包/秒', 'ch6 livelock threshold readout');
    const h6 = await canvasHash(page, 'plCv');
    await pick(page, 'plM', 'napi'); await page.waitForTimeout(80);
    ok((await text(page, '#plCpu')) === pct(P.pNcpu[0]) && (await text(page, '#plPer')) === zf(P.pNper[0], 1), 'ch6 NAPI at 200k');
    ok(h6 !== await canvasHash(page, 'plCv'), 'ch6 canvas redraws');
    await pick(page, 'plM', 'irq'); await setRange(page, 'plR', 8); await page.waitForTimeout(60);
    ok((await say('plSay')).startsWith('活锁'), 'ch6 300k with interrupts: livelock');
    await pick(page, 'plM', 'poll'); await page.waitForTimeout(30);
    ok(await page.$eval('#plC', e => e.disabled) && (await text(page, '#plCpu')) === '100%', 'ch6 polling: one whole core, coalescing disabled');

    // ch7 ring
    await show(page, '#rgCv', 200);
    ok((await text(page, '#rgDrop')) === pct(P.g0drop[0], 1) && (await text(page, '#rgNeed')) === zf(P.g0need[0], 0) + ' 格', 'ch7 default drops ' + await text(page, '#rgDrop'));
    ok((await text(page, '#rgCtr')).startsWith('0x0000'), 'ch7 counters wrapped past 0xFFFFFFFF');
    const h7 = await canvasHash(page, 'rgCv');
    await setRange(page, 'rgN', 3); await page.waitForTimeout(60);
    ok((await text(page, '#rgDrop')) === '0%' && h7 !== await canvasHash(page, 'rgCv'), 'ch7 512 slots: no drops');
    await setRange(page, 'rgS', 6); await page.waitForTimeout(60);
    ok((await say('rgSay')).includes('不是环大小的问题'), 'ch7 1 ms stalls: capacity, not ring size');

    // ch9 bind
    await show(page, '#bdLog', 100);
    ok((await text(page, '#bdBound')) === '4 / 5' && (await text(page, '#bdRetry')) === '1' && (await page.$$eval('#bdLog li.bad', l => l.length)) === 1, 'ch9 default: one deferral, retried, 4 bound');
    await pick(page, 'bdO', 'regfirst'); await page.waitForTimeout(30);
    ok((await text(page, '#bdRetry')) === '0' && (await text(page, '#bdBound')) === '4 / 5', 'ch9 regulator first: no retry');
    await click(page, '#bd_regfixed'); await page.waitForTimeout(30);
    ok((await text(page, '#bdDef')) === '1' && (await text(page, '#bdBound')) === '2 / 5', 'ch9 no regulator driver: SD stays deferred');

    // ch10 read path
    await show(page, '#rdCv', 200);
    ok((await text(page, '#rdTot')) === dur(P.rMiss[0]) && (await text(page, '#rdSoft')) === pct(P.rSoft[0]) && (await text(page, '#rdAvg')) === dur(P.r90[0]), 'ch10 default: miss on Optane');
    const h10 = await canvasHash(page, 'rdCv');
    await pick(page, 'rdM', 'hit'); await page.waitForTimeout(60);
    ok((await text(page, '#rdTot')) === dur(P.rHit[0]) && h10 !== await canvasHash(page, 'rdCv'), 'ch10 page-cache hit');
    await pick(page, 'rdM', 'polled'); await page.waitForTimeout(30);
    ok((await text(page, '#rdTot')) === dur(P.rPolled[0]), 'ch10 O_DIRECT polled');
    await pick(page, 'rdM', 'miss'); await pick(page, 'rdD', 'hdd'); await page.waitForTimeout(30);
    ok((await text(page, '#rdTot')) === dur(M.readTrace('miss', 'hdd').total), 'ch10 hard disk');
    ok((await page.$$eval('#rdSteps span', s => s.length)) === M.readSteps('miss', 'hdd').length, 'ch10 one chip per step');

    // ch11 syscalls per I/O
    await show(page, '#asCv', 200);
    ok((await text(page, '#asSys')) === zf(1 / 8, 2) && (await text(page, '#asIops')) === zf(M.asyncIo('uring', 8).perCore / 1000, 0) + ' 千次/秒', 'ch11 default io_uring k=8');
    const h11 = await canvasHash(page, 'asCv');
    await pick(page, 'asA', 'sqpoll'); await page.waitForTimeout(60);
    ok((await text(page, '#asCores')) === '2' && (await text(page, '#asIops')) === zf(P.aScore[0], 0) + ' 千次/秒', 'ch11 SQPOLL: two cores');
    await setRange(page, 'asK', 0); await page.waitForTimeout(60);
    ok(h11 !== await canvasHash(page, 'asCv'), 'ch11 canvas redraws');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#plCv', 400);
    const a = await canvasHash(page, 'plCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'plCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#plCpu')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, ten diagrams (role, aria, labels inside, no overlap, >= 11 px); toggle with stub fallback, keyboard, nine models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
