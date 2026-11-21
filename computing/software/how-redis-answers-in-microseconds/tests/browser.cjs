'use strict';
// Browser test for "How Redis Answers in Microseconds".
// Adapted from computing/software/how-threejs-draws-a-scene/tests/browser.cjs.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18871 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/software/how-redis-answers-in-microseconds/tests/browser.cjs
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18871').replace(/\/$/, '');
const url = base + '/computing/software/how-redis-answers-in-microseconds/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 9, LABS = 11;
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
      if (!s || /^dg\./.test(s) || /\{[a-zA-Z]\w*\}/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
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
  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;

  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
    ok(await page.$$eval('figure.lab', s => s.length) === LABS, `${tag}: ${LABS} models`);
    const spill = await page.evaluate(() => [...document.querySelectorAll('.ctl label')].filter(l => {
      const r = l.getBoundingClientRect(); if (!r.width) return false;
      return [...l.children].some(c => { const q = c.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.left < r.left - 1); });
    }).slice(0, 5).map(l => (l.querySelector('input') || {}).id || l.textContent.trim().slice(0, 20)));
    ok(!spill.length, `${tag}: control parts spill: ${spill.join(', ')}`);
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
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, .say, figure')].filter(e => /\{[a-zA-Z_]\w*\}/.test(e.textContent) && !e.closest('code')).map(e => e.id || e.tagName).slice(0, 5));
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
        const rx = new RegExp(re), out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) {
          if (!rx.test(n.textContent) || n.parentElement.closest('#langToggle')) continue;
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
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }

  /* every live-sentence branch driven via controls */
  {
    const page = await open(browser, 1280);
    const T = 'branches';
    // ch1
    await says(page, 'c1Say', 'ch1.say.fast', T);
    await setCheck(page, 'c1Slow', true); await says(page, 'c1Say', 'ch1.say.stall', T);
    await setCheck(page, 'c1Slow', false);
    // ch2
    await says(page, 'c2Say', 'ch2.say.seq', T);
    await pick(page, 'c2Mode', 'pipe'); await says(page, 'c2Say', 'ch2.say.pipe', T);
    // ch3
    await says(page, 'c3Say', 'ch3.say.embstr', T);
    await setRange(page, 'c3Len', 45); await says(page, 'c3Say', 'ch3.say.raw', T);
    ok((await text(page, '#c3Enc')) === 'raw', 'ch3: 45B switches to raw');
    await setCheck(page, 'c3Int', true); await says(page, 'c3Say', 'ch3.say.int', T);
    // ch4
    await says(page, 'c4Say', 'ch4.say.prog', T);
    await setRange(page, 'c4Step', 0); await says(page, 'c4Say', 'ch4.say.idle', T);
    await setRange(page, 'c4Step', 8); await says(page, 'c4Say', 'ch4.say.done', T);
    await pick(page, 'c4Mode', 'stw'); await says(page, 'c4Say', 'ch4.say.stw', T);
    // ch5
    await says(page, 'c5Say', 'ch5.say', T);
    ok((await text(page, '#c5Hops')) === '4' && (await text(page, '#c5Span')) === '9', 'ch5: default seed 3 rank 9 = 4 hops');
    // ch6 (default 4T / 512 B / no TLS is core-limited; enabling TLS + large payload swings to io)
    await says(page, 'c6Say', 'ch6.say.core', T);
    await setCheck(page, 'c6Tls', true); await setRange(page, 'c6Bytes', 2048); await setRange(page, 'c6Thr', 2);
    await says(page, 'c6Say', 'ch6.say.io', T);
    await setCheck(page, 'c6Tls', false);
    await setRange(page, 'c6Thr', 1); await says(page, 'c6Say', 'ch6.say.single', T);
    // ch7
    await says(page, 'c7Say', 'ch7.say.uniform', T);
    await setCheck(page, 'c7Skew', true); await says(page, 'c7Say', 'ch7.say.skew', T);
    await setRange(page, 'c7Write', 0); await says(page, 'c7Say', 'ch7.say.idle', T);
    // ch8 + ch8e
    await says(page, 'c8Say', 'ch8.say', T);
    await says(page, 'c8eSay', 'ch8.e.say', T);
    // ch9 + ch9s
    await says(page, 'c9Say', 'ch9.say.normal', T);
    await setCheck(page, 'c9Mig', true); await says(page, 'c9Say', 'ch9.say.migrating', T);
    await says(page, 'c9sSay', 'ch9.s.say.none', T);
    await pick(page, 'c9sMode', 'double'); await says(page, 'c9sSay', 'ch9.s.say.double', T);
    await pick(page, 'c9sMode', 'shrink'); await says(page, 'c9sSay', 'ch9.s.say.shrink', T);
    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* reduced motion */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await page.$eval('#c5Cv', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150);
    const h1 = await page.evaluate(() => document.getElementById('c5Cv').toDataURL());
    await page.waitForTimeout(400);
    ok(h1 === await page.evaluate(() => document.getElementById('c5Cv').toDataURL()), 'reduced motion: canvases stay still');
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); console.error(`${checks - fails.length}/${checks} checks passed`); process.exit(1); }
  console.log(`${checks}/${checks} checks passed`);
})();
