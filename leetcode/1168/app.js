'use strict';
const locale = LeetCodeLocale(window.COPY), t = locale.t, $ = id => document.getElementById(id);
const W = WaterCore, NS = 'http://www.w3.org/2000/svg';
const GROUP_COLORS = ['#6ee7ff', '#ffb454', '#7ee2a8', '#c3a6ff', '#ff7a93'];

function el(name, attrs, text) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}
// Geometry for edge a–b; duplicates of the same pair bend apart so both stay visible.
function geom(x, a, b, bend) {
  const [x1, y1] = x.pos[a], [x2, y2] = x.pos[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  const cx = mx + nx * bend, cy = my + ny * bend;
  return {d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, lx: (mx + cx) / 2, ly: (my + cy) / 2};
}
function bends(x) { // per pipe index: offset for parallel pipes
  const seen = {}; return x.pipes.map(([a, b]) => { const k = Math.min(a, b) + '-' + Math.max(a, b); const i = seen[k] = (seen[k] ?? -1) + 1; return i === 0 ? 0 : (i % 2 ? 1 : -1) * 36 * Math.ceil(i / 2); });
}
// opts: source (draw W), wellState(i) / pipeState(j) -> CSS class or null (null hides), nodeClass(h), nodeFill(h), wellMark(i)
function draw(svg, x, o) {
  const back = [], front = [], b = bends(x);
  const addEdge = (a, bb, bend, cls, cost) => {
    const g = geom(x, a, bb, bend);
    back.push(el('path', {d: g.d, class: 'edge ' + cls}));
    const label = String(cost), w = 12 * label.length + 12;
    front.push(el('rect', {x: g.lx - w / 2, y: g.ly - 13, width: w, height: 24, rx: 6, class: 'cost-pill ' + cls}));
    front.push(el('text', {x: g.lx, y: g.ly + 5, class: 'cost'}, label));
  };
  if (o.source) x.wells.forEach((c, i) => { const cls = o.wellState(i); if (cls !== null) addEdge(0, i + 1, 0, 'well ' + cls, c); });
  x.pipes.forEach(([a, bb, c], j) => { const cls = o.pipeState(j); if (cls !== null) addEdge(a, bb, b[j], 'pipe ' + cls, c); });
  const nodes = [];
  if (o.source) {
    const [sx, sy] = x.pos[0];
    nodes.push(el('rect', {x: sx - 22, y: sy - 18, width: 44, height: 36, rx: 10, class: 'source', style: o.nodeFill ? `stroke:${o.nodeFill(0)}` : ''}));
    nodes.push(el('text', {x: sx, y: sy + 7, class: 'node-id'}, 'W'));
  }
  for (let h = 1; h <= x.n; h++) {
    const [hx, hy] = x.pos[h];
    nodes.push(el('circle', {cx: hx, cy: hy, r: 20, class: 'house-base'}));
    nodes.push(el('circle', {cx: hx, cy: hy, r: 20, class: 'house ' + (o.nodeClass ? o.nodeClass(h) : ''), style: o.nodeFill ? `stroke:${o.nodeFill(h)};fill:${o.nodeFill(h)}33` : ''}));
    nodes.push(el('text', {x: hx, y: hy + 7, class: 'node-id'}, String(h)));
    if (o.wellMark && o.wellMark(h - 1)) nodes.push(el('text', {x: hx, y: hy + 40, class: 'well-mark'}, t('wellMark')));
  }
  svg.setAttribute('viewBox', o.source ? '0 0 400 240' : '0 90 400 160');
  svg.replaceChildren(...back, ...front, ...nodes);
}
const houseList = arr => arr.length ? arr.join(', ') : t('none');

// ---------- step 1: build a plan ----------
const M = W.MAIN;
let wellOn = M.wells.map(() => false), pipeOn = M.pipes.map(() => false), bestFound = null;
function renderPlan() {
  const r = W.evaluatePlan(M, wellOn, pipeOn);
  if (r.complete && (bestFound === null || r.cost < bestFound)) bestFound = r.cost;
  draw($('planGraph'), M, {source: false, wellState: () => null, pipeState: j => pipeOn[j] ? 'laid' : 'idle', nodeClass: h => r.water[h - 1] ? 'wet' : 'dry', wellMark: i => wellOn[i]});
  const btns = [];
  M.wells.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = t('wellBtn', {h: i + 1, c}); b.setAttribute('aria-pressed', String(wellOn[i])); b.onclick = () => { wellOn[i] = !wellOn[i]; render(); b.focus(); }; btns.push(b); });
  M.pipes.forEach(([a, bb, c], j) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = t('pipeBtn', {a, b: bb, c}); b.setAttribute('aria-pressed', String(pipeOn[j])); b.onclick = () => { pipeOn[j] = !pipeOn[j]; render(); b.focus(); }; btns.push(b); });
  const focusedIndex = [...$('planButtons').children].indexOf(document.activeElement);
  $('planButtons').replaceChildren(...btns);
  if (focusedIndex >= 0) btns[focusedIndex].focus();
  const wet = [], dry = []; r.water.forEach((w, i) => (w ? wet : dry).push(i + 1));
  $('planText').textContent = t('planRead', {cost: r.cost, wet: houseList(wet), dry: houseList(dry)}) + (r.complete ? ' ' + t('planComplete') : '');
  $('bestText').textContent = bestFound === null ? t('bestNone') : t('bestSoFar', {best: bestFound});
  return r;
}
$('clearPlan').onclick = () => { wellOn = wellOn.map(() => false); pipeOn = pipeOn.map(() => false); render(); };

// ---------- step 2: greedy failure and the redraw ----------
const greedy = W.perHouseGreedy(M);
let redrawn = false;
function renderStep2(plan) {
  draw($('greedyGraph'), M, {source: false, wellState: () => null, pipeState: j => greedy.pipeOn[j] ? 'laid' : 'idle', nodeClass: h => greedy.water[h - 1] ? 'wet' : 'dry', wellMark: i => greedy.wellOn[i]});
  draw($('redrawGraph'), M, {source: redrawn, wellState: i => wellOn[i] ? 'laid' : 'idle', pipeState: j => pipeOn[j] ? 'laid' : 'idle', nodeClass: h => plan.water[h - 1] ? 'wet' : 'dry', wellMark: i => !redrawn && wellOn[i]});
  $('redraw').setAttribute('aria-pressed', String(redrawn));
  const wet = []; plan.water.forEach((w, i) => { if (w) wet.push(i + 1); });
  $('redrawText').textContent = redrawn ? t('redrawOn', {wet: houseList(wet)}) : t('redrawOff');
}
$('redraw').onclick = () => { redrawn = !redrawn; render(); };

// ---------- step 3: Kruskal trace ----------
let preset = 0, village = null, run = null, at = 0, brute = null;
function loadPreset(p) { const b = W.presets[p]; village = {n: b.n, pos: b.pos, wells: b.wells.slice(), pipes: b.pipes.map(q => q.slice())}; rebuild(); }
function rebuild() { run = W.trace(village); brute = W.bruteBest(village); at = 0; }
const edgeName = e => e.kind === 'well' ? t('wellName', {v: e.v}) : t('pipeName', {u: e.u, v: e.v});
function renderTrace() {
  const f = run.frames[at], e = f.event, last = run.frames.length - 1;
  const stateOf = (kind, ref) => {
    const idx = run.edges.findIndex(x => x.kind === kind && x.ref === ref);
    const focus = e.type !== 'start' && run.edges[at - 1] === run.edges[idx] ? ' focus' : '';
    if (idx >= f.decisions.length) return 'idle' + focus;
    return (f.decisions[idx] ? 'laid' : 'skipped') + focus;
  };
  draw($('traceGraph'), village, {source: true, wellState: i => stateOf('well', i), pipeState: j => stateOf('pipe', j), nodeFill: h => GROUP_COLORS[f.group[h] % GROUP_COLORS.length]});
  $('edgeList').replaceChildren(...run.edges.map((x, i) => {
    const li = document.createElement('li');
    const verdict = i < f.decisions.length ? t(f.decisions[i] ? 'verdictTake' : 'verdictSkip') : t('verdictPending');
    li.textContent = `${edgeName(x)} · ${x.w} · ${verdict}`;
    li.className = i < f.decisions.length ? (f.decisions[i] ? 'take' : 'skip') : 'pending';
    if (i === at - 1) li.classList.add('current');
    return li;
  }));
  const groups = new Set(f.group).size;
  $('progress').textContent = t('progress', {i: at, m: last, k: f.kept, cost: f.cost, g: groups});
  $('event').textContent = e.type === 'start' ? t('evStart') : t(e.type === 'take' ? 'evTake' : 'evSkip', {name: edgeName(e), w: e.w});
  $('check').textContent = at === last ? t(f.cost === brute.best ? 'doneCheck' : 'doneMismatch', {cost: f.cost, best: brute.best, plans: brute.plans}) : '';
  for (const [id, off] of [['prev', at === 0], ['reset', at === 0], ['next', at === last], ['end', at === last]]) $(id).disabled = off;
}
function renderEditors() {
  const items = [];
  const mk = (label, value, onSet) => {
    const wrap = document.createElement('label'); wrap.className = 'editor';
    const span = document.createElement('span'); span.textContent = label;
    const input = document.createElement('input'); input.type = 'number'; input.min = 0; input.max = 20; input.step = 1; input.value = value; input.inputMode = 'numeric';
    input.onchange = () => { const v = Math.max(0, Math.min(20, Math.round(+input.value || 0))); input.value = v; onSet(v); rebuild(); render(); };
    wrap.append(span, input); return wrap;
  };
  village.wells.forEach((c, i) => items.push(mk(t('editWell', {h: i + 1}), c, v => { village.wells[i] = v; })));
  village.pipes.forEach((p, j) => items.push(mk(t('editPipe', {a: p[0], b: p[1]}), p[2], v => { village.pipes[j][2] = v; })));
  $('editors').replaceChildren(...items);
}
$('preset').onchange = () => { preset = +$('preset').value; loadPreset(preset); renderEditors(); render(); };
$('prev').onclick = () => { at = Math.max(0, at - 1); render(); };
$('next').onclick = () => { at = Math.min(run.frames.length - 1, at + 1); render(); };
$('reset').onclick = () => { at = 0; render(); };
$('end').onclick = () => { at = run.frames.length - 1; render(); };

// ---------- step 4: prediction ----------
const P = W.PREDICT, pRun = W.trace(P);
let choice = null, revealed = false;
function renderPredict() {
  const final = pRun.frames.at(-1);
  const st = (kind, ref) => { if (!revealed) return 'idle'; const i = pRun.edges.findIndex(x => x.kind === kind && x.ref === ref); return final.decisions[i] ? 'laid' : 'skipped'; };
  draw($('predictGraph'), P, {source: true, wellState: i => st('well', i), pipeState: j => st('pipe', j)});
  $('reveal').disabled = choice === null;
  $('feedback').textContent = revealed ? (choice === 1 ? t('correct') : t('wrong' + choice)) + ' ' + t('answer') : t('choosePrompt');
  $('feedback').classList.toggle('correct', revealed && choice === 1);
}
document.querySelectorAll('[name=prediction]').forEach(r => r.onchange = () => { choice = +r.value; revealed = false; render(); });
$('reveal').onclick = () => { if (choice !== null) { revealed = true; render(); } };

// ---------- step 5 ----------
let copyState = '';
$('code').textContent = window.PYTHON_SOURCE; $('fallbackSource').value = window.PYTHON_SOURCE;
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(window.PYTHON_SOURCE); copyState = 'copied'; $('manualCopy').hidden = true; }
  catch (_) { copyState = 'manual'; $('manualCopy').hidden = false; $('fallbackSource').focus(); $('fallbackSource').select(); }
  render();
};

function render() {
  const plan = renderPlan(); renderStep2(plan); renderTrace(); renderPredict();
  $('copyStatus').textContent = copyState ? t(copyState) : '';
  $('langToggle').setAttribute('aria-label', t('language'));
}
loadPreset(0);
locale.onChange(() => { renderEditors(); render(); }); locale.init();

const sections = [...document.querySelectorAll('.step')];
function updateNav() { const threshold = document.querySelector('.step-nav').getBoundingClientRect().bottom + 24; let active = sections[0]; for (const s of sections) if (s.getBoundingClientRect().top <= threshold) active = s; document.querySelectorAll('.step-nav a').forEach(a => a.classList.toggle('active', a.hash === '#' + active.id)); }
let navScheduled = false; function scheduleNav() { if (navScheduled) return; navScheduled = true; requestAnimationFrame(() => { navScheduled = false; updateNav(); }); }
window.addEventListener('scroll', scheduleNav, {passive: true}); window.addEventListener('resize', scheduleNav); updateNav();
