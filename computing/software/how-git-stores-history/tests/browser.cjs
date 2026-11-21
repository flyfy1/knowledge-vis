'use strict';
// Browser test for how-git-stores-history (adapted strictly from W1 tests/browser.cjs).
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18962 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/software/how-git-stores-history/tests/browser.cjs
// Do NOT run multiple Chromium browser tests in parallel.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18962').replace(/\/$/, '');
const url = base + '/computing/software/how-git-stores-history/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 10, LABS = 9;
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
async function says(page, sayId, key, tag) {
  const s = await text(page, '#' + sayId);
  ok(tre(key).test(s), `${tag}: #${sayId} should follow ${key}; got "${s.slice(0, 90)}"`);
}

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
    for (const fig of await page.$$('figure')) {
      await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(120);
    }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
    ok(await page.$$eval('figure.lab', s => s.length) === LABS, `${tag}: ${LABS} models`);

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

    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^(ch\d+|u|dg|meta|site|toc)\.[\w.-]+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);

    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{[a-zA-Z_]\w*\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);

    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);

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
      ok(!left.length, `${tag}: Chinese left in English: ${left.join(' | ')}`);
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

  /* Live-sentence branches & interactions */
  {
    const page = await open(browser, 1280);
    const T = 'branches';
    // ch2
    await says(page, 'c2Say', 'ch2.say.base', T);
    ok((await text(page, '#c2Oid')).startsWith('8d0e4123'), 'ch2: default hello git\\n SHA-1 starts 8d0e4123');
    await setCheck(page, 'c2Flip', true);
    await says(page, 'c2Say', 'ch2.say.flip', T);
    await pick(page, 'c2Algo', 'sha256');
    ok((await text(page, '#c2Raw')) === '18', 'ch2: raw header + payload still 18 bytes in SHA-256');
    // ch3
    await says(page, 'c3Say', 'ch3.say', T);
    ok((await text(page, '#c3New')) === '4 / 15', 'ch3: src/core/hash.js creates 4 / 15 objects');
    await pick(page, 'c3Edit', 'README.md');
    ok((await text(page, '#c3New')) === '2 / 15', 'ch3: README.md creates 2 / 15 objects');
    // ch4
    await says(page, 'c4Say', 'ch4.say', T);
    ok((await text(page, '#c4Orph')) === '0', 'ch4: 0 orphaned initially');
    await page.click('#c4Amend');
    ok((await text(page, '#c4Orph')) === '1', 'ch4: amend leaves 1 orphaned commit');
    await page.click('#c4Reset');
    ok((await text(page, '#c4Orph')) === '0', 'ch4: reset back to 0 orphaned');
    // ch5
    await says(page, 'c5Say', 'ch5.say.norm', T);
    ok((await text(page, '#c5Skip')) === '1,992', 'ch5: skips 1,992 clean entries');
    await setCheck(page, 'c5Racy', true);
    await says(page, 'c5Say', 'ch5.say.racy', T);
    // ch6
    await says(page, 'c6Say', 'ch6.say.saved', T);
    await setRange(page, 'c6Days', 40);
    await says(page, 'c6Say', 'ch6.say.dangling', T);
    await setCheck(page, 'c6GC', true);
    await says(page, 'c6Say', 'ch6.say.pruned', T);
    // ch7
    for (const c of ['clean', 'same', 'conflict', 'delmod']) {
      await pick(page, 'c7Case', c);
      await says(page, 'c7Say', 'ch7.say.' + c, T);
    }
    ok((await text(page, '#c7Conf')) === '1', 'ch7: delmod has 1 conflict');
    // ch8
    await says(page, 'c8Say', 'ch8.say', T);
    await setCheck(page, 'c8Sort', false);
    await says(page, 'c8Say', 'ch8.say', T);
    // ch9
    for (const m of ['full', 'shallow', 'blobless', 'treeless']) {
      await pick(page, 'c9Mode', m);
      await says(page, 'c9Say', 'ch9.say.' + m, T);
    }
    // ch10
    await says(page, 'c10Say', 'ch10.say', T);
    ok((await text(page, '#c10Sparse')) === '10,018', 'ch10: sparse index 10,018 entries at 2/20 active dirs');

    ok(!page.__errors().length, 'branches errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* Reduced motion */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await page.$eval('#c4Cv', e => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(120);
    const h1 = await page.evaluate(() => document.getElementById('c4Cv').toDataURL());
    await page.waitForTimeout(400);
    ok(h1 === await page.evaluate(() => document.getElementById('c4Cv').toDataURL()), 'reduced motion: canvas still');
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
