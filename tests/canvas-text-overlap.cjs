'use strict';
// Canvas text-collision check. Records the box of every fillText/strokeText on each <canvas> (in CSS px,
// through the current transform) and fails when two different labels on the same canvas intersect.
// Text drawn into canvases is invisible to DOM overflow checks; the 2026-11-09 review found the
// veil-of-ignorance society names overlapping at 390/320 only by looking at screenshots.
// Usage: CANVAS_BASE_URL=http://127.0.0.1:18871 node tests/canvas-text-overlap.cjs [--sweep] [page/path/ ...]
// --sweep also moves every range slider through 11 positions and clicks every visible button (390/320 px only);
// most collisions in the 2026-11-09 follow-up appeared only at particular slider values.
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
  const logs = new WeakMap(), all = new Set();
  const reset = c => { logs.set(c, []); all.add(c); };
  const P = CanvasRenderingContext2D.prototype;
  for (const fn of ['fillText', 'strokeText']) {
    const orig = P[fn];
    P[fn] = function (text, x, y, ...rest) {
      const s = String(text);
      if (s.trim()) {
        const m = this.measureText(s), T = this.getTransform(), c = this.canvas, r = c.getBoundingClientRect();
        const k = r.width / c.width || 1; // backing-store px → CSS px
        const xs = [x - m.actualBoundingBoxLeft, x + m.actualBoundingBoxRight], ys = [y - m.actualBoundingBoxAscent, y + m.actualBoundingBoxDescent];
        const pts = xs.flatMap(px => ys.map(py => [(T.a * px + T.c * py + T.e) * k, (T.b * px + T.d * py + T.f) * k]));
        const box = { text: s, x0: Math.min(...pts.map(p => p[0])), x1: Math.max(...pts.map(p => p[0])), y0: Math.min(...pts.map(p => p[1])), y1: Math.max(...pts.map(p => p[1])) };
        if (!logs.has(c)) reset(c);
        logs.get(c).push(box);
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
  window.__canvasText = () => [...all].filter(c => c.isConnected).map(c => ({ id: c.id || c.closest('[id]')?.id || '?', boxes: logs.get(c) || [] }));
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
  let checked = 0;
  for (const path of pages) for (const width of [1280, 390, 320]) for (const lang of ['zh', 'en']) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(record);
    await page.goto(base + path);
    const toggle = page.locator('[data-lang=' + lang + ']');
    if (await toggle.count()) await toggle.first().click(); else if (lang === 'en') { await page.close(); continue; } // single-language page: check once
    await page.waitForTimeout(300);
    const scan = async state => {
      for (const { id, boxes } of await page.evaluate(() => window.__canvasText())) {
        checked++;
        for (const c of collisions(boxes)) { const msg = `${path} ${width} ${lang} #${id}${state}: ${c}`; if (!failures.includes(msg)) failures.push(msg); }
      }
    };
    await scan('');
    if (sweep && width !== 1280) {
      const set = (id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, String(v)]);
      for (const [id, min, max, v0] of await page.$$eval('input[type=range]', a => a.map(e => [e.id, +e.min, +e.max, e.value]))) {
        for (let i = 0; i <= 10; i++) { const v = min + (max - min) * i / 10; await set(id, v); await scan(` ${id}=${+v.toFixed(3)}`); }
        await set(id, v0);
      }
      for (const b of await page.$$('main button')) {
        if (!(await b.isVisible())) continue;
        const label = (await b.innerText()).trim().slice(0, 24);
        await b.click({ timeout: 2000 }).catch(() => {}); await scan(` [${label}]`);
      }
    }
    for (const e of new Set(errors)) failures.push(`${path} ${width} ${lang}: page error: ${e}`);
    await page.close();
  }
  await browser.close();
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`PASS: ${checked} canvas states across ${pages.length} pages × 1280/390/320 × zh/en${sweep ? ' (with slider/button sweep)' : ''} have no colliding text`);
}
// Exported so page tests can sweep their own slider states with the same recorder.
module.exports = { record, collisions };
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
