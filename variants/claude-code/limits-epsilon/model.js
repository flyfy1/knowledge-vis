'use strict';
// Limits and ε–δ model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every curve, band, best δ, witness and N on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  // Step 0: f(x) = (x² − 1)/(x − 1), undefined at x = 1, limit 2. Computed literally (no cancelling),
  // so tests can check the floating-point error stays far below the displayed digits on the slider range.
  const hole = x => (x * x - 1) / (x - 1);

  // Steps 1–2: f(x) = x², a ≥ 0, L = a². The largest δ that wins against ε:
  // on (a − δ, a + δ) the worst |x² − a²| is on the right, 2aδ + δ², so δ* solves 2aδ + δ² = ε.
  const bestDelta = (a, eps) => Math.sqrt(a * a + eps) - a;
  // Worst error |x² − a²| over the open interval 0 < |x − a| < δ (a supremum, approached at x → a + δ).
  function worstSq(a, d) {
    const right = 2 * a * d + d * d;
    const left = d <= a ? 2 * a * d - d * d : a * a;
    return Math.max(right, left);
  }
  // A δ wins when every x with 0 < |x − a| < δ has |x² − a²| < ε. The worst error is a supremum that is
  // not attained on the open interval, so δ wins exactly when worstSq ≤ ε (δ = δ* itself wins).
  const wins = (a, eps, d) => worstSq(a, d) <= eps + 1e-12;

  // Step 3: four functions near 0. 'exists' has limit 0; the other three have no limit at 0.
  const F3 = {
    jump: x => (x > 0 ? 1 : -1),
    osc: x => Math.sin(1 / x),
    blow: x => 1 / (x * x),
    damped: x => x * Math.sin(1 / x)
  };
  // A witness against the claim "lim f = L" for this ε and δ: some 0 < |x| < δ with |f(x) − L| ≥ ε.
  // Returns { x, fx } or null; 'proof' says whether "no witness" is guaranteed by an inequality.
  function witness(kind, L, eps, d) {
    const f = F3[kind], bad = x => Math.abs(f(x) - L) >= eps;
    const pickWorst = xs => { let best = null; for (const x of xs) if (Math.abs(x) < d && x !== 0 && bad(x) && (!best || Math.abs(f(x) - L) > Math.abs(f(best) - L))) best = x; return best; };
    let x = null;
    if (kind === 'jump') x = pickWorst([d / 2, -d / 2]);
    else if (kind === 'osc') {
      // peaks: sin(1/x) = 1 at 1/x = π/2 + 2πk, troughs: −1 at 3π/2 + 2πk; take the first k with x < δ
      const k1 = Math.max(0, Math.ceil((1 / d - Math.PI / 2) / (2 * Math.PI)) + 1), k2 = Math.max(0, Math.ceil((1 / d - 1.5 * Math.PI) / (2 * Math.PI)) + 1);
      x = pickWorst([1 / (Math.PI / 2 + 2 * Math.PI * k1), 1 / (1.5 * Math.PI + 2 * Math.PI * k2)]);
    } else if (kind === 'blow') x = pickWorst([Math.min(d / 2, 1 / Math.sqrt(Math.abs(L) + eps + 1))]);
    else {
      // damped: |x sin(1/x) − L| ≤ |x| + |L| < δ + |L|, so δ ≤ ε − |L| guarantees no witness.
      if (d <= eps - Math.abs(L)) return { x: null, proof: true };
      if (Math.abs(L) >= eps) {
        // a peak of x·sin(1/x) on the side away from L: |f(x) − L| = |L| + x > ε
        const off = L > 0 ? 1.5 * Math.PI : 0.5 * Math.PI, k = Math.max(0, Math.ceil((1 / d - off) / (2 * Math.PI)) + 1), xw = 1 / (off + 2 * Math.PI * k);
        return { x: xw, fx: f(xw), proof: false };
      }
      const xs = []; for (let i = 1; i <= 4000; i++) { const u = d * i / 4001; xs.push(u, -u); }
      x = pickWorst(xs);
    }
    return x === null ? { x: null, proof: false } : { x, fx: f(x), proof: false };
  }

  // Step 4: sequences and ε–N.
  const SEQ = {
    alt: { a: n => 1 + Math.pow(-1, n) * 2 / n, L: 1, bound: eps => Math.floor(2 / eps) + 1 },
    sin: { a: n => Math.sin(n) / Math.sqrt(n), L: 0, bound: eps => Math.floor(1 / (eps * eps)) + 1 },
    flip: { a: n => Math.pow(-1, n), L: 0, bound: null }
  };
  // Smallest N with |a_n − L| < ε for every n ≥ N, found by checking every term up to the guaranteed bound
  // (beyond it the inequality |a_n − L| ≤ 2/n or 1/√n already holds). For 'flip' and ε ≤ 1 there is none.
  function epsN(kind, eps) {
    const S = SEQ[kind];
    if (!S.bound) { let viol = 0; for (let n = 1; n <= 200; n++) if (Math.abs(S.a(n) - S.L) >= eps) viol++; return { N: viol ? null : 1, guaranteed: null, lastBad: viol ? Infinity : 0 }; }
    const G = S.bound(eps); let last = 0;
    for (let n = 1; n < G; n++) if (Math.abs(S.a(n) - S.L) >= eps) last = n;
    return { N: last + 1, guaranteed: G, lastBad: last };
  }

  // Step 5: δ rules for f(x) = x² at a = 2 (L = 4).
  const A5 = 2;
  const RULES = { q4: eps => eps / 4, q5: eps => eps / 5, min: eps => Math.min(1, eps / 5) };
  function ruleCheck(rule, eps) {
    const d = RULES[rule](eps), ds = bestDelta(A5, eps), ok = d <= ds * (1 + 1e-12);
    // counterexample strictly inside (2, 2 + δ) but beyond 2 + δ*
    const x = ok ? null : A5 + (d + ds) / 2;
    return { d, ds, ratio: d / ds, ok, x, err: x === null ? null : x * x - A5 * A5 };
  }

  const api = { hole, bestDelta, worstSq, wins, F3, witness, SEQ, epsN, A5, RULES, ruleCheck };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LIM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
