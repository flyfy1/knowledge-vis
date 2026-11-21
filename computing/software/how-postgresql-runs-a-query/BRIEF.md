# BRIEF — how-postgresql-runs-a-query

Author: Antigravity (2026-11-21). Task: W6 of the Software Core Principles (`computing/software`) series — 《PostgreSQL 如何执行一条查询》 / "How PostgreSQL Runs a Query".
Status: unregistered draft (`page.json` has no `"status"` field; both `content.zh.md` and `content.en.md` are complete native essays with zero CJK in English).

## One question

**From sending `SELECT ... WHERE` or `UPDATE` until tuples return safely on disk: why does updating 1 row never overwrite in place, how do concurrent readers never block writers, why does `AUTOVACUUM` exist, and how does the planner choose between sequential scan, index scan, and hash join?**

## Pinned release & source references

- **PostgreSQL 17.6** (released 2025-08-14) and **PostgreSQL 18.0** (released 2025-09-25), with **PostgreSQL 19.0** (released 2026-11-19) noted in Ch10 Frontier.
- Source files referenced for binary structures, byte offsets, bitfields, and cost formulas:
  - `src/include/pg_config_manual.h` (`BLCKSZ = 8192`)
  - `src/include/storage/bufpage.h` (`PageHeaderData` 24 bytes: `pd_lsn` 8B, `pd_checksum` 2B, `pd_flags` 2B, `pd_lower` 2B, `pd_upper` 2B, `pd_special` 2B, `pd_pagesize_version` 2B = `0x2004`, `pd_prune_xid` 4B)
  - `src/include/storage/itemid.h` (`ItemIdData` 4 bytes: 15-bit `lp_off`, 2-bit `lp_flags`, 15-bit `lp_len`)
  - `src/include/access/htup_details.h` (`HeapTupleHeaderData` 23 bytes fixed `t_xmin`+`t_xmax`+`t_cid`+`t_ctid`+`t_infomask2`+`t_infomask`+`t_hoff`, aligned via `MAXALIGN(8)` to `24` bytes)
  - `src/backend/optimizer/path/costsize.c` (`seq_page_cost = 1.0`, `random_page_cost = 4.0`, `cpu_tuple_cost = 0.01`, `cpu_index_tuple_cost = 0.005`, `cpu_operator_cost = 0.0025`, and Mackert–Lohman `index_pages_fetched`)
  - `src/backend/storage/ipc/procarray.c` & `src/backend/access/heap/heapam_visibility.c` (`SnapshotData {xmin, xmax, xip[]}` and `HeapTupleSatisfiesMVCC`)
  - `src/backend/access/transam/varsup.c` & `transam.c` (32-bit modular XID comparison `((int32)(id1 - id2)) < 0`, `autovacuum_freeze_max_age = 200M`, `xidStopLimit` ~3M before `2^31`)
  - `src/backend/storage/buffer/freelist.c` (`StrategyGetBuffer` clock sweep with `BM_MAX_USAGE_COUNT = 5` and `BAS_BULKREAD` 256 KiB = 32-frame ring buffer)
  - `src/include/access/nbtree.h` & `src/backend/access/nbtree/` (Lehman & Yao `BTPageOpaqueData` 16 bytes, `P_HIKEY`, `btpo_next`, rightmost-append split bias)
  - `src/backend/executor/nodeHash.c` (Grace multi-batch Hash Join splitting into powers of 2 `nbatch` inside `base/pgsql_tmp/` when exceeding `work_mem`)
  - `src/backend/access/transam/xlog.c` & `src/port/pg_crc32c_sb8.c` (16 MiB WAL segments, `XLogRecPtr` LSN, `full_page_writes`, reflected Castagnoli polynomial `0x82F63B78`)

## Chapter structure & models (11 chapters, 9 static SVG diagrams, 8 interactive labs)

1. `#ch1` Query pipeline & Volcano pull model (`ExecProcNode`) — `ch1-code`, `dg-pipeline`
2. `#ch2` Cost-based planner & `pg_statistic` — `dg-costpaths`, `ch2-model` (`plannerCosts`: Seq Scan vs Index Scan vs Bitmap Heap Scan vs Index-Only Scan crossover; correlation mismatch `9.5x`)
3. `#ch3` 8 KiB slotted pages & HOT updates — `dg-pagelayout`, `ch3-model` (`simulatePageSequence`: live `pd_lower`, `pd_upper`, HOT chains, index writes)
4. `#ch4` MVCC snapshots & isolation levels — `dg-mvtline`, `ch4-model` (`mvccScenario`: `READ COMMITTED` vs `REPEATABLE READ` across concurrent `T100..T104`)
5. `#ch5` VACUUM, Visibility Map & 32-bit XID wraparound — `dg-xidcircle`, `ch5-model` (`vacuumWraparoundSim`: dead bloat, VM %, `autovacuum_freeze_max_age = 200M`, `xidStopLimit`, `2^31` flip)
6. `#ch6` Shared buffers clock sweep & OS Page Cache double buffering — `dg-doublebuf`, `ch6-model` (`clockSweepSim`: `usage_count 0..5`, `0/4` vs `4/4` post-scan hot hits with `BAS_BULKREAD`)
7. `#ch7` `nbtree` Lehman & Yao splits & High Keys — `dg-nbtreesplit`, `ch7-model` (`nbtreeSim`: sequential/UUIDv7 vs random/UUIDv4 fill % and `btpo_next` right hops)
8. `#ch8` Join algorithms & `work_mem` disk spills — `dg-joinspill`, `ch8-model` (`joinCostSim`: `work_mem` 4 MiB `nbatch=2` spill vs 16 MiB `nbatch=1` + Nested Loop index crossover)
9. `#ch9` WAL, Castagnoli CRC-32C & Full-Page Writes — `dg-walfpw`, `ch9-model` (`walRecoverySim`: `checkpoint_timeout` amplification vs replay time, torn 4 KiB CRC-32C check)
10. `#ch10` Frontier (November 2026) — separated into Established / Built & Shipped / Claims & Limits
11. `#ch11` Wrap-up — 3 diagnostic `.qs`, `.sum`, live links to `[[what-a-drive-is-made-of]]`, `[[how-the-os-talks-to-hardware]]`, `[[how-cores-share-memory]]`, `[[distributed-systems]]`

## Frontier facts & sources ("Facts that will go stale")

- **PostgreSQL 17.6**: released 2025-08-14 (`postgresql.org` release announcement, checked 2026-11-21).
- **PostgreSQL 18.0** (released 2025-09-25; 18.1 2025-11-13, 18.2 2026-02-12, 18.3 2026-02-26): `io_method` (`sync`/`worker`/`io_uring` Linux >= 5.1), B-tree Skip Scans, default data checksums in `initdb`, `uuidv7()`, `pg_upgrade` statistics retention (`postgresql.org` release notes, checked 2026-11-21).
- **PostgreSQL 19.0**: released 2026-11-19 (`REPACK (CONCURRENTLY)`, `pg_plan_advice` / `pg_stash_advice`, standby `WAIT`, logical replication of sequences; `postgresql.org` announcement, checked 2026-11-21).
- **pgvector**: v0.8.0 (released 2024-10-30, iterative index scans `hnsw.iterative_scan` and planner cost fixes) and v0.8.1 (released 2025-09-04) (`github.com/pgvector/pgvector` changelog, checked 2026-11-21).

## Checked / not checked

- **Not verified against a running `postgres` binary**: No `postgres` or `psql` server binary is installed on this build host.
- **Verified deterministically in `tools/crosscheck.cjs` (285/285 checks)**:
  - Castagnoli CRC-32C (`0x82F63B78`) against independent bitwise calculation and RFC 3720 test vectors (`"123456789"` -> `0xE3069283`, empty -> `0x00000000`, 32x`0x00` -> `0x8A9136AA`, 32x`0xFF` -> `0x62A8AB43`).
  - Little-endian binary `PageHeaderData` (24B, `pd_pagesize_version = 0x2004`) and `ItemIdData` 32-bit bitfield packing (`lp_off`, `lp_flags`, `lp_len`), plus 64-bit `MAXALIGN(8)` tuple headers (`23B -> 24B`).
  - Exhaustive MVCC snapshot visibility truth table across `COMMITTED`/`IN_PROGRESS`/`ABORTED` and `snap.xmin`/`snap.xmax`/`snap.xip[]`.
  - 32-bit two's complement modular XID wraparound across `0xFFFFFFFF -> 3` and exact `2^31` half-circle boundaries.
  - `costsize.c` Mackert–Lohman closed forms, clock-sweep buffer eviction (`0/4` vs `4/4` post-scan hot hits), Lehman & Yao `nbtree` `HIKEY`/`btpo_next` invariants, and Grace Hash power-of-2 batch splitting.
- **Browser / visual sweep**: `tests/browser.cjs` written and syntax-checked; Playwright execution deferred to the serial coordinator pass per series build rules.
