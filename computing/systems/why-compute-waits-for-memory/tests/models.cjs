'use strict';
// Pins every quantitative number in copy.zh.js to models.js and tests every model across its extremes.
// Run: node computing/systems/why-compute-waits-for-memory/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const M = require(path.join(__dirname, '..', 'models.js'));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); }
}
function says(key, phrase) {
  n++;
  if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); }
}
const f = (x, d = 0) => x.toFixed(d);

/* ── ch1 pipeline ── */
{
  const l1f = M.pipeline.simulate(1, true);
  check('ch1 L1 fwd cycles', l1f.totalCycles, 11);
  check('ch1 L1 fwd waitPct', f(l1f.waitPct, 1), '9.1');
  says('ch1.p3', '11 个周期'); says('ch1.p3', '9.1%');

  const l1n = M.pipeline.simulate(1, false);
  check('ch1 L1 no-fwd cycles', l1n.totalCycles, 18);
  says('ch1.p3', '18 个周期');

  const dram = M.pipeline.simulate(200, true);
  check('ch1 DRAM cycles', dram.totalCycles, 210);
  check('ch1 DRAM stall', dram.stallCycles, 200);
  check('ch1 DRAM waitPct', f(dram.waitPct, 1), '95.2');
  says('ch1.p3', '200 周期'); says('ch1.p3', '210 个周期'); says('ch1.p3', '95.2%');

  // stageAt sanity
  const s4 = M.pipeline.stageAt(dram, 5);
  check('ch1 DRAM stall at cycle 5', s4.memWait, true);
}

/* ── ch2 hierarchy + cacheWalk ── */
{
  const L = M.hierarchy.LEVELS;
  check('ch2 L1 ns', L[0].ns, 1);
  check('ch2 L1 humanS', f(L[0].humanS, 1), '3.3');
  check('ch2 L2 ns', L[1].ns, 4);
  check('ch2 L2 humanS', f(L[1].humanS, 1), '13.3');
  check('ch2 DRAM ns', L[3].ns, 80);
  check('ch2 DRAM humanMin', f(L[3].humanS / 60, 1), '4.4');
  check('ch2 SSD ns', L[4].ns, 70000);
  check('ch2 SSD humanDays', f(L[4].humanS / 86400, 1), '2.7');
  says('ch2.lv.r1', '3.3 秒'); says('ch2.lv.r2', '13.3 秒');
  says('ch2.lv.r3', '4.4 分钟'); says('ch2.lv.r4', '2.7 天');
  says('ch2.lv.say.log', '80 倍');

  const row = M.cacheWalk.simulate({ N: 16, order: 'row', cacheBytes: 1024, blockBytes: 64, ways: 1 });
  const col = M.cacheWalk.simulate({ N: 16, order: 'col', cacheBytes: 1024, blockBytes: 64, ways: 1 });
  check('ch2 row total', row.total, 256);
  check('ch2 row misses', row.misses, 32);
  check('ch2 row missRate%', f(row.missRate * 100, 1), '12.5');
  check('ch2 row bytes', row.bytesTransferred, 2048);
  check('ch2 col misses', col.misses, 256);
  check('ch2 col missRate%', f(col.missRate * 100, 1), '100.0');
  check('ch2 col bytes', col.bytesTransferred, 16384);
  check('ch2 col/row ratio', col.misses / row.misses, 8);
  const col2k = M.cacheWalk.simulate({ N: 16, order: 'col', cacheBytes: 2048, blockBytes: 64, ways: 1 });
  check('ch2 col 2KB misses', col2k.misses, 32);
  says('ch2.p3', '32 次'); says('ch2.p3', '12.5%'); says('ch2.p3', '2,048 字节');
  says('ch2.p3', '256 次'); says('ch2.p3', '16,384 字节'); says('ch2.p3', '8 倍');
  says('ch2.say.colfit', '未发生冲突驱逐');
}

/* ── ch3 matmulTile ── */
{
  const ijk = M.matmulTile.simulate(24, 'ijk', 8);
  const ikj = M.matmulTile.simulate(24, 'ikj', 8);
  const b8  = M.matmulTile.simulate(24, 'tiled', 8);
  const b12 = M.matmulTile.simulate(24, 'tiled', 12);
  check('ch3 flops', ijk.flops, 27648);
  check('ch3 ijk misses', ijk.misses, 4035);
  check('ch3 ijk bytes', ijk.bytesTransferred, 258240);
  check('ch3 ijk ai', f(ijk.effIntensity, 2), '0.11');
  check('ch3 ikj misses', ikj.misses, 1872);
  check('ch3 b8 misses', b8.misses, 534);
  check('ch3 b8 bytes', b8.bytesTransferred, 34176);
  check('ch3 b8 ai', f(b8.effIntensity, 2), '0.81');
  check('ch3 b8 workingSet', b8.workingSetBytes, 1536);
  check('ch3 b8 fits', b8.fitsCache, true);
  check('ch3 ijk/b8 ratio', f(ijk.misses / b8.misses, 1), '7.6');
  check('ch3 b12 workingSet', b12.workingSetBytes, 3456);
  check('ch3 b12 fits', b12.fitsCache, false);
  check('ch3 b12 misses', b12.misses, 1145);
  says('ch3.p3', '27,648'); says('ch3.p3', '4,035 次'); says('ch3.p3', '258,240 字节'); says('ch3.p3', '0.11');
  says('ch3.p3', '1,872 次'); says('ch3.p3', '1,536 B'); says('ch3.p3', '534 次');
  says('ch3.p3', '34,176 字节'); says('ch3.p3', '0.81'); says('ch3.p3', '7.6 倍');
  says('ch3.p3', '3,456 B'); says('ch3.p3', '1,145 次');
}

/* ── ch4 memoryWall + Little's Law ── */
{
  const c0 = M.memoryWall.effCPI(1, 0.3, 0, 250);
  const c2 = M.memoryWall.effCPI(1, 0.3, 0.02, 250);
  const c10 = M.memoryWall.effCPI(1, 0.3, 0.10, 250);
  check('ch4 cpi 0%', f(c0, 2), '1.00');
  check('ch4 cpi 2%', f(c2, 2), '2.50');
  check('ch4 util 2%', f(M.memoryWall.computeUtilPct(1, c2), 1), '40.0');
  check('ch4 util 10%', f(M.memoryWall.computeUtilPct(1, c10), 1), '11.8');
  says('ch4.p3', '2%'); says('ch4.p3', '2.50'); says('ch4.p3', '40.0%'); says('ch4.p3', '11.8%');

  const ll32 = M.memoryWall.littlesLaw(3350, 80, 32, 128);
  check('ch4 requiredKB', f(ll32.requiredBytes / 1000, 0), '268');
  check('ch4 requiredReqs', Math.round(ll32.requiredReqs), 2094);
  check('ch4 bw32', f(ll32.achievedBwGBs, 1), '51.2');
  check('ch4 bwPct32', f(ll32.bwPct, 1), '1.5');
  says('ch4.p2', '268 KB'); says('ch4.p2', '2,094');
  says('ch4.p3', '51.2 GB/s'); says('ch4.p3', '1.5%');
}

/* ── ch5 multicore ── */
{
  const r95 = M.multicore.bwCapped(0.95, 64, 12, 192);
  const r99 = M.multicore.bwCapped(0.99, 64, 12, 192);
  check('ch5 f95 P64 amdahl', f(r95.amdahl, 1), '15.4');
  check('ch5 f95 P64 gustafson', f(r95.gustafson, 1), '60.8');
  check('ch5 f99 P64 amdahl', f(r99.amdahl, 1), '39.3');
  check('ch5 f99 P64 memCap', r99.memCap, 16);
  check('ch5 f99 P64 actual', r99.actual, 16);
  says('ch5.p3', '15.4 倍'); says('ch5.p3', '60.8 倍');
  says('ch5.p3', '39.3 倍'); says('ch5.p3', '16 倍');
}

/* ── ch6 systolic & gemmLayer ── */
{
  const s8 = M.systolic.stats(8, 64);
  check('ch6 8x8 macs', s8.macsPerCycle, 64);
  check('ch6 8x8 flops/cyc', s8.flopsPerCycle, 128);
  check('ch6 8x8 steady', s8.steadyFlopsPerElem, 8);
  says('ch6.p3', '64 次乘加'); says('ch6.p3', '128 次浮点运算'); says('ch6.p3', '8 次浮点运算');

  const g1 = M.gemmLayer.eval(1, 4096, 4096, 2);
  const g512 = M.gemmLayer.eval(512, 4096, 4096, 2);
  check('ch6 layer M=1 AI', f(g1.intensity, 2), '1.00');
  check('ch6 layer M=512 AI', f(g512.intensity, 1), '409.6');
  says('ch6.p3', '1.00 FLOP/字节'); says('ch6.p3', '409.6 FLOP/字节');
}

/* ── ch7 roofline ── */
{
  check('ch7 cpu ridge', f(M.roofline.ridge('cpu'), 1), '12.4');
  check('ch7 h100 ridge', f(M.roofline.ridge('h100'), 1), '295.4');
  check('ch7 b200 ridge', f(M.roofline.ridge('b200'), 1), '281.3');
  check('ch7 ironwood ridge', f(M.roofline.ridge('ironwood'), 1), '312.6');
  const dec1 = M.roofline.eval('h100', 1.0);
  check('ch7 h100 decode1 TF', f(dec1.perf / 1e12, 2), '3.35');
  check('ch7 h100 decode1 idle%', f(100 - dec1.utilPct, 1), '99.7');
  says('ch7.p3', '12.4 FLOP/字节'); says('ch7.p3', '295.4 FLOP/字节');
  says('ch7.p3', '281.3 FLOP/字节'); says('ch7.p3', '312.6 FLOP/字节');
  says('ch7.p3', '3.35 TFLOPS'); says('ch7.p3', '99.7%');
}

/* ── ch8 llmServe ── */
{
  const s8bf = M.llmServe.eval({ modelId: 'llama8b', hwId: 'h100', bits: 16, batch: 1, ctx: 2048 });
  const s8i4 = M.llmServe.eval({ modelId: 'llama8b', hwId: 'h100', bits: 4, batch: 1, ctx: 2048 });
  const s70  = M.llmServe.eval({ modelId: 'llama70b', hwId: 'h100', bits: 16, batch: 1, ctx: 2048 });
  check('ch8 8B BF16 wGB', f(s8bf.weightBytes / 1e9, 2), '16.06');
  check('ch8 8B BF16 kvGB', f(s8bf.kvTotalBytes / 1e9, 2), '0.27');
  check('ch8 8B BF16 totGB', f(s8bf.totalMemBytes / 1e9, 2), '16.33');
  check('ch8 8B BF16 toks', f(s8bf.tokPerSecUser, 0), '205');
  check('ch8 8B BF16 AI', f(s8bf.intensity, 2), '1.05');
  check('ch8 8B BF16 util%', f(s8bf.computeUtilPct, 2), '0.36');
  check('ch8 8B INT4 wGB', f(s8i4.weightBytes / 1e9, 2), '4.01');
  check('ch8 8B INT4 toks', f(s8i4.tokPerSecUser, 0), '782');
  check('ch8 8B INT4/BF16', f(s8i4.tokPerSecUser / s8bf.tokPerSecUser, 1), '3.8');
  check('ch8 70B BF16 wGB', f(s70.weightBytes / 1e9, 1), '141.2');
  check('ch8 70B fits H100', s70.fits, false);
  says('ch8.p3', '16.06 GB'); says('ch8.p3', '0.27 GB'); says('ch8.p3', '16.33 GB');
  says('ch8.p3', '205 token/s'); says('ch8.p3', '1.05 FLOP/字节'); says('ch8.p3', '0.36%');
  says('ch8.p3', '4.01 GB'); says('ch8.p3', '782 token/s'); says('ch8.p3', '3.8 倍');
  says('ch8.p3', '141.2 GB');
}

/* ── ch9 energy ── */
{
  const e1 = M.energy.budget(1, 'dram');
  const e256 = M.energy.budget(256, 'dram');
  check('ch9 mac pJ', f(e1.macPj, 1), '1.5');
  check('ch9 move1 pJ', f(e1.movePerMacPj, 0), '320');
  check('ch9 move1 share%', f(e1.moveSharePct, 1), '99.5');
  check('ch9 move1 ratio', f(e1.ratioMoveToMac, 0), '213');
  check('ch9 move256 pJ', f(e256.movePerMacPj, 2), '1.25');
  check('ch9 move256 share%', f(e256.moveSharePct, 1), '45.5');
  says('ch9.p1', '1.5 pJ'); says('ch9.p1', '640 pJ'); says('ch9.p1', '213 倍');
  says('ch9.p3', '99.5%'); says('ch9.p3', '320 pJ'); says('ch9.p3', '256 次');
  says('ch9.p3', '1.25 pJ'); says('ch9.p3', '45.5%');
  says('ch9.p3', '8,000 GB/s'); says('ch9.p3', '1,800 GB/s'); says('ch9.p3', '128 GB/s'); says('ch9.p3', '100 GB/s');
}

/* ── ch10 frontier ── */
{
  check('ch10 asOf', M.FRONTIER.asOf, '2026-11');
  check('ch10 hbm4 bits', M.FRONTIER.hbm4Jedec.busWidthBits, 2048);
  check('ch10 hbm4 base', M.FRONTIER.hbm4Jedec.baselineStackTB, 2.0);
  const rubin = M.FRONTIER.chips.find(c => c.id === 'rubin');
  check('ch10 rubin bw', rubin.bwTB, 19.2);
  check('ch10 rubin cap', rubin.capGB, 288);
  says('ch10.f2', '2,048-bit'); says('ch10.f2', '2.0 TB/s');
  says('ch10.f4', '19.2 TB/s');
}

/* ── live sentence templates check ── */
for (const [k, v] of Object.entries(Z)) {
  if (/\.say(\.|$)/.test(k)) {
    n++;
    if (!v || v.length < 15) { fails++; console.error(`FAIL empty/short say template: ${k}`); }
  }
}

if (fails > 0) {
  console.error(`FAILED ${fails} / ${n} checks`);
  process.exit(1);
}
console.log(`PASS: ${n} / ${n} model & prose checks passed.`);
