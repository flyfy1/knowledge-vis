'use strict';
const locale = LeetCodeLocale(window.COPY), t = locale.t, $ = id => document.getElementById(id);
const C = BridgeCore, NS = 'http://www.w3.org/2000/svg';
const edgeName = ([a, b]) => `${a}–${b}`;
const listName = list => list.length ? list.map(edgeName).join(', ') : t('none');

// ---------- shared SVG drawing ----------
function el(name, attrs, text) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}
// g: {n,pos,edges}; edgeClass(id) and nodeClass(u) return CSS classes; sub(u) returns the small label under a node.
function draw(svg, g, {edgeClass = () => '', nodeClass = () => '', sub = null, extra = []} = {}) {
  const parts = [];
  extra.forEach(([a, b]) => { const [x1, y1] = g.pos[a], [x2, y2] = g.pos[b]; parts.push(el('line', {x1, y1, x2, y2, class: 'edge absent'})); });
  g.edges.forEach(([a, b], id) => { const [x1, y1] = g.pos[a], [x2, y2] = g.pos[b]; parts.push(el('line', {x1, y1, x2, y2, class: 'edge ' + edgeClass(id)})); });
  g.pos.forEach(([x, y], u) => {
    parts.push(el('circle', {cx: x, cy: y, r: 19, class: 'node ' + nodeClass(u)}));
    parts.push(el('text', {x, y: y + 7, class: 'node-id'}, String(u)));
    if (sub) { const label = sub(u), w = 12 * label.length + 10; parts.push(el('rect', {x: x - w / 2, y: y + 22, width: w, height: 24, rx: 6, class: 'sub-pill'})); parts.push(el('text', {x, y: y + 40, class: 'node-sub'}, label)); }
  });
  svg.replaceChildren(...parts);
}

// ---------- step 1: cut experiment ----------
const cuts = C.cutTest(C.MAIN.n, C.MAIN.edges);
let cutId = -1; const tried = new Map(); // id -> order tried
function cutButtons() {
  $('cutButtons').replaceChildren(...C.MAIN.edges.map((e, id) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.edge = id;
    b.textContent = t('cutLabel', {e: edgeName(e)}); b.setAttribute('aria-pressed', String(id === cutId));
    b.onclick = () => { cutId = id; if (!tried.has(id)) tried.set(id, tried.size); render(); };
    return b;
  }));
}
function renderCut() {
  const g = C.MAIN, r = cutId >= 0 ? cuts[cutId] : null;
  draw($('cutGraph'), g, {
    edgeClass: id => id === cutId ? 'cut' : 'tree',
    nodeClass: u => r && r.comp[u] !== r.comp[0] ? 'lost' : ''
  });
  if (!r) $('cutText').textContent = t('cutNone');
  else if (r.critical) $('cutText').textContent = t('cutCritical', {e: edgeName(r.edge), side: '{' + g.pos.map((_, u) => u).filter(u => r.comp[u] !== r.comp[0]).join(', ') + '}'});
  else $('cutText').textContent = t('cutSafe', {e: edgeName(r.edge), route: C.detour(g.n, g.edges, cutId).join('–')});
  const order = [...tried.keys()];
  $('cutWork').textContent = t('cutWork', {k: order.length, m: g.edges.length, visits: order.reduce((s, id) => s + cuts[id].visits, 0)});
  $('cutLedger').replaceChildren(...order.map(id => {
    const tr = document.createElement('tr'); if (id === cutId) tr.className = 'changed';
    const d = C.detour(g.n, g.edges, id);
    [edgeName(g.edges[id]), t(cuts[id].critical ? 'verdictCritical' : 'verdictSafe'), d ? d.join('–') : t('noDetour')].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); });
    return tr;
  }));
  document.querySelectorAll('#cutButtons button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.edge === cutId)));
}
$('restore').onclick = () => { cutId = -1; render(); };

// ---------- step 2: which loop does each back edge close? ----------
const mainFinal = C.trace(C.MAIN.n, C.MAIN.edges).at(-1);
const parentOf = (() => { // parent in the DFS tree of the main network
  const p = Array(C.MAIN.n).fill(-1);
  C.trace(C.MAIN.n, C.MAIN.edges).forEach(f => { if (f.event.type === 'tree') p[f.event.v] = f.event.u; });
  return p;
})();
const backIds = mainFinal.kind.map((k, id) => k === 'back' ? id : -1).filter(id => id >= 0);
let coverId = -1;
function coverInfo(id) {
  const [a, b] = C.MAIN.edges[id];
  const lowEnd = mainFinal.tin[a] > mainFinal.tin[b] ? a : b, high = lowEnd === a ? b : a;
  const path = [lowEnd]; while (path.at(-1) !== high) path.push(parentOf[path.at(-1)]);
  path.reverse();
  const covered = path.slice(1).map((v, i) => [path[i], v]);
  return {lowEnd, high, path, covered};
}
function renderCover() {
  const info = coverId >= 0 ? coverInfo(coverId) : null;
  const coveredIds = new Set();
  if (info) info.covered.forEach(([x, y]) => C.MAIN.edges.forEach(([a, b], id) => { if ((a === x && b === y) || (a === y && b === x)) coveredIds.add(id); }));
  draw($('coverGraph'), C.MAIN, {
    edgeClass: id => (mainFinal.kind[id] === 'back' ? 'back' : 'tree') + (id === coverId ? ' focus' : '') + (coveredIds.has(id) ? ' covered' : ''),
    nodeClass: u => info && info.path.includes(u) ? 'hot' : ''
  });
  $('coverButtons').replaceChildren(...backIds.map(id => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn';
    b.textContent = t('coverLabel', {e: edgeName(C.MAIN.edges[id])}); b.setAttribute('aria-pressed', String(id === coverId));
    b.onclick = () => { coverId = id; render(); };
    return b;
  }));
  $('coverText').textContent = info ? t('coverText', {e: edgeName(C.MAIN.edges[coverId]), low: info.lowEnd, high: info.high, path: info.path.join('–'), covered: info.covered.map(edgeName).join(', ')}) : t('coverNone');
}

// ---------- step 3: DFS trace with tin / low ----------
let preset = 0, graph = null, frames = [], index = 0, cutCache = [];
function loadPreset(p) {
  const base = C.presets[p];
  graph = {n: base.n, pos: base.pos, pool: base.edges.concat(base.extra), on: base.edges.map(() => true).concat(base.extra.map(() => false))};
  rebuild();
}
function currentEdges() { return graph.pool.filter((_, i) => graph.on[i]); }
function rebuild() {
  const edges = currentEdges();
  frames = C.trace(graph.n, edges); cutCache = C.cutTest(graph.n, edges); index = 0;
}
function eventText(f, edges) {
  const e = f.event;
  switch (e.type) {
    case 'start': return t('evStart');
    case 'root': return t('evRoot', e);
    case 'tree': return t('evTree', e);
    case 'skipParent': return t('evSkip', e);
    case 'back': return t(e.before === e.after ? 'evBackSame' : 'evBack', e);
    case 'return': return t(e.critical ? 'evBridge' : 'evSafe', e);
    default: return t('evDone', {b: listName(f.bridges)});
  }
}
function renderTrace() {
  const edges = currentEdges(), f = frames[index], e = f.event, g = {n: graph.n, pos: graph.pos, edges};
  const bridgeIds = new Set(f.bridges.map(([a, b]) => edges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a))));
  draw($('traceGraph'), g, {
    edgeClass: id => (bridgeIds.has(id) ? 'bridge ' : '') + (f.kind[id] === 'tree' ? 'tree' : f.kind[id] === 'back' ? 'back' : 'unseen') + (e.edge === id ? ' focus' : ''),
    nodeClass: u => (u === f.current ? 'hot' : f.tin[u] < 0 ? 'unvisited' : ''),
    sub: u => f.tin[u] < 0 ? '—' : `${f.tin[u]}/${f.low[u]}`,
    extra: graph.pool.filter((_, i) => !graph.on[i])
  });
  $('inputReadout').textContent = t('inputReadout', {n: graph.n, edges: JSON.stringify(edges)});
  $('progress').textContent = t('progress', {k: index, m: frames.length - 1, b: listName(f.bridges)});
  $('event').textContent = eventText(f, edges);
  if (e.type === 'return') {
    const c = cutCache[e.edge], name = edgeName([e.u, e.v]);
    $('check').textContent = c.critical ? t('checkCritical', {e: name}) : t('checkSafe', {e: name, route: C.detour(graph.n, edges, e.edge).join('–')});
  } else $('check').textContent = '';
  const head = document.createElement('tr');
  [t('colServer'), ...f.tin.map((_, u) => String(u))].forEach((v, i) => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = v; head.append(th); });
  const mk = (label, arr) => { const tr = document.createElement('tr'); const th = document.createElement('th'); th.scope = 'row'; th.textContent = label; tr.append(th); arr.forEach((v, u) => { const td = document.createElement('td'); td.textContent = v < 0 ? '—' : String(v); if (u === f.current) td.className = 'changed'; tr.append(td); }); return tr; };
  $('tinTable').replaceChildren(head, mk('tin', f.tin), mk('low', f.low));
  $('history').replaceChildren(...frames.slice(1, index + 1).map((fr, i) => { const li = document.createElement('li'); li.textContent = eventText(fr, edges); if (i === index - 1) li.className = 'current'; return li; }));
  const hist = $('history'); hist.scrollTop = hist.scrollHeight;
  for (const [id, off] of [['prev', index === 0], ['reset', index === 0], ['next', index === frames.length - 1], ['end', index === frames.length - 1]]) $(id).disabled = off;
  $('editButtons').replaceChildren(...graph.pool.map((pe, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn';
    b.textContent = t(graph.on[i] ? 'edgeOn' : 'edgeOff', {e: edgeName(pe)}); b.setAttribute('aria-pressed', String(graph.on[i]));
    b.onclick = () => { graph.on[i] = !graph.on[i]; rebuild(); render(); const again = $('editButtons').children[i]; if (again) again.focus(); };
    return b;
  }));
  const pieces = C.components(graph.n, edges).count;
  $('disconnected').hidden = pieces === 1; $('disconnected').textContent = pieces === 1 ? '' : t('disconnected', {c: pieces});
}
$('preset').onchange = () => { preset = +$('preset').value; loadPreset(preset); render(); };
$('prev').onclick = () => { index = Math.max(0, index - 1); render(); };
$('next').onclick = () => { index = Math.min(frames.length - 1, index + 1); render(); };
$('reset').onclick = () => { index = 0; render(); };
$('end').onclick = () => { index = frames.length - 1; render(); };

// ---------- step 4: prediction ----------
const bowFinal = C.trace(C.BOWTIE.n, C.BOWTIE.edges).at(-1);
let choice = null, revealed = false;
function renderPredict() {
  draw($('predictGraph'), C.BOWTIE, {
    edgeClass: id => revealed ? (bowFinal.kind[id] === 'back' ? 'back' : 'tree') : 'plain',
    sub: revealed ? (u => `${bowFinal.tin[u]}/${bowFinal.low[u]}`) : null
  });
  $('reveal').disabled = choice === null;
  $('feedback').textContent = revealed ? (choice === 1 ? t('correct') : t('wrong' + choice)) + ' ' + t('answer') : t('choosePrompt');
  $('feedback').classList.toggle('correct', revealed && choice === 1);
}
document.querySelectorAll('[name=prediction]').forEach(r => r.onchange = () => { choice = +r.value; revealed = false; render(); });
$('reveal').onclick = () => { if (choice !== null) { revealed = true; render(); } };

// ---------- step 5: source ----------
let copyState = '';
$('code').textContent = window.PYTHON_SOURCE; $('fallbackSource').value = window.PYTHON_SOURCE;
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(window.PYTHON_SOURCE); copyState = 'copied'; $('manualCopy').hidden = true; }
  catch (_) { copyState = 'manual'; $('manualCopy').hidden = false; $('fallbackSource').focus(); $('fallbackSource').select(); }
  render();
};

function render() {
  cutButtons(); renderCut(); renderCover(); renderTrace(); renderPredict();
  $('copyStatus').textContent = copyState ? t(copyState) : '';
  $('langToggle').setAttribute('aria-label', t('language'));
}
loadPreset(0);
locale.onChange(render); locale.init();

const sections = [...document.querySelectorAll('.step')];
function updateNav() { const threshold = document.querySelector('.step-nav').getBoundingClientRect().bottom + 24; let active = sections[0]; for (const s of sections) if (s.getBoundingClientRect().top <= threshold) active = s; document.querySelectorAll('.step-nav a').forEach(a => a.classList.toggle('active', a.hash === '#' + active.id)); }
let navScheduled = false; function scheduleNav() { if (navScheduled) return; navScheduled = true; requestAnimationFrame(() => { navScheduled = false; updateNav(); }); }
window.addEventListener('scroll', scheduleNav, {passive: true}); window.addEventListener('resize', scheduleNav); updateNav();
