/* How a web page arrives: the essay's models as plain functions (UMD: page and node).
 * Every model implements a named, standard result:
 *   dns      iterative resolution by referral with a TTL cache (RFC 1034 §3.6, §5.3.3)
 *   packets  store-and-forward over k equal links; proportionate flow-shop makespan Σp + (k−1)·max p
 *   routing  link-state shortest paths (Dijkstra), as in OSPF (RFC 2328)
 *   queue    M/M/1/K drop-tail queue: closed-form loss and mean occupancy, plus a seeded event simulation
 *   arq      selective-repeat ARQ with per-segment ACKs and a fixed timeout; attempts are geometric, mean 1/(1−p)²
 *   reno     TCP Reno per round trip: slow start, additive increase, halving on loss (RFC 5681; IW 10, RFC 6928);
 *            synchronised losses for several flows (Chiu & Jain 1989)
 *   dh       Diffie–Hellman over the integers mod a small prime
 *   budget   round-trip count × (access + fibre propagation at c / group index)
 * No visible text lives here. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NetModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // seeded RNG (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ───────── 1. DNS: referrals and a TTL cache ───────── */
  const dns = {
    // Round-trip times are assumptions for illustration, stated on the page.
    P: { local: 10, remote: 30, tldTTL: 2 * 86400, zoneTTL: 86400 },
    NAMES: ['www.example.com', 'img.example.com', 'www.example.org'],
    create() { return { t: 0, cache: {} }; },
    zoneOf(name) { const p = name.split('.'); return p.slice(-2).join('.'); },
    tldOf(name) { return name.split('.').pop(); },
    valid(st, key) { return st.cache[key] != null && st.cache[key] > st.t; },
    // which servers the resolver must ask, given what it still has cached
    plan(st, name) {
      if (dns.valid(st, 'a:' + name)) return [];
      if (dns.valid(st, 'ns:' + dns.zoneOf(name))) return ['auth'];
      if (dns.valid(st, 'ns:' + dns.tldOf(name))) return ['tld', 'auth'];
      return ['root', 'tld', 'auth'];
    },
    resolve(st, name, aTTL) {
      const steps = dns.plan(st, name);
      // each referral is cached with its own TTL (RFC 1034 §5.3.3 step 4b)
      if (steps.includes('root')) st.cache['ns:' + dns.tldOf(name)] = st.t + dns.P.tldTTL;
      if (steps.includes('tld')) st.cache['ns:' + dns.zoneOf(name)] = st.t + dns.P.zoneTTL;
      if (steps.length) st.cache['a:' + name] = st.t + aTTL;
      return { name, t: st.t, steps, trips: 1 + steps.length, ms: dns.ms(steps.length) };
    },
    ms(remote) { return dns.P.local + remote * dns.P.remote; },
    wait(st, s) { st.t += s; },
    liveEntries(st) { return Object.keys(st.cache).filter(k => dns.valid(st, k)).length; }
  };

  /* ───────── 2. Packets: store-and-forward pipelining ───────── */
  const packets = {
    P: { H: 40, R: 10e6, MTU_PAYLOAD: 1460 }, // 20 B IPv4 + 20 B TCP headers; 10 Mbit/s links; 1500 − 40
    count(L, P) { return Math.ceil(L / P); },
    // seconds to move L bytes in P-byte payloads across k equal links of R bit/s (no propagation, no other traffic)
    // proportionate flow shop: makespan = Σ(packet times) + (k − 1)·(largest packet time)
    time(L, P, k, H = packets.P.H, R = packets.P.R) {
      P = Math.min(P, L);
      const n = packets.count(L, P), last = L - (n - 1) * P;
      const sum = (n - 1) * (P + H) + (last + H), max = P + H;
      return (sum + (k - 1) * max) * 8 / R;
    },
    whole(L, k) { return packets.time(L, L, k); },
    best(L, k, H = packets.P.H) { return k > 1 ? Math.sqrt(L * H / (k - 1)) : L; },
    // share of the bytes on the wire that are headers
    overhead(L, P) { const n = packets.count(L, Math.min(P, L)); return n * packets.P.H / (L + n * packets.P.H); }
  };

  /* ───────── 3. Routing: Dijkstra on a small network ───────── */
  const routing = {
    // node ids; positions are in [0,1]² for drawing
    NODES: [
      { id: 'Y', x: 0.05, y: 0.5 }, { id: 'A', x: 0.24, y: 0.17 }, { id: 'B', x: 0.24, y: 0.83 },
      { id: 'C', x: 0.43, y: 0.5 }, { id: 'D', x: 0.61, y: 0.15 }, { id: 'E', x: 0.61, y: 0.85 },
      { id: 'F', x: 0.79, y: 0.32 }, { id: 'G', x: 0.79, y: 0.68 }, { id: 'S', x: 0.95, y: 0.5 }
    ],
    // one-way delays in ms (illustrative)
    LINKS: [
      ['Y', 'A', 2], ['Y', 'B', 3], ['A', 'C', 5], ['B', 'C', 3], ['A', 'D', 10], ['C', 'D', 3],
      ['C', 'E', 6], ['B', 'E', 10], ['D', 'F', 2], ['E', 'G', 2], ['F', 'S', 3], ['G', 'S', 2], ['F', 'G', 4]
    ],
    key(l) { return l[0] + '-' + l[1]; },
    // shortest-path tree toward dest: dist[v] and next[v] (the neighbour v forwards to)
    toward(dest, broken = new Set()) {
      const ids = routing.NODES.map(n => n.id), dist = {}, next = {}, done = {};
      ids.forEach(v => { dist[v] = Infinity; next[v] = null; });
      dist[dest] = 0;
      const adj = {}; ids.forEach(v => { adj[v] = []; });
      for (const l of routing.LINKS) if (!broken.has(routing.key(l))) { adj[l[0]].push([l[1], l[2]]); adj[l[1]].push([l[0], l[2]]); }
      for (;;) {
        let u = null;
        for (const v of ids) if (!done[v] && dist[v] < Infinity && (u === null || dist[v] < dist[u])) u = v;
        if (u === null) break;
        done[u] = true;
        for (const [w, c] of adj[u]) if (dist[u] + c < dist[w]) { dist[w] = dist[u] + c; next[w] = u; }
      }
      return { dist, next };
    },
    path(src, dest, broken) {
      const r = routing.toward(dest, broken);
      if (r.dist[src] === Infinity) return { reach: false, nodes: [src], ms: Infinity, hops: 0, tree: r };
      const nodes = [src]; let v = src;
      while (v !== dest) { v = r.next[v]; nodes.push(v); }
      return { reach: true, nodes, ms: r.dist[src], hops: nodes.length - 1, tree: r };
    },
    // fewest-hops route (BFS) for comparison
    fewestHops(src, dest, broken = new Set()) {
      const adj = {}; routing.NODES.forEach(n => { adj[n.id] = []; });
      for (const l of routing.LINKS) if (!broken.has(routing.key(l))) { adj[l[0]].push([l[1], l[2]]); adj[l[1]].push([l[0], l[2]]); }
      const best = { [src]: { hops: 0, ms: 0 } }, q = [src];
      while (q.length) { const u = q.shift(); for (const [w, c] of adj[u]) { const h = best[u].hops + 1, m = best[u].ms + c; if (!best[w] || (h === best[w].hops && m < best[w].ms)) { if (!best[w]) q.push(w); best[w] = { hops: h, ms: m }; } } }
      return best[dest] || null;
    },
    changedNextHops(dest, before, after) {
      const a = routing.toward(dest, before).next, b = routing.toward(dest, after).next;
      return routing.NODES.filter(n => n.id !== dest && a[n.id] !== b[n.id]).length;
    }
  };

  /* ───────── 4. Queue: M/M/1/K ───────── */
  const queue = {
    // probability an arriving packet finds the buffer full (K = places including the one being sent)
    loss(rho, K) {
      if (Math.abs(rho - 1) < 1e-9) return 1 / (K + 1);
      return (1 - rho) * Math.pow(rho, K) / (1 - Math.pow(rho, K + 1));
    },
    meanN(rho, K) {
      if (Math.abs(rho - 1) < 1e-9) return K / 2;
      return rho / (1 - rho) - (K + 1) * Math.pow(rho, K + 1) / (1 - Math.pow(rho, K + 1));
    },
    // mean time in the router for a packet that gets in, in units of one packet's sending time (Little's law)
    delay(rho, K) { return queue.meanN(rho, K) / (rho * (1 - queue.loss(rho, K))); },
    SERVICE_MS: 1.2, // a 1500-byte packet on a 10 Mbit/s link
    create(seed) { const r = rng(seed); return { r, t: 0, n: 0, nextA: -Math.log(1 - r()) , nextD: Infinity, arrived: 0, dropped: 0, hist: [] }; },
    // advance simulated time by span (units of mean service time); events in order
    step(s, span, rho, K) {
      const end = s.t + span, r = s.r;
      for (;;) {
        const tA = s.nextA, tD = s.nextD;
        if (Math.min(tA, tD) > end) break;
        if (tA <= tD) {
          s.t = tA; s.arrived++;
          if (s.n >= K) s.dropped++; else { s.n++; if (s.n === 1) s.nextD = s.t - Math.log(1 - r()); }
          s.nextA = s.t - Math.log(1 - r()) / rho;
        } else {
          s.t = tD; s.n--; s.nextD = s.n > 0 ? s.t - Math.log(1 - r()) : Infinity;
        }
      }
      s.t = end;
      if (s.n > K) s.n = K;
    }
  };

  /* ───────── 5. ARQ: selective repeat ───────── */
  const arq = {
    P: { N: 20, gap: 0.1, rto: 2 }, // times in RTTs; the timeout of 2 RTT is a choice for the picture
    run({ p, W, seed, N = arq.P.N }) {
      const r = rng(seed), gap = arq.P.gap, rto = arq.P.rto;
      const segs = Array.from({ length: N }, () => ({ tries: [], arrive: null, acked: null, deliver: null }));
      const ev = []; // [time, kind, seq]
      const push = e => { ev.push(e); ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
      let base = 0, next = 0, free = 0, sends = 0;
      const send = (i, t) => {
        const at = Math.max(t, free); free = at + gap; sends++;
        const dataOk = r() >= p, ackOk = r() >= p;
        segs[i].tries.push({ t: at, dataOk, ackOk });
        if (dataOk && segs[i].arrive == null) segs[i].arrive = at + 0.5;
        if (dataOk && ackOk) push([at + 1, 0, i]);
        push([at + rto, 1, i, segs[i].tries.length]);
      };
      const fill = t => { while (next < N && next < base + W) send(next++, t); };
      fill(0);
      let guard = 0;
      while (ev.length && guard++ < 100000) {
        const e = ev.shift(), [t, kind, i] = e;
        if (kind === 0) { if (segs[i].acked == null) { segs[i].acked = t; while (base < N && segs[base].acked != null) base++; fill(t); } }
        else if (segs[i].acked == null && e[3] === segs[i].tries.length) send(i, t); // timeout of the latest try
      }
      // the receiver hands bytes to the app in order: segment i waits for every earlier one
      let ready = 0;
      for (const s of segs) { ready = Math.max(ready, s.arrive); s.deliver = ready; }
      const finish = Math.max(...segs.map(s => s.acked));
      const maxWait = Math.max(...segs.map(s => s.deliver - s.arrive));
      return { segs, sends, finish, perSeg: sends / N, maxWait, delivered: segs.filter(s => s.deliver != null).length };
    },
    expected(p) { return 1 / ((1 - p) * (1 - p)); }
  };

  /* ───────── 6. TCP Reno per round trip ───────── */
  const reno = {
    P: { IW: 10, MSS: 1460 },
    // C = packets the bottleneck sends per base RTT, B = buffer packets; flows: [{start}]
    run({ C, B, flows = [{ start: 0 }], rounds = 160 }) {
      const fl = flows.map(f => ({ start: f.start, cwnd: 0, ss: Infinity, on: false, hist: [] }));
      const out = [], losses = [];
      for (let r = 0; r < rounds; r++) {
        for (const f of fl) if (!f.on && r >= f.start) { f.on = true; f.cwnd = reno.P.IW; }
        const W = fl.reduce((a, f) => a + (f.on ? f.cwnd : 0), 0);
        const loss = W > C + B;
        const queueLen = Math.max(0, Math.min(W, C + B) - C);
        out.push({ r, W, cw: fl.map(f => (f.on ? f.cwnd : 0)), util: Math.min(W, C) / C, queue: queueLen, loss });
        if (loss) losses.push(r);
        for (const f of fl) {
          if (!f.on) continue;
          if (loss) { f.ss = Math.max(Math.floor(f.cwnd / 2), 2); f.cwnd = f.ss; } // RFC 5681: max(FlightSize/2, 2)
          else f.cwnd = f.cwnd < f.ss ? Math.min(2 * f.cwnd, f.ss) : f.cwnd + 1;
        }
      }
      return { rounds: out, losses };
    },
    // average link use over whole sawtooth cycles after the first loss
    steadyUtil(res) {
      const L = res.losses; if (L.length < 3) return null;
      const a = L[1], b = L[L.length - 1]; let s = 0;
      for (let r = a; r < b; r++) s += res.rounds[r].util;
      return s / (b - a);
    },
    maxQueue(res, from = 0) { let m = 0; for (const q of res.rounds) if (q.r >= from) m = Math.max(m, q.queue); return m; },
    // smallest k with IW·(2^k − 1) ≥ segments: round trips of data in slow start with no loss and no bandwidth limit
    slowStartRounds(bytes, IW = reno.P.IW, MSS = reno.P.MSS) {
      const n = Math.ceil(bytes / MSS); let k = 0;
      while (IW * (Math.pow(2, k) - 1) < n) k++;
      return Math.max(1, k);
    }
  };

  /* ───────── 7. Diffie–Hellman with small numbers ───────── */
  const dh = {
    PRIMES: [23, 107, 1019, 10007, 65537],
    powmod(b, e, m) { let r = 1; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; },
    factors(n) { const f = []; for (let d = 2; d * d <= n; d++) if (n % d === 0) { f.push(d); while (n % d === 0) n /= d; } if (n > 1) f.push(n); return f; },
    generator(p) { const q = dh.factors(p - 1); for (let g = 2; g < p; g++) if (q.every(f => dh.powmod(g, (p - 1) / f, p) !== 1)) return g; return null; },
    exchange(p, a, b) {
      const g = dh.generator(p), A = dh.powmod(g, a, p), B = dh.powmod(g, b, p);
      return { p, g, a, b, A, B, sA: dh.powmod(B, a, p), sB: dh.powmod(A, b, p) };
    },
    // Mallory swaps both public numbers for her own
    mitm(p, a, b, m1, m2) {
      const g = dh.generator(p), A = dh.powmod(g, a, p), B = dh.powmod(g, b, p), M1 = dh.powmod(g, m1, p), M2 = dh.powmod(g, m2, p);
      return { g, A, B, M1, M2, sAlice: dh.powmod(M2, a, p), sBob: dh.powmod(M1, b, p), mWithAlice: dh.powmod(A, m2, p), mWithBob: dh.powmod(B, m1, p) };
    },
    // brute force: try x = 1, 2, … until g^x ≡ A; returns the number of tries
    bruteForce(p, g, A) { let v = 1; for (let x = 1; x < p; x++) { v = (v * g) % p; if (v === A) return x; } return null; },
    digits(bits) { return Math.ceil(bits * Math.log10(2)); }
  };

  /* ───────── 8. Latency budget ───────── */
  const budget = {
    C_KM_S: 299792.458,
    GROUP_INDEX: 1.468, // single-mode fibre near 1550 nm, ≈ 1.467–1.468
    v() { return budget.C_KM_S / budget.GROUP_INDEX; },
    // round-trip propagation in ms for a straight fibre run of km
    prop(km) { return 2 * km / budget.v() * 1000; },
    HANDSHAKE: { tls12: { tcp: 1, tls: 2 }, tls13: { tcp: 1, tls: 1 }, quic: { tcp: 0, tls: 1 } },
    EDGE_KM: 50,
    run({ km, access, proto = 'tls13', dnsState = 'cold', bytes = 500000, cdn = 'off' }) {
      const serverKm = cdn === 'off' ? km : budget.EDGE_KM;
      const rtt = access + budget.prop(serverKm);
      const dnsMs = dnsState === 'cold' ? access + 3 * dns.P.remote : dnsState === 'resolver' ? access : 0;
      const hs = budget.HANDSHAKE[proto], k = reno.slowStartRounds(bytes);
      const parts = [
        { key: 'dns', trips: dnsState === 'cold' ? 4 : dnsState === 'resolver' ? 1 : 0, ms: dnsMs },
        { key: 'tcp', trips: hs.tcp, ms: hs.tcp * rtt },
        { key: 'tls', trips: hs.tls, ms: hs.tls * rtt },
        { key: 'req', trips: 1, ms: rtt + (cdn === 'miss' ? budget.prop(km) : 0) },
        { key: 'rest', trips: k - 1, ms: (k - 1) * rtt }
      ];
      const total = parts.reduce((a, q) => a + q.ms, 0);
      const serverTrips = hs.tcp + hs.tls + 1 + (k - 1);
      return { rtt, parts, total, serverTrips, rounds: k, serverKm };
    },
    // farthest server (no CDN) such that the whole load fits in `ms`; null if even 0 km does not fit
    reach(ms, opt) {
      const at0 = budget.run(Object.assign({}, opt, { km: 0, cdn: 'off' }));
      const n = at0.serverTrips; const spare = ms - at0.total;
      if (spare < 0) return null;
      return spare / n / 2 * budget.v() / 1000;
    }
  };

  return { clamp, rng, dns, packets, routing, queue, arq, reno, dh, budget };
});
