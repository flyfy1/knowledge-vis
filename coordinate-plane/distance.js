'use strict';
/* Step 6 extension: midpoint, vector components and distance. Pure math stays
   exposed for focused review; the canvas is only a view of the same state. */
(function () {
  const GRID_MIN = -6, GRID_MAX = 6;
  const state = { a: { x: -3, y: -2 }, b: { x: 4, y: 3 }, components: true, drag: null };
  const $ = id => document.getElementById(id);
  const clampInt = v => Math.max(GRID_MIN, Math.min(GRID_MAX, Math.round(Number(v))));
  const fmt = v => (Math.abs(v) < 1e-9 ? '0' : Number(v).toFixed(2).replace(/\.00$/, ''));
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const delta = (a, b) => ({ x: b.x - a.x, y: b.y - a.y });
  const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const slope = (a, b) => b.x === a.x ? null : (b.y - a.y) / (b.x - a.x);
  const coord = p => `(${p.x}, ${p.y})`;
  const t = (key, params) => {
    let s = (typeof t === 'function' ? t(key, params) : key);
    return s;
  };
  function canvasMap(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssH = Number(cv.getAttribute('height') || 420);
    cv.style.height = cssH + 'px';
    const w = cv.clientWidth || 720, h = cssH;
    const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
    if (cv.width !== bw) cv.width = bw;
    if (cv.height !== bh) cv.height = bh;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = Math.min(38, Math.max(22, w * .08));
    const side = Math.min(w - 2 * pad, h - 2 * pad);
    const ox = (w - side) / 2, oy = (h - side) / 2;
    const unit = side / (GRID_MAX - GRID_MIN);
    return { ctx, w, h, ox, oy, unit, X: x => ox + (x - GRID_MIN) * unit, Y: y => oy + (GRID_MAX - y) * unit,
      unX: px => clampInt(GRID_MIN + (px - ox) / unit), unY: py => clampInt(GRID_MAX - (py - oy) / unit) };
  }
  function text(ctx, s, x, y, color, size, align) { ctx.fillStyle = color; ctx.font = `${size || 13}px system-ui,sans-serif`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function drawArrow(ctx, a, b, color, width) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.strokeStyle = color; ctx.lineWidth = width || 2; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    const len = 7; ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - len * Math.cos(ang - .45), b[1] - len * Math.sin(ang - .45)); ctx.lineTo(b[0] - len * Math.cos(ang + .45), b[1] - len * Math.sin(ang + .45)); ctx.closePath(); ctx.fill();
  }
  function render() {
    const cv = $('s6-canvas'); if (!cv) return;
    const m = canvasMap(cv), { ctx, ox, oy, unit, X, Y } = m;
    ctx.clearRect(0, 0, m.w, m.h);
    ctx.fillStyle = '#161b22'; ctx.fillRect(0, 0, m.w, m.h);
    ctx.strokeStyle = 'rgba(91,107,132,.35)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = GRID_MIN; i <= GRID_MAX; i++) { ctx.moveTo(X(i), oy); ctx.lineTo(X(i), oy + (GRID_MAX - GRID_MIN) * unit); ctx.moveTo(ox, Y(i)); ctx.lineTo(ox + (GRID_MAX - GRID_MIN) * unit, Y(i)); }
    ctx.stroke();
    ctx.strokeStyle = '#5b6b84'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(X(GRID_MIN), Y(0)); ctx.lineTo(X(GRID_MAX), Y(0)); ctx.moveTo(X(0), Y(GRID_MIN)); ctx.lineTo(X(0), Y(GRID_MAX)); ctx.stroke();
    for (let i = GRID_MIN; i <= GRID_MAX; i++) { if (i) { text(ctx, String(i), X(i), Y(0) + 12, '#9aa7b8', 10); text(ctx, String(i), X(0) - 12, Y(i), '#9aa7b8', 10, 'right'); } }
    const A = [X(state.a.x), Y(state.a.y)], B = [X(state.b.x), Y(state.b.y)], M0 = midpoint(state.a, state.b), M = [X(M0.x), Y(M0.y)];
    if (state.components) {
      ctx.setLineDash([5, 5]); ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, `Δx = ${delta(state.a, state.b).x}`, (A[0] + B[0]) / 2, A[1] + 16, '#ffb454', 12);
      text(ctx, `Δy = ${delta(state.a, state.b).y}`, B[0] + 28, (A[1] + B[1]) / 2, '#ffb454', 12, 'left');
    }
    ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    drawArrow(ctx, A, B, '#6ee7ff', 2.5);
    ctx.fillStyle = '#7ee2a8'; ctx.beginPath(); ctx.arc(M[0], M[1], 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(A[0], A[1], 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff7a93'; ctx.beginPath(); ctx.arc(B[0], B[1], 8, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'A ' + coord(state.a), A[0], A[1] - 17, '#ffb454', 12);
    text(ctx, 'B ' + coord(state.b), B[0], B[1] - 17, '#ff7a93', 12);
    text(ctx, 'M ' + coord(M0), M[0], M[1] + 18, '#7ee2a8', 12);
    $('s6-ax-val').textContent = state.a.x; $('s6-ay-val').textContent = state.a.y; $('s6-bx-val').textContent = state.b.x; $('s6-by-val').textContent = state.b.y;
    $('s6-ax').value = state.a.x; $('s6-ay').value = state.a.y; $('s6-bx').value = state.b.x; $('s6-by').value = state.b.y;
    $('s6-components').classList.toggle('active', state.components);
    const d = delta(state.a, state.b), dist = distance(state.a, state.b), sl = slope(state.a, state.b);
    $('s6-ro').innerHTML = t('s6ro', { a: coord(state.a), b: coord(state.b), dx: d.x, dy: d.y, dist: fmt(dist), mid: coord(M0), slope: sl === null ? t('s6vertical') : fmt(sl) });
    $('s6-check').textContent = t('s6check', { lhs: fmt(dist * dist), rhs: `${d.x}² + ${d.y}² = ${d.x * d.x + d.y * d.y}` });
  }
  function setPoint(which, x, y) { state[which] = { x: clampInt(x), y: clampInt(y) }; render(); }
  function pointerPoint(e) { const cv = $('s6-canvas'), r = cv.getBoundingClientRect(), m = canvasMap(cv); return { x: m.unX(e.clientX - r.left), y: m.unY(e.clientY - r.top) }; }
  function bind() {
    [['a','x'], ['a','y'], ['b','x'], ['b','y']].forEach(([p, axis]) => { const id = `s6-${p}${axis}`; $(id).addEventListener('input', e => setPoint(p, axis === 'x' ? e.target.value : state[p].x, axis === 'y' ? e.target.value : state[p].y)); });
    $('s6-components').addEventListener('click', () => { state.components = !state.components; render(); });
    $('s6-reset').addEventListener('click', () => { state.a = { x: -3, y: -2 }; state.b = { x: 4, y: 3 }; state.components = true; render(); });
    const cv = $('s6-canvas'); cv.classList.add('dragc');
    cv.addEventListener('pointerdown', e => { const p = pointerPoint(e); const da = Math.hypot(p.x - state.a.x, p.y - state.a.y), db = Math.hypot(p.x - state.b.x, p.y - state.b.y); state.drag = da <= db && da <= 1 ? 'a' : db <= 1 ? 'b' : null; if (state.drag) { cv.setPointerCapture(e.pointerId); setPoint(state.drag, p.x, p.y); } });
    cv.addEventListener('pointermove', e => { if (state.drag) { const p = pointerPoint(e); setPoint(state.drag, p.x, p.y); } });
    ['pointerup','pointercancel','lostpointercapture'].forEach(type => cv.addEventListener(type, () => { state.drag = null; }));
    if (typeof onLangRefresh === 'function') onLangRefresh(render);
    render();
  }
  const api = { midpoint, delta, distance, slope, clampInt, get state() { return JSON.parse(JSON.stringify(state)); } };
  if (typeof window !== 'undefined') { window.COORD_DISTANCE = api; document.addEventListener('DOMContentLoaded', bind); }
}());
