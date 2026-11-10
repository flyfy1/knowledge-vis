'use strict';
// Replication lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// A versioned key-value register copied onto N replicas. One coordinator numbers the writes
// (version 1, 2, 3 …), so "newest" means "highest version". No Raft/Paxos, no read repair,
// no anti-entropy: replicas only change when a write reaches them (the page says so).
(function (root) {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function choose(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  // k distinct indices out of 0..n-1
  function sample(rnd, n, k) { const a = Array.from({ length: n }, (_, i) => i); for (let i = 0; i < k; i++) { const j = i + Math.floor(rnd() * (n - i)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, k).sort((x, y) => x - y); }

  // Step 0: five replicas holding (version, value).
  const N0 = 5, START = { v: 1, val: 100 }, WRITES = [120, 70, 150, 40, 95, 60, 130];
  function cluster0() { return Array.from({ length: N0 }, () => ({ ...START })); }
  function write0(reps, reach, step) { // reach: boolean per replica; returns the new cluster
    const v = Math.max(...reps.map(r => r.v)) + 1, val = WRITES[(step) % WRITES.length];
    return { reps: reps.map((r, i) => (reach[i] ? { v, val } : r)), v, val };
  }
  function staleShare(reps) { const top = Math.max(...reps.map(r => r.v)); return reps.filter(r => r.v < top).length / reps.length; }

  // Step 1: probability that a uniformly random read set of size R misses every replica the
  // newest write reached (exactly W of N). Zero exactly when W + R > N.
  function staleProb(N, W, R) { return choose(N - W, R) / choose(N, R); }

  // Step 2: alternate write, read. Each write reaches W random replicas; each read asks R random
  // replicas and returns the highest version it sees. Stale = lower than the newest version.
  function simulate(N, W, R, ops, seed) {
    const rnd = mulberry32(seed * 1013 + N * 97 + W * 13 + R), vers = new Array(N).fill(1), log = [];
    let latest = 1, reads = 0, stale = 0;
    for (let i = 0; i < ops; i++) {
      const ws = sample(rnd, N, W); latest++; ws.forEach(j => { vers[j] = latest; });
      const rs = sample(rnd, N, R), got = Math.max(...rs.map(j => vers[j])), isStale = got < latest;
      reads++; if (isStale) stale++;
      log.push({ ws, rs, latest, got, stale: isStale, vers: vers.slice(), rate: stale / reads });
    }
    return log;
  }

  // Step 3: each replica is up independently with probability q = 1 − p.
  // Writes need W replicas up, reads need R up. R = N − W + 1 keeps W + R > N.
  function atLeast(N, k, q) { let s = 0; for (let j = k; j <= N; j++) s += choose(N, j) * Math.pow(q, j) * Math.pow(1 - q, N - j); return s; }
  function availability(N, W, p) { const R = N - W + 1, q = 1 - p; return { R, write: atLeast(N, W, q), read: atLeast(N, R, q) }; }
  // brute force over all 2^N up/down patterns (for tests)
  function availabilityBrute(N, W, p) {
    const R = N - W + 1; let w = 0, r = 0;
    for (let m = 0; m < (1 << N); m++) { let up = 0; for (let i = 0; i < N; i++) if (m >> i & 1) up++; const pr = Math.pow(1 - p, up) * Math.pow(p, N - up); if (up >= W) w += pr; if (up >= R) r += pr; }
    return { write: w, read: r };
  }

  // Step 4: a partition splits 5 replicas into a left group of k and a right group of 5 − k.
  // Script: the left client writes 200, then the right client writes 50 (later timestamp),
  // both clients read, then the partition heals. Mode 'cp': majority quorums (W = R = 3);
  // mode 'ap': each side accepts writes and reads locally (W = R = 1), healing keeps the write
  // with the later timestamp (last writer wins).
  const N4 = 5, STAGES = ['split', 'writeL', 'writeR', 'read', 'heal'];
  function partition(k, mode) {
    const left = i => i < k, sizeL = k, sizeR = N4 - k, Q = 3;
    let reps = Array.from({ length: N4 }, () => ({ v: 1, val: 100, ts: 0 }));
    const out = [{ stage: 'split', reps: reps.map(r => ({ ...r })) }];
    const canQ = side => (side === 'L' ? sizeL : sizeR) >= (mode === 'cp' ? Q : 1);
    const doWrite = (side, val, ts) => {
      const ok = canQ(side) && (side === 'L' ? sizeL : sizeR) > 0;
      if (ok) reps = reps.map((r, i) => ((side === 'L') === left(i) ? { v: ts + 1, val, ts } : r));
      return ok;
    };
    const wl = doWrite('L', 200, 1); out.push({ stage: 'writeL', ok: wl, reps: reps.map(r => ({ ...r })) });
    const wr = doWrite('R', 50, 2); out.push({ stage: 'writeR', ok: wr, reps: reps.map(r => ({ ...r })) });
    const readSide = side => { const n = side === 'L' ? sizeL : sizeR; if (!(n > 0 && canQ(side))) return null; const mine = reps.filter((_, i) => (side === 'L') === left(i)); return mine.reduce((a, b) => (b.ts > a.ts ? b : a)).val; };
    const rl = readSide('L'), rr = readSide('R');
    out.push({ stage: 'read', readL: rl, readR: rr, reps: reps.map(r => ({ ...r })) });
    const win = reps.reduce((a, b) => (b.ts > a.ts ? b : a));
    reps = reps.map(() => ({ ...win }));
    const accepted = [wl && 200, wr && 50].filter(Boolean), lost = accepted.filter(v => v !== win.val);
    out.push({ stage: 'heal', final: win.val, lost, reps: reps.map(r => ({ ...r })) });
    return { stages: out, sizeL, sizeR, wl, wr, rl, rr, final: win.val, lost, consistentReads: rl === null || rr === null || rl === rr };
  }

  const api = { choose, sample, mulberry32, N0, START, WRITES, cluster0, write0, staleShare, staleProb, simulate, atLeast, availability, availabilityBrute, N4, STAGES, partition };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.REPL_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);
