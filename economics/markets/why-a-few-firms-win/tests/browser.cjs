'use strict';
// Browser smoke test for the why-a-few-firms-win essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:19002 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node economics/markets/why-a-few-firms-win/tests/browser.cjs
// Checks at 1280/390/320, in Chinese and in EN mode (no copy.en.js yet, so EN falls back to the Chinese copy and
// <html lang> follows the text actually shown): no console/page errors (the copy.en.js 404 is expected), no
// horizontal overflow, no text clipped inside its box, every control at least 48×48 px, the toggle reads 中 | EN,
// no raw copy keys or unfilled {placeholders}. Then every live-sentence branch is driven from the controls at their
// extremes (each live sentence records its template in data-key), each model's readouts follow its controls,
// keyboard operation of a slider and a radio, and reduced motion jumping replays to their end state.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:19002').replace(/\/$/, '');
const url = base + '/economics/markets/why-a-few-firms-win/';
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const key = (page, id) => page.$eval('#' + id, e => e.dataset.key);
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const setRadio = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 350) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(ms); };

(async () => {
  const browser = await chromium.launch();

  // layout, targets, errors at three widths, in both language modes
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang should follow the text shown (zh-CN while there is no copy.en.js)`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    ok(await page.$eval(`#langToggle [data-lang=${lang}]`, e => e.getAttribute('aria-pressed')) === 'true', `${tag}: chosen language button pressed`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table *')].filter(e => {
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('.tablewrap'); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const small = await page.evaluate(() => {
      const out = [], boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, .toc a, a.back')) { const r = boxOf(e); if (!r.width && !r.height) continue; if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`); }
      return out; });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const raw = await page.evaluate(() => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) { const s = n.textContent.trim(); if (/^(ch\d+|hero|nav|toc|common)\.[\w.]+$/.test(s) || /\{\w+\}/.test(s)) out.push(s.slice(0, 40)); } return out.slice(0, 5); });
    ok(!raw.length, `${tag}: raw keys or placeholders visible: ${raw.join(' | ')}`);
    ok(/[一-鿿]/.test(await page.title()), `${tag}: Chinese <title>`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle without copy.en.js: stays readable, stores the choice, no raw keys
  {
    const page = await open(browser, 1280);
    await page.click('#langToggle [data-lang=en]');
    ok(await page.evaluate(() => { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return null; } }) === 'en', 'EN stored');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching to EN (falls back to zh copy)');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.$eval('#langToggle [data-lang=zh]', e => e.getAttribute('aria-pressed')) === 'true', 'ZH button pressed again');
    ok((await page.$$eval('[aria-live]', es => es.map(e => e.id))).length >= 12, 'every live sentence is aria-live');
    await page.close();
  }

  // every live-sentence branch, driven from the page's own controls (reduced motion: replays end immediately)
  const seen = new Set();
  {
    const page = await open(browser, 1280, { reduce: true });
    const want = async (id, k, msg) => { const got = await key(page, id); seen.add(got); ok(got === k, `${msg}: ${id} shows ${got}, expected ${k}`); const s = await text(page, '#' + id); ok(!/\{\w+\}/.test(s) && s.length > 5, `${msg}: sentence filled`); };
    // ch1
    await show(page, '#moCv');
    await want('ch1Say', 'ch1.say.one', 'ch1 default'); ok((await text(page, '#moP')) === '20.00', 'ch1 price 20 at ε 2');
    await setRange(page, 'moE', 1.25); await want('ch1Say', 'ch1.say.steep', 'ch1 ε min');
    await setRange(page, 'moE', 8); await want('ch1Say', 'ch1.say.one', 'ch1 ε max'); ok((await text(page, '#moL')) === '0.125', 'ch1 Lerner 1/8 at ε 8');
    await setRadio(page, 'moMode', 'pd'); await want('ch1Say', 'ch1.say.pd', 'ch1 perfect discrimination'); await setRadio(page, 'moMode', 'one');
    // ch2
    await show(page, '#coCv');
    await want('ch2Say', 'ch2.say.many', 'ch2 default'); ok((await text(page, '#coK')).startsWith('10'), 'ch2 10 firms at default');
    await setRange(page, 'coF', 7); await want('ch2Say', 'ch2.say.few', 'ch2 F max');
    await setRange(page, 'coS', 3); await want('ch2Say', 'ch2.say.natural', 'ch2 F max, S min');
    await setRange(page, 'coF', 2); await setRange(page, 'coS', 7); await want('ch2Say', 'ch2.say.many', 'ch2 F min, S max');
    await setRadio(page, 'coD', '0'); await want('ch2Say', 'ch2.say.nod', 'ch2 no capacity strain'); await setRadio(page, 'coD', '1');
    // ch3
    await show(page, '#olCv');
    await want('ch3Say', 'ch3.say.many', 'ch3 default'); ok((await text(page, '#olC')).startsWith('26.67'), 'ch3 Cournot 26.67');
    await setRange(page, 'olN', 1); await want('ch3Say', 'ch3.say.one', 'ch3 N min');
    await setRange(page, 'olN', 10); await setRange(page, 'olS', 20); await want('ch3Say', 'ch3.say.many', 'ch3 N max σ max'); ok((await text(page, '#olH')) === '1,000', 'ch3 HHI 1000 at N 10');
    // ch4
    await show(page, '#enCv');
    await want('ch4Say', 'ch4.say.normal', 'ch4 default'); ok((await text(page, '#enPk')) === '10.51', 'ch4 contestable 10.51');
    await setRange(page, 'enS', 0); await setRange(page, 'enF', 4); await want('ch4Say', 'ch4.say.none', 'ch4 S min F max');
    await setRange(page, 'enF', 1); await want('ch4Say', 'ch4.say.cournotonly', 'ch4 S min F 50');
    await setRange(page, 'enS', 7); await setRange(page, 'enF', 0); await want('ch4Say', 'ch4.say.normal', 'ch4 S max F min');
    // ch5 (reduced motion: the run is already at its end)
    await show(page, '#nwCv');
    await want('ch5Say', 'ch5.say.doneup', 'ch5 default'); ok((await text(page, '#nwNow')).startsWith('80'), 'ch5 grows to 80%');
    await setRange(page, 'nwN', 0); await want('ch5Say', 'ch5.say.donedown', 'ch5 n0 min');
    await setRange(page, 'nwN', 0.2); await want('ch5Say', 'ch5.say.edge', 'ch5 n0 on the critical mass');
    await setRange(page, 'nwP', 0.3); await want('ch5Say', 'ch5.say.none', 'ch5 p max'); await setRange(page, 'nwP', 0.16);
    // ch6
    await show(page, '#stCv');
    await want('ch6Say', 'ch6.say.locked', 'ch6 default'); ok((await text(page, '#stThr')) === '10 人', 'ch6 threshold prints 10 人, got ' + await text(page, '#stThr'));
    ok((await text(page, '#stTip')).startsWith('177'), 'ch6 177 of 200 tip');
    await setRange(page, 'stR', 0); await want('ch6Say', 'ch6.say.none', 'ch6 r min');
    await setRange(page, 'stR', 0.01); await want('ch6Say', 'ch6.say.open', 'ch6 r 0.01');
    await setRange(page, 'stR', 0.3); await want('ch6Say', 'ch6.say.locked', 'ch6 r max');
    await page.click('#stGo'); await want('ch6Say', 'ch6.say.locked', 'ch6 another history');
    // ch7
    await show(page, '#tsCv');
    await want('ch7Say', 'ch7.say.below', 'ch7 default'); ok((await text(page, '#tsP1')) === '0.14', 'ch7 p1 0.14');
    await setRange(page, 'tsA1', 0); await setRange(page, 'tsA2', 0); await want('ch7Say', 'ch7.say.cheaper', 'ch7 α min');
    await setRange(page, 'tsA1', 0.9); await setRange(page, 'tsA2', 0.9); await want('ch7Say', 'ch7.say.cheaper', 'ch7 α max');
    await setRadio(page, 'tsMode', 'duo'); await want('ch7Say', 'ch7.say.duo', 'ch7 duopoly'); seen.add('ch7.note.none');
    ok((await text(page, '#ch7Say')).includes('t = 1'), 'ch7 duopoly note names t');
    // ch8
    await show(page, '#daCv');
    await want('ch8Say', 'ch8.say.fade', 'ch8 default'); ok((await text(page, '#daS')).startsWith('52'), 'ch8 ends at 52%, got ' + await text(page, '#daS'));
    await setRange(page, 'daD', 0.3); await want('ch8Say', 'ch8.say.tip', 'ch8 δ max');
    await setRange(page, 'daD', 0.12); await want('ch8Say', 'ch8.say.tipstart', 'ch8 δ 0.12 (between the two thresholds)');
    await setRange(page, 'daD', 0.1); await want('ch8Say', 'ch8.say.hold', 'ch8 δ 0.1');
    await setRange(page, 'daB', 0.05); await setRange(page, 'daD', 0.3); await want('ch8Say', 'ch8.say.fade', 'ch8 β min δ max');
    // ch9
    await show(page, '#tyCv');
    await want('ch9Say', 'ch9.say.profit', 'ch9 default'); ok((await text(page, '#tyGain')) === '0.60', 'ch9 gain 0.60');
    await setRange(page, 'tyM', 0); await want('ch9Say', 'ch9.say.nogain', 'ch9 m min');
    await setRange(page, 'tyM', 1); await setRange(page, 'tyD', 3); await setRange(page, 'tyK', 0); await want('ch9Say', 'ch9.say.survive', 'ch9 m, Δ max, K min');
    await setRange(page, 'tyD', 0); await setRange(page, 'tyK', 3); await want('ch9Say', 'ch9.say.deadopen', 'ch9 Δ min K max');
    // ch10
    await show(page, '#wtCv');
    await want('ch10Say', 'ch10.say.high', 'ch10 default'); ok((await text(page, '#wtTip')) === '88.5%', 'ch10 88.5% tip');
    await setRange(page, 'wtPhi', 1); await want('ch10Say', 'ch10.say.none', 'ch10 φ max'); ok((await text(page, '#ch10Say')).includes(Z['ch10.why.phi'].slice(0, 6)), 'ch10 φ reason'); seen.add('ch10.why.phi');
    ok((await text(page, '#wtThr')) === Z['ch10.unit.inf'], 'ch10 φ = 1 never locks');
    await setRange(page, 'wtPhi', 0); await setRange(page, 'wtH', 0.8); await want('ch10Say', 'ch10.say.mid', 'ch10 h max');
    await setRange(page, 'wtG', 4); await want('ch10Say', 'ch10.say.none', 'ch10 h max g max'); ok((await text(page, '#ch10Say')).includes('40 人'), 'ch10 other reason with threshold 40'); seen.add('ch10.why.other');
    await setRange(page, 'wtH', 0); await setRange(page, 'wtG', 0.5); await want('ch10Say', 'ch10.say.high', 'ch10 g min');
    // ch11
    await show(page, '#mkCv');
    await want('ch11Say', 'ch11.say.cogs', 'ch11 default'); ok((await text(page, '#mkEst')) === '1.57', 'ch11 estimate 1.57');
    await setRange(page, 'mkC', 0.85); await want('ch11Say', 'ch11.say.flat', 'ch11 COGS share max');
    await setRange(page, 'mkC', 0.5); await page.check('#mkSga', { force: true }); await want('ch11Say', 'ch11.say.sga', 'ch11 SG&A counted');
    await show(page, '#dmCv');
    await want('ch11Say2', 'ch11.say2.same', 'ch11 Demsetz default'); ok((await text(page, '#dmH')) === '3,333', 'ch11 HHI 3,333');
    await setRange(page, 'dmC', 0); await want('ch11Say2', 'ch11.say2.better', 'ch11 Demsetz c1 min'); ok((await text(page, '#dmP')) === '20.00' && (await text(page, '#dmH')) === '3,750', 'ch11 P 20, HHI 3,750');
    // ch12 cards and tables are filled
    ok((await page.$$eval('#stack .card', es => es.length)) === 4, 'ch12 four stack cards');
    ok((await page.$$eval('#cases tbody tr', es => es.length)) === 10, 'ch12 ten case rows');
    ok((await text(page, '#stack')).includes('1,293') && (await text(page, '#stack')).includes('600 亿美元'), 'ch12 cloud HHI bound and capex in 亿美元');
    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }
  // in-motion branches: before a replay finishes
  {
    const page = await open(browser, 1280);
    await show(page, '#nwCv', 100); await setRange(page, 'nwN', 0.3); { const k = await key(page, 'ch5Say'); seen.add(k); ok(k === 'ch5.say.up', 'ch5 running up, got ' + k); }
    await setRange(page, 'nwN', 0.1); { const k = await key(page, 'ch5Say'); seen.add(k); ok(k === 'ch5.say.down', 'ch5 running down, got ' + k); }
    await page.waitForTimeout(6000); ok(await key(page, 'ch5Say') === 'ch5.say.donedown', 'ch5 replay reaches its end');
    await show(page, '#stCv', 100); await setRange(page, 'stR', 0.2); ok(await key(page, 'ch6Say') === 'pending', 'ch6 sentence waits for the replay');
    await page.waitForTimeout(4600); ok(await key(page, 'ch6Say') === 'ch6.say.locked', 'ch6 replay ends locked');
    await show(page, '#daCv', 100); await page.click('#daGo'); { const k = await key(page, 'ch8Say'); seen.add(k); ok(k === 'ch8.say.running', 'ch8 running, got ' + k); }
    const t1 = await text(page, '#daT'); await page.waitForTimeout(1500); ok((await text(page, '#daT')) !== t1, 'ch8 clock advances');
    // keyboard: a slider and a radio group
    await page.focus('#olN'); const n0 = await text(page, '#olNo'); await page.keyboard.press('ArrowRight'); ok((await text(page, '#olNo')) === String(+n0 + 1), 'keyboard moves the ch3 slider');
    await page.focus('input[name=moMode][value=one]'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok(await page.$eval('input[name=moMode][value=pd]', e => e.checked), 'keyboard switches the ch1 radio'); ok(await key(page, 'ch1Say') === 'ch1.say.pd', 'ch1 follows the keyboard');
    const focusRing = await page.evaluate(() => { const e = document.querySelector('#nwGo'); e.focus(); return getComputedStyle(e).outlineStyle !== 'none' || getComputedStyle(e).boxShadow !== 'none'; });
    ok(focusRing, 'buttons show a focus ring');
    ok(!page.__errors().length, 'motion: errors: ' + page.__errors().join(' | '));
    await page.close();
  }
  for (const k of Object.keys(Z).filter(k => /\.say2?\.|\.note\.|\.why\./.test(k))) ok(seen.has(k), `branch ${k} never shown in the browser`);

  // reduced motion: no smooth scroll, replays at their end state on first view
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#nwCv'); ok((await text(page, '#nwT')) === '20.0', 'reduced motion: ch5 at t = 20');
    await show(page, '#daCv'); ok((await text(page, '#daT')).includes('300'), 'reduced motion: ch8 at t = 300');
    await show(page, '#stCv'); ok(await key(page, 'ch6Say') === 'ch6.say.locked', 'reduced motion: ch6 sentence final');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh and EN-fallback at 1280/390/320: overflow, clipped text, 48px targets, raw keys; every live-sentence branch from the controls; keyboard; reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
