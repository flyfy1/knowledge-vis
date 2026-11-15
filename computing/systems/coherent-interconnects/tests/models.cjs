'use strict';
// Pins the page's models: the link arithmetic and the CXL flit accounting against the formulas of Das Sharma et al.
// (§6.3), the copy-or-share closed form and its crossover, the protocol stepper against hand-written message
// sequences, the tiering, pooling and directory models against their definitions and limiting cases, the ring
// all-reduce run on real numbers against Patarasuk & Yuan's bound, the hierarchical version against the flat ring;
// the vendor figures against the values typed from their sources; every number the prose quotes (placeholders filled
// from prose(), literals checked against models.js); how far each conclusion moves when a tuned parameter is halved
// or doubled; every live sentence branch; copy keys, language hygiene, the registry and the sibling essays' aliases.
// Run: node computing/systems/coherent-interconnects/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { KiB, MiB, LINE, SRC, TUNED, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const ymd = s => { const [y, m, d] = s.split('-').map(Number); return d ? `${y} 年 ${m} 月 ${d} 日` : `${y} 年 ${m} 月`; };

/* ── vendor and paper figures, as typed from the sources (BRIEF.md lists URL and date opened) ── */
{
  const c = SRC.cxl;
  check('68 B flit = 2 + 64 + 2', [c.flit68.bytes, c.flit68.pid, c.flit68.payload, c.flit68.crc].join(), '68,2,64,2');
  check('68 B flit: payload is four 16 B slots', c.flit68.slots * 16, c.flit68.payload);
  check('CXL survey: port round trip 21–25 ns, pin-to-pin 80 / 50 ns', [c.portRtLo, c.portRtHi, c.pinMem, c.pinSnoop].join(), '21,25,80,50');
  check('CXL survey Table 2: 170 ns direct, 250 ns through a switch', [c.estDirect, c.estSwitch].join(), '170,250');
  check('CXL survey: switch adds 62–70 ns', [c.switchAdderLo, c.switchAdderHi].join(), '62,70');
  check('CXL survey §6.3 efficiencies', [c.eff68, c.eff68cache, c.eff256].join(), '0.939,0.94,0.9375');
  check('CacheID 4 bits → 16 caching devices', Math.pow(2, c.cacheIdBits), 16);
  check('PBR 12-bit IDs → 4096 nodes (GFAM)', Math.pow(2, c.pbrIdBits), c.gfdNodes);
  check('MLD up to 16 logical devices', c.mldMax, 16);
  check('CXL versions and dates', JSON.stringify(c.dates), '{"v1":"2019-03","v11":"2019-09","v2":"2020-11","v3":"2022-08","v4":"2025-11-18"}');
  check('CXL rates', JSON.stringify(c.gts), '{"v1":32,"v2":32,"v3":64,"v4":128}');
  const L = SRC.liu;
  check('Liu et al. Table 1: local EMR2S 111 ns / 246 GB/s', [L.local.lat, L.local.bw].join(), '111,246');
  check('Liu et al. Table 1: CXL-A..D latency', ['a', 'b', 'c', 'd'].map(k => L.devs[k].lat).join(), '214,271,394,239');
  check('Liu et al. Table 1: CXL-A..D bandwidth', ['a', 'b', 'c', 'd'].map(k => L.devs[k].bw).join(), '24,22,18,52');
  check('Liu et al. Table 1: widths', ['a', 'b', 'c', 'd'].map(k => L.devs[k].width).join(), '8,8,8,16');
  const P = SRC.pond;
  check('Pond: +70–90 ns, rack > 180 ns, local 78 ns', [P.addLo, P.addHi, P.rack, P.local].join(), '70,90,180,78');
  check('Pond: stranded 3–27 % at p95; 16–32 sockets save 10 %; 7 % cost; 1–5 % perf; pools of 8–16', [P.strandLo, P.strandHi, P.p, P.saveLo, P.saveHi, P.poolSave, P.costSave, P.perfLo, P.perfHi, P.poolLo, P.poolHi].join(), '3,27,95,16,32,10,7,1,5,8,16');
  check('Sun et al.: true CXL memory up to 26 % lower latency than NUMA emulation', SRC.sun.vsEmu, 26);
  says('ch5.p3', '低最多 {sunEmu}%');
  const nv = SRC.nvlink;
  check('NVLink 4/5/6 per GPU (both directions)', [4, 5, 6].map(g => nv[g].gpuBidir).join(), '900,1800,3000');   // en-US NVLink + Vera Rubin pages, 2026-11-15
  check('NVLink 4/5/6 links per GPU', [4, 5, 6].map(g => nv[g].links).join(), '18,18,36');
  check('NVLink Switch aggregate 130 / 216 TB/s', [nv[5].aggTB, nv[6].aggTB].join(), '130,216');
  check('NVLink 6 figures on the en-GB / en-EU NVLink pages', [FRONTIER.rubinOther.gpuBidir, FRONTIER.rubinOther.aggTB].join(), '3600,260');
  check('NVL72 aggregate = 72 × per-GPU (both NVLink 5 and 6)', [5, 6].every(g => Math.abs(72 * nv[g].gpuBidir / 1000 - nv[g].aggTB) < 1), true);
  check('Vera Rubin NVL72: 72 GPUs, 288 GB HBM4', [SRC.rubin.gpus, SRC.rubin.hbmGB].join(), '72,288');
  check('NICs 400 / 800 Gb/s', [SRC.nic.cx7Gbps, SRC.nic.cx8Gbps].join(), '400,800');
  const U = SRC.ualink;
  check('UALink 1.0: 200 GT/s (212.5 signalling), 800 Gb/s station, 1,024 accelerators, 10-bit ID, 64 B in 640 B', [U.laneGTs, U.signalGTs, U.stationGbps, U.maxAcc, U.idBits, U.tlFlit, U.dlFlit].join(), '200,212.5,800,1024,10,64,640');
  check('UALink 10-bit ID covers 1,024', Math.pow(2, U.idBits), U.maxAcc);
  const G = SRC.gh;
  check('Grace Hopper: C2C 900 total / 450 per direction, 7×, 1.3 pJ/bit', [G.c2cBidir, G.c2c, G.vsPcie, G.pjBit].join(), '900,450,7,1.3');
  check('Grace Hopper memories', [G.lpddrGB, G.lpddrBW, G.hbmGB, G.hbmBW].join(), '512,546,96,3000');
  const A = SRC.mi300a;
  check('MI300A: 24 cores / 3 CCDs, 6 XCDs × 38 = 228 CUs, 128 GB, 5.3 TB/s, 256 MB', [A.cores, A.ccds, A.xcds, A.cuPer, A.cus, A.hbmGB, A.hbmTB, A.icMB].join(), '24,3,6,38,228,128,5.3,256');
  check('MI300A: 6 × 38 = 228', A.xcds * A.cuPer, A.cus);
  // frontier dates as the prose writes them
  check('as of 2026-11', FRONTIER.asOf, '2026-11'); says('ch12.title', '2026 年 11 月');
  says('ch12.c1', ymd(FRONTIER.cxl4.date)); says('ch12.c2', ymd(FRONTIER.ualink.v2)); says('ch12.c2', FRONTIER.ualink.products + ' 年');
  says('ch12.c3', ymd(FRONTIER.cpo.announced)); says('ch12.c3', FRONTIER.cpo.spectrumYear + ' 年'); says('ch12.c3', '3.5 倍');
  says('ch12.d3', ymd(FRONTIER.cx8.date)); says('ch12.d2', '2024 年 9 月 22 日'); says('ch12.d4', '2026 年 11 月 15 日');
  says('ch12.e2', ymd(SRC.cxl.dates.v3)); says('ch12.e2', ymd(SRC.cxl.dates.v2)); says('ch12.e1', SRC.ring.year + ' 年'); says('ch9.p2', SRC.ring.year + ' 年');
  says('ch10.p4', ymd(SRC.ualink.released)); says('ch11.limit', '2022 年 11 月'); check('Grace Hopper blog date', G.date, '2022-11-10');
  says('ch11.p2', `NVIDIA 说 ${G.vsPcie} 倍`); says('ch12.d1', '一比一'); check('Xeon 6 flat memory mode pairs 1:1', FRONTIER.xeon6.fmmRatio, 1);
  says('ch12.c1', '4.0'); says('ch12.c1', 'PCIe 7.0');
}

/* ── link arithmetic ── */
{
  near('PCIe 5.0 ×16 per direction = 32 × 16 × 128/130 / 8', M.pcieGBps(16), 63.015, 0.001);
  check('CXL ×16 at 32 GT/s raw (flit mode, no 128b/130b)', M.rawGBps(32, 16), 64);
  check('NVLink 5 per GPU per direction = 1,800 / 2', M.nvPerDir(5), 900);
  check('NVLink 4 per link per direction = 900 / 2 / 18', M.nvLinkPerDir(4), 25);
  near('NVLink 6 per link per direction = 3,000 / 2 / 36 (a quotient; NVIDIA gives no per-link rate)', M.nvLinkPerDir(6), 41.667, 0.001);
  says('ch8.p2', '平均每条每个方向约 {nv6pl} GB/s'); says('ch8.genPre', '初步');
  check('400 Gb/s = 50 GB/s', M.nicGBps(400), 50);
  check('UALink x4 station 800 Gb/s = 100 GB/s per direction', M.ualinkStationGBps(), 100);
  near('DDR5-4800 channel 38.4 GB/s', M.DDR5_4800, 38.4, 1e-9);
  near('NVL72 aggregate = 72 × 1.8 TB/s', 72 * SRC.nvlink[5].gpuBidir / 1000, 129.6, 1e-9);
}

/* ── ch1 copy or share: closed form, crossover, Little's law ── */
{
  const r = M.copyShare(MiB, 1, 64), t0 = TUNED.dmaSetupUs * 1e-6, L = TUNED.coherentLatNs * 1e-9;
  near('copy = t0 + S / B', r.tCopy, t0 + MiB / (M.pcieGBps(16) * 1e9), 1e-15);
  near("Little's law: 64 × 64 B / 170 ns", r.Bshare, 64 * LINE / L / 1e9, 1e-9);
  check('64 in flight: Little-bound, not link-bound', r.littleBound, true);
  check('256 in flight: link-bound', M.copyShare(MiB, 1, 256).littleBound, false);
  near('256 in flight: capped at the CXL.cache read rate', M.copyShare(MiB, 1, 256).Bshare, M.flitBW('cacheRd', '68', 16).real, 1e-9);
  near('share = L + ceil(fS/64)·64 / B', r.tShare, L + Math.ceil(MiB / LINE) * LINE / (r.Bshare * 1e9), 1e-15);
  const x = M.crossover(1, 64);
  near('at the crossover both take the same time', M.copyShare(x, 1, 64).tCopy, M.copyShare(x, 1, 64).tShare, 2e-9);
  check('below the crossover sharing wins', M.copyShare(x / 2, 1, 64).win, 'share');
  check('above the crossover copying wins', M.copyShare(x * 2, 1, 64).win, 'copy');
  check('5 %: no crossover, sharing always wins', M.crossover(0.05, 64), null);
  for (const e of [12, 20, 30]) check('5 %, 2^' + e + ' B: share wins', M.copyShare(Math.pow(2, e), 0.05, 64).win, 'share');
  check('the threshold fraction is Bshare / Bdma: just above it there is a crossover', M.crossover(r.Bshare / r.Bdma * 1.01, 64) > 0, true);
  check('just below it there is none', M.crossover(r.Bshare / r.Bdma * 0.99, 64), null);
  says('ch1.p3', '一次一行 64 字节'); check('line = 64 B', LINE, 64);
  says('ch1.p4', '默认是 1 MiB 的缓冲区，设备只用到 5%'); check('ch1 defaults 1 MiB, 5 %, 64', /id="shS"[^>]*value="20"/.test(html) && /name="shF" value="0.05" checked/.test(html) && /name="shM" value="64" checked/.test(html), true);
  says('ch1.p4', '加到 256 个'); check('256 is a choice', M.SHARE.mlps.includes(256), true);
  says('ch1.p2', 'PCIe 5.0 ×16');
}

/* ── ch3 flits: Das Sharma et al. §6.3 ── */
{
  const raw = 64;
  near('CXL.mem read, 68 B: 0.939 · 8/9 · raw', M.flitBW('memRd', '68', 16).real, 0.939 * 8 / 9 * raw, 1e-9);
  near('CXL.mem read, 68 B, survey Table 4 ≈ 53.5 GB/s', M.flitBW('memRd', '68', 16).real, 53.5, 0.15);
  near('CXL.cache read, 68 B: 16/17 · 0.94 · raw', M.flitBW('cacheRd', '68', 16).real, 16 / 17 * 0.94 * raw, 1e-9);
  near('CXL.cache write, 68 B: 4/6 · 0.94 · raw', M.flitBW('cacheWr', '68', 16).real, 4 / 6 * 0.94 * raw, 1e-9);
  near('CXL.cache read, 256 B: 14/16 · raw(64 GT/s)', M.flitBW('cacheRd', '256', 16).real, 14 / 16 * 128, 1e-9);
  near('CXL.cache write, 256 B: 4/6.5 · 15/16 · raw', M.flitBW('cacheWr', '256', 16).real, 4 / 6.5 * 15 / 16 * 128, 1e-9);
  check('256 B CXL.mem read is marked derived', M.flitBW('memRd', '256', 16).derived && !M.flitBW('memRd', '68', 16).derived, true);
  check('×8 is half of ×16', M.flitBW('memRd', '68', 8).real * 2, M.flitBW('memRd', '68', 16).real);
  says('ch3.p3', '4 个 16 字节的「槽」'); says('ch3.p3', '一帧 16 个槽'); check('256 B flit: 16 slots', SRC.cxl.flit256.slots, 16);
  says('ch3.p3', '64 GT/s'); says('ch3.p3', '256 字节帧'); check('CXL 3.0 at 64 GT/s', SRC.cxl.gts.v3, 64);
  says('ch3.p4', '×16、32 GT/s'); says('ch3.p4', '三个消息头'); check('three headers per written line take 2 slots (6 per 4 lines… 4 data / 6)', M.FLITBW['68'].cacheWr.slots - M.FLITBW['68'].cacheWr.data, 2);
  says('ch3.p4', '256 字节帧、64 GT/s');
}

/* ── ch4 protocol stepper: hand-written sequences ── */
{
  const seq = (type, acts) => { let st = M.freshLines(); const out = []; for (const a of acts) { const r = M.protoStep(type, st, a); out.push(r.ok ? r.msgs.map(m => m.name).join('+') || '-' : 'NO'); if (r.ok) st = r.st; } return [out.join(' | '), st.hX + st.dX + st.hY]; };
  check('Type 2: device reads X, CPU writes X, device reads again',
    seq(2, ['devRdX', 'cpuWrX', 'devRdX']).join(' / '),
    'D2H Req RdShared+H2D Rsp GO-S+H2D Data | H2D Req SnpInv+D2H Rsp RspIHitSE | D2H Req RdShared+H2D Rsp GO-S+H2D Data / SSI');
  check('Type 2: device takes X for writing, CPU reads it: dirty data forwarded',
    seq(2, ['devWrX', 'cpuRdX']).join(' / '), 'D2H Req RdOwn+H2D Rsp GO-E+H2D Data | H2D Req SnpData+D2H Rsp RspSFwdM+D2H Data / SSI');
  check('Type 2: device writes X twice: second write silent', seq(2, ['devWrX', 'devWrX'])[0], 'D2H Req RdOwn+H2D Rsp GO-E+H2D Data | -');
  check('Type 3: CPU reads Y (no completion message on Type 3)', seq(3, ['cpuRdY'])[0], 'M2S Req MemRd+S2M DRS MemData');
  check('Type 2: CPU reads Y, device writes Y: back-invalidate', seq(2, ['cpuRdY', 'devWrY']).join(' / '), 'M2S Req MemRd+S2M DRS MemData+S2M NDR Cmp | S2M BISnpInv+M2S BIRspI / III');
  check('Type 1 cannot use CXL.mem', seq(1, ['cpuRdY'])[0], 'NO');
  check('Type 3 cannot cache', seq(3, ['devRdX'])[0], 'NO');
  check('everyone can do config reads', [1, 2, 3].map(t => seq(t, ['cfg'])[0]).join(' | '), Array(3).fill('CfgRd0 (TLP)+CplD (TLP)').join(' | '));
  check('types speak', JSON.stringify(M.TYPES), '{"1":["io","cache"],"2":["io","cache","mem"],"3":["io","mem"]}');
  // single-writer invariant across every two-step sequence on Type 2
  for (const a of M.ACTIONS) for (const b of M.ACTIONS) { let st = M.freshLines(); for (const x of [a, b]) st = M.protoStep(2, st, x).st;
    n++; if ((st.hX === 'M' && st.dX !== 'I') || (st.dX === 'M' && st.hX !== 'I')) { fails++; console.error(`FAIL single writer broken after ${a}, ${b}: ${st.hX}${st.dX}`); } }
}

/* ── ch5 tiering ── */
{
  const s = TUNED.zipfS;
  for (const p of [0.1, 0.3, 0.5, 0.8]) check(`hot-first beats random at p=${p}`, M.tier(p, s, 'd', 'hot').lat < M.tier(p, s, 'd', 'random').lat, true);
  check('random placement: q = p', M.tier(0.5, s, 'd', 'random').q, 0.5);
  check('nothing on CXL = local', M.tier(0, s, 'd', 'hot').lat, SRC.liu.local.lat);
  check('everything on CXL = device', M.tier(1, s, 'd', 'hot').lat, SRC.liu.devs.d.lat);
  near('best mixed bandwidth = sum, at q = Bcxl / (Bloc + Bcxl)', M.tier(0.5, s, 'd', 'hot').bwBest, 246 + 52, 1e-9);
  const cum = M.zipfCum(TUNED.pages, s); near('Zipf weights sum to 1', cum[TUNED.pages], 1, 1e-12);
  check('more skew → more pages can move within 5 %', M.tierReach(1.2, 'd', 0.05) > M.tierReach(s, 'd', 0.05) && M.tierReach(s, 'd', 0.05) > M.tierReach(s / 2, 'd', 0.05), true);
  says('ch5.p5', '只涨 5%'); says('ch5.p5', '指数调到 1.2'); check('1.2 and 0.45 are choices', /name="tiS" value="1.2"/.test(html) && /name="tiS" value="0.45"/.test(html), true);
  says('ch5.p6', '放 20% 的页面过去'); says('ch5.limit', '1% 到 5%'); says('ch5.p3', '四块 CXL 1.1');
  check('four devices measured', Object.keys(SRC.liu.devs).length, 4);
  says('ch5.p3', '三块 ASIC'); check('three ASIC devices', Object.values(SRC.liu.devs).filter(d => d.asic).length, 3);
}

/* ── ch6 pooling ── */
{
  check('one host: nothing saved', M.pool(1).saved, 0);
  check('savings fall as correlation rises', M.POOL.rhos.map(r => M.pool(16, r).saved).every((v, i, a) => i === 0 || v <= a[i - 1] + 1e-12), true);
  check('fully correlated: nothing saved', M.pool(16, 1).saved, 0);
  check('more spread → more savings', M.pool(16, null, TUNED.poolCv * 2).saved > M.pool(16).saved && M.pool(16).saved > M.pool(16, null, TUNED.poolCv / 2).saved, true);
  check('direct MLD up to 16 hosts, switch above', [16, 32].map(N => M.pool(N).tierKey).join(), 'mld,switch');
  check('pool is seeded', M.pool(8).poolSize, M.pool(8).poolSize);
  says('ch6.p2', `第 ${SRC.pond.p} 百分位`); says('ch6.p4', '8 台主机合用'); says('ch6.p4', '16 台'); says('ch6.p4', '64 台');
  check('8, 16, 64 are slider stops', [8, 16, 64].every(N => M.POOL.ns.includes(N)), true);
  says('ch6.p5', `${SRC.pond.saveLo} 到 ${SRC.pond.saveHi} 个插槽`); says('ch6.p5', `${SRC.pond.poolLo} 到 ${SRC.pond.poolHi} 个插槽`);
  check('ch6 defaults 16 hosts, ρ 0.5', M.POOL.ns[+html.match(/id="poN"[^>]*value="(\d)"/)[1]] === 16 && M.POOL.rhos[+html.match(/id="poR"[^>]*value="(\d)"/)[1]] === TUNED.poolRho, true);
}

/* ── ch7 directory and back-invalidate ── */
{
  check('one host never back-invalidates when the directory fits', M.fabricDir(1, 0.5, 2).bi, 0);
  check('read-only, directory fits: none', M.fabricDir(16, 0, 1).bi, 0);
  check('read-only, directory half size: all from capacity', M.fabricDir(16, 0, 0.5).bi === M.fabricDir(16, 0, 0.5).biCap && M.fabricDir(16, 0, 0.5).bi > 0, true);
  check('more writes → more back-invalidates', M.DIR.writes.map(w => M.fabricDir(16, w, 2).bi).every((v, i, a) => i === 0 || v >= a[i - 1]), true);
  check('more hosts → more back-invalidates (5 % writes)', M.DIR.hosts.map(h => M.fabricDir(h, 0.05, 2).bi).every((v, i, a) => i === 0 || v >= a[i - 1]), true);
  check('parts add up', ['biWrite', 'biRead', 'biCap'].reduce((s, k) => s + M.fabricDir(8, 0.2, 0.5)[k], 0).toFixed(9), M.fabricDir(8, 0.2, 0.5).bi.toFixed(9));
  check('fan-out never exceeds H − 1', M.DIR.hosts.every(h => M.fabricDir(h, 0.2, 2).fanout <= h - 1 + 1e-12), true);
  says('ch7.p4', '只读不写时，16 台主机'); says('ch7.p4', '写的比例到 5%'); says('ch7.p4', '4 台主机'); says('ch7.p4', '写到 20%'); says('ch7.p4', '只有需要的一半');
  check('16 / 4 hosts, 5 % / 20 % writes, half-size directory are choices', [16, 4].every(h => M.DIR.hosts.includes(h)) && [0.05, 0.2].every(w => M.DIR.writes.includes(w)) && M.DIR.caps.includes(0.5), true);
  says('ch7.p2', '主机 1 和主机 3'); says('ch7.p2', '主机 4');
  // reviewer 2026-11-15: the count is a steady-state rate, not a start-up transient; doubling the warm-up moves it < 5 %
  { const m = { exports: {} }; new Function('module', 'exports', fs.readFileSync(path.join(DIR, 'models.js'), 'utf8'))(m, m.exports);
    m.exports.DIR.warm = 2 * M.DIR.warm;   // a fresh copy, so the cached result of M is not reused
    for (const [h, w] of [[16, 0.05], [4, 0.05], [16, 0.2]]) near(`ch7: ${h} hosts, ${w * 100} % writes, warm-up doubled`, m.exports.fabricDir(h, w, 2).bi / M.fabricDir(h, w, 2).bi, 1, 0.05); }
  check('ch6: switch adder = direct adder + survey switch adder (one baseline)', M.pool(32).add, (SRC.pond.addLo + SRC.pond.addHi) / 2 + (SRC.cxl.switchAdderLo + SRC.cxl.switchAdderHi) / 2);
}

/* ── ch8/ch9 ring all-reduce ── */
{
  for (const N of M.RING.ns) {
    const R = M.ringSteps(N), fin = R.states[R.states.length - 1];
    check(`ring N=${N}: 2(N−1) steps`, R.sends.length, 2 * (N - 1));
    check(`ring N=${N}: every GPU ends with the totals`, fin.every(row => row.join() === R.total.join()), true);
    check(`ring N=${N}: each step every GPU sends one chunk to the next`, R.sends.every(s => s.sends.length === N && s.sends.every(x => x.to === (x.from + 1) % N)), true);
    const mid = R.states[N - 1];
    check(`ring N=${N}: after reduce-scatter each GPU holds exactly one complete chunk`, mid.every(row => row.filter((v, c) => v === R.total[c]).length >= 1) && mid.every((row, g) => row[(g + 1) % N] === R.total[(g + 1) % N]), true);
  }
  // hand check of the first reduce-scatter step on the 4-GPU example: GPU g sends chunk g
  const R4 = M.ringSteps(4);
  check('ring N=4, step 1: GPU g sends chunk g', R4.sends[0].sends.map(s => s.chunk).join(), '0,1,2,3');
  check('ring N=4, step 1: GPU 1 adds GPU 0 chunk 0', R4.states[1][1][0], R4.init[0][0] + R4.init[1][0]);
  says('dg.ring.cap', '4 块 GPU'); says('dg.ring.cap', '3 步后'); says('dg.ring.cap', '再 3 步'); says('dg.ring.cap', '共发 6 段'); says('dg.ring.cap', '四分之一');
  check('ring caption: 4 GPUs, 3 + 3 = 6 steps', R4.sends.length, 6);
  // time model
  const a = M.allreduce(8e9, 72, 'nv5');
  near('per GPU = 2(N−1)/N · S', a.perGpu, 2 * 71 / 72 * 16e9, 1);
  near('T = perGpu / B + 2(N−1)α', a.t, a.perGpu / 900e9 + 2 * 71 * 2e-6, 1e-12);
  check('Patarasuk–Yuan bound: per-GPU bytes ≥ 2(N−1)/N · S, met with equality', a.perGpu, 2 * (a.N - 1) / a.N * a.S);
  check('BF16: 2 bytes per parameter', M.BYTES_PER_PARAM, 2);
  check('ar choices', M.AR.params.join() + ' ' + M.AR.ns.join(), '1000000000,8000000000,70000000000,405000000000 8,72');
  says('ch9.p4', '80 亿参数'); says('ch9.p4', '72 块卡'); says('ch9.p4', '400 Gb/s'); says('ch9.p4', '8 块 H100'); says('ch9.p4', '700 亿参数、72 块卡');
  says('ch9.p5', '700 亿参数'); says('ch9.p5', '10 亿参数、8 块卡');
  for (const [k, p] of [['1e9', '10 亿'], ['8e9', '80 亿'], ['70e9', '700 亿'], ['405e9', '4,050 亿']]) { says('ch9.p.' + k, p); check('param choice ' + k, M.AR.params.includes(+k), true); }
  says('ch8.p3', '72 乘以每块 1.8 TB/s'); check('1.8 TB/s = NVLink 5 per GPU', SRC.nvlink[5].gpuBidir / 1000, 1.8);
  says('ch8.p3', '72 块 Blackwell GPU'); check('NVL72 = 72', SRC.nvlink[5].domain, 72);
}

/* ── ch10 hierarchical ── */
{
  const h = M.hier(70e9, 9216, 72, 400);
  check('R = N / G', h.R, 128);
  near('one domain only (R = 1) = flat ring inside the domain', M.hier(8e9, 72, 72, 400).t, M.allreduce(8e9, 72, 'nv5').t, 1e-12);
  check('two levels beat the flat ring', HIERok(), true);
  function HIERok() { for (const T of M.HIER.totals) for (const G of M.HIER.domains) for (const nic of M.HIER.nics) for (const p of M.HIER.params) if (!(M.hier(p, T, G, nic).t < M.hier(p, T, G, nic).flat)) return false; return true; }
  check('bigger domain → fewer bytes on the network', M.hier(70e9, 9216, 72, 400).outBytes < M.hier(70e9, 9216, 8, 400).outBytes, true);
  says('ch10.p3', '9,216 块卡、700 亿参数、每块卡 400 Gb/s 网卡'); says('ch10.p3', '72 块一个域'); says('ch10.p3', '8 块一个域'); says('ch10.p3', '从 8 块卡做到 72 块'); says('ch10.p3', `目标是 ${M.fmt(SRC.ualink.maxAcc, 0, 'zh')} 块`);
  check('ch10 defaults 9216 / 72 / 400 / 70B', /name="hiT" value="9216" checked/.test(html) && /name="hiG" value="72" checked/.test(html) && /name="hiNic" value="400" checked/.test(html) && /name="hiP" value="70e9" checked/.test(html), true);
  says('ch10.p4', '1、2、4 条通道'); says('ch10.p4', '4 条一组');
}

/* ── tuned parameters: halved / doubled (BRIEF.md lists the same) ── */
{
  // ch1: the DMA fixed cost moves the crossover in proportion; at 5 % sharing still always wins
  const x = M.crossover(1, 64), xh = M.crossover(1, 64, { t0: TUNED.dmaSetupUs / 2 }), xd = M.crossover(1, 64, { t0: TUNED.dmaSetupUs * 2 });
  check('ch1: t0 halved/doubled → crossover roughly halves/doubles', xh < x * 0.6 && xd > x * 1.9, true);
  check('ch1: t0 halved, 5 % still always shares', M.crossover(0.05, 64, { t0: TUNED.dmaSetupUs / 2 }), null);
  check('ch1: CXL.cache latency doubled (340 ns), 5 % still shares at 1 MiB', M.copyShare(MiB, 0.05, 64, { L: 340 }).win, 'share');
  // ch5: halving the skew shrinks the reach, but hot-first still beats random
  check('ch5: s halved, hot-first still beats random at 50 %', M.tier(0.5, TUNED.zipfS / 2, 'd', 'hot').lat < M.tier(0.5, TUNED.zipfS / 2, 'd', 'random').lat, true);
  { const base = M.tier(0.5, TUNED.zipfS, 'd', 'hot').lat, P0 = TUNED.pages;
    for (const P of [P0 / 2, P0 * 2]) { TUNED.pages = P; const l = M.tier(0.5, TUNED.zipfS, 'd', 'hot').lat; TUNED.pages = P0; check(`ch5: ${P} pages moves the 50 % point by under 3 ns`, Math.abs(l - base) < 3, true); } }
  // ch6: the spread sets the size of the saving, not its shape (flat beyond 16 hosts)
  for (const cv of [TUNED.poolCv / 2, TUNED.poolCv * 2]) check(`ch6: cv ${cv}: 64 hosts save at most 3 points more than 16`, M.pool(64, null, cv).saved - M.pool(16, null, cv).saved < 0.03, true);
  // ch9: doubling the step cost moves the big all-reduce by under 1 %
  for (const k of ['nv5', 'ib400']) check(`ch9: α doubled, 70B on ${k} moves < 1 %`, M.allreduce(70e9, 72, k, { alphaScale: 2 }).t / M.allreduce(70e9, 72, k).t - 1 < 0.01, true);
  check('ch9: 1B on 8 GPUs, α doubled: still bandwidth-bound', M.allreduce(1e9, 8, 'nv5', { alphaScale: 2 }).tLat < M.allreduce(1e9, 8, 'nv5').tBw / 10, true);
  { const S = 72 * TUNED.alphaUs.nvlink * 1e-6 * M.nvPerDir(5) * 1e9, r = M.allreduce(S / 2, 72, 'nv5'); near('ch9: at S = N·α·B the byte time equals the step cost', r.tBw, r.tLat, 1e-12); }
  check('ch9: every page choice is bandwidth-bound', M.AR.params.every(p => M.AR.ns.every(N => M.FABRIC_KEYS.every(k => { const r = M.allreduce(p, N, k); return r.tBw > r.tLat; }))), true);
  // ch10: α doubled keeps the ranking 72-domain < 8-domain < flat
  { const A0 = Object.assign({}, TUNED.alphaUs);
    for (const k of [0.5, 2]) { for (const a in A0) TUNED.alphaUs[a] = A0[a] * k; const t72 = M.hier(70e9, 9216, 72, 400), t8 = M.hier(70e9, 9216, 8, 400); Object.assign(TUNED.alphaUs, A0);
      check(`ch10: α × ${k}: ranking 72-domain < 8-domain < flat`, t72.t < t8.t && t8.t < t72.flat, true); } }
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { dma: '10', cLat: '170', mlp: '64', pcie16: '63', little64: '24.1', c1copy: '26.6', c1share: '2.3', c1fshare: '43.7', x100: '374', x100m256: '5.2', x100h: '184', x100d: '755', fStar: '38', fStar256: '90',
    portLo: '21', portHi: '25', pinMem: '80', pinSnoop: '50', cacheIdBits: '4', cacheIdN: '16', flitB: '68', flitPid: '2', flitPay: '64', flitCrc: '2', raw16: '64', fm16: '53.4', fc16: '56.6', fw16: '40.1', fm8: '26.7', fc256: '112', fw256: '73.8', ddr5: '38.4', fmDdr: '1.4',
    locLat: '111', locBw: '246', aLat: '214', bLat: '271', cLatDev: '394', dLat: '239', aBw: '24', bBw: '22', dBw: '52', estDirect: '170', estSwitch: '250', pondLo: '70', pondHi: '90', pondLocal: '78', sunEmu: '26', zipfS: '0.9', pages: '4096',
    t50q: '11', t50lat: '126', t50slow: '13', t50rq: '50', t50rlat: '175', t80q: '25', t80slow: '29', reach5: '23', reach5h: '8', reach5s: '62', tqq: '4', tqbw: '256', bwBest: '298', qBest: '17', tSwSlow: '14',
    mldMax: '16', swLo: '62', swHi: '70', pondRack: '180', pondSw: '70', strandLo: '3', strandHi: '27', pondSave: '10', pondCost: '7', perfLo: '1', perfHi: '5', poolCv: '0.35', p8: '16', p16: '17', p64: '17', p16h: '10', p16d: '26', p16i: '38', p16c: '0', poolRho: '0.5',
    gfd: '4096', pbrBits: '12', mldNodes: '32', dirW: '1024', dRO: '0.0', dW5: '470', dW5fan: '8.8', dW5h4: '179', dW5h4fan: '2.7', dCap: '941', dW20: '913', dW20share: '99',
    nv4: '900', nv5: '1800', nv6: '3000', nv4l: '18', nv6l: '36', nv4pl: '25', nv5pl: '50', nv6pl: '42', nv5d: '900', agg5: '130', agg6: '216', agg5c: '129.6', agg6c: '216.0', nvVsPcie: '14',
    ringN: '4', ringSteps: '6', arS: '16', arPer: '31.6', arNv5: '35', arIb: '632', arPc: '501', arNv6: '21', ar70: '307', ar8nv4: '62', alphaNv: '2', alphaNet: '5', alphaPc: '3', ar70ib: '5.5', ar70lat: '0.71', a1bw: '3.9', a1lat: '0.028', arEq: '130', nic400: '50', nic800: '100',
    h1: '0.39', h8: '0.98', hFlat: '5.7', hSpeed: '15', hOut1: '0.08', hUp1: '0.31', ualLane: '200', ualSig: '212.5', ualSt: '100', ualMax: '1024', ualBits: '10', ualTl: '64', ualDl: '640',
    ghC2c: '900', ghC2cDir: '450', ghVs: '7.1', ghPj: '1.3', ghW: '9.4', ghLp: '512', ghLpBw: '546', ghHbm: '96', ghHbmBw: '3000', miCores: '24', miCcd: '3', miXcd: '6', miCu: '38', miCus: '228', miHbm: '128', miTb: '5.3', miIc: '256',
    cxl4gts: '128', cxl4ret: '4', rubGpu: '3000', rubAgg: '216', rubHbm: '288', rubGpuOld: '3600', rubAggOld: '260', cpoPorts: '144', cpoGbps: '800', cx8: '800' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  // the diagram captions are filled from prose() too
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) { const v = Z['dg.' + m[1] + '.cap'] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in dg.${m[1]}.cap is not a prose value`); } } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // the claims the prose makes about the models
  check('ch1: at 5 % sharing wins, at 100 % copying wins at 1 MiB', P.c1share[0] < P.c1copy[0] && P.c1fshare[0] > P.c1copy[0], true);
  check('ch1: more requests in flight push the crossover out', P.x100m256[0] * 1024 > P.x100[0], true);
  check('ch3: cache write < mem read < cache read', P.fw16[0] < P.fm16[0] && P.fm16[0] < P.fc16[0], true);
  check('ch5: measured devices slower than the spec estimate', [P.aLat, P.bLat, P.dLat, P.cLatDev].every(x => x[0] > P.estDirect[0]), true);
  check('ch5: hot-first moves fewer accesses than random', P.t50q[0] < P.t50rq[0] && P.t50lat[0] < P.t50rlat[0], true);
  check('ch6: savings flatten (16 ≈ 64)', Math.abs(P.p64[0] - P.p16[0]) < 0.02 && P.p16i[0] > P.p16[0], true);
  check('ch7: writes dominate', P.dW20share[0] > 0.9 && P.dRO[0] === 0, true);
  check('ch9: NVLink 5 ≫ network ≈ PCIe', P.arIb[0] > 10 * P.arNv5[0] && P.arPc[0] > 10 * P.arNv5[0], true);
  check('ch10: hierarchical faster, mostly inside the domain', P.h1[0] < P.h8[0] && P.h8[0] < P.hFlat[0] && P.hUp1[0] > P.hOut1[0], true);
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (let e = 12; e <= 30; e++) for (const fr of M.SHARE.fracs) for (const m of M.SHARE.mlps) add(M.say.share(Math.pow(2, e), fr, m));
  for (const k of ['memRd', 'cacheRd', 'cacheWr']) for (const md of ['68', '256']) for (const w of [4, 8, 16]) add(M.say.flit(k, md, w));
  for (const T of [1, 2, 3]) for (const a of M.ACTIONS) for (const b of M.ACTIONS) { const r1 = M.protoStep(T, M.freshLines(), a); add(M.say.proto(r1)); add(M.say.proto(M.protoStep(T, r1.st, b))); }
  for (let p = 0; p <= 100; p++) for (const s of [0.45, 0.9, 1.2]) for (const d of M.TIER.devs) for (const pl of ['hot', 'random']) add(M.say.tier(p / 100, s, d, pl));
  for (const N of M.POOL.ns) for (const r of M.POOL.rhos) add(M.say.pool(N, r));
  for (const h of M.DIR.hosts) for (const w of M.DIR.writes) for (const c of M.DIR.caps) add(M.say.dir(h, w, c));
  for (const N of M.RING.ns) for (let k = 0; k <= 2 * (N - 1); k++) add(M.say.ring(N, k));
  for (const p of M.AR.params) for (const N of M.AR.ns) for (const fb of M.FABRIC_KEYS) add(M.say.ar(p, N, fb));
  for (const p of M.HIER.params) for (const T of M.HIER.totals) for (const G of M.HIER.domains) for (const nic of M.HIER.nics) add(M.say.hier(p, T, G, nic));
  const all = ['ch1.say.share', 'ch1.say.copy', 'ch1.say.alwaysShare', 'ch3.say.read', 'ch3.say.write', 'ch3.say.derived', 'ch4.say.no', 'ch4.say.quiet', 'ch4.say.msgs', 'ch4.say.snoop', 'ch4.say.bi',
    'ch5.say.none', 'ch5.say.all', 'ch5.say.cheap', 'ch5.say.costly', 'ch6.say.one', 'ch6.say.mld', 'ch6.say.switch', 'ch7.say.alone', 'ch7.say.ro', 'ch7.say.write', 'ch7.say.cap',
    'ch9.say.start', 'ch9.say.rs', 'ch9.say.rsdone', 'ch9.say.ag', 'ch9.say.done', 'ch9.say.bw', 'ch10.say.up', 'ch10.say.out'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  const fixed = ['ch4.say.start'];
  for (const k of fixed) { has(k); n++; if (!app.includes(`'${k}'`)) { fails++; console.error('FAIL app.js never shows ' + k); } }
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key is a branch ' + k, all.includes(k) || fixed.includes(k), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const a of M.ACTIONS) keys.add('ch4.act.' + a);
  for (const d of ['h2d', 'd2h']) keys.add('ch4.dir.' + d);
  for (const g of ['inval', 'shared']) keys.add('ch4.gone.' + g);
  for (const p of ['start', 'rs', 'ag', 'done']) keys.add('ch9.phase.' + p);
  for (const fb of M.FABRIC_KEYS) keys.add('ch9.fab.' + fb);
  for (const p of M.AR.params) keys.add('ch9.p.' + { 1e9: '1e9', 8e9: '8e9', 70e9: '70e9', 405e9: '405e9' }[p]);
  for (const k of [1, 2, 3]) { keys.add('dg.types.t' + k); keys.add('dg.types.e' + k); }
  for (const w of ['hot', 'random']) keys.add('ch5.why.' + w);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) { keys.add('dg.' + m[1] + '.aria'); keys.add('dg.' + m[1] + '.cap'); }
  for (const k of ['dg.types.t', 'dg.types.e']) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  // the say sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  check('six or more diagrams', [...html.matchAll(/class="dia" data-dg="/g)].length >= 6, true);
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');   // the bilingual label the registrar adds later
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  check('no provenance label yet (the registrar adds it)', /<details class="page-provenance"/.test(html), false);
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'coherent-interconnects computing/systems/coherent-interconnects/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 13 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner. Words the siblings own (and words the task file assigns to them) are linked, not claimed.
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  // NVLink 带宽 / NVLink vs PCIe (memory essay #ch9) and CXL 内存池 / CXL memory pooling (#ch10) moved here on 2026-11-15 (registrar)
  for (const a of ['共封装光学', 'co-packaged optics', 'Infinity Fabric', '侦听过滤器', 'snoop filter', '目录协议', 'directory protocol',
    '一致性域', 'coherence domain', '每比特能耗', 'pJ per bit', 'AMAT', 'Ultra Ethernet', '超以太网', 'RDMA', '缓存一致性', 'cache coherence', 'MESI', 'MOESI', 'NUMA', '芯粒', 'chiplet']) owned.set(norm(a), 'TASK');
  for (const sib of ['how-cores-share-memory', 'storage-over-a-network', 'why-compute-waits-for-memory', 'how-virtual-memory-works', 'how-pcie-works', 'how-a-computer-is-wired', 'how-thunderbolt-works',
    'how-cpu-caches-work', 'how-a-cpu-runs-a-program', 'switches-that-compute', 'how-memory-talks']) {
    const p = path.join(DIR, '..', sib, 'REGISTRY.json');
    if (fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), sib);
  }
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  { const where = new Map(); for (const c of R.concepts) for (const a of new Set([...c.aliases.zh, ...c.aliases.en].map(norm))) { n++; if (where.has(a)) { fails++; console.error(`FAIL alias ${a} in ${where.get(a)} and ${c.id}`); } where.set(a, c.id); } }
  // live sibling links point at chapters that exist; quoted titles match the siblings' own titles
  const all = Object.values(Z).join('');
  const SIBS = ['how-cores-share-memory', 'how-pcie-works', 'how-a-computer-is-wired', 'why-compute-waits-for-memory', 'how-virtual-memory-works', 'storage-over-a-network', 'how-cpu-caches-work', 'how-memory-talks'];
  for (const sib of SIBS) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp(sib + '/(#ch\\d+)?', 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    const sz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', sib, 'copy.zh.js'), 'utf8'), sz);
    check(`${sib} title quoted as in its copy`, all.includes('《' + sz.window.ESSAY_COPY.zh['hero.title'] + '》'), true);
  }
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!new RegExp('^\\.\\./(' + SIBS.join('|') + ')/(#ch\\d+)?$').test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }
  // B3 is live since 2026-11-15: ch3.p4 links its #ch5 under its own title, ch13.links its page top
  check('ch3.p4 links B3 #ch5', Z['ch3.p4'].includes("href='../how-memory-talks/#ch5'"), true); check('old B3 title gone', all.includes('《内存条是怎么和 CPU 说话的》'), false);
  check('ch13.links links B3', Z['ch13.links'].includes("href='../how-memory-talks/'"), true);
  for (const [k, a] of [['memory-pooling-switch', 'CXL 内存池'], ['memory-pooling-switch', 'CXL memory pooling'], ['nvlink-nvswitch', 'NVLink 带宽'], ['nvlink-nvswitch', 'NVLink vs PCIe']]) check(`${a} on ${k}`, R.concepts.find(c => c.id === k).aliases[/[一-鿿]/.test(a) ? 'zh' : 'en'].includes(a), true);
  for (const k of ['ch1.p2', 'ch1.p3', 'ch2.p1', 'ch7.p2', 'ch8.p4', 'ch10.p5', 'ch11.p1', 'ch12.p2', 'ch13.links']) { n++; if (!/href=/.test(Z[k])) { fails++; console.error('FAIL expected a sibling link in ' + k); } }
  // no buying advice or vendor ranking
  check('no ranking words', /最好的(?:产品|厂商)|值得买|推荐购买|性价比最高/.test(all.replace('不评价哪家的产品值得买', '')), false);

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (vendor figures, link arithmetic, CXL flit formulas, copy/share crossover, protocol sequences, tiering/pooling/directory limits, ring all-reduce on real numbers, hierarchical vs flat, and every number in the prose match the models)`);
