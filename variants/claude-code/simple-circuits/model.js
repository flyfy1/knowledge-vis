'use strict';
// Simple circuits lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every glow, moving dot and readout on the page comes from solve() below; tests/core.cjs pins the claims.
// Model: ideal DC circuit. A cell is 1.5 V with 0.5 Ω inside it; a bulb is a fixed 10 Ω filament (a real filament's
// resistance rises as it heats up); a wire is 0.02 Ω. Node voltages are found by nodal analysis (Kirchhoff's current
// law at every junction), so the same current through every part of a single loop is a result, not an input.
(function (root) {
  const CELL = { E: 1.5, r: 0.5 };
  const BULB = { R: 10, ratedV: 3 };
  BULB.ratedP = BULB.ratedV * BULB.ratedV / BULB.R;      // 0.9 W
  BULB.burnP = 2 * BULB.ratedP;                          // teaching value: the filament melts above twice its rating
  BULB.glowP = 0.02;                                     // teaching value: below 0.02 W the filament does not visibly glow
  const WIRE = 0.02, SWITCH = 0.01;

  // circuit: { n: number of nodes, els: [{ kind: 'R', a, b, R } | { kind: 'cell', a (−), b (+), E, r }] }
  // Returns node voltages V and, for each element, the current I flowing from a to b (inside a cell: from − to +).
  function solve(c) {
    const n = c.n, parent = [...Array(n).keys()], find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (const e of c.els) parent[find(e.a)] = find(e.b);
    // one reference node (0 V) per connected piece of the circuit
    const ref = new Set(), idx = new Array(n).fill(-1); let m = 0;
    for (let i = 0; i < n; i++) if (!ref.has(find(i)) && [...ref].every(r => find(r) !== find(i))) ref.add(i);
    const refOf = new Set([...ref]);
    for (let i = 0; i < n; i++) if (!refOf.has(i)) idx[i] = m++;
    const G = Array.from({ length: m }, () => new Array(m + 1).fill(0));
    const stamp = (a, b, g) => {
      if (idx[a] >= 0) G[idx[a]][idx[a]] += g; if (idx[b] >= 0) G[idx[b]][idx[b]] += g;
      if (idx[a] >= 0 && idx[b] >= 0) { G[idx[a]][idx[b]] -= g; G[idx[b]][idx[a]] -= g; }
    };
    for (const e of c.els) {
      if (e.kind === 'R') stamp(e.a, e.b, 1 / e.R);
      else { stamp(e.a, e.b, 1 / e.r); const J = e.E / e.r; if (idx[e.b] >= 0) G[idx[e.b]][m] += J; if (idx[e.a] >= 0) G[idx[e.a]][m] -= J; }
    }
    for (let col = 0; col < m; col++) {
      let p = col; for (let r = col + 1; r < m; r++) if (Math.abs(G[r][col]) > Math.abs(G[p][col])) p = r;
      [G[col], G[p]] = [G[p], G[col]];
      for (let r = 0; r < m; r++) if (r !== col && G[r][col] !== 0) { const f = G[r][col] / G[col][col]; for (let k = col; k <= m; k++) G[r][k] -= f * G[col][k]; }
    }
    const V = new Array(n).fill(0);
    for (let i = 0; i < n; i++) if (idx[i] >= 0) V[i] = G[idx[i]][m] / G[idx[i]][idx[i]];
    const I = c.els.map(e => (e.kind === 'R' ? (V[e.a] - V[e.b]) / e.R : (e.E - (V[e.b] - V[e.a])) / e.r));
    return { V, I };
  }

  // A drawn scene: named nodes and edges. kind: wire | bulb | cells | switch | sample | short. Open edges carry nothing.
  // opts.burnt (set of bulb edge ids) and opts.removed (set) open those bulbs.
  function build(edges, opts = {}) {
    const names = [...new Set(edges.flatMap(e => [e.a, e.b]))], id = Object.fromEntries(names.map((s, i) => [s, i])), els = [], map = [];
    for (const e of edges) {
      let el = null;
      const open = e.open || (opts.removed && opts.removed.has(e.id)) || (opts.burnt && opts.burnt.has(e.id));
      if (!open) {
        if (e.kind === 'cells') el = { kind: 'cell', a: id[e.a], b: id[e.b], E: CELL.E * e.cells, r: CELL.r * e.cells };
        else el = { kind: 'R', a: id[e.a], b: id[e.b], R: e.kind === 'bulb' ? BULB.R : e.kind === 'switch' ? SWITCH : e.kind === 'sample' ? e.R : WIRE };
      }
      map.push(el ? els.push(el) - 1 : -1);
    }
    const S = solve({ n: names.length, els });
    const cur = {}, pow = {};
    edges.forEach((e, k) => { const i = map[k]; cur[e.id] = i < 0 ? 0 : S.I[i]; pow[e.id] = i < 0 ? 0 : (els[i].kind === 'R' ? S.I[i] * S.I[i] * els[i].R : S.I[i] * S.I[i] * els[i].r); });
    return { cur, pow, V: Object.fromEntries(names.map(s => [s, S.V[id[s]]])) };
  }
  // A bulb glows when it gets at least glowP watts; brightness is its power as a share of the rated power.
  const lit = P => P >= BULB.glowP;
  const brightness = P => P / BULB.ratedP;
  // Solve, burn out any bulb above burnP, and solve again (a burnt filament is a break in the circuit).
  function run(edges, opts = {}) {
    const burnt = new Set(opts.burnt || []);
    let R = build(edges, { ...opts, burnt });
    for (let k = 0; k < 4; k++) {
      const hot = edges.filter(e => e.kind === 'bulb' && !burnt.has(e.id) && R.pow[e.id] > BULB.burnP);
      if (!hot.length) break;
      hot.forEach(e => burnt.add(e.id)); R = build(edges, { ...opts, burnt });
    }
    return { ...R, burnt };
  }

  /* ---- step 0: where do the two wires go? ---- */
  // Battery pack (two cells, 3 V): + on top, − at the bottom. The bulb's filament joins its tip to its metal side.
  // red: where the wire from + ends ('tip' | 'side' | 'none'); black: where the wire from − ends ('tip' | 'side' | 'plus' | 'none').
  function hookup(red, black) {
    const edges = [{ id: 'bat', kind: 'cells', cells: 2, a: 'minus', b: 'plus' }, { id: 'bulb', kind: 'bulb', a: 'tip', b: 'side' }];
    if (red !== 'none') edges.push({ id: 'red', kind: 'wire', a: 'plus', b: red });
    if (black !== 'none') edges.push({ id: 'black', kind: 'wire', a: black === 'plus' ? 'plus' : black, b: 'minus' });
    const R = run(edges);
    return { ...R, bulbI: Math.abs(R.cur.bulb), bulbP: R.pow.bulb, batI: R.cur.bat, short: R.cur.bat > 2 && Math.abs(R.cur.bulb) < 1e-6 };
  }

  /* ---- step 1: one loop, a switch, three meters, four places to cut ---- */
  const LOOP = ['w1', 'bulb', 'w2', 'sw', 'w3', 'w4'];
  function loop(closed, cuts = []) {
    const edges = [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' },
      { id: 'w1', kind: 'wire', a: 'n0', b: 'n1', open: cuts.includes('w1') },
      { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' },
      { id: 'w2', kind: 'wire', a: 'n2', b: 'n3', open: cuts.includes('w2') },
      { id: 'sw', kind: 'switch', a: 'n3', b: 'n4', open: !closed },
      { id: 'w3', kind: 'wire', a: 'n4', b: 'n6', open: cuts.includes('w3') },
      { id: 'w4', kind: 'wire', a: 'n6', b: 'n5', open: cuts.includes('w4') }
    ];
    return { edges, ...run(edges) };
  }

  /* ---- step 2: what can close the gap? ---- */
  // Resistance of the sample placed across a 1 cm gap (Ω). Graphite and salt water conduct, but much worse than metal.
  const MATERIALS = [
    { id: 'copper', R: 0.002 }, { id: 'iron', R: 0.01 }, { id: 'foil', R: 0.005 }, { id: 'lead', R: 8 },
    { id: 'salt', R: 300 }, { id: 'plastic', R: 1e12 }, { id: 'rubber', R: 1e13 }, { id: 'wood', R: 1e10 }, { id: 'glass', R: 1e13 }, { id: 'paper', R: 1e11 }
  ];
  function tester(matId) {
    const mat = MATERIALS.find(m => m.id === matId);
    const edges = [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n4', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' },
      { id: 'w2', kind: 'wire', a: 'n2', b: 'n3' }, { id: 'gap', kind: 'sample', R: mat ? mat.R : Infinity, a: 'n3', b: 'n5', open: !mat }, { id: 'w3', kind: 'wire', a: 'n5', b: 'n4' }
    ];
    const R = run(edges), I = Math.abs(R.cur.bulb), P = R.pow.bulb;
    // conductor: lights the bulb; poor conductor: a measurable current (≥ 1 mA) but no glow; insulator: less than 1 µA
    const cls = lit(P) ? 'good' : I >= 1e-3 ? 'poor' : I < 1e-6 ? 'none' : 'poor';
    return { edges, ...R, I, P, cls };
  }

  /* ---- step 3: two bulbs, in a line or side by side ---- */
  function twoBulbs(mode, removed = []) {
    const rm = new Set(removed);
    const edges = mode === 'series' ? [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' },
      { id: 'b1', kind: 'bulb', a: 'n1', b: 'n2' }, { id: 'w2', kind: 'wire', a: 'n2', b: 'n3' },
      { id: 'b2', kind: 'bulb', a: 'n3', b: 'n4' }, { id: 'w3', kind: 'wire', a: 'n4', b: 'n5' }
    ] : [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' },
      { id: 'b1', kind: 'bulb', a: 'n1', b: 'n2' }, { id: 'w2', kind: 'wire', a: 'n2', b: 'n6' },
      { id: 'w4', kind: 'wire', a: 'n1', b: 'n3' }, { id: 'b2', kind: 'bulb', a: 'n3', b: 'n4' }, { id: 'w5', kind: 'wire', a: 'n4', b: 'n6' },
      { id: 'w3', kind: 'wire', a: 'n6', b: 'n5' }
    ];
    return { edges, ...run(edges, { removed: rm }) };
  }

  /* ---- step 4: a short circuit ---- */
  function shorted(on) {
    const edges = [
      { id: 'bat', kind: 'cells', cells: 2, a: 'n5', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' },
      { id: 'short', kind: 'short', a: 'n1', b: 'n2', open: !on }, { id: 'w2', kind: 'wire', a: 'n2', b: 'n5' }
    ];
    const R = run(edges);
    return { edges, ...R, batI: R.cur.bat, bulbI: Math.abs(R.cur.bulb), shortI: Math.abs(R.cur.short), heat: R.pow.bat };
  }

  /* ---- step 5: more cells ---- */
  function cells(n) {
    const edges = [{ id: 'bat', kind: 'cells', cells: n, a: 'n3', b: 'n0' }, { id: 'w1', kind: 'wire', a: 'n0', b: 'n1' }, { id: 'bulb', kind: 'bulb', a: 'n1', b: 'n2' }, { id: 'w2', kind: 'wire', a: 'n2', b: 'n3' }];
    const first = build(edges), R = run(edges);
    return { edges, ...R, P0: first.pow.bulb, I0: Math.abs(first.cur.bulb), I: Math.abs(R.cur.bulb), P: R.pow.bulb, burnt: R.burnt.has('bulb') };
  }

  /* ---- step 6: diagnose ---- */
  const QUIZ = ['open', 'seriesGone', 'parallelGone', 'shortWire', 'plastic', 'lead', 'samePole', 'normal'];
  function quiz(name) {
    switch (name) {
      case 'open': { const L = loop(false); return { ...L, ask: 'bulb' }; }
      case 'normal': { const L = loop(true); return { ...L, ask: 'bulb' }; }
      case 'seriesGone': { const T = twoBulbs('series', ['b2']); return { ...T, removed: ['b2'], ask: 'b1' }; }
      case 'parallelGone': { const T = twoBulbs('parallel', ['b2']); return { ...T, removed: ['b2'], ask: 'b1' }; }
      case 'shortWire': { const S = shorted(true); return { ...S, ask: 'bulb' }; }
      case 'plastic': { const T = tester('plastic'); return { ...T, ask: 'bulb' }; }
      case 'lead': { const T = tester('lead'); return { ...T, ask: 'bulb' }; }
      case 'samePole': { const H = hookup('tip', 'none'); const edges = [{ id: 'bat', kind: 'cells', cells: 2, a: 'minus', b: 'plus' }, { id: 'bulb', kind: 'bulb', a: 'tip', b: 'side' }, { id: 'red', kind: 'wire', a: 'plus', b: 'tip' }, { id: 'red2', kind: 'wire', a: 'plus', b: 'side' }]; const R = run(edges); void H; return { edges, ...R, ask: 'bulb' }; }
    }
    return null;
  }
  const quizLit = q => lit(q.pow[q.ask]);

  const api = { CELL, BULB, WIRE, SWITCH, solve, build, run, lit, brightness, hookup, LOOP, loop, MATERIALS, tester, twoBulbs, shorted, cells, QUIZ, quiz, quizLit };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CIRCUIT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
