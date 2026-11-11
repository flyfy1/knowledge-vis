'use strict';
// Browser test for the why-the-planet-warms essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18914 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node earth/climate/why-the-planet-warms/tests/browser.cjs
// Checks in Chinese and English at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped
// inside its own box, every control at least 48×48 px, the toggle reads 中 | EN; in English, no CJK left in the
// visible text, document title, aria-labels or canvas labels (apart from the 中 toggle). Then: the EN toggle with copy.en.js absent,
// keyboard operation of a slider, each model driven to the ends of its controls with the readouts and live
// sentences compared against window.ClimateModels (expected numbers are computed, not typed in), the animation
// running with motion allowed, and reduced motion jumping to the end state.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18914').replace(/\/$/, '');
const url = base + '/earth/climate/why-the-planet-warms/';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  // record every string drawn on a canvas, so English mode can be checked for leftover Chinese labels
  await page.addInitScript(() => { window.__canvasText = new Set(); const ft = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s, ...r) { window.__canvasText.add(String(s)); return ft.call(this, s, ...r); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 250) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const num = s => parseFloat(String(s).replace(/,/g, '').replace('−', '-'));
// expected value formatted as the page formats it (zh-CN grouping, true minus)
const f = (x, d = 0) => (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
const M = (page, fn, arg) => page.evaluate(([src, arg]) => new Function('M', 'a', 'return (' + src + ')(M, a)')(window.ClimateModels, arg), [fn.toString(), arg]);

(async () => {
  const browser = await chromium.launch();

  // layout, targets and errors at three widths, in both languages
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => {
      const out = [];
      const boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, select, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const unlabeled = await page.evaluate(() => [...document.querySelectorAll('canvas')].filter(c => !(c.getAttribute('aria-label') || '').trim()).map(c => c.id));
    ok(!unlabeled.length, `${tag}: canvases without aria-label: ${unlabeled.join(', ')}`);
    if (lang === 'en') {
      const cjk = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
      const leftovers = await page.evaluate(src => { const re = new RegExp(src);
        const vis = [...document.body.querySelectorAll('*')].filter(e => e.offsetParent !== null || e === document.body)
          .flatMap(e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim())).filter(x => x && re.test(x) && x !== '中');
        const aria = [...document.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).filter(x => re.test(x));
        const canvas = [...window.__canvasText].filter(x => re.test(x));
        return { vis: vis.slice(0, 5), aria, canvas, title: re.test(document.title) ? document.title : '' };
      }, cjk.source);
      ok(!leftovers.vis.length, `${tag}: Chinese text visible in English mode: ${leftovers.vis.join(' | ')}`);
      ok(!leftovers.aria.length, `${tag}: Chinese aria-labels in English mode: ${leftovers.aria.join(' | ')}`);
      ok(!leftovers.canvas.length, `${tag}: Chinese canvas labels in English mode: ${leftovers.canvas.join(' | ')}`);
      ok(!leftovers.title, `${tag}: Chinese document title in English mode: ${leftovers.title}`);
      ok(await page.$eval('#nlNo', e => e.textContent.trim()) === '2 layers', `${tag}: ch3 slider reads "2 layers"`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle with copy.en.js absent; keyboard; animation with motion allowed
  {
    const page = await open(browser, 1280);
    const title = await text(page, 'h1');
    ok(title.length > 0 && !/^\w+(\.\w+)+$/.test(title), 'hero title filled from copy');
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'html lang follows the text actually shown');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'back to zh');

    // keyboard: tab onto the albedo slider and move it with the arrow keys
    await show(page, '#blCv');
    await page.focus('#blS'); await page.keyboard.press('Tab');
    ok(await page.evaluate(() => document.activeElement.id) === 'blA', 'Tab moves from the sunlight slider to the albedo slider');
    const te0 = await text(page, '#blTe');
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    ok(await text(page, '#blTe') !== te0, 'arrow keys on the albedo slider change the effective temperature');
    const focusRing = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' || s.boxShadow !== 'none'; });
    ok(focusRing, 'focused slider shows a focus ring');
    await page.focus('#fbWv'); await page.keyboard.press('Space');
    ok(!(await page.$eval('#fbWv', e => e.checked)), 'Space toggles a feedback checkbox');
    await page.keyboard.press('Space');

    // motion allowed: ch1 temperature moves toward the new balance over time
    await page.click('#blReset'); await setRange(page, 'blA', 0.29); await setRange(page, 'blS', 1600);
    const TeNew = await M(page, M => M.balance.Te(1600, 0.29));
    const T0 = num(await text(page, '#blT')); await page.waitForTimeout(1500);
    const T1 = num(await text(page, '#blT'));
    ok(T1 !== T0 && Math.abs(T1 - TeNew) < Math.abs(T0 - TeNew), `ch1 animates: temperature moves toward the new balance ${TeNew.toFixed(0)} K (${T0} → ${T1})`);
    // ch3 at the start: every layer at 255 K, outgoing = absorbed, yet the ground is not settled; the sentence must not
    // say "0 W/m² more ... cooling"
    await show(page, '#nlCv', 0); await page.click('#nlReset');
    const s3 = await page.$eval('#nlSay', e => e.textContent);
    ok(!/多 0 W|降温/.test(s3), `ch3 start sentence: ${s3}`);
    // ch7 replay restarts the clock
    await show(page, '#ocCv', 3000); await page.click('#ocReplay'); await page.waitForTimeout(150);
    ok(num(await text(page, '#ocT')) < 1, 'ch7 replay restarts from zero warming');
    ok(!page.__errors().length, 'toggle/keyboard: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // every model at the ends of its controls (reduced motion, so each one shows its end state at once)
  for (const [width, lang] of [[1280, 'zh'], [320, 'zh'], [320, 'en']]) {
    const page = await open(browser, width, { reduce: true, lang });
    const tag = `drive ${lang} ${width}`;
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', `${tag}: no smooth scroll under reduced motion`);
    const say = sel => page.$eval(sel, e => e.textContent);

    // ch1 energy balance
    await show(page, '#blCv');
    for (const [S, a] of [[1100, 0.9], [1600, 0], [1100, 0], [1600, 0.9], [1361, 0.29]]) {
      await setRange(page, 'blA', a); await setRange(page, 'blS', S); await page.waitForTimeout(80);
      const Te = await M(page, (M, a) => M.balance.Te(a[0], a[1]), [S, a]);
      ok((await text(page, '#blTe')).startsWith(f(Te)), `${tag} ch1 S=${S} a=${a}: Te tile ${await text(page, '#blTe')} vs ${f(Te)}`);
      ok(Math.abs(num(await text(page, '#blT')) - Te) <= 1, `${tag} ch1 S=${S} a=${a}: reduced motion settles at Te`);
      ok((await say('#blSay')).includes(f(Te)), `${tag} ch1 S=${S} a=${a}: sentence names ${f(Te)} K: ${await say('#blSay')}`);
    }

    // ch2 one grey layer
    await show(page, '#olCv');
    for (const e of [0, 0.01, 0.5, 0.76, 0.99, 1]) {
      await setRange(page, 'olE', e); await page.waitForTimeout(80);
      const Ts = await M(page, (M, e) => M.layers.oneLayer(e, M.balance.Te(M.EARTH.S, M.EARTH.albedo)).Ts, e);
      ok((await text(page, '#olTs')).startsWith(f(Ts)), `${tag} ch2 ε=${e}: Ts tile ${await text(page, '#olTs')} vs ${f(Ts)}`);
      ok((await say('#olSay')).includes(f(Ts)), `${tag} ch2 ε=${e}: sentence names ${f(Ts)} K: ${await say('#olSay')}`);
      if (e === 0) ok((await text(page, '#olTa')) === '—' || !/\d/.test(await text(page, '#olTa')), `${tag} ch2 ε=0: no air temperature`);
      // settled: outgoing infrared tile and sentence equal the absorbed sunlight, as the sentence says
      const A0 = await M(page, M => M.balance.absorbed(M.EARTH.S, M.EARTH.albedo));
      ok((await text(page, '#olUp')).startsWith(f(A0)), `${tag} ch2 ε=${e}: settled outgoing ${await text(page, '#olUp')} = absorbed ${f(A0)}`);
    }

    // ch3 N black layers
    await show(page, '#nlCv');
    for (const n of [0, 1, 8, 2]) {
      await setRange(page, 'nlN', n); await page.waitForTimeout(120);
      const r = await M(page, (M, n) => { const Te = M.balance.Te(M.EARTH.S, M.EARTH.albedo); return { Ts: M.layers.stack(n, Te).Ts, Te }; }, n);
      ok(Math.abs(num(await text(page, '#nlTs')) - r.Ts) <= 1, `${tag} ch3 N=${n}: Ts ${await text(page, '#nlTs')} vs ${r.Ts.toFixed(1)}`);
      if (n) ok(Math.abs(num(await text(page, '#nlTop')) - r.Te) <= 1, `${tag} ch3 N=${n}: top layer at Te`);
      ok(/\d/.test(await say('#nlSay')), `${tag} ch3 N=${n}: live sentence has numbers`);
      if (lang === 'en') ok((await text(page, '#nlNo')) === (n === 1 ? '1 layer' : `${n} layers`), `${tag} ch3 N=${n}: singular/plural ${await text(page, '#nlNo')}`);
    }

    // ch4 the band: forcing at today's CO2, per-doubling at the ends, the box saturating
    await show(page, '#spCv');
    const PPM = [4, 6, 8, 10, 15, 20, 30, 40, 60, 80, 100, 140, 200, 280, 350, null, 560, 800, 1120, 1600, 2240, 3200, 4096];
    await page.click('input[name=spShape][value=exp]', { force: true });
    for (const i of [0, 13, 15, 22]) {
      await setRange(page, 'spC', i); await page.waitForTimeout(80);
      const r = await M(page, (M, a) => { const c = a == null ? M.EARTH.Cnow : a; return { c, F: M.band.forcing(c), F2: M.band.forcing(2 * c, c) }; }, PPM[i]);
      ok((await text(page, '#spF')).startsWith(f(r.F, 2)), `${tag} ch4 exp ${r.c} ppm: forcing tile ${await text(page, '#spF')} vs ${f(r.F, 2)}`);
      ok((await say('#spSay')).includes(f(r.F2, 2)), `${tag} ch4 exp ${r.c} ppm: sentence names per-doubling ${f(r.F2, 2)}: ${await say('#spSay')}`);
    }
    await page.click('input[name=spShape][value=box]', { force: true });
    for (const i of [0, 13, 22]) {
      await setRange(page, 'spC', i); await page.waitForTimeout(80);
      const F2 = await M(page, (M, c) => M.band.forcing(2 * c, c, 'box'), PPM[i]);
      const s = await say('#spSay');
      if (F2 < 0.0005) ok(s.includes('0.001') && !s.includes('0.000'), `${tag} ch4 box ${PPM[i]}: near-zero wording: ${s}`);
      else ok(s.includes(f(F2, F2 < 0.1 ? 3 : 2)), `${tag} ch4 box ${PPM[i]}: sentence names ${f(F2, 3)}: ${s}`);
    }
    await page.click('input[name=spShape][value=exp]', { force: true });

    // ch5 feedbacks
    await show(page, '#fbCv');
    const chk = async (id, v) => { if (await page.$eval('#' + id, e => e.checked) !== v) await page.click('#' + id); };
    for (const [wv, al, cl, cv] of [[0, 0, 0, 0.42], [1, 1, 1, 0.42], [1, 1, 1, 0.94], [1, 1, 1, -0.1], [0, 0, 1, -0.1]]) {
      await chk('fbWv', !!wv); await chk('fbAl', !!al); await chk('fbCl', !!cl); await setRange(page, 'fbCv2', cv); await page.waitForTimeout(80);
      const ecs = await M(page, (M, a) => M.feedback.ecs({ wvlr: a[0], albedo: a[1], cloud: a[2], cloudVal: a[3] }), [!!wv, !!al, !!cl, cv]);
      ok((await text(page, '#fbEcs')).startsWith(f(ecs, 2)), `${tag} ch5 ${[wv, al, cl, cv]}: ECS tile ${await text(page, '#fbEcs')} vs ${f(ecs, 2)}`);
      // the rounds stop once 99.5 % of the way there (app.js maxK), so the running total sits within 0.5 % of the end
      const now = num(await text(page, '#fbNow'));
      ok(now <= ecs + 0.005 && now >= 0.995 * ecs - 0.005, `${tag} ch5 ${[wv, al, cl, cv]}: reduced motion finishes the rounds (${now} vs ${ecs.toFixed(3)})`);
      ok((await say('#fbSay')).includes(f(ecs, 2)), `${tag} ch5 ${[wv, al, cl, cv]}: sentence names ${f(ecs, 2)}: ${await say('#fbSay')}`);
    }
    ok(await page.$eval('#fbCv2', e => e.disabled) === false, `${tag} ch5 cloud slider enabled with clouds on`);
    await chk('fbCl', false); ok(await page.$eval('#fbCv2', e => e.disabled), `${tag} ch5 cloud slider disabled with clouds off`);
    await chk('fbCl', true); await setRange(page, 'fbCv2', 0.42);

    // ch6 spread of sensitivity
    await show(page, '#dsCv');
    for (const [mu, sd] of [[0.64, 0.123], [0.3, 0], [0.3, 0.2], [0.8, 0.2], [0.64, 0.062]]) {
      await setRange(page, 'dsMu', mu); await setRange(page, 'dsSd', sd); await page.waitForTimeout(80);
      const q = await M(page, (M, a) => ({ med: M.spread.ecsOf(a[0]), lo: M.spread.quantile(0.05, a[0], a[1]), hi: M.spread.quantile(0.95, a[0], a[1]) }), [mu, sd]);
      ok((await text(page, '#dsMed')).startsWith(f(q.med, 2)), `${tag} ch6 ${mu}±${sd}: median ${await text(page, '#dsMed')} vs ${f(q.med, 2)}`);
      const s = await say('#dsSay'), rng = await text(page, '#dsRange');
      ok(rng.includes(f(q.lo, 2)), `${tag} ch6 ${mu}±${sd}: range starts at ${f(q.lo, 2)}: ${rng}`);
      if (!isFinite(q.hi) || q.hi > 20) ok(rng.includes('20') && !s.includes(f(q.hi, 2)), `${tag} ch6 ${mu}±${sd}: runaway wording, no absurd upper bound: ${s}`);
      else ok(rng.includes(f(q.hi, 2)) && s.includes(f(q.med, 2)), `${tag} ch6 ${mu}±${sd}: range ends at ${f(q.hi, 2)}: ${rng} / ${s}`);
    }
    await page.click('#dsAr6'); await page.waitForTimeout(80);
    const ar6 = await M(page, M => M.spread.fromAR6());
    ok(Math.abs(num(await page.$eval('#dsSd', e => e.value)) - ar6.sd) < 0.001, `${tag} ch6 AR6 button sets σ from Table 7.10`);

    // ch7 ocean lag: tiles against the model, at the shallowest and deepest box
    await show(page, '#ocCv');
    const DEPTHS = [10, 25, 50, 100, 200, 500, 1000, 2000];
    for (const scen of ['ramp', 'step']) {
      await page.click(`input[name=ocScen][value=${scen}]`, { force: true });
      for (const [hi, ecs] of [[0, 1.5], [7, 6], [3, 3.4]]) {
        await setRange(page, 'ocH', hi); await setRange(page, 'ocE', ecs); await page.waitForTimeout(120);
        const r = await M(page, (M, a) => ({ T70: M.ocean.at({ h: a[0], ecs: a[1], scen: a[2] }, 70), T300: M.ocean.at({ h: a[0], ecs: a[1], scen: a[2] }, 300), tau: M.ocean.tau(a[0], a[1]) }), [DEPTHS[hi], ecs, scen]);
        ok((await text(page, '#ocT70')).startsWith(f(r.T70, 2)), `${tag} ch7 ${scen} h=${DEPTHS[hi]} ECS=${ecs}: T70 ${await text(page, '#ocT70')} vs ${f(r.T70, 2)}`);
        ok((await text(page, '#ocT')).startsWith(f(r.T300, 2)), `${tag} ch7 ${scen} h=${DEPTHS[hi]} ECS=${ecs}: T300 ${await text(page, '#ocT')} vs ${f(r.T300, 2)}`);
        const s = await say('#ocSay');
        ok(s.includes(f(r.tau, r.tau < 10 ? 1 : 0)) || s.includes(f(r.T300, 2)), `${tag} ch7 ${scen} h=${DEPTHS[hi]}: sentence carries model numbers: ${s}`);
        // never claim warming continues when it does not
        if (scen === 'ramp' && r.T300 - r.T70 < 0.1) ok(!s.includes('还在涨') && !s.includes('keeps climbing'), `${tag} ch7 shallow box: no "still rising" claim: ${s}`);
      }
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(x => 'FAIL ' + x).join('\n')); process.exit(1); }
  console.log('PASS: browser test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, canvas labels, no Chinese left in English; EN toggle; keyboard; animation; all seven models at the ends of their controls under reduced motion, zh at 1280/320 and en at 320)');
})().catch(e => { console.error(e); process.exit(1); });
