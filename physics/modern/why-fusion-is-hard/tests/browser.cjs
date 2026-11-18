'use strict';
// Browser smoke test for the fusion essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18986 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node physics/modern/why-fusion-is-hard/tests/browser.cjs
// Optional SHOTS_DIR=<dir> saves full-page screenshots per width.
// Checks in Chinese and in English at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped in its own box,
// every control at least 48×48 px, the toggle reads 中 | EN; the nine static diagrams (labels from copy, inside the SVG, no overlap, ≥ 11 px).
// English only: no CJK left visible (text, aria-labels, title, description) apart from the 中 toggle; dates and money read as English.
// Then: language switch redraws the canvases; keyboard operation of a slider and a radio group; every model responding to its controls; reduced motion.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18986').replace(/\/$/, '');
const url = base + '/physics/modern/why-fusion-is-hard/';
const shots = process.env.SHOTS_DIR;
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
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
// the page scrolls smoothly (over a second for a long jump), and canvases draw only on screen: jump instantly so a canvas can be read back
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, v) => page.click(`input[name=${name}][value="${v}"]`, { force: true });

(async () => {
  const browser = await chromium.launch();

  for (const lang of ['zh', 'en']) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); }
    const clippedText = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clippedText.length, `${tag}: clipped text: ${clippedText.join(', ')}`);
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
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /\{\w+\}|^\w+(\.\w+)+$|NaN|undefined/.test(e.textContent.trim())).map(e => e.dataset.i18n || e.dataset.i18nHtml));
    ok(!raw.length, `${tag}: unresolved text in ${raw.slice(0, 5).join(', ')}`);
    // static diagrams (STANDARD §4a): present, labelled from copy, labels inside the SVG, not overlapping, at least 11 px
    const dia = await page.evaluate(() => [...document.querySelectorAll('figure.dia')].map(fg => {
      const svg = fg.querySelector('svg'), box = svg.getBoundingClientRect(), out = { id: fg.id, problems: [] };
      const texts = [...svg.querySelectorAll('text')], rs = texts.map(t => t.getBoundingClientRect());
      out.n = texts.length;
      if (svg.getAttribute('role') !== 'img' || !(svg.getAttribute('aria-label') || '').trim()) out.problems.push('no role/aria-label');
      if (/[{}]/.test(svg.getAttribute('aria-label') || '')) out.problems.push('unresolved aria-label');
      if (!(fg.querySelector('figcaption').textContent || '').trim()) out.problems.push('empty caption');
      if (box.width < 200 || box.height < 80) out.problems.push('svg too small ' + box.width.toFixed(0) + '×' + box.height.toFixed(0));
      if (svg.querySelectorAll('path,polyline,circle,ellipse,rect').length < 3) out.problems.push('no drawing');
      texts.forEach((t, i) => {
        const s = t.textContent.trim(), r = rs[i];
        if (!s || /\{\w+\}|^dg\d\.|NaN|undefined/.test(s)) out.problems.push('bad label "' + s + '"');
        if (parseFloat(getComputedStyle(t).fontSize) * box.width / svg.viewBox.baseVal.width < 11) out.problems.push('label under 11px: ' + s);
        if (r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5) out.problems.push('label outside the svg: ' + s);
        for (let j = 0; j < i; j++) { const q = rs[j]; if (r.left < q.right - 0.5 && q.left < r.right - 0.5 && r.top < q.bottom - 0.5 && q.top < r.bottom - 0.5) out.problems.push('labels overlap: ' + s + ' / ' + texts[j].textContent.trim()); }
      });
      return out;
    }));
    ok(dia.length >= 6, `${tag}: at least six diagrams, found ${dia.length}`);
    ok(JSON.stringify(dia.map(d => d.id)) === JSON.stringify(['dgRx', 'dgWall', 'dgTun', 'dgBal', 'dgTok', 'dgSize', 'dgIcf', 'dgPlant', 'dgBuild']), `${tag}: diagram list ${dia.map(d => d.id).join(',')}`);
    for (const d of dia) { ok(d.n >= 3, `${tag}: ${d.id} has ${d.n} labels`); ok(!d.problems.length, `${tag}: ${d.id}: ${d.problems.join('; ')}`); }
    // every chapter that introduces a structure has its diagram before the chapter's first model
    const order = await page.evaluate(() => [...document.querySelectorAll('figure.dia')].map(fg => { const ch = fg.closest('section'), lab = ch.querySelector('figure.lab'); return ch.id + ':' + Boolean(fg.compareDocumentPosition(lab) & Node.DOCUMENT_POSITION_FOLLOWING); }));
    ok(order.join(' ') === 'ch1:true ch2:true ch3:true ch4:true ch5:true ch6:true ch7:true ch8:true ch9:true', `${tag}: diagrams sit before the models: ${order.join(' ')}`);
    // the size comparison is drawn to scale from the model's design points
    const scale = await page.evaluate(() => { const P = window.FusionModels.PRESETS, es = [...document.querySelectorAll('#dgSizeSvg ellipse')].map(e => ({ cx: +e.getAttribute('cx'), rx: +e.getAttribute('rx'), ry: +e.getAttribute('ry') }));
      return { rx: es[0].rx / es[1].rx, a: P.iter.a / P.sparc.a, ry: es[0].ry / es[1].ry, h: P.iter.a * P.iter.kappa / (P.sparc.a * P.sparc.kappa), dx: (es[0].cx - es[1].cx) / es[0].rx, dR: (P.iter.R - P.sparc.R) / P.iter.a }; });
    ok(Math.abs(scale.rx - scale.a) < 1e-6 && Math.abs(scale.ry - scale.h) < 1e-6 && Math.abs(scale.dx - scale.dR) < 1e-6, `${tag}: size diagram is to scale ${JSON.stringify(scale)}`);
    // readout tiles: the value must fit its tile on one or two lines and must not be cut off
    const tiles = await page.evaluate(() => [...document.querySelectorAll('.read b, .reads b, .tile b, figure.lab output')].filter(e => { const r = e.getBoundingClientRect(), pr = e.parentElement.getBoundingClientRect(); return r.width && (r.right > pr.right + 1 || r.left < pr.left - 1); }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim() + '"'));
    ok(!tiles.length, `${tag}: readout wider than its tile: ${tiles.join(', ')}`);
    // the ch7 laser beams carry arrowheads
    ok(await page.evaluate(() => [...document.querySelectorAll('#dgIcf path.s-cy')].filter(p => (p.getAttribute('marker-end') || '').includes('awCyBig')).length) === 4, `${tag}: four laser beams with arrowheads in the ch7 diagram`);
    if (lang === 'en') {
      // nothing Chinese left on the English page, apart from the 中 toggle label: visible text, aria-labels, title, description
      const cjk = await page.evaluate(() => {
        const re = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/, out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) { const el = n.parentElement; if (!el || el.closest('script,style,#langToggle')) continue; if (re.test(n.textContent)) out.push((el.id || el.dataset.i18n || el.dataset.i18nHtml || el.tagName) + ': ' + n.textContent.trim().slice(0, 30)); }
        for (const el of document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = el.getAttribute(a); if (v && re.test(v) && !el.closest('#langToggle')) out.push(a + ': ' + v.slice(0, 30)); }
        if (re.test(document.title)) out.push('title: ' + document.title);
        const md = document.querySelector('meta[name=description]'); if (md && re.test(md.content)) out.push('description');
        return out;
      });
      ok(!cjk.length, `${tag}: CJK visible in English: ${cjk.slice(0, 6).join(' | ')}`);
      ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.getAttribute('aria-pressed')))) === '["false","true"]', `${tag}: EN is the pressed toggle`);
      const body = await page.evaluate(() => document.body.innerText);
      ok(!/\b\d{4}-\d{1,2}(-\d{1,2})?\b/.test(body), `${tag}: an ISO-style date is left in the English text: ${(body.match(/\b\d{4}-\d{1,2}(-\d{1,2})?\b/) || [''])[0]}`);
      ok(body.includes('5 December 2022') && body.includes('7 April 2025') && body.includes('As of November 2026'), `${tag}: English dates read naturally`);
      ok((await text(page, '#fdPlan')) === '$30.0 billion' && (await text(page, '#fdAct')) === '$11.6 billion', `${tag}: funding readouts in billions: ${await text(page, '#fdPlan')}, ${await text(page, '#fdAct')}`);
      ok(body.includes('€5 billion') && body.includes('$4.48 billion') && !/million dollars|billion euros/.test(body), `${tag}: money reads as English`);
    } else {
      ok((await text(page, '#fdPlan')) === '300 亿美元' && (await text(page, '#fdAct')) === '116 亿美元', `${tag}: funding readouts in 亿美元: ${await text(page, '#fdPlan')}, ${await text(page, '#fdAct')}`);
      ok(!(await page.evaluate(() => document.body.innerText)).includes('百万美元'), `${tag}: no 百万美元 left`);
    }
    if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, `${lang}-${width}-full.png`), fullPage: true }); }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  // language toggle (switches text, readouts and canvases both ways), keyboard, and every model
  {
    const page = await open(browser, 1280);
    await show(page, '#fdCv', 300);
    const cvZh = await page.$eval('#fdCv', c => c.toDataURL());
    await page.click('#langToggle [data-lang=en]'); await page.waitForTimeout(300);
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'html lang follows the toggle');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys shown after switching');
    ok((await text(page, '#fdPlan')) === '$30.0 billion', 'switching to English reformats the funding readout: ' + await text(page, '#fdPlan'));
    ok((await text(page, '#fdSay')).includes('$11.6 billion'), 'switching to English rewrites the live sentence');
    const cvEn = await page.$eval('#fdCv', c => c.toDataURL());
    ok(cvZh.length > 20000 && cvEn.length > 20000, 'the funding canvas is drawn in both languages');
    ok(cvEn !== cvZh, 'switching language redraws the canvas (axis labels and units change)');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'the choice is stored in knowledge-lang');
    // English model checks: a live sentence and a keyboard-driven control
    await show(page, '#tkCv'); await pick(page, 'tkP', 'sparc'); await page.click('#tkPk', { force: true }); await page.waitForTimeout(150);
    ok(/^Q = 6\.79: fusion power of 152 MW, with 22 MW of external heating needed/.test(await text(page, '#tkSay')), 'en ch6 SPARC with the published assumptions: ' + await text(page, '#tkSay'));
    await page.click('#tkPk', { force: true }); await pick(page, 'tkP', 'iter');
    await show(page, '#fdCv', 300);
    await page.click('#langToggle [data-lang=zh]'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await text(page, '#fdPlan')) === '300 亿美元', 'switching back restores the Chinese readout');
    // (not compared byte for byte with the first Chinese frame: glyph antialiasing differs between two draws of the same text)
    { const back = await page.$eval('#fdCv', c => c.toDataURL()); ok(back !== cvEn && back.length > 20000, 'switching back redraws the canvas again'); }

    // keyboard: arrow keys move a slider and a radio group
    await show(page, '#cbT', 200); await page.focus('#cbT'); await page.keyboard.press('ArrowRight');
    ok((await text(page, '#cbTo')).startsWith('11'), 'keyboard moves the temperature slider: ' + await text(page, '#cbTo'));
    await page.focus('input[name=bdRx][value=dt]'); await page.keyboard.press('ArrowRight');
    ok(await page.$eval('input[name=bdRx][value=ddn]', e => e.checked), 'arrow key moves the reaction radio group');
    const focusRing = await page.evaluate(() => { const e = document.activeElement.closest('label'); return getComputedStyle(e).outlineStyle; });
    ok(focusRing !== 'none', 'focused radio shows a focus ring');

    await show(page, '#bdCv'); await pick(page, 'bdRx', 'pb11'); await page.waitForTimeout(150);
    ok((await text(page, '#bdQ')).startsWith('8.68'), 'ch1 p–B11 Q = 8.68: ' + await text(page, '#bdQ'));
    await show(page, '#cbCv'); await setRange(page, 'cbT', 100); await page.waitForTimeout(150);
    ok((await text(page, '#cbSay')).includes('74 倍'), 'ch2 at 100 keV: 74× the solar core');
    await show(page, '#gmCv'); await setRange(page, 'gmT', 100); await page.waitForTimeout(150);
    ok((await text(page, '#gmSay')).includes('67 keV'), 'ch3 past the D–T peak at 67 keV');
    await show(page, '#lwCv'); await setRange(page, 'lwN', 23); await page.waitForTimeout(150);
    ok((await text(page, '#lwQ')) === '已点火', 'ch4 top of the diagram is ignited');
    await show(page, '#orCv', 300);
    ok((await text(page, '#orKind')) === '漂到壁上', 'ch5 without twist the ion drifts to the wall');
    await page.click('#orTwist', { force: true }); await page.waitForTimeout(400);
    ok((await text(page, '#orKind')) === '通行粒子', 'ch5 with twist the ion is confined: ' + await text(page, '#orKind'));
    await pick(page, 'orSp', 'alpha'); await setRange(page, 'orPitch', 0.3); await setRange(page, 'orQ', 6); await page.waitForTimeout(400);
    ok((await text(page, '#orKind')) === '撞壁丢失', 'ch5 fat alpha banana at q = 6 is lost');
    await show(page, '#tkCv'); await pick(page, 'tkP', 'sparc'); await page.waitForTimeout(150);
    ok((await text(page, '#tkI')).startsWith('8.7'), 'ch6 SPARC preset current 8.7 MA');
    ok(await page.$eval('#tkB', e => e.value) === '12.2', 'ch6 preset moves the field slider');
    ok(await page.$eval('#tkT', e => e.value) === '7.3' && await page.$eval('#tkF', e => e.value) === '0.37', 'ch6 SPARC preset sets 7.3 keV and 37% of the Greenwald limit');
    const want = await page.evaluate(() => { const M = window.FusionModels; return [false, true].map(peaked => M.tokamak({ preset: 'sparc', peaked }).Q.toFixed(2)); });
    ok(want[0].startsWith('3.3') && want[1] === '6.79', 'ch6 model values for SPARC: ' + want.join(', '));
    ok((await text(page, '#tkQ')) === want[0], 'ch6 SPARC with flat profiles: Q = ' + await text(page, '#tkQ'));
    await page.click('#tkPk', { force: true }); await page.waitForTimeout(150);
    ok((await text(page, '#tkQ')) === want[1] && (await text(page, '#tkPf')).startsWith('152'), 'ch6 SPARC with the published profile assumptions: Q = ' + await text(page, '#tkQ') + ', ' + await text(page, '#tkPf'));
    await page.click('#tkPk', { force: true });
    await show(page, '#icCv'); await setRange(page, 'icRho', 1.7); await page.waitForTimeout(150);
    ok((await text(page, '#icG')) === '—', 'ch7 too diffuse: no gain');
    await show(page, '#skCv'); await setRange(page, 'skQ', 0); await page.waitForTimeout(150);
    ok(parseFloat(await text(page, '#skQe')) < 1, 'ch8 Q_sci = 1 loses electricity');
    await show(page, '#trCv'); await setRange(page, 'trTbr', 1); await page.waitForTimeout(150);
    ok((await text(page, '#trTd')) === '不会翻倍', 'ch9 TBR = 1 never doubles');
    await show(page, '#whCv'); await setRange(page, 'whF', 0); await page.waitForTimeout(150);
    ok((await text(page, '#whQt')).startsWith('166'), 'ch9 ITER-size target with no radiation: 166 MW/m², got ' + await text(page, '#whQt'));
    await show(page, '#fxCv'); await page.click('#fxProj', { force: true }); await page.waitForTimeout(150);
    ok(!(await text(page, '#fxSay')).includes('空心点'), 'ch10 projections sentence follows the checkbox');
    await show(page, '#fdCv'); await pick(page, 'fdL', 'V'); await page.waitForTimeout(150);
    ok((await text(page, '#fdDemo')) === '1990', 'ch11 Logic V DEMO 1990');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll, the orbit replay shows its end state at once
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#orCv', 200);
    const a = await page.$eval('#orCv', c => c.toDataURL()); await page.waitForTimeout(600); const b = await page.$eval('#orCv', c => c.toDataURL());
    ok(a === b, 'reduced motion: the orbit is drawn complete, not animated');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (shots) await page.screenshot({ path: path.join(shots, 'zh-390-reduced-orbit.png') });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, unresolved text, nine diagrams, readout tiles; en: no CJK, dates, money; toggle both ways with canvas redraw, keyboard, all eleven chapters\' models, reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
