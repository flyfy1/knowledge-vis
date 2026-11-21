---
lang: en
title: How Redis Answers in Microseconds · A Hands-on Essay
desc: Send one SET user:42 "alice" or ZRANGEBYSCORE request and Redis's main event loop writes the reply back to the socket in microseconds. Following Redis 8.0 internals and specs, this essay unpacks that round-trip: the lock-free event loop, RESP2/RESP3 and pipelining, redisObject's 44-byte embstr cliff and listpack, progressive two-table rehashing, span-indexed ZSET skiplists, Redis 8 threaded network I/O, BGSAVE fork copy-on-write and multi-part AOF, active expiration and approximate LRU / Morris-counter LFU, 16,384 cluster hash slots and reverse-binary SCAN cursors, plus Vector Sets and shared-nothing frontiers. Eleven hands-on models run the exact underlying algorithms in the page.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.ms: {v} ms
u.us: {v} µs
u.b: {v} B
u.kops: {v} kops/s
u.x: {v}×
u.keys: {v} keys
u.ops: {v} ops
:::

# How Redis Answers in Microseconds {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

One `SET user:42 "alice"` or `ZRANGEBYSCORE` enters the socket,<br>and a single lock-free loop answers hundreds of thousands of times a second in microseconds—so where can it stall? {.sub}

While most databases spin up pools of worker threads, coordinate mutexes, and flush pages to disk, Redis keeps its data in RAM and runs commands on **one main thread**—yet routinely serves hundreds of thousands of operations per second in sub-millisecond time. This essay follows one question all the way down: **the instant you send `SET user:42 "alice"` or `ZRANGEBYSCORE`, what happens inside Redis 8.0 from the socket byte stream through memory structures down to disk snapshots—and which paths turn microseconds into milliseconds?** {.lead}

All struct byte sizes, configuration defaults, and constants follow **Redis 8.0** (GA 1 May 2025, tag `8.0.0`) source code and specs; the frontier chapter closes with developments up to November 2026 (Redis 8.2–8.10, Valkey 9, and shared-nothing engines). Because no `redis-server` binary is installed in this build environment, every model is reimplemented cleanly in-page and checked by `tools/crosscheck.cjs` against standard RESP2/RESP3 wire framing, SipHash-2-4 vectors, CRC16-XMODEM vectors, reverse-binary `SCAN` preservation, skiplist span invariants, and Morris counter expectation tables. For hardware and OS context, see [[how-the-os-talks-to-hardware]], [[how-a-nic-moves-packets]], [[how-virtual-memory-works]], and [[why-compute-waits-for-memory]]. {.note}

## Why One Main Thread Beats Locks {#ch1}

::: strings
toc: Event loop vs locks
:::

A DRAM lookup takes ~100 ns, whereas acquiring contended mutexes, parking threads, and bouncing cache lines burns microseconds; in single-node RAM, deleting locks buys more speed than adding cores. {.law}

Suppose you open `redis-cli` and run three commands: write a string, insert a leaderboard score, and query a score range. Every time you press Enter, Redis's core function `aeMain` repeats one tight loop: ask the OS multiplexer (`epoll` on Linux, `kqueue` on macOS/BSD) for every ready socket in one batch, run each queued command sequentially against in-memory structures, append replies to client output buffers, and flush them back to the kernel right before sleeping again (`beforeSleep`). For how `epoll` amortizes syscall crossings, see [[how-the-os-talks-to-hardware#ch11|syscalls and epoll]]; for why RAM reads sit around ~100 ns, see [[why-compute-waits-for-memory#ch1|DRAM latency]].

::: html ch1-code
code.aria: A minimal Redis command round-trip sequence
code: "SET user:42 \"alice\"\n# -> +OK\\r\\n\n\nZADD rank 100 \"alice\"\n# -> :1\\r\\n\n\nZRANGEBYSCORE rank 90 150 WITHSCORES\n# -> *2\\r\\n$5\\r\\nalice\\r\\n$3\\r\\n100\\r\\n"
:::

**Why not let eight worker threads mutate the same hash table in parallel?** Whenever two threads touch a hot key or shared hash table metadata, they need a mutex: an atomic CAS instruction to lock, an OS futex sleep and context switch on collision, plus repeated L1/L2 cache-line invalidation across cores. Keeping command execution on one thread removes every data-structure lock. The flip side is **head-of-line blocking**: if one command stalls for milliseconds (such as an `O(N)` `KEYS *` scan), every client behind it waits in line.

::: diagram dg-loop keys=dg.loop
cap: Figure 1. One iteration of Redis's main event loop aeMain: wait for ready sockets, parse and run commands, flush replies.
aria: Diagram: Redis main event loop stages cycling through epoll wait, readQueryFromClient, processCommand, and beforeSleep flush with latency scales
s1: epoll_wait / kevent
s1s: Collect ready sockets in one wake
s2: readQueryFromClient
s2s: Read socket bytes, slice RESP
s3: processCommand
s3s: Execute lock-free, queue reply
s4: beforeSleep flush
s4s: Write buffers out and repeat
sc: 100 ns RAM | ~2 µs syscall | ~200 µs RTT
:::

::: lab ch1-model
model.title: Lock-free event loop vs contended worker threads
model.how: Drag "Worker threads" and "Hot-key contention" to see when lock contention and cache-line bouncing push multi-threaded throughput below the single lock-free loop (gold dashed line). Tick "Inject one 2 ms KEYS * stall" to watch normal microsecond commands pile up behind one slow op.
ctl.thr: Worker threads
ctl.hot: Hot-key contention
ctl.slow: Inject one 2 ms blocking cmd
cv.aria: Left chart compares lock-free loop throughput against N mutex threads; right chart shows 20 incoming requests on the event loop timeline
cv.x: Threads
cv.y: kops/s
cv.loop: Lock-free
cv.lock: Mutex
cv.tl: 20-req event loop queue
cv.slow: 2 ms stall
read.loop: Lock-free loop throughput
read.lock: N-thread mutex throughput
read.p99: Tail request latency
read.blk: Requests stalled behind slow op
say.fast: The single lock-free loop sustains <em>{loop}</em>. With {t} threads contending at {hot}% hot keys, mutex waits and cache-line ping-pong drag locked throughput to {lock} (threads scale linearly only as contention drops near 0%).
say.stall: Normally every command finishes in microseconds, but once request #3 holds the loop for <em>{p99}</em>, all <em>{blk}</em> queued requests stall behind it and tail latency jumps 1,000×.
:::

Under the default 50% hot-key contention, the lock-free loop sustains {=ch1.loopKops} kops/s while 4 mutex-locked threads drop to {=ch1.lock4Kops} kops/s; injecting one 2 ms `KEYS *` stall blocks all {=ch1.blocked} queued requests behind it for {=ch1.slowP99} ms. That trade-off explains both Redis's speed and its golden rule: never run O(N) scans inside the command loop.

Model limits: this analytical model approximates mutex overhead as serialized critical-section fraction plus cache-line bounce; real throughput also depends on socket I/O framing (chapter 6) and OS scheduler load. {.take}

## RESP2 / RESP3 Framing & Pipelining {#ch2}

::: strings
toc: RESP & pipelining
:::

Parsing length-prefixed wire bytes takes tenths of a microsecond, whereas a network round-trip takes ~200 µs; pipelining a batch of commands pays that wire delay once instead of N times. {.law}

Clients do not talk to Redis in plain whitespace lines; they send length-prefixed frames in **RESP** (REdis Serialization Protocol). On the wire, `SET user:42 alice` is `*3\r\n$3\r\nSET\r\n$7\r\nuser:42\r\n$5\r\nalice\r\n` ({=ch2.reqBytes} bytes total). Why prepend `$7` and `$5`? For **binary safety**: even if a value contains `\r\n` or `\0`, `readQueryFromClient` skips straight over exact byte counts inside `client-&gt;querybuf` to populate `argv[]`, without scanning every byte for delimiters. For how a packet traverses user space, kernel, and NIC, see [[how-a-nic-moves-packets#ch3|a packet round-trip]].

::: diagram dg-resp keys=dg.resp
cap: Figure 2. Length-prefixed RESP tokens sliced zero-copy from querybuf, and sequential waiting (red) vs pipelined batching (gold).
aria: Diagram: top shows SET user:42 alice RESP tokens entering querybuf; bottom compares 3 sequential round-trips against 1 pipelined round-trip
wire: Length-prefixed wire bytes
qbuf: querybuf zero-copy argv[] slice
seq: Sequential: 3 × (RTT + CPU)
pip: Pipelined: 1 × RTT + 3 × CPU
:::

Redis 8.0 speaks both **RESP2** (arrays `*` and bulk strings `$`, where clients must infer that `HGETALL`'s even array is a key-value map) and **RESP3** (negotiated via `HELLO 3`, adding explicit maps `%`, doubles `,`, booleans `#`, and null `_`). Either way, **parsing is never the main latency cost—sequential round-trips are**. Sending 20 commands one by one across a 200 µs LAN round-trip takes {=ch2.seqMs} ms; pipelining all 20 together pays one RTT plus 20 server parse-and-exec cycles, finishing in {=ch2.pipeUs} µs—a {=ch2.speedup}× speedup.

::: lab ch2-model
model.title: RESP2 / RESP3 Wire Encoder & Pipelining Waterfall
model.how: Adjust "Batch commands" and "Network RTT", switch "RESP2 / RESP3", and toggle "Sequential / Pipelined" to inspect exact wire bytes and see whether network RTT or server CPU dominates total time.
ctl.n: Batch commands
ctl.rtt: Network RTT
ctl.proto: Protocol
proto.resp2: RESP2
proto.resp3: RESP3
ctl.mode: Send mode
mode.seq: Sequential
mode.pipe: Pipelined
wire.aria: Escaped RESP wire preview for current command and reply
cv.aria: Packet waterfall comparing sequential round-trips against a single pipelined batch
cv.seq: Sequential
cv.pipe: Pipelined
cv.x: Time (µs)
read.bytes: Request wire bytes
read.lat: Total batch latency
read.qps: Effective throughput
read.gain: Pipeline speedup
say.seq: Sending {n} commands sequentially takes <em>{lat}</em>—only <em>{cpu}</em> is Redis CPU work, while the rest sits idle waiting on the wire; pipelining accelerates this batch by {gain}.
say.pipe: Pipelining packs {n} commands into {pkt} TCP segment(s) ({bytes}) for a single {rtt} network round-trip, dropping total latency to <em>{lat}</em> and lifting throughput to <em>{qps}</em>.
:::

Model limits: assumes one uncontended TCP stream; does not model congestion-window backpressure beyond 1,460-byte MSS boundaries or client-side serialization time. {.take}

## redisObject, 44-Byte `embstr`, and `listpack` {#ch3}

::: strings
toc: Objects & encodings
:::

Every value in Redis wears a 16-byte `redisObject` header; integers ride inside the pointer, strings up to 44 bytes fuse into one 64-byte `jemalloc` block (`embstr`), and small collections flatten into `listpack` arrays. {.law}

On 64-bit servers, a Redis value is wrapped in a `{=ch3.robjB}`-byte `struct redisObject`: 4 bits `type`, 4 bits `encoding`, 24 bits `lru` (chapter 8), 32 bits `refcount`, and an 8-byte `void *ptr`. That indirection lets one `SET` or `HSET` pick the tightest layout behind the scenes:

- **Inline integers (`OBJ_ENCODING_INT`)**: storing `"42"` writes the integer `42` straight into `*ptr`, eliminating any string buffer; values `0..9,999` even reuse `shared.integers[]` at startup for **0 new bytes** allocated. {#i1}
- **Embedded strings (`embstr`) vs `raw`**: up to **{=ch3.embLimit} bytes**, the `{=ch3.robjB}`-byte `redisObject`, `{=ch3.sds8B}`-byte `sdshdr8` header (`len`, `alloc`, `flags`), payload, and `\0` total `{=ch3.robjB} + {=ch3.sds8B} + {=ch3.embLimit} + 1 = {=ch3.emb44Alloc}` bytes—fitting one 64-byte `jemalloc` class and one cache line in **1 `malloc`**. At 45 bytes, Redis splits into `raw` encoding (**2 separate `malloc` calls**, `{=ch3.raw45Alloc}` bytes total, plus an extra pointer hop). {#i2}
- **`listpack` replacing `ziplist`**: small Hashes (default ≤ `{=ch3.lpMaxEntries}` entries, keys/values ≤ 64 bytes) and ZSETs (≤ 128 entries, ≤ 64 bytes) store items contiguously in a `listpack`. Old `ziplist` entries stored the *previous* element's byte length (`prevlen`), so inserting a 254+ byte item could widen `prevlen` from 1 to 5 bytes and trigger a chain-reaction **cascade update** across every trailing item. `listpack` fixes this by storing only each entry's *own* `backlen` at its tail, supporting backward traversal with zero cascade rewrites. {#i3}

::: diagram dg-robj keys=dg.robj
cap: Figure 3. String encodings (INT, 44-byte single-block embstr, two-block raw) and a listpack entry layout.
aria: Diagram: comparing INT pointer-packed values, 64-byte single-malloc embstr, dual-malloc raw strings, and listpack entries with self-length backlen
int: INT (0..9999 shared, 0 allocs)
intb: robj 16B, int stored in *ptr
emb: embstr (≤ 44 B: 1 × 64B jemalloc)
embd: 44B data + \0
raw: raw (> 44 B: 2 × malloc, pointer hop)
rawd: sdshdr8 + data + \0
lp: listpack entry (self backlen, no cascade)
lpd: element data
:::

::: lab ch3-model
model.title: 44-Byte embstr Cliff & listpack Memory Calculator
model.how: Start at "String / value length = 44" to see one tight 64-byte block, step to 45 to watch it split into two `raw` allocations, tick "Store as integer 42" for zero-alloc sharing, and push "Hash entries" past 512 (or length past 64) to trigger `listpack -&gt; hashtable`.
ctl.len: String / value length
ctl.entries: Hash entries
ctl.int: Store as integer "42"
cv.aria: Top panel draws jemalloc byte blocks for a string value; bottom panel compares listpack vs hashtable memory for the Hash
cv.str: String allocation
cv.hash: Same-size Hash bytes
cv.lp: listpack
cv.ht: hashtable
cv.zero: Shared int pool (0 B new)
read.enc: String encoding
read.strb: String bytes / mallocs
read.henc: Hash encoding
read.hb: Active Hash bytes
say.int: Value is small integer 42: encoded as <code>OBJ_ENCODING_INT</code> from the shared integer pool for <em>0 new bytes / 0 mallocs</em>; the Hash uses {henc} at length {len}.
say.embstr: At {len} bytes, <code>embstr</code> packs <code>redisObject</code> + <code>sdshdr8</code> + payload into <em>1 malloc ({strb})</em>; the {entries}-entry Hash takes {hb}.
say.raw: Past the 44-byte cliff, Redis falls back to <code>raw</code>: header and buffer split into <em>2 mallocs ({strb})</em> with an extra pointer dereference.
:::

A 64-entry Hash with 44-byte values takes {=ch3.lp64Bytes} bytes packed in `listpack`, versus {=ch3.ht64Bytes} bytes once expanded into a `hashtable` with bucket arrays and `dictEntry` pointers.

Model limits: models standard 64-bit `jemalloc` size classes without counting top-level keyspace `dictEntry` pointers or Redis 8.2's unified `kvobj` (covered in chapter 10). {.take}

## The `dict` Hash Table & Progressive Rehashing {#ch4}

::: strings
toc: dict & progressive rehash
:::

Resizing a ten-million-key hash table in one blocking loop would freeze clients for hundreds of milliseconds; `dict` keeps two tables (`ht[0]` and `ht[1]`) and migrates one bucket per command. {.law}

Every key lookup (`GET`, `SET`) and large Hash field lookup hits `src/dict.c`. Keys are hashed with **SipHash-1-2** (1 compression round, 2 finalization rounds, initialized with a random per-process seed against hash-flooding DoS) into buckets starting at size `{=ch4.htInit}`. Redis even uses pointer bit-tagging on 8-byte aligned addresses (`ENTRY_PTR_MASK`) and omits value pointers on pure sets (`dictEntryNoValue`).

When load hits 1:1 (deferred to `{=ch4.forceRatio}`:1 while a `fork()` child runs so mutations do not copy excess CoW pages, chapter 7), `dict` allocates a double-sized `ht[1]`. Rather than freezing the loop to rehash millions of entries at once, Redis sets `rehashidx = 0` and moves **1 non-empty bucket on every incoming command** (`_dictRehashStep`), plus 1 ms background slices (`dictRehashMilliseconds`) when idle. Lookups check `ht[0]` then `ht[1]`; new inserts go straight to `ht[1]`, keeping tail latency flat in microseconds.

::: diagram dg-rehash keys=dg.rehash
cap: Figure 4. Progressive rehashing: reads check both tables, writes go to ht[1], and each command advances rehashidx by one bucket.
aria: Diagram: ht[0] buckets on the left migrating via rehashidx into double-size ht[1] buckets on the right
done: Migrated
cur: Moving (rehashidx)
wait: Pending
new: In ht[1]
rule: Read both, write ht[1], move 1 bucket/op
:::

::: lab ch4-model
model.title: Progressive Two-Table Rehash vs Stop-the-World Spike
model.how: Scrub "Rehash steps completed" to watch SipHash-1-2 keys move bucket by bucket from 8-slot `ht[0]` into 16-slot `ht[1]`; toggle "Stop-the-world" to see the massive blocking latency spike when all buckets migrate at once.
ctl.step: Rehash steps completed
ctl.keys: Keys in demo dict
ctl.mode: Resize mode
mode.prog: Progressive (1 bucket/op)
mode.stw: Stop-the-world blocking
cv.aria: Left shows 8 buckets of ht[0], right shows 16 buckets of ht[1], and bottom plots worst-case per-command latency spike
cv.h0: ht[0] (8 buckets)
cv.h1: ht[1] (16 buckets)
cv.lat: Resize command stall
cv.prog: Progressive ~1.4 µs
cv.stw: Stop-the-world 380 ms
read.idx: Current rehashidx
read.h0: Keys left in ht[0]
read.h1: Keys in ht[1]
read.spike: Worst command stall
say.idle: Resize just triggered (<code>rehashidx = 0</code>): <code>ht[1]</code> is allocated and new keys land directly in it starting on the next write.
say.prog: Progressive rehash in flight: <code>rehashidx = {idx}</code>, {h0} keys left in <code>ht[0]</code> and {h1} in <code>ht[1]</code>; this command pays only <em>{spike}</em> extra work.
say.done: Rehash complete! <code>ht[0]</code> is freed, <code>ht[1]</code> becomes the new <code>ht[0]</code>, and <code>rehashidx</code> resets to <em>-1</em>.
say.stw: Stop-the-world migration forces every bucket move into one command: on a 10M-key dict, the main event loop freezes for <em>{spike}</em>.
:::

Model limits: scales an 8-to-16 bucket SipHash-1-2 dict alongside an analytical 10M-key blocking estimate; skips idle-time `activeRehash` 1 ms cron batches. {.take}

## Sorted Sets (`ZSET`) & the Skiplist {#ch5}

::: strings
toc: ZSET & skiplist
:::

A `ZSET` pairs an O(1) hash table (`ZSCORE`) with a doubly-linked skiplist (`p = 1/4`, `span` counts on every forward link), achieving O(log N) range scans and exact rank arithmetic without tree rotations. {.law}

Returning to our opening `ZRANGEBYSCORE rank 90 150`: a hash table alone cannot iterate by score order, while a balanced binary tree cannot look up a member's score in O(1) by name. Past its `listpack` threshold (default > 128 entries or > 64 bytes), a Redis `ZSET` runs **both structures side by side**, sharing pointers to the same member strings and scores:
- A `dict` mapping `member -&gt; score` for O(1) `ZSCORE`; {#i1}
- A `zskiplist` (`src/t_zset.c`) ordered by `(score, member)` at level 0, with a `backward` link for reverse scans (`ZREVRANGE`). On insert, `zslRandomLevel` flips coins with probability **`p = {=ch5.zslP}`** up to **`{=ch5.maxLvl}` levels**, and every forward link stores **`span`**: the count of level-0 nodes it jumps over. {#i2}

**Why did antirez pick a skiplist over a red-black tree?** Range scans simply walk level 0 forward pointers without stack/parent backtracking, and `ZRANK` needs no tree rotations: summing `span` along every forward step taken during search yields the exact 1-based rank in O(log N).

::: diagram dg-skiplist keys=dg.skiplist
cap: Figure 5. Dual-indexed ZSET: companion dict for O(1) ZSCORE plus multi-level zskiplist towers carrying forward span counts.
aria: Diagram: dict hash map on top, five zskiplist nodes below with forward pointers labeled span=4 and span=2
dict: dict: O(1) member -> score (ZSCORE)
bot: Level 0 sorted doubly-linked list
:::

::: lab ch5-model
model.title: Seeded ZSET Skiplist & Span-Summing Rank Path
model.how: Drag "Target rank" to highlight the real O(log N) forward-and-down path through the highest towers and verify that the summed `span` values equal the exact rank; switch "PRNG seed" to see `p = 0.25` random tower heights.
ctl.n: ZSET elements
ctl.rank: Target rank (1-based)
ctl.seed: PRNG seed
cv.aria: Draws every skiplist node's tower height, forward pointers with span numbers, and the highlighted search trail to the target rank
cv.head: HEAD
cv.lvl: Height
cv.hops: Search path
read.hops: Pointer hops taken
read.span: Summed span (= rank)
read.lvl: Current max level
read.dict: dict probes (ZSCORE)
say: Starting at top level L{lvl}, stepping right and dropping down reaches rank {rank} (score {score}) in just <em>{hops} hops</em>, with accumulated <code>span = {span}</code>; a direct score lookup takes {dict} <code>dict</code> probe.
:::

With default seed 3 and 12 nodes, reaching rank 9 takes {=ch5.seed3Hops} hops. Small ZSETs under 128 entries and 64-byte members stay compact in `listpack` before converting to this `dict + zskiplist` pair. {.take}

## I/O Bottlenecks & Redis 8 `io-threads` {#ch6}

::: strings
toc: Threaded network I/O
:::

At hundreds of thousands of operations per second, Redis spends up to 70% of its CPU in socket reads, RESP parsing, TLS, and reply writes; Redis 8 parallelizes network I/O across worker threads while keeping command execution strictly single-threaded. {.law}

"Redis is single-threaded" is only half true. Redis 6 added I/O worker threads, and **Redis 8.0** shipped a revamped event-driven async **`io-threads`** architecture (still defaulting to `1` = off, commonly set to `4`–`8` on multi-core hosts, and now cleanly compatible with TLS). Each batch works in three phases:
1. The main event loop assigns ready client sockets to `io-threads` workers, which read bytes and parse RESP frames (plus decrypt TLS) in parallel; {#i1}
2. Across a light synchronization barrier, the **main thread executes every parsed command sequentially with zero locks**; {#i2}
3. Workers take the resulting reply buffers and run TLS encryption and socket `write()` calls back out in parallel. {#i3}

Because `processCommand` itself remains serial on one core, throughput obeys **Amdahl's Law**: adding threads helps dramatically while socket I/O and TLS dominate, then flattens out once the single execution core hits 100%.

::: diagram dg-iothreads keys=dg.iothreads
cap: Figure 6. Redis 8 threaded I/O: worker threads parallelize socket reads/parsing and reply writes around one lock-free command core.
aria: Diagram: three I/O workers on left reading/parsing in parallel, funneling into one single-threaded command core, then fanning out to write replies
read: Parallel read + parse + TLS
main: Exec loop
wr: Parallel write
cap2: I/O scales; command core sets Amdahl limit
:::

::: lab ch6-model
model.title: Redis 8 io-threads Pipeline & Single-Core Ceiling
model.how: Slide "io-threads count" from 1 to 8 and adjust "Payload size" or toggle "TLS encryption" to watch when network I/O saturates versus when the single command core becomes the Amdahl ceiling.
ctl.thr: io-threads count
ctl.bytes: Payload size
ctl.tls: Enable TLS crypto
cv.aria: Top shows per-batch time split across read/parse, main-thread execution, and write; bottom plots throughput scaling for 1 to 8 threads
cv.read: Read+Parse
cv.exec: Core exec
cv.wr: Write out
cv.x: io-threads count
cv.y: kops/s
cv.ceil: Single-core ceiling
read.qps: Projected throughput
read.share: I/O CPU share
read.lim: Current bottleneck
say.single: With <code>io-threads = 1</code> (single-threaded default), socket I/O eats <em>{share}</em> of the core and caps throughput at {qps}.
say.io: Spreading reads and writes over {t} I/O threads lifts throughput to <em>{qps}</em>; heavy payloads or TLS still keep I/O ({share}) as the main limiter.
say.core: With {t} I/O threads pushing I/O share down to {share}, the single-threaded <code>processCommand</code> core hits 100% saturation at an Amdahl ceiling of <em>{qps}</em>.
:::

Under the model's 512-byte baseline, moving from `io-threads = 1` to `4` raises throughput from {=ch6.kops1} kops/s to {=ch6.kops4} kops/s. Real-world gains depend on kernel TCP stack tuning, batch pipelining depth, and core affinity. {.take}

## Persistence Without Stopping the World: `fork()` CoW & Multi-Part AOF {#ch7}

::: strings
toc: Persistence & CoW
:::

To write a consistent point-in-time snapshot without halting writes, Redis relies on `fork()` and OS Copy-on-Write over 4 KiB pages; the more scattered the writes during `BGSAVE`, the closer memory usage climbs toward 2×. {.law}

Memory vanishes on power loss. Calling `BGSAVE` clones the Redis process via `fork()` in milliseconds so a child process can stream an RDB snapshot to disk while the parent keeps serving writes. The trick lies in virtual memory's **Copy-on-Write (CoW)** (detailed page-table mechanics in [[how-virtual-memory-works#ch9|fork() and Copy-on-Write]]):
- Right after `fork()`, parent and child share read-only mappings to the **same physical {=ch7.pageKiB} KiB RAM pages** (`1.00×` memory); {#i1}
- Read commands copy nothing; {#i2}
- Modifying even **1 byte** inside a page triggers a minor page fault: the kernel pauses the parent briefly and copies the full {=ch7.pageKiB} KiB page before updating it. Under heavy random writes, CoW can nearly **double RAM consumption**. {#i3}

For tighter durability, the **Append-Only File (AOF)** logs every mutation under `appendfsync`: `always` (fsync every write, lowest loss, disk-bound), `everysec` (background fsync every second, ≤ 1 s loss), or `no` (kernel decides). **Multi-Part AOF** (Redis 7.0 through 8.0) splits persistence into `base` (RDB/AOF preamble), `incr` files, and a `manifest`, avoiding massive single-file rewrite stalls.

::: diagram dg-cow keys=dg.cow
cap: Figure 7. 4 KiB Copy-on-Write page sharing during BGSAVE (clean shared vs dirty copied) and Multi-Part AOF files.
aria: Diagram: parent and child sharing read-only 4 KiB pages on the left while parent writes allocate copied 4 KiB pages on the right; Multi-Part AOF files below
par: Parent (R/W)
chd: Child (RDB)
shr: Shared 4 KiB page
cpy: Copied 4 KiB page
aof: Multi-Part AOF files
:::

::: lab ch7-model
model.title: BGSAVE Copy-on-Write Page Grid & AOF Durability
model.how: Drag "Write traffic during snapshot" to watch physical 4 KiB pages turn dirty and duplicate; toggle "Hot-key skew (10% hot pages)" to see why concentrated updates spare memory compared to uniform random writes, and switch `appendfsync`.
ctl.write: Write traffic during snapshot
ctl.skew: Hot-key skew (10% hot pages)
ctl.aof: appendfsync policy
aof.everysec: everysec
aof.always: always
aof.no: no
cv.aria: Grid of 64 physical 4 KiB RAM pages showing cyan shared pages vs red copied dirty pages
cv.grid: 64 × 4 KiB physical RAM pages
cv.base: Shared base (1×)
cv.cow: Copied dirty
cv.ram: RAM multiplier
read.copied: Dirty copied pages
read.ram: Peak RAM multiplier
read.loss: AOF max loss window
read.fsync: Disk fsync cadence
say.idle: No writes during snapshot: parent and child share all 64 pages at <em>{ram}</em> RAM, with AOF on <code>{aof}</code> ({loss} window).
say.uniform: Uniformly scattered writes ({writes} mutations) touched and duplicated <em>{copied} / 64</em> 4 KiB pages, driving RAM to <em>{ram}</em> even if each edit touched a few bytes.
say.skew: The same {writes} writes skewed to hot keys touched only <em>{copied} / 64</em> pages, holding RAM at <em>{ram}</em>—hot workloads amortize CoW copies.
:::

At 50% write volume, uniform mutations amplify memory to {=ch7.cowUnif}×, whereas 10%-hot skewed mutations stay at {=ch7.cowSkew}×.

Model limits: demonstrates page duplication on a 64-page grid; real `fork()` latency also depends on page-table size and Transparent Huge Pages (THP turns 4 KiB copies into 2 MiB latency spikes, so Redis warns against THP). {.take}

## Expiration & Eviction: Approximate LRU & Morris LFU {#ch8}

::: strings
toc: Expiration & eviction
:::

Maintaining a global doubly-linked list over millions of keys would burn 16 bytes per key in pointers and lock mutations; Redis packs eviction clocks and probabilistic logarithmic frequencies into 24 bits via bounded sampling. {.law}

When you set a `TTL`, Redis combines **lazy deletion on access** with periodic random sampling in `activeExpireCycle` (`src/expire.c`): per cycle, each database samples **`{=ch8.expKeys}` TTL keys**, frees expired ones, and repeats only while the sampled expired fraction stays above **`{=ch8.expStale}%`** (at default `active-expire-effort = 1`).

And when RAM hits `maxmemory`, Redis avoids a global LRU linked list—which would spend **16 bytes per key** just on `prev`/`next` pointers (16 MB per million keys)—by packing a **24-bit `lru` field** inside every `redisObject`:
- **Approximate LRU**: stores a coarse seconds clock; on eviction, Redis samples **`maxmemory-samples` (default `{=ch8.lruSamp}`)** random keys into a `{=ch8.lruPool}`-slot `EvictionPool` and evicts the oldest candidate. In our 200-key simulation, `5` samples hit within the coldest {=ch8.lru5Err}% on average with zero linked-list pointers. {#i1}
- **8-bit Morris Counter LFU**: splits the 24-bit `lru` field into a **16-bit minute timestamp (`ldt`)** and an **8-bit counter (`0..255`)** initialized at `LFU_INIT_VAL = {=ch8.lfuInit}`. On access, `LFULogIncr` increments by 1 only with probability `p = 1 / ((counter - 5) × lfu_log_factor + 1)`. At default factor `{=ch8.lfuFactor}`, 1,000 hits reach an expected counter of `{=ch8.lfu1k}`, 100k hits reach `{=ch8.lfu100k}`, and ~1M hits saturate `255`—capturing six orders of magnitude in one byte. {#i2}

::: diagram dg-evict keys=dg.evict
cap: Figure 8. How the same 24-bit robj.lru field switches between a 24-bit LRU clock and a 16-bit LDT + 8-bit Morris counter.
aria: Diagram: top shows 24-bit LRU clock in seconds; bottom splits 24 bits into 16-bit minute timestamp ldt and 8-bit Morris frequency counter
lru: LRU mode: full 24 bits hold seconds clock
lrub: 24-bit LRU clock (seconds)
lfu: LFU mode: 16-bit minute clock + 8-bit counter
ldt: 16-bit ldt (min)
cnt: 8-bit 0..255
pool: samples=5 -> 16-slot pool
:::

::: lab ch8-model
model.title: Approximate LRU Accuracy & 8-Bit Morris LFU Saturation
model.how: Drag "maxmemory-samples" on the left to watch eviction rank error collapse with just a handful of probes; pick "Access hits" and "lfu-log-factor" on the right to watch an 8-bit counter compress a million hits into 0..255.
ctl.samp: maxmemory-samples
ctl.hits: Total key hits (10^k)
ctl.fac: lfu-log-factor
fac.0: 0
fac.1: 1
fac.10: 10
fac.100: 100
cv.aria: Left curve plots eviction rank error vs sample size 1..20; right curve plots expected 8-bit Morris counter vs log10 hits across log factors
cv.ax1: Samples
cv.ay1: Error %
cv.ax2: log10(hits)
cv.ay2: 8-bit cnt
read.lru: Mean eviction rank error
read.saved: Pointer RAM saved (per 1M keys)
read.cnt: Expected 8-bit LFU count
read.prob: Next +1 probability
say: Sampling {samp} keys into the 16-slot pool evicts keys within the coldest <em>{lru}</em> while saving {saved} of list pointers; at factor={fac} and {hits} hits, the Morris counter sits around <em>{cnt} / 255</em> (next increment chance {prob}).
:::

Next, see how `activeExpireCycle` bounds background expiration CPU:

::: lab ch8e-model keys=ch8.e
model.title: Bounded Active Expiration Loop (activeExpireCycle)
model.how: Set the initial percentage of expired TTL keys, then drag `active-expire-effort` (1 to 10) to watch how many loops run and how much expired clutter remains when sampling stops.
ctl.pct: Initial expired key share
ctl.eff: active-expire-effort
cv.aria: Line chart tracking remaining expired key percentage across activeExpireCycle sampling loops
cv.x: Sampling loop
cv.y: Expired (%)
cv.cut: Stale cap
read.loops: Loops executed
read.freed: Keys reclaimed
read.left: Remaining expired share
read.kpl: Keys sampled per loop
say: At effort = {eff} ({kpl} keys/loop, stopping once sample stale ≤ {stale}%), {loops} loops freed {freed} keys and dropped stale share to <em>{left}</em>.
:::

Model limits: approximate LRU assumes static access ranking without 194-day clock wrap; the Morris curve excludes idle `lfu-decay-time` halving; active expire omits the 25% slow-cycle hard CPU deadline. {.take}

## Cluster Hash Slots & Reverse-Binary `SCAN` {#ch9}

::: strings
toc: Hash slots & SCAN
:::

Redis Cluster partitions keyspace across 16,384 hash slots via CRC16; meanwhile, traversing a resizing hash table without missing keys relies on bit-reversed SCAN cursors stepping top-down from the highest bit. {.law}

To scale beyond one node's RAM or CPU core, Redis Cluster maps every key onto **`{=ch9.slots}` hash slots (`0..16,383`)** via `CRC16-CCITT/XMODEM & 16383`. For the standard test string `"123456789"`, CRC16 is `0x31C3`, landing in slot **`{=ch9.crcTestSlot}`**. To force related keys like `user:{42}:cart` and `user:{42}:orders` onto the same shard for multi-key atomicity, wrap `{42}` in braces: Redis hashes only the substring between the first `{` and first non-empty `}`, pinning both to slot **`{=ch9.tagSlot}`**.

When a client hits the wrong node, Redis replies `-MOVED &lt;slot&gt; &lt;host&gt;` if slot ownership is settled (updating the client's slot map) or `-ASK &lt;slot&gt; &lt;host&gt;` during live slot migration (telling the client to send a one-off `ASKING` + command to the target without rewriting its cache).

::: diagram dg-slots keys=dg.slots
cap: Figure 9. 16,384-slot routing with {hash-tag} colocation and permanent (-MOVED) vs transient (-ASK) redirects.
aria: Diagram: user:{42}:cart hashing tag 42 to slot 8000 on shard N2, with MOVED and ASK redirect boxes below
moved: -MOVED (cache)
ask: -ASK (once)
:::

::: lab ch9-model
model.title: CRC16 Hash Slot Mapper & {hash-tag} Router
model.how: Type any key (or choose a preset), adjust cluster shard count, and toggle "Slot migrating" to inspect the extracted hash tag, CRC16 slot, owning shard, and `-MOVED` vs `-ASK` response.
ctl.key: Key string
ctl.shards: Cluster shards
ctl.mig: Slot migrating now
ctl.preset: Presets
pre.cart: user:{42}:cart
pre.orders: user:{42}:orders
pre.vec: 123456789
cv.aria: Slot range bar split across shards showing where the current key's hash slot lands and any migration target
cv.slot: Slot
cv.shard: Shard N
read.tag: Hashed substring
read.crc: CRC16 (hex)
read.slot: Hash slot (0–16383)
read.route: Redirect reply
say.normal: Hashing <code>{tag}</code> gives <code>CRC16 = {crc}</code>, mapping to <em>slot {slot}</em> on shard {owner}; wrong-node queries get <code>-MOVED {slot}</code> to update routing.
say.migrating: <em>Slot {slot}</em> is migrating from shard {owner} to shard {target}: missing keys on the source return <code>-ASK {slot}</code> for a one-time <code>ASKING</code> redirect.
:::

**Why does `KEYS *` hang production clusters while `SCAN` stays safe even during table resizes?** `KEYS *` freezes the single event loop for the entire keyspace. `SCAN` iterates incrementally with a safe cursor that tolerates live hash-table resizes.

Redis implements `dictScan` (`src/dict.c`) with a **reverse-binary cursor**: `v |= ~m0; v = rev(v); v++; v = rev(v);`. On an 8-bucket table, it visits `0 → 4 → 2 → 6 → 1 → 5 → 3 → 7` (incrementing from the most significant bit down). When a table doubles (`8 → 16`), bucket `0` splits into `0` and `8` and bucket `1` into `1` and `9`—right along the prefix subtree the reverse-binary cursor traverses, guaranteeing **zero missed keys** across resizes.

::: lab ch9s-model keys=ch9.s
model.title: Reverse-Binary SCAN Cursor Across Doubling & Shrinking
model.how: Step the `SCAN` cursor from 1 to 16 and toggle "Double 8 -> 16" or "Shrink 16 -> 8" at step 4 to verify that reverse-binary order finishes with 0 missed keys.
ctl.step: Scan step
ctl.mode: Mid-scan table resize
mode.none: Fixed 8 buckets
mode.double: Double at step 4 (8 → 16)
mode.shrink: Shrink at step 4 (16 → 8)
cv.aria: Bucket strip showing all 16 keys and the gold reverse-binary cursor trail across resizes
cv.b8: 8-bucket dict
cv.b16: 16-bucket dict
cv.step: Step {v} -> bucket {b}
read.cur: Cursor / bucket
read.seen: Distinct keys seen
read.dup: Duplicate visits
read.miss: Keys missed (full scan)
say.none: Stepping in reverse-binary order hits <em>bucket {bucket}</em> at step {step}; without resizes, full traversal reports <em>{miss} missed</em> and {dup} duplicates.
say.double: Table doubled (8 → 16) at step 4: reverse-binary prefix traversal cleanly visits newly split high-bit buckets—{seen}/16 seen so far and <em>{miss} missed</em> overall.
say.shrink: Table shrunk (16 → 8) at step 4: merged upper buckets trigger <em>{dup} duplicate(s)</em> of previously scanned keys, while still guaranteeing <em>{miss} missed</em> keys overall.
:::

Model limits: cluster routing assumes even 16,384-slot splits without read replicas; `SCAN` omits dual-table scanning during concurrent `ht[0] -&gt; ht[1]` progressive rehashing. Lua scripts and Redis Functions also execute atomically on the single command thread—long scripts stall the event loop identically to `KEYS *`. {.take}

## Where the Frontier Is (November 2026): Vector Sets, `kvobj`, and Shared-Nothing Engines {#ch10}

::: strings
toc: Where the frontier is
:::

Redis 8 brought native Vector Sets and unified modules back into core while competing directly with Valkey 9 and shared-nothing fiber engines—putting single-core ceilings, async I/O, and compact key memory at center stage. {.law}

### Established {#h.est .sub3}

- <span class="tag h">Established</span> Single-threaded in-memory loops avoid locks, yet remain bounded by one core's execution ceiling and OS `fork()` Copy-on-Write page faults; linear multi-core scaling requires partitioning state so cores share no mutable structures (shared-nothing). {#e1}
- <span class="tag h">Established</span> Following **Redis 8.0** GA on 1 May 2025 (unifying JSON, TimeSeries, Query Engine, and probabilistic modules under AGPLv3 / RSALv2 / SSPLv1 tri-licensing), Redis 8.2 (August 2025) introduced unified **`kvobj`** allocations packing short keys, short values, and optional TTLs together, while Redis 8.8 (May 2026) and Redis 8.10 (July 2026) added native Arrays and schema-sharing Compact Hashes. {#e2}

### Demonstrated {#h.demo .sub3}

- <span class="tag m">Demonstrated</span> **Vector Sets (`VADD` / `VSIM`)**: created by Salvatore Sanfilippo (`antirez`) and introduced in Redis 8.0 (starting in Beta), Vector Sets store high-dimensional embeddings as a native core data type backed by an **HNSW** graph with bidirectional deletion, disk persistence, and default **`Q8` 8-bit quantization** (cutting FP32 vector RAM 4×, with optional `BIN` 1-bit 32× compression). {#d1}
- <span class="tag m">Demonstrated</span> **Valkey 9 trajectory (as of November 2026)**: the Linux Foundation's BSD 3-Clause fork shipped **Valkey 9.0** on 21 October 2025 (atomic slot migrations, hash field expiration, multi-DB cluster mode) and reached **Valkey 9.2** in November 2026, refining per-slot dictionaries (eliminating migration list overhead) and async I/O with `dictPrefetch` cache prefetching while keeping a single-threaded command model. {#d2}
- <span class="tag m">Demonstrated</span> **Dragonfly's shared-nothing design**: shards keyspace across per-core user-space fibers with no shared locks and replaces `fork()` with asynchronous bucket-level snapshots, avoiding 2× CoW memory spikes. {#d3}

### Claims, Conditions & Open Questions {#h.claim .sub3}

- <span class="tag l">Claim & Context</span> **Published benchmarks**: Redis Ltd. reports 30+ optimizations and up to 2× higher throughput and 35% lower primary replication buffers in Redis 8.0, while Dragonfly and Valkey publish multi-core benchmark comparisons showing steep multi-core divergence; exact multipliers depend heavily on key size, pipeline depth, TLS, and core count. {#c1}
- <span class="tag l">Claim & Context</span> **Open problems**: a single Redis 8 instance still executes commands on one core, forcing cluster sharding to saturate 64-core servers; meanwhile the ecosystem continues navigating AGPLv3 vs BSD-3-Clause licensing and cross-shard transaction trade-offs in shared-nothing designs. {#c2}

All release dates, feature names, and comparisons above reflect the public state as of **November 2026** (per Redis release notes, antirez's Vector Sets design notes, Valkey release announcements, and Dragonfly technical docs). {.take}

## Wrap-up: When Redis Stalls or Bloats, Ask Three Things {#ch11}

::: strings
toc: Wrap-up: three questions
:::

You do not need to memorize every struct offset; when production Redis spikes in latency or doubles in RAM, follow the main event loop and ask three questions. {.law}

{.qs}
- **Is the single execution thread blocked, or are clients waiting on the network?** Check the slowlog first: one `KEYS *`, giant collection delete, or heavy Lua script stalls every microsecond query queued behind it (chapters 1, 9). If server CPU per command is fine yet client latency is high, inspect missing pipelining (chapter 2) or enable `io-threads` when TLS and socket reads saturate core 0 (chapter 6). {#q1}
- **Did values cross an allocation cliff, or did `fork()` trigger CoW?** Stepping from 44 to 45 bytes splits `embstr` into `raw`, and crossing 512 entries or 64 bytes pushes a `listpack` Hash into a pointer-heavy `hashtable` (chapter 3). If RAM spikes specifically during `BGSAVE` or AOF rewrite, scattered writes are duplicating 4 KiB pages via Copy-on-Write (chapter 7). {#q2}
- **Are eviction/expiration loops tuned, or is one shard skewed?** Massive synchronized TTL expirations or mis-tuned `maxmemory-samples` / `lfu-log-factor` leave stale keys or mis-evict hot items (chapter 8). In clusters, uneven `{hash-tag}` keys or missing hash tags cause single-shard CPU hotspots or multi-key errors (chapter 9). {#q3}

In one sentence: Redis answers in microseconds not through concurrency magic, but by **deleting locks with one loop, batching RTTs with length-prefixed pipelines, packing `embstr`/`listpack` into 64-byte cache lines, and replacing sudden freezes with incremental rehashing, span-indexed skiplists, and reverse-binary cursors**. {#sum .sum}

Further reading: [[how-the-os-talks-to-hardware]] (`epoll` and syscall boundaries), [[how-a-nic-moves-packets]] (what makes up a 200 µs network round-trip), [[how-virtual-memory-works]] (`fork()` Copy-on-Write and 4 KiB page tables), and [[why-compute-waits-for-memory]] (why 64 bytes matches one CPU cache line). {#links}

::: footer
**Sources.** Struct layouts, constants, and algorithms follow **Redis 8.0** (GA 1 May 2025, tag `8.0.0`) source code and documentation: `src/ae.c` (event loop), `src/networking.c` (`readQueryFromClient`, RESP2/RESP3 parsing, async `io-threads`), `src/object.c` & `src/sds.h` (`redisObject` 16 B, `sdshdr8` 3 B, `OBJ_ENCODING_EMBSTR_SIZE_LIMIT = 44`), `src/listpack.c` (varint encoding & self `backlen`), `src/dict.c` & `src/siphash.c` (progressive `dictRehash`, reverse-binary `dictScan`, SipHash-1-2), `src/t_zset.c` (`ZSKIPLIST_MAXLEVEL = 32`, `ZSKIPLIST_P = 0.25`, `span`), `src/rdb.c` & `src/aof.c` (`BGSAVE` `fork()` & Multi-Part AOF), `src/expire.c` & `src/evict.c` (`activeExpireCycle` 20 keys/loop & 10% stale cutoff, `EVPOOL_SIZE = 16` approximate LRU, `LFU_INIT_VAL = 5` Morris counter), and `src/cluster.c` (CRC16-CCITT/XMODEM & `{hash-tag}` 16,384 slots). Frontier notes cite Redis 8.0/8.2/8.8/8.10 release notes, antirez's Vector Sets design posts, Valkey 9.0/9.2 release notes, and Dragonfly documentation (verified November 2026). See `BRIEF.md` in this directory for exact checks and gaps.

**Models & crosscheck.** The page runs no live `redis-server` process (none is installed in this build environment). All 11 interactive models are implemented cleanly in `models.js`, and `tools/crosscheck.cjs` independently verifies RESP2/RESP3 binary round-trips, official SipHash-2-4 vectors, the CRC16 `"123456789" -&gt; 0x31C3` specification vector, zero-miss reverse-binary `SCAN` under table doubling/shrinking, `zskiplist` `p = 1/4` level statistics and `span` invariants, and Morris LFU expected saturation tables. Written from scratch by Antigravity (AI).
:::
