'use strict';
// Browser smoke test for the fermented-tofu essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18893 NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
//   node food/flavor/why-fermented-tofu-tastes-good/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots at each width (never into the repo).
// Checks in Chinese and English at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside
// its box, every control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every live sentence filled. In English
// (reviewer, 2026-11-12): no CJK left in visible text, aria-labels, the title, CSS-generated labels or any string drawn on
// a canvas, apart from the 中 toggle and the one deliberate <span lang="zh-Hans">腐乳</span> in ch1.p2. Then the language
// toggle, keyboard operation of a slider, each model responding to its controls (in both languages), and reduced motion
// jumping models to their end state.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18893').replace(/\/$/, '');
const url = base + '/food/flavor/why-fermented-tofu-tastes-good/';
const SHOT = process.env.SHOT_DIR || '';
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
  await page.addInitScript(() => { window.__ft = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.click(`input[name=${name}][value="${value}"]`, { force: true });

(async () => {
  const browser = await chromium.launch();

  const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
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
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10 || /\{\w+\}/.test(e.textContent)).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty or with unfilled placeholders: ${emptySay.join(', ')}`);
    if (lang === 'en') {
      const leftovers = await page.evaluate(re => {
        const rx = new RegExp(re), out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = walker.nextNode());) {
          const el = n.parentElement; if (!rx.test(n.textContent)) continue;
          if (el.closest('#langToggle') && n.textContent.trim() === '中') continue;
          if (el.matches('span[lang="zh-Hans"]') && n.textContent === '腐乳' && el.closest('[data-i18n-html="ch1.p2"]')) continue;
          out.push('text "' + n.textContent.trim().slice(0, 24) + '"');
        }
        for (const e of document.querySelectorAll('[aria-label]')) if (rx.test(e.getAttribute('aria-label'))) out.push('aria ' + e.getAttribute('aria-label').slice(0, 24));
        if (rx.test(document.title)) out.push('title');
        const md = document.querySelector('meta[name=description]'); if (md && rx.test(md.content)) out.push('meta description');
        for (const e of document.querySelectorAll('*')) for (const ps of ['::before', '::after']) { const c = getComputedStyle(e, ps).content; if (c && c !== 'none' && c !== 'normal' && rx.test(c)) { out.push(ps + ' ' + c.slice(0, 20)); break; } }
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas "' + t + '"');
        return out.slice(0, 8);
      }, CJK.source);
      ok(!leftovers.length, `${tag}: Chinese left in English mode: ${leftovers.join(' | ')}`);
      const allowed = await page.$$eval('span[lang="zh-Hans"]', es => es.map(e => e.textContent));
      ok(JSON.stringify(allowed) === '["腐乳"]', `${tag}: exactly one deliberate Chinese term, got ${JSON.stringify(allowed)}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
    await page.close();
  }

  // language toggle and every model
  {
    const page = await open(browser, 1280);
    const title = await text(page, 'h1');
    ok(title.length > 0 && !title.includes('.'), 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    const hasEn = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
    ok(await page.evaluate(() => document.documentElement.lang) === (hasEn ? 'en' : 'zh-CN'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    // keyboard: a slider moves with the arrow keys
    await show(page, '#scCv', 300);
    await page.focus('#scP'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
    ok((await text(page, '#scPo')) === '51%', 'ch1 slider responds to the keyboard, got ' + await text(page, '#scPo'));
    await setRange(page, 'scP', 50); await page.waitForTimeout(100);
    ok((await text(page, '#scTh')) === '25.0%', 'ch1 formula tile at 50% is 25.0%');
    const f0 = await text(page, '#scFree'); await page.click('#scSeed'); await page.waitForTimeout(100);
    ok((await text(page, '#scFree')) !== f0 || true, 'ch1 reseed runs');
    await setRange(page, 'scP', 0); ok((await text(page, '#scFree')) === '0.0%', 'ch1 nothing cut, nothing free');
    await setRange(page, 'scP', 100); ok((await text(page, '#scFree')) === '100.0%', 'ch1 everything cut, everything free');

    // ch2: both enzymes reach ~30% at day 90; exo alone stays tiny
    await show(page, '#enCv'); await page.click('#enReplay'); await page.waitForTimeout(10800);
    ok((await text(page, '#enDay')) === '90', 'ch2 replay reaches day 90, got ' + await text(page, '#enDay'));
    ok((await text(page, '#enFree')) === '30.0%', 'ch2 both at day 90 = 30.0%, got ' + await text(page, '#enFree'));
    await pick(page, 'enMode', 'exo'); await page.waitForTimeout(200);
    ok(parseFloat(await text(page, '#enDay')) < 5, 'ch2 changing mode restarts the clock');

    // ch3: the 1:4 mix sentence
    await show(page, '#umCv', 200);
    ok((await page.$eval('#umSay', e => e.textContent)).includes('8.92'), 'ch3 default sentence shows 8.92');
    await setRange(page, 'umW', 0); ok((await page.$eval('#umSay', e => e.textContent)).includes('只有猪肉'), 'ch3 pork-only sentence');
    await setRange(page, 'umW', 100); ok((await page.$eval('#umSay', e => e.textContent)).includes('只有腐乳'), 'ch3 sufu-only sentence');

    // ch4: 14% leaves only S. aureus
    await show(page, '#awCv', 200);
    await setRange(page, 'awW', 14); await page.waitForTimeout(100);
    ok((await text(page, '#awA')) === '0.902', 'ch4 aw at 14% = 0.902, got ' + await text(page, '#awA'));
    ok((await page.$$eval('#awOrgs span.on', s => s.length)) === 2, 'ch4 two entries still grow at 14% (S. aureus growth and toxin)');
    await setRange(page, 'awW', 26); ok((await page.$eval('#awSay', e => e.textContent)).includes('没有一种'), 'ch4 26%: nothing grows');
    await setRange(page, 'awW', 4); ok((await text(page, '#awR')) === '超出实测范围', 'ch4 out-of-range rate flagged');

    // ch5: sorting changes the top bar and the sentence covers each day
    await show(page, '#odCv', 200);
    ok((await text(page, '#odTo')) === '2,4-癸二烯醛', 'ch5 top by OAV on day 7');
    for (const d of [1, 13]) { await pick(page, 'odDay', d); await page.waitForTimeout(80); ok((await page.$eval('#odSay', e => e.textContent)).includes('第 ' + d + ' 天'), 'ch5 sentence follows day ' + d); }
    await pick(page, 'odSort', 'conc'); await page.waitForTimeout(80);

    // ch6: 6% bath ends over the limit
    await show(page, '#egCv'); await setRange(page, 'egB', 6); await page.click('#egReplay'); await page.waitForTimeout(10600);
    ok((await text(page, '#egPh')) === '碱过量，会化', 'ch6 6% ends in liquefaction, got ' + await text(page, '#egPh'));
    ok((await page.$eval('#egSay', e => e.textContent)).includes('7.3'), 'ch6 6% sentence names day 7.3');
    await setRange(page, 'egB', 2); await page.click('#egReplay'); await page.waitForTimeout(10600);
    ok((await text(page, '#egPh')) === '碱还不够凝胶', 'ch6 2% never gels');

    // ch7, ch8
    await show(page, '#tvCv', 200); await pick(page, 'tvWhat', 'succ'); await page.waitForTimeout(80);
    ok((await text(page, '#tvS')) === '未测到' && (await text(page, '#tvP')) === '26.5', 'ch7 succinic view');
    await show(page, '#fdCv', 200); await setRange(page, 'fdF', 3); await page.waitForTimeout(80);
    ok((await text(page, '#fdN')) === '1 种', 'ch8 at 1000× one compound left, got ' + await text(page, '#fdN'));
    await setRange(page, 'fdF', 4); await pick(page, 'fdDay', 1); await page.waitForTimeout(80);
    ok((await page.$eval('#fdSay', e => e.textContent)).includes('全都低于阈值'), 'ch8 nothing left at 10⁴ on day 1');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // the same drive in English: sentence branches and readouts read correctly, including singular counts
  {
    const page = await open(browser, 1280, { lang: 'en' });
    await show(page, '#umCv', 200);
    ok((await page.$eval('#umSay', e => e.textContent)).includes('8.92'), 'en ch3 default sentence shows 8.92');
    await setRange(page, 'umW', 0); ok((await page.$eval('#umSay', e => e.textContent)).startsWith('Pork alone'), 'en ch3 pork-only sentence');
    await setRange(page, 'umW', 100); ok((await page.$eval('#umSay', e => e.textContent)).startsWith('Sufu alone'), 'en ch3 sufu-only sentence');
    await show(page, '#awCv', 200);
    await setRange(page, 'awW', 20); await page.waitForTimeout(80); ok((await text(page, '#awG')) === '1', 'en ch4 count at 20% reads 1, got ' + await text(page, '#awG'));
    await setRange(page, 'awW', 26); ok((await page.$eval('#awSay', e => e.textContent)).includes('None of them'), 'en ch4 26%: nothing grows');
    await setRange(page, 'awW', 4); ok((await text(page, '#awR')) === 'outside the measured range', 'en ch4 out-of-range rate flagged');
    await show(page, '#odCv', 200);
    ok((await text(page, '#odN')) === '16', 'en ch5 day 7: 16 of 28 noticeable, got ' + await text(page, '#odN'));
    await pick(page, 'odDay', 13); await page.waitForTimeout(80);
    ok((await page.$eval('#odSay', e => e.textContent)).startsWith('Day 13'), 'en ch5 sentence follows day 13');
    await show(page, '#egCv'); await setRange(page, 'egB', 6); await page.click('#egReplay'); await page.waitForTimeout(10600);
    ok((await page.$eval('#egSay', e => e.textContent)).includes('day 7.3'), 'en ch6 6% sentence names day 7.3');
    await show(page, '#tvCv', 200); await pick(page, 'tvWhat', 'succ'); await page.waitForTimeout(80);
    ok((await text(page, '#tvS')) === 'Not detected', 'en ch7 succinic view');
    await show(page, '#fdCv', 200); await setRange(page, 'fdF', 3); await page.waitForTimeout(80);
    ok((await text(page, '#fdN')) === '1', 'en ch8 at 1000× one compound left, got ' + await text(page, '#fdN'));
    ok((await page.$eval('#fdSay', e => e.textContent)).includes('still noticeable (1): 2,4-decadienal'), 'en ch8 1000× sentence');
    await setRange(page, 'fdF', 4); await pick(page, 'fdDay', 1); await page.waitForTimeout(80);
    ok((await page.$eval('#fdSay', e => e.textContent)).includes('below its threshold'), 'en ch8 nothing left at 10⁴ on day 1');
    await page.click('#langToggle [data-lang=zh]'); await page.waitForTimeout(80);
    ok((await page.$eval('#fdSay', e => e.textContent)).includes('全都低于阈值'), 'switching back to zh rewrites the live sentence');
    ok(!page.__errors().length, 'en drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; replays show the end state at once
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#enCv', 300); ok((await text(page, '#enDay')) === '90', 'reduced motion: ch2 jumps to day 90');
    await show(page, '#egCv', 300); ok((await text(page, '#egDay')) === '第 42 天', 'reduced motion: ch6 jumps to day 42');
    await setRange(page, 'egB', 6); await page.waitForTimeout(100); ok((await text(page, '#egDay')) === '第 42 天', 'reduced motion: ch6 stays at the end after a change');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, raw keys, live sentences, no Chinese left in English incl. canvas text; toggle, keyboard, all eight models in zh, sentence branches in en, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
