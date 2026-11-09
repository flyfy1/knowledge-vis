'use strict';
// 2×2 game model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Two players, two actions each, played once and simultaneously, payoffs known to both (static game of
// complete information). Row player picks row 0/1 ("top"/"bottom"), column player picks column 0/1.
// A[i][j] = row player's payoff, B[i][j] = column player's payoff. Every number on the page comes from here.
(function (root) {
  const EPS = 1e-9;
  const PRESETS = {
    pd:      { A: [[3, 0], [5, 1]], B: [[3, 5], [0, 1]] },        // prisoner's dilemma: cooperate / defect
    stag:    { A: [[4, 0], [3, 3]], B: [[4, 3], [0, 3]] },        // stag hunt: stag / hare
    concert: { A: [[3, 0], [0, 2]], B: [[2, 0], [0, 3]] },        // coordination with conflict: concert / football
    pennies: { A: [[1, -1], [-1, 1]], B: [[-1, 1], [1, -1]] },    // matching pennies: heads / tails
    chicken: { A: [[0, -1], [1, -5]], B: [[0, 1], [-1, -5]] }     // chicken: swerve / straight
  };
  const clone = g => ({ A: g.A.map(r => r.slice()), B: g.B.map(r => r.slice()) });

  // Row player's best response(s) to column j; column player's best response(s) to row i.
  function rowBR(g, j) { const a = g.A[0][j], b = g.A[1][j]; return Math.abs(a - b) < EPS ? [0, 1] : a > b ? [0] : [1]; }
  function colBR(g, i) { const a = g.B[i][0], b = g.B[i][1]; return Math.abs(a - b) < EPS ? [0, 1] : a > b ? [0] : [1]; }
  // Strict dominance: one action is strictly better against both of the opponent's actions.
  function rowDominant(g) { if (g.A[0][0] > g.A[1][0] && g.A[0][1] > g.A[1][1]) return 0; if (g.A[1][0] > g.A[0][0] && g.A[1][1] > g.A[0][1]) return 1; return null; }
  function colDominant(g) { if (g.B[0][0] > g.B[0][1] && g.B[1][0] > g.B[1][1]) return 0; if (g.B[0][1] > g.B[0][0] && g.B[1][1] > g.B[1][0]) return 1; return null; }
  // Unilateral deviation from cell (i, j): what each player would get by switching alone.
  function deviation(g, i, j) {
    const rowGain = g.A[1 - i][j] - g.A[i][j], colGain = g.B[i][1 - j] - g.B[i][j];
    return { rowGain, colGain, rowWants: rowGain > EPS, colWants: colGain > EPS };
  }
  function pureNE(g) { const out = []; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const d = deviation(g, i, j); if (!d.rowWants && !d.colWants) out.push([i, j]); } return out; }
  // Pareto comparison: cell (k, l) makes both strictly better off than (i, j).
  const bothBetter = (g, i, j, k, l) => g.A[k][l] > g.A[i][j] + EPS && g.B[k][l] > g.B[i][j] + EPS;

  // Mixed strategies: p = P(row plays top), q = P(column plays left).
  const rowEU = (g, i, q) => q * g.A[i][0] + (1 - q) * g.A[i][1];
  const colEU = (g, j, p) => p * g.B[0][j] + (1 - p) * g.B[1][j];
  // q* makes the row player indifferent (set by the ROW player's payoffs A); p* makes the column player
  // indifferent (set by the COLUMN player's payoffs B). null when no interior value exists.
  function indifference(g) {
    const dq = g.A[0][0] - g.A[0][1] - g.A[1][0] + g.A[1][1], dp = g.B[0][0] - g.B[1][0] - g.B[0][1] + g.B[1][1];
    const q = Math.abs(dq) < EPS ? null : (g.A[1][1] - g.A[0][1]) / dq;
    const p = Math.abs(dp) < EPS ? null : (g.B[1][1] - g.B[1][0]) / dp;
    const inside = v => v !== null && v > EPS && v < 1 - EPS;
    return { p: inside(p) ? p : null, q: inside(q) ? q : null };
  }
  function mixedNE(g) { const m = indifference(g); return m.p !== null && m.q !== null ? m : null; }
  // A strategy profile (p, q) is a Nash equilibrium when neither player gains by any deviation.
  function isNE(g, p, q, tol = 1e-9) {
    const u = p * rowEU(g, 0, q) + (1 - p) * rowEU(g, 1, q), v = q * colEU(g, 0, p) + (1 - q) * colEU(g, 1, p);
    return Math.max(rowEU(g, 0, q), rowEU(g, 1, q)) <= u + tol && Math.max(colEU(g, 0, p), colEU(g, 1, p)) <= v + tol;
  }
  // Best-response correspondences for the unit-square picture: value, or [0, 1] on a tie.
  function rowBRp(g, q) { const d = rowEU(g, 0, q) - rowEU(g, 1, q); return Math.abs(d) < EPS ? null : d > 0 ? 1 : 0; }
  function colBRq(g, p) { const d = colEU(g, 0, p) - colEU(g, 1, p); return Math.abs(d) < EPS ? null : d > 0 ? 1 : 0; }
  function allNE(g) {
    const out = pureNE(g).map(([i, j]) => ({ p: 1 - i, q: 1 - j, pure: true, cell: [i, j] }));
    const m = mixedNE(g); if (m) out.push({ p: m.p, q: m.q, pure: false });
    return out;
  }

  // Fictitious play: each round both best-respond to the opponent's empirical frequency so far.
  // Start: each player has seen the opponent play each action once (counts 1, 1). Ties go to action 0.
  function fictitious(g, rounds) {
    let rowCount = [1, 1], colCount = [1, 1]; const path = [];
    for (let k = 0; k < rounds; k++) {
      const q = colCount[0] / (colCount[0] + colCount[1]), p = rowCount[0] / (rowCount[0] + rowCount[1]);
      const i = rowEU(g, 0, q) >= rowEU(g, 1, q) - EPS ? 0 : 1, j = colEU(g, 0, p) >= colEU(g, 1, p) - EPS ? 0 : 1;
      rowCount[i]++; colCount[j]++;
      path.push({ p: rowCount[0] / (rowCount[0] + rowCount[1]), q: colCount[0] / (colCount[0] + colCount[1]), i, j });
    }
    return path;
  }

  // Step 2 family: symmetric game with R = 3 (both cooperate), P = 1 (both defect), T and S on sliders.
  const R = 3, P = 1;
  function family(T, S) { return { A: [[R, S], [T, P]], B: [[R, T], [S, P]] }; }
  function familyName(T, S) {
    if (T > R && P > S) return 'pd'; if (R > T && P > S) return 'stag'; if (T > R && S > P) return 'chicken'; if (R > T && S > P) return 'harmony';
    return 'edge';
  }

  // Random integer game for step 3 and the quiz (payoffs 0..5).
  function mulberry32(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function randomGame(seed) { const R0 = mulberry32(seed * 2654435761 + 17), v = () => Math.floor(R0() * 6); return { A: [[v(), v()], [v(), v()]], B: [[v(), v()], [v(), v()]] }; }

  const api = { EPS, PRESETS, clone, rowBR, colBR, rowDominant, colDominant, deviation, pureNE, bothBetter, rowEU, colEU, indifference, mixedNE, isNE, rowBRp, colBRq, allNE, fictitious, R, P, family, familyName, randomGame };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
