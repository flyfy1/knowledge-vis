/* Models for "Same ballots, different winner".
   Pure functions only: no DOM, no canvas. Loaded by the page (window.VoteModels) and by tests/models.cjs (require).
   Comments are English; all visible text lives in copy.zh.js. */
(function (root, factory) {
  const M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M;
  else root.VoteModels = M;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── shared helpers ───────── */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(R) { let u = 0, v = 0; while (u === 0) u = R(); v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  function dist2(a, b) { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; } return s; }

  // all orderings of an index list
  function permutations(list) {
    if (list.length <= 1) return [list.slice()];
    const out = [];
    list.forEach((x, i) => { const rest = list.slice(0, i).concat(list.slice(i + 1)); permutations(rest).forEach(p => out.push([x].concat(p))); });
    return out;
  }

  /* ───────── ballots from positions ─────────
     A voter ranks candidates by distance, nearest first. Points are arrays ([x] on a line, [x, y] on a plane).
     Exact distance ties are broken by candidate index (lower first). */
  function rankBallot(voter, cands, active) {
    const ids = active ? active.slice() : cands.map((_, i) => i);
    return ids.map(i => [i, dist2(voter, cands[i])]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).map(e => e[0]);
  }
  function ballotsFrom(voters, cands, active) { return voters.map(v => rankBallot(v, cands, active)); }

  // group identical ballots: [{rank, count, members}]
  function groupBallots(ballots) {
    const map = new Map();
    ballots.forEach((b, i) => { const k = b.join(','); if (!map.has(k)) map.set(k, { rank: b.slice(), count: 0, members: [] }); const g = map.get(k); g.count++; g.members.push(i); });
    return [...map.values()].sort((a, b) => b.count - a.count || (a.rank.join() < b.rank.join() ? -1 : 1));
  }

  /* ───────── the five counting rules ─────────
     ballots: arrays of candidate indices, most preferred first (may contain candidates outside `active`; they are skipped).
     Ties: the lower candidate index wins a tie for first; in an elimination the higher index among the tied lowest goes out. */
  function topOf(b, act) { for (const c of b) if (act.has(c)) return c; return -1; }
  function firstCounts(ballots, active) {
    const act = new Set(active), n = {};
    active.forEach(c => { n[c] = 0; });
    ballots.forEach(b => { const t = topOf(b, act); if (t >= 0) n[t]++; });
    return n;
  }
  function argBest(active, score) {
    let best = active[0];
    active.forEach(c => { if (score[c] > score[best] || (score[c] === score[best] && c < best)) best = c; });
    return best;
  }
  function headToHead(ballots, a, b) {
    let na = 0, nb = 0;
    ballots.forEach(bl => { const ia = bl.indexOf(a), ib = bl.indexOf(b); if (ia < 0 && ib < 0) return; if (ib < 0 || (ia >= 0 && ia < ib)) na++; else nb++; });
    return { [a]: na, [b]: nb, winner: na > nb || (na === nb && a < b) ? a : b };
  }
  function plurality(ballots, active) { const counts = firstCounts(ballots, active); return { winner: argBest(active, counts), counts }; }
  function runoff(ballots, active) {
    const counts = firstCounts(ballots, active), total = ballots.length;
    const order = active.slice().sort((a, b) => counts[b] - counts[a] || a - b);
    if (counts[order[0]] * 2 > total || active.length < 2) return { winner: order[0], counts, outright: true, finalists: [order[0]] };
    const f = [order[0], order[1]], h = headToHead(ballots, f[0], f[1]);
    return { winner: h.winner, counts, outright: false, finalists: f, final: h };
  }
  function irv(ballots, active) {
    let left = active.slice(); const rounds = [];
    while (left.length > 1) {
      const counts = firstCounts(ballots, left), total = ballots.length;
      const lead = argBest(left, counts);
      if (counts[lead] * 2 > total) { rounds.push({ counts, out: -1 }); return { winner: lead, rounds }; }
      let worst = left[0];
      left.forEach(c => { if (counts[c] < counts[worst] || (counts[c] === counts[worst] && c > worst)) worst = c; });
      rounds.push({ counts, out: worst });
      left = left.filter(c => c !== worst);
    }
    rounds.push({ counts: firstCounts(ballots, left), out: -1 });
    return { winner: left[0], rounds };
  }
  function borda(ballots, active) {
    const act = new Set(active), scores = {};
    active.forEach(c => { scores[c] = 0; });
    ballots.forEach(b => { const r = b.filter(c => act.has(c)); r.forEach((c, i) => { scores[c] += r.length - 1 - i; }); });
    return { winner: argBest(active, scores), scores };
  }
  function pairwise(ballots, active) {
    const m = {};
    active.forEach(a => { m[a] = {}; active.forEach(b => { m[a][b] = 0; }); });
    ballots.forEach(b => { const r = b.filter(c => m[c] !== undefined); for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) m[r[i]][r[j]]++; });
    return m;
  }
  function condorcet(ballots, active) {
    const m = pairwise(ballots, active);
    const winner = active.find(a => active.every(b => b === a || m[a][b] > m[b][a]));
    const wins = {}; active.forEach(a => { wins[a] = active.filter(b => b !== a && m[a][b] > m[b][a]).length; });
    return { winner: winner === undefined ? -1 : winner, matrix: m, wins };
  }
  const RULES = { plurality, runoff, irv, borda, condorcet };
  const RULE_KEYS = ['plurality', 'runoff', 'irv', 'borda', 'condorcet'];
  function electAll(ballots, active) { const o = {}; RULE_KEYS.forEach(k => { o[k] = RULES[k](ballots, active); }); return o; }
  function winners(ballots, active) { const o = {}; RULE_KEYS.forEach(k => { o[k] = RULES[k](ballots, active).winner; }); return o; }

  /* ───────── ch1 / ch5 / ch6: the plane electorate ───────── */
  const PLANE = {
    seed: 7, n: 99,
    clusters: [ { x: 0.27, y: 0.60, sd: 0.115, w: 38 }, { x: 0.73, y: 0.62, sd: 0.10, w: 34 }, { x: 0.52, y: 0.24, sd: 0.10, w: 27 } ],
    // default candidate positions; chosen so that the default already shows rules disagreeing
    cands: [[0.30, 0.62], [0.70, 0.66], [0.50, 0.46], [0.24, 0.42]]
  };
  function planeVoters(spec) {
    spec = spec || PLANE; const R = rng(spec.seed), out = [];
    spec.clusters.forEach(c => { for (let i = 0; i < c.w; i++) out.push([clamp(c.x + gauss(R) * c.sd, 0.03, 0.97), clamp(c.y + gauss(R) * c.sd, 0.03, 0.97)]); });
    return out;
  }

  /* Strategic voting: can some voters who share one sincere ranking change their ballots and get a winner they
     all prefer? Search: each group of identical sincere ballots, every other ballot, k = 1..size of those voters.
     Returns the manipulation that needs the fewest voters (ties: larger group first, then ballot order). */
  function findManipulation(ballots, active, rule) {
    const f = RULES[rule], sincere = f(ballots, active).winner;
    if (sincere < 0) return null;
    const groups = groupBallots(ballots.map(b => b.filter(c => active.includes(c))));
    const perms = permutations(active.slice().sort((a, b) => a - b));
    let best = null;
    for (const g of groups) {
      const pref = g.rank, better = pref.slice(0, pref.indexOf(sincere));
      if (!better.length) continue;
      for (const alt of perms) {
        if (alt.join() === pref.join()) continue;
        const maxK = best ? Math.min(g.count, best.k - 1) : g.count;
        const trial = ballots.slice();
        for (let k = 1; k <= maxK; k++) {
          trial[g.members[k - 1]] = alt;
          const w = f(trial, active).winner;
          if (w >= 0 && better.includes(w)) { best = { group: pref, groupSize: g.count, members: g.members.slice(0, k), k, ballot: alt, before: sincere, after: w, betrayal: alt[0] !== pref[0] }; break; }
        }
      }
    }
    return best;
  }

  // approval: each voter approves every candidate within radius r, and always approves the nearest one
  function approval(voters, cands, active, r) {
    const score = {}; active.forEach(c => { score[c] = 0; });
    voters.forEach(v => {
      let near = active[0];
      active.forEach(c => { if (dist2(v, cands[c]) < dist2(v, cands[near])) near = c; });
      active.forEach(c => { if (c === near || Math.sqrt(dist2(v, cands[c])) <= r) score[c]++; });
    });
    return { winner: argBest(active, score), scores: score };
  }

  /* ───────── ch2 / ch3: the line electorate ─────────
     101 voters at the quantiles of a two-humped distribution on [0, 1]; deterministic, no noise. */
  const LINE = { n: 101, mix: [ { m: 0.33, s: 0.12, w: 0.55 }, { m: 0.70, s: 0.10, w: 0.45 } ], L: 0.32, R: 0.70, T: 0.24 };
  function erf(x) { // Abramowitz–Stegun 7.1.26, |error| < 1.5e-7
    const s = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function mixCdf(x, mix) { return mix.reduce((s, c) => s + c.w * 0.5 * (1 + erf((x - c.m) / (c.s * Math.SQRT2))), 0); }
  function lineVoters(spec) {
    spec = spec || LINE; const out = [], lo = mixCdf(0, spec.mix), hi = mixCdf(1, spec.mix);
    for (let i = 0; i < spec.n; i++) {
      const target = lo + (hi - lo) * (i + 0.5) / spec.n; let a = 0, b = 1;
      for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (mixCdf(m, spec.mix) < target) a = m; else b = m; }
      out.push([(a + b) / 2]);
    }
    return out;
  }
  function median1D(voters) { const s = voters.map(v => v[0]).sort((a, b) => a - b); return s[(s.length - 1) >> 1]; }

  // winners under plurality / IRV / Condorcet as the third candidate T moves along the line
  function spoilerStrip(voters, L, R, steps) {
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const x = i / steps, cands = [[L], [R], [x]], b = ballotsFrom(voters, cands);
      out.push({ x, plurality: plurality(b, [0, 1, 2]).winner, irv: irv(b, [0, 1, 2]).winner, condorcet: condorcet(b, [0, 1, 2]).winner });
    }
    return out;
  }

  /* Repeated elections with polls ("strategic desertion"). Voters are grouped by sincere ranking; d[g] is the share of
     group g voting for its second choice instead of its favourite. After each election, groups whose favourite came
     third move a fraction s of their loyal members to their second choice; groups whose favourite is back in the
     top two return at the same rate. */
  function desertionRun(voters, cands, s, rounds) {
    const groups = groupBallots(ballotsFrom(voters, cands)), d = groups.map(() => 0), out = [];
    for (let t = 0; t <= rounds; t++) {
      const sh = cands.map(() => 0);
      groups.forEach((g, i) => { sh[g.rank[0]] += g.count * (1 - d[i]); sh[g.rank[1]] += g.count * d[i]; });
      const order = cands.map((_, i) => i).sort((a, b) => sh[b] - sh[a] || a - b);
      out.push({ shares: sh.map(v => v / voters.length), order });
      const third = order[2];
      groups.forEach((g, i) => { if (g.rank[0] === third) d[i] += s * (1 - d[i]); else d[i] -= s * d[i]; });
    }
    return out;
  }

  /* ───────── ch3: who beats whom head to head, and the win set ───────── */
  function margin(voters, a, b) { // voters strictly closer to a minus voters strictly closer to b
    let m = 0; voters.forEach(v => { const da = dist2(v, a), db = dist2(v, b); if (da < db) m++; else if (db < da) m--; }); return m;
  }
  function winSet(voters, inc, grid) { return grid.map(p => margin(voters, p, inc) > 0); }
  function grid1D(n) { const g = []; for (let i = 0; i < n; i++) g.push([(i + 0.5) / n]); return g; }
  function grid2D(n) { const g = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) g.push([(i + 0.5) / n, (j + 0.5) / n]); return g; }
  // the challenger who beats the incumbent by the widest margin; ties go to the point nearest the incumbent
  function bestChallenger(voters, inc, grid) {
    let best = null, bm = 0, bd = Infinity;
    grid.forEach(p => { const m = margin(voters, p, inc); if (m <= 0) return; const d = dist2(p, inc); if (m > bm || (m === bm && d < bd)) { best = p; bm = m; bd = d; } });
    return best ? { point: best, margin: bm } : null;
  }

  /* ───────── ch4: three candidates, majority cycles ───────── */
  const PERMS3 = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  function majority3(rankings) { // rankings: arrays over {0,1,2}; returns pairwise, Condorcet winner, cycle flag
    const c = condorcet(rankings, [0, 1, 2]);
    return { matrix: c.matrix, winner: c.winner, cycle: c.winner < 0 && [0, 1, 2].every(a => c.wins[a] === 1) };
  }
  // exact probability of a majority cycle among 3 candidates when n voters (odd) each pick one of the 6 rankings at random
  function cycleProbIC(n) {
    const lf = [0]; for (let i = 1; i <= n; i++) lf.push(lf[i - 1] + Math.log(i));
    let p = 0; const cnt = [0, 0, 0, 0, 0, 0];
    (function rec(k, left) {
      if (k === 5) {
        cnt[5] = left;
        let ab = 0, bc = 0, ca = 0; // voters preferring A>B, B>C, C>A
        PERMS3.forEach((r, i) => { const pos = [r.indexOf(0), r.indexOf(1), r.indexOf(2)]; if (pos[0] < pos[1]) ab += cnt[i]; if (pos[1] < pos[2]) bc += cnt[i]; if (pos[2] < pos[0]) ca += cnt[i]; });
        const h = n / 2, cyc = (ab > h && bc > h && ca > h) || (ab < h && bc < h && ca < h);
        if (cyc) { let lw = lf[n] - n * Math.log(6); cnt.forEach(x => { lw -= lf[x]; }); p += Math.exp(lw); }
        return;
      }
      for (let x = 0; x <= left; x++) { cnt[k] = x; rec(k + 1, left - x); }
    })(0, n);
    return p;
  }
  const GUILBAUD = 0.25 - 3 / (2 * Math.PI) * Math.asin(1 / 3); // the large-n limit of cycleProbIC

  /* ───────── ch7: apportionment ─────────
     1880 census, Table I, resident population of the 38 states (U.S. Census Office, 1883, vol. 1). */
  const POP1880 = [
    ['NY', 5082871], ['PA', 4282891], ['OH', 3198062], ['IL', 3077871], ['MO', 2168380], ['IN', 1978301], ['MA', 1783085], ['KY', 1648690],
    ['MI', 1636937], ['IA', 1624615], ['TX', 1591749], ['TN', 1542359], ['GA', 1542180], ['VA', 1512565], ['NC', 1399750], ['WI', 1315497],
    ['AL', 1262505], ['MS', 1131597], ['NJ', 1131116], ['KS', 996096], ['SC', 995577], ['LA', 939946], ['MD', 934943], ['CA', 864694],
    ['AR', 802525], ['MN', 780773], ['ME', 648936], ['CT', 622700], ['WV', 618457], ['NE', 452402], ['NH', 346991], ['VT', 332286],
    ['RI', 276531], ['FL', 269493], ['CO', 194327], ['OR', 174768], ['DE', 146608], ['NV', 62266]
  ];
  function quotas(pops, h) { const T = pops.reduce((s, p) => s + p, 0); return pops.map(p => p * h / T); }
  // Hamilton (largest remainders). Every state first gets the whole part of its quota, but at least one seat
  // (the U.S. Constitution guarantees each state one); the seats still left go to the largest fractional parts.
  function hamilton(pops, h) {
    const q = quotas(pops, h), seats = q.map(x => Math.max(1, Math.floor(x)));
    const left = h - seats.reduce((s, x) => s + x, 0);
    const order = q.map((x, i) => [x - Math.floor(x), i]).filter(e => q[e[1]] >= 1).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (let k = 0; k < left; k++) seats[order[k][1]]++;
    return { seats, quotas: q, remainders: q.map(x => x - Math.floor(x)), cut: left, order: order.map(e => e[1]) };
  }
  // Huntington–Hill: a state with quota-like value v gets ceil(v) seats iff v >= sqrt(floor(v)·ceil(v)); every state gets at least 1
  function huntingtonHill(pops, h) {
    const seats = pops.map(() => 1); let left = h - pops.length;
    const pr = i => pops[i] / Math.sqrt(seats[i] * (seats[i] + 1));
    while (left-- > 0) { let b = 0; for (let i = 1; i < pops.length; i++) if (pr(i) > pr(b)) b = i; seats[b]++; }
    return { seats };
  }
  function paradoxes(pops, method, h0, h1) {
    const out = []; let prev = method(pops, h0).seats;
    for (let h = h0 + 1; h <= h1; h++) { const cur = method(pops, h).seats; cur.forEach((s, i) => { if (s < prev[i]) out.push({ from: h - 1, to: h, state: i }); }); prev = cur; }
    return out;
  }

  /* ───────── ch8: districts on a 9 × 9 grid ─────────
     party[i] = 1 for a gold voter, 0 for a cyan voter; 35 of 81 voters are gold. Maps assign each cell to one of 9 districts. */
  const GRID = 9;
  const PARTY = (
    '111111000' +
    '111111000' +
    '111110000' +
    '111100000' +
    '111000100' +
    '110001000' +
    '001100010' +
    '010010100' +
    '000000001').split('').map(Number);
  function mapFrom(rows) { return rows.join('').split('').map(Number); }
  // blocks / rows / columns are plain shapes; crackGold and crackCyan were found by a seeded local search
  // (contiguous, 9 cells each) that minimised / maximised gold seats, then frozen here.
  const MAPS = {
    blocks: mapFrom(['000111222', '000111222', '000111222', '333444555', '333444555', '333444555', '666777888', '666777888', '666777888']),
    rows: mapFrom(['000000000', '111111111', '222222222', '333333333', '444444444', '555555555', '666666666', '777777777', '888888888']),
    cols: mapFrom(Array.from({ length: 9 }, () => '012345678')),
    crackGold: mapFrom(['111777777', '111744477', '111444444', '200006665', '280006665', '288006665', '228833355', '228833355', '228833355']),
    crackCyan: mapFrom(['110000077', '114440077', '111440077', '118844777', '338842255', '338842555', '338882225', '336622255', '366666665'])
  };
  const MAP_KEYS = ['blocks', 'rows', 'cols', 'crackGold', 'crackCyan'];
  function districtResult(party, map) {
    const D = 9, n = Array(D).fill(0), g = Array(D).fill(0);
    map.forEach((d, i) => { n[d]++; g[d] += party[i]; });
    let seatsG = 0, wastedG = 0, wastedC = 0; const rows = [];
    for (let d = 0; d < D; d++) {
      const c = n[d] - g[d], half = n[d] / 2;
      const win = g[d] > c ? 1 : c > g[d] ? 0 : -1;
      if (win === 1) { seatsG++; wastedG += g[d] - half; wastedC += c; } else if (win === 0) { wastedC += c - half; wastedG += g[d]; }
      rows.push({ size: n[d], gold: g[d], cyan: c, win });
    }
    const total = party.length, eg = (wastedG - wastedC) / total;
    return { rows, seatsGold: seatsG, seatsCyan: rows.filter(r => r.win === 0).length, wastedGold: wastedG, wastedCyan: wastedC, efficiencyGap: eg, valid: validMap(map) };
  }
  function validMap(map) {
    const sizes = Array(9).fill(0); map.forEach(d => { sizes[d]++; });
    const equal = sizes.every(s => s === 9);
    const contiguous = sizes.map((s, d) => {
      if (!s) return true; const start = map.indexOf(d), seen = new Set([start]), st = [start];
      while (st.length) { const i = st.pop(), x = i % GRID, y = (i / GRID) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const X = x + dx, Y = y + dy, j = Y * GRID + X; if (X >= 0 && X < GRID && Y >= 0 && Y < GRID && map[j] === d && !seen.has(j)) { seen.add(j); st.push(j); } }); }
      return seen.size === s;
    });
    return { equal, sizes, contiguous: contiguous.every(Boolean), broken: contiguous.map((c, d) => c ? -1 : d).filter(d => d >= 0) };
  }

  /* ───────── ch9: Condorcet's jury theorem with copying ─────────
     n voters (odd). A leader is right with probability p. Each voter, independently, copies the leader with
     probability c and otherwise judges alone, right with probability p. Given the leader, votes are independent. */
  function lbinom(n, k) { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }
  function majorityRight(n, q) { // P(Binomial(n, q) > n/2), n odd
    if (q <= 0) return 0; if (q >= 1) return 1;
    let p = 0; const lq = Math.log(q), lr = Math.log(1 - q);
    for (let k = (n + 1) / 2; k <= n; k++) p += Math.exp(lbinom(n, k) + k * lq + (n - k) * lr);
    return Math.min(1, p);
  }
  function jury(n, p, c) {
    const q1 = c + (1 - c) * p, q0 = (1 - c) * p;
    return p * majorityRight(n, q1) + (1 - p) * majorityRight(n, q0);
  }
  function juryLimit(p, c) { const q1 = c + (1 - c) * p, q0 = (1 - c) * p, f = q => (q > 0.5 ? 1 : q < 0.5 ? 0 : 0.5); return p * f(q1) + (1 - p) * f(q0); }

  /* ───────── the opening: 21 voters, three rankings of A, B, C ───────── */
  const OPENING = [ { rank: [0, 2, 1], count: 8 }, { rank: [1, 2, 0], count: 7 }, { rank: [2, 0, 1], count: 2 }, { rank: [2, 1, 0], count: 4 } ];
  function expand(profile) { const out = []; profile.forEach(g => { for (let i = 0; i < g.count; i++) out.push(g.rank.slice()); }); return out; }

  return {
    rng, clamp, permutations, rankBallot, ballotsFrom, groupBallots,
    plurality, runoff, irv, borda, pairwise, condorcet, headToHead, RULES, RULE_KEYS, electAll, winners,
    PLANE, planeVoters, findManipulation, approval,
    LINE, lineVoters, median1D, spoilerStrip, desertionRun,
    margin, winSet, grid1D, grid2D, bestChallenger,
    PERMS3, majority3, cycleProbIC, GUILBAUD,
    POP1880, quotas, hamilton, huntingtonHill, paradoxes,
    GRID, PARTY, MAPS, MAP_KEYS, districtResult, validMap,
    majorityRight, jury, juryLimit,
    OPENING, expand
  };
});
