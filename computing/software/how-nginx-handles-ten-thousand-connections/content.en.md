---
lang: en
title: How Nginx Handles Ten Thousand Connections · A Hands-on Essay
desc: A dozen lines of nginx.conf launch a web server, and moments later ten thousand browsers hold open keep-alive sockets against it. Following Nginx 1.28.0 stable internals and algorithms, this essay walks through the C10K memory cliff, Master-Worker zero-downtime hot reloads, the epoll event loop, the 11-phase HTTP state machine and location precedence, ngx_pool_t bump allocation, Smooth Weighted Round-Robin (SWRR), limit_req leaky-bucket pacing, red-black timer trees, sendfile zero-copy vs proxy_buffering, and November 2026 frontiers in HTTP/3 QUIC, io_uring, and Pingora / Envoy. Nine interactive models and nine schematic diagrams run the same underlying rules directly in the page.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
:::

# How Nginx Handles Ten Thousand Connections {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

A dozen lines of `nginx.conf`, and you type `nginx` to launch.<br>Facing ten thousand concurrent connections, why does a thread-per-connection server collapse while a handful of single-threaded Nginx workers stay calm? {.sub}

A modern web server often holds tens of thousands of open HTTP Keep-Alive sockets at once, most of them idle during any given millisecond while waiting for the next request. If you handle that concurrency by spawning one operating-system thread per incoming TCP socket, passing ten thousand concurrent clients (the classic C10K problem) overwhelms virtual stack reservations, CPU context-switching, and accept locks long before your network card runs out of bandwidth. This essay asks one question: **once a minimal `nginx.conf` starts up, how do a few mostly lock-free single-threaded worker processes watch ten thousand sockets at once, pick exact routes, smooth upstream bursts, enforce millisecond rate limits, and reload config with zero dropped connections?** {.lead}

The data structures, constants, and core algorithms here follow **Nginx 1.28.0 stable** (released April 23, 2025) across `src/core/`, `src/event/`, and `src/http/`, with Chapter 10 tracking newer stable and mainline tracks through November 2026. Because no native `nginx` binary is installed on this build host, every interactive model rewrites the exact C rules in client-side JavaScript and is checked by `tools/crosscheck.cjs` against closed-form scaling laws, invariant identities, and spec edge cases (recorded in `BRIEF.md`). For prerequisites, see [[how-the-os-talks-to-hardware]] (syscalls and `epoll`), [[how-virtual-memory-works]] (virtual address spaces and copy-on-write `fork()`), [[how-a-nic-moves-packets]] (multi-queue NICs and DMA), and [[tcp-congestion]] (TCP handshakes and bandwidth-delay). Each chapter ends by stating what the model leaves out. {.note}

## The C10K cliff: why one thread per connection collapses {#ch1}

::: strings
toc: The C10K cliff: stack & context switches
:::

At ten thousand concurrent clients, the first wall you hit is not wire bandwidth—it is the memory bill and scheduler thrashing of binding an OS thread to every socket. Nginx flips the design: one single-threaded worker process per CPU core, reducing each idle socket to a few hundred bytes in a flat array. {.law}

Here is a minimal working `nginx.conf`. The top directives launch 4 worker processes holding up to 4,096 connections each, listening on port 80. Starting `nginx` boots the workers; editing a route later takes one `nginx -s reload`.

::: html ch1-code
code.aria: Minimal nginx.conf and hot reload command
code: "worker_processes 4;\nevents {\n    worker_connections 4096;\n}\nhttp {\n    server {\n        listen 80 reuseport;\n        location = / { return 200 \"ok\"; }\n        location /static/ { root /var/www; }\n    }\n}\n# Hot reload config: nginx -s reload"
:::

Serving 10,000 Keep-Alive clients with one POSIX thread per connection hits Linux's default `{=ch1.stackMiB} MiB` virtual thread stack limit—reserving `{=ch1.virtGiB} GiB` of virtual address space just for stacks (counting roughly 128 KiB of touched stack pages, kernel `task_struct`, and thread-local heap per thread, even 5% active traffic consumes around `{=ch1.threadRss} MiB` of resident RAM). Worse still is scheduling: as those 500 active threads repeatedly block and wake on socket reads and writes across 4 CPU cores, millions of context switches per second flush L1 instruction/data caches and TLBs; at 3.5 microseconds per switch, scheduler overhead alone burns `{=ch1.ctxPct}%` of available core time.

Nginx breaks the link between connection count and thread count. Inside `ngx_event_process_init`, each worker preallocates three contiguous arrays sized to `worker_connections`: `ngx_connection_t` (~`{=ch1.connB}` bytes on 64-bit Linux), a read `ngx_event_t` (`{=ch1.evtB}` bytes), and a write `ngx_event_t` (`{=ch1.evtB}` bytes). An idle socket needs zero threads and only `{=ch1.slotB}` bytes; only the 500 actively executing requests borrow a 4 KiB request pool, totaling `{=ch1.nginxMiB} MiB`—roughly `{=ch1.ramRatio}` times less resident memory, with virtually zero cross-thread core migration.

::: diagram dg-c10k keys=dg.c10k
cap: Figure 1. Thread-per-connection vs Nginx single-threaded workers at 10,000 connections (64-bit Linux struct sizes).
aria: Diagram: top red block for thread-per-connection showing 8 MiB stacks and L1 thrashing; bottom cyan block for 4 Nginx workers holding 440-byte connection slots
t1: Thread-per-Connection (10k threads)
t1a: 8 MiB virt stack x 10k = 78.13 GiB
t1b: Kernel scheduling + L1/TLB thrashing
n1: Nginx 4 Event-Loop Workers
n1a: 440 B conn+event slot x 10k = 4.20 MiB
n1b: 4 KiB pool only on active requests
:::

::: lab ch1-model
model.title: C10K memory and context-switch ledger
model.how: Drag concurrent connections and the active request fraction, or change the thread virtual stack size, to watch thread memory and scheduling overhead diverge from Nginx.
ctl.conns: Concurrent connections N
ctl.active: Active request share
ctl.stack: Thread virtual stack
cv.aria: Resident memory curves from 0 to 20,000 connections for thread-per-connection (red) vs Nginx slots and active pools (cyan)
cv.x: Concurrent connections N
cv.y: Resident RAM (MiB)
leg.thread: Thread-per-connection RSS
leg.nginx: Nginx slots + active pools
read.virt: Thread virtual stacks
read.trss: Thread model RSS
read.nrss: Nginx slots & pools
read.ctx: Thread switch CPU share
say.light: At {n} connections with {act} active requests, load stays mild: thread virtual stacks reserve {virt} ({trss} RSS) and switching takes {ctx}, while Nginx needs just {nrss}.
say.cliff: Pushing to {n} connections exposes the cliff: thread stacks reserve {virt} and context switches eat {ctx} CPU, whereas Nginx uses {nrss} (a <em>{ratio}×</em> memory gap).
say.collapse: <em>C10K collapse zone</em>: {act} active requests among {n} sockets trigger constant wakeups, burning <em>{ctx}</em> of core capacity on thread switches; Nginx holds the lot in {nrss} without thread churn.
:::

To see why `{=ch1.virtGiB} GiB` of virtual stack reservations does not crash a 16 GiB host until threads actually touch stack pages, read [[how-virtual-memory-works#ch1|How Virtual Memory Works, Chapters 1 and 7]].

The model leaves out: each worker's fixed binary and shared-library footprint (a few MiB), TLS session state memory, and hybrid user-space coroutine or thread-pool designs that lower stack sizes while still paying user-level context-switch costs. Switching cost is a parameterized 4-core estimate (3.5 µs per switch) intended to show scaling order. {.take}

## Master and Worker: how zero-downtime hot reload hands off sockets {#ch2}

::: strings
toc: Master–Worker & hot reload
:::

Nginx splits control from data: the Master validates config, holds the listening sockets, and routes signals, never touching a client byte; on reload, old and new worker generations share the same listening file descriptor to hand over traffic with zero dropped handshakes. {.law}

Changing a routing rule in production without severing an ongoing download rests on the Master–Worker split. On startup, the privileged Master binds `:80` and `:443` (say file descriptor `fd=6`) and calls `fork()` to spawn workers, which inherit the open kernel socket entry directly.

When you run `nginx -s reload` (sending `SIGHUP` to the Master), five steps run in order: the Master syntax-checks the new config, opens fresh log descriptors, `fork()`s a **new worker generation (v2)** that immediately inherits `fd=6` and starts calling `accept()` on new TCP handshakes, and finally sends `NGX_CMD_QUIT` to the **old workers (v1)**. Each old worker unregisters `fd=6` from its event loop—refusing new handshakes—yet keeps serving every in-flight response until its last socket closes, exiting cleanly one by one. Full binary upgrades extend the same inheritance trick using `USR2` (launch new Master), `WINCH` (drain old workers), and `QUIT`.

::: diagram dg-reload keys=dg.reload
cap: Figure 2. Seamless SIGHUP handoff of listening socket FD=6 between draining v1 workers and newly forked v2 workers.
aria: Diagram: top gold Master holding FD=6 sends QUIT to dashed red v1 workers to drain existing traffic while forking green v2 workers inheriting FD=6 for new handshakes
m1: Master Process (config & signals)
m2: Holds listening FD=6 · handles SIGHUP
o1: Old Worker v1
o2: Stop accept()
o3: Drain active
n1: New Worker v2
n2: Inherit FD=6
n3: Take new SYNs
foot: Zero-millisecond gap · 0 connections reset
:::

::: lab ch2-model
model.title: nginx -s reload handoff timeline
model.how: Scrub time t from signal trigger through drain completion and adjust the longest in-flight tail, or switch to a hard restart to count severed sockets.
ctl.time: Current time t
ctl.tail: Longest in-flight tail
ctl.mode: Reload strategy
mode.graceful: Graceful reload (SIGHUP)
mode.hard: Hard restart (stop + start)
cv.aria: Swimlane timeline of 4 old v1 workers draining and exiting while 4 new v2 workers accept traffic immediately
cv.x: Time t (ms)
leg.old: v1 worker alive
leg.new: v2 worker serving
leg.drop: Downtime gap / RSTs
read.old: Draining v1 workers
read.new: Active v2 workers
read.inflight: v1 in-flight remaining
read.drop: Connections dropped
say.pre: t = {t} ms (before reload): all 4 v1 workers handle incoming traffic normally; v2 has not started yet.
say.draining: t = {t} ms (draining handoff): all {newW} v2 workers inherited the listening socket and accept every new connection, while {oldW} v1 workers finish the remaining {inf} responses with <em>0 connections dropped</em>.
say.done: t = {t} ms (handoff complete): all old workers have exited cleanly and {newW} v2 workers run the new config—<em>0</em> connections severed end to end.
say.hard: <em>Hard restart drops traffic</em> (t = {t} ms): killing workers severs 20 active connections immediately and rejects new handshakes during the listener gap, losing <em>{drop}</em> connections.
:::

At the default snapshot (`t = 1,200 ms` with a `1,200 ms` tail), the 2 faster v1 workers have already exited leaving `{=ch2.oldAlive}` draining, while all `{=ch2.newAlive}` v2 workers have been accepting new traffic since `500 ms`; a hard restart has already dropped `{=ch2.hardDrop}` connections. How `fork()` spins up v2 workers instantly without copying process RAM upfront is covered in [[how-virtual-memory-works#ch9|How Virtual Memory Works, Chapter 9 (Copy-on-Write)]].

The model leaves out: forced `worker_shutdown_timeout` cutoffs, environment variable `NGINX` FD passing during `USR2` binary upgrades, and arbitrary long-lived WebSocket or streaming tails that keep a draining worker alive for minutes. {.take}

## Non-blocking event loop: how `epoll` and `SO_REUSEPORT` watch 10,000 sockets in O(active) {#ch3}

::: strings
toc: epoll event loop & thundering herd
:::

Out of ten thousand open connections, often only a few dozen send or receive bytes during any single millisecond. `select` and `poll` rescan all ten thousand slots every tick, whereas `epoll_wait` hands back only the short linked list of ready descriptors. {.law}

With every socket marked non-blocking (`O_NONBLOCK`), each Nginx worker's `ngx_process_events_and_timers` loop is tiny: compute the nearest timer deadline, sleep inside `epoll_wait` (or `kqueue` on BSD/macOS), and wake when NIC interrupts deliver data and push ready `epitem` structs onto the kernel's `rdllist`. The worker processes only those `k` active events and loops straight back.

At 10,000 Keep-Alive sockets with 40 active per millisecond, `select`/`poll` must copy a 10,000-bit `fd_set` bitmap across the user/kernel boundary and scan every slot `O(N)`, taking roughly `{=ch3.selectUs}` µs in the parameterized model; `epoll` pops only the 40 ready nodes `O(k)` in `{=ch3.epollUs}` µs—inspecting `{=ch3.scanRatio}` times fewer descriptors.

Sharing one listening socket across multiple workers introduces a second snag: the **thundering herd**. Older kernels woke every sleeping worker on a single incoming SYN, letting one succeed in `accept()` while three wasted a wakeup. Nginx originally arbitrated access with `accept_mutex`; since version 1.11.3, modern Linux kernels provide single-wakeup `EPOLLEXCLUSIVE` (`NGX_EXCLUSIVE_EVENT`), allowing `accept_mutex` to default to `off`. Adding `listen 80 reuseport;` goes one step further: the kernel allocates a separate listening socket and accept queue per worker and hashes incoming 4-tuples straight to one core, eliminating shared accept-queue lock contention altogether.

::: diagram dg-epoll keys=dg.epoll
cap: Figure 3. select/poll scanning all O(N) slots every tick vs epoll returning O(active) ready descriptors and SO_REUSEPORT per-worker queues.
aria: Diagram: top red box select/poll scanning 10,000 bits per tick; middle cyan box epoll/kqueue pushing 40 ready descriptors into rdllist; bottom gold box SO_REUSEPORT per-worker accept queues
s1: select / poll: O(N) full scan per tick
s2: Copies 10,000-bit fd_set every iteration
e1: epoll / kqueue: O(active) ready list
e2: Register once; kernel appends ready rdllist
e3: 10,000 sockets -> only 40 ready popped
r1: SO_REUSEPORT (listen ... reuseport)
r2: Dedicated queue per worker · zero queue lock
:::

::: lab ch3-model
model.title: select O(N) vs epoll O(k) & accept dispatch lab
model.how: Vary total sockets N and active events k per tick, then switch between shared, exclusive/mutex, and SO_REUSEPORT dispatch across 4 workers.
ctl.conns: Total open sockets N
ctl.active: Active sockets k per tick
ctl.dispatch: Multi-worker accept dispatch
disp.shared: Shared queue (no mutex)
disp.mutex: accept_mutex / EPOLLEXCLUSIVE
disp.reuseport: SO_REUSEPORT
cv.aria: Latency scaling curves vs total connections N showing select/poll (red linear climb) against epoll/kqueue (cyan flat line)
cv.x: Total open sockets N
cv.y: Estimated check time per tick (µs)
leg.select: select / poll O(N)
leg.epoll: epoll / kqueue O(k)
read.sel: select estimated time
read.ep: epoll estimated time
read.ratio: Descriptor scan ratio
read.wake: Wakeups per SYN / Queues
say.shared: Shared queue without exclusion: with {k} active out of {n} sockets, epoll cuts scan cost from {sel} to {ep} ({ratio}× fewer checks), yet each SYN wakes all <em>{wake} workers</em> to fight over one lock.
say.mutex: accept_mutex or EPOLLEXCLUSIVE: epoll handles {k} active events ({ep} vs {sel}) and wakes only <em>1 worker</em> per SYN, ending the herd while still sharing 1 kernel queue.
say.reuseport: <em>SO_REUSEPORT</em>: epoll scans {k} active events ({ep}) while 4 independent kernel listen queues hash incoming SYNs straight to 1 target worker with zero accept-queue lock contention.
:::

For how kernel interrupts feed `epoll`'s ready list and how NIC Receive Side Scaling (RSS) spreads packets across cores, see [[how-the-os-talks-to-hardware#ch11|How the OS Talks to Hardware, Chapter 11]] and [[how-a-nic-moves-packets#ch5|How a Network Card Moves Packets, Chapter 5]].

The model leaves out: edge-triggered `EPOLLET` looping until `EAGAIN` (which Nginx uses by default on `epoll`), hardware interrupt coalescing delays, and temporary socket-hash imbalance when reloading under `SO_REUSEPORT` (addressed in Chapter 10). {.take}

## The 11-phase HTTP state machine and `location` precedence {#ch4}

::: strings
toc: 11-phase HTTP pipeline & location routing
:::

Nginx does not execute `nginx.conf` top-to-bottom like a shell script. Every request marches through `{=ch4.phases}` fixed `ngx_http_phases`, and in `FIND_CONFIG` a `location` block's rank comes from hard modifier rules rather than file order. {.law}

In `src/http/ngx_http_core_module.h`, HTTP execution is fixed across `{=ch4.phases}` stages: `POST_READ`, `SERVER_REWRITE`, `FIND_CONFIG` (picking the `location`), `REWRITE`, `POST_REWRITE` (looping back to `FIND_CONFIG` if a rewrite mutated the URI), `PREACCESS` (where `limit_req` and `limit_conn` execute), `ACCESS` (`allow`/`deny` and auth), `POST_ACCESS`, `PRECONTENT` (`try_files`), `CONTENT` (serving files or `proxy_pass`), and `LOG`. Even if you write `allow 10.0.0.1;` above `limit_req` in your config file, rate limiting still runs before access control because `PREACCESS` always precedes `ACCESS`.

Inside `FIND_CONFIG` (`ngx_http_core_find_location`), Nginx compiles static prefixes into a balanced binary search tree at startup and resolves routes in four strict steps:

1. **Exact match (`=`)**: Checked first. If `location = /` matches the URI verbatim, Nginx locks it immediately and halts. {#s1}
2. **Longest static prefix check (`^~` vs plain)**: Searches the prefix tree for the **longest matching prefix**. If that single longest winning prefix carries `^~` (`noregexp`), Nginx locks it and **skips all regular expressions**; otherwise it saves that prefix as a fallback candidate. {#s2}
3. **Regular expressions in config order (`~` case-sensitive, `~*` case-insensitive)**: Evaluated top-to-bottom as written; the **first** match wins immediately. {#s3}
4. **Longest-prefix fallback**: If every regex misses, Nginx falls back to the saved longest prefix from Step 2. {#s4}

Here is the classic production trap in Step 2: suppose you configure `location ^~ /static/` (length 8) alongside `location /static/images/` (length 15, missing `^~`). When `/static/images/pic.jpg` arrives, the prefix tree picks `/static/images/` because 15 > 8; since that longest winner lacks `^~`, Nginx still proceeds to evaluate regexes—letting `~ \.(png|jpg|js)$` hijack the route!

::: diagram dg-phases keys=dg.phases
cap: Figure 4. The 11 ngx_http_phases and the rewrite loop returning to FIND_CONFIG.
aria: Diagram: top-to-bottom six phase groups from 0 POST_READ to 10 LOG, showing location precedence in phase 2 and the violet rewrite loop back from 3-4 to 2
p1: 0 POST_READ · 1 SERVER_REWRITE
p1s: Headers parsed · server-level rewrite
p2: 2 FIND_CONFIG (location match)
p2s: = exact > ^~ prefix halt > ~/~* > prefix
p3: 3 REWRITE · 4 POST_REWRITE
p3s: URI rewrite loops back to phase 2
p4: 5 PREACCESS · 6 ACCESS · 7 POST
p4s: limit_req runs before allow/deny
p5: 8 PRECONTENT · 9 CONTENT
p5s: try_files & static / proxy_pass
p6: 10 LOG
p6s: Access log write & pool destroy
:::

::: lab ch4-model
model.title: location precedence evaluator (ngx_http_core_find_location)
model.how: Click different request URIs and toggle <code>^~ /static/</code> or regex order to trace which rule wins and which stages get skipped.
ctl.uri: Request URI
ctl.hat: Enable ^~ on /static/ (halt regex)
ctl.order: Regex config order
ord.cs: ~ (case-sensitive) first
ord.ci: ~* (case-insensitive) first
cv.aria: Evaluation board of six location blocks highlighting winning, candidate, skipped, and missed rules
read.winner: Winning location
read.kind: Resolution path
read.checked: Rules evaluated
kindExact: Exact match (=)
kindHalt: Prefix ^~ regex halt
kindRegex: First regex match
kindFallback: Longest prefix fallback
st.win: WINNER
st.cand: CANDIDATE
st.skip: SKIPPED
st.miss: MISS
say.exact: Request <code>{uri}</code> matched exact rule <em>{win}</em> in Step 1 after checking only {checked} rule; all prefixes and regexes were skipped.
say.prefix_halt: Request <code>{uri}</code> matched longest prefix <em>{win}</em> in Step 2; its <code>^~</code> flag halted evaluation and skipped all regexes.
say.regex: The longest prefix for <code>{uri}</code> lacked <code>^~</code>, so Step 3 scanned regexes in config order and picked the first match, <em>{win}</em>.
say.prefix_fallback: Exact and regex checks all missed <code>{uri}</code>, so Step 4 fell back to the longest prefix <em>{win}</em> saved in Step 2.
:::

Try picking `/static/logo.png` with `^~ /static/` enabled (it halts regexes and stays in `/static/`), then switch to `/static/images/pic.jpg`: even with `^~ /static/` still checked, `/static/images/` wins the longest-prefix tree and hands control straight to the regex!

The model leaves out: automatic trailing-slash 301 redirects (`NGX_DONE`), internal jumps to named `@location` blocks, and the 10-hop internal redirect guard (`limit_internal_redirects`). {.take}

## Per-request memory pools and buffer chains {#ch5}

::: strings
toc: ngx_pool_t & buffer chains
:::

To keep small header allocations from shattering the heap through thousands of `malloc()` and `free()` calls per second, Nginx hands each request a contiguous `ngx_pool_t` arena, bump-allocating objects with pointer addition and reclaiming everything at once when the request ends. {.law}

Parsing one HTTP request touches dozens of tiny strings—URI slices, header names, cookies, upstream buffers. Calling general-purpose `malloc()` and `free()` for each piece pays allocator lock/cache overhead and slowly fragments memory over weeks of uptime.

In `src/core/ngx_palloc.h`, Nginx cuts allocation down to moving one pointer. A newly created pool reserves `{=ch5.hdrB}` bytes at the front for its `ngx_pool_t` header (`NGX_DEFAULT_POOL_SIZE` is `{=ch5.defPool} KiB`, while individual HTTP requests typically allocate 4 KiB blocks), placing `d.last` at the start of free bytes and `d.end` at the block boundary. Small allocations cap at `pool->max` (`4096 - 80 = {=ch5.maxSmall}` bytes in a 4 KiB pool, and never above `NGX_MAX_ALLOC_FROM_POOL = 4095` bytes on 4 KiB pages). Every request under that cap aligns `d.last` to 16 bytes and advances it in `O(1)` time with zero syscalls.

When the current block fills up, `ngx_palloc_block` appends another block via `d.next` (carrying a slim 32-byte `ngx_pool_data_t` header); after an earlier block fails 4 allocations in a row, `pool->current` advances past it so future allocations skip full blocks. Anything larger than `pool->max` falls straight through to `malloc()` on the `pool->large` list. When the request finishes in `LOG`, one `ngx_destroy_pool()` runs cleanup callbacks and frees every block and large node together—at default settings (`12 × 512 B`), `{=ch5.blocks}` blocks take only `{=ch5.frees}` free operations instead of 12. Meanwhile, outgoing bodies are chained via `ngx_chain_t` nodes pointing to scatter-gather `ngx_buf_t` slices in memory or file descriptors, avoiding monolithic response copies.

::: diagram dg-pool keys=dg.pool
cap: Figure 5. ngx_pool_t layout: 80 B header, 16-byte-aligned bump pointer d.last, overflow d.next blocks, and oversized mallocs on pool->large.
aria: Diagram: top 4 KiB block with 80 B violet header, gold bumped allocations and free tail; arrow d.next to 32 B-headed block 1; red arrow pool->large to oversized malloc box
b0: ngx_pool_t Block 0 (4 KiB)
used: d.last bump pointer
free: free tail
used2: block 1 slots
lg1: size > maxSmall (4,016 B)
lg2: direct malloc() attached to pool->large
end: ngx_destroy_pool() frees all blocks at end
:::

::: lab ch5-model
model.title: ngx_pool_t bump-pointer allocator
model.how: Vary allocation size and count, plus block size, to see bump allocations pack cleanly, spill into d.next blocks, and fall back to pool->large mallocs beyond pool->max.
ctl.size: Allocation size
ctl.count: Allocations per request
ctl.pool: Pool block size
cv.aria: Byte-map visualization of pool blocks showing header, aligned bump slots, free tail, and large fallback mallocs
leg.hdr: Pool header (80 B / 32 B)
leg.small: Aligned bump slots
leg.large: pool->large malloc()
read.blocks: Pool blocks used
read.large: Large malloc count
read.waste: Alignment & tail waste
read.frees: Frees on destroy vs items
cv.blk: Block {i}: {used} / {cap} B ({items} items)
cv.more: + {n} more {ps} blocks…
say.small_one: All {n} allocations of {sz} B fit inside <em>1 single {ps} pool block</em> (cap {max} B); request end triggers 1 <code>ngx_destroy_pool</code> call.
say.small_multi: One block filled up across {n} × {sz} B, so <code>ngx_palloc_block</code> chained <em>{blk} blocks of {ps}</em> via <code>d.next</code>—still only <em>{frees}</em> free calls at cleanup.
say.large: <em>Large-block fallback</em>: {sz} B exceeds <code>pool->max</code> ({max} B), forcing all {n} allocations onto <code>pool->large</code> via direct <code>malloc()</code> and {frees} individual frees on destroy.
:::

The model leaves out: Nginx buffer recycling across Keep-Alive requests, the shared-memory slab allocator (`ngx_slab_pool_t`) used by `limit_req` in Chapter 7, and statistical tail waste distributions under mixed header lengths. {.take}

## Smooth Weighted Round-Robin: why `{5, 1, 1}` never hammers A five times in a row {#ch6}

::: strings
toc: Smooth Weighted Round-Robin (SWRR)
:::

Naive weighted round-robin bursts a weight-5 backend five times in a row before moving on; `ngx_http_upstream_get_peer` adds `effective_weight` every turn and subtracts total weight from the winner, interleaving `{5, 1, 1}` into `{=ch6.seq}`. {.law}

Suppose three upstreams carry weights `A = 5`, `B = 1`, `C = 1` (sum = 7). Expanding them sequentially as `[A, A, A, A, A, B, C]` achieves the right 5:1:1 average, yet blasts A with `{=ch6.naiveMax}` consecutive requests at the start of every cycle while B and C sit idle and then get hit back-to-back.

In `src/http/ngx_http_upstream_round_robin.c`, Nginx keeps a dynamic `current_weight` (starting at 0) and a recovery `effective_weight` (normally equal to static `weight`) on each peer. On every incoming request:

1. Add `effective_weight` to every peer's `current_weight`, summing the active `total`; {#s1}
2. Pick the peer with the **highest** `current_weight`; {#s2}
3. Subtract `total` from the **winner's** `current_weight`. {#s3}

That single subtraction enforces an exact zero-sum invariant: **the sum of all peers' `current_weight` values equals 0 after every step**, guaranteeing that after one 7-request period the vector returns identically to `[0, 0, 0]`. For `{5, 1, 1}`, Nginx emits `{=ch6.seq}`, dropping A's maximum consecutive burst from `{=ch6.naiveMax}` down to `{=ch6.swrrMax}`. And if A suffers a transient error, Nginx lowers `effective_weight` and ramps it back by +1 per round (`if (effective_weight &lt; weight) effective_weight++`) so a newly recovered node is never slammed with full weight on its very first millisecond back.

::: diagram dg-swrr keys=dg.swrr
cap: Figure 6. Full 7-step SWRR sequence for {A:5, B:1, C:1} and the zero-sum current_weight invariant.
aria: Diagram: seven colored blocks A, A, B, A, C, A, A across the top, with step formulas and zero-sum current_weight invariant below
head: 7-step period for {A:5, B:1, C:1} (total = 7)
r1: cw += eff; pick max; winner cw -= 7
r2: Max consecutive hits on A drop from 5 to 2
inv1: Invariant: sum(current_weight) ≡ 0
inv2: Step 7 ends cleanly back at [0, 0, 0]
:::

::: lab ch6-model
model.title: Smooth Weighted Round-Robin (ngx_http_upstream_get_peer)
model.how: Adjust weights for A, B, and C, toggle between Nginx SWRR and naive bursty WRR, or trigger 1 transient failure on A to watch slow <code>effective_weight</code> recovery.
ctl.wa: Backend A weight
ctl.wb: Backend B weight
ctl.wc: Backend C weight
ctl.algo: Scheduling algorithm
algo.swrr: Nginx SWRR (smooth)
algo.naive: Naive WRR (bursty)
ctl.fail: Simulate 1 failure on A (slow recovery)
cv.aria: Top strip shows dispatched backends; bottom chart plots current_weight sawtooth trajectories across the period
cv.seq: Dispatch sequence
cv.x: Request index
cv.y: current_weight
leg.a: Backend A
leg.b: Backend B
leg.c: Backend C
read.seq: Sequence preview
read.streak: Max streak on A
read.period: Cycle length
read.sum: Zero-sum check
say.smooth: Weights ({wa}, {wb}, {wc}) form a period of {per}: Nginx SWRR outputs <code>{seq}</code>, capping A's max streak at <em>{streak}</em> (vs {naiveStreak} naive) while keeping sum(cw) = 0 every step.
say.naive: <em>Naive WRR burst</em>: across {per} requests, dispatches <em>{streak} consecutive requests</em> to A before ever touching B or C, hammering the primary backend in bursts.
say.recover: <em>Fault recovery mode</em>: A's <code>effective_weight</code> drops by half and ramps +1 per selection back toward {wa}, yielding <code>{seq}</code> so a recovering node isn't overwhelmed immediately.
:::

The model leaves out: full circuit-breaking via `max_fails` and `fail_timeout`, `backup` server pools, and worker-local isolation when upstream HTTP keepalive pools cause each worker to run its own independent SWRR state. {.take}

## Rate limiting (`limit_req`): `rate`, `burst`, and `nodelay` in the leaky bucket {#ch7}

::: strings
toc: limit_req leaky bucket
:::

`limit_req` is not a counter that resets on integer seconds—it is a millisecond-resolution leaky bucket inside a shared-memory red-black tree, capping excess to `burst` before emitting `503`. {.law}

Boundary counters resetting once per second let clients send double bursts straddling `:00.99` and `:01.01`. In `src/http/modules/ngx_http_limit_req_module.c`, `ngx_http_limit_req_lookup` evaluates continuous integer-scaled leaky-bucket math where 1 request equals `{=ch7.scale}`:

`excess = lr->excess - ctx->rate * ms / 1000 + 1000`

Here `lr->excess` is leftover bucket depth from the previous accepted call (initialized to `0` on the first request), `ms` is elapsed milliseconds since `lr->last`, and `rate` is pre-scaled by `{=ch7.scale}`. If `excess` exceeds `burst * 1000`, Nginx returns `503` (`NGX_BUSY`)—and critically **does not update `lr->excess` or `lr->last`** so rejected floods never inflate bucket drain times. For accepted requests: without `nodelay`, the worker delays forwarding by `excess / rate` ms to pace traffic evenly; with `nodelay`, all requests fitting inside `burst` pass immediately while charging the bucket so future excess drains gradually.

With defaults (`rate = 5 r/s`, `burst = 4`, 8 requests arriving 20 ms apart): request 1 (`excess = 0`) passes immediately, requests 2–5 fill the bucket up to `3,600` (`{=ch7.qDelay}` requests queued up to `{=ch7.qMaxMs}` ms without `nodelay`), and requests 6–8 overflow past `4,000` for `{=ch7.qDrop}` rejections (`503`). Toggling `nodelay` sends the first `{=ch7.nImm}` immediately while still rejecting the exact same 3 overflow requests. Because the tree and LRU list live in `ngx_shm_zone_t` shared memory guarded by an atomic spinlock, all 4 workers share a single bucket.

::: diagram dg-limit keys=dg.limit
cap: Figure 7. Shared-memory leaky bucket in ngx_http_limit_req_module: overflow past burst triggers 503 without raising bucket level.
aria: Diagram: cyan bucket with gold dashed burst limit, excess water inside, green leak arrow at rate*ms/1000, red 503 overflow exit, and violet shared-memory rbtree banner below
burst: burst × 1000 cap
excess: Bucket level lr->excess
leak: drain rate*ms/1000
shm: Shared-memory rbtree across all workers
eq: new = old - rate*ms/1000 + 1000
:::

::: lab ch7-model
model.title: limit_req leaky bucket simulator (ngx_http_limit_req_lookup)
model.how: Tune leak <code>rate</code>, <code>burst</code> ceiling, and spike size (20 ms apart), then toggle <code>nodelay</code> to observe queuing delays vs instant burst consumption and 503 drops.
ctl.rate: Steady rate (r/s)
ctl.burst: Bucket burst cap
ctl.spike: Requests in 20ms burst
ctl.nodelay: Enable nodelay (no artificial queue sleep)
cv.aria: Bar chart of candidate bucket excess per incoming burst request: green immediate 200, gold delayed 200, red rejected 503
cv.x: Request # in burst (20 ms spacing)
cv.y: Candidate bucket excess (reqs)
leg.imm: Immediate 200
leg.del: Queued / delayed 200
leg.rej: Rejected 503
read.imm: Immediate 200s
read.del: Delayed 200s
read.rej: Rejected 503s
read.wait: Peak queue delay
say.zero_burst: <em>Strict pacing (burst = 0)</em>: after request #1 passes immediately, every arrival faster than {rate} r/s gets 503 ({rej} dropped) with zero burst tolerance.
say.queued: <em>Traffic shaping (no nodelay)</em>: {del} burst requests queue smoothly up to <em>{wait} ms</em> before forwarding, while {rej} requests above burst receive 503.
say.nodelay: <em>Instant burst (nodelay)</em>: the first <em>{imm}</em> requests pass with zero added sleep while filling the bucket; the remaining {rej} overflow requests still return 503.
say.clean: At {rate} r/s and burst={burst}, all {spike} requests pass immediately with zero queueing or drops.
:::

The model leaves out: `delay N` partial-nodelay thresholds, shared-memory exhaustion LRU pruning (`ngx_http_limit_req_expire`), and multi-key IP vs route zone splits. {.take}

## Red-black tree timers: watching 10,000 timeouts through one `epoll_wait` argument {#ch8}

::: strings
toc: Red-black timers & lazy delay
:::

Nginx spawns no timer threads and never scans ten thousand sockets for timeouts. Every read, write, and keep-alive deadline enters a worker-local red-black tree, so each `epoll_wait` sleeps for the exact time remaining until the leftmost node expires. {.law}

Tracking 60-second Keep-Alive and 30-second read deadlines across 10,000 sockets via a periodic array scan wastes `O(N)` work per second. In `src/event/ngx_event_timer.h` and `src/core/ngx_rbtree.c`, each worker owns one lock-free `ngx_event_timer_rbtree`:

1. **Leftmost node sets `epoll_wait` timeout**: `ngx_event_find_timer()` walks left children to the minimum timestamp and passes `min_key - now` directly as the millisecond timeout to `epoll_wait`. At default (`{=ch8.timeout}` ms remaining), the kernel wakes at `{=ch8.timeout}` ms unless an earlier packet arrives. {#s1}
2. **Wake and pop expired nodes in `O(expired)`**: After `epoll_wait` returns, Nginx repeatedly pops leftmost nodes whose key `&lt;= now`, flagging `ev-&gt;timedout = 1` until the new leftmost node lies in the future. {#s2}
3. **300 ms lazy timer updates (`NGX_TIMER_LAZY_DELAY`)**: Reseating a node in a red-black tree on every TCP segment burns rotations unnecessarily. Nginx skips deleting and reinserting an active event's timer whenever `|new_key - old_key| &lt; {=ch8.lazyMs} ms`, eliminating `{=ch8.lazySkip}%` of tree rotations in our active-packet test while guaranteeing worst-case depth `&lt;= 2 × log2(N + 1)`—at most `{=ch8.c10kDepth}` levels even for 10,000 simultaneous timers. {#s3}

::: diagram dg-rbtree keys=dg.rbtree
cap: Figure 8. ngx_event_timer_rbtree: the leftmost minimum node (gold) sets epoll_wait's sleep limit, while 300 ms lazy updates skip frequent re-insertions.
aria: Diagram: 7-node red-black tree with leftmost gold node 355 pointing to epoll_wait timeout and bottom note on 300 ms lazy delay skipping tree updates
min: Leftmost node sets sleep limit
t1: epoll_wait(..., 355 - now)
t2: Skip delete+insert if |new - old| < 300 ms
:::

::: lab ch8-model
model.title: Red-black timer tree & 300 ms lazy update lab
model.how: Advance the clock <code>now</code> to watch expired leftmost nodes pop away and update <code>epoll_wait</code>'s sleep limit, or toggle the 300 ms <code>NGX_TIMER_LAZY_DELAY</code> skip rule.
ctl.count: Initial timer count
ctl.now: Current clock (ms)
ctl.lazy: Enable 300ms lazy delay
cv.aria: Live red-black binary search tree maintaining black root, no red-red edges, and uniform black height, highlighting the leftmost minimum node in gold
cv.empty: All timers expired: epoll_wait passes -1 to sleep until a packet arrives
cv.lazy: Lazy skip rate
leg.red: Red node
leg.blk: Black node
leg.min: Leftmost min (sets timeout)
read.act: Active timers in tree
read.exp: Expired & popped
read.wait: Next epoll_wait timeout
read.depth: Tree depth / RB bound
say.waiting: At {now} ms (none expired yet): {act} active timers (depth {depth}) sit in the tree; minimum {minK} ms caps <code>epoll_wait</code> sleep at <em>{wait} ms</em> while lazy updates skip {skip}% of churn.
say.expired: At {now} ms, <em>{exp} expired timers</em> were popped from the left; {act} remain (depth {depth}), pushing the minimum to {minK} ms so <code>epoll_wait</code> waits <em>{wait} ms</em> (lazy skip {skip}%).
say.empty: At {now} ms all timers are cleared; with an empty tree, <code>epoll_wait</code> sleeps indefinitely (-1) until the next network interrupt (lazy skip {skip}%).
:::

The model leaves out: Nginx's cached timestamp optimization (`ngx_time_update` / `timer_resolution`) that avoids repeated `gettimeofday` syscalls, and shutdown drains when thousands of Keep-Alive deadlines fire on the exact same millisecond. {.take}

## Zero-copy `sendfile()` and reverse-proxy `proxy_buffering` {#ch9}

::: strings
toc: sendfile zero-copy & proxy_buffering
:::

When serving static files, Nginx uses `sendfile()` to DMA bytes straight from the kernel page cache to the NIC, bypassing user space; yet when proxying a fast backend to a slow mobile client, Nginx intentionally buffers bytes in user space and temp files so slow clients never stall upstream workers. {.law}

Opposite as those two paths appear, both obey the same accounting rule: **keep slow peers out of scarce execution slots, and never copy bytes the CPU does not need to touch**.

**1. Static files: `sendfile()` + `TCP_CORK` (zero user-space copies).** Sending a 16 MiB file via classic 32 KiB `read()` + `write()` loops triggers `{=ch9.rwSys}` syscalls and `{=ch9.rwCtx}` context switches while the CPU manually copies `{=ch9.rwCopy} MiB` twice across the user/kernel boundary. Enabling `sendfile on;` with `tcp_nopush on;` (`TCP_CORK` coalescing full MSS frames) finishes in `{=ch9.sfSys}` `sendfile` calls with **0 MiB CPU-copied**—a Scatter-Gather NIC pulls pages straight from Linux's page cache via DMA. One crucial caveat: standard user-space OpenSSL HTTPS cannot use `sendfile()` unless kernel TLS (`kTLS` `SSL_sendfile`) is enabled, silently falling back to user-space encryption buffers.

**2. Reverse proxy: `proxy_buffering on` (protecting fast backends from slow 3G clients).** Suppose your 1 Gbps backend produces a 16 MiB payload in `{=ch9.upMs}` ms, while a 2 Mbps cellular client needs `{=ch9.cliSec}` seconds to download it. With `proxy_buffering off;`, Nginx locks the backend worker open for the full `{=ch9.cliSec}` seconds waiting for client ACKs. With `proxy_buffering on;` (default), Nginx drains the backend in `{=ch9.upMs}` ms into `proxy_buffers` and temp disk, releasing the backend `{=ch9.speedup}`× sooner while trickling bytes to the client inside the async event loop.

::: diagram dg-sendfile keys=dg.sendfile
cap: Figure 9. read()+write() crossing user space vs sendfile() DMA straight from kernel page cache to NIC (and the user-space TLS fallback caveat).
aria: Diagram: top red read+write crossing Disk, Page, User, NIC; bottom green sendfile jumping directly from Page to NIC without touching User; gold bottom note on kTLS requirement for HTTPS
rw1: read() + write(): 4 switches · 2× CPU copy
rw2: CPU copies bytes via user space
sf1: sendfile() + TCP_CORK: 0× CPU copy
sf2: Page cache -> Scatter-Gather NIC DMA
tls: Note: HTTPS without kTLS falls back
:::

::: lab ch9-model
model.title: sendfile zero-copy & proxy_buffering decoupling lab
model.how: Switch between static file serving and reverse-proxy buffering, then uncheck the optimization toggle to compare CPU copies, syscalls, and how long a slow client holds a backend worker hostage.
ctl.scen: Workload scenario
scen.static: Static file (sendfile)
scen.proxy: Reverse proxy (proxy_buffering)
ctl.opt: Enable optimization
opt.static: sendfile + TCP_CORK (HTTP / kTLS)
opt.proxy: proxy_buffering on (memory + temp file)
ctl.size: Payload size
ctl.mbps: Client download speed
cv.aria: Bar chart comparing CPU copies and syscalls in static mode, or backend worker hold time vs client download duration in proxy mode
cv.rwCopy: read+write CPU copy
cv.sfCopy: sendfile CPU copy
cv.rwSys: read+write syscalls
cv.sfSys: sendfile syscalls
cv.cliTime: Slow client transfer
cv.upOff: Backend held (buf off)
cv.upOn: Backend held (buf on)
read.copy: CPU boundary copies
read.sys: Static syscalls
read.up: Backend worker hold time
read.cli: Total client transfer
say.sendfile: <em>Zero-copy active</em>: sending {sz} MiB takes {sys} <code>sendfile</code> calls ({ctx} switches) and <em>0 MiB</em> of CPU copying straight from page cache to NIC DMA (user-space HTTPS falls back unless kTLS is active).
say.rw: <em>User-space copy path</em> (sendfile off or plain TLS): sending {sz} MiB invokes <em>{sys}</em> <code>read/write</code> syscalls ({ctx} switches) and copies <em>{copy} MiB</em> across kernel/user space.
say.proxy_on: <em>Upstream decoupled</em>: Nginx drains {sz} MiB from the 1 Gbps backend in <em>{upMs} ms</em>, freeing it <em>{speed}×</em> faster while streaming asynchronously to the {mbps} Mbps client over <em>{cliSec} s</em>.
say.proxy_off: <em>Backend pinned by slow client</em>: with buffering off, Nginx synchronizes read/write pacing and stalls a valuable backend thread for the full {mbps} Mbps download (<em>{cliSec} s</em>).
:::

To trace how the Linux page cache and NIC descriptor rings execute DMA without CPU copies, see [[how-the-os-talks-to-hardware#ch7|How the OS Talks to Hardware, Chapters 7 and 10]]; for why client latency and bandwidth limit transfer speed, see [[tcp-congestion#step1|Network Flow, Step 1]].

The model leaves out: the initial disk-to-page-cache DMA read on a cold cache miss, `aio threads` offloading blocking disk reads, `proxy_busy_buffers_size` thresholds, and local temp-disk write I/O when buffered proxy payloads exceed memory buffers. {.take}

## Where the frontier is (November 2026): HTTP/3 QUIC, `io_uring`, and Pingora / Envoy {#ch10}

::: strings
toc: Where the frontier is
:::

When transport shifts from single-stream TCP to UDP-based HTTP/3 QUIC, or when edge proxies scale across dozens of cores where process-isolated connection pools can no longer share upstream sockets, Nginx's classic multi-process `epoll` design itself reaches architectural boundaries. {.law}

### Established {#h.est .sub3}

- Kegel's C10K framing (1999), FreeBSD `kqueue` (Lemon, 2001), Linux `epoll` (merged in 2.5.44/2.6, 2002), and `sendfile(2)` zero-copy I/O form the established baseline of high-concurrency socket servers. {#e1}
- QUIC (RFC 9000, 2021) and HTTP/3 (RFC 9114, 2022) standardized encrypted multiplexed streams over UDP to remove TCP head-of-line blocking. {#e2}

### Already built {#h.demo .sub3}

- **Nginx 1.28.0 stable (released April 23, 2025)** consolidated `ngx_quic` HTTP/3 support into the stable branch, adding QUIC CUBIC congestion control (RFC 9438), disabling TLSv1/1.1 by default, and introducing upstream `resolve`, stream OCSP stapling, and `keepalive_min_timeout`. {#d1}
- **Nginx 1.30.0 stable (released April 14, 2026) and 1.31.x mainline (May 2026 onward)**: per nginx.org changelogs viewed through November 2026, 1.30.0 enabled HTTP/1.1 upstream keepalive by default alongside HTTP/2 backend connections, Encrypted ClientHello (ECH), `103 Early Hints`, and Multipath TCP (MPTCP); the **1.31.7+ mainline** release (2026) reworked `quic_bpf` eBPF socket dispatch so graceful reloads (`nginx -s reload`) and live binary upgrades preserve active HTTP/3 QUIC connections without silent drops. {#d2}
- **Cloudflare Pingora (open-sourced Rust proxy engine, 2024)**: after outgrowing Nginx/OpenResty's per-process worker isolation—where separate worker processes could not share upstream keep-alive connection pools, causing connection bloat and redundant TLS handshakes—Cloudflare moved to multi-threaded async Rust. In Cloudflare's published production comparisons (serving over 1 trillion daily requests), Pingora consumed roughly **70% less CPU** and **67% less memory** than their legacy Nginx/OpenResty stack (measured against Cloudflare's heavily customized legacy fleet). {#d3}
- **Envoy (C++ cloud-native service mesh)**: uses a multi-threaded thread-per-core design with thread-local event loops and lock-free local pools paired with dynamic xDS control-plane updates rather than static config reloads. {#d4}

### Experimental, open gaps, and claims {#h.claim .sub3}

- **Linux `io_uring` in stock Nginx**: despite long-standing community feature requests and external patches to replace `epoll` and POSIX `aio` with `io_uring` submission/completion rings, as of November 2026 stock upstream Nginx (1.30/1.31) continues to rely on its mature `epoll`/`kqueue` event loop by default. {#c1}
- **Kernel TLS (`kTLS` `SSL_sendfile`)**: recovering zero-copy `sendfile()` over HTTPS requires matching kernel, OpenSSL, and build configurations; out-of-the-box deployments without kTLS still encrypt in user space. {#c2}
- **Programmable framework vs declarative server**: Cloudflare positions Pingora as a Rust library for building bespoke proxies rather than a drop-in `nginx.conf` replacement; Nginx's process isolation and simple configuration remain dominant for everyday web serving and small-to-medium edge fleets. {#c3}

Release schedules and third-party benchmarks age quickly; every date, version number, and comparison figure in this chapter reflects the public record as of November 2026. {.take}

## Wrap-up: when Nginx stalls, returns 502, or drops traffic, ask three questions first {#ch11}

::: strings
toc: Wrap-up: ask three questions
:::

You do not need to memorize every C struct name. When latency spikes, requests return 502/503, or a route misbehaves, walk through three diagnostic questions in order. {.law}

{.qs}
- **Is it hitting connection/FD caps or uneven accept dispatch?** Check `worker_connections` and OS `ulimit -n` (Chapter 1)—remember each proxied client holds 2 file descriptors (client + upstream); if one worker core spikes to 100% while others idle, verify `reuseport` per-worker listen queues (Chapter 3). {#q1}
- **Which `location` and phase did the request actually enter?** Trace the four-step precedence tree (Chapter 4): check whether an `=` or `^~` stopped regexes early, or whether a longer plain prefix without `^~` handed control back to a regex; and remember `PREACCESS` (`limit_req`) always runs ahead of `ACCESS` (`allow`/`deny`). {#q2}
- **Are leaky-bucket settings or unbuffered slow clients choking backends?** Sudden 503 storms point to tight `burst` or missing `nodelay` (Chapter 7); intermittent 502s tie into SWRR `effective_weight` recovery and `fail_timeout` (Chapter 6); fast backends timing out under slow mobile downloads usually mean someone disabled `proxy_buffering` (Chapter 9). {#q3}

In one sentence: Nginx handles ten thousand concurrent connections without magic—it turns each idle socket from an expensive OS thread into a 440-byte array slot, multiplexes them lock-free per core via `epoll` ready lists and a red-black timer tree, and spends CPU cycles only on active bytes through bump-allocated pools, smooth upstream pacing, and zero-copy paths. {#sum .sum}

Related essays: [[how-the-os-talks-to-hardware]] (syscalls, `epoll`, and the kernel page cache), [[how-virtual-memory-works]] (virtual address spaces and copy-on-write `fork()`), [[how-a-nic-moves-packets]] (multi-queue RSS and NIC DMA), and [[tcp-congestion]] (TCP handshakes, RTT, and queue congestion). {#links}

::: footer
**Sources.** Core structures and algorithm rules follow the **Nginx 1.28.0 stable** source specification (released April 23, 2025): `src/core/ngx_connection.h`, `ngx_palloc.h`, `ngx_rbtree.h`, `ngx_cycle.c`; `src/os/unix/ngx_process_cycle.c`, `ngx_linux_sendfile_chain.c`; `src/event/ngx_event.c`, `ngx_event_timer.h`, `modules/ngx_epoll_module.c`; `src/http/ngx_http_core_module.h`, `ngx_http_core_module.c`, `ngx_http_request.c`, `ngx_http_upstream_round_robin.c`, `modules/ngx_http_limit_req_module.c`.

Specifications and engineering literature: D. Kegel, "The C10K Problem" (1999); J. Lemon, "Kqueue: A Generic and Scalable Event Notification Facility" (USENIX 2001); IETF RFC 9000 (QUIC) and RFC 9114 (HTTP/3); nginx.org 1.28.0 / 1.30.0 / 1.31.x changelogs (checked November 2026); Cloudflare Engineering Blog, "How we built Pingora, the proxy that connects Cloudflare to the Internet" (2022/2024 CPU and memory metrics).

**The model.** Because no native `nginx` binary is installed on this build host, the page does not invoke Nginx itself; instead, `models.js` reimplements all nine core algorithms from the source specifications, and `tools/crosscheck.cjs` checks C10K scaling formulas, `location` precedence trees, SWRR sequences and zero-sum invariants, `limit_req` fixed-point math, red-black tree invariants, and `sendfile` copy counts (results in `BRIEF.md`). Chapter 1 context-switch cost and Chapter 3 microsecond slopes are adjustable parameterized estimates for order-of-magnitude comparison. This essay was written with Antigravity.
:::
