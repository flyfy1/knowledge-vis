#!/usr/bin/env node
'use strict';
/* Independent algorithmic & vector crosscheck for "How Redis Answers in Microseconds" (Redis 8.0).
   Note: no redis-server binary is installed on this build host (checked via `which redis-server`),
   so this script verifies models.js against independent standard specifications, cryptographic
   test vectors, and exhaustive structural/mathematical invariants. */
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));

let n = 0, fails = 0;
function ok(name, cond, detail) {
  n++;
  if (!cond) { fails++; console.error(`FAIL ${name}${detail ? ': ' + detail : ''}`); }
}
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`); }
}
function near(name, got, want, tol) {
  n++;
  if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); }
}

/* ── 1. RESP2 & RESP3 binary round-trips ── */
{
  const req = ['SET', 'user:42', 'alice'];
  const w2 = M.respEncode(req, 'resp2');
  check('RESP2 SET wire format', w2, '*3\r\n$3\r\nSET\r\n$7\r\nuser:42\r\n$5\r\nalice\r\n');
  check('RESP2 SET byte count', M.utf8Bytes(w2).length, 37);
  check('RESP2 decode round-trip', JSON.stringify(M.respDecode(w2).value), JSON.stringify(req));

  // Binary-safe bulk string containing \r\n, \0, and multi-byte UTF-8 CJK
  const binCmd = ['SET', 'bin\r\n\0key', '你好Redis\r\n!'];
  const wb = M.respEncode(binCmd, 'resp2');
  const dec = M.respDecode(wb);
  check('RESP binary-safe bytesRead exact', dec.bytesRead, M.utf8Bytes(wb).length);
  check('RESP binary-safe round-trip', JSON.stringify(dec.value), JSON.stringify(binCmd));

  // RESP3 Map, Double, Boolean, Null
  const mVal = { map: new Map([['name', 'alice'], ['score', 99.5]]) };
  const w3 = M.respEncode(mVal, 'resp3');
  check('RESP3 map prefix', w3.startsWith('%2\r\n'), true);
  const d3 = M.respDecode(w3).value;
  check('RESP3 map round-trip score', d3.map.get('score'), 99.5);
  check('RESP3 bool #t / #f', [M.respDecode(M.respEncode(true, 'resp3')).value, M.respDecode(M.respEncode(false, 'resp3')).value].join(), 'true,false');
  check('RESP3 null _', M.respDecode(M.respEncode(null, 'resp3')).value, null);
}

/* ── 2. SipHash-2-4 official vectors (Aumasson & Bernstein 2012) & SipHash-1-2 ── */
{
  // Key = 0x000102030405060708090a0b0c0d0e0f
  const key = new Uint8Array(16).map((_, i) => i);
  // Output bytes little-endian as 64-bit uint:
  // len 0: 31 0e 0e dd 47 db 6f 72 -> 0x726fdb47dd0e0e31n
  // len 1 (00): fd 67 dc 93 c5 39 f8 74 -> 0x74f839c593dc67fdn
  // len 2 (00 01): 5a 4f a9 d9 09 80 6c 0d -> 0x0d6c8009d9a94f5an
  // len 3 (00 01 02): 2d 7e fb d7 96 66 67 85 -> 0x85676696d7fb7e2dn
  check('SipHash-2-4 len=0 vector', M.siphash(new Uint8Array([]), key, 2, 4), 0x726fdb47dd0e0e31n);
  check('SipHash-2-4 len=1 vector', M.siphash(new Uint8Array([0]), key, 2, 4), 0x74f839c593dc67fdn);
  check('SipHash-2-4 len=2 vector', M.siphash(new Uint8Array([0, 1]), key, 2, 4), 0x0d6c8009d9a94f5an);
  check('SipHash-2-4 len=3 vector', M.siphash(new Uint8Array([0, 1, 2]), key, 2, 4), 0x85676696d7fb7e2dn);

  // Redis uses SipHash-1-2 by default (c=1, d=2): check non-collision & determinism
  const h1 = M.siphash('user:42', key, 1, 2);
  const h2 = M.siphash('user:43', key, 1, 2);
  ok('SipHash-1-2 distinct inputs yield distinct 64-bit hashes', h1 !== h2 && h1 !== M.siphash('user:42', key, 2, 4));
}

/* ── 3. CRC16-CCITT/XMODEM & Redis Cluster {hash-tag} rules ── */
{
  // Independent unrolled CRC16 reference function (poly 0x1021, init 0x0000)
  function refCrc16(bytes) {
    let crc = 0;
    for (const byte of bytes) {
      for (let i = 7; i >= 0; i--) {
        const bit = (byte >> i) & 1;
        const c15 = (crc >> 15) & 1;
        crc = (crc << 1) & 0xffff;
        if (c15 ^ bit) crc ^= 0x1021;
      }
    }
    return crc;
  }
  check('CRC16("123456789") = 0x31C3 (Redis Cluster spec)', M.crc16('123456789'), 0x31c3);
  check('CRC16("123456789") slot = 12739', M.keyHashSlot('123456789').slot, 12739);
  for (const s of ['', 'foo', 'user:{42}:cart', '你好世界', 'a'.repeat(128)]) {
    check(`CRC16(${s.slice(0, 10)}) matches bit-loop ref`, M.crc16(s), refCrc16(M.utf8Bytes(s)));
  }
  // Exact Redis keyHashSlot tag spec: first '{' followed by non-empty before first '}'
  check('{hash-tag} match', M.keyHashSlot('user:{42}:cart').slot, M.keyHashSlot('user:{42}:orders').slot);
  check('empty {} falls back to full key', M.extractHashTag('foo{}{bar}').usedTag, false);
  check('first non-empty {tag} wins', M.extractHashTag('foo{a}{b}').tag, 'a');
  check('unclosed { falls back to full key', M.extractHashTag('foo{bar').usedTag, false);
}

/* ── 4. Progressive dict rehash conservation ── */
{
  for (const numKeys of [8, 10, 16]) {
    let baselineKeys = null;
    for (let step = 0; step <= 8; step++) {
      const r = M.rehashSim({ numKeys, step, mode: 'prog' });
      const allKeys = [...r.ht0.flat(), ...r.ht1.flat()].map(x => x.k).sort();
      if (!baselineKeys) baselineKeys = allKeys;
      check(`rehash n=${numKeys} step=${step} key conservation`, allKeys.join(','), baselineKeys.join(','));
      check(`rehash n=${numKeys} step=${step} total count`, r.h0Count + r.h1Count, numKeys);
    }
  }
}

/* ── 5. Reverse-binary SCAN cursor zero-miss invariant across table doubling & halving ── */
{
  function verifyScan(initSize, resizeAtStep, newSize) {
    const maxN = Math.max(initSize, newSize);
    const keys = Array.from({ length: maxN * 2 }, (_, i) => ({ id: i, h: i }));
    let size = initSize, mask = size - 1, cursor = 0, step = 0;
    const seen = new Set();
    do {
      step++;
      if (step === resizeAtStep) { size = newSize; mask = size - 1; }
      const b = cursor & mask;
      for (const k of keys) if ((k.h & mask) === b) seen.add(k.id);
      cursor = M.dictScanNextCursor(cursor, mask);
    } while (cursor !== 0 && step < 256);
    return { missed: keys.length - seen.size, steps: step };
  }
  for (const [s0, s1] of [[8, 8], [8, 16], [16, 8], [16, 32], [32, 16], [32, 64], [64, 32]]) {
    for (let at = 1; at <= 6; at++) {
      const res = verifyScan(s0, at, s1);
      check(`SCAN ${s0}->${s1} resize@step${at} missed=0`, res.missed, 0);
    }
  }
}

/* ── 6. Skiplist level distribution (p = 0.25) & span / ZRANK invariants ── */
{
  const rng = M.mulberry32(202611);
  let sumLvl = 0, l1 = 0, l2 = 0;
  const trials = 20000;
  for (let i = 0; i < trials; i++) {
    const l = M.zslRandomLevel(rng);
    sumLvl += l;
    if (l === 1) l1++;
    if (l === 2) l2++;
  }
  near('zslRandomLevel mean ≈ 4/3 (p=0.25)', sumLvl / trials, 4 / 3, 0.03);
  near('zslRandomLevel P(L=1) ≈ 0.75', l1 / trials, 0.75, 0.015);
  near('zslRandomLevel P(L=2) ≈ 0.1875', l2 / trials, 0.1875, 0.015);

  for (const seed of [1, 2, 3, 4, 5]) {
    for (const len of [8, 12, 20]) {
      const z = M.buildSkiplist(len, seed);
      // Level span sum invariant: across each level l, sum of forward spans from header equals length + 0 (reaching tail)
      for (let l = 0; l < z.level; l++) {
        let cur = z.header, tot = 0;
        while (cur.level[l].forward) { tot += cur.level[l].span; cur = cur.level[l].forward; }
        ok(`zsl seed=${seed} n=${len} L${l} span sum <= length`, tot >= 1 && tot <= len);
      }
      // Every rank 1..len matches exact zslQueryRank return
      for (let r = 1; r <= len; r++) {
        const q = M.zslQueryRank(z, r);
        check(`zsl seed=${seed} n=${len} rank=${r}`, q.rank, r);
      }
      // Backward link check at level 0
      let cnt = 0, cur = z.tail;
      while (cur) { cnt++; cur = cur.backward; }
      check(`zsl seed=${seed} n=${len} backward count`, cnt, len);
    }
  }
}

/* ── 7. embstr 44-byte cutoff & listpack varint layout ── */
{
  check('embstr limit math 64 - 16 - 3 - 1 = 44', 64 - M.CONST.ROBJ_BYTES - M.CONST.SDSHDR8_BYTES - 1, 44);
  check('len=44 is embstr in 64 B, 1 malloc', [M.stringMemory(44, false).encoding, M.stringMemory(44, false).allocBytes, M.stringMemory(44, false).mallocs].join(), 'embstr,64,1');
  check('len=45 is raw in 80 B, 2 mallocs', [M.stringMemory(45, false).encoding, M.stringMemory(45, false).allocBytes, M.stringMemory(45, false).mallocs].join(), 'raw,80,2');
  check('int 42 shared uses 0 new bytes / 0 mallocs', [M.stringMemory(2, true, 42).encoding, M.stringMemory(2, true, 42).allocBytes, M.stringMemory(2, true, 42).mallocs].join(), 'int,0,0');
  // listpack entry: len=63 -> 1B hdr + 63B + 1B backlen = 65B; len=64 -> 2B hdr + 64B + 1B backlen = 67B; len=126 -> 2+126+2=130B (body=128 > 127 => 2B backlen!)
  check('listpack entry varint boundary len=63 / 64 / 126', [M.listpackEntryBytes(63), M.listpackEntryBytes(64), M.listpackEntryBytes(126)].join(), '65,67,130');
}

/* ── 8. Morris 8-bit LFU expectation vs Monte Carlo & Redis docs milestones ── */
{
  // Closed-form expectation matches independent Monte Carlo runs within tolerance
  const mc1000 = M.morrisMonteCarlo(1000, 10, 400, 777);
  near('Morris factor=10 1,000 hits MC ≈ 19.3', mc1000, 19.3, 1.5);
  check('Morris factor=10 closed-form 1k / 100k', [M.morrisExpectedCounter(1000, 10), M.morrisExpectedCounter(100000, 10)].join(), '19,146');
  check('Morris factor=10 hits to reach 255 = 311,500', M.morrisExpectedHits(255, 10), 311500);
  check('Morris factor=0 reaches 255 at 250 hits', M.morrisExpectedHits(255, 0), 250);
}

/* ── 9. CoW page fault bounds ── */
{
  const c0 = M.cowSim({ writePct: 0, skew: false });
  const c50u = M.cowSim({ writePct: 50, skew: false });
  const c50s = M.cowSim({ writePct: 50, skew: true });
  const c100 = M.cowSim({ writePct: 100, skew: false });
  check('CoW 0% write = 1.00× RAM', c0.ramMult, 1);
  ok('CoW bounds 1.0 <= ramMult <= 2.0', c50u.ramMult >= 1 && c50u.ramMult <= 2 && c100.ramMult <= 2);
  ok('Hot-skewed writes duplicate fewer pages than uniform writes', c50s.copied < c50u.copied);
}

console.log(`${n - fails}/${n} crosscheck checks passed`);
if (fails) process.exit(1);
