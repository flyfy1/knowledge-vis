---
lang: en
title: How PostgreSQL Runs a Query · A Hands-on Essay
desc: Send one ordinary SELECT ... WHERE or UPDATE ... WHERE to PostgreSQL, and trace it through the parser, cost-based planner, 8 KiB slotted pages and HOT chains, MVCC snapshots, VACUUM and the 32-bit XID wraparound clock, shared_buffers clock sweep, Lehman & Yao B-tree splits, work_mem hash-join spills, and WAL full-page writes to disk. Eight hands-on models reimplement the PostgreSQL 17.6 / 18.0 structures and algorithms step by step.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.mib: {v} MiB
u.kib: {v} KiB
u.b: {v} B
u.ms: {v} ms
u.s: {v} s
u.m: {v}M
u.min: {v} min
u.rows: {v} rows
u.pages: {v} pages
u.sep: ", "
:::

# How PostgreSQL Runs a Query {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

Send one `SELECT ... WHERE` or `UPDATE` to the database:<br>in what exact order do PostgreSQL's memory buffers and 8 KiB pages actually execute it? {.sub}

Writing `UPDATE accounts SET balance = balance - 100 WHERE id = 42;` followed by `SELECT ... WHERE tier = 'pro' AND balance &gt; 1000` in an application looks like flipping one field and scanning a list. This essay asks one question: **from sending a SQL statement until tuples return and modifications land safely on disk, what happens inside PostgreSQL at every step?** Why does updating a single row never overwrite bytes in place, how do concurrent readers never block writers, why does `AUTOVACUUM` have to keep running or halt the database, and how does the planner choose between a sequential scan, an index scan, and a hash join? {.lead}

Every byte offset, bit layout, and planner cost constant here comes from the source specifications of **PostgreSQL 17.6** (released 14 August 2025) and **PostgreSQL 18.0** (released 25 September 2025): `bufpage.h`, `htup_details.h`, `procarray.c`, `costsize.c`, `nbtinsert.c`, `freelist.c`, `varsup.c`, `xlog.c`, and `pg_crc32c_sb8.c`. Because no `postgres` or `psql` binary is installed on this host, the page does not ship a live database server: instead, `models.js` reimplements the page-header packing, Castagnoli CRC-32C checksums, MVCC snapshot truth tables, cost equations, clock-sweep buffer pool, B-tree splits, and 32-bit modular XID wraparound in zero-dependency code, and `tools/crosscheck.cjs` verifies them item by item against the source layouts and standard test vectors. This essay was written by an AI; the end of each chapter states what its model leaves out. {.note}

## Query pipeline: from SQL text to the Volcano iterator {#ch1}

::: strings
toc: Query pipeline & Volcano model
:::

PostgreSQL never "executes SQL text" directly. Every statement passes through five stages and turns into a pull-based tree of iterators (`ExecProcNode`) yielding one tuple at a time. {.law}

Think of an order counter behind a kitchen pass. A customer hands over a handwritten slip; the cashier checks the grammar, looks up the menu to verify dish names and prices, expands combo deals, asks the head chef which stove plan is fastest with today's stock, and finally the runner ladles one portion at a time on demand. PostgreSQL executes a query in those exact five steps.

::: html ch1-code
code.aria: Two SQL statements followed throughout the essay
code: "SELECT id, name, balance\nFROM accounts\nWHERE tier = 'pro' AND balance > 1000\nORDER BY balance DESC LIMIT 20;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 42;"
:::

Once the frontend/backend protocol hands the string to a backend process, the **Parser** runs the lexer and Bison grammar to emit a raw `ParseStmt` tree—without yet knowing whether `accounts` even exists. Next, the **Analyzer** checks system catalogs (`pg_class`, `pg_attribute`) to resolve table OIDs, column types, and permissions into a typed `Query` tree. If any views or rules appear, the **Rewriter** expands them inline.

The fourth stage, the **Planner / Optimizer**, picks the strategy: the same `SELECT` might walk an index in order, scan the heap with a top-N heap sort, or hash-aggregate first. It prices candidate physical paths using table statistics and passes the cheapest `Plan` tree to the **Executor**. Execution runs top-down via **`ExecProcNode()`**: the root node pulls one tuple from its child, which pulls one from its child—the classic **Volcano iterator model**, letting a `LIMIT 20` stop early without materializing the rest of the table.

::: diagram dg-pipeline keys=dg.pipeline
cap: Figure 1. Five stages from SQL string to output rows: the first four compile text into a physical plan tree; the fifth pulls tuples row by row up the iterator chain.
aria: Diagram: Parser, Analyzer, Rewriter, Planner, and Executor five-stage pipeline with intermediate data structures
s1: Parser
s1d: Lexer and Bison syntax check
s2: Analyzer
s2d: Lookup pg_class / pg_attribute
s3: Rewriter
s3d: Expand views and rules
s4: Planner
s4d: costsize.c picks cheapest plan
s5: Executor
s5d: ExecProcNode pull iterator tree
x1: Raw ParseStmt tree
x2: Semantic Query tree
x3: Rewritten Query tree
x4: Physical Plan (Volcano tree)
:::

This chapter draws the map of the pipeline. The next chapter opens the fourth stage—the planner—to see how histograms and I/O weights score competing scans; chapters 3 through 9 follow the executor straight down into 8 KiB pages, MVCC snapshots, shared buffers, and the write-ahead log. {.take}

## Cost-based planner & statistics: why indexes sometimes lose {#ch2}

::: strings
toc: Cost-based planner & stats
:::

The optimizer has no sentimental attachment to indexes; once matching rows scatter across too many pages, hopping between random 8 KiB blocks costs more than reading the whole heap straight through. {.law}

Suppose a courier has 500 parcels to deliver. If every recipient sits in one office tower, looking up suite numbers wins hands down; if those 500 parcels lie across 900 out of 1,000 streets in town, driving down every block sequentially beats zigzagging back and forth across addresses. PostgreSQL's planner runs that arithmetic on every query.

`ANALYZE` records column statistics in `pg_statistic` (exposed via `pg_stats`): Most Common Values (MCVs), equi-depth histograms, and distinct counts `n_distinct`. Functions in `costsize.c` estimate selectivity $p$ and matching row counts, then multiply them by five default cost constants: `seq_page_cost = 1.0`, `random_page_cost = 4.0`, `cpu_tuple_cost = 0.01`, `cpu_index_tuple_cost = 0.005`, and `cpu_operator_cost = 0.0025`.

::: diagram dg-costpaths keys=dg.costpaths
cap: Figure 2. Access patterns across ten 8 KiB heap pages: Sequential Scan reads straight through, Index Scan jumps randomly in key order, and Bitmap Heap Scan deduplicates block numbers before reading in physical order.
aria: Diagram: comparing block access patterns for Sequential Scan, Index Scan, and Bitmap Heap Scan across ten heap pages
seq: Sequential Scan
seqTag: seq_page_cost=1.0
idx: Index Scan
idxTag: random_page_cost=4.0
bmp: Bitmap Heap Scan
bmpTag: Sort & dedupe page IDs
:::

In the model below—a 10,000-page table (40 rows per page, 400,000 rows total) under the default `random_page_cost = 4.0`—at `0.1%` selectivity (400 rows), Index Scan costs just {=ch2.idxLowCost} against {=ch2.seqCost} for a Sequential Scan. By `5%` selectivity, unclustered Index Scan is swamped by repeated random page fetches in the Mackert–Lohman buffer equation, while **Bitmap Heap Scan** collects and sorts page numbers into a bitmap first for {=ch2.bmpMidCost}. Past **{=ch2.crossPct}**, Sequential Scan takes the lead outright. Lower `random_page_cost` toward `1.1` for NVMe SSDs and the crossover shifts to {=ch2.crossSsdPct}; turn on all-visible pages in the Visibility Map and **Index-Only Scan** skips heap fetches altogether.

::: lab ch2-model
model.title: Planner cost crossover: Seq Scan, Index Scan, Bitmap & Index-Only
model.how: Drag selectivity to watch the four plan curves cross as matching rows grow; drag random_page_cost between HDD (4.0) and SSD (1.1); tick all-visible pages in the Visibility Map to unlock Index-Only Scan.
ctl.sel: Query selectivity
ctl.rpc: Random read cost random_page_cost
ctl.vis: Visibility Map (VM) all-visible
cv.aria: Line chart of planner estimated cost against query selectivity percentage for four scan strategies
cv.x: Selectivity (%)
cv.y: Estimated cost (costsize.c units)
leg.seq: Seq Scan
leg.idx: Index Scan
leg.bmp: Bitmap Heap Scan
leg.ios: Index-Only Scan
read.win: Winning plan
read.seq: Seq Scan cost
read.bmp: Bitmap Heap cost
read.idx: Index / IOS cost
win.seq: Sequential Scan
win.index: Index Scan
win.bitmap: Bitmap Heap Scan
win.indexonly: Index-Only Scan
say.index: At selectivity {sel} (~{rows} rows) and random_page_cost = {rpc}, <em>Index Scan</em> wins (cost {cost}): so few heap pages are touched that building a bitmap or scanning the whole table cannot pay off.
say.bitmap: By selectivity {sel}, <em>Bitmap Heap Scan</em> takes over (cost {cost}): it deduplicates the ~{dp} matching heap pages and reads them in ascending block order instead of thrashing randomly. Seq Scan catches up at {cross}.
say.seq: At selectivity {sel} past the crossover, <em>Sequential Scan</em> wins at {cost}: almost every page has to be read anyway, so straight sequential streaming across 10,000 pages beats random index hops.
say.indexonly: With every page marked all-visible in the Visibility Map, <em>Index-Only Scan</em> (cost {cost}) never visits the heap at all and answers straight from the B-tree leaves.
:::

There is a notorious statistics trap here: the planner assumes single-column predicates are independent by default. If `city = 'Shanghai'` and `country = 'CN'` each match `10%` of rows, multiplying them predicts `1%` ({=ch2.corrEst} rows) when in truth they move together and match {=ch2.corrAct} rows—an underestimate of **{=ch2.corrRatio}×**, enough to trick the optimizer into a Nested Loop that runs orders of magnitude slower. Creating multi-column extended statistics (`CREATE STATISTICS`) fixes that independence blind spot.

The model omits: multi-table join cardinality, parallel gather worker allocation (`max_parallel_workers_per_gather`), and high physical correlation (`pg_stats.correlation`) discounting random seeks on clustered columns. Cost units are relative `costsize.c` figures, not wall-clock milliseconds. {.take}

## Slotted 8 KiB pages & HOT updates: why one update never overwrites in place {#ch3}

::: strings
toc: 8 KiB slotted pages & HOT
:::

PostgreSQL slices every table and index into 8,192-byte slotted pages where line pointers grow downward and tuples grow upward; `UPDATE` appends a fresh version instead of erasing old bytes, and only HOT updates keep indexes out of the loop when both versions share the same page. {.law}

Suppose you keep an accounting ledger in a paper notebook and realize an earlier amount was wrong. Crossing out the old line cleanly or painting over it hides history from anyone currently reading the ledger; instead, you mark the old entry retired, append the corrected line in the blank space on the same page, and draw an arrow from old to new. PostgreSQL heap pages work exactly this way.

Every block is `BLCKSZ = {=ch3.blcksz}` bytes (`pg_config_manual.h`). Offset `0` begins with a fixed **{=ch3.pageHdr}-byte** `PageHeaderData` (`bufpage.h`): 8-byte `pd_lsn`, 2-byte checksum, 2-byte flags, `pd_lower` (end of line pointers), `pd_upper` (start of tuple bytes), `pd_special` (`8192` on heap pages), page layout version, and `pd_prune_xid`. Immediately after byte `24`, **{=ch3.itemSz}-byte** `ItemIdData` line pointers grow downward toward higher offsets; row tuples carry a **{=ch3.tupFixed}-byte** fixed header (aligned to `t_hoff = {=ch3.tupAlign}` bytes on 64-bit CPUs, `htup_details.h`) plus 8-byte aligned column data, growing upward from `pd_special`.

::: diagram dg-pagelayout keys=dg.pagelayout
cap: Figure 3. Byte layout of an 8,192-byte heap page: after the 24 B header, 4 B line pointers grow toward higher addresses while tuples grow downward from the bottom, leaving free space in the middle.
aria: Diagram: 8192-byte slotted page showing 24-byte PageHeaderData, downward ItemIdData slots, free gap, and upward HeapTuple payloads
top: PageHeaderData (24 B)
hdr: lsn · flags · lower · upper
items: ItemIdData (4 B each)
lower: → pd_lower
free: Free space = pd_upper − pd_lower
tuples: HeapTuple (24 B hdr + data)
hot: t_ctid chains HOT updates
upper: ← pd_upper
special: pd_special: Heap=8192 / B-Tree=8176
:::

Why does free room inside each page matter so much? When a table keeps headroom (e.g., `fillfactor = 80`), three inserts followed by two updates leave {=ch3.defFree} free bytes right on the same page. As long as no indexed column changed, PostgreSQL performs a **HOT (Heap-Only Tuple) update**: the old tuple sets `t_ctid` to point to the new slot inside the same page and stamps `HEAP_HOT_UPDATED`, so B-tree indexes do not add a single entry—3 inserts + 2 updates cost just **{=ch3.defIdxWrites}** index writes total. Touch an indexed column or overflow the page, however, and even a 1-byte change forces fresh index writes ({=ch3.idxChangedWrites} or more).

::: lab ch3-model
model.title: 8,192-byte slotted page simulator: pd_lower, pd_upper & HOT chains
model.how: Click Insert Row or Update Row to watch line pointers and tuple payloads grow toward each other; lower fillfactor or increase payload size to trigger page overflow; tick "Indexed column changed" to force non-HOT index writes.
ctl.ins: Insert row
ctl.upd: Update row
ctl.rst: Reset page
ctl.ff: Fillfactor
ctl.pay: Payload (B)
ctl.idx: Indexed column changed
cv.aria: Live 8192-byte page map showing gold header, cyan live tuples, red dead tuples, and HOT t_ctid chain arrows
leg.hdr: 24 B header & line pointers
leg.live: Live tuple (LIVE)
leg.dead: Retired version (DEAD / HOT)
read.ptr: pd_lower / pd_upper
read.free: Free bytes left
read.hot: Same-page HOT updates
read.idx: Total index writes
say.hot: <em>{hot} same-page HOT updates</em> succeeded with {free} B free, keeping total index writes at just {idx} because each old row's <code>t_ctid</code> points straight to its successor on this page.
say.indexed: Even with {free} B free on the same page, changing an indexed column broke HOT eligibility and forced extra B-tree writes (<em>{idx}</em> index writes total).
say.full: Not enough free bytes remained on the page, so the update spilled to a new 8 KiB page, breaking the HOT chain and adding index writes (<em>{idx}</em> writes, {off} off-page).
:::

The model leaves out: opportunistic in-page HOT pruning and external TOAST storage when variable-width attributes exceed roughly 2 KiB. Little-endian packing of the 24-byte `PageHeaderData` and `ItemIdData` bitfields is verified byte for byte in `tools/crosscheck.cjs`. {.take}

## MVCC & snapshot visibility: why readers never block writers {#ch4}

::: strings
toc: MVCC & snapshot visibility
:::

Every row version carries the transaction IDs that created it (`xmin`) and retired it (`xmax`); each query takes a lightweight snapshot `{xmin, xmax, xip[]}` and resolves visibility with integer arithmetic—so readers never wait on writers, and writers never wait on readers. {.law}

If a library locked every shelf whenever a patron opened a book so no clerk could shelve a revised edition, reading would stall editing and editing would freeze reading. PostgreSQL's **Multi-Version Concurrency Control (MVCC)** avoids shared read/write locks altogether: chapter 3 showed how updates leave old tuples behind; this chapter shows how readers pick the right version out of that pile.

Every tuple header (`htup_details.h`) records two 32-bit transaction IDs: `t_xmin` (the creator transaction) and `t_xmax` (the deleter or updater, or `0` if alive). When a query starts, `GetSnapshotData()` (`procarray.c`) reads active process entries in shared memory and captures just three numbers: `snap.xmin` (oldest still-running transaction), `snap.xmax` (next unassigned future transaction ID), and `snap.xip[]` (the list of concurrent transactions active inside `[xmin, xmax)` at that instant).

::: diagram dg-mvtline keys=dg.mvtline
cap: Figure 4. SnapshotData records only three bounds: transactions below xmin committed earlier, transactions at or above xmax had not started, and those in between are checked against xip[].
aria: Diagram: timeline of concurrent transactions T100 through T103 intersected by reader snapshot bounds xmin, xmax, and xip[]
sxmin: snap.xmin=101
sxmax: snap.xmax=104
t100: T100 committed
t100s: xmin < 101 → visible
t101: T101 reader
t101s: Holds snapshot
t102: T102 commits later
t102s: In xip[] → hidden
t103: T103 rolls back
t103s: Aborted → dead
rule: Visible iff xmin committed & xmax not active
:::

`HeapTupleSatisfiesMVCC` evaluates pure visibility arithmetic: `t_xmin` must be committed and either `t_xmin &lt; snap.xmin` or (`t_xmin &lt; snap.xmax` and not in `snap.xip[]`); meanwhile, if `t_xmax` is nonzero, `t_xmax` must *not* be visible to the same snapshot. Once a reader checks commit status in `pg_xact`, it sets **Hint Bits** in `t_infomask` (`HEAP_XMIN_COMMITTED`) so subsequent scans skip commit-log lookups completely.

Compare isolation modes below: under default **`READ COMMITTED`**, reader T101 captures a fresh snapshot at every statement, so at step 2 it picks up T102's newly committed balance of **`{=ch4.rcVal}`**. Switch to **`REPEATABLE READ`**, and T101 freezes the snapshot from statement 1 across the entire transaction—so at steps 2 and 3 it still sees the consistent **`{=ch4.rrVal}`**, shielding the read from T102's commit, T103's abort, and T104's in-flight write.

::: lab ch4-model
model.title: MVCC snapshot & isolation level sandbox
model.how: Drag the statement step slider inside reader T101 to watch T102 commit, T103 abort, and T104 start a new write; toggle READ COMMITTED against REPEATABLE READ to see why each tuple version becomes visible or hidden.
ctl.iso: Isolation level
iso.rc: READ COMMITTED
iso.rr: REPEATABLE READ
ctl.step: Reader T101 statement step
cv.aria: Timeline of transactions T100 to T104 against T101's snapshot window [xmin, xmax) and xip[] set
col.ver: Version (balance)
col.xmin: t_xmin
col.xmax: t_xmax
col.vis: Visible?
col.why: HeapTupleSatisfiesMVCC reason
read.snap: Snapshot [xmin, xmax)
read.xip: Active xip[] list
read.val: Balance seen by T101
st.yes: Visible
st.no: Hidden
why.live_no_xmax: xmin precedes snapshot, xmax is 0
why.xmax_in_progress_still_live: xmax is in xip[] (uncommitted), row stays live
why.xmax_after_snap_still_live: xmax started after snapshot, row stays live
why.xmax_aborted_still_live: xmax aborted, deletion rolled back
why.deleted_by_visible_xmax: xmax committed within snapshot, row retired
why.xmin_in_progress: xmin is still active in xip[], hidden
why.xmin_aborted: xmin aborted, never born
why.xmin_after_snap: xmin is at/above snap.xmax, hidden
why.not_created_yet: Tuple not yet created at this step
say.rc: Under <em>READ COMMITTED</em> at step {step}, T101 took a fresh snapshot [{xmin}, {xmax}) and sees balance <em>{val}</em> (version {ver}). Aborted T103 and in-flight T104 stay cleanly invisible.
say.rr: Under <em>REPEATABLE READ</em> at step {step}, T101 reuses step 1's frozen snapshot [{xmin}, {xmax}), so despite T102 committing externally, T101 consistently reads <em>{val}</em> (version {ver}).
:::

The model leaves out: intra-transaction `t_cid` visibility for a transaction reading its own earlier writes, and predicate (`SIREAD`) conflict detection under `SERIALIZABLE`. Also note that in `REPEATABLE READ`, attempting to `UPDATE` a row already updated concurrently throws a serialization error rather than silently overwriting. {.take}

## VACUUM, FREEZE & 32-bit XID wraparound: why uncleaned tables halt the database {#ch5}

::: strings
toc: VACUUM & 32-bit XID wraparound
:::

Transaction IDs are 32-bit integers modulo 2³², where half the circle (2³¹ − 1) is treated as the past and the other half as the future; any live row left unfrozen past two billion transactions flips into the "future" and vanishes unless `VACUUM FREEZE` marks it permanently visible. {.law}

Zero read/write blocking and append-only updates carry an obvious debt: retired tuples and aging transaction IDs accumulate relentlessly. `VACUUM` pays two distinct debts without blocking ordinary queries: first, reclaiming dead space and maintaining the **Visibility Map (VM)**; second, **freezing ancient transaction IDs** before the 32-bit clock wraps around.

Dead tuples left behind by updates bloat heap pages and slow down every scan. Background `AUTOVACUUM` workers sweep tables online, mark dead tuples and their B-tree entries reusable, and set the `all-visible` bit in the **Visibility Map** whenever every row on an 8 KiB page is visible to all active transactions—that single VM bit is what unlocks chapter 2's heap-skipping **Index-Only Scan**.

The deeper deadline is **32-bit XID wraparound**. Because `TransactionId` is 32 bits wide (~4.29 billion IDs) and `varsup.c` / `transam.c` compare ages with signed modular subtraction `((int32)(id1 - id2)) &lt; 0`, any point up to **{=ch5.halfLimitM} million** (`2³¹ − 1`) steps behind `CurrentXID` counts as past, while the opposite half of the dial counts as future. Left unfrozen, a live row inserted at XID 1,000,000 suddenly crosses the `2³¹` boundary two billion transactions later and becomes invisible to every snapshot! That is why PostgreSQL triggers emergency anti-wraparound vacuum at **`autovacuum_freeze_max_age` = {=ch5.freezeAgeM}M** to stamp ancient rows `HEAP_XMIN_FROZEN`, and enters `xidStopLimit` around **{=ch5.stopAgeM}M** to refuse new writes before data disappears.

::: diagram dg-xidcircle keys=dg.xidcircle
cap: Figure 5. The 32-bit XID clock (modulo 2³²): the trailing semicircle (2³¹ − 1) is past; any unfrozen live row pushed past the bottom line wraps into the red future half.
aria: Diagram: 32-bit circular XID clock showing CurrentXID at top, green past semicircle, red future semicircle, 200M freeze trigger, and 2^31 wrap boundary
now: CurrentXID
freeze: 200M freeze
half: ±2³¹ (~2.147B) limit
past: Past (ok)
future: Future (bad)
frozen: VACUUM FREEZE pins live rows forever
:::

Slide "Transactions elapsed (M)" below to compare VACUUM disabled, standard `AUTOVACUUM` (firing emergency freezes at 200M), and aggressive freezing: with cleanup off or pinned by an idle transaction, 250M crosses the 200M trigger, 2,145M enters `xidStopLimit`, and 2,200M flips past `2³¹`.

::: lab ch5-model
model.title: Table bloat, Visibility Map & 32-bit XID wraparound clock
model.how: Switch the VACUUM policy and drag transactions elapsed (millions of XIDs); watch dead-tuple bloat and Visibility Map coverage above, and watch the oldest unfrozen XID approach 2³¹ on the circular dial below.
ctl.vac: VACUUM policy
vac.off: VACUUM off
vac.normal: Standard AUTOVACUUM
vac.freeze: Aggressive FREEZE
ctl.ep: Transactions elapsed (M)
cv.aria: Top plot of dead tuple percentage and VM coverage; bottom 32-bit circular XID wraparound clock
cv.past: Past
cv.future: Future
read.age: Oldest unfrozen XID age
read.dead: Dead tuple bloat
read.vm: VM all-visible pages
read.st: Database health status
st.healthy: Healthy
st.antiwrap: Anti-wraparound VACUUM
st.stoplimit: Refusing writes (xidStopLimit)
st.wrapped: Past 2³¹ wraparound!
say.healthy: Oldest unfrozen XID age is {age}M, safely below 200M. Dead tuples sit at {dead}% and the Visibility Map covers {vm}% of pages, enabling Index-Only Scans.
say.antiwrap: Oldest unfrozen XID age reached <em>{age}M</em> (past autovacuum_freeze_max_age = 200M), forcing anti-wraparound VACUUM; VM coverage fell to {vm}%, hurting Index-Only Scans.
say.stoplimit: Danger! Age hit <em>{age}M</em>, within 3M XIDs of 2³¹! PostgreSQL triggers <code>xidStopLimit</code> and refuses new write transactions until manual or single-user VACUUM FREEZE runs.
say.wrapped: Wraparound catastrophe: <code>int32(oldest - current)</code> flipped sign, making {age}M-old live rows appear to come from the future and vanish from every normal snapshot!
:::

The model leaves out: a single forgotten `idle in transaction` session pinning global `RecentXmin` so VACUUM runs yet cannot reclaim any dead rows, as well as emergency `INDEX_CLEANUP OFF` bypasses (PG 14+) and `MultiXactId` wraparound. {.take}

## Shared buffers & clock sweep: double buffering between Postgres and the OS {#ch6}

::: strings
toc: Shared buffers & clock sweep
:::

PostgreSQL caches 8 KiB pages in `shared_buffers` with a low-lock clock sweep (`usage_count` 0 to 5) while also reading and writing through the OS Page Cache—and without a small ring buffer, one giant sequential scan would flush hot pages right out of RAM. {.law}

Because disk reads are orders of magnitude slower than RAM, every database needs an in-memory buffer pool. Instead of a classic LRU doubly linked list—whose single global pointer mutex would serialize multi-core workers—`shared_buffers` manages fixed 8,192-byte frames via **Clock Sweep** (`src/backend/storage/buffer/freelist.c`). Every frame carries a tiny `usage_count` capped at **`5`** (`BM_MAX_USAGE_COUNT`). Each buffer hit increments `usage_count` by 1; whenever an uncached page needs a frame, the clock hand sweeps forward, decrementing `usage_count` by 1 until it meets an unpinned (`pin = 0`) frame at `0` and evicts it.

::: diagram dg-doublebuf keys=dg.doublebuf
cap: Figure 6. Double buffering: ordinary reads flow from storage through the OS Page Cache into shared_buffers; bulk sequential scans cycle inside a 256 KiB ring buffer so hot pages stay untouched.
aria: Diagram: data path from physical storage through OS Page Cache and shared_buffers clock pool or 256 KiB ring buffer to Executor
exec: Executor backend
sb: shared_buffers pool
clock: Clock Sweep (usage 0..5)
ring: BulkRead ring
os: OS Page Cache (kernel buffer)
osSub: Kernel page cache & dirty writeback
disk: NVMe / SSD storage
:::

Vanilla clock sweep still has a classic vulnerability: one huge sequential scan touching tens of thousands of cold pages will spin the clock hand a few times, drain every hot OLTP page's `usage_count` to zero, and wipe the cache clean. To prevent cache pollution, PostgreSQL gives bulk scans and `VACUUM` a tiny **Buffer Access Strategy ring**: a sequential scan cycles inside just **{=ch6.ringFrames} frames ({=ch6.ringKiB} KiB `BAS_BULKREAD`)**. Watch step 36 below: without ring protection, hot-page hits right after the scan collapse to **{=ch6.unprotPost}**; with `BAS_BULKREAD` enabled, hot pages stay warm at **{=ch6.ringPost}**!

::: lab ch6-model
model.title: shared_buffers clock sweep & ring buffer protection
model.how: Switch workloads between pure OLTP, unprotected sequential scan, and BAS_BULKREAD ring protection; drag the step slider to watch the clock hand decrement usage_count and spare or evict hot pages H1–H4.
ctl.wl: Workload
wl.oltp: Pure OLTP hot set
wl.unprot: Hot + unprotected scan
wl.ring: Hot + ring buffer
ctl.step: Access step
ctl.fr: Pool frames
cv.aria: Circular buffer frame clock diagram showing frame page IDs, usage_count 0..5, ring frames, and clock hand position
read.hit: Overall hit ratio
read.post: Post-scan hot hits
read.evict: Total evictions
read.hand: Clock hand index
say.oltp: Pure OLTP repeatedly hits H1–H4, building <code>usage_count</code> up to 5 with <em>{hit}</em> overall hit ratio and zero evictions.
say.unprot: 24 sequential scan blocks swept into the main pool, draining H1–H4 down to zero and evicting all four! Post-scan hot probes immediately fell to <em>{post}</em> hits.
say.ring: With <code>BAS_BULKREAD</code> active, scan blocks cycled inside the violet ring frames, leaving all four hot OLTP pages intact for <em>{post}</em> post-scan hits.
:::

Also notice the OS layer in Figure 6: unless Direct I/O is used, an 8 KiB page travels through **both** the OS Page Cache ([[how-the-os-talks-to-hardware]]) and `shared_buffers`, keeping two copies in RAM—why PostgreSQL commonly tunes `shared_buffers` to ~25% of physical RAM rather than 80%, leaving memory for OS write buffering and cold reads. The model omits background writer dirty-page flushing. {.take}

## B-tree indexes (Lehman & Yao): lock-free concurrent search & page splits {#ch7}

::: strings
toc: B-tree indexes & page splits
:::

PostgreSQL's default B-tree (`nbtree`) stores an upper-bound High Key and a right-sibling pointer in every page trailer so readers drop parent latches immediately and step right if a page splits mid-search—while random keys leave pages ~60–75% full and double write amplification. {.law}

Classic textbook B-trees struggle under concurrency: if a writer splits a full leaf and climbs up to update its parent while a reader is descending through that very link, naive locking blocks readers across upper tree levels. PostgreSQL's `nbtree` adopts **Lehman & Yao (1981) B-link trees** to keep readers lock-free across levels.

Each B-tree page reserves **{=ch7.btOpaque} bytes** in `pd_special` for `BTPageOpaqueData` (`nbtree.h`), storing `btpo_prev`, `btpo_next`, level, and flags; every non-rightmost page puts its upper bound (`P_HIKEY`) in slot 1. A descending reader releases the parent latch *before* latching the child: if a concurrent split just moved higher keys into a new right sibling and lowered the old page's `P_HIKEY`, the reader checks `key &gt;= P_HIKEY` and simply hops right along `btpo_next` without restarting from the root!

::: diagram dg-nbtreesplit keys=dg.nbtreesplit
cap: Figure 7. Lehman & Yao concurrent split: after splitting out P2, P1 sets HIKEY = 30 and links btpo_next → P2; a reader arriving via a stale parent pointer checks HIKEY and hops right.
aria: Diagram: parent downlink pointing to split leaf page P1 with HIKEY and btpo_next arrow to right sibling P2
parent: Parent (stale downlink)
p1: Left leaf P1
hikey: HIKEY = 30
p2: Right sibling P2
inf: Rightmost (∞)
next: btpo_next
walk: key ≥ 30 → hop right via btpo_next
opaque: BTPageOpaqueData = 16 B trailer
:::

Free concurrent splits still obey insertion-order geometry. Feed monotonically ordered keys (`serial` or PostgreSQL 18's time-ordered `uuidv7()`), and `nbtsplitloc.c`'s rightmost-append split fills old leaves nearly solid—24 keys take just **{=ch7.seqLeaves} leaves** at **{=ch7.seqFill}** fill. Feed random UUIDv4 keys, and scattered inserts split interior pages early into **{=ch7.randLeaves} leaves** at **{=ch7.randFill}** fill—at scale, ~50–70% random fill nearly doubles index size, WAL volume, and buffer misses.

::: lab ch7-model
model.title: nbtree insertion order, page splits & High-Key right hops
model.how: Toggle Sequential (serial / UUIDv7) vs Random (UUIDv4) key arrivals and adjust inserted key count to compare leaf count and fill factor; tick "Simulate concurrent split read" to watch a stale reader hop right across btpo_next.
ctl.ord: Key insertion order
ord.seq: Sequential (serial / UUIDv7)
ord.rand: Random (UUIDv4)
ctl.cnt: Keys inserted
ctl.split: Simulate concurrent split read
cv.aria: Two-level B-tree diagram showing leaf page keys, HIKEY bounds, btpo_next sibling links, and reader right-hop path
cv.stat: {fill}% avg fill · {splits} splits
read.leaves: Leaf pages
read.splits: Total page splits
read.fill: Avg page fill
read.hops: Right-link hops
say.seq: Monotonic appends triggered rightmost-biased splits, packing {cnt} keys into {leaves} leaves ({splits} splits, <em>{fill}%</em> fill).
say.rand: Random UUIDv4-style keys punctured middle pages for {splits} splits across {leaves} leaves, dropping fill to <em>{fill}%</em> and bloating index footprint.
say.hop: Under concurrent split simulation, a reader following a stale downlink saw key ≥ <code>P_HIKEY</code> and hopped <em>{hops} page(s) right</em> along <code>btpo_next</code> to finish safely.
:::

The model leaves out: key deduplication on equal keys (PG 13+) and `VACUUM`'s two-phase empty-page deletion (`BTP_HALF_DEAD`). Adding non-key columns via `INCLUDE (...)` builds covering indexes that work with chapter 5's Visibility Map for Index-Only Scans. {.take}

## Join algorithms & `work_mem`: what happens the moment hash tables spill to disk {#ch8}

::: strings
toc: Join algorithms & work_mem spill
:::

Joining two relations pits Nested Loop against Merge Join and Hash Join; once the build-side hash table exceeds `work_mem`, PostgreSQL partitions buckets into Grace Hash batches and spills unmatched rows to temporary files in `pgsql_tmp`. {.law}

Match 80,000 orders against 400,000 accounts on `account_id`, and the executor has three ways to pair them: **Nested Loop** probes the inner side once per outer row (fastest when the outer side is tiny and the inner side has a B-tree index, otherwise $O(N \cdot M)$); **Merge Join** zips two pre-sorted streams in linear time; and **Hash Join** (`nodeHash.c`) builds an in-memory hash table on the smaller relation and streams the larger relation once.

The sharp cliff is **`work_mem` (default `4 MiB`)**, budgeted **per sort or hash node**, not per connection. A single complex query with three Hash Joins and two Sorts can allocate `5 × work_mem` per session. To protect RAM, `nodeHash.c` checks whether the hash table fits; once it exceeds `work_mem`, it switches to **Multi-Batch Grace Hash Join** (`nbatch` = 2, 4, 8, ...), keeps only Batch 0 in RAM, and spills remaining build and probe tuples to temporary disk files under `base/pgsql_tmp/` to re-read batch by batch.

::: diagram dg-joinspill keys=dg.joinspill
cap: Figure 8. Across the work_mem cliff: a 1-batch Hash Join streams the probe table once in RAM; past work_mem, Grace Hash writes spilled partitions to pgsql_tmp and reads them back.
aria: Diagram: top showing 1-batch in-memory Hash Join; bottom showing multi-batch Grace Hash spilling partitions to pgsql_tmp disk
inMem: Fits in work_mem (nbatch = 1)
ramBox: Full build hash table stays in RAM
ramSub: Single streaming pass over probe table
spill: Exceeds work_mem (nbatch = 2, 4, ...)
b0: Batch 0 in RAM
b0Sub: Match partition 0 first
bDisk: pgsql_tmp
bDiskSub: Spill batches 1..k
note: Larger work_mem stops spills (per node)
:::

Below, 80,000 build rows take **{=ch8.hashSizeMiB} MiB** in a hash table. At default `work_mem = 4 MiB`, PostgreSQL splits the join into **{=ch8.hash4Batch} batches** and spills **{=ch8.hash4Spill} MiB** to temporary disk; bump `work_mem` to `16 MiB` past the threshold, and batches drop back to **{=ch8.hash16Batch}** with zero disk spill.

::: lab ch8-model
model.title: Join cost comparison & the work_mem spill cliff
model.how: Drag work_mem (MiB) to watch Hash Join drop sharply as nbatch falls back to 1; vary outer build row count and tick "Inner B-tree index" to see when Nested Loop beats Hash Join.
ctl.wm: Operator memory work_mem (MiB)
ctl.out: Outer / build rows
ctl.idx: Inner B-tree index exists
cv.aria: Comparison chart of Hash Join, Merge Join, and Nested Loop cost and batch spill curve across work_mem
leg.hash: Hash Join
leg.merge: Merge Join
leg.nest: Nested Loop
read.win: Winning join plan
read.mem: Hash table memory needed
read.bat: Hash batches (nbatch)
read.spill: Temp disk spill
join.hash: Hash Join
join.merge: Merge Join
join.nest: Nested Loop
say.inmem: Build table needs {mem}, fitting inside work_mem = {wm} MiB: Hash Join runs in <em>1 batch (pure RAM)</em> with zero temp-file I/O.
say.spill: Hash table ({mem}) exceeds work_mem = {wm} MiB! Hash Join splits into <em>{bat} batches</em>, spilling <em>{spill} MiB</em> to <code>pgsql_tmp</code>; raising session work_mem clears this cliff immediately.
say.nestwin: With only {rows} outer rows and an inner B-tree index, <em>Nested Loop</em> wins via fast indexed probes without scanning or hashing the large inner table.
:::

The model omits: Parallel Shared Hash sharing buckets across parallel workers, and dynamic batch doubling triggered mid-execution by skewed hash keys. Remember that `CREATE INDEX` and `VACUUM` draw from `maintenance_work_mem`, not `work_mem`. {.take}

## WAL, LSN & Full-Page Writes: surviving an 8 KiB torn page on crash {#ch9}

::: strings
toc: WAL & Full-Page Writes
:::

Modified 8 KiB heap and index pages linger in `shared_buffers`, while sequential redo records flush to WAL before `COMMIT` succeeds; the first change to any page after a checkpoint logs the entire 8 KiB page image (`FPW`) so crash recovery never replays deltas onto a half-written disk block. {.law}

Flushing scattered 8 KiB data pages directly to storage on every transaction would cripple throughput on random I/O (see [[what-a-drive-is-made-of]]). PostgreSQL writes changes sequentially to **Write-Ahead Log (`pg_wal/`, {=ch9.walSegMiB} MiB segments)**, stamping each record with a monotonically rising 64-bit **`XLogRecPtr` (LSN)** and a **Castagnoli CRC-32C** checksum (`pg_crc32c_sb8.c`, where `"123456789"` evaluates to `{=ch9.crcTest}`). Once the WAL record hits disk via `fsync`, `COMMIT` returns while dirty data pages wait in `shared_buffers`.

Power loss mid-flush exposes the **8 KiB torn-page hazard**: OS filesystems and drives commit 4 KiB or 512 B blocks ([[what-a-drive-is-made-of]]), so a crash halfway through flushing an 8 KiB page leaves 4 KiB of new bytes glued to 4 KiB of stale bytes! Replaying a tiny 76-byte delta onto a half-torn page produces silent corruption. With **`full_page_writes = on`**, PostgreSQL writes the **entire 8 KiB page image (FPW)** into WAL on the *first* touch to any page after a checkpoint, switching back to compact deltas until the next checkpoint. Crash recovery restores the intact 8 KiB FPW first, then replays subsequent LSN deltas cleanly.

::: diagram dg-walfpw keys=dg.walfpw
cap: Figure 9. Surviving an 8 KiB torn page: power loss splits two 4 KiB sectors across different LSNs, and the post-checkpoint 8 KiB Full-Page Write restores a clean base before delta replay.
aria: Diagram: 8 KiB page split at 4 KiB boundary on disk, WAL stream holding 8 KiB FPW image followed by compact deltas, and intact recovered block
diskTitle: Torn 8 KiB page on disk
sec1: 1st 4 KiB (new)
sec2: 2nd 4 KiB (old)
walTitle: WAL record stream
fpw: 8 KiB FPW image
delta: 76 B WAL delta
fix1: Recovery: overwrite torn page with FPW
fix2: Then replay LSN deltas → CRC-32C passes
:::

The trade-off is stark: scattered random updates across 8,000 cold pages under a short `checkpoint_timeout` (default 5 min) trigger constant FPWs—in our model below, FPWs swallow **{=ch9.randFpwPct}** of total WAL traffic on random updates versus just **{=ch9.seqFpwPct}** on hot sequential updates. Stretching `checkpoint_timeout` slashes WAL write amplification, at the direct price of longer WAL replay after a crash.

::: lab ch9-model
model.title: WAL Full-Page Write amplification vs crash recovery time
model.how: Drag checkpoint_timeout (minutes) to trace the tug-of-war between WAL bandwidth and crash replay duration; switch between scattered random updates and hot-page updates, or uncheck full_page_writes to see CRC-32C fail on a torn 4 KiB block.
ctl.wl: Update footprint
wl.rand: Scattered random pages
wl.seq: Hot concentrated pages
ctl.ckpt: checkpoint_timeout
ctl.fpw: Enable full_page_writes
cv.aria: Dual-curve trade-off plot of WAL write rate (MiB/s) and estimated crash recovery time (seconds) against checkpoint_timeout
cv.x: checkpoint_timeout (minutes)
cv.y: WAL rate (MiB/s) / recovery (s)
leg.wal: WAL write rate (MiB/s)
leg.rec: Crash replay time (s)
read.wal: Total WAL write rate
read.fpw: FPW share of WAL
read.rec: Est. crash replay time
read.torn: 8 KiB torn-page check
torn.ok: FPW overwrite · Safe
torn.bad: CRC-32C mismatch! Corrupt
say.safe: With <code>full_page_writes = on</code> and {ckpt}-min checkpoints under {wl}, WAL runs at <em>{rate} MiB/s</em> ({fpw}% FPW) with ~<em>{rec} s</em> replay; any 4 KiB torn block is safely overwritten and matches {crc}.
say.unsafe: Warning! Turning <code>full_page_writes</code> off cuts WAL to {rate} MiB/s, but a 4 KiB power-loss split changes CRC-32C to {tornCrc} (≠ {crc}) with no full image to recover—safe only if storage guarantees atomic 8 KiB writes.
:::

The model leaves out: `wal_compression` (`lz4`/`zstd`) shrinking empty space inside FPW frames, and `checkpoint_completion_target = 0.9` pacing dirty buffer writes smoothly across the interval to prevent I/O stalls. {.take}

## Where the frontier is (November 2026) {#ch10}

::: strings
toc: Where the frontier is
:::

Decades of synchronous blocking I/O, leftmost-prefix index locks, and table-locking rebuilds are giving way: PostgreSQL 18 introduced native Asynchronous I/O and B-tree Skip Scans, PostgreSQL 19 (19 November 2026) shipped online `REPACK (CONCURRENTLY)` and plan advice, and `pgvector` stores HNSW graphs inside Postgres's own 8 KiB shared buffers and WAL. {.law}

This chapter separates **established mechanics**, **shipped engineering with exact release dates**, and **workload-dependent claims and open limits**.

### Established {#h.est .sub3}

- <span class="tag h">Established</span> **Page format & concurrent index foundations**: `PageHeaderData` (24 B), `ItemIdData` (4 B), `HeapTupleHeaderData` (23 B fixed + alignment), Lehman &amp; Yao High-Key + right-link B-trees, and Castagnoli CRC-32C (`0x82F63B78`) remain the stable physical contract shared across major releases. {#e1}
- <span class="tag h">Established</span> **32-bit XID modular bounds**: As long as `t_xmin` and `t_xmax` occupy 4 bytes inside every tuple header, the `2³¹` half-circle horizon and periodic `VACUUM FREEZE` remain mathematical invariants rather than optional tuning knobs. {#e2}

### Already built (as of November 2026) {#h.demo .sub3}

- <span class="tag m">Built &amp; Shipped</span> **PostgreSQL 18 Asynchronous I/O &amp; B-Tree Skip Scans** (18.0 released 25 September 2025; 18.1 on 13 Nov 2025, 18.2 on 12 Feb 2026, 18.3 on 26 Feb 2026): Replacing decades of synchronous blocking reads, PG 18 added `io_method` (`sync`, background `worker` pool, and native Linux kernel 5.1+ `io_uring`, see [[how-the-os-talks-to-hardware#ch11]]) so sequential scans, bitmap heap scans, and `VACUUM` overlap multiple I/O reads concurrently. PG 18 also shipped **B-tree Skip Scans** (allowing composite indexes to serve queries omitting low-cardinality leading columns), default data checksums in `initdb`, and time-ordered `uuidv7()` built in (directly mitigating chapter 7's random UUIDv4 split bloat). {#d1}
- <span class="tag m">Built &amp; Shipped</span> **PostgreSQL 19 online `REPACK` &amp; plan stability** (released 19 November 2026): PG 19 introduced native **`REPACK (CONCURRENTLY)`** to reclaim table bloat and re-cluster rows online without blocking concurrent readers/writers (replacing locking `VACUUM FULL` / `CLUSTER`), added `pg_plan_advice` / `pg_stash_advice` to lock query plans without rewriting SQL, and added standby `WAIT` for read-your-writes consistency. {#d2}
- <span class="tag m">Built &amp; Shipped</span> **`pgvector` HNSW inside 8 KiB pages** (v0.8.0 released 30 October 2024; v0.8.1 released 4 September 2025): Rather than running a separate vector daemon, `pgvector` maps multi-layer HNSW graphs directly onto PostgreSQL 8 KiB pages, `shared_buffers`, and WAL for full MVCC consistency; v0.8.0 introduced **iterative index scans (`hnsw.iterative_scan`)** and revised cost estimates to prevent filtered vector queries from returning too few rows under selective `WHERE` clauses. {#d3}
- <span class="tag m">Built &amp; Shipped</span> **Scale-out &amp; high-availability architectures**: **Citus** shards tables across worker nodes with local B-tree/HNSW indexes and coordinator fan-out; **Patroni** pairs PostgreSQL WAL streaming with etcd consensus for automated failover (principles covered in [[distributed-systems]]). {#d4}

### Claims, benchmarks & open limits {#h.claim .sub3}

- <span class="tag l">Claims &amp; Limits</span> **AIO gains depend on cold storage latency**: Release testing and benchmarks report up to 2–3× throughput gains under `io_method = io_uring` or `worker` on cold-cache sequential scans, bitmap scans, and `VACUUM` over high-latency storage—yet when hot data already resides in `shared_buffers` or the OS Page Cache, asynchronous syscalls offer little gain. {#c1}
- <span class="tag l">Claims &amp; Limits</span> **HNSW memory thrashing at scale**: Because HNSW traversal issues random page hops across a large graph, performance degrades steeply once the index outgrows `shared_buffers` + RAM; extensions such as `pgvectorscale` explore DiskANN quantization to keep navigation graphs memory-resident while `pgvector` continues adding index AIO and vacuum tracking. {#c2}
- <span class="tag l">Claims &amp; Limits</span> **Three enduring structural tradeoffs**: 64-bit `FullTransactionId` tracking in PG 17/18/19 has not replaced 32-bit `t_xmin`/`t_xmax` in tuple headers; `UPDATE` still writes a full new tuple even for a 1-byte change unless HOT applies; and double buffering between `shared_buffers` and the OS Page Cache persists until full Direct I/O adoption matures. {#c3}

Release numbers, dates, and extensions evolve continuously: every status entry in this chapter reflects **November 2026**. {.take}

## Wrap-up: when a query slows, stalls, or bloats, ask three questions {#ch11}

::: strings
toc: Wrap-up: ask three questions
:::

You do not need every C struct memorized. When PostgreSQL misbehaves, ask three questions: Where did row-count estimates diverge from reality? How many extra 8 KiB pages did this query read or dirty? What is pinning `xmin` or spilling out of `work_mem`? {.law}

{.qs}
- **Did cardinality or memory sizing break down?** Run `EXPLAIN (ANALYZE, BUFFERS)`: if `actual rows` dwarfs estimated `rows` by orders of magnitude, refresh `ANALYZE` or add `CREATE STATISTICS` (ch 2); if `Buffers: shared read` spikes or Hash Join reports `Batches: &gt; 1` / `Disk:` sort spills, tune `work_mem`, `shared_buffers`, and SSD `random_page_cost` (ch 2, 6, 8). {#q1}
- **Are dead tuples or non-HOT updates choking the table?** Inspect `pg_stat_user_tables` (`n_dead_tup`, `n_tup_hot_upd`) and XID freeze age: a forgotten `idle in transaction` session pins global `xmin`, blocking `AUTOVACUUM` from reclaiming dead rows, starving the Visibility Map needed by Index-Only Scans, and pushing toward the 200M anti-wraparound threshold (ch 3, 4, 5). {#q2}
- **Are random B-tree splits or post-checkpoint FPWs driving write latency?** Random UUIDv4 keys split B-tree leaves around ~50–75% fill and inflate buffers (consider `uuidv7()`, ch 7); scattered updates right after checkpoints trigger massive 8 KiB Full-Page Writes in WAL, pointing to `checkpoint_timeout` and `fillfactor` tuning (ch 3, 9). {#q3}

In one sentence: PostgreSQL runs a query safely and fast through four interlocking mechanisms—**8 KiB slotted pages, MVCC snapshot arithmetic, a statistics-driven cost planner, and sequential WAL + FPW durability before lazy data-page writes**. {#sum .sum}

Related essays down the OS and hardware stack: [[what-a-drive-is-made-of]] (sectors, flash erase vs overwrite, and `fsync`), [[how-the-os-talks-to-hardware]] (syscalls, OS Page Cache, and `io_uring`), [[how-cores-share-memory]] (cache coherence and buffer spinlocks), and [[distributed-systems]] (replication consensus and replicas). {#links}

::: footer
**Sources &amp; versions.** Internal layouts, bitfields, and cost constants follow the **PostgreSQL 17.6** (14 August 2025) and **PostgreSQL 18.0** (25 September 2025) source specifications: `src/include/pg_config_manual.h` (`BLCKSZ = 8192`), `src/include/storage/bufpage.h` (24 B `PageHeaderData`), `src/include/storage/itemid.h` (4 B `ItemIdData`), `src/include/access/htup_details.h` (23 B fixed header aligned to 24 B `t_hoff`), `src/backend/optimizer/path/costsize.c` (`seq_page_cost = 1.0`, `random_page_cost = 4.0`, `cpu_tuple_cost = 0.01`, `cpu_index_tuple_cost = 0.005`, `cpu_operator_cost = 0.0025`, and Mackert–Lohman `index_pages_fetched`), `src/backend/storage/ipc/procarray.c` &amp; `heapam_visibility.c` (`SnapshotData`, `HeapTupleSatisfiesMVCC`), `src/backend/access/transam/varsup.c` / `transam.c` (32-bit modular XIDs, `autovacuum_freeze_max_age = 200M`), `src/backend/storage/buffer/freelist.c` (`usage_count` 0..5 clock sweep &amp; 256 KiB `BAS_BULKREAD` ring), `src/backend/access/nbtree/` (Lehman &amp; Yao 16 B `BTPageOpaqueData`, `P_HIKEY`, rightmost split), `src/backend/executor/nodeHash.c` (Grace multi-batch hash spill), and `src/backend/access/transam/xlog.c` &amp; `src/port/pg_crc32c_sb8.c` (16 MiB WAL segments, Full-Page Writes, reflected `0x82F63B78` Castagnoli CRC-32C). Frontier release dates verified against official PostgreSQL announcements (17.6, 18.0–18.3, 19.0 on 19 November 2026) and pgvector changelogs (v0.8.0 on 30 October 2024; v0.8.1 on 4 September 2025). Detailed source mappings and omissions are recorded in `BRIEF.md`.

**Models &amp; verification.** No `postgres` or `psql` binary is installed on this host, and the page loads no external database; `models.js` reimplements all eight models from the specifications above, and `tools/crosscheck.cjs` independently verifies binary 8,192-byte page header &amp; `ItemIdData` packing, Castagnoli CRC-32C test vectors (`"123456789"` → `{=ch9.crcTest}`), MVCC visibility truth tables, 32-bit wraparound arithmetic, `costsize.c` cost equations, clock-sweep eviction, and multi-batch hash spills. Written from scratch with Antigravity AI.
:::
