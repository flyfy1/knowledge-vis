'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8';
const gridLine = '#2b3547', dimFill = '#131922';
const S = {
  s0: { rows: 4, cols: 6, count: 0, raf: 0, start: 0, done: false },
  s1: { a: 6, b: 4, rotT: 0, raf: 0, rotated: false },
  s2: { cut: 10 },
  s3: { m: 12, n: 13, lit: 0, raf: 0, start: 0 },
  s4: { w: 5, found: [], msg: null, quiz: { choice: null, solved: false, fb: null } }
};
function ro(id, text) { $(id).textContent = text; }
/* 数量词单复数：zh 恒用给定量词，en 按 n 是否为 1 选单/复数（供读数模板的 {rw}/{cw}/{tw}/{sq} 占位符） */
function pl(n, zh, one, many) { return getLang() === 'zh' ? zh : (n === 1 ? one : many); }
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) cv.dataset.cssH = cv.getAttribute('height') || '360';
  cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.cssH);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw; if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cv._w = w; cv._h = h; return ctx;
}
function ctxOf(id) { const cv = $(id), ctx = fitCanvas(cv); ctx.clearRect(0, 0, cv._w, cv._h); return [cv, ctx]; }
function text(ctx, str, x, y, color = muted, size = 13) { ctx.font = `${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); }
function cellRect(ctx, x, y, s, fill, stroke = gridLine) { if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, s, s); } ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, s - 1, s - 1); }

/* ---------------- 第 0 步：点阵计数 ---------------- */
function render0() {
  const s = S.s0, [cv, ctx] = ctxOf('s0-canvas');
  const W = cv._w, H = cv._h;
  const cell = Math.min((W - 56) / 12, (H - 56) / 12);
  const x0 = (W - 12 * cell) / 2, y0 = (H - 12 * cell) / 2;
  cv._view = { x0, y0, cell };
  ctx.strokeStyle = gridLine; ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, y0, s.cols * cell, s.rows * cell);
  for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
    const idx = r * s.cols + c, counted = idx < s.count;
    ctx.beginPath(); ctx.arc(x0 + c * cell + cell / 2, y0 + r * cell + cell / 2, cell * (counted ? 0.30 : 0.24), 0, 2 * Math.PI);
    ctx.fillStyle = counted ? orange : cyan; ctx.fill();
  }
  ctx.fillStyle = orange; ctx.fillRect(x0 + s.cols * cell - 5, y0 + s.rows * cell - 5, 10, 10);
  $('s0-rows-val').textContent = s.rows; $('s0-cols-val').textContent = s.cols;
  const n = s.rows * s.cols;
  if (s.done) ro('s0-readout', t('s0countDone', { r: s.rows, c: s.cols, n, tw: pl(n, '下', 'tap', 'taps') }));
  else if (s.count > 0) ro('s0-readout', t('s0counting', { k: s.count, n }));
  else ro('s0-readout', t('s0ro', { r: s.rows, c: s.cols, n, rw: pl(s.rows, '行', 'row', 'rows'), cw: pl(s.cols, '列', 'column', 'columns') }));
  $('s0-count').disabled = !!s.raf;
}
function stopCount() { if (S.s0.raf) cancelAnimationFrame(S.s0.raf); S.s0.raf = 0; }
function setRC(r, c) {
  const s = S.s0; stopCount();
  s.rows = clamp(r, 1, 12); s.cols = clamp(c, 1, 12); s.count = 0; s.done = false;
  $('s0-rows').value = s.rows; $('s0-cols').value = s.cols; render0();
}
function startCount() {
  const s = S.s0; if (s.raf) return;
  s.count = 0; s.done = false; s.start = performance.now();
  const total = s.rows * s.cols;
  function tick(ts) {
    s.count = Math.min(total, 1 + Math.floor((ts - s.start) / 100));
    if (s.count < total) { s.raf = requestAnimationFrame(tick); } else { s.raf = 0; s.done = true; }
    render0();
  }
  s.raf = requestAnimationFrame(tick); render0();
}

/* ---------------- 第 1 步：面积与交换律 ---------------- */
function render1() {
  const s = S.s1, [cv, ctx] = ctxOf('s1-canvas');
  const W = cv._w, H = cv._h;
  const cell = Math.min((W - 96) / 15, (H - 96) / 15);
  const gw = s.a * cell, gh = s.b * cell;
  ctx.save(); ctx.translate(W / 2, H / 2);
  if (s.rotT > 0) { const e = s.rotT * s.rotT * (3 - 2 * s.rotT); ctx.rotate(-Math.PI / 2 * e); }
  ctx.translate(-gw / 2, -gh / 2);
  for (let r = 0; r < s.b; r++) for (let c = 0; c < s.a; c++) cellRect(ctx, c * cell, r * cell, cell, 'rgba(110,231,255,.16)');
  ctx.strokeStyle = cyan; ctx.lineWidth = 2; ctx.strokeRect(0, 0, gw, gh);
  text(ctx, 'a = ' + s.a, gw / 2, gh + 20, cyan, 14);
  text(ctx, 'b = ' + s.b, -24, gh / 2, orange, 14);
  ctx.restore();
  const area = s.a * s.b;
  ro('s1-readout', s.rotated ? t('s1roRot', { a: s.a, b: s.b, s: area, sq: pl(area, '方格', 'square', 'squares') }) : t('s1ro', { a: s.a, b: s.b, s: area }));
  $('s1-a-val').textContent = s.a; $('s1-b-val').textContent = s.b;
  $('s1-rotate').disabled = !!s.raf;
}
function rotate1() {
  const s = S.s1; if (s.raf) return;
  s.start = performance.now();
  function tick(ts) {
    s.rotT = Math.min(1, (ts - s.start) / 650);
    if (s.rotT < 1) { s.raf = requestAnimationFrame(tick); }
    else { const tmp = s.a; s.a = s.b; s.b = tmp; s.rotT = 0; s.raf = 0; s.rotated = true; $('s1-a').value = s.a; $('s1-b').value = s.b; }
    render1();
  }
  s.raf = requestAnimationFrame(tick); render1();
}
function setS1() {
  const s = S.s1; if (s.raf) cancelAnimationFrame(s.raf);
  s.raf = 0; s.rotT = 0; s.rotated = false;
  s.a = Number($('s1-a').value); s.b = Number($('s1-b').value); render1();
}

/* ---------------- 第 2 步：切一刀（分配律） ---------------- */
function render2() {
  const s = S.s2, [cv, ctx] = ctxOf('s2-canvas');
  const W = cv._w, H = cv._h, COLS = 13, ROWS = 7;
  const cell = Math.min((W - 80) / COLS, (H - 88) / ROWS);
  const x0 = (W - COLS * cell) / 2, y0 = (H - ROWS * cell) / 2 + 8;
  cv._view = { x0, y0, cell };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
    cellRect(ctx, x0 + c * cell, y0 + r * cell, cell, c < s.cut ? 'rgba(110,231,255,.22)' : 'rgba(255,180,84,.22)');
  const cx = x0 + s.cut * cell;
  ctx.strokeStyle = orange; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, y0 - 10); ctx.lineTo(cx, y0 + ROWS * cell + 10); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, y0 - 18, 6, 0, 2 * Math.PI); ctx.fillStyle = orange; ctx.fill();
  text(ctx, '13', W / 2, y0 - 20, muted, 14);
  text(ctx, '7', x0 - 16, y0 + ROWS * cell / 2, muted, 14);
  text(ctx, String(s.cut), cx, y0 + ROWS * cell + 24, orange, 14);
  $('s2-cut-val').textContent = s.cut;
  const l = s.cut * 7, r = (13 - s.cut) * 7;
  ro('s2-left', t('s2leftRO', { w: s.cut, v: l, cw: pl(s.cut, '列', 'column', 'columns') }));
  ro('s2-right', t('s2rightRO', { w: 13 - s.cut, v: r, cw: pl(13 - s.cut, '列', 'column', 'columns') }));
  ro('s2-total', t('s2total', { l, r, sum: l + r }));
  ro('s2-note', s.cut === 10 ? t('s2best') : '');
}
function setCut(v) { S.s2.cut = clamp(Math.round(v), 1, 12); $('s2-cut').value = S.s2.cut; render2(); }

/* ---------------- 第 3 步：四块地 ---------------- */
function blocks(m, n) {
  return [
    { c0: 0, r0: 0, w: 10, h: 10, v: 100, color: cyan },
    { c0: 10, r0: 0, w: m - 10, h: 10, v: 10 * (m - 10), color: orange },
    { c0: 0, r0: 10, w: 10, h: n - 10, v: 10 * (n - 10), color: pink },
    { c0: 10, r0: 10, w: m - 10, h: n - 10, v: (m - 10) * (n - 10), color: green }
  ];
}
function render3() {
  const s = S.s3, [cv, ctx] = ctxOf('s3-canvas');
  const W = cv._w, H = cv._h, bs = blocks(s.m, s.n);
  const cell = Math.min((W - 84) / 19, (H - 104) / 19);
  const x0 = (W - s.m * cell) / 2, y0 = (H - s.n * cell) / 2 + 10;
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.m; c++) cellRect(ctx, x0 + c * cell, y0 + r * cell, cell, dimFill);
  bs.forEach((b, i) => {
    if (i >= s.lit) return;
    ctx.fillStyle = b.color + '4d'; ctx.fillRect(x0 + b.c0 * cell, y0 + b.r0 * cell, b.w * cell, b.h * cell);
    ctx.strokeStyle = b.color; ctx.lineWidth = 2; ctx.strokeRect(x0 + b.c0 * cell, y0 + b.r0 * cell, b.w * cell, b.h * cell);
    const fs = clamp(Math.min(b.w * cell, b.h * cell) * 0.30, 11, 22);
    text(ctx, String(b.v), x0 + (b.c0 + b.w / 2) * cell, y0 + (b.r0 + b.h / 2) * cell, '#e8edf4', fs);
  });
  ctx.strokeStyle = muted; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, s.m * cell, s.n * cell);
  text(ctx, '10', x0 + 5 * cell, y0 - 14, muted, 13);
  text(ctx, String(s.m - 10), x0 + (10 + (s.m - 10) / 2) * cell, y0 - 14, muted, 13);
  text(ctx, '10', x0 - 14, y0 + 5 * cell, muted, 13);
  text(ctx, String(s.n - 10), x0 - 14, y0 + (10 + (s.n - 10) / 2) * cell, muted, 13);
  $('s3-m-val').textContent = s.m; $('s3-n-val').textContent = s.n;
  const sumLit = bs.slice(0, s.lit).reduce((acc, b) => acc + b.v, 0);
  if (s.lit === 0) { ro('s3-readout', t('s3roIdle', { m: s.m, n: s.n, a2: s.m - 10, b2: s.n - 10 })); ro('s3-vert', ''); }
  else if (s.lit < 4) { ro('s3-readout', t('s3roLit', { k: s.lit, sum: sumLit })); ro('s3-vert', ''); }
  else {
    ro('s3-readout', t('s3roDone', { p1: bs[0].v, p2: bs[1].v, p3: bs[2].v, p4: bs[3].v, sum: s.m * s.n, m: s.m, n: s.n }));
    ro('s3-vert', t('s3vert', { n: s.n, b2: s.n - 10, m: s.m, g1: bs[2].v + bs[3].v, pb1: bs[2].v, pb2: bs[3].v, g2: bs[0].v + bs[1].v, pt1: bs[0].v, pt2: bs[1].v, sum: s.m * s.n }));
  }
  $('s3-light').disabled = !!s.raf;
}
function light3() {
  const s = S.s3; if (s.raf) return;
  if (s.lit === 4) s.lit = 0;
  s.start = performance.now(); const from = s.lit;
  function tick(ts) {
    const nl = Math.min(4, from + 1 + Math.floor((ts - s.start) / 550));
    if (nl !== s.lit) { s.lit = nl; }
    if (s.lit < 4) { s.raf = requestAnimationFrame(tick); } else { s.raf = 0; }
    render3();
  }
  s.raf = requestAnimationFrame(tick); render3();
}
function setS3() {
  const s = S.s3; if (s.raf) cancelAnimationFrame(s.raf);
  s.raf = 0; s.lit = 0; s.m = Number($('s3-m').value); s.n = Number($('s3-n').value); render3();
}

/* ---------------- 第 4 步：面积找边长 + 自测 ---------------- */
const PAIRS = [[1, 24], [2, 12], [3, 8], [4, 6]];
const pairKey = (w, h) => Math.min(w, h) + 'x' + Math.max(w, h);
function render4() {
  const s = S.s4, [cv, ctx] = ctxOf('s4-canvas');
  const W = cv._w, H = cv._h, w = s.w, AREA = 24;
  const full = Math.floor(AREA / w), rem = AREA % w, rowsDraw = rem ? full + 1 : full;
  const cell = Math.min((W - 96) / 12, (H - 84) / 24);
  const gw = w * cell, gh = rowsDraw * cell, x0 = (W - gw) / 2, y0 = (H - gh) / 2;
  for (let i = 0; i < AREA; i++) {
    const r = Math.floor(i / w), c = i % w;
    cellRect(ctx, x0 + c * cell, y0 + r * cell, cell, 'rgba(110,231,255,.20)');
  }
  if (rem) {
    ctx.strokeStyle = pink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    for (let c = rem; c < w; c++) ctx.strokeRect(x0 + c * cell + .5, y0 + full * cell + .5, cell - 1, cell - 1);
    ctx.setLineDash([]);
  } else {
    ctx.strokeStyle = green; ctx.lineWidth = 2.5; ctx.strokeRect(x0, y0, gw, gh);
    text(ctx, 'h = ' + (AREA / w), x0 - 26, y0 + gh / 2, orange, 13);
  }
  text(ctx, 'w = ' + w, W / 2, y0 + gh + 20, cyan, 13);
  $('s4-w-val').textContent = w;
  if (s.msg) {
    if (s.msg.kind === 'found') ro('s4-readout', t('s4roFound', s.msg));
    else if (s.msg.kind === 'again') ro('s4-readout', t('s4roAgain', s.msg));
    else ro('s4-readout', t('s4roMiss', s.msg));
  }
  ro('s4-prog', t('s4prog', { k: s.found.length }));
  $('s4-chips').replaceChildren(...PAIRS.map(p => {
    const el = document.createElement('span');
    const isFound = s.found.includes(p[0] + 'x' + p[1]);
    el.className = 'chip' + (isFound ? ' found' : '');
    /* 未找到的对先遮住数字，保留探索；找到后才点亮显示 */
    el.textContent = isFound ? p[0] + ' × ' + p[1] + ' ✓' : '? × ?';
    return el;
  }));
  ro('s4-done', s.found.length === 4 ? t('s4done') : '');
}
function setW(w) {
  const s = S.s4; s.w = clamp(Math.round(w), 1, 12);
  $('s4-w').value = s.w;
  const AREA = 24, full = Math.floor(AREA / s.w), rem = AREA % s.w;
  if (rem === 0) {
    const h = AREA / s.w, key = pairKey(s.w, h), pair = key.replace('x', ' × ');
    if (s.found.includes(key)) s.msg = { kind: 'again', w: s.w, h, pair };
    else { s.found.push(key); s.msg = { kind: 'found', w: s.w, h, pair }; }
  } else {
    s.msg = { kind: 'miss', w: s.w, full, used: full * s.w, rem, gap: s.w - rem };
  }
  render4();
}
function renderQuiz() {
  const [cv, ctx] = ctxOf('s4q-canvas');
  const W = cv._w, H = cv._h, COLS = 14, ROWS = 6, CUT = 10;
  const cell = Math.min((W - 80) / COLS, (H - 72) / ROWS);
  const x0 = (W - COLS * cell) / 2, y0 = (H - ROWS * cell) / 2 + 6;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
    cellRect(ctx, x0 + c * cell, y0 + r * cell, cell, c < CUT ? 'rgba(110,231,255,.22)' : 'rgba(255,180,84,.22)');
  ctx.strokeStyle = orange; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x0 + CUT * cell, y0 - 6); ctx.lineTo(x0 + CUT * cell, y0 + ROWS * cell + 6); ctx.stroke();
  text(ctx, '14', W / 2, y0 - 16, muted, 13);
  text(ctx, '10', x0 + CUT * cell / 2, y0 + ROWS * cell + 18, cyan, 13);
  text(ctx, '4', x0 + (CUT + (COLS - CUT) / 2) * cell, y0 + ROWS * cell + 18, orange, 13);
  text(ctx, '6', x0 - 14, y0 + ROWS * cell / 2, muted, 13);
}
/* 自测反馈与 s4.msg 同机制：状态里只存 kind，渲染时按当前语言出文案，切语言不滞留 */
function renderFeedback() {
  const fb = S.s4.quiz.fb;
  ro('s4-feedback', fb === 'idle' ? t('s4qIdle') : fb === 'wrong' ? t('s4qWrong') : fb === 'right' ? t('s4qRight') : '');
}
function renderQuizState() {
  const q = S.s4.quiz;
  document.querySelectorAll('[data-quiz]').forEach(b => {
    b.disabled = q.solved;
    b.setAttribute('aria-pressed', String(q.choice === Number(b.dataset.quiz)));
  });
  $('s4-reveal').disabled = q.solved || q.choice === null;
  renderFeedback();
}

/* ---------------- 通用 ---------------- */
function badges() {
  for (const [el, arr, id] of [['categoryBadge', window.KNOWLEDGE_CATEGORIES, 'math'], ['stageBadge', window.KNOWLEDGE_STAGES, 'primary']]) {
    const item = (arr || []).find(x => x.id === id);
    if (item) $(el).textContent = item.name[getLang()];
  }
}
function renderAll() { badges(); render0(); render1(); render2(); render3(); render4(); renderQuiz(); }
function drag(id, fn) {
  const cv = $(id); cv.classList.add('dragc'); let pointer = null;
  function move(e) {
    if (e.pointerId !== pointer || !cv._view) return;
    const r = cv.getBoundingClientRect(), v = cv._view;
    fn(e.clientX - r.left, e.clientY - r.top, v);
  }
  cv.addEventListener('pointerdown', e => { pointer = e.pointerId; cv.setPointerCapture(pointer); move(e); });
  cv.addEventListener('pointermove', move);
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(type, () => pointer = null);
}
function bind() {
  $('s0-rows').oninput = e => setRC(Number(e.target.value), S.s0.cols);
  $('s0-cols').oninput = e => setRC(S.s0.rows, Number(e.target.value));
  $('s0-count').onclick = startCount;
  $('s0-reset').onclick = () => setRC(4, 6);
  drag('s0-canvas', (px, py, v) => {
    const c = clamp(Math.round((px - v.x0) / v.cell), 1, 12);
    const r = clamp(Math.round((py - v.y0) / v.cell), 1, 12);
    if (r !== S.s0.rows || c !== S.s0.cols) setRC(r, c);
  });
  $('s1-a').oninput = setS1; $('s1-b').oninput = setS1;
  $('s1-rotate').onclick = rotate1;
  $('s1-reset').onclick = () => { $('s1-a').value = 6; $('s1-b').value = 4; setS1(); };
  $('s2-cut').oninput = e => setCut(Number(e.target.value));
  $('s2-reset').onclick = () => setCut(10);
  drag('s2-canvas', (px, py, v) => setCut((px - v.x0) / v.cell));
  $('s3-m').oninput = setS3; $('s3-n').oninput = setS3;
  $('s3-light').onclick = light3;
  $('s3-reset').onclick = () => { $('s3-m').value = 12; $('s3-n').value = 13; setS3(); };
  $('s4-w').oninput = e => setW(Number(e.target.value));
  document.querySelectorAll('[data-quiz]').forEach(b => b.onclick = () => {
    const q = S.s4.quiz; if (q.solved) return;
    q.choice = Number(b.dataset.quiz); q.fb = null; renderQuizState();
  });
  $('s4-reveal').onclick = () => {
    const q = S.s4.quiz;
    if (q.choice === null) { q.fb = 'idle'; renderQuizState(); return; }
    if (q.choice === 84) { q.solved = true; q.fb = 'right'; }
    else q.fb = 'wrong';
    renderQuizState();
  };
  $('s4-reset').onclick = () => {
    S.s4.found = []; S.s4.quiz = { choice: null, solved: false, fb: null };
    renderQuizState(); setW(5);
  };
  const observer = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('.nav-step').forEach(a => {
      const active = a.dataset.nav === e.target.dataset.step;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(el => observer.observe(el));
  let queued = false;
  window.addEventListener('resize', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; renderAll(); }); } });
}
onLangRefresh(() => { renderAll(); renderQuizState(); });
bind();
setW(5);
renderQuizState();
applyLang(getLang());
// 只读检查面：供独立评审复算用，UI 仍是唯一的状态变更路径。
window.AREA_MODEL = {
  get state() { return JSON.parse(JSON.stringify(S)); },
  blocks: (m, n) => blocks(m, n).map(b => b.v),
  split2: cut => [cut * 7, (13 - cut) * 7]
};
