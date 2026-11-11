'use strict';
const locale = LeetCodeLocale(window.COPY), t = locale.t, $ = id => document.getElementById(id);
const M = MarketCore;
const cell = (tr, v, cls) => { const td = document.createElement('td'); td.textContent = v === null ? t('nullText') : String(v); if (cls) td.className = cls; tr.append(td); return td; };
const shortDate = s => s.slice(5);

// ---------- step 1: one seller by hand ----------
let handUser = 3, sorted = false; const worked = new Map();
function renderHand() {
  const d = M.MAIN, fav = d.users.find(u => u[0] === handUser)[1];
  $('userButtons').replaceChildren(...d.users.map(([u]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = t('userBtn', {u}); b.setAttribute('aria-pressed', String(u === handUser)); b.onclick = () => { handUser = u; sorted = false; render(); $('userButtons').children[d.users.findIndex(x => x[0] === u)].focus(); }; return b; }));
  $('sortBtn').setAttribute('aria-pressed', String(sorted));
  let rows = d.orders.filter(o => o[4] === handUser);
  if (sorted) rows = rows.slice().sort((a, b) => a[1] < b[1] ? -1 : 1);
  $('handRows').replaceChildren(...rows.map((o, i) => { const tr = document.createElement('tr'); if (i === 1) tr.className = sorted ? 'rank2' : 'changed'; cell(tr, o[0]); cell(tr, o[1]); cell(tr, M.brandOf(d, o[2])); cell(tr, sorted ? i + 1 : '—'); return tr; }));
  let text;
  if (rows.length === 0) { text = t('handNone', {u: handUser}); worked.set(handUser, 'no'); }
  else if (rows.length === 1) { text = t('handOne', {u: handUser}); worked.set(handUser, 'no'); }
  else if (!sorted) text = t('handUnsorted', {brand: M.brandOf(d, rows[1][2])});
  else { const brand = M.brandOf(d, rows[1][2]), ans = brand === fav ? 'yes' : 'no'; text = t('handSorted', {brand, date: rows[1][1], u: handUser, fav, ans}); worked.set(handUser, ans); }
  $('handText').textContent = text;
  $('sortBtn').disabled = rows.length < 2;
  const list = [...worked.entries()].sort((a, b) => a[0] - b[0]).map(([u, a]) => `${u}: ${a}`).join(' · ');
  $('handLedger').textContent = list ? t('handLedger', {list}) : t('handLedgerNone');
}
$('sortBtn').onclick = () => { sorted = !sorted; render(); };

// ---------- step 3: pipeline with switches ----------
let preset = 0, data = null, opts = {...M.CORRECT}, run = null, at = 0;
function loadPreset(p) { const b = M.presets[p]; data = {users: b.users.map(u => u.slice()), items: b.items, orders: b.orders}; rebuild(); }
function rebuild() { run = M.pipeline(data, opts); at = 0; }
function renderFavs() {
  $('favs').replaceChildren(...data.users.map((u, i) => {
    const lab = document.createElement('label'); lab.className = 'fav';
    const span = document.createElement('span'); span.textContent = t('favLabel', {u: u[0]});
    const sel = document.createElement('select'); M.BRANDS.forEach(b => { const o = document.createElement('option'); o.value = b; o.textContent = b; sel.append(o); }); sel.value = u[1];
    sel.onchange = () => { data.users[i][1] = sel.value; rebuild(); render(); };
    lab.append(span, sel); return lab;
  }));
}
function renderPipeline() {
  const f = run.frames[at], last = run.frames.length - 1;
  document.querySelectorAll('[name=order],[name=join],[name=filter]').forEach(r => { r.checked = opts[r.name] === r.value; });
  $('variantSql').textContent = M.variantSql(opts);
  $('progress').textContent = t('progress', {k: at, m: last});
  const ev = f.type === 'orders' ? t('evOrders', {n: data.orders.length})
    : f.type === 'rank' ? t('evRank', {s: f.seller, c: f.count, key: t(opts.order === 'date' ? 'keyDate' : 'keyId'), total: f.ranked.length})
    : f.type === 'join' ? t('evJoin', {rows: f.joined.length, dropped: f.dropped ? t('evJoinDropped', {d: f.dropped}) : ''})
    : t('evOutput');
  $('event').textContent = ev;
  const empty = (tbody, cols) => { const tr = document.createElement('tr'); const td = cell(tr, t('emptyTable')); td.colSpan = cols; tbody.replaceChildren(tr); };
  const rankedSource = f.type === 'orders' ? [] : f.ranked;
  if (f.type === 'orders') {
    $('rankedRows').replaceChildren(...data.orders.map(o => { const tr = document.createElement('tr'); tr.className = 'muted-row'; cell(tr, o[0]); cell(tr, o[1]); cell(tr, o[4]); cell(tr, o[2]); cell(tr, '—'); return tr; }));
  } else {
    $('rankedRows').replaceChildren(...rankedSource.map(r => { const tr = document.createElement('tr'); if (r.sale_rank === 2) tr.className = 'rank2'; if (f.type === 'rank' && r.seller_id === f.seller) tr.classList.add('changed'); cell(tr, r.order_id); cell(tr, r.order_date); cell(tr, r.seller_id); cell(tr, r.item_id); cell(tr, r.sale_rank); return tr; }));
  }
  if (f.joined) $('joinedRows').replaceChildren(...(f.joined.length ? f.joined.map(r => { const tr = document.createElement('tr'); cell(tr, r.user_id); cell(tr, r.favorite_brand); cell(tr, r.sale_rank); cell(tr, r.item_brand, r.item_brand === null ? 'null' : ''); return tr; }) : [(() => { const tr = document.createElement('tr'); const td = cell(tr, t('emptyTable')); td.colSpan = 4; return tr; })()]));
  else empty($('joinedRows'), 4);
  if (f.output) $('outputRows').replaceChildren(...(f.output.length ? f.output.map(([u, a]) => { const tr = document.createElement('tr'); cell(tr, u); cell(tr, a, a === 'yes' ? 'yes' : 'no'); return tr; }) : [(() => { const tr = document.createElement('tr'); const td = cell(tr, t('emptyTable')); td.colSpan = 2; return tr; })()]));
  else empty($('outputRows'), 2);
  if (f.output) {
    const truth = M.answer(data), got = new Map(f.output);
    const missing = truth.filter(([u]) => !got.has(u)).map(([u]) => u), wrong = truth.filter(([u, a]) => got.has(u) && got.get(u) !== a).map(([u]) => u);
    const why = [missing.length ? t('missingUsers', {list: missing.join(', ')}) : '', wrong.length ? t('wrongUsers', {list: wrong.join(', ')}) : ''].filter(Boolean).join('; ');
    $('verdict').textContent = why ? t('differs', {why}) : t('matches');
    $('verdict').classList.toggle('correct', !why); $('verdict').classList.toggle('bad', !!why);
  } else { $('verdict').textContent = ''; $('verdict').classList.remove('correct', 'bad'); }
  for (const [id, off] of [['prev', at === 0], ['reset', at === 0], ['next', at === last], ['end', at === last]]) $(id).disabled = off;
}
document.querySelectorAll('[name=order],[name=join],[name=filter]').forEach(r => r.onchange = () => { opts[r.name] = r.value; rebuild(); render(); });
$('preset').onchange = () => { preset = +$('preset').value; loadPreset(preset); renderFavs(); render(); };
$('prev').onclick = () => { at = Math.max(0, at - 1); render(); };
$('next').onclick = () => { at = Math.min(run.frames.length - 1, at + 1); render(); };
$('reset').onclick = () => { at = 0; render(); };
$('end').onclick = () => { at = run.frames.length - 1; render(); };

// ---------- step 4 ----------
let choice = null, revealed = false;
function renderPredict() {
  $('reveal').disabled = choice === null;
  $('feedback').textContent = revealed ? (choice === 2 ? t('correct') : t('wrong' + choice)) + ' ' + t('answer') : t('choosePrompt');
  $('feedback').classList.toggle('correct', revealed && choice === 2);
}
document.querySelectorAll('[name=prediction]').forEach(r => r.onchange = () => { choice = +r.value; revealed = false; render(); });
$('reveal').onclick = () => { if (choice !== null) { revealed = true; render(); } };

// ---------- step 2 / 5 code ----------
let copyState = '';
$('groupSql').textContent = M.GROUP_SQL; $('baselineSql').textContent = M.BASELINE_SQL;
$('code').textContent = window.SQL_SOURCE; $('fallbackSource').value = window.SQL_SOURCE;
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(window.SQL_SOURCE); copyState = 'copied'; $('manualCopy').hidden = true; }
  catch (_) { copyState = 'manual'; $('manualCopy').hidden = false; $('fallbackSource').focus(); $('fallbackSource').select(); }
  render();
};

function render() {
  renderHand(); renderPipeline(); renderPredict();
  $('copyStatus').textContent = copyState ? t(copyState) : '';
  $('langToggle').setAttribute('aria-label', t('language'));
}
loadPreset(0);
locale.onChange(() => { renderFavs(); render(); }); locale.init();

const sections = [...document.querySelectorAll('.step')];
function updateNav() { const threshold = document.querySelector('.step-nav').getBoundingClientRect().bottom + 24; let active = sections[0]; for (const s of sections) if (s.getBoundingClientRect().top <= threshold) active = s; document.querySelectorAll('.step-nav a').forEach(a => a.classList.toggle('active', a.hash === '#' + active.id)); }
let navScheduled = false; function scheduleNav() { if (navScheduled) return; navScheduled = true; requestAnimationFrame(() => { navScheduled = false; updateNav(); }); }
window.addEventListener('scroll', scheduleNav, {passive: true}); window.addEventListener('resize', scheduleNav); updateNav();
