'use strict';
// Division & remainders lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every count, hop, verdict and weekday on the page is computed here; tests/core.cjs pins the claims.
// Scope: whole numbers only — dividend N ≥ 0, divisor d ≥ 1. Quotient q and remainder r satisfy
// N = d × q + r with 0 ≤ r < d (the "check identity"); for each N, d there is exactly one such pair.
(function (root) {
  function divmod(N, d) {
    if (!(Number.isInteger(N) && Number.isInteger(d) && N >= 0 && d >= 1)) throw new Error('divmod needs whole N ≥ 0 and d ≥ 1');
    const q = Math.floor(N / d);
    return { q, r: N - d * q };
  }

  // Step 0: dealing one at a time, round by round. Cookie i (0-based) goes to person i % d in round
  // floor(i / d) — but only while a whole round can still be dealt, i.e. i < q·d. The last r stay in the pile.
  function deal(N, d) {
    const { q, r } = divmod(N, d), moves = [];
    for (let i = 0; i < q * d; i++) moves.push({ i, person: i % d, round: Math.floor(i / d) });
    return { q, r, moves };
  }
  // State after the first `dealt` cookies have been handed out.
  function dealState(N, d, dealt) {
    const { q } = divmod(N, d), n = Math.max(0, Math.min(dealt, q * d));
    const plates = Array.from({ length: d }, (_, p) => Math.floor(n / d) + (p < n % d ? 1 : 0));
    const pile = N - n, roundsDone = Math.floor(n / d);
    return { dealt: n, plates, pile, roundsDone, finished: n === q * d, canDealRound: pile >= d };
  }

  // Step 1: try "everyone gets q". Uses q·d; what is left decides whether sharing is finished.
  function tryShare(N, d, q) {
    const left = N - q * d;
    const status = left < 0 ? 'short' : left >= d ? 'more' : 'done';
    return { used: q * d, left, status };
  }

  // Step 2: hops of length d from 0 along the number line, as far as N allows.
  function hops(N, d) {
    const { q, r } = divmod(N, d), lands = [];
    for (let j = 0; j <= q; j++) lands.push(j * d);
    return { q, r, lands, last: q * d, next: (q + 1) * d };
  }

  // Step 3: check a claimed answer N ÷ d = q …… r with both conditions.
  function check(N, d, q, r) {
    const back = d * q + r;
    return { back, identity: back === N, small: r >= 0 && r < d, ok: back === N && r >= 0 && r < d };
  }
  // Three claimed answers for N ÷ d: the right one, one that passes the identity but leaves r ≥ d
  // (or, when q = 0, one that fails the identity), and one that fails the identity. Order depends on N, d.
  function candidates(N, d) {
    const { q, r } = divmod(N, d);
    const right = { q, r, kind: 'right' };
    const big = q >= 1 ? { q: q - 1, r: r + d, kind: 'big' } : { q: q + 1, r, kind: 'off' };
    const off = r >= 1 ? { q, r: r - 1, kind: 'off' } : { q, r: r + 1, kind: 'off' };
    const list = [right, big, off], s = (N * 7 + d * 3) % 3;
    return list.slice(s).concat(list.slice(0, s));
  }

  // Step 4: weekdays. 0 = Monday … 6 = Sunday. D days after weekday `start`.
  function weekdayAfter(start, D) {
    const { q, r } = divmod(D, 7);
    return { q, r, day: (start + r) % 7 };
  }

  // Step 5: the same division, two questions. Boats (everyone must ride): round up. Notebooks (only
  // whole ones can be bought): the quotient, leftover money is r.
  function boats(N, d) { const { q, r } = divmod(N, d); return { q, r, need: q + (r > 0 ? 1 : 0), lastBoat: r }; }
  function notebooks(N, d) { const { q, r } = divmod(N, d); return { q, r, buy: q, change: r }; }

  // Step 6 quiz.
  const QUIZ = {
    q1: { N: 29, d: 6, options: [{ q: 3, r: 11 }, { q: 4, r: 5 }, { q: 5, r: 1 }] },
    q2: { d: 7, q: 8, r: 3, options: [63, 56, 59] },
    q3: { start: 4, D: 30, options: [5, 0, 6] } // start = Friday; options are weekday indices
  };
  function quizAnswers() {
    const a1 = QUIZ.q1.options.findIndex(o => check(QUIZ.q1.N, QUIZ.q1.d, o.q, o.r).ok);
    const a2 = QUIZ.q2.options.indexOf(QUIZ.q2.d * QUIZ.q2.q + QUIZ.q2.r);
    const a3 = QUIZ.q3.options.indexOf(weekdayAfter(QUIZ.q3.start, QUIZ.q3.D).day);
    return [a1, a2, a3];
  }

  const api = { divmod, deal, dealState, tryShare, hops, check, candidates, weekdayAfter, boats, notebooks, QUIZ, quizAnswers };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DIV_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
