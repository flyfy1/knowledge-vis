'use strict';
// Browser test for the why-notes-sound-good-together essay.
// Usage: ESSAY_BASE_URL=http://127.0.0.1:18968 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node arts/music/why-notes-sound-good-together/tests/browser.cjs
// Optional SHOT_DIR=/some/dir writes screenshots there (never into the repo).
// Checks, in Chinese at 1280/390/320: no console/page errors, no horizontal overflow, no text clipped in its box,
// every control at least 48×48 px, the toggle reads 中 | EN, live sentences have no unfilled {placeholders}.
// Sound: no AudioContext exists before a user gesture (page load, scrolling every canvas into view and moving
// every slider by script do not create one); a play button creates exactly one; the mute button silences the
// master gain; with sound muted from the start, every audio demo still runs its visual twin (data-playing,
// moving highlight, canvases redrawing on control changes) and no AudioContext is ever created; unmuting a
// running silent demo starts its sound. Then keyboard operation, the language toggle without copy.en.js,
// every model driven to its extremes, and reduced motion.
const { chromium } = require('playwright');
const base = (process.env.ESSAY_BASE_URL || 'http://127.0.0.1:18968').replace(/\/$/, '');
const url = base + '/arts/music/why-notes-sound-good-together/';
const SHOT = process.env.SHOT_DIR || '';
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

async function open(browser, width, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference' });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/copy\.en\.js$/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  await page.addInitScript(l => { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }, opts.lang || 'zh');
  // count every AudioContext the page constructs
  await page.addInitScript(() => {
    window.__acCount = 0;
    for (const name of ['AudioContext', 'webkitAudioContext']) {
      const Orig = window[name]; if (!Orig) continue;
      window[name] = class extends Orig { constructor(...a) { super(...a); window.__acCount++; } };
    }
  });
  await page.goto(url);
  await page.waitForFunction(() => window.__essayReady === true);
  page.__errors = () => errors.filter(e => !e.startsWith('Failed to load resource'));
  return page;
}
const text = (page, sel) => page.$eval(sel, e => e.textContent.trim());
const setRange = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
const pick = (page, name, v) => page.evaluate(([n, v]) => { const e = document.querySelector(`input[name=${n}][value="${v}"]`); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, [name, String(v)]);
const show = async (page, sel, ms = 350) => { await page.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(ms); };
const hash = (page, id) => page.$eval('#' + id, c => { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h; });
const sayHasHoles = page => page.evaluate(() => [...document.querySelectorAll('.say, .read b, output')].filter(e => /\{\w+\}|undefined|NaN/.test(e.textContent)).map(e => e.id + ': ' + e.textContent.slice(0, 60)));

(async () => {
  const browser = await chromium.launch();

  /* layout at three widths */
  for (const width of [1280, 390, 320]) {
    const page = await open(browser, width);
    const tag = `zh ${width}`;
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', `${tag}: html lang`);
    ok(JSON.stringify(await page.$$eval('#langToggle button', bs => bs.map(b => b.textContent.trim()))) === '["中","EN"]', `${tag}: toggle should read 中 | EN`);
    for (const fig of await page.$$('figure')) { await fig.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); }
    if (SHOT) await page.screenshot({ path: `${SHOT}/browser-${width}-end.png` });
    const clipped = await page.evaluate(() => [...document.querySelectorAll('figure *, .toc a, #langToggle button, #sound *, table *')].filter(e => {
      if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
      const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false;
      return e.scrollWidth > e.clientWidth + 1; }).slice(0, 5).map(e => (e.id || e.tagName) + ' "' + e.textContent.trim().slice(0, 20) + '"'));
    ok(!clipped.length, `${tag}: clipped text: ${clipped.join(', ')}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${tag}: horizontal overflow ${over}px`);
    const small = await page.evaluate(() => {
      const out = [], boxOf = e => (e.matches('input[type=checkbox],input[type=radio]') ? e.closest('label') : e).getBoundingClientRect();
      for (const e of document.querySelectorAll('button, input, .toc a, a.back')) {
        const r = boxOf(e); if (!r.width && !r.height) continue;
        if (r.width < 47.5 || r.height < 47.5) out.push(`${e.id || e.name || e.textContent.trim().slice(0, 12)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
      }
      return out;
    });
    ok(!small.length, `${tag}: targets under 48px: ${small.join(', ')}`);
    const wide = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('.tablewrap'); }).slice(0, 5).map(e => e.tagName + '#' + e.id));
    ok(!wide.length, `${tag}: elements outside the viewport: ${wide.join(', ')}`);
    ok((await page.$eval('#sound', e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth && getComputedStyle(e).position === 'fixed'; })), `${tag}: sound control fixed and on screen`);
    ok((await sayHasHoles(page)).length === 0, `${tag}: unfilled sentence: ${(await sayHasHoles(page)).join(' | ')}`);
    ok(await page.evaluate(() => window.__acCount) === 0, `${tag}: an AudioContext was created without a user gesture`);
    ok(!page.__errors().length, `${tag}: errors: ${page.__errors().join(' | ')}`);
    await page.close();
  }

  /* sound: no context before a gesture, one after, mute works */
  {
    const page = await open(browser, 1280);
    // moving every slider by script (not a user gesture) and scrolling must not create a context
    for (const id of await page.$$eval('input[type=range]', es => es.map(e => e.id))) { await setRange(page, id, await page.$eval('#' + id, e => e.max)); await setRange(page, id, await page.$eval('#' + id, e => e.min)); }
    await page.reload(); await page.waitForFunction(() => window.__essayReady === true);
    ok(await page.evaluate(() => window.__acCount) === 0 && !(await page.evaluate(() => window.__audioState().ctx)), 'sound: no AudioContext after load, scroll and scripted slider moves');
    await show(page, '#hsPlay'); await page.click('#hsPlay'); await page.waitForTimeout(300);
    let st = await page.evaluate(() => window.__audioState());
    ok(await page.evaluate(() => window.__acCount) === 1 && st.ctx && st.voices >= 1 && st.playing.includes('ch1'), 'sound: a play click creates one AudioContext and a voice: ' + JSON.stringify(st));
    ok(st.gain > 0.1, 'sound: master gain is up when not muted: ' + st.gain);
    ok(await page.$eval('#fig1', e => e.dataset.playing) === '1' && await page.$eval('#hsPlay', e => e.getAttribute('aria-pressed')) === 'true', 'sound: ch1 shows it is playing');
    // one demo at a time
    await show(page, '#cbPlay'); await page.click('#cbPlay'); await page.waitForTimeout(200);
    st = await page.evaluate(() => window.__audioState());
    ok(JSON.stringify(st.playing) === '["ch2"]' && await page.evaluate(() => window.__acCount) === 1, 'sound: starting ch2 stops ch1 and reuses the context: ' + JSON.stringify(st));
    await page.click('#muteBtn'); await page.waitForTimeout(400);
    st = await page.evaluate(() => window.__audioState());
    ok(st.muted && st.gain < 0.01 && await page.$eval('#muteBtn', e => e.getAttribute('aria-pressed')) === 'true', 'sound: mute drops the master gain to zero: ' + JSON.stringify(st));
    ok((await text(page, '#cbPlay')).includes('静音'), 'sound: the play button says it is muted while playing');
    await page.click('#muteBtn'); await page.waitForTimeout(400);
    st = await page.evaluate(() => window.__audioState());
    ok(!st.muted && st.gain > 0.1, 'sound: unmute restores the gain: ' + JSON.stringify(st));
    await setRange(page, 'vol', 0); await page.waitForTimeout(300);
    ok((await page.evaluate(() => window.__audioState().gain)) < 0.01, 'sound: volume 0 silences');
    await setRange(page, 'vol', 60);
    await page.click('#cbPlay'); await page.waitForTimeout(150);
    ok((await page.evaluate(() => window.__audioState().playing)).length === 0, 'sound: the play button stops');
    ok(!page.__errors().length, 'sound: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* muted from the start: every audio demo's visual twin works and no context is ever created */
  {
    const page = await open(browser, 390);
    await page.click('#muteBtn');
    const demos = [
      ['hsPlay', 'fig1', 'hsSpec', () => setRange(page, 'hsN', 3)],
      ['cbPlay', 'fig2', 'cbCv', () => setRange(page, 'cbD', 12)],
      ['btPlay', 'fig3', 'btWave', () => setRange(page, 'btD', 8)],
      ['dcPlay', 'fig4', 'dcCv', () => setRange(page, 'dcC', 600)],
      ['tmPlay8', 'fig5', 'tmCv', () => setRange(page, 'tmS', 1.95)],
      ['pyPlay', 'fig6', 'pyCv', () => setRange(page, 'pyK', 6)],
      ['edPlay', 'fig7', 'edCv', () => setRange(page, 'edN', 19)],
      ['etPlay', 'fig8', 'etCv', () => pick(page, 'etSys', 'just')]
    ];
    for (const [btn, fig, cv, change] of demos) {
      await show(page, '#' + cv);
      const h0 = await hash(page, cv); await change(); await page.waitForTimeout(250);
      ok(await hash(page, cv) !== h0, `muted: ${cv} redraws when its control changes`);
      await show(page, '#' + btn, 150); await page.click('#' + btn); await page.waitForTimeout(250);
      ok(await page.$eval('#' + fig, e => e.dataset.playing) === '1', `muted: ${fig} runs its visual playback`);
      ok((await text(page, '#' + btn)).includes('静音'), `muted: ${btn} says sound is off`);
      if (fig === 'fig6') { await page.waitForTimeout(500); const a = await page.$eval('#fig6', e => e.dataset.now); await page.waitForTimeout(700); const b = await page.$eval('#fig6', e => e.dataset.now); ok(a !== '-1' && a !== b, `muted: the ch6 circle lights the sounding note in turn (${a} → ${b})`); }
      if (fig === 'fig7') { ok(await page.$eval('#fig7', e => e.dataset.now) === '0' && (await text(page, '#edNow')).includes('19'), 'muted: ch7 shows the equal version first'); await page.waitForTimeout(2600); ok(await page.$eval('#fig7', e => e.dataset.now) === '1' && (await text(page, '#edNow')).length > 1, 'muted: ch7 then shows the just version'); }
      if (fig === 'fig3') { await show(page, '#btWave', 200); const a = await hash(page, 'btWave'); await page.waitForTimeout(400); ok(await hash(page, 'btWave') !== a, 'muted: ch3 playhead moves across the beating envelope'); }
    }
    ok(await page.evaluate(() => window.__acCount) === 0 && !(await page.evaluate(() => window.__audioState().ctx)), 'muted: no AudioContext was ever created');
    // unmuting during a silent playback starts its sound for the remaining time
    await show(page, '#etPlay'); if (await page.$eval('#etPlay', e => e.getAttribute('aria-pressed')) !== 'true') await page.click('#etPlay');
    await page.click('#muteBtn'); await page.waitForTimeout(300);
    const st = await page.evaluate(() => window.__audioState());
    ok(st.ctx && st.voices >= 1 && st.playing.includes('ch8'), 'unmute during silent playback starts the sound: ' + JSON.stringify(st));
    ok(!page.__errors().length, 'muted: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* keyboard, language toggle, every model driven to its extremes */
  {
    const page = await open(browser, 1280);
    // keyboard: a slider moves with the arrow keys, and focus is visible
    await page.focus('#pyK'); await page.keyboard.press('ArrowLeft');
    ok((await text(page, '#pyKo')) === '11', 'keyboard: arrow key moves the ch6 slider');
    ok(await page.$eval('#pyK', e => getComputedStyle(e).outlineStyle !== 'none'), 'keyboard: focused slider shows an outline');
    await page.focus('#dcNext'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
    ok(+(await page.$eval('#dcC', e => e.value)) > 702, 'keyboard: Enter on "next dip" moves the cursor');
    await page.focus('#muteBtn'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
    ok(await page.$eval('#muteBtn', e => e.getAttribute('aria-pressed')) === 'true', 'keyboard: the mute button works from the keyboard');
    await page.keyboard.press('Enter');
    // toggle without copy.en.js: every key falls back to Chinese, nothing breaks
    await page.click('#langToggle [data-lang=en]');
    ok(await page.$eval('#langToggle [data-lang=en]', e => e.getAttribute('aria-pressed')) === 'true', 'EN button pressed');
    ok(await page.evaluate(() => localStorage.getItem('knowledge-lang')) === 'en', 'EN stored');
    ok((await text(page, 'h1')).length > 0, 'title is filled after switching');
    ok(!(await page.evaluate(() => [...document.querySelectorAll('[data-i18n],[data-i18n-html]')].some(e => /^[\w.]+\.[\w.]+$/.test(e.textContent.trim())))), 'no raw keys shown after switching');
    await page.click('#langToggle [data-lang=zh]');
    ok(await page.evaluate(() => document.documentElement.lang) === 'zh-CN', 'ZH toggle back');

    const say = sel => page.$eval(sel, e => e.textContent);
    // ch1
    await show(page, '#hsSpec');
    await setRange(page, 'hsN', 8); await setRange(page, 'hsP', 4); await page.waitForTimeout(100);
    ok((await text(page, '#hsGone')) === '6', 'ch1 1/6 silences the 6th: ' + await text(page, '#hsGone'));
    await page.click('#hsDrop'); await page.waitForTimeout(100);
    ok((await text(page, '#hsPer')).startsWith('7.64') && (await say('#hsSay')).includes('7.64'), 'ch1 missing fundamental keeps the period');
    await setRange(page, 'hsP', 12); await page.waitForTimeout(100);
    ok((await text(page, '#hsRate')).startsWith('130.81') && (await text(page, '#hsCount')) === '3', 'ch1 middle pluck, no fundamental: odd harmonics keep the period');
    await setRange(page, 'hsN', 2); await setRange(page, 'hsP', 4); await page.waitForTimeout(100);
    ok((await say('#hsSay')).includes('跳上去') && (await text(page, '#hsRate')).startsWith('261.63'), 'ch1 only the 2nd harmonic left: an octave up');
    await setRange(page, 'hsN', 1); await page.waitForTimeout(100);
    ok((await say('#hsSay')).includes('没剩下'), 'ch1 nothing left');
    await page.click('#hsDrop'); await setRange(page, 'hsN', 16); await setRange(page, 'hsP', 1);
    // ch2
    await show(page, '#cbCv');
    await pick(page, 'cbIv', '2/1'); await setRange(page, 'cbD', 0); await page.waitForTimeout(100);
    ok((await text(page, '#cbShared')) === '5', 'ch2 octave shares 5');
    await pick(page, 'cbIv', '3/2'); await setRange(page, 'cbD', -2); await page.waitForTimeout(100);
    ok((await say('#cbSay')).includes('起伏'), 'ch2 detuned fifth beats');
    await pick(page, 'cbIv', '45/32'); await setRange(page, 'cbD', 30); await page.waitForTimeout(100);
    ok((await say('#cbSay')).includes('一对重合的都没有'), 'ch2 tritone shares none');
    // ch3
    await show(page, '#btCurve');
    await setRange(page, 'btF', 24); await setRange(page, 'btD', 26); await page.waitForTimeout(100);
    ok((await text(page, '#btPeak')).includes('25.8') && (await say('#btSay')).includes('最粗糙'), 'ch3 peak at 440');
    await setRange(page, 'btF', 0); await page.waitForTimeout(100); ok((await text(page, '#btPeak')).includes('19.5'), 'ch3 peak at 110');
    await setRange(page, 'btD', 100); await page.waitForTimeout(100); ok((await say('#btSay')).length > 10, 'ch3 far apart');
    await setRange(page, 'btD', 0); await page.waitForTimeout(100); ok((await say('#btSay')).includes('完全一样'), 'ch3 unison');
    // ch4
    await show(page, '#dcCv');
    await setRange(page, 'dcN', 6); await setRange(page, 'dcC', 702); await page.waitForTimeout(100);
    ok((await say('#dcSay')).includes('3/2') && (await text(page, '#dcCount')) === '7', 'ch4 fifth dip and 7 dips');
    await setRange(page, 'dcN', 1); await page.waitForTimeout(100); ok((await text(page, '#dcCount')) === '0', 'ch4 one partial: no dips');
    await setRange(page, 'dcN', 10); await setRange(page, 'dcC', 1250); await page.waitForTimeout(100); ok((await say('#dcSay')).includes('之间'), 'ch4 between dips at the end');
    // ch5
    await show(page, '#tmCv');
    await pick(page, 'tmK', 'stretched'); await setRange(page, 'tmS', 2.1); await page.waitForTimeout(150);
    ok((await text(page, '#tmDip')).startsWith('1,284') && (await say('#tmSay')).includes('36.6'), 'ch5 stretched dip at 1284 and 36.6×: ' + await text(page, '#tmDip'));
    await pick(page, 'tmK', 'bar'); await page.waitForTimeout(150); ok((await say('#tmSay')).includes('金属棒') && await page.$eval('#tmS', e => e.disabled), 'ch5 bar');
    await pick(page, 'tmK', 'harmonic'); await page.waitForTimeout(150); ok((await text(page, '#tmDip')).startsWith('1,200'), 'ch5 harmonic dip at 1200');
    // ch6
    await show(page, '#pyCv');
    await setRange(page, 'pyK', 12); await page.waitForTimeout(100); ok((await text(page, '#pyGap')).startsWith('23.46'), 'ch6 comma');
    await setRange(page, 'pyK', 6); await page.waitForTimeout(100); ok((await say('#pySay')).includes('七声音阶'), 'ch6 seven notes');
    await setRange(page, 'pyK', 4); await page.waitForTimeout(100); ok((await say('#pySay')).includes('五声音阶'), 'ch6 five notes');
    await setRange(page, 'pyK', 1); await page.waitForTimeout(100); ok((await text(page, '#pyNotes')) === '2', 'ch6 two notes');
    // ch7
    await show(page, '#edCv');
    await setRange(page, 'edN', 12); await page.waitForTimeout(100); ok((await text(page, '#edFifth')).includes('−1.96') && (await say('#edSay')).includes('纪录'), 'ch7 12');
    await setRange(page, 'edN', 60); await page.waitForTimeout(100); ok((await say('#edSay')).includes('不如 53'), 'ch7 60 is not a record');
    await setRange(page, 'edN', 5); await page.waitForTimeout(100); ok((await say('#edSay')).includes('纪录'), 'ch7 5 is a record');
    // ch8
    await show(page, '#etCv');
    await pick(page, 'etSys', 'et'); await setRange(page, 'etKey', 0); await pick(page, 'etReg', '4'); await page.waitForTimeout(100);
    ok((await text(page, '#etTb')).includes('10.4'), 'ch8 ET third beat at C4');
    await pick(page, 'etReg', '3'); await page.waitForTimeout(100); ok((await text(page, '#etTb')).includes('5.2'), 'ch8 ET third beat at C3');
    await pick(page, 'etSys', 'just'); await setRange(page, 'etKey', 2); await page.waitForTimeout(100); ok((await say('#etSay')).includes('狼五度'), 'ch8 just D is a wolf');
    await pick(page, 'etSys', 'pyth'); await setRange(page, 'etKey', 1); await page.waitForTimeout(100); ok((await say('#etSay')).includes('狼五度'), 'ch8 pyth C♯ wolf');
    await setRange(page, 'etKey', 11); await page.waitForTimeout(100); ok((await say('#etSay')).includes('意外地干净'), 'ch8 pyth B near');
    ok((await page.$$eval('#ivTable tbody tr', r => r.length)) === 12, 'ch8 interval table has 12 rows');
    ok((await sayHasHoles(page)).length === 0, 'drive: unfilled sentence: ' + (await sayHasHoles(page)).join(' | '));
    ok(await page.evaluate(() => window.__acCount) === 0, 'drive: no AudioContext without a play click');
    ok(!page.__errors().length, 'drive: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  /* reduced motion: no smooth scroll, no moving playheads */
  {
    const page = await open(browser, 390, { reduce: true });
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: no smooth scroll');
    await page.click('#muteBtn');
    await show(page, '#btWave'); await page.click('#btPlay'); await page.waitForTimeout(300);
    const a = await hash(page, 'btWave'); await page.waitForTimeout(600);
    ok(await hash(page, 'btWave') === a, 'reduced motion: the ch3 playhead does not move');
    ok(await page.$eval('#fig3', e => e.dataset.playing) === '1', 'reduced motion: playback still reported');
    await show(page, '#hsWave'); await page.click('#hsPlay'); await page.waitForTimeout(300);
    const b = await hash(page, 'hsWave'); await page.waitForTimeout(600);
    ok(await hash(page, 'hsWave') === b, 'reduced motion: the ch1 playhead does not move');
    ok(!page.__errors().length, 'reduced: errors: ' + page.__errors().join(' | '));
    await page.close();
  }

  await browser.close();
  if (fails.length) { console.error(fails.map(f => 'FAIL ' + f).join('\n')); process.exit(1); }
  console.log('PASS: browser test (zh at 1280/390/320: overflow, clipped text, 48px targets, filled sentences; no AudioContext before a gesture, one per page after, mute and volume silence the master gain, every audio demo\'s visual twin runs muted with no context, unmute resumes; keyboard; language toggle without copy.en.js; all eight models at their extremes; reduced motion)');
})().catch(e => { console.error(e); process.exit(1); });
