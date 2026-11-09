/* Canvas label guard (2026-11-09 canvas text survey, specs/reviews/canvas-text-survey-20261109.md).
 *
 * Opt-in: a page loads this before its own scripts. Within one drawing pass of a canvas, a label (fillText /
 * strokeText) that would overlap a label already drawn there by more than 2 px moves a line down or up (or sideways), and
 * every label is kept inside the canvas; a label wider than the canvas is wrapped onto several lines (words for
 * Latin text, characters for CJK). A pass ends when the canvas is resized, reset or cleared in full, or when
 * the current task ends. Text drawn twice at the same spot (outline + fill) moves together. Rotated or skewed
 * text, and canvases marked data-label-guard="off", are drawn exactly as asked.
 *
 * It fixes layouts that only break on some widths, languages or slider values; it does not replace laying a
 * chart out properly. tests/canvas-text-overlap.cjs records text after this guard has placed it.
 */
(function () {
  'use strict';
  if (typeof CanvasRenderingContext2D === 'undefined' || CanvasRenderingContext2D.prototype.__labelGuard) return;
  const P = CanvasRenderingContext2D.prototype, MIN = 2;
  P.__labelGuard = true;
  const state = new WeakMap(); // canvas -> { turn, boxes: [], moved: Map }
  let turn = 0, tick = false;
  const fresh = c => { const s = { turn, boxes: [], moved: new Map() }; state.set(c, s); return s; };
  const passOf = c => {
    if (!tick) { tick = true; queueMicrotask(() => { turn++; tick = false; }); }
    const s = state.get(c); return s && s.turn === turn ? s : fresh(c);
  };
  for (const dim of ['width', 'height']) {
    const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, dim);
    Object.defineProperty(HTMLCanvasElement.prototype, dim, { ...d, set(v) { state.delete(this); d.set.call(this, v); } });
  }
  if (P.reset) { const r0 = P.reset; P.reset = function () { state.delete(this.canvas); return r0.call(this); }; }
  const full = (ctx, x, y, w, h) => { const T = ctx.getTransform(), c = ctx.canvas; return x * T.a + T.e <= 4 && y * T.d + T.f <= 4 && (x + w) * T.a + T.e >= c.width * 0.97 && (y + h) * T.d + T.f >= c.height * 0.97; };
  for (const fn of ['clearRect', 'fillRect']) { const f0 = P[fn]; P[fn] = function (x, y, w, h) { if (full(this, x, y, w, h)) state.delete(this.canvas); return f0.apply(this, arguments); }; }

  function place(ctx, text, x, y, maxWidth) {
    const c = ctx.canvas, T = ctx.getTransform(), s = String(text);
    if (!s.trim() || T.b !== 0 || T.c !== 0 || T.a <= 0 || T.d <= 0 || (c.dataset && c.dataset.labelGuard === 'off')) return [x, y];
    const pass = passOf(c), key = s + '|' + x + '|' + y + '|' + ctx.font + '|' + ctx.textAlign + '|' + ctx.textBaseline;
    if (pass.moved.has(key)) return pass.moved.get(key);
    const m = ctx.measureText(s), sq = maxWidth > 0 && m.width > maxWidth ? maxWidth / m.width : 1;
    // Box in backing-store pixels.
    let l = (x - m.actualBoundingBoxLeft * sq) * T.a + T.e, r = (x + m.actualBoundingBoxRight * sq) * T.a + T.e;
    let t = (y - m.actualBoundingBoxAscent) * T.d + T.f, b = (y + m.actualBoundingBoxDescent) * T.d + T.f;
    const W = c.width, H = c.height, pad = 2 * (T.a || 1);
    const dx = l < pad ? pad - l : r > W - pad ? Math.max(pad - l, W - pad - r) : 0;
    const dy = t < pad ? pad - t : b > H - pad ? Math.max(pad - t, H - pad - b) : 0;
    l += dx; r += dx; t += dy; b += dy;
    // Candidate moves: up to three lines down or up, then sideways by half or a whole label width (alone and with
    // one line up or down). The first that overlaps nothing wins; failing that, the one that overlaps least.
    const lh = b - t + 3 * T.d, wd = r - l + 4 * T.a, gap = MIN * T.a;
    const overlap = (ex, ey) => pass.boxes.reduce((sum, q) => { const ow = Math.min(q.r, r + ex) - Math.max(q.l, l + ex), oh = Math.min(q.b, b + ey) - Math.max(q.t, t + ey); return sum + (ow > gap && oh > gap ? ow * oh : 0); }, 0);
    const moves = [[0, 0], [0, lh], [0, -lh], [0, 2 * lh], [0, -2 * lh], [0, 3 * lh], [0, -3 * lh]];
    for (const ex of [wd / 2, -wd / 2, wd, -wd]) for (const ey of [0, -lh, lh]) moves.push([ex, ey]);
    const inside = ([ex, ey]) => l + ex >= 0 && r + ex <= W && t + ey >= 0 && b + ey <= H;
    let best = null, bestArea = Infinity;
    for (const mv of moves) { if (!inside(mv)) continue; const a = overlap(mv[0], mv[1]); if (a === 0) { best = mv; break; } if (a < bestArea) { bestArea = a; best = mv; } }
    const [ex, e] = best || [0, 0];
    pass.boxes.push({ l: l + ex, r: r + ex, t: t + e, b: b + e });
    const out = [x + (dx + ex) / T.a, y + (dy + e) / T.d];
    pass.moved.set(key, out);
    return out;
  }
  // Lines of s no wider than the canvas, or null when s fits (or the guard does not apply).
  function wrap(ctx, s, maxWidth) {
    const c = ctx.canvas, T = ctx.getTransform();
    if (maxWidth > 0 || T.b !== 0 || T.c !== 0 || T.a <= 0 || T.d <= 0 || (c.dataset && c.dataset.labelGuard === 'off')) return null;
    const room = (c.width - 8 * T.a) / T.a;
    if (ctx.measureText(s).width <= room) return null;
    const tokens = s.match(/[\u2e80-\u9fff\uff00-\uffef][，。、：；）」』]?|[^\s\u2e80-\u9fff\uff00-\uffef]+\s*|\s+/g) || [s], out = [];
    let cur = '';
    for (const tk of tokens) { if (cur.trim() && ctx.measureText(cur + tk).width > room) { out.push(cur.trimEnd()); cur = tk.trimStart(); } else cur += tk; }
    if (cur.trim()) out.push(cur.trimEnd());
    return out.length > 1 ? out : null;
  }
  for (const fn of ['fillText', 'strokeText']) {
    const f0 = P[fn];
    P[fn] = function (text, x, y, maxWidth) {
      const lines = wrap(this, String(text), maxWidth);
      if (lines) {
        // Wrapped lines go downward from y, or end at y when there is no room below.
        const m = this.measureText('Mg'), lh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 3, T = this.getTransform();
        const y0 = ((y + (lines.length - 1) * lh) * T.d + T.f > this.canvas.height - 4 * T.d) ? y - (lines.length - 1) * lh : y;
        lines.forEach((ln, i) => { const [X, Y] = place(this, ln, x, y0 + i * lh); f0.call(this, ln, X, Y); });
        return;
      }
      const [X, Y] = place(this, text, x, y, maxWidth);
      return maxWidth === undefined ? f0.call(this, text, X, Y) : f0.call(this, text, X, Y, maxWidth);
    };
  }
})();
