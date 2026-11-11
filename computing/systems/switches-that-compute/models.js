/* Models for "switches that compute". Pure functions, no DOM. Usable from the page (window.SwitchModels)
   and from node (require). Every circuit below is a netlist of NAND gates evaluated gate by gate; no
   circuit output is ever read from a table of answers. The only behavioural parts are the tiny machine's
   memory array and instruction decoder, which are named as such in the essay. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SwitchModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── seeded RNG (mulberry32) ───────── */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ───────── ch1: switches controlled by switches ─────────
     A switch is pressed (its coil energised) when its control input is 1.
     'no' = normally open: conducts only when pressed. 'nc' = normally closed: conducts only when not pressed.
     Two switches are wired in series (both must conduct) or in parallel (either conducts). */
  function switchConducts(type, pressed) { return type === 'no' ? !!pressed : !pressed; }
  function relayLamp(cfg, a, b) {
    const s1 = switchConducts(cfg.t1, a), s2 = switchConducts(cfg.t2, b);
    return (cfg.wiring === 'series' ? (s1 && s2) : (s1 || s2)) ? 1 : 0;
  }
  // truth table as 4 outputs for (a,b) = 00, 01, 10, 11
  function relayTable(cfg) { return [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => relayLamp(cfg, a, b)); }
  const TABLE_NAMES = { '0001': 'AND', '0111': 'OR', '1110': 'NAND', '1000': 'NOR', '0110': 'XOR', '1001': 'XNOR',
    '0000': 'ZERO', '1111': 'ONE', '0010': 'A_NOT_B', '0100': 'B_NOT_A', '1011': 'A_OR_NOT_B', '1101': 'B_OR_NOT_A',
    '0011': 'A', '0101': 'B', '1100': 'NOT_A', '1010': 'NOT_B' };
  function nameOfTable(tab) { return TABLE_NAMES[tab.join('')]; }

  /* ───────── ch2: a reader-wired network of NAND gates ─────────
     gates: [{a: src, b: src}], src = 'A' | 'B' | 'g0' | 'g1' ... (only earlier gates) | '' (unused).
     The output is the last gate whose two inputs are both connected. */
  function evalNandNet(gates, A, B) {
    const v = { A, B, '0': 0, '1': 1 };
    let out = null, used = 0;
    for (let i = 0; i < gates.length; i++) {
      const g = gates[i];
      if (!g || !g.a || !g.b) continue;
      if (!(g.a in v) || !(g.b in v)) { v['g' + i] = undefined; continue; }
      if (v[g.a] === undefined || v[g.b] === undefined) continue;
      v['g' + i] = (v[g.a] & v[g.b]) ^ 1; out = 'g' + i; used++;
    }
    return { values: v, out, value: out === null ? null : v[out], used };
  }
  function nandNetTable(gates) {
    const rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => evalNandNet(gates, a, b));
    return { table: rows.map(r => r.value), used: rows[0].used };
  }
  const TARGETS = { NOT: [1, 1, 0, 0], AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], XOR: [0, 1, 1, 0] };
  const SOLUTIONS = {
    NOT: [{ a: 'A', b: 'A' }],
    AND: [{ a: 'A', b: 'B' }, { a: 'g0', b: 'g0' }],
    OR: [{ a: 'A', b: 'A' }, { a: 'B', b: 'B' }, { a: 'g0', b: 'g1' }],
    XOR: [{ a: 'A', b: 'B' }, { a: 'A', b: 'g0' }, { a: 'B', b: 'g0' }, { a: 'g1', b: 'g2' }]
  };
  // Smallest number of 2-input NANDs that computes `target`, by brute force over every network
  // (inputs may also be the constants 0 and 1). Used by the test to pin the counts the prose states.
  function minNands(target, maxK) {
    const want = target.join('');
    for (let k = 1; k <= maxK; k++) {
      let found = false;
      const sigs = [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 1, 1], [0, 1, 0, 1]]; // 0, 1, A, B over rows 00,01,10,11
      (function rec(list, depth) {
        if (found) return;
        if (depth === k) { if (list[list.length - 1].join('') === want) found = true; return; }
        for (let i = 0; i < list.length; i++) for (let j = i; j < list.length; j++) {
          const s = list[i].map((x, r) => (x & list[j][r]) ^ 1);
          list.push(s); rec(list, depth + 1); list.pop();
          if (found) return;
        }
      })(sigs, 0);
      if (found) return k;
    }
    return null;
  }

  /* ───────── ch3: numbers as patterns ───────── */
  function toBits(n, w) { const b = []; for (let i = 0; i < w; i++) b.push((n >>> i) & 1); return b; } // b[0] = lowest
  function fromBits(b) { return b.reduce((s, x, i) => s + (x ? 2 ** i : 0), 0); }
  function toSigned(n, w) { return n >= 2 ** (w - 1) ? n - 2 ** w : n; }
  function flipsOnIncrement(n, w) { const m = 2 ** w, nn = (n + 1) % m; let x = n ^ nn, c = 0; while (x) { c += x & 1; x >>>= 1; } return c; }

  /* ───────── the gate-level engine ─────────
     Signal 0 is constant 0, signal 1 is constant 1. Every other signal is an input or the output of a
     two-input NAND gate. Gates are created in order; a gate may be created before its inputs are known
     (`later`) so feedback loops (latches) can be built. */
  function Circuit() { this.A = [0, 0]; this.B = [0, 0]; this.isGate = [0, 0]; this.D = [1, 1]; this.names = {}; this.nGates = 0; }
  Circuit.prototype.input = function (name) { const i = this.A.length; this.A.push(-1); this.B.push(-1); this.isGate.push(0); this.D.push(1); if (name) this.names[name] = i; return i; };
  Circuit.prototype.nand = function (x, y) { const i = this.A.length; this.A.push(x); this.B.push(y); this.isGate.push(1); this.D.push(1); this.nGates++; return i; };
  // give one gate a longer delay (in ticks)
  Circuit.prototype.slow = function (g, d) { this.D[g] = d; };
  Circuit.prototype.later = function () { return this.nand(-1, -1); };
  Circuit.prototype.connect = function (g, x, y) { this.A[g] = x; this.B[g] = y; };
  Circuit.prototype.compile = function () {
    const n = this.A.length, G = [];
    for (let i = 0; i < n; i++) if (this.isGate[i]) { if (this.A[i] < 0 || this.B[i] < 0) throw new Error('unconnected gate ' + i); G.push(i); }
    this.n = n; this.G = Int32Array.from(G); this.a = Int32Array.from(this.A); this.b = Int32Array.from(this.B);
    return this;
  };
  Circuit.prototype.state = function () { const v = new Uint8Array(this.n); v[1] = 1; return { v, cnt: new Uint8Array(this.n), d: Uint8Array.from(this.D), nv: new Uint8Array(this.n), t: 0 }; };
  // One pass in creation order. For an acyclic circuit built bottom-up this gives the settled outputs.
  Circuit.prototype.settle = function (st) { const v = st.v, G = this.G, a = this.a, b = this.b; for (let k = 0; k < G.length; k++) { const i = G[k]; v[i] = (v[a[i]] & v[b[i]]) ^ 1; } };
  // One tick of time. Every gate looks at the values its inputs had at the start of the tick.
  // Inertial delay: a gate's output changes only after its new value has been asked for d ticks in a row,
  // so pulses shorter than the gate's delay are swallowed, as in real gates. With d = 1 everywhere this is
  // the plain unit-delay model. `jitter` (0..1) is the chance that a due change slips by one more tick.
  Circuit.prototype.tick = function (st, jitter, R) {
    const v = st.v, nv = st.nv, cnt = st.cnt, d = st.d, G = this.G, a = this.a, b = this.b;
    for (let k = 0; k < G.length; k++) { const i = G[k]; nv[i] = (v[a[i]] & v[b[i]]) ^ 1; }
    let changed = 0;
    for (let k = 0; k < G.length; k++) {
      const i = G[k];
      if (nv[i] === v[i]) { cnt[i] = 0; continue; }
      cnt[i]++;
      if (cnt[i] >= d[i] && !(jitter && R() < jitter)) { v[i] = nv[i]; cnt[i] = 0; changed++; }
    }
    st.t++;
    return changed;
  };

  // building blocks, each made only from the ones above it
  const NOT = (c, x) => c.nand(x, x);
  const AND = (c, x, y) => NOT(c, c.nand(x, y));
  const OR = (c, x, y) => c.nand(NOT(c, x), NOT(c, y));
  function XOR(c, x, y) { const n = c.nand(x, y); return c.nand(c.nand(x, n), c.nand(y, n)); }
  function halfAdder(c, x, y) { return { s: XOR(c, x, y), c: AND(c, x, y) }; }
  function fullAdder(c, x, y, cin) { const h1 = halfAdder(c, x, y), h2 = halfAdder(c, h1.s, cin); return { s: h2.s, c: OR(c, h1.c, h2.c) }; }
  function rippleAdder(c, A, B, cin) {
    const S = [], C = [cin];
    for (let i = 0; i < A.length; i++) { const f = fullAdder(c, A[i], B[i], C[i]); S.push(f.s); C.push(f.c); }
    return { S, C };
  }
  // 2-to-1 multiplexer: s = 0 passes x0, s = 1 passes x1
  function MUX(c, s, x0, x1) { const ns = NOT(c, s); return c.nand(c.nand(x0, ns), c.nand(x1, s)); }
  function srLatch(c, S, R) { const sb = NOT(c, S), rb = NOT(c, R), q = c.later(), qn = c.later(); c.connect(q, sb, qn); c.connect(qn, rb, q); return { q, qn, sb, rb }; }
  // D may be null: the latch is then built first and its data wire connected later with setD (used where
  // the data comes from a circuit that itself reads the latch, as in the counter)
  // The two cross-coupled gates of a D latch are made slightly unequal (Q̄'s gate takes 2 ticks), as two
  // real gates never match exactly. With identical gates a latch caught mid-change would flip back and
  // forth forever (chapter 6 shows that on purpose); with the mismatch it falls to one side.
  function dLatch(c, D, E) {
    const sb = D === null ? c.later() : c.nand(D, E), rb = c.nand(sb, E), q = c.later(), qn = c.later();
    c.connect(q, sb, qn); c.connect(qn, rb, q); c.slow(qn, 2);
    return { q, qn, setD(d) { c.connect(sb, d, E); } };
  }
  // master-slave D flip-flop: the master listens while the clock is low, the slave while it is high,
  // so the stored bit changes only at the rising edge. nclk is shared across a register.
  function dFlipFlop(c, D, CLK, nclk) { const m = dLatch(c, D, nclk), s = dLatch(c, m.q, CLK); return { q: s.q, qn: s.qn, m, setD: m.setD }; }

  function countNands(build) { const c = new Circuit(); build(c); return c.nGates; }

  /* ───────── ch4: the 8-bit ripple-carry adder, gate by gate ───────── */
  function buildAdder(w, withSub) {
    const c = new Circuit();
    const A = [], B = [];
    for (let i = 0; i < w; i++) A.push(c.input('a' + i));
    for (let i = 0; i < w; i++) B.push(c.input('b' + i));
    const cin = c.input('cin');
    let sub = null, Bx = B, cin2 = cin;
    if (withSub) { sub = c.input('sub'); Bx = B.map(b => XOR(c, b, sub)); cin2 = sub; }
    const r = rippleAdder(c, A, Bx, cin2);
    const V = withSub ? XOR(c, r.C[w - 1], r.C[w]) : null;
    c.compile();
    return { c, A, B, cin, sub, S: r.S, C: r.C, V, w };
  }
  let ADDER8 = null, ADDSUB8 = null;
  function adder8() { return ADDER8 || (ADDER8 = buildAdder(8, false)); }
  function addSub8() { return ADDSUB8 || (ADDSUB8 = buildAdder(8, true)); }

  function setWord(st, sigs, n) { for (let i = 0; i < sigs.length; i++) st.v[sigs[i]] = (n >>> i) & 1; }
  function readWord(st, sigs) { let n = 0; for (let i = 0; i < sigs.length; i++) n += st.v[sigs[i]] ? 2 ** i : 0; return n; }

  // settled (combinational) add through the gates
  function gateAdd(a, b, cin) { const m = adder8(), st = m.c.state(); setWord(st, m.A, a); setWord(st, m.B, b); st.v[m.cin] = cin ? 1 : 0; m.c.settle(st); return { sum: readWord(st, m.S), cout: st.v[m.C[8]] }; }

  // Timed addition: the adder sits settled at 0 + 0; at t = 0 the inputs switch to a, b.
  // Returns the full history of the sum and carry outputs, tick by tick, until nothing changes.
  const _base = {};
  function timedAdd(a, b, opts) {
    const m = adder8(), c = m.c, cin = opts && opts.cin ? 1 : 0;
    if (!_base[cin]) { const s0 = c.state(); s0.v[m.cin] = cin; c.settle(s0); _base[cin] = s0.v.slice(); }
    const st = c.state(); st.v.set(_base[cin]);
    setWord(st, m.A, a); setWord(st, m.B, b);
    const outs = m.S.concat([m.C[8]]), carries = m.C.slice(1);
    const hist = [outs.map(i => st.v[i])], chist = [carries.map(i => st.v[i])];
    for (let t = 1; t < 400; t++) {
      const ch = c.tick(st);
      hist.push(outs.map(i => st.v[i])); chist.push(carries.map(i => st.v[i]));
      if (ch === 0) break;
    }
    const last = outs.map(() => 0), lastC = carries.map(() => 0);
    for (let k = 0; k < outs.length; k++) for (let t = 1; t < hist.length; t++) if (hist[t][k] !== hist[t - 1][k]) last[k] = t;
    for (let k = 0; k < carries.length; k++) for (let t = 1; t < chist.length; t++) if (chist[t][k] !== chist[t - 1][k]) lastC[k] = t;
    return { hist, chist, lastChange: last, carryLast: lastC, settle: Math.max(...last), sum: readWord(st, m.S), cout: st.v[m.C[8]] };
  }
  // fast variant for sweeping all 65,536 sums: only the settle time and the result
  function settleTime(a, b) {
    const m = adder8(), c = m.c;
    if (!_base[0]) { const s0 = c.state(); c.settle(s0); _base[0] = s0.v.slice(); }
    const st = c.state(); st.v.set(_base[0]); setWord(st, m.A, a); setWord(st, m.B, b);
    const outs = m.S.concat([m.C[8]]); let prev = outs.map(i => st.v[i]), lastT = 0;
    for (let t = 1; t < 400; t++) {
      const ch = c.tick(st);
      for (let k = 0; k < outs.length; k++) { const x = st.v[outs[k]]; if (x !== prev[k]) { lastT = t; prev[k] = x; } }
      if (ch === 0) break;
    }
    return { settle: lastT, sum: readWord(st, m.S), cout: st.v[m.C[8]] };
  }
  // The adder sits settled at a0 + b0; at t = 0 its inputs switch to a1 + b1. Returns every value the sum
  // outputs pass through on the way, and when they stop changing. (Used for the counter, whose adder always
  // starts from the previous count, not from 0 + 0.)
  function transitionAdd(a0, b0, a1, b1) {
    const m = adder8(), c = m.c, st = c.state();
    setWord(st, m.A, a0); setWord(st, m.B, b0); c.settle(st);
    setWord(st, m.A, a1); setWord(st, m.B, b1);
    const seen = [readWord(st, m.S)]; let last = 0;
    for (let t = 1; t < 400; t++) { const ch = c.tick(st), v = readWord(st, m.S); if (v !== seen[seen.length - 1]) { seen.push(v); last = t; } if (ch === 0) break; }
    return { values: seen, settle: last, sum: readWord(st, m.S) };
  }
  // the longest distance a carry has to travel: it is born where both bits are 1 and keeps moving
  // through every following column where exactly one bit is 1
  function carryChain(a, b, w) {
    w = w || 8; let best = 0;
    for (let i = 0; i < w; i++) {
      if (((a >> i) & 1) && ((b >> i) & 1)) { let L = 1, j = i + 1; while (j < w && (((a ^ b) >> j) & 1)) { L++; j++; } best = Math.max(best, L); }
    }
    return best;
  }

  /* ───────── ch5: subtraction is addition ───────── */
  function addSub(a, b, sub) {
    const m = addSub8(), st = m.c.state(); setWord(st, m.A, a); setWord(st, m.B, b); st.v[m.sub] = sub ? 1 : 0; st.v[m.cin] = 0; m.c.settle(st);
    const r = readWord(st, m.S);
    return { result: r, cout: st.v[m.C[8]], overflow: st.v[m.V], signed: toSigned(r, 8), bInverted: sub ? (~b & 255) : b };
  }

  /* ───────── ch6: a latch remembers ───────── */
  function buildSR() { const c = new Circuit(), S = c.input('S'), R = c.input('R'), l = srLatch(c, S, R); c.compile(); return { c, S, R, q: l.q, qn: l.qn, sb: l.sb, rb: l.rb }; }
  function srSim(opts) {
    const m = buildSR(), st = m.c.state(), R = rng((opts && opts.seed) || 7);
    let jitter = (opts && opts.jitter) || 0;
    const delay = (opts && opts.delay) || 2;
    for (let i = 0; i < m.c.n; i++) st.d[i] = m.c.isGate[i] ? delay : 1;
    // start remembering 0
    st.v[m.q] = 0; st.v[m.qn] = 1; st.v[m.S] = 0; st.v[m.R] = 0; for (let k = 0; k < 4; k++) m.c.settle(st);
    return {
      m, st,
      set(s, r) { st.v[m.S] = s ? 1 : 0; st.v[m.R] = r ? 1 : 0; },
      tick() { return m.c.tick(st, jitter, R); },
      q() { return st.v[m.q]; }, qn() { return st.v[m.qn]; }, S() { return st.v[m.S]; }, R() { return st.v[m.R]; },
      setJitter(j) { jitter = j; }
    };
  }
  // Hold S and R both at 1 until settled, then release both in the same tick. Returns how many ticks the
  // latch took to settle (or null if it was still changing after maxT) and which value it kept.
  function srRelease(jitter, seed, maxT) {
    const L = srSim({ jitter, seed }); L.set(1, 1); for (let k = 0; k < 30; k++) L.tick();
    L.set(0, 0); let quiet = 0, t = 0, lastChange = 0;
    for (t = 1; t <= (maxT || 400); t++) {
      const before = L.q() * 2 + L.qn(); L.tick(); const after = L.q() * 2 + L.qn();
      const pending = L.st.cnt[L.m.q] || L.st.cnt[L.m.qn];
      if (before !== after) lastChange = t;
      if (!pending && before === after && L.q() !== L.qn()) { if (++quiet > 8) return { settled: lastChange, q: L.q() }; } else quiet = 0;
    }
    return { settled: null, q: L.q() };
  }

  /* ───────── ch7: a register, an adder, a clock: a counter ───────── */
  function buildCounter(w) {
    w = w || 8;
    const c = new Circuit(), CLK = c.input('clk'), nclk = NOT(c, CLK);
    const ff = [];
    for (let i = 0; i < w; i++) ff.push(dFlipFlop(c, null, CLK, nclk));
    const Q = ff.map(f => f.q);
    const ONE = [1].concat(new Array(w - 1).fill(0)); // the constant 00000001: signal 1 is constant 1, signal 0 constant 0
    const add = rippleAdder(c, Q, ONE, 0);
    for (let i = 0; i < w; i++) ff[i].setD(add.S[i]); // the sum goes back into the register
    c.compile();
    return { c, CLK, Q, S: add.S, ff, w, nGates: c.nGates };
  }
  function counterSim(period, w) {
    const m = buildCounter(w || 8), st = m.c.state();
    // start the register at 0: put each latch in a consistent state, then let everything settle with the clock low
    for (const f of m.ff) { st.v[f.q] = 0; st.v[f.qn] = 1; st.v[f.m.q] = 0; st.v[f.m.qn] = 1; }
    st.v[m.CLK] = 0; for (let k = 0; k < 6; k++) m.c.settle(st); // in-order passes reach a consistent state
    for (let k = 0; k < 60; k++) m.c.tick(st);
    let phase = 0, edges = 0, pending = null;
    const sim = {
      m, st, period,
      // a new period takes effect at the start of the next cycle, so changing it never makes a runt pulse
      setPeriod(P) { pending = P; },
      get edges() { return edges; },
      clk() { return st.v[m.CLK]; },
      value() { return readWord(st, m.Q); },
      // put a number into the register (what a real chip's preset/reset wires do), then let it settle.
      // The clock restarts at the beginning of a period (low), so the next rising edge, inside this
      // period, takes n + 1, whatever the phase was when the button was pressed. (Loading while the clock
      // was high used to leave n in the register at the end of that period, which the page then counted
      // as a wrong step "n → n".)
      load(n) {
        phase = 0; st.v[m.CLK] = 0;
        m.ff.forEach((f, i) => { const b = (n >> i) & 1; st.v[f.q] = b; st.v[f.qn] = b ^ 1; st.v[f.m.q] = b; st.v[f.m.qn] = b ^ 1; });
        for (let k = 0; k < 6; k++) m.c.settle(st);
      },
      bits() { return m.Q.map(i => st.v[i]); },
      // one tick: the clock is low for the first half of each period and high for the second
      tick() {
        if (phase === 0 && pending !== null) { sim.period = pending; pending = null; }
        const P = sim.period, hi = phase >= P / 2 ? 1 : 0;
        if (hi && !st.v[m.CLK]) edges++;
        st.v[m.CLK] = hi; m.c.tick(st); phase = (phase + 1) % P;
        return phase === 0; // true at the end of a full period
      }
    };
    return sim;
  }
  // run `cycles` full periods; compare the register with the number of rising edges seen
  function counterRun(period, cycles) {
    const s = counterSim(period), w = 8, got = [];
    let errors = 0, firstBad = -1, wrongSteps = 0, prev = 0, firstWrongStep = null;
    for (let k = 1; k <= cycles; k++) {
      while (!s.tick()) { /* keep ticking */ }
      const v = s.value(); got.push(v);
      if (v !== k % 256) { errors++; if (firstBad < 0) firstBad = k; }
      if (v !== (prev + 1) % 256) { wrongSteps++; if (!firstWrongStep) firstWrongStep = { from: prev, to: v }; }
      prev = v;
    }
    return { errors, firstBad, got, w, wrongSteps, firstWrongStep };
  }
  function minCounterPeriod(cycles) { for (let P = 2; P <= 200; P += 2) if (counterRun(P, cycles || 300).errors === 0) return P; return null; }

  /* ───────── ch8: choosing — the multiplexer and an arithmetic-logic unit ─────────
     op: 0 = ADD, 1 = SUB, 2 = AND, 3 = OR (two control wires op0, op1). */
  function buildALU(w) {
    const c = new Circuit(), A = [], B = [];
    for (let i = 0; i < w; i++) A.push(c.input('a' + i));
    for (let i = 0; i < w; i++) B.push(c.input('b' + i));
    const op0 = c.input('op0'), op1 = c.input('op1');
    const inv = AND(c, op0, NOT(c, op1));
    const Bx = B.map(b => XOR(c, b, inv));
    const add = rippleAdder(c, A, Bx, inv);
    const andv = [], orv = [], logic = [], res = [];
    for (let i = 0; i < w; i++) {
      andv.push(AND(c, A[i], B[i])); orv.push(OR(c, A[i], B[i]));
      logic.push(MUX(c, op0, andv[i], orv[i]));
      res.push(MUX(c, op1, add.S[i], logic[i]));
    }
    let any = res[0]; for (let i = 1; i < w; i++) any = OR(c, any, res[i]);
    const Z = NOT(c, any);
    c.compile();
    return { c, A, B, op0, op1, sum: add.S, andv, orv, res, Z, C: add.C[w], w };
  }
  let ALU8 = null, ALUST = null;
  function alu8() { return ALU8 || (ALU8 = buildALU(8)); }
  function alu(a, b, op) {
    const m = alu8(); const st = ALUST || (ALUST = m.c.state());
    setWord(st, m.A, a); setWord(st, m.B, b); st.v[m.op0] = op & 1; st.v[m.op1] = (op >> 1) & 1; m.c.settle(st);
    return { result: readWord(st, m.res), z: st.v[m.Z], c: st.v[m.C], arith: readWord(st, m.sum), and: readWord(st, m.andv), or: readWord(st, m.orv) };
  }

  /* ───────── ch9: a tiny stored-program machine ─────────
     16 bytes of memory. An instruction is one byte: high 4 bits = operation, low 4 bits = address.
     Arithmetic, LOAD's zero test and the program counter's +1 all run through the gate-level ALU and
     a 4-bit gate-level adder. The memory array and the instruction decoder are modelled as behaviour. */
  const OPS = ['HALT', 'LOAD', 'STORE', 'ADD', 'SUB', 'JMP', 'JZ'];
  let PCADD = null;
  function pcAdder() { return PCADD || (PCADD = buildAdder(4, false)); }
  function pcPlusOne(pc) { const m = pcAdder(), st = m.c.state(); setWord(st, m.A, pc); setWord(st, m.B, 1); m.c.settle(st); return readWord(st, m.S); }
  const enc = (op, addr) => ((OPS.indexOf(op) & 15) << 4) | (addr & 15);
  function decode(byte) { const op = byte >> 4, addr = byte & 15; return { op, addr, name: OPS[op] || null }; }
  function machine(mem) { return { mem: Uint8Array.from(mem), pc: 0, a: 0, z: 1, ir: 0, halted: false, steps: 0, err: null }; }
  function step(M) {
    if (M.halted) return null;
    const at = M.pc;
    M.ir = M.mem[M.pc];                // fetch
    M.pc = pcPlusOne(M.pc);            // the program counter counts, through a 4-bit adder
    const d = decode(M.ir), x = M.mem[d.addr];
    const info = { at, byte: M.ir, op: d.name, addr: d.addr, jumped: false };
    switch (d.name) {
      case 'HALT': M.halted = true; break;
      case 'LOAD': { const r = alu(0, x, 0); M.a = r.result; M.z = r.z; break; }   // 0 + memory, through the ALU
      case 'STORE': M.mem[d.addr] = M.a; break;
      case 'ADD': { const r = alu(M.a, x, 0); M.a = r.result; M.z = r.z; break; }
      case 'SUB': { const r = alu(M.a, x, 1); M.a = r.result; M.z = r.z; break; }
      case 'JMP': M.pc = d.addr; info.jumped = true; break;
      case 'JZ': if (M.z) { M.pc = d.addr; info.jumped = true; } break;
      default: M.halted = true; M.err = 'unknown'; info.op = null;
    }
    M.steps++;
    return info;
  }
  function run(mem, maxSteps) { const M = machine(mem); while (!M.halted && M.steps < (maxSteps || 10000)) step(M); return M; }
  // multiply x by y by adding x to a running total y times
  function multiplyProgram(x, y) {
    const m = new Array(16).fill(0);
    const P = [['LOAD', 13], ['JZ', 9], ['SUB', 15], ['STORE', 13], ['LOAD', 14], ['ADD', 12], ['STORE', 14], ['JMP', 0], ['HALT', 0], ['HALT', 0]];
    P.forEach(([op, a], i) => { m[i] = enc(op, a); });
    m[12] = x & 255; m[13] = y & 255; m[14] = 0; m[15] = 1;
    return m;
  }
  function countdownProgram(n) {
    const m = new Array(16).fill(0);
    const P = [['LOAD', 13], ['JZ', 5], ['SUB', 15], ['STORE', 13], ['JMP', 0], ['HALT', 0]];
    P.forEach(([op, a], i) => { m[i] = enc(op, a); });
    m[13] = n & 255; m[15] = 1; return m;
  }

  /* ───────── ch10: fractions in finite switches ─────────
     A binary floating-point format with E exponent bits and M stored fraction bits, IEEE-style:
     bias 2^(E-1) - 1, subnormals, round to nearest with ties to even. Exact arithmetic with BigInt. */
  function parseDecimal(s) {
    s = String(s).trim();
    if (!/^\d{0,12}(\.\d{0,14})?$/.test(s) || s === '' || s === '.') return null;
    const [ip, fp = ''] = s.split('.');
    return { p: BigInt((ip || '0') + fp), q: 10n ** BigInt(fp.length) };
  }
  const bitlen = x => x === 0n ? 0 : x.toString(2).length;
  function geq(p, q, e) { return e >= 0 ? p >= (q << BigInt(e)) : (p << BigInt(-e)) >= q; } // p/q >= 2^e
  function roundDiv(num, den) { const qq = num / den, r = num % den, twice = 2n * r; if (twice > den || (twice === den && (qq & 1n))) return qq + 1n; return qq; }
  function scaleRound(p, q, k) { return k >= 0 ? roundDiv(p << BigInt(k), q) : roundDiv(p, q << BigInt(-k)); } // round(p/q * 2^k)
  // returns value = m * 2^s, plus the stored fields
  function roundToFormat(p, q, E, M) {
    const bias = 2 ** (E - 1) - 1, emin = 1 - bias, emax = bias;
    if (p === 0n) return { m: 0n, s: emin - M, expField: 0, frac: 0n, inf: false, sub: false, E, M };
    let e = bitlen(p) - bitlen(q);
    while (!geq(p, q, e)) e--;
    while (geq(p, q, e + 1)) e++;
    if (e < emin) { const m = scaleRound(p, q, M - emin); const norm = m >= (1n << BigInt(M)); return { m, s: emin - M, expField: norm ? 1 : 0, frac: norm ? m - (1n << BigInt(M)) : m, inf: false, sub: !norm, E, M }; }
    let m = scaleRound(p, q, M - e);
    if (m === (1n << BigInt(M + 1))) { m >>= 1n; e++; }
    if (e > emax) return { m: 0n, s: 0, expField: 2 ** E - 1, frac: 0n, inf: true, sub: false, E, M };
    return { m, s: e - M, expField: e + bias, frac: m - (1n << BigInt(M)), inf: false, sub: false, E, M };
  }
  function dyadicToRational(m, s) { return s >= 0 ? { p: m << BigInt(s), q: 1n } : { p: m, q: 1n << BigInt(-s) }; }
  function addFormat(x, y, E, M) { const s = Math.min(x.s, y.s), m = (x.m << BigInt(x.s - s)) + (y.m << BigInt(y.s - s)); const r = dyadicToRational(m, s); return roundToFormat(r.p, r.q, E, M); }
  function exactDecimal(m, s) { // exact decimal string of m * 2^s (always finite)
    if (s >= 0) return (m << BigInt(s)).toString();
    const k = -s, num = m * 5n ** BigInt(k); let str = num.toString().padStart(k + 1, '0');
    let out = str.slice(0, str.length - k) + '.' + str.slice(str.length - k);
    out = out.replace(/0+$/, '').replace(/\.$/, '');
    return out;
  }
  function fieldBits(f) { return { sign: '0', exp: f.expField.toString(2).padStart(f.E, '0'), frac: f.frac.toString(2).padStart(f.M, '0') }; }
  function sameValue(x, y) { if (x.inf || y.inf) return x.inf === y.inf; const s = Math.min(x.s, y.s); return (x.m << BigInt(x.s - s)) === (y.m << BigInt(y.s - s)); }
  // a + b computed in the format, compared with the format's nearest value to the true decimal sum
  function floatSum(aStr, bStr, E, M) {
    const a = parseDecimal(aStr), b = parseDecimal(bStr); if (!a || !b) return null;
    const fa = roundToFormat(a.p, a.q, E, M), fb = roundToFormat(b.p, b.q, E, M);
    const sum = addFormat(fa, fb, E, M);
    const cp = a.p * b.q + b.p * a.q, cq = a.q * b.q, fc = roundToFormat(cp, cq, E, M);
    let ulps = 0;
    if (!sum.inf && !fc.inf) { const s = Math.min(sum.s, fc.s); const diff = (sum.m << BigInt(sum.s - s)) - (fc.m << BigInt(fc.s - s)); ulps = Number(diff) / 2 ** (fc.s - s); }
    return { fa, fb, sum, fc, equal: sameValue(sum, fc), ulps, exactSum: ratToDecimal(cp, cq) };
  }
  function ratToDecimal(p, q) { // p/q where q is a power of ten
    const k = q.toString().length - 1; if (k === 0) return p.toString();
    let str = p.toString().padStart(k + 1, '0'); let out = str.slice(0, str.length - k) + '.' + str.slice(str.length - k);
    return out.replace(/0+$/, '').replace(/\.$/, '');
  }
  // seconds after 1970-01-01 at which a signed 32-bit counter of seconds runs out
  function int32SecondsLimit() { return 2 ** 31 - 1; }

  /* ───────── the ledger: how many NANDs each part we built used ───────── */
  function ledger() {
    return {
      not: countNands(c => NOT(c, c.input())),
      and: countNands(c => AND(c, c.input(), c.input())),
      or: countNands(c => OR(c, c.input(), c.input())),
      xor: countNands(c => XOR(c, c.input(), c.input())),
      halfAdder: countNands(c => halfAdder(c, c.input(), c.input())),
      fullAdder: countNands(c => fullAdder(c, c.input(), c.input(), c.input())),
      adder8: adder8().c.nGates,
      addSub8: addSub8().c.nGates,
      srLatch: countNands(c => srLatch(c, c.input(), c.input())),
      dLatch: countNands(c => dLatch(c, c.input(), c.input())),
      dff: countNands(c => { const k = c.input(); dFlipFlop(c, c.input(), k, NOT(c, k)); }),
      mux: countNands(c => MUX(c, c.input(), c.input(), c.input())),
      counter8: buildCounter(8).nGates,
      alu8: alu8().c.nGates,
      pcAdder4: pcAdder().c.nGates,
      memory16x8: 16 * 8 * countNands(c => dLatch(c, c.input(), c.input()))
    };
  }
  // the tiny machine's parts, all counted in NANDs: ALU, program-counter adder, 16 bytes of memory
  // (one D latch per bit) and its registers (A 8 bits, instruction 8, program counter 4, zero flag 1),
  // which are flip-flops sharing one inverted clock. The instruction decoder and the memory's address
  // decoder are not counted.
  function machineNands() {
    const L = ledger(), regBits = 8 + 8 + 4 + 1;
    const regs = countNands(c => { const k = c.input(), nk = NOT(c, k); for (let i = 0; i < regBits; i++) dFlipFlop(c, c.input(), k, nk); });
    return { alu: L.alu8, pc: L.pcAdder4, memory: L.memory16x8, registers: regs, total: L.alu8 + L.pcAdder4 + L.memory16x8 + regs };
  }

  return {
    rng, switchConducts, relayLamp, relayTable, nameOfTable,
    evalNandNet, nandNetTable, TARGETS, SOLUTIONS, minNands,
    toBits, fromBits, toSigned, flipsOnIncrement,
    Circuit, NOT, AND, OR, XOR, halfAdder, fullAdder, rippleAdder, MUX, srLatch, dLatch, dFlipFlop,
    buildAdder, adder8, addSub8, gateAdd, timedAdd, settleTime, transitionAdd, carryChain, setWord, readWord,
    addSub, buildSR, srSim, srRelease,
    buildCounter, counterSim, counterRun, minCounterPeriod,
    buildALU, alu8, alu,
    OPS, enc, decode, machine, step, run, pcPlusOne, multiplyProgram, countdownProgram,
    parseDecimal, roundToFormat, addFormat, exactDecimal, fieldBits, floatSum, sameValue, int32SecondsLimit,
    ledger, machineNands
  };
});
