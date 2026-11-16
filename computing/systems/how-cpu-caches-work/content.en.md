---
lang: en
title: How a CPU's Three Levels of Cache Work · a long essay you can play with
desc: Memory takes tens of nanoseconds and a CPU does several things every nanosecond. How do caches of tens of kilobytes to tens of megabytes keep it from waiting most of the time? Why three levels, and why is each the size it is? Ten cache models run on real address traces: splitting an address, associativity and the three kinds of miss, LRU and RRIP, write-back and write buffers, inclusive and exclusive levels, the limit on L1 size, prefetching, MESI and false sharing, and the latency staircase of a pointer chase.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.cyc: {v} cycles
u.ns: {v} ns
u.B: {v} bytes
u.KiB: {v} KiB
u.MiB: {v} MiB
u.x: ×{v}
u.none: —
:::

# How a CPU's Three Levels of Cache Work {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

Memory takes {dramNs} ns, and a CPU does several things every nanosecond.<br>How do caches of tens of kilobytes to tens of megabytes keep it from waiting most of the time? {.sub}

The second question follows: why three levels, and why is each one the size it is? We start with one address: how it is cut into three parts and which set it lands in; when the set is full, what gets evicted; when written data is really sent on; how the three levels share the work; why L1 has stayed small for decades; how the prefetcher guesses the next line; how values stay current when several cores each hold a copy; and finally how to measure these steps on your own computer. **Every model is a real cache, run one access at a time over a stream of addresses that the page generates**, or a named textbook result (Mattson's reuse distance, Belady's optimal replacement, Hill's three kinds of miss, Chen and Baer's stride prefetching, the MESI protocol). {.lead}

An AI wrote this page. The capacities, way counts and latencies of real chips come from vendor documents (AMD's optimisation guide, and the slides AMD and Intel presented at Hot Chips 2024 and Intel's 2024 technology tour) and from public measurements (Chips and Cheese). Each one gives its source and date. **Values marked “tuned parameter” were chosen so the models could compute them; they were not measured**. The text says how far each conclusion moves when one of them is doubled. This page explains mechanisms only. **It does not rate which chip is worth buying**. {.note}

## Why cache at all, and why more than one level {#ch1}

::: strings
toc: Why cache at all, and why more than one level
:::

Bigger storage is slower: longer wires and more places to compare. So we build several levels, small and fast nearest the core and large and slow further out, so that most accesses finish at the nearest level. {.law}

A desktop processor runs at up to {ghz} GHz, so one cycle is under a fifth of a nanosecond, and each cycle can issue several instructions. Reading one value from memory takes about {dramNs} ns, or roughly {dram} cycles. If every read went to memory, the core would spend nearly all its time waiting. The full latency ladder from registers to memory is drawn in <a href='../why-compute-waits-for-memory/#ch2'>Chapter 2 of “Why Compute Waits for Memory”</a>; this essay takes each rung apart.

Why not build one large, fast cache? Because it cannot be done. The table below gives the latencies from vendor documents. AMD's Zen 5 L1 data cache is {zL1} KiB and returns data in {zL1lat} cycles; its L2 is {zL2} MiB at {zL2lat} cycles; its L3 is {zL3} MiB at an average of {zL3lat} cycles. Intel's Lion Cove, from 2024, grew L1 to {lcL1} KiB, and its latency rose to {lcL1lat} cycles, so Intel put a further level in front of it: an “L0” of {lcL0} KiB at {lcL0lat} cycles. The bigger the storage array, the longer the signals must travel and the more tags must be compared, and that does not fit in one cycle.

::: html ch1-html
th.chip: Chip
th.level: Level
th.size: Size
th.lat: Latency
:::

The table shows a pattern: taking Zen 5, each cache level outwards is twenty to thirty-odd times larger and three or four times slower; going from L3 to memory is another eight or nine times slower. With levels stacked, the average access time is the share of accesses each level catches, multiplied by that level's latency, summed over the levels (the general formula for average access time is in <a href='../why-compute-waits-for-memory/#ch4'>Chapter 4 of that essay</a>). Which level catches which accesses depends on the program. The program below alternates four kinds of work.

::: lab ch1-model
model.title: Switch each level on or off and see the average wait
model.how: The program alternates four kinds of access. {pStack} of accesses go to the stack and local variables, a {szStack} KiB region. {pWork} sweep again and again through a {szWork} KiB working array. {pTable} look up a table ({szTable} MiB by default; adjustable). {pStream} read a stream that never comes back. These shares and sizes are **tuned parameters**, chosen to stand for an ordinary program. Capacities and latencies are Zen 5's documented figures, and the {dramNs} ns of memory is converted to cycles at {ghz} GHz. Whether a level can hold a set of data follows from its LRU reuse distance (see below). The tests replay a real interleaved address sequence through the models, and the results agree.
model.aria: Bar chart: average cycles per access for several cache combinations, with the current one highlighted
ctl.levels: Caches on
lv.l1: L1
lv.l2: L2
lv.l3: L3
ctl.table: Lookup table size
read.amat: Average per access
read.ns: In time ({ghz} GHz)
read.mem: Accesses that go to memory
read.vs: compared with all three levels on
chip.zen: AMD Zen 5 (Ryzen 9 9950X)
chip.lc: Intel Lion Cove
chip.ll: Lunar Lake, shared
lv.mem: Memory
lat.dram: about {ns} ns ≈ {c} cycles
lat.na: —
cf.none: No cache
cf.l1: L1 only
cf.l3: L3 only
cf.l13: L1 + L3
cf.l12: L1 + L2
cf.l123: L1 + L2 + L3
cf.yours: Your choice
say.none: No cache: every access goes to memory, averaging *{amat}*.
say.three: All three levels on, lookup table {table}: only {mem} of accesses go to memory, averaging *{amat}*.
say.threeSpill: The lookup table, {table}, is already bigger than L3, so L3 cannot hold it either: {mem} of accesses go to memory, averaging *{amat}*. Shrink the table until it fits in L3, then look again.
say.nol1: No L1: even the small set of most-used data must come from L2 or further out, averaging *{amat}*, which is {x} times the figure with all three levels on ({best}).
say.partial: With this setup the average is *{amat}*, which is {x} times the figure with all three levels on ({best}); {mem} of accesses go to memory.
:::

With all three levels on, the average is {amat3} cycles per access. With only L1 it becomes {amat1}; only L3 gives {amatL3}; L1 with L2 gives {amat12}, and L1 with L3 gives {amat13}; with no cache at all it is {amat0}. Notably, with all three levels on, only {memShare} of accesses go to memory, yet they take {memPart} of the total time. One memory access costs as much as a hundred or more L1 hits, so cutting even a few memory accesses is worth another level.

Which level catches which data depends on its **reuse distance**: the number of distinct lines touched between one use of a line and its next use (Mattson et al., 1970). In an LRU cache, a line survives exactly when that number is smaller than the number of lines the cache holds. In this program the stack's reuse distance is {dStack} lines and L1 holds {l1Lines} lines, so the stack lives in L1. The working array's distance is {dWork} lines: too big for L1, but it fits in L2. The lookup table's is {dTable} lines, which only L3 can hold. Push the table up to 32 MiB and it no longer fits even in L3; the average jumps at once to {amatBig} cycles, the same as having no L3. The benefit of a cache is not smooth: the boundary between fitting and not fitting is sharp.

The model assumes each level is an ideal LRU and that each data set is swept in order, so every data set is either wholly in a level or wholly out of it. Real programs access data less regularly, and the steps are rounder. Latencies are the documented cycles from request to usable data; the model does not count the waiting that prefetching and out-of-order execution hide. {.take}

## How an address is split {#ch2}

::: strings
toc: How an address is split
:::

A cache moves data in lines of 64 bytes. An address is cut into three parts: the lowest bits are the offset within the line, the middle bits pick the set, and the high bits form the tag, which identifies the line within its set. {.law}

A cache never moves a single byte. Reading one byte brings in a whole 64-byte line. Zen 5, Intel and Neoverse V3 all use 64-byte lines; the Mac this page was written on reports {apLine} bytes. The neighbours come in free, which is why reading an array in order is fast. <a href='../why-compute-waits-for-memory/#ch2'>Chapter 2 of that essay</a> covers the difference between walking rows and walking columns.

A cache is not one big box. It is divided into many **sets**, each with several slots called **ways**. An address can go into only one fixed set. Take Zen 5's L1 data cache: {zL1} KiB in {zL1w} ways, with 64-byte lines, gives {z1sets} sets. So the lowest 6 bits pick the byte within the line, the next {z1idx} bits pick the set, and together these make the lowest {z1low} bits; everything above is tag. The L2 has {z2sets} sets, so its set index is {z2idx} bits. A CCX's L3 has {z3sets} sets, with a {z3idx}-bit index, and the lowest {z3low} bits are all used to locate a byte.

::: diagram dg-split keys=dg.split
cap: How Zen 5's L1 data cache splits an address: {zL1} KiB, {zL1w}-way, 64-byte lines, giving {z1sets} sets. Bit positions are for a 48-bit virtual address; the tag actually compared comes from the translated physical address (Chapter 7).
aria: Diagram: Zen 5 L1 data cache splits a 48-bit address into tag, set index and offset
tag: Tag · {tb} bits
tagS: Tag {tb} bits
idx: Set index · {ib} bits
idxS: Set {ib}
off: Offset · {ob} bits
offS: Offset {ob}
e1: Tag: in the selected set, compared with the tags of all {ways} ways at once; a match is a hit
e2: Set index: {ib} bits, choose one of {sets} sets
e3: Offset: {ob} bits, choose one byte in the 64-byte line
:::

::: lab ch2-model
model.title: Split an address
model.how: Type any hexadecimal address, pick a cache level, and see it cut into tag, set index and offset. The real L3 scrambles the address before spreading it across its slices (Chapter 6); here the simple textbook split is used.
ctl.addr: Addr
ctl.cache: Cache
cfg.l1: Zen 5 L1D
cfg.l2: Zen 5 L2
cfg.l3: Zen 5 L3
cfg.toy: Toy cache
read.tag: Tag
read.index: Set index
read.offset: Offset within line (bytes)
read.sets: Sets at this level
:::

The set index is taken straight from the address, so two addresses that differ by a whole multiple of (number of sets × line size) land in the same set. A tiny cache makes this clear: 128 bytes, 16-byte lines, direct-mapped (one slot per set), 8 sets in all. The program computes the dot product of two arrays.

::: lab ch2-lab
model2.title: A dot product on a toy cache
model2.how: a and b each hold 8 4-byte numbers, and a[i] and b[i] are read alternately. Choose where b starts and the number of ways, then step through to see which set each access falls in, and whether it hits or misses.
code.aria: Code of the dot-product loop
code: "float x = 0;\nfor (int i = 0; i < 8; i++)\n    x += a[i] \\* b[i];   // a starts at 0x100; b starts at 0x180 or 0x1A0"
ctl.b: Start of b
ctl.ways: Ways
ways.1: Direct-mapped
ways.2: Two-way
btn.step: Next step
btn.all: Run to end
btn.reset: Reset
trail.aria: Access order, with hits and misses in colour
read.k: Accesses so far
read.hits: Hits
read.misses: Misses
bits.tag: Tag · {n} bits
bits.idx: Set index · {n} bits
bits.off: Offset · {n} bits
say.bad: Enter a hexadecimal address, such as 0x7ffd3a5c9e48.
say.split: The lowest {ob} bits are the offset: this is byte *{off}* of the line. The next {ib} bits are the set index: the line can go only into set *{set}* (of {sets} sets, {ways} ways each). The rest is the tag {tag}; it is compared with the {ways} ways to tell whether the line is present.
set.n: Set {s}
set.empty: empty
k: {k} / {n}
say.start1: Direct-mapped: {sets} sets, one slot each. Press “Next step” to begin.
say.start2: Two-way set-associative: {sets} sets, two slots each. Press “Next step” to begin.
say.hit: {el} (address {addr}) falls in set {set}, where tag {tag} is already present: *hit*.
say.evict: {el} (address {addr}) falls in set {set}, where another line starting at {old} sits. It has to go: *miss*.
say.cold: {el} (address {addr}) falls in set {set}. It is the first visit and the set does not hold it yet: *miss*, and the whole line is read in.
say.done: Done: {n} accesses, {h} hits, {m} misses.
:::

With b starting at 0x180, a[i] and b[i] are exactly 128 bytes apart, so they land in the same set and keep evicting each other: {toyN} accesses give {toyMissA} misses, of which only {toyMissB} are unavoidable. Move b to 0x1A0, a small shift, and only {toyMissB} misses remain: the first access to each line. Leaving the arrays where they are and making the cache two-way also gives {toyMiss2} misses. Real programs often show this pattern: several arrays whose size is a power of 2, such as 4 KiB each, read element by element together, all collide in one set.

A real L1 uses set-index bits from the virtual address (Chapter 7), while L2 and L3 use physical addresses. The L3 also scrambles the address before spreading it across slices, so “the same set” cannot simply be read off the address for L3. {.take}

## Associativity and the three kinds of miss {#ch3}

::: strings
toc: Associativity and the three kinds of miss
:::

A miss is one of three kinds: the first touch of a line (compulsory), a cache too small for the working set (capacity), or a line that would have fitted but was crowded out of its set (conflict). More ways only cure conflict misses, more capacity only cures capacity misses, and compulsory misses can be avoided only by fetching early. {.law}

The toy cache in the last chapter had one slot per set; this is called **direct-mapped**. With several slots per set you have **set-associative** with that many ways. An address still goes to one set, but any way in that set will do, and a lookup compares the tags of all those ways at once. The extreme case is one set holding everything, which is **fully associative**; it needs every tag compared on each access, so it is costly and slow. Zen 5's L1 data cache is {zL1w}-way, and its L2 and L3 are both {zL3w}-way.

::: diagram dg-assoc keys=dg.assoc
cap: One lookup in a 4-set, 4-way set-associative cache: the set index selects one set, and its four tags are compared with the address tag at once. The tag values are illustrative.
aria: Diagram: 4-set, 4-way cache; the address's set index picks set 2, all four tags are compared at once, and way 2 hits
addr: Address
tag: Tag
idx: Set {s}
off: Offset
way: Way {w}
wayS: Way {w}
set: Set {s}
res: Tag {tag} in way {w}: hit
:::

A standard method (Hill, 1987) decides which kind a miss is. If the line was never touched before, it is a **compulsory miss**. Otherwise, if a fully associative LRU cache of the same size would also miss, it is a **capacity miss**. The rest, where the fully associative cache would hit but this cache misses, are **conflict misses**. The program below uses three arrays A, B and C of {progArr} KiB each, {progGap} KiB apart, to compute C[i] = A[i] + B[i]; then makes {progLook} random lookups in a {progTable} KiB table; and repeats the whole thing {progReps} times. That is {c3n} accesses touching {c3comp} distinct lines, so there are {c3comp} compulsory misses that no design can avoid.

::: lab ch3-model
model.title: The same program, with different sizes and ways
model.how: Each size and way count is simulated in full on the same address stream (LRU replacement, 64-byte lines), and each miss is classified by the method above. The bars, from the bottom up, are compulsory, capacity and conflict.
model.aria: Stacked bar chart: misses at six cache sizes, split into compulsory, capacity and conflict, with the current choice boxed
leg.comp: Compulsory miss
leg.cap: Capacity miss
leg.conf: Conflict miss
ctl.ways: Ways
w.1: Direct-mapped
w.fa: Fully associative
ctl.size: Size
read.comp: Compulsory
read.cap: Capacity
read.conf: Conflict
read.rate: Miss rate
w.faName: fully associative
w.n: {n}-way
cv.x: Cache size
cv.y: Misses
say.comp: {ways}, {size}: of {n} accesses, only {comp} miss, all of them first touches. Adding size or ways cannot remove these.
say.conf: {ways}, {size}: *{conf}* conflict misses. A fully associative cache of the same size would have hit them. Here, adding ways helps more than adding size.
say.cap: {ways}, {size}: *{cap}* capacity misses. Even a fully associative cache of this size cannot hold it all. Only more capacity helps here.
:::

At 16 KiB, direct-mapped: {dm16} misses, of which {dm16conf} are conflicts. A, B and C sit {progGap} KiB apart, a whole multiple of sets × line size, so element i of all three arrays lands in the same set. Two ways still give {w2_16} misses: three arrays fight for two slots and keep evicting each other. Four ways leave only {w4_16} misses, all compulsory, the same as the fully associative {fa16}. Going the other way, direct-mapped at 64 KiB does not help: it still has {dm64} misses, of which {dm64conf} are conflicts, because the spacing is still a whole multiple of sets × line size.

Capacity misses show up only when the cache is made smaller. An 8 KiB fully associative cache has {fa8} misses, of which {fa8cap} are capacity misses, because each pass of the program touches more than 8 KiB. An 8 KiB two-way cache has {w2_8conf} conflict misses instead. A version you meet when writing code: a matrix whose rows are exactly 4096 bytes, walked down a column, puts every step in the same set. Padding each row by 64 bytes spreads the conflicts out.

This classification is defined against a fully associative LRU cache of the same size. LRU is not optimal, so occasionally a set-associative cache gets more hits than a fully associative one, and the conflict count can go negative (Hill and Smith, 1989). Here the classification is done access by access, so no negatives appear, and the three kinds always sum to the actual number of misses. {.take}

## Who gets evicted {#ch4}

::: strings
toc: Who gets evicted
:::

When a set is full, one line must be chosen to leave. LRU evicts the line unused for the longest time, which is natural and common; but a loop just a little bigger than the cache can make it miss every time. {.law}

LRU has to remember the order in which each way was used. For 16 ways, keeping a full ranking of 16 positions at all times is too costly in hardware, so real chips usually use approximations. The commonest is **tree pseudo-LRU**: for 8 ways, 7 bits arranged as a binary tree, each bit pointing at the half from which to evict. Arm's Neoverse V3 technical reference manual states that its L1 instruction cache uses pseudo-LRU and its L1 data cache uses an RRIP-style scheme (the manual's text is quoted second-hand; see the unverified list in the sources).

The rule for pseudo-LRU is short. When a way is accessed, flip every bit on the path from the root to that way so that each points away from it. To evict, walk from the root following the bits to the end; that way is the victim. It does not guarantee evicting the least recently used line, but it guarantees that the line just used is not evicted.

::: diagram dg-plru keys=dg.plru
cap: 8-way tree pseudo-LRU: 7 bits in three levels, where 0 points left and 1 right, towards the half to evict from. After ways 0 to 7 are filled and way 2 is accessed once more, this page's model computes each bit's value.
aria: Diagram: 8-way tree pseudo-LRU; 7 bits in a binary tree; a gold path runs from the root to the next way to evict
leaf: Way {i}
note: Way {t} (blue) was just used, so every bit on its path now points away from it; the gold path from the root ends at way {v} (red), the next victim.
:::

The other approach keeps no order, but gives each line a guess at how soon it will be used again. RRIP (Jaleel et al., 2010) gives each line two bits: 0 means soon, 3 means far away. **SRRIP**: a new line is set to 2, and a hit sets it to 0; to evict, pick a line marked 3, and if none is marked 3, add 1 to every line in the set and look again. **BRRIP**: a new line is usually set to 3, and to 2 only about 1/32 of the time. The simplest of all is **random**: pick any way.

::: lab ch4-model
model.title: One access stream, six replacement policies
model.how: A 16 KiB cache, 8-way, with 32 sets. Three access streams: a loop repeated 12 times (its length is adjustable); a hot set of data with a read-once scan inserted every other pass; and the small program from Chapter 3. “Optimal” is Belady's method: knowing the whole stream in advance, it always evicts the line needed furthest in the future. Real hardware cannot do this, so it serves as an upper bound.
model.aria: Bar chart: hit rate of six replacement policies
ctl.trace: Access stream
tr.loop: Loop
tr.scan: Hot data + scan
tr.prog: Chapter 3 program
ctl.loop: Loop length
read.lru: LRU hit rate
read.random: Random
read.brrip: BRRIP
read.opt: Optimal
loopfmt: {x} × capacity ({lines} lines)
pol.lru: LRU
pol.plru: Tree pseudo-LRU
pol.random: Random
pol.srrip: SRRIP
pol.brrip: BRRIP
pol.opt: Optimal (Belady)
say.fits: The loop is only {x} times the capacity and fits. After the first pass every policy hits every time, at {lru}.
say.thrash: The loop is {x} times the capacity. LRU hit rate *{lru}*: each line needed is exactly the one it has just evicted. Random {random}, BRRIP {brrip}, optimal {opt}.
say.loopmid: The loop just exceeds the capacity ({x} times). Some sets get no more lines than they have ways, so they hit throughout, and LRU still gets {lru}; random {random}, BRRIP {brrip}, optimal {opt}.
say.scan: Hot data plus scan: LRU {lru}, SRRIP *{srrip}*, BRRIP {brrip}, optimal {opt}. The read-once scan lines come in, and LRU treats them as the newest, pushing out the hot data. RRIP inserts new lines near the back, so the scan evicts itself.
say.prog: The small program from Chapter 3: LRU {lru}, pseudo-LRU {plru}, random {random}, SRRIP {srrip}, optimal {opt}. The data all fits, so the choice of victim makes no difference.
:::

Stretch the loop to 1.25 times the capacity: LRU hit rate {lruLoop}, pseudo-LRU {plruLoop}, SRRIP {srripLoop}. The reason is plain: the line the loop needs next is always the one least recently used, so it has just been evicted. Random gets {rndLoop}, BRRIP {brripLoop}, and optimal {optLoop}. BRRIP mostly inserts new lines at the back, so some lines stay resident and hit on every pass; this is what the optimal policy does.

The second stream is closer to everyday use: a program with a small set of frequently used data that occasionally reads a large file or scans a database table. LRU hit rate {lruScan}, SRRIP {srripScan}, BRRIP {brripScan}, optimal {optScan}. A real chip cannot know which kind of stream it faces, so the RRIP paper also proposes DRRIP: some sets always use SRRIP and others always use BRRIP, and the rest follow whichever side misses less.

Vendors rarely publish the replacement policies of L2 and L3; the policies here are those of the papers and textbooks. The two bits and BRRIP's 1/32 are the settings used in the RRIP paper. The random policy uses a fixed seed; a different seed moves the results by several percentage points. {.take}

## What happens on a write {#ch5}

::: strings
toc: What happens on a write
:::

A write can go one of two ways: send it to the next level every time (write-through), or change only the cached line and write the whole line down when it is evicted (write-back). Write-back saves traffic, but each line needs a dirty bit to remember that it has been changed. {.law}

On a read, the cache holds only a copy, and losing it does no harm. A write is different: the new value lives in the cache, and the copy in the next level becomes stale. **Write-through** sends every store on to the next level at once, so the next level is always current, but the traffic is high. **Write-back** changes only the cache and writes the whole line down when it is evicted; Zen 5's L1 data cache is write-back (AMD's optimisation guide). There is one more choice: on a store miss, either read the line in first and then change it (**write-allocate**), or write straight to the next level without allocating (**no write-allocate**).

Write-back needs a **dirty bit** per line: set it to 1 on change, and on eviction write the line down only if it is 1. Both approaches rely on a **write buffer**. The core puts its store into the buffer and moves on, and the buffer sends entries to the next level at the rate that level can accept them. The core stalls only when the write buffer is full.

::: diagram dg-write keys=dg.write
cap: The write path. Each line has a valid bit, a dirty bit, a tag and 64 bytes of data. The write buffer sits between L1 and the next level, so the core need not wait for a write to finish.
aria: Diagram: core stores go into L1; write-through also sends them to the write buffer; write-back sends the whole dirty line to the buffer on eviction; the buffer feeds the next level
core: Core
l1: L1 data cache (one line)
v: Valid
d: Dirty
tag: Tag
data: Data
buf: Write buffer
next: Next level L2
e1: The store writes into this line of L1; write-back sets the dirty bit to 1
e2: Write-through: each store also goes into the write buffer
e3: Write-back: on eviction of a dirty line, all 64 bytes go into the write buffer
e4: Drains at the next level's pace; the core waits only when it is full.
:::

::: lab ch5-model
model.title: Four write policies, and how much each reads and writes
model.how: An L1 of {wSize} KiB, {wWays}-way. The program first updates a 16 KiB array in place four times (three reads and one write per element), then reads a 64 KiB input, writing out 8 results for every 24 values read. A read miss waits {wTR} cycles (Zen 5's L2 latency). The write buffer sends one entry every {wTW} cycles; this number is a **tuned parameter**.
model.aria: Bar chart: bytes read from and written to the next level, for each of the four write policies
leg.read: Read from next level
leg.write: Written to next level
ctl.pol: Write policy
pol.wt-na: Write-through, no write-allocate
pol.wt-a: Write-through, write-allocate
pol.wb-na: Write-back, no write-allocate
pol.wb-a: Write-back, write-allocate
ctl.depth: Write buffer depth (entries)
read.read: Read in
read.write: Written out
read.ops: Write operations
read.wait: Core time waiting on writes
bar.r: {p} · read
bar.w: {p} · write
say.wb: {pol}: read in {r}, written out {w}. The {stores} stores reach the next level only as whole lines, when a dirty line is evicted (and the {tail} lines still dirty at the end): {ops} write operations in all. With a {d}-entry write buffer, the time the core spends waiting on writes is *{wait}*.
say.wt: {pol}: each of the {stores} stores goes to the next level, so {w} is written out and {r} is read in. With a {d}-entry write buffer, bursts of stores are absorbed; the time the core waits on writes is *{wait}*.
say.wtfull: {pol}: each store goes to the next level, and the write buffer has only {d} entries. In a burst it fills up, and the core waits for *{wait}* of the time on writes.
:::

With a 4-entry write buffer: write-through writes out {wtWrite} KiB in all, which is exactly {stores} stores of 8 bytes each. Write-back writes out only {wbWrite} KiB, since a line changed four times is written once. Write-back without write-allocate writes {wbnaWrite} KiB. The reads go the other way: write-back with write-allocate reads in {wbRead} KiB, while write-through without allocation reads only {wtRead} KiB. The extra reads belong to the output array. Write-allocate must first read in those lines, though they are about to be overwritten in full, so that read is wasted. The x86 “non-temporal store” instructions exist for this case: they say the data need not be read into the cache first.

The write buffer depth decides how long write-through must wait. With no entries, the core spends {wtWait0} of its time waiting on writes; with 4 entries this falls to {wtWait4}, and with 8 it is {wtWait8}. Write-back has only {wbWait4} at 4 entries, because it has far fewer writes to send. The cycles per buffer entry are tuned: at half the value, write-through with 4 entries waits {wtWaitH}; at double, {wtWaitD}. The direction of the result does not change: write-through relies more heavily on the write buffer than write-back does.

The model has one access in flight at a time, with no out-of-order execution to hide read waits. A real write buffer also merges several stores to the same line into one. Zen 5's write-back L1 comes from AMD's documentation. For other levels, vendors mostly say “write-back” and do not publish details. {.take}

## What each of the three levels does {#ch6}

::: strings
toc: What each of the three levels does
:::

L1 is split into instruction and data halves, private to each core; L2 is usually private too; L3 is shared by a group of cores and sliced across the on-chip interconnect. Whether L2 and L3 hold the same lines follows one of three designs (inclusive, exclusive, or in between), and that decides how much the two levels hold together. {.law}

L1 is split into instruction and data caches because the core fetches instructions and reads or writes data in every cycle, and two separate caches avoid competing for one port. L2 is private to each core: larger and slower, it catches what L1 misses. L3 is shared by the whole group of cores: Zen 5 shares {zL3} MiB among every {zL3n} cores. A shared cache is usually sliced, with each slice next to one core. A hash of the address chooses the slice, so every core can use the whole capacity and the accesses spread evenly.

::: diagram dg-ring keys=dg.ring
cap: Diagram: each core has private L1i, L1d and L2; the shared L3 is in slices joined by an on-chip interconnect. Intel client chips use a ring; vendors differ in how they connect. “The first two levels private, L3 shared and sliced” is common in AMD's cores, Intel's large cores and Neoverse; Apple's cores and Intel's small cores share one L2 among several cores (see the table in Chapter 6).
aria: Diagram: 4 cores, each with L1 instruction and data caches and a private L2, joined by an on-chip interconnect to a shared L3 in 4 slices
core: Core {i}
l1i: L1i
l1d: L1d
l2: Private L2
ring: On-chip interconnect
slice: L3 slice {i}
sliceS: L3 slice
shared: All slices together form one shared L3; a hash of the address picks the slice
sharedS: All slices form one shared L3; a hash picks the slice
mem: Further out: memory controller and memory
:::

L3 and L2 can relate in three ways. **Inclusive**: every line in L2 is also in L3. The benefit is that other cores can tell whether a line is cached here just by looking at L3; the cost is that the two together hold only as many distinct lines as L3, and when L3 evicts a line it must also invalidate the copy in L2 (**back-invalidation**). **Exclusive**: a line is in L2 or in L3, not both, so together they hold the sum of the two. L3 receives only the lines evicted from L2, which is why it is also called a **victim cache**. **Non-inclusive**: neither rule is enforced, so the design sits between the two.

::: diagram dg-incl keys=dg.incl
cap: L2 and L3 the same size (the compact-core ratio of the Chapter 6 model); how many distinct lines the two levels hold under each design. Dashed boxes mark L3 lines that duplicate L2 lines.
aria: Diagram: the L2 and L3 relations of the inclusive, non-inclusive and exclusive designs, and how many distinct lines the two levels hold
incl: Inclusive
nincl: Non-inclusive
excl: Exclusive (victim cache)
u.incl: Up to {inc} of distinct lines
u.nincl: Between {lo} and {hi}
u.excl: Up to {exc} of distinct lines
n.incl: Every L2 line has a copy in L3; eviction from L3 must also invalidate it in L2
n.nincl: Filled into both levels; each evicted independently
n.excl: A line sits in one place only; L3 receives only lines evicted from L2
:::

Zen 5 is close to exclusive. AMD's documentation says L2 includes L1; L3 receives only the lines evicted from L2, and on a hit it drops the line (which moves to L2) if the access is a store or only one core has read the line; L3 also keeps a copy of each L2's tags to answer queries from other cores. The closer L2 and L3 are in size, the more an exclusive design gains. The following tries two ratios: 1 MiB of L2 per core with 1 MiB of L3 per core (Ryzen AI's Strix Point has {sxN} Zen 5 cores sharing {sxL3} MiB, plus {sxcN} Zen 5c cores sharing {sxcL3} MiB; the second group matches this ratio), or 4 MiB of L3 per core (desktop Zen 5's {zL3} MiB shared among {zL3n} cores).

::: lab ch6-model
model.title: Inclusive, non-inclusive, exclusive: how much the two levels hold together
model.how: A core's L2 and its share of L3 are both 16-way LRU, and reads are uniformly random over a working set. To run in a web page, every capacity is scaled down 16 times. With uniform random access the hit rate depends only on the ratio of working set to capacity, so the axis and the readouts are labelled at real sizes.
model.aria: Line chart: combined L2 and L3 hit rate for the three designs across working-set sizes
k.incl: Inclusive
k.nincl: Non-inclusive
k.excl: Exclusive
ctl.kind: Design
ctl.l3: L3 per core
l3.dense: Same size as L2
l3.desk: Four times L2
ctl.w: Working set
read.hit: L2 + L3 hit rate
read.l2: of which L2
read.cap: Most the two levels can hold
read.back: Back-invalidations per 1,000 accesses
cv.x: Working set
cv.y: L2 + L3 hit rate
cap.between: between {lo} and {hi}
say.incl: Inclusive, working set {W}: L2 hits {h2}, and the two levels together *{hit}*. When L3 evicts a line, the same line in L2 must go too: {back} per 1,000 accesses. The two can hold only as many distinct lines as L3 does ({cap}).
say.excl: Exclusive, working set {W}: together they hit *{hit}* (L2 {h2}). Each line sits in one place only, so they hold at most {cap}. The cost is that an L3 hit moves the line into L2, and the line that L2 evicts goes back to L3.
say.nincl: Non-inclusive, working set {W}: together they hit *{hit}* (L2 {h2}). L3 evicts without regard to L2, so right now the two hold {uniq} distinct lines, between the inclusive and exclusive cases.
:::

With a working set of {hWmib} MiB and L3 the same size as L2: inclusive hits {hInc}, non-inclusive {hNin}, exclusive {hExc}. The inclusive design also back-invalidates {hBack} lines from L2 per 1,000 accesses. With the desktop ratio and a {hW4mib} MiB working set: inclusive {hDeskI}, exclusive {hDeskE}, so the gap is smaller. An inclusive design loses less when L3 is much bigger than L2; as L2 grows, the trade-off turns against it. The configurations of several current cores are below. All figures come from vendor documents or measurements, and each gives its date.

::: html ch6-html
th.core: Core
th.l1: L1
th.l2: L2
th.l3: L3
th.src: Source
r.zen5: AMD Zen 5
r.zen5.l1: Instruction {zL1i} KiB, {zL1iw}-way; data {zL1} KiB, {zL1w}-way; {zL1lat}–{zL1max} cycles
r.zen5.l2: {zL2} MiB, {zL2w}-way, from {zL2lat} cycles; includes L1
r.zen5.l3: {zL3} MiB shared per {zL3n} cores, {zL3w}-way, average {zL3lat} cycles; receives only lines evicted from L2
r.zen5.src: AMD Optimization Guide 58455 rev 1.00 (August 2024); AMD Hot Chips 2024 slides
r.lc: Intel Lion Cove
r.lc.l1: L0 {lcL0} KiB, {lcL0lat} cycles; L1 {lcL1} KiB, {lcL1lat} cycles
r.lc.l2: {lcL2} MiB (some models {lcL2b} MiB), {lcL2lat} cycles
r.lc.l3: Lunar Lake: shared {llL3} MiB, measured {llL3lat} cycles
r.lc.src: Intel 2024 technology tour slides; Chips and Cheese measurements (27 September 2024)
r.sky: Intel Skymont (Lunar Lake)
r.sky.l1: No primary figure found
r.sky.l2: 4 cores share {skyL2} MiB
r.sky.l3: The chip also has {llMsc} MiB of memory-side cache
r.sky.src: Intel Hot Chips 2024 slides
r.v3: Arm Neoverse V3
r.v3.l1: Instruction {v3L1} KiB, {v3L1w}-way; data {v3L1} KiB, {v3L1w}-way; measured {v3lat} cycles
r.v3.l2: Private, {v3L2} MiB {v3L2w}-way or {v3L2b} MiB {v3L2bw}-way
r.v3.l3: Set by the chip that uses it
r.v3.src: Arm Technical Reference Manual 107734 (quoted in jia.je's article of 13 June 2026; not opened directly)
r.apple: Apple M6 (the Mac this page was written on)
r.apple.l1: Fastest core tier: instruction {apL1i} KiB; data {apL1} KiB
r.apple.l2: {apL2} MiB, shared by every {apShare} cores
r.apple.l3: Not reported by the system; Apple has not published ways or latency
r.apple.src: Local macOS sysctl, read 15 November 2026; line {apLine} bytes, page {apPage} KiB
:::

::: diagram dg-zen keys=dg.zen
cap: A real chip's layout (illustrative): one Zen 5 core complex (CCX). Capacities, ways and latencies come from AMD's optimisation guide and Hot Chips 2024; the size and position of the boxes are not real areas.
aria: Diagram: one Zen 5 core complex, eight cores each with 1 MiB L2, around a shared 32 MiB L3
core: Core {i}
l2: L2 {l2} · incl. L1
l2S: L2 {l2}
l3: Shared L3 · {l3} · {w3}-way
l3b: Shared by {n} cores, average {lat3} cycles; receives L2 evictions only
io: To I/O die and memory
l1: Each core also has L1i {l1i} and L1d {l1d}
:::

The designs differ a good deal. Intel split one level into two, a small, fast L0 and a larger L1, and raised L2 from the previous generation's {rcL2} MiB to {lcL2} MiB. AMD keeps a {zL1} KiB L1 and puts its effort into L3: the desktop Ryzen 9 9950X has {r9L3} MiB of L3 in all. On Lunar Lake, 4 Skymont efficiency cores share {skyL2} MiB of L2. Apple's L1 is much larger, for a reason covered in the next chapter: its page size is {apPage} KiB.

The latency figures follow different conventions. AMD and Intel count cycles from request to usable data, while Chips and Cheese and jia.je measured them by pointer chasing. Apple publishes no documentation, so only the capacities in the system report are available. The model treats L3 as one core's own share and does not simulate other cores competing for it. {.take}

## Why L1 is so small {#ch7}

::: strings
toc: Why L1 is so small
:::

In a few cycles, L1 must do two things at once: use the low bits of the address to select a set, while the TLB translates the high bits into a physical address. Low bits can be used before translation only if they lie within the page offset. So, without extra work, the L1 size is capped at page size × ways. {.law}

L1 latency hits every instruction that reads memory, so it has to be fast, typically four or five cycles. Chapter 1 showed that latency rises with size: Lion Cove's {lcL1} KiB L1 takes {lcL1lat} cycles, and the previous generation's Redwood Cove {rcL1} KiB L1 took {rcL1lat}. Apart from speed, L1 faces another constraint: address translation.

Programs use virtual addresses, but the cache holds lines by physical address, and translation is done by the TLB, which takes some time. L1 does two things in parallel: it uses the low bits of the virtual address to choose the set, while the TLB translates the high bits; then it compares tags using the translated physical address. This is called **virtually indexed, physically tagged** (VIPT). The page offset is identical in virtual and physical addresses, so as long as the set index and line offset fit inside the page offset, this is no different from choosing the set from the physical address. Zen 5: {zL1} KiB split into {zL1w} ways, each of 4 KiB, so the set index plus line offset is exactly {v1low} bits, and a 4 KiB page has a {v1page}-bit page offset. 4 KiB × {zL1w} ways = {zL1} KiB, with nothing to spare. The TLB and the page tables themselves are covered in <a href='../how-virtual-memory-works/#ch4'>Chapter 4 of “How Virtual Memory Works”</a>.

::: diagram dg-vipt keys=dg.vipt
cap: The VIPT boundary: right of the gold dashed line is the 4 KiB page offset, which needs no translation. Zen 5's set index plus offset ends exactly at the line; Neoverse V3's two extra bits (red box) fall in the page number.
aria: Diagram: address bits 19 to 0; the low 12 bits are the page offset. Zen 5's set index and offset fit in the page; Neoverse V3's set index uses two page-number bits
addr: Virtual address
rowA: {s} · {w}-way
rowB: {s} · {w}-way
vpn: Page number (translated by TLB)
vpnS: Page number
po: Page offset · {n} bits
poS: Page {n} bits
idx: Set index {n} bits
idxS: Index {n}
lo: Line offset {n} bits
loS: Line {n}
note: The second row's set index crosses the boundary by {n} bits: one physical line may fall into different sets, so the hardware must handle that.
:::

::: lab ch7-model
model.title: Page size × ways
model.how: Choose a page size, a way count and an L1 size to see how many bits the set index plus offset need, and whether they spill past the page offset. Bits beyond the page offset are known only after translation, so one physical line can appear in several different sets (aliasing).
ctl.page: Page size
ctl.ways: Ways
ctl.size: L1 size
read.limit: Limit: page × ways
read.low: Set index + offset bits
read.page: Page offset bits
read.alias: One physical line may sit in
bits.vpn: {n} bits of page number
bits.idx: {n} set-index bits
bits.off: {n} bits within line
bits.page: Page offset: {n} bits
al.none: one set
al.n: {n} sets
say.odd: {size}, {ways}-way: each way has {sets} sets, which is not a power of 2, so the address bits do not divide evenly. Real chips do not build it this way.
say.fits: {size}, {ways}-way, {page} pages: set index plus offset takes {low} bits, which does not exceed the {pb} bits of the page offset. The limit is {page} × {ways} = {limit}; this configuration is within it, and has no aliases.
say.alias: {size}, {ways}-way, {page} pages: set index plus offset takes {low} bits, which is *{extra}* more than the page offset. Those extra bits are known only after the TLB translates them, and one physical line may appear in {n} sets. To avoid aliasing, keep the size within {limit}, add ways, or use larger pages.
:::

Some designs go beyond this line. Neoverse V3's L1 data cache is {v3L1} KiB, {v3L1w}-way; with 4 KiB pages it has {vNextra} extra bits, so by the rule above it could be at most {vNlimit} KiB. Arm's manual calls it “VIPT that behaves as PIPT”: the hardware detects and handles aliases itself. jia.je tested this on Graviton 5, mapping one physical page at two virtual addresses: copying between them gave correct results but ran 1.66 times slower than without aliasing, because the aliased line has to be refilled into the other set. So crossing the line is possible; the price is slower aliasing and more complex hardware. The other route is larger pages. Apple's system uses {apPage} KiB pages, so a {apL1} KiB L1 needs only {apNeedW} ways to stay within the page limit. Apple has not published its L1's ways or indexing, though, and its cores can also run Linux virtual machines with 4 KiB pages, so large pages may not be its only measure.

Extra ways are not free. Each one adds a tag to compare and a data array to read on every lookup, so power and latency both rise. AMD's documentation says Zen 5 uses a small way predictor that guesses which of its {zL1w} ways holds the data, so that only that way is read. That is why, over two decades, the L3 shared by one core complex has grown from a few MiB to close to 100 MiB, while the fastest data cache (which Intel now calls L0) has stayed at tens of KiB.

Besides hardware handling of aliases, there are other options. The operating system can “colour” pages so that aliases fall into the same set, or L1 can be physically indexed, translating before the lookup, at a cost in latency. Page sizes and how the TLB translates are covered in <a href='../how-virtual-memory-works/'>“How Virtual Memory Works”</a>. {.take}

## Prefetching: fetch before the request {#ch8}

::: strings
toc: Prefetching: fetch before the request
:::

A prefetcher fetches the next line before the core asks for it. It can only guess from patterns: sequential access and a fixed stride are easy to predict. A linked list, where the next address is stored inside the data, cannot be predicted. {.law}

Chapter 3 said that compulsory misses cannot be removed by size or ways, only by fetching early. Zen 5's L1 has prefetchers for sequential streams, for strides (including two-dimensional jumps) and for regions. Its L2 adds sequential-stream and ascending/descending-stream prefetchers (AMD's optimisation guide). All of them aim for the same thing: the data should already be in the cache before it is needed.

The simplest is **next-line**: on a miss, also fetch the following line. A better one is the **stride prefetcher** (Chen and Baer, 1995). It keeps a table keyed by the address of each load instruction, recording the address that instruction used last time, the difference between the last two addresses (the stride), and how confident it is. When the same stride repeats, the entry enters a “steady” state and starts fetching several steps ahead.

::: diagram dg-rpt keys=dg.rpt
cap: The stride prefetcher's table (Chen and Baer, 1995): one entry per load instruction. The values in the table are illustrative.
aria: Diagram: stride prefetcher table, one entry per load address, storing last address, stride and state; a steady entry issues prefetches
load: Load
pc: PC
last: Last address
stride: Stride
state: State
steady: Steady
nopred: No pred.
issue: Prefetch addr + steps × stride
e1: The same stride twice in a row makes the entry “steady”; it fetches ahead.
e2: A broken stride drops “steady” back to initial, keeping the old stride; repeated breaks give “no prediction” (No pred.) and prefetching stops.
:::

::: lab ch8-model
model.title: Four access patterns, three prefetchers
model.how: A cache of {pfSize} KiB, {pfWays}-way. **Coverage** = misses removed by prefetching ÷ misses without prefetching. **Accuracy** = prefetches used ÷ prefetches issued. The model assumes prefetches always arrive in time and does not count the bandwidth they use.
model.aria: Bar chart: misses without prefetching, misses now, useful prefetches and wasted prefetches
ctl.trace: Access pattern
tr.stride: One field of a struct
tr.matrix: Walking a matrix by column
tr.list: Linked list
tr.mix: Sequential scan + hashed lookup
ctl.mode: Prefetcher
m.none: No prefetching
m.next: Next line
m.stride: Stride
ctl.deg: Lines fetched at once
ctl.dist: Steps ahead
read.base: Misses without prefetching
read.miss: Misses now
read.cov: Coverage
read.acc: Accuracy
distfmt: {d} steps
bar.base: Misses without prefetching
bar.miss: Misses now
bar.useful: Useful prefetches
bar.waste: Wasted prefetches
say.none: No prefetching: {base} misses, and the core waits for every one.
say.silent: {mode}: it issued nothing. No fixed stride exists between the addresses, so the prefetcher holds back. Misses remain at {miss}.
say.waste: {mode}: it issued {issued} prefetches, of which only *{acc}* were used. {waste} were wasted, using up bandwidth and pushing out useful lines. Misses fall from {base} to {miss} (coverage {cov}).
say.good: {mode}: misses fall from {base} to *{miss}*, with coverage {cov} and accuracy {acc}.
:::

Reading one field of an array of 256-byte records: next-line prefetching has coverage {pfNextCov} and accuracy {pfNextAcc}, since the next line it fetches is never used. The stride prefetcher spots the stride: coverage {pfStrideCov}, accuracy {pfStrideAcc}. Walking a matrix with 4096-byte rows down a column, a 4-step lead gives coverage of {pfMatCov}; a 5-step lead drops it to {pfMat5Cov}, and 8 steps also give {pfMat8Cov}. The cause goes back to Chapter 3: every step is 4096 bytes, so all the elements land in one set, which has only 8 ways. With a lead of d steps, a prefetched line waits d steps before it is used; meanwhile d − 1 more prefetches arrive and d − 1 hits mark the lines just used as newest, so to LRU it is older than 2(d − 1) other lines. At d = 5, 2 × 4 + 1 = 9 lines compete for 8 ways: it is evicted before its turn, and so is every line after it. A linked list keeps its next address inside the node, and the stride changes each time, so the stride prefetcher never issues ({pfListIss} prefetches). Next-line prefetching guesses blindly, with accuracy {pfListNextAcc}, removing only {pfListNextCov} of the misses.

The last pattern alternates two things: a sequential sweep over one array, and random lookups in a 4 MiB hash table. Next-line prefetching treats both alike, with accuracy {pfMixNextAcc} and coverage {pfMixNextCov}. The stride prefetcher keeps a separate entry per instruction, so it finds the scan's stride and ignores the random lookups: accuracy {pfMixStrideAcc}, coverage {pfMixStrideCov}, which is exactly the scanning half. In practice, arrays are easier to prefetch than linked lists. If you must use a linked structure, prefetch it explicitly in the code, for example with GCC and Clang's __builtin_prefetch.

The model does not consider whether prefetches arrive in time, nor the memory bandwidth used by the extra lines. A real prefetcher monitors its own accuracy and switches itself off when it is inaccurate. Real prefetchers also generally do not fetch across a 4 KiB page boundary, and some stride prefetchers only recognise strides of up to a few KB, so a 4096-byte stride may not be prefetched at all on a real machine; the model has none of these limits. {.take}

## Keeping caches consistent across cores {#ch9}

::: strings
toc: Keeping caches consistent across cores
:::

Each core has its own cache, so one line may exist in several copies at once. MESI gives each copy a state, and requires other copies to be invalidated before a write, so every reader sees the latest value. {.law}

Two cores cache the same line. One writes it, and the other's copy is now stale. A **coherence protocol** ensures this is never seen. The classic is MESI (Papamarcos and Patel, University of Illinois, 1984): each line in each cache is in one of four states, **M** (modified, held only here), **E** (exclusive, unchanged), **S** (shared, possibly held elsewhere too) and **I** (invalid). Cores listen to each other's requests and change their own states by the rules. Directory-based protocols, memory consistency models and atomic operations are covered in <a href='../how-cores-share-memory/'>“How Cores Share Memory”</a>.

::: diagram dg-mesi keys=dg.mesi
cap: The MESI state of one line in one core's cache. The numbers on the arrows match the explanations below; “other core” means the same line in another cache. For brevity, three kinds of arrow are omitted: E or M becoming Invalid when the core itself evicts the line; E becoming Invalid when another core writes; and a write straight from Invalid (BusRdX, going to Modified in one step, the same as reading the line in and then writing it).
aria: Diagram: the four MESI states and eight numbered transitions
M: Modified
E: Exclusive
S: Shared
I: Invalid
e1: Read miss, no other core has it: read from memory, state Exclusive
e2: Read miss, another core has it: take it from there; both share it
e3: Own write: no message needed, change directly
e4: Own write: first send a message so other copies are invalidated
e5: Another core reads: supply the new value and write it back; become Shared
e6: Another core writes: supply the new value and invalidate own copy
e7: Another core reads: become Shared
e8: Another core writes, or own eviction: invalidate
:::

The E state is the clever part. When a line is read and no other core has it, it is recorded as E. A later write can change it to M silently, with no message. If the line is only S, the core must first broadcast “I am writing, so invalidate your copies”.

::: lab ch9-model
model.title: Two cores, one line
model.how: Two cores, and the state of this one line in each core's cache. Press a button to make a core read, write or evict the line, and watch the states change and the messages sent.
btn.r0: Core 0 reads
btn.w0: Core 0 writes
btn.e0: Core 0 evicts
btn.r1: Core 1 reads
btn.w1: Core 1 writes
btn.e1: Core 1 evicts
btn.reset: Reset
log.aria: Operation log
:::

The protocol works on lines, not variables. Two unrelated variables that happen to share one line mean that when one core writes its variable, the other core's whole line is invalidated. This is **false sharing**: the program shares no data at all, but the hardware behaves as if it does.

::: diagram dg-false keys=dg.false
cap: False sharing: A and B are 8 bytes each, side by side in one 64-byte line, and written by two cores.
aria: Diagram: a 64-byte cache line; core 0 writes A at the start, core 1 writes the adjacent B
c0: Core 0 writes A
c1: Core 1 writes B
line: One 64-byte cache line (each cell 8 bytes; numbers are byte positions)
lineS: One 64-byte line, 8 bytes per cell
e1: A and B are unrelated variables that merely share a line.
e2: Each write invalidates the other core's copy of the whole line; the line bounces between the cores.
:::

::: lab ch9-lab
model2.title: False sharing: two counters
model2.how: Each of two cores adds 1 to its own 8-byte counter {fsN} times, each addition a read and a write, taking turns every few additions. Each access costs 1 cycle; one line moving between cores, or one upgrade, costs {fsTC} cycles. That number is a **tuned parameter**.
model2.aria: Bar chart: average cycles per addition when two counters share a line and when they sit on separate lines
ctl.lay: Two counters
lay.same: Same line
lay.pad: Separate lines
ctl.g: Additions per turn
read.tx: Messages
read.inval: Invalidations
read.per: Average per addition
core0: Core 0
core1: Core 1
st.M: Modified
st.E: Exclusive
st.S: Shared
st.I: Invalid
stat: Messages · invalidations
stat.k: Total
log.empty: No operations yet
log.item: C{c} {op} {a}→{b}{bus}
op.R: reads
op.W: writes
op.E: evicts the line
opS.R: read
opS.W: write
opS.E: evict
from.mem: from memory
from.cache: from the other core's cache
wb: " (the modified data is also written back to memory)"
say.start: Both cores start without this line (I, invalid). Press a button to see which messages each step sends.
say.quiet: {who} {op}: {s0} → {s1}, no message needed{wb}.
say.upgr: {who} {op}: it holds a shared copy, so it first sends {bus} to announce the write (the other core {o0} → {o1}), and its own state goes {s0} → *{s1}*.
say.inval: {who} {op}: it sends {bus}, and the line comes {from}{wb}. The other copy is invalidated, {o0} → {o1}, and its own state goes {s0} → *{s1}*.
say.bus: {who} {op}: it sends {bus}, and the line comes {from}{wb}. The other core goes {o0} → {o1}, and its own state goes {s0} → *{s1}*.
say.fs: The two counters share a line, and the cores take turns (additions per turn: {g}). The line sent {tx} messages and was invalidated {inval} times, averaging *{per}* per addition.
say.fsonce: Each core makes all {N} additions before handing over: only {tx} messages, and an average of *{per}* per addition.
say.pad: Each counter is on its own line: only {tx} messages in all, averaging *{per}* per addition, whatever the turn pattern.
:::

With the two counters on one line, taking turns at every addition: {fsTx} messages in all, averaging {fsPer} cycles per addition. On separate lines there are only {fpTx} messages (each core's first read-in), and {fpPer} cycles per addition. Taking turns only every 64 additions cuts the messages to {fs64Tx}. In this model, halving the cost of moving a line halves the time per addition on a shared line, to {fsPerH} cycles; doubling it gives {fsPerD}. The relation is nearly proportional, so the difference on a real machine depends on how long it takes to move a line between cores. The everyday version: one counter per thread in an array, packed into one line, so the more threads, the slower it gets. The fix is to align each counter to 64 bytes. C++17 provides std::hardware_<wbr>destructive_<wbr>interference_<wbr>size for exactly this.

Real chips use variants of MESI (AMD has MOESI, Intel has MESIF). With more cores they stop broadcasting and use a directory to record which core holds which line. Moving a line takes anything from tens to hundreds of nanoseconds, and is slower across chiplets. These are covered in <a href='../how-cores-share-memory/#ch3'>Chapters 3, 4 and 7 of “How Cores Share Memory”</a>. {.take}

## Caches you can see from code {#ch10}

::: strings
toc: Caches you can see from code
:::

Follow a random linked list and the time per step jumps as the list grows, level by level. The step positions are the cache capacities, and the step heights are their latencies. {.law}

How can you see these levels for yourself? The most common method is **pointer chasing**: link a block of memory into a ring in random order, put one pointer in each line, and keep following them. The next address is known only when the current read completes, so out-of-order execution and prefetchers cannot help, and what you measure is the real latency.

::: html ch10-html
code.aria: Code of the pointer-chasing test
code: "// W bytes of memory linked into a random ring, one pointer every 64 bytes\nvoid \\*\\*p = start;\nfor (long i = 0; i < N; i++)\n    p = (void \\*\\*)\\*p;   // the next address is known only when this read completes"
:::

::: lab ch10-model
model.title: Pointer chasing: the latency steps
model.how: Chase a random linked list through Zen 5's three cache levels, with capacities, ways and latencies from the documents and memory at {dramNs} ns. Each level is LRU. In steady state, if a set's list lines number no more than its ways, they all hit; if they exceed it, they all miss. So the result can be computed exactly. The operating system places virtual pages at random physical locations (a fixed seed), which matters below.
model.aria: Line chart: cycles per read while chasing pointers, against working-set size; dashed lines mark the L1, L2 and L3 capacities
leg.model: Model
leg.doc: L1 / L2 / L3 capacities
ctl.page: Page
p.4k: 4 KiB pages
p.2m: 2 MiB huge pages
ctl.w: Working set
read.cyc: Cycles per read
read.ns: In time
read.served: Served by
cv.x: Working set
cv.y: Cycles per read
say.level: Working set {W}: {share} of reads are served by {lv}, each taking *{c}* ({ns}).
say.edge: Working set {W}: on the edge of a step, {lv} serves only {share}, averaging *{c}* per read ({ns}).
:::

At 24 KiB each read takes {s24} cycles, all served by L1; at 512 KiB, {s512} cycles, from L2; at 16 MiB, {s16} cycles, mainly from L3; at 128 MiB, {s128} cycles, about {s128ns} ns, almost all from memory. Chips and Cheese measured the Ryzen 9 9950X in August 2024 and found memory latency “just over 70 ns”; the model uses {dramNs} ns.

The page size also changes the steps. With a 1 MiB working set on 4 KiB pages, the model gives {s1m4} cycles, well above L2's latency; on 2 MiB huge pages it is {s1mH}. At 768 KiB it is the same: {s768} against {s768H}. How high it sits depends on how physical pages are allocated, and it differs on every run. The reason: L2's set index uses bit 15, four bits above the 4 KiB page offset, and those bits come from the physical pages the operating system hands out. If allocation is random, some sets get more than 16 lines even when the total fits, and they miss. Huge pages keep physical addresses contiguous, so the sets fill evenly. To see your own machine's cache sizes, ask the system:

::: html ch10-html-2
cmd.aria: Commands that show this machine's cache configuration
cmd: "# Linux: size, ways and line size of each cache level\nlscpu --caches\n# macOS: the same information\nsysctl hw.perflevel0.l1dcachesize hw.perflevel0.l2cachesize hw.cachelinesize hw.pagesize"
:::

A few things you can use directly when writing code. Walk arrays in memory order, so that each 64-byte line is fully used: one read per 16 floats means the lines fetched equal what a full pass reads. When data exceeds the cache, process it in blocks (see <a href='../why-compute-waits-for-memory/#ch3'>Chapter 3 of “Why Compute Waits for Memory”</a>). Keep the row length of arrays and matrices from being a power of 2 in bytes (Chapter 3). Give each thread's frequently written data a line of its own (Chapter 9).

The model does not count the TLB. With a large working set, translating addresses also misses, so real curves rise further at large sizes; huge pages help with this too. Both are covered in <a href='../how-virtual-memory-works/#ch4'>Chapters 4 to 6 of “How Virtual Memory Works”</a>. A real L3 is not LRU and does not select sets from address bits directly, so its steps are rounder than the model's. {.take}

## Where the frontier is (as of November 2026) {#ch11}

::: strings
toc: Where the frontier is
:::

Transistors on a chip are still shrinking, but SRAM has nearly stopped shrinking. Caches are growing increasingly by stacking a layer on top, or by placing them on a separate chiplet, rather than by squeezing more into the same layer. {.law}

The claims are sorted into three groups by strength of evidence. Each has a date. Figures go out of date, but the date shows how old they are.

### Stated in vendor documents {#h.est .sub3}

- <span class='tag h'>Document</span>AMD's Ryzen 7 9800X3D, announced 31 October 2024, stacks a {x3dStack} MB cache die **beneath** the processor die (the previous two generations stacked it above). L3 totals {x3dL3} MB; with L2 the total is {x3dTotal} MB (AMD press release). {#e1}
- <span class='tag h'>Document</span>Large caches in server and AI chips: AMD EPYC 9755 (on sale 10 October 2024) has {epycL3} MB of L3 across {epycN} cores; AMD Instinct MI300X (on sale 6 December 2023) has a last-level cache of {miLlc} MB (AMD product page, opened 15 November 2026). The product page for Intel's Xeon 6980P carries the title “{xeonL3} MB cache”, but the page itself refused access, so only the title was seen. {#e2}
- <span class='tag h'>Document</span>L1 of current flagship cores: Lion Cove has a {lcL0} KiB L0 and a {lcL1} KiB L1 (2024); Zen 5 has {zL1} KiB, {zL1w}-way (August 2024); the L3 shared by one Zen 5 core complex is up to {zL3max} MB, depending on the chip (AMD optimisation guide). {#e3}

### Built and measured by someone {#h.demo .sub3}

- <span class='tag m'>Measured</span>Chips and Cheese tested the Ryzen 9 9950X (14 August 2024): memory latency just over {dramNs} ns; when data sits in another chiplet's cache, the transfer between cores takes about 200 ns. {#d1}
- <span class='tag m'>Measured</span>Chips and Cheese tested Lion Cove (27 September 2024, Core Ultra 7 258V): L3 {llL3lat} cycles, memory about {llDram} ns. {#d2}
- <span class='tag m'>Measured</span>jia.je tested Neoverse V3 on AWS Graviton 5 (13 June 2026): L1 data cache {v3lat} cycles. A test that maps one physical page at two virtual addresses confirmed that the hardware handles aliasing, at a cost of running 1.66 times slower when it happens. {#d3}
- <span class='tag m'>Measured</span>SRAM has nearly stopped shrinking. At IEDM in December 2024, TSMC reported N2 SRAM density of {n2Mb} Mb per mm², only about {n2Gain}% above N3, while N3 was only about {n3Gain}% above the generation before (IEEE Spectrum, 12 December 2024). {#d4}

### A claim I could not verify {#h.claim .sub3}

- <span class='tag l'>Claim</span>Club386 reported on 11 November 2026 on AMD's Zen 6 launch material: {z6core} MB of L3 per core, {z6L3} MB for a {z6n}-core chiplet; a Zen 6c chiplet with {z6cN} cores has {z6cL3} MB. This page found no AMD document of its own. {#c1}
- <span class='tag l'>Claim</span>Neoverse V3's L1 data cache uses RRIP-style replacement and its L1 instruction cache uses pseudo-LRU. This is Arm's technical reference manual as quoted by jia.je; the manual's page is rendered by script, and this page could not open it directly. {#c2}

Taken together: SRAM shrinks only a few percent per generation while logic keeps shrinking, so cache takes up a growing share of costly area. Vendors have therefore moved caches elsewhere: stacking a layer (3D V-Cache), placing them on a separate chiplet, or building a large last-level cache shared by the whole chip. The argument of Chapter 1 has not changed. An extra level that catches some accesses that would otherwise go to memory is worth its cost.

The figures in this chapter go out of date fastest. Product pages sometimes report “cache” as the total of L2 and L3, as the 9800X3D's {x3dTotal} MB does, so when comparing, check which levels are counted. {.take}

## Wrap-up: three questions to ask of a chip's caches {#ch12}

::: strings
toc: Wrap-up: three questions to ask of a chip's caches
:::

Caches let a core avoid waiting most of the time by three means: moving data a line at a time, placing it by sets, and passing it through several levels. The size of each level is a trade-off between how much more it catches as it grows and how much slower it becomes. {.law}

{.plain .qs}
1. **How big is each level, how many ways, and how many cycles?** Capacity sets the largest working set it can catch (Chapters 1 and 10); the way count sets how many conflict misses occur (Chapter 3); and L1 capacity is also capped by page size × ways (Chapter 7). {#q1}
2. **Which levels are private, which are shared, and how do L3 and L2 relate?** An inclusive design counts only L3's capacity; an exclusive one adds the two together (Chapter 6). Several cores writing the same line invalidate each other (Chapter 9). {#q2}
3. **Do my program's accesses follow a pattern?** A fixed stride can be prefetched (Chapter 8). A one-off large scan may push out hot data (Chapter 4). And how much it writes, and whether data is reused soon after a write or much later (Chapter 5). {#q3}

Back to the start: memory takes {dramNs} ns, about {dram} cycles. *Moving whole lines* brings in neighbouring data at once. *Placing by sets* keeps a lookup to a few tag comparisons. *Multiple levels* let the {zL1} KiB L1 serve the most-used small part in {zL1lat} cycles, and the {zL3} MiB L3 serve the large part in {zL3lat} cycles. The Chapter 1 program, with all three levels on, sends only {memShare} of its accesses to memory, averaging {amat3} cycles each. {#sum .sum tag=div}

Further reading: <a href='../why-compute-waits-for-memory/'>Why Compute Waits for Memory</a> covers the whole latency ladder, matrix blocking and the memory wall. <a href='../switches-that-compute/#ch11'>Chapter 11 of “How a Pile of Switches Learned to Do Arithmetic”</a> covers what a real processor adds to the machine we build there. <a href='../how-virtual-memory-works/'>How Virtual Memory Works</a> covers page tables and the TLB; <a href='../how-cores-share-memory/'>How Cores Share Memory</a> covers how cores agree on the order of reads and writes; <a href='../how-memory-talks/'>How Memory Talks to the CPU</a> covers what happens in the tens of nanoseconds a memory access takes below the caches. {#links style="margin-top:2em"}

::: footer
**Sources.** AMD, Software Optimization Guide for the AMD Zen5 Microarchitecture, publication 58455 rev 1.00 (August 2024). AMD Hot Chips 2024 presentation slides (Cohen, Subramony, August 2024). Intel's 2024 technology tour slides, “Next Gen P-core: The Lion Cove Architecture”; Intel Hot Chips 2024 Lunar Lake presentation slides. Chips and Cheese: “AMD's Ryzen 9950X: Zen 5 on Desktop” (2024-08-14), and “Lion Cove: Intel's P-core roars” (2024-09-27). jia.je, Arm Neoverse V3 (Graviton 5) measurements (2026-06-13). AMD press release: Ryzen 7 9800X3D (2024-10-31); AMD and Intel product pages (Ryzen 9 9950X, EPYC 9755, Instinct MI300X, Xeon 6980P). IEEE Spectrum on TSMC N2 SRAM (2024-12-12). Club386 on Zen 6 (2026-11-11). All of the above were opened on 15 November 2026. Classic results: Mattson et al. (1970, reuse distance); Belady (1966, optimal replacement); Hill (1987) and Hill and Smith (1989, the three kinds of miss); Jaleel et al. (2010, RRIP); Chen and Baer (1995, stride prefetching); Papamarcos and Patel (1984, MESI).

Links and URLs are listed in BRIEF.md. This page explains mechanisms only and does not rate products.
:::
