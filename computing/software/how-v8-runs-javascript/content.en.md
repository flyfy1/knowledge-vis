---
lang: en
title: How V8 Runs JavaScript · A Hands-on Essay
desc: Run node bench.js in a terminal and dynamically typed JavaScript, compiled with no ahead-of-time type annotations, hits near-C speed inside hot loops. Checked against the host V8 14.6.202.34-node.40 (Node.js v26.12.1) bytecode, native debug prints, and CLI thresholds, this essay traces the whole pipeline: the four JIT tiers and lazy parsing, pointer tagging and compression, hidden classes and inline caches, Ignition's accumulator bytecode, speculative deoptimization, the one-way ElementsKind lattice, Orinoco generational GC, the microtask seam, and the November 2026 frontier.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.ms: {v} ms
u.us: {v} µs
u.ns: {v} ns
u.b: {v} B
u.kib: {v} KiB
u.mib: {v} MiB
u.calls: {v} calls
u.x: {v}×
u.pct: {v}%
u.none: none
u.yes: Yes
u.no: No
:::

# How V8 Runs JavaScript {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

Type <code>node bench.js</code> in a terminal, and within milliseconds hot loops run at native machine speed.<br>Dynamic objects carry no static field offsets—so how does V8 dare read memory at fixed offsets, and when does it bail back out? {.sub}

JavaScript ships with zero static type annotations. The same `p.x + p.y` in a helper function might receive small integer points today, heap floats tomorrow, sparse objects missing a key, or even strings. V8 cannot afford hundreds of milliseconds of upfront ahead-of-time compilation on startup, nor can it walk a hash dictionary on every property access. This essay follows one question from end to end: **what happens between handing a `.js` file to V8 and hot loops executing native machine code while memory gets reclaimed cleanly?** We walk through the exact lifecycle: how code climbs the four-tier pipeline, how values pack into tagged words, how dynamic objects grow fixed hidden classes and inline caches, how Ignition feeds runtime types into its FeedbackVector, why a single broken guard reconstructs an interpreter stack frame, why arrays degrade one way down a lattice, how generational GC keeps most pauses under a millisecond, and where V8 hands control back to the host event loop. {.lead}

Thresholds, byte sizes, bytecode disassembly, and debug prints here were all verified directly against **V8 {=v8.ver}** bundled in **Node.js v{=node.ver}** on macOS arm64. Where Chrome's browser builds differ—specifically enabling **Pointer Compression** and the **V8 Heap Sandbox**—the prose marks both, because compile-time flags change Smi bit widths and object byte sizes directly. The page embeds no external engine: nine interactive models in `models.js` replay the rules deterministically, and `tools/crosscheck.cjs` executes `/opt/homebrew/bin/node` with `--print-bytecode`, `--trace-opt`, `--trace-deopt`, and `--allow-natives-syntax` to check every number. For the underlying CPU hardware, see [[how-a-cpu-runs-a-program]], [[how-cpu-caches-work]], [[how-a-cpu-guesses-ahead]], and [[how-a-cpu-does-math]]. {.note}

## The 4-tier pipeline: startup latency vs peak throughput {#ch1}

::: strings
toc: The 4-tier pipeline & lazy parsing
:::

V8 never begins with its heaviest compiler. When a script first loads, most functions run once or never; V8 starts executing immediately and only sends a function up the compiler ladder after it proves it is hot. {.law}

Consider this ten-line script launched with `node bench.js`. A hot loop pushes a hundred thousand point reads through `addXY(p)`, leaving an unused cold helper above it and a resolved `Promise` at the end:

::: html ch1-code
code.aria: A minimal JavaScript program that exercises V8's pipeline
code: "// node bench.js\nfunction coldHelper(v) { return v * 2 + 1; }\nfunction addXY(p) { return p.x + p.y; }\n\nconst pts = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i + 1 }));\nlet total = 0;\nfor (let r = 0; r < 200; r++) {\n  for (let i = 0; i < pts.length; i++) total += addXY(pts[i]);\n}\nPromise.resolve(total).then(v => console.log(v));"
:::

Even parsing is deferred. Because `coldHelper` is never called at startup, V8's **PreParser** only scans its braces for syntax validity and skips building an AST or bytecode—this is **lazy parsing**. Only functions that actually run (`addXY`) undergo full parsing into **Ignition** bytecode. As calls accumulate in V8 {=v8.ver}, execution climbs four tiers: around {=ch1.fbvThresh} calls V8 allocates a FeedbackVector and **Sparkplug** compiles bytecode straight into unoptimized baseline machine code; at {=ch1.magOsrThresh} loop iterations (`--invocation-count-for-maglev-osr`) or {=ch1.magThresh} calls (`--invocation-count-for-maglev`), **Maglev** takes over for fast mid-tier optimization; at {=ch1.tfOsrThresh} OSR iterations or {=ch1.tfThresh} calls, **TurboFan / Turboshaft** spends full compiler effort on peak throughput.

::: diagram dg-pipeline keys=dg.pipeline
cap: Figure 1. V8's four-tier execution pipeline and deoptimization return path. Code climbs left-to-right in heat; the dashed red path bails directly back to Ignition bytecode if an assumption fails.
aria: Diagram: five stages from Parser and PreParser, Ignition bytecode, Sparkplug, Maglev, to TurboFan/Turboshaft with a red deoptimization return path back to Ignition
l1: Parser / PreParser
l1s: Cold skips AST; hot emits bytecode
l2: Ignition Interpreter
l2s: Runs bytecode and collects type feedback
l3: Sparkplug Baseline
l3s: Direct bytecode translation (no opts)
l4: Maglev Mid-tier JIT
l4s: Fast CFG JIT (~10x compile speed)
l5: TurboFan / Turboshaft
l5s: Heavy inlining & reg allocation
x1: Bytecode
x2: ~8–12 calls
x3: 400 calls (OSR 100)
x4: 3000 calls (OSR 500)
deopt: Bailout deopt
:::

Benchmarking `sumLoop(100)` over 50,000 calls on this Apple arm64 machine (`--max-opt=0..3`) confirms the spread: capped at Ignition it takes {=ch1.ignNs} ns per call; Sparkplug drops to {=ch1.spNs} ns; Maglev compiles in {=ch1.magCompileMs} ms on a background thread and hits {=ch1.magNs} ns; TurboFan spends {=ch1.tfCompileMs} ms to reach {=ch1.tfNs} ns. Compiling cold code upfront with TurboFan would waste {=ch1.coldAlwaysTf} ms mostly inside the compiler, whereas V8's tiered path finishes the cold run in {=ch1.coldTiered} ms.

::: lab ch1-model
model.title: Execution tiers and the cold-vs-hot crossover
model.how: Drag call count and bytecode size to compare Ignition-only, V8's tiered pipeline, and hypothetical call-1 TurboFan; toggle lazy pre-parsing to watch cold startup savings.
ctl.calls: Call count
ctl.size: Bytecode bytes
ctl.lazy: Enable lazy PreParser
cv.aria: Log-scale total CPU time curves across call counts showing Sparkplug, Maglev, and TurboFan thresholds
cv.x: Call count
cv.y: Total time (ms, log scale)
leg.ign: Ignition only
leg.tier: V8 4-tier pipeline
leg.turbo: Always TurboFan
tier.ignition: Ignition
tier.sparkplug: Sparkplug
tier.maglev: Maglev
tier.turbofan: TurboFan
read.tier: Highest tier reached
read.tiered: V8 tiered total
read.ign: Ignition-only total
read.always: Upfront TurboFan total
say.cold: At {n} calls the function stays in <em>Ignition</em>: V8 spends {t} ms total, whereas compiling upfront with TurboFan wastes {a} ms in the compiler alone. Lazy PreParser saved {p}% of cold parse work.
say.warm: At {n} calls <em>Sparkplug</em> baseline takes over: near-zero compile overhead cuts per-call cost more than in half, totaling {t} ms (vs {i} ms in Ignition).
say.hot: Crossing 400 ({n} calls) puts <em>Maglev</em> in charge on a background thread: {t} ms total, already {sp}× faster than Ignition while avoiding TurboFan's heavy compile latency.
say.top: Crossing 3000 ({n} calls) engages <em>TurboFan / Turboshaft</em> for aggressive inlining and elimination, finishing in {t} ms ({sp}× faster than Ignition's {i} ms).
:::

The model scales measured baseline nanosecond and compile latencies proportionally with bytecode length; real workloads also depend on inlining depth, background compiler threads, and code cache warmth. {.take}

## Pointer tagging & compression: why some numbers live on the heap {#ch2}

::: strings
toc: Pointer tagging & compression
:::

Every JavaScript value in a stack slot or object field must fit into one uniform "tagged word." V8 inspects its lowest bit: `0` means an immediate signed integer (`Smi`) packed straight inside the word, while `1` marks a pointer to a heap-allocated object. {.law}

Because registers and object slots cannot tell statically whether a field holds an integer or a string next millisecond, V8 tags every value. Storing raw 64-bit pointers everywhere wastes half the L1/L2 cache lines on identical upper bits (see [[how-cpu-caches-work#ch2|cache line packing]]). Chrome therefore builds V8 with **Pointer Compression**: the entire heap sits inside a contiguous 4 GiB virtual address **cage** whose base stays pinned in a CPU register, shrinking every heap reference to a 32-bit offset. When the low bit is `0`, the upper 31 bits hold an immediate **Smi** (`-1,073,741,824` to `{=ch2.smi31Max}`); when it is `1`, the offset locates a `HeapObject` in the cage. Any fractional value like `0.5` or an integer past the Smi limit forces V8 to allocate a **HeapNumber** box holding a 64-bit IEEE-754 double (see [[how-a-cpu-does-math#ch1|IEEE-754 floats]]).

Compile flags matter here. On our host Node.js v{=node.ver} (V8 {=v8.ver}), pointer compression is turned off (`v8_enable_pointer_compression = 0`), leaving full 64-bit tagged words: Smis fill the upper 32 bits (up to `{=ch2.smi32Max}`), a boxed `HeapNumber` occupies {=ch2.heap64B} bytes (8-byte `Map` word + 8-byte float64), and a two-field `{x, y}` object takes {=ch2.obj2_64B} bytes. Under Chrome's 32-bit pointer compression, that same `{x, y}` object halves to {=ch2.obj2_32B} bytes, a `HeapNumber` takes {=ch2.heap32B} bytes, and the heap caps out at ~{=ch2.heapLimitGiB} GiB inside its cage.

::: diagram dg-tagging keys=dg.tagging
cap: Figure 2. Tagged word layouts across two V8 build modes: 32-bit compressed offsets in a 4 GiB cage (top, Chrome) vs 64-bit full tagged words verified on host Node v26.12.1 (bottom), showing HeapNumber boxing.
aria: Diagram: 32-bit pointer-compressed Smi/HeapObject bit fields and 64-bit full Smi/HeapNumber pointer layout
m32: 32-bit Compressed (Chrome)
s31p: 31-bit signed Smi (val << 1)
s31d: Zero heap bytes, range ±2³⁰
p31p: 31-bit cage offset (4 GiB Cage)
p31d: Half object size (20 B two-field obj)
m64: 64-bit Full Pointer (Host Node.js)
s32p: 32-bit Smi
s32d: Range ±2³¹
h64p: 64-bit HeapObject pointer
h64d: Points to boxed heap object
hn1: HeapNumber (16 B)
hn2: 8 B Map* + 8 B IEEE-754 float64
:::

::: lab ch2-model
model.title: Smi vs HeapNumber boxing boundary inspector
model.how: Pick a number and switch between 32-bit compressed pointers (Chrome) and 64-bit full pointers (Node) to see how the tag bit splits 2³⁰ and 2³¹ into Smi vs heap allocation, and how object size doubles.
ctl.preset: Test value
ctl.mode: Tagged word mode
mode.compressed: 32-bit compressed
mode.full64: 64-bit full
cv.aria: Bit-level tagged word diagram showing the low tag bit, payload encoding, and whether a HeapNumber box is allocated
cv.tag: Tag
cv.pay: Smi Payload
cv.ptr: Heap Ptr / Offset
cv.box: Boxed HeapNumber on Heap
read.kind: Representation
read.word: Tagged word hex
read.heap: Extra heap allocation
read.obj: Point {x, y} size
say.smi: Value {val} fits inside the Smi range (tag bit <em>0</em>): packed straight into {word} with <strong>0 bytes of heap allocation</strong>. A two-field object occupies {obj} B.
say.heap: Value {val} cannot fit as a Smi (tag bit becomes <em>1</em>): V8 must follow the pointer to a {heap}-byte <code>HeapNumber</code> box on the heap, creating GC work for every escaping float result.
:::

The model computes standalone value representations and two-field object headers without scalar replacement—where Maglev or TurboFan eliminates non-escaping `HeapNumber` allocations completely inside registers (covered in chapter 6). {.take}

## Hidden classes (Maps) & property layout: turning dynamic names into offsets {#ch3}

::: strings
toc: Hidden classes, slack tracking & dicts
:::

JavaScript objects have no compile-time struct declarations, yet V8 builds shared structural blueprints called `Maps` (hidden classes) on the fly. Objects initialized with the same keys in the same order share one `Map`, so `p.x` compiles down to a base pointer plus a fixed byte offset. {.law}

Every added property advances the object along a `Map` transition tree: empty `{}` (`M0`) transitions on `+x` to `M1`, then on `+y` to `M2`. Any second object initialized with `x` then `y` shares `M2` (`%HaveSameMap(a1, a2)` is `true`), laying `x` and `y` consecutively in fast **in-object slots**. Swap the order to `{y: 2, x: 1}` and the tree forks immediately from `M0` into `M3 -> M4`: even though both objects hold the exact same key names, `%HaveSameMap` turns `false` and their memory offsets swap.

Constructors and `delete` reveal two deeper rules. On `new Point(x, y)`, V8 initially grants extra empty slots (**in-object slack tracking**): for the first {=ch3.slackCalls} constructions on host 64-bit Node, `Point` allocates {=ch3.slackEarlySlots} in-object slots ({=ch3.slackEarlyB} bytes) while `construction counter` counts down from 6 to 0; on call 7, V8 trims the `Map` down to the exact {=ch3.slackDoneSlots} fields used ({=ch3.slackDoneB} bytes). Conversely, calling `delete obj.b` kicks the object off its fast `Map` into `DictionaryProperties` (shrinking the shell to {=ch3.dictObjB} bytes and moving every key into an out-of-line `NameDictionary` hash table).

::: diagram dg-map-tree keys=dg.map-tree
cap: Figure 3. The hidden class (Map) transition tree and dictionary fallback. Same initialization order shares M2 on the left; reversed order forks M4 on the right; delete detaches into a NameDictionary hash table.
aria: Diagram: Map transition tree branching from M0 to M1/M2 on the left, M3/M4 on the right, and delete falling to dictionary properties at the bottom
root: Empty start shape
off0: Offset +24 B
fast2: Adjacent slots
fork: Swapped offsets
del: delete b
dict1: Dictionary Mode (NameDictionary)
dict2: Off fast path: hash probe per access
:::

::: lab ch3-model
model.title: Map transition tree & in-object slot layout
model.how: Switch between the five construction scenarios to see when two objects share M2, when key reordering forks M4, how slack tracking shrinks on the 7th constructor call, and what delete turns into.
ctl.scen: Object scenario
sc.same: Ordered {x, y}
sc.reord: Reordered {y, x}
sc.slack1: Constructor call 1
sc.slack7: Call 7 slack trimmed
sc.dict: delete property
cv.aria: Live Map transition tree and byte-slot layout inside the instance
cv.slots: Object Memory Layout
cv.hdr: Header (Map/Prop/Elem)
cv.slack: Slack
cv.dict: Out-of-line NameDictionary Hash
read.map: Active Map shape
read.same: Shared Map?
read.size: Instance bytes (64b / 32b)
read.slack: In-object slots (used / cap)
say.fast: Same property order or finished slack tracking keeps <em>FastProperties</em>: fields sit inline right after the 3-word header at fixed byte offsets with zero hash dictionary.
say.forked: Merely writing <code>{y, x}</code> instead of <code>{x, y}</code> forked the tree to <em>M4</em>: <code>%HaveSameMap</code> is false and the byte offsets of <code>x</code> and <code>y</code> swapped places.
say.slack: Call 1 of <code>new Point()</code> runs with <em>Slack Tracking</em> active: V8 pre-reserves {total} in-object slots ({size64} B) until the construction counter hits zero and shrinks the instance.
say.dict: <code>delete</code> kicked the object off the fast path onto a dictionary map ({size64} B shell), dumping properties into an out-of-line <em>NameDictionary</em> hash table.
:::

The layout matches host V8 14.6 `%DebugPrint` defaults (object literals starting from `{}` pre-allocate 4 slots; constructor initial maps start with 10). Adding dozens of dynamic fields later overflows into an external `PropertyArray`. {.take}

## Inline caches (LoadIC): turning dictionary lookups into one offset load {#ch4}

::: strings
toc: Inline caches: mono, poly & mega
:::

Hidden classes alone would still leave bytecode searching a `DescriptorArray` on every read. V8 pairs each property access site with a `FeedbackVector` cache slot (`LoadIC`) that remembers the last `Map` and byte offset seen—turning `o.x` into one pointer comparison plus `[rax + offset]`. {.law}

Inspecting `function getX(o) { return o.x; }` with `%DebugPrint(getX)` exposes the four-stage `LoadProperty` state machine inside `slot #0`: cold code begins `UNINITIALIZED`; after seeing its first shape it turns **`MONOMORPHIC`**, storing one weak `Map` pointer and a `LoadHandler(is in object = 1, field index = ...)` that JIT code compiles to a single guard + offset load; when 2 to **`{=ch4.maxPoly}` shapes** pass through the same site, it widens into **`POLYMORPHIC`**, scanning a short `WeakFixedArray` guard list up to 4 entries long; as soon as a **5th** shape appears, V8 marks the slot with `megamorphic_symbol` (**`MEGAMORPHIC`**) and drops down to probing a shared global stub hash table. On our Apple arm64 machine over 1,000,000 calls, monomorphic `getX` averaged {=ch4.monoNs} ns per load, whereas crossing past 4 shapes into megamorphic jumped more than 2× to {=ch4.megaNs} ns.

::: diagram dg-ic keys=dg.ic
cap: Figure 4. LoadIC state transitions inside a FeedbackVector slot. Monomorphic holds one Map guard; polymorphic holds 2–4 linear guards; a 5th shape overflows into the megamorphic global hash stub.
aria: Diagram: FeedbackVector slot transitions from UNINITIALIZED to MONOMORPHIC, POLYMORPHIC up to 4 maps, and MEGAMORPHIC global hash cache
u: UNINITIALIZED
us: First read jumps to slow runtime lookup
m: MONOMORPHIC (1 Map)
ms: 1 Map guard + fixed offset load
p: POLYMORPHIC (2–4 Maps)
ps: WeakFixedArray linear guard scan (max 4)
g: MEGAMORPHIC (5+ Maps)
gs: Global hash stub fallback (megamorphic)
e1: First shape seen
e2: Shapes 2 to 4 seen
e3: 5th shape overflows slot
:::

::: lab ch4-model
model.title: LoadIC cache slot states & lookup cost step
model.how: Drag the number of distinct Maps reaching getX(o) from 1 to 8 and watch the FeedbackVector slot fill up to 4 entries before spilling into megamorphic global hash lookups.
ctl.shapes: Distinct Maps seen at call site
ctl.iters: Loop iterations
cv.aria: Live FeedbackVector slot diagram and per-access nanosecond step chart across 1 to 8 shapes
cv.x: Distinct Map shapes
cv.y: Estimated cost per read (ns)
cv.slot: FBV[0] Slot
cv.hash: Global Hash Stub
read.state: LoadIC state
read.guards: Avg Map guards checked
read.ns: Estimated cost per load
read.total: Batch total time
say.mono: With 1 shape the site stays <em>MONOMORPHIC</em>: one Map pointer guard plus a fixed-offset load, calibrated at {ns} ns per access.
say.poly: Seeing {n} shapes widens the site to <em>POLYMORPHIC</em>: the slot checks {n} guards linearly (avg {g} checks) and prevents single-target inlining.
say.mega: At {n} shapes (past V8's cap of 4), the slot trips into <em>MEGAMORPHIC</em>: local handlers are discarded for the global hash stub, climbing to {ns} ns ({slow}× slower than monomorphic).
:::

Per-load latency numbers are calibrated to host V8 14.6 microbenchmarks on `getX(o)`; in real applications, megamorphic sites also cause branch-misprediction stalls (see [[how-a-cpu-guesses-ahead#ch1]]) and prevent Maglev/TurboFan from hoisting field loads out of loops. {.take}

## Bytecode & register VM: how Ignition feeds the FeedbackVector {#ch5}

::: strings
toc: Ignition bytecode & FeedbackVector
:::

Ignition is a register-based bytecode interpreter anchored around one implicit **accumulator register (`acc`)**. Routing values implicitly through `acc` keeps bytecode compact while simultaneously writing observed types into a parallel `FeedbackVector`. {.law}

Disassembling `addXY(p)` on V8 {=v8.ver} yields just **{=ch5.addLen} bytes** across five instructions (even the `sumLoop` loop is only {=ch5.loopLen} bytes). Notice two details directly visible in the dump: `Parameter count 2` counts both implicit `this` and parameter `p` (`a0`), and almost every hot instruction carries a `FBV[k]` slot index. `GetNamedProperty` loads `p.x` into `acc` while caching the `Map` in `FBV[1]`; `Add r0, FBV[0]` adds while stamping `SignedSmall`, `Number`, or `Any` into `FBV[0]`. Optimizing compilers later read **BytecodeArray + FeedbackVector**, never the raw source text.

::: diagram dg-ignition keys=dg.ignition
cap: Figure 5. Ignition's execution loop: compact bytecode writes results through the implicit accumulator (acc) and frame registers while recording live types into FeedbackVector slots.
aria: Diagram: BytecodeArray instructions connected to the accumulator, frame registers a0/r0, and the FeedbackVector type table
bc: BytecodeArray (13-byte disassembly)
acc: Accumulator (acc)
accs: Implicit op target
reg: Frame Registers
fbv: FeedbackVector
fbvs: Records Map, IC & arithmetic types
:::

::: lab ch5-model
model.title: Step through real V8 14.6 Ignition bytecode
model.how: Pick input types for addXY(p) and click Step repeatedly to watch the program counter move across the 5 real opcodes while updating acc, r0, and FeedbackVector slots.
ctl.step: Step instruction
ctl.reset: Reset VM
ctl.input: Input types
in.smi: Smi (3, 4)
in.double: Float (3.5, 4)
in.string: String ("3", 4)
cv.aria: Five Ignition opcodes, accumulator acc, register r0, and live FeedbackVector slot updates
cv.reg: Registers & Feedback
read.pc: PC / step count
read.acc: Accumulator (acc)
read.r0: Register r0
read.fbv: FBV[0] Add feedback
say.run: Executed <code>{op}</code>: compact {len}-byte encoding updates <code>acc</code> or registers while recording live type evidence in the <code>FeedbackVector</code>.
say.done: Returned <em>{acc}</em> and stamped <code>FBV[0]</code> as <em>{fbv}</em>: when Maglev compiles this function next, it emits native integer, float64, or string code directly from this slot.
:::

The stepper executes the 5-instruction `addXY` bytecode directly; it omits the cold warm-up phase (the first 7 calls in V8 14.6 before `--invocation-count-for-feedback-allocation=8` allocates the `FeedbackVector`). {.take}

## Speculative optimization, OSR & deoptimization bailout {#ch6}

::: strings
toc: Speculative JIT, OSR & deoptimization
:::

Maglev and TurboFan hit near-C speed by emitting machine code specialized for past observations—guarded by cheap `CheckMaps` and `CheckSmi` checks. When an assumption breaks, V8's deoptimizer rebuilds the Ignition stack frame on the spot and bails out. {.law}

What if a function is only entered once, yet runs a hot loop? At `JumpLoop`, V8 triggers **OSR (On-Stack Replacement)**—at {=ch1.magOsrThresh} loop iterations for Maglev or {=ch1.tfOsrThresh} for TurboFan—swapping the live stack frame mid-loop directly into compiled machine code. Inside compiled code, every load is protected by `CheckMaps` and every integer op by `CheckSmi`.

Hand an unexpected `{y: 1, x: 2}` to compiled `f(o)` while running `--trace-deopt` on our host Node binary, and V8 logs verbatim: `[bailout (kind: deopt-eager, reason: wrong map)]`. That failed `CheckMaps` guard jumps straight into the **Deoptimizer**, uses compiler metadata to materialize Ignition's exact `BytecodeArray @ 0` frame, `acc`, and registers, widens the `FeedbackVector`, and resumes safely in the interpreter. On a 5,000-call trace, a clean monomorphic run takes ~{=ch6.cleanMs} ms, whereas one late shape surprise plus recompile lifts it to ~{=ch6.lateMs} ms; if shapes keep flipping repeatedly, V8 hits its deopt limit and refuses further optimization (**deopt thrashing**).

::: diagram dg-deopt keys=dg.deopt
cap: Figure 6. Speculative guard execution and deoptimization bailout. Passing CheckMaps/CheckSmi stays on native instructions; failing jumps into the Deoptimizer to rebuild the exact Ignition frame.
aria: Diagram: compiled JIT guard branching to fast native load on pass vs Deoptimizer and Ignition frame reconstruction on fail
jit: Maglev / TurboFan Machine Code
ok: Pass
fast1: Native offset load
fail: Fail
bail1: Eager Deopt
bail2: Widen FBV
ign1: Reconstruct Ignition Frame
ign2: Exact bytecode offset @pc, acc & r0
:::

::: lab ch6-model
model.title: Speculative tier-up and deopt bailout trace
model.how: Switch between the four input streams and toggle Maglev on/off to see tier transitions over 5000 calls, where guards fire eager deopts, and when deopt loops freeze optimization.
ctl.scen: Input stream
sc.clean: Clean Smi + Map
sc.late: Late map flip at #3500
sc.smi: Smi overflow to float
sc.storm: Polymorphic deopt storm
ctl.maglev: Enable Maglev (V8 14.6 default)
cv.aria: Per-call latency timeline over 5000 calls showing tier drops on deoptimization bailout
cv.x: Call index
cv.y: Per-call latency (ns, log scale)
tier.ignition: Ignition
tier.sparkplug: Sparkplug
tier.maglev: Maglev
tier.turbofan: TurboFan
reason.none: none
reason.wrong_map: wrong map (shape change)
reason.not_smi: not a Smi
reason.deopt_loop: deopt_loop (opt disabled)
read.tier: Final stable tier
read.deopts: Deoptimizations
read.total: 5000-call total
read.overhead: Overhead vs clean run
say.clean: All 5000 calls passed every guard with <em>0 deoptimizations</em>: climbing Sparkplug → Maglev → TurboFan in {tot} ms total.
say.deopt: Hit <em>{reason}</em> causing {cnt} eager bailout(s) back to Ignition; widening feedback restored optimization at an extra {over} ms cost.
say.thrash: Repeated deopts ({cnt}×) tripped V8's bailout cap and <em>disabled further optimization</em>, stranding the rest of the run on slow paths.
:::

The tracer models compile and frame-reconstruction costs as deterministic spikes; it leaves out **lazy deoptimization** (invalidating compiled code asynchronously when a prototype chain or global dependency cell changes elsewhere). {.take}

## Arrays & the one-way ElementsKind lattice {#ch7}

::: strings
toc: Arrays & the ElementsKind lattice
:::

Every JavaScript array stores an `ElementsKind` tag inside its `Map` describing how its elements sit in memory. Transitions across this lattice are strictly one-way: once an array takes a hole or a non-number, it can never upgrade back to packed integers. {.law}

Creating `[1, 2, 3]` starts at the top of the lattice: **`PACKED_SMI_ELEMENTS`**, meaning contiguous inline Smis with no gaps. Calling `.push(1.5)` promotes the whole backing store to **`PACKED_DOUBLE_ELEMENTS`**, storing raw unboxed 64-bit IEEE-754 floats (meaning reading an element out to polymorphic code now boxes it into a `HeapNumber`). Assigning `arr[5] = 2.5` inserts the sentinel `the_hole` at indices 3 and 4, dropping the array permanently into **`HOLEY_DOUBLE_ELEMENTS`**; adding `.push('hi')` degrades it further to **`HOLEY_ELEMENTS`** (boxed pointers plus prototype-chain lookups whenever a loop hits `the_hole`). Even after setting `arr.length = 3` and overwriting `[1, 2, 3]`, `%HasSmiElements` and `%HasHoleyElements` on host V8 14.6 prove **it stays `HOLEY_ELEMENTS` forever**. On our 1,000-element sum benchmark, `PACKED_SMI` takes {=ch7.smiArrNs} ns/element, `PACKED_DOUBLE` {=ch7.dblArrNs} ns, `HOLEY_DOUBLE` {=ch7.holeyArrNs} ns, and `DICTIONARY_ELEMENTS` leaps to {=ch7.dictArrNs} ns.

::: diagram dg-elements keys=dg.elements
cap: Figure 7. V8's strictly one-way ElementsKind lattice. Every transition flows right (more general element types) or down (introducing holes or dictionary backing) and never reverses.
aria: Diagram: 2x3 lattice of PACKED_SMI, PACKED_DOUBLE, PACKED above HOLEY_SMI, HOLEY_DOUBLE, HOLEY and DICTIONARY_ELEMENTS below
ps: Packed Smi
pd: Raw Float64
pt: Tagged Ptr
hs: Holey Smi
hd: Holey Float
ht: Holey+Proto
dict: Sparse Hash Map
:::

::: lab ch7-model
model.title: One-way ElementsKind lattice mutator
model.how: Mutate [1, 2, 3] with the buttons below—try creating a hole [5]=2.5 or pushing 'hi', then click Truncate length=3 to see why V8 never climbs back up to PACKED_SMI_ELEMENTS.
ctl.pushSmi: push(4)
ctl.pushDbl: push(1.5)
ctl.hole: Set hole [5]=2.5
ctl.pushStr: push('hi')
ctl.shrink: Truncate length=3
ctl.sparse: Sparse [100000]=1
ctl.reset: Reset [1,2,3]
cv.aria: Seven-node ElementsKind lattice with highlighted transition path and live backing-store cells
cv.back: Backing Store
read.kind: Current ElementsKind
read.packed: Packed (no holes)?
read.len: Array length
read.cost: Benchmark cost/elem
say.smi: Array is in its fastest form, <em>PACKED_SMI_ELEMENTS</em>: contiguous integers, zero unboxing, and zero hole/prototype checks.
say.double: Mixing a float moved to <em>PACKED_DOUBLE_ELEMENTS</em>: raw 64-bit floats pack tightly, though reading an item into generic code boxes a HeapNumber.
say.holey: A gap injected <em>the_hole</em>! Now in <em>{kind}</em>, loops must guard every read against holes that could inherit from <code>Array.prototype</code>.
say.tagged: Mixing a string generalized the backing array to <em>{kind}</em> tagged slots, disabling unboxed numeric array loops.
say.dict: Sparse index assignment spilled into <em>DICTIONARY_ELEMENTS</em>: V8 abandoned contiguous arrays for a hash table, multiplying loop cost.
say.stuck: Truncating back to length 3 with integers <em>still leaves the array stuck in {kind}</em>—V8's lattice never transitions upward.
:::

The per-element latency column mirrors host V8 14.6 benchmarks on our machine; tight `0 .. length-1` loops can sometimes eliminate bounds checks in Maglev, yet cannot erase `the_hole` or prototype checks once holey. {.take}

## Orinoco generational GC: why pauses stay sub-millisecond or spike {#ch8}

::: strings
toc: Orinoco generational & concurrent GC
:::

Most JavaScript objects die microseconds after allocation. V8's **Orinoco** collector splits the heap into a small Young Generation cleaned in fractions of a millisecond by copying or MinorMS, and a large Old Generation guarded by concurrent tri-color marking and write barriers. {.law}

Fresh objects land in **New Space** (initially {=ch8.newSpaceKiB} KiB in a fresh Node process, while `old_space` starts around {=ch8.oldUsedMiB} MiB), where bump-pointer allocation just increments an address pointer. When New Space fills, **Scavenger** runs Cheney's semi-space copy: only live objects move from `From-space` to `To-space`, pausing proportionally to survivors alone. Under `--trace-gc` on our host binary, Scavenge pauses measured **{=ch8.scavLoMs}–{=ch8.scavHiMs} ms**. Objects surviving two scavenges **promote** into **Old Space**.

Copying half of a gigabyte-scale Old Space is prohibitive, so Orinoco manages it via **Mark-Sweep-Compact**: background threads run **tri-color marking** (White = unvisited, Grey = queued, Black = scanned) concurrently alongside JavaScript. If JS mutates a Black object to point to a White object mid-mark, a short **write barrier** before pointer writes marks the White target Grey or updates the `RememberedSet` (Old → New pointers). If rapid promotions outpace concurrent marking, V8 stops the main thread for a Major Mark-Sweep-Compact—spiking pause times into tens of milliseconds.

::: diagram dg-gc keys=dg.gc
cap: Figure 8. Orinoco's generational heap. Young Gen copies rare survivors from From-space to To-space (or marks in-place with MinorMS); survivors promote to OldSpace while write barriers track Old-to-New edges.
aria: Diagram: YoungGen semi-spaces From and To with promotion arrow down to OldSpace tri-color marking and write barrier back-edge
yg: Young Gen (Scavenger / MinorMS)
from: From-space
to: To-space
promo: Survive 2 → Promote
wb: Write Barrier (Old → New)
og: Old Gen (Mark-Sweep-Compact)
tri: Tri-color: White → Grey → Black
conc: Concurrent mark + incremental sweep
:::

::: lab ch8-model
model.title: Orinoco generational promotion & GC pause spikes
model.how: Raise allocation rate or survival rate, click Step 10 Ticks, and compare sub-millisecond Scavenger / MinorMS pauses against OldSpace-triggered Major Mark-Compact spikes.
ctl.alloc: Alloc rate (KiB/tick)
ctl.surv: Survival rate (%)
ctl.mode: Young collector
mode.scav: Scavenger (semi-space)
mode.minorms: MinorMS (mark-sweep)
ctl.step: Step 10 ticks
ctl.major: Force Major GC
ctl.reset: Reset heap
cv.aria: Young and Old generation fill bars alongside a pause-time bar history chart
cv.x: Simulation tick
cv.y: Stop-the-world pause (ms)
cv.newbar: NewSpace
cv.oldbar: OldSpace
read.new: NewSpace used
read.old: OldSpace used
read.pause: Last GC pause
read.max: Peak STW pause
say.scavenge: <em>Scavenger</em> copied only short-lived survivors for a {p} ms pause; OldSpace holds {old} KiB ({wb} write-barrier remembered edges).
say.minorms: <em>MinorMS</em> marks and sweeps NewSpace in place without reserving an empty half-space, trimming the latest STW pause to {p} ms.
say.major: <em>Major Mark-Compact triggered!</em> OldSpace filled and halted the main thread to mark and compact live objects, spiking pause time to {p} ms.
:::

The simulator scales OldSpace soft limits down to 8 MiB so Major Mark-Compact spikes appear within 10–30 ticks; production heaps grow dynamically with allocation rate and divert huge buffers directly into `LargeObjectSpace`. {.take}

## The event loop & microtask seam: when V8 yields back to the host {#ch9}

::: strings
toc: Event loop & microtask seam
:::

V8 itself knows nothing about `setTimeout`, network sockets, or screen refreshes. V8 owns only the JavaScript call stack and its **MicrotaskQueue**—and the host scheduler (`libuv` in Node or Blink in Chromium) cannot start the next macrotask until V8 drains every microtask. {.law}

Every turn begins when the host hands one callback to V8. Synchronous code executes until the call stack empties. Before returning control, V8 executes a **MicrotaskCheckpoint**: in Node.js, `process.nextTick` drains first, followed by all queued `Promise.then` and `queueMicrotask` jobs—including any new microtasks queued *while* draining. On host Node v{=node.ver}, our opening snippet prints strictly: `main.js (sync) -> nextTick -> Promise.then -> queueMicrotask -> setImmediate -> setTimeout(0)`. That yields a subtle trap: if a `Promise.then` recursively schedules another `Promise.then`, the call stack keeps clearing cleanly, yet V8 never exits `MicrotaskCheckpoint`, starving `setTimeout`, I/O, and UI rendering forever.

::: diagram dg-eventloop keys=dg.eventloop
cap: Figure 9. The seam between V8 and its host (libuv / browser). The host hands one callback at a time into the call stack, but V8 refuses to return until its MicrotaskCheckpoint empties.
aria: Diagram: V8 Call Stack and MicrotaskCheckpoint on the left communicating across the seam with libuv Timers, Poll, and Check phases on the right
v8: Inside V8 Engine
stack: Call Stack
stacks: Sync runs to empty
micro: MicrotaskCheckpoint
micros: Drains microtasks
host: Host (libuv)
timers: Timers
poll: Poll (I/O)
check: Check
macro: Macrotasks
seam: Seam: host waits until microtasks drain
:::

::: lab ch9-model
model.title: Event loop turn & microtask starvation stepper
model.how: Pick a scenario (standard turn, nested microtasks, or infinite Promise starvation) and click Step repeatedly to watch MicrotaskCheckpoint drain completely before any macrotask runs.
ctl.scen: Turn scenario
sc.std: Standard turn (Node v26)
sc.nest: Nested microtasks (depth 2)
sc.starve: Recursive Promise starvation
ctl.step: Step turn
ctl.reset: Reset queues
cv.aria: Live state of V8 Call Stack, nextTick queue, Promise microtask queue, and libuv macrotask phases
cv.stack: Call Stack
cv.next: nextTick
cv.micro: Microtasks
cv.macro: Macrotasks
cv.exec: Executed
phase.sync: Sync
phase.nextTick: nextTick Queue
phase.microtask: MicrotaskCheckpoint
phase.starved: Starved
phase.macrotask: Host Macrotask
phase.done: Done
read.phase: Active phase
read.micro: Microtasks left
read.macro: Macrotasks left
read.done: Executed tasks
say.running: Step {step} executing in <em>{phase}</em>: as long as any item remains in the left microtask queues, V8 holds control inside <code>MicrotaskCheckpoint</code>.
say.starved: <em>Microtask starvation!</em> Each <code>Promise.then</code> appends another microtask, locking V8 inside <code>MicrotaskCheckpoint</code> so <code>setImmediate</code> and <code>setTimeout(0)</code> never execute.
say.done: Turn finished cleanly in strict order: <code>{order}</code>—every microtask settled before the first macrotask phase ran.
:::

The model reflects Node.js `process.nextTick` and libuv Check/Timers ordering; browsers omit `nextTick` and run `MicrotaskCheckpoint` after each task callback and before animation frames (and `setTimeout(0)` vs `setImmediate` ordering is host-specific). {.take}

## Where the frontier is (November 2026) {#ch10}

::: strings
toc: Where the frontier is (Nov 2026)
:::

By late 2026, V8 is retiring its decade-old Sea-of-Nodes IR in favor of Turboshaft and unifying Maglev with it, confining memory corruption inside a virtual-address Heap Sandbox, and shipping native stack switching for WebAssembly JSPI. {.law}

### Established {#h.est .sub3}

- Four-tier execution (Parser + Ignition → Sparkplug → mid-tier JIT → top-tier JIT), `Map` transition trees, 4-entry polymorphic Inline Caches spilling to megamorphic, strictly one-way `ElementsKind` transitions, Orinoco generational copying and concurrent tri-color marking with write barriers, and draining `MicrotaskCheckpoint` before host macrotasks are mature, established architecture. {#e1}
- **Pointer Compression** (shipping on 64-bit desktop builds since 2020, v8.dev) shrinks tagged references to 32-bit offsets inside a 4 GiB cage, halving heap pointer footprints and boosting cache line density. {#e2}

### Already built {#h.demo .sub3}

- **Maglev mid-tier JIT is standard infrastructure**: introduced around Chrome 117 (`v8.dev`, compiling roughly 10–100× faster than TurboFan). On host V8 {=v8.ver} / Node v{=node.ver} (checked 21 November 2026), `--maglev`, `--maglev-inlining`, and `--maglev-loop-peeling` are all enabled by default at 400 calls / 100 OSR iterations. {#d1}
- **Turboshaft CFG-based IR handles the backend**: in early 2025, V8 published *"Land ahoy: leaving the Sea of Nodes"* (`v8.dev`), moving away from TurboFan's rigid decade-old Sea-of-Nodes IR toward Turboshaft's cleaner control-flow graph. On host V8 {=v8.ver}, `--turboshaft` is enabled by default for JS backend phases and WebAssembly. {#d2}
- **The V8 Heap Sandbox shipped in Chrome**: graduated to official status in Chrome 123 (`v8.dev/blog/sandbox`, 4 April 2024) and integrated into Chrome's Vulnerability Reward Program. It isolates V8 heap memory and external pointer tables inside a dedicated virtual address region so heap corruption cannot overwrite host process memory (note: server CLI builds can disable it, e.g., `v8_enable_sandbox = 0` on host Node v{=node.ver}). {#d3}
- **WebAssembly JSPI (JavaScript Promise Integration) shipped**: using native V8 stack switching (`new WebAssembly.Suspending(fn)` and `WebAssembly.promising(fn)`), synchronous Wasm code can suspend on JS Promises without whole-program Asyncify rewrites. Shipped in Chrome 137+ and verified live (`function`) on host V8 {=v8.ver} / Node v{=node.ver}. {#d4}

### Specifications, plans & experimental flags {#h.claim .sub3}

- **Turbolev (Maglev frontend + Turboshaft backend)**: visible directly in host V8 {=v8.ver} flags as `--turbolev` ("use Turbolev (≈ Maglev + Turboshaft combined) as the 4th tier compiler instead of Turbofan"), currently `--no-turbolev` by default as an evolving replacement path for TurboFan's frontend. {#c1}
- **MinorMS (Young Gen Mark-Sweep)**: controlled by `--minor-ms` (default `--no-minor-ms` in host V8 {=v8.ver}, alongside `--concurrent-minor-ms-marking`), designed to mark and sweep NewSpace in place rather than reserving an empty Scavenger semi-space on memory-constrained devices. {#c2}

Open problems remain: deeply polymorphic library wrappers still trip megamorphic fallbacks and deopt loops; external pointer table indirections inside the V8 Heap Sandbox carry measurable boundary cost for tight DOM/Wasm interop; and ECMAScript microtask semantics leave infinite promise recursion indistinguishable from valid asynchronous loops until stalled.

Release flags and defaults keep moving: every version string and flag status in this chapter reflects **November 2026** measurements on V8 {=v8.ver} and the cited public sources. {.take}

## Wrap-up: when JavaScript is slow or stutters, ask three questions {#ch11}

::: strings
toc: Wrap-up: ask three questions
:::

You do not need to memorize V8's C++ flags. When JS code drops frames or stalls, ask three questions: Are shapes and inline caches holding steady? Are deopts or holey arrays blocking native loops? Or are allocations and microtasks choking GC and the event loop? {.law}

{.qs}
- **Are object shapes and ICs holding steady?** Initialize object keys in the exact same order, declare fields upfront in constructors or classes (chapter 3), never `delete` properties on hot objects, and avoid routing 5+ different shapes through a single hot read site (chapter 4). {#q1}
- **Is anything tripping deopts or one-way array traps?** Keep hot variables type-stable so `CheckSmi` and `Add` guards never bail back to Ignition (chapter 6), and avoid sparse assignments or mixed element types—truncating `.length` afterward never restores `PACKED_SMI_ELEMENTS` (chapter 7). {#q2}
- **Are allocations or microtasks choking GC and the loop?** Hot loops leaking boxed floats or short-lived objects accelerate OldSpace promotion toward tens-of-milliseconds Major Mark-Compact pauses (chapter 8), while recursive `Promise.then` chains starve timers and frames inside `MicrotaskCheckpoint` without throwing an error (chapter 9). {#q3}

In one sentence: V8 is not a line-by-line translator; it is a speculative engine that starts fast in bytecode, bets on steady shapes and types via feedback slots, compiles native offsets with cheap guards, and safely reconstructs interpreter frames whenever reality breaks the bet. {#sum .sum}

Related hardware essays: [[how-a-cpu-runs-a-program]] (machine instructions, registers, and pipelines), [[how-cpu-caches-work]] (why pointer compression and packed arrays saturate cache lines), [[how-a-cpu-guesses-ahead]] (hardware branch speculation vs JIT guards), and [[how-a-cpu-does-math]] (how IEEE-754 floats live inside `HeapNumber` boxes). {#links}

::: footer
**Sources.** Host binary inspected: Node.js v{=node.ver} bundling **V8 {=v8.ver}** (macOS arm64, checked 21 November 2026 via `--help --v8-options`, `--allow-natives-syntax`, `--print-bytecode`, `--trace-opt`, `--trace-deopt`, `--trace-gc`, and `v8.getHeapStatistics()`). Architecture & frontier documentation: V8 official blog *Ignition: An Interpreter for V8* (2016), *Pointer Compression in V8* (2020), *Sparkplug — a non-optimizing JavaScript compiler* (2021), *Maglev — V8's Fastest Optimizing JIT* (2023), *The V8 Sandbox* (2024-04-04), *Land ahoy: leaving the Sea of Nodes* (2025), *JavaScript Promise Integration (JSPI)*, and *Orinoco* GC design notes (v8.dev/blog/trash-talk); ECMA-262 specification (Jobs and `HostEnqueuePromiseJob`) and Node.js / `libuv` event-loop documentation.

**The models.** The page loads neither external libraries nor V8 itself. The 4-tier pipeline, tagged word encoding, hidden-class transition tree, LoadIC slot machine, real Ignition bytecode stepper, deoptimization trace, one-way `ElementsKind` lattice, Orinoco generational GC, and event-loop microtask seam are all reimplemented deterministically in `models.js`; `tools/crosscheck.cjs` executes `/opt/homebrew/bin/node` directly and verifies 47 behavioral boundaries and debug outputs against the models (recorded in `BRIEF.md`). Nanosecond timing defaults in chapters 1, 4, and 7 are measured host reference values on Apple arm64 and act purely as adjustable/calibrated parameters. Written by Antigravity.
:::
