/* Why we get sleepy: the models behind every chart on the page.
 * Pure functions only (no DOM). Loaded by index.html as window.SleepModels and by tests/models.cjs via require().
 *
 * 1. Process S (sleep pressure): Daan, Beersma & Borbély 1984, time constants as listed by Borbély & Achermann 1999
 *    and Skeldon, Dijk & Derks 2014 (Fig. 1 parameters): rises toward 1 with τw = 18.2 h while awake, decays toward 0
 *    with τs = 4.2 h while asleep.
 * 2. Two-process model: sleep starts when S reaches H⁺ = 0.60 + a·C(t), ends when S falls to H⁻ = 0.17 + a·C(t),
 *    a = 0.10, C a 24 h sinusoid (same source). Where C sits on the clock is set by the circadian model below.
 * 3. Circadian pacemaker: Forger, Jewett & Kronauer 1999 ("a simpler model of the human circadian pacemaker") with the
 *    light-activation rate of St Hilaire et al. 2007, parameters as tabulated by Papatsimpa et al. 2021 (Sci Rep 11:13709).
 *    Core-body-temperature minimum (CBTmin) = the moment the polar angle of (x, y) passes −170.7°, plus 0.97 h.
 * 4. Caffeine: one-compartment oral absorption (Bateman function), first-order elimination.
 * Time is in hours throughout. Clock times are hours after midnight of day 0.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SleepModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LN2 = Math.log(2), TAU2 = 2 * Math.PI, D2R = Math.PI / 180;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const mod24 = t => ((t % 24) + 24) % 24;
  const wrap12 = d => mod24(d + 12) - 12;            // signed difference in (−12, 12]

  /* ───────── 1 · Process S ───────── */
  const S = {
    TW: 18.2, TS: 4.2,
    wake: (s, h) => 1 - (1 - s) * Math.exp(-h / S.TW),
    sleep: (s, h) => s * Math.exp(-h / S.TS),
    halfRise: () => LN2 * S.TW,                      // time for the distance to 1 to halve while awake
    halfFall: () => LN2 * S.TS,                      // time for S to halve while asleep
    // periodic solution for W h awake then Z h asleep, repeated: S at bedtime and at waking
    periodic(W, Z) {
      const ew = Math.exp(-W / S.TW), es = Math.exp(-Z / S.TS);
      const bed = (1 - ew) / (1 - ew * es);
      return { bed, wake: bed * es };
    },
    // n days of a 24 h routine: wake at 07:00, sleep `Z` h before the next 07:00. The first `pre` days use `Z0` h,
    // starting from the periodic state of Z0. Returns samples [t, S, asleep] every `step` h, plus per-night values.
    routine({ Z, Z0 = 8, days = 7, pre = 1, step = 0.1 }) {
      let s = S.periodic(24 - Z0, Z0).wake, t = 7;
      const out = [[t, s, 0]], nights = [];
      for (let d = 0; d < days; d++) {
        const z = d < pre ? Z0 : Z, w = 24 - z;
        for (let u = step; u <= w + 1e-9; u += step) out.push([t + u, S.wake(s, u), 0]);
        s = S.wake(s, w); t += w; const bed = s;
        for (let u = step; u <= z + 1e-9; u += step) out.push([t + u, S.sleep(s, u), 1]);
        s = S.sleep(s, z); t += z;
        nights.push({ bed, wake: s, z });
      }
      return { series: out, nights };
    }
  };

  /* ───────── 2 · Two-process model ───────── */
  const TP = {
    HU: 0.60, HL: 0.17, A: 0.10,
    // C as a function of clock time, minimum `delta` h after CBTmin (see coupled.DELTA)
    C: (t, cbt, delta) => -Math.cos(TAU2 * (t - cbt - delta) / 24),
    // Simulate from 07:00 on day 0 (awake, S = s0) until `days`·24 h.
    // forcedWake / forcedSleep: lists of [t0, t1] during which the person is kept awake / kept asleep (a nap).
    run({ cbt = 4, delta, a = TP.A, days = 6, s0, forcedWake = [], forcedSleep = [], h = 1 / 60, keep = 1 / 6 }) {
      if (delta == null) delta = coupled.DELTA;
      let s = s0 != null ? s0 : 0.17, t = 7, asleep = false;
      const series = [], events = [];
      const inAny = (list, x) => list.some(([p, q]) => x >= p - 1e-9 && x < q - 1e-9);
      let next = t;
      while (t < days * 24 - 1e-9) {
        const c = TP.C(t, cbt, delta), up = TP.HU + a * c, lo = TP.HL + a * c;
        const fw = inAny(forcedWake, t), fs = inAny(forcedSleep, t);
        if (!asleep && (fs || (s >= up && !fw))) { asleep = true; events.push({ type: 'sleep', t, forced: fs && s < up }); }
        else if (asleep && !fs && (s <= lo || fw)) { asleep = false; events.push({ type: 'wake', t, forced: fw || (s > lo) }); }
        if (t >= next - 1e-9) { series.push([t, s, up, lo, asleep ? 1 : 0]); next += keep; }
        s = asleep ? S.sleep(s, h) : S.wake(s, h);
        t += h;
      }
      return { series, events };
    },
    // the settled daily cycle for a given clock setting: run `warm` days and read the last sleep episode
    settled({ cbt = 4, delta, a = TP.A, warm = 8 } = {}) {
      const r = TP.run({ cbt, delta, a, days: warm });
      const ev = r.events;
      let i = ev.length - 1; while (i > 0 && ev[i].type !== 'wake') i--;
      const w = ev[i], sl = ev[i - 1];
      return { onset: sl ? sl.t : null, wake: w ? w.t : null, dur: sl && w ? w.t - sl.t : null, run: r };
    },
    // sleepiness: how far S is above the sleep threshold (positive = the model would fall asleep if allowed)
    pushIndex: (s, up) => s - up,
    // the cycle length the model settles into (mean gap between the last few sleep onsets)
    cycle({ cbt = 3.5, a = TP.A, days = 30 } = {}) {
      const on = TP.run({ cbt, a, days }).events.filter(e => e.type === 'sleep').map(e => e.t).slice(-7);
      return (on[on.length - 1] - on[0]) / (on.length - 1);
    },
    /* Staying up, napping, all-nighters. Five ordinary days, then on day 5: an optional one-hour nap at 14:00 and
     * `extra` hours kept awake past the natural sleep onset. Times returned are hours since midnight of day 5. */
    scenario({ extra = 0, nap = false, cbt = 3.5 } = {}) {
      const D = 5 * 24, nat = TP.settled({ cbt });
      const natOn = D + mod24(nat.onset);                     // tonight's natural onset
      const forcedWake = extra > 0 ? [[D + 20, natOn + extra]] : [];
      const forcedSleep = nap ? [[D + 14, D + 15]] : [];
      // start from the settled waking value of S so day 0 already looks like day 5
      const s0 = S.periodic(24 - nat.dur, nat.dur).wake;
      const r = TP.run({ cbt, days: 9, s0, forcedWake, forcedSleep, keep: 1 / 12 });
      const after = r.events.filter(e => e.t > D + 15.5);
      const sl = after.filter(e => e.type === 'sleep');
      const rec = sl[0], recW = rec && after.find(e => e.type === 'wake' && e.t > rec.t);
      const nx = sl[1], nxW = nx && after.find(e => e.type === 'wake' && e.t > nx.t);
      // worst sleepiness while kept awake, and the gap S − H⁺ at chosen clock times during the extra hours
      let worst = null;
      for (const q of r.series) if (forcedWake.length && q[0] >= forcedWake[0][0] && q[0] < forcedWake[0][1] && (!worst || q[1] - q[2] > worst.gap)) worst = { t: q[0] - D, gap: q[1] - q[2] };
      const gapAt = t => { const q = r.series.reduce((b, x) => Math.abs(x[0] - (D + t)) < Math.abs(b[0] - (D + t)) ? x : b); return q[1] - q[2]; };
      return {
        run: r, D, natural: { onset: natOn - D, dur: nat.dur },
        rec: rec && recW ? { onset: rec.t - D, wake: recW.t - D, dur: recW.t - rec.t } : null,
        next: nx && nxW ? { onset: nx.t - D, wake: nxW.t - D, dur: nxW.t - nx.t } : null,
        worst, gapAt
      };
    }
  };

  /* ───────── 3 · Circadian pacemaker (Forger–Jewett–Kronauer 1999, St Hilaire 2007 light drive) ───────── */
  const jfk = {
    P: { mu: 0.13, q: 1 / 3, k: 0.55, tau: 24.2, a0: 0.1, beta: 0.007, G: 37, b: 0.4, I0: 9500, p: 0.5 },
    H: 0.05,
    CBT_ANGLE: -170.7, CBT_LAG: 0.97,
    alpha(I) { const P = jfk.P; return I <= 0 ? 0 : P.a0 * Math.pow(I / P.I0, P.p) * I / (I + 100); },
    deriv(x, y, n, I, tau) {
      const P = jfk.P, a = jfk.alpha(I), B = P.G * a * (1 - n) * (1 - P.b * x) * (1 - P.b * y), w = Math.PI / 12;
      return [
        w * (y + P.mu * (x / 3 + 4 * x * x * x / 3 - 256 * Math.pow(x, 7) / 105) + B),
        w * (P.q * B * y - (Math.pow(24 / (0.99729 * tau), 2) + P.k * B) * x),
        60 * (a * (1 - n) - P.beta * n)
      ];
    },
    // one RK4 step of length h at constant light I (lux); o = {x, y, n}
    step(o, h, I, tau) {
      const d = jfk.deriv;
      const k1 = d(o.x, o.y, o.n, I, tau);
      const k2 = d(o.x + k1[0] * h / 2, o.y + k1[1] * h / 2, o.n + k1[2] * h / 2, I, tau);
      const k3 = d(o.x + k2[0] * h / 2, o.y + k2[1] * h / 2, o.n + k2[2] * h / 2, I, tau);
      const k4 = d(o.x + k3[0] * h, o.y + k3[1] * h, o.n + k3[2] * h, I, tau);
      o.x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      o.y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      o.n += h / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    },
    angle: o => Math.atan2(o.y, o.x) / D2R,
    // hours since the last CBTmin, from the polar angle (the angle falls by ~15° per hour)
    sinceCBT(o) { const a = jfk.angle(o); return mod24((jfk.CBT_ANGLE - a) / 15 - jfk.CBT_LAG); },
    // a state on the limit cycle whose CBTmin falls at clock time `cbt` when started at time t0
    init(cbt, t0 = 0, tau = jfk.P.tau) {
      const o = { x: 0, y: -1, n: 0 }; // run in darkness for 10 cycles to land on the limit cycle
      for (let i = 0; i < 240 / jfk.H; i++) jfk.step(o, jfk.H, 0, tau);
      // advance in darkness until hours-since-CBTmin matches the wanted phase at t0
      const want = mod24(t0 - cbt);
      for (let i = 0; i < 26 / jfk.H && Math.abs(wrap12(jfk.sinceCBT(o) - want)) > jfk.H * 0.6; i++) jfk.step(o, jfk.H, 0, tau);
      return o;
    },
    // run with a light function light(t) → lux; returns CBTmin times (clock hours) and optional samples
    run({ days, light, tau = jfk.P.tau, o, t0 = 0, sample = 0 }) {
      o = o || jfk.init(4, t0, tau);
      const h = jfk.H, cbt = [], samples = [];
      let t = t0, prev = jfk.angle(o), nextS = t0;
      while (t < t0 + days * 24 - 1e-9) {
        if (sample && t >= nextS - 1e-9) { samples.push([t, o.x, o.y]); nextS += sample; }
        jfk.step(o, h, light(t), tau); t += h;
        const a = jfk.angle(o);
        if (prev > jfk.CBT_ANGLE && a <= jfk.CBT_ANGLE && prev - a < 180) {
          const f = (prev - jfk.CBT_ANGLE) / (prev - a);   // linear interpolation inside the step
          cbt.push(t - h + f * h + jfk.CBT_LAG);
        }
        prev = a;
      }
      return { cbt, o, samples };
    },
    // phase shift (h, + = advance) from one light pulse of `dur` h at `lux`, centred `offset` h after CBTmin,
    // against a background of darkness. Measured on CBTmin three to four cycles later.
    prc({ offset, dur = 6.7, lux = 9500, tau = jfk.P.tau }) {
      const t0 = 0, cbt0 = 24;                 // first CBTmin at hour 24
      const o1 = jfk.init(cbt0, t0, tau), o2 = { ...o1 };
      const c = cbt0 + offset, L = t => (t >= c - dur / 2 && t < c + dur / 2) ? lux : 0;
      const days = 6;
      const ref = jfk.run({ days, light: () => 0, tau, o: o1, t0 });
      const pul = jfk.run({ days, light: L, tau, o: o2, t0 });
      const tEnd = t0 + days * 24 - 30;
      const a = ref.cbt.filter(v => v <= tEnd).pop(), b = pul.cbt.reduce((best, v) => Math.abs(v - a) < Math.abs(best - a) ? v : best, Infinity);
      return a - b;
    },
    prcCurve({ dur = 6.7, lux = 9500, tau = jfk.P.tau, step = 1 }) {
      const out = [];
      for (let o = -12; o <= 12 + 1e-9; o += step) out.push([o, jfk.prc({ offset: o, dur, lux, tau })]);
      return out;
    },
    // free run in darkness: CBTmin clock times day by day
    freeRun({ tau = jfk.P.tau, days = 20, cbt0 = 4 }) {
      const o = jfk.init(cbt0, 0, tau);
      return jfk.run({ days, light: () => 0, tau, o, t0: 0 }).cbt;
    }
  };

  /* ───────── light diets (lux by local clock time while awake) ───────── */
  const light = {
    // `day` lux 07:00–19:00, `eve` lux in the evening and at night while awake
    simple: (day, eve) => loc => (loc >= 7 && loc < 19 ? day : eve),
    // indoors at `indoor` lux with an outdoor hour (10 000 lux) on the way in and out
    office: (indoor, eve) => loc => ((loc >= 7.5 && loc < 8.5) || (loc >= 17.5 && loc < 18.5)) ? 10000 : (loc >= 7 && loc < 19 ? indoor : eve)
  };

  /* ───────── 4 · Coupled: pacemaker sets C, two-process sets sleep, sleep sets light ─────────
   * C(t) = −cos(2π·(hours since CBTmin − DELTA)/24). DELTA is tuned (not sourced): it places the model's natural
   * wake time 3.5 h after CBTmin, inside the 3–4.5 h measured range quoted by Eastman & Burgess 2009. */
  const coupled = {
    DELTA: 1.5,
    // mode(t, loc, dayIndex) → 'free' (thresholds decide), 'awake' (kept awake), 'bed' (lights off, asleep unless
    // S has fallen to the wake threshold, then lying awake in the dark)
    run({ days = 21, tau = jfk.P.tau, lux = light.simple(1000, 100), mode = () => 'free', shift = () => 0, cbt0 = 4, s0 = 0.2, sample = 0 }) {
      const h = jfk.H, o = jfk.init(cbt0, 7, tau);
      let s = s0, asleep = false, t = 7, prev = jfk.angle(o), nextS = 7;
      const cbt = [], cbtAt = [], events = [], samples = [];
      while (t < 7 + days * 24 - 1e-9) {
        const off = shift(t), loc = mod24(t + off), day = Math.floor((t + off) / 24);
        const psi = jfk.sinceCBT(o), C = -Math.cos(TAU2 * (psi - coupled.DELTA) / 24);
        const up = TP.HU + TP.A * C, lo = TP.HL + TP.A * C;
        const m = mode(t, loc, day);
        let want = asleep;
        if (m === 'awake') want = false;
        else want = asleep ? s > lo : s >= up; // 'free' and 'bed' use the same thresholds; only the light differs
        if (want !== asleep) { asleep = want; events.push({ type: asleep ? 'sleep' : 'wake', t, loc: t + off }); }
        const I = (asleep || m === 'bed') ? 0 : lux(loc, day);
        if (sample && t >= nextS - 1e-9) { samples.push([t + off, s, up, lo, asleep ? 1 : 0, I]); nextS += sample; }
        jfk.step(o, h, I, tau);
        s = asleep ? S.sleep(s, h) : S.wake(s, h);
        t += h;
        const a = jfk.angle(o);
        if (prev > jfk.CBT_ANGLE && a <= jfk.CBT_ANGLE && prev - a < 180) {
          const f = (prev - jfk.CBT_ANGLE) / (prev - a);
          cbt.push(t - h + f * h + jfk.CBT_LAG + off); cbtAt.push(t - h + f * h + jfk.CBT_LAG);
        }
        prev = a;
      }
      return { cbt, cbtAt, events, samples };   // cbt in local clock hours, cbtAt in elapsed (home) hours
    },
    // sleep episodes as [onset, wake] in local clock hours
    episodes(events) {
      const out = [];
      for (let i = 0; i < events.length; i++) if (events[i].type === 'sleep') {
        const w = events.slice(i + 1).find(e => e.type === 'wake');
        if (w) out.push([events[i].loc, w.loc]);
      }
      return out;
    },
    // CBTmin drift per day over the last `n` cycles (0 when the clock is held by the light, ~τ−24 when free-running)
    drift(cbt, n = 5) { const c = cbt.slice(-n - 1); let s = 0; for (let i = 1; i < c.length; i++) s += c[i] - c[i - 1] - 24; return s / (c.length - 1); },

    /* ch4: the clock in a dark room (light 0) or in an ordinary day (in bed 23:00–07:00, `lux` otherwise),
     * starting from the CBTmin it settles to in the ordinary day. Returns CBTmin clock times, one per cycle. */
    isolation({ tau = jfk.P.tau, days = 20, dark = true, lux = light.simple(1000, 150) } = {}) {
      const ordinary = (t, loc) => (loc >= 23 || loc < 7) ? 'bed' : 'awake';
      const warm = coupled.run({ days: 20, tau, lux, mode: ordinary });
      const start = warm.cbt[warm.cbt.length - 1];
      if (!dark) { const r = coupled.run({ days: 20 + days, tau, lux, mode: ordinary }); return r.cbt.filter(v => v > 20 * 24 + 7).slice(0, days); }
      const o = jfk.init(mod24(start), 0, tau);
      return jfk.run({ days, light: () => 0, tau, o, t0: 0 }).cbt.slice(0, days);
    },

    /* ch6: free days only, sleep whenever the thresholds say so; light `day` lux 07–19, `eve` lux otherwise. */
    chronotype({ tau = jfk.P.tau, day = 1000, eve = 150, days = 40 } = {}) {
      const r = coupled.run({ days, tau, lux: light.simple(day, eve) });
      const ep = coupled.episodes(r.events).slice(-7);
      const drift = coupled.drift(r.cbt);
      const last = ep[ep.length - 1];
      return { run: r, held: Math.abs(drift) < 0.05, drift, cbt: mod24(r.cbt[r.cbt.length - 1]), onset: mod24(last[0]), wake: mod24(last[1]), dur: last[1] - last[0], episodes: ep };
    },

    /* ch7: fly N time zones (east > 0) at 07:00 on day `W` after `W` ordinary days; at both ends the traveller is in
     * bed (dark) 23:00–07:00 local time and up otherwise. Misalignment = local CBTmin minus where it sat at home. */
    jet({ N, tau = jfk.P.tau, lux = light.simple(1000, 150), W = 10, days = 16 } = {}) {
      const mode = (t, loc) => (loc >= 23 || loc < 7) ? 'bed' : 'awake';
      const arrive = 7 + W * 24;
      const r = coupled.run({ days: W + days, tau, lux, mode, shift: t => t >= arrive ? N : 0, sample: 0.25 });
      const home = mod24(r.cbt.filter((v, i) => r.cbtAt[i] < arrive).pop());
      const after = r.cbt.filter((v, i) => r.cbtAt[i] > arrive + 0.5);   // CBTmins after landing, in local time
      const mis = after.map(v => ({ day: (v - (arrive + N)) / 24, d: wrap12(v - home) }));
      // days after landing until the clock is within 1 h of home alignment and stays there
      let settle = null;
      for (let i = 0; i < mis.length; i++) if (mis.slice(i).every(m => Math.abs(m.d) < 1)) { settle = mis[i].day; break; }
      // which way did the clock go? compare the first three days' change with the needed direction
      const moved = mis.length > 3 ? mis[3].d - mis[0].d : 0;
      const antidromic = N !== 0 && Math.sign(moved) === Math.sign(N) && Math.abs(moved) > 0.5;
      // full local nights (23–07) and days (07–23) after landing: hours asleep in bed, hours awake with S above H⁺.
      // Local clock = elapsed + N, and local 07:00 of the flight day is `arrive` on that clock; landing is at local 7 + N.
      const nights = [], doze = [];
      for (let k = 0; k < 6; k++) {
        const n0 = arrive + 16 + k * 24, d0 = arrive + (N > 0 ? 24 : 0) + k * 24;
        nights.push(r.samples.filter(q => q[0] >= n0 && q[0] < n0 + 8 && q[4]).length * 0.25);
        doze.push(r.samples.filter(q => q[0] >= d0 && q[0] < d0 + 16 && !q[4] && q[1] >= q[2]).length * 0.25);
      }
      return { mis, settle, antidromic, home, nights, doze };
    },

    /* ch8: a week of workdays (Mon–Fri) and free days (Sat, Sun).
     *  kind 'office': on workdays an alarm forces waking at 07:00; otherwise sleep is free.
     *  kind 'night':  five night shifts 23:00–07:00 (Mon night to Sat morning) at `work` lux, then an hour outside at
     *                 `commute` lux, then the curtains are drawn 08:00–15:00 (in bed, asleep when sleepy). On days off
     *                 the worker returns to ordinary nights (in bed 23:00–07:00) with a 14:00–18:00 nap before Monday's shift.
     *  Day index 0 is a Monday. Returns the last two weeks. */
    week({ kind = 'office', tau = jfk.P.tau, day = 1000, eve = 150, work = 100, commute = 1000, weeks = 12 } = {}) {
      const dow = d => ((d % 7) + 7) % 7;
      const state = (loc, d) => {
        const w = dow(d);
        if (kind === 'office') return (w < 5 && Math.abs(loc - 7) < jfk.H / 2 + 1e-9) ? 'alarm' : 'free';
        if ((loc >= 23 && w < 5) || (loc < 7 && w >= 1 && w <= 5)) return 'work';
        if (loc >= 7 && loc < 8 && w >= 1 && w <= 5) return 'commute';
        if (loc >= 8 && loc < 15 && w >= 1 && w <= 5) return 'bed';
        // days off: back to ordinary nights (in bed 23:00–07:00 Sat and Sun nights) and a nap 14:00–18:00 before Monday's shift
        if ((loc >= 23 && w >= 5) || (loc < 7 && (w === 6 || w === 0)) || (w === 0 && loc >= 14 && loc < 18)) return 'bed';
        return 'free';
      };
      const mode = (t, loc, d) => { const s = state(loc, d); return s === 'alarm' || s === 'work' || s === 'commute' ? 'awake' : s === 'bed' ? 'bed' : 'free'; };
      const lux = (loc, d) => { const s = state(loc, d); return s === 'work' ? work : s === 'commute' ? commute : (loc >= 7 && loc < 19 ? day : eve); };
      const total = weeks * 7, from = (total - 14) * 24;
      const r = coupled.run({ days: total + 1, tau, lux, mode, sample: 0.25 });
      const ep = coupled.episodes(r.events).filter(e => e[0] >= from - 6 && e[1] > from).map(([a, b]) => ({ a, b, dur: b - a, mid: (a + b) / 2, wakeDow: dow(Math.floor(b / 24)) }));
      const cbt = r.cbt.filter(v => v >= from && v < from + 14 * 24);
      const out = { from, episodes: ep, cbt, samples: r.samples.filter(q => q[0] >= from && q[0] < from + 14 * 24) };
      if (kind === 'office') {
        // main sleep episodes (≥ 3 h), grouped by the morning they end on
        const main = ep.filter(e => e.dur >= 3);
        const wd = main.filter(e => e.wakeDow <= 4), fr = main.filter(e => e.wakeDow >= 5);          // Mon–Fri mornings vs Sat, Sun
        const mean = a => a.reduce((s, e) => s + e.dur, 0) / a.length;
        out.midWork = meanAngleHours(wd.map(e => e.mid)); out.midFree = meanAngleHours(fr.map(e => e.mid));
        out.sjl = wrap12(out.midFree - out.midWork);
        out.durWork = mean(wd); out.durFree = mean(fr);
        // Sunday night: the sleep that ends on Monday morning
        const mon = wd.filter(e => e.wakeDow === 0).pop(); out.sundayOnset = mon ? mod24(mon.a) : null; out.mondayDur = mon ? mon.dur : null;
      } else {
        // CBTmin at the end of the shift run (Saturday) and at the end of the weekend (Monday), and day sleep after shifts
        const at = d => { const c = cbt.filter(v => v >= from + d * 24 && v < from + (d + 1) * 24); return c.length ? mod24(c[0]) : null; };
        out.cbtMon = at(7); out.cbtSat = at(12);                       // before the first shift, after the fifth
        out.moved = out.cbtMon != null && out.cbtSat != null ? wrap12(out.cbtSat - out.cbtMon) : null; // + = later
        const daySleeps = ep.filter(e => { const w = dow(Math.floor(e.a / 24)), h = mod24(e.a); return w >= 1 && w <= 5 && h >= 7.5 && h < 15; });
        out.daySleep = daySleeps.length ? daySleeps.reduce((s, e) => s + e.dur, 0) / daySleeps.length : 0;
        out.drift = coupled.drift(r.cbt, 6);
        // the same weekday one week apart: near 0 when the weekly pattern repeats, large when the clock keeps sliding
        out.weekShift = at(5) != null && out.cbtSat != null ? wrap12(out.cbtSat - at(5)) : null;
      }
      return out;
    }
  };

  /* ───────── 5 · Caffeine: oral dose, first-order absorption and elimination ───────── */
  const caffeine = {
    KA: 4, // absorption rate (1/h): peak about 50–60 min after a dose for half-lives of 3–7 h
    // amount in the body (mg) at time t after doses [{t, mg}], half-life `half` h
    amount(t, doses, half) {
      const ke = LN2 / half, ka = caffeine.KA; let a = 0;
      for (const d of doses) if (t > d.t) { const u = t - d.t; a += d.mg * ka / (ka - ke) * (Math.exp(-ke * u) - Math.exp(-ka * u)); }
      return a;
    },
    tmax(half) { const ke = LN2 / half, ka = caffeine.KA; return Math.log(ka / ke) / (ka - ke); }
  };

  /* small helpers shared with the page */
  function meanAngleHours(list) { // circular mean of clock hours
    let sx = 0, sy = 0; for (const v of list) { sx += Math.cos(TAU2 * v / 24); sy += Math.sin(TAU2 * v / 24); }
    return mod24(Math.atan2(sy, sx) * 24 / TAU2);
  }

  return { LN2, clamp, mod24, wrap12, S, TP, jfk, light, coupled, caffeine, meanAngleHours };
}));
