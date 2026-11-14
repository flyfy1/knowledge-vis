'use strict';
// Browser smoke test for the network-storage essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18908 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/storage-over-a-network/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled. Then the
// language toggle (if copy.en.js were ever a stub again, the page must fall back to Chinese and say so in <html lang>),
// keyboard operation of a slider, each of the nine models responding to its controls with the numbers the models give,
// and reduced motion (no smooth scroll; the ch4 link does not animate). The width sweep runs in both languages and in
// English checks that no Chinese is left, including canvas text.
// Controls are driven as a reader would: radios and checkboxes by clicking their visible pill or label (no forced
// clicks on the 1-px inputs), and every assertion first waits for its condition (up to 3 s) instead of a fixed sleep.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18908').replace(/\/$/, '');
const url = base + '/computing/systems/storage-over-a-network/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
// the readout's number equals the model's value to the precision shown on the page
const num = s => { const m = String(s).replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? { v: +m[0], d: m[1] ? m[1].length - 1 : 0 } : null; };
const same = (s, v) => { const q = num(s); return !!q && Math.abs(q.v - v) <= 0.5 * Math.pow(10, -q.d) + 1e-9; };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
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
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
// click the visible pill (actionability checks on), then wait until the input really is checked
const pick = async (page, name, value) => {
  const sel = `input[name=${name}][value="${value}"]`;
  await page.click(`label:has(> ${sel})`);
  await page.waitForFunction(s => document.querySelector(s).checked, sel, { timeout: 3000 });
};
const tick = async (page, sel, on) => {
  if ((await page.$eval(sel, e => e.checked)) !== on) await page.click(`label:has(> ${sel})`);
  await page.waitForFunction(([s, v]) => document.querySelector(s).checked === v, [sel, on], { timeout: 3000 });
};
// wait (up to 3 s) until every [selector, predicate-on-text] pair holds; the ok() that follows reports what it saw
const until = async (page, pairs) => {
  for (let i = 0; i < 60; i++) {
    let all = true;
    for (const [sel, pred] of pairs) { const v = await text(page, sel); if (!(typeof pred === 'function' ? pred(v) : v === pred)) { all = false; break; } }
    if (all) return; await page.waitForTimeout(50);
  }
};
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

(async () => {
  const browser = await chromium.launch();
  const stub = await (async () => { const p = await open(browser, 1280); const s = await p.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.enStub)); await p.close(); return s; })();
  const langs = stub ? ['zh'] : ['zh', 'en'];
  if (stub) console.log('NOTE: copy.en.js is a stub; English width sweep skipped');

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of langs) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fam td')].filter(e => {
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
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b, .ctl output')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const canvasKeys = await page.evaluate(() => [...window.__ft].filter(s => /^[a-z]\w*(\.\w+)+$/i.test(s) || /\{\w+\}/.test(s)));
    ok(!canvasKeys.length, `${tag}: raw keys or placeholders on canvas: ${canvasKeys.join(', ')}`);
    if (lang === 'en') {
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
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas "' + t + '"');
        return out.slice(0, 8);
      }, CJK.source);
      ok(!leftovers.length, `${tag}: Chinese left in English mode: ${leftovers.join(' | ')}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
    await page.close();
  }

  {
    const page = await open(browser, 1280);
    ok((await text(page, 'h1')) === '隔着网线的硬盘', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    const P = M.prose();
    ok((await page.$eval('#ch3', e => e.textContent)).includes('共 ' + zf(P.i0rt[0], 0) + ' 个来回'), 'ch3 prose quotes the model round trips');
    ok((await page.$eval('#ch5', e => e.textContent)).includes('闪存盘占 ' + zf(P.bnS[0] * 100, 0) + '%'), 'ch5 prose quotes the NAND network share');

    // ch1 three levels: keyboard on the slider
    await show(page, '#lvCv', 200);
    ok((await text(page, '#lvB')) === '8 KiB' && (await text(page, '#lvF')) === '1 字节' && (await text(page, '#lvO')) === '16 MiB', 'ch1 defaults, got ' + await text(page, '#lvB') + ' / ' + await text(page, '#lvO'));
    await page.focus('#lvK'); for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowRight'); await until(page, [['#lvKo', '4 KiB'], ['#lvB', '4 KiB']]);
    ok((await text(page, '#lvKo')) === '4 KiB' && (await text(page, '#lvB')) === '4 KiB', 'ch1 slider by keyboard to 4 KiB: aligned block, got ' + await text(page, '#lvKo') + ' ' + await text(page, '#lvB'));
    await tick(page, '#lvC', true); await setRange(page, 'lvK', 0); await until(page, [['#lvB', '4 KiB'], ['#lvO', '8 MiB']]);
    ok((await text(page, '#lvB')) === '4 KiB' && (await text(page, '#lvO')) === '8 MiB', 'ch1 cached halves block and object');

    // ch2 small files
    await show(page, '#nsCv', 200);
    ok(same(await text(page, '#nsT'), P.nasT[0]), 'ch2 default total, got ' + await text(page, '#nsT'));
    await setRange(page, 'nsR', 10); await until(page, [['#nsT', v => same(v, M.NAS.run(1000, 64, 30, 3, 1, 1).T)]]);
    ok(same(await text(page, '#nsT'), M.NAS.run(1000, 64, 30, 3, 1, 1).T), 'ch2 30 ms total, got ' + await text(page, '#nsT'));
    await pick(page, 'nsP', '16'); await until(page, [['#nsT', v => same(v, M.NAS.run(1000, 64, 30, 3, 16, 1).T)]]);
    ok(same(await text(page, '#nsT'), M.NAS.run(1000, 64, 30, 3, 16, 1).T), 'ch2 16 in flight, got ' + await text(page, '#nsT'));

    // ch3 iSCSI
    await show(page, '#isCv', 200);
    ok((await text(page, '#isRt')) === zf(P.i0rt[0], 0) && (await text(page, '#isPdu')) === zf(P.i0pdu[0], 0), 'ch3 defaults rounds/PDUs');
    await setRange(page, 'isR', 8); await until(page, [['#isT', v => same(v, P.iWT[0])]]);
    ok(same(await text(page, '#isT'), P.iWT[0]), 'ch3 10 ms time, got ' + await text(page, '#isT'));
    await pick(page, 'isP', 'big'); await until(page, [['#isRt', '1']]);
    ok((await text(page, '#isRt')) === '1', 'ch3 big profile: one round');

    // ch4 FC: animates, credits
    await show(page, '#fcCv', 300);
    ok((await text(page, '#fcN')) === zf(P.fcNeed[0], 0) && (await text(page, '#fcU')) === zf(P.fcUtil[0] * 100, 0) + '%', 'ch4 defaults need/util, got ' + await text(page, '#fcN') + ' ' + await text(page, '#fcU'));
    const a = await canvasHash(page, 'fcCv'); await page.waitForTimeout(600); ok(a !== await canvasHash(page, 'fcCv'), 'ch4 link animates');
    await setRange(page, 'fcC', 14); await until(page, [['#fcU', '100%']]);
    ok((await text(page, '#fcU')) === '100%', 'ch4 2000 credits fill 50 km');

    // ch5 budget
    await show(page, '#bdCv', 200);
    ok((await text(page, '#bdSh')) === zf(P.bnS[0] * 100, 0) + '%', 'ch5 NAND tcp kernel share');
    await pick(page, 'bdM', 'hdd'); await until(page, [['#bdSh', zf(P.bhS[0] * 100, 2) + '%']]);
    ok((await text(page, '#bdSh')) === zf(P.bhS[0] * 100, 2) + '%', 'ch5 HDD share, got ' + await text(page, '#bdSh'));
    await pick(page, 'bdM', 'ull'); await pick(page, 'bdT', 'rdmaSpdk'); await until(page, [['#bdSh', zf(P.bruS[0] * 100, 0) + '%']]);
    ok((await text(page, '#bdSh')) === zf(P.bruS[0] * 100, 0) + '%', 'ch5 ULL RDMA share');
    await setRange(page, 'bdD', 100); await pick(page, 'bdT', 'local'); await until(page, [['#bdSh', '0%']]);
    ok((await text(page, '#bdSh')) === '0%' && (await text(page, '#bdSay')).includes('本机'), 'ch5 local drive ignores distance, got ' + await text(page, '#bdSh'));

    // ch6 loss
    await show(page, '#lsCv', 200);
    ok((await text(page, '#lsW')) === zf(P.lW[0], 0) && (await text(page, '#lsGbn')) === zf(P.l3g[0] * 100, 0) + '%', 'ch6 defaults');
    await setRange(page, 'lsP', -2); await until(page, [['#lsGbn', zf(P.l2g[0] * 100, 0) + '%']]);
    ok((await text(page, '#lsGbn')) === zf(P.l2g[0] * 100, 0) + '%', 'ch6 1% loss');

    // ch7 capsules
    await show(page, '#cpCv', 200);
    ok((await text(page, '#cpM')) === zf(P.ctM[0], 0) && (await text(page, '#cpRt')) === '1', 'ch7 tcp read');
    await pick(page, 'cpO', 'write'); await tick(page, '#cpI', false); await until(page, [['#cpRt', zf(P.cwtRt[0], 0)]]);
    ok((await text(page, '#cpRt')) === zf(P.cwtRt[0], 0), 'ch7 tcp write without ICD: 2 round trips');
    await pick(page, 'cpT', 'iscsi'); await pick(page, 'cpS', '65536'); await until(page, [['#cpM', v => +v > 10]]);
    ok(+(await text(page, '#cpM')) > 10, 'ch7 iSCSI 64 KiB write has many messages');

    // ch8 multipath
    await show(page, '#mpCv', 200);
    ok(same(await text(page, '#mpO'), P.mpOpt[0]) && (await text(page, '#mpF')) === '∞', 'ch8 defaults, got ' + await text(page, '#mpO') + ' ' + await text(page, '#mpF'));
    await setRange(page, 'mpL', 45); await until(page, [['#mpF', v => same(v, P.mp45F[0])]]);
    ok(same(await text(page, '#mpF'), P.mp45F[0]), 'ch8 failover at 45k, got ' + await text(page, '#mpF'));
    await setRange(page, 'mpQ', 0.2); await setRange(page, 'mpL', 145); await until(page, [['#mpS', '—']]);
    ok((await text(page, '#mpS')) === '—' && (await text(page, '#mpSay')).includes('怎么分都接不住'), 'ch8 beyond both paths, got ' + await text(page, '#mpSay'));

    // ch9 EC
    await show(page, '#ecCv', 200);
    ok((await text(page, '#ecO')) === zf(P.e10o[0], 1) + ' 倍' && (await text(page, '#ecN')) === zf(P.e10n[0], 1) + ' 个 9', 'ch9 RS(10,4) defaults, got ' + await text(page, '#ecO') + ' ' + await text(page, '#ecN'));
    await pick(page, 'ecS', 'rep3'); await until(page, [['#ecN', zf(P.e3n[0], 1) + ' 个 9']]);
    ok((await text(page, '#ecN')) === zf(P.e3n[0], 1) + ' 个 9', 'ch9 3x');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; the FC link is still
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#fcCv', 400);
    const a = await canvasHash(page, 'fcCv'); await page.waitForTimeout(700);
    ok(a === await canvasHash(page, 'fcCv'), 'reduced motion: ch4 link is still');
    ok((await text(page, '#fcU')).length > 0, 'reduced motion: ch4 readouts filled');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences; language toggle, keyboard, label clicks with condition waits, all nine models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
