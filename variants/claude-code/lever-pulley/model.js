'use strict';
// Levers & pulleys lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Ideal machines throughout: no friction, rigid weightless bars, weightless rope and pulleys.
// Units: kg, N, m, N·m, J; g = 10 N/kg everywhere. tests/core.cjs pins every claim the page makes.
(function (root) {
  const G_ACC = 10;
  const EPS = 1e-9;
  const weight = kg => kg * G_ACC;
  const torque = (F, arm) => F * arm;

  // ---- step 0: seesaw, pivot in the middle ----
  const SEE = { adult: 60, child: 30, step: 0.2, min: 0.4, max: 2.0 };
  function seesaw(mL, dL, mR, dR) {
    const ML = torque(weight(mL), dL), MR = torque(weight(mR), dR), diff = ML - MR;
    const balanced = Math.abs(diff) <= EPS;
    // Tilt angle is illustrative only (the torques are the real numbers): 14°·tanh(ΔM / 200 N·m).
    const tilt = balanced ? 0 : 14 * Math.tanh(diff / 200);
    return { FL: weight(mL), FR: weight(mR), ML, MR, diff, balanced, heavier: balanced ? 'none' : diff > 0 ? 'left' : 'right', tilt };
  }
  // Where must the right-hand person sit to balance? (null if outside the board's seats)
  const balanceSeat = (mL, dL, mR) => torque(weight(mL), dL) / weight(mR);

  // ---- step 1: crowbar ----
  const BAR = { length: 1.5, rock: 800 };
  function crowbar(Lr, G = BAR.rock, length = BAR.length) {
    const Le = length - Lr, F = G * Lr / Le;
    return { Lr, Le, F, Min: torque(F, Le), Mout: torque(G, Lr), gain: Le / Lr };
  }

  // ---- step 2: the work ledger ----
  // Bar pivots at the fulcrum; hand at distance Le, rock at Lr. Both forces are vertical, so for a turn θ the
  // hand moves down s = Le·sinθ and the rock rises h = Lr·sinθ (exactly, no small-angle approximation), and
  // the force needed stays F = G·Lr/Le throughout.
  const LEDGER = { G: 800, Lr: 0.3, lift: 0.05 };
  function ledger(ratio, frac = 1) {
    const { G, Lr, lift } = LEDGER, Le = ratio * Lr, sinMax = lift / Lr, sin = sinMax * frac;
    const F = G * Lr / Le, s = Le * sin, h = Lr * sin;
    return { ratio, Le, Lr, F, s, h, Win: F * s, Wout: G * h, theta: Math.asin(sin) * 180 / Math.PI, thetaMax: Math.asin(sinMax) * 180 / Math.PI };
  }

  // ---- step 3: fixed pulley ----
  const FIXED = { G: 200 };
  const fixedPulley = (s, G = FIXED.G) => ({ F: G, s, h: s, Win: G * s, Wout: G * s, direct: { F: G, s, h: s } });

  // ---- step 4: pulley block with n supporting segments ----
  // Winding used on the page: n segments hold the moving block; the free end always comes DOWN off a fixed
  // sheave and is not counted. Odd n: rope tied to the moving block; even n: rope tied to the top beam.
  const BLOCK = { G: 600, ns: [2, 3, 4], sMax: 2 };
  function pulleyBlock(n, s, G = BLOCK.G) {
    const F = G / n, h = s / n;
    return { n, F, s, h, Win: F * s, Wout: G * h };
  }
  // Rope layout for drawing: which segments turn over the top / under the bottom, where the end is tied.
  function winding(n) {
    const tiedTop = n % 2 === 0, top = [], bottom = [];
    // segment i (0..n−1) runs between the blocks; turn between i and i+1 sits at the top if segment i goes up
    for (let i = 0; i < n; i++) {
      const goesUp = tiedTop ? i % 2 === 1 : i % 2 === 0; // tied at top → segment 0 goes down
      (goesUp ? top : bottom).push(i);                    // turn after segment i
    }
    const lastTurn = top.includes(n - 1) ? 'top' : 'bottom';
    return { tiedTop, topTurns: top, bottomTurns: bottom.filter(i => i < n - 1), lastTurn, freeEnd: 'down', supporting: n };
  }
  // Rope length check: total rope between beam and block = n·(gap) + free end; pulling s shortens the gap by s/n.
  function ropeLength(n, gap, freeEnd) { return n * gap + freeEnd; }

  // ---- step 5: quiz ----
  const QUIZ = {
    q1: () => balanceSeat(80, 1.0, 40),                 // 2.0 m
    q2: () => pulleyBlock(3, 0, 600).F,                 // 200 N
    q3: () => pulleyBlock(4, 3, 600).h                  // 0.75 m
  };

  const api = { G_ACC, EPS, weight, torque, SEE, seesaw, balanceSeat, BAR, crowbar, LEDGER, ledger, FIXED, fixedPulley, BLOCK, pulleyBlock, winding, ropeLength, QUIZ };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LP_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
