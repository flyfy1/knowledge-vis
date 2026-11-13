'use strict';
// Browser smoke test for the why-compute-waits-for-memory essay.
// Usage:
//   PORT=19003 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/systems/why-compute-waits-for-memory/tests/browser.cjs
//   ESSAY_BASE_URL=http://127.0.0.1:19003 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node computing/systems/why-compute-waits-for-memory/tests/browser.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || '19003';
const base = (process.env.ESSAY_BASE_URL || `http://127.0.0.1:${port}`).replace(/\/$/, '');
const url = base + '/computing/systems/why-compute-waits-for-memory/';
const shotDir = '/tmp/agent-tasks/essays/why-compute-waits-for-memory';
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
  page.on('requestfailed', r => { if (!/copy\.en\.js$/.test(r.url())) errors.push('request failed ' + r.url()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
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
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
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
const show = async (page, sel, ms = 120) => {
  await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  if (ms) await page.waitForTimeout(ms);
};

(async () => {
  const browser = await chromium.launch();
  const hasEn = await (async () => {
    const p = await browser.newPage();
    const r = await p.goto(url + 'copy.en.js');
    const st = r.status();
    await p.close();
    return st < 400;
  })();

  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
  for (const lang of hasEn ? ['zh', 'en'] : ['zh']) {
    for (const width of [1280, 390, 320]) {
      const page = await open(browser, width, { lang });
      const tag = `${lang} ${width}`;
      ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
      ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle text`);

      const figs = await page.$$('figure');
      for (let idx = 0; idx < figs.length; idx++) {
        await figs[idx].evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForTimeout(180);
        if (width === 1280 || width === 320 || (lang === 'en' && width === 390)) {
          await page.screenshot({ path: path.join(shotDir, `${lang}-${width}-fig${idx + 1}.png`) });
        }
      }

      const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
        if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const cs = getComputedStyle(e);
        if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
        return e.scrollWidth > e.clientWidth + 1;
      }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
      ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);

      const ctlOverlap = await page.evaluate(() => {
        const badCtl = [];
        for (const lbl of document.querySelectorAll('.ctl label.rng')) {
          const lr = lbl.getBoundingClientRect();
          const fr = lbl.closest('figure').getBoundingClientRect();
          for (const ch of lbl.children) {
            const cr = ch.getBoundingClientRect();
            if (cr.right > lr.right + 1.5 || cr.right > fr.right - 2) {
              badCtl.push((ch.id || ch.tagName) + ` right=${cr.right.toFixed(0)}>${Math.min(lr.right, fr.right).toFixed(0)}`);
            }
          }
        }
        return badCtl;
      });
      ok(!ctlOverlap.length, `${tag}: control overflow/overlap: ${ctlOverlap.join(', ')}`);

      if (lang === 'en') {
        const leaks = await page.evaluate(re => {
          const rx = new RegExp(re), out = [];
          const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n; (n = w.nextNode());) {
            const el = n.parentElement;
            if (!rx.test(n.textContent) || !el.getClientRects().length) continue;
            if (el.closest('#langToggle') && n.textContent.trim() === '中') continue;
            out.push('text: ' + n.textContent.trim().slice(0, 30));
          }
          for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria-label: ' + e.getAttribute('aria-label'));
          if (rx.test(document.title)) out.push('title: ' + document.title);
          for (const s of window.__canvasStrings) if (rx.test(s)) out.push('canvas: ' + s);
          return out.slice(0, 8);
        }, CJK.source);
        ok(!leaks.length, `${tag}: CJK in EN mode: ${leaks.join(' | ')}`);
      }

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
      ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);

      const saysBad = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => /\{\w+\}|NaN|undefined|null|Infinity/.test(e.textContent)).map(e => e.id));
      ok(!saysBad.length, `${tag}: broken .say text in: ${saysBad.join(', ')}`);

      ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
      await page.close();
    }
  }

  // Language toggle + drive all 10 models through extremes
  {
    const page = await open(browser, 1280, { lang: 'zh' });
    const title = await text(page, 'h1');
    ok(title.length > 0 && !bad(title), 'hero title rendered');

    await page.click('#langToggle [data-lang=en]');
    if (hasEn) {
      ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'EN toggle sets lang=en');
    } else {
      ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js, fallback keeps lang=zh-CN');
      ok((await text(page, 'h1')).length > 0, 'title still filled on fallback');
    }
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // Ch1: DRAM miss + step + reset + forwarding off
    await show(page, '#ppCv');
    await radio(page, 'ppMem', '200');
    await page.waitForTimeout(120);
    ok((await text(page, '#ppCyc')).includes('210'), 'ch1 DRAM = 210 cycles');
    ok(!bad(await text(page, '#ppSay')), 'ch1 say clean');
    await page.click('#ppFwd');
    await radio(page, 'ppMem', '1');
    await page.waitForTimeout(120);
    ok((await text(page, '#ppCyc')).includes('18'), 'ch1 L1 no-fwd = 18 cycles');
    await page.click('#ppReset');
    await page.click('#ppStep');

    // Ch2: log vs lin + cache walk row vs col + 2 KB col fit + live browser benchmark
    await show(page, '#lvCv');
    await radio(page, 'lvScale', 'lin');
    ok(!bad(await text(page, '#lvSay')), 'ch2a say clean');
    await show(page, '#cwCv');
    await radio(page, 'cwOrd', 'col');
    await page.waitForTimeout(120);
    ok((await text(page, '#cwMiss')).startsWith('256'), 'ch2b col misses = 256');
    await radio(page, 'cwCap', '2048');
    await page.waitForTimeout(100);
    ok((await text(page, '#cwSay')).includes('未发生冲突驱逐'), 'ch2b 2KB col reports cold misses without eviction');
    await radio(page, 'cwCap', '1024');
    await page.click('#cwBench');
    await page.waitForTimeout(250);
    ok((await text(page, '#cwRatio')).includes('×'), 'ch2b browser benchmark produced ratio');
    ok(!bad(await text(page, '#cwSay')), 'ch2b say clean');

    // Ch3: ijk vs tiled B=8 vs B=12
    await show(page, '#tlCv');
    await radio(page, 'tlMode', 'ijk');
    await page.waitForTimeout(100);
    ok((await text(page, '#tlMiss')).includes('4,035'), 'ch3 ijk = 4,035 misses');
    await radio(page, 'tlMode', 'tiled');
    await setRange(page, 'tlB', 2); // B=8
    await page.waitForTimeout(100);
    ok((await text(page, '#tlMiss')).includes('534'), 'ch3 tiled B=8 = 534 misses');
    await setRange(page, 'tlB', 3); // B=12 spill
    ok(!bad(await text(page, '#tlSay')), 'ch3 spill say clean');

    // Ch4: miss=0% vs miss=10% + Little's Law concurrency (including 120ns saturation at 3600 reqs)
    await show(page, '#mwCv');
    await setRange(page, 'mwMiss', 0);
    ok((await text(page, '#mwUtil')) === '100.0%', 'ch4 0% miss -> 100.0% util');
    await setRange(page, 'mwMiss', 10);
    await setRange(page, 'mwLat', 120);
    await setRange(page, 'mwReq', 3600);
    ok((await text(page, '#mwBw')).includes('100.0%'), 'ch4 120ns + 3600 reqs saturates bus');
    ok(!bad(await text(page, '#mwSay')), 'ch4 saturated say clean');

    // Ch5: default untouched f=99% P=64 already shows bus cap 16.0x vs Amdahl 39.3x
    await show(page, '#mcCv');
    ok((await text(page, '#mcAmd')) === '39.3×', 'ch5 default Amdahl = 39.3×');
    ok((await text(page, '#mcAct')) === '16.0×', 'ch5 default bus cap = 16.0×');
    await page.focus('#mcP');
    await page.keyboard.press('ArrowRight');
    ok((await text(page, '#mcPo')) === '65', 'ch5 keyboard ArrowRight increments P to 65');
    await page.click('#mcBus');
    ok((await text(page, '#mcAct')) !== '16.0×', 'ch5 without bus cap lifts ceiling');

    // Ch6: 8x8 systolic + M=512
    await show(page, '#syCv');
    await radio(page, 'syK', '8');
    await setRange(page, 'syM', 9); // 2^9 = 512
    ok((await text(page, '#syMac')) === '64', 'ch6 8x8 = 64 MACs');
    ok((await text(page, '#syAi')).includes('409.6'), 'ch6 M=512 AI = 409.6');

    // Ch7: Roofline CPU vs H100 + custom AI
    await show(page, '#rfCv');
    await radio(page, 'rfHw', 'cpu');
    ok((await text(page, '#rfRidge')).includes('12.4'), 'ch7 CPU ridge = 12.4');
    await radio(page, 'rfHw', 'h100');
    await radio(page, 'rfWk', 'gemm');
    ok(!bad(await text(page, '#rfSay')), 'ch7 compute-bound say clean');

    // Ch8: 70B OOM on H100 vs fits on B200 + explicit GB unit on capacity
    await show(page, '#lmCv');
    ok((await text(page, '#lmMem')).endsWith('80 GB'), 'ch8 lmMem shows GB unit on cap');
    await radio(page, 'lmMod', 'llama70b');
    await page.waitForTimeout(100);
    ok((await text(page, '#lmSay')).includes('装不下'), 'ch8 70B BF16 OOM on H100');
    await radio(page, 'lmHw', 'b200');
    await page.waitForTimeout(100);
    ok(!bad(await text(page, '#lmSay')), 'ch8 B200 say clean');

    // Ch9: reuse 1 (EN singular check) vs 256
    await show(page, '#enCv');
    await setRange(page, 'enReuse', 256);
    ok((await text(page, '#enMove')).includes('1.25'), 'ch9 reuse=256 move = 1.25 pJ');
    if (hasEn) {
      await page.click('#langToggle [data-lang=en]');
      await setRange(page, 'enReuse', 1);
      ok((await text(page, '#enReuseo')) === '1 use', 'ch9 EN reuse=1 shows 1 use');
      await radio(page, 'enSrc', 'sram1m');
      ok(!(await text(page, '#enSay')).includes('1 reuses'), 'ch9 EN SRAM reuse=1 avoids "1 reuses"');
      await page.click('#langToggle [data-lang=zh]');
    }

    // Ch10: frontier metric switching
    await show(page, '#frCv');
    await radio(page, 'frMet', 'cap');
    ok(!bad(await text(page, '#frSay')), 'ch10 cap say clean');
    await radio(page, 'frMet', 'ridge');
    ok(!bad(await text(page, '#frSay')), 'ch10 ridge say clean');

    ok(!page.__errors().length, 'interactive run errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // Reduced motion check
  {
    const page = await open(browser, 1280, { lang: 'zh', reduce: true });
    await show(page, '#ppCv', 150);
    await page.click('#ppPlay');
    await page.waitForTimeout(120);
    ok((await text(page, '#ppCyc')).includes('11'), 'reduced motion jumps ch1 to final cycle');
    await show(page, '#syCv', 150);
    ok(!page.__errors().length, 'reduced motion errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) {
    console.error('FAILED:\n' + fails.map(s => ' - ' + s).join('\n'));
    process.exit(1);
  }
  console.log(`PASS: browser test (${hasEn ? 'zh and en' : 'zh; copy.en.js absent'} at 1280/390/320: overflow, clipped text, 48px targets, all 10 models driven to extremes, reduced motion, 0 errors).`);
})();
