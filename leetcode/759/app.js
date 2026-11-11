'use strict';
const locale = LeetCodeLocale(window.COPY), t = locale.t, $ = id => document.getElementById(id), C = window.FreeTime759;
let preset = '0', run = C.trace(C.presets[0]), index = 0, validation = '', choice = null, revealed = false, copyState = '';
const CORRECT = 1;

function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
const fmt = list => list.map(([a, b]) => `[${a},${b}]`).join(', ');

// Draws employee rows, a merged-busy row, a free row, an axis and an optional reach line.
// state: {pooledStatus: Map(index -> 'done'|'current'|'pending'), covered, free, reach}
function timeline(container, schedule, pooled, state) {
  const all = schedule.flat(), lo = Math.min(...all.map(x => x[0])) - 1, hi = Math.max(...all.map(x => x[1])) + 1;
  const pct = x => ((x - lo) / (hi - lo) * 100).toFixed(3) + '%';
  const bar = (s, e, cls) => { const b = el('span', undefined, 'tl-bar ' + cls); b.style.left = pct(s); b.style.width = `calc(${pct(e)} - ${pct(s)})`; return b; };
  const row = (label, bars, cls = '') => { const r = el('div', undefined, 'tl-row ' + cls); const track = el('div', undefined, 'tl-track'); track.append(...bars); r.append(el('span', label, 'tl-label'), track); return r; };
  const rows = schedule.map((p, who) => row(C.NAMES[who], pooled.map((iv, i) => [iv, i]).filter(([iv]) => iv.who === C.NAMES[who]).map(([iv, i]) => bar(iv.s, iv.e, 'busy ' + (state.status ? state.status(i) : 'done')))));
  rows.push(row(t('rowMerged'), state.covered.map(([s, e]) => bar(s, e, 'merged')), 'tl-sep'));
  rows.push(row(t('rowFree'), state.free.map(([s, e]) => bar(s, e, 'free'))));
  const axis = el('div', undefined, 'tl-row tl-axis'), track = el('div', undefined, 'tl-track');
  for (const p of [...new Set(all.flat())].sort((a, b) => a - b)) { const tick = el('span', String(p), 'tl-tick'); tick.style.left = pct(p); track.append(tick); }
  axis.append(el('span', '', 'tl-label'), track); rows.push(axis);
  if (state.reach !== null && state.reach !== undefined) {
    const line = el('div', undefined, 'tl-reach'); line.style.setProperty('--x', ((state.reach - lo) / (hi - lo)).toFixed(4));
    line.append(el('span', `${t('reachMark')} ${state.reach}`, 'tl-reach-label')); rows.push(line);
  }
  container.replaceChildren(...rows);
}

function renderStatic() {
  const s = C.presets[0], r = C.trace(s);
  timeline($('timeline0'), s, r.pooled, {covered: r.frames.at(-1).covered, free: r.answer, reach: null});
  const b = C.brute(s), all = r.pooled;
  $('bruteRows').replaceChildren(...b.pieces.map(p => {
    const tr = document.createElement('tr'), cover = all.find(iv => iv.s <= p.a && p.b <= iv.e);
    tr.append(el('td', `[${p.a},${p.b}]`), el('td', cover ? t('coveredBy', {who: cover.who, s: cover.s, e: cover.e}) : t('freePiece')));
    if (!cover) tr.className = 'free-row';
    return tr;
  }));
  $('bruteTotal').textContent = t('bruteTotal', {p: b.points.length, n: b.pieces.length, k: all.length, w: b.worstChecks, c: b.checks});
}

function eventText(f) {
  if (f.type === 'init') return t('evInit');
  if (f.type === 'done') return f.free.length ? t('evDone', {list: fmt(f.free)}) : t('evDoneNone');
  const key = {first: 'evFirst', gap: 'evGap', touch: 'evTouch', extend: 'evExtend', inside: 'evInside'}[f.kind];
  return t(key, {who: f.iv.who, s: f.iv.s, e: f.iv.e, r: f.reachBefore, nr: f.reach});
}

function kindText(h) {
  return h.kind === 'gap' ? t('kindGap', {a: h.gap[0], b: h.gap[1]}) : t({first: 'kindFirst', touch: 'kindTouch', extend: 'kindExtend', inside: 'kindInside'}[h.kind]);
}

function renderTrace() {
  const f = run.frames[index], last = run.frames.length - 1, n = run.pooled.length;
  $('presetDesc').textContent = preset === 'custom' ? t('presetDescCustom', {text: C.format(run.schedule)}) : t('presetDesc' + preset);
  $('progress').textContent = t('progress', {i: index, total: last, done: f.type === 'done' ? n : f.i + 1, n});
  $('event').textContent = eventText(f);
  const wrong = f.type === 'step' && f.wrongGap && JSON.stringify(f.wrongGap) !== JSON.stringify(f.gap);
  $('wrongNote').hidden = !wrong;
  $('wrongNote').textContent = wrong ? t('wrongNote', {p: f.prevEnd, s: f.iv.s, r: f.reachBefore}) : '';
  $('reach').textContent = f.reach === null ? t('reachNone') : t('reachLine', {r: f.reach});
  $('free').textContent = f.free.length ? t('freeLine', {list: fmt(f.free)}) : t('freeNone');
  const current = f.type === 'step' ? f.i : -1, doneUpTo = f.type === 'done' ? n : f.i;
  timeline($('timeline'), run.schedule, run.pooled, {covered: f.covered, free: f.free, reach: f.reach, status: i => i === current ? 'current' : i < doneUpTo ? 'done' : 'pending'});
  $('sortedRows').replaceChildren(...run.pooled.map((iv, i) => {
    const tr = document.createElement('tr'), h = f.history[i];
    tr.append(el('td', String(i + 1)), el('td', iv.who), el('td', `[${iv.s},${iv.e}]`), el('td', i === current ? `${t('stCurrent')} · ${kindText(h)}` : h ? kindText(h) : t('stPending')));
    if (i === current) tr.className = 'current-row'; else if (!h) tr.className = 'pending-row';
    return tr;
  }));
  $('prev').disabled = $('reset').disabled = index === 0;
  $('next').disabled = $('end').disabled = index === last;
  $('position').max = String(last); $('position').value = String(index);
  $('validation').textContent = validation ? t(validation) : '';
  $('validation').className = validation && validation !== 'applied' ? 'status-bad' : 'status-good';
}

function renderPrediction() {
  $('reveal').disabled = choice === null;
  $('feedback').textContent = revealed ? [t(choice === CORRECT ? 'correct' : 'incorrect'), t('fb' + choice), t('answer')].join(t('sep')) : t('await');
  $('feedback').classList.toggle('status-good', revealed && choice === CORRECT);
}

function render() {
  renderStatic(); renderTrace(); renderPrediction();
  $('copyStatus').textContent = copyState ? t(copyState) : '';
  $('langToggle').setAttribute('aria-label', t('language'));
  $('stepNav').setAttribute('aria-label', t('navLabel'));
}

$('preset').onchange = e => { preset = e.target.value; run = C.trace(C.presets[Number(preset)]); index = 0; $('inputSchedule').value = C.format(run.schedule); validation = ''; renderTrace(); };
$('customForm').onsubmit = e => {
  e.preventDefault();
  const parsed = C.parse($('inputSchedule').value);
  if (parsed.error) validation = parsed.error;
  else {
    run = C.trace(parsed.schedule); index = 0; validation = 'applied';
    const match = C.presets.findIndex(p => C.format(p) === C.format(parsed.schedule));
    preset = match >= 0 ? String(match) : 'custom'; $('preset').value = preset;
  }
  renderTrace();
};
$('prev').onclick = () => { if (index > 0) index--; renderTrace(); };
$('next').onclick = () => { if (index < run.frames.length - 1) index++; renderTrace(); };
$('reset').onclick = () => { index = 0; renderTrace(); };
$('end').onclick = () => { index = run.frames.length - 1; renderTrace(); };
$('position').oninput = e => { index = Number(e.target.value); renderTrace(); };
document.querySelectorAll('[name="prediction"]').forEach(r => r.onchange = () => { choice = Number(r.value); revealed = false; renderPrediction(); });
$('reveal').onclick = () => { if (choice !== null) { revealed = true; renderPrediction(); } };
$('predReset').onclick = () => { choice = null; revealed = false; document.querySelectorAll('[name="prediction"]').forEach(r => { r.checked = false; }); renderPrediction(); };
$('code').textContent = window.PYTHON_SOURCE; $('fallbackSource').value = window.PYTHON_SOURCE;
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(window.PYTHON_SOURCE); copyState = 'copied'; $('manualCopy').hidden = true; }
  catch (_) { copyState = 'fallback'; $('manualCopy').hidden = false; $('fallbackSource').focus(); $('fallbackSource').select(); }
  $('copyStatus').textContent = t(copyState);
};
locale.onChange(render); locale.init();

function updateNav() {
  const nav = document.querySelector('.step-nav'), limit = nav.getBoundingClientRect().bottom + 40;
  let current = document.querySelector('.step');
  for (const s of document.querySelectorAll('.step')) if (s.getBoundingClientRect().top <= limit) current = s;
  document.querySelectorAll('.step-nav a').forEach(a => { const on = a.hash === '#' + current.id; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
}
let navQueued = false;
window.addEventListener('scroll', () => { if (!navQueued) { navQueued = true; requestAnimationFrame(() => { navQueued = false; updateNav(); }); } }, {passive: true});
window.addEventListener('resize', updateNav); updateNav();
