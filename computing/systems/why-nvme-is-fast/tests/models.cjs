'use strict';
// Pins every quantitative number in copy.zh.js and copy.en.js to models.js.
// Run: node computing/systems/why-nvme-is-fast/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.en.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const E = ctx.window.ESSAY_COPY.en;

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); }
}
function says(dict, label, key, phrase) {
  n++;
  if (!dict[key] || !dict[key].includes(phrase)) {
    fails++;
    console.error(`FAIL ${label} ${key} missing "${phrase}"`);
  }
}
const f = (x, d = 0) => x.toFixed(d);

// Key & placeholder parity between zh and en
for (const k of Object.keys(Z)) {
  n++;
  if (E[k] == null) { fails++; console.error(`FAIL parity: missing en key ${k}`); continue; }
  const phZ = (Z[k].match(/\{\w+\}/g) || []).sort().join(',');
  const phE = (E[k].match(/\{\w+\}/g) || []).sort().join(',');
  n++;
  if (phZ !== phE) { fails++; console.error(`FAIL placeholders on ${k}: zh=${phZ} en=${phE}`); }
}

/* ── ch1 latencyBreakdown ── */
{
  const hdd = M.latencyBreakdown.compute('hdd');
  check('ch1 hdd media', hdd.mediaUs, 8500);
  check('ch1 hdd overhead', hdd.overheadUs, 25);
  check('ch1 hdd share', f(hdd.overheadPct, 1), '0.3');
  says(Z, 'zh', 'ch1.p1', '8,500 微秒'); says(Z, 'zh', 'ch1.p1', '25 微秒'); says(Z, 'zh', 'ch1.p1', '0.3%');
  says(E, 'en', 'ch1.p1', '8,500 microseconds'); says(E, 'en', 'ch1.p1', '0.3%');

  const sata = M.latencyBreakdown.compute('sata');
  check('ch1 sata media', sata.mediaUs, 75);
  check('ch1 sata overhead', sata.overheadUs, 25);
  check('ch1 sata share', f(sata.overheadPct, 1), '25.0');
  says(Z, 'zh', 'ch1.p2', '75 微秒'); says(Z, 'zh', 'ch1.p2', '25 微秒'); says(Z, 'zh', 'ch1.p2', '25.0%');

  const ullAhci = M.latencyBreakdown.compute('ull', 10, 'ahci');
  check('ch1 ull ahci share', f(ullAhci.overheadPct, 1), '71.4');
  says(Z, 'zh', 'ch1.p2', '10 微秒'); says(Z, 'zh', 'ch1.p2', '71.4%');

  const nvme = M.latencyBreakdown.compute('nvme');
  check('ch1 nvme overhead', nvme.overheadUs, 5);
  check('ch1 nvme share', f(nvme.overheadPct, 1), '6.3');
  says(Z, 'zh', 'ch1.p3', '5 微秒'); says(Z, 'zh', 'ch1.p3', '6.3%');
}

/* ── ch2 busBandwidth ── */
{
  const sata = M.busBandwidth.compute('sata3', 1, 80);
  check('ch2 sata raw', Math.round(sata.rawMBs), 600);
  check('ch2 sata eff', Math.round(sata.effectiveMBs), 552);
  says(Z, 'zh', 'ch2.p1', '600 MB/s'); says(Z, 'zh', 'ch2.p1', '552 MB/s');

  const p3 = M.busBandwidth.compute('pcie3', 1, 80);
  const p4 = M.busBandwidth.compute('pcie4', 1, 80);
  const p5 = M.busBandwidth.compute('pcie5', 1, 80);
  const p6 = M.busBandwidth.compute('pcie6', 1, 80);
  check('ch2 pcie3 eff', Math.round(p3.effectiveMBs), 3545);
  check('ch2 pcie4 eff', Math.round(p4.effectiveMBs), 7089);
  check('ch2 pcie5 eff', Math.round(p5.effectiveMBs), 14178);
  check('ch2 pcie6 eff', Math.round(p6.effectiveMBs), 28500);
  check('ch2 pcie4 qd1 MBs', f(p4.actualMBs, 1), '51.2');
  check('ch2 pcie4 qd1 util', f(p4.busUtilPct, 1), '0.7');
  check('ch2 pcie4 qdNeed', p4.qdToSaturate4k, 139);
  says(Z, 'zh', 'ch2.p2', '3,545 MB/s'); says(Z, 'zh', 'ch2.p2', '7,089 MB/s');
  says(Z, 'zh', 'ch2.p2', '14,178 MB/s'); says(Z, 'zh', 'ch2.p2', '28,500 MB/s');
  says(Z, 'zh', 'ch2.p3', '51.2 MB/s'); says(Z, 'zh', 'ch2.p3', '0.7%'); says(Z, 'zh', 'ch2.p3', '139');
}

/* ── ch3 queueScaling ── */
{
  const c1 = M.queueScaling.simulatePoint(1, 1500);
  const c4 = M.queueScaling.simulatePoint(4, 1500);
  const c16 = M.queueScaling.simulatePoint(16, 1500);
  check('ch3 1c ahci', Math.round(c1.ahciKIops), 180);
  check('ch3 4c ahci', Math.round(c4.ahciKIops), 400);
  check('ch3 4c nvme', Math.round(c4.nvmeKIops), 720);
  check('ch3 16c ahci', Math.round(c16.ahciKIops), 155);
  check('ch3 16c nvme', Math.round(c16.nvmeKIops), 1500);
  check('ch3 16c speedup', f(c16.speedup, 1), '9.7');
  says(Z, 'zh', 'ch3.p3', '180k IOPS'); says(Z, 'zh', 'ch3.p3', '400k IOPS');
  says(Z, 'zh', 'ch3.p3', '720k IOPS'); says(Z, 'zh', 'ch3.p3', '155k IOPS');
  says(Z, 'zh', 'ch3.p3', '1,500k IOPS'); says(Z, 'zh', 'ch3.p3', '9.7 倍');
}

/* ── ch4 ringProtocol ── */
{
  let st = M.ringProtocol.create();
  check('ch4 size', M.ringProtocol.SIZE, 8);
  st = M.ringProtocol.runOneCmd(st);
  check('ch4 completed', st.completed, 1);
  check('ch4 nvme mmio', st.nvmeMmioOps, 2);
  check('ch4 ahci mmio', st.ahciMmioOps, 5);
  says(Z, 'zh', 'ch4.p3', '2 次'); says(Z, 'zh', 'ch4.p3', '5 次'); says(Z, 'zh', 'ch4.p3', '8 格');
}

/* ── ch5 nandParallel ── */
{
  const q1 = M.nandParallel.simulate(8, 4, 1);
  const q32 = M.nandParallel.simulate(8, 4, 32);
  check('ch5 q1 iops', Math.round(q1.iops), 19048);
  check('ch5 q32 dies', q32.totalDies, 32);
  check('ch5 q32 iopsK', Math.round(q32.iops / 1000), 610);
  check('ch5 q32 speedup', f(q32.speedupVsQd1, 1), '32.0');
  says(Z, 'zh', 'ch5.p1', '19,048 IOPS');
  says(Z, 'zh', 'ch5.p3', '32 颗'); says(Z, 'zh', 'ch5.p3', '610k IOPS'); says(Z, 'zh', 'ch5.p3', '32.0 倍');
}

/* ── ch6 writeAmp ── */
{
  const w85_7 = M.writeAmp.compute(85, 7, true);
  const w85_28 = M.writeAmp.compute(85, 28, true);
  const w75_notrim = M.writeAmp.compute(75, 7, false);
  check('ch6 85/7 waf', f(w85_7.waf, 1), '4.9');
  check('ch6 85/7 host', Math.round(w85_7.hostWriteMBs), 822);
  check('ch6 85/28 waf', f(w85_28.waf, 1), '3.0');
  check('ch6 85/28 host', Math.round(w85_28.hostWriteMBs), 1344);
  check('ch6 75/no-trim waf', f(w75_notrim.waf, 1), '10.1');
  says(Z, 'zh', 'ch6.p3', '4.9×'); says(Z, 'zh', 'ch6.p3', '822 MB/s');
  says(Z, 'zh', 'ch6.p3', '3.0×'); says(Z, 'zh', 'ch6.p3', '1,344 MB/s');
  says(Z, 'zh', 'ch6.p3', '10.1×');
}

/* ── ch7 pollingVsIrq ── */
{
  const p = M.pollingVsIrq.compute(10, 6, 200);
  check('ch7 irqLat', f(p.irqLatencyUs, 1), '16.0');
  check('ch7 pollLat', f(p.pollLatencyUs, 1), '10.5');
  check('ch7 savedPct', f(p.latencySavedPct, 1), '34.4');
  check('ch7 cross', Math.round(p.crossoverIopsK), 286);
  says(Z, 'zh', 'ch7.p2', '16.0 微秒'); says(Z, 'zh', 'ch7.p2', '10.5 微秒'); says(Z, 'zh', 'ch7.p2', '34.4%');
  says(Z, 'zh', 'ch7.p3', '286k IOPS');
}

/* ── ch8 frontierPath ── */
{
  const posix = M.frontierPath.compute('posix', 40, 'gen6');
  const gds = M.frontierPath.compute('gds', 40, 'gen6');
  check('ch8 posix sec', f(posix.transferSec, 1), '6.2');
  check('ch8 gds sec', f(gds.transferSec, 1), '1.4');
  says(Z, 'zh', 'ch8.f2', '1.4 秒'); says(Z, 'zh', 'ch8.f2', '6.2 秒');
  says(E, 'en', 'ch8.f2', '1.4 s'); says(E, 'en', 'ch8.f2', '6.2 s');
}

console.log(`${n} checks, ${fails} failures`);
process.exit(fails ? 1 : 0);
