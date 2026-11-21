(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PostgresQueryModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── Pinned PostgreSQL 17.6 / 18.0 constants (from PostgreSQL source headers) ── */
  const PG = {
    BLCKSZ: 8192,                      // src/include/pg_config_manual.h
    PAGE_HEADER_SIZE: 24,              // sizeof(PageHeaderData), src/include/storage/bufpage.h
    ITEM_ID_SIZE: 4,                   // sizeof(ItemIdData), src/include/storage/itemid.h
    HEAP_TUPLE_FIXED: 23,              // offsetof(HeapTupleHeaderData, t_bits), src/include/access/htup_details.h
    HEAP_TUPLE_ALIGNED: 24,            // MAXALIGN(23) on 64-bit platforms
    MAXALIGN: 8,                       // MAXIMUM_ALIGNOF = 8
    BT_OPAQUE_SIZE: 16,                // sizeof(BTPageOpaqueData), src/include/access/nbtree.h
    PAGE_LAYOUT_VERSION: 4,            // PG_PAGE_LAYOUT_VERSION = 4 (pd_pagesize_version = 0x2004 = 8196)
    SEQ_PAGE_COST: 1.0,                // src/backend/optimizer/path/costsize.c
    RANDOM_PAGE_COST: 4.0,             // src/backend/optimizer/path/costsize.c
    CPU_TUPLE_COST: 0.01,              // src/backend/optimizer/path/costsize.c
    CPU_INDEX_TUPLE_COST: 0.005,       // src/backend/optimizer/path/costsize.c
    CPU_OPERATOR_COST: 0.0025,         // src/backend/optimizer/path/costsize.c
    BM_MAX_USAGE_COUNT: 5,             // src/include/storage/buf_internals.h
    RING_BULKREAD_FRAMES: 32,          // 256 KiB / 8192 B (src/backend/storage/buffer/freelist.c)
    XID_MOD: 4294967296,               // 2^32
    XID_HALF: 2147483648,              // 2^31
    AUTOVACUUM_FREEZE_MAX_AGE: 200000000, // 200M XIDs
    XID_STOP_OFFSET: 3000000,          // ~3M buffer before 2^31 wraparound (varsup.c)
    WAL_SEG_BYTES: 16 * 1024 * 1024,   // 16 MiB default WAL segment
    CRC32C_POLY_REFLECTED: 0x82f63b78  // Castagnoli polynomial (src/port/pg_crc32c_sb8.c)
  };

  /* ── Formatting helpers ── */
  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    const dec = d == null ? 0 : d;
    return Number(x).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
  }

  function sig(x, n) {
    if (!isFinite(x)) return '∞';
    if (x === 0) return '0';
    return Number(x.toPrecision(n || 3)).toString();
  }

  function bytesStr(b) {
    if (b >= 1048576) return (b / 1048576).toFixed(2) + ' MiB';
    if (b >= 1024) return (b / 1024).toFixed(1) + ' KiB';
    return Math.round(b) + ' B';
  }

  function maxAlign(n) {
    return (n + (PG.MAXALIGN - 1)) & ~(PG.MAXALIGN - 1);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── Binary Page Header & ItemId packing (src/include/storage/bufpage.h & itemid.h) ── */
  function packPageHeader(h) {
    const buf = new Uint8Array(PG.PAGE_HEADER_SIZE);
    const dv = new DataView(buf.buffer);
    const lsnHi = (h.lsnHi != null ? h.lsnHi : 0) >>> 0;
    const lsnLo = (h.lsnLo != null ? h.lsnLo : 0) >>> 0;
    dv.setUint32(0, lsnHi, true);
    dv.setUint32(4, lsnLo, true);
    dv.setUint16(8, (h.checksum || 0) & 0xffff, true);
    dv.setUint16(10, (h.flags || 0) & 0xffff, true);
    dv.setUint16(12, h.lower & 0xffff, true);
    dv.setUint16(14, h.upper & 0xffff, true);
    dv.setUint16(16, (h.special != null ? h.special : PG.BLCKSZ) & 0xffff, true);
    const psv = (PG.BLCKSZ & 0xff00) | (PG.PAGE_LAYOUT_VERSION & 0x00ff);
    dv.setUint16(18, h.pagesizeVersion != null ? h.pagesizeVersion : psv, true);
    dv.setUint32(20, (h.pruneXid || 0) >>> 0, true);
    return buf;
  }

  function unpackPageHeader(buf) {
    const dv = new DataView(buf.buffer, buf.byteOffset, PG.PAGE_HEADER_SIZE);
    const psv = dv.getUint16(18, true);
    return {
      lsnHi: dv.getUint32(0, true),
      lsnLo: dv.getUint32(4, true),
      checksum: dv.getUint16(8, true),
      flags: dv.getUint16(10, true),
      lower: dv.getUint16(12, true),
      upper: dv.getUint16(14, true),
      special: dv.getUint16(16, true),
      pagesize: psv & 0xff00,
      layoutVersion: psv & 0x00ff,
      pruneXid: dv.getUint32(20, true)
    };
  }

  function packItemId(off, flags, len) {
    return ((off & 0x7fff) | ((flags & 0x3) << 15) | ((len & 0x7fff) << 17)) >>> 0;
  }

  function unpackItemId(word) {
    const w = word >>> 0;
    return {
      lp_off: w & 0x7fff,
      lp_flags: (w >>> 15) & 0x3,
      lp_len: (w >>> 17) & 0x7fff
    };
  }

  function tupleAlignedSize(payloadBytes, hasNullBitmap, ncols) {
    const nbits = hasNullBitmap ? Math.ceil((ncols || 8) / 8) : 0;
    const hoff = maxAlign(PG.HEAP_TUPLE_FIXED + nbits);
    return {
      hoff,
      payloadAligned: maxAlign(payloadBytes),
      total: hoff + maxAlign(payloadBytes)
    };
  }

  /* ── Ch2: Planner Cost Model (costsize.c + Mackert-Lohman 1989) ── */
  function mackertLohman(pages, tuplesFetched, effCachePages) {
    const T = Math.max(1, pages);
    const N = Math.max(0, tuplesFetched);
    const b = Math.max(1, effCachePages);
    if (N <= 0) return 0;
    if (T <= b) {
      return Math.min(T, (2 * T * N) / (2 * T + N));
    }
    const lim = (2 * T * b) / (2 * T - b);
    if (N <= lim) {
      return (2 * T * N) / (2 * T + N);
    }
    return b + ((N - lim) * (2 * T - b)) / (2 * T);
  }

  function plannerCosts(opts) {
    const o = Object.assign({
      tablePages: 10000,
      tuplesPerPage: 40,
      selectivity: 0.03,
      randomPageCost: PG.RANDOM_PAGE_COST,
      seqPageCost: PG.SEQ_PAGE_COST,
      effCachePages: 3000,
      allVisible: false,
      treeHeight: 3,
      indexTuplesPerPage: 200
    }, opts || {});

    const totalTuples = o.tablePages * o.tuplesPerPage;
    const rows = Math.max(1, totalTuples * o.selectivity);
    const indexLeafPages = Math.max(1, Math.ceil(totalTuples / o.indexTuplesPerPage));
    const idxLeafVisited = Math.max(1, Math.ceil(indexLeafPages * o.selectivity));

    // 1. Sequential Scan (cost_seqscan)
    const seqCost = o.tablePages * o.seqPageCost + totalTuples * (PG.CPU_TUPLE_COST + PG.CPU_OPERATOR_COST);

    // 2. Index Scan (cost_index with Mackert-Lohman heap fetches, unclustered)
    const idxTreeCost = (o.treeHeight - 1 + idxLeafVisited) * o.randomPageCost;
    const idxCpuCost = rows * (PG.CPU_INDEX_TUPLE_COST + PG.CPU_OPERATOR_COST);
    const mlHeapPages = mackertLohman(o.tablePages, rows, o.effCachePages);
    const idxHeapCost = mlHeapPages * o.randomPageCost + rows * PG.CPU_TUPLE_COST;
    const indexCost = idxTreeCost + idxCpuCost + idxHeapCost;

    // 3. Bitmap Heap Scan (deduplicates block IDs, pays bitmap setup cost, scans blocks in physical order)
    const distinctHeapPages = o.tablePages * (1 - Math.pow(1 - 1 / o.tablePages, rows));
    const density = Math.min(1, distinctHeapPages / o.tablePages);
    // cost_bitmap_heap_scan blends random_page_cost -> seq_page_cost as density grows, plus TID bitmap construction
    const costPerBitmapPage = o.randomPageCost - (o.randomPageCost - o.seqPageCost) * Math.sqrt(density);
    const bitmapBuildOverhead = 220 + rows * 0.08;
    const bitmapHeapCost =
      bitmapBuildOverhead +
      (o.treeHeight - 1 + idxLeafVisited) * o.randomPageCost +
      rows * (PG.CPU_INDEX_TUPLE_COST + PG.CPU_OPERATOR_COST) +
      distinctHeapPages * costPerBitmapPage +
      rows * PG.CPU_TUPLE_COST;

    // 4. Index-Only Scan (skips heap fetches for pages marked all-visible in Visibility Map)
    const vmFrac = o.allVisible ? 1.0 : 0.0;
    const iosHeapFetches = mlHeapPages * (1 - vmFrac);
    const indexOnlyCost =
      idxTreeCost +
      rows * (PG.CPU_INDEX_TUPLE_COST + PG.CPU_OPERATOR_COST) +
      iosHeapFetches * o.randomPageCost +
      rows * (vmFrac ? PG.CPU_INDEX_TUPLE_COST : PG.CPU_TUPLE_COST);

    const candidates = [
      { id: 'seq', cost: seqCost },
      { id: 'index', cost: indexCost },
      { id: 'bitmap', cost: bitmapHeapCost }
    ];
    if (o.allVisible) candidates.push({ id: 'indexonly', cost: indexOnlyCost });
    candidates.sort((a, b) => a.cost - b.cost);
    const winner = candidates[0].id;

    // Find crossover selectivity where Seq Scan beats Bitmap Heap Scan (and where Bitmap beats Index Scan)
    let crossSeqVsBitmap = null;
    for (let p = 0.001; p <= 0.6; p += 0.001) {
      const r = Math.max(1, totalTuples * p);
      const il = Math.max(1, Math.ceil(indexLeafPages * p));
      const dp = o.tablePages * (1 - Math.pow(1 - 1 / o.tablePages, r));
      const dn = Math.min(1, dp / o.tablePages);
      const cp = o.randomPageCost - (o.randomPageCost - o.seqPageCost) * Math.sqrt(dn);
      const bc = 220 + r * 0.08 + (o.treeHeight - 1 + il) * o.randomPageCost + r * (PG.CPU_INDEX_TUPLE_COST + PG.CPU_OPERATOR_COST) + dp * cp + r * PG.CPU_TUPLE_COST;
      if (bc >= seqCost) { crossSeqVsBitmap = p; break; }
    }

    let crossIdxVsBitmap = null;
    for (let p = 0.0005; p <= 0.25; p += 0.0005) {
      const r = Math.max(1, totalTuples * p);
      const il = Math.max(1, Math.ceil(indexLeafPages * p));
      const ml = mackertLohman(o.tablePages, r, o.effCachePages);
      const ic = (o.treeHeight - 1 + il) * o.randomPageCost + r * (PG.CPU_INDEX_TUPLE_COST + PG.CPU_OPERATOR_COST) + ml * o.randomPageCost + r * PG.CPU_TUPLE_COST;
      const dp = o.tablePages * (1 - Math.pow(1 - 1 / o.tablePages, r));
      const dn = Math.min(1, dp / o.tablePages);
      const cp = o.randomPageCost - (o.randomPageCost - o.seqPageCost) * Math.sqrt(dn);
      const bc = 220 + r * 0.08 + (o.treeHeight - 1 + il) * o.randomPageCost + r * (PG.CPU_INDEX_TUPLE_COST + PG.CPU_OPERATOR_COST) + dp * cp + r * PG.CPU_TUPLE_COST;
      if (bc < ic) { crossIdxVsBitmap = p; break; }
    }

    return {
      selectivity: o.selectivity,
      randomPageCost: o.randomPageCost,
      allVisible: !!o.allVisible,
      rows: Math.round(rows),
      tablePages: o.tablePages,
      seqCost,
      indexCost,
      bitmapCost: bitmapHeapCost,
      indexOnlyCost,
      mlHeapPages: Math.round(mlHeapPages),
      distinctHeapPages: Math.round(distinctHeapPages),
      winner,
      crossSeqVsBitmap,
      crossIdxVsBitmap
    };
  }

  function correlationMismatch(correlated) {
    // Two columns each with p = 0.10 selectivity; independent est = 0.01 vs correlated actual = 0.095
    const pA = 0.10, pB = 0.10, N = 400000;
    const estSelectivity = correlated ? 0.095 : pA * pB;
    const actualSelectivity = 0.095;
    return {
      estRows: Math.round(N * estSelectivity),
      actualRows: Math.round(N * actualSelectivity),
      ratio: actualSelectivity / estSelectivity
    };
  }

  /* ── Ch3: Slotted 8 KiB Page & HOT Simulator ── */
  function createEmptyPage(fillfactor) {
    const ff = Math.max(40, Math.min(100, fillfactor || 80));
    const usable = PG.BLCKSZ - PG.PAGE_HEADER_SIZE;
    const insertLimit = PG.PAGE_HEADER_SIZE + Math.floor(usable * ((100 - ff) / 100));
    return {
      fillfactor: ff,
      lower: PG.PAGE_HEADER_SIZE,
      upper: PG.BLCKSZ,
      special: PG.BLCKSZ,
      insertMinUpper: insertLimit,
      slots: [],       // { id, off, len, status: 'LIVE'|'DEAD'|'HOT_DEAD', xid, ctidNext, hot }
      indexWrites: 1,  // 1 initial index entry per base insert
      hotUpdates: 0,
      nonHotUpdates: 0,
      offPageCount: 0,
      nextXid: 100
    };
  }

  function applyPageOp(page, op, payloadBytes, indexedChanged) {
    const tSize = tupleAlignedSize(payloadBytes || 64, false, 4).total;
    const needInsert = tSize + PG.ITEM_ID_SIZE;
    const freeBytes = page.upper - page.lower;

    if (op === 'INSERT') {
      // Inserts respect fillfactor headroom (stop inserting new rows once free space drops below (100 - fillfactor)%)
      const minReserve = Math.floor((PG.BLCKSZ - PG.PAGE_HEADER_SIZE) * (1 - page.fillfactor / 100));
      if (freeBytes - needInsert < minReserve) {
        page.offPageCount++;
        page.indexWrites++;
        page.nextXid++;
        return { kind: 'OFFPAGE_INSERT', hot: false, fits: false };
      }
      const newLower = page.lower + PG.ITEM_ID_SIZE;
      const newUpper = page.upper - tSize;
      const id = page.slots.length + 1;
      page.slots.push({
        id,
        off: newUpper,
        len: tSize,
        status: 'LIVE',
        xmin: page.nextXid++,
        xmax: 0,
        hot: false,
        ctidNext: null
      });
      page.lower = newLower;
      page.upper = newUpper;
      page.indexWrites++;
      return { kind: 'INSERT', id, hot: false, fits: true };
    }

    if (op === 'UPDATE') {
      // Find latest LIVE slot on this page
      let target = null;
      for (let i = page.slots.length - 1; i >= 0; i--) {
        if (page.slots[i].status === 'LIVE') { target = page.slots[i]; break; }
      }
      if (!target) return { kind: 'NO_LIVE_ROW', hot: false, fits: false };

      // Updates can use the full remaining freeBytes (down to lower + ITEM_ID + tuple <= upper)
      const fitsSamePage = freeBytes >= needInsert;
      const canHot = fitsSamePage && !indexedChanged;
      const xid = page.nextXid++;
      target.xmax = xid;
      target.status = canHot ? 'HOT_DEAD' : 'DEAD';

      if (fitsSamePage) {
        const newLower = page.lower + PG.ITEM_ID_SIZE;
        const newUpper = page.upper - tSize;
        const id = page.slots.length + 1;
        target.ctidNext = id;
        page.slots.push({
          id,
          off: newUpper,
          len: tSize,
          status: 'LIVE',
          xmin: xid,
          xmax: 0,
          hot: canHot,
          ctidNext: null
        });
        page.lower = newLower;
        page.upper = newUpper;
        if (canHot) {
          page.hotUpdates++;
          return { kind: 'HOT_UPDATE', from: target.id, to: id, hot: true, fits: true };
        } else {
          page.nonHotUpdates++;
          page.indexWrites++;
          return { kind: 'SAME_PAGE_NONHOT', from: target.id, to: id, hot: false, fits: true };
        }
      } else {
        target.ctidNext = 'P2';
        page.offPageCount++;
        page.nonHotUpdates++;
        page.indexWrites++;
        return { kind: 'OFFPAGE_UPDATE', from: target.id, hot: false, fits: false };
      }
    }
    return { kind: 'NOOP', hot: false, fits: true };
  }

  function simulatePageSequence(opts) {
    const o = Object.assign({
      payloadBytes: 64,
      fillfactor: 80,
      indexedChanged: false,
      ops: ['INSERT', 'INSERT', 'INSERT', 'UPDATE', 'UPDATE']
    }, opts || {});

    const page = createEmptyPage(o.fillfactor);
    page.indexWrites = 0;
    let lastOp = null;
    for (const op of o.ops) {
      lastOp = applyPageOp(page, op, o.payloadBytes, !!o.indexedChanged);
    }
    const liveCount = page.slots.filter(s => s.status === 'LIVE').length;
    const deadCount = page.slots.length - liveCount;
    const freeBytes = page.upper - page.lower;
    const tupleBytes = PG.BLCKSZ - page.upper;
    const linePtrBytes = page.lower - PG.PAGE_HEADER_SIZE;
    const header = packPageHeader({
      lsnHi: 0,
      lsnLo: page.nextXid * 64,
      lower: page.lower,
      upper: page.upper,
      special: page.special,
      pruneXid: deadCount > 0 ? 103 : 0
    });

    // Mode flag: why did updates trigger or avoid index writes?
    let mode = 'hot';
    if (o.indexedChanged) mode = 'indexed_col';
    else if (page.offPageCount > 0) mode = 'page_full';

    return {
      fillfactor: page.fillfactor,
      payloadBytes: o.payloadBytes,
      indexedChanged: !!o.indexedChanged,
      tupleSize: tupleAlignedSize(o.payloadBytes, false, 4).total,
      lower: page.lower,
      upper: page.upper,
      special: page.special,
      freeBytes,
      linePtrBytes,
      tupleBytes,
      slots: page.slots,
      liveCount,
      deadCount,
      hotUpdates: page.hotUpdates,
      nonHotUpdates: page.nonHotUpdates,
      offPageCount: page.offPageCount,
      indexWrites: page.indexWrites,
      headerBytes: Array.from(header),
      lastOp,
      mode
    };
  }

  /* ── Ch4: MVCC Snapshot Visibility (procarray.c / heapam_visibility.c) ── */
  function xidVisibleToSnapshot(xid, statusMap, snap) {
    if (!xid || xid === 0) return false;
    const st = statusMap[xid];
    if (st === 'ABORTED') return false;
    if (st === 'IN_PROGRESS') return xid === snap.selfXid;
    if (st !== 'COMMITTED') return false;
    // Frozen XID (2) is always visible
    if (xid === 2) return true;
    if (xid < snap.xmin) return true;
    if (xid >= snap.xmax) return false;
    return !snap.xip.includes(xid);
  }

  function tupleSatisfiesMVCC(tup, statusMap, snap) {
    const xminVis = xidVisibleToSnapshot(tup.xmin, statusMap, snap);
    if (!xminVis) {
      const xminStatus = statusMap[tup.xmin] || 'UNKNOWN';
      const reason = xminStatus === 'ABORTED' ? 'xmin_aborted'
        : xminStatus === 'IN_PROGRESS' ? 'xmin_in_progress'
        : 'xmin_after_snap';
      return { visible: false, reason, xminVis: false, xmaxVis: false };
    }
    if (!tup.xmax || tup.xmax === 0) {
      return { visible: true, reason: 'live_no_xmax', xminVis: true, xmaxVis: false };
    }
    const xmaxVis = xidVisibleToSnapshot(tup.xmax, statusMap, snap);
    if (!xmaxVis) {
      const xmaxStatus = statusMap[tup.xmax] || 'UNKNOWN';
      const reason = xmaxStatus === 'ABORTED' ? 'xmax_aborted_still_live'
        : xmaxStatus === 'IN_PROGRESS' ? 'xmax_in_progress_still_live'
        : 'xmax_after_snap_still_live';
      return { visible: true, reason, xminVis: true, xmaxVis: false };
    }
    return { visible: false, reason: 'deleted_by_visible_xmax', xminVis: true, xmaxVis: true };
  }

  function mvccScenario(opts) {
    const o = Object.assign({
      isolation: 'rc', // 'rc' = READ COMMITTED, 'rr' = REPEATABLE READ
      step: 2,         // 1..3
      showHint: true
    }, opts || {});

    const step = Math.max(1, Math.min(3, Math.round(o.step)));
    // Timeline:
    // T100: committed before T101 starts (inserted v1 = $500)
    // T101: Reader (BEGIN at t=1)
    // T102: Writer A (updates v1 -> v2 = $400; IN_PROGRESS at t=1, COMMITTED at t>=2)
    // T103: Writer B (inserts v3 = $999; IN_PROGRESS at t<=2, ABORTED at t=3)
    // T104: Writer C (updates v2 -> v4 = $350; not started at t=1, IN_PROGRESS at t=2,3)
    const statusAtStep = {
      1: { 100: 'COMMITTED', 101: 'IN_PROGRESS', 102: 'IN_PROGRESS', 103: 'IN_PROGRESS', 104: 'NOT_STARTED' },
      2: { 100: 'COMMITTED', 101: 'IN_PROGRESS', 102: 'COMMITTED',   103: 'IN_PROGRESS', 104: 'IN_PROGRESS' },
      3: { 100: 'COMMITTED', 101: 'IN_PROGRESS', 102: 'COMMITTED',   103: 'ABORTED',     104: 'IN_PROGRESS' }
    }[step];

    // Snapshots taken at each step
    const snapAt = {
      1: { xmin: 101, xmax: 104, xip: [101, 102, 103], selfXid: 101 },
      2: { xmin: 101, xmax: 105, xip: [101, 103, 104], selfXid: 101 },
      3: { xmin: 101, xmax: 105, xip: [101, 104],      selfXid: 101 }
    };

    const snap = o.isolation === 'rr' ? snapAt[1] : snapAt[step];
    const tuples = [
      { id: 'v1', val: 500, xmin: 100, xmax: step >= 1 ? 102 : 0, hintXmin: 'COMMITTED', hintXmax: statusAtStep[102] === 'COMMITTED' ? 'COMMITTED' : 'NONE' },
      { id: 'v2', val: 400, xmin: 102, xmax: step >= 2 ? 104 : 0, hintXmin: statusAtStep[102] === 'COMMITTED' ? 'COMMITTED' : 'NONE', hintXmax: 'NONE' },
      { id: 'v3', val: 999, xmin: 103, xmax: 0,                   hintXmin: statusAtStep[103] === 'ABORTED' ? 'INVALID' : 'NONE',   hintXmax: 'INVALID' },
      { id: 'v4', val: 350, xmin: step >= 2 ? 104 : 0, xmax: 0,   hintXmin: 'NONE', hintXmax: 'INVALID' }
    ];

    const evaluated = tuples.map(tp => {
      const res = tp.xmin ? tupleSatisfiesMVCC(tp, statusAtStep, snap) : { visible: false, reason: 'not_created_yet', xminVis: false, xmaxVis: false };
      return Object.assign({}, tp, res);
    });
    const visibleRow = evaluated.find(t => t.visible) || null;

    return {
      isolation: o.isolation,
      step,
      showHint: !!o.showHint,
      statusMap: statusAtStep,
      snap,
      tuples: evaluated,
      visibleId: visibleRow ? visibleRow.id : 'none',
      visibleVal: visibleRow ? visibleRow.val : 0
    };
  }

  /* ── Ch5: VACUUM, FREEZE & 32-bit Modular XID Wraparound ── */
  function xidPrecedes(a, b) {
    // Normal XIDs >= 3: PostgreSQL TransactionIdPrecedes returns ((int32)(id1 - id2)) < 0
    const diff = ((a >>> 0) - (b >>> 0)) | 0;
    return diff < 0;
  }

  function xidAge(oldestXid, currentXid) {
    return ((currentXid >>> 0) - (oldestXid >>> 0)) >>> 0;
  }

  function vacuumWraparoundSim(opts) {
    const o = Object.assign({
      ageMillion: 250,   // 0..2200 (million XIDs elapsed since oldest unfrozen row)
      vacuumMode: 'off', // 'off' | 'normal' | 'freeze'
      deadPer100M: 12    // % dead tuple accumulation per 100M XIDs without vacuum
    }, opts || {});

    const elapsedM = Math.max(0, Math.min(2200, Math.round(o.ageMillion)));
    const startXid = 1000000;
    const currentXid = (startXid + elapsedM * 1000000) >>> 0;
    let oldestUnfrozenXid = startXid;
    let deadPct = Math.min(82, (elapsedM / 100) * (o.deadPer100M * 1.4));
    let vmPct = Math.max(5, 95 - deadPct * 1.1);
    let frozenCount = 0;

    if (o.vacuumMode === 'normal') {
      // Normal autovacuum cleans dead tuples & advances VM, AND anti-wraparound vacuum triggers at 200M
      deadPct = elapsedM === 0 ? 0 : Math.min(18, 4 + ((elapsedM / 50) % 3) * 4);
      vmPct = Math.max(76, 96 - deadPct * 0.8);
      const age = xidAge(oldestUnfrozenXid, currentXid);
      if (age >= PG.AUTOVACUUM_FREEZE_MAX_AGE) {
        const keepM = Math.max(0, elapsedM - 150);
        oldestUnfrozenXid = (startXid + keepM * 1000000) >>> 0;
        frozenCount = Math.floor(age / PG.AUTOVACUUM_FREEZE_MAX_AGE);
      }
    } else if (o.vacuumMode === 'freeze') {
      deadPct = elapsedM === 0 ? 0 : 4;
      vmPct = elapsedM === 0 ? 100 : 98;
      oldestUnfrozenXid = currentXid;
      frozenCount = Math.floor(elapsedM / 50);
    }

    const age = xidAge(oldestUnfrozenXid, currentXid);
    const stopAge = PG.XID_HALF - PG.XID_STOP_OFFSET; // ~2,144,483,648
    const precedesOk = xidPrecedes(oldestUnfrozenXid, currentXid) || oldestUnfrozenXid === currentXid;

    let status = 'healthy';
    if (!precedesOk || age >= PG.XID_HALF) status = 'wrapped';
    else if (age >= stopAge) status = 'stoplimit';
    else if (age >= PG.AUTOVACUUM_FREEZE_MAX_AGE) status = 'antiwrap';

    return {
      elapsedM,
      vacuumMode: o.vacuumMode,
      currentXid,
      oldestUnfrozenXid,
      age,
      ageMillion: age / 1e6,
      deadPct,
      vmPct,
      frozenCount,
      precedesOk,
      status,
      halfLimit: PG.XID_HALF,
      stopAge,
      freezeMaxAge: PG.AUTOVACUUM_FREEZE_MAX_AGE
    };
  }

  /* ── Ch6: Shared Buffers Clock-Sweep Eviction (freelist.c) ── */
  function buildTrace(workload) {
    // 40 deterministic page accesses: 8 warm-up (H1..H4 x2), 24 sequential (S1..S24), 8 post-scan OLTP (H1..H4 x2)
    const hot = ['H1', 'H2', 'H3', 'H4'];
    const seq = Array.from({ length: 24 }, (_, i) => 'S' + (i + 1));
    const trace = [];
    if (workload === 'oltp') {
      for (let i = 0; i < 40; i++) trace.push({ page: hot[i % 4], bulk: false, phase: i >= 32 ? 'post' : 'main' });
    } else {
      for (let i = 0; i < 8; i++) trace.push({ page: hot[i % 4], bulk: false, phase: 'warm' });
      for (let i = 0; i < 24; i++) trace.push({ page: seq[i], bulk: true, phase: 'scan' });
      for (let i = 0; i < 8; i++) trace.push({ page: hot[i % 4], bulk: false, phase: 'post' });
    }
    return trace;
  }

  function clockSweepSim(opts) {
    const o = Object.assign({
      frameCount: 8,
      workload: 'seq_unprotected', // 'oltp' | 'seq_unprotected' | 'seq_ring'
      step: 40
    }, opts || {});

    const n = Math.max(6, Math.min(12, Math.round(o.frameCount)));
    const trace = buildTrace(o.workload);
    const maxStep = Math.max(1, Math.min(trace.length, Math.round(o.step)));

    const frames = Array.from({ length: n }, (_, i) => ({
      id: i,
      page: null,
      usage: 0,
      dirty: false,
      bulkRing: false
    }));

    // Ring buffer of 2 frames reserved at top indices when workload === 'seq_ring'
    const ringSize = o.workload === 'seq_ring' ? 2 : 0;
    const poolSize = n - ringSize;
    let hand = 0;
    let ringHand = 0;
    let hits = 0;
    let misses = 0;
    let evictions = 0;
    let sweeps = 0;
    let postHits = 0;
    let postTotal = 0;
    let hotSurviving = 0;
    let lastEvent = null;

    for (let t = 0; t < maxStep; t++) {
      const req = trace[t];
      if (req.phase === 'post') postTotal++;
      // 1. Check all frames for buffer hit
      let hitIdx = frames.findIndex(f => f.page === req.page);
      if (hitIdx >= 0) {
        hits++;
        if (req.phase === 'post') postHits++;
        frames[hitIdx].usage = Math.min(PG.BM_MAX_USAGE_COUNT, frames[hitIdx].usage + 1);
        lastEvent = { step: t + 1, page: req.page, hit: true, frame: hitIdx, evicted: null };
        continue;
      }

      misses++;
      if (req.bulk && ringSize > 0) {
        // Use BAS_BULKREAD ring buffer frames [poolSize .. n-1]
        const idx = poolSize + ringHand;
        const prev = frames[idx].page;
        if (prev) evictions++;
        frames[idx].page = req.page;
        frames[idx].usage = 1;
        frames[idx].bulkRing = true;
        ringHand = (ringHand + 1) % ringSize;
        lastEvent = { step: t + 1, page: req.page, hit: false, frame: idx, evicted: prev };
        continue;
      }

      // Clock sweep over main pool [0 .. poolSize - 1]
      let chosen = -1;
      for (let guard = 0; guard < poolSize * (PG.BM_MAX_USAGE_COUNT + 2); guard++) {
        const f = frames[hand];
        sweeps++;
        if (f.page === null || f.usage === 0) {
          chosen = hand;
          hand = (hand + 1) % poolSize;
          break;
        }
        f.usage = Math.max(0, f.usage - 1);
        hand = (hand + 1) % poolSize;
      }
      if (chosen < 0) chosen = 0;
      const evicted = frames[chosen].page;
      if (evicted) evictions++;
      frames[chosen].page = req.page;
      frames[chosen].usage = 1;
      frames[chosen].bulkRing = false;
      lastEvent = { step: t + 1, page: req.page, hit: false, frame: chosen, evicted };
    }

    hotSurviving = frames.filter(f => f.page && f.page.startsWith('H')).length;
    const hitRate = hits / maxStep;

    return {
      frameCount: n,
      workload: o.workload,
      step: maxStep,
      totalSteps: trace.length,
      ringSize,
      hand,
      frames,
      hits,
      misses,
      evictions,
      sweeps,
      hitRate,
      hotSurviving,
      postHits,
      postTotal,
      lastEvent
    };
  }

  /* ── Ch7: B-Tree (nbtree Lehman & Yao) Splits & High-Key Right Links ── */
  function buildKeySequence(orderMode, count) {
    if (orderMode === 'seq') {
      return Array.from({ length: count }, (_, i) => (i + 1) * 10);
    }
    // Deterministic shuffled permutation of 10, 20, ..., count*10 simulating UUIDv4 random keys
    const arr = Array.from({ length: count }, (_, i) => (i + 1) * 10);
    const rnd = mulberry32(20261121);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function nbtreeSim(opts) {
    const o = Object.assign({
      orderMode: 'rand',   // 'seq' | 'rand'
      insertCount: 16,     // 6..24
      maxKeys: 4,          // 4..6
      searchKey: 100,      // key to look up
      concurrentSplit: false
    }, opts || {});

    const maxK = Math.max(4, Math.min(6, Math.round(o.maxKeys)));
    const count = Math.max(6, Math.min(24, Math.round(o.insertCount)));
    const keys = buildKeySequence(o.orderMode, count);

    // Leaf pages linked via nextId (btpo_next) and bounded by highKey (P_HIKEY)
    let leaves = [{ id: 1, keys: [], highKey: null, nextId: null, prevId: null }];
    let nextPageId = 2;
    let splits = 0;

    for (const k of keys) {
      // Descend to leaf whose highKey >= k (or rightmost)
      let idx = 0;
      while (idx < leaves.length - 1 && k > leaves[idx].highKey) idx++;
      const leaf = leaves[idx];
      // Insert sorted
      leaf.keys.push(k);
      leaf.keys.sort((a, b) => a - b);

      if (leaf.keys.length > maxK) {
        splits++;
        // Sequential-friendly split (PG nbtsplitloc.c leans toward rightmost split ~85% fill when appending at rightmost!)
        const atRightmostEnd = idx === leaves.length - 1 && k === leaf.keys[leaf.keys.length - 1];
        const splitAt = atRightmostEnd ? leaf.keys.length - 1 : Math.ceil(leaf.keys.length / 2);
        const leftKeys = leaf.keys.slice(0, splitAt);
        const rightKeys = leaf.keys.slice(splitAt);
        const oldNext = leaf.nextId;
        const oldHigh = leaf.highKey;

        const rightLeaf = {
          id: nextPageId++,
          keys: rightKeys,
          highKey: oldHigh,
          nextId: oldNext,
          prevId: leaf.id
        };
        leaf.keys = leftKeys;
        // Lehman & Yao high key on left page is the upper bound separating left from right (max(left) or min(right) - 1; PG stores separator = rightKeys[0])
        leaf.highKey = rightKeys[0];
        leaf.nextId = rightLeaf.id;
        if (oldNext != null) {
          const oldRight = leaves.find(p => p.id === oldNext);
          if (oldRight) oldRight.prevId = rightLeaf.id;
        }
        leaves.splice(idx + 1, 0, rightLeaf);
      }
    }

    const totalKeys = leaves.reduce((s, p) => s + p.keys.length, 0);
    const avgFillPct = (totalKeys / (leaves.length * maxK)) * 100;
    const height = leaves.length === 1 ? 1 : (leaves.length <= maxK + 1 ? 2 : 3);

    // Search trace: find target leaf; if concurrentSplit is enabled and a leaf has a right sibling, simulate stale parent pointing one leaf left!
    const sk = o.searchKey;
    let landingIdx = 0;
    while (landingIdx < leaves.length - 1 && sk >= leaves[landingIdx].highKey) landingIdx++;
    let staleStartIdx = landingIdx;
    let rightHops = 0;
    if (o.concurrentSplit && landingIdx > 0) {
      staleStartIdx = landingIdx - 1;
      rightHops = 1;
    } else if (o.concurrentSplit && leaves.length > 1) {
      // Ensure reader experiences a split hop if possible
      staleStartIdx = 0;
      let cur = 0;
      while (cur < leaves.length - 1 && sk >= leaves[cur].highKey) { cur++; rightHops++; }
      landingIdx = cur;
    }

    const landedLeaf = leaves[landingIdx];
    const found = landedLeaf.keys.includes(sk);

    return {
      orderMode: o.orderMode,
      insertCount: count,
      maxKeys: maxK,
      searchKey: sk,
      concurrentSplit: !!o.concurrentSplit,
      leafCount: leaves.length,
      splits,
      avgFillPct,
      height,
      leaves,
      staleStartPageId: leaves[staleStartIdx].id,
      landedPageId: landedLeaf.id,
      rightHops,
      found
    };
  }

  /* ── Ch8: Joins & work_mem Disk Spill (nodeHash.c / costsize.c) ── */
  function pow2ceil(x) {
    let p = 1;
    while (p < x) p *= 2;
    return p;
  }

  function joinCostSim(opts) {
    const o = Object.assign({
      outerRows: 80000,
      innerRows: 400000,
      workMemMB: 4,
      hasInnerIdx: false
    }, opts || {});

    const R = Math.max(1000, o.outerRows);
    const S = Math.max(10000, o.innerRows);
    const workMemBytes = Math.max(1, o.workMemMB) * 1024 * 1024;
    const tupleBytes = 96; // 24B header + payload + hash bucket entry overhead
    const hashBytes = R * tupleBytes;
    const hashSizeMiB = hashBytes / 1048576;

    // 1. Hash Join (build smaller R, probe S)
    const rawBatches = hashBytes <= workMemBytes ? 1 : pow2ceil(Math.ceil(hashBytes / workMemBytes));
    const nbatch = Math.min(64, rawBatches);
    const spillMiB = nbatch === 1 ? 0 : ((R + S) * 72 * ((nbatch - 1) / nbatch)) / 1048576;
    const spillPages = Math.ceil((spillMiB * 1048576) / PG.BLCKSZ);
    const seqPagesR = Math.ceil((R * 80) / PG.BLCKSZ);
    const seqPagesS = Math.ceil((S * 80) / PG.BLCKSZ);

    // Hash cost: read R + read S + hash build/probe CPU + temp write/read if nbatch > 1
    const hashCost =
      (seqPagesR + seqPagesS) * PG.SEQ_PAGE_COST +
      (R + S) * (PG.CPU_TUPLE_COST + PG.CPU_OPERATOR_COST * 2) +
      spillPages * 2 * PG.SEQ_PAGE_COST +
      (nbatch > 1 ? (R + S) * 0.004 : 0);

    // 2. Merge Join (sort both R and S; external merge sort spills if > work_mem)
    const sortBytesR = R * 64, sortBytesS = S * 64;
    const extPassesR = sortBytesR <= workMemBytes ? 0 : Math.ceil(Math.log2(sortBytesR / workMemBytes));
    const extPassesS = sortBytesS <= workMemBytes ? 0 : Math.ceil(Math.log2(sortBytesS / workMemBytes));
    const mergeSortSpillPages = extPassesR * seqPagesR + extPassesS * seqPagesS;
    const mergeCost =
      (seqPagesR + seqPagesS) * PG.SEQ_PAGE_COST +
      mergeSortSpillPages * 2 * PG.SEQ_PAGE_COST +
      (R * Math.log2(R) + S * Math.log2(S)) * PG.CPU_OPERATOR_COST * 0.6 +
      (R + S) * PG.CPU_TUPLE_COST;

    // 3. Nested Loop Join (with optional inner B-tree index)
    let nestCost;
    if (o.hasInnerIdx) {
      // Outer sequential + R probes into S B-tree (height 3, Mackert-Lohman inner cache)
      const innerPages = seqPagesS;
      const avgPagesPerProbe = 1.6;
      nestCost =
        seqPagesR * PG.SEQ_PAGE_COST +
        R * PG.CPU_TUPLE_COST +
        R * (avgPagesPerProbe * PG.RANDOM_PAGE_COST * 0.28 + 3 * PG.CPU_INDEX_TUPLE_COST);
    } else {
      // Unindexed block nested loop (O(R * S))
      nestCost =
        seqPagesR * PG.SEQ_PAGE_COST +
        seqPagesS * PG.SEQ_PAGE_COST +
        R * S * PG.CPU_OPERATOR_COST * 0.01;
    }

    const list = [
      { id: 'hash', cost: hashCost },
      { id: 'merge', cost: mergeCost },
      { id: 'nest', cost: nestCost }
    ].sort((a, b) => a.cost - b.cost);

    return {
      outerRows: R,
      innerRows: S,
      workMemMB: o.workMemMB,
      hasInnerIdx: !!o.hasInnerIdx,
      hashSizeMiB,
      nbatch,
      spilled: nbatch > 1,
      spillMiB,
      hashCost,
      mergeCost,
      nestCost,
      winner: list[0].id
    };
  }

  /* ── Ch9: WAL, Castagnoli CRC-32C & Full-Page Writes (xlog.c / pg_crc32c_sb8.c) ── */
  const CRC32C_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (PG.CRC32C_POLY_REFLECTED ^ (c >>> 1)) : (c >>> 1);
      }
      t[i] = c >>> 0;
    }
    return t;
  })();

  function crc32c(bytes) {
    let arr;
    if (typeof bytes === 'string') {
      arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i) & 0xff;
    } else {
      arr = bytes;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < arr.length; i++) {
      crc = CRC32C_TABLE[(crc ^ arr[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function crc32cHex(bytes) {
    return '0x' + crc32c(bytes).toString(16).toUpperCase().padStart(8, '0');
  }

  function walRecoverySim(opts) {
    const o = Object.assign({
      checkpointMin: 5,     // 1..30 min
      workload: 'rand',     // 'seq' (100 hot pages) | 'rand' (8,000 cold pages)
      fpw: true             // full_page_writes = on
    }, opts || {});

    const sec = Math.max(60, o.checkpointMin * 60);
    const updatesPerSec = 500;
    const totalUpdates = updatesPerSec * sec;
    const workingPages = o.workload === 'seq' ? 120 : 8000;
    // Coupon-collector expected distinct pages touched since last checkpoint:
    // D * (1 - (1 - 1/D)^U)
    const distinctFirstTouches = workingPages * (1 - Math.pow(1 - 1 / workingPages, totalUpdates));
    const fpwRecords = o.fpw ? Math.round(distinctFirstTouches) : 0;
    const deltaBytesPerUpdate = 76; // XLogRecord (24B) + block ref + compact tuple delta
    const fpwBytesPerRecord = 8050; // compressed/trimmed 8 KiB page image (header + used tuples)

    const deltaWalBytes = totalUpdates * deltaBytesPerUpdate;
    const fpwWalBytes = fpwRecords * fpwBytesPerRecord;
    const totalWalBytes = deltaWalBytes + fpwWalBytes;
    const walRateMBs = totalWalBytes / 1048576 / sec;
    const fpwSharePct = totalWalBytes > 0 ? (fpwWalBytes / totalWalBytes) * 100 : 0;
    // Assume crash happens at 50% of checkpoint window, replay throughput ~120 MiB/s
    const recoveryWalMiB = (totalWalBytes * 0.5) / 1048576;
    const recoverySec = recoveryWalMiB / 120;

    // Simulate an 8 KiB torn block (first 4 KiB new LSN=200, second 4 KiB stale LSN=100)
    const blockA = new Uint8Array(64); blockA.fill(0xaa);
    const blockB = new Uint8Array(64); blockB.fill(0xbb);
    const expectedCrc = crc32cHex(blockA);
    const torn = new Uint8Array(64);
    torn.set(blockA.subarray(0, 32), 0);
    torn.set(blockB.subarray(32, 64), 32);
    const tornCrc = crc32cHex(torn);

    return {
      checkpointMin: o.checkpointMin,
      workload: o.workload,
      fpw: !!o.fpw,
      totalUpdates,
      fpwRecords,
      deltaWalMiB: deltaWalBytes / 1048576,
      fpwWalMiB: fpwWalBytes / 1048576,
      totalWalMiB: totalWalBytes / 1048576,
      walRateMBs,
      fpwSharePct,
      recoverySec,
      expectedCrc,
      tornCrc,
      tornPageSafe: !!o.fpw
    };
  }

  return {
    PG,
    fmt,
    sig,
    bytesStr,
    maxAlign,
    packPageHeader,
    unpackPageHeader,
    packItemId,
    unpackItemId,
    tupleAlignedSize,
    mackertLohman,
    plannerCosts,
    correlationMismatch,
    createEmptyPage,
    applyPageOp,
    simulatePageSequence,
    xidVisibleToSnapshot,
    tupleSatisfiesMVCC,
    mvccScenario,
    xidPrecedes,
    xidAge,
    vacuumWraparoundSim,
    clockSweepSim,
    nbtreeSim,
    joinCostSim,
    crc32c,
    crc32cHex,
    walRecoverySim
  };
});
