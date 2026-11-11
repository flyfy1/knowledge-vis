'use strict';
const locale = LeetCodeLocale(window.COPY), t = locale.t, $ = id => document.getElementById(id), C = window.Window727;
let preset = '0', run = C.trace(...C.presets[0]), index = 0, validation = '', choice = null, revealed = false, copyState = '';
const CORRECT = 2;

function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }

// cells: [{letter, index, classes[], tag}] rendered as wrapping letter cells with index above and tag below.
function strip(container, cells) {
  container.replaceChildren(...cells.map(c => {
    const cell = el('div', undefined, 'cell ' + (c.classes || []).join(' '));
    cell.append(el('span', String(c.index), 'cell-index'), el('span', c.letter, 'cell-letter'), el('span', c.tag || ' ', 'cell-tag'));
    return cell;
  }));
}

function renderStatic() {
  const s = 'xcaxctat';
  strip($('strip0'), [...s].map((letter, i) => ({letter, index: i, classes: [i >= 4 ? 'in-best' : '', [4, 6, 7].includes(i) ? 'picked' : ''], tag: [4, 6, 7].includes(i) ? '✓' : ''})));
  strip($('strip2'), [...s].map((letter, i) => ({letter, index: i, classes: [i > 4 ? 'future' : '', i === 1 || i === 2 ? 'chain-a' : '', i === 4 ? 'chain-b' : ''], tag: i === 1 || i === 2 ? 'A' : i === 4 ? 'B' : ''})));
  const brute = C.brute(s, 'cat');
  $('bruteRows').replaceChildren(...brute.rows.map(r => {
    const tr = document.createElement('tr');
    tr.append(el('td', String(r.start)), el('td', String(r.read)), el('td', r.end === null ? t('noWindow') : `"${s.slice(r.start, r.end + 1)}" [${r.start}..${r.end}]`));
    return tr;
  }));
  $('bruteTotal').textContent = t('bruteTotal', {total: brute.totalRead, n: s.length});
}

function windowText(start, end) { return run.s1.slice(start, end + 1); }

function eventText(f) {
  if (f.type === 'init') return t('evInit');
  if (f.type === 'done') return f.best ? t('evDone', {w: windowText(f.best.start, f.best.end), start: f.best.start, len: f.best.len}) : t('evDoneNone');
  let text;
  if (!run.s2.includes(f.ch)) text = t('evNoMatch', {j: f.j, ch: f.ch});
  else if (!f.changes.length) text = t('evSame', {j: f.j, ch: f.ch});
  else text = t('evChange', {j: f.j, ch: f.ch, list: f.changes.map(c => t('changeItem', {p: run.s2.slice(0, c.k), from: c.from, to: c.to})).join(t('listSep'))});
  if (f.candidate && f.candidate.fresh) {
    const c = f.candidate, w = windowText(c.start, c.end);
    text += t('sep') + (f.improved ? t('candBest', {start: c.start, end: c.end, w, len: c.len}) : t('candKeep', {start: c.start, w, len: c.len, bw: windowText(f.best.start, f.best.end), blen: f.best.len}));
  }
  return text;
}

function renderTrace() {
  const f = run.frames[index], last = run.frames.length - 1, n = run.s1.length, m = run.s2.length;
  $('presetDesc').textContent = preset === 'custom' ? t('presetDescCustom', {s1: run.s1, s2: run.s2}) : t('presetDesc' + preset);
  $('progress').textContent = t('progress', {i: index, total: last, done: f.type === 'init' ? 0 : f.j + 1, n});
  $('event').textContent = eventText(f);
  const startsAt = {};
  f.latest.forEach((st, k) => { if (st >= 0) (startsAt[st] = startsAt[st] || []).push(run.s2.slice(0, k + 1)); });
  strip($('traceStrip'), [...run.s1].map((letter, i) => ({letter, index: i, classes: [
    i > f.j && f.type !== 'done' ? 'future' : '',
    i === f.j && f.type === 'read' ? 'current' : '',
    f.best && i >= f.best.start && i <= f.best.end ? 'in-best' : ''], tag: startsAt[i] ? startsAt[i].join(',') : ''})));
  $('best').textContent = f.best ? t('bestLine', {w: windowText(f.best.start, f.best.end), start: f.best.start, end: f.best.end, len: f.best.len}) : t('bestNone');
  $('slotRows').replaceChildren(...f.latest.map((st, i) => {
    const k = i + 1, change = f.changes.find(c => c.k === k), tr = document.createElement('tr');
    if (change) tr.className = 'changed-row';
    tr.append(el('td', String(k)), el('td', `"${run.s2.slice(0, k)}"`), el('td', st < 0 ? t('none') : String(st)),
      el('td', st < 0 || f.j < 0 ? '—' : `"${windowText(st, f.j)}"`), el('td', change ? t('changedCell', {from: change.from, to: change.to}) : t('unchanged')));
    return tr;
  }));
  $('historyEmpty').hidden = f.history.length > 0;
  $('history').replaceChildren(...f.history.map((h, i) => el('li', t('histRow', {end: h.end, w: windowText(h.start, h.end), start: h.start, len: h.len, status: t(h.improved ? 'histImproved' : 'histNot')}), i === f.history.length - 1 && f.candidate && f.candidate.fresh ? 'latest' : '')));
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

function restart(s1, s2) { run = C.trace(s1, s2); index = 0; }
$('preset').onchange = e => { preset = e.target.value; const [s1, s2] = C.presets[Number(preset)]; restart(s1, s2); $('inputS1').value = s1; $('inputS2').value = s2; validation = ''; renderTrace(); };
$('customForm').onsubmit = e => {
  e.preventDefault();
  const s1 = $('inputS1').value.trim(), s2 = $('inputS2').value.trim(), error = C.validate(s1, s2);
  if (error) validation = error;
  else { restart(s1, s2); validation = 'applied'; const match = C.presets.findIndex(p => p[0] === s1 && p[1] === s2); preset = match >= 0 ? String(match) : 'custom'; $('preset').value = preset; }
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
