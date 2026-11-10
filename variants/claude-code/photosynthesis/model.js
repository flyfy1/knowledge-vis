'use strict';
// Photosynthesis (Claude Code edition) — pure model shared by the page and node tests.
// Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Contents: formula parsing and the atom ledger, molar-mass bookkeeping, a Blackman-style
// limiting-factor rate model (gross = min(light term, CO2 term)), constant respiration, the lamp
// inverse-square rule, a bubble-count mapping (illustrative), and a 24-hour integration.
(function (root) {

/* ---------- atoms and formulas ---------- */
const MASS = { C: 12, H: 1, O: 16 };   // whole-number atomic masses used in school chemistry
function parse(formula) {               // 'C6H12O6' → {C:6,H:12,O:6}
  const out = {}; const re = /([A-Z][a-z]?)(\d*)/g; let m;
  while ((m = re.exec(formula))) { if (!m[1]) continue; out[m[1]] = (out[m[1]] || 0) + (m[2] ? Number(m[2]) : 1); }
  return out;
}
const molarMass = f => Object.entries(parse(f)).reduce((s, [el, n]) => s + MASS[el] * n, 0);
// side = [[coef, formula], ...] → atom counts
function countSide(side) { const c = { C: 0, H: 0, O: 0 }; side.forEach(([k, f]) => { const p = parse(f); Object.keys(p).forEach(el => { c[el] = (c[el] || 0) + k * p[el]; }); }); return c; }
function ledger(a, b, d) {               // a CO2 + b H2O → 1 C6H12O6 + d O2
  const left = countSide([[a, 'CO2'], [b, 'H2O']]), right = countSide([[1, 'C6H12O6'], [d, 'O2']]);
  const balanced = ['C', 'H', 'O'].every(el => left[el] === right[el]);
  return { left, right, balanced };
}
const BALANCED = { a: 6, b: 6, d: 6 };
const COEF_MAX = 12;

/* ---------- step 2: where the mass comes from ---------- */
// Per 1 C6H12O6: carbon and the sugar's oxygen come from CO2; hydrogen from water.
function massBook(sugarGrams) {
  const mol = sugarGrams / molarMass('C6H12O6');
  const co2 = 6 * mol * molarMass('CO2'), water = 6 * mol * molarMass('H2O'), o2 = 6 * mol * molarMass('O2');
  const fromCO2 = mol * (6 * MASS.C + 6 * MASS.O), fromWater = mol * 12 * MASS.H;
  return { mol, co2, water, o2, sugar: sugarGrams, fromCO2, fromWater, shareCO2: sugarGrams ? fromCO2 / sugarGrams : 0 };
}
// van Helmont's willow (published 1648): 5 lb seedling → 169 lb 3 oz after five years; soil lost about 2 oz.
const HELMONT = { startKg: 2.27, endKg: 76.74, soilLossG: 57, years: 5 };

/* ---------- rate model (illustrative units) ---------- */
const RATE = {
  aLight: 0.12,          // gross rate per % of full sunlight when light is the scarcest input
  bCO2: 6 / 420,         // gross rate per ppm CO2 when CO2 is the scarcest input (6 at today's air)
  resp: 1,               // respiration, same day and night
  airCO2: 420,           // ppm, outdoor air in the 2020s
  bubblesPerUnit: 3      // bubbles per minute per unit of net rate (illustrative mapping)
};
const lightTerm = I => RATE.aLight * I;
const co2Term = C => RATE.bCO2 * C;
function rate(I, C) {
  const L = lightTerm(I), K = co2Term(C), gross = Math.min(L, K);
  const limit = Math.abs(L - K) < 1e-9 ? 'both' : L < K ? 'light' : 'co2';
  return { L, K, gross, resp: RATE.resp, net: gross - RATE.resp, limit };
}
const bubbles = (I, C) => Math.max(0, Math.round(RATE.bubblesPerUnit * rate(I, C).net));
const saturationLight = C => co2Term(C) / RATE.aLight;              // light % where the CO2 plank takes over
const compensationLight = C => (co2Term(C) <= RATE.resp ? Infinity : RATE.resp / RATE.aLight);
// Gain from a small push on each input (step 4 readout): Δgross for +10 % light and +100 ppm CO2.
function marginal(I, C) {
  const g = rate(I, C).gross;
  return { light: rate(Math.min(100, I + 10), C).gross - g, co2: rate(I, Math.min(1200, C + 100)).gross - g };
}

/* ---------- step 0: lamp distance ---------- */
const LAMP = { refCm: 20, minCm: 20, maxCm: 100 };                    // 100 % at 20 cm
const lightFromDistance = d => 100 * Math.pow(LAMP.refCm / d, 2);    // inverse-square, capped by the slider range

/* ---------- step 5: a day ---------- */
const sunAt = (h, cloud) => Math.max(0, Math.sin(Math.PI * (h - 6) / 12)) * 100 * (cloud ? 0.3 : 1);
function day(C, cloud, dt = 0.05) {
  const pts = []; let made = 0, used = 0, net = 0, posHours = 0;
  for (let i = 0; i <= Math.round(24 / dt); i++) {
    const h = i * dt, r = rate(sunAt(h, cloud), C);
    pts.push({ h, I: sunAt(h, cloud), gross: r.gross, net: r.net, cum: net });
    if (i < Math.round(24 / dt)) {  // left-Riemann step to the next point
      made += r.gross * dt; used += r.resp * dt; net += r.net * dt; if (r.net > 0) posHours += dt;
    }
  }
  pts[pts.length - 1].cum = net;
  return { pts, made, used, net, posHours };
}

const api = { MASS, parse, molarMass, countSide, ledger, BALANCED, COEF_MAX, massBook, HELMONT, RATE, lightTerm, co2Term, rate, bubbles, saturationLight, compensationLight, marginal, LAMP, lightFromDistance, sunAt, day };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.PHOTO_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
