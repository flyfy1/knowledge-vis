(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RLModels = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randn(rng) {
    var u1 = Math.max(1e-12, rng());
    var u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function clamp(x, lo, hi) {
    return x < lo ? lo : (x > hi ? hi : x);
  }

  function round(x, digits) {
    var p = Math.pow(10, digits || 2);
    return Math.round(x * p) / p;
  }

  // =========================================================================
  // 1. MULTI-ARMED BANDITS: EXPLORATION VS EXPLOITATION
  // =========================================================================
  var BANDIT_MEANS = [0.25, 0.45, 0.85, 0.58, 0.35];
  var BANDIT_STD = 0.55;
  var BANDIT_BEST_MEAN = 0.85;
  var BANDIT_BEST_ARM = 2;

  function runBanditStrategy(strategy, param, horizon, trials, seedBase) {
    var regretSum = new Float64Array(horizon);
    var optPullSum = new Float64Array(horizon);
    var lastPulls = [0, 0, 0, 0, 0];
    var lastQ = [0, 0, 0, 0, 0];
    var K = BANDIT_MEANS.length;

    for (var tr = 0; tr < trials; tr++) {
      var rng = mulberry32((seedBase + tr * 1009) >>> 0);
      var Q = [0, 0, 0, 0, 0];
      var N = [0, 0, 0, 0, 0];
      var cumRegret = 0;

      for (var t = 0; t < horizon; t++) {
        var arm = 0;
        if (strategy === 'ucb') {
          if (t < K) {
            arm = t;
          } else {
            var bestScore = -1e18;
            for (var a = 0; a < K; a++) {
              var bonus = param * Math.sqrt(Math.log(t + 1) / N[a]);
              var score = Q[a] + bonus;
              if (score > bestScore) {
                bestScore = score;
                arm = a;
              }
            }
          }
        } else {
          // greedy (param = 0) or eps-greedy (param = eps)
          if (param > 0 && rng() < param) {
            arm = Math.floor(rng() * K);
          } else {
            var bestQ = -1e18;
            var ties = [];
            for (var b = 0; b < K; b++) {
              if (Q[b] > bestQ + 1e-12) {
                bestQ = Q[b];
                ties = [b];
              } else if (Math.abs(Q[b] - bestQ) <= 1e-12) {
                ties.push(b);
              }
            }
            arm = ties[Math.floor(rng() * ties.length)];
          }
        }

        var reward = BANDIT_MEANS[arm] + BANDIT_STD * randn(rng);
        N[arm] += 1;
        Q[arm] += (reward - Q[arm]) / N[arm];

        cumRegret += BANDIT_BEST_MEAN - BANDIT_MEANS[arm];
        regretSum[t] += cumRegret;
        if (arm === BANDIT_BEST_ARM) {
          optPullSum[t] += 1;
        }
      }

      if (tr === trials - 1) {
        lastPulls = N.slice();
        lastQ = Q.slice();
      }
    }

    var regretCurve = new Array(horizon);
    var optRateCurve = new Array(horizon);
    for (var i = 0; i < horizon; i++) {
      regretCurve[i] = regretSum[i] / trials;
      optRateCurve[i] = optPullSum[i] / trials;
    }

    return {
      regretCurve: regretCurve,
      optRateCurve: optRateCurve,
      finalRegret: regretCurve[horizon - 1],
      finalOptRate: optRateCurve[horizon - 1],
      lastPulls: lastPulls,
      lastQ: lastQ
    };
  }

  function banditSim(opts) {
    opts = opts || {};
    var eps = clamp(opts.eps !== undefined ? opts.eps : 0.12, 0, 0.5);
    var ucbC = clamp(opts.ucbC !== undefined ? opts.ucbC : 0.75, 0.1, 3.0);
    var horizon = Math.max(40, Math.min(600, opts.horizon || 300));
    var trials = Math.max(10, Math.min(250, opts.trials || 80));
    var seed = opts.seed !== undefined ? opts.seed : 42;

    var greedy = runBanditStrategy('eps', 0, horizon, trials, seed);
    var epsGreedy = runBanditStrategy('eps', eps, horizon, trials, seed + 50000);
    var ucb = runBanditStrategy('ucb', ucbC, horizon, trials, seed + 100000);

    return {
      means: BANDIT_MEANS.slice(),
      bestArm: BANDIT_BEST_ARM,
      bestMean: BANDIT_BEST_MEAN,
      horizon: horizon,
      trials: trials,
      eps: eps,
      ucbC: ucbC,
      greedy: greedy,
      epsGreedy: epsGreedy,
      ucb: ucb
    };
  }

  // =========================================================================
  // 2 & 3. 5x5 GRIDWORLD MDP, BELLMAN EQUATIONS, VALUE & POLICY ITERATION
  // =========================================================================
  var GRID_ROWS = 5;
  var GRID_COLS = 5;
  var START = { r: 4, c: 0 };
  var GOAL = { r: 0, c: 4 };
  var TRAP = { r: 0, c: 2 };
  var WALLS = [
    { r: 1, c: 1 },
    { r: 2, c: 1 },
    { r: 3, c: 3 }
  ];
  // Actions: 0: Up, 1: Right, 2: Down, 3: Left
  var DR = [-1, 0, 1, 0];
  var DC = [0, 1, 0, -1];
  var ACTION_NAMES = ['U', 'R', 'D', 'L'];

  function isWall(r, c) {
    for (var i = 0; i < WALLS.length; i++) {
      if (WALLS[i].r === r && WALLS[i].c === c) return true;
    }
    return false;
  }

  function isTerminal(r, c) {
    return (r === GOAL.r && c === GOAL.c) || (r === TRAP.r && c === TRAP.c);
  }

  function stepCell(r, c, a) {
    var nr = r + DR[a];
    var nc = c + DC[a];
    if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS || isWall(nr, nc)) {
      return { r: r, c: c };
    }
    return { r: nr, c: nc };
  }

  function cellTransitions(r, c, a, slip, stepCost) {
    if (isTerminal(r, c) || isWall(r, c)) {
      return [];
    }
    var perpLeft = (a + 3) % 4;
    var perpRight = (a + 1) % 4;
    var candidates = [
      { a: a, p: 1 - slip },
      { a: perpLeft, p: slip * 0.5 },
      { a: perpRight, p: slip * 0.5 }
    ];
    var out = [];
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].p <= 0) continue;
      var nxt = stepCell(r, c, candidates[i].a);
      var rew = stepCost;
      if (nxt.r === GOAL.r && nxt.c === GOAL.c) rew = 10 + stepCost;
      else if (nxt.r === TRAP.r && nxt.c === TRAP.c) rew = -10 + stepCost;
      out.push({ r: nxt.r, c: nxt.c, p: candidates[i].p, reward: rew });
    }
    return out;
  }

  function emptyGrid(val) {
    var g = [];
    for (var r = 0; r < GRID_ROWS; r++) {
      var row = [];
      for (var c = 0; c < GRID_COLS; c++) row.push(val);
      g.push(row);
    }
    return g;
  }

  function cloneGrid(g) {
    return g.map(function (row) { return row.slice(); });
  }

  function qValueAt(V, r, c, a, gamma, slip, stepCost) {
    var trans = cellTransitions(r, c, a, slip, stepCost);
    var sum = 0;
    for (var i = 0; i < trans.length; i++) {
      var t = trans[i];
      var nextV = isTerminal(t.r, t.c) ? 0 : V[t.r][t.c];
      sum += t.p * (t.reward + gamma * nextV);
    }
    return sum;
  }

  function buildFixedPolicy(mode) {
    var pol = emptyGrid(1);
    for (var r = 0; r < GRID_ROWS; r++) {
      for (var c = 0; c < GRID_COLS; c++) {
        if (mode === 'alwaysGoal') {
          // Naive Manhattan toward (0,4): move Up if r > 0 else Right
          if (r > 0 && !isWall(r - 1, c)) pol[r][c] = 0;
          else if (c < 4 && !isWall(r, c + 1)) pol[r][c] = 1;
          else if (r > 0) pol[r][c] = 0;
          else pol[r][c] = 1;
        } else if (mode === 'cautious') {
          // Climb left column 0 all the way to row 0, then cross row 0 to Goal
          if (c > 0 && r > 0 && !(r === 4 && c === 0)) {
            if (r === 1 && c === 4) pol[r][c] = 0;
            else if (!isWall(r, c - 1) && c <= 2) pol[r][c] = 3;
            else pol[r][c] = 0;
          } else if (r > 0) {
            pol[r][c] = 0;
          } else {
            pol[r][c] = 1;
          }
        } else {
          pol[r][c] = 1;
        }
      }
    }
    return pol;
  }

  function evaluateFixedPolicy(pol, gamma, slip, stepCost, tol) {
    var V = emptyGrid(0);
    var maxDelta = 0;
    var limit = tol || 1e-8;
    for (var iter = 0; iter < 500; iter++) {
      maxDelta = 0;
      var Vnext = cloneGrid(V);
      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          if (isWall(r, c) || isTerminal(r, c)) continue;
          var nv = qValueAt(V, r, c, pol[r][c], gamma, slip, stepCost);
          maxDelta = Math.max(maxDelta, Math.abs(nv - V[r][c]));
          Vnext[r][c] = nv;
        }
      }
      V = Vnext;
      if (maxDelta < limit) break;
    }
    return { V: V, residual: maxDelta };
  }

  function solveOptimalGrid(gamma, slip, stepCost, tol) {
    var V = emptyGrid(0);
    var pol = emptyGrid(0);
    var maxDelta = 0;
    var limit = tol || 1e-8;
    for (var iter = 0; iter < 500; iter++) {
      maxDelta = 0;
      var Vnext = cloneGrid(V);
      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          if (isWall(r, c) || isTerminal(r, c)) continue;
          var bestQ = -1e18;
          var bestA = 0;
          for (var a = 0; a < 4; a++) {
            var q = qValueAt(V, r, c, a, gamma, slip, stepCost);
            if (q > bestQ + 1e-12) {
              bestQ = q;
              bestA = a;
            }
          }
          maxDelta = Math.max(maxDelta, Math.abs(bestQ - V[r][c]));
          Vnext[r][c] = bestQ;
          pol[r][c] = bestA;
        }
      }
      V = Vnext;
      if (maxDelta < limit) break;
    }
    return { V: V, policy: pol, residual: maxDelta };
  }

  function mdpEvaluate(opts) {
    opts = opts || {};
    var gamma = clamp(opts.gamma !== undefined ? opts.gamma : 0.9, 0.2, 0.99);
    var slip = clamp(opts.slip !== undefined ? opts.slip : 0.15, 0, 0.4);
    var stepCost = clamp(opts.stepCost !== undefined ? opts.stepCost : -0.1, -1.0, 0);
    var policyMode = opts.policyMode || 'optimal';

    var V, policy, residual;
    if (policyMode === 'optimal') {
      var opt = solveOptimalGrid(gamma, slip, stepCost);
      V = opt.V;
      policy = opt.policy;
      residual = opt.residual;
    } else {
      policy = buildFixedPolicy(policyMode);
      var ev = evaluateFixedPolicy(policy, gamma, slip, stepCost);
      V = ev.V;
      residual = ev.residual;
    }

    // Also provide sample policy-vs-optimal start comparison
    var optRef = solveOptimalGrid(gamma, slip, stepCost);
    var greedyRef = evaluateFixedPolicy(buildFixedPolicy('alwaysGoal'), gamma, slip, stepCost);

    // Deterministic discounted path formula check (8 steps to goal with slip=0)
    var eightStepExact = Math.pow(gamma, 7) * (10 + stepCost);
    for (var s = 0; s < 7; s++) {
      eightStepExact += Math.pow(gamma, s) * stepCost;
    }

    return {
      rows: GRID_ROWS,
      cols: GRID_COLS,
      start: START,
      goal: GOAL,
      trap: TRAP,
      walls: WALLS.slice(),
      gamma: gamma,
      slip: slip,
      stepCost: stepCost,
      policyMode: policyMode,
      V: V,
      policy: policy,
      residual: residual,
      startValue: V[START.r][START.c],
      optStartValue: optRef.V[START.r][START.c],
      naiveStartValue: greedyRef.V[START.r][START.c],
      eightStepExact: eightStepExact,
      goalApproachActionAt03: optRef.policy[0][3],
      actionNames: ACTION_NAMES.slice()
    };
  }

  function dpIterate(opts) {
    opts = opts || {};
    var gamma = clamp(opts.gamma !== undefined ? opts.gamma : 0.9, 0.2, 0.99);
    var slip = clamp(opts.slip !== undefined ? opts.slip : 0.15, 0, 0.4);
    var stepCost = clamp(opts.stepCost !== undefined ? opts.stepCost : -0.1, -1.0, 0);
    var maxIters = Math.max(10, Math.min(80, opts.maxIters || 45));

    // Value Iteration frames
    var Vvi = emptyGrid(0);
    var polVi = emptyGrid(1);
    var viFrames = [{
      iter: 0,
      V: cloneGrid(Vvi),
      policy: cloneGrid(polVi),
      maxDelta: 0
    }];
    var viConvergedAt = null;

    for (var it = 1; it <= maxIters; it++) {
      var Vnext = cloneGrid(Vvi);
      var polNext = cloneGrid(polVi);
      var maxDelta = 0;
      for (var r = 0; r < GRID_ROWS; r++) {
        for (var c = 0; c < GRID_COLS; c++) {
          if (isWall(r, c) || isTerminal(r, c)) continue;
          var bestQ = -1e18;
          var bestA = 0;
          for (var a = 0; a < 4; a++) {
            var q = qValueAt(Vvi, r, c, a, gamma, slip, stepCost);
            if (q > bestQ + 1e-12) {
              bestQ = q;
              bestA = a;
            }
          }
          maxDelta = Math.max(maxDelta, Math.abs(bestQ - Vvi[r][c]));
          Vnext[r][c] = bestQ;
          polNext[r][c] = bestA;
        }
      }
      Vvi = Vnext;
      polVi = polNext;
      viFrames.push({
        iter: it,
        V: cloneGrid(Vvi),
        policy: cloneGrid(polVi),
        maxDelta: maxDelta
      });
      if (viConvergedAt === null && maxDelta < 1e-4) {
        viConvergedAt = it;
      }
    }

    // Policy Iteration frames (starts from naive East/Up policy)
    var polPi = emptyGrid(1);
    var piFrames = [];
    var piConvergedAt = null;
    for (var pIt = 0; pIt <= 15; pIt++) {
      var evalRes = evaluateFixedPolicy(polPi, gamma, slip, stepCost, 1e-8);
      var changed = 0;
      var newPol = cloneGrid(polPi);
      for (var pr = 0; pr < GRID_ROWS; pr++) {
        for (var pc = 0; pc < GRID_COLS; pc++) {
          if (isWall(pr, pc) || isTerminal(pr, pc)) continue;
          var oldA = polPi[pr][pc];
          var oldQ = qValueAt(evalRes.V, pr, pc, oldA, gamma, slip, stepCost);
          var bestQ2 = oldQ;
          var bestA2 = oldA;
          for (var pa = 0; pa < 4; pa++) {
            var pq = qValueAt(evalRes.V, pr, pc, pa, gamma, slip, stepCost);
            if (pq > bestQ2 + 1e-9) {
              bestQ2 = pq;
              bestA2 = pa;
            }
          }
          if (bestA2 !== oldA) {
            changed += 1;
          }
          newPol[pr][pc] = bestA2;
        }
      }
      piFrames.push({
        iter: pIt,
        V: cloneGrid(evalRes.V),
        policy: cloneGrid(polPi),
        changedActions: changed
      });
      if (changed === 0) {
        piConvergedAt = pIt;
        break;
      }
      polPi = newPol;
    }

    var exact = solveOptimalGrid(gamma, slip, stepCost, 1e-10);
    return {
      gamma: gamma,
      slip: slip,
      stepCost: stepCost,
      viFrames: viFrames,
      piFrames: piFrames,
      viConvergedAt: viConvergedAt !== null ? viConvergedAt : maxIters,
      piConvergedAt: piConvergedAt !== null ? piConvergedAt : piFrames.length - 1,
      Vstar: exact.V,
      policyStar: exact.policy
    };
  }

  // =========================================================================
  // 4. MODEL-FREE TD CONTROL: CLIFF WALKING (Q-LEARNING VS SARSA)
  // =========================================================================
  var CW_ROWS = 4;
  var CW_COLS = 12;
  var CW_START = { r: 3, c: 0 };
  var CW_GOAL = { r: 3, c: 11 };

  function cwStep(r, c, a) {
    var nr = clamp(r + DR[a], 0, CW_ROWS - 1);
    var nc = clamp(c + DC[a], 0, CW_COLS - 1);
    if (nr === 3 && nc >= 1 && nc <= 10) {
      return { r: CW_START.r, c: CW_START.c, reward: -100, terminal: false, fell: true };
    }
    if (nr === CW_GOAL.r && nc === CW_GOAL.c) {
      return { r: nr, c: nc, reward: -1, terminal: true, fell: false };
    }
    return { r: nr, c: nc, reward: -1, terminal: false, fell: false };
  }

  function cwEpsGreedy(Q, idx, eps, rng) {
    if (eps > 0 && rng() < eps) {
      return Math.floor(rng() * 4);
    }
    var base = idx * 4;
    var best = -1e18;
    var ties = [];
    for (var a = 0; a < 4; a++) {
      var q = Q[base + a];
      if (q > best + 1e-12) {
        best = q;
        ties = [a];
      } else if (Math.abs(q - best) <= 1e-12) {
        ties.push(a);
      }
    }
    return ties[Math.floor(rng() * ties.length)];
  }

  function extractGreedyPath(Q) {
    var r = CW_START.r;
    var c = CW_START.c;
    var path = [{ r: r, c: c }];
    var seen = {};
    var ret = 0;
    for (var step = 0; step < 60; step++) {
      var key = r + ',' + c;
      if (seen[key]) break;
      seen[key] = true;
      var idx = r * CW_COLS + c;
      var base = idx * 4;
      var bestA = 0;
      var bestQ = -1e18;
      for (var a = 0; a < 4; a++) {
        if (Q[base + a] > bestQ) {
          bestQ = Q[base + a];
          bestA = a;
        }
      }
      var res = cwStep(r, c, bestA);
      ret += res.reward;
      r = res.r;
      c = res.c;
      path.push({ r: r, c: c });
      if (res.terminal) break;
    }
    return { path: path, greedyReturn: ret, reachedGoal: r === CW_GOAL.r && c === CW_GOAL.c };
  }

  function runCliffAlgo(mode, alpha, eps, episodes, runs, seedBase) {
    var retSum = new Float64Array(episodes);
    var fallsTotal = 0;
    var lastQ = null;
    var nStates = CW_ROWS * CW_COLS;

    for (var run = 0; run < runs; run++) {
      var rng = mulberry32((seedBase + run * 4099) >>> 0);
      var Q = new Float64Array(nStates * 4);
      var runFalls = 0;

      for (var ep = 0; ep < episodes; ep++) {
        var r = CW_START.r;
        var c = CW_START.c;
        var sIdx = r * CW_COLS + c;
        var a = cwEpsGreedy(Q, sIdx, eps, rng);
        var epRet = 0;

        for (var step = 0; step < 300; step++) {
          var res = cwStep(r, c, a);
          epRet += res.reward;
          if (res.fell) runFalls += 1;
          var nsIdx = res.r * CW_COLS + res.c;
          var na = res.terminal ? 0 : cwEpsGreedy(Q, nsIdx, eps, rng);

          var target;
          if (res.terminal) {
            target = res.reward;
          } else if (mode === 'sarsa') {
            target = res.reward + Q[nsIdx * 4 + na];
          } else {
            var maxNq = -1e18;
            for (var k = 0; k < 4; k++) {
              if (Q[nsIdx * 4 + k] > maxNq) maxNq = Q[nsIdx * 4 + k];
            }
            target = res.reward + maxNq;
          }

          Q[sIdx * 4 + a] += alpha * (target - Q[sIdx * 4 + a]);
          r = res.r;
          c = res.c;
          sIdx = nsIdx;
          a = na;
          if (res.terminal) break;
        }
        retSum[ep] += Math.max(-180, epRet);
      }

      fallsTotal += runFalls;
      if (run === runs - 1) {
        lastQ = Q;
      }
    }

    var raw = new Array(episodes);
    var smooth = new Array(episodes);
    var w = 15;
    for (var i = 0; i < episodes; i++) {
      raw[i] = retSum[i] / runs;
      var s = 0;
      var cnt = 0;
      for (var j = Math.max(0, i - w + 1); j <= i; j++) {
        s += raw[j];
        cnt += 1;
      }
      smooth[i] = s / cnt;
    }

    var last50 = 0;
    var start50 = Math.max(0, episodes - 50);
    for (var m = start50; m < episodes; m++) {
      last50 += raw[m];
    }
    last50 /= (episodes - start50);

    var greedyInfo = extractGreedyPath(lastQ);
    return {
      raw: raw,
      smooth: smooth,
      meanLast50: last50,
      avgFallsPerRun: fallsTotal / runs,
      greedyPath: greedyInfo.path,
      greedyReturn: greedyInfo.greedyReturn,
      reachedGoal: greedyInfo.reachedGoal
    };
  }

  function cliffWalkCompare(opts) {
    opts = opts || {};
    var alpha = clamp(opts.alpha !== undefined ? opts.alpha : 0.4, 0.05, 0.9);
    var eps = clamp(opts.eps !== undefined ? opts.eps : 0.1, 0.01, 0.35);
    var episodes = Math.max(60, Math.min(400, opts.episodes || 220));
    var runs = Math.max(4, Math.min(30, opts.runs || 16));
    var seed = opts.seed !== undefined ? opts.seed : 101;

    var qlearning = runCliffAlgo('qlearning', alpha, eps, episodes, runs, seed);
    var sarsa = runCliffAlgo('sarsa', alpha, eps, episodes, runs, seed + 20000);

    return {
      rows: CW_ROWS,
      cols: CW_COLS,
      start: CW_START,
      goal: CW_GOAL,
      alpha: alpha,
      eps: eps,
      episodes: episodes,
      runs: runs,
      qlearning: qlearning,
      sarsa: sarsa
    };
  }

  // =========================================================================
  // 5. POLICY GRADIENT & BASELINES (REINFORCE)
  // =========================================================================
  // 4-action stochastic problem with baseline offset +10 so raw returns are all positive
  var PG_TRUE_REWARDS = [11.0, 12.2, 14.5, 11.8];
  var PG_REWARD_STD = 1.2;

  function softmax(logits) {
    var mx = -1e18;
    for (var i = 0; i < logits.length; i++) if (logits[i] > mx) mx = logits[i];
    var exps = new Array(logits.length);
    var sum = 0;
    for (var j = 0; j < logits.length; j++) {
      exps[j] = Math.exp(logits[j] - mx);
      sum += exps[j];
    }
    for (var k = 0; k < logits.length; k++) exps[k] /= sum;
    return exps;
  }

  function sampleCategorical(probs, rng) {
    var u = rng();
    var acc = 0;
    for (var i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (u <= acc) return i;
    }
    return probs.length - 1;
  }

  function exactGradient(probs) {
    var J = 0;
    for (var i = 0; i < probs.length; i++) J += probs[i] * PG_TRUE_REWARDS[i];
    var g = new Array(probs.length);
    for (var j = 0; j < probs.length; j++) {
      g[j] = probs[j] * (PG_TRUE_REWARDS[j] - J);
    }
    return { J: J, grad: g };
  }

  function measureGradStats(logits, batchSize, useBaseline, trials, seedBase) {
    var probs = softmax(logits);
    var ex = exactGradient(probs);
    var K = probs.length;
    var meanGrad = [0, 0, 0, 0];
    var sqNormSum = 0;
    var grads = [];

    for (var t = 0; t < trials; t++) {
      var rng = mulberry32((seedBase + t * 773) >>> 0);
      var actions = new Int32Array(batchSize);
      var rewards = new Float64Array(batchSize);
      var rSum = 0;
      for (var b = 0; b < batchSize; b++) {
        var a = sampleCategorical(probs, rng);
        var r = PG_TRUE_REWARDS[a] + PG_REWARD_STD * randn(rng);
        actions[b] = a;
        rewards[b] = r;
        rSum += r;
      }
      var baseline = useBaseline ? (rSum / batchSize) : 0;
      var g = [0, 0, 0, 0];
      for (var m = 0; m < batchSize; m++) {
        var adv = rewards[m] - baseline;
        var act = actions[m];
        for (var k = 0; k < K; k++) {
          var score = (k === act ? 1 : 0) - probs[k];
          g[k] += score * adv / batchSize;
        }
      }
      for (var d = 0; d < K; d++) {
        meanGrad[d] += g[d];
      }
      grads.push(g);
    }

    for (var dd = 0; dd < K; dd++) meanGrad[dd] /= trials;
    var varSum = 0;
    for (var tt = 0; tt < trials; tt++) {
      var gErr = 0;
      for (var kk = 0; kk < K; kk++) {
        var diff = grads[tt][kk] - meanGrad[kk];
        gErr += diff * diff;
      }
      varSum += gErr;
      sqNormSum += gErr;
    }

    return {
      exactGrad: ex.grad,
      empiricalMeanGrad: meanGrad,
      gradVariance: varSum / trials,
      gradStd: Math.sqrt(sqNormSum / trials),
      expectedReturn: ex.J
    };
  }

  function runPgOptimization(useBaseline, batchSize, steps, lr, seedBase) {
    var rng = mulberry32(seedBase >>> 0);
    var theta = [0, 0, 0, 0];
    var curve = [];
    var optProbCurve = [];

    for (var s = 0; s <= steps; s++) {
      var probs = softmax(theta);
      var J = 0;
      for (var i = 0; i < 4; i++) J += probs[i] * PG_TRUE_REWARDS[i];
      curve.push(J);
      optProbCurve.push(probs[2]);
      if (s === steps) break;

      var actions = new Int32Array(batchSize);
      var rewards = new Float64Array(batchSize);
      var rSum = 0;
      for (var b = 0; b < batchSize; b++) {
        var a = sampleCategorical(probs, rng);
        var r = PG_TRUE_REWARDS[a] + PG_REWARD_STD * randn(rng);
        actions[b] = a;
        rewards[b] = r;
        rSum += r;
      }
      var baseline = useBaseline ? (rSum / batchSize) : 0;
      var grad = [0, 0, 0, 0];
      for (var m = 0; m < batchSize; m++) {
        var adv = rewards[m] - baseline;
        var act = actions[m];
        for (var k = 0; k < 4; k++) {
          grad[k] += ((k === act ? 1 : 0) - probs[k]) * adv / batchSize;
        }
      }
      for (var d = 0; d < 4; d++) {
        theta[d] = clamp(theta[d] + lr * grad[d], -6, 6);
      }
    }

    return {
      returnCurve: curve,
      optProbCurve: optProbCurve,
      finalReturn: curve[curve.length - 1],
      finalOptProb: optProbCurve[optProbCurve.length - 1]
    };
  }

  function policyGradientLab(opts) {
    opts = opts || {};
    var batchSize = Math.max(4, Math.min(128, opts.batchSize || 16));
    var steps = Math.max(20, Math.min(150, opts.steps || 70));
    var lr = clamp(opts.lr !== undefined ? opts.lr : 0.14, 0.02, 0.4);
    var useBaseline = opts.useBaseline !== undefined ? !!opts.useBaseline : true;
    var seed = opts.seed !== undefined ? opts.seed : 314;

    var initLogits = [0, 0, 0, 0];
    var statsNoBase = measureGradStats(initLogits, batchSize, false, 120, seed);
    var statsWithBase = measureGradStats(initLogits, batchSize, true, 120, seed);

    var noBaseRun = runPgOptimization(false, batchSize, steps, lr, seed + 500);
    var withBaseRun = runPgOptimization(true, batchSize, steps, lr, seed + 500);

    var varianceRatio = statsNoBase.gradVariance / Math.max(1e-6, statsWithBase.gradVariance);

    return {
      trueRewards: PG_TRUE_REWARDS.slice(),
      optimalReturn: 14.5,
      uniformReturn: (11.0 + 12.2 + 14.5 + 11.8) / 4,
      batchSize: batchSize,
      steps: steps,
      lr: lr,
      useBaseline: useBaseline,
      statsNoBase: statsNoBase,
      statsWithBase: statsWithBase,
      varianceReductionFactor: varianceRatio,
      noBaseRun: noBaseRun,
      withBaseRun: withBaseRun
    };
  }

  // =========================================================================
  // 6. ACTOR-CRITIC, PPO CLIPPING & GRPO CRITIC-FREE SCALING
  // =========================================================================
  function ppoObjectiveLab(opts) {
    opts = opts || {};
    var epsClip = clamp(opts.epsClip !== undefined ? opts.epsClip : 0.2, 0.05, 0.4);
    var klBeta = clamp(opts.klBeta !== undefined ? opts.klBeta : 0.05, 0, 0.35);
    var advantage = clamp(opts.advantage !== undefined ? opts.advantage : 1.0, -2.0, 2.0);
    if (Math.abs(advantage) < 0.1) advantage = 1.0;

    var points = [];
    var n = 57;
    for (var i = 0; i < n; i++) {
      var r = 0.4 + (1.4 * i) / (n - 1);
      var unclipped = r * advantage;
      var clippedRatio = clamp(r, 1 - epsClip, 1 + epsClip);
      var clippedSurrogate = Math.min(unclipped, clippedRatio * advantage);
      var klK3 = r - 1 - Math.log(r);
      var withKl = clippedSurrogate - klBeta * klK3;
      points.push({
        r: r,
        unclipped: unclipped,
        ppoClip: clippedSurrogate,
        withKl: withKl,
        kl: klK3,
        isClipped: Math.abs(clippedSurrogate - unclipped) > 1e-9
      });
    }

    return {
      epsClip: epsClip,
      klBeta: klBeta,
      advantage: advantage,
      clipLow: 1 - epsClip,
      clipHigh: 1 + epsClip,
      points: points
    };
  }

  function grpoCompare(opts) {
    opts = opts || {};
    var groupSize = Math.max(2, Math.min(64, opts.groupSize || 16));
    var modelParamsB = clamp(opts.modelParamsB !== undefined ? opts.modelParamsB : 7, 1, 70);
    // Simplified training memory accounting in GB (BF16 weights 2B/param + AdamW opt states 12B/param for trainable models, 2B/param for frozen inference copies)
    // PPO trains Actor (14B/param) + Critic (14B/param) and holds frozen Reference (2B/param) + Reward model (2B/param) -> 32B/param
    // GRPO drops Critic (saves 14B/param) and with rule/verifier rewards drops neural Reward model (saves 2B/param, or keeps it if RLHF) -> 16B/param (verifier) or 18B/param (neural RM)
    var ppoTotalGB = modelParamsB * 32;
    var grpoVerifierGB = modelParamsB * 16;
    var memorySavingPct = (1 - grpoVerifierGB / ppoTotalGB) * 100;
    // Sample variance of baseline-mean error scales as 1 / (G - 1)
    var baselineErrorFactor = 1 / Math.sqrt(groupSize - 1);
    return {
      groupSize: groupSize,
      modelParamsB: modelParamsB,
      ppoTotalGB: ppoTotalGB,
      grpoVerifierGB: grpoVerifierGB,
      memorySavingPct: memorySavingPct,
      baselineErrorFactor: baselineErrorFactor
    };
  }

  // =========================================================================
  // 7. PLANNING & SELF-PLAY: MCTS ON TIC-TAC-TOE WITH EXACT MINIMAX ORACLE
  // =========================================================================
  var TTT_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function tttWinner(b) {
    for (var i = 0; i < TTT_LINES.length; i++) {
      var L = TTT_LINES[i];
      var s = b[L[0]] + b[L[1]] + b[L[2]];
      if (s === 3) return 1;
      if (s === -3) return -1;
    }
    return 0;
  }

  function tttLegal(b) {
    var moves = [];
    for (var i = 0; i < 9; i++) if (b[i] === 0) moves.push(i);
    return moves;
  }

  function tttTurn(b) {
    var sum = 0;
    for (var i = 0; i < 9; i++) sum += b[i];
    return sum === 0 ? 1 : -1;
  }

  var _minimaxCache = Object.create(null);

  function minimaxOracle(board) {
    var key = board.join(',');
    if (_minimaxCache[key]) return _minimaxCache[key];

    var win = tttWinner(board);
    if (win !== 0) {
      var resW = { value: win, bestMoves: [] };
      _minimaxCache[key] = resW;
      return resW;
    }
    var legal = tttLegal(board);
    if (legal.length === 0) {
      var resD = { value: 0, bestMoves: [] };
      _minimaxCache[key] = resD;
      return resD;
    }

    var turn = tttTurn(board);
    var bestVal = turn === 1 ? -2 : 2;
    var bestMoves = [];
    var moveValues = {};

    for (var i = 0; i < legal.length; i++) {
      var mv = legal[i];
      board[mv] = turn;
      var child = minimaxOracle(board);
      board[mv] = 0;
      moveValues[mv] = child.value;
      if ((turn === 1 && child.value > bestVal) || (turn === -1 && child.value < bestVal)) {
        bestVal = child.value;
        bestMoves = [mv];
      } else if (child.value === bestVal) {
        bestMoves.push(mv);
      }
    }

    var out = { value: bestVal, bestMoves: bestMoves, moveValues: moveValues, turn: turn };
    _minimaxCache[key] = out;
    return out;
  }

  // Tactical test position: X to move, O threatens bottom-row win or fork if X misses defense,
  // or X has a unique winning fork! Let's verify X:0, O:4, X:8 -> wait:
  // Board: [1, 0, 0,  0, -1, 0,  0, 0, 0]? Even sharper:
  // X=(0, 8), O=(4, 1) -> turn=X(count X=2, O=2). Wait: O threatens 1-4-7 (col 1)!
  // Legal: 2,3,5,6,7. If X plays 7 (blocks O's 1-4-7), does X survive or can X win with 2 or 6? Let's check with minimaxOracle!
  var DEFAULT_TTT_BOARD = [1, -1, 0, 0, -1, 0, 0, 0, 1];

  function createMctsNode(board, move, parent, turnJustPlayed) {
    return {
      board: board.slice(),
      move: move,
      parent: parent,
      turnJustPlayed: turnJustPlayed,
      untried: tttLegal(board),
      children: [],
      visits: 0,
      winsForPlayerJustPlayed: 0
    };
  }

  function mctsSearch(opts) {
    opts = opts || {};
    var board = (opts.board || DEFAULT_TTT_BOARD).slice();
    var budget = Math.max(5, Math.min(800, opts.budget || 120));
    var cUct = clamp(opts.cUct !== undefined ? opts.cUct : 1.41, 0.1, 3.0);
    var seed = opts.seed !== undefined ? opts.seed : 77;
    var rng = mulberry32(seed >>> 0);

    var rootTurn = tttTurn(board);
    var oracle = minimaxOracle(board.slice());
    var winRoot = tttWinner(board);
    var rootLegal = tttLegal(board);
    if (winRoot !== 0 || rootLegal.length === 0) {
      return {
        board: board,
        rootTurn: rootTurn,
        budget: budget,
        cUct: cUct,
        oracle: oracle,
        children: [],
        chosenMove: null,
        isMinimaxOptimal: true,
        treeNodesCount: 1,
        terminal: true,
        winner: winRoot
      };
    }

    var root = createMctsNode(board, null, null, -rootTurn);
    var nodesCreated = 1;

    for (var sim = 0; sim < budget; sim++) {
      var node = root;
      // 1. Selection
      while (node.untried.length === 0 && node.children.length > 0 && tttWinner(node.board) === 0) {
        var bestChild = null;
        var bestUcb = -1e18;
        var logN = Math.log(Math.max(1, node.visits));
        for (var ci = 0; ci < node.children.length; ci++) {
          var ch = node.children[ci];
          var exploit = ch.winsForPlayerJustPlayed / ch.visits;
          var explore = cUct * Math.sqrt(logN / ch.visits);
          var score = exploit + explore;
          if (score > bestUcb) {
            bestUcb = score;
            bestChild = ch;
          }
        }
        node = bestChild;
      }

      // 2. Expansion
      if (node.untried.length > 0 && tttWinner(node.board) === 0) {
        var pickIdx = Math.floor(rng() * node.untried.length);
        var mv = node.untried.splice(pickIdx, 1)[0];
        var nextBoard = node.board.slice();
        var nextPlayer = tttTurn(node.board);
        nextBoard[mv] = nextPlayer;
        var childNode = createMctsNode(nextBoard, mv, node, nextPlayer);
        node.children.push(childNode);
        node = childNode;
        nodesCreated += 1;
      }

      // 3. Rollout (uniform random playout)
      var simBoard = node.board.slice();
      var w = tttWinner(simBoard);
      while (w === 0) {
        var rem = tttLegal(simBoard);
        if (rem.length === 0) break;
        var rMv = rem[Math.floor(rng() * rem.length)];
        simBoard[rMv] = tttTurn(simBoard);
        w = tttWinner(simBoard);
      }

      // 4. Backpropagation
      var cur = node;
      while (cur !== null) {
        cur.visits += 1;
        if (w === cur.turnJustPlayed) {
          cur.winsForPlayerJustPlayed += 1;
        } else if (w === 0) {
          cur.winsForPlayerJustPlayed += 0.5;
        }
        cur = cur.parent;
      }
    }

    var childStats = root.children.map(function (ch) {
      return {
        move: ch.move,
        visits: ch.visits,
        winRate: ch.winsForPlayerJustPlayed / ch.visits,
        minimaxVal: oracle.moveValues[ch.move],
        isMinimaxBest: oracle.bestMoves.indexOf(ch.move) !== -1
      };
    });
    childStats.sort(function (a, b) { return b.visits - a.visits; });

    var chosenMove = childStats.length > 0 ? childStats[0].move : null;
    var isOpt = chosenMove !== null && oracle.bestMoves.indexOf(chosenMove) !== -1;

    return {
      board: board,
      rootTurn: rootTurn,
      budget: budget,
      cUct: cUct,
      oracle: oracle,
      children: childStats,
      chosenMove: chosenMove,
      isMinimaxOptimal: isOpt,
      treeNodesCount: nodesCreated,
      terminal: false,
      winner: 0
    };
  }

  // =========================================================================
  // 8. REWARD HACKING & GOODHART'S LAW (COAST-LOOP MDP)
  // =========================================================================
  // 6 states: 0(Start) -> 1 -> 2(Coin Bay) -> 3 -> 4 -> 5(Finish, terminal)
  // From state 2:
  //   action 0 ("forward"): 2 -> 3 (stepCost = -0.2, trueReward = -0.2, proxyReward = -0.2)
  //   action 1 ("farm"):    2 -> 2 (collects coin +coinReward, trueReward = -0.2, proxyReward = coinReward - 0.2 - klReg * 0.4)
  // Actually let's make an explicit 2-state sub-loop 2 -> 5_coin -> 2 vs 2 -> 3 -> 4 -> 6(Finish),
  // or simple 6 states 0..5 where state 5 is Finish and action 1 at state 2 loops 2->2 with klPenalty:
  // Let's make it crisp and exact:
  // Step cost s = 0.2 per transition.
  // Finish line at state 5 gives +goalReward on transition 4 -> 5 (so net 4->5 is goalReward - 0.2).
  // From state 2, going forward takes 3 steps (2->3->4->5).
  // If action 1 ("farm coin") is taken at state 2, agent stays at state 2 and receives proxy reward coinReward - 0.2 - klPenalty
  // (where klPenalty = klReg * 1.5 represents KL regularization penalizing deviation from base forward policy).
  function rewardHackingGrid(opts) {
    opts = opts || {};
    var coinReward = clamp(opts.coinReward !== undefined ? opts.coinReward : 0.9, 0, 2.5);
    var goalReward = clamp(opts.goalReward !== undefined ? opts.goalReward : 10, 4, 20);
    var klReg = clamp(opts.klReg !== undefined ? opts.klReg : 0, 0, 2.0);
    var gamma = clamp(opts.gamma !== undefined ? opts.gamma : 0.92, 0.75, 0.98);
    var stepCost = 0.2;
    var klPenalty = klReg * 1.5;

    // Exact value of going straight from state 2 to Finish (2 -> 3 -> 4 -> 5)
    var VforwardFrom2 = -stepCost - gamma * stepCost + Math.pow(gamma, 2) * (goalReward - stepCost);
    // Exact infinite loop value at state 2 if farming coins forever
    var farmImmediate = coinReward - stepCost - klPenalty;
    var VloopForever = farmImmediate / (1 - gamma);

    // Solve exact Bellman optimality on states 0..4 (state 5 terminal = 0)
    var V = [0, 0, 0, 0, 0, 0];
    var policy = [0, 0, 0, 0, 0];
    for (var it = 0; it < 400; it++) {
      var Vnext = V.slice();
      for (var st = 0; st < 5; st++) {
        var forwardVal = (st === 4 ? (goalReward - stepCost) : (-stepCost + gamma * V[st + 1]));
        var best = forwardVal;
        var bestA = 0;
        if (st === 2) {
          var farmVal = farmImmediate + gamma * V[2];
          if (farmVal > best + 1e-12) {
            best = farmVal;
            bestA = 1;
          }
        }
        Vnext[st] = best;
        policy[st] = bestA;
      }
      V = Vnext;
    }

    var isHacking = policy[2] === 1;
    // Roll out 30 steps under learned policy from state 0 to measure TRUE objective vs PROXY objective
    var cur = 0;
    var trueUndiscounted = 0;
    var proxyUndiscounted = 0;
    var coinsCollected = 0;
    var stepsTaken = 0;
    var reachedGoal = false;
    var loopSteps = 0;

    for (var step = 0; step < 30; step++) {
      if (cur === 5) break;
      stepsTaken += 1;
      var act = policy[cur];
      if (cur === 2 && act === 1) {
        coinsCollected += 1;
        loopSteps += 1;
        trueUndiscounted += -stepCost;
        proxyUndiscounted += farmImmediate;
      } else {
        var rTrue = cur === 4 ? (goalReward - stepCost) : -stepCost;
        trueUndiscounted += rTrue;
        proxyUndiscounted += rTrue;
        cur += 1;
        if (cur === 5) {
          reachedGoal = true;
          break;
        }
      }
    }

    // Critical coin reward threshold where VloopForever == VforwardFrom2 (with klReg=0 and with current klReg)
    var critNoKl = VforwardFrom2 * (1 - gamma) + stepCost;
    var critWithKl = critNoKl + klPenalty;

    return {
      coinReward: coinReward,
      goalReward: goalReward,
      klReg: klReg,
      klPenalty: klPenalty,
      gamma: gamma,
      stepCost: stepCost,
      V: V,
      policy: policy,
      VforwardFrom2: VforwardFrom2,
      VloopForever: VloopForever,
      isHacking: isHacking,
      reachedGoal: reachedGoal,
      coinsCollected: coinsCollected,
      loopSteps: loopSteps,
      stepsTaken: stepsTaken,
      trueReturn: trueUndiscounted,
      proxyReturn: proxyUndiscounted,
      critNoKl: critNoKl,
      critWithKl: critWithKl
    };
  }

  // =========================================================================
  // 9. FRONTIER STATUS BLOCK (AS OF 2026-11-11) & PROSE FACTS HELPER
  // =========================================================================
  var FRONTIER = {
    asOf: '2026-11-11',
    tracks: [
      {
        id: 'rlvr',
        arxiv: 'arXiv:2501.12948',
        yearMonth: '2025-01',
        status: 'established',
        metricLabelKey: 'rlvr'
      },
      {
        id: 'cot-pass-k',
        arxiv: 'arXiv:2506.14245',
        yearMonth: '2025-06',
        status: 'debated',
        metricLabelKey: 'passk'
      },
      {
        id: 'sim2real-locomotion',
        arxiv: 'arXiv:2512.01996',
        yearMonth: '2025-12',
        status: 'demonstrated',
        metricLabelKey: 'locomotion'
      },
      {
        id: 'sim2real-dexterous',
        arxiv: 'arXiv:2502.20396',
        yearMonth: '2025-02',
        status: 'demonstrated',
        metricLabelKey: 'dexterous'
      },
      {
        id: 'cot-monitorability',
        arxiv: 'arXiv:2503.11926',
        yearMonth: '2025-03',
        status: 'demonstrated',
        metricLabelKey: 'monitorability'
      },
      {
        id: 'reward-hacking-survey',
        arxiv: 'arXiv:2604.13602',
        yearMonth: '2026-04',
        status: 'open',
        metricLabelKey: 'hacking'
      }
    ],
    regimes: {
      llmMath: { verifier: 'exact', sampleCost: 'low', failureRisk: 'low', fitAlgo: 'GRPO / RLVR' },
      robotics: { verifier: 'physics', sampleCost: 'medium', failureRisk: 'high', fitAlgo: 'Sim-to-Real SAC/PPO + Domain Rand' },
      boardGame: { verifier: 'exact', sampleCost: 'low', failureRisk: 'none', fitAlgo: 'MCTS + Self-Play (AlphaZero)' },
      openChat: { verifier: 'proxy', sampleCost: 'high', failureRisk: 'reward_hack', fitAlgo: 'PPO / RLHF + KL Penalty' }
    }
  };

  function facts() {
    var b = banditSim({ eps: 0.12, ucbC: 0.75, horizon: 300, trials: 120, seed: 42 });
    var mDefault = mdpEvaluate({ gamma: 0.9, slip: 0.15, stepCost: -0.1, policyMode: 'optimal' });
    var mNoSlip = mdpEvaluate({ gamma: 0.9, slip: 0, stepCost: -0.1, policyMode: 'optimal' });
    var mLowGamma = mdpEvaluate({ gamma: 0.5, slip: 0.15, stepCost: -0.1, policyMode: 'optimal' });
    var dp = dpIterate({ gamma: 0.9, slip: 0.15, stepCost: -0.1, maxIters: 45 });
    var cw = cliffWalkCompare({ alpha: 0.4, eps: 0.1, episodes: 220, runs: 20, seed: 101 });
    var pg = policyGradientLab({ batchSize: 10, steps: 40, lr: 0.14, seed: 314 });
    var ppo = ppoObjectiveLab({ epsClip: 0.2, klBeta: 0.05, advantage: 1.0 });
    var grpo = grpoCompare({ groupSize: 16, modelParamsB: 7 });
    var mctsLow = mctsSearch({ budget: 15, cUct: 1.41, seed: 77 });
    var mctsHigh = mctsSearch({ budget: 250, cUct: 1.41, seed: 77 });
    var rhClean = rewardHackingGrid({ coinReward: 0.3, goalReward: 10, klReg: 0, gamma: 0.92 });
    var rhHack = rewardHackingGrid({ coinReward: 1.2, goalReward: 10, klReg: 0, gamma: 0.92 });
    var rhKlSaved = rewardHackingGrid({ coinReward: 1.2, goalReward: 10, klReg: 0.6, gamma: 0.92 });

    return {
      banditArms: BANDIT_MEANS.length,
      banditHorizon: b.horizon,
      banditBestMean: BANDIT_BEST_MEAN,
      banditGreedyRegret: round(b.greedy.finalRegret, 1),
      banditEpsRegret: round(b.epsGreedy.finalRegret, 1),
      banditUcbRegret: round(b.ucb.finalRegret, 1),
      banditGreedyOptPct: Math.round(b.greedy.finalOptRate * 100),
      banditUcbOptPct: Math.round(b.ucb.finalOptRate * 100),

      gridRows: GRID_ROWS,
      gridCols: GRID_COLS,
      goalReward: 10,
      trapPenalty: -10,
      optStartV: round(mDefault.optStartValue, 2),
      naiveStartV: round(mDefault.naiveStartValue, 2),
      noSlipEightStepV: round(mNoSlip.eightStepExact, 2),
      lowGammaStartV: round(mLowGamma.optStartValue, 2),

      viIters: dp.viConvergedAt,
      piIters: dp.piConvergedAt,

      cwEpisodes: cw.episodes,
      cwQGreedyRet: cw.qlearning.greedyReturn,
      cwSarsaGreedyRet: cw.sarsa.greedyReturn,
      cwQOnlineLast50: round(cw.qlearning.meanLast50, 1),
      cwSarsaOnlineLast50: round(cw.sarsa.meanLast50, 1),

      pgOptReturn: pg.optimalReturn,
      pgUniformReturn: round(pg.uniformReturn, 2),
      pgNoBaseStd: round(pg.statsNoBase.gradStd, 2),
      pgWithBaseStd: round(pg.statsWithBase.gradStd, 2),
      pgVarReduction: round(pg.varianceReductionFactor, 1),
      pgNoBaseFinal: round(pg.noBaseRun.finalReturn, 2),
      pgWithBaseFinal: round(pg.withBaseRun.finalReturn, 2),

      ppoClipLow: round(ppo.clipLow, 2),
      ppoClipHigh: round(ppo.clipHigh, 2),
      ppo7BMemoryGB: grpo.ppoTotalGB,
      grpo7BMemoryGB: grpo.grpoVerifierGB,
      grpoMemorySavingPct: Math.round(grpo.memorySavingPct),

      mctsLowNodes: mctsLow.treeNodesCount,
      mctsHighNodes: mctsHigh.treeNodesCount,
      mctsLowBestMove: mctsLow.chosenMove,
      mctsHighBestMove: mctsHigh.chosenMove,
      mctsOracleMoves: mctsHigh.oracle.bestMoves.slice(),
      mctsHighOptimal: mctsHigh.isMinimaxOptimal,

      rhCritNoKl: round(rhClean.critNoKl, 2),
      rhCleanTrueRet: round(rhClean.trueReturn, 2),
      rhHackTrueRet: round(rhHack.trueReturn, 2),
      rhHackProxyRet: round(rhHack.proxyReturn, 2),
      rhHackCoins: rhHack.coinsCollected,
      rhKlSavedTrueRet: round(rhKlSaved.trueReturn, 2)
    };
  }

  return {
    BANDIT_MEANS: BANDIT_MEANS,
    DEFAULT_TTT_BOARD: DEFAULT_TTT_BOARD,
    FRONTIER: FRONTIER,
    banditSim: banditSim,
    mdpEvaluate: mdpEvaluate,
    dpIterate: dpIterate,
    cliffWalkCompare: cliffWalkCompare,
    policyGradientLab: policyGradientLab,
    ppoObjectiveLab: ppoObjectiveLab,
    grpoCompare: grpoCompare,
    minimaxOracle: minimaxOracle,
    mctsSearch: mctsSearch,
    tttWinner: tttWinner,
    tttTurn: tttTurn,
    rewardHackingGrid: rewardHackingGrid,
    facts: facts
  };
});
