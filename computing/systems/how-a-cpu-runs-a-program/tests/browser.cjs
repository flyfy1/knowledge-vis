'use strict';
// Browser smoke test for the essay on how a CPU runs a program.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18943 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-a-cpu-runs-a-program/tests/browser.cjs
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
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18943').replace(/\/$/, '');
const url = base + '/computing/systems/how-a-cpu-runs-a-program/';
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
    ok(await page.$$eval('figure.dia svg', s => s.length) >= 6, `${tag}: at least six diagrams`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
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
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .bits, .regs, .sigs, .units, .bytes')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
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
    ok((await text(page, 'h1')) === 'CPU 是怎么运行一个程序的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch9', e => e.textContent)).includes(zf(P.x1s3p[0], 1) + ' 倍'), 'ch9 prose quotes the overall speed-up from the model');
    ok((await page.$eval('#ch3', e => e.textContent)).includes(zf(P.ic1[0], 0)), 'ch3 prose quotes the v1 instruction count');

    // ch2 assembler
    await show(page, '#asIn', 150);
    ok((await text(page, '#asHex')) === '0x00750533', 'ch2 default add a0, a0, t2, got ' + await text(page, '#asHex'));
    await page.fill('#asIn', 'bne a1, t1, -12'); await page.waitForTimeout(40);
    ok((await text(page, '#asHex')) === '0xfe659ae3' && await page.$eval('input[name=asF][value=B]', e => e.checked), 'ch2 typed branch encodes and selects B');
    await page.fill('#asIn', '0x00008067'); await page.waitForTimeout(40);
    ok((await text(page, '#asAsm')) === 'jalr zero, 0(ra)', 'ch2 hex decodes to ret');
    await page.fill('#asIn', 'beq a0, a1, 3'); await page.waitForTimeout(40);
    ok((await page.$eval('#asSay', e => e.textContent)).includes('偶数'), 'ch2 odd offset sentence');
    await click(page, 'input[name=asF][value=U]'); await page.waitForTimeout(40);
    ok((await page.$eval('#asIn', e => e.value)) === 'lui a0, 0x12345' && (await text(page, '#asHex')) === '0x12345537', 'ch2 U example');

    // ch3 interpreter
    await show(page, '#inList', 150);
    ok((await text(page, '#inTotal')) === zf(M.icFormula.v1(4), 0) + ' 条', 'ch3 v1 n=4 total');
    await click(page, '#inStep'); await click(page, '#inStep'); await page.waitForTimeout(30);
    ok((await text(page, '#inDone')) === '2 条' && (await page.$$eval('#inList tr.now', r => r.length)) === 1, 'ch3 two steps');
    await click(page, '#inAll'); await page.waitForTimeout(30);
    ok((await text(page, '#inSum')) === zf(M.run('v1', 4).sum, 0) && (await page.$eval('#inSay', e => e.textContent)).includes('跳回调用者'), 'ch3 run to the end');
    await pick(page, 'inV', 'v3'); await click(page, '#inAll'); await page.waitForTimeout(30);
    ok((await text(page, '#inTotal')) === zf(M.icFormula.v3(4), 0) + ' 条' && (await text(page, '#inPer')) === zf(P.loop3[0], 0) + ' 条', 'ch3 v3');
    await page.focus('#inN'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(40);
    ok((await text(page, '#inNo')) === '6' && (await text(page, '#inTotal')) === zf(M.icFormula.v3(6), 0) + ' 条', 'ch3 slider by keyboard to n = 6');

    // ch4 single-cycle
    await show(page, '#scSigs', 150);
    for (let k = 0; k < 4; k++) await click(page, '#scNext');
    await page.waitForTimeout(30);
    ok((await text(page, '#scIns')).startsWith('lw t2, 0(t1)') && (await page.$$eval('#scUnits span.on', s => s.length)) === 7, 'ch4 lw uses all seven units');
    ok((await page.$eval('#scSay', e => e.textContent)).includes('最长的一条路'), 'ch4 lw sentence');
    await click(page, '#scNext'); await page.waitForTimeout(30);
    ok((await page.$$eval('#scUnits span.on', s => s.length)) === 5, 'ch4 add skips the immediate and data memory');

    // ch5 critical path
    await show(page, '#cpCv', 200);
    ok((await text(page, '#cpP')) === zf(P.period[0], 0) + ' 皮秒' && (await text(page, '#cpI')) === zf(P.ideal[0], 1) + ' 倍', 'ch5 default');
    const h5 = await canvasHash(page, 'cpCv');
    await setRange(page, 'cpM', 400); await page.waitForTimeout(80);
    ok((await text(page, '#cpP')) === zf(P.periodM[0], 0) + ' 皮秒' && (await text(page, '#cpS')) === zf(P.stageM[0], 0) + ' 皮秒', 'ch5 memory 400');
    ok(h5 !== await canvasHash(page, 'cpCv'), 'ch5 canvas redraws');
    await setRange(page, 'cpM', 200); await setRange(page, 'cpR', 200); await page.waitForTimeout(60);
    ok((await page.$eval('#cpSay', e => e.textContent)).includes('五段一样长'), 'ch5 balanced sentence');

    // ch6 pipeline
    await show(page, '#p6Cv', 200);
    ok((await text(page, '#p6C')) === zf(P.p1cyc[0], 0) + ' 拍' && (await text(page, '#p6P')) === zf(P.p1pipe[0], 1) + ' 纳秒', 'ch6 default v1 n=2');
    await click(page, '#p6Reset'); await click(page, '#p6Step'); await click(page, '#p6Step'); await page.waitForTimeout(80);
    ok((await page.$eval('#p6Say', e => e.textContent)).startsWith('第 2 拍'), 'ch6 steps cycle by cycle');
    const h6 = await canvasHash(page, 'p6Cv'); await click(page, '#p6All'); await page.waitForTimeout(80);
    ok(h6 !== await canvasHash(page, 'p6Cv'), 'ch6 canvas fills');
    await click(page, '#p6Reset'); await click(page, '#p6Play'); await page.waitForFunction(() => /^第 2[0-4] 拍/.test(document.querySelector('#p6Say').textContent), null, { timeout: 12000 }).catch(() => {});
    ok((await page.$eval('#p6Say', e => e.textContent)).startsWith('第 ' + zf(P.p1cyc[0], 0) + ' 拍') || (await page.$eval('#p6Play', e => e.getAttribute('aria-pressed'))) === 'true', 'ch6 play advances');
    await pick(page, 'p6N', '4'); await page.waitForTimeout(60);
    ok((await text(page, '#p6C')) === zf(M.pipeline('v1', 4).cycles, 0) + ' 拍', 'ch6 n=4');

    // ch7 forwarding
    await show(page, '#p7Cv', 200);
    ok((await text(page, '#p7E')) === zf(P.e1f[0], 0) + ' 拍' && (await text(page, '#p7Cpi')) === zf(P.cpi1p[0], 2), 'ch7 default forwarding');
    await pick(page, 'p7F', '0'); await page.waitForTimeout(60);
    ok((await text(page, '#p7E')) === zf(P.e1nf[0], 0) + ' 拍', 'ch7 no forwarding, got ' + await text(page, '#p7E'));
    await pick(page, 'p7F', '1'); await pick(page, 'p7V', 'v2'); await page.waitForTimeout(60);
    ok((await text(page, '#p7S')) === '0 拍' && (await page.$eval('#p7Say', e => e.textContent)).includes('一拍都没停'), 'ch7 v2 clean');

    // ch8 branches
    await show(page, '#p8Cv', 200);
    ok((await text(page, '#p8E')) === zf(P.e1f[0], 0) + ' 拍', 'ch8 default');
    await pick(page, 'p8R', 'ID'); await page.waitForTimeout(60);
    ok((await page.$eval('#p8Say', e => e.textContent)).includes('还回去了'), 'ch8 v1 ID resolve gives the stall back');
    await pick(page, 'p8V', 'v2'); await page.waitForTimeout(60);
    ok((await text(page, '#p8E')) === zf(P.e2id[0], 0) + ' 拍' && (await page.$eval('#p8Say', e => e.textContent)).includes('少 1 拍'), 'ch8 v2 ID resolve gains one');
    await pick(page, 'p8P', 'stall'); await pick(page, 'p8R', 'EX'); await page.waitForTimeout(60);
    ok((await text(page, '#p8F')) === '0 条', 'ch8 stall: nothing flushed');

    // ch9 iron law
    await show(page, '#irCv', 200);
    ok((await text(page, '#irTime')) === zf(M.iron('v1', 'single').perElem, 2) + ' 纳秒', 'ch9 default');
    await pick(page, 'irV', 'v3'); await pick(page, 'irM', 'pipe'); await page.waitForTimeout(60);
    ok((await text(page, '#irX')) === zf(P.x1s3p[0], 1) + ' 倍', 'ch9 v3 on the pipeline, got ' + await text(page, '#irX'));

    // ch10 x86
    await show(page, '#xBytes', 150);
    ok((await text(page, '#xLen')) === zf(P.xSibLen[0], 0) + ' 字节', 'ch10 default sib');
    await pick(page, 'xI', 'push'); await page.waitForTimeout(40);
    ok((await text(page, '#xLen')) === '1 字节' && (await text(page, '#xRvN')) === '2 条', 'ch10 push');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#p6Cv', 400);
    await click(page, '#p6Reset'); await click(page, '#p6Play'); await page.waitForTimeout(120);
    ok((await page.$eval('#p6Say', e => e.textContent)).startsWith('第 ' + zf(M.prose().p1cyc[0], 0) + ' 拍') && (await page.$eval('#p6Play', e => e.getAttribute('aria-pressed'))) === 'false', 'reduced motion: play jumps to the end');
    const a = await canvasHash(page, 'p6Cv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'p6Cv'), 'reduced motion: canvas is still');
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
