'use strict';
(function (root) {
  // Teaching presets: [s1, s2]. Expected answers are checked against an independent oracle in tests.
  const presets = [
    ['xcaxctat', 'cat'],
    ['axbcayb', 'ab'],
    ['abaab', 'aa'],
    ['abcabdbe', 'abe'],
    ['ta', 'at'],
    ['aaa', 'aaaa']
  ];
  const LIMITS = {s1: 20, s2: 6};

  function validate(s1, s2) {
    if (typeof s1 !== 'string' || typeof s2 !== 'string') return 'invalidType';
    if (!/^[a-z]+$/.test(s1) || !/^[a-z]+$/.test(s2)) return 'invalidLetters';
    if (s1.length > LIMITS.s1 || s2.length > LIMITS.s2) return 'invalidLength';
    return null;
  }

  // Brute force used in step 1: from every start, match s2 greedily to the right.
  function brute(s1, s2) {
    const rows = [];
    let best = null;
    for (let i = 0; i < s1.length; i++) {
      let k = 0, read = 0, end = null;
      for (let j = i; j < s1.length; j++) {
        read++;
        if (s1[j] === s2[k]) {
          k++;
          if (k === s2.length) { end = j; break; }
        }
      }
      rows.push({start: i, read, end});
      if (end !== null && (best === null || end - i + 1 < best.len)) best = {start: i, len: end - i + 1};
    }
    return {rows, best, totalRead: rows.reduce((a, r) => a + r.read, 0)};
  }

  // One frame per letter of s1. Each frame is a deep snapshot taken AFTER reading s1[j].
  function trace(s1, s2) {
    const error = validate(s1, s2);
    if (error) throw new Error(error);
    const m = s2.length;
    const latest = new Array(m + 1).fill(-1); // latest[0] unused
    let best = null;
    const history = [];
    const frames = [{type: 'init', j: -1, ch: null, latest: latest.slice(1), changes: [], candidate: null, improved: false, best: null, history: []}];
    for (let j = 0; j < s1.length; j++) {
      const ch = s1[j], changes = [];
      for (let k = m; k >= 1; k--) {
        if (s2[k - 1] === ch) {
          const next = k === 1 ? j : latest[k - 1];
          if (next !== latest[k]) changes.push({k, from: latest[k], to: next});
          latest[k] = next;
        }
      }
      let candidate = null, improved = false;
      if (latest[m] !== -1) {
        candidate = {start: latest[m], end: j, len: j - latest[m] + 1, fresh: changes.some(c => c.k === m)};
        if (best === null || candidate.len < best.len) { best = {start: candidate.start, end: j, len: candidate.len}; improved = true; }
        if (candidate.fresh) history.push({start: candidate.start, end: j, len: candidate.len, improved});
      }
      frames.push(JSON.parse(JSON.stringify({type: 'read', j, ch, latest: latest.slice(1), changes, candidate, improved, best, history})));
    }
    const answer = best ? s1.slice(best.start, best.start + best.len) : '';
    frames.push(JSON.parse(JSON.stringify({type: 'done', j: s1.length - 1, ch: null, latest: latest.slice(1), changes: [], candidate: null, improved: false, best, history, answer})));
    return {s1, s2, frames, answer};
  }

  function solve(s1, s2) { return trace(s1, s2).answer; }

  const api = {presets, LIMITS, validate, brute, trace, solve};
  root.Window727 = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
