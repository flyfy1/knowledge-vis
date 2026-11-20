'use strict';
// Browser test for the essay on how three.js draws a scene.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18961 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/software/how-threejs-draws-a-scene/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes a full-page screenshot and one per diagram and per model at each width (never into
// the repo). Run browser tests one at a time.
// Checks at 1280/390/320 (Chinese; English too once page.json no longer declares "languages": {"en": "stub"}): no
// console or page errors, no horizontal overflow, no clipped text, every control at least 48×48 px, no raw copy keys in
// the DOM or on a canvas, every readout and live sentence filled; the eleven static diagrams (STANDARD §4a): role=img
// with an aria-label from the copy, every label non-empty, inside the drawing, not overlapping another label, and
// rendered at 11 px or more. Then: the English stub falls back to Chinese; every branch of every live sentence, driven
// through the controls, matches its template; readouts against the models; pointer picking; keyboard; reduced motion.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18961').replace(/\/$/, '');
const url = base + '/computing/software/how-threejs-draws-a-scene/';
const SHOT = process.env.SHOT_DIR || '';
const DIAGRAMS = 11, LABS = 13;
const fails = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };

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
const setCheck = (page, id, on) => page.evaluate(([id, on]) => { const e = document.getElementById(id); if (e.checked !== on) e.click(); }, [id, on]);
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
// a template from the copy as a regex over the rendered text: tags dropped, {vars} match anything
const pre = key => Z[key].replace(/<[^>]+>/g, '').split('{')[0]; // the fixed text before a template's first {var}
const tre = key => { const s = Z[key].replace(/<[^>]+>/g, ''); return new RegExp(s.split(/\{\w+\}/).map(p => p.replace(/[.*+?^$()|[\]\\]/g, '\\$&')).join('[\\s\\S]*?')); };
async function says(page, sayId, key, tag) { const s = await text(page, '#' + sayId); ok(tre(key).test(s), `${tag}: #${sayId} should follow ${key}; got "${s.slice(0, 90)}"`); }

function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia[data-dg]')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg || getComputedStyle(svg).display === 'none') { out.push(name + ': no visible svg'); continue; }
    if (svg.getAttribute('role') !== 'img') out.push(name + ': role');
    const al = svg.getAttribute('aria-label') || '';
    if (al.length < 8 || /^dg\./.test(al)) out.push(name + ': aria-label "' + al + '"');
    const cap = fig.querySelector('figcaption'); if (!cap || cap.textContent.trim().length < 8) out.push(name + ': caption');
    const vb = svg.viewBox.baseVal, k = svg.getBoundingClientRect().width / vb.width;
    const boxes = [];
    for (const t of svg.querySelectorAll('text')) {
      const s = t.textContent.trim();
      if (!s || /^dg\./.test(s) || /\{\w+\}/.test(s)) { out.push(name + ': label "' + s + '"'); continue; }
      const b = t.getBBox(), fs = parseFloat(t.getAttribute('font-size')) * k;
      if (fs < 11) out.push(`${name}: "${s.slice(0, 12)}" renders at ${fs.toFixed(1)}px`);
      if (b.x < -0.5 || b.y < -0.5 || b.x + b.width > vb.width + 0.5 || b.y + b.height > vb.height + 0.5) out.push(`${name}: "${s.slice(0, 14)}" outside the drawing`);
      boxes.push([s, b]);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [s1, a] = boxes[i], [s2, b] = boxes[j], pad = 1;
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (ix > pad && iy > pad) out.push(`${name}: "${s1.slice(0, 12)}" overlaps "${s2.slice(0, 12)}"`);
    }
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const stub = await (async () => { const p = await open(browser, 1280); const s = await p.evaluate(() => !window.ESSAY_COPY.en || document.documentElement.dataset.langEn === 'stub'); await p.close(); return s; })();
  const langs = stub ? ['zh'] : ['zh', 'en'];
  if (stub) console.log('NOTE: content.en.md is a structural stub (page.json languages.en: stub); English width sweep skipped');
  const CJK = /[　-〿㐀-鿿＀-￯]/;

  for (const lang of langs) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia[data-dg]', s => s.length) === DIAGRAMS, `${tag}: ${DIAGRAMS} diagrams`);
    ok(await page.$$eval('figure.lab', s => s.length) === LABS, `${tag}: ${LABS} models`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.fmt td, table.fmt th, pre.code')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const spill = await page.evaluate(() => [...document.querySelectorAll('.ctl label')].filter(l => { const r = l.getBoundingClientRect(); if (!r.width) return false; return [...l.children].some(c => { const q = c.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.left < r.left - 1); }); }).slice(0, 5).map(l => (l.querySelector('input') || {}).id || l.textContent.trim().slice(0, 20)));
    ok(!spill.length, `${tag}: control parts spill out of their label: ${spill.join(', ')}`);
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
    const outside = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
      if (e.closest('defs') || e.closest('.tblwrap table') || e.closest('pre.code')) return false; // the table and the code scroll in their own box
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!outside.length, `${tag}: elements outside the viewport: ${outside.join(', ')}`);
    // a copy key left as text ("three.js" is not one)
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^(ch\d+|u|dg|meta|site|toc)\.[\w.-]+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure')].filter(e => /\{[a-zA-Z_]\w*\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
    ok(await page.evaluate(() => window.__ft.size) > 20, `${tag}: canvases drew their labels`);
    // every canvas has pixels (the IntersectionObserver gate drew each one once it was on screen)
    const blank = await page.evaluate(() => [...document.querySelectorAll('figure.lab canvas')].filter(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4 * 97) if (d[i]) return false; return true; }).map(c => c.id));
    ok(!blank.length, `${tag}: blank canvases: ${blank.join(', ')}`);
    if (lang === 'en') {
      const left = await page.evaluate(re => { const rx = new RegExp(re), out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) { if (!rx.test(n.textContent)) continue; if (n.parentElement.closest('#langToggle')) continue;
          const pz = n.parentElement.closest('.page-provenance .provenance-zh'); if (pz && getComputedStyle(pz).display === 'none') continue;
          out.push(n.textContent.trim().slice(0, 24)); }
        for (const t of window.__ft) if (rx.test(t)) out.push('canvas ' + t); return out.slice(0, 6); }, CJK.source);
      ok(!left.length, `${tag}: Chinese left in English: ${left.join(' | ')}`);
    }
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    if (SHOT) {
      await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
      for (const fig of await page.$$('figure')) {
        const id = await fig.evaluate(e => e.id || e.dataset.dg);
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(120);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }

  /* the English stub: choosing EN keeps Chinese and says so in <html lang> */
  if (stub) {
    const page = await open(browser, 1280, { lang: 'en' });
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'en stub: falls back to Chinese (html lang zh-CN)');
    ok((await text(page, 'h1')) === 'Three.js 是怎么把一个场景画出来的', 'en stub: Chinese title shown');
    ok(await page.$eval('#langToggle button[data-lang=en]', b => b.getAttribute('aria-pressed')) === 'true', 'en stub: toggle still records the choice');
    await page.close();
  }

  /* every live-sentence branch, through the controls, and readouts against the models */
  {
    const page = await open(browser, 1280);
    const T = 'branches';
    // ch2
    await says(page, 'c2Say', 'ch2.say.fresh', T);
    ok((await text(page, '#c2Work')) === '6 / 5' && (await text(page, '#c2Orb')) === '1.00', 'ch2: 6 composes / 5 products (the root copies), moon orbit 1.00');
    await setRange(page, 'c2Scale', 1.5); ok((await text(page, '#c2Orb')) === '3.00', 'ch2: earth scale 1.5 → moon orbit 3.00');
    await setCheck(page, 'c2Stale', true); await says(page, 'c2Say', 'ch2.say.stale', T);
    ok((await text(page, '#c2Lag')) !== '—', 'ch2: lag shown when reading early');
    // ch3
    await says(page, 'c3Say', 'ch3.say.box', T);
    ok((await text(page, '#c3V')) === '24' && (await text(page, '#c3T')) === '12', 'ch3: box 24 / 12');
    await pick(page, 'c3Kind', 'sphere'); await says(page, 'c3Say', 'ch3.say.sphere', T);
    ok((await text(page, '#c3V')) === '561' && (await text(page, '#c3T')) === '960', 'ch3: sphere 32×16 → 561 / 960');
    await setRange(page, 'c3Seg', 16); ok((await text(page, '#c3IB')).includes('Uint16'), 'ch3: 64×32 sphere still Uint16');
    // ch4
    await says(page, 'c4Say', 'ch4.say.in', T);
    ok((await text(page, '#c4Dep')) === '16,610,273' && (await text(page, '#c4Win')) === '(717.2, 398.6)', 'ch4: default point → 16,610,273 at (717.2, 398.6)');
    await setRange(page, 'c4D', -1.5); await says(page, 'c4Say', 'ch4.say.out', T); ok((await text(page, '#c4Say')).includes(Z['ch4.why.near']), 'ch4: nearer than near');
    await setRange(page, 'c4D', 3.5); ok((await text(page, '#c4Say')).includes(Z['ch4.why.far']), 'ch4: beyond far');
    await setRange(page, 'c4D', 1);
    // ch4 depth
    await says(page, 'c4dSay', 'ch4.d.say', T);
    ok((await text(page, '#c4dA')) === '130' && (await text(page, '#c4dB')) === Z['ch4.d.never'], 'ch4 depth: z-fighting from 130; log never');
    await setRange(page, 'c4dN', 0); ok((await text(page, '#c4dA')) === '410', 'ch4 depth: near 1 → 410');
    // ch5
    await says(page, 'c5Say', 'ch5.say.sorted', T);
    ok((await text(page, '#c5Say')).includes(pre('ch5.say.fp')), 'ch5: the false positive is named');
    ok([await text(page, '#c5Vis'), await text(page, '#c5Cull'), await text(page, '#c5Fp'), await text(page, '#c5Sw')].join() === '12,6,1,3', 'ch5: 12 drawn, 6 culled, 1 false positive, 3 switches (r187-confirmed scene)');
    await setCheck(page, 'c5Sort', false); await says(page, 'c5Say', 'ch5.say.unsorted', T); ok((await text(page, '#c5Sw')) === '10', 'ch5: unsorted 10 switches');
    await setCheck(page, 'c5Sort', true); await setRange(page, 'c5Yaw', 0); await setRange(page, 'c5Far', 8); await setRange(page, 'c5Fov', 30);
    ok((await text(page, '#c5Fp')) === '0' && !(await text(page, '#c5Say')).includes(pre('ch5.say.fp')), 'ch5: no false positive, no sentence about it');
    // ch6
    await says(page, 'c6Say', 'ch6.say.base', T);
    ok((await text(page, '#c6N')) === '5' && (await page.$$eval('#c6Tbl tbody tr', r => r.length)) === 6, 'ch6: six materials, five programs');
    await setCheck(page, 'c6Point', true); await says(page, 'c6Say', 'ch6.say.changed', T);
    ok((await text(page, '#c6Say')).includes(Z['ch6.why.light']) && (await text(page, '#c6New')) === '4' && (await page.$$eval('#c6Tbl tr.new', r => r.length)) === 5, 'ch6: a light recompiles the four lit programs; the Basic sky keeps its own (as measured in r187)');
    await setCheck(page, 'c6Point', false); await setCheck(page, 'c6Fog', true); await says(page, 'c6Say', 'ch6.say.changed', T);
    ok(!(await text(page, '#c6Say')).includes(Z['ch6.why.light']) && (await text(page, '#c6Say')).includes(Z['ch6.why.fog']) && (await text(page, '#c6New')) === '4', 'ch6: fog re-keys the fogged materials only');
    await setCheck(page, 'c6Tone', true); await says(page, 'c6Say', 'ch6.say.changed', T);
    ok((await text(page, '#c6Say')).includes(Z['ch6.why.tone']) && (await text(page, '#c6New')) === '5' && (await page.$$eval('#c6Tbl tr.new', r => r.length)) === 6, 'ch6: tone mapping recompiles all six materials, five programs');
    await setCheck(page, 'c6Tone', false);
    const key = await page.$eval('#c6Tbl tbody tr:nth-child(3) td:last-child', e => e.textContent);
    ok(key.startsWith('physical,STANDARD') && key.includes('mask2='), 'ch6: key parts shown');
    // ch7
    await says(page, 'c7Say', 'ch7.say', T); ok((await text(page, '#c7Say')).includes(pre('ch7.say.on')), 'ch7: compensation on');
    await setRange(page, 'c7R', 1); ok((await text(page, '#c7Lost')) === M.fmt(M.energyLost(1, 1) * 100, 1) + '%', 'ch7: energy lost at roughness 1 = model');
    await setCheck(page, 'c7MS', false); ok((await text(page, '#c7Say')).includes(Z['ch7.say.off']), 'ch7: compensation off');
    ok((await text(page, '#c7D')) === M.sig(M.D_GGX(1, 1), 3), 'ch7: D at α = 1 is 1/π');
    // ch8
    await says(page, 'c8Say', 'ch8.say.pair', T); ok((await text(page, '#c8Wr')) === '0', 'ch8: opaque order changes nothing');
    await pick(page, 'c8Scene', 'checker'); await says(page, 'c8Say', 'ch8.say.checker.on', T);
    await setCheck(page, 'c8Persp', false); await says(page, 'c8Say', 'ch8.say.checker.off', T); ok((await text(page, '#c8Wr')) === '707', 'ch8: 707 pixels differ without perspective correction');
    await pick(page, 'c8Scene', 'glass'); await says(page, 'c8Say', 'ch8.say.glass', T);
    ok((await text(page, '#c8Say')).includes(Z['ch8.why.cross']) && (await text(page, '#c8Wr')) === '317', 'ch8: crossing glass, 317 wrong');
    await setCheck(page, 'c8Cross', false); ok((await text(page, '#c8Say')).includes(Z['ch8.why.ok']) && (await text(page, '#c8Wr')) === '0', 'ch8: separate glass back to front is right');
    await setCheck(page, 'c8Order', false); ok((await text(page, '#c8Say')).includes(Z['ch8.why.front']) && (await text(page, '#c8Wr')) === '455', 'ch8: front to back, 455 wrong');
    // ch9
    for (const f of ['nearest', 'linear', 'trilinear', 'aniso']) { await pick(page, 'c9F', f); await says(page, 'c9Say', 'ch9.say', T); ok((await text(page, '#c9Say')).includes(Z['ch9.why.' + f]), 'ch9: ' + f); }
    await setCheck(page, 'c9L', true);
    // ch10
    await says(page, 'c10Say', 'ch10.say', T); ok((await text(page, '#c10Say')).includes(pre('ch10.say.acne')) && (await text(page, '#c10Acne')) === '50.8%', 'ch10: acne 50.8% at bias 0');
    await setRange(page, 'c10B', -0.03); ok((await text(page, '#c10Say')).includes(pre('ch10.say.leak')) && (await text(page, '#c10Gap')) === '0.280', 'ch10: bias −0.03 leaks; post shadow starts 0.280 away');
    await setRange(page, 'c10B', -0.003); await setCheck(page, 'c10Pcf', true); await says(page, 'c10Say', 'ch10.say', T);
    await setRange(page, 'c10Res', 10); await setRange(page, 'c10B', -0.004); ok((await text(page, '#c10Say')).includes(Z['ch10.say.noacne']), 'ch10: 1024 texels, small bias: no acne');
    // ch11
    await says(page, 'c11Say', 'ch11.say.fit', T); ok((await text(page, '#c11Say')).includes(Z['ch11.mv.static']), 'ch11: static');
    await setRange(page, 'c11N', 5); await says(page, 'c11Say', 'ch11.say.over', T);
    await setCheck(page, 'c11Mov', true); ok((await text(page, '#c11Say')).includes(pre('ch11.mv.moving')) && (await text(page, '#c11Up')) === M.bytesStr(100000 * 64), 'ch11: moving re-uploads 64 bytes each');
    // ch12 picking: hit, miss, and a sphere hit that misses the mesh (searched over the sliders)
    await says(page, 'c12Say', 'ch12.say.hit', T); ok((await text(page, '#c12T')) === '352', 'ch12: all 352 triangles tested');
    await setRange(page, 'c12X', 0.9); await setRange(page, 'c12Y', 0.9); await says(page, 'c12Say', 'ch12.say.miss', T); ok((await text(page, '#c12T')) === '0', 'ch12: nothing tested outside the sphere');
    let nearFound = false;
    for (let y = 0.2; y <= 0.8 && !nearFound; y += 0.04) { await setRange(page, 'c12X', 0); await setRange(page, 'c12Y', y.toFixed(2)); if ((await text(page, '#c12H')) === '—' && (await text(page, '#c12T')) === '352') nearFound = true; }
    ok(nearFound, 'ch12: a ray inside the bounding sphere that misses the mesh'); if (nearFound) await says(page, 'c12Say', 'ch12.say.near', T);
    const cv = await page.$('#c12Cv');
    await cv.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(100);
    const bb = await cv.boundingBox();
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    ok(Math.abs(await page.$eval('#c12X', e => +e.value)) <= 0.01 && Math.abs(await page.$eval('#c12Y', e => +e.value)) <= 0.01 && (await text(page, '#c12H')) !== '—', 'ch12: clicking the centre of the canvas moves the mouse there and picks a triangle');
    // ch12 slerp
    await says(page, 'c12sSay', 'ch12.s.say', T);
    ok((await text(page, '#c12sA')) === '148.4°' && (await text(page, '#c12sE')) === '263.2°', 'ch12: 148.4° apart, Euler path 263.2°');
    ok(!page.__errors().length, 'branches: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* keyboard */
  {
    const page = await open(browser, 390);
    await page.$eval('#c5Yaw', e => e.scrollIntoView({ block: 'center' }));
    const before = await text(page, '#c5Say');
    await page.focus('#c5Yaw'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('#c5Yaw', e => e.value)) === '-0.2' && (await text(page, '#c5Say')) !== before, 'keyboard: arrow keys turn the camera and update the sentence');
    await page.focus('input[name=c8Scene][value=pair]'); await page.keyboard.press('ArrowRight');
    ok((await page.$eval('input[name=c8Scene]:checked', e => e.value)) === 'checker', 'keyboard: arrow key moves between scene radios');
    await page.close();
  }

  /* reduced motion: nothing animates on its own */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(80); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    await page.$eval('#c12sCv', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150);
    const h1 = await page.evaluate(() => document.getElementById('c12sCv').toDataURL());
    await page.waitForTimeout(500);
    ok(h1 === await page.evaluate(() => document.getElementById('c12sCv').toDataURL()), 'reduced motion: canvases are still');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); console.error(`${checks - fails.length}/${checks} checks passed`); process.exit(1); }
  console.log(`${checks}/${checks} checks passed`);
})();
