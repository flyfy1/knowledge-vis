---
lang: en
title: How Cores Share Memory · a long essay you can play with
desc: Eight cores each have their own caches, yet must see one memory. When one core changes a number, how do the others find out? Why do two threads that each add one a million times not end at two million? Why does a program that runs correctly on one CPU fail on another? Nine hands-on models: the two rules of cache coherence, a snooping simulator for MSI, MESI and MOESI, directory protocols, the lost update, CAS and fetch-and-add, how long a line takes to move between cores, litmus tests under sequential consistency, x86-TSO and a weak memory model, and how four spinlocks scale.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.ns: {v} ns
u.ms: {v} ms
u.mps: {v} million per second
u.x: ×{v}
u.none: —
u.yes: allowed
u.no: does not occur
u.ok: holds
u.bad: broken
:::

# How Cores Share Memory {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

Eight cores each have their own cache, yet they must see “the same memory”.<br>When one core changes a number, how do the others find out? {.sub}

Two more questions follow. Why does a pair of threads that each add one a million times end with less than two million? Why does a program that is correct on one CPU go wrong on another? We start with two caches that disagree, then the two rules the hardware keeps, then MSI, MESI and MOESI, which snoop on a bus, and the directory that takes over once there are many cores. Then we turn to the program side: how an addition gets lost, how an atomic instruction repairs it and why that costs, why a CPU can show you memory out of order, how fences and acquire and release restore the order, and finally locks. **Every model is a real protocol or a real rule run at small scale**: a textbook snooping coherence simulator, an abstract machine for x86-TSO following Sewell et al.'s 2010 paper, and the four spinlocks from Mellor-Crummey and Scott's 1991 paper. {.lead}

An AI wrote this page. The protocols and memory models come from primary sources (Sorin, Hill, Wood and Nagarajan's textbook A Primer on Memory Consistency and Cache Coherence, 2nd edition; the x86-TSO paper; Arm's white paper; the RISC-V RVWMO specification; the MCS lock paper). How long a line takes to move between cores comes from public measurements (Chips and Cheese), and each one gives its source and date. **Values marked “tuned parameter” were chosen so the models could compute, not measured**; the text says how far the conclusion moves when each one doubles. This page explains mechanisms only and **does not rate which chip is worth buying**. {.note}

## Two caches, one stale copy {#ch1}

::: strings
toc: Two caches, one stale copy
:::

Every core has its own cache, and the same value can exist in several copies at once. If one core changes its copy and nobody else knows, the others keep reading the old value. {.law}

Picture a whiteboard in an office that shows today's meeting room. Everyone has copied it into their own notebook. Someone changes the room in their notebook and tells nobody, so the others walk to the wrong door.

A CPU cache is that notebook. [[how-cpu-caches-work|“How a CPU's Three Levels of Cache Work”]] explained that each core has its own L1 and L2, and that a write normally stays in the cache for a while before it goes back to memory (write-back). With one core this is fine. With eight cores, core 0 changes the variable x: the new value lives only in core 0's cache, core 1's cache still holds the old x, and memory is old too. <a href='../how-cpu-caches-work/#ch5'>Chapter 5 of that essay</a> covers write-back itself; this one covers the trouble it causes.

::: diagram dg-stale keys=dg.stale
cap: Without a coherence protocol: core 0 changes x in its own cache. Core 1's cache and memory know nothing, so core 1 reads the old 0 from its own cache. Schematic, not to scale.
aria: Diagram: core 0's cache has x changed to 1; core 1's cache and memory still hold the old 0
c0: Core 0
c1: Core 1
k0: Cache: x = 1
k0n: just changed
k1: Cache: x = 0
k1n: old
mem: Memory: x = 0 (also old)
w: Write x = 1
r: Read x → 0
none: Between caches: no one told
:::

::: lab ch1-model
model.title: Two cores, one variable x
model.how: Four fixed steps: core 0 reads x, core 1 reads x, core 0 changes x to 1, then core 1 reads x. Start with “No protocol”, step through, and see what core 1 reads at the end. Then switch to MESI and run it again. x starts at 0.
ctl.proto: Between caches
p.none: No protocol
p.mesi: MESI
btn.step: Next step
btn.reset: Restart
steps.aria: Four steps; completed steps are marked
read.last: Core 1's last read
read.swmr: Single writer, multiple readers
read.value: Data value
core0: Core 0's cache
core1: Core 1's cache
mem: Memory
cell: state {s} · x = {v}
cell.empty: no x
step.0: Core 0 reads x
step.1: Core 1 reads x
step.2: Core 0 writes x = 1
step.3: Core 1 reads x
say.start: x is 0 in memory, and neither cache has it yet. Press “Next step”.
say.step1n: Core 0 reads x = 0 from memory and keeps it in its own cache.
say.step2n: Core 1 also reads x = 0. Now there are three copies of x: one in memory and one in each cache, all 0.
say.step3n: Core 0 changes its own copy to 1, and only in its own cache. Core 1's copy is still 0, and nobody tells it.
say.step1p: Core 0 reads x: no one else has it, so it is read from memory and marked exclusive (E).
say.step2p: Core 1 reads x: core 0 hears the request and hands over its copy, and both copies become shared (S).
say.step3p: Core 0 wants to write: it first shouts “I am changing this line” on the bus, core 1's copy is invalidated (I), and core 0 becomes modified (M), with x = 1.
say.stale: Core 1 reads *{v}*, but x was changed to {latest} long ago. Its copy is stale, and it will never update itself.
say.fresh: Core 1's copy has already been invalidated, so it asks again: core 0 hands over the new value, and core 1 reads *{v}*.
:::

Without a protocol, core 1 ends with {stNoneVal}; with MESI it ends with {stMesiVal}. The difference lies only in step 3: whether the other copies are invalidated before core 0 writes. This is called **cache coherence**: the hardware guarantees that several copies in several caches look, to the program, like one copy.

This has one variable and two cores, and each step completes in full. On a real machine, the shout-and-wait of step 3 takes tens to hundreds of nanoseconds by itself (Chapter 7), and many cores may shout at once. {.take}

## Two rules {#ch2}

::: strings
toc: Two rules
:::

Coherence asks for two things. At any moment, a location has either one core that can write it, or several cores that can only read it. And the value at the start of each period equals the value at the end of the last period in which it could be written. {.law}

Back to the whiteboard. The simplest rule is this: anyone who wants to change the meeting room first collects everyone's notebooks and invalidates them, then lets everyone copy the new version. While someone is changing it, only one person holds the pen. While nobody is changing it, everyone can look, but nobody can touch.

Sorin, Hill, Wood and Nagarajan's textbook, A Primer on Memory Consistency and Cache Coherence (2nd edition, 2020), defines coherence with two rules. **Single-writer–multiple-reader** (SWMR): for any location, at any time, either one core may write it (and may read it too), or several cores may only read it. **Data-value invariant**: at the start of a period, the location's value equals the value at the end of its previous writable period. The first rule stops two cores changing it at once; the second stops a core reading an old copy left over from before an invalidation.

::: diagram dg-epochs keys=dg.epochs
cap: The time for one address is cut into periods. Gold periods have one core that reads and writes (R/W); cyan periods have several cores that only read. The value at the start of each period equals the value at the end of the last gold period. Schematic, not to scale.
aria: Diagram: the timeline of one location is cut into periods; each period has either one core reading and writing, or several cores only reading
time: Time →
timeV: Time ↓
sep: ", "
rw: Core {c} R/W
ro: Cores {list} read only
v: x = {v}
c0: Core 0
c1: Core 1
c2: Core 2
note: Each period's start value = end value of the last read-write period
:::

Back to the model in Chapter 1. Choose “No protocol” and step to step 3: both readouts turn to “broken”. Core 0 has already changed x, but core 1 still holds a copy, so the first rule is broken; that copy is the old 0, so the second rule is broken too. At step 4, core 1 actually reads the old value. With MESI, both rules hold at every step.

The rules apply to **cache lines**, not to variables: the hardware cannot tell which of a line's 64 bytes belong to which variable. Two unrelated variables that share one line mean that when one core writes one, the other core's whole line is invalidated. This is false sharing, which <a href='../how-cpu-caches-work/#ch9'>Chapter 9 of “How a CPU's Three Levels of Cache Work”</a> covers.

Coherence governs only one location's own history. It says nothing about which of two different locations is seen first. “Write x, then write y: can another core see y first?” is a different question, the memory consistency model, covered in Chapters 8 and 9. {.take}

## Snooping on the bus: MSI, MESI, MOESI {#ch3}

::: strings
toc: Snooping on the bus: MSI, MESI, MOESI
:::

Connect all the caches to one bus, so that every request can be heard by everyone. Each cache records a state for every line it holds, and when it hears another's request it changes its state by a table. That keeps both rules. {.law}

The earliest multicore machines, which were really multi-chip, hung all processors and memory on one bus. The bus has a natural property: only one party speaks at a time, so all requests line up in one order, and every cache hears them in that same order. This is called **snooping**: each cache controller sends requests for its own core and listens to the bus for everyone else's.

::: diagram dg-snoop keys=dg.snoop
cap: Snooping: core 2 sends “I want to write A” (BusRdX), and the request is broadcast on the bus. The caches of cores 0, 1 and 3 all hear it, and any copy of A they hold is invalidated. The data comes from memory, or from the cache that holds the latest value. Schematic, not to scale.
aria: Diagram: four cores' caches and memory on one shared bus; one cache sends a request and the others are listening
core: Core {c}
cache: Cache
bus: Shared bus: one request at a time
mem: Memory
req: BusRdX A
listen: Caches 0, 1, 3 hear BusRdX:
listen2: drop any copy of A
data: Data
:::

The simplest protocol has three states. **M** (modified): only I have it, and I changed it, so memory is out of date. **S** (shared): I have a clean copy, and others may too. **I** (invalid): I do not have it. To read a line in state I, send BusRd; when the data arrives, the line becomes S. To write, send BusRdX (read and ask for exclusive ownership), or, if I hold it as S, send BusUpgr (ownership only). Every other copy becomes I, and mine becomes M. When I hear another cache's BusRd and I hold M, I hand over the data, write it back to memory, and drop to S. This is **MSI**.

MSI wastes effort in two places. First, data only I use is read in as S, and the first write still has to shout BusUpgr on the bus, though nobody needs to be invalidated. **MESI** adds **E** (exclusive, clean): if no one answers a read, the line is marked E, and a later write can change it to M silently. Second, when a modified line is read by someone else, MSI and MESI both write it back to memory before dropping to S. **MOESI** adds **O** (owned): when a modified line is read, I become O and keep the job of supplying data to others, and memory is not written yet. The write-back waits until O is evicted. The five-state MOESI was proposed by Sweazey and Smith in 1986. Intel's QPI uses MESIF, where F (forward) marks one clean copy that is responsible for supplying data. It differs from O in that it was never modified, so it can be dropped quietly.

::: diagram dg-mesi keys=dg.mesi
cap: The MESI state of one line in one cache. Solid arrows start from the core's own actions (PrRd for a read, PrWr for a write; the bus request it sends is in brackets). Dashed arrows are bus requests heard from another cache. Thin grey lines are evictions (Evict). Read hits, and reads and writes in M, which do not change the state, are not drawn. Compared with the simple diagram in [[how-cpu-caches-work#ch9|Chapter 9 of “How a CPU's Three Levels of Cache Work”]], this one fills in every transition and labels each arrow with its bus request.
aria: Diagram: all the transitions among the four MESI states; solid arrows are the core's own reads and writes, dashed arrows are bus requests heard from others
M: Modified
E: Exclusive
S: Shared
I: Invalid
legP: Solid: own reads and writes
legS: Dashed: requests heard from others
legE: Thin grey: own evictions
e1: PrRd, no one has it (BusRd)
e2: PrRd, someone has it (BusRd)
e3: PrWr (BusRdX)
e4: PrWr, no request
e5: PrWr (BusUpgr)
e6: Heard BusRd: supply, write back
e7: Heard BusRdX: supply
e8: Heard BusRd
e9: Heard BusRdX
e10: Heard BusRdX or BusUpgr
e11: Evict: write back
e12: Evict: no request
:::

::: lab ch3-model
model.title: A four-core, four-line coherence simulator
model.how: Pick a protocol, then press buttons to make a core read, write or evict a line (choose the line first, above), and watch each cache's states change and what goes on the bus. Or press a ready-made sequence, which runs {simRounds} rounds. The bars below run your sequence under all three protocols and compare the number of bus requests and writebacks.
ctl.proto: Protocol
p.msi: MSI
p.mesi: MESI
p.moesi: MOESI
ctl.line: Line to act on
l.0: A
l.1: B
l.2: C
l.3: D
ctl.preset: Ready-made sequences
pre.private: Private data
pre.prodcons: One writer, three readers
pre.migratory: Taking turns
pre.readonly: Everyone only reads
btn.reset: Clear
grid.aria: The state of each core's copy of the four lines
log.aria: Recent actions
read.tx: Bus requests (including writebacks)
read.mem: Read from memory
read.c2c: Supplied cache to cache
read.wb: Written back to memory
read.inv: Copies invalidated
read.inv2: the two rules
model.aria: Bar chart: bus requests and writebacks for the same sequence under MSI, MESI and MOESI
btn.R: Core {c} reads
btn.W: Core {c} writes
btn.E: Core {c} evicts
grid.core: Core {c}
grid.mem: Is memory up to date?
grid.memok: yes
grid.memold: stale
log.empty: No actions yet
log.item: C{c} {op} {l} {a}→{b}{bus}
op.R: reads
op.W: writes
op.E: evicts
bar.tx: {p} bus requests
say.start: All four caches are empty (all I). Press a button or choose a ready-made sequence.
say.hit: Core {c} reads {l}: it already has the line ({s0}), a hit, and nothing goes on the bus.
say.hitw: Core {c} writes {l}: it holds M, so it changes the line directly and sends nothing.
say.silent: Core {c} writes {l}: it holds E and no one else has a copy, so it becomes M *silently*. MSI would send one BusUpgr here.
say.upgr: Core {c} writes {l}: it holds {s0}, so it sends BusUpgr, invalidates {n} other copies, and becomes *M*.
say.rdE: Core {c} reads {l}: it sends BusRd, no one answers, so the line is read from memory and marked *E*.
say.rdmem: Core {c} reads {l}: it sends BusRd and reads from memory, marking the line *{s1}*.
say.rdc2c: Core {c} reads {l}: it sends BusRd, and another cache supplies the data directly, marking the line *{s1}*.
say.rdwb: Core {c} reads {l}: it sends BusRd; the cache holding M supplies the data, *writes it back to memory* at the same time, and drops to S.
say.rdown: Core {c} reads {l}: it sends BusRd; the cache that had modified the line becomes (or already is) *O* and supplies the data, and memory is not written yet.
say.rdxmem: Core {c} writes {l}: it sends BusRdX, reads from memory, invalidates {n} copies, and becomes *M*.
say.rdxc2c: Core {c} writes {l}: it sends BusRdX, another cache supplies the data, {n} copies are invalidated, and it becomes *M*.
say.evict: Core {c} evicts {l}: it holds a clean {s0}, so it is dropped with no request.
say.evictwb: Core {c} evicts {l}: it holds a modified {s0}, so it is *written back to memory*.
say.evictnone: Core {c} evicts {l}: it had no copy.
say.p.private: “Private data”: each core reads a line only it uses, changes it, and then loses the line from its cache; {r} rounds. Under {p}: {tx} bus requests, of which {up} are BusUpgr.
say.p.prodcons: “One writer, three readers”: core 0 changes A, and cores 1, 2 and 3 each read it; {r} rounds. Under {p}: {tx} bus requests, {wb} writebacks, and {mem} reads from memory.
say.p.migratory: “Taking turns”: four cores in turn read A and change it, like passing a counter around; {r} rounds. Under {p}: {tx} bus requests and {wb} writebacks.
say.p.readonly: “Everyone only reads”: four cores repeatedly read the same line; {r} rounds. Under {p}: only {tx} bus requests, and everything after is a hit.
:::

The four ready-made sequences each show one difference. “Private data”, {simRounds} rounds: MSI sends {prMsiTx} bus requests, {prMsiUp} of them unnecessary BusUpgrs; MESI sends only {prMesiTx}. “One writer, three readers”: MESI writes back {pcMesiWb} times and MOESI {pcMoesiWb}, and the bus requests differ by exactly that ({pcMesiTx} against {pcMoesiTx}). MOESI's {pcMoesiWb} holds only because the O line is never evicted in this sequence: it ends dirty, and owes one writeback when it leaves. MSI reads from memory {pcMsiMem} times, MESI only {pcMesiMem} (the writer's first fill), because MESI lets a clean copy supply data directly. “Taking turns” shows the use of O best: MESI writes back {mgMesiWb} times with {mgMesiTx} bus requests, and MOESI writes back {mgMoesiWb} times with {mgMoesiTx} bus requests. “Everyone only reads” costs one read each at first, and after {roMesiTx} bus requests nothing else follows: shared data that is only read costs almost nothing. What costs is shared data that is *both read and written*.

This simulator completes each action in full, so there is no in-between state where a request has been sent but the data has not yet arrived. The hard part of a real protocol is exactly those in-between states: how two cores that want to write the same line at once take turns is a whole chapter in the textbook. It also has no writeback buffers and no inclusion between cache levels. {.take}

## Many cores: the directory {#ch4}

::: strings
toc: Many cores: the directory
:::

The cost of broadcasting grows with the number of cores. With more cores, keep for each line a list of who holds it, and send requests only to the cores on the list. This saves bandwidth, at the price of an extra hop and of storage for the list. {.law}

Four people in a meeting can each shout when they have something to say. A hundred people shouting like that, and everyone spends all day listening to other people's business. Snooping is the same: on every miss, all N − 1 other caches must check their tags, so doubling the cores doubles both the bus requests and the checks each cache has to make. And today's chips have no single shared bus: cores are linked by rings or meshes (<a href='../how-a-computer-is-wired/#ch6'>Chapter 6 of “How the Parts of a Computer Are Wired Together”</a>), where broadcasting is expensive.

A **directory** works like this: each line is given a **home**, usually chosen by address and placed beside one slice of L3 or one memory controller. The home records the line's state, its owner, and which cores hold shared copies. To read or write, a core asks the home first. The home knows whom to contact, and sends messages only to those cores.

::: diagram dg-dir keys=dg.dir
cap: The same case: core 0 wants to read A, which is modified and held by core 3. Snooping: the request is broadcast to every cache. Directory: the request goes first to A's home; the home checks its list and forwards it only to core 3, which sends the data straight back to core 0. Schematic, not to scale.
aria: Diagram: on the left, snooping, where requests are broadcast to every cache; on the right, a directory, where the request goes first to the line's home, which forwards it only to the caches on its list
snoop: Snooping: broadcast
dir: Directory: ask the home first
core: C{c}
home: A's home
entry: A: M, owner C3
all: Every cache checks
only: Only those on the list
:::

The directory saves bandwidth but adds a hop. The hardest case is a line that has been modified and is held by another core: the requester goes to the home, the home forwards to the owner, and the owner sends the data to the requester. That is three legs, called a **three-hop** miss. Snooping needs only two: a broadcast, and the owner answers directly.

::: diagram dg-hops keys=dg.hops
cap: Top: a read miss. A is modified in core 3. ① GetS (a read request) goes to the home. ② The home forwards it to the owner. ③ The owner sends the data to the requester, and ④ sends a copy back to the home (the line becomes shared). Bottom: a write (GetM, a write request). A has two shared copies. The home replies with the data and the number of Acks to wait for, and sends Inv (invalidation) to both holders; each holder sends its Ack (acknowledgement) straight to the requester, which can write only when all the Acks have arrived. C = core. Schematic, not to scale.
aria: Diagram: a three-hop read miss under a directory protocol, and a write that must invalidate two shared copies
req: Requester
home: Home
homeSub: Directory
own: Owner
core: C{c}
sh: Sharer
r1: ① GetS A
r2: ② Forward
r3: ③ Data
r4: ④ Data to home
w1: GetM A
w2: Data; wait for 2 Acks
w3: Inv
w4: Ack
top: Read: three hops
bot: Write: two Invs, collect Acks
:::

The list needs storage. The most direct way is a bit vector per line: one bit per core, plus 2 state bits (Primer §8.5). A line holds 64 bytes, which is 512 bits, so with 64 cores the directory takes {ov64} of the data, with 256 cores {ov256}, and with 1024 cores {ov1024}: more than the data itself. There are two ways to save space. A **coarse vector** gives one bit to every {dirK} cores, bringing 1024 cores down to {ovC1024}, at the cost of invalidating a whole group when needed. **Limited pointers** record the IDs of at most {dirI} holders, which comes to {ovP1024} at 1024 cores; when the list overflows, the protocol falls back to broadcasting. Real chips also record lists only for lines actually in a cache (a sparse directory, or snoop filter), not for all of memory.

::: lab ch4-model
model.title: Doubling the cores: how big the list gets, and how many messages
model.how: Move the slider for the core count. The top chart shows how many bits per line the list needs, as a percentage of the 64-byte data (log scale on the horizontal axis). The bottom chart shows the messages per miss on the same access sequence, under snooping and under a directory. The sequence is {dirOps} random accesses on the MESI simulator from Chapter 3: {dirHot} of the accesses land on {dirHotN} hot lines, out of {dirLines} lines, and {dirPW} are writes. This mix is a **tuned parameter**.
model.aria: Two charts: directory storage as a share of data against core count; messages per miss for snooping and for a directory
leg.full: Bit vector
leg.coarse: Coarse vector
leg.ptr: Limited pointers
leg.snoop: Snooping broadcast
leg.dir: Directory
ctl.n: Cores
read.full: Bit vector as share of data
read.snoop: Snooping: messages per miss
read.dir: Directory: messages per miss
read.hop: Directory misses that take three hops
cv.ov: List as a share of data
cv.msg: Messages per miss
cv.x: Cores
say.snoopwins: {n} cores: snooping sends {s} messages per miss and the directory {d}, so *snooping is still cheaper*, and it takes only two hops. With few cores, broadcasting is not expensive.
say.dirwins: {n} cores: snooping sends {s} messages per miss, while the directory sends only *{d}*. The cost is that {hop} of misses take three hops, and the list takes {ov} of the data.
:::

At 4 cores, snooping sends {d4s} messages per miss and the directory {d4d}, so snooping is cheaper. At 16 cores it is {d16s} against {d16d}; at 64 cores, {d64s} against {d64d}; at 256 cores, {d256s} against {d256d}. The directory's message count barely depends on the number of cores, because most data is shared by only a few cores; snooping's grows in proportion to them. At 64 cores, {d64hop} of directory misses take three hops. So today's server chips find nearby cores quickly through a shared L3 and its tags within a small cluster, and use a directory or snoop filter between clusters and between chiplets.

The message count includes only requests, forwards, data, invalidations and acknowledgements. It leaves out writebacks on eviction, and the number of hops a message takes across the mesh. The degree of sharing is a tuned parameter: if every line were read by every core, the directory would still send N messages when invalidating. {.take}

## Two threads, a million adds each {#ch5}

::: strings
toc: Two threads, a million adds each
:::

Coherence guarantees that each address has just one history, but it does not guarantee that your three steps of “read, add one, write back” are not interrupted by someone else. When two threads do this at the same time, some additions are lost. {.law}

Two people share one bank account with a balance of 100. Both deposit 50 at two cash machines at the same time. Both machines read 100, each works out 150, and each writes 150 back. The final balance is 150: one deposit has vanished, although every individual read and write was carried out correctly.

The <code>count++</code> in a program is also three steps: read count into a register, add one, write it back. Let two threads each run it a million times on two cores. The coherence protocol keeps working throughout: each write first invalidates the other copies, and each read gets the latest value. The trouble is that “latest” means the latest at the moment of the read. Between the read and the write-back, the other core may already have written, and your write-back overwrites it. This is a **lost update**. A program in which two threads read and write the same variable with no synchronisation at all has a **data race**.

::: diagram dg-race keys=dg.race
cap: A lost update. Both threads read 5 and each works out 6. The write-back that happens last overwrites the other: two additions, but the count rises by only 1. Each individual read and write is correct.
aria: Diagram: two threads' reads and write-backs interleave, and one addition is overwritten
a: Thread A
b: Thread B
mem: count in memory
ld: Read 5
st: Write back 6
lost: B's write-back overwrites A's
time: Time →
:::

::: lab ch5-model
model.title: Count every interleaving
model.how: Each of two threads adds k times, and each addition is two steps: read, then write back. Drag k: the model counts every possible order of the 4k steps of the two threads (by dynamic programming, not by random trials) and draws the distribution of final results, counting each order once. Tick “Atomic add” to merge the read and the write-back into one step.
model.aria: Bar chart: the distribution of the final count over all interleavings
ctl.k: Additions per thread
ctl.atomic: Atomic add
read.n: Number of orders
read.ok: Share with the correct result
read.min: Lowest possible result
:::

Adding 1 each gives {lu1n} orders, and the lowest result is {lu1min}. Adding 2 each gives {lu2n} orders, and the lowest result is already {lu2min}. Adding 3 each gives {lu3n} orders, of which only {lu3ok} give the right answer. Adding 5 each gives {lu5n} orders, of which only {lu5ok} are right, and the lowest is still {lu5min}. The minimum is 2 rather than k, which is counter-intuitive: one thread reads 0 and then does not write; it waits while the other finishes almost all its additions, then writes back 1 and erases the other's work. The other thread's last read sees this 1 and writes back 2.

The count is of how many orders are possible, not of how often they happen on a real machine. On real hardware two cores run at the same time, and how many additions are lost depends on how their paces line up. Below, a random scheduler runs the full million: each round it lets one thread run a number of steps in a row, averaging b. b is a **tuned parameter**, standing for how far apart the paces of the two cores are. On real hardware, each run gives a different result.

::: lab ch5-lab
model2.title: A million adds, random interleaving
model2.how: Drag b and see what the count is after each of the two threads adds {raceN} times. At b = 1, the two threads strictly alternate, one step each.
ctl.b: Average steps per round (b)
read.final: Final count
read.lost: Lost additions
cv.x: Final count
cv.y: Share of all orders
say.k1: Each thread adds 1: of {n} orders, {ok} give 2. When both threads read before either writes, the result is *{min}*.
say.race: Each thread adds {k} times: of {n} orders, only {ok} reach the correct {k2}. The lowest possible result is *{min}*, not {k}.
say.atomic: Atomic add: the read and the write-back cannot be split, so all {n} orders give *{k2}*.
say.racebad: b = {b}: count = *{final}*, {lost} additions were lost, leaving only {share} of the correct total.
:::

At b = 1 the two threads strictly alternate: both read the same value and write back the same value, so exactly half is lost, and count = {rc1}. At b = 64, count = {rc64}; at b = 1024, {rc1024}, and {rc1024lost} additions are lost. Between b = 4 and b = 1024, the lost share stays between {rcLo} and {rcHi} of two million. The more the paces differ, the fewer the switches; but at each switch, if one thread has stopped between its read and its write-back, its write-back erases the whole stretch the other thread has done. The longer the stretch, the more is erased, and the two effects roughly cancel (this is for the page's fixed random seed; the larger b is, the more the result moves with a different seed). So the answer to the opening question is: two threads that each add a million times end with less than two million, by an amount that differs from run to run. This has nothing to do with cache coherence, which is always correct.

The scheduler switches only between reads and writes. Real cores run at the same time, and a write-back can be delayed because the cache line is still on its way. Also, under the rules of C and C++ a data race has undefined behaviour, and the compiler may combine a million additions into one, so a real program does not even guarantee “less than two million”. {.take}

## Atomic instructions {#ch6}

::: strings
toc: Atomic instructions
:::

An atomic instruction makes read, modify and write one unit that cannot be interrupted. The cache's way of doing this: first make the line M, and do not hand it to anyone until the operation is done. {.law}

Back to the cash machine: the bank's way is to lock the account before changing the balance, read, calculate and write, then unlock, while the other machine waits. The CPU does the same, except that what it locks is not an account but that one cache line.

x86 adds a **LOCK prefix** to many read-modify-write instructions: <code>lock add</code>, <code>lock xadd</code> (fetch the old value and add), <code>lock cmpxchg</code> (compare and swap, CAS); <code>xchg</code> has LOCK built in. The x86-TSO paper describes it this way: to execute a LOCK'd instruction, a thread first takes a global lock, and at the end empties its own store buffer before releasing it; while the lock is held, no other thread can read. Real hardware has no global lock, of course. For ordinary memory, it normally makes the core take the line to state M, and it delays its replies to other cores' requests for that line until the read-modify-write is complete. Arm originally had only one pair, **LDXR / STXR** (load exclusive, store exclusive): LDXR reads and records the address in an exclusive monitor; before writing, STXR checks whether anyone else has written in the meantime. If someone has, STXR fails and returns 1, and the program goes back and tries again. RISC-V's LR/SC works the same way. Armv8.1 added the **LSE atomics**: <code>LDADD</code>, <code>CAS</code> and <code>SWP</code>, which finish in one instruction and never fail. RISC-V's equivalent is the AMO instructions, such as <code>amoadd</code>.

::: diagram dg-atomic keys=dg.atomic
cap: Top: one <code>lock xadd</code>. Core 0 first takes the line to M with BusRdX. Until its read, add and write are finished, core 1's requests for this line are held back, and the line is handed over only afterwards. Bottom: LDXR / STXR. The monitor records the address; if another core writes the line in between, STXR fails and the loop starts again. Schematic, not to scale.
aria: Diagram: above, how a cache holds a line in state M to complete an atomic add; below, the exclusive monitor of LDXR / STXR
c0: Core 0
c1: Core 1
get: BusRdX: take to M
hold: Read, add, write; held in M
wait: Request for the line: wait
give: Hand over when done
ll: LDXR: read, record address
other: Someone writes the line
sc: STXR: fails, returns 1
retry: Go round and retry
top: x86 LOCK: hold the line in M
bot: Arm LDXR / STXR: retry on failure
:::

The atomic-add version of the model in Chapter 5 gives the right answer for every interleaving. But there are two ways to make an operation atomic: one atomic add instruction (x86's <code>lock xadd</code>, Arm's <code>LDADD</code>), or a CAS loop: read the old value, compute the new one, and use CAS to store it. CAS fails if someone else changed the value in the meantime, so the loop goes back and reads again. Both are correct, but as more threads crowd in, the difference grows large.

::: lab ch6-model
model.title: CAS loop and atomic add as threads are added
model.how: Drag the number of threads. Each thread must add {casM} times, and at each step the scheduler picks one thread at random to make one memory operation. A CAS loop takes two steps per attempt, a read and a CAS; if the value has been changed by someone else when the CAS runs, it fails and tries again. An atomic add takes one step each time and never fails. The chart shows the average number of steps needed for each completed addition.
model.aria: Line chart: memory steps per addition for a CAS loop and for atomic add at different thread counts
leg.cas: CAS loop
leg.faa: Atomic add
ctl.n: Threads
read.cas: CAS: steps per addition
read.fail: Share of CAS attempts that fail
read.faa: Atomic add: steps per addition
cv.x: Threads
cv.y: Memory steps per addition
say.one: 1 thread: nobody interferes, so CAS takes {s} steps per addition (one read, one CAS), and it never fails.
say.many: {n} threads: a CAS loop takes on average *{s}* steps per completed addition, and {f} of the CAS attempts fail; atomic add always takes 1 step.
:::

With 2 threads a CAS addition averages {cas2} steps, with 8 threads {cas8}, and with 32 threads {cas32}, and {cas32f} of the CAS attempts at 32 threads are wasted. Every step is an access that must take the line to M, so a failed CAS costs more than time: it also moves the line between cores one more time. This is why Arm added LSE to large servers. LDXR / STXR fail and retry like a CAS loop, and the more cores there are, the more often they fail. A single LDADD never fails, and it can even be handed to a place closer to memory, which Arm calls far atomics.

The scheduler treats every memory step as equally long and interleaves them at random; on a real machine a step's length depends on whether the line is already held. CAS also has a pitfall this does not cover (ABA: a value is changed and changed back, and CAS cannot tell); LL/SC fails whenever anyone has written, so it has no such pitfall. {.take}

## A line moves between cores {#ch7}

::: strings
toc: A line moves between cores
:::

Two cores take turns changing the same line, and each time the line has to move from one core's cache to the other's. Such a move takes tens to hundreds of nanoseconds, while an addition in one's own cache takes under a nanosecond. {.law}

Atomic add guarantees correctness, not speed. For a counter shared by all threads, every addition needs the line taken to M: it is pulled from the core that last added to it, and that core's copy is invalidated. This is the same thing as <a href='../how-cpu-caches-work/#ch9'>false sharing</a>, except that here the sharing is real.

How long does one move take? Chips and Cheese measured AMD's EPYC Bergamo server chip (Zen 4c, published 22 June 2024) with the method used in this chapter: two cores take turns adding one to the same value in memory, and the time of each handoff is measured. Within one cluster (a group of cores sharing an L3), it is about {bIntraLo}–{bIntraHi} ns. Between clusters on the same chip, it is commonly {bCrossLo}–{bCrossHi} ns. Between sockets (two CPUs), it averages about {bSock} ns, and the worst pair is just over {bSockMax} ns. The desktop Ryzen 9 9950X also needed nearly {z5cross} ns between its two chiplets at launch (same source, 14 August 2024). For why moves between chiplets and between sockets are so slow, see [[how-a-computer-is-wired|“How the Parts of a Computer Are Wired Together”]], <a href='../how-a-computer-is-wired/#ch7'>Chapter 7</a> (between chiplets) and <a href='../how-a-computer-is-wired/#ch4'>Chapter 4</a> (between sockets).

::: diagram dg-ping keys=dg.ping
cap: Two cores take turns making atomic adds to the same counter. Before each addition, the line must be moved from the other core's cache (the long grey segment, one handoff between cores); the addition itself (the short gold segment) is a tiny fraction. Schematic, not to scale.
aria: Diagram: the line holding a shared counter moves back and forth between two cores; each addition waits for one move first
c0: Core 0
c1: Core 1
move: Move line
add: Add
time: Time →
:::

::: lab ch7-model
model.title: One counter, several cores adding to it
model.how: Drag the number of threads, choose where the cores sit, and choose whether they share one counter or each has their own, on its own line. A shared line goes to one core at a time, first come, first served. Each change of core costs one handoff time (the low end of the measured range above), and an addition in cache costs {pingT} ns (a **tuned parameter**, equal to a few cycles in L1).
model.aria: Bar chart: total additions per second for all threads together, with one shared counter against one per thread
ctl.n: Threads
ctl.place: Where the cores are
pl.intra: Same cluster
pl.cross: Across clusters
pl.socket: Across sockets
ctl.mode: Counter
m.shared: One shared
m.private: One each, own line
read.per: Per addition, on average
read.total: All threads together
read.thread: Each thread
read.time: Time for two million additions in total
bar.shared: One shared
bar.private: One each
say.one: 1 thread: nobody competes, the line stays in its own cache, and each addition takes {per}.
say.shared: {n} threads share one counter ({place}): every addition first moves the line, so together they manage only *{total}*, or {thread} each. More threads do not make it faster.
say.private: {n} threads each add to their own counter: no line moves, so together they reach *{total}*, and more threads means faster.
:::

Two threads in the same cluster sharing one counter manage only {piRate0} million additions per second together (with a handoff of {bIntraLo} ns; at {bIntraHi} ns it is {piRate1} million), and 8 threads still only {p8Rate} million. Across clusters it drops to {pcRate} million, and across sockets to {psRate} million. Two threads each adding a million take {piMs} ms in one cluster ({piMsHi} ms at a {bIntraHi} ns handoff), and {psMs} ms across sockets. Each thread adding to its own counter finishes the same work in {ppMs} ms, reaching {ppRate} million per second in total. Double the handoff time and the shared counter's speed roughly halves: its speed is simply how many line moves per second the machine can make. So a common way to write multithreaded programs is for each thread to sum into its own variable first, and merge the totals at the end.

On a real machine, arbitration is not strictly first come, first served: a core that has just got the line often manages several additions in a row, so the total can be higher than this; but some cores are starved. Measured handoff times come from one chip and one method, and other chips differ a great deal. {.take}

## Sequential consistency and the store buffer that breaks it {#ch8}

::: strings
toc: Sequential consistency and the store buffer that breaks it
:::

We assume a program is a queue of each thread's statements, executed one by one. A real CPU, to avoid waiting for memory, lets one thread's write take effect a little late, so other threads can see results that this queue could never produce. {.law}

You send a friend the message “the key is under the doormat”, then go and put the key there. The friend reads the message and goes to fetch the key, but it is not there yet. To you, you sent the message before putting the key down; to the friend, the order is reversed. The trouble is that the message and the key travel by different routes.

In 1979 Lamport gave the most intuitive rule, called **sequential consistency** (SC): all threads' memory operations behave as if they were lined up in one queue and executed one at a time, with each thread's own operations kept in the order of its program. Take this two-line program, with x and y both 0 at the start: thread 1 writes x = 1, then reads y; thread 2 writes y = 1, then reads x. Under SC, whichever of the two writes comes first in the queue is already in place when the other thread reads it, so both reads cannot return 0.

On x86, though, both reads returning 0 is allowed, and it really happens. The reason is the **store buffer**: when a core executes a write, it does not wait for the write to reach the cache (which may need a BusRdX). It puts the write in a small queue of its own and carries on; later reads go straight to the cache. So thread 1's read of y takes effect before its own write of x, and thread 2 does the same.

::: diagram dg-sbuf keys=dg.sbuf
cap: How a store buffer (first in, first out: FIFO) breaks SC. Both cores' writes are still queued in their own buffers (①). Both reads have already returned the old 0 from the shared memory system (②). The writes reach memory later (③). A core that reads an address it has written checks its own buffer first, so a single thread never notices this. Schematic, not to scale.
aria: Diagram: each core has a first-in, first-out store buffer between it and its cache; writes enter the buffer while reads go straight to the cache, so both reads see 0
c1: Thread 1
c2: Thread 2
buf: Store buffer (FIFO)
w1: x = 1 ① queued
w2: y = 1 ① queued
mem: Cache and memory (coherent): x = 0, y = 0
r1: ② read y → 0
r2: ② read x → 0
late: ③ written later
:::

A small two-line program like this is called a **litmus test**: it asks only whether a given outcome is allowed. This one is SB (store buffering), and the outcome SC forbids is what the tables below call the non-SC outcome. There are two other common ones. MP (message passing): thread 1 writes data x = 1 and then writes a flag y = 1; thread 2 reads the flag, then reads the data. The question is whether it can see the flag raised while the data is still 0. LB (load buffering): both threads read first and then write; the question is whether both reads can see the 1 that the other thread writes later.

::: diagram dg-litmus keys=dg.litmus
cap: Two litmus tests, with x and y both 0 at the start. “Non-SC” marks the (r1, r2) that sequential consistency forbids. The SC, x86-TSO and weak-model columns are results of the models below, computed by exhaustive search (not copied from a table): whether that outcome is allowed under sequential consistency (SC), under x86-TSO, and under this page's weak model (in the style of Armv8 and RISC-V).
aria: Diagram: the programs of two litmus tests, SB and MP, and whether the non-SC outcome is allowed under sequential consistency, x86-TSO and a weak memory model
t1: Thread 1
t2: Thread 2
odd: Non-SC (r1, r2)
sc: SC
tso: x86-TSO
weak: Weak model
yes: allowed
no: never
:::

::: lab ch8-model
model.title: Litmus tests: run every execution
model.how: Choose a test and whether to add synchronisation. The model runs every possible execution under the three memory models and lists the final (r1, r2) values that can occur. SC is every interleaving that keeps program order. x86-TSO follows the abstract machine in Sewell et al.'s paper: each thread has its own first-in, first-out store buffer; a read checks its own buffer first; writes in the buffer can reach memory at any moment; and a fence waits for the buffer to empty. The weak model is explained below the table.
ctl.test: Test
t.SB: SB
t.MP: MP
t.LB: LB
ctl.sync: Synchronisation
sync.none: None
sync.fence: Fence
sync.lock: Writes with xchg
sync.acqrel: Release / acquire
code.aria: The two threads' programs
tbl.aria: Whether each outcome is allowed under the three models
read.sc: Non-SC outcome under SC
read.tso: Under x86-TSO
read.weak: Under the weak model
weaknote: Weak model (this page's simplification): there is one memory, and once a write takes effect, all cores see it at the same time. A thread may execute a later instruction early, unless the earlier access is to the same address, is a fence, or is an acquire read, or the later one is a fence or a release write; a read after a release write may not move earlier either. Address, data and control dependencies are not modelled. This is close to what Armv8 and RISC-V's RVWMO specify for these tests.
tbl.out: (r1, r2)
tbl.sc: SC
tbl.tso: x86-TSO
tbl.weak: Weak model
tbl.oddmark: non-SC
tbl.no: never
say.allowed: {test} ({sync}): the non-SC outcome ({odd}) under SC: {sc}; under x86-TSO: {tso}; under the weak model: {weak}.
say.forbidden: {test} ({sync}): the non-SC outcome ({odd}) under SC: {sc}; under x86-TSO: {tso}; under the weak model: {weak}. All three models agree this time.
:::

SB with no synchronisation: SC does not allow (0, 0), while x86-TSO and the weak model both allow it. Put a fence (x86's <code>mfence</code>) between each write and read, and none of the three models allows it: the fence makes the core wait for its own store buffer to empty before going on. Replace the writes with <code>xchg</code> (an instruction with LOCK also empties the buffer), and x86-TSO no longer allows it either; but in the weak model a plain atomic instruction gives no ordering, so (0, 0) is still allowed. These x86 results match, one for one, the Intel manual examples listed in the x86-TSO paper (Example 8-1 is MP, 8-2 is LB, 8-3 is SB, and 8-9 is SB with xchg; these are the numbers in the manual's Chapter 8 of the time, and the chapter number has since changed).

A litmus test asks only whether an outcome is allowed, not how often it occurs. An allowed outcome may happen once in a hundred million runs on one chip, or never, but when writing a program you must assume it can happen. {.take}

## x86 and Arm: fences, acquire and release {#ch9}

::: strings
toc: x86 and Arm: fences, acquire and release
:::

x86 allows only one kind of reordering: a later read can run ahead of an earlier write. Arm and RISC-V allow almost everything, and you must ask for order with fences, or with acquire and release. A program with no synchronisation may be correct by luck on x86 and wrong on Arm. {.law}

The x86 rule is called **TSO** (total store order). Each core has a store buffer, and the buffer is first in, first out, so two writes stay in order, two reads stay in order, and a read stays in order with a later write. Only “a write, then a read of a different address” can be reordered. In 2010 Sewell et al., in Communications of the ACM, wrote out the abstract machine that the model above uses. They also pointed out that Intel's and AMD's manuals of the time contradicted each other, and that some of their statements did not match real hardware.

Arm (Armv8-A) and RISC-V (RVWMO) are **weak memory models**. Arm's white paper states plainly that reads and reads, reads and writes, writes and writes, and writes and reads can all be reordered, and so can atomic instructions and ordinary reads and writes. What they guarantee is this: a thread always sees its own accesses in program order, and once a write is seen by one core, it is seen by all cores. To get order, there are three tools. A **fence** (Arm's <code>DMB</code>, RISC-V's <code>fence rw,rw</code>) stops accesses before it and after it from crossing. An **acquire read** (Arm's <code>LDAR</code>): no access after it may run ahead of it. A **release write** (<code>STLR</code>): no access before it may run past it. Acquire and release are one-way gates, which are cheaper than a two-way fence. RISC-V also has an optional extension, Ztso, which lets a RISC-V chip work under TSO, to make it easier to port x86 code.

This answers the third question from the opening. Using the litmus model of Chapter 8 with MP and no synchronisation: (r1, r2) = (1, 0), that is, the flag is seen raised but the data is still 0, does not occur under SC or x86-TSO, and is allowed under the weak model. A program that passes data using a plain variable as a flag works on x86 every time, but on an Arm server or a phone it occasionally reads stale data. Arm's own tutorial measured this on real chips: the same MP test was run about {armRuns} times and showed (1, 0) {armSeen} times.

::: lab ch9-model
model.title: The litmus model, this time only for message passing
model.how: The same model as Chapter 8, fixed to MP. Choose in turn “None”, “Fence” and “Release / acquire”: a release write raises the flag, and an acquire read checks it.
:::

With a fence, or with a release write and an acquire read, MP no longer allows (1, 0) under any of the three models. With LB (both threads read first, then write) and no synchronisation, only the weak model allows (1, 1): x86-TSO never delays a read. This is why, when the same C++ code is compiled for x86, most atomic reads and writes become plain <code>mov</code> instructions, while on Arm they become <code>LDAR</code> / <code>STLR</code> or are wrapped with <code>DMB</code>.

Programmers in high-level languages do not face these directly. C++11 and Java both adopt the rule “**no data race means sequential consistency**” (Chapter 5 of the textbook calls it SC for DRF): as long as every variable that several threads read and write at the same time is protected by an atomic type or a lock, the program behaves as if it were SC, and the compiler inserts whatever fences each CPU needs. C++'s <code>std::atomic</code> defaults to the strongest order, <code>memory_order_seq_cst</code>. A release store (<code>memory_order_release</code>) paired with an acquire load (<code>memory_order_acquire</code>) means that once the load sees the stored value, everything written before the store is visible: this is exactly the MP above. Java's equivalent is the <code>volatile</code> field. Conversely, a C++ program with a data race has undefined behaviour, as the <code>count++</code> in Chapter 5 does. The consistency discussed here covers only shared memory within one machine. How replicas on several machines stay consistent is another question, covered in <a href='../distributed-systems/'>Distributed Systems · How Replicas Behave Like One Value</a>.

The weak model implements only the rules these tests need. Real Arm also has ordering from dependencies (address, data and control dependencies, with ISB). It is also only other-multi-copy atomic: the writing core can read its own write from its store buffer before the other cores see it all at once, which this page's weak model does not distinguish. Tests with three or more threads, such as IRIW, are not included, because they need a fuller model to be computed correctly. {.take}

## Locks: do more waiters make it slower? {#ch10}

::: strings
toc: Locks: do more waiters make it slower?
:::

Each time a lock changes hands, every core waiting for it must reread the line that holds it. How they wait decides how many bus requests one handoff causes. If they queue in order and each watches its own line, the cost of a handoff does not grow with the number of waiters. {.law}

One person is using the toilet, and twenty people queue outside. The worst way to wait is for each person to rattle the door handle every second. Better is to watch the “occupied” sign, and when it flips, everyone rushes in together. Better still is to take a numbered ticket and go in when your number is called. The best is to form a single queue, with each person watching only the back of the person in front, who taps the next person on the shoulder when leaving.

The 1991 paper by Mellor-Crummey and Scott (ACM Transactions on Computer Systems, vol. 9, no. 1) compares exactly these spinlocks. **TAS** (test-and-set): keep grabbing with an atomic exchange; each exchange takes the line to M, even when someone else holds the lock. **TTAS** (test-and-test-and-set): first do an ordinary read to see whether the lock is free. That read hits the S copy in one's own cache and sends no request, and only when the lock looks free does one do the exchange. But when the lock is released, every copy is invalidated at once, everyone rereads at once, and everyone rushes to grab it. **Ticket lock**: an atomic add takes a number, and then one watches which number is now being served. At each call, everyone's copy is still invalidated and reread together, but only one person goes for the lock. **MCS lock**: each waiting core atomically exchanges its own node onto the tail of the queue, and then watches just one flag in its node, which sits in its own cache line. The previous holder writes only that one flag on release. The paper says each acquisition takes a constant number of remote references, whatever the number of waiting processors.

::: diagram dg-mcs keys=dg.mcs
cap: An MCS lock. The lock itself stores only a tail pointer. A newly arrived core uses one atomic exchange to attach itself, then points the previous node's next at itself. Each waiter reads only the locked flag in its own node, which hits in its own cache and sends no request. When the holder finishes, it writes once, to the flag of the next node. Schematic, not to scale.
aria: Diagram: the MCS lock queue; the lock variable points to the tail; each waiter spins on its own node, and the holder on release writes only the next node's flag
lock: Lock: tail
node: Core {c}'s node
hold: holds lock
spin: spins on its flag
next: next
flag: locked = {v}
rel: Release: write one flag
swap: New: swap onto tail
:::

::: lab ch10-model
model.title: Four locks on the simulator from Chapter 3
model.how: Choose the type of lock, and move the slider for the number of waiting cores. Every core always wants the lock. Time advances in rounds; in each round every core makes one memory access, in random order, and all of them run through the MESI simulator from Chapter 3. The core holding the lock works on its own data for {lockH} rounds (a **tuned parameter**) before releasing it. The chart shows the average number of bus requests each time the lock changes hands (log scale on the vertical axis).
model.aria: Line chart: bus requests per handoff for the four locks as the number of cores grows
k.tas: TAS
k.ttas: TTAS
k.ticket: Ticket lock
k.mcs: MCS
ctl.kind: Lock
ctl.n: Cores waiting for the lock
read.per: Bus requests per handoff
read.vs: relative to MCS
read.ho: Handoffs simulated
cv.x: Cores
cv.y: Bus requests per handoff
say.tas: TAS, {n} cores: on average *{per}* bus requests per handoff. While the lock is held, the waiting cores keep swapping on the same line, so the cost grows with both the number of cores and the hold time.
say.ttas: TTAS, {n} cores: on average *{per}* per handoff. Waiting is quiet, but when the lock is released everyone rereads together and rushes to grab it.
say.ticket: Ticket lock, {n} cores: on average *{per}* per handoff. Only one person goes for the lock, but everyone rereads when the number is called.
say.mcs: MCS, {n} cores: on average *{per}* per handoff, regardless of how many are waiting.
:::

With 4 cores, bus requests per handoff are: TAS {tas4}, TTAS {ttas4}, ticket lock {tk4}, MCS {mcs4}. With 16 cores: TAS {tas16}, TTAS {ttas16}, ticket lock {tk16}, MCS {mcs16}. With 64 cores: TAS {tas64}, TTAS {ttas64}, ticket lock {tk64}, and MCS still {mcs64}. TTAS is about three times the core count, the ticket lock is about equal to it, and MCS is constant. TAS grows not only with the number of cores but also with the hold time: at 16 cores, holding for {lockH} rounds gives {tas16} requests, and doubling the hold time gives {tasH2}. MCS is not best everywhere, either: with few cores, its steps of joining the queue, linking and clearing flags add up to more than the ticket lock's.

Everyday programs use the locks (mutexes) that the language and the operating system provide. These put a waiting thread to sleep when the wait is long, instead of spinning, but the cost of the lock's line moving between cores is the same. The more basic answer is still the one from Chapter 7: do not let many cores fight over the same thing.

In the simulator each core makes one access per round, and each access completes in full. On a real machine a read hit is over a hundred times faster than a bus request, and the rhythm of lock contention is not regular. The hold time is a tuned parameter: it affects only TAS (in proportion), and has almost no effect on the other three. {.take}

## Where the frontier is (November 2026) {#ch11}

::: strings
toc: Where the frontier is (November 2026)
:::

A server CPU now has two or three hundred cores sharing one coherent memory, and two sockets make five or six hundred. Hardware holds this up with layers of clusters, snoop filters and directories. On the software side, the rules for atomic operations and memory models are settled; the hard part is keeping shared writes to a minimum. {.law}

What follows falls into three groups: principles that are established, things that have been built (and by whom, and when), and vendor claims.

### Established {#h.est .sub3}

- The two rules of coherence (single-writer–multiple-reader and the data-value invariant), and the two broad families of protocols, snooping and directory, are in the 2nd edition of Sorin, Hill, Wood and Nagarajan's textbook (2020, free to download). {#e1}
- The x86 memory model is TSO, which has a rigorous mathematical definition (Sewell et al., 2010). Armv8-A and RISC-V's RVWMO are weak models, and both have official formal definitions. C++ and Java's “no data race means sequential consistency” rests on these. {#e2}
- On cache-coherent machines, a spinlock can take a constant number of remote references per acquisition (MCS, 1991). {#e3}

### Built {#h.demo .sub3}

- AMD EPYC 9965, with {e9965} Zen 5c cores, released 10 October 2024 (AMD press release). {#d1}
- AMD's 6th-generation EPYC “Venice”: up to {vCores} Zen 6c cores in one chip (EPYC 9996), on {vCcd} compute chiplets with {vCcdC} cores each, and {vL3} MB of L3 in all; announced 22 July 2026, with SP7 parts generally available from 10 November 2026 (hwbusters; StorageReview, 10 November 2026). Reports disagree on how the cores of a 32-core chiplet are grouped to share L3, so the page does not say. {#d2}
- Intel Xeon 6+ “Clearwater Forest”: one chip with {x6Cores} E-cores and {x6L3} MB of L3, supporting {x6S} sockets, which makes {x6Dom} cores in one coherence domain (The Register, 1 June 2026). {#d3}
- Measured handoffs between cores: {bIntraLo}–{bIntraHi} ns within a cluster, {bCrossLo}–{bCrossHi} ns across clusters, and about {bSock} ns across sockets (Chips and Cheese, AMD Bergamo, 22 June 2024). The more clusters there are, the more likely a line move takes a long route. {#d4}
- Apple's M-series chips can switch a thread into TSO mode, so that x86 programs translated by Rosetta 2 run under x86's rules. On 11 April 2024, Hector Martin of the Asahi project submitted a patch to the Linux kernel that exposes this switch to programs, so that x86 emulators such as FEX-Emu can use it too. {#d5}
- Research: Tardis (Yu and Devadas, PACT 2015) uses timestamps in place of the list of sharers. Each line needs only O(log N) bits, there is no broadcast, and in a simulation of {tdCores} cores its performance is close to a directory protocol's. It is still at the paper and simulation stage. {#d6}

### Claims {#h.claim .sub3}

- AMD says Venice is more than {vClaim}% faster than the previous generation; Intel says the single-thread performance of Xeon 6+ is about {x6Claim}% higher than that of the {e9965}-core EPYC 9965. Both are vendor figures given at launch events, not independently tested. {#c1}

Links between chips that keep memory coherent (CXL, NVLink and similar, which let CPUs and accelerators, or even several machines, share coherent memory) are covered in <a href='../coherent-interconnects/'>How Chips Share Memory</a>. How out-of-order execution works together with store buffers and the memory model is covered in <a href='../how-a-cpu-guesses-ahead/#ch8'>Chapter 8 of How a CPU Guesses Ahead</a>.

Core counts and release dates go out of date. The figures on this page are collected in FRONTIER in models.js, with dates, so that they can be updated. {.take}

## Wrap-up: three questions before writing shared data {#ch12}

::: strings
toc: Wrap-up: three questions before writing shared data
:::

Coherence is supplied by the hardware; correctness and speed you must earn yourself. {.law}

{.plain .qs}
1. **Will several threads write this data?** Shared data that is only read costs almost nothing (“Everyone only reads” in Chapter 3). Data that is written should, where possible, be given to each thread to write its own copy, merged at the end. Align each copy to 64 bytes so it does not share a line with someone else (false sharing, see <a href='../how-cpu-caches-work/#ch9'>Chapter 9 of “How a CPU's Three Levels of Cache Work”</a>). A counter that every thread adds to is capped by how many line moves per second the machine can make (Chapter 7). {#q1}
2. **What order do I need?** If one thread writes a variable and another reads it, use atomic types or locks, not plain variables, and not C/C++ <code>volatile</code>. Pass a message with a release store paired with an acquire load; when unsure, use the default seq_cst. A program that works on x86 proves nothing on its own: run it on Arm too (Chapters 8 and 9). {#q2}
3. **How many people will wait for the lock?** Few: use the simplest lock. Many: switch to a queued lock, or split the data so that people contend for different locks (Chapter 10). If one atomic add can do the job, do not write a CAS loop (Chapter 6). {#q3}

Eight cores see “the same memory” because every line in every cache carries a state, and others are invalidated before a write (*coherence*). Two threads that each add a million times end with less than two million because “read, add, write” can be interrupted, which has nothing to do with coherence (*data race*, repaired with *atomic instructions*). A program that is correct on one CPU can fail on another because each core's writes pass through a store buffer, and a weak memory model allows more reordering; different CPUs allow different reorderings (*memory consistency model*, with the order restored by *fences, acquire and release*). {#sum .sum tag=div}

Related essays: <a href='../how-cpu-caches-work/'>How a CPU's Three Levels of Cache Work</a> (cache lines, write-back, false sharing); <a href='../how-a-computer-is-wired/'>How the Parts of a Computer Are Wired Together</a> (NUMA, rings and meshes); <a href='../why-compute-waits-for-memory/#ch5'>Chapter 5 of Why Compute Waits for Memory</a> (why cores cannot be piled on without limit, and the bottleneck of a shared bus). <a href='../how-a-cpu-guesses-ahead/'>How a CPU Guesses Ahead</a> covers out-of-order execution; <a href='../coherent-interconnects/'>How Chips Share Memory</a> covers the links between chips that keep memory coherent, such as CXL and NVLink; why a GPU does not keep the L1 caches of its SMs coherent is in <a href='../how-a-gpu-computes/#ch10'>Chapter 10 of How a GPU Computes</a>. {#links style="margin-top:2em"}

::: footer wrap=none
How Cores Share Memory · a long essay you can play with. Models: snooping MSI / MESI / MOESI (Papamarcos and Patel, 1984; Sorin, Hill, Wood and Nagarajan, A Primer on Memory Consistency and Cache Coherence, 2nd edition, chapters 2, 7 and 8), directory storage and message counts (same book, chapter 8), exact counts of all interleavings, random scheduling for CAS and atomic add, core-to-core handoff times from Chips and Cheese measurements, the x86-TSO abstract machine (Sewell, Sarkar, Owens, Zappa Nardelli and Myreen, CACM 2010), a weak model in the style of Armv8 and RVWMO (Arm white paper Synchronization Overview and Case Study on Arm Architecture, v1.2, 2022; RISC-V unprivileged specification, RVWMO chapter), and four spinlocks (Mellor-Crummey and Scott, ACM TOCS 1991). Sources, dates, and anything not verified are listed in this directory's BRIEF.md.
:::
