'use strict';
// Periodic trends (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..'), root = path.resolve(dir, '../../..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
const E = M.bySym;

// ---- data sanity ----
ok(M.ELEMENTS.length === 34, '34 elements'); ok(M.ELEMENTS.filter(e => e.r != null).length === 29, '29 with a radius (quoted)');
M.ELEMENTS.forEach(e => { const sh = M.shells(e.Z); ok(Object.values(sh).reduce((a, b) => a + b, 0) === e.Z, 'electrons = Z ' + e.sym); ok(Math.max(...Object.keys(sh).map(Number)) === e.period, 'outer shell = period ' + e.sym);
  const v = M.slater(e.Z).valence; ok(v === (e.group <= 2 ? e.group : e.group - 10) || (e.sym === 'He' && v === 2), 'valence = group ' + e.sym);
  ok((e.group === 18) === (e.en == null) || e.sym === 'H', 'noble gases have no EN'); });

// ---- step 0: gradients ----
for (let p = 2; p <= 3; p++) { const row = M.period(p).filter(e => e.r != null); for (let i = 1; i < row.length; i++) ok(row[i].r < row[i - 1].r, 'radius shrinks across period ' + p); }
for (let p = 4; p <= 5; p++) { const row = M.period(p).filter(e => e.r != null), right = row.filter(e => e.group >= 14).map(e => e.r); ok(row[0].r - row[2].r > 50, 'fast shrink on the left ' + p); const span = Math.max(...right) - Math.min(...right); ok(span >= 1 && span <= 2, 'right half level within 1–2 pm ' + p); }
{ const big = M.ELEMENTS.filter(e => e.r != null).sort((a, b) => b.r - a.r)[0]; ok(big.sym === 'Rb', 'largest atom bottom left'); }
{ const ie = M.ELEMENTS.slice().sort((a, b) => b.ie - a.ie)[0], en = M.ELEMENTS.filter(e => e.en != null).sort((a, b) => b.en - a.en)[0]; ok(ie.sym === 'He' && en.sym === 'F', 'IE and EN largest top right'); }

// ---- step 1: Zeff and the radius model ----
ok(E.Li.r === 128 && E.F.r === 57 && E.F.Z - E.Li.Z === 6, 'Li 128 → F 57, 6 protons');
for (let p = 2; p <= 5; p++) { const row = M.period(p); for (let i = 1; i < row.length; i++) if (row[i].group !== 13) near(M.slater(row[i].Z).zeff - M.slater(row[i - 1].Z).zeff, 0.65, 1e-9, 'Zeff +0.65 per step'); }
ok(Math.round(M.predictR(E.Li.Z)) === 126 && E.Li.r === 128, 'Li model 126, data 128');
ok(Math.round(M.predictR(E.F.Z)) === 31, 'F model 31 pm');
for (let p = 2; p <= 5; p++) { const row = M.period(p); for (let i = 1; i < row.length; i++) ok(M.predictR(row[i].Z) < M.predictR(row[i - 1].Z), 'model shrinks across'); }
ok(M.R_CORR > 0.9 && M.R_CORR.toFixed(2) === '0.93', 'correlation 0.93');
{ const row = M.period(2).filter(e => e.r != null); ok(M.predictR(row[row.length - 1].Z) / M.predictR(row[0].Z) < row[row.length - 1].r / row[0].r, 'model shrinks faster than the data'); }
for (let p = 2; p <= 5; p++) { const row = M.period(p), z = row.map(e => M.slater(e.Z).zeff); ok(z.indexOf(Math.max(...z)) === row.length - 1, 'noble gas has the largest Zeff in its period'); }

// ---- step 2: dips exactly at groups 13 and 16 in periods 2–4 ----
for (let p = 2; p <= 4; p++) { const row = M.period(p); for (let i = 1; i < row.length; i++) { const dip = row[i].ie < row[i - 1].ie; ok(dip === (row[i].group === 13 || row[i].group === 16), `period ${p} ${row[i].sym}: dip only at 13/16`); const st = M.ieStep(row[i].sym); ok((st.kind !== 'normal') === dip, 'reason matches the dip'); } }
{ const b = M.valenceBoxes(E.B.Z); ok(b.s === 2 && b.p.join() === '1,0,0', 'B: first p electron alone'); const o = M.valenceBoxes(E.O.Z); ok(o.p.join() === '2,1,1', 'O: fourth p electron paired'); const n = M.valenceBoxes(E.N.Z); ok(n.p.join() === '1,1,1', 'N: Hund'); }

// ---- step 3: down a group ----
[1, 2, 13, 14, 15, 16, 17].forEach(g => { const L = M.group(g); for (let i = 1; i < L.length; i++) ok(L[i].r > L[i - 1].r, 'radius grows down group ' + g); });
['Li', 'Na', 'K', 'Rb'].forEach((s, i) => near(M.slater(E[s].Z).zeff, [1.3, 2.2, 2.2, 2.2][i], 1e-9, 'group 1 Zeff ' + s));
near(M.slater(E.Al.Z).zeff, 3.5, 1e-9, 'Al 3.5'); near(M.slater(E.Ga.Z).zeff, 5.0, 1e-9, 'Ga 5.0');
ok(E.Ga.en > E.Al.en && E.Ga.ie > E.Al.ie, 'Ga above Al in EN and IE');
// group IE falls everywhere except Al → Ga
[1, 2, 13, 14, 15, 16, 17].forEach(g => { const L = M.group(g); for (let i = 1; i < L.length; i++) ok((L[i].ie < L[i - 1].ie) || (L[i].sym === 'Ga'), 'IE down group ' + g); });
// EN exceptions are only in groups 13/14 at period 4 (and K = Rb level)
[1, 2, 13, 14, 15, 16, 17].forEach(g => { const L = M.group(g); for (let i = 1; i < L.length; i++) { const d = L[i].en - L[i - 1].en; ok(d < 0 || (['Ga', 'Ge'].includes(L[i].sym) && d > 0) || (L[i].sym === 'Rb' && d === 0), 'EN down group ' + g + ' ' + L[i].sym); } });

// ---- step 4: questions ----
ok(M.QUESTIONS.length === 12, '12 questions');
M.QUESTIONS.forEach(([p, a, b]) => { ok(E[a].period === E[b].period || E[a].group === E[b].group, 'same period or group'); ok(E[a][p] != null && E[b][p] != null && E[a][p] !== E[b][p], 'comparable'); ok(M.rulePredicts(p, a, b) != null, 'rule applies'); });
{ const fails = M.QUESTIONS.filter(([p, a, b]) => M.rulePredicts(p, a, b) !== M.truth(p, a, b)).map(q => q.join(':')); ok(fails.sort().join() === ['en:Ga:Al', 'ie:Be:B', 'ie:Mg:Al', 'ie:N:O', 'ie:P:S'].sort().join(), 'exceptions are the ones from steps 2–3: ' + fails); }

// ---- quiz ----
ok(E.K.ie === 419 && E.Na.ie === 496 && E.K.Z - E.Na.Z === 8, 'K vs Na numbers'); near(M.slater(E.K.Z).nstar, 3.7, 0, 'n* 3.7'); near(M.slater(E.Na.Z).nstar, 3, 0, 'n* 3');

// ---- bilingual strings, html keys, links ----
const zh = STRINGS.zh, en = STRINGS.en, ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
ok(JSON.stringify(Object.keys(zh).sort()) === JSON.stringify(Object.keys(en).sort()), 'same key sets');
Object.keys(zh).forEach(k => ok(ph(zh[k]) === ph(en[k]), 'placeholders ' + k));
Object.keys(zh).forEach(k => { if (!['foot'].includes(k) && /[一-鿿]/.test(zh[k])) ok(zh[k] !== en[k] && !/[一-鿿]/.test(en[k]), 'en translated ' + k); });
M.ELEMENTS.forEach(e => ok(('el_' + e.sym) in zh, 'name ' + e.sym)); M.PROPS.forEach(p => ok(('prop_' + p) in zh && ('unit_' + p) in zh, 'prop ' + p));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
[...html.matchAll(/data-i18n(?:-html|-aria)?="(\w+)"/g)].forEach(m => ok(m[1] in zh, 'html key ' + m[1]));
[...app.matchAll(/\bt\('(\w+)'[,)]/g)].forEach(m => ok(m[1] in zh, 'app key ' + m[1]));
const re = /href="\.\.\/\.\.\/\.\.\/([^"#]*)(#step(\d+))?"/g;
const links = [...html.matchAll(re)].concat(...Object.values(zh).concat(Object.values(en)).map(s => [...s.matchAll(re)]));
links.filter(m => m[1] === '' || m[1].endsWith('/')).forEach(m => { const f = path.join(root, m[1], 'index.html'); ok(fs.existsSync(f), 'link target ' + m[1]); if (m[3]) ok(fs.readFileSync(f, 'utf8').includes(`id="step${m[3]}"`), 'anchor ' + m[1] + m[2]); });
ok(html.includes('href="../../../chemistry/matter/periodic-trends/"') && html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'compare link, provenance slot, css');
ok(!html.includes('canvas-label-guard'), 'no label guard');
Object.values(zh).forEach(v => ok(!/左边|右边|左图|右图/.test(v), 'no positional figure refs (zh)'));
Object.values(en).forEach(v => ok(!/\b(left|right) (figure|chart|panel)|first set of bars/i.test(v), 'no positional figure refs (en)'));
// empty strings (unit_en) must render as empty, not fall back to the key
const I = require(path.join(dir, 'i18n.js'));
if (I.t) ['zh', 'en'].forEach(l => { I.setLang && I.setLang(l); ok(I.t('unit_en') === '', 't(unit_en) empty in ' + l); });
const i18nSrc = fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8');
ok(!/STRINGS\[lang\]\[key\]\)\s*\|\|/.test(i18nSrc), 't() does not treat empty string as missing');
console.log(`periodic-trends core: ${checks} checks passed`);
