'use strict';
const locale = LeetCodeLocale(window.COPY), t = locale.t, $ = id => document.getElementById(id), C = window.Calc772;
let preset = '0', run = C.trace(C.presets[0]), index = 0, validation = '', choice = null, revealed = false, copyState = '';
const CORRECT = 3;
const OPS = {'+': '+', '-': '−', '*': '×', '/': '÷'};

function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
const n = v => (v < 0 ? '(−' + (-v) + ')' : String(v));      // number inside a formula
const plain = v => (v < 0 ? '−' + (-v) : String(v));         // standalone number
function exact(a, b) { const q = a / b; return Number.isInteger(q) ? plain(q) : plain(Math.round(q * 1000) / 1000); }

function applyText(step) {
  const p = {T: n(step.before.total), t: n(step.before.term), v: plain(step.value), nT: plain(step.after.total), nt: plain(step.after.term)};
  if (step.op === '+') return t('applyPlus', p);
  if (step.op === '-') return t('applyMinus', {...p, v: n(step.value)});
  if (step.op === '*') return t('applyMul', {...p, v: n(step.value)});
  return t('applyDiv', {...p, v: n(step.value), exact: exact(step.before.term, step.value)});
}

function eventText(f) {
  if (f.type === 'init') return t('evInit');
  if (f.type === 'end') return t('evEnd', {T: plain(f.state.total), t: n(f.state.term), v: plain(f.answer)});
  if (f.type === 'op') return t('evOp', {c: OPS[f.token.text]});
  if (f.type === 'open') return t('evOpen', {T: plain(f.parked.total), t: plain(f.parked.term), o: OPS[f.parked.op], d: f.stack.length});
  if (f.type === 'num') return t('evNum', {v: f.step.value}) + t('sep') + applyText(f.step);
  const s = f.step;
  return t('evClose', {T: plain(s.innerTotal), t: n(s.innerTerm), v: plain(s.value), pT: plain(s.before.total), pt: plain(s.before.term), o: OPS[s.op]}) + t('sep') + applyText(s);
}

function histText(h) {
  if (h.kind === 'open') return t('histOpen', {d: h.depth});
  const p = {v: plain(h.value), o: OPS[h.op], T: plain(h.before.total), nT: plain(h.after.total), t: plain(h.before.term), nt: plain(h.after.term)};
  return t(h.kind === 'num' ? 'histNum' : 'histClose', p);
}

function renderStatic() {
  const r = C.trace('14-3*10/4');
  $('ledgerRows').replaceChildren(...r.frames.filter(f => f.type === 'num' || f.type === 'op').map(f => {
    const tr = document.createElement('tr');
    tr.append(el('td', f.token.type === 'op' ? OPS[f.token.text] : f.token.text), el('td', plain(f.state.total)), el('td', plain(f.state.term)), el('td', OPS[f.state.op]),
      el('td', f.type === 'op' ? t('evOp', {c: OPS[f.token.text]}) : applyText(f.step)));
    return tr;
  }));
  const sel = $('preset');
  if (!sel.options.length) {
    C.presets.forEach((p, i) => { const o = el('option', p); o.value = String(i); sel.append(o); });
    const c = el('option'); c.value = 'custom'; c.disabled = true; sel.append(c);
  }
  sel.querySelector('option[value=custom]').textContent = t('presetCustom');
  sel.value = preset;
}

function renderTrace() {
  const f = run.frames[index], last = run.frames.length - 1, total = run.tokens.length;
  $('presetDesc').textContent = preset === 'custom' ? t('presetDescCustom', {s: run.s}) : t('presetDesc' + preset);
  $('progress').textContent = t('progress', {i: index, total: last, done: f.type === 'end' ? total : f.k + 1, n: total});
  $('event').textContent = eventText(f);
  $('tokens').replaceChildren(...run.tokens.map((tk, k) => el('span', tk.type === 'op' ? OPS[tk.text] : tk.text,
    'tok ' + (k === f.k && f.type !== 'end' ? 'current' : k > f.k ? 'future' : 'read') + (tk.type === 'open' || tk.type === 'close' ? ' paren' : ''))));
  $('vTotal').textContent = plain(f.state.total); $('vTerm').textContent = plain(f.state.term); $('vOp').textContent = OPS[f.state.op];
  $('stackEmpty').hidden = f.stack.length > 0;
  $('stack').replaceChildren(...f.stack.map((s, d) => el('li', t('stackRow', {d: d + 1, T: plain(s.total), t: plain(s.term), o: OPS[s.op]}), d === f.stack.length - 1 ? 'top' : '')).reverse());
  $('historyEmpty').hidden = f.history.length > 0;
  const fresh = f.type === 'num' || f.type === 'open' || f.type === 'close';
  $('history').replaceChildren(...f.history.map((h, i) => el('li', histText(h), fresh && i === f.history.length - 1 ? 'latest' : '')));
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

$('preset').onchange = e => { preset = e.target.value; run = C.trace(C.presets[Number(preset)]); index = 0; $('inputExpr').value = run.s; validation = ''; renderTrace(); };
$('customForm').onsubmit = e => {
  e.preventDefault();
  const s = $('inputExpr').value, error = C.validate(s);
  if (error) validation = error;
  else { run = C.trace(s); index = 0; validation = 'applied'; const match = C.presets.indexOf(s); preset = match >= 0 ? String(match) : 'custom'; $('preset').value = preset; }
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
