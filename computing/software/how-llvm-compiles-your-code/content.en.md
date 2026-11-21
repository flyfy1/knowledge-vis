---
lang: en
title: How LLVM Compiles Your Code · A Hands-on Essay
desc: What actually happens inside clang -O2 sum.c between C syntax and AArch64 or x86_64 instructions? Verified directly against host Apple Clang 21.0.0 (LLVM 21), this essay traces the entire chain: the N+1+M decoupled pipeline, -O0 stack allocas, SSA phi insertion via dominance frontiers, fixed-point pass iteration, loop hoisting and SIMD vectorization, Undefined Behavior (nsw / poison), instruction selection, register allocation, ThinLTO, and the November 2026 frontier.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.x: {v}×
u.none: none
:::

# How LLVM Compiles Your Code {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

You type <code>clang -O2 sum.c -o sum</code>, and milliseconds later an executable binary sits on disk.<br>In between, how many times does LLVM tear apart and reassemble your code? {.sub}

When writing C, C++, Rust, or Swift, it is tempting to treat the compiler as an opaque box: source text enters on the left, machine bytes fall out on the right. Yet the moment you hit a baffling surprise—why <code>-O2</code> deleted your safety check, why adding <code>restrict</code> tripled loop speed, or why adding a few extra local variables caused performance to fall off a cliff—the black box stops helping. This essay follows a single question: **inside <code>clang -O2 foo.c</code>, what happens between frontend syntax and hardware machine code?** We trace the real pass pipeline in execution order: turning stack slots into Single Static Assignment (SSA) values, iterating tiny passes to a fixed point, using loop invariance, aliasing, and Undefined Behavior to unlock aggressive transforms, tiling expressions onto target instructions, coloring an interference graph into finite CPU registers, and breaking file boundaries at link time. {.lead}

Every intermediate representation (IR), pass pipeline dump, and assembly sequence in this essay was verified directly against host **Apple Clang 21.0.0** (<code>clang-2100.4.1.1</code>, target <code>arm64-apple-darwin27.2.0</code>, built on **LLVM 21**). One honest constraint: macOS Xcode Command Line Tools provides the <code>/usr/bin/clang</code> driver without standalone <code>opt</code> or <code>llc</code> CLI binaries, so every live check drives <code>/usr/bin/clang -S -emit-llvm</code>, <code>-mllvm</code>, and <code>-flto=thin</code> directly. The page embeds no compiler binaries; all nine interactive labs implement the exact core algorithms (dominance frontiers, graph coloring, linear scan, instruction tiling) in dependency-free JavaScript and check them against Clang. For hardware foundations below the compiler boundary, see [[how-a-cpu-runs-a-program#ch1|ISAs and machine code]] and [[switches-that-compute#ch1|logic switches that compute]]. {.note}

## The 3-Phase Decoupled Architecture: Why Clang and Rustc Share One Middle-End {#ch1}

::: strings
toc: The 3-phase architecture
:::

LLVM splits compilation into frontends, one shared middle-end optimizer, and target backends: N source languages lower into one strongly typed LLVM IR, share a single optimization suite, and target M CPUs—turning N × M separate compilers into N + 1 + M interfaces. {.law}

Here is the tiny six-line C loop we will trace across the pipeline. In <code>clang -O2</code>, lexing, parsing, and AST type-checking finish right at the start; immediately afterward the frontend emits a strongly typed, infinite-register textual representation called **LLVM IR**.

::: html ch1-code
code.aria: A minimal C array summation compiled with clang -O2
code: "int sum_array(const int *restrict a, int n) {\n  int s = 0;\n  for (int i = 0; i < n; i++) {\n    s += a[i];\n  }\n  return s;\n}"
:::

Without a shared IR, supporting {=ch1.frontends} languages across {=ch1.backends} CPU architectures demands {=ch1.monoPairs} independent compiler pipelines—and writing 10 core passes across every pair means maintaining {=ch1.monoPasses} pass copies. LLVM inserts a single **target-independent, typed intermediate language** in the middle. Frontends such as Clang, Rust (<code>rustc</code>), Swift, and Julia only convert source semantics into LLVM IR; those {=ch1.llvmPasses} middle-end passes are written once on that IR; and each backend lowers IR across {=ch1.llvmEdges} total frontend/backend bridge interfaces into its own instruction set.

::: diagram dg-arch keys=dg.arch
cap: Figure 1. LLVM's decoupled 3-phase design (schematic). Diverse language frontends converge onto one opaque-pointer (<code>ptr</code>) LLVM IR, share middle-end passes, and split out to hardware backends.
aria: Diagram: three language frontends feeding a central LLVM IR optimizer block, fanning out to three hardware backends
f1: Clang
f2: Rustc
f3: Swift / Julia
opt: Passes
sum: N + 1 + M interfaces replace N × M pairs
:::

In LLVM 21 (including Apple Clang 21.0.0), this IR carries a major modern simplification: **pointers have no pointee types**. Instead of older typed pointers like <code>i32*</code>, every pointer parameter and slot is simply an opaque <code>ptr</code>, while memory instructions such as <code>load i32, ptr %p</code> explicitly carry the loaded value type. Dropping pointer types eliminated mountains of pointless <code>bitcast</code> instructions and made optimization passes faster and cleaner (chapter 10 tracks the timeline).

::: lab ch1-model
model.title: Monolithic N × M vs Decoupled N + 1 + M Compiler Matrix
model.how: Drag frontends N, backends M, and shared optimization passes P to compare maintaining dedicated N × M pipelines against LLVM's shared middle-end; toggle the checkbox to compare graph edges.
ctl.fe: Frontends N
ctl.be: Backends M
ctl.pass: Optimizer passes P
ctl.mono: Compare monolithic N × M
cv.aria: Graph comparing monolithic all-to-all compilers with LLVM's IR hub and component totals
cv.mono: Monolithic: N × M pipelines
cv.llvm: LLVM: N -> IR -> M hub
cv.bars: Total modules to maintain (lower is better)
read.mono: Monolithic modules
read.llvm: LLVM modules
read.passes: Active pass copies
read.ratio: Duplication factor
say.mono: With {n} languages, {m} targets, and {p} passes: without a shared middle-end you maintain <em>{pairs} compiler pairs</em> and {mp} pass copies, totaling <em>{mc} modules</em>—{ratio}× more work than LLVM's {lc}.
say.llvm: Connecting {n} languages to {m} targets through one LLVM IR takes only <em>{edges} bridge edges</em> and <em>{lp} shared passes</em> ({lc} total modules, shrinking {mc} by {ratio}×).
:::

In practice, the wall between middle-end and backend is slightly porous. Through <code>TargetTransformInfo</code> and the module's <code>target datalayout</code> string, the middle-end still peeks at pointer sizes, register widths, and SIMD lane counts when deciding how aggressively to unroll or vectorize. Even so, decoupling general dataflow analysis from instruction encoding is why so many languages hit peak native speed without building bespoke code generators.

The model omits differences in frontend AST complexity, language-specific middle-end intrinsics (such as Swift ARC or Rust borrow lowering), and target-specific heuristic hooks inside shared passes. {.take}

## From AST to `-O0` IR: Why Local Variables Start on the Stack {#ch2}

::: strings
toc: From AST to -O0 allocas
:::

When a frontend emits initial LLVM IR, it avoids complex dataflow analysis altogether—dumping every parameter and local variable into an explicit stack slot with <code>alloca</code> and emitting memory loads and stores on every touch. {.law}

Why do unoptimized <code>-O0</code> binaries run so slowly? Compile our six-line <code>sum_array</code> with <code>/usr/bin/clang -S -emit-llvm -O0</code> and inspect the entry block: Clang immediately reserves {=ch2.allocas} separate stack slots ({=ch2.stackBytes} bytes) via <code>alloca</code> for <code>a</code>, <code>n</code>, <code>s</code>, and <code>i</code>. Inside every loop iteration, it loads <code>i</code> from the stack, adds 1, stores <code>i</code> back to the stack, loads <code>s</code>, loads <code>a[i]</code>, adds them, and stores <code>s</code> back into the stack.

::: diagram dg-alloca keys=dg.alloca
cap: Figure 2. How <code>-O0</code> and <code>-O2</code> treat local variables: frontends map every mutable variable to a stack slot (<code>alloca</code>), leaving middle-end passes to promote them into virtual registers.
aria: Diagram: left side shows -O0 stack alloca with repeated loads and stores; right side shows -O2 SSA registers and phi nodes
left: -O0: stack slots
slot: Reserves stack bytes
mem: Load/store every step
right: -O2: SSA vregs
vreg: No stack slot
nomem: Zero stack ops
:::

Frontends stay intentionally naive here for correctness and modularity. If Clang's AST walker tried to track which branch last overwrote variable <code>x</code> while simultaneously handling C++ destructors, switch fallthrough, and variable shadowing, every language frontend would have to reimplement SSA construction. Memory slots act as universal mutable boxes: as long as every variable owns an address, mechanical <code>load</code> and <code>store</code> generation is trivially sound.

::: lab ch2-model
model.title: -O0 Stack Slots vs -O2 Register Promotion
model.how: Pick a function and drag iteration count to compare -O0 stack memory traffic (alloca loads and stores) against register-promoted code; inspect live Apple Clang 21.0.0 IR excerpts below.
ctl.snip: Function snippet
snip.sum_array: sum_array (loop)
snip.pick_phi: pick_phi (branch)
ctl.iter: Loop iterations
ctl.promo: Promote locals (-O2 mode)
cv.aria: Line chart comparing cumulative -O0 stack memory accesses against -O2 across loop iterations
cv.x: Loop iterations
cv.y: IR memory ops
cv.o0: -O0 (with stack allocas)
cv.o2: -O2 (array loads only)
code.o0: Live -O0 IR (stack allocas)
code.o2: Live -O2 IR (promoted)
read.alloc: Active allocas
read.stack: Stack slot ops
read.mem: Total memory ops
read.insn: IR instructions
say.o0: At <code>-O0</code>, {allocas} local slots occupy {bytes} stack bytes: running {it} iterations executes <em>{stack} redundant stack loads/stores</em> plus {arr} array loads ({total} total memory ops).
say.o2: After register promotion, <code>alloca</code> drops to zero: all {stack} local stack accesses vanish, leaving only the {arr} true array loads—cutting <em>{saved} memory ops</em> compared to -O0's {o0}.
:::

Over just 8 iterations in our default loop, <code>-O0</code> executes {=ch2.o0Mem} IR memory ops while real work needs only {=ch2.o2Mem} array loads—wasting {=ch2.savedMem} stack round-trips purely shuffling local variables.

The model omits hardware L1 data caches and store-to-load forwarding buffers (which hide part of <code>-O0</code>'s latency on real silicon) as well as unrolled vector expansion at <code>-O2</code>. {.take}

## Static Single Assignment (SSA) & `mem2reg`: Where `phi` Nodes Live {#ch3}

::: strings
toc: SSA form and mem2reg
:::

Static Single Assignment requires every virtual register to be defined exactly once; when control paths assign different versions and rejoin, <code>mem2reg</code> inserts a <code>phi</code> instruction at the dominance frontier to select the incoming value. {.law}

Promoting straight-line <code>alloca</code> code is easy: <code>x = 1; x = x + 2;</code> simply renames to <code>%x.0 = 1; %x.1 = add %x.0, 2</code>. The catch appears at an <code>if-else</code> diamond: if the left branch sets <code>x = b * 2</code> and the right branch sets <code>x = a - 3</code>, which virtual register should <code>return x + 5</code> read after the paths merge?

LLVM solves this with two tightly coupled rules. First, **Static Single Assignment (SSA)**: every virtual register (<code>%x.0</code>, <code>%x.1</code>, ...) has **at most one definition** in the function. Finding where an operand came from becomes an immediate pointer jump rather than scanning backward through basic blocks to make sure nothing overwrote it. Second, the **<code>phi</code> node**: placed at the top of a merge block, <code>%x.3 = phi i32 [ %x.1, %B1 ], [ %x.2, %B2 ]</code> picks <code>%x.1</code> if control arrived from <code>%B1</code>, or <code>%x.2</code> if control arrived from <code>%B2</code>.

::: diagram dg-ssa keys=dg.ssa
cap: Figure 3. Diamond Control-Flow Graph (CFG) and dominance frontier. Block B0 dominates B1, B2, and B3, whereas neither B1 nor B2 dominates B3—making B3 their dominance frontier where <code>mem2reg</code> inserts a <code>phi</code> node.
aria: Diagram: CFG diamond from entry B0 through B1 and B2 to merge block B3 marked as dominance frontier with a phi node
df: Dominance frontier (insert phi)
:::

**How does the compiler know exactly which blocks need a `phi`?** Using **Dominance Frontiers** (Cytron et al., 1991). Block <code>X</code> dominates block <code>Y</code> if every path from the entry block to <code>Y</code> must pass through <code>X</code>. Block <code>Y</code> lies in <code>X</code>'s dominance frontier if <code>X</code> dominates a predecessor of <code>Y</code> without strictly dominating <code>Y</code> itself (for instance, <code>then</code> feeds <code>merge</code>, yet <code>entry</code> can bypass <code>then</code> via <code>else</code>). That boundary is precisely where a definition inside <code>X</code> collides with an alternate path, requiring a <code>phi</code>. In host Apple Clang 21.0.0's optimization pipeline, <code>SROAPass</code> handles aggregate splitting and promotes non-escaped stack slots directly into SSA form.

::: lab ch3-model
model.title: Dominance Frontier Calculator & SSA phi Inserter
model.how: Switch between four CFG topologies (diamond, if-then, loop back-edge, and chained branches) and toggle mem2reg to watch the real dominance-frontier and stack-renaming algorithm place [DF] phi nodes and erase stack accesses.
ctl.cfg: CFG topology
cfg.diamond: Diamond if-else
cfg.ifThen: Single if-then
cfg.loop: Loop back-edge
cfg.chained: Chained blocks
ctl.pass: Run mem2reg / SROA
cv.aria: Control-flow graph showing basic blocks, edges, dominance frontiers, and renamed SSA versions
read.phi: Inserted phi nodes
read.ver: SSA versions created
read.mem: Remaining stack ops
read.df: Dominance frontier
say.ssa: The renaming walk places <em>{phis} phi node(s)</em> at dominance frontier <em>{df}</em> and mints {vers} single-assignment versions, collapsing {bmem} stack accesses down to <em>{amem}</em>.
say.alloca: Without <code>mem2reg</code>, both branches mutate the same stack slot, forcing <em>{bmem} memory loads and stores</em> across the merge.
:::

Switch the model to **Loop back-edge**: a `phi` appears at the loop `header` because `body` jumps backward into `header` without dominating it (entry arrives from `B0` on iteration zero). In the default diamond, {=ch3.phiCount} `phi` node eliminates all {=ch3.beforeMem} stack ops down to {=ch3.afterMem}.

The model omits address-taken variables (when `&amp;x` escapes to an unknown pointer): any `alloca` whose pointer might be aliased must stay on the stack unless scalar replacement can prove every access offset. {.take}

## The Pass Pipeline: Iterating Tiny Rules to a Fixed Point {#ch4}

::: strings
toc: Fixed-point pass pipeline
:::

LLVM's optimizer is not one giant brain; it is a queue of focused passes where one pass exposes algebraic constants that let the next pass prune dead control flow, repeating until a full sweep makes zero changes—the fixed point. {.law}

Consider this tiny function, representative of code produced after C macro or C++ template expansion:

<pre class="code">int dead_branch(int x) {
  int a = x * 2 + 0;
  int b = a - a;
  if (b != 0) return 999;
  return a + 3;
}</pre>

No single pass finishes the job alone. <code>SROA</code> removes stack allocations; <code>InstCombine</code> handles local algebra (rewriting <code>x * 2</code> to shift-left <code>shl 1</code>, dropping <code>+ 0</code>, folding <code>a - a</code> to <code>0</code>, and turning <code>icmp ne 0, 0</code> into constant <code>false</code>), yet leaves basic blocks intact; <code>SimplifyCFG</code> sees <code>br i1 false</code> and deletes the unreachable <code>999</code> block while fusing the entry and exit blocks; finally <code>ADCE</code> sweeps away dead values.

::: diagram dg-pipeline keys=dg.pipeline
cap: Figure 4. Middle-end pass loop in LLVM's New Pass Manager. Each pass matches simple local idioms, exposing cleanups for its neighbors until the IR reaches a fixed point.
aria: Diagram: SROA, InstCombine, SimplifyCFG+GVN, and ADCE chained with a dashed feedback loop to fixed point
p1: Promote allocas
p2: Fold & combine
p3: Prune CFG & GVN
p4: Sweep dead code
fix: Fixed point
:::

On host Apple Clang 21.0.0 (`-mllvm -debug-pass=Structure` and `-mllvm -print-after=instcombine`), `dead_branch` shrinks from {=ch4.startOps} unoptimized IR ops across {=ch4.rounds} major pass stages down to just {=ch4.endOps} live ops (`shl nsw`, `add nsw`, and `ret`), erasing `999` completely from the compiled binary.

::: lab ch4-model
model.title: Fixed-Point Optimization Pass Stepper
model.how: Choose an IR snippet and click "Step Next Pass" to watch individual rules shrink instructions round by round, or click "Run to Fixed Point" to jump to convergence.
ctl.pre: IR snippet
pre.dead_branch: Algebra & dead branch
pre.inline_fold: Inline & constant fold
pre.cse_chain: Common subexpr (GVN)
ctl.step: Step Next Pass
ctl.fix: Run to Fixed Point
ctl.reset: Reset to -O0
cv.aria: Stage progress strip and live LLVM IR lines colored by optimization status
read.round: Current stage
read.ops: Remaining IR ops
read.mem: Local stack ops
read.state: Convergence
state.fixed: Fixed point reached
state.active: More passes apply
detail.raw: Fresh from frontend: stack slots and dead arithmetic clutter the IR.
detail.sroa: SROA promotes local stack variables into SSA registers, cutting memory traffic to 0.
detail.instcombine: InstCombine rewrites *2 to shl 1, collapses a-a to 0, and proves the branch false.
detail.simplifycfg: SimplifyCFG deletes the unreachable 999 branch and fuses basic blocks.
detail.inline: Inlining copies callee ops into the caller, exposing constant inputs 10 and 12.
detail.fold: Constant folding evaluates 10*3+12 at compile time down to a single ret 42.
detail.gvn: GVN spots duplicate a*b computations and deletes the redundant multiplication.
detail.instcombine_cse: InstCombine turns adding a value to itself into shl 1, reaching the fixed point.
say.step: After <em>{pass}</em>: {ops} IR instructions remain ({removed} removed from initial {start}). {detail}
say.fixed: Fixed point reached at <em>{pass}</em>: the function shrank from {start} instructions down to <em>{ops}</em>. {detail}
:::

This "many small passes in cycles" architecture explains why compile time jumps between `-O2` and `-O3`: passes rely on simple local pattern matchers (LLVM's `InstCombine` alone spans tens of thousands of lines of rules) and need repeated sweeps so earlier simplifications trigger later ones.

The model omits LLVM's CGSCC pass-manager invalidation (`PreservedAnalyses`), heuristic inline cost budgets, and `InstCombine`'s internal worklist iteration. {.take}

## Loop Optimizations: LICM, Pointer Aliasing, and SIMD Vectorization {#ch5}

::: strings
toc: Loop hoisting, aliasing & SIMD
:::

Loops dominate runtime, yet whether LLVM can hoist invariant work out of a loop (LICM) or pack iterations into 4-wide SIMD vector lanes depends first on proving that pointers cannot alias in memory. {.law}

Look at this three-line loop (nearly identical to our live `hoist_demo` vs `hoist_restrict` probe):

<pre class="code">for (int i = 0; i &lt; n; i++) {
  out[i] = a[i] + (*b * 2);
}</pre>

Intuitively, `*b * 2` stays constant across all `n` iterations: LLVM should compute it once in the loop **Preheader**, keep it in a register, and vectorize the loop into `&lt;4 x i32&gt;` ARM64 NEON additions (as covered in [[how-a-cpu-does-math#ch9|SIMD instructions]] and [[how-a-cpu-does-math#ch10|when compilers auto-vectorize]]). Yet inspecting Apple Clang 21.0.0's `-O2` IR on `hoist_demo` reveals a critical catch. Because `a`, `b`, and `out` all point to `int` without `restrict`, Clang cannot statically prove that writing `out[0]` does not overwrite `*b`! If `*b` changed on step 0, hoisting it outside would miscompile step 1. As a result, Clang emits a **runtime pointer-overlap check** (`icmp ult ptr`) before the loop: if ranges do not overlap, execution enters a fast vectorized path; if they do overlap, it falls back to a scalar loop reloading `*b` on every iteration. Adding `restrict` (`ptr noalias` in IR) removes the runtime guard completely.

::: diagram dg-licm keys=dg.licm
cap: Figure 5. Three-part optimized loop layout: LICM hoists invariant <code>*b * 2</code> into the preheader, LoopVectorize widens the body into 128-bit <code>&lt;4 x i32&gt;</code> lanes, and a scalar tail handles leftovers.
aria: Diagram: preheader block computing invariant once, vector loop processing four integers per iteration, scalar tail for remainder
pre: Preheader (runs once)
vec: Vector loop (4× per step)
tail: Scalar epilogue tail
taild: Handles remaining N mod 4 items
:::

**Type-Based Alias Analysis (TBAA)** provides a second escape hatch: under C/C++ strict aliasing rules, pointers to incompatible types (such as `float*` and `int*`) are assumed not to alias, unlocking unconditional hoisting without `restrict`. On `n = 20` elements with 4-lane NEON, {=ch5.unoptOps} unoptimized loop ops drop to {=ch5.vecIters} vector batches ({=ch5.vecOps} total ops).

::: lab ch5-model
model.title: LICM Hoisting, Alias Guards & SIMD Lane Packing
model.how: Drag array size N, pick vector width (1 / 4 / 8 lanes), and switch pointer aliasing assumptions (may-alias vs restrict vs TBAA) to inspect runtime overlap guards, invariant *b reloads, and vector speedup.
ctl.n: Array length N
ctl.alias: Alias assumption
alias.unknown: No restrict (may alias)
alias.restrict: restrict (noalias)
alias.tbaa: Distinct type (TBAA)
ctl.vf: Vector width VF
vf.1: Scalar (1)
vf.4: NEON <4×i32>
vf.8: AVX2 <8×i32>
ctl.licm: Enable LICM hoist
ctl.ov: Runtime pointer overlap occurs
cv.aria: Preheader hoist box, runtime alias guard, vector/scalar lane packing, and total operation comparison
cv.pre: Preheader & runtime check
cv.hoist_ok: Preheader: hoisted *b*2
cv.hoist_no: Not hoisted: reloads *b in loop
cv.ov_hit: Overlap hit: scalar fallback
cv.ov_ok: Guard passed: fast vector path
cv.lanes: First {k} / {n} element packing
cv.cost: Unoptimized ops (red) vs current (green)
read.reloads: In-loop *b reloads
read.vec: Vector iterations
read.tail: Scalar tail iters
read.ops: Effective loop ops
why.static: Compile-time noalias or TBAA lets LLVM hoist and vectorize with zero runtime guard.
why.guarded: Without restrict, Clang inserts runtime bounds comparisons before picking the fast loop.
why.fallback: Runtime overlap occurred, so the guard forces execution onto the scalar reload path.
why.unopt: With LICM off and VF = 1, every single iteration reloads and recomputes the invariant.
say: Across {n} elements at <em>{vf}×</em> width: {vec} vector batches plus {tail} scalar tail steps, reloading *b <em>{rel} time(s)</em> for {ops} ops (vs {base} unoptimized, {speed}× fewer). {why}
:::

On host Apple Clang 21.0.0, `sum_array` goes one step further: it interleaves the <code>&lt;4 x i32&gt;</code> vector loop by **4×** (`ldp q4, q5` + `ldp q6, q7` loading 16 integers per iteration into four independent `add.4s` accumulators), hiding instruction latency before reducing once with `addv.4s` at loop exit.

The model omits interleave unrolling factors, strided gather/scatter penalties, alignment peeling loops, and floating-point non-associativity blocking vector reductions without `-ffast-math`. {.take}

## Undefined Behavior (`poison`): Why Optimizers Delete Safety Checks {#ch6}

::: strings
toc: UB (poison) & deleted checks
:::

C/C++ declares signed integer overflow and null dereferences Undefined Behavior; LLVM encodes this as <code>add nsw</code> and <code>poison</code> values, giving optimizers license to prove safety checks tautologically true and delete them completely. {.law}

Most programmers assume signed integer addition simply wraps around in two's complement—on hardware, adding 1 to 32-bit `INT_MAX` ({=ch6.intMax}) indeed rolls over to `INT_MIN` ({=ch6.intMin}), making <code>x + 1 &gt; x</code> false. Putting <code>if (x + 1 &gt; x)</code> in C looks like a reasonable overflow guard.

Under `clang -O2`, the opposite happens. Because signed overflow in C is **Undefined Behavior (UB)**, Clang attaches the **`nsw`** (No Signed Wrap) flag to IR addition: `%1 = add nsw i32 %x, 1`. If that addition wraps signed bounds, its LLVM result is not `INT_MIN`—it is **`poison`**, a contagious undefined value. Because branching on or relying on `poison` is illegal for any valid program, the optimizer is permitted to assume signed overflow never happens. Under that premise, <code>x + 1 &gt; x</code> is *always* true, so Apple Clang 21.0.0 folds the entire function down to **`ret i32 1`**!

::: diagram dg-ub keys=dg.ub
cap: Figure 6. Divergence at <code>x = INT_MAX</code> for <code>x + 1 &gt; x</code>: hardware arithmetic wraps negative (left), whereas <code>add nsw</code> yields <code>poison</code> and lets <code>-O2</code> fold the entire guard to 1 (right).
aria: Diagram: INT_MAX splits into hardware two's-complement wrap returning 0 vs LLVM nsw poison collapsing to ret 1
src: C code: x + 1 > x
hw: Wrap (-O0/-fwrapv)
hwres: Result = 0 (wrapped)
ir: LLVM IR (-O2)
irres: Folds to ret 1
:::

Even more revealing is compiling the exact same function with **`-O2 -fwrapv`** (defining two's-complement wrap) on Apple Clang 21.0.0: rather than keeping an addition and comparison, `InstCombine` algebraically simplifies <code>(x + 1) &gt; x</code> into **`%2 = icmp ne i32 %0, 2147483647`**—preserving the single boundary case where wraparound occurs!

::: lab ch6-model
model.title: How nsw Poison & Null Dereferences Erase Guards
model.how: Keep default x = INT_MAX at -O2 with nsw to see hardware return 0 while compiled IR returns 1; switch to -fwrapv or -O0 to restore exact wrap behavior. Then switch scenarios to observe a prior *p dereference deleting a later null check.
ctl.scen: UB scenario
scen.overflow: Signed overflow (x+1 > x)
scen.null: Deref before null check
ctl.mode: Semantics contract
mode.nsw: Standard C (nsw / UB)
mode.wrapv: -fwrapv (wrap-safe)
ctl.opt: Optimization level
opt.O0: -O0 (unfolded)
opt.O2: -O2 (aggressive)
ctl.x: Signed input x
ctl.pnull: Runtime pointer p = NULL
cv.aria: Number line near INT_MAX comparing hardware wraparound against LLVM -O2 constant folding
cv.fold: Folded to ret 1 (check deleted!)
cv.keep: Wrap boundary check preserved
cv.del: Whole if (!p) check deleted!
code.title: Equivalent emitted LLVM IR
read.hw: Hardware two's-complement
read.opt: Compiled binary result
read.poison: Triggers poison / UB
read.div: Hardware vs binary match
yes: Yes (poison)
no: No
div.yes: Diverges!
div.no: Matches
say.ov_bug: At x = {x}, hardware wraps to {w} and yields {hw}; yet <code>add nsw</code> treats overflow as <code>poison</code>, so <code>-O2</code> deleted the test and <em>returns {optv}</em>.
say.ov_ok: At x = {x}, hardware yields {hw} and the compiled binary returns <em>{optv}</em>—either because <code>-fwrapv</code>/-O0 preserved wraparound or this input did not overflow.
say.null_bug: Because <code>*p</code> already ran unconditionally, LLVM deduces p cannot be NULL and erases <code>if (!p)</code>; passing NULL crashes immediately at the load (SIGSEGV).
say.null_ok: Either the null guard survived optimization or the pointer is non-null, avoiding silent guard elimination.
:::

The classic real-world sibling of this bug is dereferencing a pointer (`int v = *p;`) just before checking `if (!p) return 0;`—a real Linux kernel vulnerability pattern. Because `*p` would already be UB if `p == NULL`, `-O2` proves `p` is non-null and strips the defensive branch right out of the binary.

The model omits older `undef` semantics (progressively replaced by `poison` and `freeze` across modern LLVM) and loop trip-count induction bounds inferred from `nsw`. {.take}

## Instruction Selection: `SelectionDAG` & `GlobalISel` Pattern Matching {#ch7}

::: strings
toc: Instruction selection
:::

Optimized IR still speaks in idealized hardware-neutral operators; instruction selection covers each expression DAG with target-specific tiles so multi-op IR subgraphs collapse into single CPU instructions like ARM64 <code>madd</code> or x86_64 <code>leal</code>. {.law}

IR emerging from the middle-end looks fine-grained: indexing `a[i] + c` takes separate nodes for sign-extension (`sext`), scaled pointer indexing (`getelementptr`), memory read (`load`), and addition (`add`). Translating one IR operator per machine instruction would waste registers and cycles.

LLVM's backend runs **DAG Tiling (Pattern Matching)**: each basic block becomes a **SelectionDAG** (Directed Acyclic Graph) covered by TableGen target patterns that absorb as many IR nodes per machine instruction as possible. Verified verbatim on Apple Clang 21.0.0: `a * b + c` lowers to **{=ch7.armFma} core instruction** on ARM64 (`madd w0, w1, w0, w2`), whereas x86_64 lacks a 3-register integer multiply-add and needs **{=ch7.x86Fma}** (`imull` + `leal`). Flip to `x * 2 + 3` and x86_64 wins in one instruction (`leal 3(,%rdi,2), %eax`) while ARM64 uses two (`lsl` + `add`).

::: diagram dg-isel keys=dg.isel
cap: Figure 7. SelectionDAG tiling: the same <code>mul + add</code> subgraph collapses into one <code>madd</code> tile on AArch64, while x86_64 splits into multiply plus <code>lea</code>.
aria: Diagram: mul and add nodes wrapped in a dashed tile mapping to single-instruction AArch64 madd and two-instruction x86_64 imull plus leal
tile: Pattern tile (fuses ops)
:::

Live inspection via `/usr/bin/clang -mllvm -debug-pass=Structure` on Apple Silicon also reveals LLVM's dual selector architecture in action: at **`-O0`**, ARM64 uses **`GlobalISel`** (`irtranslator → legalizer → regbankselect → instruction-select`) to avoid slow SelectionDAG construction; at **`-O2`**, it switches back to **`SelectionDAG`** (`aarch64-isel` plus `machine-combiner`) to squeeze out maximum pattern density.

::: lab ch7-model
model.title: SelectionDAG Pattern Matcher (AArch64 vs x86_64)
model.how: Switch IR expressions, target ISA (AArch64 vs x86_64), and compound pattern fusion to see how multi-node DAG tiles collapse into live Apple Clang 21.0.0 assembly sequences.
ctl.pre: IR expression
pre.fma: a * b + c
pre.shiftAdd: a + (b << 2)
pre.arrayLoad: a[i] + c
pre.scaleConst: x * 2 + 3
ctl.arch: Target ISA
arch.arm64: AArch64 (Apple Silicon)
arch.x86_64: x86_64
ctl.fuse: Fuse compound patterns
cv.aria: Expression DAG nodes with dashed pattern-matching tile borders
cv.tile: Fused tile ({k} core insns)
cv.sep: 1-to-1 lowering ({k} core insns)
code.title: Live host Clang -S -O2 assembly output
read.ir: IR operators
read.mach: Core machine insns
read.saved: Saved by tiling
say.fused: Lowering <code>{expr}</code> onto <em>{arch}</em> with tiling packs {ir} IR ops into <em>{mach} machine instruction(s)</em>, saving {saved} instruction(s) over naive 1-to-1 lowering.
say.unfused: Without compound pattern matching, each IR node emits separately for <em>{mach} core instruction(s)</em>.
:::

Once these machine instructions reach the CPU, hardware executes them across decode, branch prediction, and out-of-order pipelines—see [[how-a-cpu-runs-a-program#ch3|compiling a loop to machine code]] and [[how-a-cpu-guesses-ahead#ch6|superscalar execution]].

The model omits type legalization (splitting `i64` on 32-bit targets), post-selection latency scheduling (`machine-scheduler`), and `GlobalISel` register-bank selection passes. {.take}

## Liveness, Interference Graphs & Greedy Register Allocation {#ch8}

::: strings
toc: Liveness & register allocation
:::

Instruction selection emits Machine IR using an unlimited pool of virtual registers; the allocator computes each value's live interval, builds an interference graph, and K-colors it onto finite CPU registers—spilling to the stack whenever live pressure exceeds K. {.law}

Machine IR right after instruction selection (`-mllvm -print-after=finalize-isel`) still cannot run on silicon: it names `%0:gpr32`, `%1:gpr32`, ..., with no upper bound on register count (`IsSSA`). Real hardware gives you only a small fixed set of architectural registers (such as `x0..x28` on ARM64, minus reserved ABI/stack registers).

First comes **Liveness Analysis**: each virtual register is live from its definition up to its last use, forming a **Live Interval**. Whenever two intervals overlap in time, they cannot share one physical register, so an edge connects them in the **Interference Graph**.

::: diagram dg-regalloc keys=dg.regalloc
cap: Figure 8. Overlapping live intervals form an interference graph. When four variables are live simultaneously (a K₄ clique) on a machine with <code>K = 3</code> registers, one variable cannot be colored and spills to the stack.
aria: Diagram: four overlapping live intervals on the left and a 4-node clique on the right colored with three registers and one red stack spill
left: Live intervals
peak: Peak live: 4
right: K=3 interference
spill: Spilled to [sp]
:::

Next is **Graph Coloring (Chaitin–Briggs)**: any node with fewer than `K` neighbors is trivially colorable—if we strip it onto a stack and color the rest first, at least one of the `K` colors is guaranteed free when it pops back off. When every remaining node has degree `≥ K`, the allocator picks a cheap victim to **spill** onto the stack frame (`str` after its definition, `ldr` before each use—just like `str w0, [sp, #60] ; 4-byte Folded Spill` in our live ARM64 probe).

::: lab ch8-model
model.title: Live-Interval Interference Graph & Register Allocator
model.how: Drag physical register budget K, switch between Chaitin-Briggs graph coloring and Poletto-Sarkar Linear Scan, and pick live-pressure scenarios to see spills erupt the instant simultaneous live values exceed K.
ctl.k: Physical registers K
ctl.algo: Allocator algorithm
algo.graph: Graph Coloring (Chaitin-Briggs)
algo.linear: Linear Scan
ctl.scen: Live pressure scenario
scen.diamond: Moderate (maxLive = 3)
scen.chain: Chained overlap (maxLive = 4)
scen.pressure: High pressure (maxLive = 6)
cv.aria: Synchronized live intervals on the left/top and colored interference graph on the right/bottom
cv.iv: Virtual register live intervals
cv.graph: Interference graph coloring
read.live: Peak simultaneous live
read.used: Physical regs used
read.spills: Spilled virtual regs
read.mem: Inserted str/ldr spills
say.fit: Using <em>{algo}</em> with {k} registers for peak pressure {live}: <em>every virtual register fits with zero spills</em>.
say.spill: With only {k} registers under peak pressure {live}, {algo} spills <em>{sp} register(s) ({spilled})</em>, inserting <em>{mem} extra</em> <code>str</code>/<code>ldr</code> stack accesses.
:::

Look at the default "Chained overlap" case whose peak concurrency is {=ch8.maxLive}: giving it `K = 4` registers yields {=ch8.spillsK4} spills, whereas dropping to `K = 3` immediately forces {=ch8.spillsK3} variable(s) onto the stack and injects {=ch8.spillInsnsK3} stack memory ops. That explains why giant inlined functions packed with dozens of live temporaries can suddenly fall off a performance cliff. For how hardware CPUs then rename those few architectural registers internally for out-of-order execution, see [[how-a-cpu-guesses-ahead#ch7|register renaming]].

As verified in host `-O2 -mllvm -debug-pass=Structure`, LLVM runs **`RegAllocGreedy`**, which improves plain graph coloring with **live-range splitting** (spilling only across congested sub-regions instead of whole functions) while `-O0` uses **`RegAllocFast`**. The model omits coalescing (`register-coalescer`), live-range splitting, and callee-saved save/restore costs (`stp x28, x27`). {.take}

## PGO & ThinLTO: Breaking Translation-Unit Walls at Link Time {#ch9}

::: strings
toc: PGO & ThinLTO cross-file opt
:::

Single-file compilation is blind to function bodies in other <code>.c</code> files; <code>-flto=thin</code> writes LLVM bitcode plus compact module summaries into <code>.o</code> files so the linker can selectively import and inline across file boundaries in parallel. {.law}

Put `add_mul(x, y)` in `b.c` and call `add_mul(10, 12)` from `main()` in `a.c` under standard separate `-O2`. Disassembling `bin_no_lto` from host Apple Clang 21.0.0 confirms why separate compilation stalls: `_main` loads `10` and `12` into `w0`/`w1` and branches (`b _add_mul`, taking {=ch9.noLtoMain} instructions in `main` plus 3 in `_add_mul`) simply because `a.c` never saw `b.c`'s body.

::: diagram dg-lto keys=dg.lto
cap: Figure 9. Separate compilation (top) vs ThinLTO (bottom): <code>-flto=thin</code> emits LLVM bitcode + summary indexes into object files, letting link-time optimization fold <code>add_mul(10, 12)</code> directly into <code>#42</code>.
aria: Diagram: top separate .o files emit machine code forcing bl call; bottom ThinLTO emits IR+summary and folds result to #42 at link time
sep: Separate -O2: blind linker
thin: ThinLTO: cross-TU import
call: Symbol only
body: IR bitcode
:::

Turn on **`-flto=thin`**, and `file tu_b_thin.o` reports **`LLVM bitcode, wrapper`** rather than ARM64 machine code. Each object holds middle-end IR alongside a tiny **Module Summary Index**. During the ThinLink step, the linker inspects only those lightweight summaries (avoiding Full LTO's monolithic {=ch9.fullMem} MB memory spike across 16 translation units), selects profitable cross-file imports, and dispatches parallel per-module workers (peaking at just {=ch9.thinMem} MB per worker instead of leaving all {=ch9.noLtoCalls} cross-file calls un-inlined). Disassembling `bin_thin` proves the payoff: `_main` collapses to {=ch9.thinLtoMain} instructions (`mov w0, #0x2a ; =42` and `ret`).

::: lab ch9-model
model.title: ThinLTO Summary Import, PGO Bias & Link Memory
model.how: Switch between Separate -O2, ThinLTO, and Full LTO while varying inline instruction threshold, translation-unit count, and PGO profile guidance to watch cross-file calls collapse and peak link memory shift.
ctl.mode: Link mode
mode.none: Separate -O2
mode.thin: ThinLTO (-flto=thin)
mode.full: Full LTO (-flto=full)
ctl.thresh: Inline threshold (IR ops)
ctl.tus: Translation units (.c files)
ctl.pgo: Enable PGO hot-edge boost
cv.aria: Bar chart comparing cross-TU function IR sizes against inline threshold and per-worker peak memory
cv.edges: Representative cross-TU calls vs threshold (dashed)
cv.mem: Peak IR memory per worker
read.inlined: Cross-TU sites inlined
read.calls: Remaining cross-TU calls
read.mem: Peak memory / worker
read.work: Parallel link workers
fold_yes: add_mul(10,12) folded across files to #42
fold_no: add_mul remains a cross-TU branch
say.none: Under separate compilation, the linker only sees opaque machine objects, leaving <em>all {rem} cross-TU calls un-inlined</em>. {fold}.
say.thin: <code>ThinLTO</code> exchanges lightweight summaries and imports across {wk} parallel workers at just <em>{mem} MB</em> per worker, eliminating {inl} cross-TU calls ({rem} large/cold calls kept). {fold}.
say.full: <code>Full LTO</code> merges all {tus} units into one single-threaded module, eliminating {inl} calls at the cost of <em>{mem} MB</em> peak link memory. {fold}.
:::

Adding **PGO (Profile-Guided Optimization)** lets the linker weight cross-TU inline thresholds by real call counts—doubling the budget for hot paths while keeping cold error handlers (`log_fatal`) out of hot instruction cache lines.

The model omits whole-program C++ devirtualization, ThinLTO incremental bitcode caching, and cross-module global dead-symbol stripping. {.take}

## Where the Frontier Is (November 2026) {#ch10}

::: strings
toc: Where the frontier is
:::

Classical three-phase LLVM is stretching upward into domain dialects via MLIR and downward past linking via binary layout optimizers (BOLT) and context-sensitive sample profiles (CSSPGO). Below, established foundations, shipped tools, and ongoing efforts are separated by date and source. {.law}

### Established {#h.est .sub3}

- <span class="tag h">Established</span> **SSA & classical backend theory**: Dominance frontiers and SSA construction (Cytron et al., 1991), Chaitin–Briggs graph coloring (1981 / 1992), and Poletto–Sarkar linear scan (1999) remain the formal backbone of production compilers. {#e1}
- <span class="tag h">Established</span> **Opaque pointers (`ptr`) only**: Opaque pointers became default in LLVM 15 and typed pointers were permanently removed in LLVM 17 / 19. Every live IR dump from host Apple Clang 21.0.0 uses untyped `ptr` exclusively. {#e2}
- <span class="tag h">Established</span> **New Pass Manager**: Default since LLVM 13, replacing the legacy pass manager with finer-grained analysis caching across iterative pass sweeps. {#e3}

### Already built {#h.demo .sub3}

- <span class="tag m">Built</span> **LLVM 21–23 upstream releases (as of November 2026)**: Upstream shipped LLVM 21.1.0 in August 2025 (replacing `nocapture` with `captures(none)`), LLVM 22.1.0 in February 2026 (adding `ptrtoaddr` and `--save-stats` on `opt`/`llc`), and LLVM 23.1.0 on 26 August 2026 (point releases `23.1.4` / `23.1.6` through October–November 2026). Host Apple Clang `21.0.0` tracks the LLVM 21 baseline. {#d1}
- <span class="tag m">Built</span> **MLIR bridging PyTorch, Triton, and hardware tiles**: Lowering matrix kernels directly to scalar LLVM IR discards crucial loop-tiling and memory-layout structure. MLIR allows high-level dialects (`linalg`, `tensor`, `scf`, `gpu`, Torch-MLIR, OpenAI Triton) to tile, fuse, and schedule tensor operations before progressively lowering to standard LLVM IR. {#d2}
- <span class="tag m">Built</span> **GlobalISel vs SelectionDAG split in production**: Verified directly on host Apple Clang 21.0.0: AArch64 runs `GlobalISel` (`irtranslator`) by default at `-O0` for fast compilation, while `-O2` stays on `SelectionDAG` (`aarch64-isel`). Ongoing 2025–2026 LLVM Discourse threads document remaining `-Os`/pattern parity gaps preventing a blanket `-O2` switch. {#d3}
- <span class="tag m">Built</span> **AutoFDO / CSSPGO + BOLT post-link layout**: Even after LTO + PGO, giant datacenter binaries suffer severe I-cache and iTLB misses. Combining hardware PMU sampling (`CSSPGO` pseudo-probes recovering inline context) with LLVM's post-link **BOLT** optimizer (reordering hot functions and splitting cold basic blocks), Meta reports 2%–15% production datacenter speedups—and over 15%–20% on top of PGO+LTO when optimizing Clang itself. {#d4}

### Specifications, plans, and claims {#h.claim .sub3}

- <span class="tag l">Plans &amp; claims</span> **GlobalISel replacing SelectionDAG at `-O2`/`-O3`**: Moving AArch64 `-O2`/`-O3` to GlobalISel by default remains an active multi-year upstream engineering goal rather than the universal default; parity claims remain benchmark- and flag-dependent. {#c1}
- <span class="tag l">Plans &amp; claims</span> **ClangIR (`CIR`) incubator**: Upstream work continues on lowering Clang ASTs into an MLIR-based C/C++ dialect before LLVM IR to preserve higher-level control flow and coroutine semantics; as of November 2026, it has not replaced the standard Clang AST-to-LLVM-IR frontend path. {#c2}

Compiler releases, default flags, and benchmark reports age quickly; every version and date in this chapter reflects **November 2026**. {.take}

## Wrap-up: Three Questions When Compiled Code Is Slow or Wrong {#ch11}

::: strings
toc: Wrap-up: ask three questions
:::

You do not need to memorize two hundred passes. Whenever compiled code misbehaves under <code>-O2</code> or runs unexpectedly slowly, walk down these three diagnostic questions. {.law}

{.qs}
- **Is it blocked by middle-end aliasing, SIMD width, or backend spilling?** Pass `-Rpass=licm -Rpass=loop-vectorize -Rpass-missed=loop-vectorize` to ask Clang directly why a loop was or was not hoisted and vectorized (chapter 5), and inspect assembly for stacked `str`/`stp` spills (chapter 8). Adding `restrict` or splitting bloated functions often beats hand-tuned assembly. {#q1}
- **Did Undefined Behavior give the optimizer license to delete a check?** Whenever `-O0` works and `-O2` fails mysteriously, compile with `-fsanitize=undefined` to catch signed `nsw` overflow or null dereferences (chapter 6), and diff `-S -emit-llvm -O2` against `-fwrapv` to verify whether a condition folded away. {#q2}
- **Is the optimization horizon trapped inside one `.c` file or blind to hot paths?** If tight helpers live across separate translation units, `-O2` alone cannot see across object boundaries (chapter 9). Enable `-flto=thin` for parallel summary-guided cross-TU inlining, and add sampling PGO / CSSPGO or post-link BOLT for large binaries bound by instruction-cache misses. {#q3}

In one sentence: `clang -O2` is not magic—it is a pipeline that promotes stack variables into SSA `phi` form, iterates tiny local rules to a fixed point, exploits aliasing and UB contracts, and packs the surviving computation graph onto finite CPU registers. {#sum .sum}

Further reading below the compiler boundary: [[how-a-cpu-runs-a-program]] (instruction formats and ISA contracts), [[how-a-cpu-guesses-ahead]] (branch prediction, superscalar dispatch, and hardware register renaming), [[how-a-cpu-does-math]] (IEEE 754 floats, SIMD lanes, and auto-vectorization prerequisites), and [[switches-that-compute]]. {#links}

::: footer
**Sources & verification.** Every IR snippet, pass-structure dump, AArch64/x86_64 assembly sequence, and ThinLTO object comparison was generated live on host `/usr/bin/clang` (`Apple clang version 21.0.0 (clang-2100.4.1.1)`, target `arm64-apple-darwin27.2.0`, LLVM 21 baseline) using `-S -emit-llvm`, `-S`, `-mllvm -debug-pass=Structure`, `-mllvm -print-after=...`, `-Rpass=licm`, `-fwrapv`, and `-flto=thin`; `tools/crosscheck.cjs` checks all 29 live compiler invariants automatically. Foundations and frontier sources: Cytron et al., *Efficiently Computing Static Single Assignment Form and the Control Dependence Graph*, ACM TOPLAS 1991; Chaitin et al., *Register Allocation via Coloring*, 1981; Briggs et al., *Improvements to Graph Coloring Register Allocation*, ACM TOPLAS 1994; Poletto &amp; Sarkar, *Linear Scan Register Allocation*, ACM TOPLAS 1999; Lattner &amp; Adve, *LLVM: A Compilation Framework for Lifelong Program Analysis &amp; Transformation*, CGO 2004; Johnson et al., *ThinLTO: Scalable and Incremental LTO*, CGO 2017; Panchenko et al., *BOLT: A Practical Binary Optimizer for Data Centers and Beyond*, CGO 2019; official LLVM 21.1.0, 22.1.0, and 23.1.x release notes, Opaque Pointers documentation, GlobalISel documentation, and Meta datacenter BOLT/CSSPGO engineering reports.

**The models.** The page ships no compiler binaries. All nine labs—3-phase component scaling, `-O0` vs `-O2` memory traffic, dominance-frontier SSA `phi` placement, fixed-point pass stepping, LICM/aliasing/SIMD lanes, `nsw` wrap divergence, SelectionDAG tiling, Chaitin-Briggs / Linear Scan allocation, and ThinLTO summary import—run directly in `models.js` and are pinned by `tests/models.cjs` and `tools/crosscheck.cjs`. Written by Antigravity AI; the models omit full points-to alias sets, exception unwinding, and microarchitectural port scheduling.
:::
