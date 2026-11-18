'use strict';
// Browser test for "How much a wire can carry".
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18988 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node tech/networks/how-much-a-wire-can-carry/tests/browser.cjs
// At 1280/390/320 in Chinese: no console/page errors, no horizontal overflow, nothing outside the viewport, no text
// clipped in its own box, every control at least 48×48, the toggle reads 中 | EN. Then: the toggle works without
// copy.en.js; reduced motion; keyboard play of the guessing game; simulations only run on screen; and every live
// sentence (.say) branch reached by driving the controls to their extremes.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18988').replace(/\/$/, '');
const url = base + '/tech/networks/how-much-a-wire-can-carry/';
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
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, String(v)]);
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
// the page scrolls smoothly; jump instantly so a check never runs mid-scroll with its figure still off screen
const show = async (page, sel, ms = 250) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(ms); };
// does the live sentence in `sel` come from copy key `key`? (template → regex, placeholders match anything)
const isKey = (page, sel, key) => page.evaluate(([sel, key]) => {
  const tpl = window.ESSAY_COPY.zh[key]; if (!tpl) return false;
  const strip = s => s.replace(/<[^>]+>/g, '');
  const rx = new RegExp('^' + strip(tpl).split(/\{\w+\}/).map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\S]*?') + '$');
  return rx.test(document.querySelector(sel).textContent.trim());
}, [sel, key]);
const say = async (page, sel, key, what) => ok(await isKey(page, sel, key), `${what}: ${sel} should be ${key}, got "${(await text(page, sel)).slice(0, 90)}"`);
const until = (page, fn, arg, ms = 60000) => page.waitForFunction(fn, arg, { timeout: ms, polling: 250 }).then(() => true, () => false);

(async () => {
  const browser = await chromium.launch();

  /* layout, targets and errors at three widths */
  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width), tag = `zh ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    ok(/[一-鿿]/.test(await page.evaluate(() => document.title)), `${tag}: Chinese <title>`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200); }
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => {
      const out = [], boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, textarea, .toc a, a.back')) { const r = boxOf(e); if (!r.width && !r.height) continue; if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`); }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.slice(0, 8).join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('.eq'); }).slice(0, 5).map(e => e.tagName + '#' + e.id + ' ' + (e.className || '')));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    ok(await page.$$eval('.say', es => es.every(e => e.getAttribute('aria-live') === 'polite')), `${tag}: every live sentence is aria-live`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  /* language toggle without copy.en.js; reduced motion */
  {
    const page = await open(browser, 1280);
    ok(!(await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en))), 'copy.en.js is absent (this essay ships Chinese only)');
    const h1 = await text(page, 'h1');
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok(await text(page, 'h1') === h1 && await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'without copy.en.js the page keeps the Chinese text and says so in <html lang>');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^\w+(\.\w+)+$/.test(e.textContent.trim())))), 'no raw keys after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.$eval('#langToggle [data-lang=zh]', e => e.getAttribute('aria-pressed')) === 'true', 'ZH pressed again');
    ok(!page.__errors().length, 'toggle: errors: ' + page.__errors().join(' | '));
    await page.close();
  }
  {
    const page = await open(browser, 390, { reduce: true });
    await show(page, '#ggCv', 600);
    ok(await page.$eval('#ggText .cur', e => getComputedStyle(e).animationName === 'none' && e.textContent === '_'), 'reduced motion: the cursor does not blink');
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scrolling');
    await page.close();
  }

  /* drive every model; every sentence branch */
  const page = await open(browser, 1280);

  // ch1 guessing game: wait/start, few, est, done; by keyboard
  await show(page, '#ggCv');
  ok(await until(page, () => !/…/.test(document.querySelector('#ggMRange').textContent)), 'ch1 machine model trains while on screen');
  await say(page, '#ggSay', 'ch1.say.start', 'ch1 start');
  await page.focus('#ggKeys button');
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); // a wrong or right guess with Enter on a key
  const typeRest = async nMax => { const rest = await page.evaluate(() => window.__wireGame.rest()); for (const ch of rest.slice(0, nMax)) await page.keyboard.press(ch === ' ' ? 'Space' : ch); };
  await page.focus('#ggText'); await typeRest(5);
  ok(+(await text(page, '#ggN')) >= 5, 'ch1 keyboard letters are counted');
  await say(page, '#ggSay', 'ch1.say.few', 'ch1 few');
  await typeRest(20); await say(page, '#ggSay', 'ch1.say.est', 'ch1 est');
  await typeRest(200); await say(page, '#ggSay', 'ch1.say.done', 'ch1 done');
  ok((await text(page, '#ggFirst')) === '100.0%' || (await text(page, '#ggFirst')).endsWith('%'), 'ch1 first-try share shown');
  await page.click('#ggNext'); await page.click('#ggMachine');
  ok(await page.$$eval('#ggText .mach', es => es.length > 20), 'ch1 machine fills the sentence');
  // ch1 n-grams
  await show(page, '#ngCv');
  ok(await until(page, () => document.querySelector('#ngBest').textContent.trim() === '2.00'), 'ch1 n-gram full data: best 2.00');
  await say(page, '#ngSay', 'ch1.ng.say.full', 'ch1 ng full');
  await setRange(page, 'ngSize', 10);
  ok(await until(page, () => document.querySelector('#ngBest').textContent.trim() === '2.67'), 'ch1 n-gram 10%: best 2.67');
  await say(page, '#ngSay', 'ch1.ng.say.small', 'ch1 ng small');

  // ch2
  await show(page, '#hfCv');
  await say(page, '#hfSay', 'ch2.say.ok', 'ch2 ok'); ok((await text(page, '#hfH')) === '3.955', 'ch2 default entropy');
  const typeBox = async s => { await page.$eval('#hfText', (e, s) => { e.value = s; e.dispatchEvent(new Event('input', { bubbles: true })); }, s); };
  await typeBox('abcdefg'); await say(page, '#hfSay', 'ch2.say.uniq', 'ch2 uniq');
  await typeBox('aaaa'); await say(page, '#hfSay', 'ch2.say.one', 'ch2 one');
  await typeBox(''); await say(page, '#hfSay', 'ch2.say.empty', 'ch2 empty');
  await typeBox('信息<b>论</b>'); ok(await page.$eval('#hfCodes', e => !e.querySelector('b b') && e.textContent.includes('<')), 'ch2 code table shows typed markup as text');
  await page.click('#hfReset'); ok((await text(page, '#hfH')) === '3.955', 'ch2 reset');
  await show(page, '#cnCv');
  await say(page, '#cnSay', 'ch2.coin.say.one', 'ch2 coin one');
  await setRange(page, 'cnB', 10); await say(page, '#cnSay', 'ch2.coin.say.block', 'ch2 coin block');
  await setRange(page, 'cnP', 0.5); await say(page, '#cnSay', 'ch2.coin.say.fair', 'ch2 coin fair');
  await setRange(page, 'cnP', 0.01); await setRange(page, 'cnB', 1); await say(page, '#cnSay', 'ch2.coin.say.one', 'ch2 coin p=0.01');
  ok((await text(page, '#cnOk')).startsWith('✓'), 'ch2 coin round trip');

  // ch3
  await show(page, '#pcCv');
  ok(await until(page, () => document.querySelector('#pcWarm').textContent.trim() === '2.007'), 'ch3 default warm 2.007');
  await say(page, '#pcSay', 'ch3.say.alice', 'ch3 alice');
  await pick(page, 'pcSrc', 'random'); await say(page, '#pcSay', 'ch3.say.wait', 'ch3 wait');
  ok(await until(page, () => /^\d/.test(document.querySelector('#pcCold').textContent.trim())), 'ch3 random k3 computed');
  await say(page, '#pcSay', 'ch3.say.random', 'ch3 random');
  await setRange(page, 'pcK', 0);
  ok(await until(page, () => document.querySelector('#pcCold').textContent.trim() === '4.766'), 'ch3 random k0 4.766');
  await say(page, '#pcSay', 'ch3.say.random0', 'ch3 random0');
  await setRange(page, 'pcK', 5); await pick(page, 'pcSrc', 'alice');
  ok(await until(page, () => /^\d/.test(document.querySelector('#pcWarm').textContent.trim())), 'ch3 alice k5 computed');
  ok((await text(page, '#pcOk')).startsWith('✓'), 'ch3 round trip');
  await show(page, '#ctSay');
  await setRange(page, 'ctN', 4); await setRange(page, 'ctK', 16);
  ok((await page.$eval('#ctK', e => e.value)) === '4', 'ch3 counting: k is capped at n');
  await say(page, '#ctSay', 'ch3.ct.say', 'ch3 counting n=4');
  await setRange(page, 'ctN', 64); await setRange(page, 'ctK', 1); await say(page, '#ctSay', 'ch3.ct.say', 'ch3 counting n=64 k=1');

  // ch4
  await show(page, '#bsCv');
  await say(page, '#bsSay', 'ch4.say.max', 'ch4 max');
  await setRange(page, 'bsQ', 0.1); await say(page, '#bsSay', 'ch4.say.below', 'ch4 below');
  await setRange(page, 'bsP', 0); await say(page, '#bsSay', 'ch4.say.zero', 'ch4 zero');
  await setRange(page, 'bsP', 0.5); await say(page, '#bsSay', 'ch4.say.half', 'ch4 half');
  await setRange(page, 'bsQ', 1); await setRange(page, 'bsP', 0.01); await page.click('#bsSend'); await say(page, '#bsSay', 'ch4.say.below', 'ch4 q=1');

  // ch5
  await show(page, '#awCv');
  await say(page, '#awSay', 'ch5.say.high', 'ch5 high'); ok((await text(page, '#awBo')) === '20 MHz', 'ch5 default 20 MHz');
  await setRange(page, 'awS', -20); await say(page, '#awSay', 'ch5.say.low', 'ch5 low');
  await setRange(page, 'awS', 0); await say(page, '#awSay', 'ch5.say.mid', 'ch5 mid');
  await setRange(page, 'awB', 0); await setRange(page, 'awS', 40); await say(page, '#awSay', 'ch5.say.high', 'ch5 1 kHz 40 dB');
  await setRange(page, 'awB', 18); ok((await text(page, '#awBo')) === '1 GHz', 'ch5 1 GHz');
  await show(page, '#vyCv');
  await say(page, '#vySay', 'ch5.vy.say', 'ch5 Voyager'); ok((await text(page, '#vyC')) === '1.10 kbit/s', 'ch5 Voyager at 173 AU');
  await setRange(page, 'vyD', 1); await say(page, '#vySay', 'ch5.vy.say', 'ch5 Voyager 1 AU');
  await setRange(page, 'vyD', 200); await say(page, '#vySay', 'ch5.vy.say', 'ch5 Voyager 200 AU');

  // ch6
  await show(page, '#rpCv');
  await say(page, '#rpSay', 'ch6.say', 'ch6'); ok((await text(page, '#rpN')).startsWith('23'), 'ch6 n for 1e-6 at p=0.1');
  await setRange(page, 'rpP', 0.005); await say(page, '#rpSay', 'ch6.say', 'ch6 p=0.005');
  await setRange(page, 'rpP', 0.3); await say(page, '#rpSay', 'ch6.say', 'ch6 p=0.3');
  await show(page, '#ebCv');
  await say(page, '#ebSay', 'ch6.eb.say.high', 'ch6 eb high');
  await setRange(page, 'ebE', -2); await say(page, '#ebSay', 'ch6.eb.say.low', 'ch6 eb low');
  await setRange(page, 'ebE', 3.32); await say(page, '#ebSay', 'ch6.eb.say.high', 'ch6 eb η=10');

  // ch7
  await show(page, '#hmMat');
  await say(page, '#hmSay', 'ch7.say.clean', 'ch7 clean');
  await page.click('#hmRecv button:nth-child(5)'); await say(page, '#hmSay', 'ch7.say.one', 'ch7 one');
  ok((await text(page, '#hmS')).includes('101'), 'ch7 syndrome names position 5');
  await page.click('#hmRecv button:nth-child(1)'); await say(page, '#hmSay', 'ch7.say.two', 'ch7 two');
  await page.click('#hmClear'); for (const i of [1, 2, 3]) await page.click(`#hmRecv button:nth-child(${i})`);
  await say(page, '#hmSay', 'ch7.say.miss', 'ch7 miss (flips 1,2,3 make a codeword)');
  await page.click('#hmTwo'); ok(await isKey(page, '#hmSay', 'ch7.say.two') || await isKey(page, '#hmSay', 'ch7.say.miss'), 'ch7 two random flips');
  await page.click('#hmClear'); const d0 = await text(page, '#hmData'); await page.click('#hmData button:nth-child(1)'); ok(d0 !== await text(page, '#hmData'), 'ch7 data tile toggles'); await say(page, '#hmSay', 'ch7.say.clean', 'ch7 new data, clean');

  // ch8
  await show(page, '#rsCw');
  await say(page, '#rsSay', 'ch8.say.clean', 'ch8 clean');
  await page.click('#rsErase'); await page.click('#rsErase'); await say(page, '#rsSay', 'ch8.say.erase', 'ch8 erase 6');
  await page.click('#rsClear'); await page.click('#rsErr'); await page.click('#rsErr'); await page.click('#rsErr');
  await say(page, '#rsSay', 'ch8.say.fixed', 'ch8 three errors fixed');
  await page.click('#rsClear');
  const cwTile = i => page.click(`#rsCw button:nth-child(${i})`);
  for (const i of [1, 2, 3, 4, 5, 6, 7]) await cwTile(i);
  await say(page, '#rsSay', 'ch8.say.fail', 'ch8 seven erasures fail');
  await cwTile(7); // erased → error: 6 erasures + 1 error
  await say(page, '#rsSay', 'ch8.say.wrong', 'ch8 6 erasures + 1 error decode wrong');
  await page.click('#rsClear'); await page.click('#rsMsg button:nth-child(1)'); await say(page, '#rsSay', 'ch8.say.clean', 'ch8 message edit');

  // ch9 belief propagation
  await show(page, '#tgCv');
  await say(page, '#bpSay', 'ch9.bp.say.start', 'ch9 bp start');
  await page.click('#bpStep'); await say(page, '#bpSay', 'ch9.bp.say.running', 'ch9 bp running');
  const steps = k => page.evaluate(k => { for (let i = 0; i < k; i++) document.getElementById('bpStep').click(); }, k); // aria-disabled at the last round
  await steps(10);
  await say(page, '#bpSay', 'ch9.bp.say.ok', 'ch9 bp converged');
  for (let i = 0; i < 5; i++) await page.click('#bpNew'); // frame 19 stalls
  await steps(50);
  await say(page, '#bpSay', 'ch9.bp.say.stuck', 'ch9 bp stuck');
  for (let i = 0; i < 3; i++) await page.click('#bpNew'); // frame 22 settles on another codeword
  await steps(6);
  await say(page, '#bpSay', 'ch9.bp.say.wrongcw', 'ch9 bp wrong codeword');
  await setRange(page, 'bpE', 4); let clean = false;
  for (let i = 0; i < 20 && !clean; i++) { clean = await isKey(page, '#bpSay', 'ch9.bp.say.okstart'); if (!clean) await page.click('#bpNew'); }
  ok(clean, 'ch9 bp: a clean frame at 4 dB');
  await setRange(page, 'bpE', 0); await say(page, '#bpSay', 'ch9.bp.say.start', 'ch9 bp 0 dB');

  // ch9 BER: only on screen; pause/resume; done; nocross with the short code
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(300);
  const before = await page.evaluate(() => JSON.stringify(window.__wireBER.state.res).length);
  await page.waitForTimeout(1500);
  ok(before === await page.evaluate(() => JSON.stringify(window.__wireBER.state.res).length), 'ch9 BER does not run off screen');
  await show(page, '#brCv', 800);
  await say(page, '#brSay', 'ch9.say.running', 'ch9 ber running');
  await page.click('#brRun'); await say(page, '#brSay', 'ch9.say.paused', 'ch9 ber paused');
  ok(await page.$eval('#brRun', e => e.getAttribute('aria-pressed')) === 'false', 'ch9 pause button state');
  await page.click('#brRun');
  ok(await until(page, () => window.__wireBER.done(), null, 180000), 'ch9 BER finishes');
  await say(page, '#brSay', 'ch9.say.done', 'ch9 ber done');
  ok((await text(page, '#brL')) === '2.49 dB' && (await text(page, '#brCv4')) === '3.42 dB' && (await text(page, '#brGap')) === '2.30 dB', 'ch9 page numbers match the prose: ' + await text(page, '#brSay'));
  await show(page, '#frCv'); await say(page, '#frSay', 'ch13.say.done', 'ch13 done after ch9');
  await show(page, '#brCv', 300);
  await pick(page, 'brN', 128); await page.waitForTimeout(200);
  ok(await until(page, () => window.__wireBER.done(), null, 120000), 'ch9 BER n=256 finishes');
  await say(page, '#brSay', 'ch9.say.nocross', 'ch9 ber nocross (n = 256)');

  // ch10
  await show(page, '#plCv');
  await say(page, '#plSay', 'ch10.say', 'ch10'); ok((await text(page, '#plGood')) === '37.3%', 'ch10 N=1024');
  await setRange(page, 'plN', 1); await say(page, '#plSay', 'ch10.say.one', 'ch10 one');
  await setRange(page, 'plN', 20); await setRange(page, 'plE', 0.05); await say(page, '#plSay', 'ch10.say', 'ch10 n=20 ε=0.05');
  await setRange(page, 'plE', 0.95); await say(page, '#plSay', 'ch10.say', 'ch10 ε=0.95');

  // ch11
  await show(page, '#qmCv');
  await say(page, '#qmSay', 'ch11.say.bad', 'ch11 64-QAM at 20 dB');
  await pick(page, 'qmM', 4); await say(page, '#qmSay', 'ch11.say.ok', 'ch11 QPSK at 20 dB');
  await pick(page, 'qmM', 4096); await setRange(page, 'qmS', 50); await say(page, '#qmSay', 'ch11.say.ok', 'ch11 4096 at 50 dB');
  await setRange(page, 'qmS', 0); await say(page, '#qmSay', 'ch11.say.bad', 'ch11 4096 at 0 dB');
  await show(page, '#amCv');
  await say(page, '#amSay', 'ch11.am.say.ollaless', 'ch11 amc default'); ok((await text(page, '#amT')) === '4.25', 'ch11 amc throughput');
  await setRange(page, 'amV', 30); await say(page, '#amSay', 'ch11.am.say.olla', 'ch11 amc 30 km/h');
  ok((await text(page, '#amT')) === '2.61', 'ch11 amc 30 km/h throughput');
  await page.click('#amO'); await say(page, '#amSay', 'ch11.am.say.noolla', 'ch11 amc no OLLA');
  await setRange(page, 'amS', 0); await setRange(page, 'amV', 120); await setRange(page, 'amD', 10); await say(page, '#amSay', 'ch11.am.say.noolla', 'ch11 amc extremes');
  await setRange(page, 'amS', 30); await setRange(page, 'amV', 0); await setRange(page, 'amD', 0); await page.click('#amO'); await say(page, '#amSay', 'ch11.am.say.ollaless', 'ch11 amc still channel');

  // ch12
  await show(page, '#mmCv');
  await say(page, '#mmSay', 'ch12.say', 'ch12'); ok((await text(page, '#mmC')) === '21.98', 'ch12 4x4');
  await setRange(page, 'mmT', 1); await say(page, '#mmSay', 'ch12.say.one', 'ch12 one');
  await setRange(page, 'mmT', 8); await setRange(page, 'mmR', 8); await setRange(page, 'mmS', 30); await say(page, '#mmSay', 'ch12.say', 'ch12 8x8 30 dB');
  await setRange(page, 'mmR', 1); await setRange(page, 'mmS', 0); await say(page, '#mmSay', 'ch12.say.one', 'ch12 8x1 0 dB');
  await page.click('#mmNew');

  // ch13 facts render
  ok(await page.$$eval('#frStd li, #frFibre li, #frNext li, #frComp li', ls => ls.length) === await page.evaluate(() => window.ESSAY_COPY.zh.frontier.length), 'ch13 every fact rendered');
  ok(await page.$$eval('.facts .tag', ts => ts.every(t => t.textContent.trim().length > 0)), 'ch13 every fact tagged');

  // ch14
  await show(page, '#scSay');
  await say(page, '#scSay', 'ch14.say.ok', 'ch14 Wi-Fi default'); ok((await text(page, '#scBound')) === '64.6 Gbit/s', 'ch14 Wi-Fi bound');
  await page.click('#sc5g'); await say(page, '#scSay', 'ch14.say.tight', 'ch14 5G tight');
  await page.click('#scAd'); await say(page, '#scSay', 'ch14.say.over', 'ch14 ad over');
  await page.click('#scWifi'); ok((await text(page, '#scCo')) === '46.1 Gbit/s', 'ch14 preset keeps the exact claim');
  await setRange(page, 'scC', -2); await say(page, '#scSay', 'ch14.say.ok', 'ch14 10 Mbit/s');
  await setRange(page, 'scB', 0); await setRange(page, 'scN', 1); await setRange(page, 'scS', -10); await setRange(page, 'scC', 2); await say(page, '#scSay', 'ch14.say.over', 'ch14 extremes');

  ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
  await page.close();
  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('browser: all checks passed');
})().catch(e => { console.error(e); process.exit(1); });
