'use strict';
(function (root) {
  // Diagram positions: index 0 is the water source W (used from step 2 on), 1..n are houses. viewBox 400 x 240.
  const POS3 = [[200, 34], [70, 200], [200, 130], [330, 200]];
  const POS4 = [[200, 30], [50, 190], [150, 130], [250, 130], [350, 190]];
  const POS2 = [[200, 34], [90, 190], [310, 190]];
  const MAIN = {n: 3, wells: [4, 2, 5], pipes: [[1, 2, 1], [2, 3, 1], [1, 3, 3]], pos: POS3};
  const presets = [
    {key: 'main', n: 3, wells: [4, 2, 5], pipes: [[1, 2, 1], [2, 3, 1], [1, 3, 3]], pos: POS3},
    {key: 'four', n: 4, wells: [6, 1, 7, 5], pipes: [[1, 2, 2], [2, 3, 2], [3, 4, 8], [1, 4, 3]], pos: POS4},
    {key: 'parallel', n: 2, wells: [5, 5], pipes: [[1, 2, 4], [1, 2, 1]], pos: POS2}
  ];
  const PREDICT = {n: 4, wells: [1, 8, 8, 1], pipes: [[1, 2, 3], [2, 3, 6], [3, 4, 3]], pos: POS4};

  // A hand-built plan: which wells are dug and which pipes are laid. Water reaches a house
  // if it can follow laid pipes to some house with a well.
  function evaluatePlan(x, wellOn, pipeOn) {
    const comp = Array.from({length: x.n + 1}, (_, i) => i);
    const find = a => { while (comp[a] !== a) a = comp[a]; return a; };
    x.pipes.forEach(([a, b], j) => { if (pipeOn[j]) comp[find(a)] = find(b); });
    const wet = new Set();
    for (let i = 1; i <= x.n; i++) if (wellOn[i - 1]) wet.add(find(i));
    const water = [];
    for (let i = 1; i <= x.n; i++) water.push(wet.has(find(i)));
    const cost = x.wells.reduce((s, c, i) => s + (wellOn[i] ? c : 0), 0) + x.pipes.reduce((s, p, j) => s + (pipeOn[j] ? p[2] : 0), 0);
    return {water, cost, complete: water.every(Boolean)};
  }

  // Brute force over every subset of wells and pipes (2^(n+m) plans).
  function bruteBest(x) {
    const k = x.n + x.pipes.length; let best = Infinity, plans = 0;
    for (let mask = 0; mask < 1 << k; mask++) {
      plans++;
      const wellOn = x.wells.map((_, i) => !!(mask >> i & 1)), pipeOn = x.pipes.map((_, j) => !!(mask >> (x.n + j) & 1));
      const r = evaluatePlan(x, wellOn, pipeOn);
      if (r.complete && r.cost < best) best = r.cost;
    }
    return {best, plans};
  }

  // The tempting per-house rule: each house takes the cheaper of its own well or its cheapest pipe.
  function perHouseGreedy(x) {
    const wellOn = x.wells.map(() => false), pipeOn = x.pipes.map(() => false);
    for (let h = 1; h <= x.n; h++) {
      let bestPipe = -1;
      x.pipes.forEach(([a, b, c], j) => { if ((a === h || b === h) && (bestPipe < 0 || c < x.pipes[bestPipe][2])) bestPipe = j; });
      if (bestPipe >= 0 && x.pipes[bestPipe][2] < x.wells[h - 1]) pipeOn[bestPipe] = true; else wellOn[h - 1] = true;
    }
    return {wellOn, pipeOn, ...evaluatePlan(x, wellOn, pipeOn)};
  }

  // Wells become edges from source 0; ties broken by original position (wells first) for a stable order.
  function makeEdges(x) {
    const es = x.wells.map((c, i) => ({u: 0, v: i + 1, w: c, kind: 'well', ref: i}))
      .concat(x.pipes.map((p, j) => ({u: p[0], v: p[1], w: p[2], kind: 'pipe', ref: j})));
    return es.map((e, order) => ({...e, order})).sort((a, b) => a.w - b.w || a.order - b.order);
  }

  // Kruskal with union-find; every frame is a deep snapshot of groups, decisions and cost.
  function trace(x) {
    const edges = makeEdges(x), parent = Array.from({length: x.n + 1}, (_, i) => i);
    const find = a => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
    const groups = () => { const g = []; for (let i = 0; i <= x.n; i++) g.push(find(i)); const label = {}; let k = 0; return g.map(r => (r in label ? label[r] : (label[r] = k++))); };
    const frames = [{at: 0, cost: 0, decisions: [], group: groups(), kept: 0, event: {type: 'start'}}];
    let cost = 0, kept = 0; const decisions = [];
    edges.forEach((e, i) => {
      const ru = find(e.u), rv = find(e.v), take = ru !== rv;
      if (take) { parent[rv] = ru; cost += e.w; kept++; }
      decisions.push(take);
      frames.push({at: i + 1, cost, kept, decisions: decisions.slice(), group: groups(), event: {type: take ? 'take' : 'skip', ...e}});
    });
    return {edges, frames, result: cost};
  }

  const api = {MAIN, presets, PREDICT, evaluatePlan, bruteBest, perHouseGreedy, makeEdges, trace};
  root.WaterCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
