'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const cyan = '#6ee7ff', orange = '#ffb454', pink = '#ff7a93', green = '#7ee2a8', muted = '#9aa7b8', ink = '#e8edf4', grayN = '#8b98a9';

/* ================= PURE-BEGIN ================= */
/* 计算层（唯一真值源）：元素身份、电子排布、稳定性判定、电荷与离子种类。
   口径全部写死自 BRIEF：元素范围 Z = 1…20；元素名/符号/最常见同位素中子数是查表数据源，
   不是判定逻辑——身份判定 = Z 本身；排布容量简化口径 2 / 8 / 8（再多进第四层）；
   稳定性为定性判定（最外层满 → 稳定；不满且 outer ≤ cap/2 → 易失；其余 → 易得）；
   电荷 = Z − e。本段无 DOM 依赖，Node 可直接 require 做断言（与 particles-states 同构）。 */

/* 数据表：[符号, 中文名, 英文名, 最常见同位素的中子数]，下标 = Z − 1 */
const ELEMENTS = [
  ['H', '氢', 'Hydrogen', 0], ['He', '氦', 'Helium', 2], ['Li', '锂', 'Lithium', 4], ['Be', '铍', 'Beryllium', 5],
  ['B', '硼', 'Boron', 6], ['C', '碳', 'Carbon', 6], ['N', '氮', 'Nitrogen', 7], ['O', '氧', 'Oxygen', 8],
  ['F', '氟', 'Fluorine', 10], ['Ne', '氖', 'Neon', 10], ['Na', '钠', 'Sodium', 12], ['Mg', '镁', 'Magnesium', 12],
  ['Al', '铝', 'Aluminium', 14], ['Si', '硅', 'Silicon', 14], ['P', '磷', 'Phosphorus', 16], ['S', '硫', 'Sulfur', 16],
  ['Cl', '氯', 'Chlorine', 18], ['Ar', '氩', 'Argon', 22], ['K', '钾', 'Potassium', 20], ['Ca', '钙', 'Calcium', 20]
];
const CAPS = [2, 8, 8]; // 前三层容量（简化口径）；超出部分进第四层

function clampZ(z) { return clamp(Math.round(Number(z) || 1), 1, 20); }
/* 元素身份判定：Z 本身即身份；返回查表的名字/符号。范围外返回 null，不假装能算。 */
function elementOf(z) {
  if (!Number.isInteger(z) || z < 1 || z > 20) return null;
  const r = ELEMENTS[z - 1];
  return { z, sym: r[0], zh: r[1], en: r[2] };
}
function defaultNeutrons(z) {
  if (!Number.isInteger(z) || z < 1 || z > 20) return null;
  return ELEMENTS[z - 1][3];
}
function massNumber(z, n) { return z + n; }
/* 电子分层排布：从最内层起逐层填满（2 / 8 / 8，再多进第四层），返回每层个数数组。
   e = 0 返回 []；本页口径 e ≤ 28（第 4 步离子探索上限）。 */
function shellConfig(e) {
  e = Math.max(0, Math.round(Number(e) || 0));
  const res = [];
  let rem = e;
  for (const cap of CAPS) {
    if (rem <= 0) break;
    const take = Math.min(cap, rem);
    res.push(take); rem -= take;
  }
  if (rem > 0) res.push(rem);
  return res;
}
/* 最外层信息与定性判定：满 → stable；不满且 outer ≤ cap/2 → lose（甩掉比凑满近）；其余 → gain。
   第一层容量 2、其余层容量 8（第四层在本页简化口径下同样按 8 判满）。e = 0 时无电子层。 */
function outerInfo(e) {
  const shells = shellConfig(e);
  if (!shells.length) return { outer: 0, cap: 0, gap: 0, verdict: 'stable' };
  const li = shells.length - 1;
  const outer = shells[li];
  const cap = li === 0 ? CAPS[0] : 8;
  const gap = cap - outer;
  const verdict = gap === 0 ? 'stable' : (outer <= cap / 2 ? 'lose' : 'gain');
  return { outer, cap, gap, verdict };
}
function chargeOf(z, e) { return z - e; }
/* 离子种类：e = 0 且 z > 0 是裸核（单列，不叫阳离子）；其余按电荷符号分。 */
function ionKind(z, e) {
  if (e === 0 && z > 0) return 'bare';
  const q = chargeOf(z, e);
  return q === 0 ? 'neutral' : (q > 0 ? 'cation' : 'anion');
}
/* 电荷显示：负号用 U+2212，与全站读数口径一致。 */
function fmtCharge(q) { return q === 0 ? '0' : (q > 0 ? '+' + q : '−' + (-q)); }
/* Fisher–Yates 洗牌：随机源可注入（自查用定种子验分布与置换性）。 */
function shuffle(arr, rand) {
  const a = arr.slice();
  const r = rand || Math.random;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
/* ================= PURE-END ================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ELEMENTS, CAPS, clampZ, elementOf, defaultNeutrons, massNumber, shellConfig, outerInfo, chargeOf, ionKind, fmtCharge, shuffle };
}

if (typeof document !== 'undefined') {

/* ---------- 画布脚手架（与 circle-angles 同构） ---------- */
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  if (cv.dataset.cssH === undefined) cv.dataset.cssH = cv.getAttribute('height') || '360';
  cv.style.height = cv.dataset.cssH + 'px';
  const w = cv.clientWidth, h = Number(cv.dataset.cssH);
  const bw = Math.max(2, Math.round(w * dpr)), bh = Math.max(2, Math.round(h * dpr));
  if (cv.width !== bw) cv.width = bw; if (cv.height !== bh) cv.height = bh;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cv._w = w; cv._h = h; return ctx;
}
function scene(id, w = 320, h = 340) {
  const cv = $(id), ctx = fitCanvas(cv); ctx.clearRect(0, 0, cv._w, cv._h);
  const scale = Math.min(cv._w / w, cv._h / h);
  const ox = (cv._w - w * scale) / 2, oy = (cv._h - h * scale) / 2;
  ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale); cv._view = { w, h, scale, ox, oy }; return ctx;
}
function text(ctx, str, x, y, color = muted, size = 13) {
  ctx.font = `${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function textL(ctx, str, x, y, color = muted, size = 13) {
  ctx.font = `${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function textR(ctx, str, x, y, color = muted, size = 15) {
  ctx.font = `700 ${size}px system-ui,sans-serif`; ctx.fillStyle = color; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function dot(ctx, p, color, r) { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill(); }
function ringC(ctx, cx, cy, r, color, width) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); }

/* ---------- 原子几何（画布坐标，单位与读数同源） ---------- */
/* 定死值：核半径 13（直径 26）；四层半径 48/76/104/132；碳的最外层圈直径 = 2×76 = 152，
   核占比 26/152 ≈ 17%——第 0 步读数的 {nd}/{ad}/{pct} 全部由此三数算出，不另写。 */
const NUC_R = 13, SHELL_R = [48, 76, 104, 132], ELE_R = 5;
function shellAngle(li, count, j) {
  const base = -Math.PI / 2 + li * 0.5;
  return count === 1 ? base : base + j * 2 * Math.PI / count;
}
function electronSeat(cx, cy, li, count, j, scale) {
  const a = shellAngle(li, count, j), r = SHELL_R[li] * scale;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
/* 核内点序：质子/中子交替（向日葵填充，位置只由序号决定，与画布口径一致） */
function nucSequence(z, n) {
  const seq = [];
  let p = z, q = n;
  while (p > 0 || q > 0) { if (p > 0) { seq.push('p'); p--; } if (q > 0) { seq.push('n'); q--; } }
  return seq;
}
function drawNucleus(ctx, cx, cy, z, scale, hl) {
  const n = defaultNeutrons(z), total = z + n;
  ctx.beginPath(); ctx.arc(cx, cy, NUC_R * scale, 0, 2 * Math.PI);
  ctx.fillStyle = '#1c2330'; ctx.fill();
  ctx.strokeStyle = hl ? orange : '#455568'; ctx.lineWidth = hl ? 2.5 : 1.5; ctx.stroke();
  const dotR = (total <= 12 ? 3.4 : Math.max(1.7, 3.4 * Math.sqrt(12 / total)));
  nucSequence(z, n).forEach((kind, k) => {
    const rr = Math.max(0, NUC_R - dotR - 0.6) * Math.sqrt((k + 0.5) / total) * scale;
    const a = k * 2.399963;
    dot(ctx, [cx + rr * Math.cos(a), cy + rr * Math.sin(a)], kind === 'p' ? pink : grayN, dotR * scale);
  });
}
/* 画一个原子：opts {z, e, scale, hlNuc, hlElec, hlOuter, seated, flyIdx, flyPos, shellLabels}
   电子总数恒 = min(seated, e) + 飞行中 1 个，与 shellConfig(e) 逐层计数同源。 */
function drawAtom(ctx, cx, cy, o) {
  const shells = shellConfig(o.e), scale = o.scale || 1;
  shells.forEach((count, li) => {
    const isOuter = li === shells.length - 1;
    ringC(ctx, cx, cy, SHELL_R[li] * scale, o.hlOuter && isOuter ? orange : '#2b3a4f', o.hlOuter && isOuter ? 3 : 1.5);
    if (o.shellLabels) text(ctx, t('lbShell', { n: li + 1 }), cx, cy - SHELL_R[li] * scale - 10, muted, 11);
  });
  let g = 0;
  shells.forEach((count, li) => {
    for (let j = 0; j < count; j++, g++) {
      if (o.flyIdx === g && o.flyPos) { dot(ctx, o.flyPos, o.hlElec ? green : cyan, ELE_R * scale); continue; }
      if (g >= (o.seated === undefined ? o.e : o.seated)) continue;
      dot(ctx, electronSeat(cx, cy, li, count, j, scale), o.hlElec ? green : cyan, ELE_R * scale);
    }
  });
  drawNucleus(ctx, cx, cy, o.z, scale, o.hlNuc);
}

/* ---------- 状态 ---------- */
const S = {
  s0: { zoom: 75, hl: null },
  s1: { z: 6 },
  s2: { z: 11, e: 11, animStart: 0, animating: false },
  s3: { z: 10 },
  s4: { z: 8, e: 10 },
  s5: { q: {} }
};
const QUIZ = {
  q1: { vals: ['F', 'Ne', 'Na', 'O'], ans: 'F' },
  q2: { vals: ['2,8,2', '2,2,8', '8,2,2', '2,8,1,1'], ans: '2,8,2' },
  q3: { vals: ['lose1', 'gain7', 'stable8', 'lose8'], ans: 'lose1' },
  q4: { vals: ['an2', 'cat2', 'neu0', 'an1'], ans: 'an2' }
};
function initQuiz() {
  for (const q of Object.keys(QUIZ)) S.s5.q[q] = { order: shuffle(QUIZ[q].vals), pick: null, locked: false };
}
const elName = z => elementOf(z)[getLang()];
const fmtCfg = arr => arr.length ? arr.join(getLang() === 'zh' ? '、' : ', ') : '—';
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };
function ionPlain(z, e) {
  const q = chargeOf(z, e), sym = elementOf(z).sym;
  if (q === 0) return sym;
  const s = (Math.abs(q) > 1 ? String(Math.abs(q)) : '') + (q > 0 ? '+' : '-');
  return sym + s.split('').map(c => SUP[c]).join('');
}
function ionHtml(z, e) {
  const q = chargeOf(z, e), sym = elementOf(z).sym;
  if (q === 0) return sym;
  return sym + '<sup>' + (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−') + '</sup>';
}

/* ---------- 第 0 步 ---------- */
function render0() {
  const ctx = scene('s0-canvas');
  const { zoom, hl } = S.s0;
  /* 左上角：一群粒子的缩略（小圆点阵列），挑出的碳画橙圈 */
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const x = 24 + c * 22, y = 24 + r * 22, picked = r === 1 && c === 2;
    ringC(ctx, x, y, 6.5, picked ? orange : '#2b3a4f', picked ? 2 : 1);
    dot(ctx, [x, y], picked ? orange : '#455568', 1.8);
  }
  textL(ctx, t('s0pick'), 14, 100, orange, 12);
  /* 主图：碳原子（Z=6, e=6），缩放只改显示倍率 */
  const scale = 0.5 + zoom / 100 * 0.6, cx = 178, cy = 208;
  drawAtom(ctx, cx, cy, { z: 6, e: 6, scale, hlNuc: hl === 'nuc', hlElec: hl === 'elec' });
  text(ctx, t('lbNucleus'), cx, cy + (NUC_R + 15) * scale + 4, hl === 'nuc' ? orange : muted, 12.5);
  const seat = electronSeat(cx, cy, 1, 4, 1, scale);
  text(ctx, t('lbElectron'), seat[0] + 26, seat[1] - 16, hl === 'elec' ? green : muted, 12.5);
  $('s0-ro').innerHTML = t('s0ro', { nd: 2 * NUC_R, ad: 2 * SHELL_R[1], pct: Math.round(2 * NUC_R / (2 * SHELL_R[1]) * 100) });
  $('s0-hlnuc').setAttribute('aria-pressed', String(hl === 'nuc'));
  $('s0-hlelec').setAttribute('aria-pressed', String(hl === 'elec'));
}

/* ---------- 第 1 步 ---------- */
function legend(ctx, z, e) {
  const n = defaultNeutrons(z);
  const rows = [[pink, t('lbProton'), z], [grayN, t('lbNeutron'), n], [cyan, t('lbElectron'), e]];
  rows.forEach((row, i) => {
    const y = 26 + i * 22;
    dot(ctx, [22, y], row[0], 5);
    textL(ctx, `${row[1]} × ${row[2]}`, 34, y, muted, 12.5);
  });
}
function render1() {
  const ctx = scene('s1-canvas'), z = S.s1.z, n = defaultNeutrons(z);
  drawAtom(ctx, 160, 178, { z, e: z, scale: 1 });
  legend(ctx, z, z);
  $('s1-zval').textContent = z;
  $('s1-minus').disabled = z <= 1;
  $('s1-plus').disabled = z >= 20;
  $('s1-ro').innerHTML = t('s1ro', { z, name: elName(z), sym: elementOf(z).sym, n, a: massNumber(z, n), e: z });
}

/* ---------- 第 2 步 ---------- */
const REDUCED = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function restartFill() {
  if (REDUCED || S.s2.e === 0) { S.s2.animating = false; render2(); return; }
  S.s2.animStart = performance.now();
  S.s2.animating = true;
  requestAnimationFrame(tick2);
}
function tick2() {
  if (!S.s2.animating) return;
  render2();
  if (S.s2.animating) requestAnimationFrame(tick2);
}
function render2() {
  const { z, e } = S.s2;
  let seated = e, flyIdx = -1, flyPos = null;
  if (S.s2.animating) {
    const el = (performance.now() - S.s2.animStart) / 130;
    seated = Math.min(e, Math.floor(el));
    if (seated >= e) { S.s2.animating = false; seated = e; }
    else {
      /* 正在落座的那一个：沿它座位的方向从核边飞出（只呈现「填」的顺序，不沿圈绕行） */
      const shells = shellConfig(e);
      let g = 0, target = null;
      outer: for (let li = 0; li < shells.length; li++) for (let j = 0; j < shells[li]; j++, g++) {
        if (g === seated) { target = { li, count: shells[li], j }; break outer; }
      }
      if (target) {
        const seat = electronSeat(160, 178, target.li, target.count, target.j, 1);
        const dx = seat[0] - 160, dy = seat[1] - 178, len = Math.hypot(dx, dy) || 1;
        const p = el - seated, ease = 1 - Math.pow(1 - p, 3);
        const dist = NUC_R * 0.6 + (len - NUC_R * 0.6) * ease;
        flyIdx = seated;
        flyPos = [160 + dx / len * dist, 178 + dy / len * dist];
      }
    }
  }
  const ctx = scene('s2-canvas');
  drawAtom(ctx, 160, 178, { z, e, scale: 1, seated, flyIdx, flyPos, shellLabels: true });
  legend(ctx, z, e);
  $('s2-zval').textContent = z;
  $('s2-eval').textContent = e;
  $('s2-zminus').disabled = z <= 1;
  $('s2-zplus').disabled = z >= 20;
  $('s2-eminus').disabled = e <= 0;
  $('s2-eplus').disabled = e >= 20;
  document.querySelectorAll('[data-preset2]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.preset2) === z)));
  $('s2-ro').innerHTML = t('s2ro', { sym: elementOf(z).sym, z, e, cfg: fmtCfg(shellConfig(e)) });
}

/* ---------- 第 3 步 ---------- */
function render3() {
  const ctx = scene('s3-canvas'), z = S.s3.z, e = z;
  drawAtom(ctx, 160, 178, { z, e, scale: 1, hlOuter: true });
  legend(ctx, z, e);
  const info = outerInfo(e);
  const verdict = t(info.verdict === 'stable' ? 'vStable' : info.verdict === 'lose' ? 'vLose' : 'vGain', { outer: info.outer, cap: info.cap, gap: info.gap });
  const full = info.gap === 0 ? t('fullYes') : t('fullNo', { gap: info.gap });
  document.querySelectorAll('[data-preset3]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.preset3) === z)));
  $('s3-ro').innerHTML = t('s3ro', { sym: elementOf(z).sym, name: elName(z), cfg: fmtCfg(shellConfig(e)), outer: info.outer, cap: info.cap, full, verdict });
}

/* ---------- 第 4 步 ---------- */
function render4() {
  const { z, e } = S.s4, q = chargeOf(z, e), kind = ionKind(z, e);
  const ctx = scene('s4-canvas');
  drawAtom(ctx, 160, 178, { z, e, scale: 1 });
  legend(ctx, z, e);
  textR(ctx, ionPlain(z, e), 306, 26, q === 0 ? muted : orange, 17);
  const slider = $('s4-e');
  slider.max = Math.min(z + 8, 28);
  if (Number(slider.value) !== e) slider.value = e;
  $('s4-zval').textContent = z;
  $('s4-zminus').disabled = z <= 1;
  $('s4-zplus').disabled = z >= 20;
  const kindKey = kind === 'neutral' ? 'kindNeutral' : kind === 'cation' ? 'kindCation' : kind === 'anion' ? 'kindAnion' : 'kindBare';
  const cfgArr = shellConfig(e);
  $('s4-ro').innerHTML = t('s4ro', { sym: elementOf(z).sym, z, e, cfg: fmtCfg(cfgArr), q: fmtCharge(q), kind: t(kindKey, { ion: ionHtml(z, e) }) });
  /* 探索区说明：仅当排布超出简化容量口径时出现（第四层在本页口径下同样以 8 为限，
     见 outerInfo），判定只取纯函数 shellConfig 的结果，不另立标准；正常范围内隐藏避免噪音。 */
  const beyond = cfgArr.length > 3 && cfgArr[3] > 8;
  const note4 = $('s4-explore');
  note4.hidden = !beyond;
  note4.textContent = beyond ? t('s4explore') : '';
}

/* ---------- 第 5 步 ---------- */
function optLabel(q, val) {
  if (q === 'q1') { const z = ELEMENTS.findIndex(r => r[0] === val) + 1; return `${val} ${elName(z)}`; }
  if (q === 'q2') return fmtCfg(val.split(',').map(Number));
  return t(q + 'o_' + val);
}
function render5() {
  let done = 0;
  for (const q of Object.keys(QUIZ)) {
    const st = S.s5.q[q], box = $(q + '-opts');
    box.innerHTML = '';
    for (const val of st.order) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn big' + (st.locked && val === QUIZ[q].ans ? ' locked' : '');
      b.textContent = optLabel(q, val);
      b.setAttribute('aria-pressed', String(st.pick === val));
      b.disabled = st.locked;
      b.onclick = () => {
        if (S.s5.q[q].locked) return;
        S.s5.q[q].pick = val;
        if (val === QUIZ[q].ans) S.s5.q[q].locked = true;
        render5();
      };
      box.appendChild(b);
    }
    const fb = $(q + '-fb'), an = $(q + '-an');
    if (!st.pick) { fb.textContent = ''; }
    else if (st.locked) { fb.textContent = t('correct'); }
    else { fb.textContent = t('dg_' + q + '_' + st.pick.replace(/,/g, '_')); }
    /* 解析门控：只有答对锁定后才把解析写进 DOM，答错/未答时该节点恒为空 */
    an.textContent = st.locked ? t(q + 'an') : '';
    if (st.locked) done++;
  }
  $('s5-score').textContent = t('scoreQ', { k: done });
  $('s5-hint').textContent = done === 4 ? t('s5hint') : '';
}

/* ---------- 通用 ---------- */
function badges() {
  for (const [el, arr, id] of [['categoryBadge', window.KNOWLEDGE_CATEGORIES, 'chemistry'], ['stageBadge', window.KNOWLEDGE_STAGES, 'junior']]) {
    const item = (arr || []).find(x => x.id === id);
    if (item) $(el).textContent = item.name[getLang()];
  }
}
function renderAll() { badges(); render0(); render1(); render2(); render3(); render4(); render5(); }
function bind() {
  $('s0-zoom').oninput = e => { S.s0.zoom = Number(e.target.value); render0(); };
  $('s0-hlnuc').onclick = () => { S.s0.hl = S.s0.hl === 'nuc' ? null : 'nuc'; render0(); };
  $('s0-hlelec').onclick = () => { S.s0.hl = S.s0.hl === 'elec' ? null : 'elec'; render0(); };
  $('s0-reset').onclick = () => { S.s0 = { zoom: 75, hl: null }; $('s0-zoom').value = 75; render0(); };

  $('s1-minus').onclick = () => { S.s1.z = clampZ(S.s1.z - 1); render1(); };
  $('s1-plus').onclick = () => { S.s1.z = clampZ(S.s1.z + 1); render1(); };
  $('s1-reset').onclick = () => { S.s1.z = 6; render1(); };

  document.querySelectorAll('[data-preset2]').forEach(b => b.onclick = () => {
    S.s2.z = Number(b.dataset.preset2); S.s2.e = S.s2.z; restartFill();
  });
  $('s2-zminus').onclick = () => { S.s2.z = clampZ(S.s2.z - 1); restartFill(); };
  $('s2-zplus').onclick = () => { S.s2.z = clampZ(S.s2.z + 1); restartFill(); };
  $('s2-eminus').onclick = () => { S.s2.e = clamp(S.s2.e - 1, 0, 20); restartFill(); };
  $('s2-eplus').onclick = () => { S.s2.e = clamp(S.s2.e + 1, 0, 20); restartFill(); };
  $('s2-fill').onclick = () => restartFill();
  $('s2-reset').onclick = () => { S.s2.z = 11; S.s2.e = 11; restartFill(); };

  document.querySelectorAll('[data-preset3]').forEach(b => b.onclick = () => { S.s3.z = Number(b.dataset.preset3); render3(); });
  $('s3-reset').onclick = () => { S.s3.z = 10; render3(); };

  document.querySelectorAll('[data-preset4]').forEach(b => b.onclick = () => {
    const [z, e] = b.dataset.preset4.split(',').map(Number);
    S.s4.z = z; S.s4.e = e; render4();
  });
  $('s4-zminus').onclick = () => { S.s4.z = clampZ(S.s4.z - 1); S.s4.e = Math.min(S.s4.e, Math.min(S.s4.z + 8, 28)); render4(); };
  $('s4-zplus').onclick = () => { S.s4.z = clampZ(S.s4.z + 1); render4(); };
  $('s4-e').oninput = e => { S.s4.e = Number(e.target.value); render4(); };
  $('s4-reset').onclick = () => { S.s4 = { z: 8, e: 10 }; render4(); };

  $('s5-reset').onclick = () => { initQuiz(); render5(); };

  const observer = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) document.querySelectorAll('.nav-step').forEach(a => {
      const active = a.dataset.nav === en.target.dataset.step;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.step').forEach(el => observer.observe(el));
  let queued = false;
  window.addEventListener('resize', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; renderAll(); }); } });
}
initQuiz();
onLangRefresh(renderAll);
bind();
applyLang(getLang());
// Read-only inspection surface for numerical review; UI remains the mutation path.
window.ATOM = {
  get state() { return JSON.parse(JSON.stringify(S)); },
  ELEMENTS, CAPS, clampZ, elementOf, defaultNeutrons, massNumber, shellConfig, outerInfo, chargeOf, ionKind, fmtCharge, shuffle,
  GEOM: { NUC_R, SHELL_R, ELE_R }
};
}
