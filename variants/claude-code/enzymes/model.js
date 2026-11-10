'use strict';
// Enzymes lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.ENZ_MODEL) and node tests (module.exports).
(function (root) {

const R = 8.314;               // J/(mol·K)
const BODY_K = 310.15;          // 37 °C
const K = c => c + 273.15;

/* ---------- step 0: lowering the barrier ---------- */
const A_FACTOR = 1e13;          // s⁻¹, illustrative pre-exponential factor (one molecule's attempt rate)
const rateK = (Ea_kJ, Tk = BODY_K) => A_FACTOR * Math.exp(-Ea_kJ * 1000 / (R * Tk));
const halfLife = (Ea_kJ, Tk = BODY_K) => Math.LN2 / rateK(Ea_kJ, Tk);
const speedUp = (dEa_kJ, Tk = BODY_K) => Math.exp(dEa_kJ * 1000 / (R * Tk));
// Energy profile along the reaction coordinate x ∈ [0, 1]: reactants at 0, products at dG, one hump of height Ea.
function profile(x, Ea, dG) {
  const base = dG * (1 / (1 + Math.exp(-(x - 0.5) * 14)));
  const hump = Math.exp(-Math.pow((x - 0.5) / 0.12, 2));
  return base + hump * (Ea - dG * 0.5);
}
// Time unit choice for readouts: returns { v, unit } with unit ∈ ns us ms s min h d y
function timeUnit(sec) {
  if (sec < 1e-6) return { v: sec * 1e9, unit: 'ns' };
  if (sec < 1e-3) return { v: sec * 1e6, unit: 'us' };
  if (sec < 1) return { v: sec * 1000, unit: 'ms' };
  if (sec < 120) return { v: sec, unit: 's' };
  if (sec < 7200) return { v: sec / 60, unit: 'min' };
  if (sec < 172800) return { v: sec / 3600, unit: 'h' };
  if (sec < 2 * 365.25 * 86400) return { v: sec / 86400, unit: 'd' };
  return { v: sec / (365.25 * 86400), unit: 'y' };
}

/* ---------- step 1: shape match and reuse ---------- */
const POCKET = 'square';
const SHAPES = ['square', 'circle', 'triangle'];
// One enzyme molecule, `attempts` substrate molecules arriving one after another.
function encounters(shape, attempts) {
  const fits = shape === POCKET;
  return { fits, products: fits ? 2 * attempts : 0, converted: fits ? attempts : 0, enzymes: 1 };
}
const CARBONIC_ANHYDRASE_KCAT = 6e5; // s⁻¹, textbook turnover number (Berg, Biochemistry)

/* ---------- step 2: saturation (Michaelis–Menten) ---------- */
const VMAX_PER_E = 100;         // relative units per unit of enzyme
const mm = (S, Km, Vmax) => Vmax * S / (Km + S);
const occupied = (S, Km) => S / (Km + S);

/* ---------- step 3: temperature ---------- */
const TEMP = { Ea: 50, Tm: 47, w: 2.5 }; // kJ/mol for the catalysed step; unfolding midpoint (°C) and width (°C)
const folded = Tc => 1 / (1 + Math.exp((Tc - TEMP.Tm) / TEMP.w));
const arrh = Tc => Math.exp(-TEMP.Ea * 1000 / R * (1 / K(Tc) - 1 / BODY_K)); // speed relative to 37 °C, all folded
const rawActivity = Tc => arrh(Tc) * folded(Tc);
let _opt = null;
function optimum() {
  if (_opt) return _opt;
  let best = { T: 0, a: -1 };
  for (let i = 0; i <= 8000; i++) { const T = i / 100, a = rawActivity(T); if (a > best.a) best = { T, a }; }
  return (_opt = best);
}
const activity = Tc => rawActivity(Tc) / optimum().a;          // fraction of the best possible
// Hold at Tmax long enough to reach the folded/unfolded balance, then cool to 37 °C. Unfolded molecules clump and
// never refold (irreversible), so the activity at 37 °C keeps only the fraction that stayed folded.
const afterCooling = Tmax => activity(37) * Math.min(1, folded(Tmax) / folded(37));
const q10 = Tc => arrh(Tc + 10) / arrh(Tc);

/* ---------- step 4: pH ---------- */
// Two ionisable groups in the active site: one must be deprotonated (pK1), one protonated (pK2).
const PH_ENZ = {
  pepsin: { pK1: 1.0, pK2: 3.0 },
  amylase: { pK1: 5.8, pK2: 7.8 },
  trypsin: { pK1: 7.0, pK2: 9.0 }
};
const PLACES = { stomach: 2, mouth: 6.8, intestine: 8 };
const phRaw = (pH, e) => 1 / (1 + Math.pow(10, e.pK1 - pH) + Math.pow(10, pH - e.pK2));
const phActivity = (pH, name) => { const e = PH_ENZ[name]; return phRaw(pH, e) / phRaw((e.pK1 + e.pK2) / 2, e); };
const phOptimum = name => (PH_ENZ[name].pK1 + PH_ENZ[name].pK2) / 2;

/* ---------- step 5: inhibitors ---------- */
const INH = { Vmax: 100, Km: 2, Ki: 1 }; // relative rate, mM, mM
function inhibited(type, S, I) {
  const a = 1 + I / INH.Ki;
  if (type === 'comp') return { v: INH.Vmax * S / (INH.Km * a + S), Vapp: INH.Vmax, Kapp: INH.Km * a };
  return { v: INH.Vmax / a * S / (INH.Km + S), Vapp: INH.Vmax / a, Kapp: INH.Km };
}
// Share of enzyme molecules in each state. Rate ∝ share holding substrate without inhibitor (ES).
function states(type, S, I) {
  const s = S / INH.Km, i = I / INH.Ki;
  if (type === 'comp') { const z = 1 + s + i; return { E: 1 / z, ES: s / z, EI: i / z, ESI: 0 }; }
  const z = (1 + s) * (1 + i); return { E: 1 / z, ES: s / z, EI: i / z, ESI: s * i / z };
}
// Round shares to n icons (largest remainder), keeping the order E, ES, EI, ESI.
function iconCounts(st, n = 20) {
  const keys = ['E', 'ES', 'EI', 'ESI'], raw = keys.map(k => st[k] * n), base = raw.map(Math.floor);
  let left = n - base.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - base[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { base[i]++; left--; } });
  const out = {}; keys.forEach((k, i) => { out[k] = base[i]; }); return out;
}
const uninhibited = S => INH.Vmax * S / (INH.Km + S);
// [S] at which the inhibited rate gets back to `frac` of the uninhibited rate at the same [S]; Infinity if never.
function rescueS(type, I, frac) {
  const a = 1 + I / INH.Ki;
  if (type !== 'comp') return 1 / a >= frac ? 0 : Infinity;
  // (Km+S)/(Km a + S) = frac → S = Km (frac·a − 1)/(1 − frac)
  return Math.max(0, INH.Km * (frac * a - 1) / (1 - frac));
}

const api = { R, BODY_K, A_FACTOR, rateK, halfLife, speedUp, profile, timeUnit, POCKET, SHAPES, encounters, CARBONIC_ANHYDRASE_KCAT,
  VMAX_PER_E, mm, occupied, TEMP, folded, arrh, activity, optimum, afterCooling, q10, PH_ENZ, PLACES, phActivity, phOptimum,
  INH, inhibited, uninhibited, rescueS, states, iconCounts };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.ENZ_MODEL = api;
})(typeof window !== 'undefined' ? window : null);
