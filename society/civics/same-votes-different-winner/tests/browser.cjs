'use strict';
// Playwright smoke test. Needs Playwright on NODE_PATH and a static server at the repo root.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18885 NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
//          node society/civics/same-votes-different-winner/tests/browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18885').replace(/\/$/, '');
const url = base + '/society/civics/same-votes-different-winner/';
// copy.en.js is optional (the translator adds it later); its 404 is the one expected console error.
const expected = m => /Failed to load resource.*404/.test(m.text) && /copy\.en\.js/.test(m.url || '');

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') { const e = { text: m.text(), url: m.location().url }; if (!expected(e)) errors.push(e.text + ' @ ' + e.url); } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {}
    // record every string drawn on a canvas so English mode can be checked for leftover Chinese
    window.__ft = []; const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.push(String(t)); return f.call(this, t, ...a); }; }, opts.lang || 'zh');
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true);
  return { page, errors };
}
const text = (page, sel) => page.$eval(sel, e => e.textContent);
async function show(page, sel) { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
async function setRange(page, sel, v) { await page.$eval(sel, (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, String(v)); }

(async () => {
  const browser = await chromium.launch(); let checks = 0;
  for (const width of [1280, 390, 320]) {
    const { page, errors } = await open(browser, width);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(ov <= 0, `${width}: horizontal overflow ${ov}px`); checks++;
    const small = await page.evaluate(() => [...document.querySelectorAll('a, button, input, select, [tabindex]')].filter(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0) return false;
      if (e.tagName === 'A' && e.closest('p, li') && !e.closest('.toc')) { const rs = [...e.getClientRects()]; return rs.some(x => x.height < 48) && r.height < 48; }
      return r.width < 47.5 || r.height < 47.5;
    }).map(e => `${e.tagName}#${e.id || ''}.${e.className} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
    assert.deepEqual(small, [], `${width}: targets under 48px`); checks++;
    const visibleKeys = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && /^(ch\d+|hero|toc|rule|nav|footer|plane|cand)\.[\w.]+$/.test(e.textContent.trim())).map(e => e.textContent));
    assert.deepEqual(visibleKeys, [], 'no raw keys'); checks++;
    assert.deepEqual(errors, [], `${width}: console errors`); checks++;
    await page.close();
  }

  const { page, errors } = await open(browser, 1280);
  // language toggle: reads "中 | EN" in both languages, switches text and state
  assert.equal(await page.$eval('#langToggle', e => [...e.querySelectorAll('button')].map(b => b.textContent.trim()).join('|')), '中|EN');
  await page.click('#langToggle button[data-lang="en"]');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
  assert.equal(await page.evaluate(() => localStorage.getItem('knowledge-lang')), 'en');
  assert.equal(await page.getAttribute('#langToggle button[data-lang="en"]', 'aria-pressed'), 'true');
  assert.equal(await text(page, '#ch1 h2'), 'One group of voters, five counting methods', 'English title after switch');
  assert.equal(await page.$eval('#langToggle', e => [...e.querySelectorAll('button')].map(b => b.textContent.trim()).join('|')), '中|EN');
  await page.click('#langToggle button[data-lang="zh"]');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'zh-CN'); checks += 7;

  // hero
  assert.match(await text(page, '#heroWin'), /11 比 10/); checks++;
  // ch1: default shows three winners; move A with the keyboard
  await show(page, '#cv1');
  assert.match(await text(page, '#say1'), /3 个不同的赢家/);
  const before = await text(page, '#r1');
  const hA = (await page.$$('#st1 .handle'))[0]; await hA.focus(); for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  assert.notEqual(await text(page, '#r1'), before, 'ch1 readout reacts to moving A'); checks += 2;
  for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(100); assert.equal(await text(page, '#r1'), before, 'ch1 back to default'); checks++;
  // ch2
  await show(page, '#cv2');
  assert.match(await text(page, '#say2'), /得票最多的规则下 B 赢/);
  await setRange(page, '#s2T', 0.4); assert.match(await text(page, '#say2'), /孔多塞赢家/);
  await setRange(page, '#s2T', 0.24); checks += 2;
  await show(page, '#cv2b'); await page.click('#b2r');
  await page.waitForFunction(() => /12 \/ 12/.test(document.querySelector('#r2round').textContent), null, { timeout: 15000 });
  assert.match(await text(page, '#say2b'), /第 5 届 A 反超/); checks++;
  // ch3
  await show(page, '#cv3'); await page.click('#b3play');
  await page.waitForFunction(() => /没有任何位置/.test(document.querySelector('#say3').textContent), null, { timeout: 30000 });
  assert.match(await text(page, '#r3a'), /0\.0%/); checks++;
  await page.click('#b3m2'); await page.click('#b3step'); await page.click('#b3step');
  assert.match(await text(page, '#r3c'), /2/); assert.match(await text(page, '#r3b'), /1\.0%/); checks += 2;
  // ch4
  await show(page, '#cv4'); assert.match(await text(page, '#say4'), /多数在绕圈/);
  await page.selectOption('#v4 select[data-k="2"]', '0'); assert.match(await text(page, '#say4'), /孔多塞赢家/); checks += 2;
  await setRange(page, '#s4n', 31); assert.match(await text(page, '#r4p'), /31 人时出现循环：8\.5%/); checks++;
  // ch5
  await show(page, '#cv5'); assert.match(await text(page, '#r5b'), /9 人/);
  await page.click('#seg5 button[data-rule="runoff"]'); assert.match(await text(page, '#r5b'), /2 人/);
  await page.click('#b5apply'); assert.equal(await page.getAttribute('#b5apply', 'aria-pressed'), 'true');
  await page.click('#seg5 button[data-rule="condorcet"]'); assert.match(await text(page, '#say5'), /孔多塞赢家/); checks += 4;
  // ch6
  await show(page, '#cv6'); await setRange(page, '#s6r', 0.3); assert.match(await text(page, '#say6'), /认可票最多的是 C/); checks++;
  // ch7
  await show(page, '#cv7'); assert.match(await text(page, '#say7'), /阿拉巴马反而少了一席/);
  await page.click('#b7hh'); assert.match(await text(page, '#r7list'), /从没/); await page.click('#b7ham'); checks += 2;
  // ch8
  await show(page, '#cv8'); await page.click('#seg8 button[data-map="crackGold"]'); assert.match(await text(page, '#r8a'), /金 1 席/);
  await page.focus('#cv8'); await page.click('#pal8 button[data-d="8"]'); await page.focus('#cv8'); await page.keyboard.press('Space');
  assert.match(await text(page, '#say8'), /没画完/); checks += 2;
  // ch9
  await show(page, '#cv9'); await setRange(page, '#s9c', 0.3); assert.match(await text(page, '#say9'), /60%/);
  await setRange(page, '#s9p', 0.45); await setRange(page, '#s9c', 0); assert.match(await text(page, '#say9'), /越确定地判错/); checks += 2;
  assert.deepEqual(errors, [], 'console errors while driving models'); checks++;
  await page.close();

  // English: same layout checks, no CJK left anywhere visible (DOM text, attributes, title, canvas labels), models drive
  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
  for (const width of [1280, 390, 320]) {
    const { page: ep, errors: ee } = await open(browser, width, { lang: 'en' });
    assert.equal(await ep.evaluate(() => document.documentElement.lang), 'en');
    const ov = await ep.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(ov <= 0, `en ${width}: horizontal overflow ${ov}px`); checks++;
    const small = await ep.evaluate(() => [...document.querySelectorAll('a, button, input, select, [tabindex]')].filter(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0) return false;
      if (e.tagName === 'A' && e.closest('p, li') && !e.closest('.toc')) { const rs = [...e.getClientRects()]; return rs.some(x => x.height < 48) && r.height < 48; }
      return r.width < 47.5 || r.height < 47.5; }).map(e => `${e.tagName}#${e.id}`));
    assert.deepEqual(small, [], `en ${width}: targets under 48px`); checks++;
    // scroll every canvas into view so it draws, then collect everything a reader or screen reader could meet
    for (const id of ['cv1', 'cv2', 'cv2b', 'cv3', 'cv4', 'cv4b', 'cv5', 'cv6', 'cv7', 'cv8', 'cv9']) { await ep.$eval('#' + id, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await ep.waitForTimeout(150); }
    await ep.click('#b3m2'); await ep.waitForTimeout(150); await ep.click('#b7hh'); await ep.waitForTimeout(150);
    const leaks = await ep.evaluate(re => { const R = new RegExp(re); const out = [];
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const el = n.parentElement; if (!el || el.closest('#langToggle')) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; if (R.test(n.textContent)) out.push('text: ' + n.textContent.trim().slice(0, 60)); }
      document.querySelectorAll('[aria-label], [title], [alt], [placeholder]').forEach(e => ['aria-label', 'title', 'alt', 'placeholder'].forEach(a => { const v = e.getAttribute(a); if (v && R.test(v)) out.push(a + ': ' + v.slice(0, 60)); }));
      if (R.test(document.title)) out.push('title: ' + document.title);
      const md = document.querySelector('meta[name=description]'); if (md && R.test(md.content)) out.push('meta description');
      window.__ft.forEach(t => { if (R.test(t)) out.push('canvas: ' + t); });
      return [...new Set(out)]; }, CJK.source);
    assert.deepEqual(leaks, [], `en ${width}: Chinese visible in English mode`); checks++;
    const fills = await ep.evaluate(() => window.__ft.length); assert.ok(fills > 50, 'canvases drew text'); checks++;
    if (width === 1280) {
      assert.match(await text(ep, '#heroWin'), /11 to 10/);
      await show(ep, '#cv1'); assert.match(await text(ep, '#say1'), /3 different winners/);
      await show(ep, '#cv2'); assert.match(await text(ep, '#say2'), /under plurality, B wins/);
      await show(ep, '#cv5'); await ep.click('#seg5 button[data-rule="irv"]'); assert.match(await text(ep, '#say5'), /0\.36, 0\.36/);
      await show(ep, '#cv7'); await ep.click('#b7ham'); assert.match(await text(ep, '#say7'), /Alabama actually loses a seat/);
      await show(ep, '#cv9'); await setRange(ep, '#s9p', 0.45); assert.match(await text(ep, '#say9'), /majority is right only/); checks += 6;
    }
    assert.deepEqual(ee, [], `en ${width}: console errors`); checks++;
    await ep.close();
  }

  // reduced motion: the desertion run is shown complete at once
  const r = await open(browser, 390, { reduce: true });
  await show(r.page, '#cv2b'); assert.match(await text(r.page, '#r2round'), /12 \/ 12/);
  await show(r.page, '#cv3'); await r.page.click('#b3play'); assert.match(await text(r.page, '#say3'), /没有任何位置/);
  assert.equal(await r.page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.deepEqual(r.errors, []); checks += 4;
  await browser.close();
  console.log(`same-votes-different-winner browser: ${checks} checks passed (${url})`);
})().catch(e => { console.error(e); process.exit(1); });
