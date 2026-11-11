'use strict';
// Public health core: SIR epidemic curve and test metrics (specs/public-health.md).
const assert = require('node:assert/strict');
const m = require('../app.js');
let checks = 0; const ok = (v, msg) => { assert.ok(v, msg); checks++; };

assert.equal(m.effectiveR(2, .25), 1.5); checks++;

// Regression for the old model: a pure exponential whose "peak" was the window's last day.
const base = m.epidemicSummary({ r0: 2.4, intervention: .1, days: 60 });
ok(base.peaked && base.peakDay > 0 && base.peakDay < 60, `default peak is inside the window, not its end (day ${base.peakDay})`);
const curve = m.epidemicCurve({ r0: 2.4, intervention: .1, days: 120 });
ok(curve.length === 121 && curve[120].cases < curve[base.peakDay].cases / 2, 'curve turns down after the peak');
ok(curve.every(p => Math.abs(p.s + p.i + p.r - m.SIR.population) < 1e-6 && p.s >= 0 && p.i >= 0), 'S + I + R = population, none negative');
const early = m.epidemicCurve({ r0: 3, intervention: .5, days: 20 });
ok(early.at(-1).cases > early[0].cases, 'Re = 1.5 grows at first');

// Fine sweep over the page's slider ranges (R0 0.8..4 step 0.1, intervention 0..0.8 step 0.05).
let outbreaks = 0, maxPeakGap = 0, maxFinalGap = 0;
for (let r0 = .8; r0 <= 4.0001; r0 += .1) {
  let prev = null;
  for (let iv = 0; iv <= .8001; iv += .05) {
    const s = m.epidemicSummary({ r0, intervention: iv, days: 60 });
    const re = m.effectiveR(r0, iv);
    if (re <= 1) {
      ok(!s.outbreak && s.peakDay === 0, `Re ${re.toFixed(2)} <= 1: no peak after day 0`);
    } else if (s.peaked) {
      outbreaks++;
      // The copy's claim: the peak is where S/N = 1/Re (herd-immunity threshold 1 - 1/Re).
      maxPeakGap = Math.max(maxPeakGap, Math.abs(s.susceptibleAtPeak - 1 / re));
      // Final-size relation of the SIR model, f = 1 - exp(-Re f) (initial cases are 0.01 %).
      if (s.finalShare > .01) maxFinalGap = Math.max(maxFinalGap, Math.abs(s.finalShare - (1 - Math.exp(-re * s.finalShare))));
      // More intervention: lower and later peak.
      if (prev && prev.peaked) ok(s.peakShare < prev.peakShare && s.peakDay >= prev.peakDay, `R0 ${r0.toFixed(1)} iv ${iv.toFixed(2)}: lower, later peak`);
    } else {
      ok(re < 1.1, `no peak within the horizon only for Re barely above 1 (Re ${re.toFixed(3)})`);
    }
    prev = s;
  }
}
ok(outbreaks > 300, `sweep covered ${outbreaks} outbreaks`);
ok(maxPeakGap < 1e-3, `S/N at peak = 1/Re within 0.001 (max gap ${maxPeakGap.toExponential(2)})`);
ok(maxFinalGap < 2e-3, `final size satisfies f = 1 - exp(-Re f) within 0.002 (max gap ${maxFinalGap.toExponential(2)})`);

const a = m.testMetrics({ prevalence: .05, sensitivity: .9, specificity: .92 });
const b = m.testMetrics({ prevalence: .2, sensitivity: .9, specificity: .92 });
ok(a.ppv < b.ppv, 'PPV rises with prevalence');
ok(a.npv < 1, 'NPV below 1');
console.log(`public-health core: ok (${checks} checks; peak gap ${maxPeakGap.toExponential(2)}, final-size gap ${maxFinalGap.toExponential(2)})`);
