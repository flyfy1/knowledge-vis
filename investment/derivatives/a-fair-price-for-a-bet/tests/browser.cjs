'use strict';

/**
 * Browser verification suite for investment/derivatives/a-fair-price-for-a-bet/
 * Default assigned port: 19007 (supports PORT or ESSAY_BASE_URL override).
 * DO NOT invoke while another agent holds the serial Playwright lock.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');

const DIR = path.resolve(__dirname, '..');
const REPO = path.resolve(DIR, '..', '..', '..');
const PORT = parseInt(process.env.PORT || '19007', 10);

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

async function run() {
  let srv = null;
  let baseUrl = process.env.ESSAY_BASE_URL;
  if (!baseUrl) {
    srv = await startServer();
    baseUrl = `http://127.0.0.1:${PORT}/investment/derivatives/a-fair-price-for-a-bet/`;
  }

  const browser = await chromium.launch();
  try {
    const errors = [];
    for (const vw of [1280, 390, 320]) {
      const page = await browser.newPage({ viewport: { width: vw, height: 860 } });
      const hasEn = fs.existsSync(path.join(DIR, 'copy.en.js'));
      page.on('pageerror', (e) => errors.push(`[${vw}] pageerror: ${e.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          if (!hasEn && txt.includes('404')) return;
          errors.push(`[${vw}] console.error: ${txt}`);
        }
      });

      await page.goto(baseUrl, { waitUntil: 'networkidle' });

      // Check zero horizontal overflow & zero empty i18n nodes
      const layout = await page.evaluate(() => {
        const docEl = document.documentElement;
        const emptyI18n = [];
        document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach((el) => {
          if (!el.textContent.trim()) emptyI18n.push(el.getAttribute('data-i18n') || el.getAttribute('data-i18n-html'));
        });
        const tinyTargets = [];
        document.querySelectorAll('button, input[type="radio"] + span, .btn, .lang-btn').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && r.height < 24) tinyTargets.push({ txt: el.textContent.trim(), h: r.height });
        });
        const canvases = Array.from(document.querySelectorAll('canvas')).map((cv) => ({
          id: cv.id,
          w: cv.width,
          h: cv.height,
          cw: cv.clientWidth
        }));
        return {
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          emptyI18n,
          tinyTargets,
          canvases
        };
      });

      assert(layout.scrollWidth <= layout.clientWidth + 1, `Viewport ${vw}: horizontal overflow ${layout.scrollWidth} > ${layout.clientWidth}`);
      assert.strictEqual(layout.emptyI18n.length, 0, `Viewport ${vw}: empty i18n nodes: ${layout.emptyI18n.join(',')}`);
      layout.canvases.forEach((cv) => {
        assert(cv.w > 0 && cv.h > 0, `Viewport ${vw}: canvas ${cv.id} did not initialize`);
      });

      if (vw === 1280) {
        // Exercise controls across chapters & verify dynamic readout updates
        await page.fill('#m1Quote', '98');
        await page.dispatchEvent('#m1Quote', 'input');
        const m1Say = await page.textContent('#m1Say');
        assert(m1Say.includes('98.00'), 'm1Say updated for F=98');

        await page.click('input[name="m2Strat"][value="straddle"]');
        const m2Say = await page.textContent('#m2Say');
        assert(m2Say.length > 10);

        await page.click('input[name="m7Mode"][value="greeks"]');
        const m7Say = await page.textContent('#m7Say');
        assert(m7Say.includes('Delta'), 'm7 Greeks mode active');

        await page.click('input[name="m8Mode"][value="tails"]');
        const m8Say = await page.textContent('#m8Say');
        assert(m8Say.includes('19.5'), 'm8 tails mode active');

        await page.click('input[name="m10Mode"][value="notional"]');
        const m10Say = await page.textContent('#m10Say');
        assert(m10Say.includes('844.6'), 'm10 BIS notional mode active');

        await page.click('input[name="m11Mode"][value="perp"]');
        const m11Say = await page.textContent('#m11Say');
        assert(m11Say.includes('bps'), 'm11 perp mode active');

        // Lang toggle fallback check without copy.en.js
        await page.click('#langToggle');
        const htmlLang = await page.getAttribute('html', 'lang');
        assert.strictEqual(htmlLang, 'zh-CN', 'Safely falls back to zh-CN without copy.en.js');
      }

      await page.close();
    }

    // Reduced motion check on Ch6 Play
    const rmPage = await browser.newPage({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
    await rmPage.goto(baseUrl, { waitUntil: 'networkidle' });
    await rmPage.click('#m6Play');
    const tauAfter = await rmPage.inputValue('#m6Tau');
    assert.strictEqual(parseFloat(tauAfter), 0, 'Reduced motion jumps m6Tau cleanly without looping');
    await rmPage.close();

    assert.strictEqual(errors.length, 0, 'Browser runtime errors: ' + errors.join(' | '));
    console.log(`BROWSER CHECKS PASSED on ${baseUrl}`);
  } finally {
    await browser.close();
    if (srv) srv.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
