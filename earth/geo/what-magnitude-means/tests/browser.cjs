#!/usr/bin/env node
/* Browser smoke test for “what magnitude means”.
 * ESSAY_BASE_URL=http://127.0.0.1:18965 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node earth/geo/what-magnitude-means/tests/browser.cjs
 * Optional SHOT_DIR=/tmp/... writes full-page screenshots there (never into the repo). */
'use strict';
const { chromium } = require('playwright');
const BASE = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18965').replace(/\/$/, '');
const URL = BASE + '/earth/geo/what-magnitude-means/';
const SHOT = process.env.SHOT_DIR || '';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const BAD = /NaN|undefined|Infinity|\{\w+\}/;

async function open(b, width, opts = {}) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage(), errs = [];
  p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  p.on('pageerror', e => errs.push(e.message));
  p.on('requestfailed', r => { if (!/copy\.en\.js/.test(r.url())) errs.push('request failed ' + r.url()); });
  p.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
  await p.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await p.goto(URL); await p.waitForFunction(() => window.__essayReady);
  return { ctx, p, errs };
}
// bring every figure on screen once so the lazy models run, then come back
async function visitAll(p) {
  const n = await p.$$eval('figure', f => f.length);
  for (let i = 0; i < n; i++) { await p.$$eval('figure', (f, i) => f[i].scrollIntoView({ block: 'center' }), i); await p.waitForTimeout(250); }
}
async function layout(p, tag) {
  const r = await p.evaluate(() => {
    const out = { over: document.documentElement.scrollWidth - innerWidth, clipped: [], small: [], sayBad: [] };
    for (const e of document.querySelectorAll('h1,h2,h3,p,li,label,button,figcaption,.read b,.read span,.out,.say,a')) {
      const cs = getComputedStyle(e); if (cs.display === 'none' || e.offsetParent === null) continue;
      if (e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'visible' && cs.overflowX !== '') out.clipped.push(e.id || e.textContent.slice(0, 30));
      const rc = e.getBoundingClientRect(); if (rc.right > innerWidth + 1 || rc.left < -1) out.clipped.push('offscreen:' + (e.id || e.textContent.slice(0, 30)));
    }
    for (const e of document.querySelectorAll('button, input, select, [role=button], label.chip, .ctl label')) {
      if (e.offsetParent === null) continue; const rc = e.getBoundingClientRect();
      if (e.type === 'radio' || e.type === 'checkbox') { const l = e.closest('label'); const q = l ? l.getBoundingClientRect() : rc; if (q.height < 48) out.small.push((e.id || e.name) + ' ' + q.height.toFixed(0)); continue; }
      if (rc.height < 48 || (e.tagName === 'BUTTON' && rc.width < 48)) out.small.push((e.id || e.className || e.tagName) + ' ' + rc.width.toFixed(0) + '×' + rc.height.toFixed(0));
    }
    for (const e of document.querySelectorAll('[id$=Say], .read b')) if (/NaN|undefined|Infinity|\{\w+\}/.test(e.textContent)) out.sayBad.push(e.id + ': ' + e.textContent);
    return out;
  });
  ok(r.over <= 0, `${tag}: no horizontal overflow (${r.over})`);
  ok(!r.clipped.length, `${tag}: no clipped text ${r.clipped.slice(0, 5).join(' | ')}`);
  ok(!r.small.length, `${tag}: targets ≥ 48 px ${r.small.slice(0, 6).join(' | ')}`);
  ok(!r.sayBad.length, `${tag}: live text clean ${r.sayBad.join(' | ')}`);
}
const say = (p, id) => p.$eval('#' + id, e => e.textContent);
async function setRange(p, id, v) { await p.$eval('#' + id, (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, String(v)); await p.waitForTimeout(60); }
async function extremes(p, id, sayId, tag) {
  const [mn, mx] = await p.$eval('#' + id, e => [e.min, e.max]); const seen = [];
  for (const v of [mn, mx]) { await setRange(p, id, v); const s = await say(p, sayId); seen.push(s); ok(!BAD.test(s) && s.length > 8, `${tag} ${id}=${v}: ${s.slice(0, 80)}`); }
  return seen;
}

(async () => {
  const b = await chromium.launch();
  for (const width of [1280, 390, 320]) {
    const { ctx, p, errs } = await open(b, width);
    await visitAll(p);
    await layout(p, `zh ${width}`);
    ok(await p.evaluate(() => document.documentElement.lang) === 'zh-CN', 'html lang zh-CN');
    ok(/7 级/.test(await p.title()), 'Chinese title');
    if (SHOT) await p.screenshot({ path: `${SHOT}/browser-${width}.png`, fullPage: true });
    if (width === 1280) {
      // drive every model at its extremes
      for (const [ids, sayId] of [[['bkV', 'bkD'], 'bkSay'], [['mgL', 'mgW', 'mgD'], 'mgSay'], [['inM', 'inH', 'inR'], 'inSay'], [['lcX', 'lcY'], 'lcSay'], [['wnN', 'wnP', 'wnH', 'wnD'], 'wnSay'], [['shA'], 'shSay'], [['grM'], 'grSay'], [['afMm', 'afM', 'afS', 'afT'], 'afSay'], [['clS', 'clW'], 'clSay']]) {
        await p.$eval('#' + sayId, e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
        for (const id of ids) await extremes(p, id, sayId, 'zh');
      }
      // ch2: smallest fault reads as smaller, largest as bigger
      await setRange(p, 'mgL', 0); await setRange(p, 'mgW', 0); await setRange(p, 'mgD', 0); ok(/小/.test(await say(p, 'mgSay')), 'ch2 small fault → smaller');
      await setRange(p, 'mgL', 36); await setRange(p, 'mgW', 27); await setRange(p, 'mgD', 36); ok(/大/.test(await say(p, 'mgSay')), 'ch2 big fault → bigger');
      // ch3 radios and checkbox
      for (const v of ['2', '4', '1']) { await p.click(`input[name=inG][value="${v}"]`, { force: true }).catch(() => p.$eval(`input[name=inG][value="${v}"]`, e => { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); })); }
      await p.$eval('#inCmp', e => { e.click(); }); ok(!/5\.5/.test(await say(p, 'inSay')), 'ch3 compare sentence hidden when unchecked'); await p.$eval('#inCmp', e => e.click());
      // ch4 deep source: no blind zone sentence
      await setRange(p, 'wnN', 2); await setRange(p, 'wnP', 1); await setRange(p, 'wnH', 40); await setRange(p, 'wnD', 100);
      ok(/没有盲区/.test(await say(p, 'wnSay')), 'ch4 deep source → no blind zone');
      await setRange(p, 'wnN', 40); await setRange(p, 'wnP', 10); await setRange(p, 'wnH', 5); await setRange(p, 'wnD', 0);
      ok(/盲区里/.test(await say(p, 'wnSay')), 'ch4 near city → in blind zone');
      // ch4a run the waves
      await p.$eval('#lcGo', e => e.scrollIntoView({ block: 'center' })); await p.click('#lcGo'); await p.waitForTimeout(1200);
      ok(/秒/.test(await p.$eval('#lcClock', e => e.textContent)), 'ch4 wave clock runs');
      // keyboard on the map
      await setRange(p, 'lcX', 100); await p.focus('#lcCv'); await p.keyboard.press('ArrowRight'); ok(await p.$eval('#lcX', e => +e.value) > 100, 'map arrow keys move the epicentre');
      // ch6 model set
      await p.$eval('#grSet input[value=model], input[name=grSet][value=model]', e => { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); });
      await p.waitForTimeout(300);
      for (const v of [5, 9]) { await setRange(p, 'grM', v); const s = await say(p, 'grSay'); ok(/木块/.test(s) && !BAD.test(s), 'ch6 model ' + v + ': ' + s.slice(0, 60)); }
      // ch7 roll
      await p.click('#afRoll'); ok(!BAD.test(await say(p, 'afSay')), 'ch7 roll');
      // ch8: reveal twice, score counts
      await setRange(p, 'clS', 0); await setRange(p, 'clW', 30);
      await p.$eval('#clGo', e => e.scrollIntoView({ block: 'center' })); await p.click('#clGo'); await p.waitForFunction(() => !document.querySelector('#clGo').disabled, null, { timeout: 15000 });
      ok(/猜中|没猜中/.test(await say(p, 'clSay')), 'ch8 reveal result');
      ok(/^1 \/ 1$|^0 \/ 1$/.test(await p.$eval('#clScore', e => e.textContent.trim())), 'ch8 score counts one try');
      await p.click('#clPer'); await p.waitForFunction(() => !document.querySelector('#clGo').disabled, null, { timeout: 15000 });
      ok(/\/ 2$/.test(await p.$eval('#clScore', e => e.textContent.trim())), 'ch8 periodic guess counts');
      // keyboard focus is visible on a slider and a button
      for (const sel of ['#bkV', '#shPlay']) {
        await p.focus(sel); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); const o = await p.$eval(sel, e => { const cs = getComputedStyle(e); return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 || cs.boxShadow !== 'none'; });
        ok(o, 'visible focus on ' + sel);
      }
      // language toggle without copy.en.js: stays readable, no crash
      await p.click('#langToggle button[data-lang=en]'); await p.waitForTimeout(200);
      const hasEn = await p.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
      if (!hasEn) ok(/7 级/.test(await p.$eval('h1', e => e.textContent)), 'EN without copy.en.js falls back to Chinese');
      else {
        const cjk = await p.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const bad = []; while (w.nextNode()) { const n = w.currentNode; if (/[一-鿿]/.test(n.textContent) && !n.parentElement.closest('#langToggle') && n.parentElement.offsetParent !== null) bad.push(n.textContent.trim().slice(0, 30)); } return bad; });
        ok(!cjk.length, 'no CJK in English mode ' + cjk.slice(0, 5).join(' | '));
      }
      await p.click('#langToggle button[data-lang=zh]'); await p.waitForTimeout(200);
      ok(/7 级/.test(await p.$eval('h1', e => e.textContent)), 'back to Chinese');
      ok(await p.$eval('#langToggle', e => [...e.querySelectorAll('button')].map(x => x.textContent.trim()).join('|')) === '中|EN', 'toggle reads 中 | EN (the bar is the divider border)');
    }
    ok(!errs.length, `zh ${width}: no console errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  // reduced motion: models jump to their end state and stay still
  {
    const { ctx, p, errs } = await open(b, 1280, { reduce: true });
    await visitAll(p);
    await p.$eval('#shCv', e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
    const y1 = await p.$eval('#shYears', e => e.textContent); await p.waitForTimeout(800); const y2 = await p.$eval('#shYears', e => e.textContent);
    ok(y1 === y2 && /500/.test(y1), 'reduced: sheet static at 500 years (' + y1 + ')');
    await p.click('#shPlay'); ok(/600/.test(await p.$eval('#shYears', e => e.textContent)), 'reduced: step button adds 100 years');
    ok(await p.$eval('#shFast', e => e.disabled), 'reduced: fast-forward disabled');
    await p.$eval('#bkCv', e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
    ok(/攒力中/.test(await say(p, 'bkSay')), 'reduced: block shows a finished sawtooth');
    await p.$eval('#lcGo', e => e.scrollIntoView({ block: 'center' })); await p.click('#lcGo'); await p.waitForTimeout(200);
    ok(!BAD.test(await say(p, 'lcSay')), 'reduced: wave end state');
    await p.$eval('#clGo', e => e.scrollIntoView({ block: 'center' })); await p.click('#clGo'); await p.waitForTimeout(200);
    ok(/猜中|没猜中/.test(await say(p, 'clSay')), 'reduced: reveal is immediate');
    await layout(p, 'reduced 1280');
    ok(!errs.length, 'reduced: no console errors ' + errs.join(' | '));
    await ctx.close();
  }
  await b.close();
  console.log(`browser.cjs: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
