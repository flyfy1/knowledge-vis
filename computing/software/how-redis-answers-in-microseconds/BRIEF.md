# BRIEF — how-redis-answers-in-microseconds

Author: Antigravity (gemini-flash-worker-agy, thinking: on, effort unavailable; planner: gemini-pro-orchestrator-neon, thinking: effort=1.00), 2026-11-21. Task: Software Principles series W4 (`computing/software/how-redis-answers-in-microseconds/`).
Status: unregistered draft (`page.json` omits `"status"`). Full bilingual essay (`content.zh.md` + `content.en.md`, no stub).

## Pinned release

**Redis 8.0** (GA 2025-05-01, tag `8.0.0`).
Note on local verification: `redis-server` / `redis-cli` binaries are **not installed** on this macOS build host (verified via `which redis-server redis-cli`). Accordingly, `tools/crosscheck.cjs` checks our in-page models against independent cryptographic/protocol reference vectors, specification equations, and exhaustive mathematical invariants rather than a live `redis-server` socket.

Primary Redis 8.0 source modules referenced:
- `src/ae.c` (`aeMain`, `epoll` / `kqueue` multiplexing, `beforeSleep`)
- `src/networking.c` (`readQueryFromClient`, `querybuf`, RESP2/RESP3 parsing, async `io-threads`)
- `src/object.c`, `src/sds.h` (`struct redisObject` 16 B, `sdshdr8` 3 B, `OBJ_ENCODING_EMBSTR_SIZE_LIMIT = 44`, `OBJ_SHARED_INTEGERS = 10000`)
- `src/listpack.c` (`lpEncodeGetType`, `lpEncodeBacklen`, replacing `ziplist` cascade updates)
- `src/dict.c`, `src/siphash.c` (`dict` dual tables `ht[0]`/`ht[1]`, `_dictRehashStep`, `dictRehashMilliseconds`, `dictScan` reverse-binary cursor, `ENTRY_PTR_MASK`, `dictEntryNoValue`, SipHash-1-2 `cROUNDS=1, dROUNDS=2`)
- `src/t_zset.c`, `src/server.h` (`zskiplist`, `ZSKIPLIST_MAXLEVEL = 32`, `ZSKIPLIST_P = 0.25`, `span`, `zslGetRank`)
- `src/rdb.c`, `src/aof.c` (`BGSAVE` `fork()`, CoW, `appendfsync`, Multi-Part AOF `base` + `incr` + `manifest`)
- `src/expire.c`, `src/evict.c` (`activeExpireCycle` `ACTIVE_EXPIRE_KEYS_PER_LOOP = 20`, `ACTIVE_EXPIRE_ACCEPTABLE_STALE = 10`, `active-expire-effort`; `EVPOOL_SIZE = 16`, `maxmemory-samples = 5`, `LFU_INIT_VAL = 5`, `lfu-log-factor = 10`)
- `src/cluster.c` (`CRC16-CCITT/XMODEM`, `16,384` slots, `{hash-tag}` extraction, `-MOVED` / `-ASK`)

## Chapter ladder (11 chapters, 11 labs, 9 static SVG diagrams)

1. `#ch1` Why one main thread beats locks (`dg-loop`, `ch1-model`: lock-free event loop vs N-thread mutex contention + 2 ms `KEYS *` stall).
2. `#ch2` RESP2/RESP3 wire framing & pipelining (`dg-resp`, `ch2-model`: RESP2/RESP3 byte encoder + sequential vs pipelined RTT waterfall).
3. `#ch3` `redisObject`, 44-byte `embstr` & `listpack` (`dg-robj`, `ch3-model`: `jemalloc` byte layout for `int` / `embstr` / `raw` + `listpack` vs `hashtable` upgrade at 512 entries / 64 B).
4. `#ch4` `dict` hash table & progressive rehashing (`dg-rehash`, `ch4-model`: SipHash-1-2 `ht[0] -> ht[1]` `rehashidx` migration vs stop-the-world spike).
5. `#ch5` Sorted sets (`ZSET`) & the skiplist (`dg-skiplist`, `ch5-model`: deterministic `p=1/4` `zskiplist` builder + `span`-summing rank tracer + `dict` probe).
6. `#ch6` I/O bottlenecks & Redis 8 `io-threads` (`dg-iothreads`, `ch6-model`: parallel read/parse/TLS + single-core `processCommand` Amdahl ceiling).
7. `#ch7` Persistence without stopping the world: `fork()` CoW & Multi-Part AOF (`dg-cow`, `ch7-model`: 64 × 4 KiB page CoW fault grid under uniform vs hot-skewed writes + `appendfsync` policy).
8. `#ch8` Expiration & eviction: approximate LRU, Morris 8-bit LFU & `activeExpireCycle` (`dg-evict`, `ch8-model`: `maxmemory-samples` rank error + 8-bit `LFULogIncr` curve; `ch8e-model`: `activeExpireCycle` loop convergence under `active-expire-effort`).
9. `#ch9` Cluster sharding (`CRC16(key) mod 16384`), `{hash-tag}`, and reverse-binary `SCAN` (`dg-slots`, `ch9-model`: CRC16 & `-MOVED`/`-ASK` router; `ch9s-model`: reverse-binary `dictScan` cursor across 8->16 doubling & 16->8 shrinking).
10. `#ch10` Frontier (November 2026): Redis 8 Vector Sets (`VADD`/`VSIM`, HNSW + `Q8`), Redis 8.2 `kvobj` / 8.10 Compact Hashes, Valkey 9 (`per-slot` dict, `dictPrefetch`, BSD 3-Clause), and DragonflyDB shared-nothing fibers.
11. `#ch11` Wrap-up: three diagnostic questions when Redis stalls or bloats (`.qs`).

## Tuned / analytical parameters

- `LOOP_DEFAULTS` (`ch1`): `loopCmdUs = 2.0` (500 kops/s single lock-free loop), `mutexBaseUs = 0.45`, `cacheBounceUs = 0.85`, `ctxSwitchUs = 3.2`, `slowCmdUs = 2000`.
- `pipelineStats` (`ch2`): `parseUs = 0.35`, `execUs = 0.85`, `TCP_MSS_BYTES = 1460`.
- `rehashSim` (`ch4`): 8-to-16 bucket SipHash-1-2 demo paired with 380 ms analytical 10M-key stop-the-world reference.
- `ioThreadModel` (`ch6`): `parseReadBase = 0.65 + (bytes/512)*0.45 (+1.45 TLS)`, `writeBase = 0.55 + (bytes/512)*0.40 (+1.35 TLS)`, `execUs = 0.75`, `syncOverheadUs = 0.14`.
- `cowSim` (`ch7`): 64 physical 4 KiB pages, up to 96 mutations (`0..100%` slider), hot skew puts 90% of mutations into 7 hot pages (`~11%` of pages).

## Frontier facts & sources (verified 2026-11-21)

- **Redis 8.0 GA**: May 1, 2025; unified distribution with JSON/TimeSeries/Query/Probabilistic modules, tri-licensed under AGPLv3 / RSALv2 / SSPLv1 (redis.io release notes).
- **Redis 8.2 / 8.4 / 8.6 / 8.8 / 8.10**: August 2025 (8.2 `kvobj` unified key+short value+TTL allocation), November 2025 (8.4), February 2026 (8.6), May 2026 (8.8 native Array), July 2026 (8.10 Compact Hashes) (redis.io release notes).
- **Vector Sets**: designed by Salvatore Sanfilippo (`antirez`), introduced in Redis 8.0 Beta (`VADD` / `VSIM`, native HNSW with bidirectional deletion & default `Q8` 8-bit quantization) (antirez.com & redis.io).
- **Valkey 9.0 / 9.2**: Valkey 9.0 released October 21, 2025 (atomic slot migration, HFE, cluster multi-DB); Valkey 9.2 in November 2026; BSD 3-Clause, per-slot dictionary, async I/O + `dictPrefetch` (valkey.io).
- **DragonflyDB**: shared-nothing fiber-per-core sharding, BSL 1.1, forkless bucket-level snapshots (dragonflydb.io).

## Crosscheck & test summary

- `node tools/diagrams.cjs` -> 9 diagrams written (`dg-loop`..`dg-slots`).
- `node scripts/build-pages.cjs --print-budgets computing/software/how-redis-answers-in-microseconds` -> all SVG labels <= 87% room budget.
- `node scripts/build-pages.cjs computing/software/how-redis-answers-in-microseconds` & `--check` -> clean (`386 keys/lang, 11 chapters, 12 refs, 4 related, 38 bound numbers`).
- `node tools/crosscheck.cjs` -> verifies RESP2/RESP3 round-trips, SipHash-2-4 test vectors, CRC16-XMODEM `"123456789" -> 0x31C3` & `{tag}`, rehash conservation, reverse-binary `SCAN` 0-miss invariant, skiplist `p=0.25` & `span` rank math, `embstr` 44 B / `listpack` varint encoding, Morris LFU closed-form vs Monte Carlo, and CoW bounds.
- `node tests/models.cjs` -> pins all prose bindings, model branches, copy parity, zero CJK in English, `unprefill` hygiene, and `REGISTRY.json` unique aliases.
- Browser sweep (`tests/browser.cjs`, `tests/canvas-text-overlap.cjs`) not executed locally per parallel-builder rule (left ready for coordinator serial Playwright run).
