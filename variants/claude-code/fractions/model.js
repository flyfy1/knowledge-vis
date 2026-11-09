'use strict';
// Exact fraction arithmetic for the Claude Code edition of the fractions lesson.
// Everything is done with whole numbers (numerator/denominator pairs); floating point is used only to
// place points on a drawing. Author: Claude Code (claude-opus-5-5), 2026-11-09.
(function (root) {
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function frac(n, d) {
    if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error('bad fraction ' + n + '/' + d);
    return d < 0 ? { n: -n, d: -d } : { n, d };
  }
  function simplify(f) { const g = gcd(f.n, f.d) || 1; return { n: f.n / g, d: f.d / g, g }; }
  function isSimplest(f) { return gcd(f.n, f.d) === 1; }
  function value(f) { return f.n / f.d; } // drawing only
  function equal(f, g) { return f.n * g.d === g.n * f.d; }
  function compare(f, g) { return Math.sign(f.n * g.d - g.n * f.d); }
  // Multiply numerator and denominator by m: each part is cut into m smaller equal parts.
  function scale(f, m) { return { n: f.n * m, d: f.d * m }; }
  // Rewrite two fractions over their least common denominator.
  function common(f, g) {
    const L = lcm(f.d, g.d);
    return { L, f: scale(f, L / f.d), g: scale(g, L / g.d) };
  }
  function add(f, g) {
    const c = common(f, g), raw = { n: c.f.n + c.g.n, d: c.L };
    return { L: c.L, f: c.f, g: c.g, raw, simplest: simplify(raw) };
  }
  function sub(f, g) { const c = common(f, g); return simplify({ n: c.f.n - c.g.n, d: c.L }); }
  // The tempting wrong sum (a+c)/(b+d) (the "mediant").
  function mediant(f, g) { return { n: f.n + g.n, d: f.d + g.d }; }
  // a/b = q whole bars and r parts left over, with 0 ≤ r < b (division with remainder).
  function toMixed(f) { const q = Math.floor(f.n / f.d); return { q, r: f.n - q * f.d, d: f.d }; }
  function kind(f) { return f.n < f.d ? 'proper' : f.n % f.d === 0 ? 'whole' : 'improper'; }

  // Step 0: a bar cut into b parts of unequal length. Part i (0-based) has weight (i mod 3) + 1.
  // Returns the cut positions as exact fractions of the whole and the true share of the first a parts.
  function unevenCuts(b) {
    const w = Array.from({ length: b }, (_, i) => (i % 3) + 1), total = w.reduce((s, x) => s + x, 0);
    const cuts = [{ n: 0, d: total }]; let acc = 0;
    for (const x of w) { acc += x; cuts.push({ n: acc, d: total }); }
    return { weights: w, total, cuts };
  }
  function unevenShare(a, b) { const u = unevenCuts(b); return simplify(u.cuts[a]); }

  // Long division of a/b (0 ≤ a < b), one digit at a time.
  // Each step: remainder r → 10r; digit = floor(10r / b); next remainder = 10r mod b.
  // Stops when the remainder becomes 0 (terminating) or a remainder repeats (repeating).
  function longDivision(a, b) {
    if (!(a >= 0 && a < b)) throw new Error('need 0 ≤ a < b');
    const steps = [], seen = new Map([[a, 0]]);
    let r = a;
    while (true) {
      const r10 = r * 10, digit = Math.floor(r10 / b), next = r10 % b;
      steps.push({ r, r10, digit, next });
      if (next === 0) return { a, b, steps, terminates: true, repeatFrom: -1, cycle: '', prefix: steps.map(s => s.digit).join('') };
      if (seen.has(next)) {
        const from = seen.get(next), ds = steps.map(s => s.digit).join('');
        return { a, b, steps, terminates: false, repeatFrom: from, repeatRem: next, prefix: ds.slice(0, from), cycle: ds.slice(from) };
      }
      seen.set(next, steps.length);
      r = next;
    }
  }
  // Text of the decimal: "0.375", or "0.1666…" with the repeating block shown at least twice and
  // at least three repeating digits.
  function decimalText(ld) {
    if (ld.terminates) return '0.' + ld.prefix;
    const reps = Math.max(2, Math.ceil(3 / ld.cycle.length));
    return '0.' + ld.prefix + ld.cycle.repeat(reps) + '…';
  }
  // The first k digits after the point (k may exceed the computed steps for repeating decimals).
  function digits(ld, k) {
    if (ld.terminates) return (ld.prefix + '0'.repeat(k)).slice(0, k);
    let s = ld.prefix; while (s.length < k + 1) s += ld.cycle; return s.slice(0, k);
  }
  // a/b rounded to k decimal places, computed exactly with integers (half up), as text.
  function rounded(a, b, k) {
    const p = 10 ** k, q = Math.floor((2 * a * p + b) / (2 * b)); // round(a·p / b)
    const s = String(q).padStart(k + 1, '0');
    return s.slice(0, s.length - k) + '.' + s.slice(-k);
  }
  // Rule checked against long division in the tests: a fraction in simplest form gives a terminating
  // decimal exactly when its denominator has no prime factor other than 2 and 5.
  function onlyTwosAndFives(d) { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; }
  function terminatesByRule(a, b) { return onlyTwosAndFives(simplify({ n: a, d: b }).d); }

  const api = { gcd, lcm, frac, simplify, isSimplest, value, equal, compare, scale, common, add, sub, mediant, toMixed, kind, unevenCuts, unevenShare, longDivision, decimalText, digits, rounded, terminatesByRule, onlyTwosAndFives };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FRAC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
