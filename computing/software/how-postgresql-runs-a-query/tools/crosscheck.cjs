#!/usr/bin/env node
'use strict';
/* Independent reference cross-check for computing/software/how-postgresql-runs-a-query/models.js.
   Note: No postgres / psql binary is installed on this host, so this script validates models.js against
   independent bitwise reference algorithms, RFC 3720 / Castagnoli test vectors, PostgreSQL 17.6 / 18.0
   struct layout specs (bufpage.h, itemid.h, htup_details.h, costsize.c, varsup.c, freelist.c, nodeHash.c),
   and exhaustive MVCC / wraparound / B-tree invariants.
   Run: node computing/software/how-postgresql-runs-a-query/tools/crosscheck.cjs */

const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));

let total = 0, fails = 0;
function check(name, cond, detail) {
  total++;
  if (!cond) {
    fails++;
    console.error(`FAIL ${name}${detail ? ': ' + detail : ''}`);
  }
}
function near(name, got, want, tol) {
  total++;
  if (!(Math.abs(got - want) <= tol)) {
    fails++;
    console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`);
  }
}

/* ── 1. Independent bitwise Castagnoli CRC-32C (no table sharing with models.js) ── */
function bitwiseCrc32c(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let b = 0; b < 8; b++) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0x82f63b78) : (crc >>> 1);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const enc = s => Uint8Array.from(s, ch => ch.charCodeAt(0));
check('CRC-32C RFC 3720 "123456789" === 0xE3069283', M.crc32cHex('123456789') === '0xE3069283', M.crc32cHex('123456789'));
check('CRC-32C "" === 0x00000000', M.crc32cHex('') === '0x00000000');
check('CRC-32C 32x 0x00 === 0x8A9136AA', M.crc32cHex(new Uint8Array(32)) === '0x8A9136AA');
check('CRC-32C 32x 0xFF === 0x62A8AB43', M.crc32cHex(new Uint8Array(32).fill(0xff)) === '0x62A8AB43');
for (const sample of ['SELECT 1;', 'PostgreSQL 18.0 WAL FPW', 'accounts_pkey']) {
  const b = enc(sample);
  check(`CRC-32C table vs bitwise "${sample}"`, M.crc32c(b) === bitwiseCrc32c(b));
}

/* ── 2. Binary 8 KiB PageHeaderData, ItemIdData & HeapTuple alignment ── */
{
  const hdr = M.packPageHeader({ lsnHi: 0x12345678, lsnLo: 0x9abcdef0, checksum: 0xbeef, flags: 0x0003, lower: 44, upper: 7752, special: 8192, pruneXid: 4200 });
  check('PageHeaderData is exactly 24 bytes', hdr.length === 24);
  const dv = new DataView(hdr.buffer);
  check('PageHeader offset 0 lsnHi LE', dv.getUint32(0, true) === 0x12345678);
  check('PageHeader offset 4 lsnLo LE', dv.getUint32(4, true) === 0x9abcdef0);
  check('PageHeader offset 8 pd_checksum LE', dv.getUint16(8, true) === 0xbeef);
  check('PageHeader offset 10 pd_flags LE', dv.getUint16(10, true) === 0x0003);
  check('PageHeader offset 12 pd_lower LE', dv.getUint16(12, true) === 44);
  check('PageHeader offset 14 pd_upper LE', dv.getUint16(14, true) === 7752);
  check('PageHeader offset 16 pd_special LE', dv.getUint16(16, true) === 8192);
  check('PageHeader offset 18 pd_pagesize_version === 0x2004 (8196)', dv.getUint16(18, true) === 0x2004);
  check('PageHeader offset 20 pd_prune_xid LE', dv.getUint32(20, true) === 4200);

  const up = M.unpackPageHeader(hdr);
  check('PageHeader round-trip pagesize=8192, layout=4', up.pagesize === 8192 && up.layoutVersion === 4 && up.lower === 44 && up.upper === 7752);

  for (const [off, fl, len] of [[8104, 1, 88], [7752, 1, 128], [24, 2, 0], [8160, 3, 32]]) {
    const w = M.packItemId(off, fl, len);
    const u = M.unpackItemId(w);
    check(`ItemIdData (${off},${fl},${len}) bitfield roundtrip`, u.lp_off === off && u.lp_flags === fl && u.lp_len === len);
  }

  check('HeapTupleHeader 23B fixed -> 24B MAXALIGN(8)', M.tupleAlignedSize(0, false, 4).hoff === 24);
  check('HeapTupleHeader + 1B null bitmap (8 cols) -> 24B MAXALIGN(8)', M.tupleAlignedSize(0, true, 8).hoff === 24);
  check('HeapTupleHeader + 2B null bitmap (9 cols) -> 32B MAXALIGN(8)', M.tupleAlignedSize(0, true, 9).hoff === 32);

  // Check slotted page byte conservation across operations
  const pg = M.simulatePageSequence({ payloadBytes: 64, fillfactor: 80, indexedChanged: false, ops: ['INSERT', 'INSERT', 'INSERT', 'UPDATE', 'UPDATE'] });
  check('Slotted page lower + free + tupleBytes === BLCKSZ', pg.lower + pg.freeBytes + pg.tupleBytes === 8192);
  check('Slotted page line pointers = 24 + 4 * slots', pg.lower === 24 + 4 * pg.slots.length);
  check('Slotted page HOT updates avoid extra index writes', pg.hotUpdates === 2 && pg.indexWrites === 3);
}

/* ── 3. MVCC Snapshot Visibility Exhaustive Matrix ── */
{
  const snap = { xmin: 100, xmax: 110, xip: [100, 104, 108], selfXid: 100 };
  const sm = { 90: 'COMMITTED', 91: 'ABORTED', 100: 'IN_PROGRESS', 102: 'COMMITTED', 104: 'IN_PROGRESS', 105: 'ABORTED', 108: 'COMMITTED', 112: 'COMMITTED' };
  const expectXmin = [
    [90, true],   // < snap.xmin, committed
    [91, false],  // < snap.xmin, aborted
    [100, true],  // selfXid in progress
    [102, true],  // in [xmin, xmax), committed, not in xip
    [104, false], // in [xmin, xmax), in progress, not self
    [105, false], // in [xmin, xmax), aborted
    [108, false], // in xip[] (was active when snapshot taken even though committed after)
    [112, false]  // >= snap.xmax
  ];
  for (const [xid, want] of expectXmin) {
    check(`xidVisibleToSnapshot(${xid}) === ${want}`, M.xidVisibleToSnapshot(xid, sm, snap) === want);
  }
  // Tuple visibility combinations: visible iff xmin visible and xmax NOT visible
  for (const [xmin] of expectXmin) {
    for (const [xmax] of expectXmin) {
      const tup = { xmin, xmax };
      const res = M.tupleSatisfiesMVCC(tup, sm, snap);
      const wantVis = M.xidVisibleToSnapshot(xmin, sm, snap) && !M.xidVisibleToSnapshot(xmax, sm, snap);
      check(`MVCC truth table (${xmin}, ${xmax})`, res.visible === wantVis);
    }
  }
}

/* ── 4. 32-bit Modular XID Wraparound ── */
{
  check('Wraparound: 0xFFFFFFFE precedes 5', M.xidPrecedes(0xfffffffe, 5) === true);
  check('Wraparound: 5 does NOT precede 0xFFFFFFFE', M.xidPrecedes(5, 0xfffffffe) === false);
  check('Half-circle boundary: 100 precedes 100 + 2^31 - 1', M.xidPrecedes(100, (100 + 2147483647) >>> 0) === true);
  check('Half-circle crossed: 100 does NOT precede 100 + 2^31 + 1', M.xidPrecedes(100, (100 + 2147483649) >>> 0) === false);

  const wWrap = M.vacuumWraparoundSim({ ageMillion: 2200, vacuumMode: 'off' });
  check('2200M without VACUUM wraps past 2^31', wWrap.status === 'wrapped' && !wWrap.precedesOk);
  const wStop = M.vacuumWraparoundSim({ ageMillion: 2145, vacuumMode: 'off' });
  check('2145M without VACUUM enters xidStopLimit', wStop.status === 'stoplimit' && wStop.precedesOk);
  const wNorm = M.vacuumWraparoundSim({ ageMillion: 2200, vacuumMode: 'normal' });
  check('2200M with AUTOVACUUM freezes before 200M limit', wNorm.status === 'healthy' && wNorm.precedesOk);
}

/* ── 5. Planner Cost Equations (costsize.c) ── */
{
  // Independent Mackert-Lohman verification
  const ml1 = M.mackertLohman(10000, 1000, 15000); // T <= b
  near('Mackert-Lohman T <= b closed form', ml1, (2 * 10000 * 1000) / (2 * 10000 + 1000), 1e-12);
  const ml2 = M.mackertLohman(10000, 50000, 3000); // T > b and N > lim
  const lim = (2 * 10000 * 3000) / (2 * 10000 - 3000);
  near('Mackert-Lohman T > b thrash branch', ml2, 3000 + ((50000 - lim) * (2 * 10000 - 3000)) / (2 * 10000), 1e-10);

  const cSeq = M.plannerCosts({ selectivity: 0.25, randomPageCost: 4.0 });
  check('At 25% selectivity rpc=4, Seq Scan beats Index & Bitmap', cSeq.winner === 'seq');
  const cIdx = M.plannerCosts({ selectivity: 0.001, randomPageCost: 4.0 });
  check('At 0.1% selectivity rpc=4, Index Scan wins', cIdx.winner === 'index');
  const cIos = M.plannerCosts({ selectivity: 0.05, randomPageCost: 4.0, allVisible: true });
  check('With VM all-visible at 5%, Index-Only Scan wins', cIos.winner === 'indexonly');
}

/* ── 6. Clock Sweep & Ring Buffer Conservation ── */
{
  for (const wl of ['oltp', 'seq_unprotected', 'seq_ring']) {
    for (const step of [1, 12, 32, 36, 40]) {
      const r = M.clockSweepSim({ workload: wl, frameCount: 8, step });
      check(`Clock sweep ${wl}@${step}: hits+misses=step`, r.hits + r.misses === step);
      check(`Clock sweep ${wl}@${step}: usage in [0,5]`, r.frames.every(f => f.usage >= 0 && f.usage <= 5));
    }
  }
  const u36 = M.clockSweepSim({ workload: 'seq_unprotected', step: 36 });
  const r36 = M.clockSweepSim({ workload: 'seq_ring', step: 36 });
  check('Ring buffer protects post-scan hot probes (4/4 vs 0/4)', u36.postHits === 0 && r36.postHits === 4);
}

/* ── 7. nbtree Lehman & Yao Invariants ── */
{
  for (const mode of ['seq', 'rand']) {
    for (const cnt of [8, 16, 24]) {
      const bt = M.nbtreeSim({ orderMode: mode, insertCount: cnt, maxKeys: 4 });
      const allKeys = bt.leaves.flatMap(l => l.keys);
      check(`nbtree ${mode} (${cnt}): key count conserved`, allKeys.length === cnt);
      for (let i = 1; i < allKeys.length; i++) {
        check(`nbtree ${mode} (${cnt}): global ascending key order`, allKeys[i - 1] < allKeys[i]);
      }
      for (let i = 0; i < bt.leaves.length - 1; i++) {
        const cur = bt.leaves[i], nxt = bt.leaves[i + 1];
        check(`nbtree ${mode} (${cnt}): btpo_next links P${cur.id}->P${nxt.id}`, cur.nextId === nxt.id);
        check(`nbtree ${mode} (${cnt}): HIKEY strictly separates P${cur.id} and P${nxt.id}`, cur.keys[cur.keys.length - 1] < cur.highKey && cur.highKey <= nxt.keys[0]);
      }
    }
  }
}

/* ── 8. Hash Join work_mem Power-of-2 Batching ── */
{
  const j4 = M.joinCostSim({ outerRows: 80000, innerRows: 400000, workMemMB: 4 });
  const j16 = M.joinCostSim({ outerRows: 80000, innerRows: 400000, workMemMB: 16 });
  check('work_mem=4MiB spills into power-of-2 batches (nbatch=2)', j4.nbatch === 2 && j4.spilled && j4.spillMiB > 0);
  check('work_mem=16MiB fits in 1 batch with 0 spill', j16.nbatch === 1 && !j16.spilled && j16.spillMiB === 0);
}

console.log(`${total - fails}/${total} crosschecks passed`);
if (fails) process.exit(1);
