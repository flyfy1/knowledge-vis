'use strict';
(function (root) {
  // A schedule is an array of employees; each employee is an array of [start, end] pairs.
  const presets = [
    [[[1, 3], [9, 10]], [[3, 5], [12, 14]], [[2, 4], [6, 7]]],
    [[[1, 10]], [[2, 3], [5, 6]]],
    [[[1, 2], [5, 6]], [[2, 4]], [[4, 5]]],
    [[[0, 4]], [[0, 2], [6, 8]], [[3, 4], [6, 7]]],
    [[[2, 9]]]
  ];
  const LIMITS = {employees: 5, intervals: 5, maxTime: 30};
  const NAMES = 'ABCDE';

  function format(schedule) {
    return schedule.map(p => p.map(([s, e]) => `${s}-${e}`).join(' ')).join('; ');
  }

  // Parse "1-3 9-10; 3-5 12-14" (one employee per ';' or line). Returns {schedule} or {error}.
  function parse(text) {
    if (typeof text !== 'string' || !text.trim()) return {error: 'invalidEmpty'};
    const people = text.split(/[;\n]/).map(x => x.trim()).filter(Boolean);
    if (people.length > LIMITS.employees) return {error: 'invalidCount'};
    const schedule = [];
    for (const person of people) {
      const tokens = person.split(/[\s,]+/).filter(Boolean);
      if (!tokens.length || tokens.length > LIMITS.intervals) return {error: 'invalidCount'};
      const list = [];
      for (const token of tokens) {
        const m = /^(\d{1,2})-(\d{1,2})$/.exec(token);
        if (!m) return {error: 'invalidFormat'};
        const s = Number(m[1]), e = Number(m[2]);
        if (e > LIMITS.maxTime) return {error: 'invalidRange'};
        if (s >= e) return {error: 'invalidOrder'};
        if (list.length && s < list[list.length - 1][1]) return {error: 'invalidOverlap'};
        list.push([s, e]);
      }
      schedule.push(list);
    }
    return {schedule};
  }

  function validate(schedule) {
    if (!Array.isArray(schedule) || !schedule.length || schedule.length > LIMITS.employees) return 'invalidCount';
    for (const p of schedule) {
      if (!Array.isArray(p) || !p.length || p.length > LIMITS.intervals) return 'invalidCount';
      for (let i = 0; i < p.length; i++) {
        const [s, e] = p[i];
        if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e > LIMITS.maxTime) return 'invalidRange';
        if (s >= e) return 'invalidOrder';
        if (i && s < p[i - 1][1]) return 'invalidOverlap';
      }
    }
    return null;
  }

  // Step 2 brute force: cut the time line at every endpoint and test each piece against every interval.
  function brute(schedule) {
    const all = schedule.flat();
    const points = [...new Set(all.flat())].sort((a, b) => a - b);
    const pieces = [];
    let checks = 0;
    for (let i = 0; i + 1 < points.length; i++) {
      const a = points[i], b = points[i + 1];
      let covered = false;
      for (const [s, e] of all) { checks++; if (s <= a && b <= e) { covered = true; break; } }
      pieces.push({a, b, covered});
    }
    return {points, pieces, checks, worstChecks: (points.length - 1) * all.length};
  }

  // Sweep in start order; one frame after each interval is processed.
  function trace(schedule) {
    const error = validate(schedule);
    if (error) throw new Error(error);
    const pooled = [];
    schedule.forEach((p, who) => p.forEach(([s, e]) => pooled.push({s, e, who: NAMES[who]})));
    pooled.sort((x, y) => x.s - y.s || x.e - y.e || x.who.localeCompare(y.who));
    const frames = [{type: 'init', i: -1, reach: null, prevEnd: null, free: [], covered: [], history: []}];
    let reach = null, prevEnd = null, free = [], covered = [], history = [];
    pooled.forEach((iv, i) => {
      const before = reach, prev = prevEnd;
      let kind, gap = null;
      if (before === null) kind = 'first';
      else if (iv.s > before) { kind = 'gap'; gap = [before, iv.s]; }
      else if (iv.s === before) kind = 'touch';
      else if (iv.e <= before) kind = 'inside';
      else kind = 'extend';
      // What the tempting "compare with the previous interval's end" rule would report here.
      const wrongGap = prev !== null && iv.s > prev ? [prev, iv.s] : null;
      if (gap) free = free.concat([gap]);
      if (kind === 'first' || kind === 'gap') covered = covered.concat([[iv.s, iv.e]]);
      else covered = covered.slice(0, -1).concat([[covered[covered.length - 1][0], Math.max(before, iv.e)]]);
      reach = before === null ? iv.e : Math.max(before, iv.e);
      prevEnd = iv.e;
      history = history.concat([{i, s: iv.s, e: iv.e, who: iv.who, kind, gap, reachBefore: before, reachAfter: reach}]);
      frames.push(JSON.parse(JSON.stringify({type: 'step', i, iv, kind, gap, wrongGap, reachBefore: before, reach, prevEnd: prev, free, covered, history})));
    });
    frames.push(JSON.parse(JSON.stringify({type: 'done', i: pooled.length, reach, prevEnd, free, covered, history})));
    return {schedule, pooled, frames, answer: free};
  }

  function solve(schedule) { return trace(schedule).answer; }

  const api = {presets, LIMITS, NAMES, format, parse, validate, brute, trace, solve};
  root.FreeTime759 = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
