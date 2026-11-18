'use strict';
// Pins every number the essay's prose states to the page's own models, and checks that the prose (copy.zh.js)
// still says exactly that number. Numbers are derived from models.js, never repeated as bare literals.
// Run: node tech/networks/how-a-web-page-arrives/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const dir = path.join(__dirname, '..');
const M = require(path.join(dir, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond) { check(name, !!cond, true); }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const g = x => Math.round(x).toLocaleString('en-US'); // grouped integer, as the prose writes it

/* ── ch1 DNS ── */
{
  const D = M.dns, s = D.create(), T = 300;
  const cold = D.resolve(s, 'www.example.com', T);
  check('ch1 cold servers', cold.steps.length, 3); says('ch1.p3', `问了 ${cold.steps.length} 台服务器`);
  says('ch1.p3', `一共 ${cold.trips} 次来回`);
  says('ch1.p3', `一个来回 ${D.P.local} 毫秒`); says('ch1.p3', `每台服务器 ${D.P.remote} 毫秒`);
  says('ch1.p3', `这是 ${cold.ms} 毫秒`);
  const img = D.resolve(s, 'img.example.com', T);
  check('ch1 sibling name asks one server', img.steps.length, 1); says('ch1.p3', `只问 1 台，${img.ms} 毫秒`);
  const again = D.resolve(s, 'www.example.com', T);
  check('ch1 cached asks none', again.steps.length, 0); says('ch1.p3', `一台都不用问，${again.ms} 毫秒`);
  D.wait(s, 600); const exp = D.resolve(s, 'www.example.com', T);
  check('ch1 expired address, zone cached', exp.steps.join(), 'auth'); says('ch1.p3', '只需重问最后一台');
  D.wait(s, 3 * 86400); const late = D.resolve(s, 'www.example.com', T);
  check('ch1 three days later: from the root', late.steps.length, 3); ok('ch1 TLD TTL under 3 days', D.P.tldTTL < 3 * 86400); says('ch1.p3', '过了 3 天');
  // the "tld" branch exists: zone expired but TLD still valid
  const s2 = D.create(); D.resolve(s2, 'www.example.com', T); D.wait(s2, D.P.zoneTTL + 1);
  check('ch1 TLD-only branch', D.resolve(s2, 'www.example.com', T).steps.join(), 'tld,auth');
  // other domain under another TLD starts at the root
  const s3 = D.create(); D.resolve(s3, 'www.example.com', T);
  check('ch1 .org after .com', D.resolve(s3, 'www.example.org', T).steps.length, 3);
  says('ch1.p4', '13 个名字'); says('ch1.p4', '12 个机构');
  says('ch1.model.how', '过 3 天'); says('ch1.btn.wait3d', '3 天'); says('ch1.btn.wait10', '10 分钟');
}

/* ── ch2 packets ── */
{
  const P = M.packets, L = 1e6, k = 5;
  check('ch2 default hops', k, 5); says('ch2.p3', `默认的 ${k} 段线路`);
  const whole = P.whole(L, k), mtu = P.time(L, P.P.MTU_PAYLOAD, k), tiny = P.time(L, 100, k);
  says('ch2.p3', `不切要 ${f(whole, 1)} 秒`);
  says('ch2.p3', `每包装 ${P.P.MTU_PAYLOAD} 字节只要 ${f(mtu, 2)} 秒`);
  check('ch2 nearly 5×', Math.round(whole / mtu), 5); ok('ch2 below 5×', whole / mtu < 5); says('ch2.p3', '快了将近 5 倍');
  says('ch2.p3', `每包 100 字节时，发出去的字节里信封占了 ${f(P.overhead(L, 100) * 100, 0)}%`); says('ch2.p3', `又涨回 ${f(tiny, 2)} 秒`);
  const best = P.best(L, k); says('ch2.p3', `约 ${g(Math.round(best / 100) * 100)} 字节`);
  // the closed-form optimum is the curve's minimum (scan)
  let bp = 0, bt = Infinity; for (let p = 200; p <= 20000; p++) { const t = P.time(L, p, k); if (t < bt) { bt = t; bp = p; } }
  ok('ch2 scanned optimum near √(LH/(k−1))', Math.abs(bp - best) / best < 0.02);
  ok('ch2 optimum gains under 1% over 1460', (mtu - P.time(L, Math.round(best), k)) / mtu < 0.01); says('ch2.p3', '快不到 1%');
  check('ch2 header 40', P.P.H, 40); says('ch2.p2', `${P.P.H} 字节算（IP 和 TCP 各 20 字节）`);
  check('ch2 MTU payload', P.P.MTU_PAYLOAD + P.P.H, 1500); says('ch2.p3', '最多装 1500 字节'); says('ch2.p3', `剩 ${P.P.MTU_PAYLOAD}`);
  // one hop: splitting does not help
  ok('ch2 one hop: whole ≤ split', P.whole(L, 1) <= P.time(L, P.P.MTU_PAYLOAD, 1));
  // the flow-shop formula equals a direct store-and-forward simulation on a small case
  { const Lx = 10000, Px = 1460, kx = 4, sizes = []; for (let r = Lx; r > 0; r -= Px) sizes.push(Math.min(Px, r) + P.P.H);
    const fin = sizes.map(() => new Array(kx).fill(0));
    sizes.forEach((sz, i) => { for (let j = 0; j < kx; j++) { const ready = Math.max(j ? fin[i][j - 1] : 0, i ? fin[i - 1][j] : 0); fin[i][j] = ready + sz * 8 / P.P.R; } });
    check('ch2 formula = simulation', f(fin[sizes.length - 1][kx - 1], 9), f(P.time(Lx, Px, kx), 9)); }
  says('ch2.model.how', '10 Mbit/s');
}

/* ── ch3 routing ── */
{
  const R = M.routing, b = R.path('Y', 'S');
  const nm = id => id === 'Y' ? '你' : id === 'S' ? '服务器' : id;
  says('ch3.p3', b.nodes.map(nm).join(' → ')); says('ch3.p3', `单程 ${b.ms} 毫秒，${b.hops} 段`);
  const fh = R.fewestHops('Y', 'S'); says('ch3.p3', `段数最少的路只要 ${fh.hops} 段，却要 ${fh.ms} 毫秒`);
  ok('ch3 fewest hops is slower', fh.hops < b.hops && fh.ms > b.ms);
  const cd = new Set(['C-D']), p2 = R.path('Y', 'S', cd);
  says('ch3.p3', '掐断 C–D'); says('ch3.p3', 'C → E → G'); ok('ch3 C-D detour goes C E G', p2.nodes.join('').includes('CEG'));
  says('ch3.p3', `变成 ${p2.ms} 毫秒`); says('ch3.p3', `只有 ${R.changedNextHops('S', new Set(), cd)} 台路由器改了`);
  const be = new Set(['B-E']); check('ch3 B-E changes nothing', R.changedNextHops('S', new Set(), be), 0); says('ch3.p3', '掐断 B–E，什么都不变');
  check('ch3 B-E path ms', R.path('Y', 'S', be).ms, b.ms);
  ok('ch3 cut both of your links', !R.path('Y', 'S', new Set(['Y-A', 'Y-B'])).reach); says('ch3.p3', '把你连出去的两条线都掐断');
  // no single break disconnects you
  for (const l of R.LINKS) ok('ch3 single break keeps a route ' + R.key(l), R.path('Y', 'S', new Set([R.key(l)])).reach);
  // Dijkstra agrees with brute force over all simple paths, for every single break
  const simple = (broken) => { const adj = {}; R.NODES.forEach(x => { adj[x.id] = []; }); R.LINKS.forEach(l => { if (!broken.has(R.key(l))) { adj[l[0]].push([l[1], l[2]]); adj[l[1]].push([l[0], l[2]]); } });
    let best = Infinity; const go = (v, seen, d) => { if (v === 'S') { best = Math.min(best, d); return; } for (const [w, c] of adj[v]) if (!seen.has(w)) { seen.add(w); go(w, seen, d + c); seen.delete(w); } }; go('Y', new Set(['Y']), 0); return best; };
  for (const l of R.LINKS) { const br = new Set([R.key(l)]); check('ch3 dijkstra = brute force ' + R.key(l), R.path('Y', 'S', br).ms, simple(br)); }
}

/* ── ch4 queue ── */
{
  const Q = M.queue, pc = (x, d) => f(x * 100, d) + '%';
  says('ch4.p3', `负载 0.8、缓冲区 10 个包时，丢包率约 ${pc(Q.loss(0.8, 10), 1)}`);
  ok('ch4 K=50 loss ~0', Q.loss(0.8, 50) < 1e-4); says('ch4.p3', '丢包几乎为零');
  says('ch4.p3', `平均等待从 ${f(Q.delay(0.8, 10) * Q.SERVICE_MS, 1)} 毫秒变成 ${f(Q.delay(0.8, 50) * Q.SERVICE_MS, 1)} 毫秒`);
  says('ch4.p3', `丢包率只从 ${pc(Q.loss(1.2, 10), 0)} 降到 ${pc(Q.loss(1.2, 50), 0)}`);
  says('ch4.p3', `从 ${f(Q.delay(1.2, 10) * Q.SERVICE_MS, 1)} 毫秒涨到 ${f(Q.delay(1.2, 50) * Q.SERVICE_MS, 0)} 毫秒`);
  ok('ch4 loss above 1 − 1/ρ for ρ>1', [10, 50, 200].every(K => Q.loss(1.2, K) >= 1 - 1 / 1.2 - 1e-12));
  check('ch4 service time 1500 B at 10 Mbit/s', f(1500 * 8 / M.packets.P.R * 1000, 1), f(Q.SERVICE_MS, 1)); says('ch4.limit', `每个包 ${f(Q.SERVICE_MS, 1)} 毫秒`);
  // simulation converges to the formula (seeded)
  for (const [r, K] of [[0.8, 10], [1.2, 10], [0.5, 3]]) { const s = Q.create(42); Q.step(s, 400000, r, K); ok(`ch4 sim ≈ formula ρ=${r} K=${K}`, Math.abs(s.dropped / s.arrived - Q.loss(r, K)) < 0.006); }
  // ρ = 1 limit is continuous
  ok('ch4 ρ=1 continuous', Math.abs(Q.loss(1, 10) - Q.loss(1 + 1e-6, 10)) < 1e-4 && Math.abs(Q.meanN(1, 10) - Q.meanN(1 + 1e-6, 10)) < 1e-3);
}

/* ── ch5 ARQ ── */
{
  const A = M.arq;
  const w5 = A.run({ p: 0, W: 5, seed: 1 }), w1 = A.run({ p: 0, W: 1, seed: 1 }), d = A.run({ p: 0.1, W: 5, seed: 1 });
  says('ch5.p3', `20 个包用 ${f(w5.finish, 1)} 个来回送完`); says('ch5.p3', `窗口为 1，就要 ${f(w1.finish, 0)} 个来回`);
  says('ch5.p3', `这一轮运气要 ${f(d.finish, 1)} 个来回`); ok('ch5 roughly doubles', d.finish / w5.finish > 1.7 && d.finish / w5.finish < 2.1); says('ch5.p3', '差不多翻倍');
  check('ch5 timeout', A.P.rto, 2); says('ch5.p3', `本页设为 ${A.P.rto} 个来回`); says('ch5.limit', `${A.P.rto} 个来回的超时`);
  says('ch5.p3', `丢 10% 时是 ${f(A.expected(0.1), 2)} 次`); says('ch5.p3', `丢 30% 时 ${f(A.expected(0.3), 2)} 次`); says('ch5.p3', `丢一半时 ${f(A.expected(0.5), 0)} 次`);
  // every run delivers all 20 in order; the simulated mean matches 1/(1−p)²
  for (const p of [0.1, 0.3, 0.5]) { let s = 0; for (let sd = 1; sd <= 1500; sd++) { const r = A.run({ p, W: 5, seed: sd }); s += r.sends; if (r.delivered !== 20) ok('ch5 all delivered', false); } ok(`ch5 mean sends p=${p}`, Math.abs(s / 1500 / 20 - A.expected(p)) / A.expected(p) < 0.04); }
  // deliveries are in order
  ok('ch5 in-order', d.segs.every((s, i) => i === 0 || s.deliver >= d.segs[i - 1].deliver));
  ok('ch5 default run shows head-of-line wait', d.maxWait > 0.05);
}

/* ── ch6 Reno ── */
{
  const R = M.reno, run = (C, B, flows) => R.run({ C, B, flows, rounds: 160 });
  const d = run(40, 20), w = d.rounds.map(q => q.W);
  says('ch6.p3', `路宽 ${40}、缓冲区 ${20}`);
  says('ch6.p3', `窗口从 ${w[0]} 翻到 ${w[1]}、${w[2]}、${w[3]}`); says('ch6.p3', `第 ${d.losses[0] + 1} 个来回就丢了包`);
  const after = rs => rs.rounds.slice(rs.losses[1]).map(q => q.W);
  says('ch6.p3', `在 ${Math.min(...after(d))} 和 ${Math.max(...after(d))} 之间画锯齿`); says('ch6.p3', `平均利用率 ${f(R.steadyUtil(d) * 100, 0)}%`);
  const z = run(40, 0); says('ch6.p3', `锯齿落到 ${Math.min(...after(z))} 到 ${Math.max(...after(z))} 之间`); says('ch6.p3', `利用率掉到 ${f(R.steadyUtil(z) * 100, 0)}%`);
  const full = run(40, 40); says('ch6.p3', `利用率到了 ${f(R.steadyUtil(full) * 100, 0)}%`); says('ch6.p3', `最多 ${R.maxQueue(full, full.losses[1])} 个包`);
  check('ch6 extra wait = one RTT', R.maxQueue(full, full.losses[1]) / 40, 1); says('ch6.p3', '多等整整一个来回');
  check('ch6 IW', R.P.IW, 10); says('ch6.p2', `从 ${R.P.IW} 个包开始`);
  // two flows: join round 20 (index 19)
  const t2 = run(40, 20, [{ start: 0 }, { start: 19 }]), L = t2.losses.filter(l => l >= 19);
  check('ch6 second flow hits loss on arrival', L[0], 19); says('ch6.p4', '第 20 个来回加入'); says('ch6.ctl.two', '第 20 个来回加入');
  says('ch6.p4', `它的窗口是 ${t2.rounds[L[0]].cw[1]}，对方是 ${t2.rounds[L[0]].cw[0]}`);
  const gaps = L.slice(0, 5).map(l => Math.abs(t2.rounds[l].cw[0] - t2.rounds[l].cw[1]));
  says('ch6.p4', gaps.join(' → '));
  for (let i = 1; i < gaps.length; i++) ok('ch6 gap halves ' + i, Math.abs(gaps[i] - gaps[i - 1] / 2) <= 1);
  const last = t2.rounds[159].cw; ok('ch6 nearly equal at the end', Math.abs(last[0] - last[1]) <= 1); says('ch6.p4', '最后几乎相等');
}

/* ── ch7 Diffie–Hellman ── */
{
  const H = M.dh, x = H.exchange(23, 6, 15);
  check('ch7 generator of 23', x.g, 5);
  check('ch7 shared key agrees', x.sA, x.sB); says('ch7.p3', `p = ${x.p} 时，你挑 a = ${x.a}、网站挑 b = ${x.b}，双方都算出 ${x.sA}`);
  says('ch7.p3', `从 1 试到 ${H.bruteForce(23, x.g, x.A)} 就找到了`);
  says('ch7.p3', `最多要试 ${g(65537 - 2)} 次`); ok('ch7 65537 in list', H.PRIMES.includes(65537));
  says('ch7.p3', `十进制有 ${H.digits(2048)} 位`);
  // every listed prime: generator is primitive, exchange agrees for many secrets, brute force recovers a valid exponent
  for (const p of H.PRIMES) {
    const gg = H.generator(p); const seen = new Set(); let v = 1; for (let i = 1; i < p; i++) { v = (v * gg) % p; seen.add(v); } check('ch7 primitive root ' + p, seen.size, p - 1);
    for (const [a, b] of [[1, 1], [2, p - 2], [p - 2, 3], [Math.floor(p / 3), Math.floor(p / 2)]]) { const e = H.exchange(p, a, b); check(`ch7 agree p=${p} a=${a} b=${b}`, e.sA, e.sB); }
    const e = H.exchange(p, p - 2, 3); check('ch7 brute force worst case ' + p, H.bruteForce(p, e.g, e.A), p - 2);
    const m = H.mitm(p, 6, 15, 7, 11); check('ch7 mitm: Mallory shares with each side ' + p, m.sAlice === m.mWithAlice && m.sBob === m.mWithBob, true);
  }
  ok('ch7 mitm keys differ at default', (() => { const m = H.mitm(23, 6, 15, Math.floor(21 * 0.37), Math.floor(21 * 0.71)); return m.sAlice !== m.sBob; })());
  says('ch7.p3', '2<sup>112</sup>'); says('ch7.p3', '255 位'); says('ch7.p3', '2<sup>128</sup>');
}

/* ── ch8 budget ── */
{
  const B = M.budget, base = { km: 10000, access: 10, proto: 'tls13', dnsState: 'cold', bytes: 500000, cdn: 'off' };
  const r = B.run(base);
  says('ch8.p3', `一个来回至少 ${f(B.prop(10000), 0)} 毫秒`); says('ch8.p3', `假设的 ${base.access} 毫秒，每个来回 ${f(r.rtt, 0)} 毫秒`);
  says('ch8.p3', `名字没记着（${r.parts[0].ms} 毫秒）`); check('ch8 DNS cold = ch1 cold', r.parts[0].ms, M.dns.ms(3));
  says('ch8.p3', `（${r.parts[1].trips + r.parts[2].trips} 个来回）`); says('ch8.p3', `500 KB 的页面按慢启动还要再来回 ${r.rounds - 1} 次`);
  says('ch8.p3', `总共 ${f(r.total, 0)} 毫秒`); ok('ch8 nearly a second', r.total < 1000 && r.total > 900);
  says('ch8.p3', `光是一个来回就要 ${f(B.prop(10000), 0)} 毫秒`);
  const reach = B.reach(20, { access: 0, proto: 'quic', dnsState: 'phone', bytes: 14000 });
  check('ch8 14 KB fits in the first flight', M.reno.slowStartRounds(14000), 1);
  says('ch8.p3', `约 ${g(Math.round(reach / 100) * 100)} 公里外`);
  // a 20 ms answer from the minimal case at that distance, by construction
  check('ch8 reach is consistent', f(B.run({ km: reach, access: 0, proto: 'quic', dnsState: 'phone', bytes: 14000 }).total, 6), f(20, 6));
  says('ch8.p2', '每秒约走 20 万公里'); ok('ch8 fibre speed ≈ 200 000 km/s', Math.abs(B.v() - 2e5) < 6000); ok('ch8 ≈ 2/3 c', Math.abs(B.v() / B.C_KM_S - 2 / 3) < 0.02);
  says('ch8.p2', '每 100 公里的距离，来回至少要约 1 毫秒'); check('ch8 100 km → ~1 ms', f(B.prop(100), 0), '1');
  const t12 = B.run(Object.assign({}, base, { proto: 'tls12' })), q = B.run(Object.assign({}, base, { proto: 'quic' }));
  check('ch8 TLS 1.2 adds one RTT', f(t12.total - r.total, 6), f(r.rtt, 6)); check('ch8 QUIC saves one RTT', f(r.total - q.total, 6), f(r.rtt, 6));
  says('ch8.p4', `每次省下 ${f(r.rtt, 0)} 毫秒`);
  const ph = B.run(Object.assign({}, base, { dnsState: 'phone' })); says('ch8.p4', `又省 ${f(r.total - ph.total, 0)} 毫秒`);
  const hit = B.run(Object.assign({}, base, { cdn: 'hit' }));
  says('ch8.p4', `本页假设在 ${B.EDGE_KM} 公里内`); says('ch8.p4', `从 ${f(r.rtt, 0)} 毫秒降到 ${f(hit.rtt, 1)} 毫秒`); says('ch8.p4', `从 ${f(r.total, 0)} 降到 ${f(hit.total, 0)} 毫秒`);
  const big = hit.parts.reduce((a, b) => (b.ms > a.ms ? b : a)); check('ch8 CDN: biggest part is DNS', big.key, 'dns'); says('ch8.p4', '最大的一块反而成了查名字');
  const miss = B.run(Object.assign({}, base, { cdn: 'miss' })); check('ch8 miss adds one long RTT', f(miss.total - hit.total, 6), f(B.prop(10000), 6));
  // round trips by protocol (RFC 5246 two, RFC 8446 one, QUIC combined)
  check('ch8 handshakes', JSON.stringify(B.HANDSHAKE), JSON.stringify({ tls12: { tcp: 1, tls: 2 }, tls13: { tcp: 1, tls: 1 }, quic: { tcp: 0, tls: 1 } }));
  says('ch8.p2', 'TLS 1.3 一个来回，旧的 TLS 1.2 两个');
}

/* ── copy hygiene: placeholders, no Chinese outside copy, keys used by the page exist ── */
{
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), mod = fs.readFileSync(path.join(dir, 'models.js'), 'utf8');
  const CJK = /[㐀-鿿]/;
  const noComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
  ok('no Chinese in app.js', !CJK.test(noComments(app)));
  ok('no Chinese in models.js', !CJK.test(noComments(mod)));
  // index.html: only the static <title>, meta description and the 中 toggle may be Chinese
  const stripped = html.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace(/>中</, '><').replace(/<!--[\s\S]*?-->/g, '');
  ok('no other Chinese in index.html', !CJK.test(stripped));
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([a-z0-9]+(?:\.[a-zA-Z0-9]+)+)'/g)) keys.add(m[1]);
  for (const k of keys) ok('copy has key ' + k, Z[k] != null);
  // every say / unit template key the app builds dynamically exists
  for (const k of ['ch1.say.cold', 'ch1.say.tld', 'ch1.say.zone', 'ch1.say.cached', 'ch1.say.waited', 'ch1.say.empty', 'ch2.say.onehop', 'ch2.say.tiny', 'ch2.say.huge', 'ch2.say.good', 'ch3.say.base', 'ch3.say.same0', 'ch3.say.same', 'ch3.say.detour', 'ch3.say.cut', 'ch4.say.low', 'ch4.say.tiny', 'ch4.say.near', 'ch4.say.at1', 'ch4.say.over', 'ch5.say.running', 'ch5.say.clean', 'ch5.say.lossy', 'ch5.say.lossyW1', 'ch5.say.lossyNoWait', 'ch6.say.ss', 'ch6.say.saw', 'ch6.say.full', 'ch6.say.two', 'ch7.say.step1', 'ch7.say.step2', 'ch7.say.step3', 'ch7.say.step4', 'ch7.say.eveRun', 'ch7.say.eveFound', 'ch7.say.mitm', 'ch8.say.far', 'ch8.say.near', 'ch8.say.cdnhit', 'ch8.say.cdnmiss', 'ch8.part.dns', 'ch8.part.tcp', 'ch8.part.tls', 'ch8.part.req', 'ch8.part.rest', 'ch1.cv.phone', 'ch1.cv.resolver', 'ch1.cv.root', 'ch1.cv.tld', 'ch1.cv.auth', 'ch3.node.Y', 'ch3.node.S'])
    ok('copy has dynamic key ' + k, Z[k] != null);
  // placeholders in say templates are only ones the app supplies
  const supplied = { ch1: 'name trips ms zone tld left dt n', ch2: 'P k T W n oh pct', ch3: 'path ms hops fh fms changed rest extra', ch4: 'rho loss ms floor k', ch5: 'W T sends wait done', ch6: 'w C lo hi u q extra w1 w2 a b', ch7: 'p g a b A B s n x d M1 M2 sA sB', ch8: 'km prop acc rtt n dns total share big edge' };
  for (const [k, v] of Object.entries(Z)) { const m = /^(ch\d)\.say\./.exec(k); if (!m) continue; for (const ph of v.matchAll(/\{(\w+)\}/g)) ok(`placeholder {${ph[1]}} in ${k} is supplied`, supplied[m[1]].split(' ').includes(ph[1])); }
  // the site page titles quoted in the prose match pages.config.js
  const cfg = fs.readFileSync(path.join(dir, '..', '..', '..', 'pages.config.js'), 'utf8');
  for (const [slug, title] of [['shortest-path', '最短路 · 从起点像洪水一样漫开'], ['tcp-congestion', '网络流 · 一封消息的旅程'], ['rsa-encryption', 'RSA 公钥加密 · 乘起来容易，拆开来难'], ['hashing', '哈希 · 把任意输入压成固定指纹'], ['switches-that-compute', '一堆开关是怎么学会算数的'], ['inside-a-phone', '一部手机里的十个道理']]) {
    ok(`title of ${slug} matches pages.config.js`, new RegExp(`slug: "${slug}",\\s*\\n\\s*title: \\{ zh: "${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(cfg));
    ok(`prose quotes ${slug} title`, Object.values(Z).some(v => v.includes(title)));
  }
  // REGISTRY anchors exist in the page; titles match the copy
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'REGISTRY.json'), 'utf8'));
  for (const c of reg.concepts) ok('anchor ' + c.anchor, html.includes(`id="${c.anchor.slice(1)}"`));
  check('registry title = hero title', reg.title.zh, Z['hero.title']);
}

console.log(fails ? `${fails} of ${n} checks failed` : `PASS: ${n} checks (every prose number recomputed from models.js)`);
process.exit(fails ? 1 : 0);
