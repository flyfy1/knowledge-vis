'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const port = process.env.PORT || '18875';
const base = (process.env.ESSAY_BASE_URL || `http://127.0.0.1:${port}`).replace(/\/$/, '');
const url = base + '/computing/ml/how-hybrid-attention-remembers/';
const shotDir = '/tmp/agent-tasks/essays/how-hybrid-attention-remembers';
fs.mkdirSync(shotDir, { recursive: true });

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const badPlaceholder = s => /\{\w+\}|NaN|undefined|Infinity/.test(s);

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference',
  });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => {
    const f = CanvasRenderingContext2D.prototype.fillText;
    window.__canvasStrings = new Set();
    CanvasRenderingContext2D.prototype.fillText = function (s, ...a) {
      window.__canvasStrings.add(String(s));
      return f.call(this, s, ...a);
    };
  });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors;
  return page;
}

const setRange = (page, id, v) => page.evaluate(([id, v]) => {
  const e = document.getElementById(id);
  e.value = v;
  e.dispatchEvent(new Event('input', { bubbles: true }));
  e.dispatchEvent(new Event('change', { bubbles: true }));
}, [id, String(v)]);

(async () => {
  const browser = await chromium.launch();
  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;

  for (const lang of ['zh', 'en']) {
    for (const width of [1280, 390, 320]) {
      const page = await open(browser, width, { lang });
      const tag = `${lang} ${width}`;
      ok((await page.evaluate(() => document.documentElement.lang)) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
      ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle text`);

      const figs = await page.$$('figure');
      for (let i = 0; i < figs.length; i++) {
        await figs[i].evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(160);
        if (width === 1280 || width === 320 || (lang === 'en' && width === 390)) {
          await page.screenshot({ path: path.join(shotDir, `${lang}-${width}-fig${i + 1}.png`) });
        }
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(overflow <= 0, `${tag}: horizontal overflow ${overflow}px`);

      const smallTargets = await page.evaluate(() => [...document.querySelectorAll('a[href],button,input,select')]
        .filter(e => e.offsetParent !== null)
        .map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.textContent.trim().slice(0, 14), w: r.width, h: r.height }; })
        .filter(x => x.w < 47.5 || x.h < 47.5));
      // Allow 20px native checkboxes wrapped in 48px label.chk; verify label.chk or parent is >= 48px
      const realSmall = await page.evaluate(() => [...document.querySelectorAll('a[href],button,select,label.chk,input[type="range"]')]
        .filter(e => e.offsetParent !== null)
        .map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName + '#' + (e.id || e.textContent.trim().slice(0, 14)), w: r.width, h: r.height }; })
        .filter(x => x.w < 47.5 || x.h < 47.5));
      ok(realSmall.length === 0, `${tag}: small targets ${JSON.stringify(realSmall)}`);

      const lowContrast = await page.evaluate(() => {
        const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const bg = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length === 3 || (c.length === 4 && c[3] > 0.5)) return c.slice(0, 3); } return [12, 14, 19]; };
        const out = [];
        document.querySelectorAll('body *').forEach(el => {
          if (el.disabled || el.offsetParent === null) return;
          const own = [...el.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
          if (!own) return;
          const fg = rgb(getComputedStyle(el).color).slice(0, 3), b = bg(el), L1 = lum(fg), L2 = lum(b);
          const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          if (ratio < 4.5) out.push(el.tagName + '.' + el.className + ' ' + ratio.toFixed(2));
        });
        return out;
      });
      ok(lowContrast.length === 0, `${tag}: low contrast ${JSON.stringify(lowContrast)}`);

      const bodyText = await page.evaluate(() => document.body.innerText);
      ok(!badPlaceholder(bodyText), `${tag}: placeholder or NaN/undefined found`);

      if (lang === 'en') {
        const stripped = await page.evaluate(() => {
          const clone = document.body.cloneNode(true);
          clone.querySelectorAll('#langToggle').forEach(n => n.remove());
          const origZh = document.querySelectorAll('.page-provenance .provenance-zh');
          clone.querySelectorAll('.page-provenance .provenance-zh').forEach((n, i) => {
            if (origZh[i] && getComputedStyle(origZh[i]).display === 'none') n.remove();
          });
          return clone.innerText;
        });
        ok(!CJK.test(stripped), `${tag}: CJK leaked in EN DOM`);
        const canvasStrs = await page.evaluate(() => [...window.__canvasStrings]);
        const cjkCanvas = canvasStrs.filter(s => CJK.test(s));
        ok(cjkCanvas.length === 0, `${tag}: CJK leaked in EN canvas: ${JSON.stringify(cjkCanvas)}`);
      }

      ok(page.__errors().length === 0, `${tag}: console/network errors ${JSON.stringify(page.__errors())}`);
      await page.close();
    }
  }

  // Interactive check in 1280 zh: drive every lab
  const page = await open(browser, 1280, { lang: 'zh' });
  await page.click('#c1Arch button[data-arch="full"]');
  await setRange(page, 'c1Ctx', 8);
  ok((await page.textContent('#c1KvVal')).includes('17.00 GiB'), 'ch1 256K full KV is 17.00 GiB');

  await page.click('#c2Play');
  await page.waitForTimeout(450);
  await page.click('#c2Reset');
  ok((await page.textContent('#c2StepOut')).trim() === '1 / 16', 'ch2 reset sets step 1 / 16');

  await page.click('#c3Dim button[data-dim="16"]');
  await page.click('#c3Over');
  ok((await page.textContent('#c3LoadVal')).trim() === '1.00×', 'ch3 d=16 writes=16 -> 1.00x');

  await page.click('#c4Mode button[data-mode="distinct"]');
  await setRange(page, 'c4Beta', 0.8);
  ok(!badPlaceholder(await page.textContent('#c4Say')), 'ch4 say clean');

  await page.click('#c5Dip');
  await setRange(page, 'c5Alpha', 0.86);
  ok(!badPlaceholder(await page.textContent('#c5Say')), 'ch5 say clean');

  await page.click('#c6Chunk button[data-chunk="16"]');
  ok((await page.textContent('#c6StepsVal')).trim() === '4,096', 'ch6 C=16 -> 4,096 steps');

  await page.click('#c7Ratio button[data-ratio="0:1"]');
  ok((await page.textContent('#c7SaveVal')).trim() === '100 %', 'ch7 0:1 saves 100%');

  await setRange(page, 'c8Ctx', 7);
  ok((await page.textContent('#c8CtxOut')).trim() === '128K', 'ch8 ctx=128K');

  await page.click('#c9Ctx button[data-ctx="262144"]');
  ok((await page.textContent('#c9Say')).includes('256K'), 'ch9 table switched to 256K');

  // Language switch preserves state without reload
  await page.click('#langToggle button[data-lang="en"]');
  await page.waitForTimeout(100);
  ok((await page.evaluate(() => document.documentElement.lang)) === 'en', 'live toggle switches to en');
  ok((await page.textContent('#c1CtxOut')).trim() === '256K', 'live toggle preserves state');
  await page.close();

  // Reduced motion check
  const redPage = await open(browser, 1280, { lang: 'zh', reduce: true });
  await redPage.click('#c2Play');
  ok((await redPage.textContent('#c2StepOut')).trim() === '16 / 16', 'reduced motion jumps to final step 16/16');
  await redPage.close();

  await browser.close();
  if (fails.length) {
    console.error('FAILURES:\n' + fails.join('\n'));
    process.exit(1);
  }
  console.log('PASS: all browser checks clean across zh/en and 1280/390/320 + reduced motion');
})();
