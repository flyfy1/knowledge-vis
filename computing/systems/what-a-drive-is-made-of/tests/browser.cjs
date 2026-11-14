'use strict';
// Browser smoke test for "What a drive is made of".
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18901 NODE_PATH=/Users/songyy/fast/integ-life/integ-games/node_modules \
//   node computing/systems/what-a-drive-is-made-of/tests/browser.cjs
// (AGENTS.md names ~/Documents/integ-life/integ-games/node_modules; on this machine Playwright lives under ~/fast/.)
// Optional SHOT_DIR=/tmp/... writes screenshots (never into the repo): full pages at each width, and each figure.
// Checks in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box,
// every control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled.
// English: while copy.en.js is the same-keys stub (values still Chinese) the CJK sweep is skipped but the toggle,
// html[lang], storage and absence of errors are checked; once it is translated, no CJK may be visible in text,
// aria-labels, the title, the meta description or any canvas string, apart from the 中 toggle and the hidden Chinese
// half of the site's provenance label. Then keyboard operation, each model driven in zh, and reduced motion.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18901').replace(/\/$/, '');
const url = base + '/computing/systems/what-a-drive-is-made-of/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { window.__ft = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
// html { scroll-behavior: smooth } makes scrollIntoView animate for up to about a second; wait until scrollY has
// not moved for three frames, so later clicks and canvas reads see the page at rest (2026-11-15: a forced click
// during the animation missed its radio once in ch2 and the readout kept its old value).
const settle = page => page.evaluate(() => new Promise(r => { let y = scrollY, n = 0; const f = () => { if (scrollY === y) { if (++n >= 3) return r(); } else { y = scrollY; n = 0; } requestAnimationFrame(f); }; requestAnimationFrame(f); }));
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await settle(page); if (ms) await page.waitForTimeout(ms); };
// click the visible 48 px label (Playwright waits for it to be stable), then wait until the radio is checked
const pick = async (page, name, value) => {
  const sel = `input[name=${name}][value="${value}"]`;
  await page.click(`label:has(> ${sel})`);
  await page.waitForFunction(s => document.querySelector(s).checked, sel, { timeout: 5000 });
};

(async () => {
  const browser = await chromium.launch();
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    const stub = await page.evaluate(() => { const E = window.ESSAY_COPY; return !E.en || E.en['hero.title'] === E.zh['hero.title']; });
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' || stub ? (lang === 'zh' ? 'zh-CN' : 'en') : 'en'), `${tag}: html lang`);
    for (const fig of await page.$$('figure')) {
      await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250);
      if (SHOT) { const id = await fig.evaluate(e => e.closest('section').id + '-' + [...e.closest('section').querySelectorAll('figure')].indexOf(e)); await fig.screenshot({ path: `${SHOT}/fig-${id}-${lang}-${width}.png` }); }
    }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.lay td')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10 || /\{\w+\}/.test(e.textContent)).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty or with unfilled placeholders: ${emptySay.join(', ')}`);
    if (lang === 'en') {
      ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', `${tag}: EN pressed`);
      if (!stub) {
        for (const [id, vals] of [['secO', [0, 80]], ['skS', [2, 100]], ['smB', [1, 100]], ['vtW', [0, 5000]], ['ecT', [8, 120]], ['eeS', [12, 30]]]) {
          await show(page, '#' + id); for (const v of vals) { await setRange(page, id, v); await page.waitForTimeout(120); }
        }
        const leftovers = await page.evaluate(re => {
          const rx = new RegExp(re), out = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n; (n = walker.nextNode());) {
            const el = n.parentElement; if (!rx.test(n.textContent)) continue;
            if (el.closest('#langToggle') && n.textContent.trim() === '中') continue;
            const pz = el.closest('.page-provenance .provenance-zh'); if (pz && getComputedStyle(pz).display === 'none') continue;
            out.push('text "' + n.textContent.trim().slice(0, 24) + '"');
          }
          for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria ' + e.getAttribute('aria-label').slice(0, 24));
          if (rx.test(document.title)) out.push('title');
          const md = document.querySelector('meta[name=description]'); if (md && rx.test(md.content)) out.push('meta description');
          for (const t of window.__ft) if (rx.test(t)) out.push('canvas "' + t + '"');
          return out.slice(0, 8);
        }, CJK.source);
        ok(!leftovers.length, `${tag}: Chinese left in English mode: ${leftovers.join(' | ')}`);
      }
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')) === '硬盘里到底是什么', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'EN sets html lang');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // ch1: keyboard on the offset slider; 63 misaligned, 64 aligned
    await show(page, '#secCv', 200);
    ok((await text(page, '#secT')) === '2 个' && (await text(page, '#secR')) === '8 KiB', 'ch1 default 63 straddles two sectors');
    await page.focus('#secO'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    ok((await text(page, '#secOo')) === '64' && (await text(page, '#secA')) === '对齐', 'ch1 keyboard to 64 → aligned, got ' + await text(page, '#secA'));

    // ch2
    await show(page, '#skCv', 200);
    ok((await text(page, '#skT')) === '12.7 毫秒' && (await text(page, '#skI')) === '79', 'ch2 default 12.7 ms / 79 IOPS, got ' + await text(page, '#skT'));
    await pick(page, 'skR', '15000'); await page.waitForTimeout(80);
    ok((await text(page, '#skI')) === '95', 'ch2 15k rpm 95 IOPS');
    await setRange(page, 'skS', 10); await page.waitForTimeout(80);
    ok((await text(page, '#skSeek')) === '3.1 毫秒', 'ch2 10% span seek 3.1 ms, got ' + await text(page, '#skSeek'));
    await pick(page, 'skR', '5400'); await setRange(page, 'skS', 3); await page.waitForTimeout(80);
    ok((await page.$eval('#skSay', e => e.textContent)).includes('转动等待成了大头'), 'ch2 5400/3% rotation dominates');

    // ch3
    await show(page, '#smCv', 200);
    ok((await text(page, '#smG')) === '22%' && (await text(page, '#smX')) === '11 倍', 'ch3 default 22% / 11×');
    await setRange(page, 'smB', 100); await page.waitForTimeout(80);
    ok((await text(page, '#smX')) === '101 倍', 'ch3 B=100 → 101×');

    // ch4
    await show(page, '#vtCv', 200);
    ok((await text(page, '#vtD')) === '857 mV', 'ch4 TLC spacing 857 mV');
    await pick(page, 'vtN', '5'); await page.waitForTimeout(80);
    ok(!(await page.$eval('#vtSay', e => e.textContent)).includes('低于'), 'ch4 PLC not below the limit');
    await setRange(page, 'vtW', 0); await page.waitForTimeout(60);
    ok((await page.$eval('#vtSay', e => e.textContent)).includes('超过'), 'ch4 PLC over the limit when new');

    // ch5
    await show(page, '#ecCv', 200);
    ok((await text(page, '#ecQl')) === '179 次', 'ch5 QLC 179 cycles, got ' + await text(page, '#ecQl'));
    await setRange(page, 'ecT', 8); await page.waitForTimeout(80);
    ok((await page.$eval('#ecSay', e => e.textContent)).includes('QLC 和 PLC 新的时候就扛不住'), 'ch5 t=8 QLC fails');
    await show(page, '#lfY');
    ok((await text(page, '#lfY')) === '4.5 年', 'ch5 TLC life 4.5 years, got ' + await text(page, '#lfY'));
    ok((await text(page, '#lfA55')) === '24.7 倍', 'ch5 Ea 1.1 → 55 °C ×24.7, got ' + await text(page, '#lfA55'));

    // ch6
    await show(page, '#ftlGrid', 100);
    ok((await page.$$eval('#ftlGrid .pg.invalid', e => e.length)) === 3, 'ch6 starts with 3 invalid pages');
    await page.click('#ftlW'); await page.waitForTimeout(50);
    ok((await text(page, '#ftlH')) === '1', 'ch6 write counts one host page');
    for (let i = 0; i < 10; i++) await page.click('#ftlR20');
    ok(parseFloat(await text(page, '#ftlRa')) > 2, 'ch6 ratio over 2 after 200 random writes, got ' + await text(page, '#ftlRa'));
    ok((await page.$eval('#ftlSay', e => e.textContent)).includes('垃圾回收已经做了'), 'ch6 GC sentence');
    await page.click('#ftlX'); await page.waitForTimeout(50);
    ok((await text(page, '#ftlH')) === '0', 'ch6 reset');

    // ch7
    await show(page, '#mpT', 100);
    ok((await page.$eval('#mpSay', e => e.textContent)).includes('电脑认不出这块盘'), 'ch7 default M.2 SATA in PCIe-only slot');
    await pick(page, 'mpD', 'ssd25'); await pick(page, 'mpS', 'sasBay'); await page.waitForTimeout(50);
    ok((await page.$eval('#mpSay', e => e.textContent)).includes('STP'), 'ch7 SATA in SAS bay');
    await pick(page, 'mpD', 'sas25'); await pick(page, 'mpS', 'sataPort'); await page.waitForTimeout(50);
    ok((await page.$$eval('#mpT td.n', e => e.length)) === 1 && (await page.$$eval('#mpT td.s', e => e.length)) === 3, 'ch7 SAS in SATA: one red layer, three skipped');

    // ch8
    await show(page, '#eeCv', 200);
    ok((await text(page, '#eeH')) === '12.7 毫秒' && (await text(page, '#eeA')) === '84 微秒', 'ch8 4 KiB times');
    await setRange(page, 'eeS', 30); await page.waitForTimeout(80);
    ok((await text(page, '#eeN')) === '0.14 秒' || (await text(page, '#eeN')) === '144 毫秒', 'ch8 1 GiB NVMe, got ' + await text(page, '#eeN'));
    ok((await page.$eval('#eeSay', e => e.textContent)).includes('搬上了'), 'ch8 1 GiB bandwidth sentence');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates on this page, every figure is drawn once on screen
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#skCv', 300);
    ok(await page.$eval('#skCv', c => c.width > 1), 'reduced motion: ch2 drawn');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, raw keys, readouts, live sentences, English CJK sweep when translated; toggle, keyboard, all eight figures driven in zh, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
