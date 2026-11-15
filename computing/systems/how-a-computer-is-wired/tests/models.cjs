'use strict';
// Pins the page's models to the documents' own tables (PCI 3.0 Table 3-5 and Table 7-7, UM10204 §7.1 and Table 10,
// the Intel 875P / Z890 and AMD ISSCC 2018 figures, the UCIe key metrics), checks each named result against an
// independent closed form (ring and mesh distances and channel loads, the reflected-wave bound, max-min fairness),
// pins every number the prose quotes (placeholders filled from prose(); literal digits inventoried key by key and the
// quantitative ones tied to SPEC), pins how far each conclusion moves when a tuned parameter changes, and evaluates
// every live sentence branch at the extremes of its controls.
// Run: node computing/systems/how-a-computer-is-wired/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SPEC, PCI, LINE, maxmin, NB, NUMA, BOARD, NOC, D2D, I2C, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: ${got} not within ${tol} of ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);

/* ── 01 PCI Table 3-5, every row; the bus-sharing arithmetic ── */
{
  check('peak = 33 MHz × 4 bytes', SPEC.pci.mhz * SPEC.pci.widthBytes, SPEC.pci.peakMBps);
  check('clock period 30 ns', SPEC.pci.tclkNs, 30);
  let us = 0, tx = 0, need = 0;
  for (const [dev, mbps, bytes, used, count, txs] of SPEC.pci.table35) {
    near(`Table 3-5 ${dev}: µs used`, PCI.rowUs(txs), used, 1e-9);
    check(`Table 3-5 ${dev}: transactions`, txs.reduce((s, [k]) => s + k, 0), count);
    near(`Table 3-5 ${dev}: bytes per 10 µs (phases rounded up to whole DWORDs)`, PCI.rowBytes(txs), bytes, 2);
    check(`Table 3-5 ${dev}: bytes = MB/s × 10 µs`, mbps * SPEC.pci.sliceUs, bytes);
    us += PCI.rowUs(txs); tx += count; need += mbps;
  }
  near('Table 3-5 total µs', us, SPEC.pci.table35Total[2], 1e-9); check('Table 3-5 total transactions', tx, SPEC.pci.table35Total[3]); check('Table 3-5 total MB/s', need, SPEC.pci.table35Total[0]);
  says('ch1.p3', '显卡 50 MB/s、网卡 4、硬盘 5、ISA 桥 4、再给 PCI 桥后面留 9');
  check('ch1.p3 device rates are Table 3-5', SPEC.pci.table35.map(r => r[1]).join(), '50,4,5,4,9');
  says('ch1.p3', '表 3-5'); says('ch1.p1', '32 位宽、33 MHz'); check('32 bits', 8 * SPEC.pci.widthBytes, 32);
  says('ch1.p1', '133 MB/s'); says('ch1.p1', '33.33 MHz'); near('133 = 33.33 × 4', 33.33 * 4, 133, 0.33);
  says('ch1.p1', '1992 年'); check('PCI 1.0 year', SPEC.pci.v10.slice(0, 4), '1992'); says('dg1.a.title', '1992');
  // closed forms: efficiency D/(D+L); round-robin worst wait (N−1) transactions
  for (const D of [1, 4, 16, 64]) near('eff = 132·D/(D+8) at D=' + D, PCI.effMBps(D), 132 * D / (D + 8), 1e-12);
  for (const N of [1, 6, 12]) near('wait = (N−1)(D+8)·30 ns at N=' + N, PCI.share(N, 30, 16).waitUs, (N - 1) * 24 * 0.03, 1e-12);
  check('share never exceeds demand', [1, 3, 6, 12].every(N => PCI.share(N, 30, 16).each <= 30 + 1e-12), true);
  check('total share never exceeds the bus', [1, 3, 6, 12].every(N => PCI.share(N, 60, 16).total <= PCI.effMBps(16) + 1e-9), true);
  check('ch1.p4: overhead eats a third at 16 phases', f(1 - 16 / 24, 4), f(1 / 3, 4)); says('ch1.p4', '开销吃掉三分之一');
  check('ch1.p4: under half of what each wants', PCI.share(6, 30, 16).each < 15, true); says('ch1.p4', '还不到想要的一半');
  says('ch1.p4', '默认的 6 台设备、每台 30 MB/s、每笔 16 拍'); says('ch1.p4', '拉长到 64 拍'); says('ch1.p4', '每笔只传 1 拍');
  check('index defaults match ch1.p4', ['busN" type="range" min="1" max="12" step="1" value="6"', 'busD" type="range" min="5" max="60" step="5" value="30"'].every(s => html.includes(s)) || /id="busN"[^>]*value="6"/.test(html) && /id="busD"[^>]*value="30"/.test(html), true);
}

/* ── 02 Table 7-7 budgets; the loaded line and the reflected-wave bound ── */
{
  for (const fq of [33, 66, 50]) {
    const b = SPEC.pci.budget[fq];
    check(`Table 7-7 ${fq} MHz: Tcyc = Tval+Tprop+Tskew+Tsu`, b.tval + b.tprop + b.tskew + b.tsu, b.tcyc);
  }
  near('budget 33 MHz = Table 7-7 Tprop', LINE.tpropBudget(1000 / 30, 33), SPEC.pci.budget[33].tprop, 1e-9);
  near('budget 66 MHz = Table 7-7 Tprop', LINE.tpropBudget(1000 / 15, 66), SPEC.pci.budget[66].tprop, 1e-9);
  near('budget 50 MHz with 66 MHz parts = Table 7-7 50 MHz Tprop', 1000 / 50 - SPEC.pci.budget[50].tval - SPEC.pci.budget[50].tsu - SPEC.pci.budget[50].tskew, SPEC.pci.budget[50].tprop, 1e-9);
  says('ch2.p3', '33 MHz 时周期 30 纳秒'); says('ch2.p3', '周期只有 15 纳秒'); says('ch2.p1', '33 MHz 一个周期的三分之一');
  check('ch2.p1: 10 of 30 ns is a third', SPEC.pci.budget[33].tprop * 3, SPEC.pci.budget[33].tcyc);
  near('Rs = 1/17.1 mS', LINE.rs(), 58.48, 0.01);
  near('C0 = tpd/Z0', LINE.c0(), 170 / 60, 1e-12);
  near('default load = 10 pF + 1.5 in × C0', LINE.defaultLoad(), 10 + 1.5 * 170 / 60, 1e-12);
  for (const C of [5, 14.25, 25]) {
    const k = Math.sqrt(1 + C / (LINE.c0() * 0.8)), L = LINE.loaded(C);
    near(`loaded delay √(1+C/C0s) at ${C} pF`, L.tps, 170 * k, 1e-9); near(`loaded Z0/√(…) at ${C} pF`, L.z, 60 / k, 1e-9);
    near(`delay × Z = tpd × Z0 (C0 unchanged) at ${C} pF`, L.tps / L.z, 170 / 60 * k * k, 1e-9);
    // lattice bound: after k trips the far end holds 2V1·Σ Γ^i; check against an explicit sum
    const tr = LINE.trips(C); let s = 0; for (let i = 0; i < tr.k; i++) s += Math.pow(tr.g, i);
    check(`k trips reach Vih at ${C} pF`, 2 * tr.v1 * s >= 0.5, true);
    if (tr.k > 1) { let s1 = 0; for (let i = 0; i < tr.k - 1; i++) s1 += Math.pow(tr.g, i); check(`k−1 trips do not at ${C} pF`, 2 * tr.v1 * s1 < 0.5, true); }
  }
  // closed form for the load count when one round trip suffices: floor(T / (2·s·t'))
  const C14 = LINE.defaultLoad(), t14 = LINE.loaded(C14).tps;
  check('one trip at the default load', LINE.trips(C14).k, 1);
  check('n33 closed form', LINE.maxLoads(33.333, 33, C14), Math.floor(LINE.tpropBudget(33.333, 33) / (2 * 0.8 * t14 / 1000)));
  check('n66 closed form', LINE.maxLoads(66.667, 66, C14), Math.floor(LINE.tpropBudget(66.667, 66) / (2 * 0.8 * t14 / 1000)));
  check('20 pF needs two trips', LINE.trips(20).k, 2);
  check('ch2.p4: doubling the clock halves the loads (13 → 6)', LINE.maxLoads(66.667, 66, C14), Math.floor(LINE.maxLoads(33.333, 33, C14) / 2));
  says('ch2.p4', '刚过 50% 的门限'); says('dg2.b.vih', '50%'); check('Vih = 0.5 Vcc', SPEC.pci.vih, 0.5);
  says('ch2.p4', '把每个负载加到 20 pF');
  says('ch2.limit', '6 个负载加 2 个插槽、或 2 个负载加 4 个插槽'); says('ch2.limit', '主板本身不规定阻抗'); check('Z0 tuned at the bottom of the card range', LINE.z0, SPEC.pci.z0[0]); check('tpd tuned at the middle of the card range', LINE.tpd, (SPEC.pci.tpd[0] + SPEC.pci.tpd[1]) / 2); says('ch2.limit', '150–190 ps/英寸、60–100 Ω');
  check('tuned within spec', LINE.tpd >= SPEC.pci.tpd[0] && LINE.tpd <= SPEC.pci.tpd[1] && LINE.z0 >= SPEC.pci.z0[0] && LINE.z0 <= SPEC.pci.z0[1], true);
  says('ch2.limit', '线速取到 190'); says('ch2.limit', '阻抗取到 100 Ω');
  check('ch2.limit: model above the spec\'s typical 8 loads', LINE.maxLoads(33.333, 33, C14) > SPEC.pci.typicalLoads, true);
  says('ch2.limit', '它给的是上限');
}

/* ── 03 the 875P: max-min against a hand-worked allocation ── */
{
  const r = NB.run({ cpu: 6.4, gpu: 2.1, sb: 0.3, gbe: NB.gbe });
  near('gbe gets its 125 MB/s', r.rate.gbe, 0.125, 1e-12); near('southbridge capped at the Hub Interface', r.rate.sb, 0.266, 1e-12);
  near('gpu gets its 2.1', r.rate.gpu, 2.1, 1e-12); near('cpu gets the rest of memory', r.rate.cpu, 6.4 - 0.125 - 0.266 - 2.1, 1e-12);
  near('memory full', r.load.mem, 6.4, 1e-12); check('FSB not full', r.load.fsb < 6.4, true);
  says('ch3.p4', '前端总线并没有满，满的是北桥里的内存控制器');
  // max-min on a textbook example (Bertsekas & Gallager): link A cap 1 shared by 3 flows, link B cap 1 by 1 of them
  const t = maxmin({ A: 1, B: 1 }, [{ id: 'x', demand: 9, path: ['A', 'B'] }, { id: 'y', demand: 9, path: ['A'] }, { id: 'z', demand: 9, path: ['A'] }, { id: 'w', demand: 9, path: ['B'] }]);
  near('max-min x', t.rate.x, 1 / 3, 1e-12); near('max-min w takes the rest of B', t.rate.w, 2 / 3, 1e-12);
  says('ch3.p2', '64 位的<strong>前端总线</strong>'); says('ch3.p2', '两路 DDR400'); says('ch3.p2', 'AGP 8X'); says('ch3.p2', 'Intel 2004 年数据手册');
  check('875P date', SPEC.i875.date.slice(0, 4), '2004'); check('DDR400 dual channel = 6.4 GB/s', 2 * 8 * 400 / 1000, SPEC.i875.mem); check('FSB 800 × 8 B', 800 * 8 / 1000, SPEC.i875.fsb);
  says('ch3.p4', '每个最高 150 MB/s'); says('ch3.p4', '接口的上限'); check('SATA 1.5 Gb/s each', NB.sataEach * 1000, 150);
  says('dg3.cap', '252525-002');
}

/* ── 04 NUMA ── */
{
  const il = NUMA.interleave();
  check('interleave over 8 dies: local 1/8', f(1 - il.pkg - il.remote, 6), f(1 / 8, 6));
  near('mean latency by hand', NUMA.lat(il), 90 / 8 + 145 * 3 / 8 + 200 / 2, 1e-9);
  near("Little's law X = m·64/lat", NUMA.bw(il, 10), 640 / NUMA.lat(il), 1e-12);
  near('bandwidth linear in m (halve)', NUMA.bw(il, 5) * 2, NUMA.bw(il, 10), 1e-12);
  says('ch4.p4', '只有八分之一落在本芯片'); says('ch4.p4', '每个核挂 10 个请求'); check('tuned mlp', NUMA.mlp, 10);
  says('ch4.limit', '每个核 10 个在途请求是我设的'); says('ch4.limit', '减半就是 {bwLocal} GB/s 的一半');
  says('ch4.limit', '2.4 GHz 核心、DDR4-2667'); says('ch4.p2', '4 块芯片，每块各带 2 路内存'); check('Zeppelin', [SPEC.zep.diesPerSocket, SPEC.zep.chPerDie].join(), '4,2');
  says('ch4.p2', 'ISSCC 2018'); says('ch4.p2', '2017 年的第一代 AMD EPYC'); says('ch4.p3', '64 字节'); check('line', NUMA.line, 64);
  says('ch4.p5', 'Intel 2025 年的 Xeon 6767P'); says('ch4.p5', 'DDR5-6400'); check('6767P mts', SPEC.xeon6767p.mts, 6400);
  near('socket peak 8 × 6400 × 8 B', NUMA.socketBW(), 409.6, 1e-9);
  says('ch4.p4', '两个插座的 8 块芯片'); check('two sockets × 4 dies', 2 * SPEC.zep.diesPerSocket, 8);
}

/* ── 05 the chipset uplink ── */
{
  near('PCIe 4.0 lane 16 GT/s × 128/130 / 8', SPEC.gen4LaneGBps, 1.9692307692, 1e-9);
  near('DMI 4.0 ×8', BOARD.uplink('intel'), 8 * SPEC.gen4LaneGBps, 1e-12); near('AMD ×4', BOARD.uplink('amd'), 4 * SPEC.gen4LaneGBps, 1e-12);
  check('AMD link lanes = total − usable', SPEC.am5.total - SPEC.am5.usable, SPEC.am5.linkLanes); says('ch5.p3', '剩下 4 条接芯片组');
  says('ch5.p3', 'DMI 4.0 每条通道 16 GT/s'); check('DMI GT', SPEC.z890.dmiGT, 16); says('ch5.p3', '按 PCIe 4.0 ×4 算');
  const bd = BOARD.run({ plat: 'intel', ssd1: 'read', ssd2: 'read', usb: true });
  near('USB gets its 2.2', bd.rate.usb, 2.2, 1e-12); near('SSDs split the rest', bd.rate.ssd1, (BOARD.uplink('intel') - 2.2) / 2, 1e-12);
  check('ch5.p4: want is a little over DMI', bd.want.up > bd.U && bd.want.up < 1.1 * bd.U, true); says('ch5.p4', '比 DMI 的 {dmi} GB/s 多一点');
  const cA = BOARD.run({ plat: 'amd', copy: true }), cI = BOARD.run({ plat: 'intel', copy: true });
  check('ch5.p4: a copy runs full speed on both platforms', [cA.rate.ssd1, cA.rate.ssd2, cI.rate.ssd1, cI.rate.ssd2].every(x => Math.abs(x - SPEC.nvme) < 1e-12), true);
  says('ch5.p4', '两个平台都能跑满'); says('ch5.p4', '接在 CPU 上的固态根本不经过这条链路');
  check('CPU-attached SSD unaffected by a busy chipset', BOARD.run({ plat: 'amd', ssd1: 'read', ssd2: 'read', usb: true, cpuSsd: true }).rate.cpuSsd, SPEC.nvme);
  says('ch5.p1', '{cpuGen5} 条 PCIe 5.0 通道'); says('ch5.p1', '另有 4 条 PCIe 4.0'); check('CPU Gen4 lanes', SPEC.z890.cpuGen4, 4);
  says('ch5.p1', '一个 ×16 加一个 ×4（或 2 个 ×8 加 ×4，或 ×8 加 3 个 ×4）'); check('16+4 = 8+8+4 = 8+3·4 = cpuGen5', [16 + 4, 8 + 8 + 4, 8 + 3 * 4].join(), [20, 20, 20].join());
  says('ch5.p1', 'Intel 2024 年底'); check('Z890 date', SPEC.z890.date, 'Q4 2024');
  says('ch5.limit', '{amdTotal} / {amdUsable} 条'); says('ch5.limit', '这一代数来自评测资料');
}

/* ── 06 on-die networks against closed forms (Dally & Towles) ── */
{
  for (const N of [4, 8, 12, 16, 24, 36, 64]) {
    const r = NOC.ring(N), m = NOC.mesh(N), [a, b] = [m.a, m.b];
    near(`ring mean N²/(4(N−1)) at ${N}`, r.avg, N * N / (4 * (N - 1)), 1e-12);
    check(`ring diameter N/2 at ${N}`, r.max, N / 2);
    near(`ring channel load N/8 at ${N}`, r.gamma, N / 8, 1e-12);
    const dim = k => k * (k * k - 1) / 3;              // Σ|x−x'| over ordered pairs in one dimension
    near(`mesh mean at ${a}×${b}`, m.avg, (b * b * dim(a) + a * a * dim(b)) / (N * (N - 1)), 1e-12);
    check(`mesh diameter at ${a}×${b}`, m.max, a + b - 2);
    if (a % 2 === 0 && b % 2 === 0) near(`mesh channel load max(a,b)/4 at ${a}×${b}`, m.gamma, Math.max(a, b) / 4, 1e-12);
  }
  check('4 stations tie', f(NOC.ring(4).avg, 9), f(NOC.mesh(4).avg, 9));
  check('ch6.p4: 64-station throughput ratio', NOC.ring(64).gamma / NOC.mesh(64).gamma, 4);
  says('ch6.p4', '8×8 网格'); check('dims(64)', NOC.dims(64).join(), '8,8'); says('ch6.p4', '4×4 网格'); check('dims(16)', NOC.dims(16).join(), '4,4');
  says('ch6.p4', '环的平均跳数随站数线性增长，网格只随站数的平方根增长');
  says('ch6.p2', '2017 年的 Skylake-SP');
}

/* ── 07 die-to-die ── */
{
  near('1 TB/s × 8 × 0.3 pJ = 2.4 W', D2D.watts(1000, 'd25'), 2.4, 1e-12); near('edge = 1000/1317 mm', D2D.edgeMm(1000, 'd25'), 1000 / 1317, 1e-12);
  check('watts linear in bandwidth', f(D2D.watts(2000, 'd2'), 9), f(2 * D2D.watts(1000, 'd2'), 9));
  check('energy order 3D < 2.5D < 2D < HBM3 < IFOP < LPDDR5', D2D.kinds.map(k => D2D.pj(k)).every((x, i, a) => !i || x > a[i - 1]), true);
  says('ch7.p4', '1 TB/s'); says('ch7.p4', '一两百瓦'); says('ch7.limit', '取 16 GT/s 以上那一档'); says('ch7.p2', '2022 年'); check('UCIe 1.0', SPEC.ucie.v1.slice(0, 4), '2022');
  says('ch7.k.d3', '9 微米间距'); says('ch7.p1', '第 10 章'); says('ch7.p1', '2017 年的 EPYC');
}

/* ── 08 I²C against UM10204 ── */
{
  near('ln(7/3) = 0.8473', SPEC.i2c.k, SPEC.i2c.kSpec, 5e-5);
  near('tr = 0.8473·R·C', I2C.tr(4.7, 200), 0.8473 * 4700 * 200e-12 * 1e9, 0.05);
  near('Rp(max) fm 200 pF', I2C.rpMax('fm', 200), 300e-9 / (0.8473 * 200e-12) / 1e3, 1e-3);
  near('Rp(min) 3.3 V / 3 mA', I2C.rpMin('fm', 3.3), (3.3 - 0.4) / 3, 1e-12);
  near('Rp(min) fm+ 20 mA', I2C.rpMin('fmp', 3.3), (3.3 - 0.4) / 20, 1e-12);
  check('tr linear in C', f(I2C.tr(4.7, 400), 9), f(2 * I2C.tr(4.7, 200), 9));
  check('Table 10 modes', ['sm', 'fm', 'fmp'].map(k => { const m = SPEC.i2c.modes[k]; return [m.khz, m.tr, m.cb, m.iol].join('/'); }).join(' '), '100/1000/400/3 400/300/400/3 1000/120/550/20');
  says('ch8.p3', '标准模式（100 kHz）最多 1000 纳秒、快速模式（400 kHz）300 纳秒、快速模式加强版（1 MHz）120 纳秒');
  says('ch8.p3', '在 0.4 伏时至少能吸 3 mA，加强版 20 mA'); says('ch8.p3', '从 30% 到 70%'); says('ch8.p3', '第 7.1 节');
  says('ch8.p4', '默认的 4.7 kΩ'); says('ch8.p4', '线上 200 pF'); says('ch8.p4', '标准模式的 1000 纳秒够用，快速模式的 300 纳秒远远不够');
  const c = I2C.check('fm', 3.3, 4.7, 200); check('4.7k at 200 pF: ok for sm, slow for fm', [I2C.check('sm', 3.3, 4.7, 200).slow, c.slow].join(), 'false,true');
  says('ch8.p4', '电容翻到 400 pF');
  says('ch8.limit', '2 V 以下时规范的低电平改成 0.2 VDD、2 mA'); says('ch8.limit', '3.3 V 和 5 V');
  says('ch8.read.dev', '每个 10 pF'); check('Ci', SPEC.i2c.ci, 10); says('ch8.p1', '7 位地址'); says('dg8.cap', 'UM10204 第 7 版'); check('rev', SPEC.i2c.rev, '7.0');
}

/* ── frontier ── */
{
  says('ch9.title', '2026 年 11 月'); check('as of', FRONTIER.asOf, '2026-11');
  says('ch9.e3', '2025 年 8 月 5 日'); says('ch9.e3', '2026 年 11 月 12 日联盟又发布了 UCIe 4.0'); check('UCIe 4.0 date', FRONTIER.ucie4, '2026-11-12'); check('UCIe 3.0', FRONTIER.ucie3, '2025-08-05'); check('UCIe 3.0 = SPEC', SPEC.ucie.v3, FRONTIER.ucie3); says('ch9.e3', '在 32 GT/s 之上');
  says('ch9.d2', '2025 年 11 月 18 日'); check('CXL 4.0', FRONTIER.cxl4, '2025-11-18'); says('ch9.d2', 'PCIe 7.0');
  says('ch9.d1', '2026 年 6 月的 Computex'); check('Xeon 6+', FRONTIER.xeon6plus, '2026-06');
  says('ch9.c1', 'DMI 5.0，高端型号 ×4、低端 ×2'); check('leak', FRONTIER.novaLakeLeak.dmiLanes.join() + ' ' + FRONTIER.novaLakeLeak.gen, '2,4 5'); says('ch9.c1', '不是 Intel 公布的数字');
  says('ch9.c2', '0.01 到 {d3pj} pJ（凸点间距 1 到 9 微米）');
}

/* ── every literal digit in the prose is inventoried key by key; a new number fails until it is checked above or
   tied to SPEC. Placeholders, link targets and tags are stripped first. Product names, version numbers, years and
   chapter numbers are in here too; the quantitative ones are pinned by the says()/check() pairs above. ── */
{
  const LITERALS = {
    "ch1.p1": "1992 32 33 33 4 133 33.33",
    "ch1.p2": "31 0 4",
    "ch1.p3": "3 5 50 4 5 4 9",
    "ch1.model.title": "10",
    "ch1.model.how": "10",
    "ch1.model.aria": "10",
    "ch1.cv.shared": "10",
    "ch1.cv.x": "10",
    "ch1.cv.missed": "10",
    "ch1.p4": "6 30 16 64 1",
    "ch1.limit": "3 5",
    "dg1.a.title": "1992",
    "ch2.p1": "33",
    "ch2.p2": "2",
    "ch2.p3": "33 30 66 15",
    "ch2.comp.33": "33",
    "ch2.comp.66": "66",
    "ch2.read.step": "50",
    "ch2.p4": "50 33 66 20 33",
    "ch2.limit": "33 6 2 2 4 150 190 60 100 190 33 100",
    "dg2.a.spec": "33",
    "dg2.b.vih": "50",
    "ch3.p2": "2004 875 64 400 8 2.0",
    "ch3.model.title": "2004",
    "ch3.model.aria": "875",
    "ch3.p4": "150",
    "ch3.p5": "5",
    "dg3.aria": "875",
    "dg3.cap": "875 252525 002 2004 2 1",
    "dg3.cpu": "4",
    "dg3.mem": "400",
    "dg3.agp": "8",
    "dg3.ich": "5",
    "dg3.sata": "2",
    "dg3.usb": "2.0",
    "ch4.p1": "2000",
    "ch4.p2": "0 1 1 2017 4 2 2018",
    "ch4.p3": "64",
    "ch4.p4": "8 10",
    "ch4.p5": "2025 6767 5 6400 5",
    "ch4.limit": "2.4 4 2667 10",
    "dg4.cap": "7001 4 2 2018",
    "dg4.s0": "0",
    "dg4.s1": "1",
    "dg4.mem": "2",
    "ch5.p1": "2024 200 890 5.0 16 4 2 8 4 8 3 4 4 4.0 5 4.0",
    "ch5.p2": "4.0 3 2",
    "ch5.p3": "4.0 16 4.0 9000 4 4.0 4 1",
    "ch5.model.how": "2",
    "ch5.plat.intel": "890 4.0 8",
    "ch5.plat.amd": "5 4",
    "ch5.ctl.ssd1": "2 1",
    "ch5.ctl.ssd2": "2 2",
    "ch5.ctl.usb": "20",
    "ch5.ctl.cpu": "2",
    "ch5.dev.ssd1": "2 1",
    "ch5.dev.ssd2": "2 2",
    "ch5.dev.cpuSsd": "2",
    "ch5.p4": "4.0 4 1 2",
    "ch5.p5": "2 16 8",
    "ch5.limit": "4.0 4 870",
    "dg5.aria": "2024 2 4.0 8 890 2",
    "dg5.cap": "200 890 800 2026 11",
    "dg5.mem": "5 2",
    "dg5.cpu.sub": "200",
    "dg5.gpu.sub": "5.0 16",
    "dg5.m2a": "2",
    "dg5.m2a.sub": "5.0 4",
    "dg5.m2b": "2",
    "dg5.m2b.sub": "4.0 4",
    "dg5.dmi": "4.0",
    "dg5.pch": "890",
    "dg5.pch.sub": "4.0",
    "dg5.c1": "2",
    "dg5.c1.sub": "4.0 4",
    "dg5.c2.sub": "20",
    "dg5.c4.sub": "1",
    "dg5.hsio": "3",
    "ch6.p2": "2017 1",
    "ch6.p4": "8 16 4 4 16 64 8 8",
    "dg6.aria": "8 16 4 4",
    "dg6.a.title": "8",
    "dg6.b.title": "4 4",
    "ch7.p1": "10 2017 4",
    "ch7.p2": "2018 2022",
    "ch7.k.d3": "3 9",
    "ch7.k.hbm3": "3",
    "ch7.k.ifop": "7001",
    "ch7.k.lp5": "5",
    "ch7.p4": "1 2017 5",
    "ch7.p5": "9 3",
    "ch7.limit": "16 3 5 2018",
    "dg7.cap": "2025",
    "ch8.p1": "7",
    "ch8.p3": "1 30 70 100 1000 400 300 1 120 0.4 3 20 7.1",
    "ch8.model.how": "12 30 70",
    "ch8.leg.th": "30 70",
    "ch8.mode.sm": "100",
    "ch8.mode.fm": "400",
    "ch8.mode.fmp": "1",
    "ch8.vdd.33": "3.3",
    "ch8.vdd.5": "5",
    "ch8.read.dev": "10",
    "ch8.p4": "4.7 200 1000 300 400 400",
    "ch8.p5": "890",
    "ch8.limit": "7.1 3.3 5 2 0.2 2",
    "dg8.cap": "10204 7",
    "ch9.title": "2026 11",
    "ch9.e1": "8",
    "ch9.e2": "2017",
    "ch9.e3": "3.0 2025 8 5 32 1.0 2.0 2026 11 12 4.0 4.0",
    "ch9.d1": "2026 6 6 3 3 6",
    "ch9.d2": "4.0 2025 11 18 7.0 7.0",
    "ch9.c1": "2026 900 5.0 4 2",
    "ch9.c2": "3 0.01 1 9",
    "ch9.p2": "7 3",
    "ch10.q1": "5",
    "ch10.q2": "1 3 5",
    "ch10.q3": "4 6 7",
    "ch10.links": "7",
    "footer": "3.0 2004 3 5 7 7 4 875 252525 002 2004 2018 890 7 265 6767 800 9 9950 5 2025 10204 7 2021"
  };
  const lits = v => (v.replace(/\{\w+\}/g, '').replace(/href="[^"]*"/g, '').replace(/<[^>]+>/g, '').match(/\d[\d,.]*\d|\d/g) || []).join(' ');
  for (const [k, v] of Object.entries(Z)) {
    if (/\.say\./.test(k)) continue;
    const got = lits(v); if (!got && !(k in LITERALS)) continue;
    check('literal numbers in ' + k, got, LITERALS[k] || '');
  }
  for (const k of Object.keys(LITERALS)) check('inventoried key exists ' + k, k in Z, true);
  // the two live sentences with a literal: the threshold and VOL
  says('ch2.say.ok2', '50%'); says('ch8.say.weak', '0.4');
  check('say literals', Object.entries(Z).filter(([k]) => /\.say\./.test(k)).map(([k, v]) => lits(v)).filter(Boolean).join('|'), '50|0.4');
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { pciPeak: '132', t35used: '9.27', t35need: '72', eff16: '88', eff1: '14.7', s1each: '14.7', s1p2p: '30', s1tot: '180', s1wait: '3.6', s1bEach: '19.6',
    s1bWait: '10.8', initLat: '8', tp33: '10', tp66: '5', cload: '14.25', tps: '459', zl: '22', rs: '58.5', v1: '28', v1x2: '55', n33: '13', n66: '6', v1b: '49', n33b: '5',
    n33t190: '12', n33z100: '11', nbCpu: '3.9', nbSb: '266', nbCpuAlone: '6.4', hiM: '266', sata2: '300', zLoc: '90', zp: '145', zr: '200', ilLat: '165.6', ilX: '1.84',
    bwLocal: '7.1', bwIl: '3.9', sockBW: '409.6', ilRemote: '50', ilPkg: '37.5', dmi: '15.75', amdLink: '7.88', bdSsd: '6.78', bdWant: '16.70', bdaSsd: '2.84', copyI: '7.25',
    nvme: '7.25', usb20: '2.2', r8: '2.29', m16: '2.67', r16: '4.27', r64: '16.3', m64: '5.3', r64max: '32', m64max: '14', thR64: '0.125', thM64: '0.50', thRatio64: '4',
    w25: '2.4', w2: '4.8', wIfop: '16', wLp5: '22.4', e25: '0.76', e2: '4.5', i2cTr: '796', i2cHi: '1770', i2cLo: '967', i2cTr400: '1593', i2cK: '0.8473', i2cDev: '20',
    i2cCi: '10', i2cFirst: '1982', fsbG: '6.4', memG: '6.4', agpG: '2.1', csaM: '266', usbPorts: '8', r8max: '4', m16max: '6', pj2: '0.6', pj25: '0.3', reach2: '25',
    reach25: '2', dmiLanes: '8', pchLanes: '24', hsio: '34', sataPorts: '8', cpuGen5: '20', espi: '4', amdTotal: '28', amdUsable: '24', upiGT: '24', upiLinks: '4', xch: '8',
    ucie3a: '48', ucie3b: '64', cxl4GT: '128', x6pCores: '288', d3pj: '0.05', ucieRt: '2', ifopPj: '2', cin: '10', stub: '1.5', slot: '0.8', tpd: '170', z0: '60', sliceUs: '10' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) {
    const v = Z[m[1]] || '';
    for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } }
  }
  // diagram labels are filled from prose() in app.js (keys starting dgN.)
  for (const [k, v] of Object.entries(Z)) if (/^dg\d/.test(k)) for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P) && !new RegExp("'" + k.replace(/\./g, '\\.') + "'[^)]*\\b" + p[1] + '\\s*:').test(app)) { fails++; console.error(`FAIL {${p[1]}} in diagram label ${k} is not a prose() key`); } }
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // claims the prose makes about the tuned parameters (halved/doubled)
  const saveT = LINE.tpd, saveZ = LINE.z0;
  LINE.tpd = 150; const lo = LINE.maxLoads(33.333, 33, LINE.defaultLoad()); LINE.tpd = saveT;
  LINE.z0 = 100; const zhi = LINE.maxLoads(33.333, 33, LINE.defaultLoad()); LINE.z0 = saveZ;
  check('tpd at the low end of the range gives more loads', lo >= P.n33[0], true); check('z0 100 Ω pinned', zhi, P.n33z100[0]);
  check('ch2.limit: the conclusion (66 MHz carries about half) holds across the tuned range', [150, 170, 190].every(tp => { LINE.tpd = tp; const a = LINE.maxLoads(33.333, 33, LINE.defaultLoad()), b = LINE.maxLoads(66.667, 66, LINE.defaultLoad()); LINE.tpd = saveT; return b <= a / 2 + 0.5; }), true);
  check('NUMA ratio ilX does not depend on mlp', f(NUMA.lat(NUMA.interleave()) / 90, 6), f(NUMA.bw({ pkg: 0, remote: 0 }, 20) / NUMA.bw(NUMA.interleave(), 20), 6));
}

/* ── sentence branches at the extremes of each control ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (let N = 1; N <= 12; N++) for (let d = 5; d <= 60; d += 5) for (let e = 0; e <= 6; e++) add(M.say.bus(N, d, Math.pow(2, e)));
  for (let N = 1; N <= 16; N++) for (const fq of [20, 33, 50, 66, 80, 100]) for (const cp of [33, 66]) for (const C of [5, 10, 14.25, 20, 25]) add(M.say.line(N, fq, cp, C));
  for (const cpu of [0, 1, 3.2, 6.4]) for (const gpu of [0, 1, 2.1]) for (const sb of [0, 0.3, 0.5]) for (const gbe of [0, NB.gbe]) add(M.say.nb({ cpu, gpu, sb, gbe }));
  for (let pk = 0; pk <= 100; pk += 12.5) for (let rm = 0; rm <= 100; rm += 12.5) for (const m of [1, 10, 20]) add(M.say.numa({ pkg: pk / 100, remote: rm / 100 }, m));
  for (const plat of ['intel', 'amd']) for (const ssd1 of ['idle', 'read']) for (const ssd2 of ['idle', 'read', 'write']) for (const usb of [false, true]) for (const sata of [false, true]) for (const cpuSsd of [false, true]) add(M.say.board({ plat, ssd1, ssd2, usb, sata, cpuSsd }));
  for (const N of [4, 8, 12, 16, 24, 36, 64]) add(M.say.noc(N));
  for (let e = 1; e <= 4; e += 0.5) for (const k of D2D.kinds) add(M.say.d2d(Math.pow(10, e), k));
  const E12 = [0.47, 0.56, 0.68, 0.82, 1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2, 10, 12, 15, 18, 22];
  for (const mode of ['sm', 'fm', 'fmp']) for (const vdd of [3.3, 5]) for (const R of E12) for (let C = 10; C <= 600; C += 10) add(M.say.i2c(mode, vdd, R, C));
  check('app E12 table = test E12', /const E12 = \[0\.47, 0\.56, 0\.68, 0\.82, 1, 1\.2, 1\.5, 1\.8, 2\.2, 2\.7, 3\.3, 3\.9, 4\.7, 5\.6, 6\.8, 8\.2, 10, 12, 15, 18, 22\]/.test(app), true);
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key is a reached branch ' + k, seen.has(k), true);
  // the defaults described in the prose land on the expected branch
  check('ch1 default is full', M.say.bus(6, 30, 16).key, 'ch1.say.full');
  check('ch2 default 8 loads at 33 MHz fits', M.say.line(8, 33, 33, LINE.defaultLoad()).key, 'ch2.say.ok');
  check('ch3 default is short', M.say.nb({ cpu: 6.4, gpu: 2.1, sb: 0.3, gbe: NB.gbe }).key, 'ch3.say.short');
  check('ch5 default is over', M.say.board({ plat: 'intel', ssd1: 'read', ssd2: 'read', usb: true }).key, 'ch5.say.over');
  check('ch8 default is slow', M.say.i2c('fm', 3.3, 4.7, 200).key, 'ch8.say.slow');
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/\bt\('([\w.]+)'(?!\s*\+)/g)) if (/^[a-z]\w*\.[\w.]*\w$/.test(m[1])) keys.add(m[1]);
  for (const m of app.matchAll(/'(dg\d\.[\w.]+)'/g)) keys.add(m[1]);
  for (const b of ['fsb', 'mem', 'agp', 'hi', 'csa']) keys.add('ch3.bar.' + b);
  for (const k of D2D.kinds) keys.add('ch7.k.' + k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
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
  check('registry slug/path', R.slug + ' ' + R.path, 'how-a-computer-is-wired computing/systems/how-a-computer-is-wired/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 10 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner: siblings' aliases and the words the task file hands to B1/B3/B4 and the storage series
  const norm = s => s.toLowerCase().replace(/[\s·]+/g, '');
  const owned = new Map();
  for (const a of ['PCIe 是什么', 'PCIe 通道', 'x16 x4 区别', 'what is PCIe', 'PCIe lanes', '显卡插 x8 会慢吗', 'PCIe 通道不够怎么办', '内存频率是什么', 'CL 值',
    '什么是 CXL', 'CXL', 'NVLink 是什么', 'NVLink', '芯粒', '小芯片', 'chiplets', '先进封装', 'advanced packaging', '为什么并行总线被串行取代', '共享内存总线瓶颈',
    'PCIe 4.0 5.0 6.0 SSD 速度', 'PCIe vs SATA bandwidth', 'memory wall', '内存墙', 'HBM']) owned.set(norm(a), 'TASK');
  const sibs = ['why-nvme-is-fast', 'what-a-drive-is-made-of', 'how-sata-works', 'how-sas-works', 'storage-over-a-network', 'how-usb-drives-talk',
    'why-compute-waits-for-memory', 'how-pcie-works', 'how-cpu-caches-work', 'how-thunderbolt-works'].map(s => path.join(DIR, '..', s));
  sibs.push(path.join(DIR, '..', '..', '..', 'tech', 'semiconductors', 'why-chips-are-hard'));
  for (const p of sibs) { const rp = path.join(p, 'REGISTRY.json'); if (fs.existsSync(rp)) for (const c of JSON.parse(fs.readFileSync(rp, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), path.basename(p)); }
  const mine = new Set();
  for (const c of R.concepts) for (const L of ['zh', 'en']) for (const a of c.aliases[L]) {
    n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); }
    n++; if (mine.has(L + norm(a))) { fails++; console.error('FAIL alias used twice on this page ' + a); } mine.add(L + norm(a));
  }
  // live sibling links must point at chapters that exist
  const all = Object.values(Z).join('');
  for (const sib of ['what-a-drive-is-made-of', 'how-sata-works', 'why-nvme-is-fast', 'how-usb-drives-talk', 'why-compute-waits-for-memory', 'how-pcie-works', 'how-thunderbolt-works', 'coherent-interconnects', 'how-a-computer-boots']) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp('\\.\\./' + sib + '/(#ch\\d+)?', 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
  }
  check('links only to live siblings', [...all.matchAll(/href="\.\.\/([\w-]+)\//g)].map(m => m[1]).every(s => ['what-a-drive-is-made-of', 'how-sata-works', 'why-nvme-is-fast', 'how-usb-drives-talk', 'why-compute-waits-for-memory', 'how-pcie-works', 'how-thunderbolt-works', 'coherent-interconnects', 'how-a-computer-boots'].includes(s)), true);
  // B1 and B6 are live since 2026-11-15: the plain-text citations became links (anchors checked above)
  for (const [k, a] of [['ch1.limit', 'how-pcie-works/#ch1'], ['ch2.p5', 'how-pcie-works/#ch2'], ['ch5.p5', 'how-pcie-works/#ch2'], ['ch9.d2', 'how-pcie-works/#ch11'],
    ['ch10.links', 'how-pcie-works/'], ['ch10.links', 'how-thunderbolt-works/'], ['ch9.d2', 'coherent-interconnects/#ch3']]) says(k, a);
  // B4 is live since 2026-11-15 (B3/B4 registrar): ch9.d2 links it where it said the series would cover CXL later
  says('ch9.d2', '《芯片之间怎么共用内存》'); check('no plain-text "CXL later" left', /本系列以后会单独写/.test(all), false);
  // the boot essay is live since 2026-11-15 (A6/boot registrar): ch8.p5 links its words "BIOS 闪存" to its #ch3 (SPI flash)
  says('ch8.p5', 'how-a-computer-boots/#ch3');
  says('ch5.p5', '《PCIe 为什么能一代一代翻倍》'); says('ch10.links', '《雷电接口是怎么工作的》');
  check('why-chips-are-hard named as plain text, not linked', /why-chips-are-hard/.test(all), false); says('ch7.p1', '《芯片为什么越来越难做》');
  const sata = JSON.parse(fs.readFileSync(path.join(DIR, '..', 'how-sata-works', 'REGISTRY.json'), 'utf8'));
  says('ch2.p2', '《' + sata.title.zh + '》');
  const mem = JSON.parse(fs.readFileSync(path.join(DIR, '..', 'why-compute-waits-for-memory', 'REGISTRY.json'), 'utf8'));
  says('ch4.p5', '《' + mem.title.zh + '》'); says('ch7.p5', '《' + mem.title.zh + '》');

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  const hrefs = o => (Object.values(o).join('').match(/href=["']\.\.\/[^"']+/g) || []).sort().join(' ');
  check('en links = zh links', hrefs(EN), hrefs(Z));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k] || ''), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (PCI Tables 3-5 and 7-7, UM10204 §7.1, closed forms for the line, max-min, NUMA, ring and mesh, and every number in the prose match the models)`);
