/* Pure deterministic models for "How Redis Answers in Microseconds" (Redis 8.0 internals).
   UMD module: usable in browsers (window.RedisMicroModels) and Node (require('./models.js')). Zero external dependencies. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RedisMicroModels = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CONST = {
    RELEASE: 'Redis 8.0',
    RELEASE_DATE: '2025-05-01',
    ROBJ_BYTES: 16,
    SDSHDR8_BYTES: 3,
    EMBSTR_LIMIT: 44,           // OBJ_ENCODING_EMBSTR_SIZE_LIMIT = 64 - 16 (robj) - 3 (sdshdr8) - 1 (\0)
    SHARED_INTEGERS: 10000,     // OBJ_SHARED_INTEGERS (0..9999)
    HASH_MAX_LP_ENTRIES: 512,   // hash-max-listpack-entries default
    HASH_MAX_LP_VALUE: 64,      // hash-max-listpack-value default
    ZSET_MAX_LP_ENTRIES: 128,   // zset-max-listpack-entries default
    ZSET_MAX_LP_VALUE: 64,      // zset-max-listpack-value default
    DICT_INITIAL_SIZE: 4,       // DICT_HT_INITIAL_SIZE
    DICT_FORCE_RATIO: 5,        // dict_force_resize_ratio during fork/BGSAVE
    DICT_ENTRY_BYTES: 24,       // key* + val union + next* (64-bit)
    ZSKIPLIST_MAXLEVEL: 32,
    ZSKIPLIST_P: 0.25,
    CLUSTER_SLOTS: 16384,
    ACTIVE_EXPIRE_KEYS_PER_LOOP: 20,
    ACTIVE_EXPIRE_ACCEPTABLE_STALE: 10,
    MAXMEMORY_SAMPLES: 5,
    EVPOOL_SIZE: 16,
    LFU_INIT_VAL: 5,
    LFU_LOG_FACTOR: 10,
    LFU_DECAY_TIME: 1,
    PAGE_BYTES: 4096,
    TCP_MSS_BYTES: 1460
  };

  /* ── number & byte formatting ── */
  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    const dec = d == null ? 2 : d;
    const loc = locale === 'zh' ? 'zh-CN' : 'en-US';
    return Number(x).toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtInt(x) { return fmt(Math.round(x), 0, 'en'); }
  function bytesStr(b) {
    if (b < 1024) return fmtInt(b) + ' B';
    if (b < 1024 * 1024) return fmt(b / 1024, 1, 'en') + ' KiB';
    return fmt(b / (1024 * 1024), 2, 'en') + ' MiB';
  }
  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(String(str));
    const out = [];
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      let c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
        const c2 = s.charCodeAt(++i);
        const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      } else { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
    }
    return new Uint8Array(out);
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── ch1: single-threaded event loop vs lock contention & head-of-line blocking ── */
  const LOOP_DEFAULTS = {
    loopCmdUs: 2.0,          // 500 kops/s single-core lock-free event loop (analytical parameter)
    mutexBaseUs: 0.45,       // mutex acquire + release overhead per operation
    cacheBounceUs: 0.85,     // cross-core MESI cache-line ping-pong per contending thread
    ctxSwitchUs: 3.2,        // futex sleep/wakeup penalty under lock collision
    slowCmdUs: 2000          // e.g. KEYS * or O(N) blocking command (2 ms)
  };
  function eventLoopModel(opts) {
    const o = Object.assign({ threads: 4, hotPct: 50, slowCmd: false }, opts);
    const P = LOOP_DEFAULTS;
    const loopKops = 1000 / P.loopCmdUs;
    const curve = [];
    const hot = Math.max(0, Math.min(1, o.hotPct / 100));
    function lockedKops(t) {
      if (t <= 1) return 1000 / (P.loopCmdUs + P.mutexBaseUs);
      const contention = hot * (t - 1);
      const effectiveUs = P.loopCmdUs + P.mutexBaseUs + contention * (P.cacheBounceUs + hot * P.ctxSwitchUs * 0.55);
      const serialFrac = Math.min(0.96, 0.12 + 0.78 * hot);
      const scale = 1 / (serialFrac + (1 - serialFrac) / t);
      return (1000 / effectiveUs) * scale;
    }
    for (let t = 1; t <= 16; t++) curve.push({ t, kops: lockedKops(t) });
    const lockKops = lockedKops(o.threads);
    // 20 requests queued at t = 0..19 * 2 us spacing; request #3 (index 2) is slow if slowCmd=true
    const reqs = [];
    let clock = 0;
    for (let i = 0; i < 20; i++) {
      const arrival = i * 2.0;
      const start = Math.max(clock, arrival);
      const dur = (o.slowCmd && i === 2) ? P.slowCmdUs : P.loopCmdUs;
      const wait = start - arrival;
      clock = start + dur;
      reqs.push({ id: i + 1, arrival, start, dur, wait, total: wait + dur, slow: o.slowCmd && i === 2 });
    }
    const sortedTot = reqs.map(r => r.total).sort((a, b) => a - b);
    const p99Us = sortedTot[sortedTot.length - 1];
    const blockedCount = reqs.filter(r => r.id > 3 && o.slowCmd).length;
    return { loopKops, lockKops, curve, reqs, p99Us, blockedCount, threads: o.threads, hotPct: o.hotPct, slowCmd: !!o.slowCmd };
  }

  /* ── ch2: RESP2 / RESP3 framing & pipelining ── */
  function respEncode(val, proto) {
    const p = proto === 'resp3' ? 'resp3' : 'resp2';
    if (val === null || val === undefined) return p === 'resp3' ? '_\r\n' : '$-1\r\n';
    if (typeof val === 'boolean') return p === 'resp3' ? (val ? '#t\r\n' : '#f\r\n') : (val ? ':1\r\n' : ':0\r\n');
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return ':' + val + '\r\n';
      if (p === 'resp3') return ',' + String(val) + '\r\n';
      const s = String(val); return '$' + utf8Bytes(s).length + '\r\n' + s + '\r\n';
    }
    if (typeof val === 'string') {
      const len = utf8Bytes(val).length;
      return '$' + len + '\r\n' + val + '\r\n';
    }
    if (val && typeof val === 'object' && val.simple != null) return '+' + val.simple + '\r\n';
    if (val && typeof val === 'object' && val.err != null) return '-' + val.err + '\r\n';
    if (val && typeof val === 'object' && val.map instanceof Map) {
      if (p === 'resp3') {
        let out = '%' + val.map.size + '\r\n';
        for (const [k, v] of val.map.entries()) out += respEncode(k, p) + respEncode(v, p);
        return out;
      }
      let out = '*' + (val.map.size * 2) + '\r\n';
      for (const [k, v] of val.map.entries()) out += respEncode(k, p) + respEncode(v, p);
      return out;
    }
    if (Array.isArray(val)) {
      let out = '*' + val.length + '\r\n';
      for (let i = 0; i < val.length; i++) out += respEncode(val[i], p);
      return out;
    }
    throw new Error('Unsupported RESP value');
  }
  function respDecode(raw) {
    const buf = typeof raw === 'string' ? utf8Bytes(raw) : raw;
    let pos = 0;
    function readLine() {
      for (let i = pos; i + 1 < buf.length; i++) {
        if (buf[i] === 13 && buf[i + 1] === 10) {
          const line = new TextDecoder().decode(buf.subarray(pos, i));
          pos = i + 2;
          return line;
        }
      }
      throw new Error('Incomplete RESP line');
    }
    function parseOne() {
      if (pos >= buf.length) throw new Error('Unexpected EOF in RESP');
      const prefix = String.fromCharCode(buf[pos++]);
      if (prefix === '+') return { simple: readLine() };
      if (prefix === '-') return { err: readLine() };
      if (prefix === ':') return parseInt(readLine(), 10);
      if (prefix === '_') { readLine(); return null; }
      if (prefix === '#') { const b = readLine(); return b === 't'; }
      if (prefix === ',') { return parseFloat(readLine()); }
      if (prefix === '$') {
        const len = parseInt(readLine(), 10);
        if (len === -1) return null;
        if (pos + len + 2 > buf.length) throw new Error('Truncated bulk string');
        const str = new TextDecoder().decode(buf.subarray(pos, pos + len));
        pos += len + 2; // skip \r\n
        return str;
      }
      if (prefix === '*') {
        const count = parseInt(readLine(), 10);
        if (count === -1) return null;
        const arr = [];
        for (let i = 0; i < count; i++) arr.push(parseOne());
        return arr;
      }
      if (prefix === '%') {
        const pairs = parseInt(readLine(), 10);
        const map = new Map();
        for (let i = 0; i < pairs; i++) { const k = parseOne(); const v = parseOne(); map.set(k, v); }
        return { map };
      }
      throw new Error('Unknown RESP prefix: ' + prefix);
    }
    const val = parseOne();
    return { value: val, bytesRead: pos };
  }
  function respSample(proto) {
    const req = ['SET', 'user:42', 'alice'];
    const reqWire = respEncode(req, proto);
    const replyVal = proto === 'resp3' ? { map: new Map([['name', 'alice'], ['score', 99.5]]) } : { map: new Map([['name', 'alice'], ['score', 99.5]]) };
    const repWire = respEncode(replyVal, proto);
    return {
      reqBytes: utf8Bytes(reqWire).length,
      reqEscaped: reqWire.replace(/\r\n/g, '\\r\\n'),
      repBytes: utf8Bytes(repWire).length,
      repEscaped: repWire.replace(/\r\n/g, '\\r\\n')
    };
  }
  function pipelineStats(opts) {
    const o = Object.assign({ n: 20, rttUs: 200, proto: 'resp2', mode: 'seq' }, opts);
    const parseUs = 0.35, execUs = 0.85; // ~1.2 us server CPU per SET
    const sample = respSample(o.proto);
    const wireBytes = o.n * sample.reqBytes;
    const seqTotalUs = o.n * (o.rttUs + parseUs + execUs);
    const pipeTotalUs = o.rttUs + o.n * (parseUs + execUs);
    const activeUs = o.mode === 'pipe' ? pipeTotalUs : seqTotalUs;
    const qps = o.n / (activeUs * 1e-6);
    const speedup = seqTotalUs / pipeTotalUs;
    const tcpPackets = Math.ceil(wireBytes / CONST.TCP_MSS_BYTES);
    return { n: o.n, rttUs: o.rttUs, proto: o.proto, mode: o.mode, wireBytes, seqTotalUs, pipeTotalUs, activeUs, qps, speedup, tcpPackets, sample, parseUs, execUs };
  }

  /* ── ch3: jemalloc size classes, redisObject, embstr vs raw vs int, and listpack ── */
  const JEMALLOC_CLASSES = [8, 16, 32, 48, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 448, 512, 640, 768, 896, 1024, 1280, 1536, 1792, 2048, 2560, 3072, 3584, 4096];
  function jemallocRound(bytes) {
    for (let i = 0; i < JEMALLOC_CLASSES.length; i++) if (bytes <= JEMALLOC_CLASSES[i]) return JEMALLOC_CLASSES[i];
    return Math.ceil(bytes / 4096) * 4096;
  }
  function stringMemory(len, isInt, intVal) {
    if (isInt) {
      const v = intVal == null ? 42 : intVal;
      const shared = v >= 0 && v < CONST.SHARED_INTEGERS;
      return {
        encoding: 'int',
        shared,
        robjBytes: CONST.ROBJ_BYTES,
        sdsBytes: 0,
        allocBytes: shared ? 0 : CONST.ROBJ_BYTES, // shared.integers[0..9999] needs 0 new robj mallocs
        mallocs: shared ? 0 : 1,
        rawBytes: CONST.ROBJ_BYTES,
        wasteBytes: 0
      };
    }
    const n = Math.max(0, Math.round(len));
    if (n <= CONST.EMBSTR_LIMIT) {
      const rawBytes = CONST.ROBJ_BYTES + CONST.SDSHDR8_BYTES + n + 1;
      const allocBytes = jemallocRound(rawBytes);
      return {
        encoding: 'embstr',
        shared: false,
        robjBytes: CONST.ROBJ_BYTES,
        sdsBytes: CONST.SDSHDR8_BYTES + n + 1,
        allocBytes,
        mallocs: 1,
        rawBytes,
        wasteBytes: allocBytes - rawBytes
      };
    }
    const sdsNeed = CONST.SDSHDR8_BYTES + n + 1;
    const sdsAlloc = jemallocRound(sdsNeed);
    return {
      encoding: 'raw',
      shared: false,
      robjBytes: CONST.ROBJ_BYTES,
      sdsBytes: sdsAlloc,
      allocBytes: CONST.ROBJ_BYTES + sdsAlloc,
      mallocs: 2,
      rawBytes: CONST.ROBJ_BYTES + sdsNeed,
      wasteBytes: sdsAlloc - sdsNeed
    };
  }
  // Exact src/listpack.c string entry size: header (1, 2, or 5 bytes) + payload + backlen (varint 1..5 bytes)
  function listpackEntryBytes(len) {
    const hdr = len < 64 ? 1 : len < 4096 ? 2 : 5;
    const body = hdr + len;
    const back = body <= 127 ? 1 : body <= 16383 ? 2 : body <= 2097151 ? 3 : 4;
    return body + back;
  }
  function listpackBytes(entries, valLen, keyLen) {
    const k = keyLen == null ? 8 : keyLen;
    return 6 + entries * (listpackEntryBytes(k) + listpackEntryBytes(valLen)) + 1;
  }
  function nextPow2(x) { let p = CONST.DICT_INITIAL_SIZE; while (p < x) p <<= 1; return p; }
  function hashMemory(entries, valLen, keyLen) {
    const k = keyLen == null ? 8 : keyLen;
    const lpRaw = listpackBytes(entries, valLen, k);
    const lpAlloc = jemallocRound(lpRaw);
    const useListpack = entries <= CONST.HASH_MAX_LP_ENTRIES && k <= CONST.HASH_MAX_LP_VALUE && valLen <= CONST.HASH_MAX_LP_VALUE;
    // Hashtable equivalent: dict struct (~56B) + bucket array (pow2*8) + entries * (dictEntry 24B + key SDS + val SDS)
    const buckets = nextPow2(entries);
    const keySds = jemallocRound(CONST.SDSHDR8_BYTES + k + 1);
    const valSds = jemallocRound(CONST.SDSHDR8_BYTES + valLen + 1);
    const htTotal = 56 + buckets * 8 + entries * (CONST.DICT_ENTRY_BYTES + keySds + valSds);
    return {
      encoding: useListpack ? 'listpack' : 'hashtable',
      entries,
      valLen,
      lpRaw,
      lpAlloc,
      htTotal,
      activeBytes: useListpack ? lpAlloc : htTotal,
      buckets,
      ratio: htTotal / lpAlloc
    };
  }

  /* ── ch4: SipHash-1-2 (Redis dictGenHashFunction) / SipHash-2-4 & progressive dict rehash ── */
  const MASK64 = 0xffffffffffffffffn;
  function rotl64(x, b) { return ((x << BigInt(b)) | (x >> BigInt(64 - b))) & MASK64; }
  function u64le(bytes, off) {
    let v = 0n;
    for (let i = 0; i < 8; i++) v |= BigInt(bytes[off + i]) << BigInt(i * 8);
    return v;
  }
  function siphash(input, seedBytes, cRounds, dRounds) {
    const data = typeof input === 'string' ? utf8Bytes(input) : Uint8Array.from(input);
    const key = seedBytes ? Uint8Array.from(seedBytes) : new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const cR = cRounds == null ? 1 : cRounds; // Redis src/siphash.c defaults cROUNDS=1, dROUNDS=2
    const dR = dRounds == null ? 2 : dRounds;
    const k0 = u64le(key, 0), k1 = u64le(key, 8);
    let v0 = 0x736f6d6570736575n ^ k0;
    let v1 = 0x646f72616e646f6dn ^ k1;
    let v2 = 0x6c7967656e657261n ^ k0;
    let v3 = 0x7465646279746573n ^ k1;
    function sipround() {
      v0 = (v0 + v1) & MASK64; v1 = rotl64(v1, 13); v1 ^= v0; v0 = rotl64(v0, 32);
      v2 = (v2 + v3) & MASK64; v3 = rotl64(v3, 16); v3 ^= v2;
      v0 = (v0 + v3) & MASK64; v3 = rotl64(v3, 21); v3 ^= v0;
      v2 = (v2 + v1) & MASK64; v1 = rotl64(v1, 17); v1 ^= v2; v2 = rotl64(v2, 32);
    }
    const len = data.length;
    const end = len - (len % 8);
    for (let i = 0; i < end; i += 8) {
      const m = u64le(data, i);
      v3 ^= m;
      for (let r = 0; r < cR; r++) sipround();
      v0 ^= m;
    }
    let b = BigInt(len & 0xff) << 56n;
    for (let i = len - 1; i >= end; i--) b |= BigInt(data[i]) << BigInt((i - end) * 8);
    v3 ^= b;
    for (let r = 0; r < cR; r++) sipround();
    v0 ^= b;
    v2 ^= 0xffn;
    for (let r = 0; r < dR; r++) sipround();
    return (v0 ^ v1 ^ v2 ^ v3) & MASK64;
  }
  function rehashSim(opts) {
    const o = Object.assign({ numKeys: 10, step: 3, mode: 'prog' }, opts);
    const size0 = 8, size1 = 16;
    const ht0 = Array.from({ length: size0 }, () => []);
    const ht1 = Array.from({ length: size1 }, () => []);
    const seed = new Uint8Array([0x10, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0, 1, 2, 3, 4, 5, 6, 7]);
    for (let i = 0; i < o.numKeys; i++) {
      const k = 'key:' + i;
      const h = Number(siphash(k, seed, 1, 2) & 0xffffffffn);
      ht0[h & (size0 - 1)].push({ k, h });
    }
    let rehashidx = 0;
    const effectiveStep = o.mode === 'stw' ? (o.step > 0 ? size0 : 0) : Math.min(o.step, size0);
    // Simulate dictRehash(d, 1) one bucket index at a time (including empty bucket advances shown simply by bucket idx)
    for (let s = 0; s < effectiveStep; s++) {
      for (const item of ht0[s]) ht1[item.h & (size1 - 1)].push(item);
      ht0[s] = [];
      rehashidx = s + 1;
    }
    const done = rehashidx >= size0;
    const h0Count = ht0.reduce((a, b) => a + b.length, 0);
    const h1Count = ht1.reduce((a, b) => a + b.length, 0);
    // Scaled latency model: stop-the-world for 10M keys (~380 ms) vs 1 bucket (~1.4 us)
    const spikeUs = o.mode === 'stw' ? (o.step > 0 ? 380000 : 1.0) : (done ? 1.0 : 1.4);
    return { ht0, ht1, rehashidx: done ? -1 : rehashidx, bucketsMoved: effectiveStep, size0, size1, done, h0Count, h1Count, spikeUs, mode: o.mode, step: o.step };
  }

  /* ── ch5: ZSET dual structure: dict + zskiplist (t_zset.c) ── */
  function zslRandomLevel(rng) {
    let level = 1;
    while (rng() < CONST.ZSKIPLIST_P && level < CONST.ZSKIPLIST_MAXLEVEL) level++;
    return level;
  }
  function buildSkiplist(n, seed) {
    const rng = mulberry32(1337 + (seed || 1) * 7919);
    const maxLvl = CONST.ZSKIPLIST_MAXLEVEL;
    const header = { score: -Infinity, ele: 'HEAD', level: Array.from({ length: maxLvl }, () => ({ forward: null, span: 0 })), backward: null };
    let level = 1, length = 0, tail = null;
    const nodes = [];
    for (let i = 0; i < n; i++) {
      const score = (i + 1) * 10;
      const ele = 'u:' + (i + 1);
      const update = new Array(maxLvl).fill(header);
      const rank = new Array(maxLvl).fill(0);
      let x = header;
      for (let l = level - 1; l >= 0; l--) {
        rank[l] = l === level - 1 ? 0 : rank[l + 1];
        while (x.level[l].forward && (x.level[l].forward.score < score || (x.level[l].forward.score === score && x.level[l].forward.ele < ele))) {
          rank[l] += x.level[l].span;
          x = x.level[l].forward;
        }
        update[l] = x;
      }
      const lvl = zslRandomLevel(rng);
      if (lvl > level) {
        for (let l = level; l < lvl; l++) {
          rank[l] = 0;
          update[l] = header;
          update[l].level[l].span = length;
        }
        level = lvl;
      }
      const node = { idx: i, score, ele, height: lvl, level: Array.from({ length: lvl }, () => ({ forward: null, span: 0 })), backward: null };
      for (let l = 0; l < lvl; l++) {
        node.level[l].forward = update[l].level[l].forward;
        update[l].level[l].forward = node;
        node.level[l].span = update[l].level[l].span - (rank[0] - rank[l]);
        update[l].level[l].span = (rank[0] - rank[l]) + 1;
      }
      for (let l = lvl; l < level; l++) update[l].level[l].span++;
      node.backward = update[0] === header ? null : update[0];
      if (node.level[0].forward) node.level[0].forward.backward = node;
      else tail = node;
      length++;
      nodes.push(node);
    }
    return { header, tail, level, length, nodes };
  }
  function zslQueryRank(zsl, targetRank1) {
    const rank1 = Math.max(1, Math.min(zsl.length, targetRank1));
    const target = zsl.nodes[rank1 - 1];
    let x = zsl.header, spanSum = 0, hops = 0;
    const trail = [];
    for (let l = zsl.level - 1; l >= 0; l--) {
      while (x.level[l].forward && (x.level[l].forward.score < target.score || (x.level[l].forward.score === target.score && x.level[l].forward.ele <= target.ele))) {
        const next = x.level[l].forward;
        const sp = x.level[l].span;
        trail.push({ fromIdx: x === zsl.header ? -1 : x.idx, toIdx: next.idx, level: l, span: sp });
        spanSum += sp;
        x = next;
        hops++;
      }
      if (l > 0 && x !== target) trail.push({ fromIdx: x === zsl.header ? -1 : x.idx, toIdx: x === zsl.header ? -1 : x.idx, level: l, span: 0, drop: true });
    }
    return { target, rank: spanSum, hops, trail, maxLevel: zsl.level };
  }

  /* ── ch6: Redis 8 io-threads pipeline model ── */
  function ioThreadModel(opts) {
    const o = Object.assign({ ioThreads: 4, payloadBytes: 512, tls: false }, opts);
    // Analytical per-command CPU times (us):
    const parseReadBase = 0.65 + (o.payloadBytes / 512) * 0.45 + (o.tls ? 1.45 : 0);
    const writeBase = 0.55 + (o.payloadBytes / 512) * 0.40 + (o.tls ? 1.35 : 0);
    const execUs = 0.75; // strictly single-threaded main event loop execution
    const syncOverheadUs = o.ioThreads > 1 ? 0.14 : 0; // amortized per-cmd fan-out/join barrier across batch
    const t = Math.max(1, o.ioThreads);
    const parReadUs = parseReadBase / t;
    const parWriteUs = writeBase / t;
    const totalCycleUs = o.ioThreads === 1
      ? (parseReadBase + execUs + writeBase)
      : (Math.max(parReadUs, 0.1) + syncOverheadUs + execUs + Math.max(parWriteUs, 0.1));
    // Bottleneck: if single-threaded execUs > parallel (read + write), main core is bottleneck; else I/O threads
    const ioShare = (parReadUs + parWriteUs) / totalCycleUs;
    const bottleneck = (o.ioThreads === 1 || (parReadUs + parWriteUs) >= execUs) ? 'io' : 'core';
    const kops = 1000 / totalCycleUs;
    const curve = [];
    for (let i = 1; i <= 8; i++) {
      const cyc = i === 1 ? (parseReadBase + execUs + writeBase) : (parseReadBase / i + 0.14 + execUs + writeBase / i);
      curve.push({ t: i, kops: 1000 / cyc });
    }
    return { ioThreads: t, payloadBytes: o.payloadBytes, tls: !!o.tls, parseReadBase, writeBase, parReadUs, parWriteUs, execUs, totalCycleUs, ioShare, bottleneck, kops, curve };
  }

  /* ── ch7: BGSAVE fork() Copy-on-Write 4 KiB page faults & AOF ── */
  function cowSim(opts) {
    const o = Object.assign({ writePct: 50, skew: false, aof: 'everysec' }, opts);
    const totalPages = 64;
    const writes = Math.round((o.writePct / 100) * 96); // up to 96 mutations on 64 pages
    const rng = mulberry32(4242);
    const dirty = new Uint8Array(totalPages);
    for (let i = 0; i < writes; i++) {
      let page;
      if (o.skew) {
        // 90% of writes land in 7 hot pages (indices 0..6, ~11% of RAM)
        page = rng() < 0.9 ? Math.floor(rng() * 7) : Math.floor(rng() * totalPages);
      } else {
        page = Math.floor(rng() * totalPages);
      }
      dirty[page]++;
    }
    let copied = 0;
    for (let i = 0; i < totalPages; i++) if (dirty[i] > 0) copied++;
    const ramMult = 1 + copied / totalPages;
    const aofSpec = {
      always: { lossSec: 0, fsyncPerSec: 'every cmd', maxWaitMs: 2.0 },
      everysec: { lossSec: 1, fsyncPerSec: '1 / s', maxWaitMs: 1.0 },
      no: { lossSec: 30, fsyncPerSec: 'OS (~30 s)', maxWaitMs: 0.0 }
    }[o.aof || 'everysec'];
    return { totalPages, writes, dirty: Array.from(dirty), copied, skew: !!o.skew, ramMult, extraPct: (copied / totalPages) * 100, aof: o.aof || 'everysec', aofSpec };
  }

  /* ── ch8: Approximate LRU (maxmemory-samples), Morris 8-bit LFU, and activeExpireCycle ── */
  function approxLruSim(samples, poolSize) {
    const N = 200, P = poolSize || CONST.EVPOOL_SIZE, k = Math.max(1, Math.min(20, samples));
    const rng = mulberry32(8080);
    // Simulate 80 evictions from 200 keys with persistent pool of P oldest candidates
    // Keys 0..199 ordered from oldest (0) to newest (199)
    let pool = [];
    const ranks = [];
    const alive = new Set(Array.from({ length: N }, (_, i) => i));
    for (let ev = 0; ev < 80; ev++) {
      const arr = Array.from(alive);
      for (let s = 0; s < k; s++) {
        const pick = arr[Math.floor(rng() * arr.length)];
        if (!pool.includes(pick)) pool.push(pick);
      }
      pool = pool.filter(x => alive.has(x)).sort((a, b) => a - b).slice(0, P);
      const victim = pool.shift();
      alive.delete(victim);
      // Rank of victim among currently alive keys (0 = oldest, 1 = newest)
      const remainingSorted = Array.from(alive).sort((a, b) => a - b);
      let pos = 0;
      while (pos < remainingSorted.length && remainingSorted[pos] < victim) pos++;
      ranks.push(pos / (remainingSorted.length + 1));
    }
    const meanPct = (ranks.reduce((a, b) => a + b, 0) / ranks.length) * 100;
    return { samples: k, meanErrPct: meanPct, savedMbPerMillion: 16 }; // saves prev* + next* = 16 B/key = 16 MB/1M keys
  }
  function approxLruCurve() {
    const out = [];
    for (let k = 1; k <= 20; k++) out.push({ k, errPct: approxLruSim(k, 16).meanErrPct });
    return out;
  }
  function morrisProb(counter, factor) {
    if (counter >= 255) return 0;
    const base = Math.max(0, counter - CONST.LFU_INIT_VAL);
    return 1.0 / (base * factor + 1);
  }
  function morrisExpectedHits(targetCounter, factor) {
    let hits = 0;
    for (let c = CONST.LFU_INIT_VAL; c < targetCounter; c++) hits += (c - CONST.LFU_INIT_VAL) * factor + 1;
    return hits;
  }
  function morrisExpectedCounter(hits, factor) {
    let cum = 0, c = CONST.LFU_INIT_VAL;
    while (c < 255) {
      const step = (c - CONST.LFU_INIT_VAL) * factor + 1;
      if (cum + step > hits) break;
      cum += step;
      c++;
    }
    return c;
  }
  function morrisMonteCarlo(hits, factor, trials, seed) {
    const rng = mulberry32(seed || 991);
    let sum = 0;
    for (let t = 0; t < trials; t++) {
      let c = CONST.LFU_INIT_VAL;
      for (let h = 0; h < hits; h++) {
        if (c < 255 && rng() < morrisProb(c, factor)) c++;
      }
      sum += c;
    }
    return sum / trials;
  }
  function activeExpireSim(initialPct, effortSetting) {
    const effort = Math.max(1, Math.min(10, effortSetting)) - 1; // 0..9 as in expire.c
    const keysPerLoop = CONST.ACTIVE_EXPIRE_KEYS_PER_LOOP + Math.floor(CONST.ACTIVE_EXPIRE_KEYS_PER_LOOP / 4) * effort;
    const acceptableStale = CONST.ACTIVE_EXPIRE_ACCEPTABLE_STALE - effort;
    const totalKeys = 1000;
    let expiredCount = Math.round((initialPct / 100) * totalKeys);
    const rng = mulberry32(5511 + Math.round(initialPct) * 13 + effort);
    let loops = 0, sampled = 0, freed = 0;
    const trace = [{ loop: 0, expiredPct: (expiredCount / totalKeys) * 100 }];
    // Redis caps one cycle by timelimit (~1ms fast / 25% slow); model caps at 20 loops for clarity
    for (let l = 1; l <= 20; l++) {
      loops = l;
      let batchExpired = 0;
      const n = Math.min(keysPerLoop, totalKeys);
      for (let i = 0; i < n; i++) {
        sampled++;
        if (rng() < expiredCount / totalKeys) {
          batchExpired++;
          if (expiredCount > 0) { expiredCount--; freed++; }
        }
      }
      const sampleStalePct = (batchExpired / n) * 100;
      trace.push({ loop: l, expiredPct: (expiredCount / totalKeys) * 100, sampleStalePct });
      if (sampleStalePct <= acceptableStale) break;
    }
    return {
      effortSetting: effort + 1,
      keysPerLoop,
      acceptableStale,
      loops,
      sampled,
      freed,
      remainingPct: (expiredCount / totalKeys) * 100,
      trace
    };
  }

  /* ── ch9: Cluster CRC16(key) mod 16384, {hash-tag}, and reverse-binary SCAN cursor ── */
  function crc16(input) {
    const buf = typeof input === 'string' ? utf8Bytes(input) : Uint8Array.from(input);
    let crc = 0x0000;
    for (let i = 0; i < buf.length; i++) {
      crc ^= (buf[i] << 8) & 0xffff;
      for (let b = 0; b < 8; b++) {
        crc = (crc & 0x8000) ? (((crc << 1) ^ 0x1021) & 0xffff) : ((crc << 1) & 0xffff);
      }
    }
    return crc;
  }
  function extractHashTag(key) {
    const s = String(key);
    const open = s.indexOf('{');
    if (open !== -1) {
      const close = s.indexOf('}', open + 1);
      if (close > open + 1) return { tag: s.slice(open + 1, close), usedTag: true, start: open + 1, end: close };
    }
    return { tag: s, usedTag: false, start: 0, end: s.length };
  }
  function keyHashSlot(key) {
    const ex = extractHashTag(key);
    const hashVal = crc16(ex.tag);
    return { key: String(key), tag: ex.tag, usedTag: ex.usedTag, crc16: hashVal, slot: hashVal & (CONST.CLUSTER_SLOTS - 1) };
  }
  function clusterRoute(key, shards, migrating) {
    const info = keyHashSlot(key);
    const n = Math.max(3, Math.min(6, shards || 3));
    const per = CONST.CLUSTER_SLOTS / n;
    const owner = Math.min(n - 1, Math.floor(info.slot / per));
    const target = (owner + 1) % n;
    return {
      key: info.key,
      tag: info.tag,
      usedTag: info.usedTag,
      crc16: info.crc16,
      slot: info.slot,
      shards: n,
      owner,
      target,
      migrating: !!migrating,
      redirect: migrating ? 'ASK' : 'MOVED'
    };
  }

  // Exact dictScan reverse-binary cursor increment over width W bits (or 32-bit unsigned)
  function revBits(v, bits) {
    let r = 0;
    for (let i = 0; i < bits; i++) {
      if ((v >>> i) & 1) r |= (1 << (bits - 1 - i));
    }
    return r >>> 0;
  }
  function dictScanNextCursor(v, mask) {
    // Redis dict.c: v |= ~m0; v = rev(v); v++; v = rev(v); (32-bit unsigned)
    let x = (v | (~mask)) >>> 0;
    x = revBits(x, 32);
    x = (x + 1) >>> 0;
    x = revBits(x, 32);
    return x;
  }
  function simulateScan(opts) {
    const o = Object.assign({ resize: 'none', step: 8 }, opts);
    // Keys 0..15 with distinct low 4 bits of hash so every bucket 0..15 holds 1 key
    const keys = Array.from({ length: 16 }, (_, i) => ({ id: 'k' + i, h: i }));
    let tableSize = o.resize === 'shrink' ? 16 : 8;
    let mask = tableSize - 1;
    let cursor = 0;
    const visits = [];
    const seen = new Map();
    let stepNum = 0;
    do {
      stepNum++;
      // Mid-scan resize at step 4
      if (o.resize === 'double' && stepNum === 4) { tableSize = 16; mask = 15; }
      if (o.resize === 'shrink' && stepNum === 4) { tableSize = 8; mask = 7; }
      const bucket = cursor & mask;
      const found = keys.filter(k => (k.h & mask) === bucket).map(k => k.id);
      for (const id of found) seen.set(id, (seen.get(id) || 0) + 1);
      visits.push({ step: stepNum, cursor, bucket, tableSize, found });
      cursor = dictScanNextCursor(cursor, mask);
    } while (cursor !== 0 && stepNum < 32);
    const activeCount = Math.min(o.step, visits.length);
    const activeVisits = visits.slice(0, activeCount);
    const seenSoFar = new Set();
    let duplicates = 0;
    for (const v of activeVisits) {
      for (const id of v.found) {
        if (seenSoFar.has(id)) duplicates++;
        seenSoFar.add(id);
      }
    }
    const missedOnFull = keys.filter(k => !seen.has(k.id)).length;
    return {
      resize: o.resize,
      visits,
      activeCount,
      totalSteps: visits.length,
      visitedBuckets: activeVisits.map(v => v.bucket),
      seenCount: seenSoFar.size,
      totalKeys: keys.length,
      duplicates,
      missedOnFull,
      finished: activeCount >= visits.length
    };
  }

  return {
    CONST,
    LOOP_DEFAULTS,
    fmt, fmtInt, bytesStr, utf8Bytes, mulberry32,
    eventLoopModel,
    respEncode, respDecode, respSample, pipelineStats,
    jemallocRound, stringMemory, listpackEntryBytes, listpackBytes, hashMemory,
    siphash, rehashSim,
    zslRandomLevel, buildSkiplist, zslQueryRank,
    ioThreadModel,
    cowSim,
    approxLruSim, approxLruCurve, morrisProb, morrisExpectedHits, morrisExpectedCounter, morrisMonteCarlo, activeExpireSim,
    crc16, extractHashTag, keyHashSlot, clusterRoute, revBits, dictScanNextCursor, simulateScan
  };
}));
