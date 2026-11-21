# BRIEF — how-llvm-compiles-your-code

Author: Antigravity (gemini-flash-worker-agy, thinking: on, effort unavailable; planner: gemini-pro-orchestrator-neon, thinking: effort=1.00), 2026-11-21. Task: W10 of the Software Core Principles series (`computing/software/how-llvm-compiles-your-code/`).
Status: unregistered draft (`page.json` has no `"status": "live"`; the build's draft warning is expected). Both Chinese (`content.zh.md`) and English (`content.en.md`) are complete native prose (no `"en": "stub"`).

## Pinned Host Compiler Release & Constraint

- **Driver:** `Apple clang version 21.0.0 (clang-2100.4.1.1)` (`/usr/bin/clang --version`)
- **LLVM baseline:** LLVM 21 (opaque pointers `ptr` only; typed pointers permanently removed upstream by LLVM 17/19)
- **Target:** `arm64-apple-darwin27.2.0` (IR triple `arm64-apple-macosx27.2.0`)
- **Tool constraint (honest note):** macOS Xcode Command Line Tools ships `/usr/bin/clang` without standalone `opt` or `llc` CLI binaries (`which opt llc` -> not found). All live IR, pass-structure, optimization-remark, assembly, and ThinLTO verifications therefore drive `/usr/bin/clang` directly (`-S -emit-llvm`, `-S`, `-mllvm -debug-pass=Structure`, `-mllvm -print-after=...`, `-Rpass=licm`, `-fwrapv`, `-flto=thin`, and `-target x86_64-apple-macos15`).

## Essay Question & 11-Chapter Structure

**One question:** What actually happens inside `clang -O2 foo.c` between frontend syntax and AArch64 / x86_64 machine code?

1. **Ch1 · 3-Phase Decoupled Architecture (`#ch1`)** — `N` frontends × `1` typed target-independent opaque-pointer IR × `M` backends (`N+1+M` vs `N×M`). Diagram: `dg-arch`. Model: `archScale`.
2. **Ch2 · From AST to `-O0` IR (`#ch2`)** — Why frontends dump every mutable local variable into `alloca` stack slots (`load`/`store`) instead of computing dataflow directly. Diagram: `dg-alloca`. Model: `simAlloca` (`sum_array` and `pick_phi` matched to Apple Clang 21.0.0 `-O0` IR).
3. **Ch3 · Static Single Assignment (SSA) & `mem2reg` (`#ch3`)** — Cytron et al. (1991) dominance frontier calculation, `phi` insertion, and stack-based SSA variable renaming (`SROAPass` in the default `-O1`/`-O2` pipeline). Diagram: `dg-ssa`. Model: `runMem2Reg`.
4. **Ch4 · The Pass Pipeline (`#ch4`)** — `SROA`, `InstCombine`, `SimplifyCFG`, `Inline`, `GVN`, `ADCE` iterating in cycles until reaching a fixed point. Diagram: `dg-pipeline`. Model: `stepPipeline`.
5. **Ch5 · Loop Optimizations & SIMD (`#ch5`)** — `LICM` invariant hoisting into preheader, pointer aliasing (`restrict` / `noalias` vs `TBAA` vs runtime `icmp ult ptr` overlap guards), and `LoopVectorize` (`<4 x i32>` NEON `add.4s`). Diagram: `dg-licm`. Model: `loopOptSim`.
6. **Ch6 · Undefined Behavior (`nsw` / `poison`) (`#ch6`)** — Signed overflow (`add nsw` -> `poison` -> `-O2` folds `x + 1 > x` to `ret i32 1`, whereas `-O2 -fwrapv` emits `icmp ne i32 %0, 2147483647`) and dereference-before-null-check elimination. Diagram: `dg-ub`. Model: `ubSim`.
7. **Ch7 · Instruction Selection (`#ch7`)** — `SelectionDAG` pattern tiling vs `GlobalISel` (`-O0` runs `irtranslator` / GlobalISel on ARM64; `-O2` runs `aarch64-isel` / SelectionDAG + `machine-combiner`), lowering to ARM64 (`madd`, `add ... lsl #2`) vs x86_64 (`imull + leal`, `leal 3(,%rdi,2)`). Diagram: `dg-isel`. Model: `iselSim`.
8. **Ch8 · Liveness, Interference Graph & Register Allocation (`#ch8`)** — Live intervals, interference graph, Chaitin-Briggs graph coloring (`K`-coloring + optimistic spill) vs Poletto-Sarkar Linear Scan (`RegAllocGreedy` at `-O2`, `RegAllocFast` at `-O0`). Diagram: `dg-regalloc`. Model: `regAllocSim`.
9. **Ch9 · PGO & ThinLTO (`#ch9`)** — Why separate `-O2` leaves cross-TU calls (`b _add_mul`), while `-flto=thin` emits `LLVM bitcode, wrapper` + Module Summary Index for parallel cross-TU inlining (`mov w0, #0x2a ; =42`). Diagram: `dg-lto`. Model: `ltoSim`.
10. **Ch10 · Frontier (November 2026) (`#ch10`)** — Established (SSA, Chaitin-Briggs, Linear Scan, opaque `ptr`, New Pass Manager), Built (LLVM 21–23 releases, MLIR dialects, ARM64 GlobalISel-at-O0 / SelectionDAG-at-O2 split, AutoFDO/CSSPGO + BOLT), Plans & claims (GlobalISel at `-O2`/`-O3`, ClangIR `CIR`).
11. **Ch11 · Wrap-up (`#ch11`)** — 3 diagnostic questions (`.qs`), `.sum`, cross-links ONLY to live pages `how-a-cpu-runs-a-program`, `how-a-cpu-guesses-ahead`, `how-a-cpu-does-math`, `switches-that-compute`.

## Live Crosscheck (`tools/crosscheck.cjs`, run 2026-11-21): 29/29 passed

Scratch workspace: `/tmp/agent-tasks/software/how-llvm-compiles-your-code/crosscheck/`

| Check | Clang Command / Flag | Verified Result |
|---|---|---|
| Host toolchain | `/usr/bin/clang --version` | `Apple clang version 21.0.0 (clang-2100.4.1.1)`, `arm64-apple-darwin27.2.0` |
| Opaque pointers | `-S -emit-llvm -O0` | Uses `ptr` exclusively; zero typed `i32*` |
| `sum_array` `-O0` | `-S -emit-llvm -O0` | 4 `alloca`s, 6 static `store`s, 8 static `load`s |
| `sum_array` `-O2` | `-S -emit-llvm -O2` | 0 `alloca`s, `phi i32`, `<4 x i32>` vector loop, `add.4s` on ARM64 |
| `pick_phi_real` SSA | `-S -emit-llvm -O1` | 0 `alloca`s, `phi i32 [ %7, %6 ], [ %4, %3 ]` |
| `dead_branch` pipeline | `-S -emit-llvm -O2` | `mul 2` -> `shl nsw i32 %0, 1`, `999` dead block deleted |
| `hoist_demo` vs `restrict` | `-S -emit-llvm -O2` | Without `restrict`: `icmp ult ptr` runtime overlap check; with `restrict`: `ptr noalias`, no guard |
| `abs_check` UB (`nsw`) | `-S -emit-llvm -O2` vs `-fwrapv` | `-O2` folds to `ret i32 1`; `-O2 -fwrapv` lowers to `icmp ne i32 %0, 2147483647` |
| Instruction selection | `-S -O2` vs `-target x86_64-apple-macos15` | ARM64: `madd w0, w1, w0, w2`, `add w0, w0, w1, lsl #2`; x86_64: `imull + leal`, `leal 3(,%rdi,2)` |
| Backend selector & allocator | `-mllvm -debug-pass=Structure` | `-O0`: `irtranslator` (GlobalISel) + `regallocfast`; `-O2`: `aarch64-isel` (SelectionDAG) + `greedy` |
| Register spills | `-S -O2` (`spill.c`) | Emits `sub sp, sp, #...`, `stp`, `4-byte Folded Spill` |
| Separate vs ThinLTO | `-O2` vs `-O2 -flto=thin` | Separate: `b _add_mul`; ThinLTO: `LLVM bitcode, wrapper` -> `mov w0, #0x2a` (=42) |

## Dated Frontier Sources (viewed 2026-11-21)

- **LLVM 21.1.0** (released 2025-08-26; `captures(none)` replacing `nocapture`), **LLVM 22.1.0** (released 2026-02-24; `ptrtoaddr`, `--save-stats`), **LLVM 23.1.0** (released 2026-08-26; `23.1.4` on 2026-10-20, `23.1.6` in Nov 2026) — official LLVM releases (`llvm.org` / GitHub `llvm/llvm-project` announcements).
- **Opaque Pointers** — LLVM documentation (`llvm.org/docs/OpaquePointers.html`): default in LLVM 15, typed pointers removed in LLVM 17/19.
- **GlobalISel AArch64 status** — LLVM Discourse & GlobalISel docs (`llvm.org`): `-O0` default on AArch64 (verified directly on host Apple Clang 21.0.0), while `-O2`/`-O3` remains SelectionDAG due to `-Os`/optimization parity gaps.
- **BOLT + AutoFDO / CSSPGO** — Panchenko et al. (CGO 2019), LLVM BOLT docs (`github.com/llvm/llvm-project`), and Meta production engineering reports: 2%–15% datacenter service speedups and 15%–20%+ on Clang itself on top of LTO+PGO.
- **Facts that will go stale:** Upstream LLVM latest release version (`23.1.x` as of Nov 2026), GlobalISel `-O2` default status on AArch64, and ClangIR (`CIR`) incubator integration status.

## Checked / Not Checked

- **Checked (Node):** `tools/diagrams.cjs` (9 SVGs), `build-pages.cjs` (371 keys/lang, 0 errors), `--print-budgets` (all labels <= 89% room), HTML/textContent escaping hygiene (0 issues), repo-wide `REGISTRY.json` alias collision check (0 collisions across 8,032 existing aliases), `tools/crosscheck.cjs` (29/29 live `/usr/bin/clang` checks pass), and `tests/models.cjs`.
- **Not run in this agent session (by design):** Playwright browser checks (`tests/browser.cjs` and `tests/canvas-text-overlap.cjs --sweep`) are reserved for the coordinator's serial Playwright run.
