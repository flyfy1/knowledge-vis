'use strict';
// Place value (Claude Code edition) — pure model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Digits, carries and comparisons are all computed here; the page never writes a numeric result by hand.
(function (root) {
  const PLACES = 4; // thousands, hundreds, tens, ones on the counting frame (0..9999)
  const POW = [1000, 100, 10, 1];

  // digits(247) → [0, 2, 4, 7] (highest place first)
  function digits(n, places = PLACES) { const d = []; for (let i = places - 1; i >= 0; i--) d.push(Math.floor(n / Math.pow(10, i)) % 10); return d; }
  function value(d) { return d.reduce((s, v) => s * 10 + v, 0); }

  // Step 0: bundling sticks. stage 0 loose, 1 tens tied, 2 tens and hundreds tied.
  function bundle(N, stage) {
    if (stage === 0) return { hundreds: 0, tens: 0, ones: N };
    if (stage === 1) return { hundreds: 0, tens: Math.floor(N / 10), ones: N % 10 };
    return { hundreds: Math.floor(N / 100), tens: Math.floor(N / 10) % 10, ones: N % 10 };
  }
  // Partial tying for the animation: k bundles of ten tied so far (stage 0 → 1), or k big bundles (1 → 2).
  function partial(N, from, k) {
    const b = bundle(N, from);
    if (from === 0) return { hundreds: 0, tens: k, ones: N - 10 * k };
    return { hundreds: k, tens: b.tens - 10 * k, ones: b.ones };
  }

  // Step 2: add one on the frame. A column reaching 10 is cleared and passes one bead left (carry).
  function addOne(d) {
    const out = d.slice(), carried = [];
    let i = out.length - 1;
    out[i] += 1;
    while (i >= 0 && out[i] === 10) { out[i] = 0; carried.push(i); if (i === 0) return { digits: d.slice(), carried: [], overflow: true }; out[i - 1] += 1; i--; }
    return { digits: out, carried, overflow: false };
  }
  // Count `steps` times from `start`; record each number and which columns carried.
  function countFrom(start, steps) {
    let d = digits(start); const seq = [];
    for (let s = 0; s < steps; s++) { const r = addOne(d); if (r.overflow) { seq.push({ n: value(d), carried: [], overflow: true }); break; } d = r.digits; seq.push({ n: value(d), carried: r.carried, overflow: false }); }
    return seq;
  }

  // Step 3: the same digit in different places. place index 0 = ones.
  const placeValue = (d, place) => d * Math.pow(10, place);

  // Step 4: dropping a zero in the tens place shifts the hundreds digit one place right.
  function dropZero(h, t, o) {
    const right = h * 100 + t * 10 + o;
    if (t !== 0) return { right, wrong: null, diff: null, allowed: false };
    const wrong = h * 10 + o;
    return { right, wrong, diff: right - wrong, allowed: true };
  }

  // Step 5: compare from the highest place; returns the first place (0 = hundreds for 3 places) that differs.
  function compare(a, b, places = 3) {
    const da = digits(a, places), db = digits(b, places);
    for (let i = 0; i < places; i++) if (da[i] !== db[i]) return { place: i, sign: da[i] > db[i] ? 1 : -1, da, db };
    return { place: -1, sign: 0, da, db };
  }
  // Largest amount all places below `place` can hold (e.g. below hundreds: 99).
  const maxBelow = (place, places = 3) => Math.pow(10, places - 1 - place) - 1;

  // Step 6: ×10 and ×100 shift every digit left and fill the ones with 0.
  const times = (n, k) => n * Math.pow(10, k);

  const api = { PLACES, POW, digits, value, bundle, partial, addOne, countFrom, placeValue, dropZero, compare, maxBelow, times };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PV_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
