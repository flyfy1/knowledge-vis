'use strict';
// Canvas text-collision check. Records the box of every fillText/strokeText on each <canvas> (in CSS px,
// through the current transform) and fails when two different labels on the same canvas intersect.
// Text drawn into canvases is invisible to DOM overflow checks; the 2026-11-09 review found the
// veil-of-ignorance society names overlapping at 390/320 only by looking at screenshots.
// Usage: CANVAS_BASE_URL=http://127.0.0.1:18871 node tests/canvas-text-overlap.cjs [--sweep] [page/path/ ...]
// Text that runs more than MIN px past the canvas edge is reported too (it gets clipped).
// --sweep (at every width; step-response step 3 collided only at 1280) also moves every range slider through 11 positions, walks every pair of sliders in
// the same section over a 6×6 grid, toggles checkboxes, clicks radios and every visible button. Sliders fire
// both input and change (some pages keep a trail on change). Most collisions in the 2026-11-09 follow-ups
// appeared only at particular slider values or slider pairs.
// Lazily drawn canvases (pages that draw a canvas only while it is on screen, e.g. IntersectionObserver-gated
// essays and demos/scarcity-moves/): after loading, every off-screen canvas that stayed quiet while the page sat
// still is scrolled into view once; if its text log changes, the page is "lazy" and the run switches to a
// scroll-aware mode for that page/width/language: each canvas that redrew is scanned in view, every control is
// swept with its nearest canvas scrolled to the middle of the screen and a short wait for the redraw, and scans
// read only canvases on screen (an off-screen canvas keeps its last log, which would otherwise repeat under every
// state). Pages with no lazy canvas take exactly the old path, with the same states.
// Needs Playwright on NODE_PATH. Run browser tests one at a time.
const { chromium } = require('playwright');
const base = (process.env.CANVAS_BASE_URL || 'http://127.0.0.1:18871').replace(/\/$/, '') + '/';
const args = process.argv.slice(2), sweep = args.includes('--sweep'), named = args.filter(a => a !== '--sweep');
const pages = named.length ? named : [
  'engineering/control/step-response/', 'psychology/cognition/signal-detection/',
  'psychology/ethics/veil-of-ignorance/', 'language/phonology/vowel-space/'
];
const MIN = 2; // px of overlap in both directions before two labels count as colliding

function record() {
  const logs = new WeakMap(), all = new Set(), draws = new WeakMap();
  const bump = c => draws.set(c, (draws.get(c) || 0) + 1); // text drawn or log reset: lets the runner see a redraw
  const reset = c => { logs.set(c, []); all.add(c); bump(c); };
  const P = CanvasRenderingContext2D.prototype;
  for (const fn of ['fillText', 'strokeText']) {
    const orig = P[fn];
    P[fn] = function (text, x, y, ...rest) {
      const s = String(text);
      if (s.trim()) {
        const m = this.measureText(s), T = this.getTransform(), c = this.canvas, r = c.getBoundingClientRect();
        const k = r.width / c.width || 1; // backing-store px → CSS px
        const sq = rest[0] > 0 && m.width > rest[0] ? rest[0] / m.width : 1; // fillText(text, x, y, maxWidth) squeezes the text
        const xs = [x - m.actualBoundingBoxLeft * sq, x + m.actualBoundingBoxRight * sq], ys = [y - m.actualBoundingBoxAscent, y + m.actualBoundingBoxDescent];
        const pts = xs.flatMap(px => ys.map(py => [(T.a * px + T.c * py + T.e) * k, (T.b * px + T.d * py + T.f) * k]));
        const box = { text: s, x0: Math.min(...pts.map(p => p[0])), x1: Math.max(...pts.map(p => p[0])), y0: Math.min(...pts.map(p => p[1])), y1: Math.max(...pts.map(p => p[1])) };
        if (!logs.has(c)) reset(c);
        logs.get(c).push(box); bump(c);
      }
      return orig.call(this, text, x, y, ...rest);
    };
  }
  // A canvas is redrawn from scratch when it is resized, reset or cleared (nearly) in full; start its log again.
  for (const dim of ['width', 'height']) {
    const desc = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, dim);
    Object.defineProperty(HTMLCanvasElement.prototype, dim, { ...desc, set(v) { reset(this); desc.set.call(this, v); } });
  }
  if (P.reset) { const r0 = P.reset; P.reset = function () { reset(this.canvas); return r0.call(this); }; }
  const clear = P.clearRect, fill = P.fillRect;
  // "Full" allows a few px of slack: pages often clear their CSS size rounded down under a DPR transform.
  const full = (ctx, x, y, w, h) => { const T = ctx.getTransform(), cw = ctx.canvas.width, ch = ctx.canvas.height; return x * T.a + T.e <= 4 && y * T.d + T.f <= 4 && (x + w) * T.a + T.e >= cw * 0.97 && (y + h) * T.d + T.f >= ch * 0.97; };
  P.clearRect = function (...a) { if (full(this, ...a)) reset(this.canvas); return clear.apply(this, a); };
  P.fillRect = function (...a) { if (full(this, ...a)) reset(this.canvas); return fill.apply(this, a); };
  const onScreen = r => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  // visibleOnly: only canvases intersecting the viewport (scroll-aware mode).
  window.__canvasText = (visibleOnly = false) => [...all].filter(c => c.isConnected && (!visibleOnly || onScreen(c.getBoundingClientRect()))).map(c => { const r = c.getBoundingClientRect(); return { id: c.id || c.closest('[id]')?.id || '?', w: r.width, h: r.height, boxes: logs.get(c) || [] }; });
  // Every canvas on the page (drawn or not) with its redraw counter and whether it is on screen now.
  window.__canvasDraws = () => [...document.querySelectorAll('canvas')].map((c, i) => ({ i, n: draws.get(c) || 0, on: onScreen(c.getBoundingClientRect()), shown: c.getClientRects().length > 0 }));
  window.__canvasShow = i => document.querySelectorAll('canvas')[i].scrollIntoView({ block: 'center', behavior: 'instant' });
  // Scroll the canvas nearest to a control (same section first, else the page) to the middle of the screen.
  window.__canvasNear = el => {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    const shown = c => c.getClientRects().length > 0, y = e => e.getBoundingClientRect().top + scrollY;
    const box = el.closest('section,article,figure');
    let cs = box ? [...box.querySelectorAll('canvas')].filter(shown) : [];
    if (!cs.length) cs = [...document.querySelectorAll('canvas')].filter(shown);
    if (!cs.length) return;
    const c = cs.reduce((a, b) => Math.abs(y(b) - y(el)) < Math.abs(y(a) - y(el)) ? b : a);
    c.scrollIntoView({ block: 'center', behavior: 'instant' });
  };
}

// Boxes are in canvas-local CSS px, so the canvas is [0, w] × [0, h]. Only text that is partly visible counts:
// text drawn wholly outside (a scrolled strip, an off-screen trace) is never seen, so it is not cut off either.
function clipped(boxes, w, h) {
  const visible = b => b.x1 > 0 && b.x0 < w && b.y1 > 0 && b.y0 < h;
  return [...new Set(boxes.filter(b => visible(b) && (b.x0 < -MIN || b.y0 < -MIN || b.x1 > w + MIN || b.y1 > h + MIN)).map(b => `"${b.text}" outside the ${w.toFixed(0)}×${h.toFixed(0)} canvas (x ${b.x0.toFixed(0)}..${b.x1.toFixed(0)}, y ${b.y0.toFixed(0)}..${b.y1.toFixed(0)})`))];
}

function collisions(boxes) {
  const out = [], seen = new Set();
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.text === b.text && Math.abs(a.x0 - b.x0) < 1 && Math.abs(a.y0 - b.y0) < 1) continue; // same label drawn twice
    const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    if (w > MIN && h > MIN) { const key = a.text + '|' + b.text; if (!seen.has(key)) { seen.add(key); out.push(`"${a.text}" × "${b.text}" (${w.toFixed(1)}×${h.toFixed(1)} px)`); } }
  }
  return out;
}

async function main() {
  const browser = await chromium.launch(), failures = [];
  let checked = 0; const lazyRuns = [];
  for (const path of pages) for (const width of [1280, 390, 320]) for (const lang of ['zh', 'en']) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(record);
    await page.goto(base + path);
    const toggle = page.locator('[data-lang=' + lang + ']');
    if (await toggle.count()) await toggle.first().click(); else if (lang === 'en') { await page.close(); continue; } // single-language page: check once
    await page.waitForTimeout(300);
    let lazy = false;
    const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const settle = async () => { if (lazy) { await frames(); await page.waitForTimeout(80); } };
    const near = async el => { if (lazy) { await page.evaluate(el => window.__canvasNear(el), el); await settle(); } };
    const scan = async state => {
      for (const { id, w, h, boxes } of await page.evaluate(v => window.__canvasText(v), lazy)) {
        checked++;
        if (!w || !h) continue; // hidden canvas
        for (const c of [...collisions(boxes), ...clipped(boxes, w, h)]) { const msg = `${path} ${width} ${lang} #${id}${state}: ${c}`; if (!failures.includes(msg)) failures.push(msg); }
      }
    };
    await scan('');
    // Lazy canvases: quiet while the page sits still and off screen, but they redraw once scrolled into view.
    const d0 = await page.evaluate(() => window.__canvasDraws());
    await page.waitForTimeout(300);
    const d1 = await page.evaluate(() => window.__canvasDraws());
    for (const c of d1.filter((c, i) => c.shown && !c.on && c.n === d0[i].n)) {
      await page.evaluate(i => window.__canvasShow(i), c.i);
      await page.waitForTimeout(300);
      const now = (await page.evaluate(() => window.__canvasDraws()))[c.i];
      if (now.n === c.n) continue;
      lazy = true;
      await scan(` [canvas ${c.i + 1} in view]`);
    }
    if (sweep) {
      const set = async (id, v) => { await page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; for (const t of ['input', 'change']) e.dispatchEvent(new Event(t, { bubbles: true })); }, [id, String(v)]); await settle(); };
      const ranges = await page.$$eval('input[type=range]', a => a.filter(e => e.id).map(e => [e.id, +e.min, +e.max, e.value, e.closest('section,[id]')?.id || '']));
      for (const [id, min, max, v0] of ranges) {
        await near(id);
        for (let i = 0; i <= 10; i++) { const v = min + (max - min) * i / 10; await set(id, v); await scan(` ${id}=${+v.toFixed(3)}`); }
        await set(id, v0);
      }
      for (let i = 0; i < ranges.length; i++) for (let j = i + 1; j < ranges.length; j++) {
        const [a, b] = [ranges[i], ranges[j]]; if (a[4] !== b[4]) continue;
        await near(a[0]);
        for (let u = 0; u <= 5; u++) for (let v = 0; v <= 5; v++) {
          const va = a[1] + (a[2] - a[1]) * u / 5, vb = b[1] + (b[2] - b[1]) * v / 5;
          await set(a[0], va); await set(b[0], vb); await scan(` ${a[0]}=${+va.toFixed(3)} ${b[0]}=${+vb.toFixed(3)}`);
        }
        await set(a[0], a[3]); await set(b[0], b[3]);
      }
      for (const box of await page.$$('main input[type=checkbox], main input[type=radio]')) {
        if (!(await box.isVisible())) continue;
        await near(box); await box.click({ timeout: 2000 }).catch(() => {}); await settle(); await scan(` [${await box.evaluate(e => e.type + ':' + (e.dataset.show || e.name + '=' + e.value))}]`);
      }
      for (const b of await page.$$('main button')) {
        if (!(await b.isVisible())) continue;
        const label = (await b.innerText()).trim().slice(0, 24);
        await near(b); await b.click({ timeout: 2000 }).catch(() => {}); await settle(); await scan(` [${label}]`);
      }
    }
    if (lazy) lazyRuns.push(`${path} ${width} ${lang}`);
    for (const e of new Set(errors)) failures.push(`${path} ${width} ${lang}: page error: ${e}`);
    await page.close();
  }
  await browser.close();
  if (lazyRuns.length) console.log(`scroll-aware mode (canvases drawn only on screen): ${lazyRuns.length} of the page × width × language runs: ${lazyRuns.join(', ')}`);
  if (failures.length) { console.error(failures.join('\n')); console.error(`FAIL: ${failures.length} findings; ${checked} canvas states checked`); process.exit(1); }
  console.log(`PASS: ${checked} canvas states across ${pages.length} pages × 1280/390/320 × zh/en${sweep ? ' (with slider/button sweep)' : ''} have no colliding or clipped text`);
}
// Exported so page tests can sweep their own slider states with the same recorder.
module.exports = { record, collisions, clipped };
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
