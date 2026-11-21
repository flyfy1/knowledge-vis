'use strict';
// Browser test for the essay on how React updates the DOM.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18963 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/software/how-react-updates-the-dom/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes screenshots (never into the repo). Run browser tests one at a time.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18963').replace(/\/$/, '');
const url = base + '/computing/software/how-react-updates-the-dom/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 9, LABS = 9;
const fails = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => {
    window.__ft = new Set();
    const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); };
  });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const setCheck = (page, id, on) => page.evaluate(([id, on]) => { const e = document.getElementById(id); if (e.checked !== on) e.click(); }, [id, on]);
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const tre = key => { const s = Z[key].replace(/<[^>]+>/g, ''); return new RegExp(s.split(/\{\w+\}/).map(p => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&')).join('[\\s\\S]*?')); };
async function says(page, sayId, key, tag) { const s = await text(page, '#' + sayId); ok(tre(key).test(s), `${tag}: #${sayId} should follow ${key}; got "${s.slice(0, 90)}"`); }

function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia[data-dg]')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg || getComputedStyle(svg).display === 'none') { out.push(name + ': no visible svg'); continue; }
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
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
    ok(await page.$$eval('figure.lab', s => s.length) === LABS, `${tag}: ${LABS} models`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fmt td, table.fmt th, pre.code')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1;
    }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const spill = await page.evaluate(() => [...document.querySelectorAll('.ctl label')].filter(l => {
      const r = l.getBoundingClientRect(); if (!r.width) return false;
      return [...l.children].some(c => { const q = c.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.left < r.left - 1); });
    }).slice(0, 5).map(l => (l.querySelector('input') || {}).id || l.textContent.trim().slice(0, 20)));
    ok(!spill.length, `${tag}: control parts spill out of their label: ${spill.join(', ')}`);
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
    ok(!small.length, `${tag}: targets under 48px: ${small.slice(0, 6).join(', ')}`);
    const outside = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
      if (e.closest('defs') || e.closest('.tblwrap table') || e.closest('pre.code')) return false;
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1);
    }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!outside.length, `${tag}: elements outside the viewport: ${outside.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^(ch\d+|u|dg|meta|site|toc)\.[\w.-]+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{[a-zA-Z_]\w*\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
    ok(await page.evaluate(() => window.__ft.size) > 15, `${tag}: canvases drew their labels`);
    const blank = await page.evaluate(() => [...document.querySelectorAll('figure.lab canvas')].filter(c => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let i = 3; i < d.length; i += 4 * 97) if (d[i]) return false;
      return true;
    }).map(c => c.id));
    ok(!blank.length, `${tag}: blank canvases: ${blank.join(', ')}`);
    if (lang === 'en') {
      const left = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) {
          if (!rx.test(n.textContent)) continue;
          if (n.parentElement.closest('#langToggle')) continue;
          const pz = n.parentElement.closest('.page-provenance .provenance-zh');
          if (pz && getComputedStyle(pz).display === 'none') continue;
          out.push(n.textContent.trim().slice(0, 24));
        }
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas ' + t);
        return out.slice(0, 6);
      }, CJK.source);
      ok(!left.length, `${tag}: CJK left in English: ${left.join(' | ')}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) {
      await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
      for (const fig of await page.$$('figure')) {
        const id = await fig.evaluate(e => e.id || e.dataset.dg);
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(120);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }

  /* Every live-sentence branch and readout against models.js */
  {
    const page = await open(browser, 1280);
    const T = 'branches';
    // ch2
    await says(page, 'c2Say', 'ch2.say.jsx', T);
    ok((await text(page, '#c2Dom')) === '0' && (await text(page, '#c2Fn')) === '0', 'ch2 jsx: 0 DOM, 0 fn calls');
    await pick(page, 'c2Stage', 'reconciled');
    await says(page, 'c2Say', 'ch2.say.reconciled', T);
    ok((await text(page, '#c2Fib')) === '6' && (await text(page, '#c2Dom')) === '4', 'ch2 reconciled: 6 fibers, 4 DOM');
    // ch3
    await says(page, 'c3Say', 'ch3.say.running', T);
    await page.click('#c3ResetBtn'); await says(page, 'c3Say', 'ch3.say.start', T);
    await setRange(page, 'c3Units', 11); await says(page, 'c3Say', 'ch3.say.done', T);
    ok((await text(page, '#c3Yld')) === '3' && (await text(page, '#c3Dom')) === 'B (new)', 'ch3 done: 3 yields, B (new)');
    await setCheck(page, 'c3Preempt', true); await says(page, 'c3Say', 'ch3.say.preempt', T);
    ok((await text(page, '#c3Dom')) === 'A (live)', 'ch3 preempt: keeps A (live)');
    // ch4
    await says(page, 'c4Say', 'ch4.say.clean', T);
    await pick(page, 'c4Sc', 'reverse'); await says(page, 'c4Say', 'ch4.say.moves', T);
    ok((await text(page, '#c4Moves')) === '3', 'ch4 reverse key=id: 3 moves');
    await pick(page, 'c4Sc', 'prepend'); await pick(page, 'c4Key', 'index'); await says(page, 'c4Say', 'ch4.say.mismatch', T);
    ok((await text(page, '#c4Bug')) === '2', 'ch4 prepend key=index: 2 state mismatches');
    // ch5
    await says(page, 'c5Say', 'ch5.say.normal', T);
    ok((await text(page, '#c5Next')) === '22', 'ch5 +1 then *2 = 22');
    await setCheck(page, 'c5Low', true); await says(page, 'c5Say', 'ch5.say.skipped', T);
    await setCheck(page, 'c5Skip', true); await says(page, 'c5Say', 'ch5.say.error', T);
    // ch6
    await says(page, 'c6Say', 'ch6.say', T);
    ok((await text(page, '#c6Skip')) === '10' && (await text(page, '#c6Mask')) === '0x0004', 'ch6 leaf: 10 skipped, 0x0004');
    await pick(page, 'c6Pre', 'twoLeaves'); ok((await text(page, '#c6Mask')) === '0x0006', 'ch6 twoLeaves: 0x0006');
    const c6cv = await page.$('#c6Cv');
    await c6cv.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(80);
    const b6 = await c6cv.boundingBox();
    await page.mouse.click(b6.x + b6.width / 2, b6.y + 40);
    // ch7
    await says(page, 'c7Say', 'ch7.say.layoutOk', T);
    await setRange(page, 'c7Lay', 12); await says(page, 'c7Say', 'ch7.say.layoutSlow', T);
    await pick(page, 'c7Hook', 'passive'); await says(page, 'c7Say', 'ch7.say.passiveFlash', T);
    // ch8
    await says(page, 'c8Say', 'ch8.say.batched', T);
    ok((await text(page, '#c8Com')) === '1', 'ch8 batched: 1 commit');
    await pick(page, 'c8Trig', 'flushSync'); await says(page, 'c8Say', 'ch8.say.flush', T);
    ok((await text(page, '#c8Com')) === '3', 'ch8 flushSync: 3 commits');
    // ch9
    await says(page, 'c9Say', 'ch9.say.concurrent', T);
    ok((await text(page, '#c9Lat')) === '5.5 毫秒', 'ch9 transition: 5.5 毫秒');
    await setCheck(page, 'c9Trans', false); await says(page, 'c9Say', 'ch9.say.blocked', T);
    ok((await text(page, '#c9Lat')) === '17.5 毫秒', 'ch9 blocked: 17.5 毫秒');
    // ch10
    await says(page, 'c10Say', 'ch10.say.hit', T);
    ok((await text(page, '#c10Hits')) === '6' && (await text(page, '#c10Calc')) === '1', 'ch10 compiled hit: 6 hits, 1 calc');
    await pick(page, 'c10What', 'items'); await says(page, 'c10Say', 'ch10.say.recompute', T);
    await setCheck(page, 'c10Comp', false); await says(page, 'c10Say', 'ch10.say.uncompiled', T);

    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* Keyboard */
  {
    const page = await open(browser, 390);
    await page.$eval('#c9Nodes', e => e.scrollIntoView({ block: 'center' }));
    const before = await text(page, '#c9Say');
    await page.focus('#c9Nodes'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('#c9Nodes', e => e.value)) === '16', 'keyboard: ArrowRight steps #c9Nodes');
    await setCheck(page, 'c9Trans', false);
    ok((await text(page, '#c9Say')) !== before, 'keyboard/toggle updates live sentence');
    await page.close();
  }

  /* Reduced motion */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: scrollBehavior auto');
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(80); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    await page.$eval('#c9Cv', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(120);
    const h1 = await page.evaluate(() => document.getElementById('c9Cv').toDataURL());
    await page.waitForTimeout(400);
    ok(h1 === await page.evaluate(() => document.getElementById('c9Cv').toDataURL()), 'reduced motion: canvases stay still');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) {
    console.error(fails.map(f => 'FAIL ' + f).join('\n'));
    console.error(`${checks - fails.length}/${checks} checks passed`);
    process.exit(1);
  }
  console.log(`${checks}/${checks} checks passed`);
})();
