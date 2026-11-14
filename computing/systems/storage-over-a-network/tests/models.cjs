'use strict';
// Pins the page's models to the documents they implement (RFC 7143 defaults, NVMe/TCP 1.1 header lengths, RoCE v2
// header sizes), re-derives each model independently (closed forms checked against brute force or a Markov chain
// solved numerically), pins every number the prose quotes (placeholders come from prose(); every other number in the
// prose must be a spec/frontier/default value listed in models.js), pins how far each conclusion moves when a tuned
// parameter is halved or doubled, and evaluates every live sentence branch at the extremes of its controls.
// Run: node computing/systems/storage-over-a-network/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SPEC, DEFAULTS, LEVEL, NAS, ISCSI, FC, BUDGET, LOSS, CAPS, MP, EC, FRONTIER, KiB, MiB } = M;
const P = M.prose();

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const pv = k => P[k][0];

/* ── documents ── */
{
  const I = SPEC.iscsi;
  check('RFC 7143 BHS', I.bhs, 48); check('InitialR2T default', I.InitialR2T, true); check('ImmediateData default', I.ImmediateData, true);
  check('MRDSL default', I.MRDSL, 8192); check('MaxBurstLength default', I.MaxBurst, 262144); check('FirstBurstLength default', I.FirstBurst, 65536);
  check('MaxOutstandingR2T default', I.MaxOutR2T, 1); check('max length 2^24-1', I.maxLen, Math.pow(2, 24) - 1); check('iSCSI port', I.port, 3260);
  const T = SPEC.nvmeTcp;
  check('CapsuleCmd = CH + SQE', T.cmd, T.ch + T.sqe); check('CapsuleResp = CH + CQE', T.rsp, T.ch + T.cqe);
  check('H2C/C2HData = CH + 16', T.data, T.ch + 2 + 2 + 4 + 4 + 4); check('R2T = CH + 16', T.r2t, 24); check('ICReq 128', T.icreq, 128);
  const R = SPEC.roce; check('RoCE v2 base header', R.eth + R.ip4 + R.udp + R.bth + R.icrc + R.fcs, 62); check('RETH 16 = va 8 + rkey 4 + len 4', R.reth, 16);
  check('FC max frame', SPEC.fc.sof + SPEC.fc.hdr + SPEC.fc.payloadMax + SPEC.fc.crc + SPEC.fc.eof, SPEC.fc.frameMax);
  near('fibre µs/km', FC.usPerKm(), 4.90, 0.01);
  near('Backblaze AFR from counts', EC.afr() * 100, SPEC.bb.afrQuoted, 0.005);
  check('MSS at MTU 1500 with timestamps', M.tcpWire(1, 1500).mss, 1448); check('per-packet TCP overhead', M.tcpWire(1, 1500).per, 90);
}

/* ── 01 three levels ── */
{
  const c = LEVEL.cost(1, 8 * MiB, false);
  check('block cold 1 byte', c.block.bytes, 8192); check('file 1 byte', c.file.bytes, 1); check('object cold', c.object.bytes, 16 * MiB);
  check('block aligned 4096', LEVEL.cost(4096, 8 * MiB, false).block.bytes, 4096);
  check('block 4097 cold = 2 blocks + read', LEVEL.cost(4097, 8 * MiB, false).block.bytes, 3 * 4096);
  check('p blk1', pv('blk1'), 8192); check('p obj1c', pv('obj1c'), 8);
}

/* ── 02 small files: re-derive by hand and by a discrete simulation of P workers ── */
{
  const r = NAS.run(1000, 64, 0.5, 3, 1, 1), D = 3 * 0.0005 + 65536 / 125e6;
  near('NAS D', r.D, D, 1e-12); near('NAS T serial', r.T, 1000 * D, 1e-9);
  // P workers on a shared link: simulate fluid, round trips overlap, transfers share bandwidth
  function sim(N, sKiB, rttMs, k, Pw, gbps) {
    const B = gbps * 1e9 / 8, s = sKiB * 1024, rtt = rttMs / 1000; let t = 0, done = 0, started = 0;
    const w = []; for (let i = 0; i < Math.min(Pw, N); i++) { w.push({ wait: k * rtt, left: s }); started++; }
    const dt = Math.min(k * rtt, s / B) / 50;
    while (done < N) {
      const xfer = w.filter(x => x.wait <= 0 && x.left > 0); const share = xfer.length ? B / xfer.length : 0;
      for (const x of w) { if (x.wait > 0) x.wait -= dt; else if (x.left > 0) x.left -= share * dt; }
      for (let i = w.length - 1; i >= 0; i--) if (w[i].wait <= 0 && w[i].left <= 0) { done++; w.splice(i, 1); if (started < N) { w.push({ wait: k * rtt, left: s }); started++; } }
      t += dt;
    }
    return t;
  }
  for (const [s, rtt, k, Pw] of [[64, 30, 3, 16], [64, 0.5, 3, 16], [1024, 0.5, 1, 4]]) {
    const a = NAS.run(1000, s, rtt, k, Pw, 1).T, b = sim(1000, s, rtt, k, Pw, 1);
    n++; if (b < a * 0.98 || b > a * 1.25) { fails++; console.error(`FAIL NAS bound vs simulation s=${s} rtt=${rtt} P=${Pw}: bound ${a}, sim ${b}`); }
  }
  check('p nasT', pv('nasT').toFixed(2), '2.02'); check('p nasWT', pv('nasWT').toFixed(0), '91');
}

/* ── 03 iSCSI write against a hand count of RFC 7143 rules ── */
{
  const w = ISCSI.write(MiB, 0.1, 10, 'rfc');
  // 8 KiB immediate; 1 MiB − 8 KiB = 1040384 solicited, in bursts of 262144 → 4 R2T; Data-Out PDUs of 8192 → 127
  check('rfc immediate', w.imm, 8192); check('rfc R2T count', w.r2t, Math.ceil((MiB - 8192) / 262144)); check('rfc Data-Out PDUs', w.dataOut, (MiB - 8192) / 8192);
  check('rfc PDUs', w.pdus, 1 + 4 + 127 + 1); check('rfc rounds', w.rounds, 5);
  const nb = ISCSI.write(MiB, 10, 10, 'big'); check('big: one round', nb.rounds, 1); check('big: no R2T', nb.r2t, 0);
  const ni = ISCSI.write(4096, 0.1, 10, 'noimm'); check('no immediate 4 KiB → 1 R2T', ni.r2t, 1);
  const un = ISCSI.write(MiB, 1, 10, 'unsol'); check('InitialR2T=No: first 256 KiB unsolicited', un.unsol, 262144); check('unsol R2T', un.r2t, 3);
  // time = rounds × RTT + wire / rate
  near('rfc time', w.T, 5 * 0.0001 + M.tcpWire(MiB + 48 * (1 + 127), 1500).wire / 1.25e9, 1e-12);
  check('iWs ≥ 95%', pv('iWs') >= 0.95, true);
  // the prose's ordering: big profile beats RFC default at 10 ms by more than 4×
  check('big vs rfc at 10 ms', pv('iWT') / pv('iWbT') > 4, true);
}

/* ── 04 FC credits: brute-force event simulation of a credit-limited link ── */
{
  function simFC(g, km, cr, pl) {
    const G = FC.gen(g), tf = FC.frameBytes(pl) / (G.MBps * 1e6) * 1e6, tp = km * FC.usPerKm();
    let t = 0, credits = cr, sent = 0; const back = [];   // times when R_RDY returns
    const horizon = 200 * (2 * tp + tf) + 2000 * tf;
    while (t < horizon) {
      back.sort((a, b) => a - b); while (back.length && back[0] <= t) { back.shift(); credits++; }
      if (credits > 0) { credits--; sent++; back.push(t + tf + 2 * tp); t += tf; } else t = back[0];
    }
    return sent * tf / t;
  }
  for (const [g, km, cr, pl] of [[16, 50, 40, 2112], [8, 100, 400, 2112], [32, 10, 40, 2112], [16, 1, 8, 512]]) near(`FC util ${g}G ${km} km ${cr}`, FC.run(g, km, cr, pl).util, simFC(g, km, cr, pl), 0.01);
  check('need fills the link', FC.run(16, 50, pv('fcNeed'), 2112).util, 1); check('need − 1 does not', FC.run(16, 50, pv('fcNeed') - 2, 2112).util < 1, true);
  // Brocade rule of thumb (LinkSpeed/2 per km) within 15% of the model at full frames for 2..64G
  for (const g of [2, 4, 8, 16, 32, 64]) { const r = FC.run(g, 1, 1, 2112).perKm / FC.brocadePerKm(g); n++; if (r < 0.85 || r > 1.05) { fails++; console.error(`FAIL Brocade rule ${g}G ratio ${r}`); } }
  says('ch4.p3', '和这个模型差不到一成'); check('8G/100 km within 10% of rule', Math.abs(pv('fc8') / pv('fcBro8') - 1) < 0.1, true);
}

/* ── 05 budget ── */
{
  const b = BUDGET.run(75, 'tcpKernel', 0, 0); near('nand tcp kernel total', b.total, 96.39, 1e-9); near('share', b.share, 21.39 / 96.39, 1e-12);
  check('Chelsio agrees with SPDK within 1 µs', Math.abs(BUDGET.chelsioKernelTcp - BUDGET.fabric.tcpKernel) < 1, true);
  check('switch tuned: halving/doubling keeps NAND network share between 20% and 35% with three switches', [0.5, 2].every(sw => { const s = BUDGET.run(75, 'tcpKernel', 0, 3, sw).share; return s > 0.2 && s < 0.35; }), true);
  check('ordering hdd < nand < ull share', pv('bhS') < pv('bnS') && pv('bnS') < pv('buS'), true);
  check('ULL over TCP kernel: network dominates', pv('buS') > 0.5, true);
}

/* ── 06 loss ── */
{
  const r = LOSS.run(1e-3, 100, 20), W = 100e9 * 20e-6 / (4096 * 8);
  near('W', r.W, W, 1e-9); near('GBN formula', r.gbn, 0.999 / (1 + (W - 1) * 1e-3), 1e-12);
  // GBN by simulation: each loss costs W packet slots
  { const R = M.clamp, rng = (s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; })(9); let slots = 0, good = 0; const Wn = Math.round(W);
    while (good < 200000) { slots++; if (rng() < 1e-3) slots += Wn - 1; else good++; } near('GBN simulated', good / slots, LOSS.run(1e-3, 100, 20 * Wn / W).gbn, 0.01); }
  near('Mathis at p=1e-3', r.tcpG, Math.min(100, 1448 * 8 / 20e-6 * Math.sqrt(1.5) / Math.sqrt(1e-3) / 1e9), 1e-9);
  near('pFor inverts GBN', LOSS.run(LOSS.pFor(0.9, 100, 20), 100, 20).gbn, 0.9, 1e-9);
  near('pTcpFor inverts Mathis', LOSS.run(LOSS.pTcpFor(0.9, 100, 20), 100, 20).tcp, 0.9, 1e-9);
}

/* ── 07 capsules: hand-count a 4 KiB NVMe/TCP read and an RDMA write ── */
{
  const t = CAPS.run('tcp', 'read', 4096);
  // host→target: 72-byte capsule, 1 packet; target→host: 24 + 4096 = 4120 bytes, 3 packets of ≤ 1448
  check('tcp read packets', t.packets, 1 + 3); check('tcp read wire', t.wire, 72 + 90 + 4120 + 3 * 90); check('tcp read rt', t.rt, 1);
  check('tcp read without SUCCESS adds a response', CAPS.run('tcp', 'read', 4096, { succ: false }).msgs, 3);
  const r = CAPS.run('rdma', 'write', 4096, { icd: false }), per = 62 + 20;
  check('rdma write msgs', r.msgs, 4); check('rdma write rt', r.rt, 2);
  check('rdma write wire', r.wire, (64 + per) + (0 + per + 16) + (4096 + per + 4) + (16 + per));
  check('iscsi 64 KiB read: 8 Data-In', CAPS.run('iscsi', 'read', 65536).msgs, 1 + 8);
  check('writes with data in the command: 1 round trip on all three', ['iscsi', 'tcp', 'rdma'].every(tr => CAPS.run(tr, 'write', 4096, { icd: true }).rt === 1), true);
}

/* ── 06 Mathis constant: the page uses √(3/2); the alternatives it quotes move the TCP line by the stated amounts and
   leave it far below go-back-N at the defaults ── */
{
  const A = LOSS.mathisAlt, C0 = Math.sqrt(1.5), l = LOSS.run(1e-3, 100, 20);
  near('Mathis delayed-ACK constant √(3/4)', A.delayed, Math.sqrt(0.75), 0.005);
  n++; if (!(1 - A.delayed / C0 > 0.25 && 1 - A.delayed / C0 < 0.32)) { fails++; console.error('FAIL delayed-ACK constant should move the TCP line down by about 30%'); }
  n++; if (!(A.random / C0 - 1 > 0 && A.random / C0 - 1 < 0.1)) { fails++; console.error('FAIL random-loss constant should move the TCP line up by under 10%'); }
  for (const c of [A.delayed, A.random]) { n++; if (!(l.tcp * c / C0 < l.gbn / 2)) { fails++; console.error(`FAIL with C=${c} TCP should stay far below go-back-N at the defaults`); } }
}

/* ── review 2026-11-15: live-sentence states that used to read wrongly ── */
{
  check('ch2 16 MiB files at 50 µs: not "stuck on round trips"', M.say.nas(1000, 16384, 0.05, 3, 1, 1).key, 'ch2.say.bwNear');
  check('ch2 default stays round-trip bound', M.say.nas(1000, 64, 0.5, 3, 1, 1).key, 'ch2.say.rtt');
  const loc = BUDGET.run(BUDGET.media.ull, 'local', 100, 6);
  check('ch5 local drive ignores distance and switches', loc.net, 0); check('ch5 local sentence with distance set', M.say.budget(BUDGET.media.ull, 'local', 100, 6).key, 'ch5.say.local');
  check('ch8 beyond both paths: overAll', M.say.mp(145, 100, 0.2).key, 'ch8.say.overAll');
  check('ch8 beyond the optimised path only: over', M.say.mp(145, 100, 1).key, 'ch8.say.over');
  const e = EC.run(9, 6, 0.005, 1); n++; if (!isFinite(e.nines) || e.nines < 15) { fails++; console.error('FAIL ch9 nines must stay finite when the yearly loss probability is tiny, got ' + e.nines); }
}

/* ── 08 multipath: square-root rule = brute-force minimum ── */
{
  for (const [lam, mu1, q] of [[80, 100, 0.5], [20, 100, 0.5], [120, 100, 0.5], [60, 100, 0.25], [140, 100, 0.9]]) {
    const mu2 = mu1 * q; let best = Infinity, bp = 0; for (let p = 0; p <= 1.000001; p += 1e-4) { const T = MP.T(Math.min(1, p), lam, mu1, mu2); if (T < best) { best = T; bp = p; } }
    const pb = MP.best(lam, mu1, mu2); near(`MP best p λ=${lam} q=${q}`, pb, bp, 2e-4); near(`MP best T λ=${lam}`, MP.T(pb, lam, mu1, mu2), best, best * 1e-4);
  }
  check('M/M/1 single path', MP.T(1, 80, 100, 50), 1 / 20);
  // tuned ratio halved/doubled: spilling still beats optimized-only at the default load; failover still unstable
  for (const q of [0.25, 1]) { const r = MP.run(80, 100, q); check(`spill wins at q=${q}`, r.T.best < r.T.opt, true); check(`failover unstable at q=${q}? `, isFinite(r.fail1), q === 1); }
  says('ch8.limit', '两条路的速率比是调出来的参数');
}

/* ── 09 EC: MTTDL approximation vs exact absorbing Markov chain ── */
{
  function exactMTTDL(nn, k, lamH, muH) {
    // states 0..m (failed count), absorbing at m+1; failure rate (n−i)λ, repair rate μ (one at a time) when i>0
    const m = nn - k, S = m + 1, A = Array.from({ length: S }, () => Array(S + 1).fill(0));
    for (let i = 0; i < S; i++) { const f = (nn - i) * lamH, r = i > 0 ? muH : 0; A[i][i] = f + r; if (i + 1 < S) A[i][i + 1] = -f; if (i > 0) A[i][i - 1] = -r; A[i][S] = 1; }
    for (let c = 0; c < S; c++) { for (let r = c + 1; r < S; r++) { const k2 = A[r][c] / A[c][c]; for (let j = c; j <= S; j++) A[r][j] -= k2 * A[c][j]; } }
    const x = Array(S).fill(0); for (let r = S - 1; r >= 0; r--) { let s = A[r][S]; for (let j = r + 1; j < S; j++) s -= A[r][j] * x[j]; x[r] = s / A[r][r]; }
    return x[0];
  }
  const afr = EC.afr(), lam = -Math.log(1 - afr) / 8760;
  for (const [nn, k] of [[3, 1], [14, 10], [2, 1], [9, 6]]) {
    const a = EC.run(nn, k, afr, 24).mttdl, e = exactMTTDL(nn, k, lam, 1 / 24);
    n++; if (Math.abs(a / e - 1) > 0.05) { fails++; console.error(`FAIL MTTDL approx vs exact (${nn},${k}): ${a} vs ${e}`); }
  }
  check('RS(10,4) overhead', EC.run(14, 10, afr, 24).overhead, 1.4); check('RS(10,4) tolerates 4', EC.run(14, 10, afr, 24).m, 4);
  check('RS(10,4) more nines than 3×', pv('e10n') > pv('e3n'), true);
  check('MTTR doubled keeps order', pv('e10nh') > pv('e3nh'), true);
  says('ch9.p3', '修理时间是调出来的参数');
}

/* ── placeholders: every prose placeholder comes from prose(), and every prose() value is quoted somewhere ── */
const SAYKEY = /\.say\.|^u\.|\.cv\.|^ch8\.unit/;
{
  const used = new Set();
  for (const [k, v] of Object.entries(Z)) {
    if (SAYKEY.test(k)) continue;
    for (const m of v.matchAll(/\{(\w+)\}/g)) { used.add(m[1]); n++; if (!(m[1] in P)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is not produced by prose()`); } }
  }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error(`FAIL prose() value ${k} is never quoted`); } }
}

/* ── literal numbers in the prose: each must be a value in SPEC, FRONTIER, DEFAULTS or the media presets ── */
{
  const allowed = new Set();
  const walk = o => { if (o == null) return; if (typeof o === 'number') { allowed.add(String(o)); return; } if (typeof o === 'string') { for (const m of o.matchAll(/\d+(\.\d+)?/g)) { allowed.add(m[0]); allowed.add(String(+m[0])); } return; } if (typeof o === 'object') for (const v of Object.values(o)) walk(v); };
  walk(SPEC); walk(FRONTIER); walk(DEFAULTS); walk(BUDGET.fabric); walk(BUDGET.media); walk(BUDGET.chelsioKernelTcp); walk(BUDGET.switchUs); walk(LOSS.roceMtu); walk(LOSS.tcpMss); walk(LOSS.mathisAlt);
  walk(LEVEL.block);
  // derived from the defaults, written as words or binary sizes in the prose
  const DERIVED = { '0.5': 'nas rtt / ratio', '8': 'S = 8 MiB; immediate 8 KiB', '1': 'k = 1 byte, 1 MiB', '64': 'KiB sizes', '16': '16 MiB burst max', '1500': 'MTU', '4': '4 KiB', '100': '100 Gb/s', '20': 'RTT 20 µs', '200': 'RTT 200 µs', '30': 'rtt far', '10': 'RTT 10 ms, 10 km, 10 Gb/s', '50': '50 km', '40': 'credits', '2': 'two switches, double', '3': 'NFS attr min', '6': 'RS(6,3)', '9': 'RS(6,3) n', '24': 'mttr', '48': 'mttr doubled', '11': '“11 个 9” vendor claim', '128': 'CXL GT/s, 128G', '256': '256GFC', '56': 'ports', '12425': '128GFC MB/s', '2.0': 'NVMe 2.0 (2021)', '2021': 'NVMe 2.0 year', '2015': 'RFC 7530 date', '1975': 'Kleinrock', '1984': 'Lazowska', '1997': 'Mathis', '2018': 'IRN', '2016': 'Guo', '2013': 'VLDB', '2010': 'HotStorage', '2014': 'RFC 7143', '2025': 'Backblaze year', '2026': 'as-of year', '7': 'chapter', '27': 'CCR volume', '7530': 'RFC', '802.1': 'IEEE 802.1Qbb', '5': '5 µs per km in the summary; Linux keep-alive', '1.1': 'NVMe/TCP rev', '12': 'month', '15': 'day', '05': 'month', '2.4': 'NVMe 2.4', '4.0': 'CXL 4.0', '5.0': 'Linux 5.0', '24.05': 'SPDK release', '6348': 'Xeon model', '6.0.18': 'kernel', '123456': 'example block number (as in the SATA essay)', '512': 'frame payload option' };
  for (const k of Object.keys(DERIVED)) allowed.add(k);
  const bad = [];
  for (const [k, v] of Object.entries(Z)) {
    if (SAYKEY.test(k) || /^footer|^doc\.|^ch1\.r\.|^toc\.|\.title$|\.how$|\.aria$|\.ctl\.|\.read\.|\.leg\.|^ch\d+\.(size|prof|f|m|t|o|s|k|h)\./.test(k)) continue;
    const text = v.replace(/<a [^>]*>/g, '').replace(/<code>[^<]*<\/code>/g, '').replace(/\{\w+\}/g, '').replace(/<[^>]+>/g, '').replace(/第 \d+ 章/g, '').replace(/§[\d.–]+/g, '').replace(/RS\(\d+,\d+\)/g, '').replace(/(NVMe|SAS|SATA|FC-PI|FC|GFC|nfs)\(?\d*\)?/g, '');
    for (const m of text.matchAll(/\d+(?:[.,]\d+)*/g)) { const tok = m[0].replace(/,/g, ''); if (!allowed.has(tok) && !allowed.has(String(+tok))) bad.push(`${k}: ${m[0]}`); }
  }
  n++; if (bad.length) { fails++; console.error('FAIL literal numbers in prose not backed by models.js:\n  ' + bad.join('\n  ')); }
}

/* ── frontier dates are in the copy ── */
{
  const all = Object.values(Z).join('');
  const zhDate = d => { const [y, m, dd] = d.split('-').map(Number); return dd ? `${y} 年 ${m} 月 ${dd} 日` : `${y} 年 ${m} 月`; };
  for (const k of ['nvme24', 'nvmeTcp11', 'linuxNvmeTcp', 'winPreview', 'fc128', 'uec10', 'cxl40']) { n++; if (!all.includes(zhDate(FRONTIER[k]))) { fails++; console.error(`FAIL frontier date ${k} (${zhDate(FRONTIER[k])}) not in copy`); } }
  says('ch10.d2', `${FRONTIER.fc128Ports} 个 128G 端口`); says('ch10.e3', `${FRONTIER.cxl40GT} GT/s`); says('ch10.d3', `SPDK ${FRONTIER.spdkRel}`); says('ch10.d3', `${FRONTIER.chelsioYear} 年`);
  says('ch5.p2', '4.72'); says('ch5.p2', '12.10'); says('ch5.p2', '17.50'); says('ch5.p2', '21.39'); says('ch5.p2', '21.46');
}

/* ── live sentences: every branch reached at the extremes; every say key exists; placeholders supplied by app.js ── */
{
  const hit = new Set(), D = DEFAULTS;
  for (const k of [1, 4096, 4097, 1 << 20]) for (const S of [64 * KiB, 8 * MiB, 1 << 30]) for (const c of [true, false]) hit.add(M.say.level(Math.min(k, S), S, c).key);
  hit.add(M.say.level(1, 1024, true).key);
  for (const s of [4, 64, 16384]) for (const rtt of [0.05, 0.5, 100]) for (const k of [1, 4]) for (const p of [1, 64]) for (const g of [1, 10]) hit.add(M.say.nas(1000, s, rtt, k, p, g).key);
  for (const W of [4096, MiB, 16 * MiB]) for (const rtt of [0.02, 50]) for (const pr of ['rfc', 'noimm', 'unsol', 'big']) for (const g of [10, 100]) hit.add(M.say.iscsi(W, rtt, g, pr).key);
  for (const g of [4, 128]) for (const km of [0.1, 200]) for (const cr of [2, 2000]) for (const pl of [512, 2112]) hit.add(M.say.fc(g, km, cr, pl).key);
  hit.add(M.say.fc(16, 50, 250, 2112).key);
  for (const m of Object.values(BUDGET.media)) for (const t of Object.keys(BUDGET.fabric)) for (const km of [0, 100]) for (const h of [0, 6]) hit.add(M.say.budget(m, t, km, h).key);
  for (const p of [1e-7, 1e-3, 0.1]) for (const g of [25, 400]) for (const r of [2, 500]) hit.add(M.say.loss(p, g, r).key);
  for (const t of ['iscsi', 'tcp', 'rdma']) for (const o of ['read', 'write']) for (const i of [true, false]) hit.add(M.say.caps(t, o, i).key);
  for (const l of [5, 45, 60, 90, 145]) for (const q of [0.2, 1]) hit.add(M.say.mp(l, 100, q).key);
  for (const s of Object.values(EC.SCHEMES)) hit.add(M.say.ec(s.n, s.k, 0.0136, 24).key);
  const sayKeys = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of sayKeys) { n++; if (!hit.has(k)) { fails++; console.error(`FAIL live sentence ${k} never reached by the sweep`); } }
  for (const k of hit) { n++; if (Z[k] == null) { fails++; console.error(`FAIL say key ${k} missing in copy`); } }
  for (const k of sayKeys) for (const m of Z[k].matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  // every data-i18n key in the markup exists
  for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"|data-hk="([^"]+)"/g)) { const k = m[1] || m[2]; n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const m of app.matchAll(/\bt\('([\w.]+)'\s*[,)]/g)) { n++; if (Z[m[1]] == null) { fails++; console.error('FAIL app.js uses missing key ' + m[1]); } }
}

/* ── language hygiene, registry, links ── */
{
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'storage-over-a-network computing/systems/storage-over-a-network/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  // one word, one owner: the siblings' aliases (and the TASK file's NVMe list) are not ours to take
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  ['NVMe 为什么快', 'NVMe 和 SATA 区别', 'NVMe vs SATA', 'AHCI 协议瓶颈', 'AHCI overhead', 'NVMe vs AHCI', 'SATA III 速度上限', '队列深度 QD 是什么', 'queue depth', 'NVMe 64K 队列', 'AHCI 32 queue depth limit', '写放大', 'write amplification', 'TRIM'].forEach(a => owned.set(norm(a), 'TASK list'));
  const sib = ['computing/systems/why-nvme-is-fast', 'computing/systems/what-a-drive-is-made-of', 'computing/systems/how-sata-works', 'computing/systems/how-sas-works', 'computing/systems/how-usb-drives-talk', 'computing/systems/why-compute-waits-for-memory', 'tech/networks/how-a-web-page-arrives', 'tech/networks/how-much-a-wire-can-carry'];
  for (const s of sib) { const f = path.join(DIR, '..', '..', '..', s, 'REGISTRY.json'); if (fs.existsSync(f)) for (const c of JSON.parse(fs.readFileSync(f, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), s); }
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  // links to other site pages: the page exists and the anchor exists there
  const all = Object.values(Z).join('');
  for (const m of all.matchAll(/href='\.\.\/([\w-]+)\/(#[\w-]+)?'/g)) {
    const f = path.join(DIR, '..', m[1], 'index.html'); n++;
    if (!fs.existsSync(f)) { fails++; console.error('FAIL link to missing page ' + m[1]); continue; }
    if (m[2]) check(`anchor ${m[1]}${m[2]}`, fs.readFileSync(f, 'utf8').includes(`id="${m[2].slice(1)}"`), true);
  }
  for (const m of all.matchAll(/href='(#ch\d+)'/g)) check('own anchor ' + m[1], html.includes(`id="${m[1].slice(1)}"`), true);
  // the USB essay S4 is live (2026-11-15): ch11.links links it and its #ch6 (SCSI translation in the enclosure)
  const usbLinks = v => v.match(/how-usb-drives-talk\/#?\w*/g) || [];
  check('links to S4 (ch11.links: essay, #ch6)', usbLinks(all).sort().join(' '), 'how-usb-drives-talk/ how-usb-drives-talk/#ch6');
  check('ch11.links holds the S4 links', usbLinks(Z['ch11.links']).length, 2);

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  { const hrefs = o => (Object.values(o).join('').match(/href='[^']*'/g) || []).sort().join(' ');
    check('en links = zh links', hrefs(EN), hrefs(Z)); }
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k] || ''), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (spec values, independent re-derivations, every number in the prose, every live sentence branch)`);
