'use strict';
// Browser smoke test for chemistry/matter/why-atoms-stick-together/
// Usage:
//   PORT=19006 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node chemistry/matter/why-atoms-stick-together/tests/browser.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || '19006';
const base = (process.env.ESSAY_BASE_URL || `http://127.0.0.1:${port}`).replace(/\/$/, '');
const url = base + '/chemistry/matter/why-atoms-stick-together/';
const shotDir = '/tmp/agent-tasks/essays/why-atoms-stick-together';
fs.mkdirSync(shotDir, { recursive: true });

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const bad = (s) => /\{\w+\}|NaN|undefined|null|Infinity|(^|\s)ch\d+\.\w+/.test(s);

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: opts.reduce ? 'reduce' : 'no-preference'
  });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => { if (!/copy\.en\.js$/.test(r.url())) errors.push('request failed ' + r.url()); });
  page.on('response', (r) => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  await page.addInitScript((l) => { try { localStorage.setItem('knowledge-lang', l); } catch (_) {} }, opts.lang || 'zh');
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
  page.__errors = () => errors.filter((e) => !e.startsWith('Failed to load resource'));
  return page;
}

const text = (page, sel) => page.$eval(sel, (e) => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => {
  const e = document.getElementById(id);
  e.value = v;
  e.dispatchEvent(new Event('input', { bubbles: true }));
  e.dispatchEvent(new Event('change', { bubbles: true }));
}, [id, String(v)]);
const radio = (page, name, v) => page.evaluate(([n, v]) => {
  const e = document.querySelector(`input[name="${n}"][value="${v}"]`);
  e.checked = true;
  e.dispatchEvent(new Event('change', { bubbles: true }));
  e.dispatchEvent(new Event('input', { bubbles: true }));
}, [name, v]);
const show = async (page, sel, ms = 120) => {
  await page.$eval(sel, (e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  if (ms) await page.waitForTimeout(ms);
};

(async () => {
  const browser = await chromium.launch();

  // 1. Desktop 1280px Chinese + interactive checks
  const p = await open(browser, 1280, { lang: 'zh' });
  const canvases = await p.$$eval('canvas.cv', (els) => els.map((e) => e.id));
  ok(canvases.length === 11, 'expected 11 canvases, got ' + canvases.length);

  // Scroll through every chapter so IntersectionObserver renders every canvas
  for (const id of canvases) {
    await show(p, '#' + id, 100);
    const nonBlank = await p.$eval('#' + id, (cv) => {
      const ctx = cv.getContext('2d');
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let diff = 0;
      for (let i = 0; i < d.length; i += 16) {
        if (d[i] !== 15 || d[i + 1] !== 18 || d[i + 2] !== 25) diff++;
      }
      return diff;
    });
    ok(nonBlank > 30, 'canvas blank: ' + id);
  }

  // Test interactions in all 10 interactive labs
  await show(p, '#ch1');
  await setRange(p, 'bxL', 2.0);
  ok(!(await text(p, '#bxSay')).includes('{'), 'ch1 say placeholder');

  await show(p, '#ch2');
  await radio(p, 'h2Bas', 'var');
  await setRange(p, 'h2R', 2.0);
  ok((await text(p, '#h2Energy')).includes('−') || (await text(p, '#h2Energy')).includes('-'), 'ch2 var bonding negative');
  await radio(p, 'h2Orb', 'anti');
  ok((await text(p, '#h2Energy')).startsWith('+'), 'ch2 antibonding positive');

  await show(p, '#ch3');
  await radio(p, 'hkN', '4');
  ok((await text(p, '#hkGap')).startsWith('0.000'), 'ch3 cyclobutadiene zero gap');
  await radio(p, 'hkN', '6');
  ok((await text(p, '#hkGap')).startsWith('2.000'), 'ch3 benzene 2|beta| gap');

  await show(p, '#ch4');
  await setRange(p, 'tsD', 6.0);
  ok(parseFloat(await text(p, '#tsQ')) > 0.75, 'ch4a large delta q > 0.75');
  await radio(p, 'mdView', 'bornhaber');
  ok((await text(p, '#mdLat')).includes('786'), 'ch4b Born-Haber -786');

  await show(p, '#ch5');
  await radio(p, 'tbBas', '1');
  ok((await text(p, '#tbGap')).startsWith('0.00'), 'ch5 metal zero gap');
  await radio(p, 'tbBas', '2');
  await setRange(p, 'tbD', 4.0);
  ok((await text(p, '#tbGap')).startsWith('4.00'), 'ch5 insulator gap 4.00');

  await show(p, '#ch6');
  await radio(p, 'hyMol', 'h2o');
  ok((await text(p, '#hyAng')).startsWith('104.5'), 'ch6 H2O 104.5 deg');

  await show(p, '#ch7');
  await p.click('#mdStep');
  ok(!bad(await text(p, '#md2Say')), 'ch7 md2Say valid');

  await show(p, '#ch8');
  await radio(p, 'stMat', 'diamond');
  ok((await text(p, '#stBarrier')).startsWith('3.600'), 'ch8 diamond barrier');

  await show(p, '#ch9');
  await radio(p, 'hpSeq', 'frustrated');
  ok((await text(p, '#hpMinE')) === '0', 'ch9 frustrated E=0');
  await radio(p, 'hpSeq', 'designable');
  await p.click('#hpFold');
  ok((await text(p, '#hpDeg')) === '1', 'ch9 designable g=1');

  await show(p, '#ch10');
  await radio(p, 'frFilt', 'contested');
  const hiddenCount = await p.$$eval('#ch10 ul li', (els) => els.filter((e) => e.style.display === 'none').length);
  ok(hiddenCount === 3, 'ch10 contested filter hides 3 items, got ' + hiddenCount);
  await radio(p, 'frFilt', 'all');

  // Check all readouts and .say texts have no bad tokens
  const allSays = await p.$$eval('.say, .read b', (els) => els.map((e) => e.id + ':' + e.textContent.trim()));
  allSays.forEach((s) => ok(!bad(s), 'bad string in UI: ' + s));

  // Save desktop key screenshots
  await show(p, '#ch2'); await p.screenshot({ path: path.join(shotDir, 'desktop-ch2.png') });
  await show(p, '#ch7'); await p.screenshot({ path: path.join(shotDir, 'desktop-ch7.png') });
  await show(p, '#ch9'); await p.screenshot({ path: path.join(shotDir, 'desktop-ch9.png') });
  ok(p.__errors().length === 0, 'desktop console/page errors: ' + p.__errors().join('; '));
  await p.close();

  // 2. Narrow viewports 390px and 320px + reduced-motion
  for (const [w, red] of [[390, false], [320, true]]) {
    const m = await open(browser, w, { lang: 'zh', reduce: red });
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    ok(!overflow, `horizontal overflow at ${w}px`);
    for (const id of canvases) await show(m, '#' + id, 60);
    await show(m, '#ch3');
    await m.screenshot({ path: path.join(shotDir, `mobile-${w}-ch3.png`) });
    ok(m.__errors().length === 0, `${w}px errors: ` + m.__errors().join('; '));
    await m.close();
  }

  await browser.close();
  if (fails.length) {
    console.error('BROWSER TEST FAILS:\n' + fails.join('\n'));
    process.exit(1);
  }
  console.log('browser.cjs: all checks passed');
})();
