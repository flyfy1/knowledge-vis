#!/usr/bin/env node
'use strict';
/* Live Playwright Chromium verification for W8 (how-chromium-renders-a-web-page).
   Coordinator runs serially after builder agents finish:
     NODE_PATH=~/fast/integ-life/integ-games/node_modules node computing/software/how-chromium-renders-a-web-page/tools/crosscheck.cjs
   Verifies real Chromium behavior against models.js assumptions:
   1. Exact host Chromium version via browser.version()
   2. Forced Synchronous Layout (interleaved width write + offsetHeight read) vs batched read-then-write
   3. CSS transform matrix decomposition (getComputedStyle().transform === 'matrix(1, 0, 0, 1, 60, -40)')
      and zero LayoutNG offsetLeft/offsetTop mutation vs style.left geometry mutation
   4. Overlapping bounding-box geometry test (MightOverlap) for composited badge + cards
   5. WAAPI element.animate() transform immunity during a 60 ms main-thread JS long task vs rAF left stall
   6. 2026 RenderingNG / Frontier feature support checks (scroll-driven animations, startViewTransition, speculationrules)
*/
const path = require('path');
const { chromium } = require('playwright');
const M = require(path.join(__dirname, '..', 'models.js'));

let n = 0;
let bad = 0;
const rows = [];
function cmp(name, okCond, detail) {
  n++;
  if (!okCond) bad++;
  rows.push(`${okCond ? 'ok  ' : 'FAIL'} ${name}${detail ? '  (' + detail + ')' : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const ver = browser.version();
  rows.push(`Chromium ${ver} (expected host milestone ${M.PINNED_BUILD.milestone})`);
  cmp('Chromium launched with non-empty version', typeof ver === 'string' && ver.length > 0, ver);

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  /* 1. Forced Synchronous Layout vs Batched Read-Then-Write */
  await page.setContent(`
    <style>
      #wrap { width: 600px; }
      .card { width: 200px; margin: 4px 0; padding: 8px; line-height: 20px; border: 1px solid #333; }
    </style>
    <div id="wrap"></div>
  `);
  const reflowRes = await page.evaluate(() => {
    const wrap = document.getElementById('wrap');
    const N = 160;
    for (let i = 0; i < N; i++) {
      const d = document.createElement('div');
      d.className = 'card';
      d.textContent = 'Card item #' + i + ' layout check content wrapping across lines';
      wrap.appendChild(d);
    }
    const cards = [...wrap.querySelectorAll('.card')];
    void wrap.offsetHeight; // warm baseline

    // Pattern A: Batched (read all, then write all)
    const t0 = performance.now();
    const hBatch = cards.map(c => c.offsetHeight);
    for (let i = 0; i < cards.length; i++) cards[i].style.width = (220 + (i % 7) * 20) + 'px';
    const endHBatch = wrap.offsetHeight;
    const batchedMs = performance.now() - t0;

    // Reset widths cleanly before Pattern B
    for (let i = 0; i < cards.length; i++) cards[i].style.width = '200px';
    void wrap.offsetHeight;

    // Pattern B: Interleaved write-then-read (Forced Synchronous Layout)
    const t1 = performance.now();
    const hThrash = [];
    for (let i = 0; i < cards.length; i++) {
      cards[i].style.width = (220 + (i % 7) * 20) + 'px';
      hThrash.push(cards[i].offsetHeight);
    }
    const endHThrash = wrap.offsetHeight;
    const thrashMs = performance.now() - t1;

    return { batchedMs, thrashMs, endHBatch, endHThrash, n: cards.length };
  });
  cmp('Forced Synchronous Layout slower than batched reads+writes',
    reflowRes.thrashMs > reflowRes.batchedMs * 2,
    `thrash=${reflowRes.thrashMs.toFixed(2)}ms vs batched=${reflowRes.batchedMs.toFixed(2)}ms`);
  cmp('Batched and thrash reach identical final container height',
    reflowRes.endHBatch === reflowRes.endHThrash,
    `${reflowRes.endHBatch} vs ${reflowRes.endHThrash}`);

  /* 2. Property Tree Transform matrix & LayoutNG offset invariance */
  const ptModel = M.evaluatePropertyTrees({ changeType: 'transform', tx: 60, scrollY: 40, opacity: 0.85, clipOn: true });
  await page.setContent(`
    <style>
      #stage { position: relative; width: 400px; height: 300px; overflow: hidden; }
      #box { position: absolute; left: 70px; top: 60px; width: 110px; height: 64px; background: gold; }
    </style>
    <div id="stage"><div id="box"></div></div>
  `);
  const propRes = await page.evaluate(() => {
    const box = document.getElementById('box');
    const offBefore = { left: box.offsetLeft, top: box.offsetTop };
    const rectBefore = box.getBoundingClientRect();

    box.style.transform = 'translateX(60px) translateY(-40px)';
    const compMatrix = getComputedStyle(box).transform;
    const offAfterTf = { left: box.offsetLeft, top: box.offsetTop };
    const rectAfterTf = box.getBoundingClientRect();

    // Now reset transform and mutate style.left instead
    box.style.transform = 'none';
    box.style.left = '130px';
    const offAfterLeft = { left: box.offsetLeft, top: box.offsetTop };

    return {
      compMatrix,
      offBefore,
      offAfterTf,
      offAfterLeft,
      dx: Math.round(rectAfterTf.left - rectBefore.left),
      dy: Math.round(rectAfterTf.top - rectBefore.top)
    };
  });
  cmp('getComputedStyle(box).transform matches models.js matrixStr',
    propRes.compMatrix === ptModel.matrixStr,
    `${propRes.compMatrix} === ${ptModel.matrixStr}`);
  cmp('transform moves visual rect by (60, -40) while keeping offsetLeft/offsetTop unchanged',
    propRes.dx === 60 && propRes.dy === -40 &&
    propRes.offAfterTf.left === propRes.offBefore.left &&
    propRes.offAfterTf.top === propRes.offBefore.top,
    `dx=${propRes.dx}, dy=${propRes.dy}, offsetLeft=${propRes.offAfterTf.left}`);
  cmp('style.left mutates LayoutNG offsetLeft directly',
    propRes.offAfterLeft.left === 130,
    `offsetLeft=${propRes.offAfterLeft.left}`);

  /* 3. Layer overlap geometry check (ch6 badge + cards MightOverlap) */
  await page.setContent(`
    <style>
      #badge { position: absolute; left: 60px; top: 40px; width: 220px; height: 120px; z-index: 1; will-change: transform; }
      .c { position: absolute; left: 100px; top: 80px; width: 280px; height: 280px; z-index: 2; overflow: hidden; }
    </style>
    <div id="badge"></div><div class="c"></div>
  `);
  const ovRes = await page.evaluate(() => {
    const a = document.getElementById('badge').getBoundingClientRect();
    const b = document.querySelector('.c').getBoundingClientRect();
    const overlaps = !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
    return { overlaps, badgeWillChange: getComputedStyle(document.getElementById('badge')).willChange };
  });
  cmp('Badge and card rects overlap with will-change: transform',
    ovRes.overlaps && ovRes.badgeWillChange === 'transform',
    JSON.stringify(ovRes));

  /* 4. WAAPI compositor animation progresses across main-thread JS stall without layout mutation */
  const animRes = await page.evaluate(async () => {
    document.body.innerHTML = '<div id="tf" style="width:40px;height:40px;"></div>';
    const tf = document.getElementById('tf');
    const offsetBefore = tf.offsetLeft;
    const anim = tf.animate(
      [{ transform: 'translateX(0px)' }, { transform: 'translateX(200px)' }],
      { duration: 300, fill: 'forwards' }
    );
    await anim.ready;
    const before = new DOMMatrix(getComputedStyle(tf).transform).m41;
    // Block main thread for 70 ms synchronously, then yield to the next BeginMainFrame
    const s = performance.now();
    while (performance.now() - s < 70) { /* busy spin */ }
    await new Promise(r => setTimeout(r, 25));
    await new Promise(r => requestAnimationFrame(r));
    const after = new DOMMatrix(getComputedStyle(tf).transform).m41;
    const offsetAfter = tf.offsetLeft;
    anim.cancel();
    return { before, after, offsetBefore, offsetAfter };
  });
  cmp('WAAPI transform advances through 70 ms JS stall without mutating layout',
    animRes.after > animRes.before + 25 && animRes.offsetAfter === animRes.offsetBefore,
    `before=${animRes.before.toFixed(1)}px -> after=${animRes.after.toFixed(1)}px, offsetLeft=${animRes.offsetAfter}`);

  /* 5. Chromium 2026 Frontier API checks */
  const feat = await page.evaluate(() => ({
    scrollTimeline: typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()'),
    viewTransition: typeof document.startViewTransition === 'function',
    speculationRules: typeof HTMLScriptElement !== 'undefined' && typeof HTMLScriptElement.supports === 'function' && HTMLScriptElement.supports('speculationrules')
  }));
  cmp('Chromium supports CSS animation-timeline: scroll()', feat.scrollTimeline, String(feat.scrollTimeline));
  cmp('Chromium supports document.startViewTransition()', feat.viewTransition, String(feat.viewTransition));
  cmp('Chromium supports HTMLScriptElement.supports("speculationrules")', feat.speculationRules, String(feat.speculationRules));

  await browser.close();
  console.log(rows.join('\n'));
  console.log(`${n - bad}/${n} crosschecks passed`);
  process.exit(bad ? 1 : 0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
