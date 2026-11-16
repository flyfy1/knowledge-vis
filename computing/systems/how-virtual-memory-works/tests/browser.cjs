'use strict';
// Browser smoke test for the virtual memory essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18944 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-virtual-memory-works/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle, keyboard
// operation of a slider, each of the models responding to its controls with the numbers the models give, a sweep of
// every live sentence over every control state in both languages (doubled units, placeholders, CJK in English), and
// reduced motion. copy.en.js is translated, so the width sweep runs in zh and en and checks that no Chinese is left
// in English mode, including canvas and SVG text. (If copy.en.js were ever a stub with enStub = true, the page would
// fall back to Chinese and the English passes would be skipped.)
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18944').replace(/\/$/, '');
const url = base + '/computing/systems/how-virtual-memory-works/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const cyc = (x, d) => zf(x, d == null ? (x < 10 ? 1 : 0) : d) + ' 周期';
const pct = (x, d) => zf(x * 100, d == null ? 0 : d) + '%';
const size = b => { for (const [u, s] of [[M.GiB, 'GiB'], [M.MiB, 'MiB'], [M.KiB, 'KiB']]) if (b >= u) return zf(b / u, Math.abs(b / u - Math.round(b / u)) < 1e-9 ? 0 : 1) + ' ' + s; return zf(b, 0) + ' 字节'; };

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
    ok(await page.$$eval('figure.dia svg', s => s.length) >= 6, `${tag}: at least six diagrams`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.ft td')].filter(e => {
      if (e.closest('pre.code')) return false;
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
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .grid2d, .trail, pre')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
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
    ok((await text(page, 'h1')) === '虚拟内存是怎么工作的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch2', e => e.textContent)).includes(zf(P.flat48[0], 0) + ' GiB'), 'ch2 prose quotes the flat 48-bit table');
    ok((await page.$eval('#ch11', e => e.textContent)).includes('是 ' + zf(P.n44[0], 0) + ' 次'), 'ch11 prose quotes nm + n + m');
    ok((await page.$$eval('#ftRows tr', r => r.length)) >= 3, 'ch7 fault table has its rows');

    // ch1 fragmentation: jump to the end of the run
    await show(page, '#fgCv', 200);
    await click(page, '#fgEnd'); await page.waitForTimeout(60);
    ok((await text(page, '#fgB')) === zf(P.fFailB[0], 0) && (await text(page, '#fgP')) === zf(P.fFailP[0], 0), 'ch1 mean 6 MiB: refusals, got ' + await text(page, '#fgB') + '/' + await text(page, '#fgP'));
    ok((await text(page, '#fgF')) === zf(P.fFree[0], 0) + ' MiB' && (await text(page, '#fgL')) === zf(P.fLargest[0], 0) + ' MiB', 'ch1 free / largest hole');
    const h1 = await canvasHash(page, 'fgCv');
    await setRange(page, 'fgM', 10); await click(page, '#fgEnd'); await page.waitForTimeout(80);
    ok((await text(page, '#fgB')) === zf(M.frag(16).failB, 0), 'ch1 mean 16 MiB');
    ok(h1 !== await canvasHash(page, 'fgCv'), 'ch1 canvas redraws');

    // ch2 table size
    await show(page, '#tbBits', 150);
    ok((await text(page, '#tbF')) === '512 GiB' && (await text(page, '#tbN')) === zf(P.t48n[0], 0) + ' 张', 'ch2 default 48-bit, got ' + await text(page, '#tbN'));
    await setRange(page, 'tbV', 57); await page.waitForTimeout(40);
    ok((await text(page, '#tbL')) === '5 级', 'ch2 57 bits: five levels');
    await setRange(page, 'tbV', 47); await pick(page, 'tbP', '16384'); await page.waitForTimeout(40);
    ok((await text(page, '#tbL')) === zf(P.lv16k47[0], 0) + ' 级', 'ch2 47 bits, 16 KiB pages: three levels');

    // ch3 the walk
    await show(page, '#wkSteps', 150);
    const w0 = M.walk(M.parseVA(M.TOY.presets.heap), false, 'r');
    ok((await text(page, '#wkPA')) === '0x' + w0.pa.toString(16).toUpperCase() && (await text(page, '#wkRefs')) === '4 次', 'ch3 heap: PA and four reads, got ' + await text(page, '#wkPA'));
    ok((await page.$eval('#wkSteps', e => e.textContent)).includes('PML4[' + w0.steps[0].idx + ']'), 'ch3 steps list the PML4 index');
    await pick(page, 'wkPre', 'huge'); await page.waitForTimeout(40);
    ok((await text(page, '#wkRefs')) === '3 次' && (await text(page, '#wkPg')) === '2 MiB', 'ch3 huge page: three reads');
    await pick(page, 'wkPre', 'code'); await pick(page, 'wkX', 'w'); await page.waitForTimeout(40);
    ok((await text(page, '#wkF')) !== '没有', 'ch3 write to code faults');
    await pick(page, 'wkX', 'r'); await pick(page, 'wkPre', 'noncanon'); await page.waitForTimeout(40);
    ok((await text(page, '#wkRefs')) === '0 次', 'ch3 non-canonical: no reads');
    await pick(page, 'wkL', '5'); await page.waitForTimeout(40);
    ok((await text(page, '#wkRefs')) === '2 次', 'ch3 same address under 5-level: canonical, a hole at level 2');
    await page.fill('#wkA', 'zz'); await page.waitForTimeout(40);
    ok((await page.$eval('#wkSay', e => e.textContent)).length > 10 && (await text(page, '#wkPA')) === '—', 'ch3 bad input');
    await pick(page, 'wkL', '4'); await pick(page, 'wkPre', 'heap');

    // ch4 TLB
    await show(page, '#tlCv', 200);
    ok((await text(page, '#tlM')) === pct(P.r4[0], 1), 'ch4 default random 64 MiB, got ' + await text(page, '#tlM'));
    const h4 = await canvasHash(page, 'tlCv');
    await pick(page, 'tlP', '2097152'); await page.waitForTimeout(80);
    ok((await text(page, '#tlM')) === pct(P.r2[0], 2), 'ch4 2 MiB pages, got ' + await text(page, '#tlM'));
    ok(h4 !== await canvasHash(page, 'tlCv'), 'ch4 canvas redraws');
    await pick(page, 'tlP', '4096'); await pick(page, 'tlT', 'col'); await page.waitForTimeout(80);
    ok((await text(page, '#tlM')) === pct(P.c4[0], 1), 'ch4 column walk, got ' + await text(page, '#tlM'));
    await page.focus('#tlE'); await page.keyboard.press('End'); await page.waitForTimeout(60);
    ok((await text(page, '#tlEo')) === '4,096 项', 'ch4 entries slider by keyboard, got ' + await text(page, '#tlEo'));

    // ch5 walk cost
    await show(page, '#wcCv', 200);
    ok((await text(page, '#wcR')) === zf(P.w1prefs[0], 2) + ' 次' && (await text(page, '#wcX')) === cyc(P.w1pworst[0], 0), 'ch5 default 1 GiB with PWC, got ' + await text(page, '#wcR'));
    await click(page, '#wcC'); await page.waitForTimeout(60);
    ok((await text(page, '#wcR')) === '4.00 次' && (await text(page, '#wcX')) === cyc(P.w1worst[0], 0), 'ch5 no PWC, got ' + await text(page, '#wcX'));
    await click(page, '#wcC'); await setRange(page, 'wcW', 0); await page.waitForTimeout(60);
    ok((await page.$eval('#wcSay', e => e.textContent)).includes('覆盖范围'), 'ch5 16 MiB fits sentence');

    // ch6 huge pages
    await show(page, '#hgCv', 200);
    await setRange(page, 'hgW', 4); await page.waitForTimeout(60);
    ok((await text(page, '#hgM')) === pct(P.h2miss[0], 0) && (await text(page, '#hgC')) === cyc(P.h2worst[0], 0), 'ch6 16 GiB 2 MiB pages, got ' + await text(page, '#hgM') + ' ' + await text(page, '#hgC'));
    await pick(page, 'hgS', '1'); await page.waitForTimeout(60);
    ok((await text(page, '#hgA')).startsWith(zf(P.hs2alloc[0], 0) + ' GiB'), 'ch6 sparse 2 MiB allocates 16 GiB, got ' + await text(page, '#hgA'));

    // ch7 effective access time
    await show(page, '#efCv', 200);
    ok((await text(page, '#efS')) === zf(P.enSlow[0], 2) + ' 倍', 'ch7 default NVMe at 1e-4, got ' + await text(page, '#efS'));
    await pick(page, 'efK', 'hdd'); await page.waitForTimeout(60);
    ok((await text(page, '#efS')) === zf(P.ehSlow[0], 0) + ' 倍', 'ch7 disk at 1e-4, got ' + await text(page, '#efS'));
    await setRange(page, 'efP', -6); await page.waitForTimeout(60);
    ok((await text(page, '#efS')) === zf(M.eat(1e-6, 'hdd').slow, 2) + ' 倍', 'ch7 disk at 1e-6, got ' + await text(page, '#efS'));

    // ch8 replacement
    await show(page, '#rpCv', 200);
    ok((await text(page, '#rpFifo')) === zf(P.bf4[0], 0) && (await text(page, '#rpLru')) === zf(P.bl4[0], 0), 'ch8 Belady 4 frames');
    ok((await page.$eval('#rpSay', e => e.textContent)).includes('Belady'), 'ch8 anomaly sentence');
    ok((await page.$$eval('#rpTrail span', s => s.length)) === 12, 'ch8 trail has 12 references');
    await setRange(page, 'rpF', 3); await page.waitForTimeout(40);
    ok((await text(page, '#rpFifo')) === zf(P.bf3[0], 0) && (await text(page, '#rpOpt')) === zf(P.bo3[0], 0), 'ch8 three frames');

    // ch9 copy-on-write
    await show(page, '#cwCv', 200);
    ok((await text(page, '#cwK')) === zf(P.k1010c[0], 0) && (await text(page, '#cwF')) === zf(P.k1010f[0], 0), 'ch9 default 10 % / 10 %, got ' + await text(page, '#cwK'));
    await setRange(page, 'cwG', 0); await page.waitForTimeout(40);
    ok((await text(page, '#cwK')) === zf(P.k10c[0], 0), 'ch9 parent writes nothing');

    // ch10 context switches
    await show(page, '#cxCv', 200);
    ok((await text(page, '#cxMi')) === zf(P.ctTag[0], 1), 'ch10 default tagged, got ' + await text(page, '#cxMi'));
    await pick(page, 'cxM', 'flush'); await page.waitForTimeout(60);
    ok((await text(page, '#cxMi')) === zf(P.ctFlush[0], 0), 'ch10 flush, got ' + await text(page, '#cxMi'));
    await click(page, '#cxT'); await page.waitForTimeout(60);
    ok((await text(page, '#cxMi')) === zf(P.ckFlush[0], 0) && (await text(page, '#cxC')) === zf(M.ctxM(4, 'flush', true, 1000).cr3Per1k, 2), 'ch10 KPTI without PCID, got ' + await text(page, '#cxMi'));

    // ch11 nested walk
    await show(page, '#nsGrid', 150);
    ok((await text(page, '#nsR')) === zf(P.n44[0], 0) + ' 次' && (await page.$$eval('#nsGrid .h, #nsGrid .g', c => c.length)) === 24, 'ch11 default 4 × 4');
    await pick(page, 'nsG', '5'); await pick(page, 'nsH', '5'); await page.waitForTimeout(40);
    ok((await text(page, '#nsR')) === zf(P.n55[0], 0) + ' 次', 'ch11 5 × 5');
    await pick(page, 'nsH', '0'); await page.waitForTimeout(40);
    ok((await text(page, '#nsR')) === '5 次', 'ch11 not virtualised: five reads');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // every live sentence in every state the controls can reach, both languages: no doubled units ("4 次 次", "16 倍 倍",
  // "reads reads"), no unfilled placeholder, no CJK in English. Each section: every radio/checkbox combination, and in
  // each combination every value of every slider (the others at their defaults).
  for (const lang of langs) {
    const page = await open(browser, 1280, { lang });
    const res = await page.evaluate(() => {
      const out = { states: 0, bad: [], texts: new Set() };
      const fire = (e, ev) => e.dispatchEvent(new Event(ev, { bubbles: true }));
      for (const say of document.querySelectorAll('p.say')) {
        const sec = say.closest('section'), inputs = [...sec.querySelectorAll('input')];
        const radios = {}; inputs.filter(i => i.type === 'radio').forEach(r => { (radios[r.name] = radios[r.name] || []).push(r); });
        const checks = inputs.filter(i => i.type === 'checkbox'), ranges = inputs.filter(i => i.type === 'range');
        const def = { r: Object.fromEntries(Object.entries(radios).map(([n, rs]) => [n, rs.find(r => r.checked)])), c: checks.map(c => c.checked), g: ranges.map(r => r.value) };
        const groups = [...Object.values(radios), ...checks.map(c => [c, null])];
        let combos = [[]]; for (const g of groups) { const nx = []; for (const c of combos) for (const o of g) nx.push([...c, o]); combos = nx; }
        if (combos.length > 400) combos = combos.filter((_, i) => i % Math.ceil(combos.length / 400) === 0);
        const end = sec.querySelector('#fgEnd');
        const read = () => { if (end) end.click(); const s = say.textContent; out.states++; out.texts.add(s); return s; };
        for (const combo of combos) {
          groups.forEach((g, gi) => { const o = combo[gi]; if (g[1] === null) { const want = o !== null; if (g[0].checked !== want) { g[0].checked = want; fire(g[0], 'change'); } } else if (!o.checked) { o.checked = true; fire(o, 'change'); } });
          read();
          ranges.forEach((r, ri) => {
            const lo = +r.min, hi = +r.max, st = +r.step || 1, nvals = Math.floor((hi - lo) / st) + 1, every = Math.max(1, Math.ceil(nvals / 60));
            for (let k = 0; k < nvals; k += every) { r.value = String(lo + k * st); fire(r, 'input'); read(); }
            r.value = def.g[ri]; fire(r, 'input');
          });
        }
        Object.values(def.r).forEach(r => { if (r && !r.checked) { r.checked = true; fire(r, 'change'); } });
        checks.forEach((c, i) => { if (c.checked !== def.c[i]) { c.checked = def.c[i]; fire(c, 'change'); } });
      }
      out.texts = [...out.texts]; return out;
    });
    const dbl = lang === 'zh' ? /(次|倍|级|张|项|个|周期|字节)\s+\1|倍\s*倍/ : /\b(reads?|levels?|tables?|pages?|entries|cycles|processes|times|bytes)\s+\1\b|×\s*times|\bper 1,000 accesses per\b/i;
    const badTexts = res.texts.filter(s => dbl.test(s) || /\{\w+\}/.test(s) || s.trim().length < 10 || (lang === 'en' && CJK.test(s)));
    ok(res.states > 700, `${lang}: live-sentence sweep visited only ${res.states} states`);
    ok(!badTexts.length, `${lang}: live sentences with doubled units, placeholders or wrong script (${badTexts.length} of ${res.texts.length}): ${badTexts.slice(0, 3).join(' || ')}`);
    ok(!page.__errors().length, `${lang} sweep: errors: ` + page.__errors().join(' | '));
    console.log(`  live-sentence sweep ${lang}: ${res.states} states, ${res.texts.length} distinct sentences`);
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#fgCv', 400);
    const a = await canvasHash(page, 'fgCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'fgCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#fgB')) === zf(M.prose().fFailB[0], 0), 'reduced motion: ch1 shows the end of the run at once');
    await click(page, '#fgPlay'); await page.waitForTimeout(300);
    ok((await text(page, '#fgB')) === zf(M.prose().fFailB[0], 0), 'reduced motion: replay jumps to the end');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, nine diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, every model driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
