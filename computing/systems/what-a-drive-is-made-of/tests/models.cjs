'use strict';
// Pins every number the essay's prose states to the page's own models (or to the source values in models.js that
// the prose quotes), checks that copy.zh.js still says exactly that number, pins how far each conclusion moves when
// a tuned parameter is changed, and evaluates every live sentence branch at the extremes of its controls.
// Run: node computing/systems/what-a-drive-is-made-of/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const ctxE = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ctxE);
const EN = ctxE.window.ESSAY_COPY.en;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const reg = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const fmt = M.fmt, f1 = x => fmt(x, 1), f0 = x => fmt(x), f2 = x => fmt(x, 2);
const resolve = o => { let s = Z[o.key]; for (const [k, v] of Object.entries(o.v)) s = s.split('{' + k + '}').join(v && v.k ? Z[v.k] : v); return s; };
function branch(name, o) { n++; const s = Z[o.key]; if (s == null) { fails++; console.error(`FAIL ${name}: missing key ${o.key}`); return; } const r = resolve(o); if (/\{\w+\}/.test(r) || /undefined|NaN|—/.test(r)) { fails++; console.error(`FAIL ${name}: unfilled or bad sentence: ${r}`); } }

/* ── copy files ── */
{
  { const a = Object.keys(EN), b = Object.keys(Z); check('en has the same keys as zh', a.filter(k => !(k in Z)).concat(b.filter(k => !(k in EN))).join(), ''); }
  for (const k of Object.keys(Z)) { const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(); if (ph(Z[k]) !== ph(EN[k])) { n++; fails++; console.error('FAIL placeholders differ for ' + k); } }
  const used = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const k of used) check('index key exists: ' + k, Z[k] != null, true);
  check('no CJK in app.js/models.js', /[\u3400-\u9fff]/.test(fs.readFileSync(path.join(DIR, 'app.js'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').replace(/'中'/g, '')) || /[\u3400-\u9fff]/.test(fs.readFileSync(path.join(DIR, 'models.js'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), false);
  check('registry title = doc.title head', Z['doc.title'].startsWith(reg.title.zh), true);
  check('registry desc = doc.desc', reg.desc.zh, Z['doc.desc']);
  for (const c of reg.concepts) check('anchor exists ' + c.anchor, html.includes(`id="${c.anchor.slice(1)}"`), true);
  const nvme = ['NVMe 为什么快', 'NVMe 和 SATA 区别', 'NVMe vs SATA', 'AHCI', 'SATA III 速度上限', '队列深度', 'queue depth', '64K', '写放大', 'write amplification', 'TRIM', 'Trim'];
  for (const c of reg.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) for (const bad of nvme) if (a.includes(bad)) { n++; fails++; console.error(`FAIL alias "${a}" takes the NVMe page's word "${bad}"`); }
  // links to the NVMe essay point at anchors that exist there
  const nv = fs.readFileSync(path.join(DIR, '..', 'why-nvme-is-fast', 'index.html'), 'utf8');
  for (const v of Object.values(Z)) for (const m of v.matchAll(/why-nvme-is-fast\/#(ch\d+)/g)) check('NVMe anchor ' + m[1], nv.includes(`id="${m[1]}"`), true);
  // relative links to other site pages exist
  for (const v of Object.values(Z)) for (const m of v.matchAll(/href=\\?"(\.\.\/[^"#\\]+)/g)) check('link target exists ' + m[1], fs.existsSync(path.join(DIR, m[1], 'index.html')), true);
}

/* ── ch1 sectors ── */
{
  const S = M.sector, a = S.write(63, 4), b = S.write(2048, 4);
  check('ch1 63 touches 2', a.touched, 2); check('ch1 63 reads 8 KiB', a.read / 1024, 8); check('ch1 63 writes 8 KiB', a.written / 1024, 8);
  check('ch1 2048 aligned', b.rmw, false); check('ch1 2048 is 1 MiB', 2048 * 512, 1 << 20);
  says('ch1.p3', '第 63 号扇区'); says('ch1.p3', '先读 ' + f0(a.read / 1024) + ' KiB、再写 ' + f0(a.written / 1024) + ' KiB'); says('ch1.p3', '第 2048 号扇区（1 MiB 处）');
  says('ch1.p2', S.PHYS + ' 字节'); says('ch1.p2', S.PER + ' 个编号');
  for (const o of [0, 1, 7, 8, 63, 64, 80]) branch('ch1 say ' + o, M.say.sector(o));
  check('ch1 branches', [M.say.sector(64).key, M.say.sector(63).key].join(), 'ch1.say.ok,ch1.say.rmw');
}

/* ── ch2 disk ── */
{
  const D = M.disk, r = D.random(7200, 1);
  check('ch2 RW coefficients', [D.RW.a, D.RW.b, D.RW.c, D.RW.e, D.RW.cut, D.RW.N].join('/'), '3.24/0.4/8/0.008/383/1962');
  check('ch2 RW continuous at the cut', Math.abs((D.RW.a + D.RW.b * Math.sqrt(383)) - (D.RW.c + D.RW.e * 383)) < 0.02, true);
  check('ch2 fit: single-track 1.0', f2(D.seek(1 / D.RW.N)), '1.00'); check('ch2 fit: average 8.5', f2(D.avgSeek(1)), '8.50');
  check('ch2 mean distance 1/3 (density 2(1-x))', D.meanOver(x => x, 1).toFixed(4), '0.3333');
  says('ch2.limit', '单道寻道 ' + f1(D.T2T) + ' 毫秒、平均寻道 ' + f1(D.AVG) + ' 毫秒');
  check('ch2 full stroke', f1(D.full()), '17.4'); says('ch2.limit', '满行程 ' + f1(D.full()) + ' 毫秒');
  check('ch2 rotation', f2(r.rot), '4.17'); says('ch2.p3', '平均转动等待 ' + f2(r.rot) + ' 毫秒（厂商手册写 4.16）');
  check('ch2 transfer under 0.1 ms', r.xfer < 0.1, true); says('ch2.p3', '不到 0.1 毫秒的传输');
  check('ch2 random 7200', f1(r.t), '12.7'); says('ch2.p3', '约 ' + f1(r.t) + ' 毫秒，每秒约 ' + f0(r.iops) + ' 次，其中寻道占 ' + f0(r.seekShare * 100) + '%');
  says('ch2.p3', '平均寻道 ' + f1(r.seek) + ' 毫秒');
  says('ch2.p3', '每秒也只到约 ' + f0(D.random(15000, 1).iops) + ' 次'); says('ch2.p3', '5,400 转是约 ' + f0(D.random(5400, 1).iops) + ' 次');
  const sh = D.random(7200, 0.1); says('ch2.p3', '最外面 10% 的范围'); says('ch2.p3', '平均寻道缩到 ' + f1(sh.seek) + ' 毫秒，每秒约 ' + f0(sh.iops) + ' 次');
  says('ch2.p3', '8,500 微秒'); check('ch2 NVMe page 8,500 us equals the average seek', f0(D.AVG * 1000), '8,500');
  says('ch2.p4', '外圈 ' + f0(D.odRate(7200)) + ' MB/s，内圈约 ' + f0(D.idRate(7200)) + ' MB/s，整盘平均约 ' + f0(D.meanSeq(7200)) + ' MB/s');
  says('ch2.limit', '半径比 ' + f1(D.RHO));
  { const save = D.RHO, out = [0.4, 0.6].map(x => { D.RHO = x; return [D.meanSeq(7200), D.random(7200, 1).t]; }); D.RHO = save;
    says('ch2.limit', '取 0.4 到 0.6，整盘平均在 ' + f0(out[0][0]) + '–' + f0(out[1][0]) + ' MB/s');
    check('ch2 random read hardly moves with the radius ratio', Math.abs(out[0][1] - out[1][1]) < 0.01, true); }
  // sentence branches at the extremes
  const keys = new Set();
  for (const rpm of [5400, 7200, 10000, 15000]) for (const s of [0.02, 0.1, 0.5, 1]) { const o = M.say.disk(rpm, s); keys.add(o.key); branch(`ch2 say ${rpm}/${s}`, o); }
  check('ch2 all branches', [...keys].sort().join(), 'ch2.say.full,ch2.say.shortRot,ch2.say.shortSeek');
  // the "rot" sentence claims seek < half a turn; the "seek" one claims seek ≥ half the time
  for (const rpm of [5400, 15000]) for (const s of [0.02, 0.05, 0.3]) { const o = M.say.disk(rpm, s), x = D.random(rpm, s); if (o.key === 'ch2.say.shortRot') check('ch2 shortRot honest', x.seek < x.rot, true); }
}

/* ── ch3 SMR ── */
{
  const S = M.smr, u10 = S.update(10, 0.8, 7200), u100 = S.update(100, 0.8, 7200);
  says('ch3.p3', '磁道间距 0.8、每组 10 条：多装 ' + f0((u10.gain - 1) * 100) + '%，上限是 ' + f0((S.maxGain(0.8) - 1) * 100) + '%');
  says('ch3.p3', '平均要重写后面的 ' + f1(u10.tracks) + ' 条（共约 ' + f0(u10.mb) + ' MB，按第二章外圈每条 ' + f1(M.disk.trackMB(7200)) + ' MB 算），耗时约 ' + f0(u10.ms) + ' 毫秒，是原地改写一圈 ' + f1(M.disk.rev(7200)) + ' 毫秒的 ' + f0(u10.slow) + ' 倍');
  says('ch3.p3', '容量只到 ' + f0((u100.gain - 1) * 100) + '%，重写变成 ' + f1(u100.tracks) + ' 条、' + f0(u100.ms) + ' 毫秒，' + f0(u100.slow) + ' 倍');
  says('ch3.p3', 'B/((B−1)q+1)'); says('ch3.p3', '(B+1)/2');
  check('ch3 gain→1/q', f2(S.gain(1e6, 0.8)), '1.25');
  const keys = new Set(); for (const B of [1, 2, 10, 100]) for (const q of [0.5, 0.8, 0.95]) { const o = M.say.smr(B, q); keys.add(o.key); branch(`ch3 say ${B}/${q}`, o); }
  check('ch3 all branches', [...keys].sort().join(), 'ch3.say,ch3.say.one,ch3.say.sat');
}

/* ── ch4 cells ── */
{
  const Cl = M.cell, w = M.W0;
  says('ch4.p3', '相邻两层间距 ' + f0(Cl.delta(3) * 1000) + ' mV'); says('ch4.p3', '约 ' + M.sci(Cl.rber(3, w.s0)));
  says('ch4.p3', 'QLC 间距缩到 ' + f0(Cl.delta(4) * 1000) + ' mV，新的时候已经是 ' + M.sci(Cl.rber(4, w.s0)));
  says('ch4.p3', 'PLC 只剩 ' + f0(Cl.delta(5) * 1000) + ' mV，新的时候是 ' + M.sci(Cl.rber(5, w.s0)) + '，超过了第五章算出的纠错上限 ' + M.sci(M.ecc.P0));
  check('ch4 PLC fails new', Cl.rber(5, w.s0) > M.ecc.P0, true);
  says('ch4.limit', '窗口宽度 ' + Cl.WIN + ' V');
  // the window drops out: endurance does not depend on it
  { const save = Cl.WIN; Cl.WIN = 3; Cl._w = {}; const a = Cl.endurance(4, M.ecc.P0, Cl.wear(M.ecc.P0)); Cl.WIN = save; Cl._w = {}; check('ch4 window is irrelevant to endurance', f0(a), f0(Cl.endurance(4, M.ecc.P0, Cl.wear(M.ecc.P0)))); }
  check('ch4 Q(0)=0.5', M.Q(0).toFixed(6), '0.500000'); check('ch4 Q(3)', M.Q(3).toExponential(3), '1.350e-3');
  const keys = new Set(); for (const b of [1, 2, 3, 4, 5]) for (const N of [0, 50, 1000, 5000]) { const o = M.say.cell(b, N); keys.add(o.key); branch(`ch4 say ${b}/${N}`, o); }
  check('ch4 all branches', [...keys].sort().join(), 'ch4.say.mush,ch4.say.ok,ch4.say.over');
}

/* ── ch5 ECC and life ── */
{
  const E = M.ecc, Cl = M.cell;
  check('ch5 default t', E.T, 40); says('ch5.p3', '每 1 KiB 纠正 ' + E.T + ' 位（码率 ' + f1(E.rate(E.T) * 100) + '%）');
  says('ch5.p3', '原始误码率最多约 ' + M.sci(E.P0)); says('ch5.p3', '10⁻³ 到 10⁻²'); check('ch5 limit within Cai range', E.P0 > 1e-3 && E.P0 < 1e-2, true);
  const pEnt = E.limit(E.T, E.UBER.ent); says('ch5.p3', '还是约 ' + M.sci(pEnt)); check('ch5 enterprise limit within 10%', pEnt / E.P0 > 0.9, true);
  const tb = E.table(E.T, E.UBER.client);
  check('ch5 MLC calibrated', f0(tb[1].pe), '3,000'); check('ch5 TLC calibrated', f0(tb[2].pe), '1,000');
  says('ch5.p4', 'MLC 正好撑 3,000 次、TLC 撑 1,000 次'); says('ch5.p4', 'SLC 约 ' + f0(tb[0].pe) + ' 次，QLC 约 ' + f0(tb[3].pe) + ' 次，PLC ' + f0(tb[4].pe) + ' 次');
  says('ch5.p4', '减半到 20 位，QLC 降到约 ' + f0(E.table(20, E.UBER.client)[3].pe) + ' 次'); says('ch5.p4', '加倍到 80 位，升到约 ' + f0(E.table(80, E.UBER.client)[3].pe) + ' 次');
  // calibration halved / doubled
  const qs = []; for (const cal of [{ mlc: 1500, tlc: 1000 }, { mlc: 6000, tlc: 1000 }, { mlc: 3000, tlc: 500 }, { mlc: 3000, tlc: 2000 }]) { const save = Cl.CAL; Cl.CAL = cal; Cl._w = {}; qs.push(Cl.endurance(4, E.P0, Cl.wear(E.P0))); Cl.CAL = save; Cl._w = {}; }
  says('ch5.p5', 'QLC 的预测从 ' + f0(Math.min(...qs)) + ' 变到约 ' + f0(Math.max(...qs)) + ' 次');
  // the robust claim: each extra bit cuts endurance under every calibration tried
  for (const cal of [{ mlc: 1500, tlc: 1000 }, { mlc: 6000, tlc: 1000 }, { mlc: 3000, tlc: 500 }, { mlc: 3000, tlc: 2000 }, { mlc: 3000, tlc: 1000 }]) { const save = Cl.CAL; Cl.CAL = cal; Cl._w = {}; const w = Cl.wear(E.P0), e = [1, 2, 3, 4].map(b => Cl.endurance(b, E.P0, w)); Cl.CAL = save; Cl._w = {}; check('ch5 monotone ' + JSON.stringify(cal), e[0] > e[1] && e[1] > e[2] && e[2] > e[3], true); }
  // lifetime
  check('ch5 OP', f1(E.OP * 100), '7.4'); says('ch5.p6', '预留空间这里取 ' + f1(E.OP * 100) + '%');
  says('ch5.p6', 'TLC 擦写 1,000 次、每天写满 0.33 遍、写放大 2，约 ' + f1(E.years(1000, E.OP, 0.33, 2)) + ' 年');
  check('ch5 870 EVO DWPD', f2(E.dwpd(600, 1, 5)), '0.33'); says('ch5.p7', '标 600 TBW、保修 5 年，相当于 ' + f2(E.dwpd(600, 1, 5)) + ' DWPD，也就是 600 次整盘写入');
  says('ch5.p8', '取常被引用的 1.1 eV，40 °C 比 30 °C 快约 ' + f1(E.af(1.1, 30, 40)) + ' 倍，55 °C 快约 ' + f0(E.af(1.1, 30, 55)) + ' 倍');
  says('ch5.p8', '取 0.6 eV，分别是约 ' + f1(E.af(0.6, 30, 40)) + ' 倍和 ' + f1(E.af(0.6, 30, 55)) + ' 倍');
  says('ch5.p8', '30 °C 下保存 1 年'); says('ch5.p8', '40 °C 下保存 3 个月');
  check('ch5 UBER targets', [E.UBER.client, E.UBER.ent].join(), '1e-15,1e-16');
  // ECC failure sum matches a direct binomial on a small case
  { let s = 0; const l = 50, t = 3, p = 0.02; let c = 1; for (let j = 0; j <= l; j++) { if (j > t) s += c * Math.pow(p, j) * Math.pow(1 - p, l - j); c = c * (l - j) / (j + 1); }
    const saveK = E.K, saveM = E.M; E.K = l - E.M * t; const u = E.uber(p, t) * E.K / (t + 1); E.K = saveK; check('ch5 binomial tail', u.toPrecision(6), s.toPrecision(6)); void saveM; }
  const keys = new Set(); for (const t of [8, 12, 40, 120]) for (const c of ['client', 'ent']) { const o = M.say.ecc(t, c); keys.add(o.key); branch(`ch5 say ${t}/${c}`, o); }
  check('ch5 ecc branches', [...keys].sort().join(), 'ch5.say,ch5.say.noQlc');
  const k2 = new Set(); for (const b of [1, 2, 3, 4, 5]) for (const d of [0.05, 0.33, 3]) for (const w of [1, 5]) { const o = M.say.life(b, d, w); k2.add(o.key); branch(`ch5 life ${b}/${d}/${w}`, o); }
  check('ch5 life branches', [...k2].sort().join(), 'ch5.say.life0,ch5.say.lifeLong,ch5.say.lifeShort');
}

/* ── ch6 FTL ── */
{
  const F = M.ftl, s = F.start();
  check('ch6 geometry', [s.B, s.P, s.N].join('x'), '8x4x24'); says('ch6.model.how', '盘里有 ' + s.B * s.P + ' 页，对外只给 ' + s.N + ' 个逻辑块');
  check('ch6 start: no GC yet, 3 invalid', [s.gcRuns, s.counts().invalid].join(), '0,3'); says('ch6.say.start', '随机改写了 3 次，所以有 3 页失效');
  const ratio = k => { const g = F.randomRun(k); return (g.nand - g.nand0) / (g.host - g.host0); };
  says('ch6.p3', '前 20 次里闪存写入和你写入之比是 ' + f2(ratio(20))); says('ch6.p3', '写到 200 次，稳定在约 ' + f2(ratio(200)));
  check('ch6 settled', Math.abs(ratio(500) - ratio(200)) < 0.05, true);
  // invariants over a long run: every LBA maps to a valid page holding it, page counts conserved
  const g = F.randomRun(2000, 3); let ok = true; for (let i = 0; i < g.N; i++) { const m = g.map[i]; if (!m || g.pg[m.b][m.p].s !== 'valid' || g.pg[m.b][m.p].lba !== i) ok = false; }
  check('ch6 map consistent after 2000 writes', ok, true); check('ch6 valid = 24', g.counts().valid, 24);
  { const q = new F.FTL(); for (let r = 0; r < 4; r++) for (let i = 0; i < q.N; i++) q.write(i); check('ch6 sequential from clean: ratio 1', q.waf(), 1); }
  check('ch6 1 TB map rows', f1(F.mapRows(1e12) / 1e8), '2.4'); says('ch6.p4', '约 ' + f1(F.mapRows(1e12) / 1e8) + ' 亿行');
  const keys = new Set(); for (const k of [0, 1, 5, 200]) { const o = M.say.ftl(F.randomRun(k)); keys.add(o.key); branch('ch6 say ' + k, o); }
  check('ch6 branches', [...keys].sort().join(), 'ch6.say.gc,ch6.say.nogc,ch6.say.start');
}

/* ── ch7 map ── */
{
  const P = M.map, c = (d, s) => P.check(d, s);
  check('ch7 M.2 SATA in PCIe-only slot fails at lanes', c('m2sata', 'm2pcie').fail, 'lane');
  check('ch7 SATA drive in SAS bay works (STP)', c('ssd25', 'sasBay').key, 'ok.stp');
  check('ch7 SAS drive in SATA port fails at connector', c('sas25', 'sataPort').fail, 'conn');
  check('ch7 conn sentence makes no mechanical claim', /插不进/.test(Z['ch7.say.fail.conn']), false);
  check('ch7 USB box is a bridge', c('ssd25', 'usbSata').key, 'ok.bridge');
  check('ch7 NVMe M.2 in a both-wired slot', c('m2nvme', 'm2both').ok, true);
  check('ch7 3.5 in 2.5 USB box fails at form factor', c('hdd35', 'usbSata').fail, 'ff');
  const keys = new Set(); for (const d of Object.keys(P.DRIVES)) for (const s of Object.keys(P.SLOTS)) { const o = M.say.map(d, s); keys.add(o.key); branch(`ch7 ${d}/${s}`, o); for (const r of P.check(d, s).rows) check('ch7 value label ' + r.v, Z['ch7.v.' + r.v] != null, true); }
  check('ch7 branches', [...keys].sort().join(), 'ch7.say.fail.conn,ch7.say.fail.ff,ch7.say.fail.lane,ch7.say.ok,ch7.say.ok.bridge,ch7.say.ok.stp');
  says('ch7.p3', 'SFF-TA-1001');
}

/* ── ch8 end to end ── */
{
  const E = M.e2e, d = x => M.dur(x).join(' ');
  check('ch8 SSD sources', [E.DEV.sata.iops, E.DEV.sata.bw, E.DEV.nvme.iops, E.DEV.nvme.bw].join(), '13000,560,22000,7450');
  const k4 = ['hdd', 'sata', 'nvme'].map(i => E.time(i, 4096)), g1 = ['hdd', 'sata', 'nvme'].map(i => E.time(i, 1 << 30));
  check('ch8 4K durations', k4.map(r => d(r.t)).join('|'), '12.7 ms|84 us|46 us');
  check('ch8 SSD latencies are 1/IOPS', [k4[1].lat, k4[2].lat].map(x => fmt(x * 1e6)).join(), '77,45');
  says('ch8.p2', '机械盘约 ' + f1(k4[0].t * 1000) + ' 毫秒，SATA 固态盘约 ' + f0(k4[1].t * 1e6) + ' 微秒，NVMe 固态盘约 ' + f0(k4[2].t * 1e6) + ' 微秒：机械盘慢 ' + f0(k4[0].t / k4[1].t) + ' 倍和 ' + f0(k4[0].t / k4[2].t) + ' 倍');
  says('ch8.p2', '约 ' + f2(g1[0].t) + ' 秒、' + f2(g1[1].t) + ' 秒和 ' + fmt(g1[2].t, 3) + ' 秒：机械盘只慢 ' + f1(g1[0].t / g1[1].t) + ' 倍和 ' + f0(g1[0].t / g1[2].t) + ' 倍');
  const cr = ['hdd', 'sata', 'nvme'].map(i => M.size(E.cross(i)).join(' '));
  says('ch8.p3', '机械盘约 ' + cr[0] + '，SATA 固态盘约 ' + cr[1] + '，NVMe 固态盘约 ' + cr[2]);
  const keys = new Set(); for (let e = 12; e <= 30; e++) { const o = M.say.e2e(Math.pow(2, e)); keys.add(o.key); branch('ch8 say ' + e, o); }
  check('ch8 branches', [...keys].sort().join(), 'ch8.say.bw,ch8.say.lat');
}

/* ── ch9 frontier data block matches the prose ── */
{
  const F = Object.fromEntries(M.FRONTIER.map(x => [x.id, x]));
  says('ch9.f.seagate', '2026 年 3 月 3 日'); says('ch9.f.seagate', '最大 ' + F.seagate.v.tb + ' TB'); says('ch9.f.seagate', '每张盘片 ' + F.seagate.v.perDisk + ' TB 以上'); says('ch9.f.seagate', '每张盘片 ' + F.seagate.v.goalDisk + ' TB、整盘 ' + F.seagate.v.goalTb + ' TB');
  says('ch9.f.wd', '2026 年 2 月 3 日'); says('ch9.f.wd', F.wd.v.tb + ' TB'); says('ch9.f.wd', F.wd.v.hamrRamp + ' 年爬坡'); says('ch9.f.wd', F.wd.v.goalYear + ' 年做到 ' + F.wd.v.goalTb + ' TB');
  says('ch9.f.micron', '2026 年 5 月 5 日'); says('ch9.f.micron', F.micron.v.tb + ' TB');
  says('ch9.f.hynix', '2025 年 8 月 25 日'); says('ch9.f.hynix', F.hynix.v.layers + ' 层、单颗 ' + F.hynix.v.tbit + ' Tb');
  says('ch9.f.samsung', F.samsung.v.layers + ' 层以上'); says('ch9.f.samsung', '无法独立证实');
  says('ch9.f.wd', '截至 ' + F.wd.v.shipQuarterEnd.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, '$1 年 $2 月 $3 日') + '的季度'); says('ch9.f.wd', F.wd.v.hamrTb + ' TB 的 HAMR 盘'); says('ch9.f.hynix', F.hynix.v.firstSsd.replace(/^(\d+)-0?(\d+)$/, '$1 年 $2 月') + '，第一款用它的固态盘');
  says('ch2.p3', '这个模型把半圈转动等待也加上，是约 ' + f1(M.disk.random(7200, 1).t) + ' 毫秒');
  says('ch9.title', '2026 年 11 月');
  says('ch9.f.wd', F.wd.v.volumeYear + ' 年下半年量产'); says('ch9.f.micron', 'Kioxia 在 ' + F.micron.v.kioxiaDate.replace('-0', ' 年 ').replace('-', ' 年 ') + ' 月也发布过 ' + F.micron.v.kioxiaTb + ' TB');
  says('ch9.f.plc', 'Solidigm ' + F.plc.v.solidigmYear + ' 年'); says('ch9.f.plc', 'SK hynix ' + F.plc.v.hynixIedm.replace('-', ' 年 ') + ' 月在 IEDM');
  // hero: cells per die from the frontier die (2 Tb at 4 bits per cell) is in the hundreds of billions
  { const cells = F.hynix.v.tbit * Math.pow(2, 40) / 4; check('hero cells per die 1e11–1e12', cells > 1e11 && cells < 1e12, true); says('hero.lead', '数千亿个'); }
  for (const x of M.FRONTIER) check('frontier status ' + x.id, ['est', 'demo', 'claim'].includes(x.status), true);
}

console.log(`${fails ? 'FAIL' : 'PASS'}: ${n - fails}/${n} checks (models, prose numbers, sentence branches, tuned-parameter sensitivity, registry and links)`);
process.exit(fails ? 1 : 0);
