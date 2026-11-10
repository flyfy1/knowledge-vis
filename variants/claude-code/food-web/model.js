'use strict';
// Food-web lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.FOODWEB_MODEL) and node tests (module.exports).
(function (root) {
  // A made-up pond web. `eats` lists each consumer's foods; the order matters only for the
  // "one food each" comparison in step 5, which keeps the first food on each list.
  // x, y: layout on the web canvas (0..1), producers at the bottom.
  const SPECIES = [
    { id: 'algae', producer: true, eats: [], x: 0.22, y: 1.0 },
    { id: 'weed', producer: true, eats: [], x: 0.78, y: 1.0 },
    { id: 'zoo', eats: ['algae'], x: 0.22, y: 0.8 },
    { id: 'snail', eats: ['weed', 'algae'], x: 0.78, y: 0.8 },
    { id: 'larva', eats: ['zoo'], x: 0.5, y: 0.6 },
    { id: 'fish', eats: ['zoo', 'larva'], x: 0.22, y: 0.4 },
    { id: 'frog', eats: ['larva', 'snail'], x: 0.78, y: 0.4 },
    { id: 'pike', eats: ['fish', 'frog'], x: 0.5, y: 0.2 },
    { id: 'heron', eats: ['fish', 'frog', 'pike'], x: 0.5, y: 0.0 }
  ];
  const IDS = SPECIES.map(s => s.id);
  const byId = id => SPECIES.find(s => s.id === id);

  // ---- web structure ----
  // Arrows point from food to eater (the way the energy goes).
  function edges(web = 'full') {
    const out = [];
    SPECIES.forEach(s => { const foods = web === 'one' ? s.eats.slice(0, 1) : s.eats; foods.forEach(f => out.push([f, s.id])); });
    return out;
  }
  const foodsOf = (id, web = 'full') => { const s = byId(id); return web === 'one' ? s.eats.slice(0, 1) : s.eats.slice(); };
  const eatersOf = (id, web = 'full') => SPECIES.filter(s => foodsOf(s.id, web).includes(id)).map(s => s.id);

  // Every food chain: start at a producer, follow arrows, stop at a species nothing eats.
  function chains(web = 'full') {
    const res = [];
    const walk = path => {
      const last = path[path.length - 1], next = eatersOf(last, web);
      if (!next.length) { res.push(path); return; }
      next.forEach(n => walk(path.concat(n)));
    };
    SPECIES.filter(s => s.producer).forEach(s => walk([s.id]));
    return res;
  }
  // Trophic level along one chain = position in it (producer = 1).
  function levels(id) {
    const through = chains().filter(c => c.includes(id));
    const pos = through.map(c => c.indexOf(id) + 1);
    return { chains: through, positions: pos, min: Math.min(...pos), max: Math.max(...pos), distinct: [...new Set(pos)].sort((a, b) => a - b) };
  }

  // ---- step 2: energy up the longest chain ----
  const E1 = 10000; // kJ per m² per year captured by the algae (teaching number)
  const energyAt = (eff, level) => E1 * Math.pow(eff, level - 1);
  const algaePerTop = (eff, level) => 1 / Math.pow(eff, level - 1); // kJ of algae per kJ at that level
  function longestChain() { return chains().reduce((a, c) => (c.length > a.length ? c : a), []); }

  // ---- step 3: a persistent toxin concentrates up a chain ----
  // To add 1 kg of body a consumer eats 1/eff kg of food; it keeps a fraction `keep` of the toxin in it.
  // Concentration ratio per level = keep / eff.
  const TOX_CHAIN = ['algae', 'zoo', 'fish', 'pike', 'heron'];
  const C1 = 0.002; // mg per kg in the algae (teaching number)
  const LIMIT = 1; // mg per kg: illustrative warning line
  const toxFactor = (keep, eff) => keep / eff;
  const toxAt = (keep, eff, level) => C1 * Math.pow(toxFactor(keep, eff), level - 1);

  // ---- step 4: a four-level chain over time (Lotka–Volterra with self-limited algae) ----
  // dA/dt = A(r(1 − A/K) − a·Z);  dX_i/dt = X_i(e·a·X_{i−1} − m_i − a·X_{i+1})
  const LV = { names: ['algae', 'zoo', 'fish', 'pike'], r: 1, K: 10, a: 1, e: 0.5, m: [0, 0.5, 0.1, 0.25] };
  function deriv(x) {
    const n = x.length, d = new Array(n).fill(0), { r, K, a, e, m } = LV;
    for (let i = 0; i < n; i++) {
      const up = i + 1 < n ? a * x[i + 1] : 0;
      d[i] = i === 0 ? x[0] * (r * (1 - x[0] / K) - up) : x[i] * (e * a * x[i - 1] - m[i] - up);
    }
    return d;
  }
  // Equilibrium of the chain made of levels 0..L−1 (higher levels absent). If a level cannot hold on
  // (its equilibrium would be ≤ 0), the chain is shortened and solved again.
  function equilibrium(L) {
    const { r, K, a, e, m } = LV;
    for (let len = L; len >= 1; len--) {
      // Linear system M·x = b for levels 0..len−1.
      const Mx = Array.from({ length: len }, () => new Array(len).fill(0)), b = new Array(len).fill(0);
      for (let i = 0; i < len; i++) {
        if (i === 0) { Mx[0][0] = r / K; if (len > 1) Mx[0][1] = a; b[0] = r; }
        else { Mx[i][i - 1] = e * a; if (i + 1 < len) Mx[i][i + 1] = -a; b[i] = m[i]; }
      }
      const x = solve(Mx, b);
      if (x.every(v => v > 1e-9)) return LV.names.map((_, i) => (i < len ? x[i] : 0));
    }
    return LV.names.map(() => 0);
  }
  function solve(A, b) {
    const n = b.length, M = A.map((row, i) => row.concat(b[i]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map((row, i) => row[n] / row[i]);
  }
  // Simulate: start at the intact equilibrium, remove species `cut` (index, or −1 for none) at time T_CUT
  // and keep it at zero. Returns samples every DT_OUT time units, as % of the intact equilibrium.
  const SIM = { dt: 0.02, T: 160, T_CUT: 20, DT_OUT: 0.5 };
  function simulate(cut) {
    const base = equilibrium(4), x = base.slice(), out = [];
    const steps = Math.round(SIM.T / SIM.dt), every = Math.round(SIM.DT_OUT / SIM.dt);
    const add = (u, k, s) => u.map((v, i) => v + s * k[i]);
    for (let s = 0; s <= steps; s++) {
      const tm = s * SIM.dt;
      if (cut >= 0 && tm >= SIM.T_CUT - 1e-9) x[cut] = 0;
      if (s % every === 0) out.push({ t: tm, pct: x.map((v, i) => 100 * v / base[i]), raw: x.slice() });
      if (s === steps) break;
      const k1 = deriv(x), k2 = deriv(add(x, k1, SIM.dt / 2)), k3 = deriv(add(x, k2, SIM.dt / 2)), k4 = deriv(add(x, k3, SIM.dt));
      for (let i = 0; i < x.length; i++) x[i] = Math.max(0, x[i] + SIM.dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      if (cut >= 0 && tm + SIM.dt >= SIM.T_CUT - 1e-9) x[cut] = 0;
    }
    return { base, samples: out };
  }
  // Predicted new level of each species after removing `cut` (as % of intact). Removing level j leaves the chain 0..j−1.
  function predicted(cut) {
    const base = equilibrium(4), after = equilibrium(cut < 0 ? 4 : cut);
    return after.map((v, i) => 100 * v / base[i]);
  }

  // ---- step 5: who starves when species disappear ----
  // A consumer starves when none of its foods is left. Producers never starve.
  function starved(removed, web = 'full') {
    const gone = new Set(removed), lost = [];
    let changed = true;
    while (changed) {
      changed = false;
      SPECIES.forEach(s => {
        if (gone.has(s.id) || s.producer) return;
        if (foodsOf(s.id, web).every(f => gone.has(f))) { gone.add(s.id); lost.push(s.id); changed = true; }
      });
    }
    return lost;
  }
  function singleRemovalTable(web = 'full') { return IDS.map(id => ({ id, lost: starved([id], web) })); }

  const api = { SPECIES, IDS, byId, edges, foodsOf, eatersOf, chains, levels, E1, energyAt, algaePerTop, longestChain, TOX_CHAIN, C1, LIMIT, toxFactor, toxAt, LV, deriv, equilibrium, SIM, simulate, predicted, starved, singleRemovalTable };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FOODWEB_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
