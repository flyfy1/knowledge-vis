'use strict';
// Browser test for how-postgresql-runs-a-query.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18961 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/software/how-postgresql-runs-a-query/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... captures full-page and per-figure screenshots.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18961').replace(/\/$/, '');
const url = base + '/computing/software/how-postgresql-runs-a-query/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 9, LABS = 8;
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
  const s = Z[key].replace(/<[^>]+>/g, '');
  return new RegExp(s.split(/\{\w+\}/).map(p => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&')).join('[\\s\\S]*?'));
};
async function says(page, sayId, key, tag) {
  const s = await text(page, '#' + sayId);
  ok(tre(key).test(s), `${tag}: #${sayId} should match ${key}; got "${s.slice(0, 90)}"`);
}

function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia[data-dg]')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg || getComputedStyle(svg).display === 'none') { out.push(name + ': no visible svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(name + ': role');
    const al = svg.getAttribute('aria-label') || '';
    if (al.length < 8 || /^dg\./.test(al)) out.push(name + ': aria-label "' + al + '"');
    const cap = fig.querySelector('figcaption');
    if (!cap || cap.textContent.trim().length < 8) out.push(name + ': caption');
    const vb = svg.viewBox.baseVal, k = svg.getBoundingClientRect().width / vb.width;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      const s = t.textContent.trim();
      if (!s || /^dg\./.test(s) || /\{\w+\}/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
      const b = t.getBBox(), fs = parseFloat(t.getAttribute('font-size')) * k;
      if (fs < 11) out.push(`${name}: "${s.slice(0, 12)}" renders at ${fs.toFixed(1)}px`);
      if (b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5) {
        out.push(`${name}: "${s.slice(0, 14)}" outside viewBox`);
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
      ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
      for (const fig of await page.$$('figure')) {
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(120);
      }
      const dg = await page.evaluate(diagramCheck);
      ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
      ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
      ok(await page.$$eval('figure.lab', s => s.length) === LABS, `${tag}: ${LABS} models`);

      const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fmt td, table.fmt th, pre.code')].filter(e => {
        if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const cs = getComputedStyle(e);
        if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
        return e.scrollWidth > e.clientWidth + 1;
      }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
      ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);

      const spill = await page.evaluate(() => [...document.querySelectorAll('.ctl label')].filter(l => {
        const r = l.getBoundingClientRect();
        if (!r.width) return false;
        return [...l.children].some(c => {
          const q = c.getBoundingClientRect();
          return q.width && (q.right > r.right + 1 || q.left < r.left - 1);
        });
      }).slice(0, 5).map(l => (l.querySelector('input') || {}).id || l.textContent.trim().slice(0, 20)));
      ok(!spill.length, `${tag}: control parts spill out of label: ${spill.join(', ')}`);

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

      const outside = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
        if (e.closest('defs') || e.closest('.tblwrap table') || e.closest('pre.code')) return false;
        const r = e.getBoundingClientRect();
        return r.width && (r.right > innerWidth + 1 || r.left < -1);
      }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
      ok(!outside.length, `${tag}: elements outside viewport: ${outside.join(', ')}`);

      const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^(ch\d+|u|dg|meta|site|toc)\.[\w.-]+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
      ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);

      const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{[a-zA-Z_]\w*\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
      ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);

      const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
      ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);

      const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
      ok(!emptySay.length, `${tag}: empty live sentences: ${emptySay.join(', ')}`);

      const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
      ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
      ok(await page.evaluate(() => window.__ft.size) > 12, `${tag}: canvases drew labels`);

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
  }

  /* ── All live-sentence branches & control state checks ── */
  {
    const page = await open(browser, 1280);
    const T = 'branches';

    // ch2
    await says(page, 'c2Say', 'ch2.say.bitmap', T);
    ok((await text(page, '#c2Win')) === Z['ch2.win.bitmap'], 'ch2 default winner Bitmap Heap Scan');
    await setRange(page, 'c2Sel', 0.1);
    await says(page, 'c2Say', 'ch2.say.index', T);
    await setRange(page, 'c2Sel', 20);
    await says(page, 'c2Say', 'ch2.say.seq', T);
    await setCheck(page, 'c2Vis', true);
    await says(page, 'c2Say', 'ch2.say.indexonly', T);

    // ch3
    await says(page, 'c3Say', 'ch3.say.hot', T);
    ok((await text(page, '#c3Hot')) === '2' && (await text(page, '#c3IdxW')) === '3', 'ch3 default 2 HOT, 3 idx writes');
    await setCheck(page, 'c3Idx', true);
    await says(page, 'c3Say', 'ch3.say.indexed', T);
    ok((await text(page, '#c3IdxW')) === '5', 'ch3 indexed col changed -> 5 idx writes');
    await setCheck(page, 'c3Idx', false);
    await setRange(page, 'c3Pay', 512);
    await setRange(page, 'c3Ff', 50);
    for (let i = 0; i < 10; i++) await page.click('#c3Ins');
    await page.click('#c3Upd');
    await says(page, 'c3Say', 'ch3.say.full', T);
    await page.click('#c3Rst');
    await setRange(page, 'c3Pay', 64);
    await setRange(page, 'c3Ff', 80);
    await says(page, 'c3Say', 'ch3.say.hot', T);

    // ch4
    await says(page, 'c4Say', 'ch4.say.rc', T);
    ok((await text(page, '#c4Val')) === '400', 'ch4 RC step 2 sees 400');
    await pick(page, 'c4Iso', 'rr');
    await says(page, 'c4Say', 'ch4.say.rr', T);
    ok((await text(page, '#c4Val')) === '500', 'ch4 RR step 2 stays 500');

    // ch5
    await says(page, 'c5Say', 'ch5.say.antiwrap', T);
    await setRange(page, 'c5Ep', 0);
    await says(page, 'c5Say', 'ch5.say.healthy', T);
    await setRange(page, 'c5Ep', 2145);
    await says(page, 'c5Say', 'ch5.say.stoplimit', T);
    await setRange(page, 'c5Ep', 2200);
    await says(page, 'c5Say', 'ch5.say.wrapped', T);
    await pick(page, 'c5Vac', 'normal');
    await says(page, 'c5Say', 'ch5.say.healthy', T);

    // ch6
    await says(page, 'c6Say', 'ch6.say.unprot', T);
    ok((await text(page, '#c6Post')) === '0/4', 'ch6 unprotected post-scan 0/4');
    await pick(page, 'c6Wl', 'seq_ring');
    await says(page, 'c6Say', 'ch6.say.ring', T);
    ok((await text(page, '#c6Post')) === '4/4', 'ch6 ring post-scan 4/4');
    await pick(page, 'c6Wl', 'oltp');
    await says(page, 'c6Say', 'ch6.say.oltp', T);

    // ch7
    await says(page, 'c7Say', 'ch7.say.rand', T);
    ok((await text(page, '#c7Leaves')) === '8', 'ch7 random 24 keys -> 8 leaves');
    await pick(page, 'c7Ord', 'seq');
    await says(page, 'c7Say', 'ch7.say.seq', T);
    ok((await text(page, '#c7Leaves')) === '6', 'ch7 seq 24 keys -> 6 leaves');
    await setCheck(page, 'c7Split', true);
    await says(page, 'c7Say', 'ch7.say.hop', T);
    ok((await text(page, '#c7Hops')) !== '0', 'ch7 concurrent split hop > 0');

    // ch8
    await says(page, 'c8Say', 'ch8.say.spill', T);
    ok((await text(page, '#c8Bat')) === '2', 'ch8 4 MiB spills into 2 batches');
    await setRange(page, 'c8Wm', 16);
    await says(page, 'c8Say', 'ch8.say.inmem', T);
    ok((await text(page, '#c8Bat')) === '1', 'ch8 16 MiB fits in 1 batch');
    await setRange(page, 'c8Out', 1000);
    await setCheck(page, 'c8Idx', true);
    await says(page, 'c8Say', 'ch8.say.nestwin', T);

    // ch9
    await says(page, 'c9Say', 'ch9.say.safe', T);
    ok((await text(page, '#c9Torn')) === Z['ch9.torn.ok'], 'ch9 fpw on -> safe');
    await setCheck(page, 'c9Fpw', false);
    await says(page, 'c9Say', 'ch9.say.unsafe', T);
    ok((await text(page, '#c9Torn')) === Z['ch9.torn.bad'], 'ch9 fpw off -> corrupt');

    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* ── Keyboard control test ── */
  {
    const page = await open(browser, 390);
    await page.$eval('#c2Sel', e => e.scrollIntoView({ block: 'center' }));
    const before = await text(page, '#c2Say');
    await page.focus('#c2Sel');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    ok((await page.$eval('#c2Sel', e => e.value)) === '3.2' && (await text(page, '#c2Say')) !== before, 'keyboard: arrow key moves selectivity and updates live sentence');
    await page.focus('input[name=c4Iso][value=rc]');
    await page.keyboard.press('ArrowRight');
    ok((await page.$eval('input[name=c4Iso]:checked', e => e.value)) === 'rr', 'keyboard: arrow key moves between isolation radios');
    await page.close();
  }

  /* ── Reduced motion ── */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    for (const fig of await page.$$('figure')) {
      await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(80);
    }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    await page.$eval('#c9Cv', e => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(150);
    const h1 = await page.evaluate(() => document.getElementById('c9Cv').toDataURL());
    await page.waitForTimeout(500);
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
