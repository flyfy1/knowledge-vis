'use strict';
// Browser smoke test for the essay on how a network card moves packets.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18988 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-a-nic-moves-packets/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48x48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (English is a
// stub: the page falls back to Chinese and says so in <html lang>), keyboard operation of a slider, each of the ten
// models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18988').replace(/\/$/, '');
const url = base + '/computing/systems/how-a-nic-moves-packets/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const zf = (x, d) => M.fmt(x, d, 'zh');
const pct = (x, d) => zf(x * 100, d == null ? 0 : d) + '%';

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  await page.addInitScript(() => { window.__ft = new Set(); const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__ft.add(String(t)); return f.call(this, t, ...a); }; });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource') && !/request failed .*copy\.en\.js$/.test(e));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const show = async (page, sel, ms = 0) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); if (ms) await page.waitForTimeout(ms); };
const pick = (page, name, value) => page.$eval(`input[name=${name}][value="${value}"]`, e => e.click());
const click = (page, sel) => page.$eval(sel, e => e.click());
const canvasHash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });

// every static diagram: role, aria, labels non-empty, inside the viewBox, no two labels overlapping, ≥ 11 px rendered
function diagramCheck() {
  const out = [];
  for (const fig of document.querySelectorAll('figure.dia')) {
    const name = fig.dataset.dg, svg = fig.querySelector('svg');
    if (!svg) { out.push(name + ': no svg'); continue; }
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
  const stub = await (async () => { const p = await open(browser, 1280); const s = await p.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.enStub)); await p.close(); return s; })();
  const langs = stub ? ['zh'] : ['zh', 'en'];
  if (stub) console.log('NOTE: copy.en.js is a stub; English width sweep skipped');

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  for (const lang of langs) for (const width of [1280, 390, 320]) {
    const page = await open(browser, width, { lang });
    const tag = `${lang} ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === (lang === 'zh' ? 'zh-CN' : 'en'), `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200); }
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, `${tag}: diagrams: ${dg.slice(0, 8).join(' | ')}`);
    ok(await page.$$eval('figure.dia svg', s => s.length) === 8, `${tag}: eight diagrams (at least six required)`);
    const layouts = await page.$$eval('figure.dia svg', s => s.map(e => e.getAttribute('class')).join(''));
    ok(width >= 1280 ? /^w+$/.test(layouts) : /^n+$/.test(layouts), `${tag}: diagram layouts ${layouts}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, table.out td')].filter(e => {
      if (e.closest('pre')) return false;
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
      if (e.closest('defs')) return false;   // marker shapes are not laid out; the <svg> and what it draws are checked
      const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).slice(0, 5).map(e => e.tagName + '#' + e.id + '.' + e.className));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    const raw = await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].filter(e => /^\w+(\.[\w-]+)+$/.test(e.textContent.trim())).map(e => e.textContent.trim()).slice(0, 5));
    ok(!raw.length, `${tag}: raw keys shown: ${raw.join(', ')}`);
    const unfilled = await page.evaluate(() => [...document.querySelectorAll('main p, main li, main td, .say, figure, .chainL, table.out, pre.hex')].filter(e => /\{\w+\}/.test(e.textContent)).map(e => e.id || e.tagName).slice(0, 5));
    ok(!unfilled.length, `${tag}: unfilled placeholders: ${unfilled.join(', ')}`);
    const emptyRead = await page.evaluate(() => [...document.querySelectorAll('.read b')].filter(e => !e.textContent.trim()).map(e => e.id));
    ok(!emptyRead.length, `${tag}: empty readouts: ${emptyRead.join(', ')}`);
    const emptySay = await page.evaluate(() => [...document.querySelectorAll('.say')].filter(e => e.textContent.trim().length < 10).map(e => e.id));
    ok(!emptySay.length, `${tag}: live sentences empty: ${emptySay.join(', ')}`);
    const rawCanvas = await page.evaluate(() => [...window.__ft].filter(s => /^(ch\d+|u|dg)\.[\w.-]+$/.test(s) || /\{\w+\}/.test(s)).slice(0, 5));
    ok(!rawCanvas.length, `${tag}: raw keys on canvas: ${rawCanvas.join(', ')}`);
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
    if (SHOT) {
      await page.screenshot({ path: `${SHOT}/full-${lang}-${width}.png`, fullPage: true });
      for (const fig of await page.$$('figure')) {
        const id = await fig.evaluate(e => e.dataset.dg ? 'dg-' + e.dataset.dg : 'lab-' + (e.closest('section') || {}).id + '-' + [...e.closest('section').querySelectorAll('figure.lab')].indexOf(e));
        await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150);
        await fig.screenshot({ path: `${SHOT}/${lang}-${width}-${id}.png` });
      }
    }
    await page.close();
  }


  {
    const page = await open(browser, 1280);
    const P = M.prose();
    const dur = x => x >= 1000 ? zf(x / 1000, x >= 10000 ? 1 : 2) + ' 毫秒' : x >= 1 ? zf(x, x < 10 ? 2 : x < 100 ? 1 : 0) + ' 微秒' : zf(x * 1000, 0) + ' 纳秒';
    const mpps = x => zf(x / 1e6, x >= 1e8 ? 0 : x >= 1e7 ? 1 : 2) + ' 百万包/秒';
    const cores = x => zf(x, x < 10 ? 1 : 0) + ' 个核';
    const say = async id => page.$eval('#' + id, e => e.textContent);
    ok((await text(page, 'h1')) === '网卡是怎么搬运数据包的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch2', e => e.textContent)).includes('每秒 ' + zf(P.pps64[0], 0) + ' 百万个'), 'ch2 prose quotes the packet rate from the model');
    ok((await page.$eval('#ch5', e => e.textContent)).includes(M.hex(P.v4h[0])), 'ch5 prose quotes the Toeplitz hash from the model');

    // ch2 frame and budget
    await show(page, '#frHex', 100);
    ok((await text(page, '#frFcs')) === M.hex(M.frame(1518, false, false).fcs) && await page.$eval('#frRx', e => e.className) === 'n', 'ch2 default: 1518-byte frame, FCS matches');
    ok((await text(page, '#frPps')) === mpps(M.budget(400, 1518).pps) && (await text(page, '#frNs')) === zf(P.nsTop[0], 1) + ' 纳秒', 'ch2 default: 400G 1518 B');
    await click(page, '#frFlip'); await page.waitForTimeout(30);
    ok(await page.$eval('#frRx', e => e.className) === 'r' && (await say('frSayF')).includes('CRC') && (await page.$$eval('#frHex .h', s => s.length)) === 1, 'ch2 one flipped bit: mismatch, highlighted');
    await click(page, '#frVlan'); await page.waitForTimeout(30);
    ok((await text(page, '#frHex')).includes('81 00 00 64') && !(await page.$eval('#frLtag', e => e.hidden)), 'ch2 VLAN tag shown');
    await setRange(page, 'frSz', 0); await page.waitForTimeout(30);
    ok((await text(page, '#frNs')) === zf(P.ns64[0], 2) + ' 纳秒' && (await text(page, '#frPps')) === mpps(M.budget(400, 64).pps), 'ch2 64-byte frames at 400G');
    ok((await text(page, '#frFcs')) === M.hex(M.frame(64, true, true).fcs), 'ch2 FCS follows size and tag');
    await page.focus('#frSp'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(40);
    ok((await text(page, '#frSpo')) === '800G', 'ch2 speed by keyboard to 800G');

    // ch3 prefetch
    await show(page, '#pfSay', 100);
    ok((await text(page, '#pfNeed')) === zf(P.pfNeed[0], 0) && (await text(page, '#pfMax')) === mpps(P.pfMax[0] * 1e6) && (await text(page, '#pfFrac')) === pct(P.pfFrac[0]), 'ch3 default: 326 in flight, 32 reads short');
    ok((await page.$eval('input[name=pfL][value="1"]', e => e.parentElement.textContent)).includes('547'), 'ch3 latency labels filled from the model');
    await setRange(page, 'pfK', 4); await page.waitForTimeout(30);
    ok((await text(page, '#pfFrac')) === '100%', 'ch3 64 outstanding reads keep up');

    // ch4 PCIe
    await show(page, '#pcTbl', 100);
    ok((await text(page, '#pcNeed')) === zf(P.p64need[0], 0) + ' Gb/s' && (await text(page, '#pcAvail')) === zf(P.g5avail[0], 0) + ' Gb/s' && (await text(page, '#pcFrac')) === pct(P.p64frac[0]), 'ch4 default: 64 B at 400G on Gen5 x16');
    ok((await page.$$eval('#pcTbl tbody tr', r => r.length)) === 7, 'ch4 six rows and a sum');
    await pick(page, 'pcL', 'b'); await page.waitForTimeout(30);
    ok((await text(page, '#pcFrac')) === pct(P.p64bfrac[0]), 'ch4 B1 DLL estimate still short');
    await pick(page, 'pcD', 'simple'); await page.waitForTimeout(30);
    ok((await page.$eval('#pcTbl tbody tr:last-child', e => e.textContent)).includes('200'), 'ch4 simple NIC: 200 B up');
    await pick(page, 'pcD', 'batch'); await setRange(page, 'pcSz', 5); await page.waitForTimeout(30);
    ok((await text(page, '#pcFrac')) === '100%', 'ch4 1518 B fits');

    // ch5 hash
    await show(page, '#rsHash', 100);
    ok((await text(page, '#rsHash')) === M.hex(P.v4h[0]) && (await text(page, '#rsMs')).includes('✓') && (await text(page, '#rsQn')) === '0' && (await text(page, '#rsRq')) === '2', 'ch5 default vector matches Microsoft');
    await click(page, '[data-vec="v6.2"]'); await page.waitForTimeout(30);
    ok((await text(page, '#rsHash')) === M.hex(M.SRC.ms.v6[2][5]) && (await text(page, '#rsMs')).includes('✓'), 'ch5 third IPv6 vector with ports');
    await click(page, '#rsPorts'); await page.waitForTimeout(30);
    ok((await text(page, '#rsHash')) === M.hex(M.SRC.ms.v6[2][4]), 'ch5 third IPv6 vector, addresses only');
    await page.fill('#rsSrc', '10.0.0.1'); await page.waitForTimeout(30);
    ok((await say('rsSay')).includes('IPv4') && (await text(page, '#rsHash')) === '—', 'ch5 mixed families rejected');

    // ch5 load
    await show(page, '#ldCv', 250);
    { const r = M.rssLoad(8, 1000, 4, 7); ok((await text(page, '#ldRatio')) === zf(r.ratio, 2) + ' 倍' && (await text(page, '#ldPno')) === pct(P.rssNo[0]), 'ch5 default load'); }
    const h5 = await canvasHash(page, 'ldCv');
    await click(page, '#ldRe'); await page.waitForTimeout(80);
    { const r = M.rssLoad(8, 1000, 4, 8); ok((await text(page, '#ldRatio')) === zf(r.ratio, 2) + ' 倍' && h5 !== await canvasHash(page, 'ldCv'), 'ch5 reroll redraws with the next seed'); }

    // ch7 offloads
    await show(page, '#ofCv', 250);
    ok((await text(page, '#ofGbps')) === zf(P.oG[0], 1) + ' Gb/s', 'ch7 default: GRO 1500');
    const h7 = await canvasHash(page, 'ofCv');
    await pick(page, 'ofM', '9000'); await page.waitForTimeout(60);
    ok((await text(page, '#ofGbps')) === zf(P.oJ[0], 1) + ' Gb/s' && h7 !== await canvasHash(page, 'ofCv'), 'ch7 jumbo + GRO = Cai 42');
    ok((await text(page, '#tsSum')).includes(M.tso(65536, 8948).n + ' 段'), 'ch7 TSO with MSS 8948');
    await setRange(page, 'ofF', 4); await page.waitForTimeout(30);
    ok((await text(page, '#ofGbps')) === zf(P.o16[0], 1) + ' Gb/s', 'ch7 sixteen interleaved flows');
    await pick(page, 'ofM', '1500'); await pick(page, 'tsL', '65536'); await page.waitForTimeout(30);
    ok((await page.$$eval('#tsTbl tbody tr', r => r.length)) === 6 && (await page.$eval('#tsTbl tbody tr:last-child', e => e.textContent)).includes('PSH'), 'ch7 TSO table: first three, gap, last two, PSH last');

    // ch8 DDIO
    await show(page, '#ddCv', 250);
    ok((await text(page, '#ddRhit')) === pct(P.d0r[0]) && (await text(page, '#ddDram')) === zf(P.d0dram[0], 0) + ' 字节', 'ch8 default leaks');
    const h8 = await canvasHash(page, 'ddCv');
    await setRange(page, 'ddR', 1); await page.waitForTimeout(80);
    ok((await text(page, '#ddRhit')) === '100%' && (await text(page, '#ddDrop')) === pct(P.d256drop[0], 1) && h8 !== await canvasHash(page, 'ddCv'), 'ch8 256-slot rings fit but drop');

    // ch9 BQL
    await show(page, '#bqCv', 250);
    ok((await text(page, '#bqD')) === dur(M.bql(25, 1024, 65536, 50, false).delay), 'ch9 default: 1.26 ms behind a full ring');
    const h9 = await canvasHash(page, 'bqCv');
    await click(page, '#bqOn'); await page.waitForTimeout(80);
    ok((await text(page, '#bqD')) === dur(M.bql(25, 1024, 65536, 50, true).delay) && h9 !== await canvasHash(page, 'bqCv'), 'ch9 BQL on');

    // ch10 XDP
    await show(page, '#xdCv', 250);
    { const r = M.xdpCores(400, 64); ok((await text(page, '#xdX')) === cores(r.rows[2].cores) && (await text(page, '#xdD')) === cores(r.rows[3].cores) && (await say('xdSay')).includes('115'), 'ch10 default: over the PCI limit'); }
    ok((await page.$$eval('#xdTbl tbody tr', r => r.length)) === 4, 'ch10 four rows');
    const h10 = await canvasHash(page, 'xdCv');
    await pick(page, 'xdSp', '10'); await page.waitForTimeout(60);
    ok((await say('xdSay')).startsWith(mpps(M.budget(10, 64).pps)) && h10 !== await canvasHash(page, 'xdCv'), 'ch10 10G: one XDP core');

    // ch12 ECMP
    await show(page, '#aiCv', 250);
    ok((await text(page, '#aiEff')) === pct(M.ecmp(64, 64, 'ecmp', 11).eff), 'ch12 default ECMP');
    const h12 = await canvasHash(page, 'aiCv');
    await pick(page, 'aiM', 'spray'); await page.waitForTimeout(60);
    ok((await text(page, '#aiEff')) === pct(M.ecmp(64, 64, 'spray', 11).eff) && h12 !== await canvasHash(page, 'aiCv'), 'ch12 spraying');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#ldCv', 400);
    const a = await canvasHash(page, 'ldCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'ldCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#ldRatio')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, eight diagrams (role, aria, labels inside, no overlap, >= 11 px); toggle with stub fallback, keyboard, ten models driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
