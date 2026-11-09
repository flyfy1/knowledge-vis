'use strict';
// Thermodynamics (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg}: ${a} vs ${b}`);
const range = (a, b, s) => { const out = []; for (let v = a; v <= b + 1e-9; v += s) out.push(Math.round(v * 1e6) / 1e6); return out; };
const both = (frag, msg) => { for (const l of ['zh', 'en']) ok(Object.values(STRINGS[l]).some(s => s.includes(frag)), `${msg} (${l}: "${frag}")`); };
const gammas = Object.values(M.GAS);
// numeric ∫P dV along a function of V (Simpson)
const integ = (f, a, b, n = 2000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; };

// ---- constants quoted in the text ----
ok(M.N === 0.2 && M.R === 8.314, 'n and R'); both('0.2 mol', 'n quoted'); both('8.314', 'R quoted');
ok(M.A.V === 2 && M.A.P === 250, 'state A'); both('2 L', 'A volume quoted'); both('250 kPa', 'A pressure quoted');
ok(M.ADIA.V1 === 1.5 && M.ADIA.T1 === 400, 'step 3 start'); both('1.5 L', 'V1 quoted'); both('400 K', 'T1 quoted');
near(M.cv(M.GAS.mono), 12.471, 1e-4, 'Cv mono'); both('12.47', 'Cv mono quoted'); near(M.cv(M.GAS.di), 20.785, 1e-4, 'Cv di'); both('20.79', 'Cv di quoted');
ok(M.CYCLE.V1 === 1, 'cycle start volume 1 L');

// ---- step 0: PV = nRT; axes hold every slider state ----
for (const V of range(1, 6, 0.1)) for (const T of range(200, 600, 10)) {
  const P = M.pressure(T, V);
  near(P * V, M.N * M.R * T, 1e-12, 'PV = nRT'); near(M.temp(P, V), T, 1e-12, 'inverse');
  ok(P <= 1080, 'P inside 0–1080 kPa axis');
}
near(M.pressure(300, 4), M.pressure(300, 2) / 2, 1e-12, 'double V, half P');

// ---- step 1: work is area; paths differ ----
for (const VB of range(1, 6, 0.5)) for (const PB of range(50, 300, 10)) for (const g of gammas) {
  const B = { V: VB, P: PB }, p = M.paths(B, g);
  for (const k of ['pv', 'vp', 'line']) {
    near(M.workAlong(p[k].pts, 1), p[k].W, 1e-9, 'W along polyline = closed form');
    near(p[k].Q, p[k].dU + p[k].W, 1e-12, 'first law');
    const end = M.along(p[k].pts, 1); near(end.V, VB, 1e-12, 'ends at B'); near(end.P, PB, 1e-12, 'ends at B');
    // the walked work is monotone along a path that only expands (or only compresses)
    let prev = 0; for (let f = 0.05; f <= 1.0001; f += 0.05) { const w = M.workAlong(p[k].pts, f); ok(VB >= 2 ? w >= prev - 1e-9 : w <= prev + 1e-9, 'work accumulates in one direction'); prev = w; }
  }
  near(p.pv.dU, p.vp.dU, 1e-12, 'ΔU same on all paths'); near(p.line.dU, p.pv.dU, 1e-12, 'ΔU same on all paths');
  near(p.pv.dU, M.U(M.temp(PB, VB), g) - M.U(M.temp(250, 2), g), 1e-9, 'ΔU = U(B) − U(A)');
  // "the path that does more work also takes in more heat"
  ok((p.pv.W - p.vp.W) * (p.pv.Q - p.vp.Q) >= -1e-9, 'more W ⇔ more Q');
  if (VB !== 2 && PB !== 250) ok(Math.abs(p.pv.W - p.vp.W) > 1, 'paths differ in W');
  ok(Math.max(PB, 250) <= 330, 'inside the 0–330 kPa axis');
  if (VB < 2) ok(p.pv.W < 0 && p.vp.W < 0 && p.line.W < 0, 'compression: negative work');
  if (VB === 2) ok(p.pv.W === 0 && p.vp.W === 0, 'no volume change, no work');
}
// default B (5 L, 120 kPa): works 750 / 360 / 555 J and a non-zero ΔU (T rises from 300.7 K to 360.8 K)
{ const p = M.paths({ V: 5, P: 120 }, M.GAS.mono); near(p.pv.W, 750, 1e-12, 'W1'); near(p.vp.W, 360, 1e-12, 'W2'); near(p.line.W, 555, 1e-12, 'W3'); ok(p.pv.dU > 100, 'default ΔU visibly non-zero'); }

// ---- step 3: isothermal vs adiabatic ----
for (const g of gammas) for (const V2 of range(1, 6, 0.1)) {
  const r = M.isoAdia(V2, g);
  near(r.iso.W, integ(r.Piso, r.V1, V2), 1e-6, 'iso W = ∫P dV'); near(r.adia.W, integ(r.Padia, r.V1, V2), 1e-6, 'adia W = ∫P dV');
  near(r.adia.P2 * Math.pow(V2, g), r.P1 * Math.pow(r.V1, g), 1e-9, 'PV^γ const'); near(r.adia.T2 * Math.pow(V2, g - 1), r.T1 * Math.pow(r.V1, g - 1), 1e-9, 'TV^(γ−1) const');
  near(r.Padia(V2), r.adia.P2, 1e-9, 'curve meets end'); near(r.adia.P2, M.pressure(r.adia.T2, V2), 1e-9, 'adiabat end obeys PV = nRT');
  if (V2 > r.V1) { ok(r.adia.T2 < r.T1 && r.adia.W < r.iso.W && r.adia.P2 < r.iso.P2, 'expansion: adiabat cools, lower, less work'); }
  if (V2 < r.V1) { ok(r.adia.T2 > r.T1 && r.iso.W < 0 && r.adia.W < 0, 'compression: adiabat heats, W < 0'); }
  ok(r.adia.T2 <= 640 && Math.max(r.Padia(1), r.Piso(1)) >= r.adia.P2 - 1e-9, 'axes hold');
}
// larger γ cools more
for (const V2 of range(1.6, 6, 0.1)) ok(M.isoAdia(V2, M.GAS.mono).adia.T2 < M.isoAdia(V2, M.GAS.di).adia.T2, 'larger γ cools more');

// ---- step 4: Carnot efficiency = 1 − Tc/Th for every r and gas ----
for (const g of gammas) for (const Th of range(450, 800, 50)) for (const Tc of range(250, 400, 50)) for (const r of range(1.5, 4, 0.5)) {
  const c = M.carnot(Th, Tc, r, g);
  near(c.eta, 1 - Tc / Th, 1e-12, 'η = 1 − Tc/Th');
  // the loop closes: state after leg 4 = state 1; corners obey PV = nRT
  const s0 = c.at(0), s4 = c.at(4); near(s4.V, s0.V, 1e-9, 'loop closes V'); near(s4.P, s0.P, 1e-9, 'loop closes P');
  near(c.at(2).T, Tc, 1e-9, 'leg 2 ends at Tc'); near(c.at(1).T, Th, 1e-9, 'leg 1 ends at Th');
  // enclosed area (shoelace on a fine polyline) = W
  let A = 0; const n = 4000; for (let i = 0; i < n; i++) { const p = c.at(4 * i / n), q = c.at(4 * (i + 1) / n); A += (q.V - p.V) * (q.P + p.P) / 2; }
  near(A, c.W, 2e-3, 'area = W');
  // running ledger ends at the full values and is monotone where the text says
  const L = c.ledger(4); near(L.qin, c.Qh, 1e-9, 'ledger Qh'); near(L.qout, c.Qc, 1e-9, 'ledger Qc'); near(L.W, c.W, 1e-9, 'ledger W');
  let prev = c.ledger(0);
  for (let s = 0.02; s <= 4.0001; s += 0.02) {
    const q = c.ledger(Math.min(4, s)), leg = Math.min(3, Math.floor(Math.min(4, s) - 1e-9));
    if (leg !== 0) ok(Math.abs(q.qin - prev.qin) < 1e-9 || s < 1.02, 'heat in only on leg ①');
    if (leg !== 2) ok(Math.abs(q.qout - prev.qout) < 1e-9 || (s > 2 && s < 3.02), 'heat out only on leg ③');
    if (leg <= 1) ok(q.W >= prev.W - 1e-9, 'W grows while expanding'); else ok(q.W <= prev.W + 1e-9, 'W shrinks while compressing');
    prev = q;
  }
}
// default: Th 600, Tc 300, r 2 → η = 0.5
near(M.carnot(600, 300, 2, M.GAS.mono).eta, 0.5, 1e-12, 'default η');

// ---- step 5: Stirling below Carnot unless regenerated ----
for (const g of gammas) for (const Th of range(450, 800, 50)) for (const Tc of range(250, 400, 50)) {
  let prev = -1;
  for (const r of range(1.5, 4, 0.1)) {
    const s = M.stirling(Th, Tc, r, g, false), sr = M.stirling(Th, Tc, r, g, true);
    ok(s.eta < s.etaC - 1e-6, 'no regenerator: below Carnot'); near(sr.eta, sr.etaC, 1e-12, 'ideal regenerator: equals Carnot');
    ok(s.eta > prev, 'η rises with r'); prev = s.eta;
    near(s.Qin - s.Qout, s.W, 1e-9, 'books balance');
    near(s.W, M.carnot(Th, Tc, r, g).W, 1e-9, 'Stirling and Carnot loops enclose the same area (s5hint)');
    // W = enclosed area of two isotherms joined by verticals
    near(s.W, integ(V => M.pressure(Th, V), 1, r) - integ(V => M.pressure(Tc, V), 1, r), 1e-6, 'Stirling W = area');
    ok(s.eta >= 0 && s.eta <= 1.04, 'inside η axis');
  }
}

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
const NEUTRAL = new Set(['formula']);
for (const k of zk) ok(NEUTRAL.has(k) || STRINGS.zh[k] !== STRINGS.en[k], 'zh text differs from en for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');

// ---- every key referenced in HTML/app exists ----
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const k of ['pathPVShort', 'pathVPShort', 'pathLineShort', 'gasMonoShort', 'gasDiShort', 'leg0', 'leg1', 'leg2', 'leg3', 'q2Right', 'q2Wrong', 'q3Right', 'q3Wrong', 'pick', 'dirOut', 'dirIn', 'dirZero']) ok(STRINGS.zh[k] !== undefined, 'dynamic key ' + k);
for (const m of html.matchAll(/data-quiz="(q\d)"/g)) ok(STRINGS.zh[m[1] + 'Right'] && STRINGS.zh[m[1] + 'Wrong'], 'quiz feedback ' + m[1]);
for (const id of ['v0', 't0', 'clear0', 'pathPV', 'pathVP', 'pathLine', 'vb1', 'pb1', 'play1', 'v3', 'th4', 'tc4', 'ratio4', 'play4', 'r4', 'regenOff', 'regenOn', 'check2', 'check3']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(html.includes('<!-- page-provenance -->') && html.includes('../../../page-provenance.css'), 'provenance placeholder + css');
ok(!html.includes('canvas-label-guard'), 'no label guard');
{ const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]); ok(new Set(ids).size === ids.length, 'element ids are unique'); }

// ---- deep links ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  if (h.startsWith('#')) continue;
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../physics/thermal/thermodynamics/index.html')), 'comparison link target exists');
for (let i = 0; i <= 6; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS thermodynamics core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links`);
