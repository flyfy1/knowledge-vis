'use strict';
// Browser test for W8 (how-chromium-renders-a-web-page), adapted from W1.
// Coordinator runs serially after builder agents complete:
//   ESSAY_BASE_URL=http://127.0.0.1:18968 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//     node computing/software/how-chromium-renders-a-web-page/tests/browser.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18968').replace(/\/$/, '');
const url = base + '/computing/software/how-chromium-renders-a-web-page/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 8;
const LABS = 9;
const fails = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference'
  });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => {
    window.__ft = new Set();
    const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) {
      window.__ft.add(String(t));
      return f.call(this, t, ...a);
    };
  });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}

const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => {
  const e = document.getElementById(id);
  e.value = v;
  e.dispatchEvent(new Event('input', { bubbles: true }));
}, [id, String(v)]);
const setCheck = (page, id, on) => page.evaluate(([id, on]) => {
  const e = document.getElementById(id);
  if (e.checked !== on) e.click();
}, [id, on]);
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());

const tre = key => {
  const s = Z[key].replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return new RegExp(s.split(/\{\w+\}/).map(p => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&')).join('[\\s\\S]*?'));
};
async function says(page, sayId, key, tag) {
  const s = await text(page, '#' + sayId);
  ok(tre(key).test(s), `${tag}: #${sayId} should match ${key}; got "${s.slice(0, 90)}"`);
}

function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia[data-dg]')) {
    const name = fig.dataset.dg;
    const svg = fig.querySelector('svg');
    if (!svg || getComputedStyle(svg).display === 'none') { out.push(name + ': no visible svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(name + ': role');
    const al = svg.getAttribute('aria-label') || '';
    if (al.length < 8 || /^dg\./.test(al)) out.push(name + ': aria-label "' + al + '"');
    const cap = fig.querySelector('figcaption');
    if (!cap || cap.textContent.trim().length < 8) out.push(name + ': caption');
    const vb = svg.viewBox.baseVal;
    const k = svg.getBoundingClientRect().width / vb.width;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      const s = t.textContent.trim();
      if (!s || /^dg\./.test(s) || /\{\w+\}/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
      const b = t.getBBox();
      const fs = parseFloat(t.getAttribute('font-size')) * k;
      if (fs < 11) out.push(`${name}: "${s.slice(0, 12)}" renders at ${fs.toFixed(1)}px`);
      if (b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5) {
        out.push(`${name}: "${s.slice(0, 14)}" outside the drawing`);
      }
      boxes.push([s, b]);
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [s1, a] = boxes[i], [s2, b] = boxes[j], pad = 1;
        const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        if (ix > pad && iy > pad) out.push(`${name}: "${s1.slice(0, 12)}" overlaps "${s2.slice(0, 12)}"`);
      }
    }
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of ['zh', 'en']) {
    for (const width of [1280, 390, 320]) {
      const page = await open(browser, width, { lang });
      const tag = `${lang} ${width}`;
      ok((await page.evaluate(() => document.documentElement.lang)) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
      for (const fig of await page.$$('figure')) {
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(100);
      }
      const dg = await page.evaluate(diagramCheck);
      ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 6).join(' | ')}`);
      ok((await page.$$eval('figure.dia[data-dg]', s => s.length)) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
      ok((await page.$$eval('figure.lab', s => s.length)) === LABS, `${tag}: ${LABS} models`);

      const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, pre.code')].filter(e => {
        if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const cs = getComputedStyle(e);
        if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
        return e.scrollWidth > e.clientWidth + 1;
      }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
      ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);

      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(over <= 0, `${tag}: horizontal overflow ${over}px`);

      const small = await page.evaluate(() => {
        const out = [];
        const boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
        for (const e of document.querySelectorAll('button, input, .toc a, a.back')) {
          const r = boxOf(e);
          if (!r.width && !r.height) continue;
          if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
        }
        return out;
      });
      ok(!small.length, `${tag}: targets under 48px: ${small.slice(0, 6).join(', ')}`);

      const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^(ch\d+|u|dg|meta|site|toc)\.[\w.-]+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
      ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);

      const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, .say, figure')].filter(e => /\{[a-zA-Z_]\w*\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
      ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);

      const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
      ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);

      const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
      ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);

      const blank = await page.evaluate(() => [...document.querySelectorAll('figure.lab canvas')].filter(c => {
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < d.length; i += 4 * 97) if (d[i]) return false;
        return true;
      }).map(c => c.id));
      ok(!blank.length, `${tag}: blank canvases: ${blank.join(', ')}`);

      if (lang === 'en') {
        const left = await page.evaluate(re => {
          const rx = new RegExp(re);
          const out = [];
          const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n; (n = w.nextNode());) {
            if (!rx.test(n.textContent)) continue;
            if (n.parentElement.closest('#langToggle')) continue;
            out.push(n.textContent.trim().slice(0, 24));
          }
          for (const t of window.__ft) if (rx.test(t)) out.push('canvas ' + t);
          return out.slice(0, 6);
        }, CJK.source);
        ok(!left.length, `${tag}: Chinese left in English: ${left.join(' | ')}`);
      }
      ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);

      if (SHOT) {
        await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
      }
      await page.close();
    }
  }

  /* Drive every .say branch and readout against models.js */
  {
    const page = await open(browser, 1280, { lang: 'zh' });
    const T = 'branches';
    // ch2
    await says(page, 'c2Say', 'ch2.say.blockingJsWait', T);
    await setRange(page, 'c2Css', 90);
    await says(page, 'c2Say', 'ch2.say.blockingCssWait', T);
    await pick(page, 'c2Mode', 'defer');
    await says(page, 'c2Say', 'ch2.say.deferReady', T);
    await pick(page, 'c2Mode', 'async');
    await setRange(page, 'c2Js', 20);
    await says(page, 'c2Say', 'ch2.say.asyncEarly', T);
    await setRange(page, 'c2Js', 100);
    await says(page, 'c2Say', 'ch2.say.asyncAfter', T);

    // ch3
    await says(page, 'c3Say', 'ch3.say.smartDeep', T);
    await pick(page, 'c3Sel', 'simpleClass');
    await says(page, 'c3Say', 'ch3.say.smartSimple', T);
    await pick(page, 'c3Sel', 'universalTail');
    await says(page, 'c3Say', 'ch3.say.smartUniversal', T);
    await setCheck(page, 'c3Smart', false);
    await says(page, 'c3Say', 'ch3.say.naiveFull', T);

    // ch4
    await says(page, 'c4Say', 'ch4.say.thrashOver60', T);
    await setRange(page, 'c4Items', 30);
    await says(page, 'c4Say', 'ch4.say.thrashOver120', T);
    await setRange(page, 'c4Items', 10);
    await setRange(page, 'c4Tree', 100);
    await says(page, 'c4Say', 'ch4.say.thrashFits', T);
    await pick(page, 'c4Pat', 'batched');
    await says(page, 'c4Say', 'ch4.say.batchedClean', T);
    await pick(page, 'c4Pat', 'contained');
    await says(page, 'c4Say', 'ch4.say.containedFast', T);

    // ch5
    await says(page, 'c5Say', 'ch5.say.transformFast', T);
    await pick(page, 'c5Prop', 'scroll');
    await says(page, 'c5Say', 'ch5.say.scrollFast', T);
    await pick(page, 'c5Prop', 'opacity');
    await says(page, 'c5Say', 'ch5.say.effectFast', T);
    await pick(page, 'c5Prop', 'left');
    await says(page, 'c5Say', 'ch5.say.leftSlow', T);
    await setRange(page, 'c5Tx', -120);
    await setRange(page, 'c5Sy', 200);
    await says(page, 'c5Say', 'ch5.say.clippedOut', T);

    // ch6
    await says(page, 'c6Say', 'ch6.say.exploded', T);
    await pick(page, 'c6Badge', 'promotedAbove');
    await says(page, 'c6Say', 'ch6.say.aboveSafe', T);
    await pick(page, 'c6Badge', 'promotedBelow');
    await setCheck(page, 'c6Overlap', false);
    await says(page, 'c6Say', 'ch6.say.noOverlapSafe', T);
    await pick(page, 'c6Badge', 'static');
    await says(page, 'c6Say', 'ch6.say.allMerged', T);

    // ch7
    await says(page, 'c7Say', 'ch7.say.checkerboard', T);
    await setRange(page, 'c7Skew', 2);
    await says(page, 'c7Say', 'ch7.say.skewportClean', T);
    await setRange(page, 'c7Skew', 0);
    await setCheck(page, 'c7Oop', true);
    await says(page, 'c7Say', 'ch7.say.ooprClean', T);
    await setRange(page, 'c7Spd', 0);
    await says(page, 'c7Say', 'ch7.say.idleClean', T);

    // ch8
    await says(page, 'c8Say', 'ch8.say.mainBehindImplLocked', T);
    await pick(page, 'c8Hz', '60');
    await setRange(page, 'c8Main', 8);
    await setRange(page, 'c8Ras', 2);
    await says(page, 'c8Say', 'ch8.say.allLocked', T);

    // ch9
    await says(page, 'c9Say', 'ch9.say.compositorImmune', T);
    await pick(page, 'c9Prop', 'boxShadow');
    await says(page, 'c9Say', 'ch9.say.paintStalled', T);
    await pick(page, 'c9Prop', 'left');
    await says(page, 'c9Say', 'ch9.say.layoutStalled', T);
    await pick(page, 'c9Hz', '60');
    await setRange(page, 'c9Js', 0);
    await setRange(page, 'c9Dom', 50);
    await says(page, 'c9Say', 'ch9.say.cleanMain', T);

    // ch10
    await says(page, 'c10Say', 'ch10.say.graphitePrerender', T);
    await setCheck(page, 'c10Pre', false);
    await says(page, 'c10Say', 'ch10.say.graphiteCold', T);
    await pick(page, 'c10Be', 'ganesh');
    await says(page, 'c10Say', 'ch10.say.ganeshCold', T);
    await setCheck(page, 'c10Pre', true);
    await says(page, 'c10Say', 'ch10.say.ganeshPrerender', T);

    ok(!page.__errors().length, 'branches errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* Reduced motion */
  {
    const page = await open(browser, 390, { reduce: true });
    ok((await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)) === 'auto', 'reduced motion: no smooth scroll');
    await page.$eval('#c9Cv', e => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(120);
    const h1 = await page.evaluate(() => document.getElementById('c9Cv').toDataURL());
    await page.waitForTimeout(400);
    ok(h1 === await page.evaluate(() => document.getElementById('c9Cv').toDataURL()), 'reduced motion: canvases stay still');
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
