'use strict';
// Browser smoke test for the why-nvme-is-fast essay.
// Usage:
//   ESSAY_BASE_URL=http://127.0.0.1:18871 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/systems/why-nvme-is-fast/tests/browser.cjs
const { chromium } = require('playwright');
const fs = require('fs');

const port = process.env.PORT || '18871';
const base = (process.env.ESSAY_BASE_URL || `http://127.0.0.1:${port}`).replace(/\/$/, '');
const url = base + '/computing/systems/why-nvme-is-fast/';
const shotDir = '/tmp/agent-tasks/essays/why-nvme-is-fast';
fs.mkdirSync(shotDir, { recursive: true });

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const bad = s => /\{\w+\}|NaN|undefined|null|Infinity|(^|\s)ch\d+\.\w+/.test(s);

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

const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
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
const show = async (page, sel, ms = 100) => {
  await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  if (ms) await page.waitForTimeout(ms);
};

(async () => {
  const browser = await chromium.launch();

  // 1. Desktop zh: drive all 8 labs
  {
    const p = await open(browser, 1280, { lang: 'zh' });
    await show(p, '#ch1');
    await radio(p, 'c1preset', 'ull');
    await radio(p, 'c1proto', 'ahci');
    ok((await text(p, '#c1rShare')) === '71.4%', 'ch1 ull ahci share 71.4%');

    await show(p, '#ch2');
    await radio(p, 'c2bus', 'pcie5');
    await setRange(p, 'c2qd', 128);
    ok(!bad(await text(p, '#c2say')), 'ch2 say clean');

    await show(p, '#ch3');
    await setRange(p, 'c3cores', 16);
    ok((await text(p, '#c3rRatio')) === '9.7×', 'ch3 16-core ratio 9.7x');

    await show(p, '#ch4');
    await p.click('#c4batch');
    ok((await text(p, '#c4rDone')) === '4', 'ch4 batch 4 completed');
    await p.click('#c4reset');
    ok((await text(p, '#c4rDone')) === '0', 'ch4 reset');

    await show(p, '#ch5');
    await setRange(p, 'c5qd', 32);
    ok((await text(p, '#c5rAct')) === '32 / 32', 'ch5 32/32 active');

    await show(p, '#ch6');
    await setRange(p, 'c6fill', 85);
    ok((await text(p, '#c6rWaf')) === '4.9×', 'ch6 waf 4.9x');

    await show(p, '#ch7');
    await setRange(p, 'c7media', 10);
    ok((await text(p, '#c7rIrqLat')) === '16.0 us', 'ch7 irq 16.0 us');

    await show(p, '#ch8');
    await radio(p, 'c8path', 'gds');
    await radio(p, 'c8gen', 'gen6');
    ok((await text(p, '#c8rTime')) === '1.40 s', 'ch8 gds 1.40 s');

    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    ok(!overflow, '1280 zh no horizontal overflow');
    ok(p.__errors().length === 0, '1280 zh zero errors: ' + p.__errors().join('; '));
    await p.screenshot({ path: shotDir + '/desktop-zh.png' });
    await p.close();
  }

  // 2. Desktop en: check zero CJK in DOM and canvas
  {
    const p = await open(browser, 1280, { lang: 'en' });
    for (let i = 1; i <= 8; i++) await show(p, `#ch${i}`, 60);
    const bodyText = await p.evaluate(() => document.body.innerText);
    const canvasText = await p.evaluate(() => [...window.__canvasStrings].join(' '));
    // Remove only the 中 toggle button text before checking CJK
    const bodyNoToggle = bodyText.replace(/^中\s*EN/m, '');
    ok(!/[\u4e00-\u9fff]/.test(bodyNoToggle), 'en body has no CJK');
    ok(!/[\u4e00-\u9fff]/.test(canvasText), 'en canvas has no CJK: ' + canvasText);
    ok(!bad(bodyText), 'en body has no placeholders/NaN');
    ok(p.__errors().length === 0, '1280 en zero errors');
    await p.close();
  }

  // 3. Mobile 390 and 320 + reduced motion
  for (const width of [390, 320]) {
    const p = await open(browser, width, { lang: 'zh', reduce: width === 320 });
    for (let i = 1; i <= 8; i++) await show(p, `#ch${i}`, 50);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    ok(!overflow, `${width}px no horizontal overflow`);
    const smallTargets = await p.evaluate(() => {
      const badEls = [];
      document.querySelectorAll('.topbar a, .toc a, button, input[type=range], .seg label, label.chk').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 47) badEls.push(el.tagName + ':' + Math.round(r.height));
      });
      return badEls;
    });
    ok(smallTargets.length === 0, `${width}px targets >=48px: ${smallTargets.join(',')}`);
    ok(p.__errors().length === 0, `${width}px zero errors`);
    await p.close();
  }

  await browser.close();
  if (fails.length) {
    console.error('BROWSER TEST FAILURES:\n' + fails.join('\n'));
    process.exit(1);
  }
  console.log('Browser smoke tests passed (1280 zh/en, 390, 320 reduced-motion).');
})();
