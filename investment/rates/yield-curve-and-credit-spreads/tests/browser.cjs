'use strict';

/**
 * Browser verification suite for investment/rates/yield-curve-and-credit-spreads/
 * Assigned port: 19025 (override via PORT or ESSAY_BASE_URL).
 * Usage:
 *   NODE_PATH=~/Documents/integ-life/integ-games/node_modules node investment/rates/yield-curve-and-credit-spreads/tests/browser.cjs
 * Optional: SHOT_DIR=/tmp/agent-tasks/essays/yield-curve-and-credit-spreads/shots
 * DO NOT invoke while another agent holds the serial Playwright lock.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');

const DIR = path.resolve(__dirname, '..');
const REPO = path.resolve(DIR, '..', '..', '..');
const PORT = parseInt(process.env.PORT || '19025', 10);
const SHOT = process.env.SHOT_DIR;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function startServer() {
  const srv = http.createServer((req, res) => {
    const cleanUrl = (req.url || '/').split('?')[0];
    let rel = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');
    if (rel.endsWith('/')) rel += 'index.html';
    const full = path.resolve(REPO, rel);
    if (!full.startsWith(REPO) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(full);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(full).pipe(res);
  });
  return new Promise((resolve) => srv.listen(PORT, '127.0.0.1', () => resolve(srv)));
}

const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;

async function open(browser, url, width, opts = {}) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference'
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
  page.on('response', (r) => {
    if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) {
      errors.push(`${r.status()} ${r.url()}`);
    }
  });
  await page.addInitScript((l) => {
    try { localStorage.setItem('knowledge-lang', l); } catch (e) {}
  }, opts.lang || 'zh');
  await page.addInitScript(() => {
    const f = CanvasRenderingContext2D.prototype.fillText;
    window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) {
      window.__canvasStrings.add(String(s));
      return f.call(this, s, ...a);
    };
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter((e) => !e.startsWith('Failed to load resource'));
  return page;
}

const setRange = (page, id, v) => page.evaluate(([i, val]) => {
  const el = document.getElementById(i);
  el.value = val;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}, [id, String(v)]);

const pick = (page, name, v) => page.evaluate(([n, val]) => {
  const el = document.querySelector(`input[name="${n}"][value="${val}"]`);
  el.checked = true;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, [name, String(v)]);

const show = async (page, sel, ms = 180) => {
  await page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(ms);
};

async function run() {
  let srv = null;
  let url = process.env.ESSAY_BASE_URL;
  if (!url) {
    srv = await startServer();
    url = `http://127.0.0.1:${PORT}/investment/rates/yield-curve-and-credit-spreads/`;
  } else {
    url = url.replace(/\/$/, '') + '/investment/rates/yield-curve-and-credit-spreads/';
  }

  if (SHOT) fs.mkdirSync(SHOT, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const width of [1280, 390, 320]) {
      const page = await open(browser, url, width, { lang: 'zh' });
      const langAttr = await page.evaluate(() => document.documentElement.lang);
      assert.strictEqual(langAttr, 'zh-CN', `width ${width}: html lang`);
      const toggleLabels = await page.$$eval('#langToggle button', (bs) => bs.map((b) => b.textContent.trim()));
      assert.deepStrictEqual(toggleLabels, ['中', 'EN'], `width ${width}: toggle text`);

      // Scroll every figure into view so IntersectionObserver triggers canvas draw
      const figs = await page.$$('figure.lab');
      for (let i = 0; i < figs.length; i++) {
        await figs[i].evaluate((e) => e.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(220);
        if (SHOT) {
          await figs[i].screenshot({ path: path.join(SHOT, `zh-${width}-fig${String(i + 1).padStart(2, '0')}.png`) });
        }
      }

      const check = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const emptyI18n = [];
        document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach((e) => {
          if (!e.textContent.trim()) emptyI18n.push(e.dataset.i18n || e.dataset.i18nHtml);
        });
        const uninitCanvases = [...document.querySelectorAll('canvas')].filter((c) => c.width === 0 || c.height === 0).map((c) => c.id);
        const small = [];
        const boxOf = (e) => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
        for (const e of document.querySelectorAll('button, input, .toc a, a.back')) {
          const r = boxOf(e);
          if (!r.width && !r.height) continue;
          if (r.width < 47.5 || r.height < 47.5) {
            small.push(`${e.id || e.name || e.textContent.trim().slice(0, 14)} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
          }
        }
        const clipped = [...document.querySelectorAll('figure *, .toc a, #langToggle button, .tbl *')].filter((e) => {
          if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
          const cs = getComputedStyle(e);
          if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
          return e.scrollWidth > e.clientWidth + 1;
        }).map((e) => `${e.id || e.tagName}:${e.textContent.trim().slice(0, 18)}`);
        const unfilled = [...document.body.innerHTML.matchAll(/\{[a-zA-Z0-9_]+\}/g)].map((m) => m[0]);
        return { overflow, emptyI18n, uninitCanvases, small, clipped, unfilled };
      });

      assert(check.overflow <= 0, `width ${width}: overflow ${check.overflow}px`);
      assert.strictEqual(check.emptyI18n.length, 0, `width ${width}: empty i18n: ${check.emptyI18n.join(',')}`);
      assert.strictEqual(check.uninitCanvases.length, 0, `width ${width}: uninitialized canvases: ${check.uninitCanvases.join(',')}`);
      assert.strictEqual(check.small.length, 0, `width ${width}: targets < 48px: ${check.small.join(',')}`);
      assert.strictEqual(check.clipped.length, 0, `width ${width}: clipped text: ${check.clipped.join(',')}`);
      assert.strictEqual(check.unfilled.length, 0, `width ${width}: unfilled placeholders: ${check.unfilled.join(',')}`);
      assert.strictEqual(page.__errors().length, 0, `width ${width}: errors: ${page.__errors().join(' | ')}`);
      await page.close();
    }

    // English switch + zero-CJK check + drive all 8 models + reduced motion check
    {
      const page = await open(browser, url, 1280, { lang: 'zh', reduce: true });
      await page.click('#langToggle button[data-lang="en"]');
      assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'en', 'EN toggle sets html[lang]=en');
      const enTitle = await page.textContent('h1');
      assert(!CJK_RE.test(enTitle), 'EN h1 free of CJK');

      // Drive all 8 models
      await show(page, '#m1Cv');
      await pick(page, 'm1Pre', 'inv2023');
      assert.strictEqual((await page.textContent('#m1Spot1')).trim(), '5.40%');

      await show(page, '#m2Cv');
      await pick(page, 'm2Pre', 'inverted');
      assert((await page.textContent('#m2Spread')).includes('0.94%'));

      await show(page, '#m3Cv');
      await setRange(page, 'm3Dy', -2.0);
      assert((await page.textContent('#m3Exact')).includes('43.05%'));

      await show(page, '#m4Cv');
      await pick(page, 'm4Mode', 'decompose');
      await setRange(page, 'm4Tp', -0.4);
      assert((await page.textContent('#m4Say')).length > 20);

      await show(page, '#m5Cv');
      await pick(page, 'm5Pre', 'hy_ccc');
      assert((await page.textContent('#m5Exp')).includes('6.65%'));

      await show(page, '#m6Cv');
      await setRange(page, 'm6Lev', 80);
      assert((await page.textContent('#m6Sp')).includes('163.9'));

      await show(page, '#m7Cv');
      await page.click('#m7SnapZirp');
      assert((await page.textContent('#m7Nom')).includes('1.47'));

      await show(page, '#m8Cv');
      await pick(page, 'm8View', 'credit');
      assert((await page.textContent('#m8A')).includes('89'));

      // Check zero CJK in EN DOM (excluding the 中 toggle button) and canvas strings
      const cjkLeak = await page.evaluate((reSrc) => {
        const rx = new RegExp(reSrc);
        const txt = document.body.innerText.replace(/^\s*中\s*EN/m, '');
        const domLeak = rx.test(txt);
        const cvLeak = [...window.__canvasStrings].filter((s) => rx.test(s));
        return { domLeak, cvLeak };
      }, CJK_RE.source);
      assert(!cjkLeak.domLeak, 'EN mode DOM contains CJK');
      assert.strictEqual(cjkLeak.cvLeak.length, 0, `EN mode canvas strings contain CJK: ${cjkLeak.cvLeak.join(',')}`);
      assert.strictEqual(page.__errors().length, 0, `EN/reduced errors: ${page.__errors().join(' | ')}`);

      await page.close();
    }

    console.log('PASS: browser verification passed at 1280/390/320, EN toggle, all 8 models, and reduced-motion.');
  } finally {
    await browser.close();
    if (srv) srv.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
