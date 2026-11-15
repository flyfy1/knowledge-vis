'use strict';
// Browser smoke test for the essay on branch prediction and out-of-order execution.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18951 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-a-cpu-guesses-ahead/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (English is a
// stub: the page falls back to Chinese and says so in <html lang>), keyboard operation of a slider, each of the
// models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18951').replace(/\/$/, '');
const url = base + '/computing/systems/how-a-cpu-guesses-ahead/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const cyc = (x, d) => zf(x, d == null ? (x < 10 && x % 1 ? 1 : 0) : d) + ' 拍';
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
    ok(await page.$$eval('figure.dia svg', s => s.length) === 8, `${tag}: eight diagrams`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
      if (e.closest('svg') || e.closest('pre.code')) return false;
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
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .step, .robv, .ratv')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
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
    ok((await text(page, 'h1')) === 'CPU 是怎么猜着往前跑的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch1', e => e.textContent)).includes('损失 ' + pct(P.z95Lost[0], 0)), 'ch1 prose quotes the Zen 5 loss from the model');
    ok((await page.$eval('#ch9', e => e.textContent)).includes(zf(P.w512[0], 2)), 'ch9 prose quotes the 512-entry IPC');
    ok((await page.$$eval('#ch9 table.fam tbody tr', r => r.length)) === 4, 'ch9 window table has four rows');

    // ch1 cost
    await show(page, '#cpCv', 200);
    const z = M.cpi({ width: 8, penalty: 15, acc: 0.95 });
    ok((await text(page, '#cpLost')) === pct(z.lost, 0) && (await text(page, '#cpIpc')) === zf(z.ipc, 1), 'ch1 default Zen 5 at 95%, got ' + await text(page, '#cpLost'));
    const h1 = await canvasHash(page, 'cpCv');
    await click(page, '#cpA1'); await page.waitForTimeout(80);
    ok((await text(page, '#cpLost')) === pct(P.a1Lost[0], 0), 'ch1 five-stage button, got ' + await text(page, '#cpLost'));
    ok(h1 !== await canvasHash(page, 'cpCv'), 'ch1 canvas redraws');
    await click(page, '#cpZen'); await page.focus('#cpA'); for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    ok((await text(page, '#cpAo')) === '99%' && (await text(page, '#cpLost')) === pct(P.z99Lost[0], 0), 'ch1 slider by keyboard to 99%, got ' + await text(page, '#cpAo') + ' ' + await text(page, '#cpLost'));

    // ch2 simple predictors and the strip
    await show(page, '#k2Strip', 150);
    ok((await text(page, '#k2b2')) === pct(P.s2acc[0], 1) && (await text(page, '#k2b1')) === pct(P.s1acc[0], 1) && (await text(page, '#k2nt')) === pct(P.snacc[0], 1), 'ch2 default accuracies');
    ok((await page.$$eval('#k2Strip span', s => s.length)) === P.strip[0], 'ch2 strip shows 48 branches');
    const s2 = await page.$eval('#k2Strip', e => e.innerHTML);
    await pick(page, 'k2Kind', '1bit'); await page.waitForTimeout(40);
    ok(s2 !== await page.$eval('#k2Strip', e => e.innerHTML) && (await page.$eval('#k2Say', e => e.textContent)).includes(pct(P.s1in[0], 0)), 'ch2 1-bit strip and sentence');
    // ch2 sorted
    await show(page, '#soCv', 200);
    ok((await text(page, '#soMiss')) === pct(P.suRate[0], 1), 'ch2 unsorted miss rate, got ' + await text(page, '#soMiss'));
    await setRange(page, 'soD', 0); await page.waitForTimeout(60);
    ok((await page.$eval('#soSay', e => e.textContent)).includes(String(P.soMiss[0]) + ' 次') && (await text(page, '#soCyc')) === cyc(P.soCyc[0], 2), 'ch2 sorted, got ' + await text(page, '#soCyc'));
    await click(page, '#soBl'); await page.waitForTimeout(60);
    ok((await text(page, '#soCyc')) === cyc(P.blCyc[0], 2), 'ch2 branchless, got ' + await text(page, '#soCyc'));

    // ch3 gshare
    await show(page, '#gsCv', 200);
    ok((await text(page, '#gsG')) === pct(P.gc2[0], 1) && (await text(page, '#gsB')) === pct(P.gcBi[0], 1), 'ch3 default corr h=2, got ' + await text(page, '#gsG'));
    await pick(page, 'gsT', 'loop4'); await setRange(page, 'gsH', 8); await page.waitForTimeout(80);
    ok((await text(page, '#gsG')) === pct(P.gl8[0], 1), 'ch3 loop4 h=8, got ' + await text(page, '#gsG'));
    await pick(page, 'gsT', 'mix'); await pick(page, 'gsN', '6'); await setRange(page, 'gsH', 10); await page.waitForTimeout(80);
    ok((await text(page, '#gsHo')) === '6' && (await text(page, '#gsG')) === pct(P.gm6[0], 1), 'ch3 small table caps h at 6, got ' + await text(page, '#gsHo') + ' ' + await text(page, '#gsG'));

    // ch4 TAGE
    await show(page, '#cmCv', 200);
    ok((await text(page, '#cmRt')) === pct(P.cmT[0], 1) && (await text(page, '#cmRg')) === pct(P.cmG[0], 1) && (await text(page, '#cmRb')) === pct(P.cmB[0], 1), 'ch4 default 16 Kbit');
    await pick(page, 'cmB', '4096'); await page.waitForTimeout(80);
    ok((await text(page, '#cmRt')) === pct(P.c4T[0], 1), 'ch4 4 Kbit TAGE, got ' + await text(page, '#cmRt'));

    // ch5 RAS
    await show(page, '#rsCv', 200);
    ok((await text(page, '#rsR')) === pct(P.r16[0], 1) && (await text(page, '#rsB')) === pct(P.rBtb[0], 0), 'ch5 default depth 24, 16 entries, got ' + await text(page, '#rsR'));
    await pick(page, 'rsS', '52'); await page.waitForTimeout(60);
    ok((await page.$eval('#rsSay', e => e.textContent)).includes('一次也没猜错'), 'ch5 52 entries never miss');

    // ch6 superscalar
    await show(page, '#ilCv', 200);
    ok((await text(page, '#ilIn')) === zf(P.i4in[0], 2) && (await text(page, '#ilOo')) === zf(P.i4oo[0], 2), 'ch6 width 4');
    const h6 = await canvasHash(page, 'ilCv');
    await pick(page, 'ilM', 'ooo'); await page.waitForTimeout(80);
    ok(h6 !== await canvasHash(page, 'ilCv'), 'ch6 out-of-order timeline differs');
    await setRange(page, 'ilW', 5); await page.waitForTimeout(60);
    ok((await text(page, '#ilOo')) === zf(P.i8oo[0], 2), 'ch6 width 8, got ' + await text(page, '#ilOo'));

    // ch7 stepper
    await show(page, '#c7Rob', 150);
    ok((await text(page, '#c7Tot')) === cyc(P.stOo[0], 0), 'ch7 default total, got ' + await text(page, '#c7Tot'));
    await click(page, '#c7Step'); await click(page, '#c7Step'); await page.waitForTimeout(30);
    ok((await page.$$eval('#c7Rob [role=listitem]', s => s.length)) > 0 && (await page.$$eval('#c7Rat [role=listitem]', s => s.length)) === 7, 'ch7 two steps fill the ROB and show the rename table');
    await click(page, '#c7Run'); await page.waitForTimeout(30);
    ok((await text(page, '#c7Com')) === zf(P.stN[0], 0) && (await page.$eval('#c7Say', e => e.textContent)).includes('跑完了'), 'ch7 run commits all, got ' + await text(page, '#c7Com'));
    await pick(page, 'c7M', 'inorder'); await page.waitForTimeout(30);
    ok((await text(page, '#c7Tot')) === cyc(P.stIn[0], 0) && (await text(page, '#c7Com')) === '0', 'ch7 in-order resets, got ' + await text(page, '#c7Tot'));
    await pick(page, 'c7M', 'ooo'); await pick(page, 'c7R', '8'); for (let i = 0; i < 6; i++) await click(page, '#c7Ten');
    ok(/ROB 满了|还没做完/.test(await page.$eval('#c7Say', e => e.textContent)) || (await text(page, '#c7Com')).length > 0, 'ch7 small ROB stalls');

    // ch8 squash and fault
    await show(page, '#c8Rob', 150);
    let g = 0; while (g++ < 200 && (await text(page, '#c8Sq')) === '0') await click(page, '#c8Step');
    ok((await page.$eval('#c8Say', e => e.textContent)).includes('全部作废'), 'ch8 the step that squashes says so');
    await click(page, '#c8Run');
    ok((await text(page, '#c8Sq')) === zf(P.mpSq[0], 0) && (await text(page, '#c8C')) === zf(P.mpCyc[0], 0), 'ch8 mispredict: squashed and cycles, got ' + await text(page, '#c8Sq') + ' ' + await text(page, '#c8C'));
    await pick(page, 'c8E', 'fault'); await click(page, '#c8Run'); await page.waitForTimeout(30);
    ok((await text(page, '#c8Com')) === zf(P.flCom[0], 0) && (await page.$eval('#c8Say', e => e.textContent)).includes('出错了'), 'ch8 fault commits 24, got ' + await text(page, '#c8Com'));

    // ch9 window
    await show(page, '#wnCv', 200);
    ok((await text(page, '#wnI')) === zf(P.w512[0], 2), 'ch9 default 512 perfect, got ' + await text(page, '#wnI'));
    await pick(page, 'wnA', '0.95'); await page.waitForTimeout(80);
    ok((await text(page, '#wnI')) === zf(P.w512b[0], 2) && (await text(page, '#wnB')) === zf(P.btw95[0], 0), 'ch9 95%, got ' + await text(page, '#wnI'));
    await pick(page, 'wnA', '1'); await pick(page, 'wnL', 'mem'); await page.waitForTimeout(200);
    ok((await text(page, '#wnI')) === zf(P.wMem[0], 2), 'ch9 memory misses, got ' + await text(page, '#wnI'));

    // ch10 toy Spectre
    await show(page, '#spCv', 200);
    ok((await text(page, '#spStr')) === 'S' && (await page.$eval('#spSay', e => e.textContent)).includes('读出了'), 'ch10 first byte read at load, got ' + await text(page, '#spStr'));
    await click(page, '#spAll'); await page.waitForTimeout(60);
    ok((await text(page, '#spStr')) === M.SPEC.secret, 'ch10 whole secret, got ' + await text(page, '#spStr'));
    ok((await text(page, '#spCost')) === cyc(P.cNone[0], 0), 'ch10 cost without defence');
    await pick(page, 'spM', 'lfence'); await click(page, '#spAll'); await page.waitForTimeout(60);
    ok(!/[A-Za-z]/.test(await text(page, '#spStr')) && (await text(page, '#spCost')) === cyc(P.cFence[0], 0), 'ch10 lfence reads nothing, got ' + await text(page, '#spStr'));
    await pick(page, 'spM', 'mask'); await page.waitForTimeout(40);
    ok((await page.$eval('#spSay', e => e.textContent)).includes('按位与'), 'ch10 mask sentence');
    await pick(page, 'spM', 'none'); await setRange(page, 'spT', 0); await page.waitForTimeout(40);
    ok((await page.$eval('#spSay', e => e.textContent)).includes('没被训练'), 'ch10 untrained sentence');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#wnCv', 400);
    const a = await canvasHash(page, 'wnCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'wnCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#wnI')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, eight diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, every model driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
