'use strict';
// Browser smoke test for the essay on how a computer boots.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18972 NODE_PATH=~/fast/integ-life/integ-games/node_modules \
//   node computing/systems/how-a-computer-boots/tests/browser.cjs
// Optional SHOT_DIR=/tmp/... writes full-page screenshots and one screenshot per diagram and per model at each width
// (never into the repo).
// Checks at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped inside its box, every
// control at least 48×48 px, toggle reads 中 | EN, no raw copy keys, every readout and live sentence filled; the
// static diagrams (STANDARD §4a): an <svg role=img> with an aria-label from the copy, every label non-empty, inside
// the drawing, not overlapping another label, and rendered at 11 px or more. Then the language toggle (English is a
// stub: the page falls back to Chinese and says so in <html lang>), keyboard operation of a slider, each of the
// models responding to its controls with the numbers the models give, and reduced motion. When copy.en.js is
// translated (enStub removed), the same width sweep also runs in English and checks that no Chinese is left,
// including canvas and SVG text.
const { chromium } = require('playwright');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18972').replace(/\/$/, '');
const url = base + '/computing/systems/how-a-computer-boots/';
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
    ok(await page.$$eval('figure.dia svg', s => s.length) === 13, `${tag}: thirteen diagrams (at least six required)`);
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
    ok((await text(page, 'h1')) === '电脑是怎么开机的', 'hero title filled from copy');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await page.evaluate(() => document.documentElement.lang) === (stub ? 'zh-CN' : 'en'), 'lang follows the text actually shown');
    ok((await text(page, 'h1')).length > 0, 'title still filled after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');
    ok((await page.$eval('#ch7', e => e.textContent)).includes(M.fmtKind(P.gCrc[0], 'hex')), 'ch7 prose quotes the header CRC from the model');
    ok((await page.$eval('#ch3', e => e.textContent)).includes(zf(P.s03us[0], 2) + ' 微秒'), 'ch3 law quotes the 03h read time');
    ok((await page.$eval('#ch7', e => e.querySelector('figure.dia').textContent)).includes(String(P.gLast[0])), 'ch7 diagram draws the last LBA from the model');

    // ch1 power
    await show(page, '#pwCv', 200);
    ok((await text(page, '#pwT1')) === zf(P.pT1[0], 1) + ' 毫秒' && (await text(page, '#pwOk')) === zf(P.pOk[0], 1) + ' 毫秒' && (await text(page, '#pwV')) === '通过', 'ch1 default: T1 and PWR_OK, got ' + await text(page, '#pwOk'));
    const h1 = await canvasHash(page, 'pwCv');
    await setRange(page, 'pwSet', 5); await page.waitForTimeout(80);
    ok((await text(page, '#pwOk')) === '不会升起' && (await page.$eval('#pwSay', e => e.textContent)).includes('3.10 伏'), 'ch1 3.10 V: PWR_OK never rises');
    ok(h1 !== await canvasHash(page, 'pwCv'), 'ch1 canvas redraws');
    await setRange(page, 'pwSet', 15); await setRange(page, 'pwRamp', 25); await page.waitForTimeout(40);
    ok((await text(page, '#pwT2')) === zf(P.slowT2[0], 1) + ' 毫秒' && (await text(page, '#pwV')) === '不通过', 'ch1 ramp 25: T2 out of spec');
    await setRange(page, 'pwRamp', 8);
    await page.focus('#pwT3'); for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(60);
    ok((await text(page, '#pwT3o')) === '90 毫秒' && (await page.$eval('#pwSay', e => e.textContent)).includes('短于规范'), 'ch1 T3 by keyboard to 90 ms: too short');

    // ch2 reset vector
    await show(page, '#rvCalc', 100);
    ok((await text(page, '#rvLin')) === '0xFFFFFFF0' && (await text(page, '#rvOff')) === '0x01FFFFF0' && (await text(page, '#rvOne')) === '否', 'ch2 default: 32 MiB');
    await pick(page, 'rvF', '16'); await page.waitForTimeout(30);
    ok((await text(page, '#rvOff')) === '0x00FFFFF0', 'ch2 16 MiB offset');
    await pick(page, 'rvM', 'far'); await page.waitForTimeout(30);
    ok((await text(page, '#rvLin')) === '0xFFFF0' && (await text(page, '#rvOne')) === '是', 'ch2 after a far jump: below 1 MiB');
    await page.fill('#rvIp', 'zz'); await page.waitForTimeout(30);
    ok((await page.$eval('#rvSay', e => e.textContent)).includes('十六进制'), 'ch2 bad offset explained');
    await page.fill('#rvIp', 'FFF0');

    // ch3 SPI
    await show(page, '#spCv', 200);
    ok((await text(page, '#spT')) === zf(P.s03us[0], 2) + ' 微秒' && (await text(page, '#spClk')) === zf(P.s03clk[0], 0) + ' 个时钟', 'ch3 default 03h 64 B');
    const h3 = await canvasHash(page, 'spCv');
    await pick(page, 'spC', 'EB'); await setRange(page, 'spF', 8); await page.waitForTimeout(60);
    ok((await text(page, '#spT')) === zf(P.sEBus[0], 2) + ' 微秒', 'ch3 EBh at 133 MHz');
    ok(h3 !== await canvasHash(page, 'spCv'), 'ch3 canvas redraws');
    await pick(page, 'spS', '16777216'); await page.waitForTimeout(40);
    ok((await text(page, '#spT')) === zf(P.sEBimg[0], 2) + ' 秒', 'ch3 EBh 16 MiB');
    await pick(page, 'spC', '03'); await page.waitForTimeout(40);
    ok((await page.$eval('#spSay', e => e.textContent)).includes('最高只能跑 50 MHz'), 'ch3 03h capped at 50 MHz');

    // ch5 timeline
    await show(page, '#tlCv', 200);
    ok((await text(page, '#tlTot')) === zf(P.tNormal[0], 1) + ' 秒', 'ch5 default normal boot');
    await pick(page, 'tlS', 'first'); await page.waitForTimeout(40);
    ok((await text(page, '#tlTot')) === zf(P.tFirst[0], 1) + ' 秒' && (await text(page, '#tlBig')).startsWith('内存'), 'ch5 first boot: training longest');
    await pick(page, 'tlS', 's3'); await page.waitForTimeout(40);
    ok((await text(page, '#tlTot')) === zf(P.tS3[0], 1) + ' 秒', 'ch5 S3');

    // ch6 MADT
    await show(page, '#acHex', 100);
    ok((await text(page, '#acLen')) === zf(P.madtLen8[0], 0) + ' 字节' && (await text(page, '#acSum')) === '0xB9' && (await text(page, '#acOk')).endsWith('通过'), 'ch6 default 8 cores');
    await click(page, '#acBad'); await page.waitForTimeout(30);
    ok((await text(page, '#acOk')).endsWith('不通过'), 'ch6 one bit flipped: checksum fails');
    await setRange(page, 'acN', 7); await page.waitForTimeout(30);
    ok((await text(page, '#acLen')) === zf(P.madtLen64[0], 0) + ' 字节', 'ch6 64 cores');

    // ch7 GPT
    await show(page, '#gpHex', 100);
    ok((await text(page, '#gpCrc')) === M.h8(P.gCrc[0]) && (await text(page, '#gpUse')) === '主表头', 'ch7 default header CRC');
    await pick(page, 'gpE', 'sig'); await page.waitForTimeout(30);
    ok((await text(page, '#gpUse')) === '备份表头', 'ch7 signature edit: backup');
    await click(page, '#gpBoth'); await page.waitForTimeout(30);
    ok((await text(page, '#gpUse')) === '都不能用', 'ch7 both edited: nothing');
    await click(page, '#gpBoth'); await pick(page, 'gpE', 'start'); await click(page, '#gpFix'); await page.waitForTimeout(30);
    ok((await text(page, '#gpUse')) === '主表头' && (await text(page, '#gpEsp')).startsWith('LBA 2,056'), 'ch7 start edit with CRC fixed: accepted, ESP moved');

    // ch8 chain
    await show(page, '#sbSteps', 100);
    ok((await text(page, '#sbStop')) === '没有停，系统启动', 'ch8 default boots');
    await pick(page, 'sbG', 'grubTampered'); await page.waitForTimeout(30);
    ok((await text(page, '#sbStop')) === 'shim 验 GRUB' && (await page.$eval('#sbSay', e => e.textContent)).includes('只改了一个字节') && (await page.$$eval('#sbSteps li.bad', l => l.length)) === 1, 'ch8 tampered GRUB stops at shim');
    await pick(page, 'sbG', 'grub'); await pick(page, 'sbH', 'shimOld'); await page.waitForTimeout(30);
    ok((await text(page, '#sbStop')) === '没有停，系统启动', 'ch8 old shim boots without dbx');
    await click(page, '#sbDbx'); await page.waitForTimeout(30);
    ok((await text(page, '#sbStop')) === '固件验 shim', 'ch8 old shim blocked with dbx');
    await pick(page, 'sbH', 'shim'); await pick(page, 'sbK', 'kernelMine'); await page.waitForTimeout(30);
    ok((await text(page, '#sbStop')) === 'GRUB 验内核', 'ch8 own kernel without MOK');
    await click(page, '#sbMok'); await page.waitForTimeout(30);
    ok((await text(page, '#sbStop')) === '没有停，系统启动', 'ch8 own kernel with MOK');

    // ch9 revocation
    await show(page, '#rkTbl', 100);
    const res = () => page.$$eval('#rkTbl tbody tr td:nth-child(2)', t => t.map(e => e.classList.contains('y') ? 1 : 0).join(''));
    ok((await res()) === '1111', 'ch9 default: nothing revoked');
    await pick(page, 'rkM', 'hash'); await page.waitForTimeout(30);
    ok((await res()) === '0111' && (await text(page, '#rkBytes')) === zf(P.bhBytes[0], 0) + ' 字节', 'ch9 hash list of 150');
    await pick(page, 'rkM', 'sbat'); await page.waitForTimeout(30);
    ok((await res()) === '0010', 'ch9 SBAT');
    await pick(page, 'rkS', 'windows'); await page.waitForTimeout(30);
    ok(await page.$eval('input[name=rkM][value=sbat]', e => e.closest('label').hidden) && (await page.$eval('input[name=rkM][value=none]', e => e.checked)), 'ch9 Windows: SBAT hidden, back to none');
    await pick(page, 'rkM', 'cert'); await page.waitForTimeout(30);
    ok((await res()) === '0010', 'ch9 Windows cert with the 2023 CA');
    await click(page, '#rk23'); await page.waitForTimeout(30);
    ok((await res()) === '0000' && (await page.$eval('#rkSay', e => e.textContent)).includes('起不来'), 'ch9 Windows cert without the 2023 CA');

    // ch10 PCR
    await show(page, '#pcTbl', 100);
    ok((await text(page, '#pcUn')) === '交出' && (await page.$eval('#pcTbl tbody tr td:nth-child(3)', e => e.textContent)) === P.pcr0[0], 'ch10 default');
    await pick(page, 'pcT', 'fw'); await page.waitForTimeout(30);
    ok((await text(page, '#pcUn')) === '交出' && (await text(page, '#pcDiff')) === zf(P.pcrDiff[0], 0) + ' / 64' && (await text(page, '#pcChg')) === '0', 'ch10 firmware update, sealed to PCR 7');
    await pick(page, 'pcP', 'p0247'); await page.waitForTimeout(30);
    ok((await text(page, '#pcUn')) === '拒绝', 'ch10 sealed to 0,2,4,7: locked');
    await pick(page, 'pcP', 'p7'); await pick(page, 'pcT', 'sboff'); await page.waitForTimeout(30);
    ok((await text(page, '#pcUn')) === '拒绝', 'ch10 Secure Boot off: locked');

    // ch11 bring-up
    await show(page, '#mpCv', 200);
    ok((await text(page, '#mpSer')) === zf(P.smpSer[0], 0) + ' 毫秒' && (await text(page, '#mpPar')) === zf(P.smpPar[0], 0) + ' 毫秒', 'ch11 default 112 threads');
    const h11 = await canvasHash(page, 'mpCv');
    await setRange(page, 'mpN', 10); await page.waitForTimeout(60);
    ok((await text(page, '#mpSer')) === zf(P.smp512s[0], 0) + ' 毫秒', 'ch11 512 threads');
    ok(h11 !== await canvasHash(page, 'mpCv'), 'ch11 canvas redraws');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  // reduced motion: no smooth scroll; nothing animates; diagrams and readouts the same
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await show(page, '#pwCv', 400);
    const a = await canvasHash(page, 'pwCv'); await page.waitForTimeout(600);
    ok(a === await canvasHash(page, 'pwCv'), 'reduced motion: canvas is still');
    ok((await text(page, '#pwOk')).length > 0, 'reduced motion: readouts filled');
    const dg = await page.evaluate(diagramCheck);
    ok(!dg.length, 'reduced motion: diagrams: ' + dg.slice(0, 4).join(' | '));
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    if (SHOT) await page.screenshot({ path: `${SHOT}/reduced-390.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log(`PASS: browser smoke test (${langs.join('+')} at 1280/390/320: overflow, clipped text, 48px targets, raw keys, placeholders, readouts, live sentences, thirteen diagrams (role, aria, labels inside, no overlap, ≥ 11 px); toggle with stub fallback, keyboard, every model driven, reduced motion)`);
})().catch(e => { console.error(e); process.exit(1); });
