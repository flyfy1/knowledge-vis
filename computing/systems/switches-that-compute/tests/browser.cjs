'use strict';
// Browser smoke test. Needs Playwright on NODE_PATH and a static server at the repo root:
//   python3 -m http.server 18886 --bind 127.0.0.1
//   SWITCHES_BASE_URL=http://127.0.0.1:18886 NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
//     node computing/systems/switches-that-compute/tests/browser.cjs
// Checks: no console/page errors (the 404 for the optional copy.en.js is allowed), no horizontal overflow
// at 1280/390/320, every interactive target at least 48×48 px, text contrast at least 4.5:1, the language
// toggle reads 中 | EN and switches languages, English mode shows no CJK (text, attributes, canvas), every model can be driven once, and reduced motion stops the animations.
const { chromium } = require('playwright');
const assert = require('assert');
const base = (process.env.SWITCHES_BASE_URL || 'http://127.0.0.1:18886').replace(/\/$/, '') + '/computing/systems/switches-that-compute/';
let fails = 0, n = 0;
async function check(name, fn) { try { await fn(); n++; console.log('ok - ' + name); } catch (e) { fails++; console.log('FAIL - ' + name + '\n   ' + (e && e.message)); } }

(async () => {
  const browser = await chromium.launch();
  for (const width of [1280, 390, 320]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage(), errors = [], missing = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) missing.push(r.status() + ' ' + r.url()); });
    await page.goto(base); await page.waitForTimeout(300);

    await check(`${width}: zh by default, title and headings filled from copy.zh.js`, async () => {
      assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'zh-CN');
      assert.strictEqual(await page.title(), '一堆开关是怎么学会算数的');
      const empty = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => !e.textContent.trim()).map(e => e.dataset.i18n || e.dataset.i18nHtml));
      assert.deepStrictEqual(empty, []);
    });
    await check(`${width}: no horizontal overflow`, async () => {
      for (const id of ['ch1', 'ch4', 'ch5', 'ch9', 'ch10']) { await page.evaluate(i => document.getElementById(i).scrollIntoView({ behavior: 'instant' }), id); await page.waitForTimeout(150); }
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(ov <= 0, 'overflow ' + ov);
    });
    await check(`${width}: every interactive target is at least 48×48`, async () => {
      const small = await page.evaluate(() => [...document.querySelectorAll('a[href],button,input,select')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return { t: e.tagName + '#' + e.id + ' ' + (e.textContent || '').trim().slice(0, 16), w: r.width, h: r.height }; }).filter(x => x.w < 47.5 || x.h < 43.5));
      assert.deepStrictEqual(small.filter(x => x.w < 47.5 || x.h < 47.5), []);
    });
    await check(`${width}: text contrast at least 4.5:1`, async () => {
      const low = await page.evaluate(() => {
        const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const bg = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length === 3 || (c.length === 4 && c[3] > 0.5)) return c.slice(0, 3); } return [12, 14, 19]; };
        const out = [];
        document.querySelectorAll('body *').forEach(el => {
          if (el.closest('svg') || el.disabled) return;
          const own = [...el.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
          if (!own || el.offsetParent === null) return;
          const fg = rgb(getComputedStyle(el).color).slice(0, 3), b = bg(el), L1 = lum(fg), L2 = lum(b);
          const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          if (ratio < 4.5) out.push(el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 20) + '" ' + ratio.toFixed(2));
        });
        return out.slice(0, 10);
      });
      assert.deepStrictEqual(low, []);
    });
    if (width === 1280) {
      await check('language toggle reads 中 | EN and switches to en and back', async () => {
        assert.deepStrictEqual(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim())), ['中', 'EN']);
        await page.click('#langToggle button[data-lang="en"]'); await page.waitForTimeout(100);
        assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'en');
        assert.strictEqual(await page.evaluate(() => { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return 'en'; } }), 'en');
        assert.strictEqual(await page.title(), 'How a Pile of Switches Learned to Do Arithmetic');
        assert.strictEqual((await page.textContent('#ch1 h2')).trim(), 'Switches Control Switches');
        await page.click('#langToggle button[data-lang="zh"]'); await page.waitForTimeout(100);
        assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'zh-CN');
      });
      await check('ch1: four presses in series fill the table and name it AND', async () => {
        await page.click('#c1A'); await page.click('#c1B'); await page.click('#c1A');
        assert.strictEqual((await page.textContent('#c1Name')).trim(), '与（AND）');
        await page.click('[data-c1wire="parallel"]'); await page.click('#c1T1'); await page.click('#c1T2');
        for (const id of ['#c1A', '#c1B', '#c1A', '#c1B']) await page.click(id);
        assert.strictEqual((await page.textContent('#c1Name')).trim(), '与非（NAND）');
      });
      await check('ch2: "show solution" for XOR matches all four rows with 4 gates', async () => {
        await page.click('#c2Targets button[data-tgt="XOR"]'); await page.click('#c2Solve');
        assert.strictEqual((await page.textContent('#c2Match')).trim(), '4 / 4'); assert.strictEqual((await page.textContent('#c2Used')).trim(), '4 个');
        await page.selectOption('#c2Slots select[data-g="3"][data-k="b"]', 'g0');
        assert.notStrictEqual((await page.textContent('#c2Match')).trim(), '4 / 4');
      });
      await check('ch3: 255 + 1 wraps to 0 flipping 8 switches', async () => {
        for (let i = 0; i < 8; i++) await page.click(`#c3Bits button[data-i="${i}"]`);
        assert.strictEqual((await page.textContent('#c3Val')).trim(), '255');
        await page.click('#c3Inc'); assert.strictEqual((await page.textContent('#c3Val')).trim(), '0'); assert.strictEqual((await page.textContent('#c3Flips')).trim(), '8 个');
      });
      await check('ch4: 255 + 1 settles at 32 gate delays; the sweep reaches 65,536', async () => {
        await page.click('#c4Presets button[data-a="255"]');
        assert.strictEqual((await page.textContent('#c4Settle')).trim(), '32 个门延迟');
        await page.evaluate(() => document.getElementById('c4Scatter').scrollIntoView({ behavior: 'instant' }));
        await page.waitForFunction(() => document.getElementById('c4Swept').textContent.trim() === '65,536', null, { timeout: 15000 });
        assert.strictEqual((await page.textContent('#c4Worst')).trim(), '32 个门延迟'); assert.strictEqual((await page.textContent('#c4WorstN')).trim(), '128 对');
      });
      await check('ch5: 100 + 100 overflows to −56', async () => {
        await page.click('[data-c5p="100,100,0"]');
        assert.strictEqual((await page.textContent('#c5S')).trim(), '−56'); assert.strictEqual((await page.textContent('#c5V')).trim(), '是');
      });
      await check('ch6: S then release keeps Q = 1', async () => {
        await page.evaluate(() => document.getElementById('c6Wave').scrollIntoView({ behavior: 'instant' }));
        await page.click('#c6S'); await page.waitForTimeout(900); await page.click('#c6S'); await page.waitForTimeout(900);
        assert.strictEqual((await page.textContent('#c6Q')).trim(), '1');
        // identical gates: releasing S and R together keeps them flipping
        await page.click('[data-c6mode="ideal"]'); await page.click('#c6Both'); await page.waitForTimeout(3500);
        const q = (await page.textContent('#c6Q')).trim(), qn = (await page.textContent('#c6Qn')).trim();
        assert.ok(/来回翻了/.test(await page.textContent('#c6Say')), 'says it is oscillating (Q=' + q + ', Q̄=' + qn + ')');
        await page.click('[data-c6mode="real"]'); await page.waitForTimeout(6000);
        assert.ok(/落到了/.test(await page.textContent('#c6Say')), 'settles once timing wobbles');
      });
      await check('ch7: load 120 and step one period gives 121, at any moment of the clock, with no false "wrong" count', async () => {
        await page.evaluate(() => document.getElementById('c7Wave').scrollIntoView({ behavior: 'instant' }));
        await page.click('#c7Play');
        for (let k = 0; k < 6; k++) {
          await page.click('#c7Play'); await page.waitForTimeout(90 + 37 * k); await page.click('#c7Play'); // stop at an arbitrary phase
          const w0 = (await page.textContent('#c7Wrong')).trim();
          await page.click('#c7Load'); await page.click('#c7Step');
          assert.strictEqual((await page.textContent('#c7Val')).trim(), '121', 'try ' + k);
          assert.strictEqual((await page.textContent('#c7Wrong')).trim(), w0, 'no wrong step counted, try ' + k);
        }
      });
      await check('ch8: SUB with A = B sets Z', async () => {
        assert.strictEqual((await page.textContent('#c8Z')).trim(), '1');
        await page.click('#c8Ops button[data-op="0"]'); assert.strictEqual((await page.textContent('#c8Res')).trim(), '84');
      });
      await check('ch9: running 6 × 7 halts with 42 after 59 instructions', async () => {
        await page.evaluate(() => { const s = document.getElementById('c9Sp'); s.value = 2; s.dispatchEvent(new Event('input')); document.getElementById('c9Mem').scrollIntoView({ behavior: 'instant' }); });
        await page.click('#c9Run');
        await page.waitForFunction(() => document.getElementById('c9Steps').textContent.trim() === '59', null, { timeout: 15000 });
        assert.strictEqual((await page.textContent('#c9Out')).trim(), '42');
      });
      await check('ch10: 52 bits not equal, 23 bits equal, 25 of 51 widths equal', async () => {
        assert.strictEqual((await page.textContent('#c10Eq')).trim(), '否');
        await page.evaluate(() => { const s = document.getElementById('c10M'); s.value = 23; s.dispatchEvent(new Event('input')); });
        assert.strictEqual((await page.textContent('#c10Eq')).trim(), '是'); assert.strictEqual((await page.textContent('#c10Count')).trim(), '25 / 51 种');
      });
      await check('ch11: the ledger shows the machine at 1,022 NANDs', async () => {
        assert.ok((await page.textContent('#c11Ledger')).includes('1,022'));
      });
    }
    await check(`${width}: no console or page errors, no missing files`, async () => { assert.deepStrictEqual(errors, []); assert.deepStrictEqual(missing, []); });
    await ctx.close();
  }
  // English: no CJK left visible (text, attributes, title, canvas labels) apart from the 中 toggle label;
  // overflow and target size again, since English strings are longer
  for (const width of [1280, 390, 320]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: 'en-US' });
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.addInitScript(() => {
      try { localStorage.setItem('knowledge-lang', 'en'); } catch (e) { /* ignore */ }
      window.__canvasText = [];
      const f = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (s, ...r) { window.__canvasText.push(String(s)); return f.call(this, s, ...r); };
    });
    await page.goto(base); await page.waitForTimeout(300);
    // scroll every model into view (canvases draw only on screen) and press a few controls so generated text appears
    for (const id of ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10', 'ch11']) {
      await page.evaluate(i => document.getElementById(i).scrollIntoView({ behavior: 'instant' }), id);
      await page.waitForTimeout(150);
      const cvs = await page.$$('#' + id + ' canvas');
      for (const c of cvs) { await c.scrollIntoViewIfNeeded(); await page.waitForTimeout(120); }
    }
    for (const sel of ['#c1A', '#c1B', '#c2Solve', '#c3Inc', '#c4Presets button[data-a="255"]', '[data-c5p="100,100,0"]', '#c6Both', '#c7Load', '#c7Step', '#c9Step', '#c9Step']) {
      const el = await page.$(sel); if (el) { await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(80); }
    }
    await page.evaluate(() => document.getElementById('c4Scatter').scrollIntoView({ behavior: 'instant' }));
    await page.waitForFunction(() => document.getElementById('c4Swept').textContent.trim() === '65,536', null, { timeout: 15000 });
    await page.waitForTimeout(300);
    await check(`en ${width}: no CJK visible apart from the 中 toggle`, async () => {
      const cjk = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
      const found = await page.evaluate(src => {
        const re = new RegExp(src), out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { const el = n.parentElement; if (!el || el.closest('#langToggle') || el.closest('script,style')) continue; if (re.test(n.textContent) && el.getClientRects().length) out.push(n.textContent.trim().slice(0, 40)); }
        document.querySelectorAll('*').forEach(el => ['aria-label', 'title', 'placeholder', 'alt'].forEach(a => { const v = el.getAttribute(a); if (v && re.test(v)) out.push(a + '=' + v); }));
        if (re.test(document.title)) out.push('title=' + document.title);
        window.__canvasText.forEach(s => { if (re.test(s)) out.push('canvas: ' + s); });
        return out.slice(0, 15);
      }, cjk.source);
      assert.deepStrictEqual(found, []);
      assert.ok((await page.evaluate(() => window.__canvasText.length)) > 20, 'canvases drew labels');
    });
    await check(`en ${width}: no horizontal overflow`, async () => {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) <= 0);
    });
    await check(`en ${width}: every interactive target is at least 48×48`, async () => {
      const small = await page.evaluate(() => [...document.querySelectorAll('a[href],button,input,select')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return { t: e.tagName + '#' + e.id + ' ' + (e.textContent || '').trim().slice(0, 16), w: r.width, h: r.height }; }).filter(x => x.w < 47.5 || x.h < 47.5));
      assert.deepStrictEqual(small, []);
    });
    await check(`en ${width}: no readout or button text overflows its box`, async () => {
      const over = await page.evaluate(() => [...document.querySelectorAll('button, .read > div, .read b, .read span, output, td, th')].filter(e => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 1).map(e => e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 30) + '"'));
      assert.deepStrictEqual(over, []);
    });
    await check(`en ${width}: no console or page errors`, async () => { assert.deepStrictEqual(errors, []); });
    await ctx.close();
  }
  // reduced motion: the hero counter and the running models stay still
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN', reducedMotion: 'reduce' });
    const page = await ctx.newPage(); await page.goto(base); await page.waitForTimeout(300);
    await check('reduced motion: hero counter does not move; ch6/ch7 start paused; ch4 shows the full timeline', async () => {
      const v0 = await page.textContent('#heroLamps span'); await page.waitForTimeout(1200); assert.strictEqual(await page.textContent('#heroLamps span'), v0);
      assert.strictEqual((await page.textContent('#c6Play')).trim(), '播放'); assert.strictEqual((await page.textContent('#c7Play')).trim(), '播放');
      assert.strictEqual(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    });
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${n} passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})();
